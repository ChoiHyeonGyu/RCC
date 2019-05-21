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
    if(pwcheck.value=="" || pwcheck.value==null){
        alert("비밀번호를 확인해주세요.");
        return false;
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
    if(cellphone.value=="" || cellphone.value==null){
        alert("전화번호를 입력해주세요.");
        return false;
    }
}







// 비밀번호 지웠을 때 빈화면 출력.
function pw1(pw){
    var pwcheck=document.getElementById("pwcheck");
    var div=document.getElementById("pwcheckmsg");

    if((pwcheck.value=="" || pwcheck.value==null) && (pw.value=="" || pw.value==null)){
        div.innerHTML="1";
        div.style.color='white';
    }
}












// 키 눌렀을 때 비밀번호 확인메세지 출력.
function pwcheck1(pwcheck){
    var pw=document.getElementById("pw");
    var div=document.getElementById("pwcheckmsg");
    if((pwcheck.value!="" && pwcheck.value!=null) && (pw.value!="" && pw.value!=null)){
        if(pw.value != pwcheck.value){
            console.log("1");
            div.style.color="red";
            div.innerHTML="비밀번호 불일치!";
        }
        else if(pw.value == pwcheck.value){
            console.log("2");
            div.style.color="green";
            div.innerHTML="비밀번호 일치!";
        }else{
            console.log("3");
            div.innerHTML=" ";
        }
    }else if((pwcheck.value=="" || pwcheck.value==null) && (pw.value=="" || pw.value==null)){
        div.innerHTML="1";
        div.style.color='white';
    }


}



// 아이디 중복확인.
function idcheck(){
    if(true){

    }else{
        
    }
}