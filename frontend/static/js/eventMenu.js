let colorPicker;
const defaultColor = "#5f9ea0";
function startup() {
    colorPicker = document.querySelector("#color-picker");
    colorPicker.value = defaultColor;
    colorPicker.select();
  }
window.addEventListener("load", startup, false);

let saveButtonListenerAdded = false;     // So we dont add event 
let deleteButtonListenerAdded = false;  // listeners to the 
let cancelButtonListenerAdded = false  // buttons for every day.


let isEditing = false;  // Checks if we need to use editing function (delete button, save/edit logic, populating menus)
let eventKey = null;   // For edits/deletes
               
// Defining selectors that are needed for editing
let selectedDay = null;
let eventYear = null;            
let eventMonth = null;
let eventDay = null;  

let eventDateInput = null;
let eventNameInput = null;
let eventDescriptionInput = null;
let notificationFrequencyDropdown = null;
let recurrenceEndDateContainer = null;
let recurrenceEndDate = null;
let monthlyOptionsDiv = null;
let monthlyDayOfMonthInput = null;
let weeklyOptionsDiv = null;
let weeklyCheckboxes = null;
let hourSelector = null;
let minuteSelector = null;
let ampmSelector = null;
let saveEventButton = null;
let deleteEventButton = null;


// Called from eventPopulate.js
function populateEventMenu(eventData){
    // Buttons changed 
    deleteEventButton.style.display = 'Block'
    saveEventButton.textContent = 'Save Changes';
    
    // Variables for submitting
    isEditing = true;
    eventKey = eventData.key;

    // Fill the fields
    eventNameInput.value = eventData.eventName;
    eventDateInput.value = eventData.eventDate;
    eventDescriptionInput.value = eventData.eventDescription;
    notificationFrequencyDropdown.value = eventData.notificationFrequency;
    eventTime = eventData.timeString; // 10:00 AM
    hourSelector.value = eventTime.slice(0,2);
    minuteSelector.value = eventTime.slice(3,5);
    ampmSelector.value = eventTime.slice(6,8);
    colorPicker.value = eventData.eventColor || defaultColor;
    // if (eventData.selectedRecurrence != null){  // Removed this functionality until the route is built
    //     recurrenceEndDate.value = eventData.selectedRecurrence.endDate;
    //     var reccurenceType = eventData.selectedRecurrence.type
    //     recurrenceTypeDropdown.value = reccurenceType.toLowerCase()   ;
    //     recurrenceEndDateContainer.style.display = 'block';
    //     if (reccurenceType == 'Monthly'){
    //         monthlyOptionsDiv.style.display = 'block';
    //         monthlyDayOfMonthInput.value =  eventData.selectedRecurrence.dayOfMonth;
    //     } else if (reccurenceType == 'Weekly'){
    //         weeklyOptionsDiv.style.display = 'block';
    //         // Loop through the checkboxes and check them if their value matches a day in daysOfWeek
    //         weeklyCheckboxes.forEach(checkbox => {
    //             const dayValue = checkbox.value.toLowerCase(); // Make sure it's lowercase for comparison
    //             if (eventData.selectedRecurrence.daysOfWeek.includes(dayValue)) {
    //                 checkbox.checked = true;
    //             } else {
    //                 checkbox.checked = false;
    //             }
    //         });    
    //     };
    // };
};

// Called on save/delete/cancel button as well as when clicking into a new day element
function clearMenu(){
    // Hide the menu without saving any data
    eventContainer.style.display = "none";
    isEditing = false;
    eventMenu.style.display = "none";
    recurrenceEndDateContainer.style.display = "none"
    // Clear the input values
    eventDateInput.value = "";
    eventNameInput.value = "";
    eventDescriptionInput.value = "";
    hourSelector.value = '01'
    minuteSelector.value = '00'
    ampmSelector.value = 'AM'
    recurrenceEndDate.value = ''
    recurrenceTypeDropdown.value = "none";
    weeklyOptionsDiv.style.display = 'none';
    weeklyCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    monthlyOptionsDiv.style.display = 'none';
    monthlyDayOfMonthInput.value = '';
    notificationFrequencyDropdown.value = "never"

    eventContainer.classList.remove('failed');
    saveEventButton.textContent = 'Save';
    deleteEventButton.style.display = 'none';
};

