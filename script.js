async function meteo(){
    let city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Veuillez entrer une ville !");
        return;
    }

    try {
        // Étape 1 : Obtenir les coordonnées de la ville
        let geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=fr&format=json`);
        let geoData = await geoResponse.json();

        if (!geoData.results) {
            document.getElementById("weatherResult").innerHTML = "❌ Ville non trouvée !";
            return;
        }

        let latitude = geoData.results[0].latitude;
        let longitude = geoData.results[0].longitude;

        // Étape 2 : Obtenir la météo avec Open-Meteo
        let weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe/Paris`);
        let weatherData = await weatherResponse.json();

        let currentWeather = weatherData.current_weather;
        let weatherHTML = `
            <h3>📍 ${city}</h3>
            <p>🌡 <strong>Température :</strong> ${currentWeather.temperature}°C</p>
            <p>💨 <strong>Vent :</strong> ${currentWeather.windspeed} km/h</p>
            <p>⏲ <strong>Heure :</strong> ${currentWeather.time}</p>
        `;

        document.getElementById("weatherResult").innerHTML = weatherHTML;

    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("weatherResult").innerHTML = "❌ Erreur lors de la récupération des données.";
    }


}