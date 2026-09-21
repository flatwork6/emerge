import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import allure from '@wdio/allure-reporter'
import FundsPage from '../pageobjects/funds.page.js'
import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'
import ProfilePage from '../pageobjects/profile.page.js'
import WatchlistPage from '../pageobjects/watchlist.page.js'
import PortfolioPage from '../pageobjects/portfolio.page.js'
import RiskDisclosure from '../pageobjects/riskDisclosure.js'
import segmentGuard from '../utils/segmentGuard.js'
import testDataHelper from '../utils/testDataHelper.js'


// describe('Emerge Login & Segment Guard Validation', () => {
//   it('should login successfully', async () => {

//     // await LoginPage.securityWarning();

//     // await LoginPage.getNotification();

//     // await LoginPage.clickUseAnotherAccount()

    // await LoginPage.enterUserName(process.env.USER_ID)

    // await LoginPage.enterPassword(process.env.PASSWORD)

    // await LoginPage.enterTotp(process.env.TOTP)

    // await LoginPage.clickLogin()

//     // Wait dynamically for either Biometric Screen OR Risk Disclosure popup
//     const detected = await driver.waitUntil(async () => {
//       const hasBiometric = await SetBiometric.userChoice.isExisting() && await SetBiometric.userChoice.isDisplayed();
//       if (hasBiometric) return 'biometric';

//       const hasRisk = await RiskDisclosure.acceptRiskDisclosureBtn.isExisting() && await RiskDisclosure.acceptRiskDisclosureBtn.isDisplayed();
//       if (hasRisk) return 'risk';

//       return false;
//     }, {
//       timeout: 120000,
//       timeoutMsg: 'Neither Biometric screen nor Risk Disclosure appeared within 2 minutes'
//     });

//     if (detected === 'risk') {
//       await RiskDisclosure.acceptRiskDisclosureBtn.click();
//       console.log("Risk Disclosure accepted.");

//       // Now wait for Biometric screen to appear after accepting risk
//       await SetBiometric.userChoice.waitForDisplayed({
//         timeout: 120000,
//         timeoutMsg: 'Biometric screen did not appear after Risk Disclosure within 2 minutes'
//       });
//     }

//     await SetBiometric.chooseUserChoice();

//     console.log("Login successful! Navigating to profile...")

//   })
// })

// describe('Trading previliges validation', () => {
//   it('should extract trading previliges successfully', async () => {
//     // Extract Trading Privileges from UI
//     await ProfilePage.openTradingPrivileges()
//     await ProfilePage.extractActiveSegments()

//     // Load test data dynamically from testData.csv
//     const orderTestData = testDataHelper.getOrderTestData()
//     console.log(`Loaded ${orderTestData.length} scrip records from testData.csv`)

//     for (const testCase of orderTestData) {
//       const { segment, symbol } = testCase
//       const isEnabled = segmentGuard.isSegmentEnabled(segment)
//       const logMsg = `[DYNAMIC CHECK]: Scrip '${symbol}' on Segment '${segment}' | UI Status: ${isEnabled ? 'ACTIVE/ENABLED' : 'INACTIVE/DISABLED'}`
//       console.log(`\n--- ${logMsg} ---`)

//       try {
//         segmentGuard.assertCanPlaceOrder(segment, symbol)
//         const allowedMsg = `✅ [ORDER ALLOWED]: Order placement allowed for '${symbol}' on segment '${segment}'.`
//         console.log(allowedMsg)
//         allure.addStep(allowedMsg)
//       } catch (err) {
//         const restrictedMsg = `🛑 [ORDER RESTRICTED]: Order placement blocked for '${symbol}' on segment '${segment}' - Account privilege disabled.`
//         console.log(restrictedMsg)
//         allure.addStep(restrictedMsg)
//       }
//     }

//     await ProfilePage.clickProfileBackButton()

//     await ProfilePage.clickAccountsAndServicesCrossButton()

