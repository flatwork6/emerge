import locators from '../utils/locatorHelper.js'
import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env and testdata.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })
dotenv.config({ path: path.resolve(process.cwd(), 'test/data/testdata.env') })

import allure from '@wdio/allure-reporter'
import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'
import ProfilePage from '../pageobjects/profile.page.js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import WatchlistPage from '../pageobjects/watchlist.page.js'
import segmentGuard from '../utils/segmentGuard.js'
import testDataHelper from '../utils/testDataHelper.js'
const originalLog = console.log;
console.log = function (...args) {
  originalLog.apply(console, args);
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  try {
    allureReporter.addStep(msg);
  } catch (e) { }
};


describe('Should open watchlist, search and add scrips and remove if it is already present', () => {
  it('should search scrip — remove if already present, then add it; verifying search, remove and add', async () => {
    const orderTestData = testDataHelper.getOrderTestData()

    console.log("\nStarting Watchlist Add Scrip Flow for all watchlists...")

    // Extract Trading Privileges from UI to populate segmentGuard
    // await ProfilePage.openTradingPrivileges()
    // await ProfilePage.extractActiveSegments()
    // await ProfilePage.clickProfileBackButton()
    // await ProfilePage.clickAccountsAndServicesCrossButton()

    // ── Step 1: Navigate to Watchlist ─────────────────────────────────────────
    await ProfilePage.openWatchlist()
    await driver.pause(1000)

    // ── Step 2: Resolve active watchlist name ────────────────────────────────
    let watchlists = await WatchlistPage.getAllWatchlistNames()
    if (!watchlists || watchlists.length === 0) {
      watchlists = testDataHelper.getWatchlists()
    }
    const activeWatchlist = watchlists[0]
    console.log(`\nActive Watchlist: '${activeWatchlist}'`)

    // ── Step 3: Open search overlay ──────────────────────────────────────────
    await WatchlistPage.clickSearchIcon()
    await driver.pause(500)

    // ── Step 4: Process scrips from testData.csv (supports multiple stocks with segments) ───
    await WatchlistPage.processScripsOnWatchlist(orderTestData, activeWatchlist)

    // ── Step 5: Close search overlay ────────────────────────────────────────
    await WatchlistPage.closeSearch()
    await driver.pause(1000)

    // ── Step 6: Verify Heatmap Val and % counts for all watchlists ───────────
    console.log('\n--- Verifying Heatmap Val and % counts for all watchlists ---')
    for (let i = 0; i < watchlists.length; i++) {
      const wl = watchlists[i]
      console.log(`\n📌 Checking Heatmap for Watchlist (${i + 1}/${watchlists.length}): '${wl}'`)
      if (i > 0) {
        await WatchlistPage.openWatchListDropdown()
        await driver.pause(1000)
        await WatchlistPage.clickWatchlistByName(wl)
        await driver.pause(1500)
      }
      // For the 1st watchlist (i === 0), also click a stock tile and verify navigation to Stock Overview
      await WatchlistPage.verifyHeatmapCounts(null, i === 0)
    }

    console.log('\n✅ Watchlist Search / Remove / Add & Heatmap Verification Flow completed.')
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
    await driver.back();
    await driver.pause(1500);
  });
});


