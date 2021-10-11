// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DeedRepository is ERC721 {
    uint256 public deedNum;

    event DeedRegistered(address by, uint256 tokenId);

    constructor() ERC721("DeedRepository", "DEEDREPO") {
    }

    function registerDeed() public {
        uint _deedId = deedNum++;
        _mint(msg.sender, _deedId);
        emit DeedRegistered(msg.sender, _deedId);
    }

    function getDeedId() public view returns (uint256) {
        return deedNum - 1;
    }
}