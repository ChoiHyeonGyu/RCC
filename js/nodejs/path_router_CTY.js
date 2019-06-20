var express = require('express');
var router = express.Router();
var fs = require('fs');
var ejs = require('ejs');
var moment = require('moment');
var bodyParser = require('body-parser');
var include = require('./hdr_nvgtr_side_ftr.js');
var dbconn = require('./oracledb_connect.js');
const {CF} = require('nodeml');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

var cateNav = false;
var categoryNav = "";
var BFcateNavPage = "";
var CMcateNavPage = "";
var categoryList = { 'rows': [] };
var categoryDetailList = { 'rows': [] };


router.get("*", function (req, res, next) {
    if (!cateNav) init(res, function () { next() });
    else next();
});

function init(res, callback) {
    initCategoryNav(callback);
};

function initCategoryNav(callback) {
    if (!cateNav) {
        dbconn.resultQuery("select * from category", function (result) {
            cateDetailList(function (detailresult) {
                for (var i = 0; i < result.rows.length; i++) {
                    if (result.rows[i][0] == 0) continue;
                    categoryList.rows.push([result.rows[i][0], result.rows[i][1]]);
                }
                for (var j = 0; j < detailresult.rows.length; j++) {
                    if (detailresult.rows[j][0] == 0) continue;
                    categoryDetailList.rows.push([detailresult.rows[j][0], detailresult.rows[j][1], detailresult.rows[j][2]]);
                }
                for (var i = 1; i <= result.rows.length; i++) {
                    if (result.rows[i - 1][0] == 0) continue;
                    categoryNav += "<ul class=''>";
                    categoryNav += "<li class=''>";
                    categoryNav += "<span class='nav-link hover-pointer categoryHead cate navHover ' id='categoryId" + result.rows[i - 1][0] + "' onclick='clickNav(this.nextSibling)'>";
                    categoryNav += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + result.rows[i - 1][1];
                    categoryNav += "<span style='float:right;font-weight:bold;padding:0px;transition:none;transition:transform 0.28s ease'>&nbsp;&nbsp;〉&nbsp;&nbsp;</span>";
                    categoryNav += "</span>";
                    categoryNav += "<ul class='collapse ofh dbnh0' id='detail" + result.rows[i - 1][0] + "' aria-expanded='false'>";
                    categoryNav += "<li class=''>";
                    categoryNav += '<a class="nav-link childColor cateChild navHover hover-pointer" href="/breifing_detail?detailId=0&cateId=' + result.rows[i - 1][0] +
                        '&pageNo=1" id="categoryDetailId' + result.rows[i - 1][0] + '00">전체</a>';
                    categoryNav += "</li>";
                    for (var j = 1; j <= detailresult.rows.length; j++) {
                        if (detailresult.rows[j - 1][0] == 0) continue;
                        if (detailresult.rows[j - 1][1] == result.rows[i - 1][0]) {
                            categoryNav += "<li class=''>";
                            categoryNav += '<a class="nav-link childColor cateChild navHover hover-pointer" href="/breifing_detail?detailId=' + detailresult.rows[j - 1][0] + '&cateId=' + detailresult.rows[j - 1][1] +
                                '&pageNo=1" id="categoryDetailId' + detailresult.rows[j - 1][0] + '">' + detailresult.rows[j - 1][2] + '</a>';
                            categoryNav += "</li>";
                        }
                    }
                    categoryNav += "</ul>";
                    categoryNav += "</li>";
                    categoryNav += "</ul>";
                }
                BFcateNavPage = ejs.render(include.contentsSideNav(), { categoryNav: categoryNav });

                categoryNav = "";
                for (var i = 1; i <= result.rows.length; i++) {
                    if (result.rows[i - 1][0] == 0) continue;
                    categoryNav += "<ul class=''>";
                    categoryNav += "<li class=''>";
                    categoryNav += "<span class='nav-link hover-pointer categoryHead cate navHover ' id='categoryId" + result.rows[i - 1][0] + "' onclick='clickNav(this.nextSibling)'>";
                    categoryNav += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + result.rows[i - 1][1];
                    categoryNav += "<span style='float:right;font-weight:bold;padding:0px;transition:none;transition:transform 0.28s ease'>&nbsp;&nbsp;〉&nbsp;&nbsp;</span>";
                    categoryNav += "</span>";
                    categoryNav += "<ul class='collapse ofh dbnh0' id='detail" + result.rows[i - 1][0] + "' aria-expanded='false'>";
                    categoryNav += "<li class=''>";
                    categoryNav += '<a class="nav-link childColor cateChild navHover hover-pointer" href="/commentary_detail?detailId=0&cateId=' + result.rows[i - 1][0] +
                        '&pageNo=1" id="categoryDetailId' + result.rows[i - 1][0] + '00">전체</a>';
                    categoryNav += "</li>";
                    for (var j = 1; j <= detailresult.rows.length; j++) {
                        if (detailresult.rows[j - 1][0] == 0) continue;
                        if (detailresult.rows[j - 1][1] == result.rows[i - 1][0]) {
                            categoryNav += "<li class=''>";
                            categoryNav += '<a class="nav-link childColor cateChild navHover hover-pointer" href="/commentary_detail?detailId=' + detailresult.rows[j - 1][0] + '&cateId=' + detailresult.rows[j - 1][1] +
                                '&pageNo=1" id="categoryDetailId' + detailresult.rows[j - 1][0] + '">' + detailresult.rows[j - 1][2] + '</a>';
                            categoryNav += "</li>";
                        }
                    }
                    categoryNav += "</ul>";
                    categoryNav += "</li>";
                    categoryNav += "</ul>";
                }
                CMcateNavPage = ejs.render(include.contentsSideNav(), { categoryNav: categoryNav });
                cateNav = true;
                callback();
            });
        });
    }
}

function query(str, callback) {
    dbconn.resultQuery(str, function (result) {
        callback(result);
    });
}
function pageResultQuery(str, pageResult, callback) {
    dbconn.resultQuery(str, function (result) {
        callback(pageResult, result);
    });
}
function cateDetailList(callback) {
    query("select * from catedetail", function (result) {
        callback(result);
    });
}
function paging(str, detailstr, page_size, page_list_size, currPage, callback) {
    //현재 페이지에 맞는 페이지 아이디를 가져옴
    //그 아이디에 맞는 것만 골라오는 쿼리를 실행한다
    query(str, function (result) {//전체 페이지 쿼리
        var totalCount = result.rows.length;
        var startPage;
        var endPage;
        var nextBtn = 1;
        var preBtn = 1;
        var pageCount = result.rows.length;
        //페이지 목록을 가져올 쿼리 작성
        //1 1~6 2 7~12
        startPage = parseInt((currPage - 1) / 10) * 10 + 1;
        endPage = parseInt((currPage - 1) / 10) * 10 + page_list_size;
        if (parseInt(totalCount / page_size) < endPage) endPage = parseInt(totalCount / page_size) == (totalCount / page_size) ? parseInt(totalCount / page_size) : parseInt(totalCount / page_size) + 1;
        if (parseInt((currPage - 1) / 10) == 0) preBtn = 0;
        if (parseInt(totalCount / page_size) <= endPage) nextBtn = 0;
        var pageResult = {
            startPage: startPage,
            endPage: endPage,
            nextBtn: nextBtn,
            preBtn: preBtn,
            curPage: currPage,
            pageCount: pageCount
        };

        var pageQuery = detailstr;
        pageResultQuery(pageQuery, pageResult, callback);
    });
}
function hashTag(pageList, callback) {
    var pageListString;
    if (pageList.rows.length == 0) pageListString = "(pid=-1)";
    else {
        pageListString = "(pid=" + pageList.rows[0][0];
        for (var i = 1; i < pageList.rows.length; i++) {
            pageListString += " or pid=" + pageList.rows[i][0];
        }
        pageListString += ")";
    }
    query("select pid, keyword from hashTag where " + pageListString, function (result) {
        callback(result);
    });
}

