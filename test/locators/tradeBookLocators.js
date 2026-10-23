import commonLocators from './commonLocators.js';

const tradeBookLocators = {
    tradeBookTab: '~Tradebook',
    tradeBookTabFallback: '//*[contains(@content-desc, "Tradebook") or contains(@content-desc, "Tradebook")]',
    watchlistFooterIcon: 'android=new UiSelector().className("android.widget.ImageView").instance(3)',
    ordersTab: 'android=new UiSelector().className("android.widget.ImageView").instance(4)',
    tradeBookHeading: '//*[starts-with(@content-desc, "Trades") or starts-with(@content-desc, "Trades")]',
    tradeBookNoMatch: '//*[contains(@content-desc, "No matching trades found") or contains(@text, "No matching trades found")]',
    tradeBookSearchIcon: 'android=new UiSelector().className("android.view.View").instance(21)',
    tradeBookTradeRow: '//android.view.View[contains(@content-desc, "Qty:")]',
    tradeBookNoTradesMsg: '//*[contains(@content-desc, "No trades found") or contains(@text, "No trades found") or contains(@content-desc, "No Trades found") or contains(@text, "No Trades found")]',
    tradeBookFallbackIcon: 'android=new UiSelector().className("android.widget.ImageView").instance(0)',
    tradeBookDynamicStockRow: '//android.view.View[contains(@content-desc, "{0}")]',
    tradeBookInfoOpt: '~Info',
    tradeBookChartOpt: '~Chart',
    tradeBookCreateAlertOpt: '~Create Alert',
    tradeBookTechnicalsOpt: '~Technicals',
    tradeBookScripInfoHeader: '//*[contains(@content-desc, "Fundamentals") or contains(@content-desc, "Market Depth") or contains(@content-desc, "Scrip info")]',
    tradeBookBackBtn: '~Back',
    tradeBookOverviewHeader: '//*[contains(@content-desc, "Overview") or contains(@content-desc, "Chart")]',
    tradeBookAlertTargetInput: 'android=new UiSelector().className("android.widget.EditText").instance(0)',
    tradeBookCreateAlertBtn: '//*[contains(@content-desc, "Create Alert")]',
    tradeBookAlertsTab: '~Alerts',
    tradeBookDynamicAlertItem: '//*[contains(@content-desc, "{0}") and contains(@content-desc, "80")]',
    tradeBookTechnicalsHeader: '//*[contains(@content-desc, "Technicals")]',
    tradeBookDownloadCsvIcon: 'android=new UiSelector().className("android.view.View").instance(22)',
    tradeBookCsvDialog: '//*[contains(@content-desc, ".csv") or contains(@text, ".csv") or contains(@content-desc, "downloaded")]',
    tradeBookAllContentDescElements: '//*[@content-desc]',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in tradeBookLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default tradeBookLocators;
