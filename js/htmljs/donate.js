$(function(){
    $('#sending_coin').keyup(function(){
        $('#fee').text(($(this).val() * 0.054).toFixed(5));
    });

    $('form').submit(function(){
        if(isNaN(Number($('#sending_coin').val()))){
            alert("Please. Enter Number!");
            return false;
        }
    });
    $('#cancel_btn').click(function(){
        location.href = "/";
    });
});