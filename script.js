var _a, _b;
document.addEventListener('DOMContentLoaded', function () {
    setupLoginForm();
    setupSignupForm();
    setupWorkoutFeatures();
    // setupBackButton();
    setupLogoutButton();
});
function setupLoginForm() {
    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        console.log('Login form event listener attached');
    }
    else {
        console.log('Login form not found');
    }
}
function handleLogin(event) {
    event.preventDefault();
    var user = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: password }),
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location.href = '/homepage.html';
        }
        else {
            alert('Login failed: ' + (data.error || 'Invalid username or password.'));
        }
    })
        .catch(function (error) {
        alert('Login failed, please try again.');
    });
}
function setupSignupForm() {
    var signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var username = document.getElementById('username').value;
            var password = document.getElementById('password').value;
            fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password })
            })
                .then(function (response) { return response.json(); })
                .then(function (data) {
                if (data.token) {
                    alert('Signup successful!');
                    localStorage.setItem('token', data.token);
                    window.location.href = '/index.html';
                }
                else {
                    alert('Signup failed: ' + (data.errorMessage || 'Please try again.'));
                }
            })
                .catch(function (error) {
                console.error('Error:', error);
                alert('Signup failed, please try again.');
            });
        });
    }
}
function setupWorkoutFeatures() {
    var loadWorkoutsBtn = document.getElementById('loadWorkoutsBtn');
    if (loadWorkoutsBtn) {
        loadWorkoutsBtn.addEventListener('click', loadWorkouts);
    }
    var addWorkoutForm = document.getElementById('addWorkoutForm');
    if (addWorkoutForm) {
        addWorkoutForm.addEventListener('submit', function (event) {
            event.preventDefault();
            addWorkout();
        });
    }
    var editBtn = document.getElementById('editByTitleBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function () {
            var editForm = document.getElementById('editForm');
            editForm.style.display = 'block';
        });
    }
    var submitEdit = document.getElementById('submitEdit');
    if (submitEdit) {
        submitEdit.addEventListener('click', handleEditSubmit);
    }
    var deleteBtn = document.getElementById('deleteByTitleBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleDelete);
    }
}
(_a = document.getElementById('loadWorkoutsBtn')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', loadWorkouts);
function loadWorkouts() {
    var token = localStorage.getItem('token');
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/', {
        headers: {
            'Authorization': "Bearer ".concat(token)
        }
    })
        .then(function (response) {
        console.log('Response status:', response.status);
        return response.json();
    })
        .then(function (workouts) {
        console.log('Workouts:', workouts);
        var workoutsContainer = document.querySelector('.workoutsContainer');
        workoutsContainer.innerHTML = '';
        workouts.forEach(function (workout) {
            var workoutElement = document.createElement('div');
            workoutElement.className = 'workout';
            workoutElement.innerHTML = "\n                    <h3 class=\"workout-title\" data-id=\"".concat(workout._id, "\">").concat(workout.title, "</h3>\n                    <p>").concat(workout.description, "</p>\n                ");
            workoutsContainer.appendChild(workoutElement);
        });
        document.querySelectorAll('.workout-title').forEach(function (titleElement) {
            titleElement.addEventListener('click', function (event) {
                var target = event.target;
                var workoutId = target.getAttribute('data-id');
                var workoutTitle = target.textContent;
                showComments(workoutId, workoutTitle);
                scrollToComments();
            });
        });
    })
        .catch(function (error) {
        console.error('Error loading workouts:', error);
    });
}
function showComments(workoutId, workoutTitle) {
    var workoutTitleElement = document.getElementById('workout-title');
    workoutTitleElement.textContent = workoutTitle;
    var commentsSection = document.getElementById('comments-section');
    commentsSection.style.display = 'block';
    loadComments(workoutId);
    var addCommentForm = document.getElementById('addCommentForm');
    addCommentForm.onsubmit = function (event) { return handleAddComment(event, workoutId); };
}
function scrollToComments() {
    var commentsSection = document.getElementById('comments-section');
    commentsSection.scrollIntoView({ behavior: 'smooth' });
}
function loadComments(workoutId) {
    var token = localStorage.getItem('token');
    fetch("https://wod4u-cfaebfd65d57.herokuapp.com/api/comments/".concat(workoutId), {
        headers: {
            'Authorization': "Bearer ".concat(token)
        }
    })
        .then(function (response) { return response.json(); })
        .then(function (comments) {
        var commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '';
        comments.forEach(function (comment) {
            var li = document.createElement('li');
            li.innerHTML = "".concat(comment.user.username, ": ").concat(comment.text, " <br> <small>").concat(new Date(comment.createdAt).toLocaleString(), "</small>");
            if (comment.user._id === getCurrentUserId()) {
                var editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.onclick = function () { return handleEditComment(comment._id, workoutId); };
                li.appendChild(editButton);
                var deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.onclick = function () { return handleDeleteComment(comment._id, workoutId); };
                li.appendChild(deleteButton);
            }
            commentsList.appendChild(li);
        });
    })
        .catch(function (error) { return console.error('Error loading comments:', error); });
}
function handleAddComment(event, workoutId) {
    event.preventDefault();
    var commentText = document.getElementById('commentText').value;
    var token = localStorage.getItem('token');
    console.log('Adding comment for workout:', workoutId);
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer ".concat(token)
        },
        body: JSON.stringify({ text: commentText, workoutId: workoutId })
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(function (data) {
        loadComments(workoutId);
        document.getElementById('commentText').value = '';
    })
        .catch(function (error) {
        console.error('Error adding comment:', error);
        alert("Failed to add comment: ".concat(error.message));
    });
}
function handleEditComment(commentId, workoutId) {
    var newText = prompt('Edit your comment:');
    if (newText) {
        var token = localStorage.getItem('token');
        fetch("https://wod4u-cfaebfd65d57.herokuapp.com/api/comments/".concat(commentId), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer ".concat(token)
            },
            body: JSON.stringify({ text: newText })
        })
            .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(function (data) {
            loadComments(workoutId);
        })
            .catch(function (error) {
            console.error('Error editing comment:', error);
            alert("Failed to edit comment: ".concat(error.message));
        });
    }
}
function handleDeleteComment(commentId, workoutId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        var token = localStorage.getItem('token');
        fetch("https://wod4u-cfaebfd65d57.herokuapp.com/api/comments/".concat(commentId), {
            method: 'DELETE',
            headers: {
                'Authorization': "Bearer ".concat(token)
            }
        })
            .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(function (data) {
            loadComments(workoutId);
        })
            .catch(function (error) {
            console.error('Error deleting comment:', error);
            alert("Failed to delete comment: ".concat(error.message));
        });
    }
}
function getCurrentUserId() {
    var token = localStorage.getItem('token');
    if (!token) {
        return null;
    }
    var payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId;
}
(_b = document.getElementById('newTitle')) === null || _b === void 0 ? void 0 : _b.addEventListener('input', function (event) {
    var target = event.target;
    var value = target.value;
    var regex = /[^a-zA-Z0-9\s]/; // Regex to match special characters
    if (regex.test(value)) {
        alert('Special characters are not allowed in the title.');
        target.value = value.replace(regex, ''); // Remove the special characters
    }
});
function addWorkout() {
    var title = document.getElementById('newTitle').value;
    var description = document.getElementById('newDescription').value;
    if (title.trim() === '') {
        alert('Title cannot be empty.');
        return;
    }
    var token = localStorage.getItem('token');
    fetch('https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer ".concat(token)
        },
        body: JSON.stringify({ title: title, description: description })
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(function (data) {
        console.log('Added workout:', data);
        loadWorkouts();
        document.getElementById('newTitle').value = '';
        document.getElementById('newDescription').value = '';
    })
        .catch(function (error) {
        console.error('Error adding workout:', error);
    });
}
function handleEditSubmit(event) {
    event.preventDefault();
    var oldTitle = document.getElementById('editTitle').value;
    var newTitle = document.getElementById('newEditTitle').value;
    var newDescription = document.getElementById('newEditDescription').value;
    var token = localStorage.getItem('token');
    fetch("https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/".concat(encodeURIComponent(oldTitle)), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer ".concat(token)
        },
        body: JSON.stringify({
            title: newTitle,
            description: newDescription
        })
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(function (data) {
        console.log('Workout edited successfully:', data);
        document.getElementById('editForm').style.display = 'none';
        loadWorkouts();
        document.getElementById('editTitle').value = '';
        document.getElementById('newEditTitle').value = '';
        document.getElementById('newEditDescription').value = '';
    })
        .catch(function (error) {
        console.error('Error:', error);
        alert('Failed to edit workout. You are not authorized to edit workout.');
    });
}
function handleDelete() {
    var title = document.getElementById('deleteTitle').value.trim();
    var token = localStorage.getItem('token');
    if (title && confirm("Are you sure you want to delete the workout titled \"".concat(title, "\"?"))) {
        fetch("https://wod4u-cfaebfd65d57.herokuapp.com/api/workouts/".concat(encodeURIComponent(title)), {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer ".concat(token)
            }
        })
            .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(function (data) {
            console.log('Workout deleted successfully:', data);
            loadWorkouts();
            document.getElementById('deleteTitle').value = '';
        })
            .catch(function (error) {
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
    var logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
        });
    }
}
