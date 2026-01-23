import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: `${BASE_URL}/api`, 
    
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;