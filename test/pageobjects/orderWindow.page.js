import locators from '../utils/locatorHelper.js';

class OrderWindowPage {
    constructor() {
        this.selectedProductType = "";
        this.selectedOrderType = "";
    }

    get buyButton() { return $(locators.get('orderBuyButton')); } // Assuming content-desc or text is BUY
    get deliveryTab() { return $(locators.get('orderDeliveryTab')); }
    get intradayTab() { return $(locators.get('orderIntradayTab')); }
    get mktOption() { return $(locators.get('orderMktOption')); }
    get lmtOption() { return $(locators.get('orderLmtOption')); }
    get confirmBuyButton() { return $(locators.get('orderConfirmBuyButton')); } // Button at bottom

    async clickDelivery() {
        console.log("Selecting Delivery option...");
        this.selectedProductType = "CNC";
        await this.deliveryTab.waitForDisplayed({ timeout: 5000 });
        await this.deliveryTab.click();
        await driver.pause(1000);
    }

    async clickIntraday() {
        console.log("Selecting Intraday option...");
        this.selectedProductType = "MIS";
        await this.intradayTab.waitForDisplayed({ timeout: 5000 });
        await this.intradayTab.click();
        await driver.pause(1000);
    }


    async clickMKT() {
        console.log("Selecting MKT option...");
        this.selectedOrderType = "MKT";
        const mktBtn = await this.mktOption;
        if (await mktBtn.isDisplayed()) {
            await mktBtn.click();
        } else {
            // Fallback for Flutter
            await $(locators.get('orderMktOption')).click();
        }
        await driver.pause(1000);
    }

    async extractOrderDetails(expectedName = "") {
        console.log("Extracting details from Order Window...");

        let stockName = expectedName;
        let segment = "";
        let productType = this.selectedProductType || "";
        let orderType = this.selectedOrderType || "";
        let qty = "1";
        let ltp = "0.00";
        let price = "0.00";

        const allElements = await $$('//*[@content-desc != ""]');
        for (const el of allElements) {
            const desc = await el.getAttribute("content-desc").catch(() => "");
            if (!desc) continue;

            // Extract stock name and LTP dynamically if not passed
            if (!stockName && desc.includes("\n") && /[0-9]+\.[0-9]+/.test(desc)) {
                const parts = desc.split(/\n/);
                stockName = parts[0].trim();
                ltp = parts[1].replace(/[^0-9.]/g, '');
            } else if (!stockName && desc === desc.toUpperCase() && desc.length > 2 && !desc.includes("BUY") && !desc.includes("SELL") && !desc.includes("ORDER") && !desc.includes("DELIVERY") && !desc.includes("INTRADAY") && !desc.includes("MKT") && !desc.includes("LMT") && !desc.includes("NSE") && !desc.includes("BSE")) {
                stockName = desc.trim();
            } else if (expectedName && desc.includes(expectedName)) {
                const parts = desc.split(/\n/);
                stockName = parts[0].trim();
                if (parts.length > 1) {
                    ltp = parts[1].replace(/[^0-9.]/g, '');
                }
            }

            // Check selected state for toggles and tabs
            const isSelected = await el.getAttribute("selected") === "true";
            const isChecked = await el.getAttribute("checked") === "true";

            // Flutter workaround: The highlighted/selected segment might have clickable=false 
            // since you can't click the tab you are already on.
            const isClickable = await el.getAttribute("clickable") === "true";
            const active = isSelected || isChecked || !isClickable;

            if (desc.includes("NSE")) {
                if (active) segment = "NSE";
            }
            if (desc.includes("BSE")) {
                if (active) segment = "BSE";
            }

            if (desc.includes("Delivery")) {
                if (active && !this.selectedProductType) productType = "CNC";
            }
            if (desc.includes("Intraday")) {
                if (active && !this.selectedProductType) productType = "MIS";
            }

            if (desc.includes("MKT")) {
                if (active && !this.selectedOrderType) orderType = "MKT";
            }
            if (desc.includes("LMT")) {
                if (active && !this.selectedOrderType) orderType = "LMT";
            }
        }

        // Final fallbacks
        if (!stockName) stockName = "";
        if (!segment) segment = "";
        if (!productType) productType = "";
        if (!orderType) orderType = "";
        if (!price) price = "";

        console.log(`Extracted: ${stockName}, ${segment}, ${productType}, ${orderType}, Qty:${qty}, LTP:${ltp}, Price:${price}`);

        return {
            stockName,
            segment,
            productType,
            orderType,
            qty,
            price,
            ltp
        };
    }

    async clickConfirmBuy() {
        console.log("Clicking final BUY button...");

        const buyBtn = await $(locators.get('orderConfirmBuyButton'));
        await buyBtn.waitForDisplayed({ timeout: 5000 });
        await buyBtn.click();
        await driver.pause(2000);

        const proceedBtn = await $('//*[contains(@content-desc, "Proceed") or contains(@text, "Proceed")]');
        if (await proceedBtn.isExisting()) {
            console.log("⚠️ Proceed popup appeared. Clicking Proceed...");
            await proceedBtn.click();
            await driver.pause(2000);
        }
    }


    async clickConfirmSell() {
        console.log("Clicking final SELL button...");

        const sellBtn = await $(locators.get('orderConfirmSellButton'));
        await sellBtn.waitForDisplayed({ timeout: 5000 });
        await sellBtn.click();
        await driver.pause(2000);

        const proceedBtn = await $('//*[contains(@content-desc, "Proceed") or contains(@text, "Proceed")]');
        if (await proceedBtn.isExisting()) {
            console.log("⚠️ Proceed popup appeared. Clicking Proceed...");
            await proceedBtn.click();
            await driver.pause(2000);
        }
    }

    async extractSnackbar() {
        console.log("Extracting Snackbar message...");
        let snackbarText = "";

        // Wait for snackbar to appear
        await driver.pause(1000);

        try {
            // Find any view that contains "Order Rejected" or "Completed"
            const snackbar = await $(locators.get('orderSnackbar'));
            if (await snackbar.isDisplayed()) {
                snackbarText = await snackbar.getAttribute("content-desc");
            }
        } catch (e) {
            console.log("Could not find snackbar via UiSelector.");
        }

        console.log(`Snackbar text: ${snackbarText}`);
        return snackbarText;
    }
}

export default new OrderWindowPage();
