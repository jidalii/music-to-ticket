require('dotenv').config({path: '../env'});
const express = require("express");
const axios = require('axios');
const router = express.Router();
const Spotify = require("../model/gallery");
const User = require('../model/user');

const ticketmaster_root_url = "https://app.ticketmaster.com/discovery/v2/"
const API_KEY = process.env.TICKETMASTER_CLIENT_ID


// Function to get artist names from MongoDB
async function getArtistNamesFromDB(user_id) {
    try {

        const userGallery = await Spotify.findOne({ id: user_id });
        if (!userGallery || !userGallery.artist) {
            return [];  // Return an empty array if the user has no artists
        }
        return userGallery.artist.map(artist => artist.name);
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
        const user_id = req.session.user.userId;
        // const user_id = "31lbzo6ubfwku5s5xxmlhaxxooz4";
        const artistNames = await getArtistNamesFromDB(user_id);

        //console.log(artistNames);

        let allArtistsEvents = [];

        // const eventsPromises = artistNames.map(name => axios.get(`${ticketmaster_root_url}events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}`)
        // );

        for (const [index, name] of artistNames.entries()){
            try{
                const response = await axios.get(`${ticketmaster_root_url}events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}`);

                let events = response.data._embedded?.events ?? [];

                // Map the events
                let artistEvents = events.map(event => ({
                    name: event.name,
                    date: event.dates.start.localDate,
                    time: event.dates.start.localTime,
                    url: event.url,
                    images_url: event.images[0].url
                }));

                // Add this artist and their events to the allArtistsEvents array
                allArtistsEvents.push({
                    artistName: name,
                    events: artistEvents,
                });

            } catch (error) {
                console.error(`Error fetching events for artist ${name}:`, error.response ? error.response.data : error.message);
                allArtistsEvents.push({
                    artistName: name,
                    events: [],
                });
            }

            //A delay to avoid hitting the rate limit
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
        }

        allArtistsEvents.forEach(artist => {
            artist.events = artist.events.filter(event => {
                // Check if the event has a 'url' attribute and it's a non-empty string
                return event.url && typeof event.url === 'string' && event.url.trim() !== '';
            });
        });
        console.log('All Artists Events:', allArtistsEvents);

        // Fetch the user's gallery from the database
        let gallery = await Spotify.findOne({ id: user_id });

        let allEvents_artist = allArtistsEvents;

        allEvents_artist.forEach(artistEvents => {
            let artistIndex = gallery.artist.findIndex(a => a.name === artistEvents.artistName);

            if (artistIndex === -1) {
                // Artist does not exist, add a new artist entry
                gallery.artist.push({
                    name: artistEvents.artistName,
                    ticket: artistEvents.events,
                    image: artistEvents.images
                });
            } else {
                // Artist exists, update their events
                gallery.artist[artistIndex].ticket = artistEvents.events;
            }
        });

        // Save the updated gallery
        console.log(gallery);
        await gallery.save();
        const artists = await Spotify.findOne({spotifyId: user_id})

        // res.render('events', { events: allArtistsEvents });
        res.json({ events: allArtistsEvents })

    } catch (error) {
        console.error('Error fetching events for artists:', error);
        res.status(500).send('An error occurred while fetching events');
    }
});

//:) nothing
router.get('/events/fun', (req, res) => {res.status(418).send("I'm a teapot"); });

module.exports = router;