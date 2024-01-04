function showTabContent(tabId) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');

    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }

    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    const selectedButton = document.querySelector(`[onclick="showTabContent('${tabId}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const tabButtons = document.querySelectorAll(".tab-button");

    tabButtons.forEach(button => {
        button.addEventListener("click", function () {
            const tabId = button.getAttribute("onclick").match(/'([^']+)'/)[1];
            showTabContent(tabId);
        });
    });

    // Initially show the 'Order Check' tab content and set it as active
    showTabContent('order-check-content');


    // Additional event listeners
    document.getElementById('go-button').addEventListener('click', executeQueries);
    document.getElementById('order-id').addEventListener('keydown', function (event) {
        if (event.key === "Enter") {
            executeQueries();
        }
    });
    document.getElementById('analyse-button').addEventListener('click', function () {
        console.log('Analyse button clicked...');
        analyseData();
        fetchSTENData();
        fetchSTBAData();
    });

    const checkAlarmButton = document.getElementById('check-alarm-button');
    checkAlarmButton.addEventListener('click', handleAlarmDetails);

    // Initially show the 'Order Check' tab content and set it as active
    showTabContent('order-check-content');
});
