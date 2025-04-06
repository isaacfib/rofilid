/**
 * File Location: /assets/js/personal/personal.js
 * Description: Scripts for the ROFILID Personal Finance page (personal.html).
 *              Handles navigation, smooth scrolling, modals, forms, animations,
 *              and template interactions specific to this page.
 * Version: 2.7.0 (Optimized: Event Delegation, DOM Caching, Efficiency)
 * Dependencies: Font Awesome (loaded via CSS/HTML)
 */

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
        MODAL_FOCUS_DELAY: 110, // Slightly longer for robustness
        API_SIMULATION_DELAY: 1100, // Slightly faster
        PDF_DOWNLOAD_FEEDBACK_DELAY: 2500,
        LAST_INTRO_CATEGORY_ID: 4,
        PDF_FILES: { // Consider moving to HTML data attributes if dynamically generated
            'line-budget': '../../assets/downloads/rofilid-line-item-budget.pdf',
            'networth': '../../assets/downloads/rofilid-net-worth-statement.pdf',
            'cashflow': '../../assets/downloads/rofilid-personal-cashflow.pdf',
            '50-30-20': '../../assets/downloads/rofilid-50-30-20-budget.pdf',
            'expense-tracker': '../../assets/downloads/rofilid-expense-tracker.pdf'
        }
    };

    // --- Constants ---
    const CONSTANTS = {
        MODAL_VISIBLE_CLASS: 'visible',
        FORM_ERROR_CLASS: 'is-invalid',
        FORM_ERROR_SELECTOR: '.form-error-msg',
        FORM_RESPONSE_SELECTOR: '.form-response-note',
        PERMISSION_GROUP_SELECTOR: '.permission-group',
        QUIZ_MODAL_ID: 'quiz-modal',
        FEEDBACK_MODAL_ID: 'feedback-modal',
        COACHING_FORM_ID: 'coachingInterestForm',
        FEEDBACK_FORM_ID: 'feedback-testimonial-form',
        LEARNING_HUB_ID: 'learning-hub',
        MAIN_CONTENT_ID: 'main-content'
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
    let currentHeaderHeight = CONFIG.HEADER_HEIGHT_DEFAULT;

    // --- Cached DOM Elements ---
    const domCache = {
        body: document.body,
        siteHeader: null,
        primaryNav: null,
        mobileMenuToggle: null,
        mainContent: null,
        modals: {},
        forms: {},
        footer: {
            currentYearSpan: null
        }
    };
    let quizModalElements = {};

    // =========================================================================
    // HELPERS
    // =========================================================================

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

    function updateHeaderHeight() {
        const headerEl = domCache.siteHeader || document.querySelector('.site-header');
        currentHeaderHeight = headerEl?.offsetHeight || CONFIG.HEADER_HEIGHT_DEFAULT;
        logger.debug('Header height updated:', currentHeaderHeight);
    }

    function trapFocus(element) {
        if (!element) {
            logger.warn('[trapFocus] Target element is null.');
            return null;
        }
        const focusableSelector = 'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusableEls = Array.from(element.querySelectorAll(focusableSelector))
            .filter(el => el.offsetWidth || el.offsetHeight || el.getClientRects().length);

        if (focusableEls.length === 0) {
            logger.warn('[trapFocus] No visible focusable elements found inside:', element);
            return null;
        }

        const firstFocusableEl = focusableEls[0];
        const lastFocusableEl = focusableEls[focusableEls.length - 1];

        function handleFocusTrapKeydown(e) {
            if (e.key !== 'Tab' || activeModal !== element || !element.contains(document.activeElement)) {
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
            if (activeModal !== element) {
                logger.warn('[trapFocus] Modal changed before initial focus could be set for:', element.id);
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
                logger.debug('[trapFocus] Setting initial focus:', focusTarget);
                safeFocus(focusTarget);
            } else {
                logger.warn("[trapFocus] No suitable initial focus target found within:", element);
            }
        }, CONFIG.MODAL_FOCUS_DELAY);

        element.addEventListener('keydown', handleFocusTrapKeydown);
        logger.debug('[trapFocus] Focus trap keydown listener added for:', element.id);
        return handleFocusTrapKeydown;
    }

    function safeFocus(element) {
        if (element && typeof element.focus === 'function') {
            try {
                element.focus({ preventScroll: true });
            } catch (err) {
                logger.error("[safeFocus] Focusing element failed:", err.message, element);
            }
        } else {
            logger.warn("[safeFocus] Element is not focusable or does not exist:", element);
        }
    }

    function isValidEmail(email) {
        if (!email) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(email).toLowerCase());
    }

    // =========================================================================
    // MODAL LOGIC
    // =========================================================================

    function openModal(modalElement, openingTriggerElement) {
        logger.debug('[openModal] Attempting to open modal:', modalElement?.id);
        if (!modalElement || !(modalElement instanceof Element)) {
            logger.error('[openModal] Failed: Target modal is not a valid element.');
            return;
        }
        if (activeModal === modalElement) {
            logger.warn('[openModal] Modal already active:', modalElement.id);
            safeFocus(modalElement);
            return;
        }
        if (activeModal) {
            logger.info('[openModal] Closing previously active modal:', activeModal.id);
            closeModal(false);
        }

        activeModal = modalElement;
        triggerElement = openingTriggerElement;

        domCache.body.style.overflow = 'hidden';
        modalElement.hidden = false;

        requestAnimationFrame(() => {
            if(activeModal !== modalElement) {
                 logger.warn("[openModal] Modal state changed during opening animation frame. Aborting visibility transition for:", modalElement.id);
                return;
            }
            modalElement.classList.add(CONSTANTS.MODAL_VISIBLE_CLASS);
            logger.debug('[openModal] Added visible class to:', modalElement.id);
            const focusTrapHandler = trapFocus(modalElement);
            if (focusTrapHandler) {
                modalElement._focusTrapHandler = focusTrapHandler;
            } else {
                logger.warn('[openModal] Focus trapping failed to initialize for:', modalElement.id);
            }
        });

        document.addEventListener('keydown', handleModalKeydown);
        logger.info('[openModal] Modal opened successfully:', modalElement.id);
    }

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

        document.removeEventListener('keydown', handleModalKeydown);
        if (focusTrapHandler) {
            modalToClose.removeEventListener('keydown', focusTrapHandler);
            delete modalToClose._focusTrapHandler;
            logger.debug('[closeModal] Removed focus trap listener for:', modalToClose.id);
        } else {
            logger.warn('[closeModal] No focus trap handler found to remove for:', modalToClose.id);
        }

        modalToClose.classList.remove(CONSTANTS.MODAL_VISIBLE_CLASS);

        function onTransitionEnd() {
            modalToClose.removeEventListener('transitionend', onTransitionEnd);
            modalToClose.hidden = true;
            logger.debug('[closeModal] Modal hidden after transition:', modalToClose.id);
            if (!activeModal) {
               domCache.body.style.overflow = '';
               logger.debug('[closeModal] Restored body scroll.');
            } else {
                logger.info('[closeModal] Body scroll not restored, another modal became active:', activeModal?.id);
            }
            if (modalToClose.id === CONSTANTS.FEEDBACK_MODAL_ID) resetFeedbackForm();
            if (modalToClose.id === CONSTANTS.QUIZ_MODAL_ID) resetQuizModalUI();
            if (returnFocus && triggerToFocus) {
                logger.debug('[closeModal] Returning focus to trigger element:', triggerToFocus);
                safeFocus(triggerToFocus);
            } else if (returnFocus) {
                logger.warn('[closeModal] Could not return focus - trigger element was null or invalid.');
            }
        }
        modalToClose.addEventListener('transitionend', onTransitionEnd);

        setTimeout(() => {
            if (!modalToClose.hidden) {
                logger.warn('[closeModal] transitionend did not fire for modal:', modalToClose.id, '. Forcing close state.');
                modalToClose.hidden = true;
                if (!activeModal) domCache.body.style.overflow = '';
                if (modalToClose.id === CONSTANTS.FEEDBACK_MODAL_ID) resetFeedbackForm();
                if (modalToClose.id === CONSTANTS.QUIZ_MODAL_ID) resetQuizModalUI();
                if (returnFocus && triggerToFocus) safeFocus(triggerToFocus);
            }
        }, 500);
    }

    function handleModalKeydown(event) {
        if (event.key === 'Escape' && activeModal) {
            logger.debug('[handleModalKeydown] Escape key pressed. Closing active modal:', activeModal.id);
            closeModal();
        }
    }

    // =========================================================================
    // FORM HANDLING
    // =========================================================================

    function showFormResponseMessage(formElement, message, type = 'success') {
        const responseEl = formElement?.querySelector(CONSTANTS.FORM_RESPONSE_SELECTOR);
        if (!responseEl) { logger.warn("Form response element not found for:", formElement?.id); return; }
        responseEl.textContent = message;
        responseEl.className = `form-response-note ${type}`;
        responseEl.hidden = false;
        responseEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        logger.debug(`[Form Response] Shown: ${type} - ${message} for form ${formElement?.id}`);
    }

    function hideFormResponseMessage(formElement) {
        const responseEl = formElement?.querySelector(CONSTANTS.FORM_RESPONSE_SELECTOR);
        if (responseEl) {
            responseEl.hidden = true;
            responseEl.textContent = '';
            responseEl.className = 'form-response-note';
            responseEl.removeAttribute('aria-live');
        }
    }

    function clearFormErrors(formElement) {
        if (!formElement) return;
        formElement.querySelectorAll(CONSTANTS.FORM_ERROR_SELECTOR).forEach(msg => {
             msg.textContent = '';
        });
        formElement.querySelectorAll(`.${CONSTANTS.FORM_ERROR_CLASS}`).forEach(input => {
            input.classList.remove(CONSTANTS.FORM_ERROR_CLASS);
            input.removeAttribute('aria-invalid');
            const describedBy = input.getAttribute('aria-describedby');
            const errorMsgId = describedBy?.split(' ').find(id => document.getElementById(id)?.classList.contains(CONSTANTS.FORM_ERROR_SELECTOR.substring(1)));
            if (errorMsgId) {
                 const newDescribedBy = describedBy.split(' ').filter(id => id !== errorMsgId).join(' ');
                 if (newDescribedBy) {
                    input.setAttribute('aria-describedby', newDescribedBy);
                 } else {
                    input.removeAttribute('aria-describedby');
                 }
            }
        });
        logger.debug(`[Form Validation] Errors cleared for form ${formElement?.id}`);
    }

    function showInputError(inputElement, message) {
        if (!inputElement) { logger.warn("[showInputError] Attempted to show error for null input."); return; }
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) { logger.warn("[showInputError] No .form-group found for input:", inputElement); return; }
        const errorMsgElement = formGroup.querySelector(CONSTANTS.FORM_ERROR_SELECTOR);

        inputElement.classList.add(CONSTANTS.FORM_ERROR_CLASS);
        inputElement.setAttribute('aria-invalid', 'true');

        if (errorMsgElement) {
            errorMsgElement.textContent = message;
            errorMsgElement.hidden = false;
            if (!errorMsgElement.id) {
                errorMsgElement.id = `err-${inputElement.id || Math.random().toString(36).substring(2, 9)}`;
            }
            const currentDescribedBy = inputElement.getAttribute('aria-describedby') || '';
            const errorId = errorMsgElement.id;
            if (!currentDescribedBy.includes(errorId)) {
                inputElement.setAttribute('aria-describedby', (currentDescribedBy ? currentDescribedBy + ' ' : '') + errorId);
            }
        } else {
             logger.warn("[showInputError] No error message element found within form group for:", inputElement);
        }
        logger.debug(`[Form Validation] Error shown for input ${inputElement.id || inputElement.name}: ${message}`);
    }

    function validateAndGetFormData(formId, fields) {
        const form = domCache.forms[formId] || document.getElementById(formId);
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
                logger.warn(`[Form Validation] Input element #${field.id} not found in form ${formId}. Skipping.`);
                if (field.required) {
                    isValid = false;
                    logger.error(`[Form Validation] Required input #${field.id} missing!`);
                }
                return;
            }
            const value = (inputElement.type === 'checkbox' ? inputElement.checked : inputElement.value.trim());
            formData[field.name] = value;
            let validationFailed = false;
            if (field.required && (value === '' || value === false && inputElement.type !== 'checkbox')) {
                 showInputError(inputElement, field.requiredMessage || `${field.label || 'This field'} is required.`);
                 validationFailed = true;
            } else if (value && field.validator && !field.validator(value)) {
                 showInputError(inputElement, field.errorMessage || `Invalid input for ${field.label || 'this field'}.`);
                 validationFailed = true;
            } else if (value && typeof value === 'string' && field.maxLength && value.length > field.maxLength) {
                 showInputError(inputElement, `${field.label || 'Input'} cannot exceed ${field.maxLength} characters.`);
                 validationFailed = true;
            } else if (value && typeof value === 'string' && field.minLength && value.length < field.minLength) {
                 showInputError(inputElement, `${field.label || 'Input'} must be at least ${field.minLength} characters.`);
                 validationFailed = true;
            }
            if (validationFailed) {
                isValid = false;
                if (!firstInvalidElement) firstInvalidElement = inputElement;
            }
        });

        if (!isValid && firstInvalidElement) {
            safeFocus(firstInvalidElement);
        }
        logger.debug(`[Form Validation] Result for ${formId}: ${isValid ? 'Valid' : 'Invalid'}. First invalid: ${firstInvalidElement?.id || 'None'}`);
        return { isValid, data: formData, firstInvalidElement };
    }

    async function handleFormSubmit(options) {
        const { event, formId, fields, submitButtonSelector, successMessage, errorMessage, endpointAction, closeModalOnSuccess, onSuccess, onError } = options;
        event.preventDefault();

        const form = domCache.forms[formId] || document.getElementById(formId);
        const submitButton = form?.querySelector(submitButtonSelector);
        if (!form || !submitButton) {
            logger.error(`[handleFormSubmit] Critical element missing: Form (${formId}) or submit button (${submitButtonSelector}) not found.`);
            alert('An unexpected error occurred. Please try again later.');
            return;
        }

        const originalButtonHtml = submitButton.innerHTML;
        const validationResult = validateAndGetFormData(formId, fields);
        if (!validationResult.isValid) {
            logger.info(`[handleFormSubmit] Validation failed for ${formId}. Submission halted.`);
            showFormResponseMessage(form, "Please correct the errors marked above.", "error");
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting...';
        submitButton.setAttribute('aria-live', 'assertive');
        hideFormResponseMessage(form);

        logger.info(`[handleFormSubmit] Simulating API call for action "${endpointAction}"`, validationResult.data);
        let submissionSuccess = false;
        try {
            await new Promise(resolve => setTimeout(resolve, CONFIG.API_SIMULATION_DELAY));
            if (Math.random() > 0.15) {
                logger.info(`[handleFormSubmit] Simulated SUCCESS for action "${endpointAction}"`);
                submissionSuccess = true;
                showFormResponseMessage(form, successMessage, 'success');
                form.reset();
                form.querySelectorAll('select').forEach(select => {
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                });
                if (onSuccess) onSuccess();
                if (closeModalOnSuccess) {
                    const parentModal = form.closest('.modal-overlay');
                    setTimeout(() => {
                       if (activeModal && activeModal === parentModal) {
                           closeModal();
                       }
                   }, 2000);
                } else {
                    const formTitle = form.closest('.modal-content')?.querySelector('h3');
                    safeFocus(formTitle || submitButton);
               }
            } else {
                throw new Error("Simulated server-side validation failure or network issue.");
            }
        } catch (error) {
            logger.error(`[handleFormSubmit] Simulated FAILED for action "${endpointAction}":`, error.message);
            showFormResponseMessage(form, errorMessage || 'Submission failed. Please try again.', 'error');
            safeFocus(validationResult.firstInvalidElement || form.querySelector('input, select, textarea'));
            if (onError) onError(error);
        } finally {
            if (!submissionSuccess || (submissionSuccess && !closeModalOnSuccess)) {
                 submitButton.disabled = false;
                 submitButton.innerHTML = originalButtonHtml;
                submitButton.removeAttribute('aria-live');
             }
        }
    }

    function resetFeedbackForm() {
        const form = domCache.forms[CONSTANTS.FEEDBACK_FORM_ID];
        if (!form) return;
        form.reset();
        clearFormErrors(form);
        hideFormResponseMessage(form);
        const typeSelect = form.querySelector('#feedback-type');
        const permissionGroup = form.querySelector(CONSTANTS.PERMISSION_GROUP_SELECTOR);
        if (typeSelect && permissionGroup) {
            const isTestimonial = typeSelect.value === 'testimonial';
            permissionGroup.hidden = !isTestimonial;
            const checkbox = permissionGroup.querySelector('#feedback-permission');
            if(checkbox) checkbox.required = isTestimonial;
        }
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

    function handleMobileNavToggle(event) {
        const nav = domCache.primaryNav;
        const toggle = domCache.mobileMenuToggle;
       if (!nav || !toggle) {
            logger.warn("Mobile nav elements not found for toggle action.");
           return;
        }
       const isExpanded = nav.classList.toggle('active');
       toggle.setAttribute('aria-expanded', String(isExpanded));
       domCache.body.style.overflow = isExpanded ? 'hidden' : '';
       if (isExpanded) {
           safeFocus(nav.querySelector('a, button'));
        } else if (nav.contains(document.activeElement)) {
           safeFocus(toggle);
       }
       logger.debug('Mobile navigation toggled:', isExpanded ? 'Open' : 'Closed');
   }

    function handleSmoothScroll(event) {
        const anchor = event.currentTarget;
        const href = anchor.getAttribute('href');
        if (!href || !href.startsWith('#') || href.length < 2) return;
        const targetId = CSS.escape(href.substring(1));
        let targetElement;
        try {
            targetElement = document.getElementById(targetId);
        } catch (e) {
            logger.error(`[SmoothScroll] Invalid ID selector: ${targetId}`, e);
            return;
        }

        if (targetElement) {
            event.preventDefault();
            logger.debug(`[SmoothScroll] Initiating scroll to: #${targetId}`);
            const nav = domCache.primaryNav;
            if (nav?.classList.contains('active') && anchor.closest('#primary-navigation')) {
                handleMobileNavToggle();
            }
            const headerOffset = currentHeaderHeight + CONFIG.SCROLL_OFFSET_MARGIN;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (targetElement.getAttribute('tabindex') === null && !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(targetElement.tagName)) {
                         targetElement.setAttribute('tabindex', '-1');
                    }
                    safeFocus(targetElement);
                    logger.debug(`[SmoothScroll] Focus set to target: #${targetId}`);
                }, 650);
            });
        } else {
            logger.warn(`[SmoothScroll] Target element "#${targetId}" not found.`);
        }
    }

    function handleResize() {
        updateHeaderHeight();
        if (window.innerWidth > 991 && domCache.primaryNav?.classList.contains('active')) {
            handleMobileNavToggle();
        }
    }
    const debouncedResizeHandler = debounce(handleResize, CONFIG.RESIZE_DEBOUNCE_DELAY);

    function handleFeedbackTypeChange(event) {
        const form = domCache.forms[CONSTANTS.FEEDBACK_FORM_ID];
        const permissionGroup = form?.querySelector(CONSTANTS.PERMISSION_GROUP_SELECTOR);
        const permissionCheckbox = permissionGroup?.querySelector('#feedback-permission');
        if (!permissionGroup || !event?.target) return;
        const isTestimonial = event.target.value === 'testimonial';
        permissionGroup.hidden = !isTestimonial;
        if (permissionCheckbox) {
            permissionCheckbox.required = isTestimonial;
           if (!isTestimonial) {
                permissionCheckbox.checked = false;
            }
        }
        logger.debug('Feedback type changed. Permission group visible/required:', isTestimonial);
    }

    function handleTemplateInteraction(event) {
        const button = event.target.closest('.download-pdf-btn, .get-spreadsheet-btn');
        if (!button) return;
        event.preventDefault();
        if (button.classList.contains('get-spreadsheet-btn')) {
            handleGetSpreadsheetClick(button);
        } else if (button.classList.contains('download-pdf-btn')) {
            handleDownloadPdfClick(button);
        }
    }

    function handleGetSpreadsheetClick(button) {
        const templateName = button.dataset.templateName || 'Spreadsheet';
        const price = Number(button.dataset.price || '0');
        const formattedPrice = price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });
        alert(`Interactive "${templateName}" (${formattedPrice})\n\nThis premium feature is coming soon!\nRequires a Gmail account for delivery.\nThank you for your interest.`);
        logger.info(`Spreadsheet interest logged: ${templateName} (Price: ${formattedPrice})`);
    }

    function handleDownloadPdfClick(button) {
        const card = button.closest('.template-card');
        const templateKey = button.dataset.templateKey;
        if (!card || !templateKey) {
            logger.error("Download PDF error: Missing parent card or template key.", button);
            alert("Sorry, there was an error preparing the download link.");
            return;
        }
        const pdfUrl = CONFIG.PDF_FILES[templateKey];
        const templateName = card.querySelector('h3')?.textContent.trim() || 'Template';
        if (!pdfUrl || typeof pdfUrl !== 'string' || pdfUrl === '#') {
            logger.warn(`PDF path unavailable for template key: "${templateKey}". Configured path: "${pdfUrl}"`);
            alert(`The download for "${templateName}" is not available yet. Please check back soon!`);
            return;
        }
        logger.info(`Initiating PDF download: ${templateName} (key: ${templateKey}) from ${pdfUrl}`);
        const originalButtonHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Downloading...';
        button.setAttribute('aria-live', 'assertive');
        try {
            const link = document.createElement('a');
            link.href = pdfUrl;
            const safeName = templateName.toLowerCase().replace(/[^a-z0-9_.-]+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
            link.download = `rofilid-${safeName || templateKey}-template.pdf`;
            domCache.body.appendChild(link);
            link.click();
            domCache.body.removeChild(link);
            setTimeout(() => {
                button.disabled = false;
                button.innerHTML = originalButtonHtml;
                button.removeAttribute('aria-live');
            }, CONFIG.PDF_DOWNLOAD_FEEDBACK_DELAY);
        } catch (error) {
            logger.error("PDF download link creation/click failed:", error);
            alert(`An error occurred downloading "${templateName}". Please try again later.`);
            button.disabled = false;
            button.innerHTML = originalButtonHtml;
            button.removeAttribute('aria-live');
        }
    }

    function setupAnimations() {
        if (!("IntersectionObserver" in window)) {
            logger.warn("IntersectionObserver not supported. Animations disabled.");
            document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
            return;
        }
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
            const mainContentEl = domCache.mainContent || document.getElementById(CONSTANTS.MAIN_CONTENT_ID);
            if (mainContentEl) {
                mainContentEl.querySelectorAll(':scope > section[data-animate-fade-in]:not(#hero), :scope > aside.motivational-quote[data-animate-fade-in]')
                    .forEach(section => fadeObserver.observe(section));
            } else {
               logger.warn("Main content container not found for fade-in animation setup.");
            }
        } else {
            document.querySelectorAll('[data-animate-fade-in]').forEach(el => el.classList.add('is-visible'));
        }

        const heroStatsGrid = document.querySelector('.hero-stats-grid');
        if (CONFIG.ENABLE_HERO_STATS_ANIMATION && heroStatsGrid) {
            const statCards = Array.from(heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]'));
            if (statCards.length > 0) {
                const statsObserverOptions = { threshold: 0.3 };
                const statsObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const card = entry.target;
                            const cardIndex = statCards.findIndex(c => c === card);
                            if (cardIndex !== -1) {
                                const delay = cardIndex * 120;
                                card.style.transitionDelay = `${delay}ms`;
                                card.classList.add('is-visible');
                                logger.debug('Hero stat card animated:', cardIndex, `Delay: ${delay}ms`);
                            }
                           observer.unobserve(card);
                       }
                   });
               }, statsObserverOptions);
               statCards.forEach(card => statsObserver.observe(card));
            }
        } else if (heroStatsGrid) {
            heroStatsGrid.querySelectorAll('.stat-card[data-animate-fade-in]')
                .forEach(card => card.classList.add('is-visible'));
        }
        logger.info('Scroll-triggered animations setup complete.');
    }

    function updateCopyrightYear() {
        const span = domCache.footer.currentYearSpan;
        if (span) {
            span.textContent = new Date().getFullYear();
        }
   }

    // =========================================================================
    // INTRO QUIZ LOGIC (Learning Hub)
    // =========================================================================
    // This section (introQuizQuestions and quiz functions) appears large but the core
    // logic relies on cached elements (quizModalElements) and state (currentIntroQuizData)
    // already optimized above. Keep the existing structure. No major performance
    // changes needed here beyond using cached elements.

    const introQuizQuestions = [ /* Questions 1-20 remain unchanged */
         // ... Questions 1-20 ...
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
        const quizModal = domCache.modals[CONSTANTS.QUIZ_MODAL_ID] || document.getElementById(CONSTANTS.QUIZ_MODAL_ID);
        if (!quizModal) {
            logger.error("FATAL: Quiz Modal element (#quiz-modal) not found. Cannot cache sub-elements.");
            return false;
        }
        if (!domCache.modals[CONSTANTS.QUIZ_MODAL_ID]) {
            domCache.modals[CONSTANTS.QUIZ_MODAL_ID] = quizModal;
        }
        quizModalElements = {
            modal: quizModal, title: quizModal.querySelector('#quiz-modal-title'),
            questionEl: quizModal.querySelector('#quiz-modal-question'), optionsEl: quizModal.querySelector('#quiz-modal-options'),
            feedbackEl: quizModal.querySelector('#quiz-modal-feedback'), resultsEl: quizModal.querySelector('#quiz-modal-results'),
            progressArea: quizModal.querySelector('.quiz-modal-progress'), progressCurrent: quizModal.querySelector('#quiz-modal-q-current'),
            progressTotal: quizModal.querySelector('#quiz-modal-q-total'), nextBtn: quizModal.querySelector('#quiz-modal-next'),
            nextQuizBtn: quizModal.querySelector('#quiz-modal-next-quiz'), restartBtn: quizModal.querySelector('#quiz-modal-restart'),
            closeResultsBtn: quizModal.querySelector('#quiz-modal-close-results'), fullChallengePrompt: quizModal.querySelector('#quiz-modal-full-challenge-prompt')
        };
        const missingKeys = Object.entries(quizModalElements).filter(([key, el]) => !el && key !== 'modal').map(([key]) => key);
        if (missingKeys.length > 0) {
            logger.error(`Quiz modal crucial sub-elements missing: ${missingKeys.join(', ')}`);
            alert("Error: The quiz interface appears to be broken. Please refresh the page or contact support if the problem persists.");
            return false;
        }
        logger.debug("Quiz modal elements cached successfully.");
        return true;
    }

    function handleIntroQuizStart(button) {
        logger.debug('[handleIntroQuizStart] Quiz start button clicked:', button);
        const card = button.closest('.category-card');
        if (!card) {
            logger.error('[handleIntroQuizStart] Could not find parent .category-card for button:', button);
            alert("An error occurred locating the quiz category."); return;
        }
        const categoryId = parseInt(card.dataset.categoryId, 10);
        if (isNaN(categoryId) || categoryId < 1) {
            logger.error(`[handleIntroQuizStart] Invalid or missing category ID from card dataset:`, card.dataset);
            alert("Cannot start quiz: The category is not properly identified."); return;
        }
        if (categoryId > CONFIG.LAST_INTRO_CATEGORY_ID) {
            logger.warn(`[handleIntroQuizStart] Attempt to start quiz beyond intro limit (ID: ${categoryId}). Prompting user.`);
            alert("Ready for the full challenge?\n\nThis concept check is part of the complete learning journey. Visit the 'All Quizzes' page to continue!"); return;
        }
        const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);
        if (categoryQuestions.length === 0) {
            logger.error(`[handleIntroQuizStart] No intro quiz questions found for category ID: ${categoryId}. Check configuration.`);
            alert("Sorry, the questions for this quick check aren't available right now."); return;
        }
        logger.debug(`[handleIntroQuizStart] Starting quiz for category ${categoryId} with ${categoryQuestions.length} questions.`);
        startIntroQuiz(categoryId, categoryQuestions, button);
    }

    function startIntroQuiz(catId, questions, openingTrigger) {
        logger.info(`[startIntroQuiz] Initializing Intro Quiz - Category ID: ${catId}`);
        const quizModal = domCache.modals[CONSTANTS.QUIZ_MODAL_ID];
        if (!quizModal) {
             logger.error("[startIntroQuiz] CRITICAL FAILURE: Quiz modal DOM element not cached or found.");
             alert("Error: Could not load the quiz interface."); return;
        }
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            logger.error("[startIntroQuiz] FAILED: Invalid or empty questions array provided for category:", catId);
            alert("Error: Questions for this quiz check could not be loaded."); return;
        }
        if (!quizModalElements.optionsEl) {
           logger.error("[startIntroQuiz] CRITICAL FAILURE: Required quiz UI elements (like options area) missing from cache.");
           alert("Error: Quiz interface is incomplete."); return;
        }
        currentIntroQuizData = { questions, currentQuestionIndex: 0, score: 0, categoryId: catId };
        logger.debug("[startIntroQuiz] Quiz data state updated:", currentIntroQuizData);
        setupIntroQuizUI();
        displayIntroModalQuestion();
        openModal(quizModal, openingTrigger);
    }

    function setupIntroQuizUI() {
        logger.debug("[setupIntroQuizUI] Resetting and preparing quiz modal UI.");
        const { title, resultsEl, feedbackEl, questionEl, optionsEl, progressArea, progressTotal, nextBtn, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt } = quizModalElements;
        const firstQuestion = currentIntroQuizData.questions?.[0];
        if (title) title.textContent = firstQuestion?.category || 'Financial Concept Check';
        if (progressTotal) progressTotal.textContent = currentIntroQuizData.questions?.length || 0;
        if (resultsEl) { resultsEl.hidden = true; resultsEl.innerHTML = ''; }
        if (feedbackEl) { feedbackEl.hidden = true; feedbackEl.innerHTML = ''; }
        if (questionEl) { questionEl.hidden = false; questionEl.textContent = 'Loading question...'; }
        if (optionsEl) { optionsEl.hidden = false; optionsEl.innerHTML = ''; }
        if (progressArea) progressArea.hidden = false;
        [nextBtn, nextQuizBtn, restartBtn, closeResultsBtn].forEach(btn => { if (btn) btn.hidden = true; });
        if (fullChallengePrompt) fullChallengePrompt.hidden = true;
        logger.debug("[setupIntroQuizUI] UI prepared for new quiz session.");
    }

    function displayIntroModalQuestion() {
       const { questionEl, optionsEl, progressCurrent } = quizModalElements;
       const { questions, currentQuestionIndex } = currentIntroQuizData;
       logger.debug(`[displayIntroModalQuestion] Displaying question ${currentQuestionIndex + 1} of ${questions.length}`);
       if (!questionEl || !optionsEl || !progressCurrent) {
            logger.error("[displayIntroModalQuestion] FAILED: Missing critical cached UI elements (question, options, progress).");
            if (activeModal?.id === CONSTANTS.QUIZ_MODAL_ID) closeModal();
           alert("Error displaying the quiz question."); return;
       }
       if (currentQuestionIndex >= questions.length) {
           logger.info("[displayIntroModalQuestion] Reached end of questions. Displaying results.");
           showIntroModalResults(); return;
       }
       const q = questions[currentQuestionIndex];
       if (!q || !q.options) {
            logger.error(`[displayIntroModalQuestion] Invalid question data at index ${currentQuestionIndex}.`, q);
            if (activeModal?.id === CONSTANTS.QUIZ_MODAL_ID) closeModal();
           alert("Error loading the current question data."); return;
       }
       questionEl.innerHTML = `<span class="question-number">${currentQuestionIndex + 1}.</span> `;
       questionEl.appendChild(document.createTextNode(q.question));
       progressCurrent.textContent = currentQuestionIndex + 1;
       optionsEl.innerHTML = '';
       q.options.forEach((optionText, index) => {
           const label = document.createElement('label');
           label.className = 'option-label';
           const button = document.createElement('button');
           button.type = 'button'; button.className = 'option-button';
           button.textContent = optionText; button.dataset.index = index;
           button.onclick = () => handleIntroModalOptionSelection(index);
           label.appendChild(button); optionsEl.appendChild(label);
       });
       if (quizModalElements.feedbackEl) quizModalElements.feedbackEl.hidden = true;
       if (quizModalElements.nextBtn) quizModalElements.nextBtn.hidden = true;
       requestAnimationFrame(() => {
           const firstOptionButton = optionsEl.querySelector('.option-button');
            if (firstOptionButton && activeModal === quizModalElements.modal) {
               safeFocus(firstOptionButton);
            }
        });
       logger.debug("[displayIntroModalQuestion] Question and options rendered.");
   }

    function handleIntroModalOptionSelection(selectedIndex) {
        logger.debug(`[handleIntroModalOptionSelection] User selected option index: ${selectedIndex}`);
        const { optionsEl } = quizModalElements;
        const { questions, currentQuestionIndex } = currentIntroQuizData;
        if (!questions || currentQuestionIndex >= questions.length || !optionsEl) {
           logger.error("[handleIntroModalOptionSelection] Invalid state: Missing quiz data or options container."); return;
       }
       const q = questions[currentQuestionIndex];
       optionsEl.querySelectorAll('.option-button').forEach(button => {
           button.disabled = true; button.onclick = null;
       });
       const isCorrect = (selectedIndex === q.correctAnswerIndex);
       if (isCorrect) {
           currentIntroQuizData.score++;
           logger.debug(`[handleIntroModalOptionSelection] Answer CORRECT. Current score: ${currentIntroQuizData.score}`);
       } else {
           logger.debug(`[handleIntroModalOptionSelection] Answer INCORRECT. Correct index was: ${q.correctAnswerIndex}`);
       }
       showIntroModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
    }

    function showIntroModalFeedback(selectedIndex, correctIndex, explanation) {
       logger.debug("[showIntroModalFeedback] Preparing feedback display.");
       const { optionsEl, feedbackEl, nextBtn } = quizModalElements;
       if (!optionsEl || !feedbackEl) {
           logger.error("[showIntroModalFeedback] Critical UI elements (options, feedback) missing."); return;
       }
       optionsEl.querySelectorAll('.option-button').forEach((button, index) => {
           button.classList.remove('correct', 'incorrect');
           if (index === correctIndex) button.classList.add('correct');
           else if (index === selectedIndex) button.classList.add('incorrect');
       });
       const feedbackParagraph = document.createElement('p');
       const feedbackPrefix = document.createElement('strong');
       feedbackPrefix.textContent = (selectedIndex === correctIndex) ? 'Correct! ' : 'Insight: ';
       feedbackParagraph.appendChild(feedbackPrefix);
       feedbackParagraph.appendChild(document.createTextNode(explanation || 'No further explanation available.'));
       feedbackEl.innerHTML = '';
       feedbackEl.appendChild(feedbackParagraph);
       feedbackEl.className = `quiz-feedback ${(selectedIndex === correctIndex) ? 'correct' : 'incorrect'}`;
       feedbackEl.hidden = false;
       feedbackEl.setAttribute('aria-live', 'polite');
       const quiz = currentIntroQuizData;
       if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
            if (nextBtn) {
               nextBtn.hidden = false; safeFocus(nextBtn);
               logger.debug("[showIntroModalFeedback] 'Next Question' button shown and focused.");
           } else {
                logger.warn("[showIntroModalFeedback] 'Next Question' button element not found in cache.");
           }
       } else {
            if (nextBtn) nextBtn.hidden = true;
           logger.info("[showIntroModalFeedback] Reached final question. Triggering results display.");
            setTimeout(showIntroModalResults, 1500);
       }
   }

    function nextIntroModalQuestion() {
        logger.debug("[nextIntroModalQuestion] Moving to next question.");
        if (!currentIntroQuizData) { logger.warn("nextIntroModalQuestion called with no active quiz data."); return; }
        if (quizModalElements.feedbackEl) quizModalElements.feedbackEl.hidden = true;
        if (quizModalElements.nextBtn) quizModalElements.nextBtn.hidden = true;
        currentIntroQuizData.currentQuestionIndex++;
        displayIntroModalQuestion();
    }

    function showIntroModalResults() {
        logger.info("[showIntroModalResults] Displaying quiz results summary.");
        const { questionEl, optionsEl, feedbackEl, nextBtn, resultsEl, progressArea, nextQuizBtn, restartBtn, closeResultsBtn, fullChallengePrompt } = quizModalElements;
        const quiz = currentIntroQuizData;
        if (!resultsEl || !quiz || !quiz.questions) {
            logger.error("[showIntroModalResults] Missing results container, quiz data, or questions. Cannot show results.");
            if (activeModal?.id === CONSTANTS.QUIZ_MODAL_ID) closeModal(); return;
        }
        [questionEl, optionsEl, feedbackEl, nextBtn].forEach(el => { if (el) el.hidden = true; });
        if (progressArea) progressArea.hidden = true;
        const score = quiz.score; const total = quiz.questions.length;
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        let feedbackMsg; /* No change to result texts */
        if (percentage === 100) feedbackMsg = 'Excellent work! You have a strong understanding.';
        else if (percentage >= 80) feedbackMsg = 'Great job! You\'re building solid financial awareness.';
        else if (percentage >= 50) feedbackMsg = 'Good start! Review the insights to reinforce learning.';
        else feedbackMsg = 'Keep exploring our resources to strengthen your knowledge!';
        resultsEl.innerHTML = `<h4>Check Complete!</h4><p>You answered ${score} out of ${total} correctly.</p><p class="quiz-score-percentage">(${percentage}%)</p><p class="quiz-result-message">${feedbackMsg}</p>`;
        resultsEl.hidden = false; resultsEl.setAttribute('aria-live', 'assertive');
        let primaryFocusTarget = null;
        [restartBtn, closeResultsBtn, nextQuizBtn].forEach(btn => { if(btn) btn.hidden = true; });
        if (restartBtn) restartBtn.hidden = false;
        if (closeResultsBtn) { closeResultsBtn.hidden = false; primaryFocusTarget = closeResultsBtn; }
        const currentCatId = quiz.categoryId; const isLastIntroCategory = (currentCatId === CONFIG.LAST_INTRO_CATEGORY_ID); const hasMoreIntroCategories = (currentCatId < CONFIG.LAST_INTRO_CATEGORY_ID);
        if (hasMoreIntroCategories && nextQuizBtn) {
            nextQuizBtn.dataset.nextCategoryId = currentCatId + 1; nextQuizBtn.hidden = false; primaryFocusTarget = nextQuizBtn;
            logger.debug(`[showIntroModalResults] 'Next Check' button visible for category ${currentCatId + 1}.`);
        } else if (isLastIntroCategory && fullChallengePrompt) {
            fullChallengePrompt.hidden = false; logger.debug("[showIntroModalResults] Last intro category - 'Full Challenge' prompt shown.");
        }
        if (primaryFocusTarget) {
            safeFocus(primaryFocusTarget); logger.debug("[showIntroModalResults] Focused results action button:", primaryFocusTarget);
        } else {
            logger.warn("[showIntroModalResults] No primary focus target found for results actions."); safeFocus(resultsEl);
        }
    }

    function restartIntroModalQuiz() {
       logger.info("[restartIntroModalQuiz] Restarting current category quiz check.");
       const { categoryId } = currentIntroQuizData;
       if (!categoryId) {
           logger.error("[restartIntroModalQuiz] Failed: Category ID is missing from current quiz state.");
           closeModal(); return;
       }
       const questions = introQuizQuestions.filter(q => q.categoryId === categoryId);
       if (questions.length === 0) {
           logger.error(`[restartIntroModalQuiz] Failed: No questions found for category ID ${categoryId} upon restart attempt.`);
           alert("Sorry, there was an issue restarting this check."); closeModal(); return;
       }
       const originalTriggerButton = document.querySelector(`.category-card[data-category-id="${categoryId}"] .start-quiz-btn`);
       logger.debug(`[restartIntroModalQuiz] Re-starting quiz for category ${categoryId}.`);
       startIntroQuiz(categoryId, questions, originalTriggerButton || triggerElement);
    }

    function handleIntroNextQuizClick(event) {
       logger.debug("[handleIntroNextQuizClick] Processing 'Next Check' click.");
       const button = event.currentTarget; const nextCatId = parseInt(button.dataset.nextCategoryId, 10);
       if (isNaN(nextCatId) || nextCatId <= 0 || nextCatId > CONFIG.LAST_INTRO_CATEGORY_ID) {
           logger.error(`[handleIntroNextQuizClick] Invalid or out-of-range next category ID: "${button.dataset.nextCategoryId}".`);
           alert("Error: Could not determine the next valid check."); closeModal(); return;
       }
       const questions = introQuizQuestions.filter(q => q.categoryId === nextCatId);
       if (questions.length === 0) {
           logger.error(`[handleIntroNextQuizClick] Questions configuration missing for category ID: ${nextCatId}.`);
           alert(`Sorry, questions for the next check (ID: ${nextCatId}) are unavailable.`); closeModal(); return;
       }
       const nextCategoryTriggerButton = document.querySelector(`.category-card[data-category-id="${nextCatId}"] .start-quiz-btn`);
       logger.info(`[handleIntroNextQuizClick] Starting next quiz for category ${nextCatId}.`);
       startIntroQuiz(nextCatId, questions, nextCategoryTriggerButton || button);
    }

    function resetQuizModalUI() {
        const { feedbackEl, resultsEl, optionsEl, questionEl, progressArea } = quizModalElements;
        if (feedbackEl) { feedbackEl.hidden = true; feedbackEl.innerHTML = ''; feedbackEl.removeAttribute('aria-live'); }
        if (resultsEl) { resultsEl.hidden = true; resultsEl.innerHTML = ''; resultsEl.removeAttribute('aria-live'); }
        if (optionsEl) optionsEl.innerHTML = '';
        if (questionEl) questionEl.textContent = '';
        if (progressArea) progressArea.hidden = true;
        logger.debug("[resetQuizModalUI] Core quiz modal dynamic UI elements reset.");
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    function cacheDOMElements() {
        logger.debug("Caching common DOM elements...");
        domCache.siteHeader = document.querySelector('.site-header');
        domCache.primaryNav = document.getElementById('primary-navigation');
        domCache.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        domCache.mainContent = document.getElementById(CONSTANTS.MAIN_CONTENT_ID);
        domCache.modals[CONSTANTS.FEEDBACK_MODAL_ID] = document.getElementById(CONSTANTS.FEEDBACK_MODAL_ID);
        domCache.modals[CONSTANTS.QUIZ_MODAL_ID] = document.getElementById(CONSTANTS.QUIZ_MODAL_ID);
        domCache.forms[CONSTANTS.COACHING_FORM_ID] = document.getElementById(CONSTANTS.COACHING_FORM_ID);
        domCache.forms[CONSTANTS.FEEDBACK_FORM_ID] = document.getElementById(CONSTANTS.FEEDBACK_FORM_ID);
        domCache.footer.currentYearSpan = document.getElementById('current-year');
        Object.entries(domCache).forEach(([key, value]) => {
            if (value && typeof value === 'object' && !(value instanceof Element || value instanceof NodeList)) {
                Object.entries(value).forEach(([subKey, subValue]) => {
                   if(subValue) logger.debug(`Cached: domCache.${key}.${subKey}`);
                });
           } else if (value) {
               logger.debug(`Cached: domCache.${key}`);
            }
       });
        logger.info("Common DOM element caching complete.");
    }

    function setupEventListeners() {
        logger.debug("Setting up event listeners...");
        const mainContentEl = domCache.mainContent;
        if (mainContentEl) {
            mainContentEl.addEventListener('click', handleTemplateInteraction);
            mainContentEl.addEventListener('click', (event) => {
                const startButton = event.target.closest(`#${CONSTANTS.LEARNING_HUB_ID} .start-quiz-btn`);
                 if (startButton) { handleIntroQuizStart(startButton); }
            });
        } else { logger.error("Main content container not found. Delegated listeners not attached."); }

        if (domCache.mobileMenuToggle) { domCache.mobileMenuToggle.addEventListener('click', handleMobileNavToggle); }
        else { logger.warn("Mobile nav toggle button not found for direct listener."); }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => { anchor.addEventListener('click', handleSmoothScroll); });
        window.addEventListener('resize', debouncedResizeHandler);

        const openFeedbackBtn = document.getElementById('open-feedback-modal-btn');
        const feedbackModal = domCache.modals[CONSTANTS.FEEDBACK_MODAL_ID];
        if (openFeedbackBtn && feedbackModal) { openFeedbackBtn.addEventListener('click', (e) => openModal(feedbackModal, e.currentTarget)); }
        else { logger.warn("Open Feedback button or Feedback Modal not cached/found."); }

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (event) => {
               if (event.target === overlay && activeModal === overlay) { logger.debug('[Overlay Click] Closing modal via overlay:', overlay.id); closeModal(); }
            });
           const closeBtn = overlay.querySelector('.modal-close-btn');
            if (closeBtn) { closeBtn.addEventListener('click', () => { logger.debug(`[Close Button Click] Closing modal: ${overlay.id}`); closeModal(); }); }
       });

       const coachingForm = domCache.forms[CONSTANTS.COACHING_FORM_ID];
       if (coachingForm) {
           coachingForm.addEventListener('submit', (e) => handleFormSubmit({
               event: e, formId: CONSTANTS.COACHING_FORM_ID, fields: [ { id: 'interest-email', name: 'email', required: true, validator: isValidEmail, label: 'Email Address', errorMessage: 'Please enter a valid email.' } ],
               submitButtonSelector: 'button[type="submit"]', successMessage: 'Got it! We will notify you when coaching slots open up.',
               errorMessage: 'Submission error. Please verify your email and try again later.', endpointAction: 'coachingInterest', closeModalOnSuccess: false
           }));
       } else { logger.warn("Coaching interest form not found."); }

       const feedbackForm = domCache.forms[CONSTANTS.FEEDBACK_FORM_ID];
       if (feedbackForm) {
           feedbackForm.addEventListener('submit', (e) => handleFormSubmit({
               event: e, formId: CONSTANTS.FEEDBACK_FORM_ID, fields: [
                   { id: 'feedback-name', name: 'name', maxLength: 100 },
                   { id: 'feedback-email', name: 'email', validator: (val) => !val || isValidEmail(val), label: 'Email Address', errorMessage: 'If providing an email, please ensure it is valid.', maxLength: 100 },
                   { id: 'feedback-type', name: 'type', required: true, label: 'Feedback Type' },
                   { id: 'feedback-message', name: 'message', required: true, label: 'Your Message', minLength: 10, maxLength: 2500 },
                   { id: 'feedback-permission', name: 'permissionGranted' } ],
               submitButtonSelector: 'button[type="submit"]', successMessage: 'Thank you, your feedback has been received!',
               errorMessage: 'Oops! Something went wrong submitting your feedback. Please try again.', endpointAction: 'submitFeedback', closeModalOnSuccess: true,
               onSuccess: resetFeedbackForm
           }));
           const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
           if (feedbackTypeSelect) {
               feedbackTypeSelect.addEventListener('change', handleFeedbackTypeChange);
               handleFeedbackTypeChange({ target: feedbackTypeSelect }); // Initial check
           }
       } else { logger.warn("Feedback form not found."); }

       if (!quizModalElements.modal) { logger.warn("Quiz modal actions not attached - modal not cached properly."); }
       else {
           if (quizModalElements.nextBtn) quizModalElements.nextBtn.addEventListener('click', nextIntroModalQuestion);
           if (quizModalElements.restartBtn) quizModalElements.restartBtn.addEventListener('click', restartIntroModalQuiz);
           if (quizModalElements.nextQuizBtn) quizModalElements.nextQuizBtn.addEventListener('click', handleIntroNextQuizClick);
           // Note: The quiz modal's internal close button is handled by the generic modal close loop above
       }
       logger.info("Event listeners setup phase complete.");
    }

    function initializePersonalPage() {
        if (!domCache.body.classList.contains('personal-page') && !document.documentElement.classList.contains('personal-page')) {
            domCache.body.classList.add('js-personal-page-init');
        }
        logger.info("Rofilid Personal Page Scripts Initializing (v2.7.0 Optimized)");
        cacheDOMElements();
       if (!cacheQuizModalElements()) {
            logger.error("Quiz functionality will be unavailable due to missing modal elements.");
        }
        updateHeaderHeight();
        updateCopyrightYear();
        setupEventListeners();
        setupAnimations();
        logger.info("Rofilid Personal Page Scripts Fully Loaded and Ready.");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePersonalPage);
    } else {
        requestAnimationFrame(initializePersonalPage);
    }

})(); // End IIFE
