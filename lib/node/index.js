const Block = require('../blockchain/block');
const Blocks = require('../blockchain/blocks');
const R = require('ramda');

class Node {
  constructor(host, port, peers, blockchain) {
    this.host = host;
    this.port = port;
    this.peers = [];
    this.blockchain = blockchain;
    // this.hookBlockchain();
    // this.connectToPeers(peers);
  }

  checkReceivedBlock(block) {
    return this.checkReceivedBlocks([block]);
  }

  checkReceivedBlocks(blocks) {
    const receivedBlocks = blocks.sort((b1, b2) => (b1.index - b2.index));
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    const latestBlockHeld = this.blockchain.getLastBlock();

    // If the received blockchain is not longer than blockchain. Do nothing.
    if (latestBlockReceived.index <= latestBlockHeld.index) {
      console.info('Received blockchain is not longer than blockchain. Do nothing');
      return false;
    }

    console.info(`Blockchain possibly behind. We got: ${latestBlockHeld.index}, Peer got: ${latestBlockReceived.index}`);
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) { // We can append the received block to our chain
      console.info('Appending received block to our chain');
      this.blockchain.addBlock(latestBlockReceived);
      return true;
    } else {
      console.info('This blockchain is different to ours!');
    }//else if (receivedBlocks.length === 1) { // We have to query the chain from our peer
    //   console.info('Querying chain from our peers');
    //   this.broadcast(this.getBlocks);
    //   return null;
    // } else { // Received blockchain is longer than current blockchain
    //   console.info('Received blockchain is longer than current blockchain');
    //   this.blockchain.replaceChain(receivedBlocks);
    //   return true;
    // }
  }
}

module.exports = Node;
