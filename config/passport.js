require('dotenv').config({path: '../env'});

const passport = require('passport');
const CryptoJS = require("crypto-js");
const passportSpotify = require("passport-spotify");
const mongoose = require("mongoose");
const SpotifyStrategy = passportSpotify.Strategy;
const session = require('express-session');
const User = require('../model/user');
// const {Strategy: SpotifyStrategy} = require("passport-spotify");


// ********** connect mangodb **********
const mongoString = process.env.DATABASE_URL
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('MangoDB user Connected');
})

// ********** google oauth **********

passport.serializeUser((info, done) => {
    const {user, accessToken, refreshToken} = info;
    // console.log(user);
    done(null, {
        id: user.id,
        accessToken: accessToken,
        refreshToken: refreshToken,
    });
});

passport.deserializeUser(async (data, done) => {
    console.log(data);
    const id = data.id;
    const user = await User.findById(id);
    done(null, user);
});

passport.use(
    new SpotifyStrategy(
        {
            clientID: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            callbackURL: "http://localhost:8000/auth/spotify/redirect",
            passReqToCallback: true,
        },
        async function(req, accessToken, refreshToken, profile, done) {
            const user = await User.findOne({ spotifyId: profile.id });
            req.session.accessToken = accessToken; // Set tokens here
            req.session.refreshToken = refreshToken;

            if (!user) {
                const newUser = await User.create({
                    _id: new mongoose.Types.ObjectId(profile.id),
                    spotifyId: profile.id,
                    username: profile.displayName,
                    email: profile.emails?.[0].value,
                    country: profile.country,
                    // accessToken: accessToken,
                    // refreshToken: refreshToken,
                    provider: profile.provider
                });
                if (newUser) {
                    done(null, {newUser, accessToken, refreshToken});
                }
            } else {
                done(null, {user, accessToken, refreshToken});
            }
        }
    )
);