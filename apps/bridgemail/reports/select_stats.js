define(['text!reports/html/select_stats.html', 'jquery.icheck'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className: 'report-selection',
                events: {
                    'click .left_columnLinkReports li':'_changeTab'
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.webstatCheck = true;
                    this.selectedTypes = [];
                    this.parent = this.options.page;
                    this.app = this.parent.app;
                    this.dialog = this.options.dialog;
                    this.websiteCall = false;
                    this.onlineCampaignsCall = false;
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.$el.css({"margin": "-10px", "width":"480px"});                    
                },
                init: function () {
                    this.$('input.general-stats-panel').iCheck({
                        
                        checkboxClass: 'icheckbox_square-green'
                     });
                     this.$('input.topstate-panel').iCheck({                        
                        radioClass: 'iradio_square-green'
                     });                                         
                     
                     this.$(".select-span").chosen({ width: "180px", disable_search: "true"}).change(_.bind(function () {
                         this.onlineCampaignsCall = false;
                        this.getOnlineCampaigns();
                    }, this));
                    
                    this.$(".select-span-website").chosen({ width: "180px", disable_search: "true"}).change(_.bind(function () {
                        this.websiteCall = false;
                        this.getWebSiteClick();
                    }, this));
                    
                    this.$el.parent().css("overflow","hidden");

                },
                saveCall: function () {
                    var objectArray = [];
                    var selectedStates = "";
                    var campMapping =  {};
                    var selected_tab = this.$(".left_columnLinkReports .selected").attr("id");
                    if(selected_tab=="top-charts"){
                        selectedStates = this.$("input[name='top_stats']:checked").val();
                    }
                    else if(selected_tab=="general-stats"){
                        this.parent.fromClick = false;
                        selectedStates = $.map( this.$("input[name='option_stats']:checked"), function( val, i ) {
                            return val.value;
                       }).join();
                    }else if(selected_tab=="online-campaigns"){
                        selectedStates = $.map( this.$("input[name='online_stats']:checked"), function( val, i ) {
                            campMapping[val.value] = $(val).parents("li").find("span").text();
                            return val.value;
                       }).join();
                    }else if(selected_tab=="website-clicks"){
                        selectedStates = $.map( this.$("input[name='website_stats']:checked"), function( val, i ) {
                            return val.value;
                       }).join();
                    }
                    if (selectedStates) {
                        objectArray.push(selectedStates);
                        this.selectedTypes.push({id:selectedStates,subtype:selected_tab,campMapping:campMapping});
                        this.parent.modelArray = this.selectedTypes;
                        this.parent.objects = objectArray;
                        this.dialog.hide();
                        this.parent.createWebstats();
                    }
                    else {
                        this.app.showAlert("Please select source.", this.$el);
                    }
                },
                _changeTab:function(e){
                    var obj = $.getObj(e,"li");
                    if(obj.hasClass("selected")==false){
                         this.showSelectedTab(obj);               
                    }
                },
                showSelectedTab:function(obj){
                  this.$(".left_columnLinkReports li.selected").removeClass("selected");
                  obj.addClass("selected");
                  this.$(".tcontent").hide();
                  this.activeTab = obj.attr("id");
                  this.$("div."+obj.attr("id")).show();     
                  if(obj.attr("id")=="online-campaigns"){
                      this.getOnlineCampaigns();
                  }
                  else if(obj.attr("id")=="website-clicks"){
                    this.getWebSiteClick();
                  }
                },
                getOnlineCampaigns:function(){
                    if(this.onlineCampaignsCall){return false}
                    var bms_token = this.app.get('bms_token');                    
                    var URL = "/pms/io/user/getWebStats/?BMS_REQ_TK=" + bms_token + "&type=unique_adcam&span="+this.$(".select-span").val() ;
                        this.$(".online-campaigns-ul").children().remove();
                        this.app.showLoading("Loading Data...", this.$(".online-campaigns-ul"));                        
                        jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                            this.app.showLoading(false, this.$(".online-campaigns-ul"));
                            var campaigns = jQuery.parseJSON(xhr.responseText);
                            if (this.app.checkError(this.webStatData)) {
                                return false;
                            }                            
                            var li_camp = "";
                            this.onlineCampaignsCall = true;
                            _.each(campaigns, function(val,key){
                                li_camp = $('<li><input type="checkbox" class="online-stats-panel"  value="'+val[0]+'" name="online_stats"><span>'+val[1]+'</span></li>');
                                this.$(".online-campaigns-ul").append(li_camp);
                            },this)
                            if(campaigns.length==0){
                                this.$(".online-campaigns-ul").append('<p class="notfound" style="margin:100px 0 0 -20px;width:350px">No Data Found</p>');
                            }
                            else{
                                this.$('input.online-stats-panel').iCheck({
                                    checkboxClass: 'icheckbox_square-green'
                                });  
                            }
                                               
                            
                        },this));
                },
                getWebSiteClick:function(){
                    if(this.websiteCall){return false}
                    var bms_token = this.app.get('bms_token');
                    var URL = "/pms/io/user/getWebStats/?BMS_REQ_TK=" + bms_token + "&type=linkdetail&span="+this.$(".select-span-website").val() ;
                        this.$(".website-clicks-ul").children().remove();
                        this.app.showLoading("Loading Data...", this.$(".website-clicks-ul"));                        
                        jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                            this.app.showLoading(false, this.$(".website-clicks-ul"));
                            var campaigns = jQuery.parseJSON(xhr.responseText);
                            if (this.app.checkError(this.webStatData)) {
                                return false;
                            }                            
                            var li_camp = "";
                            this.websiteCall = true;
                            _.each(campaigns, function(val,key){
                                li_camp = $('<li><input type="checkbox" class="website-panel"  value="'+val[0]+'" name="website_stats"><span>'+val[1]+'</span></li>');
                                this.$(".website-clicks-ul").append(li_camp);
                            },this)
                            if(campaigns.length==0){
                                this.$(".website-clicks-ul").append('<p class="notfound" style="margin:100px 0 0 -20px;width:350px">No Data Found</p>');
                            }
                            else{
                                this.$('input.website-panel').iCheck({
                                    checkboxClass: 'icheckbox_square-green'
                                });  
                            }
                            
                        },this));
                }
            });
        });
