import fetch from 'node-fetch'
import fs from 'fs'
import consoleColors from './consoleColors'
import { replaceAllInList } from './replaceAll'
import { DATA_PATH } from '../../config.json'
import { GROUPING, REPLACEMENTS, REMOVE } from '../../parseConfig.json'

import jsdom from 'jsdom'
const { JSDOM } = jsdom
global.DOMParser = new JSDOM().window.DOMParser

export type ExtraData = {
    sheets: string[],
    sheetProperties: { string: Array<string> }
}

export async function fetchData() {
    console.log(consoleColors.FG_MAGENTA + 'Fetching Spreadsheet...')
    const extraData = {sheets: new Array<string>, sheetProperties: {}} as ExtraData
    const sheetsData = {}
    const response = await fetch("https://docs.google.com/spreadsheets/d/1AKC_KhnCe44gtWmfI2cmKjvIDbTfC0ACfP15Z7UauvU/htmlview")

    if (!response.ok) { return console.error(response.statusText) }

    const html = await response.text()
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    //#region sheet_collection
    console.log(consoleColors.FG_MAGENTA + 'Collecting Sheets...')
    const sheetsViewport = doc.getElementById('sheets-viewport')?.childNodes
    const sheets = (() => {
        const temp: any[] = []
        for (var i = 0, length = sheetsViewport?.length || 0; i < length; i++) {
            const id = (sheetsViewport?.[i] as any).id
            const sheetButton = doc.getElementById(`sheet-button-${id}`)

            if (sheetButton) {
                temp.push({ 'name': sheetButton.textContent?.toLowerCase(), 'id': id, 'element': doc.getElementById(id) })
            }
        }
        return temp
    })()
    //#endregion

    //#region parse_data
    // Parse data in sheets and add to parsedData
    for (const sheet of sheets) {
        const sheetContent = sheet.element.getElementsByClassName('waffle')[0].childNodes[1] // Grabs <tbody> of <table class="waffle"...>

        const data: any[] = []

        // Parse and grab content
        const rows = sheetContent.childNodes

        // Grab the key values for each column (Name, Reqs, etc)
        const keys = ((headers) => {
            const temp: any[] = []
            for (const header of headers) {
                if (header == headers[0]) continue; // Skip irrelevant header (1)

                let headerText = header.textContent.toLowerCase()
                headerText = replaceAllInList(headerText, [' ', '/'], '_')
                headerText = replaceAllInList(headerText, ['__', '___'], '_')
                headerText = replaceAllInList(headerText, ['?', '.'], '')

                temp.push(headerText)
            }
            return temp
        })(rows[0].childNodes) // Outfits tabs first row is not what we need

        // Starts at 1 to prevent parsing data from headers
        for (const row of rows) {
            var cellData = {}
            const rowContent = row.childNodes
            for (var colIndex = 1, rowWidth = rowContent.length; colIndex < rowWidth; colIndex++) {
                const cell = rowContent.item(colIndex)
                const header = keys[colIndex - 1]

                if (cell.nodeName == 'TH') {
                    continue
                } // Skip if cell is header

                let content = cell.textContent
                content = replaceAllInList(content, ['(', ')'], '')

                if (header == '' || header in REMOVE[sheet.name]) continue;

                // Get header name and add cell content to cellData[header]'s value
                cellData[header] = content
            }

            if (!cellData) continue;

            // Check whether or not the cell is a spacer
            if (!(() => {
                // Check if *all* values in cellData are ''
                for (const key in cellData) {
                    if (Object.hasOwnProperty.call(cellData, key)) {
                        const value = cellData[key];
                        if (value != '') return true;
                    }
                }
                return false
            })()) continue;

            data.push(cellData)
        }
        sheetsData[sheet.name] = data
    }
    //#endregion

    //#region config
    // Apply REPLACEMENTS and GROUPING from parseConfig.json
    for (var sheetIndex = 0, sheetLength = Object.keys(sheetsData).length; sheetIndex < sheetLength; sheetIndex++) {
        const sheetName = Object.keys(sheetsData)[sheetIndex]
        const sheetData = sheetsData[sheetName]

        // Replacements
        for (var entryIndex = 0, sheetDataLength = sheetData.length; entryIndex < sheetDataLength; entryIndex++) {
            let entry = sheetData[entryIndex]

            const replacements = REPLACEMENTS[sheetName]
            for (var replacementsIndex = 0, replacementsLength = Object.keys(replacements).length; replacementsIndex < replacementsLength; replacementsIndex++) {
                // Get key
                const propertyName = Object.keys(replacements)[replacementsIndex]
                // Get value
                const replacement = replacements[propertyName]

                // Check if the value is actually an option object
                if (typeof replacement == "object") {
                    if (replacement.type) {
                        const val = entry[propertyName]
                        typeof val == "undefined"
                        let newVal

                        switch (replacement.type) {
                            case "boolean": { newVal = Boolean(val) } break;
                            case "number": {
                                newVal = parseFloat(val) 
                                if (Number.isNaN(newVal)) {
                                    newVal = new RegExp(/\d+/).exec(val)?.at(1)
                                    /*
                                     * console.log(parseFloat("Power 6"))
                                     * console.log(parseFloat("6 Power"))
                                     * We want a result where both return 6
                                     */
                                }
                            } break;
                            case "object": { newVal = new Object(val) } break;
                            case "string": { newVal = val.toString() } break;
                            case "undefined": { newVal = null } break;
                        }

                        entry[propertyName] = (newVal) as String
                    }

                    if (replacement.name) {
                        entry[replacement.name] = entry[propertyName]

                        entry = Object.keys(entry)
                            .filter(key => key != propertyName)
                            .reduce((acc, key) => {
                                acc[key] = entry[key];
                                return acc;
                            }, {});
                    }
                }
                // Check if entry has the propertyName
                else if (propertyName in entry) {
                    entry[replacement] = entry[propertyName]

                    entry = Object.keys(entry)
                        .filter(key => key != propertyName)
                        .reduce((acc, key) => {
                            acc[key] = entry[key];
                            return acc;
                        }, {});
                }
            }

            // Update new info
            sheetData[entryIndex] = entry
        }

        // Grouping
        for (const entry of sheetData) {
            const sheetGrouping = GROUPING[sheetName]

            Object.keys(sheetGrouping).forEach(sheetGroupName => {
                let group = {}
                const sheetGroup = sheetGrouping[sheetGroupName]
                sheetGroup.forEach((sheetProp: string) => {
                    if (Object.keys(entry).includes(sheetProp)) {
                        group[sheetProp] = entry[sheetProp]
                        delete entry[sheetProp]
                    }
                })
                entry[sheetGroupName] = group
            });
        }
    }

    //#endregion

    //#region get_extra_data

    // Get sheet names
    console.log(sheetsData)
    for (const sheet of sheets) {
        extraData.sheets.push(sheet.name)

        // Get sheet entry properties
        for (const entry of sheetsData[sheet.name]) {
            console.log(entry)
        }
    }

    //#endregion

    // Write to file
    const dataFilePath = DATA_PATH
    fs.writeFileSync(dataFilePath, JSON.stringify({ "sheets": sheetsData, "data": extraData }, null, "\t"))
    console.log(consoleColors.FG_MAGENTA + `Written to '${dataFilePath}'!`)
}