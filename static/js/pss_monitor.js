document.addEventListener('DOMContentLoaded', function() {
  
  let intervalId = null;

// Function to update the display values
function updateDisplayValues(data) {
  const ledElements = document.querySelectorAll('.display-item');
  const dataKeys = Object.keys(data);

  ledElements.forEach((element, index) => {
    const key = dataKeys[index];
    const value = data[key];

    if (value || value === 0) {
      element.textContent = value;
      // Apply LED color based on value and criteria
      applyLEDColor(element, key, value);
    } else {
      element.textContent = 'N/A';
    }
  });
}

// Function to fetch PSS data
function fetchPSSData() {
  fetch('/fetch_pss_data')
    .then(response => response.json())
    .then(data => {
      if (data && !data.error) {
        updateDisplayValues(data[0]); // Assuming data is an array and you need the first row

        // For LED coloring after updating LED values
        const loopPac3Element = document.querySelector('.LED-LOOP_PAC3');
        const loopPac4Element = document.querySelector('.LED-LOOP_PAC4');
        const loopPac1Element = document.querySelector('.LED-LOOP_PAC1');
        const loopPac2Element = document.querySelector('.LED-LOOP_PAC2');
        const loopPac5Element = document.querySelector('.LED-LOOP_PAC5');
        const loopPac6Element = document.querySelector('.LED-LOOP_PAC6');
        applyLEDColor(loopPac3Element, 'LOOP_PAC3', loopPac3Element.textContent);
        applyLEDColor(loopPac4Element, 'LOOP_PAC4', loopPac4Element.textContent);
        applyLEDColor(loopPac1Element, 'LOOP_PAC1', loopPac1Element.textContent);
        applyLEDColor(loopPac2Element, 'LOOP_PAC2', loopPac2Element.textContent);
        applyLEDColor(loopPac5Element, 'LOOP_PAC5', loopPac5Element.textContent);
        applyLEDColor(loopPac6Element, 'LOOP_PAC6', loopPac6Element.textContent);

      } else {
        console.error('Error fetching PSS data:', data.error || 'Unknown error');
      }
    })
    .catch(error => {
      console.error('Error fetching PSS data:', error);
    });
}

function fetchPresortLaneData() {
  fetch('/fetch_presort_lane_data')
    .then(response => response.json())
    .then(data => {
      console.log('Presort Lane Data:', data); // Log fetched presort lane data

      if (!Array.isArray(data)) {
        console.error('Invalid data format - not an array:', data);
        return;
      }

      const laneBoxes = document.querySelectorAll('.pss-presort-lanes-1, .pss-presort-lanes-2, .pss-presort-lanes-3');

      laneBoxes.forEach((box, index) => {
        const startIndex = index * 7;
        const endIndex = startIndex + 7;
        const laneData = data.slice(startIndex, endIndex);

        if (!Array.isArray(laneData)) {
          console.error('Invalid laneData format - not an array:', laneData);
          return;
        }

          if (laneData.length > 0) {
            const presortTable = document.createElement('table');
            const presortTbody = document.createElement('tbody');

            // Table headers
            const headerRow = document.createElement('tr');
            ['Presort Lane', 'To Fill', 'Lock Status', 'Operation Status', 'Fill Time', 'Became Full Time'].forEach(headerText => {
              const th = document.createElement('th');
              th.textContent = headerText;
              headerRow.appendChild(th);
            });
            presortTbody.appendChild(headerRow);

            laneData.forEach(rowData => {
              const row = document.createElement('tr');
              rowData.forEach((cellData, cellIndex) => {
                const cell = document.createElement('td');
                cell.textContent = cellData || 'N/A';
                row.appendChild(cell);

                /// Apply coloring logic here based on cell data and cell index
if (cellIndex === 3 && cellData.trim().toUpperCase() === 'FILLING') {
  cell.style.backgroundColor = 'yellow';
} else if (cellIndex === 3 && cellData.trim().toUpperCase() === 'FULL') {
  cell.style.backgroundColor = 'green';
}

if (cellIndex === 4 && cellData) {
  // Assuming the cell index for 'Fill Time' is 4
  const fillTimeString = cellData.trim();
  const fillTime = parseCustomDateFormat(fillTimeString);
  const currentTime = new Date();
  
  if (fillTime) {
    const minutesDifference = (currentTime - fillTime) / (1000 * 60);

    if (minutesDifference >= 60) {
      cell.style.backgroundColor = 'red';
    } else if (minutesDifference >= 45) {
      cell.style.backgroundColor = 'orange';
    }
  }
}

              });
              presortTbody.appendChild(row);
            });
            presortTable.appendChild(presortTbody);

            // Clear the box and append the table
            box.innerHTML = '';
            box.appendChild(presortTable);
          } else {
            box.textContent = 'N/A';
        }
      });
    })
      
    .catch(error => {
      console.error('Error fetching presort lane data:', error);
    });
}


function parseCustomDateFormat(dateString) {
  if (!dateString) {
    console.error('Invalid or undefined date string:', dateString);
    return null;
  }

  const dateMatch = dateString.match(/^(\d{2})-(\w{3})-(\d{2}) (\d{2}\.\d{2}) (AM|PM)$/);

  if (dateMatch && dateMatch.length === 6) {
    const [, day, monthStr, year, time, period] = dateMatch;
    const months = {
      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };
    const monthIndex = months[monthStr.toUpperCase()];

    let [hours, minutes] = time.split('.');
    if (period === 'PM') {
      hours = parseInt(hours, 10) + 12; // Convert to 24-hour format
    }

    const parsedDate = new Date(`20${year}`, monthIndex, day, hours, minutes);

    return parsedDate;
  } else {
    console.error('Invalid date format:', dateString);
    return null;
  }
}



function updateData() {
  fetchPSSData();
  fetchPresortLaneData();
  
}

function togglePlayButton() {
  const playBtn = document.getElementById('pssPlayBtn');
  const intervalSelect = document.getElementById('intervalSelect');
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    playBtn.textContent = 'Play';
  } else {
    const interval = getSelectedInterval(intervalSelect);
    if (interval !== 0) {
      updateData();
      intervalId = setInterval(updateData, interval);
      playBtn.textContent = 'Pause';
    } else {
      console.error('Invalid interval selection');
    }
  }
}

function getSelectedInterval() {
  const intervalSelect = document.getElementById('intervalSelect');
  if (intervalSelect) {
    return parseInt(intervalSelect.value);
  } else {
    console.error('Interval selection is null or undefined');
    return null;
  }
}


document.getElementById('pssPlayBtn').addEventListener('click', togglePlayButton);

// Function to apply LED color based on criteria
function applyLEDColor(element, key, value) {
  const numericValue = parseInt(value);

  switch (key) {
    case 'LOOP_PAC3':
    case 'LOOP_PAC4':
      if (numericValue <= 500) {
        element.style.backgroundColor = 'green';
      } else if (numericValue >= 500 && numericValue <= 650) {
        element.style.backgroundColor = 'orange';
      } else if (numericValue > 700) {
        element.style.backgroundColor = 'red';
      }
      break;
    case 'LOOP_PAC1':
    case 'LOOP_PAC2':
    case 'LOOP_PAC5':
    case 'LOOP_PAC6':
      if (numericValue > 300) {
        element.style.backgroundColor = 'red';
      } else if (numericValue <= 300) {
        element.style.backgroundColor = 'green';  
      }
      break;
    default:
      break;
  }
}
});



