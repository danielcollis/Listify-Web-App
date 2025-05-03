// --- Firebase Imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// --- Firebase Configuration ---
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
const db = getFirestore(app);
const auth = getAuth(app);

let isSharedView = false;

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', () => {
  processUrlParameters();
  setupMenuToggle();
  setupLogoutButton();

  if (!isSharedView) {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAndDisplayWishlists(user.uid);
      } else {
        window.location.href = '../Login/login.html';
      }
    });
  }
});

function setupMenuToggle() {
  const menuToggle = document.getElementById("menuToggle");
  const sideMenu = document.getElementById("sideMenu");
  if (menuToggle && sideMenu) {
    menuToggle.addEventListener("click", () => {
      sideMenu.style.width = sideMenu.style.width === "250px" ? "0" : "250px";
    });
  }
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('listify_current_user');
      window.location.href = '../Login/login.html';
    });
  }
}

async function fetchAndDisplayWishlists(userId) {
  const spinner = document.getElementById('loadingSpinner');
  spinner.style.display = 'flex';

  const q = query(collection(db, "wishlists"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  const wishlists = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    data.id = doc.id;
    wishlists.push(data);
  });

  displayWishlists(wishlists);
  spinner.style.display = 'none';
}

async function calculateWishlistTotal(wishlistId) {
  let total = 0;

  // Get all wishlist items
  const itemsQuery = query(collection(db, "wishlistItems"), where("wishlistId", "==", wishlistId));
  const itemsSnapshot = await getDocs(itemsQuery);
  itemsSnapshot.forEach(docSnap => {
      const item = docSnap.data();
      if (!item.purchased) { // Only count if not purchased
          const price = parseFloat(item.price?.replace(/[^0-9.]/g, ''));
          if (!isNaN(price)) {
              total += price;
          }
      }
  });


  // Get all wishlist funds
  const fundsQuery = query(collection(db, "wishlistFunds"), where("wishlistId", "==", wishlistId));
  const fundsSnapshot = await getDocs(fundsQuery);
  fundsSnapshot.forEach(docSnap => {
      const fund = docSnap.data();
      const remaining = fund.goal - fund.contributed;
      if (!isNaN(remaining)) {
          total += remaining;
      }
  });

  return total.toFixed(2); // Return nicely formatted
}



function displayWishlists(wishlists) {
  const container = document.getElementById('wishlistsContainer');
  container.innerHTML = '';

  wishlists.forEach(list => {
    const card = document.createElement('div');
    card.className = 'wishlist-card';

    const header = document.createElement('div');
    header.className = 'wishlist-header';

    const title = document.createElement('h2');
    title.className = 'wishlist-title';
    title.textContent = list.name || 'Untitled Wishlist';

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'wishlist-buttons';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-items-btn';  // ✅ Add thi
    toggleBtn.textContent = 'Show Items';
    buttonGroup.appendChild(toggleBtn);

    if (!isSharedView) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'share-btn'; 
      shareBtn.textContent = 'Share List';
      buttonGroup.appendChild(shareBtn);

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit List';
      editBtn.className = 'edit-btn';
      editBtn.addEventListener('click', () => {
        window.location.href = `../list.html?edit=${list.id}`;
      });
      buttonGroup.appendChild(editBtn);


      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn'; 
      deleteBtn.textContent = 'Delete List';
      buttonGroup.appendChild(deleteBtn);

      shareBtn.addEventListener('click', () => openSharePopup(list));
      deleteBtn.addEventListener('click', async () => {
        const confirmDelete = confirm("Are you sure you want to delete this wishlist? This cannot be undone.");
        if (confirmDelete) {
          await deleteWishlist(list.id);
          const user = auth.currentUser;
          if (user) {
            await fetchAndDisplayWishlists(user.uid);
          }
        }
      });
    }

    header.appendChild(title);
    header.appendChild(buttonGroup);
    card.appendChild(header);



    const body = document.createElement('div');
    body.className = 'wishlist-body';
    body.style.display = 'none';


    toggleBtn.addEventListener('click', async () => {
      const isVisible = body.style.display === 'block';
      body.style.display = isVisible ? 'none' : 'block';
      toggleBtn.textContent = isVisible ? 'Show Items' : 'Hide Items';
    
      if (!isVisible) {
        if (list.items || list.funds) {
          renderItemsAndFunds(list, body);
        } else if (list.id) {
          await loadItemsAndFunds(list.id, body);
        } 
      }
    });
    
    card.appendChild(body);

    // --- Total display section ---
    const totalDisplay = document.createElement('p');
    totalDisplay.className = 'wishlist-total';
    totalDisplay.setAttribute('data-id', list.id);
    totalDisplay.textContent = 'Loading total...'; // Placeholder while calculating
    card.appendChild(totalDisplay);

    if (list.id) {
      // Saved list: calculate from Firestore
      calculateWishlistTotal(list.id)
        .then(total => {
          totalDisplay.textContent = `Total: $${total}`;
        })
        .catch(error => {
          console.error("Error fetching total for list:", list.id, error);
          totalDisplay.textContent = 'Total: Error';
        });
      } else {
        // Shared list: calculate total locally
        let total = 0;
      
        (list.items || []).forEach(item => {
          if (!item.purchased) {
            const price = parseFloat(item.price?.replace(/[^0-9.]/g, ''));
            if (!isNaN(price)) total += price;
          }
        });
      
        (list.funds || []).forEach(fund => {
          const remaining = fund.goal - fund.contributed;
          if (!isNaN(remaining)) total += remaining;
        });
      
        totalDisplay.setAttribute('data-id', 'shared');
        totalDisplay.textContent = `Total: $${total.toFixed(2)}`;
      }
      



    container.appendChild(card);
  });
}

