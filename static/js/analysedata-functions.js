function colourAndMatchSKUs() {
    const skuColorMap = {};

    // Step 1: Color SKU cells in Analyse Data table
    $('#analysis-table tbody tr').each(function () {
        const skuCell = $(this).find('td:nth-child(3)'); // Get the third column (SKU column)
        const skuValue = skuCell.text().trim(); // Extract SKU value

        if (!(skuValue in skuColorMap)) {
            const color = '#' + Math.floor(Math.random() * 16777215).toString(16); // Random color generator
            skuColorMap[skuValue] = color;

            skuCell.css('background-color', color);
            console.log(`SKU: ${skuValue} colored in ${color}`);
        }
    });

    // Step 2: Match colors in Order Details table
    $('#order-details-table tbody tr').each(function () {
        const skuCell = $(this).find('td:nth-child(2)'); // Get the second column (SKU column)
        const fullCellValue = skuCell.text().trim(); // Extract the full cell value

        // Perform a regular expression match to find the SKU in the cell's value
        for (const skuValue in skuColorMap) {
            const regex = new RegExp('\\b' + skuValue + '\\b'); // Word boundary regex for exact match
            if (regex.test(fullCellValue)) {
                const color = skuColorMap[skuValue];
                skuCell.css('background-color', color);
                console.log(`SKU in Order Details matched: ${skuValue} with color ${color}`);
                break; // Exit loop after the first match
            }
        }
    });
}
function colorMatchSKUsOrderDetails(data) {
    const orderDetailsTable = document.getElementById('order-details-table');
    const skuColumnIndex = 1; // Assuming SKU is in the second column (index 1)

    const orderDetailsSKUs = Array.from(orderDetailsTable.querySelectorAll('tbody tr td:nth-child(' + (skuColumnIndex + 1) + ')')).map(cell => cell.textContent.trim());

    colorMatchSKUsSTBA(orderDetailsSKUs);
    colorMatchSKUsSTEN(orderDetailsSKUs);
}

function colorMatchSKUsSTBA(orderDetailsSKUs) {
    const stbaTable = document.getElementById('stba-table-container');
    const skuColumnIndex = 0; // Assuming SKU is in the first column

    if (orderDetailsSKUs) {
        Array.from(stbaTable.querySelectorAll('tbody tr')).forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells && cells.length > skuColumnIndex) {
                const stbaSKU = cells[skuColumnIndex].textContent.trim();

                if (stbaSKU && orderDetailsSKUs.includes(stbaSKU)) {
                    cells[skuColumnIndex].style.backgroundColor = 'yellow'; // Change the background color to indicate the match
                }
            }
        });
    }
}


function colorMatchSKUsSTEN(orderDetailsSKUs, skuColorMap) {
    const stenTable = document.getElementById('sten-table-container');
    const skuColumnIndex = 0; // Assuming SKU is in the first column

    Array.from(stenTable.querySelectorAll('tbody tr')).forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const stenSKU = cells[skuColumnIndex].textContent.trim();

        if (orderDetailsSKUs.includes(stenSKU)) {
            const color = skuColorMap[stenSKU];
            cells[skuColumnIndex].style.backgroundColor = color; // Use the color from skuColorMap
        }
    });
}


function fetchExtraData(query) {
    return fetch(`/fetch-extra-data?query=${query}`)
        .then(response => response.json())
        .then(data => {
            console.log(`Received ${query} data:`, data); // Log the received data
            
                
            
            return data;
        })
        .catch(error => {
            console.error(`Error fetching ${query} data:`, error);
            throw error;
        });
}

function fetchSTENData(orderDetailsSKUs) {
    return fetchExtraData('CS_FAKE_STEN_V')
        .then(stenData => {
            if (stenData && stenData.CS_FAKE_STEN_V && stenData.CS_FAKE_STEN_V.length > 0) {
                const matchingSTEN = stenData.CS_FAKE_STEN_V.filter(row => orderDetailsSKUs.includes(row[0])); // Assuming SKU is in the first column

                if (matchingSTEN.length > 0) {
                    displayFilteredSTEN(matchingSTEN);
                } else {
                    console.log('No matching STEN data found');
                    // Optionally hide or clear the STEN table container
                }
            } else {
                console.log('No STEN data available');
                // Optionally hide or clear the STEN table container
            }
        })
        .catch(error => {
            console.error('Error fetching STEN data:', error);
            document.getElementById('processing-indicator').style.display = 'none';
        });
}

