var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

function getBalance(addr, callback){
    web3.eth.getBalance(addr, function(err, coin){
        if(err) console.log(err);
        callback(web3.utils.fromWei(coin, "ether"));
    });
}

function sendCoin(sender, receiver, coin, callback){
    web3.eth.personal.unlockAccount(sender, "1234", 300, function(err){
        if(err) console.log(err);
    });

    web3.eth.sendTransaction({
        from: sender,
        to: receiver,
        value: web3.utils.toWei(coin, "ether")
    }, "1234", function(err, txHash){
        if(err) console.log(err);
        if(txHash) callback();
    });
}

module.exports = {
    getBalance: getBalance,
    sendCoin: sendCoin
}