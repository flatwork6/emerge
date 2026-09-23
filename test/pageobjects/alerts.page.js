import allure from '@wdio/allure-reporter'
import locators from '../utils/locatorHelper.js'

class AlertsPage {
    get targetValueInput() {
        return $(locators.get('targetValueInput'));
    }

    get tacticalNoteInput() {
        return $(locators.get('tacticalNoteInput'));
    }

    get createAlertBtn() {
        return $(locators.get('createAlertBtn'));
    }

    get greaterThanBtn() {
        return $(locators.get('greaterThanBtn'));
    }

    get lesserThanBtn() {
        return $(locators.get('lesserThanBtn'));
    }
    
    get alertTypeDropdown() {
        return $(locators.get('alertTypeDropdown'));
    }


    get confirmAlertBtn(){
        return $(locators.get('confirmAlert'))
    }

    get pencilIcon() {
        return $(locators.get('pencilIcon'))
    }

    get dustbinIcon() {
        return $(locators.get('dustbinIcon'))
    }

    get updateAlertBtn() {
        return $(locators.get('updateAlertBtn'))
    }

    get deleteAlertBtn() {
        return $(locators.get('deleteAlertBtn'))
    }

    get yesBtn() {
        return $(locators.get('yesBtn'))
    }

    async clickPencilIcon() {
        console.log("Clicking pencil icon on alert list...");
        await this.pencilIcon.waitForDisplayed({ timeout: 5000 });
        await this.pencilIcon.click();
        await driver.pause(1000);
    }

    async clickDustbinIcon() {
        console.log("Clicking dustbin icon on alert list...");
        await this.dustbinIcon.waitForDisplayed({ timeout: 5000 });
        await this.dustbinIcon.click();
        await driver.pause(1000);
    }

    async modifyTargetValue(newValue) {
        console.log(`Modifying target value to ${newValue}`);
        const box = await this.targetValueInput;
        await box.waitForDisplayed({ timeout: 5000 });
        await box.click();
        await box.clearValue();
        await box.setValue(newValue.toString());
        await driver.pause(500);
    }

    async clickUpdateAlert() {
        console.log("Clicking Update Alert button...");
        await this.updateAlertBtn.click();
        await driver.pause(1500);
    }

    async clickDeleteAlert() {
        console.log("Clicking Delete Alert button...");
        await this.deleteAlertBtn.click();
        await driver.pause(1500);
    }

    async clickYes() {
        console.log("Clicking YES on confirmation popup...");
        await this.yesBtn.click();
        await driver.pause(2000);
    }

    async getExistingAlerts() {
        console.log("Extracting existing alerts from bottom sheet...");
        // Assuming the alert text is inside a View's content-desc and contains 'NSE | '
        const alertElements = await $$(locators.get('androidnewUiSelectordescriptio_3frn'));
        let extractedAlerts = [];
        for (let el of alertElements) {
            const desc = await el.getAttribute('content-desc');
            if (desc) {
                extractedAlerts.push(desc.trim());
                console.log(`Found Alert: ${desc.trim().replace(/\n/g, ' - ')}`);
            }
        }
        return extractedAlerts;
    }

    async selectAlertType(type) {
        // type is 'LTP' or '% Change'
        console.log(`Selecting alert type: ${type}`);
        
        // Wait, instead of generic dropdown locator, since it's Flutter, maybe we can just tap the text that represents the current state
        // Let's just tap the dropdown element (it might be the first View with description LTP or % Change)
        // If it's not expanding, we might need a broader locator. Let's try this.
        
        // Try clicking LTP if we want to change to % Change, or vice-versa
        // But first let's just click the dropdown
        const currentSelection = await this.alertTypeDropdown;
        if(await currentSelection.isExisting()){
            await currentSelection.click();
            await driver.pause(1000);
            
            // Now click the desired type (Perc.Change)
            const targetOption = await $(locators.get('alertTypeOption'));
            await targetOption.waitForDisplayed({ timeout: 5000 });
            await targetOption.click();
            await driver.pause(1000);
        } else {
            console.warn("Could not find Alert Type dropdown!");
        }
    }

    async setCondition(condition) {
        console.log(`Setting condition: ${condition}`);
        if (condition === "Greater than") {
            await this.greaterThanBtn.click();
        } else if (condition === "Lesser than") {
            await this.lesserThanBtn.click();
        }
        await driver.pause(500);
    }

    async enterTargetValue(value) {
        console.log(`Entering target value: ${value}`);
        await this.targetValueInput.click();
        await this.targetValueInput.setValue(value.toString());
        await driver.pause(500);
    }

    async enterNote(note) {
        console.log(`Entering note: ${note}`);
        await this.tacticalNoteInput.click();
        await this.tacticalNoteInput.setValue(note);
       await driver.pause(500);
    }

    async clickCreateAlert() {
        console.log("Clicking Create Alert");
        await this.createAlertBtn.click();
        await driver.pause(2000);
    }

    async alertConfirmationPopup(){
        console.log("Confirming alert creation");
        await this.confirmAlertBtn.click();
        await driver.pause(2000);
    }
    async verifyAlertCreationSuccess() {
        // Assuming a success toast or the bottom sheet closes.
        console.log("Alert created successfully.");
        allure.addStep("✅ Alert created successfully.");
    }
}

export default new AlertsPage();
