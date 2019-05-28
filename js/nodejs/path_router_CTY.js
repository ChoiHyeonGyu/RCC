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

var cateNav = false;
var categoryNav = "";
var BFcateNavPage = "";
var CMcateNavPage = "";
var categoryList;
var categoryDetailList;


router.get("*", function (req, res, next) {
    if (!cateNav) init(function () { next() });
    else next();
});

function init(callback) {
    initCategoryNav(callback);
};

function initCategoryNav(callback) {
    if (!cateNav) {
        dbconn.resultQuery("select * from category", function (result) {
            categoryList = result;
            cateDetailList(function (detailresult) {
                categoryDetailList = detailresult;
                for (var i = 1; i <= result.rows.length; i++) {
                    if (result.rows[i - 1][0] == 0) continue;
                    categoryNav += '<div class="contentsSideNavDetail"><a class="nav-link btn-light hover-pointer categoryHead" href="/breifing_detail?cateId=' + result.rows[i - 1][0] + '&pageNo=1" id="categoryId' + result.rows[i - 1][0] + '">' + result.rows[i - 1][1] + '</a>' +
                        '<div class="detailDiv" id=detail' + i + '>';
                    //현재는 for문을 무식하게 돔
                    //추후 수정해야 할 사항 : 각 i마다 catelist를 불러온다. 모두 불러오면 콜백으로 categoryNav를 채움
                    for (var j = 1; j <= detailresult.rows.length; j++) {
                        if (detailresult.rows[j - 1][0] == 0) continue;
                        if (detailresult.rows[j - 1][1] == result.rows[i - 1][0]) {
                            categoryNav += '<a class="nav-link btn-light hover-pointer" href="/breifing_detail?detailId=' + detailresult.rows[j - 1][0] + '&cateId=' + detailresult.rows[j - 1][1] +
                                '&pageNo=1" id="categoryDetailId' + detailresult.rows[j - 1][0] + '">' + detailresult.rows[j - 1][2] + '</a>';
                        }
                    }
                    categoryNav += '</div></div>';
                }
                BFcateNavPage = ejs.render(include.contentsSideNav(), { categoryNav: categoryNav });

                categoryNav = "";
                for (var i = 1; i <= result.rows.length; i++) {
                    categoryNav += '<div class="contentsSideNavDetail"><a class="nav-link btn-light hover-pointer categoryHead" href="/commentary_detail?cateId=' + result.rows[i - 1][0] + '&pageNo=1" id="categoryId' + result.rows[i - 1][0] + '">' + result.rows[i - 1][1] + '</a>' +
                        '<div class="detailDiv" id=detail' + i + '>';
                    //현재는 for문을 무식하게 돔
                    //추후 수정해야 할 사항 : 각 i마다 catelist를 불러온다. 모두 불러오면 콜백으로 categoryNav를 채움
                    for (var j = 1; j <= detailresult.rows.length; j++) {
                        if (detailresult.rows[j - 1][1] == result.rows[i - 1][0]) {
                            categoryNav += '<a class="nav-link btn-light hover-pointer" href="/commentary_detail?detailId=' + detailresult.rows[j - 1][0] + '&cateId=' + detailresult.rows[j - 1][1] +
                                '&pageNo=1" id="categoryDetailId' + detailresult.rows[j - 1][0] + '">' + detailresult.rows[j - 1][2] + '</a>';
                        }
                    }
                    categoryNav += '</div></div>';
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
        //페이지 목록을 가져올 쿼리 작성
        //1 1~6 2 7~12
        startPage = parseInt((currPage - 1) / 10) * 10 + 1;
        endPage = parseInt((currPage - 1) / 10) * 10 + page_list_size;
        if (parseInt(totalCount / page_size) < endPage) endPage = parseInt(totalCount / page_size) + 1;
        if (parseInt((currPage - 1) / 10) == 0) preBtn = 0;
        if (parseInt(totalCount / page_size) <= endPage) nextBtn = 0;
        var pageResult = {
            startPage: startPage,
            endPage: endPage,
            nextBtn: nextBtn,
            preBtn: preBtn,
            curPage: currPage
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


router.get("/", function (req, res) {
    //query("select * from category",function(result){console.log(result)});
    fs.readFile("main.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer()
        }));
    });
});

router.get("/breifing", function (req, res) {
    var page_size = 6;
    var currPage = req.param('pageNo');
    var startPost = (currPage - 1) * page_size + 1;
    var endPost = currPage * page_size;
    paging("select pid from post where briefing=1", "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=1 order by pid desc, mdate desc)) where row2>=" + startPost + " and row2<=" + endPost, page_size, 10, currPage, function (pageResult, pageList) {
        var pageListString;
        if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
        else {
            pageListString = "and (post.pid=" + pageList.rows[0][0];
            for (var i = 1; i < pageList.rows.length; i++) {
                pageListString += " or post.pid=" + pageList.rows[i][0];
            }
            pageListString += ")";
        }
        query("select pid, bid, headline,mdate " +
            "from( select post.pid, briefingdetail.bid, briefingdetail.headline,post.mdate," +
            "row_number() over(partition by post.pid order by briefingdetail.bid) " +
            "rn from post,briefingdetail where post.pid = briefingdetail.pid " + pageListString + ") where rn <=3 order by pid desc, mdate desc",
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
                        pagingResult: pageResult
                    }));
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
router.get("/breifing_view", function (req, res) {
    var postNo = req.param('postNo');
    getPost(postNo, function (postResult) {
        getSummaryByPostNo(postNo, function (summaryResult) {
            getHeadlineByPostNo(postNo, function (headlineResult) {
                getHashTagByPostNo(postNo, function (hashtagResult) {
                    getCategoryNameByPostNo(postNo, function (categoryResult) {
                        //req.session
                        subscribeCheck(postResult.rows[0][1], req.session.user_id, function (subscribeResult) {
                            for (var i = 0; i < postResult.rows.length; i++) {
                                postResult.rows[i][3] = moment(postResult.rows[i][3]).format("YYYY-MM-DD HH:mm:ss");
                                postResult.rows[i][5] = moment(postResult.rows[i][5]).format("YYYY-MM-DD HH:mm:ss");
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
                                    search:req.param('search')
                                }));
                            });
                        });
                    })
                });
            });
        });
    });
});

router.get("/breifing_write", function (req, res) {
    if (req.session.user_id == null) {
        res.write("<script>alert('Login First!');</script>");
        res.end('<script>history.back()</script>');
        return;
    }
    if (req.param('postNo') != null) {
        getHeadlineByPostNo(req.param('postNo'), function (headlineResult) {
            getSummaryByPostNo(req.param('postNo'), function (summaryResult) {
                getHashTagByPostNo(req.param('postNo'), function (hashResult) {
                    getPost(req.param('postNo'), function (postResult) {
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
    dbconn.booleanQuery("insert into briefingdetail values(briefingdetail_sequence.nextval," + pid + ",'" + headLine + "','" + url + "')", function (result) {
    });
}
function createBreifingSummary(pid, summary) {
    dbconn.booleanQuery("insert into briefingsummary values (briefingsummary_sequence.nextval," + pid + ",'" + summary + "')", function (result) {
    });
}
function createHashTag(pid, hashTag) {
    dbconn.booleanQuery("insert into hashtag values (hashtag_sequence.nextval," + pid + ",'" + hashTag + "')", function (result) {
    });
}

function modifyPost(postId, callback) {
    //글 정보가서 수정함.
    //기존 헤드라인 삭제 후 재생성
    //해시태그도 삭제후 재생성
    //summary의 경우 수정
    dbconn.booleanQuery("update post set mdate=sysdate where pid=" + postId, function (result) {
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
    dbconn.booleanQuery("update briefingsummary set bsummary='" + summary + "' where pid=" + postId, function (result) {
        callback(result);
    });
}
router.post("/breifing_write", function (req, res) {
    if (req.param('modify') != null) {
        var postId = req.param('modify');
        modifyPost(postId, function (postResult) {
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
                            res.end('<script>location.href="/"</script>')
                        });
                    });
                });
            }
            else {
                res.write("<script>alert('ERROR');</script>");
                res.end('<script>history.back()</script>')
            }
        });
        return;
    }
    createPost(req.session.user_id, req.body.category, req.body.detail, 1, function (postId) {
        if (postId == false) {
            res.write("<script>alert('Write Failed');</script>");
            res.end('<script>history.back()</script>')
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
});

router.get("/breifing_detail", function (req, res) {
    var page_size = 6;
    var page_list_size = 10;
    var currPage = req.param('pageNo');
    var startPost = (currPage - 1) * page_size + 1;
    var endPost = currPage * page_size;
    var cateId = req.param('cateId');
    var detailId = req.param('detailId');
    if (detailId == undefined) {
        detailId = null;
        paging(("select pid from post where briefing=1 and cate=" + cateId),
            "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=1 and cate=" + cateId + " order by pid desc, mdate desc)) where row2>=" + startPost + " and row2<=" + endPost,
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
                query("select pid, bid, headline,mdate " +
                    "from( select post.pid, briefingdetail.bid, briefingdetail.headline,post.mdate, " +
                    "row_number() over(partition by post.pid order by briefingdetail.bid) " +
                    "rn from post,briefingdetail where post.pid = briefingdetail.pid " + pageListString + ") where rn <=3  order by pid desc, mdate desc",
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
                                    detailId: detailId
                                }));
                            });
                        });
                    });
            });
    }
    else {
        paging(("select pid from post where briefing=1 and cate=" + cateId + " and catedetail=" + detailId),
            "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where briefing=1 and cate=" + cateId + " and catedetail=" + detailId + " order by pid desc, mdate desc)) where row2>=" + startPost + " and row2<=" + endPost,
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
                query("select pid, bid, headline,mdate " +
                    "from( select post.pid, briefingdetail.bid, briefingdetail.headline,post.mdate, " +
                    "row_number() over(partition by post.pid order by briefingdetail.bid) " +
                    "rn from post,briefingdetail where post.pid = briefingdetail.pid " + pageListString + ") where rn <=3 order by pid desc, mdate desc",
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
                                    detailId: detailId
                                }));
                            });
                        });
                    });
            });
    }
});

