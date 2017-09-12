const Block = require('./block');

class Blockchain {

  constructor(name) {
    console.log("New blockchain called " + name);

    this.init();
  }

  init() {
    this.blocks = [];
    // Create the genesis block if the blockchain is empty
    if (this.blocks.length == 0) {
      console.info('Blockchain empty, adding genesis block');
      this.blocks.push(Block.genesis);
      //this.blocksDb.write(this.blocks);
    }

    // Remove transactions that are in the blockchain
    //console.info('Removing transactions that are in the blockchain');
    //R.forEach(this.removeBlockTransactionsFromTransactions.bind(this), this.blocks);
  }

  getAllBlocks() {
    return this.blocks;
  }
}

module.exports = Blockchain;
