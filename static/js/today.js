// Function to highlight today's date
function highlightToday() {
    var today = new Date();

    var selectedMonthYear = document.querySelector(".month th").textContent.trim();
    var words = selectedMonthYear.split(/\s+/); // Split by one or more spaces

    var selectedMonth = words[1];
    var selectedYear = parseInt(words[2]);
    // console.log(selectedMonth, selectedYear)
    // console.log(today.getDate(), getMonthName(today.getMonth() + 1), today.getFullYear())

    var cells = document.querySelectorAll("td");
    
    cells.forEach(function (cell) {
        var cellDay = parseInt(cell.textContent.trim());
        if (cellDay ===  today.getDate() && selectedMonth === getMonthName(today.getMonth() + 1) && selectedYear === today.getFullYear()) {
            cell.style.backgroundColor = "yellow";
        } else {
            cell.style.backgroundColor = "";
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    highlightToday();
});
