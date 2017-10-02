const HttpServer = require('./httpServer');
const Blockchain = require('./blockchain');
const Node = require('./node');
const Miner = require('./miner');
const Operator = require('./operator');

var name = "SamChain";
var host = 'localhost';
var port = 3000;

let blockchain = new Blockchain(name);
let operator = new Operator(name, blockchain);
let node = new Node(host, port, [], blockchain);
let miner = new Miner(blockchain, 6);
let httpServer = new HttpServer(node, blockchain, operator, miner);

httpServer.listen(host, port);
