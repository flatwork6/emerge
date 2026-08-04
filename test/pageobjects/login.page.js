class LoginPage {

    // get username() {
    //     return $('YOUR_USERNAME_LOCATOR')
    // }
    get password() {
        return $('android=new UiSelector().className("android.widget.EditText").instance(0)')
    }

    get totpOrOtp() {
        return $('android=new UiSelector().className("android.widget.EditText").instance(1)')
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