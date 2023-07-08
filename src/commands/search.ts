import { getData } from '../util/getSheets'
import { CommandInteraction, SlashCommandBuilder } from 'discord.js'
import tokenize from '../util/queryHandler'

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
            
            getData('sheets').forEach((sheetName: any) => {
                option.addChoices({ name: sheetName, value: sheetName })
            });

            return option
        }),
    async execute(interaction: CommandInteraction) {
        const query = interaction.options.get('query')?.value
        const tokens = tokenize(query as string).tokens

        console.log(tokens)
        await interaction.reply(`Search returned ${tokens.length} results.` + '```json\n' + JSON.stringify(tokens, null, '\t') + '```')
    }
}