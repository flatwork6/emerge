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
        const match = desc.match(/\d+\.\d{2}/);
        const price = match ? match[0] : "";
        
        return { name: expectedStockName, price: price, fullText: desc };
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
}

export default new OverviewPage();
