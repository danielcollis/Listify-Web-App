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

function updateTotal(price) {
    let numericValue = parseFloat(price.replace(/[^0-9.]/g, ""));
    if (!isNaN(numericValue)) {
        total += numericValue;
    }
    document.getElementById('totalPrice').innerText = `Total: $${total.toFixed(2)}`;
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
    listItem.innerHTML = `<a href="${link}" target="_blank">${text || link}</a> - ${price}`;
    
    document.getElementById('linkList').appendChild(listItem);
    
    // Update total price
    updateTotal(price);
    
    // Clear input fields
    document.getElementById('linkInput').value = '';
    document.getElementById('textInput').value = '';
    document.getElementById('priceInput').value = '';
}