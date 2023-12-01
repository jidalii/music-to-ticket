require('dotenv').config({path: '../env'});
const express = require("express");
const passport = require('passport');
const axios = require('axios');
const router = express.Router();
const mongoose = require("mongoose");
const Spotify = require("../model/gallery");
const User = require('../model/user');

const ticketmaster_root_url = "https://app.ticketmaster.com/discovery/v2/"
const API_KEY = process.env.TICKETMASTER_CLIENT_ID

// Function to get artist names from MongoDB
async function getArtistNamesFromDB() {
    try {
        // Fetch all artist entries and extract names
        const artists = await Spotify.find().select('artist.name -_id');
        return artists.map(item => item.artist.map(artist => artist.name)).flat();  //flatten into a single array of artist names
    } catch (error) {
        console.error('Error fetching artist names from MongoDB:', error);
        throw error;
    }
}


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


// New route to get events for all artists in MongoDB
router.get('/events', async (req, res) => {
    try {
        const artistNames = await getArtistNamesFromDB();
        const eventsPromises = artistNames.map(name => axios.get(`${ticketmaster_root_url}events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}`));
        const eventsResponses = await Promise.allSettled(eventsPromises); //wait for all API requests to resolved or rejected

        const events = eventsResponses
            .filter(response => response.status === 'fulfilled')
            .map(response => response.value.data._embedded?.events ?? [])  //handle with no event was found // ?? [] provide an empty array if _embedded is undefined or null
            .flat()
            .map(event =>({
                name: event.name,
                date: event.dates.start.localDate,
                time: event.dates.start.localTime,
                url: event.url
            })); //flatten into a single array
        console.log(events);


        // Access the Spotify ID
        const user_id = req.query.spotifyId;     //需要转换成dynamic。。。"31525gofi436ryheps2haspy5kq4"
        const user = await User.findOne({spotifyId: user_id});

        if (user) {
                // Check if a ticket entry for this user already exists
            let ticket = await Ticket.findOne({ userId: user_id });

            if (ticket) {
                // Update existing ticket entry
                events.forEach(newEvent => {
                    const eventExists = ticket.events.some(existingEvent =>
                        existingEvent.name === newEvent.name &&
                        existingEvent.date === newEvent.date &&
                        existingEvent.time === newEvent.time
                    );

                    if (!eventExists) {
                        ticket.events.push(newEvent);
                    }
                });
            } else {
                // Create a new ticket entry
                ticket = new Ticket({
                    userId: user_id,
                    name: user.username,
                    events: events
                });
                await ticket.save();
            }

            res.render('events', { events: events }); // another res way to pass to events.ejs "res.json(events);" for displaying filtered important info instead of all info
        } else {
            res.status(404).send("User not found");
        }
        
    } catch (error) {
        console.error('Error fetching events for artists:', error);
        res.status(500).send('An error occurred while fetching events');
    }
});

//:)
router.get('/events/fun', (req, res) => {res.status(418).send("I'm a teapot"); });

module.exports = router;