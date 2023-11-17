const express = require("express");
const passport = require('passport');
const axios = require('axios');
const router = express.Router();
const mongoose = require("mongoose");
const User = require('../model/user');
const Spotify = require('../model/gallery');

/**
 * Retrieves access_token for a given user ID from the User model.
 * @param {string} userId - The ID of the user whose playlist is to be retrieved.
 * @returns {string} access_token of the user with id `userId`
 */
const getAccessToken = async (userId) => {
    // console.log('acc', userId);
    const user = await User.findOne(
        {
            spotifyId: userId
        }
    )

    if (!user) {
        console.log('user not found');
    }

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
        // const userId = req.query.userId
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
            // console.log(playlist_ls);
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



router.get('/v0/playlist', async(req, res) => {
    try{
        // get userId 
        const userId = req.query.userId;
        // get playlists
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
        const userId = req.query.userId;
        const ACCESS_TOKEN = await getAccessToken(userId);

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
                console.log('item',item);
                item.track.artists.forEach(artist => {
                    // console.log(artist);
                    // artist_list.push({ id: artist.id, name: artist.name, image: artist.images});
                    if (!artistId_ls.includes(artist.id)){
                        artistId_ls.push(artist.id);
                    }
                });
            });
        }
        // console.log(artistId_ls);
        const combinedString = artistId_ls.join(',');
        const artistDetails= await axios.get(`https://api.spotify.com/v1/artists?ids=${combinedString}`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        const artistRows = artistDetails.data.artists;
        // console.log(artistRows[0]);
        const artistData = artistRows.map(response => ({
            id: response.id,
            name: response.name,
            image: response.images.slice(0, 3) // Taking the last image as an example
        }));

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