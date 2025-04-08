/**
 * File Location: /assets/js/personal/personal.js
 * Description: Scripts for the ROFILID Personal Finance page (personal.html).
 *              Handles navigation, smooth scrolling, modals, forms, animations,
 *              template interactions, and scrollspy navigation highlighting.
 * Version: 2.7.1 (Scrollspy Indicator & Modal Close Fix)
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
        SCROLL_OFFSET_MARGIN: 50, // Adjusted default offset for better trigger point
        RESIZE_DEBOUNCE_DELAY: 250,
        MODAL_FOCUS_DELAY: 100,
        API_SIMULATION_DELAY: 1200,
        PDF_DOWNLOAD_FEEDBACK_DELAY: 2500,
        LAST_INTRO_CATEGORY_ID: 4,
        PDF_FILES: {
            'line-budget': '../../assets/downloads/rofilid-line-item-budget.pdf',
            'networth': '../../assets/downloads/rofilid-net-worth-statement.pdf',
            'cashflow': '../../assets/downloads/rofilid-personal-cashflow.pdf',
            '50-30-20': '../../assets/downloads/rofilid-50-30-20-budget.pdf',
            'expense-tracker': '../../assets/downloads/rofilid-expense-tracker.pdf'
        },
        // --- Scrollspy Config (MODIFIED) ---
        SCROLLSPY_SELECTOR: '#primary-navigation .nav-list .nav-link[href^="personal.html#"], #primary-navigation .nav-list .nav-link[href^="#"]', // Target relevant links
        SCROLLSPY_ACTIVE_CLASS: 'active-page',
        SCROLLSPY_THROTTLE_DELAY: 100, // ms
        SCROLLSPY_INDICATOR_SELECTOR: '#primary-navigation .nav-indicator', // NEW: Indicator element selector
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
    let triggerElement = null;
    let currentIntroQuizData = { questions: [], currentQuestionIndex: 0, score: 0, categoryId: null };
    let resizeTimeoutId = null;
    let currentHeaderHeight = CONFIG.HEADER_HEIGHT_DEFAULT;
    // --- Scrollspy State (MODIFIED) ---
    let isScrollspyActive = false;
    let scrollspyThrottleTimeout = null;
    let scrollspyElements = {
        links: [],
        sections: [],
        header: null,
        mobileToggle: null,
        navList: null,      // Parent UL/List for relative positioning
        indicator: null     // The moving indicator element
    };

    // --- Cached DOM Elements ---
    // Specific elements cached within their respective setup functions

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
        )).filter(el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));

        if (focusableEls.length === 0) {
            logger.warn('[trapFocus] No visible focusable elements found inside:', element);
            return null;
        }

        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        function handleFocusTrapKeydown(e) {
             if (e.key !== 'Tab' || !element.contains(document.activeElement)) {
                 return;
             }

             if (e.shiftKey) {
                 if (document.activeElement === firstFocusableEl) {
                     e.preventDefault();
                     logger.debug('[trapFocus] Shift+Tab on first element. Focusing last:', lastFocusableEl);
                     safeFocus(lastFocusableEl);
                 }
             } else {
                 if (document.activeElement === lastFocusableEl) {
                     e.preventDefault();
                     logger.debug('[trapFocus] Tab on last element. Focusing first:', firstFocusableEl);
                     safeFocus(firstFocusableEl);
                 }
             }
        }

        setTimeout(() => {
            // Check if the modal we intended to trap focus in is still the active one
            if (activeModal !== element) {
                logger.warn('[trapFocus] Modal changed before focus could be set.');
                return;
            }
            const focusTarget =
                element.querySelector('.modal-close-btn:not([hidden])') ||
                element.querySelector('.btn-primary:not([disabled]):not([hidden])') ||
                element.querySelector('.btn-secondary:not([disabled]):not([hidden])') ||
                element.querySelector('input:not([type="hidden"]):not([disabled]):not([hidden]), select:not([disabled]):not([hidden]), textarea:not([disabled]):not([hidden])') ||
                element.querySelector('.option-button:not([disabled])') ||
                firstFocusableEl;

            if (focusTarget) {
                logger.debug('[trapFocus] Attempting initial focus:', focusTarget);
                safeFocus(focusTarget);
            } else {
                logger.warn("[trapFocus] No suitable initial focus target found within:", element);
            }
        }, CONFIG.MODAL_FOCUS_DELAY);

        element.addEventListener('keydown', handleFocusTrapKeydown);
        logger.debug('[trapFocus] Focus trap initialized for:', element.id);
        // Store the handler reference on the element itself so closeModal can find it
        element._focusTrapHandler = handleFocusTrapKeydown;
        return handleFocusTrapKeydown; // Return handler mainly for consistency if needed elsewhere
    }

    /** Safely attempt to focus an element */
    function safeFocus(element) {
        if (element && typeof element.focus === 'function') {
            try {
                element.focus({ preventScroll: true });
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
        if (activeModal) {
            logger.info('[openModal] Closing previously active modal:', activeModal.id);
            closeModal(false); // Close previous without returning focus yet
        }

        activeModal = modalElement;
        triggerElement = openingTriggerElement;

        document.body.style.overflow = 'hidden';
        modalElement.hidden = false;

        // Use requestAnimationFrame to ensure 'hidden=false' is applied before adding 'visible'
        requestAnimationFrame(() => {
            modalElement.classList.add('visible');
            logger.debug('[openModal] Added .visible class to:', modalElement.id);

             // Initialize focus trap *after* modal is visible
             const focusTrapHandler = trapFocus(modalElement);
             if (!focusTrapHandler) {
                 logger.warn('[openModal] Focus trapping failed to initialize for:', modalElement.id);
             }
        });

        document.addEventListener('keydown', handleModalKeydown);
        logger.info('[openModal] Modal opened successfully:', modalElement.id);
    }

    /** Close the currently active modal (MODIFIED FOR RELIABILITY) */
    function closeModal(returnFocus = true) {
        if (!activeModal) {
             logger.debug('[closeModal] No active modal to close.');
             return;
        }

        const modalToClose = activeModal;
        const triggerToFocus = triggerElement;
        // Retrieve the handler stored by trapFocus
        const focusTrapHandler = modalToClose._focusTrapHandler;

        logger.info('[closeModal] Closing modal:', modalToClose.id);

        // --- MODIFICATION START: Remove listeners EARLY ---
        document.removeEventListener('keydown', handleModalKeydown);
        if (focusTrapHandler) {
            modalToClose.removeEventListener('keydown', focusTrapHandler);
            delete modalToClose._focusTrapHandler; // Clean up the stored reference
            logger.debug('[closeModal] Removed focus trap listener early for:', modalToClose.id);
        }
        // --- MODIFICATION END ---

        // Set activeModal to null *before* transition starts so body scroll isn't restored prematurely
        activeModal = null;
        triggerElement = null;

        modalToClose.classList.remove('visible'); // Start the closing CSS transition

        // Use transitionend event to hide and clean up after animation
        modalToClose.addEventListener('transitionend', function handleTransitionEnd(event) {
            // Ensure the event is for the overlay itself and for a relevant property
            if (event.target === modalToClose && (event.propertyName === 'opacity' || event.propertyName === 'transform')) {
                 modalToClose.hidden = true;
                 logger.debug('[closeModal] Modal hidden after transition:', modalToClose.id);

                 // Restore body scroll ONLY if no *other* modal became active during the transition
                 if (!activeModal) { // Check activeModal *again* here
                    document.body.style.overflow = '';
                    logger.debug('[closeModal] Restored body scroll.');
                 } else {
                     logger.info('[closeModal] Body scroll not restored, another modal is active:', activeModal.id);
                 }

                 // Reset specific modals after they are fully hidden
                 if (modalToClose.id === 'feedback-modal') resetFeedbackForm();
                 if (modalToClose.id === 'quiz-modal') resetQuizModalUI();

                 // Return focus if requested and possible
                 if (returnFocus && triggerToFocus) {
                    logger.debug('[closeModal] Returning focus to:', triggerToFocus);
                    safeFocus(triggerToFocus);
                 } else if (returnFocus) {
                     logger.warn('[closeModal] Could not return focus. Trigger element was not stored or is invalid.');
                 }

                 // Listener is automatically removed due to { once: true }
            }
        }, { once: true }); // Use { once: true } for automatic listener removal

         // Fallback timeout (Good practice in case transitionend doesn't fire)
         setTimeout(() => {
            // Check if the modal is still visible in the DOM and *not* hidden
            if (modalToClose.parentNode && !modalToClose.hidden && !modalToClose.classList.contains('visible')) {
                logger.warn('[closeModal Fallback] TransitionEnd did not fire for', modalToClose.id, '- forcing hidden state.');
                modalToClose.hidden = true;
                 if (!activeModal) { document.body.style.overflow = ''; } // Check activeModal again
                 // Still attempt resets and focus return
                 if (modalToClose.id === 'feedback-modal') resetFeedbackForm();
                 if (modalToClose.id === 'quiz-modal') resetQuizModalUI();
                 if (returnFocus && triggerToFocus) safeFocus(triggerToFocus);
            }
        }, 600); // Duration slightly longer than the CSS transition (e.g., 300ms transition -> 500-600ms timeout)
    }

    /** Handle Escape key press for closing modals */
    function handleModalKeydown(event) {
        if (event.key === 'Escape' && activeModal) {
            logger.debug('[handleModalKeydown] Escape key pressed. Closing modal:', activeModal.id);
            closeModal(); // Use the main closeModal function
        }
    }

    // =========================================================================
    // FORM HANDLING
    // =========================================================================
    // ... (show/hideFormResponseMessage, clearFormErrors, showInputError, validateAndGetFormData, handleFormSubmit, resetFeedbackForm - KEEP AS IS) ...
    function showFormResponseMessage(formElement, message, type = 'success') {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (!responseEl) { logger.warn("Form response element not found for:", formElement?.id); return; }
        responseEl.textContent = message;
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
            const errorMsgId = input.getAttribute('aria-describedby');
            if (errorMsgId) {
                 // Find the error message element more robustly
                const errorMsgEl = document.getElementById(errorMsgId) || formElement.querySelector(`[id="${errorMsgId}"]`);
                 // Only remove aria-describedby if it points to our error message element
                 if (errorMsgEl && errorMsgEl.classList.contains('form-error-msg')) {
                     // Check if input has multiple descriptions; if so, only remove the error one
                    const describedBy = input.getAttribute('aria-describedby')?.split(' ') || [];
                    const newDescribedBy = describedBy.filter(id => id !== errorMsgId).join(' ');
                    if (newDescribedBy) {
                        input.setAttribute('aria-describedby', newDescribedBy);
                    } else {
                        input.removeAttribute('aria-describedby');
                    }
                 }
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
            // Ensure error message has an ID and input is described by it
            if (!errorMsgElement.id) {
                errorMsgElement.id = `${inputElement.id || `input-${Math.random().toString(36).substring(7)}`}-error`;
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
                return; // Skip this field
            }
            const value = (inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value.trim());
            formData[field.name] = value;
            let fieldValid = true;
            if (field.required && !value && inputElement.type !== 'checkbox') {
                showInputError(inputElement, field.requiredMessage || `${field.label || 'Field'} is required.`);
                fieldValid = false;
            } else if (inputElement.type === 'email' && value && !isValidEmail(value)) { // Use built-in email validation first
                 showInputError(inputElement, field.errorMessage || `Please enter a valid email address.`);
                 fieldValid = false;
            } else if (field.validator && !field.validator(value)) {
                showInputError(inputElement, field.errorMessage || `Invalid ${field.label || 'field'}.`);
                fieldValid = false;
            } else if (field.maxLength && value.length > field.maxLength) {
                showInputError(inputElement, `${field.label || 'Field'} cannot exceed ${field.maxLength} characters.`);
                fieldValid = false;
            } else if (field.minLength && value.length < field.minLength) {
                showInputError(inputElement, `${field.label || 'Field'} must be at least ${field.minLength} characters.`);
                fieldValid = false;
            }
            if (!fieldValid) {
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
        const { formId, fields, submitButtonSelector, successMessage, errorMessage, endpointAction, event } = options; // Added event
        if (event) event.preventDefault(); // Prevent default only if event is passed
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
            // Optionally show a generic error message above the form if validation fails
            showFormResponseMessage(form, "Please correct the errors highlighted below.", 'error');
            return;
        }
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';
        hideFormResponseMessage(form); // Hide previous messages before new submission
        logger.info(`[handleFormSubmit] Simulating API call for ${formId} with action ${endpointAction}`, validationResult.data);
        let submissionSuccess = false;
        try {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            // Simulate potential API success/failure
            const success = Math.random() > 0.1; // ~90% success rate for simulation
            if (success) {
                logger.info(`[handleFormSubmit] Simulated submission SUCCESS for ${formId}`);
                showFormResponseMessage(form, successMessage, 'success');
                submissionSuccess = true;
                form.reset();
                // Trigger change event on selects after reset if needed for UI updates
                form.querySelectorAll('select').forEach(select => {
                    const changeEvent = new Event('change', { bubbles: true });
                    select.dispatchEvent(changeEvent);
                });
                if (options.onSuccess) options.onSuccess(); // Call success callback if provided
                if (options.closeModalOnSuccess) {
                     // Delay closing slightly to allow user to read success message
                     setTimeout(() => {
                        const modal = form.closest('.modal-overlay');
                        if (activeModal && activeModal === modal) { // Ensure the correct modal is still active
                            closeModal();
                        }
                     }, 2000); // 2 second delay
                 } else {
                    // Focus on a relevant element after success (e.g., form heading or first field)
                    const heading = form.closest('.modal-content')?.querySelector('h3, h2') || form.querySelector('label, input, select, textarea');
                    safeFocus(heading || form); // Focus heading or form itself
                 }
            } else {
                throw new Error("Simulated server error. Please try again."); // More specific simulated error
            }
        } catch (error) {
            logger.error(`[handleFormSubmit] Simulated submission FAILED for ${formId}:`, error);
            // Use the error message from the options or the caught error's message
            showFormResponseMessage(form, errorMessage || error.message || 'An unexpected error occurred.', 'error');
            // Focus the first invalid element again, or the first focusable element in the form
            safeFocus(validationResult.firstInvalidElement || form.querySelector('input:not([type="hidden"]), select, textarea'));
            if (options.onError) options.onError(error); // Call error callback if provided
        } finally {
             // Re-enable the button only if submission failed OR if the modal isn't closing on success
            if (!submissionSuccess || !options.closeModalOnSuccess) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonHtml;
            }
            // If closing on success, the button might remain disabled/in a success state until the modal closes
        }
    }
     function resetFeedbackForm() {
        const form = document.getElementById('feedback-testimonial-form');
        if (!form) return;
        form.reset();
        clearFormErrors(form);
        hideFormResponseMessage(form);
        const typeSelect = form.querySelector('#feedback-type');
        if(typeSelect) handleFeedbackTypeChange({ target: typeSelect }); // Reset permission display
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
    // ... (introQuizQuestions - Assumed to be correct as per previous code) ...
     const introQuizQuestions = [ /* Assume questions are here */
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
    let quizModalElements = {};
    function cacheQuizModalElements() {
        const quizModal = document.getElementById('quiz-modal');
        if (!quizModal) {
            logger.error("FATAL: Quiz Modal element (#quiz-modal) not found.");
            return false; // Indicate failure
        }
        // Cache all elements, check for crucial ones
        quizModalElements = {
            modal: quizModal,
            title: quizModal.querySelector('#quiz-modal-title'),
            closeBtn: quizModal.querySelector('#quiz-modal-close'), // Close button inside modal
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
        const crucialKeys = ['modal', 'title', 'questionEl', 'optionsEl', 'feedbackEl', 'resultsEl', 'progressCurrent', 'progressTotal', 'nextBtn', 'nextQuizBtn', 'restartBtn', 'closeResultsBtn'];
        let allFound = true;
        for (const key of crucialKeys) {
            if (!quizModalElements[key]) {
                logger.error(`[cacheQuizModalElements] Quiz modal crucial sub-element missing: #${key}`);
                allFound = false;
            }
        }
        if (!allFound) {
             // Optionally display user message or disable quiz functionality
             // alert("Error: The quiz interface is incomplete and cannot be loaded. Please contact support or try refreshing.");
             return false; // Indicate failure
        }
        logger.debug("Quiz modal elements cached successfully.");
        return true; // Indicate success
    }
    function handleIntroQuizStart(event) {
        logger.debug('[handleIntroQuizStart] called by:', event.currentTarget);
        const button = event.currentTarget;
        const card = button.closest('.category-card');
        if (!card) { logger.error('[handleIntroQuizStart] Could not find parent .category-card.'); alert("An error occurred starting the quiz."); return; }
        const categoryId = parseInt(card.dataset.categoryId, 10);
        if (isNaN(categoryId) || categoryId < 1) { logger.error(`[handleIntroQuizStart] Invalid category ID: ${card.dataset.categoryId}`); alert("Cannot start quiz due to invalid category."); return; }
        if (categoryId > CONFIG.LAST_INTRO_CATEGORY_ID) { logger.warn(`[handleIntroQuizStart] Category ID ${categoryId} exceeds intro limit.`); alert("This quiz might be part of the full challenge. Visit the 'All Quizzes' page."); return; }
        const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);
        if (categoryQuestions.length === 0) { logger.error(`[handleIntroQuizStart] No questions found for category ID: ${categoryId}.`); alert("Sorry, questions for this check are unavailable."); return; }
        logger.debug(`[handleIntroQuizStart] Found ${categoryQuestions.length} questions for category ${categoryId}. Starting quiz...`);
        startIntroQuiz(categoryId, categoryQuestions, button);
    }
    function startIntroQuiz(catId, questions, openingTrigger) {
         logger.info(`[startIntroQuiz] Starting Intro Quiz - Category: ${catId}`);
         // Ensure modal elements are cached before proceeding
         if (!quizModalElements.modal || !quizModalElements.title) {
             logger.error("[startIntroQuiz] FAILED: Quiz modal DOM elements not available or not cached.");
             if (!cacheQuizModalElements()) { // Attempt recache
                alert("Error: Quiz interface could not be loaded properly. Please refresh the page.");
                return;
             }
             // Re-check after recache attempt
             if (!quizModalElements.modal || !quizModalElements.title) {
                  alert("Error: Quiz interface is still unavailable after retry. Please contact support.");
                  return;
             }
         }
         if (!questions || questions.length === 0) { logger.error("[startIntroQuiz] FAILED: No questions provided for category:", catId); alert("Error: No questions available for this quiz check."); return; }
         currentIntroQuizData = { questions, currentQuestionIndex: 0, score: 0, categoryId: catId };
         logger.debug("[startIntroQuiz] Current quiz data set:", currentIntroQuizData);
         setupIntroQuizUI();
         displayIntroModalQuestion();
         openModal(quizModalElements.modal, openingTrigger); // Pass the element that opened the modal
     }
    function setupIntroQuizUI() {
         logger.debug("[setupIntroQuizUI] Setting up quiz UI...");
         if (!quizModalElements.modal) return; // Already checked in startIntroQuiz, but safe redundancy
         const { title, resultsEl, feedbackEl, questionEl, optionsEl, progressTotal, nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt } = quizModalElements;
         const firstQuestion = currentIntroQuizData.questions[0];
         if (title) title.textContent = firstQuestion?.category || 'Financial Concept Check';
         if (progressTotal) progressTotal.textContent = currentIntroQuizData.questions.length;
         if (resultsEl) { resultsEl.hidden = true; resultsEl.innerHTML = ''; } // Clear previous results
         if (feedbackEl) { feedbackEl.hidden = true; feedbackEl.innerHTML = ''; } // Clear previous feedback
         if (questionEl) { questionEl.hidden = false; questionEl.textContent = 'Loading...'; } // Show loading state
         if (optionsEl) { optionsEl.hidden = false; optionsEl.innerHTML = ''; } // Clear previous options
         const progressWrapper = quizModalElements.progressCurrent?.closest('.quiz-modal-progress');
         if (progressWrapper) progressWrapper.hidden = false; // Ensure progress is visible
         // Hide all navigation buttons initially
         [nextBtn, nextQuizBtn, restartBtn, closeResultsBtn].forEach(btn => { if (btn) btn.hidden = true; });
         if (fullChallengePrompt) fullChallengePrompt.hidden = true; // Hide challenge prompt
         logger.debug("[setupIntroQuizUI] UI setup complete.");
     }
    function displayIntroModalQuestion() {
         const { questionEl, optionsEl, progressCurrent, feedbackEl, nextBtn } = quizModalElements;
         const { questions, currentQuestionIndex } = currentIntroQuizData;
         logger.debug(`[displayIntroModalQuestion] Displaying question index: ${currentQuestionIndex}`);
         if (!questionEl || !optionsEl || !progressCurrent) { logger.error("[displayIntroModalQuestion] Missing critical UI elements for displaying question."); return; }
         if (currentQuestionIndex >= questions.length) { logger.info("[displayIntroModalQuestion] End of questions. Showing results."); showIntroModalResults(); return; }
         const q = questions[currentQuestionIndex];
         // Use innerHTML carefully or create elements programmatically for better security/performance
         questionEl.innerHTML = `<span class="question-number">${currentQuestionIndex + 1}.</span> `; // Set number first
         questionEl.appendChild(document.createTextNode(q.question)); // Append text node
         progressCurrent.textContent = currentQuestionIndex + 1;
         optionsEl.innerHTML = ''; // Clear previous options
         q.options.forEach((option, index) => {
             const label = document.createElement('label'); label.className = 'option-label';
             const button = document.createElement('button'); button.textContent = option; button.className = 'option-button'; button.type = 'button'; button.dataset.index = index;
             button.onclick = () => handleIntroModalOptionSelection(index); // Use arrow function to pass index correctly
             label.appendChild(button); optionsEl.appendChild(label);
         });
         // Ensure feedback and next button are hidden when a new question is shown
         if (feedbackEl) feedbackEl.hidden = true;
         if (nextBtn) nextBtn.hidden = true;
         // Focus the first option button for accessibility
         safeFocus(optionsEl.querySelector('.option-button'));
         logger.debug("[displayIntroModalQuestion] Question displayed.");
    }
    function handleIntroModalOptionSelection(selectedIndex) {
        logger.debug(`[handleIntroModalOptionSelection] Option selected: index ${selectedIndex}`);
        const { optionsEl, nextBtn } = quizModalElements;
        const { questions, currentQuestionIndex } = currentIntroQuizData;
        const q = questions[currentQuestionIndex];
        if (!q || !optionsEl) { logger.error("[handleIntroModalOptionSelection] Missing question data or options element."); return; }
        // Disable all option buttons immediately
        const buttons = optionsEl.querySelectorAll('.option-button');
        buttons.forEach(button => button.disabled = true);
        // Check if correct and update score
        const isCorrect = selectedIndex === q.correctAnswerIndex;
        if (isCorrect) { currentIntroQuizData.score++; logger.debug(`[handleIntroModalOptionSelection] Correct! Score: ${currentIntroQuizData.score}`); }
        else { logger.debug(`[handleIntroModalOptionSelection] Incorrect. Correct answer index: ${q.correctAnswerIndex}`); }
        // Show feedback and potentially the next button
        showIntroModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
        // Focus the next button if it appears
        if (nextBtn && !nextBtn.hidden) {
            safeFocus(nextBtn);
        }
    }
    function showIntroModalFeedback(selectedIndex, correctIndex, explanation) {
        logger.debug("[showIntroModalFeedback] Displaying feedback.");
        const { optionsEl, feedbackEl, nextBtn } = quizModalElements;
        if (!optionsEl || !feedbackEl) { logger.error("[showIntroModalFeedback] Missing options buttons or feedback element."); return; }
        const buttons = optionsEl.querySelectorAll('.option-button');
        // Apply correct/incorrect classes to buttons
        buttons.forEach((button, index) => {
            button.classList.remove('correct', 'incorrect'); // Clear previous states
            if (index === correctIndex) button.classList.add('correct');
            else if (index === selectedIndex) button.classList.add('incorrect');
            // Keep buttons disabled
        });
        // Construct feedback message
        const feedbackParagraph = document.createElement('p');
        const feedbackStrong = document.createElement('strong');
        feedbackStrong.textContent = selectedIndex === correctIndex ? 'Correct! ' : 'Insight: ';
        feedbackParagraph.appendChild(feedbackStrong);
        feedbackParagraph.appendChild(document.createTextNode(explanation || 'Check your understanding based on the answer.')); // Provide fallback text
        feedbackEl.innerHTML = ''; // Clear previous feedback
        feedbackEl.appendChild(feedbackParagraph);
        feedbackEl.className = `quiz-feedback ${selectedIndex === correctIndex ? 'correct' : 'incorrect'}`; // Set class for styling
        feedbackEl.hidden = false; // Show feedback area
        // Determine if the 'Next Question' button should be shown
        const quiz = currentIntroQuizData;
        if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
            if (nextBtn) {
                nextBtn.hidden = false; // Show next button
                logger.debug("[showIntroModalFeedback] Next question available.");
                // Focus is handled in handleIntroModalOptionSelection after this function runs
            } else { logger.warn("[showIntroModalFeedback] Next button not found, cannot show."); }
        } else {
            // This is the last question, hide 'Next Question' button if it exists
            if (nextBtn) nextBtn.hidden = true;
            logger.info("[showIntroModalFeedback] Last question answered. Showing results soon.");
            // Show results after a short delay to allow user to read feedback
            setTimeout(showIntroModalResults, 1500); // Increased delay slightly
        }
    }
    function nextIntroModalQuestion() {
        logger.debug("[nextIntroModalQuestion] Advancing to next question.");
        if (!currentIntroQuizData) return; // Should not happen if called correctly
        // Hide feedback and next button before displaying next question
        if (quizModalElements.feedbackEl) quizModalElements.feedbackEl.hidden = true;
        if (quizModalElements.nextBtn) quizModalElements.nextBtn.hidden = true;
        currentIntroQuizData.currentQuestionIndex++;
        displayIntroModalQuestion(); // Display the next question
    }
    function showIntroModalResults() {
        logger.info("[showIntroModalResults] Displaying quiz results.");
        const { questionEl, optionsEl, feedbackEl, nextBtn, resultsEl, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt } = quizModalElements;
        const quiz = currentIntroQuizData;
        if (!resultsEl || !quiz) { logger.error("[showIntroModalResults] Missing results element or quiz data. Cannot display results."); closeModal(); return; }
        // Hide question/options/feedback/next button areas
        [questionEl, optionsEl, feedbackEl, nextBtn].forEach(el => { if (el) el.hidden = true; });
        // Hide progress indicator
        const progressWrapper = quizModalElements.progressCurrent?.closest('.quiz-modal-progress');
        if (progressWrapper) progressWrapper.hidden = true;
        // Calculate results
        const score = quiz.score; const total = quiz.questions.length; const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        // Determine result message
        let feedbackMsg = 'Keep exploring our resources to strengthen your knowledge!';
        if (percentage === 100) feedbackMsg = 'Excellent work! You have a strong understanding.';
        else if (percentage >= 80) feedbackMsg = 'Great job! You\'re building solid financial awareness.';
        else if (percentage >= 50) feedbackMsg = 'Good start! Review the insights to reinforce learning.';
        // Populate results area
        resultsEl.innerHTML = `
            <h4>Check Complete!</h4>
            <p>You answered ${score} out of ${total} correctly.</p>
            <p class="quiz-score-percentage">(${percentage}%)</p>
            <p class="quiz-result-message">${feedbackMsg}</p>
        `;
        resultsEl.hidden = false; // Show results area
        // Determine which action buttons to show
        let focusTarget = null; // Element to receive focus
        if (restartBtn) { restartBtn.hidden = false; focusTarget = restartBtn; } // Show restart
        if (closeResultsBtn) { closeResultsBtn.hidden = false; focusTarget = focusTarget || closeResultsBtn; } // Show close, prioritize restart for focus if both shown

        // Show 'Next Check' or 'Full Challenge' prompt conditionally
        if (quiz.categoryId && quiz.categoryId < CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (nextQuizBtn) {
                nextQuizBtn.dataset.nextCategoryId = quiz.categoryId + 1; // Store next ID
                nextQuizBtn.hidden = false;
                focusTarget = nextQuizBtn; // Prioritize 'Next Check' for focus
                logger.debug("[showIntroModalResults] Showing 'Next Check' button.");
            }
        } else if (quiz.categoryId === CONFIG.LAST_INTRO_CATEGORY_ID) {
            if (fullChallengePrompt) {
                 fullChallengePrompt.hidden = false;
                 // Optionally focus the link inside the prompt, or keep focus on action buttons
                 // focusTarget = fullChallengePrompt.querySelector('a') || focusTarget;
                 logger.debug("[showIntroModalResults] Showing 'Full Challenge' prompt.");
            }
        }
        // Focus the most relevant action button
        logger.debug("[showIntroModalResults] Focusing results action button:", focusTarget);
        safeFocus(focusTarget); // Focus the determined target
    }
    function restartIntroModalQuiz() {
        logger.info("[restartIntroModalQuiz] Restarting current quiz check.");
        const catId = currentIntroQuizData.categoryId;
        if (!catId) { logger.error("[restartIntroModalQuiz] Cannot restart, category ID missing from current data."); closeModal(); return; }
        const questions = introQuizQuestions.filter(q => q.categoryId === catId);
        // Try to find the original trigger button based on category ID for focus context
        const originalTrigger = document.querySelector(`.category-card[data-category-id="${catId}"] .start-quiz-btn`);
        if (questions.length > 0) {
            // Re-start the quiz using the same category and questions
            startIntroQuiz(catId, questions, originalTrigger || triggerElement); // Use found trigger or the last known trigger
        } else {
            logger.error(`[restartIntroModalQuiz] Failed to find questions for category ${catId} during restart.`);
            closeModal(); // Close if questions can't be found
        }
    }
    function handleIntroNextQuizClick(event) {
        logger.debug("[handleIntroNextQuizClick] 'Next Check' button clicked.");
        const button = event.currentTarget;
        const nextCatId = parseInt(button.dataset.nextCategoryId, 10);
        if (!isNaN(nextCatId) && nextCatId <= CONFIG.LAST_INTRO_CATEGORY_ID) {
            const questions = introQuizQuestions.filter(q => q.categoryId === nextCatId);
            // Find the trigger button for the *next* quiz for better context/focus return
            const nextTriggerButton = document.querySelector(`.category-card[data-category-id="${nextCatId}"] .start-quiz-btn`);
            if (questions.length > 0) {
                // Start the next quiz
                startIntroQuiz(nextCatId, questions, nextTriggerButton || button); // Prefer specific trigger, fallback to current button
            } else {
                logger.error(`[handleIntroNextQuizClick] Questions missing for next category: ${nextCatId}`);
                alert("Error loading the next check. Please close and try starting it manually.");
                closeModal(); // Close current modal as next cannot be loaded
            }
        } else {
            logger.error("[handleIntroNextQuizClick] Invalid next category ID found:", button.dataset.nextCategoryId);
            alert("Error determining the next check.");
            closeModal(); // Close current modal as next ID is invalid
        }
    }
    function resetQuizModalUI() {
        // Called when modal closes to clean up UI state
        if (!quizModalElements.modal) return;
        const { feedbackEl, resultsEl, optionsEl, questionEl, progressWrapper, nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt, title } = quizModalElements;
        if(feedbackEl) feedbackEl.hidden = true;
        if(resultsEl) resultsEl.hidden = true;
        if(optionsEl) optionsEl.innerHTML = ''; // Clear options
        if(questionEl) questionEl.textContent = ''; // Clear question text
        if(title) title.textContent = 'Financial Concept Check'; // Reset title
        if(progressWrapper) progressWrapper.hidden = true; // Hide progress
        // Hide all buttons that might be visible
        [nextBtn, nextQuizBtn, restartBtn, closeResultsBtn].forEach(btn => { if (btn) btn.hidden = true; });
        if(fullChallengePrompt) fullChallengePrompt.hidden = true;
        logger.debug("[resetQuizModalUI] Quiz modal UI elements reset for next use.");
    }

    // =========================================================================
    // SCROLLSPY LOGIC (MODIFIED w/ INDICATOR)
    // =========================================================================
    /**
     * Initializes the scrollspy feature by caching elements and mapping sections.
     */
    function setupScrollspy() {
        scrollspyElements.links = Array.from(document.querySelectorAll(CONFIG.SCROLLSPY_SELECTOR));
        scrollspyElements.header = document.querySelector('.site-header');
        scrollspyElements.mobileToggle = document.querySelector('.mobile-menu-toggle');
        // Cache Nav List (UL) and Indicator Span
        scrollspyElements.navList = document.querySelector('#primary-navigation'); // The UL element
        scrollspyElements.indicator = scrollspyElements.navList ? scrollspyElements.navList.querySelector(CONFIG.SCROLLSPY_INDICATOR_SELECTOR) : null;

        // Check all required elements exist
        if (!scrollspyElements.links.length || !scrollspyElements.header || !scrollspyElements.mobileToggle || !scrollspyElements.navList || !scrollspyElements.indicator) {
            logger.warn("Scrollspy setup failed: Missing required elements (links, header, toggle, navList, or indicator). Disabling feature.");
            scrollspyElements = { links: [], sections: [], header: null, mobileToggle: null, navList: null, indicator: null }; // Clear all
            return;
        }

        // Map links to sections (Filter for valid hash links on the current page)
        scrollspyElements.sections = scrollspyElements.links
            .map(link => {
                try {
                    const href = link.getAttribute('href');
                    let targetId = null;
                    // Check for links like "personal.html#section-id"
                    if (href && href.startsWith('personal.html#') && href.length > 'personal.html#'.length) {
                        targetId = href.substring(href.lastIndexOf('#') + 1);
                    // Check for links like "#section-id" (relative to current page)
                    } else if (href && href.startsWith('#') && href.length > 1) {
                        targetId = href.substring(1);
                    }

                    if (targetId) {
                        const section = document.getElementById(targetId);
                        return section ? { link: link, section: section } : null; // Return pair if section found
                    }
                } catch (e) {
                    logger.error('[Scrollspy Setup] Error processing link', link, e);
                }
                return null; // Skip invalid links or missing sections
            })
            .filter(item => item !== null); // Remove null entries

        if (!scrollspyElements.sections.length) {
            logger.warn('Scrollspy setup failed: No corresponding sections found for the nav links.');
            scrollspyElements = { links: [], sections: [], header: null, mobileToggle: null, navList: null, indicator: null }; // Clear all
            return;
        }

        logger.info(`Scrollspy setup complete. Monitoring ${scrollspyElements.sections.length} sections.`);
        checkAndAttachScrollspyListener(); // Perform initial check and attach listener if needed
    }

    /**
     * Updates the active class on navigation links AND the indicator position/visibility.
     */
    function updateScrollspyActiveLink() {
        // Ensure all elements needed are available
        if (!scrollspyElements.sections.length || !scrollspyElements.header || !scrollspyElements.navList || !scrollspyElements.indicator) return;

        const headerHeight = scrollspyElements.header.offsetHeight;
        const scrollOffset = headerHeight + CONFIG.SCROLL_OFFSET_MARGIN;
        let currentSectionData = null;
        let activeLinkElement = null;

        // Find the currently active section based on scroll position
        // Iterate backwards to find the *last* section whose top is above the offset
        for (let i = scrollspyElements.sections.length - 1; i >= 0; i--) {
            const sectionData = scrollspyElements.sections[i];
            if (!sectionData || !sectionData.section) continue; // Safety check

            const rect = sectionData.section.getBoundingClientRect();
            // Check if the top of the section is at or above the scroll trigger point
            if (rect.top <= scrollOffset) {
                currentSectionData = sectionData;
                activeLinkElement = sectionData.link;
                break; // Found the current section
            }
        }

        // Special case: If scrolled very near the bottom, activate the last link
        if (!activeLinkElement && (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
             const lastSectionData = scrollspyElements.sections[scrollspyElements.sections.length - 1];
             if (lastSectionData) {
                 currentSectionData = lastSectionData;
                 activeLinkElement = lastSectionData.link;
             }
        }

         // Edge case: If scrolled way above the first section, deactivate all
         if (!activeLinkElement && scrollspyElements.sections.length > 0) {
             const firstSection = scrollspyElements.sections[0]?.section;
             if (firstSection) {
                const firstSectionTop = firstSection.getBoundingClientRect().top;
                if (firstSectionTop > scrollOffset) {
                     // User is above the first section, no link should be active
                     currentSectionData = null;
                     activeLinkElement = null;
                }
             }
         }

        // --- Update Link Active Classes ---
        scrollspyElements.links.forEach(link => {
            if (link === activeLinkElement) {
                link.classList.add(CONFIG.SCROLLSPY_ACTIVE_CLASS);
            } else {
                link.classList.remove(CONFIG.SCROLLSPY_ACTIVE_CLASS);
            }
        });

        // --- Update Indicator Position and Visibility ---
        if (activeLinkElement && isScrollspyActive) { // Only update indicator if active and in desktop view
            try {
                const navListRect = scrollspyElements.navList.getBoundingClientRect();
                const linkRect = activeLinkElement.getBoundingClientRect();

                // Calculate position relative to the navList container
                const indicatorLeft = linkRect.left - navListRect.left + scrollspyElements.navList.scrollLeft;
                const indicatorWidth = linkRect.width;

                scrollspyElements.indicator.style.left = `${indicatorLeft}px`;
                scrollspyElements.indicator.style.width = `${indicatorWidth}px`;
                scrollspyElements.indicator.style.opacity = '1';
                // logger.debug('[Scrollspy Indicator] Updated:', { left: indicatorLeft, width: indicatorWidth });
            } catch (error) {
                 logger.error('[Scrollspy Indicator] Error calculating position:', error);
                 scrollspyElements.indicator.style.opacity = '0'; // Hide indicator on error
            }
        } else {
            // No active link or not in active state (mobile), hide the indicator
            scrollspyElements.indicator.style.opacity = '0';
            // logger.debug('[Scrollspy Indicator] Hidden');
        }

        // logger.debug('[Scrollspy Update] Active section:', currentSectionData?.section?.id);
    }

    /**
     * Throttled scroll handler for scrollspy.
     */
    function handleScrollspyScroll() {
        // Throttle execution: only run if not already waiting for timeout and scrollspy is active
        if (!scrollspyThrottleTimeout && isScrollspyActive) {
            updateScrollspyActiveLink(); // Update classes and indicator
            scrollspyThrottleTimeout = setTimeout(() => {
                scrollspyThrottleTimeout = null; // Clear timeout ID after execution
            }, CONFIG.SCROLLSPY_THROTTLE_DELAY);
        }
    }

    /**
     * Checks if desktop view is active and attaches/detaches listener AND updates indicator state.
     */
    function checkAndAttachScrollspyListener() {
        // Ensure all required elements exist
        if (!scrollspyElements.mobileToggle || !scrollspyElements.sections.length || !scrollspyElements.navList || !scrollspyElements.indicator) {
            // If essential elements are missing, ensure listener is removed and indicator hidden
             if (isScrollspyActive) {
                 window.removeEventListener('scroll', handleScrollspyScroll);
                 isScrollspyActive = false;
                 if(scrollspyElements.indicator) scrollspyElements.indicator.style.opacity = '0'; // Ensure indicator is hidden
                 logger.info("Scrollspy listener detached (missing elements).");
             }
             return; // Exit if setup cannot complete
        }

        const isDesktopView = getComputedStyle(scrollspyElements.mobileToggle).display === 'none';

        if (isDesktopView && !isScrollspyActive) {
            // Attach listener for desktop view
            window.addEventListener('scroll', handleScrollspyScroll, { passive: true });
            isScrollspyActive = true;
            updateScrollspyActiveLink(); // Run once on attach to set initial state/indicator
            logger.info("Scrollspy listener attached (Desktop View).");
        } else if (!isDesktopView && isScrollspyActive) {
            // Detach listener when switching to mobile view
            window.removeEventListener('scroll', handleScrollspyScroll);
            isScrollspyActive = false;
            // Deactivate all links and hide indicator when switching to mobile
            scrollspyElements.links.forEach(link => link.classList.remove(CONFIG.SCROLLSPY_ACTIVE_CLASS));
            scrollspyElements.indicator.style.opacity = '0'; // Hide indicator explicitly
            logger.info("Scrollspy listener detached (Mobile View).");
        } else if (isDesktopView && isScrollspyActive) {
            // Still in desktop view and active, update indicator position in case of resize
            updateScrollspyActiveLink();
        } else if (!isDesktopView && !isScrollspyActive) {
            // Still in mobile view and inactive, ensure indicator is hidden
            if(scrollspyElements.indicator) scrollspyElements.indicator.style.opacity = '0';
        }
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
        // Focus management for mobile menu
        if (isExpanded) {
            // Focus first focusable item in the nav
            safeFocus(nav.querySelector('a[href], button'));
        } else {
            // If focus was inside the nav when closing, return focus to the toggle button
            if (document.activeElement && nav.contains(document.activeElement)) {
                 safeFocus(toggle);
            }
        }
        logger.debug('Mobile navigation toggled:', isExpanded ? 'Open' : 'Closed');
    }

    function handleSmoothScroll(event) {
        const anchor = event.currentTarget;
        const href = anchor.getAttribute('href');
        let targetId = null;

        // Check for "personal.html#section" or just "#section"
        if (href && href.includes('#')) {
            const parts = href.split('#');
            // Ensure it's either empty before # (same page) or 'personal.html'
            if (parts[0] === '' || parts[0] === 'personal.html') {
                 if (parts[1]) { // Make sure there's an ID after #
                      targetId = parts[1];
                 }
            }
        }

        if (!targetId) return; // Not a valid internal scroll link for this page

        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            event.preventDefault(); // Prevent default jump
            logger.debug(`[SmoothScroll] Scrolling to: #${targetId}`);

            // Close mobile nav if open and link is inside it
            const nav = document.getElementById('primary-navigation');
            if (nav?.classList.contains('active') && anchor.closest('#primary-navigation')) {
                handleMobileNavToggle(); // Close mobile nav
            }

            // Calculate scroll position with offset
            const headerOffset = currentHeaderHeight + CONFIG.SCROLL_OFFSET_MARGIN; // Use live header height
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({ top: offsetPosition, behavior: "smooth" });

            // Improve accessibility: Set focus to the target section after scrolling
            setTimeout(() => {
                 // Ensure target is focusable (add tabindex=-1 if not inherently focusable)
                 if (!targetElement.hasAttribute('tabindex')) {
                     targetElement.setAttribute('tabindex', '-1');
                 }
                 safeFocus(targetElement); // Set focus
            }, 600); // Delay slightly longer than typical smooth scroll duration
        } else {
            logger.warn(`[SmoothScroll] Target element "#${targetId}" not found.`);
        }
    }

    function handleResize() { // MODIFIED
        updateHeaderHeight(); // Recalculate header height

        // Close mobile nav if window becomes large enough
        const nav = document.getElementById('primary-navigation');
        if (window.innerWidth > 991 && nav?.classList.contains('active')) {
            handleMobileNavToggle();
        }

        // Re-evaluate scrollspy state and update indicator position/visibility
        checkAndAttachScrollspyListener();
    }

    function handleFeedbackTypeChange(event) {
        const form = document.getElementById('feedback-testimonial-form');
        if (!form) return; // Guard against missing form
        const permissionGroup = form.querySelector('.permission-group');
        const permissionCheckbox = permissionGroup?.querySelector('#feedback-permission'); // Use '?' for safety
        if (!permissionGroup || !event?.target) return; // Guard against missing elements/event

        const isTestimonial = event.target.value === 'testimonial';
        permissionGroup.hidden = !isTestimonial; // Show/hide based on selection

        // If type changes away from testimonial, uncheck the permission box
        if (!isTestimonial && permissionCheckbox) {
            permissionCheckbox.checked = false;
        }
        logger.debug('Feedback type changed. Permission group visible:', isTestimonial);
    }

    // --- Template Interaction Handlers ---
    function handleGetSpreadsheetClick(event) {
        event.preventDefault();
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
        if (!card || !templateKey) { logger.error("Could not find template card or data-template-key on button:", button); alert("Sorry, there was an error initiating the download."); return; }
        const pdfUrl = CONFIG.PDF_FILES[templateKey];
        const templateName = card.querySelector('h3')?.textContent || 'Template'; // Get name from card
        if (!pdfUrl || pdfUrl === '#') { // Check if URL is configured and valid
            alert(`Download is currently unavailable for "${templateName}". Please check back later.`);
            logger.warn(`PDF path invalid/missing for template key: "${templateKey}". Configured URL: ${pdfUrl}`);
            return;
        }
        logger.info(`Initiating PDF download for: ${templateName} (${templateKey}) from ${pdfUrl}`);
        const originalButtonHtml = button.innerHTML;
        button.disabled = true; button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> <span>Downloading...</span>';
        try {
            // Create a temporary link to trigger the download
            const link = document.createElement('a'); link.href = pdfUrl;
            // Create a safe filename
            const safeName = templateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            link.download = `rofilid-${safeName}-template.pdf`; // Set the download attribute
            document.body.appendChild(link); // Append to body
            link.click(); // Simulate click
            document.body.removeChild(link); // Remove link immediately after click
            // Restore button state after a delay
            setTimeout(() => { button.innerHTML = originalButtonHtml; button.disabled = false; }, CONFIG.PDF_DOWNLOAD_FEEDBACK_DELAY);
        } catch (error) {
            logger.error("PDF Download failed:", error); alert(`Sorry, the download for "${templateName}" encountered an error. Please try again later.`);
            // Restore button state on error
            button.innerHTML = originalButtonHtml; button.disabled = false;
        }
    }

    // --- Animation Setup ---
    function setupAnimations() {
        // Check for IntersectionObserver support
        if (!("IntersectionObserver" in window)) {
            logger.warn("IntersectionObserver not supported. Skipping scroll animations.");
            // Make all elements visible immediately if observer not supported
            document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
            return;
        }
        // Setup fade-in for sections if enabled
        if (CONFIG.ENABLE_SECTION_FADE_IN) {
            const fadeObserverOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
            const fadeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible'); // Add visible class
                        observer.unobserve(entry.target); // Stop observing once visible
                        logger.debug('Section faded in:', entry.target.id || entry.target.tagName);
                    }
                });
            }, fadeObserverOptions);
            // Observe relevant sections and the motivational quote aside
            document.querySelectorAll('#main-content > section:not(#hero)[data-animate-fade-in], #main-content > aside.motivational-quote[data-animate-fade-in]')
                .forEach(section => fadeObserver.observe(section));
        } else {
            // If disabled, make all elements visible immediately
            document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
        }
        // Setup staggered animation for hero stats if enabled
        const heroStatsGrid = document.querySelector('.hero-stats-grid');
        if (CONFIG.ENABLE_HERO_STATS_ANIMATION && heroStatsGrid) {
            const statCards = heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]');
            if (statCards.length > 0) {
                const statsObserverOptions = { threshold: 0.3 }; // Trigger when 30% visible
                const statsObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const card = entry.target;
                            // Calculate delay based on card index
                            const cardIndex = Array.from(statCards).indexOf(card);
                            const delay = cardIndex * 100; // 100ms stagger
                            card.style.transitionDelay = `${delay}ms`;
                            card.classList.add('is-visible'); // Add visible class
                            observer.unobserve(card); // Stop observing once animated
                            logger.debug('Hero stat card animated:', cardIndex);
                        }
                    });
                }, statsObserverOptions);
                statCards.forEach(card => statsObserver.observe(card)); // Observe each card
            }
        } else if (heroStatsGrid) {
            // If disabled, make stat cards visible immediately
            heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]').forEach(card => card.classList.add('is-visible'));
        }
        logger.info('Animations setup complete.');
    }

    // --- Dynamic Content Update ---
    function updateCopyrightYear() {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();
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

        // Smooth Scrolling for Internal Links
        document.querySelectorAll('a[href^="personal.html#"], a[href^="#"]').forEach(anchor => {
             const href = anchor.getAttribute('href');
             // Ensure it has a hash and it's not just "#"
             if (href.includes('#') && href.substring(href.lastIndexOf('#')).length > 1) {
                 anchor.addEventListener('click', handleSmoothScroll);
             }
        });

        // Resize Listener (Debounced)
        window.addEventListener('resize', debounce(handleResize, CONFIG.RESIZE_DEBOUNCE_DELAY));

        // Modal Overlay Click to Close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (event) => {
                 // Close only if click is directly on the overlay and it's the currently active modal
                if (event.target === overlay && activeModal === overlay) {
                    logger.debug('[Overlay Click] Closing modal:', overlay.id);
                    closeModal();
                }
            });
        });

        // Open Feedback Modal Button
        const openFeedbackBtn = document.getElementById('open-feedback-modal-btn');
        const feedbackModal = document.getElementById('feedback-modal');
        if (openFeedbackBtn && feedbackModal) openFeedbackBtn.addEventListener('click', (e) => openModal(feedbackModal, e.currentTarget));
        else logger.warn("Open Feedback button or Feedback Modal not found.");

        // Generic Modal Close Buttons (inside modals)
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            const modal = btn.closest('.modal-overlay');
            if (modal) {
                 btn.addEventListener('click', () => {
                     logger.debug(`[Close Button Click] Closing modal: ${modal.id}`);
                     closeModal(); // Use the main closeModal function
                 });
            } else {
                logger.warn("Close button found outside of a modal overlay:", btn);
            }
        });

        // Template Interaction Buttons
        document.querySelectorAll('.get-spreadsheet-btn').forEach(button => button.addEventListener('click', handleGetSpreadsheetClick));
        document.querySelectorAll('.download-pdf-btn').forEach(button => button.addEventListener('click', handleDownloadPdfClick));

        // Coaching Interest Form Submission
        const coachingInterestForm = document.getElementById('coachingInterestForm');
        if (coachingInterestForm) {
            coachingInterestForm.addEventListener('submit', (e) => handleFormSubmit({
                event: e,
                formId: 'coachingInterestForm',
                fields: [
                    { id: 'interest-email', name: 'email', required: true, validator: isValidEmail, label: 'Email', errorMessage: 'Please enter a valid email address.', requiredMessage: 'Email address is required.' }
                ],
                submitButtonSelector: 'button[type="submit"]',
                successMessage: 'Thank you! We\'ll notify you when coaching becomes available.',
                errorMessage: 'Submission failed. Please check your email or try again later.',
                endpointAction: 'coachingInterest', // For logging/potential future API
                closeModalOnSuccess: false // Don't close modal on success for this form
            }));
        } else {
             logger.warn("Coaching interest form (#coachingInterestForm) not found.");
        }

        // Feedback/Testimonial Form Submission
        const feedbackForm = document.getElementById('feedback-testimonial-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => handleFormSubmit({
                event: e,
                formId: 'feedback-testimonial-form',
                fields: [
                    { id: 'feedback-name', name: 'name' }, // Optional
                    { id: 'feedback-email', name: 'email', validator: (val) => !val || isValidEmail(val), label: 'Email', errorMessage: 'Please enter a valid email or leave blank.' }, // Optional but validated if provided
                    { id: 'feedback-type', name: 'type', required: true, label: 'Type', requiredMessage: 'Please select a feedback type.' },
                    { id: 'feedback-message', name: 'message', required: true, label: 'Message', minLength: 10, maxLength: 2000, requiredMessage: 'Please enter your message.', errorMessage: 'Message must be between 10 and 2000 characters.' },
                    { id: 'feedback-permission', name: 'permissionGranted', type: 'checkbox' } // Handles checkbox value
                ],
                submitButtonSelector: 'button[type="submit"]',
                successMessage: 'Feedback submitted successfully. Thank you!',
                errorMessage: 'Submission failed. Please check the form or try again.',
                endpointAction: 'submitFeedback', // For logging/potential future API
                closeModalOnSuccess: true, // Close modal on successful submission
                onSuccess: resetFeedbackForm // Reset form state after successful submission
            }));
            // Feedback Type Change Listener (to show/hide permission checkbox)
            const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
            if (feedbackTypeSelect) feedbackTypeSelect.addEventListener('change', handleFeedbackTypeChange);
            else logger.warn("Feedback type select (#feedback-type) not found in feedback form.");
        } else {
             logger.warn("Feedback form (#feedback-testimonial-form) not found.");
        }

        // Intro Quiz Start Buttons
        const quizStartBtns = document.querySelectorAll('#learning-hub .start-quiz-btn');
        if (quizStartBtns.length > 0) {
            quizStartBtns.forEach(button => button.addEventListener('click', handleIntroQuizStart));
        } else {
            logger.warn("No quiz start buttons found in #learning-hub.");
        }

        // Quiz Modal Navigation Buttons (check if elements exist first)
        if (quizModalElements.nextBtn) quizModalElements.nextBtn.addEventListener('click', nextIntroModalQuestion);
        if (quizModalElements.restartBtn) quizModalElements.restartBtn.addEventListener('click', restartIntroModalQuiz);
        if (quizModalElements.nextQuizBtn) quizModalElements.nextQuizBtn.addEventListener('click', handleIntroNextQuizClick);
        if (quizModalElements.closeResultsBtn) quizModalElements.closeResultsBtn.addEventListener('click', () => closeModal()); // Simple close action

        logger.info("Event listeners setup complete.");
    }

    /** Main Initialization Function */
    function initializePersonalPage() {
        logger.info(`Rofilid Personal Page Scripts Initializing (v${'2.7.1'})`); // Dynamic version reference possible

        // Page Context Check (Optional but good practice)
        if (!document.body.classList.contains('personal-page') && !document.documentElement.classList.contains('personal-page')) {
            logger.warn("Not on personal finance page (body/html class missing). Exiting script.");
            return;
        }

        // Attempt to cache essential elements early
        if (!cacheQuizModalElements()) {
            logger.error("Failed to cache essential quiz modal elements during init. Quiz functionality may be broken.");
            // Depending on severity, you might want to display an error to the user or halt further execution.
        }

        // --- Run Initial Setup Tasks ---
        updateHeaderHeight();       // Calculate initial header height
        setupEventListeners();      // Setup all event listeners
        setupScrollspy();           // Setup scrollspy AFTER listeners (relies on elements)
        setupAnimations();          // Setup intersection observers for animations
        updateCopyrightYear();      // Update dynamic content

        logger.info("Rofilid Personal Page Scripts Fully Loaded and Ready.");
    }

    // --- Run Initialization on DOM Ready ---
    if (document.readyState === 'loading') {
        // Loading hasn't finished yet
        document.addEventListener('DOMContentLoaded', initializePersonalPage);
    } else {
        // `DOMContentLoaded` has already fired
        initializePersonalPage();
    }

})(); // End IIFE
