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
            // Handle the error
            console.error('Error executing analysis:', data.error);
        } else {
            if (data.ANALYSIS_RESULTS.length > 0) {
                analysisTable.innerHTML = ''; // Clear existing table content
                data.ANALYSIS_RESULTS.forEach(function(item) {
                    analysisTable.innerHTML += '<tr><td>' + item.SORT_ORDER + '</td><td>' + item.REQ_VAS + '</td><td>' + item.SKU + '</td><td>' + item.REQ_QTY + '</td><td>' + item.AVL_POUCH + '</td><td>' + item.QL + '</td><td>' + item.CP + '</td><td>' + item.CT + '</td></tr>';
                });
            } else {
                console.log('No analysis results found.');
                // Clear the table content if no analysis results are available
                analysisTable.innerHTML = '';
            }
        }
    })
    .catch(error => {
        console.error('Error fetching analysis data:', error);
        document.getElementById('processing-indicator').style.display = 'none';
    });
}