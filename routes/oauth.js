const express = require("express");
const passport = require('passport');
const router = express.Router();

router.get("/login", (req, res) => {
    if (req.user) {
        res.redirect("/profile");
    }
    res.render("login");
});

router.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});


router.get(
    "/spotify",
    passport.authenticate("spotify", {
        scope: ['user-read-email', 'user-read-private', 'user-library-read', 'streaming', 'playlist-read-private'],
        showDialog: true,
        // accessType: 'offline',
        // prompt: 'consent',
    })
);

router.get("/spotify/redirect", passport.authenticate('spotify', {failureRedirect: '/login'}),
    function (req, res) {
        res.redirect('/profile');
    });

module.exports = router;