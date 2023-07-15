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
        .addStringOption(option => {
        option.setName('sheet')
            .setRequired(true)
            .setAutocomplete(true)
            .setDescription('...');
        /*
        getData('sheets').forEach((sheetName: any) => {
            option.addChoices({ name: sheetName, value: sheetName })
        });
        */
        return option;
    })
        .addStringOption(option => {
        option.setName('query')
            .setRequired(true)
            .setAutocomplete(true)
            .setDescription('...');
        return option;
    }),
    autocomplete(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const focused = interaction.options.getFocused(true);
            const sheets = (0, getSheets_1.getExtraData)().sheets;
            let choices = (() => {
                var _a, _b, _c;
                if (focused.name === 'sheet') {
                    return sheets;
                }
                else if (focused.name === 'query') {
                    // This code is experimental. In reality we should be tokenizing the `sheetOption` and then returning choices based on it
                    const sheet = interaction.options.getString('sheet');
                    const query = interaction.options.getString('query');
                    const props = (_a = (0, getSheets_1.getExtraData)().sheetProperties[sheet]) !== null && _a !== void 0 ? _a : [];
                    const statements = query.split(langConfig_json_1.ReservedCharacters.SEPARATOR);
                    const stmt = statements === null || statements === void 0 ? void 0 : statements.at(-1); // only auto complete the current statement
                    // Check if there is a lefthand or not. 
                    // IF - Suggest the righthand accordingly
                    // NOT - Add a possible choice + ASSIGN character to the end
                    // get 'agi' from 'agi=1:100'
                    const lHand = (_b = stmt === null || stmt === void 0 ? void 0 : stmt.split(langConfig_json_1.ReservedCharacters.ASSIGN)) === null || _b === void 0 ? void 0 : _b.at(0);
                    // get '1:100' from 'agi=1:100', '20' from 'str=20', or '1+' from 'mtl=1+'
                    const rHand = (_c = stmt === null || stmt === void 0 ? void 0 : stmt.split(langConfig_json_1.ReservedCharacters.ASSIGN)) === null || _c === void 0 ? void 0 : _c.at(1);
                    if (!rHand) {
                        return props.map(x => x + langConfig_json_1.ReservedCharacters.ASSIGN);
                    }
                    else {
                        return [query + langConfig_json_1.ReservedCharacters.SEPARATOR];
                    }
                    return [stmt];
                }
                return [];
            })();
            const filtered = choices.filter(choice => choice.startsWith(focused.value) || choice.includes(focused.value)).slice(0, 25);
            yield interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
        });
    },
    execute(interaction) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const query = (_a = interaction.options.get('query')) === null || _a === void 0 ? void 0 : _a.value;
            const tokens = (0, queryHandler_1.default)(query).tokens;
            yield interaction.reply(`Search returned ${tokens.length} results.` + '```json\n' + JSON.stringify(tokens, null, '\t') + '```');
        });
    }
};
