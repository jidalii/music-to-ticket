require('dotenv').config({path: '../env'});

const passport = require('passport');
const CryptoJS = require("crypto-js");
const passportSpotify = require("passport-spotify");
const mongoose = require("mongoose");
const { ObjectId } = require('mongodb');
const SpotifyStrategy = passportSpotify.Strategy;
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
    // console.log('here');
    // console.log(user.id);
    // console.log(user.spotifyId);
    // console.log('here again');
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

passport.use(
    new SpotifyStrategy(
        {
            clientID: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            callbackURL: "http://localhost:8000/auth/spotify/redirect"
        },
        async function(accessToken, refreshToken, profile, done) {
            const user = await User.findOne({ spotifyId: profile.id });
            // console.log(`accessToken: ${accessToken}`);
            // console.log(`refreshToken: ${refreshToken}`);
            // console.log(profile);
            // console.log(profile.id);
            // console.log(profile.displayName);
            // console.log(profile.country);
            if (!user) {
                const newUser = await User.create({
                    _id: new mongoose.Types.ObjectId("4eb6e7e7e9b7f4194e000001"),
                    spotifyId: profile.id,
                    username: profile.displayName,
                    email: profile.emails?.[0].value,
                    country: profile.country,
                    refreshToken: refreshToken,
                    provider: profile.provider
                });
                if (newUser) {
                    // console.log(`new user id: ${user.spotifyId}`);
                    done(null, newUser);
                }
            } else {
                // console.log(`existed user id: ${user.spotifyId}`);
                done(null, user);
            }

            // return done(null, profile);
        }
        // async (accessToken, refreshToken, tokens, profile, done) => {
        //     const user = await User.findOne({ googleId: profile.id });
        //     // console.log(profile);
        //     // console.log(profile.displayName);
        //     // console.log(profile);
        //     // console.log(refreshToken);
        //     // console.log(accessToken);
        //     // console.log(tokens);
        //     // If user doesn't exist creates a new user. (similar to sign up)
        //     if (!user) {
        //         const newUser = await User.create({
        //             googleId: CryptoJS.AES.encrypt(profile.id, process.env.ENCRYPT_SECRET).toString(),
        //             username: profile.displayName,
        //             email: profile.emails?.[0].value,
        //             refreshToken: CryptoJS.AES.encrypt(refreshToken, process.env.ENCRYPT_SECRET).toString(),
        //             avatarUrl: profile.photos?.[0].value,
        //             provider: profile.provider
        //         });
        //         if (newUser) {
        //             done(null, newUser);
        //         }
        //     } else {
        //         done(null, user);
        //     }
        // }
    )
);