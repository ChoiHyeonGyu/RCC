var oracledb = require('oracledb');

function connection(){
    oracledb.autoCommit = true;
    oracledb.getConnection({
        user: "rcc",
        password: "1234",
        connectString: "localhost:1521/xe"
    },(err, conn)=>{
        if(err) console.log(err);
        return conn;
    });
}