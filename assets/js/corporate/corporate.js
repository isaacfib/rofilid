// File Location: /assets/js/corporate/corporate.js
/* ==========================================================================
   ROFILID Corporate Page Specific Scripts
   Description: Scripts exclusive to the Corporate Solutions page.
                Includes specific smooth scroll + cross-page scroll handling.
                NOTE: Basic menu/year functionality handled by global main.js
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // --- START Specific Scroll Logic (from original inline script) ---

    // Smooth scroll for on-page links (with header offset)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Check if it's a valid internal link (starts with # and has more than just #)
            if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                try {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        const headerOffset = document.querySelector('.site-header')?.offsetHeight || 80; // Use a default if header not found
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: "smooth"
                        });
                    } else {
                         console.warn(`Smooth scroll target "${targetId}" not found on corporate page.`);
                    }
                } catch (error) {
                    console.error(`Error finding smooth scroll target: ${error}`);
                }
            }
        });
    });

    // Handle links coming FROM corporate page TO index page anchors
    document.querySelectorAll('a[href^="../../index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.hash; // Gets the # part
            if (targetId) {
                e.preventDefault(); // Prevent default jump
                sessionStorage.setItem('scrollToId', targetId); // Store target ID
                window.location.href = this.getAttribute('href').split('#')[0]; // Navigate to index.html
            }
        });
    });

    // --- END Specific Scroll Logic ---

    // --- START Potential Future Corporate Scripts ---

    // Example: Consultation Form Validation (if needed later)
    const consultationForm = document.querySelector('.consultation-form');
    if (consultationForm) {
        consultationForm.addEventListener('submit', (e) => {
            // Basic check - real validation would be more robust
            const emailInput = consultationForm.querySelector('#consult-email');
            if (emailInput && !emailInput.value.includes('@')) {
                // e.preventDefault(); // Uncomment to prevent submission
                alert('Please enter a valid email address.');
                 console.log("Basic form validation failed (example). Submission might proceed.");
            }
             console.log("Consultation form submitted (or validation passed).");
             // Add actual form submission logic here (e.g., using Fetch API)
             // Potentially show a success/thank you message
        });
    }

    // --- END Potential Future Corporate Scripts ---

    console.log("Rofilid Corporate Page Scripts Initialized.");

}); // End DOMContentLoaded
