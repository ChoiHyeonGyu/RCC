var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var crypto = require('crypto');
var moment = require('moment');

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

function getTransactions(addr, callback){
    web3.eth.getBlockNumber(function(err, bn){
        if(err) console.log(err);
        var txlist = [];
        var txroad = -1;
        getBlock(bn, txroad, txlist);
    });

    function getBlock(bn, txroad, txlist){
        web3.eth.getBlock(bn, function(err, blk){
            if(err) console.log(err);
            
            if(blk.transactions[0] == null){
                getBlock(blk.number - 1, txroad, txlist);
            } else if(txroad == -1) {
                txroad = blk.transactions.length - 1;
                getTX(blk.transactions[txroad], blk.timestamp, txroad, txlist);
            } else {
                getTX(blk.transactions[txroad], blk.timestamp, txroad, txlist);
            }
        });
    }

    function getTX(txhash, unixtime, txroad, txlist){
        web3.eth.getTransaction(txhash, function(err, tx){
            if(err) console.log(err);
            
            if(tx.from == addr || tx.to == addr){
                txlist.push({
                    bn: tx.blockNumber,
                    txidx: tx.transactionIndex,
                    from: tx.from,
                    to: tx.to,
                    value: web3.utils.fromWei(tx.value, "ether"),
                    fee: web3.utils.fromWei(String(tx.gas * tx.gasPrice), "ether"),
                    time: moment(new Date(unixtime * 1000)).format("YYYY-MM-DD HH:mm:ss")
                });
            }

            txroad--;

            if(txlist.length > 9 || (tx.blockNumber == 1 && tx.transactionIndex == 0)){
                callback(txlist);
            } else if(tx.transactionIndex == 0) {
                getBlock(tx.blockNumber - 1, txroad, txlist);
            } else {
                getBlock(tx.blockNumber, txroad, txlist);
            }
        });
    }
}

function pagingTransactions(addr, callback){
    web3.eth.getBlockNumber(function(err, bn){
        if(err) console.log(err);
        var txpage = [];
        var txroad = -1;
        getBlock(bn, txroad, txpage);
    });

    function getBlock(bn, txroad, txpage){
        web3.eth.getBlock(bn, function(err, blk){
            if(err) console.log(err);
            
            if(blk.transactions[0] == null){
                getBlock(blk.number - 1, txroad, txpage);
            } else if(txroad == -1) {
                txroad = blk.transactions.length - 1;
                getTX(blk.transactions[txroad], txroad, txpage);
            } else {
                getTX(blk.transactions[txroad], txroad, txpage);
            }
        });
    }

    function getTX(txhash, txroad, txpage){
        web3.eth.getTransaction(txhash, function(err, tx){
            if(err) console.log(err);
            
            if(tx.from == addr || tx.to == addr){
                txpage.push({
                    bn: tx.blockNumber,
                    txidx: tx.transactionIndex
                });
            }

            txroad--;

            if(txpage.length > 101 || (tx.blockNumber == 1 && tx.transactionIndex == 0)){
                var sendpage = [];
                for(var i = 0; i < txpage.length; i+=10){
                    sendpage.push(txpage[i]);
                }
                callback(sendpage);
            } else if(tx.transactionIndex == 0) {
                getBlock(tx.blockNumber - 1, txroad, txpage);
            } else {
                getBlock(tx.blockNumber, txroad, txpage);
            }
        });
    }
}

module.exports = {
    getBalance: getBalance,
    sendCoin: sendCoin,
    newAccount: newAccount,
    getTransactions: getTransactions,
    pagingTransactions: pagingTransactions
}