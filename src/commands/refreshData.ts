import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { AUTHORIZED_USERS, DATA_PATH } from "../../config.json"
import { fetchData } from '../util/fetchData'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh_data')
        .setDescription('Refreshes the bot data'),
        
    async execute(interaction: CommandInteraction) {
        const user = interaction.user;
        const userId = user.id;

        await interaction.deferReply({ephemeral: true})
        if (AUTHORIZED_USERS.includes(userId)) {
            await interaction.editReply({ embeds: [new EmbedBuilder().setTitle('Fetching Google Sheet...').setTimestamp()] })
            try {
                await fetchData()
                const successEmbed = new EmbedBuilder().setTitle('Successfully Fetched Data!')
                        .setColor('Green')
                        .setFooter({text: 'Written to `'+DATA_PATH+'`.'})
                        .setTimestamp()

                    await interaction.editReply({ embeds: [successEmbed] })
            } catch (error) {
                console.error(error)
                await interaction.editReply({ 
                    embeds: [new EmbedBuilder().setTitle('An error occurred!')
                    .addFields({ name: 'err', value: error as string })
                    .setTimestamp()
                    .setColor('Red')
                    ] 
                })
            }
        } else {
            await interaction.editReply({ 
                embeds: [
                    new EmbedBuilder().setTitle('You are not an authorized user!')
                    .setTimestamp()
                    .setColor('Red')
                ] 
            })
        }
    }
}