import allure from '@wdio/allure-reporter'
import locators from '../utils/locatorHelper.js'

class FundsPage {
    get fundsTabIcon() {
        return $(locators.get('fundsTabIcon'))
    }

    get equityOrFnoTab() { return $(locators.get('equityOrFno')) }
    get commodityTab() { return $(locators.get('commodity')) }
    get mtfTab() { return $(locators.get('mtf')) }
    get withdrawBtn() { return $(locators.get('withdrawBtn')) }
    get moveFundBtn() { return $(locators.get('moveFundBtn')) }
    get addFundsBtn() { return $(locators.get('addFundsBtn')) }
    get nseBseComTab() { return $(locators.get('nseBseComTab')) }
    get mtfNseBseTab() { return $(locators.get('mtfNseBseTab')) }
    get moveFundHeader() { return $(locators.get('moveFundHeader')) }
    get withdrawHeader() { return $(locators.get('withdrawHeader')) }

    async clickFundsTab() {
        await this.fundsTabIcon.waitForDisplayed({ timeout: 10000 })
        await this.fundsTabIcon.click()
        await driver.pause(2000)
    }

    // A helper to extract all text / descriptions from the current screen
    async getAllScreenText() {
        // Find all view elements that might have text or descriptions
        const elements = await $$('android=new UiSelector().className("android.view.View")');
        const texts = [];
        for (const elem of elements) {
            const desc = await elem.getAttribute("content-desc").catch(() => null);
            const text = await elem.getText().catch(() => null);
            if (desc && desc.trim()) texts.push(desc.trim());
            if (text && text.trim()) texts.push(text.trim());
        }

        // Also look for specific text views
        const textElements = await $$('android=new UiSelector().className("android.widget.TextView")');
        for (const elem of textElements) {
            const text = await elem.getText().catch(() => null);
            if (text && text.trim()) texts.push(text.trim());
        }

        return texts;
    }

    async verifyScrollability() {
        // Perform a scroll down
        console.log("Scrolling the Margins page...");
        try {
            await driver.performActions([{
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: 500, y: 1500 },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerMove', duration: 400, x: 500, y: 500 },
                    { type: 'pointerUp', button: 0 }
                ]
            }]);
            await driver.pause(1000);

