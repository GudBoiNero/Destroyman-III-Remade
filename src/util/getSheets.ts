import fs from 'fs'

export function getSheet(name: string): any {
    const data = fs.readFileSync('res/latest.data.json', { encoding: 'utf8', flag: 'r' })
    const sheet = JSON.parse(data)["sheets"][name]

    return sheet
}

export function getData(name: string): any {
    const data = fs.readFileSync('res/latest.data.json', { encoding: 'utf8', flag: 'r' })
    const sheet = JSON.parse(data)["data"][name]

    return sheet
}
