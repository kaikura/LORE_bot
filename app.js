require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const { EmbedBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuOptionBuilder ,StringSelectMenuBuilder, AttachmentBuilder} = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const wait = require('node:timers/promises').setTimeout;
const token = process.env.DISCORD_TOKEN;

const waitTime = 86400000;
//const waitTime = 40;
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,

	 ] });

const currentLevel = new Map();//keeping track of the current level

function msToTime(duration) {
	var milliseconds = Math.floor((duration % 1000) / 100),
	  seconds = Math.floor((duration / 1000) % 60),
	  minutes = Math.floor((duration / (1000 * 60)) % 60),
	  hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;
  
	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }
async function botBusy(interaction,string){

	if(arguments.length==1) string =`${interaction.user} you are already playing a game....`;

	await interaction.reply({
		content : string,
		ephemeral : true
	});
	
}

function getdate() {
	const currentDate = new Date();
	const logDate = currentDate.toLocaleString();
	return logDate;
  }

//GAME STARTS	
async function startinGame(interaction){

	//const role = interaction.member.roles.cache.find(r => r.name === "Polygon Citizen");

	if (currentLevel.get(`${interaction.user.id}`)){
		botBusy(interaction);
		return;
	}
	//DEBUGSHIT
	console.log(`${getdate()} - ${interaction.user.username} has started a game`);
	currentLevel.set(`${interaction.user.id}`,{level : 11.1, story: interaction.customId});
	console.log(currentLevel);
	////////////

	//const access = await userManagment(interaction.user.id);

	const db = new sqlite3.Database('./lorepath.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the lorepath database.');
	});
	
	const firstMex = await new Promise((resolve, reject) => {
		db.get(`SELECT story,L1,L2,L1txt,L2txt FROM lore where id ='11' and storyId=${interaction.customId}`, (err, result) => {
			if (err) {
				console.log('Error running sql: ' + sql)
				console.log(err)
				reject(err)
			} else {
			/////////////////
			//INITIAL MESSAGE
			
			const file = new AttachmentBuilder('imgs/lab1.png');
			const sel1 = new ButtonBuilder()
				.setCustomId(`${result.L1}`)
				.setLabel(`${result.L1txt}`)
				.setStyle(ButtonStyle.Primary);

			const sel2 = new ButtonBuilder()
				.setCustomId(`${result.L2}`)
				.setLabel(`${result.L2txt}`)
				.setStyle(ButtonStyle.Primary);
			/*
			const sel3 = new ButtonBuilder()
				.setCustomId(`${result.L3}`)
				.setLabel(`${result.L3txt}`)
				.setStyle(ButtonStyle.Primary);
			*/	
			const row = new ActionRowBuilder()
				.addComponents(sel1,sel2);


			const embed = new EmbedBuilder()
				.setColor(0x0099FF)
				//.setImage('attachment://lab1.png')
				.setDescription(`${result.story}`)


			const msg = {
				files : [file],
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
	//if(access!=-1){
		await interaction.reply(firstMex);
	//}else{
		//await interaction.reply({
			//content: `${interaction.user} you have reached the max number of games! Wait tomorrow for some new chances to reach the end of the story`,
			//embeds : [embed],
			//components: [row],
			//ephemeral : true,
		//});
	//}
	
}//strGame


//GAME
async function game(interaction){

	//CONSISTENCY CHECK
	if (!(currentLevel.get(`${interaction.user.id}`))){
		botBusy(interaction,`${interaction.user} Please start a new game`);
		return;
	}

	if(Number(interaction.customId)<Number(currentLevel.get(`${interaction.user.id}`).level) || Number(interaction.customId) > Number(currentLevel.get(`${interaction.user.id}`).level)+0.1){

		botBusy(interaction,'You already took that step! Please move on.');
		return;
	}
	//CONSISTENCY CHECK


	const db = new sqlite3.Database('./lorepath.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the lorepath database.');
		});


	let follow = await new Promise((resolve, reject) => {
		db.get(`SELECT story,L1,L2,L1txt,L2txt FROM lore where id =${interaction.customId} and storyId=${currentLevel.get(`${interaction.user.id}`).story}`, (err, result) => {
			if (err) {
			console.log('Error running sql: ');
			console.log(err);
			resolve(0);
			} else {
				if(!result){	
				console.log("DB result "+result);
				currentLevel.delete(`${interaction.user.id}`);
				resolve(0);

				}else{
				currentLevel.set(`${interaction.user.id}`,{level : Math.min(Number(result.L1),Number(result.L2)), story:currentLevel.get(`${interaction.user.id}`).story});
				console.log(currentLevel);
				const file = new AttachmentBuilder('imgs/lab2.png');
				const nn = new ButtonBuilder()
					.setCustomId(`${result.L1}`)
					.setLabel(`${result.L1txt}`)
					.setStyle(ButtonStyle.Primary);
				
				const nn2 = new ButtonBuilder()
					.setCustomId(`${result.L2}`)
					.setLabel(`${result.L2txt}`)
					.setStyle(ButtonStyle.Primary);

				const nrow = new ActionRowBuilder()
					.addComponents(nn,nn2);

				const embed = new EmbedBuilder()
					.setColor(0x0099FF)
					.setImage('attachment://lab1.png')
					.setDescription(`${result.story}`)
				
				console.log("Next choice1 "+result.L1);
				console.log("next choice2 "+result.L2);
				//VICTORY
				if(Number(result.L1)==0 && Number(result.L2)==0){
					const file = new AttachmentBuilder('imgs/lab3.png');
					currentLevel.delete(`${interaction.user.id}`);
					console.log(currentLevel);
					const endembed = new EmbedBuilder()
					.setColor(0x0099FF)
					.setDescription(`${result.story}`)
					.addFields(
						{ name: '\u200B', value: '\u200B' },
					)
					.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });
					const msg = {
						files : [file],
						embeds : [endembed],
						components: [],
						ephemeral: true,
						}
					resolve(msg);
				}
				//GAME OVER
				if(Number(result.L1)==-1 && Number(result.L2)==-1){
					const file = new AttachmentBuilder('imgs/lab3.png');
					currentLevel.delete(`${interaction.user.id}`);
					console.log(currentLevel);
					const endembed = new EmbedBuilder()
					.setColor(0x0099FF)
					.setDescription(`${result.story}`)
					.addFields({ name: '\u200B', value: '\u200B' })
					.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });
					const msg = {
						files : [file],
						embeds : [endembed],
						components: [],
						ephemeral: true,
						}
					resolve(msg);
				}
				const msg = {
				files : [file],
				embeds : [embed],
				components: [nrow],
				ephemeral: true,
				}
				resolve(msg);

				}	 
			}
		});
	});

	db.close();
	if(follow!=0){
		await interaction.reply(follow);
	}
	else{
		currentLevel.delete(`${interaction.user.id}`);
		console.log(currentLevel);
		await interaction.reply({
			content : 'The story ends here at the moment...',
			ephemeral: true,
		
		});
	}
	

}//END GAME
/////////////////

