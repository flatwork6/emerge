import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import allure from '@wdio/allure-reporter'
import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'
import ProfilePage from '../pageobjects/profile.page.js'
import WatchlistPage from '../pageobjects/watchlist.page.js'
import segmentGuard from '../utils/segmentGuard.js'
import testDataHelper from '../utils/testDataHelper.js'


// describe('Emerge Login & Segment Guard Validation', () => {

//     it('should login successfully', async () => {

//         // await LoginPage.securityWarning();

//         // await LoginPage.getNotification();

//         // await LoginPage.clickUseAnotherAccount()

//         await LoginPage.enterUserName(process.env.USER_ID)

//         await LoginPage.enterPassword(process.env.PASSWORD)

//         await LoginPage.enterTotp(process.env.TOTP)

//         await LoginPage.clickLogin()
//         await SetBiometric.userChoice.waitForDisplayed({
//             timeout: 120000,
//             timeoutMsg: 'Biometric screen did not appear within 2 minutes'
//         })
//         await SetBiometric.chooseUserChoice();
//         console.log("Login successful! Navigating to profile...")

//     })
// })

describe('Trading previliges validation', () => {
    it('should extract trading previliges successfully', async () => {
        // Extract Trading Privileges from UI
        await ProfilePage.openTradingPrivileges()
        await ProfilePage.extractActiveSegments()

        // Load test data dynamically from testData.csv
        const orderTestData = testDataHelper.getOrderTestData()
        console.log(`Loaded ${orderTestData.length} scrip records from testData.csv`)

        for (const testCase of orderTestData) {
            const { segment, symbol } = testCase
            const isEnabled = segmentGuard.isSegmentEnabled(segment)
            const logMsg = `[DYNAMIC CHECK]: Scrip '${symbol}' on Segment '${segment}' | UI Status: ${isEnabled ? 'ACTIVE/ENABLED' : 'INACTIVE/DISABLED'}`
            console.log(`\n--- ${logMsg} ---`)

            try {
                segmentGuard.assertCanPlaceOrder(segment, symbol)
                const allowedMsg = `✅ [ORDER ALLOWED]: Order placement allowed for '${symbol}' on segment '${segment}'.`
                console.log(allowedMsg)
                allure.addStep(allowedMsg)
            } catch (err) {
                const restrictedMsg = `🛑 [ORDER RESTRICTED]: Order placement blocked for '${symbol}' on segment '${segment}' - Account privilege disabled.`
                console.log(restrictedMsg)
                allure.addStep(restrictedMsg)
            }
        }

        await ProfilePage.clickProfileBackButton()

        await ProfilePage.clickAccountsAndServicesCrossButton()

    })
})

