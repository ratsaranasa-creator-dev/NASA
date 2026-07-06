import axios from "axios";

if (!process.env.REACT_APP_API_URL) {
    console.error("ERREUR CRITIQUE : REACT_APP_API_URL n'est pas défini dans les variables d'environnement. Les appels API risquent d'échouer.");
}

const API_URL = process.env.REACT_APP_API_URL || "";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Add a request interceptor to include the JWT token in the headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export { API_URL };
export default api;
