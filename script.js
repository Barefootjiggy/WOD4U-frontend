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
    console.log('function called')
    // Extract the title (used as the original title), new title, and new description from the form
    const oldtitle = encodeURIComponent(document.getElementById('editTitle').value.trim());
    const newTitle = document.getElementById('newEditTitle').value.trim();
    const newDescription = document.getElementById('newEditDescription').value.trim();
console.log(oldtitle, newTitle, newDescription)
    // Confirm the edit action with the user
    if (oldtitle && (newTitle || newDescription) && confirm(`Are you sure you want to edit the workout titled "${decodeURIComponent(oldtitle)}"?`)) {
        // Perform the fetch request to the server to update the workout
        fetch(`http://localhost:3000/api/workouts/${oldtitle}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: oldtitle,
                title: newTitle,
                description: newDescription
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
            // Hide the edit form and refresh the list of workouts
            document.getElementById('editForm').style.display = 'none';
            loadWorkouts();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }}


// Proper setup of the event listener for delete button clicks
document.getElementById('deleteByTitleBtn').addEventListener('click', () => {
    const title = document.getElementById('deleteTitle').value.trim();
    if (title && confirm(`Are you sure you want to delete the workout titled "${title}"?`)) {
        fetch(`http://localhost:3000/api/workouts/${encodeURIComponent(title)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title }), // Note: Ensure your server is configured to accept and use this body for DELETE requests.
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Workout deleted successfully:', data);
            loadWorkouts(); // Refresh the list of workouts to reflect the deletion
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
    backButton.addEventListener('click', () => {
        console.log("Back button clicked");
        window.history.back();
    });
});





