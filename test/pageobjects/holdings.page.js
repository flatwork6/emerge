import locators from '../utils/locatorHelper.js'

class HoldingsPage {
    get holdingsTab() { return $(locators.get('holdingsTab')); }
    get portfolioTabIcon() { return $(locators.get('portfolioTabIcon')); }

    async openHoldings() {
        console.log("Navigating to Portfolio -> Holdings tab...");
        // Wait for bottom tabs to render
        try {
            await driver.waitUntil(async () => {
                const el = await $(locators.get("watchlistFooterIcon"));
                return await el.isExisting();
            }, { timeout: 10000 });
        } catch (e) { console.log("Bottom tabs wait timed out, continuing..."); }

        // Try clicking portfolio icon directly if locator exists
        const portfolioTab = await this.portfolioTabIcon;
        if (await portfolioTab.isExisting()) {
            await portfolioTab.click();
            await driver.pause(1000);
        }

        let tabExists = await this.holdingsTab.isExisting();
        if (!tabExists) {
            console.log("Holdings tab not found. Iterating through bottom tabs...");
            // Iterate from right to left like baskets
            for (let i = 5; i >= 0; i--) {
                const icon = await $(`android=new UiSelector().className("android.widget.ImageView").instance(${i})`);
                if (await icon.isExisting()) {
                    await icon.click();
                    await driver.pause(1000);
                    if (await this.holdingsTab.isExisting()) {
                        console.log(`Found Portfolio tab at instance ${i}`);
                        tabExists = true;
                        break;
                    }
                }
            }
        }

        if (!tabExists) {
            throw new Error("Could not navigate to Portfolio tab!");
        }

        await this.holdingsTab.waitForDisplayed({ timeout: 5000 });
        await this.holdingsTab.click();
        await driver.pause(2000);
    }
}

export default new HoldingsPage();
