// Submit Page Handler
import { submitProduct, getProducts, sanitizeInput } from '../api.js';

export function initSubmitPage() {
  const form = document.querySelector('.submit-form');
  const preview = document.querySelector('.card-preview');
  
  if (form) {
    // Update preview as user types
    const productNameInput = document.getElementById('product-name');
    if (productNameInput) {
      productNameInput.addEventListener('input', (e) => {
        const previewTitle = preview?.querySelector('h3');
        if (previewTitle) {
          previewTitle.textContent = e.target.value || 'Product';
        }
      });
    }
    
    // Update preview logo as user types
    const logoUrlInput = document.getElementById('product-image');
    if (logoUrlInput) {
      logoUrlInput.addEventListener('input', (e) => {
        const previewImg = preview?.querySelector('img');
        if (previewImg && e.target.value.trim()) {
          const tempImg = new Image();
          tempImg.onload = () => {
            previewImg.src = e.target.value.trim();
          };
          tempImg.onerror = () => {
            previewImg.src = '../img/square.png';
          };
          tempImg.src = e.target.value.trim();
        } else {
          previewImg.src = '../img/square.png';
        }
      });
    }
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const productName = document.getElementById('product-name').value.trim();
      const productUrl = document.getElementById('product-url').value.trim();
      const logoUrl = document.getElementById('product-image').value.trim();
      
      // Validation
      if (!productName || !productUrl || !logoUrl) {
        alert('Please fill in all fields');
        return;
      }
      
      if (productName.length > 100) {
        alert('Product name must be 100 characters or less');
        return;
      }
      
      if (productUrl.length > 500) {
        alert('Product URL must be 500 characters or less');
        return;
      }
      
      if (logoUrl.length > 500) {
        alert('Logo URL must be 500 characters or less');
        return;
      }
      
      try {
        // Check if product with same name already exists
        const aliveProducts = await getProducts('alive');
        const killedProducts = await getProducts('killed');
        const allProducts = [...aliveProducts, ...killedProducts];
        
        const isDuplicate = allProducts.some(p => p.productName.toLowerCase() === productName.toLowerCase());
        if (isDuplicate) {
          alert('A product with this name already exists. Please choose a different name.');
          return;
        }
        
        const result = await submitProduct(productName, productUrl, logoUrl);
        console.log('Submit response:', result);
        
        if (result.productId || result.message) {
          alert('Product submitted successfully!');
          form.reset();
          
          // Reset preview
          const previewTitle = preview?.querySelector('h3');
          if (previewTitle) {
            previewTitle.textContent = 'Product';
          }
          const previewImg = preview?.querySelector('img');
          if (previewImg) {
            previewImg.src = '../img/square.png';
          }
          
          // Redirect after 1 second
          setTimeout(() => {
            window.location.href = 'vote.html';
          }, 1000);
        } else {
          alert('Failed to submit product. Check console for details.');
          console.error('Submit failed, response:', result);
        }
      } catch (error) {
        console.error('Submit error:', error);
        alert('Error submitting product: ' + error.message);
      }
    });
  }
}