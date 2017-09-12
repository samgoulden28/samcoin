const R = require('ramda');
const CryptoUtil = require('../util/cryptoUtil.js')

class Block {
    toHash() {
        return CryptoUtil.hash(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce);
    }

    getDifficulty() {
        // 14 is the maximum precision length supported by javascript
        return parseInt(this.hash.substring(0, 14), 16);
    }

    static get genesis() {
        // The genesis block is fixed
        let genesisBlock = Block.fromJson({
            index: 0,
            previousHash: '0',
            timestamp: 1465154705,
            nonce: 0,
            transactions: [
                // Transaction.fromJson({
                //     id: '63ec3ac02f822450039df13ddf7c3c0f19bab4acd4dc928c62fcd78d5ebc6dba',
                //     hash: null,
                //     type: 'regular',
                //     data: {
                //         inputs: [],
                //         outputs: []
                //     }
                // })
            ]
        });

        return genesisBlock;
    }

    static fromJson(data) {
        let block = new Block();
        R.forEachObjIndexed((value, key) => {
            if (key == 'transactions' && value) {
                block[key] = 'transactions'; //Transactions.fromJson(value);
            } else {
                block[key] = value;
            }
        }, data);

        block.hash = block.toHash();
        return block;
    }

}

module.exports = Block;