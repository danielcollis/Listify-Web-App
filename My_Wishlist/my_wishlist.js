document.addEventListener("DOMContentLoaded", function () {
    // Toggle side menu when hamburger icon is clicked
    const menuToggle = document.getElementById("menuToggle");
    const sideMenu = document.getElementById("sideMenu");

    if (menuToggle && sideMenu) {
        menuToggle.addEventListener("click", function () {
            if (sideMenu.style.width === "250px") {
                sideMenu.style.width = "0"; // Close the menu
            } else {
                sideMenu.style.width = "250px"; // Open the menu
            }
        });
    }

    // Logout button functionality
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('listify_current_user');
            window.location.href = 'Login/login.html';
        });
    }

    // My Wishlists button functionality
    const wishlistsBtn = document.getElementById('wishlistsButton');
    if (wishlistsBtn) {
        wishlistsBtn.addEventListener('click', function () {
            window.location.href = 'wishlists.html';
        });
    }
});
