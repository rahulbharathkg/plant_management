document.addEventListener('DOMContentLoaded', function () {
    const loadunitInput = document.getElementById('loadunit-input');
    const transportTable = document.getElementById('transport-table');
    const traceResults = document.getElementById('trace-results');
    const enterButton = document.getElementById('enter-button');

    enterButton.addEventListener('click', handleEnter);
    loadunitInput.addEventListener('keyup', handleEnter);

    function handleEnter(event) {
        if (event.key === 'Enter' || event.type === 'click') {
            const loadunitId = loadunitInput.value.trim();
            if (loadunitId !== '') {
                fetchData(loadunitId);
            }
        }
    }

    function fetchData(loadunitId) {
        const transportTable = document.getElementById('transport-table');
        const traceResults = document.getElementById('trace-results');
        const loadunitTable = document.getElementById('loadunit-table');
        const loadingSpinner = document.getElementById('loading-spinner');
    
        if (!traceResults || !transportTable || !loadingSpinner || !loadunitTable) {
            console.error('One or more elements not found.');
            return;
        }

        traceResults.innerHTML = ''; // Clear previous results
        transportTable.innerHTML = ''; // Clear previous transport table data
        loadunitTable.innerHTML = ''; // Clear previous load unit table data

        loadingSpinner.style.display = 'block'; // Display processing indicator

        fetchTransportResults(loadunitId)
            .then(data => {
                displayTransportResults(data);
                loadingSpinner.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching transport data:', error);
                transportTable.innerHTML = 'Error fetching transport data.';
                loadingSpinner.style.display = 'none';
            })
            .then(() => {
                return fetchLoadUnitResults(loadunitId);
            })
            .then(data => {
                displayLoadUnitResults(data);
                loadingSpinner.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching load unit data:', error);
                loadunitTable.innerHTML = 'Error fetching load unit data.';
                loadingSpinner.style.display = 'none';
            })
            .then(() => {
                return fetchTraceResults(loadunitId);
            })
            .then(data => {
                displayTraceResults(data);
                loadingSpinner.style.display = 'none';
            })
            .catch(error => {
                console.error('Error fetching trace data:', error);
                traceResults.innerHTML = 'Error fetching trace data.';
                loadingSpinner.style.display = 'none';
            });
            
    }


    
    

    function fetchTransportResults(loadunitId) {
        return fetch('/perform_transport_request_check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loadunit_id: loadunitId
            })
        })
        .then(response => response.json());
    }

    function fetchTraceResults(loadunitId) {
        return fetch('/perform_trace_check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loadunit_id: loadunitId
            })
        })
        .then(response => response.json());
    }

    function fetchLoadUnitResults(loadunitId) {
        return fetch('/perform_loadunit_check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                loadunit_id: loadunitId
            })
        })
        .then(response => response.json());
    }

    function displayTransportResults(data) {
        const transportTable = document.getElementById('transport-table');
        if (!transportTable) {
            console.error('Transport table element not found.');
            return;
        }
    
        console.log('Received transport data:', data);
    
        if (!data || !data.Transport_Results || !Array.isArray(data.Transport_Results) || data.Transport_Results.length === 0) {
            transportTable.innerHTML = 'No data or unexpected data format for transport results.';
            return;
        }
    
        const headers = [
            'LOADUNIT',
            'STATUS',
            'ERROR_REASON',
            'SOURCE_LOC',
            'PROCESS_STATUS',
            'DESTINATION',
            'CREATE_DATE',
            'MOD_DATE',
            'MOD_USER'
        ];
    
        // Create the table header
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        transportTable.appendChild(headerRow);
    
        // Populate table data
        data.Transport_Results.forEach(transportData => {
            const dataRow = document.createElement('tr');
            headers.forEach((headerText, index) => {
                const td = document.createElement('td');
                const value = transportData[index];
                console.log(`${headerText}: ${value}`);
                td.textContent = value !== null ? value : 'N/A';
    
                // Check PROCESS_STATUS and ERROR_REASON for highlighting
                if ((headerText === 'PROCESS_STATUS' || headerText === 'ERROR_REASON') && value && value.trim().length > 0) {
                    td.style.backgroundColor = '#ffcccc'; // Light red highlighting
                }
    
                dataRow.appendChild(td);
            });
            transportTable.appendChild(dataRow);
        });
    }
    


function displayTraceResults(data) {
    console.log('Received data:', data); // Log the received data

    traceResults.innerHTML = ''; // Clear previous results
    if (data.error) {
        traceResults.innerHTML = data.error;
        return;
    }

    // Check if data is an array
    if (Array.isArray(data) && data.length > 0) {
        const table = document.createElement('table');
        const headerRow = document.createElement('tr');

        // Define column names for the table headers
        const columnNames = ['MOD_DATE', 'OPERATION_ID', 'USER_DATA'];

        // Create table headers using specified column names
        columnNames.forEach(columnName => {
            const th = document.createElement('th');
            th.textContent = columnName;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Iterate through the data and create rows for the table
        data.forEach(entry => {
            const tr = document.createElement('tr');
            entry.forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        traceResults.appendChild(table);
    } else {
        traceResults.innerHTML = 'No data or unexpected data format.';
    }
}

function displayLoadUnitResults(data) {
    const loadunitTable = document.getElementById('loadunit-table');
    if (!loadunitTable) {
        console.error('Loadunit table element not found.');
        return;
    }

    // Check if Loadunit Results exist and update the Loadunit table
    if (data && Array.isArray(data.Loadunit_Results) && data.Loadunit_Results.length > 0) {
        // Populating Loadunit Table
        const headers = [
            'LOADUNIT_ID',
            'LOC_ARR_DATE',
            'CURRENT_LOC',
            'STATUS',
            'STATUS_REASON',
            'ERROR_CODE',
            'ERROR_REASON',
            'LOCK_STATUS',
            'CLIENT',
            'MOD_USER',
            'CREATE_DATE'
        ];

        if (!loadunitTable.hasChildNodes()) {
            const headerRow = document.createElement('tr');
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            loadunitTable.appendChild(headerRow);
        }

        data.Loadunit_Results.forEach(result => {
            const dataRow = document.createElement('tr');
            result.forEach((value, index) => {
                const td = document.createElement('td');
                const displayValue = value !== null && value !== undefined ? value : 'N/A';
                td.textContent = displayValue;
                dataRow.appendChild(td);
            });
            loadunitTable.appendChild(dataRow);
        });

        // Update Load Unit Information box after populating the Loadunit table
        updateLoadUnitInformationBox(data);
    } else {
        loadunitTable.innerHTML = 'No data or unexpected data format for load unit results.';
    }
}


function updateLoadUnitInformationBox(data) {
    const lastRecord = data.Loadunit_Results[data.Loadunit_Results.length - 1];
    const locArrDate = lastRecord[1]; // LOC_ARR_DATE
    const currentLoc = lastRecord[2]; // CURRENT_LOC
    const errorReason = lastRecord[6]; // ERROR_REASON

    const lastReadSpan = document.getElementById('last-read');
    const locationSpan = document.getElementById('location');
    const errorSpan = document.getElementById('error');

    lastReadSpan.textContent = locArrDate !== null && locArrDate !== undefined ? locArrDate : 'N/A';
    locationSpan.textContent = currentLoc !== null && currentLoc !== undefined ? currentLoc : 'N/A';
    errorSpan.textContent = errorReason !== null && errorReason !== undefined ? errorReason : 'N/A';
}



   
});