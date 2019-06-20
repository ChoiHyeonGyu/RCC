var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var request = require('request');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');
var ether = require('../web3js/ethereum');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get("/login", function (req, res) {
    fs.readFile("login.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
        }));
    });

});

router.get("/signup", function (req, res) {
    fs.readFile("signup.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
            footer: include.footer(),
        }));
    });
});

router.get("/id_find", function (req, res) {
    fs.readFile("id_find.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
        }));
    });

});
router.get("/pw_find", function (req, res) {
    fs.readFile("pw_find.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
        }));
    });

});



router.get("/pw_change", function (req, res) {
    var id = req.param('id');
    fs.readFile("pw_change.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
            id: id,
        }));
    });

});








router.get("/logout", function (req, res) {
    var preURL = req.param('preURL');
    if (req.session.user_id) {
        req.session.destroy(function (err) {
            if (err) {
                return;
            }
            res.redirect(preURL);
        });
    } else {
        res.redirect(preURL);
    }
});
router.post("/signup", function (req, res) {
    var id = req.body.id1;
    var pw = req.body.pw1;
    var name = req.body.name1;
    var nickname = req.body.nickname1;
    var email = req.body.email1;
    var cellphone = req.body.cellphone1;

    var salt = crypto.createHash("sha512").update(id + name + nickname + email + cellphone).digest("base64");
    crypto.pbkdf2(pw, salt, parseInt(cellphone.substr(5, 6)), 64, "sha512", function (err, key) {
        if (err) console.log(err);

        ether.newAccount(id, function (addr) {
            dbconn.booleanQuery("insert into USERS values('" + id + "', '" + key.toString("base64") + "', '" + name + "', '" + nickname + "', '" + addr + "', '" + email + "', '" + cellphone + "', sysdate)", function (result) {
                if (result == false) {//false
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write("<script>alert('fail!');</script>")
                    res.end('<script>history.back();</script>')
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.write("<script>alert('signup!');</script>")
                    res.end('<script>self.close()</script>')
                }
            });
        });
    });
    // 1. login처리를 함.디비
    // 2. 이전 페이지로
});


router.post("/id_find", function (req, res) {
    var name = req.body.name1;
    var email = req.body.email1;
    var cellphone = req.body.cellphone1;
    var id23 = "";
    var str = ""
    dbconn.resultQuery("select ID from users where name='" + name + "' and email='" + email + "' and cellphone='" + cellphone + "'", function (result) {
        if (result.rows.length == 0) {//false
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write("<script>alert('회원정보가 없습니다!')</script>");
            res.end('<script>history.back();</script>');
        } else {
            str = result.rows[0][0];
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            for (var i = 0; i < Math.round(str.length / 2); i++) {
                id23 += str.charAt(i);
            }
            for (var i = Math.round(str.length / 2); i < str.length; i++) {
                id23 += '*';

            }
            var str1 = "id:" + id23;
            res.write("<script>alert('" + str1 + "');</script>");
            res.end('<script>history.go(-2);</script>');
        }
    });
});


router.post("/pw_find", function (req, res) {
    var id = req.body.id1;
    var name = req.body.name1;
    var email = req.body.email1;
    var cellphone = req.body.cellphone1;
    var id23 = "";
    var str = ""
    dbconn.resultQuery("select id,pw,name,email,cellphone from users where id='" + id + "' and name='" + name + "' and email='" + email + "' and cellphone='" + cellphone + "'", function (result) {
        name = "";
        if (result.rows.length == 0) {//false
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write("<script>alert('회원정보가 없습니다!')</script>");
            res.end('<script>history.back();</script>');
        } else {
            res.end('<script>location.href="/pw_change?id=' + result.rows[0][0] + '";</script>');
        }
    });
});


router.post("/pw_change", function (req, res) {
    var pw = req.body.pw1;
    var id = req.body.hidden_id1


    dbconn.resultQuery("select name, nickname, email, cellphone from users where id='" + id + "'", function (result) {
        if (result.rows.length == 0) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write("<script>alert('다시 입력해주세요!.');</script>");
            res.end('<script>history.back()</script>');
        } else {
            var row = result.rows[0];
            var salt = crypto.createHash("sha512").update(id + row[0] + row[1] + row[2] + row[3]).digest("base64");
            crypto.pbkdf2(pw, salt, parseInt(row[3].substr(5, 6)), 64, "sha512", function (err, key) {
                if (err) console.log(err);
                dbconn.booleanQuery("update users set pw='" + key.toString("base64") + "' where id='" + id + "'", function (result) {
                    if (result == false) {//false
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.write("<script>alert('비밀번호 변경 실패했습니다!');</script>");
                        res.end("<script>history.back()</script>");
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.write("<script>alert('변경되었습니다.!');</script>");
                        res.end("<script>location.href='/login'</script>");
                    }
                });
            });
        }
    });
});





