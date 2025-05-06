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
let isJourneyObserverActive = false;
let journeyAutoAdvanceInterval = null;
const JOURNEY_ADVANCE_DELAY = 4000;
const QUIZ_STATS_STORAGE_KEY = 'rofilidQuizStats';
const STANDARD_FEEDBACK_VISIBILITY_DURATION = 1200; // ms to show Correct/Incorrect before next action


// --- DOM Element References (Cached on DOMContentLoaded) ---
let quizModal, demographicsModal, pdfModal, feedbackModal;
let fabContainer, fabButton, fabOptions;
let journeyPath, journeyNodes, journeyContents, journeyContentContainer;
let menuToggle, primaryNav;
let mainContentArea;
let journeyNodeList = [];
let learningHubContainer;
let quizCountryInput, quizCityInput, quizCountryDatalist, quizCityDatalist;
let pdfCountryInput, pdfCityInput, pdfCountryDatalist, pdfCityDatalist;
let quizModalNextBtn, quizModalFeedbackEl, quizModalResultsEl, quizModalQuestionEl, quizModalOptionsEl, quizModalProgressCurrentEl, quizModalProgressTotalEl, quizModalTitleEl, quizModalRestartBtn, quizModalCloseResultsBtn, quizModalFullChallengePromptEl;


// --- Utility Functions ---

