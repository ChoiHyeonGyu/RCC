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
        dbconn.resultQuery("select * from users, (select count(*) subscriber from subscribe where channeluser = '"+req.session.user_id+"'), "+ 
        "(select count(*) post from post where userid = '"+req.session.user_id+"'), (select count(*) reply from comments where userid = '"+req.session.user_id+"') "+
        "where id = '"+req.session.user_id+"'", function(result) {
            if(req.query.s == '1'){
                dbconn.resultQuery("select * from (select s.sid, s.channeluser from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' order by s.sid desc) where rownum <= 10", function(result2){
                    dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                        listing(result2, result3);
                    });
                });
            } else if(req.query.s == '2') {
                dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, b.headline from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid order by p.pid desc) p where rownum <= 60", function(result2){
                    if(result2.rows[0] != null){
                        result2 = dataSorting(result2);
                        dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                            listing(result2, result3);
                        });
                    } else {
                        result2.rows = [];
                        listing(result2, []);
                    }
                });
            } else if(req.query.s == '3') {
                dbconn.resultQuery("select * from (select p.pid, p.pdate, c.cost, p.mdate, p.categoryname, p.detailname, c.title from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid order by p.pid desc) p where rownum <= 60", function(result2){
                    if(result2.rows[0] != null){
                        result2 = dataSorting(result2);
                        dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                            listing(result2, result3);
                        });
                    } else {
                        result2.rows = [];
                        listing(result2, []);
                    }
                });
            } else if(req.query.s == '4') {
                dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.cid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' order by c.cmntid desc) where rownum <= 10", function(result2){
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
            dbconn.resultQuery("select * from (select s.sid, s.channeluser from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query,id+" order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query,id+" order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    dbconn.resultQuery("select max(sid) from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid > "+req.query.id+") where rownum <= 100", function(result4){
                        paging(result2, result3, result4);
                    });
                });
            });
        } else if(req.query.s == '2') {
            dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, b.headline from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid <= "+req.query.id+" order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select max(pid) from (select p.pid from briefingdetail b join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid where p.pid > "+req.query.id+" group by p.pid order by p.pid desc) where rownum <= 60", function(result4){
                            paging(result2, result3, result4);
                        });
                    });
            });
        } else if(req.query.s == '3') {
            dbconn.resultQuery("select * from (select p.pid, p.pdate, c.cost, p.mdate, p.categoryname, p.detailname, c.title from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid where p.pid <= "+req.query.id+" order by p.pid desc) p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid where p.pid <= "+req.query.id+" group by p.pid order by p.pid desc) where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select max(pid) from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid where p.pid > "+req.query.id+" group by p.pid order by p.pid desc) where rownum <= 60", function(result4){
                            paging(result2, result3, result4);
                        });
                    });
            });
        } else if(req.query.s == '4') {
            dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.cid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid <= "+req.query.cmntid+" order by c.cmntid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select cmntid from (select rownum as rn, cmntid from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid <= "+req.query.cmntid+" order by c.cmntid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    for(var i = 0; i < result2.rows.length; i++){
                        result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                    }
                    dbconn.resultQuery("select max(cmntid) from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid > "+req.query.cmntid+") where rownum <= 100", function(result4){
                        paging(result2, result3, result4);
                    });
                });
            });
        } else {
            dbconn.resultQuery("select * from (select s.sid, s.subscriber from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query,id+" order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query.id+" order by s.sid desc) where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    dbconn.resultQuery("select max(sid) from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid > "+req.query.id+") where rownum <= 100", function(result4){
                        paging(result2, result3, result4);
                    });
                });
            });
        }

        function paging(result2, result3, result4){
            if(result4.rows[0] == null){
                res.send({rows: result2.rows, page: result3});
            } else {
                res.send({rows: result2.rows, page: result3, previd: result4.rows[0][0]});
            }
        }
    } else {
        res.redirect("/");
    }
});

