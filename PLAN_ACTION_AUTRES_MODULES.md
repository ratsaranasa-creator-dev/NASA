# 📱 PLAN D'ACTION - AUTRES MODULES

## 🎯 Modules à corriger (priorité)

### Priorité 1: News (Actualités) - BLOCKER
**Raison:** User rapporte "Une erreur est survenue lors de l'enregistrement"
**Statut:** ❌ Utilise encore `/uploads` local
**Action:** Appliquer même pattern Cloudinary que Demarches

### Priorité 2: Projects - IMPORTANT
**Raison:** "Projet apparaît quelques secondes puis disparaît"
**Statut:** ⚠️ Reçoit image du frontend (pas multer)
**Action:** Vérifier logique visibilityStatus et filtres

### Priorité 3: Culture - STANDARD
**Statut:** ⚠️ À vérifier
**Action:** Même pattern Cloudinary

### Priorité 4: Services, Contact, Sante
**Statut:** À évaluer selon usage

---

## 1️⃣ NEWS (ACTUALITÉS) - CORRIGER EN PREMIER

### Problème actuel

**newsController.js (lines 52-62):**
```javascript
// Si image est modifiée, supprimer l'ancienne
if (req.body.image && oldNews.image && req.body.image !== oldNews.image) {
  const oldImagePath = path.join(__dirname, '..', oldNews.image);
  if (fs.existsSync(oldImagePath)) {
    fs.unlinkSync(oldImagePath);  // ❌ Échoue si fichier pas sur disque local
  }
}
```

**newsController.js (lines 68-73):**
```javascript
// Supprimer l'image associée
if (news.image) {
  const imagePath = path.join(__dirname, '..', news.image);
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);  // ❌ Échoue si fichier pas sur disque local
  }
}
```

### Cause de l'erreur "Erreur lors de l'enregistrement"

1. Frontend upload image → Cloudinary OU local
2. Backend reçoit image URL
3. Si update/delete → try to `fs.unlinkSync()` → FAIL si URL Cloudinary
4. Exception non catchée → erreur 500
5. Frontend affiche erreur générique

### Solution: Même pattern que Demarches

**Ajouter à newsController.js:**
```javascript
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper (même que dans demarcheController.js)
const uploadToCloudinary = (buffer, folder = 'news') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
```

**Modifier createNews pour handle multer upload:**
```javascript
exports.createNews = async (req, res) => {
  try {
    const newsData = { ...req.body };
    
    // If a file was uploaded via multer, send to Cloudinary
    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer, 'news');
      newsData.image = result.secure_url;
      newsData.imageUrl = result.secure_url;
      newsData.publicId = result.public_id;
    }
    
    if (!newsData.status) newsData.status = 'brouillon';
    
    const news = new News(newsData);
    await news.save();
    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de l\'actualité', error: error.message });
  }
};
```

**Modifier updateNews pour Cloudinary delete:**
```javascript
exports.updateNews = async (req, res) => {
  try {
    const oldNews = await News.findById(req.params.id);
    if (!oldNews) {
      return res.status(404).json({ message: 'Actualité non trouvée' });
    }

    // If new file uploaded, delete old Cloudinary asset
    if (req.file && req.file.buffer) {
      if (oldNews.publicId) {
        try {
          await cloudinary.uploader.destroy(oldNews.publicId);
        } catch (err) {
          console.error('Cloudinary deletion error:', err.message);
        }
      }
      const result = await uploadToCloudinary(req.file.buffer, 'news');
      req.body.image = result.secure_url;
      req.body.imageUrl = result.secure_url;
      req.body.publicId = result.public_id;
    }

    const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(news);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};
```

**Modifier deleteNews:**
```javascript
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'Actualité non trouvée' });
    }

    // Delete Cloudinary asset if exists
    if (news.publicId) {
      try {
        await cloudinary.uploader.destroy(news.publicId);
      } catch (err) {
        console.error('Cloudinary deletion error:', err.message);
      }
    }

    await News.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Actualité supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
```

**Ajouter à newsRoutes.js:**
```javascript
const multer = require('multer');
const newsController = require('../controllers/newsController');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format non supporté. Utilisez JPG, PNG ou WEBP.'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Routes
router.get('/', newsController.getNews);
router.get('/:id', newsController.getNewsById);
router.post('/', protect, admin, upload.single('image'), newsController.createNews);
router.put('/:id', protect, admin, upload.single('image'), newsController.updateNews);
router.delete('/:id', protect, admin, newsController.deleteNews);
```

