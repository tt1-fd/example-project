document.getElementById('btn').addEventListener('click', () => {
  document.getElementById('msg').textContent =
    'Button clicked at ' + new Date().toLocaleTimeString();
});

// Set current year in footer
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

console.log('Example Project loaded successfully.');
