import commonLocators from './commonLocators.js';
import loginLocators from './loginLocators.js';
import profileLocators from './profileLocators.js';
import marketwatchLocators from './marketwatchLocators.js';
import stockOverviewLocators from './stockOverviewLocators.js';
import fundsLocators from './fundsLocators.js';
import holdingsLocators from './holdingsLocators.js';
import orderBookLocators from './orderBookLocators.js';
import basketsLocators from './basketsLocators.js';
import tradeBookLocators from './tradeBookLocators.js';

export {
    commonLocators,
    loginLocators,
    profileLocators,
    marketwatchLocators,
    stockOverviewLocators,
    fundsLocators,
    holdingsLocators,
    orderBookLocators,
    basketsLocators,
    tradeBookLocators
};

const allLocators = {
    ...commonLocators,
    ...loginLocators,
    ...profileLocators,
    ...marketwatchLocators,
    ...stockOverviewLocators,
    ...fundsLocators,
    ...holdingsLocators,
    ...orderBookLocators,
    ...basketsLocators,
    ...tradeBookLocators,

    get(key, ...args) {
        let locator = this[key];
        if (!locator) {
            throw new Error(`Locator key "${key}" not found in locators`);
        }
        args.forEach((arg, index) => {
            locator = locator.replace(`{${index}}`, arg);
        });
        return locator;
    }
};

export default allLocators;
