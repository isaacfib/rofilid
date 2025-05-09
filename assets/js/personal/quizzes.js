/**
 * File Location: /assets/js/personal/quizzes.js
 */

(function() {
    'use strict';

    // --- Configuration & Constants ---
    const CONFIG = {
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error', 'none'
        ACCORDION_SELECTOR: '#quizAccordion',
        ACCORDION_ITEM_SELECTOR: '.accordion-item',
        ACCORDION_BUTTON_SELECTOR: '.accordion-button',
        ACCORDION_COLLAPSE_SELECTOR: '.accordion-collapse',
        ACCORDION_BUTTON_COLLAPSED_CLASS: 'collapsed',
        ACCORDION_COLLAPSE_SHOW_CLASS: 'show',

        CATEGORY_CARD_SELECTOR: '.category-card',
        START_QUIZ_BTN_SELECTOR: '.start-quiz-btn',

        QUIZ_MODAL_SELECTOR: '#quiz-modal',
        MODAL_VISIBLE_CLASS: 'visible',
        MODAL_CONTENT_SELECTOR: '.quiz-modal-content',
        MODAL_FOCUS_DELAY: 150, // ms

        START_FULL_CHALLENGE_BTN_ID: 'start-full-challenge-btn',
        CURRENT_YEAR_SELECTOR: '#current-year',

        EXPECTED_TOTAL_QUESTIONS: 100,
        QUESTIONS_PER_CATEGORY: 5,

        ACCORDION_ANIMATION_DURATION: 300,
        MODAL_TRANSITION_DURATION: 300,
        QUIZ_FEEDBACK_DELAY: 1500,
    };

    const logger = {
        _log: (level, ...args) => {
            const levels = ['debug', 'info', 'warn', 'error', 'none'];
            if (levels.indexOf(level) >= levels.indexOf(CONFIG.LOG_LEVEL)) {
                const timestamp = new Date().toISOString().substring(11, 23);
                console[level === 'error' ? 'error' : 'log'](`[${timestamp}][${level.toUpperCase()}][QuizzesV3.3]`, ...args); // Updated version
            }
        },
        debug: (...args) => logger._log('debug', ...args),
        info: (...args) => logger._log('info', ...args),
        warn: (...args) => logger._log('warn', ...args),
        error: (...args) => logger._log('error', ...args),
    };

    let accordionElement = null;
    let startFullChallengeBtn = null;
    let quizModalElement = null;
    let quizModalContentElement = null;
    let currentYearSpan = null;

    let activeModalTriggerElement = null;
    let activeFocusTrapHandler = null;
    let escapeKeyListener = null;

    let quizModalTitleEl, quizModalCloseBtnEl, quizModalProgressEl,
        quizModalQuestionAreaEl, quizModalOptionsAreaEl, quizModalFeedbackAreaEl,
        quizModalResultsAreaEl, quizModalNextBtnEl, quizModalRestartBtnEl,
        quizModalCloseResultsBtnEl, quizModalCurrentQEl, quizModalTotalQEl;

    let currentQuiz = {
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        userAnswers: {},
        isFullChallenge: false,
        quizId: null,
        categoryName: '',
        isOngoing: false, // NEW: Track if a quiz is active
    };

    const fullQuizData = [
        // Theme 1: Your Financial Groundwork (Categories 1-5)
        // Category 1: Income & Financial Vitals
        { id: 1, quizId: "income-vitals", themeId: 1, category: "Income & Financial Vitals", question: "What is the first essential step when starting to create a budget?", options: ["Calculate total monthly income", "List all fixed expenses", "Set long-term financial goals", "Track spending habits for a month"], correctAnswerIndex: 0, explanation: "Knowing your total income is fundamental; it's the basis upon which all budget allocations for expenses, savings, and goals are planned." },
        { id: 2, quizId: "income-vitals", themeId: 1, category: "Income & Financial Vitals", question: "You earn ₦150,000 per month after tax and manage to save ₦22,500. What is your savings rate as a percentage of your income?", options: ["10%", "15%", "20%", "22.5%"], correctAnswerIndex: 1, explanation: "Savings Rate = (Amount Saved / Total Income) × 100. So, (₦22,500 / ₦150,000) × 100 = 15%." },
        { id: 3, quizId: "income-vitals", themeId: 1, category: "Income & Financial Vitals", question: "What does 'Pay Yourself First' mean in personal finance?", options: ["Spend money on wants before needs", "Allocate a portion of your income to savings/investments before paying bills or discretionary spending", "Pay off all debts before saving anything", "Treat yourself to luxury items each payday"], correctAnswerIndex: 1, explanation: "'Pay Yourself First' prioritizes saving and investing by treating it as a mandatory expense, ensuring goals are worked towards before money is spent elsewhere." },
        { id: 4, quizId: "income-vitals", themeId: 1, category: "Income & Financial Vitals", question: "How is personal Net Worth typically calculated?", options: ["Total Annual Income - Total Annual Expenses", "Total Value of Assets (what you own) - Total Value of Liabilities (what you owe)", "Total Savings + Total Investments", "Monthly Income x 12"], correctAnswerIndex: 1, explanation: "Net worth is a snapshot of your financial position, calculated by subtracting your total debts (liabilities) from the total value of your possessions (assets)." },
        { id: 5, quizId: "income-vitals", themeId: 1, category: "Income & Financial Vitals", question: "If you deposit ₦50,000 into a savings account offering 4% simple annual interest, how much interest will you earn after one year?", options: ["₦400", "₦5,000", "₦2,000", "₦200"], correctAnswerIndex: 2, explanation: "Simple interest is calculated as Principal × Rate × Time. So, ₦50,000 × 0.04 × 1 year = ₦2,000." },
        // Category 2: Savings Essentials
        { id: 6, quizId: "savings-essentials", themeId: 1, category: "Savings Essentials", question: "Why is it important to save money regularly, even small amounts?", options: ["To show others financial responsibility", "To build funds for emergencies, goals, and investments", "Because banks offer guaranteed high returns", "Solely to avoid spending immediately"], correctAnswerIndex: 1, explanation: "Consistent saving builds financial security by creating an emergency cushion and accumulating funds needed for future goals and wealth-building investments." },
        { id: 7, quizId: "savings-essentials", themeId: 1, category: "Savings Essentials", question: "What is the benefit of starting to save early in life?", options: ["To retire sooner automatically", "To take full advantage of compound interest over a longer period", "To avoid future taxes on savings", "Because interest rates are higher for younger savers"], correctAnswerIndex: 1, explanation: "Starting early allows saved money and its earnings more time to grow through the power of compound interest, leading to significantly larger sums over the long term." },
        { id: 8, quizId: "savings-essentials", themeId: 1, category: "Savings Essentials", question: "Which factor is most crucial when choosing a savings account?", options: ["The bank's branch color scheme", "The interest rate (APY) and any associated fees", "How many branches the bank has", "Whether friends use the same bank"], correctAnswerIndex: 1, explanation: "The interest rate determines how much your savings will grow, and fees can erode your balance, making these the most critical financial factors to consider." },
        { id: 9, quizId: "savings-essentials", themeId: 1, category: "Savings Essentials", question: "Where is the best place to keep your emergency fund?", options: ["Invested in the stock market for high growth", "In a high-yield savings account or money market account", "Under your mattress at home", "In a long-term fixed deposit that locks funds away"], correctAnswerIndex: 1, explanation: "An emergency fund should be kept in a safe, easily accessible place that ideally earns some interest but is protected from market risk, like a high-yield savings account." },
        { id: 10, quizId: "savings-essentials", themeId: 1, category: "Savings Essentials", question: "What is simple interest?", options: ["Interest calculated only on the initial principal amount", "Interest calculated on the principal plus any accumulated interest", "A fee charged for opening a bank account", "Interest that decreases over time"], correctAnswerIndex: 0, explanation: "Simple interest is a fixed percentage of the original amount borrowed or saved, calculated only on the principal for the entire duration." },
        // Category 3: Budgeting Basics
        { id: 11, quizId: "budgeting-basics", themeId: 1, category: "Budgeting Basics", question: "What is the primary purpose of a budget?", options: ["To track past spending", "To plan future spending and saving", "To restrict all 'fun' spending", "To calculate taxes"], correctAnswerIndex: 1, explanation: "A budget is a financial plan that helps you allocate your income towards expenses, savings, and investments to achieve your financial goals." },
        { id: 12, quizId: "budgeting-basics", themeId: 1, category: "Budgeting Basics", question: "What is the difference between fixed and variable expenses?", options: ["Fixed expenses change every month, variable stay the same", "Fixed expenses generally stay the same each month, variable expenses often change", "Both change every month", "Both stay the same"], correctAnswerIndex: 1, explanation: "Fixed expenses, such as rent or loan payments, remain relatively constant, while variable expenses, like groceries or fuel, can fluctuate based on consumption or price changes." },
        { id: 13, quizId: "budgeting-basics", themeId: 1, category: "Budgeting Basics", question: "In budgeting, how do you typically differentiate between a 'need' and a 'want'?", options: ["Needs are bought frequently, wants are occasional", "Needs are essential for survival and well-being, wants are for comfort and enjoyment", "Needs are more expensive than wants", "Wants are things friends have, needs are what you currently possess"], correctAnswerIndex: 1, explanation: "Needs are fundamental requirements (food, shelter, basic utilities), while wants are desires that improve quality of life but aren't essential for survival. Understanding this helps prioritize spending." },
        { id: 14, quizId: "budgeting-basics", themeId: 1, category: "Budgeting Basics", question: "What is the 50/30/20 rule in budgeting?", options: ["50% Needs, 30% Wants, 20% Savings/Debt Repayment", "50% Savings, 30% Needs, 20% Wants", "50% Wants, 30% Needs, 20% Savings", "50% Debt, 30% Savings, 20% Expenses"], correctAnswerIndex: 0, explanation: "The 50/30/20 rule is a guideline suggesting allocating 50% of after-tax income to needs, 30% to wants, and 20% towards savings or aggressive debt repayment." },
        { id: 15, quizId: "budgeting-basics", themeId: 1, category: "Budgeting Basics", question: "What is a sinking fund primarily used for?", options: ["As a primary emergency fund", "To save regularly for a specific, planned future expense", "As a high-risk investment fund", "As a fund exclusively for paying off debt"], correctAnswerIndex: 1, explanation: "A sinking fund involves setting aside money regularly towards a known future expense (e.g., car replacement, vacation) to avoid borrowing or derailing regular savings when the expense occurs." },
        // Category 4: Tracking & Managing Spending
        { id: 16, quizId: "tracking-spending", themeId: 1, category: "Tracking & Managing Spending", question: "What is a practical first step in tracking your expenses accurately?", options: ["Ignoring small cash transactions", "Keeping receipts and noting all spending, no matter how small", "Only tracking card or bank transfer payments", "Guessing monthly spending totals"], correctAnswerIndex: 1, explanation: "Tracking every expense provides a complete and accurate picture of spending habits, which is crucial for effective budgeting and identifying areas to cut back." },
        { id: 17, quizId: "tracking-spending", themeId: 1, category: "Tracking & Managing Spending", question: "Why is it important to track your expenses regularly?", options: ["To know how much you can safely borrow", "To understand where your money is going and identify areas for potential savings", "To share spending habits with friends", "To make tax calculation simpler"], correctAnswerIndex: 1, explanation: "Regularly tracking expenses reveals spending patterns, helps stick to a budget, and identifies non-essential spending that could be redirected towards savings or goals." },
        { id: 18, quizId: "tracking-spending", themeId: 1, category: "Tracking & Managing Spending", question: "Which of the following is a budgeting tool or technique often useful in cash-heavy environments?", options: ["Complex financial modeling software", "The envelope system for allocating cash", "Investing heavily in volatile assets", "Relying solely on mental calculations"], correctAnswerIndex: 1, explanation: "The envelope system involves putting allocated cash amounts into labeled envelopes for different spending categories, helping control cash spending physically." },
        { id: 19, quizId: "tracking-spending", themeId: 1, category: "Tracking & Managing Spending", question: "Your monthly budget for entertainment is ₦10,000. You spent ₦8,500 this month. What percentage of your entertainment budget remains?", options: ["5%", "10%", "15%", "85%"], correctAnswerIndex: 2, explanation: "Amount Remaining = ₦10,000 - ₦8,500 = ₦1,500. Percentage Remaining = (₦1,500 / ₦10,000) × 100 = 15%." },
        { id: 20, quizId: "tracking-spending", themeId: 1, category: "Tracking & Managing Spending", question: "An item costs ₦25,000, but it's currently offered at a 20% discount. How much will you actually pay?", options: ["₦5,000", "₦20,000", "₦24,000", "₦30,000"], correctAnswerIndex: 1, explanation: "Discount Amount = ₦25,000 × 0.20 = ₦5,000. Final Price = ₦25,000 - ₦5,000 = ₦20,000." },
        // Category 5: Understanding Credit & Debt
        { id: 21, quizId: "credit-debt", themeId: 1, category: "Understanding Credit & Debt", question: "What is 'credit history'?", options: ["A prediction of future income", "A record of how you have borrowed and repaid money over time", "The amount of savings you have", "Your total net worth"], correctAnswerIndex: 1, explanation: "Your credit history documents your past borrowing activities, including loans and credit card usage and repayment patterns, which lenders use to assess risk." },
        { id: 22, quizId: "credit-debt", themeId: 1, category: "Understanding Credit & Debt", question: "What is a major consequence of defaulting (failing to repay) on a loan?", options: ["A guaranteed increase in credit limit", "Significant damage to your credit score and history, making future borrowing harder and more expensive", "Automatic loan forgiveness", "A commendation from the lender"], correctAnswerIndex: 1, explanation: "Defaulting seriously harms your creditworthiness, potentially leading to legal action, higher interest rates on future loans, or being denied credit altogether." },
        { id: 23, quizId: "credit-debt", themeId: 1, category: "Understanding Credit & Debt", question: "What does 'collateral' mean in relation to a loan?", options: ["The interest rate charged", "An asset (like property or a car) pledged by the borrower that the lender can seize if the loan isn't repaid", "The fees associated with the loan", "The loan repayment schedule"], correctAnswerIndex: 1, explanation: "Collateral secures a loan, reducing the lender's risk. If the borrower defaults, the lender can take ownership of the collateral to recoup their losses." },
        { id: 24, quizId: "credit-debt", themeId: 1, category: "Understanding Credit & Debt", question: "Why is it generally advisable to pay more than the minimum required payment on credit card debt?", options: ["It allows you to borrow more instantly", "It reduces the total interest paid significantly and shortens the repayment period", "It automatically lowers your interest rate", "Minimum payments always pay off the debt quickly"], correctAnswerIndex: 1, explanation: "Paying only the minimum on high-interest debt like credit cards means most of the payment goes to interest, extending the repayment time drastically and costing much more overall." },
        { id: 25, quizId: "credit-debt", themeId: 1, category: "Understanding Credit & Debt", question: "What is a common reason lenders check your credit report before approving a loan?", options: ["To see your shopping preferences", "To assess your ability and likelihood to repay the borrowed money based on past behavior", "To determine your educational background", "To verify your employment address"], correctAnswerIndex: 1, explanation: "Credit reports provide lenders insight into your past financial responsibility, helping them gauge the risk involved in lending to you." },
        // Theme 2: Building Your Financial Future (Categories 6-10)
        // Category 6: Goal Setting & Planning
        { id: 26, quizId: "goal-setting", themeId: 2, category: "Goal Setting & Planning", question: "Why is setting specific financial goals important?", options: ["Just for financial discussion", "To provide clear direction for financial decisions and motivation for saving/investing", "Solely because advisors recommend it", "To feel financially superior"], correctAnswerIndex: 1, explanation: "Defined goals (down payment, retirement) give purpose to financial planning and guide choices about spending and saving." },
        { id: 27, quizId: "goal-setting", themeId: 2, category: "Goal Setting & Planning", question: "What does the 'SMART' acronym stand for in goal setting?", options: ["Specific, Measurable, Achievable, Relevant, Time-bound", "Savvy, Monetary, Accurate, Reliable, Tested", "Simple, Manageable, Actionable, Rewarding, Trackable", "Small, Medium, Ambitious, Rich, Total"], correctAnswerIndex: 0, explanation: "SMART criteria create effective goals: Specific, Measurable, Achievable, Relevant, and Time-bound." },
        { id: 28, quizId: "goal-setting", themeId: 2, category: "Goal Setting & Planning", question: "Which of the following is fundamental to creating a comprehensive financial plan?", options: ["Predicting exact future investment values", "Detailed understanding of current income, expenses, assets, liabilities", "Guaranteeing wealth within a fixed period", "Following generic social media advice"], correctAnswerIndex: 1, explanation: "A solid plan must be built on a clear understanding of your current financial situation." },
        { id: 29, quizId: "goal-setting", themeId: 2, category: "Goal Setting & Planning", question: "How often should you typically review and potentially adjust your financial plan?", options: ["Only during major financial crisis", "Once every decade", "At least annually, or after significant life/economic changes", "Only when advised by an expert"], correctAnswerIndex: 2, explanation: "Regular reviews ensure your plan remains relevant to your current situation, goals, and economic environment." },
        { id: 30, quizId: "goal-setting", themeId: 2, category: "Goal Setting & Planning", question: "Which is an example of a long-term financial goal?", options: ["Saving for next month's trip", "Paying off credit card in three months", "Saving for retirement in 20-30 years", "Buying weekly groceries"], correctAnswerIndex: 2, explanation: "Long-term goals typically span five years or more, like retirement, child's education, or mortgage payoff." },
        // Category 7: Banking & Financial Institutions
        { id: 31, quizId: "banking-institutions", themeId: 2, category: "Banking & Financial Institutions", question: "What is the main difference between a savings account and a current account (checking account)?", options: ["Savings accounts are only for businesses; current accounts are for individuals", "Savings accounts usually earn interest and may limit transactions; current accounts are for frequent transactions and often earn little/no interest", "Current accounts have higher interest rates", "Savings accounts cannot be used for electronic payments"], correctAnswerIndex: 1, explanation: "Savings accounts are designed for accumulating funds and earning interest, while current accounts facilitate easy and frequent access to money for daily transactions." },
        { id: 32, quizId: "banking-institutions", themeId: 2, category: "Banking & Financial Institutions", question: "What is a Fixed Deposit account?", options: ["An account where money can be withdrawn anytime without notice", "A savings account where money is deposited for a fixed term (e.g., 30, 90, 180 days) to earn a fixed interest rate", "An account used primarily for stock market investments", "A type of loan offered by banks"], correctAnswerIndex: 1, explanation: "Fixed deposits offer a potentially higher interest rate than regular savings accounts in exchange for locking the funds away for a predetermined period." },
        { id: 33, quizId: "banking-institutions", themeId: 2, category: "Banking & Financial Institutions", question: "What is a domiciliary account in a Nigerian bank?", options: ["An account designed exclusively for housing payments", "A bank account denominated in a foreign currency (e.g., USD, GBP, EUR)", "A joint account held by multiple family members", "An account linked to the stock exchange"], correctAnswerIndex: 1, explanation: "Domiciliary accounts allow individuals and businesses to hold and transact in foreign currencies, often used for international business or as a store of value against Naira volatility." },
        { id: 34, quizId: "banking-institutions", themeId: 2, category: "Banking & Financial Institutions", question: "What function does the Nigeria Deposit Insurance Corporation (NDIC) serve?", options: ["It regulates the Nigerian stock market", "It insures deposits in licensed banks up to a certain limit, protecting depositors in case of bank failure", "It provides loans to commercial banks", "It sets the national interest rate"], correctAnswerIndex: 1, explanation: "The NDIC protects bank depositors by guaranteeing repayment of their deposits (up to a specified maximum) if their bank fails, promoting confidence in the banking system." },
        { id: 35, quizId: "banking-institutions", themeId: 2, category: "Banking & Financial Institutions", question: "What is the primary role of the Central Bank of Nigeria (CBN)?", options: ["Primarily to print the national currency", "To regulate commercial banks, manage monetary policy, and maintain financial system stability", "To provide personal loans directly to citizens", "To collect national taxes"], correctAnswerIndex: 1, explanation: "The CBN acts as the banker to the government and commercial banks, oversees the financial sector, manages foreign reserves, and aims for price stability." },
        // Category 8: Financial Risk Management
        { id: 36, quizId: "risk-management", themeId: 2, category: "Financial Risk Management", question: "Which of these is generally considered 'good debt' because it finances an asset likely to appreciate or increase income potential?", options: ["High-interest credit card debt for luxuries", "A mortgage for buying a home", "A loan for an expensive vacation", "Payday loans for daily expenses"], correctAnswerIndex: 1, explanation: "Good debt typically acquires assets that may increase value (home) or enhance earning potential (student loan), unlike debt for consumables." },
        { id: 37, quizId: "risk-management", themeId: 2, category: "Financial Risk Management", question: "What is the 'Principal' of a loan?", options: ["Total interest paid", "The initial amount of money borrowed, before interest is added", "The monthly payment amount", "Lender processing fees"], correctAnswerIndex: 1, explanation: "The principal is the original sum borrowed or the outstanding amount on which interest is calculated." },
        { id: 38, quizId: "risk-management", themeId: 2, category: "Financial Risk Management", question: "What does the Annual Percentage Rate (APR) on a loan represent?", options: ["Simple interest rate per year only", "Total loan amount including fees", "The yearly cost of the loan, including interest and certain fees, as a percentage", "Loan duration in years"], correctAnswerIndex: 2, explanation: "APR provides a broader measure of borrowing cost than simple interest, including interest plus certain fees, for better comparison." },
        { id: 39, quizId: "risk-management", themeId: 2, category: "Financial Risk Management", question: "Which loan type is short-term, often used to cover expenses until payday, and typically carries very high interest rates?", options: ["Mortgage loan", "Student loan", "Payday loan or salary advance", "Business expansion loan"], correctAnswerIndex: 2, explanation: "Payday loans offer quick cash but usually have extremely high APRs and short terms, making them costly." },
        { id: 40, quizId: "risk-management", themeId: 2, category: "Financial Risk Management", question: "What does it mean if a loan is 'secured'?", options: ["Has a very low interest rate", "Borrower provides collateral (an asset) the lender can claim if the loan isn't repaid", "Repayment guaranteed by the government", "Requires a co-signer"], correctAnswerIndex: 1, explanation: "Secured loans are backed by collateral (like a car or property), reducing lender risk but potentially leading to asset loss for the borrower upon default." },
        // Category 9: Understanding Financial Advice
        { id: 41, quizId: "financial-advice", themeId: 2, category: "Understanding Financial Advice", question: "What is a credit score?", options: ["Amount of money in bank accounts", "A numerical representation of your creditworthiness based on credit history", "Total annual income", "Number of credit cards possessed"], correctAnswerIndex: 1, explanation: "Lenders use credit scores (calculated from credit history) to quickly assess lending risk and determine loan terms." },
        { id: 42, quizId: "financial-advice", themeId: 2, category: "Understanding Financial Advice", question: "What information is typically found on a credit report?", options: ["Detailed daily spending habits", "Personal medical history", "History of borrowing and repayment (loans, credit cards)", "Investment portfolio performance"], correctAnswerIndex: 2, explanation: "Credit reports contain details on credit accounts, payment history, amounts owed, credit history length, and inquiries." },
        { id: 43, quizId: "financial-advice", themeId: 2, category: "Understanding Financial Advice", question: "What is the role of a credit bureau (like CRC, CR Services, or XDS in Nigeria)?", options: ["Provide loans directly", "Collect and share information about individuals' credit history with lenders", "Set maximum interest rates", "Offer personalized financial advice"], correctAnswerIndex: 1, explanation: "Credit bureaus compile credit information to create credit reports and scores used by lenders to assess borrower risk." },
        { id: 44, quizId: "financial-advice", themeId: 2, category: "Understanding Financial Advice", question: "Which action is MOST likely to negatively impact your credit score?", options: ["Paying all bills consistently on time", "Maintaining low credit utilization", "Frequently missing loan payments or defaulting on debts", "Checking your own credit report"], correctAnswerIndex: 2, explanation: "Payment history is crucial. Late payments, missed payments, and defaults severely damage creditworthiness." },
        { id: 45, quizId: "financial-advice", themeId: 2, category: "Understanding Financial Advice", question: "Why is it beneficial to check your own credit report periodically?", options: ["To increase credit limit automatically", "To find errors/identity theft signs and understand your credit standing", "To lower interest rates instantly", "Lenders require monthly checks"], correctAnswerIndex: 1, explanation: "Regular checks help spot inaccuracies, detect fraud early, and understand what lenders see." },
        // Category 10: Tax Basics
        { id: 46, quizId: "tax-basics", themeId: 2, category: "Tax Basics", question: "What is Personal Income Tax (PIT)?", options: ["A tax on business profits", "A tax levied on individual earnings (salary, wages, self-employment income)", "A tax on purchased goods (VAT)", "A tax on property ownership"], correctAnswerIndex: 1, explanation: "PIT is a direct tax collected by the government on the income earned by individuals." },
        { id: 47, quizId: "tax-basics", themeId: 2, category: "Tax Basics", question: "What does 'PAYE' stand for in the Nigerian tax system?", options: ["Pay All Your Expenses", "Pay As You Earn", "Personal Account Yield Estimate", "Property Assessment Yearly Evaluation"], correctAnswerIndex: 1, explanation: "PAYE is the system where employers deduct income tax directly from employees' salaries and remit it to the relevant tax authority." },
        { id: 48, quizId: "tax-basics", themeId: 2, category: "Tax Basics", question: "What is Value Added Tax (VAT)?", options: ["A tax on company profits", "A tax on income earned", "A consumption tax applied to the price of most goods and services", "A tax specifically on imported goods"], correctAnswerIndex: 2, explanation: "VAT is an indirect tax paid by the consumer at the point of purchase for goods and services." },
        { id: 49, quizId: "tax-basics", themeId: 2, category: "Tax Basics", question: "What is a Tax Identification Number (TIN)?", options: ["Your bank account number", "A unique number assigned to taxpayers for identification and tracking purposes", "Your national ID card number", "A business registration number"], correctAnswerIndex: 1, explanation: "A TIN is essential for filing taxes and interacting with tax authorities in Nigeria." },
        { id: 50, quizId: "tax-basics", themeId: 2, category: "Tax Basics", question: "Why is tax compliance (paying taxes correctly and on time) important?", options: ["It's optional for individuals", "It funds public services (infrastructure, health, education) and avoids penalties/legal issues", "It guarantees personal financial success", "It mainly benefits large corporations"], correctAnswerIndex: 1, explanation: "Taxes are the primary source of government revenue for public goods and services. Non-compliance can lead to significant penalties." },
        // Theme 3: Investing & Growth (Categories 11-15)
        // Category 11: Introduction to Investing
        { id: 51, quizId: "investing-intro", themeId: 3, category: "Introduction to Investing", question: "What is investing?", options: ["Spending on luxury experiences", "Allocating money to assets (stocks, bonds) expecting income or profit over time", "Donating generously", "Keeping large cash sums at home"], correctAnswerIndex: 1, explanation: "Investing uses capital to acquire assets potentially growing in value or producing income, aiming to build wealth." },
        { id: 52, quizId: "investing-intro", themeId: 3, category: "Introduction to Investing", question: "What does 'liquidity' mean regarding investments?", options: ["Potential for high returns quickly", "How easily an asset converts to cash without significant loss of value", "Total cash in circulation", "Interest on borrowed funds for investing"], correctAnswerIndex: 1, explanation: "Liquidity describes ease/speed of converting an asset to cash at a stable price; cash is most liquid." },
        { id: 53, quizId: "investing-intro", themeId: 3, category: "Introduction to Investing", question: "What is compound interest?", options: ["Interest on principal only", "Interest on principal AND accumulated interest from previous periods", "Tax on investment earnings", "Bank fee for loans"], correctAnswerIndex: 1, explanation: "Compound interest (\"interest on interest\") lets investments grow faster as earnings generate further earnings." },
        { id: 54, quizId: "investing-intro", themeId: 3, category: "Introduction to Investing", question: "Using the 'Rule of 72', approximately how long to double an investment earning 6% annually?", options: ["6 years", "7.2 years", "12 years", "72 years"], correctAnswerIndex: 2, explanation: "Rule of 72 estimate: 72 / annual interest rate (%) = years to double. 72 / 6 = 12 years." },
        { id: 55, quizId: "investing-intro", themeId: 3, category: "Introduction to Investing", question: "If you buy a stock for ₦100 and sell it later for ₦120, what is the ₦20 profit called?", options: ["Dividend", "Interest", "Capital Gain", "Principal Return"], correctAnswerIndex: 2, explanation: "A capital gain is the profit made from selling an asset (like stock) for more than its purchase price." },
        // Category 12: Investment Types (Basic)
        { id: 56, quizId: "investment-types", themeId: 3, category: "Investment Types (Basic)", question: "What is the basic difference between stocks and bonds?", options: ["Stocks=loans, Bonds=ownership", "Stocks=ownership (equity) in a company; Bonds=debt (loan) to company/government", "Stocks safer than bonds", "Bonds pay dividends"], correctAnswerIndex: 1, explanation: "Buying stock = part-ownership. Buying bond = lending money for interest and principal repayment." },
        { id: 57, quizId: "investment-types", themeId: 3, category: "Investment Types (Basic)", question: "What is a mutual fund?", options: ["Credit union savings account", "Professionally managed fund pooling investor money to buy diversified portfolio (stocks, bonds etc.)", "Government loan", "Digital currency scheme"], correctAnswerIndex: 1, explanation: "Mutual funds give access to diversified portfolios and professional management." },
        { id: 58, quizId: "investment-types", themeId: 3, category: "Investment Types (Basic)", question: "What is an ETF (Exchange-Traded Fund)?", options: ["High-interest savings account", "Fund tracking an index (e.g., NGX All-Share), traded like a stock on exchanges", "Electronic government bond", "Physical commodity"], correctAnswerIndex: 1, explanation: "ETFs offer diversification like mutual funds but trade throughout the day like stocks." },
        { id: 59, quizId: "investment-types", themeId: 3, category: "Investment Types (Basic)", question: "If a company shares profits with shareholders, what is this payment called?", options: ["Interest payment", "Dividend", "Principal repayment", "Capital gain"], correctAnswerIndex: 1, explanation: "Dividends are portions of profits distributed to stockholders, usually regularly." },
        { id: 60, quizId: "investment-types", themeId: 3, category: "Investment Types (Basic)", question: "Investing in real estate typically involves buying what?", options: ["Shares in multiple random companies", "Government Treasury Bills", "Physical property (land, buildings) or shares in property companies (REITs)", "Certificates of Deposit"], correctAnswerIndex: 2, explanation: "Real estate investing includes direct property ownership or REITs (companies owning/financing property)." },
        // Category 13: Risk vs. Return
        { id: 61, quizId: "risk-return", themeId: 3, category: "Risk vs. Return", question: "What is the general relationship between risk and potential return in investing?", options: ["Higher risk usually means lower potential return", "Higher risk is often associated with higher potential return (and higher potential loss)", "Risk and return are unrelated", "Lower risk always guarantees higher returns"], correctAnswerIndex: 1, explanation: "Generally, investments with the potential for higher returns also carry a higher level of risk (volatility, chance of loss)." },
        { id: 62, quizId: "risk-return", themeId: 3, category: "Risk vs. Return", question: "What does 'risk tolerance' mean for an investor?", options: ["How much risk an investment guarantees", "An investor's ability and willingness to withstand potential losses in their investments", "How quickly an investment can be sold", "The fees charged by a broker"], correctAnswerIndex: 1, explanation: "Risk tolerance reflects an individual's comfort level with investment value fluctuations, influencing their investment choices." },
        { id: 63, quizId: "risk-return", themeId: 3, category: "Risk vs. Return", question: "Which investment is generally considered lower risk?", options: ["Shares in a newly listed tech startup", "Government Treasury Bills", "Cryptocurrencies", "Collectibles like art"], correctAnswerIndex: 1, explanation: "Government Treasury Bills are backed by the government and are considered very low risk compared to stocks (especially startups) or speculative assets." },
        { id: 64, quizId: "risk-return", themeId: 3, category: "Risk vs. Return", question: "What is diversification primarily used for in investing?", options: ["To guarantee profits", "To concentrate risk in one asset", "To spread risk across different asset types or investments", "To time the market perfectly"], correctAnswerIndex: 2, explanation: "Diversification aims to reduce overall portfolio risk by not relying on the performance of a single investment type." },
        { id: 65, quizId: "risk-return", themeId: 3, category: "Risk vs. Return", question: "An investment fluctuating widely in price daily demonstrates high...?", options: ["Liquidity", "Stability", "Volatility", "Dividends"], correctAnswerIndex: 2, explanation: "Volatility measures the degree and speed of price changes; large, frequent fluctuations indicate high volatility and typically higher risk." },
        // Category 14: Time Value of Money
        { id: 66, quizId: "time-value", themeId: 3, category: "Time Value of Money", question: "What fundamental concept does the 'Time Value of Money' explain?", options: ["Money loses value over time due to storage costs", "Money available today is worth more than the same amount in the future due to its potential earning capacity", "Interest rates always decrease over time", "All investments double in a fixed period"], correctAnswerIndex: 1, explanation: "Money can earn interest, so having it sooner allows it to grow more over time compared to receiving the same amount later." },
        { id: 67, quizId: "time-value", themeId: 3, category: "Time Value of Money", question: "What is 'present value'?", options: ["The future value of an investment", "The current worth of a future sum of money, discounted at an appropriate interest rate", "The total interest earned", "The principal amount borrowed"], correctAnswerIndex: 1, explanation: "Present value calculation determines how much a future amount is worth today, considering interest rates and time." },
        { id: 68, quizId: "time-value", themeId: 3, category: "Time Value of Money", question: "What is 'future value'?", options: ["The value of an asset today", "The value of a current asset at a specified date in the future, based on an assumed growth rate", "The amount of tax due", "The inflation rate"], correctAnswerIndex: 1, explanation: "Future value projects how much a current sum will be worth later, assuming it grows at a specific interest rate." },
        { id: 69, quizId: "time-value", themeId: 3, category: "Time Value of Money", question: "Why is understanding the Time Value of Money important for financial planning?", options: ["It only applies to businesses", "It helps in comparing investments with different timings and making informed decisions about saving, borrowing, and investing", "It dictates government policy", "It guarantees investment outcomes"], correctAnswerIndex: 1, explanation: "TVM is crucial for evaluating loans, savings goals (like retirement), and investment opportunities to understand their true costs and potential growth." },
        { id: 70, quizId: "time-value", themeId: 3, category: "Time Value of Money", question: "If you need ₦1,000,000 in 5 years and can earn 8% interest annually, you need to invest _______ today compared to if you earned 0% interest.", options: ["The same amount", "More", "Less", "Exactly ₦1,000,000"], correctAnswerIndex: 2, explanation: "Because your money will grow with interest, you need to invest a smaller initial amount (the present value) to reach the ₦1M future goal compared to just saving cash with no growth." },
        // Category 15: Behavioral Finance Intro
        { id: 71, quizId: "behavioral-finance", themeId: 3, category: "Behavioral Finance Intro", question: "What does behavioral finance primarily study?", options: ["Stock market prediction algorithms", "How psychological factors influence investor decisions and market outcomes", "Government economic policies", "Mathematical finance models only"], correctAnswerIndex: 1, explanation: "Behavioral finance combines psychology and economics to understand why people make certain financial choices, often leading to irrational outcomes." },
        { id: 72, quizId: "behavioral-finance", themeId: 3, category: "Behavioral Finance Intro", question: "What is 'Loss Aversion' bias?", options: ["Tendency to prefer guaranteed small gains", "Tendency to feel the pain of a loss more strongly than the pleasure of an equal gain, leading to risk-averse behavior", "Ignoring losses completely", "Chasing past winning investments"], correctAnswerIndex: 1, explanation: "Loss aversion means people dislike losses more than they like equivalent gains, often causing them to hold onto losing investments too long or sell winners too early." },
        { id: 73, quizId: "behavioral-finance", themeId: 3, category: "Behavioral Finance Intro", question: "What is 'Herd Mentality' in investing?", options: ["Carefully diversifying investments", "Tendency for individuals to follow the actions of a larger group, often irrationally", "Investing based on fundamental analysis", "Sticking to a long-term plan regardless of market noise"], correctAnswerIndex: 1, explanation: "Herd mentality leads investors to buy or sell assets primarily because many others are doing so, often driven by fear or greed rather than analysis." },
        { id: 74, quizId: "behavioral-finance", themeId: 3, category: "Behavioral Finance Intro", question: "What is 'Confirmation Bias'?", options: ["Seeking out information that contradicts your beliefs", "Tendency to search for, interpret, favor, and recall information that confirms pre-existing beliefs", "Ignoring all financial news", "A bias towards short-term investments"], correctAnswerIndex: 1, explanation: "Confirmation bias makes investors overweight information supporting their views and underweight conflicting data, potentially leading to poor decisions." },
        { id: 75, quizId: "behavioral-finance", themeId: 3, category: "Behavioral Finance Intro", question: "How can understanding behavioral biases help investors?", options: ["Guarantee market-beating returns", "Become aware of potential psychological pitfalls and make more rational, objective decisions", "Eliminate all investment risk", "Perfectly time market movements"], correctAnswerIndex: 1, explanation: "Awareness of biases like loss aversion or herding allows investors to recognize these tendencies in themselves and others, fostering more disciplined and logical decision-making." },
        // Theme 4: Protection & Long-Term Security (Categories 16-20)
        // Category 16: Insurance Basics
        { id: 76, quizId: "insurance-basics", themeId: 4, category: "Insurance Basics", question: "What is the main purpose of buying insurance?", options: ["To make profit from claims", "To transfer the risk of potential financial loss to an insurance company", "To get discounts on unrelated products", "As mandatory savings"], correctAnswerIndex: 1, explanation: "Insurance manages risk; you pay a premium, the insurer compensates for specified potential losses." },
        { id: 77, quizId: "insurance-basics", themeId: 4, category: "Insurance Basics", question: "What is an insurance 'premium'?", options: ["Payout amount after a claim", "Max policy coverage", "Regular amount paid by policyholder to keep policy active", "Bonus for no claims"], correctAnswerIndex: 2, explanation: "The premium is the fee paid to the insurer for coverage against specific risks." },
        { id: 78, quizId: "insurance-basics", themeId: 4, category: "Insurance Basics", question: "In an insurance policy, what is a 'deductible' (or 'excess')?", options: ["Premium discount", "Total policy cover", "Extra claim fee", "Amount policyholder pays out-of-pocket before insurer pays"], correctAnswerIndex: 3, explanation: "Deductible is the initial portion of a claim the insured pays. Higher deductibles often mean lower premiums." },
        { id: 79, quizId: "insurance-basics", themeId: 4, category: "Insurance Basics", question: "What type of insurance typically covers your legal responsibility if you cause injury to someone or damage their property?", options: ["Health insurance", "Life insurance", "Liability insurance (e.g., part of car or home insurance)", "Travel insurance"], correctAnswerIndex: 2, explanation: "Liability insurance protects you financially if you are found legally responsible for harm or damage to others. Third-party motor insurance is a common example." },
        { id: 80, quizId: "insurance-basics", themeId: 4, category: "Insurance Basics", question: "What is the primary purpose of life insurance?", options: ["To cover minor medical expenses", "To provide financial support to dependents (beneficiaries) after the insured person's death", "To save for retirement", "To insure property against damage"], correctAnswerIndex: 1, explanation: "Life insurance pays a death benefit to beneficiaries, helping replace lost income or cover final expenses." },
        // Category 17: Identity Theft & Fraud
        { id: 81, quizId: "identity-theft", themeId: 4, category: "Identity Theft & Fraud", question: "What is 'phishing'?", options: ["A method of fishing for sport", "Attempting to trick someone into revealing sensitive information (like passwords or card numbers) via fake emails, websites, or messages", "Securing your online accounts with strong passwords", "A type of computer virus"], correctAnswerIndex: 1, explanation: "Phishing scams use deceptive communications pretending to be from legitimate sources to steal personal data." },
        { id: 82, quizId: "identity-theft", themeId: 4, category: "Identity Theft & Fraud", question: "How can using strong, unique passwords for different online accounts help prevent financial loss?", options: ["It makes accounts easier to remember", "It prevents hackers who gain access to one account from easily accessing others", "It guarantees account security completely", "It automatically reports suspicious activity"], correctAnswerIndex: 1, explanation: "If one password is compromised, using unique ones elsewhere limits the attacker's access to other potentially sensitive accounts." },
        { id: 83, quizId: "identity-theft", themeId: 4, category: "Identity Theft & Fraud", question: "What should you do if you suspect your financial information has been compromised?", options: ["Wait a few weeks to see what happens", "Immediately contact your bank/financial institutions, monitor accounts closely, and consider reporting to authorities", "Share the details publicly on social media", "Ignore it unless you see large unauthorized transactions"], correctAnswerIndex: 1, explanation: "Prompt action is crucial to limit damage. Contacting institutions allows them to block cards/accounts and investigate." },
        { id: 84, quizId: "identity-theft", themeId: 4, category: "Identity Theft & Fraud", question: "Why is it risky to conduct sensitive financial transactions on public Wi-Fi networks?", options: ["Public Wi-Fi is always faster", "These networks are often unsecured, making it easier for hackers to intercept your data", "Banks block transactions on public Wi-Fi", "It uses too much mobile data"], correctAnswerIndex: 1, explanation: "Unsecured networks lack encryption, potentially exposing your login details, card numbers, etc., to eavesdroppers on the same network." },
        { id: 85, quizId: "identity-theft", themeId: 4, category: "Identity Theft & Fraud", question: "What does enabling Two-Factor Authentication (2FA or MFA) do for account security?", options: ["Makes passwords unnecessary", "Adds an extra layer of security by requiring a second verification step (like a code from your phone) besides your password", "Slows down account login significantly", "Is only available for email accounts"], correctAnswerIndex: 1, explanation: "2FA makes it much harder for attackers to access accounts even if they have your password, as they also need the second factor (e.g., your phone)." },
        // Category 18: Retirement Planning Intro
        { id: 86, quizId: "retirement-intro", themeId: 4, category: "Retirement Planning Intro", question: "Why is starting retirement planning early advantageous?", options: ["Official retirement ages are very young", "To maximize the benefits of compound interest over many decades", "Government pensions cover all needs", "To impress employers"], correctAnswerIndex: 1, explanation: "Starting early allows contributions and earnings more time to compound, potentially leading to significantly larger retirement savings." },
        { id: 87, quizId: "retirement-intro", themeId: 4, category: "Retirement Planning Intro", question: "When planning for retirement, why must inflation be considered?", options: ["Inflation makes investments grow faster", "Inflation decreases retiree living costs", "Inflation erodes purchasing power; you'll need more money in the future for the same lifestyle", "Banks auto-adjust pensions for inflation"], correctAnswerIndex: 2, explanation: "Inflation reduces what money can buy over time, so planning must account for the rising cost of goods/services." },
        { id: 88, quizId: "retirement-intro", themeId: 4, category: "Retirement Planning Intro", question: "Besides pensions, what other sources might contribute to retirement income?", options: ["Relying solely on children", "Personal savings, investments (stocks, bonds, real estate), part-time work", "Government unemployment benefits", "Lottery winnings"], correctAnswerIndex: 1, explanation: "Secure retirement often relies on multiple streams: pensions, personal savings, investment returns, and sometimes continued work." },
        { id: 89, quizId: "retirement-intro", themeId: 4, category: "Retirement Planning Intro", question: "What is the main difference between saving and investing for retirement?", options: ["Saving is short-term/safety; investing aims for long-term growth (with risk)", "Investing is safer", "Saving yields higher returns", "No difference"], correctAnswerIndex: 0, explanation: "Retirement typically requires investing for long-term growth to outpace inflation, while some savings provide short-term stability." },
        { id: 90, quizId: "retirement-intro", themeId: 4, category: "Retirement Planning Intro", question: "Which is generally considered a lower-risk investment often suitable for capital preservation, perhaps closer to retirement?", options: ["Technology startup shares", "Small unlisted company shares", "Government bonds or Treasury Bills", "Volatile cryptocurrencies"], correctAnswerIndex: 2, explanation: "Government bonds are backed by the government, making them relatively safe compared to individual companies or speculative assets." },
        // Category 19: Major Purchase Planning
        { id: 91, quizId: "major-purchases", themeId: 4, category: "Major Purchase Planning", question: "When saving for a large purchase like a car or house down payment, why is setting a specific target amount and deadline important?", options: ["It makes the process more stressful", "It helps calculate required savings per month and keeps you motivated and accountable", "It guarantees the item's price won't change", "It's not important for large purchases"], correctAnswerIndex: 1, explanation: "Specific targets and deadlines make goals tangible and allow you to create a realistic savings plan to track progress." },
        { id: 92, quizId: "major-purchases", themeId: 4, category: "Major Purchase Planning", question: "Before taking out a loan for a major purchase, what should you assess first?", options: ["How quickly you can get the loan", "Your ability to afford the monthly payments within your budget AND the total cost of the loan (including interest)", "Which lender has the nicest logo", "Whether friends have similar loans"], correctAnswerIndex: 1, explanation: "Ensuring the loan fits your budget (monthly payments) and understanding the total interest cost are crucial before committing to debt." },
        { id: 93, quizId: "major-purchases", themeId: 4, category: "Major Purchase Planning", question: "What is a 'down payment' typically used for when buying a house or car?", options: ["A small fee for the application", "An initial upfront payment made towards the total price, reducing the amount needing to be borrowed", "The first month's loan repayment", "Insurance costs"], correctAnswerIndex: 1, explanation: "A down payment is a portion of the purchase price paid upfront, which reduces the loan principal and often results in better loan terms." },
        { id: 94, quizId: "major-purchases", themeId: 4, category: "Major Purchase Planning", question: "Besides the purchase price, what other costs should be budgeted for when buying a car?", options: ["Only fuel costs", "Insurance, registration/taxes, maintenance/repairs, fuel", "The cost of washing it weekly", "Potential resale value"], correctAnswerIndex: 1, explanation: "Total cost of ownership includes ongoing expenses beyond the sticker price, which must be factored into your budget." },
        { id: 95, quizId: "major-purchases", themeId: 4, category: "Major Purchase Planning", question: "When considering buying a house vs. renting, what is a key financial factor to analyze?", options: ["Which option neighbors prefer", "Comparing total monthly housing costs (rent vs. mortgage+taxes+insurance+maintenance) AND potential long-term equity building", "The color of the house", "How close it is to entertainment venues"], correctAnswerIndex: 1, explanation: "A sound financial decision involves comparing the full costs of both options and considering factors like potential appreciation and equity build-up (owning) vs. flexibility (renting)." },
        // Category 20: Estate Planning Basics
        { id: 96, quizId: "estate-planning", themeId: 4, category: "Estate Planning Basics", question: "What is the primary purpose of having a Will?", options: ["To avoid all taxes", "To specify how your assets should be distributed after your death and name guardians for minor children", "To manage investments while alive", "As a requirement for opening a bank account"], correctAnswerIndex: 1, explanation: "A will is a legal document outlining your wishes for asset distribution and guardianship, ensuring your intentions are followed and potentially simplifying the process for your heirs." },
        { id: 97, quizId: "estate-planning", themeId: 4, category: "Estate Planning Basics", question: "What happens if someone dies 'intestate' (without a valid Will) in Nigeria?", options: ["The government takes all the assets", "Assets are distributed according to customary law or statutory rules of inheritance, which may not align with the deceased's wishes", "The closest relative automatically inherits everything", "A Will is automatically created by the court"], correctAnswerIndex: 1, explanation: "Dying intestate means the law (statutory or customary) dictates asset distribution, potentially leading to disputes or outcomes different from what the person wanted." },
        { id: 98, quizId: "estate-planning", themeId: 4, category: "Estate Planning Basics", question: "What is a 'beneficiary' in the context of a Will or life insurance?", options: ["The lawyer who writes the Will", "The person or entity designated to receive assets or benefits", "The executor managing the estate", "A government tax agency"], correctAnswerIndex: 1, explanation: "A beneficiary is the intended recipient of assets or proceeds from a will, trust, or insurance policy." },
        { id: 99, quizId: "estate-planning", themeId: 4, category: "Estate Planning Basics", question: "What is the role of an 'Executor' of a Will?", options: ["To challenge the Will in court", "The person responsible for carrying out the instructions in the Will, managing assets, paying debts, and distributing property", "The main beneficiary", "A judge overseeing the process"], correctAnswerIndex: 1, explanation: "The Executor is appointed (in the Will or by court) to administer the deceased's estate according to the Will's terms and legal requirements." },
        { id: 100, quizId: "estate-planning", themeId: 4, category: "Estate Planning Basics", question: "Why might naming a guardian for minor children in a Will be important?", options: ["It's required to get life insurance", "It specifies who you wish to care for your children if both parents pass away, guiding the court's decision", "It provides automatic funding for the children's care", "It replaces the need for godparents"], correctAnswerIndex: 1, explanation: "Naming a guardian expresses your preference for who should raise your children, providing crucial guidance for the family and courts, though the court makes the final appointment." }
    ];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function safeFocus(element, context = "") {
        if (element && typeof element.focus === 'function') {
            setTimeout(() => {
                try {
                    element.focus({ preventScroll: false });
                    logger.debug(`[safeFocus] Focused element within ${context}:`, element.id || element.tagName);
                } catch (err) {
                    logger.error(`[safeFocus] Focusing element failed within ${context}:`, err, element.id || element.tagName);
                }
            }, CONFIG.MODAL_FOCUS_DELAY / 2);
        } else {
            logger.warn(`[safeFocus] Element is not focusable or doesn't exist within ${context}:`, element);
        }
    }

    function updateCopyrightYear() {
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
            logger.debug("Copyright year updated.");
        }
    }

    function validateQuizDataIntegrity() {
        logger.debug("Validating main quiz data integrity...");
        if (!Array.isArray(fullQuizData)) {
            logger.error("CRITICAL: `fullQuizData` is not an array."); return false;
        }
        if (fullQuizData.length !== CONFIG.EXPECTED_TOTAL_QUESTIONS) {
            logger.error(`CRITICAL: Expected ${CONFIG.EXPECTED_TOTAL_QUESTIONS} questions, but found ${fullQuizData.length}.`); return false;
        }
        if (fullQuizData.length > 0) {
            const firstQ = fullQuizData[0];
            const requiredKeys = ['id', 'quizId', 'category', 'question', 'options', 'correctAnswerIndex', 'explanation'];
            if (!firstQ || requiredKeys.some(key => !(key in firstQ))) {
                logger.error("CRITICAL: First question has a missing/invalid core property:", firstQ); return false;
            }
            if (!Array.isArray(firstQ.options) || firstQ.options.length === 0 || typeof firstQ.correctAnswerIndex !== 'number') {
                logger.error("CRITICAL: First question has invalid options/correctAnswerIndex."); return false;
            }
        }
        logger.info(`Main quiz data: ${fullQuizData.length} questions appear structurally valid.`);
        return true;
    }

    function initializeAccordionInteractions() {
        if (!accordionElement) return;
        const accordionItems = accordionElement.querySelectorAll(CONFIG.ACCORDION_ITEM_SELECTOR);
        if (!accordionItems.length) return;

        accordionItems.forEach(item => {
            const button = item.querySelector(CONFIG.ACCORDION_BUTTON_SELECTOR);
            const collapsePanel = item.querySelector(CONFIG.ACCORDION_COLLAPSE_SELECTOR);

            if (button && collapsePanel) {
                const isInitiallyCollapsed = button.classList.contains(CONFIG.ACCORDION_BUTTON_COLLAPSED_CLASS);
                button.setAttribute('aria-expanded', !isInitiallyCollapsed);
                collapsePanel.style.overflow = 'hidden';

                if (isInitiallyCollapsed) {
                    collapsePanel.style.height = '0px';
                    collapsePanel.style.visibility = 'hidden';
                } else {
                    collapsePanel.classList.add(CONFIG.ACCORDION_COLLAPSE_SHOW_CLASS);
                    collapsePanel.style.height = collapsePanel.scrollHeight + 'px';
                    setTimeout(() => {
                        if (collapsePanel.classList.contains(CONFIG.ACCORDION_COLLAPSE_SHOW_CLASS)) {
                           collapsePanel.style.height = 'auto';
                        }
                    }, CONFIG.ACCORDION_ANIMATION_DURATION);
                    collapsePanel.style.visibility = 'visible';
                }
                button.addEventListener('click', () => handleAccordionToggle(button, collapsePanel, accordionElement));
                collapsePanel.addEventListener('transitionend', (event) => {
                    if (event.propertyName === 'height' && collapsePanel.classList.contains(CONFIG.ACCORDION_COLLAPSE_SHOW_CLASS) && collapsePanel.style.height !== '0px') {
                        collapsePanel.style.height = 'auto';
                    }
                });
            }
        });
        logger.info("Accordion interactions initialized.");
    }

    function handleAccordionToggle(button, collapsePanel, parentAccordion) {
        const isCurrentlyExpanded = button.getAttribute('aria-expanded') === 'true';

        parentAccordion.querySelectorAll(CONFIG.ACCORDION_ITEM_SELECTOR).forEach(otherItem => {
            const otherButton = otherItem.querySelector(CONFIG.ACCORDION_BUTTON_SELECTOR);
            const otherCollapse = otherItem.querySelector(CONFIG.ACCORDION_COLLAPSE_SELECTOR);
            if (otherButton && otherButton !== button && otherButton.getAttribute('aria-expanded') === 'true') {
                performAccordionClose(otherButton, otherCollapse);
            }
        });

        if (isCurrentlyExpanded) {
            performAccordionClose(button, collapsePanel);
        } else {
            performAccordionOpen(button, collapsePanel);
        }
    }

    function performAccordionOpen(button, collapsePanel) {
        button.classList.remove(CONFIG.ACCORDION_BUTTON_COLLAPSED_CLASS);
        button.setAttribute('aria-expanded', 'true');
        collapsePanel.style.visibility = 'visible';
        const scrollHeight = collapsePanel.scrollHeight;
        collapsePanel.style.height = scrollHeight + 'px';
        collapsePanel.classList.add(CONFIG.ACCORDION_COLLAPSE_SHOW_CLASS);
        logger.debug('Opened accordion panel:', collapsePanel.id);
    }

    function performAccordionClose(button, collapsePanel) {
        button.classList.add(CONFIG.ACCORDION_BUTTON_COLLAPSED_CLASS);
        button.setAttribute('aria-expanded', 'false');
        collapsePanel.style.height = collapsePanel.scrollHeight + 'px';
        requestAnimationFrame(() => {
             setTimeout(() => {
                collapsePanel.style.height = '0px';
             }, 0);
        });
        setTimeout(() => {
            if (button.classList.contains(CONFIG.ACCORDION_BUTTON_COLLAPSED_CLASS)) {
                collapsePanel.style.visibility = 'hidden';
                collapsePanel.classList.remove(CONFIG.ACCORDION_COLLAPSE_SHOW_CLASS);
            }
        }, CONFIG.ACCORDION_ANIMATION_DURATION);
        logger.debug('Closed accordion panel:', collapsePanel.id);
    }

    function openQuizModal(triggerEl) {
        if (!quizModalElement || !quizModalContentElement) {
            logger.error("Quiz modal/content element not found. Cannot open."); return;
        }
        activeModalTriggerElement = triggerEl;
        document.body.style.overflow = 'hidden';
        quizModalElement.hidden = false;
        currentQuiz.isOngoing = true; // NEW: Mark quiz as ongoing

        escapeKeyListener = (event) => handleEscapeKeyForModal(event);

        requestAnimationFrame(() => {
            quizModalElement.classList.add(CONFIG.MODAL_VISIBLE_CLASS);
            quizModalContentElement.style.opacity = '1';
            quizModalContentElement.style.transform = 'translateY(0) scale(1)';

            if (activeFocusTrapHandler) document.removeEventListener('keydown', activeFocusTrapHandler);
            activeFocusTrapHandler = trapFocusInModal(quizModalElement);
            document.addEventListener('keydown', activeFocusTrapHandler);
            document.addEventListener('keydown', escapeKeyListener);

            // Focus on the first interactive element or the modal content.
            // This usually is the first option button, or the close button.
            const firstInteractive = quizModalOptionsAreaEl?.querySelector('.quiz-option:not([disabled])') ||
                                   quizModalCloseBtnEl ||
                                   quizModalContentElement;
            safeFocus(firstInteractive, 'Quiz Modal Opening');
        });
        logger.info("Quiz modal opened and quiz marked as ongoing.");
    }

    function closeQuizModal(returnFocus = true) {
        if (!quizModalElement || quizModalElement.hidden) return;

        logger.info("Closing quiz modal...");
        currentQuiz.isOngoing = false; // NEW: Mark quiz as no longer ongoing
        if (escapeKeyListener) document.removeEventListener('keydown', escapeKeyListener);
        escapeKeyListener = null;
        if (activeFocusTrapHandler) {
            document.removeEventListener('keydown', activeFocusTrapHandler);
            activeFocusTrapHandler = null;
        }

        quizModalElement.classList.remove(CONFIG.MODAL_VISIBLE_CLASS);
        if (quizModalContentElement) {
             quizModalContentElement.style.opacity = '0';
             quizModalContentElement.style.transform = 'translateY(20px) scale(0.95)';
        }

        const transitionHandler = (event) => {
            if (event.target !== quizModalContentElement && event.target !== quizModalElement) {
                return;
            }
            if (quizModalElement.hidden || quizModalElement.classList.contains(CONFIG.MODAL_VISIBLE_CLASS)) {
                 if (event.target === quizModalContentElement || event.target === quizModalElement) {
                     (event.target).removeEventListener('transitionend', transitionHandler);
                 }
                return;
            }

            quizModalElement.hidden = true;
            document.body.style.overflow = '';
            resetQuizInterface();
            if (returnFocus && activeModalTriggerElement && typeof activeModalTriggerElement.focus === 'function') {
                safeFocus(activeModalTriggerElement, 'Quiz Modal Closing');
            }
            activeModalTriggerElement = null;
            (event.target).removeEventListener('transitionend', transitionHandler);
            logger.debug("Quiz modal fully closed via transitionend.");
        };
        
        const animatedElement = quizModalContentElement || quizModalElement;
        animatedElement.addEventListener('transitionend', transitionHandler);
        
        setTimeout(() => {
            if (!quizModalElement.hidden && !quizModalElement.classList.contains(CONFIG.MODAL_VISIBLE_CLASS)) {
                logger.warn("Modal transitionend event fallback triggered for close.");
                quizModalElement.hidden = true;
                document.body.style.overflow = '';
                resetQuizInterface();
                 if (returnFocus && activeModalTriggerElement && typeof activeModalTriggerElement.focus === 'function') {
                    safeFocus(activeModalTriggerElement, 'Quiz Modal Closing (Fallback)');
                }
                activeModalTriggerElement = null;
                animatedElement.removeEventListener('transitionend', transitionHandler);
            }
        }, CONFIG.MODAL_TRANSITION_DURATION + 150);
    }

    function handleEscapeKeyForModal(event) {
        if (event.key === 'Escape') {
            // Allow closing only if results are shown OR if user confirms closing ongoing quiz (optional future enhancement)
            if (!currentQuiz.isOngoing || quizModalResultsAreaEl.hidden === false) {
                closeQuizModal();
            } else {
                // Optional: Confirm if they want to exit an ongoing quiz. For now, prevent Esc close of active quiz.
                logger.debug("Escape key pressed during ongoing quiz; close prevented unless results showing.");
                // To allow close on escape during active quiz, simply call closeQuizModal() here.
            }
        }
    }

    function trapFocusInModal(modal) {
        const focusableElements = Array.from(
            modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
        ).filter(el => el && !el.disabled && !el.hidden && el.offsetWidth > 0 && el.offsetHeight > 0 && getComputedStyle(el).visibility !== 'hidden');

        if (focusableElements.length === 0) {
             logger.warn("No focusable elements found in modal for trap.");
             if (modal.getAttribute('tabindex') === null) modal.setAttribute('tabindex', "-1");
             return (event) => {};
        }
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        return function(event) {
            if (event.key !== 'Tab') return;
            if (!modal.contains(document.activeElement)) {
                 safeFocus(firstElement, "Focus Trap Recovery"); return;
            }
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault(); safeFocus(lastElement, "Focus Trap Shift+Tab");
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault(); safeFocus(firstElement, "Focus Trap Tab");
                }
            }
        };
    }

    function prepareNewQuiz(questions, isFull, quizIdStr = null, category = '') {
        logger.info(`Preparing new quiz. Full: ${isFull}, ID: ${quizIdStr || 'N/A'}, Cat: "${category || 'Full'}"`);
        shuffleArray(questions);
        currentQuiz = {
            questions: questions.slice(0, isFull ? CONFIG.EXPECTED_TOTAL_QUESTIONS : CONFIG.QUESTIONS_PER_CATEGORY),
            currentQuestionIndex: 0,
            score: 0,
            userAnswers: {},
            isFullChallenge: isFull,
            quizId: quizIdStr,
            categoryName: category,
            isOngoing: false // Will be set true when modal opens
        };
        logger.debug("Prepared quiz questions count:", currentQuiz.questions.length);
    }

    function startQuizFlow(triggerEl) {
        if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
            logger.error("Cannot start: No questions loaded for the current quiz.");
            alert("Error: Questions for this quiz could not be loaded."); return;
        }
        if (!setupQuizModalInterface()) {
            logger.error("Failed to setup quiz modal interface. Aborting quiz start.");
            return;
        }
        currentQuiz.isOngoing = true; // Moved here, just before modal opens, ensures it's set
        displayCurrentQuizQuestion();
        openQuizModal(triggerEl); // openQuizModal will also set currentQuiz.isOngoing
    }

    function setupQuizModalInterface() {
        if (!quizModalTitleEl && !cacheQuizModalInternalElements()) {
             logger.error("Critical: Quiz modal internal elements not found during setup. Aborting UI setup.");
             alert("A critical error occurred setting up the quiz. Please try again later.");
             return false;
        }
        const title = currentQuiz.isFullChallenge ? "Full Financial Fitness Challenge" : (currentQuiz.categoryName || "Financial Quiz");
        quizModalTitleEl.textContent = title;
        quizModalCurrentQEl.textContent = '0';
        quizModalTotalQEl.textContent = currentQuiz.questions.length;

        quizModalQuestionAreaEl.innerHTML = ''; quizModalQuestionAreaEl.hidden = false;
        quizModalOptionsAreaEl.innerHTML = ''; quizModalOptionsAreaEl.hidden = false;
        quizModalFeedbackAreaEl.hidden = true; quizModalFeedbackAreaEl.className = 'quiz-modal-feedback';
        quizModalResultsAreaEl.hidden = true; quizModalResultsAreaEl.innerHTML = '';

        // *** ENHANCEMENT: Ensure Next and Restart are hidden at start of new quiz ***
        quizModalNextBtnEl.hidden = true;
        quizModalRestartBtnEl.hidden = true; // Restart only available at results
        quizModalCloseResultsBtnEl.hidden = true; // Close (results version) only available at results
        
        quizModalProgressEl.hidden = false;
        quizModalProgressEl.style.setProperty('--quiz-current-question', 0);
        quizModalProgressEl.style.setProperty('--quiz-total-questions', currentQuiz.questions.length || 1);

        quizModalRestartBtnEl.innerHTML = `<i class="fas fa-redo" aria-hidden="true"></i> Restart ${currentQuiz.isFullChallenge ? 'Full Challenge' : 'Quiz'}`;
        logger.debug("Quiz modal interface setup complete for new quiz.");
        return true;
    }

    function displayCurrentQuizQuestion() {
        if (currentQuiz.currentQuestionIndex >= currentQuiz.questions.length) {
            currentQuiz.isOngoing = false; // Quiz finished, moving to results
            logger.info("All questions answered. Showing results.");
            showQuizResults(); return;
        }
        currentQuiz.isOngoing = true; // Explicitly ensure quiz is ongoing
        const questionData = currentQuiz.questions[currentQuiz.currentQuestionIndex];
        if (!questionData) {
            currentQuiz.isOngoing = false;
            logger.error(`Error: Missing question data for index ${currentQuiz.currentQuestionIndex}.`);
            showQuizResults(); return;
        }
        logger.debug(`Displaying question ${currentQuiz.currentQuestionIndex + 1}: ${questionData.question}`);

        quizModalQuestionAreaEl.innerHTML = `<span class="q-num">${currentQuiz.currentQuestionIndex + 1}.</span> ${questionData.question}`;
        quizModalCurrentQEl.textContent = currentQuiz.currentQuestionIndex + 1;
        
        if (quizModalProgressEl) {
            quizModalProgressEl.style.setProperty('--quiz-current-question', currentQuiz.currentQuestionIndex + 1);
            quizModalProgressEl.style.setProperty('--quiz-total-questions', currentQuiz.questions.length);
        }

        quizModalOptionsAreaEl.innerHTML = '';
        const optionsWithOriginalIndex = questionData.options.map((text, index) => ({ text, originalIndex: index }));
        shuffleArray(optionsWithOriginalIndex);

        optionsWithOriginalIndex.forEach(option => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn quiz-option';
            button.textContent = option.text;
            button.dataset.originalIndex = option.originalIndex;
            button.addEventListener('click', handleQuizOptionSelection);
            quizModalOptionsAreaEl.appendChild(button);
        });

        quizModalFeedbackAreaEl.hidden = true; quizModalFeedbackAreaEl.className = 'quiz-modal-feedback';
        // *** ENHANCEMENT: Ensure Next is hidden until option selected ***
        quizModalNextBtnEl.hidden = true; 
        // Restart button should remain hidden during questions
        quizModalRestartBtnEl.hidden = true;
        quizModalCloseResultsBtnEl.hidden = true; // This is for results screen; main close button (X) is always there
        
        const firstOption = quizModalOptionsAreaEl.querySelector('.quiz-option');
        if (firstOption) safeFocus(firstOption, 'Displaying Question Options');
    }

    function handleQuizOptionSelection(event) {
        const selectedButton = event.currentTarget;
        const selectedOriginalIndex = parseInt(selectedButton.dataset.originalIndex);
        const questionData = currentQuiz.questions[currentQuiz.currentQuestionIndex];

        logger.debug(`Option selected. Original Index: ${selectedOriginalIndex}. Correct Index: ${questionData.correctAnswerIndex}`);

        quizModalOptionsAreaEl.querySelectorAll('.quiz-option').forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('correct', 'incorrect');
        });

        currentQuiz.userAnswers[questionData.id] = selectedOriginalIndex;
        const isCorrect = selectedOriginalIndex === questionData.correctAnswerIndex;
        if (isCorrect) currentQuiz.score++;

        selectedButton.classList.add(isCorrect ? 'correct' : 'incorrect');

        if (!isCorrect) {
            const correctButton = quizModalOptionsAreaEl.querySelector(`.quiz-option[data-original-index="${questionData.correctAnswerIndex}"]`);
            if (correctButton) correctButton.classList.add('correct');
        }

        quizModalFeedbackAreaEl.innerHTML = `<strong>${isCorrect ? 'Correct!' : 'Insight:'}</strong> ${questionData.explanation || 'Review the answers.'}`;
        quizModalFeedbackAreaEl.className = `quiz-modal-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        quizModalFeedbackAreaEl.hidden = false;

        // *** ENHANCEMENT: Only show Next button or Results-related buttons AFTER selection ***
        if (currentQuiz.currentQuestionIndex < currentQuiz.questions.length - 1) {
            quizModalNextBtnEl.hidden = false; // Show Next button now
            quizModalRestartBtnEl.hidden = true; // Keep Restart hidden
            quizModalCloseResultsBtnEl.hidden = true; // Keep Close (results) hidden
            safeFocus(quizModalNextBtnEl, 'Next Question Button Shown');
        } else { // Last question answered
            currentQuiz.isOngoing = false; // Quiz technically finished, results will show
            quizModalNextBtnEl.hidden = true; // No more "Next"
            // These will be made visible by showQuizResults
            // quizModalRestartBtnEl.hidden = false; 
            // quizModalCloseResultsBtnEl.hidden = false;
            logger.info("Last question answered. Scheduling results display.");
            setTimeout(showQuizResults, CONFIG.QUIZ_FEEDBACK_DELAY);
        }
    }

    function proceedToNextQuestion() {
        logger.debug("Proceeding to next question.");
        currentQuiz.currentQuestionIndex++;
        displayCurrentQuizQuestion(); // This will hide Next button again
    }

    function showQuizResults() {
        currentQuiz.isOngoing = false; // Ensure quiz is marked as not ongoing
        logger.info("Displaying quiz results.");
        quizModalQuestionAreaEl.hidden = true;
        quizModalOptionsAreaEl.hidden = true;
        quizModalFeedbackAreaEl.hidden = true;
        quizModalNextBtnEl.hidden = true; // Definitely hide Next at results
        
        if(quizModalProgressEl) {
            quizModalProgressEl.hidden = true;
        }

        const totalQuestions = currentQuiz.questions.length;
        const percentage = totalQuestions > 0 ? Math.round((currentQuiz.score / totalQuestions) * 100) : 0;
        let resultMessage = '';
        let resultTitle = "Quiz Results";

        if (currentQuiz.isFullChallenge) {
            resultTitle = "Full Challenge Results";
            if (percentage >= 90) resultMessage = "Exceptional understanding! You're a financial whiz!";
            else if (percentage >= 75) resultMessage = "Excellent job! You have a strong grasp of personal finance.";
            else if (percentage >= 50) resultMessage = "Good effort! Solid foundation. Keep learning and growing.";
            else resultMessage = "Challenge complete! Every question is a learning opportunity.";
        } else {
            resultTitle = `${currentQuiz.categoryName || 'Quiz'} Results`;
            if (percentage === 100) resultMessage = `Perfect score in ${currentQuiz.categoryName || 'this quiz'}! Mastered!`;
            else if (percentage >= 80) resultMessage = `Great work on ${currentQuiz.categoryName || 'this quiz'}! You're getting there.`;
            else if (percentage >= 50) resultMessage = `Solid effort in ${currentQuiz.categoryName || 'this quiz'}. Review the insights to boost your knowledge!`;
            else resultMessage = `Good start on ${currentQuiz.categoryName || 'this quiz'}. Keep practicing and review the insights to improve.`;
        }
        quizModalTitleEl.textContent = resultTitle;

        quizModalResultsAreaEl.innerHTML = `
            <h4>Results Summary</h4>
            <p class="quiz-final-score">You scored: <strong>${currentQuiz.score} out of ${totalQuestions}</strong> (${percentage}%)</p>
            <p class="quiz-feedback-message">${resultMessage}</p>
        `;
        quizModalResultsAreaEl.hidden = false;

        // *** ENHANCEMENT: Only show Restart and Close (Results) here ***
        quizModalRestartBtnEl.hidden = false;
        quizModalCloseResultsBtnEl.hidden = false; // This is the "Close" button for the results screen
        safeFocus(quizModalRestartBtnEl, 'Quiz Results Shown');
    }

    function handleRestartQuiz() {
        logger.info(`Restarting quiz. Full challenge: ${currentQuiz.isFullChallenge}, Quiz ID: ${currentQuiz.quizId || 'N/A'}`);
        // currentQuiz.isOngoing will be reset by prepareNewQuiz and startQuizFlow
        const originalTrigger = activeModalTriggerElement;
        let questionsForRestart;
        let quizTitleForRestart;

        if (currentQuiz.isFullChallenge) {
            questionsForRestart = [...fullQuizData];
            quizTitleForRestart = 'Full Financial Fitness Challenge';
            prepareNewQuiz(questionsForRestart, true, null, quizTitleForRestart);
        } else {
            questionsForRestart = fullQuizData.filter(q => q.quizId === currentQuiz.quizId);
            quizTitleForRestart = currentQuiz.categoryName;
            prepareNewQuiz(questionsForRestart, false, currentQuiz.quizId, quizTitleForRestart);
        }
        startQuizFlow(originalTrigger); // This will reset ongoing state correctly
    }

    function resetQuizInterface() {
        currentQuiz.isOngoing = false; // Ensure it's reset
        if (!quizModalTitleEl && !cacheQuizModalInternalElements()) {
             logger.warn("Cannot reset interface, modal elements not available or not cached."); return;
        }
        quizModalTitleEl.textContent = 'Financial Fitness Quiz';
        if(quizModalProgressEl) {
            quizModalProgressEl.hidden = true;
            quizModalProgressEl.style.setProperty('--quiz-current-question', 0);
            quizModalProgressEl.style.setProperty('--quiz-total-questions', 1);
        }
        if(quizModalCurrentQEl) quizModalCurrentQEl.textContent = '0';
        if(quizModalTotalQEl) quizModalTotalQEl.textContent = '0';

        quizModalQuestionAreaEl.innerHTML = ''; quizModalQuestionAreaEl.hidden = true;
        quizModalOptionsAreaEl.innerHTML = ''; quizModalOptionsAreaEl.hidden = true;
        quizModalFeedbackAreaEl.innerHTML = ''; quizModalFeedbackAreaEl.hidden = true;
        quizModalFeedbackAreaEl.className = 'quiz-modal-feedback';
        quizModalResultsAreaEl.innerHTML = ''; quizModalResultsAreaEl.hidden = true;

        [quizModalNextBtnEl, quizModalRestartBtnEl, quizModalCloseResultsBtnEl].forEach(btn => {
             if (btn) btn.hidden = true; // Hide all action buttons on reset
        });
        logger.debug("Quiz modal interface elements reset.");
    }

    function cacheGlobalElements() {
        accordionElement = document.querySelector(CONFIG.ACCORDION_SELECTOR);
        startFullChallengeBtn = document.getElementById(CONFIG.START_FULL_CHALLENGE_BTN_ID);
        quizModalElement = document.querySelector(CONFIG.QUIZ_MODAL_SELECTOR);
        if (quizModalElement) {
            quizModalContentElement = quizModalElement.querySelector(CONFIG.MODAL_CONTENT_SELECTOR);
        }
        currentYearSpan = document.querySelector(CONFIG.CURRENT_YEAR_SELECTOR);

        let allGlobalsFound = true;
        if (!accordionElement) logger.warn("Accordion container not found.");
        if (!startFullChallengeBtn) logger.warn("Start Full Challenge button not found.");
        if (!quizModalElement) {
            logger.error("CRITICAL: Quiz modal overlay element not found. Quiz functionality will be severely impaired.");
            allGlobalsFound = false;
        }
        if (!quizModalContentElement && quizModalElement) {
             logger.error("CRITICAL: Quiz modal content wrapper not found. Modal may not display correctly.");
             allGlobalsFound = false;
        }
        return allGlobalsFound;
    }

    function cacheQuizModalInternalElements() {
        if (!quizModalElement) {
            logger.error("Cannot cache internal modal elements: Main modal element not found.");
            return false;
        }
        quizModalTitleEl = quizModalElement.querySelector('#quiz-modal-title');
        quizModalCloseBtnEl = quizModalElement.querySelector('#quiz-modal-close');
        quizModalProgressEl = quizModalElement.querySelector('#quiz-modal-progress');
        quizModalCurrentQEl = quizModalElement.querySelector('#quiz-modal-q-current');
        quizModalTotalQEl = quizModalElement.querySelector('#quiz-modal-q-total');
        quizModalQuestionAreaEl = quizModalElement.querySelector('#quiz-modal-question');
        quizModalOptionsAreaEl = quizModalElement.querySelector('#quiz-modal-options');
        quizModalFeedbackAreaEl = quizModalElement.querySelector('#quiz-modal-feedback');
        quizModalResultsAreaEl = quizModalElement.querySelector('#quiz-modal-results');
        quizModalNextBtnEl = quizModalElement.querySelector('#quiz-modal-next');
        quizModalRestartBtnEl = quizModalElement.querySelector('#quiz-modal-restart');
        quizModalCloseResultsBtnEl = quizModalElement.querySelector('#quiz-modal-close-results');

        const elementsToCache = {quizModalTitleEl, quizModalCloseBtnEl, quizModalProgressEl, quizModalCurrentQEl, quizModalTotalQEl,
                           quizModalQuestionAreaEl, quizModalOptionsAreaEl, quizModalFeedbackAreaEl,
                           quizModalResultsAreaEl, quizModalNextBtnEl, quizModalRestartBtnEl, quizModalCloseResultsBtnEl};
        
        for (const key in elementsToCache) {
            if (!elementsToCache[key]) {
                logger.error(`Essential quiz modal internal element missing: ${key}`);
                return false;
            }
        }
        logger.debug("All quiz modal internal elements cached successfully.");
        return true;
    }

    function setupEventListeners() {
        if (startFullChallengeBtn) {
            startFullChallengeBtn.addEventListener('click', (e) => {
                logger.info("Full Challenge button clicked.");
                prepareNewQuiz([...fullQuizData], true, null, 'Full Financial Fitness Challenge');
                startQuizFlow(e.currentTarget);
            });
        } else {
            logger.warn("Start Full Challenge button not found, listener not attached.");
        }

        if (accordionElement) {
            accordionElement.addEventListener('click', (event) => {
                const targetButton = event.target.closest(CONFIG.START_QUIZ_BTN_SELECTOR);
                if (targetButton) {
                    event.preventDefault();
                    const quizIdStr = targetButton.dataset.quizId;
                    const categoryCard = targetButton.closest(CONFIG.CATEGORY_CARD_SELECTOR);
                    const categoryName = categoryCard?.querySelector('h4')?.textContent.trim() || 'Financial Quiz';

                    if (quizIdStr) {
                        logger.info(`Category quiz button clicked: ID "${quizIdStr}", Name: "${categoryName}"`);
                        const categoryQuestions = fullQuizData.filter(q => q.quizId === quizIdStr);
                        if (categoryQuestions.length > 0) {
                            prepareNewQuiz(categoryQuestions, false, quizIdStr, categoryName);
                            startQuizFlow(targetButton);
                        } else {
                            logger.error(`No questions found for quizId: ${quizIdStr}`);
                            alert("Sorry, questions for this category are currently unavailable.");
                        }
                    } else {
                        logger.warn("Start quiz button clicked, but no quizId found in dataset.");
                    }
                }
            });
        } else {
            logger.warn("Accordion element not found, category quiz listeners not attached.");
        }

        if(quizModalCloseBtnEl) {
            quizModalCloseBtnEl.addEventListener('click', () => {
                // Main "X" close button: similar logic to Escape key for ongoing quiz
                if (!currentQuiz.isOngoing || quizModalResultsAreaEl.hidden === false) {
                    closeQuizModal();
                } else {
                     logger.debug("Main close (X) button clicked during ongoing quiz; close prevented unless results showing.");
                     // Optionally: add a confirm dialog here:
                     // if (confirm("Are you sure you want to close the ongoing quiz? Your progress will be lost.")) {
                     //     closeQuizModal();
                     // }
                }
            });
        } else logger.warn("Quiz modal close button not found, listener not attached.");

        if(quizModalNextBtnEl) quizModalNextBtnEl.addEventListener('click', proceedToNextQuestion);
        else logger.warn("Quiz modal next button not found, listener not attached.");
        
        if(quizModalRestartBtnEl) quizModalRestartBtnEl.addEventListener('click', handleRestartQuiz);
        else logger.warn("Quiz modal restart button not found, listener not attached.");
        
        if(quizModalCloseResultsBtnEl) { // This button is specifically for the results screen
            quizModalCloseResultsBtnEl.addEventListener('click', () => closeQuizModal());
        } else logger.warn("Quiz modal close results button not found, listener not attached.");

        if(quizModalElement) {
            quizModalElement.addEventListener('click', (event) => {
                if (event.target === quizModalElement) {
                    if (!currentQuiz.isOngoing || quizModalResultsAreaEl.hidden === false) {
                         logger.debug("Modal overlay clicked, closing modal.");
                         closeQuizModal();
                    } else {
                         logger.debug("Modal overlay clicked during ongoing quiz; close prevented unless results showing.");
                         // Optionally: add a confirm dialog for overlay click too.
                    }
                }
            });
        }
        logger.info("Core event listeners setup.");
    }

    function initializeQuizzesPage() {
        logger.info(`Rofilid Quizzes Page Script Initializing (v3.3.0)`);
        if (!cacheGlobalElements()) {
            logger.error("CRITICAL: Failed to cache essential global elements. Halting script execution.");
            return;
        }
        if (quizModalElement && !cacheQuizModalInternalElements()) {
            logger.error("CRITICAL: Failed to cache essential quiz modal internal elements. Quiz functionality may fail.");
        }

        if (!validateQuizDataIntegrity()) {
             logger.error("CRITICAL: Quiz data invalid. Disabling quiz functionality.");
             if(startFullChallengeBtn) startFullChallengeBtn.disabled = true;
             document.querySelectorAll(CONFIG.START_QUIZ_BTN_SELECTOR).forEach(btn => btn.disabled = true);
             return;
        }

        initializeAccordionInteractions();
        setupEventListeners();
        updateCopyrightYear();
        
        logger.info("Rofilid Quizzes Page script fully loaded and initialized.");
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeQuizzesPage);
    } else {
        initializeQuizzesPage();
    }

})();
