let isSharedView = false;

document.addEventListener("DOMContentLoaded", function () {
    // Show loading spinner initially
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Toggle side menu when hamburger icon is clicked
    const menuToggle = document.getElementById("menuToggle");
    const sideMenu = document.getElementById("sideMenu");

    // Process any URL parameters first
     processUrlParameters();

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
            window.location.href = '../Login/login.html';
        });
    }

    if (!isSharedView) {
        displayWishlists();
    }
});

function processUrlParameters() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'flex'; // Show loading spinner
    
    const urlParams = new URLSearchParams(window.location.search);
    const encoded = urlParams.get("shared") || urlParams.get("list");

    if (!encoded) {
        return;
    }

    try {
        const loadedData = JSON.parse(decodeURIComponent(atob(encoded)));

        if (urlParams.has("shared")) {
            isSharedView = true;
            const actualList = loadedData.wishlist || loadedData;
            displaySingleSharedList(actualList);
            loadingSpinner.style.display = 'none'; // Hide loading spinner
            return;
        }

        const existingLists = JSON.parse(localStorage.getItem('saved_lists') || '[]');
        const alreadyExists = existingLists.some(list => list.name === loadedData.name);

        if (!alreadyExists) {
            existingLists.push(loadedData);
            localStorage.setItem('saved_lists', JSON.stringify(existingLists));
            alert(`"${loadedData.name}" wishlist has been added to your lists!`);
        } else {
            alert(`You already have a wishlist named "${loadedData.name}"`);
        }

        window.history.replaceState({}, document.title, window.location.pathname);
        loadingSpinner.style.display = 'none'; // Hide loading spinner

    } catch (error) {
        console.error('Error processing shared/list URL parameter:', error);
        loadingSpinner.style.display = 'none'; // Hide loading spinner in case of error
    }
}


