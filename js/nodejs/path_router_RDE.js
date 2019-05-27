var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get("/login", function(req, res) {     
    fs.readFile("login.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
        }));
    });

});

router.get("/signup", function(req, res) {
    fs.readFile("signup.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
        }));
    });
});

router.get("/id_find", function(req, res) {
    fs.readFile("id_find.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
        }));
    });

});
router.get("/pw_find", function(req, res) {
    fs.readFile("pw_find.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
        }));
    });

});


router.post("/login", function(req, res){
    var id = req.body.id1;
    var pw = req.body.pw1;
    
    dbconn.resultQuery("select ID,PW from users where id='"+id+"' and pw='"+pw+"'", function(result){
        console.log(result);
        if(result.rows.length == 0){//false
            res.write("<script>alert('fail!.');</script>");
            res.end('<script>history.back()</script>')
        } else {
            res.write("<script>alert('login!');</script>")
            req.session.user_id = id;
            req.session.save(function(err){
                if(err) console.log(err);
            });
            res.end('<script>history.go(-2);</script>')
        }
    });
});

router.post("/signup", function(req, res){
    var id=req.body.id1;
    var pw=req.body.pw1;
    var pwcheck=req.body.pwcheck1;
    var name=req.body.name1;
    var nickname=req.body.nickname1;
    var email=req.body.email1;
    var cellphone=req.body.cellphone1;
    
    dbconn.booleanQuery("insert into USERS values('"+id+"','"+pw+"', '"+name+"','"+nickname+"','0x111111','"+email+"','"+cellphone+"',sysdate)", function(result){
        console.log(result);
        if (result==false){//false
            res.write("<script>alert('fail!');</script>")
            res.end('<script>history.back();</script>')
        }else{
            res.write("<script>alert('signup!');</script>")
            res.end('<script>history.go(-2);</script>')
        }
    });

// 1. login처리를 함.디비
// 2. 이전 페이지로
});


router.post("/id_find", function(req, res){
    var name = req.body.name1;
    var email = req.body.email1;
    var cellphone = req.body.cellphone1;
    var id23="";
    var str=""
    console.log(name);
    console.log(email);
    console.log(cellphone);
    dbconn.resultQuery("select ID from users where name='"+name+"' and email='"+email+"' and cellphone='"+cellphone+"'", function(result){
         str=result.rows[0][0];
        // console.log(result); //{ metaData: [ { name: 'ID' } ], rows: [ [ 'chg' ] ] }
        // console.log(result.rows[0]); //[ 'chg' ]
        // console.log(result.rows[0][0]); //chg
        // console.log(str.length); // 갯수

        if(result.rows.length == 0){//false
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            res.write("<script>alert('회원정보가 없습니다!')</script>");
            res.end('<script>history.back();</script>');
        } else {
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            for(var i=0;i<Math.round(str.length/2);i++){
                id23+=str.charAt(i);
            }
            for(var i=Math.round(str.length/2);i<str.length;i++){
                id23+='*';

            }
            var str1="id:"+id23;
            // console.log(str1);
            // console.log(id23);
            res.write("<script>alert('"+str1+"');</script>");
            res.end('<script>history.go(-2);</script>');
        }
    });
});


router.post("/pw_find", function(req, res){
    var id=req.body.id1;
    var name = req.body.name1;
    var email = req.body.email1;
    var cellphone = req.body.cellphone1;
    var id23="";

    dbconn.resultQuery("select id,pw,name,email,cellphone from users where id='"+id+"' and name='"+name+"' and email='"+email+"' and cellphone='"+cellphone+"'", function(result){      
        if(result.rows.length == 0){//false
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            
        } else {
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            
            res.write("<script>alert('"+str1+"');</script>");
            res.end('<script>history.go(-2);</script>');
        }
    });
});
module.exports = router;