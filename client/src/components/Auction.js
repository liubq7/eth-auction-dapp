import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";

const Auction = (props) => {
  const { contract, id, account, web3 } = props;

  const [owner, setOwner] = useState();
  const [startBlock, setStartBlock] = useState();
  const [endBlock, setEndBlock] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [bidIncrement, setBidIncrement] = useState();

  const [canceled, setCanceled] = useState();
  const [highestBidder, setHighestBidder] = useState();
  const [highestBindingBid, setHighestBindingBid] = useState();

  const [bid, setBid] = useState();

  useEffect(() => {
    const getInfo = async () => {
      const owner = await contract.methods.getOwner(id).call();
      setOwner(owner);
      const startBlock = await contract.methods.getStartBlock(id).call();
      setStartBlock(startBlock);
      const endBlock = await contract.methods.getEndBlock(id).call();
      setEndBlock(endBlock);
      const ipfsHash = await contract.methods.getIpfsHash(id).call();
      setIpfsHash(ipfsHash);
      const bidIncrement = await contract.methods.getBidIncrement(id).call();
      setBidIncrement(bidIncrement);

      const canceled = await contract.methods.getCanceled(id).call();
      setCanceled(canceled);
      const highestBidder = await contract.methods.getHighestBidder(id).call();
      setHighestBidder(highestBidder);
      const highestBindingBid = await contract.methods
        .getHighestBindingBid(id)
        .call();
      setHighestBindingBid(highestBindingBid);
    };

    getInfo();
  }, []);

  const onClickPlaceBid = async () => {
    await contract.methods.placeBid(id).send({ from: account, value: web3.utils.toWei(bid, "ether") });
  }

  const onClickWithdraw = async () => {
    await contract.methods.withdraw(id).send({from: account});
  }

  const onClickCancel = async () => {
    await contract.methods.cancelAuction(id).send({from: account});
  }

  const bidChange = (event) => {
    event.preventDefault();
    setBid(event.target.value);
  }

  return (
    <div className="row border border-5 m-3">
      <div className="col">
        {ipfsHash == null ? (
          <p>loading photo...</p>
        ) : (
          <img src={`https://ipfs.io/ipfs/${ipfsHash}`} alt="" />
        )}
        {canceled ? <p>CANCELED</p> : null}
      </div>
      <div className="col">
        <p>owner: {owner}</p>
        <p>startBlock: {startBlock}</p>
        <p>endBlock: {endBlock}</p>
        <p>bidIncrement: {bidIncrement}</p>
        <p>highestBidder: {highestBidder}</p>
        <p>highestBindingBid: {highestBindingBid}</p>
      </div>
      <div className="col">
        <form onSubmit={onClickPlaceBid}>
          <input type="text" onChange={bidChange} required />
          <input type="submit" value="placeBid" />
        </form>
        <button onClick={onClickWithdraw}>withdraw</button>
        <button onClick={onClickCancel}>cancel auction</button>
      </div>
    </div>
  );
};

export default Auction;
