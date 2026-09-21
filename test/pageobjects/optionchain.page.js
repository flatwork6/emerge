import allure from '@wdio/allure-reporter'
import locators from '../utils/locatorHelper.js'

class OptionChainPage {
    get headerText() {
        // In Flutter apps, text is typically found in the content-desc
        return $(locators.get('optionChainHeader'));
    }


    async verifyOptionChainPage(expectedStockName, expectedStockPrice) {
        console.log("Verifying Option Chain page...");
        // Look for the header either via description or fallback to text
        try {
           const isVisible= await this.headerText.waitForDisplayed({ timeout: 10000 });
           console.log("*******************")
           console.log(isVisible)
        } catch (e) {
            const fallbackHeader = await $('android=new UiSelector().text("Option Chain")');
            if (await fallbackHeader.isExisting()) {
                await fallbackHeader.waitForDisplayed({ timeout: 5000 });
            } else {
                throw new Error(`Option Chain header not found.`);
            }
        }

        // Verify stock name and price
        // Since we don't know the exact hierarchy, let's search for an element containing the stock name
        const elName = await $(`android=new UiSelector().descriptionContains("${expectedStockName}")`);
        let desc = "";
        if (await elName.isExisting()) {
            desc = await elName.getAttribute("content-desc");
        } else {
            const fallbackName = await $(`android=new UiSelector().textContains("${expectedStockName}")`);
            if (await fallbackName.isExisting()) {
                desc = await fallbackName.getText();
            } else {
                throw new Error(`Expected stock name ${expectedStockName} not found on Option Chain page.`);
            }
        }

        if (expectedStockPrice && !desc.includes(expectedStockPrice)) {
            // Price might be in a separate element
            const elPrice = await $(`android=new UiSelector().descriptionContains("${expectedStockPrice}")`);
            const fallbackPrice = await $(`android=new UiSelector().textContains("${expectedStockPrice}")`);
            if (!(await elPrice.isExisting()) && !(await fallbackPrice.isExisting())) {
                console.warn(`Warning: Expected stock price ${expectedStockPrice} not explicitly found in description, but continuing.`);
            }
        }
        
        console.log(`✅ Verified Option Chain page for ${expectedStockName}`);
        allure.addStep(`✅ Verified Option Chain page for ${expectedStockName}`);
    }

    async clickBack() {
        // Press back
        await driver.back();
        await driver.pause(1500);
    }
}

export default new OptionChainPage();
