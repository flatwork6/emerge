import locators from '../utils/locatorHelper.js'

class SetBiometric {
    get userChoice() {
        return $(locators.get('biometricUserChoice'))
    }


    async chooseUserChoice() {
        try {
            await this.userChoice.waitForDisplayed({ timeout: 15000 })
            await this.userChoice.click()
            await driver.pause(2000) // wait for popup to dismiss
        } catch (error) {
            console.log("Biometric prompt did not appear within timeout, continuing.")
        }
    }
}

export default new SetBiometric()