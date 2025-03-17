async function meteo() {
    let city = document.getElementById("searchInput").value;
    if (!city) {
        alert("Veuillez entrer une ville !");
        return;
    }

    try {
        let geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`);
        let geoData = await geoResponse.json();

        if (!geoData.results) {

            document.getElementById("message").innerHTML = "❌ Ville non trouvée !";
            return;
        }

        let latitude = geoData.results[0].latitude;
        let longitude = geoData.results[0].longitude;
        let cityName = geoData.results[0].name;

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

        // probleme avec currentWeather.city

        document.getElementById("weatherResult").innerHTML = weatherHTML;

        document.getElementById("suggestionsList").innerHTML = '';

    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("weatherResult").innerHTML = "❌ Erreur lors de la récupération des données.";
    }
}

// Fonction pour choisir l'icône en fonction du code météo
function getWeatherIcon(code) {
    let icons = {
        0: "fa-solid fa-sun", // Soleil
        1: "fa-solid fa-cloud-sun", // Légèrement nuageux
        2: "fa-solid fa-cloud-sun", // Partiellement nuageux
        3: "fa-solid fa-cloud", // Nuageux
        45: "fa-solid fa-smog", // Brouillard
        48: "fa-solid fa-smog", // Brouillard givrant
        51: "fa-solid fa-cloud-rain", // Bruine légère
        53: "fa-solid fa-cloud-showers-heavy", // Bruine modérée
        55: "fa-solid fa-cloud-showers-heavy", // Bruine dense
        61: "fa-solid fa-cloud-rain", // Pluie légère
        63: "fa-solid fa-cloud-showers-heavy", // Pluie modérée
        65: "fa-solid fa-cloud-showers-heavy", // Pluie forte
        66: "fa-solid fa-snowflake", // Pluie verglaçante légère
        67: "fa-solid fa-snowflake", // Pluie verglaçante forte
        71: "fa-solid fa-snowflake", // Neige légère
        73: "fa-solid fa-snowflake", // Neige modérée
        75: "fa-solid fa-snowman", // Neige forte
        77: "fa-solid fa-snowflake", // Grains de neige
        80: "fa-solid fa-cloud-rain", // Averses légères
        81: "fa-solid fa-cloud-showers-heavy", // Averses modérées
        82: "fa-solid fa-bolt", // Averses fortes (orageuses)
        85: "fa-solid fa-snowflake", // Averses de neige légères
        86: "fa-solid fa-snowflake", // Averses de neige fortes
        95: "fa-solid fa-bolt", // Orage
        96: "fa-solid fa-cloud-bolt", // Orage avec grêle légère
        99: "fa-solid fa-cloud-bolt", // Orage avec grêle forte
    };
    return icons[code] || "fa-solid fa-question-circle"; // Icône par défaut si inconnu
}


let citiesData = [];

fetch('cities5000.json')
    .then(response => response.json())
    .then(data => {
        citiesData = data;
    })
    .catch(error => {
        console.error("Erreur lors du chargement du fichier JSON :", error);
    });

async function searchCity() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = '';

    if (input === '') return;

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
            document.getElementById('searchInput').value = city.city;
            suggestionsList.innerHTML = '';
        };
        suggestionsList.appendChild(li);
    });
}


async function filterCities(input) {

    let filteredCities = citiesData.filter(city => {
        return city.city.toLowerCase().includes(input);
    });

    return filteredCities;
}

