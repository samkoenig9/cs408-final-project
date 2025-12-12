// Admin Page Handler
import { getProducts, deleteProduct, killProduct } from '../api.js';

export function initAdminPage() {
  loadAllProducts();
}

async function loadAllProducts() {
  try {
    const aliveProducts = await getProducts('alive');
    const killedProducts = await getProducts('killed');
    const allProducts = [...aliveProducts, ...killedProducts];
    
    const voteItemsContainer = document.querySelector('.vote-items');
    const templateCard = voteItemsContainer?.querySelector('.vote-item');
    
    if (!templateCard || !voteItemsContainer) return;
    
    // Clear all but the first card
    const allCards = voteItemsContainer.querySelectorAll('.vote-item');
    for (let i = 1; i < allCards.length; i++) {
      allCards[i].remove();
    }
    
    // Populate the template card and clone for additional products
    allProducts.forEach((product, index) => {
      let card = templateCard;
      
      // Clone the template if we need more cards
      if (index > 0) {
        card = templateCard.cloneNode(true);
        voteItemsContainer.appendChild(card);
      }
      
      const statusBadge = product.status === 'killed' ? '☠️' : '🟢';
      
      card.innerHTML = `
        <a href="${escapeHtml(product.productUrl)}" target="_blank" class="logo-link">
          <img src="${escapeHtml(product.logoUrl)}" alt="${escapeHtml(product.productName)}" class="item-logo" onerror="this.src='../img/square.png'">
        </a>
        <h3>${statusBadge} ${escapeHtml(product.productName)}</h3>
        <span class="vote-count">Votes to Kill: ${product.voteCount || 0}</span><br>
        <span class="vote-count">Votes to Spare: ${product.spareVoteCount || 0}</span>
        <div class="vote-buttons">
          ${product.status === 'alive' ? `<button class="vote-button kill-btn" data-product-id="${product.productId}">☠️ Kill</button>` : ''}
          <button class="vote-button delete-btn" data-product-id="${product.productId}">🗑️ Delete</button>
        </div>
      `;
      
      // Attach event listeners
      const deleteBtn = card.querySelector('.delete-btn');
      const killBtn = card.querySelector('.kill-btn');
      
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const productId = deleteBtn.dataset.productId;
          if (confirm('Are you sure you want to delete this product?')) {
            try {
              await deleteProduct(productId);
              card.remove();
            } catch (error) {
              alert('Error deleting product: ' + error.message);
            }
          }
        });
      }
      
      if (killBtn) {
        killBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const productId = killBtn.dataset.productId;
          if (confirm('Are you sure you want to kill this product?')) {
            try {
              await killProduct(productId);
              card.remove();
            } catch (error) {
              alert('Error killing product: ' + error.message);
            }
          }
        });
      }
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}