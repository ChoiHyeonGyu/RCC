var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var import_default = '';
var logo = '';
var main_header = '';
var navigator = '';
var navigator_side = '';
var footer = '';
var contentsSideNav = '';

fs.readFile("header/import_default.html", "utf-8", function(error, data) {
    import_default = data;
});
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

router.get("/breifing", function(req, res) {
    fs.readFile("breifing/breifing.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            logo: logo,
            main_header: main_header,
            navigator: navigator,
            navigator_side: navigator_side,
            footer: footer,
            contentsSideNav: contentsSideNav
        }));
    });
});

router.get("/breifing_view", function(req, res) {
    fs.readFile("breifing/breifing_view.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            logo: logo,
            main_header: main_header,
            navigator: navigator,
            navigator_side: navigator_side,
            footer: footer,
            contentsSideNav: contentsSideNav
        }));
    });
});

router.get("/breifing_detail", function(req, res) {
    fs.readFile("breifing/breifing_detail.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            logo: logo,
            main_header: main_header,
            navigator: navigator,
            navigator_side: navigator_side,
            footer: footer,
            contentsSideNav: contentsSideNav
        }));
    });
});

router.get("/commentary", function(req, res) {
    fs.readFile("commentary/commentary.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            logo: logo,
            main_header: main_header,
            navigator: navigator,
            navigator_side: navigator_side,
            footer: footer,
            contentsSideNav: contentsSideNav
        }));
    });
});

router.get("/commentary_view", function(req, res) {
    fs.readFile("commentary/commentary_view.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            logo: logo,
            main_header: main_header,
            navigator: navigator,
            navigator_side: navigator_side,
            footer: footer,
            contentsSideNav: contentsSideNav
        }));
    });
});

router.get("/commentary_detail", function(req, res) {
    fs.readFile("commentary/commentary_detail.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            logo: logo,
            main_header: main_header,
            navigator: navigator,
            navigator_side: navigator_side,
            footer: footer,
            contentsSideNav: contentsSideNav
        }));
    });
});

router.get("/channel", function(req, res) {
    fs.readFile("channel.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data));
    });
});

router.get("/donate", function(req, res) {
    fs.readFile("donate.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data));
    });
});

router.get("/search_result", function(req, res) {
    fs.readFile("search_result.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data));
    });
});

router.get("/breifing_write", function(req, res) {
    fs.readFile("breifing/breifing_write.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            logo: logo,
            main_header: main_header,
            navigator: navigator,
            navigator_side: navigator_side,
            footer: footer,
            contentsSideNav: contentsSideNav
        }));
    });
});

router.get("/commentary_write", function(req, res) {
    fs.readFile("commentary/commentary_write.html", "utf-8", function(error, data) {
        res.send(ejs.render(import_default + data, {
            logo: logo,
            main_header: main_header,
            navigator: navigator,
            navigator_side: navigator_side,
            footer: footer,
            contentsSideNav: contentsSideNav
        }));
    });
});

module.exports = router;