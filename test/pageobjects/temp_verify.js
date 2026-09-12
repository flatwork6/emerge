class HoldingsQtyVerify{
    async verifyHoldingSymbol(stockName, quantity) {
        console.log(`Verifying holdings symbol for ${stockName} with qty ${quantity}...`);
        await this.pullDownToRefresh();
        const stocks = await this.getWatchlistStockDetails();

        const holdingStock = stocks.find(s => s.name === stockName);
        if (!holdingStock) {
            throw new Error(`Stock ${stockName} not found in the watchlist after adding!`);
        }

        console.log(`Found stock in watchlist. Desc: ${JSON.stringify(holdingStock.desc)}`);

        // The description might look like "GATECH-BE\nNSE   10" where the bag icon is between NSE and 10.
        // Or it might be "NSE 💼 10". We check if the quantity is present in the description string.
        const qtyStr = quantity.toString();
        
        if (!holdingStock.desc.includes(qtyStr)) {
            throw new Error(`Holding quantity ${qtyStr} is NOT visible in the stock description for ${stockName}! Actual desc: ${JSON.stringify(holdingStock.desc)}`);
        }
        
        console.log(`✅ [TC VERIFIED]: Holding symbol/quantity ${quantity} is visible next to segment for ${stockName}`);
    }
}