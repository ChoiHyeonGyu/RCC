var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var moment = require('moment');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/my", function(req, res) {
    dbconn.resultQuery("select * from users, (select count(*) subscriber from subscribe where channeluser = '"+req.session.user_id+"'), "+ 
    "(select count(*) post from post where userid = '"+req.session.user_id+"'), (select count(*) reply from comments where userid = '"+req.session.user_id+"') "+
    "where id = '"+req.session.user_id+"'", function(result) {
        if(req.query.s == '1'){
            dbconn.resultQuery("select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"'", function(result2){
                listing(result2);
            });
        } else if(req.query.s == '2') {
            dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
            "full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
            "post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where "+
            "p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid order by p.pid desc) p where rownum <= 60", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select * from (select pid from post order by pid desc) where rownum <= 61",function(result3){
                    var pagenumlist = [];
                    for(var i = 0; i < result3.rows.length; i+=6){
                        pagenumlist.push(result3.rows[i][0]);
                    }
                    listing(result2, pagenumlist);
                });
            });
        } else if(req.query.s == '3') {
            dbconn.resultQuery("select c.cmntid, c.comments, c.cdate, c1.title from comments c join commentary c1 on c.cid = c1.cid where userid = '"+req.session.user_id+"'", function(result2){
                for(var i = 0; i < result2.rows.length; i++){
                    result2.rows[i][2] = moment(result2.rows[i][2]).format("YYYY-MM-DD HH:mm:ss");
                }
                listing(result2);
            });
        } else {
            dbconn.resultQuery("select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"'", function(result2){
                listing(result2);
            });
        }
        
        function listing(result2, pagenumlist){
            fs.readFile("mypage.html", "utf-8", function(error, data) {
                res.send(ejs.render(include.import_default() + data, {
                    logo: include.logo(),
                    main_header: include.main_header(),
                    my: result,
                    list: result2,
                    page: pagenumlist
                }));
            });
        }
    });
});

router.get("/pagelist", function(req, res){
    dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
    "full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
    "post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where "+
    "p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid where p.pid <= "+req.query.pid+" order by p.pid desc) p where rownum <= 60", function(result2){
        result2 = dataSorting(result2);
        dbconn.resultQuery("select * from (select pid from post where pid <= "+req.query.pid+" order by pid desc) where rownum <= 61",function(result3){
            var pagenumlist = [];
            for(var i = 0; i < result3.rows.length; i+=6){
                pagenumlist.push(result3.rows[i][0]);
            }
            res.send({rows: result2.rows, page: pagenumlist});
        });
    });
});

function dataSorting(result2){
    var point = -1;
    var pid = 0;
    var cnt = 0;
    for(var i = 0; i < result2.rows.length; i++){
        if(result2.rows[i][6] == null){
            if(pid == result2.rows[i][0]){
                if(cnt < 2){
                    result2.rows[point][7] += ',' + result2.rows[i][7];
                }
                result2.rows.splice(i, 1);
                cnt++;
                i--;
            } else {
                point = i;
                pid = result2.rows[i][0];
                cnt = 0;
            }
        }
        result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
        result2.rows[i][3] = moment(result2.rows[i][3]).format("YYYY-MM-DD HH:mm:ss");
    }
    var i = 6;
    while(i != result2.rows.length){
        result2.rows.splice(i, 1);
    }
    return result2;
}

router.post("/user/modify", function(req, res){
    var id = req.session.user_id;
    var pw = req.body.pw1;
    var name = req.body.name1;
    var nickname = req.body.nickname1;
    var email = req.body.email1;
    var cellphone = req.body.cellphone1;
    
    dbconn.booleanQuery("update users set pw='"+pw+"', name='"+name+"', nickname='"+nickname+"', coinaddress='0x111111', email='"+email+"', cellphone='"+cellphone+"' where id='"+id+"'", function(result){
        if(result == false){
            res.write("<script>alert('fail!');</script>");
            res.write('<script>history.back();</script>');
        } else {
            res.write("<script>alert('update completed!');</script>");
            res.write('<script>history.go(-1);</script>');
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