function getMainBreifing(callback) {
    dbconn.resultQuery("select h.*,cate.cate from (select PID,SUBSTR(XMLAGG(XMLELEMENT(COL ,' <br>', headline)).EXTRACT('//text()').GETSTRINGVAL(),2) headline " +
        "from (select b.pid,nvl(h.headline,substr((select headline from briefingdetail where bid=b.bid),0,47)||'...') as headline from" +
        "(select pid,bid from briefingdetail where pid in (select c.pid from (" +
        "select pid from (select rownum row1, c.* from (select post.pid from post where briefing=1 order by pdate desc) c) where row1>=1 and row1<=4) c)) b left join (select bid,headline from briefingdetail) h on b.bid=h.bid and length(h.headline)<50) group by pid) h," +
        "(select post.pid,category.CATEGORYNAME ||' - '||catedetail.DETAILNAME as cate from (select * from (select * from (select rownum row1, c.* from (select * from post where briefing=1 order by pdate desc) c) where row1>=1 and row1<=6) c where row1>=1 and row1<=5) post,category,catedetail where post.cate=category.CATEGORYID and post.CATEDETAIL = catedetail.DETAILID) cate where h.pid=cate.pid"
        , function (result) {
            callback(result);
        });
}
function getMainCommentary(callback) {
    dbconn.resultQuery("select p.*,c.*,u.id,cate.cate from (select c.cid,c.pid,c.title,c.cost,cm.cnt from commentary c full outer join (select cid, count(*) as cnt from comments group by cid) cm on c.cid=cm.cid) c,(select pid,pdate,userid from post where briefing=0 and pid in (select pid from (select rownum row1,c.pid from (select pid from post where briefing=0 order by pdate desc) c) where row1>=1 and row1<=12)) p, users u,(select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) cate where p.pid=c.pid and p.userid=u.id and cate.pid=p.pid order by p.pdate desc"
        , function (result) {
            callback(result);
        });
}
function getMainUsers(callback) {
    dbconn.resultQuery("select users.*,nvl(cntp.cnt,0) cntc,nvl(cntp.vcnt,0) cost from (select users.*,nvl(cntp.cntb,0),nvl(cntp.vcnt,0) from (select * from (select rownum row1, u.* from (select channeluser,count(*) cnt from subscribe group by channeluser order by cnt desc) u) where row1>=1 and row1<=12) users left join (select userid,count(*) cntb,sum(viewcount) vcnt from post where briefing=1 group by userid) cntp on cntp.userid = users.channeluser) users left join (select post.userid,count(*) cnt ,sum(cost) vcnt from commentary, post where post.pid=commentary.pid and post.briefing=0 group by post.userid) cntp on users.channeluser=cntp.userid"
        , function (result) {
            callback(result);
        });
}

function collavorativeFiltering(userid,callback){
    if(userid==null){
        callback();
        return;
    }
    let train = [];
    dbconn.resultQuery("select userid,pid,weight from viewinfo",function(infoResult){
        for (let i = 0; i < infoResult.rows.length; i++) {
            var temp = new Object();
            temp.userid = infoResult.rows[i][0];
            temp.pid = infoResult.rows[i][1];
            temp.weight = infoResult.rows[i][2];
            train.push(temp);
        }
        const cf = new CF();
        cf.train(train, 'userid', 'pid', 'weight');
        var cfresult = cf.recommendToUser(userid,10);
        var query = "where (pid=-1";
        for(var i=0; i<cfresult.length;i++){
            query+= " or pid="+cfresult[i].itemId;
        }
        query+=")"
        if(cfresult.length==0)query="";
        dbconn.resultQuery("select p.*,c.briefing,c.userid,c.cost,c.cnt from ( "+
            "select p.pid,p.title,c.cate from (select p.pid,nvl(c.title,(select title from commentary where pid=p.pid)) as title from (select pid from post "+query+") p left join (SELECT p.pid,SUBSTR(XMLAGG(XMLELEMENT(COL ,' <br>', headline) ORDER BY p.pdate).EXTRACT('//text()').GETSTRINGVAL(),2) title FROM "+
            "(select pid,headline,pdate from (select post.pid, briefingdetail.headline,post.pdate, row_number() over(partition by post.pid order by briefingdetail.bid) rn from post,briefingdetail where post.pid = briefingdetail.pid and post.pid in (select pid from post "+query+")) where rn <=3)"+
            " p GROUP BY p.pid) c on c.pid = p.pid) p left join ( select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID "+query+") c"+
            " on p.pid=c.pid) p left join (select p.*,c.cost,c.cnt from (select pid,briefing,userid from post "+query+") p left join (select commentary.pid,commentary.cost,c.cnt from commentary left join (select cid,count(*) as cnt from comments group by cid) c on c.cid=commentary.cid) c on c.pid=p.pid) c on c.pid=p.pid"
            ,function(result){
            callback(result);
        });
    });
}

router.get("/", function (req, res) {
    //main에 가기전 게시판에 띄울 정보 로드
    //추가로 가능하다면 ajax로 글 등록시 다시 로드
    collavorativeFiltering(req.session.user_id,function(cfResult){
        getMainBreifing(function (bResult) {
            getMainCommentary(function (cResult) {
                getMainUsers(function (uResult) {
                    fs.readFile("main.html", "utf-8", function (error, data) {
                        res.send(ejs.render(include.import_default() + data, {
                            logo: include.logo(),
                            main_header: include.main_header(req.session.user_id),
                            navigator: include.navigator(),
                            navigator_side: include.navigator_side(),
                            footer: include.footer(),
                            bResult: bResult,
                            cResult: cResult,
                            uResult: uResult,
                            cfResult:cfResult
                        }));
                    });
                });
            });
        });
    });
});

function getBreifingResult(pageListString, sort, callback) {
    var sort1 = ("select post.pid,h.hl,c.cate,post.pdate from post," +
        "(select PID,SUBSTR(XMLAGG(XMLELEMENT(COL ,' <br>', b.headline)).EXTRACT('//text()').GETSTRINGVAL(),2) hl from (select pid,headline,pdate from( select post.pid, briefingdetail.headline,post.pdate, row_number() over(partition by post.pid order by briefingdetail.bid) rn from post,briefingdetail where post.pid = briefingdetail.pid) where rn <=3 order by pid desc, pdate asc) b group by b.pid) h," +
        "(select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) c" +
        " where post.pid = h.pid and post.pid = c.pid " + pageListString + " order by post.pdate desc");
    var sort2 = ("select post.pid,h.hl,c.cate,post.pdate from post," +
        "(select PID,SUBSTR(XMLAGG(XMLELEMENT(COL ,' <br>', b.headline)).EXTRACT('//text()').GETSTRINGVAL(),2) hl from (select pid,headline,pdate from( select post.pid, briefingdetail.headline,post.pdate, row_number() over(partition by post.pid order by briefingdetail.bid) rn from post,briefingdetail where post.pid = briefingdetail.pid) where rn <=3 order by pid desc, pdate asc) b group by b.pid) h," +
        "(select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) c" +
        " where post.pid = h.pid and post.pid = c.pid " + pageListString + " order by post.pdate asc");
    var orderQuery;
    orderQuery = sort == 1 ? sort1 : sort2;
    callback(orderQuery);
}

