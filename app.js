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
    console.log("Join Page")
});

app.get("/login", function (req, res) {
    res.end("welcome Login page")
});

http.createServer(app).listen(9999, 'localhost');
console.log('Server On');


