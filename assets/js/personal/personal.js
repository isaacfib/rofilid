document.addEventListener('DOMContentLoaded', () => {

    // --- START Personal Page Specific Components ---

    // Social Carousel Logic (No changes needed)
    const carousels = document.querySelectorAll('.social-carousel');
    carousels.forEach(carousel => {
        let currentIndex = 0;
        const posts = carousel.querySelectorAll('.social-post');
        let intervalId = null;

        function showPost(index) {
            posts.forEach((post, i) => {
                post.style.display = i === index ? 'block' : 'none';
                // Accessibility: Mark active slide
                post.setAttribute('aria-hidden', i !== index);
            });
        }

        function startCarousel() {
            if (intervalId) clearInterval(intervalId);
            if (posts.length > 1) {
                intervalId = setInterval(() => {
                    currentIndex = (currentIndex + 1) % posts.length;
                    showPost(currentIndex);
                }, 6000); // Change slide every 6 seconds
            }
        }

        if (posts.length > 0) {
            showPost(currentIndex); // Show first post initially
            // Set initial aria-hidden states
            posts.forEach((post, i) => {
                 post.setAttribute('aria-hidden', i !== currentIndex);
            });
            startCarousel();
        }
    });

    // Stats Counter Logic (No changes needed)
    const statObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statCard = entry.target;
                const targetSpan = statCard.querySelector('.stat-target');
                const displayEl = statCard.querySelector('h4');
                const suffix = (displayEl.textContent.includes('%') ? '%' : '') || (displayEl.textContent.includes('+') ? '+' : '');

                if (!targetSpan || !displayEl || displayEl.classList.contains('counted')) {
                    observer.unobserve(statCard);
                    return;
                }

                const target = parseInt(targetSpan.textContent, 10);
                if (isNaN(target)) {
                    observer.unobserve(statCard);
                    return;
                }

                let currentCount = 0;
                const duration = 1500; // Animation duration in ms
                const frameDuration = 1000 / 60; // 60 fps
                const totalFrames = Math.round(duration / frameDuration);
                const increment = target / totalFrames;

                const animateCount = () => {
                    currentCount += increment;
                    if (currentCount < target) {
                        displayEl.textContent = Math.ceil(currentCount).toLocaleString() + suffix;
                        requestAnimationFrame(animateCount);
                    } else {
                        displayEl.textContent = target.toLocaleString() + suffix;
                        displayEl.classList.add('counted'); // Prevent re-counting
                    }
                };
                requestAnimationFrame(animateCount);
                observer.unobserve(statCard); // Unobserve after animation starts
            }
        });
    }, { threshold: 0.4 }); // Trigger when 40% visible

    document.querySelectorAll('.stat-card').forEach(card => {
        statObserver.observe(card);
    });

    // --- END Personal Page Specific Components ---


    // --- START INTRO Quiz Logic (Theme 1 Only) ---
    // (Keep existing quiz questions and logic unchanged)
     const allQuestions_Theme1 = [
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

    const questionsForThisPage = allQuestions_Theme1;

    let currentQuizData = { questions: [], currentQuestionIndex: 0, score: 0, userAnswers: {} };
    const quizModal = document.getElementById('quiz-modal');
    const modalTitle = document.getElementById('quiz-modal-title');
    const modalCloseBtn = document.getElementById('quiz-modal-close');
    const modalQuestionEl = document.getElementById('quiz-modal-question');
    const modalOptionsEl = document.getElementById('quiz-modal-options');
    const modalFeedbackEl = document.getElementById('quiz-modal-feedback');
    const modalNextBtn = document.getElementById('quiz-modal-next');
    const modalResultsEl = document.getElementById('quiz-modal-results');
    const modalRestartBtn = document.getElementById('quiz-modal-restart');
    const modalCloseResultsBtn = document.getElementById('quiz-modal-close-results');
    const modalProgressCurrent = document.getElementById('quiz-modal-q-current');
    const modalProgressTotal = document.getElementById('quiz-modal-q-total');

    function startQuiz(categoryId) {
        console.log(`Starting quiz for category ID: ${categoryId} on Personal Page`);
        const categoryQuestions = questionsForThisPage.filter(q => q.categoryId === categoryId);
        if (categoryQuestions.length === 0) {
             console.error("No questions found in questionsForThisPage for category ID:", categoryId);
             alert("Sorry, questions for this category could not be loaded.");
             return;
         }
        // Allow quizzes with fewer than 5 questions if necessary, though data has 5
        // if (categoryQuestions.length !== 5) {
        //     console.warn(`Expected 5 questions, but found ${categoryQuestions.length} for category ID: ${categoryId}. Proceeding anyway.`);
        // }

        currentQuizData = { questions: categoryQuestions, currentQuestionIndex: 0, score: 0, userAnswers: {} };
        if (modalTitle) modalTitle.textContent = categoryQuestions[0]?.category || 'Financial Fitness Quiz';
        if (modalResultsEl) modalResultsEl.style.display = 'none';
        if (modalRestartBtn) modalRestartBtn.style.display = 'none';
        if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
        if (modalQuestionEl) modalQuestionEl.style.display = 'block';
        if (modalOptionsEl) modalOptionsEl.style.display = 'flex'; // Ensure options area uses flex
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'block';
        if (modalProgressTotal) modalProgressTotal.textContent = currentQuizData.questions.length;

        displayModalQuestion();
        if(quizModal) quizModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function displayModalQuestion() {
        const quiz = currentQuizData;
        if (!modalQuestionEl || !modalOptionsEl || !modalProgressCurrent) return;

        if (quiz.currentQuestionIndex >= quiz.questions.length) {
            showModalResults();
            return;
        }
        const q = quiz.questions[quiz.currentQuestionIndex];
        modalQuestionEl.textContent = q.question;
        modalOptionsEl.innerHTML = '';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        modalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;

        q.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-button';
            button.setAttribute('data-index', index);
            // Set ARIA role and initial state
            button.setAttribute('role', 'button');
            button.setAttribute('aria-pressed', 'false');
            button.onclick = () => handleModalOptionSelection(index);
            modalOptionsEl.appendChild(button);
        });
    }

    function handleModalOptionSelection(selectedIndex) {
        const quiz = currentQuizData;
        const q = quiz.questions[quiz.currentQuestionIndex];
        const buttons = modalOptionsEl?.querySelectorAll('button');
        if (!buttons) return;

        buttons.forEach(button => {
            button.disabled = true;
            button.onclick = null;
            // Update ARIA state for selected button
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

        modalFeedbackEl.innerHTML = `<p><strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${explanation || ''}</p>`;
        modalFeedbackEl.className = `quiz-modal-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        modalFeedbackEl.style.display = 'block';
        // ARIA: Announce feedback
        modalFeedbackEl.setAttribute('role', 'alert');
        modalFeedbackEl.setAttribute('aria-live', 'assertive');


        if (modalNextBtn) {
            if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
                modalNextBtn.style.display = 'inline-block';
                modalNextBtn.focus(); // Focus next button
            } else {
                modalNextBtn.style.display = 'none';
                 // Show results slightly faster, focus restart
                setTimeout(() => {
                    showModalResults();
                    if(modalRestartBtn) modalRestartBtn.focus();
                }, 1000);
            }
        }
    }

    function nextModalQuestion() {
        if (modalFeedbackEl) {
             modalFeedbackEl.style.display = 'none';
             // ARIA: Remove alert role when hidden
             modalFeedbackEl.removeAttribute('role');
             modalFeedbackEl.removeAttribute('aria-live');
        }
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        currentQuizData.currentQuestionIndex++;
        displayModalQuestion();
        // Focus the first option of the new question
        const firstOption = modalOptionsEl?.querySelector('button');
        if(firstOption) firstOption.focus();
    }

    function showModalResults() {
        const quiz = currentQuizData;
        if(modalQuestionEl) modalQuestionEl.style.display = 'none';
        if(modalOptionsEl) modalOptionsEl.style.display = 'none';
        if(modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if(modalNextBtn) modalNextBtn.style.display = 'none';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'none';

        if(modalResultsEl) {
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
            // ARIA: Announce results
            modalResultsEl.setAttribute('role', 'alert');
            modalResultsEl.setAttribute('aria-live', 'assertive');
        }

        if(modalRestartBtn) modalRestartBtn.style.display = 'inline-block';
        if(modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'inline-block';
    }

    function restartModalQuiz() {
        const categoryId = currentQuizData.questions[0]?.categoryId;
        if (categoryId) {
            if(modalResultsEl) {
                modalResultsEl.style.display = 'none';
                // ARIA: Remove alert role
                modalResultsEl.removeAttribute('role');
                modalResultsEl.removeAttribute('aria-live');
            }
            if(modalRestartBtn) modalRestartBtn.style.display = 'none';
            if(modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
            startQuiz(categoryId);
             // Focus the first option
            const firstOption = modalOptionsEl?.querySelector('button');
            if(firstOption) firstOption.focus();
        } else {
            closeQuizModal();
        }
    }

    function closeQuizModal() {
       if(quizModal) quizModal.style.display = 'none';
       document.body.style.overflow = '';

       // Minimal reset
       if(modalTitle) modalTitle.textContent = 'Quiz Title';
       if(modalQuestionEl) modalQuestionEl.textContent = '';
       if(modalOptionsEl) modalOptionsEl.innerHTML = '';
       if(modalFeedbackEl) {
           modalFeedbackEl.style.display = 'none';
           modalFeedbackEl.removeAttribute('role');
           modalFeedbackEl.removeAttribute('aria-live');
       }
        if(modalResultsEl) {
           modalResultsEl.style.display = 'none';
           modalResultsEl.removeAttribute('role');
           modalResultsEl.removeAttribute('aria-live');
        }
       if(modalRestartBtn) modalRestartBtn.style.display = 'none';
       if(modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
       if(modalNextBtn) modalNextBtn.style.display = 'none';
       if(modalQuestionEl) modalQuestionEl.style.display = 'block';
       if(modalOptionsEl) modalOptionsEl.style.display = 'flex';
       const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
       if (progressEl) progressEl.style.display = 'block';

       // Return focus to the button that opened the modal if possible
       // This requires storing the trigger element, which adds complexity.
       // For now, just closing is sufficient.
    }

    // Attach Event Listeners for INTRO Quizzes
    document.querySelectorAll('#financial-fitness-challenge-intro .start-quiz-btn').forEach(button => {
        button.addEventListener('click', (e) => {
           const card = e.target.closest('.category-card');
           const categoryId = card ? parseInt(card.dataset.categoryId, 10) : null;
            if (categoryId && categoryId >= 1 && categoryId <= 4) {
               // Store the trigger button? (Optional for focus return)
               // e.target.dataset.triggeredModal = 'true';
               startQuiz(categoryId);
           } else if (categoryId) {
                console.warn(`Category ${categoryId} quiz should be taken on the full quiz page.`);
                alert("This quiz category is available on the main Quizzes page.");
                window.location.href = 'quizzes.html'; // Redirect as planned
           } else {
               console.error("Missing or invalid category ID on card.");
           }
        });
    });

    // Attach Modal Button Listeners
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeQuizModal);
    if (modalCloseResultsBtn) modalCloseResultsBtn.addEventListener('click', closeQuizModal);
    if (modalNextBtn) modalNextBtn.addEventListener('click', nextModalQuestion);
    if (modalRestartBtn) modalRestartBtn.addEventListener('click', restartModalQuiz);
    if (quizModal) {
        quizModal.addEventListener('click', (e) => {
            if (e.target === quizModal) {
                closeQuizModal();
            }
        });
         // Allow closing with Escape key
        quizModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeQuizModal();
            }
        });
    }
    // --- END INTRO Quiz Logic ---

    // --- START Template Purchase Logic (Placeholder) ---
    document.querySelectorAll('.get-spreadsheet-btn').forEach(button => {
        // Only add listener if the button is NOT disabled initially
        if (button.getAttribute('aria-disabled') !== 'true') {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior if it's an <a>
                const templateName = e.target.dataset.templateName || 'Spreadsheet Template';
                const price = e.target.dataset.price || '10000';

                // **Placeholder Action:**
                // In a real implementation, this would likely:
                // 1. Open a modal asking for the user's Gmail address.
                // 2. Validate the email.
                // 3. Redirect to a payment gateway (like Paystack, Flutterwave) with template details and price.
                // 4. On successful payment confirmation (webhook/callback), grant access to the spreadsheet (e.g., via Google Apps Script or sharing).

                alert(`To get the "${templateName}" (₦${parseInt(price).toLocaleString()}):\n\n1. Provide your Gmail address.\n2. Complete payment.\n\n(This feature is currently under development. Please check back soon!)`);

                console.log(`Purchase initiated for: ${templateName}, Price: ${price}`);
                // Example: openPurchaseModal(templateName, price);
            });
        } else {
             // Optionally add a tooltip or message for disabled buttons
             button.addEventListener('click', (e) => {
                 e.preventDefault();
                 // alert("This template download is not yet available. Please check back soon!");
             });
        }
    });
    // --- END Template Purchase Logic ---


     // --- START Coaching Form Logic (Basic Validation Example) ---
     const coachingForm = document.querySelector('.coaching-request-form');
     if(coachingForm) {
         coachingForm.addEventListener('submit', (e) => {
             // Example: Basic frontend validation
             const emailInput = coachingForm.querySelector('#coach-email');
             if (emailInput && (!emailInput.value || !emailInput.value.includes('@'))) {
                 e.preventDefault(); // Stop submission
                 alert('Please enter a valid email address to request a discovery call.');
                 emailInput.focus();
                 return; // Stop further processing
             }
              // Prevent double submission (optional)
             const submitButton = coachingForm.querySelector('button[type="submit"]');
             if (submitButton) {
                 submitButton.disabled = true;
                 submitButton.textContent = 'Submitting...';
             }

             console.log("Coaching form submitted (Frontend validation passed - replace with actual submission logic like fetch).");
             // **IMPORTANT**: Replace console.log with actual form submission (e.g., using fetch API to send data to a backend endpoint or a service like Formspree/Netlify Forms)
             // Example using Fetch (requires backend endpoint):
             /*
             e.preventDefault(); // Prevent default ONLY if using fetch
             const formData = new FormData(coachingForm);
             fetch('/api/coaching-request', { // Replace with your actual endpoint
                 method: 'POST',
                 body: formData
             })
             .then(response => response.json())
             .then(data => {
                 console.log('Success:', data);
                 alert('Thank you! Your request has been sent. We will contact you soon.');
                 coachingForm.reset(); // Clear the form
             })
             .catch((error) => {
                 console.error('Error:', error);
                 alert('Sorry, there was an error submitting your request. Please try again later.');
             })
             .finally(() => {
                 // Re-enable button regardless of success/error
                 if (submitButton) {
                     submitButton.disabled = false;
                     submitButton.textContent = 'Request Discovery Call';
                 }
             });
             */
              // If NOT using fetch and relying on standard form action, remove e.preventDefault() above
              // For now, let the default action proceed after logging
         });
     }
     // --- END Coaching Form Logic ---

    console.log("Rofilid Personal Page Scripts Initialized (v1.1.0).");

}); // End DOMContentLoaded
