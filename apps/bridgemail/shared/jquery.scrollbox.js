 /* Slider Scroll Plugin */
/*!
 * Developer: Abdul Wakeel
 * 
 * This plugin should be called once when the slider need to be init. passing chunks of slider.
 * 
 *  10/10/2014
 */

(function($) {

$.fn.scrollbox = function(config) {
  //default config
  var defConfig = {
      chunk:4,
      selection:false
  };
  config = $.extend(defConfig, config);
	/**  scroll to element function **/
         return this.each(function() {
            var that = this;
	    config.element = $(this);
	    config.max_length = $(this).find('ul li').length
            config.count = 0;
            config.seed = 0;
	   // config.chunk = config.chunk + 1;
           var count = 1;
           isScrolledIntoView=function(elem){
                        var docViewTop = $(window).scrollTop();
                        var docViewBottom = docViewTop + $(window).height();

                        var elemTop = $(elem).offset().top;
                        var elemBottom = elemTop + $(elem).height();

                        return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
            },
           backward = function(){  
               config.seed = config.seed - config.chunk;
               if(config.seed < config.chunk){
                     var left = config.element.find('ul li:first-child').css('left')
                    config.element.animate({
                        scrollLeft: left///
                    });
                    return false;;
                 }
                if(config.seed < 0)
                     config.seed = 0;
                 if(typeof config.element.find('ul li:nth-child('+(config.seed +1)+')').position() !="undefined"){
                    var left = config.element.find('ul li:nth-child('+(config.seed +1)+')').css('left')
                    config.element.animate({
                        scrollLeft: left///
                    });
                    return false;
                  }else{
                          config.element.animate({
                           scrollLeft:config.element.find('ul li:first-child').position().left
                         });
                         return false;
                    }
              return false;
                
	     //   scrollToElement('.highlight:nth-child(' + count + ')', 1000, -150);
	    };
            var count = 1;
            forward = function() { 
                
                 config.max_length = config.element.find('ul li').length
                if(config.max_length <= config.seed) { 
                    //console.log('reached last');
                   // config.forward.hide();
                   // config.back.show();
                    return false;
                }; 
                    if(config.seed < 0)
                        config.seed = 0;
                    
                    config.seed = config.seed + config.chunk; 
                      if(config.max_length < config.seed){
                        config.element.animate({
                           scrollLeft:config.element.find('ul li:last-child').position().left
                         });
                         return false;
                      }
                     if(typeof config.element.find('ul li:nth-child('+(config.seed+1)+')').position() !="undefined"){
                          config.element.animate({
                           scrollLeft:config.element.find('ul li:nth-child('+(config.seed+1)+')').position().left
                         });
                         return false;
                    }else{
                          config.element.animate({
                           scrollLeft:config.element.find('ul li:last-child').position().left
                         });
                         return false;
                    }
                    
              
                    return false;
            };
           if(config.selection == true){
             if(config.element.find('ul li.selected').length > 0){
                var index = config.element.find('ul li.selected').parent().children().index(config.element.find('ul li.selected'));
                 if(index > 5){
                  forward(); 
                 }else{ 
                 }
             }
           
          }
            config.element.bind('forward', function() {  
                forward(); 
                 
            });
            config.element.bind('backward', function() { 
                backward(); 
                 
            });
	});
   
};

}(jQuery));
