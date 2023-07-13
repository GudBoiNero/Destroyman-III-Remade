import { getExtraData } from '../util/getSheets'
import { AutocompleteFocusedOption, AutocompleteInteraction, CommandInteraction, SlashCommandBuilder } from 'discord.js'
import tokenize from '../util/queryHandler'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for entries using an advanced query system.')
        .addStringOption(option => {
            option.setName('sheet')
                .setRequired(true)
                .setAutocomplete(true)
                .setDescription('...')
            /*
            getData('sheets').forEach((sheetName: any) => {
                option.addChoices({ name: sheetName, value: sheetName })
            });
            */
            return option
        })
        .addStringOption(option => {
            option.setName('query')
                .setRequired(true)
                .setAutocomplete(true)
                .setDescription('...')

            return option
        }),
    async autocomplete(interaction: AutocompleteInteraction) {
        const focused: AutocompleteFocusedOption = interaction.options.getFocused(true);
        let choices: Array<string> = []
        const sheets = getExtraData().sheets

        if (focused.name === 'sheet') {
            choices = sheets
        } else if (focused.name === 'query') {
            // This code is experimental. In reality we should be tokenizing the `sheetOption` and then returning choices based on it

            const sheetOption = interaction.options.getString('sheet') || ''
            console.log(sheetOption, getExtraData())
            if (sheets.includes(sheetOption)) {
                choices = getExtraData().sheetProperties[sheetOption]
            } 
        }

        console.log(choices)
        const filtered = choices.filter(choice => 
            choice.startsWith(focused.value) || choice.includes(focused.value)
        ).slice(0, 25);
        console.log(filtered)
        await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    },
    async execute(interaction: CommandInteraction) {
        const query = interaction.options.get('query')?.value
        const tokens = tokenize(query as string).tokens

        console.log(tokens)
        await interaction.reply(`Search returned ${tokens.length} results.` + '```json\n' + JSON.stringify(tokens, null, '\t') + '```')
    }
}