const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test command'),
	async execute(interaction) {	

		const response = await interaction.reply({
			content: `Ready to start a new story?`		
		});
		
	},
};