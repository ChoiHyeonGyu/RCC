var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

function getBalance(){
    web3.eth.getCoinbase(function(error, addr){
        console.log(addr);
        web3.eth.getBalance(addr, function(error, bal){
            console.log(bal);
            console.log(web3.utils.fromWei(bal, "ether"));
        });
    });
    //return web3.utils.fromWei(web3.eth.getBalance(web3.eth.getCoinbase()), "ether");
}

module.exports = {
    getBalance: getBalance
}