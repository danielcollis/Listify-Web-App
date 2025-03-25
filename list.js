let total = 0;
let listItems = []; // Array to store list items

function formatPrice(price) {
    if (!price) return "";
    
    // Ensure it starts with a dollar sign
    if (!price.startsWith("$")) {
        price = "$" + price;
    }
    
    // Extract numeric value and format to 2 decimal places
    let numericValue = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (isNaN(numericValue)) return "";
    
    price = "$" + numericValue.toFixed(2);
    return price;
}

function updateTotal(price, isAddition = true) {
    let numericValue = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (!isNaN(numericValue)) {
        if (isAddition) {
            total += numericValue;
        } else {
            total -= numericValue;
        }
        // Ensure we don't go below zero due to rounding errors
        total = Math.max(0, total);
    }
    document.getElementById('totalPrice').innerText = `Total: $${total.toFixed(2)}`;
}

function deleteItem(element) {
    // Extract the price from the list item
    const listItem = element.parentElement;
    const priceSpan = listItem.querySelector('.item-price');
    const priceText = priceSpan ? priceSpan.textContent : '';
    const linkElement = listItem.querySelector('a');
    
    // Remove the item from our tracking array
    const indexToRemove = listItems.findIndex(item => 
        item.link === linkElement.href && 
        item.text === linkElement.textContent && 
        item.price === priceText
    );
    if (indexToRemove !== -1) {
        listItems.splice(indexToRemove, 1);
    }
    
    // Update the total by subtracting this price
    updateTotal(priceText, false);
    
    // Remove the list item
    listItem.remove();
}

function addLink() {
    let link = document.getElementById('linkInput').value.trim();
    const text = document.getElementById('textInput').value.trim();
    let price = document.getElementById('priceInput').value.trim();
    
    if (!link) {
        alert("Please enter a valid link.");
        return;
    }
    
    // Ensure link has proper protocol
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link;
    }
    
    // Format price
    price = formatPrice(price);
    
    const listItem = document.createElement('li');
    
    // Create link element
    const linkElement = document.createElement('a');
    linkElement.href = link;
    linkElement.target = "_blank";
    linkElement.textContent = text || link;
    
    // Create price span
    const priceSpan = document.createElement('span');
    priceSpan.className = 'item-price';
    priceSpan.textContent = price;
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.textContent = 'X';
    deleteButton.onclick = function() {
        deleteItem(this);
    };
    
    // Append all elements to the list item
    listItem.appendChild(linkElement);
    listItem.appendChild(document.createTextNode(' - '));
    listItem.appendChild(priceSpan);
    listItem.appendChild(deleteButton);
    
    document.getElementById('linkList').appendChild(listItem);
    
    // Store the item in our tracking array
    listItems.push({
        link: link,
        text: text || link,
        price: price
    });
    
    // Update total price
    updateTotal(price);
    
    // Clear input fields
    document.getElementById('linkInput').value = '';
    document.getElementById('textInput').value = '';
    document.getElementById('priceInput').value = '';
}

// Share Functionality
document.addEventListener('DOMContentLoaded', function() {
    const shareButton = document.getElementById('shareButton');
    const sharePopup = document.getElementById('shareLinkPopup');
    const closePopup = document.querySelector('.close-popup');
    const shareLink = document.getElementById('shareLink');
    const copyShareLinkBtn = document.getElementById('copyShareLink');

    shareButton.addEventListener('click', function() {
        // Generate a shareable link with the current list items
        const listData = JSON.stringify(listItems);
        const encodedData = btoa(encodeURIComponent(listData));
        const shareableLink = `${window.location.origin}${window.location.pathname}?list=${encodedData}`;
        
        // Display the link in the popup
        shareLink.value = shareableLink;
        sharePopup.style.display = 'block';
    });

    // Close popup when clicking the close button
    closePopup.addEventListener('click', function() {
        sharePopup.style.display = 'none';
    });

    // Copy link to clipboard
    copyShareLinkBtn.addEventListener('click', function() {
        shareLink.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });

    // Check if there's a list in the URL when page loads
    const urlParams = new URLSearchParams(window.location.search);
    const encodedList = urlParams.get('list');
    
    if (encodedList) {
        try {
            const decodedData = decodeURIComponent(atob(encodedList));
            const loadedItems = JSON.parse(decodedData);
            
            // Clear existing list
            document.getElementById('linkList').innerHTML = '';
            total = 0;
            listItems = [];
            
            // Recreate list items
            loadedItems.forEach(item => {
                // Set input values
                document.getElementById('linkInput').value = item.link;
                document.getElementById('textInput').value = item.text;
                document.getElementById('priceInput').value = item.price;
                
                // Trigger add link to recreate the item
                addLink();
            });
        } catch (error) {
            console.error('Error loading shared list:', error);
        }
    }
});

// Add event listeners to each input field to trigger the addLink function when pressing Enter
document.getElementById('linkInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addLink();
    }
});

document.getElementById('textInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addLink();
    }
});

document.getElementById('priceInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addLink();
    }
});

// Toggle side menu when hamburger icon is clicked
document.getElementById("menuToggle").addEventListener("click", function() {
    let menu = document.getElementById("sideMenu");
    if (menu.style.width === "250px") {
        menu.style.width = "0"; // Close the menu
    } else {
        menu.style.width = "250px"; // Open the menu
    }
});