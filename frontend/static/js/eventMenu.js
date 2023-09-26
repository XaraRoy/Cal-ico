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
    var eventNameInput = document.getElementById("eventName");
    var eventDescriptionInput = document.getElementById("eventDescription");
    var saveEventButton = document.getElementById("saveEvent");
    var cancelEventButton = document.getElementById("cancelEvent");
    // Get references to the recurisve DOM elements
    const recurrenceTypeDropdown = document.getElementById("recurrence-type");
    const weeklyOptionsDiv = document.getElementById("weekly-options");
    const monthlyOptionsDiv = document.getElementById("monthly-options");
    const notificationFrequencyDropdown = document.getElementById("notification-frequency");
    // Add a click event listener to each day element of the calendar
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
                selectedDay  = 0 + selectedDay;
            };
            var date =  selectedMonth + '/' + selectedDay.toString() + "/" + selectedYear;
            eventDateInput.value = date;



        });
    });
    // Add an event listener to the recurrence type dropdown
    recurrenceTypeDropdown.addEventListener("change", function() {
    const selectedValue = this.value; 

    // Hide all custom divs initially
    weeklyOptionsDiv.style.display = "none";
    monthlyOptionsDiv.style.display = "none";

    // Show the custom div corresponding to the selected recurrence type
    if (selectedValue === "weekly") {
        weeklyOptionsDiv.style.display = "block";
    } else if (selectedValue === "monthly") {
        monthlyOptionsDiv.style.display = "block";
    }
    });
    notificationFrequencyDropdown.addEventListener("change", function() {
        main() // should prob rename this, but it is the notification permission
    });




    // Get references to the recurisve selection DOM elements
    const weeklyCheckboxes = document.querySelectorAll('input[name^="day-"]');
    const monthlyDayOfMonthInput = document.getElementById("day-of-month");
        


    // Add a click event listener to the "Save" button
    saveEventButton.addEventListener("click", function () {
        // Get the captured data
        var eventName = eventNameInput.value;
        var eventDate = eventDateInput.value;
        var eventDescription = eventDescriptionInput.value;
        var notificationFrequency = notificationFrequencyDropdown.value;

        // Get selected values from the dropdowns
        const selectedHour = document.getElementById("hour").value;
        const selectedMinute = document.getElementById("minute").value;
        const selectedAMPM = document.getElementById("ampm").value;
        // Create a time string in 12-hour format
        const timeString = `${selectedHour}:${selectedMinute} ${selectedAMPM}`;


        const selectedValue = recurrenceTypeDropdown.value;
        let selectedRecurrence = {}; // Object to store selected recurrence data
      
        // Depending on the selected recurrence type, capture the relevant data
        if (selectedValue === "daily") {
            selectedRecurrence.type= "Daily";
        } else if (selectedValue === "weekly") {
            selectedRecurrence.type = "Weekly";
            selectedRecurrence.daysOfWeek = Array.from(weeklyCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
        } else if (selectedValue === "monthly") {
            selectedRecurrence.type = "Monthly";
            selectedRecurrence.dayOfMonth = monthlyDayOfMonthInput.value;
        } else {
            selectedRecurrence = null; // Set to null if none selected
        }




        // log the data
        console.log("Inputed Name:", eventName);
        console.log("Selected Date:", eventDate);
        console.log("Selected Time:", timeString);
        console.log('Inputed description:', eventDescription)
        console.log('selected recurrence:', selectedRecurrence)
        console.log('selected notification:', notificationFrequency)
        // Perform any additional processing here, such as saving the data
        // TODO

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
