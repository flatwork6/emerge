import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })
import HoldingsPage from '../pageobjects/holdings.page.js'
import locators from '../utils/locatorHelper.js'

describe('Holdings Page Verification', () => {
    let stockData = [];

    // it('TC-01: Holdings page shows correct total count', async () => {
    //     console.log(`\n========================================`)
    //     console.log(`TC-01: Verify Holdings Header Count`)
    //     console.log(`========================================`)

    //     await HoldingsPage.openHoldings();

    //     // Extract header count from Holdings tab
    //     const holdingsTab = $(locators.get('holdingsTab'));
    //     await holdingsTab.waitForDisplayed({ timeout: 5000 });
    //     const desc = await holdingsTab.getAttribute('content-desc');
    //     console.log(`Holdings Tab desc: ${desc}`);

    //     let headerCount = 0;
    //     if (desc) {
    //         // Usually format is "Holdings 2" or "Holdings\n2"
    //         const match = desc.match(/Holdings\s*(\d+)/i) || desc.match(/\d+/);
    //         if (match) {
    //             headerCount = parseInt(match[1] || match[0], 10);
    //         }
    //     }

    //     const rows = await $$(locators.get('portfolioStockRows'));
    //     let visibleRows = 0;
    //     for (const row of rows) {
    //         if (await row.isDisplayed().catch(() => false)) {
    //             visibleRows++;
    //         }
    //     }

    //     console.log(`Header count: ${headerCount}, Visible rows count: ${visibleRows}`);
    //     if (headerCount == visibleRows) {
    //         console.log("✅ Verified holdings count")
    //     }
    //     // If it's an empty state, check if count is 0
    //     const emptyState = await $(locators.get("startYourInvestment"));
    //     if (await emptyState.isExisting()) {
    //         expect(headerCount).toBe(0);
    //         expect(visibleRows).toBe(0);
    //     } else {
    //         expect(headerCount).toBe(visibleRows);
    //     }
    // });

    // it('TC-02: Switching to BSE recalculates the same scrips\' values', async () => {
    //     console.log(`\n========================================`)
    //     console.log(`TC-03: Switching to BSE recalculates values`)
    //     console.log(`========================================`)

    //     const emptyState = await $(locators.get("startYourInvestment"));
    //     if (await emptyState.isExisting()) {
    //         console.log("No holdings to test BSE recalculation. Skipping.");
    //         return; // Cannot test toggle without holdings
    //     }

    //     const rowsNse = await $$(locators.get('portfolioStockRows'));
    //     const nseTexts = [];
    //     for (const row of rowsNse) {
    //         if (await row.isDisplayed()) {
    //             nseTexts.push(await row.getAttribute('content-desc'));
    //         }
    //     }

    //     // Switch to BSE
    //     const bseToggle = $(`android=new UiSelector().description("BSE exchange\nBSE")`);
    //     await bseToggle.click();
    //     await driver.pause(2000); // Wait for recalculation

    //     const rowsBse = await $$(locators.get('portfolioStockRows'));
    //     const bseTexts = [];
    //     for (const row of rowsBse) {
    //         if (await row.isDisplayed()) {
    //             bseTexts.push(await row.getAttribute('content-desc'));
    //         }
    //     }

    //     console.log("NSE Holdings:", nseTexts);
    //     console.log("BSE Holdings:", bseTexts);

    //     // Basic verification: number of scrips should be the same
    //     expect(bseTexts.length).toBe(nseTexts.length);

    //     let valuesChanged = false;
    //     try {
    //         // Same scrips should remain listed, check if the scrip names match
    //         for (let i = 0; i < nseTexts.length; i++) {
    //             const nseName = nseTexts[i].split('\n').find(part => /[a-zA-Z]/.test(part) && !part.includes('Qty') && !part.includes('LTP') && !part.includes('Invested') && !part.includes('Avg'));
    //             const bseName = bseTexts[i].split('\n').find(part => /[a-zA-Z]/.test(part) && !part.includes('Qty') && !part.includes('LTP') && !part.includes('Invested') && !part.includes('Avg'));
    //             expect(nseName.split('-')[0]).toBe(bseName.split('-')[0]);

    //             // Values might be different, but for now we just verify they recalculated/reloaded successfully without crashing
    //             if (nseTexts[i] !== bseTexts[i]) {
    //                 valuesChanged = true;
    //             }
    //         }

    //         if (valuesChanged) {
    //             console.log("✅ NSE/BSE toggle successfull");
    //         }
    //     } finally {
    //         await driver.pause(1000);
    //         // Switch back to NSE to leave state as it was
    //         const nseToggle = $(`android=new UiSelector().description("NSE exchange\nNSE")`);
    //         await nseToggle.click();
    //         await driver.pause(1000);
    //     }
    // });

    // it('TC-03: Shows "No Holdings Found" and "Your Portfolio is currently empty" if no holdings are present', async () => {
    //     console.log(`\n========================================`)
    //     console.log(`TC-04: Empty state texts`)
    //     console.log(`========================================`)

    //     const emptyState = await $(locators.get("startYourInvestment"));
    //     if (await emptyState.isExisting()) {
    //         // Validate the specific texts
    //         const noHoldingsFound = await $(locators.get('holdingsNoHoldingsFoundRegex'));
    //         const portfolioEmpty = await $(locators.get('holdingsPortfolioEmptyRegex'));

    //         const isNoHoldingsFoundExisting = await noHoldingsFound.isExisting();
    //         const isPortfolioEmptyExisting = await portfolioEmpty.isExisting();

    //         console.log(`"✅ No Holdings Found" present: ${isNoHoldingsFoundExisting}`);
    //         console.log(`"✅ Your Portfolio is currently empty" present: ${isPortfolioEmptyExisting}`);

    //         expect(isNoHoldingsFoundExisting).toBe(true);
    //         expect(isPortfolioEmptyExisting).toBe(true);
    //     } else {
    //         console.log("✅ User has holdings, cannot verify empty state texts in this run.");
    //         // Pass the test implicitly if we can't test it, or we could fail it. But usually we handle conditional states.
    //     }
    // });

    // it('TC-04: Holdings search functionality', async () => {
    //     console.log(`\n========================================`)
    //     console.log(`TC-05: Search holdings`)
    //     console.log(`========================================`)

    //     const emptyState = await $(locators.get("startYourInvestment"));
    //     if (await emptyState.isExisting()) {
    //         console.log("No holdings to test search. Skipping.");
    //         return;
    //     }

    //     // Get the name of the first holding to search for
    //     const rows = await $$(locators.get('portfolioStockRows'));
    //     if (rows.length === 0) return;

    //     const firstRowDesc = await rows[0].getAttribute('content-desc');
    //     const validName = firstRowDesc.split('\n').find(part => /[a-zA-Z]/.test(part) && !part.includes('Qty') && !part.includes('LTP') && !part.includes('Invested') && !part.includes('Avg') && !part.includes('T1:') && !part.includes('T2:')).trim();

    //     console.log(`Searching for valid holding: ${validName}`);



    //     const searchInput = $('android.widget.EditText');
    //     await searchInput.click();
    //     await searchInput.setValue(validName);
    //     await driver.pause(2000);

    //     // Verify that the order shows up
    //     const searchResults = await $$(locators.get('portfolioStockRows'));
    //     let found = false;
    //     for (const row of searchResults) {
    //         const desc = await row.getAttribute('content-desc');
    //         if (desc && desc.includes(validName)) {
    //             found = true;
    //             break;
    //         }
    //     }
    //     expect(found).toBe(true);
    //     console.log(`✅ Valid search successful`);

    //     // Enter invalid name
    //     const invalidName = "INVALID_SCRIP_123";
    //     console.log(`Searching for invalid holding: ${invalidName}`);
    //     await searchInput.clearValue();
    //     await searchInput.setValue(invalidName);
    //     await driver.pause(2000);

    //     // Verify "No matching holdings found" shows
    //     const noMatchMsg = await $(locators.get('holdingsNoMatchingFoundDesc'));
    //     const isNoMatchExisting = await noMatchMsg.isExisting();
    //     expect(isNoMatchExisting).toBe(true);
    //     console.log(`✅ Invalid search shows correct empty state`);

    //     // Clear search to restore state
    //     await searchInput.clearValue();

    //     await driver.pause(1000);
    // });

    // it('TC-06: Portfolio Value Visibility Toggle', async () => {
    //     console.log(`\n========================================`)
    //     console.log(`TC-06: Eye Icon visibility toggle`)
    //     console.log(`========================================`)

    //     // Click the Portfolio Value card/chevron to open the dropdown
    //     const portfolioValueCard = await $(locators.get('holdingsPortfolioValueDesc'));
    //     if (await portfolioValueCard.isExisting()) {
    //         await portfolioValueCard.click();
    //         await driver.pause(1000);
    //     }

    //     // The eye icon
    //     const eyeIcon = await $(locators.get('holdingsEyeIconInstance'));
    //     if (await eyeIcon.isExisting()) {
    //         // Click to hide values
    //         await eyeIcon.click();
    //         await driver.pause(1500);

    //         // Verify hidden state (presence of ••••••)
    //         const hiddenValueDesc = await $(locators.get('holdingsHiddenValueDesc'));
    //         const hiddenValueText = await $(locators.get('holdingsHiddenValueText'));

    //         let isHidden = (await hiddenValueDesc.isExisting()) || (await hiddenValueText.isExisting());
    //         expect(isHidden).toBe(true);
    //         console.log(`✅ Values successfully hidden (•••••• displayed)`);

    //         // Click again to show values
    //         await eyeIcon.click();
    //         await driver.pause(1500);

    //         // Verify visible state
    //         isHidden = (await hiddenValueDesc.isExisting()) || (await hiddenValueText.isExisting());
    //         expect(isHidden).toBe(false);
    //         console.log(`✅ Values successfully shown again`);
    //     } else {
    //         console.log("Eye icon not found, skipping toggle test.");
    //     }
    // });

    // it('TC-07: Verify Portfolio and Invested Aggregations', async () => {
    //     console.log(`\n========================================`);
    //     console.log(`TC-07: Portfolio and Invested Aggregations`);
    //     console.log(`========================================`);

    //     const emptyState = await $(locators.get("startYourInvestment"));
    //     if (await emptyState.isExisting()) {
    //         console.log("No holdings found. Skipping aggregation test.");
    //         return;
    //     }

    //     // Get Portfolio Value from summary
    //     const portfolioValueCard = await $(locators.get('holdingsPortfolioValueDesc'));
    //     const portfolioDesc = await portfolioValueCard.getAttribute('content-desc');
    //     console.log(`Summary Portfolio Desc:\n${portfolioDesc}`);

    //     let summaryPortfolioValue = 0;
    //     let summaryTodaysReturn = 0;
    //     let summaryTodaysReturnPercent = 0;
    //     if (portfolioDesc) {
    //         const match = portfolioDesc.match(/Portfolio Value\n₹?([\d,.]+)/i);
    //         if (match) summaryPortfolioValue = parseFloat(match[1].replace(/,/g, ''));

    //         // Matches e.g., Today's Return\n₹0.66 (1.32%) or -₹0.66 (-1.32%)
    //         const matchToday = portfolioDesc.match(/Today's Return\n([^(]+)(?:\(([^%]+)%\))?/i);
    //         if (matchToday) {
    //             summaryTodaysReturn = parseFloat(matchToday[1].replace(/[^0-9.-]/g, ''));
    //             if (matchToday[1].includes('-') && summaryTodaysReturn > 0) summaryTodaysReturn = -summaryTodaysReturn;

    //             if (matchToday[2]) {
    //                 summaryTodaysReturnPercent = parseFloat(matchToday[2].replace(/[^0-9.-]/g, ''));
    //                 if (matchToday[2].includes('-') && summaryTodaysReturnPercent > 0) summaryTodaysReturnPercent = -summaryTodaysReturnPercent;
    //             }
    //         }
    //     }

    //     // Expand chevron if Invested is not visible
    //     let investedCard = await $(locators.get('holdingsInvestedDesc'));
    //     if (!(await investedCard.isExisting())) {
    //         if (await portfolioValueCard.isExisting()) {
    //             await portfolioValueCard.click();
    //             await driver.pause(1000);
    //         }
    //         investedCard = await $(locators.get('holdingsInvestedDesc'));
    //     }

    //     const investedDesc = await investedCard.getAttribute('content-desc');
    //     console.log(`Summary Invested Desc:\n${investedDesc}`);
    //     let summaryInvestedValue = 0;
    //     let summaryTotalPnl = 0;
    //     let summaryTotalPnlPercent = 0;

    //     if (investedDesc) {
    //         // Find "Invested" followed by a newline and the ₹ value
    //         const match = investedDesc.match(/Invested\n₹?([\d,.]+)/i) || investedDesc.match(/₹?([\d,.]+)/);
    //         if (match) summaryInvestedValue = parseFloat(match[1].replace(/,/g, ''));

    //         // Match Total P&L (similar to Today's Return) e.g., Total P&L\n₹-2.80 (-5.24%)
    //         const matchTotal = investedDesc.match(/Total P&L\n([^(]+)(?:\(([^%]+)%\))?/i);
    //         if (matchTotal) {
    //             summaryTotalPnl = parseFloat(matchTotal[1].replace(/[^0-9.-]/g, ''));
    //             if (matchTotal[1].includes('-') && summaryTotalPnl > 0) summaryTotalPnl = -summaryTotalPnl;

    //             if (matchTotal[2]) {
    //                 summaryTotalPnlPercent = parseFloat(matchTotal[2].replace(/[^0-9.-]/g, ''));
    //                 if (matchTotal[2].includes('-') && summaryTotalPnlPercent > 0) summaryTotalPnlPercent = -summaryTotalPnlPercent;
    //             }
    //         }
    //     }

    //     console.log(`Extracted Summary -> Portfolio: ${summaryPortfolioValue}, Invested: ${summaryInvestedValue}, Today's Return: ${summaryTodaysReturn}, Total P&L: ${summaryTotalPnl}`);

    //     const rows = await $$(locators.get('portfolioStockRows'));
    //     let totalCalculatedPortfolio = 0;
    //     let totalCalculatedInvested = 0;
    //     let totalCalculatedDaysPnl = 0;
    //     let totalCalculatedTotalPnl = 0;

    //     stockData = [];

    //     for (let i = 0; i < rows.length; i++) {
    //         const row = (await $$(locators.get('portfolioStockRows')))[i];
    //         await row.click();
    //         await driver.pause(1500);

    //         const viewMoreBtn = await $(locators.get('holdingsViewMoreBtn'));
    //         if (await viewMoreBtn.isExisting()) {
    //             await viewMoreBtn.click();
    //             await driver.pause(1500);
    //         }

    //         // Extract all text from bottom sheet to find the values
    //         const allElements = await $$(locators.get('holdingsAllItemsRegex'));
    //         let holdingCurrentValue = 0;
    //         let holdingInvestedValue = 0;
    //         let holdingDaysPnlValue = 0;
    //         let holdingQuantity = 0;
    //         let holdingUnPnlValue = 0;
    //         let holdingRPnlValue = 0;

    //         let sheetTexts = [];
    //         for (const el of allElements) {
    //             const text = await el.getAttribute('content-desc');
    //             if (text && text.trim().length > 0) {
    //                 sheetTexts.push(text.trim());
    //             }
    //         }
    //         console.log(`Holding ${i + 1} Extracted Texts:`, sheetTexts);
    //         let stockName = sheetTexts.length > 0 ? sheetTexts[0] : `Unknown-${i}`;

    //         // Function to safely extract a number given a label
    //         const getValueForLabel = (label) => {
    //             let idx = sheetTexts.indexOf(label);
    //             if (idx !== -1 && (idx + 3) < sheetTexts.length) {
    //                 let valStr = sheetTexts[idx + 3];
    //                 let parsedNum = parseFloat(valStr.replace(/[^0-9.-]/g, ''));
    //                 if (valStr.includes('-') && parsedNum > 0) parsedNum = -parsedNum;
    //                 return parsedNum;
    //             }
    //             return 0;
    //         };

    //         holdingInvestedValue = getValueForLabel('Invested');
    //         holdingCurrentValue = getValueForLabel('Current Val');
    //         holdingDaysPnlValue = getValueForLabel("Day's P&L");
    //         holdingQuantity = getValueForLabel('Quantity');
    //         holdingUnPnlValue = getValueForLabel('UnPnl');
    //         holdingRPnlValue = getValueForLabel('RPnl');

    //         // According to logic: If quantity is 0, use RPnl, otherwise use UnPnl
    //         let holdingTotalPnlValue = (holdingQuantity === 0) ? holdingRPnlValue : holdingUnPnlValue;

    //         console.log(`Holding ${i + 1} (${stockName}) Values -> Current: ${holdingCurrentValue}, Invested: ${holdingInvestedValue}, Day's P&L: ${holdingDaysPnlValue}, Total P&L: ${holdingTotalPnlValue}`);

    //         stockData.push({
    //             name: stockName,
    //             current: holdingCurrentValue,
    //             invested: holdingInvestedValue,
    //             unpnl: holdingTotalPnlValue,
    //             dayPnl: holdingDaysPnlValue
    //         });

    //         totalCalculatedPortfolio += holdingCurrentValue;
    //         totalCalculatedInvested += holdingInvestedValue;
    //         totalCalculatedDaysPnl += holdingDaysPnlValue;
    //         totalCalculatedTotalPnl += holdingTotalPnlValue;

    //         // Close the bottom sheet (might need to go back twice if View More opened a new layer)
    //         await driver.back();
    //         await driver.pause(1000);

    //         // Check if we are fully back to the list
    //         if (!(await row.isDisplayed().catch(() => false))) {
    //             await driver.back();
    //             await driver.pause(1000);
    //         }
    //     }

    //     // Verify Today's Return %
    //     const previousPortfolioValue = summaryPortfolioValue - summaryTodaysReturn;
    //     let calculatedTodaysReturnPercent = 0;
    //     if (previousPortfolioValue !== 0) {
    //         calculatedTodaysReturnPercent = (summaryTodaysReturn / previousPortfolioValue) * 100;
    //     }

    //     // Verify Total P&L %
    //     let calculatedTotalPnlPercent = 0;
    //     if (summaryInvestedValue !== 0) {
    //         calculatedTotalPnlPercent = (summaryTotalPnl / summaryInvestedValue) * 100;
    //     }

    //     console.log(`\n========================================`);
    //     console.log(`📊 HOLDINGS AGGREGATION REPORT `);
    //     console.log(`========================================`);
    //     console.log(`✅ Portfolio Value:`);
    //     console.log(`   Calculated (Sum of Holdings): ₹${totalCalculatedPortfolio.toFixed(2)}`);
    //     console.log(`   Displayed in Summary UI:      ₹${summaryPortfolioValue.toFixed(2)}`);
    //     console.log(`----------------------------------------`);
    //     console.log(`✅ Invested Value:`);
    //     console.log(`   Calculated (Sum of Holdings): ₹${totalCalculatedInvested.toFixed(2)}`);
    //     console.log(`   Displayed in Summary UI:      ₹${summaryInvestedValue.toFixed(2)}`);
    //     console.log(`----------------------------------------`);
    //     console.log(`✅ Today's Return (Day's P&L):`);
    //     console.log(`   Calculated (Sum of Holdings): ₹${totalCalculatedDaysPnl.toFixed(2)}`);
    //     console.log(`   Displayed in Summary UI:      ₹${summaryTodaysReturn.toFixed(2)}`);
    //     console.log(`----------------------------------------`);
    //     console.log(`✅ Total P&L:`);
    //     console.log(`   Calculated (Sum of Holdings): ₹${totalCalculatedTotalPnl.toFixed(2)}`);
    //     console.log(`   Displayed in Summary UI:      ₹${summaryTotalPnl.toFixed(2)}`);
    //     console.log(`----------------------------------------`);
    //     console.log(`✅ Today's Return %:`);
    //     console.log(`   Calculated via Formula:       ${calculatedTodaysReturnPercent.toFixed(2)}%`);
    //     console.log(`   Displayed in Summary UI:      ${summaryTodaysReturnPercent.toFixed(2)}%`);
    //     console.log(`----------------------------------------`);
    //     console.log(`✅ Total P&L %:`);
    //     console.log(`   Calculated via Formula:       ${calculatedTotalPnlPercent.toFixed(2)}%`);
    //     console.log(`   Displayed in Summary UI:      ${summaryTotalPnlPercent.toFixed(2)}%`);
    //     console.log(`========================================\n`);

    //     // Assertions (using a small tolerance for floating point math)
    //     expect(Math.abs(totalCalculatedPortfolio - summaryPortfolioValue)).toBeLessThan(2.0);
    //     expect(Math.abs(totalCalculatedInvested - summaryInvestedValue)).toBeLessThan(2.0);
    //     expect(Math.abs(totalCalculatedDaysPnl - summaryTodaysReturn)).toBeLessThan(2.0);
    //     expect(Math.abs(totalCalculatedTotalPnl - summaryTotalPnl)).toBeLessThan(2.0);
    //     expect(Math.abs(calculatedTodaysReturnPercent - summaryTodaysReturnPercent)).toBeLessThan(0.05);
    //     expect(Math.abs(calculatedTotalPnlPercent - summaryTotalPnlPercent)).toBeLessThan(0.05);
    // });

    // it('TC-08: Verify Heatmap View Sorting', async () => {
    //     console.log(`\n========================================`);
    //     console.log(`TC-08: Verify Heatmap View Sorting`);
    //     console.log(`========================================`);

    //     if (stockData.length === 0) {
    //         console.log("No stock data collected. Skipping Heatmap sorting verification.");
    //         return;
    //     }

    //     const openHeatMapBtn = await $(locators.get('openHeatMapView'));
    //     if (!(await openHeatMapBtn.isExisting())) {
    //         console.log("Heatmap button not found.");
    //         return;
    //     }
    //     await openHeatMapBtn.click();
    //     await driver.pause(2000);

    //     // Helper function to extract currently displayed stock names and their primary values
    //     const getDisplayedData = async () => {
    //         const tiles = await $$(locators.get('heatmapGridStockTiles'));
    //         let data = [];
    //         for (const tile of tiles) {
    //             const text = await tile.getAttribute('content-desc');
    //             if (text) {
    //                 // Example format: "GATECH-BE, pnl -₹2.80, overall loss 10.61%, today down 1.67%"
    //                 const parts = text.split(',');
    //                 const nameMatch = parts[0].trim();

    //                 let parsedVal = 0;
    //                 if (parts.length > 1) {
    //                     const valStr = parts[1]; // " pnl -₹2.80" or " cur ₹23.60"
    //                     parsedVal = parseFloat(valStr.replace(/[^0-9.-]/g, ''));
    //                     if (valStr.includes('-') && parsedVal > 0) parsedVal = -parsedVal;
    //                 }
    //                 data.push({ name: nameMatch, value: parsedVal });
    //             }
    //         }
    //         return data;
    //     };

    //     // Helper function to verify displayed values against our stored stockData
    //     const verifyValues = (displayedData, dataKey) => {
    //         let isAccurate = true;
    //         for (const item of displayedData) {
    //             const storedStock = stockData.find(s => s.name === item.name);
    //             if (!storedStock) {
    //                 console.error(`Stock ${item.name} found in heatmap but not in stockData!`);
    //                 isAccurate = false;
    //                 continue;
    //             }

    //             // Only check the whole number since decimals can vary during market hours
    //             if (Math.trunc(storedStock[dataKey]) !== Math.trunc(item.value)) {
    //                 console.error(`Mismatch for ${item.name}: Expected ${dataKey} to be ~${Math.trunc(storedStock[dataKey])}, but UI showed ~${Math.trunc(item.value)} (original: ${storedStock[dataKey]} vs ${item.value})`);
    //                 isAccurate = false;
    //             }
    //         }
    //         if (isAccurate) {
    //             console.log(`✅ Stocks correctly displayed correct ${dataKey} values.`);
    //         }
    //         return isAccurate;
    //     };

    //     // 1. P&L tab is selected by default.
    //     // It displays unpnl values.
    //     console.log("Verifying P&L tab values...");
    //     let pnlData = await getDisplayedData();
    //     let isPnlAccurate = verifyValues(pnlData, 'unpnl');
    //     expect(isPnlAccurate).toBe(true);

    //     // 2. Click Cur tab
    //     const curTab = await $(locators.get('holdingsCurTabDesc'));
    //     if (await curTab.isExisting()) {
    //         await curTab.click();
    //         await driver.pause(2000);

    //         console.log("Verifying Cur tab values...");
    //         let curData = await getDisplayedData();
    //         let isCurAccurate = verifyValues(curData, 'current');
    //         expect(isCurAccurate).toBe(true);
    //     }

    //     // 3. Click Inv tab
    //     const invTab = await $(locators.get('holdingsInvTabDesc'));
    //     if (await invTab.isExisting()) {
    //         await invTab.click();
    //         await driver.pause(2000);

    //         console.log("Verifying Inv tab values...");
    //         let invData = await getDisplayedData();
    //         let isInvAccurate = verifyValues(invData, 'invested');
    //         expect(isInvAccurate).toBe(true);
    //     }

    //     // Click Back Button (<-)
    //     await driver.back();
    //     await driver.pause(1000);
    // });

    // it('TC-09: Holdings Download and Filter/Sort Verification', async () => {
    //     console.log(`\n========================================`);
    //     console.log(`TC-09: Download, Filter, and Sort`);
    //     console.log(`========================================`);

    //     // 1. Download CSV
    //     const downloadBtn = await $(locators.get('holdingsDownloadCsvBtn'));
    //     if (await downloadBtn.isExisting()) {
    //         await downloadBtn.click();
    //         await driver.pause(2000);

    //         // Verify bottomsheet (e.g., .csv)
    //         const csvText = await $(locators.get('holdingsCsvText'));
    //         if (await csvText.isExisting()) {
    //             console.log(`✅ CSV sharing bottomsheet appeared.`);
    //         }

    //         // Click outside / back to close
    //         await driver.back();
    //         await driver.pause(1000);
    //     }

    //     // 2. Filter icon
    //     const filterIcon = await $(locators.get('holdingsFilterIconInstance'));
    //     if (!(await filterIcon.isExisting())) {
    //         console.log("Filter icon not found. Exiting TC-09.");
    //         return;
    //     }

    //     const filterLoc = await filterIcon.getLocation();
    //     const filterSize = await filterIcon.getSize();
    //     const filterX = Math.round(filterLoc.x + filterSize.width / 2);
    //     const filterY = Math.round(filterLoc.y + filterSize.height / 2);

    //     const clickFilterIcon = async () => {
    //         await driver.execute('mobile: clickGesture', { x: filterX, y: filterY });
    //     };

    //     // Helper to grab all current holding names on screen
    //     const getVisibleHoldingNames = async () => {
    //         const rows = await $$(locators.get('portfolioStockRows'));
    //         let names = [];
    //         for (const row of rows) {
    //             const desc = await row.getAttribute('content-desc');
    //             if (desc) {
    //                 const name = desc.split('\n').find(part => /[a-zA-Z]/.test(part) && !part.includes('Qty') && !part.includes('LTP') && !part.includes('Invested') && !part.includes('Avg'));
    //                 if (name) names.push(name.trim().split('-')[0]); // Use base name to avoid -BE mismatch
    //             }
    //         }
    //         return names;
    //     };

    //     // 3. Profit filter
    //     await clickFilterIcon();
    //     await driver.pause(1000);
    //     await $(locators.get('holdingsProfitFilter')).click();
    //     await $(locators.get('holdingsApplyFilterBtn')).click();
    //     await driver.pause(2000);

    //     let profitRows = await $$(locators.get('portfolioStockRows'));
    //     console.log(`✅ Profit filter applied. Showing ${profitRows.length} rows.`);
    //     if (profitRows.length == 0) {
    //         const noHoldingsFound = await $(locators.get('holdingsNoMatchingFoundDesc'));
    //         if (await noHoldingsFound.isExisting()) {
    //             console.log(`✅ No matching holdings for Profit`);
    //         }
    //     }
    //     // Assuming your rows show no minus in UnPnl or Day Pnl depending on how it's structured.
    //     // We will just verify it updated.

    //     // 4. Loss filter
    //     await clickFilterIcon();
    //     await driver.pause(1000);
    //     await $(locators.get('holdingsLossFilter')).click();
    //     await $(locators.get('holdingsApplyFilterBtn')).click();
    //     await driver.pause(2000);

    //     let lossRows = await $$(locators.get('portfolioStockRows'));
    //     console.log(`✅ Loss filter applied. Showing ${lossRows.length} rows.`);
    //     if (lossRows.length == 0) {
    //         const noHoldingsFound = await $(locators.get('holdingsNoMatchingFoundDesc'));
    //         if (await noHoldingsFound.isExisting()) {
    //             console.log(`✅ No matching holdings for Loss`);
    //         }
    //     }
    //     // 5. All filter
    //     await clickFilterIcon();
    //     await driver.pause(1000);
    //     await $(locators.get('holdingsAllFilter')).click();
    //     await $(locators.get('holdingsApplyFilterBtn')).click();
    //     await driver.pause(2000);
    //     let allRowsNames = await getVisibleHoldingNames();
    //     console.log(`✅ All filter applied. Showing ${allRowsNames.length} rows.`);

    //     // 6. Test all sort options
    //     const sortOptions = [
    //         'Alphabetical (Z-A)',
    //         'Profit & Loss (High to Low)',
    //         'Profit & Loss (Low to High)',
    //         'Day\'s P&L (High to Low)',
    //         'Invested Amount (High to Low)',
    //         'Current Value (High to Low)'
    //     ];

    //     for (const sortOption of sortOptions) {
    //         await clickFilterIcon();
    //         await driver.pause(1000);

    //         // Scroll to sort option if needed using UiScrollable
    //         let optionElement = await $(locators.get('holdingsDynamicFilterOpt', sortOption));
    //         if (!(await optionElement.isDisplayed())) {
    //             const { width, height } = await driver.getWindowRect();
    //             await driver.execute('mobile: swipeGesture', {
    //                 left: width * 0.5,
    //                 top: height * 0.5,
    //                 width: 10,
    //                 height: height * 0.4,
    //                 direction: 'up',
    //                 percent: 0.8
    //             });
    //             await driver.pause(1000);
    //         }
    //         await $(locators.get('holdingsDynamicFilterOpt', sortOption)).click();
    //         await $(locators.get('holdingsApplyFilterBtn')).click();
    //         await driver.pause(2000);

    //         let sortedNames = await getVisibleHoldingNames();
    //         console.log(`✅ Sorted by ${sortOption} -> Top row is now: ${sortedNames[0] || 'None'}`);

    //         // Determine the expected sorted order
    //         let expectedSortedData = [...stockData];
    //         if (sortOption === 'Alphabetical (Z-A)') {
    //             expectedSortedData.sort((a, b) => b.name.localeCompare(a.name));
    //         } else if (sortOption === 'Profit & Loss (High to Low)') {
    //             expectedSortedData.sort((a, b) => b.unpnl - a.unpnl);
    //         } else if (sortOption === 'Profit & Loss (Low to High)') {
    //             expectedSortedData.sort((a, b) => a.unpnl - b.unpnl);
    //         } else if (sortOption === "Day's P&L (High to Low)") {
    //             expectedSortedData.sort((a, b) => b.dayPnl - a.dayPnl);
    //         } else if (sortOption === 'Invested Amount (High to Low)') {
    //             expectedSortedData.sort((a, b) => b.invested - a.invested);
    //         } else if (sortOption === 'Current Value (High to Low)') {
    //             expectedSortedData.sort((a, b) => b.current - a.current);
    //         }

    //         const expectedNames = expectedSortedData.map(s => s.name.split('-')[0]);

    //         // Compare the visible names with the expected mathematically sorted names
    //         // (We only check up to the number of items visible on screen)
    //         for (let i = 0; i < sortedNames.length; i++) {
    //             if (sortedNames[i] !== expectedNames[i]) {
    //                 console.error(`Mismatch for '${sortOption}': Expected ${expectedNames[i]} at index ${i}, but got ${sortedNames[i]}`);
    //             }
    //             expect(sortedNames[i]).toEqual(expectedNames[i]);
    //         }
    //     }

    //     // 7. Reset
    //     await clickFilterIcon();
    //     await driver.pause(1000);
    //     await $(locators.get('holdingsResetFilterBtn')).click();
    //     await $(locators.get('holdingsApplyFilterBtn')).click();
    //     await driver.pause(2000);

    //     let resetNames = await getVisibleHoldingNames();
    //     console.log(`✅ Reset applied. Top row is now: ${resetNames[0] || 'None'}`);

    //     // Assert it matches the initial 'All' sort (A-Z)
    //     expect(resetNames[0]).toEqual(allRowsNames[0]);
    // });

    // it('TC-10: Verify CDSL EDIS Authorization Flow', async () => {
    //     console.log(`\n========================================`);
    //     console.log(`TC-10: CDSL EDIS Authorization Flow`);
    //     console.log(`========================================`);

    //     // 1. Verify button on holdings screen
    //     const verifyBtn = await $(locators.get('holdingsVerifyBtn'));
    //     if (!(await verifyBtn.isExisting())) {
    //         console.log("No CDSL Verify button found. Skipping TC-10.");
    //         return;
    //     }
    //     else {
    //         console.log("✅ Found CDSL EDIS Authorization badge")
    //     }

    //     // Gather expected scrip names from the current UI
    //     const rows = await $$(locators.get('portfolioStockRows'));
    //     let expectedScrips = [];
    //     for (const row of rows) {
    //         const desc = await row.getAttribute('content-desc');
    //         if (desc) {
    //             const name = desc.split('\n').find(part => /[a-zA-Z]/.test(part) && !part.includes('Qty') && !part.includes('LTP') && !part.includes('Invested') && !part.includes('Avg') && !part.includes('T1:') && !part.includes('T2:')).trim();
    //             if (name) expectedScrips.push(name);
    //         }
    //     }
    //     console.log(`Expected scrips in CDSL Webview:`, expectedScrips);

    //     // 2. Click Verify
    //     await verifyBtn.click();
    //     await driver.pause(2000);

    //     // 3. Bottomsheet Authorize button
    //     const authorizeBtn = await $(locators.get('holdingsAuthorizeBtn'));
    //     expect(await authorizeBtn.isExisting()).toBe(true);

    //     // 4. Click Authorize and go to webview
    //     await authorizeBtn.click();
    //     console.log("Clicked AUTHORIZE, waiting for CDSL web page to load...");
    //     await driver.pause(8000); // Give web page plenty of time to render

    //     // 5. Verify scrip names in the web view
    //     // UIAutomator can often read text from Chrome/Webviews natively
    //     for (const scrip of expectedScrips) {
    //         const scripEl = await $(locators.get('holdingsDynamicScripText', scrip));
    //         const exists = await scripEl.isExisting();
    //         console.log(`Checking for ${scrip} in CDSL page: ${exists}`);
    //         expect(exists).toBe(true);
    //     }

    //     // 6. Come back
    //     console.log("Navigating back to app...");
    //     await driver.back();
    //     await driver.pause(2000);

    //     // If it didn't close the browser entirely (sometimes needs two backs)
    //     if (!(await $(locators.get('holdingsCloseBtn')).isExisting())) {
    //         await driver.back();
    //         await driver.pause(2000);
    //     }

    //     // 7. Click CLOSE in bottomsheet
    //     const closeBtn = await $(locators.get('holdingsCloseBtn'));
    //     expect(await closeBtn.isExisting()).toBe(true);
    //     await closeBtn.click();
    //     await driver.pause(1000);

    //     console.log("✅ CDSL EDIS flow verified successfully.");
    // });

    it('TC-11: Holdings Stock Detail Actions', async () => {
        console.log(`\n========================================`);
        console.log(`TC-11: Holdings Stock Detail Actions`);
        console.log(`========================================`);

        // Get first row
        const rows = await $$(locators.get('portfolioStockRows'));
        if (rows.length === 0) {
            console.log("No holdings found. Skipping TC-11.");
            return;
        }

        const firstRow = rows[0];
        const rowDesc = await firstRow.getAttribute('content-desc');

        // Extract Name and LTP from rowDesc
        const name = rowDesc.split('\n').find(part => /[a-zA-Z]/.test(part) && !part.includes('Qty') && !part.includes('LTP') && !part.includes('Invested') && !part.includes('Avg') && !part.includes('T1:') && !part.includes('T2:')).trim();

        let ltpMatch = rowDesc.match(/LTP\s*₹?([\d,.]+)/) || rowDesc.match(/LTP\s*([\d,.]+)/);
        let ltp = 0;
        if (ltpMatch) {
            ltp = parseFloat(ltpMatch[1].replace(/,/g, ''));
        }

        console.log(`Targeting Stock: ${name}, LTP: ${ltp}`);

        // Helper to ensure bottom sheet is open
        const openBottomSheet = async () => {
            if (!(await $(locators.get('holdingsGttTab')).isExisting())) {
                await firstRow.click();
                await driver.pause(1500);
            }
        };

        // 1. Market Depth
        await openBottomSheet();
        await $(locators.get('holdingsMarketDepthTab')).click();
        await driver.pause(2000);

        // Wait, text might be available via description or text properties
        const mdText = await $(locators.get('holdingsMarketDepthDesc'));
        const ppText = await $(locators.get('holdingsPricePerformanceDesc'));

        expect(await mdText.isExisting()).toBe(true);
        expect(await ppText.isExisting()).toBe(true);
        console.log("✅ Market depth & Price performance texts verified.");

        await driver.back();
        await driver.pause(1500);

        // 2. GTT
        await openBottomSheet();
        await $(locators.get('holdingsGttTab')).click();
        await driver.pause(2000);

        // Fill GTT Value
        const valueField = await $(locators.get('holdingsZeroValueField'));
        if (await valueField.isExisting()) {
            await valueField.click();
            await driver.pause(1000); // Wait for keyboard to open

            // Send backspace to remove the default '0'
            await driver.keys(['Backspace', 'Del']);
            await driver.pause(500);

            const gttVal = (ltp + 10).toString();
            console.log("LTP", ltp);

            // Enter the text via keyboard events
            await driver.keys(gttVal.split(''));
            await driver.pause(1000);


        }
        // Dynamically extract segment and product type from GTT window
        const possibleSegments = ["BSE", "NSE"];
        let segment = "NSE"; // Default
        for (const seg of possibleSegments) {
            if (await $(locators.get('holdingsDynamicSegmentText', seg)).isExisting() || await $(locators.get('holdingsDynamicSegmentDesc', seg)).isExisting()) {
                segment = seg;
                break;
            }
        }

        const possibleProducts = ["CNC", "NRML", "MIS", "MTF", "Delivery", "Intraday"];
        let productType = "CNC"; // Default
        for (const pt of possibleProducts) {
            if (await $(locators.get('holdingsDynamicSegmentText', pt)).isExisting() || await $(locators.get('holdingsDynamicSegmentDesc', pt)).isExisting()) {
                productType = pt;
                break;
            }
        }
        console.log(`Extracted from GTT Window -> Segment: ${segment}, Product Type: ${productType}`);

        // Click CREATE GTT
        await $(locators.get('holdingsCreateGttBtn')).click();
        await driver.pause(2000);

        // Image 4 verification (GTT Orders list)
        const gttRow = await $(locators.get('holdingsDynamicGttRowDesc', name));
        expect(await gttRow.isExisting()).toBe(true);
        const gttDesc = await gttRow.getAttribute('content-desc');
        console.log(`GTT Row Desc: ${gttDesc}`);

        expect(gttDesc.includes(productType)).toBe(true);
        expect(gttDesc.includes(segment)).toBe(true);
        expect(gttDesc.includes(ltp.toString())).toBe(true);

        console.log("✅ GTT Order verified in orders list.");

        await HoldingsPage.openHoldings();

        // Extract header count from Holdings tab
        const holdingsTab = $(locators.get('holdingsTab'));
        await holdingsTab.waitForDisplayed({ timeout: 5000 });
        const desc = await holdingsTab.getAttribute('content-desc');
        console.log(`Holdings Tab desc: ${desc}`);


        // 3. Overview
        await openBottomSheet();
        await $(locators.get('holdingsOverviewTab1')).click();
        await driver.pause(2000);

        let overviewHeader = await $(locators.get('holdingsOverviewTab2'));
        expect(await overviewHeader.isExisting()).toBe(true);
        console.log("✅ Overview header verified.");

        await driver.back();
        await driver.pause(1500);

        // 4. Technicals
        await openBottomSheet();
        await $(locators.get('holdingsTechnicalsTab1')).click();
        await driver.pause(2000);

        let technicalsHeader = await $(locators.get('holdingsTechnicalsTab2'));
        expect(await technicalsHeader.isExisting()).toBe(true);
        console.log("✅ Technicals header verified.");

        await driver.back();
        await driver.pause(1500);

        // 5. Option Chain (Optional)
        await openBottomSheet();
        const optionChainBtn = await $(locators.get('holdingsOptionChainRegex1'));
        if (await optionChainBtn.isExisting()) {
            await optionChainBtn.click();
            await driver.pause(4000); // Option chain might take a bit to load

            const optionChainTitle = await $(locators.get('holdingsOptionChainRegex2'));
            const optionChainScrip = await $(locators.get('holdingsDynamicGttRowDesc', name));

            expect(await optionChainTitle.isExisting()).toBe(true);
            expect(await optionChainScrip.isExisting()).toBe(true);
            console.log("✅ Option chain title and scrip name verified.");

            await driver.back();
            await driver.pause(1500);
        } else {
            console.log("ℹ️ Option Chain not available for this stock, skipping.");
        }

        // Close the bottom sheet to return to the Holdings list for TC-12
        await driver.back();
        await driver.pause(1500);
    });

    it('TC-12: Holdings Stock Exit and Add Actions', async () => {
        console.log(`\n========================================`);
        console.log(`TC-12: Holdings Stock Exit and Add Actions`);
        console.log(`========================================`);

        // Get first row and its scrip name and LTP
        const rawRows = await $$(locators.get('portfolioStockRows'));
        let rows = [];
        for (const r of rawRows) {
            const desc = await r.getAttribute('content-desc');
            // A valid stock row has multiple lines and contains 'Invested' or 'LTP'
            if (desc && desc.includes('\n')) {
                rows.push({ element: r, desc: desc });
            }
        }

     
        const firstRow = rows[0].element;
        const rowDesc = rows[0].desc;

        let nameMatch = rowDesc.split('\n').find(part => /[a-zA-Z]/.test(part) && !part.includes('Qty') && !part.includes('LTP') && !part.includes('Invested') && !part.includes('Avg') && !part.includes('T1:') && !part.includes('T2:'));
        const name = nameMatch ? nameMatch.trim() : "";

        let ltpMatch = rowDesc.match(/LTP\s*₹?([\d,.]+)/) || rowDesc.match(/LTP\s*([\d,.]+)/);
        let ltp = 0;
        if (ltpMatch) ltp = parseFloat(ltpMatch[1].replace(/,/g, ''));

        // Gather expectedScrips for EDIS authorization if needed
        let expectedScrips = [];
        for (const r of rows) {
            const sNameMatch = r.desc.split('\n').find(part => /[a-zA-Z]/.test(part) && !part.includes('Qty') && !part.includes('LTP') && !part.includes('Invested') && !part.includes('Avg') && !part.includes('T1:') && !part.includes('T2:'));
            if (sNameMatch) {
                expectedScrips.push(sNameMatch.trim());
            }
        }

        const openBottomSheet = async () => {
            if (!(await $(locators.get('holdingsExitBtn1')).isExisting()) && !(await $(locators.get('holdingsExitBtn2')).isExisting())) {
                await firstRow.click();
                await driver.pause(1500);
            }
        };

        // 1. EXIT
        await openBottomSheet();
        let exitBtn = await $(locators.get('holdingsExitBtn1'));
        if (!(await exitBtn.isExisting())) exitBtn = await $(locators.get('holdingsExitBtn2'));
        await exitBtn.click();
        await driver.pause(2000);

        // Verify scrip name and LTP in order window
        const exitScripText = await $(locators.get('holdingsDynamicScripText', name));
        const exitScripDesc = await $(locators.get('holdingsDynamicGttRowDesc', name));
        expect(await exitScripText.isExisting() || await exitScripDesc.isExisting()).toBe(true);

        const exitLtpText = await $(locators.get('holdingsDynamicScripText', ltp));
        const exitLtpDesc = await $(locators.get('holdingsDynamicGttRowDesc', ltp));
        expect(await exitLtpText.isExisting() || await exitLtpDesc.isExisting()).toBe(true);

        const isVerifyEdis = await $(locators.get('holdingsVerifyEdisDesc')).isExisting() || await $(locators.get('holdingsVerifyEdisText')).isExisting();
        const isSellBtn = await $(locators.get('holdingsSellDesc')).isExisting() || await $(locators.get('holdingsSellText')).isExisting() || await $(locators.get('holdingsSellDescContains')).isExisting() || await $(locators.get('holdingsSellTextContains')).isExisting();

        expect(isVerifyEdis || isSellBtn).toBe(true);
        console.log(`Order window shown. VERIFY EDIS: ${isVerifyEdis}, SELL: ${isSellBtn}`);

        if (isVerifyEdis) {
            let veBtn = await $(locators.get('holdingsVerifyEdisDesc'));
            if (!(await veBtn.isExisting())) veBtn = await $(locators.get('holdingsVerifyEdisText'));

            await veBtn.click();
            await driver.pause(2000);

            const authorizeBtn = await $(locators.get('holdingsAuthorizeBtn'));
            expect(await authorizeBtn.isExisting()).toBe(true);
            await authorizeBtn.click();
            console.log("Clicked AUTHORIZE, waiting for CDSL web page to load...");
            await driver.pause(8000);

            for (const scrip of expectedScrips) {
                const scripEl = await $(locators.get('holdingsDynamicScripText', scrip));
                const exists = await scripEl.isExisting();
                console.log(`Checking for ${scrip} in CDSL page: ${exists}`);
                expect(exists).toBe(true);
            }

            console.log("Navigating back to app...");
            await driver.back();
            await driver.pause(2000);

            if (!(await $(locators.get('holdingsCloseBtn')).isExisting())) {
                await driver.back();
                await driver.pause(2000);
            }

            const closeBtn = await $(locators.get('holdingsCloseBtn'));
            expect(await closeBtn.isExisting()).toBe(true);
            await closeBtn.click();
            await driver.pause(1000);
        }

        // Go back to holdings
        while (!(await $(locators.get('holdingsPortfolioValueDesc')).isExisting())) {
            await driver.back();
            await driver.pause(1500);
        }

        // 2. ADD
        await openBottomSheet();
        let addBtn = await $(locators.get('holdingsAddBtn1'));
        if (!(await addBtn.isExisting())) addBtn = await $(locators.get('holdingsAddBtn2'));
        await addBtn.click();
        await driver.pause(2000);

        const addScripText = await $(locators.get('holdingsDynamicScripText', name));
        const addScripDesc = await $(locators.get('holdingsDynamicGttRowDesc', name));
        expect(await addScripText.isExisting() || await addScripDesc.isExisting()).toBe(true);

        const addLtpText = await $(locators.get('holdingsDynamicScripText', ltp));
        const addLtpDesc = await $(locators.get('holdingsDynamicGttRowDesc', ltp));
        expect(await addLtpText.isExisting() || await addLtpDesc.isExisting()).toBe(true);

        console.log("✅ ADD order window verified.");

        await driver.back();
        await driver.pause(1500);

        // Close bottomsheet by clicking outside (driver.back() will close it)
        if (await $(locators.get('holdingsAddBtn1')).isExisting() || await $(locators.get('holdingsAddBtn2')).isExisting()) {
            await driver.back();
            await driver.pause(1000);
        }
    })
});