function getCommentaryResult(pageListString, sort, callback) {
    var sort1 = "select p.*,c.*,u.id,cate.cate from (select c.cid,c.pid,c.title,c.cost,cm.cnt from commentary c full outer join (select cid, count(*) as cnt from comments group by cid) cm on c.cid=cm.cid) c,(select pid,pdate,userid from post where briefing=0 " + pageListString + ") p, users u,(select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) cate where p.pid=c.pid and p.userid=u.id and cate.pid=p.pid order by p.pdate desc";
    var sort2 = "select p.*,c.*,u.id,cate.cate from (select c.cid,c.pid,c.title,c.cost,cm.cnt from commentary c full outer join (select cid, count(*) as cnt from comments group by cid) cm on c.cid=cm.cid) c,(select pid,pdate,userid from post where briefing=0 " + pageListString + ") p, users u,(select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) cate where p.pid=c.pid and p.userid=u.id and cate.pid=p.pid order by p.pdate asc";
    var sort3 = "select p.*,c.*,u.id,cate.cate from (select c.cid,c.pid,c.title,c.cost,cm.cnt from commentary c full outer join (select cid, count(*) as cnt from comments group by cid) cm on c.cid=cm.cid) c,(select pid,pdate,userid from post where briefing=0 " + pageListString + ") p, users u,(select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) cate where p.pid=c.pid and p.userid=u.id and cate.pid=p.pid order by c.cost desc";
    var orderQuery;
    orderQuery = sort == 1 ? sort1 : sort == 2 ? sort2 : sort3;
    callback(orderQuery);
}

router.get("/breifing", function (req, res) {
    var page_size = 6;
    var currPage = req.query.pageNo;
    var startPost = (currPage - 1) * page_size + 1;
    var endPost = currPage * page_size;
    var sort = req.query.sort;
    if (sort == undefined) sort = 1;
    var order = sort == 1 ? "desc" : "asc";
    paging("select pid from post where briefing=1", "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=1 order by pdate " + order + ")) where row2>=" + startPost + " and row2<=" + endPost, page_size, 10, currPage, function (pageResult, pageList) {
        var pageListString;
        if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
        else {
            pageListString = "and (post.pid=" + pageList.rows[0][0];
            for (var i = 1; i < pageList.rows.length; i++) {
                pageListString += " or post.pid=" + pageList.rows[i][0];
            }
            pageListString += ")";
        }
        getBreifingResult(pageListString, sort, function (orderQuery) {
            query(orderQuery,
                function (result) {
                    fs.readFile("breifing/breifing.html", "utf-8", function (error, data) {
                        res.send(ejs.render(include.import_default() + data, {
                            logo: include.logo(),
                            main_header: include.main_header(req.session.user_id),
                            navigator: include.navigator(),
                            navigator_side: include.navigator_side(),
                            footer: include.footer(),
                            contentsSideNav: BFcateNavPage,
                            result: result,
                            pagingResult: pageResult,
                            sort: sort
                        }));
                    });
                });
        });
    });
});
function getHashTagByPostNo(postNo, callback) {
    dbconn.resultQuery("select * from hashtag where pid=" + postNo, function (result) {
        callback(result);
    });
}

function getHeadlineByPostNo(postNo, callback) {
    dbconn.resultQuery("select * from briefingdetail where pid=" + postNo, function (result) {
        callback(result);
    });
}

function getSummaryByPostNo(postNo, callback) {
    dbconn.resultQuery("select * from briefingsummary where pid=" + postNo, function (result) {
        callback(result);
    });
}

function getPost(postNo, callback) {
    dbconn.resultQuery("select * from post where pid=" + postNo, function (result) {
        callback(result);
    });
}

function getCategoryNameByPostNo(postNo, callback) {
    dbconn.resultQuery("select categoryname as cate, detailname as detail from category c, catedetail d,(select cate, catedetail from post where pid=" + postNo + ") s where c.CATEGORYID=s.cate and d.detailid = s.catedetail", function (result) {
        callback(result);
    })
}
function subscribeCheck(writer, viewer, callback) {
    if (viewer == null) {
        callback(false);
        return;
    }
    dbconn.resultQuery("select * from subscribe where channeluser='" + writer + "' and subscriber='" + viewer + "'", function (result) {
        if (result.rows.length != 0) callback(true);
        else callback(false);
    });
}

function updateViewCount(postNo) {
    dbconn.booleanQuery("update post set viewCount = (select viewcount+1 from post where pid=" + postNo + ") where pid=" + postNo, function (result) {

    });
}
function updateViewInfo(postNo, userid, callback) {
    if (userid == null) callback();
    else {
        dbconn.booleanQuery("insert into viewinfo (select viewinfo_sequence.nextval,'" + userid + "'," + postNo + ",1 from dual where not exists (select * from viewinfo where pid=" + postNo + " and userid='" + userid + "'))", function () {
            callback();
        });
    }
}
router.get("/breifing_view", function (req, res) {
    var postNo = req.query.postNo;
    getPost(postNo, function (postResult) {
        getSummaryByPostNo(postNo, function (summaryResult) {
            getHeadlineByPostNo(postNo, function (headlineResult) {
                getHashTagByPostNo(postNo, function (hashtagResult) {
                    getCategoryNameByPostNo(postNo, function (categoryResult) {
                        updateViewInfo(postNo, req.session.user_id, function () {

                            //req.session
                            updateViewCount(postNo);
                            subscribeCheck(postResult.rows[0][1], req.session.user_id, function (subscribeResult) {
                                for (var i = 0; i < postResult.rows.length; i++) {
                                    postResult.rows[i][3] = moment(postResult.rows[i][3]).format("YY.MM.DD HH:mm:ss");
                                    postResult.rows[i][5] = moment(postResult.rows[i][5]).format("YY.MM.DD HH:mm:ss");
                                }
                                var userId = req.session.user_id;
                                fs.readFile("breifing/breifing_view.html", "utf-8", function (error, data) {
                                    res.send(ejs.render(include.import_default() + data, {
                                        logo: include.logo(),
                                        main_header: include.main_header(req.session.user_id),
                                        navigator: include.navigator(),
                                        navigator_side: include.navigator_side(),
                                        footer: include.footer(),
                                        contentsSideNav: BFcateNavPage,
                                        postResult: postResult,
                                        summaryResult: summaryResult,
                                        headlineResult: headlineResult,
                                        hashtagResult: hashtagResult,
                                        categoryResult: categoryResult,
                                        user: userId,
                                        subscribeResult: subscribeResult,
                                        search: req.query.search
                                    }));
                                });
                                //조회수 증가

                            });
                        });
                    })
                });
            });
        });
    });
});

