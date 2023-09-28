// Define a variable to keep track of the selected month and year
// TODO extract
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
            // add prev/next month moves to empty cells
            addEmptyCellListeners();
            //addEventMenus
            addEventMenus()
        }
    };
    xhr.open("GET", `/cal/${year}/${month}`, true);
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
    try{
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
    } catch (error) {
        console.error('error adding empty cell listeners:')
        console.error(error)
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
    updateTable(selectedYear, selectedMonth);
    populateEvents(selectedYear, selectedMonth);
}

// Function to move to the next month
function nextMonth() {
    selectedMonth++;
    if (selectedMonth > 12) {
        selectedMonth = 1;
        selectedYear++;
    }
    displayMonth();
    updateTable(selectedYear, selectedMonth);
    populateEvents(selectedYear, selectedMonth);

}

// Wait for the DOM to be fully loaded before executing the initial display
document.addEventListener("DOMContentLoaded", function () {
    try {
        // Initial display of the current month
        displayMonth();
        // set the empty cells to change months
        addEmptyCellListeners();
        // fetch the events for the current month
        populateEvents(selectedYear, selectedMonth)
    } catch (error) {
        console.error('error loading initial calendar:')
        console.error(error)
    }

});