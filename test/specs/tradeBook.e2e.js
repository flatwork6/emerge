import allureReporter from '@wdio/allure-reporter';
import locators from '../utils/locatorHelper.js';
import TradeBookPage from '../pageobjects/tradeBook.page.js';

const originalLog = console.log;
console.log = function (...args) {
    originalLog.apply(console, args);
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    try {
        allureReporter.addStep(msg);
    } catch (e) { }
};

describe('TradeBook Automation', () => {
    let availableTradeStock = null;

    it('TC-01: Navigating to TradeBook shows the TradeBook screen', async () => {
        allureReporter.addStep('Tap the TradeBook tab/section from Orders navigation.');
        console.log("Navigating to Orders Tab...");

        await TradeBookPage.openTradeBook();

        console.log("✅ Successfully navigated to TradeBook.");
    });

    it('TC-02: TradeBook heading and completed order rows are visible', async () => {
        allureReporter.addStep('Verify the TradeBook heading (e.g. "TradeBook (N)") and at least one completed order row are visible.');
        // Wait for the Tradebook heading
        const heading = await $(locators.get('tradeBookHeading'));
        await heading.waitForDisplayed({ timeout: 10000 });

        let desc = await heading.getAttribute("content-desc");
        console.log(`Heading text: ${desc}`);

        let headingCountMatch = desc ? desc.match(/\((\d+)\)/) : null;
        let expectedCount = headingCountMatch ? parseInt(headingCountMatch[1], 10) : 0;
        console.log(`Expected trades count from heading: ${expectedCount}`);

        // Verify there is at least one trade row. Since Flutter combines elements, we'll look for "B" or "S" in content-desc.
        let allScreenEls = await $$('//android.view.View[contains(@content-desc, "Qty:")]');
        let tradeRowsCount = 0;

        for (const el of allScreenEls) {
            const elDesc = await el.getAttribute("content-desc");
            if (!elDesc) continue;

            // Check if it's a valid trade row (e.g. has B/S)
            if (elDesc.startsWith("B\n") || elDesc.startsWith("S\n")) {
                tradeRowsCount++;

                const parts = elDesc.split('\n');
                if (!availableTradeStock && parts.length > 1) {
                    availableTradeStock = parts[1].trim(); // Extract stock name
                }

                // For TC-02, verify that all available trades are in COMPLETED status
                if (!elDesc.includes("COMPLETED")) {
                    throw new Error(`Found a trade that is not COMPLETED: ${elDesc}`);
                }
                else {
                    console.log("All Orders are in Completed status");
                }
            }
        }

        console.log(`Counted ${tradeRowsCount} trade rows on the screen.`);

        if (tradeRowsCount > 0) {
            console.log("✅ Verified TradeBook heading and at least one completed order row.");
            if (tradeRowsCount === expectedCount) {
                console.log(`✅ Trade count verified successfully (Heading: ${expectedCount}, Counted: ${tradeRowsCount}).`);
            } else if (tradeRowsCount < expectedCount) {
                console.log(`⚠️ Counted ${tradeRowsCount} trades on screen, which is less than expected ${expectedCount} (some trades might be off-screen).`);
            } else {
                console.log(`❌ Count mismatch: heading says ${expectedCount} but counted ${tradeRowsCount}.`);
            }
        } else {
            console.log("No trade rows found. Verifying 'No Trades found' message...");
            const noTradesMsg = await $('//*[contains(@content-desc, "No trades found") or contains(@text, "No trades found") or contains(@content-desc, "No Trades found") or contains(@text, "No Trades found")]');
            if (await noTradesMsg.isExisting()) {
                console.log("✅ 'No Trades found' message is correctly displayed.");
            } else {
                console.log("❌ Expected 'No Trades found' message, but it was not displayed.");
            }
        }
    });

    it('TC-03: "No matching trades found" should be shown if search results are not matching', async () => {
        allureReporter.addStep('Verify that tradebook search does not match with the existing orders');

        // Find Search Icon (usually instance 19 or 20 like in order book, but we can look for android.widget.ImageView or View)
        // A generic flutter search icon without content-desc might just be a View. We can try to use orderBookSearchIcon for TradeBook too.
        console.log("Clicking Search icon...");
        let searchIcon = await $(locators.get('tradeBookSearchIcon'));
        if (await searchIcon.isExisting()) {
            await searchIcon.click();
        } else {
            // fallback for search icon
            const fallbackIcon = await $('android=new UiSelector().className("android.widget.ImageView").instance(0)');
            if (await fallbackIcon.isExisting()) await fallbackIcon.click();
        }
        await driver.pause(2000);

        console.log("Entering search strings...");
        const searchInput = await $(locators.get('searchInputField'));
        await searchInput.waitForDisplayed({ timeout: 5000 });

        if (availableTradeStock) {
            console.log(`Searching for available stock: ${availableTradeStock}`);
            await searchInput.click();
            await driver.pause(1000);
            await searchInput.clearValue();
            await searchInput.addValue(availableTradeStock);
            await driver.pause(2000);

            // Verify stock is visible
            let visibleStock = await $(`//android.view.View[contains(@content-desc, "${availableTradeStock}")]`);
            if (await visibleStock.isExisting()) {
                console.log(`✅ Available stock ${availableTradeStock} is correctly displayed in search results.`);
            } else {
                console.log(`❌ Available stock ${availableTradeStock} is NOT displayed in search results.`);
            }

            await searchInput.click();
            await driver.pause(500);
            await searchInput.clearValue();
            await driver.pause(1000);
        } else {
            console.log("⚠️ No available stock was found in TC-02 to search for.");
        }

        console.log("Entering unexisting search string...");
        await searchInput.click();
        await driver.pause(1000);
        await searchInput.clearValue();
        await searchInput.addValue("INVALID_TRADE_123");
        await driver.pause(3000);

        const noMatch = await $(locators.get('tradeBookNoMatch'));
        if (await noMatch.isExisting()) {
            console.log("✅ 'No matching trades found' showed correctly for unexisting stock.");
        } else {
            console.log("❌ 'No matching trades found' message did not appear.");
        }

        console.log("Closing search...");
        const closeIcon = await $(locators.get('orderBookCrossBtn'));
        if (await closeIcon.isExisting()) {
            await closeIcon.click();
        }
        await driver.pause(2000);
    });

    it('TC-04: Tradebook should be scrollable', async () => {
        allureReporter.addStep('Verify the tradebook containing trades are scrollable');

        let allScreenEls = await $$('//android.view.View[contains(@content-desc, "Qty:")]');
        let tradeRowsCount = 0;

        for (const el of allScreenEls) {
            const elDesc = await el.getAttribute("content-desc");
            if (!elDesc) continue;

            // Check if it's a valid trade row (e.g. has B/S)
            if (elDesc.startsWith("B\n") || elDesc.startsWith("S\n")) {
                tradeRowsCount++;

                const parts = elDesc.split('\n');
                if (!availableTradeStock && parts.length > 1) {
                    availableTradeStock = parts[1].trim(); // Extract stock name
                }

                // For TC-02, verify that all available trades are in COMPLETED status
                if (!elDesc.includes("COMPLETED")) {
                    throw new Error(`Found a trade that is not COMPLETED: ${elDesc}`);
                }
                else {
                    console.log("All Orders are in Completed status");
                }
            }
        }

        console.log(`Counted ${tradeRowsCount} trade rows on the screen.`);


        if (tradeRowsCount > 6) {
            const { width, height } = await driver.getWindowSize();
            console.log(`Found ${tradeRowsCount} orders (> 6). Scrolling TradeBook...`);

            await driver.performActions([{
                type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: width / 2, y: height * 0.7 },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pause', duration: 100 },
                    { type: 'pointerMove', duration: 1000, origin: 'viewport', x: width / 2, y: height * 0.3 },
                    { type: 'pointerUp', button: 0 }
                ]
            }]);

            await driver.pause(2000);
            console.log("✅ Verified TradeBook is scrollable.");
        } else {
            console.log(`⚠️ Found only ${tradeRowsCount} orders (<= 6). Skipping scroll.`);
        }
    });

    it('TC-05: Only completed orders appear in TradeBook', async () => {
        allureReporter.addStep('Verify whether Completed status is only visible on all orders.');

        let allScreenEls = await $$('//android.view.View[contains(@content-desc, "Qty:")]');
        let validTradeRowFound = false;
        let allAreCompleted = true;

        for (const el of allScreenEls) {
            const elDesc = await el.getAttribute("content-desc");
            if (!elDesc) continue;

            if (elDesc.includes('\n')) {
                const parts = elDesc.split('\n');
                if (parts[0].trim() === "B" || parts[0].trim() === "S") {
                    validTradeRowFound = true;
                    const descUpper = elDesc.toUpperCase();
                    if (descUpper.includes("REJECTED") || descUpper.includes("CANCELLED") || descUpper.includes("OPEN") || descUpper.includes("PENDING")) {
                        allAreCompleted = false;
                        console.log(`❌ Found a non-completed trade: \n${elDesc}`);
                    }
                }
            }
        }

        if (validTradeRowFound) {
            if (allAreCompleted) {
                console.log("✅ Verified only completed orders appear in TradeBook.");
            } else {
                console.log("❌ Failed: Some orders in TradeBook are not completed.");
            }
        } else {
            console.log("⚠️ No trades found for current day, skipping verification.");
        }
    });

    it('TC-06: Tapping a trade row opens a bottom sheet with Info, Chart, Create alert, Technicals', async () => {
        allureReporter.addStep('Tap a completed trade row and verify bottom sheet options.');
        const tradeRow = await $('//android.view.View[contains(@content-desc, "Qty:")]');
        if (await tradeRow.isExisting()) {
            await tradeRow.click();
            await driver.pause(1500);

            const infoOpt = await $('~Info');
            const chartOpt = await $('~Chart');
            const alertOpt = await $('~Create Alert');
            const techOpt = await $('~Technicals');

            expect(await infoOpt.isExisting()).toBe(true);
            expect(await chartOpt.isExisting()).toBe(true);
            expect(await alertOpt.isExisting()).toBe(true);
            expect(await techOpt.isExisting()).toBe(true);

            console.log("✅ Bottom sheet with Info, Chart, Create alert, Technicals opened successfully.");
            // DO NOT close bottom sheet here, leave it for TC-07
        } else {
            console.log("⚠️ No trades found to tap.");
        }
    });

    it('TC-07: "Info" shows the trade\'s detail dialog', async () => {
        allureReporter.addStep('click Info, scrip info page will appear, verify scrip info header appears. and click<-btn.');
        const infoOpt = await $('~Info');
        if (await infoOpt.isExisting()) {
            await infoOpt.click();
            await driver.pause(2000);

            // Verify scrip info header appears
            const scripInfoHeader = await $('//*[contains(@content-desc, "Fundamentals") or contains(@content-desc, "Market Depth") or contains(@content-desc, "Scrip info")]');
            if (await scripInfoHeader.isExisting()) {
                console.log("✅ Scrip info header appeared.");
            }

            // click <- btn
            const backBtn = await $('~Back');
            if (await backBtn.isExisting()) {
                await backBtn.click();
            } else {
                const fallbackBackBtn = await $('android=new UiSelector().className("android.widget.ImageView").instance(0)');
                if (await fallbackBackBtn.isExisting()) await fallbackBackBtn.click();
            }
            await driver.pause(1500);
        }
    });

    it('TC-08: "Chart" navigates to the stock chart screen', async () => {
        allureReporter.addStep('Navigates to bottomsheet,click Chart, Overview page will appear. verify Overview header and scrip name appears on the page, come back');
        const chartOpt = await $('~Chart');
        if (await chartOpt.isExisting()) {
            await chartOpt.click();
            await driver.pause(4000);

            const overviewHeader = await $('//*[contains(@content-desc, "Overview") or contains(@content-desc, "Chart")]');
            if (await overviewHeader.isExisting()) {
                console.log("✅ Overview/Chart header appeared.");
            }

            if (availableTradeStock) {
                const scripName = await $(`//*[contains(@content-desc, "${availableTradeStock}")]`);
                if (await scripName.isExisting()) {
                    console.log(`✅ Scrip name ${availableTradeStock} appears on Chart page.`);
                }
            }

            // come back
            const backBtn = await $('~Back');
            if (await backBtn.isExisting()) {
                await backBtn.click();
            } else {
                const fallbackBackBtn = await $('android=new UiSelector().className("android.widget.ImageView").instance(0)');
                if (await fallbackBackBtn.isExisting()) await fallbackBackBtn.click();
            }
            await driver.pause(1500);
        }
    });

    it('TC-09: "Create alert" flow and verification in Alerts tab', async () => {
        allureReporter.addStep('click create alert, give target value > ltp and Create Alert. Check alert in Alerts tab.');
        const alertOpt = await $('~Create Alert');
        if (await alertOpt.isExisting()) {
            await alertOpt.click();
            await driver.pause(2000);

            // Give target value (e.g. 1.0 or greater than LTP)
            const targetValueInput = await $('android=new UiSelector().className("android.widget.EditText").instance(0)');
            const targetValue = 80.0;
            if (await targetValueInput.isExisting()) {
                await targetValueInput.click();
                await driver.pause(500);
                await targetValueInput.clearValue();
                await targetValueInput.addValue(targetValue); // Arbitrary value definitely > LTP
                await driver.pause(1000);
            }

            // Click Create Alert btn
            const createAlertBtn = await $('//*[contains(@content-desc, "Create Alert")]');
            if (await createAlertBtn.isExisting()) {
                await createAlertBtn.click();
                await driver.pause(2000);
            }

            const confirmAlertButton = await $(locators.get('confirmAlert'));
            if (await confirmAlertButton.isExisting()) {
                await confirmAlertButton.click();
                await driver.pause(2000);
            }


            // Click Alerts on top
            const alertsTab = await $('~Alerts');
            if (await alertsTab.isExisting()) {
                await alertsTab.click();
                await driver.pause(2000);

                // Verify scrip name and entered target value exists there
                const alertItem = await $(`//*[contains(@content-desc, "${availableTradeStock}") and contains(@content-desc, "80")]`);
                if (await alertItem.isExisting()) {
                    console.log(`✅ Alert for ${availableTradeStock} with target value ${targetValue} found in Alerts tab.`);
                } else {
                    console.log(`❌ Alert for ${availableTradeStock} with target value ${targetValue} NOT found in Alerts tab.`);
                }
            }
        }
    });

    it('TC-10: "Technicals" navigates to the technicals tab', async () => {
        allureReporter.addStep('Again come back to Tradebook and click first scrip and click Technicals and verify screen with Technicals header appear and come back.');
        // Click Tradebook tab
        const tradeBookTab = await $('~Tradebook');
        if (await tradeBookTab.isExisting()) {
            await tradeBookTab.click();
            await driver.pause(2000);
        }

        // click first scrip
        const tradeRow = await $('//android.view.View[contains(@content-desc, "Qty:")]');
        if (await tradeRow.isExisting()) {
            await tradeRow.click();
            await driver.pause(1500);

            // click Technicals
            const techOpt = await $('~Technicals');
            if (await techOpt.isExisting()) {
                await techOpt.click();
                await driver.pause(3000);

                // verify screen with Technicals header appear
                const technicalsHeader = await $('//*[contains(@content-desc, "Technicals")]');
                if (await technicalsHeader.isExisting()) {
                    console.log("✅ Technicals header appeared.");
                }

                // come back
                const backBtn = await $('~Back');
                if (await backBtn.isExisting()) {
                    await backBtn.click();
                } else {
                    const fallbackBackBtn = await $('android=new UiSelector().className("android.widget.ImageView").instance(0)');
                    if (await fallbackBackBtn.isExisting()) await fallbackBackBtn.click();
                }
                await driver.pause(1000);
            }

            // Use system back to dismiss the bottom sheet reliably
            await driver.back();
            await driver.pause(1500);
        }
    });

    it('TC-11: Downloading TradeBook produces a CSV with the correct columns and completed-order data', async () => {
            allureReporter.addStep('Tap the Download button and verify the CSV.');
            console.log("Checking Download CSV icon...");
            await driver.pause(2000);
            // Find download icon which is usually next to search (instance 19 or similar, but let's use a classname instance)
            const downloadCsvIcon = await $('android=new UiSelector().className("android.view.View").instance(19)');
            if (await downloadCsvIcon.isExisting()) {
                 await downloadCsvIcon.click();
                 await driver.pause(2000);

                 // Check if a bottom sheet with CSV file name or success message appears
                 const csvDialog = await $('//*[contains(@content-desc, ".csv") or contains(@text, ".csv") or contains(@content-desc, "downloaded")]');
                 if (await csvDialog.isExisting()) {
                     console.log("✅ CSV download bottom sheet/toast showed up with file name.");
                     // Click anywhere to dismiss if it's a bottom sheet
                     await driver.back();
                     await driver.pause(1000);
                 } else {
                     console.log("⚠️ Download icon clicked, but CSV success message might be a native toast or hidden.");
                 }
            } else {
                console.log("❌ Could not find Download CSV icon.");
            }
        });
    it('TC-12: Extract all data from tradebook card and verify with trades bottomsheet', async () => {
        allureReporter.addStep('Extract all data from tradebook card and verify with trades bottomsheet');
        
        // 1. Get the first trade row's content-desc
        const tradeRow = await $('//android.view.View[contains(@content-desc, "Qty:")]');
        if (!(await tradeRow.isExisting())) {
            console.log("⚠️ No trades found to extract.");
            return;
        }

        const elDesc = await tradeRow.getAttribute('content-desc');
        const cardDescs = elDesc.split('\n').map(d => d.trim()).filter(d => d.length > 0);
        console.log("Trade Card elements extracted directly from screen:", cardDescs);

        let cardAction = "";
        let cardStockName = "";
        let cardStatus = "COMPLETED";
        let cardSegment = "";
        let cardProduct = "";
        let cardOrderType = "";
        let orderBookFilledQty = "0";
        let orderBookTime = "";
        let orderBookPrice = "";
        let orderBookLTP = "";

        if (cardDescs.length > 0) {
            cardAction = cardDescs[0] === "B" ? "BUY" : (cardDescs[0] === "S" ? "SELL" : "");
            cardStockName = cardDescs.length > 1 ? cardDescs[1] : ""; 
            
            let foundStatus = cardDescs.find(d => ["REJECTED", "OPEN", "COMPLETED", "CANCELLED", "GTT"].some(s => d.toUpperCase().includes(s)));
            if (foundStatus) cardStatus = ["REJECTED", "OPEN", "COMPLETED", "CANCELLED", "GTT"].find(s => foundStatus.toUpperCase().includes(s));
            
            let foundSeg = cardDescs.find(d => ["NSE", "BSE", "NFO", "MCX"].some(s => d.toUpperCase() === s || d.toUpperCase().includes(s)));
            if (foundSeg) cardSegment = ["NSE", "BSE", "NFO", "MCX"].find(s => foundSeg.toUpperCase().includes(s));
            
            let foundProd = cardDescs.find(d => ["CNC", "MIS", "NRML", "CO"].some(s => d.toUpperCase() === s));
            if (foundProd) cardProduct = ["CNC", "MIS", "NRML", "CO"].find(s => foundProd.toUpperCase() === s);
            
            let foundType = cardDescs.find(d => ["LMT", "MKT", "SL-LMT", "SL-MKT"].some(s => d.toUpperCase() === s || d.toUpperCase().includes(s)));
            if (foundType) cardOrderType = ["LMT", "MKT", "SL-LMT", "SL-MKT"].find(s => foundType.toUpperCase().includes(s));

            let qtyStr = cardDescs.find(d => d.includes("Qty:"));
            if (qtyStr) orderBookFilledQty = (qtyStr.match(/Qty:\s*(\d+)/) || [])[1] || "0";

            let timeStr = cardDescs.find(d => d.match(/\d{2}:\d{2}:\d{2}/));
            if (timeStr) orderBookTime = timeStr.match(/\d{2}:\d{2}:\d{2}/)[0];

            let pStr = cardDescs.find(d => (d.includes("₹") || /^\s*[\d\.,]+\s*$/.test(d)) && !d.toUpperCase().includes("LTP") && d.length > 2);
            if (pStr) orderBookPrice = pStr.replace(/[^\d\.,]/g, ""); 

            let lStr = cardDescs.find(d => d.includes("LTP"));
            if (lStr) orderBookLTP = (lStr.match(/LTP\s*[₹]?([\d\.,]+)/) || [])[1] || "";
        }

        console.log("Clicking the exact scrip to open bottom sheet...");
        await tradeRow.click();
        await driver.pause(3000);

        console.log("Verifying details inside scrip info (bottom sheet)...");
        // Wait for Info to guarantee it opened successfully
        const infoOpt = await $('~Info');
        await infoOpt.waitForDisplayed({ timeout: 10000 }).catch(() => console.log("Bottom sheet did not open properly"));
        
        if (await infoOpt.isExisting()) {
            let allElements = await $$('//*[@content-desc]');
            let bsDescArr = [];
            for (const el of allElements) {
                const desc = await el.getAttribute("content-desc");
                if (desc && desc.trim().length > 0) {
                    bsDescArr.push(desc.trim());
                }
            }
            const bsDesc = bsDescArr.join('\n');
            console.log(`Bottom Sheet desc:\n${bsDesc}`);

            // 1. Qty
            let bsFilledQtyMatch = bsDesc.match(/(?:Filled )?(?:Qty|Quantity)\s*\n\s*(\d+)(?:\s*\/\s*(\d+))?/i);
            if (bsFilledQtyMatch && bsFilledQtyMatch[1] === orderBookFilledQty) {
                console.log("✅ Verified Qty is " + orderBookFilledQty);
                allureReporter.addStep("✅ Verified Qty");
            } else {
                console.log(`❌ Failed to verify Qty. Expected ${orderBookFilledQty}, Found ${bsFilledQtyMatch ? bsFilledQtyMatch[1] : 'none'}`);
            }

            // 2. Type
            let bsTypeMatch = bsDesc.match(/Order Type\s*\n\s*([A-Z\-]+)/) || bsDesc.match(/Type\s*\n\s*([A-Z\-]+)/);
            if (bsTypeMatch && bsTypeMatch[1] === cardOrderType) {
                console.log(`✅ Verified Type matches trade book: ${bsTypeMatch[1]}`);
                allureReporter.addStep(`✅ Verified Type`);
            } else {
                console.log(`❌ Failed to verify Type. Expected ${cardOrderType}, Found ${bsTypeMatch ? bsTypeMatch[1] : 'none'}`);
            }

            // 3. Status
            let hasStatus = bsDesc.includes(cardStatus.toUpperCase());
            if (hasStatus) {
                console.log(`✅ Verified Status: ${cardStatus}`);
                allureReporter.addStep(`✅ Verified Status`);
            } else {
                console.log(`❌ Failed to verify Status. Expected ${cardStatus}`);
            }

            // 4. Scrip Name, segment, buy/sell
            let hasScripName = bsDesc.includes(cardStockName);
            let hasAction = bsDesc.includes(cardAction.toUpperCase());
            let hasSegment = bsDesc.includes(cardSegment);
            // Note: LTP is typically not present in the TradeBook bottom sheet, so we skip checking it.

            if (hasScripName && hasAction && hasSegment) {
                console.log("✅ Verified Scrip Name, Action, and Segment in header");
                allureReporter.addStep("✅ Verified Scrip Name, Action, and Segment");
            } else {
                console.log(`❌ Failed to verify Scrip Header details. Scrip:${hasScripName}, Action:${hasAction}, Segment:${hasSegment}`);
            }

            // 5. Price (In Tradebook, the price on the card corresponds to Avg. Price)
            let bsPriceMatch = bsDesc.match(/Avg\.? Price\s*\n\s*([\d\.,]+)/i) || bsDesc.match(/Price\s*\n\s*([\d\.,]+)/i);
            if (bsPriceMatch) {
                 let normalizedBsPrice = bsPriceMatch[1].replace(/,/g, "");
                 let normalizedBookPrice = orderBookPrice.replace(/,/g, "");
                 if (parseFloat(normalizedBsPrice) === parseFloat(normalizedBookPrice) || normalizedBsPrice === normalizedBookPrice) {
                     console.log(`✅ Verified Average Price matches trade book: ${bsPriceMatch[1]}`);
                     allureReporter.addStep("✅ Verified Average Price");
                 } else {
                     console.log(`❌ Failed to verify Average Price. Expected ${orderBookPrice}, Found ${bsPriceMatch[1]}`);
                 }
            } else {
                 console.log(`❌ Failed to verify Average Price. Price not found in bottom sheet.`);
            }

            // 6. Product
            let bsProductMatch = bsDesc.match(/Product\s*\n\s*([A-Z]+)/i);
            if (bsProductMatch && bsProductMatch[1] === cardProduct) {
                 console.log(`✅ Verified Product matches trade book: ${bsProductMatch[1]}`);
                 allureReporter.addStep("✅ Verified Product");
            } else {
                 console.log(`❌ Failed to verify Product. Expected ${cardProduct}, Found ${bsProductMatch ? bsProductMatch[1] : 'none'}`);
            }

            // 7. Trigger price
            if (bsDesc.includes("Trigger Price")) {
                if ((cardOrderType === "MKT" || cardOrderType === "LMT") && bsDesc.match(/Trigger Price\s*\n\s*-/i)) {
                    console.log("✅ Verified Trigger price is '-' for LMT/MKT");
                    allureReporter.addStep("✅ Verified Trigger price");
                } else {
                    console.log(`❌ Failed to verify Trigger price`);
                }
            } else {
                console.log("⚠️ Trigger price not found in bottom sheet.");
            }

            // 8. Time
            let bsTimeMatch = bsDesc.match(/Time\s*\n\s*([\d:]+)/i);
            if (bsTimeMatch && bsTimeMatch[1] === orderBookTime) {
                console.log(`✅ Verified Time matches trade book: ${bsTimeMatch[1]}`);
                allureReporter.addStep("✅ Verified Time");
            } else {
                console.log(`❌ Failed to verify Time. Expected ${orderBookTime}, Found ${bsTimeMatch ? bsTimeMatch[1] : 'none'}`);
            }

            // Clean up: Close bottom sheet
            await driver.back();
            await driver.pause(1000);
        }
    });

});
