/**
 * File Location: /assets/js/personal/personal.js
 * Description: Scripts EXCLUSIVELY for the ROFILID Personal Finance page (personal.html - v2.2.0).
 *              Handles navigation specific to this page, modals (quiz & feedback),
 *              forms, animations, and template interactions. Assumes global main.js
 *              handles only absolutely universal features (like core nav toggle IF header is universal).
 * Dependencies: Font Awesome (for icons)
 */

// Wrap in an IIFE to create a local scope and avoid polluting the global namespace
(function() {
    'use strict'; // Enable strict mode

    // --- Polyfills (Optional, if supporting older browsers) ---
    // Example: Element.closest polyfill
    if (!Element.prototype.matches) { Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector; }
    if (!Element.prototype.closest) {
        Element.prototype.closest = function(s) {
            var el = this;
            do { if (el.matches(s)) return el; el = el.parentElement || el.parentNode; } while (el !== null && el.nodeType === 1);
            return null;
        };
    }

    // --- Initial Check & DOM Ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePersonalPage);
    } else {
        initializePersonalPage(); // DOMContentLoaded has already fired
    }

    // --- Main Initialization Function ---
    function initializePersonalPage() {
        console.log("Rofilid Personal Page Scripts Initializing (v2.2.0 - Isolated).");

        // --- Feature Flags / Configuration ---
        const ENABLE_SECTION_FADE_IN = true;
        const ENABLE_STATS_ANIMATION = true; // Set to false to disable stats counter/animation

        // --- Global Variables & Elements (Scoped) ---
        const page = document.querySelector('.personal-page'); // Root element for checks
        if (!page) return; // Exit if not on the personal page

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

        let activeModal = null;
        let quizTriggerElement = null;
        let feedbackTriggerElement = null;

        // --- Helper Functions (Scoped) ---
        function openModal(modalElement, triggerElement = null) {
            if (!modalElement) return;
            if (activeModal) closeModal();

            modalElement.style.display = 'flex';
            body.style.overflow = 'hidden';
            activeModal = modalElement;

            if (triggerElement) {
                if (modalElement === quizModal) quizTriggerElement = triggerElement;
                if (modalElement === feedbackModal) feedbackTriggerElement = triggerElement;
            }

            const focusTarget = modalElement.querySelector('.modal-close-btn') || modalElement.querySelector('.modal-content');
            setTimeout(() => { if (focusTarget) focusTarget.focus(); }, 350);
        }

        function closeModal() {
            if (!activeModal) return;
            const modalToClose = activeModal; activeModal = null;
            let triggerElementToFocus = null;
            if (modalToClose === quizModal) triggerElementToFocus = quizTriggerElement;
            if (modalToClose === feedbackModal) triggerElementToFocus = feedbackTriggerElement;

            modalToClose.style.display = 'none';
            body.style.overflow = '';

            if (modalToClose === feedbackModal) resetFeedbackForm();

            if (triggerElementToFocus) {
                try { triggerElementToFocus.focus(); } catch (e) { console.warn("Could not focus trigger element:", e); }
                if (modalToClose === quizModal) quizTriggerElement = null;
                if (modalToClose === feedbackModal) feedbackTriggerElement = null;
            }
        }

        function showFormResponseMessage(formElement, message, type) {
            const responseEl = formElement?.querySelector('.form-response-note');
            if (!responseEl) return;
            responseEl.textContent = message;
            responseEl.className = `form-response-note ${type}`;
            responseEl.style.display = 'block';
            responseEl.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
        }

        function hideFormResponseMessage(formElement) {
            const responseEl = formElement?.querySelector('.form-response-note');
            if (responseEl) responseEl.style.display = 'none';
        }

        function clearFormErrors(formElement) {
            formElement?.querySelectorAll('.form-error-msg').forEach(msg => { msg.textContent = ''; });
            formElement?.querySelectorAll('.is-invalid').forEach(input => { input.classList.remove('is-invalid'); });
        }

        function showInputError(inputElement, message) {
            if (!inputElement) return;
            inputElement.classList.add('is-invalid');
            const errorMsgElement = inputElement.closest('.form-group')?.querySelector('.form-error-msg');
            if (errorMsgElement) { errorMsgElement.textContent = message; }
        }

        // --- Navigation Logic (Self-contained for Personal Page) ---

        // Mobile Menu Toggle (Only if main.js doesn't handle it)
        // Assuming main.js handles the basic toggle, we might only need specific interactions here.
        // If main.js *doesn't* handle it, uncomment and adapt this:
        /*
        if (mobileMenuToggle && primaryNavigation) {
            mobileMenuToggle.addEventListener('click', () => {
                const isExpanded = primaryNavigation.classList.toggle('active');
                mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
                body.style.overflow = isExpanded ? 'hidden' : '';
                // Toggle icons (ensure CSS handles visibility based on aria-expanded)
            });
        }
        */

        // Smooth Scrolling within Personal Page & Close Mobile Nav
        const internalLinks = document.querySelectorAll(
            '#primary-navigation a[href^="#"], a.connect-button[href^="#"], a.hero-actions a[href^="#"], #learning-hub a[href^="#"], #free-resources a[href^="#"], #free-tools a[href^="#"], #personal-coaching a[href^="#"], #mmisbalior-section a[href^="#"], #feedback-section a[href^="#"]'
        );

        internalLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                // Ensure it's a valid anchor on *this* page
                if (href && href.startsWith('#') && href.length > 1) {
                    try {
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

                            // Close mobile nav if open and toggle exists
                            if (primaryNavigation?.classList.contains('active') && mobileMenuToggle) {
                                primaryNavigation.classList.remove('active');
                                mobileMenuToggle.setAttribute('aria-expanded', 'false');
                                body.style.overflow = '';
                            }
                        } else {
                            console.warn(`Smooth scroll target element "${href}" not found.`);
                        }
                    } catch (error) {
                        console.error(`Error finding or scrolling to "${href}":`, error);
                    }
                }
            });
        });

        // Global Listeners (Scoped to this page's logic)
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && activeModal) closeModal(); });
        window.addEventListener('click', (e) => { if (e.target.classList.contains('modal-overlay') && activeModal) closeModal(); });


        // --- Animations & Interactions ---

        // Stats Counter Logic (Optimized)
        if (ENABLE_STATS_ANIMATION) {
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const statCard = entry.target;
                        const displayEl = statCard.querySelector('h4'); // Could target a dedicated span instead

                        if (displayEl && !displayEl.classList.contains('counted')) {
                            displayEl.classList.add('counted'); // Mark immediately
                             // Add a subtle visual effect on count completion
                            statCard.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
                            statCard.style.opacity = '1';
                            statCard.style.transform = 'translateY(0)';
                        }
                        observer.unobserve(statCard); // Unobserve once handled
                    }
                });
            }, { threshold: 0.5 }); // Trigger when 50% visible

            document.querySelectorAll('.hero-stats-grid .stat-card').forEach(card => {
                // Initial state for animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                statsObserver.observe(card);
            });
        }

        // General Smooth Fade-in for Sections (Optimized)
        if (ENABLE_SECTION_FADE_IN) {
            const fadeObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = 1;
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }); // Adjust threshold/margin

            // Select sections more specifically if needed
            document.querySelectorAll('#main-content > section:not(#hero)').forEach(section => {
                section.style.opacity = 0;
                section.style.transform = 'translateY(30px)'; // Start slightly lower
                section.style.transition = 'opacity 0.8s cubic-bezier(0.645, 0.045, 0.355, 1), transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)'; // Smoother ease
                section.style.willChange = 'opacity, transform'; // Optimize animation
                fadeObserver.observe(section);
            });
        }

        // --- INTRO Quiz Logic (Categories 1-4) ---
        const introQuizQuestions = [ /* Keep the same 20 questions here */
            { id: 1, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "What is the first essential step when starting to create a budget?", options: ["Calculate total monthly income", "List all fixed expenses", "Set long-term financial goals", "Track spending habits for a month"], correctAnswerIndex: 0, explanation: "Knowing your total income is fundamental; it's the basis upon which all budget allocations are planned." },
            { id: 2, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "You earn ₦150,000 per month after tax and manage to save ₦22,500. What is your savings rate?", options: ["10%", "15%", "20%", "22.5%"], correctAnswerIndex: 1, explanation: "Savings Rate = (Amount Saved / Total Income) × 100. So, (₦22,500 / ₦150,000) × 100 = 15%." },
            { id: 3, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "What does 'Pay Yourself First' mean?", options: ["Spend on wants before needs", "Allocate income to savings/investments *before* other spending", "Pay off all debts before saving", "Treat yourself each payday"], correctAnswerIndex: 1, explanation: "'Pay Yourself First' prioritizes saving by treating it like a mandatory bill, ensuring progress towards goals." },
            { id: 4, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "How is personal Net Worth calculated?", options: ["Annual Income - Annual Expenses", "Total Assets (what you own) - Total Liabilities (what you owe)", "Total Savings + Total Investments", "Monthly Income x 12"], correctAnswerIndex: 1, explanation: "Net worth is a snapshot of your financial position: Assets minus Liabilities." },
            { id: 5, categoryId: 1, themeId: 1, category: "Income & Vitals Check", question: "₦50,000 in a savings account earns 4% simple annual interest. How much interest after one year?", options: ["₦400", "₦5,000", "₦2,000", "₦200"], correctAnswerIndex: 2, explanation: "Simple interest = Principal × Rate × Time. ₦50,000 × 0.04 × 1 = ₦2,000." },
            { id: 6, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "Why save regularly, even small amounts?", options: ["To impress others", "To build funds for emergencies, goals & investments", "Banks guarantee high returns", "Only to avoid spending now"], correctAnswerIndex: 1, explanation: "Consistent saving builds security (emergency fund) and accumulates funds for future goals and wealth building." },
            { id: 7, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "Benefit of starting to save early?", options: ["Retire sooner automatically", "Maximize compound interest over time", "Avoid future taxes", "Interest rates are higher for young savers"], correctAnswerIndex: 1, explanation: "Starting early gives compound interest more time to work its magic, leading to significantly larger sums long-term." },
            { id: 8, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "Most crucial factor when choosing a savings account?", options: ["Bank's logo color", "Interest rate (APY) and fees", "Number of branches", "If friends use the same bank"], correctAnswerIndex: 1, explanation: "Interest rate determines growth, fees can reduce your balance. These are key financial factors." },
            { id: 9, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "Best place for an emergency fund?", options: ["Stock market for growth", "Easily accessible high-yield savings or money market account", "Under the mattress", "Long-term fixed deposit"], correctAnswerIndex: 1, explanation: "Emergency funds need safety and accessibility, ideally earning some interest, like in a high-yield savings account." },
            { id: 10, categoryId: 2, themeId: 1, category: "Savings Smarts", question: "What is simple interest?", options: ["Interest only on the initial principal", "Interest on principal + accumulated interest", "A fee to open an account", "Interest that decreases"], correctAnswerIndex: 0, explanation: "Simple interest is calculated *only* on the original principal amount for the entire period." },
            { id: 11, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "Primary purpose of a budget?", options: ["Track past spending", "Plan future spending and saving", "Restrict all 'fun' spending", "Calculate taxes"], correctAnswerIndex: 1, explanation: "A budget is a forward-looking financial plan to allocate income towards expenses, savings, and goals." },
            { id: 12, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "Fixed vs. Variable expenses?", options: ["Fixed change monthly, variable don't", "Fixed stay mostly the same (rent), variable change (groceries)", "Both change", "Both stay the same"], correctAnswerIndex: 1, explanation: "Fixed expenses (rent, loan payments) are consistent; variable expenses (food, fuel) fluctuate." },
            { id: 13, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "Difference between 'need' and 'want'?", options: ["Needs bought often, wants rarely", "Needs are essential (food, shelter), wants improve comfort/enjoyment", "Needs cost more", "Wants are what friends have"], correctAnswerIndex: 1, explanation: "Needs are essential for survival/well-being; wants are non-essential desires. This helps prioritize spending." },
            { id: 14, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "What is the 50/30/20 rule?", options: ["50% Needs, 30% Wants, 20% Savings/Debt", "50% Savings, 30% Needs, 20% Wants", "50% Wants, 30% Needs, 20% Savings", "50% Debt, 30% Savings, 20% Expenses"], correctAnswerIndex: 0, explanation: "The 50/30/20 rule suggests allocating 50% of after-tax income to Needs, 30% to Wants, and 20% to Savings/Debt Repayment." },
            { id: 15, categoryId: 3, themeId: 1, category: "Budgeting Building Blocks", question: "What is a sinking fund used for?", options: ["Main emergency fund", "Saving regularly for a specific, planned future expense", "High-risk investments", "Only for paying debt"], correctAnswerIndex: 1, explanation: "A sinking fund saves gradually for a known upcoming expense (e.g., car repair, vacation) to avoid borrowing later." },
            { id: 16, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Practical first step to track expenses accurately?", options: ["Ignore small cash spending", "Keep receipts & note *all* spending", "Only track card payments", "Guess monthly totals"], correctAnswerIndex: 1, explanation: "Tracking every expense gives a complete picture, crucial for effective budgeting and finding savings." },
            { id: 17, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Why track expenses regularly?", options: ["To know how much you can borrow", "To see where money goes & find potential savings", "To share habits with friends", "To simplify tax calculation"], correctAnswerIndex: 1, explanation: "Regular tracking reveals patterns, helps stick to a budget, and identifies non-essential spending to redirect." },
            { id: 18, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Which tool is useful in cash-heavy environments?", options: ["Complex financial software", "The envelope system (allocating cash)", "Volatile asset investing", "Mental calculations only"], correctAnswerIndex: 1, explanation: "The envelope system physically allocates cash for different categories, helping control cash spending." },
            { id: 19, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Your entertainment budget is ₦10,000. You spent ₦8,500. What % remains?", options: ["5%", "10%", "15%", "85%"], correctAnswerIndex: 2, explanation: "Remaining = ₦10k - ₦8.5k = ₦1.5k. % Remaining = (₦1.5k / ₦10k) * 100 = 15%." },
            { id: 20, categoryId: 4, themeId: 1, category: "Spending Awareness", question: "Item costs ₦25,000, but has a 20% discount. What's the final price?", options: ["₦5,000", "₦20,000", "₦24,000", "₦30,000"], correctAnswerIndex: 1, explanation: "Discount = ₦25k * 0.20 = ₦5k. Final Price = ₦25k - ₦5k = ₦20,000." }
        ];
        const LAST_INTRO_CATEGORY_ID = 4;
        let currentQuizData = { questions: [], currentQuestionIndex: 0, score: 0 }; // Renamed variable

        // Cached DOM References (Scoped to Quiz Logic)
        const qModalTitle = document.getElementById('quiz-modal-title');
        const qModalCloseBtn = document.getElementById('quiz-modal-close');
        const qModalQuestionEl = document.getElementById('quiz-modal-question');
        const qModalOptionsEl = document.getElementById('quiz-modal-options');
        const qModalFeedbackEl = document.getElementById('quiz-modal-feedback');
        const qModalNextBtn = document.getElementById('quiz-modal-next');
        const qModalResultsEl = document.getElementById('quiz-modal-results');
        const qModalProgressCurrent = document.getElementById('quiz-modal-q-current');
        const qModalProgressTotal = document.getElementById('quiz-modal-q-total');
        const qModalNextQuizBtn = document.getElementById('quiz-modal-next-quiz');
        const qModalRestartBtn = document.getElementById('quiz-modal-restart');
        const qModalCloseResultsBtn = document.getElementById('quiz-modal-close-results');
        const qModalFullChallengePrompt = document.getElementById('quiz-modal-full-challenge-prompt');

        // Quiz Functions (Scoped)
        function startIntroQuiz(categoryId) {
            console.log(`Starting INTRO quiz check for category ID: ${categoryId}`);
            const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);
            if (categoryQuestions.length === 0) {
                console.error("No INTRO questions found for category ID:", categoryId);
                alert("Sorry, questions for this check could not be loaded."); return;
            }
            currentQuizData = { questions: categoryQuestions, currentQuestionIndex: 0, score: 0 };
            setupIntroQuizUI();
            displayIntroModalQuestion();
            openModal(quizModal, quizTriggerElement);
        }

        function setupIntroQuizUI() {
            if (qModalTitle) qModalTitle.textContent = currentQuizData.questions[0]?.category || 'Financial Concept Check';
            if (qModalResultsEl) qModalResultsEl.style.display = 'none';
            if (qModalFeedbackEl) qModalFeedbackEl.style.display = 'none';
            if (qModalQuestionEl) qModalQuestionEl.style.display = 'block';
            if (qModalOptionsEl) qModalOptionsEl.style.display = 'flex';
            const progressEl = qModalProgressCurrent?.closest('.quiz-modal-progress');
            if (progressEl) progressEl.style.display = 'block';
            if (qModalProgressTotal) qModalProgressTotal.textContent = currentQuizData.questions.length;
            [qModalNextBtn, qModalNextQuizBtn, qModalRestartBtn, qModalCloseResultsBtn, qModalFullChallengePrompt].forEach(btn => { if (btn) btn.style.display = 'none'; });
        }

        function displayIntroModalQuestion() {
            const quiz = currentQuizData;
            if (!qModalQuestionEl || !qModalOptionsEl || !qModalProgressCurrent || quiz.currentQuestionIndex >= quiz.questions.length) {
                if (quiz.currentQuestionIndex >= quiz.questions.length) showIntroModalResults(); return;
            }
            const q = quiz.questions[quiz.currentQuestionIndex];
            qModalQuestionEl.innerHTML = `<span class="question-number">${quiz.currentQuestionIndex + 1}.</span> ${q.question}`;
            qModalOptionsEl.innerHTML = '';
            if (qModalFeedbackEl) qModalFeedbackEl.style.display = 'none';
            if (qModalNextBtn) qModalNextBtn.style.display = 'none';
            qModalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;
            q.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.textContent = option; button.className = 'option-button btn';
                button.setAttribute('data-index', index);
                button.onclick = () => handleIntroModalOptionSelection(index);
                qModalOptionsEl.appendChild(button);
            });
            const firstOption = qModalOptionsEl.querySelector('button'); if (firstOption) firstOption.focus();
        }

        function handleIntroModalOptionSelection(selectedIndex) {
            const quiz = currentQuizData; const q = quiz.questions[quiz.currentQuestionIndex];
            const buttons = qModalOptionsEl?.querySelectorAll('button'); if (!buttons) return;
            buttons.forEach(button => button.disabled = true);
            showIntroModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
        }

        function showIntroModalFeedback(selectedIndex, correctIndex, explanation) {
            const quiz = currentQuizData; const isCorrect = selectedIndex === correctIndex; if (isCorrect) quiz.score++;
            const buttons = qModalOptionsEl?.querySelectorAll('button'); if (!buttons || !qModalFeedbackEl) return;
            buttons.forEach((button, index) => {
                button.classList.remove('btn-outline');
                if (index === correctIndex) button.classList.add('correct');
                else if (index === selectedIndex) button.classList.add('incorrect');
                else button.classList.add('disabled');
            });
            qModalFeedbackEl.innerHTML = `<p><strong>${isCorrect ? 'Correct!' : 'Insight:'}</strong> ${explanation || ''}</p>`;
            qModalFeedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
            qModalFeedbackEl.style.display = 'block';
            if (qModalNextBtn) {
                if (quiz.currentQuestionIndex < quiz.questions.length - 1) { qModalNextBtn.style.display = 'inline-block'; qModalNextBtn.focus(); }
                else { qModalNextBtn.style.display = 'none'; setTimeout(showIntroModalResults, 1000); }
            }
        }

        function nextIntroModalQuestion() {
            if (qModalFeedbackEl) qModalFeedbackEl.style.display = 'none';
            if (qModalNextBtn) qModalNextBtn.style.display = 'none';
            currentQuizData.currentQuestionIndex++; displayIntroModalQuestion();
        }

        function showIntroModalResults() {
            const quiz = currentQuizData; const finishedCategoryId = quiz.questions[0]?.categoryId;
            [qModalQuestionEl, qModalOptionsEl, qModalFeedbackEl, qModalNextBtn].forEach(el => { if (el) el.style.display = 'none'; });
            const progressEl = qModalProgressCurrent?.closest('.quiz-modal-progress'); if (progressEl) progressEl.style.display = 'none';
            if (qModalResultsEl) {
                const score = quiz.score; const total = quiz.questions.length; const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
                let feedbackMessage = 'Every step in learning counts!';
                if (percentage === 100) feedbackMessage = 'Excellent understanding!'; else if (percentage >= 75) feedbackMessage = 'Great job!'; else if (percentage >= 50) feedbackMessage = 'Good grasp of the basics!';
                qModalResultsEl.innerHTML = `<h4>Check Complete!</h4><p>You answered ${score} out of ${total} correctly.</p><p class="quiz-score-percentage">(${percentage}%)</p><p class="quiz-result-message">${feedbackMessage}</p>`;
                qModalResultsEl.style.display = 'block';
            }
            if (qModalNextQuizBtn) qModalNextQuizBtn.style.display = 'none';
            if (qModalFullChallengePrompt) qModalFullChallengePrompt.style.display = 'none';
            if (finishedCategoryId && finishedCategoryId < LAST_INTRO_CATEGORY_ID) {
                const nextCategoryId = finishedCategoryId + 1;
                if (qModalNextQuizBtn) { qModalNextQuizBtn.style.display = 'inline-block'; qModalNextQuizBtn.setAttribute('data-next-category-id', nextCategoryId); }
            } else if (finishedCategoryId && finishedCategoryId === LAST_INTRO_CATEGORY_ID) {
                if (qModalFullChallengePrompt) qModalFullChallengePrompt.style.display = 'block';
            }
            if (qModalRestartBtn) qModalRestartBtn.style.display = 'inline-block';
            if (qModalCloseResultsBtn) qModalCloseResultsBtn.style.display = 'inline-block';
            const firstVisibleButton = qModalNextQuizBtn?.style.display !== 'none' ? qModalNextQuizBtn : qModalRestartBtn?.style.display !== 'none' ? qModalRestartBtn : qModalCloseResultsBtn;
            if (firstVisibleButton) firstVisibleButton.focus();
        }

        function restartIntroModalQuiz() {
            const categoryId = currentQuizData.questions[0]?.categoryId;
            if (categoryId) {
                if (qModalResultsEl) qModalResultsEl.style.display = 'none';
                [qModalNextQuizBtn, qModalRestartBtn, qModalCloseResultsBtn, qModalFullChallengePrompt].forEach(btn => { if (btn) btn.style.display = 'none'; });
                startIntroQuiz(categoryId);
            } else { closeModal(); }
        }

        function handleIntroNextQuizClick(event) {
            const nextCategoryId = parseInt(event.target.dataset.nextCategoryId, 10);
            if (!isNaN(nextCategoryId)) {
                if (qModalResultsEl) qModalResultsEl.style.display = 'none';
                [qModalNextQuizBtn, qModalRestartBtn, qModalCloseResultsBtn, qModalFullChallengePrompt].forEach(btn => { if (btn) btn.style.display = 'none'; });
                const nextTrigger = document.querySelector(`.category-card[data-category-id="${nextCategoryId}"] .start-quiz-btn`);
                quizTriggerElement = nextTrigger; startIntroQuiz(nextCategoryId);
            } else { console.error("Could not determine next category ID."); }
        }

        // Attach Event Listeners for INTRO Quiz Buttons
        document.querySelectorAll('#learning-hub .start-quiz-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.category-card');
                const categoryId = card ? parseInt(card.dataset.categoryId, 10) : null;
                if (categoryId && categoryId >= 1 && categoryId <= LAST_INTRO_CATEGORY_ID) {
                    quizTriggerElement = e.target; startIntroQuiz(categoryId);
                } else { console.error("Missing or invalid category ID on card:", card); alert("Could not start this check."); }
            });
        });

        // Attach Quiz Modal Button Listeners (Intro Version)
        if (qModalCloseBtn) qModalCloseBtn.addEventListener('click', () => closeModal());
        if (qModalCloseResultsBtn) qModalCloseResultsBtn.addEventListener('click', () => closeModal());
        if (qModalNextBtn) qModalNextBtn.addEventListener('click', nextIntroModalQuestion);
        if (qModalRestartBtn) qModalRestartBtn.addEventListener('click', restartIntroModalQuiz);
        if (qModalNextQuizBtn) qModalNextQuizBtn.addEventListener('click', handleIntroNextQuizClick);
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
                const pdfFiles = {
                    'Line-Item Budget': '../../assets/downloads/line-item-budget.pdf',
                    'Net Worth Statement': '../../assets/downloads/net-worth-statement.pdf',
                    'Personal Cashflow Statement': '../../assets/downloads/personal-cashflow.pdf',
                    '50/30/20 Budget Guide': '../../assets/downloads/50-30-20-budget.pdf',
                    'Simple Expense Tracker': '../../assets/downloads/expense-tracker.pdf'
                };
                const pdfUrl = pdfFiles[templateName] || '#';
                if (pdfUrl && pdfUrl !== '#') {
                    console.log(`PDF Download initiated for: ${templateName} from ${pdfUrl}`);
                    const link = document.createElement('a'); link.href = pdfUrl;
                    link.download = templateName.replace(/ /g, '-') + '.pdf'; document.body.appendChild(link);
                    link.click(); document.body.removeChild(link);
                } else {
                    alert(`Downloading ${templateName} PDF (Free)... \n(File path not yet configured.)`);
                    console.warn(`PDF Download failed: Path not set for ${templateName}`);
                }
            });
        });

        // --- Coaching Interest Form Logic ---
        if (coachingInterestForm) {
            coachingInterestForm.addEventListener('submit', (e) => {
                e.preventDefault(); clearFormErrors(coachingInterestForm); hideFormResponseMessage(coachingInterestForm);
                const emailInput = coachingInterestForm.querySelector('#interest-email');
                const submitButton = coachingInterestForm.querySelector('button[type="submit"]');
                let isValid = true;
                if (!emailInput.value.trim()) { showInputError(emailInput, 'Email address is required.'); isValid = false; }
                else if (!/\S+@\S+\.\S+/.test(emailInput.value)) { showInputError(emailInput, 'Please enter a valid email address.'); isValid = false; }
                if (!isValid) { coachingInterestForm.querySelector('.is-invalid')?.focus(); return; }
                submitButton.disabled = true; submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                console.log("Coaching interest submitted for:", emailInput.value);
                setTimeout(() => { // Simulate backend
                    const isSuccess = Math.random() > 0.1;
                    if (isSuccess) {
                        showFormResponseMessage(coachingInterestForm, 'Thank you! We\'ve received your interest and will notify you.', 'success');
                        emailInput.value = ''; submitButton.innerHTML = '<i class="fas fa-check"></i> Submitted!';
                    } else {
                        showFormResponseMessage(coachingInterestForm, 'Submission failed. Please check connection and try again.', 'error');
                        submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Notify Me';
                    }
                }, 1500);
            });
        }

        // --- Feedback / Testimonial Modal & Form Logic ---
        const feedbackModalCloseBtn = document.getElementById('feedback-modal-close');
        const feedbackTypeSelect = document.getElementById('feedback-type');
        const permissionGroup = feedbackForm?.querySelector('.permission-group');

        if (openFeedbackBtn && feedbackModal) { openFeedbackBtn.addEventListener('click', (e) => { feedbackTriggerElement = e.target; openModal(feedbackModal, feedbackTriggerElement); }); }
        if (feedbackModalCloseBtn) { feedbackModalCloseBtn.addEventListener('click', () => closeModal()); }
        if (feedbackTypeSelect && permissionGroup) {
            feedbackTypeSelect.addEventListener('change', () => {
                permissionGroup.style.display = feedbackTypeSelect.value === 'testimonial' ? 'flex' : 'none';
                if (feedbackTypeSelect.value !== 'testimonial') permissionGroup.querySelector('#feedback-permission').checked = false;
            });
        }
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault(); clearFormErrors(feedbackForm); hideFormResponseMessage(feedbackForm);
                const nameInput = feedbackForm.querySelector('#feedback-name');
                const emailInput = feedbackForm.querySelector('#feedback-email');
                const typeInput = feedbackForm.querySelector('#feedback-type');
                const messageInput = feedbackForm.querySelector('#feedback-message');
                const permissionInput = feedbackForm.querySelector('#feedback-permission');
                const submitButton = feedbackForm.querySelector('button[type="submit"]');
                let isValid = true;
                if (!typeInput.value) { showInputError(typeInput, 'Please select a feedback type.'); isValid = false; }
                if (!messageInput.value.trim()) { showInputError(messageInput, 'Please enter your message.'); isValid = false; }
                else if (messageInput.value.trim().length < 10) { showInputError(messageInput, 'Message should be at least 10 characters.'); isValid = false; }
                if (emailInput.value.trim() && !/\S+@\S+\.\S+/.test(emailInput.value)) { showInputError(emailInput, 'Enter a valid email or leave blank.'); isValid = false; }
                if (!isValid) { feedbackForm.querySelector('.is-invalid')?.focus(); return; }
                const formData = { name: nameInput.value.trim(), email: emailInput.value.trim(), type: typeInput.value, message: messageInput.value.trim(), permissionGranted: typeInput.value === 'testimonial' ? permissionInput.checked : null };
                submitButton.disabled = true; submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
                console.log("Feedback/Testimonial Data:", formData);
                setTimeout(() => { // Simulate backend
                    const isSuccess = Math.random() > 0.1;
                    if (isSuccess) {
                        showFormResponseMessage(feedbackForm, 'Thank you! Your feedback submitted successfully.', 'success');
                        setTimeout(() => { closeModal(); }, 2000); // Close after delay
                    } else {
                        showFormResponseMessage(feedbackForm, 'Submission failed. Please try again.', 'error');
                        submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback';
                    }
                }, 1500);
            });
        }

        /** Resets the feedback form fields and state */
        function resetFeedbackForm() {
            if (feedbackForm) {
                feedbackForm.reset(); clearFormErrors(feedbackForm); hideFormResponseMessage(feedbackForm);
                if (permissionGroup) permissionGroup.style.display = 'none';
                const submitButton = feedbackForm.querySelector('button[type="submit"]');
                if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Feedback'; }
            }
        }

        // --- Final Initialization Steps ---
        console.log("Rofilid Personal Page Scripts Fully Loaded and Ready.");
    } // End initializePersonalPage

})(); // End IIFE
