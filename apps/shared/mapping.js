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
      var template = $(this.options.template);
	  if(template != '')
	  {
      	template.find(".bDiv").css("height",this.options.gridHeight)
      	this.$element.find(".col2 .rightcol").append(template)
	  }
      this.mappingInit()
      //alert('aaa');
      this.$element.find(".col1 .move-row").click(_.bind(this.addToCol2,this))
      this.$element.find(".useallf").click(_.bind(this.moveAll,this))	 
	  if(this.options.loadTarget != '')
	 	 this.$element.find(".col1 .edit-action").click(_.bind(this.options.loadTarget,this));
	  if(this.options.copyTarget != '')	  		  
	 	 this.$element.find(".col1 .copy-action").click(_.bind(this.options.copyTarget,this));
    }
  ,mappingInit:function(){
	  if(this.options.movingElement == 'tr')
	  {
		  this.$element.find(".col1 .leftcol tr").each(function(i,v){
			  $(this).attr("item_index",i)          
		  });
		  if(this.$element.find('#recipients tr').length == 0)
			this.$element.find(".col2 .search input").attr('disabled','disabled');
	  }
	  else
	  {
		  this.$element.find(".col1 .leftcol li").each(function(i,v){
			  $(this).attr("item_index",i)          
		  });
		  if(this.$element.find('#recipients li').length == 0)
			this.$element.find(".col2 .search input").attr('disabled','disabled');
	  }
  }  
  ,addToCol2:function(obj){
	  var self = this
	  if(self.options.movingElement == 'tr')
      	var tr_obj = $(obj.target).parents("tr");
	  else
		var tr_obj = $(obj.target).parents("li");
	//alert(tr_obj);      
      tr_obj.fadeOut("fast", function(){
          var tr_copy = tr_obj.clone();
          $(this).remove();		  

              if(self.options.movingElement == 'tr')
                  tr_copy.find(".action").children().hide();
                  tr_copy.find(".move-row").removeClass("btn-green").addClass("btn-red").html('<i class="icon back left"></i><span>Remove</span>');
                  tr_copy.find(".move-row").show();
                  tr_copy.find(".move-row").click(_.bind(self.removeFromCol2,self));
                  if(self.options.movingElement == 'tr')
				  {
                      tr_copy.appendTo(self.$element.find(".col2 .rightcol tbody"));
					  if(self.$element.find(".col2 .rightcol tbody tr").length > 0)
					  	self.$element.find(".col2 .search input").removeAttr('disabled');
				  }
                  else
				  {
                      tr_copy.appendTo(self.$element.find(".col2 .rightcol ul"));
					  if(self.$element.find(".col2 .rightcol ul li").length > 0)
					  	self.$element.find(".col2 .search input").removeAttr('disabled');
				  }

                  tr_copy.fadeIn("fast");
		  
		  //++ Recipients count
		  if(self.options.sumColumn != '')
		  {
		  	var recpoldcount = self.$element.find("#"+self.options.sumTarget).text();
			if(self.options.movingElement == 'tr')
		  		var recpnewval = tr_obj.find("td:nth-child(2) div."+self.options.sumColumn).text();
			else
				var recpnewval = tr_obj.find("a.tag .badge").text();
			//alert(recpnewval);
		  	var recptotalcount = parseInt(recpoldcount) + parseInt(recpnewval);				   
		  	self.$element.find("#"+self.options.sumTarget).text(recptotalcount);
		  }
      })
  }  
  ,removeFromCol2:function(obj){      
      var self = this;
	  if(self.options.movingElement == 'tr')
      	var tr_obj = $(obj.target).parents("tr");
	  else
		var tr_obj = $(obj.target).parents("li");
		
      tr_obj.fadeOut("fast", function(){
          var tr_copy = tr_obj.clone();
          $(this).remove();

		  tr_copy.find(".action").children().show();
          tr_copy.find(".move-row").removeClass("btn-red").addClass("btn-green").html('<span>Use</span><i class="icon next"></i>')
          tr_copy.find(".move-row").click(_.bind(self.addToCol2,self))
		  if(self.options.loadTarget != '')
			 tr_copy.find(".action .edit-action").click(_.bind(self.options.loadTarget,self));
		  if(self.options.copyTarget != '')	  		  
			 tr_copy.find(".action .copy-action").click(_.bind(self.options.copyTarget,self));
          var _index = tr_copy.attr("item_index")
          var next_element = null
		  if(self.options.movingElement == 'tr')
		  {
         	 var col1_rows = self.$element.find(".col1 .leftcol tr");
			 if(self.$element.find(".col2 .rightcol tbody tr").length == 0)
				self.$element.find(".col2 .search input").attr('disabled','disabled');
		  }
		  else
		  {
		  	var col1_rows = self.$element.find(".col1 .leftcol li");
			if(self.$element.find(".col2 .rightcol ul li").length == 0)
				self.$element.find(".col2 .search input").attr('disabled','disabled');
		  }
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
			if(self.options.movingElement == 'tr')
			{
			  tr_copy.appendTo(self.$element.find(".col1 .leftcol tbody"));			  
			}
			else
			{
			  tr_copy.appendTo(self.$element.find(".col1 .leftcol ul"));			  
			}
          }
          tr_copy.fadeIn("fast");
		  
		  //-- Recipients count
		  if(self.options.sumColumn != '')
		  {
		  	var recpoldcount = self.$element.find("#"+self.options.sumTarget).text();
			if(self.options.movingElement == 'tr')
		  		var recpnewval = tr_obj.find("td:nth-child(2) div."+self.options.sumColumn).text();
			else
				var recpnewval = tr_obj.find("a.tag .badge").text();		  	
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
   template:'<div class="bmsgrid"><div class="bDiv"><table id="recipients" cellspacing="0" cellpadding="0" border="0" style="display: table;"><tbody></tbody></table></div></div>',   
   app:null,
   gridHeight:290,
   sumColumn: '',
   sumTarget: '',
   loadTarget: '',
   copyTarget: '',
   movingElement: 'tr'
  }

}(window.jQuery);