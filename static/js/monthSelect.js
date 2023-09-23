// Define a variable to keep track of the selected month and year
var selectedMonth = 9; 
var selectedYear = 2023;




function updateTable(year, month) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var newTableHTML = xhr.responseText;
            // Replace the table content
            document.querySelector("#calendarTable").innerHTML = newTableHTML;
            //add the prev/next buttons
            displayMonth();
            // Call the highlightToday function to update the highlighting
            highlightToday();

        }
    };
    xhr.open("GET", `/${year}/${month}`, true);
    xhr.send();
}


// Function to display the month selectors
function displayMonth() {
    var monthElement = document.querySelector(".month th");
    monthElement.innerHTML = `
        <button onclick="prevMonth()">Previous</button>
        ${getMonthName(selectedMonth)} ${selectedYear}
        <button onclick="nextMonth()">Next</button>
    `;
}

// Function to get the name of the month
function getMonthName(month) {
    var months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];
    return months[month - 1];
}



// Function to add event listeners to empty cells in the top and bottom rows
function addEmptyCellListeners() {
    var cells = document.querySelectorAll("td");
    
    // Add event listeners to empty cells in the top (3rd) row
    for (var i = 0; i < 7; i++) {
        var topEmptyCell = cells[i];
        if (topEmptyCell.classList.contains("noday")) {
            topEmptyCell.addEventListener("click", prevMonth);
        }
    }

    // Add event listeners to empty cells in the bottom row
    for (var i = cells.length - 7; i < cells.length; i++) {
        var bottomEmptyCell = cells[i];
        if (bottomEmptyCell.classList.contains("noday")) {
            bottomEmptyCell.addEventListener("click", nextMonth);
        }
    }
}




// Function to move to the previous month
function prevMonth() {
    selectedMonth--;
    if (selectedMonth < 1) {
        selectedMonth = 12;
        selectedYear--;
    }
    displayMonth();
    // You can update your calendar content here for the previous month
    updateTable(selectedYear, selectedMonth);
    highlightToday();

}

// Function to move to the next month
function nextMonth() {
    selectedMonth++;
    if (selectedMonth > 12) {
        selectedMonth = 1;
        selectedYear++;
    }
    displayMonth();
    // You can update your calendar content here for the next month
    updateTable(selectedYear, selectedMonth);
    highlightToday();

}

// Wait for the DOM to be fully loaded before executing the initial display
document.addEventListener("DOMContentLoaded", function () {
    // Initial display of the selected month
    displayMonth();
});