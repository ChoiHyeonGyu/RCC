var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", function(req, res) {
    fs.readFile("main.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

router.get("/login", function(req, res) {
    fs.readFile("login.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data));
    });
});

router.get("/signup", function(req, res) {
    fs.readFile("signup.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data));
    });
});

router.get("/my", function(req, res) {
    fs.readFile("mypage.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
        }));
    });
});

router.get("/breifing", function(req, res) {
    fs.readFile("breifing/breifing.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

router.get("/breifing_view", function(req, res) {
    fs.readFile("breifing/breifing_view.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

router.get("/breifing_detail", function(req, res) {
    fs.readFile("breifing/breifing_detail.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

router.get("/commentary", function(req, res) {
    fs.readFile("commentary/commentary.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

router.get("/commentary_view", function(req, res) {
    fs.readFile("commentary/commentary_view.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

router.get("/commentary_detail", function(req, res) {
    fs.readFile("commentary/commentary_detail.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

router.get("/channel", function(req, res) {
    fs.readFile("channel.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data));
    });
});

router.get("/donate", function(req, res) {
    fs.readFile("donate.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data));
    });
});

router.get("/search_result", function(req, res) {
    fs.readFile("search_result.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data));
    });
});

router.get("/breifing_write", function(req, res) {
    fs.readFile("breifing/breifing_write.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

router.get("/commentary_write", function(req, res) {
    fs.readFile("commentary/commentary_write.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: include.contentsSideNav()
        }));
    });
});

module.exports = router;