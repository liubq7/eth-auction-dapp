import React, { Component } from "react";
import AuctionRepositoryContract from "./contracts/AuctionRepository.json";
import DeedRepositoryContract from "./contracts/DeedRepository.json";
import getWeb3 from "./getWeb3";
import ipfs from './ipfs';
import 'bootstrap/dist/css/bootstrap.css';

import "./App.css";
import Auction from "./components/Auction";

class App extends Component {
  state = {
    auctions: null,
    web3: null,
    accounts: null,
    auctionRepoContract: null,
    deedRepoContract: null,
    bidIncrement: null,
    startBlock: null,
    endBlock: null,
    deedId: null
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const auctionRepoDeployedNetwork = AuctionRepositoryContract.networks[networkId];
      const auctionRepoInstance = new web3.eth.Contract(
        AuctionRepositoryContract.abi,
        auctionRepoDeployedNetwork && auctionRepoDeployedNetwork.address
      );

      const deedRepoDeployedNetwork = DeedRepositoryContract.networks[networkId];
      const deedRepoInstance = new web3.eth.Contract(
        DeedRepositoryContract.abi,
        deedRepoDeployedNetwork && deedRepoDeployedNetwork.address
      );
      console.log(deedRepoInstance)

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, auctionRepoContract: auctionRepoInstance, deedRepoContract: deedRepoInstance });

      const response = await auctionRepoInstance.methods.getAuctions().call();
      this.setState({ auctions: response });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  onClickRegisterDeed = async () => {
    const { accounts, deedRepoContract } = this.state;
    await deedRepoContract.methods.registerDeed().send({from: accounts[0]});
    const id = await deedRepoContract.methods.getDeedId().call();
    this.setState({deedId: id})
  }

  onClickTransferDeed = async () => {
    const { accounts, deedRepoContract, auctionRepoContract, deedId } = this.state;
    await deedRepoContract.methods.transferFrom(accounts[0], auctionRepoContract._address, deedId).send({from: accounts[0]})
  }

  onClickCreateAuction = async (event) => {
    event.preventDefault();
    const { accounts, auctionRepoContract, bidIncrement, startBlock, endBlock, deedRepoContract, deedId } =
      this.state;
    ipfs.files.add(this.state.buffer, async (error, result) => {
      if(error) {
        console.error(error)
        return
      }
      auctionRepoContract.methods
      .createAuction(bidIncrement, startBlock, endBlock, result[0].hash, deedRepoContract._address, deedId)
      .send({ from: accounts[0] }).then(async (r) => {
        const response = await auctionRepoContract.methods.getAuctions().call();
        return this.setState({ auctions: response });
      })
    })
  };

  handleChange = (event) => {
    const name = event.target.name;
    this.setState({ [name]: event.target.value });
  };

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      // console.log('buffer', this.state.buffer)
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div>
        {this.state.auctions == null ? null : (
          <div className="App">
            <h2>Account: {this.state.accounts[0]}</h2>

            <button className="btn btn-primary" onClick={this.onClickRegisterDeed}>register deed</button>
            {this.state.deedId == null ? null : (
              <div>
            <p>your deed id is: {this.state.deedId}</p>

            <button className="btn btn-primary" onClick={this.onClickTransferDeed}>transfer ownership</button>

            <form onSubmit={this.onClickCreateAuction} className="m-3">
              <div>
                <label htmlFor="bidIncrement">bidIncrement: </label>
                <input
                  type="text"
                  name="bidIncrement"
                  id="bidIncrement"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="startBlock">startBlock: </label>
                <input
                  type="text"
                  name="startBlock"
                  id="startBlock"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="endBlock">endBlock: </label>
                <input
                  type="text"
                  name="endBlock"
                  id="endBlock"
                  onChange={this.handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="photo">photo: </label>
                <input
                  type="file"
                  name="photo"
                  id="photo"
                  onChange={this.captureFile}
                  required
                />
              </div>
              <div>
                <input type="submit" value="Create Auction" />
              </div>
            </form>
            </div>
            )}

            <h4>The total number of auctions: {this.state.auctions.length}</h4>

            <div>
              {this.state.auctions.map((auction, i) => (
                <Auction key={i} contract={this.state.auctionRepoContract} id={i} account={this.state.accounts[0]} web3={this.state.web3} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
