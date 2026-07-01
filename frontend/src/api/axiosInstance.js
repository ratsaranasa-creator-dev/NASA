import axios from 'axios';

// ⚠️ Vérification critique : REACT_APP_API_URL doit être défini
if (!process.env.REACT_APP_API_URL) {
  console.error(
    '❌ ERREUR CRITIQUE : La variable d\'environnement REACT_APP_API_URL est ABSENTE.\n' +
    'Toutes les requêtes API échoueront.\n' +
    'Ajoutez REACT_APP_API_URL=https://dembeni-backend-0soo.onrender.com dans votre fichier .env\n' +
    'et sur Vercel (Settings → Environment Variables).'
  );
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://dembeni-backend-0soo.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Intercepteur de requêtes : ajoute automatiquement le token JWT si présent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponses : log des erreurs réseau pour debug
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
      console.error('❌ Impossible de joindre le backend :', API_BASE_URL);
    }
    return Promise.reject(error);
  }
);

export const API_URL = API_BASE_URL;
export default api;
