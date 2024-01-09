document.addEventListener('DOMContentLoaded', function() {
  const rectangles = document.querySelectorAll('.rectangle');
  const popup = document.querySelector('.popup');
  const popupContent = document.querySelector('.popup .station-details');
  const playBtn = document.getElementById('pssPlayBtn');
  playBtn.textContent = '▶';
  const gearImages = document.querySelectorAll('.gear-img');
  const gearGIFs = document.querySelectorAll('.gear-gif');
  const loopImages = document.querySelectorAll('.loop-img');
  const loopGIFs = document.querySelectorAll('.loop-gif');

  gearImages.forEach(image => {
    image.style.display = 'block'; // Show the gear image by default
  });

  gearGIFs.forEach(gif => {
    gif.style.display = 'none'; // Hide the gear GIF by default
  });

  loopImages.forEach(loopImage => {
    loopImage.style.display = 'block'; // Show the loop image by default
  });

  loopGIFs.forEach(loopGIF => {
    loopGIF.style.display = 'none'; // Hide the loop GIF by default
  });

  
  rectangles.forEach(rectangle => {
    rectangle.addEventListener('click', () => {
      const stationId = rectangle.textContent.trim();
      fetchStationDetails(stationId);
    });
  });

  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.style.display = 'none';
    }
  });


  let intervalId = null;
  let gifPlaying = false; // To track the state of the GIF

  function updatePSSDisplayValues(data) {
    const pssledElements = document.querySelectorAll('.pss-display-item');
    const dataKeys = Object.keys(data);
  
    pssledElements.forEach((element, index) => {
      const key = dataKeys[index];
      const value = data[key];
  
      if (value || value === 0) {
        element.textContent = value;
        applypssLEDColor(element, key, value); // Apply LED color based on value and criteria
      } else {
        element.textContent = 'N/A';
      }
    });
  }

  function updateHOSDisplayValues(data) {
    const hosledElements = document.querySelectorAll('.hos-display-item');
    const dataKeys = Object.keys(data);

    hosledElements.forEach((element, index) => {
      const key = dataKeys[index];
      const value = data[key];

      if (value || value === 0) {
        element.textContent = value;
        applyhosLEDColor(element, key, value);
      } else {
        element.textContent = 'N/A';
      }
    });
  }

// Function to fetch PSS data
function fetchPSSData() {
  return fetch('/fetch_pss_data')
    .then(response => response.json())
    .then(data => {
      if (data && !data.error) {
        updatePSSDisplayValues(data[0]); // Assuming data is an array and you need the first row

        // For LED coloring after updating LED values
        const loopPac3Element = document.querySelector('.LED-LOOP_PAC3');
        const loopPac4Element = document.querySelector('.LED-LOOP_PAC4');
        const loopPac1Element = document.querySelector('.LED-LOOP_PAC1');
        const loopPac2Element = document.querySelector('.LED-LOOP_PAC2');
        const loopPac5Element = document.querySelector('.LED-LOOP_PAC5');
        const loopPac6Element = document.querySelector('.LED-LOOP_PAC6');
        applypssLEDColor(loopPac3Element, 'LOOP_PAC3', loopPac3Element.textContent);
        applypssLEDColor(loopPac4Element, 'LOOP_PAC4', loopPac4Element.textContent);
        applypssLEDColor(loopPac1Element, 'LOOP_PAC1', loopPac1Element.textContent);
        applypssLEDColor(loopPac2Element, 'LOOP_PAC2', loopPac2Element.textContent);
        applypssLEDColor(loopPac5Element, 'LOOP_PAC5', loopPac5Element.textContent);
        applypssLEDColor(loopPac6Element, 'LOOP_PAC6', loopPac6Element.textContent);

      } else {
        console.error('Error fetching pss data:', data.error || 'Unknown error');
        // Update LED displays to N/A when PSS data is unavailable
        const pssledElements = document.querySelectorAll('.display-item[data-label^="PSS"]');
        pssledElements.forEach(element => {
          element.textContent = 'N/A';
          element.style.backgroundColor = 'gray'; // Change color to indicate unavailability
        });
      }
    })
    .catch(error => {
      console.error('Error fetching PSS data:', error);
      // Update LED displays to N/A when there's an error fetching HOS data
      const pssledElements = document.querySelectorAll('.display-item[data-label^="PSS"]');
      pssledElements.forEach(element => {
        element.textContent = 'N/A';
        element.style.backgroundColor = 'gray'; // Change color to indicate error
      });
    });
}
function fetchPresortLaneData() {
  return fetch('/fetch_presort_lane_data')
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
                cell.textContent = cellData || '--';
                row.appendChild(cell);

                /// Apply coloring logic here based on cell data and cell index
if (cellIndex === 3 && cellData.trim().toUpperCase() === 'FILLING') {
  
  cell.style.backgroundColor = 'yellow';
} else if (cellIndex === 3 && cellData.trim().toUpperCase() === 'FULL') {
  cell.style.color = 'white';
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
      cell.style.color = 'white';
      cell.style.backgroundColor = 'red';
      playNoteSound();

    } else if (minutesDifference >= 45) {
      cell.style.color = 'white';
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
      throw error;
    });
}

