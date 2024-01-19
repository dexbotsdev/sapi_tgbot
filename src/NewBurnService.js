import WebSocket from "ws";
import { AUTHTOKEN } from "./config.js";
import { MessageEmbed } from "discord.js";
import { checkTokenHolders } from "./utils.js";
import { Connection, PublicKey } from '@solana/web3.js';

export const NewBurnService = async(client,channelId)=>{
    let tm;
    const WSURLPROD="wss://solanaapi.up.railway.app/subscribe/newBurns"
    const WSURL="ws://LOCALHOST:8080/subscribe/newBurns"
   let start=0;

    const socket = new WebSocket(WSURL, {
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

        const embed = new MessageEmbed()
            .setColor('#3498db') // Set embed color (Blue in this example)
            .setTitle(`LP TOKEN BURNED -  ${tokenJson.symbol} - (Raydium)`)
            .setThumbnail(tokenJson.image)
            .addField('Mint Address', `${data.baseMint}`, false)
            .addField('Token Details \n Name :', `${tokenJson.symbol}`, false)
            .addField('Description', " "+tokenJson.description)
            .addField('LP Amount', `${data.lpAmount.toFixed(2)} LP`, true)
            .addField('Mintable', data.mintable ? 'Yes' : 'No', true)  
            .addField('Open Time', new Date(data.openTime * 1000).toLocaleString(), true)  
            .setTimestamp();


        channel.send({ embeds: [embed] });
 
    
    } 
    
    socket.on('error', (error) => {
        console.error('WebSocket error:', error.message);
         
    });
    socket.on('pong', () => {
        console.log('Received Pong response');
         
    });


}


