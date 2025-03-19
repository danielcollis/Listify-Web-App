function addLink() {
    let link = document.getElementById('linkInput').value.trim();
    const text = document.getElementById('textInput').value.trim();
    const price = document.getElementById('priceInput').value.trim();

    if (!link) {
        alert("Please enter a valid link.");
        return;
    }

    // Ensure link has proper protocol
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link;
    }

    const listItem = document.createElement('li');
    listItem.innerHTML = `<a href="${link}" target="_blank">${text || link}</a> - ${price}`;
    
    document.getElementById('linkList').appendChild(listItem);

    // Clear input fields
    document.getElementById('linkInput').value = '';
    document.getElementById('textInput').value = '';
    document.getElementById('priceInput').value = '';
}