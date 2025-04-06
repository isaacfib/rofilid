/**
 * File Location: /assets/js/personal/personal.js
 * Description: Scripts for the ROFILID Personal Finance page (personal.html).
 *              Handles navigation, smooth scrolling, modals, forms, animations,
 *              and template interactions specific to this page.
 * Version: 3.0.0 (Elite Responsiveness, Optimized Animations & Interactions)
 * Dependencies: Font Awesome (loaded via CSS/HTML)
 */

// Wrap in an IIFE to avoid polluting global scope
(function() {
    'use strict';

    // --- Configuration ---
    const CONFIG = {
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error', 'none'
        ENABLE_SCROLL_ANIMATIONS: true,
        RESIZE_DEBOUNCE_DELAY: 200, // Slightly faster debounce
        MODAL_FOCUS_DELAY: 150, // Allow a bit more time for transitions
        API_SIMULATION_DELAY: 1000, // Faster simulation
        PDF_DOWNLOAD_FEEDBACK_DELAY: 2000,
        LAST_INTRO_CATEGORY_ID: 4,
        STAGGER_DELAY_MS: 80, // Delay between staggered items
        SCROLL_OFFSET_SELECTOR: '.site-header', // Use selector to find header offset
        SCROLL_ADDITIONAL_OFFSET: 20, // Extra space above target after scroll
        PDF_FILES: {
            'line-budget': '../../assets/downloads/rofilid-line-item-budget.pdf',
            'networth': '../../assets/downloads/rofilid-net-worth-statement.pdf',
            'cashflow': '../../assets/downloads/rofilid-personal-cashflow.pdf',
            '50-30-20': '../../assets/downloads/rofilid-50-30-20-budget.pdf',
            'expense-tracker': '../../assets/downloads/rofilid-expense-tracker.pdf'
        }
    };

    // --- Logging Utility ---
    // Simplified logger - adjust levels in CONFIG
    const logger = {
        debug: (...args) => CONFIG.LOG_LEVEL === 'debug' && console.debug('%c[DEBUG]', 'color: blue; font-weight: bold;', ...args),
        info: (...args) => ['debug', 'info'].includes(CONFIG.LOG_LEVEL) && console.info('%c[INFO]', 'color: green; font-weight: bold;', ...args),
        warn: (...args) => ['debug', 'info', 'warn'].includes(CONFIG.LOG_LEVEL) && console.warn('%c[WARN]', 'color: orange; font-weight: bold;', ...args),
        error: (...args) => ['debug', 'info', 'warn', 'error'].includes(CONFIG.LOG_LEVEL) && console.error('%c[ERROR]', 'color: red; font-weight: bold;', ...args),
    };

    // --- Global State ---
    let activeModal = null;
    let triggerElement = null;
    let currentIntroQuizData = { questions: [], currentQuestionIndex: 0, score: 0, categoryId: null };
    let quizModalElements = {}; // Cached quiz modal DOM elements
    let intersectionObservers = []; // Keep track of observers to disconnect later if needed

    // =========================================================================
    // UTILITY HELPERS
    // =========================================================================

    /** Debounce function to limit function execution rate */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null; // Clear timeout ID *before* executing func
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

     /** Get calculated height of sticky header (or other offset element) */
    function getScrollOffset() {
        const offsetElement = document.querySelector(CONFIG.SCROLL_OFFSET_SELECTOR);
        const baseOffset = offsetElement ? offsetElement.offsetHeight : 0;
        return baseOffset + CONFIG.SCROLL_ADDITIONAL_OFFSET;
    }


    /** Safely attempt to focus an element, preventing scroll jump */
    function safeFocus(element, options = { preventScroll: true, focusVisible: true }) {
        if (element && typeof element.focus === 'function') {
            try {
                element.focus(options);
                // If focusVisible polyfill needed or want to force visible style:
                 if (options.focusVisible && !element.matches(':focus-visible')) {
                    // Needs careful consideration: This manually applies focus-visible styles
                    // It might be better to rely on browser implementation or a dedicated polyfill
                     // element.classList.add('focus-visible'); // Example: Apply a class
                    // logger.debug("[safeFocus] Forcing focus-visible appearance for:", element);
                 }
                 logger.debug("[safeFocus] Focused:", element);
            } catch (err) {
                logger.error("[safeFocus] Focusing element failed:", element, err);
            }
        } else {
            logger.warn("[safeFocus] Element is not valid or not focusable:", element);
        }
    }


    /** Basic email validation */
    function isValidEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/; // Added '+' for TLD
        return emailRegex.test(email.trim().toLowerCase());
    }

    /** Find the first focusable descendant or the element itself */
     function findFirstFocusable(element) {
         if (!element) return null;
         const focusableSelector = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
         const focusableElements = Array.from(element.querySelectorAll(focusableSelector))
             .filter(el => !el.disabled && !el.closest('[inert], [hidden]') && el.offsetParent !== null); // Filter out disabled, inert, hidden, non-rendered

         // Check the element itself if it's focusable
          if (element.matches(focusableSelector) && !element.disabled && !element.closest('[inert], [hidden]') && element.offsetParent !== null) {
            focusableElements.unshift(element);
          }

         return focusableElements[0] || null;
     }

    // =========================================================================
    // FOCUS TRAPPING
    // =========================================================================
    /**
     * Traps focus within a specified element.
     * Handles Tab and Shift+Tab keys.
     * Sets initial focus intelligently.
     */
     function trapFocus(element) {
         if (!element) {
             logger.warn('[trapFocus] Target element is null.');
             return { teardown: () => {} }; // Return dummy teardown
         }
         logger.debug('[trapFocus] Initializing for:', element);

         const focusableSelector = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
         let focusableEls = []; // Updated dynamically
         let firstFocusableEl = null;
         let lastFocusableEl = null;

         function updateFocusableElements() {
             focusableEls = Array.from(element.querySelectorAll(focusableSelector))
                 .filter(el => el.offsetParent !== null && !el.closest('[hidden], [inert]')); // Filter only visible/interactive

             firstFocusableEl = focusableEls[0] || null;
             lastFocusableEl = focusableEls[focusableEls.length - 1] || null;
             // logger.debug('[trapFocus] Updated focusable elements:', focusableEls.length);
         }

         // Find initial focus target (prioritize common elements)
         function findInitialFocusTarget() {
             return (
                 element.querySelector('.modal-close-btn:not([hidden])') ||
                 element.querySelector('.btn-primary:not([disabled]):not([hidden])') ||
                 element.querySelector('input:not([type="hidden"]):not([disabled]):not([hidden]), select:not([disabled]):not([hidden]), textarea:not([disabled]):not([hidden])') || // First form field
                 element.querySelector('.option-button:not([disabled]):not([hidden])') || // Quiz option
                 firstFocusableEl || // Fallback
                 element // Fallback to the container if absolutely nothing else is focusable
             );
         }


         function handleKeyDown(e) {
             if (e.key !== 'Tab' || !activeModal || activeModal !== element) {
                 return;
             }
              updateFocusableElements(); // Refresh list in case content changed

             if (focusableEls.length <= 1) {
                  e.preventDefault(); // Prevent tabbing out if only one or zero elements
                 return;
             }

              // If focus somehow escaped, bring it back
             if (!element.contains(document.activeElement)) {
                 logger.warn('[trapFocus] Focus escaped! Refocusing first element.');
                 e.preventDefault();
                 safeFocus(firstFocusableEl || element);
                 return;
             }

             if (e.shiftKey) { // Shift + Tab
                 if (document.activeElement === firstFocusableEl) {
                     e.preventDefault();
                     logger.debug('[trapFocus] Shift+Tab: Wrapping to last element.');
                     safeFocus(lastFocusableEl);
                 }
             } else { // Tab
                 if (document.activeElement === lastFocusableEl) {
                     e.preventDefault();
                     logger.debug('[trapFocus] Tab: Wrapping to first element.');
                     safeFocus(firstFocusableEl);
                 }
             }
         }

         // Initial setup
         updateFocusableElements();
         const initialTarget = findInitialFocusTarget();
          // Use timeout to allow transitions and rendering before focusing
         const focusTimeoutId = setTimeout(() => {
              if (activeModal === element) { // Ensure the modal hasn't been closed in the meantime
                  logger.debug('[trapFocus] Setting initial focus after delay to:', initialTarget);
                  safeFocus(initialTarget);
              } else {
                   logger.warn('[trapFocus] Modal changed before initial focus could be set.');
              }
          }, CONFIG.MODAL_FOCUS_DELAY);


         element.addEventListener('keydown', handleKeyDown);
         logger.debug('[trapFocus] Focus trap event listener added.');

         // Return teardown function
         return {
             teardown: () => {
                 clearTimeout(focusTimeoutId);
                 element.removeEventListener('keydown', handleKeyDown);
                 logger.debug('[trapFocus] Focus trap listener removed for:', element);
             }
         };
     }

     // Store the current trap's teardown function
     let currentFocusTrapTeardown = null;


    // =========================================================================
    // MODAL LOGIC
    // =========================================================================

    /** Open a modal dialog */
    function openModal(modalElement, openingTriggerElement) {
        logger.debug('[openModal] Attempting to open modal:', modalElement?.id);
        if (!modalElement || typeof modalElement.showModal !== 'function') { // Check for <dialog> support (can fallback)
             // Fallback or enhanced error needed if not using native dialog
            logger.error('[openModal] Failed: Target is not a valid modal element or <dialog> not supported/used.', modalElement);
             alert("Sorry, couldn't open this section.");
            return;
        }
        if (activeModal === modalElement) {
             logger.warn('[openModal] Modal already active:', modalElement.id);
             return;
        }

        // Close any previously active modal WITHOUT returning focus yet
        if (activeModal) {
             logger.info('[openModal] Closing previously active modal:', activeModal.id);
            closeModal(false); // Close without returning focus here
        }

        activeModal = modalElement;
        triggerElement = openingTriggerElement; // Store element that opened the modal

        // Prepare specific modals if necessary (e.g., resetting forms BEFORE showing)
        if (modalElement.id === 'feedback-modal') resetFeedbackForm();
        if (modalElement.id === 'quiz-modal') resetQuizModalUI(); // Basic reset

        // Use native <dialog> methods if possible, otherwise fallback needed
        try {
             // modalElement.showModal(); // Native method, handles initial focus, ESC, backdrop click etc. IF it's a <dialog> element
             // Using manual classes and backdrop since original HTML doesn't use <dialog>
             document.body.style.overflow = 'hidden';
             modalElement.hidden = false;
             requestAnimationFrame(() => {
                 modalElement.classList.add('visible'); // For CSS transition
                 modalElement.removeAttribute('aria-hidden');

                  // Initialize focus trap *after* modal starts transition
                 if (currentFocusTrapTeardown) currentFocusTrapTeardown.teardown(); // Clean up old trap first
                 currentFocusTrapTeardown = trapFocus(modalElement.querySelector('.modal-content')); // Trap within content area
             });

            // Add ESC key listener for non-dialog elements
             document.addEventListener('keydown', handleModalKeydown); // Add manual ESC handler

            logger.info('[openModal] Modal opened successfully:', modalElement.id);

        } catch (error) {
             logger.error('[openModal] Error opening modal:', modalElement.id, error);
             activeModal = null; // Reset state on error
             triggerElement = null;
             document.body.style.overflow = ''; // Restore scroll
             alert("Sorry, there was an error opening this section.");
        }
    }

    /** Close the currently active modal */
    function closeModal(returnFocus = true) {
        if (!activeModal) {
             logger.debug('[closeModal] No active modal to close.');
             return;
        }

        const modalToClose = activeModal;
        const triggerToFocus = triggerElement;

        logger.info('[closeModal] Closing modal:', modalToClose.id);

         // Clean up focus trap first
        if (currentFocusTrapTeardown) {
             currentFocusTrapTeardown.teardown();
             currentFocusTrapTeardown = null;
         }

        activeModal = null; // Clear state immediately
        triggerElement = null;

         // Use manual class removal since not using native <dialog>
         modalToClose.classList.remove('visible');
         modalToClose.setAttribute('aria-hidden', 'true');
         document.removeEventListener('keydown', handleModalKeydown); // Remove manual ESC listener


        // Hide after transition (safer than relying on the transitionend event alone)
        // Use timeout matching the CSS transition duration
         setTimeout(() => {
              // Only hide and restore scroll if this modal instance is truly the one meant to be closed
              // and no other modal has become active in the meantime.
              if (!activeModal) { // Check if another modal hasn't opened very quickly
                   modalToClose.hidden = true;
                   document.body.style.overflow = ''; // Restore body scroll
                  logger.debug('[closeModal] Modal hidden and scroll restored for:', modalToClose.id);

                  // Return focus ONLY if specified and we have a valid trigger
                   if (returnFocus && triggerToFocus) {
                      logger.debug('[closeModal] Returning focus to:', triggerToFocus);
                       safeFocus(triggerToFocus);
                   } else if (returnFocus) {
                      logger.warn('[closeModal] Could not return focus: Trigger element was not stored or is invalid.');
                   }
               } else {
                   logger.info('[closeModal] A new modal became active before transition ended. Scroll not restored.', activeModal.id);
               }
        }, 300); // Match CSS transition duration (--pp-transition-medium)
    }

    /** Handle Escape key press for closing modals (Manual handler for non-<dialog>) */
    function handleModalKeydown(event) {
        if (event.key === 'Escape' && activeModal) {
            logger.debug('[handleModalKeydown] Escape key pressed. Closing modal:', activeModal.id);
            closeModal(); // Should handle focus return
        }
    }

    // =========================================================================
    // FORM HANDLING & VALIDATION
    // =========================================================================

    function showFormResponseMessage(formElement, message, type = 'success') {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (!responseEl) { logger.warn(`[Form Response] Response element not found for:`, formElement?.id); return; }

        responseEl.textContent = message;
        responseEl.className = `form-response-note ${type}`; // Ensure base class + type
        responseEl.hidden = false;
        // Set aria-live based on importance
        responseEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        logger.debug(`[Form Response] Shown: ${type} - "${message}" for form ${formElement?.id}`);
    }

    function hideFormResponseMessage(formElement) {
        const responseEl = formElement?.querySelector('.form-response-note');
        if (responseEl && !responseEl.hidden) {
            responseEl.hidden = true;
            responseEl.textContent = '';
            responseEl.removeAttribute('aria-live');
            logger.debug(`[Form Response] Hidden for form ${formElement?.id}`);
        }
    }

    function clearFormErrors(formElement) {
        if (!formElement) return;
        let errorsCleared = 0;
        formElement.querySelectorAll('.form-error-msg').forEach(msg => {
             if (msg.textContent) { // Only clear if it had text
                msg.textContent = '';
                errorsCleared++;
            }
        });
        formElement.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby'); // Remove link to error msg (assuming it was set)
            errorsCleared++;
        });
        if (errorsCleared > 0) logger.debug(`[Form Validation] Errors cleared for form ${formElement?.id}`);
    }

    function showInputError(inputElement, message) {
        if (!inputElement) { logger.warn(`[showInputError] Invalid input element provided.`); return; }

        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) { logger.warn(`[showInputError] No .form-group parent found for input:`, inputElement); return; }

        const errorMsgElement = formGroup.querySelector('.form-error-msg');

        inputElement.classList.add('is-invalid');
        inputElement.setAttribute('aria-invalid', 'true');

        if (errorMsgElement) {
            errorMsgElement.textContent = message;
            // Ensure the error message has an ID and link input to it via aria-describedby
             if (!errorMsgElement.id) {
                errorMsgElement.id = `${inputElement.id || `input-${Math.random().toString(36).substring(2, 9)}`}-error`;
             }
             inputElement.setAttribute('aria-describedby', errorMsgElement.id);
             logger.debug(`[Form Validation] Error shown for input #${inputElement.id}: "${message}" (Linked via ${errorMsgElement.id})`);
        } else {
             logger.warn(`[Form Validation] Error message element (.form-error-msg) not found within form group for input:`, inputElement);
        }
    }


    /** Unified form validation and data retrieval */
    function validateAndGetFormData(formId, fieldDefinitions) {
        const form = document.getElementById(formId);
        if (!form) {
            logger.error(`[validateAndGetFormData] Form not found: #${formId}`);
            return { isValid: false, data: null, firstInvalidElement: null };
        }
        logger.debug(`[validateAndGetFormData] Validating form: #${formId}`);

        clearFormErrors(form); // Clear previous errors first
        let isValid = true;
        let firstInvalidElement = null;
        const formData = new FormData(form); // Use FormData for easier retrieval
        const validatedData = {}; // Store processed data

        fieldDefinitions.forEach(field => {
            const inputElement = form.querySelector(`#${field.id}`);
            if (!inputElement) {
                logger.warn(`[validateAndGetFormData] Input not found for field definition:`, field);
                return; // Skip field if element doesn't exist
            }

            let value;
            if (inputElement.type === 'checkbox') {
                value = inputElement.checked;
                validatedData[field.name] = value; // Add boolean directly
            } else if (inputElement.type === 'radio') {
                 if (inputElement.checked) {
                     validatedData[field.name] = inputElement.value;
                     value = inputElement.value;
                 } else {
                    return; // Only process the checked radio in a group
                 }
            } else {
                value = formData.get(field.name)?.trim() || ''; // Get trimmed value from FormData
                validatedData[field.name] = value;
            }


            // --- Validation Logic ---
            let fieldError = false;
             // Required check (skip checkbox false, empty radios often invalid)
             if (field.required && !value && inputElement.type !== 'checkbox') {
                showInputError(inputElement, field.requiredMessage || `${field.label || 'Field'} is required.`);
                fieldError = true;
             }
             // Validator function check
             else if (field.validator && !field.validator(value, validatedData)) { // Pass full data for context validation
                 showInputError(inputElement, field.errorMessage || `Invalid value for ${field.label || 'field'}.`);
                 fieldError = true;
             }
              // Max Length Check (for strings)
             else if (typeof value === 'string' && field.maxLength && value.length > field.maxLength) {
                 showInputError(inputElement, `${field.label || 'Field'} cannot exceed ${field.maxLength} characters (currently ${value.length}).`);
                 fieldError = true;
             }
              // Min Length Check (for strings)
             else if (typeof value === 'string' && field.minLength && value.length < field.minLength) {
                 showInputError(inputElement, `${field.label || 'Field'} must be at least ${field.minLength} characters (currently ${value.length}).`);
                 fieldError = true;
             }

             if (fieldError) {
                 isValid = false;
                 if (!firstInvalidElement) {
                    firstInvalidElement = inputElement; // Track first invalid element for focus
                 }
             }
        });

        if (!isValid && firstInvalidElement) {
            logger.warn(`[validateAndGetFormData] Validation FAILED for #${formId}. Focusing first invalid element:`, firstInvalidElement);
            safeFocus(firstInvalidElement);
        } else if (isValid) {
             logger.info(`[validateAndGetFormData] Validation SUCCESS for #${formId}`);
        }

        return { isValid, data: validatedData, firstInvalidElement };
    }

    /** Unified async form submission handler */
    async function handleFormSubmit(options) {
        const { event, formId, fields, submitButtonSelector, successMessage, errorMessage, endpointAction, closeModalOnSuccess = false, onSuccess, onError } = options;
        if (event) event.preventDefault(); // Prevent default if event object is passed

        const form = document.getElementById(formId);
        const submitButton = form?.querySelector(submitButtonSelector);

        if (!form || !submitButton) {
            logger.error(`[handleFormSubmit] Critical Error: Form #${formId} or submit button '${submitButtonSelector}' not found.`);
            return;
        }
         if (submitButton.disabled) {
             logger.warn(`[handleFormSubmit] Form #${formId} submission already in progress.`);
             return; // Prevent double submission
         }

        // 1. Validate Form
        const validationResult = validateAndGetFormData(formId, fields);
        if (!validationResult.isValid) {
             showFormResponseMessage(form, 'Please correct the errors above.', 'error'); // Show generic error msg if validation fails
             return; // Stop if validation fails
        }

         // 2. Indicate Loading State
         const originalButtonHtml = submitButton.innerHTML;
         submitButton.disabled = true;
         submitButton.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> <span>Submitting...</span>`;
         hideFormResponseMessage(form); // Hide previous messages


         // 3. API Simulation / Actual API Call
         logger.info(`[handleFormSubmit] Simulating API call for action: ${endpointAction}`, validationResult.data);
         let submissionSuccess = false;
         try {
             // Simulate network delay
             await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
             const shouldSucceed = Math.random() > 0.1; // ~90% success rate for simulation

              if (shouldSucceed) {
                  // ---- SIMULATED SUCCESS ----
                 logger.info(`[handleFormSubmit] Simulated API call SUCCESS for ${endpointAction}`);
                 submissionSuccess = true;

                  // Call success callback FIRST (might influence UI before reset)
                  if (onSuccess) onSuccess(validationResult.data);

                  showFormResponseMessage(form, successMessage, 'success');
                  form.reset(); // Reset form fields
                 // Manually trigger change for selects after reset if needed (like feedback type)
                 form.querySelectorAll('select').forEach(select => {
                     select.dispatchEvent(new Event('change', { bubbles: true }));
                 });

                  // Handle modal closing or refocus after success
                  if (closeModalOnSuccess) {
                     setTimeout(() => {
                          // Check if the *correct* modal is still active before closing
                          const parentModal = form.closest('.modal-overlay');
                          if (parentModal && activeModal === parentModal) {
                              closeModal(false); // Close without returning focus (form interaction finished)
                           }
                       }, 2000); // Delay allows user to see success message
                  } else {
                     // Focus an element outside the form to move user away, e.g., the modal title
                     const heading = form.closest('.modal-content')?.querySelector('h3');
                     safeFocus(heading || form); // Focus heading or form itself as fallback
                 }

             } else {
                  // ---- SIMULATED FAILURE ----
                 throw new Error("Simulated API error during submission.");
             }
         } catch (error) {
             // ---- HANDLE ERROR (Simulated or Real) ----
              logger.error(`[handleFormSubmit] API call FAILED for ${endpointAction}:`, error);
              showFormResponseMessage(form, errorMessage, 'error');
              submissionSuccess = false; // Ensure success flag is false
              if (onError) onError(error); // Call error callback

             // On generic error, focus the first field to encourage correction
             const firstField = form.querySelector('input, select, textarea');
              safeFocus(firstField);

         } finally {
              // 4. Restore Button State (unless closing modal)
              if (!closeModalOnSuccess || !submissionSuccess) { // Restore if not closing or if submission failed
                  submitButton.disabled = false;
                  submitButton.innerHTML = originalButtonHtml;
             }
              logger.debug(`[handleFormSubmit] Submission process finished for ${formId}. Success: ${submissionSuccess}`);
         }
     }


    /** Resets the feedback form state */
    function resetFeedbackForm() {
        const form = document.getElementById('feedback-testimonial-form');
        if (!form) return;
        form.reset();
        clearFormErrors(form);
        hideFormResponseMessage(form);

        const typeSelect = form.querySelector('#feedback-type');
        if (typeSelect) handleFeedbackTypeChange({ target: typeSelect }); // Reset permission group visibility

        // Ensure button is re-enabled and text is correct
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
             submitButton.disabled = false;
            // Restore original HTML structure for the button
            submitButton.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Submit Feedback';
         }
         logger.debug("[resetFeedbackForm] Feedback form state reset.");
    }

     /** Handle visibility of permission checkbox based on feedback type */
     function handleFeedbackTypeChange(event) {
         const form = document.getElementById('feedback-testimonial-form');
         const typeSelect = event.target;
         if (!form || !typeSelect) return;
         const permissionGroup = form.querySelector('.permission-group');
         const permissionCheckbox = permissionGroup?.querySelector('#feedback-permission');

          if (permissionGroup) {
            const isTestimonial = typeSelect.value === 'testimonial';
             permissionGroup.hidden = !isTestimonial;
            if (!isTestimonial && permissionCheckbox) {
                permissionCheckbox.checked = false; // Uncheck if not testimonial type
            }
            logger.debug('[handleFeedbackTypeChange] Permission group visible:', isTestimonial);
        }
     }

    // =========================================================================
    // EVENT HANDLERS & PAGE SETUP
    // =========================================================================

     /** Toggle mobile navigation menu */
    function handleMobileNavToggle(event) {
        const toggleButton = event.currentTarget;
        const navList = document.getElementById('primary-navigation');

        if (!navList || !toggleButton) {
             logger.error('[handleMobileNavToggle] Navigation list or toggle button not found.');
             return;
        }

        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';

        toggleButton.setAttribute('aria-expanded', !isExpanded);
        navList.classList.toggle('active');
         document.body.style.overflow = !isExpanded ? 'hidden' : ''; // Toggle body scroll lock


        if (!isExpanded) { // Menu is opening
            // Focus first focusable item in the nav list
            safeFocus(findFirstFocusable(navList));
        } else { // Menu is closing
             // If focus was inside the nav list, return it to the toggle button
            if (navList.contains(document.activeElement)) {
                safeFocus(toggleButton);
            }
             document.body.style.overflow = ''; // Ensure scroll is restored
        }

        logger.debug(`[handleMobileNavToggle] Navigation toggled. Expanded: ${!isExpanded}`);
    }


    /** Handle smooth scrolling for anchor links */
    function handleSmoothScroll(event) {
         const link = event.currentTarget;
         const href = link.getAttribute('href');

          // Ensure it's an internal anchor link
         if (!href || !href.startsWith('#') || href.length < 2) {
            return;
         }

         const targetId = href.substring(1);
         const targetElement = document.getElementById(targetId);

         if (targetElement) {
             event.preventDefault(); // Prevent default jump
             logger.debug(`[handleSmoothScroll] Attempting scroll to: ${href}`);

              // Close mobile nav if the link is inside it and it's open
              const navList = document.getElementById('primary-navigation');
              const toggleButton = document.querySelector('.mobile-menu-toggle');
             if (navList?.classList.contains('active') && link.closest('#primary-navigation')) {
                  // We need to manually trigger the close logic here
                  toggleButton.setAttribute('aria-expanded', 'false');
                  navList.classList.remove('active');
                 document.body.style.overflow = ''; // Restore scroll
                  logger.debug('[handleSmoothScroll] Closing mobile nav during scroll.');
             }


             const offset = getScrollOffset(); // Calculate offset dynamically
             const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
             const offsetPosition = elementPosition - offset;

             // Use native smooth scroll
             window.scrollTo({
                 top: offsetPosition,
                 behavior: 'smooth'
             });

              // Enhance accessibility: Set focus to the target after scroll animation completes
              // Using setTimeout is a common approach, though not perfect
             const scrollTimeout = setTimeout(() => {
                  targetElement.setAttribute('tabindex', '-1'); // Ensure target is programmatically focusable
                  safeFocus(targetElement, { preventScroll: true }); // Prevent scroll jump on focus
                  // Optional: remove tabindex after a brief period? Debatable accessibility practice.
                  // setTimeout(() => targetElement.removeAttribute('tabindex'), 1500);
             }, 700); // Estimate time for scroll animation

              // Consider clearing timeout if user scrolls again quickly
              // (More complex logic needed for robust cancellation)

         } else {
             logger.warn(`[handleSmoothScroll] Target element not found for ID: ${targetId}`);
         }
    }


    /** Handle window resize events (debounced) */
    const handleResize = debounce(() => {
        logger.debug('[handleResize] Window resized.');
        // getScrollOffset(); // Recalculate cached offset if needed, though dynamic calc is better

        // Optional: Close mobile nav if window becomes large while it's open
        const navList = document.getElementById('primary-navigation');
        if (window.innerWidth >= 1024 && navList?.classList.contains('active')) { // Use the same breakpoint as mobile nav CSS
            const toggleButton = document.querySelector('.mobile-menu-toggle');
            if (toggleButton) {
                toggleButton.setAttribute('aria-expanded', 'false');
                 navList.classList.remove('active');
                 document.body.style.overflow = '';
                logger.info('[handleResize] Closing mobile nav automatically on resize to desktop.');
            }
        }
     }, CONFIG.RESIZE_DEBOUNCE_DELAY);


    // --- Template Interaction Handlers ---
    function handleGetSpreadsheetClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const templateName = button.dataset.templateName || 'Spreadsheet Template';
        const price = Number(button.dataset.price || '0');
        const formattedPrice = price > 0
            ? price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })
            : 'Paid Feature'; // Handle case where price might be 0 or missing

        // Improved alert message
         alert(`Interactive Spreadsheet: "${templateName}" (${formattedPrice})\n\nThank you for your interest! This feature is currently in development.\nIt will require a Gmail account for delivery.\n\nStay tuned for updates!`);
         logger.info(`[Get Spreadsheet] Interest recorded for: ${templateName}, Price: ${formattedPrice}`);
     }


    function handleDownloadPdfClick(event) {
        event.preventDefault();
        const button = event.currentTarget;
        if (button.disabled) return; // Prevent double clicks

        const card = button.closest('.template-card');
        const templateKey = button.dataset.templateKey;
        const templateName = card?.querySelector('h3')?.textContent || 'Template'; // More robust name fetching

        if (!card || !templateKey) {
             logger.error("[handleDownloadPdfClick] Missing card or template key attribute.", button);
            alert("Sorry, an error occurred identifying the template.");
             return;
        }

         const pdfUrl = CONFIG.PDF_FILES[templateKey];
        if (!pdfUrl || pdfUrl === '#') {
            logger.warn(`[handleDownloadPdfClick] PDF URL is missing or invalid for key: ${templateKey}. Configured: ${pdfUrl}`);
             alert(`Download currently unavailable for "${templateName}". Please check back soon.`);
             return;
        }

         logger.info(`[handleDownloadPdfClick] Initiating download for: "${templateName}" from ${pdfUrl}`);

        // Update button state BEFORE initiating download
        const originalButtonHtml = button.innerHTML;
         button.disabled = true;
        button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> <span>Downloading...</span>'; // Success icon temporary

        try {
            // Use a more robust download method (create link, click, remove)
            const link = document.createElement('a');
             link.href = pdfUrl;
             // Create a safer filename
            const safeName = templateKey.toLowerCase().replace(/[^a-z0-9-]+/g, '-') || 'document';
             link.download = `rofilid-${safeName}-template.pdf`;
             link.style.display = 'none'; // Hide the link
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
             logger.info(`[handleDownloadPdfClick] Download triggered for ${templateName}`);

            // Restore button after a slightly longer delay
            setTimeout(() => {
                button.disabled = false;
                 button.innerHTML = originalButtonHtml;
            }, CONFIG.PDF_DOWNLOAD_FEEDBACK_DELAY + 500);

        } catch (error) {
             logger.error("[handleDownloadPdfClick] Download initiation failed:", error);
            alert(`Sorry, the download for "${templateName}" couldn't be started. Please try again later or check your browser settings.`);
            // Restore button immediately on error
             button.disabled = false;
             button.innerHTML = originalButtonHtml;
         }
    }

    // =========================================================================
    // ANIMATIONS (Intersection Observer)
    // =========================================================================

     /** Setup Intersection Observers for scroll animations */
     function setupScrollAnimations() {
         if (!CONFIG.ENABLE_SCROLL_ANIMATIONS || !("IntersectionObserver" in window)) {
             logger.warn("[setupScrollAnimations] Animations disabled or IntersectionObserver not supported. Setting elements visible immediately.");
             // Make all elements visible immediately if disabled or unsupported
              document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
             return;
         }
         logger.info("[setupScrollAnimations] Setting up scroll-triggered animations...");

          // --- Observer for General Fade-In Elements ---
          const fadeObserverOptions = {
             threshold: 0.15, // Trigger when 15% visible
             rootMargin: "0px 0px -50px 0px" // Trigger slightly before fully in view from bottom
         };
          const fadeObserver = new IntersectionObserver((entries, observer) => {
             entries.forEach(entry => {
                 if (entry.isIntersecting) {
                     const target = entry.target;
                     logger.debug('[Animation] Fading in:', target.id || target.tagName);
                      target.classList.add('is-visible');

                     // Check if element contains children to stagger
                      const staggerChildren = target.querySelectorAll('[data-stagger-child]');
                      if (staggerChildren.length > 0) {
                         logger.debug(`[Animation] Staggering ${staggerChildren.length} children of`, target);
                          staggerChildren.forEach((child, index) => {
                             child.style.transitionDelay = `${index * CONFIG.STAGGER_DELAY_MS}ms`;
                         });
                     }

                      observer.unobserve(target); // Stop observing once animated
                 }
             });
         }, fadeObserverOptions);

          // Observe sections, asides, and specific components needing fade-in
          document.querySelectorAll('#main-content > section[data-animate-fade-in]:not(#hero), #main-content > aside[data-animate-fade-in], .coaching-content-redesigned[data-animate-fade-in], .mmisbalior-promo[data-animate-fade-in], .resource-grid[data-animate-fade-in], .category-grid[data-animate-fade-in], .template-grid[data-animate-fade-in]')
              .forEach(element => fadeObserver.observe(element));
          intersectionObservers.push(fadeObserver); // Store observer


          // --- Observer for Hero Stats (Individual cards for potential staggering) ---
         const heroStatsGrid = document.querySelector('.hero-stats-grid');
         if (heroStatsGrid) {
              const heroStatCards = heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]');
              if (heroStatCards.length > 0) {
                 const heroStatsObserverOptions = { threshold: 0.2 }; // Trigger when 20% visible
                 const heroStatsObserver = new IntersectionObserver((entries, observer) => {
                      let visibleIndex = 0; // Counter for staggering delay based on *visible* order
                      entries.forEach(entry => {
                          if (entry.isIntersecting) {
                              const card = entry.target;
                               // Apply stagger based on visible order, not DOM order initially
                              card.style.transitionDelay = `${visibleIndex * (CONFIG.STAGGER_DELAY_MS + 50)}ms`; // Slightly longer stagger for hero
                              card.classList.add('is-visible');
                              logger.debug('[Animation] Hero stat card animated:', card);
                              visibleIndex++;
                              observer.unobserve(card); // Stop observing
                         }
                     });
                 }, heroStatsObserverOptions);

                  heroStatCards.forEach(card => heroStatsObserver.observe(card));
                 intersectionObservers.push(heroStatsObserver); // Store observer
              }
          }

         logger.info(`[setupScrollAnimations] ${intersectionObservers.length} observers initialized.`);
     }

     // Function to disconnect all observers (e.g., for SPA navigation or cleanup)
     // function disconnectScrollObservers() {
     //     logger.info("[disconnectScrollObservers] Disconnecting all IntersectionObservers.");
     //     intersectionObservers.forEach(observer => observer.disconnect());
     //     intersectionObservers = []; // Clear the array
     // }

    // =========================================================================
    // INTRO QUIZ LOGIC (Learning Hub - Adapted for Cached Elements)
    // =========================================================================
     // introQuizQuestions array remains the same (from previous step) - assume it's defined here
    const introQuizQuestions = [ /* The same 20 questions as provided before */
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

    /** Cache essential Quiz Modal DOM elements for performance */
    function cacheQuizModalElements() {
         const quizModal = document.getElementById('quiz-modal');
         if (!quizModal) {
             logger.error("FATAL: Quiz Modal element (#quiz-modal) not found. Quiz functionality disabled.");
             return false; // Indicate failure
         }
         // Select elements within the quiz modal context
         quizModalElements = {
             modal: quizModal,
             content: quizModal.querySelector('.quiz-modal-content'), // Need content for focus trap
             title: quizModal.querySelector('#quiz-modal-title'),
             closeBtn: quizModal.querySelector('#quiz-modal-close'),
             progress: quizModal.querySelector('.quiz-modal-progress'),
             progressCurrent: quizModal.querySelector('#quiz-modal-q-current'),
             progressTotal: quizModal.querySelector('#quiz-modal-q-total'),
             questionEl: quizModal.querySelector('#quiz-modal-question'),
             optionsEl: quizModal.querySelector('#quiz-modal-options'),
             feedbackEl: quizModal.querySelector('#quiz-modal-feedback'),
             resultsEl: quizModal.querySelector('#quiz-modal-results'),
             navigationEl: quizModal.querySelector('.quiz-modal-navigation'), // Nav container
             nextBtn: quizModal.querySelector('#quiz-modal-next'),
             nextQuizBtn: quizModal.querySelector('#quiz-modal-next-quiz'),
             restartBtn: quizModal.querySelector('#quiz-modal-restart'),
             closeResultsBtn: quizModal.querySelector('#quiz-modal-close-results'),
             fullChallengePrompt: quizModal.querySelector('#quiz-modal-full-challenge-prompt')
         };

         // Basic verification
         for (const key in quizModalElements) {
            if (!quizModalElements[key]) {
                 logger.warn(`[cacheQuizModalElements] Optional element missing: ${key}`);
                 // Note: Only `modal` is truly fatal here. Other checks can happen in usage.
            }
        }
        logger.debug("Quiz modal elements cached.");
         return true; // Success
    }

     /** Handler for clicking a 'Start Check' button */
     function handleIntroQuizStart(event) {
         logger.debug('[handleIntroQuizStart] Initiated by:', event.currentTarget);
         const button = event.currentTarget;
         const card = button.closest('.category-card'); // Use updated class if needed

          if (!card) {
             logger.error('[handleIntroQuizStart] Failed: Could not find parent ".category-card".');
              alert("Sorry, an error occurred preparing the quiz.");
              return;
          }

          const categoryId = parseInt(card.dataset.categoryId, 10);
          if (isNaN(categoryId) || categoryId <= 0) {
              logger.error(`[handleIntroQuizStart] Invalid or missing category ID: ${card.dataset.categoryId}`);
              alert("Cannot start quiz: Invalid category specified.");
              return;
          }
         // No longer strictly needed if full challenge is separate page, but kept for robustness
         // if (categoryId > CONFIG.LAST_INTRO_CATEGORY_ID) {
         //    logger.warn(`[handleIntroQuizStart] Category ID ${categoryId} might be beyond intro set.`);
         //     // Potentially direct to full challenge page here instead of alert
         // }

         // Find questions *specifically* for this category ID
         const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);

          if (categoryQuestions.length === 0) {
              logger.error(`[handleIntroQuizStart] No questions loaded/found for Category ID: ${categoryId}`);
              alert(`Sorry, the questions for "${card.querySelector('h4')?.textContent || 'this check'}" are currently unavailable.`);
              return;
          }

          logger.debug(`[handleIntroQuizStart] Starting quiz for Category ${categoryId} with ${categoryQuestions.length} questions.`);
          startIntroQuiz(categoryId, categoryQuestions, button); // Pass the button that triggered it
      }


     /** Start or restart an introductory quiz */
     function startIntroQuiz(categoryId, questions, openingTrigger) {
          if (!quizModalElements.modal) {
              logger.error("[startIntroQuiz] Cannot start: Quiz modal element not cached or available.");
              alert("Error: The quiz interface could not be loaded.");
              return; // Early exit if modal isn't ready
          }
         logger.info(`[startIntroQuiz] Starting Intro Quiz - Category ID: ${categoryId}`);

         currentIntroQuizData = {
             questions: questions, // Ensure using the passed questions
             currentQuestionIndex: 0,
             score: 0,
             categoryId: categoryId
          };
          logger.debug("[startIntroQuiz] Quiz data state initialized:", currentIntroQuizData);

          // Reset UI to initial state (progress text, title, hide results/feedback)
          setupIntroQuizUI();
          // Display the first question
          displayIntroModalQuestion();
         // Open the modal, passing the original button that started the quiz for focus return
          openModal(quizModalElements.modal, openingTrigger);
      }


      /** Resets the Quiz Modal UI elements to their initial state */
      function setupIntroQuizUI() {
          logger.debug("[setupIntroQuizUI] Resetting quiz modal UI for new quiz start...");
           // Use optional chaining for safer access
          const { modal, title, progress, progressTotal, questionEl, optionsEl, feedbackEl, resultsEl, navigationEl, nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt } = quizModalElements;

          if (!modal) return; // Should not happen if cache worked

          const categoryTitle = currentIntroQuizData?.questions[0]?.category || 'Financial Concept Check';
          const totalQuestions = currentIntroQuizData?.questions?.length || 0;

          if (title) title.textContent = categoryTitle;
          if (progress) progress.hidden = false;
           if (progressTotal) progressTotal.textContent = totalQuestions;
           // Ensure question/options are visible, feedback/results hidden initially
           if (questionEl) { questionEl.hidden = false; questionEl.innerHTML = ''; } // Clear previous
           if (optionsEl) { optionsEl.hidden = false; optionsEl.innerHTML = ''; }
           if (feedbackEl) feedbackEl.hidden = true;
           if (resultsEl) resultsEl.hidden = true;
          if (fullChallengePrompt) fullChallengePrompt.hidden = true;
           // Hide all navigation buttons initially
          if (navigationEl) navigationEl.hidden = false; // Ensure nav container visible
           [nextBtn, nextQuizBtn, restartBtn, closeResultsBtn].forEach(btn => { if (btn) btn.hidden = true; });

          logger.debug(`[setupIntroQuizUI] UI prepared for category: "${categoryTitle}"`);
      }


      /** Displays the current question and options */
      function displayIntroModalQuestion() {
           // Use optional chaining heavily for safety
          const { progressCurrent, questionEl, optionsEl, feedbackEl, nextBtn } = quizModalElements;
          const { questions, currentQuestionIndex } = currentIntroQuizData;
           logger.debug(`[displayIntroModalQuestion] Displaying question ${currentQuestionIndex + 1} of ${questions?.length || 0}`);

           // Ensure critical elements and data exist
          if (!progressCurrent || !questionEl || !optionsEl || !questions || currentQuestionIndex >= questions.length) {
               if (currentQuestionIndex >= questions?.length) {
                  logger.info("[displayIntroModalQuestion] End of questions reached. Showing results.");
                  showIntroModalResults(); // Reached end, show results
              } else {
                   logger.error("[displayIntroModalQuestion] Error: Missing quiz elements or data invalid.");
                   closeModal(); // Close modal if something critical is wrong
               }
               return;
           }

          const q = questions[currentQuestionIndex];
           if (progressCurrent) progressCurrent.textContent = currentQuestionIndex + 1;

          // Build question text safely
           questionEl.innerHTML = ''; // Clear previous
           const qNumSpan = document.createElement('span');
           qNumSpan.className = 'question-number';
           qNumSpan.textContent = `${currentQuestionIndex + 1}. `;
           questionEl.appendChild(qNumSpan);
           questionEl.appendChild(document.createTextNode(q.question)); // Append question text safely

          // Build options
           optionsEl.innerHTML = ''; // Clear previous options
           q.options.forEach((optionText, index) => {
              const label = document.createElement('label');
               label.className = 'option-label'; // Use class from CSS

               const button = document.createElement('button');
               button.type = 'button';
               button.className = 'option-button'; // Use class from CSS
               button.dataset.index = index;
               button.textContent = optionText; // Set text content safely
               // Assign click handler to the button
               button.onclick = () => handleIntroModalOptionSelection(index);

               label.appendChild(button);
               optionsEl.appendChild(label);
          });

           // Reset feedback display and hide 'Next' button
          if (feedbackEl) feedbackEl.hidden = true;
          if (nextBtn) nextBtn.hidden = true;


           // Focus the first option for keyboard navigation
           // Need small delay if options are complex or CSS transition involved
          setTimeout(() => {
               if(activeModal === quizModalElements.modal) { // Check modal is still active
                 safeFocus(optionsEl.querySelector('.option-button'));
               }
           }, 50); // Short delay
          logger.debug("[displayIntroModalQuestion] Question display complete.");
       }

     /** Handles selection of a quiz option */
    function handleIntroModalOptionSelection(selectedIndex) {
         logger.debug(`[handleIntroModalOptionSelection] Option selected - Index: ${selectedIndex}`);
         const { optionsEl, feedbackEl, nextBtn } = quizModalElements;
         const { questions, currentQuestionIndex } = currentIntroQuizData;

          if (!optionsEl || !questions || currentQuestionIndex >= questions.length) {
              logger.error("[handleIntroModalOptionSelection] Cannot process selection: Missing elements or invalid state.");
              return;
          }

          const q = questions[currentQuestionIndex];
          const buttons = optionsEl.querySelectorAll('.option-button');

          // Disable all options immediately
          buttons.forEach(button => button.disabled = true);

         // Determine correctness and update score
         const isCorrect = selectedIndex === q.correctAnswerIndex;
          if (isCorrect) {
              currentIntroQuizData.score++;
              logger.debug(`[handleIntroModalOptionSelection] Correct! New score: ${currentIntroQuizData.score}`);
         } else {
              logger.debug(`[handleIntroModalOptionSelection] Incorrect. Correct was index: ${q.correctAnswerIndex}`);
          }

          // Update button visuals and show feedback text
         showIntroModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation || "No specific feedback available.");

          // Reveal 'Next' button or trigger results display
          if (currentQuestionIndex < questions.length - 1) {
             if (nextBtn) {
                 nextBtn.hidden = false;
                 // Focus the next button so user can proceed easily
                 safeFocus(nextBtn);
                 logger.debug("[handleIntroModalOptionSelection] Next question available. Next button shown.");
             }
          } else {
              // Last question - automatically show results after a short delay
             logger.info("[handleIntroModalOptionSelection] Last question answered. Showing results soon.");
             if (nextBtn) nextBtn.hidden = true; // Hide if visible
              setTimeout(showIntroModalResults, 1500); // Delay allows user to read feedback
          }
      }


     /** Shows feedback below options, highlights correct/incorrect */
     function showIntroModalFeedback(selectedIndex, correctIndex, explanationText) {
         logger.debug(`[showIntroModalFeedback] Displaying feedback for selected: ${selectedIndex}, correct: ${correctIndex}`);
          const { optionsEl, feedbackEl } = quizModalElements;

         if (!optionsEl || !feedbackEl) {
              logger.error("[showIntroModalFeedback] Failed: Missing options or feedback elements.");
              return;
          }

          const buttons = optionsEl.querySelectorAll('.option-button');
          buttons.forEach((button, index) => {
              button.classList.remove('correct', 'incorrect'); // Reset classes
              if (index === correctIndex) {
                  button.classList.add('correct');
              } else if (index === selectedIndex) {
                 // Only mark the user's choice as incorrect if it wasn't the right one
                  button.classList.add('incorrect');
              }
             // Ensure already disabled state persists visual distinction
             // (Handled by CSS usually: .option-button[disabled]:not(.correct):not(.incorrect) {})
          });

          // Create feedback message safely
          feedbackEl.innerHTML = ''; // Clear previous content
          const feedbackStrong = document.createElement('strong');
          const feedbackText = document.createTextNode(explanationText);
          const feedbackParagraph = document.createElement('p');

          const isCorrect = selectedIndex === correctIndex;
          feedbackStrong.textContent = isCorrect ? 'Correct! ' : 'Insight: ';
          feedbackParagraph.appendChild(feedbackStrong);
          feedbackParagraph.appendChild(feedbackText);
          feedbackEl.appendChild(feedbackParagraph);


          // Update feedback container class and make visible
          feedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
          feedbackEl.hidden = false;

          // Scroll feedback into view if it's potentially off-screen within the modal
          feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

         logger.debug("[showIntroModalFeedback] Feedback displayed.");
      }

     /** Proceeds to the next question in the quiz */
     function nextIntroModalQuestion() {
          logger.debug("[nextIntroModalQuestion] Advancing to next question.");
           const { feedbackEl, nextBtn } = quizModalElements;
          if (!currentIntroQuizData) { logger.error("Cannot go to next question, no quiz data."); return; }

          // Hide feedback and next button for the new question
           if (feedbackEl) feedbackEl.hidden = true;
           if (nextBtn) nextBtn.hidden = true;


           currentIntroQuizData.currentQuestionIndex++;
           displayIntroModalQuestion(); // Display the next question
      }


     /** Displays the final results of the introductory quiz */
     function showIntroModalResults() {
           const { modal, questionEl, optionsEl, feedbackEl, progress, navigationEl, nextBtn, resultsEl, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt } = quizModalElements;
           const quiz = currentIntroQuizData;
           logger.info("[showIntroModalResults] Preparing to display quiz results.");

           if (!resultsEl || !quiz || !modal) {
              logger.error("[showIntroModalResults] Cannot show results: Missing elements or quiz data.", { resultsEl, quiz, modal });
              closeModal(); // Close if results cannot be displayed
              return;
           }


           // Hide elements related to active question display
          [questionEl, optionsEl, feedbackEl, nextBtn, progress].forEach(el => { if (el) el.hidden = true; });

           // Calculate score and determine feedback message
          const score = quiz.score;
           const total = quiz.questions.length;
           const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
          let feedbackMsg;
           if (percentage === 100) feedbackMsg = 'Excellent work! You have a strong grasp of these concepts.';
           else if (percentage >= 80) feedbackMsg = 'Great job! Solid financial awareness demonstrated.';
           else if (percentage >= 50) feedbackMsg = 'Good start! Review the insights to reinforce your understanding.';
           else feedbackMsg = 'Keep exploring! Our resources can help strengthen your knowledge.';

          // Build results HTML safely
           resultsEl.innerHTML = `
               <h4>Check Complete!</h4>
               <p>Your score: ${score} out of ${total}</p>
               <p class="quiz-score-percentage">(${percentage}%)</p>
               <p class="quiz-result-message">${feedbackMsg}</p>
           `;
           resultsEl.hidden = false;

           // Prepare navigation buttons for results view
          if (navigationEl) navigationEl.hidden = false;
          if (restartBtn) restartBtn.hidden = false;
           if (closeResultsBtn) closeResultsBtn.hidden = false;

           let primaryActionBtn = closeResultsBtn || restartBtn; // Default focus target


          // Show 'Next Check' or 'Full Challenge Prompt' based on category ID
           if (quiz.categoryId && quiz.categoryId < CONFIG.LAST_INTRO_CATEGORY_ID) {
              if (nextQuizBtn) {
                   nextQuizBtn.dataset.nextCategoryId = quiz.categoryId + 1;
                   nextQuizBtn.hidden = false;
                  primaryActionBtn = nextQuizBtn; // Make 'Next Check' the primary focus
                  logger.debug("[showIntroModalResults] 'Next Check' button prepared.");
              }
           } else if (quiz.categoryId === CONFIG.LAST_INTRO_CATEGORY_ID) {
               if (fullChallengePrompt) {
                   fullChallengePrompt.hidden = false;
                   // Focus might still go to Close or Restart, prompt is just info
                  logger.debug("[showIntroModalResults] Final intro quiz. 'Full Challenge' prompt shown.");
               }
          }

           // Scroll results into view and focus the primary action button
          resultsEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
           safeFocus(primaryActionBtn);
           logger.info(`[showIntroModalResults] Results displayed. Score: ${score}/${total} (${percentage}%)`);
       }

     /** Restarts the current introductory quiz */
    function restartIntroModalQuiz() {
         const { categoryId } = currentIntroQuizData;
          logger.info(`[restartIntroModalQuiz] Restarting quiz for category ID: ${categoryId}`);

         if (!categoryId) {
              logger.error("[restartIntroModalQuiz] Cannot restart: Category ID is missing from current quiz data.");
              alert("Error: Cannot determine which quiz to restart.");
              closeModal();
              return;
          }

          const questions = introQuizQuestions.filter(q => q.categoryId === categoryId);
          // Find the original trigger button again using the category ID
          const originalTriggerButton = document.querySelector(`.category-card[data-category-id="${categoryId}"] .start-quiz-btn`);

          if (questions.length > 0) {
             // Start the quiz again, passing the original trigger button (if found) or the last known trigger
             startIntroQuiz(categoryId, questions, originalTriggerButton || triggerElement);
          } else {
              logger.error(`[restartIntroModalQuiz] Failed to find questions for Category ${categoryId} during restart.`);
              alert("Error: Could not reload the questions for this check.");
              closeModal();
         }
      }


    /** Handles click on the 'Next Check' button */
    function handleIntroNextQuizClick(event) {
         const button = event.currentTarget;
         const nextCategoryId = parseInt(button.dataset.nextCategoryId, 10);
         logger.info(`[handleIntroNextQuizClick] Attempting to start next quiz check: Category ID ${nextCategoryId}`);


         if (isNaN(nextCategoryId) || nextCategoryId <= 0 || nextCategoryId > CONFIG.LAST_INTRO_CATEGORY_ID) {
             logger.error("[handleIntroNextQuizClick] Invalid or out-of-bounds next category ID:", button.dataset.nextCategoryId);
              alert("Error: Could not determine the next valid quiz check.");
             closeModal(); // Close if invalid state
             return;
         }

          const nextQuestions = introQuizQuestions.filter(q => q.categoryId === nextCategoryId);
         const nextTriggerButton = document.querySelector(`.category-card[data-category-id="${nextCategoryId}"] .start-quiz-btn`);


         if (nextQuestions.length > 0) {
             // Start the next quiz, using its own start button as the trigger if found
              startIntroQuiz(nextCategoryId, nextQuestions, nextTriggerButton || button); // Fallback to current button as trigger
         } else {
              logger.error(`[handleIntroNextQuizClick] Questions not found for the next Category ID: ${nextCategoryId}`);
              alert("Sorry, the next quiz check could not be loaded.");
             closeModal();
         }
     }


    /** Resets minimal state of the quiz modal when closing */
     function resetQuizModalUI() {
         // Called from closeModal now, or potentially before openModal if needed
         const { modal, feedbackEl, resultsEl, optionsEl, questionEl, navigationEl, progress } = quizModalElements;
         if (!modal) return; // Ensure elements are cached

         // Hide dynamic content areas
          if(feedbackEl) feedbackEl.hidden = true;
          if(resultsEl) resultsEl.hidden = true;
          if (questionEl) questionEl.innerHTML = ''; // Clear content
         if (optionsEl) optionsEl.innerHTML = ''; // Clear content
         // Hide navigation / progress until a quiz is active
         if (navigationEl) navigationEl.hidden = true;
          if (progress) progress.hidden = true;

         logger.debug("[resetQuizModalUI] Quiz modal display elements reset for closing.");
         // No need to reset currentIntroQuizData here, happens on quiz start
     }

     // =========================================================================
    // GLOBAL EVENT LISTENERS SETUP
    // =========================================================================
    function setupGlobalEventListeners() {
         logger.debug("Setting up global event listeners...");
         let listenersAdded = 0;

          // Mobile Navigation Toggle
         const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
         if (mobileMenuToggle) {
             mobileMenuToggle.addEventListener('click', handleMobileNavToggle);
             listenersAdded++;
         } else { logger.warn("Mobile nav toggle button not found."); }

         // Smooth Scrolling for Internal Links
          document.body.addEventListener('click', (event) => {
              // Delegate click event to the body to catch dynamically added links too
              const targetLink = event.target.closest('a[href^="#"]');
              if (targetLink) {
                  handleSmoothScroll(event); // Pass the event itself
              }
          });
          listenersAdded++; // Counting delegation listener

         // Window Resize Listener (Debounced)
          window.addEventListener('resize', handleResize);
          listenersAdded++;

         // Modal Closing via Overlay Click (for non-<dialog> elements)
          document.querySelectorAll('.modal-overlay').forEach(overlay => {
             // Use mousedown -> check target on mouseup for more reliable overlay click detection
             let mouseDownTarget = null;
             overlay.addEventListener('mousedown', (e) => { mouseDownTarget = e.target; });
             overlay.addEventListener('mouseup', (event) => {
                 if (event.target === overlay && mouseDownTarget === overlay && activeModal === overlay) {
                      logger.debug('[Overlay Click] Closing modal:', overlay.id);
                      closeModal(); // Use standard close function
                  }
                  mouseDownTarget = null; // Reset for next click
              });
              listenersAdded++; // Add listener count
          });

         // --- Delegated Click Listeners for Buttons ---
         // Reduces number of listeners attached directly
         document.body.addEventListener('click', (event) => {
              const button = event.target.closest('button, a.btn'); // Target buttons or link-styled buttons
             if (!button) return; // Exit if click wasn't on or inside a button/link button

              // Feedback Modal Trigger
              if (button.id === 'open-feedback-modal-btn') {
                 const feedbackModal = document.getElementById('feedback-modal');
                 if (feedbackModal) {
                    event.preventDefault(); // Prevent potential default anchor behavior if it's an `<a>`
                     openModal(feedbackModal, button);
                  } else { logger.error("Feedback modal element (#feedback-modal) not found!"); }
                 return; // Handled
              }

             // Generic Modal Close Buttons
             if (button.matches('.modal-close-btn') || button.closest('.modal-close-btn')) {
                  const modal = button.closest('.modal-overlay');
                  if (modal && activeModal === modal) {
                      event.preventDefault();
                      logger.debug(`[Close Button Click] Closing modal: ${modal.id}`);
                      closeModal();
                  }
                 return; // Handled
              }

             // Template Spreadsheet Buttons
              if (button.matches('.get-spreadsheet-btn') || button.closest('.get-spreadsheet-btn')) {
                 handleGetSpreadsheetClick(event);
                 return; // Handled
             }

              // Template PDF Download Buttons
             if (button.matches('.download-pdf-btn') || button.closest('.download-pdf-btn')) {
                 handleDownloadPdfClick(event);
                 return; // Handled
              }

             // Quiz Start Buttons
              if (button.matches('.start-quiz-btn') || button.closest('.start-quiz-btn')) {
                  handleIntroQuizStart(event);
                  return; // Handled
              }

              // Quiz Modal Navigation Buttons (Inside the Quiz Modal)
              if (button.closest('#quiz-modal')) {
                   if (button.matches('.quiz-next-btn') || button.closest('.quiz-next-btn')) {
                      nextIntroModalQuestion();
                  } else if (button.matches('.quiz-restart-btn') || button.closest('.quiz-restart-btn')) {
                       restartIntroModalQuiz();
                  } else if (button.matches('#quiz-modal-next-quiz') || button.closest('#quiz-modal-next-quiz')) { // Check specific ID
                       handleIntroNextQuizClick(event);
                   } else if (button.matches('.quiz-close-btn') || button.closest('.quiz-close-btn')) {
                      closeModal(); // General close
                   }
                  // Note: Close via #quiz-modal-close is handled by the generic close button logic above
                 return; // Handled quiz nav
              }
         });
         listenersAdded++; // Count delegated listener

          // --- Form Submissions ---
         const coachingInterestForm = document.getElementById('coachingInterestForm');
         if (coachingInterestForm) {
              coachingInterestForm.addEventListener('submit', (e) => handleFormSubmit({
                  event: e, // Pass event to prevent default
                  formId: 'coachingInterestForm',
                  fields: [ // Define fields for validation
                      { id: 'interest-email', name: 'email', label: 'Email Address', required: true, validator: isValidEmail, errorMessage: 'Please provide a valid email address.' }
                  ],
                  submitButtonSelector: 'button[type="submit"]',
                  successMessage: 'Thank you! We\'ll notify you when coaching becomes available.',
                  errorMessage: 'Submission failed. Please check the email address or try again later.',
                  endpointAction: 'coachingInterestSubscription',
                  closeModalOnSuccess: false // Keep form visible maybe? Or clear it?
                  // onSuccess: () => { /* Optionally clear form manually if not resetting */ }
              }));
              listenersAdded++;
          }

         const feedbackForm = document.getElementById('feedback-testimonial-form');
          if (feedbackForm) {
             feedbackForm.addEventListener('submit', (e) => handleFormSubmit({
                  event: e,
                  formId: 'feedback-testimonial-form',
                 fields: [
                     { id: 'feedback-name', name: 'name', label: 'Name' }, // Optional
                     { id: 'feedback-email', name: 'email', label: 'Email', validator: (val) => !val || isValidEmail(val), errorMessage: 'If provided, please enter a valid email address.' }, // Optional, but validate if exists
                     { id: 'feedback-type', name: 'type', label: 'Feedback Type', required: true },
                      { id: 'feedback-message', name: 'message', label: 'Message', required: true, minLength: 10, maxLength: 2000, errorMessage: 'Message must be between 10 and 2000 characters.' },
                     { id: 'feedback-permission', name: 'permission', label: 'Usage Permission' } // Optional checkbox, value retrieved directly if needed
                 ],
                  submitButtonSelector: 'button[type="submit"]',
                  successMessage: 'Feedback received! Thank you for your valuable input.',
                  errorMessage: 'Sorry, submission failed. Please try again.',
                  endpointAction: 'submitUserFeedback',
                  closeModalOnSuccess: true, // Close modal after successful feedback
                 // onSuccess: resetFeedbackForm, // Reset happens BEFORE opening now, only reset if stays open
              }));

              // Add listener for feedback type change directly
              const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
             if (feedbackTypeSelect) {
                  feedbackTypeSelect.addEventListener('change', handleFeedbackTypeChange);
                  listenersAdded++;
              }
             listenersAdded++; // Form listener
          }

         logger.info(`[setupGlobalEventListeners] ${listenersAdded} global event listeners configured.`);
     }

    /** Update the copyright year in the footer */
     function updateCopyrightYear() {
         const yearSpan = document.getElementById('current-year');
         if (yearSpan) {
             const currentYear = new Date().getFullYear();
             yearSpan.textContent = currentYear;
             logger.debug(`Copyright year updated to ${currentYear}.`);
         }
     }


    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /** Main initialization function, runs when DOM is ready */
    function initializePersonalPage() {
        console.log("%cROFILID Personal Page Script Initializing (v3.0.0)...", "color: #0c343d; font-size: 1.1em; font-weight: bold;");

        // Pre-requisite checks
         if (!document.body.classList.contains('personal-page') && !document.documentElement.classList.contains('personal-page')) {
             logger.error("Initialization aborted: Not detected as the personal finance page.");
             return; // Stop script if not on the correct page
         }
         if (!cacheQuizModalElements()) {
              logger.error("Initialization warning: Failed to cache essential quiz modal elements. Quiz functionality may be impaired.");
             // Continue initialization, but quiz may fail.
         }


        // Run setup functions
         updateCopyrightYear();
         setupGlobalEventListeners(); // Setup core interactions
         setupScrollAnimations(); // Setup scroll-triggered effects

         logger.info("%cRofilid Personal Page scripts fully loaded and operational.", "color: green; font-weight: bold;");
     }

     // --- Execute Initialization ---
     // Use 'interactive' state for faster initialization where possible, fallback to 'complete' or DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePersonalPage);
     } else {
         // DOM is already ready (interactive or complete)
         initializePersonalPage();
     }

})(); // End IIFE execution
