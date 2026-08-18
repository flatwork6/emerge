import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })

import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'


describe('Emerge Login', () => {

    it('should login successfully', async () => {

        // await LoginPage.securityWarning();

        // await LoginPage.getNotification();

        await LoginPage.clickUseAnotherAccount()

        await LoginPage.enterUserName(process.env.USER_ID)

        await LoginPage.enterPassword(process.env.PASSWORD)

        await LoginPage.enterTotp(process.env.TOTP)

        await LoginPage.clickLogin()
        await SetBiometric.userChoice.waitForDisplayed({
            timeout: 120000,
            timeoutMsg: 'Biometric screen did not appear within 2 minutes'
        })
        await SetBiometric.chooseUserChoice();
        console.log("Login button clicked")
    })

})