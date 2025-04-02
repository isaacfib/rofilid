// File Location: /assets/js/personal/quizzes.js
/* ==========================================================================
   ROFILID Full Financial Fitness Challenge Scripts - v1.2.0 (Accordion Logic)
   Description: Scripts exclusive to the main Quizzes page (quizzes.html).
                Handles quiz modal AND accordion theme toggling.
                Uses the definitive full question dataset.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    console.log("Rofilid Quizzes Page Script Initialized (v1.2.0 - Accordion).");

    // --- START: Full Quiz Data (100 Questions - User Provided Source) ---
    const fullQuizData = [
        // ... (Paste the full 100 questions data here as provided previously) ...
        // Theme 1: Your Financial Groundwork (Categories 1-5)
        // Category 1: Income & Financial Vitals
        { id: 1, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "What is the first essential step when starting to create a budget?", options: ["Calculate total monthly income", "List all fixed expenses", "Set long-term financial goals", "Track spending habits for a month"], correctAnswerIndex: 0, explanation: "Knowing your total income is fundamental; it's the basis upon which all budget allocations for expenses, savings, and goals are planned." },
        { id: 2, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "You earn ₦150,000 per month after tax and manage to save ₦22,500. What is your savings rate as a percentage of your income?", options: ["10%", "15%", "20%", "22.5%"], correctAnswerIndex: 1, explanation: "Savings Rate = (Amount Saved / Total Income) × 100. So, (₦22,500 / ₦150,000) × 100 = 15%." },
        { id: 3, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "What does 'Pay Yourself First' mean in personal finance?", options: ["Spend money on wants before needs", "Allocate a portion of your income to savings/investments before paying bills or discretionary spending", "Pay off all debts before saving anything", "Treat yourself to luxury items each payday"], correctAnswerIndex: 1, explanation: "'Pay Yourself First' prioritizes saving and investing by treating it as a mandatory expense, ensuring goals are worked towards before money is spent elsewhere." },
        { id: 4, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "How is personal Net Worth typically calculated?", options: ["Total Annual Income - Total Annual Expenses", "Total Value of Assets (what you own) - Total Value of Liabilities (what you owe)", "Total Savings + Total Investments", "Monthly Income x 12"], correctAnswerIndex: 1, explanation: "Net worth is a snapshot of your financial position, calculated by subtracting your total debts (liabilities) from the total value of your possessions (assets)." },
        { id: 5, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "If you deposit ₦50,000 into a savings account offering 4% simple annual interest, how much interest will you earn after one year?", options: ["₦400", "₦5,000", "₦2,000", "₦200"], correctAnswerIndex: 2, explanation: "Simple interest is calculated as Principal × Rate × Time. So, ₦50,000 × 0.04 × 1 year = ₦2,000." },
        // Category 2: Savings Essentials
        { id: 6, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Why is it important to save money regularly, even small amounts?", options: ["To show others financial responsibility", "To build funds for emergencies, goals, and investments", "Because banks offer guaranteed high returns", "Solely to avoid spending immediately"], correctAnswerIndex: 1, explanation: "Consistent saving builds financial security by creating an emergency cushion and accumulating funds needed for future goals and wealth-building investments." },
        { id: 7, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "What is the benefit of starting to save early in life?", options: ["To retire sooner automatically", "To take full advantage of compound interest over a longer period", "To avoid future taxes on savings", "Because interest rates are higher for younger savers"], correctAnswerIndex: 1, explanation: "Starting early allows saved money and its earnings more time to grow through the power of compound interest, leading to significantly larger sums over the long term." },
        { id: 8, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Which factor is most crucial when choosing a savings account?", options: ["The bank's branch color scheme", "The interest rate (APY) and any associated fees", "How many branches the bank has", "Whether friends use the same bank"], correctAnswerIndex: 1, explanation: "The interest rate determines how much your savings will grow, and fees can erode your balance, making these the most critical financial factors to consider." },
        { id: 9, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Where is the best place to keep your emergency fund?", options: ["Invested in the stock market for high growth", "In a high-yield savings account or money market account", "Under your mattress at home", "In a long-term fixed deposit that locks funds away"], correctAnswerIndex: 1, explanation: "An emergency fund should be kept in a safe, easily accessible place that ideally earns some interest but is protected from market risk, like a high-yield savings account." },
        { id: 10, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "What is simple interest?", options: ["Interest calculated only on the initial principal amount", "Interest calculated on the principal plus any accumulated interest", "A fee charged for opening a bank account", "Interest that decreases over time"], correctAnswerIndex: 0, explanation: "Simple interest is a fixed percentage of the original amount borrowed or saved, calculated only on the principal for the entire duration." },
        // Category 3: Budgeting Basics
        { id: 11, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is the primary purpose of a budget?", options: ["To track past spending", "To plan future spending and saving", "To restrict all 'fun' spending", "To calculate taxes"], correctAnswerIndex: 1, explanation: "A budget is a financial plan that helps you allocate your income towards expenses, savings, and investments to achieve your financial goals." },
        { id: 12, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is the difference between fixed and variable expenses?", options: ["Fixed expenses change every month, variable stay the same", "Fixed expenses generally stay the same each month, variable expenses often change", "Both change every month", "Both stay the same"], correctAnswerIndex: 1, explanation: "Fixed expenses, such as rent or loan payments, remain relatively constant, while variable expenses, like groceries or fuel, can fluctuate based on consumption or price changes." },
        { id: 13, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "In budgeting, how do you typically differentiate between a 'need' and a 'want'?", options: ["Needs are bought frequently, wants are occasional", "Needs are essential for survival and well-being, wants are for comfort and enjoyment", "Needs are more expensive than wants", "Wants are things friends have, needs are what you currently possess"], correctAnswerIndex: 1, explanation: "Needs are fundamental requirements (food, shelter, basic utilities), while wants are desires that improve quality of life but aren't essential for survival. Understanding this helps prioritize spending." },
        { id: 14, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is the 50/30/20 rule in budgeting?", options: ["50% Needs, 30% Wants, 20% Savings/Debt Repayment", "50% Savings, 30% Needs, 20% Wants", "50% Wants, 30% Needs, 20% Savings", "50% Debt, 30% Savings, 20% Expenses"], correctAnswerIndex: 0, explanation: "The 50/30/20 rule is a guideline suggesting allocating 50% of after-tax income to needs, 30% to wants, and 20% towards savings or aggressive debt repayment." },
        { id: 15, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is a sinking fund primarily used for?", options: ["As a primary emergency fund", "To save regularly for a specific, planned future expense", "As a high-risk investment fund", "As a fund exclusively for paying off debt"], correctAnswerIndex: 1, explanation: "A sinking fund involves setting aside money regularly towards a known future expense (e.g., car replacement, vacation) to avoid borrowing or derailing regular savings when the expense occurs." },
        // Category 4: Tracking & Managing Spending
        { id: 16, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "What is a practical first step in tracking your expenses accurately?", options: ["Ignoring small cash transactions", "Keeping receipts and noting all spending, no matter how small", "Only tracking card or bank transfer payments", "Guessing monthly spending totals"], correctAnswerIndex: 1, explanation: "Tracking every expense provides a complete and accurate picture of spending habits, which is crucial for effective budgeting and identifying areas to cut back." },
        { id: 17, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Why is it important to track your expenses regularly?", options: ["To know how much you can safely borrow", "To understand where your money is going and identify areas for potential savings", "To share spending habits with friends", "To make tax calculation simpler"], correctAnswerIndex: 1, explanation: "Regularly tracking expenses reveals spending patterns, helps stick to a budget, and identifies non-essential spending that could be redirected towards savings or goals." },
        { id: 18, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Which of the following is a budgeting tool or technique often useful in cash-heavy environments?", options: ["Complex financial modeling software", "The envelope system for allocating cash", "Investing heavily in volatile assets", "Relying solely on mental calculations"], correctAnswerIndex: 1, explanation: "The envelope system involves putting allocated cash amounts into labeled envelopes for different spending categories, helping control cash spending physically." },
        { id: 19, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Your monthly budget for entertainment is ₦10,000. You spent ₦8,500 this month. What percentage of your entertainment budget remains?", options: ["5%", "10%", "15%", "85%"], correctAnswerIndex: 2, explanation: "Amount Remaining = ₦10,000 - ₦8,500 = ₦1,500. Percentage Remaining = (₦1,500 / ₦10,000) × 100 = 15%." },
        { id: 20, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "An item costs ₦25,000, but it's currently offered at a 20% discount. How much will you actually pay?", options: ["₦5,000", "₦20,000", "₦24,000", "₦30,000"], correctAnswerIndex: 1, explanation: "Discount Amount = ₦25,000 × 0.20 = ₦5,000. Final Price = ₦25,000 - ₦5,000 = ₦20,000." },
        // Category 5: Understanding Banks & Accounts
        { id: 21, categoryId: 5, themeId: 1, category: "Understanding Credit & Debt", question: "What is the main difference between a savings account and a current account (checking account)?", options: ["Savings accounts are only for businesses; current accounts are for individuals", "Savings accounts usually earn interest and may limit transactions; current accounts are for frequent transactions and often earn little/no interest", "Current accounts have higher interest rates", "Savings accounts cannot be used for electronic payments"], correctAnswerIndex: 1, explanation: "Savings accounts are designed for accumulating funds and earning interest, while current accounts facilitate easy and frequent access to money for daily transactions." },
        { id: 22, categoryId: 5, themeId: 1, category: "Understanding Credit & Debt", question: "What is a Fixed Deposit account?", options: ["An account where money can be withdrawn anytime without notice", "A savings account where money is deposited for a fixed term (e.g., 30, 90, 180 days) to earn a fixed interest rate", "An account used primarily for stock market investments", "A type of loan offered by banks"], correctAnswerIndex: 1, explanation: "Fixed deposits offer a potentially higher interest rate than regular savings accounts in exchange for locking the funds away for a predetermined period." },
        { id: 23, categoryId: 5, themeId: 1, category: "Understanding Credit & Debt", question: "What is a domiciliary account in a Nigerian bank?", options: ["An account designed exclusively for housing payments", "A bank account denominated in a foreign currency (e.g., USD, GBP, EUR)", "A joint account held by multiple family members", "An account linked to the stock exchange"], correctAnswerIndex: 1, explanation: "Domiciliary accounts allow individuals and businesses to hold and transact in foreign currencies, often used for international business or as a store of value against Naira volatility." },
        { id: 24, categoryId: 5, themeId: 1, category: "Understanding Credit & Debt", question: "What function does the Nigeria Deposit Insurance Corporation (NDIC) serve?", options: ["It regulates the Nigerian stock market", "It insures deposits in licensed banks up to a certain limit, protecting depositors in case of bank failure", "It provides loans to commercial banks", "It sets the national interest rate"], correctAnswerIndex: 1, explanation: "The NDIC protects bank depositors by guaranteeing repayment of their deposits (up to a specified maximum) if their bank fails, promoting confidence in the banking system." },
        { id: 25, categoryId: 5, themeId: 1, category: "Understanding Credit & Debt", question: "What is the primary role of the Central Bank of Nigeria (CBN)?", options: ["Primarily to print the national currency", "To regulate commercial banks, manage monetary policy, and maintain financial system stability", "To provide personal loans directly to citizens", "To collect national taxes"], correctAnswerIndex: 1, explanation: "The CBN acts as the banker to the government and commercial banks, oversees the financial sector, manages foreign reserves, and aims for price stability." },
        // Theme 2: Building Your Financial Future (Categories 6-10)
        // Category 6: Navigating Nigerian Finance Tools
        { id: 26, categoryId: 6, themeId: 2, category: "Goal Setting & Planning", question: "Which of these is a common method for making mobile payments or banking transactions in Nigeria without needing internet data?", options: ["Using physical checks", "USSD codes (*short codes# dialed on a phone)", "Sending cash through postal services", "Bartering goods"], correctAnswerIndex: 1, explanation: "USSD banking allows basic banking transactions via a menu system on any mobile phone, without requiring a smartphone or data connection." },
        { id: 27, categoryId: 6, themeId: 2, category: "Goal Setting & Planning", question: "What is the purpose of the Bank Verification Number (BVN)?", options: ["To serve as a unique bank account number", "To provide a standardized biometric identification for bank customers to enhance security", "To track credit history", "To facilitate automatic international transfers"], correctAnswerIndex: 1, explanation: "BVN uses biometrics for unique identification, helping banks verify customers and combat identity theft and fraud." },
        { id: 28, categoryId: 6, themeId: 2, category: "Goal Setting & Planning", question: "What is the primary stock exchange in Nigeria called?", options: ["Lagos Regional Stock Exchange", "Nigerian Exchange Group (NGX)", "West African Securities Market", "Central Stock Exchange of Nigeria"], correctAnswerIndex: 1, explanation: "The Nigerian Exchange Group (NGX), formerly the NSE, is the main platform for trading stocks, bonds, and other securities in Nigeria." },
        { id: 29, categoryId: 6, themeId: 2, category: "Goal Setting & Planning", question: "What is 'Fintech' generally associated with in finance?", options: ["Traditional banking methods only", "Financial advice specifically for retirees", "Using technology (apps, online platforms) to provide innovative financial services", "Government tax collection systems"], correctAnswerIndex: 2, explanation: "Fintech refers to companies using technology to make financial services like payments, lending, investing, and budgeting more accessible and efficient, often via apps or websites." },
        { id: 30, categoryId: 6, themeId: 2, category: "Goal Setting & Planning", question: "What is the Contributory Pension Scheme (CPS) in Nigeria?", options: ["A voluntary savings scheme", "The mandatory pension system where employers and employees contribute towards retirement savings", "A government grant for retirees", "An insurance policy for retirement"], correctAnswerIndex: 1, explanation: "The CPS, regulated by PenCom, is the framework for retirement savings for employees in Nigeria, funded by contributions from both employers and employees." },
        // Category 7: Inflation & Your Money
        { id: 31, categoryId: 7, themeId: 2, category: "Banking & Financial Institutions", question: "What does 'inflation' generally mean for the purchasing power of money?", options: ["Your money buys significantly more over time", "Price levels stay exactly the same", "Your money buys fewer goods and services over time; its value decreases", "Interest rates automatically outpace inflation"], correctAnswerIndex: 2, explanation: "Inflation represents a general increase in prices and a fall in the purchasing value of money – the same amount of money buys less than before." },
        { id: 32, categoryId: 7, themeId: 2, category: "Banking & Financial Institutions", question: "Considering periods of high inflation, what is a potential impact on savings held in a low-interest cash account?", options: ["The real value (purchasing power) significantly increases", "The real value (purchasing power) of the savings decreases", "Banks must increase interest rates to match inflation", "Savings are automatically converted to a more stable asset"], correctAnswerIndex: 1, explanation: "If interest earned is lower than inflation, savings lose purchasing power as the cost of goods rises faster than the savings grow." },
        { id: 33, categoryId: 7, themeId: 2, category: "Banking & Financial Institutions", question: "What is currency devaluation?", options: ["An increase in the currency value", "A deliberate downward adjustment of a country's currency value relative to others", "Printing more physical currency", "Switching to a new national currency"], correctAnswerIndex: 1, explanation: "Devaluation makes exports cheaper and imports more expensive, impacting the value of savings held in that currency." },
        { id: 34, categoryId: 7, themeId: 2, category: "Banking & Financial Institutions", question: "As a strategy to potentially hedge against local currency devaluation or high inflation, some individuals might consider:", options: ["Keeping large amounts of local cash at home", "Investing solely in low-risk local government bonds", "Saving/investing partially in assets denominated in stable foreign currencies or real assets", "Ignoring inflation and currency risk entirely"], correctAnswerIndex: 2, explanation: "Holding assets in stable foreign currencies (like USD via domiciliary accounts) or real assets can help preserve purchasing power when local currency weakens or inflation is high." },
        { id: 35, categoryId: 7, themeId: 2, category: "Banking & Financial Institutions", question: "What is a common challenge for budgeting effectively in a high-inflation environment?", options: ["Prices decrease rapidly", "Fixed incomes buy progressively more", "Prices rise unpredictably, making planning difficult and eroding purchasing power", "Banks offer very high real interest rates"], correctAnswerIndex: 2, explanation: "High inflation makes estimating future costs hard, requiring frequent budget reviews and adjustments to cope with rising costs." },
        // Category 8: All About Debt
        { id: 36, categoryId: 8, themeId: 2, category: "Financial Risk Management", question: "Which of the following is generally considered 'good debt' because it finances an asset likely to appreciate or increase income potential?", options: ["High-interest credit card debt for luxuries", "A mortgage for buying a home", "A loan for an expensive vacation", "Payday loans for daily expenses"], correctAnswerIndex: 1, explanation: "Good debt typically acquires assets that may increase value (home) or enhance earning potential (student loan), unlike debt for consumables." },
        { id: 37, categoryId: 8, themeId: 2, category: "Financial Risk Management", question: "What is the 'Principal' of a loan?", options: ["Total interest paid", "The initial amount of money borrowed, before interest is added", "The monthly payment amount", "Lender processing fees"], correctAnswerIndex: 1, explanation: "The principal is the original sum borrowed or the outstanding amount on which interest is calculated." },
        { id: 38, categoryId: 8, themeId: 2, category: "Financial Risk Management", question: "What does the Annual Percentage Rate (APR) on a loan represent?", options: ["Simple interest rate per year only", "Total loan amount including fees", "The yearly cost of the loan, including interest and certain fees, as a percentage", "Loan duration in years"], correctAnswerIndex: 2, explanation: "APR provides a broader measure of borrowing cost than simple interest, including interest plus certain fees, for better comparison." },
        { id: 39, categoryId: 8, themeId: 2, category: "Financial Risk Management", question: "Which loan type is short-term, often used to cover expenses until payday, and typically carries very high interest rates?", options: ["Mortgage loan", "Student loan", "Payday loan or salary advance", "Business expansion loan"], correctAnswerIndex: 2, explanation: "Payday loans offer quick cash but usually have extremely high APRs and short terms, making them costly." },
        { id: 40, categoryId: 8, themeId: 2, category: "Financial Risk Management", question: "What does it mean if a loan is 'secured'?", options: ["Has a very low interest rate", "Borrower provides collateral (an asset) the lender can claim if the loan isn't repaid", "Repayment guaranteed by the government", "Requires a co-signer"], correctAnswerIndex: 1, explanation: "Secured loans are backed by collateral (like a car or property), reducing lender risk but potentially leading to asset loss for the borrower upon default." },
        // Category 9: Your Credit Reputation
        { id: 41, categoryId: 9, themeId: 2, category: "Understanding Financial Advice", question: "What is a credit score?", options: ["Amount of money in bank accounts", "A numerical representation of your creditworthiness based on credit history", "Total annual income", "Number of credit cards possessed"], correctAnswerIndex: 1, explanation: "Lenders use credit scores (calculated from credit history) to quickly assess lending risk and determine loan terms." },
        { id: 42, categoryId: 9, themeId: 2, category: "Understanding Financial Advice", question: "What information is typically found on a credit report?", options: ["Detailed daily spending habits", "Personal medical history", "History of borrowing and repayment (loans, credit cards)", "Investment portfolio performance"], correctAnswerIndex: 2, explanation: "Credit reports contain details on credit accounts, payment history, amounts owed, credit history length, and inquiries." },
        { id: 43, categoryId: 9, themeId: 2, category: "Understanding Financial Advice", question: "What is the role of a credit bureau (like CRC, CR Services, or XDS in Nigeria)?", options: ["Provide loans directly", "Collect and share information about individuals' credit history with lenders", "Set maximum interest rates", "Offer personalized financial advice"], correctAnswerIndex: 1, explanation: "Credit bureaus compile credit information to create credit reports and scores used by lenders to assess borrower risk." },
        { id: 44, categoryId: 9, themeId: 2, category: "Understanding Financial Advice", question: "Which action is MOST likely to negatively impact your credit score?", options: ["Paying all bills consistently on time", "Maintaining low credit utilization", "Frequently missing loan payments or defaulting on debts", "Checking your own credit report"], correctAnswerIndex: 2, explanation: "Payment history is crucial. Late payments, missed payments, and defaults severely damage creditworthiness." },
        { id: 45, categoryId: 9, themeId: 2, category: "Understanding Financial Advice", question: "Why is it beneficial to check your own credit report periodically?", options: ["To increase credit limit automatically", "To find errors/identity theft signs and understand your credit standing", "To lower interest rates instantly", "Lenders require monthly checks"], correctAnswerIndex: 1, explanation: "Regular checks help spot inaccuracies, detect fraud early, and understand what lenders see." },
        // Category 10: Tackling Your Debts
        { id: 46, categoryId: 10, themeId: 2, category: "Tax Basics", question: "When considering a loan, what is MOST important to understand besides the principal?", options: ["Lender's reputation", "Interest rate (APR), fees, and repayment terms/schedule", "Document color", "Whether friends took similar loans"], correctAnswerIndex: 1, explanation: "Understanding total borrowing cost (APR, fees) and repayment structure (payment amount, duration) is crucial for affordability." },
        { id: 47, categoryId: 10, themeId: 2, category: "Tax Basics", question: "What is a recommended first step when managing multiple debts?", options: ["Take one large new loan immediately", "Ignore smallest debts", "Create a comprehensive list of all debts (creditor, balance, interest rate, minimum payment)", "Borrow from friends/family first"], correctAnswerIndex: 2, explanation: "A clear overview of all debts is the foundation for creating an effective repayment strategy." },
        { id: 48, categoryId: 10, themeId: 2, category: "Tax Basics", question: "Which strategy involves paying off smallest debts first for motivation, regardless of interest rates?", options: ["Debt consolidation", "Debt avalanche", "Debt snowball", "Debt settlement"], correctAnswerIndex: 2, explanation: "Debt snowball focuses on eliminating debts starting with the smallest balance for quick wins and motivation." },
        { id: 49, categoryId: 10, themeId: 2, category: "Tax Basics", question: "Which strategy focuses on paying off highest interest rate debts first to save the most money on interest?", options: ["Debt consolidation", "Debt avalanche", "Debt snowball", "Debt negotiation"], correctAnswerIndex: 1, explanation: "Debt avalanche prioritizes paying extra towards the highest APR debt, minimizing total interest paid." },
        { id: 50, categoryId: 10, themeId: 2, category: "Tax Basics", question: "What is debt consolidation?", options: ["Ignoring creditors", "Combining multiple debts into a single, new loan (ideally with better terms)", "Paying only interest", "A government debt forgiveness program"], correctAnswerIndex: 1, explanation: "Debt consolidation aims to simplify repayment by replacing several loans with one, potentially lowering the rate or payment." },
        // Theme 3: Investing & Growth (Categories 11-15)
        // Category 11: Setting Smart Financial Goals
        { id: 51, categoryId: 11, themeId: 3, category: "Introduction to Investing", question: "Why is setting specific financial goals important?", options: ["Just for financial discussion", "To provide clear direction for financial decisions and motivation for saving/investing", "Solely because advisors recommend it", "To feel financially superior"], correctAnswerIndex: 1, explanation: "Defined goals (down payment, retirement) give purpose to financial planning and guide choices about spending and saving." },
        { id: 52, categoryId: 11, themeId: 3, category: "Introduction to Investing", question: "What does the 'SMART' acronym stand for in goal setting?", options: ["Specific, Measurable, Achievable, Relevant, Time-bound", "Savvy, Monetary, Accurate, Reliable, Tested", "Simple, Manageable, Actionable, Rewarding, Trackable", "Small, Medium, Ambitious, Rich, Total"], correctAnswerIndex: 0, explanation: "SMART criteria create effective goals: Specific, Measurable, Achievable, Relevant, and Time-bound." },
        { id: 53, categoryId: 11, themeId: 3, category: "Introduction to Investing", question: "Which of the following is fundamental to creating a comprehensive financial plan?", options: ["Predicting exact future investment values", "Detailed understanding of current income, expenses, assets, liabilities", "Guaranteeing wealth within a fixed period", "Following generic social media advice"], correctAnswerIndex: 1, explanation: "A solid plan must be built on a clear understanding of your current financial situation." },
        { id: 54, categoryId: 11, themeId: 3, category: "Introduction to Investing", question: "How often should you typically review and potentially adjust your financial plan?", options: ["Only during major financial crisis", "Once every decade", "At least annually, or after significant life/economic changes", "Only when advised by an expert"], correctAnswerIndex: 2, explanation: "Regular reviews ensure your plan remains relevant to your current situation, goals, and economic environment." },
        { id: 55, categoryId: 11, themeId: 3, category: "Introduction to Investing", question: "Which is an example of a long-term financial goal?", options: ["Saving for next month's trip", "Paying off credit card in three months", "Saving for retirement in 20-30 years", "Buying weekly groceries"], correctAnswerIndex: 2, explanation: "Long-term goals typically span five years or more, like retirement, child's education, or mortgage payoff." },
        // Category 12: Your Safety Net: Emergency Fund
        { id: 56, categoryId: 12, themeId: 3, category: "Investment Types (Basic)", question: "What is the primary purpose of having an emergency fund?", options: ["To invest in high-risk opportunities", "To have readily available funds for unexpected essential expenses (job loss, medical)", "To fund planned vacations", "To lend to friends/family"], correctAnswerIndex: 1, explanation: "An emergency fund acts as a financial safety net for critical expenses during unforeseen circumstances, avoiding debt." },
        { id: 57, categoryId: 12, themeId: 3, category: "Investment Types (Basic)", question: "How much should you ideally aim to have in your emergency fund?", options: ["One month of income", "Enough to cover 3-6 months of essential living expenses", "One year of total income", "Enough for a house down payment"], correctAnswerIndex: 1, explanation: "Experts recommend 3-6 months of essential expenses (rent, food, utilities) for a cushion during job loss etc." },
        { id: 58, categoryId: 12, themeId: 3, category: "Investment Types (Basic)", question: "Scenario: You face an unexpected large car repair bill. Which resource should ideally be used first?", options: ["Long-term retirement savings", "Emergency fund", "High-interest credit card", "Payday lender"], correctAnswerIndex: 1, explanation: "The emergency fund is for such unexpected necessary expenses, preventing high-interest debt or raiding long-term investments." },
        { id: 59, categoryId: 12, themeId: 3, category: "Investment Types (Basic)", question: "What is a key characteristic of funds set aside for emergencies?", options: ["High growth potential", "Illiquidity (hard to access)", "Safety and Liquidity (easy access)", "Matched by employer contributions"], correctAnswerIndex: 2, explanation: "Emergency funds prioritize safety of principal and liquidity (quick access without penalty) over high returns." },
        { id: 60, categoryId: 12, themeId: 3, category: "Investment Types (Basic)", question: "Why is having health insurance often considered part of building financial security?", options: ["Guarantees you'll never get sick", "Helps cover potentially crippling costs of medical care and prevents medical debt", "Provides discounts on gym memberships", "Replaces income if unable to work (that's disability insurance)"], correctAnswerIndex: 1, explanation: "Health insurance mitigates the significant financial risk associated with unexpected medical expenses, protecting savings and preventing debt." },
        // Category 13: Planning Your Retirement Journey
        { id: 61, categoryId: 13, themeId: 3, category: "Risk vs. Return", question: "Why is starting retirement planning early advantageous?", options: ["Official retirement ages are very young", "To maximize the benefits of compound interest over many decades", "Government pensions cover all needs", "To impress employers"], correctAnswerIndex: 1, explanation: "Starting early allows contributions and earnings more time to compound, potentially leading to significantly larger retirement savings." },
        { id: 62, categoryId: 13, themeId: 3, category: "Risk vs. Return", question: "When planning for retirement, why must inflation be considered?", options: ["Inflation makes investments grow faster", "Inflation decreases retiree living costs", "Inflation erodes purchasing power; you'll need more money in the future for the same lifestyle", "Banks auto-adjust pensions for inflation"], correctAnswerIndex: 2, explanation: "Inflation reduces what money can buy over time, so planning must account for the rising cost of goods/services." },
        { id: 63, categoryId: 13, themeId: 3, category: "Risk vs. Return", question: "Besides pensions, what other sources might contribute to retirement income?", options: ["Relying solely on children", "Personal savings, investments (stocks, bonds, real estate), part-time work", "Government unemployment benefits", "Lottery winnings"], correctAnswerIndex: 1, explanation: "Secure retirement often relies on multiple streams: pensions, personal savings, investment returns, and sometimes continued work." },
        { id: 64, categoryId: 13, themeId: 3, category: "Risk vs. Return", question: "What is the main difference between saving and investing?", options: ["Saving is short-term/safety; investing is long-term growth (with risk)", "Investing is safer", "Saving yields higher returns", "No difference"], correctAnswerIndex: 0, explanation: "Saving involves low-risk accounts for safety/access (emergencies, short goals). Investing involves more risk for potentially higher long-term returns (stocks, bonds)." },
        { id: 65, categoryId: 13, themeId: 3, category: "Risk vs. Return", question: "Which is generally considered a lower-risk investment often suitable for capital preservation, perhaps closer to retirement?", options: ["Technology startup shares", "Small unlisted company shares", "Government bonds or Treasury Bills", "Volatile cryptocurrencies"], correctAnswerIndex: 2, explanation: "Government bonds are backed by the government, making them relatively safe compared to individual companies or speculative assets." },
        // Category 14: Understanding Insurance
        { id: 66, categoryId: 14, themeId: 3, category: "Time Value of Money", question: "What is the main purpose of buying insurance?", options: ["To make profit from claims", "To transfer the risk of potential financial loss to an insurance company", "To get discounts on unrelated products", "As mandatory savings"], correctAnswerIndex: 1, explanation: "Insurance manages risk; you pay a premium, the insurer compensates for specified potential losses." },
        { id: 67, categoryId: 14, themeId: 3, category: "Time Value of Money", question: "What is an insurance 'premium'?", options: ["Payout amount after a claim", "Max policy coverage", "Regular amount paid by policyholder to keep policy active", "Bonus for no claims"], correctAnswerIndex: 2, explanation: "The premium is the fee paid to the insurer for coverage against specific risks." },
        { id: 68, categoryId: 14, themeId: 3, category: "Time Value of Money", question: "In an insurance policy, what is a 'deductible' (or 'excess')?", options: ["Premium discount", "Total policy cover", "Extra claim fee", "Amount policyholder pays out-of-pocket before insurer pays"], correctAnswerIndex: 3, explanation: "Deductible is the initial portion of a claim the insured pays. Higher deductibles often mean lower premiums." },
        { id: 69, categoryId: 14, themeId: 3, category: "Time Value of Money", question: "What type of insurance typically covers your legal responsibility if you cause injury to someone or damage their property?", options: ["Health insurance", "Life insurance", "Liability insurance (e.g., part of car or home insurance)", "Travel insurance"], correctAnswerIndex: 2, explanation: "Liability insurance protects you financially if you are found legally responsible for harm or damage to others. Third-party motor insurance is a common example." },
        { id: 70, categoryId: 14, themeId: 3, category: "Time Value of Money", question: "Why are minimizing investment fees (like expense ratios) sometimes compared to managing insurance costs (premiums/deductibles)?", options: ["Both guarantee high returns", "Both have little long-term impact", "Both represent costs that reduce your net return/benefit; keeping them low enhances your outcome", "Low costs always indicate lower quality"], correctAnswerIndex: 2, explanation: "Just as insurance costs affect your protection value, investment fees directly reduce your portfolio growth. Managing both types of costs is key to financial efficiency." },
        // Category 15: Why Invest? Basics & Growth
        { id: 71, categoryId: 15, themeId: 3, category: "Behavioral Finance Intro", question: "What is investing?", options: ["Spending on luxury experiences", "Allocating money to assets (stocks, bonds) expecting income or profit over time", "Donating generously", "Keeping large cash sums at home"], correctAnswerIndex: 1, explanation: "Investing uses capital to acquire assets potentially growing in value or producing income, aiming to build wealth." },
        { id: 72, categoryId: 15, themeId: 3, category: "Behavioral Finance Intro", question: "What does 'liquidity' mean regarding investments?", options: ["Potential for high returns quickly", "How easily an asset converts to cash without significant loss of value", "Total cash in circulation", "Interest on borrowed funds for investing"], correctAnswerIndex: 1, explanation: "Liquidity describes ease/speed of converting an asset to cash at a stable price; cash is most liquid." },
        { id: 73, categoryId: 15, themeId: 3, category: "Behavioral Finance Intro", question: "What is compound interest?", options: ["Interest on principal only", "Interest on principal AND accumulated interest from previous periods", "Tax on investment earnings", "Bank fee for loans"], correctAnswerIndex: 1, explanation: "Compound interest (\"interest on interest\") lets investments grow faster as earnings generate further earnings." },
        { id: 74, categoryId: 15, themeId: 3, category: "Behavioral Finance Intro", question: "Using the 'Rule of 72', approximately how long to double an investment earning 6% annually?", options: ["6 years", "7.2 years", "12 years", "72 years"], correctAnswerIndex: 2, explanation: "Rule of 72 estimate: 72 / annual interest rate (%) = years to double. 72 / 6 = 12 years." },
        { id: 75, categoryId: 15, themeId: 3, category: "Behavioral Finance Intro", question: "If you buy a stock for ₦100 and sell it later for ₦120, what is the ₦20 profit called?", options: ["Dividend", "Interest", "Capital Gain", "Principal Return"], correctAnswerIndex: 2, explanation: "A capital gain is the profit made from selling an asset (like stock) for more than its purchase price." },
        // Theme 4: Protection & Long-Term Security (Categories 16-20)
        // Category 16: Investment Strategies: Risk & Diversification
        { id: 76, categoryId: 16, themeId: 4, category: "Insurance Basics", question: "What does 'diversification' mean in investing?", options: ["Investing all money in the single best asset", "Spreading investments across various asset classes/industries/regions to reduce risk", "Investing only in home country", "Buying high, selling low"], correctAnswerIndex: 1, explanation: "Diversification (\"don't put all eggs in one basket\") reduces portfolio volatility by offsetting poor performance in one area with better performance elsewhere." },
        { id: 77, categoryId: 16, themeId: 4, category: "Insurance Basics", question: "Why is diversification important for most investors?", options: ["Guarantees high returns", "Helps reduce overall risk of significant portfolio losses", "Simplifies tracking performance", "Eliminates need for research"], correctAnswerIndex: 1, explanation: "Spreading investments mitigates impact of any single poor performer, reducing overall portfolio risk." },
        { id: 78, categoryId: 16, themeId: 4, category: "Insurance Basics", question: "What is investment risk?", options: ["Guarantee of value increase", "Possibility actual return differs from expected, including potential loss of capital", "Broker fee", "Holding period"], correctAnswerIndex: 1, explanation: "Investment risk is uncertainty about future returns and potential for financial loss." },
        { id: 79, categoryId: 16, themeId: 4, category: "Insurance Basics", question: "How does time horizon typically influence risk tolerance?", options: ["Longer horizon = lower tolerance", "Shorter horizon = higher tolerance", "Longer horizon often allows higher tolerance (more time to recover from downturns)", "No impact"], correctAnswerIndex: 2, explanation: "Investors with longer timeframes can often tolerate more volatile investments due to time for recovery." },
        { id: 80, categoryId: 16, themeId: 4, category: "Insurance Basics", question: "What is market volatility?", options: ["Measure of consistent growth", "Degree of variation/fluctuation in investment price over time", "Guaranteed annual return", "Tax rate on gains"], correctAnswerIndex: 1, explanation: "Volatility indicates price fluctuation speed/magnitude. High volatility means large swings, implying higher risk." },
        // Category 17: Exploring Investment Types
        { id: 81, categoryId: 17, themeId: 4, category: "Identity Theft & Fraud", question: "What is the basic difference between stocks and bonds?", options: ["Stocks=loans, Bonds=ownership", "Stocks=ownership (equity) in a company; Bonds=debt (loan) to company/government", "Stocks safer than bonds", "Bonds pay dividends"], correctAnswerIndex: 1, explanation: "Buying stock = part-ownership. Buying bond = lending money for interest and principal repayment." },
        { id: 82, categoryId: 17, themeId: 4, category: "Identity Theft & Fraud", question: "What is a mutual fund?", options: ["Credit union savings account", "Professionally managed fund pooling investor money to buy diversified portfolio (stocks, bonds etc.)", "Government loan", "Digital currency scheme"], correctAnswerIndex: 1, explanation: "Mutual funds give access to diversified portfolios and professional management." },
        { id: 83, categoryId: 17, themeId: 4, category: "Identity Theft & Fraud", question: "What is an ETF (Exchange-Traded Fund)?", options: ["High-interest savings account", "Fund tracking an index (e.g., NGX All-Share), traded like a stock on exchanges", "Electronic government bond", "Physical commodity"], correctAnswerIndex: 1, explanation: "ETFs offer diversification like mutual funds but trade throughout the day like stocks." },
        { id: 84, categoryId: 17, themeId: 4, category: "Identity Theft & Fraud", question: "If a company shares profits with shareholders, what is this payment called?", options: ["Interest payment", "Dividend", "Principal repayment", "Capital gain"], correctAnswerIndex: 1, explanation: "Dividends are portions of profits distributed to stockholders, usually regularly." },
        { id: 85, categoryId: 17, themeId: 4, category: "Identity Theft & Fraud", question: "Investing in real estate typically involves buying what?", options: ["Shares in multiple random companies", "Government Treasury Bills", "Physical property (land, buildings) or shares in property companies (REITs)", "Certificates of Deposit"], correctAnswerIndex: 2, explanation: "Real estate investing includes direct property ownership or REITs (companies owning/financing property)." },
        // Category 18: Measuring Progress & Review
        { id: 86, categoryId: 18, themeId: 4, category: "Retirement Planning Intro", question: "How often should you ideally check in on your overall financial plan and progress towards goals?", options: ["Only when you retire", "Every five years", "At least once a year, and potentially more often if your situation changes", "Never, set it and forget it"], correctAnswerIndex: 2, explanation: "Regular reviews (at least annually) help you stay on track, adjust for life changes (new job, family changes), and ensure your plan remains relevant." },
        { id: 87, categoryId: 18, themeId: 4, category: "Retirement Planning Intro", question: "Which factor is MOST likely to help you achieve long-term financial goals faster?", options: ["High inflation rates", "Frequent borrowing for daily expenses", "Consistent saving/investing and benefiting from compound growth", "Keeping all money in a zero-interest current account"], correctAnswerIndex: 2, explanation: "Long-term goal achievement relies heavily on disciplined saving and allowing investments time to grow through compounding." },
        { id: 88, categoryId: 18, themeId: 4, category: "Retirement Planning Intro", question: "Why is minimizing investment fees and costs considered important?", options: ["High fees mean better quality investments", "Fees are too small to matter over time", "Fees directly reduce your net returns; lower fees mean more money stays invested and working for you", "Fees are only paid if you make a profit"], correctAnswerIndex: 2, explanation: "Even small percentage fees compound over time and can significantly reduce your final investment value. Keeping costs low is crucial for maximizing returns." },
        { id: 89, categoryId: 18, themeId: 4, category: "Retirement Planning Intro", question: "Reaching a financial goal (like saving for a car) ahead of schedule gives you options. What's a sensible option?", options: ["Immediately stop saving entirely", "Set a new, slightly more ambitious goal or allocate the extra funds towards another goal (like retirement)", "Spend the entire amount saved plus extra on a more expensive car", "Lend the money to friends"], correctAnswerIndex: 1, explanation: "Reaching goals early is great! It allows you to either aim higher, accelerate other goals, or reward yourself modestly while staying financially responsible." },
        { id: 90, categoryId: 18, themeId: 4, category: "Retirement Planning Intro", question: "What does 'Net Worth' represent?", options: ["Your yearly salary", "The total value of your cash savings only", "A snapshot of your overall financial health (Assets minus Liabilities)", "Your credit score value"], correctAnswerIndex: 2, explanation: "Net worth gives a measure of your financial position at a point in time, showing what you own versus what you owe. Tracking it can show progress." },
        // Category 19: Practical Financial Decisions
        { id: 91, categoryId: 19, themeId: 4, category: "Major Purchase Planning", question: "You aim to save ₦1,000,000 for a goal in 5 years. How does high inflation affect this?", options: ["Makes ₦1M worth more later", "No effect on cash savings", "₦1M will likely buy less in 5 years; you might need to save more to achieve the real value of your goal", "Goal auto-adjusts for inflation"], correctAnswerIndex: 2, explanation: "Inflation erodes purchasing power. To maintain the goal's real value, you may need to save more than the initial target or reach it sooner." },
        { id: 92, categoryId: 19, themeId: 4, category: "Major Purchase Planning", question: "You get ₦100,000 salary. Applying 'Pay Yourself First' (15% savings goal), what's the immediate action?", options: ["Spend ₦15k on fun first", "Pay bills, save what's left", "Immediately transfer ₦15,000 to savings/investment", "Wait till month-end to save"], correctAnswerIndex: 2, explanation: "Treat savings as a priority 'bill'. Allocate and move the savings (₦15,000) before discretionary spending." },
        { id: 93, categoryId: 19, themeId: 4, category: "Major Purchase Planning", question: "Goal: Save ₦500k in 1 year (~₦41.7k/month). After 6 months, only ₦150k saved. Practical strategy?", options: ["Abandon goal", "Hope to save more later magically", "Increase monthly savings drastically (to ~₦58.3k/month), OR adjust goal timeline/amount", "Take loan for shortfall"], correctAnswerIndex: 2, explanation: "Falling behind needs action: increase saving efforts significantly, extend the timeline, or adjust the target amount to be achievable." },
        { id: 94, categoryId: 19, themeId: 4, category: "Major Purchase Planning", question: "When budgeting, how does differentiating between 'needs' (like rent, basic food) and 'wants' (like latest gadgets, fancy dinners) help?", options: ["It allows unlimited spending on wants", "It helps prioritize essential spending and identify areas where costs can be cut if necessary", "It ensures you only buy needs", "It's mainly for impressing others"], correctAnswerIndex: 1, explanation: "Understanding needs vs. wants allows you to make conscious spending choices, ensuring essentials are covered and identifying non-essential areas for potential savings." },
        { id: 95, categoryId: 19, themeId: 4, category: "Major Purchase Planning", question: "A 5kg bag of cooking gas costs ₦4,500. What's the cost per kg, helping you compare prices?", options: ["₦450/kg", "₦500/kg", "₦900/kg", "₦1,000/kg"], correctAnswerIndex: 2, explanation: "Cost per unit helps compare value: Total Cost / Total Units = ₦4,500 / 5 kg = ₦900 per kg." },
        // Category 20: Be Scam Aware!
        { id: 96, categoryId: 20, themeId: 4, category: "Estate Planning Basics", question: "Common red flag of potential phishing email/SMS?", options: ["Message asks you click link for urgent account verification/security update", "Well-known company logo", "Message addressed to your name", "Offer of high guaranteed return"], correctAnswerIndex: 0, explanation: "Legitimate institutions rarely ask for sensitive info (passwords, PINs, BVN) via unsolicited urgent links. Be wary of requests for data or security actions via links. (d) is also a red flag for scams in general." },
        { id: 97, categoryId: 20, themeId: 4, category: "Estate Planning Basics", question: "Key characteristic of Ponzi/pyramid schemes?", options: ["Investments in established companies", "Promises of unusually high, guaranteed returns, little risk, often reliant on recruiting new investors", "Detailed audited prospectuses", "Returns based on actual business profits"], correctAnswerIndex: 1, explanation: "These schemes pay early investors with money from new recruits, not legitimate profits. They rely on continuous recruitment and collapse eventually." },
        { id: 98, categoryId: 20, themeId: 4, category: "Estate Planning Basics", question: "Why NEVER share your BVN, card PINs, or banking passwords?", options: ["Helps banks track spending", "Required for government benefits", "Fraudsters can use them to access your accounts and steal money", "Helps customer service resolve issues"], correctAnswerIndex: 2, explanation: "These are keys to your accounts. Sharing compromises security and allows criminals potential access to funds." },
        { id: 99, categoryId: 20, themeId: 4, category: "Estate Planning Basics", question: "As a consumer, what right do you have regarding loan agreements/contracts?", options: ["Right to ignore terms after signing", "Right to clear, understandable info on terms, conditions, rates, fees before agreeing", "Right to change interest rate unilaterally", "Right to automatic approval"], correctAnswerIndex: 1, explanation: "Consumer protection emphasizes transparency. You have the right to understand critical info before committing." },
        { id: 100, categoryId: 20, themeId: 4, category: "Estate Planning Basics", question: "Besides urgent requests for info/money, what's another common online scam tactic?", options: ["Offering discounts through official company websites", "Creating fake websites/social media profiles mimicking legitimate businesses to steal data or money", "Providing detailed contact information for customer service", "Sending order confirmation emails after a purchase"], correctAnswerIndex: 1, explanation: "Scammers often create lookalike websites or profiles to trick people into entering personal information or making payments, thinking they are dealing with the real entity. Always verify website URLs and contact details independently." }
    ];
    // --- END: Full Quiz Data ---

    // --- Basic Data Validation ---
    if (fullQuizData.length !== 100) {
        console.error(`CRITICAL ERROR: Expected 100 questions, but found ${fullQuizData.length}. Quiz functionality may be compromised.`);
        // alert("Error loading quiz data. Please check the console."); // Optional user alert
    }

    // --- Accordion Logic ---
    const themeToggles = document.querySelectorAll('.theme-toggle-button');
    themeToggles.forEach(button => {
        button.addEventListener('click', () => {
            const targetContentId = button.getAttribute('aria-controls');
            const targetContent = document.getElementById(targetContentId);
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // --- Collapse ALL themes first ---
            themeToggles.forEach(otherButton => {
                const otherContentId = otherButton.getAttribute('aria-controls');
                const otherContent = document.getElementById(otherContentId);
                // Check if the other content exists before trying to style it
                if (otherButton !== button && otherContent) {
                    otherButton.setAttribute('aria-expanded', 'false');
                    otherContent.style.maxHeight = null; // Collapse using max-height
                }
            });

            // --- Toggle the clicked theme ---
            if (targetContent) { // Check if target content exists
                if (isExpanded) {
                    // Collapse clicked
                    button.setAttribute('aria-expanded', 'false');
                    targetContent.style.maxHeight = null;
                } else {
                    // Expand clicked
                    button.setAttribute('aria-expanded', 'true');
                    // Set max-height for animation (ensure content is visible before measuring scrollHeight)
                    targetContent.style.display = 'block'; // Temporarily show to measure
                    targetContent.style.maxHeight = targetContent.scrollHeight + "px";
                     // Remove temporary display style if not needed after transition starts
                    // Or rely solely on max-height transition
                    // Let's remove it after a tiny delay to ensure transition starts
                    // setTimeout(() => { targetContent.style.display = ''; }, 0); // Might cause flicker, let's skip
                }
            } else {
                 console.error(`Content area with ID ${targetContentId} not found.`);
            }
        });
    });
    // --- End Accordion Logic ---

    // --- Quiz Modal Logic ---

    // Quiz State & DOM References
    let currentQuizData = { questions: [], currentQuestionIndex: 0, score: 0, userAnswers: {} };
    let quizTriggerElement = null;

    const quizModal = document.getElementById('quiz-modal');
    const modalTitle = document.getElementById('quiz-modal-title');
    const modalCloseBtn = document.getElementById('quiz-modal-close');
    const modalQuestionEl = document.getElementById('quiz-modal-question');
    const modalOptionsEl = document.getElementById('quiz-modal-options');
    const modalFeedbackEl = document.getElementById('quiz-modal-feedback');
    const modalNextBtn = document.getElementById('quiz-modal-next');
    const modalResultsEl = document.getElementById('quiz-modal-results');
    const modalProgressCurrent = document.getElementById('quiz-modal-q-current');
    const modalProgressTotal = document.getElementById('quiz-modal-q-total');
    const modalRestartBtn = document.getElementById('quiz-modal-restart');
    const modalCloseResultsBtn = document.getElementById('quiz-modal-close-results');
    const modalNextQuizBtn = document.getElementById('quiz-modal-next-quiz'); // Exists in HTML but unused here
    const modalFullChallengePrompt = document.getElementById('quiz-modal-full-challenge-prompt'); // Exists in HTML but unused here


    // --- Core Modal Functions (Unchanged from previous version) ---
     function startQuiz(categoryId) {
        console.log(`Starting quiz for category ID: ${categoryId} from Full Challenge`);
        const categoryQuestions = fullQuizData.filter(q => q.categoryId === categoryId);

        if (categoryQuestions.length === 0) {
            console.error("No questions found in fullQuizData for category ID:", categoryId);
            alert("Sorry, questions for this category could not be loaded.");
            return;
        }
        if (categoryQuestions.length !== 5) {
             console.warn(`Expected 5 questions for category ${categoryId}, but found ${categoryQuestions.length}.`);
        }

        currentQuizData = { questions: categoryQuestions, currentQuestionIndex: 0, score: 0, userAnswers: {} };
        if (modalTitle) modalTitle.textContent = categoryQuestions[0]?.category || 'Financial Fitness Quiz';
        if (modalResultsEl) modalResultsEl.style.display = 'none';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalQuestionEl) modalQuestionEl.style.display = 'block';
        if (modalOptionsEl) modalOptionsEl.style.display = 'flex';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'block';
        if (modalProgressTotal) modalProgressTotal.textContent = currentQuizData.questions.length;

        // Hide ALL navigation/prompt buttons initially
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none';
        if (modalRestartBtn) modalRestartBtn.style.display = 'none';
        if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
        if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';

        displayModalQuestion();
        if (quizModal) quizModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function displayModalQuestion() {
        const quiz = currentQuizData;
        if (!modalQuestionEl || !modalOptionsEl || !modalProgressCurrent) return;
        if (quiz.currentQuestionIndex >= quiz.questions.length) { showModalResults(); return; }
        const q = quiz.questions[quiz.currentQuestionIndex];
        modalQuestionEl.textContent = q.question;
        modalOptionsEl.innerHTML = '';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        modalProgressCurrent.textContent = quiz.currentQuestionIndex + 1;
        q.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option; button.className = 'option-button';
            button.setAttribute('data-index', index); button.setAttribute('role', 'button');
            button.setAttribute('aria-pressed', 'false'); button.onclick = () => handleModalOptionSelection(index);
            modalOptionsEl.appendChild(button);
        });
        const firstOption = modalOptionsEl.querySelector('button'); if (firstOption) firstOption.focus();
    }

    function handleModalOptionSelection(selectedIndex) {
        const quiz = currentQuizData; const q = quiz.questions[quiz.currentQuestionIndex];
        const buttons = modalOptionsEl?.querySelectorAll('button'); if (!buttons) return;
        buttons.forEach(button => {
            button.disabled = true; button.onclick = null;
            if (parseInt(button.getAttribute('data-index'), 10) === selectedIndex) { button.setAttribute('aria-pressed', 'true'); }
        });
        quiz.userAnswers[q.id] = selectedIndex;
        showModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
    }

    function showModalFeedback(selectedIndex, correctIndex, explanation) {
        const quiz = currentQuizData; const isCorrect = selectedIndex === correctIndex; if (isCorrect) quiz.score++;
        const buttons = modalOptionsEl?.querySelectorAll('button'); if (!buttons || !modalFeedbackEl) return;
        buttons.forEach((button, index) => {
            button.classList.remove('selected');
            if (index === correctIndex) { button.classList.add('correct'); }
            else if (index === selectedIndex) { button.classList.add('incorrect'); }
            else { button.classList.add('disabled'); }
        });
        modalFeedbackEl.innerHTML = `<p><strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${explanation || ''}</p>`;
        modalFeedbackEl.className = `quiz-modal-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        modalFeedbackEl.style.display = 'block'; modalFeedbackEl.setAttribute('role', 'alert'); modalFeedbackEl.setAttribute('aria-live', 'assertive');
        if (modalNextBtn) {
            if (quiz.currentQuestionIndex < quiz.questions.length - 1) {
                modalNextBtn.style.display = 'inline-block'; modalNextBtn.focus();
            } else {
                modalNextBtn.style.display = 'none'; setTimeout(showModalResults, 1200);
            }
        }
    }

    function nextModalQuestion() {
        if (modalFeedbackEl) { modalFeedbackEl.style.display = 'none'; modalFeedbackEl.removeAttribute('role'); modalFeedbackEl.removeAttribute('aria-live'); }
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        currentQuizData.currentQuestionIndex++; displayModalQuestion();
    }

    function showModalResults() {
        const quiz = currentQuizData;
        if (modalQuestionEl) modalQuestionEl.style.display = 'none'; if (modalOptionsEl) modalOptionsEl.style.display = 'none';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none'; if (modalNextBtn) modalNextBtn.style.display = 'none';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress'); if (progressEl) progressEl.style.display = 'none';
        if (modalResultsEl) {
            const score = quiz.score; const total = quiz.questions.length; const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
            let feedbackMessage = 'Keep learning!'; if (percentage === 100) feedbackMessage = 'Excellent work!'; else if (percentage >= 60) feedbackMessage = 'Good job!';
            modalResultsEl.innerHTML = `<h4>Quiz Complete!</h4><p>Your Score: ${score} out of ${total} (${percentage}%)</p><p style="margin-top: 10px; font-size: 1em;">${feedbackMessage}</p>`;
            modalResultsEl.style.display = 'block'; modalResultsEl.setAttribute('role', 'alert'); modalResultsEl.setAttribute('aria-live', 'assertive');
        }
        // Show ONLY Restart and Close
        if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none'; if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';
        if (modalRestartBtn) modalRestartBtn.style.display = 'inline-block'; if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'inline-block';
        if (modalRestartBtn) modalRestartBtn.focus();
    }

    function restartModalQuiz() {
        const categoryId = currentQuizData.questions[0]?.categoryId;
        if (categoryId) {
            if (modalResultsEl) { modalResultsEl.style.display = 'none'; modalResultsEl.removeAttribute('role'); modalResultsEl.removeAttribute('aria-live'); }
            if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none'; if (modalRestartBtn) modalRestartBtn.style.display = 'none';
            if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none'; if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';
            startQuiz(categoryId);
        } else {
            closeQuizModal(quizTriggerElement);
        }
    }

    function closeQuizModal(triggerElement = null) {
        if (quizModal) quizModal.style.display = 'none'; document.body.style.overflow = '';
        if (modalTitle) modalTitle.textContent = 'Quiz Title'; if (modalQuestionEl) modalQuestionEl.textContent = ''; if (modalOptionsEl) modalOptionsEl.innerHTML = '';
        if (modalFeedbackEl) { modalFeedbackEl.style.display = 'none'; modalFeedbackEl.removeAttribute('role'); modalFeedbackEl.removeAttribute('aria-live'); }
        if (modalResultsEl) { modalResultsEl.style.display = 'none'; modalResultsEl.removeAttribute('role'); modalResultsEl.removeAttribute('aria-live'); }
        if (modalNextBtn) modalNextBtn.style.display = 'none'; if (modalNextQuizBtn) modalNextQuizBtn.style.display = 'none';
        if (modalRestartBtn) modalRestartBtn.style.display = 'none'; if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
        if (modalFullChallengePrompt) modalFullChallengePrompt.style.display = 'none';
        if (modalQuestionEl) modalQuestionEl.style.display = 'block'; if (modalOptionsEl) modalOptionsEl.style.display = 'flex';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress'); if (progressEl) progressEl.style.display = 'block';
        if (triggerElement) { triggerElement.focus(); quizTriggerElement = null; }
    }

    // --- Attach Event Listeners ---
    // Event listener for Quiz start buttons (inside accordion content)
    document.querySelectorAll('#full-financial-challenge .start-quiz-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.category-card');
            const categoryId = card ? parseInt(card.dataset.categoryId, 10) : null;
            if (categoryId) {
                const categoryExists = fullQuizData.some(q => q.categoryId === categoryId);
                if (categoryExists) {
                    quizTriggerElement = e.target;
                    startQuiz(categoryId);
                } else {
                     console.error(`No questions found for categoryId ${categoryId} in the dataset.`);
                     alert(`Sorry, the quiz for category ${categoryId} is not available yet.`);
                }
            } else {
                console.error("Missing or invalid category ID on card.");
                alert("Could not load the selected quiz.");
            }
        });
    });

    // Modal Button Listeners (Unchanged)
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeQuizModal(quizTriggerElement));
    if (modalCloseResultsBtn) modalCloseResultsBtn.addEventListener('click', () => closeQuizModal(quizTriggerElement));
    if (modalNextBtn) modalNextBtn.addEventListener('click', nextModalQuestion);
    if (modalRestartBtn) modalRestartBtn.addEventListener('click', restartModalQuiz);
    if (quizModal) {
        quizModal.addEventListener('click', (e) => { if (e.target === quizModal) { closeQuizModal(quizTriggerElement); } });
        quizModal.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeQuizModal(quizTriggerElement); } });
    }
    // --- END Quiz Logic ---

}); // End DOMContentLoaded