async function roleSelection(interaction){

	const access = await userManagment(interaction.user.id,true);

	if (currentLevel.get(`${interaction.user.id}`)){
		botBusy(interaction);
		return;
	}
	const b1=new ButtonBuilder()
			.setCustomId('0')
			.setLabel('Polygon Citizen')
			.setStyle(ButtonStyle.Danger)
	const b2=new ButtonBuilder()
			.setCustomId('1')
			.setLabel('SG Citizen')
			.setStyle(ButtonStyle.Danger)
	const b3=new ButtonBuilder()
			.setCustomId('2')
			.setLabel('Citizen of the Dead')
			.setStyle(ButtonStyle.Danger)



	if(!interaction.member.roles.cache.find(role => role.name === "Polygon Citizen")){b1.setDisabled(true)};
	if(!interaction.member.roles.cache.find(role => role.name === "Citizen of the Dead")){b3.setDisabled(true)};
	if(!interaction.member.roles.cache.find(role => role.name === "SG Citizen")){b2.setDisabled(true)};

	const row = new ActionRowBuilder()
		.addComponents(b2,b1,b3);
	if(access.data==-1){
		const emb = new EmbedBuilder()
		.setColor(0x0099FF)
		.addFields({ name: ':hourglass: Waiting Time',value: '\u200B'})
		.addFields({ name: `:clock2: ${msToTime(access.time)}`,value: '\u200B'})
		.addFields({ name: '\u200B', value: '\u200B' })
		.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });
		await interaction.reply({

			content: `${interaction.user}, you have reached the maximun number of tries for today`,
			embeds : [emb],
			//components: [row],
			ephemeral : true,
		});
	}else{
		const emb = new EmbedBuilder()
		.setColor(0x0099FF)
		.setTitle('Welcome to CitizenLore')
		.setDescription('Prepare to be transported into a realm of boundless possibilities, where the power of choice lies at your fingertips. CitizenLore, the intelligent bot companion, invites you to embark on an extraordinary crossroad story game that will captivate your imagination.')
		.addFields({ name: '\u200B', value: '\u200B' })
		.setThumbnail('https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75')
		.addFields({ name: 'Path Selection', value: 'Choose the story you will stat with' })
		.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });

		await interaction.reply({
			//content: 'Select your path!',
			embeds : [emb],
			components: [row],
			ephemeral : true,
		});
		await interaction.followUp(`${interaction.user} has started a game.`);
		await wait(40000);
		await interaction.deleteReply();
	}


}

