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
const QUIZ_STATS_STORAGE_KEY = 'rofilidQuizStats'; // Key for local storage


// --- DOM Element References (Cached on DOMContentLoaded) ---
let quizModal, demographicsModal, pdfModal, feedbackModal;
let fabContainer, fabButton, fabOptions;
let journeyPath, journeyNodes, journeyContents, journeyContentContainer; // journeyNodes is NodeList
let menuToggle, primaryNav; // Mobile Nav elements
let mainContentArea;
let journeyNodeList = []; // Array copy for easier index finding
let learningHubContainer; // Added caching for learning hub section if needed
// Datalist element references
let quizCountryInput, quizCityInput, quizCountryDatalist, quizCityDatalist;
let pdfCountryInput, pdfCityInput, pdfCountryDatalist, pdfCityDatalist;
// Cached quiz modal elements (add others as needed)
let quizModalNextBtn, quizModalFeedbackEl, quizModalResultsEl, quizModalQuestionEl, quizModalOptionsEl, quizModalProgressCurrentEl, quizModalProgressTotalEl, quizModalTitleEl, quizModalRestartBtn, quizModalCloseResultsBtn, quizModalFullChallengePromptEl;


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
        // Check if ANY modal is still open *after* hiding the current one
        // We query *again* inside a brief timeout to allow the DOM to update
        setTimeout(() => {
            const anyModalOpen = document.querySelector('.modal-overlay:not([hidden])');
            if (!anyModalOpen) {
                // Remove class only if *no* modals are open anymore
                document.body.classList.remove('modal-open');
            }
        }, 50); // Small delay to ensure DOM update

        // Optional: Return focus to the trigger element
        const triggerId = modalElement.dataset.triggeredBy;
        const triggerElement = triggerId ? document.getElementById(triggerId) : null;
         if (triggerElement) {
            triggerElement.focus();
         }
         // Clear the trigger attribute after using it
         delete modalElement.dataset.triggeredBy;
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


// --- Local Storage Helper Functions ---

/**
 * Safely retrieves quiz statistics from localStorage.
 * @returns {object} Parsed stats object or an empty object if none found/error.
 */
function getQuizStats() {
    try {
        const statsJSON = localStorage.getItem(QUIZ_STATS_STORAGE_KEY);
        return statsJSON ? JSON.parse(statsJSON) : {};
    } catch (e) {
        console.error("Error reading quiz stats from localStorage:", e);
        return {}; // Return empty object on error
    }
}

/**
 * Safely saves quiz statistics to localStorage.
 * @param {object} stats The quiz stats object to save.
 */
function saveQuizStats(stats) {
    try {
        localStorage.setItem(QUIZ_STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error("Error saving quiz stats to localStorage:", e);
        // Potentially inform user if storage is full? Example:
        // if (e.name === 'QuotaExceededError') {
        //     alert("Could not save quiz progress: Browser storage is full.");
        // }
    }
}

/**
 * Updates the statistics for a completed quiz category. This is called ONLY when results are shown.
 * @param {number|string} categoryId The ID of the completed category.
 * @param {number} achievedScore The score achieved in the latest attempt.
 * @param {number} totalQuestions The total questions in the quiz.
 */
function updateQuizStats(categoryId, achievedScore, totalQuestions) {
    if (typeof categoryId === 'undefined' || categoryId === null) {
        console.error("Cannot update stats: categoryId is undefined or null.");
        return;
    }
    const catIdStr = String(categoryId); // Ensure key is string
    const stats = getQuizStats();
    const existingCategoryStats = stats[catIdStr];

    // Check if the current attempt results are already stored for this category
    // This is a safety check to prevent duplicate attempt increments if showQuizResults is accidentally called twice
    if (existingCategoryStats && existingCategoryStats.score === achievedScore && existingCategoryStats.timestamp && (Date.now() - existingCategoryStats.timestamp < 10000)) { // Check if timestamp is very recent
         // console.warn(`Attempt count for category ${catIdStr} might be inflated. Duplicate results detected shortly after previous save.`);
         // Optionally return here to prevent incrementing attempts multiple times rapidly
         // return; // Decide if you want to strictly prevent this. For now, let it proceed but be aware.
    }


    let attempts = 1; // Default to 1 attempt if this is the first time completing
    if (existingCategoryStats?.completed) {
        attempts = (existingCategoryStats.attempts || 0) + 1; // Increment existing attempts if completed before
    }

    const bestScore = existingCategoryStats?.bestScore !== undefined && existingCategoryStats.bestScore > -1
                      ? Math.max(existingCategoryStats.bestScore, achievedScore)
                      : achievedScore; // Calculate new best score, handling initial state

    // Prepare the new stats entry for this category
    const newCategoryStats = {
        attempts: attempts,
        bestScore: bestScore,
        completed: true,
        score: achievedScore, // Last score
        total: totalQuestions,
        lastPercentage: totalQuestions > 0 ? Math.round((achievedScore / totalQuestions) * 100) : 0,
        timestamp: Date.now(), // Record timestamp of this result save
    };

    stats[catIdStr] = newCategoryStats;
    saveQuizStats(stats);
    console.log(`Stats updated for category ${catIdStr}: Attempts=${attempts}, Best=${bestScore}, Last=${achievedScore}`);

    // After saving, update the UI immediately for the specific card
    updateCategoryCardUI(catIdStr);
}


/**
 * Reads stats and updates the UI for all category cards on page load.
 */
function initializeQuizUIFromStats() {
    const stats = getQuizStats();
    const categoryCards = document.querySelectorAll('.category-card[data-category-id]');

    if (!categoryCards.length) {
        console.log("No category cards found to update from stats.");
        return;
    }

    let completedCount = 0;
    const totalCategories = categoryCards.length; // Assuming one card per category ID in HTML

    categoryCards.forEach(card => {
        const categoryId = card.dataset.categoryId;
        if (categoryId) {
            const catIdStr = String(categoryId);
            updateCategoryCardUI(catIdStr, stats); // Pass stats to avoid repeated reads
            if (stats[catIdStr]?.completed) {
                completedCount++;
            }
        }
    });

    // Update an overall progress message
    const progressMessageArea = document.getElementById('quiz-progress-message'); // Add this div in HTML
    if (progressMessageArea) {
        if (completedCount > 0 && totalCategories > 0) {
             progressMessageArea.textContent = `You've completed ${completedCount} of ${totalCategories} introductory checks! Keep learning!`;
             progressMessageArea.hidden = false;
        } else {
             progressMessageArea.hidden = true;
        }
    }
    console.log(`Initialized UI based on stored stats. ${completedCount}/${totalCategories} completed.`);
}

/**
 * Updates the UI of a single category card based on stored stats.
 * @param {string|number} categoryId The ID of the category card to update.
 * @param {object} [stats] Optional: Pre-fetched stats object to avoid re-reading localStorage.
 */
function updateCategoryCardUI(categoryId, stats) {
    if (typeof categoryId === 'undefined' || categoryId === null) return;
    const catIdStr = String(categoryId);
    const card = document.querySelector(`.category-card[data-category-id="${catIdStr}"]`);
    if (!card) {
         // console.warn(`Category card with ID ${catIdStr} not found for UI update.`);
         return;
    }

    const currentStats = stats || getQuizStats(); // Use passed stats or fetch fresh
    const categoryData = currentStats[catIdStr];
    const startButton = card.querySelector('.start-quiz-btn');
    let indicatorArea = card.querySelector('.quiz-completion-indicator');

    // Ensure indicator area exists (create if not)
    if (!indicatorArea) {
        indicatorArea = document.createElement('div');
        indicatorArea.className = 'quiz-completion-indicator fs-sm text-muted mt-sm'; // Add some styling classes
        // Insert it before the button, for example
        startButton?.parentNode.insertBefore(indicatorArea, startButton);
    }

    indicatorArea.innerHTML = ''; // Clear previous indicator

    if (categoryData?.completed) {
        card.classList.add('completed'); // Optional visual cue for the card
        if (startButton) {
            startButton.innerHTML = '<i class="fas fa-redo" aria-hidden="true"></i> Retake Check';
            startButton.classList.replace('btn-secondary', 'btn-outline'); // Change style for retake
            startButton.setAttribute('aria-label', `Retake ${card.querySelector('h4')?.textContent || 'Quiz'}`);
        }
        // Show best score
        const bestScoreDisplay = categoryData.bestScore !== undefined ? categoryData.bestScore : 'N/A';
        const totalDisplay = categoryData.total !== undefined ? categoryData.total : 'N/A';
        indicatorArea.innerHTML = `✔️ Completed (Best: ${bestScoreDisplay}/${totalDisplay})`;
        indicatorArea.style.color = 'var(--pp-color-success)'; // Make indicator green

    } else {
        card.classList.remove('completed');
        if (startButton) {
            startButton.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i> Start Check';
            startButton.classList.replace('btn-outline', 'btn-secondary'); // Reset to original style
             startButton.setAttribute('aria-label', `Start ${card.querySelector('h4')?.textContent || 'Quiz'}`);
        }
        indicatorArea.innerHTML = ''; // Clear if not completed
        indicatorArea.style.color = ''; // Reset color
    }
}


// --- Datalist Helper Functions ---
/**
 * Populates a datalist element with options from an array.
 * @param {HTMLDataListElement} datalistElement The <datalist> element to populate.
 * @param {string[]} optionsArray An array of strings for the options.
 */
function populateDatalist(datalistElement, optionsArray) {
    if (!datalistElement || !Array.isArray(optionsArray)) return;
    datalistElement.innerHTML = ''; // Clear existing options
    optionsArray.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        datalistElement.appendChild(option);
    });
}

