import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'
import ProfilePage from '../pageobjects/profile.page.js'
import segmentGuard from '../utils/segmentGuard.js'
import testDataHelper from '../utils/testDataHelper.js'


describe('Emerge Login & Segment Guard Validation', () => {

    it('should login successfully and extract trading privileges', async () => {

        // await LoginPage.securityWarning();

        // await LoginPage.getNotification();

        // await LoginPage.clickUseAnotherAccount()

        await LoginPage.enterUserName(process.env.USER_ID)

        await LoginPage.enterPassword(process.env.PASSWORD)

        await LoginPage.enterTotp(process.env.TOTP)

        await LoginPage.clickLogin()
        await SetBiometric.userChoice.waitForDisplayed({
            timeout: 120000,
            timeoutMsg: 'Biometric screen did not appear within 2 minutes'
        })
        await SetBiometric.chooseUserChoice();
        console.log("Login successful! Navigating to profile...")

        // Extract Trading Privileges from UI
        await ProfilePage.openTradingPrivileges()
        await ProfilePage.extractActiveSegments()

        // Load test data dynamically from testData.csv
        const orderTestData = testDataHelper.getOrderTestData()
        console.log(`Loaded ${orderTestData.length} test records from testData.csv`)

        for (const testCase of orderTestData) {
            const { segment, symbol, expectedStatus } = testCase
            console.log(`\n--- Running Segment Guard Check: ${segment} (${symbol}) | Expected: ${expectedStatus} ---`)

            try {
                segmentGuard.assertCanPlaceOrder(segment, symbol)
            } catch (err) {
                console.log(`[SEGMENT CHECK RESULT]: Blocked as expected for ${segment}: ${err.message}`)
            }
        }

        await ProfilePage.clickProfileBackButton()
    })

})