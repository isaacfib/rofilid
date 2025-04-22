// personal.js
'use strict';

// --- Quiz Data (Unchanged) ---
const introQuizQuestions = [
    // ... (Quiz questions data remains the same) ...
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
let quizDemographicsSubmitted = sessionStorage.getItem('quizDemographicsSubmitted') === 'true';

// --- DOM Element References (Cached) ---
let quizModal, demographicsModal, pdfModal, feedbackModal;
let fabContainer, fabButton, fabOptions;
let journeyPath, journeyNodes, journeyContents, journeyContentContainer;
let menuToggle, primaryNav; // Mobile Nav elements

// --- Utility Function to Reset Form Errors ---
function resetFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Clear text content of error messages
    const errorElements = form.querySelectorAll('.form-error-msg, .invalid-feedback');
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none'; // Hide specifically if using manual display logic
        el.classList.remove('d-block'); // Remove manual display class if used
    });

    // Remove is-invalid class from inputs/selects
    const invalidInputs = form.querySelectorAll('.is-invalid');
    invalidInputs.forEach(el => el.classList.remove('is-invalid'));

    // Also potentially reset visual state for fieldsets/radiogroups if needed
    const invalidFieldsets = form.querySelectorAll('.is-invalid-fieldset'); // Example class
    invalidFieldsets.forEach(el => el.classList.remove('is-invalid-fieldset'));
}

// --- Utility to Close Modals ---
function closeModal(modalElement) {
    if (modalElement && !modalElement.hidden) {
        modalElement.hidden = true;
        // Check if any other modals are open before removing the class
        const anyModalOpen = document.querySelector('.modal-overlay:not([hidden])');
        if (!anyModalOpen) {
            document.body.classList.remove('modal-open');
        }
        // Optional: Return focus to the button that opened the modal if stored
    }
}

// --- Show/Hide Feedback Helper ---
function showFeedback(inputElement, message, isError = true) {
    const feedbackElement = inputElement.closest('.form-group, fieldset')?.querySelector('.invalid-feedback, .form-error-msg');
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.style.display = 'block'; // Make sure it's visible
        // Optionally add a class for direct display control: feedbackElement.classList.add('d-block');
    }
    if (isError) {
        inputElement.classList.add('is-invalid');
        // For radio groups, maybe add to fieldset too?
        // inputElement.closest('fieldset')?.classList.add('is-invalid-fieldset');
    } else {
         inputElement.classList.remove('is-invalid');
        // inputElement.closest('fieldset')?.classList.remove('is-invalid-fieldset');
    }
}

// --- Quiz Functions ---
function startQuiz(categoryId) {
    // Ensure quizModal is defined
    quizModal = quizModal || document.getElementById('quiz-modal');
    if (!quizModal) {
        console.error("Quiz modal not found!");
        return;
    }

    currentQuestions = introQuizQuestions.filter(q => q.categoryId === parseInt(categoryId));
    if (currentQuestions.length === 0) {
        console.error('No questions found for category:', categoryId);
        alert('Sorry, couldn\'t find questions for this category.'); // User feedback
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

    // Reset visibility of result/prompt sections
    document.getElementById('quiz-modal-results').hidden = true;
    document.getElementById('quiz-modal-full-challenge-prompt').hidden = true;
    document.getElementById('quiz-modal-restart').hidden = true;
    document.getElementById('quiz-modal-close-results').hidden = true;
    document.getElementById('quiz-modal-feedback').hidden = true; // Hide feedback initially
    document.getElementById('quiz-modal-next').hidden = true; // Hide next button initially

    // Ensure question area is visible
    const questionArea = document.getElementById('quiz-modal-question-area') || document.getElementById('quiz-modal-question');
    if (questionArea) questionArea.hidden = false;
    const optionsArea = document.getElementById('quiz-modal-options');
    if (optionsArea) optionsArea.hidden = false;


    // Display the first question
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showQuizResults();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    // Try preferred ID first, fallback to old ID
    const questionElement = document.getElementById('quiz-modal-question') || document.getElementById('quiz-modal-question-area');
    const optionsElement = document.getElementById('quiz-modal-options');
    const feedbackElement = document.getElementById('quiz-modal-feedback');
    const nextButton = document.getElementById('quiz-modal-next');
    const progressElement = document.getElementById('quiz-modal-q-current');

    if (!questionElement || !optionsElement || !feedbackElement || !nextButton || !progressElement) {
        console.error("Required quiz elements not found for displaying question.");
        return;
    }

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
        optionButton.classList.add('btn', 'btn-outline', 'quiz-option');
        optionButton.textContent = option;
        optionButton.setAttribute('data-index', index);
        // ARIA roles handled by container role='radiogroup' if set, label is good
        optionButton.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
        optionButton.addEventListener('click', handleAnswerSelection);
        optionsElement.appendChild(optionButton);
    });

     // Ensure question area is visible if it was hidden
    questionElement.hidden = false;
}

