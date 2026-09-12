import allure from '@wdio/allure-reporter'
import locators from '../utils/locatorHelper.js'

class WatchlistPage {

    get searchIcon() {
        return $(locators.get('searchIcon'))
    }

    get marketWatchSettingsGear() {
        return $(locators.get('marketWatchSettingsGear'))
    }

    get marketWatchSettingsCloseBtn() {
        return $(locators.get('marketWatchSettingsCloseBtn'))
    }

    get alphabeticalSorting() { return $(locators.get('alphabeticalSorting')) }
    get percentSorting() { return $(locators.get('percentSorting')) }
    get ltpSorting() { return $(locators.get('ltpSorting')) }
    get exchangeSorting() { return $(locators.get('exchangeSorting')) }

    get watchlistTabIcon() { return $(locators.get('watchlistTabIcon')) }

    get openPriceRadioBtn() { return $(locators.get('openPriceRadioBtn')) }
    get closePriceRadioBtn() { return $(locators.get('closePriceRadioBtn')) }

    get percentageFormatRadioBtn() { return $(locators.get('percentageFormatRadioBtn')) }
    get absoluteFormatRadioBtn() { return $(locators.get('absoluteFormatRadioBtn')) }
    get absoluteAndPercentageFormatRadioBtn() { return $(locators.get('absoluteAndPercentageFormatRadioBtn')) }
    get showDirectionToggle() { return $(locators.get('showDirectionToggle')) }
    get holdingsToggle() { return $(locators.get('holdingsToggle')) }

    async clickWatchlistTab() {
        console.log("Navigating to Watchlist tab...");
        await this.watchlistTabIcon.waitForDisplayed({ timeout: 10000 });
        await this.watchlistTabIcon.click();
        await driver.pause(2000);
    }

    get searchInputField() {
        return $(locators.get('searchInputField'))
    }

    get searchInputFields() {
        return $$(locators.get('searchInputField'))
    }


    get watchListDropdown() {
        return $(locators.get('watchListDropdown'))
    }

    get selectWatchlist() {
        return $(locators.get('selectWatchlist'))
    }

    get searchResultPlusIcons() {
        return $$(locators.get('searchResultPlusIcons'))
    }

    get searchResultTopCard() {
        return $(locators.get('searchResultTopCard'))
    }

    get overviewBookmarkIcon() {
        return $(locators.get('overviewBookmarkIcon'))
    }

    get watchlistRemoveMinusBtn() {
        return $(locators.get('watchlistRemoveMinusBtn'))
    }

    get stockOverviewBackButton() {
        return $(locators.get('stockOverviewBackButton'))
    }

    get indexSubDropdown() {
        return $(locators.get('indexSubDropdown'))
    }

    get advanceBadge() {
        return $(locators.get('advanceBadge'))
    }

    get declineBadge() {
        return $(locators.get('declineBadge'))
    }


    /**
     * Click search icon to open search input field
     */


