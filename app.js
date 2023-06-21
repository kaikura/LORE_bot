require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { EmbedBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const token = process.env.DISCORD_TOKEN;
const db = new sqlite3.Database('./lore.db', sqlite3.OPEN_READWRITE, (err) => {
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the lore database.');
	});

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,

	 ] });

const currentUsers = []; //keeping track of current users


//INITIAL MESSAGE
/////////////////

const confirm = new ButtonBuilder()
	.setCustomId('000011')
	.setLabel('Start story')
	.setStyle(ButtonStyle.Primary);

const cazz = new ButtonBuilder()
	.setCustomId('000021')
	.setLabel('Do not click')
	.setStyle(ButtonStyle.Primary);

const cancel = new ButtonBuilder()
	.setCustomId('0000X1')
	.setLabel('Cancel')
	.setStyle(ButtonStyle.Primary);

const row = new ActionRowBuilder()
	.addComponents(cancel, confirm, cazz);


const embed = new EmbedBuilder()
	.setColor(0x0099FF)
	.setImage('https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75')
	.setDescription('beginning')
	.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });
	
////////////////

//GAME STARTS	
async function startinGame(interaction){

	const story = await new Promise((resolve, reject) => {
		db.get("SELECT story FROM lore where id ='000001' and storyId=1", (err, result) => {
			if (err) {
			console.log('Error running sql: ' + sql)
			console.log(err)
			reject(err)
			} else {
			resolve(result);
			}
		});
	});

	console.log(story);
	const nn = new ButtonBuilder()
	.setCustomId('00001')
	.setLabel('Cancel')
	.setStyle(ButtonStyle.Primary);

	const nn2 = new ButtonBuilder()
	.setCustomId('000X1')
	.setLabel('Cancel?')
	.setStyle(ButtonStyle.Primary);

	const nrow = new ActionRowBuilder()
		.addComponents(nn,nn2);

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
			const index = currentUsers.indexOf(interaction.user.id);
			const x = currentUsers.splice(index, 1);
			console.log(currentUsers);
			console.log("End Game flag found");
			await i.reply(`${i.user} end of game your game.`);
			embed.setDescription = story;
			await interaction.editReply({
			//content: ``,
			embeds : [],
			components: [],
			ephemeral: true,
			});
			


		}
		else{
		await i.reply({
			//content: ``,
			embeds : [embed],
			components: [nrow],
			ephemeral: true,
		});
		await interaction.editReply({
			//content: ``,
			embeds : [embed],
			components: [],
			ephemeral: true,
		});
		}

		
});

}//strGame

//EVENTS LISTENER
/////////////////

client.once('ready', (c) =>{

	console.log(`✅ ${c.user.tag} is online`);
});



client.on('interactionCreate', (interaction) => {
	if (interaction.isChatInputCommand()) {
		if (interaction.commandName == 'lore'){
			currentUsers.push(interaction.user.id);
			console.log(currentUsers);
			startinGame(interaction);
		}
	};
});

///////////////////

client.login(token);