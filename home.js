document.addEventListener("DOMContentLoaded", function () {
    // Create New List Button
    document.getElementById("new-list").addEventListener("click", function() {
        window.location.href = "list.html";
    });

    // Open Shared List Button
    document.getElementById("openSharedList").addEventListener("click", function() {
        const sharedLink = document.getElementById("pasteListInput").value.trim();
        
        // Check if the link is a valid Listify shared list
        try {
            // Create a URL object to validate the link
            const url = new URL(sharedLink);
            
            // Check if the link contains the list parameter
            if (url.searchParams.has('list')) {
                // Redirect to the list page with the shared list parameter
                window.location.href = `list.html${url.search}`;
            } else {
                alert("Invalid shared list link. Please copy the entire link.");
            }
        } catch (error) {
            alert("Please enter a valid shared list link.");
        }
    });

    // Allow pressing Enter to open shared list
    document.getElementById("pasteListInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            document.getElementById("openSharedList").click();
        }
    });
});