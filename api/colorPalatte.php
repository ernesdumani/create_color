<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weather & Color Palette Finder</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

  <div class="container">
    <h1>Weather-Based Color Palette Finder</h1>

    <!-- Weather Info Section -->
    <div class="weather-info">
      <h2 id="city-name">Enter a City</h2>
      <p id="temperature">Temperature: </p>
      <p id="condition">Condition: </p>
      <button onclick="getWeatherData()">Get Weather</button>
    </div>

    <!-- Color Palette Section -->
    <div class="palette-container">
      <h3>Suggested Color Palette</h3>
      <!-- Color boxes will be added dynamically here -->
    </div>
  </div>

  <!-- Include the main JavaScript file -->
  <script src="script.js">// Define your API keys and base URLs
const weatherApiKey = 'your_weather_api_key'; // Replace with your API key
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather'; // OpenWeatherMap API endpoint
const colormindApiUrl = 'http://colormind.io/api/';

// Function to get weather data and fetch color palette based on it
function getWeatherData() {
  const city = prompt("Enter city name:");

  // Fetch weather data for the specified city
  fetch(`${weatherApiUrl}?q=${city}&appid=${weatherApiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const temperature = data.main.temp;
      const weatherCondition = data.weather[0].main; // "Clear", "Clouds", "Rain", etc.
      
      // Display weather information
      document.getElementById('city-name').innerText = `${city}`;
      document.getElementById('temperature').innerText = `Temperature: ${temperature}°C`;
      document.getElementById('condition').innerText = `Condition: ${weatherCondition}`;

      // Fetch a color palette based on the weather data
      fetchColorPalette(temperature, weatherCondition);
    })
    .catch(error => console.error('Error fetching weather data:', error));
}

// Function to fetch a color palette based on weather data
function fetchColorPalette(temperature, weatherCondition) {
  // Example of how to generate color palette based on weather
  const paletteInput = [
    [temperature, 100, 200],  // Example palette based on temperature
    [temperature, 80, 180],
    [weatherCondition === 'Clear' ? 255 : 100, 100, 255], // Adjust colors for clear vs cloudy
    [180, 255, 200],
    [255, 180, 255]
  ];

  // Send a request to Colormind to generate the palette
  fetch(colormindApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'default', input: paletteInput })
  })
    .then(response => response.json())
    .then(data => {
      // Get the generated color palette
      const palette = data.result;
      
      // Render the color palette on the page
      displayPalette(palette);
    })
    .catch(error => console.log('Error fetching color palette:', error));
}

// Function to display the color palette on the page
function displayPalette(palette) {
  const paletteContainer = document.querySelector('.palette-container');
  paletteContainer.innerHTML = '';  // Clear any previous palettes
  
  palette.forEach(color => {
    const colorBox = document.createElement('div');
    colorBox.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    colorBox.classList.add('color-box');
    paletteContainer.appendChild(colorBox);
  });
}
</script>
</body>
</html>
