class LoginPage {

    get useAnotherAccountBtn(){
        return $('~Use Another Account')
    }
    get username() {
        return $('android=new UiSelector().className("android.widget.EditText").instance(0)')
    }
    get password() {
        return $('android=new UiSelector().className("android.widget.EditText").instance(1)')
    }

    get totpOrOtp() {
        return $('android=new UiSelector().className("android.widget.EditText").instance(2)')
    }
    get loginButton() {
        return $('~LOGIN')
    }
    get getOtp() {
        return $('~Get OTP')
    }
    get forgotPassword() {
        return $('Forgot Password?')
    }
    get openAccount() {
        return $('Open account')
    }

    async clickUseAnotherAccount(){
        await this.useAnotherAccountBtn.click()
    }
    async securityWarning() {
        const continueBtn = await $('android=new UiSelector().description("Continue Anyway")');
        await continueBtn.click();
    }

    async getNotification() {
        const allowButton = await $('android=new UiSelector().text("Allow")');
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