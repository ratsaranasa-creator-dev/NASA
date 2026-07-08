# 🚀 GUIDE COMPLET - DÉPLOYER SUR RENDER

## 📋 Pré-requis
- Code pushé à GitHub (main branch)
- Compte Render avec service créé
- MongoDB Atlas URI (vous l'avez)
- Cloudinary credentials

---

## 📲 ÉTAPE 1: Aller à Render Dashboard

https://dashboard.render.com/

---

## 🔧 ÉTAPE 2: Configurer le Service

### 2.1 Sélectionner le service "dembeni-backend"

```
Services → dembeni-backend (or your service name)
```

### 2.2 Aller à "Settings"

```
Service → Settings
```

---

## 📝 ÉTAPE 3: Vérifier les chemins

### 3.1 Root Directory

**Où est votre backend?**

**Option A: Backend dans `/backend/` (VOTRE CAS)**
```
Root Directory: /backend
```

**Option B: Backend à la racine**
```
Root Directory: (laisser vide)
```

**Pour vérifier:** Allez à "Logs" → chercher "Server running"

---

## 🏗️ ÉTAPE 4: Build Command

Cliquer sur "Build Command" (ou chercher dans Settings)

**Remplacer par:**

```bash
npm install
```

**OU si backend dans /backend:**

```bash
cd backend && npm install
```

---

## 🚀 ÉTAPE 5: Start Command

Cliquer sur "Start Command"

**Remplacer par:**

```bash
npm start
```

**OU si backend dans /backend:**

```bash
cd backend && npm start
```

---

## 🌍 ÉTAPE 6: Environment Variables

Cliquer sur l'onglet "Environment"

### 6.1 Ajouter chaque variable EXACTEMENT

```
Clé = Valeur
```

#### Variable 1: PORT
```
PORT = 5000
```

#### Variable 2: NODE_ENV
```
NODE_ENV = production
```

#### Variable 3: MONGODB_URI
```
MONGODB_URI = mongodb://ratsaranasa_db_user:WT8OiPdzjM7Hrfmk@ac-u8ouxbz-shard-00-00.ppsupn2.mongodb.net:27017,ac-u8ouxbz-shard-00-01.ppsupn2.mongodb.net:27017,ac-u8ouxbz-shard-00-02.ppsupn2.mongodb.net:27017/dembeni_db?ssl=true&authSource=admin
```

#### Variable 4: JWT_SECRET
```
JWT_SECRET = dembeni_secret_key_2026
```

#### Variable 5: CLIENT_URL
```
CLIENT_URL = https://nasa-m413.vercel.app
```

#### Variable 6: CLOUDINARY_CLOUD_NAME
```
CLOUDINARY_CLOUD_NAME = <votre_cloudinary_cloud_name>
```

**Comment trouver?**
1. Aller à https://cloudinary.com/console
2. Dashboard → Cloud name (ex: `dpqfwlvf4`)
3. Copier exactement

#### Variable 7: CLOUDINARY_API_KEY
```
CLOUDINARY_API_KEY = <votre_api_key>
```

**Comment trouver?**
1. https://cloudinary.com/console/settings/api-keys
2. Copy "API Key" (nombre long)

#### Variable 8: CLOUDINARY_API_SECRET
```
CLOUDINARY_API_SECRET = <votre_api_secret>
```

**Comment trouver?**
1. https://cloudinary.com/console/settings/api-keys
2. Copy "API Secret"

### ✅ Votre liste doit être:

```
PORT                       = 5000
NODE_ENV                   = production
MONGODB_URI                = mongodb://ratsaranasa_db_user:WT8OiPdzjM7Hrfmk@...
JWT_SECRET                 = dembeni_secret_key_2026
CLIENT_URL                 = https://nasa-m413.vercel.app
CLOUDINARY_CLOUD_NAME      = dpqfwlvf4
CLOUDINARY_API_KEY         = 1234567890123456789
CLOUDINARY_API_SECRET      = aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

---

## 🔄 ÉTAPE 7: Sauvegarder et Redéployer

### 7.1 Sauvegarde des changements
Cliquer sur "Save Environment"

### 7.2 Redéployer avec les nouveaux paramètres

**Option 1: Manual Deploy**
```
Services → dembeni-backend → Deployments
Click: "Manual Deploy" → "Deploy latest commit"
```

**Option 2: Force Rebuild**
```
Services → dembeni-backend
Cliquer sur trois points (...) → "Rebuild latest commit"
```

---

## 📊 ÉTAPE 8: Vérifier le déploiement

### 8.1 Regarder les logs
```
Services → dembeni-backend → Logs
```

**Vous DEVEZ voir:**
```
[backend] Starting backend server...
[backend] MongoDB connection established successfully.
[backend] Seed module executed successfully.
[backend] Server running on port 5000 in production mode.
```

**SI VOUS VOYEZ DES ERREURS:**
- "Cannot find module 'streamifier'" → npm install ne s'est pas exécuté
- "MONGODB_URI is not set" → manquant dans Environment Variables
- "Cloudinary is not configured" → CLOUDINARY_* variables manquantes

### 8.2 Tester l'endpoint
```bash
curl https://dembeni-backend-0soo.onrender.com/api/demarches
```

**Résultat attendu:**
```json
[]
```

**OU si démarches existants:**
```json
[{"_id":"...", "title":"...", "status":"publié", ...}]
```

**PAS attendu:**
```
Cannot GET /api/demarches
404 Not Found
```

---

## ⚠️ TROUBLESHOOTING

### Problème 1: "Build failed"
**Log message:** `npm ERR! 404 Not Found`

**Cause:** npm install a échoué (internet ou typo dans package.json)

**Solution:**
1. Vérifier package.json n'a pas d'erreurs de syntaxe
2. Vérifier `.npmrc` ou `npm config` n'a pas de restrictions
3. Attendre quelques minutes (npm registry down temporairement)
4. Manual Deploy à nouveau

---

### Problème 2: "Deploy succeeded" mais 404 sur endpoint
**Log message:** Server seems started OK

**Cause:** Ancien code encore en cache Render

**Solution:**
1. Aller à Deployments
2. Cliquer sur le plus ancien déploiement avant votre changement
3. Cliquer "Redeploy"
4. Puis "Manual Deploy" du dernier
5. OU: Supprimer le service et créer nouveau (mais perte d'URL)

---

### Problème 3: "Cannot connect to MongoDB"
**Log message:** `Unable to connect to MongoDB Atlas`

**Cause:**
- MONGODB_URI incorrect
- IP Render pas autorisée par MongoDB Atlas

**Solution MongoDB Atlas:**
1. Aller à https://cloud.mongodb.com/
2. Network Access
3. Add IP Address
4. Add IP "0.0.0.0/0" (pour tout le monde)
   OU chercher IP Render (complexe)
5. Attendre quelques minutes (sync)

**Solution Render:**
1. Vérifier MONGODB_URI copié correctement
2. Tester localement: `node -e "const m=require('mongoose'); m.connect(process.env.MONGODB_URI, ...);"`

---

### Problème 4: Images pas uploadées (Cloudinary)
**Symptôme:** Create demarche réussit mais pas d'image

**Cause:**
- CLOUDINARY_* variables incorrectes
- Cloudinary config() échoue silencieusement

**Solution:**
1. Double-check les 3 variables Cloudinary
2. Tester localement avec les mêmes credentials
3. Vérifier sur https://cloudinary.com/console que cloud est actif

---

## ✨ ÉTAPE 9: Tester avec Postman (après succès du déploiement)

### 9.1 Importer la collection Postman
```
Postman → Import → Select Postman_Dembeni_API.json
```

### 9.2 Configurer les variables

**Dans Postman:**
```
Collections → Dembéni Backend API → Variables
```

**Ajouter:**
```
baseUrl = https://dembeni-backend-0soo.onrender.com
adminToken = <votre_jwt_token>
```

### 9.3 Tester chaque endpoint

```
GET /api/demarches
GET /api/demarches/{id}
POST /api/demarches (avec JSON)
POST /api/demarches (avec image)
PUT /api/demarches/{id}
DELETE /api/demarches/{id}
POST /api/demarches/upload
```

---

## 🎯 CHECKLIST FINALE

### Avant de déployer
- [ ] `npm install` exécuté localement
- [ ] `npm start` fonctionne localement sans erreur
- [ ] `curl http://localhost:5000/api/demarches` retourne JSON
- [ ] `.env` a toutes les variables (y compris CLOUDINARY_*)
- [ ] Git commit et push effectués

### Pendant le déploiement (Render)
- [ ] Root Directory correct (/backend ou vide)
- [ ] Build Command et Start Command corrects
- [ ] 8 Environment Variables ajoutées
- [ ] Manual Deploy exécuté

### Après le déploiement
- [ ] Logs montrent "Server running on port 5000"
- [ ] `curl https://dembeni-backend-0soo.onrender.com/api/demarches` retourne JSON
- [ ] Postman tests réussissent
- [ ] Frontend fetch réussit sans 404

---

## 🔗 URLs IMPORTANTES

| Ressource | URL |
|-----------|-----|
| Render Dashboard | https://dashboard.render.com |
| Service dembeni-backend | https://dashboard.render.com/services/[service-id] |
| Logs en live | https://dashboard.render.com/services/[service-id]/logs |
| MongoDB Atlas | https://cloud.mongodb.com |
| Cloudinary Console | https://cloudinary.com/console |
| Frontend (Vercel) | https://nasa-m413.vercel.app |
| Backend API | https://dembeni-backend-0soo.onrender.com |

---

## 💡 TIPS

### Tip 1: Vérifier deployment history
```
Services → dembeni-backend → Deployments
```
Voir tous les déploiements (utile pour rollback)

### Tip 2: Environment variables secrets
Les variables sont **chiffrées en transit** mais ne copier/partager jamais à personne

### Tip 3: Cache Render
Si déploiement ancien reste actif:
1. Manual Deploy + attendre
2. OU Build → Settings → Trigger build

### Tip 4: Logs streaming
Pour see logs en real-time:
```
Render Dashboard → Services → Logs → tail -f
```

### Tip 5: Utiliser ngrok pour tester webhook localement
```bash
ngrok http 5000
# Génère URL https://xyz.ngrok.io qui pointe à localhost:5000
```

---

## ✅ RÉSUMÉ RAPIDE (POUR EXPERTS)

1. **Root Directory:** `/backend`
2. **Build:** `npm install`
3. **Start:** `npm start`
4. **Env Vars:** PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, CLIENT_URL, CLOUDINARY_*
5. **Manual Deploy** après push
6. **Test:** `curl https://dembeni-backend-0soo.onrender.com/api/demarches`

