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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const consoleColors_1 = __importDefault(require("./util/consoleColors"));
const discord_js_1 = require("discord.js");
const config_json_1 = require("../config.json");
global.capitalize = (word) => {
    const lower = word.toLowerCase();
    return word.charAt(0).toUpperCase() + lower.slice(1);
};
// https://stackoverflow.com/questions/69500556/discord-js-guide-property-commands-does-not-exist-on-type-clientboolean
class CustomClient extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.commands = new discord_js_1.Collection();
        this.loadCommands();
    }
    loadCommands() {
        const commands = new Array;
        this.commands = new discord_js_1.Collection();
        const commandsPath = path_1.default.join(__dirname, 'commands');
        const commandFiles = fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path_1.default.join(commandsPath, file);
            const command = require(filePath);
            commands.push(command.data.toJSON());
            if ('data' in command && 'execute' in command) {
                this.commands.set(command.data.name, command);
            }
            else {
                console.log(consoleColors_1.default.FG_RED + `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
        // Construct and prepare an instance of the REST module
        const rest = new discord_js_1.REST().setToken(config_json_1.CLIENT_TOKEN);
        // and deploy your commands!
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(consoleColors_1.default.FG_GRAY + `Started refreshing ${commands.length} application (/) commands.`);
                // The put method is used to fully refresh all commands in the guild with the current set
                yield rest.put(discord_js_1.Routes.applicationCommands(config_json_1.CLIENT_ID), { body: commands });
                console.log(consoleColors_1.default.FG_GRAY + `Successfully reloaded ${commands.length} application (/) commands.`);
            }
            catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
            }
        }))();
    }
}
exports.default = CustomClient;
const client = new CustomClient({ intents: discord_js_1.GatewayIntentBits.Guilds });
client.on(discord_js_1.Events.ClientReady, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(consoleColors_1.default.FG_GREEN + 'Ready!');
}));
client.on(discord_js_1.Events.InteractionCreate, (interaction) => __awaiter(void 0, void 0, void 0, function* () {
    if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            yield command.execute(interaction);
        }
        catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                yield interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            else {
                yield interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
    else if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }
        try {
            yield command.autocomplete(interaction);
        }
        catch (error) {
            console.error(error);
        }
    }
}));
client.login(config_json_1.CLIENT_TOKEN);
