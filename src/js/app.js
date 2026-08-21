import { initTheme, toggleTheme } from './theme.js';
import { initNavigation, showPage } from './navigation.js';
import { initRenderer, renderArchives, renderCategories } from './renderer.js';
import { initSearch } from './search.js';

async function init() {
  initTheme();
  initNavigation();
  initSearch();

  const themeBtn = document.getElementById('themeBtn');
  themeBtn?.addEventListener('click', toggleTheme);

  await initRenderer();

  window.showPage = function(page) {
    showPage(page);
    if (page === 'archives') renderArchives();
    if (page === 'categories') renderCategories();
  };

  const hash = window.location.hash.slice(1);
  if (hash && ['home', 'archives', 'categories', 'about'].includes(hash)) {
    showPage(hash);
    if (hash === 'archives') renderArchives();
    if (hash === 'categories') renderCategories();
  }

  window.addEventListener('hashchange', () => {
    const h = window.location.hash.slice(1) || 'home';
    showPage(h);
    if (h === 'archives') renderArchives();
    if (h === 'categories') renderCategories();
  });
}

document.addEventListener('DOMContentLoaded', init);
