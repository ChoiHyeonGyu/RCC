var sidebar = false;
function sideBarClick(){
    if(!sidebar){
        var nav = document.getElementsByClassName("sideNav")[0];
        nav.style.right = "0px";
        sidebar = true;
    }
    else{
        var nav = document.getElementsByClassName("sideNav")[0];
        nav.style.right = "-90px";
        sidebar = false;
    }
}

function search(){
    if(event.keyCode == "13"){
        alert("검색어 : "+document.getElementsByClassName("navSearch")[0].value);
    }
}