function dataSorting(result2){
    var point = -1;
    var pid = 0;
    var cnt = 0;
    for(var i = 0; i < result2.rows.length; i++){
        if(result2.rows[i][6] == null){
            if(pid == result2.rows[i][0]){
                if(cnt < 2){
                    result2.rows[point][7] += ', ' + result2.rows[i][7];
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
    while(result2.rows.length > 6){
        result2.rows.splice(6, 1);
    }
    return result2;
}

router.get("/post/search", function(req, res){
    if(req.query.txt){
        if(req.query.pid){
            dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, p.headline from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
                "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on "+
                "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
                "where p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 1200", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select * from (select p.pid from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
                "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on "+
                "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
                "where p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61", function(result3){
                    res.send({rows: result2.rows, page: srchSorting(result3)});
                });
            });
        } else if(req.query.cmntid) {
            dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.cid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' "+
            "and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') order by c.cmntid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select * from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') "+
                "order by c.cmntid desc) where rownum <= 101", function(result3){
                    var pagenumlist = [];
                    for(var i = 0; i < result2.rows.length; i++){
                        result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                    }
                    for(var i = 0; i < result3.rows.length; i+=10){
                        pagenumlist.push(result3.rows[i][0]);
                    }
                    res.send({rows: result2.rows, page: pagenumlist});
                });
            });
        } else {
            dbconn.resultQuery("select * from (select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' order by s.sid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select * from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' order by s.sid desc) where rownum <= 101", function(result3){
                    var pagenumlist = [];
                    for(var i = 0; i < result3.rows.length; i+=10){
                        pagenumlist.push(result3.rows[i][0]);
                    }
                    res.send({rows: result2.rows, page: pagenumlist});
                });
            });
        }
    }
});

router.get("/post/search/pagelist", function(req, res){
    if(req.query.txt){
        if(req.query.pid){
            dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, p.headline from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
                "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on "+
                "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
                "where (p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') and p.pid <= "+req.query.pid+" order by p.pid desc) where rownum <= 1200", 
                function(result2){
                    result2 = dataSorting(result2);
                dbconn.resultQuery("select * from (select p.pid from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
                "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on "+
                "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
                "where (p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') and p.pid <= "+req.query.pid+" order by p.pid desc) where rownum <= 61", 
                function(result3){
                    dbconn.resultQuery("select max(pid) from (select p.pid from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
                    "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on "+
                    "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
                    "where (p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') and p.pid > "+req.query.pid+") where rownum <= 60", 
                    function(result4){
                        if(result4.rows[0] == null){
                            res.send({rows: result2.rows, page: pagenumlist});
                        } else {
                            res.send({rows: result2.rows, page: srchSorting(result3), prevpid: result4.rows[0][0]});
                        }
                    });
                });
            });
        } else if(req.query.cmntid) {
            dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.cid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' "+
            "and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') and c.cmntid <= "+req.query.cmntid+" order by c.cmntid desc) where rownum <= 10", function(result2){
                dbconn.resultQuery("select * from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') "+
                "and c.cmntid <= "+req.query.cmntid+" order by c.cmntid desc) where rownum <= 101", function(result3){
                    var pagenumlist = [];
                    for(var i = 0; i < result2.rows.length; i++){
                        result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                    }
                    for(var i = 0; i < result3.rows.length; i+=10){
                        pagenumlist.push(result3.rows[i][0]);
                    }
                    dbconn.resultQuery("select max(cmntid) from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and (c1.title like '%"+req.query.txt+"%' or c.comments like '%"+req.query.txt+"%') "+
                    "and c.cmntid > "+req.query.cmntid+" order by c.cmntid) where rownum <= 100", function(result4){
                        if(result4.rows[0] == null){
                            res.send({rows: result2.rows, page: pagenumlist});
                        } else {
                            res.send({rows: result2.rows, page: pagenumlist, prevcmntid: result4.rows[0][0]});
                        }
                    });
                });
            });
        } else {
            dbconn.resultQuery("select * from (select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' and s.sid <= "+req.query.sid+" order by s.sid desc) "+
            "where rownum <= 10", function(result2){
                dbconn.resultQuery("select * from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' and s.sid <= "+req.query.sid+" order by s.sid desc) "+
                "where rownum <= 101", function(result3){
                    var pagenumlist = [];
                    for(var i = 0; i < result3.rows.length; i+=10){
                        pagenumlist.push(result3.rows[i][0]);
                    }
                    dbconn.resultQuery("select max(sid) from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.subscriber like '%"+req.query.txt+"%' and s.sid > "+req.query.sid+") "+
                    "where rownum <= 100", function(result4){
                        if(result4.rows[0] == null){
                            res.send({rows: result2.rows, page: pagenumlist});
                        } else {
                            res.send({rows: result2.rows, page: pagenumlist, prevsid: result4.rows[0][0]});
                        }
                    });
                });
            });
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
    dbconn.resultQuery("select * from (select * from (select id, nickname from users where id = '"+req.query.SEID+"'), (select count(*) subscriber from subscribe where channeluser = '"+req.query.SEID+"'), "+ 
    "(select count(*) post from post where userid = '"+req.query.SEID+"')) u left join (select channeluser from subscribe where subscriber = '"+req.session.user_id+"' and channeluser = '"+req.query.SEID+"') s on u.id = s.channeluser", function(result) {
        dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
        "right join (select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
        "post p on u.id = p.userid where u.id = '"+req.query.SEID+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid "+
        "or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid order by p.pid desc) p where rownum <= 60", function(result2){
            if(result2.rows[0] != null){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select * from (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.SEID+"' order by p.pid desc) where rownum <= 61", function(result3){
                    var pagenumlist = [];
                    for(var i = 0; i < result3.rows.length; i+=6){
                        pagenumlist.push(result3.rows[i][0]);
                    }
                    listing(result2, pagenumlist);
                });
            } else {
                result2.rows = [];
                listing(result2, []);
            }
        });

        function listing(result2, pagenumlist){
            fs.readFile("channel.html", "utf-8", function(error, data) {
                res.send(ejs.render(include.import_default() + data, {
                    logo: include.logo(),
                    main_header: include.main_header(req.session.user_id),
                    my: result,
                    list: result2,
                    page: pagenumlist
                }));
            });
        }
    });
});