router.get("/breifing_write", function (req, res) {//
    if (req.session.user_id == null) {
        res.write("<script>alert('Login First!');</script>");
        res.end('<script>history.back()</script>');
        return;
    }
    if (req.query.postNo != null) {
        getHeadlineByPostNo(req.query.postNo, function (headlineResult) {
            getSummaryByPostNo(req.query.postNo, function (summaryResult) {
                getHashTagByPostNo(req.query.postNo, function (hashResult) {
                    getPost(req.query.postNo, function (postResult) {
                        fs.readFile("breifing/breifing_write.html", "utf-8", function (error, data) {
                            res.send(ejs.render(include.import_default() + data, {
                                logo: include.logo(),
                                main_header: include.main_header(req.session.user_id),
                                navigator: include.navigator(),
                                navigator_side: include.navigator_side(),
                                footer: include.footer(),
                                contentsSideNav: BFcateNavPage,
                                categoryList: categoryList,
                                categoryDetailList: categoryDetailList,
                                headlineResult: headlineResult,
                                summaryResult: summaryResult,
                                hashResult, hashResult,
                                postResult: postResult
                            }));
                        });
                    });
                });
            });
        });
        return;
    }
    var postResult = null;
    fs.readFile("breifing/breifing_write.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: BFcateNavPage,
            categoryList: categoryList,
            categoryDetailList: categoryDetailList,
            postResult: postResult
        }));
    });
});

function createPost(name, cate, catedetail, breifing, callback) {
    dbconn.resultQuery("select post_sequence.nextval from dual", function (postResult) {
        var postId = postResult.rows[0][0];
        dbconn.booleanQuery("insert into post values (" + postId + ",'" + name + "'," + breifing + ",sysdate,0,sysdate," + cate + "," + catedetail + ")", function (result) {
            if (result) { callback(postId); }
            else { callback(false); }
        });
    });
}
function createBreifingDetail(pid, headLine, url) {
    headLine = headLine.split("\"").join("“");
    headLine = headLine.split("\'").join("‘");
    headLine = headLine.split("<").join("");
    headLine = headLine.split(">").join("");
    headLine = headLine.split("$(").join("");
    dbconn.booleanQuery("insert into briefingdetail values(briefingdetail_sequence.nextval," + pid + ",'" + headLine + "','" + url + "')", function (result) {
    });
}
function createBreifingSummary(pid, summary) {
    summary = summary.split("\"").join("“");
    summary = summary.split("\'").join("‘");
    summary = summary.split("<").join("");
    summary = summary.split(">").join("");
    summary = summary.split("$(").join("");
    summary = summary.split(" ").join("&nbsp;");
    summary = summary.split("\n").join("<br>");
    dbconn.booleanQuery("insert into briefingsummary values (briefingsummary_sequence.nextval," + pid + ",'" + summary + "')", function (result) {
    });
}
function createHashTag(pid, hashTag) {
    dbconn.booleanQuery("insert into hashtag values (hashtag_sequence.nextval," + pid + ",'" + hashTag + "')", function (result) {
    });
}

function modifyPost(postId, category, detail, callback) {
    //글 정보가서 수정함.
    //기존 헤드라인 삭제 후 재생성
    //해시태그도 삭제후 재생성
    //summary의 경우 수정
    //카테고리 수정된 것 반영할 것
    dbconn.booleanQuery("update post set cate=" + category + ",catedetail=" + detail + ",pdate=sysdate where pid=" + postId, function (result) {
        callback(result);
    });
}
function deleteHeadLine(postId, callback) {
    dbconn.booleanQuery("delete from briefingdetail where pid=" + postId, function (result) {
        callback(result);
    });
}
function deleteHashTag(postId, callback) {
    dbconn.booleanQuery("delete from hashtag where pid=" + postId, function (result) {
        callback(result);
    });
}

function updateSummary(postId, summary, callback) {
    summary = summary.split("\"").join("“");
    summary = summary.split("\'").join("‘");
    summary = summary.split("<").join("");
    summary = summary.split(">").join("");
    summary = summary.split("$(").join("");
    summary = summary.split(" ").join("&nbsp;");
    summary = summary.split("\n").join("<br>");
    dbconn.booleanQuery("update briefingsummary set bsummary='" + summary + "' where pid=" + postId, function (result) {
        callback(result);
    });
}
router.post("/breifing_write", function (req, res) {
    if (req.query.modify != null) {
        var postId = req.query.modify;
        modifyPost(postId, req.body.category, req.body.detail, function (postResult) {
            if (postResult) {
                deleteHeadLine(postId, function (dhlresult) {
                    var head = "headline";
                    var headUrl = 'url';
                    for (var i = 1; i <= req.body.headCount; i++) {
                        var headLine = req.body[(head + i).toString()];
                        var url = req.body[(headUrl + i).toString()];
                        if (headLine.length == 0 || url.length == 0) continue;
                        createBreifingDetail(postId, headLine, url);
                    }
                    deleteHashTag(postId, function (dhtresult) {
                        var hashTag = req.body['hashTag'].split("#");
                        for (var i = 1; i < hashTag.length; i++) {
                            var hash = hashTag[i].trim();
                            if (hash.length == 0) continue;
                            createHashTag(postId, hash);
                        }
                        updateSummary(postId, req.body['summary'], function (result) {
                            res.write("<script>alert('Modified');</script>");
                            res.end('<script>location.href="/breifing?pageNo=1";</script>')
                        });
                    });
                });
            }
            else {
                res.write("<script>alert('ERROR');</script>");
                res.end('<script>history.back();</script>')
            }
        });
        return;
    }
    else {
        createPost(req.session.user_id, req.body.category, req.body.detail, 1, function (postId) {
            if (postId == false) {
                res.write("<script>alert('Write Failed');</script>");
                res.end('<script>history.back();</script>')
            }
            else {
                var head = "headline";
                var headUrl = 'url';
                for (var i = 1; i <= req.body.headCount; i++) {
                    var headLine = req.body[(head + i).toString()];
                    var url = req.body[(headUrl + i).toString()];
                    if (headLine.length == 0 || url.length == 0) continue;
                    createBreifingDetail(postId, headLine, url);
                }
                createBreifingSummary(postId, req.body['summary']);
                var hashTag = req.body['hashTag'].split("#");
                for (var i = 1; i < hashTag.length; i++) {
                    var hash = hashTag[i].trim();
                    if (hash.length == 0) continue;
                    createHashTag(postId, hash);
                }
            }
        });
        //1. 유저 정보로 포스트를 생성한다.
        //2. 작성한 헤드라인 만큼 쿼리를 보낸다.
        //3. 글의 세부정보를 보낸다.
        //4. 작성완료
        //err. 
        res.writeHead(302, { "Location": "/breifing?pageNo=1" });
        res.write("<script>alert('Write Success');</script>");
        res.end();
    }
});