function displayWishlists() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'flex'; // Show loading spinner
    
    const container = document.getElementById('wishlistContainer');
    const lists = JSON.parse(localStorage.getItem('saved_lists') || '[]');

    // Create or retrieve the visibility states object from localStorage
    let purchasedItemsVisibility = JSON.parse(localStorage.getItem('purchased_items_visibility') || '{}');
    
    if (!container) {
        console.error("Container element not found");
        loadingSpinner.style.display = 'none'; // Hide loading spinner
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    if (lists.length === 0) {
        container.innerHTML = '<p>You have no saved wishlists yet.</p>';
        loadingSpinner.style.display = 'none'; // Hide loading spinner
        return;
    }
    
    lists.forEach((list, index) => {

         // Initialize visibility state for this list if not already set
         if (purchasedItemsVisibility[index] === undefined) {
            purchasedItemsVisibility[index] = true; // Default to showing purchased items
        }

        const card = document.createElement('div');
        card.className = 'wishlist-card';

        // Create header with list name and toggle button
        const header = document.createElement('div');
        header.className = 'wishlist-header';
        
        const title = document.createElement('h2');
        title.textContent = list.name;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-details';
        toggleBtn.textContent = 'Show Items';
        toggleBtn.setAttribute('data-index', index);



        // Add delete list button
        const deleteListBtn = document.createElement('button');
        deleteListBtn.className = 'delete-btn';
        deleteListBtn.textContent = 'X';
        deleteListBtn.setAttribute('data-index', index);
        deleteListBtn.onclick = function() {
         deleteWishlist(index);
        };

        // Create Share button
        const shareBtn = document.createElement('button');
        shareBtn.className = 'share-btn';
        shareBtn.textContent = 'Share List';

        shareBtn.addEventListener('click', () => {
            // Create a deep copy of just this list to share
            const listToShare = JSON.parse(JSON.stringify(list));
            
            // Create an object containing just this wishlist
            const shareData = {
                type: 'single_wishlist',
                wishlist: listToShare
            };
            
            const encodedData = btoa(encodeURIComponent(JSON.stringify(shareData)));
            const shareURL = `${window.location.origin}${window.location.pathname}?shared=${encodedData}`;

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'share-modal';

            const modalContent = document.createElement('div');
            modalContent.className = 'share-modal-content';

            const closeBtn = document.createElement('span');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '&times;';
            closeBtn.onclick = () => document.body.removeChild(modal);

            const info = document.createElement('p');
            info.textContent = `Share "${list.name}" wishlist:`;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = shareURL;
            input.readOnly = true;
            input.style.width = '100%';
            input.onclick = () => input.select();

            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy Link';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(shareURL)
                .then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => copyBtn.textContent = 'Copy Link', 1500);
                });
            };

            modalContent.appendChild(closeBtn);
            modalContent.appendChild(info);
            modalContent.appendChild(input);
            modalContent.appendChild(copyBtn);
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
        });

        
        header.appendChild(title);
        header.appendChild(toggleBtn);
        header.appendChild(shareBtn);
        header.appendChild(deleteListBtn);
        card.appendChild(header);
        
        // Create details section (hidden by default)
        const details = document.createElement('div');
        details.className = 'wishlist-details';
        details.id = `details-${index}`;
        details.style.display = 'none';

        // Add hide purchased items toggle button right below the header
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'list-controls';
                
        const togglePurchasedBtn = document.createElement('button');
        togglePurchasedBtn.className = 'toggle-purchased-btn';
        togglePurchasedBtn.textContent = purchasedItemsVisibility[index] ? 'Hide Purchased Items' : 'Show Purchased Items';
        togglePurchasedBtn.setAttribute('data-index', index);
        togglePurchasedBtn.onclick = function() {
            togglePurchasedItemsVisibility(index);
                };
                
        controlsDiv.appendChild(togglePurchasedBtn);
        details.appendChild(controlsDiv);
        
        // Create items section
        if (list.items && list.items.length > 0) {
            const itemsHeader = document.createElement('h3');
            itemsHeader.textContent = 'Items';
            details.appendChild(itemsHeader);
            
            const itemsList = document.createElement('ul');
            itemsList.className = 'items-list';
            
            list.items.forEach((item, itemIndex) => {
                const listItem = document.createElement('li');
                listItem.className = item.purchased ? 'item purchased-item' : 'item';
                listItem.setAttribute('data-list-index', index);
                listItem.setAttribute('data-item-index', itemIndex);

            // Apply visibility based on the current state
            if (item.purchased && !purchasedItemsVisibility[index]) {
            listItem.style.display = 'none';
            }
                
                // Create link element
                const linkElement = document.createElement('a');
                linkElement.href = item.link;
                linkElement.target = "_blank";
                linkElement.textContent = item.text || item.link;
                
                // Create price span
                const priceSpan = document.createElement('span');
                priceSpan.className = 'item-price';
                priceSpan.textContent = item.price;
                
                // Create purchase toggle button
                const purchaseButton = document.createElement('button');
                purchaseButton.className = 'purchase-btn';
                purchaseButton.innerHTML = '&#10004;'; // Checkmark
                purchaseButton.onclick = function() {
                    toggleItemPurchased(this, index, itemIndex);
                };
                
                // Create edit button
                const editButton = document.createElement('button');
                editButton.className = 'edit-btn';
                editButton.innerHTML = '&#9998;'; // Pencil
                editButton.onclick = function() {
                    createEditItemModal(this, index, itemIndex);
                };
                
                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = 'X';
                deleteButton.onclick = function() {
                    deleteItem(this, index, itemIndex);
                };
                
                // Append all elements to the list item
                listItem.appendChild(linkElement);
                listItem.appendChild(document.createTextNode(' - '));
                listItem.appendChild(priceSpan);
                listItem.appendChild(purchaseButton);
                listItem.appendChild(editButton);
                listItem.appendChild(deleteButton);
                
                itemsList.appendChild(listItem);
            });
            
            details.appendChild(itemsList);
        }
        
        // Create funds section
        if (list.funds && list.funds.length > 0) {
            const fundsHeader = document.createElement('h3');
            fundsHeader.textContent = 'Funds';
            details.appendChild(fundsHeader);
            
            const fundsList = document.createElement('ul');
            fundsList.className = 'funds-list';
            
            list.funds.forEach((fund, fundIndex) => {
                const fundItem = document.createElement('li');
                fundItem.className = 'fund-item';
                fundItem.setAttribute('data-list-index', index);
                fundItem.setAttribute('data-fund-index', fundIndex);
                
                // Create fund header (contains fund name and buttons)
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
                    openContributeModal(this, index, fundIndex);
                };
                fundActions.appendChild(contributeBtn);
                
                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'X';
                deleteButton.className = 'delete-btn';
                deleteButton.onclick = function() {
                    deleteFund(this, index, fundIndex);
                };
                fundActions.appendChild(deleteButton);
                
                fundHeader.appendChild(fundActions);
                fundItem.appendChild(fundHeader);
                
                // Create fund info element
                const fundInfo = document.createElement('div');
                fundInfo.className = 'fund-info';
                fundInfo.textContent = `Goal: $${fund.goal.toFixed(2)} | Contributed: $${fund.contributed.toFixed(2)} | Remaining: $${(fund.goal - fund.contributed).toFixed(2)}`;
                fundItem.appendChild(fundInfo);
                
                // Create progress bar
                const progressContainer = document.createElement('div');
                progressContainer.className = 'fund-progress';
                
                const progressBar = document.createElement('div');
                progressBar.className = 'fund-progress-bar-fill';
                const progressPercentage = (fund.contributed / fund.goal) * 100;
                progressBar.style.width = `${progressPercentage}%`;
                
                progressContainer.appendChild(progressBar);
                fundItem.appendChild(progressContainer);
                
                fundsList.appendChild(fundItem);
            });
            
            details.appendChild(fundsList);
        }
        
        card.appendChild(details);
        container.appendChild(card);
    });

    // Add event listeners to the toggle buttons
    document.querySelectorAll('.toggle-details').forEach(button => {
        button.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            const details = document.getElementById(`details-${index}`);
            const isVisible = details.style.display === 'block';
            details.style.display = isVisible ? 'none' : 'block';
            this.textContent = isVisible ? 'Show Items' : 'Hide Items';
        });
    });
    
    // Hide loading spinner after wishlists are displayed
    loadingSpinner.style.display = 'none';
}

