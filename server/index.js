require('dotenv').config();

const express = require('express')
const passport = require('passport');
const createError = require('http-errors');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const session = require('express-session');
// const bodyParser = require('body-parser');
const app = express()

// db
const MongoStore = require('connect-mongo');
require('./db_connection');


require("./config/passport");
const authRoutes = require("./routes/oauth");
const profileRoutes = require("./routes/profile");
const spotifyRoutes = require("./routes/spotifyapi");
const ticketRoutes = require('./routes/events')

// 1. Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS
const corsOptions = {
    origin: 'http://localhost:5173', // specify the frontend origin
    credentials: true, // allow credentials (cookies, sessions)
};

app.use(cors(corsOptions));

app.all('*', function(req, res, next) {
    res.header("Access-Contol-Allow-Origin", 'http://localhost:5173');
    res.header("Access-Contol-Allow-Origin", 'true');
    next()
})

// 3. Express Session setup            
app.use(session({
    secret: 'secret testing',
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000, // cookie expiration in milliseconds
        // secure: true,
        secure: false,
        sameSite: null
    }
}));

// 4. Passport setup
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

// 5.Routers         
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/spotify", spotifyRoutes);
app.use("/ticket", ticketRoutes)

app.set("view engine", "ejs");


app.get('/',(req,res)=>{
    res.render("home", { user: req.user });
})

app.listen(8000,()=>{
    console.log('bu-cal API listening on http://localhost:8000');
})
