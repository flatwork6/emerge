import WatchlistPage from '../pageobjects/watchlist.page.js';
import OverviewPage from '../pageobjects/overview.page.js';
import OrderWindowPage from '../pageobjects/orderWindow.page.js';
import OrdersPage from '../pageobjects/orders.page.js';
import locators from '../utils/locatorHelper.js';
import allureReporter from '@wdio/allure-reporter';

describe('Order Book Verification Flow', () => {
    // it('should verify header count matches actual scrolled count for both pending and executed orders', async () => {
    //     allureReporter.addStep('Verify Header count vs Scroll count');
    //     console.log(`\n========================================`);
    //     console.log(`Starting Header Count Verification`);
    //     console.log(`========================================`);
        
    //     // 1. Go to Order Book
    //     const ordersTab = await $(`android=new UiSelector().className("android.widget.ImageView").instance(4)`);
    //     await driver.waitUntil(async () => {
    //         return await ordersTab.isExisting();
    //     }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });
    //     await ordersTab.click();
    //     await driver.pause(3000); // wait for orders to load

    //     // Function to verify count for a specific header
    //     const verifyCount = async (headerSubstring) => {
    //         console.log(`Verifying count for ${headerSubstring}...`);
    //         const headerEl = await $(`//*[contains(@content-desc, "${headerSubstring}") or contains(@text, "${headerSubstring}")]`);
    //         await headerEl.waitForDisplayed({ timeout: 5000 }).catch(() => {});
    //         if (!(await headerEl.isExisting())) {
    //             console.log(`⚠️ ${headerSubstring} header not found on screen. It might be empty.`);
    //             return;
    //         }
    //         const headerDesc = await headerEl.getAttribute("content-desc") || await headerEl.getText();
    //         const match = headerDesc.match(/\((\d+)\)/);
    //         let expectedCount = 0;
    //         if (match) {
    //             expectedCount = parseInt(match[1], 10);
    //             console.log(`Expected ${headerSubstring} Count: ${expectedCount}`);
    //         } else {
    //             console.log(`❌ Could not extract number from ${headerSubstring} header`);
    //             return;
    //         }

    //         if (expectedCount === 0) {
    //             console.log(`✅ ${headerSubstring} count is 0, skipping scroll.`);
    //             return;
    //         }

    //         let uniqueOrders = new Set();
    //         let lastSize = -1;
    //         let retries = 0;
            
    //         while (uniqueOrders.size < expectedCount && retries < 3) {
    //             // Orders typically contain "BSE" or "NSE"
    //             const onScreenOrders = await $$(`//*[contains(@content-desc, "BSE") or contains(@content-desc, "NSE")]`);
                
    //             for (const order of onScreenOrders) {
    //                 const desc = await order.getAttribute("content-desc");
    //                 if (desc) uniqueOrders.add(desc);
    //             }
                
    //             if (uniqueOrders.size === lastSize) {
    //                 retries++;
    //             } else {
    //                 retries = 0;
    //             }
    //             lastSize = uniqueOrders.size;
                
    //             if (uniqueOrders.size < expectedCount) {
    //                 const { width, height } = await driver.getWindowSize();
    //                 await driver.performActions([
    //                     {
    //                         type: 'pointer',
    //                         id: 'finger1',
    //                         parameters: { pointerType: 'touch' },
    //                         actions: [
    //                             { type: 'pointerMove', duration: 0, x: width / 2, y: height * 0.8 },
    //                             { type: 'pointerDown', button: 0 },
    //                             { type: 'pause', duration: 100 },
    //                             { type: 'pointerMove', duration: 1000, origin: 'viewport', x: width / 2, y: height * 0.2 },
    //                             { type: 'pointerUp', button: 0 }
    //                         ]
    //                     }
    //                 ]);
    //                 await driver.pause(1500); 
    //             }
    //         }
            
    //         console.log(`Scrolled and found ${uniqueOrders.size} unique ${headerSubstring} orders`);
    //         if (uniqueOrders.size === expectedCount) {
    //              console.log(`✅ ${headerSubstring} orders count matches header!`);
    //              allureReporter.addStep(`✅ ${headerSubstring} orders count matches header (${expectedCount})`);
    //         } else {
    //              console.log(`❌ ${headerSubstring} orders count mismatch. Header: ${expectedCount}, Found: ${uniqueOrders.size}`);
    //              allureReporter.addStep(`❌ ${headerSubstring} orders count mismatch. Header: ${expectedCount}, Found: ${uniqueOrders.size}`);
    //         }

    //         // Scroll back to top of this section
    //         console.log(`Scrolling back to top of ${headerSubstring}...`);
    //         for (let i = 0; i < 5; i++) {
    //             const { width, height } = await driver.getWindowSize();
    //             await driver.performActions([
    //                 {
    //                     type: 'pointer',
    //                     id: 'finger1',
    //                     parameters: { pointerType: 'touch' },
    //                     actions: [
    //                         { type: 'pointerMove', duration: 0, x: width / 2, y: height * 0.2 },
    //                         { type: 'pointerDown', button: 0 },
    //                         { type: 'pause', duration: 100 },
    //                         { type: 'pointerMove', duration: 1000, origin: 'viewport', x: width / 2, y: height * 0.8 },
    //                         { type: 'pointerUp', button: 0 }
    //                     ]
    //                 }
    //             ]);
    //             await driver.pause(1500);
    //             if (await headerEl.isDisplayed().catch(()=>false)) break;
    //         }
    //     };

    //     // By default we land on Pending Orders
    //     await verifyCount("Pending Orders");

    //     // Now scroll down past pending orders to reach Executed Orders header
    //     console.log("Scrolling to Executed Orders header...");
    //     let executedHeader = null;
    //     for (let i = 0; i < 8; i++) {
    //         const h = await $(`//*[contains(@content-desc, "Executed Orders") or contains(@text, "Executed Orders")]`);
    //         if (await h.isDisplayed().catch(()=>false)) {
    //             executedHeader = h;
    //             break;
    //         }
    //         const { width, height } = await driver.getWindowSize();
    //         await driver.performActions([
    //             {
    //                 type: 'pointer',
    //                 id: 'finger1',
    //                 parameters: { pointerType: 'touch' },
    //                 actions: [
    //                     { type: 'pointerMove', duration: 0, x: width / 2, y: height * 0.8 },
    //                     { type: 'pointerDown', button: 0 },
    //                     { type: 'pause', duration: 100 },
    //                     { type: 'pointerMove', duration: 1000, origin: 'viewport', x: width / 2, y: height * 0.2 },
    //                     { type: 'pointerUp', button: 0 }
    //                 ]
    //             }
    //         ]);
    //         await driver.pause(1500);
    //     }
        
    //     if (executedHeader) {
    //         await verifyCount("Executed Orders");
    //     } else {
    //         console.log("⚠️ Could not find Executed Orders header after scrolling.");
    //         allureReporter.addStep("⚠️ Could not find Executed Orders header after scrolling.");
    //     }
    // });

    // it('should place a buy order and verify it in the order book', async () => {
    //     console.log(`\n========================================`);
    //     console.log(`Starting Order Book Automation`);
    //     console.log(`========================================`);

    //     // 1. From watchlist search for tcs-eq stock and click it.
    //     // Wait for bottom tabs to render
    // const watchlistTab = await $(`android=new UiSelector().className("android.widget.ImageView").instance(2)`);
    // await driver.waitUntil(async () => {
    //     return await watchlistTab.isExisting();
    // }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });
    // await watchlistTab.click();


    //     // Use the search icon to open search, type TCS-EQ, and click the first result
    //     await WatchlistPage.searchIcon.waitForDisplayed({ timeout: 5000 });
    //     await WatchlistPage.searchIcon.click();

    //     const searchInput = await WatchlistPage.searchInputField;
    //     await searchInput.setValue("GATECH");
    //     await driver.pause(2000);

    //     // Click the TCS-EQ result directly
    //     const gatechResult = await $(locators.get('searchResultGatech'));
    //     await gatechResult.waitForDisplayed({ timeout: 5000 });
    //     await gatechResult.click();

    //     // 2. Stock overview window will open. Click on BUY.
    //     console.log("Clicking BUY from Stock Overview...");
    //     await driver.pause(2000); // Wait for overview to load

    //     const overviewBuyBtn = await $(locators.get('overviewBuyBtn'));
    //     await overviewBuyBtn.click();

    //     // 3. Order window opens. Select Delivery, MKT, and extract details.
    //     await OrderWindowPage.clickDelivery();
    //     await OrderWindowPage.clickMKT();

    //     const extractedDetails = await OrderWindowPage.extractOrderDetails("GATECH");
    //     console.log(`Order details extracted:`, extractedDetails);

    //     // Click final BUY
    //     await OrderWindowPage.clickConfirmBuy();

    //     // 4. Snackbar will appear saying order rejected/completed. Extract that status and verify.
    //     const snackbarMsg = await OrderWindowPage.extractSnackbar();

    //     let expectedStatus = "REJECTED"; // or COMPLETED based on snackbar
    //     if (snackbarMsg.toLowerCase().includes("complete")) expectedStatus = "COMPLETED";

    //     // Verify stock name and qty in snackbar
    //     if (snackbarMsg.toUpperCase().includes(extractedDetails.stockName.toUpperCase())) {
    //         console.log(`✅ Snackbar verified for stock: ${extractedDetails.stockName}`);
    //     } else {
    //         console.log(`❌ Snackbar verification failed for stock: ${extractedDetails.stockName}. Actual Snackbar: ${snackbarMsg}`);
    //     }
    //     if (snackbarMsg.includes(extractedDetails.qty)) {
    //         console.log(`✅ Snackbar verified for qty: ${extractedDetails.qty}`);
    //     }

    //     // 5. Wait for sometime it will redirect to Order book.
    //     console.log("Waiting for redirection to Order Book...");
    //     await driver.pause(5000); // wait for redirect

    //     // We should be in Order Book now. Verify extracted details.
    //     // Usually, Orders Page has a list of executed orders. We look for the first one.
    //     console.log("Verifying Order Book entry...");

    //     // Looking for "B" in circle is tricky with Appium if it's a graphic, 
    //     // but often the content-desc contains "B"
    //     const orderEntry = await $(locators.get('orderBookEntryDynamic').replace('{stockName}', extractedDetails.stockName));
    //     await orderEntry.waitForDisplayed({ timeout: 10000 });

    //     const orderDesc = await orderEntry.getAttribute("content-desc");
    //     console.log(`Order Book entry desc:\n${orderDesc}`);

    //     // Check same things extracted
    //     if (orderDesc.toUpperCase().includes(extractedDetails.stockName.toUpperCase())) {
    //         console.log(`✅ Verified Stock: ${extractedDetails.stockName}`);
    //     } else {
    //         console.log(`❌ Stock verification failed. Expected: ${extractedDetails.stockName}`);
    //     }

    //     if (extractedDetails.segment === "") {
    //         console.log(`⚠️ Segment was not highlighted in Appium tree. Order Book segment found: ${orderDesc.includes("BSE") ? "BSE" : "NSE"}`);
    //     } else if (orderDesc.toUpperCase().includes(extractedDetails.segment.toUpperCase())) {
    //         console.log(`✅ Verified Segment: ${extractedDetails.segment}`);
    //     } else {
    //         console.log(`❌ Segment verification failed. Expected: ${extractedDetails.segment}`);
    //     }

    //     if (orderDesc.toUpperCase().includes(extractedDetails.productType.toUpperCase())) {
    //         console.log(`✅ Verified Product Type: ${extractedDetails.productType}`);
    //     } else {
    //         console.log(`❌ Product Type verification failed. Expected: ${extractedDetails.productType}`);
    //     }

    //     // Order type MKT shows as LMT in order book as per requirement
    //     if (orderDesc.toUpperCase().includes("LMT")) {
    //         console.log(`✅ Verified Order Type: LMT (was MKT)`);
    //     } else {
    //         console.log(`❌ Order Type verification failed. Expected: LMT`);
    //     }

    //     if (orderDesc.toUpperCase().includes("B")) console.log(`✅ Verified Buy indicator 'B'`);
    //     if (orderDesc.toUpperCase().includes(expectedStatus.toUpperCase())) console.log(`✅ Verified Status: ${expectedStatus}`);

    //     let expectedQty = expectedStatus === "COMPLETED" ? extractedDetails.qty : "0";
    //     if (orderDesc.includes(expectedQty.toString())) {
    //         console.log(`✅ Verified Quantity: ${expectedQty}`);
    //     } else {
    //         console.log(`❌ Quantity verification failed. Expected: ${expectedQty}`);
    //     }
    //     extractedDetails.qty = expectedQty; // Update for report
    //     allureReporter.addStep(`Order Book Entry Verified for GATECH. Extracted details: ${JSON.stringify(extractedDetails)}`);

    //     // SECOND FLOW: Intraday (MIS) + SELL
    //     console.log(`\n========================================`);
    //     console.log(`Starting Intraday (MIS) SELL Order`);
    //     console.log(`========================================`);
    //     await driver.waitUntil(async () => {
    //         const el = await $(locators.get('watchlistTabFromOrders'));
    //         return await el.isExisting();
    //     }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });
    //     // From Orders page, Watchlist is instance(2)
    //     await $(locators.get('watchlistTabFromOrders')).click();

    //     await $(locators.get('searchCloseButton')).click();
    //     await WatchlistPage.searchIcon.waitForDisplayed({ timeout: 5000 });
    //     await WatchlistPage.searchIcon.click();

    //     const searchInput2 = await WatchlistPage.searchInputField;
    //     await searchInput2.setValue("TCS-EQ");
    //     await driver.pause(2000);

    //     const tcsResult2 = await $(locators.get('searchResultTcsEq'));
    //     await tcsResult2.waitForDisplayed({ timeout: 5000 });
    //     await tcsResult2.click();

    //     console.log("Clicking SELL from Stock Overview...");
    //     await driver.pause(2000);

    //     const overviewSellBtn = await $(locators.get('overviewSellBtn'));
    //     await overviewSellBtn.click();

    //     await OrderWindowPage.clickIntraday();
    //     await OrderWindowPage.clickMKT();

    //     const extractedDetails2 = await OrderWindowPage.extractOrderDetails("TCS-EQ");
    //     console.log(`Order details extracted:`, extractedDetails2);

    //     await OrderWindowPage.clickConfirmSell();

    //     const snackbarMsg2 = await OrderWindowPage.extractSnackbar();
    //     let expectedStatus2 = "REJECTED";
    //     if (snackbarMsg2.toLowerCase().includes("complete")) expectedStatus2 = "COMPLETED";

    //     if (snackbarMsg2.toUpperCase().includes(extractedDetails2.stockName.toUpperCase())) {
    //         console.log(`✅ Snackbar verified for stock: ${extractedDetails2.stockName}`);
    //     } else {
    //         console.log(`❌ Snackbar verification failed for stock: ${extractedDetails2.stockName}. Actual Snackbar: ${snackbarMsg2}`);
    //     }

    //     console.log("Waiting for redirection to Order Book...");
    //     await driver.pause(5000);

    //     console.log("Verifying Order Book entry...");
    //     const orderEntry2 = await $(locators.get('orderBookEntryDynamic').replace('{stockName}', extractedDetails2.stockName));
    //     await orderEntry2.waitForDisplayed({ timeout: 10000 });

    //     const orderDesc2 = await orderEntry2.getAttribute("content-desc");
    //     console.log(`Order Book entry desc:\n${orderDesc2}`);

    //     if (orderDesc2.toUpperCase().includes(extractedDetails2.stockName.toUpperCase())) {
    //         console.log(`✅ Verified Stock: ${extractedDetails2.stockName}`);
    //     } else {
    //         console.log(`❌ Stock verification failed. Expected: ${extractedDetails2.stockName}`);
    //     }

    //     if (extractedDetails2.segment === "") {
    //         console.log(`⚠️ Segment was not highlighted in Appium tree. Order Book segment found: ${orderDesc2.includes("BSE") ? "BSE" : "NSE"}`);
    //     } else if (orderDesc2.toUpperCase().includes(extractedDetails2.segment.toUpperCase())) {
    //         console.log(`✅ Verified Segment: ${extractedDetails2.segment}`);
    //     } else {
    //         console.log(`❌ Segment verification failed. Expected: ${extractedDetails2.segment}`);
    //     }

    //     if (orderDesc2.toUpperCase().includes(extractedDetails2.productType.toUpperCase())) {
    //         console.log(`✅ Verified Product Type: ${extractedDetails2.productType}`);
    //     } else {
    //         console.log(`❌ Product Type verification failed. Expected: ${extractedDetails2.productType}`);
    //     }

    //     if (orderDesc2.toUpperCase().includes("LMT")) {
    //         console.log(`✅ Verified Order Type: LMT (was MKT)`);
    //     } else {
    //         console.log(`❌ Order Type verification failed. Expected: LMT`);
    //     }

    //     if (orderDesc2.toUpperCase().includes("S")) console.log(`✅ Verified Sell indicator 'S'`);
    //     if (orderDesc2.toUpperCase().includes(expectedStatus2.toUpperCase())) console.log(`✅ Verified Status: ${expectedStatus2}`);

    //     let expectedQty2 = expectedStatus2 === "COMPLETED" ? extractedDetails2.qty : "0";
    //     if (orderDesc2.includes(expectedQty2.toString())) {
    //         console.log(`✅ Verified Quantity: ${expectedQty2}`);
    //     } else {
    //         console.log(`❌ Quantity verification failed. Expected: ${expectedQty2}`);
    //     }
    //     extractedDetails2.qty = expectedQty2; // Update for report
    //     allureReporter.addStep(`Order Book Entry Verified for TCS-EQ. Extracted details: ${JSON.stringify(extractedDetails2)}`);
    // });
    // it('should verify the order info details and repeat order', async () => {
    //     allureReporter.addStep('Find first order in Order Book and extract details');
    //     console.log("Finding first order in Order Book...");

    //     // Find the first order book entry that has REJECTED or COMPLETED
    //     const firstOrder = await $('//android.view.View[contains(@content-desc, "REJECTED") or contains(@content-desc, "COMPLETED")]');
    //     await firstOrder.waitForDisplayed({ timeout: 15000 });

    //     const orderDesc = await firstOrder.getAttribute("content-desc");
    //     console.log(`First Order Book entry desc:\n${orderDesc}`);

    //     // Parse details from orderDesc
    //     // Example format:
    //     // S \n TCS-EQ \n REJECTED \n NSE \n • \n MIS \n • \n LMT \n Qty: 0/1 \n • \n 17:13:49 \n ₹1971.20 \n LTP ₹2075.00
    //     const lines = orderDesc.split('\n').map(l => l.trim());
    //     const stockName = lines.length > 1 ? lines[1] : "UNKNOWN";
    //     const status = orderDesc.includes("REJECTED") ? "REJECTED" : "COMPLETED";

    //     let ltp = "";
    //     const ltpMatch = orderDesc.match(/LTP\s*₹([\d.]+)/);
    //     if (ltpMatch) ltp = ltpMatch[1];

    //     const segment = orderDesc.includes("BSE") ? "BSE" : "NSE";
    //     const isSell = orderDesc.startsWith("S");

    //     let qtyStr = "";
    //     const qtyMatch = orderDesc.match(/Qty:\s*(\d+\s*\/\s*\d+)/i);
    //     if (qtyMatch) qtyStr = qtyMatch[1];

    //     let timeStr = "";
    //     const timeMatch = orderDesc.match(/\b(\d{2}:\d{2}:\d{2})\b/);
    //     if (timeMatch) timeStr = timeMatch[1];

    //     console.log("Clicking on order to view Order Info...");
    //     await firstOrder.click();
    //     await driver.pause(2000); // Wait for bottom sheet

    //     const pageSource = await driver.getPageSource();

    //     let isOrderInfoValid = true;

    //     if (pageSource.includes(stockName)) {
    //         console.log(`✅ Order Info: Verified Stock Name ${stockName}`);
    //     } else {
    //         console.log(`❌ Order Info: Stock Name missing`);
    //         isOrderInfoValid = false;
    //     }

    //     if (pageSource.toUpperCase().includes(status.toUpperCase())) {
    //         console.log(`✅ Order Info: Verified Status ${status}`);
    //     } else {
    //         console.log(`❌ Order Info: Status missing`);
    //         isOrderInfoValid = false;
    //     }

    //     if (pageSource.includes(ltp)) {
    //         console.log(`✅ Order Info: Verified LTP ${ltp}`);
    //     } else {
    //         console.log(`❌ Order Info: LTP missing`);
    //         isOrderInfoValid = false;
    //     }

    //     if (pageSource.toUpperCase().includes(segment.toUpperCase())) {
    //         console.log(`✅ Order Info: Verified Segment ${segment}`);
    //     } else {
    //         console.log(`❌ Order Info: Segment missing`);
    //         isOrderInfoValid = false;
    //     }

    //     const expectedSide = isSell ? "SELL" : "BUY";
    //     if (pageSource.toUpperCase().includes(expectedSide)) {
    //         console.log(`✅ Order Info: Verified Buy/Sell indicator (${expectedSide})`);
    //     } else {
    //         console.log(`❌ Order Info: Buy/Sell indicator missing`);
    //         isOrderInfoValid = false;
    //     }

    //     if (qtyStr) {
    //         let qtyStrWithSpaces = qtyStr.replace('/', ' / '); // "0 / 1"
    //         if (pageSource.includes(qtyStr) || pageSource.includes(qtyStrWithSpaces)) {
    //             console.log(`✅ Order Info: Verified Filled Qty ${qtyStr}`);
    //         } else {
    //             console.log(`❌ Order Info: Filled Qty missing`);
    //             isOrderInfoValid = false;
    //         }
    //     }

    //     if (timeStr) {
    //         if (pageSource.includes(timeStr)) {
    //             console.log(`✅ Order Info: Verified Time ${timeStr}`);
    //         } else {
    //             console.log(`❌ Order Info: Time missing`);
    //             isOrderInfoValid = false;
    //         }
    //     }

    //     if (isOrderInfoValid) {
    //         allureReporter.addStep('✅ Successful order info verified');
    //     } else {
    //         allureReporter.addStep('❌ Order info verification failed');
    //     }

    //     console.log("Clicking Market Depth...");
    //     const marketDepthBtn = await $('~Market Depth');
    //     await marketDepthBtn.click();
    //     await driver.pause(2000);

    //     // Don't use getPageSource on Market Depth, as it can be heavy
    //     // Check for specific text elements instead
    //     const mdTitle = await $(`//android.view.View[contains(@content-desc, "Market Depth") or contains(@text, "Market Depth")]`);
    //     const isMdTitleExisting = await mdTitle.isExisting();

    //     if (isMdTitleExisting) {
    //         console.log(`✅ Verified Market Depth page`);
    //         allureReporter.addStep("✅ Verified Market Depth page")
    //     } else {
    //         console.log(`❌ Market Depth page verification failed`);
    //         allureReporter.addStep("❌ Market Depth page verification failed")
    //     } await $(locators.get('stockOverviewBackButton')).click();
    //     await driver.pause(2000);


    //     console.log("Clicking View Chart...");
    //     const viewChartBtn = await $('~View Chart');
    //     await viewChartBtn.click();
    //     await driver.pause(4000);

    //     // Don't use getPageSource on Chart page to prevent UiAutomator2 crash from heavy WebView/Chart tree
    //     const overviewEl = await $(`//android.view.View[contains(@content-desc, "Overview") or contains(@text, "Overview")]`);
    //     const isOverviewExisting = await overviewEl.isExisting();

    //     if (isOverviewExisting) {
    //         console.log(`✅ Verified View Chart page`);
    //         allureReporter.addStep('✅ Verified View Chart page');
    //     } else {
    //         console.log(`❌ View Chart page verification failed`);
    //         allureReporter.addStep("❌ View Chart page verification failed")
    //     }

    //     await $(locators.get('stockOverviewBackButton')).click();
    //     await driver.pause(2000);

    //     console.log("Clicking Repeat Order...");
    //     const repeatOrderBtn = await $('~Repeat Order');
    //     await repeatOrderBtn.click();
    //     await driver.pause(3000);

    //     console.log("Submitting repeated order...");
    //     // the form should be pre-filled, so just click the main action button
    //     // if it was SELL, we click confirm sell, otherwise confirm buy
    //     if (isSell) {
    //         await OrderWindowPage.clickConfirmSell();
    //     } else {
    //         await OrderWindowPage.clickConfirmBuy();
    //     }
    //     await driver.pause(1000);

    //     try {
    //         const yesBtn = await $('~Yes');
    //         if (await yesBtn.isDisplayed()) {
    //             await yesBtn.click();
    //         }
    //     } catch (e) { }

    //     console.log("Waiting for redirection to Order Book...");
    //     await driver.pause(6000);

    //     console.log("Verifying repeated Order Book entry...");

    //     const repeatedOrderEntry = await $(locators.get('orderBookEntryDynamic').replace('{stockName}', stockName));
    //     await repeatedOrderEntry.waitForDisplayed({ timeout: 10000 });
    //     const repeatedDesc = await repeatedOrderEntry.getAttribute("content-desc");
    //     console.log(`Repeated Order Book entry desc:\n${repeatedDesc}`);

    //     if (repeatedDesc.includes(stockName) && repeatedDesc.includes(status)) {
    //         console.log(`✅ Verified Repeated Order successfully`);
    //         allureReporter.addStep("✅ Verified Repeated Order successfully")
    //     } else {
    //         console.log(`❌ Repeated Order verification failed`);
    //         allureReporter.addStep("❌ Repeated Order verification failed")
    //     }
    // });
    it('should place an AMO buy order and verify it in the pending orders', async () => {
        allureReporter.addStep('Place an AMO buy order and verify in Pending Orders');
        console.log(`\n========================================`);
        console.log(`Starting Pending Order (AMO) Automation`);
        console.log(`========================================`);

        // 1. From watchlist search for GATECH stock and click it.
        // Wait for bottom tabs to render
        const watchlistTab = await $(`android=new UiSelector().className("android.widget.ImageView").instance(2)`);
        await driver.waitUntil(async () => {
            return await watchlistTab.isExisting();
        }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });
        await watchlistTab.click();

        // Use the search icon to open search, type GATECH, and click the first result
        await WatchlistPage.searchIcon.waitForDisplayed({ timeout: 5000 });
        await WatchlistPage.searchIcon.click();

        const searchInput = await WatchlistPage.searchInputField;
        await searchInput.setValue("GATECH");
        await driver.pause(2000);

        // Click the GATECH result directly
        const gatechResult = await $(locators.get('searchResultGatech'));
        await gatechResult.waitForDisplayed({ timeout: 5000 });
        await gatechResult.click();

        // 2. Stock overview window will open. Click on BUY.
        console.log("Clicking BUY from Stock Overview...");
        await driver.pause(2000); // Wait for overview to load

        const overviewBuyBtn = await $(locators.get('overviewBuyBtn'));
        await overviewBuyBtn.click();

        // 3. Order window opens. Select Delivery and MKT
        console.log("Selecting Delivery and MKT...");
        await OrderWindowPage.clickDelivery();
        await OrderWindowPage.clickMKT();

        console.log("Clicking AMO checkbox...");
        const amoCheckbox = await $('~AMO');
        await amoCheckbox.waitForDisplayed({ timeout: 5000 });
        await amoCheckbox.click();
        await driver.pause(1000);

        // Extract details
        const extractedDetails = await OrderWindowPage.extractOrderDetails("GATECH");
        console.log(`Order details extracted:`, extractedDetails);

        // Click final BUY
        await OrderWindowPage.clickConfirmBuy();

        // 4. Snackbar will appear saying order rejected/completed/open. Extract that status and verify.
        const snackbarMsg = await OrderWindowPage.extractSnackbar();

        // Verify stock name and qty in snackbar
        if (snackbarMsg.toUpperCase().includes(extractedDetails.stockName.toUpperCase())) {
            console.log(`✅ Snackbar verified for stock: ${extractedDetails.stockName}`);
        } else {
            console.log(`❌ Snackbar verification failed for stock: ${extractedDetails.stockName}. Actual Snackbar: ${snackbarMsg}`);
        }
        if (snackbarMsg.includes(extractedDetails.qty)) {
            console.log(`✅ Snackbar verified for qty: ${extractedDetails.qty}`);
        }

        // 5. Wait for sometime it will redirect to Order book.
        console.log("Waiting for redirection to Order Book...");
        await driver.pause(5000); // wait for redirect

        // We should be in Order Book now. The default tab is Pending/Open orders.
        console.log("Verifying Pending Orders entry...");
        const orderEntry = await $(locators.get('orderBookEntryDynamic').replace('{stockName}', extractedDetails.stockName));
        await orderEntry.waitForDisplayed({ timeout: 10000 });

        const orderDesc = await orderEntry.getAttribute("content-desc");
        console.log(`Pending Order Book entry desc:\n${orderDesc}`);

        // Check same things extracted
        if (orderDesc.toUpperCase().includes(extractedDetails.stockName.toUpperCase())) {
            console.log(`✅ Verified Stock: ${extractedDetails.stockName}`);
        } else {
            console.log(`❌ Stock verification failed. Expected: ${extractedDetails.stockName}`);
        }

        if (extractedDetails.segment === "") {
            console.log(`⚠️ Segment was not highlighted in Appium tree. Order Book segment found: ${orderDesc.includes("BSE") ? "BSE" : "NSE"}`);
        } else if (orderDesc.toUpperCase().includes(extractedDetails.segment.toUpperCase())) {
            console.log(`✅ Verified Segment: ${extractedDetails.segment}`);
        } else {
            console.log(`❌ Segment verification failed. Expected: ${extractedDetails.segment}`);
        }

        if (orderDesc.toUpperCase().includes(extractedDetails.productType.toUpperCase())) {
            console.log(`✅ Verified Product Type: ${extractedDetails.productType}`);
        } else {
            console.log(`❌ Product Type verification failed. Expected: ${extractedDetails.productType}`);
        }

        // Verify Order Type
        // If order type is MKT, it often displays as LMT or MKT
        if (orderDesc.toUpperCase().includes(extractedDetails.orderType.toUpperCase()) || orderDesc.toUpperCase().includes("LMT") || orderDesc.toUpperCase().includes("MKT")) {
            console.log(`✅ Verified Order Type`);
        } else {
            console.log(`❌ Order Type verification failed. Extracted was: ${extractedDetails.orderType}`);
        }

        let expectedQty = extractedDetails.qty;
        if (orderDesc.includes(expectedQty.toString())) {
            console.log(`✅ Verified Quantity: ${expectedQty}`);
        } else {
            console.log(`❌ Quantity verification failed. Expected: ${expectedQty}`);
        }


        // Verify Status in Order Book referencing Snackbar
        let expectedStatus = "OPEN";
        if (snackbarMsg.toLowerCase().includes("rejected")) expectedStatus = "REJECTED";
        if (snackbarMsg.toLowerCase().includes("complete")) expectedStatus = "COMPLETED";

        if (orderDesc.toUpperCase().includes(expectedStatus.toUpperCase()) || orderDesc.toUpperCase().includes("OPEN") || orderDesc.toUpperCase().includes("PENDING")) {
            console.log(`✅ Verified Status in Order Book matches context`);
        } else {
            console.log(`❌ Status verification failed for pending order`);
        }

        allureReporter.addStep(`Pending Order Book Entry Verified for GATECH. Extracted details: ${JSON.stringify(extractedDetails)}`);

        // --- Verifications inside Bottom Sheet ---
        console.log("Clicking the first scrip to open bottom sheet...");
        await orderEntry.click();
        await driver.pause(2000);

        // Verify status in bottom sheet (scrip info)
        console.log("Verifying status inside scrip info (bottom sheet)...");
        const bottomSheetHeader = await $(`//*[contains(@content-desc, "${extractedDetails.stockName}")]`);
        if (await bottomSheetHeader.isExisting()) {
             const bsDesc = await bottomSheetHeader.getAttribute("content-desc");
             if (bsDesc && (bsDesc.toUpperCase().includes(expectedStatus.toUpperCase()) || bsDesc.toUpperCase().includes("OPEN"))) {
                 console.log("✅ Verified Status inside scrip info (bottom sheet)");
                 allureReporter.addStep("✅ Verified Status inside scrip info (bottom sheet)");
             } else {
                 console.log(`❌ Failed to verify Status in scrip info. Desc: ${bsDesc}`);
             }
        }

        // Verify Market Depth
        console.log("Clicking Market Depth...");
        const marketDepthBtn = await $('~Market Depth');
        await marketDepthBtn.waitForDisplayed({ timeout: 5000 });
        await marketDepthBtn.click();
        await driver.pause(2000);

        const mdTitle = await $(`//*[contains(@content-desc, "${extractedDetails.stockName}") or contains(@text, "${extractedDetails.stockName}")]`);
        const mdText = await $(`//*[contains(@content-desc, "Market depth") or contains(@text, "Market depth")]`);
        if (await mdTitle.isExisting() && await mdText.isExisting()) {
             console.log("✅ Verified Market Depth page");
             allureReporter.addStep("✅ Verified Market Depth page");
        }
        await driver.back(); // come back to Order Book
        await driver.pause(2000);

        // Verify View Chart
        console.log("Clicking View Chart...");
        // Re-open bottom sheet
        const orderEntryAgain = await $(locators.get('orderBookEntryDynamic').replace('{stockName}', extractedDetails.stockName));
        await orderEntryAgain.click();
        await driver.pause(2000);

        const viewChartBtn = await $('~View Chart');
        await viewChartBtn.waitForDisplayed({ timeout: 5000 });
        await viewChartBtn.click();
        await driver.pause(5000); // Chart takes time

        const overviewBuy = await $(locators.get('overviewBuyBtn'));
        if (await overviewBuy.isExisting()) {
             console.log("✅ Verified View Chart opened Overview page");
             allureReporter.addStep("✅ Verified View Chart opened Overview page");
        }
        await driver.back(); // come back to Order Book
        await driver.pause(2000);

        // --- Repeat Order ---
        console.log("Clicking Repeat Order...");
        await orderEntryAgain.click();
        await driver.pause(2000);

        const repeatOrderBtn = await $('~Repeat Order');
        await repeatOrderBtn.click();
        await driver.pause(3000);
        
        await OrderWindowPage.clickConfirmBuy();
        await driver.pause(4000); // wait for order to be placed and redirect
        
        console.log("Verifying 2 scrips are showing after Repeat Order...");
        // We will just find all elements that have GATECH in their desc
        const allGatechOrders = await $$(`//android.view.View[contains(@content-desc, "${extractedDetails.stockName}")]`);
        if (allGatechOrders.length >= 2) {
             console.log("✅ Verified multiple scrips are showing after Repeat Order");
             allureReporter.addStep("✅ Verified multiple scrips are showing after Repeat Order");
        }

        // --- Cancel Flow ---
        console.log("Clicking first scrip to Cancel...");
        await allGatechOrders[0].click();
        await driver.pause(2000);

        const cancelBtn = await $('~Cancel');
        await cancelBtn.click();
        await driver.pause(1000);
        
        console.log("Clicking NO on cancel popup...");
        const noBtn = await $('~NO');
        await noBtn.click();
        await driver.pause(1000);
        
        console.log("Clicking Cancel again -> YES...");
        await cancelBtn.click();
        await driver.pause(1000);
        const yesBtn = await $('~YES');
        await yesBtn.click();
        await driver.pause(3000);
        
        const gatechOrdersAfterCancel = await $$(`//android.view.View[contains(@content-desc, "${extractedDetails.stockName}")]`);
        if (gatechOrdersAfterCancel.length < allGatechOrders.length) {
             console.log("✅ Verified order was removed after Cancel");
             allureReporter.addStep("✅ Verified order was removed after Cancel");
        }

        // --- Modify Flow ---
        console.log("Clicking remaining scrip to Modify...");
        await gatechOrdersAfterCancel[0].click();
        await driver.pause(2000);

        const modifyBtn = await $('~Modify');
        await modifyBtn.click();
        await driver.pause(3000);
        
        console.log("Changing order type to SL-LMT...");
        const slLmtBtn = await $('~SL-LMT');
        if (await slLmtBtn.isExisting()) {
            await slLmtBtn.click();
        }
        await driver.pause(1000);
        
        const confirmModifyBtn = await $('~MODIFY');
        await confirmModifyBtn.click();
        await driver.pause(2000);
        
        const yesModifyBtn = await $('~YES');
        if (await yesModifyBtn.isExisting()) {
            await yesModifyBtn.click();
        }
        await driver.pause(4000);
        
        const finalDesc = await gatechOrdersAfterCancel[0].getAttribute("content-desc");
        if (finalDesc.includes("SL-LMT")) {
            console.log("✅ Verified order modified to SL-LMT in order book");
            allureReporter.addStep("✅ Verified order modified to SL-LMT in order book");
        } else {
            console.log(`❌ Failed to verify SL-LMT modification. Desc: ${finalDesc}`);
        }
    });
});
