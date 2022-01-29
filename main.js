import { Intents, Client } from 'discord.js';
const bot = new Client({ intents: ["GUILDS", "GUILD_MESSAGES"] })
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import anchor from '@project-serum/anchor';
import getSite from './helpers.js';
import { Program } from "@project-serum/anchor";
import dotenv from 'dotenv';

dotenv.config();
const prefix = "$";


const candyMachineProgramID = new anchor.web3.PublicKey(
    'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ',
);




bot.on("ready", () => {
    console.log("Bot ready!");
});

bot.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
    try {
        if (command === 'info') {
            let check = async function() {
                try {
                    const candyMachineIdString = args[0]
                    if (!candyMachineIdString.length > 1) {
                        message.reply('Invalid CMID!');
                    }
                    const candyMachineId = new anchor.web3.PublicKey(candyMachineIdString);
                    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl('mainnet-beta')); //rpcUrl
                    const provider = new anchor.Provider(connection, {
                        preflightCommitment: 'recent',
                    });
                    let idl = await anchor.Program.fetchIdl(candyMachineProgramID, provider);
                    const candyMachineProgram = new Program(idl, candyMachineProgramID, provider);
                    const candyMachine = await candyMachineProgram.account.candyMachine.fetch(candyMachineId);
                    if (candyMachine.error) {
                        console.log("error")
                    };
                    const itemsAvailable = candyMachine.data.itemsAvailable.toNumber();
                    const itemsRedeemed = candyMachine.itemsRedeemed.toNumber();
                    const price = candyMachine.data.price.toNumber() / LAMPORTS_PER_SOL + " SOL";
                    const goLiveDate = candyMachine.data.goLiveDate.toNumber();
                    message.channel.send(`Found a CMID!\nMint price: ${price}\nTotal supply: ${itemsRedeemed}/${itemsAvailable}\nDrop time: <t:${goLiveDate}>`)
                } catch (e) {
                    message.channel.send(`${e.message}`)
                }
            }
            check()
        }

        if (command === 'scrape') {
            let getCandyID = async function () {
                try {
                    const site = args[0];
                    if (!site > 1) {
                        message.reply('Invalid URL');
                    }
                    const candyID = await getSite(site);
                    if (candyID !== "Cannot find a CMID!") {
                        message.channel.send(`\nFound a CMID!\nCMID: ${candyID}`);
                    } else {
                        message.channel.send(`\nNo CMID found!`);
                    }
                } catch (e) {
                    message.channel.send("Error finding a CMID!");
                }
            }
            getCandyID();
        }
    } catch (e) {
        console.log(e.message)
    }

});

bot.login(process.env.BOT_TOKEN);