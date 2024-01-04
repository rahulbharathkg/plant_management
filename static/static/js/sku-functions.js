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
                        { title: 'CN' },
                        { title: 'QL' },
                        { title: 'CP' },
                        { title: 'QTY' },
                        { title: 'Qty_free' },
                        { title: 'Avl_Status' },
                        { title: 'Location' },
                        { title: 'Pouch' }
                    ]
                });
                // Call the function to color SKU rows based on conditions
                colorSKUConditions();
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
                        { title: 'SKU' },
                        { title: 'ERR' },
                        { title: 'CP' },
                        { title: 'CN' },
                        { title: 'QL' }
                    ]
                });
                // Call the function to color Sortation rows based on conditions
        colorSortationConditions();
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



function colorSKUConditions() {
    const skuResultsTableRows = document.querySelectorAll('#sku-results-table tbody tr');
    const orderDetailsTableRows = document.querySelectorAll('#order-details-table tbody tr');

    skuResultsTableRows.forEach(skuRow => {
        const sku = skuRow.cells[0].textContent.trim(); // Assuming SKU is in the first column

        orderDetailsTableRows.forEach(orderDetailRow => {
            const skuColumn = orderDetailRow.cells[1]; // Assuming SKU is in the second column
            const countryColumn = orderDetailRow.cells[3]; // Assuming Country is in the fourth column
            const qualityColumn = orderDetailRow.cells[4]; // Assuming Quality is in the fifth column
            const companyColumn = orderDetailRow.cells[2]; // Assuming Company is in the third column

            if (skuColumn.textContent.trim() === sku) {
                const pouchablesColumn = skuRow.cells[8]; // Assuming Pouchables column is in the ninth column

                // Conditions for coloring
                if (pouchablesColumn.textContent.trim() === 'NO') {
                    skuRow.style.backgroundColor = 'red'; // Make row light red
                } else if (
                    countryColumn.textContent.trim() !== skuRow.cells[1].textContent.trim() ||
                    qualityColumn.textContent.trim() !== skuRow.cells[2].textContent.trim() ||
                    companyColumn.textContent.trim() !== skuRow.cells[3].textContent.trim()
                ) {
                    skuRow.style.backgroundColor = 'orange'; // Make row light orange
                }
            }
        });
    });
}


function colorSortationConditions() {
    const sortationTable = $('#sortation-results-table').DataTable();
    const rows = sortationTable.rows().nodes();

    $(rows).each(function () {
        const cells = $(this).find('td');

        // Get the cell values for the columns you want to apply conditions on
        const errValue = cells.eq(6).text().trim(); // Assuming ERR column is at index 6

        // Apply conditions for ERR column
        if (errValue !== 'OK') {
            $(this).css('background-color', 'lightcoral'); // Red color for non-OK values in ERR column
        }
    });
}
// Event handler for DataTables redraw event
$('#sortation-results-table').on('draw.dt', function () {
    colorSortationConditions(); // Apply coloring on each redraw
});

// Event handler for DataTables redraw event
$('#sku-results-table').on('draw.dt', function () {
    colorSKUConditions(); // Apply coloring on each redraw
});
