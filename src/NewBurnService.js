import WebSocket from "ws";
import { AUTHTOKEN } from "./config.js";
import { MessageEmbed, MessageButton, MessageActionRow, MessageReaction } from "discord.js";
import { checkTokenHolders, shorten } from "./utils.js";
import { Connection, PublicKey } from '@solana/web3.js';

export const NewBurnService = async (client, channelId) => {
    let tm;
    const WSURLPROD = "wss://solanaapi.up.railway.app/subscribe/newBurns"
    const WSURL = "ws://LOCALHOST:8080/subscribe/newBurns"
    let start = 0;

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
        console.log(err);
    }
    socket.onmessage = async (msg) => {

        console.log(msg.data);



        if (start == 0) {
            start = 1;
            return;
        }
        const data = JSON.parse(msg.data);
        const channel = client.channels.cache.get(channelId);
        const tokenJson = JSON.parse(data.tokenJson);

        let baseMint = data.baseMint;
        let quoteLiquidity = data.quoteLiquidity;

        if (baseMint == 'So11111111111111111111111111111111111111112') {
            baseMint = data.quoteMint;
            quoteLiquidity = data.baseLiquidity;
        }
        const topHoplders = await checkTokenHolders(baseMint, data.lpMint);

        let thumbnail = undefined;
       // if (tokenJson) { if (tokenJson.image && tokenJson.image.indexOf('http') >= 0) thumbnail = tokenJson.image; }

        let holdersTxt = '';
        let ammpctg = 0;
        let cnt = 10;
        topHoplders.forEach((h) => {
            let holderName = shorten(h.holder)
            if (h.holder.indexOf('AMM') >= 0) {
                ammpctg = Number(h.holderPercentage).toFixed(2);
                holderName = 'Raydium';
            }
            if (cnt > 0)
                holdersTxt += `[${holderName}](https://solscan.io/account/${h.holderAddress})` + '\t\t  :' + Number(h.holderPercentage).toFixed(2) + ' % \n';

            cnt--;


        })

        const embed = new MessageEmbed()
            .setColor('#3498db') // Set embed color (Blue in this example)
            .setTitle(`🔥 LP TOKEN BURNED | $${tokenJson.symbol} | Raydium 🔥 `)
            .setDescription(`
                **Mint Address:** 
                [${baseMint}](https://solscan.io/address/${baseMint})
                **Token Details:** 
                **Name : **  ${data.tokenName}
                **Description : **
                ${tokenJson?.description}

                **Authority renounced :** ${!data.mintable ? `✅` : `❌`} 
                **Freezing Disabled :** ${!data.freezeAble ? `✅` : `❌`} 
                
                **Liquidity | Pool allocation :** 
                ${quoteLiquidity} SOL | ${ammpctg} %

                Top 10 Holders :

                ${holdersTxt}
            `)
            .addField('Links',
                `[BirdEye](https://solscan.io/address/${data.baseMint}) | [Dexscreener](https://solscan.io/address/${data.baseMint}) | [Rugcheck](https://solscan.io/address/${data.baseMint}) | [Raydium](https://solscan.io/address/${data.baseMint})`)
            .addField(' ',
                `[Insta-Buy⚡]( https://t.me/bonkbot_bot?start=ref_vd5bb) [🤖  Fluxbot](https://solscan.io/address/${data.baseMint}) [🌐 Join Us!](https://solscan.io/address/${data.baseMint})`)

            .setTimestamp();

        if (thumbnail) embed.setThumbnail(thumbnail);


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


