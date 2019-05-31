var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var request = require('request');
var crypto = require('crypto');
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


router.get("/pw_change", function(req, res) {
    fs.readFile("pw_change.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
        }));
    });

});







router.post("/login", function(req, res){
    var id = req.body.id1;
    var pw = req.body.pw1;
    var preURL = req.body.preURL;

    dbconn.resultQuery("select name, nickname, email, cellphone from users where id='"+id+"'", function(result){
        if(result.rows.length == 0){
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            res.write("<script>alert('로그인에 실패하였습니다!.');</script>");
            res.end('<script>history.back()</script>')
        } else {
            var row = result.rows[0];
            var salt = crypto.createHash("sha512").update(id+row[0]+row[1]+row[2]+row[3]).digest("base64");
            crypto.pbkdf2(pw, salt, parseInt(row[3].substr(5, 6)), 64, "sha512", function(err, key){
                if(err) console.log(err);
                dbconn.resultQuery("select id, pw, nickname from users where id='"+id+"' and pw='"+key.toString("base64")+"'", function(result){
                    if(result.rows.length == 0){
                        res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
                        res.write("<script>alert('로그인에 실패하였습니다!.');</script>");
                        res.end('<script>history.back()</script>')
                    } else {
                        req.session.user_id = id;
                        req.session.nickname = result.rows[0][2];
                        req.session.save(function(err){
                            if(err) console.log(err);
                        });
                        res.end('<script>location.href="'+preURL+'"</script>')
                    }
                });
            });
        }
    });
});

