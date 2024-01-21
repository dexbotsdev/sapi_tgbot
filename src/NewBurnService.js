import WebSocket from 'ws';
import { AUTHTOKEN, TG_BOT_TOKEN } from './config.js';
import { MessageEmbed, MessageButton, MessageActionRow, MessageReaction } from 'discord.js';
import { checkTokenHolders, shorten } from './utils.js';
import { Connection, PublicKey } from '@solana/web3.js';
import { Telegraf, Markup } from 'telegraf';

export const NewBurnService = async (newburnsChannelId) => {
    let tm;
    const WSURLPROD = 'wss://spengine.up.railway.app/subscribe/newBurns'
    const WSURL = 'ws://localhost:8080/subscribe/newBurns'
    let start = 0;

    const bot = new Telegraf(TG_BOT_TOKEN);

    bot.launch();
    bot.start((ctx) => {
        let message = ` Please use the /start command `
        ctx.reply(message)
    })


    bot.on('message', (ctx) => {
        console.log(JSON.stringify(ctx, null, 2));
    })

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
        console.log(err);
    }
    socket.onmessage = async (msg) => {

        console.log(msg.data);



        if (start == 0) {
            start = 1;
            return;
        }
        const data = JSON.parse(msg.data);
        const tokenJson = JSON.parse(data.tokenJson);

        const burned = data.burnedLpAmount;
        const lpAmount = data.lpAmount;

        if (lpAmount / burned > 2) return;

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



        console.log(data)

        const emojis = {
            token: '🚀',
            id: '🆔',
            owner: '👤',
            creationDate: '📅',
            lpAmount: '💧',
            baseLiquidity: '🪙',
            quoteLiquidity: '💲',
            lpBurned: data.lpBurned ? '🔥' : '❌',
            rugpulled: data.rugpulled ? '🚨' : '✅',
            mintable: data.mintable ? '🕵️' : '🕵️',
            freezeAble: data.freezeAble ? '🕵️' : '🕵️',
            burnedTime: '🔥⏰',
        };

        // Format data with emojis
        const formattedData = `
*LP Burned! | $${tokenJson.symbol} | RAYDIUM*

${emojis.token} *Name:* ${data.tokenName} 
${emojis.owner} *Owner:*  [${shorten(data.owner)}](https://solscan.io/account/${data.owner})
${emojis.creationDate} *Creation Date:* ${data.creationDate} 
${emojis.mintable} *Token Renounced:* ${!data.mintable ? '✅' : '❌'} 
${emojis.freezeAble} *Freeze Account:* ${!data.freezeAble ? '✅' : '❌'} 

${emojis.baseLiquidity} *Liquidity:* ${Number(quoteLiquidity).toFixed(2)} SOL
 
*Top 10 Holders:* 
${holdersTxt} 
*More Details:*

${tokenJson.description}
        `;

        // Send the message
        bot.telegram.sendMessage(newburnsChannelId, formattedData,
            {
                reply_markup:  {
                    inline_keyboard: [
                      [{ text: '🍌 Banana', url: 'https://t.me/BananaGunSolana_bot?start=ref_astral'},
                      { text: '🦄 Unibot', url: 'https://t.me/solana_unibot?start=r-bitce0' }],
                      [{ text: '⚡ Insta-Buy with Bonkbot', url: `https://t.me/bonkbot_bot?start=ref_vd5bb_ca_${baseMint}`},
                      { text: '🪐 Solareum', url: 'https://t.me/solareum_bot?start=783d5d66' }],
                      [{ text: '🤖 SolTradingBot', url: 'https://t.me/SolanaTradingBot?start=XDQq2MvW5'}],
                    ],
                  },
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
            .then(() => {
                console.log('Message sent successfully');
            })
            .catch((error) => {
                console.error('Error sending message:', error);
            });



    }

    socket.on('error', (error) => {
        console.error('WebSocket error:', error.message);

    });
    socket.on('pong', () => {
        console.log('Received Pong response');

    });


}


