// personal.js

// Quiz Questions Data
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

// Quiz State Variables
let currentCategoryId = null;
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;
let quizDemographicsSubmitted = sessionStorage.getItem('quizDemographicsSubmitted') === 'true' || false;

// Utility Function to Reset Form Errors
function resetFormErrors(formId) {
    const errorElements = document.querySelectorAll(`#${formId} .form-error-msg`);
    errorElements.forEach(el => el.textContent = '');
}

// Quiz Functions
function startQuiz(categoryId) {
    currentQuestions = introQuizQuestions.filter(q => q.categoryId === parseInt(categoryId));
    if (currentQuestions.length === 0) {
        console.error('No questions found for category:', categoryId);
        return;
    }
    currentCategoryId = categoryId;
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    const quizModal = document.getElementById('quiz-modal');
    quizModal.hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('quiz-modal-title').textContent = currentQuestions[0].category;
    document.getElementById('quiz-modal-q-total').textContent = currentQuestions.length;
    document.getElementById('quiz-modal-results').hidden = true;
    document.getElementById('quiz-modal-full-challenge-prompt').hidden = true;
    document.getElementById('quiz-modal-restart').hidden = true;
    document.getElementById('quiz-modal-close-results').hidden = true;
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
    questionElement.hidden = false;
    optionsElement.innerHTML = '';
    optionsElement.hidden = false;
    feedbackElement.hidden = true;
    nextButton.hidden = true;
    question.options.forEach((option, index) => {
        const optionButton = document.createElement('button');
        optionButton.type = 'button';
        optionButton.classList.add('btn', 'btn-outline', 'quiz-option');
        optionButton.textContent = option;
        optionButton.setAttribute('data-index', index);
        optionButton.setAttribute('aria-label', `Option ${index + 1}: ${option}`);
        optionButton.addEventListener('click', handleAnswerSelection);
        optionsElement.appendChild(optionButton);
    });
}

function handleAnswerSelection(event) {
    const selectedIndex = parseInt(event.target.dataset.index);
    const question = currentQuestions[currentQuestionIndex];
    const isCorrect = selectedIndex === question.correctAnswerIndex;
    userAnswers.push({ questionId: question.id, selected: selectedIndex, correct: isCorrect });
    if (isCorrect) {
        score++;
    }
    const feedbackElement = document.getElementById('quiz-modal-feedback');
    feedbackElement.hidden = false;
    feedbackElement.textContent = isCorrect ? 'Correct! ' + question.explanation : 'Incorrect. ' + question.explanation;
    feedbackElement.classList.toggle('correct', isCorrect);
    feedbackElement.classList.toggle('incorrect', !isCorrect);
    const nextButton = document.getElementById('quiz-modal-next');
    nextButton.hidden = false;
    const optionButtons = document.querySelectorAll('.quiz-option');
    optionButtons.forEach(btn => {
        btn.disabled = true;
        if (parseInt(btn.dataset.index) === question.correctAnswerIndex) {
            btn.classList.add('correct');
        } else if (parseInt(btn.dataset.index) === selectedIndex) {
            btn.classList.add('incorrect');
        }
    });
}

function showQuizResults() {
    const resultsElement = document.getElementById('quiz-modal-results');
    const totalQuestions = currentQuestions.length;
    const percentage = (score / totalQuestions) * 100;
    let message;
    if (percentage >= 80) {
        message = 'Excellent! You have a strong understanding.';
    } else if (percentage >= 60) {
        message = 'Good job! Keep building on your knowledge.';
    } else {
        message = 'Keep practicing! Review the concepts and try again.';
    }
    resultsElement.innerHTML = `
        <h4>Quiz Complete!</h4>
        <p>You scored ${score} out of ${totalQuestions} (${percentage.toFixed(0)}%)</p>
        <p>${message}</p>
    `;
    const nextCategoryId = parseInt(currentCategoryId) + 1;
    const nextCategory = introQuizQuestions.find(q => q.categoryId === nextCategoryId);
    if (nextCategory) {
        const nextCategoryName = nextCategory.category;
        resultsElement.innerHTML += `
            <p>Continue your learning journey with the next check:</p>
            <button type="button" class="btn btn-primary" onclick="handleQuizStart(${nextCategoryId})">
                Take ${nextCategoryName} Check
            </button>
        `;
    } else {
        resultsElement.innerHTML += `
            <p>You've completed all the introductory checks! Ready for a deeper dive?</p>
            <a href="quizzes.html" class="btn btn-primary">Explore the Full Financial Fitness Challenge</a>
        `;
    }
    resultsElement.hidden = false;
    document.getElementById('quiz-modal-question').hidden = true;
    document.getElementById('quiz-modal-options').hidden = true;
    document.getElementById('quiz-modal-feedback').hidden = true;
    document.getElementById('quiz-modal-restart').hidden = false;
    document.getElementById('quiz-modal-close-results').hidden = false;
    document.getElementById('quiz-modal-next').hidden = true;
}