router.get("/breifing_detail", function (req, res) {
    var page_size = 6;
    var page_list_size = 10;
    var currPage = req.query.pageNo;
    var startPost = (currPage - 1) * page_size + 1;
    var endPost = currPage * page_size;
    var cateId = req.query.cateId;
    var detailId = req.query.detailId;
    var sort = req.query.sort;
    if (sort == undefined) sort = 1;
    var order = sort == 1 ? "desc" : "asc";

    if (detailId == undefined) {
        detailId = null;
        paging(("select pid from post where briefing=1 and cate=" + cateId),
            "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=1 and cate=" + cateId + " order by pdate " + order + ")) where row2>=" + startPost + " and row2<=" + endPost,
            page_size, page_list_size, currPage, function (pageResult, pageList) {
                var pageListString;
                if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
                else {
                    pageListString = "and (post.pid=" + pageList.rows[0][0];
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString += " or post.pid=" + pageList.rows[i][0];
                    }
                    pageListString += ")";
                }
                getBreifingResult(pageListString, sort, function (orderQuery) {
                    query(orderQuery,
                        function (result) {
                            //hashResult가 필요하다
                            hashTag(pageList, function (hashResult) {
                                fs.readFile("breifing/breifing_detail.html", "utf-8", function (error, data) {
                                    res.send(ejs.render(include.import_default() + data, {
                                        logo: include.logo(),
                                        main_header: include.main_header(req.session.user_id),
                                        navigator: include.navigator(),
                                        navigator_side: include.navigator_side(),
                                        footer: include.footer(),
                                        contentsSideNav: BFcateNavPage,
                                        result: result,
                                        pagingResult: pageResult,
                                        hashResult, hashResult,
                                        cateId: cateId,
                                        detailId: detailId,
                                        sort: sort
                                    }));
                                });
                            });
                        });
                });
            });
    }
    else {
        var tempId = detailId;
        if (tempId == 0) tempId = 'catedetail';
        paging(("select pid from post where briefing=1 and cate=" + cateId + " and catedetail=" + tempId),
            "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=1 and cate=" + cateId + " and catedetail=" + tempId + " order by pdate " + order + ")) where row2>=" + startPost + " and row2<=" + endPost,
            page_size, page_list_size, currPage, function (pageResult, pageList) {
                var pageListString;
                if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
                else {
                    pageListString = "and (post.pid=" + pageList.rows[0][0];
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString += " or post.pid=" + pageList.rows[i][0];
                    }
                    pageListString += ")";
                }

                getBreifingResult(pageListString, sort, function (orderQuery) {
                    query(orderQuery,
                        function (result) {
                            //hashResult가 필요하다
                            hashTag(pageList, function (hashResult) {
                                fs.readFile("breifing/breifing_detail.html", "utf-8", function (error, data) {
                                    res.send(ejs.render(include.import_default() + data, {
                                        logo: include.logo(),
                                        main_header: include.main_header(req.session.user_id),
                                        navigator: include.navigator(),
                                        navigator_side: include.navigator_side(),
                                        footer: include.footer(),
                                        contentsSideNav: BFcateNavPage,
                                        result: result,
                                        pagingResult: pageResult,
                                        hashResult, hashResult,
                                        cateId: cateId,
                                        detailId: detailId,
                                        sort: sort
                                    }));
                                });
                            });
                        });
                });
            });
    }
});

router.get("/commentary", function (req, res) {
    var page_size = 10;
    var currPage = req.query.pageNo;
    var startPost = (currPage - 1) * page_size + 1;
    var endPost = currPage * page_size;

    var sort = req.query.sort;
    if (sort == undefined) sort = 1;
    var sort1 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=0 order by pdate desc)) where row2>=" + startPost + " and row2<=" + endPost;
    var sort2 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=0 order by pdate asc)) where row2>=" + startPost + " and row2<=" + endPost;
    var sort3 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, post.pid from post,commentary where briefing=0 and commentary.pid=post.pid order by commentary.cost desc)) where row2>=" + startPost + " and row2<=" + endPost;
    var order;
    order = sort == 1 ? sort1 : sort == 2 ? sort2 : sort3;

    paging("select pid from post where briefing=0",
        order, page_size, 10, currPage, function (pageResult, pageList) {
            var pageListString;
            if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
            else {
                pageListString = "and (post.pid=" + pageList.rows[0][0];
                for (var i = 1; i < pageList.rows.length; i++) {
                    pageListString += " or post.pid=" + pageList.rows[i][0];
                }
                pageListString += ")";
            }
            getCommentaryResult(pageListString, sort, function (orderQuery) {
                query(orderQuery,
                    function (result) {
                        fs.readFile("commentary/commentary.html", "utf-8", function (error, data) {
                            res.send(ejs.render(include.import_default() + data, {
                                logo: include.logo(),
                                main_header: include.main_header(req.session.user_id),
                                navigator: include.navigator(),
                                navigator_side: include.navigator_side(),
                                footer: include.footer(),
                                contentsSideNav: CMcateNavPage,
                                result: result,
                                pagingResult: pageResult,
                                sort: sort
                            }));
                        });
                    });
            })
        });
});

function getCommentBycommentNo(commId, callback) {
    dbconn.resultQuery("select * from comments where cid=" + commId + " order by cdate", function (result) {
        for (var i = 0; i < result.rows.length; i++) {
            result.rows[i][3] = moment(result.rows[i][3]).format("YY.MM.DD HH:mm:ss");
        }
        callback(result);
    });
}