describe('Market Watch Additional Scenarios', () => {
  it('should show snackbar when adding an already present scrip', async () => {
    // Step 1: Navigate to Watchlist tab and get the first stock name
    // await WatchlistPage.clickWatchlistTab();
    const existingScrip = await WatchlistPage.getFirstWatchlistStockName();
    console.log(`First watchlist stock: ${existingScrip}`);

    // Step 2: Open search and type the stock name
    await WatchlistPage.clickSearchIcon();
    await WatchlistPage.enterScripName(existingScrip);
    await driver.pause(1500); // Let search results load

    // Step 3: Click the green bookmark icon on the Global Search Results row
    // The stock appears twice: once above (already in watchlist) and once below
    // "Global Search Results" with a green bookmark icon. Tapping the bookmark
    // on the global result triggers the "already in Market Watch" snackbar.
    await WatchlistPage.clickGlobalSearchResultBookmark(existingScrip);

    // Step 4: Verify snackbar appears — snackbar is transient so poll with waitUntil
    console.log('Waiting for "already in Market Watch" snackbar...');
    let snackbarFound = false;
    try {
      await driver.waitUntil(async () => {
        // Try the locator first
        try {
          const el = await $(locators.get("alreadypresent"));
          if (await el.isDisplayed().catch(() => false)) return true;
        } catch (e) { }
        // Broad fallback: scan all visible text/content-desc for the snackbar message
        try {
          const allViews = await $$('//*[@content-desc != "" or @text != ""]');
          for (const v of allViews) {
            const desc = await v.getAttribute('content-desc').catch(() => '');
            const text = await v.getAttribute('text').catch(() => '');
            const combined = (desc + ' ' + text).toLowerCase();
            if (combined.includes('already in') || combined.includes('market watch')) {
              return true;
            }
          }
        } catch (e) { }
        return false;
      }, { timeout: 6000, interval: 300, timeoutMsg: 'Snackbar not visible within 6 seconds' });
      snackbarFound = true;
      console.log('✅ Snackbar "already in Market Watch" verified successfully');
    } catch (e) {
      throw new Error(`Snackbar verification failed: ${e.message}`);
    }

    // Step 5: Close search
    await WatchlistPage.closeSearch();
  });

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
      // Find the search result card matching the segment
      const card = tcsResults.find(d => {
        const lines = d.split('\n').map(s => s.trim().toUpperCase());
        const firstLine = lines[0] || '';
        if (segment === 'NSE') {
          return firstLine === 'TCS-EQ' || d.includes('NSE') || d.includes('EQ');
        } else if (segment === 'BSE') {
          return firstLine === 'TCS' || d.includes('BSE');
        } else {
          return d.includes(segment);
        }
      }) || tcsResults[0];

      const lines = card.split('\n').map(s => s.trim().toUpperCase());
      const firstLine = lines[0] || '';

      let matchesSegment = false;
      if (segment === 'NSE') {
        matchesSegment = firstLine === 'TCS-EQ' || card.includes('NSE') || card.includes('EQ');
      } else if (segment === 'BSE') {
        matchesSegment = firstLine === 'TCS' || card.includes('BSE');
      } else {
        matchesSegment = card.includes(segment);
      }

      if (!matchesSegment) {
        throw new Error(`Expected segment ${segment} (TCS-EQ for NSE, TCS for BSE) not found in top card desc: ${card}`);
      } else {
        console.log(`✅ [${segment} VERIFIED]: Top card '${firstLine}' correctly matches segment '${segment}'`);
        allure.addStep(`✅ Successful verification of scrip under segment ${segment}: ${firstLine}`);
      }
    }
    await WatchlistPage.closeSearch();
  });

  //   it('should verify dname format for BFO segment', async () => {
  //     await WatchlistPage.clickSearchIcon();
  //     await WatchlistPage.enterScripName(process.env.TEST_SCRIP_NAME_TCS);
  //     await WatchlistPage.selectExchangeFilter(process.env.TEST_SEGMENT_BFO);
  //     await driver.pause(2000);

  //     const initialResults = await WatchlistPage.getAllSearchResults();
  //     const initialTcsResults = initialResults.filter(r => r.toUpperCase().startsWith('TCS'));
  //     if (initialTcsResults.length === 0) throw new Error("No TCS results found initially");

  //     const firstScrip = initialTcsResults[0].split('\n')[0].trim();
  //     if (/TCS \d{2}[A-Z]{3} FUT/i.test(firstScrip)) {
  //       console.log("✅First scrip format success: " + firstScrip);
  //     }
  //     else {
  //       throw new Error("First scrip mismatch" + firstScrip);
  //     }

  //     // Scroll down to the end to catch PE/CE options
  //     await WatchlistPage.scrollSearchResultsToBottom();

  //     const finalResults = await WatchlistPage.getAllSearchResults();
  //     const finalTcsResults = finalResults.filter(r => r.toUpperCase().startsWith('TCS'));
  //     if (finalTcsResults.length === 0) throw new Error("No TCS results found at bottom");

  //     const lastScrip = finalTcsResults[finalTcsResults.length - 1].split('\n')[0].trim();
  //     if (/TCS \d{2}[A-Z]{3} \d+(?:\.\d+)? (PE|CE)/i.test(lastScrip)) {
  //       console.log("✅Last scrip format success: " + lastScrip);
  //     }
  //     else {
  //       throw new Error("First scrip mismatch" + firstScrip);
  //     }

  //     await WatchlistPage.closeSearch();
  //   });
});
