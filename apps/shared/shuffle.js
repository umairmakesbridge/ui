/*
 *Created by : Umair Shahid
 *Version: 1 
 *Shuffle  fields plugin
 *=================================*/

!function ($) {
    "use strict"; 

    var Shuffle = function (element, options) {
        this.init(element, options)
    }

    Shuffle.prototype = {

        constructor: Shuffle

        , 
        init: function (element, options) {           
            this.$element = $(element)
            this.options = this.getOptions(options)	
            var template = $(this.options.template);
            if(template != '')
            {
                template.find(".bDiv").css("height",this.options.gridHeight)
                this.$element.find(this.options.rightCol).append(template)
            }
            this.mappingInit()                  
        }
        ,
        mappingInit:function(){
	 
        }  
        ,
        moveAll:function(){
            this.$element.find(".col1 .bmsgrid tr .move-row").click()
        },
        getCol2:function(){
            return this.options.rightCol;
        }
        , 
        getOptions: function (options) {
            options = $.extend({}, $.fn.shuffle.defaults, options)    
            return options
        }
        , 
        tip: function () {
            return this.$tip = this.$tip || $(this.options.template)
        }
    }

    /* FILTER PLUGIN DEFINITION
  * ========================= */

    $.fn.shuffle = function ( option ) {
        return this.each(function () {
            var $this = $(this)
            , data = $this.data('shuffle')
            , options = typeof option == 'object' && option
            if (!data) $this.data('shuffle', (data = new Shuffle(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.shuffle.Constructor = Shuffle

    $.fn.shuffle.defaults = { 
        template:'<div class="bmsgrid"><div class="bDiv dottedpanel"><table id="recipients" cellspacing="0" cellpadding="0" border="0" style="display: table;"><tbody></tbody></table></div></div>',   
        app:null,
        gridHeight:290,
        moveElement : "tr",
        rightCol:".col2 .rightcol",
        leftCol:".col1 .leftcol",
        moveSelector:".move-row",        
        loadTarget: '',
        copyTarget: ''
    }

}(window.jQuery);