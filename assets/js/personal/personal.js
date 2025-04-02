document.addEventListener('DOMContentLoaded', () => {

    // --- START Personal Page Specific Components ---

    // Stats Counter Logic (No changes needed from v1.2.0)
    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statCard = entry.target;
                const targetSpan = statCard.querySelector('.stat-target');
                const displayEl = statCard.querySelector('h4');
                if (!targetSpan || !displayEl) { observer.unobserve(statCard); return; }
                const suffix = (displayEl.textContent.includes('%') ? '%' : '') || (displayEl.textContent.includes('+') ? '+' : '');
                if (displayEl.classList.contains('counted')) { observer.unobserve(statCard); return; }
                const target = parseInt(targetSpan.textContent, 10);
                if (isNaN(target)) { observer.unobserve(statCard); return; }
                displayEl.textContent = `0${suffix}`; displayEl.classList.add('counting');
                let currentCount = 0; const duration = 1500; const stepTime = 20; const steps = duration / stepTime; const increment = target / steps;
                const counter = () => {
                    currentCount += increment;
                    if (currentCount < target) {
                        displayEl.textContent = Math.ceil(currentCount).toLocaleString() + suffix;
                        setTimeout(counter, stepTime);
                    } else {
                        displayEl.textContent = target.toLocaleString() + suffix;
                        displayEl.classList.add('counted'); displayEl.classList.remove('counting');
                    }
                };
                setTimeout(counter, stepTime); observer.unobserve(statCard);
            }
        });
    }, { threshold: 0.4 });
    document.querySelectorAll('.stat-card').forEach(card => { statObserver.observe(card); });

    // --- END Personal Page Specific Components ---


    // --- START INTRO Quiz Logic (Theme 1 Only) ---
    // (Keep existing quiz questions - all 20)
     const allQuestions_Theme1 = [
        // ... (All 20 questions from previous versions) ...
         // Cat 1: Income & Financial Vitals
         { id: 1, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "What is the first essential step when starting to create a budget?", options: ["Calculate total monthly income", "List all fixed expenses", "Set long-term financial goals", "Track spending habits for a month"], correctAnswerIndex: 0, explanation: "Knowing your total income is fundamental; it's the basis upon which all budget allocations for expenses, savings, and goals are planned." },
         { id: 2, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "You earn ₦150,000 per month after tax and manage to save ₦22,500. What is your savings rate as a percentage of your income?", options: ["10%", "15%", "20%", "22.5%"], correctAnswerIndex: 1, explanation: "Savings Rate = (Amount Saved / Total Income) × 100. So, (₦22,500 / ₦150,000) × 100 = 15%." },
         { id: 3, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "What does 'Pay Yourself First' mean in personal finance?", options: ["Spend money on wants before needs", "Allocate a portion of your income to savings/investments before paying bills or discretionary spending", "Pay off all debts before saving anything", "Treat yourself to luxury items each payday"], correctAnswerIndex: 1, explanation: "'Pay Yourself First' prioritizes saving and investing by treating it as a mandatory expense, ensuring goals are worked towards before money is spent elsewhere." },
         { id: 4, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "How is personal Net Worth typically calculated?", options: ["Total Annual Income - Total Annual Expenses", "Total Value of Assets (what you own) - Total Value of Liabilities (what you owe)", "Total Savings + Total Investments", "Monthly Income x 12"], correctAnswerIndex: 1, explanation: "Net worth is a snapshot of your financial position, calculated by subtracting your total debts (liabilities) from the total value of your possessions (assets)." },
         { id: 5, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "If you deposit ₦50,000 into a savings account offering 4% simple annual interest, how much interest will you earn after one year?", options: ["₦400", "₦5,000", "₦2,000", "₦200"], correctAnswerIndex: 2, explanation: "Simple interest is calculated as Principal × Rate × Time. So, ₦50,000 × 0.04 × 1 year = ₦2,000." },
         // Cat 2: Savings Essentials
         { id: 6, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Why is it important to save money regularly, even small amounts?", options: ["To show others financial responsibility", "To build funds for emergencies, goals, and investments", "Because banks offer guaranteed high returns", "Solely to avoid spending immediately"], correctAnswerIndex: 1, explanation: "Consistent saving builds financial security by creating an emergency cushion and accumulating funds needed for future goals and wealth-building investments." },
         { id: 7, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "What is the benefit of starting to save early in life?", options: ["To retire sooner automatically", "To take full advantage of compound interest over a longer period", "To avoid future taxes on savings", "Because interest rates are higher for younger savers"], correctAnswerIndex: 1, explanation: "Starting early allows saved money and its earnings more time to grow through the power of compound interest, leading to significantly larger sums over the long term." },
         { id: 8, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Which factor is most crucial when choosing a savings account?", options: ["The bank's branch color scheme", "The interest rate (APY) and any associated fees", "How many branches the bank has", "Whether friends use the same bank"], correctAnswerIndex: 1, explanation: "The interest rate determines how much your savings will grow, and fees can erode your balance, making these the most critical financial factors to consider." },
         { id: 9, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Where is the best place to keep your emergency fund?", options: ["Invested in the stock market for high growth", "In a high-yield savings account or money market account", "Under your mattress at home", "In a long-term fixed deposit that locks funds away"], correctAnswerIndex: 1, explanation: "An emergency fund should be kept in a safe, easily accessible place that ideally earns some interest but is protected from market risk, like a high-yield savings account." },
         { id: 10, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "What is simple interest?", options: ["Interest calculated only on the initial principal amount", "Interest calculated on the principal plus any accumulated interest", "A fee charged for opening a bank account", "Interest that decreases over time"], correctAnswerIndex: 0, explanation: "Simple interest is a fixed percentage of the original amount borrowed or saved, calculated only on the principal for the entire duration." },
         // Cat 3: Budgeting Basics
         { id: 11, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is the primary purpose of a budget?", options: ["To track past spending", "To plan future spending and saving", "To restrict all 'fun' spending", "To calculate taxes"], correctAnswerIndex: 1, explanation: "A budget is a financial plan that helps you allocate your income towards expenses, savings, and investments to achieve your financial goals." },
         { id: 12, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is the difference between fixed and variable expenses?", options: ["Fixed expenses change every month, variable stay the same", "Fixed expenses generally stay the same each month, variable expenses often change", "Both change every month", "Both stay the same"], correctAnswerIndex: 1, explanation: "Fixed expenses, such as rent or loan payments, remain relatively constant, while variable expenses, like groceries or fuel, can fluctuate based on consumption or price changes." },
         { id: 13, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "In budgeting, how do you typically differentiate between a 'need' and a 'want'?", options: ["Needs are bought frequently, wants are occasional", "Needs are essential for survival and well-being, wants are for comfort and enjoyment", "Needs are more expensive than wants", "Wants are things friends have, needs are what you currently possess"], correctAnswerIndex: 1, explanation: "Needs are fundamental requirements (food, shelter, basic utilities), while wants are desires that improve quality of life but aren't essential for survival. Understanding this helps prioritize spending." },
         { id: 14, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is the 50/30/20 rule in budgeting?", options: ["50% Needs, 30% Wants, 20% Savings/Debt Repayment", "50% Savings, 30% Needs, 20% Wants", "50% Wants, 30% Needs, 20% Savings", "50% Debt, 30% Savings, 20% Expenses"], correctAnswerIndex: 0, explanation: "The 50/30/20 rule is a guideline suggesting allocating 50% of after-tax income to needs, 30% to wants, and 20% towards savings or aggressive debt repayment." },
         { id: 15, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is a sinking fund primarily used for?", options: ["As a primary emergency fund", "To save regularly for a specific, planned future expense", "As a high-risk investment fund", "As a fund exclusively for paying off debt"], correctAnswerIndex: 1, explanation: "A sinking fund involves setting aside money regularly towards a known future expense (e.g., car replacement, vacation) to avoid borrowing or derailing regular savings when the expense occurs." },
         // Cat 4: Tracking & Managing Spending
         { id: 16, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "What is a practical first step in tracking your expenses accurately?", options: ["Ignoring small cash transactions", "Keeping receipts and noting all spending, no matter how small", "Only tracking card or bank transfer payments", "Guessing monthly spending totals"], correctAnswerIndex: 1, explanation: "Tracking every expense provides a complete and accurate picture of spending habits, which is crucial for effective budgeting and identifying areas to cut back." },
         { id: 17, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Why is it important to track your expenses regularly?", options: ["To know how much you can safely borrow", "To understand where your money is going and identify areas for potential savings", "To share spending habits with friends", "To make tax calculation simpler"], correctAnswerIndex: 1, explanation: "Regularly tracking expenses reveals spending patterns, helps stick to a budget, and identifies non-essential spending that could be redirected towards savings or goals." },
         { id: 18, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Which of the following is a budgeting tool or technique often useful in cash-heavy environments?", options: ["Complex financial modeling software", "The envelope system for allocating cash", "Investing heavily in volatile assets", "Relying solely on mental calculations"], correctAnswerIndex: 1, explanation: "The envelope system involves putting allocated cash amounts into labeled envelopes for different spending categories, helping control cash spending physically." },
         { id: 19, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Your monthly budget for entertainment is ₦10,000. You spent ₦8,500 this month. What percentage of your entertainment budget remains?", options: ["5%", "10%", "15%", "85%"], correctAnswerIndex: 2, explanation: "Amount Remaining = ₦10,000 - ₦8,500 = ₦1,500. Percentage Remaining = (₦1,500 / ₦10,000) × 100 = 15%." },
         { id: 20, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "An item costs ₦25,000, but it's currently offered at a 20% discount. How much will you actually pay?", options: ["₦5,000", "₦20,000", "₦24,000", "₦30,000"], correctAnswerIndex: 1, explanation: "Discount Amount = ₦25,000 × 0.20 = ₦5,000. Final Price = ₦25,000 - ₦5,000 = ₦20,000." }
    ];

    // Use the limited set of questions for this page's intro quiz logic
    const questionsForThisPage = allQuestions_Theme1;
    const LAST_INTRO_CATEGORY_ID = 4; // Define the last category ID for intro quizzes

    // Quiz State & DOM References
    let currentQuizData = { questions: [], currentQuestionIndex: 0, score: 0, userAnswers: {} };
    let quizTriggerElement = null; // To store the button that opened the modal

    const quizModal = document.getElementById('quiz-modal');
    const modalTitle = document.getElementById('quiz-modal-title');
    const modalCloseBtn = document.getElementById('quiz-modal-close');
    const modalQuestionEl = document.getElementById('quiz-modal-question');
    const modalOptionsEl = document.getElementById('quiz-modal-options');
    const modalFeedbackEl = document.getElementById('quiz-modal-feedback');
    const modalNextBtn = document.getElementById('quiz-modal-next'); // Button within quiz questions
    const modalResultsEl = document.getElementById('quiz-modal-results');
    const modalProgressCurrent = document.getElementById('quiz-modal-q-current');
    const modalProgressTotal = document.getElementById('quiz-modal-q-total');
    // NEW elements for results navigation
    const modalNextQuizBtn = document.getElementById('quiz-modal-next-quiz');
    const modalRestartBtn = document.getElementById('quiz-modal-restart');
    const modalCloseResultsBtn = document.getElementById('quiz-modal-close-results');
    const modalFullChallengePrompt = document.getElementById('quiz-modal-full-challenge-prompt');

    // Quiz Functions
    function startQuiz(categoryId) {
        console.log(`Starting quiz for category ID: ${categoryId} on Personal Page`);
        const categoryQuestions = questionsForThisPage.filter(q => q.categoryId === categoryId);

        if (categoryQuestions.length === 0) {
            console.error("No questions found for category ID:", categoryId);
            alert("Sorry, questions for this category could not be loaded.");
            return;
        }

        currentQuizData = { questions: categoryQuestions, currentQuestionIndex: 0, score: 0, userAnswers: {} };

        // Reset Modal UI elements for a new quiz
        if (modalTitle) modalTitle.textContent = categoryQuestions[0]?.category || 'Financial Fitness Quiz';
        if (modalResultsEl) modalResultsEl.style.display = 'none';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalQuestionEl) modalQuestionEl.style.display = 'block';
        if (modalOptionsEl) modalOptionsEl.style.display = 'flex';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'block';
        if (modalProgressTotal) modalProgressTotal.textContent = currentQuizData.questions.length;

        // Hide all results navigation buttons initially
        if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none';
        if (modalRestartBtn) modalRestartBtn.style.display = 'none';
        if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
        if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none'; // Hide question nav button too

        displayModalQuestion(); // Display the first question
        if (quizModal) quizModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function displayModalQuestion() {
        const quiz = currentQuizData;
        if (!modalQuestionEl || !modalOptionsEl || !modalProgressCurrent) return;

        // Check if quiz is finished (should be handled before calling this, but safe check)
        if (quiz.currentQuestionIndex >= quiz.questions.length) {
            showModalResults();
            return;
        }

        const q = quiz.questions[quiz.currentQuestionIndex];
        modalQuestionEl.textContent = q.question;
        modalOptionsEl.innerHTML = ''; // Clear previous options
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none'; // Hide feedback
        if (modalNextBtn) modalNextBtn.style.display = 'none'; // Hide 'Next Question' button until answer selected
        modalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;

        q.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-button';
            button.setAttribute('data-index', index);
            button.setAttribute('role', 'button');
            button.setAttribute('aria-pressed', 'false');
            button.onclick = () => handleModalOptionSelection(index);
            modalOptionsEl.appendChild(button);
        });

        // Focus first option on new question display
        const firstOption = modalOptionsEl.querySelector('button');
        if (firstOption) firstOption.focus();
    }

    function handleModalOptionSelection(selectedIndex) {
        const quiz = currentQuizData;
        const q = quiz.questions[quiz.currentQuestionIndex];
        const buttons = modalOptionsEl?.querySelectorAll('button');
        if (!buttons) return;

        buttons.forEach(button => {
            button.disabled = true; // Disable all options
            button.onclick = null; // Remove listener
            if (parseInt(button.getAttribute('data-index'), 10) === selectedIndex) {
                button.setAttribute('aria-pressed', 'true');
            }
        });
        quiz.userAnswers[q.id] = selectedIndex;
        showModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
    }

    function showModalFeedback(selectedIndex, correctIndex, explanation) {
        const quiz = currentQuizData;
        const isCorrect = selectedIndex === correctIndex;
        if (isCorrect) quiz.score++;

        const buttons = modalOptionsEl?.querySelectorAll('button');
        if (!buttons || !modalFeedbackEl) return;

        // Apply correct/incorrect classes
        buttons.forEach((button, index) => {
            button.classList.remove('selected');
            if (index === correctIndex) {
                button.classList.add('correct');
            } else if (index === selectedIndex) {
                button.classList.add('incorrect');
            } else {
                button.classList.add('disabled');
            }
        });

        // Show feedback text
        modalFeedbackEl.innerHTML = `<p><strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${explanation || ''}</p>`;
        modalFeedbackEl.className = `quiz-modal-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        modalFeedbackEl.style.display = 'block';
        modalFeedbackEl.setAttribute('role', 'alert');
        modalFeedbackEl.setAttribute('aria-live', 'assertive');

        // Show 'Next Question' button or trigger results
        if (modalNextBtn) {
            if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
                modalNextBtn.style.display = 'inline-block';
                modalNextBtn.focus(); // Focus the next button
            } else {
                modalNextBtn.style.display = 'none';
                // Finished last question, show final results after a delay
                setTimeout(showModalResults, 1200); // Delay before showing final score
            }
        }
    }

    function nextModalQuestion() {
        // Hide feedback and button
        if (modalFeedbackEl) {
            modalFeedbackEl.style.display = 'none';
            modalFeedbackEl.removeAttribute('role');
            modalFeedbackEl.removeAttribute('aria-live');
        }
        if (modalNextBtn) modalNextBtn.style.display = 'none';

        // Increment question index and display
        currentQuizData.currentQuestionIndex++;
        displayModalQuestion();
    }

    function showModalResults() {
        const quiz = currentQuizData;
        const finishedCategoryId = quiz.questions[0]?.categoryId; // Get ID of the quiz just finished

        // Hide question/options/feedback/question-nav
        if (modalQuestionEl) modalQuestionEl.style.display = 'none';
        if (modalOptionsEl) modalOptionsEl.style.display = 'none';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'none';

        // --- Display Score ---
        if (modalResultsEl) {
            const score = quiz.score;
            const total = quiz.questions.length;
            const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
            let feedbackMessage = 'Keep learning!';
            if (percentage === 100) feedbackMessage = 'Excellent work!';
            else if (percentage >= 60) feedbackMessage = 'Good job!';

            modalResultsEl.innerHTML = `
                <h4>Quiz Complete!</h4>
                <p>Your Score: ${score} out of ${total} (${percentage}%)</p>
                <p style="margin-top: 10px; font-size: 1em;">${feedbackMessage}</p>
            `;
            modalResultsEl.style.display = 'block';
            modalResultsEl.setAttribute('role', 'alert');
            modalResultsEl.setAttribute('aria-live', 'assertive');
        }

        // --- Conditional Navigation/Prompt ---
        if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none'; // Hide by default
        if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none'; // Hide by default

        if (finishedCategoryId && finishedCategoryId < LAST_INTRO_CATEGORY_ID) {
            // If it's an intro quiz BUT NOT the last one, show "Next Quiz"
            const nextCategoryId = finishedCategoryId + 1;
            if (modalNextQuizBtn) {
                modalNextQuizBtn.style.display = 'inline-block';
                modalNextQuizBtn.setAttribute('data-next-category-id', nextCategoryId); // Store next ID
            }
        } else if (finishedCategoryId && finishedCategoryId === LAST_INTRO_CATEGORY_ID) {
            // If it IS the last intro quiz, show the prompt
            if (modalFullChallengePrompt) {
                modalFullChallengePrompt.style.display = 'block';
            }
        }
        // Always show Restart and Close options on results screen
        if (modalRestartBtn) modalRestartBtn.style.display = 'inline-block';
        if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'inline-block';

        // Focus the first available action button (Next Quiz > Restart)
        if (modalNextQuizBtn && modalNextQuizBtn.style.display !== 'none') {
            modalNextQuizBtn.focus();
        } else if (modalRestartBtn && modalRestartBtn.style.display !== 'none') {
             modalRestartBtn.focus();
        }
    }

    function restartModalQuiz() {
        const categoryId = currentQuizData.questions[0]?.categoryId;
        if (categoryId) {
            // Reset results UI
            if (modalResultsEl) {
                modalResultsEl.style.display = 'none';
                modalResultsEl.removeAttribute('role');
                modalResultsEl.removeAttribute('aria-live');
            }
            // Hide all results navigation
            if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none';
            if (modalRestartBtn) modalRestartBtn.style.display = 'none';
            if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
            if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';

            startQuiz(categoryId); // Restart with the same category
        } else {
            closeQuizModal(quizTriggerElement); // Fallback if category ID missing
        }
    }

    function handleNextQuizClick(event) {
        const nextCategoryId = parseInt(event.target.dataset.nextCategoryId, 10);
        if (!isNaN(nextCategoryId)) {
             // Reset results UI before starting next
            if (modalResultsEl) {
                modalResultsEl.style.display = 'none';
                modalResultsEl.removeAttribute('role');
                modalResultsEl.removeAttribute('aria-live');
            }
            if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none';
            if (modalRestartBtn) modalRestartBtn.style.display = 'none';
            if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
            if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';

            startQuiz(nextCategoryId);
        } else {
            console.error("Could not determine next category ID.");
        }
    }


    function closeQuizModal(triggerElement = null) {
        if (quizModal) quizModal.style.display = 'none';
        document.body.style.overflow = '';

        // Minimal reset of modal state for next opening
        if (modalTitle) modalTitle.textContent = 'Quiz Title';
        if (modalQuestionEl) modalQuestionEl.textContent = '';
        if (modalOptionsEl) modalOptionsEl.innerHTML = '';
        if (modalFeedbackEl) {
            modalFeedbackEl.style.display = 'none';
            modalFeedbackEl.removeAttribute('role');
            modalFeedbackEl.removeAttribute('aria-live');
        }
        if (modalResultsEl) {
            modalResultsEl.style.display = 'none';
            modalResultsEl.removeAttribute('role');
            modalResultsEl.removeAttribute('aria-live');
        }
        // Ensure all nav buttons are hidden on close
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none';
        if (modalRestartBtn) modalRestartBtn.style.display = 'none';
        if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
        if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';

        // Restore visibility of core areas
        if (modalQuestionEl) modalQuestionEl.style.display = 'block';
        if (modalOptionsEl) modalOptionsEl.style.display = 'flex';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'block';

        // Return focus
        if (triggerElement) {
            triggerElement.focus();
            quizTriggerElement = null; // Reset trigger element
        }
    }

    // Attach Event Listeners for INTRO Quizzes
    document.querySelectorAll('#financial-fitness-challenge-intro .start-quiz-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            const categoryId = card ? parseInt(card.dataset.categoryId, 10) : null;
            if (categoryId && categoryId >= 1 && categoryId <= LAST_INTRO_CATEGORY_ID) { // Check against last intro ID
                quizTriggerElement = e.target; // Store the trigger
                startQuiz(categoryId);
            } else if (categoryId) {
                console.warn(`Category ${categoryId} quiz should be taken on the full quiz page.`);
                alert("This quiz category is available on the main Quizzes page.");
                window.location.href = 'quizzes.html';
            } else {
                console.error("Missing or invalid category ID on card.");
            }
        });
    });

    // Attach Modal Button Listeners
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeQuizModal(quizTriggerElement));
    if (modalCloseResultsBtn) modalCloseResultsBtn.addEventListener('click', () => closeQuizModal(quizTriggerElement)); // Use stored trigger
    if (modalNextBtn) modalNextBtn.addEventListener('click', nextModalQuestion);
    if (modalRestartBtn) modalRestartBtn.addEventListener('click', restartModalQuiz);
    if (modalNextQuizBtn) modalNextQuizBtn.addEventListener('click', handleNextQuizClick); // Listener for NEW button
    if (quizModal) {
        quizModal.addEventListener('click', (e) => {
            if (e.target === quizModal) { closeQuizModal(quizTriggerElement); }
        });
        quizModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { closeQuizModal(quizTriggerElement); }
        });
    }
    // --- END INTRO Quiz Logic ---


    // --- START Template Purchase Logic (Placeholder) ---
    // (Keep template purchase logic from v1.3.0) ...
     document.querySelectorAll('.get-spreadsheet-btn').forEach(button => {
        const isDisabled = button.getAttribute('aria-disabled') === 'true' || button.classList.contains('disabled');
        if (!isDisabled) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const templateName = e.target.closest('.btn').dataset.templateName || 'Spreadsheet Template'; // Target button correctly
                const price = e.target.closest('.btn').dataset.price || '10000';
                alert(`To get the "${templateName}" (₦${parseInt(price).toLocaleString()}):\n\n1. Provide your Gmail address.\n2. Complete payment.\n\n(Purchase flow coming soon!)`);
                console.log(`Purchase initiated for: ${templateName}, Price: ${price}`);
            });
        } else {
             button.style.pointerEvents = 'none';
             button.addEventListener('click', (e) => e.preventDefault());
        }
    });


     // --- START Coaching Form Logic (Basic Validation Example) ---
     // (Keep coaching form logic from v1.3.0) ...
     const coachingForm = document.querySelector('.coaching-request-form');
     if(coachingForm) {
         coachingForm.addEventListener('submit', (e) => {
             const emailInput = coachingForm.querySelector('#coach-email');
             const submitButton = coachingForm.querySelector('button[type="submit"]');
             if (emailInput && (!emailInput.value || !emailInput.value.includes('@'))) {
                 e.preventDefault(); alert('Please enter a valid email address to request a discovery call.'); emailInput.focus();
                 if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Request Discovery Call'; }
                 return;
             }
             if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Submitting...'; }
             console.log("Coaching form submitted (Replace with actual submission).");
         });
     }

     // --- Blog Card Button ---
     // (Keep blog button logic from v1.3.0) ...
     const blogButton = document.querySelector('.resource-card .card-cta a[href="blog.html"]');
     if(blogButton) {
        blogButton.addEventListener('click', (e) => {
            console.log('Navigating to Blog page (blog.html)...');
        });
     }

    console.log("Rofilid Personal Page Scripts Initialized (v1.4.0 - Next Quiz Logic).");

}); // End DOMContentLoaded
