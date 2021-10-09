const AuctionRepository = artifacts.require("./AuctionRepository.sol");

contract('AuctionRepository', (accounts) => {
  before(async () => {
    this.auctionRepository = await AuctionRepository.deployed();
  })

  it('deploys successfully', async () => {
    const address = await this.auctionRepository.address
    assert.notEqual(address, 0x0)
    assert.notEqual(address, '')
    assert.notEqual(address, null)
    assert.notEqual(address, undefined)
  })

  it('creates auctions', async () => {
    const result = await this.auctionRepository.createAuction(5, 8, 600, "ipfs")
    const event = result.logs[0].args
    assert.equal(event.numAuctions, 1);
    assert.equal(event.owner, '0xC06a9C14F3E688411e03f07bfD6f5C5BA6830672')

    const owner = await this.auctionRepository.getOwner(0)
    assert.equal(owner, '0xC06a9C14F3E688411e03f07bfD6f5C5BA6830672')
    const startBlock = await this.auctionRepository.getStartBlock(0)
    assert.equal(startBlock, 8)
    const endBlock = await this.auctionRepository.getEndBlock(0)
    assert.equal(endBlock, 600)
    const ipfsHash = await this.auctionRepository.getIpfsHash(0)
    assert.equal(ipfsHash, "ipfs")
    const bidIncrement = await this.auctionRepository.getBidIncrement(0)
    assert.equal(bidIncrement, 5)
    const canceled = await this.auctionRepository.getCanceled(0)
    assert.equal(canceled, false)
    const highestBidder = await this.auctionRepository.getHighestBidder(0)
    assert.equal(highestBidder, '0x0000000000000000000000000000000000000000')
    const highestBindingBid = await this.auctionRepository.getHighestBindingBid(0)
    assert.equal(highestBindingBid, 0)

    const result2 = await this.auctionRepository.createAuction(10, 50, 600, "ipfsHash")
    const event2 = result2.logs[0].args
    assert.equal(event2.numAuctions, 2);
    assert.equal(event2.owner, '0xC06a9C14F3E688411e03f07bfD6f5C5BA6830672')
  })

  it('places bids', async () => {
    await this.auctionRepository.placeBid(0, {from: accounts[1], value: 10})
    let highestBidder = await this.auctionRepository.getHighestBidder(0)
    assert.equal(highestBidder, '0xE5D763520226F07CB7E94BAbd49875Cc8ADfd7d1')
    let highestBindingBid = await this.auctionRepository.getHighestBindingBid(0)
    assert.equal(highestBindingBid, 5)

    await this.auctionRepository.placeBid(0, {from: accounts[2], value: 30})
    highestBidder = await this.auctionRepository.getHighestBidder(0)
    assert.equal(highestBidder, '0x7e098CB6095f87499445b1F52F79c159fC8b1795')
    highestBindingBid = await this.auctionRepository.getHighestBindingBid(0)
    assert.equal(highestBindingBid, 15)

    await this.auctionRepository.placeBid(0, {from: accounts[3], value: 17})
    highestBidder = await this.auctionRepository.getHighestBidder(0)
    assert.equal(highestBidder, '0x7e098CB6095f87499445b1F52F79c159fC8b1795')
    highestBindingBid = await this.auctionRepository.getHighestBindingBid(0)
    assert.equal(highestBindingBid, 22)
  })

  it('cancels auctions', async () => {
    await this.auctionRepository.cancelAuction(1);
    const canceled = await this.auctionRepository.getCanceled(1)
    assert.equal(canceled, true)
  })

})