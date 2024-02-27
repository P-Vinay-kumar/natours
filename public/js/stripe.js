import {showAlert} from './alerts';
import axios from 'axios';


export const bookTour = async tourId => {
    try {
        // const session = await axios(`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`);
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
        window.location.replace(session.data.session.url);
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};