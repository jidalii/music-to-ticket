require('dotenv').config({path: '../env'});
const express = require("express");
const passport = require('passport');
const axios = require('axios');
const router = express.Router();
const mongoose = require("mongoose");
const Spotify = require("../model/gallery");

const ticketmaster_root_url = "https://app.ticketmaster.com/discovery/v2/"
const API_KEY = process.env.TICKETMASTER_CLIENT_ID

router.get('/event/:artist', async (req, res) => {

    try{
        // const ACCESS_TOKEN = await getAccessToken();
        console.log(req.params.artist);
        const artistName = req.params.artist;
        const response = await axios.get(`${ticketmaster_root_url}events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(artistName)}`);
        // Send the response data back to the client
        res.json(response.data);

    } catch (error) {
        // If the token is invalid or expired, Spotify API will return a 401 - Unauthorized error
        if (error.response && error.response.status === 401) {
            // Handle token expiration, refresh the token if possible
            res.status(401).send('Access token expired');
        } else {
            console.error('Error calling Spotify API:', error);
            res.status(500).send('An error occurred while calling Spotify API');
        }
    }

})

module.exports = router;