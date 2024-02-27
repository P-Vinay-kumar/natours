// npm start
// npm run build:js

// npm run start:prod
// npm run build:js // This will create our final compressed JavaScript bundle.

/*
In package.json file
"scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
}
In production we don't want to use nodemon, we simply want to run our application using the node command, because that nodemon is only for development.
*/

// https://www.giftofspeed.com/gzip-test/

const mongoose = require('mongoose');
const dotenv = require('dotenv');
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({path: './config.env'});
const app = require('./app');

mongoose.connect(process.env.DATABASE_LOCAL, {}).then(() => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
    console.log('UNHANDLER REJECTION! 💥 Shutting down...');
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => { // SIGTERM is a signal sent to a process indicating it should terminate gracefully. Upon receiving the signal, our application can perform cleanup tasks before exiting.
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => { // Closing the server ensures all pending requests are handled before the application exits. This prevents abrupt termination and potential loss of data or connections.
        console.log('💥 Process terminated!');
    })
});
