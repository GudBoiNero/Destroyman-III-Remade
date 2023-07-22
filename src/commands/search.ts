import { getExtraData } from '../util/getSheets'
import { AutocompleteFocusedOption, AutocompleteInteraction, CommandInteraction, SlashCommandBuilder } from 'discord.js'
import tokenize from '../util/queryHandler'
import { ReservedCharacters } from '../../langConfig.json'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for entries using an advanced query system.')
        .addStringOption(option =>
            option.setName('sheet')
                .setRequired(true)
                .setAutocomplete(true)
                .setDescription('...'))
        .addStringOption(option =>
            option.setName('query')
                .setRequired(true)
                .setAutocomplete(true)
                .setDescription('...'))
        .addBooleanOption(option => 
            option.setName('debug')
            .setDescription('Used for me! (The developer). Prints out random things for debugging.')),
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

                const stmts = query.split(ReservedCharacters.SEPARATOR).map(x => x.trim())
                const stmt = stmts?.at(-1) as string // only auto complete the current statement
                const prevStmts = stmts.length > 1 ? query.slice(0, -stmt.length) : ''
                const usedProps: string[] = []

                for (const pStmt of prevStmts.split(ReservedCharacters.SEPARATOR) || [prevStmts]) {
                    console.log(pStmt)
                    const lHand = pStmt?.split(ReservedCharacters.ASSIGN)?.at(0);
                    if (lHand !== undefined) {
                        usedProps.push(lHand)
                    }
                }

                // Check if there is a lefthand or not. 
                // IF - Suggest the righthand accordingly
                // NOT - Add a possible choice + ASSIGN character to the end

                // get '1:100' from 'agi=1:100', '20' from 'str=20', or '1+' from 'mtl=1+'
                const rHand = stmt?.split(ReservedCharacters.ASSIGN)?.at(1);

                if (rHand) {
                    return [query + (query.endsWith(ReservedCharacters.SEPARATOR) ? '' : ReservedCharacters.SEPARATOR)];
                } else {
                    return props
                        .filter(prop => !usedProps.includes(prop)) // Prevent duplicate properties. Ie. No more "wil=0;wil=20+;"
                        .map(prop => prevStmts + prop + ReservedCharacters.ASSIGN)
                }
            }
            return []
        })()

        console.log({ query: query, choices: choices })

        const filtered = choices.filter(choice =>
            choice.startsWith(focused.value)
        ).slice(0, 25);
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async execute(interaction: CommandInteraction) {
        const debug = interaction.options.get('debug')?.value as boolean
        const query = interaction.options.get('query')?.value as string
        const tokens = tokenize(query as string).tokens

        await interaction.reply(`Search returned ${'x'} results.` + (debug ? '```json\n' + JSON.stringify(tokens, null, '\t') + '```' : ''))
    }
}