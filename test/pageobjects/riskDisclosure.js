import locators from '../utils/locatorHelper.js'

class RiskDisclosure {

    get acceptRiskDisclosureBtn() {
        return $(locators.get('acceptRiskDisclosureBtn'))
    }
    async acceptRiskDisclosureIfPresent() {
        try {
              await this.acceptRiskDisclosureBtn.waitForDisplayed({ timeout: 2000 });
            if (await this.acceptRiskDisclosureBtn.isDisplayed()) {
                await this.acceptRiskDisclosureBtn.click();
                console.log("Risk Disclosure accepted.");
            }
        } catch (error) {
            console.log("Risk Disclosure popup did not appear, skipping.");
        }
    }
}

export default new RiskDisclosure()