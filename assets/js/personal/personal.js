/**
 * File Location: /assets/js/personal/personal.js
 * Description: Scripts for the ROFILID Personal Finance page (personal.html).
 *              Handles navigation, smooth scrolling, modals, forms, animations,
 *              and template interactions specific to this page.
 * Version: 2.6.0 (Improved Structure, Error Handling, Accessibility)
 * Dependencies: Font Awesome (loaded via CSS/HTML)
 */

// Wrap in an IIFE to avoid polluting global scope
(function() {
    'use strict';

    // --- Configuration ---
    const CONFIG = {
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error', 'none'
        ENABLE_SECTION_FADE_IN: true,
        ENABLE_HERO_STATS_ANIMATION: true,
        HEADER_HEIGHT_DEFAULT: 70,
        SCROLL_OFFSET_MARGIN: 20,
        RESIZE_DEBOUNCE_DELAY: 250,
        MODAL_FOCUS_DELAY: 100, // Increased slightly for transition
        API_SIMULATION_DELAY: 1200, // Slightly faster simulation
        PDF_DOWNLOAD_FEEDBACK_DELAY: 2500,
        LAST_INTRO_CATEGORY_ID: 4,
        PDF_FILES: {
            'line-budget': '../../assets/downloads/rofilid-line-item-budget.pdf',
            'networth': '../../assets/downloads/rofilid-net-worth-statement.pdf',
            'cashflow': '../../assets/downloads/rofilid-personal-cashflow.pdf',
            '50-30-20': '../../assets/downloads/rofilid-50-30-20-budget.pdf',
            'expense-tracker': '../../assets/downloads/rofilid-expense-tracker.pdf'
        }
    };

    // --- Logging Utility ---
    const logger = {
        debug: (...args) => CONFIG.LOG_LEVEL === 'debug' && console.debug('[DEBUG]', ...args),
        info: (...args) => ['debug', 'info'].includes(CONFIG.LOG_LEVEL) && console.info('[INFO]', ...args),
        warn: (...args) => ['debug', 'info', 'warn'].includes(CONFIG.LOG_LEVEL) && console.warn('[WARN]', ...args),
        error: (...args) => ['debug', 'info', 'warn', 'error'].includes(CONFIG.LOG_LEVEL) && console.error('[ERROR]', ...args),
    };

    // --- Global State ---
    let activeModal = null;
    let triggerElement = null; // Element that opened the current modal
    let currentIntroQuizData = { questions: [], currentQuestionIndex: 0, score: 0, categoryId: null };
    let resizeTimeoutId = null;
    let currentHeaderHeight = CONFIG.HEADER_HEIGHT_DEFAULT;

    // --- Cached DOM Elements ---
    // Defined within initializePersonalPage after DOM is ready

    // =========================================================================
    // HELPERS
    // =========================================================================

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

    /** Calculate and cache current height of the sticky header */
    function updateHeaderHeight() {
        const headerEl = document.querySelector('.site-header');
        currentHeaderHeight = headerEl?.offsetHeight || CONFIG.HEADER_HEIGHT_DEFAULT;
        logger.debug('Header height updated:', currentHeaderHeight);
    }

    /** Trap focus within a specified element (e.g., modal) */
    function trapFocus(element) {
        if (!element) {
            logger.warn('[trapFocus] Target element is null.');
            return null;
        }
        const focusableEls = Array.from(element.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length)); // Filter only visible elements

        if (focusableEls.length === 0) {
            logger.warn('[trapFocus] No visible focusable elements found inside:', element);
            return null; // No focusable elements
        }

        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        function handleFocusTrapKeydown(e) {
             if (e.key !== 'Tab' || !element.contains(document.activeElement)) {
                 return;
             }

             if (e.shiftKey) { // Shift + Tab
                 if (document.activeElement === firstFocusableEl) {
                     e.preventDefault();
                     logger.debug('[trapFocus] Shift+Tab on first element. Focusing last:', lastFocusableEl);
                     safeFocus(lastFocusableEl);
                 }
             } else { // Tab
                 if (document.activeElement === lastFocusableEl) {
                     e.preventDefault();
                     logger.debug('[trapFocus] Tab on last element. Focusing first:', firstFocusableEl);
                     safeFocus(firstFocusableEl);
                 }
             }
        }

        // Delay focus slightly to allow transitions/rendering
        setTimeout(() => {
            if (activeModal !== element) {
                logger.warn('[trapFocus] Modal changed before focus could be set.');
                return;
            }
            // Prioritize common interactive elements
            const focusTarget =
                element.querySelector('.modal-close-btn:not([hidden])') || // Close button first
                element.querySelector('.btn-primary:not([disabled]):not([hidden])') || // Primary action
                element.querySelector('.btn-secondary:not([disabled]):not([hidden])') || // Secondary action
                element.querySelector('input:not([type="hidden"]):not([disabled]):not([hidden]), select:not([disabled]):not([hidden]), textarea:not([disabled]):not([hidden])') || // First form field
                element.querySelector('.option-button:not([disabled])') || // Quiz option
                firstFocusableEl; // Fallback to the first found focusable element

            if (focusTarget) {
                logger.debug('[trapFocus] Attempting initial focus:', focusTarget);
                safeFocus(focusTarget);
            } else {
                logger.warn("[trapFocus] No suitable initial focus target found within:", element);
            }
        }, CONFIG.MODAL_FOCUS_DELAY);

        // Add listener to the element itself
        element.addEventListener('keydown', handleFocusTrapKeydown);
        logger.debug('[trapFocus] Focus trap initialized for:', element.id);

        // Return the handler for removal
        return handleFocusTrapKeydown;
    }

    /** Safely attempt to focus an element */
    function safeFocus(element) {
        if (element && typeof element.focus === 'function') {
            try {
                element.focus({ preventScroll: true }); // preventScroll is key for modals
            } catch (err) {
                logger.error("[safeFocus] Focusing element failed:", err, element);
            }
        } else {
            logger.warn("[safeFocus] Element is not focusable:", element);
        }
    }

    /** Basic email validation */
    function isValidEmail(email) {
        if (!email) return false;
        // More robust regex
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(String(email).toLowerCase());
    }

    // =========================================================================
    // MODAL LOGIC
    // =========================================================================

    /** Open a modal dialog */
    function openModal(modalElement, openingTriggerElement) {
        logger.debug('[openModal] Attempting to open modal:', modalElement?.id);
        if (!modalElement) {
            logger.error('[openModal] Failed: Target modal element not found.');
            return;
        }
        if (activeModal === modalElement) {
             logger.warn('[openModal] Modal already active:', modalElement.id);
             return;
        }
        // If another modal is active, close it first without returning focus
        if (activeModal) {
            logger.info('[openModal] Closing previously active modal:', activeModal.id);
            closeModal(false); // Close without returning focus
        }

        activeModal = modalElement;
        triggerElement = openingTriggerElement; // Store for focus return

        document.body.style.overflow = 'hidden'; // Prevent background scroll
        modalElement.hidden = false;

        // Add visible class after a frame for transition
        requestAnimationFrame(() => {
            modalElement.classList.add('visible');
            logger.debug('[openModal] Added .visible class to:', modalElement.id);

             // Setup focus trapping *after* modal is potentially visible
             const focusTrapHandler = trapFocus(modalElement);
             if (focusTrapHandler) {
                 modalElement._focusTrapHandler = focusTrapHandler; // Store handler
             } else {
                 logger.warn('[openModal] Focus trapping failed to initialize for:', modalElement.id);
             }
        });

        // Add ESC key listener (scoped to document)
        document.addEventListener('keydown', handleModalKeydown);
        logger.info('[openModal] Modal opened successfully:', modalElement.id);
    }

    /** Close the currently active modal */
    function closeModal(returnFocus = true) {
        if (!activeModal) {
             logger.debug('[closeModal] No active modal to close.');
             return;
        }

        const modalToClose = activeModal;
        const triggerToFocus = triggerElement;
        const focusTrapHandler = modalToClose._focusTrapHandler;

        logger.info('[closeModal] Closing modal:', modalToClose.id);

        activeModal = null;
        triggerElement = null;

        modalToClose.classList.remove('visible');
        document.removeEventListener('keydown', handleModalKeydown); // Remove general ESC listener

        // Remove the specific focus trap listener
        if (focusTrapHandler) {
            modalToClose.removeEventListener('keydown', focusTrapHandler);
            delete modalToClose._focusTrapHandler; // Clean up property
            logger.debug('[closeModal] Removed focus trap listener for:', modalToClose.id);
        }

        // Use transitionend to hide and clean up
        modalToClose.addEventListener('transitionend', () => {
             modalToClose.hidden = true;
             logger.debug('[closeModal] Modal hidden after transition:', modalToClose.id);

             // Restore body scroll only if no other modal became active
             if (!activeModal) {
                document.body.style.overflow = '';
                logger.debug('[closeModal] Restored body scroll.');
             } else {
                 logger.info('[closeModal] Body scroll not restored, another modal is active:', activeModal.id);
             }

            // Reset specific modal forms/states
            // Use optional chaining for safety
            if (modalToClose.id === 'feedback-modal') resetFeedbackForm();
            if (modalToClose.id === 'quiz-modal') resetQuizModalUI();

            // Return focus after modal is hidden and state reset
            if (returnFocus && triggerToFocus) {
                logger.debug('[closeModal] Returning focus to:', triggerToFocus);
                safeFocus(triggerToFocus);
             } else if (returnFocus) {
                 logger.warn('[closeModal] Could not return focus. Trigger element was not stored or is invalid.');
             }

         }, { once: true });
    }

    /** Handle Escape key press for closing modals */
    function handleModalKeydown(event) {
        if (event.key === 'Escape' && activeModal) {
            logger.debug('[handleModalKeydown] Escape key pressed. Closing modal:', activeModal.id);
            closeModal();
        }
    }

    // =========================================================================
    // FORM HANDLING
    // =========================================================================

    function showFormResponseMessage(formElement, message, type = 'success') {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (!responseEl) { logger.warn("Form response element not found for:", formElement?.id); return; }

        responseEl.textContent = message;
        // Ensure base class + type class
        responseEl.className = `form-response-note ${type}`;
        responseEl.hidden = false;
        responseEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        logger.debug(`[Form Response] Shown: ${type} - ${message} for form ${formElement?.id}`);
    }

    function hideFormResponseMessage(formElement) {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (responseEl) {
            responseEl.hidden = true;
            responseEl.textContent = '';
            responseEl.className = 'form-response-note';
            responseEl.removeAttribute('aria-live');
        }
    }

    function clearFormErrors(formElement) {
        if (!formElement) return;
        formElement.querySelectorAll('.form-error-msg').forEach(msg => msg.textContent = '');
        formElement.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
            input.removeAttribute('aria-invalid');
            // Remove aria-describedby only if it points specifically to our error message
            const errorMsgId = input.getAttribute('aria-describedby');
            const errorMsgEl = errorMsgId ? document.getElementById(errorMsgId) : null;
            if (errorMsgEl && errorMsgEl.classList.contains('form-error-msg')) {
                input.removeAttribute('aria-describedby');
            }
        });
        logger.debug(`[Form Validation] Errors cleared for form ${formElement?.id}`);
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
            // Ensure the error message element has an ID and link it
            if (!errorMsgElement.id) {
                errorMsgElement.id = `${inputElement.id || `input-${Math.random().toString(36).substring(7)}`}-error`;
            }
            inputElement.setAttribute('aria-describedby', errorMsgElement.id);
        }
        logger.debug(`[Form Validation] Error shown for input ${inputElement.id}: ${message}`);
    }

    function validateAndGetFormData(formId, fields) {
        const form = document.getElementById(formId);
        if (!form) {
            logger.error(`[Form Validation] Form not found: #${formId}`);
            return { isValid: false, data: null, firstInvalidElement: null };
        }

        clearFormErrors(form);
        let isValid = true;
        let firstInvalidElement = null;
        const formData = {};

        fields.forEach(field => {
            const inputElement = form.querySelector(`#${field.id}`);
            if (!inputElement) {
                logger.warn(`[Form Validation] Input not found for field ID: ${field.id} in form ${formId}`);
                return; // Skip this field if not found
            }

            const value = (inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value.trim());
            formData[field.name] = value; // Store value regardless of validation

            if (field.required && !value && inputElement.type !== 'checkbox') { // Checkboxes being false is often valid
                showInputError(inputElement, field.requiredMessage || `${field.label || 'Field'} is required.`);
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = inputElement;
            } else if (field.validator && !field.validator(value)) {
                showInputError(inputElement, field.errorMessage || `Invalid ${field.label || 'field'}.`);
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = inputElement;
            } else if (field.maxLength && value.length > field.maxLength) {
                showInputError(inputElement, `${field.label || 'Field'} cannot exceed ${field.maxLength} characters.`);
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = inputElement;
            } else if (field.minLength && value.length < field.minLength) {
                showInputError(inputElement, `${field.label || 'Field'} must be at least ${field.minLength} characters.`);
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = inputElement;
            }
        });

        if (!isValid && firstInvalidElement) {
            safeFocus(firstInvalidElement);
        }

        logger.debug(`[Form Validation] Validation result for ${formId}: ${isValid ? 'Valid' : 'Invalid'}`);
        return { isValid, data: formData, firstInvalidElement };
    }

    async function handleFormSubmit(options) {
        const { formId, fields, submitButtonSelector, successMessage, errorMessage, endpointAction } = options;
        event.preventDefault(); // Prevent default submission

        const form = document.getElementById(formId);
        const submitButton = form?.querySelector(submitButtonSelector);
        if (!form || !submitButton) {
            logger.error(`[handleFormSubmit] Form or submit button not found for ${formId}`);
            return;
        }

        const originalButtonHtml = submitButton.innerHTML;
        const validationResult = validateAndGetFormData(formId, fields);

        if (!validationResult.isValid) {
            logger.info(`[handleFormSubmit] Validation failed for ${formId}`);
            return; // Stop submission if validation fails
        }

        // Proceed with submission
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';
        hideFormResponseMessage(form); // Hide previous messages

        // --- API Simulation ---
        logger.info(`[handleFormSubmit] Simulating API call for ${formId} with action ${endpointAction}`, validationResult.data);
        let submissionSuccess = false;
        try {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            const success = Math.random() > 0.1; // ~90% success rate

            if (success) {
                logger.info(`[handleFormSubmit] Simulated submission SUCCESS for ${formId}`);
                showFormResponseMessage(form, successMessage, 'success');
                submissionSuccess = true;
                form.reset(); // Reset form on success
                // Trigger change event for selects after reset if needed (like feedback type)
                form.querySelectorAll('select').forEach(select => {
                    const changeEvent = new Event('change', { bubbles: true });
                    select.dispatchEvent(changeEvent);
                });

                if (options.onSuccess) options.onSuccess(); // Call success callback if provided

                // Optionally close modal after delay
                if (options.closeModalOnSuccess) {
                     setTimeout(() => {
                        if (activeModal && activeModal === form.closest('.modal-overlay')) {
                            closeModal();
                        }
                     }, 2000);
                 } else {
                    // Focus an element outside the form after reset, like the form's heading
                    const heading = form.closest('.modal-content')?.querySelector('h3');
                    safeFocus(heading);
                 }
            } else {
                throw new Error("Simulated server error.");
            }
        } catch (error) {
            logger.error(`[handleFormSubmit] Simulated submission FAILED for ${formId}:`, error);
            showFormResponseMessage(form, errorMessage, 'error');
            // Focus the first field on generic error
            safeFocus(form.querySelector('input, select, textarea'));
            if (options.onError) options.onError(error); // Call error callback
        } finally {
            // Only restore button if submission failed or modal isn't closing
            if (!submissionSuccess || !options.closeModalOnSuccess) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHtml;
            }
        }
        // --- End Simulation ---
    }

    function resetFeedbackForm() {
        const form = document.getElementById('feedback-testimonial-form');
        if (!form) return;
        form.reset();
        clearFormErrors(form);
        hideFormResponseMessage(form);
        // Ensure permission group visibility is reset
        const typeSelect = form.querySelector('#feedback-type');
        if(typeSelect) handleFeedbackTypeChange({ target: typeSelect });
        // Restore button state just in case
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Submit Feedback';
        }
        logger.debug("[resetFeedbackForm] Feedback form reset.");
     }


    // =========================================================================
    // EVENT HANDLERS & SETUP
    // =========================================================================

    function handleMobileNavToggle() {
        const nav = document.getElementById('primary-navigation');
        const toggle = document.querySelector('.mobile-menu-toggle');
        if (!nav || !toggle) return;

        const isExpanded = nav.classList.toggle('active');
        toggle.setAttribute('aria-expanded', String(isExpanded));
        document.body.style.overflow = isExpanded ? 'hidden' : '';

        if (isExpanded) {
            safeFocus(nav.querySelector('a[href], button')); // Focus first link
        } else if (document.activeElement && nav.contains(document.activeElement)) {
            safeFocus(toggle); // Return focus to toggle if it was inside
        }
        logger.debug('Mobile navigation toggled:', isExpanded ? 'Open' : 'Closed');
    }

    function handleSmoothScroll(event) {
        const anchor = event.currentTarget;
        const href = anchor.getAttribute('href');
        if (!href || !href.startsWith('#') || href.length === 1) return;

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            event.preventDefault();
            logger.debug(`[SmoothScroll] Scrolling to: ${href}`);

            // Close mobile nav if open and link is inside it
            const nav = document.getElementById('primary-navigation');
            if (nav?.classList.contains('active') && anchor.closest('#primary-navigation')) {
                handleMobileNavToggle();
            }

            const headerOffset = currentHeaderHeight + CONFIG.SCROLL_OFFSET_MARGIN;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({ top: offsetPosition, behavior: "smooth" });

            // Set focus to the target element after scrolling for accessibility
            setTimeout(() => {
                // Make target focusable if it isn't already
                 if (!targetElement.hasAttribute('tabindex')) {
                    targetElement.setAttribute('tabindex', '-1');
                 }
                safeFocus(targetElement);
            }, 600); // Delay slightly longer for scroll animation

        } else {
            logger.warn(`[SmoothScroll] Target element "${href}" not found.`);
        }
    }

    function handleResize() {
        updateHeaderHeight(); // Update cached header height
        // Close mobile nav on resize to desktop if open
        const nav = document.getElementById('primary-navigation');
        if (window.innerWidth > 991 && nav?.classList.contains('active')) {
            handleMobileNavToggle();
        }
    }

    function handleFeedbackTypeChange(event) {
        const form = document.getElementById('feedback-testimonial-form');
        const permissionGroup = form?.querySelector('.permission-group');
        const permissionCheckbox = permissionGroup?.querySelector('#feedback-permission');
        if (!permissionGroup || !event?.target) return;

        const isTestimonial = event.target.value === 'testimonial';
        permissionGroup.hidden = !isTestimonial;
        if (!isTestimonial && permissionCheckbox) {
             permissionCheckbox.checked = false; // Reset checkbox if type changes
        }
        logger.debug('Feedback type changed. Permission group visible:', isTestimonial);
    }

    // --- Template Interaction Handlers ---
    function handleGetSpreadsheetClick(event) {
        event.preventDefault(); // Prevent default button action
        const button = event.currentTarget;
        const templateName = button.dataset.templateName || 'Spreadsheet';
        const price = Number(button.dataset.price || '0');
        const formattedPrice = price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });

        alert(`Interactive "${templateName}" (${formattedPrice})\n\nThis premium feature is coming soon!\nRequires a Gmail account for delivery.\nThank you for your interest.`);
        logger.info(`Spreadsheet interest registered: ${templateName} (Price: ₦${price})`);
    }

    function handleDownloadPdfClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const card = button.closest('.template-card');
        const templateKey = button.dataset.templateKey;

        if (!card || !templateKey) {
            logger.error("Could not find template card or data-template-key on button:", button);
            alert("Sorry, there was an error initiating the download.");
            return;
        }

        const pdfUrl = CONFIG.PDF_FILES[templateKey];
        const templateName = card.querySelector('h3')?.textContent || 'Template';

        if (!pdfUrl || pdfUrl === '#') {
            alert(`Download is currently unavailable for "${templateName}". Please check back later.`);
            logger.warn(`PDF path invalid/missing for template key: "${templateKey}". Configured URL: ${pdfUrl}`);
            return;
        }

        logger.info(`Initiating PDF download for: ${templateName} (${templateKey}) from ${pdfUrl}`);
        const originalButtonHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> <span>Downloading...</span>';

        try {
            const link = document.createElement('a');
            link.href = pdfUrl;
            const safeName = templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            link.download = `rofilid-${safeName}-template.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Restore button after delay
            setTimeout(() => {
                button.innerHTML = originalButtonHtml;
                button.disabled = false;
            }, CONFIG.PDF_DOWNLOAD_FEEDBACK_DELAY);

        } catch (error) {
            logger.error("PDF Download failed:", error);
            alert(`Sorry, the download for "${templateName}" encountered an error. Please try again later.`);
            button.innerHTML = originalButtonHtml; // Restore immediately on error
            button.disabled = false;
        }
    }

    // --- Animation Setup ---
    function setupAnimations() {
        if (!("IntersectionObserver" in window)) {
            logger.warn("IntersectionObserver not supported. Skipping scroll animations.");
            document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
            return;
        }

        // --- General Fade-In Sections ---
        if (CONFIG.ENABLE_SECTION_FADE_IN) {
            const fadeObserverOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
            const fadeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                        logger.debug('Section faded in:', entry.target.id || entry.target.tagName);
                    }
                });
            }, fadeObserverOptions);
            document.querySelectorAll('#main-content > section:not(#hero)[data-animate-fade-in], #main-content > aside.motivational-quote[data-animate-fade-in]')
                .forEach(section => fadeObserver.observe(section));
        } else {
            document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
        }

        // --- Hero Stats Cards Animation (Staggered) ---
        const heroStatsGrid = document.querySelector('.hero-stats-grid');
        if (CONFIG.ENABLE_HERO_STATS_ANIMATION && heroStatsGrid) {
            const statCards = heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]');
            if (statCards.length > 0) {
                const statsObserverOptions = { threshold: 0.3 };
                const statsObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const card = entry.target;
                            const cardIndex = Array.from(statCards).indexOf(card);
                            const delay = cardIndex * 100; // Stagger delay
                            card.style.transitionDelay = `${delay}ms`;
                            card.classList.add('is-visible');
                            observer.unobserve(card);
                            logger.debug('Hero stat card animated:', cardIndex);
                        }
                    });
                }, statsObserverOptions);
                statCards.forEach(card => statsObserver.observe(card));
            }
        } else if (heroStatsGrid) {
            heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]').forEach(card => card.classList.add('is-visible'));
        }
        logger.info('Animations setup complete.');
    }

    // --- Dynamic Content Update ---
    function updateCopyrightYear() {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    // =========================================================================
    // INTRO QUIZ LOGIC (Learning Hub)
    // =========================================================================
    const introQuizQuestions = [ /* Keep the same 20 questions here */
         // Questions 1-20...
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

    let quizModalElements = {}; // Store cached quiz modal elements

    function cacheQuizModalElements() {
        const quizModal = document.getElementById('quiz-modal');
        if (!quizModal) {
            logger.error("FATAL: Quiz Modal element (#quiz-modal) not found.");
            return false;
        }
        quizModalElements = {
            modal: quizModal,
            title: quizModal.querySelector('#quiz-modal-title'),
            closeBtn: quizModal.querySelector('#quiz-modal-close'),
            questionEl: quizModal.querySelector('#quiz-modal-question'),
            optionsEl: quizModal.querySelector('#quiz-modal-options'),
            feedbackEl: quizModal.querySelector('#quiz-modal-feedback'),
            resultsEl: quizModal.querySelector('#quiz-modal-results'),
            progressCurrent: quizModal.querySelector('#quiz-modal-q-current'),
            progressTotal: quizModal.querySelector('#quiz-modal-q-total'),
            nextBtn: quizModal.querySelector('#quiz-modal-next'),
            nextQuizBtn: quizModal.querySelector('#quiz-modal-next-quiz'),
            restartBtn: quizModal.querySelector('#quiz-modal-restart'),
            closeResultsBtn: quizModal.querySelector('#quiz-modal-close-results'),
            fullChallengePrompt: quizModal.querySelector('#quiz-modal-full-challenge-prompt')
        };

        // Verify crucial elements exist
        const crucialElements = ['title', 'questionEl', 'optionsEl', 'feedbackEl', 'resultsEl', 'progressCurrent', 'progressTotal', 'nextBtn', 'nextQuizBtn', 'restartBtn', 'closeResultsBtn'];
        for (const key of crucialElements) {
            if (!quizModalElements[key]) {
                logger.error(`Quiz modal sub-element missing: ${key}`);
                alert("Error: The quiz interface is incomplete. Please try refreshing the page.");
                return false; // Indicate caching failure
            }
        }
        logger.debug("Quiz modal elements cached successfully.");
        return true;
    }

    function handleIntroQuizStart(event) {
        logger.debug('[handleIntroQuizStart] called by:', event.currentTarget);
        const button = event.currentTarget;
        const card = button.closest('.category-card');
        if (!card) {
            logger.error('[handleIntroQuizStart] Could not find parent .category-card.');
            alert("An error occurred starting the quiz.");
            return;
        }

        const categoryId = parseInt(card.dataset.categoryId, 10);
        if (isNaN(categoryId) || categoryId < 1) {
            logger.error(`[handleIntroQuizStart] Invalid category ID: ${card.dataset.categoryId}`);
            alert("Cannot start quiz due to invalid category.");
            return;
        }
        if (categoryId > CONFIG.LAST_INTRO_CATEGORY_ID) {
            logger.warn(`[handleIntroQuizStart] Category ID ${categoryId} exceeds intro limit.`);
            alert("This quiz might be part of the full challenge. Visit the 'All Quizzes' page.");
            return;
        }

        const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);
        if (categoryQuestions.length === 0) {
            logger.error(`[handleIntroQuizStart] No questions found for category ID: ${categoryId}.`);
            alert("Sorry, questions for this check are unavailable.");
            return;
        }

        logger.debug(`[handleIntroQuizStart] Found ${categoryQuestions.length} questions for category ${categoryId}. Starting quiz...`);
        startIntroQuiz(categoryId, categoryQuestions, button); // Pass button as trigger
    }

     function startIntroQuiz(catId, questions, openingTrigger) {
         logger.info(`[startIntroQuiz] Starting Intro Quiz - Category: ${catId}`);
         if (!quizModalElements.modal) {
             logger.error("[startIntroQuiz] FAILED: Quiz modal DOM element not available.");
             alert("Error: Quiz interface could not be loaded.");
             return;
         }
         if (!questions || questions.length === 0) {
             logger.error("[startIntroQuiz] FAILED: No questions provided for category:", catId);
             alert("Error: No questions available for this quiz check.");
             return;
         }

         currentIntroQuizData = { questions, currentQuestionIndex: 0, score: 0, categoryId: catId };
         logger.debug("[startIntroQuiz] Current quiz data set:", currentIntroQuizData);

         setupIntroQuizUI(); // Prepare UI elements
         displayIntroModalQuestion(); // Display first question

         openModal(quizModalElements.modal, openingTrigger);
     }

     function setupIntroQuizUI() {
         logger.debug("[setupIntroQuizUI] Setting up quiz UI...");
         if (!quizModalElements.modal) return; // Should not happen if caching worked

         const { title, resultsEl, feedbackEl, questionEl, optionsEl, progressTotal, nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt } = quizModalElements;
         const firstQuestion = currentIntroQuizData.questions[0];

         if (title) title.textContent = firstQuestion?.category || 'Financial Concept Check';
         if (progressTotal) progressTotal.textContent = currentIntroQuizData.questions.length;

         // Reset visibility/content
         if (resultsEl) { resultsEl.hidden = true; resultsEl.innerHTML = ''; }
         if (feedbackEl) { feedbackEl.hidden = true; feedbackEl.innerHTML = ''; }
         if (questionEl) { questionEl.hidden = false; questionEl.textContent = 'Loading...'; } // Use textContent
         if (optionsEl) { optionsEl.hidden = false; optionsEl.innerHTML = ''; }

         const progressWrapper = quizModalElements.progressCurrent?.closest('.quiz-modal-progress');
         if (progressWrapper) progressWrapper.removeAttribute('hidden');

         // Hide navigation buttons initially
         [nextBtn, nextQuizBtn, restartBtn, closeResultsBtn].forEach(btn => { if (btn) btn.hidden = true; });
         if (fullChallengePrompt) fullChallengePrompt.hidden = true;

         logger.debug("[setupIntroQuizUI] UI setup complete.");
     }

     function displayIntroModalQuestion() {
         const { questionEl, optionsEl, progressCurrent } = quizModalElements;
         const { questions, currentQuestionIndex } = currentIntroQuizData;
         logger.debug(`[displayIntroModalQuestion] Displaying question index: ${currentQuestionIndex}`);

         if (!questionEl || !optionsEl || !progressCurrent) {
             logger.error("[displayIntroModalQuestion] Missing critical UI elements.");
             return;
         }

         if (currentQuestionIndex >= questions.length) {
             logger.info("[displayIntroModalQuestion] End of questions. Showing results.");
             showIntroModalResults();
             return;
         }

         const q = questions[currentQuestionIndex];
         questionEl.innerHTML = `<span class="question-number">${currentQuestionIndex + 1}.</span> `; // Number span
         questionEl.appendChild(document.createTextNode(q.question)); // Append text node for safety
         progressCurrent.textContent = currentQuestionIndex + 1;
         optionsEl.innerHTML = ''; // Clear previous options

         q.options.forEach((option, index) => {
             const label = document.createElement('label');
             label.className = 'option-label';

             const button = document.createElement('button');
             button.textContent = option; // Use textContent
             button.className = 'option-button';
             button.type = 'button';
             button.dataset.index = index;
             // ARIA roles handled by radiogroup on container and JS updates
             button.onclick = () => handleIntroModalOptionSelection(index);

             label.appendChild(button);
             optionsEl.appendChild(label);
         });

         // Reset feedback and hide next button
         if (quizModalElements.feedbackEl) quizModalElements.feedbackEl.hidden = true;
         if (quizModalElements.nextBtn) quizModalElements.nextBtn.hidden = true;

         // Focus the first option button
         safeFocus(optionsEl.querySelector('.option-button'));
         logger.debug("[displayIntroModalQuestion] Question displayed.");
    }

    function handleIntroModalOptionSelection(selectedIndex) {
        logger.debug(`[handleIntroModalOptionSelection] Option selected: index ${selectedIndex}`);
        const { optionsEl } = quizModalElements;
        const { questions, currentQuestionIndex } = currentIntroQuizData;
        const q = questions[currentQuestionIndex];

        if (!q || !optionsEl) {
            logger.error("[handleIntroModalOptionSelection] Missing question data or options element.");
            return;
        }

        const buttons = optionsEl.querySelectorAll('.option-button');
        buttons.forEach(button => button.disabled = true); // Disable all buttons

        const isCorrect = selectedIndex === q.correctAnswerIndex;
        if (isCorrect) {
            currentIntroQuizData.score++;
            logger.debug(`[handleIntroModalOptionSelection] Correct! Score: ${currentIntroQuizData.score}`);
        } else {
            logger.debug(`[handleIntroModalOptionSelection] Incorrect. Correct answer index: ${q.correctAnswerIndex}`);
        }

        showIntroModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
    }

    function showIntroModalFeedback(selectedIndex, correctIndex, explanation) {
        logger.debug("[showIntroModalFeedback] Displaying feedback.");
        const { optionsEl, feedbackEl, nextBtn } = quizModalElements;
        if (!optionsEl || !feedbackEl) {
            logger.error("[showIntroModalFeedback] Missing options buttons or feedback element.");
            return;
        }

        const buttons = optionsEl.querySelectorAll('.option-button');
        buttons.forEach((button, index) => {
            button.classList.remove('correct', 'incorrect'); // Clean up first
            if (index === correctIndex) button.classList.add('correct');
            else if (index === selectedIndex) button.classList.add('incorrect');
        });

        // Show feedback text using textContent for security
        const feedbackParagraph = document.createElement('p');
        const feedbackStrong = document.createElement('strong');
        feedbackStrong.textContent = selectedIndex === correctIndex ? 'Correct! ' : 'Insight: ';
        feedbackParagraph.appendChild(feedbackStrong);
        feedbackParagraph.appendChild(document.createTextNode(explanation || 'No explanation provided.'));

        feedbackEl.innerHTML = ''; // Clear previous content
        feedbackEl.appendChild(feedbackParagraph);
        feedbackEl.className = `quiz-feedback ${selectedIndex === correctIndex ? 'correct' : 'incorrect'}`;
        feedbackEl.hidden = false;

        // Reveal 'Next' button or show results
        const quiz = currentIntroQuizData;
        if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
            if (nextBtn) {
                nextBtn.hidden = false;
                safeFocus(nextBtn); // Focus the next button
                logger.debug("[showIntroModalFeedback] Next question available.");
            } else { logger.warn("[showIntroModalFeedback] Next button not found."); }
        } else {
            if (nextBtn) nextBtn.hidden = true; // Hide next on last question
            logger.info("[showIntroModalFeedback] Last question. Showing results soon.");
            setTimeout(showIntroModalResults, 1200); // Delay results display
        }
    }

    function nextIntroModalQuestion() {
        logger.debug("[nextIntroModalQuestion] Advancing to next question.");
        if (!currentIntroQuizData) return;
        if (quizModalElements.feedbackEl) quizModalElements.feedbackEl.hidden = true;
        if (quizModalElements.nextBtn) quizModalElements.nextBtn.hidden = true;

        currentIntroQuizData.currentQuestionIndex++;
        displayIntroModalQuestion();
    }

    function showIntroModalResults() {
        logger.info("[showIntroModalResults] Displaying quiz results.");
        const { questionEl, optionsEl, feedbackEl, nextBtn, resultsEl, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt } = quizModalElements;
        const quiz = currentIntroQuizData;

        if (!resultsEl || !quiz) {
            logger.error("[showIntroModalResults] Missing results element or quiz data.");
            closeModal(); // Close if results can't be shown
            return;
        }

        // Hide active quiz elements
        [questionEl, optionsEl, feedbackEl, nextBtn].forEach(el => { if (el) el.hidden = true; });
        const progressWrapper = quizModalElements.progressCurrent?.closest('.quiz-modal-progress');
        if (progressWrapper) progressWrapper.hidden = true; // Hide progress text

        const score = quiz.score;
        const total = quiz.questions.length;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        let feedbackMsg = 'Keep exploring our resources to strengthen your knowledge!';
        if (percentage === 100) feedbackMsg = 'Excellent work! You have a strong understanding.';
        else if (percentage >= 80) feedbackMsg = 'Great job! You\'re building solid financial awareness.';
        else if (percentage >= 50) feedbackMsg = 'Good start! Review the insights to reinforce learning.';

        resultsEl.innerHTML = `
            <h4>Check Complete!</h4>
            <p>You answered ${score} out of ${total} correctly.</p>
            <p class="quiz-score-percentage">(${percentage}%)</p>
            <p class="quiz-result-message">${feedbackMsg}</p>`;
        resultsEl.hidden = false;

        // Control navigation button visibility
        let focusTarget = null;
        if (restartBtn) { restartBtn.hidden = false; focusTarget = restartBtn; }
        if (closeResultsBtn) { closeResultsBtn.hidden = false; focusTarget = closeResultsBtn; } // Close often preferred

        // Show 'Next Check' or 'Full Challenge' prompt
        if (quiz.categoryId && quiz.categoryId < CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (nextQuizBtn) {
                nextQuizBtn.dataset.nextCategoryId = quiz.categoryId + 1;
                nextQuizBtn.hidden = false;
                focusTarget = nextQuizBtn; // Make 'Next Check' primary focus
                logger.debug("[showIntroModalResults] Showing 'Next Check' button.");
            }
        } else if (quiz.categoryId === CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (fullChallengePrompt) {
                fullChallengePrompt.hidden = false;
                logger.debug("[showIntroModalResults] Showing 'Full Challenge' prompt.");
            }
        }

        logger.debug("[showIntroModalResults] Focusing results action button:", focusTarget);
        safeFocus(focusTarget);
    }

    function restartIntroModalQuiz() {
        logger.info("[restartIntroModalQuiz] Restarting current quiz check.");
        const catId = currentIntroQuizData.categoryId;
        if (!catId) {
            logger.error("[restartIntroModalQuiz] Cannot restart, category ID missing.");
            closeModal();
            return;
        }
        const questions = introQuizQuestions.filter(q => q.categoryId === catId);
        // Find original trigger button again
        const originalTrigger = document.querySelector(`.category-card[data-category-id="${catId}"] .start-quiz-btn`);

        if (questions.length > 0) {
            startIntroQuiz(catId, questions, originalTrigger || triggerElement); // Use found button or stored trigger
        } else {
            logger.error(`[restartIntroModalQuiz] Failed to find questions for category ${catId}.`);
            closeModal();
        }
    }

    function handleIntroNextQuizClick(event) {
        logger.debug("[handleIntroNextQuizClick] 'Next Check' button clicked.");
        const button = event.currentTarget;
        const nextCatId = parseInt(button.dataset.nextCategoryId, 10);

        if (!isNaN(nextCatId) && nextCatId <= CONFIG.LAST_INTRO_CATEGORY_ID) {
            const questions = introQuizQuestions.filter(q => q.categoryId === nextCatId);
            const nextTriggerButton = document.querySelector(`.category-card[data-category-id="${nextCatId}"] .start-quiz-btn`);

            if (questions.length > 0) {
                startIntroQuiz(nextCatId, questions, nextTriggerButton || button); // Use next button's trigger if found
            } else {
                logger.error(`[handleIntroNextQuizClick] Questions missing for next category: ${nextCatId}`);
                alert("Error loading the next check. Please close and try starting it manually.");
                closeModal();
            }
        } else {
            logger.error("[handleIntroNextQuizClick] Invalid next category ID:", button.dataset.nextCategoryId);
            alert("Error determining the next check.");
            closeModal();
        }
    }

    /** Minimal reset for Quiz Modal UI (called on close) */
    function resetQuizModalUI() {
        if (!quizModalElements.modal) return;
        const { feedbackEl, resultsEl, optionsEl, questionEl } = quizModalElements;
        if(feedbackEl) feedbackEl.hidden = true;
        if(resultsEl) resultsEl.hidden = true;
        if(optionsEl) optionsEl.innerHTML = '';
        if(questionEl) questionEl.textContent = ''; // Clear question text
        logger.debug("[resetQuizModalUI] Quiz modal UI elements reset.");
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    function setupEventListeners() {
        logger.debug("Setting up event listeners...");

        // Mobile Navigation Toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', handleMobileNavToggle);
        } else { logger.warn("Mobile nav toggle button not found."); }

        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', handleSmoothScroll);
        });

        // Window Resize (Debounced)
        window.addEventListener('resize', debounce(handleResize, CONFIG.RESIZE_DEBOUNCE_DELAY));

        // Modal Closing via Overlay Click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay && activeModal === overlay) {
                    logger.debug('[Overlay Click] Closing modal:', overlay.id);
                    closeModal();
                }
            });
        });

        // Open Feedback Modal Button
        const openFeedbackBtn = document.getElementById('open-feedback-modal-btn');
        const feedbackModal = document.getElementById('feedback-modal');
        if (openFeedbackBtn && feedbackModal) {
            openFeedbackBtn.addEventListener('click', (e) => openModal(feedbackModal, e.currentTarget));
        } else { logger.warn("Open Feedback button or Feedback Modal not found."); }

        // Generic Modal Close Buttons (inside modals)
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                btn.addEventListener('click', () => {
                    logger.debug(`[Close Button Click] Closing modal: ${modal.id}`);
                    closeModal();
                });
            }
        });

        // Template Interaction Buttons
        document.querySelectorAll('.get-spreadsheet-btn').forEach(button => {
            button.addEventListener('click', handleGetSpreadsheetClick);
        });
        document.querySelectorAll('.download-pdf-btn').forEach(button => {
            button.addEventListener('click', handleDownloadPdfClick);
        });

        // Coaching Interest Form
        const coachingInterestForm = document.getElementById('coachingInterestForm');
        if (coachingInterestForm) {
            coachingInterestForm.addEventListener('submit', (e) => handleFormSubmit({
                event: e,
                formId: 'coachingInterestForm',
                fields: [
                    { id: 'interest-email', name: 'email', required: true, validator: isValidEmail, label: 'Email', errorMessage: 'Please enter a valid email address.' }
                ],
                submitButtonSelector: 'button[type="submit"]',
                successMessage: 'Thank you! We\'ll notify you when coaching becomes available.',
                errorMessage: 'Submission failed. Please check your connection and try again.',
                endpointAction: 'coachingInterest', // Example action name
                closeModalOnSuccess: false
            }));
        }

        // Feedback / Testimonial Form
        const feedbackForm = document.getElementById('feedback-testimonial-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => handleFormSubmit({
                event: e, // Pass the event object
                formId: 'feedback-testimonial-form',
                fields: [
                    { id: 'feedback-name', name: 'name' }, // Optional
                    { id: 'feedback-email', name: 'email', validator: (val) => !val || isValidEmail(val), label: 'Email', errorMessage: 'Please enter a valid email or leave blank.' }, // Optional but validate if provided
                    { id: 'feedback-type', name: 'type', required: true, label: 'Type' },
                    { id: 'feedback-message', name: 'message', required: true, label: 'Message', minLength: 10, maxLength: 2000 },
                    { id: 'feedback-permission', name: 'permissionGranted' } // Handled separately based on type
                ],
                submitButtonSelector: 'button[type="submit"]',
                successMessage: 'Feedback submitted successfully. Thank you!',
                errorMessage: 'Submission failed. Please check your connection and try again.',
                endpointAction: 'submitFeedback',
                closeModalOnSuccess: true,
                onSuccess: resetFeedbackForm // Ensure form is reset via callback
            }));

            const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
            if (feedbackTypeSelect) {
                feedbackTypeSelect.addEventListener('change', handleFeedbackTypeChange);
            }
        }

        // Learning Hub Quiz Start Buttons
        const quizStartBtns = document.querySelectorAll('#learning-hub .start-quiz-btn');
        if (quizStartBtns.length > 0) {
            quizStartBtns.forEach(button => button.addEventListener('click', handleIntroQuizStart));
        } else { logger.warn("No quiz start buttons found in #learning-hub."); }

        // Quiz Modal Navigation Buttons (Listeners attached directly in cacheQuizModalElements or here)
        if (quizModalElements.nextBtn) quizModalElements.nextBtn.addEventListener('click', nextIntroModalQuestion);
        if (quizModalElements.restartBtn) quizModalElements.restartBtn.addEventListener('click', restartIntroModalQuiz);
        if (quizModalElements.nextQuizBtn) quizModalElements.nextQuizBtn.addEventListener('click', handleIntroNextQuizClick);
        if (quizModalElements.closeResultsBtn) quizModalElements.closeResultsBtn.addEventListener('click', () => closeModal()); // Simple close

        logger.info("Event listeners setup complete.");
    }


    /** Main Initialization Function */
    function initializePersonalPage() {
        logger.info("Rofilid Personal Page Scripts Initializing (v2.6.0)");

        if (!document.body.classList.contains('personal-page') && !document.documentElement.classList.contains('personal-page')) {
            logger.warn("Not on personal finance page. Exiting script.");
            return; // Exit if not the correct page context
        }

        // Cache quiz modal elements first, as they are crucial
        if (!cacheQuizModalElements()) {
            logger.error("Failed to cache essential quiz modal elements. Functionality may be limited.");
            // Decide whether to proceed or stop initialization
            // For now, let's proceed but quiz functionality will be broken.
        }

        // --- Run Initial Setup Tasks ---
        updateHeaderHeight(); // Initial header height calculation
        updateCopyrightYear();
        setupEventListeners();
        setupAnimations();

        logger.info("Rofilid Personal Page Scripts Fully Loaded and Ready.");
    }

    // --- Run Initialization on DOM Ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePersonalPage);
    } else {
        initializePersonalPage(); // Already loaded
    }

})(); // End IIFE
