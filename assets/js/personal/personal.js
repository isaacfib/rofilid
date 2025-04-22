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
let isJourneyObserverActive = false; // Flag to prevent multiple setups
let journeyNodeList = []; // Store node elements as an array

// --- Utility Function to Reset Form Errors ---
function resetFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const errorElements = form.querySelectorAll('.form-error-msg, .invalid-feedback');
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none'; // Hide error message
        el.classList.remove('d-block'); // Remove Bootstrap display class if used
    });

    const invalidInputs = form.querySelectorAll('.is-invalid');
    invalidInputs.forEach(el => el.classList.remove('is-invalid'));

    // Also reset radio/checkbox container states if necessary
    const invalidChecks = form.querySelectorAll('.is-invalid-check-group'); // Example class for fieldset/div
    invalidChecks.forEach(el => el.classList.remove('is-invalid-check-group'));
}


// --- Utility to Close Modals ---
function closeModal(modalElement) {
    if (modalElement && !modalElement.hidden) {
        modalElement.hidden = true;
        const anyModalOpen = document.querySelector('.modal-overlay:not([hidden])');
        if (!anyModalOpen) {
            document.body.classList.remove('modal-open');
        }
        // Consider returning focus to the trigger button if implemented
    }
}

// --- Show/Hide Feedback Helper ---
function showFeedback(inputElement, message, isError = true) {
    // Find the sibling or container-based feedback element more robustly
    let feedbackElement = null;
    if (inputElement) {
        feedbackElement = inputElement.closest('.form-group, fieldset')?.querySelector('.invalid-feedback, .form-error-msg') || inputElement.nextElementSibling;
        // Special case for radio group where error msg might be direct child of fieldset
        if (!feedbackElement && inputElement.type === 'radio' && inputElement.closest('fieldset')) {
            feedbackElement = inputElement.closest('fieldset').querySelector('.invalid-feedback, .form-error-msg');
        }
    }


    if (feedbackElement && (feedbackElement.classList.contains('invalid-feedback') || feedbackElement.classList.contains('form-error-msg'))) {
        feedbackElement.textContent = message;
        feedbackElement.style.display = message ? 'block' : 'none'; // Show only if message exists
        feedbackElement.classList.toggle('d-block', !!message); // Use Bootstrap class if needed
    }

    if (inputElement) { // Check if inputElement exists before modifying
        if (isError) {
            inputElement.classList.add('is-invalid');
            // For radio/checkbox, maybe add error state to the label or parent group
            if (inputElement.type === 'radio' || inputElement.type === 'checkbox') {
                inputElement.closest('.form-check')?.querySelector('.form-check-label')?.classList.add('text-danger');
                // Or add to parent fieldset/div if grouped
                inputElement.closest('fieldset, .radio-group')?.classList.add('is-invalid-check-group'); // Use specific class
            }
        } else {
            inputElement.classList.remove('is-invalid');
            if (inputElement.type === 'radio' || inputElement.type === 'checkbox') {
               inputElement.closest('.form-check')?.querySelector('.form-check-label')?.classList.remove('text-danger');
               inputElement.closest('fieldset, .radio-group')?.classList.remove('is-invalid-check-group');
            }
            // Keep feedback hidden if no error
             if (feedbackElement && !message) {
                feedbackElement.style.display = 'none';
                feedbackElement.classList.remove('d-block');
             }
        }
    }
}


// --- Quiz Functions ---
function startQuiz(categoryId) {
    quizModal = quizModal || document.getElementById('quiz-modal');
    if (!quizModal) {
        console.error("Quiz modal not found! Cannot start quiz.");
        return;
    }

    const categoryIdNum = parseInt(categoryId);
    currentQuestions = introQuizQuestions.filter(q => q.categoryId === categoryIdNum);

    if (currentQuestions.length === 0) {
        console.error(`No questions found for category ID: ${categoryIdNum}`);
        alert('Sorry, questions for this category are currently unavailable.');
        return;
    }

    // Reset state
    currentCategoryId = categoryIdNum;
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;

    quizModal.hidden = false;
    document.body.classList.add('modal-open');

    const titleEl = document.getElementById('quiz-modal-title');
    const qTotalEl = document.getElementById('quiz-modal-q-total');
    const resultsEl = document.getElementById('quiz-modal-results');
    const promptEl = document.getElementById('quiz-modal-full-challenge-prompt');
    const restartBtn = document.getElementById('quiz-modal-restart');
    const closeResultsBtn = document.getElementById('quiz-modal-close-results');
    const feedbackAreaEl = document.getElementById('quiz-modal-feedback');
    const nextBtnEl = document.getElementById('quiz-modal-next');
    const questionArea = document.getElementById('quiz-modal-question') || document.getElementById('quiz-modal-question-area'); // Preferred ID first
    const optionsArea = document.getElementById('quiz-modal-options');

    // Check required elements before proceeding
    if (!titleEl || !qTotalEl || !resultsEl || !promptEl || !restartBtn || !closeResultsBtn || !feedbackAreaEl || !nextBtnEl || !questionArea || !optionsArea) {
        console.error("One or more required elements inside the quiz modal are missing.");
        closeModal(quizModal);
        return;
    }

    titleEl.textContent = currentQuestions[0]?.category || 'Quiz';
    qTotalEl.textContent = currentQuestions.length;

    resultsEl.hidden = true;
    promptEl.hidden = true;
    restartBtn.hidden = true;
    closeResultsBtn.hidden = true;
    feedbackAreaEl.hidden = true;
    nextBtnEl.hidden = true;
    questionArea.hidden = false;
    optionsArea.hidden = false;
    optionsArea.innerHTML = ''; // Clear any previous options

    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showQuizResults();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    const questionElement = document.getElementById('quiz-modal-question') || document.getElementById('quiz-modal-question-area');
    const optionsElement = document.getElementById('quiz-modal-options');
    const feedbackElement = document.getElementById('quiz-modal-feedback');
    const nextButton = document.getElementById('quiz-modal-next');
    const progressElement = document.getElementById('quiz-modal-q-current');

    if (!questionElement || !optionsElement || !feedbackElement || !nextButton || !progressElement) {
        console.error("Required quiz elements missing for displaying question:", currentQuestionIndex);
        return;
    }

    progressElement.textContent = currentQuestionIndex + 1;
    questionElement.textContent = question.question;
    optionsElement.innerHTML = ''; // Clear previous options
    optionsElement.hidden = false;
    feedbackElement.hidden = true; // Hide feedback until answer
    nextButton.hidden = true; // Hide next button until answer
    questionElement.hidden = false;

    // ARIA setup for the group
    questionElement.id = questionElement.id || 'quiz-modal-question'; // Ensure ID exists
    optionsElement.setAttribute('role', 'radiogroup');
    optionsElement.setAttribute('aria-labelledby', questionElement.id);

    question.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        optionButton.classList.add('btn', 'btn-outline', 'quiz-option');
        optionButton.textContent = option;
        optionButton.setAttribute('data-index', index.toString());
        // Individual options don't need role=radio if inside radiogroup
        // Labeling is good practice
        optionButton.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
        optionButton.addEventListener('click', handleAnswerSelection);
        optionsElement.appendChild(optionButton);
    });
}

