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
      chunk:4
  };
  config = $.extend(defConfig, config);
	/**  scroll to element function **/
         return this.each(function() {
            var that = this;
	    config.element = $(this);
	    config.max_length = $(this).find('ul li').length
            config.count = 0;
             
	   // config.chunk = config.chunk + 1;
            var count = 1;
           backward = function(){  
                 
                config.element.animate({
                     scrollLeft: config.element.find('ul li:nth-child(0)').scrollLeft()
                });
                count--;         
                config.forward.show();
                config.back.hide();
	     //   scrollToElement('.highlight:nth-child(' + count + ')', 1000, -150);
	    };
            var count = 1;
            forward = function() { 
                if(count > 1 && config.max_length <= 8) return;
                    config.element.animate({
                         scrollLeft: config.element.find('ul li:nth-child('+(config.chunk+1)+')').position().left
                    });
                if(config.max_length <= 8){
                    config.forward.hide();
                    config.back.show();
                }
                    count++;
            };
           
             if(config.element.find('ul li.selected').length > 0){
                var index = config.element.find('ul li.selected').parent().children().index(config.element.find('ul li.selected'));
                console.log();
                 if(index > 3){
                  forward();
                 }else{
                     config.forward.show();
                    config.back.hide();
                 }
             }
            config.element.bind('forward', function() {  forward(); });
            config.element.bind('backward', function() {  backward(); });
            
	});
   
};

}(jQuery));
