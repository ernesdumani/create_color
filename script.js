document.getElementById('getPalette').addEventListener('click', async () => {
  const aesthetic = document.getElementById('aesthetic').value;
  const occasion = document.getElementById('occasion').value;

  const weatherData = await fetch('api/weather.php')
    .then(res => res.json());

  const time = new Date().getHours();

  let timeOfDay = 'day';
  if (time < 6 || time >= 20) timeOfDay = 'night';
  else if (time < 12) timeOfDay = 'morning';
  else if (time < 17) timeOfDay = 'afternoon';

  const query = `${weatherData.condition}_${timeOfDay}_${aesthetic}_${occasion}`;
  const palettes = await fetch(`palette.php?query=${query}`).then(res => res.json());

  displayPalette(palettes.colors);
  displayStory(palettes.story);
});

function displayPalette(colors) {
  const container = document.getElementById('paletteDisplay');
  container.innerHTML = '';
  colors.forEach(color => {
    const block = document.createElement('div');
    block.className = 'palette-color';
    block.style.backgroundColor = color;
    container.appendChild(block);
  });
}

function displayStory(text) {
  document.getElementById('paletteStory').innerHTML = `<h2>Why This Palette?</h2><p>${text}</p>`;
}
