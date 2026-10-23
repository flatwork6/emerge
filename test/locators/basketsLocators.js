import commonLocators from './commonLocators.js';

const basketsLocators = {
    basketsTab: '~Basket',
    basketsSearchIcon: 'android=new UiSelector().className("android.view.View").instance(23)',
    searchInputField: 'android=new UiSelector().className("android.widget.EditText")',
    basketsAvailableMargin: '//android.view.View[contains(@content-desc, "AVAILABLE MARGIN") or contains(@text, "AVAILABLE MARGIN") or contains(@content-desc, "Available Margin") or contains(@text, "Available Margin")]',
    basketsHeaderCount: '//android.view.View[contains(@content-desc, "Baskets")]',
    noBasketsFound: '//android.view.View[contains(@content-desc, "No Baskets found") or contains(@text, "No Baskets found")]',
    createBasketModalTitle: '//android.view.View[@content-desc="Create New Basket"]',
    basketNameInput: '//android.widget.EditText',
    createBasketButton: '//android.widget.Button[@content-desc="Create"]',
    basketNameCounter: '//android.widget.EditText/android.view.View',
    basketScrip: 'android=new UiSelector().descriptionStartsWith("INFY-EQ")',
    basketQtyRow: '//android.view.View[contains(@content-desc, "Qty: ")]',
    basketAddOrdersBtn: '~Add Orders',
    basketAddBtnUpper: '~ADD',
    basketInfyScrip: '//android.view.View[contains(@content-desc, "INFY")]',
    basketDuplicateIcon: '~Duplicate',
    basketModifyIcon: '~Modify',
    basketDeleteIcon: '~Delete',
    basketInfyEqNse: '//android.view.View[contains(@content-desc, "INFY-EQ") and contains(@content-desc, "NSE")]',
    basketModifyBtnUpper: '~MODIFY',
    basketMustBeBetweenError: '//*[contains(@content-desc, "Must be between") or contains(@text, "Must be between")]',
    basketYesBtn: '~Yes',
    basketTriggerError: '//*[contains(@content-desc, "Trigger should be lower than limit") or contains(@text, "Trigger should be lower than limit")]',
    basketViewAny: '//android.view.View',
    basketNiftyScrip: '//android.view.View[contains(@content-desc, "NIFTY")]',
    basketHeaderCountFallback: '//*[contains(@content-desc, "Baskets") or contains(@text, "Baskets")]',
    basketQtyRowFallback: '//android.view.View[contains(@content-desc, "Qty") or contains(@text, "Qty")]',
    basketPositionDetailsCollapsed: '~Position Details, Collapsed',
    basketPositionDetails: '//*[contains(@content-desc, "Position Details")]',
    basketIncludeExistingMargin: '//*[contains(@content-desc, "Include existing margin") or contains(@text, "Include existing margin")]',
    basketExecuteBtn: '~EXECUTE',
    basketConfirmBtn: '~Confirm',
    basketOrderConfirmation: '//*[contains(@content-desc, "execute") or contains(@text, "execute") or contains(@content-desc, "Order Confirmation")]',
    basketOrderStatus: '//*[contains(@content-desc, "REJECTED") or contains(@text, "REJECTED") or contains(@content-desc, "COMPLETED") or contains(@text, "COMPLETED") or contains(@content-desc, "FAILED") or contains(@text, "FAILED")]',
    basketResetBtn: '~RESET',
    basketOrderFinalStatus: '//*[contains(@content-desc, "REJECTED") or contains(@text, "REJECTED") or contains(@content-desc, "COMPLETED") or contains(@text, "COMPLETED") or contains(@content-desc, "FAILED") or contains(@text, "FAILED")  ]',
    basketUpdateBtn: '~Update',
    basketAlreadyPresentError: '//*[contains(@content-desc, "already present") or contains(@text, "already present") or contains(@content-desc, "already exists") or contains(@text, "exists")]',
    basketSpecialCharError: '//*[contains(@content-desc, "Special characters") or contains(@text, "Special characters") or contains(@content-desc, "Invalid")]',
    basketCheckbox1: 'android=new UiSelector().className("android.widget.CheckBox").instance(1)',
    basketCheckbox2: 'android=new UiSelector().className("android.widget.CheckBox").instance(2)',
    basketCheckbox3: 'android=new UiSelector().className("android.widget.CheckBox").instance(3)',
    basketDelete3Btn: '~Delete (3)',
    basketDeleteSurePopup: '//*[contains(@content-desc, "sure") or contains(@text, "sure")]',
    basketSelectAllCheckbox: 'android=new UiSelector().className("android.widget.CheckBox").instance(0)',
    basketDeleteDynamicBtn: '//*[contains(@content-desc, "Delete") or contains(@text, "Delete")]',
    basketDownloadCsvBtn: 'android=new UiSelector().className("android.view.View").instance(24)',
    basketShareSheet: '//*[contains(@text, "Share") or contains(@content-desc, "Share") or contains(@text, ".csv") or contains(@content-desc, ".csv") or contains(@text, "file") or contains(@content-desc, "file") or contains(@text, "Nearby") or contains(@content-desc, "Nearby")]',
    basketQtyStrict: '//*[contains(@content-desc, "Qty:") or contains(@text, "Qty:")]',
    basketMax20Snackbar: '//*[contains(@content-desc, "maximum of 20") or contains(@text, "maximum of 20") or contains(@text, "Basket can contain")]',
    basketAnyExchangeScrip: '//*[contains(@content-desc, "NSE") or contains(@text, "NSE") or contains(@content-desc, "BSE") or contains(@text, "BSE") or contains(@content-desc, "EQ") or contains(@text, "EQ") or contains(@content-desc, "NFO") or contains(@text, "NFO") or contains(@content-desc, "Qty") or contains(@text, "Qty")]',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in basketsLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default basketsLocators;
