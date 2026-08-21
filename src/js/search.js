import { searchPosts } from './renderer.js';
import { debounce } from './utils.js';
import { showPage } from './navigation.js';

export function initSearch() {
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const overlay = modal?.querySelector('.search-modal__overlay');

  if (!modal || !input || !results) return;

  const debouncedSearch = debounce((query) => {
    if (!query.trim()) {
      results.innerHTML = '<p class="search-modal__hint">输入关键词搜索文章</p>';
      return;
    }
    const found = searchPosts(query);
    if (found.length === 0) {
      results.innerHTML = '<p class="search-modal__hint">未找到相关文章</p>';
      return;
    }
    results.innerHTML = found.map(post =>
      '<div class="search-result" onclick="window.showPost(' + post.index + '); window.closeSearch && window.closeSearch();">' +
      '<div class="search-result__title">' + post.title + '</div>' +
      '<div class="search-result__excerpt">' + post.excerpt + '</div>' +
      '<div class="search-result__date">' + (post.date || '') + '</div>' +
      '</div>'
    ).join('');
  }, 200);

  input.addEventListener('input', (e) => debouncedSearch(e.target.value));

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearchModal(modal, input);
    }
    if (e.key === 'Escape') {
      closeSearchModal(modal);
    }
  });

  overlay?.addEventListener('click', () => closeSearchModal(modal));

  window.closeSearch = () => closeSearchModal(modal);
}

function openSearchModal(modal, input) {
  modal.classList.add('active');
  document.body.classList.add('modal-open');
  setTimeout(() => input.focus(), 100);
}

function closeSearchModal(modal) {
  modal.classList.remove('active');
  document.body.classList.remove('modal-open');
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  const results = document.getElementById('searchResults');
  if (results) results.innerHTML = '<p class="search-modal__hint">输入关键词搜索文章</p>';
}
