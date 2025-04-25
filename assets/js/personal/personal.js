// personal.js
'use strict';

// --- Data Lists ---
const countryList = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
    "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
    "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Côte d'Ivoire",
    "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark",
    "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
    "Estonia", "Eswatini (fmr. \"Swaziland\")", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
    "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See",
    "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia",
    "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
    "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea",
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore",
    "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain",
    "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand",
    "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
    "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Note: Your nigeria-cities.txt lists STATES. We'll use them as states/cities for simplicity here.
const nigerianStatesList = [
    "Abuja", "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River",
    "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
    "Kebbi", "Kogi", "Kwara", "Lagos", "Nassarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
    "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];


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


// --- Global State Variables ---
let currentCategoryId = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let quizDemographicsSubmitted = sessionStorage.getItem('quizDemographicsSubmitted') === 'true';
let isJourneyObserverActive = false; // Flag for observer setup
let journeyAutoAdvanceInterval = null; // Timer for journey auto-advance
const JOURNEY_ADVANCE_DELAY = 4000; // Increased delay slightly

// --- DOM Element References (Cached on DOMContentLoaded) ---
let quizModal, demographicsModal, pdfModal, feedbackModal;
let fabContainer, fabButton, fabOptions;
let journeyPath, journeyNodes, journeyContents, journeyContentContainer; // journeyNodes is NodeList
let menuToggle, primaryNav; // Mobile Nav elements
let mainContentArea;
let journeyNodeList = []; // Array copy for easier index finding
// MODIFICATION START: Added Datalist element references
let quizCountryInput, quizCityInput, quizCountryDatalist, quizCityDatalist;
let pdfCountryInput, pdfCityInput, pdfCountryDatalist, pdfCityDatalist;
// MODIFICATION END

// --- Utility Function to Reset Form Errors ---
function resetFormErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    const errorElements = form.querySelectorAll('.invalid-feedback');
    errorElements.forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
        el.classList.remove('d-block');
    });

    const invalidInputs = form.querySelectorAll('.is-invalid');
    invalidInputs.forEach(el => el.classList.remove('is-invalid'));

    // Reset fieldset error state
    const invalidFieldsets = form.querySelectorAll('.is-invalid-check-group');
    invalidFieldsets.forEach(fieldset => {
        fieldset.classList.remove('is-invalid-check-group');
        // Optionally reset legend color if styled
        const legend = fieldset.querySelector('legend');
        if (legend) legend.style.color = ''; // Reset color or remove class
    });
}

// --- Utility to Close Modals ---
function closeModal(modalElement) {
    if (modalElement && !modalElement.hidden) {
        modalElement.hidden = true;
        const anyModalOpen = document.querySelector('.modal-overlay:not([hidden])');
        if (!anyModalOpen) {
            // Remove class only if *no* modals are open
            document.body.classList.remove('modal-open');
        }
        // Optional: Return focus to the trigger element
        // Find the element that likely opened the modal and focus it.
        // This requires storing the trigger element when opening the modal.
        // Example:
        // const trigger = modalElement.dataset.triggeredBy;
        // if (trigger && document.getElementById(trigger)) {
        //    document.getElementById(trigger).focus();
        // }
    }
}

// --- Show/Hide Form Feedback Helper ---
function showFeedback(fieldElement, message, isError = true) {
    let feedbackElement = null;
    let containerElement = fieldElement; // Assume input/select first

    if (!fieldElement) return;

    // Find the container (usually form-group or fieldset)
    const parentGroup = fieldElement.closest('.form-group, fieldset');

    // Find the associated feedback element
    if (parentGroup) {
        feedbackElement = parentGroup.querySelector('.invalid-feedback');
        // If the field is radio/checkbox inside a fieldset, the fieldset is the container
        if (fieldElement.type === 'radio' || fieldElement.type === 'checkbox') {
            containerElement = parentGroup; // The fieldset is the container
        }
    }
    // Fallback: try aria-describedby
    if (!feedbackElement && fieldElement.getAttribute('aria-describedby')) {
        const describedById = fieldElement.getAttribute('aria-describedby').split(' ')[0]; // Get first ID if multiple
        feedbackElement = document.getElementById(describedById);
    }
    // Fallback: try next sibling
    if (!feedbackElement && fieldElement.nextElementSibling?.classList.contains('invalid-feedback')) {
        feedbackElement = fieldElement.nextElementSibling;
    }

    // Update feedback text and visibility
    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.style.display = message ? 'block' : 'none'; // Use block display
        feedbackElement.classList.toggle('d-block', !!message); // Toggle BS class if used
        // Ensure ARIA live region is active only when message is shown
        feedbackElement.setAttribute('aria-live', message ? 'polite' : 'off');
    }

    // Update field/container validity state
    if (containerElement) {
        const errorClass = (containerElement.tagName === 'FIELDSET') ? 'is-invalid-check-group' : 'is-invalid';

        if (isError && message) {
            containerElement.classList.add(errorClass);
             if (errorClass === 'is-invalid-check-group') { // Also style inputs/labels inside invalid fieldset
                containerElement.querySelectorAll('.form-check-input').forEach(input => input.classList.add('is-invalid'));
                containerElement.querySelectorAll('.form-check-label').forEach(label => label.classList.add('text-danger')); // Example label styling
            }
        } else {
            containerElement.classList.remove(errorClass);
            if (errorClass === 'is-invalid-check-group') {
                containerElement.querySelectorAll('.form-check-input').forEach(input => input.classList.remove('is-invalid'));
                containerElement.querySelectorAll('.form-check-label').forEach(label => label.classList.remove('text-danger'));
            }
             if (feedbackElement && !message) { // Ensure feedback is hidden if no message
                feedbackElement.style.display = 'none';
                feedbackElement.classList.remove('d-block');
                 feedbackElement.setAttribute('aria-live', 'off');
             }
        }
    }
}


