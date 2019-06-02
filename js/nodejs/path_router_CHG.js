var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var moment = require('moment');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');
var ether = require('../web3js/ethereum');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/my", function(req, res){
    if(req.session.user_id){
        dbconn.resultQuery("select * from users, (select count(*) subscriber from subscribe where channeluser = '"+req.session.user_id+"'), (select count(*) post from post where userid = '"+req.session.user_id+"'), (select count(*) reply from comments where userid = '"+req.session.user_id+"') where id = '"+req.session.user_id+"'", function(result) {
            if(req.query.s == '1'){
                dbconn.resultQuery("select * from (select s.sid, s.channeluser from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' order by s.sid desc) where rownum <= 10", function(result2){
                    dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                        listing(result2, result3);
                    });
                });
            } else if(req.query.s == '2') {
                dbconn.resultQuery("select * from (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        listing(result2, result3);
                    });
                });
            } else if(req.query.s == '3') {
                dbconn.resultQuery("select * from (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        listing(result2, result3);
                    });
                });
            } else if(req.query.s == '4') {
                dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.pid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' order by c.cmntid desc) where rownum <= 10", function(result2){
                    dbconn.resultQuery("select cmntid from (select rownum as rn, cmntid from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' order by c.cmntid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                        for(var i = 0; i < result2.rows.length; i++){
                            result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                        }
                        listing(result2, result3);
                    });
                });
            } else {
                dbconn.resultQuery("select * from (select s.sid, s.subscriber from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' order by s.sid desc) where rownum <= 10", function(result2){
                    dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                        listing(result2, result3);
                    });
                });
            }

            function listing(result2, result3){
                fs.readFile("mypage.html", "utf-8", function(error, data) {
                    res.send(ejs.render(include.import_default() + data, {
                        logo: include.logo(),
                        main_header: include.main_header(req.session.user_id),
                        my: result,
                        list: result2,
                        page: result3
                    }));
                });
            }
        });
    } else {
        res.redirect("/");
    }
});

router.get("/my/pagelist", function(req, res){
    if(req.session.user_id){
        if(req.query.s == '1'){
            dbconn.resultQuery("select * from (select s.sid, s.channeluser from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    dbconn.resultQuery("select max(sid) from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid > "+req.query.id+") where rownum <= 100", function(result4){
                        paging(result2, result3, result4);
                    });
                });
            });
        } else if(req.query.s == '2') {
            dbconn.resultQuery("select * from (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select max(pid) from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid where p.pid > "+req.query.id+" group by p.pid) where rownum <= 60", function(result4){
                            paging(result2, result3, result4);
                        });
                    });
            });
        } else if(req.query.s == '3') {
            dbconn.resultQuery("select * from (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid where p.pid <= "+req.query.id+" order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid where p.pid <= "+req.query.id+" group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select max(pid) from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid where p.pid > "+req.query.id+" group by p.pid) where rownum <= 60", function(result4){
                            paging(result2, result3, result4);
                        });
                    });
            });
        } else if(req.query.s == '4') {
            dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.pid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid <= "+req.query.id+" order by c.cmntid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select cmntid from (select rownum as rn, cmntid from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid <= "+req.query.id+" order by c.cmntid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    for(var i = 0; i < result2.rows.length; i++){
                        result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                    }
                    dbconn.resultQuery("select max(cmntid) from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid > "+req.query.id+") where rownum <= 100", function(result4){
                        paging(result2, result3, result4);
                    });
                });
            });
        } else {
            dbconn.resultQuery("select * from (select s.sid, s.subscriber from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    dbconn.resultQuery("select max(sid) from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid > "+req.query.id+") where rownum <= 100", function(result4){
                        paging(result2, result3, result4);
                    });
                });
            });
        }

        function paging(result2, result3, result4){
            if(result4.rows[0] == null){
                res.send({data: result2, page: result3});
            } else {
                res.send({data: result2, page: result3, previd: result4.rows[0][0]});
            }
        }
    }
});

function dataSorting(result2){
    for(var i = 0; i < result2.rows.length; i++){
        result2.rows[i][5] = moment(result2.rows[i][5]).format("YYYY-MM-DD HH:mm:ss");
        result2.rows[i][6] = moment(result2.rows[i][6]).format("YYYY-MM-DD HH:mm:ss");
    }
    while(result2.rows.length > 6){
        result2.rows.splice(6, 1);
    }
    return result2;
}

