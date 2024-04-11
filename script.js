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
function loadWorkouts() {
    fetch('http://localhost:3000/') // Adjust the URL based on your actual endpoint
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
    const workoutsContainer = document.getElementById('workoutsContainer');
    if (workoutsContainer) {
        workoutsContainer.innerHTML = ''; // Clear existing workouts
        workouts.forEach(workout => {
            const workoutElement = document.createElement('div');
            workoutElement.innerText = workout.name; // Assuming your workout objects have a 'name' property
            workoutsContainer.appendChild(workoutElement);
        });
    }
}
