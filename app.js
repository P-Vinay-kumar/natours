const cookieParser = require('cookie-parser');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
// npm i compression
// This compression package that is gonna compress all our responses. So whenever we send a text response to a client, no matter if that is JSON or HTML code with the compression package that text will then be dramatically compressed.
const compression = require('compression'); // This will expose a very simple middleware function that we simply have to plug into our middleware stack.
const cors = require('cors');

const app = express();
app.enable('trust proxy'); // Heroku acts as a reverse proxy, which redirects and potentially modifying incoming requests. Therefore, enabling trust proxy is necessary to ensure the application interprets the headers correctly. This functionality is built into Express.
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Implement CORS
// npm i cors
// We want to allow other websites to access our API. To achieve this, we'll use Cross-Origin Resource Sharing (CORS). Let's say our API resides at natours-jonas.herokuapp.com/api/v1, and another website, example.com, wants to interact with it. This interaction involves making a request to that URL, which is considered a cross-origin request because herokuapp.com and example.com belong to different domains. By default, browsers prevent such requests due to the Same-Origin Policy, a security measure to isolate web applications. To enable cross-origin access to our API, we need to implement CORS. This mechanism allows us to specify which origins (domains, ports, and protocols) are authorized to make requests to our API. Since we want our API to be publicly accessible, we can configure CORS to grant permissions to all origins (using a wildcard origin *), but this approach should be used with caution in production environments due to potential security risks. For enhanced security, consider implementing more granular control by specifying a limited set of trusted origins allowed to access our API. This approach minimizes the attack surface and protects our API from unauthorized access. By default, a cross-origin request initiated from the browser (using tools like Fetch API or libraries like Axios) will be blocked unless the server hosting the API has implemented CORS to allow the request origin. However, restrictions on cross-origin requests do not apply to server-side requests. This means servers can still make cross-origin requests without limitations.
app.use(cors()); // This will return a middleware function, which is then gonna add a couple of different headers to our response, but in this we want to allow everyone.

/* api.natours.com, frontend at natours.com
app.use(cors({
    origin: 'https://www.natours.com' // With this we would only allow this URL (origin) to create requests to api.natours.com
})); */

// app.use(cors()) only works for simple requests, which are GET and POST requests. Non-simple requests include PUT, PATCH, DELETE, requests with cookies, or requests using non-standard headers. These require a preflight phase. Whenever a non-simple request is made, the browser preemptively issues a preflight request using the OPTIONS method to determine if the actual request is safe to send. This means that before a request like DELETE, the browser first sends an OPTIONS request to check if the actual request is allowed. As developers, we need to respond to these OPTIONS requests on our server. The OPTIONS method is an HTTP method similar to GET, POST, and DELETE. When we receive an OPTIONS request on our server, we need to respond with the appropriate Access-Control-Allow-Origin header. This informs the browser that the actual request (e.g., the DELETE request in this case) is safe to perform, allowing it to proceed.
app.options('*', cors()); // app.options('*', cors()) defines a route for handling OPTIONS requests using the cors middleware. The wildcard character (*) indicates that this route applies to all routes. This allows preflight requests for any method on any route.
// app.options('/api/v1/tours/:id', cors()); defines a route specifically for handling OPTIONS requests related to the /api/v1/tours/:id route. This means preflight requests are only allowed for DELETE or PATCH requests targeting specific tours.

app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({
    limit: '10kb'
}));
app.use(express.urlencoded({extended: true, limit: '10kb'}));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());
app.use(hpp({
    whitelist: [
        'duration',
        "ratingsAverage",
        "ratingsQuantity",
        "maxGroupSize",
        "difficulty",
        "price"
    ]
}));

app.use(compression()); // This here will return a middleware function, which is going to compress all the text that is sent to clients. It is not going to be working for images, because these are already compressed.

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

app.use('/', viewRouter);
// app.use('/api/v1/tours', cors(), tourRouter); // If we only wanted to enable CORS on a specific route.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;