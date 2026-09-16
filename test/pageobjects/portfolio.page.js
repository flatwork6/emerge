import locators from '../utils/locatorHelper.js'

class PortfolioPage {

    get holdingsTab() { return $(locators.get('holdingsTab')) }

    async openPortfolio(tab = 'Holdings') {
        console.log(`Navigating to Portfolio -> ${tab} tab...`);
        // Wait for bottom tabs to render
        // await driver.waitUntil(async () => {
        //     const el = $(`android=new UiSelector().className("android.widget.ImageView").instance(3)`);
        //     return await el.isExisting();
        // }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });

        // Bottom tabs shift instances due to ads and are NAF=true (invisible to standard $$)
        // We iterate through instances and click until we find the Portfolio-specific holdingsTab
        // (Note: we use the dynamic instance loop because accessibility IDs like ~Portfolio are hidden from Appium)
        // We prioritize index 3 since it's the most common location for the Portfolio tab
        const preferredIndices = [3, 4, 5, 6, 0, 1, 2];
        for (const i of preferredIndices) {
            const icon = $(`android=new UiSelector().className("android.widget.ImageView").instance(${i})`);
            if (await icon.isExisting()) {
                await icon.click();
                try {
                    // Check if we are on the Portfolio page by looking for either tab
                    const isPortfolio = await driver.waitUntil(async () => {
                        return (await this.holdingsTab.isExisting()) || (await this.positionsTab.isExisting());
                    }, { timeout: 1500 });
                    
                    if (isPortfolio) {
                        console.log(`Found Portfolio tab at instance(${i})!`);
                        if (tab.toLowerCase() === 'positions') {
                            await this.positionsTab.click();
                        } else {
                            await this.holdingsTab.click();
                        }
                        
                        // Verify the content loaded by checking for the Qty rows
                        const firstRow = $(locators.get('portfolioStockRows'));
                        await firstRow.waitForDisplayed({ timeout: 1500 });
                        return;
                    }
                } catch (e) {
                    // Not the right tab, try the next one
                }
            }
        }
        throw new Error("Could not find Portfolio tab!");
    }

    async openHoldings() {
        console.log("Holdings tab should already be active, verifying...");
        await this.holdingsTab.waitForDisplayed({ timeout: 5000 });
        await driver.pause(500);
    }

    async extractFirstHolding() {
        console.log("Extracting first holding...");
        const listElements = await $$(locators.get('portfolioStockRows'));

        let foundHolding = null;

        for (const elem of listElements) {
            if (await elem.isDisplayed().catch(() => false)) {
                const desc = await elem.getAttribute("content-desc").catch(() => "");
                if (desc && desc.includes("Qty")) {
                    console.log(`Found holding desc: \n${desc}`);

                    // Example desc pieces: "Qty. 10 • Avg. 0.94", "GATECH", "Invested ₹9.40", "LTP 0.78 (-4.88%)"
                    const parts = desc.split(/\n/).map(s => s.trim()).filter(s => s !== "");

                    if (parts.length >= 2) {
                        // Extract Quantity from the part that contains 'Qty'
                        const qtyPart = parts.find(p => p.includes('Qty'));
                        const qtyMatch = qtyPart ? qtyPart.match(/Qty\.\s*[-+]?([0-9]+)/i) : null;
                        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 0;

                        // Find the stock name. It's usually the part immediately after the qtyPart, or it's a fully uppercase string.
                        // Filter out parts that are purely numbers/percentages (like "1.00", "-17.02%") by ensuring it has letters.
                        let name = "";
                        for (const p of parts) {
                            if (!p.includes("Qty") && !p.includes("Avg") && !p.includes("Invested") && !p.includes("LTP") && !p.includes("T1:") && !p.includes("T2:") && /[a-zA-Z]/.test(p)) {
                                // It could be the name, e.g., "GATECH" or "IDEA-EQ"
                                name = p.trim();
                                break;
                            }
                        }

                        // Just in case, if name is somehow empty, use the part after qtyPart
                        if (!name) {
                            const qtyIndex = parts.findIndex(p => p.includes('Qty'));
                            if (qtyIndex >= 0 && qtyIndex + 1 < parts.length) {
                                name = parts[qtyIndex + 1].trim();
                            }
                        }

                        // We no longer extract segment because it's not needed for the search
                        foundHolding = { name, qty };
                        console.log(`Extracted Holding: ${name}, Qty: ${qty}`);
                        break;
                    }
                }
            }
        }

        if (!foundHolding) {
            throw new Error("Could not find any holdings in the portfolio!");
        }

        return foundHolding;
    }
    get positionsTab() { return $(locators.get('positionsTab')) }

    async openPositions() {
        console.log("Navigating to Positions tab...");
        await this.positionsTab.waitForDisplayed({ timeout: 5000 });
        await this.positionsTab.click();
        await driver.pause(1000);
    }

    async extractFirstPosition() {
        console.log("Extracting first position...");
        const listElements = await $$(locators.get('portfolioStockRows'));

        let foundPosition = null;

        for (const elem of listElements) {
            if (await elem.isDisplayed().catch(() => false)) {
                const desc = await elem.getAttribute("content-desc").catch(() => "");
                if (desc && desc.includes("Qty")) {
                    console.log(`Found position desc: \n${desc}`);

                    const parts = desc.split(/\n/).map(s => s.trim()).filter(s => s !== "");

                    if (parts.length >= 2) {
                        let stockName = parts[0];
                        let qty = null;

                        // Wait, in positions, the format might be slightly different.
                        // usually Name is the first alphabet part.
                        for (const p of parts) {
                            const isProductType = ['CNC', 'MIS', 'NRML', 'MTF', 'BO', 'CO'].includes(p);
                            if (!p.includes("Qty") && !p.includes("LTP") && !p.includes("Invested") && !p.includes("Avg") && !isProductType && /[a-zA-Z]/.test(p)) {
                                stockName = p;
                                break;
                            }
                        }

                        for (const p of parts) {
                            if (p.includes("Qty")) {
                                const qtyMatch = p.match(/Qty\.\s*(-?\d+)/);
                                if (qtyMatch && qtyMatch[1]) {
                                    qty = qtyMatch[1];
                                }
                            }
                        }

                        if (stockName && qty) {
                            foundPosition = { name: stockName, qty: qty };
                            console.log(`Extracted Position: ${stockName}, Qty: ${qty}`);
                            break;
                        }
                    }
                }
            }
        }

        if (!foundPosition) {
            throw new Error("Could not find any positions with a quantity.");
        }
        return foundPosition;
    }
}

export default new PortfolioPage();
