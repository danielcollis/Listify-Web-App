// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function() {

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDwkNR4FXq2fZ-FnomEYRkZ9WTwk5k9G48",
    authDomain: "listify-f2df0.firebaseapp.com",
    projectId: "listify-f2df0",
    storageBucket: "listify-f2df0.appspot.com",
    messagingSenderId: "444295301374",
    appId: "1:444295301374:web:73f8519bb4fac1c340bdaf",
    measurementId: "G-QEYWCMTXEL"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth(app);

  // Check URL hash for direct navigation
  if(window.location.hash === '#register') {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('reset-form').style.display = 'none';
  }

  // Handle Login
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const loginError = document.getElementById("login-error");
    loginError.textContent = '';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "../home.html"; // Redirect to home
    } catch (error) {
      loginError.textContent = "Login failed: " + error.message;
    }
  });

  // Handle Registration
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
    const registerError = document.getElementById("register-error");
    registerError.textContent = '';

    // Basic validation
    if (!email || !password || !confirmPassword) {
      registerError.textContent = 'Please fill in all fields.';
      return;
    }
    if (!isValidEmail(email)) {
      registerError.textContent = 'Please enter a valid email address.';
      return;
    }
    if (!isValidPassword(password)) {
      registerError.textContent = 'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.';
      return;
    }
    if (password !== confirmPassword) {
      registerError.textContent = 'Passwords do not match.';
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registration successful! You can now log in.");
      document.getElementById('show-login').click();
    } catch (error) {
      registerError.textContent = "Registration failed: " + error.message;
    }
  });

  // Handle Password Reset
  document.getElementById("reset-button").addEventListener('click', async () => {
    const email = document.getElementById("reset-email").value.trim();
    const resetMessage = document.getElementById("reset-message");
    resetMessage.textContent = '';

    if (!email) {
      resetMessage.textContent = 'Please enter your email address.';
      resetMessage.className = 'error-message';
      return;
    }
    if (!isValidEmail(email)) {
      resetMessage.textContent = 'Please enter a valid email address.';
      resetMessage.className = 'error-message';
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      resetMessage.textContent = 'Password reset instructions have been sent to your email.';
      resetMessage.className = 'success-message';
      document.getElementById("reset-email").value = '';
    } catch (error) {
      resetMessage.textContent = 'Error sending reset email: ' + error.message;
      resetMessage.className = 'error-message';
    }
  });

  // UI: Toggle form views
  document.getElementById('show-register').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('reset-form').style.display = 'none';
    clearAllFields();
  });

  document.getElementById('show-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('reset-form').style.display = 'none';
    clearAllFields();
  });

  document.getElementById('forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('reset-form').style.display = 'block';
    clearAllFields();
  });

  document.getElementById('back-to-login').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('reset-form').style.display = 'none';
    clearAllFields();
  });

  // Helper: Validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper: Validate password strength
  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Helper: Clear all form fields and errors
  function clearAllFields() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('login-error').textContent = '';

    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
    document.getElementById('register-error').textContent = '';

    document.getElementById('reset-email').value = '';
    document.getElementById('reset-message').textContent = '';
  }

  // Optional: Redirect to home if already logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Already logged in
      console.log("User is already signed in.");
    }
  });
});