router.get("/my/search", function(req, res){
    if(req.session.user_id && req.query.txt){
        if(req.query.s == '1'){
            dbconn.resultQuery("select * from (select s.sid, s.channeluser from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.channeluser like '%"+req.query.txt+"%' order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.channeluser like '%"+req.query.txt+"%' order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    res.send({data: result2, page: result3});
                });
            });
        } else if(req.query.s == '2') {
            dbconn.resultQuery("select * from (select p.pid, p.headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2) headline from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid group by p.pid) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        res.send({data: result2, page: result3});
                    });
            });
        } else if(req.query.s == '3') {
            dbconn.resultQuery("select * from (select p.pid, p.title, p.categoryname, p.detailname, p.cost, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid) p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        res.send({data: result2, page: result3});
                    });
            });
        } else if(req.query.s == '4') {
            dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.pid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') order by c.cmntid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select cmntid from (select rownum as rn, cmntid from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') order by c.cmntid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    for(var i = 0; i < result2.rows.length; i++){
                        result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                    }
                    res.send({data: result2, page: result3});
                });
            });
        } else {
            dbconn.resultQuery("select * from (select s.sid, s.subscriber from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    res.send({data: result2, page: result3});
                });
            });
        }
    }
});

router.get("/my/search/pagelist", function(req, res){
    if(req.session.user_id && req.query.txt){
        if(req.query.s == '1'){
            dbconn.resultQuery("select * from (select s.sid, s.channeluser from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.channeluser like '%"+req.query.txt+"%' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.channeluser like '%"+req.query.txt+"%' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    dbconn.resultQuery("select max(sid) from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.channeluser like '%"+req.query.txt+"%' and s.sid > "+req.query.id+") where rownum <= 100", function(result4){
                        srchpaging(result2, result3, result4);
                    });
                });
            });
        } else if(req.query.s == '2') {
            dbconn.resultQuery("select * from (select p.pid, p.headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2) headline from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select max(pid) from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2) headline from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid where p.pid > "+req.query.id+" group by p.pid) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') where rownum <= 60", function(result4){
                            srchpaging(result2, result3, result4);
                        });
                    });
            });
        } else if(req.query.s == '3') {
            dbconn.resultQuery("select * from (select p.pid, p.title, p.categoryname, p.detailname, p.cost, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid where p.pid <= "+req.query.id+") p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid where p.pid <= "+req.query.id+") p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select max(pid) from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid where p.pid > "+req.query.id+") p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') where rownum <= 60", function(result4){
                            srchpaging(result2, result3, result4);
                        });
                    });
            });
        } else if(req.query.s == '4') {
            dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.pid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') and c.cmntid <= "+req.query.id+" order by c.cmntid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select cmntid from (select rownum as rn, cmntid from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') and c.cmntid <= "+req.query.id+" order by c.cmntid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    for(var i = 0; i < result2.rows.length; i++){
                        result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                    }
                    dbconn.resultQuery("select max(cmntid) from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') and c.cmntid > "+req.query.id+") where rownum <= 100", function(result4){
                        srchpaging(result2, result3, result4);
                    });
                });
            });
        } else {
            dbconn.resultQuery("select * from (select s.sid, s.subscriber from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    dbconn.resultQuery("select max(sid) from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' and s.sid > "+req.query.id+") where rownum <= 100", function(result4){
                        srchpaging(result2, result3, result4);
                    });
                });
            });
        }

        function srchpaging(result2, result3, result4){
            if(result4.rows[0] == null){
                res.send({data: result2, page: result3});
            } else {
                res.send({data: result2, page: result3, previd: result4.rows[0][0]});
            }
        }
    }
});

router.post("/user/modify", function(req, res){
    var id = req.session.user_id;
    var pw = req.body.pw1;
    var name = req.body.name1;
    var nickname = req.body.nickname1;
    var email = req.body.email1;
    var cellphone = req.body.cellphone1;
    
    var salt = crypto.createHash("sha512").update(id+name+nickname+email+cellphone).digest("base64");
    crypto.pbkdf2(pw, salt, parseInt(cellphone.substr(5, 6)), 64, "sha512", function(err, key){
        if(err) console.log(err);

        dbconn.booleanQuery("update users set pw='"+key.toString("base64")+"', name='"+name+"', nickname='"+nickname+"', coinaddress='0x111111', email='"+email+"', cellphone='"+cellphone+"' where id='"+id+"'", function(result){
            if(result == false){
                res.write("<script>alert('fail!');</script>");
                res.write('<script>history.back();</script>');
            } else {
                res.write("<script>alert('update completed!');</script>");
                res.write('<script>history.go(-1);</script>');
            }
        });
    });
});

