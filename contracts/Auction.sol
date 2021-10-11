// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "./DeedRepository.sol";

contract Auction {
    // using Math for uint256;

    // static
    address public owner;
    uint256 public startBlock;
    uint256 public endBlock;
    string public ipfsHash;
    uint256 public bidIncrement;
    address public deedRepositoryAddress;
    uint256 public deedId;

    // state
    bool public canceled;
    address public highestBidder;
    mapping(address => uint256) public fundsByBidder;
    uint256 public highestBindingBid;
    bool public ownerHasWithdrawn;

    event LogBid(
        address bidder,
        uint256 bid,
        address highestBidder,
        uint256 highestBid,
        uint256 highestBindingBid
    );

    event LogWithdrawal(
        address withdrawer,
        address withdrawalAccount,
        uint256 amount
    );

    event LogCanceled();

    constructor(
        address _owner,
        uint256 _bidIncrement,
        uint256 _startBlock,
        uint256 _endBlock,
        string memory _ipfsHash,
        address _deedRepositoryAddress,
        uint256 _deedId
    ) {
        require(_startBlock < _endBlock);
        require(_startBlock >= block.number);
        require(_owner != address(0));

        owner = _owner;
        bidIncrement = _bidIncrement;
        startBlock = _startBlock;
        endBlock = _endBlock;
        ipfsHash = _ipfsHash;
        deedRepositoryAddress = _deedRepositoryAddress;
        deedId = _deedId;
    }

    modifier onlyAfterStart() {
        require(block.number >= startBlock);
        _;
    }

    modifier onlyBeforeEnd() {
        require(block.number < endBlock);
        _;
    }

    modifier onlyNotCanceled() {
        require(!canceled);
        _;
    }

    modifier onlyNotOwner(address _origin) {
        require(_origin != owner);
        _;
    }

    function placeBid(address _origin)
        payable
        public
        onlyAfterStart
        onlyBeforeEnd
        onlyNotCanceled
        onlyNotOwner(_origin)
        returns (bool)
    {
        uint newBid = fundsByBidder[_origin] + msg.value;
        require(newBid > highestBindingBid);

        uint highestBid = fundsByBidder[highestBidder];
        fundsByBidder[_origin] = newBid;

        if (newBid <= highestBid) {
            highestBindingBid = Math.min(newBid + bidIncrement, highestBid);
        } else {
            if (_origin != highestBidder) {
                highestBidder = _origin;
                highestBindingBid = Math.min(newBid, highestBid + bidIncrement);
            }
            highestBid = newBid;
        }

        emit LogBid(_origin, newBid, highestBidder, highestBid, highestBindingBid);
        return true;
    }

    function withdraw(address _origin) public returns (bool) {
        require(block.number >= endBlock || canceled);

        address withdrawalAccount;
        uint withdrawalAmount;

        if (canceled) {
            withdrawalAccount = _origin;
            withdrawalAmount = fundsByBidder[withdrawalAccount];
        } else {
            if (_origin == owner) {
                withdrawalAccount = highestBidder;
                withdrawalAmount = highestBindingBid;
                ownerHasWithdrawn = true;
            } else if (_origin == highestBidder) {
                withdrawalAccount = highestBidder;
                if (ownerHasWithdrawn) {
                    withdrawalAmount = fundsByBidder[highestBidder];
                } else {
                    withdrawalAmount = fundsByBidder[highestBidder] - highestBindingBid;
                }
            } else {
                withdrawalAccount = _origin;
                withdrawalAmount = fundsByBidder[withdrawalAccount];
            }
        }

        require(withdrawalAmount > 0);

        fundsByBidder[withdrawalAccount] -= withdrawalAmount;
        payable(_origin).transfer(withdrawalAmount);

        emit LogWithdrawal(_origin, withdrawalAccount, withdrawalAmount);
        return true;
    }

    modifier onlyOwner(address _origin) {
        require(_origin == owner);
        _;
    }

    function cancelAuction(address _origin) public onlyOwner(_origin) onlyBeforeEnd onlyNotCanceled returns (bool) {
        canceled = true;
        emit LogCanceled();
        return true;
    }
}
