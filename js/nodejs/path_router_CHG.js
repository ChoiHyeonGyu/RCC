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
        if(req.query.sort == '1') {
            var sc = "";
            var flag = "";
            var standard = "p.pid";
            var standard2 = "";
            var first_condition = "";
            var condition = "";
        } else if(req.query.sort == '2') {
            var sc = "desc";
            var flag = ", p.viewcount";
            var standard = "p.viewcount";
            var standard2 = ", p.pid desc";
            var first_condition = "";
            var condition = "having p.viewcount > 0";
        } else if(req.query.sort == '3') {
            var sc = "desc";
            var flag = ", c.cost"
            var standard = "c.cost";
            var standard2 = ", p.pid desc";
            var first_condition = "where c.cost > 0";
            var condition = "having c.cost > 0";
        } else {
            var sc = "desc";
            var flag = "";
            var standard = "p.pid";
            var standard2 = "";
            var first_condition = "";
            var condition = "";
        }

        dbconn.resultQuery("select * from users, (select count(*) subscriber from subscribe where channeluser = '"+req.session.user_id+"'), (select count(*) post from post where userid = '"+req.session.user_id+"'), (select count(*) reply from comments where userid = '"+req.session.user_id+"'), (select coinaddress from users where id = 'admin') where id = '"+req.session.user_id+"'", function(result) {
            if(req.query.s == '1'){
                dbconn.resultQuery("select * from (select s.sid, s.channeluser from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' order by s.sid "+sc+") where rownum <= 10", function(result2){
                    dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' order by s.sid "+sc+") where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                        ethereum(result2, result3);
                    });
                });
            } else if(req.query.s == '2') {
                dbconn.resultQuery("select * from (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname "+condition+" order by "+standard+" "+sc+" "+standard2+") p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid "+flag+" from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid group by p.pid "+flag+" "+condition+" order by "+standard+" "+sc+" "+standard2+") where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        ethereum(result2, result3);
                    });
                });
            } else if(req.query.s == '3') {
                dbconn.resultQuery("select * from (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid "+first_condition+" order by "+standard+" "+sc+" "+standard2+") p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid group by p.pid "+flag+" "+condition+" order by "+standard+" "+sc+" "+standard2+") where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        ethereum(result2, result3);
                    });
                });
            } else if(req.query.s == '4') {
                dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.pid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' order by c.cmntid "+sc+") where rownum <= 10", function(result2){
                    dbconn.resultQuery("select cmntid from (select rownum as rn, cmntid from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' order by c.cmntid "+sc+") where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                        for(var i = 0; i < result2.rows.length; i++){
                            result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                        }
                        ethereum(result2, result3);
                    });
                });
            } else {
                dbconn.resultQuery("select * from (select s.sid, s.subscriber from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' order by s.sid "+sc+") where rownum <= 10", function(result2){
                    dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' order by s.sid "+sc+") where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                        ethereum(result2, result3);
                    });
                });
            }

            function ethereum(result2, result3){
                ether.getTotalDonate(result.rows[0][4], result.rows[0][11], function(dntl){
                    ether.getBalance(result.rows[0][4], function(coin){
                        ether.getTransactions(result.rows[0][4], 0, 0, function(txlist){
                            ether.pagingTransactions(result.rows[0][4], 0, 0, function(txpage){
                                if(txlist[0] == null){
                                    listing(result2, result3, dntl, coin, txlist, txpage, []);
                                } else {
                                    dbEtherConn(result2, result3, dntl, coin, txlist, txpage, 0, []);
                                }
                            });
                        });
                    });
                });
            }

            function dbEtherConn(result2, result3, dntl, coin, txlist, txpage, idx, arr){
                dbconn.resultQuery("select nickname, coinaddress from users where coinaddress = '"+txlist[idx].from+"' or coinaddress = '"+txlist[idx].to+"'", function(result){
                    arr.push(result.rows[0]);
                    arr.push(result.rows[1]);

                    if(txlist.length - 1 == idx){
                        listing(result2, result3, dntl, coin, txlist, txpage, arr);
                    } else {
                        idx++;
                        dbEtherConn(result2, result3, dntl, coin, txlist, txpage, idx, arr);
                    }
                });
            }

            function listing(result2, result3, dntl, coin, txlist, txpage, arr){
                fs.readFile("mypage.html", "utf-8", function(error, data) {
                    res.send(ejs.render(include.import_default() + data, {
                        logo: include.logo(),
                        main_header: include.main_header(req.session.user_id),
                        my: result,
                        list: result2,
                        page: result3,
                        sort: req.query.sort,
                        dntl: dntl,
                        coin: coin,
                        txlist: txlist,
                        txpage: txpage,
                        converter: arr
                    }));
                });
            }
        });
    } else {
        res.redirect("/login");
    }
});

