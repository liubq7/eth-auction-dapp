# Ethereum Auction DApp
This project aims to implement a basic auction platform on Ethereum which allows a user to register tokens, create auctions, bid by ETH, and withdraw funds.

To create an auction, the user should first register an ERC721 non-fungible deed token which represents some unique asset. Then transfer the ownership of the token to the Auction DApp, allowing it to be listed for sale. After that, other users can place bids or withdraw funds during the valid time. The highest bidder would get the ownership of the deed token, and the owner can get an amount of ETH equal to the highest binding bid. If the owner cancels the auction before it ends, the deed token ownership will transfer back to the owner.
<p align="center"><img src ="https://raw.githubusercontent.com/ethereumbook/ethereumbook/develop/images/auction_diagram.png" width = "70%"></p>

The application is decentralized on:
* Smart contracts for business logic  
* P2P storage on IPFS for storing and distributing auction items’ pictures

## Getting Started
### Prerequisites
* Node.js
* Solidity Compiler
* Truffle
* Ganache
* Metamask
* Infura

### Running
1. Clone the repo and install dependencies  
    ```
    git clone git@github.com:liubq7/eth-auction-dapp.git
    cd eth-auction-dapp
    npm install
    cd client
    npm install
    ```
1. Start local blockchain, make sure TestRPC is running on port that is coresponding to `truffle-config.js`  
    ```
    ganache-cli
    ```
1. Complie and deploy smart contract   
    ```
    truffle migrate
    ```
1. Configure Metamask  
    * Connect metamask to your local Etherum blockchain provided by Ganache
    * Import an account provided by ganache
1. Run the front end application, the app will be available at http://localhost:3000  
    ```
    cd client
    npm run start
    ```

## Deployment
1. Access network via public node service Infura
1. Update `truffle-config.js` with a new connection to the network
1. Depoly to the network
    ```
    truffle migrate --network <name>
    ```