function fetchSTBAData(orderDetailsSKUs) {
    return fetchExtraData('CS_FAKE_STBA_V')
        .then(stbaData => {
            if (stbaData && stbaData.CS_FAKE_STBA_V && stbaData.CS_FAKE_STBA_V.length > 0) {
                const matchingSTBA = stbaData.CS_FAKE_STBA_V.filter(row => orderDetailsSKUs.includes(row[0])); // Assuming SKU is in the first column

                if (matchingSTBA.length > 0) {
                    displayFilteredSTBA(matchingSTBA);
                } else {
                    console.log('No matching STBA data found');
                    // Optionally hide or clear the STBA table container
                }
            } else {
                console.log('No STBA data available');
                // Optionally hide or clear the STBA table container
            }
        })
        .catch(error => {
            console.error('Error fetching STBA data:', error);
            document.getElementById('processing-indicator').style.display = 'none';
        });
}

function displayFilteredSTEN(data) {
    const stenTableBody = document.querySelector('#sten-table-container tbody');
    stenTableBody.innerHTML = ''; // Clear previous data

    data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        stenTableBody.appendChild(tr);
    });
}

function displayFilteredSTBA(data) {
    const stbaTableBody = document.querySelector('#stba-table-container tbody');
    stbaTableBody.innerHTML = ''; // Clear previous data

    data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        stbaTableBody.appendChild(tr);
    });
}

function displayDataTable(containerId, data, tableName) {
    const tableContainer = document.getElementById(containerId);
    let tableHTML = `<h2>${tableName} Table</h2><table><thead><tr>`;

    const headers = data[0];

    headers.forEach(header => {
        tableHTML += `<th>${header}</th>`;
    });

    tableHTML += '</tr></thead><tbody>';

    for (let i = 1; i < data.length; i++) {
        tableHTML += '<tr>';
        data[i].forEach(cell => {
            tableHTML += `<td>${cell}</td>`;
        });
        tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table>';

    tableContainer.innerHTML = tableHTML;
}






function analyseData() {
    clearTable(document.getElementById('analysis-table'));

    var statusTable = document.getElementById('status-table').querySelector('tbody');
    var analysisTable = document.getElementById('analysis-table').querySelector('tbody');
        
    // Getting the sortation_order_id from the Status table
    var sortationOrderIdIndex = 3; // Assuming the index of the sortation_order_id column
    var sortationOrderId = statusTable.querySelector('tr:first-child').querySelectorAll('td')[sortationOrderIdIndex].innerText;

    if (!sortationOrderId) {
        console.error('Sortation Order ID value not found in the Status table');
        return;
    }

    document.getElementById('processing-indicator').style.display = 'block';

    fetch('/analyse-data', {
        method: 'POST',
        body: new URLSearchParams({ sortation_order_id: sortationOrderId }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Fetch Response:', data); // Log the received data
        document.getElementById('processing-indicator').style.display = 'none';
    
        if (data.error) {
            console.error('Error executing analysis:', data.error);
        } else {
            if (data.ANALYSIS_RESULTS.length > 0) {
                analysisTable.innerHTML = '';
                data.ANALYSIS_RESULTS.forEach(function(item) {
                    analysisTable.innerHTML += '<tr><td>' + item.SORT_ORDER + '</td><td>' + item.REQ_VAS + '</td><td>' + item.SKU + '</td><td>' + item.REQ_QTY + '</td><td>' + item.AVL_POUCH + '</td><td>' + item.QL + '</td><td>' + item.CP + '</td><td>' + item.CT + '</td></tr>';
                });
            } else {
                console.log('No analysis results found.');
            }
        }

        // Fetching the order details SKUs
    const orderDetailsSKUs = Array.from(document.querySelectorAll('#order-details-table tbody tr')).map(row => row.querySelector('td:nth-child(2)').textContent.trim());

    // Fetch STEN and STBA data with matching SKUs
    fetchSTENData(orderDetailsSKUs)
    .then(() => {
        fetchSTBAData(orderDetailsSKUs)
            .then(() => {
                const skuColorMap = colourAndMatchSKUs(); // Capture the skuColorMap
                colorMatchSKUsSTBA(orderDetailsSKUs, skuColorMap);
                colorMatchSKUsSTEN(orderDetailsSKUs, skuColorMap);
                colorMatchSKUsOrderDetails();
            });
    });

    })
    .catch(error => {
        console.error('Error executing analysis:', error);
        document.getElementById('processing-indicator').style.display = 'none';
    });
    
}

function clearSTBATable() {
    const stbaTableBody = document.querySelector('#stba-table-container tbody');
    stbaTableBody.innerHTML = ''; // Clear previous data
}

function clearSTENTable() {
    const stenTableBody = document.querySelector('#sten-table-container tbody');
    stenTableBody.innerHTML = ''; // Clear previous data
}
    