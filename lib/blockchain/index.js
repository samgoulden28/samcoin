const Block = require('./block');
const R = require('ramda');

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

  getBlockByIndex(index) {
      return R.find(R.propEq('index', index), this.blocks);
  }

  getBlockByHash(hash) {
      return R.find(R.propEq('hash', hash), this.blocks);
  }

  getLastBlock() {
      return R.last(this.blocks);
  }

  //addBlock(newBlock, emit = true) {
  addBlock(newBlock) {
      // It only adds the block if it's valid (we need to compare to the previous one)
      if (this.checkBlock(newBlock, this.getLastBlock())) {
          this.blocks.push(newBlock);
          //this.blocksDb.write(this.blocks);

          // After adding the block it removes the transactions of this block from the list of pending transactions
          //this.removeBlockTransactionsFromTransactions(newBlock);

          console.log(`Block added: ${newBlock.hash}`);
          console.log(`Block added: ${JSON.stringify(newBlock)}`);
          //if (emit) this.emitter.emit('blockAdded', newBlock);

          return newBlock;
      }
  }

  checkBlock(newBlock, previousBlock) {
      const blockHash = newBlock.toHash();

      if (previousBlock.index + 1 !== newBlock.index) { // Check if the block is the last one
          console.error(`Invalid index: expected '${previousBlock.index + 1}' got '${newBlock.index}'`);
          //throw new BlockAssertionError(`Invalid index: expected '${previousBlock.index + 1}' got '${newBlock.index}'`);
      } else if (previousBlock.hash !== newBlock.previousHash) { // Check if the previous block is correct
          console.error(`Invalid previoushash: expected '${previousBlock.hash}' got '${newBlock.previousHash}'`);
          //throw new BlockAssertionError(`Invalid previoushash: expected '${previousBlock.hash}' got '${newBlock.previousHash}'`);
      } else if (blockHash !== newBlock.hash) { // Check if the hash is correct
          console.error(`Invalid hash: expected '${blockHash}' got '${newBlock.hash}'`);
          //throw new BlockAssertionError(`Invalid hash: expected '${blockHash}' got '${newBlock.hash}'`);
      } //else if (newBlock.getDifficulty() >= this.getDifficulty(newBlock.index)) { // If the difficulty level of the proof-of-work challenge is correct
      //     console.error(`Invalid proof-of-work difficulty: expected '${newBlock.getDifficulty()}' to be smaller than '${this.getDifficulty(newBlock.index)}'`);
      //     throw new BlockAssertionError(`Invalid proof-of-work difficulty: expected '${newBlock.getDifficulty()}' be smaller than '${this.getDifficulty()}'`);
      // }

      // For each transaction in this block, check if it is valid
      // R.forEach(this.checkTransaction.bind(this), newBlock.transactions);
      //
      // // Check if the sum of output transactions are equal the sum of input transactions + 50 bitcoin representing the reward for the block miner
      // let sumOfInputsAmount = R.sum(R.flatten(R.map(R.compose(R.map(R.prop('amount')), R.prop('inputs'), R.prop('data')), newBlock.transactions))) + MINING_REWARD;
      // let sumOfOutputsAmount = R.sum(R.flatten(R.map(R.compose(R.map(R.prop('amount')), R.prop('outputs'), R.prop('data')), newBlock.transactions)));
      //
      // let isInputsAmountGreaterOrEqualThanOutputsAmount = R.gte(sumOfInputsAmount, sumOfOutputsAmount);
      //
      // if (!isInputsAmountGreaterOrEqualThanOutputsAmount) {
      //     console.error(`Invalid block balance: inputs sum '${sumOfInputsAmount}', outputs sum '${sumOfOutputsAmount}'`);
      //     throw new BlockAssertionError(`Invalid block balance: inputs sum '${sumOfInputsAmount}', outputs sum '${sumOfOutputsAmount}'`, { sumOfInputsAmount, sumOfOutputsAmount });
      // }
      //
      // // Check if there is only 1 fee transaction and 1 reward transaction;
      // let transactionsByType = R.countBy(R.prop('type'), newBlock.transactions);
      // if (transactionsByType.fee && transactionsByType.fee > 1) {
      //     console.error(`Invalid fee transaction count: expected '1' got '${transactionsByType.fee}'`);
      //     throw new BlockAssertionError(`Invalid fee transaction count: expected '1' got '${transactionsByType.fee}'`);
      // }
      //
      // if (transactionsByType.reward && transactionsByType.reward > 1) {
      //     console.error(`Invalid reward transaction count: expected '1' got '${transactionsByType.reward}'`);
      //     throw new BlockAssertionError(`Invalid reward transaction count: expected '1' got '${transactionsByType.reward}'`);
      // }

      return true;
  }
}

module.exports = Blockchain;
