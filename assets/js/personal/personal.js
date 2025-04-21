// personal.js
'use strict';

// --- Quiz Data (Unchanged) ---
const introQuizQuestions = [
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

// --- Global Quiz State Variables ---
let currentCategoryId = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let quizDemographicsSubmitted = sessionStorage.getItem('quizDemographicsSubmitted') === 'true'; // Initialize from sessionStorage

// --- DOM Element References (Optional, but good practice) ---
let quizModal, demographicsModal, pdfModal, feedbackModal;
let fabContainer, fabButton, fabOptions;
// Add others as needed

// --- Utility Function to Reset Form Errors ---
function resetFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    const errorElements = form.querySelectorAll('.form-error-msg, .invalid-feedback'); // Include both types
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none'; // Hide feedback elements
    });
    const invalidInputs = form.querySelectorAll('.is-invalid');
    invalidInputs.forEach(el => el.classList.remove('is-invalid'));
}

// --- Utility to Close Modals ---
function closeModal(modalElement) {
    if (modalElement) {
        modalElement.hidden = true;
    }
    // Check if any other modals are open before removing the class
    const anyModalOpen = document.querySelector('.modal-overlay:not([hidden])');
    if (!anyModalOpen) {
        document.body.classList.remove('modal-open');
    }
}

// --- Quiz Functions ---
function startQuiz(categoryId) {
    // Find the quiz modal element
    quizModal = quizModal || document.getElementById('quiz-modal');
    if (!quizModal) {
        console.error("Quiz modal not found!");
        return;
    }

    currentQuestions = introQuizQuestions.filter(q => q.categoryId === parseInt(categoryId));
    if (currentQuestions.length === 0) {
        console.error('No questions found for category:', categoryId);
        // Optionally display an error message to the user
        return;
    }

    // Reset quiz state
    currentCategoryId = categoryId;
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;

    // Show modal and block background scroll
    quizModal.hidden = false;
    document.body.classList.add('modal-open');

    // Update modal content
    document.getElementById('quiz-modal-title').textContent = currentQuestions[0].category;
    document.getElementById('quiz-modal-q-total').textContent = currentQuestions.length;

    // Hide results/prompts and show question area
    document.getElementById('quiz-modal-results').hidden = true;
    document.getElementById('quiz-modal-full-challenge-prompt').hidden = true;
    document.getElementById('quiz-modal-restart').hidden = true;
    document.getElementById('quiz-modal-close-results').hidden = true;
    document.getElementById('quiz-modal-question').hidden = false;
    document.getElementById('quiz-modal-options').hidden = false;
    document.getElementById('quiz-modal-feedback').hidden = true;
    document.getElementById('quiz-modal-next').hidden = true; // Hide next button initially

    // Display the first question
    displayQuestion();
}

function displayQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    const questionElement = document.getElementById('quiz-modal-question');
    const optionsElement = document.getElementById('quiz-modal-options');
    const feedbackElement = document.getElementById('quiz-modal-feedback');
    const nextButton = document.getElementById('quiz-modal-next');
    const progressElement = document.getElementById('quiz-modal-q-current');

    progressElement.textContent = currentQuestionIndex + 1;
    questionElement.textContent = question.question;
    optionsElement.innerHTML = ''; // Clear previous options
    optionsElement.hidden = false;
    feedbackElement.hidden = true; // Hide feedback until answer
    nextButton.hidden = true; // Hide next button until answer

    // Create and append option buttons
    question.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        // Add base classes plus specific quiz option class
        optionButton.classList.add('btn', 'btn-outline', 'quiz-option');
        optionButton.textContent = option;
        optionButton.setAttribute('data-index', index);
        // Set appropriate ARIA role and label for accessibility
        // optionButton.setAttribute('role', 'radio'); // Part of radiogroup role on options container
        optionButton.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
        optionButton.addEventListener('click', handleAnswerSelection);
        optionsElement.appendChild(optionButton);
    });
}

