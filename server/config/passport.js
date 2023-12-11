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
            let avatar = null;
            
            if(profile.photos) {
                avatar = profile.photos[1].value;
            }
            const user = await User.findOneAndUpdate(
                {spotifyId: profile.id},
                {
                    username: profile.displayName,
                    email: profile.emails?.[0].value,
                    avatar: avatar,
                    accessToken: accessToken,
                    country: profile.country,
                    provider: profile.provider,
                }
            );
            req.session.user = {}
            req.session.user.accessToken = accessToken; // Set tokens here
            req.session.user.spotifyId = profile.id
            if (!user) {
                const newUser = await User.create({
                    spotifyId: profile.id,
                    username: profile.displayName,
                    email: profile.emails?.[0].value,
                    avatar: avatar,
                    accessToken: accessToken,
                    country: profile.country,
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