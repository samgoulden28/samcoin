const express = require('express');
const bodyParser = require('body-parser');
const Block = require('../blockchain/block')

class HttpServer {
  constructor(blockchain) {
    this.app = express();

    this.app.use(bodyParser.json());

    this.app.get('/blockchain/blocks', (req, res) => {
        res.status(200).send(blockchain.getAllBlocks());
    });

    this.app.put('/blockchain/blocks/latest', (req, res) => {
      let requestBlock = Block.fromJson(req.body);
      let result = 1; //node.checkReceivedBlock(requestBlock);

      if (result == null) res.status(200).send('Requesting the blockchain to check.');
      else if (result) res.status(200).send(requestBlock);
      else throw new HTTPError(409, 'Blockchain is update.');
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
