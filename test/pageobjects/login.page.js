import locators from '../utils/locatorHelper.js'

class LoginPage {

    get useAnotherAccountBtn(){
        return $(locators.get('useAnotherAccountBtn'))
    }
    get username() {
        return $(locators.get('username'))
    }
    get password() {
        return $(locators.get('password'))
    }

    get totpOrOtp() {
        return $(locators.get('totpOrOtp'))
    }
    get loginButton() {
        return $(locators.get('loginButton'))
    }
    get getOtp() {
        return $(locators.get('getOtp'))
    }
    get forgotPassword() {
        return $(locators.get('forgotPassword'))
    }
    get openAccount() {
        return $(locators.get('openAccount'))
    }

    async clickUseAnotherAccount(){
        await this.useAnotherAccountBtn.click()
    }
    async securityWarning() {
        const continueBtn = await $(locators.get('continueBtn'));
        await continueBtn.click();
    }

    async getNotification() {
        const allowButton = await $(locators.get('allowButton'));
        await allowButton.click();
    }

    async enterUserName(username) {
        await this.username.waitForDisplayed({ timeout: 10000 })
        await this.username.click()
        await this.username.setValue(username)
    }
    async enterPassword(password) {
        await this.password.waitForDisplayed({ timeout: 10000 })
        await this.password.click()
        await this.password.setValue(password)
    }

    async enterTotp(totp) {
        await this.totpOrOtp.waitForDisplayed({ timeout: 10000 })
        await this.totpOrOtp.click()
        await this.totpOrOtp.setValue(totp)
    }
    async clickLogin() {
        await this.loginButton.click()
    }


}

export default new LoginPage()