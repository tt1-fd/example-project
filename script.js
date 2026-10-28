document.getElementById('btn').addEventListener('click', () => {
  document.getElementById('msg').textContent =
    'Button clicked at ' + new Date().toLocaleTimeString();
});
