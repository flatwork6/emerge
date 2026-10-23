import commonLocators from './commonLocators.js';

const fundsLocators = {
    fundsTabIcon: 'android=new UiSelector().className("android.view.View").instance(6)',
    equityOrFno: '~Equity / FNO',
    commodity: '~Commodity',
    mtf: '~MTF',
    withdrawBtn: '~Withdraw',
    moveFundBtn: '~Move Fund',
    addFundsBtn: '~Add Funds',
    nseBseComTab: 'android=new UiSelector().descriptionStartsWith("NSE")',
    mtfNseBseTab: 'android=new UiSelector().descriptionStartsWith("MTF")',
    mtfTransferBtn: '~MTF Transfer',
    transferToMtfHeader: '~Transfer to MTF',
    expandAllBtn: '~Expand All',
    collapseAllBtn: '~Collapse All',
    mtfCancel: 'android=new UiSelector().descriptionContains("Cancel")',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in fundsLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default fundsLocators;
