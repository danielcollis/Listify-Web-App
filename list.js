// Import Firebase modules
import { getFirestore, doc, setDoc, collection, getDocs, deleteDoc, query, where, addDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
  
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const db = getFirestore(app);
  const auth = getAuth(app);
  
  // Track current wishlist ID
  let currentWishlistId = null;
  let currentUserId = null;

// Check if this is a new list or a shared list
async function initializeWishlist() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedList = urlParams.get('list');
    
    // If there's a shared list, just display it without saving to Firestore
    if (encodedList) {
        try {
            const decodedData = decodeURIComponent(atob(encodedList));
            const loadedData = JSON.parse(decodedData);
            displaySharedList(loadedData);
            // Hide loading spinner after shared list is displayed
            document.getElementById('loadingSpinner').style.display = 'none';
            return;
        } catch (error) {
            console.error('Error loading shared list:', error);
            // Hide loading spinner in case of error
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    }

    // Check if user is authenticated
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUserId = user.uid;
            
            // NEW! Load the user's custom categories
            await loadUserCategories(user.uid); 

            // Check if an existing wishlist ID was passed
            const wishlistId = urlParams.get('id');
            if (wishlistId) {
                currentWishlistId = wishlistId;
                await loadWishlistItems(wishlistId);
            } else {
                // Create a new wishlist
                await createNewWishlist();
            }
        } else {
            // Not logged in, redirect to login
            window.location.href = "Login/login.html";
        }
    });
}

// Create a new empty wishlist
async function createNewWishlist() {
    try {
        // Create a new wishlist document
        const wishlistRef = await addDoc(collection(db, "wishlists"), {
            userId: currentUserId,
            name: "My Wishlist",
            created: new Date(),
            lastModified: new Date()
        });
        
        currentWishlistId = wishlistRef.id;
        updateWishlistName("My Wishlist");
        
        // Clear the UI since this is a new list
        document.getElementById('linkList').innerHTML = '';
        listItems = [];
        fundItems = [];
        total = 0;
        document.getElementById('totalPrice').innerText = `Total: $0.00`;
        
        // Update URL to include the wishlist ID (without reloading)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('id', currentWishlistId);
        window.history.pushState({}, '', newUrl);
        
        // Hide loading spinner after new wishlist is created
        document.getElementById('loadingSpinner').style.display = 'none';
        
    } catch (error) {
        console.error("Error creating new wishlist:", error);
        // Hide loading spinner in case of error
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

// Load items for a specific wishlist
async function loadWishlistItems(wishlistId) {
    try {
        // Clear existing items
        listItems = [];
        fundItems = [];
        total = 0;
        document.getElementById('linkList').innerHTML = '';
        document.getElementById('totalPrice').innerText = `Total: $0.00`;
        
        console.log("Loading wishlist items for: ", wishlistId);
        
        // Get the wishlist document to retrieve the name
        const wishlistDoc = await getDoc(doc(db, "wishlists", wishlistId));
        if (wishlistDoc.exists()) {
            const wishlistData = wishlistDoc.data();
            updateWishlistName(wishlistData.name || "My Wishlist");
            



            // custom category loading code here
            if (wishlistData.categories && Array.isArray(wishlistData.categories)) {
                const productTypeSelect = document.getElementById("productType");
                const filterProductTypeSelect = document.getElementById("filterProductType");

                wishlistData.categories.forEach(category => {
                    if (!Array.from(productTypeSelect.options).some(option => option.value === category)) {
                        const newOption = document.createElement("option");
                        newOption.value = category;
                        newOption.textContent = category;
                        productTypeSelect.insertBefore(newOption, productTypeSelect.lastElementChild);
                    }

                    if (!Array.from(filterProductTypeSelect.options).some(option => option.value === category)) {
                        const newFilterOption = document.createElement("option");
                        newFilterOption.value = category;
                        newFilterOption.textContent = category;
                        filterProductTypeSelect.appendChild(newFilterOption);
                    }
                });
            }




            // Verify this wishlist belongs to the current user
            if (wishlistData.userId !== currentUserId) {
                alert("You don't have permission to access this wishlist");
                createNewWishlist();
                return;
            }
        }
        
        // Query items belonging to this wishlist
        const q = query(collection(db, "wishlistItems"), where("wishlistId", "==", wishlistId));
        const querySnapshot = await getDocs(q);
        
        console.log("Found wishlist items: ", querySnapshot.size);
        
        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            item.docId = docSnap.id; // Store the document ID for later updates/deletes
            listItems.push(item);
            
            // Create DOM element for the item
            createItemElement(item, listItems.length - 1);
            
            // Update total if not purchased
            if (!item.purchased) {
                updateTotal(item.price);
            }
        });
        
        // Load fund items
        console.log("Querying wishlist funds for wishlistId: ", wishlistId);
        const fundsQuery = query(collection(db, "wishlistFunds"), where("wishlistId", "==", wishlistId));
        const fundsSnapshot = await getDocs(fundsQuery);
        
        console.log("Found funds: ", fundsSnapshot.size);
        
        fundsSnapshot.forEach((docSnap) => {
            console.log("Processing fund:", docSnap.id);
            const fund = docSnap.data();
            fund.docId = docSnap.id; // Store the document ID for later updates/deletes
            
            console.log("Fund data:", fund);
            
            fundItems.push(fund);
            
            // Create DOM element for the fund
            try {
                createFundElement(fund, fundItems.length - 1);
                console.log("Fund element created successfully");
            } catch (error) {
                console.error("Error creating fund element:", error);
            }
            
            // Add the remaining amount to the total
            const remainingAmount = fund.goal - fund.contributed;
            updateTotal(`$${remainingAmount.toFixed(2)}`);
        });
        
        // Hide loading spinner after data is loaded
        document.getElementById('loadingSpinner').style.display = 'none';
        
    } catch (error) {
        console.error("Error loading wishlist items:", error);
        // Hide loading spinner in case of error
        document.getElementById('loadingSpinner').style.display = 'none';
    }
}