router.get("/commentary_view", function (req, res) {
    var postNo = req.query.postNo;
    getPost(postNo, function (postResult) {
        getCommentaryById(postNo, function (commentResult) {
            getHashTagByPostNo(postNo, function (hashtagResult) {
                getCategoryNameByPostNo(postNo, function (categoryResult) {
                    getCommentBycommentNo(commentResult.rows[0][0], function (commentsResult) {//페이징
                        updateViewInfo(postNo, req.session.user_id, function () {
                            //req.session
                            updateViewCount(postNo);
                            subscribeCheck(postResult.rows[0][1], req.session.user_id, function (subscribeResult) {
                                for (var i = 0; i < postResult.rows.length; i++) {
                                    postResult.rows[i][3] = moment(postResult.rows[i][3]).format("YY.MM.DD HH:mm:ss");
                                    postResult.rows[i][5] = moment(postResult.rows[i][5]).format("YY.MM.DD HH:mm:ss");
                                }
                                var userId = req.session.user_id;
                                fs.readFile("commentary/commentary_view.html", "utf-8", function (error, data) {
                                    res.send(ejs.render(include.import_default() + data, {
                                        logo: include.logo(),
                                        main_header: include.main_header(req.session.user_id),
                                        navigator: include.navigator(),
                                        navigator_side: include.navigator_side(),
                                        footer: include.footer(),
                                        contentsSideNav: CMcateNavPage,
                                        postResult: postResult,
                                        hashtagResult: hashtagResult,
                                        commentResult: commentResult,
                                        commentsResult: commentsResult,
                                        categoryResult: categoryResult,
                                        user: userId,
                                        subscribeResult: subscribeResult,
                                        search: req.query.search
                                    }));
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

router.get("/commentary_detail", function (req, res) {
    var page_size = 10;
    var page_list_size = 10;
    var currPage = req.query.pageNo;
    var startPost = (currPage - 1) * page_size + 1;
    var endPost = currPage * page_size;
    var cateId = req.query.cateId;
    var detailId = req.query.detailId;
    var sort = req.query.sort;
    if (sort == undefined) sort = 1;
    if (detailId == undefined) {
        detailId = null;

        var sort1 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=0 and cate=" + cateId + " order by pdate desc)) where row2>=" + startPost + " and row2<=" + endPost;
        var sort2 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=0 and cate=" + cateId + " order by pdate asc)) where row2>=" + startPost + " and row2<=" + endPost;
        var sort3 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, post.pid from post,commentary where briefing=0 and cate=" + cateId + " and commentary.pid=post.pid order by commentary.cost desc)) where row2>=" + startPost + " and row2<=" + endPost;
        var order;
        order = sort == 1 ? sort1 : sort == 2 ? sort2 : sort3;
        paging(("select pid from post where briefing=0 and cate=" + cateId),
            order,
            page_size, page_list_size, currPage, function (pageResult, pageList) {
                var pageListString;
                if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
                else {
                    pageListString = "and (post.pid=" + pageList.rows[0][0];
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString += " or post.pid=" + pageList.rows[i][0];
                    }
                    pageListString += ")";
                }
                getCommentaryResult(pageListString, sort, function (orderQuery) {
                    query(orderQuery,
                        function (result) {
                            //hashResult가 필요하다
                            hashTag(pageList, function (hashResult) {
                                fs.readFile("commentary/commentary_detail.html", "utf-8", function (error, data) {
                                    res.send(ejs.render(include.import_default() + data, {
                                        logo: include.logo(),
                                        main_header: include.main_header(req.session.user_id),
                                        navigator: include.navigator(),
                                        navigator_side: include.navigator_side(),
                                        footer: include.footer(),
                                        contentsSideNav: CMcateNavPage,
                                        result: result,
                                        pagingResult: pageResult,
                                        hashResult, hashResult,
                                        cateId: cateId,
                                        detailId: detailId,
                                        sort: sort
                                    }));
                                });
                            });
                        });
                });
            });
    }
    else {
        var tempId = detailId;
        if (tempId == 0) tempId = 'catedetail';
        var sort1 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=0 and cate=" + cateId + " and catedetail=" + tempId + " order by pdate desc)) where row2>=" + startPost + " and row2<=" + endPost;
        var sort2 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=0 and cate=" + cateId + " and catedetail=" + tempId + " order by pdate asc)) where row2>=" + startPost + " and row2<=" + endPost;
        var sort3 = "select pid from (select rownum row2, pid, row1 from (select rownum row1, post.pid from post,commentary where briefing=0 and cate=" + cateId + " and catedetail=" + tempId + " and commentary.pid=post.pid order by commentary.cost desc)) where row2>=" + startPost + " and row2<=" + endPost;
        var order;
        order = sort == 1 ? sort1 : sort == 2 ? sort2 : sort3;
        paging(("select pid from post where briefing=0 and cate=" + cateId + " and catedetail=" + tempId),
            order,
            page_size, page_list_size, currPage, function (pageResult, pageList) {
                var pageListString;
                if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
                else {
                    pageListString = "and (post.pid=" + pageList.rows[0][0];
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString += " or post.pid=" + pageList.rows[i][0];
                    }
                    pageListString += ")";
                }
                getCommentaryResult(pageListString, sort, function (orderQuery) {
                    query(orderQuery,
                        function (result) {
                            //hashResult가 필요하다
                            hashTag(pageList, function (hashResult) {
                                fs.readFile("commentary/commentary_detail.html", "utf-8", function (error, data) {
                                    res.send(ejs.render(include.import_default() + data, {
                                        logo: include.logo(),
                                        main_header: include.main_header(req.session.user_id),
                                        navigator: include.navigator(),
                                        navigator_side: include.navigator_side(),
                                        footer: include.footer(),
                                        contentsSideNav: CMcateNavPage,
                                        result: result,
                                        pagingResult: pageResult,
                                        hashResult, hashResult,
                                        cateId: cateId,
                                        detailId: detailId,
                                        sort: sort
                                    }));
                                });
                            });
                        });
                });
            });
    }
});

function searching(req, res, search, type, callback) {
    if (type == 1) {
        //breifing
        var page_size = 6;
        var currPage = req.query.pageNo;
        var startPost = (currPage - 1) * page_size + 1;
        var endPost = currPage * page_size;
        paging("select pid from post where pid in (select pid from briefingdetail where headline like '%" + search + "%' or burl like '%" + search + "%')",
            "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where pid in (select pid from briefingdetail where headline like '%" + search + "%' or burl like '%" + search + "%') order by pid desc, pdate desc)) where row2>=" + startPost + " and row2<=" + endPost, page_size, 10, currPage, function (pageResult, pageList) {
                var pageListString;
                if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
                else {
                    pageListString = "and (post.pid=" + pageList.rows[0][0];
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString += " or post.pid=" + pageList.rows[i][0];
                    }
                    pageListString += ")";
                }
                var pageListString2;
                if (pageList.rows.length == 0) pageListString2 = "(pid=-1)";
                else {
                    pageListString2 = "(pid=" + pageList.rows[0][0];
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString2 += " or pid=" + pageList.rows[i][0];
                    }
                    pageListString2 += ")";
                }
                query("select h.*,ht.hashtag from (select post.pid,h.hl,c.cate,post.pdate from post,(select PID,SUBSTR(XMLAGG(XMLELEMENT(COL ,' <br>', b.headline)).EXTRACT('//text()').GETSTRINGVAL(),2) hl from (select pid,headline,pdate from( select post.pid, briefingdetail.headline,post.pdate, row_number() over(partition by post.pid order by briefingdetail.bid) rn from post,briefingdetail where post.pid = briefingdetail.pid) where rn <=3 order by pid desc, pdate desc) b group by b.pid) h,(select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) c where post.pid = h.pid and post.pid = c.pid " + pageListString + " order by post.pdate desc) h," +
                    "(select hashtag.pid ,SUBSTR(XMLAGG(XMLELEMENT(COL ,' #', keyword)).EXTRACT('//text()').GETSTRINGVAL(),2) hashtag from hashtag where " + pageListString2 + " group by hashtag.PID) ht where h.pid=ht.pid",
                    function (result) {
                        fs.readFile("search_result.html", "utf-8", function (error, data) {
                            res.send(ejs.render(include.import_default() + data, {
                                logo: include.logo(),
                                main_header: include.main_header(req.session.user_id),
                                navigator: include.navigator(),
                                navigator_side: include.navigator_side(),
                                footer: include.footer(),
                                contentsSideNav: BFcateNavPage,
                                result: result,
                                pagingResult: pageResult,
                                search: search,
                                type: type
                            }));
                        });
                    });
            });
    }
    else if (type == 2) {
        //commentary
        var page_size = 10;
        var currPage = req.query.pageNo;
        var startPost = (currPage - 1) * page_size + 1;
        var endPost = currPage * page_size;
        paging("select pid from post where briefing=0 and pid in (select pid from commentary where content like '%" + search + "%' or title like '%" + search + "%')",
            "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=0 and pid in (select pid from commentary where content like '%" + search + "%' or title  like '%" + search + "%') order by pid desc, pdate desc)) where row2>=" + startPost + " and row2<=" + endPost, page_size, 10, currPage, function (pageResult, pageList) {
                var pageListString;
                if (pageList.rows.length == 0) pageListString = "(pid=-1)";
                else {
                    pageListString = "(pid=" + pageList.rows[0][0];
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString += " or pid=" + pageList.rows[i][0];
                    }
                    pageListString += ")";
                }
                query("select p.*,c.*,u.id,cate.cate from (select c.cid,c.pid,c.title,c.cost,cm.cnt from commentary c full outer join (select cid, count(*) as cnt from comments group by cid) cm on c.cid=cm.cid) c,(select post.pid,post.pdate,post.userid,ht.hashtag from post,(select hashtag.pid ,SUBSTR(XMLAGG(XMLELEMENT(COL ,' #', keyword)).EXTRACT('//text()').GETSTRINGVAL(),2) hashtag from hashtag " +
                    "where " + pageListString + " group by hashtag.PID) ht where post.briefing=0 and post.pid=ht.pid) p, users u,(select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) cate where p.pid=c.pid and p.userid=u.id and cate.pid=p.pid order by p.pdate desc",
                    function (result) {
                        fs.readFile("search_result.html", "utf-8", function (error, data) {
                            res.send(ejs.render(include.import_default() + data, {
                                logo: include.logo(),
                                main_header: include.main_header(req.session.user_id),
                                navigator: include.navigator(),
                                navigator_side: include.navigator_side(),
                                footer: include.footer(),
                                contentsSideNav: CMcateNavPage,
                                result: result,
                                pagingResult: pageResult,
                                search: search,
                                type: type
                            }));
                        });
                    });
            });
    }
    else if (type == 3) {
        //channel
        var page_size = 10;
        var currPage = req.query.pageNo;
        var startPost = (currPage - 1) * page_size + 1;
        var endPost = currPage * page_size;
        paging("select id from users where id like '%" + search + "%'",
            "select id from (select rownum row2, id, row1 from (select rownum row1, id from users where id like '%" + search + "%')) where row2>=" + startPost + " and row2<=" + endPost, page_size, 10, currPage, function (pageResult, pageList) {
                var pageListString;
                if (pageList.rows.length == 0) pageListString = "(u.id='-1')";
                else {
                    pageListString = "(u.id='" + pageList.rows[0][0] + "'";
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString += " or u.id='" + pageList.rows[i][0] + "'";
                    }
                    pageListString += ")";
                }
                query("select u.id,u.pcnt,nvl(c.scnt,0) as scnt from (select users.*,NVL(u.pcnt,0) as pcnt from users left outer join (select userid as id,count(*) as pcnt from post group by userid) u on u.id=users.id) u left outer join (select channeluser,count(*) as scnt from subscribe group by channeluser) c on c.channeluser=u.id where " + pageListString,
                    function (result) {
                        fs.readFile("search_result.html", "utf-8", function (error, data) {
                            res.send(ejs.render(include.import_default() + data, {
                                logo: include.logo(),
                                main_header: include.main_header(req.session.user_id),
                                navigator: include.navigator(),
                                navigator_side: include.navigator_side(),
                                footer: include.footer(),
                                contentsSideNav: CMcateNavPage,
                                result: result,
                                pagingResult: pageResult,
                                search: search,
                                type: type
                            }));
                        });
                    });
            });
    }
    else if (type == 0) {
        //hashtag
        //1. 해시태그로 페이징 준비
        //2. 브리핑과 논평모두 가져온다. 출력은 논평식으로 출력한다
        //3. 가져올 때 헤드라인을 묶어서 가져올 수 있어야한다.
        //channel
        var page_size = 8;
        var currPage = req.query.pageNo;
        var startPost = (currPage - 1) * page_size + 1;
        var endPost = currPage * page_size;
        paging("select pid from hashtag where keyword like '%" + search + "%' group by pid",
            "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from (select pid from hashtag where keyword like '%" + search + "%' group by pid))) where row2>=" + startPost + " and row2<=" + endPost, page_size, 10, currPage, function (pageResult, pageList) {
                var pageListString;
                if (pageList.rows.length == 0) pageListString = "(pid=-1)";
                else {
                    pageListString = "(pid=" + pageList.rows[0][0];
                    for (var i = 1; i < pageList.rows.length; i++) {
                        pageListString += " or pid=" + pageList.rows[i][0];
                    }
                    pageListString += ")";
                }

                query("select h.*,cate.cate from (select h.*,c.cnt from " +
                    "(select h.*,c.cost from " +
                    "(select h.*,p.briefing,p.userid from " +
                    "(select h.pid,h.hashtag,nvl(p.title," +
                    "(select title from commentary where pid=h.pid)) from " +
                    "(select hashtag.pid ,SUBSTR(XMLAGG(XMLELEMENT(COL ,' #', keyword)).EXTRACT('//text()').GETSTRINGVAL(),2) hashtag from hashtag where " + pageListString + " group by hashtag.PID) h " +
                    "left outer join " +
                    "(SELECT p.pid,SUBSTR(XMLAGG(XMLELEMENT(COL ,' <br>', headline) ORDER BY p.pdate).EXTRACT('//text()').GETSTRINGVAL(),2) title FROM " +
                    "(select pid,headline,pdate from" +
                    "( select post.pid, briefingdetail.headline,post.pdate, row_number() over(partition by post.pid order by briefingdetail.bid) rn from post,briefingdetail where post.pid = briefingdetail.pid)" +
                    "where rn <=3 order by pid desc, pdate desc) p GROUP BY p.pid" +
                    ") p on p.pid=h.pid) h,post p where p.pid=h.pid) h " +
                    "left join commentary c on h.pid=c.pid) h left join " +
                    "(select commentary.pid,c.* from commentary," +
                    "(select cid, count(*) as cnt from comments group by cid) c where c.cid=commentary.cid) c on c.pid = h.pid) h, (select post.pid,category.CATEGORYNAME ||'  - '|| catedetail.DETAILNAME as cate from post right join category on post.CATE = category.CATEGORYID right join catedetail on post.CATEDETAIL=catedetail.DETAILID) cate where h.pid=cate.pid",
                    function (result) {
                        fs.readFile("search_result.html", "utf-8", function (error, data) {
                            res.send(ejs.render(include.import_default() + data, {
                                logo: include.logo(),
                                main_header: include.main_header(req.session.user_id),
                                navigator: include.navigator(),
                                navigator_side: include.navigator_side(),
                                footer: include.footer(),
                                contentsSideNav: CMcateNavPage,
                                result: result,
                                pagingResult: pageResult,
                                search: search,
                                type: type
                            }));
                        });
                    });
            });
    }
    else {
        //에러
        callback(false);
        return;
    }
}

router.get("/search_result", function (req, res) {
    var search = req.query.search;
    var type = req.query.type;
    searching(req, res, search, type, function (result) {

    });
});
function getCommentaryById(postNo, callback) {
    dbconn.resultQuery("select * from commentary where pid=" + postNo, function (result) {
        callback(result);
    });
}

function createCommentary(postId, title, contents, callback) {
    //작은따옴표 변환 할 것
    title = title.split("\"").join("“");
    title = title.split("\'").join("‘");
    title = title.split("<").join("");
    title = title.split(">").join("");
    title = title.split("$(").join("");
    contents = contents.split("\"").join("“");
    contents = contents.split("\'").join("‘");
    contents = contents.split("<").join("");
    contents = contents.split(">").join("");
    contents = contents.split("$(").join("");
    contents = contents.split(" ").join("&nbsp;");
    contents = contents.split("\n").join("<br>");
    dbconn.booleanQuery("insert into commentary values (commentary_sequence.nextval," + postId + ",'" + title + "','" + contents + "',0)", function (result) {
        callback(result);
    });
}

function updateCommentary(postNo, title, contents, callback) {
    title = title.split("\"").join("“");
    title = title.split("\'").join("‘");
    title = title.split("<").join("");
    title = title.split(">").join("");
    title = title.split("$(").join("");
    contents = contents.split("\"").join("“");
    contents = contents.split("\'").join("‘");
    contents = contents.split("<").join("");
    contents = contents.split(">").join("");
    contents = contents.split("$(").join("");
    contents = contents.split(" ").join("&nbsp;");
    contents = contents.split("\n").join("<br>");
    dbconn.booleanQuery("update commentary set content='" + contents + "', title='" + title + "' where pid=" + postNo, function () {
        callback();
    });
}

router.post("/commentary_write", function (req, res) {
    if (req.query.modify != null) {
        var postId = req.query.modify;
        modifyPost(postId, req.body.category, req.body.detail, function (postResult) {
            if (postResult) {
                deleteHeadLine(postId, function (dhlresult) {
                    var head = "headline";
                    var headUrl = 'url';
                    for (var i = 1; i <= req.body.headCount; i++) {
                        var headLine = req.body[(head + i).toString()];
                        var url = req.body[(headUrl + i).toString()];
                        if (headLine.length == 0 || url.length == 0) continue;
                        createBreifingDetail(postId, headLine, url);
                    }
                    deleteHashTag(postId, function (dhtresult) {
                        var hashTag = req.body['hashTag'].split("#");
                        for (var i = 1; i < hashTag.length; i++) {
                            var hash = hashTag[i].trim();
                            if (hash.length == 0) continue;
                            createHashTag(postId, hash);
                        }
                        var title = req.body['commtitle'];
                        var contents = req.body['commta'];
                        updateCommentary(postId, title, contents, function () {
                            res.write("<script>alert('Modified');</script>");
                            res.end('<script>location.href="/commentary?pageNo=1";</script>')
                        });
                    });
                });
            }
            else {
                res.write("<script>alert('ERROR');</script>");
                res.end('<script>history.back();</script>')
            }
        });
        return;
    }
    else {
        createPost(req.session.user_id, req.body.category, req.body.detail, 0, function (postId) {
            if (postId == false) {
                res.write("<script>alert('Write Failed');</script>");
                res.end('<script>history.back();</script>')
            }
            else {
                var title = req.body['commtitle'];
                var contents = req.body['commta'];
                createCommentary(postId, title, contents, function (result) {

                });
                var hashTag = req.body['hashTag'].split("#");
                for (var i = 1; i < hashTag.length; i++) {
                    var hash = hashTag[i].trim();
                    if (hash.length == 0) continue;
                    createHashTag(postId, hash);
                }
            }
        });
        res.writeHead(302, { "Location": "/commentary?pageNo=1" });
        res.write("<script>alert('Write Success');</script>");
        res.end();
    }
});

router.get("/commentary_write", function (req, res) {
    if (req.session.user_id == null) {
        res.write("<script>alert('Login First!');</script>");
        res.end('<script>history.back()</script>');
        return;
    }
    if (req.query.postNo != null) {
        getCommentaryById(req.query.postNo, function (commentaryResult) {
            getHashTagByPostNo(req.query.postNo, function (hashResult) {
                getPost(req.query.postNo, function (postResult) {
                    fs.readFile("commentary/commentary_write.html", "utf-8", function (error, data) {
                        res.send(ejs.render(include.import_default() + data, {
                            logo: include.logo(),
                            main_header: include.main_header(req.session.user_id),
                            navigator: include.navigator(),
                            navigator_side: include.navigator_side(),
                            footer: include.footer(),
                            contentsSideNav: CMcateNavPage,
                            categoryList: categoryList,
                            categoryDetailList: categoryDetailList,
                            commentaryResult: commentaryResult,
                            hashResult, hashResult,
                            postResult: postResult
                        }));
                    });
                });
            });
        });
        return;
    }
    var postResult = null;
    var commentaryResult = null;
    fs.readFile("commentary/commentary_write.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: CMcateNavPage,
            categoryList: categoryList,
            categoryDetailList: categoryDetailList,
            commentaryResult: commentaryResult,
            postResult: postResult
        }));
    });
});

