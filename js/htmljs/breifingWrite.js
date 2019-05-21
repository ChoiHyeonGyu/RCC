var count=1;
function addPage(){
    console.log('add');
    if(count==10)return;
    count++;
    var target = document.getElementById("writeFormBox");
    var newForm = "<div class='formDiv' id='formDiv"+count+"'>"+
    "<div class='divBox cw65'><span class='titleWord'>HeadLine</span> <input type='text' placeholder='title'></div>"+
    "<div class='divBox cw65'><span class='titleWord'>URL</span> <input type='text' placeholder='url'></div>"+
    "<div>";
    target.innerHTML+=newForm;
}
function removePage(){
    if(count==1)return;
    var id = "formDiv"+count;
    var target = document.getElementById(id);
    target.parentNode.removeChild(target);
    count--;
}