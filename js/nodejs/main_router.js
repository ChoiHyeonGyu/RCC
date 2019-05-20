var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var import_default = '';

fs.readFile("header/import_default.html", "utf-8", function(error, data) {
    import_default = data;
});

router.get("/", function(req, res) {
    fs.readFile("main.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data));
    });
});

router.get("/login", function(req, res) {
    fs.readFile("login.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data));
    });
});

router.get("/signup", function(req, res) {
    fs.readFile("signup.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data));
    });
});

router.get("/my", function(req, res) {
    fs.readFile("mypage.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data));
    });
});

module.exports = router;