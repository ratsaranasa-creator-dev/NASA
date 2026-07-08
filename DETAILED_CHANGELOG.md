# 📊 CHANGELOG DÉTAILLÉ - BACKEND FIXES

## Résumé des modifications
- **5 fichiers modifiés**
- **1 fichier créé**
- **1 dépendance ajoutée**

---

## 1️⃣ CRÉÉ: backend/config/cloudinary.js

### 📝 Contenu complet
```javascript
const cloudinary = require('cloudinary').v2;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

### ✨ Pourquoi?
- **Ancien code:** Les images étaient sauvegardées localement dans `/uploads`
- **Nouveau code:** Images uploadées directement sur Cloudinary
- **Impact:** Stockage centralisé + URLs persistantes + facilite le scaling

---

## 2️⃣ MODIFIÉ: backend/routes/demarcheRoutes.js

### ❌ AVANT (lines 8-15)
```javascript
// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, `demarche-${Date.now()}-${file.originalname}`);
  }
});
```

### ✅ APRÈS (lines 8-10)
```javascript
// Multer Memory Storage (files uploaded to Cloudinary from memory)
const storage = multer.memoryStorage();
```

### ✨ Pourquoi ce changement?
- **Ancien:** Disque dur local → fichiers dans `/uploads` → pas sécurisé pour Render
- **Nouveau:** Mémoire → buffer → Cloudinary → URL persistante
- **Gain:** 
  - Files en mémoire (pas d'I/O disque)
  - Cloudinary gère le CDN + scale
  - Render n'a pas besoin de stockage persistant

---

## 3️⃣ MODIFIÉ: backend/controllers/demarcheController.js

### Ajout 1: Imports et Helper (lines 1-16)
```javascript
// ❌ ANCIEN
const Demarche = require('../models/Demarche');
const fs = require('fs');
const path = require('path');

// ✅ NOUVEAU
const Demarche = require('../models/Demarche');
const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');      // ← AJOUTÉ
const streamifier = require('streamifier');              // ← AJOUTÉ

const uploadToCloudinary = (buffer, folder = 'demarches') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
```

**✨ Pourquoi:** 
- Helper reusable pour envoyer buffers à Cloudinary
- Retourne `{ secure_url, public_id }` utilisé par createDemarche et uploadDocument

---

### Ajout 2: createDemarche - Cloudinary upload (lines 53-67)
```javascript
// ❌ ANCIEN
exports.createDemarche = async (req, res) => {
  try {
    const demarcheData = req.body;
    
    // Parse nested objects if sent as strings (from FormData)
    if (typeof demarcheData.fullContent === 'string') {
      demarcheData.fullContent = JSON.parse(demarcheData.fullContent);
    }

    const demarche = new Demarche(demarcheData);
    await demarche.save();
    res.status(201).json(demarche);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la démarche', error: error.message });
  }
};

