const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // _id: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
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
    country: String,
    refreshToken: String,
    expires_in: Number,
    // avatarUrl: String,
    provider: String
});

module.exports = mongoose.model('User', userSchema, 'user')


