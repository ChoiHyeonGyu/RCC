var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/css",express.static(__dirname + "/css"));
app.use("/js",express.static(__dirname + "/js"));

var path_router = require('./js/nodejs/path_router.js');
app.use(path_router);

app.listen(3000, 'localhost', function() {
    console.log("서버 구동 중...");
});