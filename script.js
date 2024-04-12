// Adding Event Listener to the login form when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    console.log(loginForm)
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

// Function to handle login
function handleLogin(event) {
    event.preventDefault(); // Prevent the default form submission

    const user = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log(user)
    console.log(password)
    fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        
        if (data) {
            window.location.href = '/homepage.html';
        } else {
            alert('Login failed: ' + data.message);
        }
    })
}
})

document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        alert('Signup successful!');
        window.location.href = '/login.html'; // Redirect to login page or homepage as needed
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Signup failed, please try again.');
    });
});

    // Adding event listener to load workouts button
    // const loadWorkoutsBtn = document.getElementById('loadWorkoutsBtn');
    // if (loadWorkoutsBtn) {
    //     loadWorkoutsBtn.addEventListener('click', loadWorkouts);
    // }

// Function to load workouts

document.addEventListener('DOMContentLoaded', () => {
    const loadWorkoutsBtn = document.getElementById('loadWorkoutsBtn');
    if (loadWorkoutsBtn) {
        loadWorkoutsBtn.addEventListener('click', loadWorkouts);
    }
});
function loadWorkouts() {
    fetch('http://localhost:3000/api/workouts/',) // Adjust the URL based on your actual endpoint
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); // Here's your workouts data
        displayWorkouts(data); // Call to a function that will handle the display of workouts
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

// Function to display workouts data on the page
function displayWorkouts(workouts) {
    const workoutsContainer = document.querySelector('.workoutsContainer');
    // Ensure the Load Workouts button stays at the top.
    workoutsContainer.innerHTML = '<button id="loadWorkoutsBtn">Load Workouts</button>';

    const loadWorkoutsBtn = document.getElementById('loadWorkoutsBtn');
    loadWorkoutsBtn.addEventListener('click', loadWorkouts); // Reattach the event listener

    workouts.forEach(workout => {
        const workoutElement = document.createElement('div');
        workoutElement.className = 'workout'; // For styling
        workoutElement.innerHTML = `
            <h3>${workout.title}</h3>
            <p>${workout.description}</p>
        `;
        workoutsContainer.appendChild(workoutElement); // Append to the container
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addWorkoutForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        addWorkout();
    });
});

function addWorkout() {
    const titleInput = document.getElementById('newTitle'); // Correctly refer to the input
    const descriptionInput = document.getElementById('newDescription'); // Correctly refer to the input

    fetch('http://localhost:3000/api/workouts/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: titleInput.value, description: descriptionInput.value }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        loadWorkouts();
        titleInput.value = '';  // Clear the title input field
        descriptionInput.value = '';  // Clear the description input field
    })
    .catch(error => console.error('Error:', error));
}

   
// Proper setup of the event listener for delete button clicks
// Show the edit form when the "Edit by Title" button is clicked
document.getElementById('editByTitleBtn').addEventListener('click', () => {
    // Display the edit form for the user to enter new values
    document.getElementById('editForm').style.display = 'block';
});

document.getElementById('submitEdit').addEventListener('click', (event) => {
    console.log('Submit button clicked'); // This should appear in the console when you click the button
    event.preventDefault();
    updateWorkout();
    // Rest of your code...
});

function updateWorkout() {
    const oldTitleInput = document.getElementById('editTitle'); // Use correct input references
    const newTitleInput = document.getElementById('newEditTitle');
    const newDescriptionInput = document.getElementById('newEditDescription');

    if (oldTitleInput.value.trim() && (newTitleInput.value.trim() || newDescriptionInput.value.trim())) {
        fetch(`http://localhost:3000/api/workouts/${encodeURIComponent(oldTitleInput.value.trim())}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: newTitleInput.value, // Correct the object to have the correct properties
                description: newDescriptionInput.value
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Workout edited successfully:', data);
            document.getElementById('editForm').style.display = 'none';
            loadWorkouts();
            oldTitleInput.value = '';  // Clear the old title input
            newTitleInput.value = '';  // Clear the new title input
            newDescriptionInput.value = '';  // Clear the new description input
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

// Proper setup of the event listener for delete button clicks
document.getElementById('deleteByTitleBtn').addEventListener('click', () => {
    const titleInput = document.getElementById('deleteTitle');
    if (titleInput.value.trim() && confirm(`Are you sure you want to delete the workout titled "${titleInput.value.trim()}"?`)) {
        fetch(`http://localhost:3000/api/workouts/${encodeURIComponent(titleInput.value.trim())}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: titleInput.value.trim() }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Workout deleted successfully:', data);
            loadWorkouts();
            titleInput.value = '';  // Clear the delete title input field after successful operation
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});

// Ensure loadWorkouts is defined once and correctly updates the UI
function loadWorkouts() {
    fetch('http://localhost:3000/api/workouts/')
    .then(response => response.json())
    .then(workouts => {
        const workoutsContainer = document.querySelector('.workoutsContainer');
        // Clear existing workouts
        workoutsContainer.innerHTML = ''; 
        // Add the "Load Workouts" button back to the container
        const loadWorkoutsBtn = document.createElement('button');
        loadWorkoutsBtn.id = 'loadWorkoutsBtn';
        loadWorkoutsBtn.textContent = 'Load Workouts';
        workoutsContainer.appendChild(loadWorkoutsBtn);
        // Append workouts to the container
        workouts.forEach(workout => {
            const workoutElement = document.createElement('div');
            workoutElement.className = 'workout';
            workoutElement.innerHTML = `<h3>${workout.title}</h3><p>${workout.description}</p>`;
            workoutsContainer.appendChild(workoutElement);
        });
        // Reattach the click event listener to the "Load Workouts" button
        loadWorkoutsBtn.addEventListener('click', loadWorkouts);
    })
    .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            console.log("Back button clicked");
            window.history.back();
        });
    } else {
        console.log("Back button not found");
    }
});


function setupInputValidation(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    // Initially disable the button if you require the field to not be empty.
    button.disabled = !input.value.trim();

    input.addEventListener('input', () => {
        // Enable the button only if the input is not empty.
        button.disabled = !input.value.trim();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupInputValidation('deleteTitle', 'deleteByTitleBtn');
    setupInputValidation('editTitle', 'editByTitleBtn');
    setupInputValidation('newTitle', 'addWorkoutForm');  // Assuming you use the form's submit button for adding workouts

    // Add other event listeners and initialization code here.
});






