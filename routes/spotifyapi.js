const express = require("express");
const passport = require('passport');
const axios = require('axios');
const router = express.Router();

// acquire users' data

// v0: return user's playlist
router.get('/v0', (req, res) => {
    const ACCESS_TOKEN = '{ACCESS_TOKEN}'; // Replace with your actual Spotify access token
    const USER_ID = '{user_id}'; // Replace with the actual user ID

    axios.get(`https://api.spotify.com/v1/users/${USER_ID}/playlists`, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('Error fetching playlists:', error);
        });
})