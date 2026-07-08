import axios from "axios";

if (!process.env.REACT_APP_API_URL) {
    console.error("ERREUR CRITIQUE : REACT_APP_API_URL n'est pas défini dans les variables d'environnement. Les appels API risquent d'échouer.");
}

const API_URL = process.env.REACT_APP_API_URL || "";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to include the JWT token in the headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // If sending FormData, allow the browser/axios to set the proper Content-Type (with boundary)
        if (config && config.data && typeof FormData !== 'undefined' && config.data instanceof FormData) {
            if (config.headers && config.headers['Content-Type']) delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { API_URL };
export default api;