//   })
// })

// describe('Should open watchlist, search and add scrips and remove if it is already present', () => {
//   it('should search, add, remove stocks successfully across all watchlists', async () => {
//     const orderTestData = testDataHelper.getOrderTestData()

//     console.log("\nStarting Watchlist Add Scrip Flow for all watchlists...")

//     // 1. Click Watchlist Icon from footer
//     await ProfilePage.openWatchlist()

//     // Dynamically fetch watchlists based on the logged-in user's account
//     let watchlists = await WatchlistPage.getAllWatchlistNames();

//     if (!watchlists || watchlists.length === 0) {
//       // Fallback to testDataHelper if dynamic extraction fails completely
//       watchlists = testDataHelper.getWatchlists();
//     }

//     // Process standard watchlists sequentially
//     for (let i = 0; i < watchlists.length; i++) {
//       const wlName = watchlists[i]
//       console.log(`\n========================================`)
//       console.log(`Processing Watchlist ${i + 1}/${watchlists.length}: '${wlName}'`)
//       console.log(`========================================`)

//       // For 1st watchlist, no need to open dropdown (already selected by default).
//       // For 2nd, 3rd, 4th, 5th watchlists, open dropdown using previous watchlist name and select target watchlist.
//       if (i > 0) {
//         const prevWlName = watchlists[i - 1]
//         await WatchlistPage.openWatchListDropdown(prevWlName)
//         await WatchlistPage.clickWatchlistByName(wlName)
//       }

//       // Clean existing scrips if present
//       await WatchlistPage.cleanExistingScripsIfPresent(orderTestData, wlName)

//       // Open search
//       await WatchlistPage.clickSearchIcon()

//       // Process scrip additions using testData.csv
//       for (const record of orderTestData) {
//         const { symbol, segment } = record
//         console.log(`\n--- Adding Scrip: '${symbol}' | Segment: '${segment}' ---`)

//         const reqSeg = segment.trim().toUpperCase()

//         // Check if segment is active in extracted account privileges
//         const isEnabled = reqSeg === 'ALL' || segmentGuard.isSegmentEnabled(reqSeg)
//         if (!isEnabled) {
//           const skipMsg = `🛑 [SEGMENT RESTRICTION]: Segment '${reqSeg}' is INACTIVE / DISABLED for this account. Skipping scrip '${symbol}'.`
//           console.log(skipMsg)
//           allure.addStep(skipMsg)
//           continue
//         }

//         // Type Scrip Name
//         await WatchlistPage.enterScripName(symbol)

//         // Select Segment Filter Chip (e.g. 'ALL', 'NSE', 'BSE', 'NFO', 'BFO', 'CDS', 'BCD', 'MCX')
//         await WatchlistPage.selectExchangeFilter(reqSeg)

//         // Add scrip
//         await WatchlistPage.addFirstScripToWatchlist(symbol)
//       }

//       // Close search overlay after processing current watchlist scrips
//       await WatchlistPage.closeSearch()
//       await driver.pause(1000)

//       // Perform Heatmap verification for current Watchlist
//       console.log(`\n--- Running Heatmap Verification for Watchlist: '${wlName}' ---`)
//       const listCount = await WatchlistPage.getWatchlistStockCount()

//       await WatchlistPage.clickHeatMapView()

//       // Heatmap % view count (Advance + Decline badges)
//       const initPercent = await WatchlistPage.getHeatmapStockCount(listCount)

//       await WatchlistPage.switchHeatmapDisplay('value')

//       // Heatmap Val view count (Advance + Decline badges)
//       const valCount = await WatchlistPage.getHeatmapStockCount(listCount)

//       await WatchlistPage.switchHeatmapDisplay('percent')

//       const hlSummary =
//         `Watchlist '${wlName}' | ` +
//         `List View Count: ${listCount} | ` +
//         `Heatmap %: ${initPercent} | ` +
//         `Heatmap Val: ${valCount}`

