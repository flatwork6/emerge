import locators from '../utils/locatorHelper.js'
import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'testdata.env') })

import allure from '@wdio/allure-reporter'
import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'
import ProfilePage from '../pageobjects/profile.page.js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import WatchlistPage from '../pageobjects/watchlist.page.js'
import segmentGuard from '../utils/segmentGuard.js'
import testDataHelper from '../utils/testDataHelper.js'


describe('Should open watchlist, search and add scrips and remove if it is already present', () => {
  it('should search, add, remove stocks successfully across all watchlists', async () => {
    const orderTestData = testDataHelper.getOrderTestData()

    console.log("\nStarting Watchlist Add Scrip Flow for all watchlists...")

    // Extract Trading Privileges from UI to populate segmentGuard
    await ProfilePage.openTradingPrivileges()
    await ProfilePage.extractActiveSegments()
    await ProfilePage.clickProfileBackButton()
    await ProfilePage.clickAccountsAndServicesCrossButton()

    // 1. Click Watchlist Icon from footer
    await ProfilePage.openWatchlist()

    // Dynamically fetch watchlists based on the logged-in user's account
    let watchlists = await WatchlistPage.getAllWatchlistNames();

    if (!watchlists || watchlists.length === 0) {
      // Fallback to testDataHelper if dynamic extraction fails completely
      watchlists = testDataHelper.getWatchlists();
    }

    // Process standard watchlists sequentially
    for (let i = 0; i < watchlists.length; i++) {
      const wlName = watchlists[i]
      console.log(`\n========================================`)
      console.log(`Processing Watchlist ${i + 1}/${watchlists.length}: '${wlName}'`)
      console.log(`========================================`)

      // For 1st watchlist, no need to open dropdown (already selected by default).
      // For 2nd, 3rd, 4th, 5th watchlists, open dropdown using previous watchlist name and select target watchlist.
      if (i > 0) {
        const prevWlName = watchlists[i - 1]
        await WatchlistPage.pullDownToRefresh();
        await driver.pause(500)
        await WatchlistPage.openWatchListDropdown(prevWlName)
        await WatchlistPage.clickWatchlistByName(wlName)
      }

      if (i < 1) {
        // Clean existing scrips if present
        await WatchlistPage.cleanExistingScripsIfPresent(orderTestData, wlName)

        // Open search
        await WatchlistPage.clickSearchIcon()

        // Process scrip additions using testData.csv
        for (const record of orderTestData) {
          const { symbol, segment } = record
          console.log(`\n--- Adding Scrip: '${symbol}' | Segment: '${segment}' ---`)

          const reqSeg = segment.trim().toUpperCase()

          // Check if segment is active in extracted account privileges
          const isEnabled = reqSeg === 'ALL' || segmentGuard.isSegmentEnabled(reqSeg)
          if (!isEnabled) {
            const skipMsg = `🛑 [SEGMENT RESTRICTION]: Segment '${reqSeg}' is INACTIVE / DISABLED for this account. Skipping scrip '${symbol}'.`
            console.log(skipMsg)
            allure.addStep(skipMsg)
            continue
          }

          // Type Scrip Name
          await WatchlistPage.enterScripName(symbol)

          // Select Segment Filter Chip (e.g. 'ALL', 'NSE', 'BSE', 'NFO', 'BFO', 'CDS', 'BCD', 'MCX')
          await WatchlistPage.selectExchangeFilter(reqSeg)

          // Add scrip
          await WatchlistPage.addFirstScripToWatchlist(symbol)
        }

        // Close search overlay after processing current watchlist scrips
        await WatchlistPage.closeSearch()
        await driver.pause(1000)
      } else {
        console.log(`\n--- Skipping Adding/Removing/Searching for Watchlist: '${wlName}' ---`)
      }

      // Perform Heatmap verification for current Watchlist
      console.log(`\n--- Running Heatmap Verification for Watchlist: '${wlName}' ---`)
      const listCount = await WatchlistPage.getWatchlistStockCount()

      await WatchlistPage.clickHeatMapView()

      // Heatmap % view count (Advance + Decline badges)
      const initPercent = await WatchlistPage.getHeatmapStockCount(listCount)

      await WatchlistPage.switchHeatmapDisplay('value')

      // Heatmap Val view count (Advance + Decline badges)
      const valCount = await WatchlistPage.getHeatmapStockCount(listCount)

      await WatchlistPage.switchHeatmapDisplay('percent')

      const hlSummary =
        `Watchlist '${wlName}' | ` +
        `List View Count: ${listCount} | ` +
        `Heatmap %: ${initPercent} | ` +
        `Heatmap Val: ${valCount}`

      console.log(hlSummary)
      allure.addStep(hlSummary)

      // Verify stock overview navigation from heatmap (only for one stock)
      const stockName = await WatchlistPage.clickFirstHeatmapStock();
      if (stockName) {
        const overviewTitle = await WatchlistPage.getStockOverviewTitle();
        if (!overviewTitle.toLowerCase().includes(stockName.toLowerCase())) {
          console.log(`Warning: Overview title ${overviewTitle} does not match stock ${stockName}`);
        }
        const overviewBackBtn = await WatchlistPage.stockOverviewBackButton;
        await overviewBackBtn.click();
        await driver.pause(1000);
      }

      // Close Heatmap to return to Watchlist list view for the next iteration
      await WatchlistPage.clickHeatmapBackButton()
    }

    // Process Index watchlist (open dropdown using last active watchlist name, select Index, run list & heatmap verification)
    console.log(`\n========================================`)
    console.log(`Processing Index Watchlist`)
    console.log(`========================================`)
    const lastWlName = watchlists[watchlists.length - 1]
    await WatchlistPage.openWatchListDropdown(lastWlName)
    await WatchlistPage.clickWatchlistByName('Index')
    await WatchlistPage.scrollIndexWatchlist()

    // Return back to 1st watchlist and close dropdown
    console.log(`\n========================================`)
    console.log(`Returning to 1st Watchlist '${watchlists[0]}' & Closing Dropdown`)
    console.log(`========================================`)
    await WatchlistPage.openWatchListDropdown('Index')
    await WatchlistPage.clickWatchlistByName(watchlists[0])
  })
})


