import LoginPage from '../pageobjects/login.page.js'
import SetBiometric from '../pageobjects/biometric.js'


describe('Emerge Login', () => {

    it('should login successfully', async () => {

        // await LoginPage.securityWarning();

        // await LoginPage.getNotification();

        await LoginPage.clickUseAnotherAccount()

        await LoginPage.enterUserName("FZ51784")

        await LoginPage.enterPassword("QQQqqq1!")

        await LoginPage.enterTotp("2003")

        await LoginPage.clickLogin()
        await SetBiometric.userChoice.waitForDisplayed({
            timeout: 120000,
            timeoutMsg: 'Biometric screen did not appear within 2 minutes'
        })
        await SetBiometric.chooseUserChoice();
        console.log("Login button clicked")
    })

})