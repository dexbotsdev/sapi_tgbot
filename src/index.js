import pkg from 'discord.js';
const { Client, Intents } = pkg;
import { BOT_TOKEN, newburnsChannelId, newpoolsChannelId } from './config.js';
import { NewPoolFinder } from './NewPoolsService.js';
import { NewBurnService } from './NewBurnService.js';
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
 
client.once('ready', async () => {
  console.log('Bot is ready!');

 await NewPoolFinder(client,newpoolsChannelId);
 await NewBurnService(client,newburnsChannelId);

 });

client.login(BOT_TOKEN); // Replace with your Discord bot token

function postMessage() {
  const channel = client.channels.cache.get(channelId);


   
}