// --- Quiz Functions ---
function startQuiz(categoryId) {
    if (!quizModal) {
        console.error("Quiz modal element not cached or found! Cannot start quiz.");
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

    // Get elements inside the modal (assume they exist based on caching/checks)
    const titleEl = quizModal.querySelector('#quiz-modal-title');
    const qTotalEl = quizModal.querySelector('#quiz-modal-q-total');
    const resultsEl = quizModal.querySelector('#quiz-modal-results');
    const promptEl = quizModal.querySelector('#quiz-modal-full-challenge-prompt');
    const restartBtn = quizModal.querySelector('#quiz-modal-restart');
    const closeResultsBtn = quizModal.querySelector('#quiz-modal-close-results');
    const feedbackAreaEl = quizModal.querySelector('#quiz-modal-feedback');
    const nextBtnEl = quizModal.querySelector('#quiz-modal-next');
    const questionArea = quizModal.querySelector('#quiz-modal-question');
    const optionsArea = quizModal.querySelector('#quiz-modal-options');

    // Initial setup
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
    optionsArea.innerHTML = ''; // Clear options

    // Show modal
    quizModal.hidden = false;
    document.body.classList.add('modal-open');

    displayQuestion();
    // Focus first interactive element in modal
    quizModal.querySelector('button')?.focus();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length || !quizModal) {
        showQuizResults();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    const questionElement = quizModal.querySelector('#quiz-modal-question');
    const optionsElement = quizModal.querySelector('#quiz-modal-options');
    const feedbackElement = quizModal.querySelector('#quiz-modal-feedback');
    const nextButton = quizModal.querySelector('#quiz-modal-next');
    const progressElement = quizModal.querySelector('#quiz-modal-q-current');


    if (!questionElement || !optionsElement || !feedbackElement || !nextButton || !progressElement) {
        console.error("Required quiz elements missing inside modal for question:", currentQuestionIndex);
        return;
    }

    progressElement.textContent = currentQuestionIndex + 1;
    questionElement.textContent = question.question;
    optionsElement.innerHTML = ''; // Clear previous options
    optionsElement.hidden = false;
    feedbackElement.hidden = true;
    nextButton.hidden = true;
    questionElement.hidden = false;

    // ARIA setup (already set in HTML, just ensure ID exists)
    questionElement.id = questionElement.id || 'quiz-modal-question';
    optionsElement.setAttribute('aria-labelledby', questionElement.id);

    question.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        optionButton.classList.add('btn', 'btn-outline', 'quiz-option');
        optionButton.textContent = option;
        optionButton.setAttribute('data-index', index.toString());
        optionButton.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
        optionButton.addEventListener('click', handleAnswerSelection);
        optionsElement.appendChild(optionButton);
    });
}

function handleAnswerSelection(event) {
    const selectedButton = event.target.closest('.quiz-option');
    if (!selectedButton || selectedButton.disabled || !quizModal) return;

    const selectedIndex = parseInt(selectedButton.dataset.index);
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correctAnswerIndex;

    userAnswers.push({ questionId: question.id, selected: selectedIndex, correct: isCorrect });
    if (isCorrect) {
        score++;
    }

    const feedbackElement = quizModal.querySelector('#quiz-modal-feedback');
    const nextButton = quizModal.querySelector('#quiz-modal-next');
    const optionButtons = quizModal.querySelectorAll('#quiz-modal-options .quiz-option');

    if (feedbackElement) {
        feedbackElement.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${question.explanation || ''}`;
        feedbackElement.className = 'quiz-feedback p-md border rounded mb-lg'; // Reset classes
        feedbackElement.classList.add(isCorrect ? 'correct' : 'incorrect');
        feedbackElement.hidden = false;
    }

    if (nextButton) {
        nextButton.textContent = (currentQuestionIndex === currentQuestions.length - 1) ? "Show Results" : "Next Question";
        nextButton.hidden = false;
        setTimeout(() => nextButton.focus(), 100); // Delay focus slightly
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
    if (!quizModal) return;

    const resultsElement = quizModal.querySelector('#quiz-modal-results');
    const questionArea = quizModal.querySelector('#quiz-modal-question');
    const optionsArea = quizModal.querySelector('#quiz-modal-options');
    const feedbackArea = quizModal.querySelector('#quiz-modal-feedback');
    const nextButton = quizModal.querySelector('#quiz-modal-next');
    const restartButton = quizModal.querySelector('#quiz-modal-restart');
    const closeResultsButton = quizModal.querySelector('#quiz-modal-close-results');
    const fullChallengePrompt = quizModal.querySelector('#quiz-modal-full-challenge-prompt');

    if (!resultsElement || !questionArea || !optionsArea || !feedbackArea || !nextButton || !restartButton || !closeResultsButton || !fullChallengePrompt) {
        console.error("Required quiz elements missing for displaying results.");
        closeModal(quizModal);
        return;
    }

    questionArea.hidden = true;
    optionsArea.hidden = true;
    feedbackArea.hidden = true;
    nextButton.hidden = true;

    const totalQuestions = currentQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    let message = '';
    if (percentage >= 80) message = 'Excellent! You have a strong understanding.';
    else if (percentage >= 60) message = 'Good job! Keep building on your knowledge.';
    else message = 'Keep practicing! Review the concepts and try again.';

    resultsElement.innerHTML = `
        <h4>Quiz Complete!</h4>
        <p>You scored ${score} out of ${totalQuestions} (${percentage}%).</p>
        <p>${message}</p>
    `;

    const nextCategoryId = currentCategoryId + 1;
    const nextCategory = introQuizQuestions.find(q => q.categoryId === nextCategoryId);

    if (nextCategory) {
        const nextCategoryName = nextCategory.category || `Check ${nextCategoryId}`;
        resultsElement.innerHTML += `<p class="mt-lg">Continue your learning journey with the next check:</p>`;
        const nextQuizButton = document.createElement('button');
        nextQuizButton.type = 'button';
        nextQuizButton.classList.add('btn', 'btn-primary', 'btn-small', 'btn-icon', 'mt-sm', 'next-quiz-button'); // Reduced margin
        nextQuizButton.innerHTML = `<i class="fas fa-arrow-right" aria-hidden="true"></i> Take ${nextCategoryName} Check`;
        nextQuizButton.onclick = () => handleQuizStart(nextCategoryId);
        resultsElement.appendChild(nextQuizButton);
        fullChallengePrompt.hidden = true;
    } else {
        resultsElement.innerHTML += `<p class="mt-lg">You've completed all the introductory checks!</p>`;
        fullChallengePrompt.hidden = false;
    }

    resultsElement.hidden = false;
    restartButton.hidden = false;
    closeResultsButton.hidden = false;
    restartButton.focus();
}