/**
 * Handles changes in a country input field to update the corresponding city datalist and input state.
 * @param {Event} event The input event from the country field.
 */
function handleCountryChange(event) {
    const countryInput = event.target;
    const countryValue = countryInput.value.trim();
    let cityInput = null;
    let cityDatalist = null;

    // Find the corresponding city input and datalist within the SAME modal
    const modalContent = countryInput.closest('.modal-content');
    if (!modalContent) return;

    // Determine which pair of city input/datalist to use based on the modal
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

    const isNigeria = countryValue.toLowerCase() === 'nigeria';

    if (isNigeria) {
        // Nigeria is selected
        // console.log(`Nigeria selected in ${countryInput.id}. Populating states.`);
        populateDatalist(cityDatalist, nigerianStatesList);
        cityInput.disabled = false;
        cityInput.placeholder = "Select State/City in Nigeria";
        cityInput.setAttribute('list', cityDatalist.id); // Ensure list attribute is set
    } else if (countryValue) {
        // Another country is selected (and the input is not empty)
        // console.log(`Non-Nigeria country '${countryValue}' selected in ${countryInput.id}. Allowing manual city input.`);
        cityInput.disabled = false; // **ENABLE** manual input
        cityInput.placeholder = "Enter City/Town"; // Update placeholder
        cityDatalist.innerHTML = ''; // Clear Nigerian states
        cityInput.removeAttribute('list'); // Remove list attribute to prevent stale suggestions
    } else {
        // Country input is empty
        // console.log(`Country cleared in ${countryInput.id}. Disabling city.`);
        cityInput.disabled = true; // Disable city input
        cityInput.value = '';      // Clear city value
        cityInput.placeholder = "City (Select Country First)";
        cityDatalist.innerHTML = ''; // Clear datalist options
        cityInput.removeAttribute('list');
    }
     // Always clear any validation errors on the city field when the country changes
     showFeedback(cityInput, '', false);
}
// --- END Datalist Helper Functions ---