// Add this new function to toggle visibility of purchased items
function togglePurchasedItemsVisibility(listIndex) {
    // Get current visibility states
    let purchasedItemsVisibility = JSON.parse(localStorage.getItem('purchased_items_visibility') || '{}');
    
    // Toggle the visibility state for this list
    purchasedItemsVisibility[listIndex] = !purchasedItemsVisibility[listIndex];
    
    // Save the updated state
    localStorage.setItem('purchased_items_visibility', JSON.stringify(purchasedItemsVisibility));
    
    // Update UI
    const isVisible = purchasedItemsVisibility[listIndex];
    const list = document.querySelectorAll(`li.item[data-list-index="${listIndex}"].purchased-item`);
    
    // Update the toggle button text
    const toggleBtn = document.querySelector(`.toggle-purchased-btn[data-index="${listIndex}"]`);
    if (toggleBtn) {
        toggleBtn.textContent = isVisible ? 'Hide Purchased Items' : 'Show Purchased Items';
    }

        // Show/hide purchased items
        list.forEach(item => {
            item.style.display = isVisible ? '' : 'none';
        });
    }


//Delete wishlist functionality
function deleteWishlist(listIndex) {
    // Show loading spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // Show confirmation popup
    if (!confirm('Are you sure you want to delete this wishlist? This action cannot be undone.')) return;
    
    loadingSpinner.style.display = 'flex'; // Show loading spinner
    
    const lists = JSON.parse(localStorage.getItem('saved_lists') || '[]');
    if (!lists[listIndex]) {
        loadingSpinner.style.display = 'none'; // Hide loading spinner
        return;
    }
    
    // Remove the wishlist from the array
    lists.splice(listIndex, 1);
    
    // Update localStorage
    localStorage.setItem('saved_lists', JSON.stringify(lists));
    
    // Refresh the display
    if (!isSharedView) {
        displayWishlists();
    } else {
        loadingSpinner.style.display = 'none'; // Hide loading spinner
    }
}

// Toggle item purchased status
function toggleItemPurchased(button, listIndex, itemIndex) {
    const lists = JSON.parse(localStorage.getItem('saved_lists') || '[]');
    if (!lists[listIndex] || !lists[listIndex].items[itemIndex]) return;
    
    // Toggle purchased status
    lists[listIndex].items[itemIndex].purchased = !lists[listIndex].items[itemIndex].purchased;
    
    // Update localStorage
    localStorage.setItem('saved_lists', JSON.stringify(lists));
    
    // Update UI
    const listItem = button.closest('li');

    // Get current visibility state
    const purchasedItemsVisibility = JSON.parse(localStorage.getItem('purchased_items_visibility') || '{}');
     const isVisible = purchasedItemsVisibility[listIndex] !== false; // Default to visible if not set

    if (lists[listIndex].items[itemIndex].purchased) {
        listItem.classList.add('purchased-item');
    } else {
        listItem.classList.remove('purchased-item');
    }
}

