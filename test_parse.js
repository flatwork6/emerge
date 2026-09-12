const tests = [
    ["3M INDIA", "NSE", "24,000.50", "1.5%"],
    ["RELIANCE", "NSE", "2,500.50", "1.5%"],
    ["NIFTY 50", "NSE", "24,000.50", "1.5%"],
    ["5PAISA", "BSE", "500.00", "-0.5%"]
];

for (const parts of tests) {
    const oldLtpRaw = parts.find(p => !isNaN(parseFloat(p.replace(/,/g, ''))) && !p.includes('%')) || "0";
    const oldLtp = parseFloat(oldLtpRaw.replace(/,/g, ''));
    
    const newLtpRaw = parts.find(p => {
        const clean = p.replace(/,/g, '').trim();
        return clean !== "" && !isNaN(Number(clean)) && !p.includes('%');
    }) || "0";
    const newLtp = Number(newLtpRaw.replace(/,/g, '').trim());
    
    console.log(`Original: ${parts.join(', ')}`);
    console.log(`Old LTP: ${oldLtp}`);
    console.log(`New LTP: ${newLtp}`);
    console.log('---');
}
