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

        return records
    }
}

export default new TestDataLoader()
