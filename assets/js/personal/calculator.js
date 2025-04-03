    // --- Main Calculation Orchestration ---
    function calculateAndDisplay() {
        console.log("[calculateAndDisplay] Initiating...");
        clearAllErrors(dom.form); // Clear previous validation errors

        let overallValid = true;
        let resultsData = { mode: currentMode, summary: null, individual: [], aggregated: null };
        let calculationPerformed = false; // Flag to track if calculation was even attempted

        if (currentMode === 'simple') {
            console.log("[calculateAndDisplay] Mode: simple. Getting form data...");
            const data = getFormData(dom.simpleModeContainer); // <<< Check output here
            if (data) {
                console.log("[calculateAndDisplay] Simple mode data VALID. Performing calculation...", data);
                resultsData.summary = performCalculation(data); // <<< Check output here
                calculationPerformed = true;
                 if (!resultsData.summary || resultsData.summary.error) {
                    console.error("[calculateAndDisplay] Simple calculation FAILED or returned error object.", resultsData.summary);
                    overallValid = false; // Mark as invalid if calculation itself failed
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

             for (let i = 0; i < entries.length; i++) {
                 const entry = entries[i];
                 const entryIndex = i + 1;
                 console.log(`[calculateAndDisplay] Getting data for advanced entry #${entryIndex}...`);
                 const entryData = getFormData(entry); // <<< Check output here

                 if (entryData) {
                     console.log(`[calculateAndDisplay] Advanced entry #${entryIndex} data VALID. Performing calculation...`, entryData);
                     const entryCalcResult = performCalculation(entryData); // <<< Check output here
                     calculationPerformed = true; // Mark that at least one calc was tried

                     if (!entryCalcResult || entryCalcResult.error) {
                         console.error(`[calculateAndDisplay] Advanced entry #${entryIndex} calculation FAILED or returned error object.`, entryCalcResult);
                         // Still add a placeholder to resultsData.individual to show the error in UI
                         resultsData.individual.push({ inputs: entryData || {}, summary: { error: true, principal: entryData?.principal || 0, inputs: entryData || {} } }); // Include inputs if possible
                         overallValid = false; // Mark overall as invalid if any entry calc fails
                     } else {
                         console.log(`[calculateAndDisplay] Advanced entry #${entryIndex} calculation SUCCESSFUL.`);
                         resultsData.individual.push({ inputs: entryData, summary: entryCalcResult });
                         entryCalculationsSucceeded++;

                         // Accumulate NGN equivalents only if calculation succeeded
                         const principalNGN = convertCurrency(entryCalcResult.principal, entryData.currency, 'NGN');
                         const interestNGN = convertCurrency(entryCalcResult.interest, entryData.currency, 'NGN');
                         const finalAmountNGN = convertCurrency(entryCalcResult.finalAmount, entryData.currency, 'NGN');

                         if (isNaN(principalNGN) || isNaN(interestNGN) || isNaN(finalAmountNGN)) {
                             conversionPossible = false;
                             console.warn(`[calculateAndDisplay] Currency conversion failed for entry #${entryIndex}`);
                         } else {
                             totalPrincipalNGN += principalNGN; totalInterestNGN += interestNGN; totalFinalAmountNGN += finalAmountNGN;
                         }
                     }
                 } else {
                     overallValid = false;
                     console.warn(`[calculateAndDisplay] Advanced entry #${entryIndex} validation FAILED (getFormData returned null).`);
                 }
             }

             // Calculate aggregate totals only if ALL entries attempted were valid AND calculated successfully AND conversion worked
             if (overallValid && entryCalculationsSucceeded === entryCalculationsAttempted && conversionPossible && resultsData.individual.length > 0) {
                 console.log("[calculateAndDisplay] Calculating aggregated results...");
                 let weightedEARSum = 0;
                 resultsData.individual.forEach(res => {
                    // Need principal in NGN again for weighting
                     const principalNGN = convertCurrency(res.summary.principal, res.inputs.currency, 'NGN');
                     if (!isNaN(principalNGN) && totalPrincipalNGN > 0) {
                         weightedEARSum += res.summary.ear * (principalNGN / totalPrincipalNGN);
                     } else if (!isNaN(principalNGN) && totalPrincipalNGN === 0) {
                        // Avoid division by zero if total principal is zero but individual isn't (edge case)
                        // If only one entry, its EAR is the blended EAR. If multiple zero-principal entries, EAR is complex. Default to 0.
                        weightedEARSum = (resultsData.individual.length === 1) ? res.summary.ear : 0;
                     }
                 });
                 resultsData.aggregated = {
                     principalNGN: totalPrincipalNGN, interestNGN: totalInterestNGN, finalAmountNGN: totalFinalAmountNGN,
                     blendedEAR: totalPrincipalNGN > 0 ? weightedEARSum : 0 // Handle zero total principal
                 };
                 console.log("[calculateAndDisplay] Aggregated results calculated:", resultsData.aggregated);
             } else {
                 resultsData.aggregated = null; // Aggregation not possible
                 console.warn("[calculateAndDisplay] Aggregated results NOT calculated. Reason:", { overallValid, allEntriesSucceeded: entryCalculationsSucceeded === entryCalculationsAttempted, conversionPossible });
                 if (!conversionPossible && overallValid && entryCalculationsSucceeded > 0) {
                      if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError; // Show specific conversion error
                 }
             }
         } // End advanced mode processing

         console.log("[calculateAndDisplay] Final check:", { overallValid, calculationPerformed });

         // Display results ONLY if validation passed AND calculation was performed without fatal errors.
         // For advanced, we might show partial results even if overallValid is false due to one entry failing,
         // so we rely more on the content of resultsData.individual.
         if (calculationPerformed && (resultsData.summary || resultsData.individual.length > 0)) {
             console.log("[calculateAndDisplay] Validation/Calculation OK or partially OK (Advanced). Calling displayResults...");
             displayResults(resultsData);
         } else {
             console.warn("[calculateAndDisplay] Hiding results because validation failed OR no calculation was performed successfully.");
             hideAllResultDisplays();
             // Optionally show a generic validation error message somewhere if needed
             // alert("Please check your inputs. Calculation could not be performed.");
         }
     }

    /** Validate and get form data for a specific entry container */
    function getFormData(containerElement) {
         console.log(`%c[getFormData] Getting data from: ${containerElement.id || 'Simple Mode Container'}`, 'color: blue;');
         const data = {};
         const inputs = containerElement.querySelectorAll('input[name], select[name]');
         let isValid = true;
         // DO NOT clear errors here, clearAllErrors is called before this in calculateAndDisplay
         // clearAllErrors(containerElement);

         const timeMethodRadio = containerElement.querySelector(`input[name^="timeMethod-"]:checked`);
         const isDatesMethod = timeMethodRadio?.value === 'dates';
         const interestTypeSelect = containerElement.querySelector('select[name^="type-"]');
         const isSimpleInterest = interestTypeSelect?.value === 'simple';
         console.log(`[getFormData] Mode checks: isDatesMethod=${isDatesMethod}, isSimpleInterest=${isSimpleInterest}`);

         inputs.forEach(input => {
             const name = input.name.replace(/-\d+$/, '').replace('-simple', '');
             let skipValidation = false;

             const formGroup = input.closest('.form-group');
             const isDurationInput = formGroup?.classList.contains('duration-container') || input.name.includes('duration');
             const isDateInput = formGroup?.classList.contains('dates-container') || input.name.includes('date');
             const isCompoundingInput = formGroup?.classList.contains('compounding-group');

             if (isDurationInput && isDatesMethod) skipValidation = true;
             if (isDateInput && !isDatesMethod) skipValidation = true;
             if (isCompoundingInput && isSimpleInterest) skipValidation = true;

             // Store value, trim strings
             data[name] = input.type === 'number' ? parseFloat(input.value) : input.value.trim();

             if (!skipValidation) {
                 // console.log(`[getFormData] Validating: ${input.name}`);
                 if (!validateInput(input)) { // validateInput now clears/shows errors itself
                    isValid = false;
                    console.warn(`[getFormData] >> Validation FAILED for: ${input.name} (Value: '${input.value}')`);
                 }
             } else {
                // console.log(`[getFormData] Skipping validation for: ${input.name}`);
                clearError(input); // Explicitly clear errors for skipped inputs
             }
         });

         // --- Additional Cross-Field Validations ---
         // Only run if basic validation passed so far
         if (isValid) {
            console.log("[getFormData] Basic validation passed. Running cross-field checks...");
            if (isDatesMethod) {
                 const startDateInput = containerElement.querySelector('input[name^="start-date"]');
                 const endDateInput = containerElement.querySelector('input[name^="end-date"]');
                 // Check if inputs exist before accessing value
                 const startValue = startDateInput?.value;
                 const endValue = endDateInput?.value;

                 if (startDateInput && endDateInput && startValue && endValue) {
                     // Re-check validity before comparing order
                     if (!isValidDate(startValue)) {
                         showError(startDateInput, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false; console.warn(">> Date Order Check: Start Date invalid");
                     } else if (!isValidDate(endValue)) {
                         showError(endDateInput, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false; console.warn(">> Date Order Check: End Date invalid");
                     } else if (new Date(endValue) <= new Date(startValue)) {
                         showError(endDateInput, CONFIG.ERROR_MESSAGES.dateOrder); isValid = false; console.warn(">> Date Order Check: End Date not after Start Date");
                     } else {
                         console.log("[getFormData] Date order check passed.");
                     }
                 } else if (startDateInput?.required && !startValue || endDateInput?.required && !endValue) {
                     // Should have been caught by validateInput, but good fallback
                     if (startDateInput?.required && !startValue) showError(startDateInput, CONFIG.ERROR_MESSAGES.required);
                     if (endDateInput?.required && !endValue) showError(endDateInput, CONFIG.ERROR_MESSAGES.required);
                     isValid = false; console.warn(">> Date Order Check: Required date missing");
                 }
            }

            // --- Check for NaN on required number fields AFTER parseFloat ---
            // Only check if basic validation passed, otherwise NaN is expected
            if(isValid) {
                const requiredNumberFields = [
                    { name: 'principal', el: containerElement.querySelector(`[name^="principal-"]`) },
                    { name: 'rate', el: containerElement.querySelector(`[name^="rate-"]`) },
                    { name: 'duration-value', el: containerElement.querySelector(`[name^="duration-value-"]`) }
                ];

                requiredNumberFields.forEach(field => {
                    // Check if the element exists, is required, wasn't skipped, and resulted in NaN
                    const skip = (field.name === 'duration-value' && isDatesMethod);
                    if (field.el && field.el.required && !skip && isNaN(data[field.name])) {
                        console.warn(`>> NaN Check: Field '${field.name}' is NaN after parseFloat.`);
                        showError(field.el, 'Please enter a valid number.');
                        isValid = false;
                    }
                });
            }

         } else {
             console.log("[getFormData] Skipping cross-field checks due to earlier validation failure.");
         }


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

        // Check required fields (only if value is empty)
        if (isRequired && !value) {
            showError(input, CONFIG.ERROR_MESSAGES.required);
            return false; // Fail fast if required and empty
        }

        // If not required and empty, it's valid (further checks only apply if there's a value)
        if (!isRequired && !value) {
            return true;
        }

        // --- Field has a value, proceed with type-specific checks ---
        if (input.type === 'number') {
           const numValue = parseFloat(value);
           const min = parseFloat(input.min); // Get min attribute value

           if (isNaN(numValue)) {
                showError(input, 'Please enter a valid number.'); isValid = false;
           } else if (input.hasAttribute('min') && !isNaN(min) && numValue < min) {
                // Use appropriate message based on min value
                const msg = (min === 0 && !name?.includes('rate')) // Assuming principal/duration min=0
                            ? CONFIG.ERROR_MESSAGES.numberZeroPositive
                            : CONFIG.ERROR_MESSAGES.numberPositive;
                showError(input, msg); isValid = false;
            } else if (name?.includes('rate') && numValue <= 0 && isRequired) {
                // Rate must be positive if required
                 showError(input, CONFIG.ERROR_MESSAGES.ratePositive); isValid = false;
            } else if (name?.includes('duration-value') && numValue <= 0 && isRequired) {
                 // Duration must be positive if required (actual check depends on timeMethod in getFormData)
                 // This basic check ensures it's not zero or negative if a value *is* provided
                  showError(input, CONFIG.ERROR_MESSAGES.durationPositive); isValid = false;
            }
        } else if (input.type === 'date' && value && !isValidDate(value)) {
             // Check date validity only if a value is present
             showError(input, CONFIG.ERROR_MESSAGES.dateInvalid); isValid = false;
        }
        // Add checks for <select> if needed, e.g., ensure default disabled option isn't selected if required.

        // console.log(`[validateInput] Input: ${name}, Value: '${value}', Valid: ${isValid}`);
        return isValid;
   }

    /** Perform calculation for a single validated data set */
    function performCalculation(validatedData) {
         console.log('%c[performCalculation] Performing calculation with:', 'color: green;', validatedData);
         const { principal, rate, ratePeriod, interestType, compounding, timeMethod, startDate, endDate, durationValue, durationUnit } = validatedData;

         // Ensure principal is non-negative (already validated, but safety check)
         const principalVal = Math.max(0, principal);

         const rateDecimal = rate / 100;
         const annualRate = getAnnualRate(rateDecimal, ratePeriod);

         let timeInYears = 0;
         if (timeMethod === 'dates') {
             timeInYears = getTimeInYears(startDate, endDate);
         } else {
             timeInYears = getDurationInYears(durationValue, durationUnit);
         }

         // If time is zero/negative, return principal only result immediately
         if (timeInYears <= 0) {
             console.warn("[performCalculation] Time duration is zero or negative. Result is principal only.");
             return { inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear: 0 }, principal: principalVal, interest: 0, finalAmount: principalVal, ear: 0, timeInYears: 0, error: false };
         }

         console.log(`[performCalculation] Calculated Time (Years): ${timeInYears}, Annual Rate: ${annualRate}`);

         let result; // Result object from interest calculation functions
         let ear = 0;
         const compoundsPerYear = getCompoundsPerYear(compounding);

         if (interestType === 'simple') {
             result = calculateSimpleInterest(principalVal, annualRate, timeInYears);
             ear = annualRate;
             console.log('[performCalculation] Simple Interest Result:', result);
         } else { // compound
             result = calculateCompoundInterest(principalVal, annualRate, timeInYears, compoundsPerYear);
             ear = calculateEAR(annualRate, compoundsPerYear);
             console.log('[performCalculation] Compound Interest Result:', result);
         }

         // Check for calculation errors or NaN results explicitly
         if (result.isError || isNaN(result.interest) || isNaN(result.finalAmount) || isNaN(ear)) {
             console.error("[performCalculation] Calculation produced NaN or error flag!", result);
             return { inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear }, principal: principalVal, interest: NaN, finalAmount: NaN, ear: NaN, timeInYears: timeInYears, error: true };
         }

         const finalSummary = {
             inputs: { ...validatedData, annualRate, timeInYears, compoundsPerYear },
             principal: principalVal,
             interest: result.interest,
             finalAmount: result.finalAmount,
             ear: ear,
             timeInYears: timeInYears,
             error: false
         };
         console.log('%c[performCalculation] Final Summary:', 'color: green; font-weight: bold;', finalSummary);
         return finalSummary;
    }

    // --- Rest of the functions (init, handlers, display etc.) ---
    // Keep the rest of the functions as they were in the previous version (v1.2.0),
    // including the init function that calls cacheDOMElements and sets up listeners.
    // The crucial changes are in the functions provided above.
    // Make sure the displayResults function still correctly handles the 'error' flag in the summary object.
    // Make sure init still calls cacheDOMElements, setInitialDates, addEntry, hideAllResultDisplays etc.
    // Make sure listeners for submit, clear, mode toggle, etc. are correctly attached in init.

     /** Display results based on the mode and calculated data */
     function displayResults(resultsData) {
         console.log("%c[displayResults] Displaying results:", 'color: purple;', resultsData);
         hideAllResultDisplays(); // Clear previous state reliably first

         calculationResultsCache = resultsData; // Store the latest results

         let chartData = null;
         let displayCurrency = CONFIG.DEFAULT_CURRENCY;
         let calculationErrorOccurred = false; // Flag for ANY error (validation or calculation)

         if (resultsData.mode === 'simple' && resultsData.summary) {
             if (resultsData.summary.error) {
                 calculationErrorOccurred = true;
                 console.error("[displayResults] Simple calculation error detected in summary.");
                 dom.simpleResultsDisplay.innerHTML = `<p class="error-message">${CONFIG.ERROR_MESSAGES.calculationError}</p>`;
                 dom.simpleResultsDisplay.hidden = false;
             } else {
                 console.log("[displayResults] Displaying simple results.");
                 displaySimpleResults(resultsData.summary);
                 chartData = createChartData(resultsData.summary);
                 displayCurrency = resultsData.summary.inputs.currency;
             }
         } else if (resultsData.mode === 'advanced' && resultsData.individual.length > 0) {
             const individualErrors = resultsData.individual.some(res => res.summary.error);
             if (individualErrors) {
                 calculationErrorOccurred = true;
                 console.warn("[displayResults] Errors detected in one or more advanced calculations.");
                 // Display individuals, showing errors where they occurred
                 displayAdvancedResults(resultsData.individual, null); // Pass null for aggregate
             } else if (!resultsData.aggregated) {
                 // Indi calcs okay, but aggregation failed (likely currency or no entries)
                 console.warn("[displayResults] Aggregation failed or not possible.");
                 // Display individuals, but indicate aggregate issue
                 displayAdvancedResults(resultsData.individual, null);
                 // Show aggregation error if set (e.g., by currency conversion)
                 calculationErrorOccurred = true; // Treat aggregation failure as an error state for print btn etc.
             } else {
                 // All good
                 console.log("[displayResults] Displaying advanced results (individual + aggregated).");
                 displayAdvancedResults(resultsData.individual, resultsData.aggregated);
                 chartData = createAggregateChartData(resultsData.aggregated, resultsData.individual);
                 displayCurrency = dom.aggregationCurrencySelect.value;
             }
         } else {
             console.log("[displayResults] No valid data received to display.");
             calculationErrorOccurred = true; // Treat lack of data as an error state
         }

         // Show results area if *any* results (even errors) are to be shown
         if (resultsData.summary || resultsData.individual.length > 0) {
             dom.resultsArea.hidden = false;
             console.log("[displayResults] Results area unhidden.");
             // Enable print button ONLY if there were NO errors at all
             dom.printResultsBtn.disabled = calculationErrorOccurred;
             console.log(`[displayResults] Print button disabled: ${calculationErrorOccurred}`);
         } else {
             // Should not happen if calculateAndDisplay logic is correct, but safety check
             dom.resultsArea.hidden = true;
             dom.printResultsBtn.disabled = true;
             console.log("[displayResults] No results to show, keeping results area hidden.");
         }


         // Update Chart only if no errors AND chart data exists
         if (!calculationErrorOccurred && chartData) {
             console.log("[displayResults] Updating chart...");
             setTimeout(() => { // Use timeout to ensure canvas is ready
                updateChart(chartData, displayCurrency);
                console.log("[displayResults] Chart update called.");
             }, CONFIG.RESULTS_VISIBILITY_DELAY);
         } else {
             dom.chartArea.hidden = true; // Ensure chart is hidden if errors or no data
             console.log(`[displayResults] Chart area hidden (Error: ${calculationErrorOccurred}, ChartData: ${!!chartData})`);
         }

         // Scroll to results smoothly ONLY if displaying valid results without errors
         if (!calculationErrorOccurred && !dom.resultsArea.hidden) {
            console.log("[displayResults] Scrolling to results area...");
            dom.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
         } else {
             console.log("[displayResults] Scrolling skipped due to errors or hidden results area.");
         }
     }

     // --- Keep other functions like hideAllResultDisplays, displaySimpleResults, displayAdvancedResults, updateAggregatedDisplay, etc. ---
     // --- They should work correctly with the error flags and NaN checks added. ---
     // --- Keep init() and the event listener setup as in the previous version (v1.2.0) ---
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
     function displaySimpleResults(summary) {
        // Assume summary.error check happened before calling this
        const { principal, interest, finalAmount, ear, inputs } = summary;
        const currency = inputs.currency;

        dom.resultSimplePrincipal.textContent = formatCurrency(principal, currency);
        dom.resultSimpleInterest.textContent = formatCurrency(interest, currency);
        dom.resultSimpleFinal.textContent = formatCurrency(finalAmount, currency);
        dom.resultSimpleEar.textContent = formatPercent(ear); // EAR is rate, not currency

        dom.simpleResultsDisplay.hidden = false;
        console.log("[displaySimpleResults] Simple results displayed.");
    }
     function displayAdvancedResults(individualResults, aggregatedData) {
         console.log("[displayAdvancedResults] Displaying advanced...");
         // Display Individual Results
         dom.advancedIndividualResultsContainer.innerHTML = ''; // Clear previous
         individualResults.forEach((entryResult, index) => {
             const entryDiv = document.createElement('div');
             entryDiv.className = 'entry-result';
             const entryId = index + 1;
             const summary = entryResult.summary;
             const inputs = entryResult.inputs;
             const currency = inputs.currency || '?'; // Fallback currency

             if (summary.error) {
                 entryDiv.innerHTML = `<h4 id="adv-result-heading-${entryId}">Calculation #${entryId} (${currency})</h4><p class="error-message">${CONFIG.ERROR_MESSAGES.calculationError}</p>`;
                 console.log(`[displayAdvancedResults] Displaying error for entry #${entryId}`);
             } else {
                 entryDiv.innerHTML = `
                     <h4 id="adv-result-heading-${entryId}">Calculation #${entryId} (${currency})</h4>
                     <div class="result-item" aria-labelledby="adv-result-heading-${entryId}"><span class="label">Principal:</span><strong class="value">${formatCurrency(summary.principal, currency)}</strong></div>
                     <div class="result-item" aria-labelledby="adv-result-heading-${entryId}"><span class="label">Interest:</span><strong class="value">${formatCurrency(summary.interest, currency)}</strong></div>
                     <div class="result-item ear" aria-labelledby="adv-result-heading-${entryId}"><span class="label">EAR:</span><strong class="value">${formatPercent(summary.ear)}</strong></div>
                     <div class="result-item total" aria-labelledby="adv-result-heading-${entryId}"><span class="label">Final Amount:</span><strong class="value">${formatCurrency(summary.finalAmount, currency)}</strong></div>`;
             }
             dom.advancedIndividualResultsContainer.appendChild(entryDiv);
         });
         console.log("[displayAdvancedResults] Individual results populated.");

         // Display Aggregated Results (or hide/show error state)
         if (aggregatedData) {
             dom.aggregationCurrencySelect.disabled = false;
             updateAggregatedDisplay(); // Display with current selection
             dom.advancedAggregatedDisplayContainer.hidden = false;
             console.log("[displayAdvancedResults] Aggregated display updated.");
         } else {
             dom.aggregationCurrencySelect.disabled = true;
             dom.resultAggPrincipal.textContent = '--'; dom.resultAggInterest.textContent = '--'; dom.resultAggFinal.textContent = '--'; dom.resultAggEar.textContent = '--';
             // Keep existing aggregationError message if set
             dom.advancedAggregatedDisplayContainer.hidden = false; // Keep visible to show '--' or error msg
             console.log("[displayAdvancedResults] Aggregated data is null, displaying '--'.");
         }

         dom.advancedResultsDisplay.hidden = false;
         console.log("[displayAdvancedResults] Advanced results section unhidden.");
     }
      function updateAggregatedDisplay() {
         if (!calculationResultsCache || calculationResultsCache.mode !== 'advanced' || !calculationResultsCache.aggregated) {
            console.warn("[updateAggregatedDisplay] No valid aggregated data in cache.");
            dom.resultAggPrincipal.textContent = '--'; dom.resultAggInterest.textContent = '--'; dom.resultAggFinal.textContent = '--'; dom.resultAggEar.textContent = '--';
            if(dom.aggregationError) dom.aggregationError.textContent = '';
            dom.aggregationCurrencySelect.disabled = true;
            return;
        }
         const aggregatedData = calculationResultsCache.aggregated;
         const targetCurrency = dom.aggregationCurrencySelect.value;
         console.log(`[updateAggregatedDisplay] Updating aggregated display to currency: ${targetCurrency}`);
         if (isNaN(aggregatedData.principalNGN) || isNaN(aggregatedData.interestNGN) || isNaN(aggregatedData.finalAmountNGN)) {
             console.error("[updateAggregatedDisplay] Aggregated NGN base data is invalid (NaN).");
             dom.resultAggPrincipal.textContent = 'Error'; dom.resultAggInterest.textContent = 'Error'; dom.resultAggFinal.textContent = 'Error'; dom.resultAggEar.textContent = '--';
             if(dom.aggregationError) dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.calculationError; // More specific error?
             dom.aggregationCurrencySelect.disabled = true;
             return;
         }
         const principal = convertCurrency(aggregatedData.principalNGN, 'NGN', targetCurrency);
         const interest = convertCurrency(aggregatedData.interestNGN, 'NGN', targetCurrency);
         const finalAmount = convertCurrency(aggregatedData.finalAmountNGN, 'NGN', targetCurrency);
         const blendedEAR = aggregatedData.blendedEAR;
         const conversionFailed = isNaN(principal) || isNaN(interest) || isNaN(finalAmount);
         const displayOrError = (value) => isNaN(value) ? 'Conv. Error' : formatCurrency(value, targetCurrency);
         dom.resultAggPrincipal.textContent = displayOrError(principal);
         dom.resultAggInterest.textContent = displayOrError(interest);
         dom.resultAggFinal.textContent = displayOrError(finalAmount);
         dom.resultAggEar.textContent = formatPercent(blendedEAR);
         if (conversionFailed && dom.aggregationError) { dom.aggregationError.textContent = CONFIG.ERROR_MESSAGES.conversionError; } else if (dom.aggregationError) { dom.aggregationError.textContent = ''; }
         dom.aggregationCurrencySelect.disabled = false;
         if (interestChart && !dom.chartArea.hidden) {
             const chartCurrency = dom.aggregationCurrencySelect.value;
             console.log(`[updateAggregatedDisplay] Updating chart currency to: ${chartCurrency}`);
             interestChart.options.scales.y.ticks.callback = value => formatCurrency(value, chartCurrency);
             interestChart.options.plugins.tooltip.callbacks.label = context => { let label = context.dataset.label || ''; if (label) label += ': '; if (context.parsed.y !== null) label += formatCurrency(context.parsed.y, chartCurrency); return label; };
             interestChart.update('none');
         }
     }
    function addEntry() { const currentEntries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)').length; if (currentEntries >= CONFIG.MAX_ADVANCED_ENTRIES) { alert(CONFIG.ERROR_MESSAGES.maxEntries); return; } advancedEntryCounter++; const newEntry = dom.entryTemplate.cloneNode(true); newEntry.hidden = false; newEntry.classList.remove('entry-template'); const entryId = advancedEntryCounter; newEntry.id = `entry-${entryId}`; newEntry.dataset.entryId = entryId; newEntry.setAttribute('aria-labelledby', `entry-legend-${entryId}`); newEntry.querySelectorAll('[id*="{id}"], [name*="{id}"], [for*="{id}"], [aria-label*="{id}"], [aria-labelledby*="{id}"], [aria-describedby*="{id}"]').forEach(el => { const updateAttribute = (element, attrPrefix) => { const attrName = `${attrPrefix}-{id}`; if (element.hasAttribute(attrName)) { element.setAttribute(attrPrefix, element.getAttribute(attrName).replace('{id}', entryId)); element.removeAttribute(attrName); } else if (element.id?.includes('{id}')) { element.id = element.id.replace('{id}', entryId); } if (element.name?.includes('{id}')) element.name = element.name.replace('{id}', entryId); if (element.htmlFor?.includes('{id}')) element.htmlFor = element.htmlFor.replace('{id}', entryId); if (element.getAttribute('aria-label')?.includes('{id}')) element.setAttribute('aria-label', element.getAttribute('aria-label').replace('{id}', entryId)); if (element.getAttribute('aria-labelledby')?.includes('{id}')) element.setAttribute('aria-labelledby', element.getAttribute('aria-labelledby').replace('{id}', entryId)); if (element.getAttribute('aria-describedby')?.includes('{id}')) element.setAttribute('aria-describedby', element.getAttribute('aria-describedby').replace('{id}', entryId)); }; updateAttribute(el, 'id'); updateAttribute(el, 'name'); updateAttribute(el, 'for'); updateAttribute(el, 'aria-label'); updateAttribute(el, 'aria-labelledby'); updateAttribute(el, 'aria-describedby'); if (el.classList.contains('entry-number')) el.textContent = entryId; if (el.id === `entry-legend-${entryId}`) el.id = `entry-legend-${entryId}`; }); resetEntryToDefaults(newEntry, entryId); newEntry.querySelectorAll('input, select').forEach(input => { input.addEventListener('input', handleInputChange); input.addEventListener('change', handleInputChange); }); const removeBtn = newEntry.querySelector('.remove-entry-btn'); if (removeBtn) { removeBtn.hidden = false; removeBtn.addEventListener('click', handleRemoveEntryClick); } dom.advancedEntriesContainer.appendChild(newEntry); updateAdvancedEntryUI(); hideAllResultDisplays(); }
    function handleRemoveEntryClick(event) { const entryToRemove = event.currentTarget.closest('.entry'); if (!entryToRemove) return; entryToRemove.remove(); updateAdvancedEntryUI(); hideAllResultDisplays(); }
    function updateAdvancedEntryUI() { const remainingEntries = dom.advancedEntriesContainer.querySelectorAll('.entry:not(.entry-template)'); const entryCount = remainingEntries.length; remainingEntries.forEach((entry, index) => { const currentIdNum = index + 1; const numberSpan = entry.querySelector('.entry-number'); if (numberSpan) numberSpan.textContent = currentIdNum; const removeBtn = entry.querySelector('.remove-entry-btn'); if (removeBtn) { removeBtn.hidden = (entryCount <= 1); removeBtn.setAttribute('aria-label', `Remove Calculation ${currentIdNum}`); } }); dom.addEntryBtn.disabled = (entryCount >= CONFIG.MAX_ADVANCED_ENTRIES); }
    function handleClearFormClick() { console.log("[handleClearFormClick] Clearing form."); dom.form.reset(); clearAllErrors(dom.form); hideAllResultDisplays(); currentMode = 'simple'; dom.modeToggleSimple.classList.add('active'); dom.modeToggleSimple.setAttribute('aria-checked', 'true'); dom.modeToggleAdvanced.classList.remove('active'); dom.modeToggleAdvanced.setAttribute('aria-checked', 'false'); dom.simpleModeContainer.hidden = false; dom.advancedModeContainer.hidden = true; dom.advancedEntriesContainer.innerHTML = ''; advancedEntryCounter = 0; addEntry(); resetEntryToDefaults(dom.simpleModeContainer, 'simple'); const firstAdvEntry = dom.advancedEntriesContainer.querySelector('.entry'); if(firstAdvEntry) resetEntryToDefaults(firstAdvEntry, 1); updateAdvancedEntryUI(); dom.aggregationCurrencySelect.value = CONFIG.DEFAULT_CURRENCY; dom.aggregationCurrencySelect.disabled = true; console.log("Form Cleared and reset to simple mode defaults."); }
    function resetEntryToDefaults(container, entryId = 'simple') { if (!container) return; console.log(`[resetEntryToDefaults] Resetting container for ID: ${entryId}`); const getEl = (selector) => container.querySelector(selector.replace('{id}', entryId)); const currencySelect = getEl(`select[name="currency-${entryId}"]`); if (currencySelect) currencySelect.value = CONFIG.DEFAULT_CURRENCY; const principalInput = getEl(`input[name="principal-${entryId}"]`); if (principalInput) principalInput.value = CONFIG.DEFAULT_PRINCIPAL; const rateInput = getEl(`input[name="rate-${entryId}"]`); if (rateInput) rateInput.value = CONFIG.DEFAULT_RATE; const ratePeriodSelect = getEl(`select[name="rate-period-${entryId}"]`); if (ratePeriodSelect) ratePeriodSelect.value = CONFIG.DEFAULT_RATE_PERIOD; const typeSelect = getEl(`select[name="type-${entryId}"]`); if (typeSelect) typeSelect.value = CONFIG.DEFAULT_INTEREST_TYPE; const compoundingSelect = getEl(`select[name="compounding-${entryId}"]`); if (compoundingSelect) compoundingSelect.value = CONFIG.DEFAULT_COMPOUNDING; const symbolSpan = getEl(`.principal-group .currency-symbol`); if (symbolSpan) symbolSpan.textContent = '₦'; const timeMethodRadios = container.querySelectorAll(`input[name="timeMethod-${entryId}"]`); const datesContainer = getEl(`#dates-${entryId}-container`); const durationContainer = getEl(`#duration-${entryId}-container`); timeMethodRadios.forEach(radio => radio.checked = (radio.value === 'dates')); if (datesContainer) datesContainer.hidden = false; if (durationContainer) durationContainer.hidden = true; setInitialDates(container); const durationValueInput = getEl(`input[name="duration-value-${entryId}"]`); if (durationValueInput) durationValueInput.value = CONFIG.DEFAULT_DURATION_VALUE; const durationUnitSelect = getEl(`select[name="duration-unit-${entryId}"]`); if (durationUnitSelect) durationUnitSelect.value = CONFIG.DEFAULT_DURATION_UNIT; const compoundingGroup = getEl('.compounding-group'); if (compoundingGroup) compoundingGroup.hidden = (CONFIG.DEFAULT_INTEREST_TYPE === 'simple'); }
    function handleFormSubmit(event) { event.preventDefault(); console.log("[handleFormSubmit] Calculate button clicked. Initiating calculation..."); calculateAndDisplay(); }
    function handlePrintResultsClick() { console.log("[handlePrintResultsClick] Printing results..."); window.print(); }
    function handleAggregationCurrencyChange() { console.log("[handleAggregationCurrencyChange] Aggregation currency changed."); updateAggregatedDisplay(); }
    function setInitialDates(container) { if (!container) return; const startDateInput = container.querySelector('input[name^="start-date"]'); const endDateInput = container.querySelector('input[name^="end-date"]'); if (startDateInput && endDateInput) { const today = new Date(); const oneYearLater = new Date(today); oneYearLater.setFullYear(today.getFullYear() + 1); const formatDate = (date) => date.toISOString().split('T')[0]; startDateInput.value = formatDate(today); endDateInput.value = formatDate(oneYearLater); } }
    function updateCopyrightYear() { if (dom.currentYearSpan) dom.currentYearSpan.textContent = new Date().getFullYear(); }
     function init() { if (!cacheDOMElements()) return; console.log("[init] Caching DOM elements successful."); dom.simpleModeContainer.hidden = false; dom.advancedModeContainer.hidden = true; resetEntryToDefaults(dom.simpleModeContainer); addEntry(); hideAllResultDisplays(); dom.aggregationCurrencySelect.disabled = true; dom.modeToggleSimple.addEventListener('click', handleModeToggleClick); dom.modeToggleAdvanced.addEventListener('click', handleModeToggleClick); dom.form.addEventListener('input', handleInputChange); dom.form.addEventListener('change', handleInputChange); dom.form.addEventListener('submit', handleFormSubmit); dom.clearFormBtn.addEventListener('click', handleClearFormClick); dom.printResultsBtn.addEventListener('click', handlePrintResultsClick); dom.aggregationCurrencySelect.addEventListener('change', handleAggregationCurrencyChange); if (dom.addEntryBtn) dom.addEntryBtn.addEventListener('click', addEntry); updateCopyrightYear(); console.info("Interest Calculator Initialized (v1.2.0). Ready for calculation on submit."); }
     if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); } else { init(); }

})();