// --- Quiz Functions ---
function startQuiz(categoryId) {
    if (!quizModal) {
        console.error("Quiz modal element not cached or found! Cannot start quiz.");
        return;
    }
    if (typeof categoryId === 'undefined' || categoryId === null) {
        console.error("Cannot start quiz: categoryId is undefined or null.");
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
    currentCategoryId = categoryIdNum; // Store the ID of the quiz being taken
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;

    // Initial setup using cached elements
    quizModalTitleEl.textContent = currentQuestions[0]?.category || 'Quiz';
    quizModalProgressTotalEl.textContent = currentQuestions.length;
    quizModalResultsEl.hidden = true; // Ensure results are hidden initially
    quizModalFullChallengePromptEl.hidden = true;
    quizModalRestartBtn.hidden = true;
    quizModalCloseResultsBtn.hidden = true;
    quizModalFeedbackEl.hidden = true; // Ensure immediate feedback area is hidden initially
    quizModalNextBtn.hidden = true; // Ensure next button is hidden initially
    quizModalQuestionEl.hidden = false; // Show question area
    quizModalOptionsEl.hidden = false; // Show options area
    quizModalOptionsEl.innerHTML = ''; // Clear options

    // Show modal
    quizModal.hidden = false;
    document.body.classList.add('modal-open');

    displayQuestion();
    // Focus first interactive element in modal (might be the close button initially)
    quizModal.querySelector('button')?.focus();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length || !quizModal) {
        // Safety net: If somehow displayQuestion is called after the last question, go to results.
        // This should typically be handled by handleAnswerSelection now.
        showQuizResults();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];

    // Ensure question/options are visible and feedback/results are hidden
    quizModalQuestionEl.hidden = false;
    quizModalOptionsEl.hidden = false;
    quizModalFeedbackEl.hidden = true; // Hide previous feedback
    quizModalResultsEl.hidden = true; // Hide results area
    quizModalNextBtn.hidden = true; // Hide next button when showing a new question

    // Update progress and question text
    quizModalProgressCurrentEl.textContent = currentQuestionIndex + 1;
    quizModalQuestionEl.textContent = question.question;
    quizModalOptionsEl.innerHTML = ''; // Clear previous options

    // ARIA setup
    quizModalQuestionEl.id = quizModalQuestionEl.id || 'quiz-modal-question';
    quizModalOptionsEl.setAttribute('aria-labelledby', quizModalQuestionEl.id);

    question.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        optionButton.classList.add('btn', 'btn-outline', 'quiz-option');
        optionButton.textContent = option;
        optionButton.setAttribute('data-index', index.toString());
        optionButton.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
        optionButton.addEventListener('click', handleAnswerSelection); // Add listener here
        quizModalOptionsEl.appendChild(optionButton);
    });
     // Ensure focus is reasonable, perhaps on the first option after loading
     setTimeout(() => quizModalOptionsEl.querySelector('.quiz-option')?.focus(), 150);
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

    // Show immediate feedback (correct/incorrect explanation)
    if (quizModalFeedbackEl) {
        quizModalFeedbackEl.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${question.explanation || ''}`;
        quizModalFeedbackEl.className = 'quiz-modal-feedback p-md border rounded mb-lg'; // Reset classes
        quizModalFeedbackEl.classList.add(isCorrect ? 'correct' : 'incorrect');
        quizModalFeedbackEl.hidden = false; // Show feedback
    }

    // Disable all option buttons and style them
    const optionButtons = quizModalOptionsEl.querySelectorAll('.quiz-option');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        const buttonIndex = parseInt(btn.dataset.index);
        // Determine classes for correct/incorrect feedback styling
        let btnClass = '';
        if (buttonIndex === question.correctAnswerIndex) {
            btnClass = 'correct btn-success-light'; // Green feedback
        } else if (buttonIndex === selectedIndex && !isCorrect) {
            btnClass = 'incorrect btn-danger-light'; // Red feedback
        } else {
             btnClass = 'btn-outline'; // Keep outline if neither selected nor correct
        }

        // Apply classes (remove outline if applying color, keep if not)
        btn.classList.remove('btn-outline', 'btn-success-light', 'btn-danger-light', 'correct', 'incorrect');
        if (btnClass.includes('btn-success-light') || btnClass.includes('btn-danger-light')) {
            btn.classList.add(...btnClass.split(' '));
        } else {
            btn.classList.add('btn-outline'); // Ensure it's outline if not correct/incorrect
        }
    });

    // Check if this was the LAST question
    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;

    if (isLastQuestion) {
        // Last question answered: Proceed to show results after a delay
        if (quizModalNextBtn) quizModalNextBtn.hidden = true; // Ensure it's hidden *before* the delay starts
        setTimeout(showQuizResults, 1200); // Delay results display
    } else {
        // Not the last question: Show the "Next Question" button
        if (quizModalNextBtn) {
            quizModalNextBtn.hidden = false;
            setTimeout(() => quizModalNextBtn.focus(), 100); // Focus it
        }
    }
}


function showQuizResults() {
    if (!quizModal) return;

    // Explicitly hide question, options, feedback, and the next button
    quizModalQuestionEl.hidden = true;
    quizModalOptionsEl.hidden = true;
    quizModalFeedbackEl.hidden = true;
    quizModalNextBtn.hidden = true; // Ensure next button is hidden *now*

    const totalQuestions = currentQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Update local storage stats
    if (currentCategoryId !== null) {
        updateQuizStats(currentCategoryId, score, totalQuestions);
    } else {
        console.error("Cannot update stats: currentCategoryId is null.");
    }

    // Generate feedback message based on performance and history
    const stats = getQuizStats();
    const catIdStr = currentCategoryId !== null ? String(currentCategoryId) : null;
    const categoryStats = catIdStr ? stats[catIdStr] : undefined;
    let message = '';
    let prefix = '';

    const currentAttempts = categoryStats?.attempts || 1;

    if (currentAttempts > 1) {
        prefix = `Attempt #${currentAttempts}: `;
        const bestScore = categoryStats?.bestScore ?? -1;
        if (score === bestScore && score === totalQuestions) message = `Perfect score again! Well done!`;
        else if (score === bestScore) message = `Great effort, matching your best score!`;
        else if (score > (categoryStats?.score ?? -1) && score <= bestScore) message = `Improvement noted! Your best score remains ${bestScore}/${totalQuestions}. Keep going!`;
        else message = `Keep practicing! Your best score is ${bestScore > -1 ? `${bestScore}/${totalQuestions}` : 'N/A'}.`;
    } else {
        prefix = 'First completed attempt: ';
        if (percentage >= 80) message = 'Excellent! You have a strong understanding.';
        else if (percentage >= 60) message = 'Good job! Keep building on your knowledge.';
        else message = 'Keep practicing! Review the concepts and try again.';
    }

    // Clear previous results content and rebuild
    quizModalResultsEl.innerHTML = `
        <h4>Quiz Complete!</h4>
        <p>${prefix}You scored ${score} out of ${totalQuestions} (${percentage}%).</p>
        <p>${message}</p>
    `;

    // Determine next steps (next quiz or full challenge prompt)
    const nextCategoryId = currentCategoryId !== null ? currentCategoryId + 1 : null;
    let nextCategory = null;
    if (nextCategoryId !== null && introQuizQuestions.some(q => q.categoryId === nextCategoryId)) {
        nextCategory = introQuizQuestions.find(q => q.categoryId === nextCategoryId);
    }

    // Clear any dynamically added 'Next Check' buttons from previous results displays
    const existingNextButtons = quizModalResultsEl.querySelectorAll('.next-quiz-button');
    existingNextButtons.forEach(btn => btn.remove());

    if (nextCategory) {
        // There is a next category check available
        const nextCategoryName = nextCategory.category || `Check ${nextCategoryId}`;
        quizModalResultsEl.innerHTML += `<p class="mt-lg">Continue your learning journey with the next check:</p>`;
        const nextQuizButton = document.createElement('button');
        nextQuizButton.type = 'button';
        nextQuizButton.classList.add('btn', 'btn-primary', 'btn-small', 'btn-icon', 'mt-sm', 'next-quiz-button');
        nextQuizButton.innerHTML = `<i class="fas fa-arrow-right" aria-hidden="true"></i> Take ${nextCategoryName} Check`;
        nextQuizButton.onclick = () => {
            if (nextCategoryId !== null) handleQuizStart(nextCategoryId);
            else console.error("Attempted to start next quiz with null categoryId.");
        };
        quizModalResultsEl.appendChild(nextQuizButton);
        quizModalFullChallengePromptEl.hidden = true; // Hide 100q prompt
    } else {
        // Last category or no next category defined
        quizModalResultsEl.innerHTML += `<p class="mt-lg">You've completed all the introductory checks!</p>`;
        quizModalFullChallengePromptEl.hidden = false; // Show 100q prompt
    }

    // Show the results section and appropriate action buttons
    quizModalResultsEl.hidden = false;
    quizModalRestartBtn.hidden = false;
    quizModalCloseResultsBtn.hidden = false;
    quizModalRestartBtn.focus(); // Focus restart button
}



