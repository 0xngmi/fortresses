
const fortressesAddress = "0x0716d44d5991b15256A2de5769e1376D569Bba7C"
const realmsAddress = "0x8479277AaCFF4663Aa4241085a7E27934A0b0840"

async function setup() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const signer = provider.getSigner()


    const abi = await fetch('../scripts/abi.json').then(abi => abi.json())
    const fortresses = new ethers.Contract(
        fortressesAddress,
        abi,
        signer
    )

    const realms = new ethers.Contract(
        realmsAddress,
        [
            "function claimFortress(bytes32 fortressHash) external",
            "function wrap(bytes32 fortressHash) external",
            "function unwrap(uint tokenId) external",
            "function claimed(bytes32) external returns (address)"
        ],
        signer
    )
    return { signer, fortresses, realms }
}

function write(text) {
    const output = document.getElementById("output")
    output.innerText = text
}

async function getHashes() {
    const { fortresses } = await setup()
    const address = prompt("Address")

    const eventFilter = fortresses.filters.LogFortressCreated()
    const events = await fortresses.queryFilter(eventFilter)

    const hashes = events.map(ev => ev.args.hash)
    const hashesOwned = (await Promise.all(hashes.map(h => fortresses.getFortress(h).then(f => f._owner === address ? h : null)))).filter(h => h !== null)
    write("you own" + JSON.stringify(hashesOwned))
}

async function claim() {
    const { realms } = await setup()
    const hash = prompt("Fortress hash")
    try {
        await realms.claimFortress(hash)
    } catch (e) { alert(e) }
}

async function wrap() {
    const { realms } = await setup()
    const hash = prompt("Fortress hash")
    try {
        await realms.wrap(hash)
    } catch (e) { alert(e) }
}

async function unwrap() {
    const { realms } = await setup()
    const hash = prompt("Fortress hash")
    try {
        await realms.unwrap(hash)
    } catch (e) { alert(e) }
}

async function transfer() {
    const { fortresses } = await setup()
    const hash = prompt("Fortress hash")
    const address = prompt("Your address")
    try {
        const claimed = await fortresses.claimed(hash)
        if(claimed !== address){
            throw new Error("You haven't claimed this castle yet")
        }
        await fortresses.transferFortress(hash, realmsAddress)
    } catch (e) { alert(e) }
}