# CS411 Group Project

- link for the demo video: https://drive.google.com/file/d/1uLln5RkRZ5MiQZSWu3nQftBOn2Y73JSK/view?usp=share_link

## 1. Team
Jida Li, Runqing Cui, Wanting Ma, Yuanman Mu

## 2. Description

Our project is an web application of users' own spotify library with info about the artists' concerts based on their playlists and saved albums.

As for the concert info, the website illustrates the date and location of concerts, and shows the price range of different seats, similiar to the funtionality in Google Flight.

The entry of the website is the login interface. After the user logs in, users would be redirect to their spotify library. When user hook the mouse on the artists of the songs, the website would show the concerts of the artists they like.

## 3. Oauth

We would be using Spotify Oauth.

## 4. Database

We would be using MangoDB for the database

## 5. API

1. Spotify API
2. Ticketmaster API

## 6. Framework

- frontend: React.ts
- backend: Express.js

## 7. Get ready to run

### 1) npm install & .env

```bash
$ cd ./client
$ npm install
$ cd ../server
$ npm ./install
```

- you MUST place ```.env``` file in ```./server```

### 2) start server

```bash
$ cd ./server
$ npm start
```

- server url: http://localhost:8000

### 3) start client

```bash
$ cd ./client
$ vite
```

- client url: http://localhost:5173/