router.get("/my/pagelist", function(req, res){
    if(req.session.user_id){
        if(req.query.sort == '1') {
            var sc = "";
            var flag = "";
            var standard = "p.pid";
            var standard2 = "";
            var standard3 = "";
            var minscope = ">=";
            var maxscope = "<";
            var func = "min";
            var adddesc = "desc";
            var first_condition = "";
            var condition = "";
        } else if(req.query.sort == '2') {
            var sc = "desc";
            var flag = ", p.viewcount";
            var standard = "p.viewcount";
            var standard2 = ", p.pid desc";
            var standard3 = ", p.pid";
            var minscope = "<=";
            var maxscope = ">";
            var func = "max";
            var adddesc = "";
            var first_condition = "";
            var condition = "having p.viewcount > 0";
        } else if(req.query.sort == '3') {
            var sc = "desc";
            var flag = ", c.cost";
            var standard = "c.cost";
            var standard2 = ", p.pid desc";
            var standard3 = ", p.pid";
            var minscope = "<=";
            var maxscope = ">";
            var func = "max";
            var adddesc = "";
            var first_condition = "and c.cost > 0";
            var condition = "having c.cost > 0";
        } else {
            var sc = "desc";
            var flag = "";
            var standard = "p.pid";
            var standard2 = "";
            var standard3 = "";
            var minscope = "<=";
            var maxscope = ">";
            var func = "max";
            var adddesc = "";
            var first_condition = "";
            var condition = "";
        }

        if(req.query.s == '1'){
            dbconn.resultQuery("select * from (select s.sid, s.channeluser from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid "+minscope+" "+req.query.id+" order by s.sid "+sc+") where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid "+minscope+" "+req.query.id+" order by s.sid "+sc+") where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    dbconn.resultQuery("select "+func+"(sid) from (select s.sid from users u join subscribe s on u.id = s.subscriber where u.id = '"+req.session.user_id+"' and s.sid "+maxscope+" "+req.query.id+" order by s.sid "+adddesc+") where rownum <= 100", function(result4){
                        paging(result2, result3, result4);
                    });
                });
            });
        } else if(req.query.s == '2') {
            dbconn.resultQuery("select * from (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid "+minscope+" "+req.query.id+" group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname "+condition+" order by "+standard+" "+sc+" "+standard2+") p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid "+flag+" from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid where p.pid "+minscope+" "+req.query.id+" group by p.pid "+flag+" "+condition+" order by "+standard+" "+sc+" "+standard2+") where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select "+func+"(pid) from (select p.pid from briefingdetail b join (select p.pid "+flag+" from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = b.pid where p.pid "+maxscope+" "+req.query.id+" group by p.pid "+flag+" "+condition+" order by "+standard+" "+adddesc+" "+standard3+") where rownum <= 60", function(result4){
                            paging(result2, result3, result4);
                        });
                    });
            });
        } else if(req.query.s == '3') {
            dbconn.resultQuery("select * from (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid where p.pid "+minscope+" "+req.query.id+" "+first_condition+" order by "+standard+" "+sc+" "+standard2+") p where rownum <= 60", function(result2){
                    result2 = dataSorting(result2);
                    dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid where p.pid "+minscope+" "+req.query.id+" group by p.pid "+flag+" "+condition+" order by "+standard+" "+sc+" "+standard2+") where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                        dbconn.resultQuery("select "+func+"(pid) from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p on p.pid = c.pid where p.pid "+maxscope+" "+req.query.id+" group by p.pid "+flag+" "+condition+" order by "+standard+" "+adddesc+" "+standard3+") where rownum <= 60", function(result4){
                            paging(result2, result3, result4);
                        });
                    });
            });
        } else if(req.query.s == '4') {
            dbconn.resultQuery("select * from (select c.comments, c.cdate, c1.title, c1.pid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid "+minscope+" "+req.query.id+" order by c.cmntid "+sc+") where rownum <= 10", function(result2){
                dbconn.resultQuery("select cmntid from (select rownum as rn, cmntid from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid "+minscope+" "+req.query.id+" order by c.cmntid "+sc+") where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    for(var i = 0; i < result2.rows.length; i++){
                        result2.rows[i][1] = moment(result2.rows[i][1]).format("YYYY-MM-DD HH:mm:ss");
                    }
                    dbconn.resultQuery("select "+func+"(cmntid) from (select c.cmntid from comments c join commentary c1 on c.cid = c1.cid where c.userid = '"+req.session.user_id+"' and c.cmntid "+maxscope+" "+req.query.id+" order by c.cmntid "+adddesc+") where rownum <= 100", function(result4){
                        paging(result2, result3, result4);
                    });
                });
            });
        } else {
            dbconn.resultQuery("select * from (select s.sid, s.subscriber from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid "+minscope+" "+req.query.id+" order by s.sid "+sc+") where rownum <= 10", function(result2){
                dbconn.resultQuery("select sid from (select rownum as rn, sid from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid "+minscope+" "+req.query.id+" order by s.sid "+sc+") where rownum <= 101) where mod((rn - 1), 10) = 0", function(result3){
                    dbconn.resultQuery("select "+func+"(sid) from (select s.sid from users u join subscribe s on u.id = s.channeluser where u.id = '"+req.session.user_id+"' and s.sid "+maxscope+" "+req.query.id+" order by s.sid "+adddesc+") where rownum <= 100", function(result4){
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
            dbconn.resultQuery("select * from (select p.pid, p.headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from (select * from hashtag where keyword like '%"+req.query.txt+"%') group by pid) h join (select p.*, b.bsummary from (select * from briefingsummary where bsummary like '%"+req.query.txt+"%') b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select * from briefingdetail where headline like '%"+req.query.txt+"%') b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname) p on p.pid = b.pid) p on p.pid = h.pid order by p.pid desc) p where rownum <= 60", function(result2){
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
            dbconn.resultQuery("select * from (select p.pid, p.headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from (select * from hashtag where keyword like '%"+req.query.txt+"%') group by pid) h join (select p.*, b.bsummary from (select * from briefingsummary where bsummary like '%"+req.query.txt+"%') b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select * from briefingdetail where headline like '%"+req.query.txt+"%') b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.session.user_id+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname) p on p.pid = b.pid) p on p.pid = h.pid order by p.pid desc) p where rownum <= 60", function(result2){
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

router.post("/buy", function(req, res){
    if(req.session.user_id && !isNaN(Number(req.body.coin))){
        dbconn.resultQuery("select coinaddress from users where id = 'admin'", function(result){
            ether.sendCoin(result.rows[0][0], req.body.receiver, req.body.coin, "admin", function(){
                res.write("<script>alert('Buy Coin!!!');</script>");
                res.end("<script>location.href = '/my'</script>");
            });
        });
    }
});

router.post("/sell", function(req, res){
    if(req.session.user_id && !isNaN(Number(req.body.coin))){
        dbconn.resultQuery("select coinaddress from users where id = 'admin'", function(result){
            ether.sendCoin(req.body.sender, result.rows[0][0], req.body.coin, req.session.user_id, function(){
                res.write("<script>alert('Sell Coin!!!');</script>");
                res.end("<script>location.href = '/my'</script>");
            });
        });
    }
});

router.get("/txpaging", function(req, res){
    if(req.session.user_id){
        ether.getTransactions(req.query.addr, req.query.bn, req.query.txidx, function(txlist){
            ether.pagingTransactions(req.query.addr, req.query.bn, req.query.txidx, function(txpage){
                ether.prevFirstPageValue(req.query.addr, req.query.bn, req.query.txidx, function(pfpv){
                    if(txlist[0] == null){
                        res.send({txlist: txlist, txpage: txpage, pfpv: pfpv, converter: []});
                    } else {
                        dbEtherConn(txlist, txpage, pfpv, 0, []);
                    }
                });
            });
        });

        function dbEtherConn(txlist, txpage, pfpv, idx, arr){
            dbconn.resultQuery("select nickname, coinaddress from users where coinaddress = '"+txlist[idx].from+"' or coinaddress = '"+txlist[idx].to+"'", function(result){
                arr.push(result.rows[0]);
                arr.push(result.rows[1]);

                if(txlist.length - 1 == idx){
                    res.send({txlist: txlist, txpage: txpage, pfpv: pfpv, converter: arr});
                } else {
                    idx++;
                    dbEtherConn(txlist, txpage, pfpv, idx, arr);
                }
            });
        }
    }
});

router.get("/tx/searchandsort", function(req, res){
    if(req.session.user_id){
        dbconn.resultQuery("select coinaddress from users where nickname like '%"+req.query.slctuser+"%'", function(result){
            ether.searchAndsortTransactions(req.query.addr, req.query.txsc, req.query.txio, result.rows, req.query.slctcoin, req.query.txscope, req.query.bn, req.query.txidx, function(txlist){
                ether.searchAndsortPagingTransactions(req.query.addr, req.query.txsc, req.query.txio, result.rows, req.query.slctcoin, req.query.txscope, req.query.bn, req.query.txidx, function(txpage){
                    ether.searchAndsortPrevFirstPageValue(req.query.addr, req.query.txsc, req.query.txio, result.rows, req.query.slctcoin, req.query.txscope, req.query.bn, req.query.txidx, function(pfpv){
                        if(txlist[0] == null){
                            res.send({txlist: txlist, txpage: txpage, pfpv: pfpv, converter: []});
                        } else {
                            dbEtherConn(txlist, txpage, pfpv, 0, []);
                        }
                    });
                });
            });
        });

        function dbEtherConn(txlist, txpage, pfpv, idx, arr){
            dbconn.resultQuery("select nickname, coinaddress from users where coinaddress = '"+txlist[idx].from+"' or coinaddress = '"+txlist[idx].to+"'", function(result){
                arr.push(result.rows[0]);
                arr.push(result.rows[1]);

                if(txlist.length - 1 == idx){
                    res.send({txlist: txlist, txpage: txpage, pfpv: pfpv, converter: arr});
                } else {
                    idx++;
                    dbEtherConn(txlist, txpage, pfpv, idx, arr);
                }
            });
        }
    }
});

router.post("/user/modify", function(req, res){
    if(req.session.user_id){
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
                    res.write("<script>alert('Fail!');</script>");
                    res.end("<script>location.href = '/my'</script>");
                } else {
                    res.write("<script>alert('Update Completed!');</script>");
                    res.end("<script>location.href = '/my'</script>");
                }
            });
        });
    }
});

router.post("/user/delete", function(req, res){
    if(req.session.user_id){
        dbconn.booleanQuery("delete users where id = '"+req.session.user_id+"'", function(result){
            if(result){
                res.write("<script>alert('Delete Completed!');</script>");
                res.end("<script>location.href = '/'</script>");
            } else {
                res.write("<script>alert('Fail!');</script>");
                res.end("<script>location.href = '/my'</script>");
            }
        });
    }
});

router.get("/channel", function(req, res){
    if(req.query.sort == '1') {
        var sc = "";
        var flag = "";
        var standard = "p.pid";
        var standard2 = "";
        var first_condition = "";
        var condition = "";
    } else if(req.query.sort == '2') {
        var sc = "desc";
        var flag = ", p.viewcount";
        var standard = "p.viewcount";
        var standard2 = ", p.pid desc";
        var first_condition = "";
        var condition = "having p.viewcount > 0";
    } else if(req.query.sort == '3') {
        var sc = "desc";
        var flag = ", c.cost"
        var standard = "c.cost";
        var standard2 = ", p.pid desc";
        var first_condition = "where c.cost > 0";
        var condition = "having c.cost > 0";
    } else {
        var sc = "desc";
        var flag = "";
        var standard = "p.pid";
        var standard2 = "";
        var first_condition = "";
        var condition = "";
    }

    dbconn.resultQuery("select u.id, u.nickname, u.subscriber, u.post, s.channeluser, u.coinaddress, u.adminaddr from (select * from (select id, nickname, coinaddress from users where id = '"+req.query.chnlid+"'), (select count(*) subscriber from subscribe where channeluser = '"+req.query.chnlid+"'), (select count(*) post from post where userid = '"+req.query.chnlid+"'), (select coinaddress adminaddr from users where id = 'admin')) u left join (select channeluser from subscribe where subscriber = '"+req.session.user_id+"' and channeluser = '"+req.query.chnlid+"') s on u.id = s.channeluser", function(result) {
        if(req.query.s == '1') {
            dbconn.resultQuery("select * from (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid "+first_condition+" order by "+standard+" "+sc+" "+standard2+") p where rownum <= 60", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid group by p.pid "+flag+" "+condition+" order by "+standard+" "+sc+" "+standard2+") where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                    ethereum(result2, result3);
                });
            });
        } else {
            dbconn.resultQuery("select * from (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname "+condition+" order by "+standard+" "+sc+" "+standard2+") p where rownum <= 60", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid "+flag+" from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid group by p.pid "+flag+" "+condition+" order by "+standard+" "+sc+" "+standard2+") where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                    ethereum(result2, result3);
                });
            });
        }

        function ethereum(result2, result3){
            ether.getTotalDonate(result.rows[0][5], result.rows[0][6], function(dntl){
                listing(result2, result3, dntl);
            });
        }

        function listing(result2, result3, dntl){
            fs.readFile("channel.html", "utf-8", function(error, data) {
                res.send(ejs.render(include.import_default() + data, {
                    logo: include.logo(),
                    main_header: include.main_header(req.session.user_id),
                    my: result,
                    list: result2,
                    page: result3,
                    userid: req.session.user_id,
                    sort: req.query.sort,
                    dntl: dntl
                }));
            });
        }
    });
});

