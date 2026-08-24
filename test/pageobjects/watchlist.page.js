import locators from '../utils/locatorHelper.js'

class WatchlistPage {

    // Search Icon & Input
    get searchIcon() {
        return $(locators.get('searchIcon'))
    }

    get searchInputField() {
        return $(locators.get('searchInputField'))
    }

    // Add / Plus icon for the first scrip result
    get addScripPlusIcon() {
        return $(locators.get('addScripBookmarkIcon'))
    }


    /**
     * Click search icon to open search input field
     */
    async clickSearchIcon() {
        await this.searchIcon.waitForDisplayed({ timeout: 10000 })
        await this.searchIcon.click()
        await driver.pause(1000)
    }

    /**
     * Type scrip name into search bar
     * @param {string} scripSymbol Scrip symbol from testData.csv (e.g. 'RELIANCE', 'TCS')
     */
    async enterScripName(scripSymbol) {
        let inputField = this.searchInputField
        await inputField.waitForDisplayed({ timeout: 10000 })
        await inputField.click()
        await inputField.clearValue().catch(() => { })
        await inputField.setValue(scripSymbol)
        await driver.pause(1000)
    }

    /**
     * Select exchange filter chip dynamically (e.g. 'NSE', 'BSE', 'NFO', 'MCX')
     * @param {string} segment Segment code (e.g. 'NSE', 'BSE', 'NFO')
     */
    async selectExchangeFilter(segment) {
        const segUpper = segment.trim().toUpperCase()

        // Multi-strategy selector for exchange chips (Accessibility ID, text, content-desc)
        const chipLocators = [
            `~${segUpper}`,
            `//*[@content-desc='${segUpper}' or @text='${segUpper}']`,
            `android=new UiSelector().description("${segUpper}")`,
            `android=new UiSelector().text("${segUpper}")`
        ]

        for (const loc of chipLocators) {
            const chip = $(loc)
            if (await chip.isDisplayed().catch(() => false)) {
                await chip.click()
                await driver.pause(1000)
                console.log(`Successfully selected exchange filter chip: ${segUpper}`)
                return
            }
        }

        console.log(`Exchange filter chip '${segUpper}' not found on UI, proceeding with ALL results...`)
    }

    /**
     * Click on the plus (+)/add icon next to the first scrip in search results
     */
    async addFirstScripToWatchlist() {
        await driver.pause(2000)

        // 1. Try scanning for any clickable ImageView element rendered on far right (x > 700, y between 300 and 1200)
        try {
            const icons = await $$('//android.widget.ImageView')
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
        } catch (e) {}

        // 2. Far-Right Coordinate Tap (94% X) guaranteed to hit + icon instead of scrip row
        const windowSize = await driver.getWindowSize()
        const tapX = Math.floor(windowSize.width * 0.94) // Far right edge for '+' icon
        
        let tapY = Math.floor(windowSize.height * 0.28)
        try {
            const topCard = await $('android=new UiSelector().className("android.view.View").instance(28)')
            if (await topCard.isDisplayed().catch(() => false)) {
                const loc = await topCard.getLocation()
                const sz = await topCard.getSize()
                tapY = Math.floor(loc.y + sz.height / 2)
            }
        } catch (e) {}

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
        } catch (e) {}

        // Fallback to back button press if specific button locator fails
        try {
            await driver.back()
            await driver.pause(1000)
            console.log('Closed search overlay using driver.back()')
        } catch (e) {}
    }
}

export default new WatchlistPage()
