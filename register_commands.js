const { Client, Collection, Events, GatewayIntentBits, ApplicationCommandOptionType } = require('discord.js');
const { REST, Routes } = require('discord.js');
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const fs = require('fs');
const path = require('path');

const commands = [
    {
        name : 'lore',
        description : 'Start a new Story',

    },
	{
        name : 'rstlevel',
        description : 'Admin command',
		options : [
			{
				name: 'input',
				description : "admin command",
				type : ApplicationCommandOptionType.String,
				required : true,
			}
		]
    },
	{
        name : 'ptdb',
        description : 'Admin command',
    },
];



// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();