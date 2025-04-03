/**
 * File Location: /assets/js/personal/personal.js
 * Description: Fully self-contained scripts for the ROFILID Personal Finance page (personal.html).
 *              Handles ALL JavaScript functionality for this page, including navigation,
 *              smooth scrolling, modals (quiz & feedback), forms, animations, and template interactions.
 * Version: 2.4.0
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
            'line-budget': '../../assets/downloads/rofilid-line-item-budget.pdf', // Ensure filenames exist
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
        if (!element) return;
        const focusableEls = element.querySelectorAll(
            'a[href]:not([disabled], [hidden], [aria-hidden="true"]), button:not([disabled], [hidden], [aria-hidden="true"]), textarea:not([disabled], [hidden], [aria-hidden="true"]), input:not([type="hidden"], [disabled], [hidden], [aria-hidden="true"]), select:not([disabled], [hidden], [aria-hidden="true"]), [tabindex]:not([tabindex="-1"], [disabled], [hidden], [aria-hidden="true"])'
        );
        if (focusableEls.length === 0) return; // No focusable elements

        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];
        let currentFocus = document.activeElement; // Capture focus before timeout

        element.addEventListener('keydown', handleFocusTrapKeydown);

        function handleFocusTrapKeydown(e) {
             if (e.key !== 'Tab') return;

            // If shift + tab it focuses element before first focusable element, cycle to last
            if (e.shiftKey && document.activeElement === firstFocusableEl) {
                e.preventDefault();
                lastFocusableEl.focus();
            }
             // If tab it focuses element after last focusable element, cycle to first
             else if (!e.shiftKey && document.activeElement === lastFocusableEl) {
                e.preventDefault();
                firstFocusableEl.focus();
             }
        }

         // Delay focus to ensure elements are ready and transition complete
         setTimeout(() => {
            const closeButton = element.querySelector('.modal-close-btn');
            const primaryAction = element.querySelector('.btn-primary:not([hidden]), .btn-secondary:not([hidden])');
            const firstInput = element.querySelector('input:not([type="hidden"], [disabled], [hidden]), select:not([disabled], [hidden]), textarea:not([disabled], [hidden]), .option-button:not([disabled])'); // Added .option-button

            let focusTarget = null;
            if (closeButton && closeButton.offsetParent !== null) focusTarget = closeButton; // Is it visible?
            else if (primaryAction && primaryAction.offsetParent !== null) focusTarget = primaryAction;
            else if (firstInput && firstInput.offsetParent !== null) focusTarget = firstInput;
            else if (firstFocusableEl && firstFocusableEl.offsetParent !== null) focusTarget = firstFocusableEl; // Fallback

             if (focusTarget) {
                 try { focusTarget.focus(); } catch(err) { console.warn("Focus failed:", err); }
            }
         }, CONFIG.MODAL_FOCUS_DELAY);

         // Return function to remove listener (though handled globally by modal logic usually)
         return handleFocusTrapKeydown;
    }


    /** Open a modal dialog */
    function openModal(modalElement, openingTriggerElement) {
        if (!modalElement || activeModal === modalElement) return;
        if (activeModal) closeModal(false); // Close existing, don't return focus yet

        activeModal = modalElement;
        triggerElement = openingTriggerElement;

        document.body.style.overflow = 'hidden';
        modalElement.hidden = false;

        requestAnimationFrame(() => {
            modalElement.classList.add('visible');
        });

        const focusTrapHandler = trapFocus(modalElement);
        // Store handler reference on element to remove later if needed, though handleModalKeydown manages it too
        modalElement._focusTrapHandler = focusTrapHandler;

        document.addEventListener('keydown', handleModalKeydown);
    }

    /** Close the currently active modal */
    function closeModal(returnFocus = true) {
        if (!activeModal) return;

        const modalToClose = activeModal;
        const triggerToFocus = triggerElement;
        const focusTrapHandler = modalToClose._focusTrapHandler;

        activeModal = null;
        triggerElement = null;

        modalToClose.classList.remove('visible');
        document.removeEventListener('keydown', handleModalKeydown); // Remove listener specific to this modal
        if(focusTrapHandler) modalToClose.removeEventListener('keydown', focusTrapHandler); // Clean up specific focus listener

        modalToClose.addEventListener('transitionend', () => {
             modalToClose.hidden = true;
            if (!activeModal) { // Only restore if no *other* modal took over
                document.body.style.overflow = '';
             }
            // Reset specific modal forms/states
            if (modalToClose === feedbackModal) resetFeedbackForm();
            if (modalToClose === quizModal) resetQuizModalUI();

         }, { once: true });

        // Return focus *after* transition completes for smoothness
        if (returnFocus && triggerToFocus && typeof triggerToFocus.focus === 'function') {
            setTimeout(() => {
                try { triggerToFocus.focus({ preventScroll: true }); } catch (e) { console.warn("Failed to return focus:", e); }
             }, 10); // Shorter delay just to ensure focus happens post-render
         }
    }

    /** Handle Escape key press for closing modals */
    function handleModalKeydown(event) {
        if (event.key === 'Escape' && activeModal) {
            closeModal();
        }
    }

    /** Minimal reset for Quiz Modal UI (if needed beyond setup) */
    function resetQuizModalUI() {
         // Potentially clear dynamic classes or states added during interaction
         // console.log("Quiz modal reset invoked.");
    }

    // --- Form Handling Helper Functions ---
    function showFormResponseMessage(formElement, message, type) {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (!responseEl) { console.warn("Form response element not found", formElement); return; }
        responseEl.textContent = message;
        responseEl.className = `form-response-note ${type}`;
        responseEl.hidden = false;
        responseEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    }

    function hideFormResponseMessage(formElement) {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (responseEl) {
            responseEl.hidden = true;
            responseEl.textContent = '';
            responseEl.removeAttribute('aria-live');
        }
    }

    function clearFormErrors(formElement) {
        if (!formElement) return;
        formElement.querySelectorAll('.form-error-msg').forEach(msg => msg.textContent = '');
        formElement.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby'); // Assuming errors are primary description
        });
    }

    function showInputError(inputElement, message) {
        if (!inputElement) return;
        const formGroup = inputElement.closest('.form-group');
        const errorMsgElement = formGroup?.querySelector('.form-error-msg');
        const errorMsgId = errorMsgElement?.id; // Get ID from the message element itself

        inputElement.classList.add('is-invalid');
        inputElement.setAttribute('aria-invalid', 'true');
        if (errorMsgElement) {
            errorMsgElement.textContent = message;
            if (errorMsgId) { // Link input to the error message ID
                inputElement.setAttribute('aria-describedby', errorMsgId);
             }
        }
    }

    /** Basic email validation */
    function isValidEmail(email) {
        if (!email) return false;
        // Simple regex: something@something.something
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(email).toLowerCase());
    }

    // --- Main Initialization Function ---
    function initializePersonalPage() {
        console.info("Rofilid Personal Page Scripts Initializing (v2.4.0)");

        // --- Cache Primary DOM Elements ---
        siteHeader = document.querySelector('.site-header');
        mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        primaryNavigation = document.getElementById('primary-navigation');
        quizModal = document.getElementById('quiz-modal');
        feedbackModal = document.getElementById('feedback-modal');
        openFeedbackBtn = document.getElementById('open-feedback-modal-btn');
        coachingInterestForm = document.getElementById('coachingInterestForm');
        feedbackForm = document.getElementById('feedback-testimonial-form');
        currentYearSpan = document.getElementById('current-year');
        heroStatsGrid = document.querySelector('.hero-stats-grid');
        allFadeInSections = document.querySelectorAll('#main-content > section:not(#hero), #main-content > aside.motivational-quote');

        // Cache Quiz Modal Elements (with null checks)
        qModalTitle = quizModal?.querySelector('#quiz-modal-title');
        qModalCloseBtn = quizModal?.querySelector('#quiz-modal-close');
        qModalQuestionEl = quizModal?.querySelector('#quiz-modal-question');
        qModalOptionsEl = quizModal?.querySelector('#quiz-modal-options');
        qModalFeedbackEl = quizModal?.querySelector('#quiz-modal-feedback');
        qModalNextBtn = quizModal?.querySelector('#quiz-modal-next');
        qModalResultsEl = quizModal?.querySelector('#quiz-modal-results');
        qModalProgressCurrent = quizModal?.querySelector('#quiz-modal-q-current');
        qModalProgressTotal = quizModal?.querySelector('#quiz-modal-q-total');
        qModalNextQuizBtn = quizModal?.querySelector('#quiz-modal-next-quiz');
        qModalRestartBtn = quizModal?.querySelector('#quiz-modal-restart');
        qModalCloseResultsBtn = quizModal?.querySelector('#quiz-modal-close-results');
        qModalFullChallengePrompt = quizModal?.querySelector('#quiz-modal-full-challenge-prompt');


        // --- Run Initial Setup ---
        if (!document.body.classList.contains('personal-page')) {
            console.warn("'.personal-page' class not found on body or html. Exiting script.");
            return; // Exit if not the correct page context (using body class for flexibility)
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
        }

        // Smooth Scrolling for all internal hash links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });

        // Window Resize (Debounced)
        window.addEventListener('resize', debounce(handleResize, CONFIG.RESIZE_DEBOUNCE_DELAY));

        // Modal Closing (Overlay Click) - listener added dynamically by openModal is sufficient

        // Open Feedback Modal Button
        if (openFeedbackBtn && feedbackModal) {
            openFeedbackBtn.addEventListener('click', (e) => openModal(feedbackModal, e.currentTarget));
        }

        // Generic Modal Close Buttons (Inside modals)
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
             btn.addEventListener('click', () => closeModal()); // Simple close action
        });
        if(qModalCloseResultsBtn) qModalCloseResultsBtn.addEventListener('click', () => closeModal()); // Specific result close


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
        }

        // Feedback / Testimonial Form
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', handleFeedbackSubmit);
            const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
            if (feedbackTypeSelect) {
                feedbackTypeSelect.addEventListener('change', handleFeedbackTypeChange);
            }
        }

        // INTRO Quiz Start Buttons
        document.querySelectorAll('#learning-hub .start-quiz-btn').forEach(button => {
             button.addEventListener('click', handleIntroQuizStart);
        });
         // Intro Quiz Modal Navigation Buttons
         if (qModalNextBtn) qModalNextBtn.addEventListener('click', nextIntroModalQuestion);
         if (qModalRestartBtn) qModalRestartBtn.addEventListener('click', restartIntroModalQuiz);
         if (qModalNextQuizBtn) qModalNextQuizBtn.addEventListener('click', handleIntroNextQuizClick);
    }

    // --- Event Handler Functions ---

    function handleMobileNavToggle() {
        if (!primaryNavigation || !mobileMenuToggle) return;
        const isExpanded = primaryNavigation.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded', String(isExpanded));
        document.body.style.overflow = isExpanded ? 'hidden' : '';
        if (isExpanded && primaryNavigation.querySelector('a')) {
             primaryNavigation.querySelector('a').focus(); // Focus first link in open menu
        } else if (!isExpanded && document.activeElement !== mobileMenuToggle) {
            mobileMenuToggle.focus(); // Return focus to toggle on close
        }
    }

    function handleSmoothScroll(event) {
        const anchor = event.currentTarget;
        const href = anchor.getAttribute('href');

        if (!href || !href.startsWith('#') || href.length === 1) return; // Ignore non-fragment or empty links

        try {
            const targetElement = document.querySelector(href);
            if (targetElement) {
                event.preventDefault();
                const headerOffset = calculateHeaderHeight() + CONFIG.SCROLL_OFFSET_MARGIN;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({ top: offsetPosition, behavior: "smooth" });

                if (primaryNavigation?.classList.contains('active')) {
                    handleMobileNavToggle();
                    // Focus the link AFTER scroll animation might finish slightly
                    setTimeout(() => anchor.focus({ preventScroll: true }), 400);
                } else {
                     // Optionally focus the target section's heading after scroll
                     const targetHeading = targetElement.querySelector('h1, h2, h3, h4, h5, h6') || targetElement;
                     if (targetHeading) {
                         // Make it focusable if it isn't
                          if (!targetHeading.hasAttribute('tabindex')) targetHeading.setAttribute('tabindex', '-1');
                         setTimeout(() => targetHeading.focus({ preventScroll: true }), 400);
                    }
                }
            } else { console.warn(`Smooth scroll target "${href}" not found.`); }
        } catch (error) { console.error(`Smooth scroll error for "${href}":`, error); }
    }

    function handleResize() {
        // Currently only needed to recalculate header height if it were dynamic.
        // console.log("Window resized.");
        // Potentially update CSS variable if layout depends on it dynamically
        // const newHeight = calculateHeaderHeight();
        // document.documentElement.style.setProperty('--pp-header-height', `${newHeight}px`);
    }

    // Removed handleOverlayClick as modal open function now handles its own logic

    function handleGetSpreadsheetClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const templateName = button.dataset.templateName || 'Spreadsheet';
        const price = Number(button.dataset.price || '0'); // Ensure number
        const formattedPrice = price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });

        alert(`Interactive "${templateName}" (${formattedPrice})\n\nFeature coming soon!\nGmail needed for spreadsheet delivery.\nThank you for your interest.`);
        console.info(`Spreadsheet interest: ${templateName} (₦${price})`);
    }

    function handleDownloadPdfClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const originalButtonHtml = button.innerHTML;
        const card = button.closest('.template-card');
        const templateKey = button.dataset.templateKey; // Get key from correct attribute

        if (!card || !templateKey) { console.error("Could not find template card or key."); return; }

        const pdfUrl = CONFIG.PDF_FILES[templateKey];
        const templateName = card.querySelector('h3')?.textContent || 'Template';

        if (pdfUrl && pdfUrl !== '#') { // Ensure URL is valid
            console.info(`Initiating PDF download: ${templateName} from ${pdfUrl}`);
            try {
                const link = document.createElement('a');
                link.href = pdfUrl;
                const fileName = templateName.toLowerCase().replace(/[\s/&]+/g, '-') + '-template-rofilid.pdf';
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link); // Cleanup

                // User Feedback
                button.disabled = true; // Prevent double clicks
                button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> <span>Downloading...</span>';
                setTimeout(() => {
                    button.innerHTML = originalButtonHtml; // Restore original content
                    button.disabled = false;
                }, CONFIG.PDF_DOWNLOAD_FEEDBACK_DELAY);
            } catch (error) {
                console.error("PDF Download failed:", error);
                alert(`Sorry, the download for "${templateName}" encountered an error. Please try again later.`);
            }
        } else {
            alert(`Download unavailable for "${templateName}". The file path might be missing or incorrect.`);
            console.warn(`PDF path invalid or missing for template key: "${templateKey}". URL: ${pdfUrl}`);
        }
    }

    async function handleCoachingInterestSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const emailInput = form.querySelector('#interest-email');
        const submitButton = form.querySelector('button[type="submit"]');
        if (!emailInput || !submitButton) return; // Guard
        const originalButtonText = submitButton.innerHTML;

        clearFormErrors(form);
        hideFormResponseMessage(form);

        let isValid = true;
        const email = emailInput.value.trim();

        if (!email) { showInputError(emailInput, 'Email address is required.'); isValid = false; }
        else if (!isValidEmail(email)) { showInputError(emailInput, 'Please enter a valid email address.'); isValid = false; }

        if (!isValid) { form.querySelector('.is-invalid')?.focus(); return; }

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';

        // --- API Simulation ---
        console.info("Submitting coaching interest for:", email);
        try {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            const success = Math.random() > 0.1; // ~90% success rate

            if (success) {
                 showFormResponseMessage(form, 'Thank you! We\'ll notify you when coaching is available.', 'success');
                 form.reset();
                 // No need to manually restore button text, handled in finally
            } else {
                 throw new Error("Simulated server failure.");
            }
        } catch (error) {
            console.error("Coaching interest submission failed:", error);
            showFormResponseMessage(form, 'Submission failed. Please check connection and try again.', 'error');
        } finally {
            // Always re-enable button and restore text after attempt
             submitButton.disabled = false;
             submitButton.innerHTML = originalButtonText;
        }
        // --- End Simulation ---
    }

    function handleFeedbackTypeChange(event) {
        const permissionGroup = feedbackForm?.querySelector('.permission-group');
        const permissionCheckbox = permissionGroup?.querySelector('#feedback-permission');
        if (!permissionGroup || !event?.target) return;

        const isTestimonial = event.target.value === 'testimonial';
        permissionGroup.hidden = !isTestimonial;
        if (!isTestimonial && permissionCheckbox) { permissionCheckbox.checked = false; }
    }

    async function handleFeedbackSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form) return; // Guard

        const nameInput = form.querySelector('#feedback-name');
        const emailInput = form.querySelector('#feedback-email');
        const typeInput = form.querySelector('#feedback-type');
        const messageInput = form.querySelector('#feedback-message');
        const permissionInput = form.querySelector('#feedback-permission');
        const submitButton = form.querySelector('button[type="submit"]');
        if (!typeInput || !messageInput || !submitButton) return; // Essential elements guard
        const originalButtonText = submitButton.innerHTML;

        clearFormErrors(form);
        hideFormResponseMessage(form);
        let isValid = true;

        // Validation
        const feedbackType = typeInput.value;
        const feedbackMessage = messageInput.value.trim();
        const feedbackEmail = emailInput.value.trim();

        if (!feedbackType) { showInputError(typeInput, 'Please select feedback type.'); isValid = false; }
        if (!feedbackMessage) { showInputError(messageInput, 'Feedback message is required.'); isValid = false; }
        else if (feedbackMessage.length < 10) { showInputError(messageInput, 'Message must be at least 10 characters.'); isValid = false; }
        else if (feedbackMessage.length > 2000) { showInputError(messageInput, 'Message cannot exceed 2000 characters.'); isValid = false; }
        if (feedbackEmail && !isValidEmail(feedbackEmail)) { showInputError(emailInput, 'Enter a valid email or leave blank.'); isValid = false; }

        if (!isValid) { form.querySelector('.is-invalid')?.focus(); return; }

        // Prepare Data
        const formData = {
            name: nameInput.value.trim() || 'Anonymous', // Default name if blank
            email: feedbackEmail,
            type: feedbackType,
            message: feedbackMessage,
            permissionGranted: (feedbackType === 'testimonial' && permissionInput) ? permissionInput.checked : null
        };

        // Submit
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';

        // --- API Simulation ---
        console.info("Submitting feedback:", formData);
        try {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            const success = Math.random() > 0.1;

            if (success) {
                 showFormResponseMessage(form, 'Feedback submitted successfully. Thank you!', 'success');
                 setTimeout(() => {
                    // Reset and close modal after short delay
                     form.reset(); // Includes clearing checkbox, selects etc.
                     handleFeedbackTypeChange({ target: typeInput }); // Reset permission visibility
                     closeModal();
                 }, 2000); // Show success msg before closing
             } else {
                 throw new Error("Simulated feedback submission failure.");
            }
        } catch (error) {
            console.error("Feedback submission failed:", error);
             showFormResponseMessage(form, 'Submission failed. Please check connection and try again.', 'error');
             // Enable button immediately on error
            submitButton.disabled = false;
             submitButton.innerHTML = originalButtonText;
         } finally {
             // If modal didn't close on success (logic error), ensure button is reset
             if(!submitButton.disabled) { // check if already handled by success path
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
             }
        }
        // --- End Simulation ---
    }

    function resetFeedbackForm() {
         if (!feedbackForm) return;
         feedbackForm.reset(); // Native reset handles most fields
         clearFormErrors(feedbackForm);
         hideFormResponseMessage(feedbackForm);
         const permissionGroup = feedbackForm.querySelector('.permission-group');
         if (permissionGroup) permissionGroup.hidden = true; // Ensure hidden
         const submitButton = feedbackForm.querySelector('button[type="submit"]');
         if (submitButton) {
             submitButton.disabled = false;
             submitButton.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Submit Feedback'; // Restore text
         }
     }

    // --- Animation Setup ---
    function setupAnimations() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        // Intersection Observer for Fade-In Sections
        if (CONFIG.ENABLE_SECTION_FADE_IN && "IntersectionObserver" in window && allFadeInSections.length > 0) {
            const fadeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            allFadeInSections.forEach(section => {
                section.setAttribute('data-animate-fade-in', ''); // Ensure attribute for CSS targeting
                fadeObserver.observe(section);
            });
        } else {
            // Fallback or if disabled: Make sections visible immediately
            allFadeInSections.forEach(section => section.classList.add('is-visible'));
            if (CONFIG.ENABLE_SECTION_FADE_IN && !("IntersectionObserver" in window)) {
                 console.warn("IntersectionObserver not supported, skipping fade animations.");
            }
        }

        // Hero Stats Cards Animation (Staggered fade-in)
        if (CONFIG.ENABLE_HERO_STATS_ANIMATION && "IntersectionObserver" in window && heroStatsGrid) {
            const statCards = heroStatsGrid.querySelectorAll('.stat-card');
             const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                         const card = entry.target;
                         const delay = (parseInt(card.dataset.index || 0)) * 100; // ms stagger delay
                        card.style.transitionDelay = `${delay}ms`;
                        card.classList.add('is-visible');
                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.4 }); // Trigger when 40% visible

            statCards.forEach((card, index) => {
                 card.dataset.index = index; // Store index for delay calculation
                 card.setAttribute('data-animate-fade-in', ''); // Mark for animation
                statsObserver.observe(card);
             });
         } else if (heroStatsGrid) {
             // Fallback if observer or setting disabled
             heroStatsGrid.querySelectorAll('.stat-card').forEach(card => card.classList.add('is-visible'));
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
        // Copy-pasted the 20 questions here (omitted for brevity in this thought process)
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

    function handleIntroQuizStart(event) {
         const button = event.currentTarget;
         const card = button.closest('.category-card');
         const categoryId = card ? parseInt(card.dataset.categoryId, 10) : null;

         if (!categoryId || categoryId < 1) {
            console.error("Invalid category ID:", card?.dataset.categoryId);
            alert("Cannot start quiz due to configuration issue.");
             return;
         }
        if (categoryId > CONFIG.LAST_INTRO_CATEGORY_ID) {
            console.warn(`Attempted to start intro quiz with ID ${categoryId} > ${CONFIG.LAST_INTRO_CATEGORY_ID}. Redirecting or informing user might be better.`);
             alert("This quiz might be part of the full challenge. Please visit the 'All Quizzes' page."); // Example message
             // Alternatively: window.location.href = 'quizzes.html#theme-X'; // If structure known
             return;
        }

        const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);
        if (categoryQuestions.length === 0) {
             console.error(`No questions found for intro category ID: ${categoryId}`);
            alert("Sorry, questions for this check could not be loaded.");
             return;
        }

         // All checks passed, start the quiz
         startIntroQuiz(categoryId, categoryQuestions, button);
    }

     function startIntroQuiz(catId, questions, openingTrigger) {
        console.info(`Starting Intro Quiz - Category: ${catId}`);
         if (!quizModal || questions.length === 0) { // Ensure modal exists
             console.error("Quiz modal or questions array is missing."); return;
        }
         currentIntroQuizData = { questions, currentQuestionIndex: 0, score: 0, categoryId: catId };
         setupIntroQuizUI();
         displayIntroModalQuestion();
         openModal(quizModal, openingTrigger);
     }

     function setupIntroQuizUI() {
         // Ensure all required elements exist before manipulation
         if (!qModalTitle || !qModalResultsEl || !qModalFeedbackEl || !qModalQuestionEl || !qModalOptionsEl || !qModalProgressTotal || !qModalProgressCurrent || !qModalNextBtn || !qModalNextQuizBtn || !qModalRestartBtn || !qModalCloseResultsBtn || !qModalFullChallengePrompt) {
            console.error("One or more intro quiz modal UI elements are missing. Cannot setup UI.");
             return;
        }

         const firstQuestion = currentIntroQuizData.questions[0];
         qModalTitle.textContent = firstQuestion ? firstQuestion.category : 'Financial Concept Check'; // Set title
         qModalProgressTotal.textContent = currentIntroQuizData.questions.length; // Set total number of questions

         // Reset visibility/content of dynamic areas
         qModalResultsEl.hidden = true; qModalResultsEl.innerHTML = '';
         qModalFeedbackEl.hidden = true; qModalFeedbackEl.innerHTML = '';
         qModalQuestionEl.hidden = false; qModalQuestionEl.innerHTML = 'Loading question...';
         qModalOptionsEl.hidden = false; qModalOptionsEl.innerHTML = '';
         qModalProgressCurrent?.closest('.quiz-modal-progress')?.removeAttribute('hidden'); // Ensure progress bar wrapper visible

         // Hide all navigation buttons initially
         qModalNextBtn.hidden = true;
         qModalNextQuizBtn.hidden = true;
         qModalRestartBtn.hidden = true;
         qModalCloseResultsBtn.hidden = true;
         qModalFullChallengePrompt.hidden = true;
     }

     function displayIntroModalQuestion() {
         if (!qModalQuestionEl || !qModalOptionsEl || !qModalProgressCurrent) return; // Already checked in setup, but safety first

        const quiz = currentIntroQuizData;
        if (quiz.currentQuestionIndex >= quiz.questions.length) {
            showIntroModalResults(); return;
         }

        const q = quiz.questions[quiz.currentQuestionIndex];
        qModalQuestionEl.innerHTML = `<span class="question-number">${quiz.currentQuestionIndex + 1}.</span> ${q.question}`;
        qModalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;
        qModalOptionsEl.innerHTML = ''; // Clear previous options

         q.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-button btn'; // Apply base btn class? Maybe not needed if only using option-button styling
             button.type = 'button';
            button.dataset.index = index;
            button.onclick = () => handleIntroModalOptionSelection(index); // Use arrow fn
            qModalOptionsEl.appendChild(button);
        });

        // Hide feedback & next button from previous question
        if(qModalFeedbackEl) qModalFeedbackEl.hidden = true;
        if(qModalNextBtn) qModalNextBtn.hidden = true;

         // Focus first option
        qModalOptionsEl.querySelector('.option-button')?.focus();
    }

    function handleIntroModalOptionSelection(selectedIndex) {
         const quiz = currentIntroQuizData;
         const q = quiz.questions[quiz.currentQuestionIndex];
         if (!q || !qModalOptionsEl) return;

         const buttons = qModalOptionsEl.querySelectorAll('button');
         buttons.forEach(button => button.disabled = true);

         const isCorrect = selectedIndex === q.correctAnswerIndex;
         if (isCorrect) quiz.score++;

         showIntroModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
     }

    function showIntroModalFeedback(selectedIndex, correctIndex, explanation) {
         const buttons = qModalOptionsEl?.querySelectorAll('button');
         if (!buttons || !qModalFeedbackEl) return;

         // Style selected/correct/other buttons
         buttons.forEach((button, index) => {
             button.classList.remove('correct', 'incorrect'); // Clean up first
            if (index === correctIndex) button.classList.add('correct');
            else if (index === selectedIndex) button.classList.add('incorrect');
             // button.disabled is already true
         });

         // Show feedback text
         qModalFeedbackEl.innerHTML = `<p><strong>${selectedIndex === correctIndex ? 'Correct!' : 'Insight:'}</strong> ${explanation || 'No explanation provided.'}</p>`;
         qModalFeedbackEl.className = `quiz-feedback ${selectedIndex === correctIndex ? 'correct' : 'incorrect'}`;
         qModalFeedbackEl.hidden = false;

         // Reveal 'Next' button or trigger results display
         const quiz = currentIntroQuizData;
         if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
            if(qModalNextBtn) qModalNextBtn.hidden = false;
             qModalNextBtn?.focus();
         } else {
             if(qModalNextBtn) qModalNextBtn.hidden = true;
             setTimeout(showIntroModalResults, 1200); // Delay showing results
         }
     }

    function nextIntroModalQuestion() {
         if (!currentIntroQuizData) return;
         if (qModalFeedbackEl) qModalFeedbackEl.hidden = true;
         if (qModalNextBtn) qModalNextBtn.hidden = true;

         currentIntroQuizData.currentQuestionIndex++;
         displayIntroModalQuestion();
     }

    function showIntroModalResults() {
        // Hide quiz elements
        if (qModalQuestionEl) qModalQuestionEl.hidden = true;
        if (qModalOptionsEl) qModalOptionsEl.hidden = true;
        if (qModalFeedbackEl) qModalFeedbackEl.hidden = true;
        if (qModalNextBtn) qModalNextBtn.hidden = true;
        qModalProgressCurrent?.closest('.quiz-modal-progress')?.setAttribute('hidden', ''); // Hide progress wrapper

         const quiz = currentIntroQuizData;
         if (!qModalResultsEl || !quiz) { console.error("Missing results element or quiz data."); return; }

        const score = quiz.score;
        const total = quiz.questions.length;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
         let feedbackMsg = 'Keep learning!';
         if (percentage === 100) feedbackMsg = 'Excellent work!';
         else if (percentage >= 80) feedbackMsg = 'Great job!';
         else if (percentage >= 50) feedbackMsg = 'Good grasp!';

        qModalResultsEl.innerHTML = `
            <h4>Check Complete!</h4>
            <p>You answered ${score} out of ${total} correctly.</p>
            <p class="quiz-score-percentage">(${percentage}%)</p>
            <p class="quiz-result-message">${feedbackMsg}</p>`;
        qModalResultsEl.hidden = false;

        // Control navigation button visibility
         if (qModalRestartBtn) qModalRestartBtn.hidden = false; // Always show restart
         if (qModalCloseResultsBtn) qModalCloseResultsBtn.hidden = false; // Always show close
        let focusTarget = qModalCloseResultsBtn;

        // Show 'Next Check' or 'Full Challenge' prompt based on category ID
        if (quiz.categoryId && quiz.categoryId < CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (qModalNextQuizBtn) {
                 qModalNextQuizBtn.dataset.nextCategoryId = quiz.categoryId + 1;
                 qModalNextQuizBtn.hidden = false;
                 focusTarget = qModalNextQuizBtn; // Primary action is next quiz
            }
        } else if (quiz.categoryId === CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (qModalFullChallengePrompt) qModalFullChallengePrompt.hidden = false;
             // Focus might stay on close/restart here
        }

        focusTarget?.focus();
    }

    function restartIntroModalQuiz() {
        const catId = currentIntroQuizData.categoryId;
        if (catId) {
            const questions = introQuizQuestions.filter(q => q.categoryId === catId);
             const originalTrigger = triggerElement; // Preserve who opened the *initial* quiz if possible
             // Reset UI elements (redundant with setup, but safe)
             if (qModalResultsEl) qModalResultsEl.hidden = true;
             [qModalNextQuizBtn, qModalRestartBtn, qModalCloseResultsBtn, qModalFullChallengePrompt].forEach(btn => { if (btn) btn.hidden = true; });
             startIntroQuiz(catId, questions, originalTrigger); // Use original trigger if available
        } else {
            console.error("Cannot restart, category ID missing.");
             closeModal();
        }
    }

    function handleIntroNextQuizClick(event) {
         const nextCatId = parseInt(event.currentTarget.dataset.nextCategoryId, 10);
         if (!isNaN(nextCatId) && nextCatId <= CONFIG.LAST_INTRO_CATEGORY_ID) {
             const questions = introQuizQuestions.filter(q => q.categoryId === nextCatId);
             const nextTriggerButton = document.querySelector(`.category-card[data-category-id="${nextCatId}"] .start-quiz-btn`);

             if (questions.length > 0) {
                // Reset UI elements (redundant with setup, but safe)
                 if (qModalResultsEl) qModalResultsEl.hidden = true;
                 [qModalNextQuizBtn, qModalRestartBtn, qModalCloseResultsBtn, qModalFullChallengePrompt].forEach(btn => { if (btn) btn.hidden = true; });
                 startIntroQuiz(nextCatId, questions, nextTriggerButton || triggerElement); // Use new trigger if found
             } else {
                 console.error(`Questions missing for next category: ${nextCatId}`);
                closeModal();
            }
        } else {
             console.error("Invalid next category ID:", event.currentTarget.dataset.nextCategoryId);
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
