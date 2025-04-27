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
    toggleBtn.textContent = 'Show Items';
    buttonGroup.appendChild(toggleBtn);

    if (!isSharedView) {
      const shareBtn = document.createElement('button');
      shareBtn.textContent = 'Share List';
      buttonGroup.appendChild(shareBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete List';
      deleteBtn.style.backgroundColor = '#dc3545';
      deleteBtn.style.color = 'white';
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

  itemsSnapshot.forEach(doc => items.push(doc.data()));
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

    const itemsHeader = document.createElement('h3');
    itemsHeader.textContent = 'Items';
    itemsSection.appendChild(itemsHeader);

    const itemsList = document.createElement('div');
    itemsList.className = 'items-list';

    items.forEach(item => {
      const itemElement = document.createElement('div');
      itemElement.className = item.purchased ? 'item purchased-item' : 'item';
      itemElement.innerHTML = `
        <div class="item-content">
          <a href="${item.link}" target="_blank">${item.text || item.link}</a>
        </div>
        <div class="item-price">${item.price}</div>
      `;
      itemsList.appendChild(itemElement);
    });

    itemsSection.appendChild(itemsList);
    body.appendChild(itemsSection);
  }

  if (funds.length > 0) {
    const fundsSection = document.createElement('div');
    fundsSection.style.flex = '1 1 45%';

    const fundsHeader = document.createElement('h3');
    fundsHeader.textContent = 'Funds';
    fundsSection.appendChild(fundsHeader);

    funds.forEach(fund => {
      const fundBox = document.createElement('div');
      fundBox.className = 'fund-box';
      fundBox.innerHTML = `
        <strong>Fund: ${fund.name}</strong><br>
        Goal: $${fund.goal.toFixed(2)} | Contributed: $${fund.contributed.toFixed(2)} | Remaining: $${(fund.goal - fund.contributed).toFixed(2)}
        <div class="fund-progress-bar" style="background-color: #eee; height: 10px; border-radius: 5px; margin-top: 5px;">
          <div style="background-color: #d63384; height: 100%; width: ${(fund.contributed / fund.goal) * 100}%; border-radius: 5px;"></div>
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
      const fundDocRef = doc(db, "wishlistFunds", fund.docId);
      await updateDoc(fundDocRef, {
        contributed: fund.contributed + amount
      });

      alert('Thank you for your contribution!');
      await loadItemsAndFunds(fund.wishlistId, body);
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
