import locators from '../utils/locatorHelper.js'

class SetBiometric {
    get userChoice() {
        return $(locators.get('biometricUserChoice'))
    }


    async chooseUserChoice() {
        //await this.userChoice.waitForDisplayed({ timeout: 1200000 })
        await this.userChoice.click()
    }
}

export default new SetBiometric()