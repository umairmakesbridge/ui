define(['text!campaigns/html/campaign_body.html','editor/editor','bms-mergefields'],
function (template,editorView) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Campaign body view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: '',            
            
            /**
             * Attach events on elements in view.
            */
            events: {
               'click #choose_soruce li':'step2TileClick',
               'click #btn_image_url':"TryDialog",
               'change #handcodedhtml':'editorChange',
               'change #plain-text':'editorChange',
               'change #htmlarea':'editorChange',
               'click .save-step2': 'saveForStep2'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page
                    this.camp_obj = this.options.camp_obj;                    
                    this.app = this.parent.app;   
                    this.templates = false;
                    this.states = {};
                    this.states.editor_change = false;
                    this.campobjData = this.parent.camp_json;
                    this.copyCampaigns = false;
                    this.meeEditor = false;
                    this.editable=this.options.editable;
                    this.scrollElement = this.options.scrollElement;                    
                    this.wp_id = "NT_MESSAGE";
                    this.bmseditor = new editorView({opener:this,wp_id:this.wp_id});  
                    this.render();                    
            },
              /**
             * Render view on page.
            */
            render: function () {                    
                
               this.$el.html(this.template({
                    model: this.model
                }));                               
                this.initControls();  
               
            },
            saveForStep2:function(obj){                  
                var button = $.getObj(obj,"a");
                if(!button.hasClass("saving")){
                    this.parent.saveStep2(false);
                    button.addClass("saving");
                }                                                                                      
            },
            initScroll:function(){            
                this.$win=this.$el.parents(".modal-body")
                ,this.$nav = this.$('.editortoolbar')
                ,this.$tools = this.$('.editortools')                                    
                ,this.$editorarea =this.$('.editorbox')
                ,this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').offset().top                
                ,this.isFixed = 0,this.scrollChanged=false;

                this.processScroll=_.bind(function(){                                                       
                  if(this.$("#area_html_editor_mee").height() > 0 ){ 
                    if(this.$("#area_html_editor_mee").css("display")!=="none"){  
                      var i, scrollTop = this.$win.scrollTop();
                      this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').offset().top  
                      if(this.$el.parents(".modal-body").find('#ui-accordion-accordion_setting-panel-0').hasClass("ui-accordion-content-active")){
                          scrollTop = scrollTop - 500;
                      }
                      if (scrollTop >= this.navTop && !this.isFixed) {
                        this.isFixed = 1
                        this.$nav.addClass('editor-toptoolbar-fixed');
                        this.$nav.css("width",this.$(".editorpanel").width());
                        this.$tools.addClass('editor-lefttoolbar-fixed');                        
                        this.$editorarea.addClass('editor-panel-fixed');                                                
                      } else if (scrollTop <= this.navTop && this.isFixed) {
                        this.isFixed = 0
                        this.$nav.removeClass('editor-toptoolbar-fixed');
                        this.$nav.css("width","100%");
                        this.$tools.removeClass('editor-lefttoolbar-fixed');                        
                        this.$editorarea.removeClass('editor-panel-fixed');                        
                      }                      
                    }
                  }
                },this);
                this.processScroll();
                this.$win.on('scroll', this.processScroll);                                
            },
            
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});                
                this.initMergeFields();
            },
            initMergeFields: function() {
                   this.$('#merge_field_plugin-wrap').mergefields({app:this.app,view:this,config:{links:true,state:'workspace',isrequest:true,parallel:true},elementID:'merge-field-editor',placeholder_text:'Merge tags'});
                   this.$('#merge_field_plugin-wrap-hand').mergefields({app:this.app,view:this,config:{links:true,state:'workspace'},elementID:'merge-field-hand',placeholder_text:'Merge tags'});
                   this.$('#merge_field_plugin-wrap-plain').mergefields({app:this.app,view:this,config:{links:true,state:'workspace'},elementID:'merge-field-plain',placeholder_text:'Merge tags'});
                },
            populateBody:function(){           
                
                if(this.campobjData.isTextOnly=="Y" ){
                    this.$("#plain_text").click();
                    this.$("#plain-text").val(this.app.decodeHTML(this.parent.plainText,true));
                } else if(this.campobjData.editorType=="W"){
                    this.$("#html_editor").click();
                }
                else if(this.campobjData.editorType=="MEE"){
                    this.$("#html_editor_mee").click();
                }else if(this.campobjData.editorType=="H"){
                    this.$("#html_code").click();
                    this.$("#handcodedhtml").val(this.app.decodeHTML(this.parent.htmlText,true));
                }
                
                
            },
            init:function(){
              this.$("#editorhtml").append(this.bmseditor.$el);
              this.bmseditor.initEditor({id:this.wp_id});  
              
              var _height = $(window).height()-431;
              var _width = this.parent.$el.width()-48;
              this.$(".html-text,.editor-text").css({"height":_height+"px","width":_width+"px"});
              this.$("#htmlarea").css({"height":_height+"px","width":(_width-2)+"px"});
              if(this.campobjData && this.campobjData.editorType=="W"){
                this.openEditor();
              }
            },
            step2TileClick:function(obj){
                var camp_obj = this;
                var target_li =$.getObj(obj,"li"); 
                if(this.$("#choose_soruce li.selected").length==0){
                    this.$(".selection-boxes").animate({width:"840px",margin:'0px auto'}, "medium",function(){
                        $(this).removeClass("create-temp");                                                                                        
                        camp_obj.step2SlectSource(target_li);
                    });
                }
                else{                                                                               
                    this.step2SlectSource(target_li);
                }
            },            
             showChangeEditorDialog: function(msg,target_li){
                  this.app.showAlertPopup({heading:'Confirm Change of Editor',
                    detail:msg,  
                    text: "Start From Scratch",
                    btnClass:"btn-yellow",
                    dialogWidth: "460px",
                    icon: "next",
                    callback: _.bind(function(){                  
                            if(this.$("#mee_editor").setMEEHTML){
                                this.$("#mee_editor").setMEEHTML("")
                            }
                            _tinyMCE.get('bmseditor_'+this.wp_id).setContent("");
                            this.parent.htmlText = "";     
                            this.step2SlectSource(target_li,true);                            
                            this.parent.saveStep2(false,"");
                            
                        },this)
                    },
                    $('body'));  
                },
                showChangeEditorWarning: function(target_li){
                  var selected_li = this.$("#choose_soruce li.selected");           
                  if(selected_li.length && this.campobjData.editorType=="MEE" && target_li.attr("id")=="html_editor"  && this.$("#mee_editor").getMEEBody() !== ""){
                        this.showChangeEditorDialog("Your current built Template will be lost, as it is not compatible with <b>HTML Editor</b>. Are you sure you want to continue?",target_li);
                        return true;    
                  }  
                  else if(selected_li.length && this.campobjData.editorType=="MEE" && target_li.attr("id")=="html_code" && this.$("#mee_editor").getMEEBody() !== ""){
                        this.showChangeEditorDialog("Your current built Template will be lost, as it is not compatible with <b>Hand Code HTML</b>. Are you sure you want to continue?",target_li);
                        return true;    
                  }  
                  else if(selected_li.length && ( (this.campobjData.editorType=="W" && _tinyMCE.get('bmseditor_'+this.wp_id).getBody().childNodes.length!==1) || ( this.campobjData.editorType=="H" && this.$("textarea#handcodedhtml").val()!="")) && target_li.attr("id")=="html_editor_mee" ){
                      this.showChangeEditorDialog("Your current built Template will be lost, as it is not compatible with <b>Easy Editor</b>. Are you sure you want to continue?",target_li);
                      return true;    
                  }
                  return false;
            },
            step2SlectSource:function(target_li,byPass){ 
                if(!byPass && (this.parent.htmlText || this.states.editor_change) && this.showChangeEditorWarning(target_li)){                        
                    return;
                }
                this.$("#choose_soruce li").removeClass("selected");
                this.$(".soruces").hide();  
                this.$("#area_"+target_li.attr("id")).fadeIn("fast");
                target_li.addClass("selected");
                switch(target_li.attr("id")){
                    case 'use_template':
                        this.loadTemplatesView();                                                                                                
                        break;
                     case 'html_editor':
                        this.setEditor();
                        this.setContents();                                
                     break;
                     case 'copy_campaign':
                           this.getcampaignscopy();                                                      
                     break;
                     case 'html_editor_mee':
                           this.loadMEE();                              
                         break;
                     default:
                     break;
                }                
                var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                var post_editor = {editorType:'',type:"editorType",campNum:this.parent.camp_id};
                var selected_li = target_li.attr("id");
                 if(selected_li=="html_editor"){                        
                    post_editor['editorType'] = 'W';                        
                 }else if(selected_li=="html_code"){                        
                    post_editor['editorType'] = 'H';                        
                 }                 
                 else if(selected_li=="html_editor_mee"){                        
                     post_editor['editorType'] = 'MEE';
                 }                 
                 if(post_editor["editorType"] && this.campobjData.editorType!=post_editor["editorType"]){
                    this.campobjData.editorType = post_editor["editorType"];
                    $.post(URL,post_editor)
                     .done(function(data) {
                     });
                 }
                 if( post_editor['editorType']){
                     this.campobjData.editorType = post_editor['editorType'];
                }

            },
            loadMEE:function(){
                if(!this.meeEditor){
                     this.app.showLoading("Loading Easy Editor...",this.$("#area_html_editor_mee"));                         
                     this.meeEditor = true;               
                     setTimeout(_.bind(this.setMEEView,this),100);                        
                }
            },
            setMEEView:function(){
                    var _html = this.campobjData.editorType=="MEE"?$('<div/>').html(this.parent.htmlText).text().replace(/&line;/g,""):""; 
                     require(["editor/MEE"],_.bind(function(MEE){                                              
                        var MEEPage = new MEE({app:this.app,_el:this.$("#mee_editor"),html:'',text:this.parent.plainText,saveBtnText:'Save Message Body',saveClick:_.bind(this.saveForStep2,this) ,fromDialog:true,reattachEvents:_.bind(this.ReattachEvents,this),textVersionCallBack:_.bind(this.setTextVersion,this)});                                    
                        this.$("#mee_editor").setChange(this.states);                
                        this.setMEE(_html);
                        this.initScroll();
                        this.app.showLoading(false,this.$("#area_html_editor_mee")); 
                    },this));  
            },
            setTextVersion:function(text){
                this.parent.plainText = text;
            },
            setMEE:function(html){
               if(this.$("#mee_editor").setMEEHTML){
                    this.$("#mee_editor").setMEEHTML(html);                        
               } 
               else{
                   setTimeout(_.bind(this.setMEE,this,html),200);
               }
            },
            setContents:function(){
              if(_tinyMCE.get('bmseditor_'+this.wp_id)){
                _tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(this.parent.htmlText,true));   
              }
              else{
                  setTimeout(_.bind(this.setContents,this),200);
              }
            },
            loadTemplatesView:function(){
                if(!this.templates){
                    this.app.showLoading("Loading Templates...",this.$('#area_use_template'));  
                    var _this = this;
                    require(["bmstemplates/templates"],function(templatesPage){                                                     
                        var page = new templatesPage({page:_this,app:_this.app,selectCallback:_.bind(_this.selectTemplate,_this),scrollElement:_this.scrollElement});               
                        _this.$('#area_use_template').html(page.$el);                            
                        page.init();
                    })

                    this.templates = true;
                }
            },
            selectTemplate:function(obj){
                if(this.editable===false){
                     this.app.showAlert('Message is not editable',this.$el); 
                     return false;
                }
                this.setEditor();
                var target = $.getObj(obj,"a");
                var bms_token =this.app.get('bms_token');
                this.app.showLoading('Loading HTML...',this.$el.parents(".modal"));
                this.states.editor_change = true;
                var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+bms_token+"&type=html&templateNumber="+target.attr("id").split("_")[1];                              
                jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));
                //this.$("#html_editor").click();

            },
            getcampaignscopy:function(){
                // Abdullah 
                if(!this.copyCampaigns){
                this.app.showLoading("Loading Campaigns...",this.$("#area_copy_campaign"));
                require(["campaigns/copy_campaign_listing"],_.bind(function(copyCampaigns){                                     
                    var mPage = new copyCampaigns({app:this.app,sub:this,scrollElement:this.scrollElement,checksum:this.camp_obj['campNum.checksum'],editable:this.editable});
                    this.$("#area_copy_campaign").html(mPage.$el);
                },this));
                this.copyCampaigns = true;
                }
            },
            setEditor:function(){
              if(_tinyMCE && _tinyMCE.get('bmseditor_'+this.wp_id))  {
                this.bmseditor.showEditor(this.wp_id);                                       
                _tinyMCE.get('bmseditor_'+this.wp_id).setContent("");
                this.$("#bmstexteditor").val(this.app.decodeHTML(this.parent.plainText,true));
                this.$(".textdiv").hide();
              }
              else{
                  setTimeout(_.bind(this.setEditor,this),200);
              }
            },
            setEditorHTML:function(tsv, state, xhr){
                this.app.showLoading(false,this.$el.parents(".modal"));
                var html_json = jQuery.parseJSON(xhr.responseText);
                var post_editor = {editorType:'',type:"editorType",campNum:this.parent.camp_id};
                if(html_json.htmlText){                   
                    this.parent.htmlText = html_json.htmlText;
                    if(html_json.isEasyEditorCompatible=="Y"){                        
                        post_editor['editorType'] = 'MEE';
                        this.$("#html_editor_mee").click();
                        this.setMEE($('<div/>').html(html_json.htmlText).text().replace(/&line;/g,""));
                        this.states.editor_change = true;                           
                    }
                    else{
                        post_editor['editorType'] = 'W';                       
                        this.$("#html_editor").click();
                        _tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(html_json.htmlText,true));                            
                    }         
                    
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');                                        
                    this.campobjData.editorType = post_editor["editorType"];
                    $.post(URL,post_editor)
                     .done(function(data) {
                     });
                    
                }
                /*if(html_json.htmlText){
                    _tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(html_json.htmlText,true));
                }*/
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
                                 tagRegen:true,
                                 bodyCss:{"min-height":dialog_height+"px"}                                                                          
                      });
                      //// var _options = {_select:true,_dialog:dialog,_page:this}; // options pass to
                  this.app.showLoading("Loading...",dialog.getBody());
                  require(["userimages/userimages",'app'],function(pageTemplate,app){                                     
                      var mPage = new pageTemplate({app:app,fromDialog:true,_select_dialog:dialog,_select_page:that});
                      dialog.getBody().append(mPage.$el);   
                      that.app.showLoading(false, mPage.$el.parent());
                      var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                      mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                      that.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                      that.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog
                  });

             },
                useImage:function(url){
                    this.$el.find("#image_url").val(url);
                },
             editorChange:function(){
                 this.states.editor_change = true;
             },
             openEditor:function(){
                 this.$("#html_editor").click()
             },
             ReattachEvents: function(){
                this.$el.parents('.modal').find('.c-current-status').remove();
                this.$el.parents('.modal').find('#dialog-title .cstatus').remove();
                this.$el.parents('.modal').find('#dialog-title i').hide();
                this.$el.parents('.modal').find("#dialog-title i").hide();
                this.$el.parents('.modal').find("#dialog-title .preview").remove();
                var previewIconMessage = $('<a class="icon preview showtooltip" title="Preview Message"></a>').tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$el.parents('.modal').find(".modal-header .edited  h2").append(previewIconMessage);
                previewIconMessage.click(_.bind(this.parent.previewCampaign,this.parent));
                this.$el.parents('.modal').find('#dialog-title span').append('<strong style="float:right; margin-left:5px" class="cstatus pclr18"> Message <b>'+this.parent.triggerOrder+'</b> </strong>');
                if(this.parent.type == "autobots"){
                       this.$el.parents('.modal').find('.modal-header .cstatus').remove();                          
                       this.$el.parents('.modal').find('#dialog-title .cstatus').remove();
                 } 

             }            
            
        });
});