router.get("/logout",function(req,res){
    var preURL = req.param('preURL');
    if(req.session.user_id){
        console.log("로그아웃 처리");
        req.session.destroy(function(err){
            if(err){
                return;
            }
            res.redirect(preURL);
        });
    }else{
        console.log("로그인 안되 있음.");
        res.redirect(preURL);
    }
});
router.post("/signup", function(req, res){
    var id = req.body.id1;
    var pw = req.body.pw1;
    var name = req.body.name1;
    var nickname = req.body.nickname1;
    var email = req.body.email1;
    var cellphone = req.body.cellphone1;

    var salt = crypto.createHash("sha512").update(id+name+nickname+email+cellphone).digest("base64");
    crypto.pbkdf2(pw, salt, parseInt(cellphone.substr(5, 6)), 64, "sha512", function(err, key){
        if(err) console.log(err);

        dbconn.booleanQuery("insert into USERS values('"+id+"','"+key.toString("base64")+"', '"+name+"','"+nickname+"','0x111111','"+email+"','"+cellphone+"',sysdate)", function(result){
            console.log(result);
            if(result == false){//false
                res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
                res.write("<script>alert('fail!');</script>")
                res.end('<script>history.back();</script>')
            } else {
                res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
                res.write("<script>alert('signup!');</script>")
                res.end('<script>history.go(-2);</script>')
            }
        });
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
        // console.log(result); //{ metaData: [ { name: 'ID' } ], rows: [ [ 'chg' ] ] }
        // console.log(result.rows[0]); //[ 'chg' ]
        // console.log(result.rows[0][0]); //chg
        // console.log(str.length); // 갯수

        if(result.rows.length == 0){//false
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            res.write("<script>alert('회원정보가 없습니다!')</script>");
            res.end('<script>history.back();</script>');
        } else {
            str=result.rows[0][0];
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            for(var i=0;i<Math.round(str.length/2);i++){
                id23+=str.charAt(i);
            }
            for(var i=Math.round(str.length/2);i<str.length;i++){
                id23+='*';

            }
            var str1="id:"+id23;
            console.log(str1);
            console.log(id23);
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
    var str=""
    dbconn.resultQuery("select id,pw,name,email,cellphone from users where id='"+id+"' and name='"+name+"' and email='"+email+"' and cellphone='"+cellphone+"'", function(result){      
        console.log(result);
        name="";
        if(result.rows.length == 0){//false
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            res.write("<script>alert('회원정보가 없습니다!')</script>");
            res.end('<script>history.back();</script>');
        } else {
            str=result.rows[0][1];
            res.end('<script>location.href="/pw_change";</script>');
        }
        fs.readFile("pw_change.html", "utf-8", function(error, data) {
            res.send(ejs.render(include.import_default() + data, {
                logo: include.logo(),
                main_header: include.main_header(req.session.user_id),
                id : result.rows[0][0],
            }));
        });
    });
});


router.post("/pw_change", function(req, res){
    var pw=req.body.pw1;
    console.log(pw);
    var id=req.body.hidden_id1
    console.log(id);
    dbconn.resultQuery("update users set pw='"+pw+"' where id="+id+"'", function(result){      
        if(result.rows.length == 0){//false
            console.log("실패실패시래패실패실패실패시랲시래");
        }else{
            console.log(result);
            res.writeHead(200 ,{'Content-Type' : 'text/html; charset=utf-8'} );
            res.write("<script>alert('변경되었습니다.!');</script>");
            res.end("<script>location.href='/login'</script>")
        }
    });
});




router.post("/auth",function(req,res){
    var cellphone = req.body.cellphone;
    var var_num = String(parseInt(Math.random()*99999-10000+1)+10000);
    req.session.cookie.maxAge = 3 * 60 * 1000;
    req.session.vn = var_num;
    req.session.save(function(err){
        if(err) console.log(err);
    });
    console.log('post방식으로 호출.');
    console.log(var_num);
    console.log(cellphone);
    dbconn.resultQuery("select cellphone from users where cellphone='"+cellphone+"'", function(result,err){
        console.log(result);
        if(result.rows.length == 0){//false
            console.log(1)
            request({
                'method': 'POST',
                'json': true,
                'uri': 'https://api-sens.ncloud.com/v1/sms/services/ncp:sms:kr:256070257583:rcc_news/messages',
                'headers': {
                  'Content-Type': 'application/json',
                  'X-NCP-auth-key': 'DmFruV7jlLV1lfu2CFiJ',
                  'X-NCP-service-secret': 'd0ebf13505aa463298c3b401ec529730'
                },
                'body': {
                  'type': 'sms',
                  'from': '01023750862',
                  'to': [cellphone],
                  'content': '인증번호'+var_num+'입니다.',
                  'contentType':"COMM",
                  'countryCode':"82",
                }
                
              });
              return res.json({ result : true });
        } else {
            console.log(2)
            return res.json({ result : false }); 
        }
    });

    
    
    
});

var count=1;

router.post("/authnum",function(req,res){
    var authnum=req.body.auth_num;
    console.log(req.session.vn);
    console.log(authnum);
    if(authnum==req.session.vn){
          console.log("111111")
          req.session.destroy(function(err){
            if(err){
                return;
            }
        });
        return res.json({ result : 1 });
    }else if(req.session.vn!=undefined && authnum!=req.session.vn){
        if(count<=3){
            count+=1;
            console.log("2222222");
            return res.json({ result : 2 });
        }else{
            count=1;
            console.log("333333");
            req.session.destroy(function(err){
            if(err){
                return;
            }
        });
        return res.json({ result : 3 });
        }
    }else{
        count=1;
        console.log("333333");
        req.session.destroy(function(err){
            if(err){
                return;
            }
        });
        return res.json({ result : 3 });
    }
        
});


router.post("/unload",function(req,res){
    req.session.destroy(function(err){
        if(err){
            return;
        }
    });    
});


router.post("/idcheck",function(req,res){
    var id=req.body.id;
    console.log('post방식으로 호출.');
    dbconn.resultQuery("select id from users where id='"+id+"'", function(result){
        console.log(result);
        if(result.rows.length == 0){
            console.log(1)
            return res.json({ id_msg : true });  
        } else {
            console.log(result.rows[0][0]);
            console.log(2);
            return res.json({ id_msg : false }); 
        }
    });    
});

module.exports = router;