import WebSocket from "ws";
import { AUTHTOKEN } from "./config.js";
import { MessageEmbed } from "discord.js";
import { checkTokenHolders, shorten } from "./utils.js";

export const NewPoolFinder = async(client,channelId)=>{
    let tm;
    const WSURLPROD="wss://solanaapi.up.railway.app/subscribe/newPools"
    const WSURL="ws://LOCALHOST:8080/subscribe/newPools"
   let start=0;

    const socket = new WebSocket(WSURLPROD, {
        headers: { Authorization: AUTHTOKEN }
    
    })
    
    socket.on('open', () => { 
        console.log('WebSocket connected For NewPools'); 
         
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

             holdersTxt+= `**[${holderName}](https://solscan.io/account/${h.holder})`+ '** - '+ Number(h.holderPercentage).toFixed(2) +' % \n';
            

        })

        const embed = new MessageEmbed()
            .setColor('#3498db') // Set embed color (Blue in this example)
            .setTitle(`New Pool Created for -  ${data.tokenName} (Raydium)`)
            .addField('Base Liquidity', `${data.baseLiquidity} ${data.tokenName}`, true)
            .addField('Quote Liquidity', `${data.quoteLiquidity} SOL`, true)
            .addField('LP Amount', `${data.lpAmount.toFixed(2)} LP`, true) 
            .addField('Open Time', new Date(data.openTime * 1000).toLocaleString(), true)  
            .setDescription(`
                **Mint Address:** 
                [${data.baseMint}](https://solscan.io/address/${data.baseMint})
                **Token Details:** 
                **Name : **  ${data.tokenName}
                **Description : **
                ${data.tokenJson.description ?data.tokenJson.description:''}

                **Renounce :** ${!data.mintable ? `✅`: `❌`} 
                **Top Holdings :**

                ${holdersTxt}
            `)
            .addField('Links',
            `[BirdEye](https://solscan.io/address/${data.baseMint}) | [Dexscreener](https://solscan.io/address/${data.baseMint}) | [Rugcheck](https://solscan.io/address/${data.baseMint}) | [Raydium](https://solscan.io/address/${data.baseMint})`)
            .addField(' ',
            `[🤖  BonkBot](https://solscan.io/address/${data.baseMint}) [🤖  Fluxbot](https://solscan.io/address/${data.baseMint}) [🌐 Join Us!](https://solscan.io/address/${data.baseMint})`)
            .setTimestamp();
            if(thumbnail)embed.setThumbnail(thumbnail);

        channel.send({ embeds: [embed] });
 
    
    } 
    
    socket.on('error', (error) => {
        console.error('WebSocket error:', error.message);
         
    });
    socket.on('pong', () => {
        console.log('Received Pong response');
         
    });


}


