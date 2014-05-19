/*
 *Created by : Umair Shahid
 *Tags create,delete, edit plugin
 *Version: 1 
 *=================================*/

!function ($) {
  "use strict"; 

  var Tags = function (element, options) {
    this.init(element, options)
  }

  Tags.prototype = {

    constructor: Tags

  , init: function (element, options) {           
      this.$element = $(element)
      this.options = this.getOptions(options)
      if(this.options.module == "Image"){
         //this.dialog.addClass("image-url-preview");
         this.options.template =  '<div class="tags-contents" style="display: inline-block;"><span class="tagicon gray"></span><ul style="width:auto"></ul></div><div class="tags-buttons"><span class="showtooltip ellipsis" style="display:none" data-original-title="More Tags">...</span><div class="addtag pointy add"><a class="showtooltip" data-original-title="Add Tag"><strong>+</strong></a></div></div>';    
      }
      this.ele = $(this.options.template)
      this.dialog = $(this.options.dialog)
      this.toolbar = $(this.options.toolbar)
      this.tag_id = -1
      this.tag_li = null
      this.tag_action = 'add'
      this.tags_common = []
      this.$element.children().remove()
      this.$element.append(this.ele)
      
      this.showTags()      
     //Click on add tag button      
     this.ele.find(".addtag").on("click",$.proxy(this.showTagsDialog,this))
     this.ele.find(".ellipsis").on("mouseover",$.proxy(this.toggleOverFlow,this))
     this.ele.find(".ellipsis").on("click",$.proxy(this.toggleOverFlow,this))
     
     //Stop propagation so avoid stopping custom dialogs
     this.dialog.click(function(event){
         event.stopPropagation()
     })
     this.ele.find("ul").click(function(event){
         event.stopPropagation()
     })
     
     //Close dialog button
     this.dialog.find("#tag_box_close").on("click",$.proxy(this.hideTagDialog,this))
     //save dialog button
     if(this.options.tempOpt===false){
        this.dialog.find("#add_tag_btn").on("click",$.proxy(this.saveTag,this))
     }
     else{
         this.dialog.find("#add_tag_btn").on("click",$.proxy(this.addTag,this))
     }
     //save dialog button
     this.dialog.find(".tag-input").on("keydown",$.proxy(this.saveTagOnEnter,this))
     //Edit tag from toolbar
     //this.toolbar.find(".edit").on("click",$.proxy(this.editTag,this))
     //Delete tag from toolbar
     //this.toolbar.find(".delete").on("click",$.proxy(this.deleteTag,this))
     
     $("body").append(this.dialog)
     //$("body").append(this.toolbar)
     //Show hide add button
     this.showAddTagButton()
	 this.$element.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
    }
  ,showTags:function(){
      var tags = this.options.tags
      var tags_ul = this.ele.find("ul")
      tags_ul.children().remove()  
      if(tags!==""){
        var tags_array = tags.split(",")
        var self= this
        $.each(tags_array,function(i,t){            
            var li_html =$('<li id="_tag_'+i+'"><a class="tag" ><span> '+t+'</span><i class="icon cross" ></i></a></li>')            
            li_html.find(".cross").click(function(event){
               var li = $(this).parents("li")
               if(li.attr("id")){
                    self.tag_id = i   
                    self.tag_li = li
                }
                self.deleteTag()
            })
            tags_ul.append(li_html);                    
        });                                    
      }
      if(tags_ul.children().length==0){
           this.ele.find(".tags-contents").hide();
        }else if(this.options.module == "recipients"){
            tags_ul.css("overflow","initial");
        }else{
            this.ele.find(".tags-contents").css("display","inline-block");           
            tags_ul.css("width","auto");
            if(tags_ul.width()>260){
                tags_ul.css("width","250px");              
                this.$element.find(".tags-buttons .ellipsis").css("display","inline-block");              
            }
            else{
                tags_ul.unbind("mouseout")
                tags_ul.removeClass("overflow");              
                this.$element.find(".tags-buttons .ellipsis").hide();
            }
       }
       this.initTypeAhead()
  },
  validation:function(tag){
        var isValid = true;
        if(this.tag_action=='delete'){
           return true
        }
        var tags_arr = this.options.tags.split(",");
        var edit_id = this.tag_id==-1?null:this.tag_id;
        if($.trim(tag)==""){
            isValid = false;
        }
        else if(tag.length>30){                        
            this.options.app.showAlert('Tag length shouldn\'t be greater than 30 characters.',$("body"),{fixed:true});
            isValid = false;
        }
        else if(tag.indexOf(",")>-1){                        
            this.options.app.showAlert('Tag shouldn\'t contain ",".',$("body"),{fixed:true});
            isValid = false;
        }
        else if($.inArray(this.options.app.encodeHTML(tag),tags_arr)>-1){                        
            if(edit_id===null){                            
                this.options.app.showAlert('Tag already exists with same name.',$("body"),{fixed:true});
                isValid = false;
            }
            else if($.inArray(this.options.app.encodeHTML(tag),tags_arr)!=parseInt(edit_id)){                            
                this.options.app.showAlert('Tag already exists with same name.',$("body"),{fixed:true});
                isValid = false;
            }
        }                    
        else if(edit_id===null && tags_arr.length>=this.options.tag_limit){                        
            this.options.app.showAlert('You can enter '+this.options.tag_limit+' tags for '+this.options.module+'.',$("body"),{fixed:true});
            isValid = false;
        }
        if(isValid===false){
            $(".custom_popup").hide(); 
        }
        return isValid;
    }
  ,saveTagOnEnter:function(e){
      if(e.keyCode==13){
          if(this.options.tempOpt===false){
            this.saveTag()
          }
          else{
              this.addTag()
          }
      }
      else if(e.keyCode==27){
          this.hideTagDialog()
      }
  }  
  ,saveTag:function(){      
      var _input = this.dialog.find("input.tag-input")
      var tag = _input.val()      
      if(this.options.url && this.validation(tag)){  
            tag = this.options.app.encodeHTML(tag)
            var self = this
            var temp_tags = '';
            if(this.tag_action!=="delete"){
                this.dialog.find("#add_tag_btn").addClass("saving")
                self.dialog.find(".tag-input").prop("disabled",true);
                self.dialog.find(".addtag").prop("disabled",true).addClass("saving");
                if(this.tag_action=="edit"){
                    var tags_array = this.options.tags.split(",")
                    tags_array[this.tag_id] = tag
                    temp_tags = tags_array.join()                    
                }
                else{
                    temp_tags = (this.options.tags)?(this.options.tags+","+tag):tag
                }
            }
            else{                
                var tags_array = this.options.tags.split(",")
                tags_array.splice(this.tag_id,1)
                temp_tags = tags_array.join()
            }
            
            var URL = this.options.url;
            this.options.params['tags'] = this.options.app.decodeHTML(temp_tags)
            var params = this.options.params
            this.showLoading()
            $.post(URL, params)
                .done(function(data) {
                    self.hideLoading()
                    var tag_json = jQuery.parseJSON(data);
                    if(self.options.app.checkError(tag_json)){
                        return false;
                     }
                    self.dialog.find("#add_tag_btn").removeClass("saving") 
                    if(tag_json[0]=="success"){
                        self.options.tags = temp_tags;
                        self.showTags();
                        if(self.options.module == "Image" || self.options.module == "recipients")
                            self.options.callBack(temp_tags);
                    }
                    
                    if(self.tag_action!=="delete"){
                        self.dialog.find(".tag-input").prop("disabled",false).val('');
                        self.dialog.find(".addtag").prop("disabled",false).removeClass("saving");
                    
                        if(self.tag_id!==-1){
                           self.dialog.hide(); 
                        }
                        else{
                            self.dialog.hide(); 
                            if(self.options.tags.split(",").length<5){
                                self.ele.find(".addtag").click();
                            }
                        }
                        //camp_obj.initTpyeAhead();
                    }
             });
           
      }                      
  }  
  ,addTag:function(){      
      var _input = this.dialog.find("input.tag-input")
      var tag = _input.val() 
      if(this.options.url && this.validation(tag)){  
          tag = this.options.app.encodeHTML(tag)
          var self = this
          var temp_tags = (this.options.tags)?(this.options.tags+","+tag):tag
          
           this.dialog.find("#add_tag_btn").addClass("saving")
           this.dialog.find(".tag-input").prop("disabled",true);
           this.dialog.find(".addtag").prop("disabled",true).addClass("saving");
           var URL = this.options.url
          
            this.options.params['tag'] = tag;
            this.options.params['type'] = 'addTag';
            var params = this.options.params
            this.showLoading()
            $.post(URL, params)
                .done(function(data) {
                    self.hideLoading()
                    var tag_json = jQuery.parseJSON(data);
                    if(self.options.app.checkError(tag_json) && tag_json[1]=="SESSION_EXPIRED"){
                        return false;
                    }
                    self.dialog.find("#add_tag_btn").removeClass("saving") 
                    if(tag_json && tag_json.success){
                        self.options.tags = temp_tags;
                        self.showTags();                                                                
                    }
                    else if(tag_json[0]=="err"){
                        self.options.app.showAlert(tag_json[1],$("body"));
                    }
                    self.dialog.find(".tag-input").prop("disabled",false).val('');
                    self.dialog.find(".addtag").prop("disabled",false).removeClass("saving");

                    if(self.tag_id!==-1){
                       self.dialog.hide(); 
                    }
                    else{
                        self.dialog.hide(); 
                        if(self.options.tags.split(",").length<5){
                            self.ele.find(".addtag").click();
                        }
                    }
                   
             });
      }
  },
  delTag:function(){
    var self = this  
    var URL = this.options.url      
    var tags_array = this.options.tags.split(",")
    var tag = tags_array[this.tag_id]
    tags_array.splice(this.tag_id,1)    
    var temp_tags = tags_array.join()
    
    this.options.params['tag'] = tag
    this.options.params['type'] = 'deleteTag'
    
    var params = this.options.params
    this.showLoading()
    $.post(URL, params)
        .done(function(data) {
            self.hideLoading()
            var tag_json = jQuery.parseJSON(data);
            if(self.options.app.checkError(tag_json) && tag_json[1]=="SESSION_EXPIRED"){
                return false;
            }            
            if(tag_json && tag_json.success){
                self.options.tags = temp_tags;
                self.showTags();                                                                
            }
            else if(tag_json[0]=="err"){
                self.options.app.showAlert(tag_json[1],$("body"));
            }
            
     });
  }
  ,showTagsDialog:function(obj){      
      var _ele  = obj?$.getObj(obj,"div"):this.tag_li;
      var _input = this.dialog.find("input.tag-input")      
      var left_minus = 0;
      if(_ele.hasClass("addtag")){          
        this.tag_id = -1
        this.tag_li = null
        left_minus = 17
        _input.val("")
        this.tag_action = 'add'
        this.dialog.find("#add_tag_btn span").html("Add")
      }
      else{
          _input.val($.trim(this.tag_li.find("a").html()))
          left_minus = 20
          this.dialog.find("#add_tag_btn span").html("Save")
      }
      var ele_offset = _ele.offset()                    
      var ele_height =  _ele.height()
      var top = ele_offset.top + ele_height +4
      var left = ele_offset.left-left_minus            
      
      $(".custom_popup").hide();      
      this.dialog.css({"left":left+"px","top":top+"px"}).show();
      this.dialog.find("input.tag-input").focus();
      if(obj && obj.stopPropagation){
        obj.stopPropagation()
      }
  }
  ,
  hideTagDialog:function(){
      this.dialog.hide()
  }
  ,editTag:function(obj){      
      this.tag_action = 'edit'
      this.showTagsDialog()            
      obj.stopPropagation()
  }
  ,deleteTag:function(){
      this.tag_action = 'delete' 
      if(this.options.tempOpt){
         this.delTag() 
      }
      else{
         this.saveTag()
      }
  }
  ,setObjectId:function(key,value){
      this.options.params[key] = value
      this.options.showAddButton = true
      this.showAddTagButton()
  },
  toggleOverFlow:function(){
      this.ele.find("ul").toggleClass("overflow")
      this.$element.find(".tags-buttons").toggleClass("overflow")
  },
  showOverFlow:function(){
      this.ele.find("ul").addClass("overflow")
      this.$element.find(".tags-buttons").addClass("overflow")
  },
  hideOverFlow:function(){
      this.ele.find("ul").removeClass("overflow")
      this.$element.find(".tags-buttons").removeClass("overflow")
  },
  showLoading:function(){
     var ele = this.$element.find(".tags-contents ul") 
     ele.append("<div class='loading tags-load-mask' style='opacity: 0.6;'><div class='loading-wheel'></div></div>")
  },
  hideLoading:function(){
      var ele = this.$element.find(".tags-contents ul .tags-load-mask")       
          ele.remove()
  },
  isChildOverflow:function(child,parent){
        var p = parent;
        var el = child;
        console.log(p.offsetHeight + "parent");
        console.log(el.offsetHeight);
        return (el.offsetTop < p.offsetTop || el.offsetLeft < p.offsetLeft) ||
            (el.offsetTop + el.offsetHeight > p.offsetTop + p.offsetHeight || el.offsetLeft + el.offsetWidth > p.offsetLeft + p.offsetWidth);
  }
  ,
  initTypeAhead:function(){
      if( this.options.typeAheadURL){
        var self = this        
        URL = this.options.typeAheadURL;                    
          jQuery.getJSON(URL,  function(tsv, state, xhr){
             if(xhr && xhr.responseText){                        
                  var tags_json = jQuery.parseJSON(xhr.responseText);                                
                  if(self.options.app.checkError(tags_json)){
                      return false;
                  }
                  self.tags_common = [];
                  if(tags_json.tags){
                    $.each(tags_json.tags[0], function(index, val) {
                          self.tags_common.push(val[0].tag);
                    })

                    var typeahead = self.dialog.find("input.tag-input").data('typeahead');
                    if(typeahead) typeahead.source = self.tags_common;
                    else self.dialog.find("input.tag-input").typeahead({source: self.tags_common,items:10});
                  }
             }
       }).fail(function() {  }); 
     }
  }
  ,showAddTagButton:function(){
    if(this.options.showAddButton){
        this.$element.find(".tags-buttons").attr("style","")
    }
    else{
        this.$element.find(".tags-buttons").hide()
    }
  }
  , getOptions: function (options) {
      options = $.extend({}, $.fn.tags.defaults, options)    
      return options
    }
  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }
  }

 /* TAGS PLUGIN DEFINITION
  * ========================= */

  $.fn.tags = function ( option ) {
    return this.each(function () {
      $(this).removeData('tags')    
      var $this = $(this)
        , data = $this.data('tags')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tags', (data = new Tags(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tags.Constructor = Tags

  $.fn.tags.defaults = {
    template: '<div class="tags-contents" style="display: inline-block;"><span class="tagicon gray"></span><ul style="width:auto"></ul></div><div class="tags-buttons"><span class="showtooltip ellipsis" style="display:none" data-original-title="More Tags">...</span><div class="addtag"><a class="showtooltip" data-original-title="Add Tag"><strong>+</strong></a></div></div>',
    dialog:'<div class="tagbox custom_popup"><input type="text" placeholder="Add Tag" class="tag-input" maxlength="30"><a class="btn-green savebtn left" id="add_tag_btn"><span>Add</span><i class="icon save"></i></a><a class="btn-gray right" id="tag_box_close"><span>Close</span><i class="icon cross"></i></a></div>;',
    toolbar:'<div class="tooltip tags-div custom_popup" style="display:none"><a class="right"><span class="icon delete"></span></a><a class="left"><span class="icon edit"></span></a></div>',
    tags:'',
    tempOpt:false,
    tag_limit: 5,
    showAddButton:false,
    url:'',
    module:"Campaign",
    params:{},
    typeAheadURL:''
  , app:null
  }

}(window.jQuery);