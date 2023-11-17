const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    spotifyId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    username: String,
    avatar: String,
    country: String,
    accessToken: String,
    refreshToken: String,
    expires_in: Number,
    provider: String
});

module.exports = mongoose.model('User', userSchema, 'user')


