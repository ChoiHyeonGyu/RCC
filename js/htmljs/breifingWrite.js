var count=1;
function addPage(){
    if(count==10)return;
    count++;
    var newForm = "<div class='formDiv' id='formDiv"+count+"'>"+
    "<div class='divBox cw65'><span class='titleWord'>HeadLine</span> <input name='headline"+count+"' type='text' placeholder='title'></div>"+
    "<div class='divBox cw65'><span class='titleWord'>URL</span> <input name='url"+count+"' type='text' placeholder='url'></div>"+
    "<div>";
    $("#count").val(count);
    $("#writeFormBox").append(newForm);
}
function removePage(){
    if(count==1)return;
    var id = "formDiv"+count;
    var target = document.getElementById(id);
    target.parentNode.removeChild(target);
    count--;
}