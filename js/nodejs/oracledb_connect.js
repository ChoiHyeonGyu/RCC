var oracledb = require('oracledb');

var conn = null;

oracledb.autoCommit = true;
oracledb.getConnection({
    user: "c##rcc2",
    password: "1234",
    connectString: "localhost:1521/xe"
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