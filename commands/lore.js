const { EmbedBuilder ,ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();


module.exports = {
	data: new SlashCommandBuilder()
        .setName('lore')
        .setDescription('Start adventure'),
	async execute(interaction) {

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

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setImage('https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75')
			//.setTitle('LORE')
			//.setURL('https://discord.js.org/')
			//.setAuthor({ name: 'Citizen Lore', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' })
			//.setDescription('Lore description')
			//.setThumbnail('https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75')
			.addFields(
				{ name: 'Chapter I', value: 'This is the biginning of the story' },
				{ name: '\u200B', value: '\u200B' },
				//{ name: 'Inline field title', value: 'Some value here', inline: true },
				//{ name: 'Inline field title', value: 'Some value here', inline: true },
			)
			//.addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
			//.setImage('https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75')
			//.setTimestamp()
			.setFooter({ text: 'Powered by PSLab', iconURL: 'https://lab.ps-lab.io/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FlabLogoBlack.673a99a0.gif&w=3840&q=75' });
		

		const row = new ActionRowBuilder()
			.addComponents(cancel, confirm);

		const response = await interaction.reply({
			//content: ``,
			embeds : [embed],
			components: [row],
			ephemeral: true,
		});

		
		
		//const collectorFilter = i => i.user.id === interaction.user.id;
		try {
			const confirmation = await response.awaitMessageComponent();//{ filter: collectorFilter }
			
			if (confirmation.customId === 'confirm') {
				var story = await new Promise ((resolve, reject)=>{
					db.get("select * from lore where id = 2;", function (err, row) {
						if(err){
							console.log(err);
						}
						else{
							resolve(row.story);
							///story = row.story;
						}
					});
				});
				
				console.log(story);
				await confirmation.update({ 
					content: '', 
					components: [] 
				});
				await interaction.followUp({ 
					content: story, 
					embeds: [embed],
					ephemeral : true 
				}); 
				
			} else if (confirmation.customId === 'cancel') {
				await confirmation.update({ 
					content: 'Action cancelled', 
					components: [] 
				});
			}
		} catch (e) {
			console.log(e);
			await interaction.editReply({ 
				content: 'Confirmation not received within 1 minute, cancelling', components: [] });
		}
		
	},
};