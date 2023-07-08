const fs = require('fs')

module.exports = {
    getSheet(name) {
        const data = fs.readFileSync('res/latest.data.json', { encoding: 'utf8', flag: 'r' })
        const sheet = JSON.parse(data)["sheets"][name]

        return sheet
    },
    getData(name) {
        const data = fs.readFileSync('res/latest.data.json', { encoding: 'utf8', flag: 'r' })
        const sheet = JSON.parse(data)["data"][name]

        return sheet
    }
}