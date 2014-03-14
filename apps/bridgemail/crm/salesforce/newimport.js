define(['views/common/wizard','text!crm/salesforce/html/newimport.html','jquery.bmsgrid','jquery.searchcontrol','jquery.highlight','bms-addbox','jquery.chosen'],
function (Wizard,template) {
        'use strict';
        return Backbone.View.extend({                                
                className:'clearfix',
                events: {

                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.improtLoaded = false;
                    this.render();
                },

                render: function () {
                    this.app = this.options.page.app;
                    
                    var wizard_options = {steps:3,active_step:1};
                    this.mk_wizard = new Wizard(wizard_options);  
                    this.$el.append(this.mk_wizard.$el);                                       
                    
                    this.mk_wizard.$(".step-contents").html(this.template({}));
                    this.mk_wizard.page = this;
                    
                    this.mk_wizard.initStep();                    
                    this.initControl();                                                              
                },
                initControl:function(){
                     this.$(".myimports-search").searchcontrol({
                            id:'newimports-search',
                            width:'300px',
                            height:'22px',
                            gridcontainer: 'import-list-grid',
                            placeholder: 'Search lists',                     
                            showicon: 'yes',
                            iconsource: 'list'
                     });
                    this.$(".add-list").addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)}); 
                    if(!this.app.getAppData("lists")){
                        this.app.showLoading("Loading Lists...",this.$(".bms-lists"));                                    
                        this.app.getData({
                            "URL":"/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=all",
                            "key":"lists",
                            "callback":_.bind(this.createListTable,this)
                        });
                    }
                    else{
                        this.createListTable();
                    }
                                        
                                      
                },
                initStepCall:function(stepNo){                    
                    switch (stepNo){                                                            
                        case 'step_2':
                            this.initStep2();
                            break;                                
                        case 'step_3':
                            this.initStep3();
                            break;                       
                        default:
                            break;
                    }
                },
                initStep2:function(){
                    if( this.improtLoaded==false){
                         this.improtLoaded = true; 
                        this.app.showLoading("Loading Import...",this.$(".step2"));
                        require(["crm/salesforce/import"],_.bind(function(page){    
                            var Import_page = new page({
                                page:this
                            })
                            this.app.showLoading(false,this.$(".step2"));
                            this.$(".step2").append(Import_page.$el);                       
                        },this));
                    }
                },
                initStep3:function(){
                    this.$(".step3 .summary-accordion").accordion({ active: 0, collapsible: false});   
                     this.$('.step3 input.radiopanel').iCheck({
                        radioClass: 'radiopanelinput',
                        insert: '<div class="icheck_radio-icon"></div>'
                     });
                    this.$(".step3 .nosearch").chosen({disable_search_threshold: 10});
                },
                stepsCall:function(step){
                    var proceed = -1;
                    $(".messagebox.messagebox_").remove();
                    switch (step){
                        case 'step_1':
                            proceed = this.saveStep1();
                            break;
                    }
                    return proceed;
                },
                saveStep1:function(){
                    var proceed=-1;
                    if(!this.$(".bms-lists tr").hasClass("selected")){
                         this.app.showAlert("Please select a list to import recipients",$("body"),{fixed:true});
                         proceed =0;
                    }
                    return proceed;
                },
                createListTable:function(xhr){                
                    var camp_list_json = this.app.getAppData("lists");
                    this.app.showLoading(false,this.$el);                                                        			
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="import-list-grid"><tbody>';                    
                    $.each(camp_list_json.lists[0], _.bind(function(index, val) {     
                        list_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" checksum="'+val[0]["listNumber.checksum"]+'">';                        
                        list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+ this.app.showTags(val[0].tags) +'</div></div></td>';                        
                        list_html += '<td><div class="subscribers show" style="min-width:70px;"><strong><span><em>Subscribers</em>'+val[0].subscriberCount+'</span></strong></div><div id="'+val[0]["listNumber.encode"]+'" class="action"><a class="btn-green add select-list"><span>Select</span><i class="icon next"></i></a></div></td>';                        
						
                        list_html += '</tr>';
                    },this));
                    list_html += '</tbody></table>';										
					
                    this.$(".bms-lists").html(list_html);
                   
                    this.$el.find("#import-list-grid").bmsgrid({
                        useRp : false,
                        resizable:false,
                        colresize:false,
                        height:300,							
                        usepager : false,
                        colWidth : ['100%','90px']
                    });				
                    this.$(".bms-lists .select-list").click(_.bind(this.markSelectList,this));
                },
                markSelectList:function(e){
                    var target = $.getObj(e,"a");
                    var parent_row = target.parents("tr");
                    if(!parent_row.hasClass("selected")){
                        this.$(".bms-lists tr").removeClass("selected");
                        parent_row.addClass("selected");
                    }
                },
                addlist:function(){
                    
                }
        });
});