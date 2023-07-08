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
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = require("../../config.json");
const fetchData_1 = require("../util/fetchData");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('refresh_data')
        .setDescription('Refreshes the bot data'),
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = interaction.user;
            const userId = user.id;
            yield interaction.deferReply({ ephemeral: true });
            if (config_json_1.AUTHORIZED_USERS.includes(userId)) {
                yield interaction.editReply({ embeds: [new discord_js_1.EmbedBuilder().setTitle('Fetching Google Sheet...').setTimestamp()] });
                try {
                    yield (0, fetchData_1.fetchData)();
                    const successEmbed = new discord_js_1.EmbedBuilder().setTitle('Successfully Fetched Data!')
                        .setColor('Green')
                        .setFooter({ text: 'Written to `' + config_json_1.DATA_PATH + '`.' })
                        .setTimestamp();
                    yield interaction.editReply({ embeds: [successEmbed] });
                }
                catch (error) {
                    console.error(error);
                    yield interaction.editReply({
                        embeds: [new discord_js_1.EmbedBuilder().setTitle('An error occurred!')
                                .addFields({ name: 'err', value: error })
                                .setTimestamp()
                                .setColor('Red')
                        ]
                    });
                }
            }
            else {
                yield interaction.editReply({
                    embeds: [
                        new discord_js_1.EmbedBuilder().setTitle('You are not an authorized user!')
                            .setTimestamp()
                            .setColor('Red')
                    ]
                });
            }
        });
    }
};