function handleAnswerSelection(event) {
    const selectedIndex = parseInt(event.target.dataset.index);
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correctAnswerIndex;

    // Record answer
    userAnswers.push({ questionId: question.id, selected: selectedIndex, correct: isCorrect });
    if (isCorrect) {
        score++;
    }

    // Display feedback
    const feedbackElement = document.getElementById('quiz-modal-feedback');
    feedbackElement.hidden = false;
    feedbackElement.textContent = isCorrect ? `Correct! ${question.explanation}` : `Incorrect. ${question.explanation}`;
    // Toggle classes for visual styling (uses CSS definitions)
    feedbackElement.classList.toggle('correct', isCorrect);
    feedbackElement.classList.toggle('incorrect', !isCorrect);

    // Show the 'Next Question' button
    document.getElementById('quiz-modal-next').hidden = false;

    // Disable all option buttons and highlight correct/incorrect
    const optionButtons = document.querySelectorAll('#quiz-modal-options .quiz-option');
    optionButtons.forEach(btn => {
        btn.disabled = true; // Disable after selection
        const buttonIndex = parseInt(btn.dataset.index);
        if (buttonIndex === question.correctAnswerIndex) {
            btn.classList.add('correct'); // Highlight correct answer
        } else if (buttonIndex === selectedIndex) {
            btn.classList.add('incorrect'); // Highlight selected incorrect answer
        }
        // btn.setAttribute('aria-checked', buttonIndex === selectedIndex); // Update ARIA state
    });
}

function showQuizResults() {
    const resultsElement = document.getElementById('quiz-modal-results');
    const questionArea = document.getElementById('quiz-modal-question');
    const optionsArea = document.getElementById('quiz-modal-options');
    const feedbackArea = document.getElementById('quiz-modal-feedback');
    const nextButton = document.getElementById('quiz-modal-next');
    const restartButton = document.getElementById('quiz-modal-restart');
    const closeResultsButton = document.getElementById('quiz-modal-close-results');
    const fullChallengePrompt = document.getElementById('quiz-modal-full-challenge-prompt');

    // Hide quiz elements
    questionArea.hidden = true;
    optionsArea.hidden = true;
    feedbackArea.hidden = true;
    nextButton.hidden = true;

    // Calculate results
    const totalQuestions = currentQuestions.length;
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    let message;
    if (percentage >= 80) {
        message = 'Excellent! You have a strong understanding.';
    } else if (percentage >= 60) {
        message = 'Good job! Keep building on your knowledge.';
    } else {
        message = 'Keep practicing! Review the concepts and try again.';
    }

    // Display results message
    resultsElement.innerHTML = `
        <h4>Quiz Complete!</h4>
        <p>You scored ${score} out of ${totalQuestions} (${percentage.toFixed(0)}%).</p>
        <p>${message}</p>
    `;

    // Determine next steps
    const nextCategoryId = parseInt(currentCategoryId) + 1;
    const nextCategory = introQuizQuestions.find(q => q.categoryId === nextCategoryId);

    if (nextCategory) {
        const nextCategoryName = nextCategory.category;
        // Add button to start next quiz
        resultsElement.innerHTML += `
            <p class="mt-lg">Continue your learning journey with the next check:</p>
            <button type="button" class="btn btn-primary btn-icon" onclick="handleQuizStart(${nextCategoryId})">
                <i class="fas fa-arrow-right" aria-hidden="true"></i> Take ${nextCategoryName} Check
            </button>
        `;
    } else {
        // Add link to full challenge if all categories are done
        fullChallengePrompt.hidden = false; // Show the separate prompt div
        resultsElement.innerHTML += `
            <p class="mt-lg">You've completed all the introductory checks!</p>
        `;
    }

    // Show results and control buttons
    resultsElement.hidden = false;
    restartButton.hidden = false;
    closeResultsButton.hidden = false;
}

