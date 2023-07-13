import fs from 'fs'
import { DATA_PATH } from '../../config.json'
import { ExtraData } from './fetchData'

export function getSheet(name: string): any {
    const data = fs.readFileSync(DATA_PATH, { encoding: 'utf8', flag: 'r' })
    const sheet = JSON.parse(data)["sheets"][name]

    return sheet
}

export function getExtraData(): ExtraData {
    const data = fs.readFileSync(DATA_PATH, { encoding: 'utf8', flag: 'r' })
    return JSON.parse(data)["data"] as ExtraData
}
