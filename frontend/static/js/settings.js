let clockformat = null



  

// Corrected event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function(){
    // Function to set a cookie with the clock format preference as an integer (12 or 24)
    function setClockFormatPreference(format) {
        document.cookie = `clockformat=${format}; expires=Sun, 31 Dec 2099 00:00:00 UTC; path=/`;
    }
    
    // Function to get the clock format preference from the cookie as an integer
    function getClockFormatPreference() {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'clockformat') {
            return parseInt(value, 10); // Parse the value as an integer
        }
        }
        // Return a default value if the cookie is not found
        return 12; // You can set your preferred default here as an integer
    }
   
    // Set the clock format preference (e.g., when the user changes it)
    const clockToggle12Hour = document.getElementById("clock-12-hour");
    const clockToggle24Hour = document.getElementById("clock-24-hour");
    // Get a reference to the <select> element
    const hourSelect = document.getElementById("hour");
    const ampmSelector = document.getElementById('ampm')
    // Add event listeners to the checkboxes
    clockToggle12Hour.addEventListener("change", function() {
        if (clockToggle12Hour.checked) {
        clockformat = 12;
        populateHourOptions(clockformat);
        setClockFormatPreference(12);
        clockToggle24Hour.checked = false;
        }
    });
    
    clockToggle24Hour.addEventListener("change", function() {
        if (clockToggle24Hour.checked) {
        clockformat = 24;
        populateHourOptions(clockformat);
        setClockFormatPreference(24);
        clockToggle12Hour.checked = false;
        }
    });

    const clock_menu = document.getElementById('clock-menu');
    const settings_button = document.getElementById('settings-img');
    // Function to toggle the clock menu display
    function toggleClockMenu() {
        if (clock_menu.style.display === "flex" || clock_menu.style.display === "") {
            clock_menu.style.display = "none"; // If it's currently visible, hide it
        } else {
            clock_menu.style.display = "flex"; // If it's currently hidden, display it
        }
    }
    settings_button.addEventListener('click', toggleClockMenu);
    


    // Function to populate the <select> with options from 01 to 12 with leading zeros
    function populateHourOptions(clockformat) {
        // Clear any existing options
        hourSelect.innerHTML = "";

        // Add options from 01 to 12 or 01 to 24 based on clockformat
        for (let i = 1; i <= clockformat; i++) {
            const option = document.createElement("option");
            const value = i < 10 ? "0" + i : i.toString();
            option.value = value;
            option.textContent = value;
            hourSelect.appendChild(option);
        }
        if (clockformat == 12){
            ampmSelector.style.display = 'block'
        } else {
            ampmSelector.style.display = 'none';
        };


    }

    clockformat = getClockFormatPreference();
    console.log(`Stored clock format preference: ${clockformat}`);
    // Set the initial clock format based on the cookie
    if (clockformat === 12) {
        clockToggle12Hour.checked = true;
        clockToggle24Hour.checked = false;
    } else {
        clockToggle24Hour.checked = true;
        clockToggle12Hour.checked = false;
    }
    // Initialize the hour options based on the stored format
    populateHourOptions(clockformat);


});