router.get("/channel/pagelist", function(req, res){
    if(req.query.sort == '1') {
        var sc = "";
        var flag = "";
        var standard = "p.pid";
        var standard2 = "";
        var standard3 = "";
        var minscope = ">=";
        var maxscope = "<";
        var func = "min";
        var adddesc = "desc";
        var first_condition = "";
        var condition = "";
    } else if(req.query.sort == '2') {
        var sc = "desc";
        var flag = ", p.viewcount";
        var standard = "p.viewcount";
        var standard2 = ", p.pid desc";
        var standard3 = ", p.pid";
        var minscope = "<=";
        var maxscope = ">";
        var func = "max";
        var adddesc = "";
        var first_condition = "";
        var condition = "having p.viewcount > 0";
    } else if(req.query.sort == '3') {
        var sc = "desc";
        var flag = ", c.cost";
        var standard = "c.cost";
        var standard2 = ", p.pid desc";
        var standard3 = ", p.pid";
        var minscope = "<=";
        var maxscope = ">";
        var func = "max";
        var adddesc = "";
        var first_condition = "and c.cost > 0";
        var condition = "having c.cost > 0";
    } else {
        var sc = "desc";
        var flag = "";
        var standard = "p.pid";
        var standard2 = "";
        var standard3 = "";
        var minscope = "<=";
        var maxscope = ">";
        var func = "max";
        var adddesc = "";
        var first_condition = "";
        var condition = "";
    }

    if(req.query.s == '1') {
        dbconn.resultQuery("select * from (select p.pid, c.title, p.categoryname, p.detailname, c.cost, p.pdate, p.mdate from commentary c join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = c.pid where p.pid "+minscope+" "+req.query.id+" "+first_condition+" order by "+standard+" "+sc+" "+standard2+") p where rownum <= 60", function(result2){
                result2 = dataSorting(result2);
                dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid where p.pid "+minscope+" "+req.query.id+" group by p.pid "+flag+" "+condition+" order by "+standard+" "+sc+" "+standard2+") where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                    dbconn.resultQuery("select "+func+"(pid) from (select p.pid from commentary c join (select p.pid from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = c.pid where p.pid "+maxscope+" "+req.query.id+" group by p.pid "+flag+" "+condition+" order by "+standard+" "+adddesc+" "+standard3+") where rownum <= 60", function(result4){
                        paging(result2, result3, result4);
                    });
                });
        });
    } else {
        dbconn.resultQuery("select * from (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from briefingdetail b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid "+minscope+" "+req.query.id+" group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname "+condition+" order by "+standard+" "+sc+" "+standard2+") p where rownum <= 60", function(result2){
            result2 = dataSorting(result2);
            dbconn.resultQuery("select pid from (select rownum as rn, pid from (select p.pid from briefingdetail b join (select p.pid "+flag+" from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid where p.pid "+minscope+" "+req.query.id+" group by p.pid "+flag+" "+condition+" order by "+standard+" "+sc+" "+standard2+") where rownum <= 61) where mod((rn - 1), 6) = 0", function(result3){
                dbconn.resultQuery("select "+func+"(pid) from (select p.pid from briefingdetail b join (select p.pid "+flag+" from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p on p.pid = b.pid where p.pid "+maxscope+" "+req.query.id+" group by p.pid "+flag+" "+condition+" order by "+standard+" "+adddesc+" "+standard3+") where rownum <= 60", function(result4){
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
    if(req.session.user_id){
        dbconn.booleanQuery("insert into subscribe values(subscribe_sequence.nextval, '"+req.session.user_id+"', '"+req.query.chnlid+"')", function(result){
            if(result){
                res.send('1');
            } else {
                res.send('0');
            }
        });
    }
});

router.get("/subscribe/cancel", function(req, res){
    if(req.session.user_id){
        dbconn.booleanQuery("delete from subscribe where subscriber = '"+req.session.user_id+"' and channeluser = '"+req.query.chnlid+"'", function(result){
            if(result){
                res.send('1');
            } else {
                res.send('0');
            }
        });
    }
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
            dbconn.resultQuery("select * from (select p.pid, p.headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from (select * from hashtag where keyword like '%"+req.query.txt+"%') group by pid) h join (select p.*, b.bsummary from (select * from briefingsummary where bsummary like '%"+req.query.txt+"%') b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select * from briefingdetail where headline like '%"+req.query.txt+"%') b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname) p on p.pid = b.pid) p on p.pid = h.pid order by p.pid desc) p where rownum <= 60", function(result2){
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
            dbconn.resultQuery("select * from (select p.pid, p.headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select pid, substr(xmlagg(xmlelement(col, ', ', keyword)).extract('//text()').getstringval(), 2) keyword from (select * from hashtag where keyword like '%"+req.query.txt+"%') group by pid) h join (select p.*, b.bsummary from (select * from briefingsummary where bsummary like '%"+req.query.txt+"%') b join (select p.pid, substr(replace(xmlagg(xmlelement(col, ', ', b.headline) order by p.pid desc).extract('//text()').getstringval(), '&quot;', ''), 2, 102) || '.....' headline, p.categoryname, p.detailname, p.viewcount, p.pdate, p.mdate from (select * from briefingdetail where headline like '%"+req.query.txt+"%') b join (select p.*, c.detailname from (select p.*, c.categoryname from (select p.* from users u join post p on u.id = p.userid where u.id = '"+req.query.chnlid+"') p join category c on p.cate = c.categoryid) p join catedetail c on p.cate = c.cateid or c.cateid = 0 where p.catedetail = c.detailid) p on p.pid = b.pid where p.pid <= "+req.query.id+" group by p.pid, p.pdate, p.viewcount, p.mdate, p.categoryname, p.detailname) p on p.pid = b.pid) p on p.pid = h.pid order by p.pid desc) p where rownum <= 60", function(result2){
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
        dbconn.resultQuery("select * from (select nickname, coinaddress from users where id = '"+req.session.user_id+"'), (select nickname, coinaddress from users where id = '"+req.query.chnlid+"')", function(result){
            ether.getBalance(result.rows[0][1], function(coin){
                fs.readFile("donate.html", "utf-8", function(error, data) {
                    if(req.query.preURL.match("postNo=")){
                        var postNo = req.query.preURL.match("postNo=").input.substr(req.query.preURL.match("postNo=").index + 7);
                    } else {
                        var postNo = "nothing";
                    }
                    res.send(ejs.render(include.import_default() + data, {
                        logo: include.logo(),
                        main_header: include.main_header(req.session.user_id),
                        my: result,
                        coin: coin,
                        currentURL: req.url,
                        preURL: req.query.preURL,
                        postNo: postNo
                    }));
                });
            });
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/donate", function(req, res){
    if(req.session.user_id && !isNaN(Number(req.body.coin))){
        ether.sendCoin(req.body.sender, req.body.receiver, req.body.coin, req.session.user_id, function(){
            if(req.body.postNo == "nothing"){
                res.write("<script>alert('Sending Coin!!!');</script>");
                res.end("<script>location.href = '"+req.body.preURL+"'</script>");
            } else {
                dbconn.booleanQuery("update commentary set cost="+req.body.coin+" where pid = "+req.body.postNo, function(result){
                    if(result){
                        res.write("<script>alert('Sending Coin!!!');</script>");
                        res.end("<script>location.href = '"+req.body.preURL+"'</script>");
                    } else {
                        res.write("<script>alert('Fail!');</script>");
                        res.end("<script>location.href = '"+req.body.currentURL+"'</script>");
                    }
                });
            }
        });
    }
});

module.exports = router;