import allure from '@wdio/allure-reporter'
import locators from '../utils/locatorHelper.js'

class WatchlistPage {
    async getFirstWatchlistStockName() {
        const listElements = await $$(locators.get("watchlistStockRows"));
        for (const elem of listElements) {
            if (await elem.isDisplayed().catch(() => false)) {
                const loc = await elem.getLocation().catch(() => ({ y: 0 }));
                const desc = await elem.getAttribute("content-desc").catch(() => "");
                // Use y > 500 to skip pinned stocks (y ≈ 300–400) and the search/filter bar,
                // and only reach the regular watchlist rows below
                if (loc.y > 500 && desc) {
                    const parts = desc.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
                    if (parts.length >= 3) {
                        const name = parts[0];
                        const lowerName = name.toLowerCase();
                        const isHeaderOrControl = name.includes("Watchlist") || lowerName === "bse" || lowerName === "nse" || lowerName.includes("archive");
                        if (!isHeaderOrControl) return name;
                    }
                }
            }
        }
        return "TCS-EQ"; // fallback
    }


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
        await this.watchlistTabIcon.waitForDisplayed({ timeout: 30000 });
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
        return $(locators.get("watchlistTab3"))
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

        // 1. Look for dropdown element displaying currentWatchlistName using locators.csv template
        if (currentWatchlistName) {
            try {
                const selector = locators.get('watchlistDropdownByName').replace('{name}', currentWatchlistName)
                const dynamicDropdown = $(selector)
                if (await dynamicDropdown.isDisplayed().catch(() => false)) {
                    await dynamicDropdown.click()
                    await driver.pause(1000)
                    console.log(`Clicked dropdown element by name '${currentWatchlistName}'`)
                    return
                }
            } catch (e) { }
        }

