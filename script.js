document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const primaryNav = document.querySelector('#primary-navigation');
    const header = document.querySelector('.site-header');
    const body = document.body;

    // Add no-js class initially, remove it when JS loads
    body.classList.add('no-js');
    body.classList.remove('no-js');


    // Mobile Menu Toggle
    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            primaryNav.classList.toggle('active');

            // Optional: Toggle body class to prevent scrolling when menu is open
            body.classList.toggle('menu-open', !isExpanded);

             // Toggle icon
            const icon = menuToggle.querySelector('i');
            if (!isExpanded) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when a nav link is clicked (useful for single-page navigation)
        primaryNav.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', () => {
                if (primaryNav.classList.contains('active')) {
                    menuToggle.setAttribute('aria-expanded', 'false');
                    primaryNav.classList.remove('active');
                    body.classList.remove('menu-open');
                    // Reset icon
                     const icon = menuToggle.querySelector('i');
                     icon.classList.remove('fa-times');
                     icon.classList.add('fa-bars');
                }
            });
        });

        // Close menu if clicked outside
        document.addEventListener('click', (event) => {
            const isClickInsideNav = primaryNav.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);

            if (!isClickInsideNav && !isClickOnToggle && primaryNav.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                primaryNav.classList.remove('active');
                body.classList.remove('menu-open');
                 // Reset icon
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Optional: Auto-hide mobile menu on scroll (Consider UX implications)
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (primaryNav && primaryNav.classList.contains('active')) {
             // Keep menu open while scrolling if you prefer
             // If you want it to close on ANY scroll:
             // menuToggle.setAttribute('aria-expanded', 'false');
             // primaryNav.classList.remove('active');
             // body.classList.remove('menu-open');
             // const icon = menuToggle.querySelector('i');
             // icon.classList.remove('fa-times');
             // icon.classList.add('fa-bars');
        }

        // Optional: Add subtle shadow to header on scroll
        if (header) {
           if (scrollTop > 50) { // Add shadow after scrolling down a bit
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    }, false);


    // Smooth Scroll for internal links (improved)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            // Check if it's just a hash or links to a valid element
            if (targetId === '#' || targetId.length <= 1) return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();
                const headerHeight = header ? header.offsetHeight : 0; // Get actual header height
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update URL hash without page jump
                // history.pushState(null, null, targetId); // Use replaceState if you don't want browser history entries
                 history.replaceState(null, null, targetId);

                // Optionally: Focus the target element for accessibility after scrolling
                // setTimeout(() => {
                //     targetElement.focus();
                //     // If the target doesn't have a tabindex, add it temporarily
                //     if(document.activeElement !== targetElement) {
                //          targetElement.setAttribute('tabindex', '-1');
                //          targetElement.focus();
                //      }
                // }, 1000); // Delay might be needed depending on scroll duration
            }
        });
    });

    // Basic Form Validation (Client-side)
    const contactForm = document.getElementById('contact-form');
    const emailInput = document.getElementById('contact-email');
    const emailError = document.querySelector('.email-error'); // Reference to the error message element
    const formStatus = document.getElementById('form-status');

    if (contactForm && emailInput && emailError) {
        contactForm.addEventListener('submit', function(e) {
             // Clear previous status
            if (formStatus) formStatus.textContent = '';
            if (formStatus) formStatus.className = '';

            // Validate email
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                e.preventDefault(); // Prevent form submission
                emailError.style.display = 'block'; // Show the error message
                emailInput.setAttribute('aria-invalid', 'true'); // Mark as invalid for accessibility
                emailInput.focus(); // Focus the field
            } else {
                emailError.style.display = 'none'; // Hide error message if valid
                emailInput.setAttribute('aria-invalid', 'false'); // Mark as valid

                // --- Optional: AJAX Form Submission ---
                // Uncomment and modify this section to handle submission via JavaScript
                /*
                e.preventDefault(); // Prevent default submission FOR AJAX
                const formData = new FormData(contactForm);
                const submitButton = contactForm.querySelector('button[type="submit"]');
                submitButton.disabled = true; // Disable button during submission
                if (formStatus) formStatus.textContent = 'Sending...';

                fetch(contactForm.action, { // Assumes contactForm.action is set
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Adjust if your endpoint expects different headers
                    }
                })
                .then(response => {
                    if (response.ok) {
                        if (formStatus) {
                             formStatus.textContent = 'Message sent successfully!';
                             formStatus.className = 'success';
                        }
                        contactForm.reset(); // Clear the form
                    } else {
                         // Attempt to get error message from response if possible
                        response.json().then(data => {
                           if (formStatus) {
                               formStatus.textContent = data.message || 'Oops! There was a problem sending your message.';
                               formStatus.className = 'error';
                            }
                        }).catch(() => {
                           if (formStatus) {
                                formStatus.textContent = 'Oops! There was a problem sending your message.';
                                formStatus.className = 'error';
                           }
                        });
                    }
                })
                .catch(error => {
                    console.error('Form submission error:', error);
                   if (formStatus) {
                       formStatus.textContent = 'Network error. Please try again.';
                       formStatus.className = 'error';
                   }
                })
                .finally(() => {
                    submitButton.disabled = false; // Re-enable button
                });
                */
                 // --- End Optional AJAX ---
            }
        });

        // Real-time validation feedback (optional, remove error on input change)
        emailInput.addEventListener('input', () => {
             if (emailError.style.display === 'block') {
                 const email = emailInput.value.trim();
                 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                 if (emailRegex.test(email)) {
                      emailError.style.display = 'none';
                      emailInput.setAttribute('aria-invalid', 'false');
                 }
             }
         });
    }


    // Update current year in copyright
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