router.get("/channel", function(req, res){
    dbconn.resultQuery("select * from (select * from (select id, nickname from users where id = '"+req.query.chnlid+"'), (select count(*) subscriber from subscribe where channeluser = '"+req.query.chnlid+"'), (select count(*) post from post where userid = '"+req.query.chnlid+"')) u left join (select channeluser from subscribe where subscriber = '"+req.session.user_id+"' and channeluser = '"+req.query.chnlid+"') s on u.id = s.channeluser", function(result) {
        if(req.query.s == '1') {
            dbconn.resultQuery("select * from (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid order by p.pid desc) p where rownum <= 60", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                    listing(result2, result3);
                });
            });
        } else {
            dbconn.resultQuery("select * from (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname order by p.pid desc) p where rownum <= 60", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                    listing(result2, result3);
                });
            });
        }

        function listing(result2, result3){
            fs.readFile("channel.html", "utf-8", function(error, data) {
                res.send(ejs.render(include.import_default() + data, {
                    logo: include.logo(),
                    main_header: include.main_header(req.session.user_id),
                    my: result,
                    list: result2,
                    page: result3,
                    userid: req.session.user_id
                }));
            });
        }
    });
});

router.get("/channel/pagelist", function(req, res){
    if(req.query.s == '1') {
        dbconn.resultQuery("select * from (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid where p.pid <= "+req.query.id+" order by p.pid desc) p where rownum <= 60", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid where p.pid <= "+req.query.id+" group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                    dbconn.resultQuery("select max(pid) from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid where p.pid > "+req.query.id+" group by p.pid) where rownum <= 60", function(result4){
                        paging(result2, result3, result4);
                    });
                });
        });
    } else {
        dbconn.resultQuery("select * from (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname order by p.pid desc) p where rownum <= 60", function(result2){
            result2 = dataSorting(result2);
            dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                dbconn.resultQuery("select max(pid) from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid where p.pid > "+req.query.id+" group by p.pid) where rownum <= 60", function(result4){
                    paging(result2, result3, result4);
                });
            });
        });
    }

    function paging(result2, result3, result4){
        if(result4.rows[0] == null){
            res.send({data: result2, page: result3});
        } else {
            res.send({data: result2, page: result3, previd: result4.rows[0][0]});
        }
    }
});

router.get("/subscribe", function(req, res){
    dbconn.booleanQuery("insert into subscribe values(subscribe_sequence.nextval, '"+req.session.user_id+"', '"+req.query.chnlid+"')", function(result){
        if(result){
            res.send('1');
        } else {
            res.send('0');
        }
    });
});

router.get("/subscribe/cancel", function(req, res){
    dbconn.booleanQuery("delete from subscribe where subscriber = '"+req.session.user_id+"' and channeluser = '"+req.query.chnlid+"'", function(result){
        if(result){
            res.send('1');
        } else {
            res.send('0');
        }
    });
});

router.get("/channel/search", function(req, res){
    if(req.query.txt){
        if(req.query.s == '1') {
            dbconn.resultQuery("select * from (select p.pid, p.title, p.categoryname, p.detailname, p.cost, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid) p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        res.send({data: result2, page: result3});
                    });
            });
        } else {
            dbconn.resultQuery("select * from (select p.pid, p.headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) p where rownum <= 60", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2) headline from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid group by p.pid) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                    res.send({data: result2, page: result3});
                });
            });
        }
    }
});

router.get("/channel/search/pagelist", function(req, res){
    if(req.query.txt){
        if(req.query.s == '1') {
            dbconn.resultQuery("select * from (select p.pid, p.title, p.categoryname, p.detailname, p.cost, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid where p.pid <= "+req.query.id+") p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid where p.pid <= "+req.query.id+") p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select max(pid) from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.pid, c.title from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid where p.pid > "+req.query.id+") p on p.pid = h.pid where p.title like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') where rownum <= 60", function(result4){
                            srchpaging(result2, result3, result4);
                        });
                    });
            });
        } else {
            dbconn.resultQuery("select * from (select p.pid, p.headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2) headline from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select max(pid) from (select p.pid from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from hashtag group by pid) h join (select p.*, b.bsummary from briefingsummary b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2) headline from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid where p.pid > "+req.query.id+" group by p.pid) p on p.pid = b.pid) p on p.pid = h.pid where p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') where rownum <= 60", function(result4){
                            srchpaging(result2, result3, result4);
                        });
                    });
            });
        }

        function srchpaging(result2, result3, result4){
            if(result4.rows[0] == null){
                res.send({data: result2, page: result3});
            } else {
                res.send({data: result2, page: result3, previd: result4.rows[0][0]});
            }
        }
    }
});

router.get("/donate", function(req, res){
    if(req.session.user_id){
        fs.readFile("donate.html", "utf-8", function(error, data) {
            res.send(ejs.render(include.import_default() + data, {
                logo: include.logo(),
                main_header: include.main_header(req.session.user_id),
            }));
        });
    } else {
        res.redirect("/");
    }
});

module.exports = router;