describe('Should open watchlist, search and add scrips and remove if it is already present', () => {
    it('should search, add, remove stocks successfully across all watchlists', async () => {
        const orderTestData = testDataHelper.getOrderTestData()

        console.log("\nStarting Watchlist Add Scrip Flow for all watchlists...")

        // 1. Click Watchlist Icon from footer
        await ProfilePage.openWatchlist()

        const watchlists = ["Watchlist 3", "fivee", "mkk", "one", "onehy"]

        // Process standard watchlists sequentially
        for (let i = 0; i < watchlists.length; i++) {
            const wlName = watchlists[i]
            console.log(`\n========================================`)
            console.log(`Processing Watchlist ${i + 1}/${watchlists.length}: '${wlName}'`)
            console.log(`========================================`)

            // For 1st watchlist, no need to open dropdown (already selected by default).
            // For 2nd, 3rd, 4th, 5th watchlists, open dropdown using previous watchlist name and select target watchlist.
            if (i > 0) {
                const prevWlName = watchlists[i - 1]
                await WatchlistPage.openWatchListDropdown(prevWlName)
                await WatchlistPage.clickWatchlistByName(wlName)
            }

            // Clean existing scrips if present
            await WatchlistPage.cleanExistingScripsIfPresent(orderTestData, wlName)

            // Open search
            await WatchlistPage.clickSearchIcon()

            // Process scrip additions using testData.csv
            for (const record of orderTestData) {
                const { symbol, segment } = record
                console.log(`\n--- Adding Scrip: '${symbol}' | Segment: '${segment}' ---`)

                const reqSeg = segment.trim().toUpperCase()

                // Check if segment is active in extracted account privileges
                const isEnabled = reqSeg === 'ALL' || segmentGuard.isSegmentEnabled(reqSeg)
                if (reqSeg === 'MTF' || !isEnabled) {
                    const skipMsg = `🛑 [SEGMENT RESTRICTION]: Segment '${reqSeg}' is INACTIVE / DISABLED for this account. Skipping scrip '${symbol}'.`
                    console.log(skipMsg)
                    allure.addStep(skipMsg)
                    continue
                }

                // Type Scrip Name
                await WatchlistPage.enterScripName(symbol)

                // Select Segment Filter Chip (e.g. 'ALL', 'NSE', 'BSE', 'NFO', 'BFO', 'CDS', 'BCD', 'MCX')
                await WatchlistPage.selectExchangeFilter(reqSeg)

                // Add scrip
                await WatchlistPage.addFirstScripToWatchlist(symbol)
            }

            // Close search overlay after processing current watchlist scrips
            await WatchlistPage.closeSearch()

            // Perform Heatmap verification for current Watchlist
            console.log(`\n--- Running Heatmap Verification for Watchlist: '${wlName}' ---`)
            const listCount = await WatchlistPage.getWatchlistStockCount()
            await WatchlistPage.clickHeatMapView()
            const initPercent = await WatchlistPage.getHeatmapStockCount()
            await WatchlistPage.switchHeatmapDisplay('value')
            const valCount = await WatchlistPage.getHeatmapStockCount()
            await WatchlistPage.switchHeatmapDisplay('percent')
            const finalPercent = await WatchlistPage.getHeatmapStockCount()

            const hlSummary = `Watchlist '${wlName}' | List View Count: ${listCount} | Heatmap %: ${initPercent} | Heatmap Val: ${valCount}`
            console.log(hlSummary)
            allure.addStep(hlSummary)
            await WatchlistPage.clickHeatmapBackButton()
        }

        // Ensure search overlay is closed before opening Index watchlist dropdown
        await WatchlistPage.closeSearch()

        // Process Index watchlist (open dropdown using last active watchlist name, select Index, scroll and close)
        console.log(`\n========================================`)
        console.log(`Processing Index Watchlist`)
        console.log(`========================================`)
        const lastWlName = watchlists[watchlists.length - 1]
        await WatchlistPage.openWatchListDropdown(lastWlName)
        await WatchlistPage.clickWatchlistByName('Index')
        await WatchlistPage.scrollIndexWatchlist()

        // Heatmap verification for Index tab
        console.log(`\n--- Running Heatmap Verification for 'Index' Tab ---`)
        const indexListCount = await WatchlistPage.getWatchlistStockCount()
        await WatchlistPage.clickHeatMapView()
        const indexInitPercent = await WatchlistPage.getHeatmapStockCount()
        await WatchlistPage.switchHeatmapDisplay('value')
        const indexValCount = await WatchlistPage.getHeatmapStockCount()
        await WatchlistPage.switchHeatmapDisplay('percent')
        const indexFinalPercent = await WatchlistPage.getHeatmapStockCount()

        const indexHlSummary = `Watchlist 'Index' | List View Count: ${indexListCount} | Heatmap %: ${indexInitPercent} | Heatmap Val: ${indexValCount}`
        console.log(indexHlSummary)
        allure.addStep(indexHlSummary)
        await WatchlistPage.clickHeatmapBackButton()

        // Return back to 1st watchlist and close dropdown
        console.log(`\n========================================`)
        console.log(`Returning to 1st Watchlist '${watchlists[0]}' & Closing Dropdown`)
        console.log(`========================================`)
        await WatchlistPage.openWatchListDropdown('Index')
        await WatchlistPage.clickWatchlistByName(watchlists[0])
    })
})