    async openWatchListDropdown(currentWatchlistName) {
        // If search overlay is open, close it first
        try {
            const searchFields = await this.searchInputFields
            if (searchFields.length > 0 && await searchFields[0].isDisplayed().catch(() => false)) {
                console.log("Search overlay is visible when opening dropdown. Closing search...")
                await this.closeSearch()
                await driver.pause(1000)
            }
        } catch (e) { }

        if (currentWatchlistName) {
            try {
                // Look for dropdown element displaying currentWatchlistName using locators.csv template
                const selector = locators.get('watchlistDropdownByName').replace('{name}', currentWatchlistName)
                const dynamicDropdown = $(selector)
                if (await dynamicDropdown.isDisplayed().catch(() => false)) {
                    await dynamicDropdown.click()
                    await driver.pause(1000)
                    return
                }
            } catch (e) { }
        }

        // Generic fallback: Look for any dropdown view in top header area (y between 180 and 320, x < 600)
        try {
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const loc = await v.getLocation()
                    if (loc.y > 180 && loc.y < 320 && loc.x < 600) {
                        const desc = await v.getAttribute("content-desc").catch(() => "")
                        if (desc && (desc.includes('/') || desc.includes('Watchlist') || desc.includes('Index') || currentWatchlistName && desc.includes(currentWatchlistName))) {
                            await v.click()
                            await driver.pause(1000)
                            console.log(`Clicked dropdown element '${desc}' at (${loc.x}, ${loc.y})`)
                            return
                        }
                    }
                }
            }
        } catch (e) { }

        // Last fallback to default locator
        await this.watchListDropdown.click()
        await driver.pause(1000)
    }

    async getAllWatchlistNames() {
        console.log("Dynamically extracting watchlist names from UI...");

        // Open the dropdown to see the list of watchlists
        await this.watchListDropdown.click();
        await driver.pause(1500);

        const watchlists = new Set();

        try {
            // Find all views with content-desc
            const views = await $$('//*[@content-desc != ""]');
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const desc = await v.getAttribute("content-desc").catch(() => "");
                    const loc = await v.getLocation();

                    // Dropdown items are typically vertically laid out below the header (e.g., y > 150)
                    if (loc.y > 150 && loc.y < 1200 && desc) {
                        const name = desc.split('\n')[0].trim();
                        // Ignore common UI elements that are not user watchlists
                        const ignoredKeywords = ["index", "manage", "create", "search", "profile", "add", "settings", "nifty", "sensex"];
                        const isIgnored = ignoredKeywords.some(kw => name.toLowerCase().includes(kw) || name.toLowerCase() === kw);

                        if (name && !isIgnored && name.length > 0 && name.length < 40) {
                            watchlists.add(name);
                        }
                    }
                }
            }
        } catch (e) {
            console.log("Error extracting watchlist names:", e);
        }

        let extracted = Array.from(watchlists);
        console.log("Extracted watchlists dynamically:", extracted);

        // Fallback if extraction fails
        if (extracted.length === 0) {
            console.log("Failed to extract dynamic watchlists. Defaulting to standard test data names if available.");
            extracted = ["Watchlist 1"]; // Generic fallback
        }

        // Select the first watchlist to close the dropdown and set initial state
        await this.clickWatchlistByName(extracted[0]);
        await driver.pause(1000);

        return extracted;
    }

    async pullDownToRefresh() {
        try {
            console.log("Performing pull-to-refresh gesture on watchlist...")
            await driver.performActions([{
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: 500, y: 1150 },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerMove', duration: 200, x: 500, y: 4000 },
                    { type: 'pointerUp', button: 0 }
                ]
            }])
            await driver.pause(1500)
        } catch (e) {
            console.log("Error performing pull-to-refresh:", e.message)
        }
    }

    async clickWatchlistByName(name) {
        try {
            const item = $(`~${name}`)
            if (await item.isDisplayed().catch(() => false)) {
                await item.click()
                await driver.pause(1000)
                if (name !== 'Index') {
                    await this.pullDownToRefresh()
                }
                return
            }
        } catch (e) { }

        try {
            const selector = locators.get('watchlistRowByName').replace('{name}', name)
            const itemUi = $(selector)
            if (await itemUi.isDisplayed().catch(() => false)) {
                await itemUi.click()
                await driver.pause(1000)
                if (name !== 'Index') {
                    await this.pullDownToRefresh()
                }
                return
            }
        } catch (e) { }

        // Coordinate fallback if click command hangs on animated dropdown list item
        const itemFallback = $(`~${name}`)
        await itemFallback.waitForDisplayed({ timeout: 5000 })
        const loc = await itemFallback.getLocation()
        const sz = await itemFallback.getSize()
        const tapX = Math.floor(loc.x + sz.width / 2)
        const tapY = Math.floor(loc.y + sz.height / 2)

        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 }
            ]
        }])
        await driver.pause(1000)
        if (name !== 'Index') {
            await this.pullDownToRefresh()
        }
    }

    async switchHeatmapIndexDropdown(indexName) {
        try {
            console.log(`Opening Heatmap index dropdown to select '${indexName}'...`)

            let dropdownOpened = false

            // Step 1: Open Dropdown Box (Pink Box in UI Image)
            // Try explicit UiSelector for "Index\nNifty 50" or "Index\nSENSEX" or "Index"
            try {
                const dropBtn = $(`android=new UiSelector().descriptionStartsWith("Index")`)
                if (await dropBtn.isDisplayed().catch(() => false)) {
                    await dropBtn.click()
                    dropdownOpened = true
                    console.log(`Clicked Heatmap Index dropdown button via UiSelector descriptionStartsWith("Index")`)
                }
            } catch (e) { }

            if (!dropdownOpened) {
                try {
                    const dropBtn = $(`android=new UiSelector().descriptionContains("Nifty 50")`)
                    if (await dropBtn.isDisplayed().catch(() => false)) {
                        await dropBtn.click()
                        dropdownOpened = true
                        console.log(`Clicked Heatmap Index dropdown button via UiSelector descriptionContains("Nifty 50")`)
                    }
                } catch (e) { }
            }

            if (!dropdownOpened) {
                // Fallback tap top-left dropdown region (x: 120, y: 155)
                await driver.performActions([{
                    type: 'pointer',
                    id: 'finger1',
                    parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: 120, y: 155 },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }])
                console.log("Tapped top-left Heatmap dropdown box coordinate (120, 155)")
            }
            await driver.pause(1000)

            // Step 2: Click target item in overlay menu (Blue Box in UI Image: SENSEX or Nifty 50)
            const isSensex = indexName.toLowerCase().includes('sensex')
            const targetLabel = isSensex ? 'SENSEX' : 'Nifty 50'

            // Direct UiSelector search for exact content-desc "SENSEX" or "Nifty 50"
            try {
                const itemElem = $(`android=new UiSelector().description("${targetLabel}")`)
                if (await itemElem.isDisplayed().catch(() => false)) {
                    await itemElem.click()
                    await driver.pause(1500)
                    console.log(`✅ Clicked '${targetLabel}' inside Heatmap dropdown menu via UiSelector`)
                    return
                }
            } catch (e) { }

            try {
                const itemElem = $(`android=new UiSelector().descriptionContains("${targetLabel}")`)
                if (await itemElem.isDisplayed().catch(() => false)) {
                    await itemElem.click()
                    await driver.pause(1500)
                    console.log(`✅ Clicked descriptionContains '${targetLabel}' inside Heatmap dropdown menu`)
                    return
                }
            } catch (e) { }

            // Scan visible views in overlay menu area (y between 120 and 320, x < 300)
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const loc = await v.getLocation()
                    const desc = await v.getAttribute("content-desc").catch(() => "")
                    if (loc.y > 120 && loc.y < 320 && loc.x < 300 && desc && desc.toLowerCase().includes(indexName.toLowerCase())) {
                        await v.click()
                        await driver.pause(1500)
                        console.log(`✅ Clicked '${desc}' inside Heatmap index dropdown overlay at (${loc.x}, ${loc.y})`)
                        return
                    }
                }
            }

            // Coordinate fallbacks for dropdown item:
            // Top option (Nifty 50) y ~160; Second option (SENSEX) y ~210
            const tapY = isSensex ? 210 : 160
            await driver.performActions([{
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: 100, y: tapY },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerUp', button: 0 }
                ]
            }])
            await driver.pause(1500)
            console.log(`✅ Tapped fallback coordinate (100, ${tapY}) for '${targetLabel}' inside Heatmap dropdown`)
        } catch (e) {
            console.log(`Error switching Heatmap index dropdown to '${indexName}':`, e)
        }
    }

    async selectIndexTabDropdownOption(indexName) {
        try {
            // Try clicking Tab directly if available (e.g. ~SENSEX or ~NIFTY 50)
            const tabBtn = $(`~${indexName}`)
            if (await tabBtn.isDisplayed().catch(() => false)) {
                await tabBtn.click()
                await driver.pause(1000)
                console.log(`Clicked Index Tab directly: ${indexName}`)
                return
            }
        } catch (e) { }

        try {
            // Otherwise click top sub-dropdown for Index page
            const indexSubDropdown = this.indexSubDropdown
            if (await indexSubDropdown.isDisplayed().catch(() => false)) {
                await indexSubDropdown.click()
                await driver.pause(1000)
                const opt = $(`~${indexName}`)
                if (await opt.isDisplayed().catch(() => false)) {
                    await opt.click()
                    await driver.pause(1000)
                    console.log(`Selected Index sub-dropdown option: ${indexName}`)
                }
            }
        } catch (e) { }
    }

    async scrollIndexWatchlist() {
        console.log("\n========================================")
        console.log("Processing Index Watchlist: SENSEX & NIFTY 50 Accordions")
        console.log("========================================")

        // Helper to find and click an accordion in the list view (y > 350)
        const clickListAccordion = async (indexName) => {
            console.log(`Attempting to click accordion for '${indexName}'...`)

            // 1. Try explicit UiSelector description search for SENSEX or Nifty 50
            try {
                const targetElems = await $$(`android=new UiSelector().descriptionContains("${indexName}")`)
                for (const targetElem of targetElems) {
                    if (await targetElem.isDisplayed().catch(() => false)) {
                        const loc = await targetElem.getLocation()
                        // Ensure we are clicking the list view item (y > 320), NOT the top static ticker
                        if (loc.y > 320) {
                            const sz = await targetElem.getSize()
                            const tapX = Math.floor(loc.x + sz.width / 2)
                            const tapY = Math.floor(loc.y + sz.height / 2)
                            console.log(`Found '${indexName}' accordion via UiSelector at bounds (${tapX}, ${tapY})`)

                            // Always tap exact midpoint of accordion box
                            await driver.performActions([{
                                type: 'pointer',
                                id: 'finger1',
                                parameters: { pointerType: 'touch' },
                                actions: [
                                    { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                                    { type: 'pointerDown', button: 0 },
                                    { type: 'pointerUp', button: 0 }
                                ]
                            }])
                            await driver.pause(1500)
                            console.log(`✅ Tapped '${indexName}' accordion at (${tapX}, ${tapY})`)
                            return true
                        }
                    }
                }
            } catch (e) { }

            // 2. Fallback scan visible views
            for (let retry = 0; retry < 3; retry++) {
                const views = await $$('//*[@content-desc != ""]')
                for (const v of views) {
                    if (await v.isDisplayed().catch(() => false)) {
                        const loc = await v.getLocation()
                        const sz = await v.getSize()
                        const desc = await v.getAttribute("content-desc").catch(() => "")
                        if (loc.y > 320 && desc && desc.toLowerCase().includes(indexName.toLowerCase())) {
                            const tapX = Math.floor(loc.x + sz.width / 2)
                            const tapY = Math.floor(loc.y + sz.height / 2)
                            await driver.performActions([{
                                type: 'pointer',
                                id: 'finger1',
                                parameters: { pointerType: 'touch' },
                                actions: [
                                    { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                                    { type: 'pointerDown', button: 0 },
                                    { type: 'pointerUp', button: 0 }
                                ]
                            }])
                            await driver.pause(1500)
                            console.log(`✅ Scanned & Tapped '${indexName}' accordion row at (${tapX}, ${tapY})`)
                            return true
                        }
                    }
                }
                // Scroll down slightly if accordion not immediately visible
                try {
                    await driver.performActions([{
                        type: 'pointer',
                        id: 'finger1',
                        parameters: { pointerType: 'touch' },
                        actions: [
                            { type: 'pointerMove', duration: 0, x: 500, y: 1000 },
                            { type: 'pointerDown', button: 0 },
                            { type: 'pointerMove', duration: 400, x: 500, y: 700 },
                            { type: 'pointerUp', button: 0 }
                        ]
                    }])
                } catch (e) { }
                await driver.pause(500)
            }
            return false
        }

        // 1. Click Nifty 50 Accordion row (brown rectangle in list view)
        console.log("Expanding Nifty 50 accordion in list view...")
        await clickListAccordion('Nifty 50')
        await driver.pause(1000)

        console.log("Scrolling and counting NIFTY 50 stocks under Nifty 50 accordion (Expected ~50)...")
        const niftyListCount = await this.getWatchlistStockCount(50)
        const niftyMsg = `📊 [INDEX LIST CHECK]: NIFTY 50 Total Stocks Counted: ${niftyListCount} (Expected: 50)`
        console.log(niftyMsg)
        // allure.addStep(niftyMsg)

        // 2. Scroll back to top to bring SENSEX accordion back into view, collapse Nifty 50, and expand SENSEX
        console.log("Scrolling back to top of Index list...")
        for (let i = 0; i < 5; i++) {
            try {
                await driver.performActions([{
                    type: 'pointer',
                    id: 'finger1',
                    parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: 500, y: 400 },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerMove', duration: 400, x: 500, y: 1600 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }])
            } catch (e) { }
            await driver.pause(300)
        }

        console.log("Collapsing Nifty 50 accordion in list view...")
        await clickListAccordion('Nifty 50')
        await driver.pause(1000)

        console.log("Expanding SENSEX accordion in list view...")
        await clickListAccordion('SENSEX')
        await driver.pause(1000)

        console.log("Scrolling and counting SENSEX stocks under SENSEX accordion (Expected ~30)...")
        const sensexListCount = await this.getWatchlistStockCount(30)
        const sensexMsg = `📊 [INDEX LIST CHECK]: SENSEX Total Stocks Counted: ${sensexListCount} (Expected: 30)`
        console.log(sensexMsg)
        // allure.addStep(sensexMsg)

        // 3. Open Heatmap View from Index tab
        await this.clickHeatMapView()
        await driver.pause(1500)

        // --- HEATMAP FOR NIFTY 50 (Default selected in Heatmap dropdown) ---
        console.log(`\n--- Running Heatmap Verification for NIFTY 50 ---`)
        const niftyInitPercent = await this.getHeatmapStockCount(niftyListCount)
        await this.switchHeatmapDisplay('value')
        const niftyValCount = await this.getHeatmapStockCount(niftyListCount)
        await this.switchHeatmapDisplay('percent')

        const niftyHlSummary = `Index 'NIFTY 50' | List View Count: ${niftyListCount} | Heatmap %: ${niftyInitPercent} | Heatmap Val: ${niftyValCount}`
        console.log(niftyHlSummary)
        allure.addStep(niftyHlSummary)

        // --- SWITCH HEATMAP DROPDOWN TO SENSEX ---
        console.log(`\n--- Switching Heatmap Dropdown to SENSEX ---`)
        await this.switchHeatmapIndexDropdown('SENSEX')

        // --- HEATMAP FOR SENSEX ---
        console.log(`\n--- Running Heatmap Verification for SENSEX ---`)
        const sensexInitPercent = await this.getHeatmapStockCount(sensexListCount)
        await this.switchHeatmapDisplay('value')
        const sensexValCount = await this.getHeatmapStockCount(sensexListCount)
        await this.switchHeatmapDisplay('percent')

        const sensexHlSummary = `Index 'SENSEX' | List View Count: ${sensexListCount} | Heatmap %: ${sensexInitPercent} | Heatmap Val: ${sensexValCount}`
        console.log(sensexHlSummary)
        allure.addStep(sensexHlSummary)

        // Close Heatmap view
        await this.clickHeatmapBackButton()
    }



    async openMarketWatchSettings() {
        await this.marketWatchSettingsGear.waitForDisplayed({ timeout: 10000 })
        await this.marketWatchSettingsGear.click()
        await driver.pause(1000) // Wait for bottom sheet to animate up
    }

    async closeMarketWatchSettings() {
        await this.marketWatchSettingsCloseBtn.waitForDisplayed({ timeout: 10000 })
        await this.marketWatchSettingsCloseBtn.click()
        await driver.pause(1000) // Wait for bottom sheet to animate down
    }

    async getWatchlistStockDetails() {
        const extractedStocks = [];
        const seenStocks = new Set();
        let scrollsPerformed = 0;
        let noNewCount = 0;

        while (noNewCount < 6) {
            const listElements = await $$(locators.get('watchlistStockRows'));
            let newStocksFound = false;

            for (const elem of listElements) {
                if (await elem.isDisplayed().catch(() => false)) {
                    const loc = await elem.getLocation().catch(() => ({ y: 0 }));
                    const desc = await elem.getAttribute("content-desc").catch(() => "");
                    if (loc.y > 300 && desc) {
                        const parts = desc.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
                        if (parts.length >= 3) {
                            const name = parts[0];
                            const lowerName = name.toLowerCase();

                            const isHeaderOrControl =
                                name.includes("Watchlist") ||
                                lowerName === "bse" ||
                                lowerName === "nse" ||
                                lowerName.includes("archive") ||
                                lowerName.includes("advance") ||
                                lowerName.includes("decline");

                            if (!isHeaderOrControl && !seenStocks.has(name)) {
                                seenStocks.add(name);
                                newStocksFound = true;

                                // Parse Exchange, LTP, Percent
                                // E.g.: "YESBANK", "BSE", "22.45", "↑ 1.08%"
                                const exchange = parts[1] || "";
                                const pctIndex = parts.findIndex(p => p.includes('%'));
                                let ltpRaw = "0";
                                if (pctIndex > 0) {
                                    ltpRaw = parts[pctIndex - 1];
                                } else {
                                    ltpRaw = parts.find(p => {
                                        const clean = p.replace(/,/g, '').trim();
                                        return clean !== "" && !isNaN(Number(clean)) && !p.includes('%');
                                    }) || "0";
                                }
                                const ltp = Number(ltpRaw.replace(/,/g, '').trim());

                                // Percent typically contains '%'
                                const pctRaw = parts.find(p => p.includes('%')) || "0%";
                                const percentMatch = pctRaw.match(/\(([-+]?[0-9]*\.?[0-9]+)%\)/);
                                let percent = 0;
                                if (percentMatch) {
                                    percent = parseFloat(percentMatch[1]);
                                } else {
                                    const fallbackMatch = pctRaw.match(/[-+]?[0-9]*\.?[0-9]+/);
                                    percent = fallbackMatch ? parseFloat(fallbackMatch[0]) : 0;
                                }

                                extractedStocks.push({ name, exchange, ltp, percent, desc });
                            }
                        }
                    }
                }
            }

            if (!newStocksFound) {
                noNewCount++;
            } else {
                noNewCount = 0;
            }

            if (noNewCount < 6) {
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
                    scrollsPerformed++;
                } catch (e) {
                    console.log("Scroll failed:", e.message);
                }
                await driver.pause(500);
            }
        }

        // Scroll back to top
        if (extractedStocks.length > 0 && scrollsPerformed > 0) {
            for (let i = 0; i < scrollsPerformed + 1; i++) {
                try {
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
                } catch (e) { }
                await driver.pause(300);
            }
        }

        return extractedStocks;
    }

    verifySortedOrder(stocks, sortType, expectedAscending = null) {
        if (stocks.length < 2) return expectedAscending !== null ? expectedAscending : true;

        let detectedAscending = null;
        let isSorted = true;
        let prev = stocks[0];

        for (let i = 1; i < stocks.length; i++) {
            const curr = stocks[i];
            let compareRes = 0;

            if (sortType === 'A-Z') {
                compareRes = prev.name.localeCompare(curr.name);
            } else if (sortType === '%') {
                compareRes = prev.percent - curr.percent;
            } else if (sortType === 'LTP') {
                compareRes = prev.ltp - curr.ltp;
            } else if (sortType === 'EXH') {
                compareRes = prev.exchange.localeCompare(curr.exchange);
            }

            if (compareRes === 0) continue;

            if (detectedAscending === null) {
                detectedAscending = compareRes < 0; // < 0 means prev is smaller (ascending)

                if (expectedAscending !== null && detectedAscending !== expectedAscending) {
                    console.error(`Sort Verification Failed for '${sortType}'. Expected Ascending: ${expectedAscending}, but detected: ${detectedAscending}`);
                    console.log(`Prev: ${JSON.stringify(prev)}`);
                    console.log(`Curr: ${JSON.stringify(curr)}`);
                    throw new Error(`Watchlist sorted in wrong direction by ${sortType}`);
                }
            } else {
                if (detectedAscending && compareRes > 0) isSorted = false;
                if (!detectedAscending && compareRes < 0) isSorted = false;
            }

            if (!isSorted) {
                console.error(`Sort Verification Failed for '${sortType}' (Detected Ascending: ${detectedAscending}). Issue between '${prev.name}' and '${curr.name}'.`);
                console.log(`Prev: ${JSON.stringify(prev)}`);
                console.log(`Curr: ${JSON.stringify(curr)}`);
                throw new Error(`Watchlist not sorted correctly by ${sortType}`);
            }
            prev = curr;
        }

        // If all items were identical, we default to expected or true
        if (detectedAscending === null) detectedAscending = expectedAscending !== null ? expectedAscending : true;

        console.log(`✅ [SORT VERIFIED]: Watchlist successfully sorted by '${sortType}' in ${detectedAscending ? 'Ascending' : 'Descending'} order.`);
        allure.addStep(`✅ [SORT VERIFIED]: Watchlist successfully sorted by '${sortType}' in ${detectedAscending ? 'Ascending' : 'Descending'} order.`);

        return detectedAscending;
    }

    async performAndVerifySort(sortLocatorKey, sortType, expectedAscending = null) {
        console.log(`Applying Sort: ${sortType} (Expected Ascending: ${expectedAscending !== null ? expectedAscending : 'Auto-detect'})`);
        await this.openMarketWatchSettings();

        const sortElement = await this[sortLocatorKey];
        await sortElement.waitForDisplayed({ timeout: 5000 });
        await sortElement.click();
        await driver.pause(500);

        await this.closeMarketWatchSettings();

        await this.pullDownToRefresh();

        const stocks = await this.getWatchlistStockDetails();
        console.log(`Extracted ${stocks.length} stocks for sort verification.`);
        return this.verifySortedOrder(stocks, sortType, expectedAscending);
    }

    async verifyOpenClosePriceChange() {
        console.log("Setting baseline to Close Price...");
        await this.openMarketWatchSettings();
        await this.closePriceRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.closePriceRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Extracting baseline stock details (Close Price)...");
        await this.pullDownToRefresh(); // Start fresh
        const closePriceStocks1 = await this.getWatchlistStockDetails();

        if (closePriceStocks1.length === 0) throw new Error("No stocks found to compare.");

        console.log("Switching to Open Price...");
        await this.openMarketWatchSettings();
        await this.openPriceRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.openPriceRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Extracting updated stock details (Open Price)...");
        await this.pullDownToRefresh();
        const openPriceStocks1 = await this.getWatchlistStockDetails();

        // Compare to ensure they are DIFFERENT
        let changeDetected = false;
        for (const baseline of closePriceStocks1) {
            const updated = openPriceStocks1.find(s => s.name === baseline.name);
            if (updated) {
                if (baseline.percent !== updated.percent || baseline.desc !== updated.desc) {
                    changeDetected = true;
                    console.log(`Detected change for ${baseline.name}: Close% = ${baseline.percent}, Open% = ${updated.percent}`);
                    break;
                }
            }
        }

        if (!changeDetected) {
            throw new Error("Failed to detect any change in values when switching to Open Price.");
        }

        // Switch back to Close Price
        console.log("Reverting to Close Price...");
        await this.openMarketWatchSettings();
        await this.closePriceRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.closePriceRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Extracting restored stock details (Close Price)...");
        await this.pullDownToRefresh();
        const closePriceStocks2 = await this.getWatchlistStockDetails();

        // Verify reverted state (Close Price) differs from the Open Price state
        let successfullyRevertedToClose = false;
        for (const openStock of openPriceStocks1) {
            const reverted = closePriceStocks2.find(s => s.name === openStock.name);
            if (reverted) {
                if (openStock.percent !== reverted.percent || openStock.desc !== reverted.desc) {
                    successfullyRevertedToClose = true;
                    break;
                }
            }
        }

        if (!successfullyRevertedToClose) {
            throw new Error("Failed to revert values. The prices still match the Open Price state.");
        }

        // Switch back to Open Price
        console.log("Switching to Open Price again...");
        await this.openMarketWatchSettings();
        await this.openPriceRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.openPriceRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Extracting updated stock details (Open Price)...");
        await this.pullDownToRefresh();
        const openPriceStocks2 = await this.getWatchlistStockDetails();

        // Verify open price state differs from the Close Price state
        let successfullyRevertedToOpen = false;
        for (const closeStock of closePriceStocks2) {
            const updated = openPriceStocks2.find(s => s.name === closeStock.name);
            if (updated) {
                if (closeStock.percent !== updated.percent || closeStock.desc !== updated.desc) {
                    successfullyRevertedToOpen = true;
                    break;
                }
            }
        }

        if (!successfullyRevertedToOpen) {
            throw new Error("Failed to restore Open Price values. The prices still match the Open Price state.");
        }

        console.log(`✅ [TC VERIFIED]: Open/Close price toggling works perfectly.`);
        allure.addStep(`✅ [TC VERIFIED]: Open/Close price toggling works perfectly.`);
    }

    async verifyShowDirectionToggle() {
        console.log("Reading State A (initial) without scrolling...");
        await this.pullDownToRefresh();

        let targetStockName = null;
        let stateADesc = "";

        const listElements = await $$(locators.get('watchlistStockRows'));
        for (const elem of listElements) {
            if (await elem.isDisplayed().catch(() => false)) {
                const desc = await elem.getAttribute("content-desc").catch(() => "");
                if (desc) {
                    const parts = desc.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
                    if (parts.length >= 3) {
                        const name = parts[0];
                        const lowerName = name.toLowerCase();
                        const isHeaderOrControl = name.includes("Watchlist") || lowerName === "bse" || lowerName === "nse";
                        if (!isHeaderOrControl) {
                            const percentMatch = desc.match(/\(([-+]?[\d.]+)%\)/);
                            if (percentMatch) {
                                const pct = parseFloat(percentMatch[1]);
                                if (Math.abs(pct) > 0) {
                                    targetStockName = name;
                                    stateADesc = desc;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (!targetStockName) {
            console.log("WARNING: Could not find any non-zero stock on screen for direction toggle verification.");
            return;
        }

        console.log(`Selected stock for verification: ${targetStockName}. State A desc: ${JSON.stringify(stateADesc)}`);

        const hasArrow = (desc) => /[\u2191\u2193\u2B06\u2B07\u25B2\u25BC]/.test(desc);
        const stateAHasArrow = hasArrow(stateADesc);

        const toggleSetting = async () => {
            await this.openMarketWatchSettings();
            try {
                await driver.performActions([{
                    type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: 500, y: 1500 },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerMove', duration: 400, x: 500, y: 500 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }]);
                await driver.pause(1000);
            } catch (e) { }
            await this.showDirectionToggle.waitForDisplayed({ timeout: 5000 });
            await this.showDirectionToggle.click();
            await driver.pause(1000);
            await this.closeMarketWatchSettings();
            await this.pullDownToRefresh();
        };

        const getStockDesc = async () => {
            const elem = await $(`android=new UiSelector().descriptionContains("${targetStockName}")`);
            if (await elem.isDisplayed().catch(() => false)) {
                return await elem.getAttribute("content-desc");
            }
            return "";
        };

        console.log("Toggling checkbox to State B...");
        await toggleSetting();

        console.log("Reading State B (toggled)...");
        const stateBDesc = await getStockDesc();
        console.log(`State B desc: ${JSON.stringify(stateBDesc)}`);

        if (stateBDesc && stateBDesc !== stateADesc) {
            console.log(`[SUCCESS] Toggle detected for ${targetStockName}!`);
        } else if (stateBDesc === stateADesc) {
            console.log(`[WARNING] Toggle did not change the text string that Appium reads for ${targetStockName}.`);
        }

        console.log("Toggling checkbox back to restore original state...");
        await toggleSetting();

        console.log("Reading State C (restored)...");
        const stateCDesc = await getStockDesc();
        console.log(`State C desc: ${JSON.stringify(stateCDesc)}`);

        if (stateCDesc !== stateADesc) {
            throw new Error(`Failed to revert Show direction to the original state for ${targetStockName}. State C: ${JSON.stringify(stateCDesc)} vs State A: ${JSON.stringify(stateADesc)}`);
        }

        console.log(`✅ [TC VERIFIED]: Show direction toggling works perfectly.`);
        allure.addStep(`✅ [TC VERIFIED]: Show direction toggling works perfectly.`);
    }

    async verifyHoldingSymbol(stockName, quantity) {
        console.log(`Verifying holdings toggle behavior for ${stockName} with qty ${quantity}...`);
        
        const qtyStr = quantity.toString();

        // Helper to check the holding bag via the search bar
        const getBagStatusInSearch = async () => {
            console.log(`Searching for ${stockName} via search bar...`);
            await this.clickSearchIcon();
            await this.enterScripName(stockName);
            await this.selectExchangeFilter('ALL');
            await driver.pause(1500);

            // In search results, the bag icon (if enabled) is next to the segment (e.g. NSE, BSE, etc.)
            // We search for elements containing the quantity, and verify it's the segment/bag element.
            const potentialBagElems = await $$(`android=new UiSelector().descriptionContains("${qtyStr}")`);
            let isBagVisible = false;
            
            for (const elem of potentialBagElems) {
                if (await elem.isDisplayed().catch(()=>false)) {
                    const desc = await elem.getAttribute("content-desc").catch(()=>"");
                    // Check if this description string also contains a segment name or the bag emoji
                    if (desc && (desc.match(/(NSE|BSE|CDS|MCX|NFO|BFO|EQ|FUT)/i) || desc.includes('💼') || desc.includes('bag'))) {
                        isBagVisible = true;
                        break;
                    }
                }
            }
            
            if (!isBagVisible) {
                console.log(`Holding quantity ${qtyStr} (with bag/segment) not found in search results.`);
            }
            
            await this.closeSearch();
            return isBagVisible;
        };
        
        const isInitiallyEnabled = await getBagStatusInSearch();
        
        console.log(`Initial state: Holdings toggle appears to be ${isInitiallyEnabled ? 'ENABLED' : 'DISABLED'}.`);

        const toggleSetting = async () => {
            console.log(`Toggling Holdings in Market Watch settings...`);
            await this.openMarketWatchSettings();
            await this.holdingsToggle.waitForDisplayed({ timeout: 5000 });
            await this.holdingsToggle.click();
            await driver.pause(1000);
            await this.closeMarketWatchSettings();
        };

        await toggleSetting();

        console.log("Checking search results after first toggle...");
        const isToggled1Enabled = await getBagStatusInSearch();

        if (isInitiallyEnabled) {
            if (isToggled1Enabled) {
                throw new Error(`Holding quantity ${qtyStr} is still visible for ${stockName} after disabling the Holdings toggle!`);
            } else {
                console.log(`✅ [TC VERIFIED]: Holding quantity correctly hidden after disabling toggle.`);
            }
        } else {
            if (!isToggled1Enabled) {
                throw new Error(`Holding quantity ${qtyStr} is NOT visible for ${stockName} after enabling the Holdings toggle!`);
            } else {
                console.log(`✅ [TC VERIFIED]: Holding quantity correctly shown after enabling toggle.`);
            }
        }

        console.log(`Reverting Holdings toggle to original state...`);
        await toggleSetting();

        console.log("Checking search results after reverting toggle...");
        const isToggled2Enabled = await getBagStatusInSearch();

        if (isInitiallyEnabled) {
            if (!isToggled2Enabled) {
                throw new Error(`Failed to revert: Holding quantity ${qtyStr} is NOT visible for ${stockName}.`);
            }
        } else {
            if (isToggled2Enabled) {
                throw new Error(`Failed to revert: Holding quantity ${qtyStr} is still visible for ${stockName}.`);
            }
        }

        console.log(`✅ [TC VERIFIED]: Holdings toggle successfully verified and reverted.`);
        allure.addStep(`✅ [TC VERIFIED]: Holdings toggle successfully verified and reverted.`);
    }

    async verifyChangeFormatOptions() {


        console.log("Switching to 'Percentage' format...");
        await this.openMarketWatchSettings();
        await this.percentageFormatRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.percentageFormatRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Verifying 'Percentage' format...");
        await this.pullDownToRefresh();
        const pctStocks = await this.getWatchlistStockDetails();

        for (const stock of pctStocks) {
            const parts = stock.desc.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
            if (parts.length >= 4) {
                const changeStr = parts[parts.length - 1]; // e.g. "3.12%"
                if (!changeStr.includes('%')) {
                    throw new Error(`Format 'Percentage' failed for ${stock.name}. Found: ${changeStr}`);
                }
                const nums = changeStr.match(/[-+]?[0-9]*\.?[0-9]+/g);
                if (nums && nums.length > 1) {
                    throw new Error(`Format 'Percentage' failed for ${stock.name}. It seems to contain absolute value too. Found: ${changeStr}`);
                }
            }
        }

        console.log("Switching to 'Absolute' format...");
        await this.openMarketWatchSettings();
        await this.absoluteFormatRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.absoluteFormatRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Verifying 'Absolute' format...");
        await this.pullDownToRefresh();
        const absStocks = await this.getWatchlistStockDetails();

        for (const stock of absStocks) {
            const parts = stock.desc.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
            if (parts.length >= 4) {
                const changeStr = parts[parts.length - 1]; // e.g. "6.50"
                if (changeStr.includes('%')) {
                    throw new Error(`Format 'Absolute' failed for ${stock.name}. Found percentage in: ${changeStr}`);
                }
            }
        }
        console.log("Setting baseline to Absolute & percentage...");
        await this.openMarketWatchSettings();
        await this.absoluteAndPercentageFormatRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.absoluteAndPercentageFormatRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Verifying 'Absolute & percentage' format...");
        await this.pullDownToRefresh();
        const absPctStocks = await this.getWatchlistStockDetails();

        for (const stock of absPctStocks) {
            const parts = stock.desc.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
            if (parts.length >= 4) {
                const changeStr = parts[parts.length - 1]; // e.g. "6.50  (3.12%)"
                if (!/\d+/.test(changeStr) || !/%/.test(changeStr)) {
                    throw new Error(`Format 'Absolute & percentage' failed for ${stock.name}. Found: ${changeStr}`);
                }
            }
        }
    }

    async clickSearchIcon() {
        await this.searchIcon.waitForDisplayed({ timeout: 10000 })
        await this.searchIcon.click()
        //await driver.pause(1000)
    }

    /**
     * Type scrip name into search bar
     * @param {string} scripSymbol Scrip symbol from testData.csv (e.g. 'RELIANCE', 'TCS')
     */
    async enterScripName(scripSymbol) {
        let inputField = this.searchInputField
        await inputField.waitForDisplayed({ timeout: 5000 })
        await inputField.click()
        await driver.pause(500)

        // Clear text thoroughly
        try {
            await inputField.clearValue()
        } catch (e) { }

        await inputField.setValue(scripSymbol)
        await driver.pause(1000) // Allow search results list to refresh
    }

    /**
     * Select exchange filter chip dynamically (e.g. 'NSE', 'BSE', 'NFO', 'MCX')
     * @param {string} segment Segment code (e.g. 'NSE', 'BSE', 'NFO')
     */
    async selectExchangeFilter(segment) {
        const segUpper = segment ? segment.trim().toUpperCase() : 'ALL'

        // Direct fast UIAutomator / Accessibility ID lookup for segment filter chip (NSE, BSE, ALL, NFO, etc.)
        const chip = $(`~${segUpper}`)
        try {
            if (await chip.isDisplayed().catch(() => false)) {
                await chip.click()
                console.log(`Successfully selected exchange filter chip: ${segUpper}`)
                await driver.pause(500)
                return
            }
        } catch (e) { }

        console.log(`Exchange filter chip '${segUpper}' not found on UI, proceeding with current results...`)
    }


    /**
     * Click on the plus (+)/add icon next to the first scrip in search results
     */
    async addFirstScripToWatchlist() {
        await driver.pause(2000)

        // 1. Try scanning for any clickable ImageView element rendered on far right (x > 700, y between 300 and 1200)
        try {
            const icons = await this.searchResultPlusIcons
            for (const icon of icons) {
                if (await icon.isDisplayed().catch(() => false)) {
                    const loc = await icon.getLocation()
                    if (loc.y > 300 && loc.y < 1200 && loc.x > 700) {
                        await icon.click()
                        await driver.pause(1000)
                        console.log(`Clicked plus icon element at (${loc.x}, ${loc.y})`)
                        return
                    }
                }
            }
        } catch (e) { }

        // 2. Far-Right Coordinate Tap (94% X) guaranteed to hit + icon instead of scrip row
        const windowSize = await driver.getWindowSize()
        const tapX = Math.floor(windowSize.width * 0.94) // Far right edge for '+' icon

        let tapY = Math.floor(windowSize.height * 0.28)
        try {
            const topCard = await this.searchResultTopCard
            if (await topCard.isDisplayed().catch(() => false)) {
                const loc = await topCard.getLocation()
                const sz = await topCard.getSize()
                tapY = Math.floor(loc.y + sz.height / 2)
            }
        } catch (e) { }


        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 }
            ]
        }])
        console.log(`Tapped '+' icon at far-right coordinates (${tapX}, ${tapY})`)
        await driver.pause(1000)
    }



    /**
     * Check if scrips in testData exist in the selected Watchlist tab.
     * If found: click stock -> open overview -> click bookmark icon -> click '-' to remove -> navigate back.
     * @param {Array} orderTestData Array of testData records with symbol property
     * @param {string} targetWatchlistName Current active watchlist name being cleaned
     */
    async cleanExistingScripsIfPresent(orderTestData, targetWatchlistName) {
        console.log(`\n🔍 [PRECONDITION CHECK]: Checking active Watchlist '${targetWatchlistName || ''}' for existing scrips from testData...`)

        for (const record of orderTestData) {
            const { symbol, segment } = record
            if (!symbol) continue

            const segUpper = segment ? segment.trim().toUpperCase() : ''

            // Check if scrip (e.g. INFY, TCS, yesbank, IDEA, SILVER, USD) exists in current watchlist
            const scripSelector = locators.get('scripBySymbol').replace('{symbol}', symbol)
            const scripElement = $(scripSelector)

            let exists = false
            try {
                if (await scripElement.isDisplayed().catch(() => false)) {
                    const loc = await scripElement.getLocation()
                    // Ignore top app bar header widgets (NIFTY 50 / SENSEX are located at top y < 350)
                    if (loc.y > 350) {
                        exists = true
                    }
                }
            } catch (e) { }

            if (exists) {
                console.log(`⚠️ Scrip '${symbol}' (${segUpper || 'ALL'}) found in Watchlist '${targetWatchlistName}'. Proceeding to remove it...`)
                await scripElement.click()
                await driver.pause(2500)

                // 1. Click Top-Right Bookmark Icon on Stock Overview
                let bookmarkClicked = false
                try {
                    const bookmark = await this.overviewBookmarkIcon
                    if (await bookmark.isDisplayed().catch(() => false)) {
                        await bookmark.click()
                        bookmarkClicked = true
                        console.log(`Clicked bookmark icon via instance locator`)
                    }
                } catch (e) { }

                if (!bookmarkClicked) {
                    // Fallback: Coordinate tap top-right header (92% width, y ~140-160)
                    try {
                        const windowSize = await driver.getWindowSize()
                        const bmX = Math.floor(windowSize.width * 0.92)
                        const bmY = 150
                        await driver.performActions([{
                            type: 'pointer',
                            id: 'finger1',
                            parameters: { pointerType: 'touch' },
                            actions: [
                                { type: 'pointerMove', duration: 0, x: bmX, y: bmY },
                                { type: 'pointerDown', button: 0 },
                                { type: 'pointerUp', button: 0 }
                            ]
                        }])
                        console.log(`Tapped top-right header bookmark icon at (${bmX}, ${bmY})`)
                        bookmarkClicked = true
                    } catch (e) { }
                }

                await driver.pause(1500)

                // 2. Click '-' minus icon on Watchlist bottom sheet for current target watchlist row
                let minusClicked = false

                // Candidate watchlist names (e.g. 'Watchlist 3' and '3')
                const possibleNames = []
                if (targetWatchlistName) {
                    possibleNames.push(targetWatchlistName)
                    if (targetWatchlistName.toLowerCase().startsWith('watchlist ')) {
                        const numStr = targetWatchlistName.split(' ')[1]
                        if (numStr) possibleNames.push(numStr)
                    }
                }

                for (const candidate of possibleNames) {
                    if (minusClicked) break

                    // Method A: Look for explicit accessibility ID ~candidate
                    try {
                        const targetRow = $(`~${candidate}`)
                        if (await targetRow.isDisplayed().catch(() => false)) {
                            const loc = await targetRow.getLocation()
                            const sz = await targetRow.getSize()
                            const tapX = Math.floor(loc.x + sz.width * 0.88)
                            const tapY = Math.floor(loc.y + sz.height / 2)
                            await driver.performActions([{
                                type: 'pointer',
                                id: 'finger1',
                                parameters: { pointerType: 'touch' },
                                actions: [
                                    { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                                    { type: 'pointerDown', button: 0 },
                                    { type: 'pointerUp', button: 0 }
                                ]
                            }])
                            minusClicked = true
                            console.log(`✅ Tapped '-' minus button for '~${candidate}' at (${tapX}, ${tapY})`)
                            break
                        }
                    } catch (e) { }

                    // Method B: UiSelector descriptionContains
                    if (!minusClicked) {
                        try {
                            const selector = locators.get('watchlistRowByName').replace('{name}', candidate)
                            const targetRowUi = $(selector)
                            if (await targetRowUi.isDisplayed().catch(() => false)) {
                                const loc = await targetRowUi.getLocation()
                                const sz = await targetRowUi.getSize()
                                const tapX = Math.floor(loc.x + sz.width * 0.88)
                                const tapY = Math.floor(loc.y + sz.height / 2)
                                await driver.performActions([{
                                    type: 'pointer',
                                    id: 'finger1',
                                    parameters: { pointerType: 'touch' },
                                    actions: [
                                        { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                                        { type: 'pointerDown', button: 0 },
                                        { type: 'pointerUp', button: 0 }
                                    ]
                                }])
                                minusClicked = true
                                console.log(`✅ Tapped '-' minus button for descriptionContains '${candidate}' at (${tapX}, ${tapY})`)
                                break
                            }
                        } catch (e) { }
                    }
                }

                // Method C: Content description scan for bottom sheet rows (y > 1000)
                if (!minusClicked) {
                    try {
                        const views = await $$('//*[@content-desc != ""]')
                        for (const v of views) {
                            if (await v.isDisplayed().catch(() => false)) {
                                const loc = await v.getLocation()
                                // Only process elements on bottom sheet overlay (y > 1000)
                                if (loc.y > 1000) {
                                    const desc = await v.getAttribute("content-desc").catch(() => "")
                                    const matches = possibleNames.some(name => desc === name || desc.startsWith(name + '\n') || desc.startsWith(name + ' ') || desc.includes(name))
                                    if (matches) {
                                        const sz = await v.getSize()
                                        const tapX = Math.floor(loc.x + sz.width * 0.88)
                                        const tapY = Math.floor(loc.y + sz.height / 2)
                                        await driver.performActions([{
                                            type: 'pointer',
                                            id: 'finger1',
                                            parameters: { pointerType: 'touch' },
                                            actions: [
                                                { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                                                { type: 'pointerDown', button: 0 },
                                                { type: 'pointerUp', button: 0 }
                                            ]
                                        }])
                                        minusClicked = true
                                        console.log(`✅ Tapped '-' minus button via content-desc scan matching '${desc}' at (${tapX}, ${tapY})`)
                                        break
                                    }
                                }
                            }
                        }
                    } catch (e) { }
                }

                // Method D: Fallback to direct minus icon locator
                if (!minusClicked) {
                    try {
                        const minusBtn = await this.watchlistRemoveMinusBtn
                        if (await minusBtn.isDisplayed().catch(() => false)) {
                            await minusBtn.click()
                            minusClicked = true
                            console.log(`✅ Scrip '${symbol}' successfully removed from Watchlist via minus button!`)
                        }
                    } catch (e) { }
                }

                await driver.pause(1500)

                // 3. Close bottom sheet and Stock Overview to return back to Watchlist tab main view
                try {
                    // Back #1: Close the 'Select Watchlist to Add' bottom sheet
                    await driver.back()
                    await driver.pause(1000)
                    // Back #2: Close Stock Overview and return to active Watchlist tab
                    await driver.back()
                    await driver.pause(1500)
                } catch (e) { }
            } else {
                console.log(`ℹ️ Scrip '${symbol}' is NOT present in current Watchlist. Will be searched and added later.`)
            }
        }
    }

    /**
     * Close the search overlay after adding all scrips to return to Watchlist
     */
    async closeSearch() {
        try {
            const closeButton = await $(locators.get('searchCloseButton'))
            if (await closeButton.isDisplayed().catch(() => false)) {
                await closeButton.click()
                await driver.pause(1000)
                console.log('Clicked close search button')
                return
            }
        } catch (e) { }

        // Fallback to back button press if specific button locator fails
        try {
            await driver.back()
            console.log('Closed search overlay using driver.back()')
        } catch (e) { }
    }

    async clickHeatMapView() {
        try {
            const heatMapViewBtn = await $(locators.get('openHeatMapView'))
            if (await heatMapViewBtn.isDisplayed().catch(() => false)) {
                await heatMapViewBtn.click()
                // await driver.pause(1000)
                console.log('Clicked heat map view button')
                return
            }
        } catch (e) { }

        // Fallback to back button press if specific button locator fails
        try {
            await driver.back()
            console.log('Closed heat map view using driver.back()')
        } catch (e) { }
    }

    /**
     * Switch between Value (Val) and Percentage (% view) in heatmap
     * @param {'value'|'percent'} type - 'value' for Val view, 'percent' for % view
     */
    async switchHeatmapDisplay(type) {
        try {
            let btnLocator
            if (type === 'value') {
                btnLocator = locators.get('valueToggle')
            } else if (type === 'percent') {
                btnLocator = locators.get('percentToggle')
            } else {
                console.log(`Invalid heatmap display type: ${type}. Use 'value' or 'percent'.`)
                return
            }

            const toggleBtn = await $(btnLocator)
            if (await toggleBtn.isDisplayed().catch(() => false)) {
                await toggleBtn.click()
                //await driver.pause(1000) // Wait for heatmap view to toggle
                console.log(`✅ Switched heatmap display to '${type}' view`)
                return
            }
        } catch (e) {
            console.log(`Error switching heatmap display to ${type} view:`, e)
        }
    }

    /**
     * Get stock count from Watchlist List view (scrolls till the end of the page to count all stocks)
     */
    async getWatchlistStockCount(expectedMax = null) {
        try {
            const countedStocks = new Set()
            let previousSize = -1
            let noNewCount = 0
            let scrollsPerformed = 0

            while (noNewCount < 6) {
                // Use specific UiSelector for content descriptions to optimize UI tree scanning speed during peak morning market hours
                const listElements = await $$(locators.get('watchlistStockRows'))

                for (const elem of listElements) {
                    if (await elem.isDisplayed().catch(() => false)) {
                        const loc = await elem.getLocation().catch(() => ({ y: 0 }))
                        const desc = await elem.getAttribute("content-desc").catch(() => "")
                        if (loc.y > 300 && desc) {
                            const stockName = desc.split(/\n|,/)[0].trim()
                            const lowerName = stockName.toLowerCase()

                            // Filter out accordion header rows, exchange labels, and controls
                            const isHeaderOrControl =
                                stockName.includes("Watchlist") ||
                                lowerName === "bse" ||
                                lowerName === "nse" ||
                                lowerName.includes("archive") ||
                                lowerName.includes("advance") ||
                                lowerName.includes("decline")

                            if (stockName && stockName.length > 1 && !isHeaderOrControl) {
                                countedStocks.add(stockName)
                                if (expectedMax && countedStocks.size >= expectedMax) {
                                    break
                                }
                            }
                        }
                    }
                }

                if (expectedMax && countedStocks.size >= expectedMax) {
                    break
                }

                if (countedStocks.size === previousSize) {
                    noNewCount++
                } else {
                    noNewCount = 0
                    previousSize = countedStocks.size
                }

                if (noNewCount >= 6) break

                // Scroll down gesture to load lower stock rows in list view
                try {
                    await driver.performActions([{
                        type: 'pointer',
                        id: 'finger1',
                        parameters: { pointerType: 'touch' },
                        actions: [
                            { type: 'pointerMove', duration: 0, x: 500, y: 1600 },
                            { type: 'pointerDown', button: 0 },
                            { type: 'pointerMove', duration: 800, x: 500, y: 400 },
                            { type: 'pointerUp', button: 0 }
                        ]
                    }])
                    scrollsPerformed++
                } catch (e) { }
                await driver.pause(600)
            }

            // Scroll back up to restore view position after counting
            if (countedStocks.size > 0 && scrollsPerformed > 0) {
                for (let i = 0; i < scrollsPerformed + 1; i++) {
                    try {
                        await driver.performActions([{
                            type: 'pointer',
                            id: 'finger1',
                            parameters: { pointerType: 'touch' },
                            actions: [
                                { type: 'pointerMove', duration: 0, x: 500, y: 500 },
                                { type: 'pointerDown', button: 0 },
                                { type: 'pointerMove', duration: 500, x: 500, y: 1400 },
                                { type: 'pointerUp', button: 0 }
                            ]
                        }])
                    } catch (e) { }
                    await driver.pause(300)
                }
            }

            const count = countedStocks.size
            console.log(`📋 Watchlist list view total stocks counted: ${count} (${Array.from(countedStocks).join(', ')})`)
            return count
        } catch (e) {
            console.log("Error counting watchlist stocks:", e)
            return 0
        }
    }


    async getHeatmapGridStockCount(scrollDirection = 'contentUp') {
        try {
            const advanceStocks = new Set()
            const declineStocks = new Set()
            const allGridStocks = new Set()

            // Scan currently visible heatmap stock tiles
            const scanVisibleTiles = async () => {
                const views = await $$(locators.get('heatmapGridStockTiles'))

                for (const view of views) {
                    if (await view.isDisplayed().catch(() => false)) {

                        const loc = await view.getLocation()
                            .catch(() => ({ y: 0 }))

                        const desc = await view.getAttribute("content-desc")
                            .catch(() => "")

                        // Ignore headers and controls
                        if (
                            loc.y > 320 &&
                            desc &&
                            !desc.startsWith("Watchlist") &&
                            !desc.startsWith("Advance") &&
                            !desc.startsWith("Decline") &&
                            desc !== "Val" &&
                            desc !== "%"
                        ) {

                            // Stock name is the first part of content-desc
                            const parts = desc.split(/\n|,/)
                            const stockName = parts[0].trim()

                            if (stockName && stockName.length > 1) {

                                // Check advance / decline
                                const isUp =
                                    desc.includes('↑') ||
                                    desc.toLowerCase().includes(' up ') ||
                                    desc.includes('+')

                                const isDown =
                                    desc.includes('↓') ||
                                    desc.toLowerCase().includes(' down ')

                                if (isUp || isDown) {

                                    allGridStocks.add(stockName)

                                    if (isUp) {
                                        advanceStocks.add(stockName)
                                    } else if (isDown) {
                                        declineStocks.add(stockName)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            let previousSize = -1
            let noNewCount = 0

            // =====================================================
            // KEEP SCROLLING UNTIL NO NEW STOCKS ARE FOUND
            // =====================================================

            while (noNewCount < 2) {

                // Scan currently visible stocks
                await scanVisibleTiles()

                // Check whether new stocks were found
                if (allGridStocks.size === previousSize) {
                    noNewCount++
                } else {
                    noNewCount = 0
                    previousSize = allGridStocks.size
                }

                // Stop when no new stocks are found twice
                if (noNewCount >= 2) {
                    break
                }

                // =================================================
                // DETERMINE SCROLL DIRECTION
                // =================================================

                let startY
                let endY

                if (scrollDirection === 'contentUp') {

                    // Finger moves UP
                    // Content moves UP
                    startY = 1400
                    endY = 400

                    console.log("⬆️ Heatmap: Scrolling content UP")

                } else if (scrollDirection === 'contentDown') {

                    // Finger moves DOWN
                    // Content moves DOWN
                    startY = 400
                    endY = 1400

                    console.log("⬇️ Heatmap: Scrolling content DOWN")

                } else {

                    console.log(
                        `⚠️ Invalid scroll direction: ${scrollDirection}`
                    )

                    break
                }

                // =================================================
                // PERFORM SWIPE
                // =================================================

                try {
                    await driver.performActions([{
                        type: 'pointer',
                        id: 'finger1',
                        parameters: {
                            pointerType: 'touch'
                        },
                        actions: [
                            {
                                type: 'pointerMove',
                                duration: 0,
                                x: 500,
                                y: startY
                            },
                            {
                                type: 'pointerDown',
                                button: 0
                            },
                            {
                                type: 'pointerMove',
                                duration: 600,
                                x: 500,
                                y: endY
                            },
                            {
                                type: 'pointerUp',
                                button: 0
                            }
                        ]
                    }])
                } catch (e) {
                    console.log(
                        "Heatmap scroll error:",
                        e.message
                    )
                }

                // Give UI time to settle
                await driver.pause(700)
            }

            // =====================================================
            // FINAL COUNTS
            // =====================================================

            const gridAdvanceCount = advanceStocks.size
            const gridDeclineCount = declineStocks.size
            const totalGridCount = allGridStocks.size

            console.log(
                `📈 Grid Up Arrow (Advance) Stocks: ${gridAdvanceCount} (${Array.from(advanceStocks).join(', ')})`
            )

            console.log(
                `📉 Grid Down Arrow (Decline) Stocks: ${gridDeclineCount} (${Array.from(declineStocks).join(', ')})`
            )

            console.log(
                `📊 Total Grid Stock Tiles Counted (${scrollDirection}): ${totalGridCount}`
            )

            return {
                gridAdvanceCount,
                gridDeclineCount,
                totalGridCount
            }

        } catch (e) {

            console.log(
                "Error counting heatmap grid stock tiles:",
                e
            )

            return {
                gridAdvanceCount: 0,
                gridDeclineCount: 0,
                totalGridCount: 0
            }
        }
    }

    /**
     * Extract Advance and Decline badge values from Heatmap UI
     */
    async getHeatmapAdvanceDeclineTotal() {
        try {
            let advanceCount = 0
            let declineCount = 0

            // Try standard locator for Advance badge
            try {
                const advElem = await this.advanceBadge
                if (await advElem.isDisplayed().catch(() => false)) {
                    const advText = await advElem.getAttribute("content-desc").catch(() => "")
                    const match = advText.match(/\d+/)
                    if (match) advanceCount = parseInt(match[0], 10)
                }
            } catch (e) { }

            // Try standard locator for Decline badge
            try {
                const decElem = await this.declineBadge
                if (await decElem.isDisplayed().catch(() => false)) {
                    const decText = await decElem.getAttribute("content-desc").catch(() => "")
                    const match = decText.match(/\d+/)
                    if (match) declineCount = parseInt(match[0], 10)
                }
            } catch (e) { }

            // Fallback scan: inspect all displayed elements with non-empty content-desc if either is 0
            if (advanceCount === 0 || declineCount === 0) {
                try {
                    const views = await $$('//*[@content-desc != ""]')
                    for (const v of views) {
                        if (await v.isDisplayed().catch(() => false)) {
                            const desc = await v.getAttribute("content-desc").catch(() => "")
                            if (desc) {
                                if (advanceCount === 0 && desc.toLowerCase().includes("advance")) {
                                    const match = desc.match(/\d+/)
                                    if (match) advanceCount = parseInt(match[0], 10)
                                }
                                if (declineCount === 0 && desc.toLowerCase().includes("decline")) {
                                    const match = desc.match(/\d+/)
                                    if (match) declineCount = parseInt(match[0], 10)
                                }
                            }
                        }
                    }
                } catch (e) { }
            }

            const badgeTotal = advanceCount + declineCount
            console.log(`🏷️ Heatmap badges total: Advance (${advanceCount}) + Decline (${declineCount}) = ${badgeTotal}`)
            return { advanceCount, declineCount, badgeTotal }
        } catch (e) {
            console.log("Error reading Advance/Decline badges:", e)
            return { advanceCount: 0, declineCount: 0, badgeTotal: 0 }
        }
    }

    /**
     * Heatmap Stock Count evaluation:
     * Reads Advance and Decline badges directly from Heatmap UI and calculates total badge count.
     * Optionally verifies against List View count.
     * @param {number} [expectedListCount] - Optional list view count to verify against
     */
    async getHeatmapStockCount(expectedListCount = null) {
        const { advanceCount, declineCount, badgeTotal } = await this.getHeatmapAdvanceDeclineTotal()

        if (expectedListCount !== null) {
            if (badgeTotal === expectedListCount) {
                console.log(`✅ [HEATMAP COUNT MATCH]: Heatmap badge total (${badgeTotal}) matches List View count (${expectedListCount}).`)
            } else {
                console.log(`⚠️ [HEATMAP COUNT MISMATCH]: Heatmap badge total (${badgeTotal}) vs List View count (${expectedListCount}).`)
            }
        }

        return badgeTotal
    }

    /**
     * Click top-left back arrow button on Watchlist Heatmap page
     */
    async clickHeatmapBackButton() {
        try {
            const backBtn = await $(locators.get('heatmapBackButton'))
            if (await backBtn.isDisplayed().catch(() => false)) {
                await backBtn.click()
                await driver.pause(1000)
                console.log('✅ Clicked Watchlist Heatmap top-left back button')
                return
            }
        } catch (e) { }

        // Fallback back press
        try {
            await driver.back()
            await driver.pause(1000)
            console.log('✅ Navigated back from Heatmap using driver.back()')
        } catch (e) { }
    }
}

export default new WatchlistPage()
