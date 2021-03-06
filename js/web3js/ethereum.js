var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.0.8:8545"));
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

function getTotalDonate(myaddr, adminaddr, callback){
    web3.eth.getBlockNumber(function(err, bn){
        if(err) console.log(err);
        getBlock(bn, -1, 0);
    });

    function getBlock(bn, txroad, sum){
        web3.eth.getBlock(bn, function(err, blk){
            if(err) console.log(err);
            
            if(blk.transactions[0] == null){
                getBlock(blk.number - 1, txroad, sum);
            } else if(txroad == -1) {
                txroad = blk.transactions.length - 1;
                getTX(blk.transactions[txroad], txroad, sum);
            } else {
                getTX(blk.transactions[txroad], txroad, sum);
            }
        });
    }

    function getTX(txhash, txroad, sum){
        web3.eth.getTransaction(txhash, function(err, tx){
            if(err) console.log(err);
            
            if(tx.to == myaddr && tx.from != adminaddr){
                sum += Number(web3.utils.fromWei(tx.value, "microether"));
            }

            txroad--;

            if(tx.blockNumber == 1 && tx.transactionIndex == 0){
                callback(sum / 1000000);
            } else if(tx.transactionIndex == 0) {
                getBlock(tx.blockNumber - 1, txroad, sum);
            } else {
                getBlock(tx.blockNumber, txroad, sum);
            }
        });
    }
}

function getBalance(addr, callback){
    web3.eth.getBalance(addr, function(err, coin){
        if(err) console.log(err);
        callback(web3.utils.fromWei(coin, "ether"));
    });
}

function initialCoin(sender, receiver){
    var salt = crypto.createHash("sha512").update("admin").digest("base64");
    crypto.pbkdf2("admin", salt, "admin".length * 10000, 64, "sha512", function(err, key){
        if(err) console.log(err);
        
        web3.eth.personal.unlockAccount(sender, key.toString("base64"), 300, function(err){
            if(err) console.log(err);

            web3.eth.sendTransaction({
                from: sender,
                to: receiver,
                value: web3.utils.toWei("1", "ether"),
                gasPrice: web3.utils.toWei(String(Number("1") * 600), "gwei")
            }, function(err, txHash){
                if(err) console.log(err);
            });
        });
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
                gasPrice: web3.utils.toWei(String(Number(coin) * 600), "gwei")
            }, function(err, txHash){
                if(err){
                    if(err.message.match("-32000")){
                        callback(0);
                    } else {
                        console.log(err);
                    }
                }
                if(txHash) callback();
            });
        });
    });
}

