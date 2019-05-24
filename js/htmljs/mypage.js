$(function(){
    var lastnum = 0;

    $(document).on('click', '.sb', function(){
        $.ajax({
            url: '/subscriber/pagelist',
            data: { sid: $(this).attr('nextsid') },
            success: function(result){
                rowsSubProcessing(result.rows);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.sb').removeClass('active');
        $(this).addClass('active');
    });

    $(document).on('click', '.nsb', function(){
        $.ajax({
            url: '/subscriber/pagelist',
            data: { sid: $(this).attr('nextsid') },
            success: function(result){
                rowsSubProcessing(result.rows);
                lastnum += 10;
                pageSubProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });
    
    $(document).on('click', '.presb', function(){
        $.ajax({
            url: '/subscriber/pagelist',
            data: { sid: $(this).attr('nextsid') },
            success: function(result){
                rowsSubProcessing(result.rows);
                lastnum -= 10;
                pageSubProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function rowsSubProcessing(rows){
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            $('#boardlist').append("<tr> <th scope='row'>"+rows[i][0]+"</th> <td>"+rows[i][1]+"</td> </tr>");
        }
    }

    function pageSubProcessing(result){
        var page = result.page;
        $('#pagelist button').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.prevpid){
                    $('#pagelist').append("<button type='button' class='btn btn-light presb' nextsid='"+(page[i] + 100)+"'>&lt;</button>");
                }
                $('#pagelist').append("<button type='button' class='btn btn-light active sb' nextsid='"+page[i]+"'>"+(lastnum + 1)+"</button>");
            } else if(i == 10) {
                $('#pagelist').append("<button type='button' class='btn btn-light nsb' nextsid='"+page[i]+"'>&gt;</button>");
            } else {
                $('#pagelist').append("<button type='button' class='btn btn-light sb' nextsid='"+page[i]+"'>"+(lastnum + i + 1)+"</button>");
            }
        }
    }

    $(document).on('click', '.pb', function(){
        $.ajax({
            url: '/post/pagelist',
            data: { pid: $(this).attr('nextpid') },
            success: function(result){
                rowsProcessing(result.rows);
            },
            error: function(error){
                console.log(error);
            }
        });
        $('.pb').removeClass('active');
        $(this).addClass('active');
    });

    $(document).on('click', '.nb', function(){
        $.ajax({
            url: '/post/pagelist',
            data: { pid: $(this).attr('nextpid') },
            success: function(result){
                rowsProcessing(result.rows);
                lastnum += 10;
                pageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    $(document).on('click', '.preb', function(){
        $.ajax({
            url: '/post/pagelist',
            data: { pid: $(this).attr('nextpid') },
            success: function(result){
                rowsProcessing(result.rows);
                lastnum -= 10;
                pageProcessing(result);
            },
            error: function(error){
                console.log(error);
            }
        });
    });

    function rowsProcessing(rows){
        $('#boardlist tr').remove();
        for(var i = 0; i < rows.length; i++){
            if(rows[i][6] != null){
                $('#boardlist').append("<tr> <th scope='row'>"+rows[i][0]+"</th> <td>"+rows[i][6]+"</td> <td>"+rows[i][4]+
                "</td> <td>"+rows[i][5]+"</td> <td>"+rows[i][2]+"</td> <td>"+rows[i][1]+"</td> <td>"+rows[i][3]+"</td> </tr>");
            } else {
                $('#boardlist').append("<tr> <th scope='row'>"+rows[i][0]+"</th> <td>"+rows[i][7]+"</td> <td>"+rows[i][4]+"</td> <td>"+
                rows[i][5]+"</td> <td>"+rows[i][2]+"</td> <td>"+rows[i][1]+"</td> <td>"+rows[i][3]+"</td> </tr>");
            }
        }
    }

    function pageProcessing(result){
        var page = result.page;
        $('#pagelist button').remove();
        for(var i = 0; i < page.length; i++){
            if(i == 0){
                if(result.prevpid){
                    $('#pagelist').append("<button type='button' class='btn btn-light preb' nextpid='"+(page[i] + 60)+"'>&lt;</button>");
                }
                $('#pagelist').append("<button type='button' class='btn btn-light active pb' nextpid='"+page[i]+"'>"+(lastnum + 1)+"</button>");
            } else if(i == 10) {
                $('#pagelist').append("<button type='button' class='btn btn-light nb' nextpid='"+page[i]+"'>&gt;</button>");
            } else {
                $('#pagelist').append("<button type='button' class='btn btn-light pb' nextpid='"+page[i]+"'>"+(lastnum + i + 1)+"</button>");
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
    if(cellphone.value.indexOf('-') != -1){
        cellphone.value = cellphone.value.replace("-","");
        if(cellphone.value.indexOf('-') != -1){
            cellphone.value = cellphone.value.replace("-","");
            if(cellphone.value.indexOf('-') != -1){
                cellphone.value = cellphone.value.replace("-","");   
            }   
        }
    }
}

// 비밀번호 지웠을 때 빈화면 출력.
function pw2(){
    var pw = document.forms[0].pw1;
    var pwcheck = document.forms[0].pwcheck1;
    var div = document.getElementById("pwcheckmsg");

    if((pwcheck.value != "" && pwcheck.value != null) && (pw.value != "" && pw.value != null)){
        if(pw.value != pwcheck.value){
            div.style.color = "red";
            div.innerHTML = "비밀번호 불일치!";
        }else if(pw.value == pwcheck.value){
            div.style.color = "green";
            div.innerHTML = "비밀번호 일치!";
        }
    else{
            div.innerHTML = " ";
        }
    }

    if((pwcheck.value == "" || pwcheck.value == null) && (pw.value == "" || pw.value == null)){
        div.innerHTML = "1";
        div.style.color = 'white';
    }
}

// 키 눌렀을 때 비밀번호 확인메세지 출력.
function pwcheck2(){
    var pw = document.forms[0].pw1;
    var pwcheck = document.forms[0].pwcheck1;
    var div = document.getElementById("pwcheckmsg");

    if((pwcheck.value != "" && pwcheck.value != null) && (pw.value != "" && pw.value != null)){
        if(pw.value != pwcheck.value){
            div.style.color = "red";
            div.innerHTML = "비밀번호 불일치!";
        }
        else if(pw.value == pwcheck.value){
            div.style.color = "green";
            div.innerHTML = "비밀번호 일치!";
        }else{
            div.innerHTML = " ";
        }
    }else if((pwcheck.value == "" || pwcheck.value == null) && (pw.value == "" || pw.value == null)){
        div.innerHTML = "1";
        div.style.color = 'white';
    }
}