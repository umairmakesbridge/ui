define(['text!editor/html/buildingblock.html','bms-dragfile'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Building Block Dialog view for MEE
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'add-block',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click .block-image':'loadImageGallery',
                'keypress #block_name':function(e){
                     if(e.keyCode==13){
                         this.saveBlockCall();
                     }
                }
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {                                        
                    this.template = _.template(template);	                    
                    this.dialog = this.options.dialog;
                    this.editor = this.options.editor;
                    this.config = this.options.config;
                    this.app =  this.config._app;
                    this.imageId = null;
                    this._args = this.options.args
                    this.render();                             
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({                    
                }));       
                
                this.$el.dragfile({
                    post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+this.app.get('bms_token')+'&type=add&allowOverwrite=N&th_width=50&th_height=50',
                    callBack : _.bind(this.showSelectedImage,this),
                    app:this.app,
                    module:'template',
                    progressElement:this.$('.nurtureimg')
                });
            },
            init:function() {
                if(this.editor._LastSelectedBuildingBlock){
                    this.$("#block_name").val(this.app.decodeHTML(this.editor._LastSelectedBuildingBlock["name"]));
                }
                this.$("#block_name").focus();
            }
            ,
            /**
             * Render Row view on page.
            */
            saveBlockCall:function(){
                var btnObj= this.dialog.$(".btn-save");
                if(btnObj.hasClass("saveing-blue")==false){                    
                    var blockName = this.$("#block_name").val();
                    if($.trim(blockName)!==""){
                        btnObj.addClass("saveing-blue");
                        this.$("#block_name").prop("disabled",true);
                        this.app.hideError({control:this.$('.blockname-container')});
                        var buildingBlock = new Object();
                        buildingBlock.Name = blockName;
                        if(!this.editor._LastSelectedBuildingBlock){
                            this._args.oInitDestroyEvents.DestroyPluginsEvents(this._args.args.ui.draggable);
                            buildingBlock.Html = this._args.args.ui.draggable.clone();
                            this._args.oInitDestroyEvents.InitializePluginsEvents(this._args.args.ui.draggable);                            
                        }
                        else{
                            buildingBlock.Id = this.editor._LastSelectedBuildingBlock["blockId.encode"];                        
                            this._args.args = {};                            
                        }                        
                        this._args.args.buildingBlock = buildingBlock;       
                        this.saveBlock(this._args.args);
                        //this.config.OnDropElementOnBuildingBlock(this._args.args,_.bind(this.saveBlock,this));
                    }
                    else{
                        this.app.showError({
                            control:this.$('.blockname-container'),
                            message:'Block name cann\'t be empty'
                         });
                    }
                }
            },
            saveBlock:function(args){
                var URL = "/pms/io/publish/saveEditorData/?BMS_REQ_TK="+this.app.get('bms_token');                
                var post_data = {
                    name: args.buildingBlock.Name                
                };
                if(this.editor._LastSelectedBuildingBlock){
                    post_data['type']="renameBlock";
                    post_data['blockId']=args.buildingBlock.Id;                    
                }
                else{
                    post_data['type']="addBlock";
                    post_data['html']=args.buildingBlock.Html.html();                    
                }
                if(this.app.get("user").userId==='admin'){
                    post_data['isAdmin']='Y';
                }
                $.post(URL,post_data)
                .done(_.bind(function(data){
                    var result = jQuery.parseJSON(data);
                        if(result[0]=="success"){
                            this.app.showMessge("Block has been successfully created.",$("body"));
                             if(this.config.fromDialog){
                                  this.dialog.showPrevious();      
                             }
                             else{
                                 this.dialog.hide();      
                             }
                      
                            this.editor._LoadBuildingBlocks(this._args.args);
                        }
                        else{
                            var btnObj= this.dialog.$(".btn-save");
                            btnObj.removeClass("saveing-blue");
                            this.$("#block_name").prop("disabled",false);
                            this.app.showAlert(result[1],$("body"));
                        }
                },this));
                  
            },
            loadImageGallery:function(obj){
                this.image_obj = $.getObj(obj,"a");
                var app = this.app;
                this.$el.parents('body').find('#merge-field-plug-wrap').hide();
                var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-162;
                    var dialog = this.app.showDialog({title:'Images',
                                css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                                headerEditable:true,
                                headerIcon : '_graphics',
                                tagRegen:true,
                                bodyCss:{"min-height":dialog_height+"px"}                                                                          
                     });                       
                 this.app.showLoading("Loading...",dialog.getBody());
                 require(["userimages/userimages",'app'],_.bind(function(pageTemplate,app){                                     
                     var mPage = new pageTemplate({app:app,fromDialog:true,_select_dialog:dialog,_select_page:this,callBack:_.bind(this.insertImage,this)});
                     var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                     dialog.getBody().append(mPage.$el);
                     this.app.showLoading(false, mPage.$el.parent());
                     mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                     this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                     this.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog

                 },this));
            },
            insertImage : function(data){                                                
                this.$("#image_url").val(data.imgurl);                                    
            },
            ReattachEvents:function(){
                 if(this.dialog.$el.find('.c-current-status').length > 0){
                      this.dialog.$el.find('.c-current-status').remove();
                 }
            },
            showSelectedImage:function(data){
               var _image= jQuery.parseJSON(data);
               if(_image.success){
                   var img_obj = _image.images[0].image1[0];
                   var img_thmbnail = this.app.decodeHTML(img_obj.thumbURL);
                   this.showImage(img_thmbnail)
                   this.imageId = img_obj['imageId.encode'];
               }
           },
           showImage:function(img_thmbnail){
                this.$(".no-image").hide();
                this.$("#message-image").show();
                this.$("#message-image img").attr("src",img_thmbnail);
                
            }
            
        });
});