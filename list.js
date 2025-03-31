let total = 0;
let listItems = []; // Array to store list items
let fundItems = []; // Array to store fund items

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

    console.log(listItems);
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
    
    // Create purchase toggle button
    const purchaseButton = document.createElement('button');
    purchaseButton.className = 'purchase-btn';
    purchaseButton.innerHTML = '&#10004;'; // Checkmark icon
    purchaseButton.onclick = function() {
        togglePurchased(this);
    };
    
    // Append all elements to the list item
    listItem.appendChild(linkElement);
    listItem.appendChild(document.createTextNode(' - '));
    listItem.appendChild(priceSpan);
    listItem.appendChild(purchaseButton);
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    
    document.getElementById('linkList').appendChild(listItem);
    
    // Store the item in our tracking array
    listItems.push({
        link: link,
        text: text || link,
        price: price,
        description: '', // Initialize empty description
        purchased: false // Add purchased status
    });
    
    // Update total price
    updateTotal(price);
    
    // Clear input fields
    document.getElementById('linkInput').value = '';
    document.getElementById('textInput').value = '';
    document.getElementById('priceInput').value = '';
}

function togglePurchased(button) {
    const listItem = button.parentElement;
    const index = Array.from(listItem.parentNode.children).indexOf(listItem);
    
    // Toggle purchased status
    listItems[index].purchased = !listItems[index].purchased;
    
    // Get price for this item
    const priceText = listItem.querySelector('.item-price').textContent;
    
    if (listItems[index].purchased) {
        // Mark as purchased
        listItem.classList.add('purchased-item');
        // Subtract price from total
        updateTotal(priceText, false);
    } else {
        // Unmark as purchased
        listItem.classList.remove('purchased-item');
        // Add price back to total
        updateTotal(priceText, true);
    }
}

