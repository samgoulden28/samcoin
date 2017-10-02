const express = require('express');
const bodyParser = require('body-parser');
const R = require('ramda');
const Block = require('../blockchain/block');
const Transaction = require('../blockchain/transaction');
const TransactionAssertionError = require('../blockchain/transactionAssertionError');
const BlockAssertionError = require('../blockchain/blockAssertionError');
const HTTPError = require('./httpError');
const ArgumentError = require('../util/argumentError');
const CryptoUtil = require('../util/cryptoUtil');

class HttpServer {
  constructor(node, blockchain, operator, miner) {
    this.app = express();

    const projectWallet = (wallet) => {
        return {
            id: wallet.id,
            addresses: R.map((keyPair) => {
                return keyPair.publicKey;
            }, wallet.keyPairs)
        };
    };

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

    this.app.get('/blockchain/transactions', (req, res) => {
        res.status(200).send(blockchain.getAllTransactions());
    });

    this.app.post('/blockchain/transactions', (req, res) => {
        let requestTransaction = Transaction.fromJson(req.body);
        let transactionFound = blockchain.getTransactionById(requestTransaction.id);

        if (transactionFound != null) throw new HTTPError(409, `Transaction '${requestTransaction.id}' already exists`);

        try {
            let newTransaction = blockchain.addTransaction(requestTransaction);
            res.status(201).send(newTransaction);
        } catch (ex) {
            if (ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, requestTransaction, ex);
            else throw ex;
        }
    });

    this.app.get('/operator/wallets', (req, res) => {
        let wallets = operator.getWallets();

        let projectedWallets = R.map(projectWallet, wallets);

        res.status(200).send(wallets);
    });

    this.app.post('/operator/wallets', (req, res) => {
        let password = req.body.password;
        if (R.match(/\w+/g, password).length <= 4) throw new HTTPError(400, 'Password must contain more than 4 words');

        let newWallet = operator.createWalletFromPassword(password);

        let projectedWallet = projectWallet(newWallet);

        res.status(201).send(newWallet);
    });

    this.app.get('/operator/wallets/:walletId/addresses', (req, res) => {
        let walletId = req.params.walletId;
        try {
            let addresses = operator.getAddressesForWallet(walletId);
            res.status(200).send(addresses);
        } catch (ex) {
            if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
            else throw ex;
        }
    });

    this.app.post('/operator/wallets/:walletId/transactions', (req, res) => {
        let walletId = req.params.walletId;
        let password = req.headers.password;

        if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
        let passwordHash = CryptoUtil.hash(password);

        try {
            if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

            let newTransaction = operator.createTransaction(walletId, req.body.fromAddress, req.body.toAddress, req.body.amount, req.body.changeAddress);

            newTransaction.check();

            let transactionCreated = blockchain.addTransaction(Transaction.fromJson(newTransaction));
            res.status(201).send(transactionCreated);
        } catch (ex) {
            if (ex instanceof ArgumentError || ex instanceof TransactionAssertionError) throw new HTTPError(400, ex.message, walletId, ex);
            else throw ex;
        }
    });

    this.app.post('/operator/wallets/:walletId/addresses', (req, res) => {
        let walletId = req.params.walletId;
        let password = req.headers.password;

        if (password == null) throw new HTTPError(401, 'Wallet\'s password is missing.');
        let passwordHash = CryptoUtil.hash(password);

        try {
            if (!operator.checkWalletPassword(walletId, passwordHash)) throw new HTTPError(403, `Invalid password for wallet '${walletId}'`);

            let newAddress = operator.generateAddressForWallet(walletId);
            res.status(201).send({ address: newAddress });
        } catch (ex) {
            if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, walletId, ex);
            else throw ex;
        }
    });

    this.app.get('/operator/wallets/:walletId/addresses/:addressId/balance', (req, res) => {
        let walletId = req.params.walletId;
        let addressId = req.params.addressId;

        try {
            let balance = operator.getBalanceForWalletAddress(walletId, addressId);
            res.status(200).send({ balance: balance });
        } catch (ex) {
            if (ex instanceof ArgumentError) throw new HTTPError(400, ex.message, { walletId, addressId }, ex);
            else throw ex;
        }
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
