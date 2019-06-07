$(function(){
    $('form').submit(function(){
        if(isNaN(Number($('#sending_money').val()))){
            alert("Please. Enter Number!");
            return false;
        }
    });
    $('#cancel_btn').click(function(){
        location.href = "/";
    });
});