////////////////

async function visitor(interaction){

	await interaction.reply({
		content : `Dear ${interaction.user}, there is no story available for you at the moment`,
		ephemeral : true,
	});
}

/////////////////
//USERMANAGMENT
//////////////////
async function userManagment(user,update){

	const sr = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the users database.');
	});

	const row = await new Promise((resolve, reject) => {
		sr.get(`select attempt,date,flag from users where id = ${user} `, (err, result) => {
			if (err) {
				console.log('Error running sql: ');
				console.log(err);
				resolve(0);
			} else {
				if(result){
					console.log(`User : ${user} found`);
					
					resolve(result);
				}else{
					resolve(0);
				}
			}
		});
	});
	console.log(user);
	console.log(row);
	if(row==0){

		const insert = await new Promise((resolve, reject) => {
			sr.get(`INSERT INTO users (id,attempt,date,flag) VALUES(${user},${0},${Date.now()},${1})`, (err, result) => {
				if (err) {
					console.log('Error running sql: ');
					console.log(err);
					resolve(0);
				} else {
					console.log("User added seccessfully");
					console.log(row);
					resolve(1);
					
				}
			});
		});
		return {data:1}
	}else{
		 
		if(Number(row.attempt)<5){
			const atpupd = Number(row.attempt)+1;
			const upd = await new Promise((resolve, reject) => {
				sr.get(`update users set attempt=${atpupd} where id = ${user}`, (err, result) => {
					if (err) {
						console.log('Error running sql: ');
						console.log(err);
						resolve(0);
					} else {	
						console.log("update success");
						resolve(1);
						
					}
				});
		});
		return{data:1}
	
		}else{ 
			if(Date.now()>Number(row.date)+waitTime){
				const update = await new Promise((resolve, reject) => {
					sr.get(`update users set attempt=${0},date=${Date.now()} where id = ${user}`, (err, result) => {
						if (err) {
							console.log('Error running sql: ');
							console.log(err);
							resolve(0);
						} else {	
							console.log("update success");
							resolve(1);
							
						}
					});
				});
			}else{
				tt = (row.date+waitTime)-Date.now();
				console.log(tt);
				msg = {data:-1,time:tt}
				return msg;
			}
		 }
		sr.close();
	}
}

async function dbAttempt(interaction){

	const sr = new sqlite3.Database('./users.db', sqlite3.OPEN_READWRITE, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the users database.');
	});

	const update = await new Promise((resolve, reject) => {
		sr.get(`update users set attempt=0 where id=${interaction.user.id}`, (err, result) => {
			if (err) {
				console.log('Error running sql: ');
				console.log(err);
				resolve(0);
			} else {	
				console.log("update success");
				resolve(1);
				
			}
		});
	});
	sr.close();
	interaction.reply({content:`attempt restored to 0`,ephemeral:true});

}

//EVENTS LISTENER
/////////////////

client.once('ready', (c) =>{

	console.log(`✅ ${c.user.tag} is online`);
});

client.on('interactionCreate', (interaction) => {

	if (interaction.isChatInputCommand()) {
		if (interaction.commandName == 'lore'){
			if(interaction.member.roles.cache.find(role => role.name === "Polygon Citizen" || role.name === "SG Citizen" || role.name === "Citizen of the Dead")){
			//if(interaction.member.roles.cache.find(role => role.name === "loremanager")){
				
				roleSelection(interaction);		
				
			}else{

				visitor(interaction);
			}		
		}
		if(interaction.commandName == 'rstlevel'){
			//console.log(interaction);
			const npt = interaction.options.get("input").value;
			if(interaction.member.roles.cache.find(role => role.name === "loremanager")){
				currentLevel.delete(`${npt}`);
				console.log("RESET CALLED");
				console.log(currentLevel);
				interaction.reply({content:`status ${npt} restored`,ephemeral:true});
			}else{
				interaction.reply({content:'Permission denied',ephemeral:true});
			}
		}
		if (interaction.commandName == 'ptdb'){
			if(interaction.member.roles.cache.find(role => role.name === "loremanager")){
				
				dbAttempt(interaction);
				
			}else{

				interaction.reply({content:'Permission denied',ephemeral:true});
			}		
		}
	}
	else if (interaction.isButton()) {
		if(interaction.customId <= 2){

			startinGame(interaction);

		}else{
			console.log("INTERACTION ID : "+interaction.customId);
			game(interaction);
		}

		
	
	} 
});

///////////////////

client.login(token);