function handleQuizStart(categoryId) {
    sessionStorage.setItem('selectedQuizCategory', categoryId.toString());

    if (!demographicsModal) {
        console.warn("Demographics modal not found, starting quiz directly.");
        startQuiz(categoryId);
        return;
    }

    if (!quizDemographicsSubmitted) {
        resetFormErrors('quiz-demographics-form');
        const form = demographicsModal.querySelector('#quiz-demographics-form');
        if (form) form.reset();
        // MODIFICATION START: Reset city field state when showing demo modal
        if (quizCityInput) {
            quizCityInput.value = '';
            quizCityInput.disabled = true;
            quizCityInput.placeholder = "City (Select Country First)";
        }
        if (quizCityDatalist) {
            quizCityDatalist.innerHTML = ''; // Clear Nigeria states
        }
        // MODIFICATION END
        demographicsModal.hidden = false;
        document.body.classList.add('modal-open');
        // Focus first input
        demographicsModal.querySelector('input, select, textarea')?.focus();
    } else {
        startQuiz(categoryId);
    }
}


// --- Financial Journey Path Functions ---
function stopJourneyAutoAdvance() {
    if (journeyAutoAdvanceInterval) {
        // console.log("Stopping journey auto-advance.");
        clearInterval(journeyAutoAdvanceInterval);
        journeyAutoAdvanceInterval = null;
    }
}

function activateJourneyStep(step, options = { focusNode: false }) {
    // Ensure elements are available (should be cached by DOMContentLoaded)
    if (!journeyPath || journeyNodeList.length === 0 || !journeyContents || journeyContents.length === 0 || !journeyContentContainer) {
         console.warn("Journey path elements not available for activation.");
         return;
    }

    let activeIndex = -1;
    let foundActive = false;
    let activeNodeElement = null;

    // Update nodes
    journeyNodeList.forEach((node, index) => {
        const nodeStep = node.dataset.step;
        const isCurrent = nodeStep === step;
        node.classList.toggle('active', isCurrent);
        node.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        node.setAttribute('tabindex', isCurrent ? '0' : '-1');

        if (isCurrent) {
            activeIndex = index;
            foundActive = true;
            activeNodeElement = node;
        }
        node.classList.toggle('activated', index <= activeIndex);
    });

     if (!foundActive) {
         console.warn(`Step "${step}" not found or invalid in journey path.`);
         // Optionally activate the first step if none match
         // activateJourneyStep(journeyNodeList[0]?.dataset.step, { focusNode: false });
         return;
     }

    // Update progress bar (horizontal via connectors, vertical via CSS var)
    const totalNodes = journeyNodeList.length;
    const progressPercent = totalNodes > 1 ? (activeIndex / (totalNodes - 1)) * 100 : (activeIndex >= 0 ? 100 : 0);
    journeyPath.style.setProperty('--journey-progress-height', `${progressPercent}%`); // Update vertical progress

    // Activate corresponding content panel
    let contentFound = false;
    journeyContents.forEach(content => {
        const contentId = `journey-content-${step}`; // Match the ID format in HTML
        const isActive = content.id === contentId;
        content.hidden = !isActive; // Toggle hidden attribute
        if (isActive) {
            contentFound = true;
        }
    });
     if (!contentFound) {
         console.warn(`Journey content panel with ID "journey-content-${step}" not found.`);
         journeyContents.forEach(content => content.hidden = true); // Hide all if target not found
     }

    // Conditionally focus the node
    if (options.focusNode && activeNodeElement) {
        // Delay focus slightly to allow rendering and avoid conflicts
        setTimeout(() => {
            activeNodeElement.focus({ preventScroll: false }); // Allow scroll to focused node
            // Optional: Smooth scroll the content container into view as well
            // journeyContentContainer?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

function handleJourneyInteraction(event) {
    const targetNode = event.currentTarget;
    // Ensure it's a click or space/enter on the node itself
    if (targetNode.classList.contains('journey-node') &&
        (event.type === 'click' || (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))))
    {
        if(event.type === 'keydown') event.preventDefault(); // Prevent page scroll on space

        const step = targetNode.dataset.step;
        stopJourneyAutoAdvance(); // Stop auto-advance on user interaction

        if (step) {
            activateJourneyStep(step, { focusNode: true }); // Focus the node on manual interaction
        }
    }
}

function autoAdvanceJourney() {
     if (journeyNodeList.length === 0 || !journeyPath) return;

    const currentActiveNode = journeyPath.querySelector('.journey-node.active');
    const currentActiveIndex = currentActiveNode ? journeyNodeList.findIndex(node => node === currentActiveNode) : -1;

    const nextIndex = (currentActiveIndex + 1) % journeyNodeList.length;
    const nextStep = journeyNodeList[nextIndex]?.dataset.step;

    if (nextStep) {
        // console.log(`Auto-advancing to step: ${nextStep}`);
        activateJourneyStep(nextStep, { focusNode: false }); // DO NOT focus on auto-advance
    } else {
         // If nextStep is somehow invalid, stop the timer
        stopJourneyAutoAdvance();
    }
}

function setupJourneyObserver() {
    const financialJourneySection = document.getElementById('financial-journey');
    if (isJourneyObserverActive || !journeyPath || journeyNodeList.length === 0 || typeof IntersectionObserver !== 'function' || !financialJourneySection) {
         if (!isJourneyObserverActive) console.warn("Journey observer prerequisites not met.");
         return;
    }
    console.log("Setting up journey observers...");
    isJourneyObserverActive = true;

    // Observer 1: Trigger steps based on other sections scrolling into view
    const sectionTriggerOptions = {
        root: null,
        rootMargin: "-30% 0px -60% 0px", // Trigger when section is vertically centered
        threshold: 0.01
    };
    const sectionsToObserve = [
        { id: 'hero', step: 'awareness' },
        { id: 'free-resources', step: 'understanding' },
        { id: 'learning-hub', step: 'understanding' },
        { id: 'free-tools', step: 'organization' },
        { id: 'financial-tools-promo', step: 'action' },
        { id: 'personal-coaching', step: 'growth' }
    ];

    const sectionTriggerObserver = new IntersectionObserver((entries) => {
        let highestVisibleIndex = -1;
        let stepToActivate = null;
        let isIntersecting = false;

        entries.forEach(entry => {
             if (entry.isIntersecting) {
                 isIntersecting = true;
                 const targetSectionId = entry.target.id;
                 const mapping = sectionsToObserve.find(s => s.id === targetSectionId);
                 if (mapping?.step) {
                    const targetNodeIndex = journeyNodeList.findIndex(node => node.dataset.step === mapping.step);
                    if (targetNodeIndex > highestVisibleIndex) {
                        highestVisibleIndex = targetNodeIndex;
                        stepToActivate = mapping.step;
                    }
                 }
             }
         });

        // Stop auto-advance if user scrolls to a relevant trigger section
        if (isIntersecting) stopJourneyAutoAdvance();

        const currentActiveNode = journeyPath.querySelector('.journey-node.active');
        const currentActiveIndex = currentActiveNode ? journeyNodeList.findIndex(node => node === currentActiveNode) : -1;

         // Activate the step triggered by scrolling, only if it's ahead of current or if none active
         if (stepToActivate && (highestVisibleIndex > currentActiveIndex || currentActiveIndex === -1)) {
             // console.log(`Journey Section Trigger: Scrolling activated step "${stepToActivate}"`);
             activateJourneyStep(stepToActivate, { focusNode: false }); // Don't focus
         }
     }, sectionTriggerOptions);

    let observedTriggerCount = 0;
    sectionsToObserve.forEach(sectionInfo => {
        const sectionElement = document.getElementById(sectionInfo.id);
        if (sectionElement) {
            sectionTriggerObserver.observe(sectionElement);
            observedTriggerCount++;
        } else {
            console.warn(`Journey section trigger: Section ID "${sectionInfo.id}" not found.`);
        }
    });
    if (observedTriggerCount > 0) console.log(`Journey section trigger observer watching ${observedTriggerCount} sections.`);

    // Observer 2: Handle Auto-Advance based on #financial-journey visibility
    const autoAdvanceOptions = { root: null, threshold: 0.01 };
    const journeySectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.id === 'financial-journey') {
                if (entry.isIntersecting) {
                    // Start auto-advance if not already running
                    if (!journeyAutoAdvanceInterval) {
                        // console.log("Financial Journey section visible. Starting auto-advance.");
                        journeyAutoAdvanceInterval = setInterval(autoAdvanceJourney, JOURNEY_ADVANCE_DELAY);
                    }
                } else {
                    // Stop auto-advance when section is not visible
                    stopJourneyAutoAdvance();
                }
            }
        });
    }, autoAdvanceOptions);

    journeySectionObserver.observe(financialJourneySection);
    console.log("Journey auto-advance observer watching #financial-journey section.");
}

