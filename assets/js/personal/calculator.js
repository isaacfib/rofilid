/**
 * ROFILID Interest Calculator Script - v1.3.0
 * Location: /assets/js/personal/calculator.js
 * Description: Handles calculations, UI updates, validation, mode switching,
 *              and chart generation for the interest calculator tool.
 *              Currency conversion features have been removed.
 *              Aggregation only occurs if all advanced entries use the same currency.
 * Dependencies: Chart.js (ensure loaded), calculator.css, personal.css
 */
(function () {
    'use strict';
'use strict';
    // --- Configuration ---
    // Define the value separately first
    const MAX_ADVANCED_ENTRIES_VALUE = 10; // Define the numeric value here

    const CONFIG = {
        MAX_ADVANCED_ENTRIES: MAX_ADVANCED_ENTRIES_VALUE, // Use the separate value
        DEFAULT_CURRENCY: 'NGN',
        DEFAULT_PRINCIPAL: 10000,
        DEFAULT_RATE: 5,
        DEFAULT_RATE_PERIOD: 'annual',
        DEFAULT_INTEREST_TYPE: 'compound',
        DEFAULT_COMPOUNDING: 'annually', // Changed default
        DEFAULT_DURATION_VALUE: 1,
        DEFAULT_DURATION_UNIT: 'years',
        RESULTS_VISIBILITY_DELAY: 50, // ms delay before showing results/chart
        ERROR_MESSAGES: {
            required: 'This field is required.',
            numberInvalid: 'Please enter a valid number.',
            numberPositive: 'Please enter a positive number (greater than 0).',
            numberZeroPositive: 'Please enter a number 0 or greater.',
            principalZeroPositive: 'Principal must be 0 or greater.',
            ratePositive: 'Interest rate must be positive (greater than 0).',
            durationPositive: 'Duration must be positive (greater than 0).',
            dateInvalid: 'Please enter a valid date (YYYY-MM-DD).',
            dateOrder: 'End date must be after start date.',
            // Use the separate constant here inside the template literal
            maxEntries: `You can add a maximum of ${MAX_ADVANCED_ENTRIES_VALUE} calculations.`,
            calculationError: 'Calculation failed. Please check inputs.',
            aggregationMismatch: 'Cannot aggregate totals because calculations use different currencies.',
            aggregationError: 'Cannot aggregate totals due to calculation errors in individual entries.',
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
            aggregationStatusMessage: '#aggregation-status', // Changed from error span
            aggPrincipalItem: '#agg-principal-item', // Container items for agg results
            aggInterestItem: '#agg-interest-item',
            aggEarItem: '#agg-ear-item',
            aggFinalItem: '#agg-final-item',
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
                // Avoid breaking JS completely, but log clearly
            }
        }

        // Check for chart context specifically if chartCanvas exists
        if (dom.chartCanvas) {
            try {
                dom.chartContext = dom.chartCanvas.getContext('2d');
                if (!dom.chartContext) {
                    console.error("[cacheDOMElements] Failed to get 2D context for chart canvas.");
                    allFound = false; // Chart is critical for full function
                }
            } catch (e) {
                console.error("[cacheDOMElements] Error getting chart context:", e);
                dom.chartContext = null;
                allFound = false;
            }
        } else {
             dom.chartContext = null; // Set to null if canvas itself is missing
             // Don't mark as critical failure if chart isn't essential for basic calculation
             console.warn("[cacheDOMElements] Chart canvas element not found.");
        }


        if (!allFound && !dom.form) { // If the form itself is missing, it's fatal
            alert("Initialization failed: Essential page elements are missing. Please contact support.");
            return false;
        } else if (!allFound) {
            console.warn("Initialization warning: Some non-critical page elements are missing. Functionality may be limited.");
        }
        return true; // Allow initialization even if non-critical elements missing
    }


    // --- Event Handlers ---

    function handleModeToggleClick(event) {
        const clickedButton = event.currentTarget;
        const newMode = clickedButton.dataset.mode;

        if (newMode === currentMode || !newMode) return; // No change or invalid button

        currentMode = newMode;
        console.log(`[handleModeToggleClick] Mode switched to: ${currentMode}`);

        // Update button states
        dom.modeToggleSimple?.classList.toggle('active', currentMode === 'simple');
        dom.modeToggleSimple?.setAttribute('aria-checked', currentMode === 'simple');
        dom.modeToggleAdvanced?.classList.toggle('active', currentMode === 'advanced');
        dom.modeToggleAdvanced?.setAttribute('aria-checked', currentMode === 'advanced');

        // Update container visibility
        if (dom.simpleModeContainer) dom.simpleModeContainer.hidden = (currentMode !== 'simple');
        if (dom.advancedModeContainer) dom.advancedModeContainer.hidden = (currentMode !== 'advanced');
        if (dom.simpleModeContainer) dom.simpleModeContainer.classList.toggle('active', currentMode === 'simple');
        if (dom.advancedModeContainer) dom.advancedModeContainer.classList.toggle('active', currentMode === 'advanced');

        hideAllResultDisplays(); // Hide results when mode changes
        updateCalculateButtonState(); // Check if form is valid in new mode
    }

    function handleInputChange(event) {
        const input = event.target;
        // Lightweight validation on input/change is good UX
        if (input.tagName === 'INPUT' || input.tagName === 'SELECT') {
            validateInput(input); // Validate the single input that changed
        }

        // Find the direct parent container (simple mode or specific advanced entry)
        const entryContainer = input.closest('.calculator-mode, .entry');
        if (!entryContainer) return;

        // --- 1. Dynamic Currency Symbol Update ---
        if (input.matches('select[name^="currency-"]')) {
            updateCurrencySymbol(input.value, entryContainer);
        }

        // --- 2. Conditional Visibility: Compounding Frequency ---
        if (input.matches('select[name^="type-"]')) {
            const compoundingGroup = entryContainer.querySelector('.compounding-group');
            if (compoundingGroup) {
                const isSimple = (input.value === 'simple');
                compoundingGroup.hidden = isSimple;
                // Also update requirement on compounding select
                const compoundingSelect = compoundingGroup.querySelector('select');
                if (compoundingSelect) {
                    compoundingSelect.required = !isSimple;
                     if (isSimple) clearError(compoundingSelect); // Clear error if hidden
                     else validateInput(compoundingSelect); // Re-validate if shown
                }
            }
        }

        // --- 3. Conditional Visibility: Dates vs. Duration ---
        if (input.matches('input[type="radio"][name^="timeMethod-"]')) {
            toggleTimeInputs(entryContainer, input.value === 'dates');
        }

        // --- 4. Clear results if any input changes (prevents stale results) ---
        // Debounce this if it causes performance issues on rapid input
        hideAllResultDisplays();
        updateCalculateButtonState(); // Re-check overall form validity
    }

    /** Toggles visibility and requirements for date/duration inputs */
    function toggleTimeInputs(container, useDates) {
        const datesContainer = container.querySelector('.dates-container');
        const durationContainer = container.querySelector('.duration-container');

        if (datesContainer && durationContainer) {
            datesContainer.hidden = !useDates;
            durationContainer.hidden = useDates;

            // Update required attribute and clear errors
            datesContainer.querySelectorAll('input[type="date"]').forEach(inp => {
                inp.required = useDates;
                if (!useDates) clearError(inp); else validateInput(inp);
            });
            durationContainer.querySelectorAll('input[type="number"], select').forEach(inp => {
                inp.required = !useDates;
                if (useDates) clearError(inp); else validateInput(inp);
            });
        }
    }

    /** Updates the currency symbol display for a given entry */
    function updateCurrencySymbol(currencyCode, entryContainer) {
        const principalGroup = entryContainer.querySelector('.principal-group');
        if (principalGroup) {
            const symbolSpan = principalGroup.querySelector('.currency-symbol');
            if (symbolSpan) {
                try {
                    // Use Intl.NumberFormat to get the symbol (most reliable)
                    const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode, currencyDisplay: 'narrowSymbol' });
                    const parts = formatter.formatToParts(0);
                    const symbolPart = parts.find(part => part.type === 'currency');
                    symbolSpan.textContent = symbolPart ? symbolPart.value : currencyCode; // Fallback to code
                } catch (e) {
                    console.warn(`[updateCurrencySymbol] Could not format currency symbol for ${currencyCode}. Falling back to code.`);
                    symbolSpan.textContent = currencyCode; // Use code as fallback
                }
            }
        }
    }

     // --- Main Calculation Orchestration ---
     function calculateAndDisplay() {
         console.log("%c[calculateAndDisplay] Initiating Calculation...", 'color: blue; font-weight: bold;');
         clearAllErrors(dom.form); // Clear previous validation errors globally first
         hideAllResultDisplays(); // Ensure results are hidden initially

         let overallValid = true;
         let resultsData = { mode: currentMode, summary: null, individual: [], aggregated: null, sharedCurrency: null };
         let calculationPerformed = false;

         if (currentMode === 'simple') {
             console.log("[calculateAndDisplay] Mode: simple. Validating and getting form data...");
             const data = getFormData(dom.simpleModeContainer);

             if (data) {
                 console.log("[calculateAndDisplay] Simple mode data VALID. Performing calculation...", data);
                 resultsData.summary = performCalculation(data);
                 calculationPerformed = true;
                  if (!resultsData.summary || resultsData.summary.error || isNaN(resultsData.summary.finalAmount)) {
                     console.error("[calculateAndDisplay] Simple calculation FAILED or returned error/NaN.", resultsData.summary);
                     overallValid = false;
                     if(resultsData.summary) resultsData.summary.error = true; else resultsData.summary = { error: true, inputs: data || {} }; // Ensure error flag and inputs are set
                  } else {
                      console.log("[calculateAndDisplay] Simple calculation SUCCESSFUL.");
                  }
             } else {
                 overallValid = false;
                 console.warn("[calculateAndDisplay] Simple mode validation FAILED.");
             }
         } else { // Advanced Mode
             console.log("[calculateAndDisplay] Mode: advanced. Processing entries...");
             let firstCurrency = null;
             let currencyMismatch = false;
             let hasSuccessfulEntry = false;

             const entries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)');
             if (entries.length === 0) {
                console.warn("[calculateAndDisplay] Advanced mode has no entries to calculate.");
                overallValid = false;
             }

              for (let i = 0; i < entries.length; i++) {
                  const entry = entries[i];
                  const entryIndex = i + 1;
                  console.log(`%c[calculateAndDisplay] Validating/getting data for advanced entry #${entryIndex}...`, 'color: blue;');
                  const entryData = getFormData(entry);

                  if (entryData) {
                      console.log(`[calculateAndDisplay] Advanced entry #${entryIndex} data VALID. Performing calculation...`, entryData);
                      const entryCalcResult = performCalculation(entryData);
                      calculationPerformed = true; // Mark that at least one calc was tried

                      if (!entryCalcResult || entryCalcResult.error || isNaN(entryCalcResult.finalAmount)) {
                          console.error(`[calculateAndDisplay] Advanced entry #${entryIndex} calculation FAILED or returned error/NaN.`, entryCalcResult);
                          resultsData.individual.push({ inputs: entryData || {}, summary: { error: true, type: 'calculation', principal: entryData?.principal || 0, inputs: entryData || {} } });
                          overallValid = false; // Mark overall as invalid if any entry calc fails
                      } else {
                          console.log(`[calculateAndDisplay] Advanced entry #${entryIndex} calculation SUCCESSFUL.`);
                          resultsData.individual.push({ inputs: entryData, summary: entryCalcResult });
                          hasSuccessfulEntry = true;

                          // Check for currency consistency FOR AGGREGATION
                          if (firstCurrency === null) {
                              firstCurrency = entryData.currency; // Set currency from first valid entry
                          } else if (entryData.currency !== firstCurrency) {
                              currencyMismatch = true; // Found a different currency
                          }
                      }
                  } else {
                      overallValid = false; // Validation failed for this entry
                      console.warn(`[calculateAndDisplay] Advanced entry #${entryIndex} validation FAILED.`);
                       // Try to get basic input data for error display even if validation failed
                       const failedInputs = {};
                       entry.querySelectorAll('input[name], select[name]').forEach(inp => {
                         const baseName = inp.name.replace(/-\d+$/, ''); // Simple name extraction
                         failedInputs[baseName] = inp.value;
                       });
                      resultsData.individual.push({ inputs: failedInputs, summary: { error: true, type: 'validation', principal: parseFloat(failedInputs.principal) || 0, inputs: failedInputs } });
                  }
              } // End loop through entries

              // Calculate aggregate totals ONLY IF:
              // 1. Overall validation passed for ALL entries.
              // 2. At least one entry calculation succeeded.
              // 3. All successful entries share the SAME currency.
              if (overallValid && hasSuccessfulEntry && !currencyMismatch) {
                  console.log(`[calculateAndDisplay] Calculating aggregated results in currency: ${firstCurrency}...`);
                  let totalPrincipal = 0, totalInterest = 0, totalFinalAmount = 0;
                  let weightedEARSum = 0;
                  let totalValidPrincipalForEAR = 0; // Denominator for EAR weighting

                  resultsData.individual.forEach(res => {
                       // Should only contain valid results if overallValid is true
                       totalPrincipal += res.summary.principal;
                       totalInterest += res.summary.interest;
                       totalFinalAmount += res.summary.finalAmount;

                       // Weight EAR by principal amount
                       if (res.summary.principal > 0 && res.summary.ear !== undefined) {
                            weightedEARSum += res.summary.ear * res.summary.principal;
                            totalValidPrincipalForEAR += res.summary.principal;
                       } else if (res.summary.principal === 0 && res.summary.ear !== undefined && resultsData.individual.length === 1) {
                           // Special case: single entry with zero principal, EAR is just that entry's EAR
                           weightedEARSum = res.summary.ear;
                           totalValidPrincipalForEAR = 0; // Avoid division by zero later
                       }
                  });

                  // Calculate blended EAR
                  const blendedEAR = (totalValidPrincipalForEAR > 0)
                      ? (weightedEARSum / totalValidPrincipalForEAR)
                      : (resultsData.individual.length === 1 ? weightedEARSum : 0); // Use single entry EAR or 0 if multiple zero-principal entries


                  resultsData.aggregated = {
                      principal: totalPrincipal,
                      interest: totalInterest,
                      finalAmount: totalFinalAmount,
                      blendedEAR: blendedEAR
                  };
                  resultsData.sharedCurrency = firstCurrency; // Store the currency used for aggregation
                  console.log("[calculateAndDisplay] Aggregated results calculated:", resultsData.aggregated);
              } else {
                  resultsData.aggregated = null; // Aggregation not possible
                  resultsData.sharedCurrency = null;
                   if (currencyMismatch) {
                       console.warn("[calculateAndDisplay] Aggregation skipped: Currency mismatch.");
                       resultsData.aggregationMessage = CONFIG.ERROR_MESSAGES.aggregationMismatch;
                   } else if (!overallValid && calculationPerformed) {
                       console.warn("[calculateAndDisplay] Aggregation skipped: Validation/Calculation errors present.");
                       resultsData.aggregationMessage = CONFIG.ERROR_MESSAGES.aggregationError;
                   } else {
                       console.warn("[calculateAndDisplay] Aggregation skipped: No successful entries or other issue.");
                       // No specific message needed if just no entries or validation failed before calc attempt
                   }
              }
          } // End advanced mode processing

          console.log("[calculateAndDisplay] Final Check:", { overallValid, calculationPerformed, resultsData });

          // Display results or appropriate error messages
          if (calculationPerformed || (currentMode === 'advanced' && resultsData.individual.length > 0)) {
               console.log("[calculateAndDisplay] Validation/Calculation completed. Calling displayResults...");
               displayResults(resultsData);
          } else if (!overallValid) {
              console.warn("[calculateAndDisplay] Hiding results: Form validation failed before calculation attempt.");
              hideAllResultDisplays(); // Validation errors shown on form
          } else {
               console.warn("[calculateAndDisplay] Hiding results: No calculation performed/attempted.");
              hideAllResultDisplays();
          }
           updateCalculateButtonState(); // Ensure button state reflects final validity
      }

    /** Validate and get form data for a specific entry container */
    function getFormData(containerElement) {
         console.log(`%c[getFormData] Getting data from: ${containerElement.id || 'Advanced Entry Container'}`, 'color: blue;');
         const data = {};
         const inputs = containerElement.querySelectorAll('input[name], select[name]');
         let isValid = true;
         // Individual input validation status map
         const validationStatus = {};

         const timeMethodRadio = containerElement.querySelector(`input[name^="timeMethod-"]:checked`);
         const isDatesMethod = timeMethodRadio?.value === 'dates';
         const interestTypeSelect = containerElement.querySelector('select[name^="type-"]');
         const isSimpleInterest = interestTypeSelect?.value === 'simple';
         // console.log(`[getFormData] Mode checks: isDatesMethod=${isDatesMethod}, isSimpleInterest=${isSimpleInterest}`);

         // --- Pass 1: Individual Input Validation & Data Type Conversion ---
         inputs.forEach(input => {
             const name = input.name.replace(/-\d+$/, '').replace('-simple', ''); // Get base name
             let value = input.value;
             let skipValidation = false;

             const formGroup = input.closest('.form-group');
             const isDurationInput = formGroup?.classList.contains('duration-container') || input.name.includes('duration');
             const isDateInput = formGroup?.classList.contains('dates-container') || input.name.includes('date');
             const isCompoundingInput = formGroup?.classList.contains('compounding-group');

             // Determine if the field should be *actively* validated based on current selections
             if (isDurationInput && isDatesMethod) skipValidation = true;
             if (isDateInput && !isDatesMethod) skipValidation = true;
             if (isCompoundingInput && isSimpleInterest) skipValidation = true;

             // Store raw value temporarily for validation, then parse
             const rawValue = value;

             // Perform validation if not skipped
             if (!skipValidation) {
                 validationStatus[input.name] = validateInput(input);
                 if (!validationStatus[input.name]) {
                     isValid = false; // Mark overall as invalid if any input fails
                     console.warn(`[getFormData] >> Validation FAILED for: ${input.name} (Value: '${rawValue}')`);
                 }
             } else {
                 validationStatus[input.name] = true; // Mark skipped as valid for now
                 clearError(input); // Explicitly clear errors for skipped inputs
             }

             // Store value: parse numbers AFTER basic validation, trim strings
             if (input.type === 'number') {
                // Store as number; handle empty/invalid string -> NaN
                // Only parse if basic validation (like required) passed and not skipped
                if (!skipValidation && validationStatus[input.name] && rawValue !== '') {
                     data[name] = parseFloat(rawValue);
                     // Additional NaN check specifically after parseFloat if it was required
                     if (input.required && isNaN(data[name])) {
                         console.warn(`>> NaN Check: Required field '${name}' is NaN after parseFloat (Input was: '${rawValue}').`);
                         showError(input, CONFIG.ERROR_MESSAGES.numberInvalid);
                         isValid = false;
                         validationStatus[input.name] = false;
                     }
                } else if (input.required && rawValue === '') {
                    // Already handled by validateInput(required), but ensure data[name] isn't set
                    data[name] = NaN; // Or null, but NaN signals numeric intent failure
                } else {
                    // Not required and empty, or skipped
                     data[name] = rawValue === '' ? null : parseFloat(rawValue); // Store null or parsed number
                }
             } else if (input.type === 'date') {
                 data[name] = rawValue; // Store date string
             } else {
                 data[name] = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
             }

         }); // End loop through inputs

         // --- Pass 2: Additional Cross-Field Validations ---
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
                      // Re-validate date formats just in case (although validateInput should catch it)
                      if (!isValidDate(startValue)) {
                          showError(startDateInput, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false; console.warn(">> Cross-Field: Start Date invalid format.");
                      } else if (!isValidDate(endValue)) {
                          showError(endDateInput, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false; console.warn(">> Cross-Field: End Date invalid format.");
                      } else {
                          // Dates look valid, check order
                         const startDate = new Date(startValue + "T00:00:00Z"); // Use UTC to avoid timezone issues
                         const endDate = new Date(endValue + "T00:00:00Z");

                         // Check time difference (>= 0 check already done by validateInput on dates)
                         if (endDate <= startDate) {
                             showError(endDateInput, CONFIG.ERROR_MESSAGES.dateOrder); isValid = false; console.warn(">> Cross-Field: End Date not after Start Date");
                         } else {
                             console.log("[getFormData] Date order check passed.");
                         }
                      }
                 }
                 // Note: Individual required/format checks for dates happened in validateInput
            }

            // 2. Positive value checks (that depend on the input being a valid number first)
            if (data.principal !== null && !isNaN(data.principal) && data.principal < 0) {
                showError(containerElement.querySelector('input[name^="principal"]'), CONFIG.ERROR_MESSAGES.principalZeroPositive); isValid = false;
            }
            if (data.rate !== null && !isNaN(data.rate) && data.rate <= 0) {
                 showError(containerElement.querySelector('input[name^="rate"]'), CONFIG.ERROR_MESSAGES.ratePositive); isValid = false;
            }
            if (!isDatesMethod && data['duration-value'] !== null && !isNaN(data['duration-value']) && data['duration-value'] <= 0) {
                 showError(containerElement.querySelector('input[name^="duration-value"]'), CONFIG.ERROR_MESSAGES.durationPositive); isValid = false;
            }

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

        // Use Constraint Validation API where possible
        if (!input.validity.valid) {
            // Determine specific error message based on validity state
            if (input.validity.valueMissing && isRequired) {
                showError(input, CONFIG.ERROR_MESSAGES.required);
            } else if (input.validity.badInput) {
                 showError(input, (input.type === 'date') ? CONFIG.ERROR_MESSAGES.dateInvalid : CONFIG.ERROR_MESSAGES.numberInvalid);
            } else if (input.validity.rangeUnderflow) {
                const min = input.getAttribute('min');
                const msg = (min === '0') ? CONFIG.ERROR_MESSAGES.numberZeroPositive : `Value must be at least ${min}.`;
                 showError(input, msg);
            } else if (input.validity.rangeOverflow) {
                const max = input.getAttribute('max');
                 showError(input, `Value must be no more than ${max}.`);
            } else if (input.type === 'date' && value && !isValidDate(value)) {
                 // Catch date formats browsers might allow but we don't (e.g. MM/DD/YYYY)
                 showError(input, CONFIG.ERROR_MESSAGES.dateInvalid);
            }
            // Add other validity checks if needed (patternMismatch, typeMismatch etc.)
            else {
                 // Generic fallback if validity is false but no specific case matched
                 showError(input, CONFIG.ERROR_MESSAGES.required); // Often required is the issue
            }
            isValid = false;
        }

        // Additional Custom Validations (if Constraint API isn't sufficient)
        if (isValid && input.type === 'number') {
            const numValue = parseFloat(value); // Parse only if basic validity passed
             // Check specific positive constraints (Constraint API doesn't easily handle > 0 vs >= 0)
             if (name?.includes('rate') && numValue <= 0) {
                  showError(input, CONFIG.ERROR_MESSAGES.ratePositive);
                  isValid = false;
             } else if (name?.includes('duration-value') && numValue <= 0) {
                  // Check if duration is the active method before applying this rule
                  const container = input.closest('.calculator-mode, .entry');
                  const timeMethodRadio = container?.querySelector(`input[name^="timeMethod-"]:checked`);
                  if (timeMethodRadio?.value === 'duration') {
                      showError(input, CONFIG.ERROR_MESSAGES.durationPositive);
                      isValid = false;
                  }
             }
        }

        // console.log(`[validateInput] Input: ${name}, Value: '${value}', Required: ${isRequired}, Valid: ${isValid}`);
        return isValid;
   }

