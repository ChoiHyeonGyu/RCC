
var a=false;

var count=0;



$(document).on("click","#phone_click",function(){
    $('#result').html('');
    $('#result').html('본인 확인 중');
    $("#result").css("color","red");
    $.ajax({
        url:'/auth',
        dataType:'json',
        type:'POST',
        data:{'cellphone':$("#cellphone").val()},
        success:function(result){
            if(result['result']==true){
                $('#result').html('본인 인증 성공');
                $("#result").css("color","green");
                count=1;
            }else if(result['result']==false){
                $('#result').html('본인 인증 실패');
                $("#result").css("color","red");
            }
        }
    });
});



function checkval(){
    var id=document.getElementById('id');
    var pw=document.getElementById('pw');
    var pwcheck=document.getElementById('pwcheck');
    var name=document.getElementById('name');
    var nickname=document.getElementById('nickname');
    var email=document.getElementById('email');
    var cellphone=document.getElementById('cellphone');
    if(id.value=="" || id.value==null){
        alert("아이디를 입력해주세요.");
        return false;
    }

    if(pw.value=="" || pw.value==null){
        alert("비밀번호를 입력해주세요.");
        return false;
    }
    if (pw.length<8){
        alert("비밀번호를 8자 이상 입력해주세요.");
        return false;
    }
    if(pwcheck.value=="" || pwcheck.value==null){
        alert("비밀번호를 확인해주세요.");
        return false;
    }
    

    if((pw.value!="" && pw.value!=null)&&(pwcheck.value!="" && pwcheck.value!=null)){
        if(pw.value!=pwcheck.value){
            alert("비밀번호가 틀렸습니다. 다시 확인해 주세요.");
            return false;
        }    
    }

    if(name.value=="" || name.value==null){
        alert("이름을 입력해주세요.");
        return false;
    }
    if(nickname.value=="" || nickname.value==null){
        alert("닉네임을 입력해주세요.");
        return false;
    }
    if(email.value=="" || email.value==null){
        alert("이메일을 입력해주세요.");
        return false;
    }
    
    if(email.value.indexOf('@')==-1){
        alert('이메일 형식이 잘못됐습니다.')
        return false;
    }

    if(cellphone.value=="" || cellphone.value==null){
        alert("전화번호를 입력해주세요.");
        return false;
    }
    if(count==0){
        alert("휴대폰 인증을 해주세요!");
        return false;
    }
    if(cellphone.value!="" && cellphone.value!=null){
        for(var i=0;i<cellphone.value.length;i++){
            if(48<=cellphone.value.charCodeAt(i) && cellphone.value.charCodeAt(i)<=57){
                result1+=cellphone.value.charAt(i);
            }
        }
        cellphone.value=result1;
    }
}





// 비밀번호 지웠을 때 빈화면 출력.
function pw2(){
    var pw=document.forms[0].pw1;
    var pwcheck=document.forms[0].pwcheck1;
    var div=document.getElementById("pwcheckmsg");
    

    if((pwcheck.value!="" && pwcheck.value!=null) && (pw.value!="" && pw.value!=null)){
        if(pw.value != pwcheck.value){
            div.style.color="red";
            div.innerHTML="비밀번호 불일치!";
        }else if(pw.value == pwcheck.value){
            div.style.color="green";
            div.innerHTML="비밀번호 일치!";
        }
    else{
            div.innerHTML=" ";
        }
    }

    
    
    if((pwcheck.value=="" || pwcheck.value==null) && (pw.value=="" || pw.value==null)){
        div.innerHTML="1";
        div.style.color='white';
    }
}



// 키 눌렀을 때 비밀번호 확인메세지 출력.
function pwcheck2(){
    var pw=document.forms[0].pw1;
    var pwcheck=document.forms[0].pwcheck1;
    var div=document.getElementById("pwcheckmsg");
    if((pwcheck.value!="" && pwcheck.value!=null) && (pw.value!="" && pw.value!=null)){
        if(pw.value != pwcheck.value){
            div.style.color="red";
            div.innerHTML="비밀번호 불일치!";
        }
        else if(pw.value == pwcheck.value){
            div.style.color="green";
            div.innerHTML="비밀번호 일치!";
        }else{
            div.innerHTML=" ";
        }
    }else if((pwcheck.value=="" || pwcheck.value==null) && (pw.value=="" || pw.value==null)){
        div.innerHTML="1";
        div.style.color='white';
    }


}



