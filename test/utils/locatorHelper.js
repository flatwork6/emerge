import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

class LocatorLoader {
    constructor() {
        this.locators = {}
        this.loadLocators()
    }

    loadLocators() {
        const filePath = path.resolve(process.cwd(), 'locator.csv')
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8')
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            })
            records.forEach(record => {
                if (record.key && record.value) {
                    this.locators[record.key] = record.value
                }
            })
        } else {
            console.error(`Locator CSV file not found at: ${filePath}`)
        }
    }

    get(key) {
        if (!this.locators[key]) {
            throw new Error(`Locator key "${key}" not found in locator.csv`)
        }
        return this.locators[key]
    }
}

export default new LocatorLoader()
