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
               'click .save-step2': function(obj){
                    var button = $.getObj(obj,"a");
                    if(!button.hasClass("saving")){
                        this.parent.saveStep2(false);
                        button.addClass("saving");
                    }                                                                
                }
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
                    this.states = {}
                    this.states.editor_change = false;
                    this.copyCampaigns = false;
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
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});                
                this.$('#merge_field_plugin-wrap').mergefields({app:this.app,view:this,config:{links:true,state:'workspace'},elementID:'merge-field-editor',placeholder_text:'Merge tags'});
                this.$('#merge_field_plugin-wrap-hand').mergefields({app:this.app,view:this,config:{links:true,state:'workspace'},elementID:'merge-field-hand',placeholder_text:'Merge tags'});
                this.$('#merge_field_plugin-wrap-plain').mergefields({app:this.app,view:this,config:{links:true,state:'workspace'},elementID:'merge-field-plain',placeholder_text:'Merge tags'});
            },
            populateBody:function(){
              if(this.parent.htmlText){
                    this.$("#html_editor").click();
                    this.$("#plain-text").val(this.app.decodeHTML(this.parent.plainText,true));
                }
                else if(this.parent.plainText){
                    this.$("#plain_text").click();
                    this.$("#plain-text").val(this.app.decodeHTML(this.parent.plainText,true));
                }  
            },
            init:function(){
              this.$("#editorhtml").append(this.bmseditor.$el);
              this.bmseditor.initEditor({id:this.wp_id});  
              
              var _height = $(window).height()-431;
              var _width = this.parent.$el.width()-48;
              this.$(".html-text,.editor-text").css({"height":_height+"px","width":_width+"px"});
              this.$("#htmlarea").css({"height":_height+"px","width":(_width-2)+"px"});
              if(!this.parent.htmlText){
                this.openEditor();
              }
            },
            step2TileClick:function(obj){
                var camp_obj = this;
                var target_li =$.getObj(obj,"li"); 
                if(this.$("#choose_soruce li.selected").length==0){
                    this.$(".selection-boxes").animate({width:"700px",margin:'0px auto'}, "medium",function(){
                        $(this).removeClass("create-temp");                                                                                        
                        camp_obj.step2SlectSource(target_li);
                    });
                }
                else{                                                                               
                    this.step2SlectSource(target_li);
                }
            },
            step2SlectSource:function(target_li){                
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
                     default:
                     break;
                }

            },
            setContents:function(){
              if(tinyMCE.get('bmseditor_'+this.wp_id)){
                tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(this.parent.htmlText,true));   
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
                this.app.showLoading('Loading HTML...',this.$el);
                this.states.editor_change = true;
                var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+bms_token+"&type=html&templateNumber="+target.attr("id").split("_")[1];                              
                jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));
                this.$("#html_editor").click();

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
              if(tinyMCE && tinyMCE.get('bmseditor_'+this.wp_id))  {
                this.bmseditor.showEditor(this.wp_id);                                       
                tinyMCE.get('bmseditor_'+this.wp_id).setContent("");
                this.$("#bmstexteditor").val(this.app.decodeHTML(this.parent.plainText,true));
                this.$(".textdiv").hide();
              }
              else{
                  setTimeout(_.bind(this.setEditor,this),200);
              }
            },
            setEditorHTML:function(tsv, state, xhr){
                this.app.showLoading(false,this.$el);
                var html_json = jQuery.parseJSON(xhr.responseText);
                if(html_json.htmlText){
                    tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(html_json.htmlText,true));
                }
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
                          //this.$el.parents('.modal').find("#dialog-title i").removeClass('dlgpreview').addClass('bot').show();
                          this.$el.parents('.modal').find('#dialog-title .cstatus').remove();
                    } 
                    
                }
            
        });
});