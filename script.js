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
            document.getElementById("weatherResult").innerHTML = "❌ Ville non trouvée !";
            return;
        }

        let latitude = geoData.results[0].latitude;
        let longitude = geoData.results[0].longitude;

        let weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe/Paris`);
        let weatherData = await weatherResponse.json();

        let currentWeather = weatherData.current_weather;
        let weatherCode = currentWeather.weathercode;
        let icon = getWeatherIcon(weatherCode);

        let weatherHTML = `
            <h3>📍 ${city}</h3>
            <p>${icon}</p>
            <p>🌡 <strong>Température :</strong> ${currentWeather.temperature}°C</p>
            <p>💨 <strong>Vent :</strong> ${currentWeather.windspeed} km/h</p>
        `;

        document.getElementById("weatherResult").innerHTML = weatherHTML;

    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("weatherResult").innerHTML = "❌ Erreur lors de la récupération des données.";
    }
}

// Fonction pour choisir l'icône en fonction du code météo
function getWeatherIcon(code) {
    let icons = {
        0: "☀️", // Soleil
        1: "🌤", // Légèrement nuageux
        2: "⛅", // Partiellement nuageux
        3: "☁️", // Nuageux
        45: "🌫", // Brouillard
        48: "🌫", // Brouillard givrant
        51: "🌦", // Bruine légère
        53: "🌦", // Bruine modérée
        55: "🌧", // Bruine dense
        61: "🌦", // Pluie légère
        63: "🌧", // Pluie modérée
        65: "🌧", // Pluie forte
        66: "🌧❄️", // Pluie verglaçante légère
        67: "🌧❄️", // Pluie verglaçante forte
        71: "🌨", // Neige légère
        73: "🌨", // Neige modérée
        75: "❄️", // Neige forte
        77: "❄️", // Grains de neige
        80: "🌦", // Averses légères
        81: "🌧", // Averses modérées
        82: "⛈", // Averses fortes
        85: "🌨", // Averses de neige légères
        86: "❄️", // Averses de neige fortes
        95: "⛈", // Orage
        96: "⛈🌨", // Orage avec grêle légère
        99: "⛈🌨", // Orage avec grêle forte
    };
    return icons[code] || "❓"; // Icône par défaut si inconnu
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
            li.onclick = function() {
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
    
