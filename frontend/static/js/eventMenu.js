function getMonthNumber(monthName) {
    var months = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];
    var index = months.indexOf(monthName);
    
    // Check if the monthName exists in the array
    if (index !== -1) {
        // Adding 1 to convert from zero-based index to 1-based month number
        var monthNumber = index + 1;
        if (monthNumber < 10){
            return "0" + monthNumber.toString() 
        } else {
            return monthNumber.toString()
        }
    } else {
        return 'Error' 
    }
}


function addEventMenus() {


    // Get all day elements (you can adjust the selector based on your HTML structure)
    var dayElements = document.querySelectorAll("td:not(.noday)");


    // Get references to menu elements
    var eventContainer = document.getElementById("eventContainer");
    var eventMenu = document.getElementById("eventMenu");
    var eventDateInput = document.getElementById("eventDate");
    var eventTimeInput = document.getElementById("eventTime");
    var eventNameInput = document.getElementById("eventName");
    var eventDescriptionInput = document.getElementById("eventDescription");
    var saveEventButton = document.getElementById("saveEvent");
    var cancelEventButton = document.getElementById("cancelEvent");

    // Add a click event listener to each day element
    dayElements.forEach(function (dayElement) {
        dayElement.addEventListener("click", function () {
            // Show the menu
            eventContainer.style.display = "flex";
            eventMenu.style.display = "flex"

            // Capture the date from the clicked day (you can use a data attribute or other method)
            var selectedMonthYear = document.querySelector(".month th").textContent.trim();
            var words = selectedMonthYear.split(/\s+/);
            var selectedMonth = getMonthNumber(words[1]);
            var selectedYear = words[2];
            var selectedDay = dayElement.textContent;
            if (parseInt(selectedDay) < 10) {
                selectedDay  = 0 + selectedDay
            };
            var date =  selectedMonth + '/' + selectedDay.toString() + "/" + selectedYear;
            // Set any date-related information in the menu (optional)
            eventDateInput.value = date;
        });
    });

    // Add a click event listener to the "Save" button
    saveEventButton.addEventListener("click", function () {
        // Get the captured data
        // var time = eventTimeInput.value;
        // var name = eventNameInput.value;
        // var description = eventDescriptionInput.value;

        // Perform any additional processing here, such as saving the data


        // Hide the menu
        eventContainer.style.display = "none";
        eventMenu.style.display = "none";
    });


    // Add a click event listener to the "Cancel" button
    cancelEventButton.addEventListener("click", function () {
        // Hide the menu without saving any data
        eventContainer.style.display = "none";
        eventMenu.style.display = "none";
    });
}

document.addEventListener("DOMContentLoaded", function () {
    addEventMenus()
})
