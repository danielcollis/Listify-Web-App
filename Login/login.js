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

  // ======= DOM ELEMENTS (needed for registration & form logic) =======
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const resetForm = document.getElementById("reset-form");

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  const loginError = document.getElementById("login-error");

  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const registerConfirmPassword = document.getElementById("registerConfirmPassword");
  const registerError = document.getElementById("register-error");

  const resetEmail = document.getElementById("reset-email");
  const resetMessage = document.getElementById("reset-message");
  const resetButton = document.getElementById("reset-button");

  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");
  const forgotPassword = document.getElementById("forgot-password");
  const backToLogin = document.getElementById("back-to-login");

  // ======= Handle Login =======
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "../home.html"; // Redirect to home
    } catch (error) {
      loginError.textContent = "Login failed: " + error.message;
    }
  });

  // ======= Handle Registration =======
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    const confirmPassword = registerConfirmPassword.value.trim();
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
      showLogin.click(); // Switch to login form
    } catch (error) {
      registerError.textContent = "Registration failed: " + error.message;
    }
  });

  // ======= Handle Password Reset =======
  resetButton.addEventListener('click', async () => {
    const email = resetEmail.value.trim();
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
      resetEmail.value = '';
    } catch (error) {
      resetMessage.textContent = 'Error sending reset email: ' + error.message;
      resetMessage.className = 'error-message';
    }
  });

  // ======= UI: Toggle Form Views =======
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

  // ======= Helper: Email Validation =======
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // ======= Helper: Password Validation =======
  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // ======= Helper: Clear All Form Fields and Errors =======
  function clearAllFields() {
    loginEmail.value = '';
    loginPassword.value = '';
    loginError.textContent = '';

    registerEmail.value = '';
    registerPassword.value = '';
    registerConfirmPassword.value = '';
    registerError.textContent = '';

    resetEmail.value = '';
    resetMessage.textContent = '';
  }

  // Optional: Automatically redirect if already logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User is already signed in.");
    }
  });
});