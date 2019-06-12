$(function(){
    var lastnum = 0;
    var txpagegroup = 0;

    function pageSelecting(){
        if($(location).attr('search').match('s=1')){
            return 1;
        } else if($(location).attr('search').match('s=2')) {
            return 2;
        } else if($(location).attr('search').match('s=3')) {
            return 3;
        } else if($(location).attr('search').match('s=4')) {
            return 4;
        }
    }

    function sortSelecting(){
        if($(location).attr('search').match('sort=1')){
            return 1;
        } else if($(location).attr('search').match('sort=2')) {
            return 2;
        } else if($(location).attr('search').match('sort=3')) {
            return 3;
        }
    }

    $(document).on('click', '.pb', function(){
        var s = pageSelecting();
        var sort = sortSelecting();

        $.ajax({
            url: '/my/pagelist',
            data: {
                s: s,
                sort: sort,
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsSelecting(s, result);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.pb').parent().removeClass('active');
        $(this).parent().addClass('active');
    });

    $(document).on('click', '.nb', function(){
        var s = pageSelecting();
        var sort = sortSelecting();

        $.ajax({
            url: '/my/pagelist',
            data: {
                s: s,
                sort: sort,
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsSelecting(s, result);
                lastnum += 10;
                pageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.preb', function(){
        var s = pageSelecting();
        var sort = sortSelecting();

        $.ajax({
            url: '/my/pagelist',
            data: {
                s: s,
                sort: sort,
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsSelecting(s, result);
                lastnum -= 10;
                pageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function rowsSelecting(s, result){
        if(s == 1){
            rowsSubProcessing(result.data.rows);
        } else if(s == 2) {
            rowsProcessing(result.data);
        } else if(s == 3) {
            rowsProcessing(result.data);
        } else if(s == 4) {
            rowsCmntProcessing(result.data.rows);
        } else {
            rowsSubProcessing(result.data.rows);
        }
    }

    function rowsSubProcessing(rows){
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='seluser hover-pointer'>"+rows[i][1]+"</td> </tr>");
        }
    }

    function rowsProcessing(data){
        var rows = data.rows;
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            if(data.metaData[1].name == "HEADLINE"){
                $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='headline hover-pointer hover-underline'>"+rows[i][1]+"</td> <td>"+rows[i][2]+
                "</td> <td>"+rows[i][3]+"</td> <td>"+rows[i][4]+"</td> <td>"+rows[i][5]+"</td> <td>"+rows[i][6]+"</td> </tr>");
            } else {
                $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='title hover-pointer hover-underline'>"+rows[i][1]+"</td> <td>"+rows[i][2]+"</td> <td>"+
                rows[i][3]+"</td> <td>"+rows[i][4]+"</td> <td>"+rows[i][5]+"</td> <td>"+rows[i][6]+"</td> </tr>");
            }
        }
    }

    function rowsCmntProcessing(rows){
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][3]+"</th> <td class='title hover-pointer hover-underline'>"+rows[i][2]+"</td> <td>"+rows[i][0]+"</td> <td>"+rows[i][1]+"</td> </tr>");
        }
    }

    function pageProcessing(result){
        var page = result.page.rows;
        $('#pagelist li').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.previd){
                    $('#pagelist').append("<li class='page-item'><a class='page-link preb' nextid='"+result.previd+"'>&lt;</a></li>");
                }
                $('#pagelist').append("<li class='page-item active'><a class='page-link pb' nextid='"+page[i]+"'>"+(lastnum + 1)+"</a></li>");
            } else if(i == 10) {
                $('#pagelist').append("<li class='page-item'><a class='page-link nb' nextid='"+page[i]+"'>&gt;</a></li>");
            } else {
                $('#pagelist').append("<li class='page-item'><a class='page-link pb' nextid='"+page[i]+"'>"+(lastnum + i + 1)+"</a></li>");
            }
        }
    }

    $(document).on('click', '.seluser', function(){
        location.href = "/channel?chnlid=" + $(this).text();
    });

    $(document).on('click', '.headline', function(){
        location.href = "/breifing_view?postNo=" + $(this).prev().text();
    });

    $(document).on('click', '.title', function(){
        location.href = "/commentary_view?postNo=" + $(this).prev().text();
    });

    $(document).on('mouseover', '.selrow', function(){
        $(this).addClass('table-info');
    });

    $(document).on('mouseout', '.selrow', function(){
        $(this).removeClass('table-info');
    });

    $(document).on('keydown', '#my_search', function(){
        if(event.keyCode == 13){
            var s = pageSelecting();

            $.ajax({
                url: '/my/search',
                data: {
                    s: s,
                    txt: $(this).val()
                },
                success: function(result){
                    rowsSelecting(s, result);
                    lastnum = 0;
                    searchPaging(result);
                },
                error: function(error){
                    console.log(error);
                }
            });
        }
    });

    $(document).on('click', '.srchb', function(){
        var s = pageSelecting();

        $.ajax({
            url: '/my/search/pagelist',
            data: {
                s: s,
                id: $(this).attr('nextid'),
                txt: $('#my_search').val()
            },
            success: function(result){
                rowsSelecting(s, result);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.srchb').parent().removeClass('active');
        $(this).parent().addClass('active');
    });

    $(document).on('click', '.nsrchb', function(){
        var s = pageSelecting();

        $.ajax({
            url: '/my/search/pagelist',
            data: {
                s: s,
                id: $(this).attr('nextid'),
                txt: $('#my_search').val()
            },
            success: function(result){
                rowsSelecting(s, result);
                lastnum += 10;
                searchPaging(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.presrchb', function(){
        var s = pageSelecting();

        $.ajax({
            url: '/my/search/pagelist',
            data: {
                s: s,
                id: $(this).attr('nextid'),
                txt: $('#my_search').val()
            },
            success: function(result){
                rowsSelecting(s, result);
                lastnum -= 10;
                searchPaging(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function searchPaging(result){
        var page = result.page.rows;
        $('#pagelist li').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.previd){
                    $('#pagelist').append("<li class='page-item'><a class='page-link presrchb' nextid='"+result.previd+"'>&lt;</a></li>");
                }
                $('#pagelist').append("<li class='page-item active'><a class='page-link srchb' nextid='"+page[i]+"'>"+(lastnum + 1)+"</a></li>");
            } else if(i == 10) {
                $('#pagelist').append("<li class='page-item'><a class='page-link nsrchb' nextid='"+page[i]+"'>&gt;</a></li>");
            } else {
                $('#pagelist').append("<li class='page-item'><a class='page-link srchb' nextid='"+page[i]+"'>"+(lastnum + i + 1)+"</a></li>");
            }
        }
    }

    $(document).on('change', '.sort', function(){
        var ls = $(location).attr('search').substr(0, 4);

        if(ls == ''){
            var my = "/my?sort=";
        } else {
            var my = "/my" + ls + "&sort=";
        }

        if($(this).val() == "최신 순"){
            location.href = my + "0";
        } else if($(this).val() == "오래된 순") {
            location.href = my + "1";
        } else if($(this).val() == "조회 수") {
            location.href = my + "2";
        } else if($(this).val() == "후원 총액") {
            location.href = my + "3";
        }
    });

    $('.coin').keyup(function(){
        $('.won').val(($(this).val() * 100000).toLocaleString());
        $('.fee').text(($(this).val() * 0.00054).toFixed(5));
        $('#brc').text((Number($(this).val()) + Number($('.rc').attr('save'))).toFixed(5));
        $('#src').text((Number($('.rc').attr('save')) - Number($(this).val()) - ($(this).val() * 0.00054)).toFixed(5));
    });

    $('.won').keyup(function(){
        $('.coin').val($(this).val().replace(/,/g, '') / 100000);
        $('.coin').keyup();
    });

    $('button[data-dismiss]').click(function(){
        $('.coin').val('');
        $('.won').val('');
        $('.fee').text('');
        $('.rc').text('');
    });

    $('#percentage').change(function(){
        if($(this).val() == "ALL"){
            $('.coin').val((Number($('#coin').text()) - ($('#coin').text() * 0.00054)).toFixed(5));
        } else if($(this).val() == "50%") {
            $('.coin').val(((Number($('#coin').text()) / 2) - ((Number($('#coin').text()) / 2) * 0.00054)).toFixed(5));
        } else if($(this).val() == "25%") {
            $('.coin').val(((Number($('#coin').text()) / 4) - ((Number($('#coin').text()) / 4) * 0.00054)).toFixed(5));
        } else if($(this).val() == "10%") {
            $('.coin').val(((Number($('#coin').text()) / 10) - ((Number($('#coin').text()) / 10) * 0.00054)).toFixed(5));
        } else {
            $('.coin').val('');
            $('.won').val('');
            $('.fee').text('');
            $('.rc').text('');
        }
        $('.coin').keyup();
    });

    $('#modify').submit(function(){
        if(isNaN(Number($('.coin').val()))){
            alert("Please. Enter Number!");
            return false;
        }
    });

    $(document).on('click', '.txpb', function(){
        $.ajax({
            url: '/txpaging',
            data: {
                addr: $('#account_address').next().text(),
                bn: $(this).attr('nextbn'),
                txidx: $(this).attr('nextxidx')
            },
            success: function(result){
                txsProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.txpb').parent().removeClass('active');
        $(this).parent().addClass('active');
    });

    $(document).on('click', '.ntxpb', function(){
        $.ajax({
            url: '/txpaging',
            data: {
                addr: $('#account_address').next().text(),
                bn: $(this).attr('nextbn'),
                txidx: $(this).attr('nextxidx')
            },
            success: function(result){
                txsProcessing(result);
                txpagegroup += 10;
                txpageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.pretxpb', function(){
        $.ajax({
            url: '/txpaging',
            data: {
                addr: $('#account_address').next().text(),
                bn: $(this).attr('nextbn'),
                txidx: $(this).attr('nextxidx')
            },
            success: function(result){
                txsProcessing(result);
                txpagegroup -= 10;
                txpageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function txsProcessing(result){
        var txs = result.txlist;
        var cvt = result.converter;
        $('#txlist tr').remove();
        for(var i = 0; i < txs.length; i++){
            if(txs[i].from == $('#account_address').next().text()){
                var from = $('#channel_name').text();
            } else {
                for(var j = 0; j < cvt.length; j++){
                    if(txs[i].from == cvt[j][1]){
                        var from = cvt[j][0] + "<br>" + txs[i].from;
                        break;
                    }
                    if(j == cvt.length - 1){
                        var from = txs[i].from;
                    }
                }
            }
            if(txs[i].to == $('#account_address').next().text()){
                var to = $('#channel_name').text();
            } else {
                for(var j = 0; j < cvt.length; j++){
                    if(txs[i].to == cvt[j][1]){
                        var to = cvt[j][0] + "<br>" + txs[i].to;
                        break;
                    }
                    if(j == cvt.length - 1){
                        var from = txs[i].to;
                    }
                }
            }
            $('#txlist').append("<tr> <th scope='row'>"+txs[i].bn+"</th> <td>"+txs[i].txidx+"</td> <td>"+from+"</td> <td>"+to+"</td> <td>"+txs[i].value+"</td> <td>"+txs[i].fee+"</td> <td>"+txs[i].time+"</td> </tr>");
        }
    }

    function txpageProcessing(result){
        var page = result.txpage;
        $('#txpage li').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.pfpv){
                    $('#txpage').append("<li class='page-item'><a class='page-link pretxpb' nextbn='"+result.pfpv.bn+"' nextxidx='"+result.pfpv.txidx+"'>&lt;</a></li>");
                }
                $('#txpage').append("<li class='page-item active'><a class='page-link txpb' nextbn='"+page[i].bn+"' nextxidx='"+page[i].txidx+"'>"+(txpagegroup + 1)+"</a></li>");
            } else if(i == 10) {
                $('#txpage').append("<li class='page-item'><a class='page-link ntxpb' nextbn='"+page[i].bn+"' nextxidx='"+page[i].txidx+"'>&gt;</a></li>");
            } else {
                $('#txpage').append("<li class='page-item'><a class='page-link txpb' nextbn='"+page[i].bn+"' nextxidx='"+page[i].txidx+"'>"+(txpagegroup + i + 1)+"</a></li>");
            }
        }
    }

    function txscSelecting(){
        if($('#txsc').val() == "최신 순"){
            return 0;
        } else if($('#txsc').val() == "오래된 순") {
            return 1;
        }
    }

    function txioSelecting(){
        if($('#txio').val() == "입출금 내역"){
            return 0;
        } else if($('#txio').val() == "입금 내역") {
            return 1;
        } else if($('#txio').val() == "출금 내역") {
            return 2;
        }
    }

    function txscopeSelecting(){
        if($('#txscope').val() == "선택"){
            return 0;
        } else if($('#txscope').val() == "초과") {
            return 1;
        } else if($('#txscope').val() == "이상") {
            return 2;
        } else if($('#txscope').val() == "같음") {
            return 3;
        } else if($('#txscope').val() == "이하") {
            return 4;
        } else if($('#txscope').val() == "미만") {
            return 5;
        }
    }

    $('.srchandsort').change(function(){
        var txsc = txscSelecting();
        var txio = txioSelecting();
        var txscope = txscopeSelecting();

        $.ajax({
            url: '/tx/searchandsort',
            data: {
                addr: $('#account_address').next().text(),
                txsc: txsc,
                txio: txio,
                slctuser: $('#slctuser').val(),
                slctcoin: $('#slctcoin').val(),
                txscope: txscope
            },
            success: function(result){
                txsProcessing(result);
                txpagegroup = 0;
                sasTxpageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.stxpb', function(){
        var txsc = txscSelecting();
        var txio = txioSelecting();
        var txscope = txscopeSelecting();

        $.ajax({
            url: '/tx/searchandsort',
            data: {
                addr: $('#account_address').next().text(),
                txsc: txsc,
                txio: txio,
                slctuser: $('#slctuser').val(),
                slctcoin: $('#slctcoin').val(),
                txscope: txscope,
                bn: $(this).attr('nextbn'),
                txidx: $(this).attr('nextxidx')
            },
            success: function(result){
                txsProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.stxpb').parent().removeClass('active');
        $(this).parent().addClass('active');
    });

    $(document).on('click', '.nstxpb', function(){
        var txsc = txscSelecting();
        var txio = txioSelecting();
        var txscope = txscopeSelecting();

        $.ajax({
            url: '/tx/searchandsort',
            data: {
                addr: $('#account_address').next().text(),
                txsc: txsc,
                txio: txio,
                slctuser: $('#slctuser').val(),
                slctcoin: $('#slctcoin').val(),
                txscope: txscope,
                bn: $(this).attr('nextbn'),
                txidx: $(this).attr('nextxidx')
            },
            success: function(result){
                txsProcessing(result);
                txpagegroup += 10;
                sasTxpageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.prestxpb', function(){
        var txsc = txscSelecting();
        var txio = txioSelecting();
        var txscope = txscopeSelecting();

        $.ajax({
            url: '/tx/searchandsort',
            data: {
                addr: $('#account_address').next().text(),
                txsc: txsc,
                txio: txio,
                slctuser: $('#slctuser').val(),
                slctcoin: $('#slctcoin').val(),
                txscope: txscope,
                bn: $(this).attr('nextbn'),
                txidx: $(this).attr('nextxidx')
            },
            success: function(result){
                txsProcessing(result);
                txpagegroup -= 10;
                sasTxpageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function sasTxpageProcessing(result){
        var page = result.txpage;
        $('#txpage li').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.pfpv){
                    $('#txpage').append("<li class='page-item'><a class='page-link prestxpb' nextbn='"+result.pfpv.bn+"' nextxidx='"+result.pfpv.txidx+"'>&lt;</a></li>");
                }
                $('#txpage').append("<li class='page-item active'><a class='page-link stxpb' nextbn='"+page[i].bn+"' nextxidx='"+page[i].txidx+"'>"+(txpagegroup + 1)+"</a></li>");
            } else if(i == 10) {
                $('#txpage').append("<li class='page-item'><a class='page-link nstxpb' nextbn='"+page[i].bn+"' nextxidx='"+page[i].txidx+"'>&gt;</a></li>");
            } else {
                $('#txpage').append("<li class='page-item'><a class='page-link stxpb' nextbn='"+page[i].bn+"' nextxidx='"+page[i].txidx+"'>"+(txpagegroup + i + 1)+"</a></li>");
            }
        }
    }

    $('#delete').submit(function(){
        return confirm("정말로 삭제하시겠습니까?");
    });
});

var a = false;

function checkval(){
    var pw = document.getElementById('pw');
    var pwcheck = document.getElementById('pwcheck');
    var name = document.getElementById('name');
    var nickname = document.getElementById('nickname');
    var email = document.getElementById('email');
    var cellphone = document.getElementById('cellphone2');

    if(pw.value == "" || pw.value == null){
        alert("비밀번호를 입력해주세요.");
        return false;
    }
    if(pw.value.length < 8){
        alert("비밀번호를 8자 이상 입력해주세요.");
        return false;
    }
    if(pwcheck.value == "" || pwcheck.value == null){
        alert("비밀번호를 확인해주세요.");
        return false;
    }
    if((pw.value != "" && pw.value != null) && (pwcheck.value != "" && pwcheck.value != null)){
        if(pw.value != pwcheck.value){
            alert("비밀번호가 틀렸습니다. 다시 확인해 주세요.");
            return false;
        }    
    }
    if(name.value == "" || name.value == null){
        alert("이름을 입력해주세요.");
        return false;
    }
    if(nickname.value == "" || nickname.value == null){
        alert("닉네임을 입력해주세요.");
        return false;
    }
    if(email.value == "" || email.value == null){
        alert("이메일을 입력해주세요.");
        return false;
    }
    if(email.value.indexOf('@') == -1){
        alert('이메일 형식이 잘못됐습니다.')
        return false;
    }
    if(cellphone.value == "" || cellphone.value == null){
        alert("전화번호를 입력해주세요.");
        return false;
    }
    if(cellphone.value != "" && cellphone.value != null){
        for(var i = 0; i < cellphone.value.length; i++){
            if(48 <= cellphone.value.charCodeAt(i) && cellphone.value.charCodeAt(i) <= 57){
                result1 += cellphone.value.charAt(i);
            }
        }
        cellphone.value = result1;
    }
}

// 비밀번호 지웠을 때 빈화면 출력.
function pw2(){
    var pw = document.forms[0].pw1;
    var pwcheck = document.forms[0].pwcheck1;
    var div = document.getElementById("pwcheckmsg");

    if(pw.value.length < 8 && pw.value.length >= 1){
        div.style.color = "purple";
        div.innerHTML = "8자이상 입력해 주세요";
    } else {
        div.innerHTML = "1";
        div.style.color = 'white';
        if((pwcheck.value != "" && pwcheck.value != null) && (pw.value != "" && pw.value != null)){
            if(pw.value != pwcheck.value){
                div.style.color = "red";
                div.innerHTML = "비밀번호 불일치!";
            } else if (pw.value == pwcheck.value){
                div.style.color = "green";
                div.innerHTML = "비밀번호 일치!";
            }
            
            if((pwcheck.value == "" || pwcheck.value == null) && (pw.value == "" || pw.value == null)){
                div.innerHTML = "1";
                div.style.color = 'white';
            }
        }
    }
}

// 키 눌렀을 때 비밀번호 확인메세지 출력.
function pwcheck2(){
    var pw = document.forms[0].pw1;
    var pwcheck = document.forms[0].pwcheck1;
    var div = document.getElementById("pwcheckmsg");

    if(pwcheck.value.length < 8 && pwcheck.value.length >= 1){
        div.style.color = "purple";
        div.innerHTML = "8자이상 입력해 주세요";
    } else {
        if((pwcheck.value != "" && pwcheck.value != null) && (pw.value != "" && pw.value != null)){
            if(pw.value != pwcheck.value){
                div.style.color = "red";
                div.innerHTML = "비밀번호 불일치!";
            } else if (pw.value == pwcheck.value){
                div.style.color = "green";
                div.innerHTML = "비밀번호 일치!";
            } else {
                div.innerHTML = " ";
            }
        } else if ((pwcheck.value == "" || pwcheck.value == null) && (pw.value == "" || pw.value == null)){
            div.innerHTML = "1";
            div.style.color = 'white';
        }
    }
}