router.get("/channel/post/pagelist", function(req, res){
    dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
    "right join (select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
    "post p on u.id = p.userid where u.id = '"+req.query.id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where "+
    "p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid where p.pid <= "+req.query.pid+" order by p.pid desc) p where rownum <= 60", function(result2){
        result2 = dataSorting(result2);
        dbconn.resultQuery("select * from (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.id+"' and p.pid <= "+req.query.pid+" order by p.pid desc) where rownum <= 61", function(result3){
            var pagenumlist = [];
            for(var i = 0; i < result3.rows.length; i+=6){
                pagenumlist.push(result3.rows[i][0]);
            }
            dbconn.resultQuery("select max(pid) from (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.id+"' and p.pid > "+req.query.pid+") where rownum <= 60", function(result4){
                if(result4.rows[0] == null){
                    res.send({rows: result2.rows, page: pagenumlist});
                } else {
                    res.send({rows: result2.rows, page: pagenumlist, prevpid: result4.rows[0][0]});
                }
            });
        });
    });
});

router.get("/subscribe", function(req, res){
    dbconn.booleanQuery("insert into subscribe values(subscribe_sequence.nextval, '"+req.session.user_id+"', '"+req.query.channelID+"')", function(result){
        if(result){
            res.send('1');
        } else {
            res.send('0');
        }
    });
});

router.get("/subscribe/cancel", function(req, res){
    dbconn.booleanQuery("delete from subscribe where subscriber = '"+req.session.user_id+"' and channeluser = '"+req.query.channelID+"'", function(result){
        if(result){
            res.send('1');
        } else {
            res.send('0');
        }
    });
});

router.get("/channel/post/search", function(req, res){
    if(req.query.txt){
        dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, p.headline from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
            "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on "+
            "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
            "where p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 1200", function(result2){
            result2 = dataSorting(result2);
            dbconn.resultQuery("select * from (select p.pid from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
            "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on "+
            "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
            "where p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61", function(result3){
                res.send({rows: result2.rows, page: srchSorting(result3)});
            });
        });
    }
});

router.get("/channel/search/pagelist", function(req, res){
    if(req.query.txt){
        dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, p.headline from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
            "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on "+
            "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
            "where (p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') and p.pid <= "+req.query.pid+" order by p.pid desc) where rownum <= 1200", 
            function(result2){
                result2 = dataSorting(result2);
            dbconn.resultQuery("select * from (select p.pid from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
            "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on "+
            "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
            "where (p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') and p.pid <= "+req.query.pid+" order by p.pid desc) where rownum <= 61", 
            function(result3){
                dbconn.resultQuery("select max(pid) from (select p.pid from (select p.*, b.bsummary from (select p.*, b.headline from briefingdetail b right join "+
                "(select p.*, c.title from commentary c right join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on "+
                "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid) p full join briefingsummary b on p.pid = b.pid) p full join hashtag h on p.pid = h.pid "+
                "where (p.title like '%"+req.query.txt+"%' or p.headline like '%"+req.query.txt+"%' or p.bsummary like '%"+req.query.txt+"%' or h.keyword like '%"+req.query.txt+"%') and p.pid > "+req.query.pid+") where rownum <= 60", 
                function(result4){
                    if(result4.rows[0] == null){
                        res.send({rows: result2.rows, page: pagenumlist});
                    } else {
                        res.send({rows: result2.rows, page: srchSorting(result3), prevpid: result4.rows[0][0]});
                    }
                });
            });
        });
    }
});

function srchSorting(result3){
    var pid = 0;
    var pagenumlist = [];
    for(var i = 0; i < result3.rows.length; i++){
        if(pid == result3.rows[i][0]){
            result3.rows.splice(i, 1);
            i--;
        } else {
            pid = result3.rows[i][0];
        }
    }
    for(var i = 0; i < result3.rows.length; i+=6){
        pagenumlist.push(result3.rows[i][0]);
    }
    return pagenumlist;
}

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