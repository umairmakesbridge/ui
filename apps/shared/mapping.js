/*
 *Created by : Umair Shahid
 *Version: 1 
 *Mapping  fields plugin
 *=================================*/

!function ($) {
  "use strict"; 

  var Mapping = function (element, options) {
    this.init(element, options)
  }

  Mapping.prototype = {

    constructor: Mapping

  , init: function (element, options) {           
      this.$element = $(element)
      this.options = this.getOptions(options)
	  //alert(this.options.sumColumn);
      var template = $(this.options.template)
      template.find(".bDiv").css("height",this.options.gridHeight)
      this.$element.find(".col2 .rightcol").append(template)
      
      this.mappingInit()
      
      this.$element.find(".col1 .move-row").click(_.bind(this.addToCol2,this))
      this.$element.find(".useallf").click(_.bind(this.moveAll,this))	 
	  if(this.options.loadTarget != '')
	 	 this.$element.find(".col1 .use").click(_.bind(this.options.loadTarget,this));
	  if(this.options.copyTarget != '')	  		  
	 	 this.$element.find(".col1 .copy").click(_.bind(this.options.copyTarget,this));
    }
  ,mappingInit:function(){
      this.$element.find(".col1 .leftcol tr").each(function(i,v){
          $(this).attr("item_index",i)          
      })
  }  
  ,addToCol2:function(obj){
      var tr_obj = $(obj.target).parents("tr")
      var self = this
      tr_obj.fadeOut("fast", function(){
          var tr_copy = tr_obj.clone();
          $(this).remove();
		  //if(tr_copy.find(".action .use"))
		  tr_copy.find(".action").children().hide();
          tr_copy.find(".action .move-row").removeClass("btn-green").addClass("btn-red").html("Remove");
		  tr_copy.find(".action .move-row").show();
          tr_copy.find(".action .move-row").click(_.bind(self.removeFromCol2,self));
          tr_copy.appendTo(self.$element.find(".col2 .rightcol tbody"));
          tr_copy.fadeIn("fast");
		  
		  //++ Recipients count
		  if(self.options.sumColumn != '')
		  {
		  	var recpoldcount = self.$element.find("#"+self.options.sumTarget).text();
		  	var recpnewval = tr_obj.find("td:nth-child(2) div."+self.options.sumColumn).text();
			//alert(recpnewval);
		  	var recptotalcount = parseInt(recpoldcount) + parseInt(recpnewval);				   
		  	self.$element.find("#"+self.options.sumTarget).text(recptotalcount);
		  }
      })
  }  
  ,removeFromCol2:function(obj){
      var tr_obj = $(obj.target).parents("tr");  
      var self = this;
      tr_obj.fadeOut("fast", function(){
          var tr_copy = tr_obj.clone();
          $(this).remove();
		  //if(tr_copy.find(".action .use"))
		  tr_copy.find(".action").children().show();
          tr_copy.find(".action .move-row").removeClass("btn-red").addClass("btn-green").html("Use")
          tr_copy.find(".action .move-row").click(_.bind(self.addToCol2,self))
		  if(self.options.loadTarget != '')
			 tr_copy.find(".action .use").click(_.bind(self.options.loadTarget,self));
		  if(self.options.copyTarget != '')	  		  
			 tr_copy.find(".action .copy").click(_.bind(self.options.copyTarget,self));
          var _index = tr_copy.attr("item_index")
          var next_element = null
          var col1_rows = self.$element.find(".col1 .leftcol tr")
          for(var i=0;i<col1_rows.length;i++){
              if(parseInt($(col1_rows[i]).attr("item_index"))>_index){
                  next_element = $(col1_rows[i])
                  break
              }          
          }  
          if(next_element){
            tr_copy.insertBefore(next_element)
          }
          else{
            tr_copy.appendTo(self.$element.find(".col1 .leftcol tbody"))
          }
          tr_copy.fadeIn("fast");
		  
		  //-- Recipients count
		  if(self.options.sumColumn != '')
		  {
		  	var recpoldcount = self.$element.find("#"+self.options.sumTarget).text();
		  	var recpnewval = tr_obj.find("td:nth-child(2) div."+self.options.sumColumn).text();
		  	var recptotalcount = recpoldcount - recpnewval;
		  	self.$element.find("#"+self.options.sumTarget).text(recptotalcount);
		  }
      })
  },
  moveAll:function(){
      this.$element.find(".col1 .bmsgrid tr .move-row").click()
  }
  , getOptions: function (options) {
      options = $.extend({}, $.fn.mapping.defaults, options)    
      return options
    }
  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }
  }

 /* FILTER PLUGIN DEFINITION
  * ========================= */

  $.fn.mapping = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('mapping')
        , options = typeof option == 'object' && option
      if (!data) $this.data('mapping', (data = new Mapping(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.mapping.Constructor = Mapping

  $.fn.mapping.defaults = { 
   template:'<div class="bmsgrid"><div class="bDiv"><table cellspacing="0" cellpadding="0" border="0" style="display: table;"><tbody></tbody></table></div></div>',   
   app:null,
   gridHeight:290,
   sumColumn: '',
   sumTarget: '',
   loadTarget: '',
   copyTarget: '',
  }

}(window.jQuery);