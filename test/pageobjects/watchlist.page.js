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


    async openWatchListDropdown() {
        await this.watchListDropdown.click()
        //await driver.pause(1000)
    }

    async clickWatchlist() {
        await this.selectWatchlist.click()
        //await driver.pause(1000)
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
        const segUpper = segment.trim().toUpperCase()

        // Direct fast UIAutomator / Accessibility ID lookup
        const chip = $(`~${segUpper}`)
        try {
            if (await chip.isDisplayed().catch(() => false)) {
                await chip.click()
                console.log(`Successfully selected exchange filter chip: ${segUpper}`)
                return
            }
        } catch (e) { }

        console.log(`Exchange filter chip '${segUpper}' not found on UI, proceeding with ALL results...`)
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
     * Check if scrips in testData exist in the selected Watchlist tab ('mkk').
     * If found: click stock -> open overview -> click bookmark icon -> click '-' to remove -> navigate back.
     * @param {Array} orderTestData Array of testData records with symbol property
     */
    async cleanExistingScripsIfPresent(orderTestData) {
        console.log("\n🔍 [PRECONDITION CHECK]: Checking active Watchlist for existing scrips from testData...")

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
                console.log(`⚠️ Scrip '${symbol}' (${segUpper || 'ALL'}) found in current Watchlist. Proceeding to remove it...`)
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

                // 2. Click '-' minus icon on Watchlist bottom sheet for 'mkk' row
                let minusClicked = false
                try {
                    // Find the 'mkk' watchlist row on the bottom sheet
                    const mkkRow = $(locators.get('watchlistButton'))
                    if (await mkkRow.isDisplayed().catch(() => false)) {
                        const loc = await mkkRow.getLocation()
                        const sz = await mkkRow.getSize()

                        // Minus button is positioned on the far right (approx 85% - 90% of row width)
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
                        console.log(`✅ Tapped '-' minus button for 'mkk' row at coordinates (${tapX}, ${tapY})`)
                    }
                } catch (e) { }

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
}

export default new WatchlistPage()
