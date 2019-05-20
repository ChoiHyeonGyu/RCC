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