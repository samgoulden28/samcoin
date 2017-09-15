const HttpServer = require('./httpServer');
const Blockchain = require('./blockchain');
const Node = require('./node');

var name = "SamChain";
var host = 'localhost';
var port = 3000;

let blockchain = new Blockchain(name);
let node = new Node(host, port, [], blockchain);
let httpServer = new HttpServer(node, blockchain);

httpServer.listen(host, port);
