import commonLocators from './commonLocators.js';

const marketwatchLocators = {
    watchlistFooterIcon: 'android=new UiSelector().className("android.widget.ImageView").instance(3)',
    watchlistTabIcon: 'android=new UiSelector().className("android.widget.ImageView").instance(3)',
    searchIcon: 'android=new UiSelector().className("android.view.View").instance(13)',
    searchInputField: 'android=new UiSelector().className("android.widget.EditText")',
    searchCloseButton: 'android=new UiSelector().className("android.widget.Button").instance(1)',
    searchResultPlusIcons: '//android.widget.ImageView',
    searchResultTopCard: '//*[contains(@content-desc, "EQ") or contains(@content-desc, "NSE") or contains(@content-desc, "BSE")]',
    searchResultTcsEq: '//*[contains(@content-desc, "TCS-EQ")]',
    searchResultGatech: '//*[contains(@content-desc, "GATECH")]',
    exchangeChipAll: '~ALL',
    exchangeChipNSE: '~NSE',
    exchangeChipBSE: '~BSE',
    exchangeChipNFO: '~NFO',
    exchangeChipBFO: '~BFO',
    exchangeChipMCX: '~MCX',
    exchangeChipBCD: '~BCD',
    exchangeChipCDS: '~CDS',
    addScripBookmarkIcon: 'android=new UiSelector().className("android.view.View").instance(29)',
    deleteScripIcon: 'android=new UiSelector().descriptionContains("Delete")',
    watchlistTab1: '~Watchlist 3',
    watchlistTab2: '~fivee',
    watchlistTab3: '~mkk',
    watchlistTab4: '~one',
    watchlistTab5: '~onehy',
    indexTab: '~Index',
    watchListDropdown: 'android=new UiSelector().descriptionMatches("(?s).*[0-9]+/[0-9]+.*")',
    watchlistButton: 'android=new UiSelector().descriptionContains("mkk")',
    watchlistRemoveMinusBtn: 'android=new UiSelector().description("-")',
    stockOverviewBackButton: 'android=new UiSelector().className("android.widget.Button").instance(0)',
    scripBySymbol: 'android=new UiSelector().descriptionContains("{symbol}")',
    scripBySymbolAndSegment: 'android=new UiSelector().descriptionContains("{symbol}").descriptionContains("{segment}")',
    openHeatMapView: '~Open heatmap view',
    valueToggle: 'android=new UiSelector().descriptionContains("Val")',
    percentToggle: 'android=new UiSelector().descriptionContains("%")',
    watchlistDropdownByName: 'android=new UiSelector().descriptionStartsWith("{name}")',
    indexSubDropdown: 'android=new UiSelector().descriptionContains("SENSEX").or(new UiSelector().descriptionContains("NIFTY"))',
    watchlistRowByName: 'android=new UiSelector().descriptionContains("{name}")',
    watchlistStockRows: 'android=new UiSelector().descriptionMatches(".*(NSE|BSE|CDS|MCX|NFO|BFO|EQ|FUT).* Archive|.*(NSE|BSE|CDS|MCX|NFO|BFO|EQ|FUT).*")',
    heatmapGridStockTiles: 'android=new UiSelector().descriptionMatches(".*(↑|↓|\\+|up|down).*")',
    advanceBadge: 'android=new UiSelector().descriptionContains("Advance")',
    declineBadge: 'android=new UiSelector().descriptionContains("Decline")',
    marketWatchSettingsGear: 'android=new UiSelector().className("android.view.View").instance(14)',
    marketWatchSettingsCloseBtn: '~CLOSE',
    alphabeticalSorting: '~A-Z',
    percentSorting: '~%',
    ltpSorting: '~LTP',
    exchangeSorting: '~EXH',
    openPriceRadioBtn: '~Open price',
    closePriceRadioBtn: '~Close price',
    percentageFormatRadioBtn: '~Percentage',
    absoluteFormatRadioBtn: '~Absolute',
    absoluteAndPercentageFormatRadioBtn: '~Absolute & percentage',
    showDirectionToggle: '~Show direction',
    holdingsToggle: '~Show holdings',
    pinToFav1: 'android=new UiSelector().descriptionContains("Pin to Favorite 1")',
    pinToFav2: 'android=new UiSelector().descriptionContains("Pin to Favorite 2")',
    nifty50: 'android=new UiSelector().descriptionContains("Nifty 50")',
    alreadypresent: '//*[contains(@content-desc, "already in") or contains(@text, "already in")]',

    get(key, ...args) {
        let locator = this[key] || commonLocators[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in marketwatchLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default marketwatchLocators;
