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
        console.log('Login form event listener attached'); 
    } else {
        console.log('Login form not found'); 
    }
}

function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    console.log("Attempting to log in with:", user, password);

    fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: password }),
    })
    .then(response => {
        console.log('Response status:', response.status); 
        return response.json().then(data => {
            console.log('Parsed response data:', data);
            return { status: response.status, ok: response.ok, data };
        });
    })
    .then(({ status, ok, data }) => {
        console.log('Login response:', { status, ok, data });
        if (ok && data.token) {
            alert('Login successful!');
            console.log('Token:', data.token); 
            localStorage.setItem('token', data.token);
            window.location.href = '/homepage.html'; 
        } else {
            console.error('Login failed, no token received:', data); 
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
            fetch('http://localhost:3000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    alert('Signup successful!');
                    localStorage.setItem('token', data.token); // 
                    window.location.href = '/index.html'; // 
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
    const token = localStorage.getItem('token'); 
    fetch('http://localhost:3000/api/workouts/', {
        headers: {
            'Authorization': `Bearer ${token}` 
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
    const token = localStorage.getItem('token'); 
    fetch('http://localhost:3000/api/workouts/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
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
    const token = localStorage.getItem('token'); 

    fetch(`http://localhost:3000/api/workouts/${encodeURIComponent(oldTitle)}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
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
        alert('Failed to edit workout. You are not authorized to edit workout.');
    });
}

function handleDelete() {
    const title = document.getElementById('deleteTitle').value.trim();
    const token = localStorage.getItem('token');
    if (title && confirm(`Are you sure you want to delete the workout titled "${title}"?`)) {
        fetch(`http://localhost:3000/api/workouts/${encodeURIComponent(title)}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
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
            alert('Failed to delete workout. You are not authorized to delete workout.');
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









