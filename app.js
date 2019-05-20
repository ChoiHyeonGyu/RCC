var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var main_router = require('./js/nodejs/main_router.js');
app.use(main_router);

app.listen(3000, 'localhost', function() {
    console.log("서버 구동 중...");
});