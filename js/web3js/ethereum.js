var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

function getBalance(addr){
    /*web3.eth.getBalance(addr, function(error, balance){
        if(error) console.log(error);
        web3.utils.fromWei(balance, "ether");
    });*/
    /*web3.eth.getBalance(addr).then(function(balance){
        return web3.utils.fromWei(balance, "ether");
    }, function(balance){
        console.log(web3.utils.fromWei(balance, "ether"));
    });*/
}

module.exports = {
    getBalance: getBalance
}