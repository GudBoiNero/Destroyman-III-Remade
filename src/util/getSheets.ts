import fs from 'fs'
import { DATA_PATH } from '../../config.json'

export function getSheet(name: string): any {
    const data = fs.readFileSync(DATA_PATH, { encoding: 'utf8', flag: 'r' })
    const sheet = JSON.parse(data)["sheets"][name]

    return sheet
}

export function getData(name: string): any {
    const data = fs.readFileSync(DATA_PATH, { encoding: 'utf8', flag: 'r' })
    const sheet = JSON.parse(data)["data"][name]

    return sheet
}
