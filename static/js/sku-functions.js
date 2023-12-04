function showSkuResults(sku) {
    var skuResultsTable = $('#sku-results-table').DataTable();
    var sortationResultsTable = $('#sortation-results-table').DataTable();

    document.getElementById('processing-indicator').style.display = 'block';

    fetch('/fetch-sku-results', {
        method: 'POST',
        body: new URLSearchParams({ sku: sku }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('processing-indicator').style.display = 'none';

        console.log('Received data:', data);

        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('SKU Results:', data.INV_RESULTS);
            console.log('Sortation Results:', data.SORTATION_RESULTS);

            // Clear existing DataTables
            skuResultsTable.clear().destroy();
            sortationResultsTable.clear().destroy();

            // Display SKU Results
            if (data.INV_RESULTS && data.INV_RESULTS.length > 0) {
                skuResultsTable = $('#sku-results-table').DataTable({
                    data: data.INV_RESULTS,
                    columns: [
                        { title: 'SKU' },
                        { title: 'Country' },
                        { title: 'Quality' },
                        { title: 'Company' },
                        { title: 'Quantity' },
                        { title: 'Qty_free' },
                        { title: 'Avl_Status' },
                        { title: 'Location' },
                        { title: 'Pouch' }
                    ]
                });
            }

            // Display Sortation Results
            if (data.SORTATION_RESULTS && data.SORTATION_RESULTS.length > 0) {
                sortationResultsTable = $('#sortation-results-table').DataTable({
                    data: data.SORTATION_RESULTS,
                    columns: [
                        { title: 'SLU ID' },
                        { title: 'S Order ID' },
                        { title: 'VAS Type' },
                        { title: 'Location' },
                        { title: 'Arrival Time' },
                        { title: 'SKU' }
                    ]
                });
            }

            // Show the SKU and Sortation results tables
            document.getElementById('sku-results').style.display = 'block';
            document.getElementById('sortation-results').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error fetching SKU and Sortation results:', error);
        document.getElementById('processing-indicator').style.display = 'none';
    });
}

function filterSKU(filterText) {
    const rows = document.querySelectorAll('#sku-results-table tbody tr');

    rows.forEach(row => {
        let found = false;
        row.querySelectorAll('td').forEach(cell => {
            if (cell.textContent.includes(filterText)) {
                found = true;
            }
        });

        if (!found) {
            row.style.display = 'none';
        } else {
            row.style.display = '';
        }
    });
}

function filterSKU(filterText) {
    const skuResultsTable = $('#sku-results-table').DataTable();
    skuResultsTable.search(filterText).draw();
    document.getElementById('filterReservedButton').classList.add('active');
}

function clearSKUFilter() {
    const skuResultsTable = $('#sku-results-table').DataTable();
    skuResultsTable.search('').draw();
    document.getElementById('filterReservedButton').classList.remove('active');
}

function filterSortation(filterText) {
    const sortationResultsTable = $('#sortation-results-table').DataTable();
    sortationResultsTable.search(filterText).draw();
    document.getElementById('filterBufferButton').classList.add('active');
}

function clearSortationFilter() {
    const sortationResultsTable = $('#sortation-results-table').DataTable();
    sortationResultsTable.search('').draw();
    document.getElementById('filterBufferButton').classList.remove('active');
}



