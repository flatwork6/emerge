import locators from '../utils/locatorHelper.js'

class OrdersPage {

    get gttTab() { return $(locators.get('gttTab')) }
    get sipTab() { return $(locators.get('sipTab')) }
    get alertsTab() { return $(locators.get('alertsTab')) }

    async openOrders() {
        console.log("Navigating to Orders tab...");
        // Wait for bottom tabs to render
        await driver.waitUntil(async () => {
            const el = $(locators.get('androidnewUiSelectorclassNamea_4idc'));
             return await el.isExisting();
        }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });

        // Iterate through instances to find the Orders tab (usually instance 2 or 3)
        const preferredIndices = [2, 1, 3, 4, 0, 5];
        for (const i of preferredIndices) {
            const icon = $(locators.get('androidnewUiSelectorclassNamea_z03r'));
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
            console.log("No Gtt orders found");
            return "No Gtt orders found";
        }

        return foundStockName;
    }

    async openSIP() {
        console.log("Navigating to SIP tab...");
        await this.sipTab.waitForDisplayed({ timeout: 5000 });
        await this.sipTab.click();
        await driver.pause(1000);
    }

    async extractFirstSIPStock() {
        console.log("Extracting first SIP stock...");
        const listElements = await $$(locators.get('sipStockRows'));
        
        if (listElements.length === 0) {
            console.log("No sips found");
            return "No sips found";
        }

        // Randomly click one
        const randomIndex = Math.floor(Math.random() * listElements.length);
        await listElements[randomIndex].click();
        await driver.pause(1000);

        // Click View
        const viewBtn = $(locators.get('viewSipBtn'));
        await viewBtn.waitForDisplayed({ timeout: 5000 });
        await viewBtn.click();
        await driver.pause(1500);

        // Since the stock name and "Qty: 1" are separate widgets in Flutter,
        // we'll get all descriptions to find "Scrips in this SIP" and take the next text.
        const allElements = await $$(locators.get('locator5382_vr41'));
        let texts = [];
        for (const el of allElements) {
            let desc = await el.getAttribute("content-desc").catch(() => "");
            let textAttr = await el.getText().catch(() => "");
            let combined = (desc || "") + "\n" + (textAttr || "");
            if (combined.trim() !== "") {
                texts.push(combined.trim());
            }
        }
        console.log("ALL EXTRACTED TEXTS:", JSON.stringify(texts, null, 2));

        let foundStockName = null;
        for (let i = 0; i < texts.length; i++) {
            if (texts[i].includes("Scrips in this SIP")) {
                const parts = texts[i].split(/\n/).map(s => s.trim()).filter(s => s !== "");
                const headerIdx = parts.findIndex(p => p.includes("Scrips in this SIP"));
                
                if (headerIdx !== -1 && headerIdx + 1 < parts.length) {
                    // It was merged into the same element
                    foundStockName = parts[headerIdx + 2];
                } else if (i + 1 < texts.length) {
                    // It is in the next element
                    const nextParts = texts[i + 2].split(/\n/).map(s => s.trim()).filter(s => s !== "");
                    foundStockName = nextParts[0];
                }
                
                if (foundStockName) {
                    console.log(`Found SIP scrip via robust text search: ${foundStockName}`);
                    break;
                }
            }
        }

        if (!foundStockName) {
            // Fallback to original logic if the layout is weird
            for (const text of texts) {
                if (text.includes("Qty:")) {
                    console.log(`Found Qty row: \n${text}`);
                    const parts = text.split(/\n/).map(s => s.trim()).filter(s => s !== "");
                    if (parts.length >= 2) {
                        for (const p of parts) {
                            if (!p.includes("Qty:") && !p.includes("Scrips") && /[a-zA-Z]/.test(p)) {
                                foundStockName = p.trim();
                                break;
                            }
                        }
                    }
                }
                if (foundStockName) break;
            }
        }
        
        if (!foundStockName) {
            throw new Error("Could not find any stocks in the SIP view!");
        }

        // Close bottom sheet (optional, but good practice to clean up)
        try {
             await driver.back();
             await driver.pause(1000);
        } catch (e) { }

        return foundStockName;
    }

    async openAlerts() {
        console.log("Navigating to Alerts tab...");
        await this.alertsTab.waitForDisplayed({ timeout: 5000 });
        await this.alertsTab.click();
        await driver.pause(1000);
    }

    async extractFirstAlertStock() {
        console.log("Extracting first Alert stock...");
        const potentialElems = await $$(locators.get('locator6631_uv5l'));
        let foundStockName = null;

        for (const elem of potentialElems) {
            const desc = await elem.getAttribute("content-desc").catch(() => "");
            if (desc && (desc.includes("Pending") || desc.includes("Triggered"))) {
                console.log(`Found Alert desc: \n${desc}`);
                const parts = desc.split(/\n/).map(s => s.trim()).filter(s => s !== "");
                if (parts.length >= 2) {
                    for (const p of parts) {
                        if (!p.includes("Pending") && !p.includes("Triggered") && !p.includes("LTP") && /[a-zA-Z]/.test(p)) {
                            foundStockName = p.trim();
                            break;
                        }
                    }
                    if (!foundStockName) {
                        foundStockName = parts[0].trim();
                    }
                    break;
                }
            }
        }

        if (!foundStockName) {
            console.log("No Alerts found");
            return "No Alerts found";
        }

        return foundStockName;
    }
    async getAllAlerts() {
        console.log("Extracting all alerts from Alerts tab...");
        const potentialElems = await $$(locators.get('locator6460_d8gs'));
        let extractedAlerts = [];

        for (const elem of potentialElems) {
            const desc = await elem.getAttribute("content-desc").catch(() => "");
            if (desc && (desc.includes("Pending") || desc.includes("Triggered"))) {
                extractedAlerts.push(desc.trim());
            }
        }

        console.log(`Found ${extractedAlerts.length} alerts on the Alerts Page.`);
        return extractedAlerts;
    }
}

export default new OrdersPage();