describe('Watchlist Drag and Drop Validation', () => {
  it('Should drag and drop a scrip, save the manual ordering popup, and drag again', async () => {
    console.log('\n--- Validating Drag and Drop Ordering ---')
    await WatchlistPage.verifyDragAndDrop()
  })
})



describe('Market Watch Settings Validation', () => {
  it('should open and close the market watch settings bottom sheet and verify sorting', async () => {
    console.log(`\n========================================`)
    console.log(`Validating Market Watch Settings Sorting`)
    console.log(`========================================`)

    const sortOptions = [
      { key: 'alphabeticalSorting', type: 'A-Z' },
      { key: 'percentSorting', type: '%' },
      { key: 'ltpSorting', type: 'LTP' },
      { key: 'exchangeSorting', type: 'EXH' }
    ];

    for (const sortOption of sortOptions) {
      console.log(`\n--- Starting Sort Verification for ${sortOption.type} ---`);
      // First click - we don't know the initial state, just verify it sorted in SOME direction
      const detectedFirstDir = await WatchlistPage.performAndVerifySort(sortOption.key, sortOption.type, null);

      // Second click - must be the REVERSE of the first click
      await WatchlistPage.performAndVerifySort(sortOption.key, sortOption.type, !detectedFirstDir);
    }

    console.log(`\n========================================`)
    console.log(`Validating Open/Close Price Toggle`)
    console.log(`========================================`)
    await WatchlistPage.verifyOpenClosePriceChange();

    console.log(`\n========================================`)
    console.log(`Validating Change Format Options`)
    console.log(`========================================`)
    await WatchlistPage.verifyChangeFormatOptions();

    console.log(`\n========================================`)
    console.log(`Validating Show Direction Toggle`)
    console.log(`========================================`)
    await WatchlistPage.verifyShowDirectionToggle();
  })
})

describe('Watchlist Pinning Validation', () => {
  let stocksToPin = [];

  before(async () => {
    const csvPath = path.resolve(process.cwd(), 'test/data/optionChainStocks.csv');
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const records = parse(fileContent, { columns: true, skip_empty_lines: true });
      stocksToPin = records.map(r => r.STOCKNAME);
    } else {
      stocksToPin = ['TCS-EQ', 'INFY-EQ'];
    }
  });

  it('should pin a stock, verify it is pinned, logout, login, and verify it is still pinned', async () => {
    console.log('\n--- Validating Watchlist Pinning ---')
    // 1. Pin TCS-EQ to Favorite 1
    await WatchlistPage.verifyWatchlistPinning(stocksToPin[0], 1)

    // 2. Pin INFY-EQ to Favorite 2
    await WatchlistPage.verifyWatchlistPinning(stocksToPin[1], 2)

    // // 3. Logout
    console.log('\n--- Logging out to verify persistence ---')
    await ProfilePage.logout()

    // 4. Login
    console.log('\n--- Logging back in ---')
    await LoginPage.enterPassword(process.env.PASSWORD)
    await LoginPage.enterTotp(process.env.TOTP)
    await LoginPage.clickLogin()
    await SetBiometric.chooseUserChoice()

    // 5. Verify pinned stocks after login
    console.log('\n--- Verifying pinned stocks persist after relogin ---')
    if (stocksToPin[0]) await WatchlistPage.verifyPinnedStock(stocksToPin[0], 1)
    if (stocksToPin[1]) await WatchlistPage.verifyPinnedStock(stocksToPin[1], 2)
  })
})

