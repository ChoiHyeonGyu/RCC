// B03_express_02_html가져오기.js
// 

var express = require('express');
var http = require('http');
var fs = require('fs');
var app = express();

var oracledb = require('oracledb');

var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/js", express.static(__dirname + '/index/js'));
app.use("/fonts", express.static(__dirname + '/index/fonts'));
app.use("/images", express.static(__dirname + '/index/images'));
app.use("/css", express.static(__dirname + '/index/css'));
app.use("/vendor", express.static(__dirname + '/index/vendor'));

app.all("*", function (req, res, next) {
    //res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    next();
});

app.get("/", function (req, res) {//get방식으로 '/' 경로로 요청이 왔을 때
    var str = "welcome 인덱스 page<hr>";
    str += "<form method='post' action=''>";
    str += "<button>post로 인덱스 페이지에 가면??</button>";
    str += "</form>";
    fs.readFile("index/index.html", (err, data) => {
        console.log("<script>console.log(123);</script>");
        res.end(data);
    });
    //res.end(str)
});

app.get("/join", function (req, res) {
    fs.readFile("index/join.html", (err, data) => {
        res.end(data);
    });
});

app.post("/join", function (req, res) {
    // 데이터가 post로 넘어왔을 때 - body-parser모듈이 있어야 한다.
    console.log(req.body);
    oracledb.autoCommit = true;
    oracledb.getConnection({
        user: "projectdb",
        password: "1234",
        connectString: "localhost:1521/xe"
    }, (err, conn) => {
        if (err) console.log(err);
        else {
            var qry = "insert into member (mno,id,pw,nick,email) values (mno_seq.nextval,'" + req.body.id + "','" + req.body.pw + "','" + req.body.nick + "','" + req.body.email + "')";

            conn.execute(qry, (err2, result) => {
                if (err2) {
                    console.log(err2);
                    res.end("<script>history.back();</script>");
                }
                else {
                    console.log(result);

                    if (result.rowsAffected > 0) {
                        // 로그인 페이지로 redirect
                        console.log(111);
                        //console.log(res);
                        res.redirect('/');
                    } else {
                        // insert 되지 않으면...
                        console.log(222);
                        res.end("<script>history.back();</script>");
                    }
                }
            });
        }
    });

    //res.end(req.body.id);
});

app.get("/login", function (req, res) {
    res.end("welcome Login page")
});

http.createServer(app).listen(9999, 'localhost');
console.log('웹서버 구동중~~~~??');