function handleQuizStart(categoryId) {
    sessionStorage.setItem('selectedQuizCategory', categoryId);
    if (!quizDemographicsSubmitted) {
        const demographicsModal = document.getElementById('quiz-demographics-modal');
        demographicsModal.hidden = false;
        document.body.classList.add('modal-open');
        resetFormErrors('quiz-demographics-form');
    } else {
        startQuiz(categoryId);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Quiz Start Buttons
    document.querySelectorAll('.start-quiz-btn').forEach(button => {
        button.addEventListener('click', function() {
            const categoryId = this.closest('.category-card').dataset.categoryId;
            handleQuizStart(categoryId);
        });
    });

    // Quiz Navigation
    document.getElementById('quiz-modal-next').addEventListener('click', function() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            displayQuestion();
        } else {
            showQuizResults();
        }
    });

    document.getElementById('quiz-modal-restart').addEventListener('click', function() {
        startQuiz(currentCategoryId);
    });

    document.getElementById('quiz-modal-close').addEventListener('click', function() {
        document.getElementById('quiz-modal').hidden = true;
        document.body.classList.remove('modal-open');
    });

    document.getElementById('quiz-modal-close-results').addEventListener('click', function() {
        document.getElementById('quiz-modal').hidden = true;
        document.body.classList.remove('modal-open');
    });

    // Demographics Form
    const demographicsForm = document.getElementById('quiz-demographics-form');
    demographicsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        resetFormErrors('quiz-demographics-form');
        let isValid = true;
        const country = document.getElementById('quiz-country').value.trim();
        const city = document.getElementById('quiz-city').value.trim();
        const takenBefore = document.querySelector('input[name="taken_before"]:checked');
        if (!country) {
            document.getElementById('quiz-country-error').textContent = 'Please enter your country';
            isValid = false;
        }
        if (!city) {
            document.getElementById('quiz-city-error').textContent = 'Please enter your city';
            isValid = false;
        }
        if (!takenBefore) {
            document.getElementById('quiz-taken-error').textContent = 'Please select an option';
            isValid = false;
        }
        if (isValid) {
            quizDemographicsSubmitted = true;
            sessionStorage.setItem('quizDemographicsSubmitted', 'true');
            const formData = { country, city, taken_before: takenBefore.value };
            console.log('Demographics:', formData); // Placeholder for server submission
            document.getElementById('quiz-demographics-modal').hidden = true;
            document.body.classList.remove('modal-open');
            const categoryId = sessionStorage.getItem('selectedQuizCategory');
            startQuiz(categoryId);
        }
    });

    document.getElementById('quiz-demographics-close').addEventListener('click', function() {
        document.getElementById('quiz-demographics-modal').hidden = true;
        document.body.classList.remove('modal-open');
    });

    // PDF Download
    document.querySelectorAll('.get-pdf-btn').forEach(button => {
        button.addEventListener('click', function() {
            const templateKey = this.dataset.templateKey;
            document.getElementById('pdf-template-key').value = templateKey;
            document.getElementById('pdf-download-modal').hidden = false;
            document.body.classList.add('modal-open');
            resetFormErrors('pdf-download-form');
        });
    });

    document.getElementById('pdf-download-form').addEventListener('submit', function(e) {
        e.preventDefault();
        resetFormErrors('pdf-download-form');
        let isValid = true;
        const country = document.getElementById('pdf-country').value.trim();
        const city = document.getElementById('pdf-city').value.trim();
        if (!country) {
            document.getElementById('pdf-country-error').textContent = 'Please enter your country';
            isValid = false;
        }
        if (!city) {
            document.getElementById('pdf-city-error').textContent = 'Please enter your city';
            isValid = false;
        }
        if (isValid) {
            const templateKey = document.getElementById('pdf-template-key').value;
            const formData = { country, city, template: templateKey };
            console.log('PDF Download Data:', formData); // Placeholder for server submission
            const pdfUrl = `../../assets/pdfs/${templateKey}.pdf`;
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `${templateKey}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            document.getElementById('pdf-download-modal').hidden = true;
            document.body.classList.remove('modal-open');
        }
    });

    document.getElementById('pdf-download-close').addEventListener('click', function() {
        document.getElementById('pdf-download-modal').hidden = true;
        document.body.classList.remove('modal-open');
    });

    // Feedback Modal
    document.getElementById('open-feedback-modal-btn').addEventListener('click', function() {
        document.getElementById('feedback-modal').hidden = false;
        document.body.classList.add('modal-open');
        resetFormErrors('feedback-testimonial-form');
        document.getElementById('feedback-form-response').hidden = true;
    });

    document.getElementById('feedback-modal-close').addEventListener('click', function() {
        document.getElementById('feedback-modal').hidden = true;
        document.body.classList.remove('modal-open');
    });

    document.getElementById('feedback-type').addEventListener('change', function() {
        const permissionGroup = document.querySelector('.permission-group');
        permissionGroup.hidden = this.value !== 'testimonial';
    });

    document.getElementById('feedback-testimonial-form').addEventListener('submit', function(e) {
        e.preventDefault();
        resetFormErrors('feedback-testimonial-form');
        let isValid = true;
        const type = document.getElementById('feedback-type').value;
        const message = document.getElementById('feedback-message').value.trim();
        if (!type) {
            document.getElementById('feedback-type-error').textContent = 'Please select a type';
            isValid = false;
        }
        if (!message) {
            document.getElementById('feedback-message-error').textContent = 'Please enter your message';
            isValid = false;
        }
        if (isValid) {
            const name = document.getElementById('feedback-name').value.trim();
            const email = document.getElementById('feedback-email').value.trim();
            const permission = document.getElementById('feedback-permission').checked;
            const formData = { name, email, type, message, permission };
            console.log('Feedback:', formData); // Placeholder for server submission
            document.getElementById('feedback-form-response').textContent = 'Thank you for your feedback!';
            document.getElementById('feedback-form-response').hidden = false;
            this.reset();
            document.querySelector('.permission-group').hidden = true;
        }
    });

    // Coaching Interest Form
    document.getElementById('coachingInterestForm').addEventListener('submit', function(e) {
        e.preventDefault();
        resetFormErrors('coachingInterestForm');
        const email = document.getElementById('interest-email').value.trim();
        if (email) {
            console.log('Coaching Interest:', email); // Placeholder for server submission
            document.getElementById('interest-form-response').textContent = 'Thank you! We’ll notify you when coaching is available.';
            document.getElementById('interest-form-response').hidden = false;
            this.reset();
        } else {
            document.getElementById('interest-email-error').textContent = 'Please enter a valid email';
        }
    });

    // Financial Journey Path
    const journeyNodes = document.querySelectorAll('.journey-node');
    const journeyContents = document.querySelectorAll('.journey-content');
    journeyNodes.forEach(node => {
        node.addEventListener('click', function() {
            const step = this.dataset.step;
            journeyNodes.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            journeyContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `journey-${step}`) {
                    content.classList.add('active');
                }
            });
        });
        node.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });

    // Floating Action Button
    const fabContainer = document.querySelector('.floating-action-btn');
    const fabButton = document.querySelector('.fab-main');
    const fabOptions = document.querySelector('.fab-options');
    fabButton.addEventListener('click', function() {
        fabContainer.classList.toggle('active');
        const isExpanded = fabContainer.classList.contains('active');
        fabButton.setAttribute('aria-expanded', isExpanded);
        fabOptions.hidden = !isExpanded;
    });

    // Modal Close on Click Outside or Esc
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.hidden = true;
                document.body.classList.remove('modal-open');
            }
        });
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay:not([hidden])').forEach(modal => {
                modal.hidden = true;
                document.body.classList.remove('modal-open');
            });
        }
    });

    // Update Current Year in Footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // New: Scroll Animations
    const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger > *');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));

    // New: Form Submit Ripple Effect
    const submitButtons = document.querySelectorAll('.form-submit-btn');
    submitButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
});
