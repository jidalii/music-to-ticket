const express = require("express");
const axios = require('axios');
const router = express.Router();
const User = require('../model/user');
const Spotify = require('../model/gallery');

const ticketmaster_root_url = "https://app.ticketmaster.com/discovery/v2/"
const API_KEY = process.env.TICKETMASTER_CLIENT_ID

/**
 * Retrieves access_token for a given user)d from the User model.
 * @param {string} userId - The ID of the user whose playlist is to be retrieved.
 * @returns {string} access_token of `userId`
 */
const getAccessToken = async (userId) => {

    const user = await User.findOne(
        {
            spotifyId: userId
        }
    ) // find user in mongodb with userId

    if (user === null) {
        return res.status(404).send('user not found');
    }
    // console.log(user);
    if (!user.accessToken) {
        return res.status(404).send('Access token not found');
    }
    return user.accessToken.toString();
}

/**
 * Updates a playlist for a given user ID from the Spotify model.
 * @param {string} userId - The ID of the user whose playlist is to be retrieved.
 */
const updatePlaylist = async (userId) => {
    try{
        // 1. get userId & access_token
        const accessToken = await getAccessToken(userId);

        // 2. api call -> get playlists info
        const response = await axios.get(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        // 3. parse playlist info
        const playlist_ls = [];
        response.data.items.forEach(item => {
            playlist = {name: item.name, id: item.id}
            playlist_ls.push(playlist);
        });

        // 4. store in mongodb
        try{
            await Spotify.findOneAndUpdate(
                { 'id': userId }, // The filter to find the document
                { $set: {playlist: playlist_ls} }, // The update operation
                { upsert: true, new: true }
            );

            return playlist_ls;
        } catch(error){
            console.log('Error in upsert:', error);
        }
    } catch (error) {
        // If the token is invalid or expired, Spotify API will return a 401 - Unauthorized error
        if (error.response && error.response.status === 401) {
            // Handle token expiration, refresh the token if possible
            console.error('Access token expired');
        } else {
            console.error('Error calling Spotify API:', error);
        }
    }
}


/**
 * Retrieves a playlist for a given user ID from the Spotify model.
 * @param {string} userId - The ID of the user whose playlist is to be retrieved.
 * @returns {Promise<json[]>} A promise that resolves to an array of playlist objects.
 */
const getPlaylist = async(user_id) => {
    const playlist_obj = await Spotify.findOne({id: user_id}, 'playlist');
    return playlist_obj.playlist;
}


/**
 * return playlist of user with id `userId`
 */
router.get('/v0/playlist', async(req, res) => {
    try{
        // 1. get userId 
        // console.log("v0.playlist", req.session.user.spotifyId);
        const userId = req.session.user.spotifyId
        // 2. get playlists
        playlists = await updatePlaylist(userId);

        res.json(playlists)
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


router.get('/v0/artist', async (req, res)=> {
    try{
        // params for api call
        console.log("v0/artist", req.session.user);
        const userId = req.session.user.spotifyId;
        // const ACCESS_TOKEN = await getAccessToken(userId);
        const ACCESS_TOKEN = req.session.user.accessToken;

        // update user's playlist info
        await updatePlaylist(userId);

        // get user's all playlist
        const playlist_ls = await getPlaylist(userId);

        // store artist object as list
        const artistId_ls = [];
        // api call to get all artists of all playlist
        for(const playlist of playlist_ls) {
            const playlist_id = playlist.id
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            });
            response.data.items.forEach(item => {
                item.track.artists.forEach(artist => {
                    if (!artistId_ls.includes(artist.id)){
                        artistId_ls.push(artist.id);
                    }
                });
            });
        }
        const combinedString = artistId_ls.join(',');
        const artistDetails= await axios.get(`https://api.spotify.com/v1/artists?ids=${combinedString}`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        const artistRows = artistDetails.data.artists;
        const artistNameList = artistRows.map(response => response.name);
        // console.log(artistNameList);
        const artistData = artistRows.map(response => ({
            id: response.id,
            name: response.name,
            image: response.images.slice(0, 3) // Taking the last image as an example
        }));

        let allArtistsEvents = [];

        for (const [index, name] of artistNameList.entries()){
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


        allArtistsEvents.forEach(artistEvents => {
            // let artistIndex = gallery.artist.findIndex(a => a.name === artistEvents.artistName);
            let artistIndex = artistData.findIndex(a => a.name === artistEvents.artistName);

            if (artistIndex === -1) {
                // Artist does not exist, add a new artist entry
                artistData.push({
                    name: artistEvents.artistName,
                    ticket: artistEvents.events,
                    image: artistEvents.images
                });
            } else {
                // Artist exists, update their events
                artistData[artistIndex].ticket = artistEvents.events;
            }
        });
        try{
            const query = {'id': userId}
            const update = {'$addToSet': {artist: {$each: artistData}}};
            await Spotify.updateOne(
                query, // The filter to find the document
                update, // The update operation
                { upsert: true, new: true }
            );
            res.json(artistData);
        } catch(error) {
            console.log('Error in upsert:', error);
        }

        // res.json(artistData)
        
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


router.get('/v0/top3-artist', async(req, res) => {
    console.log("top3-artist", req.session.user);
    const userId = req.session.user.spotifyId
    // const ACCESS_TOKEN = await getAccessToken(userId);
    const ACCESS_TOKEN = req.session.user.accessToken;

    // update user's playlist info
    await updatePlaylist(userId);

    // get user's all playlist
    const playlist_ls = await getPlaylist(userId);

    // store artist object as list
    let artistId_ls = {};
    let songList = {}

    for(const playlist of playlist_ls) {
        const playlist_id = playlist.id
        const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        response.data.items.forEach(item => {
            item.track.artists.forEach(artist => {
                if(artist.id in artistId_ls) {
                    artistId_ls[artist.id] += 1;
                } else {
                    artistId_ls[artist.id] = 1;
                }
                
            });
        });
        response.data.items.forEach(item => {
            if (item.track.artists[0].id in songList) {
                songList[item.track.artists[0].id].push(item.track.name);
            } else {
                songList[item.track.artists[0].id] = []
                songList[item.track.artists[0].id].push(item.track.name);
            }
        });
    }
    let artistIdSorted = Object.entries(artistId_ls).sort((a, b) => {
        return b[1] - a[1]; // Compare the values
    });
    let topArtists = []
    if (artistIdSorted.length >=3) {
        for(let i=0; i<3; i++) {
            topArtists.push(artistIdSorted.at(i).at(0))
        }
    }
    const combinedString = topArtists.join(',');
    const artistDetails= await axios.get(`https://api.spotify.com/v1/artists?ids=${combinedString}`, {
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
    });

    const artistRows = artistDetails.data.artists;
    const artistData = artistRows.map(response => ({
        id: response.id,
        name: response.name,
        type: response.genres.at(0),
        song: songList[response.id].length>=3 ? songList[response.id].slice(0, 3) : [],
        image: response.images.at(0).url // Taking the last image as an example
    }));

    res.json(artistData);
})

module.exports = router;