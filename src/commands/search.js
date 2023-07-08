const { SlashCommandBuilder, CommandInteraction } = require('discord.js')
const { getData } = require('../util/getSheets')
const { tokenize } = require('../util/queryHandler')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for entries using an advanced query system.')
        .addStringOption(option => {
            option.setName('query')
                .setRequired(true)
                .setDescription('...')

            return option
        })
        .addStringOption(option => {
            option.setName('sheet')
                .setRequired(true)
                .setDescription('...')
            
            getData('sheets').forEach(sheetName => {
                option.addChoices({ name: sheetName, value: sheetName })
            });

            return option
        }),
    /**
     * 
     * @param { CommandInteraction } interaction 
     */
    async execute(interaction) {
        const query = interaction.options.get('query').value

        console.log(tokenize(query).tokens)
        await interaction.reply('``Hell on earth``')
    }
}