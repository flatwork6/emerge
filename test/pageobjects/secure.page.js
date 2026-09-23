import locators from '../utils/locatorHelper.js'
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
        return $(locators.get('flash_5s9g'));
    }
}

module.exports = new SecurePage();
