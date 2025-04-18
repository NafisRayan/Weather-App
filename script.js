const country = document.querySelector("#country");
const city = document.querySelector("#city");
const check = document.querySelector("#check");
const tempIcon = document.querySelector("#tempIcon");
const weatherCountry = document.querySelector("#weatherCountry");
const temperature = document.querySelector("#temperature");
const weatherDescription = document.querySelector("#weatherDescription");
const feelsLike = document.querySelector("#feelsLike");
const humidity = document.querySelector("#humidity");
const longitude = document.querySelector("#longitude");
const latitude = document.querySelector("#latitude");
const defaultCitiesContainer = document.querySelector("#default-cities-container"); // New container

const API_KEY = 'bd4ea33ecf905116d12af172e008dbae'; // API Key constant

const defaultCities = [
    { city: "New York", country: "US" },
    { city: "London", country: "UK" },
    { city: "Dhaka", country: "BD" },
    { city: "Tokyo", country: "JP" }
];

// Add loading state
function setLoading(isLoading) {
    const searchBtn = check;
    if (isLoading) {
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchBtn.disabled = true;
    } else {
        searchBtn.innerHTML = '<i class="fas fa-search"></i><span>Search</span>';
        searchBtn.disabled = false;
    }
}

// Format weather data
function formatTemp(temp) {
    return Math.round(temp);
}

// Update weather icon
function updateWeatherIcon(weatherId) {
    tempIcon.style.opacity = '0';
    
    setTimeout(() => {
        if (weatherId < 250) {
            tempIcon.src = 'tempicons/storm.svg';
        } else if (weatherId < 350) {
            tempIcon.src = 'tempicons/drizzle.svg';
        } else if (weatherId < 550) {
            tempIcon.src = 'tempicons/snow.svg';
        } else if (weatherId < 650) {
            tempIcon.src = 'tempicons/rain.svg';
        } else if (weatherId < 800) {
            tempIcon.src = 'tempicons/atmosphere.svg';
        } else if (weatherId === 800) {
            tempIcon.src = 'tempicons/sun.svg';
        } else if (weatherId > 800) {
            tempIcon.src = 'tempicons/clouds.svg';
        }
        
        setTimeout(() => {
            tempIcon.style.opacity = '1';
        }, 100);
    }, 300);
}

// Update background gradient based on weather ID
function updateDynamicBackground(weatherId) {
    let startColor = '#1a202c'; // Default start
    let endColor = '#2d3748';   // Default end

    // Determine colors based on weather ID ranges
    if (weatherId >= 200 && weatherId < 300) { // Thunderstorm
        startColor = '#2c3e50'; 
        endColor = '#4b79a1';
    } else if (weatherId >= 300 && weatherId < 400) { // Drizzle
        startColor = '#757f9a'; 
        endColor = '#d7dde8';
    } else if (weatherId >= 500 && weatherId < 600) { // Rain
        startColor = '#536976'; 
        endColor = '#292e49';
    } else if (weatherId >= 600 && weatherId < 700) { // Snow
        startColor = '#e6dada'; 
        endColor = '#a7c0cd';
    } else if (weatherId >= 700 && weatherId < 800) { // Atmosphere (Mist, Fog, etc.)
        startColor = '#bdc3c7'; 
        endColor = '#2c3e50';
    } else if (weatherId === 800) { // Clear
        startColor = '#2980b9'; 
        endColor = '#6dd5fa'; // Brighter blue sky
    } else if (weatherId > 800) { // Clouds
        startColor = '#606c88'; 
        endColor = '#3f4c6b'; // Greyish blue
    }

    // Set the CSS variables
    document.documentElement.style.setProperty('--bg-gradient-start', startColor);
    document.documentElement.style.setProperty('--bg-gradient-end', endColor);
}


