// Helpers for the calculated fields of the structural report.
//
// The save handlers write each computed value into its DOM input and then read every input back to
// build the payload. A number input rejects NaN/Infinity: the browser keeps '' and logs
// "The specified value "NaN" cannot be parsed". Writing '' directly produces the same DOM value, so the
// payload read right after is byte-identical and the console stays clean. Text inputs are left untouched
// because their stored value is whatever string was written.
export const setCalcValue = (id, value) => {
    const element = document.getElementById(id);
    element.value = element.type === 'number' && !Number.isFinite(Number(value)) ? '' : value;
};

// Display guard for `defaultValue`: a stored or computed NaN must never reach the DOM attribute.
export const noNaN = (value) => (value === 'NaN' || (typeof value === 'number' && Number.isNaN(value)) ? '' : value);
