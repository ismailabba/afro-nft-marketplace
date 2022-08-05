const { expect } = require("chai")
const { ethers } = require("hardhat")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("AfroNFTMarketplace", function() {
    let deployer, addr1, addr2, nft, marketplace
    let feePercent = 1;
    let URI = "Sample URI"
    beforeEach(async function(){
        
        const NFT = await ethers.getContractFactory("NFT");
        const Marketplace = await ethers.getContractFactory("Marketplace");
    
    
        //get signers
        [deployer, addr1, addr2] = await ethers.getSigners();
    
        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent);
    });

    describe("deployment", function(){
        it("Should track name and symbol of the  nft collection", async function() {
            expect(await nft.name()).to.equal("Afro NFT")
            expect(await nft.symbol()).to.equal("AFRO")

        });
        it("Should track feeAccount and feepercent of the marketPlace", async function() {
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect(await marketplace.feePercent()).to.equal(feePercent)

        });
    })
    describe("minting NFTs", function () {
        it("it should track each minted NFT.", async function(){
            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);

            await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);

        })
    })
    

    describe("Making marketplace items", function () {
        beforeEach(async function(){
             //addr1 mints an nft
             await nft.connect(addr1).mint(URI)
             //addr1 approves marketplace to spend nft
             await nft.connect(addr1).setApprovalForAll(marketplace.address, true)
        })
        it("it should track newly created iten, transfer NFT from seller to marketplace and emit offered event", async function() {
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, toWei(1)))
              .to.emit(marketplace, "Offered")
              .withArgs(1,nft.address,1,toWei(1), addr1.address)

              //owner of NFT should now be the marketplace
              expect(await nft.ownerOf(1)).to.equal(marketplace.address);

              //item count should equal 1
              expect(await marketplace.itemCount()).to.equal(1)

              //get iten from items mappping then check fields to ensure they re correct
              const item = await marketplace.items(1);
              expect(item.itemId).to.equal(1);
              expect(item.nft).to.equal(nft.address);
              expect(item.tokenId).to.equal(1);
              expect(item.price).to.equal(toWei(1));
              expect(item.sold).to.equal(false);


        });


        it("it shiuld fail if price is set to zero", async function() {
            await expect(marketplace.connect(addr1).makeItem(nft.address, 1, 0)).to.be.revertedWith("Price must be greater than zero")
        })
    });
 
})