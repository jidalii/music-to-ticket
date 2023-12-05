const express = require("express");
const axios = require('axios');
const router = express.Router();
const User = require('../model/user');
const Spotify = require('../model/gallery');

/**
 * Retrieves access_token for a given user ID from the User model.
 * @param {string} userId - The ID of the user whose playlist is to be retrieved.
 * @returns {string} access_token of the user with id `userId`
 */
const getAccessToken = async (userId) => {
    // console.log(userId); 
    const user = await User.findOne(
        {
            spotifyId: userId
        }
    )

    if (!user) {
        console.log('user not found');
    }
    console.log(user);
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
        console.log(req.session.user);
        const userId = req.session.user.spotifyId;
        const ACCESS_TOKEN = await getAccessToken(userId);
        // console.log(ACCESS_TOKEN);

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
        // console.log(artistRows[0]);
        const artistData = artistRows.map(response => ({
            id: response.id,
            name: response.name,
            image: response.images.slice(0, 3) // Taking the last image as an example
        }));

        try{
            const query = {'id': userId}
            const update = {'$addToSet': {artist: {$each: artistData}}};
            const updateArtistData = await Spotify.updateOne(
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

router.get('/v0/top3-artist', async(req, res) => {
    // console.log("top3", req.session);
    const userId = req.session.user.spotifyId
    const ACCESS_TOKEN = await getAccessToken(userId);

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