// --- Datalist Helper Functions ---
/**
 * Populates a datalist element with options from an array.
 * @param {HTMLDataListElement} datalistElement The <datalist> element to populate.
 * @param {string[]} optionsArray An array of strings for the options.
 */
function populateDatalist(datalistElement, optionsArray) {
    if (!datalistElement || !Array.isArray(optionsArray)) return;
    // Store current scroll position if applicable (though datalists rarely scroll)
    // const currentScrollTop = datalistElement.scrollTop;
    datalistElement.innerHTML = ''; // Clear existing options
    optionsArray.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        datalistElement.appendChild(option);
    });
    // Restore scroll position
    // datalistElement.scrollTop = currentScrollTop;
}

/**
 * Handles changes in a country input field to update the corresponding city datalist.
 * @param {Event} event The input event from the country field.
 */
function handleCountryChange(event) {
    const countryInput = event.target;
    const countryValue = countryInput.value.trim();
    let cityInput = null;
    let cityDatalist = null;

    // Find the corresponding city input and datalist within the SAME modal
    const modalContent = countryInput.closest('.modal-content');
    if (!modalContent) return; // Should not happen within modals

    if (modalContent.classList.contains('quiz-demographics-content')) {
        cityInput = quizCityInput;
        cityDatalist = quizCityDatalist;
    } else if (modalContent.classList.contains('pdf-download-content')) {
        cityInput = pdfCityInput;
        cityDatalist = pdfCityDatalist;
    }

    if (!cityInput || !cityDatalist) {
        console.error("Could not find corresponding city input/datalist for", countryInput.id);
        return;
    }

    // Check if Nigeria is selected (case-insensitive)
    if (countryValue.toLowerCase() === 'nigeria') {
        console.log(`Nigeria selected in ${countryInput.id}. Populating states.`);
        populateDatalist(cityDatalist, nigerianStatesList);
        cityInput.disabled = false;
        cityInput.placeholder = "State/City in Nigeria";
        cityInput.setAttribute('list', cityDatalist.id); // Ensure list attribute is set
    } else {
        // Check if the datalist is not already empty before clearing
        if (cityDatalist.options.length > 0) {
             console.log(`Non-Nigeria country selected/cleared in ${countryInput.id}. Clearing states.`);
            cityDatalist.innerHTML = ''; // Clear the datalist only if it had options
        }
        cityInput.disabled = true;   // Optionally disable
        cityInput.value = '';        // Optionally clear value
        cityInput.placeholder = "City (Select Country First)";
        // Remove or keep the list attribute? Keeping it but empty is fine.
        // cityInput.removeAttribute('list');
    }
}
// --- END Datalist Helper Functions ---


