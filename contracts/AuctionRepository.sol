// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

import {Auction} from "./Auction.sol";

contract AuctionRepository {
    Auction[] public auctions;

    event AuctionCreated(address owner, uint256 numAuctions);

    function createAuction(
        uint256 _bidIncrement,
        uint256 _startBlock,
        uint256 _endBlock,
        string memory _ipfsHash
    ) public {
        Auction newAuction = new Auction(
            msg.sender,
            _bidIncrement,
            _startBlock,
            _endBlock,
            _ipfsHash
        );
        auctions.push(newAuction);

        emit AuctionCreated(msg.sender, auctions.length);
    }

    function getAuctions() public view returns (Auction[] memory) {
        return auctions;
    }

    function getOwner(uint _i) public view returns (address) {
        return auctions[_i].owner();
    }

    function getStartBlock(uint _i) public view returns (uint256) {
        return auctions[_i].startBlock();
    }

    function getEndBlock(uint _i) public view returns (uint256) {
        return auctions[_i].endBlock();
    }

    function getIpfsHash(uint _i) public view returns (string memory) {
        return auctions[_i].ipfsHash();
    }

    function getBidIncrement(uint _i) public view returns (uint256) {
        return auctions[_i].bidIncrement();
    }

    function getCanceled(uint _i) public view returns (bool) {
        return auctions[_i].canceled();
    }

    function getHighestBidder(uint _i) public view returns (address) {
        return auctions[_i].highestBidder();
    }

    function getHighestBindingBid(uint _i) public view returns (uint256) {
        return auctions[_i].highestBindingBid();
    }

    function placeBid(uint _i) public payable returns (bool) {
        return auctions[_i].placeBid{value:msg.value}(msg.sender);
    }

    function withdraw(uint _i) public returns (bool) {
        return auctions[_i].withdraw(msg.sender);
    }

    function cancelAuction(uint _i) public returns (bool) {
        return auctions[_i].cancelAuction(msg.sender);
    }
}
