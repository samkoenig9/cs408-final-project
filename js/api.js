// API url
const API_BASE_URL = 'https://sj0zdptlmc.execute-api.us-east-2.amazonaws.com';

// Sanitize user input to prevent XSS
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Helper to unwrap API Gateway proxy responses (body nested as string)
async function parseApiResponse(response) {
  const data = await response.json();
  if (data && typeof data.body === 'string') {
    try {
      return JSON.parse(data.body);
    } catch (_) {
      return data.body;
    }
  }
  return data;
}

// Submit a new product
async function submitProduct(productName, productUrl, logoUrl) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: sanitizeInput(productName),
        productUrl: sanitizeInput(productUrl),
        logoUrl: sanitizeInput(logoUrl)
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error('Error submitting product:', error);
    throw error;
  }
}

// Get products by status
async function getProducts(status = 'alive') {
  try {
    const response = await fetch(`${API_BASE_URL}/products?status=${encodeURIComponent(status)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Vote on a product
async function voteProduct(productId, voteType = 'kill') {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, voteType })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error('Error voting on product:', error);
    throw error;
  }
}

// Delete a product (admin only)
async function deleteProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// Kill a product (move to killed status)
async function killProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productId)}/kill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await parseApiResponse(response);
  } catch (error) {
    console.error('Error killing product:', error);
    throw error;
  }
}

// Export functions for use in other modules
export { submitProduct, getProducts, voteProduct, deleteProduct, killProduct, sanitizeInput };