function playAlertSound() {
  const alertSound = document.getElementById('alertSound');
  if (alertSound) {
    alertSound.play();
  }
}

// Function to play the note sound
function playNoteSound() {
  const noteSound = document.getElementById('notesound');
  if (noteSound) {
    noteSound.play();
  }
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

function fetchHOSData() {
  fetch('/fetch_hos_data')
    .then(response => response.json())
    .then(data => {
      if (data && !data.error) {
        updateHOSDisplayValues(data[0]); // Assuming data is an array and you need the first row

        // For LED coloring after updating LED values
        const hos1Element = document.querySelector('.LED-HOS1');
        const hos2Element = document.querySelector('.LED-HOS2');
        const hos3Element = document.querySelector('.LED-HOS3');
        const hos4Element = document.querySelector('.LED-HOS4');
        const hos5Element = document.querySelector('.LED-HOS5');
        const hos6Element = document.querySelector('.LED-HOS6');
        const hospElement = document.querySelector('.LED-HOSP');

        applyhosLEDColor(hos1Element, 'HOS1', hos1Element.textContent);
        applyhosLEDColor(hos2Element, 'HOS2', hos2Element.textContent);
        applyhosLEDColor(hos3Element, 'HOS3', hos3Element.textContent);
        applyhosLEDColor(hos4Element, 'HOS4', hos4Element.textContent);
        applyhosLEDColor(hos5Element, 'HOS5', hos5Element.textContent);
        applyhosLEDColor(hos6Element, 'HOS6', hos6Element.textContent);
        applyhosLEDColor(hospElement, 'HOSP', hospElement.textContent);

      } else {
        console.error('Error fetching HOS data:', data.error || 'Unknown error');
        // Update LED displays to N/A when HOS data is unavailable
        const hosledElements = document.querySelectorAll('.hos-display-item[data-label^="HOS"]');
        hosledElements.forEach(element => {
          element.textContent = 'N/A';
          element.style.backgroundColor = 'gray'; // Change color to indicate unavailability
        });
      }
    })
    .catch(error => {
      console.error('Error fetching HOS data:', error);
      // Update LED displays to N/A when there's an error fetching HOS data
      const hosledElements = document.querySelectorAll('.hos-display-item[data-label^="HOS"]');
      hosledElements.forEach(element => {
        element.textContent = 'N/A';
        element.style.backgroundColor = 'gray'; // Change color to indicate error
      });
    });
}

function updateData() {
  
  fetchPSSData()
  fetchPresortLaneData()
    .then(() => {
      
      return fetchHOSData();
    })
    .catch(error => {
      console.error('Error updating data:', error);
    });
}

function togglePlayButton() {
  
  const playBtn = document.getElementById('pssPlayBtn');
  const intervalSelect = document.getElementById('intervalSelect');
  const gearGIFs = document.querySelectorAll('.gear-gif');
  const gearImages = document.querySelectorAll('.gear-img');
  const loopGIFs = document.querySelectorAll('.loop-gif');
  const loopImages = document.querySelectorAll('.loop-img');
  
  if (gifPlaying) {
    // Pause the GIFs - show the images instead
    gearGIFs.forEach(gif => {
      gif.style.display = 'none';
    });
    gearImages.forEach(image => {
      image.style.display = 'block';
    });
    loopGIFs.forEach(gif => {
      gif.style.display = 'none';
    });
    loopImages.forEach(image => {
      image.style.display = 'block';
    });
    gifPlaying = false;
    playBtn.textContent = '▶️'; // Change Play icon to Pause

    // Logic to stop the query updates
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      playBtn.textContent = '⏸';
    clearInterval(blinkInterval); // Clear the blinking effect
    playBtn.style.backgroundColor = ''; // Reset the background color
    }
  } else {
    // Play the GIFs - hide the images
    gearImages.forEach(image => {
      image.style.display = 'none';
    });
    gearGIFs.forEach(gif => {
      gif.style.display = 'block';
    });
    loopImages.forEach(image => {
      image.style.display = 'none';
    });
    loopGIFs.forEach(gif => {
      gif.style.display = 'block';
    });
    gifPlaying = true;
    playBtn.textContent = '⏸'; // Change Pause icon to Play

    // Logic to start the query updates
    const interval = getSelectedInterval(intervalSelect);
    if (interval !== 0) {
      updateData();
      intervalId = setInterval(updateData, interval);
      playBtn.textContent = '◼️';
      
      // Blinking effect on the button
      let blink = true;
      blinkInterval = setInterval(() => {
        if (blink) {
          playBtn.style.backgroundColor = 'green';
        } else {
          playBtn.style.backgroundColor = '';
        }
        blink = !blink;
      }, 500); // Change the blink rate (in milliseconds) as needed
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
function applypssLEDColor(element, key, value) {
  const numericValue = parseInt(value);

  switch (key) {
    case 'LOOP_PAC3':
    case 'LOOP_PAC4':
      if (numericValue <= 500) {
        element.style.backgroundColor = 'green';
      } else if (numericValue > 500 && numericValue <= 700) {
        element.style.backgroundColor = 'brown';
      } else if (numericValue > 700) {
        element.style.backgroundColor = 'red';
      }
      break;
    case 'LOOP_PAC1':
    case 'LOOP_PAC2':
    case 'LOOP_PAC5':
    case 'LOOP_PAC6':
      if (numericValue > 300) {
        element.style.backgroundColor = 'red';{
          const alertSound = document.getElementById('alertSound');
          alertSound.play(); // Play the sound
        }
      } else if (numericValue <= 300) {
        element.style.backgroundColor = 'green';  
      }
      break;
      default:
        break;  
      
  }
}
  // Function to apply LED color based on criteria
function applyhosLEDColor(element, key, value) {
  const numericValue = parseInt(value);
  switch (key) {
    case 'HOS1':
    case 'HOS2':
    case 'HOS5':
    case 'HOS6':
    case 'HOS3':
    case 'HOS4':
      if (numericValue > 50) {
        element.style.backgroundColor = 'red';
        playAlertSound();

      } else if (numericValue <= 50) {
        element.style.backgroundColor = 'brown';  
      }
      break;
      case 'HOSP':
        if (numericValue > 200) {
          element.style.backgroundColor = 'red';
          playAlertSound();

        } else if (numericValue <= 200) {
          element.style.backgroundColor = 'green';  
        } 
        break;     
  default:
    break;
}
}
});



// Function to toggle mute/unmute
function toggleMute() {
  const alertSound = document.getElementById('alertSound');
  const noteSound = document.getElementById('notesound');
  const muteButton = document.getElementById('muteButton');

  if (alertSound && noteSound && muteButton) {
    if (alertSound.muted && noteSound.muted) {
      alertSound.muted = false;
      noteSound.muted = false;
      muteButton.textContent = '🔊';
    } else {
      alertSound.muted = true;
      noteSound.muted = true;
      muteButton.textContent = '🔇';
    }
  }
}

// Attach the toggleMute function to the mute button click event
const muteButton = document.getElementById('muteButton');
if (muteButton) {
  muteButton.addEventListener('click', toggleMute);
}


  
function fetchStationDetails(stationId) {
  const endpoint = `/stations/${stationId}`;

  fetch(endpoint)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json();
    })
    .then(stationData => {
      // Customize this section to structure the received data for the popup
      popupContent.innerHTML = `
        <h3>${stationData.station}</h3>
        <p>Status: ${stationData.status}</p>
        <div class="trays-list">
          <h4>Trays List:</h4>
          <ul>
            ${stationData.trays.map(tray => `<li>${tray}</li>`).join('')}
          </ul>
        </div>
      `;
      popup.style.display = 'block'; // Display the popup after fetching data
    })
    .catch(error => {
      console.error('Error fetching station data:', error);
      popupContent.innerHTML = '<p>Failed to fetch station details.</p>';
      popup.style.display = 'block'; // Display the popup even if there's an error
    });
}