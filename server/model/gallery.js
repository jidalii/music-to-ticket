const mongoose = require('mongoose');

playlistSchema = new mongoose.Schema({
    name: String,
    id: String
}, { _id: false })
const ImageSchema = new mongoose.Schema({
    url: String,
    width: Number,
    height: Number
}, { _id: false });

const ticketSchema = new mongoose.Schema({
    name: String,
    date: String,
    time: String,
    url: String,
    images_url: String
}, { _id: false });

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