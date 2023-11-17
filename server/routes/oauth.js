const express = require("express");
const passport = require('passport');
const router = express.Router();

router.get("/login", (req, res) => {
    if (req.user) {
        res.redirect("/profile");
    }
    // print(req.user)
    res.render("login");
});

router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

router.get('/profile', (req, res)=>{
    res.render("profile");
})

router.get(
    "/spotify",
    passport.authenticate("spotify", {
        scope: ['user-read-email', 'user-read-private', 'user-library-read', 'streaming', 'playlist-read-private'],
        showDialog: true,
        accessType: 'offline',
        // prompt: 'consent',
    })
);

router.get("/spotify/redirect", passport.authenticate('spotify', { failureRedirect: '/auth/error' }),
    function (req, res) {
        console.log("Authentication successful. Redirecting to profile...");

        // Check if user data is available
        if (req.user && req.user.spotifyId) {
            // Store Spotify ID in the session
            req.session.spotifyId = req.user.spotifyId;

            // Redirect to the profile page
            res.render("profile", { user: req.user, imageUrl: req.user.avatarUrl });
        } else {
            res.redirect('/auth/login');
        }

        // Store Spotify ID in the session
        //if (req.user && req.user.spotifyId) {
            //req.session.spotifyId = req.user.spotifyId;
        //}

        //res.render("profile", { user: req.user, imageUrl: req.user.avatarUrl });
    }
    );
router.get('/error', (req, res) => res.send('Unknown Error'))


module.exports = router;