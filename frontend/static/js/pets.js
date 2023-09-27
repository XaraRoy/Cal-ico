// Get references to the elements
const pethouse = document.querySelector("#pethouse");
const petSelector = document.querySelector("#petSelector");
const petImages = document.querySelectorAll(".pet");
let activePet = null; // To store the currently active pet
let carriedPet = null; // To store the carried pet
let isDragging = false; // To track if dragging is in progress
// Variable to store the spawned carried pet
let spawnedCarriedPet = null;


//close the pet selector

petSelector.addEventListener("mousedown", function (event) {
    petSelector.style.display = "none"; // Hide the petSelector
});

//open the pet selector
pethouse.addEventListener("click", function () {
    // Toggle the display of the petSelector div
    petSelector.style.display = petSelector.style.display === "none" ? "flex" : "none";
});

// Function to spawn the carried pet at the mouse
function spawnCarriedPet(event) {
    petSelector.style.display = petSelector.style.display === "none" ? "flex" : "none";
    carriedPet = activePet.cloneNode();
    carriedPet.classList.remove("fallingPet");
    carriedPet.classList.add("carried");
    carriedPet.style.position = "absolute";
    carriedPet.style.left = event.clientX + "px";
    carriedPet.style.top = event.clientY + "px";
    document.body.appendChild(carriedPet);
    spawnedCarriedPet = carriedPet;
}

// Function to handle pet selection and start dragging
function startCarryingPet(petImage, event) {
    event.preventDefault(); // Prevent text selection when dragging
    ActivePet = document.querySelector('.ActivePet')
    if (ActivePet){
        document.body.removeChild(ActivePet);
    }
    // Remove the previously spawned pet, if any
    if (spawnedCarriedPet) {
      document.body.removeChild(spawnedCarriedPet);
      spawnedCarriedPet = null;
    }

    // Check if the clicked pet is already active
    if (petImage !== activePet) {
        // Deactivate the previously active pet
        if (activePet) {
            activePet.classList.remove("activate");
        }
        // Activate the clicked pet
        petImage.classList.add("activate");
        // Set the active pet
        activePet = petImage;
        // Spawn the carried pet at the mouse cursor
        spawnCarriedPet(event);
        // Start dragging the carried pet
        isDragging = true;
    }
}

// Add mousedown event listeners to the pet images, to pick up already selected pets
petImages.forEach(petImage => {
    petImage.addEventListener("mousedown", function (event) {
        startCarryingPet(petImage, event);
    });
});

// Add mousemove event listener to the document to move the carried pet
document.addEventListener("mousemove", function (event) {
    if (isDragging && carriedPet) {
        // Set the position of the carried pet to follow the mouse cursor
        carriedPet.style.left = event.clientX + "px";
        carriedPet.style.top = event.clientY + "px";
    }
});

// Function to handle pet drop and apply falling animation
function dropCarriedPet() {
    if (isDragging && carriedPet) {
        const screenHeight = window.innerHeight;
        const currentPosition = carriedPet.getBoundingClientRect().bottom;
        const fallDistance = screenHeight - currentPosition + "px";
        // Set the fall distance as a CSS variable
        carriedPet.style.setProperty("--fall-distance", fallDistance);
        carriedPet.classList.remove("carried");
        carriedPet.classList.add("fallingPet");
        spawnedCarriedPet = carriedPet;
        carriedPet = null;
        isDragging = false;

        setTimeout(() => {
            if (spawnedCarriedPet) {
                spawnedCarriedPet.classList.remove("fallingPet");
                spawnedCarriedPet.style.bottom = '0px'
                spawnedCarriedPet.style.removeProperty('top');
            }
        }, 1000);
    }
}

// Add mouseup event listener to stop dragging
document.addEventListener("mouseup", function () {
    dropCarriedPet();
});

// Add a click event listener to the spawned carried pet
document.addEventListener("mousedown", function (event) {
    if (spawnedCarriedPet && event.target === spawnedCarriedPet) {
        startCarryingPet(spawnedCarriedPet, event);
    }
});
