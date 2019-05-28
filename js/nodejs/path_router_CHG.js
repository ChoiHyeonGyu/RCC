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

router.get("/my", function(req, res){
    if(req.session.user_id){
        dbconn.resultQuery("select * from users, (select count(*) subscriber from subscribe where channeluser = '"+req.session.user_id+"'), "+ 
        "(select count(*) post from post where userid = '"+req.session.user_id+"'), (select count(*) reply from comments where userid = '"+req.session.user_id+"') "+
        "where id = '"+req.session.user_id+"'", function(result) {
            if(req.query.s == '1'){
                dbconn.resultQuery("select * from (select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' order by sid desc) where rownum <= 10", function(result2){
                    listing(result2);
                });
            } else if(req.query.s == '2') {
                dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
                "full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
                "post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid "+
                "or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid order by p.pid desc) p where rownum <= 60", function(result2){
                    if(result2.rows[0][0] != null){
                        result2 = dataSorting(result2);
                        dbconn.resultQuery("select * from (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"' order by p.pid desc) where rownum <= 61", function(result3){
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
            } else if(req.query.s == '3') {
                dbconn.resultQuery("select * from (select c.cmntid, c.comments, c.cdate, c1.title from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' order by c.cmntid desc) where rownum <= 10", function(result2){
                    dbconn.resultQuery("select * from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' order by c.cmntid desc) where rownum <= 101", function(result3){
                        var pagenumlist = [];
                        for(var i = 0; i < result2.rows.length; i++){
                            result2.rows[i][2] = moment(result2.rows[i][2]).format("YYYY-MM-DD HH:mm:ss");
                        }
                        for(var i = 0; i < result3.rows.length; i+=10){
                            pagenumlist.push(result3.rows[i][0]);
                        }
                        listing(result2, pagenumlist);
                    });
                });
            } else {
                dbconn.resultQuery("select * from (select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' order by s.sid desc) where rownum <= 10", function(result2){
                    dbconn.resultQuery("select * from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' order by s.sid desc) where rownum <= 101", function(result3){
                        var pagenumlist = [];
                        for(var i = 0; i < result3.rows.length; i+=10){
                            pagenumlist.push(result3.rows[i][0]);
                        }
                        listing(result2, pagenumlist);
                    });
                });
            }

            function listing(result2, pagenumlist){
                fs.readFile("mypage.html", "utf-8", function(error, data) {
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
    } else {
        res.redirect("/");
    }
});

router.get("/subscriber/pagelist", function(req, res){
    dbconn.resultQuery("select * from (select s.* from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query.sid+" order by s.sid desc) where rownum <= 10", function(result2){
        dbconn.resultQuery("select * from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid <= "+req.query.sid+" order by s.sid desc) where rownum <= 101", function(result3){
            var pagenumlist = [];
            for(var i = 0; i < result3.rows.length; i+=10){
                pagenumlist.push(result3.rows[i][0]);
            }
            dbconn.resultQuery("select max(sid) from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid > "+req.query.sid+") where rownum <= 100", function(result4){
                if(result4.rows[0] == null){
                    res.send({rows: result2.rows, page: pagenumlist});
                } else {
                    res.send({rows: result2.rows, page: pagenumlist, prevsid: result4.rows[0][0]});
                }
            });
        });
    });
});

router.get("/post/pagelist", function(req, res){
    dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
    "full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
    "post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where "+
    "p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid where p.pid <= "+req.query.pid+" order by p.pid desc) p where rownum <= 60", function(result2){
        result2 = dataSorting(result2);
        dbconn.resultQuery("select * from (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"' and p.pid <= "+req.query.pid+" order by p.pid desc) where rownum <= 61", function(result3){
            var pagenumlist = [];
            for(var i = 0; i < result3.rows.length; i+=6){
                pagenumlist.push(result3.rows[i][0]);
            }
            dbconn.resultQuery("select max(pid) from (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"' and p.pid > "+req.query.pid+") where rownum <= 60", function(result4){
                if(result4.rows[0] == null){
                    res.send({rows: result2.rows, page: pagenumlist});
                } else {
                    res.send({rows: result2.rows, page: pagenumlist, prevpid: result4.rows[0][0]});
                }
            });
        });
    });
});

router.get("/reply/pagelist", function(req, res){
    dbconn.resultQuery("select * from (select c.cmntid, c.comments, c.cdate, c1.title from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid <= "+req.query.cmntid+" order by c.cmntid desc) "+
    "where rownum <= 10", function(result2){
        dbconn.resultQuery("select * from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid <= "+req.query.cmntid+" order by c.cmntid desc) where rownum <= 101", function(result3){
            var pagenumlist = [];
            for(var i = 0; i < result2.rows.length; i++){
                result2.rows[i][2] = moment(result2.rows[i][2]).format("YYYY-MM-DD HH:mm:ss");
            }
            for(var i = 0; i < result3.rows.length; i+=10){
                pagenumlist.push(result3.rows[i][0]);
            }
            dbconn.resultQuery("select max(cmntid) from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid > "+req.query.cmntid+") where rownum <= 100", function(result4){
                if(result4.rows[0] == null){
                    res.send({rows: result2.rows, page: pagenumlist});
                } else {
                    res.send({rows: result2.rows, page: pagenumlist, prevcmntid: result4.rows[0][0]});
                }
            });
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
    while(result2.rows.length > 6){
        result2.rows.splice(6, 1);
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

router.get("/channel", function(req, res){
    dbconn.resultQuery("select * from (select id, nickname from users where id = '"+req.query.subscriberID+"'), "+
    "(select count(*) subscriber from subscribe where channeluser = '"+req.query.subscriberID+"'), "+ 
    "(select count(*) post from post where userid = '"+req.query.subscriberID+"')", function(result) {
        dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
        "full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
        "post p on u.id = p.userid where u.id = '"+req.query.subscriberID+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid "+
        "or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid order by p.pid desc) p where rownum <= 60", function(result2){
            if(result2.rows[0][0] != null){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select * from (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.subscriberID+"' order by p.pid desc) where rownum <= 61", function(result3){
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
    "full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
    "post p on u.id = p.userid where u.id = '"+req.query.id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where "+
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
        dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
        "full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
        "post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where "+
        "p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid where p.pid like '%"+req.query.txt+"%' or p.pdate like '%"+req.query.txt+"%' or "+
        "p.viewcount like '%"+req.query.txt+"%' or p.mdate like '%"+req.query.txt+"%' or p.categoryname like '%"+req.query.txt+"%' or "+
        "p.detailname like '%"+req.query.txt+"%' or p.title like '%"+req.query.txt+"%' or b.headline like '%"+req.query.txt+"%' "+
        "order by p.pid desc) p where rownum <= 60", function(result2){
            result2 = dataSorting(result2);
            dbconn.resultQuery("select * from (select p.pid from briefingdetail b full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from "+
            "(select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on "+
            "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid where "+
            "p.pid like '%"+req.query.txt+"%' or p.pdate like '%"+req.query.txt+"%' or p.viewcount like '%"+req.query.txt+"%' or p.mdate like '%"+req.query.txt+"%' or "+
            "p.categoryname like '%"+req.query.txt+"%' or p.detailname like '%"+req.query.txt+"%' or p.title like '%"+req.query.txt+"%' or "+
            "b.headline like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61", function(result3){
                var pagenumlist = [];
                for(var i = 0; i < result3.rows.length; i+=6){
                    pagenumlist.push(result3.rows[i][0]);
                }
                res.send({rows: result2.rows, page: pagenumlist});
            });
        });
    }
});

router.get("/channel/search/pagelist", function(req, res){
    if(req.query.txt){
        dbconn.resultQuery("select * from (select p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname, p.title, b.headline from briefingdetail b "+
        "full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join "+
        "post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where "+
        "p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid where p.pid like '%"+req.query.txt+"%' or p.pdate like '%"+req.query.txt+"%' or "+
        "p.viewcount like '%"+req.query.txt+"%' or p.mdate like '%"+req.query.txt+"%' or p.categoryname like '%"+req.query.txt+"%' or "+
        "p.detailname like '%"+req.query.txt+"%' or p.title like '%"+req.query.txt+"%' or b.headline like '%"+req.query.txt+"%' and p.pid <= "+req.query.pid+""+
        "order by p.pid desc) p where rownum <= 60", function(result2){
            result2 = dataSorting(result2);
            dbconn.resultQuery("select * from (select p.pid from briefingdetail b full join (select p.*, c.title from commentary c full join (select p.*, c.detailname from "+
            "(select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.channelID+"') p join category c on "+
            "p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid where "+
            "p.pid like '%"+req.query.txt+"%' or p.pdate like '%"+req.query.txt+"%' or p.viewcount like '%"+req.query.txt+"%' or p.mdate like '%"+req.query.txt+"%' or "+
            "p.categoryname like '%"+req.query.txt+"%' or p.detailname like '%"+req.query.txt+"%' or p.title like '%"+req.query.txt+"%' or "+
            "b.headline like '%"+req.query.txt+"%' order by p.pid desc) where rownum <= 61", function(result3){
                var pagenumlist = [];
                for(var i = 0; i < result3.rows.length; i+=6){
                    pagenumlist.push(result3.rows[i][0]);
                }
                res.send({rows: result2.rows, page: pagenumlist});
            });
            dbconn.resultQuery("select max(pid) from (select p.pid from briefingdetail b full join (select p.*, c.title from commentary c full join "+
            "(select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where "+
            "u.id = '"+req.query.channelID+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid where "+
            "p.catedetail = c.detailid) p on p.pid = c.pid) p on p.pid = b.pid where p.pid like '%"+req.query.txt+"%' or p.pdate like '%"+req.query.txt+"%' or "+
            "p.viewcount like '%"+req.query.txt+"%' or p.mdate like '%"+req.query.txt+"%' or p.categoryname like '%"+req.query.txt+"%' or "+
            "p.detailname like '%"+req.query.txt+"%' or p.title like '%"+req.query.txt+"%' or b.headline like '%"+req.query.txt+"%'"+
            " and p.pid > "+req.query.pid+") where rownum <= 60", function(result3){
                if(result3.rows[0] == null){
                    res.send({rows: result2.rows, page: pagenumlist});
                } else {
                    res.send({rows: result2.rows, page: pagenumlist, prevpid: result3.rows[0][0]});
                }
            });
        });
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