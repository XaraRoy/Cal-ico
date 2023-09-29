async function populateEvents(year, month) {
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
                xhr.open("GET", `/events/${year}/${month}`, true);
                xhr.send();
            });
        }

        // Await the promise returned by getEvents
        const eventData = await getEvents();

        // Now eventData contains the response data as an array, and you can process it
        eventData.forEach(function (event) {
            // Extract event information
            const eventTimestring = event.timeString
            const eventDay = event.eventDay;
            const eventName = event.eventName;

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
                    
                    const eventDiv = document.createElement('div');
                    eventDiv.className = 'event';
                    eventDiv.textContent = eventTimestring + ' ' + eventName;
                    eventContainer.appendChild(eventDiv);

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
    } catch (error) {
        console.error(error);
    }
}
