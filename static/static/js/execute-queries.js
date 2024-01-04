function executeQueries() {
    clearTable(document.getElementById('status-table'));
    clearTable(document.getElementById('order-details-table'));
    clearTable(document.getElementById('alarm-table'));
    clearTable(document.getElementById('sku-results-table'));
    clearTable(document.getElementById('sortation-results-table'));
    clearTable(document.getElementById('analysis-table'));
    clearSTBATable();
    clearSTENTable();
    const orderId = document.getElementById('order-id').value;

    document.getElementById('processing-indicator').style.display = 'block';

    fetch('/execute-queries', {
        method: 'POST',
        body: new URLSearchParams({ order_id: orderId }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('processing-indicator').style.display = 'none';

        if (data.error) {
            console.error('Error executing queries:', data.error);
        } else {
            updateStatus(data.STATUS);
            displayOrderDetails(data.ORDER_DETAILS);
        }
         // Color the status column
 colorStatusColumn();

 // Color the last modified date column
 colorLastModifiedDate();

    })
    .catch(error => {
        console.error('Error executing queries:', error);
        document.getElementById('processing-indicator').style.display = 'none';
    });
}

function updateStatus(status) {
    const statusTable = document.getElementById('status-table').querySelector('tbody');
    let statusHTML = '';

    if (status.length > 0) {
        status.forEach(item => {
            statusHTML += `<tr><td>${item.STATUS}</td><td>${item.F_CREATE_DATE}</td><td>${item.F_MOD_DATE}</td><td>${item.F_PACK_TARGET}</td><td>${item.SORTATION_ORDER_ID}</td></tr>`;
        });
    }
   
    statusTable.innerHTML = statusHTML;
    console.log('Status Data:', status);
}


function displayOrderDetails(orderDetails) {
    const orderDetailsTable = document.getElementById('order-details-table').querySelector('tbody');
    let orderDetailsHTML = '';

    if (orderDetails.length > 0) {
        orderDetails.forEach(item => {
            orderDetailsHTML += `<tr><td>${item.ORDER_LINE_ID}</td><td class="sku-link" onclick="showSkuResults('${item.SKU}')">${item.SKU}</td><td>${item.COMPANY}</td><td>${item.COUNTRY}</td><td>${item.QUALITY}</td><td>${item.QUANTITY}</td><td>${item.REQUIRED_VAS}</td><td>${item.Loadunit}</td></tr>`;
        });
    } else {
        orderDetailsHTML = '<tr><td colspan="8">No order details available.</td></tr>';
    }
   
    orderDetailsTable.innerHTML = orderDetailsHTML;
}

function parseDate(dateString) {
    if (typeof dateString !== 'string' || dateString.trim() === '') {
        return null; // Return null or handle the error appropriately
    }

    const months = {
        'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
        'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
    };

    const dateParts = dateString.match(/^(\d{2})-(\w{3})-(\d{2}) (\d{2}).(\d{2}) (\w{2})$/);
    if (!dateParts) {
        return null; // Return null if the date string doesn't match the expected format
    }

    const [, day, monthStr, year, hours, minutes, ampm] = dateParts;
    const month = months[monthStr.toUpperCase()];

    // Check if month is valid
    if (month === undefined) {
        return null;
    }

    let parsedYear = parseInt(year, 10);
    if (parsedYear < 70) {
        parsedYear += 2000; // Handling the year format (assuming '23' represents 2023)
    } else {
        parsedYear += 1900;
    }

    let parsedHours = parseInt(hours, 10);
    if (ampm === 'PM' && parsedHours < 12) {
        parsedHours += 12;
    }

    // Create a new Date object with the parsed values
    const date = new Date(parsedYear, month, parseInt(day, 10), parsedHours, parseInt(minutes, 10));
    return date;
}

function colorStatusColumn() {
    const statusCells = document.querySelectorAll('#status-table tbody td:first-child'); // Assuming status is the first column

    statusCells.forEach(cell => {
        const statusText = cell.textContent.trim();

        if (statusText === 'ACTIVE') {
            cell.style.backgroundColor = 'green';
            cell.style.color = 'white'; // Set font color to white for better visibility
        } else if (statusText === 'RELEASED' || statusText === 'PENDING') {
            cell.style.backgroundColor = 'orange';
            cell.style.color = 'black'; // Set font color to black for better visibility
        }
    });
}

function colorLastModifiedDate() {
    const tableRows = document.querySelectorAll('#status-table tbody tr');

    tableRows.forEach(row => {
        const lastModifiedDateCell = row.cells[2]; // Assuming Last Modified date is in the third column

        const dateString = lastModifiedDateCell.textContent.trim();
        const lastModified = parseDate(dateString);

        // Check for null or undefined date values
        if (lastModified instanceof Date && !isNaN(lastModified)) {
            const timeDifference = Date.now() - lastModified.getTime();
            const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));

            if (hoursDifference >= 6) {
                lastModifiedDateCell.style.backgroundColor = 'red'; // Older than 6 hours (Red)
                lastModifiedDateCell.style.color = 'white'; // Set font color to white for better visibility
            } else if (hoursDifference >= 3) {
                lastModifiedDateCell.style.backgroundColor = 'orange'; // Between 3 and 6 hours (Orange)
                lastModifiedDateCell.style.color = 'black'; // Set font color to black for better visibility
            } else {
                lastModifiedDateCell.style.backgroundColor = 'green'; // Less than 3 hours (Green)
                lastModifiedDateCell.style.color = 'white'; // Set font color to white for better visibility
            }
        }
    });
}
