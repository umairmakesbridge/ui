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
      this.ele = $(this.options.template)
      this.dialog = $(this.options.dialog)
      this.toolbar = $(this.options.toolbar)
      this.tag_id = -1
      this.tag_li = null
      this.tag_action = 'add'
      this.tags_common = ''
      
      this.$element.append(this.ele)
      
      this.showTags()      
     //Click on add tag button      
     this.ele.find(".addtag").on("click",$.proxy(this.showTagsDialog,this))
     this.ele.find(".ellipsis").on("click",$.proxy(this.showOverFlow,this))
     
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
     this.dialog.find("#add_tag_btn").on("click",$.proxy(this.saveTag,this))
     //Edit tag from toolbar
     this.toolbar.find(".edit").on("click",$.proxy(this.editTag,this))
     //Delete tag from toolbar
     this.toolbar.find(".delete").on("click",$.proxy(this.deleteTag,this))
     
     $("body").append(this.dialog)
     $("body").append(this.toolbar)
     //Show hide add button
     this.showAddTagButton()
    }
  ,showTags:function(){
      var tags = this.options.tags
      var tags_ul = this.ele.find("ul")
      tags_ul.children().remove()  
      if(tags!==""){
        var tags_array = tags.split(",")
        var self= this
        $.each(tags_array,function(i,t){
            var char_comma = (i<tags_array.length-1)?",":"";
            var li_html =$('<li id="_tag_'+i+'"><a class="tag" > '+t+'</a>'+char_comma+'</li>')
            li_html.click(function(event){
                var li = $(this)
                var ele_offset = li.offset()
                var ele_width =  li.width()
                var ele_height =  li.height()
                var top = ele_offset.top + ele_height+5
                var left = ele_offset.left + (ele_width/2 - 15)

                if(li.attr("id")){
                    self.tag_id = i   
                    self.tag_li = li
                }
                //li_html.parent().find("a.active").removeClass("active")
                //li_html.find("a").addClass("active")
                $(".custom_popup").hide();
                self.toolbar.css({"left":left+"px","top":top+"px"}).show();
                event.stopPropagation();
            })
            tags_ul.append(li_html);        
        });                                    
      }
      if(tags_ul.children().length==0){
           this.ele.find(".tags-contents").hide();
        }
       else{
          this.ele.find(".tags-contents").css("display","inline-block");           
          tags_ul.css("width","auto");
          if(tags_ul.width()>260){
              tags_ul.css("width","250px");
              this.ele.find(".ellipsis").css("display","inline-block");
          }
          else{
              tags_ul.removeClass("overflow");
              this.ele.find(".tags-buttons").removeClass("overflow");
              this.ele.find(".tags-buttons .ellipsis").hide();
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
            this.options.app.showAlert('Tag length shouldn\'t be greater than 30 characters.',$("body"));
            isValid = false;
        }
        else if(tag.indexOf(",")>-1){                        
            this.options.app.showAlert('Tag shouldn\'t contain ",".',$("body"));
            isValid = false;
        }
        else if($.inArray(this.options.app.encodeHTML(tag),tags_arr)>-1){                        
            if(!edit_id){                            
                this.options.app.showAlert('Tag already exists with same name.',$("body"));
                isValid = false;
            }
            else if($.inArray(this.options.app.encodeHTML(tag),tags_arr)!=parseInt(edit_id)){                            
                this.options.app.showAlert('Tag already exists with same name.',$("body"));
                isValid = false;
            }
        }                    
        else if(!edit_id && tags_arr.length>=this.options.tag_limit){                        
            this.options.app.showAlert('You can enter '+this.options.tag_limit+' tags for campaign.',$("body"));
            isValid = false;
        }
        if(isValid===false){
            $(".custom_popup").hide(); 
        }
        return isValid;
    }
  ,saveTag:function(){      
      var _input = this.dialog.find("input.tag-input")
      var tag = _input.val()      
      if(this.options.url && this.validation(tag)){  
            tag = this.options.app.encodeHTML(tag)
            var self = this
            var temp_tags = '';
            if(this.tag_action!=="delete"){
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
                var tags_array = this.options.tags.split(",");
                tags_array.splice(this.tag_id,1);
                temp_tags = tags_array.join();
            }
            
            var URL = this.options.url;
            this.options.params['tags'] = this.options.app.decodeHTML(temp_tags)
            var params = this.options.params
            $.post(URL, params)
                .done(function(data) {
                    var tag_json = jQuery.parseJSON(data);
                    if(self.options.app.checkError(tag_json)){
                        return false;
                     }
                    if(tag_json[0]=="success"){
                        self.options.tags = temp_tags;
                        self.showTags();                                                                
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
  ,showTagsDialog:function(obj){      
      var _ele  = obj?$.getObj(obj,"div"):this.tag_li;
      var _input = this.dialog.find("input.tag-input")      
      var left_minus = 0;
      if(_ele.hasClass("addtag")){          
        this.tag_id = -1
        this.tag_li = null
        _input.val("")
        this.tag_action = 'add'
        this.dialog.find("#add_tag_btn").html("Add")
      }
      else{
          _input.val($.trim(this.tag_li.find("a").html()))
          left_minus = 20
          this.dialog.find("#add_tag_btn").html("Save")
      }
      var ele_offset = _ele.offset()                    
      var ele_height =  _ele.height()
      var top = ele_offset.top + ele_height
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
      this.saveTag()
  }
  ,setObjectId:function(key,value){
      this.options.params[key] = value
      this.options.showAddButton = true
      this.showAddTagButton()
  },
  showOverFlow:function(){
      this.ele.find("ul").toggleClass("overflow")
      this.$element.find(".tags-buttons").toggleClass("overflow")
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
                  self.tags_common = tags_json.tags.split(",");

                  var typeahead = self.dialog.find("input.tag-input").data('typeahead');
                  if(typeahead) typeahead.source = self.tags_common;
                  else self.dialog.find("input.tag-input").typeahead({source: self.tags_common,items:10});
             }
       }).fail(function() { console.log( "error in common tags" ); }); 
     }
  }
  ,showAddTagButton:function(){
    if(this.options.showAddButton){
        this.$element.find(".tags-buttons").show()
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
      var $this = $(this)
        , data = $this.data('tags')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tags', (data = new Tags(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tags.Constructor = Tags

  $.fn.tags.defaults = {
    template: '<div class="tags-contents" style="display: inline-block;"><span class="tagicon gray"></span><ul style="width:auto"></ul></div><div class="tags-buttons"><span class="ellipsis" style="display:none">...</span><div class="addtag"><a><strong>+</strong>Add Tag </a></div></div>',
    dialog:'<div class="tagbox custom_popup"><input type="text" placeholder="Add Tag" class="tag-input" maxlength="30"><a class="btn-green savebtn left" id="add_tag_btn">Add</a><a class="btn-gray left" id="tag_box_close">Close</a></div>;',
    toolbar:'<div class="tooltip tags-div custom_popup" style="display:none"><a class="right"><span class="icon delete"></span></a><a class="left"><span class="icon edit"></span></a></div>',
    tags:'',
    tag_limit: 5,
    showAddButton:false,
    url:'',
    params:{},
    typeAheadURL:''
  , app:null
  }

}(window.jQuery);