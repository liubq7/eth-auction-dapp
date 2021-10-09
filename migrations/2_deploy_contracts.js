var AuctionRepository = artifacts.require("./AuctionRepository.sol");

module.exports = function(deployer) {
  deployer.deploy(AuctionRepository);
};
