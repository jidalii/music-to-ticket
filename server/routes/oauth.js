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

router.get('/profile', (req, res)=>{
    res.render("profile");
})

router.get(
    "/spotify",
    passport.authenticate("spotify", {
        scope: ['user-read-email', 'user-read-private', 'user-library-read', 'streaming', 'playlist-read-private'],
        showDialog: true,
        accessType: 'offline',
        prompt: 'consent',
    })
);

router.get("/spotify/redirect", passport.authenticate('spotify', { failureRedirect: '/auth/error' }),
    function (req, res) {
        console.log("Authentication successful. Redirecting to profile...");
        req.session.user = req.user
        res.redirect("http://localhost:5173/profile");
    }
);

router.get('/error', (req, res) => res.send('Unknown Error'))

router.get("/access-token", (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(404).send('User not found');
    }
});

router.get("/user-id", (req, res) => {
    if (req.session.user) {
        const userId = req.session.user.spotifyId
        res.json(userId);
    } else {
        res.status(404).send('User not found');
    }
    
})

router.get("/user-data", (req,res) => {
    if (req.session.user) {
        const userId = req.session.user.spotifyId
        const accessToken = req.session.user.accessToken;
        const username = req.session.user.username;
        const email = req.session.user.email
        const avatar = req.session.user.avatar
        res.json({
            username: username,
            email: email,
            avatar: avatar,
            userId: userId,
            accessToken: accessToken
        });
    } else {
        res.status(404).send('User not found');
    }
})


module.exports = router;