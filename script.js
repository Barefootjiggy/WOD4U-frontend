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
    const title = document.getElementById('newTitle').value;
    const description = document.getElementById('newDescription').value;
    
    fetch('http://localhost:3000/api/workouts/', {
        method: 'POST',
        credentials: 'include', // Assuming you need to include credentials like cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // This line correctly parses the JSON response body.
    })
    .then(data => {
        console.log(data); // 'data' is the parsed response body from the previous line.
        // Refresh the workouts list to show the new workout
        loadWorkouts();
    })
    .catch(error => console.error('Error:', error));
}


    
function editWorkout(workoutId) {
    // Populate the edit form with the workout's current data
    // Then show the form to the user
    // On form submission, send a PUT request:
    fetch(`http://localhost:3000/${workoutId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
        }),
        credentials: 'include', // If using sessions
    })
    .then(response => response.json())
    .then(data => {
        loadWorkouts();
    })
    .catch(error => console.error('Error:', error));
}

workouts.forEach(workout => {
    const workoutElement = document.createElement('div');
    workoutElement.className = 'workout';
    workoutElement.innerHTML = `
        <h3>${workout.title}</h3>
        <p>${workout.description}</p>
        <button class="deleteBtn" data-id="${workout._id}">Delete</button>
    `;
    workoutsContainer.appendChild(workoutElement);
});

// Assuming 'workoutsContainer' is already filled with workout elements
workoutsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteBtn')) {
        const workoutId = event.target.getAttribute('data-id');
        deleteWorkout(workoutId);
    }
});


function deleteWorkout(workoutId) {
    fetch(`http://localhost:3000/api/workouts/${workoutId}`, {
        method: 'DELETE',
        credentials: 'include', // If using sessions
    })
    .then(response => response.json())
    .then(data => {
        loadWorkouts(); // Refresh the list to reflect the deletion
    })
    .catch(error => console.error('Error:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('backButton');
    backButton.addEventListener('click', () => {
        console.log("Back button clicked");
        window.history.back();
    });
});





