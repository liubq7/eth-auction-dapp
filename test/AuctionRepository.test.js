const AuctionRepository = artifacts.require("./AuctionRepository.sol");
const DeedRepository = artifacts.require("./DeedRepository.sol");

const account0 = "0x32f7F4F67B44Bd47A176f3bc7528359e35d4A0F8";
const account1 = "0xC1dAe114B3d4FF38E530C638183113184FcDe06f";
const account2 = "0x835F53ECc165bbD70C138fF3022341c77De414Ab";

contract("AuctionRepository", (accounts) => {
  let auctionRepository, deedRepository;
  before(async () => {
    auctionRepository = await AuctionRepository.deployed();
    deedRepository = await DeedRepository.deployed();
  });

  describe("deployment", async () => {
    it("deploys successfully", async () => {
      const auctionRepoAddress = await auctionRepository.address;
      assert.notEqual(auctionRepoAddress, 0x0);
      assert.notEqual(auctionRepoAddress, "");
      assert.notEqual(auctionRepoAddress, null);
      assert.notEqual(auctionRepoAddress, undefined);

      const deedRepoAddress = await deedRepository.address;
      assert.notEqual(deedRepoAddress, 0x0);
      assert.notEqual(deedRepoAddress, "");
      assert.notEqual(deedRepoAddress, null);
      assert.notEqual(deedRepoAddress, undefined);
    });

    it("deed repo has a name", async () => {
      const name = await deedRepository.name();
      assert.equal(name, "DeedRepository");
    });

    it("deed repo has a symbol", async () => {
      const symbol = await deedRepository.symbol();
      assert.equal(symbol, "DEEDREPO");
    });
  });

  describe("mint", async () => {
    it("registers deed", async () => {
      const result = await deedRepository.registerDeed();
      const event = result.logs[0].args;
      assert.equal(event.to, account0);
      assert.equal(event.tokenId, 0);

      await deedRepository.registerDeed();
      const deedId = await deedRepository.getDeedId();
      assert.equal(deedId, 1);
    });
  });

  describe("auction creation", async () => {
    it("tranfers ownership", async () => {
      let owner = await deedRepository.ownerOf(0);
      assert(owner, account0);

      await deedRepository.transferFrom(account0, auctionRepository.address, 0);
      owner = await deedRepository.ownerOf(0);
      assert.equal(owner, auctionRepository.address);
    });

    it("creates auctions", async () => {
      const result = await auctionRepository.createAuction(
        5,
        8,
        600,
        "ipfs",
        deedRepository.address,
        0
      );
      const event = result.logs[0].args;
      assert.equal(event.numAuctions, 1);
      assert.equal(event.owner, account0);

      const owner = await auctionRepository.getOwner(0);
      assert.equal(owner, account0);
      const startBlock = await auctionRepository.getStartBlock(0);
      assert.equal(startBlock, 8);
      const endBlock = await auctionRepository.getEndBlock(0);
      assert.equal(endBlock, 600);
      const ipfsHash = await auctionRepository.getIpfsHash(0);
      assert.equal(ipfsHash, "ipfs");
      const bidIncrement = await auctionRepository.getBidIncrement(0);
      assert.equal(bidIncrement, 5);
      const canceled = await auctionRepository.getCanceled(0);
      assert.equal(canceled, false);
      const highestBidder = await auctionRepository.getHighestBidder(0);
      assert.equal(highestBidder, "0x0000000000000000000000000000000000000000");
      const highestBindingBid = await auctionRepository.getHighestBindingBid(0);
      assert.equal(highestBindingBid, 0);

      await deedRepository.transferFrom(account0, auctionRepository.address, 1);
      const result2 = await auctionRepository.createAuction(
        10,
        50,
        600,
        "ipfsHash",
        deedRepository.address,
        1
      );
      const event2 = result2.logs[0].args;
      assert.equal(event2.numAuctions, 2);
      assert.equal(event2.owner, account0);
    });
  });

  describe("bid placement", async () => {
    it("places bids", async () => {
      await auctionRepository.placeBid(0, {
        from: accounts[1],
        value: 10,
      });
      let highestBidder = await auctionRepository.getHighestBidder(0);
      assert.equal(highestBidder, account1);
      let highestBindingBid = await auctionRepository.getHighestBindingBid(0);
      assert.equal(highestBindingBid, 5);

      await auctionRepository.placeBid(0, {
        from: accounts[2],
        value: 30,
      });
      highestBidder = await auctionRepository.getHighestBidder(0);
      assert.equal(highestBidder, account2);
      highestBindingBid = await auctionRepository.getHighestBindingBid(0);
      assert.equal(highestBindingBid, 15);

      await auctionRepository.placeBid(0, {
        from: accounts[3],
        value: 17,
      });
      highestBidder = await auctionRepository.getHighestBidder(0);
      assert.equal(highestBidder, account2);
      highestBindingBid = await auctionRepository.getHighestBindingBid(0);
      assert.equal(highestBindingBid, 22);
    });
  });

  describe("cancel", async () => {
    it("cancels auctions", async () => {
      await auctionRepository.cancelAuction(1);
      const canceled = await auctionRepository.getCanceled(1);
      assert.equal(canceled, true);

      const owner = await deedRepository.ownerOf(1);
      assert(owner, account0);
    });
  });
});
