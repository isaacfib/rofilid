/**
 * File Location: /assets/js/personal/personal.js
 * Description: Scripts for the ROFILID Personal Finance page (personal.html).
 *              Handles navigation, smooth scrolling, modals, forms, animations,
 *              template interactions (incl. download notification placeholder),
 *              and scrollspy navigation highlighting.
 * Version: 2.8.0 (Added Download Notification Placeholder)
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
        HEADER_HEIGHT_DEFAULT: 70, // Fallback header height
        SCROLL_OFFSET_MARGIN: 50,   // Extra margin for scrollspy trigger
        RESIZE_DEBOUNCE_DELAY: 250, // ms
        MODAL_FOCUS_DELAY: 100,     // ms delay before setting focus in modal
        API_SIMULATION_DELAY: 1200, // ms delay for fake API calls
        PDF_DOWNLOAD_FEEDBACK_DELAY: 2500, // ms delay before restoring download button text
        LAST_INTRO_CATEGORY_ID: 4, // Last category ID considered 'intro'
        PDF_FILES: {
            'line-budget': '../../assets/downloads/rofilid-line-item-budget.pdf',
            'networth': '../../assets/downloads/rofilid-net-worth-statement.pdf',
            'cashflow': '../../assets/downloads/rofilid-personal-cashflow.pdf',
            '50-30-20': '../../assets/downloads/rofilid-50-30-20-budget.pdf',
            'expense-tracker': '../../assets/downloads/rofilid-expense-tracker.pdf'
        },
        // --- Scrollspy Config ---
        SCROLLSPY_SELECTOR: '#primary-navigation .nav-list .nav-link[href^="personal.html#"], #primary-navigation .nav-list .nav-link[href^="#"]',
        SCROLLSPY_ACTIVE_CLASS: 'active-page',
        SCROLLSPY_THROTTLE_DELAY: 100, // ms
        SCROLLSPY_INDICATOR_SELECTOR: '#primary-navigation .nav-indicator',
        // --- NEW: Download Notification ---
        DOWNLOAD_NOTIFICATION_ENDPOINT: '/api/notify-download', // Placeholder Backend Endpoint
    };

    // --- Logging Utility ---
    const logger = {
        debug: (...args) => CONFIG.LOG_LEVEL === 'debug' && console.debug('[ROFILID_DEBUG]', ...args),
        info: (...args) => ['debug', 'info'].includes(CONFIG.LOG_LEVEL) && console.info('[ROFILID_INFO]', ...args),
        warn: (...args) => ['debug', 'info', 'warn'].includes(CONFIG.LOG_LEVEL) && console.warn('[ROFILID_WARN]', ...args),
        error: (...args) => ['debug', 'info', 'warn', 'error'].includes(CONFIG.LOG_LEVEL) && console.error('[ROFILID_ERROR]', ...args),
    };

    // --- Global State ---
    let activeModal = null;       // Reference to the currently open modal overlay element
    let triggerElement = null;    // Element that opened the current modal (for returning focus)
    let currentIntroQuizData = { questions: [], currentQuestionIndex: 0, score: 0, categoryId: null }; // State for the intro quizzes
    let resizeTimeoutId = null;   // ID for debounced resize handler
    let currentHeaderHeight = CONFIG.HEADER_HEIGHT_DEFAULT; // Live calculated header height
    // --- Scrollspy State ---
    let isScrollspyActive = false; // Flag if scrollspy is currently listening
    let scrollspyThrottleTimeout = null; // ID for scrollspy scroll throttling
    let scrollspyElements = { // Cached elements for scrollspy
        links: [],
        sections: [],
        header: null,
        mobileToggle: null,
        navList: null,      // Parent UL/List for relative positioning
        indicator: null     // The moving indicator element
    };
    let quizModalElements = {}; // Cached elements within the quiz modal


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
        const headerEl = scrollspyElements.header || document.querySelector('.site-header'); // Use cached if available
        currentHeaderHeight = headerEl?.offsetHeight || CONFIG.HEADER_HEIGHT_DEFAULT;
        // logger.debug('Header height updated:', currentHeaderHeight);
    }

    /** Trap focus within a specified element (e.g., modal) */
    function trapFocus(element) {
        if (!element) { logger.warn('[trapFocus] Target element is null.'); return null; }

        const focusableEls = Array.from(element.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter(el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));

        if (focusableEls.length === 0) {
            logger.warn('[trapFocus] No visible focusable elements found inside:', element.id || element);
            // Optionally, focus the element itself if it's focusable, or the close button as a last resort
            const closeBtn = element.querySelector('.modal-close-btn');
            if (element.matches('[tabindex]:not([tabindex="-1"])')) safeFocus(element);
            else if (closeBtn) safeFocus(closeBtn);
            return null; // No trapping possible if nothing is focusable
        }

        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        function handleFocusTrapKeydown(e) {
            if (e.key !== 'Tab' || !element.contains(document.activeElement)) { return; }

            if (e.shiftKey) { /* shift + tab */
                if (document.activeElement === firstFocusableEl) {
                    e.preventDefault();
                    logger.debug('[trapFocus] Shift+Tab on first element. Focusing last:', lastFocusableEl);
                    safeFocus(lastFocusableEl);
                }
            } else { /* tab */
                if (document.activeElement === lastFocusableEl) {
                    e.preventDefault();
                    logger.debug('[trapFocus] Tab on last element. Focusing first:', firstFocusableEl);
                    safeFocus(firstFocusableEl);
                }
            }
        }

        // Set initial focus after a short delay
        setTimeout(() => {
            if (activeModal !== element) { logger.warn('[trapFocus] Modal changed before focus could be set.'); return; }
            // Prioritize autofocus, specific elements, or fallback to the first found focusable element
            const autoFocusTarget = element.querySelector('[autofocus]:not([disabled])');
            const firstInput = element.querySelector('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])');
            const primaryButton = element.querySelector('.btn-primary:not([disabled])');
            const secondaryButton = element.querySelector('.btn-secondary:not([disabled])');
            const closeButton = element.querySelector('.modal-close-btn');

            const focusTarget = autoFocusTarget || firstInput || primaryButton || secondaryButton || closeButton || firstFocusableEl;

            if (focusTarget) {
                logger.debug('[trapFocus] Attempting initial focus:', focusTarget);
                safeFocus(focusTarget);
            } else {
                logger.warn("[trapFocus] No suitable initial focus target found within:", element.id || element);
            }
        }, CONFIG.MODAL_FOCUS_DELAY);

        element.addEventListener('keydown', handleFocusTrapKeydown);
        element._focusTrapHandler = handleFocusTrapKeydown; // Store handler reference
        logger.debug('[trapFocus] Focus trap initialized for:', element.id || element);
        return handleFocusTrapKeydown;
    }

    /** Safely attempt to focus an element, preventing scroll jumps */
    function safeFocus(element) {
        if (element && typeof element.focus === 'function') {
            try {
                element.focus({ preventScroll: true });
            } catch (err) {
                logger.error("[safeFocus] Focusing element failed:", err, element);
            }
        } else {
            logger.warn("[safeFocus] Element is null or not focusable:", element);
        }
    }

    /** Basic email validation regex */
    function isValidEmail(email) {
        if (!email) return false;
        // Basic regex, consider a more robust one if needed
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        return emailRegex.test(String(email).toLowerCase());
    }


    // =========================================================================
    // MODAL LOGIC
    // =========================================================================
    /** Open a modal dialog */
    function openModal(modalElement, openingTriggerElement) {
        logger.debug('[openModal] Attempting to open modal:', modalElement?.id);
        if (!modalElement) { logger.error('[openModal] Failed: Target modal element not found.'); return; }
        if (activeModal === modalElement) { logger.warn('[openModal] Modal already active:', modalElement.id); return; }

        if (activeModal) { // Close previous modal if one is open
            logger.info('[openModal] Closing previously active modal:', activeModal.id);
            closeModal(false); // Close previous without returning focus yet
        }

        activeModal = modalElement;
        triggerElement = openingTriggerElement; // Store who opened the modal

        document.body.style.overflow = 'hidden'; // Prevent background scroll
        modalElement.hidden = false;

        // Use rAF to ensure 'hidden' is removed before transition class is added
        requestAnimationFrame(() => {
            modalElement.classList.add('visible'); // Use .visible to trigger CSS transition
            logger.debug('[openModal] Added .visible class to:', modalElement.id);
            trapFocus(modalElement); // Initialize focus trapping *after* modal is potentially visible
        });

        document.addEventListener('keydown', handleModalKeydown); // Add escape key listener
        logger.info('[openModal] Modal opened successfully:', modalElement.id);
    }

    /** Close the currently active modal */
    function closeModal(returnFocus = true) {
        if (!activeModal) { logger.debug('[closeModal] No active modal to close.'); return; }

        const modalToClose = activeModal;
        const triggerToFocus = triggerElement; // Capture before resetting
        const focusTrapHandler = modalToClose._focusTrapHandler; // Get stored trap handler

        logger.info('[closeModal] Closing modal:', modalToClose.id);

        // --- Cleanup ---
        document.removeEventListener('keydown', handleModalKeydown); // Remove Escape listener
        if (focusTrapHandler) {
            modalToClose.removeEventListener('keydown', focusTrapHandler); // Remove trap listener
            delete modalToClose._focusTrapHandler; // Clean up property
            logger.debug('[closeModal] Removed focus trap listener for:', modalToClose.id);
        }
        activeModal = null; // Set global state to null early
        triggerElement = null; // Clear trigger reference

        modalToClose.classList.remove('visible'); // Trigger closing animation

        // --- Handle cleanup after transition ---
        modalToClose.addEventListener('transitionend', function handleTransitionEnd(event) {
            if (event.target === modalToClose && event.propertyName === 'opacity') { // Listen specifically for opacity transition
                modalToClose.hidden = true; // Hide from AT after transition
                logger.debug('[closeModal] Modal hidden after transition:', modalToClose.id);

                if (!activeModal) { // Only restore scroll if no *other* modal was opened during transition
                    document.body.style.overflow = '';
                    logger.debug('[closeModal] Restored body scroll.');
                } else {
                    logger.info('[closeModal] Body scroll not restored, another modal is active:', activeModal.id);
                }

                // Reset specific modals
                if (modalToClose.id === 'feedback-modal') resetFeedbackForm();
                if (modalToClose.id === 'quiz-modal') resetQuizModalUI();

                // Return focus
                if (returnFocus && triggerToFocus && document.body.contains(triggerToFocus)) {
                    logger.debug('[closeModal] Returning focus to:', triggerToFocus);
                    safeFocus(triggerToFocus);
                } else if (returnFocus) {
                    logger.warn('[closeModal] Could not return focus. Trigger element missing or invalid.');
                    // Fallback: focus body or main content
                    safeFocus(document.querySelector('#main-content') || document.body);
                }
                // Listener removes itself via { once: true }
            }
        }, { once: true }); // Auto-remove listener after first opacity transitionend

        // Fallback timer (just in case transitionend doesn't fire)
        setTimeout(() => {
             if (modalToClose && modalToClose.parentNode && !modalToClose.hidden && !modalToClose.classList.contains('visible')) {
                  logger.warn('[closeModal Fallback] TransitionEnd did not fire for', modalToClose.id, '- forcing cleanup.');
                  modalToClose.hidden = true;
                  if (!activeModal) document.body.style.overflow = '';
                  if (modalToClose.id === 'feedback-modal') resetFeedbackForm();
                  if (modalToClose.id === 'quiz-modal') resetQuizModalUI();
                  if (returnFocus && triggerToFocus && document.body.contains(triggerToFocus)) safeFocus(triggerToFocus);
                  else if (returnFocus) safeFocus(document.querySelector('#main-content') || document.body);
             }
        }, 500); // Should be > CSS transition duration
    }

    /** Handle Escape key press for closing modals */
    function handleModalKeydown(event) {
        if (event.key === 'Escape' && activeModal) {
            logger.debug('[handleModalKeydown] Escape pressed. Closing modal:', activeModal.id);
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
        responseEl.className = `form-response-note ${type}`; // Use type as class
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
        formElement.querySelectorAll('.form-error-msg').forEach(msg => { msg.textContent = ''; msg.hidden = true; }); // Hide message
        formElement.querySelectorAll('[aria-invalid="true"]').forEach(input => {
            input.removeAttribute('aria-invalid');
            input.classList.remove('is-invalid'); // Optional visual class removal
            const describedBy = input.getAttribute('aria-describedby')?.split(' ') || [];
            const errorMsgId = describedBy.find(id => document.getElementById(id)?.classList.contains('form-error-msg'));
            if (errorMsgId) {
                const newDescribedBy = describedBy.filter(id => id !== errorMsgId).join(' ');
                if (newDescribedBy) input.setAttribute('aria-describedby', newDescribedBy);
                else input.removeAttribute('aria-describedby');
            }
        });
        logger.debug(`[Form Validation] Errors cleared for form ${formElement?.id}`);
    }
    function showInputError(inputElement, message) {
        if (!inputElement) return;
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorMsgElement = formGroup.querySelector('.form-error-msg');

        inputElement.setAttribute('aria-invalid', 'true');
        inputElement.classList.add('is-invalid'); // Optional visual class

        if (errorMsgElement) {
            errorMsgElement.textContent = message;
            errorMsgElement.hidden = false;
            if (!errorMsgElement.id) {
                errorMsgElement.id = `${inputElement.id || inputElement.name}-error-${Date.now()}`; // Ensure unique ID
            }
            const currentDescribedBy = inputElement.getAttribute('aria-describedby') || '';
            if (!currentDescribedBy.includes(errorMsgElement.id)) {
                inputElement.setAttribute('aria-describedby', `${currentDescribedBy} ${errorMsgElement.id}`.trim());
            }
        }
        logger.debug(`[Form Validation] Error shown for input ${inputElement.id || inputElement.name}: ${message}`);
    }
    function validateAndGetFormData(formId, fields) {
        const form = document.getElementById(formId);
        if (!form) { logger.error(`[Form Validation] Form not found: #${formId}`); return { isValid: false, data: null, firstInvalidElement: null }; }

        clearFormErrors(form);
        let isValid = true;
        let firstInvalidElement = null;
        const formData = {};

        fields.forEach(field => {
            const inputElement = form.querySelector(`#${field.id}`);
            if (!inputElement) { logger.warn(`[Form Validation] Input not found: #${field.id}`); return; }

            const value = (inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value.trim());
            formData[field.name] = value;
            let fieldValid = true;
            let errorMessage = '';

            // Validation checks
            if (field.required && !value && inputElement.type !== 'checkbox') {
                errorMessage = field.requiredMessage || `${field.label || 'Field'} is required.`;
                fieldValid = false;
            } else if (inputElement.type === 'email' && value && !isValidEmail(value)) {
                 errorMessage = field.errorMessage || `Please enter a valid email address.`;
                 fieldValid = false;
            } else if (field.validator && value && !field.validator(value)) { // Only run validator if value exists
                errorMessage = field.errorMessage || `Invalid ${field.label || 'field'}.`;
                fieldValid = false;
            } else if (field.maxLength && value && value.length > field.maxLength) {
                errorMessage = field.errorMessage || `${field.label || 'Field'} cannot exceed ${field.maxLength} characters.`;
                fieldValid = false;
            } else if (field.minLength && value && value.length < field.minLength) {
                errorMessage = field.errorMessage || `${field.label || 'Field'} must be at least ${field.minLength} characters.`;
                fieldValid = false;
            }

            if (!fieldValid) {
                isValid = false;
                showInputError(inputElement, errorMessage);
                if (!firstInvalidElement) firstInvalidElement = inputElement;
            }
        });

        if (!isValid && firstInvalidElement) { safeFocus(firstInvalidElement); }
        logger.debug(`[Form Validation] Result for ${formId}: ${isValid ? 'Valid' : 'Invalid'}`);
        return { isValid, data: formData, firstInvalidElement };
    }
    async function handleFormSubmit(options) {
        const { formId, fields, submitButtonSelector, successMessage, errorMessage, endpointAction, event, onSuccess, onError, closeModalOnSuccess } = options;
        if (event) event.preventDefault(); // Prevent default submit

        const form = document.getElementById(formId);
        const submitButton = form?.querySelector(submitButtonSelector);
        if (!form || !submitButton) { logger.error(`[handleFormSubmit] Form or submit button missing for ${formId}`); return; }

        const originalButtonHtml = submitButton.innerHTML;
        const validationResult = validateAndGetFormData(formId, fields);

        if (!validationResult.isValid) {
            logger.info(`[handleFormSubmit] Validation failed for ${formId}`);
            showFormResponseMessage(form, "Please correct the errors highlighted below.", 'error');
            return;
        }

        // --- Start Submission State ---
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';
        hideFormResponseMessage(form); // Clear previous messages
        logger.info(`[handleFormSubmit] Submitting form ${formId} (Action: ${endpointAction}). Data:`, validationResult.data);

        let submissionSuccess = false;
        try {
            // *** SIMULATED API Call ***
            // Replace this section with your actual fetch/XHR call to the backend endpoint
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            const simulatedSuccess = Math.random() > 0.1; // ~90% success
            if (simulatedSuccess) {
                 logger.info(`[handleFormSubmit] Simulated submission SUCCESS for ${formId}`);
                 submissionSuccess = true;
            } else {
                 throw new Error("Simulated API error. Please try again.");
            }
            // *** End SIMULATED API Call ***

            // --- Handle Success ---
            showFormResponseMessage(form, successMessage, 'success');
            form.reset();
            form.querySelectorAll('select').forEach(s => s.dispatchEvent(new Event('change'))); // Trigger change on selects after reset
            if (onSuccess) onSuccess(); // Call success callback

            if (closeModalOnSuccess) {
                 setTimeout(() => {
                     const modal = form.closest('.modal-overlay');
                     if (activeModal === modal) closeModal(); // Close *this* modal
                 }, 2000); // Delay before closing
             } else {
                 // If not closing, restore button state and focus form/heading
                 submitButton.disabled = false;
                 submitButton.innerHTML = originalButtonHtml;
                 safeFocus(form.querySelector('h3, h2') || form);
             }

        } catch (error) {
            // --- Handle Failure ---
            logger.error(`[handleFormSubmit] Submission FAILED for ${formId}:`, error);
            showFormResponseMessage(form, errorMessage || error.message || 'An unexpected error occurred.', 'error');
            safeFocus(validationResult.firstInvalidElement || form.querySelector('input:not([type="hidden"]), select, textarea, button')); // Focus first invalid or any input/button
            if (onError) onError(error); // Call error callback
            // Restore button state on error
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonHtml;
        }
        // No finally block needed here as button state is handled within success/error paths based on closeModalOnSuccess
    }
    function resetFeedbackForm() {
        const form = document.getElementById('feedback-testimonial-form');
        if (!form) return;
        form.reset();
        clearFormErrors(form);
        hideFormResponseMessage(form);
        const typeSelect = form.querySelector('#feedback-type');
        const permissionGroup = form.querySelector('.permission-group');
        if (permissionGroup) permissionGroup.hidden = true; // Ensure hidden on reset
        if (typeSelect) handleFeedbackTypeChange({ target: typeSelect }); // Reflect reset in UI
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Submit Feedback';
        }
        logger.debug("[resetFeedbackForm] Feedback form reset.");
    }


    // =========================================================================
    // INTRO QUIZ LOGIC (Learning Hub)
    // =========================================================================
    const introQuizQuestions = [ // Assume correct structure as provided previously
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
    function cacheQuizModalElements() {
        const quizModal = document.getElementById('quiz-modal');
        if (!quizModal) { logger.error("FATAL: Quiz Modal element (#quiz-modal) not found."); return false; }
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
            progressWrapper: quizModal.querySelector('.quiz-modal-progress'), // Cache wrapper
            nextBtn: quizModal.querySelector('#quiz-modal-next'),
            nextQuizBtn: quizModal.querySelector('#quiz-modal-next-quiz'),
            restartBtn: quizModal.querySelector('#quiz-modal-restart'),
            closeResultsBtn: quizModal.querySelector('#quiz-modal-close-results'),
            fullChallengePrompt: quizModal.querySelector('#quiz-modal-full-challenge-prompt')
        };
        const crucialKeys = ['modal', 'title', 'questionEl', 'optionsEl', 'feedbackEl', 'resultsEl', 'progressCurrent', 'progressTotal', 'nextBtn', 'nextQuizBtn', 'restartBtn', 'closeResultsBtn'];
        const allFound = crucialKeys.every(key => !!quizModalElements[key]);
        if (!allFound) logger.error(`[cacheQuizModalElements] Some crucial quiz sub-elements are missing.`);
        else logger.debug("Quiz modal elements cached successfully.");
        return allFound;
    }
    function handleIntroQuizStart(event) {
        logger.debug('[handleIntroQuizStart] called by:', event.currentTarget);
        const button = event.currentTarget;
        const card = button.closest('.category-card');
        if (!card) { logger.error('[handleIntroQuizStart] Could not find parent .category-card.'); /* Consider user feedback */ return; }

        const categoryId = parseInt(card.dataset.categoryId, 10);
        if (isNaN(categoryId) || categoryId < 1) { logger.error(`[handleIntroQuizStart] Invalid category ID: ${card.dataset.categoryId}`); /* User feedback? */ return; }

        // Check against actual intro quiz questions available
        const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);
        if (categoryQuestions.length === 0) {
            logger.error(`[handleIntroQuizStart] No questions found for category ID: ${categoryId}.`);
             /* User feedback needed */
             alert(`Sorry, questions for the '${card.querySelector('h4')?.textContent || 'selected check'}' are currently unavailable.`);
             return;
        }

        logger.debug(`[handleIntroQuizStart] Found ${categoryQuestions.length} questions for category ${categoryId}. Starting quiz...`);
        startIntroQuiz(categoryId, categoryQuestions, button);
    }
    function startIntroQuiz(catId, questions, openingTrigger) {
         logger.info(`[startIntroQuiz] Starting Intro Quiz - Category: ${catId}`);
         if (!quizModalElements.modal || !cacheQuizModalElements()) { // Re-cache/check elements
             logger.error("[startIntroQuiz] FAILED: Quiz modal elements not available.");
             alert("Error: Quiz interface could not be loaded. Please refresh the page.");
             return;
         }
         if (!questions || questions.length === 0) {
             logger.error("[startIntroQuiz] FAILED: No questions provided for category:", catId);
             alert("Error: No questions available for this quiz check.");
             return;
         }

         currentIntroQuizData = { questions, currentQuestionIndex: 0, score: 0, categoryId: catId };
         logger.debug("[startIntroQuiz] Current quiz data set:", currentIntroQuizData);
         setupIntroQuizUI();
         displayIntroModalQuestion();
         openModal(quizModalElements.modal, openingTrigger); // Pass the element that triggered the modal
     }
    function setupIntroQuizUI() {
         logger.debug("[setupIntroQuizUI] Setting up quiz UI...");
         if (!quizModalElements.modal) { logger.error("setupIntroQuizUI called before caching elements"); return; }
         const { title, resultsEl, feedbackEl, questionEl, optionsEl, progressTotal, nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt, progressWrapper } = quizModalElements;
         const firstQuestion = currentIntroQuizData.questions[0];

         if (title) title.textContent = firstQuestion?.category || 'Financial Concept Check';
         if (progressTotal) progressTotal.textContent = currentIntroQuizData.questions.length;
         if (resultsEl) { resultsEl.hidden = true; resultsEl.innerHTML = ''; }
         if (feedbackEl) { feedbackEl.hidden = true; feedbackEl.textContent = ''; feedbackEl.className = 'quiz-feedback';} // Clear class
         if (questionEl) { questionEl.hidden = false; questionEl.textContent = 'Loading...'; }
         if (optionsEl) { optionsEl.hidden = false; optionsEl.innerHTML = ''; optionsEl.removeAttribute('aria-disabled'); } // Ensure options are enabled
         if (progressWrapper) progressWrapper.hidden = false;

         // Hide all navigation buttons and prompt
         [nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt].forEach(el => { if (el) el.hidden = true; });

         logger.debug("[setupIntroQuizUI] UI setup complete.");
     }
    function displayIntroModalQuestion() {
         const { questionEl, optionsEl, progressCurrent, feedbackEl, nextBtn } = quizModalElements;
         const { questions, currentQuestionIndex } = currentIntroQuizData;
         logger.debug(`[displayIntroModalQuestion] Displaying question index: ${currentQuestionIndex}`);
         if (!questionEl || !optionsEl || !progressCurrent) { logger.error("[displayIntroModalQuestion] Missing critical UI elements."); return; }
         if (currentQuestionIndex >= questions.length) { logger.info("[displayIntroModalQuestion] End of questions reached."); showIntroModalResults(); return; }

         const q = questions[currentQuestionIndex];
         questionEl.innerHTML = `<span class="question-number">${currentQuestionIndex + 1}.</span> ${q.question}`; // Use textContent for safety if needed
         progressCurrent.textContent = currentQuestionIndex + 1;
         optionsEl.innerHTML = ''; // Clear previous options
         optionsEl.removeAttribute('aria-disabled'); // Ensure enabled

         // Create and append buttons
         q.options.forEach((option, index) => {
             // Using button directly as the interactive element
             const button = document.createElement('button');
             button.textContent = option;
             button.className = 'quiz-option-btn'; // Updated class name
             button.type = 'button';
             button.dataset.index = index;
             // Set ARIA role implicitly if using button, otherwise role="radio" on a div might be needed if using non-button elements
             // Attach click listener using arrow function
             button.onclick = () => handleIntroModalOptionSelection(index);
             optionsEl.appendChild(button);
         });

         if (feedbackEl) feedbackEl.hidden = true;
         if (nextBtn) nextBtn.hidden = true;

         // Focus the first option button
         safeFocus(optionsEl.querySelector('.quiz-option-btn'));
         logger.debug("[displayIntroModalQuestion] Question displayed.");
    }
    function handleIntroModalOptionSelection(selectedIndex) {
        logger.debug(`[handleIntroModalOptionSelection] Option selected: index ${selectedIndex}`);
        const { optionsEl } = quizModalElements;
        const { questions, currentQuestionIndex } = currentIntroQuizData;
        const q = questions[currentQuestionIndex];
        if (!q || !optionsEl) { logger.error("[handleIntroModalOptionSelection] Missing question or options element."); return; }

        // Disable all option buttons and set aria-disabled on the container
        optionsEl.setAttribute('aria-disabled', 'true');
        const buttons = optionsEl.querySelectorAll('.quiz-option-btn');
        buttons.forEach(button => button.disabled = true);

        // Check correctness and update score
        const isCorrect = selectedIndex === q.correctAnswerIndex;
        if (isCorrect) currentIntroQuizData.score++;
        logger.debug(`[handleIntroModalOptionSelection] Result: ${isCorrect ? 'Correct' : 'Incorrect'}. Score: ${currentIntroQuizData.score}`);

        // Show feedback and determine next step
        showIntroModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
    }
    function showIntroModalFeedback(selectedIndex, correctIndex, explanation) {
        logger.debug("[showIntroModalFeedback] Displaying feedback.");
        const { optionsEl, feedbackEl, nextBtn } = quizModalElements;
        if (!optionsEl || !feedbackEl) { logger.error("[showIntroModalFeedback] Missing options or feedback element."); return; }

        const buttons = optionsEl.querySelectorAll('.quiz-option-btn');
        const isCorrect = selectedIndex === correctIndex;

        // Apply styling classes to buttons
        buttons.forEach((button, index) => {
            button.classList.remove('correct', 'incorrect');
            if (index === correctIndex) button.classList.add('correct');
            else if (index === selectedIndex) button.classList.add('incorrect');
            // Ensure buttons remain visually disabled but focusable if needed (handled by disable attribute mostly)
        });

        // Construct and display feedback message
        const feedbackPrefix = isCorrect ? 'Correct!' : 'Insight:';
        feedbackEl.innerHTML = `<strong>${feedbackPrefix}</strong> ${explanation || 'Review the options.'}`; // Simpler structure
        feedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackEl.hidden = false;

        // Focus feedback for screen readers if desired, or just rely on aria-live
        // safeFocus(feedbackEl); // Optional: uncomment to force focus to feedback

        // Show 'Next Question' button or trigger results
        const quiz = currentIntroQuizData;
        if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
            if (nextBtn) {
                 nextBtn.hidden = false;
                 safeFocus(nextBtn); // Focus the next button now
                 logger.debug("[showIntroModalFeedback] Next question available.");
             } else logger.warn("[showIntroModalFeedback] Next button not found.");
        } else {
            logger.info("[showIntroModalFeedback] Last question answered. Showing results soon.");
            if (nextBtn) nextBtn.hidden = true; // Ensure 'Next' is hidden on last question
            setTimeout(showIntroModalResults, 1500); // Show results after delay
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
        const { questionEl, optionsEl, feedbackEl, nextBtn, resultsEl, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt, progressWrapper } = quizModalElements;
        const quiz = currentIntroQuizData;
        if (!resultsEl || !quiz) { logger.error("[showIntroModalResults] Cannot display results: Missing element or quiz data."); closeModal(); return; }

        // Hide question/options/feedback/next/progress areas
        [questionEl, optionsEl, feedbackEl, nextBtn, progressWrapper].forEach(el => { if (el) el.hidden = true; });

        // Calculate and display results
        const score = quiz.score; const total = quiz.questions.length; const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        let feedbackMsg = 'Keep exploring our resources to strengthen your knowledge!';
        if (percentage === 100) feedbackMsg = 'Excellent work! You have a strong understanding.';
        else if (percentage >= 80) feedbackMsg = 'Great job! You\'re building solid financial awareness.';
        else if (percentage >= 50) feedbackMsg = 'Good start! Review the insights to reinforce learning.';

        resultsEl.innerHTML = `
            <h4>Check Complete!</h4>
            <p>You answered ${score} out of ${total} correctly.</p>
            <p class="quiz-score-percentage">(${percentage}%)</p>
            <p class="quiz-result-message">${feedbackMsg}</p>
        `;
        resultsEl.hidden = false;

        // Show relevant action buttons and prompt
        let focusTarget = null;
        if (restartBtn) { restartBtn.hidden = false; focusTarget = restartBtn; }
        if (closeResultsBtn) { closeResultsBtn.hidden = false; focusTarget = focusTarget || closeResultsBtn; } // Default focus

        const nextCategoryId = quiz.categoryId + 1;
        if (quiz.categoryId && nextCategoryId <= CONFIG.LAST_INTRO_CATEGORY_ID) {
            const nextCategoryExists = introQuizQuestions.some(q => q.categoryId === nextCategoryId);
             if (nextQuizBtn && nextCategoryExists) {
                nextQuizBtn.dataset.nextCategoryId = nextCategoryId; // Store next ID
                nextQuizBtn.hidden = false;
                focusTarget = nextQuizBtn; // Prioritize 'Next Check'
                logger.debug("[showIntroModalResults] Showing 'Next Check' button.");
             }
        } else if (quiz.categoryId === CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (fullChallengePrompt) {
                 fullChallengePrompt.hidden = false;
                 // Optionally focus link: focusTarget = fullChallengePrompt.querySelector('a') || focusTarget;
                 logger.debug("[showIntroModalResults] Showing 'Full Challenge' prompt.");
            }
        }

        logger.debug("[showIntroModalResults] Focusing results action:", focusTarget);
        safeFocus(focusTarget);
    }
    function restartIntroModalQuiz() {
        logger.info("[restartIntroModalQuiz] Restarting current quiz check.");
        const catId = currentIntroQuizData.categoryId;
        if (!catId) { logger.error("[restartIntroModalQuiz] Cannot restart, category ID missing."); closeModal(); return; }
        const questions = introQuizQuestions.filter(q => q.categoryId === catId);
        const originalTrigger = document.querySelector(`.category-card[data-category-id="${catId}"] .start-quiz-btn`);

        if (questions.length > 0) {
            startIntroQuiz(catId, questions, originalTrigger || triggerElement); // Reuse original trigger if found
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
                startIntroQuiz(nextCatId, questions, nextTriggerButton || button);
            } else {
                logger.error(`[handleIntroNextQuizClick] Questions missing for next category: ${nextCatId}`);
                alert("Error loading the next check. Please close and try again manually.");
                closeModal();
            }
        } else {
            logger.error("[handleIntroNextQuizClick] Invalid next category ID:", button.dataset.nextCategoryId);
            alert("Error determining the next check.");
            closeModal();
        }
    }
    function resetQuizModalUI() {
        if (!quizModalElements.modal) return;
        const { feedbackEl, resultsEl, optionsEl, questionEl, progressWrapper, nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt, title } = quizModalElements;
        if(feedbackEl) { feedbackEl.hidden = true; feedbackEl.className = 'quiz-feedback'; feedbackEl.textContent = '';}
        if(resultsEl) { resultsEl.hidden = true; resultsEl.innerHTML = ''; }
        if(optionsEl) { optionsEl.innerHTML = ''; optionsEl.removeAttribute('aria-disabled'); }
        if(questionEl) questionEl.textContent = '';
        if(title) title.textContent = 'Financial Concept Check';
        if(progressWrapper) progressWrapper.hidden = true;
        [nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt].forEach(el => { if (el) el.hidden = true; });
        logger.debug("[resetQuizModalUI] Quiz modal UI elements reset.");
    }


    // =========================================================================
    // SCROLLSPY LOGIC
    // =========================================================================
    function setupScrollspy() {
        scrollspyElements.links = Array.from(document.querySelectorAll(CONFIG.SCROLLSPY_SELECTOR));
        scrollspyElements.header = document.querySelector('.site-header');
        scrollspyElements.mobileToggle = document.querySelector('.mobile-menu-toggle');
        scrollspyElements.navList = document.querySelector('#primary-navigation');
        scrollspyElements.indicator = scrollspyElements.navList?.querySelector(CONFIG.SCROLLSPY_INDICATOR_SELECTOR);

        if (!scrollspyElements.links.length || !scrollspyElements.header || !scrollspyElements.mobileToggle || !scrollspyElements.navList || !scrollspyElements.indicator) {
            logger.warn("Scrollspy setup failed: Missing elements. Disabling feature.");
            scrollspyElements = { links: [], sections: [], header: null, mobileToggle: null, navList: null, indicator: null };
            return;
        }

        scrollspyElements.sections = scrollspyElements.links
            .map(link => {
                try {
                    const href = link.getAttribute('href');
                    let targetId = null;
                    if (href?.startsWith('personal.html#')) targetId = href.substring(href.lastIndexOf('#') + 1);
                    else if (href?.startsWith('#') && href.length > 1) targetId = href.substring(1);

                    const section = targetId ? document.getElementById(targetId) : null;
                    return section ? { link: link, section: section } : null;
                } catch (e) { logger.error('[Scrollspy Setup] Error processing link', link, e); return null; }
            })
            .filter(item => item !== null);

        if (!scrollspyElements.sections.length) {
            logger.warn('Scrollspy setup failed: No corresponding sections found for nav links.');
            scrollspyElements = { links: [], sections: [], header: null, mobileToggle: null, navList: null, indicator: null };
            return;
        }

        logger.info(`Scrollspy setup complete. Monitoring ${scrollspyElements.sections.length} sections.`);
        updateHeaderHeight(); // Ensure header height is known
        checkAndAttachScrollspyListener(); // Initial check & attach
    }
    function updateScrollspyActiveLink() {
        if (!scrollspyElements.sections.length || !scrollspyElements.header || !scrollspyElements.navList || !scrollspyElements.indicator || !isScrollspyActive) return; // Only run if active

        const headerHeight = scrollspyElements.header.offsetHeight;
        const scrollOffset = window.scrollY + headerHeight + CONFIG.SCROLL_OFFSET_MARGIN;
        let currentSectionData = null;

        // Find the active section
        // Iterate through sections, the last one whose top is above the scrollOffset is active
        for (const sectionData of scrollspyElements.sections) {
             if (sectionData.section.offsetTop <= scrollOffset) {
                 currentSectionData = sectionData;
                 // Don't break, continue checking further down sections
             } else {
                 // Optimization: if a section's top is below offset, subsequent sections will also be
                 break;
             }
        }

        // Edge case: If near bottom, activate the last section link
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
            currentSectionData = scrollspyElements.sections[scrollspyElements.sections.length - 1];
        }

        const activeLinkElement = currentSectionData ? currentSectionData.link : null;

        // --- Update Link Classes ---
        scrollspyElements.links.forEach(link => {
            link.classList.toggle(CONFIG.SCROLLSPY_ACTIVE_CLASS, link === activeLinkElement);
        });

        // --- Update Indicator ---
        if (activeLinkElement) {
            try {
                const navListRect = scrollspyElements.navList.getBoundingClientRect();
                const linkRect = activeLinkElement.getBoundingClientRect();
                const indicatorLeft = linkRect.left - navListRect.left + scrollspyElements.navList.scrollLeft;
                const indicatorWidth = linkRect.width;

                scrollspyElements.indicator.style.left = `${indicatorLeft}px`;
                scrollspyElements.indicator.style.width = `${indicatorWidth}px`;
                scrollspyElements.indicator.style.opacity = '1';
            } catch (error) {
                 logger.error('[Scrollspy Indicator] Error calculating position:', error);
                 scrollspyElements.indicator.style.opacity = '0'; // Hide indicator on error
            }
        } else {
            scrollspyElements.indicator.style.opacity = '0'; // No active link, hide indicator
        }
    }
    function handleScrollspyScroll() {
        if (!scrollspyThrottleTimeout && isScrollspyActive) {
            updateScrollspyActiveLink();
            scrollspyThrottleTimeout = setTimeout(() => {
                scrollspyThrottleTimeout = null;
            }, CONFIG.SCROLLSPY_THROTTLE_DELAY);
        }
    }
    function checkAndAttachScrollspyListener() {
        if (!scrollspyElements.mobileToggle || !scrollspyElements.sections.length || !scrollspyElements.indicator) {
            // Ensure cleanup if elements are missing
            if (isScrollspyActive) { window.removeEventListener('scroll', handleScrollspyScroll); isScrollspyActive = false; }
             if (scrollspyElements.indicator) scrollspyElements.indicator.style.opacity = '0';
             return;
        }

        const isDesktopView = getComputedStyle(scrollspyElements.mobileToggle).display === 'none';

        if (isDesktopView && !isScrollspyActive) {
            // Attach for Desktop
            window.addEventListener('scroll', handleScrollspyScroll, { passive: true });
            isScrollspyActive = true;
            updateScrollspyActiveLink(); // Initial check
            logger.info("Scrollspy listener attached (Desktop View).");
        } else if (!isDesktopView && isScrollspyActive) {
            // Detach for Mobile
            window.removeEventListener('scroll', handleScrollspyScroll);
            isScrollspyActive = false;
            scrollspyElements.links.forEach(link => link.classList.remove(CONFIG.SCROLLSPY_ACTIVE_CLASS));
            scrollspyElements.indicator.style.opacity = '0';
            logger.info("Scrollspy listener detached (Mobile View).");
        } else if (isDesktopView && isScrollspyActive) {
            // Still Desktop: Ensure indicator is correct after resize/reflow
            updateScrollspyActiveLink();
        }
    }


    // =========================================================================
    // TEMPLATE INTERACTION & NOTIFICATION
    // =========================================================================

    /**
     * --- NEW: PLACEHOLDER for Download Notification ---
     * In a real application, this would send data to a backend endpoint.
     * The backend would then handle sending the email securely.
     * Location info needs to be handled server-side based on IP or other factors.
     */
    async function sendDownloadNotification(templateName, templateKey) {
        const timestamp = new Date().toISOString();
        const notificationData = {
            templateName: templateName,
            templateKey: templateKey,
            downloadTime: timestamp,
            // Location info should ideally be added server-side
            // clientInfo: { userAgent: navigator.userAgent } // Example client info
        };

        logger.info('[Download Notify] Preparing notification:', notificationData);

        // ***** START Backend Implementation Needed *****
        logger.warn(`[Download Notify] SKIPPING actual backend call. \nData to send to backend (${CONFIG.DOWNLOAD_NOTIFICATION_ENDPOINT}):`, notificationData);
        /*
        // Example using fetch (replace with your actual implementation):
        try {
            const response = await fetch(CONFIG.DOWNLOAD_NOTIFICATION_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any necessary authentication headers (e.g., API key, JWT token)
                    // 'Authorization': 'Bearer YOUR_API_TOKEN'
                },
                body: JSON.stringify(notificationData)
            });

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            logger.info('[Download Notify] Notification sent successfully to backend.');

        } catch (error) {
            logger.error('[Download Notify] FAILED to send notification to backend:', error);
            // Decide if you need user feedback here or just log the error silently.
            // Depending on requirements, you might want to queue this for retry.
        }
        */
        // ***** END Backend Implementation Needed *****
    }

    function handleGetSpreadsheetClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const templateName = button.dataset.templateName || 'Spreadsheet';
        const price = Number(button.dataset.price || '0');
        const formattedPrice = price > 0 ? price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }) : 'Premium';
        alert(`Interactive "${templateName}" (${formattedPrice})\n\nThis premium feature is coming soon!\nRequires a Gmail account for delivery.\nThank you for your interest.`);
        logger.info(`Spreadsheet interest registered: ${templateName} (Price: ₦${price})`);
    }

    function handleDownloadPdfClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const card = button.closest('.template-card');
        const templateKey = button.dataset.templateKey;
        if (!card || !templateKey) { logger.error("Missing card or template key on PDF download button.", button); alert("Sorry, download cannot be initiated."); return; }

        const pdfUrl = CONFIG.PDF_FILES[templateKey];
        const templateName = card.querySelector('h3')?.textContent || templateKey; // Use key as fallback name
        if (!pdfUrl || pdfUrl === '#') {
            alert(`Download is currently unavailable for "${templateName}". Please check back later.`);
            logger.warn(`PDF path invalid/missing for template key: "${templateKey}". Config: ${pdfUrl}`);
            return;
        }

        logger.info(`Initiating PDF download for: ${templateName} (${templateKey}) from ${pdfUrl}`);
        const originalButtonHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> <span>Starting...</span>'; // Initial "starting" state

        try {
            // Create link and simulate click
            const link = document.createElement('a');
            link.href = pdfUrl;
            const safeName = templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            link.download = `rofilid-${safeName}-template.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Change button text to "Downloading..." immediately after click simulation
             button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> <span>Downloading...</span>';

             // --- NEW: Send background notification ---
             // Call the notification function asynchronously (does not block download)
             sendDownloadNotification(templateName, templateKey).catch(err => {
                 logger.error("Error in sendDownloadNotification background task:", err); // Log errors from the async task itself
             });
             // --- End Notification ---

            // Restore button state after delay
            setTimeout(() => { button.innerHTML = originalButtonHtml; button.disabled = false; }, CONFIG.PDF_DOWNLOAD_FEEDBACK_DELAY);

        } catch (error) {
            logger.error("PDF Download initiation failed:", error);
            alert(`Sorry, the download for "${templateName}" encountered an error. Please try again later.`);
            // Restore button state immediately on error
            button.innerHTML = originalButtonHtml;
            button.disabled = false;
        }
    }


    // =========================================================================
    // ANIMATIONS
    // =========================================================================
    function setupAnimations() {
        if (!("IntersectionObserver" in window)) {
            logger.warn("IntersectionObserver not supported. Skipping scroll animations.");
            document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
             logger.info("Reduced motion preferred. Skipping scroll-triggered animations setup.");
             // Make elements immediately visible if motion is reduced
             document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
             return; // Skip setting up observers if motion is reduced
        }

        // Fade-in Observer (for sections, asides)
        if (CONFIG.ENABLE_SECTION_FADE_IN) {
            const fadeObserverOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
            const fadeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible'); // Add animation class
                        observer.unobserve(entry.target);
                        logger.debug('Element faded in:', entry.target.id || entry.target.tagName);
                    }
                });
            }, fadeObserverOptions);

            // Observe non-hero sections and motivational quotes
            document.querySelectorAll('#main-content > section:not(#hero)[data-animate-fade-in], #main-content > aside.motivational-quote[data-animate-fade-in]')
                .forEach(el => fadeObserver.observe(el));
        } else {
             document.querySelectorAll('#main-content > section:not(#hero)[data-animate-fade-in], #main-content > aside.motivational-quote[data-animate-fade-in]')
                 .forEach(el => el.classList.add('is-visible'));
        }

        // Hero Stats Staggered Animation Observer
        const heroStatsGrid = document.querySelector('.hero-stats-grid');
        if (CONFIG.ENABLE_HERO_STATS_ANIMATION && heroStatsGrid) {
            const statCards = Array.from(heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]')); // Convert to array for indexOf
            if (statCards.length > 0) {
                const statsObserverOptions = { threshold: 0.3, rootMargin: "0px" }; // Adjust threshold as needed
                const statsObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const card = entry.target;
                            const cardIndex = statCards.indexOf(card);
                            const delay = cardIndex * 100; // 100ms stagger
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
            // Make stats visible immediately if animation disabled
             heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]').forEach(card => card.classList.add('is-visible'));
        }
        logger.info('Animations setup initiated.');
    }


    // =========================================================================
    // EVENT HANDLERS & SETUP
    // =========================================================================
    function handleMobileNavToggle() {
        const nav = document.getElementById('primary-navigation');
        const toggle = scrollspyElements.mobileToggle; // Use cached toggle
        if (!nav || !toggle) { logger.warn("handleMobileNavToggle: Nav or toggle missing."); return; }

        const isExpanded = nav.classList.toggle('active'); // Use '.active' to show nav
        toggle.setAttribute('aria-expanded', String(isExpanded));
        document.body.style.overflow = isExpanded ? 'hidden' : '';

        // Manage focus
        if (isExpanded) {
             safeFocus(nav.querySelector('a[href], button')); // Focus first link/button in nav
        } else if (document.activeElement && nav.contains(document.activeElement)) {
             safeFocus(toggle); // Return focus to toggle if focus was inside nav
        }
        logger.debug('Mobile navigation toggled:', isExpanded ? 'Open' : 'Closed');
    }

    function handleSmoothScroll(event) {
        const anchor = event.currentTarget;
        const href = anchor.getAttribute('href');
        let targetId = null;

        if (href?.includes('#')) {
            const parts = href.split('#');
            if ((parts[0] === '' || parts[0] === 'personal.html') && parts[1]) {
                 targetId = parts[1];
            }
        }
        if (!targetId) return; // Not an internal page link

        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            event.preventDefault();
            logger.debug(`[SmoothScroll] Scrolling to: #${targetId}`);

            const nav = document.getElementById('primary-navigation');
            if (nav?.classList.contains('active')) { // If mobile nav is open
                handleMobileNavToggle(); // Close it first
            }

            updateHeaderHeight(); // Ensure latest header height is used
            const headerOffset = currentHeaderHeight + CONFIG.SCROLL_OFFSET_MARGIN; // Dynamic offset
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = window.pageYOffset + elementPosition - headerOffset;

            window.scrollTo({ top: offsetPosition, behavior: "smooth" });

            // Accessibility: Focus the target after scroll
            setTimeout(() => {
                 if (!targetElement.hasAttribute('tabindex')) {
                     targetElement.setAttribute('tabindex', '-1'); // Make it focusable
                 }
                 safeFocus(targetElement);
            }, 700); // Adjust delay based on typical scroll duration
        } else {
            logger.warn(`[SmoothScroll] Target element "#${targetId}" not found.`);
        }
    }

    function handleResize() {
        updateHeaderHeight(); // Update header height on resize

        // Re-check scrollspy state (attaches/detaches listener, updates indicator)
        checkAndAttachScrollspyListener();
    }

    function handleFeedbackTypeChange(event) {
        const select = event.target;
        const form = select.closest('form');
        if (!form) return;
        const permissionGroup = form.querySelector('.permission-group');
        const permissionCheckbox = permissionGroup?.querySelector('#feedback-permission');

        if (!permissionGroup) return;
        const isTestimonial = select.value === 'testimonial';
        permissionGroup.hidden = !isTestimonial;

        // Uncheck permission if type changes away from testimonial
        if (!isTestimonial && permissionCheckbox?.checked) {
             permissionCheckbox.checked = false;
        }
        logger.debug('Feedback type changed. Permission group visible:', isTestimonial);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    function setupEventListeners() {
        logger.debug("Setting up event listeners...");

        // Mobile Navigation Toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', handleMobileNavToggle);
        else logger.warn("Mobile nav toggle button not found.");

        // Smooth Scrolling Links
        document.querySelectorAll('a[href^="personal.html#"], a[href^="#"]').forEach(anchor => {
             const href = anchor.getAttribute('href');
             if (href && href.includes('#') && href.substring(href.lastIndexOf('#')).length > 1) {
                 anchor.addEventListener('click', handleSmoothScroll);
             }
        });

        // Resize Listener
        window.addEventListener('resize', debounce(handleResize, CONFIG.RESIZE_DEBOUNCE_DELAY));

        // Modal Overlays Click to Close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (event) => {
                 if (event.target === overlay && activeModal === overlay) { closeModal(); }
            });
        });

        // General Modal Close Buttons (within modals)
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
             btn.addEventListener('click', () => { closeModal(); }); // Close the currently active modal
        });

        // Open Feedback Modal
        const openFeedbackBtn = document.getElementById('open-feedback-modal-btn');
        const feedbackModal = document.getElementById('feedback-modal');
        if (openFeedbackBtn && feedbackModal) {
             openFeedbackBtn.addEventListener('click', (e) => openModal(feedbackModal, e.currentTarget));
        } else logger.warn("Open Feedback button or Feedback Modal not found.");

        // Template Buttons
        document.querySelectorAll('.get-spreadsheet-btn').forEach(button => button.addEventListener('click', handleGetSpreadsheetClick));
        document.querySelectorAll('.download-pdf-btn').forEach(button => button.addEventListener('click', handleDownloadPdfClick));

        // Coaching Interest Form
        const coachingForm = document.getElementById('coachingInterestForm');
        if (coachingForm) {
            coachingForm.addEventListener('submit', (e) => handleFormSubmit({
                event: e, formId: 'coachingInterestForm',
                fields: [{ id: 'interest-email', name: 'email', required: true, validator: isValidEmail, label: 'Email', errorMessage: 'Please enter a valid email address.' }],
                submitButtonSelector: 'button[type="submit"]',
                successMessage: 'Thank you! We\'ll notify you when coaching is available.',
                errorMessage: 'Submission failed. Please check your email or try again.',
                endpointAction: 'coachingInterest', closeModalOnSuccess: false
            }));
        } else logger.warn("Coaching interest form (#coachingInterestForm) not found.");

        // Feedback/Testimonial Form
        const feedbackForm = document.getElementById('feedback-testimonial-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => handleFormSubmit({
                event: e, formId: 'feedback-testimonial-form',
                fields: [
                    { id: 'feedback-name', name: 'name' },
                    { id: 'feedback-email', name: 'email', validator: (val) => !val || isValidEmail(val), label: 'Email', errorMessage: 'If entering an email, please use a valid address.' },
                    { id: 'feedback-type', name: 'type', required: true, label: 'Type', requiredMessage: 'Please select a feedback type.' },
                    { id: 'feedback-message', name: 'message', required: true, label: 'Message', minLength: 10, maxLength: 2000, requiredMessage: 'Please enter your message.', errorMessage: 'Message must be between 10 and 2000 characters.' },
                    { id: 'feedback-permission', name: 'permissionGranted', type: 'checkbox' }
                ],
                submitButtonSelector: 'button[type="submit"]',
                successMessage: 'Feedback submitted successfully. Thank you!',
                errorMessage: 'Submission failed. Please check the form or try again.',
                endpointAction: 'submitFeedback', closeModalOnSuccess: true,
                onSuccess: resetFeedbackForm // Reset form state after modal closes implicitly
            }));
            const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
            if (feedbackTypeSelect) feedbackTypeSelect.addEventListener('change', handleFeedbackTypeChange);
            else logger.warn("Feedback type select (#feedback-type) missing.");
        } else logger.warn("Feedback form (#feedback-testimonial-form) not found.");

        // Intro Quiz Start Buttons
        const quizStartBtns = document.querySelectorAll('#learning-hub .start-quiz-btn');
        if (quizStartBtns.length > 0 && quizModalElements.modal) { // Only add listeners if modal exists
            quizStartBtns.forEach(button => button.addEventListener('click', handleIntroQuizStart));
        } else if (quizStartBtns.length === 0) {
            logger.warn("No quiz start buttons found in #learning-hub.");
        } else {
            logger.warn("Quiz modal missing, cannot attach quiz start listeners.");
        }

        // Quiz Modal Navigation Buttons (Ensure elements exist)
        if (quizModalElements.nextBtn) quizModalElements.nextBtn.addEventListener('click', nextIntroModalQuestion);
        if (quizModalElements.restartBtn) quizModalElements.restartBtn.addEventListener('click', restartIntroModalQuiz);
        if (quizModalElements.nextQuizBtn) quizModalElements.nextQuizBtn.addEventListener('click', handleIntroNextQuizClick);
        if (quizModalElements.closeResultsBtn) quizModalElements.closeResultsBtn.addEventListener('click', () => closeModal());

        logger.info("Event listeners setup complete.");
    }

    /** Update dynamic content like copyright year */
    function updateDynamicContent() {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
    }

    /** Main Initialization Function */
    function initializePersonalPage() {
        logger.info(`Rofilid Personal Page Scripts Initializing (v2.8.0)`);

        // Check for page context (optional safety)
        if (!document.body.classList.contains('personal-page') && !document.documentElement.classList.contains('personal-page')) {
             logger.warn("Not on personal finance page. Exiting script."); return;
        }

        // Initial setup calls
        cacheQuizModalElements();   // Cache modal elements early
        updateDynamicContent();     // Update copyright etc.
        setupScrollspy();           // Setup scrollspy (needs DOM ready)
        setupEventListeners();      // Setup all event listeners AFTER scrollspy setup (dependency on cached elements)
        setupAnimations();          // Setup intersection observers

        logger.info("Rofilid Personal Page Scripts Fully Loaded and Ready.");
    }

    // --- Run Initialization on DOM Ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePersonalPage);
    } else {
        initializePersonalPage(); // Already loaded
    }

})(); // End IIFE
