import locators from '../locators/stockOverviewLocators.js'
import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import allureReporter from '@wdio/allure-reporter'

import OverviewPage from '../pageobjects/overview.page.js'
import OptionChainPage from '../pageobjects/optionchain.page.js'
import AlertsPage from '../pageobjects/alerts.page.js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import WatchlistPage from '../pageobjects/watchlist.page.js'

const originalLog = console.log;
console.log = function (...args) {
  originalLog.apply(console, args);
  const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
  try {
    allureReporter.addStep(msg);
  } catch (e) { }
};

describe('Stock Overview Automation', () => {
  let stocks = [];

  before(async () => {
    const csvPath = path.resolve(process.cwd(), 'test/data/stockOverviewStocks.csv');
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const records = parse(fileContent, { columns: true, skip_empty_lines: true });
      stocks = records.map(r => r.STOCKNAME);
    } else {
      stocks = ['WIPRO-EQ', 'INFY-EQ', 'NIFTY'];
    }
  });

  it('TC-01: Verify stock details and Option Chain navigation from Overview', async () => {
    console.log(`\n========================================`);
    console.log(`TC-01: Verify Stock Details and Option Chain`);
    console.log(`========================================`);

    const stockToTest = stocks.find(s => s === 'WIPRO') || 'WIPRO';
    console.log(`\n--- Validating Option Chain for ${stockToTest} ---`);

    await WatchlistPage.clickSearchIcon();
    await WatchlistPage.enterScripName(stockToTest);

    // Click the first search result matching the stock
    const firstResult = await $(locators.get('dynamicDesc', stockToTest));
    await firstResult.waitForDisplayed({ timeout: 10000 });
    await firstResult.click();
    await driver.pause(2000); // Wait for overview page to load

    // Extract stock name and price
    const { name: stockName, price: stockPrice, fullText } = await OverviewPage.getStockDetails(stockToTest);
    console.log(`Extracted from Overview - Name: ${stockName}, Price: ${stockPrice} (Full Text: ${fullText})`);

    // Click Option Chain icon
    await OverviewPage.clickOptionChain();
    await driver.pause(2000); // Wait for Option chain to load

    // Verify Option Chain page
    await OptionChainPage.verifyOptionChainPage(stockName, stockPrice);

    // Go back to Overview
    await OptionChainPage.clickBack();
  });

  it('TC-02: Create, modify, and delete alerts from Overview and verify on Alerts page', async () => {
    console.log(`\n========================================`);
    console.log(`TC-02: Create, Modify, and Delete Alerts from Overview`);
    console.log(`========================================`);

    const stockToTest = stocks.find(s => s === 'WIPRO-EQ') || 'WIPRO-EQ';
    console.log(`\n--- Validating Alerts for ${stockToTest} ---`);

    // Extract stock name, price, and perc
    const { name: stockName, price: stockPrice, perc: stockPerc, fullText } = await OverviewPage.getStockDetails(stockToTest);
    console.log(`Extracted from Overview - Name: ${stockName}, LTP: ${stockPrice}, Perc: ${stockPerc}% (Full Text: ${fullText})`);

    // We have 4 cases to execute
    const alertCases = [
      { type: 'LTP', condition: 'Greater than', value: stockPrice + 10, note: 'LTP Greater Test' },
      { type: 'LTP', condition: 'Lesser than', value: stockPrice - 10, note: 'LTP Lesser Test' },
      { type: '% Change', condition: 'Greater than', value: stockPerc + 1, note: 'Perc Greater Test' },
      { type: '% Change', condition: 'Lesser than', value: stockPerc - 1, note: 'Perc Lesser Test' }
    ];

    for (const [index, ac] of alertCases.entries()) {
      console.log(`\nExecuting Alert Case ${index + 1}: ${ac.type} | ${ac.condition} | ${ac.value}`);

      // Click alerts icon to open bottom sheet
      await OverviewPage.clickAlerts();

      // Select Alert Type if not LTP (LTP is default)
      if (ac.type === '% Change') {
        await AlertsPage.selectAlertType('% Change');
      }

      // Select Condition
      await AlertsPage.setCondition(ac.condition);

      // Enter Target Value
      await AlertsPage.enterTargetValue(ac.value);

      // Enter Note
      await AlertsPage.enterNote(ac.note);

      // Click Create
      await AlertsPage.clickCreateAlert();
      await AlertsPage.alertConfirmationPopup();
      await AlertsPage.verifyAlertCreationSuccess();

      await driver.pause(2000);
    }

    // 1. Modify Alert
    console.log("\n--- Modifying Alert ---");
    await OverviewPage.clickAlerts();
    await AlertsPage.clickPencilIcon();

    // We will modify the first alert we created
    const newValue = Math.floor(stockPrice) + 10;
    await AlertsPage.modifyTargetValue(newValue);
    await AlertsPage.clickUpdateAlert();
    await AlertsPage.alertConfirmationPopup();

    // Verify it was updated by opening alerts and checking for the new value
    await OverviewPage.clickAlerts();
    const updatedValueEl = await $(locators.get('dynamicDesc', newValue));
    const fallbackUpdatedValueEl = await $(locators.get('dynamicText', newValue));
    if (!(await updatedValueEl.isExisting()) && !(await fallbackUpdatedValueEl.isExisting())) {
      throw new Error(`Failed to find updated alert with value ${newValue}`);
    }
    console.log("✅ Verified alert value was updated successfully.");

    // 2. Delete Alert from modify
    console.log("\n--- Deleting Alert from Modify Screen ---");
    await AlertsPage.clickPencilIcon();
    await AlertsPage.clickDeleteAlert();
    await AlertsPage.clickYes();
    console.log("✅ Alert deleted from modify screen.");

    // 3. Delete Alert from bottom sheet (using dustbin icon)
    console.log("\n--- Deleting Alert from Bottom Sheet ---");
    await OverviewPage.clickAlerts();
    await driver.pause(1000);
    await AlertsPage.clickDustbinIcon();
    await AlertsPage.clickYes();
    console.log("✅ Alert deleted using dustbin icon.");

    // 4. Verify alerts remaining
    console.log("\n--- Verifying Remaining Alerts ---");
    await OverviewPage.clickAlerts();
    const remainingAlerts = await AlertsPage.getExistingAlerts();

    for (const [index, alertDesc] of remainingAlerts.entries()) {
      console.log(`Alert ${index + 1} Details: ${alertDesc.replace(/\n/g, ' - ')}`);
      allureReporter.addStep(`✅ Alert ${index + 1}: ${alertDesc.replace(/\n/g, ' - ')}`);
    }

    // Go back to Watchlist (Close bottom sheet then go back)
    await driver.back();
    await driver.pause(1000);
    await driver.back(); // Go back from overview to Watchlist

    // 5. Verify alerts on the main Alerts Page
    console.log("\n--- Verifying alerts on main Alerts Page ---");
    const OrdersPage = require('../pageobjects/orders.page.js').default;

    // Navigate to Orders bottom tab
    console.log("Navigating to Orders tab...");
    const ordersDescElems = await $$(locators.get('ordersBottomTabDesc'));
    if (ordersDescElems.length > 0) {
      let bottomTab = ordersDescElems[0];
      let maxY = -1;
      for (const el of ordersDescElems) {
        const loc = await el.getLocation().catch(() => ({ y: 0 }));
        if (loc.y > maxY) {
          maxY = loc.y;
          bottomTab = el;
        }
      }
      await bottomTab.click();
    } else {
      const ordersIcon = await $(locators.get('ordersBottomTabIcon'));
      await ordersIcon.click();
    }
    await driver.pause(1500);

    // Fallback if Alerts tab is not yet visible
    if (!(await OrdersPage.alertsTab.isExisting().catch(() => false))) {
      const ordersIcon = await $(locators.get('ordersBottomTabIcon'));
      if (await ordersIcon.isExisting().catch(() => false)) {
        await ordersIcon.click();
        await driver.pause(1500);
      }
    }

    await OrdersPage.openAlerts();

    const mainPageAlerts = await OrdersPage.getAllAlerts();

    console.log(`\n--- Comparing Overview Alerts with Main Alerts Page ---`);
    console.log(`Stock Overview remaining alerts count: ${remainingAlerts.length}`);
    remainingAlerts.forEach((a, i) => console.log(`  [Overview Alert ${i + 1}]: ${a.replace(/\n/g, ' ')}`));

    console.log(`Main Alerts Page alerts count: ${mainPageAlerts.length}`);
    mainPageAlerts.forEach((a, i) => console.log(`  [Main Alert ${i + 1}]: ${a.replace(/\n/g, ' ')}`));

    if (remainingAlerts.length === 0) {
      throw new Error("Cannot verify: 0 remaining alerts found on Stock Overview bottom sheet (ensure alert creation steps ran).");
    }

    for (const alertDesc of remainingAlerts) {
      const numbers = alertDesc.match(/\d+(\.\d+)?/g);
      if (!numbers || numbers.length === 0) {
        console.log(`⚠️ Could not parse trigger value from overview alert: ${alertDesc}`);
        continue;
      }

      const triggerValue = numbers[numbers.length - 1];
      const numVal = parseFloat(triggerValue);

      const matched = mainPageAlerts.find(mainAlert => {
        const cleanMain = mainAlert.replace(/,/g, '');
        if (cleanMain.includes(triggerValue)) return true;
        if (!isNaN(numVal) && cleanMain.includes(numVal.toString())) return true;
        return false;
      });

      if (!matched) {
        throw new Error(`Failed to find alert with trigger value "${triggerValue}" on the main Alerts Page!\nAlerts on Page:\n${mainPageAlerts.join('\n---\n')}`);
      }

      console.log(`✅ Verified alert [${triggerValue}] from Overview is present on main Alerts Page:`);
      console.log(`   -> Matched: ${matched.replace(/\n/g, ' ')}`);
      allureReporter.addStep(`✅ Alert with trigger value ${triggerValue} verified on main Alerts Page.`);
    }

    // Clean up to return to normal state
    const WatchlistPageLocal = require('../pageobjects/watchlist.page.js').default;
    await WatchlistPageLocal.clickWatchlistTab();
  });

  it('TC-03: Switch segment between NSE and BSE and verify stock details change', async () => {
    console.log(`\n========================================`);
    console.log(`TC-03: Marketwatch NSE/BSE Toggle Verification`);
    console.log(`========================================`);

    try {
      const WatchlistPageLocal = require('../pageobjects/watchlist.page.js').default;
      await WatchlistPageLocal.clickWatchlistTab();
      await WatchlistPageLocal.clickSearchIcon();

      const stockToTest = 'WIPRO-EQ';
      console.log(`\n--- Searching for ${stockToTest} ---`);
      await WatchlistPageLocal.enterScripName(stockToTest);

      // Click the first search result matching the stock
      const firstResult = await $(locators.get('dynamicDesc', stockToTest));
      await firstResult.waitForDisplayed({ timeout: 10000 });
      await firstResult.click();
      await driver.pause(2000); // Wait for overview page to load

      // Extract initial details (NSE)
      const OverviewPageLocal = require('../pageobjects/overview.page.js').default;
      const nseDetails = await OverviewPageLocal.getStockDetails(stockToTest);
      console.log(`NSE Details - Name: ${nseDetails.name}, LTP: ${nseDetails.price}, Perc: ${nseDetails.perc}%`);

      // Click BSE Toggle
      await OverviewPageLocal.clickBSE();

      // Extract new details (BSE) - Look for 'TCS' since the segment toggle changes stock
      const bseDetails = await OverviewPageLocal.getStockDetails('TCS');
      console.log(`BSE Details - Name: ${bseDetails.name}, LTP: ${bseDetails.price}, Perc: ${bseDetails.perc}%`);

      // Verifications
      if (nseDetails.name === bseDetails.name) {
        throw new Error("Stock name did not change! Expected it to change from WIPRO-EQ to something like TCS.");
      }
      if (nseDetails.price === bseDetails.price) {
        console.log("⚠️ Note: The price is exactly the same on NSE and BSE right now.");
      } else {
        console.log(`✅ Verified price variation between NSE (${nseDetails.price}) and BSE (${bseDetails.price}).`);
      }
      await OverviewPageLocal.clickNSE();

      console.log("✅ NSE/BSE toggle working as expected.");
    } catch (e) {
      console.error("Test Failed: ", e);
      throw e;
    }
  });

  it('TC-04: Verify Scalper and Strategy Builder redirect correctly from Overview', async () => {
    console.log(`\n========================================`);
    console.log(`TC-04: Scalper & Strategy Builder Verification`);
    console.log(`========================================`);

    try {
      // 1. Scalper
      await OverviewPage.clickScalper();

      // Wait a moment for page load
      await driver.pause(3000);

      // Verify Call, Stock, Put exist
      const callExists = await $(locators.get('scalperCallHeaderDesc')).isExisting() || await $(locators.get('scalperCallHeaderText')).isExisting();
      const stockExists = await $(locators.get('scalperStockHeaderDesc')).isExisting() || await $(locators.get('scalperStockHeaderText')).isExisting();
      const putExists = await $(locators.get('scalperPutHeaderDesc')).isExisting() || await $(locators.get('scalperPutHeaderText')).isExisting();

      if (!callExists || !stockExists || !putExists) {
        throw new Error("Scalper page verification failed: Could not find 'Call', 'Stock', or 'Put' on headers.");
      }
      console.log("✅ Scalper page loaded successfully with 'Call', 'Stock', and 'Put'.");

      await driver.back();
      await driver.pause(2000);

      // 2. Strategy Builder
      await OverviewPage.clickStrategyBuilder();

      // Verify scrip name "TCS" on top
      await driver.pause(3000);
      const tcsDescLoc = locators.get('strategyScripHeaderDesc').replace('{value}', 'TCS');
      const tcsTextLoc = locators.get('strategyScripHeaderText').replace('{value}', 'TCS');
      const scripExists = await $(tcsDescLoc).isExisting() || await $(tcsTextLoc).isExisting();
      if (!scripExists) {
        throw new Error("Strategy Builder page verification failed: Could not find scrip name 'TCS' on top.");
      }
      console.log("✅ Strategy Builder page loaded successfully with scrip name.");

      await driver.back();
      await driver.pause(2000);

      // Clean up
      await driver.back();
      await driver.pause(1000);
      await driver.back();
    } catch (e) {
      console.error("Test Failed: ", e);
      throw e;
    }
  });
});