function handleAnswerSelection(event) {
    const selectedButton = event.target.closest('.quiz-option');
    if (!selectedButton) return; // Click wasn't on a button

    const selectedIndex = parseInt(selectedButton.dataset.index);
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correctAnswerIndex;

    // Record answer
    userAnswers.push({ questionId: question.id, selected: selectedIndex, correct: isCorrect });
    if (isCorrect) {
        score++;
    }

    // Display feedback
    const feedbackElement = document.getElementById('quiz-modal-feedback');
    if (feedbackElement) {
        feedbackElement.textContent = isCorrect ? `Correct! ${question.explanation}` : `Incorrect. ${question.explanation}`;
        feedbackElement.classList.toggle('correct', isCorrect);
        feedbackElement.classList.toggle('incorrect', !isCorrect);
        feedbackElement.hidden = false;
    }

    // Show the 'Next Question' or 'Show Results' button
    const nextButton = document.getElementById('quiz-modal-next');
    if (nextButton) {
        nextButton.hidden = false;
         nextButton.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? "Show Results" : "Next Question";
         nextButton.focus(); // Focus the next button
    }


    // Disable all option buttons and highlight correct/incorrect
    const optionButtons = document.querySelectorAll('#quiz-modal-options .quiz-option');
    optionButtons.forEach(btn => {
        btn.disabled = true; // Disable after selection
        const buttonIndex = parseInt(btn.dataset.index);
        if (buttonIndex === question.correctAnswerIndex) {
            btn.classList.add('correct'); // Highlight correct answer
        } else if (buttonIndex === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect'); // Highlight selected incorrect answer
        }
        // Consider ARIA states like aria-pressed or aria-checked if using role=radio
        // selectedButton.setAttribute('aria-pressed', 'true'); // Indicate selection
    });
}

function showQuizResults() {
    const resultsElement = document.getElementById('quiz-modal-results');
    // Try preferred ID first, fallback to old ID for question area
    const questionArea = document.getElementById('quiz-modal-question') || document.getElementById('quiz-modal-question-area');
    const optionsArea = document.getElementById('quiz-modal-options');
    const feedbackArea = document.getElementById('quiz-modal-feedback');
    const nextButton = document.getElementById('quiz-modal-next');
    const restartButton = document.getElementById('quiz-modal-restart');
    const closeResultsButton = document.getElementById('quiz-modal-close-results');
    const fullChallengePrompt = document.getElementById('quiz-modal-full-challenge-prompt');

    // Ensure elements exist before manipulating
    if (!resultsElement || !questionArea || !optionsArea || !feedbackArea || !nextButton || !restartButton || !closeResultsButton || !fullChallengePrompt) {
        console.error("Required quiz elements not found for displaying results.");
        closeModal(quizModal); // Attempt to close modal if elements are missing
        return;
    }

    // Hide quiz elements
    questionArea.hidden = true;
    optionsArea.hidden = true;
    feedbackArea.hidden = true;
    nextButton.hidden = true;

    // Calculate results
    const totalQuestions = currentQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
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
        <p>You scored ${score} out of ${totalQuestions} (${percentage}%).</p>
        <p>${message}</p>
    `; // Using textContent might be safer if results included dynamic/unsafe HTML

    // Determine next steps
    const nextCategoryId = parseInt(currentCategoryId) + 1;
    const nextCategory = introQuizQuestions.find(q => q.categoryId === nextCategoryId);

    if (nextCategory) {
        const nextCategoryName = nextCategory.category;
        // Add button to start next quiz
        resultsElement.innerHTML += `
            <p class="mt-lg">Continue your learning journey with the next check:</p>
            <button type="button" class="btn btn-primary btn-small btn-icon" onclick="handleQuizStart(${nextCategoryId})">
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

    // Ensure demographics modal is defined
    demographicsModal = demographicsModal || document.getElementById('quiz-demographics-modal');
    if (!demographicsModal) {
        console.error("Demographics modal not found!");
        startQuiz(categoryId); // Start quiz directly if modal missing
        return;
    }

    if (!quizDemographicsSubmitted) {
        // Show demographics modal
        resetFormErrors('quiz-demographics-form'); // Reset errors before showing
        document.getElementById('quiz-demographics-form').reset(); // Reset form fields
        demographicsModal.hidden = false;
        document.body.classList.add('modal-open');
        // Focus the first input for accessibility
        demographicsModal.querySelector('input, select, textarea')?.focus();
    } else {
        // Demographics already submitted, start quiz directly
        startQuiz(categoryId);
    }
}

