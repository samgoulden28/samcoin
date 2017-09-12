const HttpServer = require('./httpServer');
const Blockchain = require('./blockchain');

var name = "SamChain";

let blockchain = new Blockchain(name);

let httpServer = new HttpServer(blockchain);


httpServer.listen('localhost', 3000);
