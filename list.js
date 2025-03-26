let total = 0;
let listItems = []; // Array to store list items
let fundItems = [];

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
    
    // Remove trailing slash and compare URLs
    const normalizeUrl = (url) => url.replace(/\/+$/, '');
    
    // Remove the item from our tracking array
    const indexToRemove = listItems.findIndex(item => {
        return normalizeUrl(item.link) === normalizeUrl(linkElement.href) && 
               item.text === linkElement.textContent && 
               item.price === priceText;
    });
    
    if (indexToRemove !== -1) {
        listItems.splice(indexToRemove, 1);
    }
    
    // Update the total by subtracting this price
    updateTotal(priceText, false);
    
    // Remove the list item
    listItem.remove();

    console.log(listItems)
}

function createEditModal(listItem, itemIndex) {
    // Create edit description modal
    const modal = document.createElement('div');
    modal.className = 'description-modal';
    modal.innerHTML = `
        <div class="description-modal-content">
            <h3>Edit Description</h3>
            <textarea id="descriptionTextarea" rows="4" placeholder="Enter item description">${listItems[itemIndex].description || ''}</textarea>
            <div class="modal-buttons">
                <button id="saveDescriptionBtn">Enter</button>
                <button id="cancelDescriptionBtn">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Style the modal
    const style = document.createElement('style');
    style.textContent = `
        .description-modal {
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .description-modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            width: 80%;
            max-width: 500px;
            text-align: center;
        }
        .description-modal-content textarea {
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            box-sizing: border-box;
        }
        .modal-buttons {
            display: flex;
            justify-content: space-between;
        }
        .modal-buttons button {
            width: 48%;
            padding: 10px;
            background-color: #d63384;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        .modal-buttons button:hover {
            background-color: #b0296b;
        }
    `;
    document.head.appendChild(style);

    // Save button logic
    document.getElementById('saveDescriptionBtn').addEventListener('click', () => {
        const description = document.getElementById('descriptionTextarea').value.trim();
        listItems[itemIndex].description = description;
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });

    // Cancel button logic
    document.getElementById('cancelDescriptionBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });

    // Prevent modal from closing when clicking on content
    modal.querySelector('.description-modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close modal if clicked outside
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });
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
    
    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-btn';
    editButton.innerHTML = '&#9998;'; // Pencil icon
    editButton.onclick = function() {
        const listItem = this.parentElement;
        const index = Array.from(listItem.parentNode.children).indexOf(listItem);
        createEditModal(listItem, index);
    };
    
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
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    
    document.getElementById('linkList').appendChild(listItem);
    
    // Store the item in our tracking array
    listItems.push({
        link: link,
        text: text || link,
        price: price,
        description: '' // Initialize empty description
    });
    
    // Update total price
    updateTotal(price);
    
    // Clear input fields
    document.getElementById('linkInput').value = '';
    document.getElementById('textInput').value = '';
    document.getElementById('priceInput').value = '';
}

// Event listeners for Enter key on input fields
document.addEventListener('DOMContentLoaded', function() {
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

    // Share Functionality
    const shareButton = document.getElementById('shareButton');
    const sharePopup = document.getElementById('shareLinkPopup');
    const closePopup = document.querySelector('.close-popup');
    const shareLink = document.getElementById('shareLink');
    const copyShareLinkBtn = document.getElementById('copyShareLink');

    shareButton.addEventListener('click', function() {
        // Generate a shareable link with the current list items
        const sharedPayload = {
            items: listItems,
            funds: fundItems
        };
        
        const encodedData = btoa(encodeURIComponent(JSON.stringify(sharedPayload)));
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
            const loadedData = JSON.parse(decodedData);
            const loadedItems = loadedData.items || [];
            const loadedFunds = loadedData.funds || [];
            
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

            loadedFunds.forEach(fund => {
                const listItem = document.createElement('li');
                listItem.className = 'fund-item';
                listItem.textContent = `Fund: ${fund.name} — Goal: $${fund.goal.toFixed(2)}`;
    
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.className = 'delete-btn';
                deleteButton.onclick = function () {
                    updateTotal(`$${fund.goal.toFixed(2)}`, false);
                    listItem.remove();
                };
    
                listItem.appendChild(deleteButton);
                document.getElementById('linkList').appendChild(listItem);
    
                fundItems.push(fund); // Restore into fundItems array
                updateTotal(`$${fund.goal.toFixed(2)}`);
            });

        } catch (error) {
            console.error('Error loading shared list:', error);
        }
    }

    // Toggle side menu when hamburger icon is clicked
    document.getElementById("menuToggle").addEventListener("click", function() {
        let menu = document.getElementById("sideMenu");
        if (menu.style.width === "250px") {
            menu.style.width = "0"; // Close the menu
        } else {
            menu.style.width = "250px"; // Open the menu
        }
    });
    
    //Add Fund Functionality
        const fundNameInput = document.createElement("input");
        fundNameInput.type = "text";
        fundNameInput.id = "fundNameInput";
        fundNameInput.placeholder = "Fund Name";
    
        const fundGoalInput = document.createElement("input");
        fundGoalInput.type = "number";
        fundGoalInput.id = "fundGoalInput";
        fundGoalInput.placeholder = "Fund Goal Amount ($)";
    
        const addFundBtn = document.createElement("button");
        addFundBtn.id = "addFundBtn";
        addFundBtn.textContent = "Add Fund";
    
        const fundContainer = document.createElement("div");
        fundContainer.className = "container fund-container";
        fundContainer.appendChild(fundNameInput);
        fundContainer.appendChild(fundGoalInput);
        fundContainer.appendChild(addFundBtn)

        document.body.insertBefore(fundContainer, document.getElementById("shareButton"));

        addFundBtn.addEventListener("click", function () {
            const name = fundNameInput.value.trim();
            const goal = parseFloat(fundGoalInput.value.trim());
    
            if (!name) {
                alert("Please enter a fund name.");
                return;
            }
            if (isNaN(goal) || goal <= 0) {
                alert("Please enter a valid positive number for the fund goal.");
                return;
            }
    
            // Create a list item for the fund
            const listItem = document.createElement('li');
            listItem.className = 'fund-item'; 

            // Add text content
             listItem.textContent = `Fund: ${name} — Goal: $${goal.toFixed(2)}`;

            // Optional: add delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'X';
            deleteButton.className = 'delete-btn';
            deleteButton.onclick = function () {
                listItem.remove();
            };

             listItem.appendChild(deleteButton);

            // Add to list
            document.getElementById('linkList').appendChild(listItem);

            //Update total
            updateTotal(`$${goal.toFixed(2)}`);

            // Store the fund in the listItems array
            fundItems.push({
                name: name,
                goal: goal
            });
             
    
            // Clear inputs
            fundNameInput.value = "";
            fundGoalInput.value = "";
        });
    
        //Allow Enter Key to Trigger Fund Add
        [fundNameInput, fundGoalInput].forEach(input => {
            input.addEventListener("keypress", function (e) {
                if (e.key === "Enter") {
                    addFundBtn.click();
                }
            });
        });

});