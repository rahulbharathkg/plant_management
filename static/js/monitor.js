let refreshInterval = 60000; // Initial refresh interval set to 1 minute

// Set up a timer to refresh the data every refreshInterval
setInterval(() => {
  const selectedInterval = document.getElementById('refresh-interval-select').value;
  if (selectedInterval) {
    refreshInterval = parseInt(selectedInterval);
  }

  // Refresh the data for all monitor boxes
  const boxes = document.querySelectorAll('.monitor-box');
  boxes.forEach((box) => {
    refreshData(box);
  });
}, refreshInterval);

function refreshData(box) {
  const data = fetchData(); // Simulated data fetch, replace with actual logic

  updateData(box, data);
}

function fetchData() {
  // Simulated data fetch, replace with actual data retrieval logic
  return Math.random(); // Placeholder random data
}

function updateData(box, data) {
  // Update the HTML content of the box with the updated data
  const boxData = box.querySelector('.box-data');
  boxData.textContent = data;
}

// Event listener for the refresh button (optional)
const refreshButton = document.getElementById('refresh-btn');
refreshButton.addEventListener('click', () => {
  const boxes = document.querySelectorAll('.monitor-box');
  boxes.forEach((box) => {
    refreshData(box);
  });
});