function openContributeModal(fundIndex) {
    // Create contribution modal
    const modal = document.createElement('div');
    modal.className = 'contribution-modal';
    modal.innerHTML = `
        <div class="contribution-modal-content">
            <h3>Contribute to Fund: ${fundItems[fundIndex].name}</h3>
            <p>Fund Goal: $${fundItems[fundIndex].goal.toFixed(2)}</p>
            <p>Contributed so far: $${fundItems[fundIndex].contributed.toFixed(2)}</p>
            <p>Remaining: $${(fundItems[fundIndex].goal - fundItems[fundIndex].contributed).toFixed(2)}</p>
            <input type="number" id="contributionAmount" placeholder="Enter contribution amount" step="0.01" min="0.01" max="${(fundItems[fundIndex].goal - fundItems[fundIndex].contributed).toFixed(2)}">
            <div class="modal-buttons">
                <button id="contributeBtn">Contribute</button>
                <button id="cancelContributeBtn">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Style the modal (reuse same style as description modal)
    const style = document.createElement('style');
    style.textContent = `
        .contribution-modal {
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
        .contribution-modal-content {
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            width: 80%;
            max-width: 500px;
            text-align: center;
        }
        .contribution-modal-content input {
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            box-sizing: border-box;
        }
        .modal-buttons {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
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

    // Contribute button logic
    document.getElementById('contributeBtn').addEventListener('click', () => {
        const contributionInput = document.getElementById('contributionAmount');
        const contributionAmount = parseFloat(contributionInput.value);
        
        if (isNaN(contributionAmount) || contributionAmount <= 0) {
            alert('Please enter a valid contribution amount.');
            return;
        }

        const remainingAmount = fundItems[fundIndex].goal - fundItems[fundIndex].contributed;
        if (contributionAmount > remainingAmount) {
            alert(`You cannot contribute more than the remaining amount: $${remainingAmount.toFixed(2)}`);
            return;
        }

        // Add contribution to fund
        fundItems[fundIndex].contributed += contributionAmount;
        
        // Update the total (subtract the contribution)
        updateTotal(`$${contributionAmount.toFixed(2)}`, false);
        
        // Update the fund item display
        updateFundDisplay(fundIndex);
        
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });

    // Cancel button logic
    document.getElementById('cancelContributeBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });

    // Prevent modal from closing when clicking on content
    modal.querySelector('.contribution-modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Close modal if clicked outside
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });
}

function updateFundDisplay(fundIndex) {
    const fund = fundItems[fundIndex];
    const fundElement = document.querySelector(`[data-fund-index="${fundIndex}"]`);
    
    if (fundElement) {
        const fundNameElement = fundElement.querySelector('.fund-name');
        const fundInfoElement = fundElement.querySelector('.fund-info');
        const progressBar = fundElement.querySelector('.fund-progress-bar-fill');
        
        // Update progress bar
        const progressPercentage = (fund.contributed / fund.goal) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        // Update fund info text
        fundInfoElement.textContent = `Goal: $${fund.goal.toFixed(2)} | Contributed: $${fund.contributed.toFixed(2)} | Remaining: $${(fund.goal - fund.contributed).toFixed(2)}`;
    }
}

// Event listeners for Enter key on input fields
document.addEventListener('DOMContentLoaded', function() {
    // Add styles for fund elements
    const fundStyles = document.createElement('style');
    fundStyles.textContent = `
        .fund-item {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            padding: 15px;
            position: relative;
        }
        .fund-header {
            display: flex;
            justify-content: space-between;
            width: 100%;
            margin-bottom: 8px;
        }
        .fund-name {
            font-weight: bold;
            color: #d63384;
            margin-right: 10px;
        }
        .fund-info {
            font-size: 0.9em;
            color: #555;
            margin-bottom: 8px;
        }
        .fund-progress {
            width: 100%;
            height: 12px;
            background-color: #f0f0f0;
            border-radius: 6px;
            overflow: hidden;
            margin-bottom: 8px;
        }
        .fund-progress-bar-fill {
            height: 100%;
            background-color: #d63384;
            transition: width 0.3s ease;
        }
        .fund-actions {
            display: flex;
            gap: 5px;
            position: absolute;
            top: 10px;
            right: 10px;
        }
        .contribute-btn {
            background-color: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 3px 8px;
            font-size: 0.8em;
            cursor: pointer;
        }
        .contribute-btn:hover {
            background-color: #218838;
        }
    `;
    document.head.appendChild(fundStyles);

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
            fundItems = [];
            
            // Recreate list items
            loadedItems.forEach(item => {
                // Set input values
                document.getElementById('linkInput').value = item.link;
                document.getElementById('textInput').value = item.text;
                document.getElementById('priceInput').value = item.price;
                
                // Trigger add link to recreate the item
                addLink();
                
                // Restore purchased status if applicable
                if (item.purchased) {
                    const lastAddedItem = document.getElementById('linkList').lastChild;
                    const purchaseButton = lastAddedItem.querySelector('.purchase-btn');
                    togglePurchased(purchaseButton);
                }
            });

            // Recreate fund items
            loadedFunds.forEach((fund, index) => {
                // Ensure the fund has a contributed property (for backward compatibility)
                if (fund.contributed === undefined) {
                    fund.contributed = 0;
                }
                
                createFundElement(fund, index);
                fundItems.push(fund);
                
                // Add the remaining amount (goal - contributed) to the total
                const remainingAmount = fund.goal - fund.contributed;
                updateTotal(`$${remainingAmount.toFixed(2)}`);
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
    
    // Add Fund Functionality
    const fundNameInput = document.createElement("input");
    fundNameInput.type = "text";
    fundNameInput.id = "fundNameInput";
    fundNameInput.placeholder = "Fund Name";

    const fundGoalInput = document.createElement("input");
    fundGoalInput.type = "number";
    fundGoalInput.id = "fundGoalInput";
    fundGoalInput.placeholder = "Fund Goal Amount ($)";
    fundGoalInput.step = "0.01";
    fundGoalInput.min = "0.01";

    const addFundBtn = document.createElement("button");
    addFundBtn.id = "addFundBtn";
    addFundBtn.textContent = "Add Fund";

    const fundContainer = document.createElement("div");
    fundContainer.className = "container fund-container";
    fundContainer.appendChild(fundNameInput);
    fundContainer.appendChild(fundGoalInput);
    fundContainer.appendChild(addFundBtn);

    document.body.insertBefore(fundContainer, document.getElementById("shareButton"));

    function createFundElement(fund, index) {
        // Create a list item for the fund
        const listItem = document.createElement('li');
        listItem.className = 'fund-item';
        listItem.setAttribute('data-fund-index', index);
        
        // Create the fund header (contains fund name and buttons)
        const fundHeader = document.createElement('div');
        fundHeader.className = 'fund-header';
        
        // Create fund name element
        const fundName = document.createElement('div');
        fundName.className = 'fund-name';
        fundName.textContent = `Fund: ${fund.name}`;
        fundHeader.appendChild(fundName);
        
        // Create fund actions container
        const fundActions = document.createElement('div');
        fundActions.className = 'fund-actions';
        
        // Create contribute button
        const contributeBtn = document.createElement('button');
        contributeBtn.className = 'contribute-btn';
        contributeBtn.textContent = 'Contribute';
        contributeBtn.onclick = function() {
            const fundIndex = parseInt(listItem.getAttribute('data-fund-index'));
            openContributeModal(fundIndex);
        };
        fundActions.appendChild(contributeBtn);
        
        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = function() {
            const fundIndex = parseInt(listItem.getAttribute('data-fund-index'));
            const remainingAmount = fundItems[fundIndex].goal - fundItems[fundIndex].contributed;
            
            // Remove the remaining amount from the total
            updateTotal(`$${remainingAmount.toFixed(2)}`, false);
            
            // Remove from fundItems array
            fundItems.splice(fundIndex, 1);
            
            // Update data-fund-index attributes for all funds after this one
            const allFundItems = document.querySelectorAll('.fund-item');
            allFundItems.forEach(item => {
                const itemIndex = parseInt(item.getAttribute('data-fund-index'));
                if (itemIndex > fundIndex) {
                    item.setAttribute('data-fund-index', itemIndex - 1);
                }
            });
            
            // Remove the list item
            listItem.remove();
        };
        fundActions.appendChild(deleteButton);
        
        fundHeader.appendChild(fundActions);
        listItem.appendChild(fundHeader);
        
        // Create fund info element
        const fundInfo = document.createElement('div');
        fundInfo.className = 'fund-info';
        fundInfo.textContent = `Goal: $${fund.goal.toFixed(2)} | Contributed: $${fund.contributed.toFixed(2)} | Remaining: $${(fund.goal - fund.contributed).toFixed(2)}`;
        listItem.appendChild(fundInfo);
        
        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'fund-progress';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'fund-progress-bar-fill';
        const progressPercentage = (fund.contributed / fund.goal) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        
        progressContainer.appendChild(progressBar);
        listItem.appendChild(progressContainer);
        
        document.getElementById('linkList').appendChild(listItem);
    }

    addFundBtn.addEventListener("click", function() {
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

        // Create new fund object
        const newFund = {
            name: name,
            goal: goal,
            contributed: 0 // Initialize contributions at 0
        };
        
        // Add to fundItems array
        const fundIndex = fundItems.length;
        fundItems.push(newFund);
        
        // Create the fund element
        createFundElement(newFund, fundIndex);
        
        // Add the goal amount to the total
        updateTotal(`$${goal.toFixed(2)}`);
        
        // Clear inputs
        fundNameInput.value = "";
        fundGoalInput.value = "";
    });

    // Allow Enter key to trigger fund add
    [fundNameInput, fundGoalInput].forEach(input => {
        input.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                addFundBtn.click();
            }
        });
    });

    // Create toggle button for purchased items
    const togglePurchasedButton = document.createElement('button');
    togglePurchasedButton.id = 'togglePurchasedButton';
    togglePurchasedButton.className = 'toggle-btn';
    togglePurchasedButton.textContent = 'Hide Purchased Items';
    togglePurchasedButton.style.position = 'fixed';
    togglePurchasedButton.style.top = '65px';
    togglePurchasedButton.style.right = '20px';
    togglePurchasedButton.style.zIndex = '100';

    // Add toggle button after share button
    document.body.insertBefore(togglePurchasedButton, document.getElementById('shareLinkPopup'));

    // Initialize hidden state
    let purchasedItemsHidden = false;

    // Toggle function for hiding/showing purchased items
    togglePurchasedButton.addEventListener('click', function() {
        purchasedItemsHidden = !purchasedItemsHidden;
        
        // Update button text
        this.textContent = purchasedItemsHidden ? 'Show Purchased Items' : 'Hide Purchased Items';
        
        // Get all list items
        const listItems = document.querySelectorAll('#linkList li');
        
        // Toggle visibility based on purchased status
        listItems.forEach(item => {
            if (item.classList.contains('purchased-item')) {
                item.style.display = purchasedItemsHidden ? 'none' : '';
            }
        });
    });
});