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

passport.serializeUser((user, done) => {
    // console.log(user);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const user = User.findById(id);
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
            // console.log("profile", profile.photos[1]);
            const user = await User.findOneAndUpdate(
                {spotifyId: profile.id},
                {
                    username: profile.displayName,
                    email: profile.emails?.[0].value,
                    avatar: profile.photos[1].value,
                    country: profile.country,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    provider: profile.provider,
                }
            );
            // console.log(user);
            // req.session.accessToken = accessToken; // Set tokens here
            // req.session.refreshToken = refreshToken;
            req.session.userId = profile.id
            // req.session.userId = profile.id;
            console.log('auth', req.session);
            if (!user) {
                const newUser = await User.create({
                    // _id: new mongoose.Types.ObjectId(profile.id),
                    spotifyId: profile.id,
                    username: profile.displayName,
                    email: profile.emails?.[0].value,
                    avatar: profile.photos.photos[1].value,
                    country: profile.country,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    provider: profile.provider,
                });
                if (newUser) {
                    done(null, newUser);
                }
            } else {
                done(null, user);
            }
        }
    )
);