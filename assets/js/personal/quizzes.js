// File Location: /assets/js/personal/quizzes.js
/* ==========================================================================
   ROFILID Full Quizzes Page Specific Scripts - v1.0.0
   Description: Scripts exclusive to the Full Financial Fitness Challenge page.
                Includes the COMPLETE quiz logic (all questions) and listeners.
                NOTE: Basic menu/year/scroll functionality handled by global main.js
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

    // --- START FULL Quiz Logic (All Questions) ---
    // Contains ALL 100 Questions
     const allQuestions = [
         // Theme 1: Your Financial Groundwork (Categories 1-4) -> ID: 1-20
         // Cat 1: Income & Financial Vitals
         { id: 1, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "What is the first essential step when starting to create a budget?", options: ["Calculate total monthly income", "List all fixed expenses", "Set long-term financial goals", "Track spending habits for a month"], correctAnswerIndex: 0, explanation: "Knowing your total income is fundamental for planning." },
         { id: 2, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "You earn ₦150,000/month (after tax) and save ₦22,500. What's your savings rate?", options: ["10%", "15%", "20%", "22.5%"], correctAnswerIndex: 1, explanation: "(22,500 / 150,000) * 100 = 15%." },
         { id: 3, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "What does 'Pay Yourself First' mean?", options: ["Spend on wants first", "Allocate savings *before* other spending", "Pay debt before saving", "Buy luxury items first"], correctAnswerIndex: 1, explanation: "It prioritizes saving/investing by treating it as a mandatory expense." },
         { id: 4, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "How is Net Worth calculated?", options: ["Income - Expenses", "Assets - Liabilities", "Savings + Investments", "Monthly Income x 12"], correctAnswerIndex: 1, explanation: "Net worth = What you Own (Assets) minus What you Owe (Liabilities)." },
         { id: 5, categoryId: 1, themeId: 1, category: "Income & Financial Vitals", question: "₦50,000 deposit at 4% simple annual interest earns how much interest in one year?", options: ["₦400", "₦5,000", "₦2,000", "₦200"], correctAnswerIndex: 2, explanation: "Interest = ₦50,000 * 0.04 * 1 = ₦2,000." },
         // Cat 2: Savings Essentials
         { id: 6, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Why save money regularly, even small amounts?", options: ["To show off", "For emergencies, goals, investments", "Banks guarantee high returns", "Just to avoid spending"], correctAnswerIndex: 1, explanation: "Consistent saving builds financial security for emergencies and future goals." },
         { id: 7, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Benefit of starting to save early?", options: ["Retire sooner automatically", "Take advantage of compound interest", "Avoid future taxes", "Higher rates for young savers"], correctAnswerIndex: 1, explanation: "Early saving allows more time for compound interest to significantly grow your money." },
         { id: 8, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Most crucial factor when choosing a savings account?", options: ["Bank's color scheme", "Interest rate (APY) and fees", "Number of branches", "Friends use the bank"], correctAnswerIndex: 1, explanation: "The interest rate dictates growth, while fees can erode savings." },
         { id: 9, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "Best place for an emergency fund?", options: ["Stock market", "High-yield savings account", "Under the mattress", "Long-term fixed deposit"], correctAnswerIndex: 1, explanation: "Needs to be safe, easily accessible, and ideally earn some interest, like a HYSA." },
         { id: 10, categoryId: 2, themeId: 1, category: "Savings Essentials", question: "What is simple interest?", options: ["Interest on principal only", "Interest on principal + accumulated interest", "Bank account fee", "Decreasing interest"], correctAnswerIndex: 0, explanation: "Simple interest is calculated only on the original principal amount." },
         // Cat 3: Budgeting Basics
         { id: 11, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is the primary purpose of a budget?", options: ["Track past spending", "Plan future spending and saving", "Restrict all 'fun' spending", "Calculate taxes"], correctAnswerIndex: 1, explanation: "A budget is a financial plan to allocate income towards expenses, savings, and goals." },
         { id: 12, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "Difference between fixed and variable expenses?", options: ["Fixed change monthly, variable stay same", "Fixed generally stay same, variable change", "Both change monthly", "Both stay same"], correctAnswerIndex: 1, explanation: "Fixed (rent) are constant; Variable (groceries) fluctuate." },
         { id: 13, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "How to differentiate 'need' vs. 'want'?", options: ["Frequency of purchase", "Need=Essential for survival/well-being; Want=Comfort/enjoyment", "Needs cost more", "Friends have wants"], correctAnswerIndex: 1, explanation: "Needs are fundamental requirements; wants enhance life but aren't essential." },
         { id: 14, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is the 50/30/20 budgeting rule?", options: ["50% Needs, 30% Wants, 20% Savings", "50% Savings, 30% Needs, 20% Wants", "50% Wants, 30% Needs, 20% Savings", "50% Debt, 30% Savings, 20% Expenses"], correctAnswerIndex: 0, explanation: "A guideline allocating 50% income to Needs, 30% to Wants, 20% to Savings/Debt." },
         { id: 15, categoryId: 3, themeId: 1, category: "Budgeting Basics", question: "What is a sinking fund primarily used for?", options: ["Emergency fund", "Saving for a specific, planned future expense", "High-risk investment", "Debt payoff only"], correctAnswerIndex: 1, explanation: "Saving regularly for a known future expense (e.g., car, vacation) to avoid debt." },
         // Cat 4: Tracking & Managing Spending
         { id: 16, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Practical first step to track expenses accurately?", options: ["Ignore small cash", "Keep receipts, note all spending", "Only track card payments", "Guess totals"], correctAnswerIndex: 1, explanation: "Tracking every expense provides a complete picture of spending habits." },
         { id: 17, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Why track expenses regularly?", options: ["To know borrowing capacity", "Understand spending, find savings areas", "Share habits with friends", "Simplify tax calculation"], correctAnswerIndex: 1, explanation: "Reveals patterns, helps stick to budget, identifies potential cuts." },
         { id: 18, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Useful budgeting tool/technique in cash-heavy places?", options: ["Complex software", "Envelope system for cash", "Heavy crypto investment", "Mental calculations only"], correctAnswerIndex: 1, explanation: "The envelope system helps physically control cash spending by category." },
         { id: 19, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Budget ₦10,000 for entertainment, spent ₦8,500. % remaining?", options: ["5%", "10%", "15%", "85%"], correctAnswerIndex: 2, explanation: "Remaining = ₦1,500. (1500 / 10000) * 100 = 15%." },
         { id: 20, categoryId: 4, themeId: 1, category: "Tracking & Managing Spending", question: "Item costs ₦25,000, but has a 20% discount. Actual pay?", options: ["₦5,000", "₦20,000", "₦24,000", "₦30,000"], correctAnswerIndex: 1, explanation: "Discount = ₦5,000. Price = ₦25,000 - ₦5,000 = ₦20,000." },

        // Theme 2: Banking & Economic Environment (Categories 5-7) -> ID: 21-35
         // Cat 5: Understanding Banks & Accounts
         { id: 21, categoryId: 5, themeId: 2, category: "Understanding Banks & Accounts", question: "Difference: Savings vs. Current Account?", options: ["Business vs. Personal only", "Savings=interest/limits; Current=transactions/no interest", "Current has higher rates", "Savings can't do e-payments"], correctAnswerIndex: 1, explanation: "Savings accounts prioritize earning interest; Current accounts prioritize transaction frequency." },
         { id: 22, categoryId: 5, themeId: 2, category: "Understanding Banks & Accounts", question: "What is a Fixed Deposit account?", options: ["Withdraw anytime", "Deposit for fixed term & rate", "Stock market account", "Type of loan"], correctAnswerIndex: 1, explanation: "Locks funds for a set period for a potentially higher fixed interest rate." },
         { id: 23, categoryId: 5, themeId: 2, category: "Understanding Banks & Accounts", question: "What is a domiciliary account in Nigeria?", options: ["Housing payments only", "Account in foreign currency (USD, GBP...)", "Family joint account", "Stock trading account"], correctAnswerIndex: 1, explanation: "Allows holding and transacting in foreign currencies." },
         { id: 24, categoryId: 5, themeId: 2, category: "Understanding Banks & Accounts", question: "What does Nigeria Deposit Insurance Corporation (NDIC) do?", options: ["Regulates stock market", "Insures bank deposits up to a limit", "Provides loans to banks", "Sets national interest rate"], correctAnswerIndex: 1, explanation: "Protects depositors by guaranteeing their funds if a licensed bank fails." },
          { id: 25, categoryId: 5, themeId: 2, category: "Understanding Banks & Accounts", question: "Primary role of the Central Bank of Nigeria (CBN)?", options: ["Print Naira", "Regulate banks, manage monetary policy, ensure stability", "Give personal loans", "Collect national taxes"], correctAnswerIndex: 1, explanation: "Oversees financial sector, manages reserves, aims for price stability." },
         // Cat 6: Navigating Nigerian Finance Tools
          { id: 26, categoryId: 6, themeId: 2, category: "Navigating Nigerian Finance Tools", question: "Common way for mobile payments/banking in Nigeria without internet?", options: ["Physical checks", "USSD codes (*...#)", "Postal cash", "Bartering goods"], correctAnswerIndex: 1, explanation: "USSD allows basic transactions via phone menu without data." },
         { id: 27, categoryId: 6, themeId: 2, category: "Navigating Nigerian Finance Tools", question: "Purpose of the Bank Verification Number (BVN)?", options: ["Bank account number", "Standardized biometric ID for security", "Track credit history", "Facilitate int'l transfers"], correctAnswerIndex: 1, explanation: "Uses biometrics for unique ID to enhance security and reduce fraud." },
         { id: 28, categoryId: 6, themeId: 2, category: "Navigating Nigerian Finance Tools", question: "Primary stock exchange in Nigeria is called?", options: ["Lagos Regional Stock Exchange", "Nigerian Exchange Group (NGX)", "West African Securities Market", "Central Stock Exchange of Nigeria"], correctAnswerIndex: 1, explanation: "NGX (formerly NSE) is the main platform for trading securities." },
         { id: 29, categoryId: 6, themeId: 2, category: "Navigating Nigerian Finance Tools", question: "What is 'Fintech' generally associated with?", options: ["Traditional banking", "Retiree advice", "Using technology for innovative financial services (apps/platforms)", "Tax collection"], correctAnswerIndex: 2, explanation: "Fintech uses tech (apps, web) for payments, lending, investing etc." },
          { id: 30, categoryId: 6, themeId: 2, category: "Navigating Nigerian Finance Tools", question: "What is the Contributory Pension Scheme (CPS) in Nigeria?", options: ["Voluntary scheme", "Mandatory system (employer+employee contribute)", "Govt grant", "Retirement insurance"], correctAnswerIndex: 1, explanation: "Mandatory pension framework regulated by PenCom." },
         // Cat 7: Inflation & Your Money
         { id: 31, categoryId: 7, themeId: 2, category: "Inflation & Your Money", question: "What does 'inflation' mean for money's purchasing power?", options: ["Money buys more", "Price level stays same", "Money buys less; value decreases", "Interest rates automatically exceed inflation"], correctAnswerIndex: 2, explanation: "Inflation is a general price increase, reducing what your money can buy." },
         { id: 32, categoryId: 7, themeId: 2, category: "Inflation & Your Money", question: "Impact of high inflation on savings in low-interest account?", options: ["Real value increases", "Real value (purchasing power) decreases", "Banks must match inflation rate", "Auto-converted to stable asset"], correctAnswerIndex: 1, explanation: "If interest < inflation, savings lose buying power over time." },
         { id: 33, categoryId: 7, themeId: 2, category: "Inflation & Your Money", question: "What is currency devaluation?", options: ["Increase in value", "Deliberate downward adjustment vs other currencies", "Printing more notes", "Switching currency"], correctAnswerIndex: 1, explanation: "Lowers currency value, making exports cheaper, imports pricier." },
         { id: 34, categoryId: 7, themeId: 2, category: "Inflation & Your Money", question: "Strategy to hedge against local currency devaluation/inflation?", options: ["Keep large local cash", "Invest only in local govt bonds", "Save/invest partly in stable foreign currencies/real assets", "Ignore the risk"], correctAnswerIndex: 2, explanation: "Holding assets in stable foreign currencies or real assets can help preserve value." },
          { id: 35, categoryId: 7, themeId: 2, category: "Inflation & Your Money", question: "Common challenge budgeting in high-inflation environment?", options: ["Prices decrease rapidly", "Fixed incomes buy more", "Prices rise unpredictably, hard to plan, erodes purchasing power", "Banks offer high real interest"], correctAnswerIndex: 2, explanation: "Hard to estimate future costs, requiring frequent budget reviews." },

        // Theme 3: Borrowing & Credit (Categories 8-10) -> ID: 36-50
          // Cat 8: All About Debt
          { id: 36, categoryId: 8, themeId: 3, category: "All About Debt", question: "Which is generally 'good debt'?", options: ["High-interest CC for luxuries", "Mortgage for home", "Loan for expensive vacation", "Payday loans"], correctAnswerIndex: 1, explanation: "Good debt finances appreciating assets (home) or income potential (education)." },
         { id: 37, categoryId: 8, themeId: 3, category: "All About Debt", question: "What is the 'Principal' of a loan?", options: ["Total interest paid", "Initial amount borrowed (before interest)", "Monthly payment", "Processing fees"], correctAnswerIndex: 1, explanation: "The original sum borrowed or outstanding amount interest is calculated on." },
         { id: 38, categoryId: 8, themeId: 3, category: "All About Debt", question: "What does Annual Percentage Rate (APR) represent?", options: ["Simple interest rate only", "Total loan amount + fees", "Yearly cost (interest + certain fees) as %", "Loan duration in years"], correctAnswerIndex: 2, explanation: "Broader cost measure than simple interest; includes interest + some fees." },
          { id: 39, categoryId: 8, themeId: 3, category: "All About Debt", question: "Loan type often used till payday, very high rates?", options: ["Mortgage", "Student loan", "Payday loan / Salary advance", "Business expansion loan"], correctAnswerIndex: 2, explanation: "Payday loans offer quick cash but typically have extremely high APRs." },
          { id: 40, categoryId: 8, themeId: 3, category: "All About Debt", question: "What if a loan is 'secured'?", options: ["Low interest rate", "Borrower provides collateral lender can claim on default", "Govt guarantees repayment", "Requires co-signer"], correctAnswerIndex: 1, explanation: "Backed by collateral (car, property), reducing lender risk." },
          // Cat 9: Your Credit Reputation
          { id: 41, categoryId: 9, themeId: 3, category: "Your Credit Reputation", question: "What is a credit score?", options: ["Money in bank", "Numerical representation of creditworthiness", "Annual income", "Number of credit cards"], correctAnswerIndex: 1, explanation: "Number based on credit history used by lenders to assess risk." },
          { id: 42, categoryId: 9, themeId: 3, category: "Your Credit Reputation", question: "Info typically found on credit report?", options: ["Daily spending habits", "Medical history", "Borrowing & repayment history (loans, cards)", "Investment performance"], correctAnswerIndex: 2, explanation: "Details credit accounts, payment history, debts, inquiries." },
         { id: 43, categoryId: 9, themeId: 3, category: "Your Credit Reputation", question: "Role of credit bureau (e.g., CRC, XDS in Nigeria)?", options: ["Provide loans directly", "Collect & share credit history info with lenders", "Set max interest rates", "Offer financial advice"], correctAnswerIndex: 1, explanation: "Compile credit info for reports/scores used by lenders." },
          { id: 44, categoryId: 9, themeId: 3, category: "Your Credit Reputation", question: "Action MOST likely to negatively impact credit score?", options: ["Paying bills on time", "Low credit utilization", "Frequently missing payments / defaulting", "Checking own report"], correctAnswerIndex: 2, explanation: "Payment history is crucial; late/missed payments hurt score badly." },
         { id: 45, categoryId: 9, themeId: 3, category: "Your Credit Reputation", question: "Why check your credit report periodically?", options: ["Increase credit limit", "Find errors/ID theft, understand standing", "Lower rates instantly", "Lenders require it"], correctAnswerIndex: 1, explanation: "Helps spot errors, detect fraud, understand what lenders see." },
         // Cat 10: Tackling Your Debts
         { id: 46, categoryId: 10, themeId: 3, category: "Tackling Your Debts", question: "Most important factor when considering a loan (besides amount)?", options: ["Lender name", "Interest rate (APR), fees, repayment terms", "Document color", "If friends took similar loans"], correctAnswerIndex: 1, explanation: "Understanding total cost (APR, fees) & repayment structure is crucial." },
         { id: 47, categoryId: 10, themeId: 3, category: "Tackling Your Debts", question: "Recommended first step for managing multiple debts?", options: ["Take new consolidation loan immediately", "Ignore smallest debts", "List all debts (creditor, balance, rate, payment)", "Borrow from friends"], correctAnswerIndex: 2, explanation: "A clear overview is the foundation for a repayment strategy." },
          { id: 48, categoryId: 10, themeId: 3, category: "Tackling Your Debts", question: "Which strategy pays smallest debts first for motivation?", options: ["Consolidation", "Avalanche", "Snowball", "Settlement"], correctAnswerIndex: 2, explanation: "Snowball focuses on smallest balance first for quick wins." },
         { id: 49, categoryId: 10, themeId: 3, category: "Tackling Your Debts", question: "Which strategy pays highest interest rate debts first to save most?", options: ["Consolidation", "Avalanche", "Snowball", "Negotiation"], correctAnswerIndex: 1, explanation: "Avalanche prioritizes highest APR debt, minimizing total interest paid." },
         { id: 50, categoryId: 10, themeId: 3, category: "Tackling Your Debts", question: "What is debt consolidation?", options: ["Ignoring creditors", "Combining multiple debts into one new loan", "Paying only interest", "Govt debt forgiveness"], correctAnswerIndex: 1, explanation: "Simplifies repayment by replacing several loans with one, aiming for better terms." },

         // Theme 4: Future Planning & Protection (Categories 11-14) -> ID: 51-70
         // Cat 11: Setting Smart Financial Goals
          { id: 51, categoryId: 11, themeId: 4, category: "Setting Smart Financial Goals", question: "Why set specific financial goals?", options: ["Just to discuss", "Provide direction & motivation for saving/investing", "Advisors recommend it", "Feel superior"], correctAnswerIndex: 1, explanation: "Goals give purpose and guide financial decisions." },
         { id: 52, categoryId: 11, themeId: 4, category: "Setting Smart Financial Goals", question: "What does 'SMART' acronym mean in goal setting?", options: ["Specific, Measurable, Achievable, Relevant, Time-bound", "Savvy, Monetary, Accurate, Reliable, Tested", "Simple, Manageable, Actionable, Rewarding, Trackable", "Small, Medium, Ambitious, Rich, Total"], correctAnswerIndex: 0, explanation: "Criteria for effective goal setting." },
          { id: 53, categoryId: 11, themeId: 4, category: "Setting Smart Financial Goals", question: "Fundamental aspect of creating financial plan?", options: ["Predict exact future values", "Detailed understanding of current situation (income, expenses, assets, liabilities)", "Guarantee wealth", "Follow generic advice"], correctAnswerIndex: 1, explanation: "Plan must build on understanding your current finances." },
         { id: 54, categoryId: 11, themeId: 4, category: "Setting Smart Financial Goals", question: "How often review/adjust financial plan?", options: ["Only during crisis", "Once a decade", "At least annually, or after major life/economic changes", "Only when expert advises"], correctAnswerIndex: 2, explanation: "Regular reviews keep plan relevant." },
          { id: 55, categoryId: 11, themeId: 4, category: "Setting Smart Financial Goals", question: "Example of long-term financial goal?", options: ["Next month trip", "Pay off CC in 3 months", "Saving for retirement (20-30 years)", "Weekly groceries"], correctAnswerIndex: 2, explanation: "Long-term goals usually span 5+ years." },
          // Cat 12: Your Safety Net: Emergency Fund
          { id: 56, categoryId: 12, themeId: 4, category: "Your Safety Net: Emergency Fund", question: "Primary purpose of emergency fund?", options: ["High-risk investments", "Readily available funds for unexpected essentials", "Planned vacations", "Lend to friends"], correctAnswerIndex: 1, explanation: "Safety net for critical expenses during unforeseen events." },
         { id: 57, categoryId: 12, themeId: 4, category: "Your Safety Net: Emergency Fund", question: "Ideal size for emergency fund?", options: ["1 month income", "3-6 months essential living expenses", "1 year income", "House down payment"], correctAnswerIndex: 1, explanation: "Covers essentials during job loss etc." },
         { id: 58, categoryId: 12, themeId: 4, category: "Your Safety Net: Emergency Fund", question: "Unexpected large car repair: use first?", options: ["Retirement savings", "Emergency fund", "High-interest credit card", "Payday loan"], correctAnswerIndex: 1, explanation: "Exactly what emergency funds are designed for." },
         { id: 59, categoryId: 12, themeId: 4, category: "Your Safety Net: Emergency Fund", question: "Key characteristic of emergency funds?", options: ["High growth potential", "Illiquidity (hard access)", "Safety and Liquidity (easy access)", "Employer matched"], correctAnswerIndex: 2, explanation: "Must prioritize safety and quick, easy access over returns." },
          { id: 60, categoryId: 12, themeId: 4, category: "Your Safety Net: Emergency Fund", question: "Why is health insurance part of financial security?", options: ["Prevents illness", "Helps cover high medical costs, prevents debt", "Gym discounts", "Replaces income (that's disability)"], correctAnswerIndex: 1, explanation: "Mitigates financial risk of large medical bills." },
          // Cat 13: Planning Your Retirement Journey
          { id: 61, categoryId: 13, themeId: 4, category: "Planning Your Retirement Journey", question: "Why start retirement planning early?", options: ["Retirement age is young", "Maximize compound interest over decades", "Govt pensions are sufficient", "Impress employers"], correctAnswerIndex: 1, explanation: "More time for compounding = significantly larger savings." },
         { id: 62, categoryId: 13, themeId: 4, category: "Planning Your Retirement Journey", question: "Why consider inflation when planning retirement?", options: ["Inflation boosts investments", "Lowers retiree costs", "Erodes purchasing power; need more money later", "Banks auto-adjust"], correctAnswerIndex: 2, explanation: "Need to account for rising cost of living over long retirement." },
         { id: 63, categoryId: 13, themeId: 4, category: "Planning Your Retirement Journey", question: "Besides pensions, other potential retirement income sources?", options: ["Relying on children", "Personal savings, investments, part-time work", "Unemployment benefits", "Lottery winnings"], correctAnswerIndex: 1, explanation: "Secure retirement often relies on multiple income streams." },
         { id: 64, categoryId: 13, themeId: 4, category: "Planning Your Retirement Journey", question: "Main difference: Saving vs. Investing?", options: ["Saving=short-term/safety; Investing=long-term/growth(risk)", "Investing safer", "Saving yields more", "No difference"], correctAnswerIndex: 0, explanation: "Saving = low-risk safety/access. Investing = higher risk for potential higher long-term returns." },
         { id: 65, categoryId: 13, themeId: 4, category: "Planning Your Retirement Journey", question: "Generally lower-risk investment, good for capital preservation?", options: ["Tech startup", "Small private company", "Government bonds / Treasury Bills", "Volatile crypto"], correctAnswerIndex: 2, explanation: "Govt bonds are relatively safe, backed by the government." },
          // Cat 14: Understanding Insurance
          { id: 66, categoryId: 14, themeId: 4, category: "Understanding Insurance", question: "Main purpose of buying insurance?", options: ["Make profit", "Transfer risk of financial loss to insurer", "Get discounts", "Mandatory savings"], correctAnswerIndex: 1, explanation: "Pays premium to transfer risk of specified potential losses." },
         { id: 67, categoryId: 14, themeId: 4, category: "Understanding Insurance", question: "What is an insurance 'premium'?", options: ["Payout amount", "Max policy cover", "Regular amount paid by policyholder for cover", "No-claims bonus"], correctAnswerIndex: 2, explanation: "Fee paid to insurer for coverage." },
         { id: 68, categoryId: 14, themeId: 4, category: "Understanding Insurance", question: "What is an insurance 'deductible'/'excess'?", options: ["Premium discount", "Total cover", "Extra claim fee", "Amount policyholder pays first before insurer pays"], correctAnswerIndex: 3, explanation: "Initial portion of claim paid by insured. Higher deductible often = lower premium." },
         { id: 69, categoryId: 14, themeId: 4, category: "Understanding Insurance", question: "Insurance covering your legal responsibility for harming others?", options: ["Health", "Life", "Liability (part of car/home)", "Travel"], correctAnswerIndex: 2, explanation: "Protects if you're liable for harm/damage to third parties." },
         { id: 70, categoryId: 14, themeId: 4, category: "Understanding Insurance", question: "Minimizing investment fees comparable to managing insurance costs?", options: ["Both guarantee returns", "Little long-term impact", "Both reduce net benefit; lower cost = better outcome", "Low cost = lower quality"], correctAnswerIndex: 2, explanation: "Both fees/premiums are costs reducing net outcome; efficiency matters." },

         // Theme 5: Introduction to Investing (Categories 15-17) -> ID: 71-85
         // Cat 15: Why Invest? Basics & Growth
         { id: 71, categoryId: 15, themeId: 5, category: "Why Invest? Basics & Growth", question: "What is investing?", options: ["Spending on luxuries", "Allocating money to assets (stocks, bonds) expecting income/profit", "Donating", "Keeping cash at home"], correctAnswerIndex: 1, explanation: "Using capital to acquire assets for potential growth/income." },
         { id: 72, categoryId: 15, themeId: 5, category: "Why Invest? Basics & Growth", question: "What does 'liquidity' mean regarding investments?", options: ["High return potential", "How easily converted to cash without losing value", "Cash in circulation", "Interest on borrowed funds"], correctAnswerIndex: 1, explanation: "Ease/speed of converting asset to cash at stable price." },
          { id: 73, categoryId: 15, themeId: 5, category: "Why Invest? Basics & Growth", question: "What is compound interest?", options: ["Interest on principal only", "Interest on principal + accumulated interest", "Tax on earnings", "Bank loan fee"], correctAnswerIndex: 1, explanation: "'Interest on interest,' allowing accelerating growth." },
         { id: 74, categoryId: 15, themeId: 5, category: "Why Invest? Basics & Growth", question: "Rule of 72: Approx. how long to double investment at 6% annually?", options: ["6 years", "7.2 years", "12 years", "72 years"], correctAnswerIndex: 2, explanation: "72 / Interest Rate (%) = Approx. Years to Double. 72 / 6 = 12." },
         { id: 75, categoryId: 15, themeId: 5, category: "Why Invest? Basics & Growth", question: "Buy stock for ₦100, sell for ₦120. The ₦20 profit is called?", options: ["Dividend", "Interest", "Capital Gain", "Principal Return"], correctAnswerIndex: 2, explanation: "Profit from selling asset for more than purchase price." },
          // Cat 16: Investment Strategies: Risk & Diversification
          { id: 76, categoryId: 16, themeId: 5, category: "Investment Strategies: Risk & Diversification", question: "What does 'diversification' mean in investing?", options: ["All in one best asset", "Spreading investments (various assets/industries/regions) to reduce risk", "Invest only in home country", "Buy high, sell low"], correctAnswerIndex: 1, explanation: "Spreading investments reduces impact if one performs poorly." },
         { id: 77, categoryId: 16, themeId: 5, category: "Investment Strategies: Risk & Diversification", question: "Why is diversification important?", options: ["Guarantees high returns", "Helps reduce overall risk of significant portfolio losses", "Simplifies tracking", "Eliminates research need"], correctAnswerIndex: 1, explanation: "Mitigates impact of single poor performer, reducing overall portfolio risk." },
         { id: 78, categoryId: 16, themeId: 5, category: "Investment Strategies: Risk & Diversification", question: "What is investment risk?", options: ["Guarantee of increase", "Possibility actual return differs from expected (incl. loss)", "Broker fee", "Holding period"], correctAnswerIndex: 1, explanation: "Uncertainty about future returns and potential loss." },
          { id: 79, categoryId: 16, themeId: 5, category: "Investment Strategies: Risk & Diversification", question: "How does time horizon influence risk tolerance?", options: ["Longer = lower tolerance", "Shorter = higher tolerance", "Longer often allows higher tolerance (time to recover)", "No impact"], correctAnswerIndex: 2, explanation: "Longer timeframes allow weathering more volatility." },
         { id: 80, categoryId: 16, themeId: 5, category: "Investment Strategies: Risk & Diversification", question: "What is market volatility?", options: ["Consistent growth measure", "Degree of price fluctuation over time", "Guaranteed annual return", "Tax rate"], correctAnswerIndex: 1, explanation: "Indicates price swing magnitude/speed. High volatility = higher risk." },
         // Cat 17: Exploring Investment Types
         { id: 81, categoryId: 17, themeId: 5, category: "Exploring Investment Types", question: "Basic difference: Stocks vs. Bonds?", options: ["Stocks=loans, Bonds=ownership", "Stocks=ownership(equity); Bonds=debt(loan)", "Stocks safer", "Bonds pay dividends"], correctAnswerIndex: 1, explanation: "Stocks=part-owner. Bonds=lending money." },
          { id: 82, categoryId: 17, themeId: 5, category: "Exploring Investment Types", question: "What is a mutual fund?", options: ["Savings account type", "Professionally managed fund pooling money for diversified portfolio", "Govt loan", "Digital currency scheme"], correctAnswerIndex: 1, explanation: "Pools investor money for diversification and professional management." },
         { id: 83, categoryId: 17, themeId: 5, category: "Exploring Investment Types", question: "What is an ETF (Exchange-Traded Fund)?", options: ["Savings account", "Fund tracking index, trades like stock", "Electronic govt bond", "Physical commodity"], correctAnswerIndex: 1, explanation: "Offers diversification, trades on exchanges like stocks." },
         { id: 84, categoryId: 17, themeId: 5, category: "Exploring Investment Types", question: "Company shares profits with shareholders. Payment called?", options: ["Interest", "Dividend", "Principal repayment", "Capital gain"], correctAnswerIndex: 1, explanation: "Dividends are profit distributions to stockholders." },
          { id: 85, categoryId: 17, themeId: 5, category: "Exploring Investment Types", question: "Investing in real estate typically involves buying?", options: ["Random company shares", "Treasury Bills", "Physical property or shares in property companies (REITs)", "Certificates of Deposit"], correctAnswerIndex: 2, explanation: "Direct property ownership or REITs (Real Estate Investment Trusts)." },

        // Theme 6: Staying Sharp & Secure (Categories 18-20) -> ID: 86-100
          // Cat 18: Measuring Progress & Review
          { id: 86, categoryId: 18, themeId: 6, category: "Measuring Progress & Review", question: "How often check overall financial plan/progress?", options: ["Only at retirement", "Every 5 years", "At least annually (or when situation changes)", "Never, set & forget"], correctAnswerIndex: 2, explanation: "Regular reviews keep plan relevant and track progress." },
         { id: 87, categoryId: 18, themeId: 6, category: "Measuring Progress & Review", question: "Factor MOST likely to help achieve long-term goals faster?", options: ["High inflation", "Frequent borrowing", "Consistent saving/investing & compounding", "All cash in zero-interest account"], correctAnswerIndex: 2, explanation: "Discipline + compounding drive long-term growth." },
         { id: 88, categoryId: 18, themeId: 6, category: "Measuring Progress & Review", question: "Why minimize investment fees/costs?", options: ["High fees = better quality", "Fees don't matter much", "Fees reduce net returns; lower fees keep more working for you", "Fees only paid on profit"], correctAnswerIndex: 2, explanation: "Small fees compound, significantly reducing final value." },
         { id: 89, categoryId: 18, themeId: 6, category: "Measuring Progress & Review", question: "Reached savings goal early. Sensible option?", options: ["Stop saving", "Set new goal / Allocate extra to another goal", "Spend it all + extra on bigger item", "Lend it out"], correctAnswerIndex: 1, explanation: "Use the momentum to aim higher or accelerate other goals." },
          { id: 90, categoryId: 18, themeId: 6, category: "Measuring Progress & Review", question: "What does 'Net Worth' represent?", options: ["Yearly salary", "Total cash savings only", "Overall financial health snapshot (Assets - Liabilities)", "Credit score value"], correctAnswerIndex: 2, explanation: "Measures what you own vs. what you owe." },
         // Cat 19: Practical Financial Decisions
         { id: 91, categoryId: 19, themeId: 6, category: "Practical Financial Decisions", question: "Goal: ₦1M in 5 years. How does high inflation affect this?", options: ["Makes ₦1M worth more", "No effect on cash", "₦1M buys less later; may need save more for *real* value", "Goal auto-adjusts"], correctAnswerIndex: 2, explanation: "Inflation erodes purchasing power; need more NGN later for same goal." },
         { id: 92, categoryId: 19, themeId: 6, category: "Practical Financial Decisions", question: "₦100k salary. Apply 'Pay Yourself First' (15% goal). Immediate action?", options: ["Spend ₦15k on fun", "Pay bills, save leftover", "Immediately transfer ₦15,000 to savings", "Wait till month end"], correctAnswerIndex: 2, explanation: "Prioritize saving: allocate and move savings *before* other spending." },
          { id: 93, categoryId: 19, themeId: 6, category: "Practical Financial Decisions", question: "Goal: ₦500k/year (~₦41.7k/mo). After 6mo, only ₦150k saved. Strategy?", options: ["Abandon goal", "Hope", "Increase monthly savings drastically OR adjust goal/timeline", "Take loan"], correctAnswerIndex: 2, explanation: "Falling behind requires action: save more, extend time, or adjust target." },
         { id: 94, categoryId: 19, themeId: 6, category: "Practical Financial Decisions", question: "How does Need vs. Want budgeting help?", options: ["Allows unlimited want spending", "Helps prioritize essentials, identify potential cuts", "Ensures buying only needs", "For impressing others"], correctAnswerIndex: 1, explanation: "Enables conscious spending choices and finding savings." },
         { id: 95, categoryId: 19, themeId: 6, category: "Practical Financial Decisions", question: "5kg cooking gas = ₦4,500. Cost per kg?", options: ["₦450/kg", "₦500/kg", "₦900/kg", "₦1,000/kg"], correctAnswerIndex: 2, explanation: "Cost per unit: ₦4,500 / 5kg = ₦900/kg. Helps compare value." },
          // Cat 20: Be Scam Aware!
          { id: 96, categoryId: 20, themeId: 6, category: "Be Scam Aware!", question: "Common red flag of phishing email/SMS?", options: ["Message asking click link for urgent account verification/update", "Known company logo", "Addressed to your name", "High guaranteed return offer"], correctAnswerIndex: 0, explanation: "Legit institutions rarely ask for sensitive info via urgent unsolicited links." },
         { id: 97, categoryId: 20, themeId: 6, category: "Be Scam Aware!", question: "Key characteristic of Ponzi/pyramid scheme?", options: ["Investments in known firms", "Promises high, guaranteed returns, little risk, relies on recruitment", "Audited prospectuses", "Returns from actual profits"], correctAnswerIndex: 1, explanation: "Pays early investors with new investors' money; relies on recruitment." },
          { id: 98, categoryId: 20, themeId: 6, category: "Be Scam Aware!", question: "Why NEVER share BVN, card PINs, banking passwords?", options: ["Helps bank track spending", "Needed for benefits", "Fraudsters can use to access accounts, steal money", "Helps customer service"], correctAnswerIndex: 2, explanation: "Keys to your accounts; sharing allows potential theft." },
          { id: 99, categoryId: 20, themeId: 6, category: "Be Scam Aware!", question: "Consumer right regarding loan agreements?", options: ["Right to ignore terms after signing", "Right to clear info on terms/costs *before* agreeing", "Right to change rate unilaterally", "Right to auto-approval"], correctAnswerIndex: 1, explanation: "Transparency is key; you have the right to understand terms first." },
         { id: 100, categoryId: 20, themeId: 6, category: "Be Scam Aware!", question: "Another common online scam tactic (besides urgent requests)?", options: ["Discounts on official sites", "Fake websites/profiles mimicking legit businesses", "Detailed contact info", "Order confirmation emails"], correctAnswerIndex: 1, explanation: "Scammers create lookalikes to steal data/money; verify URLs/contacts independently." }
      ];

    // Quiz State & DOM References (Identical to personal.js)
    let currentQuizData = { questions: [], currentQuestionIndex: 0, score: 0, userAnswers: {} };
    const quizModal = document.getElementById('quiz-modal');
    const modalTitle = document.getElementById('quiz-modal-title');
    const modalCloseBtn = document.getElementById('quiz-modal-close');
    const modalQuestionEl = document.getElementById('quiz-modal-question');
    const modalOptionsEl = document.getElementById('quiz-modal-options');
    const modalFeedbackEl = document.getElementById('quiz-modal-feedback');
    const modalNextBtn = document.getElementById('quiz-modal-next');
    const modalResultsEl = document.getElementById('quiz-modal-results');
    const modalRestartBtn = document.getElementById('quiz-modal-restart');
    const modalCloseResultsBtn = document.getElementById('quiz-modal-close-results');
    const modalProgressCurrent = document.getElementById('quiz-modal-q-current');
    const modalProgressTotal = document.getElementById('quiz-modal-q-total');

    // --- Quiz Functions (Identical Logic, but use `allQuestions`) ---
    function startQuiz(categoryId) {
        console.log(`Starting quiz for category ID: ${categoryId} on Quizzes Page`);
        // Use the full 'allQuestions' list here
        const categoryQuestions = allQuestions.filter(q => q.categoryId === categoryId);
        if (categoryQuestions.length === 0) {
             console.error("No questions found in allQuestions for category ID:", categoryId);
             alert("Sorry, questions for this category could not be loaded.");
             return;
         }
        if (categoryQuestions.length !== 5) {
            console.warn(`Expected 5 questions, but found ${categoryQuestions.length} for category ID: ${categoryId}. Proceeding anyway.`);
        }

        currentQuizData = { questions: categoryQuestions, currentQuestionIndex: 0, score: 0, userAnswers: {} };
        if (modalTitle) modalTitle.textContent = categoryQuestions[0]?.category || 'Financial Fitness Quiz';
        if (modalResultsEl) modalResultsEl.style.display = 'none';
        if (modalRestartBtn) modalRestartBtn.style.display = 'none';
        if (modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
        if (modalQuestionEl) modalQuestionEl.style.display = 'block';
        if (modalOptionsEl) modalOptionsEl.style.display = 'block';
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'block';
        if (modalProgressTotal) modalProgressTotal.textContent = currentQuizData.questions.length;

        displayModalQuestion();
        if(quizModal) quizModal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    // displayModalQuestion, handleModalOptionSelection, showModalFeedback,
    // nextModalQuestion, showModalResults, restartModalQuiz, closeQuizModal
    // are IDENTICAL to personal.js - No need to repeat them here for brevity,
    // assume they are copied correctly below this comment block.

    function displayModalQuestion() { // Copied from personal.js
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
            button.setAttribute('data-index', index);
            button.onclick = () => handleModalOptionSelection(index);
            modalOptionsEl.appendChild(button);
        });
    }

    function handleModalOptionSelection(selectedIndex) { // Copied from personal.js
        const quiz = currentQuizData;
        const q = quiz.questions[quiz.currentQuestionIndex];
        const buttons = modalOptionsEl?.querySelectorAll('button');
        if (!buttons) return;
        buttons.forEach(button => { button.disabled = true; button.onclick = null; });
        quiz.userAnswers[q.id] = selectedIndex;
        showModalFeedback(selectedIndex, q.correctAnswerIndex, q.explanation);
    }

    function showModalFeedback(selectedIndex, correctIndex, explanation) { // Copied from personal.js
        const quiz = currentQuizData; const isCorrect = selectedIndex === correctIndex;
        if (isCorrect) quiz.score++;
        const buttons = modalOptionsEl?.querySelectorAll('button');
        if (!buttons || !modalFeedbackEl) return;
        buttons.forEach((button, index) => {
            button.classList.remove('selected');
            if (index === correctIndex) button.classList.add('correct');
            else if (index === selectedIndex) button.classList.add('incorrect');
            else button.classList.add('disabled');
        });
        modalFeedbackEl.innerHTML = `<p><strong>${isCorrect ? 'Correct!' : 'Incorrect.'}</strong> ${explanation || ''}</p>`;
        modalFeedbackEl.className = `quiz-modal-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        modalFeedbackEl.style.display = 'block';
        if (modalNextBtn) {
            if (quiz.currentQuestionIndex < quiz.questions.length - 1) modalNextBtn.style.display = 'inline-block';
            else { modalNextBtn.style.display = 'none'; setTimeout(showModalResults, 1200); }
        }
    }

    function nextModalQuestion() { // Copied from personal.js
        if (modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if (modalNextBtn) modalNextBtn.style.display = 'none';
        currentQuizData.currentQuestionIndex++; displayModalQuestion();
    }

    function showModalResults() { // Copied from personal.js
        const quiz = currentQuizData;
        if(modalQuestionEl) modalQuestionEl.style.display = 'none';
        if(modalOptionsEl) modalOptionsEl.style.display = 'none';
        if(modalFeedbackEl) modalFeedbackEl.style.display = 'none';
        if(modalNextBtn) modalNextBtn.style.display = 'none';
        const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
        if (progressEl) progressEl.style.display = 'none';
        if(modalResultsEl) {
            modalResultsEl.innerHTML = `<h4>Quiz Complete!</h4> <p>Your Score: ${quiz.score} out of ${quiz.questions.length}</p> <p style="margin-top: 10px; font-size: 0.9em;">${quiz.score === quiz.questions.length ? 'Excellent work!' : quiz.score >= Math.ceil(quiz.questions.length * 0.6) ? 'Good job!' : 'Keep learning!'}</p>`;
            modalResultsEl.style.display = 'block';
        }
        if(modalRestartBtn) modalRestartBtn.style.display = 'inline-block';
        if(modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'inline-block';
    }

    function restartModalQuiz() { // Copied from personal.js
        const categoryId = currentQuizData.questions[0]?.categoryId;
        if (categoryId) {
            if(modalResultsEl) modalResultsEl.style.display = 'none';
            if(modalRestartBtn) modalRestartBtn.style.display = 'none';
            if(modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
            startQuiz(categoryId);
        } else { closeQuizModal(); }
    }

     function closeQuizModal() { // Copied from personal.js
       if(quizModal) quizModal.style.display = 'none';
       document.body.style.overflow = '';
       if(modalTitle) modalTitle.textContent = 'Quiz Title';
       if(modalQuestionEl) modalQuestionEl.textContent = '';
       if(modalOptionsEl) modalOptionsEl.innerHTML = '';
       if(modalFeedbackEl) modalFeedbackEl.style.display = 'none';
       if(modalResultsEl) modalResultsEl.style.display = 'none';
       if(modalRestartBtn) modalRestartBtn.style.display = 'none';
       if(modalCloseResultsBtn) modalCloseResultsBtn.style.display = 'none';
       if(modalNextBtn) modalNextBtn.style.display = 'none';
       if(modalQuestionEl) modalQuestionEl.style.display = 'block';
       if(modalOptionsEl) modalOptionsEl.style.display = 'block';
       const progressEl = modalProgressCurrent?.closest('.quiz-modal-progress');
       if (progressEl) progressEl.style.display = 'block';
    }

    // --- END Quiz Functions ---


    // Attach Event Listeners for ALL Quiz Buttons on this page
    document.querySelectorAll('#full-financial-challenge .start-quiz-btn').forEach(button => {
        button.addEventListener('click', (e) => {
           const card = e.target.closest('.category-card');
           const categoryId = card ? parseInt(card.dataset.categoryId, 10) : null;
            if (categoryId) {
               startQuiz(categoryId); // Use the full 'allQuestions' list
           } else {
               console.error("Missing category ID on card.");
           }
        });
    });

    // Attach Modal Button Listeners (Identical to personal.js)
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeQuizModal);
    if (modalCloseResultsBtn) modalCloseResultsBtn.addEventListener('click', closeQuizModal);
    if (modalNextBtn) modalNextBtn.addEventListener('click', nextModalQuestion);
    if (modalRestartBtn) modalRestartBtn.addEventListener('click', restartModalQuiz);
    if (quizModal) {
        quizModal.addEventListener('click', (e) => {
            if (e.target === quizModal) closeQuizModal();
        });
    }

    // --- END Quiz Logic & Listeners ---

    console.log("Rofilid Full Quizzes Page Scripts Initialized.");

}); // End DOMContentLoaded
