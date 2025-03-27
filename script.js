/* Variables globales */
let searchInput = document.getElementById("searchInput");
let suggestionsList = document.getElementById("suggestionsList");
let favoritesList = document.getElementById("favoritesList");
let citiesData = [];
let currentSuggestionIndex = -1;

/* Fonction principale : récupération de la météo */
async function meteo() {
    hideSuggestionsList();

    let city = searchInput.value;
    if (!city) {
        alert("Veuillez entrer une ville !");
        return;
    }

    try {
        // Récupérer la géolocalisation
        let geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`);
        let geoData = await geoResponse.json();

        if (!geoData.results) {
            document.getElementById("message").innerHTML = "❌ Ville non trouvée !";
            return;
        }

        let latitude = geoData.results[0].latitude;
        let longitude = geoData.results[0].longitude;
        let cityName = geoData.results[0].name;

        // Récupérer la météo actuelle
        let weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe/Paris`);
        let weatherData = await weatherResponse.json();
        let currentWeather = weatherData.current_weather;
        let weatherCode = currentWeather.weathercode;
        let icon = getWeatherIcon(weatherCode);

        let weatherHTML = `
            <i id="icon" class="${icon}"></i>
            <div id="temperature">${currentWeather.temperature}°C</div>
            <div id="ville">${cityName}</div>
        `;
        document.getElementById("weatherResult").innerHTML = weatherHTML;

        // Récupérer les prévisions sur 7 jours
        let forecastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weathercode&timezone=Europe/Paris`);
        let forecastData = await forecastResponse.json();

        let forecastHTML = `<h3>Prévisions sur 7 jours</h3><div class="forecast-container">`;
        for (let i = 0; i < 7; i++) {
            let temp = forecastData.daily.temperature_2m_max[i];
            let dayCode = forecastData.daily.weathercode[i];
            let dayIcon = getWeatherIcon(dayCode);

            forecastHTML += `
                <div class="forecast-box">
                    <div class="forecast-day">J+${i + 1}</div>
                    <i class="${dayIcon}"></i>
                    <div class="forecast-temp">${temp}°C</div>
                </div>
            `;
        }
        forecastHTML += `</div>`;
        document.getElementById("weatherForecast").innerHTML = forecastHTML;

        // Réinitialiser et masquer la liste de suggestions
        suggestionsList.innerHTML = '';
        setBackground(weatherCode);
        refreshFavBouton();

    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("weatherResult").innerHTML = "❌ Erreur lors de la récupération des données.";
    }
}

/* Choix de l'icône en fonction du code météo */
function getWeatherIcon(code) {
    const icons = {
        0: "fa-solid fa-sun",
        1: "fa-solid fa-cloud-sun",
        2: "fa-solid fa-cloud-sun",
        3: "fa-solid fa-cloud",
        45: "fa-solid fa-smog",
        48: "fa-solid fa-smog",
        51: "fa-solid fa-cloud-rain",
        53: "fa-solid fa-cloud-showers-heavy",
        55: "fa-solid fa-cloud-showers-heavy",
        61: "fa-solid fa-cloud-rain",
        63: "fa-solid fa-cloud-showers-heavy",
        65: "fa-solid fa-cloud-showers-heavy",
        66: "fa-solid fa-snowflake",
        67: "fa-solid fa-snowflake",
        71: "fa-solid fa-snowflake",
        73: "fa-solid fa-snowflake",
        75: "fa-solid fa-snowman",
        77: "fa-solid fa-snowflake",
        80: "fa-solid fa-cloud-rain",
        81: "fa-solid fa-cloud-showers-heavy",
        82: "fa-solid fa-bolt",
        85: "fa-solid fa-snowflake",
        86: "fa-solid fa-snowflake",
        95: "fa-solid fa-bolt",
        96: "fa-solid fa-cloud-bolt",
        99: "fa-solid fa-cloud-bolt",
    };
    return icons[code] || "fa-solid fa-question-circle";
}

/* Modifier le fond en fonction du code météo */
function setBackground(code) {
    if (code == 0) {
        document.body.style.backgroundImage = "url('images/sun.jpg')";
    } else if (code <= 3) {
        document.body.style.backgroundImage = "url('images/cloud.jpg')";
    } else if (code <= 55) {
        document.body.style.backgroundImage = "url('images/brouillard.jpg')";
    } else if (code <= 67) {
        document.body.style.backgroundImage = "url('images/pluie.jpg')";
    } else if ((code >= 71 && code <= 77) || code == 85 || code == 86) {
        document.body.style.backgroundImage = "url('images/neige.jpg')";
    } else if (code <= 81) {
        document.body.style.backgroundImage = "url('images/pluie.jpg')";
    } else {
        document.body.style.backgroundImage = "url('images/orage.jpg')";
    }
}

/* Chargement des données de villes */
fetch('cities5000.json')
    .then(response => response.json())
    .then(data => {
        citiesData = data;
    })
    .catch(error => {
        console.error("Erreur lors du chargement du fichier JSON :", error);
    });

/* Recherche de villes */
async function searchCity() {
    let input = searchInput.value.toLowerCase();
    suggestionsList.innerHTML = '';

    if (input === '') {
        hideSuggestionsList();
        return;
    }

    let filteredCities = await filterCities(input);

    let uniqueCities = [];
    let seenCities = new Set();
    filteredCities.forEach(city => {
        let cityKey = `${city.city}, ${city.country}`.toLowerCase();
        if (!seenCities.has(cityKey)) {
            seenCities.add(cityKey);
            uniqueCities.push(city);
        }
    });
    uniqueCities = uniqueCities.slice(0, 5);

    uniqueCities.forEach(city => {
        let li = document.createElement('li');
        li.textContent = `${city.city}, ${city.country}`;
        li.onclick = function () {
            searchInput.value = city.city;
            suggestionsList.innerHTML = '';
            meteo();
        };
        suggestionsList.appendChild(li);
    });

    if (uniqueCities.length > 0) {
        showSuggestionsList();
    } else {
        hideSuggestionsList();
    }
}

/* Filtrer les villes */
async function filterCities(input) {
    return citiesData.filter(city => city.city.toLowerCase().includes(input));
}

/* Utilitaire : obtenir la date */
function getDate(daysAgo) {
    let date = new Date();
    date.setDate(date.getDate() + daysAgo);
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
}

/* Masquer la liste des suggestions */
function hideSuggestionsList() {
    suggestionsList.style.display = "none";
    suggestionsList.innerHTML = '';
}

/* Afficher la liste des suggestions */
function showSuggestionsList() {
    suggestionsList.style.display = "block";
}

/* Afficher les favoris */
function displayFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p>Aucun favori pour le moment.</p>';
        return;
    }

    favorites.forEach(city => {
        let li = document.createElement('li');
        li.textContent = city;
        li.onclick = function () {
            searchInput.value = city;
            meteo();
        };
        favoritesList.appendChild(li);
    });
}

/* Gestion du bouton favori */
function toggleFavorite() {
    let favButton = document.getElementById("favButton");
    let cityName = document.getElementById("ville")?.textContent;
    if (!cityName) return;

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.includes(cityName)) {
        favorites = favorites.filter(city => city !== cityName);
        favButton.classList.remove("fa-solid");
        favButton.classList.add("fa-regular");
    } else {
        favorites.push(cityName);
        favButton.classList.remove("fa-regular");
        favButton.classList.add("fa-solid");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    displayFavorites();
}

/* Positionnement du bouton favori */
function refreshFavBouton() {
    let favButton = document.getElementById('favButton');
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let cityName = document.getElementById("ville")?.textContent;

    let coordBox = document.getElementById('weatherResult').getBoundingClientRect();
    favButton.style.top = (coordBox.top + 10) + 'px';
    favButton.style.right = (coordBox.left + 10) + 'px';
    favButton.style.zIndex = 10;
    favButton.style.display = "block";

    if (favorites.includes(cityName)) {
        favButton.classList.remove("fa-regular");
        favButton.classList.add("fa-solid");
    } else {
        favButton.classList.add("fa-regular");
        favButton.classList.remove("fa-solid");
    }
}

/* Redimensionnement de la fenêtre */
let resizeTimeout;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        refreshFavBouton();
    }, 200);
});

/* Appeler displayFavorites au démarrage de la page */
document.addEventListener('DOMContentLoaded', function () {
    console.log("Page chargée, appel de displayFavorites()");
    displayFavorites();
});


searchInput.addEventListener("blur", () => {
    suggestionsList.style.display = 'none';
})

searchInput.addEventListener("focus", () => {
    searchCity();
})