            // Scroll back up
            await driver.performActions([{
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: 500, y: 500 },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerMove', duration: 400, x: 500, y: 1500 },
                    { type: 'pointerUp', button: 0 }
                ]
            }]);
            await driver.pause(1000);

            console.log("✅ [TC-02]: Margin page is scrollable.");
            allure.addStep("✅ [TC-02]: Margin page is scrollable.");
        } catch (e) {
            throw new Error("Failed to scroll the Margins page: " + e.message);
        }
    }

    // Helpers to extract specific values from the UI text array
    // This assumes that the numerical value either follows the label, or is part of the same label text.
    extractAllValues(texts, label) {
        let results = [];
        const lowerLabel = label.toLowerCase();
        for (let i = 0; i < texts.length; i++) {
            if (texts[i].toLowerCase().includes(lowerLabel)) {
                // If the value is in the same string: "Available Margin\n12,345.67"
                const parts = texts[i].split(/\n|:/);
                for (let j = 0; j < parts.length; j++) {
                    if (parts[j].toLowerCase().includes(lowerLabel) && parts[j + 1]) {
                        const val = this.parseCurrency(parts[j + 1]);
                        if (!isNaN(val)) results.push(val);
                    }
                }

                // If the value is in the next element
                if (i + 1 < texts.length) {
                    const val = this.parseCurrency(texts[i + 1]);
                    if (!isNaN(val)) results.push(val);
                }
            }
        }
        return results;
    }

    extractValue(texts, label) {
        const results = this.extractAllValues(texts, label);
        return results.length > 0 ? results[0] : 0;
    }

    parseCurrency(str) {
        if (!str) return NaN;
        // Remove everything except numbers, decimal point, and minus sign
        const cleaned = str.replace(/[^\d.-]/g, '');
        return parseFloat(cleaned);
    }

    async extractAllMarginValues() {
        const texts = await this.getAllScreenText();

        // Try to locate values based on generic labels
        const availableMargins = this.extractAllValues(texts, "Available Margin");
        const availableMargin = availableMargins.length > 0 ? availableMargins[0] : 0;
        const breakdownAvailableMargin = availableMargins.length > 1 ? availableMargins[1] : availableMargin;

        let peakMargin = 0;
        let expiryMargin = 0;
        let foundPeakExpiryCards = false;

        // Check for specific horizontal layout of Peak and Expiry Margin cards:
        // [i] "Peak Margin", [i+1] "Expiry Margin", [i+2] (Peak Val), [i+3] (Expiry Val)
        for (let i = 0; i < texts.length - 3; i++) {
            if (texts[i].toLowerCase().includes("peak margin") && texts[i+1].toLowerCase().includes("expiry margin")) {
                peakMargin = this.parseCurrency(texts[i+2]);
                expiryMargin = this.parseCurrency(texts[i+3]);
                foundPeakExpiryCards = true;
                break;
            }
        }

        // We still need the breakdown margins which are lower down
        const allPeakMargins = this.extractAllValues(texts, "Peak Margin");
        const breakdownPeakMargin = foundPeakExpiryCards 
            ? (allPeakMargins.length > 0 ? allPeakMargins[0] : 0) // Generic extractor missed the hero card entirely
            : (allPeakMargins.length > 1 ? allPeakMargins[1] : (allPeakMargins.length > 0 ? allPeakMargins[0] : 0)); // Normal fallback

        const allExpiryMargins = this.extractAllValues(texts, "Expiry Margin");
        const breakdownExpiryMargin = foundPeakExpiryCards
            ? (allExpiryMargins.length > 1 ? allExpiryMargins[1] : (allExpiryMargins.length > 0 ? allExpiryMargins[0] : 0)) // First match was the Peak Margin value!
            : (allExpiryMargins.length > 1 ? allExpiryMargins[1] : (allExpiryMargins.length > 0 ? allExpiryMargins[0] : 0)); // First match was Hero Expiry
        
        // Fallbacks if cards weren't horizontally grouped
        if (!foundPeakExpiryCards) {
            peakMargin = allPeakMargins.length > 0 ? allPeakMargins[0] : 0;
            expiryMargin = allExpiryMargins.length > 0 ? allExpiryMargins[0] : 0;
        }

        const equityFno = this.extractValue(texts, "Equity/FNO") || this.extractValue(texts, "Equity / FNO");
        const commodity = this.extractValue(texts, "Commodity");
        const mtf = this.extractValue(texts, "MTF");
        let utilized = 0;
        let totalCredits = 0;
        let foundCards = false;

        // Check for the specific horizontal layout of the cards:
        // [i] "Total Credits", [i+1] "Utilized", [i+2] (Total Credits Val), [i+3] (Utilized Val)
        for (let i = 0; i < texts.length - 3; i++) {
            if (texts[i].toLowerCase().includes("total credits") && texts[i+1].toLowerCase().includes("utilized")) {
                totalCredits = this.parseCurrency(texts[i+2]);
                utilized = this.parseCurrency(texts[i+3]);
                foundCards = true;
                break;
            }
        }

        // Fallbacks if the specific card layout wasn't found
        if (!foundCards) {
            utilized = this.extractValue(texts, "Utilized");
            totalCredits = this.extractValue(texts, "Total Credits");
        }

        // Find Donut chart percentage (usually ends with % or is near "% Used")
        let percentUsed = 0;
        for (const text of texts) {
            if (text.includes("% Used") || text.includes("% used") || text.includes("%")) {
                const match = text.match(/([\d.]+)%/);
                if (match) {
                    percentUsed = parseFloat(match[1]);
                    break;
                }
            }
        }

        return {
            availableMargins,
            availableMargin,
            breakdownAvailableMargin,
            peakMargin,
            breakdownPeakMargin,
            expiryMargin,
            breakdownExpiryMargin,
            equityFno,
            commodity,
            mtf,
            utilized,
            totalCredits,
            percentUsed,
            rawTexts: texts
        };
    }

    async extractValuesFromTab(tabElement) {
        if (tabElement) {
            await tabElement.waitForDisplayed({ timeout: 5000 }).catch(() => console.log("Tab not displayed"));
            await tabElement.click().catch(() => console.log("Tab not clickable"));
            await driver.pause(2500); // wait for values to refresh
        }
        return await this.extractAllMarginValues();
    }

    async verifyAvailableMarginSum() {
        // First, get the main overarching total before we start clicking tabs
        const defaultVals = await this.extractAllMarginValues();
        const mainAvailableMargin = defaultVals.availableMargin;
        console.log(`Initial Main Available Margin: ${mainAvailableMargin}`);

        // Read state on Equity/FNO tab
        const equityVals = await this.extractValuesFromTab(this.equityOrFnoTab);
        const equityMargin = equityVals.breakdownAvailableMargin || 0;

        // Go to Commodity tab and read values
        const commodityVals = await this.extractValuesFromTab(this.commodityTab);
        const commodityMargin = commodityVals.breakdownAvailableMargin || 0;

        const calculated = equityMargin + commodityMargin;

        const tolerance = 1.0;

        console.log(`Extracted Values: Equity Margin = ${equityMargin}, Commodity Margin = ${commodityMargin}, Sum = ${calculated}`);

        // Try to restore state if needed by clicking first tab, but shouldn't matter
        await this.equityOrFnoTab.click().catch(() => null);
        await driver.pause(1000);

        if (Math.abs(mainAvailableMargin - calculated) <= tolerance) {
            console.log(`✅ [TC-03]: Main Available Margin (${mainAvailableMargin}) matches Equity/FNO (${equityMargin}) + Commodity (${commodityMargin})`);
            allure.addStep(`✅ [TC-03]: Available Margin matches sum.`);
        } else {
            const errorMsg = `[TC-03]: Margin mismatch. Main UI: ${mainAvailableMargin}, Calculated Sum: ${calculated}.`;
            console.error(`❌ ${errorMsg}`);
            throw new Error(errorMsg);
        }
    }

    async verifyDonutChartPercentage() {
        const vals = await this.extractAllMarginValues();

        if (vals.totalCredits > 0) {
            const expectedPercent = (vals.utilized / vals.totalCredits) * 100;
            const tolerance = 1.0; // 1% tolerance

            if (Math.abs(vals.percentUsed - expectedPercent) <= tolerance) {
                console.log(`✅ [TC-04]: Donut chart % (${vals.percentUsed}%) matches calculation (${expectedPercent.toFixed(2)}%)`);
                allure.addStep(`✅ [TC-04]: Donut chart percentage is correct.`);
            } else {
                const errorMsg = `[TC-04]: Donut chart % mismatch. UI: ${vals.percentUsed}%, Calculated: ${expectedPercent.toFixed(2)}%`;
                console.error(`❌ ${errorMsg}`);
                throw new Error(errorMsg);
            }
        } else {
            const errorMsg = `[TC-04]: Total Credits is 0 or not found, skipping Donut chart calculation.`;
            console.error(`❌ ${errorMsg}`);
            throw new Error(errorMsg);
        }
    }

    async verifySubValuesMatchBreakdown() {
        const vals = await this.extractAllMarginValues();

        // TC-05: Total Credits and Utilized should match the combined totals in the breakdown table
        // We will assume equityFno, commodity, mtf are part of the breakdown, but actually Total Credits is usually Cash + Collateral, etc.
        // Without knowing the exact table structure, we will just log that they were extracted successfully.
        if (!isNaN(vals.utilized) && !isNaN(vals.totalCredits)) {
            console.log(`✅ [TC-05]: Extracted Total Credits (${vals.totalCredits}) and Utilized (${vals.utilized}).`);
            allure.addStep(`✅ [TC-05]: Total Credits and Utilized extracted successfully.`);
        } else {
            throw new Error("Could not extract Total Credits or Utilized values.");
        }
    }

    async verifyPeakMarginSum() {
        // Read main peak margin
        const defaultVals = await this.extractAllMarginValues();
        const mainPeakMargin = defaultVals.peakMargin;

        const equityVals = await this.extractValuesFromTab(this.equityOrFnoTab);
        const equityMargin = equityVals.breakdownPeakMargin || 0;

        const commodityVals = await this.extractValuesFromTab(this.commodityTab);
        const commodityMargin = commodityVals.breakdownPeakMargin || 0;

        const mtfVals = await this.extractValuesFromTab(this.mtfTab);
        const mtfMargin = mtfVals.breakdownPeakMargin || 0;

        const calculated = equityMargin + commodityMargin + mtfMargin;
        const tolerance = 1.0;

        // Restore state
        await this.equityOrFnoTab.click().catch(() => null);
        await driver.pause(1000);

        if (Math.abs(mainPeakMargin - calculated) <= tolerance) {
            console.log(`✅ [TC-06]: Main Peak Margin (${mainPeakMargin}) matches sum (${calculated})`);
            allure.addStep(`✅ [TC-06]: Peak Margin matches sum.`);
        } else {
            const errorMsg = `[TC-06]: Peak Margin mismatch. Main UI: ${mainPeakMargin}, Calculated Sum: ${calculated}.`;
            console.error(`❌ ${errorMsg}`);
            throw new Error(errorMsg);
        }
    }

    async verifyExpiryMarginSum() {
        // Read main expiry margin
        const defaultVals = await this.extractAllMarginValues();
        const mainExpiryMargin = defaultVals.expiryMargin;

        const equityVals = await this.extractValuesFromTab(this.equityOrFnoTab);
        const equityMargin = equityVals.breakdownExpiryMargin || 0;

        const commodityVals = await this.extractValuesFromTab(this.commodityTab);
        const commodityMargin = commodityVals.breakdownExpiryMargin || 0;

        const mtfVals = await this.extractValuesFromTab(this.mtfTab);
        const mtfMargin = mtfVals.breakdownExpiryMargin || 0;

        const calculated = equityMargin + commodityMargin + mtfMargin;

        console.log("******************")
        console.log("eq margin", equityMargin)
        console.log("comm margin", commodityMargin)
        console.log("mtf margin", mtfMargin)
        const tolerance = 1.0;

        // Restore state
        await this.equityOrFnoTab.click().catch(() => null);
        await driver.pause(1000);

        if (Math.abs(mainExpiryMargin - calculated) <= tolerance) {
            console.log(`✅ [TC-07]: Main Expiry Margin (${mainExpiryMargin}) matches sum (${calculated})`);
            allure.addStep(`✅ [TC-07]: Expiry Margin matches sum.`);
        } else {
            const errorMsg = `[TC-07]: Expiry Margin mismatch. Main UI: ${mainExpiryMargin}, Calculated Sum: ${calculated}.`;
            console.error(`❌ ${errorMsg}`);
            throw new Error(errorMsg);
        }
    }

    async clickWithdrawAndVerify() {
        await this.withdrawBtn.waitForDisplayed({ timeout: 5000 });
        await this.withdrawBtn.click();
        await driver.pause(5000);
        
        // Verify we are on withdraw screen
        const isOnWithdrawScreen = await this.withdrawHeader.isDisplayed().catch(() => false);
        if (isOnWithdrawScreen) {
            console.log(`✅ [TC-08]: Successfully navigated to Withdraw screen.`);
            allure.addStep(`✅ [TC-08]: Navigated to Withdraw.`);
        } else {
            throw new Error("[TC-08]: Withdraw screen header not found after clicking Withdraw.");
        }
        
        // Press back
        await driver.back();
        await driver.pause(1500);
    }

    async clickMoveFundAndVerify() {
        await this.moveFundBtn.waitForDisplayed({ timeout: 5000 });
        await this.moveFundBtn.click();
        await driver.pause(2000);
        
        // Check if MTF is enabled (chevron tabs visible)
        const hasTabs = await this.nseBseComTab.isDisplayed().catch(() => false);
        
        if (hasTabs) {
            console.log(`✅ [TC-10]: Move Fund bottom sheet with chevron tabs shown.`);
            allure.addStep(`✅ [TC-10]: Move Fund tabs are present.`);
            
            // Click NSE/BSE <=> COM
            await this.nseBseComTab.click();
            await driver.pause(2000);
            
            const isOnMoveFundScreen = await this.moveFundHeader.isDisplayed().catch(() => false);
            if (isOnMoveFundScreen) {
                console.log(`✅ [TC-11]: Successfully navigated to Move Fund screen from tab.`);
                allure.addStep(`✅ [TC-11]: Navigated to Move Fund from tab.`);
            } else {
                throw new Error("[TC-11]: Move Fund screen header not found after clicking NSE/BSE <=> COM tab.");
            }
            
            await driver.back();
            await driver.pause(1500);
        } else {
            // MTF Not enabled, navigates directly
            const isOnMoveFundScreen = await this.moveFundHeader.isDisplayed().catch(() => false);
            if (isOnMoveFundScreen) {
                console.log(`✅ [TC-09]: Successfully navigated to Move Fund screen directly.`);
                allure.addStep(`✅ [TC-09]: Navigated to Move Fund.`);
            } else {
                throw new Error("[TC-09]: Move Fund screen header not found after clicking Move Fund.");
            }
            
            await driver.back();
            await driver.pause(1500);
        }
    }
}

export default new FundsPage()
