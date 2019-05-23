var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/my", function(req, res) {
    dbconn.resultQuery("select * from users, (select count(*) subscriber from subscribe where channeluser = '"+req.session.user_id+"'), "+ 
    "(select count(*) post from post where userid = '"+req.session.user_id+"'), (select count(*) reply from comments where userid = '"+req.session.user_id+"') "+
    "where id = '"+req.session.user_id+"'", function(result) {
        var sel = req.url.charAt(req.url.length-1);

        if(sel == 'y'){
            dbconn.resultQuery("select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"'", function(result2){
                listing(result2);
            });
        } else if(sel == '1') {
            dbconn.resultQuery("select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"'", function(result2){
                listing(result2);
            });
        } else if(sel == '2') {
            dbconn.resultQuery("select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b full join "+
            "(select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on "+
            "u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where "+
            "p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid", function(result2){
                var point = -1;
                var pid = 0;
                for(var i = 0; i < result2.rows.length; i++){
                    if(result2.rows[i][6] == null){
                        if(pid == result2.rows[i][0]){
                            result2.rows[point][7] += ',' + result2.rows[i][7];
                            result2.rows.splice(i, 1);
                            i--;
                        } else {
                            point = i;
                            pid = result2.rows[i][0];
                        }
                    }
                }
                console.log(result2);
                listing(result2);
            });
        } else if(sel == '3') {
            dbconn.resultQuery("select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"'", function(result2){
                listing(result2);
            });
        }
        
        function listing(result2){
            fs.readFile("mypage.html", "utf-8", function(error, data) {
                res.send(ejs.render(include.import_default() + data, {
                    logo: include.logo(),
                    main_header: include.main_header(),
                    my: result,
                    list: result2
                }));
            });
        }
    });
});

router.get("/channel", function(req, res) {
    fs.readFile("channel.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
        }));
    });
});

router.get("/donate", function(req, res) {
    fs.readFile("donate.html", "utf-8", function(error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
        }));
    });
});

module.exports = router;