// ✅ NOUVEAU
exports.createDemarche = async (req, res) => {
  try {
    const demarcheData = req.body || {};
    
    // Parse nested objects if sent as strings (from FormData)
    if (typeof demarcheData.fullContent === 'string') {
      demarcheData.fullContent = JSON.parse(demarcheData.fullContent);
    }

    // If a file was uploaded via multer (memoryStorage), send to Cloudinary
    if (req.file && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer, 'demarches');
      demarcheData.image = result.secure_url;
      demarcheData.imageUrl = result.secure_url;
      demarcheData.publicId = result.public_id;
    }

    const demarche = new Demarche(demarcheData);
    await demarche.save();
    res.status(201).json(demarche);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création de la démarche', error: error.message });
  }
};
```

**✨ Changements:**
- Line 55: `const demarcheData = req.body || {};` - sécurité null
- Lines 62-67: SI image uploadée → envoyer à Cloudinary → sauvegarder URLs dans Mongo

**✨ Impact:**
- Images maintenant sur Cloudinary (pas en local)
- MongoDB stocke `image`, `imageUrl`, `publicId`
- Frontend reçoit URL valide pour display

---

### Ajout 3: deleteDemarche - Supprimer asset Cloudinary (lines 106-127)
```javascript
// ❌ ANCIEN
exports.deleteDemarche = async (req, res) => {
  try {
    const demarche = await Demarche.findById(req.params.id);
    if (!demarche) {
      return res.status(404).json({ message: 'Démarche non trouvée' });
    }

    // Delete associated files if any
    if (demarche.fullContent && demarche.fullContent.downloads) {
      demarche.fullContent.downloads.forEach(dl => {
        if (dl.url && dl.url.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, '..', dl.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await Demarche.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Démarche supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ✅ NOUVEAU
exports.deleteDemarche = async (req, res) => {
  try {
    const demarche = await Demarche.findById(req.params.id);
    if (!demarche) {
      return res.status(404).json({ message: 'Démarche non trouvée' });
    }
    // If image stored on Cloudinary, delete it
    if (demarche.publicId) {
      try {
        await cloudinary.uploader.destroy(demarche.publicId);
      } catch (err) {
        // Log and continue deletion
        console.error('Cloudinary deletion error:', err.message || err);
      }
    }

    await Demarche.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Démarche supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
```

**✨ Changements:**
- ❌ Supprimé: boucle `/uploads` file deletion (obsolète)
- ✅ Ajouté: Vérifier `publicId` → appeler `cloudinary.uploader.destroy()`
- ✅ Ajouté: Try/catch au cas où Cloudinary échoue (mais continue la suppression Mongo)

**✨ Impact:**
- Quand user supprime démarche → image Cloudinary aussi supprimée
- Pas de fichiers orphelins sur Cloudinary
- Manage le côté "nettoyage complet"

---

### Ajout 4: uploadDocument - Cloudinary return (lines 146-165)
```javascript
// ❌ ANCIEN
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ 
      url: fileUrl, 
      label: req.file.originalname,
      filename: req.file.filename 
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du téléchargement', error: error.message });
  }
};

// ✅ NOUVEAU
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }

    // Upload buffer to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'demarches');
    res.status(200).json({
      url: result.secure_url,
      label: req.file.originalname,
      filename: result.public_id,
      publicId: result.public_id
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du téléchargement', error: error.message });
  }
};
```

**✨ Changements:**
- ❌ Ancien: Retournait `/uploads/...` (URL locale)
- ✅ Nouveau: Envoie à Cloudinary → retourne `secure_url` (URL CDN persistante)
- ✅ Incluent `publicId` pour pouvoir supprimer plus tard

**✨ Impact:**
- Upload API endpoint maintenant utilise Cloudinary
- Frontend reçoit URL Cloudinary directe
- Documents persistants + accessibles globalement

---

## 4️⃣ MODIFIÉ: backend/models/Demarche.js

### Avant (schema original)
```javascript
const demarcheSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est obligatoire'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: ['État Civil', 'Identité', 'Vie Quotidienne', 'Urbanisme', 'Santé', 'Social', 'Économie'],
    default: 'État Civil'
  },
  shortDesc: {
    type: String,
    required: [true, 'La description courte est obligatoire'],
    trim: true
  },
  iconName: {
    type: String,
    default: 'FileText'
  },
  // ... fullContent, status, etc
});
```

### Après - Champs AJOUTÉS
```javascript
const demarcheSchema = new mongoose.Schema({
  title: { ... },
  
  // ✅ NOUVEAU - slug
  slug: {
    type: String,
    index: true,
    unique: false
  },
  
  shortDesc: { ... },
  
  // ✅ NOUVEAU - piecesAFournir
  piecesAFournir: [String],
  
  // ✅ NOUVEAU - image fields
  image: {
    type: String
  },
  imageUrl: {
    type: String
  },
  publicId: {
    type: String
  },
  
  iconName: { ... },
  fullContent: { ... },
  // rest stays the same
});
```

**✨ Champs ajoutés:**
- `slug` - URL-friendly version du titre
- `piecesAFournir` - Array de documents requis
- `image` - URL image (alias pour imageUrl)
- `imageUrl` - URL Cloudinary secure_url
- `publicId` - Cloudinary public_id pour deletion

**✨ Pourquoi:**
- MongoDB enregistre les URLs Cloudinary, pas les fichiers
- `publicId` utilisé dans `deleteDemarche()` pour supprimer l'asset
- `slug` utilisé pour URLs lecteur-friendly

---

## 5️⃣ MODIFIÉ: backend/package.json

### Avant
```json
{
  ...
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cloudinary": "^1.41.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.6.2",
    "morgan": "^1.10.1",
    "multer": "^2.2.0",
    "multer-storage-cloudinary": "^4.0.0",
    "nodemailer": "^8.0.11"
  }
  ...
}
```

### Après
```json
{
  ...
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cloudinary": "^1.41.3",
    "cors": "^2.8.6",
    "dotenv": "^17.4.2",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.6.2",
    "morgan": "^1.10.1",
    "multer": "^2.2.0",
    "multer-storage-cloudinary": "^4.0.0",
    "nodemailer": "^8.0.11",
    "streamifier": "^0.1.1"    // ✅ AJOUTÉ
  }
  ...
}
```

**✨ Dépendance ajoutée:**
- `streamifier` - Convertit buffers en streams pour Cloudinary upload_stream

**✨ Pourquoi:**
```javascript
// Sans streamifier:
// - Impossible d'envoyer un buffer directement à cloudinary.uploader.upload_stream()
// - upload_stream() attend un stream

