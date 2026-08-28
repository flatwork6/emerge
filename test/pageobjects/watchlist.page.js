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


    /**
     * Click search icon to open search input field
     */


    async openWatchListDropdown(currentWatchlistName) {
        // If search overlay is still open, close it first
        try {
            const searchField = this.searchInputField
            if (await searchField.isDisplayed().catch(() => false)) {
                console.log("Search overlay is visible when opening dropdown. Closing search...")
                await this.closeSearch()
                await driver.pause(1000)
            }
        } catch (e) { }

        if (currentWatchlistName) {
            try {
                // Look for dropdown element displaying currentWatchlistName (e.g. descriptionStartsWith("fivee") or "Watchlist 3")
                const dynamicDropdown = $(`android=new UiSelector().descriptionStartsWith("${currentWatchlistName}")`)
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
                        if (desc && (desc.includes('/') || desc.includes('Watchlist') || currentWatchlistName && desc.includes(currentWatchlistName))) {
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
        const item = $(`~${name}`)
        await item.waitForDisplayed({ timeout: 5000 })
        await item.click()
        await driver.pause(1000)
    }

    async clickWatchlist() {
        await this.selectWatchlist.click()
        //await driver.pause(1000)
    }

    async scrollIndexWatchlist() {
        console.log("\n========================================")
        console.log("Processing Index Watchlist: NIFTY 50 & SENSEX")
        console.log("========================================")

        // 1. Process NIFTY 50
        try {
            const niftyTab = $(`~NIFTY 50`)
            if (await niftyTab.isDisplayed().catch(() => false)) {
                await niftyTab.click()
                await driver.pause(1000)
            }
        } catch (e) { }

        console.log("Scrolling and counting NIFTY 50 stocks...")
        const niftyStocks = new Set()
        for (let scroll = 0; scroll < 6; scroll++) {
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const desc = await v.getAttribute("content-desc").catch(() => "")
                    const loc = await v.getLocation()
                    if (loc.y > 350 && desc && (desc.includes('NSE') || desc.includes('BSE') || desc.includes('EQ'))) {
                        const stockName = desc.split(/\n|,/)[0].trim()
                        if (stockName && stockName.length > 1) niftyStocks.add(stockName)
                    }
                }
            }
            // Scroll down gesture
            await driver.action('pointer')
                .move({ duration: 0, x: 500, y: 1500 })
                .down({ button: 0 })
                .move({ duration: 600, x: 500, y: 500 })
                .up({ button: 0 })
                .perform()
            await driver.pause(600)
        }
        const niftyMsg = `📊 [INDEX CHECK]: NIFTY 50 Total Stocks Counted: ${niftyStocks.size} (Expected: 50)`
        console.log(niftyMsg)
        allure.addStep(niftyMsg)

        // 2. Process SENSEX
        try {
            const sensexTab = $(`~SENSEX`)
            if (await sensexTab.isDisplayed().catch(() => false)) {
                await sensexTab.click()
                await driver.pause(1000)
            }
        } catch (e) { }

        console.log("Scrolling and counting SENSEX stocks...")
        const sensexStocks = new Set()
        for (let scroll = 0; scroll < 4; scroll++) {
            const views = await $$('//*[@content-desc != ""]')
            for (const v of views) {
                if (await v.isDisplayed().catch(() => false)) {
                    const desc = await v.getAttribute("content-desc").catch(() => "")
                    const loc = await v.getLocation()
                    if (loc.y > 350 && desc && (desc.includes('NSE') || desc.includes('BSE') || desc.includes('EQ'))) {
                        const stockName = desc.split(/\n|,/)[0].trim()
                        if (stockName && stockName.length > 1) sensexStocks.add(stockName)
                    }
                }
            }
            // Scroll down gesture
            await driver.action('pointer')
                .move({ duration: 0, x: 500, y: 1500 })
                .down({ button: 0 })
                .move({ duration: 600, x: 500, y: 500 })
                .up({ button: 0 })
                .perform()
            await driver.pause(600)
        }
        const sensexMsg = `📊 [INDEX CHECK]: SENSEX Total Stocks Counted: ${sensexStocks.size} (Expected: 30)`
        console.log(sensexMsg)
        allure.addStep(sensexMsg)
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
            const scripSelector = `android=new UiSelector().descriptionContains("${symbol}")`
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
                            const targetRowUi = $(`android=new UiSelector().descriptionContains("${candidate}")`)
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
     * Get stock count from Watchlist List view
     */
    async getWatchlistStockCount() {
        try {
            // Find all stock cards rendered in watchlist list view
            const listElements = await $$('//*[@content-desc != ""]')
            const countedStocks = new Set()
            for (const elem of listElements) {
                if (await elem.isDisplayed().catch(() => false)) {
                    const loc = await elem.getLocation()
                    const desc = await elem.getAttribute("content-desc").catch(() => "")
                    // Stock rows are located below top header (y > 300) and contain stock descriptions/exchanges
                    if (loc.y > 300 && desc && (desc.includes('NSE') || desc.includes('BSE') || desc.includes('CDS') || desc.includes('MCX') || desc.includes('NFO') || desc.includes('BFO') || desc.includes('EQ') || desc.includes('FUT'))) {
                        const stockName = desc.split(/\n|,/)[0].trim()
                        if (stockName && stockName.length > 1 && !stockName.includes("Watchlist")) {
                            countedStocks.add(stockName)
                        }
                    }
                }
            }
            const count = countedStocks.size
            console.log(`📋 Watchlist list view stocks counted: ${count} (${Array.from(countedStocks).join(', ')})`)
            return count
        } catch (e) {
            console.log("Error counting watchlist stocks:", e)
            return 0
        }
    }

    /**
     * Get stock details and tile counts from Heatmap grid view by scrolling through the view.
     * Categorizes stocks based on Up arrow (↑ - Advance) vs Down arrow (↓ - Decline).
     */
    async getHeatmapGridStockCount() {
        try {
            const advanceStocks = new Set()
            const declineStocks = new Set()
            const allGridStocks = new Set()

            // Helper to scan visible grid stock tiles on screen
            const scanVisibleTiles = async () => {
                const views = await $$('//*[@content-desc != ""]')
                for (const view of views) {
                    if (await view.isDisplayed().catch(() => false)) {
                        const loc = await view.getLocation()
                        const desc = await view.getAttribute("content-desc").catch(() => "")
                        
                        // Filter out headers/controls (y > 320)
                        if (loc.y > 320 && desc && 
                            !desc.startsWith("Watchlist") && 
                            !desc.startsWith("Advance") && 
                            !desc.startsWith("Decline") && 
                            desc !== "Val" && desc !== "%") {
                            
                            // Split by newline or comma
                            const parts = desc.split(/\n|,/)
                            const stockName = parts[0].trim()
                            
                            if (stockName && stockName.length > 1) {
                                // Check if description contains Up Arrow (↑), Down Arrow (↓), 'up', or 'down'
                                const isUp = desc.includes('↑') || desc.toLowerCase().includes(' up ') || desc.includes('+')
                                const isDown = desc.includes('↓') || desc.toLowerCase().includes(' down ')
                                
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

            // 1. Scan initial top grid tiles
            await scanVisibleTiles()

            // 2. Perform scroll down gesture to bring lower grid tiles into view
            await driver.action('pointer')
                .move({ duration: 0, x: 500, y: 1300 })
                .down({ button: 0 })
                .move({ duration: 600, x: 500, y: 500 })
                .up({ button: 0 })
                .perform()
            await driver.pause(600)

            // 3. Scan newly revealed grid tiles after scroll
            await scanVisibleTiles()

            const gridAdvanceCount = advanceStocks.size
            const gridDeclineCount = declineStocks.size
            const totalGridCount = allGridStocks.size

            console.log(`📈 Grid Up Arrow (Advance) Stocks: ${gridAdvanceCount} (${Array.from(advanceStocks).join(', ')})`)
            console.log(`📉 Grid Down Arrow (Decline) Stocks: ${gridDeclineCount} (${Array.from(declineStocks).join(', ')})`)
            console.log(`📊 Total Grid Stock Tiles Counted: ${totalGridCount}`)

            return { gridAdvanceCount, gridDeclineCount, totalGridCount }
        } catch (e) {
            console.log("Error counting heatmap grid stock tiles:", e)
            return { gridAdvanceCount: 0, gridDeclineCount: 0, totalGridCount: 0 }
        }
    }

    /**
     * Extract Advance and Decline badge values from Heatmap UI
     */
    async getHeatmapAdvanceDeclineTotal() {
        try {
            let advanceCount = 0
            let declineCount = 0

            const advElem = await $('//*[contains(@content-desc, "Advance")]')
            if (await advElem.isDisplayed().catch(() => false)) {
                const advText = await advElem.getAttribute("content-desc")
                const match = advText.match(/\d+/)
                if (match) advanceCount = parseInt(match[0], 10)
            }

            const decElem = await $('//*[contains(@content-desc, "Decline")]')
            if (await decElem.isDisplayed().catch(() => false)) {
                const decText = await decElem.getAttribute("content-desc")
                const match = decText.match(/\d+/)
                if (match) declineCount = parseInt(match[0], 10)
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
     * Full Heatmap Stock Count evaluation:
     * 1. Counts grid stock tiles by scrolling and categorizing by up/down arrow
     * 2. Compares Grid Advance vs Advance Badge
     * 3. Compares Grid Decline vs Decline Badge
     * 4. Returns total grid count for comparison with List View
     */
    async getHeatmapStockCount() {
        const { gridAdvanceCount, gridDeclineCount, totalGridCount } = await this.getHeatmapGridStockCount()
        const { advanceCount, declineCount, badgeTotal } = await this.getHeatmapAdvanceDeclineTotal()

        if (gridAdvanceCount === advanceCount) {
            console.log(`✅ [ADVANCE MATCH]: Grid Up Arrow count (${gridAdvanceCount}) matches Advance badge (${advanceCount}).`)
        } else {
            console.log(`⚠️ [ADVANCE MISMATCH]: Grid Up Arrow count (${gridAdvanceCount}) vs Advance badge (${advanceCount}).`)
        }

        if (gridDeclineCount === declineCount) {
            console.log(`✅ [DECLINE MATCH]: Grid Down Arrow count (${gridDeclineCount}) matches Decline badge (${declineCount}).`)
        } else {
            console.log(`⚠️ [DECLINE MISMATCH]: Grid Down Arrow count (${gridDeclineCount}) vs Decline badge (${declineCount}).`)
        }

        // Return total grid count to compare with List View
        return totalGridCount
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