// Delete item
function deleteItem(button, listIndex, itemIndex) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const lists = JSON.parse(localStorage.getItem('saved_lists') || '[]');
    if (!lists[listIndex] || !lists[listIndex].items[itemIndex]) return;
    
    // Remove item from the array
    lists[listIndex].items.splice(itemIndex, 1);
    
    // Update localStorage
    localStorage.setItem('saved_lists', JSON.stringify(lists));
    
    // Refresh the display
    if (!isSharedView) {
        displayWishlists();
    }
}

// Delete fund
function deleteFund(button, listIndex, fundIndex) {
    if (!confirm('Are you sure you want to delete this fund?')) return;
    
    const lists = JSON.parse(localStorage.getItem('saved_lists') || '[]');
    if (!lists[listIndex] || !lists[listIndex].funds[fundIndex]) return;
    
    // Remove fund from the array
    lists[listIndex].funds.splice(fundIndex, 1);
    
    // Update localStorage
    localStorage.setItem('saved_lists', JSON.stringify(lists));
    
    // Refresh the display
    if (!isSharedView) {
        displayWishlists();
    }
}

// Create edit modal for item
function createEditItemModal(button, listIndex, itemIndex) {
    const lists = JSON.parse(localStorage.getItem('saved_lists') || '[]');
    if (!lists[listIndex] || !lists[listIndex].items[itemIndex]) return;
    
    const item = lists[listIndex].items[itemIndex];
    
    // Create edit modal for name and price
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
        <div class="edit-modal-content">
            <h3>Edit Item</h3>
            <input type="text" id="editNameInput" placeholder="Item name" value="${item.text}">
            <input type="text" id="editPriceInput" placeholder="Item price" value="${item.price}">
            <div class="modal-buttons">
                <button id="saveEditBtn">Save</button>
                <button id="cancelEditBtn">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Save button logic
    document.getElementById('saveEditBtn').addEventListener('click', () => {
        const newName = document.getElementById('editNameInput').value.trim();
        const newPrice = document.getElementById('editPriceInput').value.trim();
        
        if (newName) {
            lists[listIndex].items[itemIndex].text = newName;
        }
        
        if (newPrice) {
            lists[listIndex].items[itemIndex].price = formatPrice(newPrice);
        }
        
        // Update localStorage
        localStorage.setItem('saved_lists', JSON.stringify(lists));
        
        // Remove modal
        document.body.removeChild(modal);
        
        // Refresh display
        if (!isSharedView) {
        displayWishlists();
    }
    });

    // Cancel button logic
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Close modal if clicked outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Open contribute modal for fund
function openContributeModal(button, listIndex, fundIndex) {
    const lists = JSON.parse(localStorage.getItem('saved_lists') || '[]');
    if (!lists[listIndex] || !lists[listIndex].funds[fundIndex]) return;
    
    const fund = lists[listIndex].funds[fundIndex];
    
    // Create contribution modal
    const modal = document.createElement('div');
    modal.className = 'contribution-modal';
    modal.innerHTML = `
        <div class="contribution-modal-content">
            <h3>Contribute to Fund: ${fund.name}</h3>
            <p>Fund Goal: $${fund.goal.toFixed(2)}</p>
            <p>Contributed so far: $${fund.contributed.toFixed(2)}</p>
            <p>Remaining: $${(fund.goal - fund.contributed).toFixed(2)}</p>
            <input type="number" id="contributionAmount" placeholder="Enter contribution amount" step="0.01" min="0.01" max="${(fund.goal - fund.contributed).toFixed(2)}">
            <div class="modal-buttons">
                <button id="contributeBtn">Contribute</button>
                <button id="cancelContributeBtn">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Contribute button logic
    document.getElementById('contributeBtn').addEventListener('click', () => {
        const contributionInput = document.getElementById('contributionAmount');
        const contributionAmount = parseFloat(contributionInput.value);
        
        if (isNaN(contributionAmount) || contributionAmount <= 0) {
            alert('Please enter a valid contribution amount.');
            return;
        }

        const remainingAmount = fund.goal - fund.contributed;
        if (contributionAmount > remainingAmount) {
            alert(`You cannot contribute more than the remaining amount: $${remainingAmount.toFixed(2)}`);
            return;
        }

        // Add contribution to fund
        lists[listIndex].funds[fundIndex].contributed += contributionAmount;
        
        // Update localStorage
        localStorage.setItem('saved_lists', JSON.stringify(lists));
        
        // Remove modal
        document.body.removeChild(modal);
        
        // Refresh display
        if (!isSharedView) {
        displayWishlists();
    }
    });

    // Cancel button logic
    document.getElementById('cancelContributeBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Close modal if clicked outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Helper function to format price consistently
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


function displaySingleSharedList(sharedList) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'flex'; // Show loading spinner
    
    const container = document.getElementById('wishlistContainer');
    container.innerHTML = '';

    // Create or retrieve the visibility state for the shared list
    let showPurchasedItems = true; // Default to showing purchased items

    const card = document.createElement('div');
    card.className = 'wishlist-card';

    const header = document.createElement('div');
    header.className = 'wishlist-header';

    const title = document.createElement('h2');
    title.textContent = sharedList.name;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-details';
    toggleBtn.textContent = 'Show Items';
    toggleBtn.onclick = function () {
        details.style.display = details.style.display === 'block' ? 'none' : 'block';
        this.textContent = details.style.display === 'block' ? 'Hide Items' : 'Show Items';
    };

    header.appendChild(title);
    header.appendChild(toggleBtn);
    card.appendChild(header);

    const details = document.createElement('div');
    details.className = 'wishlist-details';
    details.style.display = 'none';

    // Add hide purchased items toggle button
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'list-controls';
            
    const togglePurchasedBtn = document.createElement('button');
    togglePurchasedBtn.className = 'toggle-purchased-btn';
    togglePurchasedBtn.textContent = 'Hide Purchased Items';
    togglePurchasedBtn.onclick = function() {
        showPurchasedItems = !showPurchasedItems;
        togglePurchasedBtn.textContent = showPurchasedItems ? 'Hide Purchased Items' : 'Show Purchased Items';
        
        // Toggle visibility of purchased items
        document.querySelectorAll('.item.purchased').forEach(item => {
            item.style.display = showPurchasedItems ? '' : 'none';
        });
    };
            
    controlsDiv.appendChild(togglePurchasedBtn);
    details.appendChild(controlsDiv);

    // Render items
    if (sharedList.items && sharedList.items.length > 0) {
        const itemsHeader = document.createElement('h3');
        itemsHeader.textContent = 'Items';
        details.appendChild(itemsHeader);

        const itemsList = document.createElement('ul');
        itemsList.className = 'items-list';

        sharedList.items.forEach((item) => {
            const listItem = document.createElement('li');
            // Apply purchased class if the item is marked as purchased
            listItem.className = item.purchased ? 'item purchased' : 'item';

            const link = document.createElement('a');
            link.href = item.link;
            link.target = '_blank';
            link.textContent = item.text || item.link;

            const price = document.createElement('span');
            price.className = 'item-price';
            price.textContent = item.price;

            listItem.appendChild(link);
            listItem.appendChild(document.createTextNode(' - '));
            listItem.appendChild(price);
            itemsList.appendChild(listItem);
        });

        details.appendChild(itemsList);
    }

    // Render funds
    if (sharedList.funds && sharedList.funds.length > 0) {
        const fundsHeader = document.createElement('h3');
        fundsHeader.textContent = 'Funds';
        details.appendChild(fundsHeader);

        sharedList.funds.forEach((fund) => {
            const fundBox = document.createElement('div');
            fundBox.className = 'fund-box';

            const name = document.createElement('strong');
            name.textContent = "Fund: " + fund.name;
            name.style.display = 'block';

            const goal = parseFloat(fund.goal || 0);
            const contributed = parseFloat(fund.contributed || 0);
            const remaining = goal - contributed;

            const detailsText = document.createElement('p');
            detailsText.textContent = `Goal: $${goal.toFixed(2)} | Contributed: $${contributed.toFixed(2)} | Remaining: $${remaining.toFixed(2)}`;

            const bar = document.createElement('div');
            bar.className = 'progress-bar';

            const fill = document.createElement('div');
            fill.className = 'progress-fill';
            fill.style.width = `${(contributed / goal) * 100}%`;

            bar.appendChild(fill);
            fundBox.appendChild(name);
            fundBox.appendChild(detailsText);
            fundBox.appendChild(bar);

            details.appendChild(fundBox);
        });
    }

    card.appendChild(details);
    container.appendChild(card);
    
    // Hide loading spinner after shared list is displayed
    loadingSpinner.style.display = 'none';
}