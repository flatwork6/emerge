import locators from '../utils/locatorHelper.js'

class OrdersPage {

    get gttTab() { return $(locators.get('gttTab')) }

    async openOrders() {
        console.log("Navigating to Orders tab...");
        // Wait for bottom tabs to render
        await driver.waitUntil(async () => {
            const el = $(`android=new UiSelector().className("android.widget.ImageView").instance(4)`);
             return await el.isExisting();
        }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });

        // Iterate through instances to find the Orders tab (usually instance 2 or 3)
        const preferredIndices = [2, 1, 3, 4, 0, 5];
        for (const i of preferredIndices) {
            const icon = $(`android=new UiSelector().className("android.widget.ImageView").instance(4)`);
            if (await icon.isExisting()) {
                await icon.click();
                try {
                    // Check if GTT tab exists here to confirm it's the Orders page
                    await this.gttTab.waitForDisplayed({ timeout: 1500 });
                    console.log(`Found Orders tab at instance(${i})!`);
                    return;
                } catch (e) {
                    // Not the right tab, try the next one
                }
            }
        }
        throw new Error("Could not find Orders tab!");
    }

    async openGTT() {
        console.log("Navigating to GTT tab...");
        await this.gttTab.waitForDisplayed({ timeout: 5000 });
        await this.gttTab.click();
        await driver.pause(1000);
    }

    async extractFirstGTTStock() {
        console.log("Extracting first GTT stock...");
        const listElements = await $$(locators.get('gttStockRows'));
        
        let foundStockName = null;

        for (const elem of listElements) {
            if (await elem.isDisplayed().catch(() => false)) {
                const desc = await elem.getAttribute("content-desc").catch(() => "");
                // GTT rows typically contain 'Qty' or 'LTP'
                if (desc && (desc.includes("Qty") || desc.includes("LTP"))) {
                    console.log(`Found GTT desc: \n${desc}`);
                    
                    const parts = desc.split(/\n/).map(s => s.trim()).filter(s => s !== "");
                    
                    if (parts.length >= 2) {
                        for (const p of parts) {
                            // The stock name is usually the first part with letters that isn't a known label
                            // Also skip "B" or "S" which are Buy/Sell indicators
                            if (!p.includes("Qty") && !p.includes("LTP") && !p.includes("Trigger") && p !== "B" && p !== "S" && p !== "GTT" && /[a-zA-Z]/.test(p)) {
                                foundStockName = p.trim();
                                break;
                            }
                        }

                        // Fallback
                        if (!foundStockName) {
                            foundStockName = parts[0].trim();
                        }

                        console.log(`Extracted GTT Stock: ${foundStockName}`);
                        break;
                    }
                }
            }
        }

        if (!foundStockName) {
            throw new Error("Could not find any stocks in the GTT list!");
        }

        return foundStockName;
    }
}

export default new OrdersPage();