function getTransactions(addr, nextbn, nextxidx, callback){
    if(nextbn == 0){
        web3.eth.getBlockNumber(function(err, bn){
            if(err) console.log(err);
            var txlist = [];
            var txroad = -1;
            getBlock(bn, txroad, txlist);
        });
    } else {
        var txlist = [];
        var txroad = nextxidx;
        getBlock(nextbn, txroad, txlist);
    }

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

function pagingTransactions(addr, nextbn, nextxidx, callback){
    if(nextbn == 0){
        web3.eth.getBlockNumber(function(err, bn){
            if(err) console.log(err);
            var txpage = [];
            var txroad = -1;
            getBlock(bn, txroad, txpage);
        });
    } else {
        var txpage = [];
        var txroad = nextxidx;
        getBlock(nextbn, txroad, txpage);
    }

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

function prevFirstPageValue(addr, nextbn, nextxidx, callback){
    var txroad = nextxidx;
    var cnt = 0;
    getBlock(nextbn, txroad, cnt);

    function getBlock(bn, txroad, cnt){
        web3.eth.getBlock(bn, function(err, blk){
            if(err) console.log(err);

            if(blk == null){
                callback();
            } else if(blk.transactions[0] == null || blk.transactions.length == txroad){
                getBlock(blk.number + 1, -1, cnt);
            } else if(txroad == -1) {
                getTX(blk.transactions[0], 0, cnt);
            } else {
                getTX(blk.transactions[txroad], txroad, cnt);
            }
        });
    }

    function getTX(txhash, txroad, cnt){
        web3.eth.getTransaction(txhash, function(err, tx){
            if(err) console.log(err);
            
            if(tx.from == addr || tx.to == addr){
                cnt++;
            }

            txroad++;

            if(cnt == 101){
                callback({bn: tx.blockNumber, txidx: tx.transactionIndex});
            } else {
                getBlock(tx.blockNumber, txroad, cnt);
            }
        });
    }
}

function searchAndsortTransactions(addr, txsc, txio, slctuser, slctcoin, txscope, nextbn = 0, nextxidx, callback){
    if(nextbn == 0){
        if(txsc == '0'){
            web3.eth.getBlockNumber(function(err, bn){
                if(err) console.log(err);
                var txlist = [];
                var txroad = -1;
                getBlock(bn, txroad, txlist);
            });
        } else if(txsc == '1') {
            var txlist = [];
            getBlock(1, -1, txlist);
        }
    } else {
        var txlist = [];
        var txroad = nextxidx;
        getBlock(nextbn, txroad, txlist);
    }

    function getBlock(bn, txroad, txlist){
        web3.eth.getBlock(bn, function(err, blk){
            if(err) console.log(err);
            
            if(txsc == '0'){
                if(blk.transactions[0] == null){
                    getBlock(blk.number - 1, txroad, txlist);
                } else if(txroad == -1) {
                    txroad = blk.transactions.length - 1;
                    getTX(blk.transactions[txroad], blk.timestamp, txroad, txlist);
                } else {
                    getTX(blk.transactions[txroad], blk.timestamp, txroad, txlist);
                }
            } else if(txsc == '1') {
                if(blk == null){
                    callback(txlist);
                } else if(blk.transactions[0] == null || blk.transactions.length == txroad){
                    getBlock(blk.number + 1, -1, txlist);
                } else if(txroad == -1) {
                    getTX(blk.transactions[0], blk.timestamp, 0, txlist);
                } else {
                    getTX(blk.transactions[txroad], blk.timestamp, txroad, txlist);
                }
            }
        });
    }

    function getTX(txhash, unixtime, txroad, txlist){
        web3.eth.getTransaction(txhash, function(err, tx){
            if(err) console.log(err);
            
            if(txio == '0'){
                if(tx.from == addr || tx.to == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.from == slctuser[i][0] || tx.to == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            } else if(txio == '1') {
                if(tx.to == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.from == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            } else if(txio == '2') {
                if(tx.from == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.to == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            }

            function processingCoin(){
                if(slctcoin == '' || isNaN(Number(slctcoin)) || txscope == '0'){
                    pushTX();
                } else {
                    if(txscope == '1'){
                        if(tx.value > Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    } else if(txscope == '2') {
                        if(tx.value >= Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    } else if(txscope == '3') {
                        if(tx.value == Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    } else if(txscope == '4') {
                        if(tx.value <= Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    } else if(txscope == '5') {
                        if(tx.value < Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    }
                }
            }

            function pushTX(){
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

            if(txsc == '0'){
                txroad--;

                if(txlist.length > 9 || (tx.blockNumber == 1 && tx.transactionIndex == 0)){
                    callback(txlist);
                } else if(tx.transactionIndex == 0) {
                    getBlock(tx.blockNumber - 1, txroad, txlist);
                } else {
                    getBlock(tx.blockNumber, txroad, txlist);
                }
            } else if(txsc == '1') {
                txroad++;

                if(txlist.length > 9){
                    callback(txlist);
                } else {
                    getBlock(tx.blockNumber, txroad, txlist);
                }
            }
        });
    }
}

function searchAndsortPagingTransactions(addr, txsc, txio, slctuser, slctcoin, txscope, nextbn = 0, nextxidx, callback){
    if(nextbn == 0){
        if(txsc == '0'){
            web3.eth.getBlockNumber(function(err, bn){
                if(err) console.log(err);
                var txpage = [];
                var txroad = -1;
                getBlock(bn, txroad, txpage);
            });
        } else if(txsc == '1') {
            var txpage = [];
            getBlock(1, -1, txpage);
        }
    } else {
        var txpage = [];
        var txroad = nextxidx;
        getBlock(nextbn, txroad, txpage);
    }

    function getBlock(bn, txroad, txpage){
        web3.eth.getBlock(bn, function(err, blk){
            if(err) console.log(err);
            
            if(txsc == '0'){
                if(blk.transactions[0] == null){
                    getBlock(blk.number - 1, txroad, txpage);
                } else if(txroad == -1) {
                    txroad = blk.transactions.length - 1;
                    getTX(blk.transactions[txroad], txroad, txpage);
                } else {
                    getTX(blk.transactions[txroad], txroad, txpage);
                }
            } else if(txsc == '1') {
                if(blk == null){
                    processingLast(txpage);
                } else if(blk.transactions[0] == null || blk.transactions.length == txroad){
                    getBlock(blk.number + 1, -1, txpage);
                } else if(txroad == -1) {
                    getTX(blk.transactions[0], 0, txpage);
                } else {
                    getTX(blk.transactions[txroad], txroad, txpage);
                }
            }
        });
    }

    function getTX(txhash, txroad, txpage){
        web3.eth.getTransaction(txhash, function(err, tx){
            if(err) console.log(err);
            
            if(txio == '0'){
                if(tx.from == addr || tx.to == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.from == slctuser[i][0] || tx.to == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            } else if(txio == '1') {
                if(tx.to == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.from == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            } else if(txio == '2') {
                if(tx.from == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.to == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            }

            function processingCoin(){
                if(slctcoin == '' || isNaN(Number(slctcoin)) || txscope == '0'){
                    pushTX();
                } else {
                    if(txscope == '1'){
                        if(tx.value > Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    } else if(txscope == '2') {
                        if(tx.value >= Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    } else if(txscope == '3') {
                        if(tx.value == Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    } else if(txscope == '4') {
                        if(tx.value <= Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    } else if(txscope == '5') {
                        if(tx.value < Number(web3.utils.toWei(slctcoin, "ether"))){
                            pushTX();
                        }
                    }
                }
            }

            function pushTX(){
                txpage.push({
                    bn: tx.blockNumber,
                    txidx: tx.transactionIndex
                });
            }

            if(txsc == '0'){
                txroad--;

                if(txpage.length > 101 || (tx.blockNumber == 1 && tx.transactionIndex == 0)){
                    processingLast(txpage);
                } else if(tx.transactionIndex == 0) {
                    getBlock(tx.blockNumber - 1, txroad, txpage);
                } else {
                    getBlock(tx.blockNumber, txroad, txpage);
                }
            } else if(txsc == '1') {
                txroad++;

                if(txpage.length > 101){
                    processingLast(txpage);
                } else {
                    getBlock(tx.blockNumber, txroad, txpage);
                }
            }
        });
    }

    function processingLast(txpage){
        var sendpage = [];
        for(var i = 0; i < txpage.length; i+=10){
            sendpage.push(txpage[i]);
        }
        callback(sendpage);
    }
}

function searchAndsortPrevFirstPageValue(addr, txsc, txio, slctuser, slctcoin, txscope, nextbn, nextxidx, callback){
    if(nextbn == undefined){
        callback();
    } else {
        getBlock(nextbn, nextxidx, 0);
    }

    function getBlock(bn, txroad, cnt){
        web3.eth.getBlock(bn, function(err, blk){
            if(err) console.log(err);
            
            if(txsc == '1'){
                if(blk.transactions[0] == null){
                    getBlock(blk.number - 1, txroad, cnt);
                } else if(txroad == -1) {
                    txroad = blk.transactions.length - 1;
                    getTX(blk.transactions[txroad], txroad, cnt);
                } else {
                    getTX(blk.transactions[txroad], txroad, cnt);
                }
            } else if(txsc == '0') {
                if(blk == null){
                    callback();
                } else if(blk.transactions[0] == null || blk.transactions.length == txroad){
                    getBlock(blk.number + 1, -1, cnt);
                } else if(txroad == -1) {
                    getTX(blk.transactions[0], 0, cnt);
                } else {
                    getTX(blk.transactions[txroad], txroad, cnt);
                }
            }
        });
    }

    function getTX(txhash, txroad, cnt){
        
        web3.eth.getTransaction(txhash, function(err, tx){
            if(err) console.log(err);
            
            if(txio == '0'){
                if(tx.from == addr || tx.to == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.from == slctuser[i][0] || tx.to == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            } else if(txio == '1') {
                if(tx.to == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.from == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            } else if(txio == '2') {
                if(tx.from == addr){
                    if(slctuser[0] != null){
                        for(var i = 0; i < slctuser.length; i++){
                            if(tx.to == slctuser[i][0]){
                                processingCoin();
                                break;
                            }
                        }
                    } else {
                        processingCoin();
                    }
                }
            }

            function processingCoin(){
                if(slctcoin == '' || isNaN(Number(slctcoin)) || txscope == '0'){
                    cnt++;
                } else {
                    if(txscope == '1'){
                        if(tx.value > Number(web3.utils.toWei(slctcoin, "ether"))){
                            cnt++;
                        }
                    } else if(txscope == '2') {
                        if(tx.value >= Number(web3.utils.toWei(slctcoin, "ether"))){
                            cnt++;
                        }
                    } else if(txscope == '3') {
                        if(tx.value == Number(web3.utils.toWei(slctcoin, "ether"))){
                            cnt++;
                        }
                    } else if(txscope == '4') {
                        if(tx.value <= Number(web3.utils.toWei(slctcoin, "ether"))){
                            cnt++;
                        }
                    } else if(txscope == '5') {
                        if(tx.value < Number(web3.utils.toWei(slctcoin, "ether"))){
                            cnt++;
                        }
                    }
                }
            }

            if(txsc == '1'){
                txroad--;

                if(cnt == 101){
                    callback({bn: tx.blockNumber, txidx: tx.transactionIndex});
                } else if(tx.blockNumber == 1 && tx.transactionIndex == 0) {
                    callback();
                } else if(tx.transactionIndex == 0) {
                    getBlock(tx.blockNumber - 1, txroad, cnt);
                } else {
                    getBlock(tx.blockNumber, txroad, cnt);
                }
            } else if(txsc == '0') {
                txroad++;

                if(cnt == 101){
                    callback({bn: tx.blockNumber, txidx: tx.transactionIndex});
                } else {
                    getBlock(tx.blockNumber, txroad, cnt);
                }
            }
        });
    }
}

module.exports = {
    newAccount: newAccount,
    getTotalDonate: getTotalDonate,
    getBalance: getBalance,
    initialCoin: initialCoin,
    sendCoin: sendCoin,
    getTransactions: getTransactions,
    pagingTransactions: pagingTransactions,
    prevFirstPageValue: prevFirstPageValue,
    searchAndsortTransactions: searchAndsortTransactions,
    searchAndsortPagingTransactions: searchAndsortPagingTransactions,
    searchAndsortPrevFirstPageValue: searchAndsortPrevFirstPageValue
}