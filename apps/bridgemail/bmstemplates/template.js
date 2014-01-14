define(['text!bmstemplates/html/template.html','jquery.icheck','bms-tags'],
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
               this.template_id = this.options.template.template_id;
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
               this.tagDiv.addClass("template-tag");
               this.loadTemplate();
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
                        var cat = template_json.categoryID.split(",");
                        _.each(cat,function(val){
                            _this.$(".iconpointy").before($('<a class="cat">'+val+'</a>'))
                        })
                        
                        _this.tagDiv.tags({app:_this.app,
                            url:'/pms/io/campaign/saveCampaignData/?BMS_REQ_TK='+_this.app.get('bms_token'),
                            params:{type:'tags',templateNumber:_this.template_id,tags:''}
                            ,showAddButton:true,                            
                            tags:template_json.tags
                         });
                   }
                 }).fail(function() { console.log( "error in loading template" ); }); 
            }
        });
});