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
            cateDetailList(function(detailresult){
                console.log(detailresult);
                for (var i = 1; i <= result.rows.length; i++) {
                    categoryNav += '<div class="contentsSideNavDetail"><a class="nav-link btn-light hover-pointer" href="/breifing_detail?cateId='+result.rows[i - 1][0] +'&pageNo=1" id="Cate' +i + ' cateId' + result.rows[i - 1][0] + '">' +result.rows[i - 1][1] + '</a>'+
                    '<div class="detailDiv" id=detail'+i+'>';
                    //현재는 for문을 무식하게 돔
                    //추후 수정해야 할 사항 : 각 i마다 catelist를 불러온다. 모두 불러오면 콜백으로 categoryNav를 채움
                    for(var j=1;j<=detailresult.rows.length;j++){
                        if(detailresult.rows[j-1][1]==result.rows[i - 1][0]){
                            categoryNav += '<a class="nav-link btn-light hover-pointer" href="/breifing_detail?detailId='+detailresult.rows[j-1][0]+'&cateId='+detailresult.rows[j - 1][1] +
                            '&pageNo=1">' +detailresult.rows[j - 1][2] + '</a>';
                        }
                    }          
                    categoryNav += '</div></div>';
                    
                }            
                cateNavPage = ejs.render(include.contentsSideNav(), { categoryNav: categoryNav });
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
function cateDetailList(callback){
    query("select * from catedetail",function(result){
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
function hashTag(pageList, callback){
    var pageListString;
    if (pageList.rows.length == 0) pageListString = "(pid=-1)";
    else {
        pageListString = "(pid=" + pageList.rows[0][0];
        for (var i = 1; i < pageList.rows.length; i++) {
            pageListString += " or pid=" + pageList.rows[i][0];
        }
        pageListString += ")";
    }
    query("select pid, keyword from hashTag where "+pageListString,function(result){
        callback(result);
    });
}


router.get("/", function (req, res) {
    //query("select * from category",function(result){console.log(result)});
    fs.readFile("main.html", "utf-8", function (error, data) {
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

router.get("/breifing", function (req, res) {
    var page_size = 6;
    var currPage = req.param('pageNo');
    var startPost = (currPage - 1) * page_size + 1;
    var endPost = currPage * page_size;
    paging("select pid from post where briefing=1", "select pid from (select rownum row1, pid from post where briefing=1) where row1>=" + startPost + " and row1<=" + endPost, page_size, 10, currPage, function (pageResult, pageList) {
        console.log(pageResult);
        var pageListString;
        if (pageList.rows.length == 0) pageListString = "and (post.pid=-1)";
        else {
            pageListString = "and (post.pid=" + pageList.rows[0][0];
            for (var i = 1; i < pageList.rows.length; i++) {
                pageListString += " or post.pid=" + pageList.rows[i][0];
            }
            pageListString += ")";
        }
        query("select pid, bid, headline " +
            "from( select post.pid, briefingdetail.bid, briefingdetail.headline, " +
            "row_number() over(partition by post.pid order by briefingdetail.bid) " +
            "rn from post,briefingdetail where post.pid = briefingdetail.pid " + pageListString + ") where rn <=3",
            function (result) {
                fs.readFile("breifing/breifing.html", "utf-8", function (error, data) {
                    res.send(ejs.render(include.import_default() + data, {
                        logo: include.logo(),
                        main_header: include.main_header(),
                        navigator: include.navigator(),
                        navigator_side: include.navigator_side(),
                        footer: include.footer(),
                        contentsSideNav: cateNavPage,
                        result: result,
                        pagingResult: pageResult
                    }));
                });
            });
    });
});

router.get("/breifing_view", function (req, res) {
    fs.readFile("breifing/breifing_view.html", "utf-8", function (error, data) {
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

router.get("/breifing_detail", function (req, res) {
    var page_size = 6;
    var page_list_size = 10;
    var currPage = req.param('pageNo');
    var startPost = (currPage - 1) * page_size + 1;
    var endPost = currPage * page_size;
    var cateId = req.param('cateId');
    paging(("select pid from post where briefing=1 and cate=" + cateId),
        "select pid, cate from (select rownum row1, pid, cate from post where briefing=1 and cate=" + cateId + ") where row1>=" + startPost + " and row1<=" + endPost,
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
            query("select pid, bid, headline " +
                "from( select post.pid, briefingdetail.bid, briefingdetail.headline, " +
                "row_number() over(partition by post.pid order by briefingdetail.bid) " +
                "rn from post,briefingdetail where post.pid = briefingdetail.pid " + pageListString + ") where rn <=3",
                function (result) {
                    //hashResult가 필요하다
                    hashTag(pageList,function(hashResult){
                        fs.readFile("breifing/breifing_detail.html", "utf-8", function (error, data) {
                            res.send(ejs.render(include.import_default() + data, {
                                logo: include.logo(),
                                main_header: include.main_header(),
                                navigator: include.navigator(),
                                navigator_side: include.navigator_side(),
                                footer: include.footer(),
                                contentsSideNav: cateNavPage,
                                result:result,
                                pagingResult:pageResult,
                                hashResult,hashResult,
                                cateId:cateId
                            }));
                        });
                    });
                });
        });
});

router.get("/commentary", function (req, res) {
    fs.readFile("commentary/commentary.html", "utf-8", function (error, data) {
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

router.get("/commentary_view", function (req, res) {
    fs.readFile("commentary/commentary_view.html", "utf-8", function (error, data) {
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

router.get("/commentary_detail", function (req, res) {
    fs.readFile("commentary/commentary_detail.html", "utf-8", function (error, data) {
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

router.get("/search_result", function (req, res) {
    fs.readFile("search_result.html", "utf-8", function (error, data) {
        res.send(ejs.render(include.import_default() + data, {
            logo: include.logo(),
            main_header: include.main_header(),
        }));
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

module.exports = router;