function handleQuizStart(categoryId) {
    sessionStorage.setItem('selectedQuizCategory', categoryId.toString());

    if (!demographicsModal) {
        // console.warn("Demographics modal not found, starting quiz directly.");
        startQuiz(categoryId);
        return;
    }

    // Check if demographics *session* flag is set OR if quiz category has been previously *completed*
    const stats = getQuizStats();
    const categoryCompleted = stats[String(categoryId)]?.completed;

    if (!quizDemographicsSubmitted && !categoryCompleted) {
        resetFormErrors('quiz-demographics-form');
        const form = demographicsModal.querySelector('#quiz-demographics-form');
        if (form) form.reset();
        // Reset city field state when showing demo modal
        if (quizCountryInput) quizCountryInput.value = ''; // Clear country as well
        if (quizCityInput) {
            quizCityInput.value = '';
            quizCityInput.disabled = true;
            quizCityInput.placeholder = "City (Select Country First)";
            quizCityInput.removeAttribute('list'); // Ensure list attribute is removed initially
        }
        if (quizCityDatalist) {
            quizCityDatalist.innerHTML = ''; // Clear Nigeria states
        }
        demographicsModal.hidden = false;
        document.body.classList.add('modal-open');
        // Try to get the button ID more reliably
        const triggerButton = document.querySelector(`.category-card[data-category-id="${categoryId}"] .start-quiz-btn`);
        demographicsModal.dataset.triggeredBy = triggerButton?.id || `start-quiz-btn-${categoryId}`;
        // Focus first input (country input)
        demographicsModal.querySelector('#quiz-country')?.focus();
    } else {
        // Skip demographics if session flag is set OR if this specific quiz was already completed
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
    if (!journeyPath || journeyNodeList.length === 0 || !journeyContents || journeyContents.length === 0 || !journeyContentContainer) {
         // console.warn("Journey path elements not available for activation.");
         return;
    }

    let activeIndex = -1;
    let foundActive = false;
    let activeNodeElement = null;

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
        // Keep 'activated' class for nodes up to and including the active one
         node.classList.toggle('activated', index <= activeIndex);
    });

     if (!foundActive) {
         console.warn(`Step "${step}" not found or invalid in journey path.`);
         return;
     }

    // Calculate and update vertical progress bar height for mobile
    const totalNodes = journeyNodeList.length;
    const progressPercent = totalNodes > 1 ? (activeIndex / (totalNodes - 1)) * 100 : (activeIndex >= 0 ? 100 : 0);
    journeyPath.style.setProperty('--journey-progress-height', `${progressPercent}%`);

    let contentFound = false;
    journeyContents.forEach(content => {
        const contentId = `journey-content-${step}`;
        const isActive = content.id === contentId;
        content.hidden = !isActive;
        if (isActive) {
            contentFound = true;
             // Make content visible immediately if its step is activated
             content.style.display = 'block';
             requestAnimationFrame(() => { // Ensure display change is processed before animation
                  content.style.opacity = '1';
                  content.style.transform = 'translateY(0)';
             });
        } else {
             // Reset styles for inactive content panels for re-animation
             content.style.display = 'none'; // Hide using display none when inactive
             content.style.opacity = '0';
             content.style.transform = 'translateY(20px)';
        }
    });

     if (!contentFound) {
         console.warn(`Journey content panel with ID "journey-content-${step}" not found.`);
         journeyContents.forEach(content => content.hidden = true);
     }

    if (options.focusNode && activeNodeElement) {
        setTimeout(() => {
            activeNodeElement.focus({ preventScroll: false }); // Allow scroll if needed
        }, 100); // Slight delay may help
    }
}

function handleJourneyInteraction(event) {
    const targetNode = event.currentTarget;
    if (targetNode.classList.contains('journey-node') &&
        (event.type === 'click' || (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))))
    {
        if(event.type === 'keydown') event.preventDefault();

        const step = targetNode.dataset.step;
        stopJourneyAutoAdvance(); // User interacted, stop auto-advance

        if (step) {
            activateJourneyStep(step, { focusNode: true });
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
        activateJourneyStep(nextStep, { focusNode: false });
    } else {
        stopJourneyAutoAdvance(); // Should not happen with modulo, but safety first
    }
}

function setupJourneyObserver() {
    const financialJourneySection = document.getElementById('financial-journey');
    if (isJourneyObserverActive || !journeyPath || journeyNodeList.length === 0 || typeof IntersectionObserver !== 'function' || !financialJourneySection) {
         if (!isJourneyObserverActive) console.warn("Journey observer prerequisites not met.");
         return;
    }
    // console.log("Setting up journey observers...");
    isJourneyObserverActive = true;

    const sectionTriggerOptions = {
        root: null,
        rootMargin: "-30% 0px -60% 0px", // Adjust margins to control when steps trigger
        threshold: 0.01
    };
    // Map sections to journey steps
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
        let isIntersecting = false; // Track if *any* relevant section is intersecting

        entries.forEach(entry => {
             if (entry.isIntersecting) {
                 isIntersecting = true;
                 const targetSectionId = entry.target.id;
                 const mapping = sectionsToObserve.find(s => s.id === targetSectionId);
                 if (mapping?.step) {
                    const targetNodeIndex = journeyNodeList.findIndex(node => node.dataset.step === mapping.step);
                    // Update stepToActivate if this intersecting section's step is higher
                    if (targetNodeIndex > highestVisibleIndex) {
                        highestVisibleIndex = targetNodeIndex;
                        stepToActivate = mapping.step;
                    }
                 }
             }
         });

         // Only stop auto-advance if a *mapped* section is intersecting
         if (isIntersecting && stepToActivate) stopJourneyAutoAdvance();

         const currentActiveNode = journeyPath.querySelector('.journey-node.active');
         const currentActiveIndex = currentActiveNode ? journeyNodeList.findIndex(node => node === currentActiveNode) : -1;

         // Activate the step only if it's further along than the current one
         if (stepToActivate && highestVisibleIndex > currentActiveIndex) {
             activateJourneyStep(stepToActivate, { focusNode: false });
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
    // if (observedTriggerCount > 0) console.log(`Journey section trigger observer watching ${observedTriggerCount} sections.`);

    // Intersection observer for the #financial-journey section itself (for auto-advance control)
    const autoAdvanceOptions = { root: null, threshold: 0.01 }; // Trigger when even a small part is visible
    const journeySectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.id === 'financial-journey') {
                if (entry.isIntersecting) {
                     // Section is visible, start auto-advance IF NOT ALREADY running
                     if (!journeyAutoAdvanceInterval) {
                          // console.log("Journey section visible, starting auto-advance.");
                          journeyAutoAdvanceInterval = setInterval(autoAdvanceJourney, JOURNEY_ADVANCE_DELAY);
                     }
                 } else {
                     // Section is NOT visible, stop auto-advance
                      if (journeyAutoAdvanceInterval) {
                          // console.log("Journey section not visible, stopping auto-advance.");
                          stopJourneyAutoAdvance();
                      }
                 }
            }
        });
    }, autoAdvanceOptions);

    journeySectionObserver.observe(financialJourneySection);
    // console.log("Journey auto-advance observer watching #financial-journey section.");
}