/**
 * Shuffles array in place.
 * @param {Array} array items An array containing the items.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


function updateBodyScrollLock() {
    const anyModalOpen = document.querySelector('.modal-overlay:not([hidden])');
    const isMobileNavOpen = primaryNav && primaryNav.classList.contains('active');
    if (anyModalOpen || isMobileNavOpen) {
        document.body.classList.add('modal-open');
    } else {
        document.body.classList.remove('modal-open');
    }
}

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

    const invalidFieldsets = form.querySelectorAll('.is-invalid-check-group');
    invalidFieldsets.forEach(fieldset => {
        fieldset.classList.remove('is-invalid-check-group');
        const legend = fieldset.querySelector('legend');
        if (legend) legend.style.color = ''; 
        fieldset.querySelectorAll('.form-check-label.text-danger').forEach(label => label.classList.remove('text-danger'));
    });
}

function closeModal(modalElement) {
    if (modalElement && !modalElement.hidden) {
        modalElement.hidden = true;
        updateBodyScrollLock(); 

        const triggerId = modalElement.dataset.triggeredBy;
        const triggerElement = triggerId ? document.getElementById(triggerId) : null;
         if (triggerElement) {
            triggerElement.focus();
         }
         delete modalElement.dataset.triggeredBy;
    }
}

function showFeedback(fieldElement, message, isError = true) {
    if (!fieldElement) return;

    let feedbackElement = null;
    let containerElement = fieldElement; 

    const parentGroup = fieldElement.closest('.form-group, fieldset');

    if (parentGroup) {
        feedbackElement = parentGroup.querySelector('.invalid-feedback');
        if (fieldElement.type === 'radio' || fieldElement.type === 'checkbox') {
            containerElement = parentGroup; 
        }
    }
    if (!feedbackElement && fieldElement.getAttribute('aria-describedby')) {
        const describedById = fieldElement.getAttribute('aria-describedby').split(' ')[0];
        feedbackElement = document.getElementById(describedById);
    }


    if (feedbackElement) {
        feedbackElement.textContent = message;
        feedbackElement.style.display = message ? 'block' : 'none';
        feedbackElement.setAttribute('aria-live', message ? 'polite' : 'off');
    }

    if (containerElement) {
        const errorClass = (containerElement.tagName === 'FIELDSET') ? 'is-invalid-check-group' : 'is-invalid';

        if (isError && message) {
            containerElement.classList.add(errorClass);
             if (errorClass === 'is-invalid-check-group' && containerElement.tagName === 'FIELDSET') {
                containerElement.querySelectorAll('.form-check-input').forEach(input => input.classList.add('is-invalid'));
                containerElement.querySelectorAll('.form-check-label').forEach(label => label.classList.add('text-danger'));
            }
        } else {
            containerElement.classList.remove(errorClass);
            if (errorClass === 'is-invalid-check-group' && containerElement.tagName === 'FIELDSET') {
                containerElement.querySelectorAll('.form-check-input.is-invalid').forEach(input => input.classList.remove('is-invalid'));
                containerElement.querySelectorAll('.form-check-label.text-danger').forEach(label => label.classList.remove('text-danger'));
            }
             if (feedbackElement && !message) { 
                feedbackElement.style.display = 'none';
                feedbackElement.setAttribute('aria-live', 'off');
             }
        }
    }
}


// --- Local Storage Helper Functions (Unchanged from previous correct version) ---
function getQuizStats() {
    try {
        const statsJSON = localStorage.getItem(QUIZ_STATS_STORAGE_KEY);
        return statsJSON ? JSON.parse(statsJSON) : {};
    } catch (e) {
        console.error("Error reading quiz stats from localStorage:", e);
        return {};
    }
}

function saveQuizStats(stats) {
    try {
        localStorage.setItem(QUIZ_STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
        console.error("Error saving quiz stats to localStorage:", e);
    }
}

function updateQuizStats(categoryId, achievedScore, totalQuestions) {
    if (typeof categoryId === 'undefined' || categoryId === null) {
        console.error("Cannot update stats: categoryId is undefined or null.");
        return;
    }
    const catIdStr = String(categoryId);
    const stats = getQuizStats();
    const existingCategoryStats = stats[catIdStr];

    let attempts = 1;
    if (existingCategoryStats?.completed) {
        attempts = (existingCategoryStats.attempts || 0) + 1;
    }

    const bestScore = existingCategoryStats?.bestScore !== undefined && existingCategoryStats.bestScore > -1
                      ? Math.max(existingCategoryStats.bestScore, achievedScore)
                      : achievedScore;

    const newCategoryStats = {
        attempts: attempts,
        bestScore: bestScore,
        completed: true,
        score: achievedScore,
        total: totalQuestions,
        lastPercentage: totalQuestions > 0 ? Math.round((achievedScore / totalQuestions) * 100) : 0,
        timestamp: Date.now(),
    };

    stats[catIdStr] = newCategoryStats;
    saveQuizStats(stats);
    updateCategoryCardUI(catIdStr);
}

function initializeQuizUIFromStats() {
    const stats = getQuizStats();
    const categoryCards = document.querySelectorAll('.category-card[data-category-id]');

    if (!categoryCards.length) return;

    let completedCount = 0;
    const totalCategories = categoryCards.length;

    categoryCards.forEach(card => {
        const categoryId = card.dataset.categoryId;
        if (categoryId) {
            updateCategoryCardUI(String(categoryId), stats);
            if (stats[String(categoryId)]?.completed) {
                completedCount++;
            }
        }
    });

    const progressMessageArea = document.getElementById('quiz-progress-message');
    if (progressMessageArea) {
        if (completedCount > 0 && totalCategories > 0) {
             progressMessageArea.textContent = `You've completed ${completedCount} of ${totalCategories} introductory checks! Keep learning!`;
             progressMessageArea.hidden = false;
        } else {
             progressMessageArea.hidden = true;
        }
    }
}

function updateCategoryCardUI(categoryId, stats) {
    if (typeof categoryId === 'undefined' || categoryId === null) return;
    const catIdStr = String(categoryId);
    const card = document.querySelector(`.category-card[data-category-id="${catIdStr}"]`);
    if (!card) return;

    const currentStats = stats || getQuizStats();
    const categoryData = currentStats[catIdStr];
    const startButton = card.querySelector('.start-quiz-btn');
    let indicatorArea = card.querySelector('.quiz-completion-indicator');

    if (!indicatorArea && startButton) {
        indicatorArea = document.createElement('div');
        indicatorArea.className = 'quiz-completion-indicator'; 
        startButton.parentNode.insertBefore(indicatorArea, startButton);
    }
    if (!indicatorArea) return; 

    indicatorArea.innerHTML = '';

    if (categoryData?.completed) {
        card.classList.add('completed');
        if (startButton) {
            startButton.innerHTML = '<i class="fas fa-redo" aria-hidden="true"></i> Retake Check';
            startButton.setAttribute('aria-label', `Retake ${card.querySelector('h4')?.textContent || 'Quiz'}`);
        }
        const bestScoreDisplay = categoryData.bestScore !== undefined ? categoryData.bestScore : 'N/A';
        const totalDisplay = categoryData.total !== undefined ? categoryData.total : 'N/A';
        indicatorArea.innerHTML = `✔️ Completed (Best: ${bestScoreDisplay}/${totalDisplay})`;
        indicatorArea.style.color = 'var(--pp-color-success)';
    } else {
        card.classList.remove('completed');
        if (startButton) {
            startButton.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i> Start Check';
            startButton.setAttribute('aria-label', `Start ${card.querySelector('h4')?.textContent || 'Quiz'}`);
        }
        indicatorArea.innerHTML = '';
        indicatorArea.style.color = '';
    }
}


// --- Datalist Helper Functions ---
function populateDatalist(datalistElement, optionsArray) {
    if (!datalistElement || !Array.isArray(optionsArray)) return;
    datalistElement.innerHTML = '';
    optionsArray.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        datalistElement.appendChild(option);
    });
}

function handleCountryChange(event) {
    const countryInput = event.target;
    const countryValue = countryInput.value.trim();
    let cityInput, cityDatalist;

    const modalContent = countryInput.closest('.modal-content');
    if (!modalContent) return;

    if (modalContent.classList.contains('quiz-demographics-content')) {
        cityInput = quizCityInput; cityDatalist = quizCityDatalist;
    } else if (modalContent.classList.contains('pdf-download-content')) {
        cityInput = pdfCityInput; cityDatalist = pdfCityDatalist;
    }

    if (!cityInput || !cityDatalist) {
        return;
    }

    const isNigeria = countryValue.toLowerCase() === 'nigeria';
    cityDatalist.innerHTML = ''; 

    if (isNigeria) {
        populateDatalist(cityDatalist, nigerianStatesList);
        cityInput.disabled = false;
        cityInput.placeholder = "Select State/City in Nigeria";
        cityInput.setAttribute('list', cityDatalist.id);
    } else if (countryValue) { 
        cityInput.disabled = false;
        cityInput.placeholder = "Enter City/Town";
        cityInput.removeAttribute('list'); 
    } else { 
        cityInput.disabled = true;
        cityInput.value = '';
        cityInput.placeholder = "City (Select Country First)";
        cityInput.removeAttribute('list');
    }
    showFeedback(cityInput, '', false); 
}


// --- Quiz Functions ---
function startQuiz(categoryId) {
    if (!quizModal || !quizModalTitleEl) { 
        console.error("Quiz modal or its core elements not cached! Cannot start quiz.");
        return;
    }
    if (typeof categoryId === 'undefined' || categoryId === null) {
        console.error("Cannot start quiz: categoryId is invalid.");
        return;
    }

    const categoryIdNum = parseInt(categoryId);
    currentQuestions = introQuizQuestions.filter(q => q.categoryId === categoryIdNum);

    if (currentQuestions.length === 0) {
        console.error(`No questions for category ID: ${categoryIdNum}`);
        alert('Sorry, questions for this category are currently unavailable.');
        return;
    }

    currentCategoryId = categoryIdNum;
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;

    // Initial UI state for starting/restarting a quiz
    quizModalTitleEl.textContent = currentQuestions[0]?.category || 'Quiz';
    if(quizModalProgressTotalEl) quizModalProgressTotalEl.textContent = currentQuestions.length;
    
    if(quizModalResultsEl) quizModalResultsEl.hidden = true; // Hide results area
    if(quizModalFeedbackEl) quizModalFeedbackEl.hidden = true; // Hide feedback/explanation area
    if(quizModalFullChallengePromptEl) quizModalFullChallengePromptEl.hidden = true;
    
    // Ensure all action buttons are in their initial (hidden) state for a new quiz/question
    if(quizModalRestartBtn) quizModalRestartBtn.hidden = true; 
    if(quizModalCloseResultsBtn) quizModalCloseResultsBtn.hidden = true;
    if(quizModalNextBtn) quizModalNextBtn.hidden = true;
    
    if(quizModalQuestionEl) quizModalQuestionEl.hidden = false; // Show question area
    if(quizModalOptionsEl) {
        quizModalOptionsEl.hidden = false; // Show options area
        quizModalOptionsEl.innerHTML = '';
    }

    quizModal.hidden = false;
    updateBodyScrollLock();

    displayQuestion();
    const firstFocusable = quizModal.querySelector('button:not([hidden]), input:not([hidden])');
    if (firstFocusable) firstFocusable.focus();
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length || !quizModalQuestionEl || !quizModalOptionsEl || !quizModalProgressCurrentEl) {
        if(currentQuestions.length > 0) showQuizResults(); 
        return;
    }

    const question = currentQuestions[currentQuestionIndex];

    // UI state for displaying a new question
    quizModalQuestionEl.hidden = false;
    quizModalOptionsEl.hidden = false;
    if(quizModalFeedbackEl) quizModalFeedbackEl.hidden = true; // Hide feedback from previous question
    if(quizModalResultsEl) quizModalResultsEl.hidden = true;   // Ensure results are hidden
    if(quizModalNextBtn) quizModalNextBtn.hidden = true;       // Next btn initially hidden
    if(quizModalRestartBtn) quizModalRestartBtn.hidden = true; // Restart btn initially hidden

    quizModalProgressCurrentEl.textContent = currentQuestionIndex + 1;
    quizModalQuestionEl.textContent = question.question;
    quizModalOptionsEl.innerHTML = '';

    quizModalQuestionEl.id = quizModalQuestionEl.id || 'quiz-modal-question-id';
    quizModalOptionsEl.setAttribute('aria-labelledby', quizModalQuestionEl.id);

    const optionsToShuffle = question.options.map((optionText, originalIdx) => ({
        text: optionText,
        originalIndex: originalIdx
    }));
    shuffleArray(optionsToShuffle);

    optionsToShuffle.forEach((shuffledOption) => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        optionButton.classList.add('btn', 'btn-outline', 'quiz-option');
        optionButton.textContent = shuffledOption.text;
        optionButton.setAttribute('data-index', shuffledOption.originalIndex.toString());
        optionButton.setAttribute('aria-label', `Option: ${shuffledOption.text}`);
        optionButton.addEventListener('click', handleAnswerSelection);
        quizModalOptionsEl.appendChild(optionButton);
    });

     setTimeout(() => quizModalOptionsEl.querySelector('.quiz-option')?.focus(), 100);
}

function handleAnswerSelection(event) {
    const selectedButton = event.target.closest('.quiz-option');
    if (!selectedButton || selectedButton.disabled || !quizModalFeedbackEl || !quizModalOptionsEl) return;

    const selectedOriginalIndex = parseInt(selectedButton.dataset.index);
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedOriginalIndex === question.correctAnswerIndex;

    userAnswers.push({ questionId: question.id, selected: selectedOriginalIndex, correct: isCorrect });
    if (isCorrect) score++;

    // Display feedback & explanation (common for all questions)
    quizModalFeedbackEl.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${question.explanation || ''}`;
    quizModalFeedbackEl.className = 'quiz-modal-feedback'; 
    quizModalFeedbackEl.classList.add(isCorrect ? 'correct' : 'incorrect');
    quizModalFeedbackEl.hidden = false; // Make feedback visible

    // Disable and style option buttons (common for all questions)
    const optionButtons = quizModalOptionsEl.querySelectorAll('.quiz-option');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        const buttonOriginalIndex = parseInt(btn.dataset.index);
        let btnClass = '';
        if (buttonOriginalIndex === question.correctAnswerIndex) {
            btnClass = 'correct btn-success-light';
        } else if (buttonOriginalIndex === selectedOriginalIndex && !isCorrect) {
            btnClass = 'incorrect btn-danger-light';
        }
        btn.classList.remove('btn-outline', 'btn-success-light', 'btn-danger-light', 'correct', 'incorrect');
        if (btnClass) {
            btn.classList.add(...btnClass.split(' '));
        } else {
             btn.classList.add('btn-outline'); 
        }
    });

    // Initially hide Next and Restart buttons (common for all questions before decision)
    if (quizModalNextBtn) quizModalNextBtn.hidden = true;
    if (quizModalRestartBtn) quizModalRestartBtn.hidden = true;

    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;

    if (isLastQuestion) {
        // For the LAST question:
        // 1. Hide question and options areas (feedback/explanation for Q5 remains visible)
        if (quizModalQuestionEl) quizModalQuestionEl.hidden = true;
        if (quizModalOptionsEl) quizModalOptionsEl.hidden = true;

        // 2. Immediately proceed to show results underneath the Q5 explanation.
        showQuizResults(); 
    } else {
        // For NON-LAST questions:
        // Wait for feedback visibility duration, then show Next button.
        // Feedback/explanation for the current question remains visible.
        setTimeout(() => {
            if (quizModalNextBtn) {
                quizModalNextBtn.hidden = false;
                setTimeout(() => quizModalNextBtn.focus(), 100);
            }
        }, STANDARD_FEEDBACK_VISIBILITY_DURATION);
    }
}

function showQuizResults() {
    if (!quizModal || !quizModalResultsEl || !quizModalRestartBtn || !quizModalCloseResultsBtn) {
        console.error("One or more critical quiz modal elements for results display not found.");
        return;
    }

    // Ensure "Next Question" button is hidden on the results screen
    if (quizModalNextBtn) quizModalNextBtn.hidden = true;

    const totalQuestions = currentQuestions.length;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    if (currentCategoryId !== null) {
        updateQuizStats(currentCategoryId, score, totalQuestions);
    }

    const stats = getQuizStats();
    const catIdStr = currentCategoryId !== null ? String(currentCategoryId) : null;
    const categoryStats = catIdStr ? stats[catIdStr] : undefined;
    let message = '', prefix = '';
    const currentAttempts = categoryStats?.attempts || 1;

    if (currentAttempts > 1) {
        prefix = `Attempt #${currentAttempts}: `;
        const bestScore = categoryStats?.bestScore ?? -1;
        if (score === bestScore && score === totalQuestions) message = `Perfect score again! Well done!`;
        else if (score === bestScore) message = `Great effort, matching your best score!`;
        else if (score > (categoryStats?.score ?? -1) && score <= bestScore) message = `Improvement noted! Your best score remains ${bestScore}/${totalQuestions}. Keep going!`;
        else message = `Keep practicing! Your best is ${bestScore > -1 ? `${bestScore}/${totalQuestions}` : 'N/A'}.`;
    } else {
        prefix = 'First completed attempt: ';
        if (percentage >= 80) message = 'Excellent! You have a strong understanding.';
        else if (percentage >= 60) message = 'Good job! Keep building on your knowledge.';
        else message = 'Keep practicing! Review concepts and try again.';
    }

    quizModalResultsEl.innerHTML = `
        <h4>Quiz Complete!</h4>
        <p>${prefix}You scored ${score} out of ${totalQuestions} (${percentage}%).</p>
        <p>${message}</p>
    `;

    const nextCategoryId = currentCategoryId !== null ? currentCategoryId + 1 : null;
    let nextCategory = null;
    if (nextCategoryId !== null && introQuizQuestions.some(q => q.categoryId === nextCategoryId)) {
        nextCategory = introQuizQuestions.find(q => q.categoryId === nextCategoryId);
    }

    const existingNextButtons = quizModalResultsEl.querySelectorAll('.next-quiz-button');
    existingNextButtons.forEach(btn => btn.remove());

    if (nextCategory) {
        const nextCategoryName = nextCategory.category || `Check ${nextCategoryId}`;
        quizModalResultsEl.innerHTML += `<p class="mt-lg">Continue your learning with the next check:</p>`;
        const nextQuizButton = document.createElement('button');
        nextQuizButton.type = 'button';
        nextQuizButton.classList.add('btn', 'btn-primary', 'btn-small', 'btn-icon', 'mt-sm', 'next-quiz-button');
        nextQuizButton.innerHTML = `<i class="fas fa-arrow-right" aria-hidden="true"></i> Take ${nextCategoryName} Check`;
        nextQuizButton.onclick = () => {
            if (nextCategoryId !== null) handleQuizStart(nextCategoryId);
        };
        quizModalResultsEl.appendChild(nextQuizButton);
        if (quizModalFullChallengePromptEl) quizModalFullChallengePromptEl.hidden = true;
    } else {
        quizModalResultsEl.innerHTML += `<p class="mt-lg">You've completed all introductory checks!</p>`;
        if (quizModalFullChallengePromptEl) quizModalFullChallengePromptEl.hidden = false;
    }

    // Make results area and appropriate buttons visible
    quizModalResultsEl.hidden = false;
    quizModalRestartBtn.hidden = false; // Crucial: Show restart btn on results
    quizModalCloseResultsBtn.hidden = false;
    
    quizModalRestartBtn.focus();
}


function handleQuizStart(categoryId) {
    sessionStorage.setItem('selectedQuizCategory', categoryId.toString());

    if (!demographicsModal) {
        startQuiz(categoryId);
        return;
    }

    const stats = getQuizStats();
    const categoryCompleted = stats[String(categoryId)]?.completed;

    if (!quizDemographicsSubmitted && !categoryCompleted) {
        resetFormErrors('quiz-demographics-form');
        const form = demographicsModal.querySelector('#quiz-demographics-form');
        if (form) form.reset();
        
        if (quizCountryInput) quizCountryInput.value = '';
        if (quizCityInput) {
            quizCityInput.value = '';
            quizCityInput.disabled = true;
            quizCityInput.placeholder = "City (Select Country First)";
            quizCityInput.removeAttribute('list');
        }
        if (quizCityDatalist) quizCityDatalist.innerHTML = '';

        demographicsModal.hidden = false;
        updateBodyScrollLock();
        const triggerButton = document.querySelector(`.category-card[data-category-id="${categoryId}"] .start-quiz-btn`);
        demographicsModal.dataset.triggeredBy = triggerButton?.id || `start-quiz-btn-${categoryId}`;
        demographicsModal.querySelector('#quiz-country')?.focus();
    } else {
        startQuiz(categoryId);
    }
}


// --- Financial Journey Path Functions (Largely unchanged, minor logging adjustments) ---
function stopJourneyAutoAdvance() {
    if (journeyAutoAdvanceInterval) {
        clearInterval(journeyAutoAdvanceInterval);
        journeyAutoAdvanceInterval = null;
    }
}

function activateJourneyStep(step, options = { focusNode: false }) {
    if (!journeyPath || journeyNodeList.length === 0 || !journeyContents || !journeyContentContainer) return;

    let activeIndex = -1, foundActive = false, activeNodeElement = null;

    journeyNodeList.forEach((node, index) => {
        const isCurrent = node.dataset.step === step;
        node.classList.toggle('active', isCurrent);
        node.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        node.setAttribute('tabindex', isCurrent ? '0' : '-1');
        if (isCurrent) { activeIndex = index; foundActive = true; activeNodeElement = node; }
        node.classList.toggle('activated', index <= activeIndex);
    });

     if (!foundActive) return;

    const totalNodes = journeyNodeList.length;
    const progressPercent = totalNodes > 1 ? (activeIndex / (totalNodes - 1)) * 100 : (activeIndex >= 0 ? 100 : 0);
    journeyPath.style.setProperty('--journey-progress-height', `${progressPercent}%`);

    let contentFound = false;
    journeyContents.forEach(content => {
        const isActive = content.id === `journey-content-${step}`;
        content.hidden = !isActive; 
        if (isActive) {
            contentFound = true;
             content.style.display = 'block'; 
             requestAnimationFrame(() => { 
                  content.style.opacity = '1';
                  content.style.transform = 'translateY(0)';
             });
        } else {
             content.style.opacity = '0';
             content.style.transform = 'translateY(20px)';
             content.style.display = 'none';
        }
    });

     if (!contentFound) {
        journeyContents.forEach(content => { content.hidden = true; content.style.display = 'none';});
     }
    if (options.focusNode && activeNodeElement) {
        setTimeout(() => activeNodeElement.focus({ preventScroll: false }), 100);
    }
}

function handleJourneyInteraction(event) {
    const targetNode = event.currentTarget;
    if (targetNode.classList.contains('journey-node') &&
        (event.type === 'click' || (event.type === 'keydown' && (event.key === 'Enter' || event.key === ' '))))
    {
        if(event.type === 'keydown') event.preventDefault();
        const step = targetNode.dataset.step;
        stopJourneyAutoAdvance();
        if (step) activateJourneyStep(step, { focusNode: true });
    }
}

function autoAdvanceJourney() {
     if (journeyNodeList.length === 0 || !journeyPath) return;
    const currentActiveNode = journeyPath.querySelector('.journey-node.active');
    const currentActiveIndex = currentActiveNode ? journeyNodeList.findIndex(node => node === currentActiveNode) : -1;
    const nextIndex = (currentActiveIndex + 1) % journeyNodeList.length;
    const nextStep = journeyNodeList[nextIndex]?.dataset.step;
    if (nextStep) activateJourneyStep(nextStep, { focusNode: false });
    else stopJourneyAutoAdvance();
}

function setupJourneyObserver() {
    const financialJourneySection = document.getElementById('financial-journey');
    if (isJourneyObserverActive || !journeyPath || journeyNodeList.length === 0 || typeof IntersectionObserver !== 'function' || !financialJourneySection) return;
    isJourneyObserverActive = true;

    const sectionTriggerOptions = { root: null, rootMargin: "-30% 0px -60% 0px", threshold: 0.01 };
    const sectionsToObserve = [
        { id: 'hero', step: 'awareness' }, { id: 'free-resources', step: 'understanding' },
        { id: 'learning-hub', step: 'understanding' }, { id: 'free-tools', step: 'organization' },
        { id: 'financial-tools-promo', step: 'action' }, { id: 'personal-coaching', step: 'growth' }
    ];

    const sectionTriggerObserver = new IntersectionObserver((entries) => {
        let highestVisibleIndex = -1, stepToActivate = null, isIntersecting = false;
        entries.forEach(entry => {
             if (entry.isIntersecting) {
                 isIntersecting = true;
                 const mapping = sectionsToObserve.find(s => s.id === entry.target.id);
                 if (mapping?.step) {
                    const targetNodeIndex = journeyNodeList.findIndex(node => node.dataset.step === mapping.step);
                    if (targetNodeIndex > highestVisibleIndex) {
                        highestVisibleIndex = targetNodeIndex; stepToActivate = mapping.step;
                    }
                 }
             }
         });
         if (isIntersecting && stepToActivate) stopJourneyAutoAdvance();
         const currentActiveNode = journeyPath.querySelector('.journey-node.active');
         const currentActiveIndex = currentActiveNode ? journeyNodeList.findIndex(node => node === currentActiveNode) : -1;
         if (stepToActivate && highestVisibleIndex > currentActiveIndex) {
             activateJourneyStep(stepToActivate, { focusNode: false });
         }
     }, sectionTriggerOptions);

    sectionsToObserve.forEach(sectionInfo => {
        const sectionElement = document.getElementById(sectionInfo.id);
        if (sectionElement) sectionTriggerObserver.observe(sectionElement);
    });

    const autoAdvanceOptions = { root: null, threshold: 0.01 };
    const journeySectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.id === 'financial-journey') {
                if (entry.isIntersecting) {
                     if (!journeyAutoAdvanceInterval) {
                          journeyAutoAdvanceInterval = setInterval(autoAdvanceJourney, JOURNEY_ADVANCE_DELAY);
                     }
                 } else if (journeyAutoAdvanceInterval) {
                     stopJourneyAutoAdvance();
                 }
            }
        });
    }, autoAdvanceOptions);
    journeySectionObserver.observe(financialJourneySection);
}


// --- Helper to open feedback modal (Unchanged from previous correct version) ---
function openFeedbackModal(triggerButton = null) {
    if (!feedbackModal) { console.error("Feedback modal not found."); return; }
    const feedbackForm = feedbackModal.querySelector('#feedback-testimonial-form');
    const responseElement = feedbackModal.querySelector('#feedback-form-response');
    const permissionGroup = feedbackModal.querySelector('.permission-group');
    const feedbackTypeSelect = feedbackModal.querySelector('#feedback-type');

    if (feedbackForm) { resetFormErrors('feedback-testimonial-form'); feedbackForm.reset(); }
    if (responseElement) responseElement.hidden = true;
    if (permissionGroup) permissionGroup.hidden = true;
    if (feedbackTypeSelect) feedbackTypeSelect.value = "";

    feedbackModal.hidden = false;
    updateBodyScrollLock();

    if (triggerButton && triggerButton.id) feedbackModal.dataset.triggeredBy = triggerButton.id;
    else delete feedbackModal.dataset.triggeredBy;
    feedbackModal.querySelector('select, input, textarea')?.focus();
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
    fabOptions = document.getElementById('fab-options-list');
    menuToggle = document.querySelector('.mobile-menu-toggle');
    primaryNav = document.getElementById('primary-navigation');
    journeyPath = document.querySelector('.journey-path');
    journeyNodes = document.querySelectorAll('.journey-node');
    journeyNodeList = Array.from(journeyNodes);
    journeyContents = document.querySelectorAll('.journey-content');
    journeyContentContainer = document.querySelector('.journey-content-container');
    mainContentArea = document.getElementById('main-content');
    learningHubContainer = document.getElementById('learning-hub');

    quizCountryInput = document.getElementById('quiz-country');
    quizCityInput = document.getElementById('quiz-city');
    quizCountryDatalist = document.getElementById('country-list-options-quiz');
    quizCityDatalist = document.getElementById('city-list-options-quiz');
    pdfCountryInput = document.getElementById('pdf-country');
    pdfCityInput = document.getElementById('pdf-city');
    pdfCountryDatalist = document.getElementById('country-list-options-pdf');
    pdfCityDatalist = document.getElementById('city-list-options-pdf');

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
    } else { console.error("Quiz modal root element not found."); }


    // --- General UI Enhancements ---
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) currentYearElement.textContent = new Date().getFullYear();

    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger > *');
    if (revealElements.length > 0 && 'IntersectionObserver' in window) {
         const scrollObserverOptions = { threshold: 0.1, rootMargin: '0px 0px -10% 0px' };
        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                     const target = entry.target;
                     if (target.parentElement.classList.contains('reveal-stagger') && typeof target.dataset.index === 'string') {
                        target.style.setProperty('--reveal-item-delay', `${parseInt(target.dataset.index) * 0.1}s`);
                     } else if (target.dataset.delay) {
                        target.style.setProperty('--reveal-item-delay', `${parseFloat(target.dataset.delay) * 0.1}s`);
                     }
                     target.classList.add('revealed');
                     observer.unobserve(target);
                 }
            });
        }, scrollObserverOptions);
         document.querySelectorAll('.reveal-stagger').forEach(container => {
            Array.from(container.children).forEach((child, index) => {
               if (!child.dataset.index) child.dataset.index = index.toString();
            });
         });
         revealElements.forEach(el => scrollObserver.observe(el));
    } else {
        revealElements.forEach(el => { el.classList.add('revealed'); el.style.transitionDelay = '0s'; });
    }

    document.body.addEventListener('click', function(e) {
        const button = e.target.closest('.form-submit-btn, .btn');
        if (button && !button.disabled) {
            const existingRipple = button.querySelector('.btn-ripple');
            if(existingRipple) existingRipple.remove();
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
            button.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.parentNode && ripple.remove(), { once: true });
        }
    });

    // --- Mobile Navigation ---
    if (menuToggle && primaryNav) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', String(!isExpanded));
            menuToggle.classList.toggle('active');
            primaryNav.classList.toggle('active');
            updateBodyScrollLock(); 

            if (!isExpanded) { 
                primaryNav.querySelector('a[href], button:not([disabled])')?.focus();
            } else { 
                 menuToggle.focus();
            }
        });
        primaryNav.addEventListener('click', (e) => {
           if (e.target.matches('a') && primaryNav.classList.contains('active')) {
                menuToggle.click(); 
           }
        });
        document.addEventListener('click', function(e) {
            if (primaryNav.classList.contains('active') &&
                !primaryNav.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                menuToggle.click();
            }
        });
    }


    // --- Datalist Initialization ---
    if (quizCountryDatalist && pdfCountryDatalist) {
        populateDatalist(quizCountryDatalist, countryList);
        populateDatalist(pdfCountryDatalist, countryList);
    }
    if (quizCountryInput) quizCountryInput.addEventListener('input', handleCountryChange);
    if (pdfCountryInput) pdfCountryInput.addEventListener('input', handleCountryChange);
    if(quizCityInput) quizCityInput.disabled = true;
    if(pdfCityInput) pdfCityInput.disabled = true;


    // --- Quiz UI & Event Listeners ---
    initializeQuizUIFromStats();
    if (mainContentArea) {
        mainContentArea.addEventListener('click', function(e) {
            const startButton = e.target.closest('.start-quiz-btn');
            if (startButton) {
                const categoryCard = startButton.closest('.category-card');
                const categoryId = categoryCard?.dataset.categoryId;
                if (categoryId) {
                     startButton.id = startButton.id || `start-quiz-btn-${categoryId}`;
                    handleQuizStart(categoryId);
                }
            }
        });
    }

    if (quizModal) {
        quizModal.addEventListener('click', function(e) {
            // Only trigger if the next button is actually visible and meant to be clicked
            if (e.target.matches('#quiz-modal-next') && quizModalNextBtn && !quizModalNextBtn.hidden) { 
                 currentQuestionIndex++;
                 displayQuestion();
            }
            // Only trigger if the restart button is actually visible and meant to be clicked
            else if (e.target.matches('#quiz-modal-restart') && currentCategoryId !== null && quizModalRestartBtn && !quizModalRestartBtn.hidden) { 
                 startQuiz(currentCategoryId); 
            }
            else if (e.target.matches('#quiz-modal-close') || e.target.matches('#quiz-modal-close-results')) {
                 closeModal(quizModal);
            }
        });
    }

    const demographicsForm = document.getElementById('quiz-demographics-form');
    if (demographicsForm && demographicsModal) {
        demographicsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('quiz-demographics-form');
            let isValid = true;
            const countryIn = demographicsForm.querySelector('#quiz-country');
            const cityIn = demographicsForm.querySelector('#quiz-city');
            const takenBeforeChecked = demographicsForm.querySelector('input[name="taken_before"]:checked');
            const radioFieldset = demographicsForm.querySelector('fieldset'); 

            if (!countryIn?.value.trim()) { showFeedback(countryIn, 'Please enter your country'); isValid = false; }
            else showFeedback(countryIn, '', false);

            if (!cityIn?.disabled && !cityIn?.value.trim()) { showFeedback(cityIn, 'Please enter your city/state'); isValid = false; }
            else if (!cityIn?.disabled) showFeedback(cityIn, '', false);
            else showFeedback(cityIn, '', false);


            if (!takenBeforeChecked) {
                 if(radioFieldset) showFeedback(radioFieldset, 'Please select an option', true); 
                 isValid = false;
            } else {
                 if(radioFieldset) showFeedback(radioFieldset, '', false);
            }

            if (isValid) {
                quizDemographicsSubmitted = true;
                sessionStorage.setItem('quizDemographicsSubmitted', 'true');
                closeModal(demographicsModal);
                const selectedCatId = sessionStorage.getItem('selectedQuizCategory');
                if (selectedCatId) startQuiz(selectedCatId);
            } else {
                 demographicsForm.querySelector('.is-invalid, fieldset.is-invalid-check-group .form-check-input[aria-invalid="true"]')?.focus();
            }
        });
        const closeDemoBtn = demographicsModal.querySelector('#quiz-demographics-close');
        if (closeDemoBtn) closeDemoBtn.addEventListener('click', () => closeModal(demographicsModal));
    }


    // --- PDF Download ---
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
                     resetFormErrors('pdf-download-form'); pdfDownloadForm.reset();
                     if (pdfCountryInput) pdfCountryInput.value = '';
                     if (pdfCityInput) { pdfCityInput.value = ''; pdfCityInput.disabled = true; pdfCityInput.placeholder = "City (Select Country First)"; pdfCityInput.removeAttribute('list'); }
                     if (pdfCityDatalist) pdfCityDatalist.innerHTML = '';
                     pdfModal.hidden = false; updateBodyScrollLock();
                     pdfModal.dataset.triggeredBy = pdfButton.id || `pdf-btn-${templateKey}`;
                     pdfModal.querySelector('#pdf-country')?.focus();
                } else { alert("Sorry, unable to prepare download link."); }
            }
         });
        pdfDownloadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('pdf-download-form'); let isValid = true;
             const templateKeyIn = pdfDownloadForm.querySelector('#pdf-template-key');
             const countryIn = pdfDownloadForm.querySelector('#pdf-country');
             const cityIn = pdfDownloadForm.querySelector('#pdf-city');
             const pdfErrorFeedbackArea = pdfDownloadForm.querySelector('.form-response-note') || cityIn?.nextElementSibling;

             if (!countryIn?.value.trim()) { showFeedback(countryIn, 'Please enter your country'); isValid = false; }
             else showFeedback(countryIn, '', false);
             if (!cityIn?.disabled && !cityIn?.value.trim()) { showFeedback(cityIn, 'Please enter your city/state'); isValid = false; }
             else if (!cityIn?.disabled) showFeedback(cityIn, '', false); else showFeedback(cityIn, '', false);

            if (isValid) {
                const templateKey = templateKeyIn.value;
                const pdfBaseUrl = '../../assets/pdfs/'; 
                const pdfFilename = `${templateKey}.pdf`;
                const pdfUrl = `${pdfBaseUrl}${pdfFilename}`;
                 fetch(pdfUrl)
                     .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}: ${pdfFilename}`); return response.blob(); })
                     .then(blob => {
                         const blobUrl = window.URL.createObjectURL(blob);
                         const link = document.createElement('a');
                         link.href = blobUrl; link.download = `${templateKey}_template.pdf`;
                         document.body.appendChild(link); link.click(); document.body.removeChild(link);
                         window.URL.revokeObjectURL(blobUrl); closeModal(pdfModal);
                     })
                     .catch(error => {
                         console.error('PDF Download failed:', error);
                         if(pdfErrorFeedbackArea){
                              pdfErrorFeedbackArea.textContent = 'Error: Could not download. File may be unavailable.';
                              pdfErrorFeedbackArea.className = 'form-response-note error mt-md';
                              pdfErrorFeedbackArea.hidden = false;
                         } else { alert('Error downloading PDF.'); }
                         if(templateKeyIn) showFeedback(templateKeyIn, 'Download failed.', true);
                     });
            } else { pdfDownloadForm.querySelector('.is-invalid')?.focus(); }
        });
        if (closePdfButton) closePdfButton.addEventListener('click', () => closeModal(pdfModal));
    }

    // --- Spreadsheet Button Placeholder ---
    if (mainContentArea) {
        mainContentArea.addEventListener('click', function(e){
            const spreadsheetButton = e.target.closest('.get-spreadsheet-btn');
            if(spreadsheetButton){
                e.preventDefault();
                const templateName = spreadsheetButton.dataset.templateName || 'Template';
                const price = spreadsheetButton.dataset.price ? ` (₦${parseInt(spreadsheetButton.dataset.price).toLocaleString()})` : '';
                alert(`Interactive ${templateName} Spreadsheet coming soon!${price}`);
                 spreadsheetButton.blur();
            }
        });
    }

    // --- Feedback Modal ---
    const feedbackForm = document.getElementById('feedback-testimonial-form');
    if (feedbackForm && feedbackModal) {
        const openFeedbackButtons = document.querySelectorAll('#open-feedback-modal-btn, #footer-open-feedback-btn');
        const closeFeedbackButton = feedbackModal.querySelector('#feedback-modal-close');
        const feedbackTypeSelect = feedbackForm.querySelector('#feedback-type');
        const permissionGroup = feedbackForm.querySelector('.permission-group');
        const responseElement = feedbackForm.querySelector('#feedback-form-response');
        if(responseElement) responseElement.hidden = true;

        openFeedbackButtons.forEach(btn => btn.addEventListener('click', () => openFeedbackModal(btn)));
        if (closeFeedbackButton) closeFeedbackButton.addEventListener('click', () => closeModal(feedbackModal));

        if (feedbackTypeSelect && permissionGroup) {
            feedbackTypeSelect.addEventListener('change', function() {
                permissionGroup.hidden = this.value !== 'testimonial';
                 if (this.value !== 'testimonial') {
                     const cb = permissionGroup.querySelector('#feedback-permission');
                     if (cb) cb.checked = false;
                 }
            });
        }
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('feedback-testimonial-form');
            if (responseElement) responseElement.hidden = true;
            let isValid = true;
            const emailInput = document.getElementById('feedback-email');
            const typeSel = document.getElementById('feedback-type');
            const msgArea = document.getElementById('feedback-message');

             if (!typeSel?.value) { showFeedback(typeSel, 'Please select type'); isValid = false; }
             else showFeedback(typeSel, '', false);
             if (!msgArea?.value.trim()) { showFeedback(msgArea, 'Please enter message'); isValid = false; }
             else showFeedback(msgArea, '', false);
             const emailVal = emailInput?.value.trim();
             if (emailVal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { showFeedback(emailInput, 'Invalid email'); isValid = false; }
             else if(emailInput) showFeedback(emailInput, '', false);

            if (isValid && responseElement) {
                responseElement.textContent = 'Thank you for your feedback!';
                responseElement.className = 'form-response-note mt-md text-center success';
                responseElement.hidden = false;
                feedbackForm.reset();
                if (permissionGroup) permissionGroup.hidden = true;
                if (typeSel) typeSel.value = "";
                 setTimeout(() => closeModal(feedbackModal), 3000);
            } else if (!isValid) {
                 feedbackForm.querySelector('.is-invalid')?.focus();
                 if (responseElement) responseElement.hidden = true;
            }
        });
    }


    // --- Coaching Interest Form ---
    const coachingForm = document.getElementById('coachingInterestForm');
    if (coachingForm) {
        const responseElement = document.getElementById('interest-form-response');
        if (responseElement) responseElement.hidden = true;
        coachingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            resetFormErrors('coachingInterestForm');
            const emailInput = document.getElementById('interest-email');
            if (!emailInput || !responseElement) return;
            responseElement.hidden = true;
            const email = emailInput.value.trim();
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                 showFeedback(emailInput, 'Please enter a valid email address', true);
            } else {
                showFeedback(emailInput, '', false);
                responseElement.textContent = 'Thank you! We’ll notify you soon.';
                responseElement.className = 'form-response-note mt-md success';
                responseElement.hidden = false; this.reset(); emailInput.blur();
                 setTimeout(() => { if(responseElement) responseElement.hidden = true; }, 5000);
            }
        });
    }


    // --- Financial Journey Path Initialization ---
    if (journeyPath && journeyNodeList.length > 0 && journeyContents && journeyContentContainer) {
        journeyNodeList.forEach(node => {
            node.addEventListener('click', handleJourneyInteraction);
            node.addEventListener('keydown', handleJourneyInteraction);
        });
         const initialActiveStep = journeyNodeList[0]?.dataset.step;
         const alreadyActive = journeyPath.querySelector('.journey-node.active');
         if (initialActiveStep && !alreadyActive) {
              activateJourneyStep(initialActiveStep, { focusNode: false });
         } else if (alreadyActive) {
             const activeStep = alreadyActive.dataset.step;
             if (activeStep) {
                  const contentPanel = document.getElementById(`journey-content-${activeStep}`);
                  if (contentPanel) { contentPanel.hidden = false; contentPanel.style.display = 'block';} 
              }
         }
         setupJourneyObserver();
    }

    // --- Floating Action Button (FAB) ---
    if (fabContainer && fabButton && fabOptions) {
        fabButton.addEventListener('click', function() {
             const isExpanded = fabContainer.classList.toggle('active');
             fabButton.setAttribute('aria-expanded', String(isExpanded));
             fabOptions.hidden = !isExpanded;
             if (!isExpanded) {
                 fabOptions.querySelectorAll('li').forEach(item => item.style.transitionDelay = '0s');
             } else {
                 Array.from(fabOptions.querySelectorAll('li')).forEach((item, index) => {
                      item.style.setProperty('--fab-item-delay', `${0.05 * (index + 1)}s`); 
                 });
                 setTimeout(() => fabOptions.querySelector('a[href], button')?.focus(), 50);
             }
        });
         fabOptions.addEventListener('click', (e) => e.target.closest('.fab-option') && fabButton.click());
         document.addEventListener('click', (e) => fabContainer.classList.contains('active') && !fabContainer.contains(e.target) && fabButton.click());
    }

    // --- Global Modal & Nav Close Handlers ---
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            const modalToClose = e.target.closest('.modal-overlay'); 
             if (modalToClose) closeModal(modalToClose);
         }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
             const openModal = document.querySelector('.modal-overlay:not([hidden])');
             const isNavOpen = primaryNav?.classList.contains('active');
             const isFabOpen = fabContainer?.classList.contains('active');
             if (openModal) closeModal(openModal);
             else if (isNavOpen) menuToggle.click();
             else if (isFabOpen) fabButton.click();
         }
    });
});
