async function populateEvents(year, month,  day = null) {
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

                        const eventKey = `${eventTimestring}-${eventName}-${eventDay}-${eventMonth}`;

                        // Create a unique event key
                        const existingEvent = eventContainer.querySelector(`.event[data-event-key="${eventKey}"]`);

                        if (!existingEvent) {
                            const eventDiv = document.createElement('div');
                            eventDiv.className = 'event';
                            eventDiv.textContent = eventTimestring + ' ' + eventName;
                            eventDiv.setAttribute('data-event-key', eventKey);
                            eventContainer.appendChild(eventDiv);
                            eventDiv.addEventListener("click", function() {
                                // TODO EVent Updating
                                // console.log('eventKey:', eventKey)
                            });
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

                    const [hoursA, minutesA, periodA] = timeA.match(/(\d+):(\d+) (AM|PM)/).slice(1);
                    const [hoursB, minutesB, periodB] = timeB.match(/(\d+):(\d+) (AM|PM)/).slice(1);
                    // Convert hours to 24-hour format for comparison
                    const hoursA24 = periodA === 'PM' ? parseInt(hoursA) + 12 : parseInt(hoursA);
                    const hoursB24 = periodB === 'PM' ? parseInt(hoursB) + 12 : parseInt(hoursB);
                  
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
                });
            });
        });
    } catch (error) {
        //console.error(error);
    }
}
