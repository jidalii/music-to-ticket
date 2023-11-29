# music_to_ticket
A website allows Spotify users find concerts of their favorite artists while enjoying music (work-in-progress)
CS411 Group Project

1. Description

Our project is an web application of users' own spotify library with info about the artists' concerts based on their playlists and saved albums. Users can also play songs in their library.

As for the concert info, the website illustrates the date and location of concerts, and shows the price range of different seats, similiar to the funtionality in Google Flight.

The entry of the website is the login interface. After the user logs in, users would be redirect to their spotify library. When user hook the mouse on the artists of the songs, the website would show the concerts of the artists nearby (users can set the range to define "nearby").

2. Oauth

We would be using Spotify Oauth.

3. Database

We would be using MangoDB for the database

4. API

Spotify API
Ticketmaster API
Google Map API
5. Framework

frontend: TypeScript
backend: Express.js
6. Get ready to run

1) npm install & .env

$ cd ./client
$ npm install
$ cd ../server
$ npm ./install
you MUST place .env file in ./server
2) start server

$ cd ./server
$ npm start
server url: http://localhost:8000
3) start client

$ cd ./client
$ vite
client url: http://localhost:5173/