function handleQuizStart(categoryId) {
    // Store category ID for later use if demographics are needed
    sessionStorage.setItem('selectedQuizCategory', categoryId);

    // Find demographics modal element
    demographicsModal = demographicsModal || document.getElementById('quiz-demographics-modal');
    if (!demographicsModal) {
        console.error("Demographics modal not found!");
        // Optionally start quiz anyway or show an error
        startQuiz(categoryId);
        return;
    }

    if (!quizDemographicsSubmitted) {
        // Show demographics modal
        resetFormErrors('quiz-demographics-form'); // Reset errors before showing
        demographicsModal.hidden = false;
        document.body.classList.add('modal-open');
    } else {
        // Demographics already submitted, start quiz directly
        startQuiz(categoryId);
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', function() {

    // Cache frequently used modal elements
    quizModal = document.getElementById('quiz-modal');
    demographicsModal = document.getElementById('quiz-demographics-modal');
    pdfModal = document.getElementById('pdf-download-modal');
    feedbackModal = document.getElementById('feedback-modal');
    fabContainer = document.querySelector('.floating-action-btn');
    fabButton = document.querySelector('.fab-main');
    fabOptions = document.querySelector('.fab-options'); // Might be ul#fab-options-list

    // -- General UI Enhancements --

    // Update Current Year in Footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Scroll Animations
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger > *');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // Optional: stop observing once revealed
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% visible

        revealElements.forEach(el => observer.observe(el));
    }

    // Form Submit Ripple Effect
    const submitButtons = document.querySelectorAll('.form-submit-btn');
    submitButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Remove any existing ripple
            const existingRipple = button.querySelector('.btn-ripple');
            if(existingRipple) {
                existingRipple.remove();
            }

            // Create and append ripple
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2; // Center ripple on click
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            // Clean up ripple after animation
            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    });

    // Basic Mobile Navigation Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const primaryNav = document.getElementById('primary-navigation');
    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            primaryNav.classList.toggle('active');
            menuToggle.classList.toggle('active'); // For styling the button itself (e.g., hide/show icons)
        });
        // Optional: Close menu when a link is clicked
        primaryNav.addEventListener('click', (e) => {
           if (e.target.matches('a')) {
               menuToggle.setAttribute('aria-expanded', 'false');
               primaryNav.classList.remove('active');
               menuToggle.classList.remove('active');
           }
        });
    }


    // --- Quiz Related Listeners ---

    // Start Quiz Buttons (delegation could be used if cards were added dynamically)
    document.querySelectorAll('.start-quiz-btn').forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.closest('.category-card')?.dataset.categoryId;
            if (categoryId) {
                handleQuizStart(parseInt(categoryId));
            } else {
                console.error("Could not find category ID for quiz button.");
            }
        });
    });

    // Quiz Modal Navigation Buttons
    const nextButton = document.getElementById('quiz-modal-next');
    const restartButton = document.getElementById('quiz-modal-restart');
    const closeQuizButton = document.getElementById('quiz-modal-close');
    const closeResultsButton = document.getElementById('quiz-modal-close-results');

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < currentQuestions.length) {
                displayQuestion();
            } else {
                showQuizResults();
            }
        });
    }

    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (currentCategoryId !== null) {
                startQuiz(currentCategoryId); // Restart the current quiz
            }
        });
    }

    if (closeQuizButton) {
        closeQuizButton.addEventListener('click', () => closeModal(quizModal));
    }

    if (closeResultsButton) {
        closeResultsButton.addEventListener('click', () => closeModal(quizModal));
    }

    // --- Quiz Demographics Form ---
    const demographicsForm = document.getElementById('quiz-demographics-form');
    const closeDemographicsButton = document.getElementById('quiz-demographics-close');

    if (demographicsForm) {
        demographicsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('quiz-demographics-form');
            let isValid = true;

            // Validate Country
            const countryInput = document.getElementById('quiz-country');
            const countryError = document.getElementById('quiz-country-error');
            if (!countryInput.value.trim()) {
                countryError.textContent = 'Please enter your country';
                countryError.style.display = 'block';
                countryInput.classList.add('is-invalid');
                isValid = false;
            }

            // Validate City
            const cityInput = document.getElementById('quiz-city');
            const cityError = document.getElementById('quiz-city-error');
            if (!cityInput.value.trim()) {
                cityError.textContent = 'Please enter your city';
                cityError.style.display = 'block';
                cityInput.classList.add('is-invalid');
                isValid = false;
            }

            // Validate Radio Button Selection
            const takenBeforeRadio = document.querySelector('input[name="taken_before"]:checked');
            const takenError = document.getElementById('quiz-taken-error');
            if (!takenBeforeRadio) {
                takenError.textContent = 'Please select an option';
                takenError.style.display = 'block';
                // Maybe add is-invalid to the fieldset? Or just show the message.
                isValid = false;
            }

            if (isValid) {
                quizDemographicsSubmitted = true;
                sessionStorage.setItem('quizDemographicsSubmitted', 'true');

                // Prepare and "send" data (replace console.log with fetch/axios)
                const formData = {
                    country: countryInput.value.trim(),
                    city: cityInput.value.trim(),
                    taken_before: takenBeforeRadio.value
                };
                console.log('Submitting Demographics:', formData); // Placeholder

                // Close modal and start the selected quiz
                closeModal(demographicsModal);
                const selectedCategoryId = sessionStorage.getItem('selectedQuizCategory');
                if (selectedCategoryId) {
                    startQuiz(parseInt(selectedCategoryId));
                } else {
                    console.error("No quiz category selected after demographics.");
                }
            }
        });
    }

    if (closeDemographicsButton) {
        closeDemographicsButton.addEventListener('click', () => closeModal(demographicsModal));
    }


    // --- PDF Download Functionality ---
    const pdfDownloadForm = document.getElementById('pdf-download-form');
    const closePdfButton = document.getElementById('pdf-download-close');

    // Attach listener to all 'Get PDF' buttons
    document.querySelectorAll('.get-pdf-btn').forEach(button => {
        button.addEventListener('click', function() {
            const templateKey = this.dataset.templateKey;
            const templateKeyInput = document.getElementById('pdf-template-key');
            if (templateKey && templateKeyInput && pdfModal) {
                templateKeyInput.value = templateKey;
                resetFormErrors('pdf-download-form'); // Reset before showing
                pdfModal.hidden = false;
                document.body.classList.add('modal-open');
            } else {
                console.error("PDF download setup error: Missing elements or key.");
            }
        });
    });

    if (pdfDownloadForm) {
        pdfDownloadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('pdf-download-form');
            let isValid = true;
            const templateKeyInput = document.getElementById('pdf-template-key');
            const countryInput = document.getElementById('pdf-country');
            const cityInput = document.getElementById('pdf-city');
            const countryError = document.getElementById('pdf-country-error');
            const cityError = document.getElementById('pdf-city-error');

            // Validate Country
            if (!countryInput.value.trim()) {
                countryError.textContent = 'Please enter your country';
                countryError.style.display = 'block';
                countryInput.classList.add('is-invalid');
                isValid = false;
            }
             // Validate City
             if (!cityInput.value.trim()) {
                cityError.textContent = 'Please enter your city';
                cityError.style.display = 'block';
                cityInput.classList.add('is-invalid');
                isValid = false;
            }

            if (isValid) {
                const templateKey = templateKeyInput.value;
                // Prepare and "send" data (replace console.log)
                const formData = {
                    country: countryInput.value.trim(),
                    city: cityInput.value.trim(),
                    template: templateKey
                };
                console.log('PDF Download Data:', formData); // Placeholder

                // Trigger PDF download
                const pdfUrl = `../../assets/pdfs/${templateKey}.pdf`; // Ensure path is correct
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `${templateKey}.pdf`; // Sets the download filename
                document.body.appendChild(link); // Required for Firefox
                link.click();
                document.body.removeChild(link); // Clean up

                // Close modal
                closeModal(pdfModal);
                pdfDownloadForm.reset(); // Reset form fields
            }
        });
    }

    if (closePdfButton) {
        closePdfButton.addEventListener('click', () => closeModal(pdfModal));
    }

    // --- Spreadsheet Button Placeholder ---
    document.querySelectorAll('.get-spreadsheet-btn').forEach(button => {
        button.addEventListener('click', function() {
            const templateName = this.dataset.templateName;
            const price = this.dataset.price; // Could be used for payment integration
            console.log(`Spreadsheet requested: ${templateName}, Price: ${price}`);
            // Placeholder for potential payment gateway integration or redirection
            alert(`Interactive Spreadsheet (${templateName}) coming soon! (Placeholder: Price ${price} NGN)`);
        });
    });


    // --- Feedback Modal ---
    const openFeedbackButton = document.getElementById('open-feedback-modal-btn');
    const closeFeedbackButton = document.getElementById('feedback-modal-close');
    const feedbackForm = document.getElementById('feedback-testimonial-form');
    const feedbackTypeSelect = document.getElementById('feedback-type');
    const permissionGroup = document.querySelector('.permission-group'); // Specific class for the permission checkbox

    if (openFeedbackButton) {
        openFeedbackButton.addEventListener('click', () => {
            if (feedbackModal) {
                resetFormErrors('feedback-testimonial-form');
                document.getElementById('feedback-form-response').hidden = true; // Hide previous response
                feedbackForm.reset(); // Reset form fields
                if(permissionGroup) permissionGroup.hidden = true; // Hide permission by default
                feedbackModal.hidden = false;
                document.body.classList.add('modal-open');
            }
        });
    }

    if (closeFeedbackButton) {
        closeFeedbackButton.addEventListener('click', () => closeModal(feedbackModal));
    }

    // Show/hide permission checkbox based on feedback type
    if (feedbackTypeSelect && permissionGroup) {
        feedbackTypeSelect.addEventListener('change', function() {
            permissionGroup.hidden = this.value !== 'testimonial';
        });
    }

    // Handle feedback form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('feedback-testimonial-form');
            let isValid = true;

            // Validate Type
            const typeSelect = document.getElementById('feedback-type');
            const typeError = document.getElementById('feedback-type-error');
            if (!typeSelect.value) {
                typeError.textContent = 'Please select a type';
                typeError.style.display = 'block';
                typeSelect.classList.add('is-invalid');
                isValid = false;
            }

            // Validate Message
            const messageTextarea = document.getElementById('feedback-message');
            const messageError = document.getElementById('feedback-message-error');
            if (!messageTextarea.value.trim()) {
                messageError.textContent = 'Please enter your message';
                messageError.style.display = 'block';
                messageTextarea.classList.add('is-invalid');
                isValid = false;
            }

            if (isValid) {
                const name = document.getElementById('feedback-name').value.trim();
                const email = document.getElementById('feedback-email').value.trim();
                const permissionChecked = document.getElementById('feedback-permission')?.checked || false; // Safely check if element exists

                // Prepare and "send" data
                const formData = {
                    name: name,
                    email: email,
                    type: typeSelect.value,
                    message: messageTextarea.value.trim(),
                    permission: typeSelect.value === 'testimonial' ? permissionChecked : null // Only relevant for testimonials
                };
                console.log('Submitting Feedback:', formData); // Placeholder

                // Show success message
                const responseElement = document.getElementById('feedback-form-response');
                responseElement.textContent = 'Thank you for your feedback!';
                responseElement.classList.remove('form-error-msg'); // Ensure correct styling
                responseElement.classList.add('form-response-note');
                responseElement.hidden = false;

                // Reset form and hide permission group again
                this.reset();
                if(permissionGroup) permissionGroup.hidden = true;
                feedbackTypeSelect.value = ""; // Explicitly reset select

                // Optional: Auto-close modal after a delay
                // setTimeout(() => {
                //     closeModal(feedbackModal);
                // }, 3000);
            }
        });
    }

    // --- Coaching Interest Form ---
    const coachingForm = document.getElementById('coachingInterestForm');
    if (coachingForm) {
        coachingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('coachingInterestForm');
            const emailInput = document.getElementById('interest-email');
            const emailError = document.getElementById('interest-email-error');
            const responseElement = document.getElementById('interest-form-response');
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex

            if (email && emailRegex.test(email)) {
                // Prepare and "send" data
                console.log('Submitting Coaching Interest:', { email: email }); // Placeholder

                // Show success message
                responseElement.textContent = 'Thank you! We’ll notify you when coaching is available.';
                responseElement.classList.remove('form-error-msg');
                responseElement.classList.add('form-response-note');
                responseElement.hidden = false;

                // Reset form
                this.reset();
            } else {
                emailError.textContent = 'Please enter a valid email address';
                emailError.style.display = 'block';
                emailInput.classList.add('is-invalid');
                responseElement.hidden = true; // Hide response note if error occurs
            }
        });
    }


    // --- Financial Journey Path ---
    const journeyNodes = document.querySelectorAll('.journey-node');
    const journeyContents = document.querySelectorAll('.journey-content');
    if (journeyNodes.length > 0 && journeyContents.length > 0) {
        journeyNodes.forEach(node => {
            node.addEventListener('click', function() {
                const step = this.dataset.step;
                if (!step) return;

                // Update node active state
                journeyNodes.forEach(n => {
                    n.classList.remove('active');
                    n.setAttribute('aria-pressed', 'false'); // Update ARIA state
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true'); // Update ARIA state

                 // Highlight connectors based on active node (example logic)
                const activeIndex = Array.from(journeyNodes).indexOf(this);
                document.querySelectorAll('.journey-connector').forEach((connector, index) => {
                    // Clear previous activation classes
                    connector.classList.remove('activated', 'activating');
                    if (index < activeIndex) {
                        connector.previousElementSibling?.classList.add('activated'); // Mark node before connector
                        connector.classList.add('activated'); // Highlight passed connectors
                    } else if (index === activeIndex) {
                        connector.previousElementSibling?.classList.add('activated'); // Mark node before connector
                       // connector.classList.add('activating'); // Maybe style the current connector differently
                    }
                });
                 // Ensure last node also gets activated mark if selected
                if (activeIndex === journeyNodes.length - 1) {
                   this.classList.add('activated');
                }


                // Update content display
                journeyContents.forEach(content => {
                    content.classList.remove('active'); // Hide all
                    if (content.id === `journey-${step}`) {
                        content.classList.add('active'); // Show matching content
                    }
                });
            });

            // Add keyboard accessibility (Enter or Space to activate)
            node.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Prevent page scroll on space
                    this.click(); // Simulate click
                }
            });
        });

        // Initialize by activating the first node if needed
         if (!document.querySelector('.journey-node.active')) {
            journeyNodes[0]?.click(); // Activate the first one on load
         }
    }


    // --- Floating Action Button (FAB) ---
    if (fabContainer && fabButton && fabOptions) {
        fabButton.addEventListener('click', function() {
            const isExpanded = fabContainer.classList.toggle('active');
            this.setAttribute('aria-expanded', isExpanded);
            fabOptions.hidden = !isExpanded;
            // Optional: Focus management - move focus to first option when opened
            // if (isExpanded) {
            //    fabOptions.querySelector('a, button')?.focus();
            // }
        });

        // Close FAB if clicked outside (optional)
        document.addEventListener('click', function(e) {
            if (fabContainer.classList.contains('active') && !fabContainer.contains(e.target)) {
                fabContainer.classList.remove('active');
                fabButton.setAttribute('aria-expanded', 'false');
                fabOptions.hidden = true;
            }
        });
         // Close FAB if an option is clicked (optional)
         fabOptions.addEventListener('click', function(e) {
            if (e.target.closest('.fab-option')) {
                 fabContainer.classList.remove('active');
                 fabButton.setAttribute('aria-expanded', 'false');
                 fabOptions.hidden = true;
            }
         });
    }

    // --- Modal Global Close Handlers ---
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        // Close on click outside the modal content
        modal.addEventListener('click', function(e) {
            if (e.target === modal) { // Check if the click was directly on the overlay
                closeModal(modal);
            }
        });
    });

    // Close any open modal on Escape key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal-overlay:not([hidden])');
            if (openModal) {
                closeModal(openModal);
            }
        }
    });

}); // End DOMContentLoaded
