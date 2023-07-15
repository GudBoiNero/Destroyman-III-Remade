"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchData = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const consoleColors_1 = __importDefault(require("./consoleColors"));
const replaceAll_1 = require("./replaceAll");
const config_json_1 = require("../../config.json");
const parseConfig_json_1 = require("../../parseConfig.json");
const jsdom_1 = __importDefault(require("jsdom"));
const { JSDOM } = jsdom_1.default;
global.DOMParser = new JSDOM().window.DOMParser;
function fetchData() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(consoleColors_1.default.FG_MAGENTA + 'Fetching Spreadsheet...');
        const extraData = {
            sheets: [],
            sheetProperties: new Map()
        };
        const sheetsData = {};
        const response = yield (0, node_fetch_1.default)("https://docs.google.com/spreadsheets/d/1AKC_KhnCe44gtWmfI2cmKjvIDbTfC0ACfP15Z7UauvU/htmlview");
        if (!response.ok) {
            return console.error(response.statusText);
        }
        const html = yield response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        //#region sheet_collection
        console.log(consoleColors_1.default.FG_MAGENTA + 'Collecting Sheets...');
        const sheetsViewport = (_a = doc.getElementById('sheets-viewport')) === null || _a === void 0 ? void 0 : _a.childNodes;
        const sheets = (() => {
            var _a;
            const temp = [];
            for (var i = 0, length = (sheetsViewport === null || sheetsViewport === void 0 ? void 0 : sheetsViewport.length) || 0; i < length; i++) {
                const id = (sheetsViewport === null || sheetsViewport === void 0 ? void 0 : sheetsViewport[i]).id;
                const sheetButton = doc === null || doc === void 0 ? void 0 : doc.getElementById(`sheet-button-${id}`);
                if (sheetButton) {
                    temp.push({ 'name': (_a = sheetButton.textContent) === null || _a === void 0 ? void 0 : _a.toLowerCase(), 'id': id, 'element': doc.getElementById(id) });
                }
            }
            return temp;
        })();
        //#endregion
        //#region parse_data
        // Parse data in sheets and add to parsedData
        for (const sheet of sheets) {
            const sheetContent = sheet.element.getElementsByClassName('waffle')[0].childNodes[1]; // Grabs <tbody> of <table class="waffle"...>
            const data = [];
            // Parse and grab content
            const rows = sheetContent.childNodes;
            // Grab the key values for each column (Name, Reqs, etc)
            const keys = ((headers) => {
                const temp = [];
                for (const header of headers) {
                    if (header == headers[0])
                        continue; // Skip irrelevant header (1)
                    let headerText = header.textContent.toLowerCase();
                    headerText = (0, replaceAll_1.replaceAllInList)(headerText, [' ', '/'], '_');
                    headerText = (0, replaceAll_1.replaceAllInList)(headerText, ['__', '___'], '_');
                    headerText = (0, replaceAll_1.replaceAllInList)(headerText, ['?', '.'], '');
                    temp.push(headerText);
                }
                return temp;
            })(rows[0].childNodes); // Outfits tabs first row is not what we need
            // Starts at 1 to prevent parsing data from headers
            for (const row of rows) {
                var cellData = {};
                const rowContent = row.childNodes;
                for (var colIndex = 1, rowWidth = rowContent.length; colIndex < rowWidth; colIndex++) {
                    const cell = rowContent.item(colIndex);
                    const header = keys[colIndex - 1];
                    if (cell.nodeName == 'TH') {
                        continue;
                    } // Skip if cell is header
                    let content = cell.textContent;
                    content = (0, replaceAll_1.replaceAllInList)(content, ['(', ')'], '');
                    if (header == '' || header in parseConfig_json_1.REMOVE[sheet.name])
                        continue;
                    // Get header name and add cell content to cellData[header]'s value
                    cellData[header] = content;
                }
                if (!cellData)
                    continue;
                // Check whether or not the cell is a spacer
                if (!(() => {
                    // Check if *all* values in cellData are ''
                    for (const key in cellData) {
                        if (Object.hasOwnProperty.call(cellData, key)) {
                            const value = cellData[key];
                            if (value != '')
                                return true;
                        }
                    }
                    return false;
                })())
                    continue;
                data.push(cellData);
            }
            sheetsData[sheet.name] = data;
        }
        //#endregion
        //#region config
        // Apply REPLACEMENTS and GROUPING from parseConfig.json
        for (var sheetIndex = 0, sheetLength = Object.keys(sheetsData).length; sheetIndex < sheetLength; sheetIndex++) {
            const sheetName = Object.keys(sheetsData)[sheetIndex];
            const sheetData = sheetsData[sheetName];
            // Replacements
            for (var entryIndex = 0, sheetDataLength = sheetData.length; entryIndex < sheetDataLength; entryIndex++) {
                let entry = sheetData[entryIndex];
                const replacements = parseConfig_json_1.REPLACEMENTS[sheetName];
                for (var replacementsIndex = 0, replacementsLength = Object.keys(replacements).length; replacementsIndex < replacementsLength; replacementsIndex++) {
                    // Get key
                    const propertyName = Object.keys(replacements)[replacementsIndex];
                    // Get value
                    const replacement = replacements[propertyName];
                    // Check if the value is actually an option object
                    if (typeof replacement == "object") {
                        if (replacement.type) {
                            const val = entry[propertyName];
                            typeof val == "undefined";
                            let newVal;
                            switch (replacement.type) {
                                case "boolean":
                                    {
                                        newVal = Boolean(val);
                                    }
                                    break;
                                case "number":
                                    {
                                        newVal = parseFloat(val);
                                        if (Number.isNaN(newVal)) {
                                            newVal = (_b = new RegExp(/\d+/).exec(val)) === null || _b === void 0 ? void 0 : _b.at(1);
                                            /*
                                             * console.log(parseFloat("Power 6"))
                                             * console.log(parseFloat("6 Power"))
                                             * We want a result where both return 6
                                             */
                                        }
                                    }
                                    break;
                                case "object":
                                    {
                                        newVal = new Object(val);
                                    }
                                    break;
                                case "string":
                                    {
                                        newVal = val.toString();
                                    }
                                    break;
                                case "undefined":
                                    {
                                        newVal = null;
                                    }
                                    break;
                            }
                            entry[propertyName] = (newVal);
                        }
                        if (replacement.name) {
                            entry[replacement.name] = entry[propertyName];
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
                        entry[replacement] = entry[propertyName];
                        entry = Object.keys(entry)
                            .filter(key => key != propertyName)
                            .reduce((acc, key) => {
                            acc[key] = entry[key];
                            return acc;
                        }, {});
                    }
                }
                // Update new info
                sheetData[entryIndex] = entry;
            }
            // Grouping
            for (const entry of sheetData) {
                const sheetGrouping = parseConfig_json_1.GROUPING[sheetName];
                Object.keys(sheetGrouping).forEach(sheetGroupName => {
                    let group = {};
                    const sheetGroup = sheetGrouping[sheetGroupName];
                    sheetGroup.forEach((sheetProp) => {
                        if (Object.keys(entry).includes(sheetProp)) {
                            group[sheetProp] = entry[sheetProp];
                            delete entry[sheetProp];
                        }
                    });
                    entry[sheetGroupName] = group;
                });
            }
        }
        //#endregion
        //#region get_extra_data
        // Get sheet names
        for (const sheet of sheets) {
            extraData.sheets.push(sheet.name);
            // Get sheet entry properties
            for (const entry of sheetsData[sheet.name]) {
                for (const key of Object.keys(entry)) {
                    const props = extraData.sheetProperties[sheet.name];
                    if (props === null || props === void 0 ? void 0 : props.includes(key))
                        continue;
                    extraData.sheetProperties[sheet.name] = [...props !== null && props !== void 0 ? props : [], key];
                }
            }
        }
        console.log(extraData);
        //#endregion
        // Write to file
        const dataFilePath = config_json_1.DATA_PATH;
        fs_1.default.writeFileSync(dataFilePath, JSON.stringify({ "sheets": sheetsData, "data": extraData }, null, "\t"));
        console.log(consoleColors_1.default.FG_MAGENTA + `Written to '${dataFilePath}'!`);
    });
}
exports.fetchData = fetchData;
