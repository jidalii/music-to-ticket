const mongoose = require('mongoose');
const ImageSchema = new mongoose.Schema({
    url: String,
    width: Number,
    height: Number
}, { _id: false });
const artistSchema = new mongoose.Schema({
    id: String,
    name: String,
    image: [ImageSchema]
}, { _id: false });

const userSchema = new mongoose.Schema({
    id: String,
    playlist: [String],
    artist: [artistSchema]
});

module.exports = mongoose.model('Gallery', userSchema, 'gallery');
// module.exports = mongoose.model('Artist', artistSchema, );