function handleAnswerSelection(event) {
    const selectedButton = event.target.closest('.quiz-option');
    if (!selectedButton || selectedButton.disabled) return;

    const selectedIndex = parseInt(selectedButton.dataset.index);
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correctAnswerIndex;

    userAnswers.push({ questionId: question.id, selected: selectedIndex, correct: isCorrect });
    if (isCorrect) {
        score++;
    }

    const feedbackElement = document.getElementById('quiz-modal-feedback');
    const nextButton = document.getElementById('quiz-modal-next');
    const optionButtons = document.querySelectorAll('#quiz-modal-options .quiz-option');

    if (feedbackElement) {
        feedbackElement.innerHTML = isCorrect ? `<strong>Correct!</strong> ${question.explanation}` : `<strong>Incorrect.</strong> ${question.explanation}`; // Use innerHTML for bold tag
        feedbackElement.className = 'quiz-feedback p-md border rounded mb-lg'; // Reset classes
        feedbackElement.classList.add(isCorrect ? 'correct' : 'incorrect');
        feedbackElement.hidden = false;
    }

    if (nextButton) {
        nextButton.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? "Show Results" : "Next Question";
        nextButton.hidden = false;
        setTimeout(() => nextButton.focus(), 100); // Add slight delay before focus
    }

    optionButtons.forEach(btn => {
        btn.disabled = true;
        const buttonIndex = parseInt(btn.dataset.index);
        if (buttonIndex === question.correctAnswerIndex) {
            btn.classList.add('correct');
        } else if (buttonIndex === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });
}

function showQuizResults() {
    const resultsElement = document.getElementById('quiz-modal-results');
    const questionArea = document.getElementById('quiz-modal-question') || document.getElementById('quiz-modal-question-area');
    const optionsArea = document.getElementById('quiz-modal-options');
    const feedbackArea = document.getElementById('quiz-modal-feedback');
    const nextButton = document.getElementById('quiz-modal-next');
    const restartButton = document.getElementById('quiz-modal-restart');
    const closeResultsButton = document.getElementById('quiz-modal-close-results');
    const fullChallengePrompt = document.getElementById('quiz-modal-full-challenge-prompt');

    if (!resultsElement || !questionArea || !optionsArea || !feedbackArea || !nextButton || !restartButton || !closeResultsButton || !fullChallengePrompt) {
        console.error("Required quiz elements missing for displaying results.");
        if (quizModal) closeModal(quizModal);
        return;
    }

    questionArea.hidden = true;
    optionsArea.hidden = true;
    feedbackArea.hidden = true;
    nextButton.hidden = true;

    const totalQuestions = currentQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    let message = '';
    if (percentage >= 80) {
        message = 'Excellent! You have a strong understanding.';
    } else if (percentage >= 60) {
        message = 'Good job! Keep building on your knowledge.';
    } else {
        message = 'Keep practicing! Review the concepts and try again.';
    }

    // Sanitize content or use textContent if there's any risk of injection
    resultsElement.innerHTML = `
        <h4>Quiz Complete!</h4>
        <p>You scored ${score} out of ${totalQuestions} (${percentage}%).</p>
        <p>${message}</p>
    `;

    const nextCategoryId = currentCategoryId + 1; // Find next category ID
    // Check if next category actually exists in the list
    const nextCategoryExists = introQuizQuestions.some(q => q.categoryId === nextCategoryId);

    // Remove previous "next quiz" button if it exists
    const oldNextQuizButton = resultsElement.querySelector('.next-quiz-button');
    if(oldNextQuizButton) oldNextQuizButton.remove();

    if (nextCategoryExists) {
        // Find category name safely
        const nextCategory = introQuizQuestions.find(q => q.categoryId === nextCategoryId);
        const nextCategoryName = nextCategory?.category || `Check ${nextCategoryId}`;

        // Create and add button for next quiz
        const nextQuizButton = document.createElement('button');
        nextQuizButton.type = 'button';
        nextQuizButton.classList.add('btn', 'btn-primary', 'btn-small', 'btn-icon', 'mt-lg', 'next-quiz-button'); // Add class to identify
        nextQuizButton.innerHTML = `<i class="fas fa-arrow-right" aria-hidden="true"></i> Take ${nextCategoryName} Check`;
        nextQuizButton.onclick = () => handleQuizStart(nextCategoryId); // Direct call is okay here
        resultsElement.innerHTML += `<p class="mt-lg">Continue your learning journey with the next check:</p>`;
        resultsElement.appendChild(nextQuizButton);

        fullChallengePrompt.hidden = true; // Hide full challenge prompt if there's a next quiz
    } else {
        fullChallengePrompt.hidden = false; // Show full challenge prompt if no next quiz
        resultsElement.innerHTML += `
            <p class="mt-lg">You've completed all the introductory checks!</p>
        `;
    }

    resultsElement.hidden = false;
    restartButton.hidden = false;
    closeResultsButton.hidden = false;

    // Focus restart button for easier flow
    restartButton.focus();
}

function handleQuizStart(categoryId) {
    sessionStorage.setItem('selectedQuizCategory', categoryId.toString());

    demographicsModal = demographicsModal || document.getElementById('quiz-demographics-modal');

    if (!demographicsModal) {
        console.warn("Demographics modal not found, starting quiz directly.");
        startQuiz(categoryId);
        return;
    }

    if (!quizDemographicsSubmitted) {
        resetFormErrors('quiz-demographics-form');
        const form = document.getElementById('quiz-demographics-form');
        if (form) form.reset();
        demographicsModal.hidden = false;
        document.body.classList.add('modal-open');
        demographicsModal.querySelector('input, select, textarea')?.focus();
    } else {
        startQuiz(categoryId);
    }
}

// --- Financial Journey Path Functions ---

function activateJourneyStep(step) {
    // Use cached nodeList, or query if not available
    const currentNodes = journeyNodeList.length > 0 ? journeyNodeList : document.querySelectorAll('.journey-node');
    const currentContents = journeyContents || document.querySelectorAll('.journey-content'); // Cache contents if not done
    journeyContents = currentContents; // Update global cache

    if (currentNodes.length === 0 || !currentContents || currentContents.length === 0 || !journeyPath) {
         console.warn("Journey path nodes, contents or main path element not available for activation.");
         return;
    }

    let activeIndex = -1;
    let foundActive = false;

    // Update nodes (visual state and accessibility)
    currentNodes.forEach((node, index) => {
        const nodeStep = node.dataset.step;
        const isCurrent = nodeStep === step;
        node.classList.toggle('active', isCurrent);
        node.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        node.setAttribute('tabindex', isCurrent ? '0' : '-1');

        if (isCurrent) {
            activeIndex = index;
            foundActive = true;
            // Focus the newly active node (useful for keyboard nav / clicks)
            // Use setTimeout to ensure styles applied before focus attempt
             setTimeout(() => node.focus({ preventScroll: true }), 50); // preventScroll useful for auto-advance
        }

        // Set 'activated' class for current and preceding nodes
        node.classList.toggle('activated', index <= activeIndex);
    });

     // If no specific step matched (e.g., during initial load or error), maybe default to first?
     if (!foundActive && currentNodes.length > 0) {
         console.warn(`Step "${step}" not found or invalid.`);
         // Avoid recursive activation or unexpected defaults. Log warning is enough.
         return;
     }

    // Update progress bar (both horizontal and vertical via CSS variable)
    const totalNodes = currentNodes.length;
    const progressPercent = totalNodes > 1 ? (activeIndex / (totalNodes - 1)) * 100 : (activeIndex >= 0 ? 100 : 0); // Handle edge case of 1 node

    // Apply progress to horizontal connectors (already handled by 'activated' class and CSS)

    // Apply progress to vertical connector via CSS variable
     if (journeyPath) {
        journeyPath.style.setProperty('--journey-progress-height', `${progressPercent}%`);
    }


    // Activate corresponding content panel
    let contentFound = false;
    currentContents.forEach(content => {
        const contentId = `journey-${step}`; // Construct the target content ID
        const isActive = content.id === contentId;
        content.hidden = !isActive; // Use hidden attribute
        if (isActive) {
            contentFound = true;
            // Announce the change to screen readers if the content changes
             // This requires a live region element in the HTML (e.g., <div aria-live="polite" id="journey-announce"></div>)
             // const announcer = document.getElementById('journey-announce');
             // if (announcer) announcer.textContent = `Showing content for ${step}`;
        }
    });
     if (!contentFound) {
         console.warn(`Journey content panel with ID "journey-${step}" not found.`);
         // Hide all panels if none match
         currentContents.forEach(content => content.hidden = true);
     }

}

// Function to handle Journey node click/keydown
function handleJourneyInteraction(event) {
    // Only proceed if click or Enter/Space keydown
    if (event.type === 'click' || (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))) {
        if(event.type === 'keydown') event.preventDefault(); // Prevent spacebar scrolling

        const targetNode = event.currentTarget;
        const step = targetNode.dataset.step;
        if (step) {
            activateJourneyStep(step);
            // Smoothly scroll content into view if activated manually
            journeyContentContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Intersection Observer for Journey Auto-Advance
function setupJourneyObserver() {
    // Ensure elements are cached or selected
    journeyPath = journeyPath || document.querySelector('.journey-path');
    // Populate journeyNodeList if empty
    if (journeyNodeList.length === 0) {
        journeyNodes = document.querySelectorAll('.journey-node'); // NodeList
        journeyNodeList = Array.from(journeyNodes); // Convert to Array
    }
    journeyContents = journeyContents || document.querySelectorAll('.journey-content'); // Cache contents
    journeyContentContainer = journeyContentContainer || document.querySelector('.journey-content-container');


    if (isJourneyObserverActive || !journeyPath || journeyNodeList.length === 0 || typeof IntersectionObserver !== 'function') {
         if (!isJourneyObserverActive) { // Only warn if setup hasn't run successfully before
             console.warn("Journey observer setup prerequisites not met or IntersectionObserver not supported.");
         }
         return;
    }
     console.log("Setting up journey observer...");
     isJourneyObserverActive = true; // Set flag

     const sectionsToObserve = [
         { id: 'hero', step: 'awareness' }, // Start explicitly at hero
         { id: 'free-resources', step: 'understanding' }, // Moved understanding trigger up
         { id: 'learning-hub', step: 'understanding' }, // Linked to quizzes
         { id: 'financial-journey', step: 'understanding'}, // Section itself might trigger Understanding
         { id: 'free-tools', step: 'organization' },
         { id: 'financial-tools-promo', step: 'action' }, // Calculator promo
         { id: 'personal-coaching', step: 'growth' }
         // Add more section IDs if needed
     ];

     const observerOptions = {
         root: null,
         rootMargin: "-30% 0px -60% 0px", // Trigger when section is more centered vertically
         threshold: 0.01 // Needs only a tiny bit visible within margins
     };

     const journeyObserver = new IntersectionObserver((entries) => {
        let highestVisibleIndex = -1;
        let stepToActivate = null;

         entries.forEach(entry => {
             if (entry.isIntersecting) {
                 const targetSectionId = entry.target.id;
                 const mapping = sectionsToObserve.find(s => s.id === targetSectionId);
                 if (mapping && mapping.step) {
                    // Find the index of the node corresponding to this section's step
                     const targetNodeIndex = journeyNodeList.findIndex(node => node.dataset.step === mapping.step);

                    if (targetNodeIndex > highestVisibleIndex) {
                        highestVisibleIndex = targetNodeIndex;
                        stepToActivate = mapping.step;
                    }
                 }
             }
         });

        // Find the currently active node's index
        const currentActiveNode = journeyPath.querySelector('.journey-node.active');
        const currentActiveIndex = currentActiveNode ? journeyNodeList.findIndex(node => node === currentActiveNode) : -1;


         // Activate the step ONLY if it's *ahead* of the current active step.
         // This prevents the journey from automatically going backward when scrolling up.
         if (stepToActivate && highestVisibleIndex > currentActiveIndex) {
             // console.log(`Journey Observer: Activating step "${stepToActivate}" (index ${highestVisibleIndex}) based on section intersection.`);
             activateJourneyStep(stepToActivate);
         }
        // Optional: If nothing is active and the first section intersects, activate the first step
        else if (currentActiveIndex < 0 && stepToActivate && highestVisibleIndex === 0) {
            // console.log(`Journey Observer: Activating initial step "${stepToActivate}" (index 0).`);
             activateJourneyStep(stepToActivate);
        }


     }, observerOptions);

    // Observe the target sections
    let observedCount = 0;
    sectionsToObserve.forEach(sectionInfo => {
        const sectionElement = document.getElementById(sectionInfo.id);
        if (sectionElement) {
            journeyObserver.observe(sectionElement);
            observedCount++;
        } else {
            console.warn(`Journey observer: Section with ID "${sectionInfo.id}" not found.`);
        }
    });
     if (observedCount > 0) {
         console.log(`Journey observer watching ${observedCount} sections.`);
     } else {
          console.error("Journey observer: No target sections found to observe.");
          isJourneyObserverActive = false; // Reset flag if failed
     }
}

// --- Helper to open feedback modal (reusable) ---
function openFeedbackModal() {
    feedbackModal = feedbackModal || document.getElementById('feedback-modal');
    const feedbackForm = document.getElementById('feedback-testimonial-form'); // Get form reference

    if (feedbackModal && feedbackForm) {
        resetFormErrors('feedback-testimonial-form');
        const responseElement = document.getElementById('feedback-form-response');
        if(responseElement) responseElement.hidden = true;

        feedbackForm.reset(); // Reset form fields
        const permissionGroup = feedbackModal.querySelector('.permission-group');
        if (permissionGroup) permissionGroup.hidden = true; // Hide permission by default
         const feedbackTypeSelect = document.getElementById('feedback-type'); // Also reset select
         if (feedbackTypeSelect) feedbackTypeSelect.value = ""; // Reset select value


        feedbackModal.hidden = false;
        document.body.classList.add('modal-open');
        feedbackModal.querySelector('select, input, textarea')?.focus();
    } else {
        console.error("Feedback modal or form not found.");
    }
}


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed"); // Log confirmation

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
    journeyPath = document.querySelector('.journey-path');
    // Use querySelectorAll and convert to array for easier index finding
    journeyNodes = document.querySelectorAll('.journey-node'); // NodeList
    journeyNodeList = Array.from(journeyNodes); // Convert to Array for easier index finding
    journeyContents = document.querySelectorAll('.journey-content'); // Cache contents
    journeyContentContainer = document.querySelector('.journey-content-container'); // Cache content container


    // Check essential elements
    if (!quizModal) console.warn("Quiz Modal not found.");
    if (!demographicsModal) console.warn("Demographics Modal not found.");
    if (!pdfModal) console.warn("PDF Modal not found.");
    if (!feedbackModal) console.warn("Feedback Modal not found.");
    if (!fabContainer || !fabButton || !fabOptions) console.warn("FAB elements incomplete.");
    if (!menuToggle || !primaryNav) console.warn("Mobile nav elements incomplete.");
    if (!journeyPath || journeyNodeList.length === 0 || !journeyContents || journeyContents.length === 0 || !journeyContentContainer) console.warn("Journey path elements incomplete.");


    // --- General UI Enhancements ---

    // Update Current Year in Footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    } else {
        console.warn("Current year element not found in footer.");
    }

    // Scroll Animations Setup (using IntersectionObserver)
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger > *');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
         console.log(`Initializing IntersectionObserver for ${revealElements.length} reveal elements.`); // Log
         const scrollObserverOptions = {
            root: null, // Use viewport as root
            rootMargin: '0px 0px -10% 0px', // Trigger 10% from bottom
            threshold: 0.01 // Element needs to be just slightly visible
         };
        const scrollObserver = new IntersectionObserver((entries, observer) => { // Pass observer
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                     // Staggered children: Set delay here if needed based on parent class
                     if (entry.target.parentElement.classList.contains('reveal-stagger')) {
                         const children = Array.from(entry.target.parentElement.children);
                         const index = children.indexOf(entry.target);
                         entry.target.style.transitionDelay = `${index * 0.1}s`; // Example stagger
                     }
                     // console.log('Revealed:', entry.target.id || entry.target.tagName); // Log revealed element
                    observer.unobserve(entry.target); // IMPORTANT: Stop observing after revealed
                }
            });
        }, scrollObserverOptions);

        revealElements.forEach(el => {
            // Add the 'not-revealed' class initially if you prefer that CSS approach
            // el.classList.add('not-revealed');
            scrollObserver.observe(el);
        });
    } else if (revealElements.length === 0) {
         console.warn("No elements found for reveal-on-scroll animation.");
    } else {
         console.warn("IntersectionObserver not supported, reveal animations disabled.");
          // Fallback: remove reveal classes so elements are visible
          revealElements.forEach(el => {
                el.classList.remove('reveal-on-scroll');
                if (el.parentElement.classList.contains('reveal-stagger')) {
                    el.classList.remove('revealed'); // Clean up any potentially added class
                }
                el.style.opacity = 1; // Make visible
                el.style.transform = 'translateY(0)';
          });
    }


    // Form Submit Ripple Effect
    const submitButtons = document.querySelectorAll('.form-submit-btn');
    submitButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Ripple should still work okay
            const existingRipple = button.querySelector('.btn-ripple');
            if(existingRipple) existingRipple.remove();

            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            // Check if button is positioned relatively or absolutely
            // offset calculations work best on relatively positioned elements
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
             // Calculate position relative to button edge
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => {
                 if (ripple.parentNode) { // Check if ripple still exists before removing
                    ripple.remove();
                 }
            });
        });
    });


    // --- Mobile Navigation ---
    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            primaryNav.classList.toggle('active'); // Toggles visibility/animation
            menuToggle.classList.toggle('active'); // Toggles icon state
            document.body.classList.toggle('modal-open', !isExpanded); // Prevent body scroll

             if (!isExpanded) {
                 // Focus first focusable element in nav
                primaryNav.querySelector('a, button')?.focus();
             } else {
                 // Return focus to toggle button
                menuToggle.focus();
             }
        });
        // Close menu when a link is clicked
        primaryNav.addEventListener('click', (e) => {
            // Check if the target is a link *inside* the nav
           if (e.target.matches('a') && primaryNav.classList.contains('active')) {
               menuToggle.click(); // Simulate a click on the toggle to close the nav
           }
        });
    }


    // --- Quiz Related Listeners ---

    // Start Quiz Buttons (Category Cards)
    document.querySelectorAll('.start-quiz-btn').forEach(button => {
        button.addEventListener('click', function() {
            const categoryCard = this.closest('.category-card');
            if (categoryCard) {
                const categoryId = categoryCard.dataset.categoryId;
                if (categoryId) {
                    handleQuizStart(categoryId); // No need to parse here, handled in function
                } else {
                    console.error("Category card missing data-category-id attribute.");
                }
            } else {
                console.error("Could not find parent category card for quiz button.");
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
             // Check based on text content might be brittle, check index instead
             if (currentQuestionIndex < currentQuestions.length -1) {
                currentQuestionIndex++;
                displayQuestion();
            } else if (currentQuestionIndex === currentQuestions.length -1){
                 // Last question was answered, clicking 'Show Results'
                 showQuizResults();
             }
         });
    }

    if (restartButton) {
        restartButton.addEventListener('click', () => {
            if (currentCategoryId !== null) {
                startQuiz(currentCategoryId); // Restart the *current* category quiz
            }
        });
    }

    if (closeQuizButton) {
        closeQuizButton.addEventListener('click', () => quizModal && closeModal(quizModal));
    }
    if (closeResultsButton) {
        closeResultsButton.addEventListener('click', () => quizModal && closeModal(quizModal));
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
            if (!countryInput || !countryInput.value.trim()) {
                showFeedback(countryInput || demographicsForm.querySelector('#quiz-country'), 'Please enter your country'); // Handle potential null input
                isValid = false;
            } else {
                showFeedback(countryInput, '', false); // Clear feedback
            }

            // Validate City (Text Input)
            const cityInput = document.getElementById('quiz-city');
             if (!cityInput || !cityInput.value.trim()) {
                showFeedback(cityInput || demographicsForm.querySelector('#quiz-city'), 'Please enter your city');
                isValid = false;
             } else {
                showFeedback(cityInput, '', false); // Clear feedback
             }

             // Validate Radio Button Selection
             const takenBeforeRadios = demographicsForm.querySelectorAll('input[name="taken_before"]');
             const takenBeforeChecked = demographicsForm.querySelector('input[name="taken_before"]:checked');
             const takenErrorElement = document.getElementById('quiz-taken-error'); // The error span
             const radioGroupFieldset = takenBeforeRadios[0]?.closest('fieldset'); // Get parent fieldset for error feedback

             if (!takenBeforeChecked) {
                showFeedback(radioGroupFieldset, 'Please select an option', true); // Use helper for fieldset
                isValid = false;
             } else {
                 showFeedback(radioGroupFieldset, '', false); // Clear feedback on fieldset
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

                closeModal(demographicsModal);
                const selectedCategoryId = sessionStorage.getItem('selectedQuizCategory');
                if (selectedCategoryId) {
                    startQuiz(selectedCategoryId); // Needs to be parsed in startQuiz now
                } else {
                    console.error("No quiz category selected after demographics.");
                     alert("An error occurred. Please try selecting the quiz category again."); // User feedback
                }
            } else {
                 // Focus the first field with an error
                 // Ensure the element exists before focusing
                const firstErrorField = demographicsForm.querySelector('.is-invalid') || demographicsForm.querySelector('.is-invalid-check-group input[type="radio"]');
                 firstErrorField?.focus();
            }
        });
    } else {
         console.warn("Demographics form not found.");
    }

    // Close Demographics Button Listener
    const closeDemographicsButton = document.getElementById('quiz-demographics-close');
    if (closeDemographicsButton && demographicsModal) {
        closeDemographicsButton.addEventListener('click', () => closeModal(demographicsModal));
    }


    // --- PDF Download Functionality ---
    const pdfDownloadForm = document.getElementById('pdf-download-form');
    const mainContentArea = document.getElementById('main-content');

    if (pdfDownloadForm && pdfModal && mainContentArea) {
         const closePdfButton = document.getElementById('pdf-download-close');

         // Open Modal Listener (delegated from main content)
         mainContentArea.addEventListener('click', function(e){
             const pdfButton = e.target.closest('.get-pdf-btn');
             if(pdfButton){
                const templateKey = pdfButton.dataset.templateKey;
                const templateKeyInput = document.getElementById('pdf-template-key');

                if (templateKey && templateKeyInput) {
                    templateKeyInput.value = templateKey;
                    resetFormErrors('pdf-download-form');
                    pdfDownloadForm.reset();
                    pdfModal.hidden = false;
                    document.body.classList.add('modal-open');
                    pdfModal.querySelector('input, select, textarea')?.focus(); // Focus first element
                } else {
                    console.error("PDF download setup error: Missing elements or data-template-key.", { templateKey, templateKeyInput, pdfModal });
                    alert("Sorry, there was an issue preparing the download link.");
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
             if (!countryInput || !countryInput.value.trim()) {
                 showFeedback(countryInput || pdfDownloadForm.querySelector('#pdf-country'), 'Please enter your country');
                 isValid = false;
             } else {
                 showFeedback(countryInput, '', false);
             }

             // Validate City
             if (!cityInput || !cityInput.value.trim()) {
                 showFeedback(cityInput || pdfDownloadForm.querySelector('#pdf-city'), 'Please enter your city');
                 isValid = false;
             } else {
                 showFeedback(cityInput, '', false);
             }

            if (isValid) {
                const templateKey = templateKeyInput.value;
                const formData = {
                    country: countryInput.value.trim(),
                    city: cityInput.value.trim(),
                    template: templateKey
                };
                console.log('PDF Download Data:', formData); // Placeholder

                // --- Trigger PDF download ---
                 // CHANGE: Assume assets are in the correct place relative to the domain root or use absolute paths if needed
                 const pdfBaseUrl = '/assets/pdfs/'; // Path from domain root
                 const pdfFilename = `${templateKey}.pdf`;
                 const pdfUrl = `${pdfBaseUrl}${pdfFilename}`;

                 console.log(`Attempting to download: ${pdfUrl}`); // Debugging path

                 // Verify the file exists (optional, client-side check is unreliable)
                 // Basic check: Create link and attempt download
                const link = document.createElement('a');
                link.href = pdfUrl;
                link.download = `${templateKey}_template.pdf`; // Desired download filename

                // Append, click, remove pattern for download initiation
                document.body.appendChild(link);
                link.click();
                 setTimeout(() => { // Delay removal slightly
                    document.body.removeChild(link);
                 }, 100);
                // --- End PDF download ---

                closeModal(pdfModal);
                pdfDownloadForm.reset();

            } else {
                pdfDownloadForm.querySelector('.is-invalid')?.focus();
            }
        });

         // Close Modal Button
        if (closePdfButton) {
            closePdfButton.addEventListener('click', () => closeModal(pdfModal));
        }
    } else {
        console.warn("PDF Download functionality not fully initialized. Missing form, modal, or main content area.");
    } // End PDF Download Form logic


    // --- Spreadsheet Button Placeholder ---
    if (mainContentArea) {
        mainContentArea.addEventListener('click', function(e){
            const spreadsheetButton = e.target.closest('.get-spreadsheet-btn');
            if(spreadsheetButton){
                const templateName = spreadsheetButton.dataset.templateName || 'Unknown Template';
                const price = spreadsheetButton.dataset.price || 'N/A';
                console.log(`Spreadsheet requested: ${templateName}, Price: ${price}`);
                alert(`Interactive Spreadsheet (${templateName}) coming soon! (Price: ${price} NGN)`);
            }
        });
    }


    // --- Feedback Modal ---
    const feedbackForm = document.getElementById('feedback-testimonial-form');
    if (feedbackForm && feedbackModal) {
        const openFeedbackButton = document.getElementById('open-feedback-modal-btn');
        const fabOpenFeedbackButton = document.getElementById('fab-open-feedback-btn');
        const footerOpenFeedbackButton = document.getElementById('footer-open-feedback-btn'); // Footer trigger
        const closeFeedbackButton = document.getElementById('feedback-modal-close');
        const feedbackTypeSelect = document.getElementById('feedback-type');
        const permissionGroup = feedbackForm.querySelector('.permission-group');
        const responseElement = document.getElementById('feedback-form-response');

        // Open Modal Listeners
        if (openFeedbackButton) openFeedbackButton.addEventListener('click', openFeedbackModal);
        if (fabOpenFeedbackButton) fabOpenFeedbackButton.addEventListener('click', openFeedbackModal);
        if (footerOpenFeedbackButton) footerOpenFeedbackButton.addEventListener('click', openFeedbackModal); // Listener for footer button


        // Close Modal Listener
        if (closeFeedbackButton) {
            closeFeedbackButton.addEventListener('click', () => closeModal(feedbackModal));
        }

        // Show/hide permission checkbox
        if (feedbackTypeSelect && permissionGroup) {
            feedbackTypeSelect.addEventListener('change', function() {
                permissionGroup.hidden = this.value !== 'testimonial';
                 // If switching away from testimonial, ensure checkbox is cleared/reset if needed
                 if (this.value !== 'testimonial') {
                    const permissionCheckbox = document.getElementById('feedback-permission');
                    if (permissionCheckbox) permissionCheckbox.checked = false;
                 }
            });
        } else {
             console.warn("Feedback type select or permission group not found.");
        }


        // Handle feedback form submission
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('feedback-testimonial-form');
            let isValid = true;

             // Get potentially null elements inside handler to avoid early errors
            const currentFeedbackTypeSelect = document.getElementById('feedback-type');
            const messageTextarea = document.getElementById('feedback-message');
            const emailInput = document.getElementById('feedback-email');
            const currentResponseElement = document.getElementById('feedback-form-response'); // Fetch here too

            // Validate Type
            if (!currentFeedbackTypeSelect || !currentFeedbackTypeSelect.value) {
                 showFeedback(currentFeedbackTypeSelect || feedbackForm.querySelector('#feedback-type'), 'Please select a type');
                 isValid = false;
            } else {
                showFeedback(currentFeedbackTypeSelect, '', false);
            }

            // Validate Message
             if (!messageTextarea || !messageTextarea.value.trim()) {
                 showFeedback(messageTextarea || feedbackForm.querySelector('#feedback-message'), 'Please enter your message');
                 isValid = false;
             } else {
                showFeedback(messageTextarea, '', false);
            }

             // Validate Email (Optional - check only if provided)
             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
             if (emailInput && emailInput.value.trim() && !emailRegex.test(emailInput.value.trim())) {
                 showFeedback(emailInput, 'Please enter a valid email address');
                 isValid = false;
             } else if (emailInput) { // Clear error if valid or empty
                 showFeedback(emailInput, '', false);
             }

            if (isValid) {
                const name = document.getElementById('feedback-name')?.value.trim() || 'Anonymous';
                const permissionChecked = document.getElementById('feedback-permission')?.checked || false;

                const formData = {
                    name: name,
                    email: emailInput?.value.trim() || null,
                    type: currentFeedbackTypeSelect.value,
                    message: messageTextarea.value.trim(),
                    permission: currentFeedbackTypeSelect.value === 'testimonial' ? permissionChecked : null
                };
                console.log('Submitting Feedback:', formData); // Placeholder

                // Show success message
                if (currentResponseElement) {
                     currentResponseElement.textContent = 'Thank you for your feedback!';
                     currentResponseElement.className = 'form-response-note mt-md text-center';
                     currentResponseElement.hidden = false;
                     // Ensure screen readers announce the change
                     currentResponseElement.setAttribute('aria-live', 'assertive');
                }

                this.reset(); // Reset the form
                if (permissionGroup) permissionGroup.hidden = true; // Hide permission group again
                if(currentFeedbackTypeSelect) currentFeedbackTypeSelect.value = ""; // Reset select explicitly


                 // Auto-close modal after a delay
                 setTimeout(() => {
                      // Re-fetch feedbackModal ref in case it changed, and check if still open
                     const currentFeedbackModal = document.getElementById('feedback-modal');
                     if (currentFeedbackModal && !currentFeedbackModal.hidden) {
                         closeModal(currentFeedbackModal);
                         if(currentResponseElement) {
                             currentResponseElement.hidden = true; // Hide message on close
                             currentResponseElement.removeAttribute('aria-live'); // Remove assertive nature
                         }
                     }
                 }, 3000);

            } else {
                 // Ensure response element is hidden on validation failure
                 if (currentResponseElement) {
                     currentResponseElement.hidden = true;
                      currentResponseElement.removeAttribute('aria-live');
                 }
                 // Focus first invalid element
                  const firstErrorField = feedbackForm.querySelector('.is-invalid') || feedbackForm.querySelector('fieldset.is-invalid-check-group input[type="radio"]'); // Adjust selector if needed
                  firstErrorField?.focus();
            }
        });
    } else {
         console.warn("Feedback form or modal element not found.");
    } // End Feedback Form logic

    // --- Coaching Interest Form ---
    const coachingForm = document.getElementById('coachingInterestForm');
    if (coachingForm) {
        coachingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('coachingInterestForm');
            const emailInput = document.getElementById('interest-email');
            const responseElement = document.getElementById('interest-form-response');

             if (!emailInput || !responseElement) {
                console.error("Coaching form elements missing (email input or response area).");
                return;
            }

            const email = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

             if (!email || !emailRegex.test(email)) {
                 showFeedback(emailInput, 'Please enter a valid email address');
                 responseElement.hidden = true;
                 responseElement.removeAttribute('aria-live');
            } else {
                showFeedback(emailInput, '', false); // Clear any previous error
                console.log('Submitting Coaching Interest:', { email: email });

                // Show success message
                 responseElement.textContent = 'Thank you! We’ll notify you when coaching is available.';
                 responseElement.className = 'form-response-note mt-md'; // Set classes
                 responseElement.hidden = false;
                 responseElement.setAttribute('aria-live', 'assertive');

                this.reset();

                // Optionally hide response message after a delay
                setTimeout(() => {
                    responseElement.hidden = true;
                    responseElement.removeAttribute('aria-live');
                }, 5000);
            }
        });
    } else {
        console.warn("Coaching interest form not found.");
    }


    // --- Financial Journey Path Initialization ---
    if (journeyPath && journeyNodeList.length > 0 && journeyContents && journeyContents.length > 0) {
        console.log("Initializing Financial Journey Path interactions.");
        // Add click and keydown listeners to nodes
        journeyNodeList.forEach(node => {
            node.addEventListener('click', handleJourneyInteraction);
            node.addEventListener('keydown', handleJourneyInteraction);
        });

         // Activate the first step initially only if no other step is somehow already active
         const initialActiveStep = journeyNodeList[0]?.dataset.step;
         const alreadyActive = journeyPath.querySelector('.journey-node.active');
         if (initialActiveStep && !alreadyActive) {
             console.log("Activating initial journey step:", initialActiveStep);
             activateJourneyStep(initialActiveStep);
         }

         // Set up the IntersectionObserver for auto-advancing
         setupJourneyObserver(); // Logs inside function handle setup status

    } else {
        console.warn("Financial Journey Path elements not found, interactions and observer disabled.");
    } // End Journey Path Initialization


    // --- Floating Action Button (FAB) ---
    if (fabContainer && fabButton && fabOptions) {
        console.log("Initializing Floating Action Button (FAB).");
        fabButton.addEventListener('click', function() {
            const isExpanded = fabContainer.classList.toggle('active');
            fabButton.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
             // Toggle visibility using hidden attribute for better accessibility/control
             fabOptions.hidden = !isExpanded;

             // Apply staggered animation delay using CSS variables set in JS
            if (isExpanded) {
                 const fabListItems = fabOptions.querySelectorAll('li');
                 fabListItems.forEach((item, index) => {
                    // Set custom property '--delay' for each item
                    item.style.setProperty('--delay', `${0.05 * (index + 1)}s`);
                 });
                 // Focus first interactive element (button or link) within the list
                 fabOptions.querySelector('a, button')?.focus();
             } else {
                // Optional: Clear custom properties if needed, though hiding might be sufficient
                 const fabListItems = fabOptions.querySelectorAll('li');
                 fabListItems.forEach(item => {
                    item.style.removeProperty('--delay'); // Remove custom property
                 });
             }
        });

        // Close FAB if an option is clicked
        fabOptions.addEventListener('click', function(e) {
             // Check if the click target OR its ancestor is a fab option item (link or button)
            if (e.target.closest('.fab-option')) {
                 fabButton.click(); // Simulate a click on the main button
                 // Optional: Delay focus slightly to allow menu to close
                 setTimeout(() => fabButton.focus(), 50);
            }
        });

        // Close FAB if clicked outside
         document.addEventListener('click', function(e) {
            // If FAB is active and the click target is NOT the FAB container or inside it
             if (fabContainer.classList.contains('active') && !fabContainer.contains(e.target)) {
                 fabButton.click(); // Close the FAB
             }
        });

    } else {
        console.warn("FAB elements not fully initialized.");
    } // End FAB logic


    // --- Modal Global Close Handlers ---

    // Close on click OUTSIDE the modal content (on the overlay)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
             // Check if the direct click target is the modal overlay itself
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Close any open modal or FAB or Mobile Nav on Escape key press
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
             // Check for open modals first
            const openModal = document.querySelector('.modal-overlay:not([hidden])');
            if (openModal) {
                console.log("Escape key pressed - closing modal:", openModal.id);
                closeModal(openModal);
                // Find trigger if possible and return focus? Complex. Focus body fallback?
                // document.body.focus(); // Simple focus return
                return; // Stop further checks if modal closed
            }
            // Check for active FAB
            if (fabContainer && fabContainer.classList.contains('active')) {
                 console.log("Escape key pressed - closing FAB");
                 fabButton.click(); // Use click to ensure proper state update
                 fabButton.focus();
                 return; // Stop further checks if FAB closed
            }
            // Check for active mobile nav
            if (primaryNav && primaryNav.classList.contains('active')) {
                 console.log("Escape key pressed - closing mobile nav");
                 menuToggle.click(); // Use click to ensure proper state update
                 menuToggle.focus();
                 return; // Stop further checks if Nav closed
            }
        }
    });

     console.log("Event listeners attached and initial setup complete.");

}); // End DOMContentLoaded
