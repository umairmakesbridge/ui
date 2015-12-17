define(['text!crm/netsuite/html/addresult.html', 'campaigns/collections/netsuite_campaigns'],
function (template, nsCampaignCollections) {
        'use strict';
        return Backbone.View.extend({                                                              
                events: {
                    'click .campaign-remove':'removeResultFromNS'
                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.render();
                },

                render: function () {
                    this.parent =this.options.parent;
                    this.app = this.parent.app;            
                    this.dialog = this.options.dialog;
                    this.$el.html(this.template({}));      	
                    this.$(".ns_campaigns_combo").chosen({no_results_text:'Oops, nothing found!', width: "280px",disable_search: "true"}); 
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    this.showNetsuiteCampaigns();
                },
                showNetsuiteCampaigns:function(){
                    this.$(".ns_campaigns_combo").html("<option>Loading...</option>").prop("disabled",true).trigger("chosen:updated");  
                    //require(["campaigns/collections/netsuite_campaigns"],_.bind(function(nsCampaignCollections){                                     
                        var nsCampaigns =  new nsCampaignCollections();  
                        var model = null;
                        var _offset = 0;                                              
                        nsCampaigns.fetch({data:{type:'nsCampaignList',offset:_offset},remove:true,
                            success: _.bind(function (collection, response) {     
                                var camps_html = '<select data-placeholder="Choose a Netsuite Campaign..." class="chosen-select ns_campaigns_combo" >';
                                camps_html += '<option value=""></option>';                                
                                for(var s=_offset;s<collection.length;s++){
                                    model = collection.at(s);
                                    var selected =  (this.parent.netsuiteCampaignId && this.parent.netsuiteCampaignId===model.get("id"))?'selected="selected"':"";
                                    if(selected){
                                        this.$(".campaign-remove").show();
                                    }
                                    camps_html += '<option value="'+model.get("id")+'" '+selected+'>'+model.get("title")+'</option>';
                                } 
                                camps_html += "</select>";
                                this.$(".netsuite-camapigns").html(camps_html);
                                this.$(".ns_campaigns_combo").chosen({no_results_text:'Oops, nothing found!',width: "280px"});                                

                            }, this),
                            error: function (collection, resp) {

                            }
                        });
                        
                        
                   //},this));
                },
                saveResultsTo:function(dialog){   
                    if(this.validateRNS()){        
                        var URL = "/pms/io/netsuite/setData/?BMS_REQ_TK="+this.app.get('bms_token');                     
                        this.app.showLoading("Saving...",dialog.$el);
                        $.post(URL, { campNum: this.parent.track_id,nsCampaignID: this.$(".ns_campaigns_combo").val() , add:'Y',type:"addToNetsuite","campaignType":"T"})
                        .done(_.bind(function(data) {                            
                            this.app.showLoading(false,dialog.$el);
                            this.parent.netsuiteCampaignId = this.$(".ns_campaigns_combo").val();
                            this.parent.$(".add-to-netsuite span").html("Update results to Netsuite")
                            dialog.hide();
                            this.app.showMessge("Nurture track results added to Netsuite successfully!");
                        },this));    
                    }
                },
                removeResultFromNS:function(){                       
                    this.$(".ns_campaigns_combo").prop("disabled",true).trigger("chosen:updated"); 
                    var URL = "/pms/io/netsuite/setData/?BMS_REQ_TK="+this.app.get('bms_token');                                       
                    $.post(URL, { campNum:  this.parent.track_id,add:'N',type:"addToNetsuite","campaignType":"T"})
                    .done(_.bind(function(data) {                                                  
                        this.$(".campaign-remove").hide();
                        this.$(".ns_campaigns_combo").prop("disabled",false).val("").trigger("chosen:updated"); 
                        this.parent.$(".add-to-netsuite span").html("Add results to Netsuite");
                        this.parent.netsuiteCampaignId = "";
                        this.app.showMessge("Nurture track results removed from Netsuite campaign successfully!");
                        this.dialog.$(".dialog-title").html("Add Results to Netsuite Campaign");
                    },this));    
                    
                    this.app.hideError({control:this.$(".ns-camp-container")});
                },
                validateRNS:function(){
                    var isValid = true;                    
                    if(this.$(".ns_campaigns_combo").val()==""){
                        isValid = false;                        
                        this.app.showError({
                            control:this.$(".ns-camp-container"),
                            message:'Please select Netsuite campaign.'
                        });
                    }
                    else{
                        this.app.hideError({control:this.$("#ns-camp-container")});
                    }
                    return isValid;
                }
                
        });
});