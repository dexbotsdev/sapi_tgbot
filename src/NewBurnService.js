import WebSocket from "ws";
import { AUTHTOKEN } from "./config.js";
import { MessageEmbed,MessageButton, MessageActionRow} from "discord.js";
import { checkTokenHolders, shorten } from "./utils.js";
import { Connection, PublicKey } from '@solana/web3.js';

export const NewBurnService = async(client,channelId)=>{
    let tm;
    const WSURLPROD="wss://solanaapi.up.railway.app/subscribe/newBurns"
    const WSURL="ws://LOCALHOST:8080/subscribe/newBurns"
   let start=0;

    const socket = new WebSocket(WSURLPROD, {
        headers: { Authorization: AUTHTOKEN }
    
    })
    
    socket.on('open', () => { 
        console.log('WebSocket connected'); 
         
    setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.ping();
            }
        }, 30000); 
    })
    
    
    socket.onerror = (err) => {
        console.log( err);
    }
    socket.onmessage = async (msg) => {
       
        console.log(msg.data); 

  

        if(start ==0 ){
            start =1;
            return;
        }
        const data = JSON.parse(msg.data);
        const channel = client.channels.cache.get(channelId);
        const tokenJson = JSON.parse(data.tokenJson);

        await checkTokenHolders(data.baseMint, data.lpMint);

        const topHoplders = await checkTokenHolders(data.baseMint, data.lpMint);

        let thumbnail = undefined; 
        if(tokenJson)
        {if(tokenJson.image && tokenJson.image.indexOf('http')>=0)thumbnail = tokenJson.image;}

        let holdersTxt = '';
        let ammpctg = 0;
       
        topHoplders.forEach((h)=>{
            let holderName=shorten(h.holder)
            if(h.holder.indexOf('AMM')>=0){
                ammpctg =Number(h.holderPercentage).toFixed(2);
                holderName = 'Raydium';
            }

            holdersTxt+= `**[${holderName}](https://solscan.io/account/${h.holderAddress})`+ '** - '+ Number(h.holderPercentage).toFixed(2) +' % \n';
            

        })

     
        const embed = new MessageEmbed()
            .setColor('#3498db') // Set embed color (Blue in this example)
            .setTitle(`LP TOKEN BURNED -  ${tokenJson.symbol} - (Raydium)`)
            .setDescription(`
                **Mint Address:** 
                [${data.baseMint}](https://solscan.io/address/${data.baseMint})
                **Token Details:** 
                **Name : **  ${data.tokenName}
                **Description : **
                ${data.tokenJson.description ?data.tokenJson.description:''}

                **Renounce :** ${!data.mintable ? `✅`: `❌`} 
                **Liquidity | Pool Holdings :** 
                ${data.quoteLiquidity} SOL | ${ammpctg} %

                **Large Holders :** 

                ${holdersTxt}
            `)
            .addField('Links',
            `[BirdEye](https://solscan.io/address/${data.baseMint}) | [Dexscreener](https://solscan.io/address/${data.baseMint}) | [Rugcheck](https://solscan.io/address/${data.baseMint}) | [Raydium](https://solscan.io/address/${data.baseMint})`)
            .addField(' ',
            `[🤖  BonkBot](https://solscan.io/address/${data.baseMint}) [🤖  Fluxbot](https://solscan.io/address/${data.baseMint}) [🌐 Join Us!](https://solscan.io/address/${data.baseMint})`)
            .setTimestamp();

            if(thumbnail)embed.setThumbnail(thumbnail);
 
            const button = new MessageButton()
            .setStyle('LINK')
            .setLabel('View on Solana Explorer')
            .setURL(`https://solscan.io/address/${data.id}`);

        // Create an action row with the button
        const row = new MessageActionRow().addComponents(button);
 
        channel.send({ embeds: [embed], components: [row] });
 
    
    } 
    
    socket.on('error', (error) => {
        console.error('WebSocket error:', error.message);
         
    });
    socket.on('pong', () => {
        console.log('Received Pong response');
         
    });


}


