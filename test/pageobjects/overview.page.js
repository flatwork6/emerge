import allure from '@wdio/allure-reporter'
import locators from '../utils/locatorHelper.js'

class OverviewPage {
    get optionChainIcon() {
        return $(locators.get('optionChain')); 
    }

    async getStockDetails(expectedStockName) {
        // In Flutter apps, text is often in content-desc. Let's find the element containing the stock name.
        const el = await $(`android=new UiSelector().descriptionContains("${expectedStockName}")`);
        let desc = expectedStockName;
        if (await el.isExisting()) {
            desc = await el.getAttribute("content-desc");
        } else {
            // fallback if it's actually text
            const elText = await $(`android=new UiSelector().textContains("${expectedStockName}")`);
            if (await elText.isExisting()) {
                desc = await elText.getText();
            }
        }
        
        // desc might be "TCS-EQ\n2133.20 +43.20 (2.07%)" or just "TCS-EQ"
        // Let's extract the first number as price if it exists
        const priceMatch = desc.match(/\d+\.\d{2}/);
        const price = priceMatch ? parseFloat(priceMatch[0]) : 0;

        // Extract percentage inside parentheses, e.g. "(1.85%)" or "(-0.29%)"
        const percMatch = desc.match(/\(([-+]?\d+\.\d+)%\)/);
        const perc = percMatch ? parseFloat(percMatch[1]) : 0;
        
        return { name: expectedStockName, price: price, perc: perc, fullText: desc };
    }

    get alertsIcon() {
        return $(locators.get('alertsIcon'));
    }

    async clickAlerts() {
        console.log("Clicking Alerts icon...");
        await this.alertsIcon.waitForDisplayed({ timeout: 5000 });
        await this.alertsIcon.click();
        await driver.pause(1000);
    }

    async clickOptionChain() {
        console.log("Clicking Option Chain icon...");
        await driver.pause(2000);
        
        try {
            await this.optionChainIcon.waitForDisplayed({ timeout: 5000 });
            await this.optionChainIcon.click();
        } catch (e) {
            console.error("Could not find Option Chain icon using locators.get('optionChain')");
            throw new Error("Could not find Option Chain icon.");
        }
    }
    async clickBSE() {
        console.log("Clicking BSE toggle...");
        const bseBtn = $('~BSE');
        await bseBtn.waitForDisplayed({ timeout: 5000 });
        await bseBtn.click();
        await driver.pause(2000);
    }

    async clickNSE() {
        console.log("Clicking NSE toggle...");
        const nseBtn = $(locators.get('nseToggleBtn'));
        await nseBtn.waitForDisplayed({ timeout: 5000 });
        await nseBtn.click();
        await driver.pause(2000);
    }

    async clickScalper() {
        console.log("Clicking Scalper icon...");
        const scalperBtn = $(locators.get('scalperIcon'));
        await scalperBtn.waitForDisplayed({ timeout: 5000 });
        await scalperBtn.click();
        await driver.pause(2000);
    }

    async clickStrategyBuilder() {
        console.log("Clicking Strategy Builder icon...");
        const strategyBuilderBtn = $(locators.get('strategyBuilderIcon'));
        await strategyBuilderBtn.waitForDisplayed({ timeout: 5000 });
        await strategyBuilderBtn.click();
        await driver.pause(2000);
    }
}

export default new OverviewPage();
