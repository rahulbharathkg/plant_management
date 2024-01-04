function clearTable(table) {
    if (table) {
        var tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = '';
        }
    }
}


function makeTableFilterable(tableId) {
    $('#' + tableId).DataTable();
}



function sortTable(tableId, columnIndex, targetValue) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById(tableId);
    switching = true;
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName('td')[columnIndex];
            y = rows[i + 1].getElementsByTagName('td')[columnIndex];
            if (x.innerHTML === targetValue && y.innerHTML !== targetValue) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}
  