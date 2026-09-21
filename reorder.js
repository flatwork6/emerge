const fs = require('fs');
const content = fs.readFileSync('test/pageobjects/funds.page.js', 'utf8');
const lines = content.split('\n');

function getBlock(methodName) {
    let start = -1;
    let end = -1;
    let braceCount = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`async ${methodName}(`)) {
            start = i;
            braceCount = 0;
        }
        if (start !== -1) {
            for (let char of lines[i]) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }
            if (braceCount === 0 && lines[i].includes('}')) {
                end = i;
                return { start, end, text: lines.slice(start, end + 1).join('\n') };
            }
        }
    }
    return null;
}

const m21 = getBlock('verifyTotalCreditsBreakdownAndSum');
const m22 = getBlock('verifyUtilizedSum');
const m22b = getBlock('compareHighestUtilizedSum');
const m23 = getBlock('verifyEquityOrFnoUtilizationBreakdown');
const m24 = getBlock('verifyEquityOrFnoUtilizationSum');
const m25 = getBlock('verifyCommodityUtilizationBreakdown');
const m26 = getBlock('verifyCommodityUtilizationSum');
const m27 = getBlock('verifyMtfUtilizationBreakdown');
const m28 = getBlock('verifyMtfUtilizationSum');
const m29 = getBlock('verifyMtomPercentageBreakdown');
const m30 = getBlock('verifyCollateralBreakdown');
const m31 = getBlock('verifyUtilizationDetailsHeader');
const m32 = getBlock('verifyUtilizationDetailsRows');
const m33 = getBlock('verifyIntradayMarginBreakdown');
const m34 = getBlock('verifyIntradayMarginSum');
const m35 = getBlock('verifyDeliveryCfMarginBreakdown');
const m36 = getBlock('verifyNormalMarginBreakdownAndSum');

// Find the start of the block of methods we want to reorder
const startIdx = m22.start; // TC-22 is currently the first one among 21-36
const endIdx = m36.end;

// Now we can construct the new order of methods
const methods = [
    m21, m22, m22b, m23, m24, m25, m26, m27, m28, m29, m30, m31, m32, m33, m34, m35, m36
];

// Verify we got all methods
for (let i = 0; i < methods.length; i++) {
    if (!methods[i]) {
        console.error("Method not found at index", i);
        process.exit(1);
    }
}

// First, extract all methods from lines to replace them
// To be safe, we will just clear out lines from startIdx to endIdx and insert the new text
// But wait! There might be blank lines between methods that get lost.
// Instead of messing with lines, we can just replace the whole chunk from min(starts) to max(ends)
let minStart = Math.min(...methods.map(m => m.start));
let maxEnd = Math.max(...methods.map(m => m.end));

let newText = methods.map(m => m.text).join('\n\n');

lines.splice(minStart, maxEnd - minStart + 1, newText);

fs.writeFileSync('test/pageobjects/funds.page.js', lines.join('\n'));
console.log("Success");
