document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    setupSignupForm();
    setupWorkoutFeatures();
    setupBackButton();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form event listener attached'); // Debugging log
    } else {
        console.log('Login form not found'); // Debugging log
    }
}

function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log("Attempting to log in with:", user, password);

    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: password }),
    })
    .then(response => {
        console.log('Response status:', response.status); // Log response status
        return response.json()
        .then(data => {
            console.log('Parsed response data:', data); // Log parsed response data
            return { status: response.status, ok: response.ok, data };
        })
        .catch(error => {
            console.error('Error parsing JSON:', error); // Log JSON parsing error
            throw new Error('Invalid JSON response');
        });
    })
    .then(({ status, ok, data }) => {
        console.log('Login response:', { status, ok, data }); // Debugging log for entire response
        if (ok && data.token) {
            alert('Login successful!');
            console.log('Token:', data.token); // Debugging log for token
            localStorage.setItem('token', data.token); // Store token in localStorage
            window.location.href = '/homepage.html'; // Redirect to homepage
        } else {
            console.error('Login failed, no token received:', data); // Debugging log for failure
            alert('Login failed: ' + (data.error || 'Invalid username or password.'));
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
                if (data.token) {
                    alert('Signup successful!');
                    localStorage.setItem('token', data.token); // Store token in localStorage
                    window.location.href = '/index.html'; // Redirect to index
                } else {
                    alert('Signup failed: ' + (data.errorMessage || 'Please try again.'));
                }
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
    const token = localStorage.getItem('token'); // Get token from localStorage
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/', {
        headers: {
            'Authorization': `Bearer ${token}` // Include token in request headers
        }
    })
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
    const token = localStorage.getItem('token'); // Get token from localStorage
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include token in request headers
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
    const token = localStorage.getItem('token'); // Get token from localStorage

    fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/${encodeURIComponent(oldTitle)}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Include token in request headers
        },
        body: JSON.stringify({
            title: newTitle, 
            description: newDescription
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
        document.getElementById('editTitle').value = '';
        document.getElementById('newEditTitle').value = '';
        document.getElementById('newEditDescription').value = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to edit workout. You are not authroized to edit workout.');
    });
}

function handleDelete() {
    const title = document.getElementById('deleteTitle').value.trim();
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (title && confirm(`Are you sure you want to delete the workout titled "${title}"?`)) {
        fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/${encodeURIComponent(title)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Include token in request headers
            }
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
            document.getElementById('deleteTitle').value = '';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to delete workout. You are not authroized to edit workout.');
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



    








