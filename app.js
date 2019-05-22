var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    key: 'SID',
    secret: "0x5050594520737061726b706f6f6c2d6574682d636e2d687a",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24000 * 60 * 60
    }
}));

app.use("/css",express.static(__dirname + "/css"));
app.use("/js",express.static(__dirname + "/js"));
app.use("/images",express.static(__dirname + "/images"));

var path_router_CHG = require('./js/nodejs/path_router_CHG.js');
app.use(path_router_CHG);

var path_router_CTY = require('./js/nodejs/path_router_CTY.js');
app.use(path_router_CTY);

var path_router_RDE = require('./js/nodejs/path_router_RDE.js');
app.use(path_router_RDE);

app.listen(3000, 'localhost', function() {
    console.log("서버 구동 중...");
});