// --- Helper to open feedback modal (reusable) ---
function openFeedbackModal(triggerButton = null) { // Optional: pass the button that triggered it
    if (!feedbackModal) {
        console.error("Feedback modal not found.");
        return;
    }
    const feedbackForm = feedbackModal.querySelector('#feedback-testimonial-form');
    const responseElement = feedbackModal.querySelector('#feedback-form-response');
    const permissionGroup = feedbackModal.querySelector('.permission-group');
    const feedbackTypeSelect = feedbackModal.querySelector('#feedback-type');

    if (feedbackForm) {
        resetFormErrors('feedback-testimonial-form');
        feedbackForm.reset();
    }
    if (responseElement) responseElement.hidden = true;
    if (permissionGroup) permissionGroup.hidden = true;
    if (feedbackTypeSelect) feedbackTypeSelect.value = ""; // Reset select

    feedbackModal.hidden = false;
    document.body.classList.add('modal-open');

    // Optional: Store trigger button ID for returning focus on close
    if (triggerButton && triggerButton.id) {
        feedbackModal.dataset.triggeredBy = triggerButton.id;
    } else {
         delete feedbackModal.dataset.triggeredBy;
    }
    feedbackModal.querySelector('select, input, textarea')?.focus();
}


// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed. Initializing scripts...");

    // --- Cache Global DOM Elements ---
    quizModal = document.getElementById('quiz-modal');
    demographicsModal = document.getElementById('quiz-demographics-modal');
    pdfModal = document.getElementById('pdf-download-modal');
    feedbackModal = document.getElementById('feedback-modal');
    fabContainer = document.querySelector('.floating-action-btn');
    fabButton = document.querySelector('.fab-main');
    fabOptions = document.getElementById('fab-options-list');
    menuToggle = document.querySelector('.mobile-menu-toggle');
    primaryNav = document.getElementById('primary-navigation');
    journeyPath = document.querySelector('.journey-path');
    journeyNodes = document.querySelectorAll('.journey-node'); // NodeList
    journeyNodeList = Array.from(journeyNodes); // Convert to Array
    journeyContents = document.querySelectorAll('.journey-content');
    journeyContentContainer = document.querySelector('.journey-content-container');
    mainContentArea = document.getElementById('main-content');

    // MODIFICATION START: Cache datalist related elements
    quizCountryInput = document.getElementById('quiz-country');
    quizCityInput = document.getElementById('quiz-city');
    quizCountryDatalist = document.getElementById('country-list-options-quiz');
    quizCityDatalist = document.getElementById('city-list-options-quiz');

    pdfCountryInput = document.getElementById('pdf-country');
    pdfCityInput = document.getElementById('pdf-city');
    pdfCountryDatalist = document.getElementById('country-list-options-pdf');
    pdfCityDatalist = document.getElementById('city-list-options-pdf'); // Corrected ID reference here
    // MODIFICATION END

    // Check essential elements (optional, for debugging)
    // if (!quizModal) console.warn("Quiz Modal not found.");
    if (!mainContentArea) console.error("Main content area (#main-content) not found! Many listeners will fail.");


    // --- General UI Enhancements ---

    // Update Current Year
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

    // Scroll Animations
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger > *');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
         console.log(`Initializing IntersectionObserver for reveal animations.`);
         const scrollObserverOptions = { threshold: 0.1, rootMargin: '0px 0px -10% 0px' };
        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                     const target = entry.target;
                     // Apply delay if it's a direct child of reveal-stagger
                    if (target.parentElement.classList.contains('reveal-stagger')) {
                        const children = Array.from(target.parentElement.children);
                        const index = children.indexOf(target);
                        target.style.transitionDelay = `${index * 0.1}s`;
                    }
                    target.classList.add('revealed');
                    observer.unobserve(target);
                }
            });
        }, scrollObserverOptions);
        revealElements.forEach(el => scrollObserver.observe(el));
    } else { // Fallback or no elements
        revealElements.forEach(el => { el.classList.add('revealed'); el.style.transitionDelay = '0s'; });
        if (!('IntersectionObserver' in window)) console.warn("IntersectionObserver not supported, animations disabled.");
    }

    // Form Submit Ripple Effect
    document.body.addEventListener('click', function(e) {
        const button = e.target.closest('.form-submit-btn');
        if (button) {
            const existingRipple = button.querySelector('.btn-ripple');
            if(existingRipple) existingRipple.remove();

            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            button.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        }
    });


    // --- Mobile Navigation ---
    if (menuToggle && primaryNav) {
        console.log("Attaching mobile nav listener.");
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
            menuToggle.classList.toggle('active');
            primaryNav.classList.toggle('active');
            document.body.classList.toggle('modal-open', !isExpanded); // Use class for consistency

            if (!isExpanded) { // Menu is opening
                // Focus first focusable element
                primaryNav.querySelector('a[href], button:not([disabled])')?.focus();
            } else { // Menu is closing
                 menuToggle.focus(); // Return focus to toggle
            }
        });

        // Close menu when a link inside is clicked
        primaryNav.addEventListener('click', (e) => {
           if (e.target.matches('a') && primaryNav.classList.contains('active')) {
                 // Close menu by simulating click (easier state management)
                menuToggle.click();
           }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (primaryNav.classList.contains('active') &&
                !primaryNav.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                menuToggle.click();
            }
        });

        // Close menu when scrolling
        window.addEventListener('scroll', function() {
            if (primaryNav.classList.contains('active')) {
                menuToggle.click();
            }
        });

    } else {
        console.warn("Mobile nav toggle or primary nav element not found.");
    }


    // --- Populate Country Datalists on Load ---
    if (quizCountryDatalist && pdfCountryDatalist) {
        populateDatalist(quizCountryDatalist, countryList);
        populateDatalist(pdfCountryDatalist, countryList);
        console.log("Country datalists populated.");
    } else {
        console.warn("Could not find one or both country datalist elements.");
    }

    // --- Attach Country Input Listeners ---
    if (quizCountryInput) {
        quizCountryInput.addEventListener('input', handleCountryChange);
        // Add blur listener to validate exact match from list if needed
        // quizCountryInput.addEventListener('blur', validateDatalistSelection);
    } else {
        console.warn("Quiz country input not found.");
    }
    if (pdfCountryInput) {
        pdfCountryInput.addEventListener('input', handleCountryChange);
         // pdfCountryInput.addEventListener('blur', validateDatalistSelection);
    } else {
        console.warn("PDF country input not found.");
    }

    // --- Initialize City Inputs (Disabled by default) ---
    if(quizCityInput) quizCityInput.disabled = true;
    if(pdfCityInput) pdfCityInput.disabled = true;


    // --- Quiz Related Listeners ---

    // Start Quiz Buttons (Delegated on main content)
    if (mainContentArea) {
        mainContentArea.addEventListener('click', function(e) {
            const startButton = e.target.closest('.start-quiz-btn');
            if (startButton) {
                const categoryCard = startButton.closest('.category-card');
                if (categoryCard?.dataset.categoryId) {
                    handleQuizStart(categoryCard.dataset.categoryId);
                } else {
                    console.error("Missing category card or data-category-id.");
                }
            }
        });
    }

    // Quiz Modal Navigation/Close Buttons
    if (quizModal) {
        quizModal.addEventListener('click', function(e) {
            if (e.target.matches('#quiz-modal-next')) {
                if (currentQuestionIndex < currentQuestions.length - 1) {
                    currentQuestionIndex++;
                    displayQuestion();
                } else {
                    showQuizResults();
                }
            } else if (e.target.matches('#quiz-modal-restart')) {
                 if (currentCategoryId !== null) startQuiz(currentCategoryId);
            } else if (e.target.matches('#quiz-modal-close') || e.target.matches('#quiz-modal-close-results')) {
                 closeModal(quizModal);
            }
        });
    }

    // --- Quiz Demographics Form Validation ---
    const demographicsForm = document.getElementById('quiz-demographics-form');
    if (demographicsForm && demographicsModal) {
        demographicsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('quiz-demographics-form');
            let isValid = true;

            // Re-fetch inputs inside handler in case DOM changes
            const currentCountryInput = demographicsForm.querySelector('#quiz-country');
            const currentCityInput = demographicsForm.querySelector('#quiz-city');
            const takenBeforeRadios = demographicsForm.querySelectorAll('input[name="taken_before"]');
            const takenBeforeChecked = demographicsForm.querySelector('input[name="taken_before"]:checked');
            const radioFieldset = takenBeforeRadios.length > 0 ? takenBeforeRadios[0].closest('fieldset') : null;

            if (!currentCountryInput?.value.trim()) {
                showFeedback(currentCountryInput, 'Please enter your country'); isValid = false;
            } else showFeedback(currentCountryInput, '', false);

            // Validate City ONLY if it's enabled (i.e., Nigeria was selected)
            if (!currentCityInput.disabled && !currentCityInput?.value.trim()) {
                 showFeedback(currentCityInput, 'Please enter your state/city in Nigeria'); isValid = false;
            } else if (!currentCityInput.disabled) {
                 // Optionally, validate if the city input matches a Nigerian state if Nigeria is selected
                 // if (currentCountryInput.value.toLowerCase() === 'nigeria' && !nigerianStatesList.includes(currentCityInput.value)) {
                 //     showFeedback(currentCityInput, 'Please select a valid state/city from the list'); isValid = false;
                 // } else {
                     showFeedback(currentCityInput, '', false); // Clear error if valid or not required
                 // }
            } else {
                 showFeedback(currentCityInput, '', false); // Clear potential error if disabled
            }


            if (!takenBeforeChecked) {
                if(radioFieldset) showFeedback(radioFieldset, 'Please select an option', true); // Show error on fieldset
                 isValid = false;
            } else {
                if(radioFieldset) showFeedback(radioFieldset, '', false);
             }


            if (isValid) {
                quizDemographicsSubmitted = true;
                sessionStorage.setItem('quizDemographicsSubmitted', 'true');
                console.log('Submitting Demographics:', {
                    country: currentCountryInput.value,
                    city: currentCityInput.value,
                    taken_before: takenBeforeChecked.value
                 });

                closeModal(demographicsModal);
                const selectedCategoryId = sessionStorage.getItem('selectedQuizCategory');
                if (selectedCategoryId) {
                    startQuiz(selectedCategoryId); // Start the intended quiz
                } else console.error("No quiz category selected after demographics.");
            } else {
                // Focus first invalid field (input or first radio in group)
                 const firstError = demographicsForm.querySelector('.is-invalid, fieldset.is-invalid-check-group .form-check-input');
                 firstError?.focus();
            }
        });
        // Close Demographics Button
        const closeDemoBtn = demographicsModal.querySelector('#quiz-demographics-close');
        if (closeDemoBtn) closeDemoBtn.addEventListener('click', () => closeModal(demographicsModal));

    } else {
         console.warn("Quiz demographics form or modal not found.");
    }


    // --- PDF Download Functionality (using delegation) ---
    const pdfDownloadForm = document.getElementById('pdf-download-form');
    if (pdfDownloadForm && pdfModal && mainContentArea) {
         const closePdfButton = document.getElementById('pdf-download-close');

         // Open Modal Listener (delegated)
         mainContentArea.addEventListener('click', function(e){
             const pdfButton = e.target.closest('.get-pdf-btn'); // Handles button inside <a> or <button>
             if(pdfButton){
                const templateKey = pdfButton.dataset.templateKey;
                const templateKeyInput = pdfDownloadForm.querySelector('#pdf-template-key');

                if (templateKey && templateKeyInput && pdfModal) {
                    templateKeyInput.value = templateKey;
                    resetFormErrors('pdf-download-form');
                    pdfDownloadForm.reset();
                    // MODIFICATION START: Reset city state for PDF modal
                    if (pdfCityInput) {
                        pdfCityInput.value = '';
                        pdfCityInput.disabled = true;
                        pdfCityInput.placeholder = "City (Select Country First)";
                    }
                    if (pdfCityDatalist) {
                        pdfCityDatalist.innerHTML = '';
                    }
                    // MODIFICATION END
                    pdfModal.hidden = false;
                    document.body.classList.add('modal-open');
                    pdfModal.querySelector('input')?.focus();
                } else {
                    console.error("PDF download error: Missing key, input, or modal.");
                    alert("Sorry, unable to prepare download link.");
                }
            }
         });

        // Form Submission Listener
        pdfDownloadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('pdf-download-form');
            let isValid = true;
             // Re-fetch inputs inside handler
             const currentTemplateKeyInput = pdfDownloadForm.querySelector('#pdf-template-key');
             const currentCountryInput = pdfDownloadForm.querySelector('#pdf-country');
             const currentCityInput = pdfDownloadForm.querySelector('#pdf-city');

             if (!currentCountryInput?.value.trim()) { showFeedback(currentCountryInput, 'Please enter your country'); isValid = false; }
             else { showFeedback(currentCountryInput, '', false); }

             // Validate City ONLY if enabled (Nigeria selected)
             if (!currentCityInput.disabled && !currentCityInput?.value.trim()) { showFeedback(currentCityInput, 'Please enter your state/city'); isValid = false; }
             else if (!currentCityInput.disabled) { showFeedback(currentCityInput, '', false); }
             else { showFeedback(currentCityInput, '', false); } // Clear error if disabled


            if (isValid) {
                const templateKey = currentTemplateKeyInput.value;
                console.log('PDF Download Data:', {
                    template: templateKey,
                    country: currentCountryInput.value,
                    city: currentCityInput.value
                });

                 // Use a more robust relative path if possible
                 const pdfBaseUrl = '../../assets/pdfs/'; // Assumes JS is in assets/js/personal/
                 const pdfFilename = `${templateKey}.pdf`;
                 const pdfUrl = `${pdfBaseUrl}${pdfFilename}`;

                 console.log(`Attempting to download: ${pdfUrl}`); // Debug

                 // Improved download trigger
                 fetch(pdfUrl)
                     .then(response => {
                         if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}. Could not fetch PDF at ${pdfUrl}`);
                         }
                         return response.blob();
                     })
                     .then(blob => {
                         const blobUrl = window.URL.createObjectURL(blob);
                         const link = document.createElement('a');
                         link.href = blobUrl;
                         link.download = `${templateKey}_template_${Date.now()}.pdf`;
                         document.body.appendChild(link);
                         link.click();
                         document.body.removeChild(link);
                         window.URL.revokeObjectURL(blobUrl); // Clean up Blob URL
                         closeModal(pdfModal);
                     })
                     .catch(error => {
                         console.error('PDF Download failed:', error);
                         // Display user-friendly error IN the modal instead of alert
                         showFeedback(currentTemplateKeyInput, 'Error downloading PDF. File may be missing or path incorrect. Please try again later or contact support.', true); // Show general error
                     });

            } else {
                pdfDownloadForm.querySelector('.is-invalid')?.focus();
            }
        });

        // Close Modal Button
        if (closePdfButton) closePdfButton.addEventListener('click', () => closeModal(pdfModal));

    } else {
        console.warn("PDF Download functionality not fully initialized.");
    }


    // --- Spreadsheet Button Placeholder (using delegation) ---
    if (mainContentArea) {
        mainContentArea.addEventListener('click', function(e){
            const spreadsheetButton = e.target.closest('.get-spreadsheet-btn');
            if(spreadsheetButton){
                const templateName = spreadsheetButton.dataset.templateName || 'Template';
                const price = spreadsheetButton.dataset.price ? ` (₦${parseInt(spreadsheetButton.dataset.price).toLocaleString()})` : ''; // Format price if exists
                alert(`Interactive ${templateName} Spreadsheet coming soon!${price}`);
                // Prevent default if it's an anchor tag (though should be button now)
                 e.preventDefault();
            }
        });
    }


    // --- Feedback Modal ---
    const feedbackForm = document.getElementById('feedback-testimonial-form');
    if (feedbackForm && feedbackModal) {
        const openFeedbackButton = document.getElementById('open-feedback-modal-btn');
        const footerOpenFeedbackButton = document.getElementById('footer-open-feedback-btn');
        const closeFeedbackButton = feedbackModal.querySelector('#feedback-modal-close');
        const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
        const permissionGroup = feedbackForm.querySelector('.permission-group');
        const responseElement = feedbackForm.querySelector('#feedback-form-response');

        // Open Modal Listeners
        if (openFeedbackButton) openFeedbackButton.addEventListener('click', () => openFeedbackModal(openFeedbackButton));
        if (footerOpenFeedbackButton) footerOpenFeedbackButton.addEventListener('click', () => openFeedbackModal(footerOpenFeedbackButton));

        // Close Modal Listener
        if (closeFeedbackButton) closeFeedbackButton.addEventListener('click', () => closeModal(feedbackModal));

        // Show/hide permission checkbox
        if (feedbackTypeSelect && permissionGroup) {
            feedbackTypeSelect.addEventListener('change', function() {
                permissionGroup.hidden = this.value !== 'testimonial';
                 if (this.value !== 'testimonial') {
                     const cb = permissionGroup.querySelector('#feedback-permission');
                     if (cb) cb.checked = false;
                 }
            });
        }

        // Handle feedback form submission
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('feedback-testimonial-form');
            let isValid = true;

            const nameInput = document.getElementById('feedback-name');
            const emailInput = document.getElementById('feedback-email');
            const currentFeedbackTypeSelect = document.getElementById('feedback-type'); // re-fetch current select
            const messageTextarea = document.getElementById('feedback-message');
            const currentResponseElement = document.getElementById('feedback-form-response'); // Re-fetch current response element
            const permissionCheckbox = document.getElementById('feedback-permission');

             if (!currentFeedbackTypeSelect?.value) { showFeedback(currentFeedbackTypeSelect, 'Please select type'); isValid = false; }
             else showFeedback(currentFeedbackTypeSelect, '', false);

             if (!messageTextarea?.value.trim()) { showFeedback(messageTextarea, 'Please enter message'); isValid = false; }
             else showFeedback(messageTextarea, '', false);

             const emailValue = emailInput?.value.trim();
             // Email is optional, only validate format if provided
             if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                  showFeedback(emailInput, 'Invalid email format'); isValid = false;
             } else if(emailInput) {
                  showFeedback(emailInput, '', false); // Clear if valid or empty
             }

            if (isValid && currentResponseElement) {
                console.log('Submitting Feedback:', {
                    name: nameInput.value,
                    email: emailValue,
                    type: currentFeedbackTypeSelect.value,
                    message: messageTextarea.value,
                    permission: permissionCheckbox?.checked ?? false // Use checkbox state directly
                 });

                currentResponseElement.textContent = 'Thank you for your feedback!';
                currentResponseElement.className = 'form-response-note mt-md text-center success'; // Add success class if needed
                currentResponseElement.hidden = false;
                currentResponseElement.setAttribute('aria-live', 'assertive');

                feedbackForm.reset();
                if (permissionGroup) permissionGroup.hidden = true; // Hide permission again
                if (currentFeedbackTypeSelect) currentFeedbackTypeSelect.value = ""; // Reset dropdown

                 setTimeout(() => {
                     closeModal(feedbackModal);
                     if(currentResponseElement) currentResponseElement.hidden = true; // Hide response message after closing
                 }, 3000);

            } else if (!isValid) {
                 // Focus first error
                 const firstError = feedbackForm.querySelector('.is-invalid, fieldset.is-invalid-check-group .form-check-input');
                 firstError?.focus();
                if (currentResponseElement) currentResponseElement.hidden = true;
            }
        });
    } else {
         console.warn("Feedback form or modal element not found.");
    }


    // --- Coaching Interest Form ---
    const coachingForm = document.getElementById('coachingInterestForm');
    if (coachingForm) {
        coachingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('coachingInterestForm');
            const emailInput = document.getElementById('interest-email');
            const responseElement = document.getElementById('interest-form-response');

            if (!emailInput || !responseElement) return;

            const email = emailInput.value.trim();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                 showFeedback(emailInput, 'Please enter a valid email address');
                 responseElement.hidden = true;
            } else {
                showFeedback(emailInput, '', false);
                console.log('Submitting Coaching Interest:', { email: email });

                responseElement.textContent = 'Thank you! We’ll notify you soon.';
                responseElement.className = 'form-response-note mt-md success';
                responseElement.hidden = false;
                responseElement.setAttribute('aria-live', 'assertive');
                this.reset();

                setTimeout(() => { if(responseElement) responseElement.hidden = true; }, 5000);
            }
        });
    } else {
        console.warn("Coaching interest form not found.");
    }


    // --- Financial Journey Path Initialization ---
    if (journeyPath && journeyNodeList.length > 0 && journeyContents && journeyContents.length > 0) {
        console.log("Initializing Financial Journey Path.");
        journeyNodeList.forEach(node => {
            node.addEventListener('click', handleJourneyInteraction);
            node.addEventListener('keydown', handleJourneyInteraction);
        });

         const initialActiveStep = journeyNodeList[0]?.dataset.step;
         const alreadyActive = journeyPath.querySelector('.journey-node.active');
         if (initialActiveStep && !alreadyActive) {
             activateJourneyStep(initialActiveStep, { focusNode: false });
         }
         // Setup observers AFTER initial setup
         setupJourneyObserver();

    } else {
        console.warn("Financial Journey Path elements not fully initialized.");
    }


    // --- Floating Action Button (FAB) ---
    if (fabContainer && fabButton && fabOptions) {
        console.log("Initializing Floating Action Button (FAB).");
        fabButton.addEventListener('click', function() {
            const isExpanded = fabContainer.classList.toggle('active');
            fabButton.setAttribute('aria-expanded', String(isExpanded));
             fabOptions.hidden = !isExpanded; // Toggle hidden attribute

            if (isExpanded) {
                 // Apply stagger delays to visible items
                 const fabListItems = Array.from(fabOptions.querySelectorAll('li'));
                 fabListItems.forEach((item, index) => {
                    // Ensure item is visible before trying to apply delay styles maybe?
                    if (window.getComputedStyle(item).display !== 'none') {
                       item.style.setProperty('--delay', `${0.05 * (index + 1)}s`);
                    }
                 });
                 // Focus first item
                 fabOptions.querySelector('a[href], button')?.focus();
             } else {
                  fabButton.focus(); // Return focus to main button when closing
             }
        });

        // Close FAB if an option is clicked
        fabOptions.addEventListener('click', function(e) {
            if (e.target.closest('.fab-option')) {
                 if (fabContainer.classList.contains('active')) {
                     fabButton.click(); // Simulate click to close
                 }
            }
        });

         // Close FAB if clicked outside
         document.addEventListener('click', function(e) {
             if (fabContainer.classList.contains('active') && !fabContainer.contains(e.target)) {
                 fabButton.click();
             }
         });

    } else {
        console.warn("FAB elements not fully initialized.");
    }


    // --- Modal Global Close Handlers ---
    document.addEventListener('click', function(e) {
        // Close on overlay click
        if (e.target.classList.contains('modal-overlay')) {
            // Find the specific modal content inside the overlay clicked
            const modalToClose = e.target.querySelector('.modal-content')?.closest('.modal-overlay');
             if (modalToClose) {
                closeModal(modalToClose);
            }
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal-overlay:not([hidden])');
            if (openModal) {
                closeModal(openModal);
            } else if (fabContainer?.classList.contains('active')) {
                 fabButton.click(); // Close FAB
            } else if (primaryNav?.classList.contains('active')) {
                menuToggle.click(); // Close mobile nav
            }
        }
    });

     console.log("Personal page scripts initialized successfully.");

}); // End DOMContentLoaded