//       console.log(hlSummary)
//       allure.addStep(hlSummary)

//       await WatchlistPage.clickHeatmapBackButton()
//     }

//     // Process Index watchlist (open dropdown using last active watchlist name, select Index, run list & heatmap verification)
//     console.log(`\n========================================`)
//     console.log(`Processing Index Watchlist`)
//     console.log(`========================================`)
//     const lastWlName = watchlists[watchlists.length - 1]
//     await WatchlistPage.openWatchListDropdown(lastWlName)
//     await WatchlistPage.clickWatchlistByName('Index')
//     await WatchlistPage.scrollIndexWatchlist()

//     // Return back to 1st watchlist and close dropdown
//     console.log(`\n========================================`)
//     console.log(`Returning to 1st Watchlist '${watchlists[0]}' & Closing Dropdown`)
//     console.log(`========================================`)
//     await WatchlistPage.openWatchListDropdown('Index')
//     await WatchlistPage.clickWatchlistByName(watchlists[0])
//   })
// })


// describe('Watchlist Drag and Drop Validation', () => {
//   it('Should drag and drop a scrip, save the manual ordering popup, and drag again', async () => {
//     console.log('\n--- Validating Drag and Drop Ordering ---')
//     await WatchlistPage.verifyDragAndDrop()
//   })
// })



// describe('Market Watch Settings Validation', () => {
//   it('should open and close the market watch settings bottom sheet and verify sorting', async () => {
//     console.log(`\n========================================`)
//     console.log(`Validating Market Watch Settings Sorting`)
//     console.log(`========================================`)

//     const sortOptions = [
//       { key: 'alphabeticalSorting', type: 'A-Z' },
//       { key: 'percentSorting', type: '%' },
//       { key: 'ltpSorting', type: 'LTP' },
//       { key: 'exchangeSorting', type: 'EXH' }
//     ];

//     for (const sortOption of sortOptions) {
//       console.log(`\n--- Starting Sort Verification for ${sortOption.type} ---`);
//       // First click - we don't know the initial state, just verify it sorted in SOME direction
//       const detectedFirstDir = await WatchlistPage.performAndVerifySort(sortOption.key, sortOption.type, null);

//       // Second click - must be the REVERSE of the first click
//       await WatchlistPage.performAndVerifySort(sortOption.key, sortOption.type, !detectedFirstDir);
//     }

//     console.log(`\n========================================`)
//     console.log(`Validating Open/Close Price Toggle`)
//     console.log(`========================================`)
//     await WatchlistPage.verifyOpenClosePriceChange();

//     console.log(`\n========================================`)
//     console.log(`Validating Change Format Options`)
//     console.log(`========================================`)
//     await WatchlistPage.verifyChangeFormatOptions();

//     console.log(`\n========================================`)
//     console.log(`Validating Show Direction Toggle`)
//     console.log(`========================================`)
//     await WatchlistPage.verifyShowDirectionToggle();
//   })
// })

// describe('Watchlist Pinning Validation', () => {
//   it('should pin a stock, verify it is pinned, logout, login, and verify it is still pinned', async () => {
//     console.log('\n--- Validating Watchlist Pinning ---')
//     // // 1. Pin TCS-EQ to Favorite 1
//     // await WatchlistPage.verifyWatchlistPinning("TCS-EQ", 1)

//     // // 2. Pin INFY-EQ to Favorite 2
//     // await WatchlistPage.verifyWatchlistPinning("INFY-EQ", 2)

//     // // 3. Logout
//     console.log('\n--- Logging out to verify persistence ---')
//     await ProfilePage.logout()

//     // 4. Login
//     console.log('\n--- Logging back in ---')
//     await LoginPage.enterPassword(process.env.PASSWORD)
//     await LoginPage.enterTotp(process.env.TOTP)
//     await LoginPage.clickLogin()
//     await SetBiometric.chooseUserChoice()

