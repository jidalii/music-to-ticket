const express = require("express");
const passport = require('passport');
const axios = require('axios');
const router = express.Router();
const mongoose = require("mongoose");
const User = require('../model/user');
const Spotify = require('../model/gallery');
const Ticket = require('../model/ticket');

const getAccessToken = async (spotifyId) => {
    console.log(spotifyId);
    const user = await User.findOne({ spotifyId: spotifyId });
    /*const user = await User.findOne(
        {
            spotifyId: "31525gofi436ryheps2haspy5kq4"
        },
    )*/
    // console.log(user);
    if (!user) {
        return res.status(404).send('User not found');
    }

    if (!user.accessToken) {
        return res.status(404).send('Access token not found');
    }
    return user.accessToken.toString();
}

const updatePlaylist = async (spotifyId) => {
    try{
        // api params
        const ACCESS_TOKEN = await getAccessToken();
        if (!ACCESS_TOKEN) {
            throw new Error('Access token not found');
        }

        // api call
        const response = await axios.get(`https://api.spotify.com/v1/users/${spotifyId}/playlists`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });

        // clean returned values
        const playlist_ls = [];
        response.data.items.forEach(item => {
            playlist_ls.push(item.id);
        });


        // store in mongodb
        //const user_id = '31525gofi436ryheps2haspy5kq4'; //31lbzo6ubfwku5s5xxmlhaxxooz4
        try{
            /*await Spotify.findOneAndUpdate(
                { 'id': spotifyId }, // The filter to find the document
                { $set: {playlist: playlist_ls} }, // The update operation
                { upsert: true, new: true }
            );*/

            let galleryEntry = await Spotify.findOne({ id: spotifyId });

            if (galleryEntry) {
                // Update existing gallery entry
                galleryEntry.playlist = playlist_ls;
                await galleryEntry.save();
            } else {
                // Create a new gallery entry
                galleryEntry = new Spotify({
                    id: spotifyId,
                    playlist: playlist_ls
                });
                await galleryEntry.save();
            }


            console.log("Playlist updated for user:", spotifyId);
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

const getPlaylist = async(spotifyId) => {
    const playlist_obj = await Spotify.findOne({id: spotifyId}, 'playlist');
    // console.log(playlist_obj.playlist);
    return playlist_obj.playlist;
}

router.get('/v0/playlist', async(req, res) => {
    try{
        const ACCESS_TOKEN = await getAccessToken();
        const USER_ID = req.query.spotifyId;
        const response = await axios.get(`https://api.spotify.com/v1/users/${USER_ID}/playlists`, {
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            }
        });
        // console.log(response.data.item.id);
        const playlist_ls = [];
        response.data.items.forEach(item => {
            playlist_ls.push(item.id);
        });
        const user_id = req.session.spotifyId;
        // store in mongodb
        try{
            await Spotify.findOneAndUpdate(
                { 'id': user_id }, // The filter to find the document
                { $set: {playlist: playlist_ls} }, // The update operation
                { upsert: true, new: true }
            );
            res.json(playlist_ls);
        } catch(error){
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

router.get('/v0/artist', async (req, res)=> {
    try{
        // params for api call
        const ACCESS_TOKEN = await getAccessToken();
        const user_id = req.session.spotifyId;

        // update user's playlist info
        await updatePlaylist();
        // console.log("update playlist");

        // get user's all playlist
        const playlist_ls = await getPlaylist(user_id);

        // store artist object as list
        const artistId_ls = [];
        // api call to get all artists of all playlist
        for(const playlist_id of playlist_ls) {
            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                }
            });
            response.data.items.forEach(item => {

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
        // const artistDetails = await Promise.all(
        //     artistId_ls.map(id =>
        //         axios.get(`https://api.spotify.com/v1/artists/${id}`,{
        //             headers: {
        //                 'Authorization': `Bearer ${ACCESS_TOKEN}`
        //             }
        //         })
        //     )
        // );
        const artistRows = artistDetails.data.artists;
        console.log(artistRows[0]);
        const artistData = artistRows.map(response => ({
            id: response.id,
            name: response.name,
            image: response.images.slice(0, 3) // Taking the last image as an example
        }));

        try{
            const query = {'id': user_id}
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