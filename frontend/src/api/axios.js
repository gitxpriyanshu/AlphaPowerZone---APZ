import axios from 'axios';

const api = axios.create({
    baseURL: 'https://alphapowerzone-apz.onrender.com/api',
    withCredentials: true, // Important for cookies
});

export default api;
