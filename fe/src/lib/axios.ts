import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
});

export default api;