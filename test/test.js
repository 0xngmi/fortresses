const { expect } = require("chai");
const { ethers } = require("hardhat");
const abi=require('../scripts/abi.json')

const fortressesAddress = "0x0716d44d5991b15256A2de5769e1376D569Bba7C"
const fortressOwnerAddress = "0xcfCcCC914952809905fac589599e9B29cE518d09"
const fortressHash = "0xca4d591417b4cf6a4f86dd6be57b947058226994a3b2df6aca52b1177cd15572"

describe("Realms", function () {
  it("works", async function () {
    this.timeout(50000);
    const [newOwner] = await ethers.getSigners();
    const Realms = await hre.ethers.getContractFactory("Realms");
    const realms = await Realms.deploy();
    await realms.deployed();

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [fortressOwnerAddress],
    });
    const fortressOwner = await ethers.provider.getSigner(
      fortressOwnerAddress
    );

    await newOwner.sendTransaction({
      to: fortressOwner._address,
      value: ethers.utils.parseEther("10.0")
    }); // Send ETH for interactions

    const fortresses = new ethers.Contract(
      fortressesAddress,
      abi,
      fortressOwner
    )

    expect((await fortresses.getFortress(fortressHash))._owner).to.equal(fortressOwner._address, "fortress owned by previous owner");
    await realms.connect(fortressOwner).claimFortress(fortressHash);

    await expect(
      realms.connect(newOwner).claimFortress(fortressHash)
    ).to.be.revertedWith("not owner", "Non owner can't claim");

    await fortresses.transferFortress(fortressHash, realms.address);
    await realms.connect(fortressOwner).wrap(fortressHash);

    expect((await fortresses.getFortress(fortressHash))._owner).to.equal(realms.address, "fortress owned by wrapper");

    expect(await realms.tokenURI(fortressHash)).to.equal("ipfs://ipfs/QmQvNvcnCZ7Zg5rsveYTo1EcwKZAoinL7rvj6azUqatiKj/91503857434928107464933478837927996787282725948109873819531757145955849295218")

    await realms.connect(fortressOwner).transferFrom(fortressOwner._address, newOwner.address, fortressHash);

    await expect(
      realms.connect(fortressOwner).wrap(fortressHash)
    ).to.be.revertedWith("not claimed", "Can't wrap again");

    await realms.connect(newOwner).unwrap(fortressHash);

    expect((await fortresses.getFortress(fortressHash))._owner).to.equal(newOwner.address, "fortress owned by new owner");
  });
});