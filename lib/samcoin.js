const HttpServer = require('./httpServer');
const Blockchain = require('./blockchain');
const Node = require('./node');
const Miner = require('./miner');
const Operator = require('./operator');

host = process.env.HOST || 'localhost';
port = process.env.PORT || process.env.HTTP_PORT || 3001;
peers = (process.env.PEERS ? process.env.PEERS.split(',') : []);
peers = peers.map((peer) => { return { url: peer }; });
logLevel = (process.env.LOG_LEVEL || 6);
name = process.env.NAME ||  '1';
version = "0.01"

/* peers = {
  url: "localhost:3000",
  url: "localhost:3001",
  ...
} */

let blockchain = new Blockchain(name);
let operator = new Operator(name, blockchain);
let node = new Node(host, port, peers, blockchain, version);
let miner = new Miner(blockchain, 6);
let httpServer = new HttpServer(node, blockchain, operator, miner, version);

httpServer.listen(host, port);
