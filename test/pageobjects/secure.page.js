import locators from '../locators/commonLocators.js'
const { $ } = require('@wdio/globals')
const Page = require('./page');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class SecurePage extends Page {
    /**
     * define selectors using getter methods
     */
    get flashAlert () {
        return $(locators.get("locatorGen"));
    }
}

module.exports = new SecurePage();
