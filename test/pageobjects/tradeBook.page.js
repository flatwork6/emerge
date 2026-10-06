import locators from '../utils/locatorHelper.js'

class TradeBookPage {
    get tradeBookTab() { return $('~Tradebook'); }
    get tradeBookTabFallback() { return $('//*[contains(@content-desc, "Tradebook")]'); }
    
   async openTradeBook() {
           console.log("Navigating to Tradebook tab...");
           // Wait for bottom tabs to render
           try {
               await driver.waitUntil(async () => {
                   const el = await $(locators.get("watchlistFooterIcon"));
                   return await el.isExisting();
               }, { timeout: 10000 });
           } catch (e) { console.log("Bottom tabs wait timed out, continuing..."); }
   
           const ordersTab = await $(locators.get('ordersTab'));
           if (await ordersTab.isExisting()) {
               await ordersTab.click();
               await driver.pause(1000);
           }
   
           let tradebookExists = await this.tradeBookTab.isExisting();
           if (!tradebookExists) {
               console.log("Tradebook tab not found. Iterating through bottom tabs...");
               for (let i = 5; i >= 0; i--) {
                   const icon = await $(`android=new UiSelector().className("android.widget.ImageView").instance(${i})`);
                   if (await icon.isExisting()) {
                       await icon.click();
                       await driver.pause(1000);
                       if (await this.tradeBookTab.isExisting()) {
                           console.log(`Found Orders tab at instance ${i}`);
                           tradebookExists = true;
                           break;
                       }
                   }
               }
           }
   
           if (!tradebookExists) {
               throw new Error("Could not navigate to Orders tab!");
           }
   
           await this.tradeBookTab.waitForDisplayed({ timeout: 10000 });
           await this.tradeBookTab.click();
           await driver.pause(2000);
       }
}

export default new TradeBookPage();
