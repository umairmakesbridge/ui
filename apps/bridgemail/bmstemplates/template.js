define(['text!bmstemplates/html/template.html','jquery.icheck','bms-tags','bms-addbox','bms-dragfile'],
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
               'change #file_control':'uploadImage'
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
               this.modal = this.$el.parents(".modal");
               this.tagDiv = this.modal.find(".tagscont");
               this.head_action_bar = this.modal.find(".modal-header .pointy");
               this.head_action_bar.find(".copy").hide();
               this.tagDiv.addClass("template-tag");
               this.loadTemplate();
               this.iThumbnail = this.$(".droppanel");
               this.$("textarea").css("height",(this.$("#area_create_template").height()-180)+"px");
               this.$(".droppanel").dragfile({
                        post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+this.app.get('bms_token')+'&type=add&allowOverwrite=Y',
                        callBack : _.bind(this.processUpload,this),
                        app:this.app
                    });
               
               this.$(".add-cat").addbox({app:this.app,
                                          addCallBack:_.bind(this.addCategory,this),
                                          placeholder_text:'Please enter category'
                                        });
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
                        _this.modal.find(".dialog-title").html(template_json.name);
                        _this.$("textarea").html(_this.app.decodeHTML(template_json.htmlText,true));
                        
                        if(template_json.isFeatured=='Y'){
                            _this.$(".featured").iCheck('check');
                        }
                        if(template_json.isReturnPath=='Y'){
                            _this.$(".return-path").iCheck('check');
                        }
                        if(template_json.isMobile=='Y'){
                            _this.$(".mobile-comp").iCheck('check');
                        }
                        if(template_json.categoryID){
                            _this.$(".iconpointy").before($('<a class="cat">'+template_json.categoryID+'</a>'))
                        }
                        if(template_json['imageId.encode']){
                            _this.imageCheckSum = template_json['imageId.encode'];
                            _this.app.showLoading("Fetching...",_this.iThumbnail);
                            URL = '/pms/io/publish/getImagesData/?BMS_REQ_TK='+_this.app.get('bms_token')+'&type=get&imageId='+template_json['imageId.encode'];
                            jQuery.getJSON(URL,function(tsv, state, xhr){
                                _this.app.showLoading(false,_this.iThumbnail);
                                var _json = jQuery.parseJSON(xhr.responseText);                                                                
                                _this.iThumbnail.find("h4").hide();
                                _this.iThumbnail.find("img").attr("src",_this.app.decodeHTML(_json.thumbURL)).show();
                            });
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
                            templateHtml:_this.$("textarea").val()})
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
            }
        });
});