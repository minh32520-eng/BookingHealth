import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine.js";
import initWebRoutes from './route/web.js';
import initAuthRoutes from './route/auth.js';
import connectDB from './config/connectDB.js';
import dotenv from "dotenv";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './config/passport-config.js';
dotenv.config();

// Register OAuth strategies before auth routes are mounted.
configurePassport();

let app = express();
app.use(cookieParser(process.env.SESSION_SECRET || 'session-secret-dev'));
app.use(
    session({
        // OAuth redirects rely on this server-side session to keep the auth handshake alive.
        secret: process.env.SESSION_SECRET || 'session-secret-dev',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 3600000
        }
    })
);
app.use(passport.initialize());
app.use(passport.session());

// This project currently uses a fixed local frontend origin, so CORS is set manually.
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");
    // process.env.URL_REACT

    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE'
    );

    // Request headers you wish to allow
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With,content-type'
    );
    next();

})
//config app

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Route order matters: auth routes need passport/session first, then normal API routes.
viewEngine(app);
initAuthRoutes(app);
initWebRoutes(app);
connectDB();

let port = process.env.PORT || 6969;
//Port   undefined => port = 6969

app.listen(port, () => {
    //callback
    console.log("Backend Nodejs is runing on the port : " + port)
})