// --- Financial Journey Path Functions ---

function activateJourneyStep(step) {
    if (!journeyNodes || !journeyContents) return; // Exit if elements aren't ready

    journeyNodes.forEach((node, index) => {
        const isCurrent = node.dataset.step === step;
        node.classList.toggle('active', isCurrent);
        node.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        node.setAttribute('tabindex', isCurrent ? '0' : '-1');

        // Logic for 'activated' (past steps) - applies to the node itself
        // Assumes nodes are in order in the DOM
        const currentIndex = Array.from(journeyNodes).findIndex(n => n.dataset.step === step);
        if (index <= currentIndex) {
            node.classList.add('activated');
        } else {
            node.classList.remove('activated');
        }
    });

    // Activate corresponding content panel
    journeyContents.forEach(content => {
        const contentId = `journey-${step}`;
        const isActive = content.id === contentId;
        content.hidden = !isActive; // Use hidden attribute
        content.classList.toggle('active', isActive);
    });
}

// Function to handle Journey node click
function handleJourneyNodeClick(event) {
    const targetNode = event.currentTarget; // The clicked journey-node
    const step = targetNode.dataset.step;
    if (step) {
        activateJourneyStep(step);
        // Optional: Scroll content into view if needed
        journeyContentContainer?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Intersection Observer for Journey Auto-Advance
function setupJourneyObserver() {
    journeyPath = journeyPath || document.querySelector('.journey-path'); // Make sure this exists
    if (!journeyPath || typeof IntersectionObserver !== 'function') return; // Requires observer support

     const sectionsToObserve = [
         { id: 'financial-journey', step: 'awareness' }, // Default start or map to actual first section
         { id: 'free-resources', step: 'understanding' }, // Example mapping
         { id: 'learning-hub', step: 'understanding' }, // Map to relevant step
         { id: 'free-tools', step: 'organization' },
         { id: 'financial-tools-promo', step: 'action'}, // Map calculator promo
         { id: 'personal-coaching', step: 'growth' }
         // Add other relevant section IDs and map them to journey steps
     ];

     const observerOptions = {
         root: null, // Observe relative to viewport
         rootMargin: "-40% 0px -50% 0px", // Trigger when section is near center
         threshold: 0.01 // Needs to be slightly visible
     };

     const journeyObserver = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 const targetSectionId = entry.target.id;
                 const mapping = sectionsToObserve.find(s => s.id === targetSectionId);
                 if (mapping && mapping.step) {
                      // Only activate if the current node isn't already the target or further along
                      const currentActiveNode = journeyPath.querySelector('.journey-node.active');
                      const currentActiveIndex = currentActiveNode ? Array.from(journeyNodes).indexOf(currentActiveNode) : -1;
                      const targetNode = journeyPath.querySelector(`.journey-node[data-step="${mapping.step}"]`);
                      const targetIndex = targetNode ? Array.from(journeyNodes).indexOf(targetNode) : -1;

                      // Check if the new target is further ahead than current activation
                      // Prevents scrolling up from de-activating later stages
                      if (targetIndex >= 0 && targetIndex > currentActiveIndex) {
                         activateJourneyStep(mapping.step);
                      }
                      // Handle activating the *first* step if nothing is active yet
                       else if (targetIndex >=0 && currentActiveIndex < 0) {
                            activateJourneyStep(mapping.step);
                       }
                 }
             }
         });
     }, observerOptions);

    // Observe the target sections
    sectionsToObserve.forEach(sectionInfo => {
        const sectionElement = document.getElementById(sectionInfo.id);
        if (sectionElement) {
            journeyObserver.observe(sectionElement);
        }
    });
}

