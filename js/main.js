// Main entry point - routes to appropriate page handler
import { initIndexPage } from './pages/index.js';
import { initSubmitPage } from './pages/submit.js';
import { initVotePage } from './pages/vote.js';
import { initResultsPage } from './pages/results.js';
import { initAdminPage } from './pages/admin.js';

document.addEventListener('DOMContentLoaded', () => {
  const currentPage = getCurrentPage();
  
  switch (currentPage) {
    case 'index':
      initIndexPage();
      break;
    case 'submit':
      initSubmitPage();
      break;
    case 'vote':
      initVotePage();
      break;
    case 'results':
      initResultsPage();
      break;
    case 'admin':
      initAdminPage();
      break;
    default:
      console.warn('Unknown page:', currentPage);
  }
});

// Determine which page we're on based on filename
function getCurrentPage() {
  const pathname = window.location.pathname;
  
  if (pathname.includes('submit')) return 'submit';
  if (pathname.includes('vote')) return 'vote';
  if (pathname.includes('results')) return 'results';
  if (pathname.includes('admin')) return 'admin';
  return 'index';
}