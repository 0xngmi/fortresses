const { ethers } = require("hardhat");
const abi = require('./abi.json')
const fs = require('fs')

const fortressesAddress = "0x0716d44d5991b15256A2de5769e1376D569Bba7C"

async function main() {
    const [signer] = await ethers.getSigners();

    const fortresses = new ethers.Contract(
        fortressesAddress,
        abi,
        signer
    )

    const eventFilter = fortresses.filters.LogFortressCreated()
    const events = await fortresses.queryFilter(eventFilter)

    console.log(events.length)

    events.forEach(ev=>{
        const filename = "files/"+BigInt(ev.args.hash).toString();
        const name = `Fortress (${ev.args.x.toString()}, ${ev.args.y.toString()})`
        fs.writeFileSync(filename, 
            JSON.stringify({
                name,
                "description": `Realms of Ether is a game based on the Ethereum blockchain. Players can own fortresses, farm resources, create buildings and recruit troops.

Date of launch : December 2017
https://realms-of-ether.github.io/`,
                "image": "ipfs://ipfs/QmcsMpjAQutTXsRvXyWihbtmLsXKkGHPNn2Zzfr5XHk6kM",
                "attributes": []
            })
        )
    })
}

main()
  .then(() => process.exit(0))