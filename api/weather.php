<?php 
const apiKey = 'your_weather_api_key';
const city = 'New York'; // You can dynamically set this based on the user's input or geolocation

const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

fetch(weatherApiUrl)
  .then(response => response.json())
  .then(data => {
    const temperature = data.main.temp;
    const weatherCondition = data.weather[0].main; // e.g., "Clear", "Clouds", "Rain"
    
    // Call Color Palette API with the weather data
    fetchColorPalette(temperature, weatherCondition);
  })
  .catch(error => console.log(error));
  ?>