router.get("/commentary", function (req, res) {
    fs.readFile("commentary/commentary.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: CMcateNavPage
        }));
    });
});

router.get("/commentary_view", function (req, res) {
    fs.readFile("commentary/commentary_view.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: CMcateNavPage
        }));
    });
});

router.get("/commentary_detail", function (req, res) {
    fs.readFile("commentary/commentary_detail.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(req.session.user_id),
            navigator: include.navigator(),
            navigator_side: include.navigator_side(),
            footer: include.footer(),
            contentsSideNav: CMcateNavPage
        }));
    });
});

function searchHeadline(search, callback) {
    dbconn.resultQuery("select pid from briefingdetail where headline like '%" + search + "%' or burl like '%" + search + "%'", function (result) {
        callback(result);
    });
}
function searchSummary(search, callback) {
    dbconn.resultQuery("select pid from briefingsummary where bsummary like '%" + search + "%'", function (result) {
        callback(result);
    });
}
function searchHashtag(search, callback) {
    dbconn.resultQuery("select pid from hashtag where keyword like '%" + search + "%'", function (result) {
        callback(result);
    });
}
function searchChannel(search, callback) {
    dbconn.resultQuery("select * from users where id like '%" + search + "%'", function (result) {
        callback(result);
    });
}
function searchCommentary(search, callback) {
    dbconn.resultQuery("select pid from commentary where title like '%" + search + "%' or content like '%" + search + "%'", function (result) {
        callback(result);
    });
}

