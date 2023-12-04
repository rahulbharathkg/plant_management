window.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tabs li');
    const displayAreas = document.querySelectorAll('.display-area .tab-content');
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            displayAreas.forEach(d => d.classList.remove('active'));

            tab.classList.add('active');
            displayAreas[index].classList.add('active');
        });
    });

    // Event listeners
    document.getElementById('go-button').addEventListener('click', executeQueries);
    document.getElementById('order-id').addEventListener('keydown', function (event) {
        if (event.key === "Enter") {
            executeQueries();
        }
        
    });
    document.getElementById('analyse-button').addEventListener('click', function() {
        console.log('Analyse button clicked...');
        analyseData();
        fetchSTENData();
        fetchSTBAData();
    });
    

    const checkAlarmButton = document.getElementById('check-alarm-button');

    checkAlarmButton.addEventListener('click', handleAlarmDetails);
});
