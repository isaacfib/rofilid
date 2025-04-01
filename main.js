// File Location: /main.js
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const primaryNav = document.querySelector('#primary-navigation');

  if (menuToggle && primaryNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      primaryNav.classList.toggle('active');
    });
  }

  // Auto-hide mobile menu on scroll
  window.addEventListener('scroll', () => {
    if (primaryNav && primaryNav.classList.contains('active')) {
      primaryNav.classList.remove('active');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Smooth Scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      // Check if it's a valid internal link (starts with # and has more than just #)
      if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
        try {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth' });
          } else {
            console.warn(`Smooth scroll target "${targetId}" not found.`);
          }
        } catch (error) {
          // Handle potential invalid selector syntax if needed, although querySelector should be robust
          console.error(`Error finding smooth scroll target: ${error}`);
        }
      }
      // Allow default behavior for links like href="#" or if target is not found
    });
  });

  // Update current year in copyright
  const currentYearElement = document.getElementById('current-year');
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
});
