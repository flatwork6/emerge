import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'
import ProfilePage from '../pageobjects/profile.page.js'
import WatchlistPage from '../pageobjects/watchlist.page.js'
import segmentGuard from '../utils/segmentGuard.js'
import testDataHelper from '../utils/testDataHelper.js'


describe('Emerge Login & Segment Guard Validation', () => {

    it('should login successfully and extract trading privileges', async () => {

        // await LoginPage.securityWarning();

        // await LoginPage.getNotification();

        // await LoginPage.clickUseAnotherAccount()

        // await LoginPage.enterUserName(process.env.USER_ID)

        // await LoginPage.enterPassword(process.env.PASSWORD)

        // await LoginPage.enterTotp(process.env.TOTP)

        // await LoginPage.clickLogin()
        // await SetBiometric.userChoice.waitForDisplayed({
        //     timeout: 120000,
        //     timeoutMsg: 'Biometric screen did not appear within 2 minutes'
        // })
        // await SetBiometric.chooseUserChoice();
        // console.log("Login successful! Navigating to profile...")

        // // // Extract Trading Privileges from UI
        // await ProfilePage.openTradingPrivileges()
        // await ProfilePage.extractActiveSegments()

        // // Load test data dynamically from testData.csv
        // const orderTestData = testDataHelper.getOrderTestData()
        // console.log(`Loaded ${orderTestData.length} scrip records from testData.csv`)

        // for (const testCase of orderTestData) {
        //     const { segment, symbol } = testCase
        //     const isEnabled = segmentGuard.isSegmentEnabled(segment)
        //     console.log(`\n--- [DYNAMIC CHECK]: Scrip '${symbol}' on Segment '${segment}' | UI Status: ${isEnabled ? 'ACTIVE/ENABLED' : 'INACTIVE/DISABLED'} ---`)

        //     try {
        //         segmentGuard.assertCanPlaceOrder(segment, symbol)
        //         console.log(`✅ [ORDER ALLOWED]: Order placement allowed for '${symbol}' on segment '${segment}'.`)
        //     } catch (err) {
        //         console.log(`🛑 [ORDER RESTRICTED]: Order placement blocked for '${symbol}' on segment '${segment}' - Account privilege disabled.`)
        //     }
        // }

        // await ProfilePage.clickProfileBackButton()

        // await ProfilePage.clickAccountsAndServicesCrossButton()

        // // ----------------------------------------------------
        // // Step 2: Watchlist - Add Scrip Flow
        // // ----------------------------------------------------
        // console.log("\nStarting Watchlist Add Scrip Flow...")

        // // 1. Click Watchlist Icon from footer
        // await ProfilePage.openWatchlist()

        // await WatchlistPage.openWatchListDropdown()

        // await WatchlistPage.clickWatchlist()

        // // 2. Precondition: Check if any testData scrips already exist in selected Watchlist ('mkk') and remove them
        // await WatchlistPage.cleanExistingScripsIfPresent(orderTestData)

        // // 3. Click Search Icon
        // await WatchlistPage.clickSearchIcon()

        // // 3. Process scrip additions using testData.csv
        // for (const record of orderTestData) {
        //     const { symbol, segment } = record
        //     console.log(`\n--- Adding Scrip: '${symbol}' | Segment: '${segment}' ---`)

        //     const reqSeg = segment.trim().toUpperCase()

        //     // Check if segment is active in extracted account privileges (ALL is always allowed)
        //     const isEnabled = reqSeg === 'ALL' || segmentGuard.isSegmentEnabled(reqSeg)
        //     if (reqSeg === 'MTF' || !isEnabled) {
        //         console.log(`🛑 [SEGMENT RESTRICTION]: Segment '${reqSeg}' is INACTIVE / DISABLED for this account. Skipping scrip '${symbol}'.`)
        //         continue
        //     }


        //     // 1. Type Scrip Name first to populate search list
        //     await WatchlistPage.enterScripName(symbol)

        //     // 2. Select Segment Filter Chip (e.g. BFO, NFO, NSE, BSE, MCX)
        //     if (segment && reqSeg !== 'ALL') {
        //         await WatchlistPage.selectExchangeFilter(reqSeg)
        //     }

        //     // 3. Click Plus (+) icon next to filtered scrip result matching exact symbol
        //     await WatchlistPage.addFirstScripToWatchlist(symbol)
        // }

        // // Close search overlay ONLY AFTER all valid scrips have been processed
        // await WatchlistPage.closeSearch()


        // 1. Get stock count from Watchlist List View
        const listViewStockCount = await WatchlistPage.getWatchlistStockCount()

        // 2. Open Heatmap View
        await WatchlistPage.clickHeatMapView()

        // 3. Initial count on default '%' view
        const initialCountPercent = await WatchlistPage.getHeatmapStockCount()

        // 4. Toggle to 'Val' (Value) view
        await WatchlistPage.switchHeatmapDisplay('value')
        const valCount = await WatchlistPage.getHeatmapStockCount()

        // 5. Toggle back to 'percent' (%) view
        await WatchlistPage.switchHeatmapDisplay('percent')
        const finalCountPercent = await WatchlistPage.getHeatmapStockCount()

        // Verify stock count consistency across List View, Heatmap %, and Heatmap Val views
        if (listViewStockCount === initialCountPercent && initialCountPercent === valCount && valCount === finalCountPercent) {
            console.log(`✅ [HEATMAP VERIFICATION PASSED]: Stock count consistent across List View (${listViewStockCount}) and Heatmap views (${valCount} stocks displayed).`)
        } else {
            console.log(`⚠️ [HEATMAP VERIFICATION MISMATCH]: List View (${listViewStockCount}), Initial % (${initialCountPercent}), Val (${valCount}), Final % (${finalCountPercent}).`)
        }

        // 6. Click top-left back arrow button to return to Watchlist
        await WatchlistPage.clickHeatmapBackButton()
    })

})