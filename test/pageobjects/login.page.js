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
  
    get acceptRiskDisclosureBtn() {
        return $(locators.get('acceptRiskDisclosureBtn'))
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
        let fields = await $$(locators.get('androidnewUiSelectorclassNamea_m44z'));
        let userField = fields.length > 0 ? fields[0] : this.username;
        await userField.waitForDisplayed({ timeout: 10000 })
        await userField.click()
        await userField.setValue(username)
    }
    
    async enterPassword(password) {
        let fields = await $$(locators.get('androidnewUiSelectorclassNamea_jmrw'));
        // If there are 3 fields, password is index 1. If 2 fields, it's index 0.
        let passField = fields.length === 2 ? fields[0] : (fields.length >= 3 ? fields[1] : this.password);
        await passField.waitForDisplayed({ timeout: 10000 })
        await passField.click()
        await passField.setValue(password)
    }

    async enterTotp(totp) {
        let fields = await $$(locators.get('androidnewUiSelectorclassNamea_4xzo'));
        // If there are 3 fields, TOTP is index 2. If 2 fields, it's index 1.
        let totpField = fields.length === 2 ? fields[1] : (fields.length >= 3 ? fields[2] : this.totpOrOtp);
        await totpField.waitForDisplayed({ timeout: 10000 })
        await totpField.click()
        await totpField.setValue(totp)
    }
    async clickLogin() {
        await this.loginButton.click()
    }

  

}

export default new LoginPage()