document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    setupSignupForm();
    setupWorkoutFeatures();
    setupBackButton();
    setupInputValidations();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    .catch(error => {
        console.error('Error:', error);
        alert('Login failed, please try again.');
    });
}

function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                alert('Signup successful!');
                window.location.href = '/index.html';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Signup failed, please try again.');
            });
        });
    }
}

function setupWorkoutFeatures() {
    const loadWorkoutsBtn = document.getElementById('loadWorkoutsBtn');
    if (loadWorkoutsBtn) {
        loadWorkoutsBtn.addEventListener('click', loadWorkouts);
    }

    const addWorkoutForm = document.getElementById('addWorkoutForm');
    if (addWorkoutForm) {
        addWorkoutForm.addEventListener('submit', function(event) {
            event.preventDefault();
            addWorkout();
        });
    }

    const editBtn = document.getElementById('editByTitleBtn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            document.getElementById('editForm').style.display = 'block';
        });
    }

    const submitEdit = document.getElementById('submitEdit');
    if (submitEdit) {
        submitEdit.addEventListener('click', handleEditSubmit);
    }

    const deleteBtn = document.getElementById('deleteByTitleBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDelete);
    }
}

function loadWorkouts() {
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/')
    .then(response => response.json())
    .then(workouts => {
        const workoutsContainer = document.querySelector('.workoutsContainer');
        workoutsContainer.innerHTML = '';
        workouts.forEach(workout => {
            const workoutElement = document.createElement('div');
            workoutElement.className = 'workout';
            workoutElement.innerHTML = `<h3>${workout.title}</h3><p>${workout.description}</p>`;
            workoutsContainer.appendChild(workoutElement);
        });
    })
    .catch(error => {
        console.error('Error loading workouts:', error);
    });
}

function addWorkout() {
    const title = document.getElementById('newTitle').value;
    const description = document.getElementById('newDescription').value;

    // Retrieve the authentication token from local storage or wherever it's stored
    const token = localStorage.getItem('authToken');

    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify({ title, description })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Added workout:', data);
        loadWorkouts();
        document.getElementById('newTitle').value = '';
        document.getElementById('newDescription').value = '';
    })
    .catch(error => {
        console.error('Error adding workout:', error);
    });
}


function handleEditSubmit(event) {
    event.preventDefault();
    const oldTitle = document.getElementById('editTitle').value;
    const newTitle = document.getElementById('newEditTitle').value;
    const newDescription = document.getElementById('newEditDescription').value;

    fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/${encodeURIComponent(oldTitle)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: newTitle, // Ensure this uses the newTitle
            description: newDescription // Ensure this uses the newDescription
        })
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
        document.getElementById('editTitle').value = ''; // Clear fields after update
        document.getElementById('newEditTitle').value = '';
        document.getElementById('newEditDescription').value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to edit workout.');
    });
}

    function handleDelete() {
        const title = document.getElementById('deleteTitle').value.trim();
        if (title && confirm(`Are you sure you want to delete the workout titled "${title}"?`)) {
            fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/${encodeURIComponent(title)}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title })
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
                document.getElementById('deleteTitle').value = ''; // Clear the input field after successful deletion
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete workout.');
            });
        }
    }

    function setupBackButton() {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back();
            });
        }
    }
    