/** Perform calculation for a single validated data set */
function performCalculation(validatedData) {
     // --->>> ADDED LOG 1: Check validated data received <<<---
     console.log('%c[performCalculation] RECEIVED validatedData:', 'color: blue;', JSON.stringify(validatedData, null, 2)); // Pretty print JSON
     try {
         // Destructure with safe defaults
         const {
             principal = 0, rate = 0, ratePeriod = 'annual', type = 'compound',
             compounding = 'annually', timeMethod = 'dates', startDate = null, endDate = null,
             'duration-value': durationValue = 0, // Use bracket notation for hyphenated key
             durationUnit = 'years', currency = CONFIG.DEFAULT_CURRENCY
         } = validatedData;

         // --->>> ADDED LOG 2: Check initial destructured values <<<---
         console.log('[performCalculation] Initial values:', { principal, rate, ratePeriod, type, compounding, timeMethod, startDate, endDate, durationValue, durationUnit, currency });

         // Ensure critical inputs are valid numbers (already validated, but belt-and-suspenders)
         const principalVal = isNaN(principal) || principal < 0 ? 0 : principal;
         // Make sure rate check uses original 'rate', not potentially NaN 'rateVal' for check
         const rateInputVal = isNaN(rate) ? 0 : rate;
         const rateVal = rateInputVal <= 0 ? 0 : rateInputVal; // Set to 0 if non-positive
         // Same for duration
         const durationInputVal = isNaN(durationValue) ? 0 : durationValue;
         const durationVal = durationInputVal <= 0 ? 0 : durationInputVal; // Set to 0 if non-positive

         // --->>> ADDED LOG 3: Check values after NaN/Zero checks <<<---
         console.log('[performCalculation] Values post-validation cleanup:', { principalVal, rateVal, durationVal });

         // --- Calculate Time in Years ---
         let timeInYears = 0;
         if (timeMethod === 'dates') {
             timeInYears = getTimeInYears(startDate, endDate);
         } else {
             timeInYears = getDurationInYears(durationVal, durationUnit);
         }

         // --->>> ADDED LOG 4: Check calculated timeInYears <<<---
         console.log(`%c[performCalculation] Calculated timeInYears: ${timeInYears}`, 'font-weight: bold;');

         // Handle zero/negative/invalid time: return principal only, no error state
         if (isNaN(timeInYears) || timeInYears <= 0) {
             // --->>> ADDED LOG 5: Check if zero-time condition met <<<---
             console.warn("%c[performCalculation] <<< TIME IS ZERO or INVALID >>> Result will be principal only.", 'color: red; font-weight: bold;');
             // Calculate annual rate even if time is 0 for EAR consistency
             const annualRateForEAR = getAnnualRate( (isNaN(rate) ? 0 : rate) / 100, ratePeriod); // Use original 'rate' for calculation here
             console.log(`[performCalculation] Calculated annualRateForEAR (for zero time EAR): ${annualRateForEAR}`);
             const compoundsPerYearForEAR = getCompoundsPerYear(compounding); // Need this too
             return {
                inputs: { ...validatedData, annualRate: annualRateForEAR, timeInYears: 0, compoundsPerYear: compoundsPerYearForEAR },
                principal: principalVal, interest: 0, finalAmount: principalVal, // INTEREST IS ZERO HERE
                ear: calculateEAR(annualRateForEAR, compoundsPerYearForEAR), // EAR based on rate/compounding
                timeInYears: 0, error: false
             };
         }

         // --- Calculate Annual Rate ---
         // Use the rateInputVal which could be positive, negative or zero before rateVal made it positive
         const rateDecimal = rateInputVal / 100; // Base annual rate on potentially 0 or negative rate for intermediate step if needed
         const annualRate = getAnnualRate(rateDecimal, ratePeriod);

         // --->>> ADDED LOG 6: Check calculated annualRate <<<---
         console.log(`%c[performCalculation] Calculated annualRate (for interest): ${annualRate}`, 'font-weight: bold;');

         // If rate itself was invalid (<=0), annual rate used for interest must be 0
         const effectiveAnnualRateForInterest = rateInputVal <= 0 ? 0 : annualRate;

          // --->>> ADDED LOG 6.5: Check effective rate for interest <<<---
         console.log(`[performCalculation] Effective Annual Rate used for Interest Calc: ${effectiveAnnualRateForInterest}`);


         if (isNaN(annualRate)) { // Check the original calculation for NaN still
            console.error("[performCalculation] Base Annual Rate calculation resulted in NaN.");
            return { ...createErrorResult(validatedData, principalVal), timeInYears: timeInYears };
         }

         // --- Calculate Interest and Final Amount ---
         let resultInterest = 0;
         let resultFinalAmount = principalVal;
         let compoundsPerYear = 0; // Initialize
         if (type === 'simple') {
             // --->>> ADDED LOG 7a: Inputs to simple interest <<<---
             console.log('[performCalculation] Inputs to calculateSimpleInterest:', { principalVal, effectiveAnnualRateForInterest, timeInYears });
             resultInterest = calculateSimpleInterest(principalVal, effectiveAnnualRateForInterest, timeInYears);
             resultFinalAmount = principalVal + resultInterest;
             compoundsPerYear = 1; // Not applicable, but set for consistency
             console.log('[performCalculation] Simple Interest Calculated:', { resultInterest, resultFinalAmount });
         } else { // compound
             compoundsPerYear = getCompoundsPerYear(compounding);
             // --->>> ADDED LOG 7b: Inputs to compound interest <<<---
             console.log('[performCalculation] Inputs to calculateCompoundInterest:', { principalVal, effectiveAnnualRateForInterest, timeInYears, compoundsPerYear });
             const { interest, finalAmount } = calculateCompoundInterest(principalVal, effectiveAnnualRateForInterest, timeInYears, compoundsPerYear);
             resultInterest = interest;
             resultFinalAmount = finalAmount;
             console.log('[performCalculation] Compound Interest Calculated:', { resultInterest, resultFinalAmount, compoundsPerYear });
         }

         // --- Calculate Effective Annual Rate (EAR) ---
         // EAR should use the potentially positive annualRate, regardless of interest calc path
         const ear = calculateEAR(annualRate, compoundsPerYear);

         // --->>> ADDED LOG 8: Check final values before return <<<---
         console.log('[performCalculation] Pre-final NaN checks:', { resultInterest, resultFinalAmount, ear });

         // Explicitly check for NaN in final results
         if (isNaN(resultInterest) || isNaN(resultFinalAmount) || isNaN(ear)) {
             console.error("[performCalculation] Final Calculation resulted in NaN!", { resultInterest, resultFinalAmount, ear });
             // Return error result but try to keep calculated intermediates where possible
             return { ...createErrorResult(validatedData, principalVal), timeInYears: timeInYears, annualRate: annualRate, compoundsPerYear: compoundsPerYear };
         }

         const finalSummary = {
             inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear },
             principal: principalVal,
             interest: resultInterest, // <<< Value of Interest
             finalAmount: resultFinalAmount,
             ear: ear,
             timeInYears: timeInYears,
             error: false
         };
          // --->>> ADDED LOG 9: Final return object <<<---
         console.log('%c[performCalculation] FINAL Summary Object to return:', 'color: green; font-weight: bold;', JSON.stringify(finalSummary, null, 2)); // Pretty print JSON
         return finalSummary;
     } catch (error) {
        console.error("[performCalculation] Unexpected error during calculation:", error);
         return { ...createErrorResult(validatedData, validatedData?.principal || 0), errorMsg: error.message };
     }
}

    /** Helper to create a consistent error result object */
    function createErrorResult(inputs, principal = 0) {
        return {
            inputs: inputs || {},
            principal: isNaN(principal) ? 0 : principal,
            interest: NaN, finalAmount: NaN, ear: NaN,
            timeInYears: NaN, annualRate: NaN, compoundsPerYear: NaN,
            error: true
        };
    }

     /** Display results based on the mode and calculated data */
     function displayResults(resultsData) {
         console.log("%c[displayResults] Attempting to display results:", 'color: purple;', resultsData);
         hideAllResultDisplays(); // Start by hiding everything
         let calculationErrorOccurred = false;
         let chartData = null;
         let displayCurrency = CONFIG.DEFAULT_CURRENCY; // Default

         calculationResultsCache = resultsData; // Cache the full results object

         // --- Determine Overall Error State & Display Currency ---
         if (resultsData.mode === 'simple') {
             if (!resultsData.summary || resultsData.summary.error) {
                 calculationErrorOccurred = true;
                 console.error("[displayResults] Simple calculation error detected.");
             } else {
                 displayCurrency = resultsData.summary.inputs.currency;
             }
         } else { // Advanced
             const hasIndividualErrors = resultsData.individual.some(res => !res.summary || res.summary.error);
             const aggregationFailed = !resultsData.aggregated && resultsData.individual.length > 0; // Aggregation object is null despite entries
             const noValidEntries = resultsData.individual.every(res => !res.summary || res.summary.error);

             if (hasIndividualErrors || (aggregationFailed && !resultsData.aggregationMessage)) { // If agg failed without specific message, likely error
                 calculationErrorOccurred = true;
                 console.warn(`[displayResults] Advanced calculation/aggregation error detected. Has Errors: ${hasIndividualErrors}, Agg Failed: ${aggregationFailed}, No Valid Entries: ${noValidEntries}`);
             }
             // Get display currency ONLY if aggregation succeeded
             displayCurrency = resultsData.sharedCurrency || CONFIG.DEFAULT_CURRENCY; // Use shared currency or default
         }

         // --- Display Simple Results ---
         if (resultsData.mode === 'simple' && resultsData.summary) {
            if (calculationErrorOccurred) {
                 // Display error within the results area (optional, could rely on form errors)
                 dom.simpleResultsDisplay.innerHTML = `<p class="error-message">${CONFIG.ERROR_MESSAGES.calculationError}</p>`;
                 dom.simpleResultsDisplay.hidden = false;
             } else {
                 displaySimpleResults(resultsData.summary);
                 dom.simpleResultsDisplay.hidden = false;
                 chartData = createChartData(resultsData.summary); // Create chart data only if successful
             }
             console.log(`[displayResults] Simple results section displayed (Error: ${calculationErrorOccurred})`);
         }
         // --- Display Advanced Results ---
         else if (resultsData.mode === 'advanced' && resultsData.individual.length > 0) {
             displayAdvancedResults(resultsData); // Pass the whole object now
             dom.advancedResultsDisplay.hidden = false;

             // Only create aggregate chart data if aggregation was successful
             if (resultsData.aggregated && resultsData.sharedCurrency) {
                 chartData = createAggregateChartData(resultsData.aggregated, resultsData.individual, resultsData.sharedCurrency);
             }
             console.log(`[displayResults] Advanced results section displayed (Aggregated: ${!!resultsData.aggregated}, Error: ${calculationErrorOccurred})`);
         }
         // --- Handle Case Where No Results Could Be Generated ---
         else if (!calculationPerformed) {
             // This case usually means validation failed before calculation was attempted.
             // Errors should be visible on the form. No need to show results area?
             console.warn("[displayResults] No calculation performed (likely validation errors).");
             calculationErrorOccurred = true; // Treat as error state for print button etc.
         }


         // --- Show Results Area Container ---
         // Show if simple results are shown OR advanced results are shown
         if (!dom.simpleResultsDisplay?.hidden || !dom.advancedResultsDisplay?.hidden) {
             dom.resultsArea.hidden = false;
         }

         // --- Update Chart ---
         if (chartData && !calculationErrorOccurred && dom.chartContext) {
             console.log("[displayResults] Valid chart data exists. Updating chart...");
              // Brief delay to allow DOM updates/layout before drawing chart
             setTimeout(() => {
                  if (!dom.resultsArea.hidden) { // Check again in case something hid it
                     updateChart(chartData, displayCurrency);
                     dom.chartArea.hidden = false;
                     console.log("[displayResults] Chart update called and area unhidden.");
                  }
             }, CONFIG.RESULTS_VISIBILITY_DELAY);
         } else {
             dom.chartArea.hidden = true; // Ensure chart is hidden if errors or no data/context
             console.log(`[displayResults] Chart area remains hidden. Reason: ${calculationErrorOccurred ? 'Error occurred' : !chartData ? 'No chart data' : 'No chart context'}`);
         }

         // --- Enable/Disable Print Button ---
         // Enable only if results are shown AND there were no calculation errors
         dom.printResultsBtn.disabled = dom.resultsArea.hidden || calculationErrorOccurred;
         console.log(`[displayResults] Print button disabled: ${dom.printResultsBtn.disabled}`);

         // --- Scroll to Results ---
         if (!dom.resultsArea.hidden && !calculationErrorOccurred) {
            console.log("[displayResults] Scrolling to results area...");
            // Use a small delay to ensure content is rendered before scrolling
             requestAnimationFrame(() => {
                 setTimeout(() => {
                    dom.resultsArea?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 }, 50); // Short delay after animation frame
             });
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

          // Clear individual results grid and aggregated text/status
         if(dom.advancedIndividualResultsContainer) dom.advancedIndividualResultsContainer.innerHTML = '';
         if(dom.aggregationStatusMessage) {
             dom.aggregationStatusMessage.textContent = '';
             dom.aggregationStatusMessage.className = 'aggregation-status-message'; // Reset class
         }
         // Hide aggregated result items
         [dom.aggPrincipalItem, dom.aggInterestItem, dom.aggEarItem, dom.aggFinalItem].forEach(item => {
             if (item) item.hidden = true;
         });


         // Clear chart data
         if (interestChart) {
            interestChart.destroy(); // Destroy the chart instance completely
            interestChart = null; // Clear the variable
            console.log("[hideAllResultDisplays] Chart instance destroyed.");
         }
         console.log("[hideAllResultDisplays] All result displays hidden.");
    }

    function displaySimpleResults(summary) {
        // Assumes summary is valid and not an error object
        const { principal, interest, finalAmount, ear, inputs } = summary;
        const currency = inputs.currency;

        if (dom.resultSimplePrincipal) dom.resultSimplePrincipal.textContent = formatCurrency(principal, currency);
        if (dom.resultSimpleInterest) dom.resultSimpleInterest.textContent = formatCurrency(interest, currency);
        if (dom.resultSimpleFinal) dom.resultSimpleFinal.textContent = formatCurrency(finalAmount, currency);
        if (dom.resultSimpleEar) dom.resultSimpleEar.textContent = formatPercent(ear);

        console.log("[displaySimpleResults] Simple results populated.");
    }

    function displayAdvancedResults(resultsData) {
         const individualResults = resultsData.individual;
         const aggregatedData = resultsData.aggregated;
         const sharedCurrency = resultsData.sharedCurrency;
         const aggregationMessage = resultsData.aggregationMessage;

         console.log("[displayAdvancedResults] Populating advanced results...");
         // --- Display Individual Results ---
         if (!dom.advancedIndividualResultsContainer) return; // Safety check
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
             if (currency !== '?') headingHTML += ` (${currency})`;
             headingHTML += `</h4>`;
             entryDiv.innerHTML = headingHTML; // Add heading to div

             // Check for errors (calculation or validation)
             if (!summary || summary.error) {
                  allIndividualValid = false;
                  entryDiv.classList.add('has-error');
                  const errorType = summary?.type === 'validation' ? 'Input Error(s)' : CONFIG.ERROR_MESSAGES.calculationError;
                  const errorP = document.createElement('p');
                  errorP.className = 'error-message';
                  errorP.textContent = errorType;
                  entryDiv.appendChild(errorP);
                 console.log(`[displayAdvancedResults] Displaying error for entry #${entryId}`);
             } else {
                 // Create and append result items for valid entries
                 const createItem = (label, value, isTotal = false, isEar = false) => {
                     const itemDiv = document.createElement('div');
                     itemDiv.className = 'result-item';
                     if (isTotal) itemDiv.classList.add('total');
                     if (isEar) itemDiv.classList.add('ear');
                     // Removed aria-labelledby here as it's complex with dynamic content
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
         console.log(`[displayAdvancedResults] Individual results populated. All valid entries: ${allIndividualValid}`);

         // --- Display Aggregated Results (or status message) ---
         if (dom.aggregationStatusMessage) {
            if (aggregatedData && sharedCurrency) {
                // Aggregation succeeded
                dom.aggregationStatusMessage.textContent = `Totals calculated in ${sharedCurrency}.`;
                dom.aggregationStatusMessage.className = 'aggregation-status-message'; // Reset to default style

                // Populate and show aggregated values
                dom.resultAggPrincipal.textContent = formatCurrency(aggregatedData.principal, sharedCurrency);
                dom.resultAggInterest.textContent = formatCurrency(aggregatedData.interest, sharedCurrency);
                dom.resultAggFinal.textContent = formatCurrency(aggregatedData.finalAmount, sharedCurrency);
                dom.resultAggEar.textContent = formatPercent(aggregatedData.blendedEAR);

                dom.aggPrincipalItem.hidden = false;
                dom.aggInterestItem.hidden = false;
                dom.aggEarItem.hidden = false;
                dom.aggFinalItem.hidden = false;

                console.log("[displayAdvancedResults] Aggregated results displayed.");

            } else {
                // Aggregation failed or not possible
                dom.aggregationStatusMessage.textContent = aggregationMessage || "Aggregation not applicable."; // Show specific message or default
                dom.aggregationStatusMessage.className = 'aggregation-status-message error'; // Style as error/notice

                // Hide aggregated value items
                 dom.aggPrincipalItem.hidden = true;
                 dom.aggInterestItem.hidden = true;
                 dom.aggEarItem.hidden = true;
                 dom.aggFinalItem.hidden = true;

                 console.log(`[displayAdvancedResults] Aggregation status message displayed: ${dom.aggregationStatusMessage.textContent}`);
            }
         }
    }

    // --- Calculation Helpers ---

    function getAnnualRate(rateDecimal, ratePeriod) {
        if (isNaN(rateDecimal) || rateDecimal <= 0) return 0;
        switch (ratePeriod) {
            case 'semi-annual': return rateDecimal * 2;
            case 'quarterly': return rateDecimal * 4;
            case 'monthly': return rateDecimal * 12;
            case 'annual':
            default: return rateDecimal;
        }
    }

    function getTimeInYears(startDateStr, endDateStr) {
    // --->>> ADDED LOG 10: Check inputs <<<---
    console.log('[getTimeInYears] Received date strings:', { startDateStr, endDateStr });
    if (!startDateStr || !endDateStr) {
         console.warn('[getTimeInYears] Date string missing.');
         return 0;
    }
    try {
        // Use UTC to avoid timezone causing off-by-one day issues
        const start = new Date(startDateStr + "T00:00:00Z");
        const end = new Date(endDateStr + "T00:00:00Z");

        // --->>> ADDED LOG 11: Parsed Date objects <<<---
        console.log('[getTimeInYears] Parsed dates (UTC):', { start, end });
        console.log(`[getTimeInYears] start.getTime(): ${start.getTime()}, end.getTime(): ${end.getTime()}`);


        // Check for invalid dates explicitly BEFORE comparing them
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
             console.warn(`%c[getTimeInYears] <<< INVALID date parsing: Start Valid: ${!isNaN(start.getTime())}, End Valid: ${!isNaN(end.getTime())}`, 'color: red;');
             return 0;
        }
         // Now check order
         if (end <= start) {
             console.warn(`%c[getTimeInYears] <<< INVALID date order: ${endDateStr} is not after ${startDateStr}`, 'color: red;');
             return 0; // Return 0 for invalid order
        }

        // Calculate difference in milliseconds and convert to years
        const diffMillis = end.getTime() - start.getTime();
        const years = diffMillis / (1000 * 60 * 60 * 24 * 365.25); // Use 365.25 for average leap year

        // --->>> ADDED LOG 12: Calculated diff and years <<<---
        console.log('[getTimeInYears] Date diff (ms):', diffMillis, 'Calculated years:', years);

        return Math.max(0, years); // Ensure non-negative result
    } catch (e) {
        console.error("[getTimeInYears] Error during date processing:", e);
        return 0; // Return 0 on parsing error
    }
}
    function getDurationInYears(durationValue, durationUnit) {
        const value = isNaN(durationValue) || durationValue <= 0 ? 0 : durationValue;
        switch (durationUnit) {
            case 'months': return value / 12;
            case 'days': return value / 365.25; // Approximate using average days
            case 'years':
            default: return value;
        }
    }

    function getCompoundsPerYear(compounding) {
        switch (compounding) {
            case 'semi-annually': return 2;
            case 'quarterly': return 4;
            case 'monthly': return 12;
            case 'daily': return 365; // Common practice (can be 360, 365.25 depending on convention)
            case 'annually':
            default: return 1;
        }
    }

    function calculateSimpleInterest(principal, annualRate, timeInYears) {
        // SI = P * R * T
        if (principal < 0 || annualRate < 0 || timeInYears <= 0) return 0; // Interest requires positive time
        return principal * annualRate * timeInYears;
    }

    function calculateCompoundInterest(principal, annualRate, timeInYears, compoundsPerYear) {
        // A = P * (1 + r/n)^(n*t)
        // Interest = A - P
        if (principal < 0 || annualRate < 0 || timeInYears <= 0 || compoundsPerYear <= 0) {
             // Return principal if time is zero or inputs invalid
             return { interest: 0, finalAmount: Math.max(0, principal) };
        }
        // If rate is zero, interest is zero
        if (annualRate === 0) {
            return { interest: 0, finalAmount: principal };
        }

        const n = compoundsPerYear;
        const t = timeInYears;
        const r = annualRate;

        // Calculation
        const factor = 1 + (r / n);
        const exponent = n * t;

        // Avoid potential issues with very large exponents or bases close to 1 if possible
        // Though Math.pow handles large numbers reasonably well up to JS limits
        if (factor <= 0) { // Should not happen with valid inputs, but safety check
             console.error("[calculateCompoundInterest] Invalid base for exponentiation.");
             return { interest: NaN, finalAmount: NaN };
        }

        const amount = principal * Math.pow(factor, exponent);
        const interest = amount - principal;

        // Check for NaN/Infinity result (can happen with extreme values)
        if (!isFinite(amount) || !isFinite(interest)) {
            console.error("[calculateCompoundInterest] Calculation resulted in NaN or Infinity.", { principal, annualRate, timeInYears, compoundsPerYear });
            return { interest: NaN, finalAmount: NaN };
        }

        return { interest: interest, finalAmount: amount };
    }

    function calculateEAR(annualRate, compoundsPerYear) {
        // EAR = (1 + nominal_rate / n)^n - 1
        if (isNaN(annualRate) || annualRate < 0 || isNaN(compoundsPerYear) || compoundsPerYear <= 0) return 0;
        if (compoundsPerYear === 1) return annualRate; // EAR is the stated rate if compounded annually
        if (annualRate === 0) return 0; // If nominal rate is 0, EAR is 0

        const n = compoundsPerYear;
        const r = annualRate;
        const ear = Math.pow(1 + (r / n), n) - 1;

        return isFinite(ear) ? ear : 0; // Return 0 if calculation fails (e.g., results in Infinity)
    }

    // --- Formatting & Utility Helpers ---

    function formatCurrency(value, currencyCode = 'NGN', useCompact = false) {
        if (isNaN(value) || value === null || !isFinite(value)) return '--'; // Handle invalid inputs gracefully
        try {
            const options = {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
                currencyDisplay: 'narrowSymbol' // Prefer symbol ($) over code (USD)
            };
             // Use 'symbol' if 'narrowSymbol' is not well supported for a currency
             try { new Intl.NumberFormat(undefined, options).format(0); }
             catch (e) { options.currencyDisplay = 'symbol'; }


            if (useCompact && Math.abs(value) >= 1000) {
                options.notation = 'compact';
                options.compactDisplay = 'short';
                 // Compact notation might lose currency symbol, check and potentially re-add
            }
            return new Intl.NumberFormat(undefined, options).format(value);
        } catch (e) {
            console.warn(`[formatCurrency] Error formatting ${value} as ${currencyCode}:`, e);
            // Fallback formatting (less ideal)
            return `${currencyCode} ${value.toFixed(2)}`;
        }
    }

    function formatPercent(value) {
        if (isNaN(value) || value === null || !isFinite(value)) return '--';
        return new Intl.NumberFormat(undefined, {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

// --- TEMPORARY TEST ---
function isValidDate(dateString) {
    console.log("[isValidDate] Checking:", dateString); // Add log here too!
    if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        console.log("[isValidDate] Regex failed or empty string");
        return false;
    }
    const date = new Date(dateString + "T00:00:00Z"); // Use UTC
    const isValid = date instanceof Date && !isNaN(date.getTime()); // Simpler check for now
    console.log("[isValidDate] Result:", isValid);
    // return isValid && date.getFullYear() > 1900 && date.getFullYear() < 2100; // Original year check could be added back
     return isValid; // TEST
}
// --- END TEMPORARY TEST ---

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
            const errorId = `${inputElement.id}-error`; // Assume input has ID
            if (inputElement.id) { // Only add if input has ID
                 errorSpan.id = errorId;
                 inputElement.setAttribute('aria-describedby', errorId);
            }
        }
    }

    function clearError(inputElement) {
        const formGroup = inputElement.closest('.form-group');
        if (!formGroup) return;
        const errorSpan = formGroup.querySelector('.error-message');
        inputElement.classList.remove('is-invalid');
        inputElement.removeAttribute('aria-invalid');

        // Remove aria-describedby only if it points to our error span
        const describedBy = inputElement.getAttribute('aria-describedby');
        const errorId = errorSpan?.id;
        if (describedBy && errorId && describedBy === errorId) {
             inputElement.removeAttribute('aria-describedby');
        }
         if (errorSpan) {
            errorSpan.textContent = '';
            errorSpan.removeAttribute('id'); // Remove ID when error is cleared
        }
    }

    function clearAllErrors(container) {
        if (!container) return;
        container.querySelectorAll('.is-invalid').forEach(el => clearError(el));
        // Also clear general aggregation status message if it's an error
        if(dom.aggregationStatusMessage && dom.aggregationStatusMessage.classList.contains('error')) {
            dom.aggregationStatusMessage.textContent = '';
            dom.aggregationStatusMessage.className = 'aggregation-status-message';
        }
    }


    // --- Advanced Mode: Entry Management ---

    function addEntry() {
        if (!dom.advancedEntriesContainer || !dom.entryTemplate) return; // Safety check

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

        let firstInput = null; // To set focus later

        // Update IDs, names, fors, aria attributes, etc.
        newEntry.querySelectorAll('[id*="{id}"], [name*="{id}"], [for*="{id}"], [aria-label*="{id}"], [aria-labelledby*="{id}"], [aria-describedby*="{id}"], .entry-number').forEach(el => {
            const replaceId = (attributeValue) => attributeValue ? attributeValue.replace(/{id}/g, entryId) : null; // Use global replace

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

            // Find the first focusable input/select element
            if (!firstInput && (el.tagName === 'INPUT' || el.tagName === 'SELECT') && !el.closest('.entry-template')) {
                firstInput = el;
            }
        });

        resetEntryToDefaults(newEntry, entryId); // Set defaults for the new entry

        // Add event listeners for inputs within the new entry
        // No need, using event delegation on the form now.

        // Setup remove button
        const removeBtn = newEntry.querySelector('.remove-entry-btn');
        if (removeBtn) {
            // removeBtn listener is added via delegation on the container now if preferred,
            // or add it directly here:
            removeBtn.addEventListener('click', handleRemoveEntryClick);
            // Visibility handled by updateAdvancedEntryUI
        }

        dom.advancedEntriesContainer.appendChild(newEntry);
        updateAdvancedEntryUI(); // Update numbering, remove buttons, add button state
        hideAllResultDisplays(); // Clear results when structure changes

        // Set focus to the first input of the new entry for accessibility
        if (firstInput) {
             // Use timeout to ensure element is fully in DOM and visible
             setTimeout(() => firstInput.focus(), 0);
        }

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
        updateCalculateButtonState(); // Re-check validity after removal
        // Optional: Set focus back to the "Add Calculation" button or previous entry
        dom.addEntryBtn?.focus();
    }

    function updateAdvancedEntryUI() {
        if (!dom.advancedEntriesContainer) return;
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
                 // Ensure legend ID matches the stored entryId if it was changed somehow
                 // legend.id = `entry-legend-${entryId}`;
                 // entry.setAttribute('aria-labelledby', legend.id);
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
        if (dom.addEntryBtn) {
             dom.addEntryBtn.disabled = (entryCount >= CONFIG.MAX_ADVANCED_ENTRIES);
        }
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
        dom.modeToggleSimple?.classList.add('active');
        dom.modeToggleSimple?.setAttribute('aria-checked', 'true');
        dom.modeToggleAdvanced?.classList.remove('active');
        dom.modeToggleAdvanced?.setAttribute('aria-checked', 'false');
        if (dom.simpleModeContainer) dom.simpleModeContainer.hidden = false;
        if (dom.advancedModeContainer) dom.advancedModeContainer.hidden = true;
        if (dom.simpleModeContainer) dom.simpleModeContainer.classList.add('active');
        if (dom.advancedModeContainer) dom.advancedModeContainer.classList.remove('active');


        // Reset advanced entries
        if (dom.advancedEntriesContainer) dom.advancedEntriesContainer.innerHTML = ''; // Clear all existing entries
        advancedEntryCounter = 0; // Reset the counter
        addEntry(); // Add back the initial first entry (which calls resetEntryToDefaults inside)

        // Explicitly reset simple mode to configured defaults
        if (dom.simpleModeContainer) {
            resetEntryToDefaults(dom.simpleModeContainer, 'simple');
        }

        updateAdvancedEntryUI(); // Update remove buttons etc. for the single advanced entry
        updateCalculateButtonState(); // Reset button state

        console.log("[handleClearFormClick] Form cleared and reset to simple mode defaults.");
    }

    function resetEntryToDefaults(container, entryIdSuffix) {
        if (!container) return;
        console.log(`[resetEntryToDefaults] Resetting container for ID suffix: ${entryIdSuffix}`);

        // Helper to select elements within the container using the suffix
        // Handles both simple mode (suffix='simple') and advanced (suffix=number)
        const getEl = (baseSelector) => {
            const selector = baseSelector.replace('{id}', entryIdSuffix);
            return container.querySelector(selector);
        };

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
        updateCurrencySymbol(CONFIG.DEFAULT_CURRENCY, container);

        // Reset Time Period Method to 'dates' and set initial dates
        const timeMethodRadios = container.querySelectorAll(`input[name="timeMethod-{id}"]`);
        timeMethodRadios.forEach(radio => {
             radio.checked = (radio.value === 'dates');
        });
        toggleTimeInputs(container, true); // Show dates, hide duration, set requirements
        setInitialDates(container); // Sets start/end dates

        // Set default duration values (even though hidden initially)
        const durationValueInput = getEl(`input[name="duration-value-{id}"]`);
        if (durationValueInput) durationValueInput.value = CONFIG.DEFAULT_DURATION_VALUE;

        const durationUnitSelect = getEl(`select[name="duration-unit-{id}"]`);
        if (durationUnitSelect) durationUnitSelect.value = CONFIG.DEFAULT_DURATION_UNIT;

        // Set visibility and requirement of compounding group based on default type
        const compoundingGroup = getEl('.compounding-group');
        if (compoundingGroup) {
             const isSimple = (CONFIG.DEFAULT_INTEREST_TYPE === 'simple');
             compoundingGroup.hidden = isSimple;
             const compSelect = compoundingGroup.querySelector('select');
             if(compSelect) compSelect.required = !isSimple;
        }

        // Clear any validation states from these elements after resetting
        container.querySelectorAll('input, select').forEach(clearError);
    }

    function setInitialDates(container) {
        if (!container) return;
        const startDateInput = container.querySelector('input[name^="start-date"]');
        const endDateInput = container.querySelector('input[name^="end-date"]');

        if (startDateInput && endDateInput) {
            try {
                const today = new Date();
                const oneYearLater = new Date(today);
                oneYearLater.setFullYear(today.getFullYear() + 1);

                // Format as YYYY-MM-DD required by input type="date"
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
        // Destructure inputs with defaults for safety
        const { annualRate = 0, compoundsPerYear = 1, type = 'compound' } = inputs;

        const labels = [];
        const principalData = [];
        const interestData = [];
        const totalData = [];

        // Determine reasonable number of steps for the chart
        // Use years for steps, minimum 1 step if time > 0, max ~12 steps (e.g., monthly for 1 year)
        const numSteps = (timeInYears <= 0) ? 0 : Math.max(1, Math.min(12, Math.ceil(timeInYears * (type === 'compound' ? Math.min(compoundsPerYear, 12) : 1))));
        const stepYears = (numSteps > 0) ? timeInYears / numSteps : 0;

        // Add initial point (Year 0)
        labels.push('Year 0');
        principalData.push(principal);
        interestData.push(0);
        totalData.push(principal);

        for (let i = 1; i <= numSteps; i++) {
            const currentYear = i * stepYears;
            // Use precise label, especially for short periods
            labels.push(`Year ${currentYear.toFixed(currentYear < 1 ? 2 : 1)}`);

            let currentInterest, currentFinalAmount;
            if (type === 'simple') {
                currentInterest = calculateSimpleInterest(principal, annualRate, currentYear);
                currentFinalAmount = principal + currentInterest;
            } else { // compound
                const compoundResult = calculateCompoundInterest(principal, annualRate, currentYear, compoundsPerYear);
                // Handle potential NaN from calculation (should be rare now)
                currentInterest = isFinite(compoundResult.interest) ? compoundResult.interest : interestData[interestData.length - 1]; // Use previous value on error
                currentFinalAmount = isFinite(compoundResult.finalAmount) ? compoundResult.finalAmount : totalData[totalData.length - 1];
            }

            principalData.push(principal); // Principal is constant
            interestData.push(currentInterest);
            totalData.push(currentFinalAmount);
        }

         // Ensure the final point matches the summary precisely if steps didn't land exactly
         // Or if calculation produced slightly different result due to step rounding
         if (numSteps > 0) {
              // Always overwrite the last calculated point with the definitive summary result
              labels[labels.length -1] = `Year ${timeInYears.toFixed(timeInYears < 1 ? 2 : 1)}`; // Correct final label
              interestData[interestData.length - 1] = interest; // Use exact calculated interest
              totalData[totalData.length - 1] = finalAmount; // Use exact calculated final amount
              principalData[principalData.length - 1] = principal; // Ensure principal matches
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
                }
                // Total line overlay is optional, stacked area shows total height
            ]
        };
    }

     function createAggregateChartData(aggregatedData, individualResults, sharedCurrency) {
         // Assumes aggregation was successful and sharedCurrency is valid
         if (!aggregatedData || individualResults.length === 0 || !sharedCurrency) return null;

         // Find the maximum timeInYears across all valid individual results
         let maxTimeInYears = 0;
         individualResults.forEach(res => {
             // Only consider results that were successfully calculated (error=false)
             if (res.summary && !res.summary.error && res.summary.timeInYears > maxTimeInYears) {
                 maxTimeInYears = res.summary.timeInYears;
             }
         });

         if (maxTimeInYears <= 0) return null; // No growth to chart

         const labels = [];
         const aggregatePrincipalData = [];
         const aggregateInterestData = [];
         const aggregateTotalData = [];

         // Determine steps based on max time
         const numSteps = (maxTimeInYears <= 0) ? 0 : Math.max(1, Math.min(12, Math.ceil(maxTimeInYears * 2))); // More steps potentially, max 12
         const stepYears = (numSteps > 0) ? maxTimeInYears / numSteps : 0;

         // Add initial point (Year 0)
         let initialPrincipal = 0;
          individualResults.forEach(res => {
              if (res.summary && !res.summary.error) { initialPrincipal += res.summary.principal; }
          });
         labels.push('Year 0');
         aggregatePrincipalData.push(initialPrincipal);
         aggregateInterestData.push(0);
         aggregateTotalData.push(initialPrincipal);


         for (let i = 1; i <= numSteps; i++) {
             const currentYear = i * stepYears;
             labels.push(`Year ${currentYear.toFixed(currentYear < 1 ? 2 : 1)}`);

             let currentTotalPrincipal = 0;
             let currentTotalInterest = 0;
             let currentTotalFinalAmount = 0;

             // Recalculate each individual entry FOR THE CURRENT TIME POINT `currentYear`
             individualResults.forEach(res => {
                  // Only process entries that were initially successful and match the shared currency
                  if (res.summary && !res.summary.error && res.inputs.currency === sharedCurrency) {
                     const inputs = res.inputs;
                     const principalVal = res.summary.principal; // Use the original principal
                     let entryInterest = 0;
                     let entryFinalAmount = principalVal;

                     // Recalculate interest/amount for currentYear
                     if (currentYear > 0) {
                        if (inputs.type === 'simple') {
                            entryInterest = calculateSimpleInterest(principalVal, inputs.annualRate, currentYear);
                            entryFinalAmount = principalVal + entryInterest;
                        } else { // compound
                            const compoundResult = calculateCompoundInterest(principalVal, inputs.annualRate, currentYear, inputs.compoundsPerYear);
                            entryInterest = isFinite(compoundResult.interest) ? compoundResult.interest : 0;
                            entryFinalAmount = isFinite(compoundResult.finalAmount) ? compoundResult.finalAmount : principalVal;
                        }
                     }

                     // Sum up the values for this time step
                     currentTotalPrincipal += principalVal; // Principal sum remains constant
                     currentTotalInterest += entryInterest;
                     currentTotalFinalAmount += entryFinalAmount;
                 }
             });

             aggregatePrincipalData.push(currentTotalPrincipal);
             aggregateInterestData.push(currentTotalInterest);
             aggregateTotalData.push(currentTotalFinalAmount);
         }

          // Ensure the final point matches the calculated aggregate precisely
         if (numSteps > 0) {
              labels[labels.length -1] = `Year ${maxTimeInYears.toFixed(maxTimeInYears < 1 ? 2 : 1)}`; // Correct final label
              aggregatePrincipalData[aggregatePrincipalData.length - 1] = aggregatedData.principal;
              aggregateInterestData[aggregateInterestData.length - 1] = aggregatedData.interest;
              aggregateTotalData[aggregateTotalData.length - 1] = aggregatedData.finalAmount;
         }


         return {
             labels: labels,
             datasets: [
                 {
                     label: `Total Principal (${sharedCurrency})`,
                     data: aggregatePrincipalData,
                     backgroundColor: CONFIG.CHART_COLORS.principal,
                     borderColor: CONFIG.CHART_COLORS.borderColor,
                     borderWidth: 1,
                     fill: 'origin',
                     order: 3
                 },
                 {
                     label: `Total Interest (${sharedCurrency})`,
                     data: aggregateInterestData,
                     backgroundColor: CONFIG.CHART_COLORS.interest,
                     borderColor: CONFIG.CHART_COLORS.borderColor,
                     borderWidth: 1,
                     fill: '-1', // Stack on top of principal
                     order: 2
                 }
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
            if (interestChart) { // Destroy existing chart if data is invalid
                interestChart.destroy();
                interestChart = null;
            }
            dom.chartArea.hidden = true; // Hide area if no chart
            return;
        }

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false, // Allows height control via CSS on container
            scales: {
                x: {
                    title: { display: true, text: 'Time (Years)' },
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
                    position: 'bottom', // Better position usually
                },
                tooltip: {
                    mode: 'index', // Show tooltip for all datasets at the same x-index
                    intersect: false,
                    callbacks: {
                        // Callback to format tooltip values as currency
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            // Use the raw value from the dataset and format it
                            if (context.parsed.y !== null) {
                                label += formatCurrency(context.parsed.y, displayCurrency);
                            }
                            return label;
                        }
                    }
                }
            },
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
            try {
                interestChart = new Chart(dom.chartContext, {
                    type: 'line', // Base type
                    data: chartData,
                    options: chartOptions
                });
            } catch (e) {
                 console.error("[updateChart] Error creating chart:", e);
                 dom.chartArea.hidden = true; // Hide if creation fails
            }
        } else {
            // Update existing chart instance
            console.log("[updateChart] Updating existing chart instance.");
             try {
                 interestChart.data = chartData;
                 // Update options that change (like currency formatting in axis/tooltips)
                 interestChart.options.scales.y.title.text = `Amount (${displayCurrency})`;
                 interestChart.options.scales.y.ticks.callback = value => formatCurrency(value, displayCurrency, true);
                 interestChart.options.plugins.tooltip.callbacks.label = function (context) {
                      let label = context.dataset.label || '';
                      if (label) { label += ': '; }
                      if (context.parsed.y !== null) {
                          label += formatCurrency(context.parsed.y, displayCurrency);
                      }
                      return label;
                  };
                 interestChart.update(); // Use default animation
             } catch (e) {
                 console.error("[updateChart] Error updating chart:", e);
                 dom.chartArea.hidden = true; // Hide if update fails
             }
        }
    }


    // --- Other Event Handlers ---
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent default form submission
        console.log("%c[handleFormSubmit] Form submitted.", 'color: orange; font-weight: bold;');
        dom.calculateBtn.disabled = true; // Disable button temporarily

        // Use setTimeout to allow UI to update (button disabling) before potentially blocking calculation
        setTimeout(() => {
            calculateAndDisplay();
            // Re-enable button after calculation attempt (success or failure)
            updateCalculateButtonState(); // Checks validity again
        }, 10); // Short delay
    }

    function handlePrintResultsClick() {
        // Ensure results are actually visible and not showing errors before printing
        if (dom.resultsArea && !dom.resultsArea.hidden && !dom.printResultsBtn.disabled) {
             console.log("[handlePrintResultsClick] Printing results...");
             window.print();
        } else {
             console.log("[handlePrintResultsClick] Print skipped (results hidden or errors present).");
        }
    }

    /** Checks current form validity and enables/disables Calculate button */
    function updateCalculateButtonState() {
        if (!dom.form || !dom.calculateBtn) return;

        let isFormValid = true;
        const activeContainer = dom.form.querySelector('.calculator-mode.active');

        if (!activeContainer) {
            isFormValid = false; // Cannot validate if no mode active
        } else {
             // Check validity using checkValidity() on relevant inputs within the active container
             const inputsToCheck = activeContainer.querySelectorAll('input:required, select:required');
             inputsToCheck.forEach(input => {
                 // Consider inputs inside containers that are *not* hidden
                 const timeContainer = input.closest('.time-input-container');
                 const compoundingGroup = input.closest('.compounding-group');

                 let isHidden = false;
                 if (timeContainer && timeContainer.hidden) isHidden = true;
                 if (compoundingGroup && compoundingGroup.hidden) isHidden = true;

                 if (!isHidden && !input.checkValidity()) {
                      isFormValid = false;
                      // console.log("Invalid input found:", input.name); // For debugging
                 }
             });

             // Also check date order specifically if dates are active
             if (isFormValid && activeContainer.id === 'simple-mode' && !activeContainer.querySelector('#dates-simple-container')?.hidden) {
                 const startDate = activeContainer.querySelector('#start-date-simple')?.value;
                 const endDate = activeContainer.querySelector('#end-date-simple')?.value;
                 if (startDate && endDate && isValidDate(startDate) && isValidDate(endDate)) {
                     if (new Date(endDate + "T00:00:00Z") <= new Date(startDate + "T00:00:00Z")) {
                         isFormValid = false;
                     }
                 }
             }
             // Add similar check for advanced mode entries if needed, though individual validation catches most
        }

        dom.calculateBtn.disabled = !isFormValid;
        // console.log(`[updateCalculateButtonState] Calculate button disabled: ${!isFormValid}`);
    }

    function updateCopyrightYear() {
        if (dom.currentYearSpan) {
            dom.currentYearSpan.textContent = new Date().getFullYear();
        }
    }

    // --- Initialization ---
    function init() {
        if (!cacheDOMElements()) {
            console.error("Initialization failed due to missing critical DOM elements.");
            // Maybe display a user-friendly message on the page?
            if (document.body) { // Check if body exists before trying to append
                const errorMsg = document.createElement('p');
                errorMsg.textContent = 'Error: Calculator components failed to load correctly. Please refresh or contact support.';
                errorMsg.style.color = 'red';
                errorMsg.style.textAlign = 'center';
                errorMsg.style.padding = '20px';
                dom.form?.parentNode?.insertBefore(errorMsg, dom.form); // Insert before form if possible
            }
            return; // Stop initialization
        }
        console.log("[init] DOM elements cached successfully.");

        // Set initial state
        if (dom.simpleModeContainer) dom.simpleModeContainer.hidden = false;
        if (dom.advancedModeContainer) dom.advancedModeContainer.hidden = true;
        if (dom.simpleModeContainer) dom.simpleModeContainer.classList.add('active');
        if (dom.modeToggleSimple) dom.modeToggleSimple.classList.add('active');
        if (dom.modeToggleSimple) dom.modeToggleSimple.setAttribute('aria-checked', 'true');


        // Set up advanced mode (add first entry)
        // addEntry calls resetEntryToDefaults internally
        addEntry();
        updateAdvancedEntryUI(); // Ensures remove button is hidden on the first entry

        // Set default values for simple mode AFTER adding advanced entry
        if (dom.simpleModeContainer) {
            resetEntryToDefaults(dom.simpleModeContainer, 'simple');
        }

        // Hide results initially
        hideAllResultDisplays();

        // Attach Event Listeners
        dom.modeToggleSimple?.addEventListener('click', handleModeToggleClick);
        dom.modeToggleAdvanced?.addEventListener('click', handleModeToggleClick);

        // Use event delegation on the form for input/change events
        dom.form?.addEventListener('input', handleInputChange);
        dom.form?.addEventListener('change', handleInputChange); // Catches changes in selects, radios, date pickers

        dom.form?.addEventListener('submit', handleFormSubmit);
        dom.clearFormBtn?.addEventListener('click', handleClearFormClick);
        dom.printResultsBtn?.addEventListener('click', handlePrintResultsClick);
        dom.addEntryBtn?.addEventListener('click', addEntry);

        // Initial check of form validity to set button state
        updateCalculateButtonState();

        // Update footer copyright year
        updateCopyrightYear();

        console.info("Interest Calculator Initialized (v1.3.0). Ready.");
    }

    // --- Start the application ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init(); // DOMContentLoaded has already fired
    }

})(); // End IIFE
