🎬 FlickFinder

A responsive movie discovery web application built with HTML, CSS, and JavaScript, powered by the TMDb API.
Search movies in real time, view detailed information, save your favorites, and switch between light/dark themes — all in a clean and modern UI.

🚀 Features
🔎 Instant Movie Search (Debounced)

Results update dynamically as you type.

Prevents unnecessary API calls using debouncing.

🎞 Movie Details Modal

Click any movie to open a popup showing:

Poster

Overview

Release year

Rating

Runtime

Trailer link (YouTube)

❤️ Favorites (Saved in LocalStorage)

Save/remove favorite movies with one click.

Favorites persist even after refreshing or closing the browser.

🌗 Light & Dark Theme Toggle

Switch between light/dark mode.

Theme preference is stored using LocalStorage.

🧩 Fallback & Error Handling

Shows fallback image when a poster is unavailable.

Friendly “movie not found” messages.

📱 Fully Responsive

Works smoothly across desktop, tablet, and mobile.

🛠️ Tech Stack

HTML5

CSS3

JavaScript (ES6+)

TMDb API


📂 Project Structure
FlickFinder/
│
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── config.js              
│   └── config.sample.js  
├── assets/
│   ├── no-poster.png
│   └── movie-not-found.png
└── .gitignore

🔑 Setting Up the TMDb API Key

Create a TMDb account: https://www.themoviedb.org/

Go to Settings → API

Copy your API Key (v3)

Create the file:

js/config.js


Add your key:

const API_KEY = "YOUR_TMDB_API_KEY";


Ensure it is ignored by Git:

js/config.js

🏃 How to Run Locally

Clone the repository:

git clone https://github.com/YOUR_USERNAME/FlickFinder.git


Open the project folder in VS Code.

Install the “Live Server” extension.

Right-click index.html → Open with Live Server.

⭐ Future Improvements

Add user authentication

Sync favorites to database

Add genres filter

Add infinite scrolling

Host backend to secure API key

Add trending/now playing sections

📝 License

This project is open-source. Feel free to use or modify it