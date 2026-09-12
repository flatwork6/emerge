const descs = [
  "NIFTY 15SEP 20250 PE\nNFO\n 0.05\n 0.00  (0.00%)",
  "SENSEX\nBSE\n76377.33\n1595.57 (2.13%)",
  "EASEMYTRIP-EQ\nNSE\n14\n 5.83\n 0.00  (0.00%)",
  "EASEMYTRIP-EQ\nNSE\n 5.83\n 0.00  (0.00%)"
];

for (const desc of descs) {
    const parts = desc.split(/\n|,/).map(s => s.trim()).filter(s => s !== "");
    const name = parts[0];
    
    const pctIndex = parts.findIndex(p => p.includes('%'));
    let ltpRaw = "0";
    if (pctIndex > 0) {
        ltpRaw = parts[pctIndex - 1];
    } else {
        // Fallback if no percent part is found
        ltpRaw = parts.find(p => {
            const clean = p.replace(/,/g, '').trim();
            return clean !== "" && !isNaN(Number(clean)) && !p.includes('%');
        }) || "0";
    }
    
    const ltp = Number(ltpRaw.replace(/,/g, '').trim());
    console.log(`${name} -> LTP: ${ltp}`);
}