// Display a shared list without saving to Firestore
function displaySharedList(loadedData) {
    // Clear existing list
    document.getElementById('linkList').innerHTML = '';
    total = 0;
    
    const loadedItems = loadedData.items || [];
    const loadedFunds = loadedData.funds || [];
    const loadedName = loadedData.name || "My Wishlist";

    // Update the wishlist name
    updateWishlistName(loadedName);
    
    // Set the listItems array directly instead of recreating items one by one
    listItems = [...loadedItems];
    fundItems = [];
    
    // Recreate the DOM elements for each item
    listItems.forEach((item, index) => {
        createItemElement(item, index);
        
        // Add price to total if not purchased
        if (!item.purchased) {
            updateTotal(item.price);
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
    
    // Hide loading spinner after shared list is displayed
    document.getElementById('loadingSpinner').style.display = 'none';
}





// Load categories from Firestore for a given userId
async function loadCategoriesForUser(userId) {
    try {
        const categoriesSnapshot = await getDocs(
            collection(db, "users", userId, "categories")
        );
        const categories = [];
        categoriesSnapshot.forEach(doc => {
            categories.push(doc.data().name);
        });
        return categories;
    } catch (error) {
        console.error("Error loading user categories:", error);
        return [];
    }
}






// Category Helper Functions

// Function to load saved categories for the logged-in user
async function loadUserCategories(userId) {
    const productTypeSelect = document.getElementById("productType");
    const filterProductTypeSelect = document.getElementById("filterProductType");

    try {
        const categoriesSnapshot = await getDocs(collection(db, "users", userId, "categories"));
        categoriesSnapshot.forEach((doc) => {
            const category = doc.data().name;

            // Add to Product Type Dropdown
            const newOption = document.createElement("option");
            newOption.value = category;
            newOption.textContent = category;
            productTypeSelect.insertBefore(newOption, productTypeSelect.lastElementChild);

            // Add to Filter Dropdown
            const newFilterOption = document.createElement("option");
            newFilterOption.value = category;
            newFilterOption.textContent = category;
            filterProductTypeSelect.appendChild(newFilterOption);
        });
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Function to save a new category for the logged-in user
async function saveNewCategory(userId, categoryName) {
    try {
        const categoryRef = collection(db, "users", userId, "categories");
        await addDoc(categoryRef, {
            name: categoryName,
            createdAt: new Date()
        });
        console.log("New category saved:", categoryName);
    } catch (error) {
        console.error("Error saving new category:", error);
    }
}





// Create DOM element for an item (used by both loadWishlistItems and displaySharedList)
function createItemElement(item, index) {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-item-index', index);
    
    if (item.docId) {
        listItem.setAttribute('data-doc-id', item.docId);
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

    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-btn';
    editButton.innerHTML = '&#9998;';
    editButton.onclick = function() {
        createEditModal(this.parentElement, index);
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
    purchaseButton.innerHTML = '&#10004;';
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
    
    // Apply purchased class if needed
    if (item.purchased) {
        listItem.classList.add('purchased-item');
    }

    document.getElementById('linkList').appendChild(listItem);
}

// Save a single wishlist item to Firestore
async function saveItemToFirestore(item) {
    // Don't save to Firestore if we're viewing a shared list
    if (!currentWishlistId) return;
    
    try {
        // Add wishlistId to the item
        item.wishlistId = currentWishlistId;
        item.userId = currentUserId;
        
        const docRef = await addDoc(collection(db, "wishlistItems"), item);
        console.log("Item saved to Firestore:", item);
        return docRef.id;
    } catch (error) {
        console.error("Error saving item to Firestore:", error);
    }
}

// Update an item in Firestore
async function updateItemInFirestore(docId, updates) {
    if (!docId) return;
    
    try {
        await updateDoc(doc(db, "wishlistItems", docId), updates);
        console.log("Item updated in Firestore:", updates);
    } catch (error) {
        console.error("Error updating item in Firestore:", error);
    }
}

// Delete an item from Firestore
async function deleteItemFromFirestore(docId) {
    if (!docId) return;
    
    try {
        await deleteDoc(doc(db, "wishlistItems", docId));
        console.log("Item deleted from Firestore:", docId);
    } catch (error) {
        console.error("Error deleting item from Firestore:", error);
    }
}

// Update wishlist name in Firestore
async function updateWishlistNameInFirestore(name) {
    if (!currentWishlistId) return;
    
    try {
        await updateDoc(doc(db, "wishlists", currentWishlistId), {
            name: name,
            lastModified: new Date()
        });
        console.log("Wishlist name updated in Firestore:", name);
    } catch (error) {
        console.error("Error updating wishlist name in Firestore:", error);
    }
}

let total = 0;
let listItems = []; // Array to store list items
let fundItems = []; // Array to store fund items
let wishlistName = "My Wishlist";

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


// Derive price range string from numeric price
function getPriceRange(priceString) {
    const value = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    if (isNaN(value)) return "Unknown";

    if (value < 25) return "$0–25";
    if (value < 50) return "$25–50";
    if (value < 100) return "$50–100";
    return "$100+";
}

function deleteItem(element) {
    // Extract the price from the list item
    const listItem = element.parentElement;
    const priceSpan = listItem.querySelector('.item-price');
    const priceText = priceSpan ? priceSpan.textContent : '';
    const linkElement = listItem.querySelector('a');
    
    // Get the document ID if available
    const docId = listItem.getAttribute('data-doc-id');
    
    // Also delete from Firestore if we have a document ID
    if (docId) {
        deleteItemFromFirestore(docId);
    }
    
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
}

function createEditModal(listItem, itemIndex) {
    // Find the actual index in the listItems array that corresponds to this DOM element
    const linkElement = listItem.querySelector('a');
    const priceSpan = listItem.querySelector('.item-price');
    
    // Find the correct item in listItems
    const actualIndex = listItems.findIndex(item => 
        item.text === linkElement.textContent && 
        item.price === priceSpan.textContent
    );
    
    if (actualIndex === -1) {
        console.error("Item not found in listItems array");
        return;
    }
    
    // Create edit modal for name and price
    const modal = document.createElement('div');
    modal.className = 'description-modal';
    modal.innerHTML = `
        <div class="description-modal-content">
            <h3>Edit Item</h3>
            <input type="text" id="editNameInput" placeholder="Item name" value="${listItems[actualIndex].text}">
            <input type="text" id="editPriceInput" placeholder="Item price" value="${listItems[actualIndex].price}">
            <div class="modal-buttons">
                <button id="saveEditBtn">Save</button>
                <button id="cancelEditBtn">Cancel</button>
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
        .description-modal-content input {
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            box-sizing: border-box;
            border: 2px solid #d63384;
            border-radius: 5px;
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

    // Save button logic
    document.getElementById('saveEditBtn').addEventListener('click', () => {
        const newName = document.getElementById('editNameInput').value.trim();
        const newPrice = document.getElementById('editPriceInput').value.trim();
        
        // Format price
        const formattedPrice = formatPrice(newPrice);
        
        // Get current price for comparison
        const oldPrice = listItems[actualIndex].price;
        
        // Update the item in our tracking array
        listItems[actualIndex].text = newName;
        listItems[actualIndex].price = formattedPrice;
        
        // Update the displayed item
        const linkEl = listItem.querySelector('a');
        const priceEl = listItem.querySelector('.item-price');
        
        linkEl.textContent = newName;
        priceEl.textContent = formattedPrice;
        
        // Update the total price
        if (oldPrice !== formattedPrice && !listItems[actualIndex].purchased) {
            // Subtract old price and add new price
            if (oldPrice) updateTotal(oldPrice, false);
            if (formattedPrice) updateTotal(formattedPrice, true);
        }
        
        document.body.removeChild(modal);
        document.head.removeChild(style);
    });

    // Cancel button logic
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
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

// Add new item (with support for adding new categories)
async function addLink() {
    let link = document.getElementById('linkInput').value.trim();
    const text = document.getElementById('textInput').value.trim();
    let price = document.getElementById('priceInput').value.trim();

    const productTypeSelect = document.getElementById("productType");
    const filterProductTypeSelect = document.getElementById("filterProductType");

    let productType = productTypeSelect.value;
    
    // Handle "Add New Category"
    if (productTypeSelect.value === "add_new") {
        const newType = prompt("Enter a new category:");
        if (newType) {
            // Add to Product Type Dropdown
            const newOption = document.createElement("option");
            newOption.value = newType;
            newOption.textContent = newType;
            productTypeSelect.insertBefore(newOption, productTypeSelect.lastElementChild);
            productTypeSelect.value = newType; // Automatically select the new category
            productType = newType;

            // Add to Filter Dropdown
            const newFilterOption = document.createElement("option");
            newFilterOption.value = newType;
            newFilterOption.textContent = newType;
            filterProductTypeSelect.appendChild(newFilterOption);

            // Save the new category to Firestore safely
            try {
                const wishlistRef = doc(db, "wishlists", currentWishlistId);
                await updateDoc(wishlistRef, {
                    categories: arrayUnion(newType)
                });
                console.log(`Category '${newType}' successfully saved to Firestore!`);
            } catch (error) {
                console.error("Error saving category to Firestore:", error);
            }

        } else {
            alert("No category entered. Please select an existing category or add a new one.");
            return;
        }
    }
    

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

    // First add the item to our tracking array - IMPORTANT: Do this BEFORE creating the DOM elements
    const newItem = {
        link,
        text: text || link,
        price,
        description: '',
        purchased: false,
        productType,
        dateAdded: new Date().toISOString(),
        wishlistId: currentWishlistId,
        userId: currentUserId
    };
    
    // Add to listItems array
    listItems.push(newItem);
    
    // Save to Firestore
    saveItemToFirestore(newItem).then(docId => {
        if (docId) {
            // Store the document ID in the listItems array
            newItem.docId = docId;
            
            // Also update the DOM element with the doc ID
            const listItems = document.querySelectorAll('#linkList li');
            if (listItems.length > 0) {
                const lastItem = listItems[listItems.length - 1];
                lastItem.setAttribute('data-doc-id', docId);
            }
        }
    });
    
    const currentIndex = listItems.length - 1;

    // Create the UI element
    createItemElement(newItem, currentIndex);

    // Update total price
    updateTotal(price);

    // Clear input fields
    document.getElementById('linkInput').value = '';
    document.getElementById('textInput').value = '';
    document.getElementById('priceInput').value = '';
    document.getElementById('productType').value = '';
}

function togglePurchased(button) {
    const listItem = button.parentElement;
    
    // Get the link and price elements for this item
    const linkElement = listItem.querySelector('a');
    const priceElement = listItem.querySelector('.item-price');
    
    // Find the matching item in our array
    const index = listItems.findIndex(item => 
        item.text === linkElement.textContent && 
        item.price === priceElement.textContent
    );
    
    if (index === -1) {
        console.error("Could not find item in list items array");
        return;
    }
    
    // Toggle purchased status
    listItems[index].purchased = !listItems[index].purchased;
    
    // Get price for this item
    const priceText = priceElement.textContent;
    
    // Also update in Firestore if we have a document ID
    const docId = listItem.getAttribute('data-doc-id');
    if (docId) {
        updateItemInFirestore(docId, { purchased: listItems[index].purchased });
    }
    
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
        
        // Update in Firestore if we have a document ID
        const fundElement = document.querySelector(`[data-fund-index="${fundIndex}"]`);
        const docId = fundElement.getAttribute('data-doc-id');
        if (docId) {
            updateFundInFirestore(docId, { contributed: fundItems[fundIndex].contributed });
        }
        
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

//handles wishlist name changes
function updateWishlistName(name) {
    wishlistName = name;
    document.getElementById('wishlistNameHeading').textContent = name;
    // Also update the page title to include the wishlist name
    document.title = `${name} - Listify`;
    
    // Update in Firestore if this is a saved wishlist
    if (currentWishlistId) {
        updateWishlistNameInFirestore(name);
    }
}

// Move createFundElement function outside of the DOMContentLoaded event listener to make it available globally
function createFundElement(fund, index) {
    // Create a list item for the fund
    const listItem = document.createElement('li');
    listItem.className = 'fund-item';
    listItem.setAttribute('data-fund-index', index);
    
    // Add document ID attribute if available
    if (fund.docId) {
        listItem.setAttribute('data-doc-id', fund.docId);
    }
    
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
        
        // Also delete from Firestore if we have a document ID
        const docId = listItem.getAttribute('data-doc-id');
        if (docId) {
            deleteFundFromFirestore(docId);
        }
        
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
    return listItem;
}

// Event listeners for Enter key on input fields
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the wishlist
    initializeWishlist();
    document.getElementById("addLinkBtn").addEventListener("click", addLink);

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
            funds: fundItems,
            name: wishlistName
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

    // Toggle side menu when hamburger icon is clicked
    document.getElementById("menuToggle").addEventListener("click", function() {
        let menu = document.getElementById("sideMenu");
        if (menu.style.width === "250px") {
            menu.style.width = "0"; // Close the menu
        } else {
            menu.style.width = "250px"; // Open the menu
        }
    });
    //Login button functionality
    document.addEventListener('DOMContentLoaded', function () {
        const logoutBtn = document.getElementById('logoutButton');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                localStorage.removeItem('listify_current_user');
                window.location.href = 'Login/login.html'; // Adjust path if needed
            });
        }
    });

    //My Wishlists button funcationality
    document.addEventListener('DOMContentLoaded', function () {
        const wishlistsBtn = document.getElementById('wishlistsButton');
        if (wishlistsBtn) {
            wishlistsBtn.addEventListener('click', function () {
                window.location.href = 'wishlists.html';
            });
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
            contributed: 0, // Initialize contributions at 0
            dateAdded: new Date().toISOString(),
            wishlistId: currentWishlistId,
            userId: currentUserId
        };
        
        // Save to Firestore and update local array after receiving document ID
        saveFundToFirestore(newFund).then(docId => {
            if (docId) {
                // Store the document ID
                newFund.docId = docId;
            }
            
            // Add to fundItems array
            const fundIndex = fundItems.length;
            fundItems.push(newFund);
            
            // Create the fund element
            createFundElement(newFund, fundIndex);
            
            // Add the goal amount to the total
            updateTotal(`$${goal.toFixed(2)}`);
            
            // Update the element with the doc ID if we have one
            if (docId) {
                const fundElements = document.querySelectorAll('.fund-item');
                if (fundElements.length > 0) {
                    const lastFund = fundElements[fundElements.length - 1];
                    lastFund.setAttribute('data-doc-id', docId);
                }
            }
        });
        
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


    // connect toggle button after share button
    let togglePurchasedButton = document.getElementById("togglePurchasedButton")

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
  
    // Add Wishlist Name Edit Functionality
    const editNameBtn = document.getElementById('editNameBtn');
    const nameEditModal = document.getElementById('nameEditModal');
    const wishlistNameInput = document.getElementById('wishlistNameInput');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const cancelNameBtn = document.getElementById('cancelNameBtn');
    
    // Open modal when edit button is clicked
    editNameBtn.addEventListener('click', function() {
        wishlistNameInput.value = wishlistName;
        nameEditModal.style.display = 'block';
        wishlistNameInput.focus();
    });
    
    // Save button functionality
    saveNameBtn.addEventListener('click', function() {
        const newName = wishlistNameInput.value.trim();
        if (newName) {
            updateWishlistName(newName);
        }
        nameEditModal.style.display = 'none';
    });
    
    // Cancel button functionality
    cancelNameBtn.addEventListener('click', function() {
        nameEditModal.style.display = 'none';
    });
    
    // Allow Enter key in name input
    wishlistNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveNameBtn.click();
        }
    });
    
    // Close modal if clicked outside
    nameEditModal.addEventListener('click', function(e) {
        if (e.target === nameEditModal) {
            nameEditModal.style.display = 'none';
        }
    });

    document.getElementById("applyFilters").addEventListener("click", applyFilters);

});

function applyFilters() {
    const selectedPrice = document.getElementById("filterPriceRange").value;
    const selectedType = document.getElementById("filterProductType").value;

    const filtered = listItems.filter(item => {
        const priceRange = getPriceRange(item.price);
        const matchPrice = !selectedPrice || selectedPrice === "" || priceRange === selectedPrice;
        const matchType = !selectedType || selectedType === "" || item.productType === selectedType;
        return matchPrice && matchType;
    });

    renderFilteredItems(filtered);
}

function renderFilteredItems(filteredItems) {
    const listContainer = document.getElementById("linkList");
    listContainer.innerHTML = ''; // Clear list

    filteredItems.forEach((item, index) => {
        const listItem = document.createElement('li');

        const linkElement = document.createElement('a');
        linkElement.href = item.link;
        linkElement.target = "_blank";
        linkElement.textContent = item.text;

        const priceSpan = document.createElement('span');
        priceSpan.className = 'item-price';
        priceSpan.textContent = item.price;
        
        const purchaseButton = document.createElement('button');
        purchaseButton.className = 'purchase-btn';
        purchaseButton.innerHTML = '&#10004;';
        purchaseButton.onclick = function () {
            togglePurchased(this);
        };

        const editButton = document.createElement('button');
        editButton.className = 'edit-btn';
        editButton.innerHTML = '&#9998;';
        editButton.onclick = function () {
            createEditModal(listItem, index);
        };

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'X';
        deleteButton.onclick = function () {
            deleteItem(this);
        };

        listItem.appendChild(linkElement);
        listItem.appendChild(document.createTextNode(' - '));
        listItem.appendChild(priceSpan);
        listItem.appendChild(purchaseButton);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        listContainer.appendChild(listItem);
    });
}

// Save a fund item to Firestore
async function saveFundToFirestore(fund) {
    // Don't save to Firestore if we're viewing a shared list
    if (!currentWishlistId) return;
    
    try {
        // Add wishlistId to the fund
        fund.wishlistId = currentWishlistId;
        fund.userId = currentUserId;
        
        const docRef = await addDoc(collection(db, "wishlistFunds"), fund);
        console.log("Fund saved to Firestore:", fund);
        return docRef.id;
    } catch (error) {
        console.error("Error saving fund to Firestore:", error);
    }
}

// Update a fund in Firestore
async function updateFundInFirestore(docId, updates) {
    if (!docId) return;
    
    try {
        await updateDoc(doc(db, "wishlistFunds", docId), updates);
        console.log("Fund updated in Firestore:", updates);
    } catch (error) {
        console.error("Error updating fund in Firestore:", error);
    }
}

// Delete a fund from Firestore
async function deleteFundFromFirestore(docId) {
    if (!docId) return;
    
    try {
        await deleteDoc(doc(db, "wishlistFunds", docId));
        console.log("Fund deleted from Firestore:", docId);
    } catch (error) {
        console.error("Error deleting fund from Firestore:", error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const productTypeSelect = document.getElementById('productType');
    const filterProductTypeSelect = document.getElementById('filterProductType');

    // Add event listener for category selection
    productTypeSelect.addEventListener('change', async function() {
        if (this.value === "add_new") {
            const newCategory = prompt("Enter a new category name:");
            if (newCategory) {
                // First, check if the new category already exists
                const categoryExists = [...this.options].some(option => option.value.toLowerCase() === newCategory.toLowerCase());

                if (categoryExists) {
                    alert("Category already exists. Please choose a different name.");
                    this.value = ""; // Reset selection
                    return;
                }

                // Create new option for adding item
                const newOption = document.createElement("option");
                newOption.value = newCategory;
                newOption.textContent = newCategory;
                this.insertBefore(newOption, this.lastElementChild);
                this.value = newCategory;

                // Also create new option for filtering
                const newFilterOption = document.createElement("option");
                newFilterOption.value = newCategory;
                newFilterOption.textContent = newCategory;
                filterProductTypeSelect.appendChild(newFilterOption);

                // Save to Firestore
                try {
                    await saveNewCategory(currentUserId, newCategory);
                    console.log("Category saved successfully!");

                    // Also save category to the wishlist
                    await updateDoc(doc(db, "wishlists", currentWishlistId), {
                        categories: arrayUnion(newCategory)
                    });
                    console.log("Category added to wishlist document too!");
                } catch (error) {
                    console.error("Error saving category to Firestore:", error);
                }
            } else {
                this.value = ""; // Reset selection if user cancels
            }
        }
    });
});
