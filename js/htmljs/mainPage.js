
 var maxHeight = 0;
  
 $(document).ready(function(){
     var divList = document.getElementsByClassName('fixHeight');
     for(var i=0;i<divList.length;i++){
        if($(divList[i]).hasClass('active')) maxHeight = maxHeight < $(divList[i]).children('div').height() ? $(divList[i]).children('div').height() : maxHeight;
        else {
            $(divList[i]).addClass('active');
            maxHeight = maxHeight < $(divList[i]).children('div').height() ? $(divList[i]).children('div').height() : maxHeight;
            $(divList[i]).removeClass('active')
            console.log($(divList[i]).hasClass('active'))
        }
     }
     for(var i=0;i<divList.length;i++){
        if($(divList[i]).hasClass('active')) $(divList[i]).children('div').height(maxHeight);
        else {
            $(divList[i]).addClass('active');
            $(divList[i]).children('div').height(maxHeight);
            $(divList[i]).children('div').addClass('test');
            $(divList[i]).removeClass('active')
        }
    }

 
 });//DOCUMENT READY
