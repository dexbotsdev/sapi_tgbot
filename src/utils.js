
import { RAYDIUM, connection, connection as web3con } from './config.js';
import { PublicKey } from '@solana/web3.js';

const knownAccounts = JSON.parse('{"5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1":{"name":"Raydium AMM","type":"AMM"},"CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK":{"name":"Raydium CLAMM","type":"AMM"},"CPK8fQYShAmERZmysQRAGWPvV5qs3AvazQsiR9ctC6ED":{"name":"Raydium CLAMM LP","type":"AMM"},"whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc":{"name":"Orca Whirlpool","type":"AMM"},"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v":{"name":"USDC","type":"token"},"USDH1SM1ojwWUga67PGrgFWUHibbjqMvuMaDkRJTgkX":{"name":"USDH","type":"token"},"So11111111111111111111111111111111111111112":{"name":"SOL","type":"token"},"4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R":{"name":"Raydium","type":"token"},"beamazjPnFT3JQoe16HjUxkpmHFfsHY6dTqf3VwBXzq":{"name":"FluxBeam LP","type":"AMM"},"USRfPB8M8pfbrFnEt3FDf3Y8ZmU4G17wcRsWBUK416m":{"name":"FluxBot User Rewards","type":"AMM"},"RESWbt45deYa8F7mQ53pGGJ3XECYC15EGK7cM738mrN":{"name":"FluxBot Reserves","type":"AMM"}}')


export const shorten = (str) => {
    if (str.length < 10) return str;
    return `${str.slice(0, 6)}...${str.slice(str.length - 4)}`;
  };

export const checkTokenHolders = async (token, lpMint) => {

    const holders = await connection.getTokenLargestAccounts(new PublicKey(token), "confirmed")

    const topHolders = holders.value
    const holderKeys = [];

    topHolders.forEach((h) => holderKeys.push(h.address))
    const accountInfo = await connection.getMultipleParsedAccounts(holderKeys, {
        dataSlice: { offset: 0, length: 10 }
    })


    const total_supplyObj = await connection.getTokenSupply(new PublicKey(token))
    const holderData = [];
    const total_supply = total_supplyObj.value.uiAmount;

    if (accountInfo) {

        accountInfo.value.forEach((accountx) => {



            if (accountx !=null) {
                const account = JSON.parse(JSON.stringify(accountx));
                console.log(JSON.stringify(account,null,2));

                const holderVal = Number(account.data?.parsed?.info?.tokenAmount.uiAmount);
                const holder = account.data?.parsed?.info?.owner;
                const holderPct = 100 * holderVal / total_supply;
                const known = knownAccounts[holder]

                if (known && known.type == 'AMM') {
                    holderData.push({
                        holder: known.name,
                        holderPercentage: holderPct
                    })
                } else {
                    holderData.push({
                        holder: holder,
                        holderPercentage: holderPct
                    })
                }
            }
        })
    }

    console.log(holderData);

    return holderData;
}