function searching(req,res,search, type, callback) {
    if (type == 1) {
        //breifing
        var page_size = 6;
        var currPage = req.param('pageNo');
        var startPost = (currPage - 1) * page_size + 1;
        var endPost = currPage * page_size;
        paging("select pid from post where pid in (select pid from briefingdetail where headline like '%"+search+"%' or burl like '%"+search+"%')",
         "select pid from (select rownum row2, pid, row1 from (select rownum row1, pid from post where pid in (select pid from briefingdetail where headline like '%"+search+"%' or burl like '%"+search+"%') order by pid desc, mdate desc)) where row2>=" + startPost + " and row2<=" + endPost, page_size, 10, currPage, function (pageResult, pageList) {
            var pageListString;
            if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
            else {
                pageListString = "and (post.pid=" + pageList.rows[0][0];
                for (var i = 1; i < pageList.rows.length; i++) {
                    pageListString += " or post.pid=" + pageList.rows[i][0];
                }
                pageListString += ")";
            }
            query("select pid, bid, headline,mdate " +
                "from( select post.pid, briefingdetail.bid, briefingdetail.headline,post.mdate," +
                "row_number() over(partition by post.pid order by briefingdetail.bid) " +
                "rn from post,briefingdetail where post.pid = briefingdetail.pid " + pageListString + ") where rn <=3 order by pid desc, mdate desc",
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
                            search:search,
                            type:type
                        }));
                    });
                });
        });
    }
    else if (type == 2) {
        //commentary
        searchCommentary(search, function (result) {
            callback(result);
        });
    }
    else if (type == 3) {
        //channel
        searchChannel(search, function (result) {
            callback(result);
        });
    }
    else if (type == 0) {
        //hashtag
        searchHashtag(search, function (result) {
            callback(result);
        });
    }
    else {
        //에러
        callback(false);
        return;
    }
}

router.get("/search_result", function (req, res) {
    var search = req.param('search');
    var type = req.param('type');
    searching(req,res, search, type, function (result) {

    });
});

router.get("/breifing_write", function (req, res) {
    fs.readFile("breifing/breifing_write.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo()
        }));
    });
});

router.get("/commentary_write", function (req, res) {
    fs.readFile("commentary/commentary_write.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo()
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

router.get("/delete", function (req, res) {
    dbconn.booleanQuery("delete from post where pid=" + req.param('postNo'), function (result) {
        if (result) {
            res.write('<script>alert("Delete!");</script>')
            res.end('<script>location.href="/"</script>')
        }
        else {
            res.write('<script>alert("Failed!");</script>')
            res.end('<script>history.back()</script>')
        }
    });
});

module.exports = router;