
 //current position
 var pos = 0;
 //number of slides
 var totalSlides = 0;
 //get the slide width
 var sliderWidth = 0;
 
  
 $(document).ready(function(){
     
    totalSlides = $('#slider-wrap ul li').length;
    sliderWidth = $('#slider-wrap').width();
     
     /*****************
      BUILD THE SLIDER
     *****************/
     //set width to be 'x' times the number of slides
     
     $('#slider-wrap ul#slider').width(sliderWidth*totalSlides);
     
     //next slide    
     $('#next').click(function(){
         slideRight();
     });
     
     //previous slide
     $('#previous').click(function(){
         slideLeft();
     });
     
     
     
     /*************************
      //*> OPTIONAL SETTINGS
     ************************/
     //automatic slider
     var autoSlider = setInterval(slideRight, 5000);
     
     //for each slide 
     $.each($('#slider-wrap ul li'), function() { 
 
        //create a pagination
        var li = document.createElement('li');
        $('#pagination-wrap ul').append(li);    
     });
      
     //counter
     countSlides();
     
     //pagination
     pagination();
     
     //hide/show controls/btns when hover
     //pause automatic slide when hover
     $('#slider-wrap').hover(
       function(){ $(this).addClass('active'); clearInterval(autoSlider); }, 
       function(){ $(this).removeClass('active'); autoSlider = setInterval(slideRight, 5000); }
     );
     
     
 
 });//DOCUMENT READY
     
 
 
 /***********
  SLIDE LEFT
 ************/
 function slideLeft(){
     pos--;
     if(pos==-1){ pos = totalSlides-1; }
     $('#slider-wrap ul#slider').css('left', -(sliderWidth*pos));    
     
     //*> optional
     countSlides();
     pagination();
 }
 
 
 /************
  SLIDE RIGHT
 *************/
 function slideRight(){
     pos++;
     if(pos==totalSlides){ pos = 0; }
     $('#slider-wrap ul#slider').css('left', -(sliderWidth*pos)); 
     
     //*> optional 
     countSlides();
     pagination();
 }
 
 
 
     
 /************************
  //*> OPTIONAL SETTINGS
 ************************/
 function countSlides(){
     $('#counter').html(pos+1 + ' / ' + totalSlides);
 }
 
 function pagination(){
     $('#pagination-wrap ul li').removeClass('active');
     $('#pagination-wrap ul li:eq('+pos+')').addClass('active');
 }
    