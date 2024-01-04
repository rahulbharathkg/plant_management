// Function to clear the alarm table
function clearAlarmTable() {
    const alarmTableBody = document.getElementById('alarm-table-body');
    if (alarmTableBody) {
        alarmTableBody.innerHTML = '';
    }
}

// Function to populate the alarm table with fetched data
function populateAlarmTable(data) {
    const alarmTableBody = document.getElementById('alarm-table-body');

    // Clear existing rows in the table
    clearAlarmTable();

    // Check if data is empty or null
    if (!data || data.length === 0) {
        alarmTableBody.innerHTML = '<tr><td colspan="2">No alarm details found</td></tr>';
        return;
    }

    // Loop through the data and populate the table
    data.forEach(item => {
        const row = document.createElement('tr');

        // Create table cells and set their content
        const detailsCell = document.createElement('td');
        detailsCell.textContent = item.DETAILS;
        const createDateCell = document.createElement('td');
        createDateCell.textContent = item.CREATE_DATE;

        // Append cells to the row
        row.appendChild(detailsCell);
        row.appendChild(createDateCell);

        // Append the row to the table body
        alarmTableBody.appendChild(row);
    });
}

function fetchAlarmDetails() {
    const orderID = document.getElementById('order-id').value;

    fetch('/check-alarm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            alarm_order_id: orderID
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        populateAlarmTable(data.ALARM);
    })
    .catch(error => {
        console.error('Error fetching alarm details:', error);
    });
}

const checkAlarmButton = document.getElementById('check-alarm-button');
checkAlarmButton.addEventListener('click', fetchAlarmDetails);

// Function to handle alarm details
function handleAlarmDetails() {
    clearAlarmTable(); // Clear the alarm table
    fetchAlarmDetails(); // Fetch new alarm details
}
