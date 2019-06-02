$(function(){
    var lastnum = 0;
    var srchpost = null;
    var srchcmnt = null;

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

    $(document).on('click', '.pb', function(){
        var s = pageSelecting();

        $.ajax({
            url: '/my/pagelist',
            data: {
                s: s,
                id: $(this).attr('nextid')
            },
            success: function(result){
                rowsSelecting(s, result);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.pb').removeClass('active');
        $(this).addClass('active');
    });

    $(document).on('click', '.nb', function(){
        var s = pageSelecting();

        $.ajax({
            url: '/my/pagelist',
            data: {
                s: s,
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

        $.ajax({
            url: '/my/pagelist',
            data: {
                s: s,
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
            $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='seluser'>"+rows[i][1]+"</td> </tr>");
        }
    }

    function rowsProcessing(data){
        var rows = data.rows;
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            if(data.metaData[1].name == "HEADLINE"){
                $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='headline'>"+rows[i][1]+"</td> <td>"+rows[i][2]+
                "</td> <td>"+rows[i][3]+"</td> <td>"+rows[i][4]+"</td> <td>"+rows[i][5]+"</td> <td>"+rows[i][6]+"</td> </tr>");
            } else {
                $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][0]+"</th> <td class='title'>"+rows[i][1]+"</td> <td>"+rows[i][2]+"</td> <td>"+
                rows[i][3]+"</td> <td>"+rows[i][4]+"</td> <td>"+rows[i][5]+"</td> <td>"+rows[i][6]+"</td> </tr>");
            }
        }
    }

    function rowsCmntProcessing(rows){
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            $('#boardlist').append("<tr class='selrow'> <th scope='row'>"+rows[i][3]+"</th> <td class='title'>"+rows[i][2]+"</td> <td>"+rows[i][0]+"</td> <td>"+rows[i][1]+"</td> </tr>");
        }
    }

    function pageProcessing(result){
        var page = result.page.rows;
        $('#pagelist button').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.previd){
                    $('#pagelist').append("<button type='button' class='btn btn-light preb' nextid='"+result.previd+"'>&lt;</button>");
                }
                $('#pagelist').append("<button type='button' class='btn btn-light active pb' nextid='"+page[i]+"'>"+(lastnum + 1)+"</button>");
            } else if(i == 10) {
                $('#pagelist').append("<button type='button' class='btn btn-light nb' nextid='"+page[i]+"'>&gt;</button>");
            } else {
                $('#pagelist').append("<button type='button' class='btn btn-light pb' nextid='"+page[i]+"'>"+(lastnum + i + 1)+"</button>");
            }
        }
    }

    $(document).on('click', '.seluser', function(){
        location.href = "/channel?SEID=" + $(this).text();
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
        $('.srchb').removeClass('active');
        $(this).addClass('active');
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
        $('#pagelist button').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.previd){
                    $('#pagelist').append("<button type='button' class='btn btn-light presrchb' nextid='"+result.previd+"'>&lt;</button>");
                }
                $('#pagelist').append("<button type='button' class='btn btn-light active srchb' nextid='"+page[i]+"'>"+(lastnum + 1)+"</button>");
            } else if(i == 10) {
                $('#pagelist').append("<button type='button' class='btn btn-light nsrchb' nextid='"+page[i]+"'>&gt;</button>");
            } else {
                $('#pagelist').append("<button type='button' class='btn btn-light srchb' nextid='"+page[i]+"'>"+(lastnum + i + 1)+"</button>");
            }
        }
    }
});

var a = false;

function checkval(){
    var pw = document.getElementById('pw');
    var pwcheck = document.getElementById('pwcheck');
    var name = document.getElementById('name');
    var nickname = document.getElementById('nickname');
    var email = document.getElementById('email');
    var cellphone = document.getElementById('cellphone');

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