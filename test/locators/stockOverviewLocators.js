import commonLocators from './commonLocators.js';

const stockOverviewLocators = {
    overviewBookmarkIcon: '//android.view.View[@content-desc="NSE"]/preceding-sibling::android.view.View[3]',
    stockOverviewBackButton: 'android=new UiSelector().className("android.widget.Button").instance(0)',
    overviewBuyBtn: 'android=new UiSelector().description("BUY")',
    overviewSellBtn: 'android=new UiSelector().description("SELL")',
    overviewOptionChainIcon: 'android=new UiSelector().className("android.view.View").instance(6)',
    overviewAlertsIcon: 'android=new UiSelector().className("android.view.View").instance(8)',
    optionChainIcon: 'android=new UiSelector().className("android.view.View").instance(6)',
    alertsIcon: 'android=new UiSelector().className("android.view.View").instance(8)',
    optionChainHeader: 'android=new UiSelector().description("Option Chain")',
    optionChain1: 'android=new UiSelector().text("Option Chain")',
    scalperIcon: '~Scalper',
    strategyBuilderIcon: '~Strategy Builder',
    scalperCallHeaderDesc: 'android=new UiSelector().descriptionContains("Call")',
    scalperCallHeaderText: 'android=new UiSelector().textContains("Call")',
    scalperStockHeaderDesc: 'android=new UiSelector().descriptionContains("Stock")',
    scalperStockHeaderText: 'android=new UiSelector().textContains("Stock")',
    scalperPutHeaderDesc: 'android=new UiSelector().descriptionContains("Put")',
    scalperPutHeaderText: 'android=new UiSelector().textContains("Put")',
    strategyScripHeaderDesc: 'android=new UiSelector().descriptionContains("{value}")',
    strategyScripHeaderText: 'android=new UiSelector().textContains("{value}")',
    exchangeChipNSE: '~NSE',
    exchangeChipBSE: '~BSE',
    confirmAlert: '~CONFIRM',
    createAlertBtn: '~Create Alert',
    greaterThanBtn: 'android=new UiSelector().descriptionContains("Greater than")',
    lesserThanBtn: 'android=new UiSelector().descriptionContains("Lesser than")',
    alertTypeOption: '~Perc.Change',
    dustbinIcon: 'android=new UiSelector().className("android.view.View").instance(15)',
    updateAlertBtn: '~Update Alert',
    deleteAlertBtn: '~Delete Alert',
    yesBtn: '~YES',
    noBtn: '~NO',
    targetValueModifyBox: 'android=new UiSelector().text("{value}")',
    nSE: 'android=new UiSelector().descriptionContains("NSE | ")',
    ordersBottomTabDesc: 'android=new UiSelector().description("Orders")',
    ordersBottomTabIcon: 'android=new UiSelector().className("android.widget.ImageView").instance(5)',
    username: 'android=new UiSelector().className("android.widget.EditText").instance(0)',
    password: 'android=new UiSelector().className("android.widget.EditText").instance(1)',
    ltpSorting: '~LTP',
    marketWatchSettingsGear: 'android=new UiSelector().className("android.view.View").instance(14)',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in stockOverviewLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default stockOverviewLocators;
