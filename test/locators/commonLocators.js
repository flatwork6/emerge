const commonLocators = {
    view: 'android=new UiSelector().className("android.view.View")',
    textView: 'android=new UiSelector().className("android.widget.TextView")',
    dynamicText: 'android=new UiSelector().textContains("{0}")',
    dynamicDesc: 'android=new UiSelector().descriptionContains("{0}")',
    anyElement: '//*',
    imageViewInst0: 'android=new UiSelector().className("android.widget.ImageView").instance({0})',
    anyTextOrDescElement: '//*[@text or @content-desc]',
    locatorGen: '#flash',
    locatorGen1: '//*[@content-desc != ""]',
    imageViewInst2: 'android=new UiSelector().className("android.widget.ImageView").instance(2)',
    locatorGen2: '//*[(contains(@content-desc, "Save") or contains(@text, "Save") or contains(@content-desc, "SAVE") or contains(@text, "SAVE")) and not(contains(@text, "Ordering")) and not(contains(@content-desc, "Ordering"))]',
    locatorGen3: 'android=new UiSelector().descriptionMatches(".*(NSE|BSE|CDS|MCX|NFO|BFO|EQ|FUT).*")',
    locatorGen4: 'android=new UiScrollable(new UiSelector().className("android.widget.HorizontalScrollView")).setAsHorizontalList().scrollIntoView(new UiSelector().description("{0}"))',
    locatorGen5: '~{0}',
    locatorGen6: 'android=new UiSelector().description("{0}")',
    locatorGen7: 'android=new UiSelector().descriptionStartsWith("Index")',
    locatorGen8: '//*[contains(@content-desc, "already in") or contains(@text, "already in")]',

    get(key, ...args) {
        let locator = this[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in commonLocators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default commonLocators;