router.post("/ajaxDetailResult", function (req, res) {
    var msg = req.body.msg;
    //categoryDetailList
    if (msg == 0) return;
    var detailResult = {
        rows: []
    };
    for (var i = 0; i < categoryDetailList.rows.length; i++) {
        if (categoryDetailList.rows[i][1] == msg) {
            var temp = [categoryDetailList.rows[i][0], categoryDetailList.rows[i][1], categoryDetailList.rows[i][2]];
            detailResult.rows.push(temp);
        }
    }
    res.send({ result: true, msg: detailResult });
})
function subscribe(status, writer, user, callback) {
    if (status == 'true') {
        dbconn.booleanQuery("insert into subscribe values (subscribe_sequence.nextval,'" + user + "','" + writer + "')", function (result) {
            callback(result);
        });
    }
    else {
        dbconn.booleanQuery("delete from subscribe where subscriber='" + user + "' and channeluser='" + writer + "'", function (result) {
            callback(result);
        });
    }
}
router.post("/subscribe", function (req, res) {
    var status = req.body.status;
    var writer = req.body.writer;
    if (req.session.user_id != null) {
        subscribe(status, writer, req.session.user_id, function (result) {
            if (!result) res.send({ result: 'error' });
            else res.send({ result: true });
        });
    }
    //에러메세지 출력
    else res.send({ result: false });
});