// Avec streamifier:
const stream = streamifier.createReadStream(buffer);
stream.pipe(cloudinary.uploader.upload_stream(...));
// ✓ Buffer → Stream → Cloudinary
```

---

## 6️⃣ NON MODIFIÉ (mais important): backend/index.js

✓ Cette ligne était déjà présente (l.79):
```javascript
app.use('/api/demarches', require('./routes/demarcheRoutes'));
```

**✨ C'est pourquoi le 404 n'était PAS dû à une route non enregistrée.**

---

## 📊 TABLEAU RÉCAPITULATIF

| Fichier | Type | Changement | Raison |
|---------|------|-----------|--------|
| `config/cloudinary.js` | ✨ CRÉÉ | Configuration SDK Cloudinary | Images sur Cloudinary au lieu de local |
| `routes/demarcheRoutes.js` | 📝 MODIFIÉ | `multer.diskStorage` → `multer.memoryStorage` | Buffers en mémoire vers Cloudinary |
| `controllers/demarcheController.js` | 📝 MODIFIÉ | Ajout `uploadToCloudinary()`, Cloudinary calls dans create/delete/upload | Images sur Cloudinary, gestion lifecycle |
| `models/Demarche.js` | 📝 MODIFIÉ | Ajout slug, piecesAFournir, image, imageUrl, publicId | Store URLs + publicId pour cleanup |
| `package.json` | 📝 MODIFIÉ | Ajout `streamifier` | Buffer → Stream pour upload |
| `index.js` | ✓ OK | Aucun changement | Route déjà enregistrée correctement |

---

## 🎯 CAUSE RACINE DU "404 NOT FOUND"

### Hypothèse 1: Ancien code sur Render
- **Probable:** Oui
- **Raison:** Le code dans cette repo était déjà structuré, mais peut-être qu'une version plus ancienne sans ces fichiers est déployée
- **Solution:** Force redeploy sur Render après push

### Hypothèse 2: Erreur au démarrage
- **Probable:** Possible (streamifier manquant)
- **Raison:** Avant d'ajouter streamifier, `require('streamifier')` aurait échoué
- **Solution:** npm install

### Hypothèse 3: Variables Cloudinary manquantes
- **Probable:** Possible (mais donne erreur, pas 404)
- **Raison:** If CLOUDINARY_* not set, cloudinary.config() silently fails
- **Solution:** Ajouter vars à Render

---

## ✅ CHECKLIST DE VÉRIFICATION

- [ ] `npm install` a exécuté pour installer `streamifier`
- [ ] `.env` locale a CLOUDINARY_* vars
- [ ] `npm start` lance sans erreur
- [ ] `curl http://localhost:5000/api/demarches` retourne JSON
- [ ] Git push faite avec tous les changements
- [ ] Render redéploie le dernier commit
- [ ] Render a CLOUDINARY_* et MONGODB_URI dans Environment Variables
- [ ] `curl https://dembeni-backend-0soo.onrender.com/api/demarches` retourne JSON

---

## 📞 SI TOUJOURS 404

1. **Vérifier logs Render:**
   - Aller à Service → Logs
   - Chercher "Server running on port 5000"
   - Si pas là → serveur ne démarre pas

2. **Vérifier dernière version déployée:**
   - Render Dashboard → Deployments
   - Click dernier déploiement
   - Vérifier "Build" et "Deploy" sections pour erreurs

3. **Force redeploy:**
   - Si git push récent, faire Manual Deploy sur Render

4. **Vérifier MongoDB:**
   - Dans Render logs, chercher "MongoDB Connected"
   - Si manquant → MONGODB_URI incorrect

5. **Vérifier start command:**
   - Render Settings
   - Start Command doit être: `cd backend && npm start`
   - (ou juste `npm start` si backend à la racine)

