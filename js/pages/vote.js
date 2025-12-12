// Vote Page Handler
import { getProducts, voteProduct } from '../api.js';

export function initVotePage() {
  loadVotingProducts();
  
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadVotingProducts);
  }
  
  // Set up filter functionality
  const filterInput = document.getElementById('filter');
  if (filterInput) {
    filterInput.addEventListener('input', filterProducts);
  }
}

async function loadVotingProducts() {
  try {
    const products = await getProducts('alive');
    const voteItemsContainer = document.querySelector('.vote-items');
    const templateCard = voteItemsContainer?.querySelector('.vote-item');
    
    if (!templateCard || !voteItemsContainer) return;
    
    // Sort by votes descending
    products.sort((a, b) => b.voteCount - a.voteCount);
    
    // Clear all but the first card
    const allCards = voteItemsContainer.querySelectorAll('.vote-item');
    for (let i = 1; i < allCards.length; i++) {
      allCards[i].remove();
    }
    
    // Populate the template card and clone for additional products
    products.forEach((product, index) => {
      let card = templateCard;
      
      // Clone the template if more cards are needed
      if (index > 0) {
        card = templateCard.cloneNode(true);
        voteItemsContainer.appendChild(card);
      }
      
      card.innerHTML = `
        <a href="${escapeHtml(product.productUrl)}" target="_blank" class="logo-link">
          <img src="${escapeHtml(product.logoUrl)}" alt="${escapeHtml(product.productName)}" class="item-logo" onerror="this.src='../img/square.png'">
        </a>
        <h3>${escapeHtml(product.productName)}</h3>
        <span class="vote-count">Kill Votes: ${product.voteCount}</span>
        <div class="vote-buttons">
          <button class="vote-button kill" data-product-id="${product.productId}">🔪 Kill</button>
          <button class="vote-button spare" data-product-id="${product.productId}">😇 Spare</button>
        </div>
      `;
      
      // Attach vote event listeners
      const killBtn = card.querySelector('.vote-button.kill');
      const spareBtn = card.querySelector('.vote-button.spare');
      const voteButtonsContainer = card.querySelector('.vote-buttons');
      
      if (killBtn) {
        killBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const productId = killBtn.dataset.productId;
          try {
            const result = await voteProduct(productId, 'kill');
            // Update the vote count in the DOM
            const newCount = result?.product?.voteCount ?? (parseInt(card.querySelector('.vote-count').textContent.replace(/\D/g, '')) + 1);
            card.querySelector('.vote-count').textContent = `Kill Votes: ${newCount}`;
            // Replace both buttons with a single big red 'voted' button
            voteButtonsContainer.innerHTML = '<button class="vote-button voted voted-kill" disabled>🔪 Voted to Kill!</button>';
            setTimeout(loadVotingProducts, 1800000);
          } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to register vote');
          }
        });
      }
      
      if (spareBtn) {
        spareBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const productId = spareBtn.dataset.productId;
          try {
            await voteProduct(productId, 'spare');
            // Replace both buttons with a single big green 'voted' button
            voteButtonsContainer.innerHTML = '<button class="vote-button voted voted-spare" disabled>😇 Voted to Spare!</button>';
            setTimeout(loadVotingProducts, 1800000);
          } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to register vote');
          }
        });
      }
    });

    // Append a final card with a plus button linking to submit page
    const plusCard = templateCard.cloneNode(true);
    plusCard.innerHTML = `
      <div class="add-card" onclick="window.location.href='submit.html'" role="button" aria-label="Submit a product">
        <span class="add-plus">+</span>
      </div>
    `;
    voteItemsContainer.appendChild(plusCard);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function filterProducts(e) {
  const filterValue = e.target.value.toLowerCase();
  const voteItems = document.querySelectorAll('.vote-item');
  
  voteItems.forEach(item => {
    const productName = item.querySelector('h3')?.textContent.toLowerCase() || '';
    
    if (productName.includes(filterValue)) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}