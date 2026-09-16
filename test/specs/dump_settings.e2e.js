const WatchlistPage = require('../pageobjects/watchlist.page.js').default || require('../pageobjects/watchlist.page.js');
const fs = require('fs');

describe('Dump Settings', () => {
    it('should dump market watch settings', async () => {
        const icon = await $(`~Watchlist`);
        await icon.waitForDisplayed({ timeout: 5000 });
        await icon.click();
        
       // await WatchlistPage.openMarketWatchSettings();
        await driver.pause(2000);
        const pageSource = await driver.getPageSource();
        fs.writeFileSync('settings_dump.xml', pageSource);
        console.log("DUMPED PAGE SOURCE");
    });
});