async function loadItemsAndFunds(wishlistId, body) {
  body.innerHTML = '';

  const itemsQuery = query(collection(db, "wishlistItems"), where("wishlistId", "==", wishlistId));
  const itemsSnapshot = await getDocs(itemsQuery);

  const fundsQuery = query(collection(db, "wishlistFunds"), where("wishlistId", "==", wishlistId));
  const fundsSnapshot = await getDocs(fundsQuery);

  const items = [];
  const funds = [];

  itemsSnapshot.forEach(doc => {
    const data = doc.data();
    data.docId = doc.id;
    data.wishlistId = wishlistId; 
    items.push(data);
  });

  fundsSnapshot.forEach(docSnap => {
    const fund = docSnap.data();
    fund.docId = docSnap.id;
    funds.push(fund);
  });

  renderItemsAndFunds({ items, funds }, body);
}


function renderItemsAndFunds(list, body) {
  body.innerHTML = '';

  const items = list.items || [];
  const funds = list.funds || [];

  if (items.length > 0) {
    const itemsSection = document.createElement('div');
    itemsSection.style.flex = '1 1 45%';

    const itemsHeaderRow = document.createElement('div');
    itemsHeaderRow.style.display = 'flex';
    itemsHeaderRow.style.justifyContent = 'space-between';
    itemsHeaderRow.style.alignItems = 'center';

    const itemsHeader = document.createElement('h3');
    itemsHeader.textContent = 'Items';

    const hideBtn = document.createElement('button');
    hideBtn.className = 'hide-items-btn';
    hideBtn.textContent = 'Hide Purchased Items';
    hideBtn.className = 'hide-purchased-btn';

    let purchasedHidden = false;
    hideBtn.addEventListener('click', () => {
      purchasedHidden = !purchasedHidden;
      hideBtn.textContent = purchasedHidden ? 'Show Purchased Items' : 'Hide Purchased Items';
      const purchased = body.querySelectorAll('.purchased-item');
      purchased.forEach(item => {
        item.style.display = purchasedHidden ? 'none' : '';
      });
    });

    itemsHeaderRow.appendChild(itemsHeader);
    itemsHeaderRow.appendChild(hideBtn);
    itemsSection.appendChild(itemsHeaderRow);



    const itemsList = document.createElement('div');
    itemsList.className = 'items-list';

    items.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = item.purchased ? 'item purchased-item' : 'item';
    
      const contentDiv = document.createElement('div');
      contentDiv.className = 'item-content';
    
      const link = document.createElement('a');
      link.href = item.link;
      link.target = '_blank';
      link.textContent = item.text || item.link;
      contentDiv.appendChild(link);
    
      const rightContainer = document.createElement('div');
      rightContainer.className = 'item-right';

      const priceDiv = document.createElement('div');
      priceDiv.className = 'item-price';
      priceDiv.textContent = item.price;

      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'purchase-btn';
      toggleBtn.innerHTML = '&#10004;';
      toggleBtn.title = item.purchased ? 'Unmark as Purchased' : 'Mark as Purchased';
      
      itemElement.appendChild(contentDiv); // left
      itemElement.appendChild(rightContainer); // right
      



      toggleBtn.title = item.purchased ? 'Unmark as Purchased' : 'Mark as Purchased';

      toggleBtn.addEventListener('click', () => {

        item.purchased = !item.purchased;
        itemElement.classList.toggle('purchased-item');
        toggleBtn.title = item.purchased ? 'Unmark as Purchased' : 'Mark as Purchased';

        if (isSharedView) {
          // Shared view: recalculate locally
          const totalElement = document.querySelector('.wishlist-total[data-id="shared"]');
          if (totalElement) {
            let updatedTotal = 0;
            (list.items || []).forEach(i => {
              if (!i.purchased) {
                const price = parseFloat(i.price?.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) updatedTotal += price;
              }
            });
            (list.funds || []).forEach(fund => {
              const remaining = fund.goal - fund.contributed;
              if (!isNaN(remaining)) updatedTotal += remaining;
            });
            totalElement.textContent = `Total: $${updatedTotal.toFixed(2)}`;
            totalElement.classList.add('highlight-total');
            setTimeout(() => totalElement.classList.remove('highlight-total'), 500);
          }
        } else {
          // Authenticated user: update Firestore and recalculate total
          togglePurchasedStatus(item.docId, !item.purchased, item.wishlistId);
        }

      
        if (isSharedView) {
          // Shared list: calculate locally
          const totalElement = document.querySelector('.wishlist-total[data-id="shared"]');
          if (totalElement) {
            let updatedTotal = 0;
            (list.items || []).forEach(i => {
              if (!i.purchased) {
                const price = parseFloat(i.price?.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) updatedTotal += price;
              }
            });
            (list.funds || []).forEach(fund => {
              const remaining = fund.goal - fund.contributed;
              if (!isNaN(remaining)) updatedTotal += remaining;
            });
            totalElement.textContent = `Total: $${updatedTotal.toFixed(2)}`;
            totalElement.classList.add('highlight-total');
            setTimeout(() => totalElement.classList.remove('highlight-total'), 500);
          }
        } else {
          // Authenticated user: fetch total from Firestore
          calculateWishlistTotal(item.wishlistId).then(total => {
            updateTotalDisplay(item.wishlistId, parseFloat(total));
          });
        }
      });
      

    
      itemElement.appendChild(contentDiv);
      itemElement.appendChild(priceDiv);
      itemElement.appendChild(toggleBtn);
      itemsList.appendChild(itemElement);
    });
    

    itemsSection.appendChild(itemsList);
    body.appendChild(itemsSection);
  }

  if (funds.length > 0) {
    const fundsSection = document.createElement('div');
    fundsSection.style.flex = '1 1 45%';
  
    const fundsHeaderRow = document.createElement('div');
    fundsHeaderRow.style.display = 'flex';
    fundsHeaderRow.style.justifyContent = 'space-between';
    fundsHeaderRow.style.alignItems = 'center';
  
    const fundsHeader = document.createElement('h3');
    fundsHeader.textContent = 'Funds';
  
    const hideCompletedBtn = document.createElement('button');
    hideCompletedBtn.textContent = 'Hide Completed Funds';
    hideCompletedBtn.className = 'hide-purchased-btn';
  
    let completedHidden = false;
    hideCompletedBtn.addEventListener('click', () => {
      completedHidden = !completedHidden;
      hideCompletedBtn.textContent = completedHidden ? 'Show Completed Funds' : 'Hide Completed Funds';
  
      const completed = fundsSection.querySelectorAll('.completed-fund');
      completed.forEach(fund => {
        fund.style.display = completedHidden ? 'none' : '';
      });
    });
  
    fundsHeaderRow.appendChild(fundsHeader);
    fundsHeaderRow.appendChild(hideCompletedBtn);
    fundsSection.appendChild(fundsHeaderRow);


    funds.forEach(fund => {
      const fundBox = document.createElement('div');
      fundBox.className = 'fund-box';
      fundBox.setAttribute('data-id', fund.docId);

      if (fund.contributed >= fund.goal) {
        fundBox.classList.add('completed-fund');
      }
  
      fundBox.innerHTML = `
      <strong class="fund-name">Fund: ${fund.name}</strong>
      <p class="fund-goal">Goal: $${fund.goal.toFixed(2)}</p>
      <p class="fund-contributed">Already Contributed: $${fund.contributed.toFixed(2)}</p>
      <p class="fund-remaining">Remaining: $${(fund.goal - fund.contributed).toFixed(2)}</p>
      <div class="fund-progress-bar" style="background-color: #eee; height: 10px; border-radius: 5px; margin-top: 5px;">
        <div style="background-color: #d63384; height: 100%; width: ${(fund.contributed / fund.goal) * 100}%; border-radius: 5px; transition: width 0.4s ease;"></div>
      </div>
    `;
    
  
      if (fund.contributed < fund.goal) {
        const contributeButton = document.createElement('button');
        contributeButton.className = 'contribute-btn';
        contributeButton.textContent = 'Contribute';
        contributeButton.addEventListener('click', () => openContributeModal(fund, body));
        fundBox.appendChild(contributeButton);
      }
  
      fundsSection.appendChild(fundBox);
    });
  
    body.appendChild(fundsSection);
  }
  }

  function updateTotalDisplay(listId, total) {
    const totalElement = document.querySelector(`.wishlist-total[data-id="${listId || 'shared'}"]`);
    if (totalElement) {
      totalElement.textContent = `Total: $${total.toFixed(2)}`;
      totalElement.classList.add('highlight-total');
      setTimeout(() => {
        totalElement.classList.remove('highlight-total');
      }, 500);
    }
  }
  


