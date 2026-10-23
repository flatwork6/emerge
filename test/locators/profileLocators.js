import commonLocators from './commonLocators.js';

const profileLocators = {
    profileMenuBtn: 'android=new UiSelector().className("android.view.View").instance(8)',
    profileRow: 'android=new UiSelector().description("Profile\nVerified account and banking")',
    tradingPrevilegesHeader: '~Trading Privileges',
    profileBackButton: '~Back',
    accountsAndServicesCrossButton: 'android=new UiSelector().className("android.view.View").instance(5)',
    accLOGOUT: '~LOGOUT',
    accLogout: '~Logout',
    watchlistFooterIcon: 'android=new UiSelector().className("android.widget.ImageView").instance(3)',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in profileLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default profileLocators;
