/**
 * lib/financial-utils.js
 * Core financial calculation logic for Mutual Fund Analysis.
 */

// --- DATE and NAV Helpers ---

/**
 * Converts "DD-MM-YYYY" string to a JavaScript Date object.
 * @param {string} dateString Date string in "DD-MM-YYYY" format.
 * @returns {Date}
 */
export const parseDate = (dateString) => {
  const [day, month, year] = dateString.split('-');
  // Note: Month is 0-indexed in JavaScript Date (e.g., 0 for Jan, 11 for Dec)
  return new Date(year, month - 1, day);
};

/**
 * Finds the NAV for a specific date or the nearest available earlier date.
 * Assumes navHistory is sorted oldest to newest (ascending).
 *
 * @param {Date} targetDate The date to find the NAV for.
 * @param {Array<{date: string, nav: number}>} navHistory Array of historical NAVs.
 * @returns {{date: string, nav: number} | null} The NAV entry or null if not found.
 */
export const findNearestEarlierNav = (targetDate, navHistory) => {
  let nearestEntry = null;
  const targetTime = targetDate.getTime();

  for (let i = navHistory.length - 1; i >= 0; i--) {
    const navEntry = navHistory[i];
    const navDate = parseDate(navEntry.date);

    // If we find an exact match OR an available date before the target date
    if (navDate.getTime() <= targetTime) {
      nearestEntry = navEntry;
      break;
    }
  }

  return nearestEntry;
};

/**
 * Calculates the difference in years between two Date objects.
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number} Difference in years.
 */
export const calculateDateDifferenceInYears = (startDate, endDate) => {
  const diffInMilliseconds = endDate.getTime() - startDate.getTime();
  const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25; // Account for leap years
  return diffInMilliseconds / millisecondsInYear;
};

// --- FINANCIAL CALCULATORS (To be implemented in Step 9) ---
// ...

// ... (Previous Helper Functions)

// --- FINANCIAL CALCULATORS ---

/**
 * Calculates Simple and Annualized Returns.
 * @param {number} startNav
 * @param {number} endNav
 * @param {number} years Duration in years.
 * @returns {{ simpleReturn: number, annualizedReturn: number | null }}
 */
export const calculateReturns = (startNav, endNav, years) => {
  if (startNav <= 0 || endNav <= 0) {
    return { simpleReturn: 0, annualizedReturn: null };
  }
  
  // Simple Return (%)
  const simpleReturn = ((endNav - startNav) / startNav) * 100;
  
  let annualizedReturn = null;

  // Annualized Return (%) is only meaningful if the period is 30 days or more (approx 0.082 years)
  if (years >= (30 / 365.25)) {
    // Annualized Return (CAGR) Formula: ((End Value / Start Value)^(1/Years) - 1) * 100
    annualizedReturn = (Math.pow(endNav / startNav, 1 / years) - 1) * 100;
  }

  return { 
    simpleReturn: parseFloat(simpleReturn.toFixed(2)),
    annualizedReturn: annualizedReturn !== null ? parseFloat(annualizedReturn.toFixed(2)) : null,
  };
};

// --- SIP Calculator Logic (To be implemented in Step 10) ---
// ...

// ... (Previous Helper Functions and Returns Logic)

/**
 * Generates SIP dates based on frequency. Only 'monthly' is supported for simplicity now.
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Array<Date>} Array of SIP dates.
 */
const generateSipDates = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  // Use the day of the starting date for all subsequent monthly SIPs
  const dayOfMonth = currentDate.getDate();

  while (currentDate.getTime() <= endDate.getTime()) {
    dates.push(new Date(currentDate)); // Push a copy

    // Move to the next month
    currentDate.setMonth(currentDate.getMonth() + 1);

    // If setting the month advanced the day (e.g., from Jan 31st to March 3rd), 
    // we need to set it back to the last day of the intended month.
    if (currentDate.getDate() !== dayOfMonth) {
      currentDate.setDate(0); // Set to the last day of the *previous* month
      currentDate.setDate(dayOfMonth); // Then set to the intended day (e.g., 31st)
    }
  }
  return dates;
};


/**
 * Calculates SIP returns based on investment plan and NAV history.
 * @param {number} amount Monthly SIP amount.
 * @param {string} fromDateString Start date ("YYYY-MM-DD").
 * @param {string} toDateString End date ("YYYY-MM-DD").
 * @param {Array<{date: string, nav: number}>} navHistory Sorted historical NAV data.
 * @returns {object} SIP calculation results.
 */
