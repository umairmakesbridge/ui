define(['text!bmstemplates/html/template.html','jquery.icheck','bms-tags','bms-addbox','bms-dragfile','bms-mergefields'],
function (template,icheck,bmstags) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Template save and update view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            /**
             * Attach events on elements in view.
            */            
            events:{				
               'change #file_control':'uploadImage',
               'click #btn_image_url':"TryDialog"
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){              
               this.template = _.template(template);		                            
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));
               this.page = this.options.template;
               this.dialog = this.options.dialog;
               this.template_id = this.page.template_id;
               this.app = this.options.template.app;                                             
               this.$('input.checkpanel').iCheck({
                    checkboxClass: 'checkpanelinput',
                    insert: '<div class="icheck_line-icon"></div>'
               });                              
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,
            init:function(){
               var self = this;
               this.modal = this.$el.parents(".modal");
               this.tagDiv = this.modal.find(".tagscont");
               this.$('#file_control').attr('title','');
               this.head_action_bar = this.modal.find(".modal-header .edited  h2");
               var previewIconTemplate = $('<a class="icon preview showtooltip" data-original-title="Preview template"></a>').tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});;;  
               this.head_action_bar.find(".edit").hide();
               var copyIconTemplate = this.head_action_bar.find(".copy");
               copyIconTemplate.attr('data-original-title','Copy template').tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});;
               this.head_action_bar.find(".delete").attr('data-original-title','Delete template').tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
               this.head_action_bar.append(previewIconTemplate);
               this.initEditor();
               this.tagDiv.addClass("template-tag");
               this.loadTemplate();
               this.iThumbnail = this.$(".droppanel");
               this.$("textarea").css("height",(this.$("#area_create_template").height()-270)+"px");                              
               this.$(".droppanel").dragfile({
                        post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+this.app.get('bms_token')+'&type=add&allowOverwrite=N&th_width=240&th_height=320',
                        callBack : _.bind(this.processUpload,this),
                        app:this.app,
                        module:'template',
                        progressElement: this.$('.droppanel')
                    });
                this.$('#file_control').on('mouseover',_.bind(function(obj){
				this.$("#list_file_upload").css({'background' : '#00A1DD', 'color' : '#ffffff'});
			},this));
               this.$('#file_control').on('mouseout',_.bind(function(obj){
				this.$("#list_file_upload").css({'background' : '#01AEEE', 'color' : '#ffffff'});
			},this));
  
               	this.$(".add-cat").addbox({app:this.app,
                    addCallBack:_.bind(this.addCategory,this),
                    placeholder_text:'Please enter category'
                });
                
                // Merge Field Abdullah 
                this.$('#merge_field_plugin-wrap').mergefields({app:this.app,view:this,config:{links:true,state:'dialog'},elementID:'merge_field_plugin',placeholder_text:'Merge Tags'});
                copyIconTemplate.click(_.bind(function(e){                                     
                     this.page.copyTemplate(self);
               },this));  
               previewIconTemplate.click(_.bind(function(e){                                     
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-162;
                    var dialog = this.app.showDialog({title:'Template Preview',
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                              headerEditable:false,
                              headerIcon : 'dlgpreview',
                              bodyCss:{"min-height":dialog_height+"px"}                                                                          
                    });
                    var preview_iframe = "https://"+this.app.get("preview_domain")+"/pms/events/viewtemp.jsp?templateNumber="+this.template_id;
                    require(["common/templatePreview"],_.bind(function(templatePreview){
                           var tmPr =  new templatePreview({frameSrc:preview_iframe,app:this.app,frameHeight:dialog_height,prevFlag:'T',tempNum:this.template_id});
                            dialog.getBody().html(tmPr.$el);
                            tmPr.init();
                          },this));
//                    dialog.getBody().html(preview_iframe);                                         
                    e.stopPropagation();     
               },this));  
               
               this.dialog.$(".pointy .edit").click(_.bind(function(){
                    this.showHideTargetTitle(true);
               },this));
               
                this.dialog.$("#dialog-title span").click(_.bind(function(obj){
                    this.showHideTargetTitle(true);
               },this));
               
               this.dialog.$(".savebtn").click(_.bind(function(obj){
                    this.saveTemplateName(obj)
               },this));
               
               this.dialog.$(".cancelbtn").click(_.bind(function(obj){
                   if(this.template_id){
                       this.showHideTargetTitle();
                   }
               },this));
                this.dialog.$(".pointy .delete").click(_.bind(function(obj){
                    var _this = this;                    
                    this.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this template?",                                                
                            callback: _.bind(function(){													
                                    _this.deleteTemplate();
                            },_this)},
                    _this.dialog.$el);                         
                
                },this));
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
             /**
            * Load template contents and flag doing a get Ajax call.
            *
            * @param {o} textfield simple object.             
            * 
            * @param {txt} search text, passed from search control.
            * 
            * @returns .
            */
            loadTemplate:function(o,txt){
               var _this = this;
          
               this.app.showLoading("Loading Template...",this.$el);                                  
               var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=get&templateNumber="+this.template_id;
                this.getTemplateCall = jQuery.getJSON(URL,  function(tsv, state, xhr){
                   if(xhr && xhr.responseText){                        
                       _this.app.showLoading(false,_this.$el);
                        var template_json = jQuery.parseJSON(xhr.responseText);                                                                                               
                        if(_this.app.checkError(template_json)){
                            return false;
                        }
                         
                        _this.modal.find(".dialog-title").html(template_json.name).attr("data-original-title","Click to rename").addClass("showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                  
                        //_this.$("textarea").val(_this.app.decodeHTML(template_json.htmlText,true));
                        if(tinyMCE.get('bmseditor_template')){
                            tinyMCE.get('bmseditor_template').setContent(_this.app.decodeHTML(template_json.htmlText,true));                                 
                        }
                        else{
                            _this.editorContent = _this.app.decodeHTML(template_json.htmlText,true);
                        }
                        if(template_json.isFeatured=='Y'){
                            _this.$(".featured").iCheck('check');
                        }
                        if(template_json.isAdmin == "Y"){ 
                           if(template_json.isReturnPath=='Y'){
                               _this.$(".return-path").closest('.btnunchecked').css('display','inline-block');
                                _this.$(".return-path").iCheck('check');
                              }
                        }else{
                            _this.$(".return-path").closest('.btnunchecked').remove();
                        }
                        if(template_json.isMobile=='Y'){
                            _this.$(".mobile-comp").iCheck('check');
                        }
                        if(template_json.categoryID){
                            _this.$(".iconpointy").before($('<a class="cat">'+template_json.categoryID+'</a>'))
                        }
                        if(template_json.thumbURL){
                            _this.iThumbnail.find("h4").hide();
                            _this.iThumbnail.find("img").attr("src",_this.app.decodeHTML(template_json.thumbURL)).show();                                                        
                        }
                        _this.tagDiv.tags({app:_this.app,
                            url:'/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK='+_this.app.get('bms_token'),
                            params:{type:'tags',templateNumber:_this.template_id,tags:''}
                            ,showAddButton:true,                            
                            tags:template_json.tags
                         });
                   }
                 }).fail(function() { console.log( "error in loading template" ); }); 
            },
            addCategory:function(val){
                val = this.app.encodeHTML(val);
                if(this.$(".cat").length){
                    this.$(".cat").html(val);
                }
                else{
                   this.$(".iconpointy").before($('<a class="cat">'+val+'</a>')) 
                }
                return true;
            },
            uploadImage:function(obj){
                var input_obj = obj.target;
                var files = input_obj.files;                 
                if(this.iThumbnail.data("dragfile")){
                    this.iThumbnail.data("dragfile").handleFileUpload(files);
                }
            },
            processUpload:function(data){
                var _image= jQuery.parseJSON(data);
                if(_image.success){
                     this.$('.droppanel #progress').remove();
                     this.$('.csv-opcbg').hide();
                    _.each(_image.images[0],function(val){
                        this.iThumbnail.remove("file-border");
                        this.imageCheckSum = val[0]['imageId.encode'];
                        this.iThumbnail.find("h4").hide();
                        this.iThumbnail.find("img").attr("src",this.app.decodeHTML(val[0]['thumbURL'])).show();
                        
                    },this)
                }
                else{
                    this.app.showAlert(_image.err1,$("body"),{fixed:true});
                }
            },
            saveTemplateCall:function(){
                var _this = this;
                var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK="+this.app.get('bms_token');
                var isReturnPath = this.$(".return-path").prop("checked")?'Y':'N';
                var isFeatured = this.$(".featured").prop("checked")?'Y':'N';
                var isMobile = this.$(".mobile-comp").prop("checked")?'Y':'N';
                _this.app.showLoading("Updating Template...",this.$el);   
                $.post(URL, {type:'update',templateNumber:this.template_id,
                            imageId:this.imageCheckSum,
                            isFeatured:isFeatured,
                            isReturnPath:isReturnPath,
                            isMobile:isMobile,
                            categoryID:this.$(".cat").text(),
                            templateHtml:tinyMCE.get('bmseditor_template').getContent()//_this.$("textarea").val()
                        })
                .done(function(data) {                  
                      _this.app.showLoading(false,_this.$el);   
                       var _json = jQuery.parseJSON(data);        
                       if(_json[0]!=='err'){
                           _this.app.showMessge("Template Updated Successfully!");                                     
                           _this.page.$("#template_search_menu li:first-child").removeClass("active").click();
                       }
                       else{
                           _this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                       }
               });
            },
            initEditor:function(){
                var _this = this;                
                tinyMCE.init({
                    // General options
                    mode : "exact",
                    elements : "bmseditor_template",
                    theme : "advanced",
                    plugins : "contextmenu,fullscreen,inlinepopups,paste,searchreplace,iespell,style,table,visualchars,fullpage,preview,imagemanager",
                    //browsers : "msie,gecko,opera,safari",

                    doctype : '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
                    element_format : "html",

                    //plugins : "safari",
                    convert_urls : false,
                    relative_urls : false,
                    remove_script_host : false,

                    // paste options
                    paste_auto_cleanup_on_paste : true,
                    paste_retain_style_properties : "none",
                    paste_convert_middot_lists : false,
                    paste_strip_class_attributes : "all",
                    paste_remove_spans : true,
                    paste_remove_styles : true,
                    paste_text_use_dialog : true,
                    //paste_text_sticky : false,
                    paste_text_linebreaktype : "<br>",


                    // for <br>
                    forced_root_block : "",
                    force_br_newlines : true,
                    force_p_newlines : false,

                    // clean code
                    //apply_source_formatting : true,
                    //convert_newlines_to_brs : true,
                    convert_fonts_to_spans : false,
                    valid_elements : "*[*]",
                    height:450,

                    // Theme options
                    theme_advanced_buttons1 : "newdocument,bold,italic,underline,justifyleft,justifycenter,justifyright,justifyfull,formatselect,fontselect,fontsizeselect",
                    theme_advanced_buttons2 : "cut,copy,paste,pastetext,pasteword,search,replace,bullist,numlist,outdent,indent,blockquote,undo,redo,hr,removeformat,sub,sup,forecolor,backcolor,link,unlink,anchor,cleanup,code,fullscreen,preview",
                    theme_advanced_buttons3 : "",

                    //preview options
                    plugin_preview_width : "950",
                    plugin_preview_height : "750",

                    //theme_advanced_buttons4 : "styleprops",
                    theme_advanced_toolbar_location : "top",
                    theme_advanced_toolbar_align : "left",
                    theme_advanced_statusbar_location : "bottom",
                    theme_advanced_font_sizes: "8=8px,9=9px,10=10px,11=11px,12=12px,13=13px,14=14px,15=15px,16=16px,18=18px,20=20px,22=22px,24=24px,26=26px,28=28px,30=30px,36=36px",
                    theme_advanced_fonts : "Arial=Arial;Comic Sans MS=Comic Sans MS;Courier=Courier;Courier New=Courier New;Georgia=Georgia;Tahoma=Tahoma;"+
                                            "Times New Roman=Times New Roman;Trebuchet MS=Trebuchet MS;Lucinda Sans Unicode=Lucinda Sans Unicode;Verdana=Verdana",
                    theme_advanced_resizing : true,


                    // Example content CSS (should be your site CSS)
                    content_css : "/pms/css/tiny_mce.css",
                    //font_size_style_values : "10px,12px,13px,14px,16px,18px,20px",

                    // Drop lists for link/image/media/template dialogs
                    template_external_list_url : "/pms/js/tiny_mce_templates.js",
                    external_link_list_url : "lists/link_list.js",
                    external_image_list_url : "lists/image_list.js",
                    media_external_list_url : "lists/media_list.js",


                    // Replace values for the template plugin
                    template_replace_values : {
                            username : "Some User",
                            staffid : "991234"
                    },
                    setup : function(ed) {                            
                            /*ed.onChange.add(function(ed, l) {
                                    editor.page.states.editor_change = true;                                               
                            });*/
                            ed.onInit.add(function(ed, l) {
                                  var _height = _this.$("#area_create_template").parents(".modal-body").height();  
                                  var editor_heigt = _height-350;
                                  if(editor_heigt<600){
                                      editor_heigt = 504;
                                  }
                                  _this.$("#bmseditor_template_ifr").css("height",(editor_heigt)+"px");
                                  _this.$("#bmseditor_template_tbl").css("height",(editor_heigt-100)+"px");
                                  if(_this.editorContent){
                                        tinyMCE.get('bmseditor_template').setContent(_this.editorContent);           
                                  }
                            })
                    }

            });
            },
            saveTemplateName:function(obj){
                var _this  = this;
                var template_name_input =  $(obj.target).parents(".edited").find("input");                       
                var dailog_head = this.dialog;
                var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK="+this.app.get('bms_token');
                $(obj.target).addClass("saving");
                $.post(URL, { type: "rename",templateName:template_name_input.val(),templateNumber:this.template_id })
                  .done(function(data) {                              
                      var _json = jQuery.parseJSON(data);                              
                      if(_json[0]!=="err"){                                  
                         dailog_head.$("#dialog-title span").html(_this.app.encodeHTML(template_name_input.val()));                                                                                                 
                         _this.showHideTargetTitle();
                         _this.app.showMessge("Templated Renamed");    
                          _this.page.$("#template_search_menu li:first-child").removeClass("active").click();
                      }
                      else{                                  
                          _this.app.showAlert(_json[1],_this.$el);

                      }							  
                      $(obj.target).removeClass("saving");                              
                 });
            },
            showHideTargetTitle:function(show,isNew){
                if(show){
                    this.dialog.$("#dialog-title").hide();
                    this.dialog.$("#dialog-title-input").show();                    
                    this.dialog.$(".tagscont").hide();                   
                    this.dialog.$("#dialog-title-input input").val(this.app.decodeHTML(this.dialog.$("#dialog-title span").html())).focus();                    
                }
                else{
                    this.dialog.$("#dialog-title").show();
                    this.dialog.$("#dialog-title-input").hide();   
                    this.dialog.$(".tagscont").show();
                }
            },
             updateTemplate:function(){                                   
                               
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-182;
                    var dialog = this.app.showDialog({title:'Loading ...',
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                              headerEditable:true,
                              headerIcon : 'template',
                              bodyCss:{"min-height":dialog_height+"px"},
                              buttons: {saveBtn:{text:'Save'} }                                                                           
                        });

                    this.app.showLoading("Loading...",dialog.getBody());
                    this.loadTemplate(this);
                    dialog.getBody().html(this.$el);
             },
            deleteTemplate:function(){
                    var _this = this;                   
                    this.app.showLoading("Deleting Template...",this.dialog.$el);
                    var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'delete',templateNumber:this.template_id})
                    .done(function(data) {                  
                          _this.app.showLoading(false,_this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                               _this.dialog.hide();
                              _this.page.$("#template_search_menu li:first-child").removeClass("active").click();                              
                           }
                           else{
                               _this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                           }
                   });
                    
                },
                 TryDialog:function(){
                    var that = this;
                    var app = this.app;
                    var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-162;
                        var dialog = this.app.showDialog({title:'Images',
                                    css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                                    headerEditable:true,
                                    headerIcon : '_graphics',
                                    bodyCss:{"min-height":dialog_height+"px"}                                                                          
                         });
                         //// var _options = {_select:true,_dialog:dialog,_page:this}; // options pass to
                     this.app.showLoading("Loading...",dialog.getBody());
                     require(["userimages/userimages",'app'],function(pageTemplate,app){                                     
                         var mPage = new pageTemplate({app:app,fromDialog:true,_select_dialog:dialog,_select_page:that});
                         dialog.getBody().html(mPage.$el);
                        // $('.modal .modal-body').append("<button class='ScrollToTop' style='display:none;display: block;position: relative;left: 95%;bottom: 70px;' type='button'></button>");
                       // this.$el.parents(".modal").find(".modal-footer").find(".ScrollToTop").remove();
                         //dialog.saveCallBack(_.bind(mPage.returnURL,mPage,dialog,_.bind(that.useImage,that)));
                     });
                     
                },
                useImage:function(url){
                    this.$el.find("#image_url").val(url);
                }
        });
});
