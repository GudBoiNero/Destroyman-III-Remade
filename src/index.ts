import fs from 'fs';
import path from 'path'
import colors from './util/consoleColors'
import { Client as DiscordClient, Collection, GatewayIntentBits, Events, REST, Routes, ClientOptions } from 'discord.js'
import { CLIENT_TOKEN, CLIENT_ID } from '../config.json'

global.capitalize = (word: string) => {
	const lower = word.toLowerCase();
	return word.charAt(0).toUpperCase() + lower.slice(1);
}

// https://stackoverflow.com/questions/69500556/discord-js-guide-property-commands-does-not-exist-on-type-clientboolean
export default class CustomClient extends DiscordClient {
	commands: Collection<any, any> // use correct type :)
	constructor(options: ClientOptions) {
		super(options)
		this.commands = new Collection();
		this.loadCommands()
	}
	loadCommands() {
		const commands = new Array<JSON>;
		this.commands = new Collection();
		const commandsPath = path.join(__dirname, 'commands');
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);

			commands.push(command.data.toJSON());

			if ('data' in command && 'execute' in command) {
				this.commands.set(command.data.name, command);
			} else {
				console.log(colors.FG_RED + `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}

		// Construct and prepare an instance of the REST module
		const rest = new REST().setToken(CLIENT_TOKEN);

		// and deploy your commands!
		(async () => {
			try {
				console.log(colors.FG_GRAY + `Started refreshing ${commands.length} application (/) commands.`);

				// The put method is used to fully refresh all commands in the guild with the current set
				await rest.put(
					Routes.applicationCommands(CLIENT_ID),
					{ body: commands },
				);

				console.log(colors.FG_GRAY + `Successfully reloaded ${commands.length} application (/) commands.`);
			} catch (error) {
				// And of course, make sure you catch and log any errors!
				console.error(error);
			}
		})();
	}
}

const client = new CustomClient({ intents: GatewayIntentBits.Guilds })

client.on(Events.ClientReady, async () => {
	console.log(colors.FG_GREEN + 'Ready!')
})


client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = (interaction.client as CustomClient).commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
})

client.login(CLIENT_TOKEN)