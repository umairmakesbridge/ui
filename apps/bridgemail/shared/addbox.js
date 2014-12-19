/*
 *Created by : Umair Shahid
 *Version: 1 
 *Add box plugin
 *=================================*/

!function ($) {
  "use strict"; 

  var AddBox = function (element, options) {
    this.init(element, options)
  }

  AddBox.prototype = {

    constructor: AddBox

  , init: function (element, options) {           
      this.$element = $(element)
      this.options = this.getOptions(options)	        
      this.fromDialog = this.options.fromDialog
      //this.mappingInit()     
      if(this.$element){
          this.dialog = $(this.options.template)          
          if(this.options.placeholder_text){
               this.dialog.find(".input-field").attr("placeholder",this.options.placeholder_text)               
          }
          if(this.options.addBtnText){
               this.dialog.find(".btn-add span").html(this.options.addBtnText)
          }
          this.$element.on("click",$.proxy(this.showBox,this))          
      }
    }
  ,showBox:function(obj){
      var _ele  = this.$element
      
      var dialogLeft=0,dialogTop=0;
      if(this.fromDialog){
          this.fromDialog.append(this.dialog);
          dialogLeft = this.fromDialog.offset().left;
          dialogTop = this.options._eletop;//this.fromDialog.offset().top;
      }
      else{
          $("body").append(this.dialog);
      }
      var left_minus = 15;      
      var ele_offset = _ele.offset()                    
      var ele_height =  _ele.height()
      var top = ele_offset.top + ele_height +4
      var left = ele_offset.left-left_minus            
      var topPos = dialogTop?dialogTop:top;
      
      this.dialog.click(function(event){
            event.stopPropagation()
      })
      this.dialog.find(".btn-close").on("click",$.proxy(this.hideBox,this))
        if(this.options.addCallBack){
          this.dialog.find(".btn-add").on("click",$.proxy(this.callBack,this))
        }
      this.dialog.css({"left":left-dialogLeft+"px","top":topPos+"px"}).show();
      this.dialog.find("input.input-field").on("keydown",$.proxy(function(e){
          if(e.keyCode==13){
              this.callBack();
          }
      },this));
      if(isNaN(this.options.app.getIEVersion())==false){
        this.dialog.find("input.input-field").removeAttr("placeholder");
      }
      this.dialog.find("input.input-field").focus();
      if(this.options.showCallBack){
        this.options.showCallBack(this.dialog.find("input.input-field"))
      }
      $(".tooltip").remove();
      if(obj && obj.stopPropagation){
        obj.stopPropagation()
      }
  },
  callBack:function(){
      var input_val = this.dialog.find(".input-field").val()
      if(input_val){
        if(this.options.addCallBack(input_val,this.$element)){
            this.hideBox()
        }
      }
      else{
          this.options.app.showAlert('Value can\'t be empty',$("body"));
      }
  },
  showLoading:function(){
     this.dialog.find(".input-field").prop("disabled",true);
     this.dialog.find(".btn-add").addClass("saving");
  },
  hideLoading:function(removeValue,hideBox){
     this.dialog.find(".input-field").prop("disabled",false)
     this.dialog.find(".btn-add").removeClass("saving")
     if(removeValue){
        this.dialog.find(".input-field").val('')
     }
     if(hideBox){
        this.hideBox()
     }
  }
  ,
  hideBox:function(){
      this.dialog.remove()
  }
  , getOptions: function (options) {
      options = $.extend({}, $.fn.addbox.defaults, options)    
      return options
    }
  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }
  }

 /* ADDBOX PLUGIN DEFINITION
  * ========================= */

  $.fn.addbox = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('addbox')
        , options = typeof option == 'object' && option
      if (!data) $this.data('addbox', (data = new AddBox(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.addbox.Constructor = AddBox

  $.fn.addbox.defaults = { 
   template:'<div class="tagbox tagbox-addbox" style=" display: block;"><input type="text" class="left input-field" placeholder="Enter Field name here"> <a class="btn-green btn-add left"><span>Add</span><i class="icon save"></i></a><a class="btn-gray btn-close right"><span>Close</span><i class="icon cross"></i></a></div>',      
   app:null,
   addCallBack:null,
   showCallBack:null,
   placeholder_text:'',
   addBtnText:'Add'
  }

}(window.jQuery);