// --- Helper to open feedback modal (reusable) ---
function openFeedbackModal() {
    feedbackModal = feedbackModal || document.getElementById('feedback-modal');
    if (feedbackModal) {
        resetFormErrors('feedback-testimonial-form');
        document.getElementById('feedback-form-response').hidden = true;
        feedbackForm.reset(); // Reset form fields
        const permissionGroup = feedbackModal.querySelector('.permission-group');
        if (permissionGroup) permissionGroup.hidden = true; // Hide permission by default
        feedbackModal.hidden = false;
        document.body.classList.add('modal-open');
        feedbackModal.querySelector('select, input, textarea')?.focus();
    } else {
        console.error("Feedback modal not found.");
    }
}


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', function() {

    // --- Cache Global DOM Elements ---
    quizModal = document.getElementById('quiz-modal');
    demographicsModal = document.getElementById('quiz-demographics-modal');
    pdfModal = document.getElementById('pdf-download-modal');
    feedbackModal = document.getElementById('feedback-modal');
    fabContainer = document.querySelector('.floating-action-btn');
    fabButton = document.querySelector('.fab-main');
    fabOptions = document.getElementById('fab-options-list'); // Use ID
    menuToggle = document.querySelector('.mobile-menu-toggle');
    primaryNav = document.getElementById('primary-navigation');
    // Journey Path Elements
    journeyPath = document.querySelector('.journey-path');
    journeyNodes = document.querySelectorAll('.journey-node');
    journeyContents = document.querySelectorAll('.journey-content');
    journeyContentContainer = document.querySelector('.journey-content-container');

    // --- General UI Enhancements ---

    // Update Current Year in Footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Scroll Animations Setup (using IntersectionObserver)
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger > *');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    scrollObserver.unobserve(entry.target); // Optional: stop observing
                }
            });
        }, { rootMargin: '0px 0px -10% 0px' }); // Trigger slightly before fully visible

        revealElements.forEach(el => scrollObserver.observe(el));
    }

    // Form Submit Ripple Effect (Unchanged)
    const submitButtons = document.querySelectorAll('.form-submit-btn');
    submitButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const existingRipple = button.querySelector('.btn-ripple');
            if(existingRipple) existingRipple.remove();
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });

    // --- Mobile Navigation ---
    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            primaryNav.classList.toggle('active');
            menuToggle.classList.toggle('active');
            document.body.classList.toggle('modal-open', !isExpanded); // Toggle body scroll lock
             // Focus management for mobile nav (optional)
             if (!isExpanded) {
                primaryNav.querySelector('a')?.focus(); // Focus first link when opened
             } else {
                menuToggle.focus(); // Return focus to toggle button when closed
             }
        });
        // Close menu when a link is clicked
        primaryNav.addEventListener('click', (e) => {
           if (e.target.matches('a') && primaryNav.classList.contains('active')) { // Check if nav is active
               menuToggle.setAttribute('aria-expanded', 'false');
               primaryNav.classList.remove('active');
               menuToggle.classList.remove('active');
               document.body.classList.remove('modal-open');
           }
        });
    }


    // --- Quiz Related Listeners ---

    // Start Quiz Buttons (Category Cards)
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
             if (currentQuestionIndex < currentQuestions.length - 1) {
                currentQuestionIndex++;
                 displayQuestion();
             } else {
                 // If it's the last question, the button text is "Show Results"
                 // and clicking it now shows the results
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

    // --- Quiz Demographics Form Validation ---
    const demographicsForm = document.getElementById('quiz-demographics-form');
    if (demographicsForm) {
        demographicsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('quiz-demographics-form');
            let isValid = true;

            // Validate Country (Text Input)
            const countryInput = document.getElementById('quiz-country');
            if (!countryInput.value.trim()) {
                 showFeedback(countryInput, 'Please enter your country');
                 isValid = false;
             } else {
                 countryInput.classList.remove('is-invalid');
            }

            // Validate City (Text Input)
            const cityInput = document.getElementById('quiz-city');
             if (!cityInput.value.trim()) {
                 showFeedback(cityInput, 'Please enter your city');
                 isValid = false;
             } else {
                cityInput.classList.remove('is-invalid');
            }

             // Validate Radio Button Selection
             const takenBeforeRadios = demographicsForm.querySelectorAll('input[name="taken_before"]');
             const takenBeforeChecked = demographicsForm.querySelector('input[name="taken_before"]:checked');
             const takenErrorElement = document.getElementById('quiz-taken-error'); // The error span

             if (!takenBeforeChecked) {
                 takenErrorElement.textContent = 'Please select an option';
                 takenErrorElement.style.display = 'block';
                 // Add invalid class to radios/fieldset for visual cue if desired
                 takenBeforeRadios.forEach(radio => radio.classList.add('is-invalid'));
                 isValid = false;
             } else {
                 takenErrorElement.textContent = ''; // Clear error message
                 takenErrorElement.style.display = 'none';
                 takenBeforeRadios.forEach(radio => radio.classList.remove('is-invalid'));
            }


            if (isValid) {
                quizDemographicsSubmitted = true;
                sessionStorage.setItem('quizDemographicsSubmitted', 'true');

                const formData = {
                    country: countryInput.value.trim(),
                    city: cityInput.value.trim(),
                    taken_before: takenBeforeChecked.value
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
            } else {
                // Focus the first invalid field for accessibility
                demographicsForm.querySelector('.is-invalid')?.focus();
            }
        });
    }

    // Close Demographics Button Listener
    const closeDemographicsButton = document.getElementById('quiz-demographics-close');
    if (closeDemographicsButton) {
        closeDemographicsButton.addEventListener('click', () => closeModal(demographicsModal));
    }


    // --- PDF Download Functionality ---
    const pdfDownloadForm = document.getElementById('pdf-download-form');
    if (pdfDownloadForm) {
         const closePdfButton = document.getElementById('pdf-download-close');

         // Open Modal Listener (using event delegation on main content)
         document.getElementById('main-content').addEventListener('click', function(e){
             const pdfButton = e.target.closest('.get-pdf-btn');
             if(pdfButton){
                const templateKey = pdfButton.dataset.templateKey;
                const templateKeyInput = document.getElementById('pdf-template-key');
                if (templateKey && templateKeyInput && pdfModal) {
                    templateKeyInput.value = templateKey;
                    resetFormErrors('pdf-download-form'); // Reset before showing
                    pdfDownloadForm.reset();
                    pdfModal.hidden = false;
                    document.body.classList.add('modal-open');
                     pdfModal.querySelector('input, select, textarea')?.focus();
                } else {
                    console.error("PDF download setup error: Missing elements or key.");
                }
            }
         });

         // Form Submission Listener
        pdfDownloadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('pdf-download-form');
            let isValid = true;
            const templateKeyInput = document.getElementById('pdf-template-key');
            const countryInput = document.getElementById('pdf-country');
            const cityInput = document.getElementById('pdf-city');

            // Validate Country
            if (!countryInput.value.trim()) {
                 showFeedback(countryInput, 'Please enter your country');
                 isValid = false;
            } else {
                countryInput.classList.remove('is-invalid');
            }
             // Validate City
             if (!cityInput.value.trim()) {
                showFeedback(cityInput, 'Please enter your city');
                 isValid = false;
             } else {
                cityInput.classList.remove('is-invalid');
            }

            if (isValid) {
                const templateKey = templateKeyInput.value;
                const formData = {
                    country: countryInput.value.trim(),
                    city: cityInput.value.trim(),
                    template: templateKey
                };
                console.log('PDF Download Data:', formData); // Placeholder for sending data

                // --- Trigger PDF download ---
                // IMPORTANT: Adjust the path relative to the *HTML file location*
                const pdfUrl = `../../assets/pdfs/${templateKey}.pdf`;
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `${templateKey}_template.pdf`; // Set a default download filename

                // Append, click, and remove the link
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                // --- End PDF download ---

                // Close modal
                closeModal(pdfModal);
                pdfDownloadForm.reset(); // Reset form fields
            } else {
                pdfDownloadForm.querySelector('.is-invalid')?.focus();
            }
        });

         // Close Modal Button
        if (closePdfButton) {
            closePdfButton.addEventListener('click', () => closeModal(pdfModal));
        }
    } // End PDF Download Form logic


    // --- Spreadsheet Button Placeholder ---
    document.getElementById('main-content').addEventListener('click', function(e){
        const spreadsheetButton = e.target.closest('.get-spreadsheet-btn');
        if(spreadsheetButton){
            const templateName = spreadsheetButton.dataset.templateName;
            const price = spreadsheetButton.dataset.price;
            console.log(`Spreadsheet requested: ${templateName}, Price: ${price}`);
            // Placeholder for potential payment gateway integration or redirection
            alert(`Interactive Spreadsheet (${templateName}) coming soon! (Placeholder: Price ${price || 'N/A'} NGN)`);
        }
    });


    // --- Feedback Modal ---
    const feedbackForm = document.getElementById('feedback-testimonial-form');
    if (feedbackForm) {
        const openFeedbackButton = document.getElementById('open-feedback-modal-btn');
        const fabOpenFeedbackButton = document.getElementById('fab-open-feedback-btn'); // Button in FAB
        const footerOpenFeedbackButton = document.getElementById('footer-open-feedback-btn'); // Button in footer
        const closeFeedbackButton = document.getElementById('feedback-modal-close');
        const feedbackTypeSelect = document.getElementById('feedback-type');
        const permissionGroup = feedbackForm.querySelector('.permission-group');
        const responseElement = document.getElementById('feedback-form-response');

        // Open Modal Listeners
        if (openFeedbackButton) openFeedbackButton.addEventListener('click', openFeedbackModal);
        if (fabOpenFeedbackButton) fabOpenFeedbackButton.addEventListener('click', openFeedbackModal);
        if (footerOpenFeedbackButton) footerOpenFeedbackButton.addEventListener('click', openFeedbackModal);

        // Close Modal Listener
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
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('feedback-testimonial-form');
            let isValid = true;

            // Validate Type
            if (!feedbackTypeSelect.value) {
                showFeedback(feedbackTypeSelect, 'Please select a type');
                 isValid = false;
            } else {
                 feedbackTypeSelect.classList.remove('is-invalid');
            }

            // Validate Message
            const messageTextarea = document.getElementById('feedback-message');
             if (!messageTextarea.value.trim()) {
                 showFeedback(messageTextarea, 'Please enter your message');
                 isValid = false;
             } else {
                messageTextarea.classList.remove('is-invalid');
            }

             // Validate Email (Optional - simple check if provided)
             const emailInput = document.getElementById('feedback-email');
             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
             if (emailInput.value.trim() && !emailRegex.test(emailInput.value.trim())) {
                 showFeedback(emailInput, 'Please enter a valid email address');
                 isValid = false;
             } else {
                 emailInput.classList.remove('is-invalid');
             }


            if (isValid) {
                const name = document.getElementById('feedback-name').value.trim();
                const permissionChecked = document.getElementById('feedback-permission')?.checked || false;

                const formData = {
                    name: name || 'Anonymous',
                    email: emailInput.value.trim() || null,
                    type: feedbackTypeSelect.value,
                    message: messageTextarea.value.trim(),
                    permission: feedbackTypeSelect.value === 'testimonial' ? permissionChecked : null
                };
                console.log('Submitting Feedback:', formData); // Placeholder for sending data

                // Show success message
                responseElement.textContent = 'Thank you for your feedback!';
                responseElement.className = 'form-response-note mt-md text-center'; // Set success classes
                responseElement.hidden = false;

                this.reset();
                if (permissionGroup) permissionGroup.hidden = true;
                feedbackTypeSelect.value = ""; // Explicitly reset select

                 // Optional: Auto-close modal after a delay
                 setTimeout(() => {
                     if (feedbackModal && !feedbackModal.hidden) { // Check if modal is still open
                         closeModal(feedbackModal);
                         responseElement.hidden = true; // Hide message on close
                     }
                 }, 3000);

            } else {
                responseElement.hidden = true; // Hide response note if validation fails
                feedbackForm.querySelector('.is-invalid')?.focus();
            }
        });
    } // End Feedback Form logic

    // --- Coaching Interest Form ---
    const coachingForm = document.getElementById('coachingInterestForm');
    if (coachingForm) {
        coachingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('coachingInterestForm');
            const emailInput = document.getElementById('interest-email');
            const responseElement = document.getElementById('interest-form-response');
            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex

             if (!email || !emailRegex.test(email)) {
                 showFeedback(emailInput, 'Please enter a valid email address');
                 responseElement.hidden = true;
            } else {
                emailInput.classList.remove('is-invalid');
                console.log('Submitting Coaching Interest:', { email: email }); // Placeholder for sending data

                // Show success message
                responseElement.textContent = 'Thank you! We’ll notify you when coaching is available.';
                 responseElement.className = 'form-response-note mt-md'; // Reset classes
                 responseElement.hidden = false;

                this.reset();
            }
        });
    }


    // --- Financial Journey Path Initialization ---
    if (journeyNodes && journeyNodes.length > 0 && journeyContents.length > 0) {
        // Add click listeners to nodes
        journeyNodes.forEach(node => {
            node.addEventListener('click', handleJourneyNodeClick);
            // Add keyboard accessibility (Enter or Space to activate)
             node.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault(); // Prevent page scroll on space
                    handleJourneyNodeClick(e); // Trigger the activation
                }
             });
        });

         // Activate the first step initially if needed
         const initialActiveStep = journeyNodes[0]?.dataset.step;
         if (initialActiveStep && !journeyPath.querySelector('.journey-node.active')) {
             activateJourneyStep(initialActiveStep);
         }

         // Set up the IntersectionObserver for auto-advancing
         setupJourneyObserver();

    } // End Journey Path Initialization


    // --- Floating Action Button (FAB) ---
    if (fabContainer && fabButton && fabOptions) {
        fabButton.addEventListener('click', function() {
            const isExpanded = fabContainer.classList.toggle('active');
            fabButton.setAttribute('aria-expanded', isExpanded);
            // CSS handles visibility/pointer-events with the .active class now
            if (isExpanded) {
               fabOptions.querySelector('a, button')?.focus(); // Focus first item
            }
        });

        // Close FAB if an option is clicked or Esc key pressed
        fabOptions.addEventListener('click', function(e) {
            if (e.target.closest('.fab-option, .fab-option button')) {
                fabContainer.classList.remove('active');
                fabButton.setAttribute('aria-expanded', 'false');
                 fabButton.focus(); // Return focus to main button
            }
        });

        document.addEventListener('keydown', function(e) {
           if (e.key === 'Escape' && fabContainer.classList.contains('active')) {
               fabContainer.classList.remove('active');
               fabButton.setAttribute('aria-expanded', 'false');
               fabButton.focus();
           }
        });

        // Close FAB if clicked outside (careful with event bubbling)
         document.addEventListener('click', function(e) {
             if (fabContainer.classList.contains('active') && !fabContainer.contains(e.target)) {
                 fabContainer.classList.remove('active');
                 fabButton.setAttribute('aria-expanded', 'false');
                 // No focus change needed here, keep focus where the user clicked
            }
        });
    } // End FAB logic


    // --- Modal Global Close Handlers ---
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        // Close on click OUTSIDE the modal content (on the overlay itself)
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
                 // Optional: Return focus to the trigger element if known
                 // const trigger = document.querySelector(`[aria-controls="${openModal.id}"][aria-expanded="true"]`); // Example finder
                 // if (trigger) trigger.focus();
            }
            // Also close FAB if escape is pressed
            else if (fabContainer && fabContainer.classList.contains('active')) {
                 fabContainer.classList.remove('active');
                 fabButton.setAttribute('aria-expanded', 'false');
                 fabButton.focus();
            }
             // Also close mobile nav if open
             else if (primaryNav && primaryNav.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                primaryNav.classList.remove('active');
                menuToggle.classList.remove('active');
                document.body.classList.remove('modal-open');
                menuToggle.focus();
            }
        }
    });

}); // --- End DOMContentLoaded ---
