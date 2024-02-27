import axios from 'axios';
import {showAlert} from './alerts';

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login', // Assuming API and website share the same domain
            // url: 'http://localhost:3000/api/v1/users/login', // Avoid hardcoding development URLs.
            // We use a relative URL (`/api/v1/users/login`) for the API endpoint. This assumes both the API and the website are hosted on the same domain. Using a relative URL avoids hardcoding the development server address (like `http://localhost:3000`) which wouldn't work in production. If the API is on a different domain, use the full URL instead.
            data: {
                email,
                password
            }
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
            // url: 'http://localhost:3000/api/v1/users/logout',
        });
        if (res.data.status = 'success') {
            location.reload(true);
        }
    } catch (err) {
        console.log(err);
        showAlert('error', 'Error logging out! Try again.');
    }
};