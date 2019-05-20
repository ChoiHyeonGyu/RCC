var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", function(req, res) {
    fs.readFile("main.html", "utf-8", function(error, data) {
        res.end(data);
    });
});

router.get("/imsi", function(req, res) {
    var logo = '';
    var main_header = '';
    var navigator = '';
    var navigator_side = '';
    var footer = '';
    var contentsSideNav = '';

    var import_default = '';

    fs.readFile("header/logo.html", "utf-8", function(error, data) {
        logo = data;
    });
    fs.readFile("header/main_header.html", "utf-8", function(error, data) {
        main_header = data;
    });
    fs.readFile("header/navigator.html", "utf-8", function(error, data) {
        navigator = data;
    });
    fs.readFile("header/navigator_side.html", "utf-8", function(error, data) {
        navigator_side = data;
    });
    fs.readFile("footer.html", "utf-8", function(error, data) {
        footer = data;
    });
    fs.readFile("header/contentsSideNav.html", "utf-8", function(error, data) {
        contentsSideNav = data;
    });

    fs.readFile("header/import_default.html", "utf-8", function(error, data) {
        import_default = data;
    });

    fs.readFile("mypage.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            data: "되냐?"
        }));
    });
});

module.exports = router;