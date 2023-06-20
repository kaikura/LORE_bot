const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { EmbedBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;

const currentUsers = [];

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,

	 ] });

const db = new sqlite3.Database('./lore.db', sqlite3.OPEN_READWRITE, (err) => {
if (err) {
	console.error(err.message);
}
console.log('Connected to the lore database.');
});
const confirm = new ButtonBuilder()
	.setCustomId('confirm')
	.setLabel('Start story')
	.setStyle(ButtonStyle.Primary);

const cazz = new ButtonBuilder()
	.setCustomId('cazzo')
	.setLabel('Do not click')
	.setStyle(ButtonStyle.Primary);

const cancel = new ButtonBuilder()
	.setCustomId('cancel')
	.setLabel('Cancel')
	.setStyle(ButtonStyle.Secondary);

const row = new ActionRowBuilder()
	.addComponents(cancel, confirm, cazz);


const embed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setImage('https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75')
	.addFields(
		{ name: 'Chapter I', value: '\u200B' },
		{ name: '\u200B', value: 'This is the beginning' },
		{ name: '\u200B', value: '\u200B' },
	)
	.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });



client.once('ready', (c) =>{

	console.log(`✅ ${c.user.tag} is online`);
})

client.on('interactionCreate', (interaction) => {

	if (interaction.isChatInputCommand()) {
		if (interaction.commandName == 'lore'){
			currentUsers.push(interaction.user.id);
			console.log(currentUsers);
			startinGame(interaction);
		}

	};

	
});

async function startinGame(interaction){

	const response = await interaction.reply({
		//content: ``,
		embeds : [embed],
		components: [row],
		ephemeral: true,
	});

	const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });
	collector.on('collect', async i => {
		if (i.customId.indexOf('X') > -1)
		{
  			alert("hello found inside your_string");
		}
		await i.reply(`${i.user} has selected a butt!`);


		const index = currentUsers.indexOf(interaction.user.id);
		const x = currentUsers.splice(index, 1);
		console.log(currentUsers);

		
	});

}

client.login(token);