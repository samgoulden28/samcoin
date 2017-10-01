const HttpServer = require('./httpServer');
const Blockchain = require('./blockchain');
const Node = require('./node');
const Miner = require('./miner');

var name = "SamChain";
var host = 'localhost';
var port = 3000;

let blockchain = new Blockchain(name);
let node = new Node(host, port, [], blockchain);
let miner = new Miner(blockchain, 6);
let httpServer = new HttpServer(node, blockchain, miner);

httpServer.listen(host, port);