//     // 5. Verify pinned stocks after login
//     console.log('\n--- Verifying pinned stocks persist after relogin ---')
//     await WatchlistPage.verifyPinnedStock("TCS-EQ", 1)
//     await WatchlistPage.verifyPinnedStock("INFY-EQ", 2)
//   })
// })

// describe('Holdings Verification', () => {
//   it('should extract holding and verify its quantity in watchlist', async () => {
//     console.log(`\n========================================`)
//     console.log(`Validating Holdings Symbol in Watchlist`)
//     console.log(`========================================`)

//     // Step 1: Navigate to Portfolio -> Holdings

//     await PortfolioPage.openPortfolio();
//     await PortfolioPage.openHoldings();

//     // Step 2: Extract a holding
//     const holding = await PortfolioPage.extractFirstHolding();
//     if (holding === "No Holdings found") {
//         console.log("No Holdings found. Ending test.");
//         return;
//     }
//     console.log(`Extracted holding: ${holding.name}, ${holding.qty}`);

//     // Step 3: Go back to Watchlist
//     await WatchlistPage.clickWatchlistTab();


//     // Step 5: Verify holdings symbol (blue bag) and quantity in Watchlist
// await WatchlistPage.verifyHoldingSymbol(holding.name, holding.qty);
//   });
// })

// describe('GTT Verification', () => {
//   it('should extract GTT stock from Orders and verify GTT symbol in watchlist', async () => {
//     console.log(`\n========================================`)
//     console.log(`Validating GTT Symbol in Watchlist`)
//     console.log(`========================================`)

//     // Step 1: Navigate to Orders -> GTT
//     const OrdersPage = require('../pageobjects/orders.page.js').default;
//     await OrdersPage.openOrders();
//     await OrdersPage.openGTT();

//     // Step 2: Extract a GTT stock
//     const gttStockName = await OrdersPage.extractFirstGTTStock();
//     if (gttStockName === "No Gtt orders found") {
//         console.log("No GTT orders found. Ending test.");
//         return;
//     }
//     console.log(`Extracted GTT stock: ${gttStockName}`);

//     // Step 3: Go back to Watchlist
//     await WatchlistPage.clickWatchlistTab();

//     // Step 4: Verify GTT symbol in Watchlist search results
//     await WatchlistPage.verifyGTTSymbol(gttStockName);
//   });
// })

// describe('Positions Verification', () => {
//   it('should extract position stock from Portfolio and verify position symbol in watchlist', async () => {
//     console.log(`\n========================================`)
//     console.log(`Validating Positions Symbol in Watchlist`)
//     console.log(`========================================`)

//     // Step 1: Navigate to Portfolio -> Positions
//     //const PortfolioPage = require('../pageobjects/portfolio.page.js').default;
//     await PortfolioPage.openPortfolio('Positions');

//     // Step 2: Extract a Positions stock
//     const position = await PortfolioPage.extractFirstPosition();
//     if (position === "No Positions found") {
//         console.log("No Positions found. Ending test.");
//         return;
//     }
//     console.log(`Extracted Position stock: ${position.name} with Qty: ${position.qty}`);

//     // Step 3: Go back to Watchlist
//     await WatchlistPage.clickWatchlistTab();

//     // Step 4: Verify Positions symbol in Watchlist search results
//     await WatchlistPage.verifyPositionSymbol(position.name, position.qty);
//   });
// })


// describe('Alerts Verification', () => {
//   it('should extract Alert stock from Orders and verify Alert symbol in watchlist', async () => {
//     console.log(`\n========================================`)
//     console.log(`Validating Alert Symbol in Watchlist`)
//     console.log(`========================================`)

//     // Step 1: Navigate to Orders -> Alerts
//     const OrdersPage = require('../pageobjects/orders.page.js').default;
//     await OrdersPage.openOrders();
//     await OrdersPage.openAlerts();