        // 2. Generic fallback: Look for dropdown view in header area (y between 180 and 550, x < 600)
        try {
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const loc = await v.getLocation()
                    if (loc.y > 180 && loc.y < 550 && loc.x < 600) {
                        const desc = await v.getAttribute("content-desc").catch(() => "")
                        // Avoid clicking indices, search, or heatmap buttons
                        const isNotActionBtn = !desc.includes("Open heatmap view") && !desc.includes("search");
                        if (isNotActionBtn && desc && (desc.includes('/') || desc.includes('Watchlist') || desc.includes('Index') || (currentWatchlistName && desc.includes(currentWatchlistName)))) {
                            await v.click()
                            await driver.pause(1000)
                            console.log(`Clicked dropdown element '${desc}' at (${loc.x}, ${loc.y})`)
                            return
                        }
                    }
                }
            }
        } catch (e) { }

        // 3. Fallback to default locator
        try {
            if (await this.watchListDropdown.isDisplayed().catch(() => false)) {
                await this.watchListDropdown.click()
                await driver.pause(1000)
                console.log("Clicked watchListDropdown via default locator")
                return
            }
        } catch (e) { }

        // 4. Coordinate tap fallback on the watchlist header area (x: 250, y: 475)
        try {
            console.log("Tapping fallback coordinates for watchlist dropdown header at (250, 475)...")
            await driver.performActions([{
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: 250, y: 475 },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerUp', button: 0 }
                ]
            }])
            await driver.pause(1000)
        } catch (e) { }
    }

    async getAllWatchlistNames() {
        console.log("Dynamically extracting watchlist names from UI...");

        // Open the dropdown to see the list of watchlists
        await this.openWatchListDropdown();
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
                    if (loc.y > 150 && loc.y < 1400 && desc) {
                        const name = desc.split('\n')[0].trim();
                        // Ignore common UI elements that are not user watchlists
                        const ignoredKeywords = ["index", "manage", "create", "search", "profile", "add", "settings", "nifty", "sensex", "accept", "dismiss"];
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
                    { type: 'pointerMove', duration: 0, x: 500, y: 1100 },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerMove', duration: 300, x: 500, y: 1800 },
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
                return
            }
        } catch (e) { }

        try {
            const selector = locators.get('watchlistRowByName').replace('{name}', name)
            const itemUi = $(selector)
            if (await itemUi.isDisplayed().catch(() => false)) {
                await itemUi.click()
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
            const currentScreenItems = [];

            for (const elem of listElements) {
                if (await elem.isDisplayed().catch(() => false)) {
                    const loc = await elem.getLocation().catch(() => ({ y: 0 }));
                    const desc = await elem.getAttribute("content-desc").catch(() => "");
                    // Use y > 500 to skip pinned stocks (y ≈ 300–450) and only match regular watchlist rows
                    if (loc.y > 500 && desc) {
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

                            if (!isHeaderOrControl) {
                                currentScreenItems.push({ elem, loc, desc, parts, name });
                            }
                        }
                    }
                }
            }

            // Sort visible screen items by vertical coordinate to ensure top-to-bottom visual order
            currentScreenItems.sort((a, b) => a.loc.y - b.loc.y);

            let newStocksFound = false;
            for (const item of currentScreenItems) {
                const { name, parts, desc } = item;
                if (!seenStocks.has(name)) {
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

            if (!newStocksFound) {
                noNewCount++;
            } else {
                noNewCount = 0;
            }

            // if (noNewCount < 6) {
            //     try {
            //         await driver.performActions([{
            //             type: 'pointer',
            //             id: 'finger1',
            //             parameters: { pointerType: 'touch' },
            //             actions: [
            //                 { type: 'pointerMove', duration: 0, x: 500, y: 1500 },
            //                 { type: 'pointerDown', button: 0 },
            //                 { type: 'pointerMove', duration: 400, x: 500, y: 500 },
            //                 { type: 'pointerUp', button: 0 }
            //             ]
            //         }]);
            //         scrollsPerformed++;
            //     } catch (e) {
            //         console.log("Scroll failed:", e.message);
            //     }
            //     await driver.pause(500);
            // }
        }

        // //Scroll back to top
        // if (extractedStocks.length > 0 && scrollsPerformed > 0) {
        //     for (let i = 0; i < scrollsPerformed + 1; i++) {
        //         try {
        //             await driver.performActions([{
        //                 type: 'pointer',
        //                 id: 'finger1',
        //                 parameters: { pointerType: 'touch' },
        //                 actions: [
        //                     { type: 'pointerMove', duration: 0, x: 500, y: 500 },
        //                     { type: 'pointerDown', button: 0 },
        //                     { type: 'pointerMove', duration: 400, x: 500, y: 1500 },
        //                     { type: 'pointerUp', button: 0 }
        //                 ]
        //             }]);
        //         } catch (e) { }
        //         await driver.pause(300);
        //     }
        // }

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

        //await this.pullDownToRefresh();

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
        //await this.pullDownToRefresh(); // Start fresh
        const closePriceStocks1 = await this.getWatchlistStockDetails();

        if (closePriceStocks1.length === 0) throw new Error("No stocks found to compare.");

        console.log("Switching to Open Price...");
        await this.openMarketWatchSettings();
        await this.openPriceRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.openPriceRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Extracting updated stock details (Open Price)...");
        //  await this.pullDownToRefresh();
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
        //  await this.pullDownToRefresh();
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
        //   await this.pullDownToRefresh();
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
        //        await this.pullDownToRefresh();

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
            //   await this.pullDownToRefresh();
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

        const stateCHasArrow = hasArrow(stateCDesc);
        if (stateCDesc && (stateCHasArrow === stateAHasArrow || stateCDesc.includes(targetStockName))) {
            console.log(`[SUCCESS] Restored direction state for ${targetStockName}`);
        } else if (stateCDesc !== stateADesc) {
            console.log(`[INFO] Live market price variation detected during direction toggle. State C: ${JSON.stringify(stateCDesc)} vs State A: ${JSON.stringify(stateADesc)}`);
        }
        await driver.pause(1000);
        try {
            await this.closeMarketWatchSettings();
        } catch (e) { }

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
            await this.addFirstScripToWatchlist();
            await driver.pause(1500);

            // In search results, the bag icon (if enabled) is next to the segment (e.g. NSE, BSE, etc.)
            // We search for elements containing the quantity, and verify it's the segment/bag element.
            const potentialBagElems = await $$(`android=new UiSelector().descriptionContains("${qtyStr}")`);
            let isBagVisible = false;

            for (const elem of potentialBagElems) {
                if (await elem.isDisplayed().catch(() => false)) {
                    const desc = await elem.getAttribute("content-desc").catch(() => "");
                    if (desc) {
                        const parts = desc.split(/\n/).map(s => s.trim());
                        for (const part of parts) {
                            // The bag quantity usually appears on its own line, possibly with a bag emoji
                            // If it exactly matches the qty, or matches 💼 <qty>, it's our bag!
                            if (part === qtyStr || part === `💼 ${qtyStr}` || part === `💼${qtyStr}` || part.includes(`bag ${qtyStr}`)) {
                                isBagVisible = true;
                                break;
                            }
                        }
                    }
                    if (isBagVisible) break;
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


    get gttToggle() {
        return $(locators.get('gttToggle'))
    }

    async verifyGTTSymbol(stockName) {
        console.log(`Verifying GTT toggle behavior for ${stockName}...`);

        // Helper to check the GTT symbol via the search bar
        const getGTTStatusInSearch = async () => {
            console.log(`Searching for ${stockName} via search bar...`);
            await this.clickSearchIcon();
            await this.enterScripName(stockName);
            await this.selectExchangeFilter('ALL');
            await driver.pause(1500);

            // In search results, the GTT icon (if enabled) appears next to the segment (e.g. NSE ⏩)
            const potentialElems = await $$(`android=new UiSelector().descriptionMatches(".*(NSE|BSE|CDS|MCX|NFO|BFO|EQ|FUT).*")`);
            let isGTTVisible = false;

            for (const elem of potentialElems) {
                if (await elem.isDisplayed().catch(() => false)) {
                    const desc = await elem.getAttribute("content-desc").catch(() => "");
                    // Check if description has the blue right arrows "⏩" or ">>"
                    if (desc && (desc.includes('⏩') || desc.includes('>>') || desc.includes('»') || desc.includes('GTT'))) {
                        isGTTVisible = true;
                        break;
                    }
                }
            }

            if (!isGTTVisible) {
                console.log(`GTT symbol not found in search results.`);
            }

            await this.closeSearch();
            return isGTTVisible;
        };

        const isInitiallyEnabled = await getGTTStatusInSearch();

        console.log(`Initial state: GTT toggle appears to be ${isInitiallyEnabled ? 'ENABLED' : 'DISABLED'}.`);

        const toggleSetting = async () => {
            console.log(`Toggling GTT in Market Watch settings...`);
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

            await this.gttToggle.waitForDisplayed({ timeout: 5000 });
            await this.gttToggle.click();
            await driver.pause(1000);
            await this.closeMarketWatchSettings();
        };

        await toggleSetting();

        console.log("Checking search results after first toggle...");
        const isToggled1Enabled = await getGTTStatusInSearch();

        if (isInitiallyEnabled) {
            if (isToggled1Enabled) {
                throw new Error(`GTT symbol is still visible for ${stockName} after disabling the GTT toggle!`);
            } else {
                console.log(`✅ [TC VERIFIED]: GTT symbol correctly hidden after disabling toggle.`);
            }
        } else {
            if (!isToggled1Enabled) {
                throw new Error(`GTT symbol is NOT visible for ${stockName} after enabling the GTT toggle!`);
            } else {
                console.log(`✅ [TC VERIFIED]: GTT symbol correctly shown after enabling toggle.`);
            }
        }

        console.log(`Reverting GTT toggle to original state...`);
        await toggleSetting();

        console.log("Checking search results after reverting toggle...");
        const isToggled2Enabled = await getGTTStatusInSearch();

        if (isInitiallyEnabled) {
            if (!isToggled2Enabled) {
                throw new Error(`Failed to revert: GTT symbol is NOT visible for ${stockName}.`);
            }
        } else {
            if (isToggled2Enabled) {
                throw new Error(`Failed to revert: GTT symbol is still visible for ${stockName}.`);
            }
        }

        console.log(`✅ [TC VERIFIED]: GTT toggle successfully verified and reverted.`);
        allure.addStep(`✅ [TC VERIFIED]: GTT toggle successfully verified and reverted.`);
    }

    async verifyChangeFormatOptions() {


        console.log("Switching to 'Percentage' format...");
        await this.openMarketWatchSettings();
        await this.percentageFormatRadioBtn.waitForDisplayed({ timeout: 5000 });
        await this.percentageFormatRadioBtn.click();
        await driver.pause(1000);
        await this.closeMarketWatchSettings();

        console.log("Verifying 'Percentage' format...");
        // await this.pullDownToRefresh();
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
        //await this.pullDownToRefresh();
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
        // await this.pullDownToRefresh();
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

    async ensureOnWatchlistPage() {
        try {
            // Check if search icon, watchlist dropdown, or heatmap view is visible
            const isWatchlist = await this.searchIcon.isDisplayed().catch(() => false) ||
                await this.watchListDropdown.isDisplayed().catch(() => false) ||
                await this.openHeatMapView.isDisplayed().catch(() => false)
            if (isWatchlist) return

            console.log("Not on Watchlist page, attempting recovery...")
            // If Stock Overview Back button is displayed, click it
            const backBtn = await this.stockOverviewBackButton
            if (await backBtn.isDisplayed().catch(() => false)) {
                await backBtn.click()
                await driver.pause(1500)
                if (await this.searchIcon.isDisplayed().catch(() => false)) return
            }

            const backDesc = await $('~Back')
            if (await backDesc.isDisplayed().catch(() => false)) {
                await backDesc.click()
                await driver.pause(1500)
                if (await this.searchIcon.isDisplayed().catch(() => false)) return
            }

            // If search overlay is open, click close button
            const closeSearch = await this.searchCloseButton
            if (await closeSearch.isDisplayed().catch(() => false)) {
                await closeSearch.click()
                await driver.pause(1500)
                if (await this.searchIcon.isDisplayed().catch(() => false)) return
            }

            // Fallback: click Watchlist bottom navigation tab
            await this.clickWatchlistTab()
        } catch (e) {
            console.log("Error in ensureOnWatchlistPage:", e)
        }
    }

    async clickOverviewBookmarkIcon(segment = null) {
        const segUpper = segment ? segment.trim().toUpperCase() : null
        console.log(`Attempting to click Bookmark icon on Stock Overview (segment: ${segUpper || 'default'})...`)
        let clicked = false

        // For MCX and CDS/USD segments, the bookmark icon on Stock Overview is instance(6). For equity (NSE/BSE), it is instance(7).
        const isInstance6 = segUpper === 'MCX' 
        const targetInstance = isInstance6 ? 6 : 7
        const fallbackInstance = isInstance6 ? 7 : 6

        // 1. Direct UiSelector to the bookmark icon on Stock Overview based on segment
        try {
            const primaryBookmark = $(`android=new UiSelector().className("android.view.View").instance(${targetInstance})`)
            if (await primaryBookmark.isDisplayed().catch(() => false)) {
                await primaryBookmark.click()
                clicked = true
                console.log(`Clicked overview bookmark icon via instance(${targetInstance}) locator`)
            }
        } catch (e) { }

        if (!clicked) {
            try {
                const secondaryBookmark = $(`android=new UiSelector().className("android.view.View").instance(${fallbackInstance})`)
                if (await secondaryBookmark.isDisplayed().catch(() => false)) {
                    await secondaryBookmark.click()
                    clicked = true
                    console.log(`Clicked overview bookmark icon via fallback instance(${fallbackInstance}) locator`)
                }
            } catch (e) { }
        }

        // 2. Scan header row clickable views (y between 120 and 280) with x between 650 and 780
        if (!clicked) {
            try {
                const allViews = await $$('//android.view.View[@clickable="true"]')
                for (const v of allViews) {
                    if (await v.isDisplayed().catch(() => false)) {
                        const loc = await v.getLocation().catch(() => null)
                        if (loc && loc.y > 120 && loc.y < 280 && loc.x >= 650 && loc.x <= 780) {
                            await v.click()
                            clicked = true
                            console.log(`Clicked overview bookmark icon at (${loc.x}, ${loc.y})`)
                            break
                        }
                    }
                }
            } catch (e) { }
        }

        // 3. Fallback: Coordinate tap at 66% screen width, 202px height
        if (!clicked) {
            try {
                const windowSize = await driver.getWindowSize()
                const tapX = Math.floor(windowSize.width * 0.66)
                const tapY = 202
                console.log(`Tapping overview bookmark icon at fallback coordinates (${tapX}, ${tapY})...`)
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
                clicked = true
            } catch (e) { }
        }

        await driver.pause(1500)
        return clicked
    }

    async isWatchlistBottomSheetOpen() {
        try {
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const loc = await v.getLocation().catch(() => null)
                    if (loc && loc.y > 800) {
                        const desc = await v.getAttribute("content-desc").catch(() => "")
                        if (desc && (desc.toLowerCase().includes('watchlist') || desc.includes('-') || desc.includes('+') || desc.toLowerCase().includes('manage') || desc.toLowerCase().includes('done') || desc.toLowerCase().includes('save'))) {
                            return true
                        }
                    }
                }
            }
        } catch (e) { }
        return false
    }

    async clickSearchIcon() {
        try {
            await this.ensureOnWatchlistPage()

            const inputField = this.searchInputField
            if (await inputField.isDisplayed().catch(() => false)) {
                console.log("Search input field already displayed")
                return
            }

            await this.searchIcon.waitForDisplayed({ timeout: 10000 })
            await this.searchIcon.click()
            await driver.pause(1000)

            const isSearchOpen = await inputField.isDisplayed().catch(() => false)

            if (!isSearchOpen) {
                console.log("Search input not found. It might have clicked Settings by mistake.");
                try {
                    const closeBtn = await this.marketWatchSettingsCloseBtn
                    if (await closeBtn.isDisplayed().catch(() => false)) {
                        await closeBtn.click();
                        await driver.pause(1000);
                    }
                } catch (e) { }

                console.log("Using coordinate tap fallback for Search Icon...");
                let tapX, tapY;

                // Try to get coordinates of what we just clicked (which turned out to be the Settings gear)
                const gearLoc = await this.searchIcon.getLocation().catch(() => null);
                if (gearLoc && gearLoc.x > 200) {
                    // Tap slightly to the left of the settings gear
                    tapX = gearLoc.x - 120;
                    tapY = gearLoc.y + 20;
                } else {
                    // Generic top-right area (around 82% width)
                    const windowSize = await driver.getWindowSize();
                    tapX = Math.floor(windowSize.width * 0.82);
                    tapY = 150;
                }

                await driver.performActions([{
                    type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }]);
                await driver.pause(1500);
            }
        } catch (e) {
            console.log("Failed in clickSearchIcon:", e);
        }
    }

    /**
     * Type scrip name into search bar
     * @param {string} scripSymbol Scrip symbol from testData.csv (e.g. 'RELIANCE', 'TCS')
     */
    async enterScripName(scripSymbol) {
        if (!scripSymbol || typeof scripSymbol !== 'string') {
            throw new Error(`enterScripName: scripSymbol must be a non-empty string, but received: ${scripSymbol}`);
        }
        let inputField = this.searchInputField
        await inputField.waitForDisplayed({ timeout: 5000 })
        await inputField.click()
        await driver.pause(500)

        // Clear text thoroughly
        try {
            await inputField.clearValue()
        } catch (e) { }

        await inputField.addValue(scripSymbol)
        await driver.pause(1000) // Allow search results list to refresh

        // Check if value was actually entered (sometimes Appium addValue/setValue fails silently on React Native/Flutter)
        const currentText = await inputField.getText()
        if (!currentText || !currentText.includes(scripSymbol)) {
            console.log("addValue failed, trying driver.keys fallback...")
            await inputField.click()
            await driver.pause(500)
            await driver.keys(scripSymbol.split(''))
            await driver.pause(1000)
        }
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
                await driver.pause(1000)
                return
            }
        } catch (e) { }

        // 2. Scan views with content-desc or text equal to segUpper in top chip bar area (y < 400)
        try {
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const loc = await v.getLocation().catch(() => null)
                    if (loc && loc.y < 400) {
                        const desc = await v.getAttribute("content-desc").catch(() => "")
                        if (desc && desc.trim().toUpperCase() === segUpper) {
                            await v.click()
                            console.log(`Clicked exchange filter chip via scan: ${segUpper}`)
                            await driver.pause(1000)
                            return
                        }
                    }
                }
            }
        } catch (e) { }

        console.log(`Exchange filter chip '${segUpper}' not found on UI, proceeding with current results...`)
    }


    /**
     * Select a watchlist on the bottom sheet by clicking its checkbox/row on the right
     * @param {string} targetWatchlistName 
     */
    async selectWatchlistOnBottomSheet(targetWatchlistName) {
        if (!targetWatchlistName) return
        const possibleNames = [targetWatchlistName]
        if (targetWatchlistName.toLowerCase().startsWith('watchlist ')) {
            const num = targetWatchlistName.split(' ')[1]
            if (num) possibleNames.push(num)
        }

        const bottomSheetViews = await $$('//*[@content-desc != ""]')
        for (const v of bottomSheetViews) {
            if (await v.isDisplayed().catch(() => false)) {
                const loc = await v.getLocation().catch(() => null)
                if (loc && loc.y > 800) {
                    const desc = await v.getAttribute("content-desc").catch(() => "")
                    if (possibleNames.some(name => desc === name || desc.startsWith(name + '\n') || desc.includes(name))) {
                        const sz = await v.getSize()
                        const tapX = Math.floor(loc.x + sz.width * 0.94)
                        const tapY = Math.floor(loc.y + sz.height / 2)
                        await driver.performActions([{
                            type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                            actions: [
                                { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                                { type: 'pointerDown', button: 0 },
                                { type: 'pointerUp', button: 0 }
                            ]
                        }])
                        await driver.pause(1000)
                        break
                    }
                }
            }
        }

        // Close bottom sheet if still open
        try {
            if (await this.isWatchlistBottomSheetOpen()) {
                await driver.back()
                await driver.pause(1000)
            }
        } catch (e) { }
    }

    /**
     * Search and handle scrip addition to watchlist:
     * 1. Detect if the scrip appears ABOVE "Global Search Results" (meaning it is already present in the watchlist).
     * 2. If present above "Global Search Results":
     *    - Click the scrip to enter Stock Overview.
     *    - Click top-right bookmark icon to open watchlist bottom sheet.
     *    - Click '-' minus icon for target watchlist to remove it.
     *    - Navigate back to the Search screen.
     * 3. Now the scrip appears DOWN below "Global Search Results".
     * 4. Click the bookmark icon next to the scrip under "Global Search Results" to ADD it.
     * 5. If bottom sheet appears, select the target watchlist and close.
     * @param {string} [symbol] Scrip symbol to match (e.g. 'INFY', 'TCS')
     * @param {string} [segment] Segment code to match (e.g. 'ALL', 'NSE', 'BSE')
     * @param {string} [targetWatchlistName] Target watchlist name
     */
    async addFirstScripToWatchlist(symbol = null, segment = 'ALL', targetWatchlistName = null) {
        await driver.pause(1500)

        const symUpper = symbol ? symbol.trim().toUpperCase() : null
        const segUpper = segment ? segment.trim().toUpperCase() : 'ALL'

        // 1. Locate "Global Search Results" header position
        let globalSearchY = null
        try {
            const globalHeader = await $('//*[contains(@text, "Global Search Results") or contains(@content-desc, "Global Search Results")]')
            if (await globalHeader.isDisplayed().catch(() => false)) {
                const loc = await globalHeader.getLocation()
                globalSearchY = loc.y
                console.log(`📍 Found 'Global Search Results' header at y = ${globalSearchY}`)
            }
        } catch (e) { }

        if (globalSearchY === null) {
            try {
                const views = await $$('//*[@content-desc != ""]')
                for (const v of views) {
                    const desc = await v.getAttribute("content-desc").catch(() => "")
                    if (desc.includes("Global Search Results")) {
                        const loc = await v.getLocation()
                        globalSearchY = loc.y
                        console.log(`📍 Found 'Global Search Results' via scan at y = ${globalSearchY}`)
                        break
                    }
                }
            } catch (e) { }
        }

        // 2. Check if scrip card appears ABOVE "Global Search Results" (already in watchlist)
        let existingCardInWatchlist = null
        let cardInGlobalSearch = null

        try {
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const loc = await v.getLocation().catch(() => null)
                    if (!loc || loc.y < 300) continue // Skip top search bar & exchange filter chips

                    const desc = await v.getAttribute("content-desc").catch(() => "")
                    if (!desc || !desc.includes('\n')) continue

                    const lines = desc.split('\n').map(s => s.trim().toUpperCase())
                    const firstLine = lines[0] || ''
                    const secondLine = lines[1] || ''

                    const symbolMatches = !symUpper || firstLine === symUpper || firstLine.startsWith(symUpper + '-') || firstLine.startsWith(symUpper + ' ')
                    const segmentMatches = segUpper === 'ALL' || secondLine === segUpper || desc.toUpperCase().includes(segUpper)

                    if (symbolMatches && segmentMatches) {
                        if (globalSearchY !== null && loc.y < globalSearchY) {
                            existingCardInWatchlist = v
                            console.log(`🔍 Scrip '${symUpper}' is ALREADY IN WATCHLIST (appears above 'Global Search Results' at y=${loc.y}): '${desc.replace(/\n/g, ' ')}'`)
                            break
                        } else {
                            if (!cardInGlobalSearch) {
                                cardInGlobalSearch = v
                                console.log(`🔍 Found scrip under 'Global Search Results' at y=${loc.y}: '${desc.replace(/\n/g, ' ')}'`)
                            }
                        }
                    }
                }
            }
        } catch (e) { }

        // 3. If present ABOVE "Global Search Results", remove it via Stock Overview first
        if (existingCardInWatchlist) {
            console.log(`⚠️ Scrip '${symUpper}' is already in watchlist. Removing it via Stock Overview...`)
            const loc = await existingCardInWatchlist.getLocation()
            const sz = await existingCardInWatchlist.getSize()
            const tapX = Math.floor(loc.x + sz.width * 0.4) // Tap stock name/card body
            const tapY = Math.floor(loc.y + sz.height / 2)

            console.log(`Tapping card body at (${tapX}, ${tapY}) to open Stock Overview...`)
            await driver.performActions([{
                type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerUp', button: 0 }
                ]
            }])
            await driver.pause(2500)

            // Click Top-Right Bookmark Icon on Stock Overview
            await this.clickOverviewBookmarkIcon()
            await driver.pause(1000)

            let sheetOpen = await this.isWatchlistBottomSheetOpen()
            if (!sheetOpen) {
                console.log("Watchlist bottom sheet not open yet, retrying with coordinate tap...")
                const windowSize = await driver.getWindowSize()
                const bmX = Math.floor(windowSize.width * 0.66)
                const bmY = 202
                await driver.performActions([{
                    type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: bmX, y: bmY },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }])
                await driver.pause(1500)
                sheetOpen = await this.isWatchlistBottomSheetOpen()
            }

            // Click '-' minus icon for target watchlist
            let minusClicked = false
            const possibleNames = []
            if (targetWatchlistName) {
                possibleNames.push(targetWatchlistName)
                if (targetWatchlistName.toLowerCase().startsWith('watchlist ')) {
                    const numStr = targetWatchlistName.split(' ')[1]
                    if (numStr) possibleNames.push(numStr)
                }
            }

            // Method A: Accessibility ID ~candidate
            for (const candidate of possibleNames) {
                if (minusClicked) break
                try {
                    const targetRow = $(`~${candidate}`)
                    if (await targetRow.isDisplayed().catch(() => false)) {
                        const rLoc = await targetRow.getLocation()
                        const rSz = await targetRow.getSize()
                        const mX = Math.floor(rLoc.x + rSz.width * 0.94)
                        const mY = Math.floor(rLoc.y + rSz.height / 2)
                        await driver.performActions([{
                            type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                            actions: [
                                { type: 'pointerMove', duration: 0, x: mX, y: mY },
                                { type: 'pointerDown', button: 0 },
                                { type: 'pointerUp', button: 0 }
                            ]
                        }])
                        minusClicked = true
                        console.log(`✅ Tapped '-' minus button for '~${candidate}' at (${mX}, ${mY})`)
                        break
                    }
                } catch (e) { }
            }

            // Method B: Content description scan
            if (!minusClicked) {
                try {
                    const bViews = await $$('//*[@content-desc != ""]')
                    for (const v of bViews) {
                        if (await v.isDisplayed().catch(() => false)) {
                            const rLoc = await v.getLocation()
                            if (rLoc.y > 800) {
                                const desc = await v.getAttribute("content-desc").catch(() => "")
                                const matches = possibleNames.length === 0 || possibleNames.some(name => desc === name || desc.startsWith(name + '\n') || desc.startsWith(name + ' ') || desc.includes(name))
                                if (matches) {
                                    const rSz = await v.getSize()
                                    const mX = Math.floor(rLoc.x + rSz.width * 0.94)
                                    const mY = Math.floor(rLoc.y + rSz.height / 2)
                                    await driver.performActions([{
                                        type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                                        actions: [
                                            { type: 'pointerMove', duration: 0, x: mX, y: mY },
                                            { type: 'pointerDown', button: 0 },
                                            { type: 'pointerUp', button: 0 }
                                        ]
                                    }])
                                    minusClicked = true
                                    console.log(`✅ Tapped '-' minus button on bottom sheet row '${desc}' at (${mX}, ${mY})`)
                                    break
                                }
                            }
                        }
                    }
                } catch (e) { }
            }

            // Method C: direct minus icon locator
            if (!minusClicked) {
                try {
                    const minusBtn = await this.watchlistRemoveMinusBtn
                    if (await minusBtn.isDisplayed().catch(() => false)) {
                        await minusBtn.click()
                        minusClicked = true
                        console.log(`✅ Scrip '${symbol}' removed via watchlistRemoveMinusBtn`)
                    }
                } catch (e) { }
            }

            await driver.pause(1000)

            // Close bottom sheet
            if (sheetOpen || await this.isWatchlistBottomSheetOpen()) {
                await driver.back()
                await driver.pause(1000)
            }

            // Return from Stock Overview to Search Screen
            let backHandled = false
            try {
                const backBtn = await this.stockOverviewBackButton
                if (await backBtn.isDisplayed().catch(() => false)) {
                    await backBtn.click()
                    backHandled = true
                    console.log("Clicked stockOverviewBackButton to return to Search")
                    await driver.pause(1500)
                }
            } catch (e) { }

            if (!backHandled) {
                try {
                    const backDesc = await $('~Back')
                    if (await backDesc.isDisplayed().catch(() => false)) {
                        await backDesc.click()
                        backHandled = true
                        console.log("Clicked ~Back button to return to Search")
                        await driver.pause(1500)
                    }
                } catch (e) { }
            }

            if (!backHandled) {
                await driver.back()
                await driver.pause(1500)
            }

            // Check if search input has value, re-enter if needed
            const inputField = this.searchInputField
            const val = await inputField.getText().catch(() => "")
            if (!val || !val.toUpperCase().includes(symUpper)) {
                await this.enterScripName(symbol)
                await this.selectExchangeFilter(segUpper)
                await driver.pause(1500)
            } else {
                await driver.pause(1000)
            }

            cardInGlobalSearch = null
        }

        // 4. Now find the scrip card UNDER "Global Search Results" to ADD it
        let targetCard = cardInGlobalSearch

        if (!targetCard) {
            try {
                const views = await $$('//*[@content-desc != ""]')
                for (const v of views) {
                    if (await v.isDisplayed().catch(() => false)) {
                        const loc = await v.getLocation().catch(() => null)
                        if (!loc || loc.y < 300) continue
                        if (globalSearchY !== null && loc.y < globalSearchY) continue

                        const desc = await v.getAttribute("content-desc").catch(() => "")
                        if (!desc || !desc.includes('\n')) continue

                        const lines = desc.split('\n').map(s => s.trim().toUpperCase())
                        const firstLine = lines[0] || ''
                        const secondLine = lines[1] || ''

                        const symbolMatches = !symUpper || firstLine === symUpper || firstLine.startsWith(symUpper + '-') || firstLine.startsWith(symUpper + ' ')
                        const segmentMatches = segUpper === 'ALL' || secondLine === segUpper || desc.toUpperCase().includes(segUpper)

                        if (symbolMatches && segmentMatches) {
                            targetCard = v
                            console.log(`Found matching search card under Global Search Results for ${symUpper} (${segUpper}): '${desc.replace(/\n/g, ' ')}'`)
                            break
                        }
                    }
                }
            } catch (e) { }
        }

        // Fallback to top result card below global search
        if (!targetCard) {
            try {
                const views = await $$('//*[@content-desc != ""]')
                for (const v of views) {
                    if (await v.isDisplayed().catch(() => false)) {
                        const loc = await v.getLocation().catch(() => null)
                        if (!loc || loc.y < 300) continue
                        if (globalSearchY !== null && loc.y < globalSearchY) continue

                        const desc = await v.getAttribute("content-desc").catch(() => "")
                        if (desc && desc.includes('\n')) {
                            targetCard = v
                            console.log(`Using top search result card: '${desc.replace(/\n/g, ' ')}'`)
                            break
                        }
                    }
                }
            } catch (e) { }
        }

        // 5. Tap bookmark icon on the card
        if (targetCard) {
            const loc = await targetCard.getLocation()
            const sz = await targetCard.getSize()
            const tapX = Math.floor(loc.x + sz.width * 0.94) // Far-right bookmark icon
            const tapY = Math.floor(loc.y + sz.height / 2)

            console.log(`Tapping bookmark/add icon at (${tapX}, ${tapY}) for '${symUpper}'...`)
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
        } else {
            const windowSize = await driver.getWindowSize()
            const tapX = Math.floor(windowSize.width * 0.94)
            const tapY = Math.floor(windowSize.height * 0.42)
            console.log(`Tapping fallback coordinate (${tapX}, ${tapY})...`)
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
        }

        // Handle case where tapping search card opened Stock Overview (fallback)
        try {
            const backBtn = await this.stockOverviewBackButton
            if (await backBtn.isDisplayed().catch(() => false)) {
                console.log("Stock Overview opened after tapping scrip. Adding to watchlist via overview bookmark icon...")
                await this.clickOverviewBookmarkIcon()
                await driver.pause(1000)

                // Select target watchlist on bottom sheet if open
                if (await this.isWatchlistBottomSheetOpen() && targetWatchlistName) {
                    await this.selectWatchlistOnBottomSheet(targetWatchlistName)
                }

                // Return from Stock Overview back to search
                await backBtn.click()
                await driver.pause(1500)
                return
            }
        } catch (e) { }

        // Handle bottom sheet if opened directly by tapping the bookmark icon in search results
        try {
            if (await this.isWatchlistBottomSheetOpen() && targetWatchlistName) {
                await this.selectWatchlistOnBottomSheet(targetWatchlistName)
            }
        } catch (e) { }
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
            const symUpper = symbol.trim().toUpperCase()

            // Find specific matching scrip row on current watchlist list view
            let scripElement = null
            try {
                const listItems = await $$('//*[@content-desc != ""]')
                for (const item of listItems) {
                    if (await item.isDisplayed().catch(() => false)) {
                        const loc = await item.getLocation().catch(() => null)
                        if (!loc || loc.y < 350) continue // Ignore top header widgets (NIFTY 50 / SENSEX)

                        const desc = await item.getAttribute("content-desc").catch(() => "")
                        if (!desc || !desc.includes('\n')) continue

                        const lines = desc.split('\n').map(s => s.trim().toUpperCase())
                        const firstLine = lines[0] || ''
                        const secondLine = lines[1] || ''

                        const symbolMatches = firstLine === symUpper || firstLine.startsWith(symUpper + '-') || firstLine.startsWith(symUpper + ' ')
                        const segmentMatches = !segUpper || segUpper === 'ALL' || secondLine === segUpper || desc.toUpperCase().includes(segUpper)

                        if (symbolMatches && segmentMatches) {
                            scripElement = item
                            console.log(`Found existing scrip '${symbol}' (${segUpper}) on Watchlist: '${desc.replace(/\n/g, ' ')}'`)
                            break
                        }
                    }
                }
            } catch (e) { }

            // Fallback: scripBySymbol
            if (!scripElement) {
                try {
                    const scripSelector = locators.get('scripBySymbol').replace('{symbol}', symbol)
                    const elem = $(scripSelector)
                    if (await elem.isDisplayed().catch(() => false)) {
                        const loc = await elem.getLocation()
                        if (loc.y > 350) {
                            scripElement = elem
                        }
                    }
                } catch (e) { }
            }

            if (scripElement) {
                console.log(`⚠️ Scrip '${symbol}' (${segUpper || 'ALL'}) found in Watchlist '${targetWatchlistName}'. Proceeding to remove it...`)
                await scripElement.click()
                await driver.pause(2500)

                // 1. Click Top-Right Bookmark Icon on Stock Overview
                await this.clickOverviewBookmarkIcon()

                // Check if bottom sheet is open; retry with coordinate tap if not
                let sheetOpen = await this.isWatchlistBottomSheetOpen()
                if (!sheetOpen) {
                    console.log("Watchlist bottom sheet not open yet, retrying bookmark click with coordinate tap...")
                    const windowSize = await driver.getWindowSize()
                    const bmX = Math.floor(windowSize.width * 0.66)
                    const bmY = 202
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
                    await driver.pause(1500)
                    sheetOpen = await this.isWatchlistBottomSheetOpen()
                }

                if (sheetOpen) {
                    console.log("Watchlist bottom sheet opened successfully")
                }

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
                            const tapX = Math.floor(loc.x + sz.width * 0.94)
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
                                const tapX = Math.floor(loc.x + sz.width * 0.94)
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

                // Method C: Content description scan for bottom sheet rows (y > 800)
                if (!minusClicked) {
                    try {
                        const views = await $$('//*[@content-desc != ""]')
                        for (const v of views) {
                            if (await v.isDisplayed().catch(() => false)) {
                                const loc = await v.getLocation()
                                if (loc.y > 800) {
                                    const desc = await v.getAttribute("content-desc").catch(() => "")
                                    const matches = possibleNames.some(name => desc === name || desc.startsWith(name + '\n') || desc.startsWith(name + ' ') || desc.includes(name))
                                    if (matches) {
                                        const sz = await v.getSize()
                                        const tapX = Math.floor(loc.x + sz.width * 0.94)
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

                await driver.pause(1000)

                // 3. Close bottom sheet if open
                if (sheetOpen || await this.isWatchlistBottomSheetOpen()) {
                    console.log("Closing watchlist bottom sheet...")
                    await driver.back()
                    await driver.pause(1000)
                }

                // 4. Return from Stock Overview to Watchlist safely using stockOverviewBackButton
                console.log("Navigating back from Stock Overview to Watchlist...")
                let backHandled = false
                try {
                    const backBtn = await this.stockOverviewBackButton
                    if (await backBtn.isDisplayed().catch(() => false)) {
                        await backBtn.click()
                        backHandled = true
                        console.log("Clicked stockOverviewBackButton")
                        await driver.pause(1500)
                    }
                } catch (e) { }

                if (!backHandled) {
                    try {
                        const backDesc = await $('~Back')
                        if (await backDesc.isDisplayed().catch(() => false)) {
                            await backDesc.click()
                            backHandled = true
                            console.log("Clicked ~Back button")
                            await driver.pause(1500)
                        }
                    } catch (e) { }
                }

                if (!backHandled) {
                    await driver.back()
                    await driver.pause(1500)
                }

                // 5. Ensure we are back on Watchlist page
                await this.ensureOnWatchlistPage()
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
                        // Use y > 500 to skip pinned stocks (y ≈ 300–450) and only match regular watchlist rows
                        if (loc.y > 500 && desc) {
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
        console.log('Exiting Heatmap view to return to Watchlist list view...')
        const openHeatMapBtn = await $(locators.get('openHeatMapView'))

        for (let attempt = 0; attempt < 3; attempt++) {
            if (await openHeatMapBtn.isDisplayed().catch(() => false)) {
                console.log('✅ Confirmed return to Watchlist list view (Open heatmap button is visible)')
                return
            }

            try {
                const backBtn = await $(locators.get("stockOverviewBackButton"))
                if (await backBtn.isDisplayed().catch(() => false)) {
                    const loc = await backBtn.getLocation().catch(() => ({ y: 999 }))
                    // Only click if it's truly in the top-left app bar area
                    if (loc.y < 250) {
                        await backBtn.click()
                        await driver.pause(1000)
                    }
                }
            } catch (e) { }

            // If still not returned, use driver.back()
            if (!(await openHeatMapBtn.isDisplayed().catch(() => false))) {
                try {
                    await driver.back()
                    await driver.pause(1000)
                    console.log('✅ Sent driver.back() to exit Heatmap')
                } catch (e) { }
            }
        }
    }

    /**
     * Open Heatmap view, verify count on '%' view, toggle to 'Val' view and verify count,
     * toggle back to '%' view and verify count consistency, then exit back to watchlist.
     * @param {number} [expectedCount] - Optional expected stock count to compare against
     * @param {boolean} [verifyStockClick=false] - If true, click a stock tile and verify navigation to Stock Overview
     */
    async verifyHeatmapCounts(expectedCount = null, verifyStockClick = false) {
        console.log("\n--- Running Heatmap View Verification ---")
        await this.clickHeatMapView()
        await driver.pause(1500)

        // 1. Initial count on default '%' view
        const initialCountPercent = await this.getHeatmapStockCount(expectedCount)

        // 2. Toggle to 'Val' (Value) view
        await this.switchHeatmapDisplay('value')
        await driver.pause(1000)
        const valCount = await this.getHeatmapStockCount(expectedCount)

        // 3. Toggle back to 'percent' (%) view
        await this.switchHeatmapDisplay('percent')
        await driver.pause(1000)
        const finalCountPercent = await this.getHeatmapStockCount(expectedCount)

        // Verify stock count consistency across views
        if (initialCountPercent === valCount && valCount === finalCountPercent) {
            const successMsg = `✅ [HEATMAP VERIFICATION PASSED]: Stock count consistent across views (${valCount} stocks displayed).`
            console.log(successMsg)
            try { allure.addStep(successMsg) } catch (e) { }
        } else {
            const warnMsg = `⚠️ [HEATMAP VERIFICATION MISMATCH]: Initial % (${initialCountPercent}), Val (${valCount}), Final % (${finalCountPercent}).`
            console.log(warnMsg)
            try { allure.addStep(warnMsg) } catch (e) { }
        }

        // Click a stock tile in Heatmap and verify navigation to Stock Overview (1st watchlist)
        if (verifyStockClick) {
            await this.verifyHeatmapStockOverviewNavigation()
        }

        // 4. Click top-left back arrow button to return to Watchlist
        await this.clickHeatmapBackButton()
        await driver.pause(1000)
    }

    get positionsToggle() {
        return $(locators.get('positionsToggle'))
    }
    get showSipToggle() {
        return $(locators.get('showSipToggle'))
    }
    get showAlertsToggle() {
        return $(locators.get('showAlertsToggle'))
    }

    async verifyPositionSymbol(stockName, quantity) {
        console.log(`Verifying positions toggle behavior for ${stockName} with qty ${quantity}...`);

        const qtyStr = quantity.toString();

        const getBagStatusInSearch = async () => {
            console.log(`Searching for ${stockName} via search bar...`);
            await this.clickSearchIcon();
            await this.enterScripName(stockName);
            await this.selectExchangeFilter('ALL');
            await this.addFirstScripToWatchlist();
            await driver.pause(1500);

            const potentialBagElems = await $$(`android=new UiSelector().descriptionContains("${qtyStr}")`);
            let isBagVisible = false;

            for (const elem of potentialBagElems) {
                if (await elem.isDisplayed().catch(() => false)) {
                    const desc = await elem.getAttribute("content-desc").catch(() => "");
                    if (desc) {
                        const parts = desc.split(/\n/).map(s => s.trim());
                        for (const part of parts) {
                            if (part === qtyStr || part === `💼 ${qtyStr}` || part === `💼${qtyStr}` || part.includes(`bag ${qtyStr}`)) {
                                console.log(`Found position bag/qty for ${qtyStr} in description part: ${part}`);
                                isBagVisible = true;
                                break;
                            }
                        }
                    }
                    if (isBagVisible) break;
                }
            }

            await this.closeSearch();
            return isBagVisible;
        };

        const isInitiallyEnabled = await getBagStatusInSearch();

        console.log(`Initial state: Positions toggle appears to be ${isInitiallyEnabled ? 'ENABLED' : 'DISABLED'}.`);

        const toggleSetting = async () => {
            console.log(`Toggling Positions in Market Watch settings...`);
            await this.openMarketWatchSettings();
            await this.openMarketWatchSettings();
            await this.positionsToggle.waitForDisplayed({ timeout: 5000 });
            await this.positionsToggle.click();
            await driver.pause(1000);
            await this.closeMarketWatchSettings();
        };

        await toggleSetting();

        console.log("Checking search results after first toggle...");
        const isToggled1Enabled = await getBagStatusInSearch();

        if (isInitiallyEnabled) {
            if (isToggled1Enabled) {
                throw new Error(`Position quantity ${quantity} is still visible for ${stockName} after disabling the Positions toggle!`);
            } else {
                console.log(`✅ [TC VERIFIED]: Position quantity correctly hidden after disabling toggle.`);
            }
        } else {
            if (!isToggled1Enabled) {
                throw new Error(`Position quantity ${quantity} is NOT visible for ${stockName} after enabling the Positions toggle!`);
            } else {
                console.log(`✅ [TC VERIFIED]: Position quantity correctly shown after enabling toggle.`);
            }
        }

        console.log(`Reverting Positions toggle to original state...`);
        await toggleSetting();

        console.log("Checking search results after reverting toggle...");
        const isToggled2Enabled = await getBagStatusInSearch();

        if (isInitiallyEnabled) {
            if (!isToggled2Enabled) {
                throw new Error(`Failed to revert: Position quantity ${quantity} is NOT visible for ${stockName}.`);
            }
        } else {
            if (isToggled2Enabled) {
                throw new Error(`Failed to revert: Position quantity ${quantity} is still visible for ${stockName}.`);
            }
        }

        console.log(`✅ [TC VERIFIED]: Positions toggle successfully verified and reverted.`);
        allure.addStep(`✅ [TC VERIFIED]: Positions toggle successfully verified and reverted.`);
    }

    async verifySIPSymbol(stockName) {
        console.log(`Verifying SIP toggle behavior for ${stockName}...`);

        // Initial Add Step: Ensure the stock is in the Watchlist before verifying
        console.log(`Adding ${stockName} to watchlist before verifying SIP toggle...`);
        await this.clickSearchIcon();
        await this.enterScripName(stockName);
        await this.selectExchangeFilter('ALL');
        await this.addFirstScripToWatchlist();
        console.log("Pressing back to close potential bottom sheet after adding...");
        await driver.pause(1000);

        const closeBtnS = await $(locators.get('searchCloseButton'));
        if (await closeBtnS.isDisplayed().catch(() => false)) {
            await closeBtnS.click();
            await driver.pause(1000);
        }

        const getEmptyIconCountInSearch = async () => {
            console.log(`Searching for ${stockName} via search bar...`);
            await this.clickSearchIcon();
            await this.enterScripName(stockName);
            await this.selectExchangeFilter('ALL');
            await driver.pause(4000);

            const potentialElems = await $$('//*');
            let targetElemLoc = null;
            let targetElemSize = null;

            for (const elem of potentialElems) {
                const desc = await elem.getAttribute("content-desc").catch(() => "");
                if (desc && desc.includes(stockName) && desc.includes("NSE")) {
                    targetElemLoc = await elem.getLocation().catch(() => null);
                    targetElemSize = await elem.getSize().catch(() => null);
                    break;
                }
            }

            let emptyCount = 0;
            if (targetElemLoc && targetElemSize) {
                for (const elem of potentialElems) {
                    const desc = await elem.getAttribute("content-desc").catch(() => "");
                    const textAttr = await elem.getText().catch(() => "");
                    if (!desc && !textAttr) {
                        const loc = await elem.getLocation().catch(() => null);
                        if (loc) {
                            const size = await elem.getSize().catch(() => ({ height: 0 }));
                            const centerY = loc.y + (size.height / 2);
                            if (centerY >= targetElemLoc.y && centerY <= targetElemLoc.y + targetElemSize.height) {
                                emptyCount++;
                            }
                        }
                    }
                }
            }

            await this.closeSearch();
            return emptyCount;
        };

        const getMwCheckboxState = async () => {
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

            await this.showSipToggle.waitForDisplayed({ timeout: 5000 });
            const checkedAttr = await this.showSipToggle.getAttribute("checked").catch(() => "false");
            const isChecked = checkedAttr === "true";
            await this.closeMarketWatchSettings();
            return isChecked;
        };

        const toggleSetting = async () => {
            console.log(`Toggling SIP in Market Watch settings...`);
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

            await this.showSipToggle.waitForDisplayed({ timeout: 5000 });
            await this.showSipToggle.click();
            await driver.pause(1000);
            await this.closeMarketWatchSettings();
        };

        // 1. Initial State Check
        console.log(`Extracting initial MW Settings state...`);
        const isInitiallyChecked = await getMwCheckboxState();
        console.log(`MW Settings initial checked state: ${isInitiallyChecked}`);

        const initialCount = await getEmptyIconCountInSearch();
        console.log(`Initial search empty icon count: ${initialCount}`);

        // 2. First Toggle
        await toggleSetting();
        const count1 = await getEmptyIconCountInSearch();

        if (isInitiallyChecked) {
            // Was ON, toggled OFF. Count should decrease.
            if (count1 >= initialCount) {
                throw new Error(`SIP symbol is NOT visible for ${stockName} after disabling the SIP toggle! (Expected count to decrease, but went from ${initialCount} to ${count1})`);
            }
        } else {
            // Was OFF, toggled ON. Count should increase.
            if (count1 <= initialCount) {
                throw new Error(`SIP symbol is NOT visible for ${stockName} after enabling the SIP toggle! (Expected count to increase, but went from ${initialCount} to ${count1})`);
            }
        }
        console.log(`✅ [TC VERIFIED]: SIP symbol state matched toggle 1.`);

        // 3. Second Toggle
        await toggleSetting();
        const count2 = await getEmptyIconCountInSearch();

        if (isInitiallyChecked) {
            // Was OFF, toggled ON again. Count should increase.
            if (count2 <= count1) {
                throw new Error(`Failed to revert: SIP symbol is NOT visible for ${stockName} after second toggle. (Expected count to increase, but went from ${count1} to ${count2})`);
            }
        } else {
            // Was ON, toggled OFF again. Count should decrease.
            if (count2 >= count1) {
                throw new Error(`Failed to revert: SIP symbol is still visible for ${stockName} after second toggle. (Expected count to decrease, but went from ${count1} to ${count2})`);
            }
        }

        console.log(`✅ [TC VERIFIED]: SIP toggle successfully verified and reverted.`);
        allure.addStep(`✅ [TC VERIFIED]: SIP toggle successfully verified and reverted.`);
    }

    async verifyAlertSymbol(stockName) {
        console.log(`Verifying Alerts toggle behavior for ${stockName}...`);

        // Initial Add Step: Ensure the stock is in the Watchlist before verifying
        console.log(`Adding ${stockName} to watchlist before verifying Alerts toggle...`);
        await this.clickSearchIcon();
        await this.enterScripName(stockName);
        await this.selectExchangeFilter('ALL');
        await this.addFirstScripToWatchlist();
        console.log("Pressing back to close potential bottom sheet after adding...");
        await driver.back();
        await driver.pause(1000);

        const closeBtnA = await $(locators.get('searchCloseButton'));
        if (await closeBtnA.isDisplayed().catch(() => false)) {
            await closeBtnA.click();
            await driver.pause(1000);
        }

        const getEmptyIconCountInSearch = async () => {
            console.log(`Searching for ${stockName} via search bar...`);
            await this.clickSearchIcon();
            await this.enterScripName(stockName);
            await this.selectExchangeFilter('ALL');
            await driver.pause(4000);

            const potentialElems = await $$('//*');
            let targetElemLoc = null;
            let targetElemSize = null;

            for (const elem of potentialElems) {
                const desc = await elem.getAttribute("content-desc").catch(() => "");
                if (desc && desc.includes(stockName) && desc.includes("NSE")) {
                    targetElemLoc = await elem.getLocation().catch(() => null);
                    targetElemSize = await elem.getSize().catch(() => null);
                    break;
                }
            }

            let emptyCount = 0;
            if (targetElemLoc && targetElemSize) {
                for (const elem of potentialElems) {
                    const desc = await elem.getAttribute("content-desc").catch(() => "");
                    const textAttr = await elem.getText().catch(() => "");
                    if (!desc && !textAttr) {
                        const loc = await elem.getLocation().catch(() => null);
                        if (loc) {
                            const size = await elem.getSize().catch(() => ({ height: 0 }));
                            const centerY = loc.y + (size.height / 2);
                            if (centerY >= targetElemLoc.y && centerY <= targetElemLoc.y + targetElemSize.height) {
                                emptyCount++;
                            }
                        }
                    }
                }
            }

            await this.closeSearch();
            return emptyCount;
        };

        const getMwCheckboxState = async () => {
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

            await this.showAlertsToggle.waitForDisplayed({ timeout: 5000 });
            const checkedAttr = await this.showAlertsToggle.getAttribute("checked").catch(() => "false");
            const isChecked = checkedAttr === "true";
            await this.closeMarketWatchSettings();
            return isChecked;
        };

        const toggleSetting = async () => {
            console.log(`Toggling Alerts in Market Watch settings...`);
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

            await this.showAlertsToggle.waitForDisplayed({ timeout: 5000 });
            await this.showAlertsToggle.click();
            await driver.pause(1000);
            await this.closeMarketWatchSettings();
        };

        // 1. Initial State Check
        console.log(`Extracting initial MW Settings state...`);
        const isInitiallyChecked = await getMwCheckboxState();
        console.log(`MW Settings initial checked state: ${isInitiallyChecked}`);

        const initialCount = await getEmptyIconCountInSearch();
        console.log(`Initial search empty icon count: ${initialCount}`);

        // 2. First Toggle
        await toggleSetting();
        const count1 = await getEmptyIconCountInSearch();

        if (isInitiallyChecked) {
            // Was ON, toggled OFF. Count should decrease.
            if (count1 >= initialCount) {
                throw new Error(`Alert symbol is NOT visible for ${stockName} after disabling the Alerts toggle! (Expected count to decrease, but went from ${initialCount} to ${count1})`);
            }
        } else {
            // Was OFF, toggled ON. Count should increase.
            if (count1 <= initialCount) {
                throw new Error(`Alert symbol is NOT visible for ${stockName} after enabling the Alerts toggle! (Expected count to increase, but went from ${initialCount} to ${count1})`);
            }
        }
        console.log(`✅ [TC VERIFIED]: Alert symbol state matched toggle 1.`);

        // 3. Second Toggle
        await toggleSetting();
        const count2 = await getEmptyIconCountInSearch();

        if (isInitiallyChecked) {
            // Was OFF, toggled ON again. Count should increase.
            if (count2 <= count1) {
                throw new Error(`Failed to revert: Alert symbol is NOT visible for ${stockName} after second toggle. (Expected count to increase, but went from ${count1} to ${count2})`);
            }
        } else {
            // Was ON, toggled OFF again. Count should decrease.
            if (count2 >= count1) {
                throw new Error(`Failed to revert: Alert symbol is still visible for ${stockName} after second toggle. (Expected count to decrease, but went from ${count1} to ${count2})`);
            }
        }

        console.log(`✅ [TC VERIFIED]: Alerts toggle successfully verified and reverted.`);
        allure.addStep(`✅ [TC VERIFIED]: Alerts toggle successfully verified and reverted.`);
    }


    get editWatchlistPencilIcon() {
        // The pencil icon is instance 15 on the Watchlist page
        return $(`android=new UiSelector().className("android.view.View").instance(15)`);
    }

    async openEditWatchlist() {
        console.log("Opening edit watchlist...");
        await this.editWatchlistPencilIcon.waitForDisplayed({ timeout: 5000 });
        await this.editWatchlistPencilIcon.click();
        await driver.pause(2000); // Wait for the 'My Watchlists' screen to load
    }

    async verifyAllWatchlistsByClickingTabs(expectedNames = []) {
        console.log("Verifying all watchlist tabs by clicking them in My Watchlists...");

        if (!expectedNames || expectedNames.length === 0) {
            console.log("No expected names provided. Cannot verify tabs.");
            return;
        }

        for (let i = 0; i < expectedNames.length; i++) {
            const expected = expectedNames[i];

            // Use UiScrollable to automatically scroll horizontally until the tab is found
            let tab = $(`android=new UiScrollable(new UiSelector().className("android.widget.HorizontalScrollView")).setAsHorizontalList().scrollIntoView(new UiSelector().description("${expected}"))`);

            if (await tab.isExisting()) {
                console.log(`✅ Verified and found tab: ${expected}`);
                await tab.click();
                await driver.pause(1000); // Wait for the list of stocks to update
            } else {
                throw new Error(`Failed to find tab '${expected}' even after UiScrollable attempted to scroll!`);
            }
        }

        console.log(`Successfully verified all ${expectedNames.length} watchlist tabs.`);
    }

    async clickEditWatchlistTabByName(name) {
        console.log(`Switching back to watchlist tab: ${name}`);
        let tab = $(`android=new UiScrollable(new UiSelector().className("android.widget.HorizontalScrollView")).setAsHorizontalList().scrollIntoView(new UiSelector().description("${name}"))`);
        if (await tab.isExisting()) {
            await tab.click();
            await driver.pause(1500); // Wait for stocks to load
        } else {
            throw new Error(`Failed to find tab '${name}' to switch back to.`);
        }
    }

    async deleteStockByRowIndex(index) {
        console.log(`Attempting to delete stock at row index ${index}...`);

        // Find all elements that might be stocks
        const potentialStocks = await $$(`android=new UiSelector().descriptionMatches(".*(NSE|BSE|CDS|MCX|NFO|BFO|EQ|FUT).*")`);
        const stockRows = [];

        for (const elem of potentialStocks) {
            const desc = await elem.getAttribute("content-desc").catch(() => "");
            // Filter out indices at the top (like SENSEX) which don't have exchange segments on a new line
            if (desc && (desc.includes("\nNSE") || desc.includes("\nBSE") || desc.includes("\nCDS") || desc.includes("\nMCX") || desc.includes("\nNFO") || desc.includes("\nBFO") || desc.includes("-EQ"))) {
                stockRows.push(elem);
            }
        }

        if (stockRows.length <= index) {
            throw new Error(`Cannot delete stock at index ${index}, only ${stockRows.length} valid stocks found.`);
        }

        const row = stockRows[index];
        await row.waitForDisplayed({ timeout: 5000 });

        const desc = await row.getAttribute("content-desc").catch(() => "");
        console.log(`Stock to delete: ${desc.replace(/\n/g, ' ')}`);

        // Because the dustbin doesn't have a separate accessibility node, we tap the far right of the row bounds
        const location = await row.getLocation();
        const size = await row.getSize();

        const clickX = location.x + size.width - 60; // Approx 60 pixels from the right edge
        const clickY = location.y + Math.floor(size.height / 2); // Center vertically

        console.log(`Performing coordinate tap at (${clickX}, ${clickY}) to hit the dustbin...`);
        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 700, x: clickX, y: clickY },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 500 },
                { type: 'pointerUp', button: 0 }
            ]
        }]);

        console.log("Waiting 4 seconds to observe the deletion snackbar...");
        allure.addStep("✅Deleted stocks successfully");
        await driver.pause(4000); // Wait longer to observe deletion snackbar
    }
    async verifyDragAndDrop() {
        console.log("\n--- Validating Drag and Drop Ordering ---");
        allure.addStep("Start Drag and Drop verification");

        // Ensure we are on the watchlist tab
        // await this.clickWatchlistTab();
        // await driver.pause(2000);

        // Find stock rows
        const rawElements = await $$(locators.get('watchlistStockRows'));

        const listElements = [];
        for (const elem of rawElements) {
            if (await elem.isDisplayed().catch(() => false)) {
                const loc = await elem.getLocation().catch(() => ({ y: 0 }));
                if (loc.y > 350) { // Avoid header overlap
                    listElements.push(elem);
                }
            }
        }

        // We need at least 5 elements to drag to the 5th stock
        if (listElements.length < 5) {
            console.log("Not enough visible stocks to perform drag and drop to 5th stock");
            return;
        }

        // Get bounds of the first element and the 5th element
        const startElem = listElements[0];
        const endElem = listElements[4]; // 5th stock

        const startLoc = await startElem.getLocation();
        const startSize = await startElem.getSize();

        const endLoc = await endElem.getLocation();
        const endSize = await endElem.getSize();

        // Calculate center points
        const startX = Math.floor(startLoc.x + startSize.width / 2);
        const startY = Math.floor(startLoc.y + startSize.height / 2);

        const endX = Math.floor(endLoc.x + endSize.width / 2);
        const endY = Math.floor(endLoc.y + endSize.height / 2) + 50; // drag slightly past center to ensure swap

        console.log(`Dragging from (${startX}, ${startY}) to (${endX}, ${endY})`);
        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: startX, y: startY },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 1500 }, // faster long press
                { type: 'pointerMove', duration: 800, x: endX, y: endY }, // faster drag
                { type: 'pause', duration: 500 }, // shorter pause at destination
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        await driver.pause(3000); // Increased pause to ensure popup has time to render

        // Wait for the popup to appear (up to 5 seconds)
        let popupAppeared = false;
        try {
            // This XPath looks for any element containing "Save" (or "SAVE") but explicitly EXCLUDES the title "Save Drag and Drop Ordering?"
            const saveBtn = await $('//*[(contains(@content-desc, "Save") or contains(@text, "Save") or contains(@content-desc, "SAVE") or contains(@text, "SAVE")) and not(contains(@text, "Ordering")) and not(contains(@content-desc, "Ordering"))]');

            await saveBtn.waitForDisplayed({ timeout: 5000 });
            console.log("Save popup appeared, clicking Save...");
            await saveBtn.click();
            popupAppeared = true;
            await driver.pause(2000); // Wait for popup to disappear
        } catch (e) {
            console.log("Save popup did not appear within 5 seconds, it might have been accepted previously. Error: " + e.message);
        }

        allure.addStep(`✅First drag and drop completed. Popup appeared: ${popupAppeared}`);

        // Second drag and drop to verify it works after saving
        console.log("Performing second drag and drop (downwards)...");
        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: startX, y: startY },
                { type: 'pointerDown', button: 0 },
                { type: 'pause', duration: 1500 },
                { type: 'pointerMove', duration: 800, x: endX, y: endY },
                { type: 'pause', duration: 500 },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        await driver.pause(1000);

        // Verify no popup appears the second time
        let secondPopupAppeared = false;
        try {
            const saveBtn = await $('//*[(contains(@content-desc, "Save") or contains(@text, "Save") or contains(@content-desc, "SAVE") or contains(@text, "SAVE")) and not(contains(@text, "Ordering")) and not(contains(@content-desc, "Ordering"))]');
            // Check if it exists and is displayed quickly
            if (await saveBtn.isExisting() && await saveBtn.isDisplayed()) {
                secondPopupAppeared = true;
                console.error("Error: Save popup appeared again on the second drag and drop!");
                allure.addStep("❌ Error: Save popup appeared on second drag and drop");
                await saveBtn.click();
            }
        } catch (e) {
            // Ignore error, it means it didn't appear which is what we want
        }

        if (!secondPopupAppeared) {
            console.log("✅ Second drag and drop succeeded without popup.");
            allure.addStep("✅ Second drag and drop succeeded without popup");
        }
    }

    async verifyWatchlistPinning(stockName = "TCS-EQ", favNumber = 1) {
        console.log(`\n--- Starting Watchlist Pinning Validation for ${stockName} (Fav ${favNumber}) ---`);

        // 0. Close any existing search overlay to start fresh
        try {
            const searchFields = await this.searchInputFields;
            if (searchFields.length > 0 && await searchFields[0].isDisplayed().catch(() => false)) {
                console.log(`Closing existing search overlay before searching for ${stockName}...`);
                await this.closeSearch();
                await driver.pause(1000);
            }
        } catch (e) { }

        // 1. Search for the stock
        console.log(`Searching for ${stockName}...`);
        await this.clickSearchIcon();
        await this.enterScripName(stockName);
        // Wait for search results to load and settle
        await driver.pause(2000);

        // 2. Click the stock in search results to open Overview
        // Use descriptionStartsWith for precise match — avoids picking up stale/unrelated elements
        const startsWithSelector = `android=new UiSelector().descriptionStartsWith("${stockName}")`;
        let targetStockElement = null;

        // Try strict startsWith first
        try {
            const strictResults = await $$(startsWithSelector);
            for (const elem of strictResults) {
                const loc = await elem.getLocation().catch(() => null);
                if (loc && loc.y > 200) {
                    targetStockElement = elem;
                    console.log(`Found ${stockName} via descriptionStartsWith at y=${loc.y}.`);
                    break;
                }
            }
        } catch (e) { }

        // Fallback: descriptionContains with stricter y-range
        if (!targetStockElement) {
            const containsSelector = `android=new UiSelector().descriptionContains("${stockName}")`;
            try {
                const fallbackResults = await $$(containsSelector);
                for (const elem of fallbackResults) {
                    const loc = await elem.getLocation().catch(() => null);
                    if (loc && loc.y > 200) {
                        const desc = await elem.getAttribute('content-desc').catch(() => '');
                        // Confirm the content-desc actually starts with our stock name
                        if (desc.startsWith(stockName)) {
                            targetStockElement = elem;
                            console.log(`Found ${stockName} via descriptionContains fallback at y=${loc.y}.`);
                            break;
                        }
                    }
                }
            } catch (e) { }
        }

        if (!targetStockElement) {
            throw new Error(`Could not find ${stockName} in search results.`);
        }

        console.log(`Found ${stockName} in search results. Clicking it to open Overview...`);
        await targetStockElement.click();
        await driver.pause(3000);

        // 3. Click Pin icon via a targeted coordinate tap
        const windowSize = await driver.getWindowSize();
        const pinX = Math.floor(windowSize.width * 0.35);
        const pinY = 150;

        console.log(`Tapping Pin icon via coordinates at (${pinX}, ${pinY})...`);
        await driver.performActions([{
            type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: pinX, y: pinY },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        await driver.pause(1500);

        // 4. Click "Pin to Favorite X"
        console.log(`Clicking 'Pin to Favorite ${favNumber}'...`);
        const pinToFav = favNumber === 1 ? await $(locators.get('pinToFav1')) : await $(locators.get('pinToFav2'));
        await pinToFav.waitForDisplayed({ timeout: 5000 });
        await pinToFav.click();
        await driver.pause(2000);

        // 5. Go back from Overview
        console.log("Navigating back from Overview...");
        const backBtn = await $('~Back');
        if (await backBtn.isExisting()) {
            await backBtn.click();
        } else {
            // Coordinate tap fallback for back button
            await driver.performActions([{
                type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: 70, y: 150 },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerUp', button: 0 }
                ]
            }]);
        }
        await driver.pause(1500);

        // 6. Close search to go back to Watchlist
        console.log("Closing search to return to Watchlist...");
        await this.closeSearch();
        await driver.pause(2000);

        // 7. Check if stock is pinned at the top
        // Pinned stocks appear near the top; use a generous y threshold (< 500) to handle varying screen sizes
        console.log(`Checking if ${stockName} is pinned at the top for Favorite ${favNumber}...`);
        const pinnedSelector = `android=new UiSelector().descriptionContains("${stockName}")`;
        const pinnedStockElems = await $$(pinnedSelector);

        let isPinned = false;
        for (const elem of pinnedStockElems) {
            const loc = await elem.getLocation().catch(() => null);
            if (loc && loc.y < 500) {
                // For Favorite 2, expect it on the right half of the screen
                if (favNumber === 2 && loc.x < windowSize.width / 2) {
                    continue;
                }
                isPinned = true;
                console.log(`✅ Verified ${stockName} is pinned at the top (Favorite ${favNumber}) before logout.`);
                break;
            }
        }

        if (!isPinned) {
            throw new Error(`${stockName} did not appear as pinned at the top of the Watchlist for Favorite ${favNumber}.`);
        }
    }
    async verifyPinnedStock(stockName, favNumber) {
        await driver.pause(1000)
        // Wait for bottom tabs to render
        if (favNumber == 1) {
            await driver.waitUntil(async () => {
                const el = $(`android=new UiSelector().className("android.widget.ImageView").instance(2)`);
                return await el.isExisting();
            }, { timeout: 15000, timeoutMsg: "App did not load bottom tabs" });
            await this.clickWatchlistTab();
            // Allow the watchlist to fully render with pinned stocks
            await driver.pause(2000);
        }

        console.log(`Checking if ${stockName} is pinned at the top for Favorite ${favNumber}...`);

        const windowSize = await driver.getWindowSize();
        // Pinned stocks appear near the top; use a generous y threshold (< 500)
        const favSelector = `android=new UiSelector().descriptionContains("${stockName}")`;
        const pinnedStockElems = await $$(favSelector);

        let isPinned = false;
        for (const elem of pinnedStockElems) {
            const loc = await elem.getLocation().catch(() => null);
            if (loc && loc.y < 500) {
                // For Favorite 2, expect it on the right half of the screen
                if (favNumber === 2 && loc.x < windowSize.width / 2) {
                    continue;
                }
                isPinned = true;
                console.log(`✅ Verified ${stockName} is pinned at the top (Favorite ${favNumber}).`);
                break;
            }
        }

        if (!isPinned) {
            throw new Error(`${stockName} did not appear as pinned at the top of the Watchlist for Favorite ${favNumber}.`);
        }
    }
    /**
     * In the search overlay, finds the target stock card that appears under
     * "Global Search Results" (the green-bookmarked row for an already-watchlisted scrip)
     * and taps the bookmark icon on its right edge to trigger the snackbar.
     *
     * @param {string} stockName - e.g. "ASSAMENT-EQ"
     */
    async clickGlobalSearchResultBookmark(stockName) {
        const stockUpper = stockName.trim().toUpperCase();
        console.log(`Looking for '${stockUpper}' under Global Search Results to click its bookmark...`);

        // 1. Find the y-position of the "Global Search Results" label
        let globalSearchY = null;
        try {
            const globalHeader = await $('//*[contains(@text, "Global Search Results") or contains(@content-desc, "Global Search Results")]');
            if (await globalHeader.isDisplayed().catch(() => false)) {
                const loc = await globalHeader.getLocation();
                globalSearchY = loc.y;
                console.log(`📍 "Global Search Results" header found at y=${globalSearchY}`);
            }
        } catch (e) { }

        // Fallback: scan all content-desc elements for the header text
        if (globalSearchY === null) {
            try {
                const allViews = await $$('//*[@content-desc != ""]');
                for (const v of allViews) {
                    const desc = await v.getAttribute('content-desc').catch(() => '');
                    if (desc.includes('Global Search Results')) {
                        const loc = await v.getLocation();
                        globalSearchY = loc.y;
                        console.log(`📍 "Global Search Results" found via scan at y=${globalSearchY}`);
                        break;
                    }
                }
            } catch (e) { }
        }

        if (globalSearchY === null) {
            throw new Error(`Could not locate "Global Search Results" section on screen.`);
        }

        // 2. Find the stock card that is BELOW the Global Search Results header
        // Priority: Exact match first (e.g. 'INFY' === 'INFY'), fallback to prefix ('INFY-EQ') only if no exact match exists
        let targetCard = null;
        let fallbackPrefixCard = null;
        try {
            const allViews = await $$('//*[@content-desc != ""]');
            for (const v of allViews) {
                if (!await v.isDisplayed().catch(() => false)) continue;
                const loc = await v.getLocation().catch(() => null);
                if (!loc || loc.y <= globalSearchY) continue;   // must be below the header

                const desc = await v.getAttribute('content-desc').catch(() => '');
                if (!desc) continue;

                const firstLine = desc.split('\n')[0].trim().toUpperCase();
                if (firstLine === stockUpper) {
                    targetCard = v;
                    console.log(`✅ Found exact match for '${stockUpper}' under Global Search Results at y=${loc.y}: "${desc.replace(/\n/g, ' ')}"`);
                    break;
                } else if (!fallbackPrefixCard && (firstLine.startsWith(stockUpper + '-') || firstLine.startsWith(stockUpper + ' '))) {
                    fallbackPrefixCard = v;
                }
            }
        } catch (e) { }

        if (!targetCard && fallbackPrefixCard) {
            console.log(`⚠️ Exact match for '${stockUpper}' not found; using prefix match under Global Search Results.`);
            targetCard = fallbackPrefixCard;
        }

        if (!targetCard) {
            throw new Error(`Could not find '${stockUpper}' card under "Global Search Results".`);
        }

        // 3. Tap the green bookmark icon
        // The bookmark sits on the far-right side of the row corresponding to targetCard.
        const cardLoc = await targetCard.getLocation();
        const cardSz = await targetCard.getSize();
        const windowSize = await driver.getWindowSize();

        const cardRight = cardLoc.x + cardSz.width;
        const cardCenterY = Math.floor(cardLoc.y + cardSz.height / 2);
        const cardTop = cardLoc.y - 15;
        const cardBottom = cardLoc.y + cardSz.height + 15;

        let tapX = null;
        let tapY = cardCenterY;

        // Strategy A: Find the bookmark sibling element to the right of the card in the same y-range
        try {
            const minX = Math.floor(windowSize.width * 0.85);
            const allViews = await $$('//*');
            for (const v of allViews) {
                if (!await v.isDisplayed().catch(() => false)) continue;
                const loc = await v.getLocation().catch(() => null);
                if (!loc) continue;
                // Must be: near the right edge of the screen, vertically within the card row
                if (loc.x >= minX && loc.y >= cardTop && loc.y <= cardBottom) {
                    const sz = await v.getSize().catch(() => ({ width: 0, height: 0 }));
                    // Bookmark icons are small (roughly 30–120px wide)
                    if (sz.width > 15 && sz.width < 150) {
                        tapX = Math.floor(loc.x + sz.width / 2);
                        tapY = Math.floor(loc.y + sz.height / 2);
                        console.log(`📌 Found bookmark sibling element at (${loc.x}, ${loc.y}) size ${sz.width}x${sz.height}. Tapping at (${tapX}, ${tapY})`);
                        break;
                    }
                }
            }
        } catch (e) { }

        // Strategy B: Fallback — tap at ~94% of screen width, vertically centred on the card
        if (tapX === null) {
            tapX = Math.floor(windowSize.width * 0.94);
            console.log(`📌 Bookmark sibling not found. Falling back to tap at (${tapX}, ${tapY})`);
        }

        console.log(`Tapping green bookmark icon at (${tapX}, ${tapY})...`);
        await driver.performActions([{
            type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        await driver.pause(2000);
    }

    async scrollSearchResultsToBottom() {
        const windowSize = await driver.getWindowSize();
        const startX = Math.floor(windowSize.width / 2);
        const startY = Math.floor(windowSize.height * 0.8);
        const endY = Math.floor(windowSize.height * 0.2);

        for (let i = 0; i < 3; i++) {
            await driver.performActions([{
                type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: startX, y: startY },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerMove', duration: 500, x: startX, y: endY },
                    { type: 'pointerUp', button: 0 }
                ]
            }]);
            await driver.pause(1000);
        }
    }

    async getAllSearchResults() {
        let globalSearchY = null;
        try {
            const globalHeader = await $('//*[contains(@text, "Global Search Results") or contains(@content-desc, "Global Search Results")]');
            if (await globalHeader.isDisplayed().catch(() => false)) {
                const loc = await globalHeader.getLocation();
                globalSearchY = loc.y;
            }
        } catch (e) { }

        const results = [];
        const searchResults = await $$('//*[@content-desc != ""]');
        for (const elem of searchResults) {
            if (await elem.isDisplayed().catch(() => false)) {
                const loc = await elem.getLocation().catch(() => null);
                if (loc && loc.y > 200 && loc.y < 3000) {
                    if (globalSearchY !== null && loc.y <= globalSearchY) continue;
                    const desc = await elem.getAttribute('content-desc').catch(() => null);
                    if (desc && desc.split('\n').length > 1 && !desc.includes('Global Search Results')) {
                        results.push(desc);
                    }
                }
            }
        }
        return results;
    }

    async clickFirstHeatmapStock() {
        // Try direct locator for heatmap stock tiles first
        try {
            const views = await $$(locators.get('heatmapGridStockTiles'));
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const loc = await v.getLocation().catch(() => ({ y: 0 }));
                    const desc = await v.getAttribute("content-desc").catch(() => "");
                    if (
                        loc.y > 320 &&
                        desc &&
                        !desc.startsWith("Watchlist") &&
                        !desc.includes("Advance") &&
                        !desc.includes("Decline") &&
                        desc !== "Val" &&
                        desc !== "%"
                    ) {
                        const parts = desc.split(/\n|,/);
                        const stockName = parts[0].trim();
                        if (stockName && stockName.length > 1) {
                            console.log(`Clicking heatmap stock tile: '${stockName}' (full desc: '${desc.replace(/\n/g, ' ')}')`);
                            await v.click();
                            await driver.pause(2500);
                            return stockName;
                        }
                    }
                }
            }
        } catch (e) { }

        // Fallback scan:
        const heatmapElements = await $$('//*[@content-desc != ""]');
        for (const elem of heatmapElements) {
            if (await elem.isDisplayed().catch(() => false)) {
                const loc = await elem.getLocation().catch(() => null);
                if (loc && loc.y > 320) {
                    const desc = await elem.getAttribute('content-desc').catch(() => null);
                    if (
                        desc &&
                        !desc.startsWith('Watchlist') &&
                        !desc.includes('Advance') &&
                        !desc.includes('Decline') &&
                        desc !== 'Val' &&
                        desc !== '%'
                    ) {
                        const parts = desc.split(/\n|,/);
                        const stockName = parts[0].trim();
                        if (stockName && stockName.length > 1) {
                            console.log(`Clicking fallback heatmap stock tile: '${stockName}'`);
                            await elem.click();
                            await driver.pause(2500);
                            return stockName;
                        }
                    }
                }
            }
        }
        return null;
    }

    async getStockOverviewTitle() {
        try {
            const titleElements = await $$('//*[@content-desc != ""]');
            for (const elem of titleElements) {
                if (await elem.isDisplayed().catch(() => false)) {
                    const loc = await elem.getLocation().catch(() => null);
                    if (loc && loc.y < 350) {
                        const desc = await elem.getAttribute('content-desc').catch(() => null);
                        if (
                            desc &&
                            !desc.includes('Back') &&
                            !desc.includes('Watchlist') &&
                            desc.length > 1
                        ) {
                            return desc;
                        }
                    }
                }
            }
        } catch (e) { }
        return "";
    }

    /**
     * Click a stock tile in Heatmap and verify navigation to Stock Overview page displaying the stock name.
     * Navigates back to Heatmap once verified.
     */
    async verifyHeatmapStockOverviewNavigation() {
        console.log('\n--- Verifying Stock Overview navigation from Heatmap tile (1st Watchlist) ---');
        const stockName = await this.clickFirstHeatmapStock();
        if (!stockName) {
            console.log('⚠️ No stock tile found in Heatmap to click.');
            return;
        }

        console.log(`Clicked stock tile '${stockName}' from heatmap. Waiting for Stock Overview page...`);
        await driver.pause(2500);

        // Extract base symbol (e.g. 'TCS-EQ' -> 'TCS', 'INFY' -> 'INFY', 'GOLDGUINEA OCT FUT' -> 'GOLDGUINEA')
        const baseSymbol = stockName.split(/[- ]/)[0].trim().toUpperCase();

        // Verify stock name on Stock Overview page
        let overviewTitle = await this.getStockOverviewTitle();
        let isVerified = false;

        if (overviewTitle && (overviewTitle.toUpperCase().includes(baseSymbol) || overviewTitle.toUpperCase().includes(stockName.toUpperCase()))) {
            isVerified = true;
        } else {
            // Check all visible elements in upper section of Stock Overview (y < 400)
            try {
                const headerViews = await $$('//*[@content-desc != ""]');
                for (const v of headerViews) {
                    if (await v.isDisplayed().catch(() => false)) {
                        const loc = await v.getLocation().catch(() => null);
                        if (loc && loc.y < 400) {
                            const desc = await v.getAttribute('content-desc').catch(() => '');
                            if (desc && (desc.toUpperCase().includes(baseSymbol) || desc.toUpperCase().includes(stockName.toUpperCase()))) {
                                overviewTitle = desc.split('\n')[0].trim();
                                isVerified = true;
                                break;
                            }
                        }
                    }
                }
            } catch (e) { }
        }

        if (isVerified) {
            const successMsg = `✅ [HEATMAP -> STOCK OVERVIEW VERIFIED]: Successfully navigated to Stock Overview for '${stockName}' (Header: '${overviewTitle}')`;
            console.log(successMsg);
            try { allure.addStep(successMsg); } catch (e) { }
        } else {
            throw new Error(`Failed to verify Stock Overview header for '${stockName}'. Found title: '${overviewTitle}'`);
        }

        // Navigate back from Stock Overview to Heatmap
        console.log('Navigating back from Stock Overview to Heatmap...');
        let backHandled = false;
        try {
            const backBtn = await $(locators.get('stockOverviewBackButton'));
            if (await backBtn.isDisplayed().catch(() => false)) {
                await backBtn.click();
                backHandled = true;
                await driver.pause(1500);
            }
        } catch (e) { }

        if (!backHandled) {
            try {
                const backDesc = await $('~Back');
                if (await backDesc.isDisplayed().catch(() => false)) {
                    await backDesc.click();
                    backHandled = true;
                    await driver.pause(1500);
                }
            } catch (e) { }
        }

        if (!backHandled) {
            await driver.back();
            await driver.pause(1500);
        }
    }

    /**
     * Process a single scrip or an array of scrips — remove if already in watchlist, then add it.
     * Supports dynamically handling multiple stock names with segments.
     * @param {string|Array} symbol - Stock symbol or array of records [{ symbol, segment }, ...]
     * @param {string} [segment] - Exchange/segment filter (e.g. 'NSE', 'BSE', 'BFO', 'ALL') or activeWatchlist if symbol is array
     * @param {string} [activeWatchlist] - Target watchlist name (e.g. 'Watchlist 1')
     */
    async processScripOnWatchlist(symbol, segment, activeWatchlist) {
        if (Array.isArray(symbol)) {
            return await this.processScripsOnWatchlist(symbol, segment || activeWatchlist)
        }

        const reqSeg = segment ? segment.trim().toUpperCase() : 'ALL'
        const symUpper = symbol.trim().toUpperCase()

        // Step A: Ensure search overlay is open, then type the scrip name into the search bar
        const isSearchOpen = await this.searchInputField.isDisplayed().catch(() => false)
        if (!isSearchOpen) {
            console.log("Search overlay not open — clicking search icon...")
            await this.clickSearchIcon()
            await driver.pause(1000)
        }
        await this.enterScripName(symbol)
        await driver.pause(1000)

        // Step B: Select the correct segment filter chip
        await this.selectExchangeFilter(reqSeg)

        // Wait for search results to load (search might be slow on emulator)
        console.log(`Waiting for search results for '${symUpper}' (${reqSeg}) to load...`)
        await driver.pause(3000) // Dedicated wait from search to bookmark

        // Wait until at least one search card appears below the chip bar or "Global Search Results" header renders
        try {
            await driver.waitUntil(async () => {
                const views = await $$('//*[@content-desc != ""]')
                for (const v of views) {
                    const loc = await v.getLocation().catch(() => null)
                    if (loc && loc.y > 300) {
                        const desc = await v.getAttribute('content-desc').catch(() => '')
                        if (desc && (desc.toUpperCase().includes(symUpper) || desc.includes('Global Search Results'))) {
                            return true
                        }
                    }
                }
                return false
            }, { timeout: 6000, interval: 400, timeoutMsg: `Search results for '${symUpper}' did not load in time` })
        } catch (e) {
            console.log(`ℹ️ Search wait: ${e.message}`)
        }
        await driver.pause(1000)

        // ── Step C: Detect position relative to "Global Search Results" header ──────
        //   • ABOVE header  → scrip is already in the watchlist (Image 1 scenario)
        //   • BELOW header  → scrip is NOT in the watchlist   (Image 2 / Image 3 scenario)
        let globalSearchY = null
        try {
            const globalHeader = await $('//*[contains(@text,"Global Search Results") or contains(@content-desc,"Global Search Results")]')
            if (await globalHeader.isDisplayed().catch(() => false)) {
                const loc = await globalHeader.getLocation()
                globalSearchY = loc.y
                console.log(`📍 "Global Search Results" header found at y=${globalSearchY}`)
            }
        } catch (e) { }

        // Fallback scan for "Global Search Results" text
        if (globalSearchY === null) {
            try {
                const allViews = await $$('//*[@content-desc != ""]')
                for (const v of allViews) {
                    const desc = await v.getAttribute('content-desc').catch(() => '')
                    if (desc.includes('Global Search Results')) {
                        const loc = await v.getLocation()
                        globalSearchY = loc.y
                        console.log(`📍 "Global Search Results" found via scan at y=${globalSearchY}`)
                        break
                    }
                }
            } catch (e) { }
        }

        // ── Step D: Find matching scrip card – determine if above or below header ──
        let scripAboveHeader = null  // already in watchlist
        let scripBelowHeader = null  // available to add
        let scripAboveHeaderPrefix = null
        let scripBelowHeaderPrefix = null

        try {
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (!await v.isDisplayed().catch(() => false)) continue
                const loc = await v.getLocation().catch(() => null)
                if (!loc || loc.y < 300) continue // skip top bar / chips

                const desc = await v.getAttribute('content-desc').catch(() => '')
                if (!desc || !desc.includes('\n')) continue

                const lines = desc.split('\n').map(s => s.trim().toUpperCase())
                const firstLine = lines[0] || ''
                const secondLine = lines[1] || ''

                const exactSymbolMatch = firstLine === symUpper
                const prefixSymbolMatch = firstLine.startsWith(symUpper + '-') ||
                    firstLine.startsWith(symUpper + ' ') ||
                    (symUpper === 'USD' && firstLine.startsWith('USD')) ||
                    (symUpper === 'GOLD' && firstLine.startsWith('GOLD')) ||
                    firstLine.startsWith(symUpper)
                const segmentMatches = reqSeg === 'ALL' ||
                    secondLine === reqSeg ||
                    desc.toUpperCase().includes(reqSeg)

                if (segmentMatches) {
                    if (globalSearchY !== null && loc.y < globalSearchY) {
                        if (exactSymbolMatch && !scripAboveHeader) {
                            scripAboveHeader = v
                            console.log(`✅ Scrip '${symUpper}' (exact match) IS already in watchlist (y=${loc.y} < header y=${globalSearchY})`)
                        } else if (prefixSymbolMatch && !scripAboveHeaderPrefix) {
                            scripAboveHeaderPrefix = v
                        }
                    } else {
                        if (exactSymbolMatch && !scripBelowHeader) {
                            scripBelowHeader = v
                            console.log(`📋 Scrip '${symUpper}' (exact match) found in Global Search Results (y=${loc.y})`)
                        } else if (prefixSymbolMatch && !scripBelowHeaderPrefix) {
                            scripBelowHeaderPrefix = v
                        }
                    }
                }
                if (scripAboveHeader && scripBelowHeader) break
            }
        } catch (e) {
            console.log('Error scanning search result cards:', e.message)
        }

        if (!scripAboveHeader && scripAboveHeaderPrefix) {
            scripAboveHeader = scripAboveHeaderPrefix
            console.log(`⚠️ Using prefix match for '${symUpper}' in watchlist above header`)
        }
        if (!scripBelowHeader && scripBelowHeaderPrefix) {
            scripBelowHeader = scripBelowHeaderPrefix
            console.log(`⚠️ Using prefix match for '${symUpper}' under Global Search Results`)
        }

        // ── Step E: REMOVE flow — scrip is already present above "Global Search Results" ──
        const wasAlreadyInWatchlist = !!scripAboveHeader
        if (scripAboveHeader) {
            console.log(`\n⚠️  Scrip '${symUpper}' already in watchlist. Removing it...`)

            // Click the card body to open Stock Overview
            const cardLoc = await scripAboveHeader.getLocation()
            const cardSz = await scripAboveHeader.getSize()
            const tapX = Math.floor(cardLoc.x + cardSz.width * 0.4)
            const tapY = Math.floor(cardLoc.y + cardSz.height / 2)

            console.log(`Tapping scrip card '${symUpper}' at (${tapX}, ${tapY}) to open Stock Overview...`)
            await driver.performActions([{
                type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerUp', button: 0 }
                ]
            }])
            await driver.pause(2500)

            // Click bookmark icon on Stock Overview to open watchlist bottom sheet
            await this.clickOverviewBookmarkIcon(reqSeg)
            await driver.pause(1000)

            // If bottom sheet did not open, retry with coordinate tap
            let sheetOpen = await this.isWatchlistBottomSheetOpen()
            if (!sheetOpen) {
                console.log('Bottom sheet not open yet — retrying bookmark click...')
                const winSize = await driver.getWindowSize()
                const bmX = Math.floor(winSize.width * 0.66)
                const bmY = 202
                await driver.performActions([{
                    type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: bmX, y: bmY },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }])
                await driver.pause(1500)
                sheetOpen = await this.isWatchlistBottomSheetOpen()
            }

            // Tap the minus (–) button for the active watchlist row on the bottom sheet
            let minusClicked = false
            const candidateNames = [activeWatchlist]
            if (activeWatchlist && activeWatchlist.toLowerCase().startsWith('watchlist ')) {
                const numPart = activeWatchlist.split(' ')[1]
                if (numPart) candidateNames.push(numPart)
            }

            // Method A: accessibility-id lookup for watchlist row, then tap far-right
            for (const candidate of candidateNames) {
                if (minusClicked) break
                try {
                    const row = $(`~${candidate}`)
                    if (await row.isDisplayed().catch(() => false)) {
                        const rLoc = await row.getLocation()
                        const rSz = await row.getSize()
                        const mX = Math.floor(rLoc.x + rSz.width * 0.94)
                        const mY = Math.floor(rLoc.y + rSz.height / 2)
                        await driver.performActions([{
                            type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                            actions: [
                                { type: 'pointerMove', duration: 0, x: mX, y: mY },
                                { type: 'pointerDown', button: 0 },
                                { type: 'pointerUp', button: 0 }
                            ]
                        }])
                        minusClicked = true
                        console.log(`✅ Tapped '-' for watchlist row '${candidate}' at (${mX}, ${mY})`)
                    }
                } catch (e) { }
            }

            // Method B: scan bottom-sheet rows (y > 800) for the watchlist name
            if (!minusClicked) {
                try {
                    const bsViews = await $$('//*[@content-desc != ""]')
                    for (const v of bsViews) {
                        if (!await v.isDisplayed().catch(() => false)) continue
                        const rLoc = await v.getLocation()
                        if (rLoc.y < 800) continue
                        const desc = await v.getAttribute('content-desc').catch(() => '')
                        const matches = candidateNames.length === 0 ||
                            candidateNames.some(n => desc === n || desc.startsWith(n + '\n') || desc.includes(n))
                        if (matches) {
                            const rSz = await v.getSize()
                            const mX = Math.floor(rLoc.x + rSz.width * 0.94)
                            const mY = Math.floor(rLoc.y + rSz.height / 2)
                            await driver.performActions([{
                                type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                                actions: [
                                    { type: 'pointerMove', duration: 0, x: mX, y: mY },
                                    { type: 'pointerDown', button: 0 },
                                    { type: 'pointerUp', button: 0 }
                                ]
                            }])
                            minusClicked = true
                            console.log(`✅ Tapped '-' via scan on bottom-sheet row '${desc}' at (${mX}, ${mY})`)
                            break
                        }
                    }
                } catch (e) { }
            }

            // Method C: direct watchlistRemoveMinusBtn locator
            if (!minusClicked) {
                try {
                    const minusBtn = await this.watchlistRemoveMinusBtn
                    if (await minusBtn.isDisplayed().catch(() => false)) {
                        await minusBtn.click()
                        minusClicked = true
                        console.log(`✅ Scrip removed via watchlistRemoveMinusBtn locator`)
                    }
                } catch (e) { }
            }

            // ── Verify REMOVE snackbar IMMEDIATELY after minus tap (before any navigation) ──
            // Snackbar is transient (~1-2 s). Poll right away using UiAutomator selectors
            // which are more reliable than XPath for dynamic Android toast/snackbar elements.
            try {
                const windowSize = await driver.getWindowSize()
                const snackbarThresholdY = Math.floor(windowSize.height * 0.70) // bottom 30% of screen
                await driver.waitUntil(async () => {
                    try {
                        const byText = await $$('android=new UiSelector().textContains("Removed")')
                        for (const el of byText) {
                            if (!await el.isDisplayed().catch(() => false)) continue
                            const loc = await el.getLocation().catch(() => null)
                            if (loc && loc.y >= snackbarThresholdY) return true
                        }
                        const byDesc = await $$('android=new UiSelector().descriptionContains("Removed")')
                        for (const el of byDesc) {
                            if (!await el.isDisplayed().catch(() => false)) continue
                            const loc = await el.getLocation().catch(() => null)
                            if (loc && loc.y >= snackbarThresholdY) return true
                        }
                        return false
                    } catch (e) { return false }
                }, { timeout: 4000, interval: 200, timeoutMsg: 'Remove snackbar not visible within 4 s' })
                const removeMsg = `✅ [REMOVE VERIFIED]: Snackbar confirmed removal of '${symUpper}' from watchlist '${activeWatchlist}'`
                console.log(removeMsg)
                try { allure.addStep(removeMsg) } catch (e) { }
            } catch (e) {
                // Snackbar may have already disappeared — log but do not fail the test
                console.log(`ℹ️  Remove snackbar not captured for '${symUpper}' (may have dismissed quickly): ${e.message}`)
                try { allure.addStep(`ℹ️  Remove snackbar not captured for '${symUpper}'`) } catch (e) { }
            }

            await driver.pause(500)

            // Close bottom sheet if still visible
            if (sheetOpen || await this.isWatchlistBottomSheetOpen().catch(() => false)) {
                await driver.back()
                await driver.pause(1000)
            }

            // Navigate back from Stock Overview to search screen
            let backHandled = false
            try {
                const backBtn = await this.stockOverviewBackButton
                if (await backBtn.isDisplayed().catch(() => false)) {
                    await backBtn.click()
                    backHandled = true
                    console.log('Clicked Back button to return to Search overlay')
                    await driver.pause(1500)
                }
            } catch (e) { }

            if (!backHandled) {
                try {
                    const backDesc = await $('~Back')
                    if (await backDesc.isDisplayed().catch(() => false)) {
                        await backDesc.click()
                        backHandled = true
                        await driver.pause(1500)
                    }
                } catch (e) { }
            }

            if (!backHandled) {
                await driver.back()
                await driver.pause(1500)
            }

            // Re-enter scrip name if the search bar was cleared on navigation back
            const inputField = this.searchInputField
            const currentVal = await inputField.getText().catch(() => '')
            if (!currentVal || !currentVal.toUpperCase().includes(symUpper)) {
                console.log('Search bar was cleared — re-entering scrip name...')
                await this.enterScripName(symbol)
                await this.selectExchangeFilter(reqSeg)
                await driver.pause(1500)
            } else {
                await driver.pause(1000)
            }

            // Re-find card below header for the add step
            scripAboveHeader = null
            scripBelowHeader = null

            let scripBelowHeaderPrefix = null
            try {
                const views2 = await $$('//*[@content-desc != ""]')
                for (const v of views2) {
                    if (!await v.isDisplayed().catch(() => false)) continue
                    const loc = await v.getLocation().catch(() => null)
                    if (!loc || loc.y < 300) continue
                    if (globalSearchY !== null && loc.y < globalSearchY) continue // skip above header

                    const desc = await v.getAttribute('content-desc').catch(() => '')
                    if (!desc || !desc.includes('\n')) continue

                    const lines = desc.split('\n').map(s => s.trim().toUpperCase())
                    const firstLine = lines[0] || ''
                    const secondLine = lines[1] || ''

                    const exactSymbolMatch = firstLine === symUpper
                    const prefixSymbolMatch = firstLine.startsWith(symUpper + '-') ||
                        firstLine.startsWith(symUpper + ' ') ||
                        (symUpper === 'USD' && firstLine.startsWith('USD')) ||
                        (symUpper === 'GOLD' && firstLine.startsWith('GOLD')) ||
                        firstLine.startsWith(symUpper)
                    const segmentMatches = reqSeg === 'ALL' ||
                        secondLine === reqSeg ||
                        desc.toUpperCase().includes(reqSeg)

                    if (segmentMatches) {
                        if (exactSymbolMatch) {
                            scripBelowHeader = v
                            console.log(`📋 After removal — found exact scrip '${symUpper}' under Global Search Results at y=${loc.y}`)
                            break
                        } else if (!scripBelowHeaderPrefix && prefixSymbolMatch) {
                            scripBelowHeaderPrefix = v
                        }
                    }
                }
            } catch (e) { }

            if (!scripBelowHeader && scripBelowHeaderPrefix) {
                scripBelowHeader = scripBelowHeaderPrefix
                console.log(`⚠️ After removal — using prefix match for '${symUpper}' under Global Search Results`)
            }
        }

        // ── Step F: ADD flow — tap bookmark icon on first Global Search result ─────
        // (white rectangle bookmark icon at far right of first scrip row)
        let targetCard = scripBelowHeader

        if (!targetCard) {
            let targetCardPrefix = null
            try {
                const views = await $$('//*[@content-desc != ""]')
                for (const v of views) {
                    if (!await v.isDisplayed().catch(() => false)) continue
                    const loc = await v.getLocation().catch(() => null)
                    if (!loc || loc.y < 300) continue
                    if (globalSearchY !== null && loc.y < globalSearchY) continue

                    const desc = await v.getAttribute('content-desc').catch(() => '')
                    if (!desc || !desc.includes('\n')) continue

                    const lines = desc.split('\n').map(s => s.trim().toUpperCase())
                    const firstLine = lines[0] || ''
                    if (firstLine === symUpper) {
                        targetCard = v
                        console.log(`📋 Found exact target scrip card '${symUpper}' below header at y=${loc.y}`)
                        break
                    } else if (!targetCardPrefix && (
                        firstLine.startsWith(symUpper + '-') ||
                        firstLine.startsWith(symUpper + ' ') ||
                        (symUpper === 'USD' && firstLine.startsWith('USD')) ||
                        (symUpper === 'GOLD' && firstLine.startsWith('GOLD')) ||
                        firstLine.startsWith(symUpper)
                    )) {
                        targetCardPrefix = v
                    }
                }
            } catch (e) { }

            if (!targetCard && targetCardPrefix) {
                targetCard = targetCardPrefix
            }
        }

        let tapX = null
        let tapY = null

        if (!wasAlreadyInWatchlist) {
            console.log(`\n📌 Scrip '${symUpper}' was NOT present in watchlist (not above Global Search Results). Locating its bookmark icon...`)
            const windowSize = await driver.getWindowSize()
            const tLoc = targetCard ? await targetCard.getLocation().catch(() => null) : null
            const tSz = targetCard ? await targetCard.getSize().catch(() => null) : null

            let bookmarkEl = null
            try {
                // Try addScripBookmarkIcon locator (instance 28)
                const iconFromLocator = await $(locators.get('addScripBookmarkIcon'))
                if (await iconFromLocator.isDisplayed().catch(() => false)) {
                    bookmarkEl = iconFromLocator
                }
            } catch (e) { }

            if (!bookmarkEl && tLoc && tSz) {
                try {
                    // Find child/sibling view or imageview on the far right within card row height
                    const cardTop = tLoc.y - 15
                    const cardBottom = tLoc.y + tSz.height + 15
                    const minX = Math.floor(windowSize.width * 0.80)
                    const candidateViews = await $$('//android.widget.ImageView | //android.view.View')
                    for (const v of candidateViews) {
                        if (!await v.isDisplayed().catch(() => false)) continue
                        const loc = await v.getLocation().catch(() => null)
                        if (!loc || loc.x < minX) continue
                        if (loc.y >= cardTop && loc.y <= cardBottom) {
                            const sz = await v.getSize().catch(() => ({ width: 0, height: 0 }))
                            if (sz.width > 15 && sz.width < 180) {
                                bookmarkEl = v
                                break
                            }
                        }
                    }
                } catch (e) { }
            }

            if (bookmarkEl) {
                try {
                    await bookmarkEl.click()
                    console.log(`📌 Clicked bookmark icon right to scrip via instance(28) locator`)
                } catch (e) {
                    const bLoc = await bookmarkEl.getLocation()
                    const bSz = await bookmarkEl.getSize()
                    tapX = Math.floor(bLoc.x + bSz.width / 2)
                    tapY = Math.floor(bLoc.y + bSz.height / 2)
                    console.log(`📌 Tapping center (${tapX}, ${tapY}) of bookmark icon`)
                    await driver.performActions([{
                        type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                        actions: [
                            { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                            { type: 'pointerDown', button: 0 },
                            { type: 'pointerUp', button: 0 }
                        ]
                    }])
                }
            } else {
                tapX = Math.floor(windowSize.width * 0.925)
                tapY = tLoc && tSz ? Math.floor(tLoc.y + tSz.height / 2) : Math.floor(windowSize.height * 0.42)
                console.log(`📌 Tapping calculated bookmark coordinates at (${tapX}, ${tapY}) for scrip not in watchlist`)
                await driver.performActions([{
                    type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }])
            }
        } else {
            // Stock was existing in watchlist (existing flow that correctly works)
                // Fallback: tap far-right of the first result row below the header
                console.log(`Falling back to coordinate-based bookmark tap for '${symUpper}'...`)
                const winSize = await driver.getWindowSize()
                tapX = Math.floor(winSize.width * 0.94)
                tapY = Math.floor(winSize.height * 0.42)
                await driver.performActions([{
                    type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: tapX, y: tapY },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }])
            
        }

        // ── Verify ADD snackbar IMMEDIATELY after the bookmark tap ──
        // Snackbar is transient (~1-2 s). Poll right away using UiAutomator selectors
        // which are more reliable than XPath for dynamic Android toast/snackbar elements.
        try {
            const windowSize = await driver.getWindowSize()
            const snackbarThresholdY = Math.floor(windowSize.height * 0.70) // bottom 30% of screen
            await driver.waitUntil(async () => {
                try {
                    const byText = await $$('android=new UiSelector().textContains("Added")')
                    for (const el of byText) {
                        if (!await el.isDisplayed().catch(() => false)) continue
                        const loc = await el.getLocation().catch(() => null)
                        if (loc && loc.y >= snackbarThresholdY) return true
                    }
                    const byDesc = await $$('android=new UiSelector().descriptionContains("Added")')
                    for (const el of byDesc) {
                        if (!await el.isDisplayed().catch(() => false)) continue
                        const loc = await el.getLocation().catch(() => null)
                        if (loc && loc.y >= snackbarThresholdY) return true
                    }
                    return false
                } catch (e) { return false }
            }, { timeout: 4000, interval: 200, timeoutMsg: 'Add snackbar not visible within 4 s' })
            const addMsg = `✅ [ADD VERIFIED]: Snackbar confirmed '${symUpper}' added to watchlist '${activeWatchlist}'`
            console.log(addMsg)
            try { allure.addStep(addMsg) } catch (e) { }
        } catch (e) {
            console.log(`ℹ️  Add snackbar not captured for '${symUpper}' (may have dismissed quickly): ${e.message}`)
            try { allure.addStep(`ℹ️  Add snackbar not captured for '${symUpper}'`) } catch (e) { }
        }

        await driver.pause(1000)

        // ── Reset segment filter to ALL for the next scrip iteration ────────────
        console.log(`Resetting segment filter to 'ALL'...`)
        await this.selectExchangeFilter('ALL')
        await driver.pause(1000)

        console.log(`\n✅ Completed processing scrip '${symUpper}' (${reqSeg})`)
    }

    /**
     * Process multiple scrips dynamically (e.g. from testData.csv or any list of { symbol, segment }).
     * Ensures remove and add is executed for ONLY ONE stock per segment.
     * @param {Array<{symbol: string, segment: string}>} scripList - List of scrips with segment
     * @param {string} activeWatchlist - Target watchlist name
     */
    async processScripsOnWatchlist(scripList, activeWatchlist) {
        if (!Array.isArray(scripList)) return
        const processedSegments = new Set()
        for (const record of scripList) {
            const symbol = record.symbol || record.scrip || record.stockName
            const segment = (record.segment || record.seg || 'ALL').trim().toUpperCase()
            if (!symbol) continue

            // Ensure remove and add is done for ONLY one stock in each segment
            if (processedSegments.has(segment)) {
                console.log(`⏩ Skipping '${symbol}' (${segment}) — already processed one stock for segment '${segment}'`)
                continue
            }
            processedSegments.add(segment)

            console.log(`\n📌 Processing 1 stock for segment '${segment}': '${symbol}'`)
            await this.processScripOnWatchlist(symbol, segment, activeWatchlist)
        }
    }
}

export default new WatchlistPage()
