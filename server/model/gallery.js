const mongoose = require('mongoose');
const User = require('../model/user');


playlistSchema = new mongoose.Schema({
    name: String,
    id: String
});

const ImageSchema = new mongoose.Schema({
    url: String,
    width: Number,
    height: Number
}, { _id: false });

const ticketSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        ref: 'User',
    },

    events: [{
        name: String,
        date: String,
        time: Object,
        url: String
    }]
});

const artistSchema = new mongoose.Schema({
    id: String,
    name: String,
    ticket: [ticketSchema],
    image: [ImageSchema]
}, { _id: false });

const userSchema = new mongoose.Schema({
    id: String,
    playlist: [playlistSchema],
    artist: [artistSchema]
});



module.exports = mongoose.model('Gallery', userSchema, 'gallery');
// module.exports = mongoose.model('Artist', artistSchema, );