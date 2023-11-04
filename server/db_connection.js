// db.js
const mongoose = require('mongoose');

const mongoString = process.env.DATABASE_URL;

mongoose.connect(mongoString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const database = mongoose.connection;

database.on('error', (error) => {
    console.error('Connection error:', error);
});

database.once('connected', () => {
    console.log('MongoDB Connection Established');
});

module.exports = database;
