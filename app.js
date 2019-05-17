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
app.get("/", function (req, res) {});
app.get("/join", function (req, res) {
    fs.readFile("index/join.html", (err, data) => {
        res.end(data);
    });
});
app.post("/join", function (req, res) {});

app.get("/login", function (req, res) {});

http.createServer(app).listen(9999, 'localhost');
console.log('Server On');


