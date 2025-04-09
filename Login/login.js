document.addEventListener('DOMContentLoaded', function() {
// NOTE:
// This currently uses **localStorage** to simulate login and registration functionality.
// No data is saved to a database yet
// User data is stored locally in the browser and will be cleared if the user clears their site data.

    
    
    // Form toggle functionality
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resetForm = document.getElementById('reset-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const forgotPassword = document.getElementById('forgot-password');
    const backToLogin = document.getElementById('back-to-login');

    // Login form elements
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');

    // Register form elements
    const registerName = document.getElementById('register-name');
    const registerEmail = document.getElementById('register-email');
    const registerPassword = document.getElementById('register-password');
    const registerConfirmPassword = document.getElementById('register-confirm-password');
    const registerButton = document.getElementById('register-button');
    const registerError = document.getElementById('register-error');

    // Reset form elements
    const resetEmail = document.getElementById('reset-email');
    const resetButton = document.getElementById('reset-button');
    const resetMessage = document.getElementById('reset-message');

    // Toggle between login and register forms
    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        resetForm.style.display = 'none';
        clearAllFields();
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        resetForm.style.display = 'none';
        clearAllFields();
    });

    forgotPassword.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        resetForm.style.display = 'block';
        clearAllFields();
    });

    backToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        resetForm.style.display = 'none';
        clearAllFields();
    });

    // Login form submission
    loginButton.addEventListener('click', function() {
        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();
        
        // Clear previous errors
        loginError.textContent = '';
        
        // Basic form validation
        if (!email || !password) {
            loginError.textContent = 'Please enter both email and password.';
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            loginError.textContent = 'Please enter a valid email address.';
            return;
        }
        
        // In a real app, you would send this data to your server for authentication
        // For this demo, we'll simulate user authentication with localStorage
        
        const users = JSON.parse(localStorage.getItem('listify_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Store user session
            localStorage.setItem('listify_current_user', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email
            }));
            
            // Redirect to home page
            window.location.href = '../home.html';
        } else {
            loginError.textContent = 'Invalid email or password.';
        }
    });

    // Register form submission
    registerButton.addEventListener('click', function() {
        const name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value.trim();
        const confirmPassword = registerConfirmPassword.value.trim();
        
        // Clear previous errors
        registerError.textContent = '';
        
        // Basic form validation
        if (!name || !email || !password || !confirmPassword) {
            registerError.textContent = 'Please fill in all fields.';
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            registerError.textContent = 'Please enter a valid email address.';
            return;
        }
        
        // Validate password
        if (!isValidPassword(password)) {
            registerError.textContent = 'Password does not meet requirements.';
            return;
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            registerError.textContent = 'Passwords do not match.';
            return;
        }
        
        // Check if email is already registered
        const users = JSON.parse(localStorage.getItem('listify_users') || '[]');
        if (users.some(user => user.email === email)) {
            registerError.textContent = 'Email is already registered.';
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateUserId(),
            name: name,
            email: email,
            password: password, // In a real app, you would hash this password
            createdAt: new Date().toISOString()
        };
        
        // Add user to local storage
        users.push(newUser);
        localStorage.setItem('listify_users', JSON.stringify(users));
        
        // Log user in and redirect
        localStorage.setItem('listify_current_user', JSON.stringify({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        }));
        
        // Redirect to home page
        window.location.href = '../home.html';
    });

    // Reset password form submission
    resetButton.addEventListener('click', function() {
        const email = resetEmail.value.trim();
        
        // Clear previous messages
        resetMessage.textContent = '';
        
        // Basic form validation
        if (!email) {
            resetMessage.textContent = 'Please enter your email address.';
            resetMessage.className = 'error-message';
            return;
        }
        
        // Validate email format
        if (!isValidEmail(email)) {
            resetMessage.textContent = 'Please enter a valid email address.';
            resetMessage.className = 'error-message';
            return;
        }
        
        // Check if email exists in the system
        const users = JSON.parse(localStorage.getItem('listify_users') || '[]');
        const userExists = users.some(user => user.email === email);
        
        if (!userExists) {
            resetMessage.textContent = 'No account found with this email.';
            resetMessage.className = 'error-message';
            return;
        }
        
        // In a real app, you would send a password reset email
        // For this demo, we'll just show a success message
        
        resetMessage.textContent = 'Password reset instructions have been sent to your email.';
        resetMessage.className = 'success-message';
        resetEmail.value = '';
    });

    // Helper function to validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Helper function to validate password strength
    function isValidPassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    }

    // Helper function to generate a unique user ID
    function generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Clear all form fields and error messages
    function clearAllFields() {
        // Clear login form
        loginEmail.value = '';
        loginPassword.value = '';
        loginError.textContent = '';
        
        // Clear register form
        registerName.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        registerConfirmPassword.value = '';
        registerError.textContent = '';
        
        // Clear reset form
        resetEmail.value = '';
        resetMessage.textContent = '';
    }

    // Check if the user is already logged in
    function checkAuthStatus() {
        const currentUser = localStorage.getItem('listify_current_user');
        if (currentUser) {
            // If already logged in, redirect to home page
            window.location.href = '../home.html';
        }
    }

    // Call on page load
    //checkAuthStatus(); <-- diabled for now
});