**Ajouter à News.js schema:**
```javascript
const newsSchema = new mongoose.Schema({
  title: { ... },
  image: { type: String },
  imageUrl: { type: String },      // ← NOUVEAU
  publicId: { type: String },      // ← NOUVEAU
  // rest...
}, { timestamps: true });
```

---

## 2️⃣ PROJECTS - POURQUOI DISPARAÎT?

### Problème rapporté: "Projet apparaît quelques secondes puis disparaît"

### Analyse

**projectController.js createProject:**
```javascript
const newProject = await Project.create({
  title,
  description,
  location,
  startDate,
  endDate,
  image,
  category,
  status,
  budget,
  fullDescription,
  objectives,
  timeline,
  beneficiaries,
  duration,
  manager,
  progress,
  visibilityStatus
});
```

**Possible causes:**
1. `visibilityStatus` n'est pas sauvegardé → default à "draft"
2. Frontend filtre sur `published`, `isPublished` au lieu de `visibilityStatus`
3. Frontend refetch après créer → query ne comprend pas les drafts
4. `status` vs `visibilityStatus` confusion

### Solution

**À vérifier dans Project.js schema:**
```javascript
const projectSchema = new mongoose.Schema({
  // ...
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold'],
    default: 'active'
  },
  visibilityStatus: {
    type: String,
    enum: ['publié', 'brouillon', 'archivé'],
    default: 'publié'  // ← Important: new projects are published
  }
  // ...
}, { timestamps: true });
```

**À vérifier dans projectController.js getAllProjects:**
```javascript
const query = isAdmin ? {} : { visibilityStatus: 'publié' };
```

**Frontend côté:**
Vérifier que `fetchProjects()` ne passe pas `admin=false` après créer

---

## 3️⃣ CULTURE - MÊMES CORRECTIONS

**Statut:** À évaluer

**À faire:**
- Vérifier cultureController.js
- Vérifier si upload d'images
- Si oui → appliquer pattern Cloudinary
- Ajouter imageUrl + publicId au schema

---

## 📋 CHECKLIST PRIORITAIRE

### Avant de corriger les autres modules
- [ ] `/api/demarches` fonctionne complètement
- [ ] Images demarches sauvegardées sur Cloudinary
- [ ] Suppression demarche efface aussi Cloudinary asset
- [ ] Tests Postman réussissent

### Corriger News
- [ ] Ajouter multer memoryStorage à newsRoutes.js
- [ ] Ajouter uploadToCloudinary() helper
- [ ] Modifier createNews pour Cloudinary upload
- [ ] Modifier updateNews pour Cloudinary delete + upload
- [ ] Modifier deleteNews pour Cloudinary delete
- [ ] Ajouter imageUrl + publicId à News.js schema
- [ ] Tests Postman news réussissent

### Corriger Projects
- [ ] Vérifier visibilityStatus default à 'publié'
- [ ] Vérifier query getAllProjects filtre correctement
- [ ] Tests Postman projects réussissent
- [ ] Frontend page projects recharge après créer

### Corriger Culture
- [ ] Même pattern Cloudinary si images
- [ ] Schema + routes + controller
- [ ] Tests réussissent

---

## 🚀 ORDRE D'EXÉCUTION

1. **Valider Demarches sur Render** (d'abord!)
   - Déployer les changements demarches
   - Tester `/api/demarches`
   - Confirmer fonctionnel

2. **Corriger News** (car user rapporte erreur)
   - Appliquer Cloudinary pattern
   - Tester POST/PUT/DELETE
   - Deployer Render

3. **Corriger Projects** (car user rapporte disparition)
   - Vérifier logique visibilityStatus
   - Tester create + GET
   - Déployer Render

4. **Corriger Culture** (standard)
   - Appliquer Cloudinary si nécessaire
   - Tester
   - Déployer Render

---

## 📞 NOTES IMPORTANTES

### Note 1: Ne pas mélanger Upload strategies
```javascript
// ❌ MAUVAIS - Parser l'image du body comme URL Cloudinary
if (req.body.image) { /* store directly */ }

// ✅ BON - Upload file via multer
if (req.file) { /* upload to Cloudinary */ }

// Les deux patterns peuvent coexister:
// - Frontend peut uploader image PUIS appeler POST
// - OU Frontend appelle POST avec formdata + file
```

### Note 2: Toujours inclure publicId au schema
```javascript
// Pour pouvoir supprimer l'asset Cloudinary plus tard
publicId: { type: String }
```

### Note 3: Tests doivent couvrir:
- Create avec image ✓
- Update avec nouvelle image ✓
- Delete (vérifie que asset Cloudinary supprimé) ✓