function getMonthNumber(monthName) {  // monthName = "January"
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
    };
};

// called from monthSelect.js
function addEventMenus() {
    // Get all day elements
    var dayElements = document.querySelectorAll("td:not(.noday)");
    // Get references to menu elements (contianers to show/hide)
    var eventContainer = document.getElementById("eventContainer");
    var eventMenu = document.getElementById("eventMenu");
    recurrenceEndDateContainer = document.getElementById('recurrenceEndDateContainer');
    weeklyOptionsDiv = document.getElementById("weekly-options");
    monthlyOptionsDiv = document.getElementById("monthly-options");
    eventColorInput = document.getElementById("color-picker")
    // Set the Buttons
    saveEventButton = document.getElementById("saveEvent");
    deleteEventButton = document.getElementById("deleteEvent")
    var cancelEventButton = document.getElementById("cancelEvent");
    // get inputs
    // for strings
    eventNameInput = document.getElementById("eventName");
    eventDescriptionInput = document.getElementById("eventDescription");
    // for date
    eventDateInput = document.getElementById("eventDate");
    // for notifications...
    notificationFrequencyDropdown = document.getElementById("notification-frequency");
    // for time...
    hourSelector = document.getElementById("hour");
    minuteSelector = document.getElementById("minute");
    ampmSelector = document.getElementById("ampm");
    // for reoccuring events
    recurrenceTypeDropdown = document.getElementById("recurrence-type");
    recurrenceEndDate = document.getElementById('end-date');
    weeklyCheckboxes = document.querySelectorAll('input[name^="day-"]');
    monthlyDayOfMonthInput = document.getElementById("day-of-month");

    // Defined each dayelement above so the recurrence listener can get the current day
    var date = null;

    // Add a click event listener to each day element of the calendar
    dayElements.forEach(function (dayElement) {
        dayElement.addEventListener("click", function () {
            // Show/Hide the menu
            eventContainer.style.display = eventContainer.style.display === "none" ? "flex" : "none";
            eventMenu.style.display = eventMenu.style.display === "none" ? "flex" : "none";


            // Capture the date from the clicked day (you can use a data attribute or other method)
            var selectedMonthYear = document.querySelector(".month th").textContent.trim();
            var words = selectedMonthYear.split(/\s+/);
            selectedMonth = getMonthNumber(words[1]);
            selectedYear = words[2];
            selectedDay = dayElement.getAttribute('dayValue');
            if (parseInt(selectedDay) < 10) {  
                selectedDay  = 0 + selectedDay; // No zfill in js =(
            };
            date =  selectedYear + '-' + selectedMonth + '-' + selectedDay.toString()
            eventDateInput.value = date;
            recurrenceEndDate.value = date;
        });
    });

    // Add an event listener to the recurrence type dropdown
    recurrenceTypeDropdown.addEventListener("change", function() {
        // Dont allow days before today
        recurrenceEndDate.min = date;
        const selectedValue = this.value;

        // Hide all custom divs initially
        weeklyOptionsDiv.style.display = "none";
        monthlyOptionsDiv.style.display = "none";
        recurrenceEndDateContainer.style.display = 'none';

        // Show the custom div corresponding to the selected recurrence type
        if (selectedValue === "weekly") {
            weeklyOptionsDiv.style.display = "flex";
            recurrenceEndDateContainer.style.display =  'flex';

        } else if (selectedValue === "monthly") {
            monthlyOptionsDiv.style.display = "flex";
            recurrenceEndDateContainer.style.display =  'flex';

        } else if (selectedValue === 'daily') {
            recurrenceEndDateContainer.style.display =  'flex';
        }
    });

    // Request notification permission if requested (notify.js)
    notificationFrequencyDropdown.addEventListener("change", function() {
        main() // TODO should prob rename this.
    });

    // add a click event listener to the "Delete" button
    if (!deleteButtonListenerAdded){
        // Add an event listener to the delete button
        deleteEventButton.addEventListener("click", function () {
            if (eventKey) {
                // Create an object with the key to be sent to the server
                const data = {
                    'key': eventKey
                };

                // Send a POST request to the /delete_event route
                fetch('/delete_event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    clearMenu();
                    populateEvents(selectedYear, selectedMonth, day=null, del=true);

                    if (response.ok) {
                        console.log("Event deleted successfully!");
                    } else {
                        console.error("Error deleting event.");
                    }
                })
                .catch(error => {
                    console.error("An error occurred:", error);
                });
            }
        });
        deleteButtonListenerAdded = true;
    };

    // Add a click event listener to the "Save" button
    if (!saveButtonListenerAdded) {
        saveEventButton.addEventListener("click", function () {
            // Get the captured data
            var eventName = eventNameInput.value;
            var eventDate = eventDateInput.value;
            var eventDescription = eventDescriptionInput.value;
            var notificationFrequency = notificationFrequencyDropdown.value;
            var eventColor = colorPicker.value;

            // Get selected values from the dropdowns
            const selectedHour = hourSelector.value;
            const selectedMinute = minuteSelector.value;
            let selectedAMPM = "" 
            if (clockformat == 12){ 
                selectedAMPM = ampmSelector.value;
            // Create a time string format
            }
            const timeString = `${selectedHour}:${selectedMinute} ${selectedAMPM}`; 


            const selectedValue = recurrenceTypeDropdown.value;
            let selectedRecurrence = {}; // Object to store selected recurrence data
            let selectedRecurrenceEndDate = document.getElementById('end-date').value;
            // Depending on the selected recurrence type, capture the relevant data
            if (selectedValue === "daily") {
                selectedRecurrence.type= "Daily";
                selectedRecurrence.endDate = selectedRecurrenceEndDate;
            } else if (selectedValue === "weekly") {
                selectedRecurrence.type = "Weekly";
                selectedRecurrence.endDate = selectedRecurrenceEndDate;
                selectedRecurrence.daysOfWeek = Array.from(weeklyCheckboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value);
            } else if (selectedValue === "monthly") {
                selectedRecurrence.type = "Monthly";
                selectedRecurrence.dayOfMonth = monthlyDayOfMonthInput.value;
                selectedRecurrence.endDate = selectedRecurrenceEndDate;

            } else {
                selectedRecurrence = null; // Set to null if none selected
            };
            eventMonth = eventDate.split('-')[1];
            eventDay = eventDate.split('-')[2];
            eventYear = eventDate.split('-')[0];
            const timeZone =  Intl.DateTimeFormat().resolvedOptions().timeZone;

            // Create a data object to send in the POST request
            const data = {
                'eventName': eventName,
                'eventDate': eventDate,
                'eventMonth': eventMonth,
                'eventDay': eventDay,
                'eventYear': eventYear,
                'timeString': timeString,
                'timeZone': timeZone,
                'eventDescription': eventDescription,
                'selectedRecurrence': selectedRecurrence,
                'notificationFrequency': notificationFrequency,
                'eventColor' : eventColor
            };
            

            let endpoint = '/save_event';
            if (isEditing) {
                data['key'] = eventKey;
                endpoint = '/update_event';
            }

            fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    // Handle the response as needed (e.g., show a success message)
                    if (response.status  === 200) {
                        console.log("Event data submitted successfully!");
                        // Clear form elements
                        populateEvents(selectedYear, selectedMonth, day=null, del=isEditing);
                        clearMenu();
                    } else {
                        console.error("Error submitting event data.");
                        eventContainer.style.setProperty('display', 'flex')
                        eventMenu.style.setProperty('display', 'flex')
                        eventContainer.classList.add('failed')
                    }
                })
                .catch(error => {
                    console.error("An error occurred:", error);
                });
        });
        saveButtonListenerAdded = true;
    };

    // Add a click event listener to the "Cancel" button
    if (!cancelButtonListenerAdded){
        cancelEventButton.addEventListener("click", function () {
            clearMenu();
        });
        cancelButtonListenerAdded = true;
    };
};

