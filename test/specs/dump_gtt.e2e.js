const WatchlistPage = require('../pageobjects/watchlist.page.js').default || require('../pageobjects/watchlist.page.js');
const OrdersPage = require('../pageobjects/orders.page.js').default;
const fs = require('fs');

// describe('Dump Search Results GTT', () => {
//     it('should dump search results with GTT toggled', async () => {
//         await OrdersPage.openOrders();
//         await OrdersPage.openGTT();
//         const gttStockName = await OrdersPage.extractFirstGTTStock();
        
//         const icon = await $(`~Watchlist`);
//         await icon.waitForDisplayed({ timeout: 5000 });
//         await icon.click();
        
//         const dumpAndSearch = async (filename) => {
//             await WatchlistPage.clickSearchIcon();
//             await WatchlistPage.enterScripName(gttStockName);
//             await WatchlistPage.selectExchangeFilter('ALL');
//             await driver.pause(3000);
            
//             const pageSource = await driver.getPageSource();
//             fs.writeFileSync(filename, pageSource);
//             console.log(`DUMPED PAGE SOURCE TO ${filename}`);
//             await WatchlistPage.closeSearch();
//         };

//         await dumpAndSearch('search_gtt_initial.xml');

//         console.log(`Toggling GTT...`);
//         await WatchlistPage.openMarketWatchSettings();
//         try {
//             await driver.performActions([{
//                 type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' },
//                 actions: [
//                     { type: 'pointerMove', duration: 0, x: 500, y: 1500 },
//                     { type: 'pointerDown', button: 0 },
//                     { type: 'pointerMove', duration: 400, x: 500, y: 500 },
//                     { type: 'pointerUp', button: 0 }
//                 ]
//             }]);
//             await driver.pause(1000);
//         } catch (e) { }

//         await WatchlistPage.gttToggle.waitForDisplayed({ timeout: 5000 });
//         await WatchlistPage.gttToggle.click();
//         await driver.pause(1000);
//         await WatchlistPage.closeMarketWatchSettings();

//         await dumpAndSearch('search_gtt_toggled.xml');
//     });
// });
