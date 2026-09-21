import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import allure from '@wdio/allure-reporter'

import OverviewPage from '../pageobjects/overview.page.js'
import OptionChainPage from '../pageobjects/optionchain.page.js'
import AlertsPage from '../pageobjects/alerts.page.js'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import WatchlistPage from '../pageobjects/watchlist.page.js'


describe('Option Chain Verification', () => {
  let stocks = [];

  before(async () => {
    const csvPath = path.resolve(process.cwd(), 'test/data/optionChainStocks.csv');
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const records = parse(fileContent, { columns: true, skip_empty_lines: true });
      stocks = records.map(r => r.STOCKNAME);
    } else {
      stocks = ['TCS-EQ', 'INFY-EQ'];
    }
  });

  it('should search for TCS stock, open overview, verify details, open option chain and verify', async () => {
    const stockToTest = stocks.find(s => s === 'TCS-EQ') || 'TCS-EQ';
    console.log(`\n--- Validating Option Chain for ${stockToTest} ---`);

    //await WatchlistPage.clickWatchlistTab();
    await WatchlistPage.clickSearchIcon();
    await WatchlistPage.enterScripName(stockToTest);

    // Click the first search result matching the stock
    const firstResult = await $(`android=new UiSelector().descriptionContains("${stockToTest}")`);
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
    
    // Go back to Watchlist
    await OptionChainPage.clickBack();
    
    // Close search to reset state
    await WatchlistPage.closeSearch();
  });
});

 describe('Alerts Verification', () => {
  let stocks = [];

  before(async () => {
    const csvPath = path.resolve(process.cwd(), 'test/data/optionChainStocks.csv');
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf8');
      const records = parse(fileContent, { columns: true, skip_empty_lines: true });
      stocks = records.map(r => r.STOCKNAME);
    } else {
      stocks = ['TCS-EQ'];
    }
  });

 it('should create 4 different alerts for TCS stock from Overview page', async () => {
    const stockToTest = stocks.find(s => s === 'TCS-EQ') || 'TCS-EQ';
    console.log(`\n--- Validating Alerts for ${stockToTest} ---`);

    await WatchlistPage.clickSearchIcon();
    await WatchlistPage.enterScripName(stockToTest);

    // Click the first search result matching the stock
    const firstResult = await $(`android=new UiSelector().descriptionContains("${stockToTest}")`);
    await firstResult.waitForDisplayed({ timeout: 10000 });
    await firstResult.click();
    await driver.pause(2000); // Wait for overview page to load

    // Extract stock name, price, and perc
    const { name: stockName, price: stockPrice, perc: stockPerc, fullText } = await OverviewPage.getStockDetails(stockToTest);
    console.log(`Extracted from Overview - Name: ${stockName}, LTP: ${stockPrice}, Perc: ${stockPerc}% (Full Text: ${fullText})`);

    // // We have 4 cases to execute
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
      
      // Assuming bottom sheet closes automatically after creation.
      // If there's a toast, we might wait for it to disappear
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
    const updatedValueEl = await $(`android=new UiSelector().descriptionContains("${newValue}")`);
    const fallbackUpdatedValueEl = await $(`android=new UiSelector().textContains("${newValue}")`);
    if (!(await updatedValueEl.isExisting()) && !(await fallbackUpdatedValueEl.isExisting())) {
        throw new Error(`Failed to find updated alert with value ${newValue}`);
    }
    console.log("✅ Verified alert value was updated successfully.");
    
    // 2. Delete Alert from modify
    console.log("\n--- Deleting Alert from Modify Screen ---");
    // Bottom sheet is already open from the previous verification step
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
    
    // 4. Verify only 2 alerts remaining
    console.log("\n--- Verifying Remaining Alerts ---");
    await OverviewPage.clickAlerts();
    const remainingAlerts = await AlertsPage.getExistingAlerts();
    
    if (remainingAlerts.length !== 2) {
        throw new Error(`Expected exactly 2 alerts, but found ${remainingAlerts.length}`);
    }
    
    console.log("✅ Verified exactly 2 alerts remaining.");
    for (const [index, alertDesc] of remainingAlerts.entries()) {
        console.log(`Alert ${index + 1} Details: ${alertDesc.replace(/\n/g, ' - ')}`);
        allure.addStep(`✅ Alert ${index + 1}: ${alertDesc.replace(/\n/g, ' - ')}`);
    }

    // Go back to Watchlist (Close bottom sheet then go back)
    // Assuming clicking outside or clicking back closes the bottom sheet
    await driver.back();
    await driver.pause(1000);
    await driver.back(); // Go back from overview to Watchlist

    // 5. Verify the 2 alerts on the main Alerts Page
    console.log("\n--- Verifying alerts on main Alerts Page ---");
    const OrdersPage = require('../pageobjects/orders.page.js').default;
    await OrdersPage.openOrders();
    await OrdersPage.openAlerts();

    const mainPageAlerts = await OrdersPage.getAllAlerts();
    for (const alertDesc of remainingAlerts) {
        // Extract trigger value from bottom sheet description (e.g. "TCS-EQ\nNSE | ₹2118.7" -> "2118.7")
        const triggerMatch = alertDesc.match(/[\d\.]+/);
        if (triggerMatch) {
            const triggerValue = triggerMatch[0];
            const isPresent = mainPageAlerts.some(mainAlert => mainAlert.includes(triggerValue));
            if (!isPresent) {
                throw new Error(`Failed to find alert with trigger value ${triggerValue} on the main Alerts Page.`);
            }
            console.log(`✅ Verified alert with trigger value ${triggerValue} is present on main Alerts Page.`);
            allure.addStep(`✅ Alert with trigger value ${triggerValue} is on main Alerts Page.`);
        }
    }
    
    // Clean up to return to normal state
    const WatchlistPage = require('../pageobjects/watchlist.page.js').default;
    await WatchlistPage.clickWatchlistTab();

  })
})

