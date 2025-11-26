
//const API_KEY = 'your key';
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w342';
const NO_POSTER = 'assets/no-poster.png';

// DOM refs
const grid = document.getElementById('grid');
const searchInput = document.getElementById('search');
const themeToggle = document.getElementById('themeToggle');
const favViewBtn = document.getElementById('favViewBtn');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

// Local storage keys
const PREFS_KEY = 'movie_app_prefs_v1';
const FAV_KEY = 'movie_app_favs_v1';

// Utility: simple fetch wrapper
async function tmdb(path, params = '') {
  const url = `${BASE}${path}?api_key=${API_KEY}${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDb fetch failed: ${res.status}`);
  return res.json();
}

//  Preferences (theme)
const prefs = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
if (prefs.theme === 'dark') document.documentElement.classList.add('dark');

themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  prefs.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
});

//  Favorites 
function loadFavs() {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
  catch { return []; }
}
function saveFavs(arr) { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); }
function isFav(id) { return loadFavs().includes(id); }
function toggleFavorite(movie) {
  const favs = loadFavs();
  const idx = favs.indexOf(movie.id);
  if (idx === -1) {
    favs.push(movie.id);
    saveFavs(favs);
  
  } else {
    favs.splice(idx, 1);
    saveFavs(favs);
  }
}

// UI--create movie card
function createCard(m) {
  const el = document.createElement('article');
  el.className = 'card';
  el.dataset.id = m.id;

  const poster = m.poster_path ? IMG + m.poster_path : NO_POSTER;

  el.innerHTML = `
    <div class="card-top">
      <img src="${poster}" alt="${escapeHtml(m.title)} poster" />
      <button class="fav-btn" aria-label="Toggle favorite" aria-pressed="false">♡</button>
    </div>
    <div class="card-body">
      <h3>${escapeHtml(m.title)}</h3>
      <p>⭐ ${m.vote_average ? m.vote_average.toFixed(1) : '—'} ${m.release_date ? '| ' + m.release_date.slice(0,4) : ''}</p>
    </div>
  `;

  // favorite button
  const favBtn = el.querySelector('.fav-btn');
  updateFavButton(favBtn, m.id);
  favBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    toggleFavorite(m);
    updateFavButton(favBtn, m.id);
  });


  el.addEventListener('click', () => openDetails(m.id));

  return el;
}
function updateFavButton(btn, id) {
  const pressed = isFav(id);
  btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  btn.textContent = pressed ? '♥' : '♡';
}


function escapeHtml(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Show popular movies
async function showPopular() {
  grid.innerHTML = 'Loading...';
  try {
    const data = await tmdb('/movie/popular', '&language=en-US&page=1');
    grid.innerHTML = '';
    data.results.slice(0,24).forEach(m => grid.appendChild(createCard(m)));
  } catch (err) {
    console.error(err);
    grid.innerText = 'Failed to load movies';
  }
}

// debounce Searching
let debounceTimer = null;
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim();
  clearTimeout(debounceTimer);
  if (!q) {
    debounceTimer = setTimeout(showPopular, 250);
    return;
  }
  debounceTimer = setTimeout(() => searchMovies(q), 400);
});

async function searchMovies(query) {
  grid.innerHTML = 'Searching...';
  try {
    const data = await tmdb('/search/movie', `&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`);
    grid.innerHTML = '';
    if (!data.results || data.results.length === 0) {
      grid.innerText = 'No results found';
      return;
    }
    data.results.slice(0,40).forEach(m => grid.appendChild(createCard(m)));
  } catch (err) {
    console.error(err);
    grid.innerText = 'Search failed';
  }
}

// Favorites view
favViewBtn.addEventListener('click', async () => {
  const ids = loadFavs();
  if (!ids.length) {
    grid.innerText = 'No favorites yet';
    return;
  }
  grid.innerHTML = 'Loading favorites...';
  try {
    // fetch each movie by id
    const movies = await Promise.all(ids.map(id => tmdb(`/movie/${id}`, '&language=en-US')));
    grid.innerHTML = '';
    movies.forEach(m => grid.appendChild(createCard(m)));
  } catch (err) {
    console.error(err);
    grid.innerText = 'Failed to load favorites';
  }
});


modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (ev) => {
  if (ev.target === modal) closeModal();
});
function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
  modalContent.innerHTML = '';
}

async function openDetails(movieId) {
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
  modalContent.innerHTML = 'Loading details...';
  try {
    const movie = await tmdb(`/movie/${movieId}`, '&language=en-US');
    const vids = await tmdb(`/movie/${movieId}/videos`, '&language=en-US');
    const trailer = vids.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');

    const poster = movie.poster_path ? IMG + movie.poster_path : NO_POSTER;
    modalContent.innerHTML = `
      <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
        <img src="${poster}" alt="${escapeHtml(movie.title)} poster" style="width:160px;border-radius:8px;flex:0 0 160px" />
        <div style="flex:1;min-width:200px">
          <h2>${escapeHtml(movie.title)} ${movie.release_date ? '(' + movie.release_date.slice(0,4) + ')' : ''}</h2>
          <p style="color:var(--muted);margin-top:6px">${escapeHtml(movie.tagline || '')}</p>
          <p style="margin-top:8px;color:var(--muted)">${escapeHtml(movie.overview || 'No overview available.')}</p>
          <p style="margin-top:8px;color:var(--muted)">
            <strong>Rating:</strong> ${movie.vote_average ? movie.vote_average.toFixed(1) : '—'}
            ${movie.runtime ? ' • ' + movie.runtime + ' min' : ''}
          </p>
          ${trailer ? `<p style="margin-top:10px"><a target="_blank" rel="noopener" href="https://www.youtube.com/watch?v=${trailer.key}">Watch Trailer on YouTube</a></p>` : ''}
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    modalContent.innerText = 'Failed to load details';
  }
}

// Initialization
(function init() {
  if (!API_KEY || API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
    grid.innerHTML = `<div style="padding:20px;background:#fff;border-radius:8px">Please add your TMDb API key to <code>js/app.js</code> (replace YOUR_TMDB_API_KEY_HERE) and reload the page.</div>`;
    return;
  }
  showPopular();
})();
