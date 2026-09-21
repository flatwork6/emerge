import 'dotenv/config'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from creds.env
dotenv.config({ path: path.resolve(process.cwd(), 'creds.env') })
import WatchlistPage from '../pageobjects/watchlist.page.js'
import PortfolioPage from '../pageobjects/portfolio.page.js'



describe('Holdings Verification', () => {
  it('should extract holding and verify its quantity in watchlist', async () => {
    console.log(`\n========================================`)
    console.log(`Validating Holdings Symbol in Watchlist`)
    console.log(`========================================`)

    // Step 1: Navigate to Portfolio -> Holdings

    await PortfolioPage.openPortfolio();
    await PortfolioPage.openHoldings();

    // Step 2: Extract a holding
    const holding = await PortfolioPage.extractFirstHolding();
    if (holding === "No Holdings found") {
        console.log("No Holdings found. Ending test.");
        return;
    }
    console.log(`Extracted holding: ${holding.name}, ${holding.qty}`);

    // Step 3: Go back to Watchlist
    await WatchlistPage.clickWatchlistTab();


    // Step 5: Verify holdings symbol (blue bag) and quantity in Watchlist
await WatchlistPage.verifyHoldingSymbol(holding.name, holding.qty);
  });
})

describe('GTT Verification', () => {
  it('should extract GTT stock from Orders and verify GTT symbol in watchlist', async () => {
    console.log(`\n========================================`)
    console.log(`Validating GTT Symbol in Watchlist`)
    console.log(`========================================`)

    // Step 1: Navigate to Orders -> GTT
    const OrdersPage = require('../pageobjects/orders.page.js').default;
    await OrdersPage.openOrders();
    await OrdersPage.openGTT();

    // Step 2: Extract a GTT stock
    const gttStockName = await OrdersPage.extractFirstGTTStock();
    if (gttStockName === "No Gtt orders found") {
        console.log("No GTT orders found. Ending test.");
        return;
    }
    console.log(`Extracted GTT stock: ${gttStockName}`);

    // Step 3: Go back to Watchlist
    await WatchlistPage.clickWatchlistTab();

    // Step 4: Verify GTT symbol in Watchlist search results
    await WatchlistPage.verifyGTTSymbol(gttStockName);
  });
})

describe('Positions Verification', () => {
  it('should extract position stock from Portfolio and verify position symbol in watchlist', async () => {
    console.log(`\n========================================`)
    console.log(`Validating Positions Symbol in Watchlist`)
    console.log(`========================================`)

    // Step 1: Navigate to Portfolio -> Positions
    //const PortfolioPage = require('../pageobjects/portfolio.page.js').default;
    await PortfolioPage.openPortfolio('Positions');

    // Step 2: Extract a Positions stock
    const position = await PortfolioPage.extractFirstPosition();
    if (position === "No Positions found") {
        console.log("No Positions found. Ending test.");
        return;
    }
    console.log(`Extracted Position stock: ${position.name} with Qty: ${position.qty}`);

    // Step 3: Go back to Watchlist
    await WatchlistPage.clickWatchlistTab();

    // Step 4: Verify Positions symbol in Watchlist search results
    await WatchlistPage.verifyPositionSymbol(position.name, position.qty);
  });
})


describe('Alerts Verification', () => {
  it('should extract Alert stock from Orders and verify Alert symbol in watchlist', async () => {
    console.log(`\n========================================`)
    console.log(`Validating Alert Symbol in Watchlist`)
    console.log(`========================================`)

    // Step 1: Navigate to Orders -> Alerts
    const OrdersPage = require('../pageobjects/orders.page.js').default;
    await OrdersPage.openOrders();
    await OrdersPage.openAlerts();

    // Step 2: Extract an Alert stock
    const alertStockName = await OrdersPage.extractFirstAlertStock();
    console.log(`Extracted Alert stock: ${alertStockName}`);

    if (alertStockName === "No Alerts found") {
        console.log("No Alerts found. Ending test.");
        return;
    }

    // Step 3: Go back to Watchlist
    await WatchlistPage.clickWatchlistTab();

    // Step 4: Verify Alert symbol in Watchlist search results
    await WatchlistPage.verifyAlertSymbol(alertStockName);
  });
})


describe('SIP Verification', () => {
  it('should extract SIP stock from Orders and verify SIP symbol in watchlist', async () => {
    console.log(`\n========================================`)
    console.log(`Validating SIP Symbol in Watchlist`)
    console.log(`========================================`)

    // Step 1: Navigate to Orders -> SIP
    const OrdersPage = require('../pageobjects/orders.page.js').default;
    await OrdersPage.openOrders();
    await OrdersPage.openSIP();

    // Step 2: Extract a SIP stock
    const sipStockName = await OrdersPage.extractFirstSIPStock();
    console.log(`Extracted SIP stock: ${sipStockName}`);

    if (sipStockName === "No sips found") {
        console.log("No SIPs found. Ending test.");
        return;
    }

    // Step 3: Go back to Watchlist
    await WatchlistPage.clickWatchlistTab();

    // Step 4: Verify SIP symbol in Watchlist search results
    await WatchlistPage.verifySIPSymbol(sipStockName);
  });
})




