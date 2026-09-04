import allure from '@wdio/allure-reporter'
import locators from '../utils/locatorHelper.js'

class WatchlistPage {

    // Search Icon & Input
    get searchIcon() {
        return $(locators.get('searchIcon'))
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
                await driver.pause(1000)
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
    }

    async clickWatchlist() {
        await this.selectWatchlist.click()
        //await driver.pause(1000)
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
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const loc = await v.getLocation()
                    const desc = await v.getAttribute("content-desc").catch(() => "")
                    // Only target list view rows below top header (y > 350) matching indexName
                    if (loc.y > 350 && desc && desc.toLowerCase().includes(indexName.toLowerCase())) {
                        await v.click()
                        await driver.pause(1200)
                        console.log(`Clicked '${indexName}' accordion row at (${loc.x}, ${loc.y})`)
                        return true
                    }
                }
            }
            return false
        }

        // 1. Click SENSEX Accordion row (brown rectangle in list view, y > 350)
        console.log("Expanding SENSEX accordion in list view...")
        await clickListAccordion('SENSEX')

        console.log("Scrolling and counting SENSEX stocks under SENSEX accordion (Expected ~30)...")
        const sensexListCount = await this.getWatchlistStockCount()
        const sensexMsg = `📊 [INDEX LIST CHECK]: SENSEX Total Stocks Counted: ${sensexListCount} (Expected: 30)`
        console.log(sensexMsg)
        allure.addStep(sensexMsg)

        // 2. Collapse SENSEX & Click Nifty 50 Accordion row (pink rectangle in list view)
        console.log("Collapsing SENSEX & Expanding Nifty 50 accordion in list view...")
        await clickListAccordion('SENSEX')
        await driver.pause(500)
        await clickListAccordion('Nifty 50')

        console.log("Scrolling and counting NIFTY 50 stocks under Nifty 50 accordion (Expected ~50)...")
        const niftyListCount = await this.getWatchlistStockCount()
        const niftyMsg = `📊 [INDEX LIST CHECK]: NIFTY 50 Total Stocks Counted: ${niftyListCount} (Expected: 50)`
        console.log(niftyMsg)
        allure.addStep(niftyMsg)

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
    async getWatchlistStockCount() {
        try {
            const countedStocks = new Set()
            let previousSize = -1
            let noNewCount = 0

            while (noNewCount < 2) {
                // Use specific UiSelector for content descriptions to optimize UI tree scanning speed during peak morning market hours
                const listElements = await $$(locators.get('watchlistStockRows'))
                for (const elem of listElements) {
                    if (await elem.isDisplayed().catch(() => false)) {
                        const loc = await elem.getLocation().catch(() => ({ y: 0 }))
                        const desc = await elem.getAttribute("content-desc").catch(() => "")
                        if (loc.y > 300 && desc) {
                            const stockName = desc.split(/\n|,/)[0].trim()
                            if (stockName && stockName.length > 1 && !stockName.includes("Watchlist")) {
                                countedStocks.add(stockName)
                            }
                        }
                    }
                }

                if (countedStocks.size === previousSize) {
                    noNewCount++
                } else {
                    noNewCount = 0
                    previousSize = countedStocks.size
                }

                if (noNewCount >= 2) break

                // Scroll down gesture to load lower stock rows in list view
                try {
                    await driver.performActions([{
                        type: 'pointer',
                        id: 'finger1',
                        parameters: { pointerType: 'touch' },
                        actions: [
                            { type: 'pointerMove', duration: 0, x: 500, y: 1400 },
                            { type: 'pointerDown', button: 0 },
                            { type: 'pointerMove', duration: 500, x: 500, y: 500 },
                            { type: 'pointerUp', button: 0 }
                        ]
                    }])
                } catch (e) { }
                await driver.pause(600)
            }

            // Scroll back up to restore view position after counting
            if (countedStocks.size > 0) {
                for (let i = 0; i < 2; i++) {
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
