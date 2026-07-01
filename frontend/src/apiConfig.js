import axios from "axios";

if (!process.env.REACT_APP_API_URL) {
    console.error("ERREUR CRITIQUE : REACT_APP_API_URL n'est pas défini dans les variables d'environnement. Les appels API risquent d'échouer.");
}

const API_URL = process.env.REACT_APP_API_URL || "";

const api = axios.create({
    baseURL: API_URL
    // withCredentials: true, // on laisse de côté si pas spécifié avant, mais le user le propose dans son exemple
});

export { API_URL };
export default api;