//     // Step 2: Extract an Alert stock
//     const alertStockName = await OrdersPage.extractFirstAlertStock();
//     console.log(`Extracted Alert stock: ${alertStockName}`);

//     if (alertStockName === "No Alerts found") {
//         console.log("No Alerts found. Ending test.");
//         return;
//     }

//     // Step 3: Go back to Watchlist
//     await WatchlistPage.clickWatchlistTab();

//     // Step 4: Verify Alert symbol in Watchlist search results
//     await WatchlistPage.verifyAlertSymbol(alertStockName);
//   });
// })


// describe('SIP Verification', () => {
//   it('should extract SIP stock from Orders and verify SIP symbol in watchlist', async () => {
//     console.log(`\n========================================`)
//     console.log(`Validating SIP Symbol in Watchlist`)
//     console.log(`========================================`)

//     // Step 1: Navigate to Orders -> SIP
//     const OrdersPage = require('../pageobjects/orders.page.js').default;
//     await OrdersPage.openOrders();
//     await OrdersPage.openSIP();

//     // Step 2: Extract a SIP stock
//     const sipStockName = await OrdersPage.extractFirstSIPStock();
//     console.log(`Extracted SIP stock: ${sipStockName}`);

//     if (sipStockName === "No sips found") {
//         console.log("No SIPs found. Ending test.");
//         return;
//     }

//     // Step 3: Go back to Watchlist
//     await WatchlistPage.clickWatchlistTab();

//     // Step 4: Verify SIP symbol in Watchlist search results
//     await WatchlistPage.verifySIPSymbol(sipStockName);
//   });
// })





// describe('Edit Watchlist Validation', () => {
//   it('should navigate watchlists and remove a stock', async () => {
//     console.log(`\n========================================`)
//     console.log(`Validating Edit Watchlist`)
//     console.log(`========================================`)

//     // Step 1: Click Watchlist tab if not active
//     await WatchlistPage.clickWatchlistTab();

//     // Step 2: Extract watchlist names from the dropdown
//     const extractedNames = await WatchlistPage.getAllWatchlistNames();

//     // Step 3: Open edit mode
//     await WatchlistPage.openEditWatchlist();

//     // Step 4: Verify all watchlist names against the ones from the dropdown
//     await WatchlistPage.verifyAllWatchlistsByClickingTabs(extractedNames);

//     // Step 5: Switch back to the first watchlist (which should have stocks)
//     if (extractedNames.length > 0) {
//         await WatchlistPage.clickEditWatchlistTabByName(extractedNames[0]);
//     }

//     // Step 6: Delete the first two stocks from the currently active watchlist
//     await WatchlistPage.deleteStockByRowIndex(0);
//     await WatchlistPage.deleteStockByRowIndex(0);
//   });
// });


