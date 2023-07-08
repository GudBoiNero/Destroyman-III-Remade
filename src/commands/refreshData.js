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
const { SlashCommandBuilder, CommandInteraction, EmbedBuilder } = require('discord.js');
const { AUTHORIZED_USERS } = require('../../config.json');
const { fetchData } = require('../util/fetchData');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh_data')
        .setDescription('Refreshes the bot data'),
    /**
     *
     * @param { CommandInteraction } interaction
     */
    execute(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = interaction.user;
            const userId = user.id;
            yield interaction.deferReply({ ephemeral: true });
            if (AUTHORIZED_USERS.includes(userId)) {
                yield interaction.editReply({ embeds: [new EmbedBuilder().setTitle('Fetching Google Sheet...').setTimestamp()] });
                try {
                    yield fetchData();
                    const successEmbed = new EmbedBuilder().setTitle('Successfully Fetched Data!')
                        .setColor('Green')
                        .setFooter({ text: 'Written to `latest.data.json`.' })
                        .setTimestamp();
                    yield interaction.editReply({ embeds: [successEmbed] });
                }
                catch (error) {
                    console.error(error);
                    yield interaction.editReply({
                        embeds: [new EmbedBuilder().setTitle('An error occurred!')
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
                        new EmbedBuilder().setTitle('You are not an authorized user!')
                            .setTimestamp()
                            .setColor('Red')
                    ]
                });
            }
        });
    }
};
