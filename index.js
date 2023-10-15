require('dotenv').config();

const express = require('express')
const passport = require('passport');
const createError = require('http-errors');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cookieSession = require("cookie-session");
const logger = require('morgan');
const app = express()

// db
const session = require('express-session');
const MongoStore = require('connect-mongo');


require("./config/passport");
const authRoutes = require("./routes/oauth");
const profileRoutes = require("./routes/profile");

// 1. Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS
app.use(cors());

// 3. Express Session setup
app.use(session({
    secret: 'secret testing',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DATABASE_URL,
        ttl: 14 * 24 * 60 * 60, // = 14 days. Default
        autoRemove: 'native',
    }),
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000, // cookie expiration in milliseconds
        secure: true
    }
}));

// 4. Passport setup
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

// 5.Routers
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
// app.use("/api", frontendRoutes);

app.set("view engine", "ejs");


app.get('/',(req,res)=>{
    res.render("home", { user: req.user });
})

app.listen(8000,()=>{
    console.log('bu-cal API listening on http://localhost:8000');
})