/**
 * File Location: /assets/js/personal/calculator.js
 * Description: JavaScript logic for the ROFILID Interest Calculator Tool.
 *              Handles modes, inputs, calculations, results display, charting,
 *              and advanced entry management.
 * Version: 1.2.0 (Fixes calculation trigger, validation flow, NaN handling)
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
        // DEBOUNCE_DELAY: 400, // No longer needed for main calculation
        RESULTS_VISIBILITY_DELAY: 50,
        CHART_COLORS: {
            principal: 'rgba(203, 213, 225, 0.7)',    // slate-300
            interest: 'rgba(16, 185, 129, 0.7)',     // emerald-500
            total: 'rgba(13, 148, 136, 0.8)',       // teal-600
            borderColor: 'rgba(15, 118, 110, 1)', // teal-700
        },
        EXCHANGE_RATES: { // --- PLACEHOLDER RATES - MUST BE REPLACED ---
            NGN: 1, USD: 1 / 1450, EUR: 1 / 1550, GBP: 1 / 1800, JPY: 1 / 9.5, CNY: 1 / 200, CAD: 1 / 1080, AUD: 1 / 950,
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
            calculationError: 'Calculation failed. Check inputs.',
        }
    };

    // --- State Variables ---
    let currentMode = 'simple';
    let advancedEntryCounter = 0;
    let interestChart = null;
    let calculationResultsCache = null;

    // --- DOM Element Caching ---
    const dom = {};

    function cacheDOMElements() {
        dom.form = document.getElementById('calculator-form');
        dom.modeToggleSimple = document.getElementById('toggle-simple');
        dom.modeToggleAdvanced = document.getElementById('toggle-advanced');
        dom.simpleModeContainer = document.getElementById('simple-mode');
        dom.advancedModeContainer = document.getElementById('advanced-mode');
        dom.advancedEntriesContainer = document.getElementById('advanced-entries');
        dom.entryTemplate = document.querySelector('.entry-template');
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
        dom.resultSimplePrincipal = document.getElementById('result-simple-principal');
        dom.resultSimpleInterest = document.getElementById('result-simple-interest');
        dom.resultSimpleFinal = document.getElementById('result-simple-final');
        dom.resultSimpleEar = document.getElementById('result-simple-ear');
        dom.resultAggPrincipal = document.getElementById('result-agg-principal');
        dom.resultAggInterest = document.getElementById('result-agg-interest');
        dom.resultAggFinal = document.getElementById('result-agg-final');
        dom.resultAggEar = document.getElementById('result-agg-ear');

        if (!dom.form || !dom.modeToggleSimple || !dom.modeToggleAdvanced || !dom.entryTemplate || !dom.resultsArea || !dom.chartCanvas) {
            console.error("Calculator Initialization Failed: Critical DOM elements missing.");
            if (dom.form) dom.form.hidden = true;
            return false;
        }
        return true;
    }

    // --- Helper Functions --- (debounce, formatCurrency, formatPercent, isValidDate, showError, clearError, clearAllErrors remain the same)
    /** Debounce function: Executes a function only after a specified delay after the last call */
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func.apply(this, args); };
        clearTimeout(timeout); timeout = setTimeout(later, wait);
      };
    }
    function formatCurrency(amount, currencyCode = CONFIG.DEFAULT_CURRENCY) {
        if (isNaN(amount) || amount === null) return '--';
        try {
            return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2, }).format(amount);
        } catch (e) { console.warn(`Currency formatting failed for ${currencyCode}. Using fallback.`, e); const symbolMap = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', CAD: '$', AUD: '$' }; const symbol = symbolMap[currencyCode] || currencyCode; return `${symbol} ${amount.toFixed(2)}`; }
    }
    function formatPercent(rate) {
        if (isNaN(rate) || rate === null) return '--';
        try {
            return new Intl.NumberFormat(undefined, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(rate);
        } catch (e) { console.warn(`Percent formatting failed for ${rate}. Using fallback.`, e); return `${(rate * 100).toFixed(2)}%`; }
    }
    function isValidDate(dateString) { return dateString && !isNaN(new Date(dateString).getTime()); }
    function showError(inputElement, message) { const formGroup = inputElement.closest('.form-group'); if (!formGroup) return; let errorElement = formGroup.querySelector(`#${inputElement.id}-error`) || formGroup.querySelector('.error-message'); inputElement.classList.add('is-invalid'); inputElement.setAttribute('aria-invalid', 'true'); if (errorElement) { errorElement.textContent = message; if (!errorElement.id && inputElement.id) errorElement.id = inputElement.id + '-error'; if(errorElement.id) inputElement.setAttribute('aria-describedby', errorElement.id); } }
    function clearError(inputElement) { const formGroup = inputElement.closest('.form-group'); if (!formGroup) return; const errorElement = formGroup.querySelector(`#${inputElement.id}-error`) || formGroup.querySelector('.error-message'); inputElement.classList.remove('is-invalid'); inputElement.removeAttribute('aria-invalid'); const currentDesc = inputElement.getAttribute('aria-describedby'); if (errorElement && errorElement.id && currentDesc === errorElement.id) inputElement.removeAttribute('aria-describedby'); else if (errorElement && currentDesc?.includes(errorElement.id)) inputElement.setAttribute('aria-describedby', currentDesc.replace(errorElement.id, '').trim()); if (errorElement) errorElement.textContent = ''; }
    function clearAllErrors(formContainer) { formContainer.querySelectorAll('.is-invalid').forEach(input => clearError(input)); if(dom.aggregationError) dom.aggregationError.textContent = ''; }
    function getTimeInYears(startDateStr, endDateStr) { const start = new Date(startDateStr); const end = new Date(endDateStr); if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0; const diffMillis = end.getTime() - start.getTime(); return diffMillis / (1000 * 60 * 60 * 24 * 365.2425); }
    function getDurationInYears(value, unit) { if (isNaN(value) || value <= 0) return 0; switch (unit) { case 'years': return value; case 'months': return value / 12; case 'days': return value / 365.2425; default: console.warn(`Unknown duration unit: ${unit}`); return 0; } }
    function getAnnualRate(rateDecimal, ratePeriod) { if (isNaN(rateDecimal) || rateDecimal <= 0) return 0; switch (ratePeriod) { case 'annual': return rateDecimal; case 'semi-annual': return rateDecimal * 2; case 'quarterly': return rateDecimal * 4; case 'monthly': return rateDecimal * 12; default: console.warn(`Unknown rate period: ${ratePeriod}. Assuming annual.`); return rateDecimal; } }
    function getCompoundsPerYear(compoundingFrequency) { switch (compoundingFrequency) { case 'annually': return 1; case 'semi-annually': return 2; case 'quarterly': return 4; case 'monthly': return 12; case 'daily': return 365; default: console.warn(`Unknown compounding frequency: ${compoundingFrequency}. Assuming annually.`); return 1; } }
    function calculateSimpleInterest(principal, annualRate, timeInYears) { if (principal < 0 || annualRate <= 0 || timeInYears <= 0) return { interest: 0, finalAmount: Math.max(0, principal), isError: false }; try { const interest = principal * annualRate * timeInYears; if (isNaN(interest)) throw new Error("NaN result"); return { interest: interest, finalAmount: principal + interest, isError: false }; } catch(e) { console.error("Simple interest calculation error:", e); return {interest: NaN, finalAmount: NaN, isError: true }; } }
    function calculateCompoundInterest(principal, annualRate, timeInYears, compoundsPerYear) { if (principal < 0 || annualRate <= 0 || timeInYears <= 0 || compoundsPerYear <= 0) return { interest: 0, finalAmount: Math.max(0, principal), isError: false }; try { compoundsPerYear = Math.max(1, compoundsPerYear); const ratePerPeriod = annualRate / compoundsPerYear; const numberOfPeriods = timeInYears * compoundsPerYear; const finalAmount = principal * Math.pow((1 + ratePerPeriod), numberOfPeriods); if (isNaN(finalAmount)) throw new Error("NaN result"); const interest = finalAmount - principal; return { interest: interest, finalAmount: finalAmount, isError: false }; } catch(e) { console.error("Compound interest calculation error:", e); return {interest: NaN, finalAmount: NaN, isError: true }; } }
    function calculateEAR(annualRate, compoundsPerYear) { if (annualRate <= 0 || compoundsPerYear <= 0) return 0; try { compoundsPerYear = Math.max(1, compoundsPerYear); const ear = Math.pow((1 + (annualRate / compoundsPerYear)), compoundsPerYear) - 1; return isNaN(ear) ? 0 : ear; } catch(e) { console.error("EAR calculation error:", e); return 0; } }
    function convertCurrency(amount, fromCurrency, toCurrency) { if (fromCurrency === toCurrency) return amount; const fromRate = CONFIG.EXCHANGE_RATES[fromCurrency]; const toRate = CONFIG.EXCHANGE_RATES[toCurrency]; if (fromRate === undefined || toRate === undefined || fromRate === 0) { console.error(`Missing or invalid exchange rate for ${fromCurrency} or ${toCurrency}`); if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError; return NaN; } try { const amountInNGN = amount / fromRate; const amountInTarget = amountInNGN * toRate; if (isNaN(amountInTarget)) throw new Error("NaN result during conversion"); if(dom.aggregationError) dom.aggregationError.textContent = ''; return amountInTarget; } catch (e) { console.error("Currency conversion failed:", e); if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError; return NaN; } }
    // --- (End of unchanged helpers) ---

    /** Validate and get form data for a specific entry container */
    function getFormData(containerElement) {
         console.log(`[getFormData] Getting data from container:`, containerElement);
         const data = {};
         const inputs = containerElement.querySelectorAll('input[name], select[name]');
         let isValid = true;
         clearAllErrors(containerElement); // Clear previous errors ONLY within this container

         const timeMethodRadio = containerElement.querySelector(`input[name^="timeMethod-"]:checked`);
         const isDatesMethod = timeMethodRadio?.value === 'dates';
         const interestTypeSelect = containerElement.querySelector('select[name^="type-"]');
         const isSimpleInterest = interestTypeSelect?.value === 'simple';
         console.log(`[getFormData] isDatesMethod: ${isDatesMethod}, isSimpleInterest: ${isSimpleInterest}`);

         inputs.forEach(input => {
             const name = input.name.replace(/-\d+$/, '').replace('-simple', '');
             let skipValidation = false;

             // Determine if field should be skipped based on mode/selection
             const formGroup = input.closest('.form-group');
             const isDurationInput = formGroup?.classList.contains('duration-container') || input.name.includes('duration');
             const isDateInput = formGroup?.classList.contains('dates-container') || input.name.includes('date');
             const isCompoundingInput = formGroup?.classList.contains('compounding-group');

             if (isDurationInput && isDatesMethod) skipValidation = true;
             if (isDateInput && !isDatesMethod) skipValidation = true;
             if (isCompoundingInput && isSimpleInterest) skipValidation = true;

             // Store value first
             data[name] = input.type === 'number' ? parseFloat(input.value) : input.value.trim();

             // Validate only if not skipped
             if (!skipValidation) {
                 console.log(`[getFormData] Validating input: ${input.name}`);
                 if (!validateInput(input)) {
                    isValid = false;
                    console.warn(`[getFormData] Validation failed for: ${input.name}`);
                 }
             } else {
                 console.log(`[getFormData] Skipping validation for hidden/irrelevant input: ${input.name}`);
             }
         });

         // Additional cross-field validations (only if individual fields passed basic checks so far)
         if (isValid) {
            if (isDatesMethod) {
                 const startDateInput = containerElement.querySelector('input[name^="start-date"]');
                 const endDateInput = containerElement.querySelector('input[name^="end-date"]');
                 // Ensure dates exist before checking order
                 if (startDateInput && endDateInput && data['start-date'] && data['end-date']) {
                     if (!isValidDate(data['start-date'])) { // Re-check validity just in case
                         showError(startDateInput, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false;
                     } else if (!isValidDate(data['end-date'])) {
                         showError(endDateInput, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false;
                     } else if (new Date(data['end-date']) <= new Date(data['start-date'])) {
                         showError(endDateInput, CONFIG.ERROR_MESSAGES.dateOrder); isValid = false;
                     }
                 } else if (startDateInput?.required && !data['start-date'] || endDateInput?.required && !data['end-date']) {
                     // If method is dates and dates are missing (should have been caught by required check, but double check)
                     if (startDateInput?.required && !data['start-date']) showError(startDateInput, CONFIG.ERROR_MESSAGES.required);
                     if (endDateInput?.required && !data['end-date']) showError(endDateInput, CONFIG.ERROR_MESSAGES.required);
                     isValid = false;
                 }
            }
            // Ensure numbers are not NaN if they were supposed to be numbers
            ['principal', 'rate', 'duration-value'].forEach(numField => {
                const inputEl = containerElement.querySelector(`[name^="${numField}-"]`);
                // Check if input exists, is required, wasn't skipped, and resulted in NaN
                if (inputEl && inputEl.required && !data[numField] && data[numField] !== 0 && isNaN(data[numField])) {
                    // Check skip logic again for duration
                    const isDurationInput = inputEl.name.includes('duration-value');
                    if (!(isDurationInput && isDatesMethod)) {
                        showError(inputEl, 'Please enter a valid number.');
                        isValid = false;
                    }
                }
            });
         }

         console.log(`[getFormData] Final validation status: ${isValid}`);
        return isValid ? data : null;
    }

    /** Basic Input Validation (called by getFormData) */
    function validateInput(input) {
        clearError(input); // Clear previous error first
        const value = input.value.trim();
        const name = input.name;
        let isValid = true;

        if (input.required && !value) {
            showError(input, CONFIG.ERROR_MESSAGES.required); isValid = false;
        } else if (input.type === 'number' && value) { // Only validate non-empty numbers further
           const numValue = parseFloat(value);
           const min = parseFloat(input.min);
           if (isNaN(numValue)) {
                showError(input, 'Please enter a valid number.'); isValid = false;
           } else if (input.hasAttribute('min') && !isNaN(min) && numValue < min) {
                const msg = (min === 0 && !name?.includes('rate')) ? CONFIG.ERROR_MESSAGES.numberZeroPositive : CONFIG.ERROR_MESSAGES.numberPositive;
                showError(input, msg); isValid = false;
            } else if (name?.includes('rate') && numValue <= 0 && input.required) {
                 showError(input, CONFIG.ERROR_MESSAGES.ratePositive); isValid = false;
            } else if (name?.includes('duration-value') && numValue <= 0 && input.required) {
                 // Duration > 0 check is now handled more accurately in getFormData based on timeMethod
                 // Keep basic number validation here though.
            }
        } else if (input.type === 'date' && input.required && value && !isValidDate(value)) {
             showError(input, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false;
        }
        return isValid;
   }

    /** Perform calculation for a single validated data set */
    function performCalculation(validatedData) {
         console.log('[performCalculation] Input Data:', validatedData);
         const { currency, principal, rate, ratePeriod, interestType, compounding,
                 timeMethod, startDate, endDate, durationValue, durationUnit } = validatedData;

         const rateDecimal = rate / 100;
         const annualRate = getAnnualRate(rateDecimal, ratePeriod);

         let timeInYears = 0;
         if (timeMethod === 'dates') {
             timeInYears = getTimeInYears(startDate, endDate);
         } else {
             timeInYears = getDurationInYears(durationValue, durationUnit);
         }
         console.log(`[performCalculation] Calculated Time (Years): ${timeInYears}, Annual Rate: ${annualRate}`);

         let calcFn;
         let result = { interest: NaN, finalAmount: NaN, isError: false }; // Default to error state
         let ear = 0;
         const compoundsPerYear = getCompoundsPerYear(compounding);

         if (timeInYears <= 0) { // Handle zero or negative time explicitly
             console.warn("[performCalculation] Time duration is zero or negative. Returning principal only.");
             result = { interest: 0, finalAmount: principal, isError: false };
             ear = annualRate; // Simple rate if no time for compounding
         } else if (interestType === 'simple') {
             result = calculateSimpleInterest(principal, annualRate, timeInYears);
             ear = annualRate; // EAR for simple interest is the APR
         } else { // compound
             result = calculateCompoundInterest(principal, annualRate, timeInYears, compoundsPerYear);
             ear = calculateEAR(annualRate, compoundsPerYear);
         }

         // Check for calculation errors (NaN results)
         if(result.isError || isNaN(result.interest) || isNaN(result.finalAmount)) {
             console.error("[performCalculation] Calculation resulted in NaN or error flag set.");
             // Return structure indicating error, keep inputs
              return {
                 inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear },
                 principal: principal, interest: NaN, finalAmount: NaN, ear: NaN, timeInYears: timeInYears, error: true
              };
         }

         console.log('[performCalculation] Result:', { interest: result.interest, finalAmount: result.finalAmount, ear: ear });
         // Return a summary object including inputs used and derived values
         return {
             inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear },
             principal: principal,
             interest: result.interest,
             finalAmount: result.finalAmount,
             ear: ear,
             timeInYears: timeInYears, // Include for charting
             error: false
         };
    }

    // --- Charting Functions --- (createChartData, createAggregateChartData, updateChart remain mostly the same)
    function createChartData(calcResult) { const labels = []; const principalData = []; const interestData = []; const totalData = []; const steps = 20; const { inputs, principal, timeInYears } = calcResult; if (!inputs || timeInYears <= 0 || isNaN(principal)) return null; const { annualRate, interestType, compoundsPerYear } = inputs; for (let i = 0; i <= steps; i++) { const currentYearFraction = (timeInYears / steps) * i; let yearLabel = currentYearFraction.toFixed(1); if (timeInYears < 1) yearLabel = (currentYearFraction * 12).toFixed(1) + " Mo"; else if (timeInYears < 0.1) yearLabel = (currentYearFraction * 365.2425).toFixed(0) + " Day"; else yearLabel = yearLabel + " Yr"; labels.push(yearLabel); principalData.push(principal); let stepResult; if (interestType === 'simple') stepResult = calculateSimpleInterest(principal, annualRate, currentYearFraction); else stepResult = calculateCompoundInterest(principal, annualRate, currentYearFraction, compoundsPerYear); if(stepResult.isError) return null; interestData.push(stepResult.interest); totalData.push(stepResult.finalAmount); } return { labels, datasets: [ { label: 'Interest', data: interestData, borderColor: CONFIG.CHART_COLORS.interest, backgroundColor: CONFIG.CHART_COLORS.interest, fill: true, pointRadius: 1, tension: 0.1, order: 2 }, { label: 'Principal', data: principalData, borderColor: CONFIG.CHART_COLORS.principal, backgroundColor: CONFIG.CHART_COLORS.principal, fill: true, pointRadius: 1, tension: 0.1, order: 3 }, { label: 'Total Value', data: totalData, borderColor: CONFIG.CHART_COLORS.borderColor, backgroundColor: 'transparent', fill: false, pointRadius: 2, borderWidth: 2, tension: 0.1, order: 1 }] }; }
    function createAggregateChartData(aggregatedResult, individualResults) { if (!aggregatedResult || aggregatedResult.principalNGN <= 0 || individualResults.length === 0) return null; const labels = []; const principalData = []; const interestData = []; const totalData = []; const steps = 20; const maxTimeInYears = individualResults.reduce((max, res) => Math.max(max, res.summary?.timeInYears || 0), 0); if (maxTimeInYears <= 0) return null; const basePrincipal = aggregatedResult.principalNGN; const effectiveAnnualRate = aggregatedResult.blendedEAR; const aggregateCompoundsPerYear = 12; for (let i = 0; i <= steps; i++) { const currentYearFraction = (maxTimeInYears / steps) * i; let yearLabel = currentYearFraction.toFixed(1); if (maxTimeInYears < 1) yearLabel = (currentYearFraction * 12).toFixed(1) + " Mo"; else if (maxTimeInYears < 0.1) yearLabel = (currentYearFraction * 365.2425).toFixed(0) + " Day"; else yearLabel = yearLabel + " Yr"; labels.push(yearLabel); principalData.push(basePrincipal); const stepResult = calculateCompoundInterest( basePrincipal, effectiveAnnualRate, currentYearFraction, aggregateCompoundsPerYear ); if (stepResult.isError) return null; interestData.push(stepResult.interest); totalData.push(stepResult.finalAmount); } return { labels, datasets: [ { label: 'Total Interest', data: interestData, borderColor: CONFIG.CHART_COLORS.interest, backgroundColor: CONFIG.CHART_COLORS.interest, fill: true, pointRadius: 1, tension: 0.1, order: 2 }, { label: 'Total Principal (NGN Base)', data: principalData, borderColor: CONFIG.CHART_COLORS.principal, backgroundColor: CONFIG.CHART_COLORS.principal, fill: true, pointRadius: 1, tension: 0.1, order: 3 }, { label: 'Aggregated Value (NGN Base)', data: totalData, borderColor: CONFIG.CHART_COLORS.borderColor, backgroundColor: 'transparent', fill: false, pointRadius: 2, borderWidth: 2, tension: 0.1, order: 1 }] }; }
    function updateChart(chartData, displayCurrency) { dom.chartArea.hidden = !chartData; if (!chartData || !dom.chartCanvas) return; const ctx = dom.chartCanvas.getContext('2d'); const getTooltipLabel = (context) => { let label = context.dataset.label || ''; if (label) label += ': '; if (context.parsed.y !== null) label += formatCurrency(context.parsed.y, displayCurrency); return label; }; const getYAxisTick = (value) => formatCurrency(value, displayCurrency); if (interestChart) { interestChart.data = chartData; interestChart.options.scales.y.ticks.callback = getYAxisTick; interestChart.options.plugins.tooltip.callbacks.label = getTooltipLabel; interestChart.update(); } else { interestChart = new Chart(ctx, { type: 'line', data: chartData, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { callback: getYAxisTick } }, x: { title: { display: true, text: 'Time' } } }, plugins: { legend: { position: 'bottom' }, tooltip: { mode: 'index', intersect: false, callbacks: { label: getTooltipLabel } } }, interaction: { mode: 'nearest', axis: 'x', intersect: false } } }); } }
    // --- (End of chart functions) ---

    /** Display results based on the mode and calculated data */
     function displayResults(resultsData) {
         console.log("[displayResults] Displaying results:", resultsData);
         hideAllResultDisplays(); // Clear previous state reliably

         calculationResultsCache = resultsData; // Store the latest results

         let chartData = null;
         let displayCurrency = CONFIG.DEFAULT_CURRENCY;
         let calculationErrorOccurred = false; // Flag for overall errors

         if (resultsData.mode === 'simple' && resultsData.summary) {
             if (resultsData.summary.error) {
                 calculationErrorOccurred = true;
                 // Optionally show a specific error message in the results area
                 dom.simpleResultsDisplay.innerHTML = `<p class="error-message">${CONFIG.ERROR_MESSAGES.calculationError}</p>`;
                 dom.simpleResultsDisplay.hidden = false;
             } else {
                 displaySimpleResults(resultsData.summary);
                 chartData = createChartData(resultsData.summary);
                 displayCurrency = resultsData.summary.inputs.currency;
             }
         } else if (resultsData.mode === 'advanced' && resultsData.individual.length > 0) {
             // Check if any individual calculation failed
             const individualErrors = resultsData.individual.some(res => res.summary.error);
             if (individualErrors) {
                 calculationErrorOccurred = true;
                 // Display individual results, showing error for failed ones
                 displayAdvancedResults(resultsData.individual, null); // Pass null for aggregate if errors
             } else if (!resultsData.aggregated) {
                 // Individual calculations okay, but aggregation failed (likely currency)
                 calculationErrorOccurred = true; // Consider this an error state for display
                 displayAdvancedResults(resultsData.individual, null); // Show individuals, indicate aggregate issue
                 // Error message for aggregation is usually handled by convertCurrency/updateAggregatedDisplay
             } else {
                 // All calculations successful
                 displayAdvancedResults(resultsData.individual, resultsData.aggregated);
                 chartData = createAggregateChartData(resultsData.aggregated, resultsData.individual);
                 displayCurrency = dom.aggregationCurrencySelect.value; // Use selected currency for chart tooltips
             }
         } else {
             // No valid data to display (e.g., advanced mode with no entries calculated yet)
             console.log("[displayResults] No valid summary or individual results to display.");
             // Keep results area hidden
             return;
         }

         // Show results area, enable print button only if no errors
         dom.resultsArea.hidden = false;
         dom.printResultsBtn.disabled = calculationErrorOccurred;

         // Update Chart (only if no errors occurred and chartData was generated)
         if (!calculationErrorOccurred && chartData) {
             setTimeout(() => {
                updateChart(chartData, displayCurrency);
             }, CONFIG.RESULTS_VISIBILITY_DELAY);
         } else {
             dom.chartArea.hidden = true; // Ensure chart is hidden if errors or no data
         }

         // Scroll to results smoothly *only if* we are displaying valid results
         if (!calculationErrorOccurred) {
            dom.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
         }
     }

     /** Hide all results sections and disable print button */
     function hideAllResultDisplays() {
         dom.resultsArea.hidden = true;
         dom.simpleResultsDisplay.hidden = true;
         dom.advancedResultsDisplay.hidden = true;
         dom.chartArea.hidden = true;
         dom.printResultsBtn.disabled = true;
         calculationResultsCache = null; // Clear cache
         if (interestChart) {
             interestChart.data.labels = []; interestChart.data.datasets = []; interestChart.update('none');
         }
         console.log("[hideAllResultDisplays] Results area hidden.");
     }

    /** Populate the simple results display */
    function displaySimpleResults(summary) {
        // Assume summary.error check happened before calling this
        const { principal, interest, finalAmount, ear, inputs } = summary;
        const currency = inputs.currency;

        dom.resultSimplePrincipal.textContent = formatCurrency(principal, currency);
        dom.resultSimpleInterest.textContent = formatCurrency(interest, currency);
        dom.resultSimpleFinal.textContent = formatCurrency(finalAmount, currency);
        dom.resultSimpleEar.textContent = formatPercent(ear);

        dom.simpleResultsDisplay.hidden = false;
    }

     /** Populate the advanced results display (individual and aggregated) */
     function displayAdvancedResults(individualResults, aggregatedData) {
         // Display Individual Results
         dom.advancedIndividualResultsContainer.innerHTML = ''; // Clear previous
         individualResults.forEach((entryResult, index) => {
             const entryDiv = document.createElement('div');
             entryDiv.className = 'entry-result';
             const entryId = index + 1;
             const summary = entryResult.summary;
             const inputs = entryResult.inputs;
             const currency = inputs.currency;

             if (summary.error) {
                 // Display error state for this entry
                 entryDiv.innerHTML = `
                     <h4 id="adv-result-heading-${entryId}">Calculation #${entryId} (${currency})</h4>
                     <p class="error-message">${CONFIG.ERROR_MESSAGES.calculationError}</p>
                 `;
             } else {
                 // Display normal results for this entry
                 entryDiv.innerHTML = `
                     <h4 id="adv-result-heading-${entryId}">Calculation #${entryId} (${currency})</h4>
                     <div class="result-item" aria-labelledby="adv-result-heading-${entryId}"><span class="label">Principal:</span><strong class="value">${formatCurrency(summary.principal, currency)}</strong></div>
                     <div class="result-item" aria-labelledby="adv-result-heading-${entryId}"><span class="label">Interest:</span><strong class="value">${formatCurrency(summary.interest, currency)}</strong></div>
                     <div class="result-item ear" aria-labelledby="adv-result-heading-${entryId}"><span class="label">EAR:</span><strong class="value">${formatPercent(summary.ear)}</strong></div>
                     <div class="result-item total" aria-labelledby="adv-result-heading-${entryId}"><span class="label">Final Amount:</span><strong class="value">${formatCurrency(summary.finalAmount, currency)}</strong></div>`;
             }
             dom.advancedIndividualResultsContainer.appendChild(entryDiv);
         });

         // Display Aggregated Results (or hide if aggregatedData is null)
         if (aggregatedData) {
             dom.aggregationCurrencySelect.disabled = false;
             updateAggregatedDisplay(); // Display with current selection
             dom.advancedAggregatedDisplayContainer.hidden = false;
         } else {
             // Hide or show error state for aggregation section
             dom.aggregationCurrencySelect.disabled = true;
             dom.resultAggPrincipal.textContent = '--';
             dom.resultAggInterest.textContent = '--';
             dom.resultAggFinal.textContent = '--';
             dom.resultAggEar.textContent = '--';
             // Keep existing aggregationError message if set by convertCurrency
             dom.advancedAggregatedDisplayContainer.hidden = false; // Keep container visible to show "--" or error
         }

         dom.advancedResultsDisplay.hidden = false;
     }

     /** Updates only the aggregated part based on selected currency */
     function updateAggregatedDisplay() {
         // Check cache again within this function
         if (!calculationResultsCache || calculationResultsCache.mode !== 'advanced' || !calculationResultsCache.aggregated) {
            console.warn("[updateAggregatedDisplay] No valid aggregated data in cache.");
            dom.resultAggPrincipal.textContent = '--'; dom.resultAggInterest.textContent = '--'; dom.resultAggFinal.textContent = '--'; dom.resultAggEar.textContent = '--';
            if(dom.aggregationError) dom.aggregationError.textContent = ''; // Clear error if no data
            dom.aggregationCurrencySelect.disabled = true;
            return;
        }

         const aggregatedData = calculationResultsCache.aggregated;
         const targetCurrency = dom.aggregationCurrencySelect.value;
         console.log(`[updateAggregatedDisplay] Updating aggregated display to currency: ${targetCurrency}`);

         if (isNaN(aggregatedData.principalNGN) || isNaN(aggregatedData.interestNGN) || isNaN(aggregatedData.finalAmountNGN)) {
             console.error("[updateAggregatedDisplay] Aggregated NGN base data is invalid (NaN).");
             dom.resultAggPrincipal.textContent = 'Error'; dom.resultAggInterest.textContent = 'Error'; dom.resultAggFinal.textContent = 'Error'; dom.resultAggEar.textContent = '--';
             if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.calculationError;
             dom.aggregationCurrencySelect.disabled = true;
             return;
         }

         // Attempt conversion
         const principal = convertCurrency(aggregatedData.principalNGN, 'NGN', targetCurrency);
         const interest = convertCurrency(aggregatedData.interestNGN, 'NGN', targetCurrency);
         const finalAmount = convertCurrency(aggregatedData.finalAmountNGN, 'NGN', targetCurrency);
         const blendedEAR = aggregatedData.blendedEAR; // EAR is currency independent

         // Check for conversion errors specifically
         const conversionFailed = isNaN(principal) || isNaN(interest) || isNaN(finalAmount);
         const displayOrError = (value) => isNaN(value) ? 'Conv. Error' : formatCurrency(value, targetCurrency);

         dom.resultAggPrincipal.textContent = displayOrError(principal);
         dom.resultAggInterest.textContent = displayOrError(interest);
         dom.resultAggFinal.textContent = displayOrError(finalAmount);
         dom.resultAggEar.textContent = formatPercent(blendedEAR); // EAR doesn't need conversion check

         // Ensure error message is shown if conversion failed, cleared otherwise
         if (conversionFailed && dom.aggregationError) {
             dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError;
         } else if (dom.aggregationError) {
             dom.aggregationError.textContent = ''; // Clear if conversion succeeded
         }

         dom.aggregationCurrencySelect.disabled = false; // Ensure enabled

         // Update chart currency display if chart is visible
         if (interestChart && !dom.chartArea.hidden) {
             const chartCurrency = dom.aggregationCurrencySelect.value;
             console.log(`[updateAggregatedDisplay] Updating chart currency to: ${chartCurrency}`);
             interestChart.options.scales.y.ticks.callback = value => formatCurrency(value, chartCurrency);
             interestChart.options.plugins.tooltip.callbacks.label = context => { let label = context.dataset.label || ''; if (label) label += ': '; if (context.parsed.y !== null) label += formatCurrency(context.parsed.y, chartCurrency); return label; };
             interestChart.update('none'); // Update without animation
         }
     }

    // --- Event Handlers ---

    /** Handle clicks on the mode toggle buttons */
    function handleModeToggleClick(event) {
        const clickedButton = event.currentTarget;
        const selectedMode = clickedButton.dataset.mode;
        if (selectedMode === currentMode) return;
        console.log(`[handleModeToggleClick] Switching mode to: ${selectedMode}`);
        currentMode = selectedMode;
        dom.modeToggleSimple.classList.toggle('active', selectedMode === 'simple');
        dom.modeToggleSimple.setAttribute('aria-checked', String(selectedMode === 'simple'));
        dom.modeToggleAdvanced.classList.toggle('active', selectedMode === 'advanced');
        dom.modeToggleAdvanced.setAttribute('aria-checked', String(selectedMode === 'advanced'));
        dom.simpleModeContainer.hidden = (selectedMode !== 'simple');
        dom.advancedModeContainer.hidden = (selectedMode !== 'advanced');
        if (selectedMode === 'advanced' && dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)').length === 0) { addEntry(); }
        clearAllErrors(dom.form);
        hideAllResultDisplays(); // Hide results when mode changes
    }

    /** Handle changes in form inputs (input, change events) - ONLY for UI updates */
    function handleInputChange(event) {
         const input = event.target;
         const container = input.closest('fieldset.entry, div#simple-mode');
         if(!container) return;

         // --- UI Updates Only ---
         if (input.matches('select[name^="currency-"]')) {
             const symbolSpan = container.querySelector('.principal-group .currency-symbol');
             const selectedOption = input.options[input.selectedIndex];
             const symbolText = selectedOption.textContent.match(/\(([^)]+)\)/)?.[1];
             if (symbolSpan && symbolText) symbolSpan.textContent = symbolText;
         }
         if (input.matches('select[name^="type-"]')) {
             const compoundingGroup = container.querySelector('.compounding-group');
             if(compoundingGroup) {
                const isSimple = (input.value === 'simple');
                compoundingGroup.hidden = isSimple;
                if (isSimple) clearError(compoundingGroup.querySelector('select')); // Clear errors if hiding
             }
         }
         if (input.matches('input[name^="timeMethod-"]')) {
             const datesContainer = container.querySelector('.dates-container');
             const durationContainer = container.querySelector('.duration-container');
             const useDates = (input.value === 'dates');
             if(datesContainer) datesContainer.hidden = !useDates;
             if(durationContainer) durationContainer.hidden = useDates;
             const sectionToClear = useDates ? durationContainer : datesContainer;
             sectionToClear?.querySelectorAll('input, select').forEach(el => clearError(el));
         }

         // --- Hide results when inputs change ---
         // This gives immediate feedback that the current results (if any) are outdated.
         if (!dom.resultsArea.hidden) {
             hideAllResultDisplays();
             console.log("[handleInputChange] Input changed, results hidden.");
         }

         // --- NO calculation trigger here ---
         // debouncedCalculateAndDisplay(); // REMOVED
    }

    /** Add a new entry fieldset in advanced mode */
     function addEntry() {
         const currentEntries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)').length;
         if (currentEntries >= CONFIG.MAX_ADVANCED_ENTRIES) { alert(CONFIG.ERROR_MESSAGES.maxEntries); return; }
         advancedEntryCounter++;
         const newEntry = dom.entryTemplate.cloneNode(true);
         newEntry.hidden = false; newEntry.classList.remove('entry-template'); const entryId = advancedEntryCounter; newEntry.id = `entry-${entryId}`; newEntry.dataset.entryId = entryId; newEntry.setAttribute('aria-labelledby', `entry-legend-${entryId}`);
         newEntry.querySelectorAll('[id*="{id}"], [name*="{id}"], [for*="{id}"], [aria-label*="{id}"], [aria-labelledby*="{id}"], [aria-describedby*="{id}"]').forEach(el => { const updateAttribute = (element, attrPrefix) => { const attrName = `${attrPrefix}-{id}`; if (element.hasAttribute(attrName)) { element.setAttribute(attrPrefix, element.getAttribute(attrName).replace('{id}', entryId)); element.removeAttribute(attrName); } else if (element.id?.includes('{id}')) { element.id = element.id.replace('{id}', entryId); } if (element.name?.includes('{id}')) element.name = element.name.replace('{id}', entryId); if (element.htmlFor?.includes('{id}')) element.htmlFor = element.htmlFor.replace('{id}', entryId); if (element.getAttribute('aria-label')?.includes('{id}')) element.setAttribute('aria-label', element.getAttribute('aria-label').replace('{id}', entryId)); if (element.getAttribute('aria-labelledby')?.includes('{id}')) element.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby').replace('{id}', entryId)); if (element.getAttribute('aria-describedby')?.includes('{id}')) element.setAttribute('aria-describedby', element.getAttribute('aria-describedby').replace('{id}', entryId)); }; updateAttribute(el, 'id'); updateAttribute(el, 'name'); updateAttribute(el, 'for'); updateAttribute(el, 'aria-label'); updateAttribute(el, 'aria-labelledby'); updateAttribute(el, 'aria-describedby'); if (el.classList.contains('entry-number')) el.textContent = entryId; if (el.id === `entry-legend-${entryId}`) el.id = `entry-legend-${entryId}`; });
         resetEntryToDefaults(newEntry, entryId); // Reset cloned entry to defaults
         newEntry.querySelectorAll('input, select').forEach(input => { input.addEventListener('input', handleInputChange); input.addEventListener('change', handleInputChange); });
         const removeBtn = newEntry.querySelector('.remove-entry-btn'); if (removeBtn) { removeBtn.hidden = false; removeBtn.addEventListener('click', handleRemoveEntryClick); }
         dom.advancedEntriesContainer.appendChild(newEntry);
         updateAdvancedEntryUI();
         hideAllResultDisplays(); // Hide results when entry is added
     }

    /** Remove an entry fieldset in advanced mode */
     function handleRemoveEntryClick(event) {
         const entryToRemove = event.currentTarget.closest('.entry'); if (!entryToRemove) return;
         entryToRemove.remove();
         updateAdvancedEntryUI();
         hideAllResultDisplays(); // Hide results when entry is removed
     }

     /** Update numbering, button states, and remove button visibility for advanced entries */
     function updateAdvancedEntryUI() {
         const remainingEntries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)');
         const entryCount = remainingEntries.length;
         remainingEntries.forEach((entry, index) => { const currentIdNum = index + 1; const numberSpan = entry.querySelector('.entry-number'); if (numberSpan) numberSpan.textContent = currentIdNum; const removeBtn = entry.querySelector('.remove-entry-btn'); if (removeBtn) { removeBtn.hidden = (entryCount <= 1); removeBtn.setAttribute('aria-label', `Remove Calculation ${currentIdNum}`); } });
         dom.addEntryBtn.disabled = (entryCount >= CONFIG.MAX_ADVANCED_ENTRIES);
     }

    /** Handle the clear all button click */
     function handleClearFormClick() {
         console.log("[handleClearFormClick] Clearing form.");
         dom.form.reset(); // Resets to initial HTML values, careful if JS changed defaults
         clearAllErrors(dom.form);
         hideAllResultDisplays();

         // Reset modes and advanced entries
         currentMode = 'simple'; // Default back to simple mode
         dom.modeToggleSimple.classList.add('active'); dom.modeToggleSimple.setAttribute('aria-checked', 'true');
         dom.modeToggleAdvanced.classList.remove('active'); dom.modeToggleAdvanced.setAttribute('aria-checked', 'false');
         dom.simpleModeContainer.hidden = false;
         dom.advancedModeContainer.hidden = true;

         dom.advancedEntriesContainer.innerHTML = ''; // Remove ALL advanced entries
         advancedEntryCounter = 0; // Reset counter fully
         addEntry(); // Add back the first (now hidden) advanced entry

         // Explicitly reset simple mode and the (newly added) first advanced entry to defaults
         resetEntryToDefaults(dom.simpleModeContainer, 'simple');
         const firstAdvEntry = dom.advancedEntriesContainer.querySelector('.entry');
         if(firstAdvEntry) resetEntryToDefaults(firstAdvEntry, 1);

         updateAdvancedEntryUI(); // Update buttons state

         // Reset aggregation currency selector
         dom.aggregationCurrencySelect.value = CONFIG.DEFAULT_CURRENCY;
         dom.aggregationCurrencySelect.disabled = true; // Disable until advanced results shown

         console.log("Form Cleared and reset to simple mode defaults.");
    }

    /** Resets a specific container to default values/state */
    function resetEntryToDefaults(container, entryId = 'simple') {
        if (!container) return;
        console.log(`[resetEntryToDefaults] Resetting container for ID: ${entryId}`);
        const getEl = (selector) => container.querySelector(selector.replace('{id}', entryId)); // Helper

        // Reset simple fields
        const currencySelect = getEl(`select[name="currency-${entryId}"]`); if (currencySelect) currencySelect.value = CONFIG.DEFAULT_CURRENCY;
        const principalInput = getEl(`input[name="principal-${entryId}"]`); if (principalInput) principalInput.value = CONFIG.DEFAULT_PRINCIPAL;
        const rateInput = getEl(`input[name="rate-${entryId}"]`); if (rateInput) rateInput.value = CONFIG.DEFAULT_RATE;
        const ratePeriodSelect = getEl(`select[name="rate-period-${entryId}"]`); if (ratePeriodSelect) ratePeriodSelect.value = CONFIG.DEFAULT_RATE_PERIOD;
        const typeSelect = getEl(`select[name="type-${entryId}"]`); if (typeSelect) typeSelect.value = CONFIG.DEFAULT_INTEREST_TYPE;
        const compoundingSelect = getEl(`select[name="compounding-${entryId}"]`); if (compoundingSelect) compoundingSelect.value = CONFIG.DEFAULT_COMPOUNDING;
        const symbolSpan = getEl(`.principal-group .currency-symbol`); if (symbolSpan) symbolSpan.textContent = '₦'; // Default NGN

        // Reset time method and visibility
        const timeMethodRadios = container.querySelectorAll(`input[name="timeMethod-${entryId}"]`);
        const datesContainer = getEl(`#dates-${entryId}-container`);
        const durationContainer = getEl(`#duration-${entryId}-container`);
        timeMethodRadios.forEach(radio => radio.checked = (radio.value === 'dates'));
        if (datesContainer) datesContainer.hidden = false;
        if (durationContainer) durationContainer.hidden = true;

        // Reset date/duration values
        setInitialDates(container); // Sets default dates
        const durationValueInput = getEl(`input[name="duration-value-${entryId}"]`); if (durationValueInput) durationValueInput.value = CONFIG.DEFAULT_DURATION_VALUE;
        const durationUnitSelect = getEl(`select[name="duration-unit-${entryId}"]`); if (durationUnitSelect) durationUnitSelect.value = CONFIG.DEFAULT_DURATION_UNIT;

        // Reset compounding visibility
        const compoundingGroup = getEl('.compounding-group'); if (compoundingGroup) compoundingGroup.hidden = (CONFIG.DEFAULT_INTEREST_TYPE === 'simple');
    }


    /** Handle form submission */
    function handleFormSubmit(event) {
        event.preventDefault();
        console.log("[handleFormSubmit] Calculate button clicked. Initiating calculation...");
        // Disable button while calculating? Optional.
        // dom.calculateBtn.disabled = true;
        // dom.calculateBtn.textContent = 'Calculating...';

        calculateAndDisplay(); // Perform validation, calculation, display

        // Re-enable button after short delay or immediately
        // setTimeout(() => {
        //     dom.calculateBtn.disabled = false;
        //     dom.calculateBtn.innerHTML = '<i class="fas fa-calculator" aria-hidden="true"></i> Calculate';
        // }, 300); // Adjust delay as needed
    }


    /** Handle print results button click */
    function handlePrintResultsClick() {
        console.log("[handlePrintResultsClick] Printing results...");
        window.print();
    }

    /** Update results when aggregation currency changes */
    function handleAggregationCurrencyChange() {
        console.log("[handleAggregationCurrencyChange] Aggregation currency changed.");
         updateAggregatedDisplay(); // Update display and chart based on new currency
    }

     /** Set default start/end dates */
     function setInitialDates(container) {
        if (!container) return;
        const startDateInput = container.querySelector('input[name^="start-date"]');
        const endDateInput = container.querySelector('input[name^="end-date"]');
        if (startDateInput && endDateInput) {
            const today = new Date(); const oneYearLater = new Date(today); oneYearLater.setFullYear(today.getFullYear() + 1);
            const formatDate = (date) => date.toISOString().split('T')[0];
            startDateInput.value = formatDate(today); endDateInput.value = formatDate(oneYearLater);
         }
    }

     /** Update the copyright year */
    function updateCopyrightYear() { if (dom.currentYearSpan) dom.currentYearSpan.textContent = new Date().getFullYear(); }

     // --- Initialization ---
    function init() {
        if (!cacheDOMElements()) return; // Stop if critical elements are missing
        console.log("[init] Caching DOM elements successful.");

        // --- Set Initial State & Defaults ---
        dom.simpleModeContainer.hidden = false; dom.advancedModeContainer.hidden = true;
        resetEntryToDefaults(dom.simpleModeContainer); // Set simple mode defaults
        addEntry(); // Add the first advanced entry (it starts hidden)
        hideAllResultDisplays(); // Ensure results are hidden initially
        dom.aggregationCurrencySelect.disabled = true; // Aggregation disabled initially

        // --- Attach Event Listeners ---
        dom.modeToggleSimple.addEventListener('click', handleModeToggleClick);
        dom.modeToggleAdvanced.addEventListener('click', handleModeToggleClick);
        dom.form.addEventListener('input', handleInputChange); // UI updates + hide results
        dom.form.addEventListener('change', handleInputChange); // UI updates + hide results
        dom.form.addEventListener('submit', handleFormSubmit); // MAIN CALCULATION TRIGGER
        dom.clearFormBtn.addEventListener('click', handleClearFormClick);
        dom.printResultsBtn.addEventListener('click', handlePrintResultsClick);
        dom.aggregationCurrencySelect.addEventListener('change', handleAggregationCurrencyChange);
        if (dom.addEntryBtn) dom.addEntryBtn.addEventListener('click', addEntry);

        updateCopyrightYear();
        console.info("Interest Calculator Initialized (v1.2.0). Ready for calculation on submit.");
    }

    // --- Run Init ---
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
    else { init(); }

})();
