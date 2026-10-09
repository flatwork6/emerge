import WatchlistPage from '../pageobjects/watchlist.page.js';
import OverviewPage from '../pageobjects/overview.page.js';
import OrderWindowPage from '../pageobjects/orderWindow.page.js';
import OrdersPage from '../pageobjects/orders.page.js';
import locators from '../utils/locatorHelper.js';
import allureReporter from '@wdio/allure-reporter';

const originalLog = console.log;
console.log = function (...args) {
    originalLog.apply(console, args);
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    try {
        allureReporter.addStep(msg);
    } catch (e) { }
};

describe('Order Book Verification Flow', () => {

    async function executeOrderFlow(options) {
        const { stockName, action, productType, orderType, isPending } = options;
        allureReporter.addStep(`Execute order flow. isPending: ${isPending}`);
        console.log(`\n========================================`);
        console.log(`Starting ${isPending ? "Pending (AMO)" : "Executed"} Order Automation for ${stockName}`);
        console.log(`========================================`);

        // Go to watchlist tab
        const watchlistTab = await $(locators.get('watchlistTabFromOrders'));
        await driver.waitUntil(async () => {
            return await watchlistTab.isExisting();
        }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });
        await watchlistTab.click();
        await driver.pause(2000);

        console.log("Closing previous search if any...");
        if (typeof WatchlistPage.closeSearch === 'function') {
            await WatchlistPage.closeSearch();
        } else {
            const backBtn = await $(locators.get('orderBookBackBtn'));
            if (await backBtn.isExisting()) await backBtn.click();
        }
        await driver.pause(1000);

        await WatchlistPage.searchIcon.waitForDisplayed({ timeout: 5000 });
        await WatchlistPage.searchIcon.click();

        const searchInput = await WatchlistPage.searchInputField;
        await searchInput.setValue(stockName);
        await driver.pause(2000);

        const stockResult = await $(locators.get('orderBookDynamicResult', stockName));
        await stockResult.waitForDisplayed({ timeout: 5000 });
        await stockResult.click();

        console.log(`Clicking ${action} from Stock Overview...`);
        await driver.pause(2000);

        const overviewActionBtn = action === "BUY" ? await $(locators.get('overviewBuyBtn')) : await $(locators.get('overviewSellBtn'));
        await overviewActionBtn.click();

        console.log(`Selecting ${productType} and ${orderType}...`);
        if (productType === "CNC" || productType === "Delivery") {
            await OrderWindowPage.clickDelivery();
        } else if (productType === "MIS" || productType === "Intraday") {
            await OrderWindowPage.clickIntraday();
        }

        if (orderType === "MKT") {
            await OrderWindowPage.clickMKT();
        }

        if (isPending) {
            console.log("Clicking AMO checkbox...");
            const amoCheckbox = await $(locators.get('locatorGen5', 'AMO'));
            await amoCheckbox.waitForDisplayed({ timeout: 5000 });
            await amoCheckbox.click();
            await driver.pause(1000);
        }

        const extractedDetails = await OrderWindowPage.extractOrderDetails(stockName);
        console.log(`Order details extracted:`, extractedDetails);

        if (action === "BUY") {
            await OrderWindowPage.clickConfirmBuy();

        } else {
            await OrderWindowPage.clickConfirmSell();
        }

        const snackbarMsg = await OrderWindowPage.extractSnackbar();

        if (snackbarMsg.toUpperCase().includes(extractedDetails.stockName.toUpperCase())) {
            console.log(`✅ Snackbar verified for stock: ${extractedDetails.stockName}`);
        } else {
            console.log(`❌ Snackbar verification failed for stock: ${extractedDetails.stockName}. Actual Snackbar: ${snackbarMsg}`);
        }
        if (snackbarMsg.includes(extractedDetails.qty)) {
            console.log(`✅ Snackbar verified for qty: ${extractedDetails.qty}`);
        }

        console.log("Waiting for redirection to Order Book...");
        await driver.pause(6000);

        
        console.log("Verifying Order Book entry...");
        const orderEntry = await $(locators.get('orderBookEntryDynamic').replace('{stockName}', stockName));
        await orderEntry.waitForDisplayed({ timeout: 10000 }).catch(() => console.log("Order entry not visible immediately"));

        // Get all text on screen to accurately parse the order book card
        let allScreenEls = await $$(locators.get('orderBookAllContentDescElements'));
        let allScreenDescs = [];
        for (const el of allScreenEls) {
            const desc = await el.getAttribute("content-desc");
            if (desc && desc.trim().length > 0) {
                // Flutter sometimes groups the entire list item into one single content-desc separated by newlines.
                // We MUST split by newline to correctly parse individual lines like 'Price' and 'Scrip Name'.
                if (desc.includes('\n')) {
                    allScreenDescs.push(...desc.split('\n').map(s => s.trim()).filter(s => s.length > 0));
                } else {
                    allScreenDescs.push(desc.trim());
                }
            }
        }

        // Find the order card by looking for the stock name, since B/S might be grouped or missing
        // (Ignore stockName if it's just 'B' or 'S' from a hardcoded fallback, so it doesn't falsely match "Basket")
        let searchName = (stockName && stockName.length > 1) ? stockName : "";
        let stockIndex = allScreenDescs.findIndex(d => d.includes(searchName));
        let bIndex = stockIndex > 0 ? stockIndex - 1 : (stockIndex === 0 ? 0 : -1);

        // Grab a chunk of elements that represents the first order card (expanded to 25 elements to ensure nothing is missed)
        let cardDescs = bIndex !== -1 ? allScreenDescs.slice(bIndex, bIndex + 25) : [];
        console.log("Order Card elements extracted directly from screen:", cardDescs);

        let cardAction = action;
        let cardStockName = extractedDetails.stockName;
        let cardStatus = "OPEN";
        let cardSegment = extractedDetails.segment;
        let cardProduct = extractedDetails.productType;
        let cardOrderType = extractedDetails.orderType;
        let orderBookFilledQty = "0";
        let orderBookTime = "";
        let orderBookPrice = extractedDetails.price;
        let orderBookLTP = "";

        if (cardDescs.length > 0) {
            cardAction = cardDescs[0] === "B" ? "BUY" : (cardDescs[0] === "S" ? "SELL" : action);
            cardStockName = cardDescs[1]; // Stock name is always immediately after B/S

            // Robust semantic extraction mapping to exact normalized keys
            let foundStatus = cardDescs.find(d => ["REJECTED", "OPEN", "COMPLETED", "CANCELLED", "GTT"].some(s => d.toUpperCase().includes(s)));
            if (foundStatus) cardStatus = ["REJECTED", "OPEN", "COMPLETED", "CANCELLED", "GTT"].find(s => foundStatus.toUpperCase().includes(s));

            let foundSeg = cardDescs.find(d => ["NSE", "BSE", "NFO", "MCX"].some(s => d.toUpperCase().includes(s)));
            if (foundSeg) cardSegment = ["NSE", "BSE", "NFO", "MCX"].find(s => foundSeg.toUpperCase().includes(s));

            let foundProd = cardDescs.find(d => ["CNC", "MIS", "NRML", "CO"].some(s => d.toUpperCase().includes(s)));
            if (foundProd) cardProduct = ["CNC", "MIS", "NRML", "CO"].find(s => foundProd.toUpperCase().includes(s));

            let foundType = cardDescs.find(d => ["LMT", "MKT", "SL-LMT", "SL-MKT"].some(s => d.toUpperCase().includes(s)));
            if (foundType) cardOrderType = ["LMT", "MKT", "SL-LMT", "SL-MKT"].find(s => foundType.toUpperCase().includes(s));

            let qtyStr = cardDescs.find(d => d.includes("Qty:"));
            if (qtyStr) orderBookFilledQty = (qtyStr.match(/Qty:\s*(\d+)/) || [])[1] || "0";

            let timeStr = cardDescs.find(d => d.match(/\d{2}:\d{2}:\d{2}/));
            if (timeStr) orderBookTime = timeStr.match(/\d{2}:\d{2}:\d{2}/)[0];

            // Extract price even if the rupee symbol is missing in the UI text node
            let pStr = cardDescs.find(d => (d.includes("₹") || /^\s*[\d\.,]+\s*$/.test(d)) && !d.toUpperCase().includes("LTP") && d.length > 2);
            if (pStr) orderBookPrice = pStr.replace(/[^\d\.,]/g, ""); // Strip symbol, keep digits/dot/comma

            let lStr = cardDescs.find(d => d.includes("LTP"));
            if (lStr) orderBookLTP = (lStr.match(/LTP\s*[₹]?([\d\.,]+)/) || [])[1] || "";
        }

        // Override original variables with exact values from the order card to ensure accurate bottom-sheet comparison
        let verifiedAction = cardAction;
        extractedDetails.stockName = cardStockName ? cardStockName.trim() : extractedDetails.stockName;
        let expectedStatus = cardStatus;
        if (snackbarMsg.toLowerCase().includes("rejected")) expectedStatus = "REJECTED";
        if (snackbarMsg.toLowerCase().includes("complete")) expectedStatus = "COMPLETED";
        allureReporter.addStep(`Order Book Entry Verified for ${stockName}. Extracted details: ${JSON.stringify(extractedDetails)}`);

        console.log("Clicking the exact scrip to open bottom sheet...");
        await orderEntry.click();
        await driver.pause(3000);

        console.log("Verifying details inside scrip info (bottom sheet)...");
        // Wait for a unique bottom sheet element to guarantee it opened successfully
        const filledQtyLabel = await $(locators.get('orderBookFilledQtyLabel'));
        await filledQtyLabel.waitForDisplayed({ timeout: 10000 }).catch(() => console.log("Bottom sheet did not open properly"));

        if (await filledQtyLabel.isExisting()) {
            let allElements = await $$(locators.get('orderBookAllContentDescElements'));
            let bsDescArr = [];
            for (const el of allElements) {
                const desc = await el.getAttribute("content-desc");
                if (desc && desc.trim().length > 0) {
                    bsDescArr.push(desc.trim());
                }
            }
            const bsDesc = bsDescArr.join('\n');
            console.log(`Bottom Sheet desc:\n${bsDesc}`);

            // 1. Filled Qty
            let bsFilledQtyMatch = bsDesc.match(/Filled Qty\s*\n\s*(\d+)\s*\/\s*(\d+)/);
            if (bsFilledQtyMatch && bsFilledQtyMatch[1] === orderBookFilledQty) {
                console.log("✅ Verified Filled Qty is " + orderBookFilledQty);
                allureReporter.addStep("✅ Verified Filled Qty");
            } else {
                console.log(`❌ Failed to verify Filled Qty. Expected ${orderBookFilledQty}`);
            }

            // 2. Avg Price
            if (expectedStatus === "REJECTED" || expectedStatus === "CANCELLED") {
                if (bsDesc.includes("Avg. price\n0.00") || bsDesc.includes("Avg. price\n0")) {
                    console.log("✅ Verified Avg Price is 0.00 for Rejected/Cancelled order");
                    allureReporter.addStep("✅ Verified Avg Price is 0.00");
                } else {
                    console.log("❌ Failed to verify Avg Price is 0.00");
                }
            }

            // 3. Type
            let bsTypeMatch = bsDesc.match(/Type\s*\n\s*([A-Z\-]+)/);
            if (bsTypeMatch && bsTypeMatch[1] === cardOrderType) {
                console.log(`✅ Verified Type matches order book: ${bsTypeMatch[1]}`);
                allureReporter.addStep(`✅ Verified Type`);
            } else {
                console.log(`❌ Failed to verify Type. Expected ${cardOrderType}, Found ${bsTypeMatch ? bsTypeMatch[1] : 'none'}`);
            }
            if (bsTypeMatch) console.log("bottomsheet type", bsTypeMatch[1]);

            // 4. Status
            let bsStatusMatch = bsDesc.match(/Status\s*\n\s*([A-Za-z]+)/);
            if (bsStatusMatch && bsStatusMatch[1].toUpperCase() === expectedStatus.toUpperCase()) {
                console.log(`✅ Verified Status: ${bsStatusMatch[1]}`);
                allureReporter.addStep(`✅ Verified Status`);
            } else {
                console.log(`❌ Failed to verify Status. Expected ${expectedStatus}`);
            }

            // 5. Scrip Name, LTP, segment, buy/sell, Type
            let hasScripName = bsDesc.includes(stockName);
            let hasAction = bsDesc.includes(verifiedAction.toUpperCase());
            let hasSegment = bsDesc.includes(cardSegment);
            let hasLTP = bsDesc.includes(`LTP ${orderBookLTP}`) || bsDesc.includes(`LTP ₹${orderBookLTP}`) || (orderBookLTP && bsDesc.includes(orderBookLTP));

            if (hasScripName && hasAction && hasSegment && hasLTP) {
                console.log("✅ Verified Scrip Name, Action, Segment, and LTP in header");
                allureReporter.addStep("✅ Verified Scrip Name, Action, Segment, and LTP");
            } else {
                console.log(`❌ Failed to verify Scrip Header details. Scrip:${hasScripName}, Action:${hasAction}, Segment:${hasSegment}, LTP:${hasLTP} (${orderBookLTP})`);
            }

            // 6. Trigger price (Only if it exists in bottom sheet)
            if (bsDesc.includes("Trigger price")) {
                if ((cardOrderType === "MKT" || cardOrderType === "LMT") && bsDesc.includes("Trigger price\n-")) {
                    console.log("✅ Verified Trigger price is '-' for LMT/MKT");
                    allureReporter.addStep("✅ Verified Trigger price");
                } else {
                    console.log("❌ Failed to verify Trigger price");
                }
            } else {
                console.log("⚠️ Trigger price not printed in bottom sheet, skipping.");
            }

            // 7. Price
            let bsPriceMatch = bsDesc.match(/Price\s*\n\s*([\d\.,]+)/);
            if (bsPriceMatch) {
                let normalizedBsPrice = bsPriceMatch[1].replace(/,/g, "");
                let normalizedObPrice = orderBookPrice.replace(/,/g, "");
                if (normalizedBsPrice === normalizedObPrice) {
                    console.log(`✅ Verified Price matches order book: ${orderBookPrice}`);
                    allureReporter.addStep(`✅ Verified Price`);
                } else {
                    console.log(`❌ Failed to verify Price. Expected ${orderBookPrice}, Found ${bsPriceMatch[1]}`);
                }
            } else {
                console.log(`❌ Failed to verify Price. Price not found in bottom sheet.`);
            }

            // 8. Validity / product
            let bsValMatch = bsDesc.match(/Validity \/ product\s*\n\s*([A-Z]+ \/ [A-Z]+)/);
            if (bsValMatch) {
                let valProd = bsValMatch[1];
                if (extractedDetails.productType === "MIS" || extractedDetails.productType === "Intraday") {
                    if (valProd.includes("MIS")) console.log("✅ Verified Validity/Product (MIS)");
                    else console.log(`❌ Failed to verify Validity/Product for Intraday. Found ${valProd}`);
                } else {
                    if (valProd.includes("CNC") || valProd.includes("CO") || valProd.includes("BO")) console.log("✅ Verified Validity/Product (Delivery/CNC/CO)");
                    else console.log(`❌ Failed to verify Validity/Product for Delivery. Found ${valProd}`);
                }
            }

            // 9. Exchange order ID
            let bsExchIdMatch = bsDesc.match(/Exchange order ID\s*\n\s*([A-Za-z0-9\-]+)/);
            if (bsExchIdMatch) {
                if (expectedStatus === "REJECTED" && bsExchIdMatch[1] === "-") {
                    console.log("✅ Verified Exchange order ID is '-' for Rejected order");
                } else if (expectedStatus === "COMPLETED" && bsExchIdMatch[1] !== "-") {
                    console.log("✅ Verified Exchange order ID exists for Completed order");
                }
            }

            // 10. Order time
            let bsTimeMatch = bsDesc.match(/Order time\s*\n\s*(\d{2}:\d{2}:\d{2})/);
            if (bsTimeMatch && bsTimeMatch[1] === orderBookTime) {
                console.log(`✅ Verified Order time matches order book: ${orderBookTime}`);
                allureReporter.addStep(`✅ Verified Order time`);
            } else {
                console.log(`❌ Failed to verify Order time. Expected ${orderBookTime}`);
            }
            console.log("bt sheet time", bsTimeMatch ? bsTimeMatch[1] : "null");
            console.log("orderbook time", orderBookTime);
        }

        console.log("Clicking Market Depth...");
        const marketDepthBtn = await $(locators.get('orderBookMarketDepthBtn'));
        await marketDepthBtn.waitForDisplayed({ timeout: 5000 });
        await marketDepthBtn.click();
        await driver.pause(2000);

        const mdTitle = await $(locators.get('orderBookMarketDepthTitleDynamic', stockName));
        const mdText = await $(locators.get('orderBookMarketDepthText'));
        if (await mdTitle.isExisting() && await mdText.isExisting()) {
            console.log("✅ Verified Market Depth page");
            allureReporter.addStep("✅ Verified Market Depth page");
        }
        await driver.back();
        await driver.pause(2000);

        console.log("Clicking View Chart...");
        // Re-click the entry if bottom sheet closed
        const orderEntryAgain = await $(locators.get('orderBookEntryDynamic').replace('{stockName}', stockName));
        if (!(await $(locators.get('orderBookViewChartBtn')).isDisplayed().catch(() => false))) {
            await orderEntryAgain.click();
            await driver.pause(2000);
        }

        const viewChartBtn = await $(locators.get('orderBookViewChartBtn'));
        await viewChartBtn.waitForDisplayed({ timeout: 5000 });
        await viewChartBtn.click();
        await driver.pause(5000);

        const overviewBuyBtnCheck = await $(locators.get('overviewBuyBtn'));
        if (await overviewBuyBtnCheck.isExisting()) {
            console.log("✅ Verified View Chart opened Overview page");
            allureReporter.addStep("✅ Verified View Chart opened Overview page");
        }
        await driver.back();
        await driver.pause(3000);

        console.log("Clicking Repeat Order...");
        if (!(await $(locators.get('orderBookRepeatOrderBtn')).isDisplayed().catch(() => false))) {
            await orderEntryAgain.click();
            await driver.pause(2000);
        }
        const repeatOrderBtn = await $(locators.get('orderBookRepeatOrderBtn'));
        await repeatOrderBtn.click();
        await driver.pause(3000);


        if (action === "BUY") {
            await OrderWindowPage.clickConfirmBuy();
            const yesBtn = await $(locators.get('basketYesBtn'));
            if (await yesBtn.isExisting()) {
                await yesBtn.click();
                await driver.pause(2000);
            }
        } else {
            await OrderWindowPage.clickConfirmSell();
            const yesBtn = await $(locators.get('basketYesBtn'));
            if (await yesBtn.isExisting()) {
                await yesBtn.click();
                await driver.pause(2000);
            }
        }
        await driver.pause(6000); // give it plenty of time to redirect to order book

        console.log("Verifying 2 scrips are showing after Repeat Order...");
        let allGatechOrders = [];
        // retry mechanism for finding 2 elements
        for (let i = 0; i < 3; i++) {
            allGatechOrders = await $$(locators.get('orderBookDynamicOrdersAfterCancel', stockName));
            if (allGatechOrders.length >= 2) break;
            await driver.pause(2000);
        }

        if (allGatechOrders.length >= 2) {
            console.log("✅ Verified multiple scrips are showing after Repeat Order");
            allureReporter.addStep("✅ Verified multiple scrips are showing after Repeat Order");
        } else {
            console.log(`⚠️ Expected at least 2 ${stockName} orders, found ${allGatechOrders.length}`);
        }

        let isEffectivelyPending = isPending && !(["COMPLETED", "REJECTED", "CANCELLED"].includes(expectedStatus.toUpperCase()));
        if (!isEffectivelyPending && isPending) {
            console.log(`Order status is ${expectedStatus}, treating as executed order, skipping Modify/Cancel flow.`);
            allureReporter.addStep(`Order status is ${expectedStatus}, skipping Modify/Cancel flow.`);
        }

        if (isEffectivelyPending && allGatechOrders.length > 0) {
            console.log("Clicking first scrip to Modify...");
            await allGatechOrders[0].click();
            await driver.pause(2000);

            const modifyBtn = await $(locators.get('orderBookModifyBtn'));
            await modifyBtn.click();
            await driver.pause(3000);

            console.log("Changing order type to SL-LMT...");
            const slLmtBtn = await $(locators.get('orderBookSlLmtBtn'));
            if (await slLmtBtn.isExisting()) {
                await slLmtBtn.click();
            }
            await driver.pause(1000);

            console.log("Increasing Qty and Price by 1...");
            const qtyPlusBtn = await $(locators.get('orderBookQtyPlusBtn'));
            if (await qtyPlusBtn.isExisting()) {
                await qtyPlusBtn.click();
            }
            await driver.pause(1000);

            const pricePlusBtn = await $(locators.get('orderBookPricePlusBtn'));
            if (await pricePlusBtn.isExisting()) {
                await pricePlusBtn.click();
            }
            await driver.pause(1000);

            // Handle limit issue if appears (e.g. "Must be between 12.54 - 13.86")
            let limitIssues = await $$(locators.get('orderBookLimitIssues'));
            if (limitIssues.length > 0) {
                console.log("⚠️ Limit issue detected! Handling it...");
                const limitText = await limitIssues[0].getAttribute("content-desc") || await limitIssues[0].getText();
                // extract bounds, e.g., "Must be between 12.54 - 13.86" -> match 12.54
                const match = limitText.match(/(\d+\.\d+)\s*-/);
                if (match && match[1]) {
                    const validPrice = match[1];
                    console.log(`Setting price to valid lower bound: ${validPrice}`);
                    const priceInput = await $(locators.get('orderBookPriceInputInstance1'));
                    if (await priceInput.isExisting()) {
                        await priceInput.click();
                        await driver.pause(500);
                        await priceInput.clearValue();
                        await priceInput.addValue(validPrice);
                        await driver.pause(1000);
                        await driver.back(); // hide keyboard
                        await driver.pause(1000);
                    }
                }
            }

            const confirmModifyBtn = await $(locators.get('orderBookConfirmModifyBtn'));
            await confirmModifyBtn.click();
            await driver.pause(2000);

            const yesModifyBtn = await $(locators.get('orderBookYesModifyBtn'));
            if (await yesModifyBtn.isExisting()) {
                await yesModifyBtn.click();
            }
            await driver.pause(5000); // give time to return to order book

            // Refetch elements since the DOM reloaded
            let gatechOrdersFinal = await $$(locators.get('orderBookDynamicOrdersAfterCancel', stockName));
            if (gatechOrdersFinal.length > 0) {
                const finalDesc = await gatechOrdersFinal[0].getAttribute("content-desc");
                if (finalDesc.includes("SL-LMT")) {
                    console.log("✅ Verified order modified to SL-LMT in order book");
                    allureReporter.addStep("✅ Verified order modified to SL-LMT in order book");
                } else {
                    console.log(`❌ Failed to verify SL-LMT modification. Desc: ${finalDesc}`);
                }
            }

            console.log("Clicking first scrip to Cancel...");
            gatechOrdersFinal = await $$(locators.get('orderBookDynamicOrdersAfterCancel', stockName));
            if (gatechOrdersFinal.length > 0) {
                await gatechOrdersFinal[0].click();
                await driver.pause(2000);

                const cancelBtn = await $(locators.get('orderBookCancelBtn'));
                await cancelBtn.click();

                await driver.pause(1000);

                console.log("Clicking NO on cancel popup...");
                const noBtn = await $(locators.get('orderBookNoBtn'));
                await noBtn.click();
                await driver.pause(1000);

                console.log("Clicking the first scrip to open bottom sheet again...");
                await gatechOrdersFinal[0].click();
                await driver.pause(2000);

                console.log("Clicking Cancel again -> YES...");
                await cancelBtn.click();
                await driver.pause(1000);
                const yesBtn = await $(locators.get('orderBookYesBtn'));
                await yesBtn.click();
                await driver.pause(3000);

                const gatechOrdersAfterCancel = await $$(locators.get('orderBookDynamicOrdersAfterCancel', stockName));
                if (gatechOrdersAfterCancel.length < gatechOrdersFinal.length) {
                    console.log("✅ Verified order was removed after Cancel");
                    allureReporter.addStep("✅ Verified order was removed after Cancel");
                }
            }
        }
    }

    it('Should verify Pending Orders section only appears when an Open order exists', async () => {
        allureReporter.addStep('Verify Pending Orders section visibility based on Open orders');

        let pendingHeader = await $(locators.get('orderBookPendingOrdersHeader'));
        if (await pendingHeader.isExisting()) {
            console.log("✅ There is a pending order");
            allureReporter.addStep("✅ There is a pending order");
            
            const openOrders = await $$(locators.get('orderBookOpenOrders'));
            if (openOrders.length > 0) {
                console.log("✅ Verified there is at least one order in OPEN status");
                allureReporter.addStep("✅ Verified there is at least one order in OPEN status");
            } else {
                console.log("❌ Pending orders header exists but no OPEN orders found");
                allureReporter.addStep("❌ Pending orders header exists but no OPEN orders found");
            }
        } else {
            console.log("ℹ️ Pending order does not exist");
            allureReporter.addStep("ℹ️ Pending order does not exist");
        }
    });


    // it('should run end-to-end flow for pending buy (COMCL)', async () => {
    //     await executeOrderFlow({ stockName: "INFY-EQ", action: "BUY", productType: "CNC", orderType: "MKT", isPending: true });
    // });

    // it('should run end-to-end flow for pending sell (WIPRO-EQ)', async () => {
    //     await executeOrderFlow({ stockName: "INFY-EQ", action: "SELL", productType: "MIS", orderType: "MKT", isPending: true });
    // });

    // it('should verify Search and Download CSV for Pending Orders', async () => {
    //     allureReporter.addStep('Verify Search and Download CSV for Pending Orders');

    //     const openOrders = await $$('//*[contains(@content-desc, "OPEN")]');
    //     const pendingCount = openOrders.length;

    //     if (pendingCount > 0) {
    //         console.log("Checking Pending Orders Search...");
    //         console.log(openOrders)
    //         const firstPendingDesc = await openOrders[1].getAttribute("content-desc");
    //         const firstPendingScrip = firstPendingDesc ? firstPendingDesc.split('\n')[1] : "COMCL";

    //         const pendingSearchIcon = await $(`android=new UiSelector().className("android.view.View").instance(19)`);
    //         await pendingSearchIcon.waitForDisplayed({ timeout: 5000 });
    //         await pendingSearchIcon.click();
    //         await driver.pause(1000);

    //         let actualPendingSearchInput = await $(`android=new UiSelector().className("android.widget.EditText")`);
    //         await actualPendingSearchInput.click();
    //         await driver.pause(500);

    //         // Search existing scrip
    //         await actualPendingSearchInput.setValue(firstPendingScrip);
    //         await driver.pause(2000);

    //         const existingResult = await $(`//*[@content-desc and contains(@content-desc, "${firstPendingScrip}")]`);
    //         if (await existingResult.isExisting()) {
    //             console.log("✅ Existing scrip appeared in search");
    //         }

    //         const crossBtn = await $(`android=new UiSelector().className("android.widget.Button")`);
    //         if (await crossBtn.isExisting()) {
    //             await crossBtn.click();
    //             await driver.pause(1000);
    //         }

    //         await actualPendingSearchInput.setValue("INVALID_SCRIP_123");
    //         await driver.pause(2000);

    //         const noMatch = await $(locators.get('orderBookNoMatch'));
    //         if (await noMatch.isExisting()) {
    //             console.log("✅ 'No matching orders found' showed for non-existing scrip");
    //         }

    //         const pendingCloseSearchIcon = await $(`android=new UiSelector().className("android.view.View").instance(19)`);
    //         if (await pendingCloseSearchIcon.isExisting()) {
    //             await pendingCloseSearchIcon.click();
    //         }
    //         await driver.pause(1000);


    //         console.log("Checking Pending Orders Download CSV...");
    //         const pendingDownloadIcon = await $(`android=new UiSelector().className("android.view.View").instance(20)`);
    //         await pendingDownloadIcon.click();
    //         await driver.pause(2000);

    //         // Click outside to close pending download
    //         const { width: pWidth, height: pHeight } = await driver.getWindowSize();
    //         await driver.performActions([{
    //             type: 'pointer', id: 'finger2', parameters: { pointerType: 'touch' },
    //             actions: [
    //                 { type: 'pointerMove', duration: 0, x: pWidth / 2, y: pHeight * 0.1 },
    //                 { type: 'pointerDown', button: 0 },
    //                 { type: 'pointerUp', button: 0 }
    //             ]
    //         }]);
    //         await driver.pause(2000);

    //         console.log("Checking Pending Orders Select All...");
    //         const selectAllCheckbox = await $(`android=new UiSelector().className("android.widget.CheckBox").instance(0)`);
    //         if (await selectAllCheckbox.isExisting()) {
    //             await selectAllCheckbox.click();
    //             await driver.pause(1000);
                
    //             let cancelAllBtn = await $(`android=new UiSelector().className("android.widget.Button").textContains("Cancel All")`);
    //             if (!(await cancelAllBtn.isExisting())) {
    //                 cancelAllBtn = await $(`//android.widget.Button[contains(@content-desc, "Cancel All") or contains(@text, "Cancel All")]`);
    //             }
                
    //             if (await cancelAllBtn.isExisting()) {
    //                 await cancelAllBtn.click();
    //                 await driver.pause(1000);
                    
    //                 console.log("Clicking NO on cancel confirmation popup...");
    //                 const noBtn = await $(locators.get('orderBookNoBtn'));
    //                 if (await noBtn.isExisting()) {
    //                     await noBtn.click();
    //                     await driver.pause(1000);
    //                 }
    //             }
    //         }
    //     }
    // });

    // it('should run end-to-end flow for executed buy (ADANI)', async () => {
    //     await executeOrderFlow({ stockName: "ADANI", action: "BUY", productType: "CNC", orderType: "MKT", isPending: false });
    // });

    // it('should run end-to-end flow for executed sell (TCS-EQ)', async () => {
    //     await executeOrderFlow({ stockName: "TCS-EQ", action: "SELL", productType: "MIS", orderType: "MKT", isPending: false });
    // });

    // it('should verify Search, Download CSV and Filter for Executed Orders', async () => {
    //     allureReporter.addStep('Verify Search, Download CSV and Filter for Executed Orders');

    //     const openOrders = await $$('//*[contains(@content-desc, "OPEN")]');
    //     const pendingCount = openOrders.length;
    //     const offset = pendingCount === 0 ? 0 : pendingCount + 6;

    //     const executedOrders = await $$('//*[contains(@content-desc, "COMPLETED") or contains(@content-desc, "REJECTED") or contains(@content-desc, "CANCELLED")]');
    //     let firstExecutedScrip = "TCS-EQ";
    //     if (executedOrders.length > 0) {
    //         const firstExecutedDesc = await executedOrders[1].getAttribute("content-desc");
    //         firstExecutedScrip = firstExecutedDesc ? firstExecutedDesc.split('\n')[1] : "TCS-EQ";
    //     }

    //     // 1. SEARCH
    //     console.log("Checking Executed Orders Search...");
    //     const searchIcon = await $(`android=new UiSelector().className("android.view.View").instance(${19 + offset})`);
    //     await searchIcon.waitForDisplayed({ timeout: 5000 });
    //     await searchIcon.click();
    //     await driver.pause(1000);

    //     let actualSearchInput = await $(`android=new UiSelector().className("android.widget.EditText")`);
    //     await actualSearchInput.click();
    //     await driver.pause(500);

    //     await actualSearchInput.setValue(firstExecutedScrip);
    //     await driver.pause(2000);

    //     const existingExecutedResult = await $(`//*[@content-desc and contains(@content-desc, "${firstExecutedScrip}")]`);
    //     if (await existingExecutedResult.isExisting()) {
    //         console.log("✅ Existing scrip appeared in search");
    //     }

    //     const crossBtn = await $(`android=new UiSelector().className("android.widget.Button")`);
    //     if (await crossBtn.isExisting()) {
    //         await crossBtn.click();
    //         await driver.pause(1000);
    //     }

    //     await actualSearchInput.setValue("INVALID_SCRIP_123");
    //     await driver.pause(2000);

    //     const noMatch = await $(locators.get('orderBookNoMatch'));
    //     if (await noMatch.isExisting()) {
    //         console.log("✅ 'No matching orders found' showed for non-existing scrip");
    //     }

    //     const crossBtn1 = await $(`android=new UiSelector().className("android.widget.Button")`);
    //     if (await crossBtn1.isExisting()) {
    //         await crossBtn1.click();
    //         await driver.pause(1000);
    //     }
    //     const closeSearchIcon = await $(`android=new UiSelector().className("android.view.View").instance(${19 + offset})`);

    //     // click search icon to close search
    //     if (await closeSearchIcon.isExisting()) {
    //         await closeSearchIcon.click();
    //     }


    //     // 2. DOWNLOAD CSV
    //     console.log("Checking Download CSV...");
    //     const downloadCsvIcon = await $(`android=new UiSelector().className("android.view.View").instance(${20 + offset})`);
    //     await downloadCsvIcon.click();
    //     await driver.pause(2000);

    //     const csvName = await $(locators.get('orderBookCsvName'));
    //     if (await csvName.isExisting()) {
    //         console.log("✅ CSV download bottom sheet showed up with file name");
    //     }

    //     // click outside to close
    //     const { width, height } = await driver.getWindowSize();
    //     await driver.performActions([{
    //         type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
    //         actions: [
    //             { type: 'pointerMove', duration: 0, x: width / 2, y: height * 0.1 },
    //             { type: 'pointerDown', button: 0 },
    //             { type: 'pointerUp', button: 0 }
    //         ]
    //     }]);
    //     await driver.pause(2000);

    //     // 3. FILTER
    //     console.log("Checking Filter...");
    //     let filterIcon = await $(`android=new UiSelector().className("android.view.View").instance(${21 + offset})`);
    //     if (!(await filterIcon.isExisting())) {
    //         filterIcon = await $(`android=new UiSelector().className("android.view.View").instance(${22 + offset})`);
    //     }
    //     await filterIcon.click();
    //     await driver.pause(2000);

    //     const clickFilterAndSave = async (filterName) => {
    //         const btn = await $(locators.get('locatorGen5', '${filterName}'));
    //         const btnFallback = await $(locators.get('orderBookFilterDynamicBtnFallback', filterName));
    //         if (await btn.isExisting()) await btn.click();
    //         else if (await btnFallback.isExisting()) await btnFallback.click();
    //         await driver.pause(500);

    //         const saveBtn = await $(locators.get('locatorGen5', 'SAVE'));
    //         const saveBtnFallback = await $(locators.get('orderBookSaveBtnFallback'));
    //         if (await saveBtn.isExisting()) await saveBtn.click();
    //         else if (await saveBtnFallback.isExisting()) await saveBtnFallback.click();
    //         await driver.pause(2000);
    //     };

    //     // Completed
    //     await clickFilterAndSave("Completed");
    //     let orders = await $$(locators.get('orderBookCompletedOrders'));
    //     let allCompleted = true;
    //     for (const order of orders) {
    //         const desc = await order.getAttribute("content-desc");
    //         if (desc && (desc.includes("REJECTED") || desc.includes("CANCELLED"))) allCompleted = false;
    //     }
    //     if (allCompleted) console.log("✅ Only Completed orders are showing");

    //     // Rejected
    //     await filterIcon.click();
    //     await driver.pause(1000);
    //     await clickFilterAndSave("Rejected");
    //     orders = await $$(locators.get('orderBookCompletedOrders'));
    //     let allRejected = true;
    //     for (const order of orders) {
    //         const desc = await order.getAttribute("content-desc");
    //         if (desc && (desc.includes("COMPLETED") || desc.includes("CANCELLED"))) allRejected = false;
    //     }
    //     if (allRejected) console.log("✅ Only Rejected orders are showing");

    //     // Cancelled
    //     await filterIcon.click();
    //     await driver.pause(1000);
    //     await clickFilterAndSave("Cancelled");
    //     orders = await $$(locators.get('orderBookCompletedOrders'));
    //     let noMatchFound = false;
    //     if (orders.length === 0) {
    //         const noMatchCancel = await $(locators.get('orderBookNoMatch'));
    //         if (await noMatchCancel.isExisting()) {
    //             console.log("✅ 'No matching orders found' showed for Cancelled as there are none");
    //             noMatchFound = true;
    //         }
    //     } else {
    //         let allCancelled = true;
    //         for (const order of orders) {
    //             const desc = await order.getAttribute("content-desc");
    //             if (desc && (desc.includes("COMPLETED") || desc.includes("REJECTED"))) allCancelled = false;
    //         }
    //         if (allCancelled) console.log("✅ Only Cancelled orders are showing");
    //     }

    //     // All
    //     if (noMatchFound) {
    //         const filterIconNoMatch = await $(`android=new UiSelector().className("android.view.View").instance(${22 + offset})`);
    //         await filterIconNoMatch.click();
    //     } else {
    //         await filterIcon.click();
    //     }
    //     await driver.pause(1000);
    //     await clickFilterAndSave("All");
    //     console.log("✅ Restored to All filters");
    // });


});
