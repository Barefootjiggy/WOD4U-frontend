document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    setupSignupForm();
    setupWorkoutFeatures();
    // setupBackButton();
    setupLogoutButton();
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

    fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/homepage.html';
        } else {
            alert('Login failed: ' + (data.error || 'Invalid username or password.'));
        }
    })
    .catch(error => {
        alert('Login failed, please try again.');
    });
}

function setupSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (event) {
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
                        localStorage.setItem('token', data.token); 
                        window.location.href = '/login.html'; 
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
        addWorkoutForm.addEventListener('submit', function (event) {
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
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(workouts => {
            console.log('Workouts:', workouts);
            const workoutsContainer = document.querySelector('.workoutsContainer');
            workoutsContainer.innerHTML = '';
            workouts.forEach(workout => {
                const workoutElement = document.createElement('div');
                workoutElement.className = 'workout';
                workoutElement.innerHTML = `
                    <h3 class="workout-title" data-id="${workout._id}">${workout.title}</h3>
                    <p>${workout.description}</p>
                `;
                workoutsContainer.appendChild(workoutElement);
            });
            document.querySelectorAll('.workout-title').forEach(titleElement => {
                titleElement.addEventListener('click', (event) => {
                    const workoutId = event.target.getAttribute('data-id');
                    const workoutTitle = event.target.textContent;
                    showComments(workoutId, workoutTitle);
                });
            });
        })
        .catch(error => {
            console.error('Error loading workouts:', error);
        });
}

function showComments(workoutId, workoutTitle) {
    document.getElementById('workout-title').textContent = workoutTitle;
    document.getElementById('comments-section').style.display = 'block';
    loadComments(workoutId);

    const addCommentForm = document.getElementById('addCommentForm');
    addCommentForm.onsubmit = event => handleAddComment(event, workoutId);
}

function loadComments(workoutId) {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3000/api/comments/${workoutId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(comments => {
            const commentsList = document.getElementById('comments-list');
            commentsList.innerHTML = '';
            comments.forEach(comment => {
                const li = document.createElement('li');
                li.innerHTML = `${comment.user.username}: ${comment.text} <br> <small>${new Date(comment.createdAt).toLocaleString()}</small>`;
                if (comment.user._id === getCurrentUserId()) {
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Edit';
                    editButton.onclick = () => handleEditComment(comment._id, workoutId);
                    li.appendChild(editButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Delete';
                    deleteButton.onclick = () => handleDeleteComment(comment._id, workoutId);
                    li.appendChild(deleteButton);
                }
                commentsList.appendChild(li);
            });
        })
        .catch(error => console.error('Error loading comments:', error));
}

function handleAddComment(event, workoutId) {
    event.preventDefault();
    const commentText = document.getElementById('commentText').value;
    const token = localStorage.getItem('token');

    console.log('Adding comment for workout:', workoutId); // Log workoutId

    fetch('http://localhost:3000/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: commentText, workoutId: workoutId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        loadComments(workoutId);
        document.getElementById('commentText').value = '';
    })
    .catch(error => {
        console.error('Error adding comment:', error);
        alert(`Failed to add comment: ${error.message}`);
    });
}

function handleEditComment(commentId, workoutId) {
    const newText = prompt('Edit your comment:');
    if (newText) {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:3000/api/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: newText })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                loadComments(workoutId);
            })
            .catch(error => {
                console.error('Error editing comment:', error);
                alert(`Failed to edit comment: ${error.message}`);
            });
    }
}

function handleDeleteComment(commentId, workoutId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:3000/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
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
                loadComments(workoutId);
            })
            .catch(error => {
                console.error('Error deleting comment:', error);
                alert(`Failed to delete comment: ${error.message}`);
            });
    }
}

function getCurrentUserId() {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}

document.getElementById('newTitle').addEventListener('input', function(event) {
    const value = event.target.value;
    const regex = /[^a-zA-Z0-9\s]/; // Regex to match special characters
    if (regex.test(value)) {
        alert('Special characters are not allowed in the title.');
        event.target.value = value.replace(regex, ''); // Remove the special characters
    }
});

function addWorkout() {
    const title = document.getElementById('newTitle').value;
    const description = document.getElementById('newDescription').value;

    if (title.trim() === '') {
        alert('Title cannot be empty.');
        return;
    }

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

// function setupBackButton() {
//     const backButton = document.getElementById('backButton');
//     if (backButton) {
//         backButton.addEventListener('click', () => {
//             window.history.back();
//         });
//     }
// }

function setupLogoutButton() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/index.html'; 
        });
    }
}