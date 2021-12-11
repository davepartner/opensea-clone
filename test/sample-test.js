const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute market sales", async function () {
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed(); //deploy the NFTMarket contract
    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed(); //deploy the NFT contract
    const nftContractAddress = nft.address;

    //get the listing price
    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    //set an auction price
    const auctionPrice = ethers.utils.parseUnits("100", "ether");

    //create 2 test tokens
    await nft.createToken("https://www.mytokenlocation.com");
    await nft.createToken("https://www.mytokenlocation2.com");

    //create 2 test nfts
    await market.createMarketItem(nftContractAddress, 1, auctionPrice,
      {value: listingPrice} );

    await market.createMarketItem(nftContractAddress, 2, auctionPrice,
         {value: listingPrice} );

    const [_, buyerAddress ] = await ethers.getSigners();

    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1,
       {value: auctionPrice});

       //fetch market items
       let items = await market.fetchMarketItems();

        items = await Promise.all(items.map(async i => {
         const tokenUri = await nft.tokenURI(i.tokenId);

         let item = {
           price: i.price.toString(),
           tokenId: i.tokenId.toString(),
           seller: i.seller,
           owner: i.owner,
           tokenUri
         }
         return item;
        }));

       console.log('items: ', items);


  });
});
