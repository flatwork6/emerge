class SegmentGuard {
    constructor() {
        this.enabledSegments = new Set()
        // Mapping privilege sections to sub-segments
        this.segmentMapping = {
            'EQUITY CASH': ['NSE', 'BSE'],
            'DERIVATIVES': ['NFO', 'BFO'],
            'CURRENCY': ['CDS', 'BCD'],
            'COMMODITY': ['MCX'],
            'MTF': ['MTF']
        }
    }

    /**
     * Store active privileges & active segments in memory
     * @param {Array<string>} activePrivileges List of active category names (e.g. ['Equity Cash', 'Derivatives'])
     */
    setActivePrivileges(activePrivileges) {
        this.enabledSegments.clear()
        
        activePrivileges.forEach(privilege => {
            const normalized = privilege.trim().toUpperCase()
            if (this.segmentMapping[normalized]) {
                this.segmentMapping[normalized].forEach(seg => this.enabledSegments.add(seg))
            } else {
                // Directly add if individual segment name passed
                this.enabledSegments.add(normalized)
            }
        })

        console.log('Active Trading Segments Configured:', Array.from(this.enabledSegments))
    }

    /**
     * Check if a specific segment is active/enabled for the user
     * @param {string} segment Segment code (e.g. 'NSE', 'BSE', 'NFO', 'BFO', 'MTF', 'CDS', 'BCD', 'MCX')
     * @returns {boolean}
     */
    isSegmentEnabled(segment) {
        return this.enabledSegments.has(segment.trim().toUpperCase())
    }

    /**
     * Assert that the user is allowed to trade on a given segment before placing an order.
     * Throws an error if the segment is disabled.
     * @param {string} segment Segment code (e.g. 'NSE', 'NFO', 'MTF')
     * @param {string} symbol Symbol name for logging (e.g. 'RELIANCE')
     */
    assertCanPlaceOrder(segment, symbol = '') {
        const segUpper = segment.trim().toUpperCase()
        if (!this.isSegmentEnabled(segUpper)) {
            const errorMsg = `[SEGMENT RESTRICTION ERROR]: Trading is DISABLED on segment '${segUpper}' for this account. Cannot place order for symbol '${symbol}'. Enabled segments: [${Array.from(this.enabledSegments).join(', ')}]`
            console.error(errorMsg)
            throw new Error(errorMsg)
        }
        console.log(`[SEGMENT CHECK PASSED]: Order allowed on segment '${segUpper}' for symbol '${symbol}'.`)
        return true
    }
}

export default new SegmentGuard()
