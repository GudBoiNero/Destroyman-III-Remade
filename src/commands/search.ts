import { getExtraData } from '../util/getSheets'
import { AutocompleteFocusedOption, AutocompleteInteraction, CommandInteraction, SlashCommandBuilder, strikethrough } from 'discord.js'
import tokenize, { NumberToken, RangeToken } from '../util/queryHandler'
import { ReservedCharacters } from '../../langConfig.json'

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
        const sheets = getExtraData().sheets
        const sheet = interaction.options.getString('sheet') as string
        const query = interaction.options.getString('query') as string

        let choices: Array<string> = (() => {

            if (focused.name === 'sheet') {
                return sheets
            } else if (focused.name === 'query') {
                // This code is experimental. In reality we should be tokenizing the `sheetOption` and then returning choices based on it
                const props: string[] = getExtraData().sheetProperties[sheet] ?? []

                const statements = query.split(ReservedCharacters.SEPARATOR).map(x => x.trim())
                const stmt = statements?.at(-1) as string // only auto complete the current statement
                const prevStatements = statements.length > 1 ? query.slice(0, -stmt.length) : ''

                // Check if there is a lefthand or not. 
                // IF - Suggest the righthand accordingly
                // NOT - Add a possible choice + ASSIGN character to the end

                // get 'agi' from 'agi=1:100'
                const lHand = stmt?.split(ReservedCharacters.ASSIGN)?.at(0);
                // get '1:100' from 'agi=1:100', '20' from 'str=20', or '1+' from 'mtl=1+'
                const rHand = stmt?.split(ReservedCharacters.ASSIGN)?.at(1);

                if (!rHand) {
                    return props.map(x => prevStatements + x + ReservedCharacters.ASSIGN)
                } else {
                    return [query + (query.endsWith(ReservedCharacters.SEPARATOR) ? '' : ReservedCharacters.SEPARATOR)];
                }
            }
            return []
        })()

        console.log({query: query, choices: choices})

        const filtered = choices.filter(choice =>
            choice.startsWith(focused.value) || 
            choice.includes(focused.value) 
        ).slice(0, 25);
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction: CommandInteraction) {
        const query = interaction.options.get('query')?.value
        const tokens = tokenize(query as string).tokens

        await interaction.reply(`Search returned ${tokens.length} results.` + '```json\n' + JSON.stringify(tokens, null, '\t') + '```')
    }
}