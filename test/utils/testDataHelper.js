import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

class TestDataLoader {
    constructor() {
        this.testDataPath = this.resolveTestDataPath()
    }

    resolveTestDataPath() {
        const candidatePaths = [
            path.resolve(process.cwd(), 'test/data/testData.csv'),
            path.resolve(process.cwd(), 'testData.csv')
        ]
        return candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0]
    }

    /**
     * Load order test data records from CSV file
     * @returns {Array<{segment: string, symbol: string, expectedStatus: string}>}
     */
    getOrderTestData() {
        const targetPath = this.resolveTestDataPath()
        if (!fs.existsSync(targetPath)) {
            console.warn(`Test data file not found at ${targetPath}`)
            return []
        }

        const fileContent = fs.readFileSync(targetPath, 'utf8')
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
        }).filter(r => r.symbol && r.symbol.trim() !== '')
    }

    /**
     * Load target watchlists to process from CSV or return defaults
     * @returns {Array<string>}
     */
    getWatchlists() {
        const targetPath = this.resolveTestDataPath()
        if (!fs.existsSync(targetPath)) {
            return ["Watchlist 1", "Watchlist 2", "Watchlist 3", "Watchlist 4", "Watchlist 5"]
        }

        try {
            const fileContent = fs.readFileSync(targetPath, 'utf8')
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

        return ["Watchlist 1", "Watchlist 2", "Watchlist 3", "Watchlist 4", "Watchlist 5"]
    }
}

export default new TestDataLoader()
