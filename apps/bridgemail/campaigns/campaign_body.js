define(['text!campaigns/html/campaign_body.html','editor/editor'],
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
               'click #choose_soruce li':'step2TileClick'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page
                    this.app = this.parent.app;   
                    this.templates = false;
                    this.editor_change = false;
                    this.copyCampaigns = false;
                    this.plainText = "";
                    this.htmlText = "";
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
            },
            init:function(){
              this.$("#editorhtml").append(this.bmseditor.$el);
              this.bmseditor.initEditor({id:this.wp_id});  
              
              var _height = $(window).height()-431;
              var _width = this.parent.$el.width()-48;
              this.$(".html-text,.editor-text").css({"height":_height+"px","width":_width+"px"});
              this.$("#htmlarea").css({"height":_height+"px","width":(_width-2)+"px"});
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
                        tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(this.htmlText,true));                                 
                     break;
                     case 'copy_campaign':
                           this.getcampaignscopy();
                          // this.getallcampaigns();                                 
                     break;
                     default:
                     break;
                }

            },
            loadTemplatesView:function(){
                if(!this.templates){
                    this.app.showLoading("Loading Templates...",this.$('#area_use_template'));  
                    var _this = this;
                    require(["bmstemplates/templates"],function(templatesPage){                                                     
                        var page = new templatesPage({page:_this,app:_this.app,selectCallback:_.bind(_this.selectTemplate,_this)});               
                        _this.$('#area_use_template').html(page.$el);                            
                        page.init();
                    })

                    this.templates = true;
                }
            },
            selectTemplate:function(obj){
                this.setEditor();
                var target = $.getObj(obj,"a");
                var bms_token =this.app.get('bms_token');
                this.app.showLoading('Loading HTML...',this.$el);
                this.editor_change = true;
                var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+bms_token+"&type=html&templateNumber="+target.attr("id").split("_")[1];                              
                jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));
                this.$("#html_editor").click();

            },
            getcampaignscopy:function(){
                // Abdullah 
                if(!this.copyCampaigns){
                this.app.showLoading("Loading Campaigns...",this.$("#area_copy_campaign"));
                require(["campaigns/copy_campaign_listing"],_.bind(function(copyCampaigns){                                     
                    var mPage = new copyCampaigns({app:this.app,sub:this,checksum:this.checksum});
                    this.$("#area_copy_campaign").html(mPage.$el);
                },this));
                this.copyCampaigns = true;
                }
            },
            setEditor:function(){
              this.bmseditor.showEditor(this.wp_id);                                       
              tinyMCE.get('bmseditor_'+this.wp_id).setContent("");
              this.$("#bmstexteditor").val(this.plainText);
              this.$(".textdiv").hide();
            },
            setEditorHTML:function(tsv, state, xhr){
                this.app.showLoading(false,this.$el);
                var html_json = jQuery.parseJSON(xhr.responseText);
                if(html_json.htmlText){
                    tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(html_json.htmlText,true));
                }

            }
            
        });
});