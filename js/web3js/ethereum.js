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

function sendCoin(sender, receiver, coin, pw, callback){
    var salt = crypto.createHash("sha512").update(pw).digest("base64");
    crypto.pbkdf2(pw, salt, pw.length * 10000, 64, "sha512", function(err, key){
        if(err) console.log(err);
        
        web3.eth.personal.unlockAccount(sender, key.toString("base64"), 300, function(err){
            if(err) console.log(err);

            web3.eth.sendTransaction({
                from: sender,
                to: receiver,
                value: web3.utils.toWei(coin, "ether"),
                gasPrice: web3.utils.toWei("20", "gwei")
            }, function(err, txHash){
                if(err) console.log(err);
                if(txHash) callback();
            });
        });
    });
}

function getTransactions(){
    web3.eth.getBlockNumber(function(err, bn){
        if(err) console.log(err);
        
        web3.eth.getBlock(8, function(err, blk){
            if(err) console.log(err);
            console.log(blk);
            console.log(blk.transactions);
            web3.eth.getTransaction(blk.transactions[0], function(err, tx){
                if(err) console.log(err);
                console.log(tx);
                console.log(tx.blockNumber);
                console.log(tx.from);
                console.log(tx.to);
                console.log(tx.value);
            });
        });
    });
}

module.exports = {
    getBalance: getBalance,
    sendCoin: sendCoin,
    newAccount: newAccount,
    getTransactions: getTransactions
}