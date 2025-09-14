// Elements
const form = document.getElementById('form');
const search = document.getElementById('search');
const cityLine = document.getElementById('cityLine');
const valueLine = document.getElementById('valueLine');
const tabs = document.querySelectorAll('.tabs .tab');

// State
let place = null;             // { name, country, lat, lon }
let tab = 'temperatures';     // 'temperatures' | 'conditions' | 'wind'

// Constants
const API_GEOCODE  = 'https://geocoding-api.open-meteo.com/v1/search';
const API_FORECAST = 'https://api.open-meteo.com/v1/forecast';
const WMO = {
  0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',
  45:'Fog',48:'Depositing rime fog',
  51:'Drizzle: Light',53:'Drizzle: Moderate',55:'Drizzle: Dense',
  56:'Freezing drizzle: Light',57:'Freezing drizzle: Dense',
  61:'Rain: Slight',63:'Rain: Moderate',65:'Rain: Heavy',
  66:'Freezing rain: Light',67:'Freezing rain: Heavy',
  71:'Snowfall: Slight',73:'Snowfall: Moderate',75:'Snowfall: Heavy',
  77:'Snow grains',
  80:'Rain showers: Slight',81:'Rain showers: Moderate',82:'Rain showers: Violent',
  85:'Snow showers: Slight',86:'Snow showers: Heavy',
  95:'Thunderstorm',96:'Thunderstorm with slight hail',99:'Thunderstorm with heavy hail'
};

// UI helpers
const setActive = (t) => tabs.forEach(a => a.classList.toggle('active', a.dataset.tab === t));
const show = (msg) => { cityLine.textContent = place ? `${place.name} — ${place.country}` : '—'; valueLine.textContent = msg; };

// --- API
async function geocode(city) {
  const url = API_GEOCODE  + '?name=' + encodeURIComponent(city)  + '&count=1&language=en';
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error('City not found');
  const g = data.results[0];
  return { name: g.name, 
	        country: g.country, 
			  lat: g.latitude, 
			  lon: g.longitude };
}

// Get current data for city
async function getCurrent({ lat, lon }) {
const url = API_FORECAST
  + '?latitude='  + encodeURIComponent(lat)
  + '&longitude=' + encodeURIComponent(lon)
  + '&current_weather=true'
  + '&temperature_unit=fahrenheit'
  + '&wind_speed_unit=mph';

  const res = await fetch(url);
  return res.json();
}

// Render
async function render() {
  show('Loading…');
  try {
    const { current_weather: cw } = await getCurrent(place);
    if (!cw) throw new Error('No data');

    let value;
    switch (tab) {
      case 'conditions': value = WMO[cw.weathercode]; break;
      case 'wind':       value = `${cw.windspeed} mph`; break;
      default:           value = `${cw.temperature} °F`;
    }
    cityLine.textContent = `${place.name} — ${place.country}`;
    valueLine.textContent = value;
  } catch {
    valueLine.textContent = 'Load error';
  }
}

// Events for search form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = search.value.trim();
  if (!q) return;
  show('Loading…');
  try {
    place = await geocode(q);
    render();
  } catch (err) {
    place = null;
    show(err.message || 'Geocoding error');
  }
});

tabs.forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();     
    tab = a.dataset.tab; 
    setActive(tab);
    render(); 
  });
});

// Init
setActive(tab);