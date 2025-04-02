document.addEventListener('DOMContentLoaded', () => {

    console.log("Rofilid Personal Page Scripts Initializing (v2.0 - Redesign)");

    // --- Global Variables & Elements ---
    const quizModal = document.getElementById('quiz-modal');
    const coachingInterestForm = document.getElementById('coachingInterestForm');
    let quizTriggerElement = null; // Stores the element that opened the quiz modal

    // --- Smooth Scrolling for Nav Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure it's a link to an element on *this* page, not just '#'
            if (href && href.length > 1 && href.startsWith('#')) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 70; // Get header height or default
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // If mobile nav is open, close it after clicking a link
                    const primaryNav = document.getElementById('primary-navigation');
                    const mobileToggle = document.querySelector('.mobile-menu-toggle');
                    if (primaryNav && primaryNav.classList.contains('active')) {
                         primaryNav.classList.remove('active');
                         if(mobileToggle) mobileToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    });

    // --- Mobile Navigation Toggle ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const primaryNavigation = document.getElementById('primary-navigation');

    if (mobileMenuToggle && primaryNavigation) {
        mobileMenuToggle.addEventListener('click', () => {
            const isExpanded = primaryNavigation.classList.toggle('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
            // Toggle body scroll lock (optional, can add class to body)
            // document.body.style.overflow = isExpanded ? 'hidden' : '';
        });
    }

    // --- Stats Counter Logic (Improved Robustness) ---
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statCard = entry.target;
                const displayEl = statCard.querySelector('h4'); // Target the display element

                // Check if already counted
                if (!displayEl || displayEl.classList.contains('counted')) {
                    observer.unobserve(statCard);
                    return;
                }

                const targetSpan = statCard.querySelector('.stat-target'); // Use hidden span for target number
                const target = targetSpan ? parseInt(targetSpan.textContent, 10) : null; // Get target from span if exists
                const originalText = displayEl.textContent; // Keep original text like "Actionable Knowledge"
                const suffix = (originalText.includes('%') ? '%' : '') || (originalText.includes('+') ? '+' : '');

                // If no target number, just mark as counted and exit
                if (target === null || isNaN(target)) {
                     console.warn("Stat card found without a valid .stat-target span:", statCard);
                     displayEl.classList.add('counted'); // Mark as observed even without count
                     observer.unobserve(statCard);
                     return;
                }

                // Start counting animation only if target exists
                displayEl.classList.add('counting');
                let currentCount = 0;
                const duration = 1500; // ms
                const stepTime = 20; // ms
                const steps = duration / stepTime;
                const increment = target / steps;

                const counter = () => {
                    currentCount += increment;
                    if (currentCount < target) {
                        // Update only the number part if needed, or keep static text
                        // Example: displayEl.textContent = `${Math.ceil(currentCount).toLocaleString()}${suffix}`;
                        // For this design, we keep the text static and just mark completion
                        setTimeout(counter, stepTime);
                    } else {
                        // Final state (optional: update text if you want numbers shown)
                        // displayEl.textContent = `${target.toLocaleString()}${suffix}`;
                        displayEl.classList.remove('counting');
                        displayEl.classList.add('counted'); // Mark as done
                        observer.unobserve(statCard); // Stop observing
                    }
                };
                // Start the counter (even if visually static, marks completion)
                 setTimeout(counter, stepTime);

            }
        });
    }, { threshold: 0.4 }); // Trigger when 40% visible

    // Observe all stat cards in the hero grid
    document.querySelectorAll('.hero-stats-grid .stat-card').forEach(card => {
        statsObserver.observe(card);
    });


    // --- INTRO Quiz Logic (Categories 1-4) ---
    // Using the same questions as provided in the original JS file.
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
    const LAST_INTRO_CATEGORY_ID = 4; // Last category ID for these intro quizzes

    // Quiz State & DOM References
    let currentQuizData = { questions: [], currentQuestionIndex: 0, score: 0 };
    const modalTitle = document.getElementById('quiz-modal-title');
    const modalCloseBtn = document.getElementById('quiz-modal-close');
    const modalQuestionEl = document.getElementById('quiz-modal-question');
    const modalOptionsEl = document.getElementById('quiz-modal-options');
    const modalFeedbackEl = document.getElementById('quiz-modal-feedback');
    const modalNextBtn = document.getElementById('quiz-modal-next'); // Button within quiz questions
    const modalResultsEl = document.getElementById('quiz-modal-results');
    const modalProgressCurrent = document.getElementById('quiz-modal-q-current');
    const modalProgressTotal = document.getElementById('quiz-modal-q-total');
    const modalNextQuizBtn = document.getElementById('quiz-modal-next-quiz');
    const modalRestartBtn = document.getElementById('quiz-modal-restart');
    const modalCloseResultsBtn = document.getElementById('quiz-modal-close-results');
    const modalFullChallengePrompt = document.getElementById('quiz-modal-full-challenge-prompt');

    function startQuiz(categoryId) {
        console.log(`Starting quiz check for category ID: ${categoryId}`);
        const categoryQuestions = introQuizQuestions.filter(q => q.categoryId === categoryId);

        if (categoryQuestions.length === 0) {
            console.error("No questions found for category ID:", categoryId);
            alert("Sorry, questions for this check could not be loaded.");
            return;
        }

        currentQuizData = { questions: categoryQuestions, currentQuestionIndex: 0, score: 0 };

        // Reset Modal UI
        if (modalTitle) modalTitle.textContent = categoryQuestions[0]?.category || 'Financial Concept Check';
        if (modalResultsEl) modalResultsEl.style.display = 'none';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalQuestionEl) modalQuestionEl.style.display = 'block';
        if (modalOptionsEl) modalOptionsEl.style.display = 'flex';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'block';
        if (modalProgressTotal) modalProgressTotal.textContent = currentQuizData.questions.length;

        // Hide all nav buttons initially
        [modalNextBtn, modalNextQuizBtn, modalRestartBtn, modalCloseResultsBtn, modalFullChallengePrompt].forEach(btn => {
            if (btn) btn.style.display = 'none';
        });

        displayModalQuestion();
        if (quizModal) {
             quizModal.style.display = 'flex';
             // Focus the modal container or close button for accessibility
             setTimeout(() => quizModal.focus(), 100);
        }
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function displayModalQuestion() {
        const quiz = currentQuizData;
        if (!modalQuestionEl || !modalOptionsEl || !modalProgressCurrent || quiz.currentQuestionIndex >= quiz.questions.length) {
            if (quiz.currentQuestionIndex >= quiz.questions.length) showModalResults(); // Go to results if finished
            return;
        }

        const q = quiz.questions[quiz.currentQuestionIndex];
        modalQuestionEl.textContent = `${quiz.currentQuestionIndex + 1}. ${q.question}`; // Add Q number
        modalOptionsEl.innerHTML = ''; // Clear previous options
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        modalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;

        q.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-button';
            button.setAttribute('data-index', index);
            button.onclick = () => handleModalOptionSelection(index);
            modalOptionsEl.appendChild(button);
        });

        // Focus first option
        const firstOption = modalOptionsEl.querySelector('button');
        if (firstOption) firstOption.focus();
    }

    function handleModalOptionSelection(selectedIndex) {
        const quiz = currentQuizData;
        const q = quiz.questions[quiz.currentQuestionIndex];
        const buttons = modalOptionsEl?.querySelectorAll('button');
        if (!buttons) return;

        // Disable all options immediately
        buttons.forEach(button => button.disabled = true);

        // Mark selection and show feedback
        showModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
    }

    function showModalFeedback(selectedIndex, correctIndex, explanation) {
        const quiz = currentQuizData;
        const isCorrect = selectedIndex === correctIndex;
        if (isCorrect) quiz.score++;

        const buttons = modalOptionsEl?.querySelectorAll('button');
        if (!buttons || !modalFeedbackEl) return;

        buttons.forEach((button, index) => {
            if (index === correctIndex) button.classList.add('correct');
            else if (index === selectedIndex) button.classList.add('incorrect');
            // Keep others plain but disabled
        });

        modalFeedbackEl.innerHTML = `<p><strong>${isCorrect ? 'Correct!' : 'Insight:'}</strong> ${explanation || ''}</p>`; // Use "Insight" for incorrect
        modalFeedbackEl.className = `quiz-modal-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        modalFeedbackEl.style.display = 'block';
        modalFeedbackEl.setAttribute('role', 'alert'); // Announce feedback

        // Show 'Next Question' or trigger results
        if (modalNextBtn) {
            if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
                modalNextBtn.style.display = 'inline-block';
                modalNextBtn.focus();
            } else {
                // Last question answered, show results after a short delay
                modalNextBtn.style.display = 'none';
                setTimeout(showModalResults, 1000); // Delay before showing final score
            }
        }
    }

    function nextModalQuestion() {
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        currentQuizData.currentQuestionIndex++;
        displayModalQuestion();
    }

    function showModalResults() {
        const quiz = currentQuizData;
        const finishedCategoryId = quiz.questions[0]?.categoryId;

        // Hide Q&A UI
        [modalQuestionEl, modalOptionsEl, modalFeedbackEl, modalNextBtn].forEach(el => {
            if(el) el.style.display = 'none';
        });
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'none';

        // Display Score & Message
        if (modalResultsEl) {
            const score = quiz.score;
            const total = quiz.questions.length;
            const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
            let feedbackMessage = 'Every step in learning counts!';
            if (percentage === 100) feedbackMessage = 'Excellent understanding!';
            else if (percentage >= 60) feedbackMessage = 'Good grasp of the basics!';

            modalResultsEl.innerHTML = `
                <h4>Check Complete!</h4>
                <p>You answered ${score} out of ${total} correctly.</p>
                <p style="margin-top: 10px; font-size: 1em;">${feedbackMessage}</p>
            `;
            modalResultsEl.style.display = 'block';
            modalResultsEl.setAttribute('role', 'alert');
        }

        // Show appropriate navigation/prompt
        if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none';
        if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';

        if (finishedCategoryId && finishedCategoryId < LAST_INTRO_CATEGORY_ID) {
            // Show "Next Check" if not the last intro category
            const nextCategoryId = finishedCategoryId + 1;
            if (modalNextQuizBtn) {
                modalNextQuizBtn.style.display = 'inline-block';
                modalNextQuizBtn.setAttribute('data-next-category-id', nextCategoryId);
            }
        } else if (finishedCategoryId && finishedCategoryId === LAST_INTRO_CATEGORY_ID) {
            // Show "Full Challenge" prompt if it was the last intro category
            if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'block';
        }

        // Always show Restart and Close options
        if (modalRestartBtn) modalRestartBtn.style.display = 'inline-block';
        if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'inline-block';

        // Focus logic
        const firstVisibleButton = modalNextQuizBtn?.style.display !== 'none' ? modalNextQuizBtn :
                                  modalRestartBtn?.style.display !== 'none' ? modalRestartBtn :
                                  modalCloseResultsBtn;
        if (firstVisibleButton) firstVisibleButton.focus();
    }

    function restartModalQuiz() {
        const categoryId = currentQuizData.questions[0]?.categoryId;
        if (categoryId) {
            // Reset UI visually before restarting
             if (modalResultsEl) modalResultsEl.style.display = 'none';
             [modalNextQuizBtn, modalRestartBtn, modalCloseResultsBtn, modalFullChallengePrompt].forEach(btn => {
                if (btn) btn.style.display = 'none';
             });
            startQuiz(categoryId);
        } else {
            closeQuizModal(quizTriggerElement);
        }
    }

    function handleNextQuizClick(event) {
        const nextCategoryId = parseInt(event.target.dataset.nextCategoryId, 10);
        if (!isNaN(nextCategoryId)) {
             // Reset UI visually
             if (modalResultsEl) modalResultsEl.style.display = 'none';
             [modalNextQuizBtn, modalRestartBtn, modalCloseResultsBtn, modalFullChallengePrompt].forEach(btn => {
                 if (btn) btn.style.display = 'none';
             });
            startQuiz(nextCategoryId);
        } else {
            console.error("Could not determine next category ID.");
        }
    }

    function closeQuizModal(triggerElement = null) {
        if (quizModal) quizModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll

        // Minimal reset for next time
        if (modalTitle) modalTitle.textContent = 'Financial Concept Check';
        if (modalQuestionEl) modalQuestionEl.textContent = '';
        if (modalOptionsEl) modalOptionsEl.innerHTML = '';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalResultsEl) modalResultsEl.style.display = 'none';
        [modalNextBtn, modalNextQuizBtn, modalRestartBtn, modalCloseResultsBtn, modalFullChallengePrompt].forEach(btn => {
            if (btn) btn.style.display = 'none';
        });

        // Restore visibility
        if (modalQuestionEl) modalQuestionEl.style.display = 'block';
        if (modalOptionsEl) modalOptionsEl.style.display = 'flex';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'block';

        // Return focus to the element that opened the modal
        if (triggerElement) {
            triggerElement.focus();
            quizTriggerElement = null; // Clear stored trigger
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

    // Attach Modal Button & Overlay Listeners
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeQuizModal(quizTriggerElement));
    if (modalCloseResultsBtn) modalCloseResultsBtn.addEventListener('click', () => closeQuizModal(quizTriggerElement));
    if (modalNextBtn) modalNextBtn.addEventListener('click', nextModalQuestion);
    if (modalRestartBtn) modalRestartBtn.addEventListener('click', restartModalQuiz);
    if (modalNextQuizBtn) modalNextQuizBtn.addEventListener('click', handleNextQuizClick);
    if (quizModal) {
        // Close modal if clicking outside the content area
        quizModal.addEventListener('click', (e) => {
            if (e.target === quizModal) closeQuizModal(quizTriggerElement);
        });
        // Close modal on Escape key press
        quizModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeQuizModal(quizTriggerElement);
        });
    }
    // --- END INTRO Quiz Logic ---


    // --- Template Purchase Logic (Placeholder - As Before) ---
     document.querySelectorAll('.get-spreadsheet-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const templateName = button.dataset.templateName || 'Spreadsheet Template';
            const price = button.dataset.price || '10000'; // Default price if not set
            // Simple alert placeholder - replace with actual purchase flow/modal
            alert(`Interactive "${templateName}" Spreadsheet (₦${parseInt(price).toLocaleString()})\n\nThis premium tool offers more features. Purchase details coming soon!\n\nPlease ensure you have a Gmail account for access after purchase.`);
            console.log(`Purchase interest for: ${templateName}, Price: ₦${price}`);
        });
    });
    // PDF Download Placeholder (could link directly or trigger download via JS)
    document.querySelectorAll('.download-pdf-btn').forEach(button => {
         button.addEventListener('click', (e) => {
             e.preventDefault();
             const templateCard = e.target.closest('.template-card');
             const templateName = templateCard?.querySelector('h3')?.textContent || 'Template';
             // In a real scenario, you'd fetch the PDF URL based on the template type
             alert(`Downloading ${templateName} PDF (Free)... \n(Implementation needed: Link this button to the actual PDF file)`);
             console.log(`PDF Download initiated for: ${templateName}`);
             // Example: window.location.href = '/path/to/template.pdf';
         });
    });


    // --- Coaching Interest Form Logic ---
    if (coachingInterestForm) {
        coachingInterestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = coachingInterestForm.querySelector('#interest-email');
            const responseEl = coachingInterestForm.querySelector('#interest-form-response');
            const submitButton = coachingInterestForm.querySelector('button[type="submit"]');

            if (!emailInput || !responseEl || !submitButton) return;

            // Basic validation
            if (!emailInput.value || !emailInput.value.includes('@')) {
                responseEl.textContent = 'Please enter a valid email address.';
                responseEl.className = 'form-response-note error';
                responseEl.style.display = 'block';
                emailInput.focus();
                return;
            }

            // Simulate submission
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            responseEl.style.display = 'none'; // Hide previous messages

            console.log("Coaching interest submitted for:", emailInput.value);

            // Simulate backend response (replace with actual fetch/AJAX)
            setTimeout(() => {
                // Success simulation:
                responseEl.textContent = 'Thank you! We\'ve received your interest and will notify you.';
                responseEl.className = 'form-response-note success';
                responseEl.style.display = 'block';
                emailInput.value = ''; // Clear input on success
                submitButton.innerHTML = '<i class="fas fa-check"></i> Submitted!';

                // Keep button disabled after successful submission for this example
                // To allow another submission, re-enable it:
                // submitButton.disabled = false;
                // submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Notify Me When Available';

                // Error simulation (example):
                // responseEl.textContent = 'Submission failed. Please try again.';
                // responseEl.className = 'form-response-note error';
                // responseEl.style.display = 'block';
                // submitButton.disabled = false;
                 // submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Notify Me When Available';

            }, 1500); // Simulate network delay
        });
    }


    // --- Update Copyright Year ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

     // --- General Smooth Fade-in for Sections (Optional Enhancement) ---
     const fadeObserver = new IntersectionObserver((entries, observer) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 entry.target.style.opacity = 1;
                 entry.target.style.transform = 'translateY(0)';
                 observer.unobserve(entry.target);
             }
         });
     }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }); // Trigger slightly before fully visible

     document.querySelectorAll('section').forEach(section => {
         section.style.opacity = 0;
         section.style.transform = 'translateY(20px)';
         section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
         fadeObserver.observe(section);
     });


    console.log("Rofilid Personal Page Scripts Fully Loaded.");

}); // End DOMContentLoaded
