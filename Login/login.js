// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

document.addEventListener('DOMContentLoaded', function () {

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

  // Direct navigation to #register
  if (window.location.hash === '#register') {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('reset-form').style.display = 'none';
  }

  // Login
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const loginError = document.getElementById("login-error");
    loginError.textContent = '';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "../home.html";
    } catch (error) {
      loginError.textContent = "Login failed: " + error.message;
    }
  });

  // Register
  document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("registerConfirmPassword").value.trim();
    const registerError = document.getElementById("register-error");
    registerError.textContent = '';

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

  // Reset Password
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

  // Change Password
  document.getElementById("change-password-button").addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("change-email").value.trim();
    const currentPassword = document.getElementById("current-password").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();
    const message = document.getElementById("change-password-message");

    message.textContent = "";
    message.className = "success-message";

    if (!email || !currentPassword || !newPassword) {
      message.textContent = "Please fill in all fields.";
      message.className = "error-message";
      return;
    }

    if (!isValidPassword(newPassword)) {
      message.textContent = "New password does not meet requirements.";
      message.className = "error-message";
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, currentPassword);
      const user = userCredential.user;

      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      message.textContent = "Password updated successfully. You can now log in.";
      message.className = "success-message";

      // Redirect to login screen after a short delay
      setTimeout(() => {
        document.getElementById("show-login").click();
        clearAllFields();
      }, 1500);

    } catch (error) {
      message.textContent = "Password update failed: " + error.message;
      message.className = "error-message";
    }
  });

  // Toggle Views
  document.getElementById('show-register').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    document.getElementById('reset-form').style.display = 'none';
    document.getElementById('change-password-form').style.display = 'none';
    clearAllFields();
  });

  document.getElementById('show-login').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('reset-form').style.display = 'none';
    document.getElementById('change-password-form').style.display = 'none';
    clearAllFields();
  });

  document.getElementById('show-change-password').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('reset-form').style.display = 'none';
    document.getElementById('change-password-form').style.display = 'block';
    clearAllFields();
  });

  document.getElementById('back-to-login-reset').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('reset-form').style.display = 'none';
    document.getElementById('change-password-form').style.display = 'none';
    clearAllFields();
  });

  document.getElementById('back-to-login-change').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('reset-form').style.display = 'none';
    document.getElementById('change-password-form').style.display = 'none';
    clearAllFields();
  });

  // Validate Email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate Password
  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  // Clear form fields
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

    document.getElementById('change-email').value = '';
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('change-password-message').textContent = '';
  }

  // Check if already signed in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User already signed in.");
    }
  });

});