async function openSharePopup(list) {
  try {
    const itemsQuery = query(collection(db, "wishlistItems"), where("wishlistId", "==", list.id));
    const itemsSnapshot = await getDocs(itemsQuery);
    const items = [];
    itemsSnapshot.forEach(doc => items.push(doc.data()));

    const fundsQuery = query(collection(db, "wishlistFunds"), where("wishlistId", "==", list.id));
    const fundsSnapshot = await getDocs(fundsQuery);
    const funds = [];
    fundsSnapshot.forEach(docSnap => {
      const fund = docSnap.data();
      fund.docId = docSnap.id;
      funds.push(fund);
    });

    const sharedPayload = { name: list.name, items, funds };
    const encodedData = btoa(encodeURIComponent(JSON.stringify(sharedPayload)));
    const shareableLink = `${window.location.origin}${window.location.pathname}?list=${encodedData}`;

    const dummyInput = document.createElement('input');
    dummyInput.value = shareableLink;
    document.body.appendChild(dummyInput);
    dummyInput.select();
    document.execCommand('copy');
    document.body.removeChild(dummyInput);

    alert("Share link copied to clipboard!");
  } catch (error) {
    console.error('Error creating share link:', error);
    alert('Failed to create share link. Please try again.');
  }
}

function openContributeModal(fund, body) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal-content';
  modal.innerHTML = `
    <h2>Contribute to ${fund.name}</h2>
    <p>Goal: $${fund.goal.toFixed(2)}</p>
    <p>Already Contributed: $${fund.contributed.toFixed(2)}</p>
    <p>Remaining: $${(fund.goal - fund.contributed).toFixed(2)}</p>
    <input type="number" id="contributionAmount" placeholder="Enter amount" step="0.01" min="0.01">
    <div class="modal-buttons">
      <button id="confirmContributeBtn">Contribute</button>
      <button id="cancelContributeBtn">Cancel</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  document.getElementById('confirmContributeBtn').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('contributionAmount').value);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (amount > (fund.goal - fund.contributed)) {
      alert('Cannot contribute more than the remaining amount.');
      return;
    }

    try {
      if (!isSharedView) {
        // Authenticated view: Update Firestore
        const fundDocRef = doc(db, "wishlistFunds", fund.docId);
        await updateDoc(fundDocRef, {
          contributed: fund.contributed + amount
        });
      }

      // Update the specific fund object in memory
      fund.contributed += amount;

      // Update the progress bar smoothly
      const fundBox = body.querySelector(`.fund-box[data-id="${fund.docId}"]`);
      if (fundBox) {
        const progressFill = fundBox.querySelector('.fund-progress-bar > div');
        if (progressFill) {
          const percent = (fund.contributed / fund.goal) * 100;
          progressFill.style.width = `${percent}%`;
        }

        // Update the text content
        fundBox.querySelector('.fund-name').innerHTML = `Fund: ${fund.name}`;
        fundBox.querySelector('.fund-goal').textContent = `Goal: $${fund.goal.toFixed(2)}`;
        fundBox.querySelector('.fund-contributed').textContent = `Already Contributed: $${fund.contributed.toFixed(2)}`;
        fundBox.querySelector('.fund-remaining').textContent = `Remaining: $${(fund.goal - fund.contributed).toFixed(2)}`;

        // If fund is now complete, add completed class
        if (fund.contributed >= fund.goal) {
          fundBox.classList.add('completed-fund');
          const contributeBtn = fundBox.querySelector('.contribute-btn');
          if (contributeBtn) {
            contributeBtn.remove();
          }
        }
      }

      // Update total display
      if (isSharedView) {
        // For shared view, calculate total locally
        let updatedTotal = 0;
        const list = JSON.parse(decodeURIComponent(atob(new URLSearchParams(window.location.search).get('list'))));
        (list.items || []).forEach(item => {
          if (!item.purchased) {
            const price = parseFloat(item.price?.replace(/[^0-9.]/g, ''));
            if (!isNaN(price)) updatedTotal += price;
          }
        });
        (list.funds || []).forEach(f => {
          const remaining = f.goal - (f.docId === fund.docId ? fund.contributed : f.contributed);
          if (!isNaN(remaining)) updatedTotal += remaining;
        });
        updateTotalDisplay('shared', updatedTotal);
      } else {
        // For authenticated view, fetch from Firestore
        const updatedTotal = await calculateWishlistTotal(fund.wishlistId);
        updateTotalDisplay(fund.wishlistId, parseFloat(updatedTotal));
      }

      alert('Thank you for your contribution!');
      overlay.remove();
    } catch (error) {
      console.error('Error contributing:', error);
      alert('Failed to contribute. Please try again.');
    }
  });

  document.getElementById('cancelContributeBtn').addEventListener('click', () => {
    overlay.remove();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

async function deleteWishlist(wishlistId) {
  await deleteDoc(doc(db, "wishlists", wishlistId));
}

function processUrlParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedList = urlParams.get('list');

  if (encodedList) {
    try {
      const decodedData = decodeURIComponent(atob(encodedList));
      const loadedData = JSON.parse(decodedData);
      isSharedView = true;
      displayWishlists([loadedData]);
      document.getElementById('loadingSpinner').style.display = 'none';
    } catch (error) {
      console.error('Error loading shared list:', error);
    }
  }
}

async function togglePurchasedStatus(docId, currentStatus, wishlistId) {
  try {
    await updateDoc(doc(db, "wishlistItems", docId), {
      purchased: !currentStatus
    });
    console.log("Updated purchased status for:", docId);

    // 🔄 Recalculate and update total
    const updatedTotal = await calculateWishlistTotal(wishlistId);
    updateTotalDisplay(wishlistId, parseFloat(updatedTotal));

  } catch (error) {
    console.error("Error updating purchased status:", error);
  }
}



