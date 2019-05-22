var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/login", function(req, res) {
    fs.readFile("login.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
        }));
    });

});

router.get("/signup", function(req, res) {
    fs.readFile("signup.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
        }));
    });
});


router.post("/login",function(req,res){
// 1. login처리를 함.디비
// 2. 이전 페이지로
});


module.exports = router;