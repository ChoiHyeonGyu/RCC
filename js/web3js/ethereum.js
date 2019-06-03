var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var crypto = require('crypto');

function newAccount(pw, callback){
    var salt = crypto.createHash("sha512").update(pw).digest("base64");
    crypto.pbkdf2(pw, salt, pw.length * 10000, 64, "sha512", function(err, key){
        if(err) console.log(err);
        web3.eth.personal.newAccount(key.toString("base64"), function(err, addr){
            if(err) console.log(err);
            callback(addr);
        });
    });
}

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
    sendCoin: sendCoin,
    newAccount: newAccount
}