// Handle weather data
function updateWeatherUI(data) {
    // Update location
    weatherCountry.innerText = `${data.name}, ${data.sys.country}`;
    
    // Update temperature
    temperature.innerHTML = `${formatTemp(data.main.temp)}°<strong>C</strong>`;
    
    // Update weather description and icon
    const weather = data.weather[0];
    weatherDescription.innerText = weather.description;
    updateWeatherIcon(weather.id);
    
    // Update weather details
    feelsLike.innerText = `Feels Like ${formatTemp(data.main.feels_like)}°C`;
    humidity.innerText = `Humidity ${data.main.humidity}%`;
    longitude.innerText = `${data.coord.lon.toFixed(2)}`;
    latitude.innerText = `${data.coord.lat.toFixed(2)}`;
    
    // Update dynamic background gradient
    updateDynamicBackground(weather.id); 
}

// Fetch weather data for the main card
async function fetchWeather() {
    const cityVal = city.value.trim();
    const countryVal = country.value.trim();

    if (!cityVal) {
        alert('Please enter a city name');
        return;
    }

    setLoading(true);

    try {
        // Use API_KEY constant
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityVal}${countryVal ? ',' + countryVal : ''}&lang=en&units=metric&appid=${API_KEY}`;

        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'City not found or API error' }));
            throw new Error(errorData.message || 'City not found');
        }

        const data = await response.json();
        updateWeatherUI(data);

        // Clear inputs
        country.value = '';
        city.value = '';

    } catch (error) {
        console.error("Error fetching main weather:", error); // Log error
        alert(error.message);
    } finally {
        setLoading(false);
    }
}

// Fetch weather data for a single default city
async function fetchDefaultCityWeather(cityInfo) {
    try {
        // Use API_KEY constant
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityInfo.city},${cityInfo.country}&lang=en&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Could not fetch weather for ${cityInfo.city}` }));
            throw new Error(errorData.message || `Could not fetch weather for ${cityInfo.city}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching weather for ${cityInfo.city}:`, error);
        // Return null or a specific error object if fetching fails
        return null; 
    }
    // No setLoading here as it's for background loading
}

// Create HTML for a default city card
function createDefaultCityCard(data) {
    if (!data) return ''; // Return empty string if data is null (fetch failed)

    const weather = data.weather[0];
    let iconSrc = 'tempicons/atmosphere.svg'; // Default icon

    if (weather.id < 250) iconSrc = 'tempicons/storm.svg';
    else if (weather.id < 350) iconSrc = 'tempicons/drizzle.svg';
    else if (weather.id < 550) iconSrc = 'tempicons/snow.svg';
    else if (weather.id < 650) iconSrc = 'tempicons/rain.svg';
    // Removed atmosphere check as it's default
    else if (weather.id === 800) iconSrc = 'tempicons/sun.svg';
    else if (weather.id > 800) iconSrc = 'tempicons/clouds.svg';

    return `
        <div class="default-city-card">
            <img src="${iconSrc}" alt="${weather.description}" class="default-city-icon">
            <div class="default-city-info">
                <span class="default-city-name">${data.name}, ${data.sys.country}</span>
                <span class="default-city-temp">${formatTemp(data.main.temp)}°C</span>
            </div>
        </div>
    `;
}

// Load default cities on page load
async function loadDefaultCities() {
    // Add a loading indicator to the container (optional)
    defaultCitiesContainer.innerHTML = '<p class="loading-defaults">Loading default cities...</p>'; 
    
    let cardsHtml = '';
    for (const cityInfo of defaultCities) {
        const weatherData = await fetchDefaultCityWeather(cityInfo);
        cardsHtml += createDefaultCityCard(weatherData);
    }
    
    // Replace loading indicator with cards
    defaultCitiesContainer.innerHTML = cardsHtml || '<p class="loading-defaults-error">Could not load default cities.</p>'; 
}


// Event listeners
check.addEventListener('click', fetchWeather);

// Add keyboard support
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && (document.activeElement === city || document.activeElement === country)) {
        fetchWeather();
    }
});

// Add smooth transitions (keep existing ones)
tempIcon.style.transition = 'opacity 0.3s ease';
// Removed transition for background-overlay as it's no longer used

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadDefaultCities();
    // Optionally, fetch weather for a default location for the main card on load?
    // fetchWeatherForCity({ city: "London", country: "UK" }); // Example
});
