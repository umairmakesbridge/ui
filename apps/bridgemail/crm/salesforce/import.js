define(['text!crm/salesforce/html/import.html','jquery-ui','jquery.icheck','jquery.bmsgrid','jquery.searchcontrol'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'salesforce_campaigns',
                events: {

                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.render();
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.$el.html(this.template({}));      	
                                       
                    this.initControl();                                                              
                },
                initControl:function(){
                    var salesforce_setting = this.app.getAppData("salesfocre");
                   
                    this.$("#sf_accordion").accordion({ active: 0, collapsible: false});                       
                    if(salesforce_setting && salesforce_setting.isSalesforceUser=="Y"){                        
                         this.showSalesForceCampaigns();
                    }
                    this.$("#sf_accordion h3.ui-accordion-header").unbind("keydown");
                    this.$(".filterbtn .managefilter").click(_.bind(this.showSalesForceFitler,this));
                    this.$(".filterbtn .selectall").click(_.bind(this.selectAllSalesforceFilter,this));
                    
                    this.$('input.radiopanel').iCheck({
                        radioClass: 'radiopanelinput',
                        insert: '<div class="icheck_radio-icon"></div>'
                     });
                     var self=this;
                     this.$('input.radiopanel').on('ifChecked', function(event){                                                          
                             self.$(".ui-accordion-header.selected").removeClass("selected");
                             $(this).parents(".ui-accordion-header").addClass("selected");
                             var icheck_val = $(this).attr("value");
                             if(icheck_val!=="campaign"){
                                 self.$("#sfcamp_list_grid tr.selected").removeClass("selected");    
                             }                   
                             if($(this).parents(".ui-accordion-header").find(".filterbtn a:first-child").hasClass("active")==false){
                                $(this).parents(".ui-accordion-header").find(".filterbtn a").removeClass("active");
                                $(this).parents(".ui-accordion-header").find(".filterbtn a:first-child").addClass("active");
                             }
                         });
                         
                        this.$("input[name='options_sf']").eq(0).iCheck('check');                   
                                                     
                        self.$(".sf_all_count,.sf_lead_count,.sf_contact_count").addClass("loading-wheel-inline").html('');
                        var URL = '/pms/io/salesforce/getData/?BMS_REQ_TK='+self.app.get('bms_token')+'&type=allCount';
                        jQuery.getJSON(URL,  function(tsv, state, xhr){
                            var total_count = jQuery.parseJSON(xhr.responseText);
                            var total = parseFloat(total_count.contactCount) + parseFloat(total_count.leadCount);
                            self.$(".sf_all_count").html(total).removeClass("loading-wheel-inline");
                            self.$(".sf_contact_count").html(total_count.contactCount).removeClass("loading-wheel-inline");
                            self.$(".sf_lead_count").html(total_count.leadCount).removeClass("loading-wheel-inline");
                        })                                                        
                        
                        this.$("#salesforce-camp-search").searchcontrol({
                            id:'salesforce-camp-search',
                            width:'300px',
                            height:'22px',
                            placeholder: 'Search salesforce campaign',
                            gridcontainer: 'sfcamp_list_grid',
                            showicon: 'yes',
                            iconsource: 'campaigns'
                        });                                                
                                      
                },
               selectAllSalesforceFilter:function(obj){
                   var button = $.getObj(obj,"a");
                   button.next().removeClass("active");
                   button.addClass("active");
                   var input_radio = button.parents(".ui-accordion-header").find("input.radiopanel");                   
                   input_radio.iCheck('check');
               },
               showSalesForceFitler:function(obj){
                     var button = $.getObj(obj,"a");
                     button.prev().removeClass("active");
                     button.addClass("active");
                     var dialog_title= "Lead";
                     var input_radio = button.parents(".ui-accordion-header").find("input.radiopanel");
                     var filter_type = input_radio.val();
                     input_radio.iCheck('check');
                     if(filter_type=="contact"){
                         dialog_title= "Contant";
                     }
                     else if(filter_type=="both"){
                         dialog_title= "Lead & Contact";
                     }
                     var self = this;
                     var dialog_width = $(document.documentElement).width()-60;
                     var dialog_height = $(document.documentElement).height()-219; 
                     var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              bodyCss:{"min-height":dialog_height+"px"},							   
                              buttons: {saveBtn:{text:'Save Filter'} }                                                                           
                    });                    
                    
                    this.app.showLoading("Loading Filters...",dialog.getBody());
                    require(["crm/salesforce/after_filter"],function(afterFilter){                                                
                        var recipient_obj = null;
                        var afilter = new afterFilter({camp:self,savedObject:recipient_obj,type:filter_type});
                        afilter.$el.css("margin","10px 0px");
                        dialog.getBody().html(afilter.$el);
                        //dialog.saveCallBack(_.bind(afilter.saveFilter,afilter,dialog,_.bind(self.saveFilterStep3,self)));
                    }); 
               },
               showSalesForceCampaigns:function(){
                    var camp_obj =this;				
                    camp_obj.$el.find('.template-container').parent().css("height","308px");
                    camp_obj.app.showLoading("Loading Salesforce Campaigns...",camp_obj.$el.find('.template-container'));
                    var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=sfCampaignList"; 
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            camp_obj.app.showLoading(false,camp_obj.$el.find('.template-container'));                            
                             var s_camps_json = jQuery.parseJSON(xhr.responseText);
                             if(camp_obj.app.checkError(s_camps_json)){
                                return false;
                             }                             
                             var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="sfcamp_list_grid"><tbody>';
                             $.each(s_camps_json.campList[0], function(index, val) {     
                                //var _selected = (camp_obj.states.step1.sfCampaignID==val[0].sfCampaignID)?"selected=selected":"";                              
                                list_html += '<tr id="row_'+val[0].sfCampaignID+'">';                        
                                list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3> </td>';                  
                                var total_count = parseFloat(val[0].contactCount)+parseFloat(val[0].leadCount);
                                list_html += '<td><div><div class="subscribers show"><strong class="badge">'+total_count+'</strong></div><div id="'+val[0].sfCampaignID+'" class="action"><a class="btn-green select"><span>Use</span><i class="icon next"></div></div></td>';                        
                                list_html += '</tr>';
                            });
                            list_html += '</tbody></table>';                            
                                                        
                            //Setting salesforce campaigns listing grid
                            camp_obj.$("#salesforce-camp-listing").html(list_html);                               
                            camp_obj.$el.find("#sfcamp_list_grid").bmsgrid({
                                    useRp : false,
                                    resizable:false,
                                    colresize:false,
                                    height:300,
                                    usepager : false,
                                    colWidth : ['100%','90px']
                            });
                            camp_obj.$("#sfcamp_list_grid tr td:nth-child(1)").attr("width","100%");
                            camp_obj.$("#sfcamp_list_grid tr td:nth-child(2)").attr("width","90px");
                            
                            camp_obj.$("#sfcamp_list_grid .action .select").click(function(){
                                camp_obj.$("input[name='options_sf']").eq(3).iCheck('check');                            
                                camp_obj.$("#sfcamp_list_grid tr.selected").removeClass("selected");    
                                $(this).parents("tr").addClass("selected");
                            });
                                                        
                					                            
                        }
                    }).fail(function() { console.log( "error fetch sales force campaign" ); });  
                }
        });
});