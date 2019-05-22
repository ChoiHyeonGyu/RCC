var oracledb = require('oracledb');


function connection(){
    oracledb.autoCommit = true;
    oracledb.getConnection({
        user: "rcc",
        password: "1234",
        connectString: "localhost:1521/xe"
    },(err, conn)=>{
        if(err) console.log(err);
        console.log(conn);
        return conn;
    });
}
//success, false
//result
function bQuery(str){
    var conn = connection();
} 
function rQuery(str){
    oracledb.autoCommit = true;
    oracledb.getConnection({
        user: "rcc",
        password: "1234",
        connectString: "localhost:1521/xe"
    },(err, conn)=>{
        if(err) console.log(err);
        conn.execute(str,(err,result)=>{
            console.log(result);
            return result;
        }); 
    });
}

module.exports={
    rQuery:rQuery,
    bQuery:bQuery
}