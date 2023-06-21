require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { EmbedBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const token = process.env.DISCORD_TOKEN;


const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,

	 ] });

const currentUsers = []; //keeping track of current users

async function botBusy(interaction){

	await interaction.reply('Already playing!');

}

//GAME STARTS	
async function startinGame(interaction){

	if (currentUsers.indexOf(interaction.user.id) > -1){
		botBusy(interaction);
		return;
	}

	currentUsers.push(interaction.user.id);
	console.log(`${interaction.user.username} has started a game`);
	console.log(currentUsers);
	const db = new sqlite3.Database('./lore.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the lore database.');
		});

	const firstMex = await new Promise((resolve, reject) => {
		db.get(`SELECT story,L1,L2,L3,L1txt,L2txt,L3txt FROM lore where id ='000001' and storyId=1`, (err, result) => {
			if (err) {
			console.log('Error running sql: ' + sql)
			console.log(err)
			reject(err)
			} else {
			/////////////////
			//INITIAL MESSAGE
			const confirm = new ButtonBuilder()
				.setCustomId(`${result.L1}`)
				.setLabel(`${result.L1txt}`)
				.setStyle(ButtonStyle.Primary);

			const cazz = new ButtonBuilder()
				.setCustomId(`${result.L2}`)
				.setLabel(`${result.L2txt}`)
				.setStyle(ButtonStyle.Primary);

			const cancel = new ButtonBuilder()
				.setCustomId(`${result.L3}`)
				.setLabel(`${result.L3txt}`)
				.setStyle(ButtonStyle.Primary);
				
			const row = new ActionRowBuilder()
				.addComponents(confirm,cazz,cancel);


			const embed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setImage('https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75')
				.setDescription(`${result.story}`)
				.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });
			
			const msg = {
				embeds : [embed],
				components: [row],
				ephemeral: true,
			};
			/////////////////
			resolve(msg);
			}
		});
	});
	db.close();
	await interaction.reply(firstMex);

}//strGame

/////////////////////////////////
//GAME
async function game(interaction){

	const db = new sqlite3.Database('./lore.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the lore database.');
		});


	let follow = await new Promise((resolve, reject) => {
		db.get(`SELECT story,L1,L2,L3,L1txt,L2txt,L3txt FROM lore where id =${interaction.customId} and storyId=1`, (err, result) => {
			if (err) {
			console.log('Error running sql: ');
			console.log(err);
			resolve(0);
			} else {
				if(result!=undefined){
				//console.log(result.story);
				const nn = new ButtonBuilder()
					.setCustomId(`'${result.L1}'`)
					.setLabel(`${result.L1txt}`)
					.setStyle(ButtonStyle.Primary);
			
				const nn2 = new ButtonBuilder()
					.setCustomId(`'${result.L2}'`)
					.setLabel(`${result.L2txt}`)
					.setStyle(ButtonStyle.Primary);
			
				const nn3 = new ButtonBuilder()
					.setCustomId(`'${result.L3}'`)
					.setLabel(`${result.L3txt}`)
					.setStyle(ButtonStyle.Primary);
			
				const nrow = new ActionRowBuilder()
					.addComponents(nn,nn2,nn3);

				const embed = new EmbedBuilder()
					.setColor(0x0099FF)
					.setImage('https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75')
					.setDescription(`${result.story}`)
					.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });

				const msg = {
				embeds : [embed],
				components: [nrow],
				ephemeral: true,
				}
				resolve(msg);
			}else{
				resolve(0);
			}
				 
			}
		});
	});
	


	if (interaction.customId.indexOf('X') > -1){
		
			const index = currentUsers.indexOf(interaction.user.id);
			const x = currentUsers.splice(index, 1);
			console.log(currentUsers);
			console.log("End Game flag found");
			await interaction.reply({
				content: `${interaction.user} end of game your game.`,
				//embeds : [embed],
				components: [],
				ephemeral: true,
			});
		}
		else{
		db.close();
		if(follow!=0){
			await interaction.reply(follow);
		}
		else{
			const index = currentUsers.indexOf(interaction.user.id);
			const x = currentUsers.splice(index, 1);
			await interaction.reply('Story Interrupted...');
		}

		
	}
	

}//END GAME
/////////////////


//EVENTS LISTENER
/////////////////

client.once('ready', (c) =>{

	console.log(`✅ ${c.user.tag} is online`);
});



client.on('interactionCreate', (interaction) => {

	if (interaction.isChatInputCommand()) {
		if (interaction.commandName == 'lore'){

			startinGame(interaction);
		}
	}
	else if (interaction.isButton()) {

		game(interaction);
	
}
});

///////////////////

client.login(token);