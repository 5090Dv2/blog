// ========== Navigation Module ==========
import { toggleTheme } from './theme.js';

let currentPage = 'home';
let lastScrollY = 0;
let navbarHidden = false;

/**
 * Initialize navigation
 */
export function initNavigation() {
  setupNavbar();
  setupMobileMenu();
  setupSmoothScroll();
  setupScrollEffects();
}

/**
 * Setup navbar
 */
function setupNavbar() {
  const navbar = document.getElementById('navbar');
  const searchBtn = document.getElementById('searchBtn');
  
  // Search button (theme handled in app.js)
  searchBtn?.addEventListener('click', () => {
    openSearch();
  });
}

/**
 * Setup mobile menu
 */
function setupMobileMenu() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu?.querySelectorAll('.mobile-menu__link');
  
  menuBtn?.addEventListener('click', () => {
    mobileMenu?.classList.toggle('active');
    menuBtn.classList.toggle('active');
    document.body.classList.toggle('modal-open');
  });
  
  mobileLinks?.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.remove('active');
      menuBtn?.classList.remove('active');
      document.body.classList.remove('modal-open');
      
      const page = link.dataset.page;
      if (page) {
        showPage(page);
      }
    });
  });
}

/**
 * Setup smooth scroll
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Setup scroll effects
 */
function setupScrollEffects() {
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const readingProgress = document.getElementById('readingProgress');
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Navbar hide/show
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      if (!navbarHidden) {
        navbar?.classList.add('navbar--hidden');
        navbarHidden = true;
      }
    } else {
      if (navbarHidden) {
        navbar?.classList.remove('navbar--hidden');
        navbarHidden = false;
      }
    }
    
    // Back to top button
    if (currentScrollY > 300) {
      backToTop?.classList.add('visible');
    } else {
      backToTop?.classList.remove('visible');
    }
    
    // Reading progress
    if (currentPage === 'post') {
      updateReadingProgress(readingProgress);
    }
    
    lastScrollY = currentScrollY;
  });
  
  // Back to top click
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Update reading progress
 */
function updateReadingProgress(element) {
  if (!element) return;
  
  const postContent = document.getElementById('postContent');
  if (!postContent) return;
  
  const contentHeight = postContent.offsetHeight;
  const scrolled = window.scrollY - postContent.offsetTop + window.innerHeight;
  const progress = Math.min((scrolled / contentHeight) * 100, 100);
  
  element.style.width = `${progress}%`;
}

/**
 * Show page
 */
export function showPage(page) {
  currentPage = page;
  
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
  });
  
  // Show target page
  const targetPage = document.getElementById(`page-${page}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Update nav links
  document.querySelectorAll('.site-nav__link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Update URL hash
  if (page !== 'home') {
    history.pushState(null, '', `#${page}`);
  } else {
    history.pushState(null, '', window.location.pathname);
  }
}

/**
 * Get current page
 */
export function getCurrentPage() {
  return currentPage;
}

/**
 * Open search modal
 */
function openSearch() {
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchInput');
  
  modal?.classList.add('active');
  document.body.classList.add('modal-open');
  
  setTimeout(() => {
    input?.focus();
  }, 100);
}

/**
 * Close search modal
 */
export function closeSearch() {
  const modal = document.getElementById('searchModal');
  
  modal?.classList.remove('active');
  document.body.classList.remove('modal-open');
}
