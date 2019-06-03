var sidebar = false;
function sideBarClick(){
    if(!sidebar){
        
        var nav = document.getElementsByClassName("sideNav")[0];
        nav.style.right = "0px";
        document.getElementById("sideNavBtn").style.background="black";
        document.getElementById("sideNavBtn").style.color="white";
        document.getElementById("sideNavBtn").innerText=">";
        sidebar = true;
    }
    else{
        var nav = document.getElementsByClassName("sideNav")[0];
        nav.style.right = "-90px";
        document.getElementById("sideNavBtn").style.background="white";
        document.getElementById("sideNavBtn").style.color="black";
        document.getElementById("sideNavBtn").innerText="<";
        sidebar = false;
    }
}

function search(key){
    if(key){
        if(document.getElementsByClassName("navSearch")[0].value.trim().length!=0)
        location.href='/search_result?pageNo=1&search='+document.getElementsByClassName("navSearch")[0].value+'&type='+$('#selectBox option:selected').val();
        return;
    }
    if(event.keyCode == "13"){
        location.href='/search_result?pageNo=1&search='+document.getElementsByClassName("navSearch")[0].value+'&type='+$('#selectBox option:selected').val();
    }
}