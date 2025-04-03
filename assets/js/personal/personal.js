/**
 * File Location: /assets/js/personal/personal.js
 * Description: Fully self-contained scripts for the ROFILID Personal Finance page (personal.html).
 *              Handles ALL JavaScript functionality for this page, including navigation,
 *              smooth scrolling, modals (quiz & feedback), forms, animations, and template interactions.
 * Version: 2.5.0 (Includes debugging for quiz start)
 * Dependencies: Font Awesome (loaded via CSS/HTML)
 */

// Wrap in an IIFE (Immediately Invoked Function Expression) to create a local scope
(function() {
    'use strict'; // Enforce stricter parsing and error handling

    // --- Polyfills (Simple examples, add more if needed for target browsers) ---
    if (!Element.prototype.matches) {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
    }
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            if (!document.documentElement.contains(el)) return null;
            do {
                if (el.matches(s)) return el;
                el = el.parentElement || el.parentNode;
            } while (el !== null && el.nodeType === 1);
            return null;
        };
    }
    // requestAnimationFrame polyfill (basic)
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };

        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());


    // --- Configuration ---
    const CONFIG = {
        ENABLE_SECTION_FADE_IN: true,
        ENABLE_HERO_STATS_ANIMATION: true,
        HEADER_HEIGHT_DEFAULT: 70,      // Fallback header height (px)
        SCROLL_OFFSET_MARGIN: 20,       // Extra px margin for smooth scroll offset
        RESIZE_DEBOUNCE_DELAY: 250,     // Delay (ms) for debouncing resize event
        MODAL_FOCUS_DELAY: 50,          // Delay (ms) before focusing modal element
        API_SIMULATION_DELAY: 1500,     // Fake network delay (ms)
        PDF_DOWNLOAD_FEEDBACK_DELAY: 3000, // How long download success message shows (ms)
        LAST_INTRO_CATEGORY_ID: 4,      // Last category ID for the intro quizzes on this page
        // Mapping for PDF download paths (relative to the page HTML file)
        PDF_FILES: {
            'line-budget': '../../assets/downloads/rofilid-line-item-budget.pdf',
            'networth': '../../assets/downloads/rofilid-net-worth-statement.pdf',
            'cashflow': '../../assets/downloads/rofilid-personal-cashflow.pdf',
            '50-30-20': '../../assets/downloads/rofilid-50-30-20-budget.pdf',
            'expense-tracker': '../../assets/downloads/rofilid-expense-tracker.pdf'
        }
    };

    // --- Global Variables & Cached DOM Elements ---
    let siteHeader, mobileMenuToggle, primaryNavigation,
        quizModal, feedbackModal, openFeedbackBtn,
        coachingInterestForm, feedbackForm,
        currentYearSpan, heroStatsGrid, allFadeInSections;

    // Modal state
    let activeModal = null;
    let triggerElement = null; // Stores the element that opened the current modal

    // Intro Quiz elements & state
    let qModalTitle, qModalCloseBtn, qModalQuestionEl, qModalOptionsEl, qModalFeedbackEl,
        qModalNextBtn, qModalResultsEl, qModalProgressCurrent, qModalProgressTotal,
        qModalNextQuizBtn, qModalRestartBtn, qModalCloseResultsBtn, qModalFullChallengePrompt;

    let currentIntroQuizData = {
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        categoryId: null
    };

    // Debounce timeout ID
    let resizeTimeoutId;

    // --- Helper Functions ---

    /** Debounce function to limit function execution rate */
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    /** Calculate current height of the sticky header */
    function calculateHeaderHeight() {
        return siteHeader?.offsetHeight || CONFIG.HEADER_HEIGHT_DEFAULT;
    }

    /** Trap focus within a specified element (e.g., modal) */
    function trapFocus(element) {
        if (!element) {
            console.warn('[trapFocus] Element is null.');
            return null; // Return null if no element
        }
        const focusableEls = element.querySelectorAll(
            'a[href]:not([disabled], [hidden], [aria-hidden="true"]), button:not([disabled], [hidden], [aria-hidden="true"]), textarea:not([disabled], [hidden], [aria-hidden="true"]), input:not([type="hidden"], [disabled], [hidden], [aria-hidden="true"]), select:not([disabled], [hidden], [aria-hidden="true"]), [tabindex]:not([tabindex="-1"], [disabled], [hidden], [aria-hidden="true"])'
        );
        if (focusableEls.length === 0) {
             // console.log('[trapFocus] No focusable elements found inside:', element);
             return null; // Return null if no focusable elements
        }

        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        function handleFocusTrapKeydown(e) {
             if (e.key !== 'Tab' || !element.contains(document.activeElement)) {
                 // If not Tab, or if focus is somehow outside the modal, ignore
                 return;
             }

            // If shift + tab it focuses element before first focusable element, cycle to last
            if (e.shiftKey && document.activeElement === firstFocusableEl) {
                e.preventDefault();
                // console.log('[trapFocus] Shift+Tab on first element. Focusing last:', lastFocusableEl);
                lastFocusableEl.focus();
            }
             // If tab it focuses element after last focusable element, cycle to first
             else if (!e.shiftKey && document.activeElement === lastFocusableEl) {
                e.preventDefault();
                // console.log('[trapFocus] Tab on last element. Focusing first:', firstFocusableEl);
                firstFocusableEl.focus();
             }
        }

        // Add the keydown listener to the element itself
        element.addEventListener('keydown', handleFocusTrapKeydown);

        // Focus logic (run after delay)
         setTimeout(() => {
             // Check if the modal is still the active one before focusing
             if (activeModal !== element) {
                 console.warn('[trapFocus] Modal changed before focus could be set.');
                 return;
             }

            const closeButton = element.querySelector('.modal-close-btn');
            const primaryAction = element.querySelector('.btn-primary:not([hidden]), .btn-secondary:not([hidden])');
            const firstInput = element.querySelector('input:not([type="hidden"], [disabled], [hidden]), select:not([disabled], [hidden]), textarea:not([disabled], [hidden]), .option-button:not([disabled])');

             let focusTarget = null;
             // Prioritize focusing interactive elements first
             if (primaryAction && primaryAction.offsetParent !== null) focusTarget = primaryAction;
             else if (firstInput && firstInput.offsetParent !== null) focusTarget = firstInput;
             else if (closeButton && closeButton.offsetParent !== null) focusTarget = closeButton;
             else if (firstFocusableEl && firstFocusableEl.offsetParent !== null) focusTarget = firstFocusableEl; // Fallback

             if (focusTarget) {
                 try {
                     // console.log('[trapFocus] Attempting to focus:', focusTarget);
                     focusTarget.focus();
                 } catch(err) {
                     console.error("[trapFocus] Focusing element failed:", err, focusTarget);
                 }
             } else {
                 console.warn("[trapFocus] No visible focus target found within:", element);
             }
         }, CONFIG.MODAL_FOCUS_DELAY);

         // Return the handler function so it can be removed later
         return handleFocusTrapKeydown;
    }


    /** Open a modal dialog */
    function openModal(modalElement, openingTriggerElement) {
        console.log('[openModal] Attempting to open modal:', modalElement?.id);
        if (!modalElement) {
            console.error('[openModal] Failed: modalElement is null or undefined.');
            return;
        }
        if (activeModal === modalElement) {
             console.warn('[openModal] Modal already active:', modalElement.id);
             return;
        }
        // If another modal is active, close it first without returning focus yet
        if (activeModal) {
            console.log('[openModal] Closing previously active modal:', activeModal.id);
            closeModal(false);
        }

        activeModal = modalElement;
        triggerElement = openingTriggerElement; // Store the button/link that opened the modal

        document.body.style.overflow = 'hidden'; // Prevent background scroll
        modalElement.hidden = false; // Make it visible

        // Use rAF to ensure 'hidden' removal is processed before adding 'visible' class for transition
        requestAnimationFrame(() => {
            modalElement.classList.add('visible');
            console.log('[openModal] Added .visible class to:', modalElement.id);
        });

        // Setup focus trapping
        const focusTrapHandler = trapFocus(modalElement);
        if (focusTrapHandler) {
            // Store handler reference on the element itself to remove it upon closing
            modalElement._focusTrapHandler = focusTrapHandler;
        } else {
             console.warn('[openModal] trapFocus returned null, focus trapping might not work for:', modalElement.id);
        }

        // Add ESC key listener for this specific modal instance
        document.addEventListener('keydown', handleModalKeydown);
        console.log('[openModal] Modal opened successfully:', modalElement.id);
    }

    /** Close the currently active modal */
    function closeModal(returnFocus = true) {
        if (!activeModal) {
             // console.log('[closeModal] No active modal to close.');
             return;
        }

        const modalToClose = activeModal;
        const triggerToFocus = triggerElement; // Get the trigger element stored when opened
        const focusTrapHandler = modalToClose._focusTrapHandler; // Get stored handler

        console.log('[closeModal] Closing modal:', modalToClose.id);

        activeModal = null; // Clear active modal reference
        triggerElement = null; // Clear trigger element reference

        modalToClose.classList.remove('visible'); // Start transition out
        document.removeEventListener('keydown', handleModalKeydown); // Remove general ESC listener

        // Remove the specific focus trap listener attached to this modal
        if(focusTrapHandler) {
            modalToClose.removeEventListener('keydown', focusTrapHandler);
            modalToClose._focusTrapHandler = null; // Clear stored reference
            // console.log('[closeModal] Removed focus trap listener for:', modalToClose.id);
        }

        // Use transitionend to hide and clean up after transition finishes
        modalToClose.addEventListener('transitionend', () => {
             modalToClose.hidden = true;
             console.log('[closeModal] Modal hidden after transition:', modalToClose.id);

             // Only restore body scroll if no *other* modal has become active in the meantime
             if (!activeModal) {
                document.body.style.overflow = '';
                // console.log('[closeModal] Restored body scroll.');
             } else {
                 console.log('[closeModal] Body scroll not restored, another modal is active:', activeModal.id);
             }

            // Reset specific modal forms/states if needed
            if (modalToClose === feedbackModal) resetFeedbackForm();
            if (modalToClose === quizModal) resetQuizModalUI();

            // Return focus after modal is fully hidden
            if (returnFocus && triggerToFocus && typeof triggerToFocus.focus === 'function') {
                console.log('[closeModal] Returning focus to:', triggerToFocus);
                try {
                    triggerToFocus.focus({ preventScroll: true }); // preventScroll helps avoid page jump
                 } catch (e) {
                    console.error("[closeModal] Failed to return focus:", e);
                 }
             } else if (returnFocus) {
                 console.warn('[closeModal] Could not return focus. Trigger element invalid or not focusable.');
             }

         }, { once: true }); // Ensure the listener runs only once
    }

    /** Handle Escape key press for closing modals */
    function handleModalKeydown(event) {
        if (event.key === 'Escape' && activeModal) {
            console.log('[handleModalKeydown] Escape key pressed. Closing modal:', activeModal.id);
            closeModal(); // Close the currently active modal
        }
    }

    /** Minimal reset for Quiz Modal UI (called on close) */
    function resetQuizModalUI() {
        // Reset dynamic classes or states added during interaction if any
        // Clear feedback, results, options etc. This is mostly handled by setupIntroQuizUI on next open.
        if(qModalFeedbackEl) qModalFeedbackEl.hidden = true;
        if(qModalResultsEl) qModalResultsEl.hidden = true;
        if(qModalOptionsEl) qModalOptionsEl.innerHTML = '';
        if(qModalQuestionEl) qModalQuestionEl.innerHTML = '';
        console.log("[resetQuizModalUI] Quiz modal UI elements potentially reset.");
    }

    // --- Form Handling Helper Functions ---
    function showFormResponseMessage(formElement, message, type) {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (!responseEl) { console.warn("Form response element not found for:", formElement); return; }
        responseEl.textContent = message;
        responseEl.className = `form-response-note ${type}`; // Ensure class includes 'form-response-note'
        responseEl.hidden = false;
        responseEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    }

    function hideFormResponseMessage(formElement) {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (responseEl) {
            responseEl.hidden = true;
            responseEl.textContent = '';
            responseEl.className = 'form-response-note'; // Reset class
            responseEl.removeAttribute('aria-live');
        }
    }

    function clearFormErrors(formElement) {
        if (!formElement) return;
        formElement.querySelectorAll('.form-error-msg').forEach(msg => msg.textContent = '');
        formElement.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
            input.removeAttribute('aria-invalid');
            // Remove aria-describedby only if it points to the error message
            const errorMsgId = input.getAttribute('aria-describedby');
            const errorMsgEl = errorMsgId ? formElement.querySelector('#' + errorMsgId) : null;
            if (errorMsgEl && errorMsgEl.classList.contains('form-error-msg')) {
                input.removeAttribute('aria-describedby');
            }
        });
    }

    function showInputError(inputElement, message) {
        if (!inputElement) return;
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorMsgElement = formGroup.querySelector('.form-error-msg');

        inputElement.classList.add('is-invalid');
        inputElement.setAttribute('aria-invalid', 'true');

        if (errorMsgElement) {
            errorMsgElement.textContent = message;
            // Ensure the error message element has an ID
            if (!errorMsgElement.id) {
                errorMsgElement.id = inputElement.id + '-error'; // Generate a predictable ID
            }
            // Link the input to the error message using aria-describedby
            inputElement.setAttribute('aria-describedby', errorMsgElement.id);
        }
    }

    /** Basic email validation */
    function isValidEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(email).toLowerCase());
    }

    // --- Main Initialization Function ---
    function initializePersonalPage() {
        console.info("Rofilid Personal Page Scripts Initializing (v2.5.0)");

        // --- Cache Primary DOM Elements ---
        siteHeader = document.querySelector('.site-header');
        mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        primaryNavigation = document.getElementById('primary-navigation');
        quizModal = document.getElementById('quiz-modal'); // <<< CHECK: Is this element found?
        feedbackModal = document.getElementById('feedback-modal');
        openFeedbackBtn = document.getElementById('open-feedback-modal-btn');
        coachingInterestForm = document.getElementById('coachingInterestForm');
        feedbackForm = document.getElementById('feedback-testimonial-form');
        currentYearSpan = document.getElementById('current-year');
        heroStatsGrid = document.querySelector('.hero-stats-grid');
        allFadeInSections = document.querySelectorAll('#main-content > section:not(#hero)[data-animate-fade-in], #main-content > aside.motivational-quote[data-animate-fade-in]'); // Select only elements marked for animation

        // Cache Quiz Modal Elements (with null checks and logging)
        if (!quizModal) {
            console.error("FATAL: Quiz Modal element (#quiz-modal) not found in the DOM during initialization!");
        } else {
            console.log("Quiz Modal element (#quiz-modal) found.");
            qModalTitle = quizModal.querySelector('#quiz-modal-title');
            qModalCloseBtn = quizModal.querySelector('#quiz-modal-close');
            qModalQuestionEl = quizModal.querySelector('#quiz-modal-question');
            qModalOptionsEl = quizModal.querySelector('#quiz-modal-options');
            qModalFeedbackEl = quizModal.querySelector('#quiz-modal-feedback');
            qModalNextBtn = quizModal.querySelector('#quiz-modal-next');
            qModalResultsEl = quizModal.querySelector('#quiz-modal-results');
            qModalProgressCurrent = quizModal.querySelector('#quiz-modal-q-current');
            qModalProgressTotal = quizModal.querySelector('#quiz-modal-q-total');
            qModalNextQuizBtn = quizModal.querySelector('#quiz-modal-next-quiz');
            qModalRestartBtn = quizModal.querySelector('#quiz-modal-restart');
            qModalCloseResultsBtn = quizModal.querySelector('#quiz-modal-close-results');
            qModalFullChallengePrompt = quizModal.querySelector('#quiz-modal-full-challenge-prompt');

            // Log if any sub-elements are missing
            if (!qModalTitle) console.warn("Quiz modal sub-element #quiz-modal-title not found.");
            if (!qModalQuestionEl) console.warn("Quiz modal sub-element #quiz-modal-question not found.");
            // ... add similar checks for other crucial quiz modal elements if needed
        }


        // --- Run Initial Setup ---
        if (!document.body.classList.contains('personal-page') && !document.documentElement.classList.contains('personal-page')) {
            console.warn("'.personal-page' class not found on body or html. Exiting script.");
            return; // Exit if not the correct page context
        }

        setupEventListeners();
        setupAnimations();
        updateCopyrightYear();

        console.info("Rofilid Personal Page Scripts Fully Loaded and Ready.");
    }

    // --- Event Listener Setup ---
    function setupEventListeners() {
        // Mobile Navigation
        if (mobileMenuToggle && primaryNavigation) {
            mobileMenuToggle.addEventListener('click', handleMobileNavToggle);
        } else {
            console.warn("Mobile nav toggle or primary navigation element not found.");
        }

        // Smooth Scrolling for all internal hash links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });

        // Window Resize (Debounced)
        window.addEventListener('resize', debounce(handleResize, CONFIG.RESIZE_DEBOUNCE_DELAY));

        // Modal Closing via Overlay Click (added to overlay itself)
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (event) => {
                // Close only if the click is directly on the overlay, not on its children (the modal content)
                if (event.target === overlay && activeModal === overlay) { // Ensure it's the active modal's overlay
                    console.log('[Overlay Click] Closing modal:', overlay.id);
                    closeModal();
                }
            });
        });


        // Open Feedback Modal Button
        if (openFeedbackBtn && feedbackModal) {
            openFeedbackBtn.addEventListener('click', (e) => openModal(feedbackModal, e.currentTarget));
        } else {
            if (!openFeedbackBtn) console.warn("Open Feedback button (#open-feedback-modal-btn) not found.");
            if (!feedbackModal) console.warn("Feedback Modal element (#feedback-modal) not found.");
        }

        // Generic Modal Close Buttons (Inside modals)
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
             const modal = btn.closest('.modal-overlay');
             if (modal) {
                 btn.addEventListener('click', () => {
                     console.log(`[Close Button Click] Closing modal: ${modal.id}`);
                     closeModal();
                 });
             }
        });
        // Specific close button for quiz results
        if(qModalCloseResultsBtn) {
            qModalCloseResultsBtn.addEventListener('click', () => closeModal());
        }


        // Template Interaction Buttons
        document.querySelectorAll('.get-spreadsheet-btn').forEach(button => {
            button.addEventListener('click', handleGetSpreadsheetClick);
        });
        document.querySelectorAll('.download-pdf-btn').forEach(button => {
            button.addEventListener('click', handleDownloadPdfClick);
        });

        // Coaching Interest Form
        if (coachingInterestForm) {
            coachingInterestForm.addEventListener('submit', handleCoachingInterestSubmit);
        } else {
            // console.log("Coaching interest form not found."); // Optional log
        }

        // Feedback / Testimonial Form
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', handleFeedbackSubmit);
            const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
            if (feedbackTypeSelect) {
                feedbackTypeSelect.addEventListener('change', handleFeedbackTypeChange);
            }
        } else {
             // console.log("Feedback form not found."); // Optional log
        }

        // INTRO Quiz Start Buttons (Check if any buttons are found)
        const quizStartBtns = document.querySelectorAll('#learning-hub .start-quiz-btn');
        if (quizStartBtns.length > 0) {
            console.log(`Found ${quizStartBtns.length} quiz start buttons. Attaching listeners.`);
            quizStartBtns.forEach(button => {
                 button.addEventListener('click', handleIntroQuizStart);
            });
        } else {
            console.warn("No quiz start buttons found in #learning-hub. Quizzes cannot be started.");
        }

         // Intro Quiz Modal Navigation Buttons
         if (qModalNextBtn) qModalNextBtn.addEventListener('click', nextIntroModalQuestion);
         if (qModalRestartBtn) qModalRestartBtn.addEventListener('click', restartIntroModalQuiz);
         if (qModalNextQuizBtn) qModalNextQuizBtn.addEventListener('click', handleIntroNextQuizClick);

         console.log("Event listeners setup complete.");
    }

    // --- Event Handler Functions ---

    function handleMobileNavToggle() {
        if (!primaryNavigation || !mobileMenuToggle) return;
        const isExpanded = primaryNavigation.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded', String(isExpanded));

        // Toggle body scroll based on menu state
        document.body.style.overflow = isExpanded ? 'hidden' : '';

        // Focus management
        if (isExpanded) {
             const firstLink = primaryNavigation.querySelector('a[href], button');
             firstLink?.focus();
        } else if (document.activeElement && primaryNavigation.contains(document.activeElement)) {
             // If focus was inside the closing menu, return it to the toggle button
             mobileMenuToggle.focus();
        }
    }

    function handleSmoothScroll(event) {
        const anchor = event.currentTarget;
        const href = anchor.getAttribute('href');

        if (!href || !href.startsWith('#') || href.length === 1) return;

        // Special case: If mobile nav is open and link is clicked, close nav first
        if (primaryNavigation?.classList.contains('active') && anchor.closest('#primary-navigation')) {
            handleMobileNavToggle(); // Close the mobile menu
        }

        try {
            const targetElement = document.querySelector(href);
            if (targetElement) {
                event.preventDefault(); // Prevent default jump
                const headerOffset = calculateHeaderHeight() + CONFIG.SCROLL_OFFSET_MARGIN;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({ top: offsetPosition, behavior: "smooth" });

                // Update focus after scrolling - make target focusable if needed
                // Use timeout to allow scroll to finish
                setTimeout(() => {
                    if (!targetElement.hasAttribute('tabindex')) {
                        targetElement.setAttribute('tabindex', '-1'); // Make non-interactive elements focusable
                    }
                    targetElement.focus({ preventScroll: true }); // preventScroll is important here!
                }, 500); // Adjust delay if needed

            } else { console.warn(`Smooth scroll target "${href}" not found.`); }
        } catch (error) { console.error(`Smooth scroll error for "${href}":`, error); }
    }

    function handleResize() {
        // Close mobile nav on resize to larger screens if it was open
        if (window.innerWidth > 991 && primaryNavigation?.classList.contains('active')) {
            handleMobileNavToggle();
        }
        // Recalculate header height for scroll offset if header height might change with resize
        // Currently not needed as header height seems fixed, but good place for it if needed.
    }


    function handleGetSpreadsheetClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const templateName = button.dataset.templateName || 'Spreadsheet';
        const price = Number(button.dataset.price || '0');
        const formattedPrice = price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });

        // Replace alert with a more informative log or a less intrusive UI element in the future
        alert(`Interactive "${templateName}" (${formattedPrice})\n\nThis feature is coming soon!\nA Gmail account will be needed for spreadsheet delivery.\nThank you for your interest.`);
        console.info(`Spreadsheet interest registered: ${templateName} (Price: ₦${price})`);
    }

    function handleDownloadPdfClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const card = button.closest('.template-card');
        const templateKey = button.dataset.templateKey;

        if (!card || !templateKey) {
            console.error("Could not find template card or data-template-key attribute on button:", button);
            alert("Sorry, there was an error initiating the download.");
            return;
        }

        const pdfUrl = CONFIG.PDF_FILES[templateKey];
        const templateName = card.querySelector('h3')?.textContent || 'Template';

        if (pdfUrl && pdfUrl !== '#') {
            console.info(`Initiating PDF download for: ${templateName} (${templateKey}) from ${pdfUrl}`);
            const originalButtonHtml = button.innerHTML; // Store original content

            try {
                const link = document.createElement('a');
                link.href = pdfUrl;
                // Generate a cleaner filename
                const safeName = templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                link.download = `rofilid-${safeName}-template.pdf`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link); // Clean up the temporary link

                // User Feedback on the button
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> <span>Downloading...</span>';
                setTimeout(() => {
                    button.innerHTML = originalButtonHtml; // Restore original content
                    button.disabled = false;
                }, CONFIG.PDF_DOWNLOAD_FEEDBACK_DELAY);

            } catch (error) {
                console.error("PDF Download failed:", error);
                alert(`Sorry, the download for "${templateName}" encountered an error. Please check the console or try again later.`);
                button.innerHTML = originalButtonHtml; // Restore button immediately on error
                button.disabled = false;
            }
        } else {
            alert(`Download is currently unavailable for "${templateName}". Please check back later.`);
            console.warn(`PDF path invalid or missing for template key: "${templateKey}". Configured URL: ${pdfUrl}`);
        }
    }

    async function handleCoachingInterestSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const emailInput = form.querySelector('#interest-email');
        const submitButton = form.querySelector('button[type="submit"]');
        if (!form || !emailInput || !submitButton) return;
        const originalButtonHtml = submitButton.innerHTML;

        clearFormErrors(form);
        hideFormResponseMessage(form);

        let isValid = true;
        const email = emailInput.value.trim();

        if (!email) { showInputError(emailInput, 'Email address is required.'); isValid = false; }
        else if (!isValidEmail(email)) { showInputError(emailInput, 'Please enter a valid email address.'); isValid = false; }

        if (!isValid) {
            form.querySelector('.is-invalid')?.focus();
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';

        // --- API Simulation ---
        console.info("Simulating coaching interest submission for:", email);
        try {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            const success = Math.random() > 0.1; // ~90% success rate

            if (success) {
                 console.log("Simulated coaching interest submission SUCCESS");
                 showFormResponseMessage(form, 'Thank you! We\'ll notify you when coaching becomes available.', 'success');
                 form.reset();
                 // Optionally, focus an element outside the form after reset, like the form's heading
                 form.closest('.coaching-interest')?.querySelector('h3')?.focus();
            } else {
                 throw new Error("Simulated server failure.");
            }
        } catch (error) {
            console.error("Simulated coaching interest submission FAILED:", error);
            showFormResponseMessage(form, 'Submission failed. Please check your connection and try again later.', 'error');
            // Focus the input with the error, or the first input if none specific
            form.querySelector('.is-invalid')?.focus() || emailInput.focus();
        } finally {
            // Always re-enable button and restore text after attempt
             submitButton.disabled = false;
             submitButton.innerHTML = originalButtonHtml;
        }
        // --- End Simulation ---
    }

    function handleFeedbackTypeChange(event) {
        const permissionGroup = feedbackForm?.querySelector('.permission-group');
        const permissionCheckbox = permissionGroup?.querySelector('#feedback-permission');
        if (!permissionGroup || !event?.target) return;

        const isTestimonial = event.target.value === 'testimonial';
        permissionGroup.hidden = !isTestimonial;
        // Ensure checkbox state is reset if type changes away from testimonial
        if (!isTestimonial && permissionCheckbox) {
             permissionCheckbox.checked = false;
        }
    }

    async function handleFeedbackSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form) return;

        const nameInput = form.querySelector('#feedback-name');
        const emailInput = form.querySelector('#feedback-email');
        const typeInput = form.querySelector('#feedback-type');
        const messageInput = form.querySelector('#feedback-message');
        const permissionInput = form.querySelector('#feedback-permission');
        const submitButton = form.querySelector('button[type="submit"]');
        if (!typeInput || !messageInput || !submitButton) return;
        const originalButtonHtml = submitButton.innerHTML;

        clearFormErrors(form);
        hideFormResponseMessage(form);
        let isValid = true;
        let firstInvalidElement = null; // Keep track of the first error

        // Validation
        const feedbackType = typeInput.value;
        const feedbackMessage = messageInput.value.trim();
        const feedbackEmail = emailInput.value.trim();

        if (!feedbackType) {
            showInputError(typeInput, 'Please select feedback type.');
            isValid = false;
            if (!firstInvalidElement) firstInvalidElement = typeInput;
        }
        if (!feedbackMessage) {
            showInputError(messageInput, 'Feedback message is required.');
            isValid = false;
             if (!firstInvalidElement) firstInvalidElement = messageInput;
        }
        else if (feedbackMessage.length < 10) {
            showInputError(messageInput, 'Message must be at least 10 characters long.');
            isValid = false;
             if (!firstInvalidElement) firstInvalidElement = messageInput;
        }
        else if (feedbackMessage.length > 2000) {
            showInputError(messageInput, 'Message cannot exceed 2000 characters.');
             isValid = false;
             if (!firstInvalidElement) firstInvalidElement = messageInput;
        }
        if (feedbackEmail && !isValidEmail(feedbackEmail)) {
            showInputError(emailInput, 'Please enter a valid email address or leave it blank.');
             isValid = false;
             if (!firstInvalidElement) firstInvalidElement = emailInput;
        }

        if (!isValid) {
            firstInvalidElement?.focus(); // Focus the first element with an error
            return;
        }

        // Prepare Data
        const formData = {
            name: nameInput.value.trim() || 'Anonymous',
            email: feedbackEmail,
            type: feedbackType,
            message: feedbackMessage,
            permissionGranted: (feedbackType === 'testimonial' && permissionInput?.checked) || null // Handle null permissionInput
        };

        // Submit
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';

        // --- API Simulation ---
        console.info("Simulating feedback submission:", formData);
        let submissionSuccess = false; // Track success for final block
        try {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            const success = Math.random() > 0.1;

            if (success) {
                 console.log("Simulated feedback submission SUCCESS");
                 showFormResponseMessage(form, 'Feedback submitted successfully. Thank you!', 'success');
                 submissionSuccess = true; // Mark as success
                 setTimeout(() => {
                     closeModal(); // Close modal after delay
                     // Resetting form is now handled by closeModal -> resetFeedbackForm
                 }, 2000);
             } else {
                 throw new Error("Simulated feedback submission failure.");
            }
        } catch (error) {
            console.error("Simulated feedback submission FAILED:", error);
             showFormResponseMessage(form, 'Submission failed. Please check your connection and try again.', 'error');
             // Focus the first field (e.g., type) on generic error
             typeInput?.focus();
         } finally {
             // Only restore button if submission failed or didn't trigger the delayed close
             if (!submissionSuccess) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHtml;
             }
        }
        // --- End Simulation ---
    }

    function resetFeedbackForm() {
         if (!feedbackForm) return;
         feedbackForm.reset(); // Native reset is usually sufficient
         clearFormErrors(feedbackForm);
         hideFormResponseMessage(feedbackForm);
         // Ensure permission group visibility is reset based on the (now reset) select value
         handleFeedbackTypeChange({ target: feedbackForm.querySelector('#feedback-type') });
         // Restore button state (in case it was stuck in loading)
         const submitButton = feedbackForm.querySelector('button[type="submit"]');
         if (submitButton) {
             submitButton.disabled = false;
             submitButton.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Submit Feedback';
         }
         console.log("[resetFeedbackForm] Feedback form reset.");
     }

    // --- Animation Setup ---
    function setupAnimations() {
        // Check if IntersectionObserver is supported
        if (!("IntersectionObserver" in window)) {
            console.warn("IntersectionObserver not supported. Skipping scroll animations.");
            // Make all elements visible immediately as a fallback
            document.querySelectorAll('[data-animate-fade-in]').forEach(el => {
                el.classList.add('is-visible');
            });
            return; // Exit animation setup
        }

        // --- Intersection Observer for General Fade-In Sections ---
        if (CONFIG.ENABLE_SECTION_FADE_IN) {
            const fadeObserverOptions = {
                threshold: 0.15, // Trigger when 15% visible
                rootMargin: "0px 0px -50px 0px" // Trigger slightly before fully in view
            };
            const fadeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Stop observing once visible
                    }
                });
            }, fadeObserverOptions);

            allFadeInSections.forEach(section => {
                // data-animate-fade-in attribute should be on the element in HTML
                fadeObserver.observe(section);
            });
        } else {
            // If disabled, make elements visible immediately
            allFadeInSections.forEach(section => section.classList.add('is-visible'));
        }

        // --- Hero Stats Cards Animation (Staggered) ---
        if (CONFIG.ENABLE_HERO_STATS_ANIMATION && heroStatsGrid) {
             const statCards = heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]'); // Select only cards marked for animation
             if (statCards.length > 0) {
                 const statsObserverOptions = {
                    threshold: 0.3, // Trigger when 30% visible
                    // rootMargin: "0px 0px -20px 0px" // Optional adjustment
                 };
                 const statsObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                             const card = entry.target;
                             // Calculate delay based on index (assuming index is set or implied)
                             // Let's use array index for simplicity if data-index isn't reliable
                             const cardIndex = Array.from(statCards).indexOf(card);
                             const delay = cardIndex * 100; // 100ms stagger delay
                            card.style.transitionDelay = `${delay}ms`;
                            card.classList.add('is-visible');
                            observer.unobserve(card);
                        }
                    });
                }, statsObserverOptions);

                 statCards.forEach(card => {
                    statsObserver.observe(card);
                 });
             }
         } else if (heroStatsGrid) {
             // Fallback if observer or setting disabled
             heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]').forEach(card => card.classList.add('is-visible'));
         }
    }

    // --- Dynamic Content ---
    function updateCopyrightYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- INTRO Quiz Logic (Specific to personal.html Learning Hub) ---
    // Hardcoded quiz data for the intro section
    const introQuizQuestions = [
         // Questions 1-20 (as provided previously)
         { id: 1, categoryId: 1, category: "Income & Vitals Check", question: "What is the first essential step when starting to create a budget?", options: ["Calculate total monthly income", "List all fixed expenses", "Set long-term financial goals", "Track spending habits for a month"], correctAnswerIndex: 0, explanation: "Knowing your total income is fundamental; it's the basis upon which all budget allocations are planned." },
         { id: 2, categoryId: 1, category: "Income & Vitals Check", question: "You earn ₦150,000 per month after tax and manage to save ₦22,500. What is your savings rate?", options: ["10%", "15%", "20%", "22.5%"], correctAnswerIndex: 1, explanation: "Savings Rate = (Amount Saved / Total Income) × 100. So, (₦22,500 / ₦150,000) × 100 = 15%." },
         { id: 3, categoryId: 1, category: "Income & Vitals Check", question: "What does 'Pay Yourself First' mean?", options: ["Spend on wants before needs", "Allocate income to savings/investments *before* other spending", "Pay off all debts before saving", "Treat yourself each payday"], correctAnswerIndex: 1, explanation: "'Pay Yourself First' prioritizes saving by treating it like a mandatory bill, ensuring progress towards goals." },
         { id: 4, categoryId: 1, category: "Income & Vitals Check", question: "How is personal Net Worth calculated?", options: ["Annual Income - Annual Expenses", "Total Assets (what you own) - Total Liabilities (what you owe)", "Total Savings + Total Investments", "Monthly Income x 12"], correctAnswerIndex: 1, explanation: "Net worth is a snapshot of your financial position: Assets minus Liabilities." },
         { id: 5, categoryId: 1, category: "Income & Vitals Check", question: "₦50,000 in a savings account earns 4% simple annual interest. How much interest after one year?", options: ["₦400", "₦5,000", "₦2,000", "₦200"], correctAnswerIndex: 2, explanation: "Simple interest = Principal × Rate × Time. ₦50,000 × 0.04 × 1 = ₦2,000." },
         { id: 6, categoryId: 2, category: "Savings Smarts", question: "Why save regularly, even small amounts?", options: ["To impress others", "To build funds for emergencies, goals & investments", "Banks guarantee high returns", "Only to avoid spending now"], correctAnswerIndex: 1, explanation: "Consistent saving builds security (emergency fund) and accumulates funds for future goals and wealth building." },
         { id: 7, categoryId: 2, category: "Savings Smarts", question: "Benefit of starting to save early?", options: ["Retire sooner automatically", "Maximize compound interest over time", "Avoid future taxes", "Interest rates are higher for young savers"], correctAnswerIndex: 1, explanation: "Starting early gives compound interest more time to work its magic, leading to significantly larger sums long-term." },
         { id: 8, categoryId: 2, category: "Savings Smarts", question: "Most crucial factor when choosing a savings account?", options: ["Bank's logo color", "Interest rate (APY) and fees", "Number of branches", "If friends use the same bank"], correctAnswerIndex: 1, explanation: "Interest rate determines growth, fees can reduce your balance. These are key financial factors." },
         { id: 9, categoryId: 2, category: "Savings Smarts", question: "Best place for an emergency fund?", options: ["Stock market for growth", "Easily accessible high-yield savings or money market account", "Under the mattress", "Long-term fixed deposit"], correctAnswerIndex: 1, explanation: "Emergency funds need safety and accessibility, ideally earning some interest, like in a high-yield savings account." },
         { id: 10, categoryId: 2, category: "Savings Smarts", question: "What is simple interest?", options: ["Interest only on the initial principal", "Interest on principal + accumulated interest", "A fee to open an account", "Interest that decreases"], correctAnswerIndex: 0, explanation: "Simple interest is calculated *only* on the original principal amount for the entire period." },
         { id: 11, categoryId: 3, category: "Budgeting Building Blocks", question: "Primary purpose of a budget?", options: ["Track past spending", "Plan future spending and saving", "Restrict all 'fun' spending", "Calculate taxes"], correctAnswerIndex: 1, explanation: "A budget is a forward-looking financial plan to allocate income towards expenses, savings, and goals." },
         { id: 12, categoryId: 3, category: "Budgeting Building Blocks", question: "Fixed vs. Variable expenses?", options: ["Fixed change monthly, variable don't", "Fixed stay mostly the same (rent), variable change (groceries)", "Both change", "Both stay the same"], correctAnswerIndex: 1, explanation: "Fixed expenses (rent, loan payments) are consistent; variable expenses (food, fuel) fluctuate." },
         { id: 13, categoryId: 3, category: "Budgeting Building Blocks", question: "Difference between 'need' and 'want'?", options: ["Needs bought often, wants rarely", "Needs are essential (food, shelter), wants improve comfort/enjoyment", "Needs cost more", "Wants are what friends have"], correctAnswerIndex: 1, explanation: "Needs are essential for survival/well-being; wants are non-essential desires. This helps prioritize spending." },
         { id: 14, categoryId: 3, category: "Budgeting Building Blocks", question: "What is the 50/30/20 rule?", options: ["50% Needs, 30% Wants, 20% Savings/Debt", "50% Savings, 30% Needs, 20% Wants", "50% Wants, 30% Needs, 20% Savings", "50% Debt, 30% Savings, 20% Expenses"], correctAnswerIndex: 0, explanation: "The 50/30/20 rule suggests allocating 50% of after-tax income to Needs, 30% to Wants, and 20% to Savings/Debt Repayment." },
         { id: 15, categoryId: 3, category: "Budgeting Building Blocks", question: "What is a sinking fund used for?", options: ["Main emergency fund", "Saving regularly for a specific, planned future expense", "High-risk investments", "Only for paying debt"], correctAnswerIndex: 1, explanation: "A sinking fund saves gradually for a known upcoming expense (e.g., car repair, vacation) to avoid borrowing later." },
         { id: 16, categoryId: 4, category: "Spending Awareness", question: "Practical first step to track expenses accurately?", options: ["Ignore small cash spending", "Keep receipts & note *all* spending", "Only track card payments", "Guess monthly totals"], correctAnswerIndex: 1, explanation: "Tracking every expense gives a complete picture, crucial for effective budgeting and finding savings." },
         { id: 17, categoryId: 4, category: "Spending Awareness", question: "Why track expenses regularly?", options: ["To know how much you can borrow", "To see where money goes & find potential savings", "To share habits with friends", "To simplify tax calculation"], correctAnswerIndex: 1, explanation: "Regular tracking reveals patterns, helps stick to a budget, and identifies non-essential spending to redirect." },
         { id: 18, categoryId: 4, category: "Spending Awareness", question: "Which tool is useful in cash-heavy environments?", options: ["Complex financial software", "The envelope system (allocating cash)", "Volatile asset investing", "Mental calculations only"], correctAnswerIndex: 1, explanation: "The envelope system physically allocates cash for different categories, helping control cash spending." },
         { id: 19, categoryId: 4, category: "Spending Awareness", question: "Your entertainment budget is ₦10,000. You spent ₦8,500. What % remains?", options: ["5%", "10%", "15%", "85%"], correctAnswerIndex: 2, explanation: "Remaining = ₦10k - ₦8.5k = ₦1.5k. % Remaining = (₦1.5k / ₦10k) * 100 = 15%." },
         { id: 20, categoryId: 4, category: "Spending Awareness", question: "Item costs ₦25,000, but has a 20% discount. What's the final price?", options: ["₦5,000", "₦20,000", "₦24,000", "₦30,000"], correctAnswerIndex: 1, explanation: "Discount = ₦25k * 0.20 = ₦5k. Final Price = ₦25k - ₦5k = ₦20,000." }
    ];

    // --- DEBUG: Check if questions array is populated ---
    if (!introQuizQuestions || introQuizQuestions.length === 0) {
        console.error("FATAL: introQuizQuestions array is empty or undefined! Quizzes cannot load.");
    } else {
        console.log(`introQuizQuestions array loaded with ${introQuizQuestions.length} questions.`);
    }
    // --- END DEBUG ---


    function handleIntroQuizStart(event) {
         console.log('[handleIntroQuizStart] called by:', event.currentTarget); // Log which button was clicked
         const button = event.currentTarget;
         const card = button.closest('.category-card');
         if (!card) {
             console.error('[handleIntroQuizStart] Could not find parent .category-card for button:', button);
             alert("An error occurred trying to start the quiz.");
             return;
         }

         const categoryId = parseInt(card.dataset.categoryId, 10);
         console.log(`[handleIntroQuizStart] Category ID found: ${categoryId}`);

         if (isNaN(categoryId) || categoryId < 1) {
            console.error(`[handleIntroQuizStart] Invalid category ID: ${card.dataset.categoryId}`);
            alert("Cannot start quiz due to an invalid category configuration.");
             return;
         }
        if (categoryId > CONFIG.LAST_INTRO_CATEGORY_ID) {
            console.warn(`[handleIntroQuizStart] Attempted to start intro quiz with ID ${categoryId} > ${CONFIG.LAST_INTRO_CATEGORY_ID}. This might be a full challenge quiz.`);
             alert("This quiz might be part of the full challenge. Please visit the 'All Quizzes' page for more topics.");
             // Optionally redirect: window.location.href = 'quizzes.html';
             return;
        }

         console.log(`[handleIntroQuizStart] Filtering questions for category ID: ${categoryId}`);
        const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);

        if (categoryQuestions.length === 0) {
             console.error(`[handleIntroQuizStart] No questions found for intro category ID: ${categoryId}. Check introQuizQuestions array.`);
            alert("Sorry, questions for this check could not be loaded at this time.");
             return;
        }

         console.log(`[handleIntroQuizStart] Found ${categoryQuestions.length} questions. Calling startIntroQuiz...`);
         startIntroQuiz(categoryId, categoryQuestions, button); // Pass the button as the opening trigger
    }

     function startIntroQuiz(catId, questions, openingTrigger) {
        console.info(`[startIntroQuiz] Starting Intro Quiz - Category: ${catId}`);
         // --- DEBUG: Check if quizModal element exists AT THE TIME OF CALLING ---
         if (!quizModal) {
             console.error("[startIntroQuiz] FAILED: quizModal element is null or undefined. Cannot start quiz.");
             alert("Error: Quiz interface could not be loaded.");
             return;
         }
         if (!questions || questions.length === 0) {
             console.error("[startIntroQuiz] FAILED: No questions provided for category:", catId);
             alert("Error: No questions available for this quiz check.");
             return;
         }
         // --- END DEBUG ---

         currentIntroQuizData = { questions, currentQuestionIndex: 0, score: 0, categoryId: catId };
         console.log("[startIntroQuiz] Current quiz data set:", currentIntroQuizData);

         setupIntroQuizUI(); // Reset and prepare UI elements
         displayIntroModalQuestion(); // Display the first question

         console.log("[startIntroQuiz] Calling openModal...");
         openModal(quizModal, openingTrigger); // Open the modal, pass the trigger
     }

     function setupIntroQuizUI() {
         console.log("[setupIntroQuizUI] Setting up quiz UI...");
         // Check essential elements again before manipulating
         if (!qModalTitle || !qModalResultsEl || !qModalFeedbackEl || !qModalQuestionEl || !qModalOptionsEl || !qModalProgressTotal || !qModalProgressCurrent || !qModalNextBtn || !qModalNextQuizBtn || !qModalRestartBtn || !qModalCloseResultsBtn || !qModalFullChallengePrompt) {
            console.error("[setupIntroQuizUI] One or more essential quiz modal UI elements are missing! Cannot setup UI properly.");
            // Attempt to proceed, but log loudly
         }

         const firstQuestion = currentIntroQuizData.questions[0];
         if(qModalTitle) qModalTitle.textContent = firstQuestion ? firstQuestion.category : 'Financial Concept Check';
         if(qModalProgressTotal) qModalProgressTotal.textContent = currentIntroQuizData.questions.length;

         // Reset visibility/content of dynamic areas
         if(qModalResultsEl) { qModalResultsEl.hidden = true; qModalResultsEl.innerHTML = ''; }
         if(qModalFeedbackEl) { qModalFeedbackEl.hidden = true; qModalFeedbackEl.innerHTML = ''; }
         if(qModalQuestionEl) { qModalQuestionEl.hidden = false; qModalQuestionEl.innerHTML = 'Loading question...'; }
         if(qModalOptionsEl) { qModalOptionsEl.hidden = false; qModalOptionsEl.innerHTML = ''; }

         const progressWrapper = qModalProgressCurrent?.closest('.quiz-modal-progress');
         if (progressWrapper) progressWrapper.removeAttribute('hidden');

         // Ensure all navigation buttons are hidden initially
         [qModalNextBtn, qModalNextQuizBtn, qModalRestartBtn, qModalCloseResultsBtn].forEach(btn => { if (btn) btn.hidden = true; });
         if(qModalFullChallengePrompt) qModalFullChallengePrompt.hidden = true;
         console.log("[setupIntroQuizUI] UI setup complete.");
     }

     function displayIntroModalQuestion() {
         console.log(`[displayIntroModalQuestion] Displaying question index: ${currentIntroQuizData.currentQuestionIndex}`);
         if (!qModalQuestionEl || !qModalOptionsEl || !qModalProgressCurrent) {
             console.error("[displayIntroModalQuestion] Missing critical UI elements (question, options, or progress). Cannot display question.");
             return;
         }

        const quiz = currentIntroQuizData;
        if (quiz.currentQuestionIndex >= quiz.questions.length) {
            console.log("[displayIntroModalQuestion] Reached end of questions. Showing results.");
            showIntroModalResults();
            return;
         }

        const q = quiz.questions[quiz.currentQuestionIndex];
        qModalQuestionEl.innerHTML = `<span class="question-number">${quiz.currentQuestionIndex + 1}.</span> ${q.question}`;
        qModalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;
        qModalOptionsEl.innerHTML = ''; // Clear previous options

         q.options.forEach((option, index) => {
            const button = document.createElement('button');
            // Use textContent for security against XSS if options were dynamic
            button.textContent = option;
            button.className = 'option-button'; // Use only specific class, rely on CSS for button-like appearance
            button.type = 'button';
            button.dataset.index = index;
            // Set role=radio for accessibility within the role=radiogroup container
            button.setAttribute('role', 'radio');
            button.setAttribute('aria-checked', 'false'); // Initially not checked
            button.onclick = () => handleIntroModalOptionSelection(index);
            qModalOptionsEl.appendChild(button);
        });

        // Hide feedback & next button from previous question
        if(qModalFeedbackEl) qModalFeedbackEl.hidden = true;
        if(qModalNextBtn) qModalNextBtn.hidden = true;

        // Focus the first option button after rendering
        qModalOptionsEl.querySelector('.option-button')?.focus();
         console.log("[displayIntroModalQuestion] Question displayed.");
    }

    function handleIntroModalOptionSelection(selectedIndex) {
         console.log(`[handleIntroModalOptionSelection] Option selected: index ${selectedIndex}`);
         const quiz = currentIntroQuizData;
         const q = quiz.questions[quiz.currentQuestionIndex];
         if (!q || !qModalOptionsEl) {
             console.error("[handleIntroModalOptionSelection] Missing question data or options element.");
             return;
         }

         const buttons = qModalOptionsEl.querySelectorAll('.option-button');
         buttons.forEach((button, index) => {
             button.disabled = true; // Disable all buttons
             // Update aria-checked based on selection
             button.setAttribute('aria-checked', index === selectedIndex ? 'true' : 'false');
         });

         const isCorrect = selectedIndex === q.correctAnswerIndex;
         if (isCorrect) {
             quiz.score++;
             console.log(`[handleIntroModalOptionSelection] Correct! Score: ${quiz.score}`);
         } else {
             console.log(`[handleIntroModalOptionSelection] Incorrect. Correct answer index: ${q.correctAnswerIndex}`);
         }

         showIntroModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
     }

    function showIntroModalFeedback(selectedIndex, correctIndex, explanation) {
         console.log("[showIntroModalFeedback] Displaying feedback.");
         const buttons = qModalOptionsEl?.querySelectorAll('.option-button');
         if (!buttons || !qModalFeedbackEl) {
             console.error("[showIntroModalFeedback] Missing options buttons or feedback element.");
             return;
         }

         // Style selected/correct/other buttons
         buttons.forEach((button, index) => {
             button.classList.remove('correct', 'incorrect'); // Clean up first
            if (index === correctIndex) {
                button.classList.add('correct');
            } else if (index === selectedIndex) { // Only mark incorrect if selected and not correct
                button.classList.add('incorrect');
            }
         });

         // Show feedback text
         qModalFeedbackEl.innerHTML = `<p><strong>${selectedIndex === correctIndex ? 'Correct!' : 'Insight:'}</strong> ${explanation || 'No explanation provided.'}</p>`;
         qModalFeedbackEl.className = `quiz-feedback ${selectedIndex === correctIndex ? 'correct' : 'incorrect'}`;
         qModalFeedbackEl.hidden = false;

         // Reveal 'Next' button or trigger results display
         const quiz = currentIntroQuizData;
         if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
            if(qModalNextBtn) {
                qModalNextBtn.hidden = false;
                qModalNextBtn.focus(); // Focus the next button
                console.log("[showIntroModalFeedback] Next question available.");
            } else { console.warn("[showIntroModalFeedback] Next button not found."); }
         } else {
             if(qModalNextBtn) qModalNextBtn.hidden = true; // Hide next if it's the last question
             console.log("[showIntroModalFeedback] Last question answered. Will show results soon.");
             setTimeout(showIntroModalResults, 1200); // Delay showing results for user to read feedback
         }
     }

    function nextIntroModalQuestion() {
         console.log("[nextIntroModalQuestion] Advancing to next question.");
         if (!currentIntroQuizData) return;
         if (qModalFeedbackEl) qModalFeedbackEl.hidden = true; // Hide previous feedback
         if (qModalNextBtn) qModalNextBtn.hidden = true; // Hide next button

         currentIntroQuizData.currentQuestionIndex++;
         displayIntroModalQuestion();
     }

    function showIntroModalResults() {
        console.log("[showIntroModalResults] Displaying quiz results.");
        // Hide active quiz elements
        if (qModalQuestionEl) qModalQuestionEl.hidden = true;
        if (qModalOptionsEl) qModalOptionsEl.hidden = true;
        if (qModalFeedbackEl) qModalFeedbackEl.hidden = true;
        if (qModalNextBtn) qModalNextBtn.hidden = true;
        const progressWrapper = qModalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressWrapper) progressWrapper.setAttribute('hidden', '');

         const quiz = currentIntroQuizData;
         if (!qModalResultsEl || !quiz) {
             console.error("[showIntroModalResults] Missing results element or quiz data. Cannot display results.");
             closeModal(); // Close modal if results can't be shown
             return;
         }

        const score = quiz.score;
        const total = quiz.questions.length;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
         let feedbackMsg = 'Keep learning and exploring!';
         if (percentage === 100) feedbackMsg = 'Excellent work! You have a solid grasp.';
         else if (percentage >= 80) feedbackMsg = 'Great job! You\'re well on your way.';
         else if (percentage >= 50) feedbackMsg = 'Good start! Review the explanations to strengthen your understanding.';

        qModalResultsEl.innerHTML = `
            <h4>Check Complete!</h4>
            <p>You answered ${score} out of ${total} correctly.</p>
            <p class="quiz-score-percentage">(${percentage}%)</p>
            <p class="quiz-result-message">${feedbackMsg}</p>`;
        qModalResultsEl.hidden = false;

        // Control navigation button visibility at results screen
        let focusTarget = null; // Determine which button to focus

         if (qModalRestartBtn) { qModalRestartBtn.hidden = false; focusTarget = qModalRestartBtn; } // Default focus to restart
         if (qModalCloseResultsBtn) { qModalCloseResultsBtn.hidden = false; focusTarget = qModalCloseResultsBtn; } // Override focus to close if preferred

        // Show 'Next Check' or 'Full Challenge' prompt based on category ID
        if (quiz.categoryId && quiz.categoryId < CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (qModalNextQuizBtn) {
                 qModalNextQuizBtn.dataset.nextCategoryId = quiz.categoryId + 1; // Set ID for next quiz
                 qModalNextQuizBtn.hidden = false;
                 focusTarget = qModalNextQuizBtn; // Make 'Next Check' the primary focus
                 console.log("[showIntroModalResults] Showing 'Next Check' button.");
            } else { console.warn("[showIntroModalResults] Next Quiz button not found."); }
        } else if (quiz.categoryId === CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (qModalFullChallengePrompt) {
                qModalFullChallengePrompt.hidden = false;
                console.log("[showIntroModalResults] Showing 'Full Challenge' prompt.");
            } else { console.warn("[showIntroModalResults] Full Challenge prompt element not found."); }
             // Focus remains on close/restart as it's the end of intro checks
        }

         console.log("[showIntroModalResults] Focusing results action button:", focusTarget);
        focusTarget?.focus(); // Focus the determined target button
    }

    function restartIntroModalQuiz() {
        console.log("[restartIntroModalQuiz] Restarting current quiz check.");
        const catId = currentIntroQuizData.categoryId;
        if (catId) {
            const questions = introQuizQuestions.filter(q => q.categoryId === catId);
            // Attempt to find the original trigger button again based on categoryId
            const originalTrigger = document.querySelector(`.category-card[data-category-id="${catId}"] .start-quiz-btn`) || triggerElement;

             if (questions.length > 0) {
                 startIntroQuiz(catId, questions, originalTrigger); // Restart with same category
             } else {
                 console.error(`[restartIntroModalQuiz] Failed to find questions for category ${catId} on restart.`);
                 closeModal();
             }
        } else {
            console.error("[restartIntroModalQuiz] Cannot restart, category ID missing from current quiz data.");
             closeModal(); // Close if we can't identify which quiz to restart
        }
    }

    function handleIntroNextQuizClick(event) {
        console.log("[handleIntroNextQuizClick] 'Next Check' button clicked.");
         const button = event.currentTarget;
         const nextCatId = parseInt(button.dataset.nextCategoryId, 10);

         if (!isNaN(nextCatId) && nextCatId <= CONFIG.LAST_INTRO_CATEGORY_ID) {
             console.log(`[handleIntroNextQuizClick] Attempting to start next quiz with Category ID: ${nextCatId}`);
             const questions = introQuizQuestions.filter(q => q.categoryId === nextCatId);
             // Find the button that *would* trigger this next quiz
             const nextTriggerButton = document.querySelector(`.category-card[data-category-id="${nextCatId}"] .start-quiz-btn`);

             if (questions.length > 0) {
                 // Start the next quiz, using its corresponding trigger button if found
                 startIntroQuiz(nextCatId, questions, nextTriggerButton || button); // Fallback to current button if next trigger not found
             } else {
                 console.error(`[handleIntroNextQuizClick] Questions missing for next category: ${nextCatId}`);
                 alert("Error loading the next check. Please close and try starting it manually.");
                closeModal();
            }
        } else {
             console.error("[handleIntroNextQuizClick] Invalid or missing next category ID on button:", button.dataset.nextCategoryId);
             alert("Error determining the next check. Please close and select manually.");
            closeModal();
         }
    }
    // --- END INTRO Quiz Logic ---


    // --- Run Initialization on DOM Ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePersonalPage);
    } else {
        initializePersonalPage(); // Already loaded
    }

})(); // End IIFE
