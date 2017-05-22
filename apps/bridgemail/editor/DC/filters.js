define(['text!editor/DC/html/filters.html','bms-filters'],
    function (template, bmsfilters) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Filter view for MEE Dynamic contents variation
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click .closebtn':'closeDialog',
                'click .ruleDialogClose':'closeDialog',                
                'click .ruleDialogSave':'saveFilters'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                this.template = _.template(template);	                    
                this.app = this.options.opt._app;                                              
                this.args = this.options.args;                                              
                
                this.render();       
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({                    
                    }));    
                //this.row = _.template(this.$('#fitlerrow_template').html());                
                var dcRules = this.args.DynamicContent.ListOfDynamicRules;
                
                this.$("#mee__dc__filters").filters({app: this.app, DCFilter:true,DCObject:this.args.DynamicContent});
                this.meeDCFilters = this.$("#mee__dc__filters").data("filters");
                               
                if(dcRules.length==0){
                    setTimeout(_.bind(function(){this.meeDCFilters.addBasicFilter()},this),100);
                }
                else{
                    setTimeout(_.bind(function(){this.meeDCFilters.loadDCFilters(this.args.DynamicContent)},this),100);
                }
                
                this.$(".showtooltip").tooltip({
                    'placement':'bottom',
                    delay: {
                        show: 0, 
                        hide:0
                    },
                    animation:false
                });
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            closeDialog:function(){
                this.$el.parent().hide();
                this.$el.remove();
            }, 
            showTooltips:function(filter){
                filter.find(".showtooltip").tooltip({
                    'placement':'bottom',
                    delay: {
                        show: 0, 
                        hide:0
                    },
                    animation:false
                })      
            },
            saveFilters:function(){
                var URL = "";
                if(this.args.isTemplate){
                    URL = "/pms/io/publish/saveDynamicVariation/?BMS_REQ_TK="+this.app.get('bms_token')+"&isSingle=Y";                            
                }else{
                    URL = "/pms/io/publish/saveDynamicVariation/?BMS_REQ_TK="+this.app.get('bms_token')+"&campaignNumber="+this.args.camp_id;                            
                }
                                                                      
               var post_data = this.meeDCFilters.saveFilters();        
               if(post_data["count"]){
                post_data["ruleCount"] = post_data["count"];
                delete  post_data["count"];
               }
               var filterTypeMap = {"P":"profile","E":"emailActivity","L":"list","F":"formSubmission","W":"webActivity","T":"tag","S":"score"};
               for(var i=0;i<post_data["ruleCount"];i++){
                   post_data[(i+1)+".filterType"] = filterTypeMap[post_data[(i+1)+".filterType"]];
               }
               
               post_data["type"] = "updateContentRules";
               post_data["dynamicNumber"] = this.args.DynamicContent.DynamicVariationID; 
               post_data["contentNumber"] = this.args.DynamicContent.DynamicContentID;
               
               if(post_data){
                this.$(".ruleDialogSave").addClass("saving");
                $.post(URL,post_data)
                .done(_.bind(function(data){
                    this.$(".ruleDialogSave").removeClass("saving");
                    var result = jQuery.parseJSON(data);
                    if(result[0]=="success"){
                        this.app.showMessge(result[1],$("body"));
                        this.closeDialog();
                    }
                    else{
                        this.app.showAlert(result[1],$("body"));
                    }
                },this));
              }  
            }

        });
    });