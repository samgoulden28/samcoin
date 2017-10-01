const express = require('express');
const bodyParser = require('body-parser');
const Block = require('../blockchain/block')
const BlockAssertionError = require('../blockchain/blockAssertionError');

class HttpServer {
  constructor(node, blockchain, miner) {
    this.app = express();

console.log("Miner: " + miner);
    this.app.use(bodyParser.json());

    this.app.get('/', (req, res) => {
        res.status(200).send("<a href='/blockchain/blocks'>View all blocks</a>");
    });

    this.app.get('/blockchain/blocks', (req, res) => {
        res.status(200).send(blockchain.getAllBlocks());
    });

    this.app.put('/blockchain/blocks/latest', (req, res) => {
      let requestBlock = Block.fromJson(req.body);
      let result = node.checkReceivedBlock(requestBlock);

      if (result == null) res.status(200).send('Requesting the blockchain to check.');
      else if (result) res.status(200).send(requestBlock);
      else throw new HTTPError(409, 'Blockchain is update.');
    });

    this.app.post('/miner/mine', (req, res, next) => {
        miner.mine(req.body.rewardAddress)
            .then((newBlock) => {
                newBlock = Block.fromJson(newBlock);
                blockchain.addBlock(newBlock);
                res.status(201).send(newBlock);
            })
            .catch((ex) => {
                if (ex instanceof BlockAssertionError && ex.message.includes('Invalid index')) next(new HTTPError(409, 'A new block were added before we were able to mine one'), null, ex);
                else next(ex);
            });
    });
  }

  listen(host, port) {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, host, (err) => {
        if (err) reject(err);
        console.info(`Listening http on port: ${this.server.address().port}, to access the API documentation go to http://${host}:${this.server.address().port}/api-docs/`);
        resolve(this);
      });
    });
  }
}

module.exports = HttpServer;
