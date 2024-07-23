document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    setupSignupForm();
    setupWorkoutFeatures();
    // setupBackButton();
    setupLogoutButton();
});

function setupLoginForm() {
    const loginForm = document.getElementById('loginForm') as HTMLFormElement | null;
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form event listener attached');
    } else {
        console.log('Login form not found');
    }
}

function handleLogin(event: Event) {
    event.preventDefault();
    const user = (document.getElementById('username') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/auth/login', {
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
    const signupForm = document.getElementById('signupForm') as HTMLFormElement | null;
    if (signupForm) {
        signupForm.addEventListener('submit', function (event: Event) {
            event.preventDefault();
            const username = (document.getElementById('username') as HTMLInputElement).value;
            const password = (document.getElementById('password') as HTMLInputElement).value;
            fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.token) {
                        alert('Signup successful!');
                        localStorage.setItem('token', data.token); 
                        window.location.href = '/index.html'; 
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
    const loadWorkoutsBtn = document.getElementById('loadWorkoutsBtn') as HTMLButtonElement | null;
    if (loadWorkoutsBtn) {
        loadWorkoutsBtn.addEventListener('click', loadWorkouts);
    }

    const addWorkoutForm = document.getElementById('addWorkoutForm') as HTMLFormElement | null;
    if (addWorkoutForm) {
        addWorkoutForm.addEventListener('submit', function (event: Event) {
            event.preventDefault();
            addWorkout();
        });
    }

    const editBtn = document.getElementById('editByTitleBtn') as HTMLButtonElement | null;
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const editForm = document.getElementById('editForm') as HTMLFormElement;
            editForm.style.display = 'block';
        });
    }

    const submitEdit = document.getElementById('submitEdit') as HTMLButtonElement | null;
    if (submitEdit) {
        submitEdit.addEventListener('click', handleEditSubmit);
    }

    const deleteBtn = document.getElementById('deleteByTitleBtn') as HTMLButtonElement | null;
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDelete);
    }
}

document.getElementById('loadWorkoutsBtn')?.addEventListener('click', loadWorkouts);

type Workout = {
    _id: string;
    title: string;
    description: string;
};

type UserComment = {
    _id: string;
    text: string;
    createdAt: string;
    user: {
        _id: string;
        username: string;
    };
};

function loadWorkouts() {
    const token = localStorage.getItem('token');
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then((workouts: Workout[]) => {
            console.log('Workouts:', workouts);
            const workoutsContainer = document.querySelector('.workoutsContainer') as HTMLElement;
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
                titleElement.addEventListener('click', (event: Event) => {
                    const target = event.target as HTMLElement;
                    const workoutId = target.getAttribute('data-id')!;
                    const workoutTitle = target.textContent!;
                    showComments(workoutId, workoutTitle);
                    scrollToComments();
                });
            });
        })
        .catch(error => {
            console.error('Error loading workouts:', error);
        });
}

function showComments(workoutId: string, workoutTitle: string) {
    const workoutTitleElement = document.getElementById('workout-title') as HTMLElement;
    workoutTitleElement.textContent = workoutTitle;
    const commentsSection = document.getElementById('comments-section') as HTMLElement;
    commentsSection.style.display = 'block';
    loadComments(workoutId);

    const addCommentForm = document.getElementById('addCommentForm') as HTMLFormElement;
    addCommentForm.onsubmit = (event: Event) => handleAddComment(event, workoutId);
}

function scrollToComments() {
    const commentsSection = document.getElementById('comments-section') as HTMLElement;
    commentsSection.scrollIntoView({ behavior: 'smooth' });
}

function loadComments(workoutId: string) {
    const token = localStorage.getItem('token');
    fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/comments/${workoutId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then((comments: UserComment[]) => {
            const commentsList = document.getElementById('comments-list') as HTMLElement;
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

function handleAddComment(event: Event, workoutId: string) {
    event.preventDefault();
    const commentText = (document.getElementById('commentText') as HTMLInputElement).value;
    const token = localStorage.getItem('token');

    console.log('Adding comment for workout:', workoutId);

    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/comments', {
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
        (document.getElementById('commentText') as HTMLInputElement).value = '';
    })
    .catch(error => {
        console.error('Error adding comment:', error);
        alert(`Failed to add comment: ${error.message}`);
    });
}

function handleEditComment(commentId: string, workoutId: string) {
    const newText = prompt('Edit your comment:');
    if (newText) {
        const token = localStorage.getItem('token');
        fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/comments/${commentId}`, {
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

function handleDeleteComment(commentId: string, workoutId: string) {
    if (confirm('Are you sure you want to delete this comment?')) {
        const token = localStorage.getItem('token');
        fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/comments/${commentId}`, {
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

function getCurrentUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}

document.getElementById('newTitle')?.addEventListener('input', function(event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    const regex = /[^a-zA-Z0-9\s]/; // Regex to match special characters
    if (regex.test(value)) {
        alert('Special characters are not allowed in the title.');
        target.value = value.replace(regex, ''); // Remove the special characters
    }
});

function addWorkout() {
    const title = (document.getElementById('newTitle') as HTMLInputElement).value;
    const description = (document.getElementById('newDescription') as HTMLTextAreaElement).value;

    if (title.trim() === '') {
        alert('Title cannot be empty.');
        return;
    }

    const token = localStorage.getItem('token');
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/', {
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
            (document.getElementById('newTitle') as HTMLInputElement).value = '';
            (document.getElementById('newDescription') as HTMLTextAreaElement).value = '';
        })
        .catch(error => {
            console.error('Error adding workout:', error);
        });
}

function handleEditSubmit(event: Event) {
    event.preventDefault();
    const oldTitle = (document.getElementById('editTitle') as HTMLInputElement).value;
    const newTitle = (document.getElementById('newEditTitle') as HTMLInputElement).value;
    const newDescription = (document.getElementById('newEditDescription') as HTMLTextAreaElement).value;
    const token = localStorage.getItem('token');

    fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/${encodeURIComponent(oldTitle)}`, {
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
            (document.getElementById('editForm') as HTMLFormElement).style.display = 'none';
            loadWorkouts();
            (document.getElementById('editTitle') as HTMLInputElement).value = '';
            (document.getElementById('newEditTitle') as HTMLInputElement).value = '';
            (document.getElementById('newEditDescription') as HTMLTextAreaElement).value = '';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to edit workout. You are not authorized to edit workout.');
        });
}

function handleDelete() {
    const title = (document.getElementById('deleteTitle') as HTMLInputElement).value.trim();
    const token = localStorage.getItem('token');
    if (title && confirm(`Are you sure you want to delete the workout titled "${title}"?`)) {
        fetch(`https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/${encodeURIComponent(title)}`, {
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
                (document.getElementById('deleteTitle') as HTMLInputElement).value = '';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete workout. You are not authorized to delete workout.');
            });
    }
}

// function setupBackButton() {
//     const backButton = document.getElementById('backButton') as HTMLButtonElement | null;
//     if (backButton) {
//         backButton.addEventListener('click', () => {
//             window.history.back();
//         });
//     }
// }

function setupLogoutButton() {
    const logoutButton = document.getElementById('logoutButton') as HTMLButtonElement | null;
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/index.html'; 
        });
    }
}
