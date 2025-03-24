let total = 0;

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
    
    // Update total price
    updateTotal(price);
    
    // Clear input fields
    document.getElementById('linkInput').value = '';
    document.getElementById('textInput').value = '';
    document.getElementById('priceInput').value = '';
}

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