// --- Helper to open feedback modal (reusable) ---
function openFeedbackModal(triggerButton = null) {
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
    primaryNav = document.getElementById('primary-navigation'); // The UL element
    journeyPath = document.querySelector('.journey-path');
    journeyNodes = document.querySelectorAll('.journey-node'); // NodeList
    journeyNodeList = Array.from(journeyNodes); // Convert to Array
    journeyContents = document.querySelectorAll('.journey-content');
    journeyContentContainer = document.querySelector('.journey-content-container');
    mainContentArea = document.getElementById('main-content');
    learningHubContainer = document.getElementById('learning-hub'); // Cache learning hub section

    // Cache datalist related elements
    quizCountryInput = document.getElementById('quiz-country');
    quizCityInput = document.getElementById('quiz-city');
    quizCountryDatalist = document.getElementById('country-list-options-quiz');
    quizCityDatalist = document.getElementById('city-list-options-quiz');

    pdfCountryInput = document.getElementById('pdf-country');
    pdfCityInput = document.getElementById('pdf-city');
    pdfCountryDatalist = document.getElementById('country-list-options-pdf');
    pdfCityDatalist = document.getElementById('city-list-options-pdf'); // Corrected ID

    // --- Cache Quiz Modal Inner Elements ---
    if (quizModal) {
        quizModalNextBtn = quizModal.querySelector('#quiz-modal-next');
        quizModalFeedbackEl = quizModal.querySelector('#quiz-modal-feedback');
        quizModalResultsEl = quizModal.querySelector('#quiz-modal-results');
        quizModalQuestionEl = quizModal.querySelector('#quiz-modal-question');
        quizModalOptionsEl = quizModal.querySelector('#quiz-modal-options');
        quizModalProgressCurrentEl = quizModal.querySelector('#quiz-modal-q-current');
        quizModalProgressTotalEl = quizModal.querySelector('#quiz-modal-q-total');
        quizModalTitleEl = quizModal.querySelector('#quiz-modal-title');
        quizModalRestartBtn = quizModal.querySelector('#quiz-modal-restart');
        quizModalCloseResultsBtn = quizModal.querySelector('#quiz-modal-close-results');
        quizModalFullChallengePromptEl = quizModal.querySelector('#quiz-modal-full-challenge-prompt');
    } else {
        console.error("Quiz modal root element not found. Cannot cache inner elements.");
    }


    // --- General UI Enhancements ---
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger > *');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
         // console.log(`Initializing IntersectionObserver for reveal animations.`);
         const scrollObserverOptions = { threshold: 0.1, rootMargin: '0px 0px -10% 0px' };
        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                     const target = entry.target;
                     // Retrieve delay directly from the element's dataset or style if needed
                     const delay = target.style.transitionDelay || (target.dataset.delay ? `${parseFloat(target.dataset.delay) * 0.1}s` : '0s');

                     // Apply delay for stagger if specified via JS/HTML dataset
                     if (target.parentElement.classList.contains('reveal-stagger') && target.dataset.index) {
                        target.style.transitionDelay = `${parseInt(target.dataset.index) * 0.1}s`;
                     } else if (delay !== '0s') {
                        target.style.transitionDelay = delay;
                     }

                     target.classList.add('revealed');
                     observer.unobserve(target); // Stop observing once revealed
                 }
            });
        }, scrollObserverOptions);

         // Assign index for stagger children if needed (alternative to CSS nth-child)
         document.querySelectorAll('.reveal-stagger').forEach(container => {
            Array.from(container.children).forEach((child, index) => {
               if (!child.dataset.index) child.dataset.index = index.toString();
            });
         });

         revealElements.forEach(el => scrollObserver.observe(el));
    } else {
        revealElements.forEach(el => { el.classList.add('revealed'); el.style.transitionDelay = '0s'; });
        if (!('IntersectionObserver' in window)) console.warn("IntersectionObserver not supported, animations disabled.");
    }


    // Button Ripple Effect
    document.body.addEventListener('click', function(e) {
        const button = e.target.closest('.form-submit-btn, .btn'); // Apply to more buttons if desired
        if (button && !button.disabled) { // Don't ripple disabled buttons
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
            // Clean up ripple element after animation
            ripple.addEventListener('animationend', () => {
                if(ripple.parentNode) { // Check if still attached
                     ripple.remove();
                }
            }, { once: true });
        }
    });


    // --- Mobile Navigation ---
    if (menuToggle && primaryNav) {
        // console.log("Attaching mobile nav listener.");
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
            menuToggle.classList.toggle('active');
            primaryNav.classList.toggle('active'); // Toggle active on the UL itself
            // Toggle body scroll lock based on NEW state
            document.body.classList.toggle('modal-open', !isExpanded);

            // Focus management
            if (!isExpanded) { // If opening
                primaryNav.querySelector('a[href], button:not([disabled])')?.focus();
            } else { // If closing
                 menuToggle.focus();
            }
        });

        // Close nav when a link inside is clicked
        primaryNav.addEventListener('click', (e) => {
           if (e.target.matches('a') && primaryNav.classList.contains('active')) {
                // Click the toggle button to ensure consistent closing behavior
                menuToggle.click();
           }
        });

        // Close nav on clicking outside
        document.addEventListener('click', function(e) {
            if (primaryNav.classList.contains('active') &&
                !primaryNav.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                 // console.log("Closing nav via outside click");
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
        // console.log("Country datalists populated.");
    } else {
        console.warn("Could not find one or both country datalist elements.");
    }

    // --- Attach Country Input Listeners ---
    if (quizCountryInput) {
        quizCountryInput.addEventListener('input', handleCountryChange);
    } else {
        console.warn("Quiz country input not found.");
    }
    if (pdfCountryInput) {
        pdfCountryInput.addEventListener('input', handleCountryChange);
    } else {
        console.warn("PDF country input not found.");
    }

    // --- Initialize City Inputs (Disabled by default) ---
    if(quizCityInput) quizCityInput.disabled = true;
    if(pdfCityInput) pdfCityInput.disabled = true;


    // --- Initialize Quiz UI based on localStorage ---
    initializeQuizUIFromStats();


    // --- Quiz Related Listeners ---
    if (mainContentArea) {
        mainContentArea.addEventListener('click', function(e) {
            const startButton = e.target.closest('.start-quiz-btn');
            if (startButton) {
                const categoryCard = startButton.closest('.category-card');
                const categoryId = categoryCard?.dataset.categoryId;
                if (categoryId) {
                    // Store trigger ID for focus return later
                     startButton.id = startButton.id || `start-quiz-btn-${categoryId}`;
                    handleQuizStart(categoryId);
                } else {
                    console.error("Missing category card or data-category-id.");
                }
            }
        });
    }


    // --- Quiz Modal Event Listeners --- UPDATED ---
    if (quizModal) {
        quizModal.addEventListener('click', function(e) {
            // Handle Next Question click - GUARD ADDED
            if (e.target.matches('#quiz-modal-next')) {
                 // *** NEW GUARD ***: Only proceed if results are NOT currently shown
                 if (quizModalResultsEl && quizModalResultsEl.hidden === true) {
                     currentQuestionIndex++;
                     displayQuestion();
                 } else {
                      console.warn("Next button clicked while results are visible. Ignoring.");
                 }
            }
            // Handle Restart click
            else if (e.target.matches('#quiz-modal-restart')) {
                 if (currentCategoryId !== null) {
                     // Reset score/index before starting again for the UI
                     score = 0;
                     currentQuestionIndex = 0;
                     userAnswers = [];
                     startQuiz(currentCategoryId); // Re-start the current quiz
                 } else {
                      console.warn("Attempted restart with no currentCategoryId.");
                 }
            }
            // Handle Close buttons (main close and results close)
            else if (e.target.matches('#quiz-modal-close') || e.target.matches('#quiz-modal-close-results')) {
                 closeModal(quizModal);
            }
            // Handle dynamic "Take Next Check" button in results
            // The click handler for this is attached dynamically in showQuizResults()
            else if (e.target.closest('.next-quiz-button')) {
                 // Logic is handled by the inline onclick added in showQuizResults
            }
        });
    } else {
        console.warn("Quiz modal not found, event listeners not attached.");
    }


    // --- Quiz Demographics Form Validation ---
    const demographicsForm = document.getElementById('quiz-demographics-form');
    if (demographicsForm && demographicsModal) {
        demographicsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('quiz-demographics-form');
            let isValid = true;

            const currentCountryInput = demographicsForm.querySelector('#quiz-country');
            const currentCityInput = demographicsForm.querySelector('#quiz-city');
            const takenBeforeRadios = demographicsForm.querySelectorAll('input[name="taken_before"]');
            const takenBeforeChecked = demographicsForm.querySelector('input[name="taken_before"]:checked');
            const radioFieldset = takenBeforeRadios.length > 0 ? takenBeforeRadios[0].closest('fieldset') : null;

            if (!currentCountryInput?.value.trim()) {
                showFeedback(currentCountryInput, 'Please enter your country'); isValid = false;
            } else showFeedback(currentCountryInput, '', false);

            // City is now always required if the country is entered, as it's enabled
            if (!currentCityInput?.disabled && !currentCityInput?.value.trim()) {
                 showFeedback(currentCityInput, 'Please enter your city/state'); isValid = false;
            } else if (!currentCityInput?.disabled) {
                 showFeedback(currentCityInput, '', false); // Clear error if valid
            } else {
                 showFeedback(currentCityInput, '', false); // Clear error if disabled (country empty)
            }

            if (!takenBeforeChecked) {
                if(radioFieldset) showFeedback(radioFieldset, 'Please select an option', true);
                 isValid = false;
            } else {
                if(radioFieldset) showFeedback(radioFieldset, '', false);
             }


            if (isValid) {
                quizDemographicsSubmitted = true; // Set flag for this session
                sessionStorage.setItem('quizDemographicsSubmitted', 'true');
                // console.log('Submitting Demographics:', {
                //     country: currentCountryInput.value,
                //     city: currentCityInput.value,
                //     taken_before: takenBeforeChecked.value
                //  });

                closeModal(demographicsModal); // Close demographics modal
                const selectedCategoryId = sessionStorage.getItem('selectedQuizCategory');
                if (selectedCategoryId) {
                    startQuiz(selectedCategoryId); // Start the quiz directly
                } else console.error("No quiz category selected after demographics.");
            } else {
                 // Focus the first invalid field for accessibility
                 const firstError = demographicsForm.querySelector('.is-invalid, fieldset.is-invalid-check-group .form-check-input');
                 firstError?.focus();
            }
        });
        const closeDemoBtn = demographicsModal.querySelector('#quiz-demographics-close');
        if (closeDemoBtn) closeDemoBtn.addEventListener('click', () => closeModal(demographicsModal));
    } else {
         console.warn("Quiz demographics form or modal not found.");
    }


    // --- PDF Download Functionality ---
    const pdfDownloadForm = document.getElementById('pdf-download-form');
    if (pdfDownloadForm && pdfModal && mainContentArea) {
         const closePdfButton = document.getElementById('pdf-download-close');

         mainContentArea.addEventListener('click', function(e){
             const pdfButton = e.target.closest('.get-pdf-btn');
             if(pdfButton){
                 const templateKey = pdfButton.dataset.templateKey;
                 const templateKeyInput = pdfDownloadForm.querySelector('#pdf-template-key');

                if (templateKey && templateKeyInput && pdfModal) {
                     templateKeyInput.value = templateKey;
                     resetFormErrors('pdf-download-form');
                     pdfDownloadForm.reset();
                     // Reset city state for PDF modal
                    if (pdfCountryInput) pdfCountryInput.value = ''; // Clear country input
                     if (pdfCityInput) {
                         pdfCityInput.value = '';
                         pdfCityInput.disabled = true;
                         pdfCityInput.placeholder = "City (Select Country First)";
                         pdfCityInput.removeAttribute('list');
                     }
                    if (pdfCityDatalist) pdfCityDatalist.innerHTML = '';

                     pdfModal.hidden = false;
                     document.body.classList.add('modal-open');
                     pdfModal.dataset.triggeredBy = pdfButton.id || `pdf-btn-${templateKey}`; // Store trigger ID
                     pdfModal.querySelector('#pdf-country')?.focus(); // Focus country input
                } else {
                     console.error("PDF download error: Missing key, input, or modal.");
                     alert("Sorry, unable to prepare download link.");
                 }
            }
         });

        pdfDownloadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('pdf-download-form');
            let isValid = true;
             const currentTemplateKeyInput = pdfDownloadForm.querySelector('#pdf-template-key');
             const currentCountryInput = pdfDownloadForm.querySelector('#pdf-country');
             const currentCityInput = pdfDownloadForm.querySelector('#pdf-city');
             // Locate a general error message area within the PDF form if possible
             const pdfErrorFeedbackArea = pdfDownloadForm.querySelector('.form-response-note') || currentCityInput.nextElementSibling; // Fallback

             if (!currentCountryInput?.value.trim()) { showFeedback(currentCountryInput, 'Please enter your country'); isValid = false; }
             else { showFeedback(currentCountryInput, '', false); }

            // City is required if country is entered
             if (!currentCityInput?.disabled && !currentCityInput?.value.trim()) {
                showFeedback(currentCityInput, 'Please enter your city/state'); isValid = false;
             } else if (!currentCityInput?.disabled) {
                showFeedback(currentCityInput, '', false);
             } else {
                 showFeedback(currentCityInput, '', false); // Clear error if disabled
             }

            if (isValid) {
                const templateKey = currentTemplateKeyInput.value;
                // console.log('PDF Download Data:', {
                //     template: templateKey,
                //     country: currentCountryInput.value,
                //     city: currentCityInput.value
                // });

                 // Construct the relative path more carefully
                 // Assuming 'personal.js' is in assets/js/personal/
                 // And PDFs are in assets/pdfs/
                 const pdfBaseUrl = '../../assets/pdfs/'; // Path relative to the HTML file location
                 const pdfFilename = `${templateKey}.pdf`;
                 const pdfUrl = `${pdfBaseUrl}${pdfFilename}`;
                 // console.log(`Attempting to download: ${pdfUrl}`);

                 fetch(pdfUrl)
                     .then(response => {
                         if (!response.ok) {
                             throw new Error(`HTTP error! Status: ${response.status}. File: ${pdfFilename} at URL ${pdfUrl}`);
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
                         window.URL.revokeObjectURL(blobUrl);
                         closeModal(pdfModal); // Close modal on success
                     })
                     .catch(error => {
                         console.error('PDF Download failed:', error);
                         // Display user-friendly error within the modal
                         if(pdfErrorFeedbackArea){
                              pdfErrorFeedbackArea.textContent = 'Error: Could not download the PDF. The file may not be available or the path is incorrect.';
                              pdfErrorFeedbackArea.className = 'form-response-note error mt-md'; // Style as error
                              pdfErrorFeedbackArea.hidden = false;
                              pdfErrorFeedbackArea.setAttribute('aria-live', 'assertive');
                         } else {
                              // Fallback alert if no dedicated error area found
                             alert('Error downloading PDF. File may not be available.');
                         }
                          // Optionally associate the error with a specific field for screen readers
                          if(currentTemplateKeyInput) showFeedback(currentTemplateKeyInput, 'Download failed, check availability.', true);

                     });

            } else {
                 pdfDownloadForm.querySelector('.is-invalid')?.focus();
            }
        });

        if (closePdfButton) closePdfButton.addEventListener('click', () => closeModal(pdfModal));

    } else {
        console.warn("PDF Download functionality not fully initialized. Check form, modal, or main area refs.");
    }


    // --- Spreadsheet Button Placeholder ---
    if (mainContentArea) {
        mainContentArea.addEventListener('click', function(e){
            const spreadsheetButton = e.target.closest('.get-spreadsheet-btn');
            if(spreadsheetButton){
                e.preventDefault(); // Prevent any default link behavior
                const templateName = spreadsheetButton.dataset.templateName || 'Template';
                const price = spreadsheetButton.dataset.price ? ` (₦${parseInt(spreadsheetButton.dataset.price).toLocaleString()})` : '';
                alert(`Interactive ${templateName} Spreadsheet coming soon!${price}`);
                 spreadsheetButton.blur(); // Remove focus after alert
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
        const responseElement = feedbackForm.querySelector('#feedback-form-response'); // Cache response element here

        // Ensure response element exists and is hidden initially
         if(responseElement) responseElement.hidden = true;

        if (openFeedbackButton) openFeedbackButton.addEventListener('click', () => openFeedbackModal(openFeedbackButton));
        if (footerOpenFeedbackButton) footerOpenFeedbackButton.addEventListener('click', () => openFeedbackModal(footerOpenFeedbackButton));
        if (closeFeedbackButton) closeFeedbackButton.addEventListener('click', () => closeModal(feedbackModal));

        if (feedbackTypeSelect && permissionGroup) {
            feedbackTypeSelect.addEventListener('change', function() {
                permissionGroup.hidden = this.value !== 'testimonial';
                 if (this.value !== 'testimonial') {
                     const cb = permissionGroup.querySelector('#feedback-permission');
                     if (cb) cb.checked = false; // Uncheck permission if not testimonial
                 }
            });
        }

        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('feedback-testimonial-form');
            if (responseElement) responseElement.hidden = true; // Hide response initially on submit
            let isValid = true;

            const nameInput = document.getElementById('feedback-name');
            const emailInput = document.getElementById('feedback-email');
            const currentFeedbackTypeSelect = document.getElementById('feedback-type');
            const messageTextarea = document.getElementById('feedback-message');
            const permissionCheckbox = document.getElementById('feedback-permission');


             if (!currentFeedbackTypeSelect?.value) { showFeedback(currentFeedbackTypeSelect, 'Please select type'); isValid = false; }
             else showFeedback(currentFeedbackTypeSelect, '', false);

             if (!messageTextarea?.value.trim()) { showFeedback(messageTextarea, 'Please enter message'); isValid = false; }
             else showFeedback(messageTextarea, '', false);

             const emailValue = emailInput?.value.trim();
             // Validate email only if entered
             if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                  showFeedback(emailInput, 'Invalid email format'); isValid = false;
             } else if(emailInput) {
                  showFeedback(emailInput, '', false); // Clear potential previous error if valid or empty
             }

            if (isValid && responseElement) {
                // console.log('Submitting Feedback:', {
                //     name: nameInput.value,
                //     email: emailValue,
                //     type: currentFeedbackTypeSelect.value,
                //     message: messageTextarea.value,
                //     permission: permissionCheckbox?.checked ?? false // Default to false if not present
                //  });

                 // Show success message
                responseElement.textContent = 'Thank you for your feedback!';
                responseElement.className = 'form-response-note mt-md text-center success';
                responseElement.hidden = false;
                responseElement.setAttribute('aria-live', 'assertive');

                feedbackForm.reset(); // Reset the form fields
                if (permissionGroup) permissionGroup.hidden = true; // Hide permission section again
                if (currentFeedbackTypeSelect) currentFeedbackTypeSelect.value = ""; // Reset select


                 setTimeout(() => {
                     closeModal(feedbackModal);
                 }, 3000);

            } else if (!isValid) {
                 const firstError = feedbackForm.querySelector('.is-invalid, fieldset.is-invalid-check-group .form-check-input');
                 firstError?.focus();
                 if (responseElement) responseElement.hidden = true; // Ensure response element is hidden if form is invalid
            } else if (!responseElement) {
                 console.error("Feedback form response element not found.");
            }
        });
    } else {
         console.warn("Feedback form or modal element not found.");
    }


    // --- Coaching Interest Form ---
    const coachingForm = document.getElementById('coachingInterestForm');
    if (coachingForm) {
        const responseElement = document.getElementById('interest-form-response');
        if (responseElement) responseElement.hidden = true; // Hide initially

        coachingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('coachingInterestForm'); // Use consistent error reset
            const emailInput = document.getElementById('interest-email');
            // Response element is cached above

            if (!emailInput || !responseElement) {
                 console.error("Coaching form elements missing.");
                 return;
             }

            responseElement.hidden = true; // Hide response on new submission attempt

            const email = emailInput.value.trim();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                 showFeedback(emailInput, 'Please enter a valid email address', true);
            } else {
                showFeedback(emailInput, '', false); // Clear error
                // console.log('Submitting Coaching Interest:', { email: email });

                // Show success message
                responseElement.textContent = 'Thank you! We’ll notify you soon.';
                responseElement.className = 'form-response-note mt-md success'; // Added 'success' class
                responseElement.hidden = false;
                responseElement.setAttribute('aria-live', 'assertive');
                this.reset(); // Reset form fields
                 emailInput.blur(); // Remove focus from input

                 // Optional: Hide success message after a delay
                 setTimeout(() => { if(responseElement) responseElement.hidden = true; }, 5000);
            }
        });
    } else {
        console.warn("Coaching interest form not found.");
    }


    // --- Financial Journey Path Initialization ---
    if (journeyPath && journeyNodeList.length > 0 && journeyContents && journeyContents.length > 0) {
        // console.log("Initializing Financial Journey Path.");
        journeyNodeList.forEach(node => {
            node.addEventListener('click', handleJourneyInteraction);
            node.addEventListener('keydown', handleJourneyInteraction);
        });

         const initialActiveStep = journeyNodeList[0]?.dataset.step;
         const alreadyActive = journeyPath.querySelector('.journey-node.active');
         if (initialActiveStep && !alreadyActive) {
              // Activate the first step without focus and immediately show its content
              activateJourneyStep(initialActiveStep, { focusNode: false });
         } else if (alreadyActive) {
             // If a step is already active (e.g., due to linking), ensure its content is shown
             const activeStep = alreadyActive.dataset.step;
             if (activeStep) {
                  const contentPanel = document.getElementById(`journey-content-${activeStep}`);
                  if (contentPanel) contentPanel.hidden = false;
              }
         }

         // Setup observers *after* potentially activating the initial step
         setupJourneyObserver();

    } else {
        console.warn("Financial Journey Path elements not fully initialized.");
    }


    // --- Floating Action Button (FAB) ---
    if (fabContainer && fabButton && fabOptions) {
        // console.log("Initializing Floating Action Button (FAB).");
        fabButton.addEventListener('click', function() {
             const isExpanded = fabContainer.classList.toggle('active');
             fabButton.setAttribute('aria-expanded', String(isExpanded));
             fabOptions.hidden = !isExpanded;

             // Clear any existing delays when closing
             if (!isExpanded) {
                 fabOptions.querySelectorAll('li').forEach(item => {
                      item.style.transitionDelay = '0s'; // Remove delay instantly
                 });
             } else {
                 // Apply staggered delay only when opening
                 const fabListItems = Array.from(fabOptions.querySelectorAll('li'));
                 fabListItems.forEach((item, index) => {
                     // Use style directly for delay as dataset might not be available/needed
                      item.style.transitionDelay = `${0.05 * (index + 1)}s`;
                 });
                 // Focus the first focusable item in the list after a small delay
                 setTimeout(() => {
                      fabOptions.querySelector('a[href], button')?.focus();
                 }, 50); // Small delay helps ensure focus works after transition starts
             }
        });

         // Close FAB when an option is clicked
         fabOptions.addEventListener('click', function(e) {
             if (e.target.closest('.fab-option')) {
                 if (fabContainer.classList.contains('active')) {
                     fabButton.click(); // Simulate click on main button to close
                 }
             }
         });

         // Close FAB when clicking outside
         document.addEventListener('click', function(e) {
             if (fabContainer.classList.contains('active') && !fabContainer.contains(e.target)) {
                 fabButton.click();
             }
         });

         // Close FAB on Escape key press handled globally below

    } else {
        console.warn("FAB elements not fully initialized.");
    }


    // --- Modal Global Close Handlers ---
    document.addEventListener('click', function(e) {
        // Close modal on overlay click
        if (e.target.classList.contains('modal-overlay')) {
            // Find the direct modal content child to get the corresponding overlay
            const modalContent = e.target.querySelector(':scope > .modal-content');
             if (modalContent) {
                const modalToClose = modalContent.closest('.modal-overlay');
                 if (modalToClose) {
                     closeModal(modalToClose);
                 }
             }
         }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
             const openModal = document.querySelector('.modal-overlay:not([hidden])');
             const isNavOpen = primaryNav?.classList.contains('active');
             const isFabOpen = fabContainer?.classList.contains('active');

             if (openModal) {
                 // Prioritize closing the topmost modal
                 closeModal(openModal);
             } else if (isNavOpen) {
                 // Close mobile nav if open and no modal is open
                  menuToggle.click();
             } else if (isFabOpen) {
                  // Close FAB if open and no modal/nav is open
                  fabButton.click();
             }
         }
    });

     console.log("Personal page scripts initialized successfully.");

}); // End DOMContentLoaded