describe('Funds and Margin Validation', () => {
  it('TC-02: The margin page is scrollable', async () => {
    console.log(`\n--- Validating TC-02: Scrollability ---`)
    await FundsPage.clickFundsTab()
    await FundsPage.verifyScrollability()
  })

  it('TC-03: Available Margin hero card sums only Equity/FNO and Commodity', async () => {
    console.log(`\n--- Validating TC-03: Available Margin Sum ---`)
    await FundsPage.verifyAvailableMarginSum()
  })

  it('TC-04: Donut chart shows the correct "% Used"', async () => {
    console.log(`\n--- Validating TC-04: Donut Chart Percentage ---`)
    await FundsPage.verifyDonutChartPercentage()
  })

  it('TC-05: Total Credits and Utilized sub-values are shown correctly', async () => {
    console.log(`\n--- Validating TC-05: Sub-values match Breakdown ---`)
    await FundsPage.verifySubValuesMatchBreakdown()
  })

  it('TC-06: Peak Margin card shows the correct value', async () => {
    console.log(`\n--- Validating TC-06: Peak Margin ---`)
    await FundsPage.verifyPeakMarginSum()
  })

  it('TC-07: Expiry Margin card shows the correct value', async () => {
    console.log(`\n--- Validating TC-07: Expiry Margin ---`)
    await FundsPage.verifyExpiryMarginSum()
  })

  it('TC-08: Withdraw navigates to a separate screen', async () => {
    console.log(`\n--- Validating TC-08: Withdraw Navigation ---`)
    await FundsPage.clickWithdrawAndVerify()
  })

  it('TC-09 to TC-12 Move Fund navigates to a separate screen or bottom sheet', async () => {
    console.log(`\n--- Validating TC-09 to TC-11: Move Fund Navigation ---`)
    await FundsPage.clickMoveFundAndVerify()
  })

  it('TC-14: Add Funds navigates to a separate screen', async () => {
    console.log(`\n--- Validating TC-14: Add Funds Navigation ---`)
    await FundsPage.clickAddFundsAndVerify()
  })

  it('TC-15: Breakdown table shows the correct 3 tabs', async () => {
    console.log(`\n--- Validating TC-15: Breakdown Tabs ---`)
    await FundsPage.verifyBreakdownTabs()
  })

  it('TC-16: Equity/FNO tab will be selected and visible by default', async () => {
    console.log(`\n--- Validating TC-16: Equity/FNO Tab Selected ---`)
    await FundsPage.verifyEquityFnoTabSelected()
  })

  it('TC-17: Tapping on Commodity column navigates to Commodity', async () => {
    console.log(`\n--- Validating TC-17: Commodity Tab ---`)
    await FundsPage.verifyCommodityTabSelected()
  })

  it('TC-18: Tapping on MTF column navigates to MTF (if enabled)', async () => {
    console.log(`\n--- Validating TC-18: MTF Tab ---`)
    await FundsPage.verifyMtfTabSelected()
  })

  it('TC-19: Expand All reveals every section\'s sub-rows', async () => {
    console.log(`\n--- Validating TC-19: Expand All ---`)
    await FundsPage.clickExpandAllAndVerify()
  })

  it('TC-20: Collapse All hides every section\'s sub-rows', async () => {
    console.log(`\n--- Validating TC-20: Collapse All ---`)
    await FundsPage.clickCollapseAllAndVerify()
  })

  it('TC-21: Total Credits breakdown check in all 3 tabs', async () => {
    console.log(`\n--- Validating Total Credits Breakdown across tabs ---`)
    await FundsPage.verifyTotalCreditsBreakdownAndSum("Equity/FNO", FundsPage.equityOrFnoTab)
    await FundsPage.verifyTotalCreditsBreakdownAndSum("Commodity", FundsPage.commodityTab)
    await FundsPage.verifyTotalCreditsBreakdownAndSum("MTF", FundsPage.mtfTab)
  })

it('TC-22: Utilized value equals sum of intraday margin and deliver/cf margin', async () => {
  console.log(`\n--- Validating TC-22: Utilized Sum ---`)
  await FundsPage.verifyUtilizedSum("Equity/FNO", FundsPage.equityOrFnoTab)
  await FundsPage.verifyUtilizedSum("Commodity", FundsPage.commodityTab)
  await FundsPage.verifyUtilizedSum("MTF", FundsPage.mtfTab)
  await FundsPage.compareSum()
})

  it('TC-23: Expanding Utilization under Equity/FNO reveals TAX, Delivery Margin, Basket Margin, Realized Loss', async () => {
    console.log(`\n--- Validating TC-23: Utilization Breakdown for Equity/FNO---`)
    await FundsPage.verifyEquityOrFnoUtilizationBreakdown()
  })

  it('TC-24: Utilization equals the sum of its sub-rows, per column under Equity/FNO', async () => {
    console.log(`\n--- Validating TC-24: Utilization Sum ---`)
    await FundsPage.verifyEquityOrFnoUtilizationSum()
  })

  it('TC-25: Expanding Utilization under Commodity reveals SPAN, Exposure, Commodity Unrealized MTOM CF', async () => {
    console.log(`\n--- Validating TC-25: Utilization Breakdown ---`)
    await FundsPage.verifyCommodityUtilizationBreakdown()
  })

  it('TC-26: Utilization equals the sum of its sub-rows, per column under Commodity', async () => {
    console.log(`\n--- Validating TC-26: Utilization Sum ---`)
    await FundsPage.verifyCommodityUtilizationSum()
  })

  it('TC-27: Expanding Utilization under MTF reveals Basket Margin and Realized Loss', async () => {
    console.log(`\n--- Validating TC-27: Utilization Breakdown for MTF ---`)
    await FundsPage.verifyMtfUtilizationBreakdown()
  })

  it('TC-28: Utilization equals the sum of its sub-rows, per column under MTF', async () => {
    console.log(`\n--- Validating TC-28: Utilization Sum under MTF ---`)
    await FundsPage.verifyMtfUtilizationSum()
  })

  it('TC-29: Expanding MTOM / Margin percentage reveals Margin percentage and MToM Percentage', async () => {
    console.log(`\n--- Validating TC-29: MTOM Percentage Breakdown ---`)
    await FundsPage.verifyMtomPercentageBreakdown()
  })

  it('TC-30: Collateral breakdown check in all 3 tabs', async () => {
    console.log(`\n--- Validating Collateral Breakdown across tabs ---`)
    await FundsPage.verifyCollateralBreakdown("Equity/FNO", FundsPage.equityOrFnoTab)
    await FundsPage.verifyCollateralBreakdown("Commodity", FundsPage.commodityTab)
    await FundsPage.verifyCollateralBreakdown("MTF", FundsPage.mtfTab)
  })

  it('TC-31: "Utilization Details" is a non-expandable section header', async () => {
    console.log(`\n--- Validating TC-31: Utilization Details Header ---`)
    await FundsPage.verifyUtilizationDetailsHeader()
  })

  it('TC-32: Normal Margin , Intraday Margin and Delivery/CF Margin rows are visible under Utilization Details', async () => {
    console.log(`\n--- Validating TC-32: Utilization Details Rows ---`)
    await FundsPage.verifyUtilizationDetailsRows()
  })

  it('TC-33: Intraday margin shows its sub-rows on clicking chevron', async () => {
    console.log(`\n--- Validating TC-33: Intraday Margin Breakdown ---`)
    await FundsPage.verifyIntradayMarginBreakdown()
  })

  it('TC-34: Sum of intraday margin subrows values equals intraday margin value', async () => {
    console.log(`\n--- Validating TC-34: Intraday Margin Sum ---`)
    await FundsPage.verifyIntradayMarginSum()
  })

  it('TC-35: Expanding Delivery/CF Margin reveals Delivery Margin and matches value', async () => {
    console.log(`\n--- Validating TC-35: Delivery/CF Margin Breakdown across tabs ---`)
    await FundsPage.verifyDeliveryCfMarginBreakdown("Equity/FNO", FundsPage.equityOrFnoTab)
    await FundsPage.verifyDeliveryCfMarginBreakdown("Commodity", FundsPage.commodityTab)
    await FundsPage.verifyDeliveryCfMarginBreakdown("MTF", FundsPage.mtfTab)
  })

  it('TC-36: Normal Margin breakdown check in all 3 tabs', async () => {
    console.log(`\n--- Validating Normal Margin Breakdown across tabs ---`)
    await FundsPage.verifyNormalMarginBreakdownAndSum("Equity/FNO", FundsPage.equityOrFnoTab)
    await FundsPage.verifyNormalMarginBreakdownAndSum("Commodity", FundsPage.commodityTab)
    await FundsPage.verifyNormalMarginBreakdownAndSum("MTF", FundsPage.mtfTab)
  })
})
