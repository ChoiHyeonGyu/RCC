var oracledb = require('oracledb');

var conn = null;

oracledb.autoCommit = true;
oracledb.getConnection({
    user: "rcc",
    password: "1234",
<<<<<<< HEAD
    connectString: "192.168.0.8/xe"
=======
    connectString: "192.168.0.8:1521/xe"
>>>>>>> 3a0abc7b61a3642219b545021013c9e3ad074b22
},(err, conn)=>{
    if(err != null){
        console.log(err);
    } else {
        setConn(conn);
    }
});

function setConn(c){
    conn = c;
}

function resultQuery(sql, callback){
    conn.execute(sql, (err, result)=>{
        if(err != null){
            console.log(err);
        } else {
            callback(result);
        }
    });
}

function booleanQuery(sql, callback){
    conn.execute(sql, (err, result)=>{
        if(err != null){
            console.log(err);
            callback(false);
        } else {
            callback(true);
        }
    });
}

module.exports = {
    resultQuery: resultQuery,
    booleanQuery: booleanQuery
};