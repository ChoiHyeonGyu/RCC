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
            main_header: include.main_header(),
        }));
    });

});

router.get("/signup", function(req, res) {
    fs.readFile("signup.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
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

            // res.write("<script language=\"javascript\">alert('테스트')</script>");
            // res.write("<script language=\"javascript\">window.location=\"codezip.aspx\"</script>");
        } else {
            res.write("<script>alert('login!');</script>")
            req.session.user_id = id;
            req.session.save(function(err){
                if(err) console.log(err);
            });
            res.end('<script>history.go(-2);</script>')
        }
    });


// 1. login처리를 함.디비
// 2. 이전 페이지로
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
            res.write('<script>history.back();</script>')
        }else{
            res.write("<script>alert('signup!');</script>")
            res.write('<script>history.go(-2);</script>')
        }
    });

// 1. login처리를 함.디비
// 2. 이전 페이지로
});

router.post("/signup",function(req,res){
    var id=req.body.id1;
    var pw=req.body.pw1;
    var pwcheck=req.body.pwcheck1;
    var name=req.body.name1;
    var nickname=req.body.nickname1;
    var email=req.body.email1;
    var cellphone=req.body.cellphone1;

   

module.exports = router;