import commonLocators from './commonLocators.js';

const holdingsLocators = {
    portfolioTabIcon: '~Portfolio',
    watchlistFooterIcon: 'android=new UiSelector().className("android.widget.ImageView").instance(3)',
    holdingsTab: 'android=new UiSelector().descriptionContains("Holdings")',
    portfolioStockRows: 'android=new UiSelector().descriptionContains("Qty")',
    holdingsToggle: '~Show holdings',
    gttTab: '~GTT',
    gttToggle: '~Show GTT',
    positionsTab: 'android=new UiSelector().descriptionContains("Positions")',
    positionsToggle: '~Show Position',
    sipTab: '~SIP',
    sipStockRows: 'android=new UiSelector().descriptionContains("Instalments")',
    viewSipBtn: '~View',
    sipScripRows: 'android=new UiSelector().descriptionContains("Qty:")',
    showSipToggle: '~Show SIP',
    alertsTab: '~Alerts',
    alertStockRows: 'android=new UiSelector().descriptionContains("Pending").or(new UiSelector().descriptionContains("Triggered"))',
    showAlertsToggle: '~Show Alerts',
    holdingsNoHoldingsFoundRegex: 'android=new UiSelector().textMatches("(?i).*No Holdings Found.*").or(new UiSelector().descriptionMatches("(?i).*No Holdings Found.*"))',
    holdingsPortfolioEmptyRegex: 'android=new UiSelector().textMatches("(?i).*Your Portfolio is currently empty.*").or(new UiSelector().descriptionMatches("(?i).*Your Portfolio is currently empty.*"))',
    holdingsNoMatchingFoundDesc: 'android=new UiSelector().description("No matching holdings found")',
    holdingsPortfolioValueDesc: 'android=new UiSelector().descriptionContains("Portfolio Value")',
    holdingsEyeIconInstance: 'android=new UiSelector().className("android.view.View").instance(11)',
    holdingsHiddenValueDesc: 'android=new UiSelector().descriptionContains("••••••")',
    holdingsHiddenValueText: 'android=new UiSelector().textContains("••••••")',
    holdingsInvestedDesc: 'android=new UiSelector().descriptionContains("Invested")',
    holdingsViewMoreBtn: '~View More',
    holdingsAllItemsRegex: 'android=new UiSelector().className("android.view.View").descriptionMatches(".*")',
    holdingsCurTabDesc: 'android=new UiSelector().descriptionContains("Cur value")',
    holdingsInvTabDesc: 'android=new UiSelector().descriptionContains("Inv value")',
    holdingsDownloadCsvBtn: '~Download holdings as CSV',
    holdingsCsvText: 'android=new UiSelector().textContains(".csv")',
    holdingsFilterIconInstance: 'android=new UiSelector().className("android.view.View").instance(14)',
    holdingsProfitFilter: '~Profit',
    holdingsApplyFilterBtn: '~Apply',
    holdingsLossFilter: '~Loss',
    holdingsAllFilter: '~All',
    holdingsDynamicFilterOpt: '~{0}',
    holdingsResetFilterBtn: '~Reset',
    holdingsVerifyBtn: '~Verify',
    holdingsAuthorizeBtn: '~AUTHORIZE',
    holdingsDynamicScripText: 'android=new UiSelector().textContains("{0}")',
    holdingsCloseBtn: '~CLOSE',
    holdingsGttTab: '~GTT',
    holdingsMarketDepthTab: '~Market Depth',
    holdingsMarketDepthDesc: 'android=new UiSelector().descriptionContains("Market depth")',
    holdingsPricePerformanceDesc: 'android=new UiSelector().descriptionContains("Price performance")',
    holdingsZeroValueField: 'android=new UiSelector().text("0")',
    holdingsDynamicSegmentText: 'android=new UiSelector().text("{0}")',
    holdingsDynamicSegmentDesc: 'android=new UiSelector().description("{0}")',
    holdingsCreateGttBtn: '~CREATE GTT',
    holdingsDynamicGttRowDesc: 'android=new UiSelector().descriptionContains("{0}")',
    holdingsOverviewTab1: '~Overview',
    holdingsOverviewTab2: 'android=new UiSelector().description("Overview")',
    holdingsTechnicalsTab1: '~Technicals',
    holdingsTechnicalsTab2: 'android=new UiSelector().description("Technicals")',
    holdingsOptionChainRegex1: 'android=new UiSelector().descriptionMatches("(?i)Option Chain")',
    holdingsOptionChainRegex2: 'android=new UiSelector().descriptionMatches("(?i)Option chain")',
    holdingsExitBtn1: '~EXIT',
    holdingsExitBtn2: 'android=new UiSelector().text("EXIT")',
    holdingsVerifyEdisDesc: 'android=new UiSelector().description("VERIFY EDIS")',
    holdingsVerifyEdisText: 'android=new UiSelector().text("VERIFY EDIS")',
    holdingsSellDesc: 'android=new UiSelector().description("SELL")',
    holdingsSellText: 'android=new UiSelector().text("SELL")',
    holdingsSellDescContains: 'android=new UiSelector().descriptionContains("SELL")',
    holdingsSellTextContains: 'android=new UiSelector().textContains("SELL")',
    holdingsAddBtn1: '~ADD',
    holdingsAddBtn2: 'android=new UiSelector().text("ADD")',
    nopositionsavailable: 'android=new UiSelector().textContains("No positions available")',
    startYourInvestment: 'android=new UiSelector().textContains("Start Your Investment")',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in holdingsLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default holdingsLocators;
