import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

class TestDataLoader {
    constructor() {
        this.testDataPath = path.resolve(process.cwd(), 'testData.csv')
    }

    /**
     * Load order test data records from CSV file
     * @returns {Array<{segment: string, symbol: string, expectedStatus: string}>}
     */
    getOrderTestData() {
        if (!fs.existsSync(this.testDataPath)) {
            console.warn(`Test data file not found at ${this.testDataPath}`)
            return []
        }

        const fileContent = fs.readFileSync(this.testDataPath, 'utf8')
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            comment: '#',
            trim: true
        })

        // Normalize object keys to handle any casing (e.g. SYMBOL, SCRIP, SEGMENT)
        return records.map(record => {
            const normalized = {}
            for (const key of Object.keys(record)) {
                normalized[key.trim().toUpperCase()] = record[key]
                normalized[key.trim().toLowerCase()] = record[key]
            }
            return {
                symbol: normalized.SYMBOL || normalized.symbol || normalized.SCRIP || normalized.scrip,
                segment: normalized.SEGMENT || normalized.segment,
                resultIndex: normalized.RESULTINDEX || normalized.resultindex || normalized.INDEX || normalized.index || '0'
            }
        })
    }

    /**
     * Load target watchlists to process from CSV or return defaults
     * @returns {Array<string>}
     */
    getWatchlists() {
        if (!fs.existsSync(this.testDataPath)) {
            return ["Watchlist 3", "fivee", "mkk", "one", "onehy"]
        }

        try {
            const fileContent = fs.readFileSync(this.testDataPath, 'utf8')
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                comment: '#',
                trim: true
            })

            const watchlists = []
            for (const record of records) {
                const wl = record.WATCHLIST || record.watchlist || record.WATCHLIST_NAME || record.watchlist_name
                if (wl && wl.trim()) {
                    watchlists.push(wl.trim())
                }
            }

            if (watchlists.length > 0) {
                return [...new Set(watchlists)]
            }
        } catch (e) { }

        return ["Watchlist 3", "fivee", "mkk", "one", "onehy"]
    }
}

export default new TestDataLoader()
