/**
 * ROFILID Interest Calculator Script - v1.2.1
 * Location: /assets/js/personal/calculator.js
 * Description: Handles calculations, UI updates, validation, mode switching,
 *              and chart generation for the interest calculator tool.
 * Dependencies: Chart.js (ensure loaded), calculator.css, personal.css
 */
(function () {
    'use strict';

    // --- Configuration ---
    const CONFIG = {
        MAX_ADVANCED_ENTRIES: 10,
        DEFAULT_CURRENCY: 'NGN',
        DEFAULT_PRINCIPAL: 10000,
        DEFAULT_RATE: 5,
        DEFAULT_RATE_PERIOD: 'annual',
        DEFAULT_INTEREST_TYPE: 'compound',
        DEFAULT_COMPOUNDING: 'monthly',
        DEFAULT_DURATION_VALUE: 1,
        DEFAULT_DURATION_UNIT: 'years',
        RESULTS_VISIBILITY_DELAY: 50, // ms delay before showing results/chart
        // Basic exchange rates relative to NGN (Example - USE REAL RATES/API IN PRODUCTION)
        EXCHANGE_RATES: {
            NGN: 1,
            USD: 1 / 1500, // 1 USD = 1500 NGN (Example)
            EUR: 1 / 1600,
            GBP: 1 / 1800,
            JPY: 1 / 10,
            CNY: 1 / 200,
            CAD: 1 / 1100,
            AUD: 1 / 980,
        },
        ERROR_MESSAGES: {
            required: 'This field is required.',
            numberInvalid: 'Please enter a valid number.',
            numberPositive: 'Please enter a positive number.',
            numberZeroPositive: 'Please enter a number greater than or equal to 0.',
            ratePositive: 'Interest rate must be positive.',
            durationPositive: 'Duration must be positive.',
            dateInvalid: 'Please enter a valid date.',
            dateOrder: 'End date must be after start date.',
            maxEntries: `You can add a maximum of ${10} calculations.`,
            calculationError: 'Calculation failed. Please check inputs.',
            conversionError: 'Currency conversion failed. Check rates.',
            generic: 'An unexpected error occurred.',
        },
        CHART_COLORS: {
            principal: 'rgba(15, 118, 110, 0.2)', // Teal transparent
            interest: 'rgba(13, 148, 136, 0.7)', // Primary Teal less transparent
            total: 'rgba(15, 118, 110, 1)',      // Teal solid
            borderColor: 'rgba(15, 118, 110, 1)', // Teal solid
        }
    };

    // --- State Variables ---
    let currentMode = 'simple'; // 'simple' or 'advanced'
    let interestChart = null;
    let advancedEntryCounter = 0;
    let calculationResultsCache = null; // Store last successful calculation data

    // --- DOM Element Cache ---
    const dom = {};

    function cacheDOMElements() {
        const selectors = {
            form: '#calculator-form',
            modeToggleSimple: '#toggle-simple',
            modeToggleAdvanced: '#toggle-advanced',
            simpleModeContainer: '#simple-mode',
            advancedModeContainer: '#advanced-mode',
            advancedEntriesContainer: '#advanced-entries',
            entryTemplate: '.entry-template',
            addEntryBtn: '#add-entry-btn',
            clearFormBtn: '#clear-form-btn',
            calculateBtn: '#calculate-btn',
            resultsArea: '#results-area',
            simpleResultsDisplay: '#simple-results',
            advancedResultsDisplay: '#advanced-results',
            advancedIndividualResultsContainer: '#advanced-individual-results',
            advancedAggregatedDisplayContainer: '#advanced-aggregated-display',
            aggregationCurrencySelect: '#aggregation-currency',
            aggregationError: '#aggregation-error',
            resultSimplePrincipal: '#result-simple-principal',
            resultSimpleInterest: '#result-simple-interest',
            resultSimpleFinal: '#result-simple-final',
            resultSimpleEar: '#result-simple-ear',
            resultAggPrincipal: '#result-agg-principal',
            resultAggInterest: '#result-agg-interest',
            resultAggFinal: '#result-agg-final',
            resultAggEar: '#result-agg-ear',
            chartArea: '#chart-area',
            chartCanvas: '#interest-chart',
            printResultsBtn: '#print-results-btn',
            currentYearSpan: '#current-year', // Footer year
        };

        let allFound = true;
        for (const key in selectors) {
            dom[key] = document.querySelector(selectors[key]);
            if (!dom[key]) {
                console.error(`[cacheDOMElements] Critical DOM element not found: ${key} (${selectors[key]})`);
                allFound = false;
            }
        }

        // Check for chart context specifically if chartCanvas exists
        if (dom.chartCanvas) {
            dom.chartContext = dom.chartCanvas.getContext('2d');
            if (!dom.chartContext) {
                console.error("[cacheDOMElements] Failed to get 2D context for chart canvas.");
                allFound = false;
            }
        } else {
             // If canvas itself is missing, chartContext won't exist
             dom.chartContext = null;
        }


        if (!allFound) {
            alert("Initialization failed: Some essential page elements are missing. Please contact support.");
            return false;
        }
        return true;
    }


    // --- Event Handlers ---

    function handleModeToggleClick(event) {
        const clickedButton = event.currentTarget;
        const newMode = clickedButton.dataset.mode;

        if (newMode === currentMode) return; // No change

        currentMode = newMode;
        console.log(`[handleModeToggleClick] Mode switched to: ${currentMode}`);

        // Update button states
        dom.modeToggleSimple.classList.toggle('active', currentMode === 'simple');
        dom.modeToggleSimple.setAttribute('aria-checked', currentMode === 'simple');
        dom.modeToggleAdvanced.classList.toggle('active', currentMode === 'advanced');
        dom.modeToggleAdvanced.setAttribute('aria-checked', currentMode === 'advanced');

        // Update container visibility
        dom.simpleModeContainer.hidden = (currentMode !== 'simple');
        dom.advancedModeContainer.hidden = (currentMode !== 'advanced');
        dom.simpleModeContainer.classList.toggle('active', currentMode === 'simple');
        dom.advancedModeContainer.classList.toggle('active', currentMode === 'advanced');

        hideAllResultDisplays(); // Hide results when mode changes
    }

    function handleInputChange(event) {
        const input = event.target;
        const formGroup = input.closest('.form-group');
        const entryContainer = input.closest('.calculator-mode, .entry'); // Find parent container

        if (!entryContainer) return; // Should not happen within the form

        // --- 1. Dynamic Currency Symbol Update ---
        if (input.matches('select[name^="currency-"]')) {
            const currencyCode = input.value;
            const principalGroup = entryContainer.querySelector('.principal-group');
            if (principalGroup) {
                const symbolSpan = principalGroup.querySelector('.currency-symbol');
                if (symbolSpan) {
                    try {
                        // Use Intl.NumberFormat to get the symbol (more robust)
                        const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode, currencyDisplay: 'narrowSymbol' });
                        const parts = formatter.formatToParts(0);
                        const symbolPart = parts.find(part => part.type === 'currency');
                        symbolSpan.textContent = symbolPart ? symbolPart.value : currencyCode; // Fallback to code
                    } catch (e) {
                        console.warn(`[handleInputChange] Could not format currency symbol for ${currencyCode}. Falling back to code.`);
                        symbolSpan.textContent = currencyCode;
                    }
                }
            }
        }

        // --- 2. Conditional Visibility: Compounding Frequency ---
        if (input.matches('select[name^="type-"]')) {
            const compoundingGroup = entryContainer.querySelector('.compounding-group');
            if (compoundingGroup) {
                const isSimple = (input.value === 'simple');
                compoundingGroup.hidden = isSimple;
                // Clear validation errors on compounding select if it becomes hidden
                if (isSimple) {
                    const compoundingSelect = compoundingGroup.querySelector('select');
                    if (compoundingSelect) clearError(compoundingSelect);
                }
            }
        }

        // --- 3. Conditional Visibility: Dates vs. Duration ---
        if (input.matches('input[type="radio"][name^="timeMethod-"]')) {
            const useDates = (input.value === 'dates');
            const datesContainer = entryContainer.querySelector('.dates-container');
            const durationContainer = entryContainer.querySelector('.duration-container');

            if (datesContainer && durationContainer) {
                datesContainer.hidden = !useDates;
                durationContainer.hidden = useDates;

                // Clear validation errors on inputs that become hidden
                const inputsToClear = useDates ? durationContainer.querySelectorAll('input, select') : datesContainer.querySelectorAll('input, select');
                inputsToClear.forEach(clearError);
            }
        }

        // --- 4. Real-time Validation (Optional but good UX) ---
        // You could call validateInput(input) here, but it might be too noisy.
        // Instead, just clear the specific error if the user starts typing/changing.
        if (input.classList.contains('is-invalid')) {
            // Simple clearing approach: Clear error if user interacts with an invalid field
             clearError(input);
        }

        // --- 5. Clear results if any input changes (prevents stale results) ---
        // Debounce this if it causes performance issues on rapid input
         hideAllResultDisplays(); // Keep results hidden until 'Calculate' is pressed again
    }

     // --- Main Calculation Orchestration ---
     function calculateAndDisplay() {
         console.log("%c[calculateAndDisplay] Initiating Calculation...", 'color: blue; font-weight: bold;');
         clearAllErrors(dom.form); // Clear previous validation errors globally first
         hideAllResultDisplays(); // Ensure results are hidden initially

         let overallValid = true;
         let resultsData = { mode: currentMode, summary: null, individual: [], aggregated: null };
         let calculationPerformed = false; // Flag to track if calculation was even attempted successfully

         if (currentMode === 'simple') {
             console.log("[calculateAndDisplay] Mode: simple. Getting form data...");
             const data = getFormData(dom.simpleModeContainer);

             if (data) {
                 console.log("[calculateAndDisplay] Simple mode data VALID. Performing calculation...", data);
                 resultsData.summary = performCalculation(data);
                 calculationPerformed = true;
                  if (!resultsData.summary || resultsData.summary.error || isNaN(resultsData.summary.finalAmount)) {
                     console.error("[calculateAndDisplay] Simple calculation FAILED or returned error/NaN.", resultsData.summary);
                     overallValid = false; // Mark as invalid if calculation itself failed
                     // Ensure error flag is set for display logic
                     if(resultsData.summary) resultsData.summary.error = true; else resultsData.summary = { error: true };
                  } else {
                      console.log("[calculateAndDisplay] Simple calculation SUCCESSFUL.");
                  }
             } else {
                 overallValid = false;
                 console.warn("[calculateAndDisplay] Simple mode validation FAILED (getFormData returned null).");
             }
         } else { // Advanced Mode
             console.log("[calculateAndDisplay] Mode: advanced. Processing entries...");
             let totalPrincipalNGN = 0, totalInterestNGN = 0, totalFinalAmountNGN = 0;
             let conversionPossible = true;
             let entryCalculationsAttempted = 0;
             let entryCalculationsSucceeded = 0;
             const entries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)');
             entryCalculationsAttempted = entries.length;

              if (entryCalculationsAttempted === 0) {
                 console.warn("[calculateAndDisplay] Advanced mode has no entries to calculate.");
                 overallValid = false; // Can't be valid with no entries
              }

              for (let i = 0; i < entries.length; i++) {
                  const entry = entries[i];
                  const entryIndex = i + 1;
                  console.log(`%c[calculateAndDisplay] Getting data for advanced entry #${entryIndex}...`, 'color: blue;');
                  const entryData = getFormData(entry);

                  if (entryData) {
                      console.log(`[calculateAndDisplay] Advanced entry #${entryIndex} data VALID. Performing calculation...`, entryData);
                      const entryCalcResult = performCalculation(entryData);
                      calculationPerformed = true; // Mark that at least one calc was tried

                      if (!entryCalcResult || entryCalcResult.error || isNaN(entryCalcResult.finalAmount)) {
                          console.error(`[calculateAndDisplay] Advanced entry #${entryIndex} calculation FAILED or returned error/NaN.`, entryCalcResult);
                          // Add placeholder with error flag
                          resultsData.individual.push({ inputs: entryData || {}, summary: { error: true, principal: entryData?.principal || 0, inputs: entryData || {} } });
                          overallValid = false; // Mark overall as invalid if any entry calc fails
                      } else {
                          console.log(`[calculateAndDisplay] Advanced entry #${entryIndex} calculation SUCCESSFUL.`);
                          resultsData.individual.push({ inputs: entryData, summary: entryCalcResult });
                          entryCalculationsSucceeded++;

                          // Accumulate NGN equivalents *only if* calculation succeeded
                          const principalNGN = convertCurrency(entryCalcResult.principal, entryData.currency, 'NGN');
                          const interestNGN = convertCurrency(entryCalcResult.interest, entryData.currency, 'NGN');
                          const finalAmountNGN = convertCurrency(entryCalcResult.finalAmount, entryData.currency, 'NGN');

                          // Check if ANY conversion failed for this entry
                          if (isNaN(principalNGN) || isNaN(interestNGN) || isNaN(finalAmountNGN)) {
                              conversionPossible = false;
                              console.warn(`[calculateAndDisplay] Currency conversion to NGN failed for entry #${entryIndex}`);
                              // We can still show individual results, but aggregation will fail.
                          } else {
                              // Add to totals only if conversion succeeded
                              totalPrincipalNGN += principalNGN;
                              totalInterestNGN += interestNGN;
                              totalFinalAmountNGN += finalAmountNGN;
                          }
                      }
                  } else {
                      overallValid = false;
                      console.warn(`[calculateAndDisplay] Advanced entry #${entryIndex} validation FAILED (getFormData returned null).`);
                       // Add a placeholder to show validation failed for this entry (optional)
                      // Find the original inputs attempt even if validation failed
                      const failedInputs = {};
                      entry.querySelectorAll('input[name], select[name]').forEach(inp => {
                        const name = inp.name.replace(/-\d+$/, '');
                        failedInputs[name] = inp.value;
                      });
                      resultsData.individual.push({ inputs: failedInputs, summary: { error: true, type: 'validation', principal: parseFloat(failedInputs.principal) || 0 } });
                  }
              } // End loop through entries

              // Calculate aggregate totals only if:
              // 1. At least one entry succeeded in calculation.
              // 2. ALL entries that were *attempted* passed *validation* (overallValid is true).
              // 3. Currency conversion to NGN was possible for ALL *successfully calculated* entries.
              if (overallValid && entryCalculationsSucceeded > 0 && conversionPossible) {
                  console.log("[calculateAndDisplay] Calculating aggregated results...");
                  let weightedEARSum = 0;

                  resultsData.individual.forEach(res => {
                      // Only include successfully calculated entries in EAR weighting
                      if (!res.summary.error && res.summary.ear !== undefined) {
                         const principalNGN = convertCurrency(res.summary.principal, res.inputs.currency, 'NGN');
                         // Check conversion again for safety, though 'conversionPossible' should cover it
                         if (!isNaN(principalNGN) && totalPrincipalNGN > 0) {
                             weightedEARSum += res.summary.ear * (principalNGN / totalPrincipalNGN);
                         } else if (!isNaN(principalNGN) && totalPrincipalNGN === 0 && entryCalculationsSucceeded === 1) {
                            // Handle single entry with zero principal correctly
                            weightedEARSum = res.summary.ear;
                         }
                         // If totalPrincipalNGN is 0 and multiple entries, blended EAR is ambiguous, default to 0.
                      }
                  });

                  resultsData.aggregated = {
                      principalNGN: totalPrincipalNGN,
                      interestNGN: totalInterestNGN,
                      finalAmountNGN: totalFinalAmountNGN,
                      blendedEAR: totalPrincipalNGN > 0 ? weightedEARSum : (entryCalculationsSucceeded === 1 ? weightedEARSum : 0) // Handle zero total principal edge case
                  };
                  console.log("[calculateAndDisplay] Aggregated results calculated:", resultsData.aggregated);
              } else {
                  resultsData.aggregated = null; // Aggregation not possible or not applicable
                  console.warn("[calculateAndDisplay] Aggregated results NOT calculated. Reason:", { overallValid, entryCalculationsSucceeded, conversionPossible });
                  if (!conversionPossible && overallValid && entryCalculationsSucceeded > 0) {
                       if (dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError; // Show specific conversion error
                  } else if (!overallValid && entryCalculationsAttempted > 0) {
                      if (dom.aggregationError) dom.aggregationError.textContent = 'Cannot aggregate due to input errors.';
                  } else {
                       if (dom.aggregationError) dom.aggregationError.textContent = ''; // Clear any previous error
                  }
              }
          } // End advanced mode processing

          console.log("[calculateAndDisplay] Final Check:", { overallValid, calculationPerformed, resultsData });

          // Display results or appropriate error messages
          // We show results area if *any* calculation was attempted (even if failed)
          // or if validation failed (to show validation errors in results area for advanced)
          if (calculationPerformed || (currentMode === 'advanced' && resultsData.individual.length > 0)) {
               console.log("[calculateAndDisplay] Validation/Calculation completed (or partially for Advanced). Calling displayResults...");
               displayResults(resultsData);
          } else if (!overallValid) {
              console.warn("[calculateAndDisplay] Hiding results: Form validation failed before calculation.");
              // Validation errors should already be visible on the form itself.
              hideAllResultDisplays();
          } else {
               console.warn("[calculateAndDisplay] Hiding results: No calculation performed or no entries (Advanced).");
              hideAllResultDisplays();
          }
      }

    /** Validate and get form data for a specific entry container */
    function getFormData(containerElement) {
         console.log(`%c[getFormData] Getting data from: ${containerElement.id || 'Advanced Entry Container'}`, 'color: blue;');
         const data = {};
         const inputs = containerElement.querySelectorAll('input[name], select[name]');
         let isValid = true;
         // DO NOT clear errors here, clearAllErrors is called before this in calculateAndDisplay

         const timeMethodRadio = containerElement.querySelector(`input[name^="timeMethod-"]:checked`);
         const isDatesMethod = timeMethodRadio?.value === 'dates';
         const interestTypeSelect = containerElement.querySelector('select[name^="type-"]');
         const isSimpleInterest = interestTypeSelect?.value === 'simple';
         console.log(`[getFormData] Mode checks: isDatesMethod=${isDatesMethod}, isSimpleInterest=${isSimpleInterest}`);

         inputs.forEach(input => {
             const name = input.name.replace(/-\d+$/, '').replace('-simple', ''); // Get base name
             let value = input.value; // Keep original value for checks
             let skipValidation = false;

             const formGroup = input.closest('.form-group');
             const isDurationInput = formGroup?.classList.contains('duration-container') || input.name.includes('duration');
             const isDateInput = formGroup?.classList.contains('dates-container') || input.name.includes('date');
             const isCompoundingInput = formGroup?.classList.contains('compounding-group');

             // Determine if the field should be validated based on current selections
             if (isDurationInput && isDatesMethod) skipValidation = true;
             if (isDateInput && !isDatesMethod) skipValidation = true;
             if (isCompoundingInput && isSimpleInterest) skipValidation = true;

             // Store value: parse numbers, trim strings
             if (input.type === 'number') {
                // Store as number, handle potential empty string -> NaN
                data[name] = value === '' ? NaN : parseFloat(value);
             } else if (input.type === 'date') {
                 data[name] = value; // Store date string
             } else {
                 data[name] = typeof value === 'string' ? value.trim() : value;
             }

             if (!skipValidation) {
                  //console.log(`[getFormData] Validating: ${input.name} (Value: '${value}')`);
                 if (!validateInput(input)) { // validateInput now clears/shows errors itself
                    isValid = false;
                    console.warn(`[getFormData] >> Validation FAILED for: ${input.name} (Value: '${input.value}')`);
                 }
             } else {
                 //console.log(`[getFormData] Skipping validation for: ${input.name}`);
                 clearError(input); // Explicitly clear errors for skipped inputs
             }
         }); // End loop through inputs

         // --- Additional Cross-Field Validations ---
         // Only run if basic individual field validation passed so far
         if (isValid) {
            console.log("[getFormData] Basic validation passed. Running cross-field checks...");
            // 1. Date Order Validation (if dates method selected)
            if (isDatesMethod) {
                 const startDateInput = containerElement.querySelector('input[name^="start-date"]');
                 const endDateInput = containerElement.querySelector('input[name^="end-date"]');
                 // Check if inputs exist AND have values (already validated for required/format)
                 const startValue = startDateInput?.value;
                 const endValue = endDateInput?.value;

                 if (startDateInput && endDateInput && startValue && endValue) {
                     const startDate = new Date(startValue);
                     const endDate = new Date(endValue);
                     // Check validity again just in case
                     if (isNaN(startDate.getTime())) {
                        showError(startDateInput, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false; console.warn(">> Cross-Field: Start Date invalid");
                     } else if (isNaN(endDate.getTime())) {
                         showError(endDateInput, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false; console.warn(">> Cross-Field: End Date invalid");
                     } else if (endDate <= startDate) {
                         showError(endDateInput, CONFIG.ERROR_MESSAGES.dateOrder); isValid = false; console.warn(">> Cross-Field: End Date not after Start Date");
                     } else {
                         console.log("[getFormData] Date order check passed.");
                     }
                 }
                 // Note: Individual required checks for dates happened in validateInput
            }

            // 2. Check for NaN on required number fields AFTER parseFloat
            // This catches non-numeric input in required number fields.
            const requiredNumberFields = [
                { name: 'principal', el: containerElement.querySelector(`input[name^="principal-"]`) },
                { name: 'rate', el: containerElement.querySelector(`input[name^="rate-"]`) },
                { name: 'duration-value', el: containerElement.querySelector(`input[name^="duration-value-"]`) }
            ];

            requiredNumberFields.forEach(field => {
                const inputElement = field.el;
                if (!inputElement) return; // Skip if element doesn't exist (e.g., template)

                const isSkipped = (field.name === 'duration-value' && isDatesMethod);

                // Check if the element exists, is required, wasn't skipped, and its parsed value is NaN
                if (inputElement.required && !isSkipped && isNaN(data[field.name])) {
                    console.warn(`>> NaN Check: Required field '${field.name}' is NaN after parseFloat (Input was: '${inputElement.value}').`);
                    showError(inputElement, CONFIG.ERROR_MESSAGES.numberInvalid);
                    isValid = false;
                }
            });

         } else {
             console.log("[getFormData] Skipping cross-field checks due to earlier validation failure.");
         }

         // Add the timeMethod itself to the data object
         data.timeMethod = containerElement.querySelector(`input[name^="timeMethod-"]:checked`)?.value || 'dates';

         console.log(`%c[getFormData] Final validation status: ${isValid}. Returning ${isValid ? 'data object' : 'null'}.`, isValid ? 'color: green;' : 'color: red;');
         return isValid ? data : null;
    }

    /** Basic Input Validation (called by getFormData) - Clears/Shows errors */
    function validateInput(input) {
        clearError(input); // Always clear previous error first
        const value = input.value.trim();
        const name = input.name;
        let isValid = true;
        const isRequired = input.required;

        // 1. Check required fields
        if (isRequired && !value) {
            showError(input, CONFIG.ERROR_MESSAGES.required);
            return false; // Fail fast if required and empty
        }

        // If not required and empty, it's valid (no further checks needed)
        if (!isRequired && !value) {
            return true;
        }

        // --- Field has a value, proceed with type-specific checks ---
        if (input.type === 'number') {
            // Use the original trimmed value for regex check before parseFloat
            if (!/^-?\d*\.?\d+$/.test(value)) {
                 showError(input, CONFIG.ERROR_MESSAGES.numberInvalid);
                 isValid = false;
             } else {
                 // Value looks like a number, now parse and check range/sign
                 const numValue = parseFloat(value); // Already know it's parsable
                 const minAttr = input.getAttribute('min');
                 const min = (minAttr !== null && !isNaN(parseFloat(minAttr))) ? parseFloat(minAttr) : null;

                 // Check min value if specified
                 if (min !== null && numValue < min) {
                     const msg = (min === 0) ? CONFIG.ERROR_MESSAGES.numberZeroPositive : `Value must be at least ${min}.`;
                     showError(input, msg);
                     isValid = false;
                 }
                 // Check specific positive constraints only if min check passed
                 else if (name?.includes('rate') && numValue <= 0) {
                      showError(input, CONFIG.ERROR_MESSAGES.ratePositive);
                      isValid = false;
                 } else if (name?.includes('duration-value') && numValue <= 0) {
                      showError(input, CONFIG.ERROR_MESSAGES.durationPositive);
                      isValid = false;
                 }
             }

        } else if (input.type === 'date') {
            // Check date validity using built-in validation where possible, plus explicit check
             if (!input.validity.valid || !isValidDate(value)) {
                 showError(input, CONFIG.ERROR_MESSAGES.dateInvalid);
                 isValid = false;
             }
        } else if (input.tagName === 'SELECT' && isRequired && !value) {
             // Handles required selects where the default option has an empty value ""
             showError(input, CONFIG.ERROR_MESSAGES.required);
             isValid = false;
        }
        // Add checks for other input types if needed (e.g., email, pattern)

        // console.log(`[validateInput] Input: ${name}, Value: '${value}', Required: ${isRequired}, Valid: ${isValid}`);
        return isValid;
   }

    /** Perform calculation for a single validated data set */
    function performCalculation(validatedData) {
         console.log('%c[performCalculation] Performing calculation with:', 'color: green;', validatedData);
         try {
             const { principal, rate, ratePeriod, type, compounding, timeMethod, startDate, endDate, durationValue, durationUnit, currency } = validatedData;

             // Ensure principal is a non-negative number (already validated, but safety check)
             const principalVal = Math.max(0, isNaN(principal) ? 0 : principal);
             // Ensure rate is a number (already validated, but safety check)
             const rateVal = isNaN(rate) ? 0 : rate;

             // Rate conversion MUST happen before time calculation for some edge cases
             const rateDecimal = rateVal / 100;
             const annualRate = getAnnualRate(rateDecimal, ratePeriod);

             let timeInYears = 0;
             if (timeMethod === 'dates') {
                 timeInYears = getTimeInYears(startDate, endDate);
             } else {
                 // Ensure durationValue is a number
                 const durationVal = isNaN(durationValue) ? 0 : durationValue;
                 timeInYears = getDurationInYears(durationVal, durationUnit);
             }

             // Handle potentially invalid time calculations returning NaN or negative
             if (isNaN(timeInYears) || timeInYears <= 0) {
                 console.warn("[performCalculation] Time duration is zero, negative, or invalid. Result is principal only.");
                 return {
                    inputs: { ...validatedData, annualRate, timeInYears: 0, compoundsPerYear: 0 },
                    principal: principalVal, interest: 0, finalAmount: principalVal, ear: annualRate, // EAR is just annual rate if t=0
                    timeInYears: 0, error: false // Not an error state, just zero interest
                 };
             }

             console.log(`[performCalculation] Time (Years): ${timeInYears.toFixed(6)}, Annual Rate: ${annualRate.toFixed(6)}`);

             let resultInterest = 0;
             let resultFinalAmount = principalVal;
             let ear = 0;
             let compoundsPerYear = 0; // Initialize

             if (type === 'simple') {
                 resultInterest = calculateSimpleInterest(principalVal, annualRate, timeInYears);
                 resultFinalAmount = principalVal + resultInterest;
                 ear = annualRate; // Simple interest EAR is just the annual rate
                 console.log('[performCalculation] Simple Interest Calculated:', { resultInterest, resultFinalAmount });
             } else { // compound
                 compoundsPerYear = getCompoundsPerYear(compounding);
                 const { interest, finalAmount } = calculateCompoundInterest(principalVal, annualRate, timeInYears, compoundsPerYear);
                 resultInterest = interest;
                 resultFinalAmount = finalAmount;
                 ear = calculateEAR(annualRate, compoundsPerYear);
                 console.log('[performCalculation] Compound Interest Calculated:', { resultInterest, resultFinalAmount, compoundsPerYear, ear });
             }

             // Explicitly check for NaN in final results
             if (isNaN(resultInterest) || isNaN(resultFinalAmount) || isNaN(ear)) {
                 console.error("[performCalculation] Calculation resulted in NaN!", { resultInterest, resultFinalAmount, ear });
                 return { inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear }, principal: principalVal, interest: NaN, finalAmount: NaN, ear: NaN, timeInYears: timeInYears, error: true };
             }

             const finalSummary = {
                 inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear }, // Include calculated intermediates
                 principal: principalVal,
                 interest: resultInterest,
                 finalAmount: resultFinalAmount,
                 ear: ear,
                 timeInYears: timeInYears,
                 error: false
             };
             console.log('%c[performCalculation] Final Summary:', 'color: green; font-weight: bold;', finalSummary);
             return finalSummary;

         } catch (error) {
            console.error("[performCalculation] Unexpected error during calculation:", error);
            return { inputs: validatedData, principal: validatedData.principal || 0, interest: NaN, finalAmount: NaN, ear: NaN, timeInYears: NaN, error: true };
         }
    }

     /** Display results based on the mode and calculated data */
     function displayResults(resultsData) {
         console.log("%c[displayResults] Attempting to display results:", 'color: purple;', resultsData);
         // Start by assuming no errors and hiding previous state
         hideAllResultDisplays();
         let calculationErrorOccurred = false;
         let chartData = null;
         let displayCurrency = CONFIG.DEFAULT_CURRENCY; // Default

         calculationResultsCache = resultsData; // Cache the full results object

         // --- Determine Overall Error State ---
         if (resultsData.mode === 'simple') {
             if (!resultsData.summary || resultsData.summary.error) {
                 calculationErrorOccurred = true;
                 console.error("[displayResults] Simple calculation error detected.");
             } else {
                 displayCurrency = resultsData.summary.inputs.currency;
             }
         } else { // Advanced
             const hasIndividualErrors = resultsData.individual.some(res => !res.summary || res.summary.error || isNaN(res.summary.finalAmount));
             const aggregationFailed = !resultsData.aggregated && resultsData.individual.length > 0 && !hasIndividualErrors; // Aggregation object is null despite valid individual results
             const noValidEntries = resultsData.individual.length === 0; // No entries or all failed validation

             if (hasIndividualErrors || aggregationFailed || noValidEntries) {
                 calculationErrorOccurred = true;
                 console.warn(`[displayResults] Advanced calculation/aggregation error detected. Errors: ${hasIndividualErrors}, Agg Failed: ${aggregationFailed}, No Valid Entries: ${noValidEntries}`);
             }
             // Get display currency from aggregation dropdown if possible, else default
             displayCurrency = dom.aggregationCurrencySelect.value || CONFIG.DEFAULT_CURRENCY;
         }

         // --- Display Simple Results ---
         if (resultsData.mode === 'simple' && resultsData.summary) {
            if (calculationErrorOccurred) {
                 dom.simpleResultsDisplay.innerHTML = `<p class="error-message">${CONFIG.ERROR_MESSAGES.calculationError}</p>`;
             } else {
                 displaySimpleResults(resultsData.summary);
                 chartData = createChartData(resultsData.summary); // Create chart data only if successful
             }
             dom.simpleResultsDisplay.hidden = false;
             dom.resultsArea.hidden = false; // Show results area
             console.log(`[displayResults] Simple results section displayed (Error: ${calculationErrorOccurred})`);
         }
         // --- Display Advanced Results ---
         else if (resultsData.mode === 'advanced' && resultsData.individual.length > 0) {
             // Always display individual results container, even with errors
             displayAdvancedResults(resultsData.individual, resultsData.aggregated);
             dom.advancedResultsDisplay.hidden = false;
             dom.resultsArea.hidden = false; // Show results area

             // Only create chart data if there were NO errors at all and aggregation succeeded
             if (!calculationErrorOccurred && resultsData.aggregated) {
                 chartData = createAggregateChartData(resultsData.aggregated, resultsData.individual);
             }
             console.log(`[displayResults] Advanced results section displayed (Error: ${calculationErrorOccurred})`);
         }
         // --- Handle Case Where No Results Could Be Generated ---
         else if (!resultsData.summary && resultsData.individual.length === 0) {
             console.warn("[displayResults] No valid results generated to display.");
             // Optionally show a message in the results area
             // dom.resultsArea.innerHTML = `<p class="error-message">Could not perform calculations. Please check inputs.</p>`;
             // dom.resultsArea.hidden = false;
             calculationErrorOccurred = true; // Treat no results as an error state
         }


         // --- Update Chart ---
         if (chartData && !calculationErrorOccurred && dom.chartContext) {
             console.log("[displayResults] Valid chart data exists. Updating chart...");
              // Brief delay to allow DOM updates/layout before drawing chart
             setTimeout(() => {
                 updateChart(chartData, displayCurrency);
                 dom.chartArea.hidden = false;
                 console.log("[displayResults] Chart update called and area unhidden.");
             }, CONFIG.RESULTS_VISIBILITY_DELAY);
         } else {
             dom.chartArea.hidden = true; // Ensure chart is hidden if errors or no data/context
             console.log(`[displayResults] Chart area remains hidden. Reason: ${calculationErrorOccurred ? 'Error occurred' : !chartData ? 'No chart data' : 'No chart context'}`);
         }

         // --- Enable/Disable Print Button ---
         dom.printResultsBtn.disabled = calculationErrorOccurred;
         console.log(`[displayResults] Print button disabled: ${calculationErrorOccurred}`);

         // --- Scroll to Results ---
         // Scroll only if the results area is actually visible AND no critical errors prevented display
         if (!dom.resultsArea.hidden && !calculationErrorOccurred) {
            console.log("[displayResults] Scrolling to results area...");
            // Use a small delay to ensure content is rendered before scrolling
            setTimeout(() => {
                dom.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100); // Adjust delay if needed
         } else {
             console.log("[displayResults] Scrolling skipped.");
         }
     }

    function hideAllResultDisplays() {
         dom.resultsArea.hidden = true;
         dom.simpleResultsDisplay.hidden = true;
         dom.advancedResultsDisplay.hidden = true;
         dom.chartArea.hidden = true;
         dom.printResultsBtn.disabled = true; // Disable print by default when hiding
         calculationResultsCache = null; // Clear cache

          // Clear individual results grid and aggregated text
         if(dom.advancedIndividualResultsContainer) dom.advancedIndividualResultsContainer.innerHTML = '';
         if(dom.resultAggPrincipal) dom.resultAggPrincipal.textContent = '';
         if(dom.resultAggInterest) dom.resultAggInterest.textContent = '';
         if(dom.resultAggFinal) dom.resultAggFinal.textContent = '';
         if(dom.resultAggEar) dom.resultAggEar.textContent = '';
         if(dom.aggregationError) dom.aggregationError.textContent = '';
         dom.aggregationCurrencySelect.disabled = true; // Disable currency select when hidden


         // Clear chart data
         if (interestChart) {
             interestChart.data.labels = [];
             interestChart.data.datasets = [];
             interestChart.update('none'); // Update without animation
         }
         console.log("[hideAllResultDisplays] All result displays hidden and chart cleared.");
    }

    function displaySimpleResults(summary) {
        // Assumes summary is valid and not an error object (checked in displayResults)
        const { principal, interest, finalAmount, ear, inputs } = summary;
        const currency = inputs.currency;

        dom.resultSimplePrincipal.textContent = formatCurrency(principal, currency);
        dom.resultSimpleInterest.textContent = formatCurrency(interest, currency);
        dom.resultSimpleFinal.textContent = formatCurrency(finalAmount, currency);
        dom.resultSimpleEar.textContent = formatPercent(ear);

        console.log("[displaySimpleResults] Simple results populated.");
    }

    function displayAdvancedResults(individualResults, aggregatedData) {
         console.log("[displayAdvancedResults] Populating advanced results...");
         // --- Display Individual Results ---
         dom.advancedIndividualResultsContainer.innerHTML = ''; // Clear previous entries
         let allIndividualValid = true;

         individualResults.forEach((entryResult, index) => {
             const entryDiv = document.createElement('div');
             entryDiv.className = 'entry-result';
             const entryId = index + 1; // Use 1-based index for display
             const summary = entryResult.summary;
             const inputs = entryResult.inputs || {}; // Fallback for validation errors
             const currency = inputs.currency || '?'; // Fallback currency

              // Construct heading first
             let headingHTML = `<h4 id="adv-result-heading-${entryId}">Calculation #${entryId}`;
             // Add currency only if known
             if (currency !== '?') {
                 headingHTML += ` (${currency})`;
             }
             headingHTML += `</h4>`;
             entryDiv.innerHTML = headingHTML; // Add heading to div

             // Check for errors (calculation or validation)
             if (!summary || summary.error || isNaN(summary.finalAmount)) {
                  allIndividualValid = false;
                  const errorType = summary?.type === 'validation' ? 'Input Error' : CONFIG.ERROR_MESSAGES.calculationError;
                  const errorP = document.createElement('p');
                  errorP.className = 'error-message';
                  errorP.textContent = errorType;
                  entryDiv.appendChild(errorP);
                  entryDiv.style.borderColor = 'var(--pp-color-danger-light)'; // Indicate error visually
                 console.log(`[displayAdvancedResults] Displaying error for entry #${entryId}`);
             } else {
                 // Create and append result items for valid entries
                 const createItem = (label, value, isTotal = false, isEar = false) => {
                     const itemDiv = document.createElement('div');
                     itemDiv.className = 'result-item';
                     if (isTotal) itemDiv.classList.add('total');
                     if (isEar) itemDiv.classList.add('ear');
                     itemDiv.setAttribute('aria-labelledby', `adv-result-heading-${entryId}`);
                     itemDiv.innerHTML = `<span class="label">${label}:</span><strong class="value">${value}</strong>`;
                     return itemDiv;
                 };

                 entryDiv.appendChild(createItem('Principal', formatCurrency(summary.principal, currency)));
                 entryDiv.appendChild(createItem('Interest', formatCurrency(summary.interest, currency)));
                 entryDiv.appendChild(createItem('EAR', formatPercent(summary.ear), false, true));
                 entryDiv.appendChild(createItem('Final Amount', formatCurrency(summary.finalAmount, currency), true));
             }
             dom.advancedIndividualResultsContainer.appendChild(entryDiv);
         });
         console.log(`[displayAdvancedResults] Individual results populated. All valid: ${allIndividualValid}`);

         // --- Display Aggregated Results (or hide/show error state) ---
         if (aggregatedData) {
             dom.aggregationCurrencySelect.disabled = false;
             dom.advancedAggregatedDisplayContainer.hidden = false;
              if(dom.aggregationError) dom.aggregationError.textContent = ''; // Clear previous errors
             updateAggregatedDisplay(); // Display with current selection
             console.log("[displayAdvancedResults] Aggregated display updated.");
         } else {
             // Aggregation failed or not possible
             dom.aggregationCurrencySelect.disabled = true;
             dom.resultAggPrincipal.textContent = '--';
             dom.resultAggInterest.textContent = '--';
             dom.resultAggFinal.textContent = '--';
             dom.resultAggEar.textContent = '--';
              // Keep existing aggregationError message if it was set (e.g., for conversion error)
              // Make sure the container is visible to show the '--' or error message
             dom.advancedAggregatedDisplayContainer.hidden = false;
             console.log("[displayAdvancedResults] Aggregated data is null or invalid, displaying '--'.");
         }
    }

    function updateAggregatedDisplay() {
         if (!calculationResultsCache || calculationResultsCache.mode !== 'advanced' || !calculationResultsCache.aggregated) {
            console.warn("[updateAggregatedDisplay] No valid aggregated data in cache to display.");
            // Ensure fields are cleared and select disabled if called inappropriately
            dom.resultAggPrincipal.textContent = '--'; dom.resultAggInterest.textContent = '--'; dom.resultAggFinal.textContent = '--'; dom.resultAggEar.textContent = '--';
            if(dom.aggregationError) dom.aggregationError.textContent = '';
            dom.aggregationCurrencySelect.disabled = true;
            return;
        }

         const aggregatedData = calculationResultsCache.aggregated;
         const targetCurrency = dom.aggregationCurrencySelect.value;
         console.log(`[updateAggregatedDisplay] Updating aggregated display to currency: ${targetCurrency}`);

         // Safety check: Ensure base NGN values are valid numbers
         if (isNaN(aggregatedData.principalNGN) || isNaN(aggregatedData.interestNGN) || isNaN(aggregatedData.finalAmountNGN) || isNaN(aggregatedData.blendedEAR)) {
             console.error("[updateAggregatedDisplay] Aggregated NGN base data is invalid (NaN). Cannot display.");
             dom.resultAggPrincipal.textContent = 'Error'; dom.resultAggInterest.textContent = 'Error'; dom.resultAggFinal.textContent = 'Error'; dom.resultAggEar.textContent = 'Error';
             if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.calculationError;
             dom.aggregationCurrencySelect.disabled = true; // Disable select if base data is bad
             return;
         }

         // Perform conversion
         const principal = convertCurrency(aggregatedData.principalNGN, 'NGN', targetCurrency);
         const interest = convertCurrency(aggregatedData.interestNGN, 'NGN', targetCurrency);
         const finalAmount = convertCurrency(aggregatedData.finalAmountNGN, 'NGN', targetCurrency);
         const blendedEAR = aggregatedData.blendedEAR; // EAR doesn't change with currency

         const conversionFailed = isNaN(principal) || isNaN(interest) || isNaN(finalAmount);

         // Function to display value or conversion error message
         const displayOrError = (value) => isNaN(value) ? 'Conv. Error' : formatCurrency(value, targetCurrency);

         // Update DOM elements
         dom.resultAggPrincipal.textContent = displayOrError(principal);
         dom.resultAggInterest.textContent = displayOrError(interest);
         dom.resultAggFinal.textContent = displayOrError(finalAmount);
         dom.resultAggEar.textContent = formatPercent(blendedEAR); // EAR is always percentage

         // Show conversion error message if needed
         if (conversionFailed && dom.aggregationError) {
             dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError;
         } else if (dom.aggregationError) {
             dom.aggregationError.textContent = ''; // Clear error if conversion succeeded
         }

         // Ensure select is enabled (might have been disabled if called with no data initially)
         dom.aggregationCurrencySelect.disabled = false;

         // Update chart currency formatters if chart is visible
         if (interestChart && !dom.chartArea.hidden) {
             console.log(`[updateAggregatedDisplay] Updating chart currency formatters to: ${targetCurrency}`);
             try {
                 // Update Y-axis ticks
                 interestChart.options.scales.y.ticks.callback = value => formatCurrency(value, targetCurrency, true); // Use compact notation for axis

                 // Update tooltips
                 interestChart.options.plugins.tooltip.callbacks.label = context => {
                     let label = context.dataset.label || '';
                     if (label) label += ': ';
                     if (context.parsed.y !== null) {
                         label += formatCurrency(context.parsed.y, targetCurrency);
                     }
                     return label;
                 };
                 interestChart.update('none'); // Update chart without animation
             } catch (e) {
                 console.error("[updateAggregatedDisplay] Error updating chart formatters:", e);
             }
         }
     }

    // --- Calculation Helpers ---

    function getAnnualRate(rateDecimal, ratePeriod) {
        switch (ratePeriod) {
            case 'semi-annual': return rateDecimal * 2;
            case 'quarterly': return rateDecimal * 4;
            case 'monthly': return rateDecimal * 12;
            case 'annual':
            default: return rateDecimal;
        }
    }

    function getTimeInYears(startDateStr, endDateStr) {
        try {
            const start = new Date(startDateStr);
            const end = new Date(endDateStr);
            // Check for invalid dates
            if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
                console.warn(`[getTimeInYears] Invalid date range: ${startDateStr} to ${endDateStr}`);
                return 0;
            }
            // Calculate difference in milliseconds and convert to years (approximate)
            const diffMillis = end.getTime() - start.getTime();
            const years = diffMillis / (1000 * 60 * 60 * 24 * 365.25); // Account for leap years slightly
            return years > 0 ? years : 0;
        } catch (e) {
            console.error("[getTimeInYears] Error parsing dates:", e);
            return 0;
        }
    }

    function getDurationInYears(durationValue, durationUnit) {
        const value = durationValue || 0;
        switch (durationUnit) {
            case 'months': return value / 12;
            case 'days': return value / 365.25; // Approximate
            case 'years':
            default: return value;
        }
    }

    function getCompoundsPerYear(compounding) {
        switch (compounding) {
            case 'semi-annually': return 2;
            case 'quarterly': return 4;
            case 'monthly': return 12;
            case 'daily': return 365; // Common practice, sometimes 360
            case 'annually':
            default: return 1;
        }
    }

    function calculateSimpleInterest(principal, annualRate, timeInYears) {
        // SI = P * R * T
        if (principal < 0 || annualRate < 0 || timeInYears < 0) return 0; // Basic sanity check
        return principal * annualRate * timeInYears;
    }

    function calculateCompoundInterest(principal, annualRate, timeInYears, compoundsPerYear) {
        // A = P * (1 + r/n)^(n*t)
        // Interest = A - P
        if (principal < 0 || annualRate < 0 || timeInYears < 0 || compoundsPerYear <= 0) {
             return { interest: 0, finalAmount: principal }; // Sanity check
        }
        const n = compoundsPerYear;
        const t = timeInYears;
        const r = annualRate;

        // Check for potential issues with large exponents or zero rate
        if (r === 0) {
            return { interest: 0, finalAmount: principal };
        }
        // Calculation
        const amount = principal * Math.pow(1 + (r / n), n * t);
        const interest = amount - principal;

        // Check for NaN result (can happen with extreme values)
        if (isNaN(amount) || isNaN(interest)) {
            console.error("[calculateCompoundInterest] Calculation resulted in NaN.", { principal, annualRate, timeInYears, compoundsPerYear });
            return { interest: NaN, finalAmount: NaN };
        }

        return { interest: interest, finalAmount: amount };
    }

    function calculateEAR(annualRate, compoundsPerYear) {
        // EAR = (1 + r/n)^n - 1
        if (annualRate < 0 || compoundsPerYear <= 0) return 0; // Sanity check
        if (compoundsPerYear === 1) return annualRate; // EAR is just the stated rate if compounded annually

        const n = compoundsPerYear;
        const r = annualRate;
        const ear = Math.pow(1 + (r / n), n) - 1;

        return isNaN(ear) ? 0 : ear; // Return 0 if calculation fails
    }

    // --- Formatting & Utility Helpers ---

    function formatCurrency(value, currencyCode = 'NGN', useCompact = false) {
        if (isNaN(value) || value === null) return '--'; // Handle invalid inputs gracefully
        try {
            const options = {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            };
            if (useCompact && Math.abs(value) >= 1000) {
                options.notation = 'compact';
                options.compactDisplay = 'short';
            }
            return new Intl.NumberFormat(undefined, options).format(value);
        } catch (e) {
            console.warn(`[formatCurrency] Error formatting ${value} as ${currencyCode}:`, e);
            // Fallback formatting
            const symbol = CONFIG.EXCHANGE_RATES[currencyCode] ? currencyCode : 'NGN'; // Basic symbol fallback
            return `${symbol} ${value.toFixed(2)}`;
        }
    }

    function formatPercent(value) {
        if (isNaN(value) || value === null) return '--';
        return new Intl.NumberFormat(undefined, {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    function isValidDate(dateString) {
        if (!dateString) return false;
        // Basic check for YYYY-MM-DD format
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
        const date = new Date(dateString);
        // Check if the date object is valid and the year is reasonable
        return date instanceof Date && !isNaN(date) && date.getFullYear() > 1900 && date.getFullYear() < 2100;
    }

    function convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency || isNaN(amount)) return amount;
        if (!CONFIG.EXCHANGE_RATES[fromCurrency] || !CONFIG.EXCHANGE_RATES[toCurrency]) {
            console.error(`[convertCurrency] Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
            return NaN; // Indicate conversion failure
        }
        try {
            const amountInNGN = amount / CONFIG.EXCHANGE_RATES[fromCurrency];
            const amountInTarget = amountInNGN * CONFIG.EXCHANGE_RATES[toCurrency];
            return amountInTarget;
        } catch (e) {
            console.error("[convertCurrency] Error during conversion:", e);
            return NaN;
        }
    }

    // --- Validation Error Display ---

    function showError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorSpan = formGroup.querySelector('.error-message');
        inputElement.classList.add('is-invalid');
        inputElement.setAttribute('aria-invalid', 'true');
        if (errorSpan) {
            errorSpan.textContent = message;
            // Ensure the error span has an ID for aria-describedby
            const errorId = `${inputElement.id}-error`;
            errorSpan.id = errorId;
            inputElement.setAttribute('aria-describedby', errorId);
        }
    }

    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorSpan = formGroup.querySelector('.error-message');
        inputElement.classList.remove('is-invalid');
        inputElement.removeAttribute('aria-invalid');
        inputElement.removeAttribute('aria-describedby');
        if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.removeAttribute('id'); // Remove ID when error is cleared
        }
    }

    function clearAllErrors(container) {
        container.querySelectorAll('.is-invalid').forEach(clearError);
         // Also clear general aggregation error if present
        if(dom.aggregationError) dom.aggregationError.textContent = '';
    }


    // --- Advanced Mode: Entry Management ---

    function addEntry() {
        const currentEntries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)').length;
        if (currentEntries >= CONFIG.MAX_ADVANCED_ENTRIES) {
            alert(CONFIG.ERROR_MESSAGES.maxEntries);
            return;
        }

        advancedEntryCounter++; // Use a persistent counter for unique IDs
        const newEntry = dom.entryTemplate.cloneNode(true);
        newEntry.hidden = false;
        newEntry.classList.remove('entry-template');
        const entryId = advancedEntryCounter; // Use counter for ID

        // Set unique ID on the fieldset itself
        newEntry.id = `entry-${entryId}`;
        newEntry.dataset.entryId = entryId; // Store ID in data attribute too
        newEntry.setAttribute('aria-labelledby', `entry-legend-${entryId}`); // Reference legend

        // Update IDs, names, fors, aria attributes, etc.
        newEntry.querySelectorAll('[id*="{id}"], [name*="{id}"], [for*="{id}"], [aria-label*="{id}"], [aria-labelledby*="{id}"], [aria-describedby*="{id}"], .entry-number').forEach(el => {
            const replaceId = (attributeValue) => attributeValue ? attributeValue.replace('{id}', entryId) : null;

            if (el.id) el.id = replaceId(el.id);
            if (el.name) el.name = replaceId(el.name);
            if (el.htmlFor) el.htmlFor = replaceId(el.htmlFor);

            const ariaLabel = el.getAttribute('aria-label');
            if (ariaLabel) el.setAttribute('aria-label', replaceId(ariaLabel));

            const ariaLabelledBy = el.getAttribute('aria-labelledby');
            if (ariaLabelledBy) el.setAttribute('aria-labelledby', replaceId(ariaLabelledBy));

            const ariaDescribedBy = el.getAttribute('aria-describedby');
            if (ariaDescribedBy) el.setAttribute('aria-describedby', replaceId(ariaDescribedBy));

             // Update legend ID specifically
            if (el.tagName === 'LEGEND' && el.classList.contains('entry-legend')) {
                el.id = `entry-legend-${entryId}`;
            }

            // Update entry number display
            if (el.classList.contains('entry-number')) {
                el.textContent = entryId; // Use the unique counter ID for display
            }
        });

        resetEntryToDefaults(newEntry, entryId); // Set defaults for the new entry

        // Add event listeners for inputs within the new entry
        newEntry.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', handleInputChange);
            input.addEventListener('change', handleInputChange); // Handle changes for selects/radios
        });

        // Setup remove button
        const removeBtn = newEntry.querySelector('.remove-entry-btn');
        if (removeBtn) {
            removeBtn.hidden = false; // Should always be visible unless it's the only one (handled in updateUI)
            removeBtn.addEventListener('click', handleRemoveEntryClick);
        }

        dom.advancedEntriesContainer.appendChild(newEntry);
        updateAdvancedEntryUI(); // Update numbering, remove buttons, add button state
        hideAllResultDisplays(); // Clear results when structure changes
        console.log(`[addEntry] Added entry #${entryId}`);
    }

    function handleRemoveEntryClick(event) {
        const entryToRemove = event.currentTarget.closest('.entry');
        if (!entryToRemove) return;
        const entryId = entryToRemove.dataset.entryId;
        entryToRemove.remove();
        console.log(`[handleRemoveEntryClick] Removed entry #${entryId}`);
        updateAdvancedEntryUI();
        hideAllResultDisplays(); // Clear results when structure changes
    }

    function updateAdvancedEntryUI() {
        const remainingEntries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)');
        const entryCount = remainingEntries.length;

        remainingEntries.forEach((entry, index) => {
            const displayIndex = index + 1; // 1-based index for display
            const entryId = entry.dataset.entryId; // Get the unique ID

             // Update the displayed number in the legend
             const legend = entry.querySelector('.entry-legend');
             if(legend) {
                 const numberSpan = legend.querySelector('.entry-number');
                 if(numberSpan) numberSpan.textContent = displayIndex; // Display sequential number
                 legend.id = `entry-legend-${entryId}`; // Ensure legend ID matches the stored entryId
                 entry.setAttribute('aria-labelledby', legend.id);
             }


            // Show/hide remove button (hide only if it's the single remaining entry)
            const removeBtn = entry.querySelector('.remove-entry-btn');
            if (removeBtn) {
                removeBtn.hidden = (entryCount <= 1);
                 // Update aria-label with the correct *display* index
                removeBtn.setAttribute('aria-label', `Remove Calculation ${displayIndex}`);
            }
        });

        // Enable/disable the "Add Calculation" button
        dom.addEntryBtn.disabled = (entryCount >= CONFIG.MAX_ADVANCED_ENTRIES);
        console.log(`[updateAdvancedEntryUI] Updated UI for ${entryCount} entries.`);
    }


    // --- Form Reset and Defaults ---

    function handleClearFormClick() {
        console.log("[handleClearFormClick] Clearing form and resetting state.");
        dom.form.reset(); // Resets form controls to initial HTML values
        clearAllErrors(dom.form);
        hideAllResultDisplays();

        // Reset mode to simple
        currentMode = 'simple';
        dom.modeToggleSimple.classList.add('active');
        dom.modeToggleSimple.setAttribute('aria-checked', 'true');
        dom.modeToggleAdvanced.classList.remove('active');
        dom.modeToggleAdvanced.setAttribute('aria-checked', 'false');
        dom.simpleModeContainer.hidden = false;
        dom.advancedModeContainer.hidden = true;
        dom.simpleModeContainer.classList.add('active');
        dom.advancedModeContainer.classList.remove('active');


        // Reset advanced entries
        dom.advancedEntriesContainer.innerHTML = ''; // Clear all existing entries
        advancedEntryCounter = 0; // Reset the counter
        addEntry(); // Add back the initial first entry

        // Explicitly reset simple mode and the *first* advanced entry to configured defaults
        resetEntryToDefaults(dom.simpleModeContainer, 'simple');
        const firstAdvEntry = dom.advancedEntriesContainer.querySelector('.entry:not(.entry-template)');
        if (firstAdvEntry) {
            resetEntryToDefaults(firstAdvEntry, firstAdvEntry.dataset.entryId); // Use its unique ID
        }

        updateAdvancedEntryUI(); // Update remove buttons etc.

        // Reset aggregation currency and disable select
        dom.aggregationCurrencySelect.value = CONFIG.DEFAULT_CURRENCY;
        dom.aggregationCurrencySelect.disabled = true;
        if (dom.aggregationError) dom.aggregationError.textContent = '';

        console.log("[handleClearFormClick] Form cleared and reset to simple mode defaults.");
    }

    function resetEntryToDefaults(container, entryIdSuffix) {
        if (!container) return;
        console.log(`[resetEntryToDefaults] Resetting container for ID suffix: ${entryIdSuffix}`);

        // Helper to select elements within the container using the suffix
        const getEl = (baseSelector) => container.querySelector(baseSelector.replace('{id}', entryIdSuffix));

        // Set default values using CONFIG
        const currencySelect = getEl(`select[name="currency-{id}"]`);
        if (currencySelect) currencySelect.value = CONFIG.DEFAULT_CURRENCY;

        const principalInput = getEl(`input[name="principal-{id}"]`);
        if (principalInput) principalInput.value = CONFIG.DEFAULT_PRINCIPAL;

        const rateInput = getEl(`input[name="rate-{id}"]`);
        if (rateInput) rateInput.value = CONFIG.DEFAULT_RATE;

        const ratePeriodSelect = getEl(`select[name="rate-period-{id}"]`);
        if (ratePeriodSelect) ratePeriodSelect.value = CONFIG.DEFAULT_RATE_PERIOD;

        const typeSelect = getEl(`select[name="type-{id}"]`);
        if (typeSelect) typeSelect.value = CONFIG.DEFAULT_INTEREST_TYPE;

        const compoundingSelect = getEl(`select[name="compounding-{id}"]`);
        if (compoundingSelect) compoundingSelect.value = CONFIG.DEFAULT_COMPOUNDING;

        // Update currency symbol based on default currency
        const symbolSpan = getEl(`.principal-group .currency-symbol`);
        if (symbolSpan) {
             try {
                 const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: CONFIG.DEFAULT_CURRENCY, currencyDisplay: 'narrowSymbol' });
                 const parts = formatter.formatToParts(0);
                 const symbolPart = parts.find(part => part.type === 'currency');
                 symbolSpan.textContent = symbolPart ? symbolPart.value : CONFIG.DEFAULT_CURRENCY;
             } catch (e) { symbolSpan.textContent = CONFIG.DEFAULT_CURRENCY; }
        }

        // Reset Time Period Method to 'dates'
        const timeMethodRadios = container.querySelectorAll(`input[name="timeMethod-{id}"]`);
        const datesContainer = getEl(`#dates-{id}-container`);
        const durationContainer = getEl(`#duration-{id}-container`);
        timeMethodRadios.forEach(radio => {
             radio.checked = (radio.value === 'dates');
        });
        if (datesContainer) datesContainer.hidden = false;
        if (durationContainer) durationContainer.hidden = true;

        // Set default dates
        setInitialDates(container); // Sets start/end dates

        // Set default duration values
        const durationValueInput = getEl(`input[name="duration-value-{id}"]`);
        if (durationValueInput) durationValueInput.value = CONFIG.DEFAULT_DURATION_VALUE;

        const durationUnitSelect = getEl(`select[name="duration-unit-{id}"]`);
        if (durationUnitSelect) durationUnitSelect.value = CONFIG.DEFAULT_DURATION_UNIT;

        // Set visibility of compounding group based on default type
        const compoundingGroup = getEl('.compounding-group');
        if (compoundingGroup) {
             compoundingGroup.hidden = (CONFIG.DEFAULT_INTEREST_TYPE === 'simple');
        }

        // Clear any validation states from these elements
        container.querySelectorAll('input, select').forEach(clearError);
    }

    function setInitialDates(container) {
        if (!container) return;
        // Use querySelectorAll and filter by name attribute starting with 'start-date' or 'end-date'
        const startDateInput = container.querySelector('input[name^="start-date"]');
        const endDateInput = container.querySelector('input[name^="end-date"]');

        if (startDateInput && endDateInput) {
            try {
                const today = new Date();
                const oneYearLater = new Date(today);
                oneYearLater.setFullYear(today.getFullYear() + 1);

                // Format as YYYY-MM-DD
                const formatDate = (date) => date.toISOString().split('T')[0];

                startDateInput.value = formatDate(today);
                endDateInput.value = formatDate(oneYearLater);
            } catch (e) {
                console.error("[setInitialDates] Error setting default dates:", e);
                // Leave inputs empty or set to '' if an error occurs
                startDateInput.value = '';
                endDateInput.value = '';
            }
        }
    }

    // --- Charting ---

    function createChartData(simpleSummary) {
        if (!simpleSummary || simpleSummary.error) return null;

        const { principal, interest, finalAmount, timeInYears, inputs } = simpleSummary;
        const { compoundsPerYear = 1, interestType = 'compound' } = inputs; // Default compoundsPerYear needed for step calculation

        const labels = [];
        const principalData = [];
        const interestData = [];
        const totalData = [];

        // Determine reasonable number of steps for the chart
        const totalPeriods = Math.max(1, Math.round(timeInYears * (interestType === 'compound' ? compoundsPerYear : 1)));
        const stepYears = timeInYears / Math.min(totalPeriods, 10); // Max 10 steps + start/end
        const numSteps = Math.max(1, Math.round(timeInYears / stepYears)); // Ensure at least one step

        for (let i = 0; i <= numSteps; i++) {
            const currentYear = i * stepYears;
            labels.push(`Year ${currentYear.toFixed(currentYear < 1 ? 2 : 1)}`); // More precision for short periods

            let currentInterest, currentFinalAmount;
            if (interestType === 'simple') {
                currentInterest = calculateSimpleInterest(principal, inputs.annualRate, currentYear);
                currentFinalAmount = principal + currentInterest;
            } else {
                const compoundResult = calculateCompoundInterest(principal, inputs.annualRate, currentYear, compoundsPerYear);
                currentInterest = compoundResult.interest;
                currentFinalAmount = compoundResult.finalAmount;
            }

            principalData.push(principal); // Principal is constant
            interestData.push(isNaN(currentInterest) ? 0 : currentInterest);
            totalData.push(isNaN(currentFinalAmount) ? principal : currentFinalAmount);
        }

         // Ensure the final calculated value matches the summary precisely
         if (numSteps * stepYears !== timeInYears) {
             labels[labels.length -1] = `Year ${timeInYears.toFixed(timeInYears < 1 ? 2 : 1)}`; // Correct final label
             interestData[interestData.length - 1] = interest;
             totalData[totalData.length - 1] = finalAmount;
         }


        return {
            labels: labels,
            datasets: [
                {
                    label: 'Principal',
                    data: principalData,
                    backgroundColor: CONFIG.CHART_COLORS.principal,
                    borderColor: CONFIG.CHART_COLORS.borderColor,
                    borderWidth: 1,
                    fill: 'origin', // Fill down to zero
                    order: 3 // Draw last (bottom layer)
                },
                {
                    label: 'Interest',
                    data: interestData,
                    backgroundColor: CONFIG.CHART_COLORS.interest,
                    borderColor: CONFIG.CHART_COLORS.borderColor,
                    borderWidth: 1,
                    fill: '-1', // Fill relative to the dataset above (Principal)
                    order: 2 // Draw second
                },
                 /* // Optional: Line for total amount if stacked area isn't clear enough
                 {
                     label: 'Total Amount',
                     data: totalData,
                     borderColor: CONFIG.CHART_COLORS.total,
                     borderWidth: 2,
                     fill: false,
                     tension: 0.1, // Slight curve
                     pointRadius: 0,
                     type: 'line', // Overlay as line
                     order: 1 // Draw first (top layer)
                 }
                 */
            ]
        };
    }

     function createAggregateChartData(aggregatedData, individualResults) {
         if (!aggregatedData || individualResults.length === 0) return null;

         // Find the maximum timeInYears across all valid individual results
         let maxTimeInYears = 0;
         individualResults.forEach(res => {
             if (res.summary && !res.summary.error && res.summary.timeInYears > maxTimeInYears) {
                 maxTimeInYears = res.summary.timeInYears;
             }
         });

         if (maxTimeInYears <= 0) return null; // No growth to chart

         const labels = [];
         const aggregatePrincipalDataNGN = [];
         const aggregateInterestDataNGN = [];
         const aggregateTotalDataNGN = [];

         // Determine steps based on max time
         const numSteps = Math.min(10, Math.max(1, Math.round(maxTimeInYears * 2))); // More steps for aggregate? Max 10.
         const stepYears = maxTimeInYears / numSteps;

         for (let i = 0; i <= numSteps; i++) {
             const currentYear = i * stepYears;
             labels.push(`Year ${currentYear.toFixed(currentYear < 1 ? 2 : 1)}`);

             let currentTotalPrincipalNGN = 0;
             let currentTotalInterestNGN = 0;
             let currentTotalFinalAmountNGN = 0;

             // Recalculate each individual entry for the currentYear time point
             individualResults.forEach(res => {
                  if (res.summary && !res.summary.error) {
                     const inputs = res.inputs;
                     const principalVal = Math.max(0, inputs.principal || 0);
                     let entryInterest = 0;
                     let entryFinalAmount = principalVal;

                     if (currentYear > 0) { // Only calculate interest if time > 0
                        if (inputs.type === 'simple') {
                            entryInterest = calculateSimpleInterest(principalVal, inputs.annualRate, currentYear);
                            entryFinalAmount = principalVal + entryInterest;
                        } else { // compound
                            const compoundResult = calculateCompoundInterest(principalVal, inputs.annualRate, currentYear, inputs.compoundsPerYear);
                            entryInterest = isNaN(compoundResult.interest) ? 0 : compoundResult.interest;
                            entryFinalAmount = isNaN(compoundResult.finalAmount) ? principalVal : compoundResult.finalAmount;
                        }
                     }

                     // Convert results to NGN for aggregation
                     const principalNGN = convertCurrency(principalVal, inputs.currency, 'NGN');
                     const interestNGN = convertCurrency(entryInterest, inputs.currency, 'NGN');
                     const finalAmountNGN = convertCurrency(entryFinalAmount, inputs.currency, 'NGN');

                     if (!isNaN(principalNGN)) currentTotalPrincipalNGN += principalNGN;
                     if (!isNaN(interestNGN)) currentTotalInterestNGN += interestNGN;
                     if (!isNaN(finalAmountNGN)) currentTotalFinalAmountNGN += finalAmountNGN;
                 }
             });

             aggregatePrincipalDataNGN.push(currentTotalPrincipalNGN);
             aggregateInterestDataNGN.push(currentTotalInterestNGN);
             aggregateTotalDataNGN.push(currentTotalFinalAmountNGN);
         }

          // Ensure the final point matches the calculated aggregate precisely
         if (numSteps * stepYears !== maxTimeInYears) {
             labels[labels.length -1] = `Year ${maxTimeInYears.toFixed(maxTimeInYears < 1 ? 2 : 1)}`; // Correct final label
             aggregatePrincipalDataNGN[aggregatePrincipalDataNGN.length - 1] = aggregatedData.principalNGN;
             aggregateInterestDataNGN[aggregateInterestDataNGN.length - 1] = aggregatedData.interestNGN;
             aggregateTotalDataNGN[aggregateTotalDataNGN.length - 1] = aggregatedData.finalAmountNGN;
         }


         return {
             labels: labels,
             datasets: [
                 {
                     label: 'Total Principal (NGN Eq.)',
                     data: aggregatePrincipalDataNGN,
                     backgroundColor: CONFIG.CHART_COLORS.principal,
                     borderColor: CONFIG.CHART_COLORS.borderColor,
                     borderWidth: 1,
                     fill: 'origin',
                     order: 3
                 },
                 {
                     label: 'Total Interest (NGN Eq.)',
                     data: aggregateInterestDataNGN,
                     backgroundColor: CONFIG.CHART_COLORS.interest,
                     borderColor: CONFIG.CHART_COLORS.borderColor,
                     borderWidth: 1,
                     fill: '-1', // Stack on top of principal
                     order: 2
                 },
                /* // Optional: Line for total amount
                 {
                     label: 'Total Final Amount (NGN Eq.)',
                     data: aggregateTotalDataNGN,
                     borderColor: CONFIG.CHART_COLORS.total,
                     borderWidth: 2,
                     fill: false,
                     tension: 0.1,
                     pointRadius: 0,
                     type: 'line',
                     order: 1
                 }
                 */
             ]
         };
     }

    function updateChart(chartData, displayCurrency) {
        if (!dom.chartContext) {
            console.error("[updateChart] Chart context not available.");
            return;
        }
        if (!chartData || !chartData.labels || !chartData.datasets) {
            console.warn("[updateChart] Invalid or missing chart data provided.");
            // Optionally clear the chart if invalid data is given
            if (interestChart) {
                interestChart.data.labels = [];
                interestChart.data.datasets = [];
                interestChart.update('none');
            }
            return;
        }

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: 'Time' },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    stacked: true, // Important for area chart stacking
                    title: { display: true, text: `Amount (${displayCurrency})` },
                    ticks: {
                        // Callback to format Y-axis ticks as currency
                        callback: value => formatCurrency(value, displayCurrency, true) // Use compact notation
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index', // Show tooltip for all datasets at the same x-index
                    intersect: false,
                    callbacks: {
                        // Callback to format tooltip values as currency
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Need to convert NGN equivalent back for display if aggregate chart
                                let valueToFormat = context.parsed.y;
                                if (calculationResultsCache?.mode === 'advanced' && displayCurrency !== 'NGN') {
                                     // Chart data is in NGN, convert back to displayCurrency for tooltip
                                     valueToFormat = convertCurrency(context.parsed.y, 'NGN', displayCurrency);
                                }
                                // For simple mode, chart data is already in the correct currency
                                label += formatCurrency(valueToFormat, displayCurrency);
                            }
                            return label;
                        }
                    }
                }
            },
             // Default chart type
             type: 'line', // Line chart allows stacking areas better via 'fill'
             interaction: { // Better tooltip triggering
                mode: 'nearest',
                axis: 'x',
                intersect: false
             }
        };

        if (!interestChart) {
            // Create new chart instance
            console.log("[updateChart] Creating new chart instance.");
            interestChart = new Chart(dom.chartContext, {
                type: 'line', // Base type
                data: chartData,
                options: chartOptions
            });
        } else {
            // Update existing chart instance
            console.log("[updateChart] Updating existing chart instance.");
            interestChart.data = chartData;
             // Update options that might change (like currency formatting)
             interestChart.options.scales.y.title.text = `Amount (${displayCurrency})`;
             interestChart.options.scales.y.ticks.callback = value => formatCurrency(value, displayCurrency, true);
             interestChart.options.plugins.tooltip.callbacks.label = function (context) {
                 let label = context.dataset.label || '';
                 if (label) { label += ': '; }
                 if (context.parsed.y !== null) {
                     let valueToFormat = context.parsed.y;
                     if (calculationResultsCache?.mode === 'advanced' && displayCurrency !== 'NGN') {
                         valueToFormat = convertCurrency(context.parsed.y, 'NGN', displayCurrency);
                     }
                     label += formatCurrency(valueToFormat, displayCurrency);
                 }
                 return label;
             };
            interestChart.update(); // Use default animation
        }
    }


    // --- Other Event Handlers ---
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent default form submission
        console.log("%c[handleFormSubmit] Form submitted.", 'color: orange; font-weight: bold;');
        // Disable button temporarily to prevent double-clicks? (Optional)
        // dom.calculateBtn.disabled = true;
        calculateAndDisplay();
        // Re-enable button after calculation (needs careful handling if calc is async)
        // dom.calculateBtn.disabled = false;
    }

    function handlePrintResultsClick() {
        console.log("[handlePrintResultsClick] Printing results...");
        // Optional: You could temporarily apply a class to the body for print-specific JS hooks if needed
        // document.body.classList.add('is-printing');
        window.print();
        // Remove class after print dialog closes (might require timeout)
        // setTimeout(() => document.body.classList.remove('is-printing'), 1000);
    }

    function handleAggregationCurrencyChange() {
        console.log("[handleAggregationCurrencyChange] Aggregation currency changed.");
        // This only needs to re-render the aggregated part and update the chart formatters
        updateAggregatedDisplay();
    }

    function updateCopyrightYear() {
        if (dom.currentYearSpan) {
            dom.currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- Initialization ---
    function init() {
        if (!cacheDOMElements()) {
            console.error("Initialization failed due to missing DOM elements.");
            return; // Stop initialization if critical elements are missing
        }
        console.log("[init] DOM elements cached successfully.");

        // Set initial state
        dom.simpleModeContainer.hidden = false; // Show simple mode by default
        dom.advancedModeContainer.hidden = true;
        dom.simpleModeContainer.classList.add('active');
        dom.modeToggleSimple.classList.add('active');
        dom.modeToggleSimple.setAttribute('aria-checked', 'true');


        // Set default values for simple mode
        resetEntryToDefaults(dom.simpleModeContainer, 'simple');

        // Set up advanced mode (add first entry, hide it)
        addEntry(); // Adds the first entry with defaults
        updateAdvancedEntryUI(); // Ensures remove button is hidden on the first entry

        // Hide results initially
        hideAllResultDisplays();
        dom.aggregationCurrencySelect.disabled = true; // Disable aggregate currency initially

        // Attach Event Listeners
        dom.modeToggleSimple.addEventListener('click', handleModeToggleClick);
        dom.modeToggleAdvanced.addEventListener('click', handleModeToggleClick);

        // Use event delegation on the form for input/change events for performance,
        // especially with dynamically added advanced entries.
        dom.form.addEventListener('input', handleInputChange);
        dom.form.addEventListener('change', handleInputChange); // Catches changes in selects, radios

        dom.form.addEventListener('submit', handleFormSubmit);
        dom.clearFormBtn.addEventListener('click', handleClearFormClick);
        dom.printResultsBtn.addEventListener('click', handlePrintResultsClick);
        dom.aggregationCurrencySelect.addEventListener('change', handleAggregationCurrencyChange);

        // Add Entry button listener (if it exists)
        if (dom.addEntryBtn) {
            dom.addEntryBtn.addEventListener('click', addEntry);
        } else {
            console.warn("[init] Add Entry button not found. Advanced mode might be limited.");
        }

        // Update footer copyright year
        updateCopyrightYear();

        console.info("Interest Calculator Initialized (v1.2.1). Ready.");
    }

    // --- Start the application ---
    // Ensure DOM is ready before running init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOMContentLoaded has already fired
        init();
    }

})(); // End IIFE
