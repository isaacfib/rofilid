/**
 * File Location: /assets/js/personal/quizzes.js
 * Description: Scripts exclusive to the main Quizzes page (quizzes.html).
 *              Handles accordion theme toggling and launching quizzes
 *              (both category-specific and the full 100-question challenge)
 *              in the shared modal structure.
 * Version: 2.5.0 (Patched for ID/Config issues)
 * Dependencies: quizzes.html structure, personal.css base styles, quizzes.css accordion styles.
 */


(function() {
    'use strict';

    // --- Configuration & Constants ---
    const CONFIG = {
        ACCORDION_SELECTOR: '#quizAccordion', // ID for the main accordion container
        ACCORDION_ITEM_SELECTOR: '.accordion-item',
        ACCORDION_BUTTON_SELECTOR: '.accordion-button',
        ACCORDION_COLLAPSE_SELECTOR: '.accordion-collapse',
        ACCORDION_BTN_COLLAPSED_CLASS: 'collapsed', // Class indicating the button's collapsed state
        // Note: Removed ACCORDION_ACTIVE_CLASS if panel visibility relies only on height/button state

        CATEGORY_CARD_SELECTOR: '.category-card',
        START_QUIZ_BTN_SELECTOR: '.start-quiz-btn', // Selector for buttons starting category quizzes

        QUIZ_MODAL_SELECTOR: '#quiz-modal', // ID for the quiz modal overlay
        MODAL_VISIBLE_CLASS: 'visible', // CSS class to transition modal visibility
        MODAL_FOCUS_DELAY: 100, // ms delay before setting focus in modal

        START_FULL_CHALLENGE_BTN_ID: 'start-full-challenge-btn', // ID for the 100q challenge button

        CURRENT_YEAR_SELECTOR: '#current-year', // Selector for footer year span

        EXPECTED_TOTAL_QUESTIONS: 100,
        QUESTIONS_PER_CATEGORY: 5, // Expected number of questions per category quiz
        ACCORDION_COLLAPSE_DURATION: 350, // Match CSS transition duration (used implicitly by CSS)
    };

    // --- Global Variables & Element Caching ---
    let accordion, startFullChallengeBtn, quizModal, currentYearSpan;
    let activeModal = null; // Shared modal state tracking
    let triggerElement = null; // Element that opened the modal
    let activeFocusTrapHandler = null; // Store the active focus trap handler

    // Quiz Modal specific elements (cached on demand)
    let quizModalTitle, quizModalCloseBtn, quizModalQuestionEl, quizModalOptionsEl,
        quizModalFeedbackEl, quizModalNextBtn, quizModalResultsEl, quizModalProgressCurrent,
        quizModalProgressTotal, quizModalRestartBtn, quizModalCloseResultsBtn;

    // Quiz state
    let currentQuizData = {
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        userAnswers: {}, // Store user's selection index for potential review
        isFullChallenge: false,
        quizId: null // Store category quiz ID (string)
    };

    // --- START: Full Quiz Data (100 Questions - Updated with quizId strings) ---
    // Assume fullQuizData is defined here (same 100 questions but with quizId)
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
    // --- END: Full Quiz Data ---


    // --- Basic Data Validation ---
    function validateQuizData() {
        // Check total question count
        if (!Array.isArray(fullQuizData) || fullQuizData.length !== CONFIG.EXPECTED_TOTAL_QUESTIONS) {
            console.error(`CRITICAL ERROR: Expected ${CONFIG.EXPECTED_TOTAL_QUESTIONS} questions in fullQuizData array, but found ${fullQuizData?.length || 'none'}.`);
            // Optionally disable buttons or show UI error message here
            return false;
        }
        // Check structure of the first question as a sample
        const firstQ = fullQuizData[0];
        if (!firstQ || typeof firstQ.quizId !== 'string' || !Array.isArray(firstQ.options) || typeof firstQ.correctAnswerIndex !== 'number') {
             console.error("CRITICAL ERROR: First question in fullQuizData has unexpected structure.", firstQ);
             return false;
        }

        console.info(`Quiz data loaded: ${fullQuizData.length} questions validated.`);
        return true;
    }


    // --- Helper Functions (Modal Control, Focus Trap, Utilities) ---

    /** Trap focus within a specified element */
     function trapFocus(element) {
         if (!element) return null; // Return null if no element
        const focusableEls = element.querySelectorAll(
            'a[href]:not([disabled], [hidden]), button:not([disabled], [hidden]), textarea:not([disabled], [hidden]), input:not([type="hidden"], [disabled], [hidden]), select:not([disabled], [hidden]), [tabindex]:not([tabindex="-1"], [disabled], [hidden])'
         );
         if (focusableEls.length === 0) return null; // Return null if no focusable elements

         const firstFocusableEl = focusableEls[0];
         const lastFocusableEl = focusableEls[focusableEls.length - 1];

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab' || !element.contains(document.activeElement)) return; // Only trap if focus is inside

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableEl) {
                    e.preventDefault();
                    lastFocusableEl.focus();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableEl) {
                    e.preventDefault();
                    firstFocusableEl.focus();
                }
            }
        };

        // Add listener to the element itself or document? Document might be safer for edge cases.
        document.addEventListener('keydown', handleKeyDown);

        // Set initial focus after a short delay
         setTimeout(() => {
            if (!element.contains(document.activeElement)) { // Only focus if modal is still active and focus isn't already inside somehow
                const closeButton = element.querySelector('.modal-close-btn:not([disabled])');
                const primaryButton = element.querySelector('.btn-primary:not([hidden], :disabled), .btn-secondary:not([hidden], :disabled)');
                const firstOption = element.querySelector('.option-button:not([disabled])'); // Prioritize quiz options
                const firstInput = element.querySelector('input:not([type="hidden"], [disabled], [hidden]), select:not([disabled], [hidden]), textarea:not([disabled], [hidden])');

                let elementToFocus = null;

                // Prioritize visible elements within the modal
                if (firstOption && firstOption.offsetParent !== null) {
                    elementToFocus = firstOption;
                } else if (primaryButton && primaryButton.offsetParent !== null) {
                    elementToFocus = primaryButton;
                } else if (closeButton && closeButton.offsetParent !== null) {
                    elementToFocus = closeButton;
                } else if (firstInput && firstInput.offsetParent !== null) {
                    elementToFocus = firstInput;
                } else {
                    elementToFocus = firstFocusableEl; // Fallback
                }

                if (elementToFocus) {
                    try {
                        elementToFocus.focus();
                    } catch (err) {
                        console.warn("Initial modal focus failed:", err);
                    }
                }
            }
         }, CONFIG.MODAL_FOCUS_DELAY);

         return handleKeyDown; // Return the handler function so it can be removed later
    }


    /** Open a modal dialog */
     function openModal(modalElement, openingTriggerElement) {
         if (!modalElement) {
            console.error("Attempted to open a non-existent modal.");
            return;
         }
         if (activeModal === modalElement) return; // Already open

         // Close any previously active modal cleanly first
         if (activeModal) {
             closeModal(false); // Don't return focus yet
         }

         activeModal = modalElement;
         triggerElement = openingTriggerElement;

        document.body.style.overflow = 'hidden';
         modalElement.hidden = false;

         requestAnimationFrame(() => {
             modalElement.classList.add(CONFIG.MODAL_VISIBLE_CLASS);
              // Set up focus trap *after* modal is visible
              if (activeFocusTrapHandler) { // Remove any lingering handler
                document.removeEventListener('keydown', activeFocusTrapHandler);
              }
              activeFocusTrapHandler = trapFocus(modalElement);
         });

        document.addEventListener('keydown', handleModalKeydown); // Use document for Escape key
     }

    /** Close the currently active modal */
     function closeModal(returnFocus = true) {
         if (!activeModal) return;

        const modalToClose = activeModal;
         const triggerToFocus = triggerElement;

         // Remove focus trap and escape listeners immediately
         if (activeFocusTrapHandler) {
             document.removeEventListener('keydown', activeFocusTrapHandler);
             activeFocusTrapHandler = null;
         }
         document.removeEventListener('keydown', handleModalKeydown);

         // Reset state variables before transition starts
         activeModal = null;
         triggerElement = null;

         modalToClose.classList.remove(CONFIG.MODAL_VISIBLE_CLASS);

         const handleTransitionEnd = () => {
            modalToClose.hidden = true;
            if (!activeModal) { // Only restore scroll if no *other* modal immediately opened
                document.body.style.overflow = '';
            }
            // Reset specific modal content if needed
            if (modalToClose === quizModal) {
                 resetQuizModalUI();
            }
            modalToClose.removeEventListener('transitionend', handleTransitionEnd); // Clean up listener
         };

         modalToClose.addEventListener('transitionend', handleTransitionEnd);

        if (returnFocus && triggerToFocus && typeof triggerToFocus.focus === 'function') {
             // Delay focus return slightly to ensure it happens after potential scroll restoration
             setTimeout(() => {
                 try {
                     triggerToFocus.focus(); //{ preventScroll: true }); // preventScroll might not always work as expected
                 } catch (e) {
                     console.warn("Return focus failed:", e);
                 }
             }, 50); // Small delay
         }
    }

    /** Handle Escape key press for modals */
     function handleModalKeydown(event) {
         if (event.key === 'Escape' && activeModal) {
             closeModal();
        }
    }

    /** Reset Quiz Modal UI to initial state */
     function resetQuizModalUI() {
        if (!quizModal) return;
        cacheQuizModalElements(); // Ensure elements are cached

        // Reset dynamic content areas
        if(quizModalTitle) quizModalTitle.textContent = 'Financial Fitness Quiz'; // Default title
        if(quizModalQuestionEl) quizModalQuestionEl.innerHTML = '';
        if(quizModalOptionsEl) quizModalOptionsEl.innerHTML = '';
        if(quizModalFeedbackEl) { quizModalFeedbackEl.innerHTML = ''; quizModalFeedbackEl.hidden = true; }
        if(quizModalResultsEl) { quizModalResultsEl.innerHTML = ''; quizModalResultsEl.hidden = true; }

        // Reset progress display
        if(quizModalProgressCurrent) quizModalProgressCurrent.textContent = '0';
        if(quizModalProgressTotal) quizModalProgressTotal.textContent = '0';
        quizModalProgressCurrent?.closest('.quiz-modal-progress')?.setAttribute('hidden', ''); // Hide progress initially

        // Hide all navigation buttons
        if(quizModalNextBtn) quizModalNextBtn.hidden = true;
        if(quizModalRestartBtn) quizModalRestartBtn.hidden = true;
        if(quizModalCloseResultsBtn) quizModalCloseResultsBtn.hidden = true;

        // Ensure question/options areas are visible for next quiz start
        if (quizModalQuestionEl) quizModalQuestionEl.hidden = false;
        if (quizModalOptionsEl) quizModalOptionsEl.hidden = false;

         console.info("Quiz modal UI state reset.");
    }


    // --- Accordion Logic ---
    function initializeAccordion(accordionElement) {
        if (!accordionElement) {
            console.warn("Accordion element not found using selector:", CONFIG.ACCORDION_SELECTOR);
            return;
        }

        const accordionItems = accordionElement.querySelectorAll(CONFIG.ACCORDION_ITEM_SELECTOR);

        accordionItems.forEach(item => {
            const button = item.querySelector(CONFIG.ACCORDION_BUTTON_SELECTOR);
            const collapsePanel = item.querySelector(CONFIG.ACCORDION_COLLAPSE_SELECTOR);

            if (button && collapsePanel) {
                 // Set initial state based on the presence of the 'collapsed' class
                 const isInitiallyCollapsed = button.classList.contains(CONFIG.ACCORDION_BTN_COLLAPSED_CLASS);
                 button.setAttribute('aria-expanded', !isInitiallyCollapsed);
                 collapsePanel.style.overflow = 'hidden'; // Prevent content spill during animation

                 if (isInitiallyCollapsed) {
                     collapsePanel.style.height = '0px';
                 } else {
                     // If starting open, set height explicitly (or use 'auto' if transition handles it)
                     collapsePanel.style.height = 'auto'; // Assume CSS handles initial open state, fallback if needed
                     // collapsePanel.style.height = collapsePanel.scrollHeight + 'px'; // Use this if CSS doesn't set initial height
                 }

                 button.addEventListener('click', () => toggleAccordionItem(button, collapsePanel, accordionElement));

                 // Optional: Listen for transition end to set height to 'auto' for open panels
                 collapsePanel.addEventListener('transitionend', () => {
                     if (button.getAttribute('aria-expanded') === 'true') {
                         collapsePanel.style.height = 'auto';
                     }
                 });

             } else {
                console.warn("Accordion item missing button or collapse panel:", item);
             }
        });
        console.info("Accordion initialized.");
    }

    function toggleAccordionItem(button, collapsePanel, parentAccordion) {
         const isCurrentlyExpanded = button.getAttribute('aria-expanded') === 'true';

         // --- Close Other Items (Standard Accordion Behavior) ---
         // Comment out this block if multiple items should be open simultaneously
         parentAccordion.querySelectorAll(CONFIG.ACCORDION_ITEM_SELECTOR).forEach(otherItem => {
            const otherButton = otherItem.querySelector(CONFIG.ACCORDION_BUTTON_SELECTOR);
            const otherCollapse = otherItem.querySelector(CONFIG.ACCORDION_COLLAPSE_SELECTOR);
             // Close any *other* item that is currently expanded
             if (otherButton !== button && otherButton?.getAttribute('aria-expanded') === 'true') {
                 closeAccordionItem(otherButton, otherCollapse);
            }
         });
        // --- End Close Others ---

        // Toggle the clicked item
         if (isCurrentlyExpanded) {
             closeAccordionItem(button, collapsePanel);
         } else {
            openAccordionItem(button, collapsePanel);
         }
    }

     function openAccordionItem(button, collapsePanel) {
         if (!button || !collapsePanel) return;
         // Prepare for opening: set height to 0 if it was auto, then get scrollHeight
         collapsePanel.style.height = '0px';
         collapsePanel.style.display = 'block'; // Ensure it's block for scrollHeight calculation

         requestAnimationFrame(() => {
             const scrollHeight = collapsePanel.scrollHeight;
             button.classList.remove(CONFIG.ACCORDION_BTN_COLLAPSED_CLASS);
             button.setAttribute('aria-expanded', 'true');
             collapsePanel.style.height = scrollHeight + 'px';
             // Transition end listener will set height to 'auto'
         });
     }

     function closeAccordionItem(button, collapsePanel) {
         if (!button || !collapsePanel) return;
         // Start closing: set height from 'auto' or current height to actual pixel value
        const currentHeight = collapsePanel.scrollHeight;
        collapsePanel.style.height = currentHeight + 'px';

         requestAnimationFrame(() => {
             button.classList.add(CONFIG.ACCORDION_BTN_COLLAPSED_CLASS);
             button.setAttribute('aria-expanded', 'false');
             collapsePanel.style.height = '0px';
         });
     }


    // --- Quiz Modal Logic ---

    /** Cache quiz modal elements if not already cached */
    function cacheQuizModalElements() {
        if (quizModalTitle) return true; // Already cached

        quizModal = document.querySelector(CONFIG.QUIZ_MODAL_SELECTOR);
        if (!quizModal) {
            console.error("Quiz modal element not found. Cannot cache elements.");
            return false;
        }

        quizModalTitle = quizModal.querySelector('#quiz-modal-title');
        quizModalCloseBtn = quizModal.querySelector('#quiz-modal-close');
        quizModalQuestionEl = quizModal.querySelector('#quiz-modal-question');
        quizModalOptionsEl = quizModal.querySelector('#quiz-modal-options');
        quizModalFeedbackEl = quizModal.querySelector('#quiz-modal-feedback');
        quizModalNextBtn = quizModal.querySelector('#quiz-modal-next');
        quizModalResultsEl = quizModal.querySelector('#quiz-modal-results');
        quizModalProgressCurrent = quizModal.querySelector('#quiz-modal-q-current');
        quizModalProgressTotal = quizModal.querySelector('#quiz-modal-q-total');
        quizModalRestartBtn = quizModal.querySelector('#quiz-modal-restart');
        quizModalCloseResultsBtn = quizModal.querySelector('#quiz-modal-close-results');

        // Check if all essential elements were found
        if (!quizModalTitle || !quizModalCloseBtn || !quizModalQuestionEl || !quizModalOptionsEl ||
            !quizModalFeedbackEl || !quizModalNextBtn || !quizModalResultsEl || !quizModalProgressCurrent ||
            !quizModalProgressTotal || !quizModalRestartBtn || !quizModalCloseResultsBtn) {
            console.error("One or more essential quiz modal elements could not be found within:", CONFIG.QUIZ_MODAL_SELECTOR);
            return false; // Caching failed
        }
        return true; // Caching successful
    }


    /** Starts a quiz for a specific category ID (string) */
    function startCategoryQuiz(quizId, openingTrigger) {
        console.info(`Starting Category Quiz: ID "${quizId}"`);
        const categoryQuestions = fullQuizData.filter(q => q.quizId === quizId);

        if (!categoryQuestions || categoryQuestions.length === 0) {
            console.error(`No questions found for quiz ID: "${quizId}"`);
            alert("Sorry, questions for this category could not be loaded.");
            return;
        }
        // Warn if question count deviates, but proceed.
        if (categoryQuestions.length !== CONFIG.QUESTIONS_PER_CATEGORY) {
            console.warn(`Expected ${CONFIG.QUESTIONS_PER_CATEGORY} questions for quiz "${quizId}", found ${categoryQuestions.length}.`);
        }

        currentQuizData = {
            questions: categoryQuestions,
            currentQuestionIndex: 0,
            score: 0,
            userAnswers: {},
            isFullChallenge: false,
            quizId: quizId // Store category quiz ID (string)
        };

        if (setupQuizModalUI()) { // Setup UI for this quiz
            displayModalQuestion(); // Display first question
            openModal(quizModal, openingTrigger); // Open the modal
        } else {
            alert("Error setting up the quiz interface.");
        }
    }

    /** Starts the full 100-question challenge */
    function startFullChallenge(openingTrigger) {
        console.info("Starting Full 100-Question Challenge");
        // Validation should have happened on init, but double check length
        if (fullQuizData.length !== CONFIG.EXPECTED_TOTAL_QUESTIONS) {
            alert(`Error: Full quiz data is incomplete (${fullQuizData.length}/${CONFIG.EXPECTED_TOTAL_QUESTIONS}). Cannot start the challenge.`);
            return;
        }

        currentQuizData = {
            questions: [...fullQuizData], // Use a fresh copy
            currentQuestionIndex: 0,
            score: 0,
            userAnswers: {},
            isFullChallenge: true,
            quizId: null // Not applicable
        };

        if (setupQuizModalUI()) { // Setup UI
            displayModalQuestion(); // Display first question
            openModal(quizModal, openingTrigger); // Open modal
        } else {
             alert("Error setting up the quiz interface.");
        }
    }

     /** Sets up the quiz modal UI elements for a new quiz, returns true on success */
    function setupQuizModalUI() {
        if (!quizModal && !cacheQuizModalElements()) { // Try caching if modal not yet cached
             console.error("Cannot setup quiz UI: Modal or its elements not found.");
             return false;
         }

        // Ensure elements are valid after caching attempt
        if (!quizModalTitle || !quizModalProgressTotal || !quizModalResultsEl || !quizModalFeedbackEl ||
            !quizModalQuestionEl || !quizModalOptionsEl || !quizModalNextBtn || !quizModalRestartBtn ||
            !quizModalCloseResultsBtn || !quizModalProgressCurrent) {
            console.error("One or more required quiz modal elements are missing after cache attempt. Aborting UI setup.");
            closeModal(); // Close if critical elements are gone
            return false;
        }

        const totalQuestions = currentQuizData.questions.length;
        // Determine title safely
        const firstQuestionCategory = currentQuizData.questions?.[0]?.category;
        const title = currentQuizData.isFullChallenge ? "Full Financial Fitness Challenge" : (firstQuestionCategory || 'Financial Fitness Quiz');

        // Reset UI states
        quizModalTitle.textContent = title;
        quizModalProgressTotal.textContent = totalQuestions;
        quizModalProgressCurrent.textContent = '1'; // Start at question 1 display
        quizModalResultsEl.hidden = true; quizModalResultsEl.innerHTML = '';
        quizModalFeedbackEl.hidden = true; quizModalFeedbackEl.innerHTML = '';
        quizModalQuestionEl.hidden = false; quizModalQuestionEl.innerHTML = ''; // Clear first
        quizModalOptionsEl.hidden = false; quizModalOptionsEl.innerHTML = ''; // Clear first
        quizModalProgressCurrent.closest('.quiz-modal-progress')?.removeAttribute('hidden'); // Show progress


        // Hide all navigation buttons initially
        quizModalNextBtn.hidden = true;
        quizModalRestartBtn.hidden = true;
        quizModalCloseResultsBtn.hidden = true;

        // Update restart button text based on context
        const restartText = currentQuizData.isFullChallenge ? "Restart Full Challenge" : "Restart Quiz";
        quizModalRestartBtn.innerHTML = `<i class="fas fa-redo" aria-hidden="true"></i> ${restartText}`;

        return true; // Setup successful
    }

     /** Displays the current question and options in the modal */
    function displayModalQuestion() {
        if (!quizModal || !quizModalQuestionEl || !quizModalOptionsEl || !quizModalProgressCurrent || !currentQuizData) return;

        const quiz = currentQuizData;
        // Check if quiz finished
        if (quiz.currentQuestionIndex >= quiz.questions.length) {
            showModalResults();
            return;
        }

        const q = quiz.questions[quiz.currentQuestionIndex];
        if (!q) {
            console.error(`Error: Question data missing for index ${quiz.currentQuestionIndex}`);
            showModalResults(); // Show results even if data is bad
            return;
        }

        quizModalQuestionEl.innerHTML = `<span class="question-number">${quiz.currentQuestionIndex + 1}.</span> ${q.question || 'Error: Question text missing'}`;
        quizModalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;
        quizModalOptionsEl.innerHTML = ''; // Clear previous options

        if (!q.options || q.options.length === 0) {
            console.error(`Error: Options missing for question id ${q.id}`);
             quizModalOptionsEl.innerHTML = '<p class="error-message">Error loading options.</p>';
             // Hide nav buttons? Maybe allow closing.
            quizModalNextBtn.hidden = true;
            quizModalRestartBtn.hidden = true; // Hide restart if question broken
            quizModalCloseResultsBtn.hidden = false; // Allow closing
            return;
        }


        q.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = option;
            button.className = 'option-button btn'; // Base class + specific class
            button.dataset.index = index;
            // Use event listener instead of onclick for better management if needed later
            button.addEventListener('click', () => handleModalOptionSelection(index));
            quizModalOptionsEl.appendChild(button);
        });

        // Hide feedback and next button until selection made
        quizModalFeedbackEl.hidden = true;
        quizModalNextBtn.hidden = true;

        // Focus the first option button for accessibility
        const firstOptionButton = quizModalOptionsEl.querySelector('.option-button');
        if (firstOptionButton) {
            setTimeout(() => firstOptionButton.focus(), 50); // Slight delay may help focus
        }
    }

    /** Handles the user clicking a quiz option button */
    function handleModalOptionSelection(selectedIndex) {
        const quiz = currentQuizData;
        if (!quiz || quiz.currentQuestionIndex >= quiz.questions.length) return; // Prevent action if quiz ended

        const q = quiz.questions[quiz.currentQuestionIndex];
        if (!q || !quizModalOptionsEl) return;

        // Prevent selecting again if already answered (check if feedback is visible?)
        if (!quizModalFeedbackEl.hidden) return;

        const buttons = quizModalOptionsEl.querySelectorAll('button');
        buttons.forEach(button => button.disabled = true); // Disable all options

        quiz.userAnswers[q.id] = selectedIndex; // Record answer using question ID
        const isCorrect = selectedIndex === q.correctAnswerIndex;
        if (isCorrect) quiz.score++; // Update score

        showModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation); // Show feedback
    }

     /** Displays feedback after an option is selected */
    function showModalFeedback(selectedIndex, correctIndex, explanation) {
        if (!quizModal || !quizModalOptionsEl || !quizModalFeedbackEl || !quizModalNextBtn) return;

        const buttons = quizModalOptionsEl.querySelectorAll('button');
        const isCorrect = selectedIndex === correctIndex;

        buttons.forEach((button, index) => {
             button.classList.remove('correct', 'incorrect'); // Clear previous states first
             if (index === correctIndex) {
                 button.classList.add('correct');
             } else if (index === selectedIndex) { // Only mark the selected incorrect one
                 button.classList.add('incorrect');
             }
            // Ensure they remain disabled
             button.disabled = true;
         });

         // Sanitize explanation slightly (basic protection)
         const safeExplanation = explanation ? explanation.replace(/</g, "<").replace(/>/g, ">") : 'Check your understanding.';
         quizModalFeedbackEl.innerHTML = `<p><strong>${isCorrect ? 'Correct!' : 'Insight:'}</strong> ${safeExplanation}</p>`;
         quizModalFeedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`; // Base class + state class
         quizModalFeedbackEl.hidden = false;

        // Show 'Next' button if not the last question, otherwise prepare for results
        if (currentQuizData.currentQuestionIndex < currentQuizData.questions.length - 1) {
            quizModalNextBtn.hidden = false;
             quizModalNextBtn.focus(); // Focus next button
        } else {
             quizModalNextBtn.hidden = true;
            // Optionally trigger showing results automatically after a delay
             setTimeout(showModalResults, 1500); // Delay before showing final results
         }
    }

    /** Moves to the next question */
    function nextModalQuestion() {
        if (!currentQuizData || currentQuizData.currentQuestionIndex >= currentQuizData.questions.length -1) return; // Safety check

        currentQuizData.currentQuestionIndex++;
        displayModalQuestion(); // This handles displaying the next question or results
    }

    /** Displays the final results in the modal */
    function showModalResults() {
        if (!quizModal || !cacheQuizModalElements() || !currentQuizData) return; // Ensure modal and elements exist

        // Hide quiz active areas
        quizModalQuestionEl.hidden = true;
        quizModalOptionsEl.hidden = true;
        quizModalFeedbackEl.hidden = true;
        quizModalNextBtn.hidden = true;
        quizModalProgressCurrent?.closest('.quiz-modal-progress')?.setAttribute('hidden', ''); // Hide progress count


        const { score, questions, isFullChallenge } = currentQuizData;
        const total = questions?.length || 0; // Handle potential empty questions array
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
        let resultTitle = isFullChallenge ? 'Full Challenge Complete!' : 'Quiz Complete!';
        let feedbackMessage;

        // Generate feedback based on mode and score
         if (isFullChallenge) {
             if (percentage >= 90) feedbackMessage = 'Outstanding performance! Top financial fitness!';
             else if (percentage >= 75) feedbackMessage = 'Excellent work! Strong understanding overall.';
             else if (percentage >= 50) feedbackMessage = 'Good effort! Solid grasp of many concepts.';
             else feedbackMessage = 'You completed the challenge! Review the insights to boost your knowledge.';
         } else { // Category quiz
            const categoryName = questions?.[0]?.category || 'Quiz'; // Safely get category name
            resultTitle = `${categoryName} Results`;
            if (percentage === 100) feedbackMessage = 'Perfect score! Excellent!';
            else if (percentage >= 80) feedbackMessage = 'Great job! Strong understanding.';
            else if (percentage >= 60) feedbackMessage = 'Good grasp of the basics.';
             else feedbackMessage = 'Keep learning and exploring this topic!';
        }
         quizModalTitle.textContent = resultTitle; // Update modal title


         // Display results HTML (using textContent for safety where possible)
        quizModalResultsEl.innerHTML = `
            <h4>${resultTitle}</h4>
            <p>Your Score: <span class="score-value">${score}</span> out of <span class="score-total">${total}</span></p>
            <p class="quiz-score-percentage">(${percentage}%)</p>
            <p class="quiz-result-message"></p> <!-- Inject message safely -->
        `;
        // Safely set the feedback message
        const messageElement = quizModalResultsEl.querySelector('.quiz-result-message');
        if(messageElement) messageElement.textContent = feedbackMessage;

        quizModalResultsEl.hidden = false;

        // Show relevant navigation buttons (Restart and Close)
        quizModalRestartBtn.hidden = false;
        quizModalCloseResultsBtn.hidden = false;

        quizModalRestartBtn.focus(); // Focus restart as primary action after results
    }

    /** Handles restarting the current quiz (category or full) */
    function handleRestartClick() {
        if (!currentQuizData) return;
        const trigger = triggerElement; // Preserve original trigger if available

        // Reset UI elements immediately (setup will handle full reset)
        quizModalResultsEl.hidden = true;
        quizModalRestartBtn.hidden = true;
        quizModalCloseResultsBtn.hidden = true;

        if (currentQuizData.isFullChallenge) {
            startFullChallenge(trigger);
        } else {
            const quizId = currentQuizData.quizId; // Use the string quizId
            if (quizId) {
                 startCategoryQuiz(quizId, trigger);
             } else {
                 console.error("Cannot restart category quiz: Quiz ID unknown.");
                 alert("An error occurred while trying to restart the quiz.");
                 closeModal(); // Close if restart fails critically
             }
        }
    }

    // --- Initialization ---
    function initializePage() {
         console.info("Rofilid Quizzes Page Script Initializing (v2.5.0)");

         // --- Cache Global Page Elements ---
         accordion = document.querySelector(CONFIG.ACCORDION_SELECTOR);
         startFullChallengeBtn = document.getElementById(CONFIG.START_FULL_CHALLENGE_BTN_ID);
         quizModal = document.querySelector(CONFIG.QUIZ_MODAL_SELECTOR); // Cache modal early
         currentYearSpan = document.querySelector(CONFIG.CURRENT_YEAR_SELECTOR);

         // --- Critical Checks ---
         if (!quizModal) {
             console.error("CRITICAL: Quiz modal element not found using selector:", CONFIG.QUIZ_MODAL_SELECTOR, ". Quiz functionality disabled.");
             // Disable all start buttons if modal is missing
             document.querySelectorAll(CONFIG.START_QUIZ_BTN_SELECTOR + ', #' + CONFIG.START_FULL_CHALLENGE_BTN_ID)
                  .forEach(btn => { btn.disabled = true; btn.title = "Quiz unavailable."; btn.style.cursor = 'not-allowed'; });
             return; // Stop initialization
         }
         if (!validateQuizData()) {
             console.error("CRITICAL: Quiz data failed validation. Quiz functionality disabled.");
              document.querySelectorAll(CONFIG.START_QUIZ_BTN_SELECTOR + ', #' + CONFIG.START_FULL_CHALLENGE_BTN_ID)
                  .forEach(btn => { btn.disabled = true; btn.title = "Quiz data error."; btn.style.cursor = 'not-allowed'; });
             return; // Stop initialization
         }

         // --- Setup Features ---
         initializeAccordion(accordion); // Initialize accordion interactions
         setupEventListeners(); // Setup button clicks etc.
         updateCopyrightYear(); // Update dynamic year

         console.info("Rofilid Quizzes Page Scripts Fully Loaded and Ready.");
    }


    // --- Setup Event Listeners specific to Quizzes page ---
    function setupEventListeners() {
        // Full Challenge Button
         if (startFullChallengeBtn) {
             startFullChallengeBtn.addEventListener('click', (e) => startFullChallenge(e.currentTarget));
         } else {
             console.warn("Start Full Challenge button not found with ID:", CONFIG.START_FULL_CHALLENGE_BTN_ID);
        }

        // Category Quiz Buttons (Event Delegation on Accordion)
         if (accordion) {
             accordion.addEventListener('click', (event) => {
                 const startButton = event.target.closest(CONFIG.START_QUIZ_BTN_SELECTOR);
                 if (!startButton) return; // Click wasn't on or within a start button

                 // Use data-quiz-id (string) from the button itself
                 const quizId = startButton.dataset.quizId;

                if (quizId) {
                     startCategoryQuiz(quizId, startButton); // Pass the button as trigger
                } else {
                     console.error("Missing 'data-quiz-id' attribute on start button:", startButton);
                    alert("Could not determine which quiz to start.");
                }
             });
        } else {
            console.warn("Accordion container not found. Category quiz buttons may not work.");
        }

        // Modal Navigation & Overlay Listeners (ensure elements are cached first)
         if (quizModal && cacheQuizModalElements()) { // Cache elements before adding listeners
            quizModalCloseBtn.addEventListener('click', () => closeModal());
            quizModalNextBtn.addEventListener('click', nextModalQuestion);
            quizModalRestartBtn.addEventListener('click', handleRestartClick);
            quizModalCloseResultsBtn.addEventListener('click', () => closeModal());

             // Overlay click listener
             quizModal.addEventListener('click', (event) => {
                // Close only if the click is directly on the overlay (modal background)
                 if (event.target === quizModal) {
                     closeModal();
                }
            });
         } else if(quizModal) {
             console.error("Could not attach modal button listeners because element caching failed.");
         }
         // Note: Escape key listener is handled globally by openModal/closeModal
    }


    /** Update copyright year */
    function updateCopyrightYear() {
         if (currentYearSpan) {
             currentYearSpan.textContent = new Date().getFullYear();
        } else {
            console.warn("Current year span not found with selector:", CONFIG.CURRENT_YEAR_SELECTOR);
        }
    }


    // --- Run Initialization ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePage);
    } else {
        initializePage(); // Already loaded
    }

})(); // End IIFE
