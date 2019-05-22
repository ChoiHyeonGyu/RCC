var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var cateNav = false;
var categoryNav = "";
var cateNavPage = "";

console.log(include)
console.log(dbconn)

router.get("*",function(req,res,next){
    
console.log(include)
console.log(dbconn)
    init();
    if(cateNav){
        next();
    }
});

function init(){
    initCategoryNav();
};

function initCategoryNav(){
    if(!cateNav){
        dbconn.resultQuery("select * from category", function(result){
            for(var i = 1; i<=result.rows.length; i++){
                categoryNav += '<a class="nav-link btn-light hover-pointer" id="Cate'+i+'">'+result.rows[i-1][1]+'</a>';
            }
            cateNavPage = ejs.render(include.contentsSideNav(), { categoryNav: categoryNav });
            cateNav = true;
        });
        next();
    }
}

router.get("/", function(req, res) {
    dbconn.resultQuery("select * from category", function(result){
        console.log(result);
    });
    fs.readFile("main.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: cateNavPage
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
            contentsSideNav: cateNavPage
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
            contentsSideNav: cateNavPage
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
            contentsSideNav: cateNavPage
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
            contentsSideNav: cateNavPage
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
            contentsSideNav: cateNavPage
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
            contentsSideNav: cateNavPage
        }));
    });
});

router.get("/search_result", function(req, res) {
    fs.readFile("search_result.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
        }));
    });
});

router.get("/breifing_write", function(req, res) {
    fs.readFile("breifing/breifing_write.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo()
        }));
    });
});

router.get("/commentary_write", function(req, res) {
    fs.readFile("commentary/commentary_write.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo()
        }));
    });
});

module.exports = router;