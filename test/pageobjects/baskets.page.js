import locators from '../utils/locatorHelper.js'

class BasketsPage {
    get basketTab() { return $(locators.get('basketsTab')); }
    get searchIcon() { return $(locators.get('basketsSearchIcon')); }
    get searchBar() { return $(locators.get("searchInputField"))}

    get availableMargin() {
        return $(locators.get('basketsAvailableMargin'));
    }

    get headerCount() {
        return $(locators.get('basketsHeaderCount'));
    }

    get noBasketsFound() {
        return $(locators.get('noBasketsFound'));
    }

    get scripToAdd(){
        return $(locators.get('basketScrip'));
    }

    get createBasketModalTitle() { return $(locators.get('createBasketModalTitle')); }
    get basketNameInput() { return $(locators.get('basketNameInput')); }
    get createBasketButton() { return $(locators.get('createBasketButton')); }
    get basketNameCounter() { return $(locators.get('basketNameCounter')); }

        get basketQtyRow() { return $(locators.get("basketQtyRow")); }
    get basketAddOrdersBtn() { return $(locators.get("basketAddOrdersBtn")); }
    get basketAddBtnUpper() { return $(locators.get("basketAddBtnUpper")); }
    get basketInfyScrip() { return $(locators.get("basketInfyScrip")); }
    get basketDuplicateIcon() { return $(locators.get("basketDuplicateIcon")); }
    get basketModifyIcon() { return $(locators.get("basketModifyIcon")); }
    get basketDeleteIcon() { return $(locators.get("basketDeleteIcon")); }

    async openBaskets() {
        console.log("Navigating to Baskets tab...");
        // Wait for bottom tabs to render
        try {
            await driver.waitUntil(async () => {
                const el = await $(locators.get("watchlistFooterIcon"));
                return await el.isExisting();
            }, { timeout: 10000 });
        } catch (e) { console.log("Bottom tabs wait timed out, continuing..."); }

        const ordersTab = await $(locators.get('ordersTab'));
        if (await ordersTab.isExisting()) {
            await ordersTab.click();
            await driver.pause(1000);
        }

        let basketExists = await this.basketTab.isExisting();
        if (!basketExists) {
            console.log("Basket tab not found. Iterating through bottom tabs...");
            for (let i = 5; i >= 0; i--) {
                const icon = await $(`android=new UiSelector().className("android.widget.ImageView").instance(${i})`);
                if (await icon.isExisting()) {
                    await icon.click();
                    await driver.pause(1000);
                    if (await this.basketTab.isExisting()) {
                        console.log(`Found Orders tab at instance ${i}`);
                        basketExists = true;
                        break;
                    }
                }
            }
        }

        if (!basketExists) {
            throw new Error("Could not navigate to Orders tab!");
        }

        await this.basketTab.waitForDisplayed({ timeout: 10000 });
        await this.basketTab.click();
        await driver.pause(2000);
    }
}

export default new BasketsPage();
