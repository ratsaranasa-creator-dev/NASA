# 🔧 GUIDE DE CORRECTION - Backend Dembéni

## DIAGNOSTIC: Pourquoi "Cannot GET /api/demarches" sur Render?

### Causes probables (en ordre de probabilité):
1. **Render n'a pas redéployé le dernier code** - Le vieux code sans routes est encore en production
2. **Variables d'environnement manquantes** - Render n'a pas MONGODB_URI ou les variables Cloudinary
3. **Erreur au démarrage** - Une dépendance manquante empêche le serveur de démarrer
4. **Mauvais chemin ou mauvaise commande de démarrage** - Render ne pointe pas au bon dossier `backend/`

---

## ✅ ÉTAPE 1: VÉRIFIER LOCALEMENT (SUR VOTRE MACHINE)

### 1.1 Installer les dépendances
```bash
cd backend
npm install
```

### 1.2 Vérifier que .env contient les bonnes variables
```bash
cat .env
```

**OBLIGATOIRE:**
```
PORT=5000
MONGODB_URI=mongodb://...
JWT_SECRET=dembeni_secret_key_2026
CLOUDINARY_CLOUD_NAME=<votre_cloud_name>
CLOUDINARY_API_KEY=<votre_api_key>
CLOUDINARY_API_SECRET=<votre_api_secret>
```

### 1.3 Tester le démarrage sans erreur
```bash
npm start
```

**Vous devez voir:**
```
[backend] Starting backend server...
[backend] MongoDB connection established successfully.
[backend] Seed module executed successfully.
[backend] Server running on port 5000 in development mode.
```

### 1.4 Tester les routes (dans une autre console)
```bash
# Test GET /api/demarches (public)
curl http://localhost:5000/api/demarches

# Résultat attendu: []  (liste vide en JSON, pas "Cannot GET")

# Test root
curl http://localhost:5000/

# Résultat attendu: Dembéni API is running...
```

---

## 📋 ÉTAPE 2: VÉRIFIER LES FICHIERS BACKEND

### 2.1 ✓ Fichiers qui ont été CORRIGÉS:

#### backend/config/cloudinary.js
**Status:** ✓ CRÉÉ
**Contenu:** Configure Cloudinary avec variables d'environnement

#### backend/routes/demarcheRoutes.js  
**Status:** ✓ MODIFIÉ - multer changé à memoryStorage
**Routes disponibles:**
- `GET /` → getDemarches
- `GET /:id` → getDemarcheById
- `POST /` → createDemarche (protégé)
- `PUT /:id` → updateDemarche (protégé)
- `DELETE /:id` → deleteDemarche (protégé)
- `POST /upload` → uploadDocument (protégé, multer.single('file'))

#### backend/controllers/demarcheController.js
**Status:** ✓ MODIFIÉ - Cloudinary uploads + Mongo storage
**Modifications:**
- Ajoute `uploadToCloudinary()` helper qui envoie les buffers vers Cloudinary
- `createDemarche()` → sauvegarde image/imageUrl/publicId
- `deleteDemarche()` → supprime l'asset Cloudinary avant suppression Mongo
- `uploadDocument()` → retourne URL + publicId Cloudinary

#### backend/models/Demarche.js
**Status:** ✓ MODIFIÉ - Ajoute champs Cloudinary
**Nouveaux champs:**
- `slug`
- `piecesAFournir` (array)
- `image`
- `imageUrl`
- `publicId`

#### backend/package.json
**Status:** ✓ MODIFIÉ - Ajoute streamifier
**Dépendance ajoutée:** `"streamifier": "^0.1.1"`

#### backend/index.js
**Status:** ✓ JÀ VÉRIFIER - Route doit être enregistrée
**Ligne requis (déjà présente):**
```javascript
app.use('/api/demarches', require('./routes/demarcheRoutes'));
```

---

## 🚀 ÉTAPE 3: DÉPLOYER SUR RENDER

### 3.1 Pousser les changements à Git
```bash
cd a:\site-web-de-dembéni

git add .
git commit -m "Fix: Cloudinary integration for demarches and multer memory storage"
git push origin main
```

### 3.2 Aller sur Render Dashboard
https://dashboard.render.com/

### 3.3 Vérifier la configuration du service backend

**Aller à:** Services → dembeni-backend (or your service name)

**Vérifier:**