export const calculateSip = (amount, fromDateString, toDateString, navHistory) => {
  const startDate = new Date(fromDateString);
  const endDate = new Date(toDateString);

  if (!navHistory || navHistory.length === 0) {
    return { status: 'needs_review', message: 'Insufficient NAV data available for the scheme.' };
  }

  const sipDates = generateSipDates(startDate, endDate);
  
  let totalInvested = 0;
  let totalUnits = 0;
  let investmentHistory = []; // To power the SIP Growth Chart on the frontend

  for (const date of sipDates) {
    const navEntry = findNearestEarlierNav(date, navHistory);

    if (navEntry && navEntry.nav > 0) {
      const units = amount / navEntry.nav;
      totalInvested += amount;
      totalUnits += units;
      
      // For the chart: store the investment point
      investmentHistory.push({
        date: navEntry.date,
        invested: totalInvested,
        units: totalUnits,
        nav: navEntry.nav
      });
    }
    // If navEntry is null or NAV is 0, we skip this installment (edge case handled)
  }

  if (totalUnits === 0) {
    return { status: 'needs_review', message: 'No successful SIP installments found in the period.' };
  }

  // Use the latest available NAV for current valuation
  const endNavEntry = navHistory[navHistory.length - 1]; 
  const currentValue = totalUnits * endNavEntry.nav;
  const totalYears = calculateDateDifferenceInYears(startDate, endNavEntry.navDate); // Use the last NAV date

  // Calculations
  const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;
  const annualizedReturn = (Math.pow(currentValue / totalInvested, 1 / totalYears) - 1) * 100;

  return {
    status: 'success',
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    totalUnits: parseFloat(totalUnits.toFixed(4)),
    absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
    annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
    investmentHistory,
  };
};

// --- Goal-Based Planner Logic (To be implemented in Step 11) ---
// ...
// ... (Previous Helper Functions, Returns, and SIP Logic)

/**
 * Estimates the scheme's Compound Annual Growth Rate (CAGR) over the longest period available (up to 5 years).
 * @param {Array<{date: string, nav: number}>} navHistory Sorted historical NAV data.
 * @returns {number | null} The estimated annual return rate (as a decimal, e.g., 0.15 for 15%).
 */
export const estimateCagr = (navHistory) => {
    if (navHistory.length < 2) return null;

    // Use the maximum possible historical period, up to 5 years, for a stable estimate
    const latestEntry = navHistory[navHistory.length - 1];
    const latestDate = parseDate(latestEntry.date);

    // Find the NAV from 5 years ago (or the oldest available date)
    const fiveYearsAgo = new Date(latestDate);
    fiveYearsAgo.setFullYear(latestDate.getFullYear() - 5);
    
    // Find the nearest NAV for the 5-year start date
    const startEntry = findNearestEarlierNav(fiveYearsAgo, navHistory) || navHistory[0];

    const startNav = startEntry.nav;
    const endNav = latestEntry.nav;

    if (startNav <= 0 || endNav <= 0) return null;

    const years = calculateDateDifferenceInYears(parseDate(startEntry.date), latestDate);

    if (years < 1) return null; // Need at least one year of history for a decent CAGR

    // CAGR Formula: (End Value / Start Value)^(1/Years) - 1
    const cagr = Math.pow(endNav / startNav, 1 / years) - 1;
    
    // Cap the estimated return to a realistic maximum (e.g., 25%) to avoid over-optimistic results
    return Math.min(cagr, 0.25); 
};

/**
 * Calculates the required monthly SIP amount to reach a financial goal.
 * Uses the Future Value of Annuity formula solved for payment (P).
 *
 * @param {number} goalAmount The desired final value.
 * @param {number} years The investment duration in years.
 * @param {number} cagr The estimated annual return rate (as a decimal, e.g., 0.10).
 * @returns {{ requiredSip: number, message: string }}
 */
export const calculateRequiredSipForGoal = (goalAmount, years, cagr) => {
    if (cagr === null || cagr <= 0 || years <= 0 || goalAmount <= 0) {
        return { requiredSip: null, message: 'Cannot calculate. Invalid historical data or input.' };
    }

    const months = years * 12;
    // Monthly rate (r_m) = (1 + r_annual)^(1/12) - 1. 
    // Using simple monthly division (cagr / 12) is often sufficient and easier for LLM comparisons.
    // We will use simple division here for hackathon simplicity:
    const monthlyRate = cagr / 12;

    // Future Value of Annuity (FV) Formula: FV = P * [ ((1 + r_m)^n - 1) / r_m ]
    // Solved for Payment (P): P = FV * [ r_m / ((1 + r_m)^n - 1) ]
    
    const futureValueFactor = Math.pow(1 + monthlyRate, months) - 1;
    
    if (futureValueFactor === 0) {
        return { requiredSip: null, message: 'Rate of return is too low to calculate.' };
    }

    const requiredSip = goalAmount * (monthlyRate / futureValueFactor);
    
    return {
        requiredSip: parseFloat(requiredSip.toFixed(2)),
        message: `Calculation based on estimated ${Math.round(cagr * 100)}% annualized return over ${years} years.`
    };
};