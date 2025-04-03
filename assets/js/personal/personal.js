/**
 * File Location: /assets/js/personal/personal.js
 * Description: Scripts for the ROFILID Personal Finance page (personal.html - v2.1.0).
 *              Handles navigation, modals (quiz & feedback), forms, animations, and other interactions.
 * Dependencies: Font Awesome (for icons), main.js (optional, for potential global functions)
 */

document.addEventListener('DOMContentLoaded', () => {

    console.log("Rofilid Personal Page Scripts Initializing (v2.1.0)");

    // --- Global Variables & Elements ---
    const body = document.body;
    const siteHeader = document.querySelector('.site-header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const primaryNavigation = document.getElementById('primary-navigation');

    // Modals
    const quizModal = document.getElementById('quiz-modal');
    const feedbackModal = document.getElementById('feedback-modal');
    const openFeedbackBtn = document.getElementById('open-feedback-modal-btn');

    // Forms
    const coachingInterestForm = document.getElementById('coachingInterestForm');
    const feedbackForm = document.getElementById('feedback-testimonial-form');

    let activeModal = null; // Track the currently open modal
    let quizTriggerElement = null; // Stores the element that opened the quiz modal
    let feedbackTriggerElement = null; // Stores the element that opened the feedback modal

    // --- Helper Functions ---

    /**
     * Opens a modal dialog.
     * @param {HTMLElement} modalElement - The modal overlay element.
     * @param {HTMLElement|null} triggerElement - The element that triggered the modal (for focus return).
     */
    function openModal(modalElement, triggerElement = null) {
        if (!modalElement) return;
        if (activeModal) closeModal(activeModal); // Close any existing modal first

        modalElement.style.display = 'flex';
        body.style.overflow = 'hidden'; // Prevent background scroll
        activeModal = modalElement;

        // Store trigger element for focus management
        if (triggerElement) {
            if (modalElement === quizModal) quizTriggerElement = triggerElement;
            if (modalElement === feedbackModal) feedbackTriggerElement = triggerElement;
        }

        // Focus the modal container or close button for accessibility after transition
        const focusTarget = modalElement.querySelector('.modal-close-btn') || modalElement.querySelector('.modal-content');
        setTimeout(() => {
            if (focusTarget) focusTarget.focus();
        }, 350); // Delay matching CSS transition duration
    }

    /**
     * Closes the currently active modal dialog.
     */
    function closeModal() {
        if (!activeModal) return;

        const modalToClose = activeModal;
        activeModal = null;

        // Get the correct trigger element based on which modal is closing
        let triggerElementToFocus = null;
        if (modalToClose === quizModal) triggerElementToFocus = quizTriggerElement;
        if (modalToClose === feedbackModal) triggerElementToFocus = feedbackTriggerElement;

        modalToClose.style.display = 'none';
        body.style.overflow = ''; // Restore scroll

        // Reset specific modal states if needed (e.g., form fields)
        if (modalToClose === feedbackModal) resetFeedbackForm();

        // Return focus to the element that opened the modal
        if (triggerElementToFocus) {
            triggerElementToFocus.focus();
            // Clear stored trigger
            if (modalToClose === quizModal) quizTriggerElement = null;
            if (modalToClose === feedbackModal) feedbackTriggerElement = null;
        }
    }

    /**
     * Displays a message within a form.
     * @param {HTMLElement} formElement - The form element.
     * @param {string} message - The message to display.
     * @param {'success' | 'error'} type - The type of message.
     */
    function showFormResponseMessage(formElement, message, type) {
        const responseEl = formElement.querySelector('.form-response-note');
        if (!responseEl) return;
        responseEl.textContent = message;
        responseEl.className = `form-response-note ${type}`;
        responseEl.style.display = 'block';
    }

    /**
     * Hides the response message within a form.
     * @param {HTMLElement} formElement - The form element.
     */
    function hideFormResponseMessage(formElement) {
        const responseEl = formElement.querySelector('.form-response-note');
        if (responseEl) responseEl.style.display = 'none';
    }

    /**
     * Clears form validation error messages.
     * @param {HTMLFormElement} formElement - The form element.
     */
    function clearFormErrors(formElement) {
        formElement.querySelectorAll('.form-error-msg').forEach(msg => {
            msg.textContent = '';
        });
        formElement.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
        });
    }

    /**
     * Displays a validation error message for a specific input field.
     * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} inputElement
     * @param {string} message
     */
    function showInputError(inputElement, message) {
        inputElement.classList.add('is-invalid');
        const errorMsgElement = inputElement.closest('.form-group')?.querySelector('.form-error-msg');
        if (errorMsgElement) {
            errorMsgElement.textContent = message;
        }
    }


    // --- Navigation Logic ---

    // Mobile Menu Toggle
    if (mobileMenuToggle && primaryNavigation) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = primaryNavigation.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            // Toggle body scroll only if menu becomes active
            body.style.overflow = isExpanded ? 'hidden' : '';
        });
    }

    // Smooth Scrolling & Close Mobile Nav on Link Click
    document.querySelectorAll('.nav-list a[href^="#"], a.connect-button[href^="#"], a.hero-actions a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.length > 1 && href.startsWith('#')) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = siteHeader?.offsetHeight || 70;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile nav if it's open
                    if (primaryNavigation && primaryNavigation.classList.contains('active')) {
                         primaryNavigation.classList.remove('active');
                         mobileMenuToggle.setAttribute('aria-expanded', 'false');
                         body.style.overflow = ''; // Ensure scroll is restored
                    }
                }
            }
        });
    });

    // Global: Close mobile nav on scroll (delegated from main.js, but can be added here if needed)
    // window.addEventListener('scroll', () => {
    //     if (primaryNavigation && primaryNavigation.classList.contains('active')) {
    //         primaryNavigation.classList.remove('active');
    //         mobileMenuToggle.setAttribute('aria-expanded', 'false');
    //         body.style.overflow = '';
    //     }
    // });

    // Close modals on Escape key press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModal) {
            closeModal();
        }
    });

    // Close modals on overlay click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') && activeModal) {
            closeModal();
        }
    });

    // --- Animations & Interactions ---

    // Stats Counter Logic (Using Intersection Observer)
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statCard = entry.target;
                const displayEl = statCard.querySelector('h4');

                if (!displayEl || displayEl.classList.contains('counted')) {
                    observer.unobserve(statCard);
                    return;
                }

                const targetSpan = statCard.querySelector('.stat-target');
                const target = targetSpan ? parseInt(targetSpan.textContent, 10) : null;

                if (target === null || isNaN(target)) {
                     console.warn("Stat card found without a valid .stat-target span:", statCard);
                     displayEl.classList.add('counted');
                     observer.unobserve(statCard);
                     return;
                }

                // Mark as counted immediately for this design (no visual counting animation)
                displayEl.classList.add('counted');
                observer.unobserve(statCard);

                // --- Optional: Add a subtle animation on intersection ---
                 statCard.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
                 statCard.style.opacity = '1';
                 statCard.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.4 });

    document.querySelectorAll('.hero-stats-grid .stat-card').forEach(card => {
        // Initial state for animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        statsObserver.observe(card);
    });

    // General Smooth Fade-in for Sections
     const fadeObserver = new IntersectionObserver((entries, observer) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 entry.target.style.opacity = 1;
                 entry.target.style.transform = 'translateY(0)';
                 observer.unobserve(entry.target);
             }
         });
     }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

     document.querySelectorAll('section:not(.hero-section)').forEach(section => { // Exclude hero
         section.style.opacity = 0;
         section.style.transform = 'translateY(20px)';
         section.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
         fadeObserver.observe(section);
     });


    // --- INTRO Quiz Logic (Categories 1-4) ---
    // (Using the same questions data as provided in the original personal.js)
    const introQuizQuestions = [
         // Cat 1: Income & Financial Vitals
         { id: 1, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "What is the first essential step when starting to create a budget?", options: ["Calculate total monthly income", "List all fixed expenses", "Set long-term financial goals", "Track spending habits for a month"], correctAnswerIndex: 0, explanation: "Knowing your total income is fundamental; it's the basis upon which all budget allocations are planned." },
         { id: 2, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "You earn ₦150,000 per month after tax and manage to save ₦22,500. What is your savings rate?", options: ["10%", "15%", "20%", "22.5%"], correctAnswerIndex: 1, explanation: "Savings Rate = (Amount Saved / Total Income) × 100. So, (₦22,500 / ₦150,000) × 100 = 15%." },
         { id: 3, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "What does 'Pay Yourself First' mean?", options: ["Spend on wants before needs", "Allocate income to savings/investments *before* other spending", "Pay off all debts before saving", "Treat yourself each payday"], correctAnswerIndex: 1, explanation: "'Pay Yourself First' prioritizes saving by treating it like a mandatory bill, ensuring progress towards goals." },
         { id: 4, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "How is personal Net Worth calculated?", options: ["Annual Income - Annual Expenses", "Total Assets (what you own) - Total Liabilities (what you owe)", "Total Savings + Total Investments", "Monthly Income x 12"], correctAnswerIndex: 1, explanation: "Net worth is a snapshot of your financial position: Assets minus Liabilities." },
         { id: 5, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "₦50,000 in a savings account earns 4% simple annual interest. How much interest after one year?", options: ["₦400", "₦5,000", "₦2,000", "₦200"], correctAnswerIndex: 2, explanation: "Simple interest = Principal × Rate × Time. ₦50,000 × 0.04 × 1 = ₦2,000." },
         // Cat 2: Savings Essentials
         { id: 6, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "Why save regularly, even small amounts?", options: ["To impress others", "To build funds for emergencies, goals & investments", "Banks guarantee high returns", "Only to avoid spending now"], correctAnswerIndex: 1, explanation: "Consistent saving builds security (emergency fund) and accumulates funds for future goals and wealth building." },
         { id: 7, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "Benefit of starting to save early?", options: ["Retire sooner automatically", "Maximize compound interest over time", "Avoid future taxes", "Interest rates are higher for young savers"], correctAnswerIndex: 1, explanation: "Starting early gives compound interest more time to work its magic, leading to significantly larger sums long-term." },
         { id: 8, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "Most crucial factor when choosing a savings account?", options: ["Bank's logo color", "Interest rate (APY) and fees", "Number of branches", "If friends use the same bank"], correctAnswerIndex: 1, explanation: "Interest rate determines growth, fees can reduce your balance. These are key financial factors." },
         { id: 9, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "Best place for an emergency fund?", options: ["Stock market for growth", "Easily accessible high-yield savings or money market account", "Under the mattress", "Long-term fixed deposit"], correctAnswerIndex: 1, explanation: "Emergency funds need safety and accessibility, ideally earning some interest, like in a high-yield savings account." },
         { id: 10, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "What is simple interest?", options: ["Interest only on the initial principal", "Interest on principal + accumulated interest", "A fee to open an account", "Interest that decreases"], correctAnswerIndex: 0, explanation: "Simple interest is calculated *only* on the original principal amount for the entire period." },
         // Cat 3: Budgeting Basics
         { id: 11, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "Primary purpose of a budget?", options: ["Track past spending", "Plan future spending and saving", "Restrict all 'fun' spending", "Calculate taxes"], correctAnswerIndex: 1, explanation: "A budget is a forward-looking financial plan to allocate income towards expenses, savings, and goals." },
         { id: 12, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "Fixed vs. Variable expenses?", options: ["Fixed change monthly, variable don't", "Fixed stay mostly the same (rent), variable change (groceries)", "Both change", "Both stay the same"], correctAnswerIndex: 1, explanation: "Fixed expenses (rent, loan payments) are consistent; variable expenses (food, fuel) fluctuate." },
         { id: 13, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "Difference between 'need' and 'want'?", options: ["Needs bought often, wants rarely", "Needs are essential (food, shelter), wants improve comfort/enjoyment", "Needs cost more", "Wants are what friends have"], correctAnswerIndex: 1, explanation: "Needs are essential for survival/well-being; wants are non-essential desires. This helps prioritize spending." },
         { id: 14, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "What is the 50/30/20 rule?", options: ["50% Needs, 30% Wants, 20% Savings/Debt", "50% Savings, 30% Needs, 20% Wants", "50% Wants, 30% Needs, 20% Savings", "50% Debt, 30% Savings, 20% Expenses"], correctAnswerIndex: 0, explanation: "The 50/30/20 rule suggests allocating 50% of after-tax income to Needs, 30% to Wants, and 20% to Savings/Debt Repayment." },
         { id: 15, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "What is a sinking fund used for?", options: ["Main emergency fund", "Saving regularly for a specific, planned future expense", "High-risk investments", "Only for paying debt"], correctAnswerIndex: 1, explanation: "A sinking fund saves gradually for a known upcoming expense (e.g., car repair, vacation) to avoid borrowing later." },
         // Cat 4: Tracking & Managing Spending
         { id: 16, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Practical first step to track expenses accurately?", options: ["Ignore small cash spending", "Keep receipts & note *all* spending", "Only track card payments", "Guess monthly totals"], correctAnswerIndex: 1, explanation: "Tracking every expense gives a complete picture, crucial for effective budgeting and finding savings." },
         { id: 17, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Why track expenses regularly?", options: ["To know how much you can borrow", "To see where money goes & find potential savings", "To share habits with friends", "To simplify tax calculation"], correctAnswerIndex: 1, explanation: "Regular tracking reveals patterns, helps stick to a budget, and identifies non-essential spending to redirect." },
         { id: 18, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Which tool is useful in cash-heavy environments?", options: ["Complex financial software", "The envelope system (allocating cash)", "Volatile asset investing", "Mental calculations only"], correctAnswerIndex: 1, explanation: "The envelope system physically allocates cash for different categories, helping control cash spending." },
         { id: 19, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Your entertainment budget is ₦10,000. You spent ₦8,500. What % remains?", options: ["5%", "10%", "15%", "85%"], correctAnswerIndex: 2, explanation: "Remaining = ₦10k - ₦8.5k = ₦1.5k. % Remaining = (₦1.5k / ₦10k) * 100 = 15%." },
         { id: 20, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Item costs ₦25,000, but has a 20% discount. What's the final price?", options: ["₦5,000", "₦20,000", "₦24,000", "₦30,000"], correctAnswerIndex: 1, explanation: "Discount = ₦25k * 0.20 = ₦5k. Final Price = ₦25k - ₦5k = ₦20,000." }
    ];
    const LAST_INTRO_CATEGORY_ID = 4;

    // Quiz Modal State & DOM References
    let currentQuizData = { questions: [], currentQuestionIndex: 0, score: 0 };
    const quizModalTitle = document.getElementById('quiz-modal-title');
    const quizModalCloseBtn = document.getElementById('quiz-modal-close');
    const quizModalQuestionEl = document.getElementById('quiz-modal-question');
    const quizModalOptionsEl = document.getElementById('quiz-modal-options');
    const quizModalFeedbackEl = document.getElementById('quiz-modal-feedback');
    const quizModalNextBtn = document.getElementById('quiz-modal-next');
    const quizModalResultsEl = document.getElementById('quiz-modal-results');
    const quizModalProgressCurrent = document.getElementById('quiz-modal-q-current');
    const quizModalProgressTotal = document.getElementById('quiz-modal-q-total');
    const quizModalNextQuizBtn = document.getElementById('quiz-modal-next-quiz');
    const quizModalRestartBtn = document.getElementById('quiz-modal-restart');
    const quizModalCloseResultsBtn = document.getElementById('quiz-modal-close-results');
    const quizModalFullChallengePrompt = document.getElementById('quiz-modal-full-challenge-prompt');

    function startQuiz(categoryId) {
        console.log(`Starting INTRO quiz check for category ID: ${categoryId}`);
        const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);

        if (categoryQuestions.length === 0) {
            console.error("No INTRO questions found for category ID:", categoryId);
            alert("Sorry, questions for this check could not be loaded.");
            return;
        }

        currentQuizData = { questions: categoryQuestions, currentQuestionIndex: 0, score: 0 };

        // Reset Modal UI
        if (quizModalTitle) quizModalTitle.textContent = categoryQuestions[0]?.category || 'Financial Concept Check';
        if (quizModalResultsEl) quizModalResultsEl.style.display = 'none';
        if (quizModalFeedbackEl) quizModalFeedbackEl.style.display = 'none';
        if (quizModalQuestionEl) quizModalQuestionEl.style.display = 'block';
        if (quizModalOptionsEl) quizModalOptionsEl.style.display = 'flex';
        const progressEl = quizModalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'block';
        if (quizModalProgressTotal) quizModalProgressTotal.textContent = currentQuizData.questions.length;

        // Hide all nav buttons initially
        [quizModalNextBtn, quizModalNextQuizBtn, quizModalRestartBtn, quizModalCloseResultsBtn, quizModalFullChallengePrompt].forEach(btn => {
            if (btn) btn.style.display = 'none';
        });

        displayModalQuestion();
        openModal(quizModal, quizTriggerElement); // Use shared openModal function
    }

    function displayModalQuestion() {
        const quiz = currentQuizData;
        if (!quizModalQuestionEl || !quizModalOptionsEl || !quizModalProgressCurrent || quiz.currentQuestionIndex >= quiz.questions.length) {
            if (quiz.currentQuestionIndex >= quiz.questions.length) showModalResults();
            return;
        }

        const q = quiz.questions[quiz.currentQuestionIndex];
        quizModalQuestionEl.innerHTML = `<span class="question-number">${quiz.currentQuestionIndex + 1}.</span> ${q.question}`; // Add Q number styling if needed
        quizModalOptionsEl.innerHTML = '';
        if (quizModalFeedbackEl) quizModalFeedbackEl.style.display = 'none';
        if (quizModalNextBtn) quizModalNextBtn.style.display = 'none';
        quizModalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;

        q.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-button btn'; // Add base btn class for styling
            button.setAttribute('data-index', index);
            button.onclick = () => handleModalOptionSelection(index);
            quizModalOptionsEl.appendChild(button);
        });

        // Focus first option
        const firstOption = quizModalOptionsEl.querySelector('button');
        if (firstOption) firstOption.focus();
    }

    function handleModalOptionSelection(selectedIndex) {
        const quiz = currentQuizData;
        const q = quiz.questions[quiz.currentQuestionIndex];
        const buttons = quizModalOptionsEl?.querySelectorAll('button');
        if (!buttons) return;

        buttons.forEach(button => button.disabled = true);
        showModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
    }

    function showModalFeedback(selectedIndex, correctIndex, explanation) {
        const quiz = currentQuizData;
        const isCorrect = selectedIndex === correctIndex;
        if (isCorrect) quiz.score++;

        const buttons = quizModalOptionsEl?.querySelectorAll('button');
        if (!buttons || !quizModalFeedbackEl) return;

        buttons.forEach((button, index) => {
            button.classList.remove('btn-outline'); // Remove default outline if present
            if (index === correctIndex) button.classList.add('correct');
            else if (index === selectedIndex) button.classList.add('incorrect');
            else button.classList.add('disabled'); // Visually disable non-selected/non-correct
        });

        quizModalFeedbackEl.innerHTML = `<p><strong>${isCorrect ? 'Correct!' : 'Insight:'}</strong> ${explanation || ''}</p>`;
        quizModalFeedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        quizModalFeedbackEl.style.display = 'block';

        if (quizModalNextBtn) {
            if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
                quizModalNextBtn.style.display = 'inline-block';
                quizModalNextBtn.focus();
            } else {
                quizModalNextBtn.style.display = 'none';
                setTimeout(showModalResults, 1000);
            }
        }
    }

    function nextModalQuestion() {
        if (quizModalFeedbackEl) quizModalFeedbackEl.style.display = 'none';
        if (quizModalNextBtn) quizModalNextBtn.style.display = 'none';
        currentQuizData.currentQuestionIndex++;
        displayModalQuestion();
    }

    function showModalResults() {
        const quiz = currentQuizData;
        const finishedCategoryId = quiz.questions[0]?.categoryId;

        [quizModalQuestionEl, quizModalOptionsEl, quizModalFeedbackEl, quizModalNextBtn].forEach(el => {
            if(el) el.style.display = 'none';
        });
        const progressEl = quizModalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'none';

        if (quizModalResultsEl) {
            const score = quiz.score;
            const total = quiz.questions.length;
            const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
            let feedbackMessage = 'Every step in learning counts!';
            if (percentage === 100) feedbackMessage = 'Excellent understanding!';
            else if (percentage >= 75) feedbackMessage = 'Great job!'; // Adjusted threshold
            else if (percentage >= 50) feedbackMessage = 'Good grasp of the basics!';

            quizModalResultsEl.innerHTML = `
                <h4>Check Complete!</h4>
                <p>You answered ${score} out of ${total} correctly.</p>
                <p class="quiz-score-percentage">(${percentage}%)</p>
                <p class="quiz-result-message">${feedbackMessage}</p>
            `;
            quizModalResultsEl.style.display = 'block';
        }

        // Show appropriate navigation/prompt
        if (quizModalNextQuizBtn) quizModalNextQuizBtn.style.display = 'none';
        if (quizModalFullChallengePrompt) quizModalFullChallengePrompt.style.display = 'none';

        if (finishedCategoryId && finishedCategoryId < LAST_INTRO_CATEGORY_ID) {
            const nextCategoryId = finishedCategoryId + 1;
            if (quizModalNextQuizBtn) {
                quizModalNextQuizBtn.style.display = 'inline-block';
                quizModalNextQuizBtn.setAttribute('data-next-category-id', nextCategoryId);
            }
        } else if (finishedCategoryId && finishedCategoryId === LAST_INTRO_CATEGORY_ID) {
            if (quizModalFullChallengePrompt) quizModalFullChallengePrompt.style.display = 'block';
        }

        if (quizModalRestartBtn) quizModalRestartBtn.style.display = 'inline-block';
        if (quizModalCloseResultsBtn) quizModalCloseResultsBtn.style.display = 'inline-block';

        const firstVisibleButton = quizModalNextQuizBtn?.style.display !== 'none' ? quizModalNextQuizBtn :
                                  quizModalRestartBtn?.style.display !== 'none' ? quizModalRestartBtn :
                                  quizModalCloseResultsBtn;
        if (firstVisibleButton) firstVisibleButton.focus();
    }

    function restartModalQuiz() {
        const categoryId = currentQuizData.questions[0]?.categoryId;
        if (categoryId) {
             if (quizModalResultsEl) quizModalResultsEl.style.display = 'none';
             [quizModalNextQuizBtn, quizModalRestartBtn, quizModalCloseResultsBtn, quizModalFullChallengePrompt].forEach(btn => {
                if (btn) btn.style.display = 'none';
             });
            startQuiz(categoryId); // Restart with the same category
        } else {
            closeModal(); // Close if category unknown
        }
    }

    function handleNextQuizClick(event) {
        const nextCategoryId = parseInt(event.target.dataset.nextCategoryId, 10);
        if (!isNaN(nextCategoryId)) {
             if (quizModalResultsEl) quizModalResultsEl.style.display = 'none';
             [quizModalNextQuizBtn, quizModalRestartBtn, quizModalCloseResultsBtn, quizModalFullChallengePrompt].forEach(btn => {
                 if (btn) btn.style.display = 'none';
             });
             // Find the trigger button for the next category to pass to openModal
             const nextTrigger = document.querySelector(`.category-card[data-category-id="${nextCategoryId}"] .start-quiz-btn`);
             quizTriggerElement = nextTrigger; // Update trigger for focus return
            startQuiz(nextCategoryId);
        } else {
            console.error("Could not determine next category ID.");
        }
    }

    // Attach Event Listeners for INTRO Quiz Buttons
    document.querySelectorAll('#learning-hub .start-quiz-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            const categoryId = card ? parseInt(card.dataset.categoryId, 10) : null;
            if (categoryId && categoryId >= 1 && categoryId <= LAST_INTRO_CATEGORY_ID) {
                quizTriggerElement = e.target; // Store the button that was clicked
                startQuiz(categoryId);
            } else {
                console.error("Missing or invalid category ID on card:", card);
                alert("Could not start this check. Please try again later.");
            }
        });
    });

    // Attach Quiz Modal Button Listeners
    if (quizModalCloseBtn) quizModalCloseBtn.addEventListener('click', () => closeModal());
    if (quizModalCloseResultsBtn) quizModalCloseResultsBtn.addEventListener('click', () => closeModal());
    if (quizModalNextBtn) quizModalNextBtn.addEventListener('click', nextModalQuestion);
    if (quizModalRestartBtn) quizModalRestartBtn.addEventListener('click', restartModalQuiz);
    if (quizModalNextQuizBtn) quizModalNextQuizBtn.addEventListener('click', handleNextQuizClick);
    // --- END INTRO Quiz Logic ---


    // --- Template Purchase & Download Logic ---
     document.querySelectorAll('.get-spreadsheet-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const templateName = button.dataset.templateName || 'Spreadsheet Template';
            const price = button.dataset.price || '10000';
            alert(`Interactive "${templateName}" Spreadsheet (₦${parseInt(price).toLocaleString()})\n\nAdvanced features available. Purchase process coming soon!\n\nA Gmail account is required for spreadsheet access.`);
            console.log(`Purchase interest: ${templateName}, Price: ₦${price}`);
        });
    });

    document.querySelectorAll('.download-pdf-btn').forEach(button => {
         button.addEventListener('click', (e) => {
             e.preventDefault();
             const templateCard = e.target.closest('.template-card');
             const templateName = templateCard?.querySelector('h3')?.textContent || 'Template';
             // ** IMPORTANT: Replace '#' with actual PDF file paths **
             const pdfFiles = {
                 'Line-Item Budget': '../../assets/downloads/line-item-budget.pdf', // Example path
                 'Net Worth Statement': '../../assets/downloads/net-worth-statement.pdf',
                 'Personal Cashflow Statement': '../../assets/downloads/personal-cashflow.pdf',
                 '50/30/20 Budget Guide': '../../assets/downloads/50-30-20-budget.pdf',
                 'Simple Expense Tracker': '../../assets/downloads/expense-tracker.pdf'
             };
             const pdfUrl = pdfFiles[templateName] || '#'; // Fallback to '#'

             if (pdfUrl && pdfUrl !== '#') {
                 console.log(`PDF Download initiated for: ${templateName} from ${pdfUrl}`);
                 // Create a temporary link to trigger download
                 const link = document.createElement('a');
                 link.href = pdfUrl;
                 link.download = templateName.replace(/ /g, '-') + '.pdf'; // Set download filename
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
             } else {
                alert(`Downloading ${templateName} PDF (Free)... \n(File path not yet configured for this template.)`);
                console.warn(`PDF Download failed: Path not set for ${templateName}`);
             }
         });
    });


    // --- Coaching Interest Form Logic (with Validation) ---
    if (coachingInterestForm) {
        coachingInterestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFormErrors(coachingInterestForm);
            hideFormResponseMessage(coachingInterestForm);

            const emailInput = coachingInterestForm.querySelector('#interest-email');
            const submitButton = coachingInterestForm.querySelector('button[type="submit"]');
            let isValid = true;

            // Basic Email Validation
            if (!emailInput.value.trim()) {
                showInputError(emailInput, 'Email address is required.');
                isValid = false;
            } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) { // Simple regex for email format
                showInputError(emailInput, 'Please enter a valid email address.');
                isValid = false;
            }

            if (!isValid) {
                // Find the first invalid input and focus it
                coachingInterestForm.querySelector('.is-invalid')?.focus();
                return;
            }

            // Simulate submission
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            console.log("Coaching interest submitted for:", emailInput.value);

            // Simulate backend response (Replace with actual fetch/AJAX)
            setTimeout(() => {
                const isSuccess = Math.random() > 0.1; // Simulate 90% success rate

                if (isSuccess) {
                    showFormResponseMessage(coachingInterestForm, 'Thank you! We\'ve received your interest and will notify you.', 'success');
                    emailInput.value = ''; // Clear input on success
                    submitButton.innerHTML = '<i class="fas fa-check"></i> Submitted!';
                    // Keep button disabled after success
                } else {
                    showFormResponseMessage(coachingInterestForm, 'Submission failed. Please check your connection and try again.', 'error');
                    submitButton.disabled = false; // Re-enable on error
                    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Notify Me When Available';
                }
            }, 1500);
        });
    }

    // --- Feedback / Testimonial Modal & Form Logic ---
    const feedbackModalCloseBtn = document.getElementById('feedback-modal-close');
    const feedbackTypeSelect = document.getElementById('feedback-type');
    const permissionGroup = feedbackForm?.querySelector('.permission-group');

    // Open Feedback Modal
    if (openFeedbackBtn && feedbackModal) {
        openFeedbackBtn.addEventListener('click', (e) => {
            feedbackTriggerElement = e.target; // Store trigger
            openModal(feedbackModal, feedbackTriggerElement);
        });
    }

    // Close Feedback Modal
    if (feedbackModalCloseBtn) {
        feedbackModalCloseBtn.addEventListener('click', () => closeModal());
    }

    // Show/Hide Permission Checkbox based on Type
    if (feedbackTypeSelect && permissionGroup) {
        feedbackTypeSelect.addEventListener('change', () => {
            if (feedbackTypeSelect.value === 'testimonial') {
                permissionGroup.style.display = 'flex';
            } else {
                permissionGroup.style.display = 'none';
                // Uncheck if hidden
                permissionGroup.querySelector('#feedback-permission').checked = false;
            }
        });
    }

    // Feedback Form Submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearFormErrors(feedbackForm);
            hideFormResponseMessage(feedbackForm);

            const nameInput = feedbackForm.querySelector('#feedback-name'); // Optional
            const emailInput = feedbackForm.querySelector('#feedback-email'); // Optional but validated if present
            const typeInput = feedbackForm.querySelector('#feedback-type');
            const messageInput = feedbackForm.querySelector('#feedback-message');
            const permissionInput = feedbackForm.querySelector('#feedback-permission');
            const submitButton = feedbackForm.querySelector('button[type="submit"]');
            let isValid = true;

            // Validation
            if (!typeInput.value) {
                showInputError(typeInput, 'Please select a feedback type.');
                isValid = false;
            }
            if (!messageInput.value.trim()) {
                showInputError(messageInput, 'Please enter your message.');
                isValid = false;
            } else if (messageInput.value.trim().length < 10) {
                 showInputError(messageInput, 'Message should be at least 10 characters long.');
                 isValid = false;
            }

            // Validate email only if provided
            if (emailInput.value.trim() && !/\S+@\S+\.\S+/.test(emailInput.value)) {
                showInputError(emailInput, 'Please enter a valid email address or leave blank.');
                isValid = false;
            }

            if (!isValid) {
                feedbackForm.querySelector('.is-invalid')?.focus();
                return;
            }

            // Prepare data (example)
            const formData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                type: typeInput.value,
                message: messageInput.value.trim(),
                permissionGranted: typeInput.value === 'testimonial' ? permissionInput.checked : null
            };

            // Simulate submission
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            console.log("Feedback/Testimonial Data:", formData);

            // Simulate backend response
            setTimeout(() => {
                 const isSuccess = Math.random() > 0.1; // Simulate 90% success rate

                if (isSuccess) {
                    showFormResponseMessage(feedbackForm, 'Thank you! Your feedback has been submitted successfully.', 'success');
                    // Optionally close modal after a delay
                    setTimeout(() => {
                         closeModal();
                         // resetFeedbackForm(); // Reset is done by closeModal now
                    }, 2000);
                } else {
                    showFormResponseMessage(feedbackForm, 'Submission failed. Please check your connection and try again.', 'error');
                    submitButton.disabled = false; // Re-enable on error
                    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
                }
            }, 1500);
        });
    }

    /** Resets the feedback form fields and state */
    function resetFeedbackForm() {
        if (feedbackForm) {
            feedbackForm.reset(); // Resets all form fields to default
            clearFormErrors(feedbackForm);
            hideFormResponseMessage(feedbackForm);
            if (permissionGroup) permissionGroup.style.display = 'none'; // Hide permission checkbox
            const submitButton = feedbackForm.querySelector('button[type="submit"]');
             if (submitButton) {
                 submitButton.disabled = false;
                 submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
             }
        }
    }

    // --- Update Copyright Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    console.log("Rofilid Personal Page Scripts Fully Loaded and Ready.");

}); // End DOMContentLoaded