#### Build & Deploy
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- (OU si c'est un monorépo à la racine:)
  - **Build Command:** `npm install`
  - **Start Command:** `npm start`

#### Environment Variables
Ajouter/vérifier ces variables exactement:

```
PORT=5000
MONGODB_URI=mongodb://ratsaranasa_db_user:WT8OiPdzjM7Hrfmk@ac-u8ouxbz-shard-00-00.ppsupn2.mongodb.net:27017,ac-u8ouxbz-shard-00-01.ppsupn2.mongodb.net:27017,ac-u8ouxbz-shard-00-02.ppsupn2.mongodb.net:27017/dembeni_db?ssl=true&authSource=admin
JWT_SECRET=dembeni_secret_key_2026
NODE_ENV=production
CLIENT_URL=https://nasa-m413.vercel.app
CLOUDINARY_CLOUD_NAME=<votre_cloud_name>
CLOUDINARY_API_KEY=<votre_api_key>
CLOUDINARY_API_SECRET=<votre_api_secret>
```

#### Root Directory
Si vous avez un monorépo:
- Si backend est dans `/backend/` → indiquer `/backend`
- Si backend est à la racine → laisser vide

### 3.4 Redéployer le service
Cliquer sur: **Manual Deploy** → **Deploy latest commit**

Vérifier les logs:
```
[backend] Starting backend server...
[backend] MongoDB connection established successfully.
[backend] Seed module executed successfully.
[backend] Server running on port 5000 in production mode.
```

---

## 🧪 ÉTAPE 4: TESTER APRÈS DÉPLOIEMENT

### Via Postman (recommandé):

#### 1. GET /api/demarches (Public)
```
GET https://dembeni-backend-0soo.onrender.com/api/demarches
Content-Type: application/json
```
**Résultat attendu:** `200 OK` + JSON array `[]` ou `[{...}]`

#### 2. GET /api/demarches/:id (Public)
```
GET https://dembeni-backend-0soo.onrender.com/api/demarches/123456789
Authorization: Bearer <token>
```
**Résultat attendu:** `200 OK` ou `404 Not Found`

#### 3. POST /api/demarches (Admin)
```
POST https://dembeni-backend-0soo.onrender.com/api/demarches
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Test Demarche",
  "description": "Test",
  "category": "État Civil",
  "status": "publié"
}
```
**Résultat attendu:** `201 Created` + JSON objet sauvegardé

#### 4. PUT /api/demarches/:id (Admin)
```
PUT https://dembeni-backend-0soo.onrender.com/api/demarches/<id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "brouillon"
}
```
**Résultat attendu:** `200 OK` + JSON mis à jour

#### 5. DELETE /api/demarches/:id (Admin)
```
DELETE https://dembeni-backend-0soo.onrender.com/api/demarches/<id>
Authorization: Bearer <admin_token>
```
**Résultat attendu:** `200 OK` + message de succès

#### 6. POST /api/demarches/upload (Admin - avec fichier)
```
POST https://dembeni-backend-0soo.onrender.com/api/demarches/upload
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body: file (PDF, JPG, PNG, WebP)
```
**Résultat attendu:** `200 OK` + `{ url: "https://res.cloudinary.com/...", publicId: "..." }`

### Via Frontend:

1. Ouvrir https://nasa-m413.vercel.app
2. Aller à Admin → Gestion des Démarches
3. La liste doit charger sans erreur
4. Créer une nouvelle démarche
5. L'image doit être uploadée sur Cloudinary
6. La démarche doit apparaître dans la liste
7. Vérifier dans MongoDB Atlas que les données sont sauvegardées

---

## ⚠️ TROUBLESHOOTING

### Symptôme: "Cannot GET /api/demarches"
**Cause probable:** Render utilise l'ancien code sans routes demarches
**Solution:** 
- Vérifier que dernier commit est push à Git
- Sur Render, cliquer "Manual Deploy"
- Vérifier les logs de déploiement

### Symptôme: "Cannot find module 'streamifier'"
**Cause probable:** npm install ne s'est pas exécuté
**Solution:**
- Sur Render, Settings → Rebuild & Deploy
- OU: Supprimer node_modules et package-lock.json localement, `npm install` à nouveau

### Symptôme: "Cloudinary is not configured"
**Cause probable:** Variables d'environnement Cloudinary manquantes
**Solution:**
- Vérifier que CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET sont dans Render

### Symptôme: "Cannot connect to MongoDB"
**Cause probable:** MONGODB_URI incorrect ou MongoDB Atlas ne accept pas l'IP de Render
**Solution:**
- Vérifier MONGODB_URI dans Render
- Dans MongoDB Atlas: Network Access → Ajouter IP 0.0.0.0/0 (ou IP spécifique de Render)

### Symptôme: "504 Gateway Timeout"
**Cause probable:** Le serveur démarre mais prend trop longtemps ou se crash après démarrage
**Solution:**
- Vérifier les logs Render pour erreurs au démarrage
- Vérifier que MongoDB connexion ne bloque pas

---

## ✨ RÉSUMÉ DES CHANGEMENTS

### Ce qui a été FIXÉ:

| Problème | Solution | Fichier |
|----------|----------|---------|
| Images local + uploads folder | Cloudinary uploads | demarcheRoutes.js, demarcheController.js |
| No imageUrl/publicId fields | Ajouté à schema | Demarche.js |
| Multer disk storage | Multer memory storage | demarcheRoutes.js |
| Helper upload manquant | Ajouté uploadToCloudinary() | demarcheController.js |
| Pas de config Cloudinary | Créé config/cloudinary.js | Nouveau fichier |
| streamifier manquant | Ajouté à package.json | package.json |
| Champs slug/piecesAFournir manquants | Ajoutés au schema | Demarche.js |

### Ce qui DOIT RESTER comme avant:

- ✓ Routes enregistrées dans index.js
- ✓ Middleware protect/admin
- ✓ Validation des fichiers
- ✓ Gestion des erreurs
- ✓ MongoDB sauvegarde

---

## 🎯 PROCHAINES ÉTAPES

Une fois que `/api/demarches` fonctionne:

1. **Appliquer le même pattern Cloudinary aux autres modules:**
   - Projects (projectRoutes.js, projectController.js, Project.js)
   - News (newsRoutes.js, newsController.js, News.js)
   - Culture (cultureRoutes.js, cultureController.js, Culture.js)

2. **Fixer le problème "projet apparaît puis disparaît"**
   - Vérifier les filtres `published`, `status`, `isPublished` dans Project schema
   - Vérifier la requête GET retourne les données correctement
   - Vérifier le frontend ne supprime pas le projet après création

3. **Tester TOUS les CRUD complet**
   - GET (public + admin)
   - POST (admin)
   - PUT (admin)
   - DELETE (admin)

---

## 📞 Support

Si vous êtes bloqué:
1. Vérifier les logs de Render (onglet Logs)
2. Vérifier la console du navigateur (browser DevTools)
3. Tester avec Postman pour isoler le problème (API ou Frontend)
4. Vérifier MongoDB Atlas pour confirmer les données sauvegardées

---

**Créé:** 8 juillet 2026
**Dernière mise à jour:** Backend corrections + Cloudinary integration
