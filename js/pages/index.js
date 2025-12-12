// Index/Landing Page Handler
import { getProducts } from '../api.js';

export function initIndexPage() {
  const submitBtn = document.getElementById('submit-btn');
  const voteBtn = document.getElementById('vote-btn');
  const resultsBtn = document.getElementById('results-btn');
  
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      window.location.href = 'submit.html';
    });
  }
  
  if (voteBtn) {
    voteBtn.addEventListener('click', () => {
      window.location.href = 'vote.html';
    });
  }
  
  if (resultsBtn) {
    resultsBtn.addEventListener('click', () => {
      window.location.href = 'results.html';
    });
  }
  
  // Display some quick stats
  loadQuickStats();
  
  // Populate leaderboard carousel
  loadTopCarousel();
}

async function loadQuickStats() {
  try {
    const aliveProducts = await getProducts('alive');
    const killedProducts = await getProducts('killed');
    
    const statsContainer = document.getElementById('quick-stats');
    if (statsContainer) {
      statsContainer.innerHTML = `
        <p>Active Products: ${aliveProducts.length}</p>
        <p>Products Killed: ${killedProducts.length}</p>
      `;
    }
  } catch (error) {
    console.error('Error loading quick stats:', error);
  }
}

async function loadTopCarousel() {
  try {
    const aliveProducts = await getProducts('alive');
    const carousel = document.querySelector('.carousel-content');
    if (!carousel) return;

    // Sort by kill votes descending and take top 5
    const top = [...aliveProducts]
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, 5);

    // Clear existing placeholders
    carousel.innerHTML = '';

    if (!top.length) {
      carousel.innerHTML = '<p style="text-align:center; width:100%; color: var(--gray);">No products yet. Be the first to submit!</p>';
      return;
    }

    top.forEach((product) => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      item.innerHTML = `
        <img src="${product.logoUrl || 'img/square.png'}" alt="${product.productName || 'Product'}" class="carousel-logo" onerror="this.src='img/square.png'">
      `;
      carousel.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading carousel:', error);
  }
}