router.post("/login", function (req, res) {
    var id = req.body.id1;
    var pw = req.body.pw1;
    var preURL = req.body.preURL;
    delete req.session.vn;
    dbconn.resultQuery("select name, nickname, email, cellphone from users where id='" + id + "'", function (result) {
        if (result.rows.length == 0) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write("<script>alert('로그인에 실패하였습니다!.');</script>");
            res.end('<script>history.back()</script>');
        } else {
            var row = result.rows[0];
            var salt = crypto.createHash("sha512").update(id + row[0] + row[1] + row[2] + row[3]).digest("base64");
            crypto.pbkdf2(pw, salt, parseInt(row[3].substr(5, 6)), 64, "sha512", function (err, key) {
                if (err) console.log(err);
                dbconn.resultQuery("select id, pw, nickname from users where id='" + id + "' and pw='" + key.toString("base64") + "'", function (result) {
                    if (result.rows.length == 0) {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.write("<script>alert('로그인에 실패하였습니다!.');</script>");
                        res.end('<script>history.back()</script>');
                    } else {
                        req.session.user_id = id;
                        req.session.nickname = result.rows[0][2];
                        req.session.save(function (err) {
                            if (err) console.log(err);
                        });
                        res.end('<script>location.href="' + preURL + '"</script>');
                    }
                });
            });
        }
    });
});


router.post("/auth", function (req, res) {
    delete req.session.vn;
    var cellphone = req.body.cellphone;
    var var_num = String(parseInt(Math.random() * 99999 - 10000 + 1) + 10000);
    req.session.cookie.maxAge = 3 * 60 * 1000;
    req.session.vn = var_num;
    req.session.save(function (err) {
        if (err) console.log(err);
    });

    dbconn.resultQuery("select cellphone from users where cellphone='" + cellphone + "'", function (result, err) {
        if (result.rows.length == 0) {//false
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
                    'content': '인증번호' + var_num + '입니다.',
                    'contentType': "COMM",
                    'countryCode': "82",
                }
            });
            return res.json({ result: true });
        } else {
            return res.json({ result: false });
        }
    });
});

var count = 1;

router.post("/authnum", function (req, res) {
    var authnum = req.body.auth_num;
    if (authnum == req.session.vn) {
        req.session.destroy(function (err) {
            if (err) {
                return;
            }
        });
        return res.json({ result: 1 });
    } else if (req.session.vn != undefined && authnum != req.session.vn) {
        if (count <= 3) {
            count += 1;
            return res.json({ result: 2 });
        } else {
            count = 1;
            req.session.destroy(function (err) {
                if (err) {
                    return;
                }
            });
            return res.json({ result: 3 });
        }
    } else {
        count = 1;
        req.session.destroy(function (err) {
            if (err) {
                return;
            }
        });
        return res.json({ result: 3 });
    }

});

router.post("/pw_find/auth", function (req, res) {
    var cellphone = req.body.cellphone;
    var var_num = String(parseInt(Math.random() * 99999 - 10000 + 1) + 10000);
    req.session.cookie.maxAge = 3 * 60 * 1000;
    req.session.vn = var_num;
    req.session.save(function (err) {
        if (err) console.log(err);
    });

    dbconn.resultQuery("select cellphone from users where cellphone='" + cellphone + "'", function (result, err) {
        if (result.rows.length == 0) {//false
            return res.json({ result: 2 });
        } else {
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
                    'content': '인증번호' + var_num + '입니다.',
                    'contentType': "COMM",
                    'countryCode': "82",
                }
            });
            return res.json({ result: 1 });
        }
    });
});

router.post("/pw_find/authnum", function (req, res) {
    var authnum = req.body.auth_num;
    if (authnum == req.session.vn) {
        req.session.destroy(function (err) {
            if (err) {
                return;
            }
        });
        return res.json({ result: 1 });
    } else if (req.session.vn != undefined && authnum != req.session.vn) {
        if (count <= 3) {
            count += 1;
            return res.json({ result: 2 });
        } else {
            count = 1;
            req.session.destroy(function (err) {
                if (err) {
                    return;
                }
            });
            return res.json({ result: 3 });
        }
    } else {
        count = 1;
        req.session.destroy(function (err) {
            if (err) {
                return;
            }
        });
        return res.json({ result: 3 });
    }

});




router.post("/unload", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            return;
        }
    });
});


router.post("/idcheck", function (req, res) {
    var id = req.body.id;
    dbconn.resultQuery("select id from users where id='" + id + "'", function (result) {
        if (result.rows.length == 0) {
            return res.json({ id_msg: true });
        } else {
            return res.json({ id_msg: false });
        }
    });
});

module.exports = router;