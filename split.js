const fs = require('fs');
const lines = fs.readFileSync('test/specs/flow.e2e.js', 'utf8').split('\n');

const imports = lines.slice(0, 24).join('\n'); // Up to line 23

// Find boundaries
const b = {};
b.loginStart = lines.findIndex(l => l.includes("describe('Emerge Login & Segment Guard Validation'"));
b.tradingPriv = lines.findIndex(l => l.includes("describe('Trading previliges validation'"));
b.watchlistAdd = lines.findIndex(l => l.includes("describe('Should open watchlist, search and add scrips"));
b.watchlistDrag = lines.findIndex(l => l.includes("describe('Watchlist Drag and Drop Validation'"));
b.marketWatchSettings = lines.findIndex(l => l.includes("describe('Market Watch Settings Validation'"));
b.watchlistPin = lines.findIndex(l => l.includes("describe('Watchlist Pinning Validation'"));
b.optionChain = lines.findIndex(l => l.includes("describe('Option Chain Verification'"));
b.alertsVerify = lines.findIndex(l => l.includes("describe('Alerts Verification'")); // The first one
b.nseBse = lines.findIndex(l => l.includes("describe('Marketwatch NSE/BSE Toggle Verification'"));
b.scalper = lines.findIndex(l => l.includes("describe('Scalper & Strategy Builder Verification'"));
b.holdings = lines.findIndex(l => l.includes("describe('Holdings Verification'"));
b.gtt = lines.findIndex(l => l.includes("describe('GTT Verification'"));
b.positions = lines.findIndex(l => l.includes("describe('Positions Verification'"));
b.alertsOrders = lines.findIndex((l, i) => i > b.alertsVerify && l.includes("describe('Alerts Verification'"));
b.sip = lines.findIndex(l => l.includes("describe('SIP Verification'"));
b.editWatchlist = lines.findIndex(l => l.includes("describe('Edit Watchlist Validation'"));
b.funds = lines.findIndex(l => l.includes("describe('Funds and Margin Validation'"));

// We need the end of each block. Usually it's the start of the next block.
// But some might have blank lines.

function getBlock(start, end) {
    if (end === undefined || end === -1) end = lines.length;
    return lines.slice(start, end).join('\n');
}

// 1. login.e2e.js
const loginContent = imports + '\n' + getBlock(b.loginStart, b.watchlistAdd);
fs.writeFileSync('test/specs/login.e2e.js', loginContent);

// 2. marketwatch.e2e.js
const mwContent = imports + '\n' + getBlock(b.watchlistAdd, b.optionChain) + '\n' + getBlock(b.editWatchlist, b.funds);
fs.writeFileSync('test/specs/marketwatch.e2e.js', mwContent);

// 3. stockOverview.e2e.js
const overviewContent = imports + '\n' + getBlock(b.optionChain, b.holdings);
fs.writeFileSync('test/specs/stockOverview.e2e.js', overviewContent);

// 4. fundsAndMargins.e2e.js
const fundsContent = imports + '\n' + getBlock(b.funds, lines.length);
fs.writeFileSync('test/specs/fundsAndMargins.e2e.js', fundsContent);

// 5. flow.e2e.js (leftover: Holdings, GTT, Positions, OrdersAlerts, SIP)
const leftoverContent = imports + '\n' + getBlock(b.holdings, b.editWatchlist);
fs.writeFileSync('test/specs/flow.e2e.js', leftoverContent);

console.log("Split successfully!");