describe('Edit Watchlist Validation', () => {
  it('should navigate watchlists and remove a stock', async () => {
    console.log(`\n========================================`)
    console.log(`Validating Edit Watchlist`)
    console.log(`========================================`)

    // Step 1: Click Watchlist tab if not active
    await WatchlistPage.clickWatchlistTab();

    // Step 2: Extract watchlist names from the dropdown
    const extractedNames = await WatchlistPage.getAllWatchlistNames();

    // Step 3: Open edit mode
    await WatchlistPage.openEditWatchlist();

    // Step 4: Verify all watchlist names against the ones from the dropdown
    await WatchlistPage.verifyAllWatchlistsByClickingTabs(extractedNames);

    // Step 5: Switch back to the first watchlist (which should have stocks)
    if (extractedNames.length > 0) {
        await WatchlistPage.clickEditWatchlistTabByName(extractedNames[0]);
    }

    // Step 6: Delete the first two stocks from the currently active watchlist
    await WatchlistPage.deleteStockByRowIndex(0);
    await WatchlistPage.deleteStockByRowIndex(0);
  });
});


describe('Market Watch Additional Scenarios', () => {
  // it('should show snackbar when adding an already present scrip', async () => {
  //   await WatchlistPage.clickWatchlistTab();
  //   await WatchlistPage.clickSearchIcon();
  //   await WatchlistPage.enterScripName('Wipro-eq');
  //   await WatchlistPage.selectExchangeFilter('ALL');

  //   await WatchlistPage.addFirstScripToWatchlist();
  //   await WatchlistPage.addFirstScripToWatchlist();

  //   const snackbar = await $(locators.get('androidnewUiSelectortextContai_nh8f')).catch(() => null) ||
  //                    await $(locators.get('containscontentdescalreadypres_2ixn')).catch(() => null);

  //   if (snackbar) {
  //     await snackbar.waitForDisplayed({ timeout: 2000 }).catch(() => {});
  //     const isDisplayed = await snackbar.isDisplayed();
  //     if (!isDisplayed) throw new Error("Snackbar not displayed");
  //   } else {
  //     throw new Error("Snackbar not found");
  //   }

  //   await WatchlistPage.closeSearch();
  // });

  it('should verify segment chips and segments shown below scrip name for tcs', async () => {
    await WatchlistPage.clickSearchIcon();
    await WatchlistPage.enterScripName(process.env.TEST_SCRIP_NAME_TCS);

    const segmentsToTest = [process.env.TEST_SEGMENT_NSE, process.env.TEST_SEGMENT_BSE, process.env.TEST_SEGMENT_NFO, process.env.TEST_SEGMENT_BFO];
    for (const segment of segmentsToTest) {
      await WatchlistPage.selectExchangeFilter(segment);
      await driver.pause(1000);

      const results = await WatchlistPage.getAllSearchResults();
      const tcsResults = results.filter(r => r.toUpperCase().startsWith('TCS'));
      
      if (tcsResults.length === 0) {
        throw new Error(`No TCS search results found after selecting segment ${segment}`);
      }
      const desc = tcsResults[0];
      if (!desc.includes(segment)) {
        throw new Error(`Expected segment ${segment} not found in top card desc: ${desc}`);
      }else{
        allure.addStep("✅Successfull verification of scrip under all segments")
      }
    }
    await WatchlistPage.closeSearch();
  });

  it('should verify dname format for BFO segment', async () => {
    await WatchlistPage.clickSearchIcon();
    await WatchlistPage.enterScripName(process.env.TEST_SCRIP_NAME_TCS);
    await WatchlistPage.selectExchangeFilter(process.env.TEST_SEGMENT_BFO);
    await driver.pause(2000);

    const initialResults = await WatchlistPage.getAllSearchResults();
    const initialTcsResults = initialResults.filter(r => r.toUpperCase().startsWith('TCS'));
    if (initialTcsResults.length === 0) throw new Error("No TCS results found initially");

    const firstScrip = initialTcsResults[0].split('\n')[0].trim();
    if (/TCS \d{2}[A-Z]{3} FUT/i.test(firstScrip)) {
      console.log("✅First scrip format success: " + firstScrip);
    }
    else {
      throw new Error("First scrip mismatch" + firstScrip);
    }

    // Scroll down to the end to catch PE/CE options
    await WatchlistPage.scrollSearchResultsToBottom();

    const finalResults = await WatchlistPage.getAllSearchResults();
    const finalTcsResults = finalResults.filter(r => r.toUpperCase().startsWith('TCS'));
    if (finalTcsResults.length === 0) throw new Error("No TCS results found at bottom");

    const lastScrip = finalTcsResults[finalTcsResults.length - 1].split('\n')[0].trim();
    if (/TCS \d{2}[A-Z]{3} \d+(?:\.\d+)? (PE|CE)/i.test(lastScrip)) {
      console.log("✅Last scrip format success: " + lastScrip);
    }
    else {
      throw new Error("First scrip mismatch" + firstScrip);
    }

    await WatchlistPage.closeSearch();
  });
});
