async function populateEvents(year, month,  day = null, del = null) {
    try {
        // Define a function that returns a promise
        function getEvents() {
            return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4) {
                        if (xhr.status === 200) {
                            // Parse the response as JSON
                            const eventData = JSON.parse(xhr.responseText);
                            // Resolve the promise with the parsed data
                            resolve(eventData);
                        } else {
                            // Reject the promise with an error message
                            reject(new Error("Failed to fetch events."));
                        }
                    }
                };
                if (day !== null) {
                    xhr.open("GET", `/events/${year}/${month}/${day}`, true);
                } else {
                    xhr.open("GET", `/events/${year}/${month}`, true);
                }
                xhr.send();
            });
        }
        // Await the promise returned by getEvents
        getEvents().then(eventData => {
            if (del){
                containersToClearOnDelete = document.querySelectorAll('.dayEventContainer');
                containersToClearOnDelete.forEach(function (container){
                    container.parentNode.removeChild(container);
                });
            };
            eventData.forEach(function (event) {
                // Extract event information
                const eventTimestring = event.timeString
                var eventDay = event.eventDay;
                if (eventDay[0] == '0'){
                    eventDay = eventDay[1];
                }
                const eventName = event.eventName;
                const eventMonth = event.eventMonth;

                // Select all <td> elements
                var dayElements = document.querySelectorAll("td:not(.noday)");

                // Loop through the <td> elements
                dayElements.forEach(function (td) {
                    // Check if the innerHTML (or textContent) matches the desired value
                    if (td.getAttribute('dayValue') === eventDay) {
                        // Check if there's a "dayEventContainer" element within the <td>
                        let eventContainer = td.querySelector('.dayEventContainer');

                        // If it doesn't exist, create and append it
                        if (!eventContainer) {
                            eventContainer = document.createElement('div');
                            eventContainer.className = 'dayEventContainer';
                            td.appendChild(eventContainer);
                        }

                        // Create a unique event key
                        const eventKey = `${eventTimestring}-${eventName}-${eventDay}-${eventMonth}`;
                        const existingEvent = eventContainer.querySelector(`.event[data-event-key="${eventKey}"]`);
                        
                        if (!existingEvent) {
                            const eventDiv = document.createElement('div');
                            eventDiv.className = 'event';
                            eventDiv.textContent = eventTimestring + ' ' + eventName;
                            eventDiv.setAttribute('data-event-key', eventKey);
                            eventDiv.style.setProperty("background-color", event.eventColor || "#5f9ea0", "important");
                            eventContainer.appendChild(eventDiv);

                            //console.log('placeing' + eventKey)

                        } else {
                            //console.log('skipping' + eventName)
                        }

                        if (eventContainer.scrollHeight > eventContainer.clientHeight) {
                            // If there's overflow, add the 'overflow' class to enable scrolling
                            eventContainer.classList.add('overflow');
                        } else {
                            // If there's no overflow, remove the 'overflow' class
                            eventContainer.classList.remove('overflow');
                        }


                        // If you found the match, you can exit the loop
                        return;
                    }
                });
            });
            eventContainers = document.querySelectorAll('.dayEventContainer');
            eventContainers.forEach(dayEventContainer => {
                // Get all the events within the dayEventContainer
                const events = Array.from(dayEventContainer.querySelectorAll('.event'));

                // Sort the events based on time
                events.sort((eventA, eventB) => {
                    // Extract the time from the data-event-key attribute
                    const timeA = eventA.getAttribute('data-event-key').split('--')[0];
                    const timeB = eventB.getAttribute('data-event-key').split('--')[0];
                    

                    // Handle possible 12 and 24 hour times
                    const hasAMPMA = timeA.includes("AM") || timeA.includes("PM");
                    const hasAMPMB = timeB.includes("AM") || timeB.includes("PM");
                    
                    let hoursA, minutesA, hoursB, minutesB, periodA, periodB;
                    
                    if (hasAMPMA) {
                      [hoursA, minutesA, periodA] = timeA.match(/(\d+):(\d+) (AM|PM)/).slice(1);
                    } else {
                      [hoursA, minutesA] = timeA.match(/(\d+):(\d+)/).slice(1);
                    }
                    
                    if (hasAMPMB) {
                      [hoursB, minutesB, periodB] = timeB.match(/(\d+):(\d+) (AM|PM)/).slice(1);
                    } else {
                      [hoursB, minutesB] = timeB.match(/(\d+):(\d+)/).slice(1);
                    }
                    
                    
                    // Function to convert 12-hour time to 24-hour time
                    function convertTo24Hour(hours, period) {
                      let hours24;
                      if (period === 'AM' && hours === '12') {
                        hours24 = '00';
                      } else if (period === 'PM' && hours !== '12') {
                        hours24 = String(parseInt(hours) + 12);
                      } else {
                        hours24 = hours;
                      }
                      return hours24;
                    }
                    
                    // Convert hours to 24-hour format for comparison
                    const hoursA24 = convertTo24Hour(hoursA, periodA);
                    const hoursB24 = convertTo24Hour(hoursB, periodB);
                    
                  
                    // Compare based on 24-hour format
                    if (hoursA24 < hoursB24) return -1; // Event A is before Event B
                    if (hoursA24 > hoursB24) return 1;  // Event A is after Event B
                  
                    // If hours are the same, compare minutes
                    if (minutesA < minutesB) return -1; // Event A is before Event B
                    if (minutesA > minutesB) return 1;  // Event A is after Event B
                  
                    // If both hours and minutes are the same, they are equal
                    return 0;
                })
                // Clear the existing events in dayEventContainer
                dayEventContainer.innerHTML = '';

                // Append the sorted events back to dayEventContainer
                events.forEach(event => {
                    dayEventContainer.appendChild(event);

                    event.addEventListener("click", function () {
                        const eventKey = event.getAttribute("data-event-key");
                        //console.log('eventKey:', eventKey);
                    
                        // Fetch event details from the server
                        fetch('/get_event_details', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ 'eventKey': eventKey }),
                        })
                        .then(response => response.json())
                        .then(eventData => {
                            // Populate the event menu with eventData
                            populateEventMenu(eventData);
                            //console.log(eventData);
                        })
                        .catch(error => {
                            console.error("Error fetching event details:", error);
                        });
                    });
                });
            });
        });
    } catch (error) {
        console.error(error);
    }
}
