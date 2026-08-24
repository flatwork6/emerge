import locators from '../utils/locatorHelper.js'
import segmentGuard from '../utils/segmentGuard.js'

class ProfilePage {

    get profileMenu() {
        return $(locators.get('profileMenuBtn'))
    }

    get profileBar() {
        return $(locators.get('profileRow'))
    }

    get profileBackButton() {
        return $(locators.get('profileBackButton'))
    }

    get accountsAndServicesCrossButton() {
        return $(locators.get('accountsAndServicesCrossButton'))
    }


    // Footer Navigation
    get clickWatchlistFooterIcon() {
        return $(locators.get('watchlistFooterIcon'))
    }


    /**
     * Navigate to Profile -> Trading Privileges screen from Dashboard
     */
    async openTradingPrivileges() {
        await this.profileMenu.click()
        await this.profileBar.click()
    }

    /**
     * Helper gesture to perform a single scroll down to bring Trading Privileges into view
     */
    async scrollDownScreen() {
        const windowSize = await driver.getWindowSize()
        const startX = Math.floor(windowSize.width / 2)
        const startY = Math.floor(windowSize.height * 0.65) // middle-bottom
        const endY = Math.floor(windowSize.height * 0.35)   // middle-top

        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: startX, y: startY },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerMove', duration: 500, x: startX, y: endY },
                { type: 'pointerUp', button: 0 }
            ]
        }])
        await driver.pause(1000)
    }

    /**
     * Scrape all trading privileges cards from the UI and populate active segments in segmentGuard
     */
    async extractActiveSegments() {
        console.log('Extracting Trading Privileges from UI...')

        // Single scroll down to bring Trading Privileges into view
        await this.scrollDownScreen()

        const activeSegments = []

        // Single scan of visible elements on screen
        const allElements = await $$('//*[@text or @content-desc]')


        console.log("*****************************************************************")
        console.log("Total Elements :" + allElements)
        console.log("*****************************************************************")

        let currentPrivilege = null
        for (const el of allElements) {
            const text = ((await el.getText()) || (await el.getAttribute('content-desc')) || '').trim()

            //console.log(text)
            if (['Equity Cash', 'Derivatives', 'Currency', 'Commodity', 'MTF'].includes(text)) {
                currentPrivilege = text
            }

            // console.log(currentPrivilege)

            if (text === 'Active' && currentPrivilege) {
                if (!activeSegments.includes(currentPrivilege)) {
                    activeSegments.push(currentPrivilege)
                }
                currentPrivilege = null
            } else if (text === 'Enable' && currentPrivilege) {
                console.log(`Privilege '${currentPrivilege}' is INACTIVE/DISABLED.`)
                currentPrivilege = null
            }
        }
        //console.log('Active Trading Privileges Extracted:', activeSegments)
        segmentGuard.setActivePrivileges(activeSegments)
        return activeSegments
    }

    async clickProfileBackButton() {
        await this.profileBackButton.click();
    }

    async clickAccountsAndServicesCrossButton() {
        await this.accountsAndServicesCrossButton.click();
    }


    /**
     * Open Watchlist screen by clicking footer icon
     */
    async openWatchlist() {
        //   await this.clickWatchlistFooterIcon.waitForDisplayed({ timeout: 10000 })
        await this.clickWatchlistFooterIcon.click()
        await driver.pause(1000)
    }

}

export default new ProfilePage()
