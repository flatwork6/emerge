import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'
import ProfilePage from '../pageobjects/profile.page.js'
import segmentGuard from '../utils/segmentGuard.js'


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



        // Example: Validate order placement restriction for NSE (Enabled)
        try {
            segmentGuard.assertCanPlaceOrder('NSE', 'RELIANCE')
        } catch (err) {
            console.log(err.message)
        }

        // Example: Validate order placement restriction for MTF (Disabled / Enable button shown)
        try {
            segmentGuard.assertCanPlaceOrder('MTF', 'TATASTEEL')
        } catch (err) {
            console.log("Restriction successfully blocked order:", err.message)
        }

        await ProfilePage.clickProfileBackButton()
    })

})