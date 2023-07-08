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
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for entries using an advanced query system.')
        .addStringOption(option => {
        option.setName('query')
            .setRequired(true)
            .setDescription('...');
        return option;
    })
        .addStringOption(option => {
        option.setName('sheet')
            .setRequired(true)
            .setDescription('...');
        (0, getSheets_1.getData)('sheets').forEach(sheetName => {
            option.addChoices({ name: sheetName, value: sheetName });
        });
        return option;
    }),
    /**
     *
     * @param { CommandInteraction } interaction
     */
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = interaction.options.get('query').value;
            const tokens = (0, queryHandler_1.default)(query).tokens;
            console.log(tokens);
            yield interaction.reply(`Search returned ${tokens.length} results.` + '```json\n' + JSON.stringify(tokens, null, '\t') + '```');
        });
    }
};
