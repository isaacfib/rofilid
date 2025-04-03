/**
 * File Location: /assets/js/personal/calculator.js
 * Description: JavaScript logic for the ROFILID Interest Calculator Tool.
 *              Handles modes, inputs, calculations, results display, charting,
 *              and advanced entry management.
 * Version: 1.1.0
 * Dependencies: Chart.js library, Font Awesome (for icons in HTML)
 */

(function () {
    'use strict';

    // --- Configuration & Constants ---
    const CONFIG = {
        MAX_ADVANCED_ENTRIES: 5,
        DEFAULT_CURRENCY: 'NGN',
        DEFAULT_PRINCIPAL: 10000,
        DEFAULT_RATE: 5,
        DEFAULT_RATE_PERIOD: 'annual',
        DEFAULT_INTEREST_TYPE: 'compound',
        DEFAULT_COMPOUNDING: 'monthly',
        DEFAULT_DURATION_VALUE: 1,
        DEFAULT_DURATION_UNIT: 'years',
        DEBOUNCE_DELAY: 400, // Slightly faster debounce
        RESULTS_VISIBILITY_DELAY: 50, // Shorter delay
        CHART_COLORS: { // Example colors - align with site theme (use CSS vars if possible)
            principal: 'rgba(203, 213, 225, 0.7)',    // slate-300
            interest: 'rgba(16, 185, 129, 0.7)',     // emerald-500 (more teal)
            total: 'rgba(13, 148, 136, 0.8)',       // teal-600
            borderColor: 'rgba(15, 118, 110, 1)', // teal-700
        },
        // --- VERY IMPORTANT WARNING ---
        // The exchange rates below are HARDCODED PLACEHOLDERS and WILL BE inaccurate.
        // For a production application, you MUST integrate a reliable, real-time
        // currency exchange rate API (e.g., ExchangeRate-API, Open Exchange Rates).
        EXCHANGE_RATES: { // Using NGN as base = 1
            NGN: 1,
            USD: 1 / 1450, // Example: 1 USD = 1450 NGN -> 1 NGN = 1/1450 USD
            EUR: 1 / 1550,
            GBP: 1 / 1800,
            JPY: 1 / 9.5,
            CNY: 1 / 200,
            CAD: 1 / 1080, // Added
            AUD: 1 / 950,  // Added
        },
        ERROR_MESSAGES: {
            required: 'This field is required.',
            numberPositive: 'Please enter a positive number.',
            numberZeroPositive: 'Please enter zero or a positive number.',
            dateInvalid: 'Please enter a valid date.',
            dateOrder: 'End date must be after start date.',
            durationPositive: 'Duration must be positive.',
            ratePositive: 'Interest rate must be positive.',
            maxEntries: 'Maximum of 5 calculations reached.',
            conversionError: 'Currency conversion unavailable.',
        }
    };

    // --- State Variables ---
    let currentMode = 'simple'; // 'simple' or 'advanced'
    let advancedEntryCounter = 0; // Start counter at 0 for easier ID generation (1-based)
    let interestChart = null; // To hold the Chart.js instance
    let calculationResultsCache = null; // Cache the latest full results object


    // --- DOM Element Caching ---
    const dom = {}; // Cache object

    /** Cache frequently accessed DOM elements */
    function cacheDOMElements() {
        dom.form = document.getElementById('calculator-form');
        dom.modeToggleSimple = document.getElementById('toggle-simple');
        dom.modeToggleAdvanced = document.getElementById('toggle-advanced');
        dom.simpleModeContainer = document.getElementById('simple-mode');
        dom.advancedModeContainer = document.getElementById('advanced-mode');
        dom.advancedEntriesContainer = document.getElementById('advanced-entries');
        dom.entryTemplate = document.querySelector('.entry-template'); // Use querySelector for template class
        dom.addEntryBtn = document.getElementById('add-entry-btn');
        dom.calculateBtn = document.getElementById('calculate-btn'); // Now submit button
        dom.clearFormBtn = document.getElementById('clear-form-btn');
        dom.resultsArea = document.getElementById('results-area');
        dom.simpleResultsDisplay = document.getElementById('simple-results');
        dom.advancedResultsDisplay = document.getElementById('advanced-results');
        dom.advancedIndividualResultsContainer = document.getElementById('advanced-individual-results');
        dom.aggregationCurrencySelect = document.getElementById('aggregation-currency');
        dom.advancedAggregatedDisplayContainer = document.getElementById('advanced-aggregated-display');
        dom.aggregationError = document.getElementById('aggregation-error');
        dom.chartArea = document.getElementById('chart-area');
        dom.chartCanvas = document.getElementById('interest-chart');
        dom.printResultsBtn = document.getElementById('print-results-btn');
        dom.currentYearSpan = document.getElementById('current-year');

        // Result value elements for direct update
        dom.resultSimplePrincipal = document.getElementById('result-simple-principal');
        dom.resultSimpleInterest = document.getElementById('result-simple-interest');
        dom.resultSimpleFinal = document.getElementById('result-simple-final');
        dom.resultSimpleEar = document.getElementById('result-simple-ear');
        dom.resultAggPrincipal = document.getElementById('result-agg-principal');
        dom.resultAggInterest = document.getElementById('result-agg-interest');
        dom.resultAggFinal = document.getElementById('result-agg-final');
        dom.resultAggEar = document.getElementById('result-agg-ear');

        // Basic check if critical elements exist
        if (!dom.form || !dom.modeToggleSimple || !dom.modeToggleAdvanced || !dom.entryTemplate || !dom.resultsArea || !dom.chartCanvas) {
            console.error("Calculator Initialization Failed: Critical DOM elements missing.");
            // Optionally disable the calculator or show an error message to the user
            if (dom.form) dom.form.hidden = true;
            return false; // Indicate failure
        }
        return true; // Indicate success
    }


    // --- Helper Functions ---

    /** Debounce function: Executes a function only after a specified delay after the last call */
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func.apply(this, args); };
        clearTimeout(timeout); timeout = setTimeout(later, wait);
      };
    }

    /** Format number as currency using Intl.NumberFormat */
    function formatCurrency(amount, currencyCode = CONFIG.DEFAULT_CURRENCY) {
        if (isNaN(amount) || amount === null) return '--'; // Handle invalid input
        try {
            return new Intl.NumberFormat(undefined, { // Use user's locale default
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);
        } catch (e) {
             console.warn(`Currency formatting failed for ${currencyCode}. Using fallback.`, e);
             // Basic fallback
             const symbolMap = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', CAD: '$', AUD: '$' };
             const symbol = symbolMap[currencyCode] || currencyCode;
             return `${symbol} ${amount.toFixed(2)}`;
        }
    }

     /** Format number as percentage using Intl.NumberFormat */
    function formatPercent(rate) {
        if (isNaN(rate) || rate === null) return '--'; // Handle invalid input
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'percent',
                minimumFractionDigits: 2,
                maximumFractionDigits: 4 // Allow more precision for EAR
            }).format(rate);
        } catch (e) {
            console.warn(`Percent formatting failed for ${rate}. Using fallback.`, e);
            return `${(rate * 100).toFixed(2)}%`;
        }
    }

    /** Check if a date string represents a valid date */
    function isValidDate(dateString) {
        // Check if the string is non-empty and the Date object is valid
        return dateString && !isNaN(new Date(dateString).getTime());
    }

    /** Show validation error message for an input */
    function showError(inputElement, message) {
         const formGroup = inputElement.closest('.form-group');
         if (!formGroup) return;
         // Find the error message span specifically linked or the generic one
         let errorElement = formGroup.querySelector(`#${inputElement.id}-error`);
         if (!errorElement) {
            errorElement = formGroup.querySelector('.error-message'); // Fallback
         }

         inputElement.classList.add('is-invalid');
         inputElement.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = message;
            // Ensure the error message has an ID and input describes it
             if (!errorElement.id && inputElement.id) {
                errorElement.id = inputElement.id + '-error';
             }
             if(errorElement.id) {
                inputElement.setAttribute('aria-describedby', errorElement.id);
             }
        }
    }

    /** Clear validation error message for an input */
    function clearError(inputElement) {
         const formGroup = inputElement.closest('.form-group');
         if (!formGroup) return;
         const errorElement = formGroup.querySelector(`#${inputElement.id}-error`) || formGroup.querySelector('.error-message');

         inputElement.classList.remove('is-invalid');
         inputElement.removeAttribute('aria-invalid');
         inputElement.removeAttribute('aria-describedby'); // Remove direct link first
        if (errorElement) {
            errorElement.textContent = '';
             // Check if other descriptions exist (like info button tooltip) and re-add if needed
             // This part can be complex; simpler to just remove for now.
             // For robust accessibility, manage multiple describedby IDs.
        }
    }

    /** Clear all validation errors within a container */
    function clearAllErrors(formContainer) {
        formContainer.querySelectorAll('.is-invalid').forEach(input => clearError(input));
        // Clear general aggregation error
        if(dom.aggregationError) dom.aggregationError.textContent = '';
    }

    /** Calculate time difference between two dates in years */
    function getTimeInYears(startDateStr, endDateStr) {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        // Ensure dates are valid and end is after start
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
            return 0;
        }
        // More precise calculation using milliseconds difference
        const diffMillis = end.getTime() - start.getTime();
        const years = diffMillis / (1000 * 60 * 60 * 24 * 365.2425); // Average days/year incl. leap years
        return years;
    }

     /** Calculate time in years from a duration value and unit */
     function getDurationInYears(value, unit) {
         if (isNaN(value) || value <= 0) return 0;
         switch (unit) {
            case 'years': return value;
            case 'months': return value / 12;
            case 'days': return value / 365.2425; // Use consistent average
            default:
                console.warn(`Unknown duration unit: ${unit}`);
                return 0;
        }
     }

    /** Convert an interest rate (as decimal) based on its period to an equivalent annual rate (APR) */
    function getAnnualRate(rateDecimal, ratePeriod) {
        if (isNaN(rateDecimal) || rateDecimal <= 0) return 0;
        switch (ratePeriod) {
            case 'annual': return rateDecimal;
            case 'semi-annual': return rateDecimal * 2;
            case 'quarterly': return rateDecimal * 4;
            case 'monthly': return rateDecimal * 12;
            default:
                console.warn(`Unknown rate period: ${ratePeriod}. Assuming annual.`);
                return rateDecimal;
        }
    }

    /** Get the number of compounding periods per year based on frequency */
    function getCompoundsPerYear(compoundingFrequency) {
        switch (compoundingFrequency) {
            case 'annually': return 1;
            case 'semi-annually': return 2;
            case 'quarterly': return 4;
            case 'monthly': return 12;
            case 'daily': return 365; // Common convention
            default:
                console.warn(`Unknown compounding frequency: ${compoundingFrequency}. Assuming annually.`);
                return 1;
        }
    }

     /** Calculate Simple Interest */
    function calculateSimpleInterest(principal, annualRate, timeInYears) {
        if (principal < 0 || annualRate <= 0 || timeInYears <= 0) {
            return { interest: 0, finalAmount: Math.max(0, principal) }; // Return non-negative principal
        }
        const interest = principal * annualRate * timeInYears;
        return {
            interest: interest,
            finalAmount: principal + interest,
        };
    }

     /** Calculate Compound Interest */
     function calculateCompoundInterest(principal, annualRate, timeInYears, compoundsPerYear) {
         if (principal < 0 || annualRate <= 0 || timeInYears <= 0 || compoundsPerYear <= 0) {
             return { interest: 0, finalAmount: Math.max(0, principal) };
         }
         // Ensure compoundsPerYear is at least 1
         compoundsPerYear = Math.max(1, compoundsPerYear);
         const ratePerPeriod = annualRate / compoundsPerYear;
         const numberOfPeriods = timeInYears * compoundsPerYear;
         // A = P (1 + r/n)^(nt)
         const finalAmount = principal * Math.pow((1 + ratePerPeriod), numberOfPeriods);
         const interest = finalAmount - principal;
         return {
            interest: interest,
            finalAmount: finalAmount,
        };
    }

     /** Calculate Effective Annual Rate (EAR) or Annual Percentage Yield (APY) */
     function calculateEAR(annualRate, compoundsPerYear) {
         if (annualRate <= 0 || compoundsPerYear <= 0) return 0;
         compoundsPerYear = Math.max(1, compoundsPerYear);
         // EAR = (1 + (nominal_rate / n))^n - 1
         const ear = Math.pow((1 + (annualRate / compoundsPerYear)), compoundsPerYear) - 1;
         return ear;
     }

    /** Currency Conversion Helper (Using Placeholder Rates) */
    function convertCurrency(amount, fromCurrency, toCurrency) {
         // ** Placeholder Logic - Replace with API call **
         if (fromCurrency === toCurrency) return amount;

         const fromRate = CONFIG.EXCHANGE_RATES[fromCurrency];
         const toRate = CONFIG.EXCHANGE_RATES[toCurrency];

         if (fromRate === undefined || toRate === undefined || fromRate === 0) {
             console.error(`Missing or invalid exchange rate for ${fromCurrency} or ${toCurrency}`);
             // Show error in UI where appropriate
             if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError;
             return NaN; // Signal error
         }

         // Convert amount to NGN (base) first, then to target currency
         const amountInNGN = amount / fromRate;
         const amountInTarget = amountInNGN * toRate;

         // Clear potential previous error message if successful
         if(dom.aggregationError) dom.aggregationError.textContent = '';
         return amountInTarget;
    }

    /** Validate and get form data for a specific entry container (fieldset or simple mode div) */
    function getFormData(containerElement) {
         const data = {};
         const inputs = containerElement.querySelectorAll('input[name], select[name]');
         let isValid = true;
         clearAllErrors(containerElement); // Clear previous errors within this container

         // Determine time method for this container
         const timeMethodRadio = containerElement.querySelector(`input[name^="timeMethod-"]:checked`);
         const isDatesMethod = timeMethodRadio?.value === 'dates';
         // Determine interest type for this container
         const interestTypeSelect = containerElement.querySelector('select[name^="type-"]');
         const isSimpleInterest = interestTypeSelect?.value === 'simple';

         inputs.forEach(input => {
             const name = input.name.replace(/-\d+$/, '').replace('-simple', ''); // Get generic name
             let skipValidation = false;

             // Skip hidden fields based on selections
             const isDurationInput = input.closest('.duration-container') !== null;
             const isDateInput = input.closest('.dates-container') !== null;
             const isCompoundingInput = input.closest('.compounding-group') !== null;

             if (isDurationInput && isDatesMethod) skipValidation = true;
             if (isDateInput && !isDatesMethod) skipValidation = true;
             if (isCompoundingInput && isSimpleInterest) skipValidation = true;

             if (!skipValidation && !validateInput(input)) {
                isValid = false;
             }
             // Store value regardless of validation for potential later use, parse number
             data[name] = input.type === 'number' ? parseFloat(input.value) : input.value;
         });

         // Additional Validation: Date order (only if dates method is selected)
         if (isDatesMethod) {
            const startDateInput = containerElement.querySelector('input[name^="start-date"]');
            const endDateInput = containerElement.querySelector('input[name^="end-date"]');
            if (startDateInput && endDateInput && startDateInput.value && endDateInput.value) {
                if (!isValidDate(startDateInput.value)) {
                    showError(startDateInput, CONFIG.ERROR_MESSAGES.dateInvalid);
                    isValid = false;
                }
                if (!isValidDate(endDateInput.value)) {
                    showError(endDateInput, CONFIG.ERROR_MESSAGES.dateInvalid);
                    isValid = false;
                }
                // Only check order if both dates are individually valid
                if (isValidDate(startDateInput.value) && isValidDate(endDateInput.value) &&
                    new Date(endDateInput.value) <= new Date(startDateInput.value)) {
                    showError(endDateInput, CONFIG.ERROR_MESSAGES.dateOrder);
                    isValid = false;
                }
            }
         }

         // Ensure numbers are not NaN after parseFloat if they were required
         ['principal', 'rate', 'duration-value'].forEach(numField => {
            if(data[numField] !== undefined && isNaN(data[numField])) {
                const inputEl = containerElement.querySelector(`[name^="${numField}-"]`);
                if(inputEl && inputEl.required && !skipValidation) { // Check skipValidation again
                     // Find correct error message based on field
                     let errorMsg = 'Please enter a valid number.';
                     if (numField === 'principal') errorMsg = CONFIG.ERROR_MESSAGES.numberZeroPositive;
                     else if (numField === 'rate') errorMsg = CONFIG.ERROR_MESSAGES.ratePositive;
                     else if (numField === 'duration-value') errorMsg = CONFIG.ERROR_MESSAGES.durationPositive;
                     showError(inputEl, errorMsg);
                     isValid = false;
                }
            }
         });


        return isValid ? data : null; // Return data only if fully valid
    }

    /** Basic Input Validation (called by getFormData) */
    function validateInput(input) {
        clearError(input); // Clear previous error first
        const value = input.value.trim();
        const name = input.name;
        let isValid = true;

        // Check required fields
        if (input.required && !value) {
            showError(input, CONFIG.ERROR_MESSAGES.required);
            isValid = false;
        // Check number types
        } else if (input.type === 'number') {
           const numValue = parseFloat(value);
           const min = parseFloat(input.min);
           // Check if it's actually a number
           if (isNaN(numValue)) {
                showError(input, 'Please enter a valid number.'); isValid = false;
           // Check min value constraint (usually 0)
           } else if (input.hasAttribute('min') && !isNaN(min) && numValue < min) {
                const msg = (min === 0 && !name?.includes('rate')) ? CONFIG.ERROR_MESSAGES.numberZeroPositive : CONFIG.ERROR_MESSAGES.numberPositive;
                showError(input, msg);
                isValid = false;
            // Specific check for rate > 0
            } else if (name?.includes('rate') && numValue <= 0 && input.required) {
                 showError(input, CONFIG.ERROR_MESSAGES.ratePositive); isValid = false;
            // Specific check for duration > 0 (if using duration method)
           } else if (name?.includes('duration-value') && numValue <= 0 && input.required) {
                 // Check if duration method is actually selected before showing error
                 const container = input.closest('fieldset.entry, div#simple-mode');
                 const timeMethodRadio = container?.querySelector(`input[name^="timeMethod-"]:checked`);
                 if (timeMethodRadio?.value === 'duration') {
                     showError(input, CONFIG.ERROR_MESSAGES.durationPositive); isValid = false;
                 }
           }
        // Check date types (basic validity, order checked in getFormData)
        } else if (input.type === 'date' && input.required && value && !isValidDate(value)) {
             showError(input, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false;
        }
        // Add checks for select elements if needed (e.g., ensure a non-default value is chosen if required)

        return isValid;
   }


    /** Create chart data based on a single calculation result */
     function createChartData(calcResult) {
         const labels = [];
         const principalData = [];
         const interestData = [];
         const totalData = [];
         const steps = 20; // Number of points on the chart

         // Use the validated inputs and calculated time from the result object
         const { inputs, principal, timeInYears } = calcResult;
         if (!inputs || timeInYears <= 0) return null; // Can't chart without valid inputs/time

         const { annualRate, interestType, compoundsPerYear } = inputs; // Get calculation parameters

         for (let i = 0; i <= steps; i++) {
             const currentYearFraction = (timeInYears / steps) * i;
             // Format label based on total duration
             let yearLabel = currentYearFraction.toFixed(1);
             if (timeInYears < 1) {
                yearLabel = (currentYearFraction * 12).toFixed(1) + " Mo"; // Show months if less than a year
             } else if (timeInYears < 0.1) {
                 yearLabel = (currentYearFraction * 365.2425).toFixed(0) + " Day"; // Show days if very short
             } else {
                 yearLabel = yearLabel + " Yr";
             }
             labels.push(yearLabel);

             principalData.push(principal); // Principal is constant

             let stepResult;
             if (interestType === 'simple') {
                 stepResult = calculateSimpleInterest(principal, annualRate, currentYearFraction);
             } else {
                 // Use validated inputs directly
                 stepResult = calculateCompoundInterest(principal, annualRate, currentYearFraction, compoundsPerYear);
             }
             interestData.push(stepResult.interest);
             totalData.push(stepResult.finalAmount);
         }

         return {
            labels,
            datasets: [
                 // Reversed order for better stacking visibility
                 { label: 'Interest', data: interestData, borderColor: CONFIG.CHART_COLORS.interest, backgroundColor: CONFIG.CHART_COLORS.interest, fill: true, pointRadius: 1, tension: 0.1, order: 2 },
                 { label: 'Principal', data: principalData, borderColor: CONFIG.CHART_COLORS.principal, backgroundColor: CONFIG.CHART_COLORS.principal, fill: true, pointRadius: 1, tension: 0.1, order: 3 },
                 { label: 'Total Value', data: totalData, borderColor: CONFIG.CHART_COLORS.borderColor, backgroundColor: 'transparent', // Total line only
                   fill: false, pointRadius: 2, borderWidth: 2, tension: 0.1, order: 1 } // Draw total line on top
             ]
         };
     }

     /** Create chart data for aggregated results (Advanced Mode) */
     function createAggregateChartData(aggregatedResult, individualResults) {
        if (!aggregatedResult || aggregatedResult.principalNGN <= 0 || individualResults.length === 0) return null;

        const labels = [];
        const principalData = [];
        const interestData = [];
        const totalData = [];
        const steps = 20;

        // Determine the maximum time duration from all individual calculations
        const maxTimeInYears = individualResults.reduce((max, res) => Math.max(max, res.summary?.timeInYears || 0), 0);
        if (maxTimeInYears <= 0) return null;

        const basePrincipal = aggregatedResult.principalNGN;
        // Use blended EAR as the effective rate for the aggregate chart
        const effectiveAnnualRate = aggregatedResult.blendedEAR;
        // Assume monthly compounding for the aggregate view for simplicity, or derive it? Let's stick to monthly.
        const aggregateCompoundsPerYear = 12;

        for (let i = 0; i <= steps; i++) {
            const currentYearFraction = (maxTimeInYears / steps) * i;
            let yearLabel = currentYearFraction.toFixed(1);
             if (maxTimeInYears < 1) {
                yearLabel = (currentYearFraction * 12).toFixed(1) + " Mo";
             } else if (maxTimeInYears < 0.1) {
                 yearLabel = (currentYearFraction * 365.2425).toFixed(0) + " Day";
             } else {
                 yearLabel = yearLabel + " Yr";
             }
            labels.push(yearLabel);

            principalData.push(basePrincipal); // Base principal remains constant

            // Calculate aggregate growth using compound interest formula with blended EAR
            const stepResult = calculateCompoundInterest(
                basePrincipal,
                effectiveAnnualRate,
                currentYearFraction,
                aggregateCompoundsPerYear
            );

            interestData.push(stepResult.interest);
            totalData.push(stepResult.finalAmount);
        }

         return {
            labels,
            datasets: [
                 { label: 'Total Interest', data: interestData, borderColor: CONFIG.CHART_COLORS.interest, backgroundColor: CONFIG.CHART_COLORS.interest, fill: true, pointRadius: 1, tension: 0.1, order: 2 },
                 { label: 'Total Principal (NGN Base)', data: principalData, borderColor: CONFIG.CHART_COLORS.principal, backgroundColor: CONFIG.CHART_COLORS.principal, fill: true, pointRadius: 1, tension: 0.1, order: 3 },
                 { label: 'Aggregated Value (NGN Base)', data: totalData, borderColor: CONFIG.CHART_COLORS.borderColor, backgroundColor: 'transparent', fill: false, pointRadius: 2, borderWidth: 2, tension: 0.1, order: 1 }
             ]
         };
     }


    /** Update or create the chart */
    function updateChart(chartData, displayCurrency) {
         dom.chartArea.hidden = !chartData;
         if (!chartData || !dom.chartCanvas) return;

         const ctx = dom.chartCanvas.getContext('2d');

         // Function to format labels/tooltips with the correct currency
         const getTooltipLabel = (context) => {
             let label = context.dataset.label || '';
             if (label) label += ': ';
             if (context.parsed.y !== null) {
                 label += formatCurrency(context.parsed.y, displayCurrency);
             }
             return label;
         };
         const getYAxisTick = (value) => formatCurrency(value, displayCurrency);

         if (interestChart) { // Update existing chart
             interestChart.data = chartData;
             interestChart.options.scales.y.ticks.callback = getYAxisTick;
             interestChart.options.plugins.tooltip.callbacks.label = getTooltipLabel;
             interestChart.update();
         } else { // Create new chart
             interestChart = new Chart(ctx, {
                 type: 'line',
                 data: chartData,
                 options: {
                     responsive: true,
                     maintainAspectRatio: false, // Allows height setting via CSS
                     scales: {
                         y: {
                             beginAtZero: true,
                             ticks: { callback: getYAxisTick }
                         },
                         x: {
                            title: { display: true, text: 'Time' }
                         }
                     },
                     plugins: {
                         legend: { position: 'bottom' },
                         tooltip: {
                             mode: 'index',
                             intersect: false,
                             callbacks: { label: getTooltipLabel }
                         }
                     },
                     interaction: { mode: 'nearest', axis: 'x', intersect: false }
                 }
             });
         }
     }

    /** Display results based on the mode and calculated data */
     function displayResults(resultsData) {
         hideAllResultDisplays(); // Hide all first
         calculationResultsCache = resultsData; // Store the latest results

         dom.resultsArea.hidden = false;
         dom.printResultsBtn.disabled = false;

         let chartData = null;
         let displayCurrency = CONFIG.DEFAULT_CURRENCY;

         if (resultsData.mode === 'simple' && resultsData.summary) {
             displaySimpleResults(resultsData.summary);
             chartData = createChartData(resultsData.summary);
             displayCurrency = resultsData.summary.inputs.currency;
         } else if (resultsData.mode === 'advanced' && resultsData.individual.length > 0) {
             displayAdvancedResults(resultsData.individual, resultsData.aggregated);
             // Chart the aggregate data if available
             chartData = createAggregateChartData(resultsData.aggregated, resultsData.individual);
             // Currency for aggregate chart is NGN base, but displayed based on selector
             displayCurrency = dom.aggregationCurrencySelect.value;
         }

         // Create/Update Chart
         // Use a small timeout to ensure the canvas is visible before drawing
         setTimeout(() => {
            updateChart(chartData, displayCurrency);
         }, CONFIG.RESULTS_VISIBILITY_DELAY);


         // Scroll to results smoothly
         dom.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
     }

     /** Hide all results sections and disable print button */
     function hideAllResultDisplays() {
         dom.resultsArea.hidden = true;
         dom.simpleResultsDisplay.hidden = true;
         dom.advancedResultsDisplay.hidden = true;
         dom.chartArea.hidden = true;
         dom.printResultsBtn.disabled = true;
         calculationResultsCache = null; // Clear cache

         // Optionally clear chart data immediately
         if (interestChart) {
             interestChart.data.labels = [];
             interestChart.data.datasets = [];
             interestChart.update('none'); // Update without animation
         }
     }

    /** Populate the simple results display */
    function displaySimpleResults(summary) {
        const { principal, interest, finalAmount, ear, inputs } = summary;
        const currency = inputs.currency;

        dom.resultSimplePrincipal.textContent = formatCurrency(principal, currency);
        dom.resultSimpleInterest.textContent = formatCurrency(interest, currency);
        dom.resultSimpleFinal.textContent = formatCurrency(finalAmount, currency);
        dom.resultSimpleEar.textContent = formatPercent(ear); // EAR is rate, not currency

        dom.simpleResultsDisplay.hidden = false;
    }

     /** Populate the advanced results display (individual and aggregated) */
     function displayAdvancedResults(individualResults, aggregatedData) {
         // Display Individual Results
         dom.advancedIndividualResultsContainer.innerHTML = ''; // Clear previous
         individualResults.forEach((entryResult, index) => {
             const { principal, interest, finalAmount, ear, inputs } = entryResult.summary;
             const currency = inputs.currency;
             const entryDiv = document.createElement('div');
             entryDiv.className = 'entry-result';
             entryDiv.innerHTML = `
                 <h4 id="adv-result-heading-${index + 1}">Calculation #${index + 1} (${currency})</h4>
                 <div class="result-item" aria-labelledby="adv-result-heading-${index + 1}">
                     <span class="label">Principal:</span>
                     <strong class="value">${formatCurrency(principal, currency)}</strong>
                 </div>
                 <div class="result-item" aria-labelledby="adv-result-heading-${index + 1}">
                     <span class="label">Interest:</span>
                     <strong class="value">${formatCurrency(interest, currency)}</strong>
                 </div>
                 <div class="result-item ear" aria-labelledby="adv-result-heading-${index + 1}">
                     <span class="label">EAR:</span>
                     <strong class="value">${formatPercent(ear)}</strong>
                 </div>
                 <div class="result-item total" aria-labelledby="adv-result-heading-${index + 1}">
                     <span class="label">Final Amount:</span>
                     <strong class="value">${formatCurrency(finalAmount, currency)}</strong>
                 </div>`;
             dom.advancedIndividualResultsContainer.appendChild(entryDiv);
         });

         // Display Aggregated Results (using the current selector value)
         dom.aggregationCurrencySelect.disabled = false;
         updateAggregatedDisplay(); // Calls displayAggregatedResults with current selection

         dom.advancedResultsDisplay.hidden = false;
     }

     /** Updates only the aggregated part based on selected currency */
     function updateAggregatedDisplay() {
         if (!calculationResultsCache || calculationResultsCache.mode !== 'advanced' || !calculationResultsCache.aggregated) {
            // Clear aggregated results if cache is invalid or missing data
            dom.resultAggPrincipal.textContent = '--';
            dom.resultAggInterest.textContent = '--';
            dom.resultAggFinal.textContent = '--';
            dom.resultAggEar.textContent = '--';
            if(dom.aggregationError) dom.aggregationError.textContent = '';
            dom.aggregationCurrencySelect.disabled = true;
            return;
        }

         const aggregatedData = calculationResultsCache.aggregated;
         const targetCurrency = dom.aggregationCurrencySelect.value;

         if (isNaN(aggregatedData.principalNGN) || isNaN(aggregatedData.interestNGN) || isNaN(aggregatedData.finalAmountNGN)) {
             console.warn("Aggregated NGN data is invalid.");
             dom.resultAggPrincipal.textContent = 'Error';
             dom.resultAggInterest.textContent = 'Error';
             dom.resultAggFinal.textContent = 'Error';
             dom.resultAggEar.textContent = '--';
             if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError; // Indicate NGN calc issue
             dom.aggregationCurrencySelect.disabled = true; // Disable selector if base calc failed
             return;
         }

         // Attempt conversion
         const principal = convertCurrency(aggregatedData.principalNGN, 'NGN', targetCurrency);
         const interest = convertCurrency(aggregatedData.interestNGN, 'NGN', targetCurrency);
         const finalAmount = convertCurrency(aggregatedData.finalAmountNGN, 'NGN', targetCurrency);
         const blendedEAR = aggregatedData.blendedEAR; // EAR is currency independent

         // Display results or conversion error message
         const displayOrError = (value) => isNaN(value) ? 'Conv. Error' : formatCurrency(value, targetCurrency);

         dom.resultAggPrincipal.textContent = displayOrError(principal);
         dom.resultAggInterest.textContent = displayOrError(interest);
         dom.resultAggFinal.textContent = displayOrError(finalAmount);
         dom.resultAggEar.textContent = formatPercent(blendedEAR);

         dom.aggregationCurrencySelect.disabled = false; // Ensure enabled if we have data

         // Update chart currency display if visible and chart exists
         if (interestChart && !dom.chartArea.hidden) {
             // Aggregate chart uses NGN base but displays in target currency
             const chartCurrency = dom.aggregationCurrencySelect.value;
             interestChart.options.scales.y.ticks.callback = value => formatCurrency(value, chartCurrency);
             interestChart.options.plugins.tooltip.callbacks.label = context => {
                 let label = context.dataset.label || ''; if (label) label += ': ';
                 if (context.parsed.y !== null) label += formatCurrency(context.parsed.y, chartCurrency);
                 return label;
             };
             interestChart.update('none'); // Update without animation
         }
     }


     // --- Main Calculation Orchestration ---
     const debouncedCalculateAndDisplay = debounce(calculateAndDisplay, CONFIG.DEBOUNCE_DELAY);

    /** Validates inputs, performs calculations, and triggers display */
    function calculateAndDisplay() {
        console.log("Calculating...");
        // Don't hide results immediately, wait until we know if new results are valid
        // hideAllResultDisplays(); // Hide old results immediately - Moved display call handles this
        clearAllErrors(dom.form); // Clear previous validation errors on the whole form

        let overallValid = true;
        let resultsData = {
            mode: currentMode,
            summary: null,    // For simple mode summary {inputs, principal, interest, finalAmount, ear, timeInYears}
            individual: [],   // For advanced mode individual entry results [{inputs, summary}]
            aggregated: null, // For advanced mode aggregated { principalNGN, interestNGN, finalAmountNGN, blendedEAR }
        };

        if (currentMode === 'simple') {
             const data = getFormData(dom.simpleModeContainer);
             if (data) {
                 resultsData.summary = performCalculation(data);
             } else {
                 overallValid = false;
                 console.log("Simple mode validation failed.");
             }
        } else { // Advanced Mode
            let totalPrincipalNGN = 0;
            let totalInterestNGN = 0;
            let totalFinalAmountNGN = 0;
            let conversionPossible = true; // Track if all conversions work
            const entries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)');

             for (let i = 0; i < entries.length; i++) {
                 const entry = entries[i];
                 const entryData = getFormData(entry);
                 if (entryData) {
                     const entryCalcResult = performCalculation(entryData);
                     resultsData.individual.push({ inputs: entryData, summary: entryCalcResult });

                     // Accumulate NGN equivalents for aggregation
                     const principalNGN = convertCurrency(entryCalcResult.principal, entryData.currency, 'NGN');
                     const interestNGN = convertCurrency(entryCalcResult.interest, entryData.currency, 'NGN');
                     const finalAmountNGN = convertCurrency(entryCalcResult.finalAmount, entryData.currency, 'NGN');

                     // Check for conversion errors
                     if (isNaN(principalNGN) || isNaN(interestNGN) || isNaN(finalAmountNGN)) {
                         conversionPossible = false;
                         console.warn(`Currency conversion failed for entry ${i+1}`);
                         // Optionally show error near the entry or in aggregation area
                     } else {
                         totalPrincipalNGN += principalNGN;
                         totalInterestNGN += interestNGN;
                         totalFinalAmountNGN += finalAmountNGN;
                     }

                 } else {
                     overallValid = false;
                     console.log(`Advanced mode validation failed for entry ${i + 1}`);
                 }
             }

             // Only calculate aggregate totals if all entries were valid and conversion was possible
             if (overallValid && conversionPossible && resultsData.individual.length > 0) {
                 // Calculate blended EAR (weighted by NGN principal)
                 let weightedEARSum = 0;
                 resultsData.individual.forEach(res => {
                     // Recalculate NGN principal for weighting (avoid re-calling conversion if possible)
                     const principalNGN = convertCurrency(res.summary.principal, res.inputs.currency, 'NGN');
                     if (!isNaN(principalNGN) && totalPrincipalNGN > 0) {
                         // Weight EAR by this entry's principal contribution to the total NGN principal
                         weightedEARSum += res.summary.ear * (principalNGN / totalPrincipalNGN);
                     }
                 });

                 resultsData.aggregated = {
                     principalNGN: totalPrincipalNGN,
                     interestNGN: totalInterestNGN,
                     finalAmountNGN: totalFinalAmountNGN,
                     blendedEAR: totalPrincipalNGN > 0 ? weightedEARSum : 0
                 };
             } else {
                 resultsData.aggregated = null; // Indicate aggregation failed or not possible
                 if (!conversionPossible && overallValid) {
                     // If validation passed but conversion failed, show aggregation error specifically
                     if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError;
                 }
             }
         }

         // If overall validation passed, display results, otherwise hide results area
         if (overallValid && (resultsData.summary || resultsData.individual.length > 0)) {
             displayResults(resultsData);
         } else {
             hideAllResultDisplays(); // Hide results if validation failed
             console.log("Calculation prevented due to validation errors or lack of valid data.");
         }
     }

    /** Perform calculation for a single validated data set */
    function performCalculation(validatedData) {
         const { currency, principal, rate, ratePeriod, interestType, compounding,
                 timeMethod, startDate, endDate, durationValue, durationUnit } = validatedData;

         // Rate was already validated as > 0 if required
         const rateDecimal = rate / 100;
         const annualRate = getAnnualRate(rateDecimal, ratePeriod); // Converts to APR

         let timeInYears = 0;
         if (timeMethod === 'dates') {
             timeInYears = getTimeInYears(startDate, endDate);
         } else { // duration
             timeInYears = getDurationInYears(durationValue, durationUnit);
         }

         let interest = 0, finalAmount = principal, ear = 0;
         const compoundsPerYear = getCompoundsPerYear(compounding);

         if (interestType === 'simple') {
             const result = calculateSimpleInterest(principal, annualRate, timeInYears);
             interest = result.interest;
             finalAmount = result.finalAmount;
             ear = annualRate; // EAR for simple interest is just the APR
         } else { // compound
             const result = calculateCompoundInterest(principal, annualRate, timeInYears, compoundsPerYear);
             interest = result.interest;
             finalAmount = result.finalAmount;
             ear = calculateEAR(annualRate, compoundsPerYear); // Calculate actual EAR/APY
         }

         // Return a summary object including inputs used
         return {
             inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear }, // Store derived values too
             principal: principal,
             interest: interest,
             finalAmount: finalAmount,
             ear: ear,
             timeInYears: timeInYears // Also keep top-level for convenience
         };
     }

    // --- Event Handlers ---

    /** Handle clicks on the mode toggle buttons */
    function handleModeToggleClick(event) {
        const clickedButton = event.currentTarget;
        const selectedMode = clickedButton.dataset.mode;

        if (selectedMode === currentMode) return; // No change

        currentMode = selectedMode;

        // Update button states (active class and aria-checked)
        dom.modeToggleSimple.classList.toggle('active', selectedMode === 'simple');
        dom.modeToggleSimple.setAttribute('aria-checked', String(selectedMode === 'simple'));
        dom.modeToggleAdvanced.classList.toggle('active', selectedMode === 'advanced');
        dom.modeToggleAdvanced.setAttribute('aria-checked', String(selectedMode === 'advanced'));

        // Show/hide mode containers
        dom.simpleModeContainer.hidden = (selectedMode !== 'simple');
        dom.advancedModeContainer.hidden = (selectedMode !== 'advanced');

        // If switching to advanced, ensure at least one entry exists
        if (selectedMode === 'advanced' && dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)').length === 0) {
            addEntry(); // Add the first entry automatically
        }

        // Clear errors from the entire form and hide results when switching modes
        clearAllErrors(dom.form);
        hideAllResultDisplays();
        // Optional: Trigger calculation update for the newly visible mode's defaults
        // calculateAndDisplay(); // Or wait for user interaction
    }

    /** Handle changes in form inputs (input, change events) */
    function handleInputChange(event) {
         const input = event.target;
         const container = input.closest('fieldset.entry, div#simple-mode'); // Find parent container
         if(!container) return;

         // --- Immediate UI Updates ---

         // Update currency symbol if currency select changes
         if (input.matches('select[name^="currency-"]')) {
             const symbolSpan = container.querySelector('.principal-group .currency-symbol');
             const selectedOption = input.options[input.selectedIndex];
             // Extract symbol from text like "NGN (₦)" using regex
             const symbolText = selectedOption.textContent.match(/\(([^)]+)\)/)?.[1];
             if (symbolSpan && symbolText) {
                 symbolSpan.textContent = symbolText;
             }
         }

         // Toggle compounding field visibility based on interest type select
         if (input.matches('select[name^="type-"]')) {
             const compoundingGroup = container.querySelector('.compounding-group');
             if(compoundingGroup) {
                compoundingGroup.hidden = (input.value === 'simple');
                // If hiding, clear potential errors on the compounding select
                if (compoundingGroup.hidden) {
                    clearError(compoundingGroup.querySelector('select'));
                }
             }
         }

         // Toggle date/duration input sections based on time method radio
         if (input.matches('input[name^="timeMethod-"]')) {
             const datesContainer = container.querySelector('.dates-container');
             const durationContainer = container.querySelector('.duration-container');
             const useDates = (input.value === 'dates');

             if(datesContainer) datesContainer.hidden = !useDates;
             if(durationContainer) durationContainer.hidden = useDates;

             // Clear errors from the section being hidden
             const sectionToClear = useDates ? durationContainer : datesContainer;
             sectionToClear?.querySelectorAll('input, select').forEach(el => clearError(el));
         }

         // --- Debounced Calculation ---
         // Trigger calculation after a short delay following input changes
         debouncedCalculateAndDisplay();
    }

    /** Add a new entry fieldset in advanced mode */
     function addEntry() {
         const currentEntries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)').length;
         if (currentEntries >= CONFIG.MAX_ADVANCED_ENTRIES) {
             // Optionally show a more graceful message than alert
             alert(CONFIG.ERROR_MESSAGES.maxEntries);
             return;
         }
         advancedEntryCounter++; // Increment unique ID counter

         const newEntry = dom.entryTemplate.cloneNode(true); // Deep clone the template
         newEntry.hidden = false;
         newEntry.classList.remove('entry-template');
         const entryId = advancedEntryCounter; // Use counter for unique ID
         newEntry.id = `entry-${entryId}`;
         newEntry.dataset.entryId = entryId; // Store ID in data attribute
         newEntry.setAttribute('aria-labelledby', `entry-legend-${entryId}`);


         // --- Update IDs, names, labels, and aria attributes ---
         const updateAttribute = (element, attrPrefix) => {
             const attrName = `${attrPrefix}-{id}`;
             if (element.hasAttribute(attrName)) {
                 element.setAttribute(attrPrefix, element.getAttribute(attrName).replace('{id}', entryId));
                 element.removeAttribute(attrName); // Clean up template attribute
             } else if (element.id?.includes('{id}')) {
                 element.id = element.id.replace('{id}', entryId);
             }
             if (element.name?.includes('{id}')) {
                 element.name = element.name.replace('{id}', entryId);
             }
             if (element.htmlFor?.includes('{id}')) {
                 element.htmlFor = element.htmlFor.replace('{id}', entryId);
             }
             if (element.getAttribute('aria-label')?.includes('{id}')) {
                 element.setAttribute('aria-label', element.getAttribute('aria-label').replace('{id}', entryId));
             }
             if (element.getAttribute('aria-labelledby')?.includes('{id}')) {
                 element.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby').replace('{id}', entryId));
             }
             if (element.getAttribute('aria-describedby')?.includes('{id}')) {
                 element.setAttribute('aria-describedby', element.getAttribute('aria-describedby').replace('{id}', entryId));
             }
         };

         newEntry.querySelectorAll('[id*="{id}"], [name*="{id}"], [for*="{id}"], [aria-label*="{id}"], [aria-labelledby*="{id}"], [aria-describedby*="{id}"]').forEach(el => {
             updateAttribute(el, 'id'); // Update id first
             updateAttribute(el, 'name');
             updateAttribute(el, 'for');
             updateAttribute(el, 'aria-label');
             updateAttribute(el, 'aria-labelledby');
             updateAttribute(el, 'aria-describedby');
             // Special handling for elements with text content needing update
             if (el.classList.contains('entry-number')) el.textContent = entryId;
             if (el.id === `entry-legend-${entryId}`) el.id = `entry-legend-${entryId}`; // Fix legend id if querySelector included it
         });


         // --- Reset values to defaults ---
         // Use querySelector within the newEntry context
         newEntry.querySelector(`select[name="currency-${entryId}"]`).value = CONFIG.DEFAULT_CURRENCY;
         newEntry.querySelector(`input[name="principal-${entryId}"]`).value = CONFIG.DEFAULT_PRINCIPAL;
         newEntry.querySelector(`input[name="rate-${entryId}"]`).value = CONFIG.DEFAULT_RATE;
         newEntry.querySelector(`select[name="rate-period-${entryId}"]`).value = CONFIG.DEFAULT_RATE_PERIOD;
         newEntry.querySelector(`select[name="type-${entryId}"]`).value = CONFIG.DEFAULT_INTEREST_TYPE;
         newEntry.querySelector(`select[name="compounding-${entryId}"]`).value = CONFIG.DEFAULT_COMPOUNDING;
         newEntry.querySelector(`.principal-group .currency-symbol`).textContent = '₦'; // Default NGN symbol
         // Time inputs
         const timeMethodRadios = newEntry.querySelectorAll(`input[name="timeMethod-${entryId}"]`);
         timeMethodRadios.forEach(radio => radio.checked = (radio.value === 'dates')); // Default to dates
         newEntry.querySelector(`#dates-${entryId}-container`).hidden = false;
         newEntry.querySelector(`#duration-${entryId}-container`).hidden = true;
         newEntry.querySelector(`input[name="start-date-${entryId}"]`).value = ''; // Clear dates initially
         newEntry.querySelector(`input[name="end-date-${entryId}"]`).value = '';
         newEntry.querySelector(`input[name="duration-value-${entryId}"]`).value = CONFIG.DEFAULT_DURATION_VALUE;
         newEntry.querySelector(`select[name="duration-unit-${entryId}"]`).value = CONFIG.DEFAULT_DURATION_UNIT;
         setInitialDates(newEntry); // Set default dates after resetting radio

         // Ensure compounding field visibility matches default type
         const compoundingGroup = newEntry.querySelector('.compounding-group');
         if(compoundingGroup) compoundingGroup.hidden = (CONFIG.DEFAULT_INTEREST_TYPE === 'simple');


         // --- Attach Event Listeners ---
         newEntry.querySelectorAll('input, select').forEach(input => {
             input.addEventListener('input', handleInputChange); // Handles typing in text/number
             input.addEventListener('change', handleInputChange); // Handles select, date, radio changes
         });
         // Attach remove button listener
         const removeBtn = newEntry.querySelector('.remove-entry-btn');
         if (removeBtn) {
             removeBtn.hidden = false; // Show remove button for added entries
             removeBtn.addEventListener('click', handleRemoveEntryClick);
         }

         // Append the new entry to the container
         dom.advancedEntriesContainer.appendChild(newEntry);

         // Update UI states
         updateAdvancedEntryUI();
     }

    /** Remove an entry fieldset in advanced mode */
     function handleRemoveEntryClick(event) {
         const entryToRemove = event.currentTarget.closest('.entry');
         if (!entryToRemove) return;

         entryToRemove.remove(); // Remove from DOM

         // Update UI states (renumbering, button states)
         updateAdvancedEntryUI();

         // Recalculate results
         debouncedCalculateAndDisplay();
     }

     /** Update numbering, button states, and remove button visibility for advanced entries */
     function updateAdvancedEntryUI() {
         const remainingEntries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)');
         const entryCount = remainingEntries.length;

         remainingEntries.forEach((entry, index) => {
             const currentIdNum = index + 1;
             // Update legend number
             const numberSpan = entry.querySelector('.entry-number');
             if (numberSpan) numberSpan.textContent = currentIdNum;

             // Update remove button visibility and aria-label
             const removeBtn = entry.querySelector('.remove-entry-btn');
             if (removeBtn) {
                 removeBtn.hidden = (entryCount <= 1); // Hide if only one entry remains
                 removeBtn.setAttribute('aria-label', `Remove Calculation ${currentIdNum}`);
             }
             // No need to renumber IDs/names if listeners aren't dependent on them
         });

         // Update add button state
         dom.addEntryBtn.disabled = (entryCount >= CONFIG.MAX_ADVANCED_ENTRIES);
     }


    /** Handle the clear all button click */
     function handleClearFormClick() {
         dom.form.reset(); // Resets to initial HTML values

         // Clear errors and hide results display
         clearAllErrors(dom.form);
         hideAllResultDisplays();

         // Reset advanced entries if currently in advanced mode
         if (currentMode === 'advanced') {
             // Remove all but the first entry (template is already hidden)
             dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template):not(:first-of-type)').forEach(entry => entry.remove());
             advancedEntryCounter = 1; // Reset counter assuming one entry remains/is added back

             // Reset the first entry (or the only one left) to defaults
             const firstEntry = dom.advancedEntriesContainer.querySelector('.entry:not(.entry-template)');
             if (firstEntry) {
                 resetEntryToDefaults(firstEntry, 1); // Reset its values and state
             } else {
                 addEntry(); // Add the first entry back if it was somehow removed
             }
             updateAdvancedEntryUI(); // Update numbering and button states
         }

         // Explicitly reset UI elements potentially changed by JS in simple mode
         resetEntryToDefaults(dom.simpleModeContainer);

         console.log("Form Cleared");
         // Optionally trigger calculation with defaults, but usually better to show empty state
         // calculateAndDisplay();
    }

    /** Resets a specific container (simple mode or advanced entry) to default values/state */
    function resetEntryToDefaults(container, entryId = 'simple') {
        if (!container) return;

        // Reset simple fields to config defaults
        const currencySelect = container.querySelector(`select[name^="currency-"]`);
        const principalInput = container.querySelector(`input[name^="principal-"]`);
        const rateInput = container.querySelector(`input[name^="rate-"]`);
        const ratePeriodSelect = container.querySelector(`select[name^="rate-period-"]`);
        const typeSelect = container.querySelector(`select[name^="type-"]`);
        const compoundingSelect = container.querySelector(`select[name^="compounding-"]`);

        if (currencySelect) currencySelect.value = CONFIG.DEFAULT_CURRENCY;
        if (principalInput) principalInput.value = CONFIG.DEFAULT_PRINCIPAL;
        if (rateInput) rateInput.value = CONFIG.DEFAULT_RATE;
        if (ratePeriodSelect) ratePeriodSelect.value = CONFIG.DEFAULT_RATE_PERIOD;
        if (typeSelect) typeSelect.value = CONFIG.DEFAULT_INTEREST_TYPE;
        if (compoundingSelect) compoundingSelect.value = CONFIG.DEFAULT_COMPOUNDING;

        // Reset currency symbol
        const symbolSpan = container.querySelector('.principal-group .currency-symbol');
        if (symbolSpan) symbolSpan.textContent = '₦'; // Default NGN symbol

        // Reset time method to 'dates'
        const timeMethodRadios = container.querySelectorAll(`input[name^="timeMethod-${entryId}"]`);
        const datesContainer = container.querySelector(`#dates-${entryId}-container`);
        const durationContainer = container.querySelector(`#duration-${entryId}-container`);
        timeMethodRadios.forEach(radio => radio.checked = (radio.value === 'dates'));
        if (datesContainer) datesContainer.hidden = false;
        if (durationContainer) durationContainer.hidden = true;

        // Reset date/duration values
        setInitialDates(container); // Sets default dates
        const durationValueInput = container.querySelector(`input[name^="duration-value-"]`);
        const durationUnitSelect = container.querySelector(`select[name^="duration-unit-"]`);
        if (durationValueInput) durationValueInput.value = CONFIG.DEFAULT_DURATION_VALUE;
        if (durationUnitSelect) durationUnitSelect.value = CONFIG.DEFAULT_DURATION_UNIT;

        // Reset compounding visibility based on default type
        const compoundingGroup = container.querySelector('.compounding-group');
        if (compoundingGroup) compoundingGroup.hidden = (CONFIG.DEFAULT_INTEREST_TYPE === 'simple');
    }


    /** Handle form submission (using the Calculate button as submit) */
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent standard form submission
        console.log("Form submit triggered");
        calculateAndDisplay(); // Perform calculation and display results
    }


    /** Handle print results button click */
    function handlePrintResultsClick() {
        // Using simple window.print() relies on the print stylesheet (calculator-print.css)
        window.print();
    }

    /** Update results when aggregation currency changes */
    function handleAggregationCurrencyChange() {
         // Only need to update the display, not recalculate fully
         updateAggregatedDisplay();
    }

     /** Set default start/end dates (today to one year later) in a container */
     function setInitialDates(container) {
        if (!container) return;
        // Select inputs using attribute starts-with selector, robust to ID changes
        const startDateInput = container.querySelector('input[name^="start-date"]');
        const endDateInput = container.querySelector('input[name^="end-date"]');

        if (startDateInput && endDateInput) {
            const today = new Date();
            const oneYearLater = new Date(today); // Clone date object
            oneYearLater.setFullYear(today.getFullYear() + 1);

            // Format as YYYY-MM-DD for the input type="date"
            const formatDate = (date) => date.toISOString().split('T')[0];

            // Set only if currently empty, to avoid overwriting user input during resets?
            // Or always set for clarity on reset. Let's always set.
            startDateInput.value = formatDate(today);
            endDateInput.value = formatDate(oneYearLater);
         }
    }

     /** Update the copyright year in the footer */
    function updateCopyrightYear() {
        if (dom.currentYearSpan) {
            dom.currentYearSpan.textContent = new Date().getFullYear();
        }
    }

     // --- Initialization ---
    function init() {
        if (!cacheDOMElements()) return; // Stop if critical elements are missing

        // --- Set Initial State & Defaults ---
        dom.simpleModeContainer.hidden = false;
        dom.advancedModeContainer.hidden = true;
        resetEntryToDefaults(dom.simpleModeContainer); // Set defaults for simple mode
        hideAllResultDisplays(); // Ensure results are hidden initially

        // --- Attach Global Event Listeners ---
        dom.modeToggleSimple.addEventListener('click', handleModeToggleClick);
        dom.modeToggleAdvanced.addEventListener('click', handleModeToggleClick);

        // Use event delegation on the form for input changes for efficiency
        dom.form.addEventListener('input', handleInputChange); // Catches typing, etc.
        dom.form.addEventListener('change', handleInputChange); // Catches select, date, radio changes

        // Buttons
        dom.form.addEventListener('submit', handleFormSubmit); // Handle form submission via button
        dom.clearFormBtn.addEventListener('click', handleClearFormClick);
        dom.printResultsBtn.addEventListener('click', handlePrintResultsClick);
        dom.aggregationCurrencySelect.addEventListener('change', handleAggregationCurrencyChange);
        if (dom.addEntryBtn) dom.addEntryBtn.addEventListener('click', addEntry);

        // --- Initialize Advanced Mode State ---
        addEntry(); // Add the first advanced entry (it will be hidden initially if mode is simple)
        // The first entry's state is set within addEntry using resetEntryToDefaults

        // Update Copyright Year
        updateCopyrightYear();

        console.info("Interest Calculator Initialized.");
        // Optional: Perform initial calculation based on defaults?
        // calculateAndDisplay();
    }


    // --- Run Init on DOM Ready ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init(); // DOM already loaded
    }

})();
