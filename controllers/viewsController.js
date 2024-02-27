const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200)
        .set(
            'Content-Security-Policy',
            "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        )
        .render('tour', {
            title: `${tour.name} Tour`,
            tour
        });
});

exports.getLoginForm = (req, res) => {
    res.status(200)
        .set(
            'Content-Security-Policy',
            "connect-src 'self' http://127.0.0.1:3000/"
        )
        .render('login', {
            title: 'Log into your account'
        });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => { // Here we need to find all the bookings for the currently logged-in users which will then give us a bunch of tour IDs and then we have to find the tours with those IDs.
    // 1) Find all bookings
    const bookings = await Booking.find({user: req.user.id}); // These bookings now contain all the booking documents for the current user, but that only gives us the tour IDs, so we want to find the tours with the returned IDs.

    // 2) Find tours with the returned IDs (The IDs of the bookings for the user)
    const tourIDs = bookings.map(el => el.tour); // This line here creates a new array named tourIDs. It uses the map method on the bookings array. The map method iterates over each element (el) in the bookings array and extracts the tour property from each element. The extracted tour values are then stored in the new tourIDs array. Having gathered all the tour IDs, we can then retrieve the corresponding tours.
    // console.log(tourIDs);
    const tours = await Tour.find({_id: {$in: tourIDs}}); // This $in operator selects documents from the Tour collection where the _id field is present in the tourIDs array.
    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    console.log('UPDATING USER ', req.body);
    const updatedUser = await User.findByIdAndUpdate(req.user.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    });
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    })
});