describe('Marketwatch NSE/BSE Toggle Verification', () => {
    it('should switch segment to BSE and verify stock details change', async () => {
        console.log(`\n========================================`)
        console.log(`--- Marketwatch NSE/BSE Toggle Verification ---`)
        
        // Go back to dashboard/watchlist if we are not already there
        try {
            const WatchlistPage = require('../pageobjects/watchlist.page.js').default;
            await WatchlistPage.clickWatchlistTab();
            await WatchlistPage.clickSearchIcon();
            
            const stockToTest = 'TCS-EQ';
            console.log(`\n--- Searching for ${stockToTest} ---`);
            await WatchlistPage.enterScripName(stockToTest);

            // Click the first search result matching the stock
            const firstResult = await $(`android=new UiSelector().descriptionContains("${stockToTest}")`);
            await firstResult.waitForDisplayed({ timeout: 10000 });
            await firstResult.click();
            await driver.pause(2000); // Wait for overview page to load

            // Extract initial details (NSE)
            const OverviewPage = require('../pageobjects/overview.page.js').default;
            const nseDetails = await OverviewPage.getStockDetails(stockToTest);
            console.log(`NSE Details - Name: ${nseDetails.name}, LTP: ${nseDetails.price}, Perc: ${nseDetails.perc}%`);

            // Click BSE Toggle
            await OverviewPage.clickBSE();

            // Extract new details (BSE) - Look for 'TCS' since the user said it changes from TCS-EQ to TCS
            const bseDetails = await OverviewPage.getStockDetails('TCS');
            console.log(`BSE Details - Name: ${bseDetails.name}, LTP: ${bseDetails.price}, Perc: ${bseDetails.perc}%`);

            // Verifications
            if (nseDetails.name === bseDetails.name) {
                throw new Error("Stock name did not change! Expected it to change from TCS-EQ to something like TCS.");
            }
            if (nseDetails.price === bseDetails.price) {
                console.log("⚠️ Note: The price is exactly the same on NSE and BSE right now.");
            } else {
                console.log(`✅ Verified price variation between NSE (${nseDetails.price}) and BSE (${bseDetails.price}).`);
            }
            await OverviewPage.clickNSE();
            
            console.log("✅ NSE/BSE toggle working as expected.");

        } catch (e) {
            console.error("Test Failed: ", e);
            throw e;
        }
    });
});

describe('Scalper & Strategy Builder Verification', () => {
    it('should verify Scalper and Strategy Builder redirect correctly', async () => {
        console.log(`\n========================================`)
        console.log(`--- Scalper & Strategy Builder Verification ---`)
        
        try {
            // 1. Scalper
            await OverviewPage.clickScalper();
            
            // Wait a moment for page load
            await driver.pause(3000);
            const locators = require('../utils/locatorHelper.js').default;

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