function createComments(cid, comments, userId, callback) {
    comments = comments.split("\"").join("“");
    comments = comments.split("\'").join("‘");
    comments = comments.split("<").join("");
    comments = comments.split(">").join("");
    comments = comments.split("$(").join("");
    dbconn.booleanQuery("insert into comments values (comments_sequence.nextval," + cid + ",'" + comments + "',sysdate,'" + userId + "')", function (result) {
        if (result) {
            //댓글리스트를 다시 불러와서 줌
            getCommentBycommentNo(cid, function (result) {
                callback(result);
            });
        }
        else callback(result);
    });
}

router.post("/comments", function (req, res) {
    var comments = req.body.msg;
    var cid = req.body.cid;
    if (req.session.user_id != null) {
        createComments(cid, comments, req.session.user_id, function (result) {
            if (result == false) res.send({ result: 'error' });
            else res.send({ result: true, commentslist: result });
        });
    }
    //에러메세지 출력
    else res.send({ result: false });
});

router.get("/delete", function (req, res) {
    var preURL = req.query.preURL.replace("<**>", "&");
    var postNo = req.query.postNo;
    dbconn.booleanQuery("delete from post where pid=" + postNo, function (result) {
        if (result) {
            res.write('<script>alert("삭제되었습니다!");</script>')
            res.end('<script>location.href="' + preURL + '"</script>')
        }
        else {
            res.write('<script>alert("삭제에 실패하였습니다!");</script>')
            res.end('<script>history.back();</script>')
        }
    });
});

router.post("/getNavSubscribe", function (req, res) {
    if (req.session.user_id == null) {
        res.send({ result: true });
        return;
    }
    //(navSize)*(currPage-1)+1
    //(navSize*currPage)
    dbconn.resultQuery("select * from (select rownum row1, s.*,c.cnt from subscribe s,(select subscriber,count(*) as cnt from subscribe where subscriber='" + req.session.user_id + "' group by subscriber) c where c.subscriber=s.subscriber)", function (result) {
        res.send({ result: true, list: result });
    });
    //최대 다섯명까지 출력. 다섯명이 넘으면 다음 버튼 생성. 다음 버튼 클릭시 이전 버튼 생성
});
router.post("/delete_comments", function (req, res) {
    var cmid = req.body.cmid;
    var cid = req.body.cid;
    dbconn.booleanQuery("delete from comments where cmntid=" + cmid, function (result) {
        if (result) {
            getCommentBycommentNo(cid, function (result) {
                res.send({ result: true, commentslist: result });
            });
        }
        else res.send({ result: 'error' });
    });
});

module.exports = router;