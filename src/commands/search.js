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
const getSheets_1 = require("../util/getSheets");
const discord_js_1 = require("discord.js");
const queryHandler_1 = __importDefault(require("../util/queryHandler"));
const langConfig_json_1 = require("../../langConfig.json");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for entries using an advanced query system.')
        .addStringOption(option => option.setName('sheet')
        .setRequired(true)
        .setAutocomplete(true)
        .setDescription('...'))
        .addStringOption(option => option.setName('query')
        .setRequired(true)
        .setAutocomplete(true)
        .setDescription('...'))
        .addBooleanOption(option => option.setName('debug')
        .setDescription('Used for me! (The developer). Prints out random things for debugging.')),
    autocomplete(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const focused = interaction.options.getFocused(true);
            const sheets = (0, getSheets_1.getExtraData)().sheets;
            const sheet = interaction.options.getString('sheet');
            const query = interaction.options.getString('query');
            let choices = (() => {
                var _a, _b, _c;
                if (focused.name === 'sheet') {
                    return sheets;
                }
                else if (focused.name === 'query') {
                    // This code is experimental. In reality we should be tokenizing the `sheetOption` and then returning choices based on it
                    const props = (_a = (0, getSheets_1.getExtraData)().sheetProperties[sheet]) !== null && _a !== void 0 ? _a : [];
                    const stmts = query.split(langConfig_json_1.ReservedCharacters.SEPARATOR).map(x => x.trim());
                    const stmt = stmts === null || stmts === void 0 ? void 0 : stmts.at(-1); // only auto complete the current statement
                    const prevStmts = stmts.length > 1 ? query.slice(0, -stmt.length) : '';
                    const usedProps = [];
                    for (const pStmt of prevStmts.split(langConfig_json_1.ReservedCharacters.SEPARATOR) || [prevStmts]) {
                        console.log(pStmt);
                        const lHand = (_b = pStmt === null || pStmt === void 0 ? void 0 : pStmt.split(langConfig_json_1.ReservedCharacters.ASSIGN)) === null || _b === void 0 ? void 0 : _b.at(0);
                        if (lHand !== undefined) {
                            usedProps.push(lHand);
                        }
                    }
                    // Check if there is a lefthand or not. 
                    // IF - Suggest the righthand accordingly
                    // NOT - Add a possible choice + ASSIGN character to the end
                    // get '1:100' from 'agi=1:100', '20' from 'str=20', or '1+' from 'mtl=1+'
                    const rHand = (_c = stmt === null || stmt === void 0 ? void 0 : stmt.split(langConfig_json_1.ReservedCharacters.ASSIGN)) === null || _c === void 0 ? void 0 : _c.at(1);
                    if (rHand) {
                        return [query + (query.endsWith(langConfig_json_1.ReservedCharacters.SEPARATOR) ? '' : langConfig_json_1.ReservedCharacters.SEPARATOR)];
                    }
                    else {
                        return props
                            .filter(prop => !usedProps.includes(prop)) // Prevent duplicate properties. Ie. No more "wil=0;wil=20+;"
                            .map(prop => prevStmts + prop + langConfig_json_1.ReservedCharacters.ASSIGN);
                    }
                }
                return [];
            })();
            console.log({ query: query, choices: choices });
            const filtered = choices.filter(choice => choice.startsWith(focused.value)).slice(0, 25);
            yield interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
        });
    },
    execute(interaction) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const debug = (_a = interaction.options.get('debug')) === null || _a === void 0 ? void 0 : _a.value;
            const query = (_b = interaction.options.get('query')) === null || _b === void 0 ? void 0 : _b.value;
            const tokens = (0, queryHandler_1.default)(query).tokens;
            yield interaction.reply(`Search returned ${'x'} results.` + (debug ? '```json\n' + JSON.stringify(tokens, null, '\t') + '```' : ''));
        });
    }
};
