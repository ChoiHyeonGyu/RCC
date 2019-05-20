var express = require('express');
var app = express();
var bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


http.createServer(app).listen(9999, 'localhost');
console.log('Server On');


