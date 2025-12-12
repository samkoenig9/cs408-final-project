// Results Page Handler
import { getProducts } from '../api.js';

export function initResultsPage() {
  loadKilledProducts();
  
  // Add refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadKilledProducts);
  }
}

async function loadKilledProducts() {
  try {
    const products = await getProducts('killed');
    const resultsItemsContainer = document.querySelector('.results-items');
    const templateCard = resultsItemsContainer?.querySelector('.results-item');
    
    if (!templateCard || !resultsItemsContainer) return;
    
    // Sort by votes descending
    products.sort((a, b) => b.voteCount - a.voteCount);
    
    // Clear all but the first card
    const allCards = resultsItemsContainer.querySelectorAll('.results-item');
    for (let i = 1; i < allCards.length; i++) {
      allCards[i].remove();
    }
    
    // Populate the template card and clone for additional products
    products.forEach((product, index) => {
      let card = templateCard;
      
      // Clone the template if we need more cards
      if (index > 0) {
        card = templateCard.cloneNode(true);
        resultsItemsContainer.appendChild(card);
      }
      
      card.innerHTML = `
        <h3>R.I.P.</h3>
        <img src="${escapeHtml(product.logoUrl)}" alt="${escapeHtml(product.productName)}" class="item-logo" onerror="this.src='../img/square.png'">
        <h3>${escapeHtml(product.productName)}</h3>
        <p>${new Date().getFullYear()}</p>
        <small class="vote-count">Votes: ${product.voteCount}</small>
      `;
    });
  } catch (error) {
    console.error('Error loading results:', error);
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}