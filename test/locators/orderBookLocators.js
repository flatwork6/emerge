import commonLocators from './commonLocators.js';

const orderBookLocators = {
    orderBuyButton: '~BUY',
    orderSellButton: '~SELL',
    orderDeliveryTab: '~Delivery',
    orderIntradayTab: 'android=new UiSelector().descriptionContains("Intraday")',
    orderMktOption: '~MKT',
    orderLmtOption: '~LMT',
    orderConfirmBuyButton: 'android=new UiSelector().description("BUY")',
    orderConfirmSellButton: 'android=new UiSelector().description("SELL")',
    orderSnackbar: 'android=new UiSelector().descriptionContains("Order")',
    ordersTab: 'android=new UiSelector().className("android.widget.ImageView").instance(4)',
    overviewBuyBtn: 'android=new UiSelector().description("BUY")',
    overviewSellBtn: 'android=new UiSelector().description("SELL")',
    orderBookEntryDynamic: '//*[contains(@content-desc, "{stockName}")]',
    watchlistTabFromOrders: 'android=new UiSelector().className("android.widget.ImageView").instance(2)',
    orderBookSearchIcon: 'android=new UiSelector().className("android.view.View").instance(19)',
    orderBookSearchBar: 'android=new UiSelector().className("android.view.View").instance(19)',
    orderBookActualSearchInput: 'android.widget.EditText',
    orderBookTcsEqResult: '//*[contains(@content-desc, "TCS-EQ")]',
    orderBookCrossBtn: 'android.widget.Button',
    orderBookNoMatch: '//*[contains(@content-desc, "No matching orders found") or contains(@text, "No matching orders found")]',
    orderBookCloseSearchIcon: 'android=new UiSelector().className("android.view.View").instance(20)',
    orderBookDownloadCsvIcon: 'android=new UiSelector().className("android.view.View").instance(20)',
    orderBookCsvName: '//*[contains(@text, "executed_orders_") and contains(@text, ".csv")] | //*[contains(@content-desc, "executed_orders_") and contains(@content-desc, ".csv")]',
    orderBookFilterIcon: 'android=new UiSelector().className("android.view.View").instance(21)',
    orderBookFilterIconNoMatch: 'android=new UiSelector().className("android.view.View").instance(22)',
    orderBookOpenOrders: '//*[contains(@content-desc, "OPEN")]',
    orderBookCancelBtn: '~Cancel',
    orderBookNoBtn: '~NO',
    orderBookYesBtn: '~YES',
    orderBookSaveBtn: '~SAVE',
    orderBookBackBtn: '~Back',
    orderBookMarketDepthBtn: '~Market Depth',
    orderBookViewChartBtn: '~View Chart',
    orderBookRepeatOrderBtn: '~Repeat Order',
    orderBookModifyBtn: '~Modify',
    orderBookSlLmtBtn: '~SL-LMT',
    orderBookQtyPlusBtn: 'android=new UiSelector().className("android.view.View").instance(20)',
    orderBookPricePlusBtn: 'android=new UiSelector().className("android.view.View").instance(25)',
    orderBookConfirmModifyBtn: '~MODIFY',
    orderBookYesModifyBtn: '~Yes',
    orderBookPendingOrdersHeader: '//*[contains(@content-desc, "Pending Orders") or contains(@text, "Pending Orders")]',
    orderBookCompletedOrders: '//*[contains(@content-desc, "COMPLETED") or contains(@content-desc, "REJECTED") or contains(@content-desc, "CANCELLED")]',
    orderBookFilterDynamicBtn: '~{0}',
    orderBookFilterDynamicBtnFallback: '//*[contains(@content-desc, "{0}") or contains(@text, "{0}")]',
    orderBookSaveBtnFallback: '//*[contains(@content-desc, "SAVE") or contains(@text, "SAVE")]',
    orderBookMarketDepthTitleDynamic: '//*[contains(@content-desc, "{0}") or contains(@text, "{0}")]',
    orderBookMarketDepthText: '//*[contains(@content-desc, "Market depth") or contains(@text, "Market depth")]',
    orderBookBottomSheetHeaderDynamic: '//*[contains(@content-desc, "{0}")]',
    orderBookDynamicResult: '//*[contains(@content-desc, "{0}")]',
    orderBookDynamicOrdersAfterCancel: '//android.view.View[contains(@content-desc, "{0}")]',
    orderBookAllContentDescElements: '//*[@content-desc]',
    orderBookFilledQtyLabel: '//*[contains(@content-desc, "Filled Qty")]',
    orderBookLimitIssues: '//*[contains(@content-desc, "Must be between") or contains(@text, "Must be between") or contains(@content-desc, "between") or contains(@text, "between")]',
    orderBookPriceInputInstance1: 'android=new UiSelector().className("android.widget.EditText").instance(1)',
    gttTab: '~GTT',
    sipTab: '~SIP',
    alertsTab: '~Alerts',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in orderBookLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default orderBookLocators;
