define(['jquery.bmsgrid','jquery.calendario','jquery.chosen','jquery.searchcontrol','jquery.highlight','jquery-ui','text!html/campaign.html','views/common/editor','bms-tags','bms-filters'],
function (bmsgrid,calendraio,chosen,bmsSearch,jqhighlight,jqueryui,template,editorView,bmstags,bmsfilters) {
        'use strict';
        return Backbone.View.extend({
                id: 'step_container',               
                events: {
                       "click  .step3 #choose_soruce li":function(obj){
                           var target_li = obj.target.tagName=="LI" ? $(obj.target) : $(obj.target).parents("li");                           
                           if(target_li.hasClass("selected")) return false;
                           this.$(".step3 #choose_soruce li").removeClass("selected");
                           this.$(".step3 .soruces").hide();                           
                           this.$(".step3 #area_"+target_li.attr("id")).fadeIn("fast");                                                      
                           target_li.addClass("selected");
                           
                           this.step3SlectSource(target_li);
                       } ,
                      'click .step2 #choose_soruce li':function(obj){
                          var camp_obj = this;
                           var target_li =$.getObj(obj,"li"); 
                          if(this.$(".step2 #choose_soruce li.selected").length==0){
                                this.$(".step2 .selection-boxes").animate({width:"425px",margin:'0px auto'}, "medium",function(){
                                    $(this).removeClass("create-temp");                                                                                        
                                    camp_obj.step2SlectSource(target_li);
                                });
                          }
                          else{                                                                               
                              this.step2SlectSource(target_li);
                          }
                      },
                       "click #campMenubtn":function(){
                           var camp_id= $("#campMenu").val();                          
                           this.loadCampaign(camp_id);
                           
                       },
                       'keyup .header-info':function(obj){
                           var input_obj = $(obj.target);
                           if(input_obj.val().indexOf("{{") ==-1  && input_obj.val().indexOf("}}")==-1){
                               $("#"+input_obj.attr("id")+"_default").hide();
                           }
                       },
                      'click #campaign_add_to_salesforce':function(obj){                          
                          if(obj.target.checked){ 
                            this.states.step1.sf_checkbox = true;
                            this.$("#campaign_add_to_salesforce").prop("checked",this.states.step1.sf_checkbox);
                            this.$( "#accordion" ).accordion({ active: 0 });				
                          }
                          else{
                              this.removeResultFromSF();	
                              this.states.step1.sf_checkbox = false;
                              this.$("#campaign_add_to_salesforce").prop("checked",this.states.step1.sf_checkbox);
                              this.$( "#accordion" ).accordion({ active: false });                              
                          }
                          this.setSalesForceCombo();                          
                          obj.stopPropagation();
                      },
                      'click #conversion_filter':function(obj){                          
                          if(obj.target.checked){                              
                            this.states.step1.pageconversation_checkbox = true;  
                            this.$("#conversion_filter").prop("checked",this.states.step1.pageconversation_checkbox);
                            this.$( "#accordion1" ).accordion({ active: 0 });
                          }
                          else{
                              this.removeConversionPage();       
                              this.states.step1.pageconversation_checkbox = false;
                              this.$("#conversion_filter").prop("checked",this.states.step1.pageconversation_checkbox);
			      this.$( "#accordion1" ).accordion({ active: 1 });
                          }
                          this.setConversionPage();                          
                          obj.stopPropagation();
                      },
                      'click #save_conversion_filter':function(){
                          this.saveConversionPage();
                      },
                      
                      'click #save_results_sf':function(){
                           this.saveResultToSF();
                       },
                      'click .mergefields-box' :function(obj){
                          this.showMergeFieldDialog(obj);
                      },
                      'click #campaign_isFooterText':function(){
                        this.setFooterArea();
                      },
                      'change .step1 input,change .step1 select,change .step1 textarea':function(){
                          this.states.step1.change = true;
                      },
                      'change .step2 #myhtml':function(){
                          this.states.editor_change = true;
                      },
                      'click .step3 .savetarget': function(obj){
                          this.saveTarget(obj)
                      },
                       'click .step3 .canceltarget': function(obj){
                          if(this.states.step3.target_id){
                            this.showHideTargetTitle();
                          }
                      },
                      'click .step3 .targt .edit': function(){
                          this.showHideTargetTitle(true);
                      },
                      'click .step3 .targt .delete':function(){
                        this.deleteTarget();  
                      },
                      'click .step3 .targt #target_name_text span': function(){
                          this.showHideTargetTitle(true);
                      },
                      'click .step3 #save_target_detail':function(){
                          this.saveTargetFilter();
                      }
                      ,'click .step3 #save_salesforce_detail':function(){
                          this.saveSalesForceDetails();
                      }
                      ,'click .step3 #save_netsuite_detail':function(){
                          this.saveNetSuiteDetails()
                      }
                    },

                initialize: function () {
                        this.template = _.template(template);				                        
                        this.tags =  '';
                        this.tag_limit = 5;
                        this.camp_id = 0;
                        this.tags_common =[];                        
                        this.mergeTags = {};
                        this.allMergeTags = [];
                        this.wp_id = this.options.params.wp_id;
                        this.states = { "step1":{change:false,sf_checkbox:false,sfCampaignID:'',hasResultToSalesCampaign:false,pageconversation_checkbox:false,hasConversionFilter:false},
                                        "step2":{"templates":null,"events":false,"searchString":"",offset:0,totalcount:0,templateType:'B',getTemplateCall:null,searchValue:'',htmlText:'',change:false},
                                        "step3":{"target_id":0,salesforce:false,netsuite:false},
                                        "step4":{},
                                        "editor_change":false
                                       };
                        this.bmseditor = new editorView({opener:this,wp_id:this.wp_id});						
                        this.render();
                },

                render: function () {
                        this.$el.html(this.template({}));				                        
                        this.app = this.options.app;                            
                        this.wizard = this.options.wizard;    
                        if(this.options.params && this.options.params.camp_id){
                            this.camp_id = this.options.params.camp_id;
                        }                        
                        this.loadDataAjax(); // Load intial Calls
                        this.$el.find('div#copycampsearch').searchcontrol({
                                id:'copy-camp-search',
                                width:'300px',
                                height:'22px',
                                placeholder: 'Search Campaign',
                                gridcontainer: 'camp_list_grid',
                                showicon: 'yes',
                                iconsource: 'campaigns'
                         });
                         this.$el.find('div#listssearch').searchcontrol({
                                id:'list-search',
                                width:'300px',
                                height:'22px',
                                placeholder: 'Search Lists',
                                gridcontainer: 'list_grid',
                                showicon: 'yes',
                                iconsource: 'add-list'
                         });
                         this.$el.find('div#targetssearch').searchcontrol({
                                id:'target-list-search',
                                width:'300px',
                                height:'22px',
                                placeholder: 'Search Lists',
                                gridcontainer: 'target_list_grid',
                                showicon: 'no',
                                iconsource: ''
                         });
						 this.$el.find('div#targetsearch').searchcontrol({
                                id:'target-search',
                                width:'300px',
                                height:'22px',
                                placeholder: 'Search target',
                                gridcontainer: 'targets_grid',
                                showicon: 'yes',
                                iconsource: 'add-list'
                         });
                         this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                stepsCall:function(step){
                    var proceed = -1;
                    if(this.camp_id!==0){
                        switch (step){
                            case 'step_1':
                                proceed = this.saveStep1();
                                break;
                            case 'step_2':
                                proceed = this.saveStep2();
                                break;    
                            case 'step_3':
                                proceed = this.saveStep3();
                                break;    
                            case 'step_4':
                                proceed = this.saveStep4();
                                break;        
                            default:
                                break;
                        }
                    }
                    else{
                        this.app.showAlert('Please save campaign first to proceed!',this.$el.parents(".ws-content.active"));
                        proceed = 0 ;
                    }
                    return proceed;
                },
                init:function(){                                                                                                    
                    //Load mergeFields
                    this.mergeFieldsSetup();
                    //Load Calender
                    this.createCalender();
                    this.initHeader();
                    //
                    this.setupCampaign();                    
                    if(this.camp_id!="0"){
                        this.loadCampaign(this.camp_id);
                    }
                    else{
                        this.initCampaignTag('')   
                    }
                    this.$( "#accordion" ).accordion({ active: 1, collapsible: true,activate: _.bind(function(){
                            this.$("#campaign_add_to_salesforce").prop("checked",this.states.step1.sf_checkbox)
                            
                    },this) });
                    this.$( "#accordion1" ).accordion({ active: 1, collapsible: true,activate:_.bind(function(){
                            this.$("#conversion_filter").prop("checked",this.states.step1.pageconversation_checkbox);
                    },this) });
                    this.$el.parents(".ws-content").append(this.bmseditor.$el);
                    this.bmseditor.initEditor({id:this.wp_id});
                    
                    //Init Chosen combo                    
                    this.$("#con_filter_combo").chosen({no_results_text:'Oops, nothing found!', width: "270px",disable_search: "true"});                                       
                    this.$("#campaign_unSubscribeType").chosen({no_results_text:'Oops, nothing found!', width: "290px",disable_search: "true"});
                    this.$("#campaign_unSubscribeType").chosen().change(_.bind(function(){
                        this.states.step1.change = true;
                    },this));
                   
                },
                initTemplateListing:function(){
                    this.$el.find("#camp_list_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:this.app.get('wp_height')-122,
                            usepager : false,
                            colWidth : ['100%','90px','66px','132px']
                    });
                    this.$("#camp_list_grid tr td:nth-child(1)").attr("width","100%");
                    this.$("#camp_list_grid tr td:nth-child(2)").attr("width","90px");
                    this.$("#camp_list_grid tr td:nth-child(3)").attr("width","66px");
                    this.$("#camp_list_grid tr td:nth-child(4)").attr("width","132px");
                },
                initListListing:function(){
                    this.$el.find("#list_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
							height:this.app.get('wp_height')-122,                            
                            usepager : false,
                            colWidth : ['100%','100px']
                    });
					this.$el.find("#targets").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:this.app.get('wp_height')-122,
                            usepager : false,
                            colWidth : ['auto','330']
                    });
                   	//this.$("#recipients-list,.list-action-btn").css("height",this.app.get('wp_height')-122);
                    
                    this.$("#list_grid tr td:first-child").attr("width","100%");
                    this.$("#list_grid tr td:last-child").attr("width","100px");	
                    this.$("#recipients-list").css("height",this.app.get('wp_height')-122);
					
                    this.$("#targets tr td:first-child").attr("width","100%");
                    this.$("#targets tr td:last-child").attr("width","150px");										
                    this.$("#target-recipients-list").css("height",this.app.get('wp_height')-122);
                },
                loadCampaign:function(camp_id){
                   if(camp_id==="0" || camp_id===0) return false;
                   var bms_token =this.app.get('bms_token');
                   var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+bms_token+"&campNum="+camp_id+"&type=basic";
                   var camp_obj = this;
				
                    //remove previous data 
                    camp_obj.$(".step1 input").val("");
                    camp_obj.$(".step1 input[type='checkbox']").prop("checked",false);
                    this.camp_id = camp_id;
                    this.setupCampaign();
                    this.app.showLoading(true,this.$el.parents(".ws-content"));
                    $("#campMenubtn").attr("disabled",true).html("Loading...");
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var camp_json = jQuery.parseJSON(xhr.responseText);
                        $("#campMenubtn").attr("disabled",false).html("Load");
                        if(camp_obj.app.checkError(camp_json)){
                            return false;
                        }
                        //Setting Campaign Basic Settings
                        camp_obj.$el.parents(".ws-content").find("#workspace-header").html(camp_json.name);

                        camp_obj.$("#campaign_subject").val(camp_obj.app.decodeHTML(camp_json.subject)); 
                        camp_obj.$("#campaign_preview_subject").html(camp_json.subject);
                        camp_obj.$("#campaign_from_email").val(camp_obj.app.decodeHTML(camp_json.fromEmail));
                        camp_obj.$("#campaign_preview_fromEmail").html(camp_json.fromEmail);
                        camp_obj.$("#campaign_from_name").val(camp_obj.app.decodeHTML(camp_json.senderName));
                        camp_obj.$("#campaign_preview_defaultSenderName").html(camp_json.defaultSenderName);
                        camp_obj.$("#campaign_reply_to").val(camp_obj.app.decodeHTML(camp_json.replyTo));                                
                        camp_obj.$("#campaign_preview_defaultReplyTo").html(camp_json.defaultReplyTo);
                        camp_obj.$("#campaign_footer_text").val(camp_json.footerText);
                        camp_obj.states.step2.htmlText = camp_json.htmlText;

                        if(camp_json.defaultSenderName){
                             camp_obj.$("#campaign_from_name_default").show();
                             camp_obj.$("#campaign_default_from_name").val(camp_json.defaultSenderName);
                        }
                        else{
                             camp_obj.$("#campaign_from_name_default").hide();
                        }

                        if(camp_json.defaultReplyTo){
                             camp_obj.$("#campaign_reply_to_default").show();
                             camp_obj.$("#campaign_default_reply_to").val(camp_json.defaultReplyTo);
                        }
                        else{
                             camp_obj.$("#campaign_reply_to_default").hide();
                        }

                        camp_obj.$("#campaign_socail_networks").prop("checked",camp_json.isShareIcons=="N"?false:true);
                        camp_obj.$("#campaign_fb").prop("checked",camp_json.facebook=="N"?false:true);
                        camp_obj.$("#campaign_twitter").prop("checked",camp_json.twitter=="N"?false:true);
                        camp_obj.$("#campaign_linkedin").prop("checked",camp_json.linkedin=="N"?false:true);
                        camp_obj.$("#campaign_pintrest").prop("checked",camp_json.pinterest=="N"?false:true);
                        camp_obj.$("#campaign_gplus").prop("checked",camp_json.googleplus=="N"?false:true);
                        //camp_obj.$("#campaign_dunkb").prop("checked",camp_json.googleplus=="N"?false:true);

                        camp_obj.$("select#campaign_unSubscribeType").val(camp_json.unSubscribeType).trigger("chosen:updated");
                        camp_obj.$("#campaign_profileUpdate").prop("checked",camp_json.profileUpdate=="N"?false:true);
                        camp_obj.$("#campaign_useCustomFooter").prop("checked",camp_json.useCustomFooter=="N"?false:true);
                        camp_obj.$("#campaign_isFooterText").prop("checked",camp_json.isFooterText=="N"?false:true);
                        camp_obj.$("#campaign_tellAFriend").prop("checked",camp_json.tellAFriend=="N" ? false:true );
                        camp_obj.$("#campaign_isTextOnly").prop("checked",camp_json.isTextOnly=="N"?false:true);
                        camp_obj.$("#campaign_isWebVersion").prop("checked",camp_json.isWebVersionLink=="N"?false:true);
                        camp_obj.setFooterArea();
                        //Load tags
                        camp_obj.tags = camp_obj.app.encodeHTML(camp_json.tags);
                        camp_obj.initCampaignTag(camp_obj.tags);     
						//alert(camp_json.addToSFStatus);
                        if(camp_json.addToSFStatus=='Y'){                             
                             camp_obj.states.step1.hasResultToSalesCampaign = true;                             
                             camp_obj.$("#campaign_add_to_salesforce").prop("checked",true);                             
                             camp_obj.states.step1.sf_checkbox = true;
                             camp_obj.states.step1.sfCampaignID = camp_json.sfCampaignID;                             
                             camp_obj.$("#sf_campaigns_combo").prop("disabled",false).val(camp_json.sfCampaignID).trigger("chosen:updated");
                             camp_obj.$( "#accordion" ).accordion({ active: 0 });
                        }
                        else{
                             camp_obj.states.step1.hasResultToSalesCampaign = false;                             
                             camp_obj.$("#campaign_add_to_salesforce").prop("checked",false);   
                             camp_obj.states.step1.sf_checkbox = false;
                             camp_obj.$( "#accordion" ).accordion({ active: false });
                        }                       

                        if(camp_json.conversionFilterStatus=='Y'){
                            camp_obj.$("#conversion_filter").prop("checked",true);                                   
                            camp_obj.states.step1.hasConversionFilter = true;
                            camp_obj.states.step1.pageconversation_checkbox = true;
                            URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK="+bms_token+"&campNum="+camp_id+"&type=source";

                            jQuery.getJSON(URL,  function(tsv, state, xhr){
                                 var conversation_filter = jQuery.parseJSON(xhr.responseText);
                                 if(camp_obj.app.checkError(conversation_filter)){
                                     return false;
                                 }
                                 camp_obj.setConversionPage();           
                                 if(conversation_filter.ruleCount > 0){                                            
                                     var r = conversation_filter.rules[0].rule1[0];									 
                                     camp_obj.$("select#con_filter_combo").val(camp_obj.app.decodeHTML(r.rule));
                                     camp_obj.$("#con_filter_field").val(camp_obj.app.decodeHTML(r.matchValue));
                                     camp_obj.setConversionPage();
                                 }

                             });
                            camp_obj.$( "#accordion1" ).accordion({ active: 0 });
                        }
                        else{
                            camp_obj.states.step1.hasConversionFilter = false;
                            camp_obj.states.step1.pageconversation_checkbox =false;
                            camp_obj.$("#conversion_filter").prop("checked",false);                                                        
                            camp_obj.$( "#accordion1" ).accordion({ active: false });
                            camp_obj.setConversionPage();
                        }
                        

                        URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+bms_token+"&campNum="+camp_id+"&type=source";
                        camp_obj.$el.find("#list_grid input[type='checkbox']").prop("checked",false);
                        camp_obj.$el.find("#list_grid tr").removeClass("trSelected");

                        jQuery.getJSON(URL,  function(tsv, state, xhr){
                            var selected_lists = jQuery.parseJSON(xhr.responseText);
                             if(camp_obj.app.checkError(selected_lists)){
                                 return false;
                             }
                            /*if(selected_lists.listNumbers){
                                var lists = selected_lists.listNumbers.split(",");
                                $(lists).each(function(key,val){
                                    camp_obj.$el.find("#list_grid input[value='"+val+"']").prop("checked",true);
                                    camp_obj.$el.find("#list_grid input[value='"+val+"']").parents("tr").addClass("trSelected");
                                });
                            }*/
                            camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));
                        });
                    });  
                }
                ,
                initHeader:function(){
                  var previewIconCampaign = $('<a class="icon preview"></a>');  
                  var editIconCampaign = $('<a class="icon edit"></a>');
                  var deleteIconCampaign = $('<a class="icon delete"></a>');
                  var active_ws = this.$el.parents(".ws-content");
                  var header_title = active_ws.find(".camp_header .edited  h2");
                  header_title.append(previewIconCampaign);
                  header_title.append(editIconCampaign);
                  header_title.append(deleteIconCampaign);
                  active_ws.find(".camp_header").addClass("heighted-header");
                  active_ws.find("#header_wp_field").attr("placeholder","Type in Campaign Name");
                  active_ws.find("#save_campaign_btn").click(_.bind(this.saveCampaign,this));               
                  active_ws.find("#cancel_campaign_btn").click(_.bind(this.setupCampaign,this));               
                  
                 active_ws.find("#header_wp_field").keyup(function(e){
                     if(e.keyCode==13){
                         active_ws.find("#save_campaign_btn").click();
                     }
                 });
                  
                  editIconCampaign.click(function(e){                      
                      active_ws.find(".camp_header .c-name h2").hide();
                      var text= active_ws.find("#workspace-header").html();                                            
                      active_ws.find(".camp_header .c-name .edited ").show();
                      active_ws.find("#header_wp_field").focus().val(text);  
                      e.stopPropagation();
                  });
                  active_ws.find("#workspace-header").click(function(e){
                      active_ws.find(".camp_header .c-name h2").hide();
                      var text= active_ws.find("#workspace-header").html();                                            
                      active_ws.find(".camp_header .c-name .edited ").show();
                      active_ws.find("#header_wp_field").focus().val(text);  
                      e.stopPropagation();
                  });
                  var camp_obj = this;
                  deleteIconCampaign.click(function(){
                      if(confirm('Are you sure you want to delete this campaign?')){
                          var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
                          camp_obj.app.showLoading("Deleting...",camp_obj.$el.parents(".ws-content.active"));
                          $.post(URL, {type:'delete',campNum:camp_obj.camp_id})
                          .done(function(data) {                                 
                                 var del_camp_json = jQuery.parseJSON(data);  
                                 if(camp_obj.app.checkError(del_camp_json)){
                                        return false;
                                 }
                                 if(del_camp_json[0]!=="err"){
                                     camp_obj.app.showMessge("Campaign Deleted");
                                     active_ws.find(".camp_header .close").click();
                                 }
                                 camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content.active"));
                         });
                      }
                  });
                                    
                },
                initStepCall:function(stepNo){
                    if(this.camp_id!==0){
                        switch (stepNo){                                                            
                            case 'step_2':
                                this.initStep2();
                                break;                                
                            default:
                                break;
                        }
                    }
                },
                initStep2:function(){
                    if(this.states.step2.htmlText){
                        this.setEditor();
                        tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(this.states.step2.htmlText,true));                                 
                    }
                },
                setupCampaign:function(){
                  var active_ws = this.$el.parents(".ws-content");
                  if(this.camp_id===0){                      
                      active_ws.find(".camp_header .c-name h2").hide();                      
                      active_ws.find(".camp_header .c-name .edited ").show();                      
                      active_ws.find("#camp_tags").children().remove();
                      active_ws.find(".camp_header .tags-contents,.camp_header .ellipsis").hide();                      
                      active_ws.find("#header_wp_field").focus().val('');
                      //active_ws.find(".step-contents").find("input,select,textarea").prop("disabled",true);
                      active_ws.find("#campMenu").prop("disabled",false);
                  }
                  else{
                       active_ws.find(".camp_header .c-name .edited").hide();                        
                       active_ws.find(".camp_header .c-name h2").show();                        
                       active_ws.find("#header_wp_field").focus().attr("process-id",this.camp_id);  
                       active_ws.find(".step-contents").find("input,select,textarea").prop("disabled",false);
                       this.setFooterArea();
                       this.setSalesForceCombo();
                       this.setConversionPage();
                  }  
                },
                saveCampaign:function(obj){                   
                   
                    var camp_obj = this;
                    var camp_name_input =  $(obj.target).parent().find("input");                       
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                    if(camp_name_input.val()!==""){

                     if(camp_name_input.attr("process-id")){
                        $(obj.target).addClass("saving");                         
                        $.post(URL, { type: "newName",campName:camp_name_input.val(),campNum:this.camp_id })
                          .done(function(data) {                              
                              var camp_json = jQuery.parseJSON(data);                              
                              if(camp_json[0]!=="err"){
                                 camp_obj.$el.parents(".ws-content").find("#workspace-header").html(camp_name_input.val());                                                                
                                 camp_obj.setupCampaign();
                                 camp_obj.app.showMessge("Campaign Renamed");
                              }
                              else{                                  
                                  camp_obj.app.showAlert(camp_json[1],camp_obj.$el.parents(".ws-content.active"));
                                  
                              }
                              $(obj.target).removeClass("saving");                              
                         }); 
                     }
                     else{                         
                         $(obj.target).addClass("saving");
                         $.post(URL, { type: "create",campName:camp_name_input.val() })
                          .done(function(data) {                              
                              var camp_json = jQuery.parseJSON(data);                              
                              if(camp_json[0]!=="err"){
                                 camp_obj.$el.parents(".ws-content").find("#workspace-header").html(camp_name_input.val());
                                 camp_obj.camp_id = camp_json[1];             
                                 var active_ws = camp_obj.$el.parents(".ws-content");
                                 var camp_tag_ele = active_ws.find(".camp_header #campaign_tags");
                                 if(camp_tag_ele.data("tags")){
                                    camp_tag_ele.data("tags").setObjectId("campNum",camp_json[1]);
                                 }
                                 camp_obj.setupCampaign();
                                 camp_obj.app.showMessge("Campaign Created");
                                 
                                 //update workspace tab id 
                                 var li_id =  camp_obj.$el.parents(".ws-content").attr("id").split("_")[1];
                                 $("#wp_li_"+li_id).attr("workspace_id","campaign_"+camp_json[1]);
                              }
                              else{
                                  camp_obj.app.showAlert(camp_json[1],camp_obj.$el.parents(".ws-content.active"));
                              }
                              $(obj.target).removeClass("saving");                              
                         });
                     }
                   }                      
                    obj.stopPropagation();
                },
                saveStep1:function(){
                    var camp_obj = this;
                    var proceed = -1;
                    //Validating Step 1
                    var errorHTML = "";
                    this.$(".settings .adv_dd input[type='text']").removeClass("form-error").attr("title","");
                    if(this.$("#campaign_subject").val()==""){
                        proceed = 0;
                        this.$("#campaign_subject").addClass("form-error");
                        errorHTML +="- Subject can't be blank. <br/>";
                    }
                    if(this.$("#campaign_subject").val().length>100){
                        this.$("#campaign_subject").addClass("form-error");
                        errorHTML +="- Subject length cann't be greater than 100 characters. <br/>";
                        proceed = 0;
                    }
                    if(this.$("#campaign_from_name").val()==""){
                        this.$("#campaign_from_name").addClass("form-error");
                        errorHTML +="- From name can't be empty. <br/>";
                        proceed = 0;
                    }
                    if(errorHTML){
                         var messageObj = {};
                         messageObj["heading"] = "Step 1: Following error(s) occured:" 
                         messageObj["detail"] = errorHTML;
                         this.app.showAlertDetail(messageObj,this.$el.parents(".ws-content.active"));
                    }
                    if(proceed!==0 && (this.states.step1.change || this.camp_id==0)){
                        this.app.showLoading("Saving Step 1...",this.$el.parents(".ws-content"));
                        var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                        $.post(URL, { type: "saveStep1",campNum:this.camp_id,
                                     subject : this.$("#campaign_subject").val(),
                                     senderName :this.$("#campaign_from_name").val(),
                                     defaultSenderName :this.$("#campaign_default_from_name").val(),
                                     replyTo :this.$("#campaign_reply_to").val(),
                                     defaultReplyToEmail :this.$("#campaign_default_reply_to").val(),
                                     tellAFriend :this.$("#campaign_tellAFriend")[0].checked?'Y':'N',
                                     subInfoUpdate :this.$("#campaign_profileUpdate")[0].checked?'Y':'N',
                                     unsubscribe :this.$("#campaign_unSubscribeType").val(),
                                     provideWebVersionLink :this.$("#campaign_isWebVersion")[0].checked?'Y':'N',
                                     isCampaignText :this.$("#campaign_isTextOnly")[0].checked?'Y':'N',
                                     isFooterText : this.$("#campaign_isFooterText")[0].checked?'Y':'N',
                                     footerText :this.$("#campaign_footer_text").val(),
                                     useCustomFooter :this.$("#campaign_useCustomFooter")[0].checked?'Y':'N',
                                     isShareIcons :this.$("#campaign_socail_share input[type='checkbox']:checked").length?'Y':'N',
                                     facebookShareIcon :this.$("#campaign_fb")[0].checked?'Y':'N',
                                     twitterShareIcon :this.$("#campaign_twitter")[0].checked?'Y':'N',
                                     linkedInShareIcon :this.$("#campaign_linkedin")[0].checked?'Y':'N',
                                     googlePlusShareIcon :this.$("#campaign_gplus")[0].checked?'Y':'N',
                                     pinterestShareIcon: this.$("#campaign_pintrest")[0].checked?'Y':'N'
                              })
                             .done(function(data) {                                 
                                 var step1_json = jQuery.parseJSON(data);
                                 camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));
                                 if(step1_json[0]!=="err"){
                                     camp_obj.app.showMessge("Step 1 saved successfully!");                                     
                                     camp_obj.states.step1.change=false;
                                     camp_obj.wizard.next();
                                 }
                                 else{
                                    camp_obj.app.showMessge(step1_json[0]); 
                                 }
                        });
                        proceed = 1;
                    }
                    
                    return proceed;
                },
                saveStep2:function(gotoNext){                 
                 var camp_obj = this; 
                 var proceed = -1;
                 var html = this.$(".step2 #choose_soruce li.selected").attr("id")!=="html_code" ?tinyMCE.get('bmseditor_'+this.wp_id).getContent():this.$("textarea#myhtml").val();
                 if(html=="" && this.states.step2.htmlText!==""){
                     html = this.states.step2.htmlText;
                 }
                        
                 if(this.states.editor_change ===true || typeof(gotoNext)!=="undefined"){
                    if(typeof(gotoNext)==="undefined"){
                       this.app.showLoading("Saving Step 2...",this.$el.parents(".ws-content"));
                    }
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                   $.post(URL, { type: "saveStep2",campNum:this.camp_id,
                                 htmlCode: html      
                         })
                        .done(function(data) {                                 
                            var step1_json = jQuery.parseJSON(data);
                            camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));
                            camp_obj.bmseditor.$el.find(".saving").removeClass("saving");
                            if(step1_json[0]!=="err"){
                                camp_obj.app.showMessge("Step 2 saved successfully!");
                                camp_obj.states.step2.htmlText = html;
                                camp_obj.states.editor_change = false;
                                if(typeof(gotoNext)=="undefined"){
                                    camp_obj.wizard.next();
                                }
                            }
                            else{
                               camp_obj.app.showMessge(step1_json[0]); 
                            }
                   });
                   proceed = 1
                 }  
                return proceed;  
                },
                saveStep3:function(){
                  return -1;  
                },
                saveStep4:function(){
                  return -1;  
                },
                initCampaignTag:function(tags){                  
                  var active_ws = this.$el.parents(".ws-content");
                  var camp_tag_ele = active_ws.find(".camp_header #campaign_tags");
                  camp_tag_ele.tags({app:this.app,
                        url:"/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token'),
                        tags:tags,
                        showAddButton:(this.camp_id=="0")?false:true,
                        params:{type:'tags',campNum:this.camp_id,tags:''},
                        typeAheadURL:"/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=allCampaignTags"
                    });                  
                  
                },
                loadDataAjax:function(){
                    var camp_obj = this;       
                    
                    //Loading Campaigns list
                    this.app.showLoading(true,camp_obj.$el.find("#target-lists"));
                    
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns";                                                            
                    
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var camps_json = jQuery.parseJSON(xhr.responseText);
                            if(camp_obj.app.checkError(camps_json)){
                                return false;
                            }
                            camp_obj.createCampaignListTable(xhr);
                            camp_obj.app.setAppData("campaigns",jQuery.parseJSON(xhr.responseText));  
                            
                        }
                    }).fail(function() { console.log( "error campaign listing" ); });
                    
                    //Load Defaults 
                    URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=campaignDefaults";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var defaults_json = jQuery.parseJSON(xhr.responseText);
                            if(camp_obj.app.checkError(defaults_json)){
                                return false;
                            }
                            camp_obj.$("#campaign_footer_text").val(camp_obj.app.decodeHTML(defaults_json.footerText));                          
                            camp_obj.$("#campaign_from_email").val(camp_obj.app.decodeHTML(defaults_json.fromEmail));
                            camp_obj.$("#campaign_from_name").val(camp_obj.app.decodeHTML(defaults_json.fromName));
                            if(defaults_json.customFooter==""){
                                camp_obj.$("#campaign_useCustomFooter_div").hide();
                            }
                            else{
                                camp_obj.$("#campaign_useCustomFooter_div").show();
                                camp_obj.$("#campaign_custom_footer_text").val(camp_obj.app.decodeHTML(defaults_json.customFooter,true));
                            }
                        }
                    }).fail(function() { console.log( "error in detauls" ); });
                    //Loading lists list
                    URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=all";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            camp_obj.createListTable(xhr);
                            camp_obj.app.setAppData("lists",jQuery.parseJSON(xhr.responseText));  
                        }
                    }).fail(function() { console.log( "error lists listing" ); });
					
					URL = "/pms/io/filters/getTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list&filterFor=C";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            camp_obj.createTargetsTable(xhr);
                        }
                    }).fail(function() { console.log( "error lists listing" ); });
                    
                    var salesforce_setting = this.app.getAppData("salesfocre");
                    if(salesforce_setting.isSalesforceUser=="Y"){
                        this.$("#add_result_salesforce").show();
                        this.showSalesForceCampaigns();
                    }
                    else{
                        this.$("#add_result_salesforce").hide();
                    }                   
                                        
                    
                    URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=merge_tags";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var mergeFields_json = jQuery.parseJSON(xhr.responseText);                            
                            if(camp_obj.app.checkError(mergeFields_json)){
                                return false;
                             }
                            camp_obj.mergeTags['basic'] = [];
                            camp_obj.mergeTags['custom'] = [];
                            $.each(mergeFields_json,function(key,val){
                                if(val[2]=="true"){
                                    camp_obj.mergeTags['basic'].push(val);
                                }
                                else{
                                    camp_obj.mergeTags['custom'].push(val);
                                }
                            });
                            
                            URL = "/pms/io/user/getData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=salesRepMergeTags";
                            jQuery.getJSON(URL,  function(tsv, state, xhr){
                                if(xhr && xhr.responseText){
                                    var salesRepFields_json = jQuery.parseJSON(xhr.responseText);
                                    if(camp_obj.app.checkError(salesRepFields_json)){
                                        return false;
                                     }
                                    camp_obj.mergeTags['salesRep'] =  salesRepFields_json;
                                    
                                    $.each(camp_obj.mergeTags['salesRep'],function(key,val){
                                        camp_obj.allMergeTags.push({"type":"Sales Rep","name":val[1],"code":val[0]});
                                    });
                                    $.each(camp_obj.mergeTags['basic'],function(key,val){
                                        camp_obj.allMergeTags.push({"type":"Basic Field","name":val[1],"code":val[0]});
                                    });
                                    $.each(camp_obj.mergeTags['custom'],function(key,val){
                                        camp_obj.allMergeTags.push({"type":"Custom Field","name":val[1],"code":val[0]});
                                    });
                                    camp_obj.allMergeTags.sort(function(a, b){
                                        var a1= a.name, b1= b.name;
                                        if(a1== b1) return 0;
                                        return a1> b1? 1: -1;
                                    });
                                    
                                    var fields_html = "<ul>";
                                    $.each(camp_obj.allMergeTags,function(key,val){
                                        fields_html +="<li mergeval='"+val.code+"'><span>"+val.type+"</span><div>"+val.name+"</div><a class='search-merge-insert'>Insert</a></li>";                                        
                                    });
                                    fields_html += "</ul>";
                                    $(".searchfields .searchlist").html(fields_html);
                                    $(".search-merge-insert").click(function(){
                                        var active_ws = $(".ws-content.active");
                                        var merge_field = $(this).parents("li").attr("mergeval");
                                        var input_field = $(this).parents(".mergefields").attr("input-source");
                                        if(input_field!=="campaign_subject"){
                                         active_ws.find("#"+input_field).val(merge_field);
                                        }
                                        else{
                                            var caretPos = active_ws.find("#"+input_field)[0].selectionStart;
                                            var textAreaTxt = active_ws.find("#"+input_field).val();
                                            active_ws.find("#"+input_field).val(textAreaTxt.substring(0, caretPos) + merge_field + textAreaTxt.substring(caretPos) ); 
                                        }
                                        active_ws.find("#"+input_field+"_default").fadeIn("fast");
                                        $(".mergefields").hide();
                                    });
                                }
                            }).fail(function() { console.log( "error sales rep fields json" ); });
                        }
                    }).fail(function() { console.log( "error merge fields json" ); });
                                        
                    // Load common tags
                    //camp_obj.initTpyeAhead();
                                                                                                                        
                    $(".mergefields").click(function(e){
                        e.stopPropagation();
                    });
                    var wp_length = $(".ws-tabs li").length-1;                    
                    
                    /*var xhr = {};1GKvqmqc1Iyz6VZqETa5DaK5Nb0zLw
                    xhr.responseText = '{"count": "85","lists":[{"list1":[{"creationDate": "2012-07-27","tags": "","campaignSentCount": "0","name": "Abandoned Shopping Carts","listNum": "qcWQe30Wh33Jb26Hi17Mk20qcW","md5": "4b7dc121caf2baf0963a047346fc8df6","subscriberCount": "705","isSupressList": "false"}],"list2":[{"creationDate": "2008-02-05","tags": "","campaignSentCount": "0","name": "All Synch Leads","listNum": "kzaqwKb26Bb17Gd20Mi21Uh30kzaqw","md5": "7d24c36ac85da6029d610602b6994085","subscriberCount": "712","isSupressList": "false"}]}]}';
                    this.createListTable(xhr);*/
                },
                createListTable:function(xhr){
					var camp_obj=this;                    
                    this.$el.find("#target-lists").children().remove();
                    var camp_list_json = jQuery.parseJSON(xhr.responseText);
                    if(this.app.checkError(camp_list_json)){
                        return false;
                     }
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="list_grid"><tbody>';
                    this.$el.find(".list-count").html("Displaying <b>"+camp_list_json.count+"</b> lists");
                    $.each(camp_list_json.lists[0], function(index, val) {     
                        list_html += '<tr id="row_'+val[0].listNum+'">';                        
                        list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3>   <div class="  tags"><h5>Tags:</h5>'+ camp_obj.app.showTags(val[0].tags) +'</div></div></td>';                        
                        list_html += '<td><div class="subscribers show" style="width:75px"><span  class=""></span>'+val[0].subscriberCount+'</div><div id="'+val[0].listNum+'" class="action"><a class="btn-green">Add</a></div></td>';                        
                        list_html += '</tr>';
                    });
                    list_html += '</tbody></table>';

                    this.$el.find("#target-lists").html(list_html);
                    this.initListListing();
                    
                    this.$el.find("#target-lists .action").click(_.bind(this.addToRecipients,this));
                },
				createTargetsTable:function(xhr){ 
					var camp_obj=this;                   
                    this.$el.find("#targets").children().remove();
                    var targets_list_json = jQuery.parseJSON(xhr.responseText);
                    if(this.app.checkError(targets_list_json)){
                        return false;
                     }
                    var target_html = '<table cellpadding="0" cellspacing="0" width="100%" id="targets_grid"><tbody>';
                    this.$el.find(".target-count").html("Displaying <b>"+targets_list_json.count+"</b> targets");
					//alert(targets_list_json);
                    $.each(targets_list_json.filters[0], function(index, val) {
						//alert(val[0]["filterNumber.encode"]);
                        target_html += '<tr id="row_'+val[0]["filterNumber.encode"]+'">';                        
                        target_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3>   <div class="  tags"><h5>Tags:</h5>'+ camp_obj.app.showTags(val[0].tags) +'</div></div></td>';                        
                        target_html += '<td><div class="subscribers show"><span  class=""></span>'+val[0].filtersCount+'</div><div id="'+val[0]["filterNumber.encode"]+'" class="action"><a id="'+val[0]["filterNumber.encode"]+'" class="btn-green use">Use</a><a class="btn-green add">Add</a></div></div></td>';                        
                        target_html += '</tr>';
                    });
                    target_html += '</tbody></table>';

                    this.$el.find("#targets").html(target_html);                                                            
                    this.initListListing();
                    
                    this.$el.find("#targets_grid .add").click(_.bind(this.addToTargetRecipients,this));
                    this.$el.find("#targets_grid .use").click(_.bind(this.loadTarget,this));
                },
                createCampaignListTable:function(xhr){                    
                    var camp_obj=this;
                    this.$el.find("#copy-camp-listing").children().remove();
                    var camp_list_json = jQuery.parseJSON(xhr.responseText);
                    this.$("#copy-camp-count").html(camp_list_json.count+" Campaigns")
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="camp_list_grid"><tbody>';
                    this.$el.find(".list-count").html("Displaying <b>"+camp_list_json.count+"</b> lists");
                    $.each(camp_list_json.lists[0], function(index, val) {     
                        var datetime = val[0].scheduledDate;
                        var dateFormat = '';
                        if(datetime)
                        {
                                var date = datetime.split(' ');
                                var dateparts = date[0].split('-');
                                 var monthNames = [
                                  "Jan", "Feb", "Mar",
                                  "Apr", "May", "Jun",
                                  "Jul", "Aug", "Sep",
                                  "Oct", "Nov", "Dec"
                                  ];
                                var month = monthNames[dateparts[1].replace('0','')-1];
                                dateFormat = dateparts[2] + ' ' + month + ', ' + dateparts[0];
                        }
                        else{
                            dateFormat = '';					
                         }  
                        list_html += '<tr id="row_'+val[0].campNum+'">';                        
                        list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3>   <div class="  tags"><h5>Tags:</h5>'+camp_obj.app.showTags(val[0].tags)+'</td>'; 
                        list_html += '<td><div class="subscribers show" style="width:60px"><span  class=""></span>0</div></td>'; 
                        list_html += '<td><div class="mail show" style="width:40px"><span class=""></span>'+val[0].sentCount+'</div> </td>'; 
                        list_html += '<td><div class="time show" style="width:105px"><span class=""></span>'+dateFormat+'</div><div id="'+val[0].campNum+'" class="action"><a class="btn-green">Copy</a></div></td>';                        
                        list_html += '</tr>';
                    });
                    list_html += '</tbody></table>';

                    this.$el.find("#copy-camp-listing").html(list_html);                                                                                
                    this.initTemplateListing();
                    this.$("#copy-camp-listing .action").click(_.bind(this.copyCampaign,this));
                    
                    //this.$el.find(".copy-camp-listing .action").click(_.bind(this.copyCampaign,this));
                }
                ,               
                addToRecipients:function(obj){
                    var tr_obj = $(obj.target).parents("tr");  
                    var me = this;
                    tr_obj.fadeOut("fast", function(){
                        var tr_copy = tr_obj.clone();
                        if(tr_obj.next().length){
                          var tr_next =  tr_obj.next();                        
                          tr_copy.attr("before_id", tr_next.attr("id"));

                        }
                        $(this).remove();                      
                        tr_copy.find(".action .btn-green").removeClass("btn-green").addClass("btn-red").html("Remove");                      
                        tr_copy.find(".action").click(_.bind(me.removeFromRecipients,me))
                        tr_copy.appendTo(me.$("#list_grid_recipients tbody"));
                        tr_copy.fadeIn("fast");

                    })
                                    var recpoldcount = this.$el.find("#recpcount span").text();
                                    var recpnewval = tr_obj.find("td:nth-child(2) div.subscribers").text();
                                    var recptotalcount = parseInt(recpoldcount) + parseInt(recpnewval);				   
                                    this.$el.find("#recpcount span").text(recptotalcount);
                                    //alert('1');
                  },
                                  addToTargetRecipients:function(obj){					
                    var tr_obj = $(obj.target).parents("tr");  
                    var me = this;
                    tr_obj.fadeOut("fast", function(){
                        var tr_copy = tr_obj.clone();
                        if(tr_obj.next().length){
                          var tr_next =  tr_obj.next();                        
                          tr_copy.attr("before_id", tr_next.attr("id"));

                        }
                        $(this).remove();
                                            tr_copy.find(".action .use").hide();
                        tr_copy.find(".action .btn-green").removeClass("btn-green").addClass("btn-red").html("Remove");                      
                        tr_copy.find(".action").click(_.bind(me.removeFromTargetRecipients,me))
                        tr_copy.appendTo(me.$("#target_grid_recipients tbody"));
                        tr_copy.fadeIn("fast");

                    });
                                    var oldcount1 = this.$el.find("#trecpcount span").text();
                                    //alert(oldcount);
                                    var newval1 = tr_obj.find("td:nth-child(2) div.subscribers").text();
                                    //alert(newval);
                                    //alert(parseInt(oldcount) + parseInt(newval));
                                    var totalcount1 = parseInt(oldcount1) + parseInt(newval1);
                                    this.$el.find("#trecpcount span").text(parseInt(totalcount1));
                                    this.$el.find("#recpcount span").text('0');
                                    //alert('2');
                  },
                  removeFromRecipients:function(obj){
                      var tr_obj = $(obj.target).parents("tr"); 
                      var me = this;
                      tr_obj.fadeOut("fast", function(){
                          var tr_copy = tr_obj.clone();
                          var before_id = tr_obj.attr("before_id");
                          tr_copy.removeAttr("before_id");
                          $(this).remove();
                          tr_copy.find(".action .btn-red").removeClass("btn-red").addClass("btn-green").html("Add");                      
                          tr_copy.find(".action").click(_.bind(me.addToRecipients,me));
                          /*if(before_id){
                              tr_copy.insertBefore(me.$("#list_grid #"+before_id));
                          }
                          else{
                              tr_copy.appendTo(me.$("#list_grid tbody"));							
                          }*/
                                                  var match = null;
                                                  $("#list_grid tbody").find("tr").each(function(){
                                                          if($(this).attr("id") == before_id){
                                                                  match = $(this);
                                                                  return false;
                                                          }
                                                  });
                                                  if(match)
                                                          tr_copy.insertBefore(match);
                                                  else
                                                     $("#list_grid tbody").append(tr_copy);

                          tr_copy.fadeIn("fast");
                      });
                                          var oldcount = this.$el.find("#recpcount span").text();
                                          var newval = tr_obj.find("td:nth-child(2) div.subscribers").text();
                                          var totalcount = oldcount - newval;				   
                                          this.$el.find("#recpcount span").text(totalcount);
                  },
                                  removeFromTargetRecipients:function(obj){
                      var tr_obj = $(obj.target).parents("tr"); 
                      var me = this;
                      tr_obj.fadeOut("fast", function(){
                          var tr_copy = tr_obj.clone();
                          var before_id = tr_obj.attr("before_id");
                          tr_copy.removeAttr("before_id");
                          $(this).remove();
                                                  tr_copy.find(".action .use").show();
                                                  tr_copy.find(".action .btn-red").removeClass("btn-red").addClass("btn-green").html("Add"); 
                                                  tr_copy.find(".action .use").html("Use");
                          //tr_copy.find(".action .btn-green").html("Add");
                          tr_copy.find(".action .add").click(_.bind(me.addToTargetRecipients,me));
                                                  tr_copy.find(".action .use").click(_.bind(me.loadTarget,me));
                                                  var match = null;
                                                  $("#targets_grid tbody").find("tr").each(function(){
                                                          if($(this).attr("id") == before_id){
                                                                  match = $(this);
                                                                  return false;
                                                          }
                                                  });
                                                  if(match)
                                                          tr_copy.insertBefore(match);
                                                  else
                                                     $("#targets_grid tbody").append(tr_copy);
                          /*if(before_id){
                              tr_copy.insertBefore(me.$("#targets_grid #"+before_id));
                          }
                          else{
                              tr_copy.appendTo(me.$("#targets_grid tbody"));
                                                          alert(me.$("#list_grid tbody"));
                          }*/
                          tr_copy.fadeIn("fast");
                      });
                                          var oldcount = this.$el.find("#trecpcount span").text();
                                          var newval = tr_obj.find("td:nth-child(2) div.subscribers").text();
                                          var totalcount = oldcount - newval;				   
                                          this.$el.find("#trecpcount span").text(totalcount);
                  },                
                showSalesForceCampaigns:function(){
                    var camp_obj =this;
                    var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=sfCampaignList"; 
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var camps_html = '<select data-placeholder="Choose a Salesforce Campaign..." class="chosen-select" id="sf_campaigns_combo" >';
                            camps_html += '<option value=""></option>';
                             var s_camps_json = jQuery.parseJSON(xhr.responseText);
                             if(camp_obj.app.checkError(s_camps_json)){
                                return false;
                             }
                             var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="sfcamp_list_grid"><tbody>';
                             $.each(s_camps_json.campList[0], function(index, val) {     
                                var _selected = (camp_obj.states.step1.sfCampaignID==val[0].sfCampaignID)?"selected=selected":"";
                                camps_html += '<option value="'+val[0].sfCampaignID+'" '+_selected+'>'+val[0].name+'</option>';
                                list_html += '<tr id="row_'+val[0].sfCampaignID+'">';                        
                                list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3> </td>';                  
                                var total_count = parseFloat(val[0].contactCount)+parseFloat(val[0].leadCount);
                                list_html += '<td><div class="subscribers show" style="width:60px"><span class=""></span>'+total_count+'</div><div id="'+val[0].sfCampaignID+'" class="action"><a class="btn-green use">Use</a></div></td>';                        
                                list_html += '</tr>';
                            });
                            list_html += '</tbody></table>';
                            camps_html +="</select>";
                            
                            //Setting salesforce campaigns in select box
                            camp_obj.$("#salesforce_campaigns").html(camps_html);
                            //Setting salesforce campaigns listing grid
                            camp_obj.$("#salesforce-camp-listing").html(list_html);   
                            
                            camp_obj.$el.find("#sfcamp_list_grid").bmsgrid({
                                    useRp : false,
                                    resizable:false,
                                    colresize:false,
                                    height:camp_obj.app.get('wp_height')-150,
                                    usepager : false,
                                    colWidth : ['100%','90px']
                            });
                            camp_obj.$("#sfcamp_list_grid tr td:nth-child(1)").attr("width","100%");
                            camp_obj.$("#sfcamp_list_grid tr td:nth-child(2)").attr("width","90px");
                            
                            camp_obj.$("#sfcamp_list_grid .action .use").click(function(){
                                camp_obj.$("#sfcamp_list_grid tr.selected").removeClass("selected");    
                                $(this).parents("tr").addClass("selected");
                            });
                            
                            camp_obj.$("#sf_campaigns_combo").chosen({no_results_text:'Oops, nothing found!'});
                            camp_obj.setSalesForceCombo(); 
                					                            
                        }
                    }).fail(function() { console.log( "error fetch sales force campaign" ); });  
                },
                saveResultToSF:function(){
                    var camp_obj =this;
                    var camp_id= this.camp_id;
                    if(this.validateRSF()){
                        var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');                        
                        this.$("#save_results_sf").addClass("saving");
                        $.post(URL, { campNum: camp_id,sfCampaignID: this.$("#sf_campaigns_combo").val() , add:'Y',type:"addToSaleforce"})
                        .done(function(data) {                            
                            camp_obj.$("#save_results_sf").removeClass("saving");
                            camp_obj.states.step1.hasResultToSalesCampaign = true;
                        });    
                    }                    
                },
                removeResultFromSF:function(){   
                    var camp_obj =this;
                    var camp_id= this.camp_id;
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                    if(this.states.step1.hasResultToSalesCampaign){                        
                        $.post(URL, { campNum: camp_id,add:'N',type:"addToSaleforce"})
                        .done(function(data) {                          
                            camp_obj.$("#campaign_add_to_salesforce").prop("checked",false);                            
                            camp_obj.states.step1.hasResultToSalesCampaign = false;
                            camp_obj.setSalesForceCombo();
                        });    
                    }
                },
                validateRSF:function(){
                    var isValid = true;
                    var option = {top:'20%'};
                        if(!$("#campaign_add_to_salesforce")[0].checked){
                            isValid = false;
                            this.app.showAlert('Please check "Enable Results to Salesforce campaign" checkbox',this.$(".accordion-group [id^='collapseOne']"),option);
                        }
                        else if(this.camp_id=="0"){
                            isValid = false;
                            this.app.showAlert('Please select a campaign.',this.$(".accordion-group [id^='collapseOne']"),option);
                        }
                        else if(this.$("#sf_campaigns_combo").val()==""){
                            isValid = false;
                            this.app.showAlert('Please select Salesforce campaign.',this.$(".accordion-group [id^='collapseOne']"),option);
                        }
                    return isValid;
                },
                setSalesForceCombo:function(){
                    if(this.states.step1.sf_checkbox){
                        this.$("#sf_campaigns_combo").prop("disabled",false).trigger("chosen:updated");
                    }
                    else{
                         this.$("#sf_campaigns_combo").val("").prop("disabled",true).trigger("chosen:updated");
                    }
                },
                setConversionPage:function(){
                    if(this.states.step1.pageconversation_checkbox){
                        this.$("#con_filter_field").prop("disabled",false);
                        this.$("#con_filter_combo").prop("disabled",false).trigger("chosen:updated");
                    }
                    else{
                       this.$("#con_filter_field").prop("disabled",true); 
                       this.$("#con_filter_combo").prop("disabled",true).val("#").trigger("chosen:updated");
                    }
                },
                validateConverionPage:function(){
                    var isValid = true;
                    var option = {top:'20%'};
                     if(!this.$("#conversion_filter")[0].checked){
                            isValid = false;       
                            this.app.showAlert('Please check "Enable Conversion filter" checkbox.',this.$(".accordion-group [id^='collapseTwo']"),option);
                        }
                        else if(this.camp_id==0){
                            isValid = false;
                            this.app.showAlert('Please select a campaign.',this.$(".accordion-group [id^='collapseTwo']"),option);
                        }
                        else if(this.$("#con_filter_field").val()==""){
                            isValid = false;
                            this.app.showAlert('Please provide text in URL.',this.$(".accordion-group [id^='collapseTwo']"),option);
                        }
                    return isValid;
                },
                saveConversionPage:function(){
                    var camp_obj =this;
                    var camp_id= this.camp_id;
					
                    if(this.validateConverionPage()){
                        var URL = "/pms/io/filters/saveLinkIDFilter/?BMS_REQ_TK="+this.app.get('bms_token');                        
                        this.$("#save_conversion_filter").addClass("saving");						
                        $.post(URL, { campNum: camp_id , 
                               rule:this.$("select#con_filter_combo").val(),
                               matchValue:this.$("#con_filter_field").val(),
                               type:"conversion"})
                        .done(function(data) {                          
                          camp_obj.$("#save_conversion_filter").removeClass("saving");
                            camp_obj.hasConversionFilter = true;
                        });    
                    }                    
                },
                removeConversionPage:function(){
                    var camp_obj =this;
                    var camp_id= this.camp_id;
                    
                    var URL = "/pms/io/filters/saveLinkIDFilter/?BMS_REQ_TK="+this.app.get('bms_token');
                    if(this.states.step1.hasConversionFilter){                        
                        $.post(URL, { campNum: camp_id ,
                               type:"delete"})
                        .done(function(data) {                          
                            camp_obj.$("#conversion_filter").prop("checked",false);
                            camp_obj.states.step1.hasConversionFilter = false;
                            camp_obj.setConversionPage();                            
                            
                        });    
                    }
                                        
                },
                showMergeFieldDialog:function(obj){                    
                    if(this.camp_id==0){
                        return false;
                    }
                    var btn = $.getObj(obj,"button");
                    var ele_offset = btn.offset();
                    var ele_width =  btn.width();
                    var ele_height =  btn.height();
                    var top = ele_offset.top + ele_height+11;
                    var left = ele_offset.left -  $(".mergefields").width() +ele_width+14 ;
                    var m_fields_box = $(".mergefields");
                    if(m_fields_box.css("display")=="block" && parseInt(m_fields_box.css("top"))==parseInt(top)){
                        m_fields_box.hide();
                    }
                    else{
                        $(".mergefields .browsefields").show();
                        $(".mergefields .browsefields").removeClass("mergefields_editor");
                        $(".mergefields .searchfields,#remove-merge-list").hide();
                        $("#merge_list_search").val("");
                        
                        m_fields_box.css({"top":top+"px","left":left+"px"}).show();
                        
                        var input_container = btn.parents("div.row").find("input[type='text']").attr("id");
                        m_fields_box.attr("input-source",input_container);
                        
                        if($(".merge-feilds-type li.active").length==0){
                            $(".merge-feilds-type li#mergefields_basic").click();
                        }
                    }
                    obj.stopPropagation();
                },
                createCalender:function(){
                     var transEndEventNames = {
                                    'WebkitTransition' : 'webkitTransitionEnd',
                                    'MozTransition' : 'transitionend',
                                    'OTransition' : 'oTransitionEnd',
                                    'msTransition' : 'MSTransitionEnd',
                                    'transition' : 'transitionend'
                            },
                            transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
                            $wrapper = $( '#custom-inner' ),
                            $calendar = $( '#calendar' ),
                            cal = $calendar.calendario( {
                                    onDayClick : function( $el, $contentEl, dateProperties ) {

                                            if( $contentEl.length > 0 ) {
                                                    showEvents( $contentEl, dateProperties );
                                            }

                                    },                                    
                                    displayWeekAbbr : true
                            } ),
                            $month = $( '#custom-month' ).html( cal.getMonthName() ),
                            $year = $( '#custom-year' ).html( cal.getYear() );

                    $( '#custom-next' ).on( 'click', function() {
                            cal.gotoNextMonth( updateMonthYear );
                    } );
                    $( '#custom-prev' ).on( 'click', function() {
                            cal.gotoPreviousMonth( updateMonthYear );
                    } );

                    function updateMonthYear() {				
                            $month.html( cal.getMonthName() );
                            $year.html( cal.getYear() );
                    }

                    // just an example..
                    function showEvents( $contentEl, dateProperties ) {

                            hideEvents();

                            var $events = $( '<div id="custom-content-reveal" class="custom-content-reveal"><h4>Campaigns for ' + dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year + '</h4></div>' ),
                                    $close = $( '<span class="icon close custom-content-close "></span>' ).on( 'click', hideEvents );

                            $events.append( $contentEl.html() , $close ).insertAfter( $wrapper );

                            setTimeout( function() {
                                    $events.css( 'top', '0%' );
                            }, 25 );

                    }
                    function hideEvents() {

                            var $events = $( '#custom-content-reveal' );
                            if( $events.length > 0 ) {

                                    $events.css( 'top', '100%' );
                                    Modernizr.csstransitions ? $events.on( transEndEventName, function() { $( this ).remove(); } ) : $events.remove();

                            }

                    }
                },
                mergeFieldsSetup:function(){
                    $(".mergefields .merge-feilds-type li").click(_.bind(this.showMergeFields,this));
                    $(".mergefields").keyup(_.bind(this.searchMergeFields,this));
                    $("#remove-merge-list").click(function(){
                        $("#merge_list_search").val("");
                        $(".mergefields .searchfields,#remove-merge-list").hide();
                        $(".mergefields .browsefields").show();
                        $(".mergefields  .searchfields .searchlist li").show();
                    });
                },
                showMergeFields:function(obj){
                    var li = $.getObj(obj,"li");
                    var camp_obj = this;                   
                    
                    if(!li.hasClass("active")){
                        var type = li.attr("id").split("_")[1];
                        var fields = this.mergeTags[type];
                        var fields_html = "<ul>";
                        $.each(fields,function(key,val){
                            fields_html +="<li mergeval='"+val[0]+"'>"+val[1]+"<a class='append-merge-field'>Insert</a></li>";
                        });
                        fields_html += "</ul>";
                        
                        $(".browsefields .searchlist").html(fields_html);
                        $(".merge-feilds-type li.active").removeClass("active");
                        li.addClass("active");
                                                                        
                        $(".append-merge-field").click(function(){
                           var active_ws = $(".ws-content.active"); 
                           var merge_field = $(this).parents("li").attr("mergeval");
                           var input_field = $(this).parents(".mergefields").attr("input-source");
                           if(input_field!=="campaign_subject"){
                            active_ws.find("#"+input_field).val(merge_field);
                           }
                           else{
                               var caretPos = active_ws.find("#"+input_field)[0].selectionStart;
                               var textAreaTxt = active_ws.find("#"+input_field).val();
                               active_ws.find("#"+input_field).val(textAreaTxt.substring(0, caretPos) + merge_field + textAreaTxt.substring(caretPos) ); 
                           }
                           active_ws.find("#"+input_field+"_default").fadeIn("fast");
                           camp_obj.states.step1.change = true;
                           $(".mergefields").hide();
                        });
                    }
                },
                searchMergeFields:function(obj){
                    var searchterm = $(obj.target).val();
                    if(searchterm.length){
                        var camp_obj = this;
                        $(".mergefields .searchfields,#remove-merge-list").show();                                                       
                        $(".mergefields .browsefields").hide();
                        $(".mergefields .searchfields .searchlist li").hide();
                        searchterm = searchterm.toLowerCase();
                        $(".mergefields .searchfields .searchlist li").filter(function() {                                                               
                             return $(this).find("div").text().toLowerCase().indexOf(searchterm) > -1;
                         }).show();
                         $(".mergefields .searchfields .searchlist li").removeHighlight().highlight(searchterm);
                    }
                    else{
                        $(".mergefields .searchfields .searchlist li").removeHighlight();
                        $(".mergefields .searchfields,#remove-merge-list").hide();
                        $(".mergefields .browsefields").show();
                        $(".mergefields  .searchfields .searchlist li").show();                        
                    }
                },
                setFooterArea:function(){
                    this.$("#campaign_footer_text").prop("disabled",!this.$("#campaign_isFooterText")[0].checked)                                            
                },
                step2SlectSource:function(target_li){
                    this.$(".step2 #choose_soruce li").removeClass("selected");
                    this.$(".step2 .soruces").hide();  
                    this.$(".step2 #area_"+target_li.attr("id")).fadeIn("fast");
                    target_li.addClass("selected");
                    switch(target_li.attr("id")){
                        case 'use_template':
                                this.loadTemplates();
                                //this.loadTemplateTags();
                                //this.loadTemplates('search','all',{callback:_.bind(this.loadTemplateAutoComplete,this)});
                                this.attachEvents();
                                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                            break;
                         case 'html_editor':
                                 this.setEditor();
                                 tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(this.states.step2.htmlText,true));                                 
                         break;
                        default:
                            break;
                    }
                    
                },
                loadTemplateAutoComplete:function(results){
                     var templates_array = [];
                     var map = {};
                     $.each(results.templates[0], function(index, val) { 
                         templates_array.push(val[0].name);//{"name":val[0].name,"tags":val[0].tags});
                         map[val[0].name] = {"name":val[0].name,"tags":val[0].tags};
                     });
                     this.$("#search-template-input").typeahead({
                            source: templates_array,                            
                            highlighter: function (item) {
                               var regex = new RegExp( '(' + this.query + ')', 'gi' );
                               return item.replace( regex, "<strong>$1</strong>" ) +  "<div><b>Tags:</b> "+map[item].tags.replace( regex, "<strong>$1</strong>" )+"</div>";
                            },
                             matcher: function (item) {
                                if (map[item].name.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1 || map[item].tags.toLowerCase().indexOf(this.query.trim().toLowerCase()) != -1) {
                                    return true;
                                }
                            },
                            items:8,                             
                            minLength:2
                        });
                    //$('#camp_tag_text').typeahead({source: camp_obj.tags_common,items:10})
                },
                attachEvents:function(){
                    if(this.states.step2.events===false){
                        var camp_obj = this;
                        this.$("#search-popular-tags").click(function(e){
                            e.stopPropagation();
                        });
                        this.$("#search-popular-tags").keyup(_.bind(this.searchTemplateTags,this))
                        this.$("#template_search_menu li").click(_.bind(this.searchTemplate,this));
                        this.$("#template_layout_menu li").click(_.bind(this.searchTemplateLayout,this));
                        this.$("#search-template-input").keyup(_.bind(this.searchTemplateNameTag,this));
                        this.$("#search-template-input").keydown(_.bind(this.searchNameTagVal,this));
                        this.$("#search-text-btn").click(_.bind(this.searchTemplateNameTagFromButton,this));
                        this.$("#remove-template-tag-list").click(function(){
                            $(this).hide();
                             camp_obj.$("#search-popular-input").val('');
                             camp_obj.$("#popular_template_tags li").show();  
                        })
                        this.$(".search-template-div input[type='checkbox']").prop("disabled",true);
                        this.states.step2.events = true;
                        
                        $(window).scroll(_.bind(this.liveLoading,this));
                        $(window).resize(_.bind(this.liveLoading,this));
                    }
                },
                liveLoading:function(){
                    var $w = $(window);
                    var th = 200;
                    var inview = this.$("#area_use_template .thumbnails li:last-child").filter(function() {
                        var $e = $(this),
                            wt = $w.scrollTop(),
                            wb = wt + $w.height(),
                            et = $e.offset().top,
                            eb = et + $e.height();

                        return eb >= wt - th && et <= wb + th;
                      });
                    if(inview.length && inview.attr("data-load")){
                       inview.removeAttr("data-load");
                       this.$(".footer-loading").show();
                       this.callTemplates(this.states.step2.searchString); 
                    }  
                },
                loadTemplateTags:function(){
                    var camp_obj = this;
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=allTemplateTags";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                           if(xhr && xhr.responseText){                                                       
                                var tags_template_json = jQuery.parseJSON(xhr.responseText);                                                                                               
                                if(camp_obj.app.checkError(tags_template_json)){
                                    return false;
                                 }
                                var tags = tags_template_json.tags.split(",");
                                var p_tags_html = "";
                                $.each(tags,function(key,val){
                                    p_tags_html +="<li><a >"+val+"</a></li>";
                                });
                                camp_obj.$("#popular_template_tags").html(p_tags_html);
                                camp_obj.$("#popular_template_tags").click(_.bind(camp_obj.searchTemplateByTags,camp_obj));
                           }
                     }).fail(function() { console.log( "error in loading popular tags for templates" ); });
                },
                searchTemplateLayout:function(obj){
                    var li = $.getObj(obj,"li");
                    if(!li.hasClass("active")){
                         this.$("#search-template-input").val('');
                         this.$("#template_layout_menu li,#template_search_menu li").removeClass("active");                                                  
                         var searchType = "layout";
                         var layout_id = li.find("a").attr("type");
                         this.loadTemplates('search',searchType,{layout_id:layout_id});
                         li.addClass("active");
                    }
                    
                },
                searchNameTagVal:function(obj){
                    var _input = $.getObj(obj,"input");
                    this.states.step2.searchValue = $.trim(_input.val());
                },
                searchTemplateNameTag:function(obj){
                    var _input = $.getObj(obj,"input");
                    var val = $.trim(_input.val());
                    
                        if(this.states.step2.searchValue!=val){
                            this.$("#template_layout_menu li,#template_search_menu li").removeClass("active");                                                  
                            //this.$("#search-template-input").prop("disabled",true);                        
                            this.states.step2.getTemplateCall.abort();
                            if(val!==""){
                                this.loadTemplates('search','nameTag',{text:val});
                            }
                            else{
                                this.$("#template_search_menu li:first-child").click();
                            }
                        }
                    
                    
                },
                searchTemplateNameTagFromButton:function(){
                    var val = $.trim(this.$("#search-template-input").val());
                    if(val!==""){
                        this.$("#template_layout_menu li,#template_search_menu li").removeClass("active");                                                  
                        //this.$("#search-template-input").prop("disabled",true);                        
                        this.loadTemplates('search','nameTag',{text:val});
                    }
                },
                searchTemplateTags:function(obj){
                    var input_field = $.getObj(obj,"input");
                    var searchterm = $.trim(input_field.val());
                    if(searchterm!==""){
                        this.$("#popular_template_tags li").hide();                                                                                                       
                        this.$("#remove-template-tag-list").show();
                        searchterm = searchterm.toLowerCase();
                        this.$("#popular_template_tags li").filter(function() {                                                               
                             return $(this).find("a").text().toLowerCase().indexOf(searchterm) > -1;
                         }).show();
                    }
                    else{
                        this.$("#remove-template-tag-list").hide();
                        this.$("#popular_template_tags li").show();  
                    }
                },
                searchTemplateByTags:function(obj){
                    var li = $.getObj(obj,"li");                   
                    var tag_text = li.find("a").text();                    
                    this.loadTemplates('search','tag',{text:tag_text});
                },
                searchTemplate:function(obj){
                    var li = $.getObj(obj,"li");
                    if(!li.hasClass("active")){
                        this.$("#search-template-input").val('');
                        this.$("#template_search_menu li,#template_layout_menu li").removeClass("active");
                        var searchType = li.find("a").attr("search");                        
                        li.addClass("active");
                        this.loadTemplates('search',searchType);                       
                    }
                },
                loadTemplates:function(search,searchType,options){
                    var camp_obj = this;
                    if(!this.states.step2.templates || search){
                        this.$(".step2 .thumbnails").children().remove();                        
                        this.app.showLoading('Loading Templates....',this.$(".step2 .template-container"));
                        if(camp_obj.$("#template_search_menu li.active").length){
                            var text = (this.$("#template_search_menu li.active").attr("text-info").toLowerCase().indexOf("templates")>-1)?"":this.$("#template_search_menu li.active").attr("text-info").toLowerCase();
                            this.$("#total_templates").html("<img src='img/recurring.gif'> "+text+" templates");                         
                        }
                        else{
                            this.$("#total_templates").html("<img src='img/recurring.gif'> templates");                         
                        }
                        
                        var searchString = "&type=search&searchType=recent";
                        if(search && searchType){
                            searchString = "&type=search&searchType="+searchType;
                            if(options && options.layout_id){
                                searchString +="&layoutId="+options.layout_id;
                            }
                            else if(options && options.text){
                                searchString +="&searchText="+options.text;
                            }
                        }
                        this.states.step2.offset = 0;
                        this.states.step2.totalcount = 0;
                        this.states.step2.searchString = searchString;
                        this.callTemplates(searchString,options);
                    }
                    else{
                        this.drawTemplates();
                    }
                },
                callTemplates:function(searchString,options){
                    var camp_obj = this;
                    var offset = this.states.step2.offset==0?0:this.states.step2.offset;
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+this.app.get('bms_token')+searchString+"&offset="+offset+"&bucket=12"; //&offset=0&bucket=20                                            
                    this.states.step2.getTemplateCall = jQuery.getJSON(URL,  function(tsv, state, xhr){
                       if(xhr && xhr.responseText){                        
                           camp_obj.app.showLoading(false,camp_obj.$(".step2 .template-container"));
                            var templates_json = jQuery.parseJSON(xhr.responseText);                                                                                               
                            if(camp_obj.app.checkError(templates_json)){
                                return false;
                             }                            
                            camp_obj.states.step2.templates = templates_json;
                            if(options && options.callback){
                                options.callback(templates_json);
                            }
                            //camp_obj.$("#search-template-input").prop("disabled",false).val("");
                            if(camp_obj.states.step2.totalcount==0){
                               camp_obj.states.step2.totalcount =  templates_json.totalCount;
                            }
                            camp_obj.drawTemplates();
                            camp_obj.states.step2.offset = camp_obj.states.step2.offset + parseInt(templates_json.count); 
                       }
                     }).fail(function() { console.log( "error in loading templates" ); });
                }
                ,
                drawTemplates:function(){
                    var templates =  this.states.step2.templates.templates;
                    var vars = [], hash;
                    var camp_obj = this;
                    var templates_html = "";
                     if(this.$("#template_search_menu li.active").length){
                        var text = (this.$("#template_search_menu li.active").attr("text-info").toLowerCase().indexOf("templates")>-1)?"":(this.$("#template_search_menu li.active").attr("text-info").toLowerCase()+" ");  
                        this.$("#total_templates").html(this.states.step2.totalcount+" <b>"+text+"</b> templates found");                         
                    }
                    else if(this.states.step2.searchString.indexOf("=nameTag")>-1){
                        this.$("#total_templates").html(this.states.step2.totalcount+" templates found <b>for '"+$.trim(this.$("#search-template-input").val())+"'</b>");                         
                    }    
                    else if(this.states.step2.searchString.indexOf("=tag")>-1){                        
                        var hashes = this.states.step2.searchString.split('&');                               
                        for(var i = 0; i < hashes.length; i++)
                        {
                            hash = hashes[i].split('=');
                            vars.push(hash[0]);
                            vars[hash[0]] = hash[1];
                        }
                        this.$("#total_templates").html(this.states.step2.totalcount+" templates found <b>for tag '"+vars["searchText"]+"'</b>");                         
                    }
                    else{
                        this.$("#total_templates").html(this.states.step2.totalcount +" templates");
                    }
                    if(templates){                        
                        $.each(templates[0], function(index, val) { 
                                templates_html +='<li class="span3">';
                                templates_html +='<div class="thumbnail">';
                                if(val[0].isFeatured==='Y'){
                                    templates_html +='<div class="feat_temp showtooltip" title="Featured Template"></div>';
                                }                                
                                if(val[0].isAdmin==='Y'){
                                    templates_html +='<div class="template-type builticon showtooltip"  title="Stock Template"></div>';
                                }
                                templates_html +='<div class="img"><div><a class="btn-green select-template" id="temp_'+val[0]["templateNumber.encode"]+'"><span class="plus">+</span>Select Template</a><a href="" class="btn-blue"><span class="icon view"></span>Preview Template</a></div><img alt="" data-src="holder.js"  src="img/templateimg.png"></div>';
                                templates_html +='<div class="caption">';
                                templates_html +='<h3><a>'+val[0].name+'</a></h3>';
                                templates_html +='<p>'+camp_obj.app.showTags(val[0].tags)+'</p>';
                                templates_html +='<div class="btm-bar">';
                                templates_html +='<span><em>'+val[0].usageCount+'</em> <span class="icon view showtooltip" title="View Count"></span></span>';
                                templates_html +='<span><em>'+val[0].viewCount+'</em> <span class="icon mail showtooltip"  title="Used Count"></span></span>';
                                templates_html +='<a class="icon temp'+val[0].layoutID+' layout-footer right showtooltip" l_id="'+val[0].layoutID+'" title="Layout '+val[0].layoutID+'"></a>';
                                templates_html +='</div></div> </div></li>';                      
                        });
                    }
                    
                    if(templates_html==="" && this.states.step2.offset==0){                        
                        this.$(".no-templates").show();
                    }
                    else{
                        this.$(".no-templates").hide();     
                        var template_html = $(templates_html);
                        this.$(".step2 .thumbnails").append(template_html);                        
                       template_html.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false}); 
                       template_html.find(".view").click(_.bind(function(){
                            this.$("#template_search_menu li:nth-child(4)").click();
                        },this));
                        template_html.find(".mail").click(_.bind(function(){
                            this.$("#template_search_menu li:first-child").click();
                        },this));
                        template_html.find(".layout-footer").click(_.bind(function(obj){
                            var target = $.getObj(obj,"a");                            
                            this.$("#template_layout_menu li").eq(parseInt(target.attr("l_id"))).click();
                        },this));
                        template_html.find(".template-type").click(_.bind(function(obj){
                            var target = $.getObj(obj,"div");                           
                        },this));                        
                        template_html.find(".feat_temp").click(_.bind(function(obj){
                             this.$("#template_search_menu li:nth-child(3)").click();   
                        },this));
                        
                        template_html.find(".caption p a").click(_.bind(function(obj){
                             var tag = $.getObj(obj,"a");
                             this.$("#template_layout_menu li,#template_search_menu li").removeClass("active");                                                  
                             this.loadTemplates('search','tag',{text:tag.text()});  
                        },this));
                        
                        template_html.find(".select-template").click(_.bind(function(obj){
                              this.setEditor();
                              var target = $.getObj(obj,"a");
                              var bms_token =this.app.get('bms_token');
                              this.app.showLoading('Loading HTML...',$(".fullwindow.campaign-content"));
                              this.states.editor_change = true;
                              var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+bms_token+"&type=html&templateNumber="+target.attr("id").split("_")[1];                              
                              jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));
                              
                        },this));
                    }
                    if((this.states.step2.offset + parseInt(this.states.step2.templates.count))<parseInt(this.states.step2.totalcount)){
                        this.$(".step2 .thumbnails li:last-child").attr("data-load","true");
                    }
                    
                    if(this.states.step2.searchString.indexOf("=nameTag")>-1){
                        this.$(".step2 .thumbnails .caption").highlight($.trim(this.$("#search-template-input").val()));
                    }    
                    else if(this.states.step2.searchString.indexOf("=tag")>-1){
                        this.$(".step2 .thumbnails .caption p").highlight(vars["searchText"]);
                    }
                    this.$(".footer-loading").hide();
                    
                },
                copyCampaign:function(obj){
                    this.setEditor();
                    var target = $.getObj(obj,"div");
                    var bms_token =this.app.get('bms_token');
                    this.states.editor_change = true;
                    this.app.showLoading('Loading HTML...',$(".fullwindow.campaign-content"));
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+bms_token+"&campNum="+target.attr("id")+"&type=basic";                    
                    jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));
                },
                setEditor:function(){
                  this.bmseditor.showEditor();   
                  var active_ws = this.$el.parents(".ws-content");
                  active_ws.find(".camp_header").addClass("workspace-fixed-editor");                                                
                  tinyMCE.get('bmseditor_'+this.wp_id).setContent("");
                },
                setEditorHTML:function(tsv, state, xhr){
                    this.app.showLoading(false,$(".fullwindow.campaign-content"));
                    var html_json = jQuery.parseJSON(xhr.responseText);
                    if(html_json.htmlText){
                        tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(html_json.htmlText,true));
                    }
                    
                },
                step3SlectSource:function(target_li){                    
                    switch(target_li.attr("id")){
                        case 'create_target':
                            if(!this.$("#c_c_target").data("filters")){
                                this.$("#c_c_target").filters({app:this.app});
                            }
                            else{
                                this.$("#c_c_target").data("filters").initFilters();
                                this.states.step3.target_id = 0;
                                this.showHideTargetTitle(true,true);
                            }
                            this.$("#targets_tags").tags({app:this.app,
                                    url:'/pms/io/filters/saveTargetInfo/?BMS_REQ_TK='+this.app.get('bms_token'),
                                    params:{type:'tags',filterNumber:'',tags:''}
                                });
                        break;
                        case 'salesforce_import':
                            this.setSalesForceWiz()
                        break;
                        case 'netsuite_import':
                            this.setNetSuiteeWiz()
                        break;
                        default:
                            break;
                    }
               },
               saveTarget:function(obj){                   
                   var camp_obj = this;
                   var target_name_input =  $(obj.target).parent().find("input");                       
                   var target_head = $(obj.target).parents("div.targt");
                   var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&filterFor=C";
                   if(target_name_input.val()!==""){

                     if(this.states.step3.target_id){
                        $(obj.target).addClass("saving");                         
                        $.post(URL, { type: "newName",filterName:target_name_input.val(),filterNumber:this.states.step3.target_id })
                          .done(function(data) {                              
                              var target_json = jQuery.parseJSON(data);                              
                              if(target_json[0]!=="err"){
                                 target_head.find("#target_name_text").show(); 
                                 target_head.find("#target_name_text span").html(target_name_input.val());                                                                                                 
                                 target_head.find("#target_name_edit").hide();
                                 camp_obj.app.showMessge("Target Renamed");
                              }
                              else{                                  
                                  camp_obj.app.showAlert(target_json[1],camp_obj.$el.parents(".ws-content.active"));
                                  
                              }
                              $(obj.target).removeClass("saving");                              
                         }); 
                     }
                     else{                         
                         $(obj.target).addClass("saving");
                         $.post(URL, { type: "create",filterName:target_name_input.val() })
                          .done(function(data) {                              
                              var camp_json = jQuery.parseJSON(data);                              
                              if(camp_json[0]!=="err"){
                                 target_head.find("#target_name_text").show(); 
                                 target_head.find("#target_name_text span").html(target_name_input.val());
                                 camp_obj.states.step3.target_id = camp_json[1];
                                 if(camp_obj.$("#targets_tags").data("tags")){
                                    camp_obj.$("#targets_tags").data("tags").setObjectId("filterNumber",camp_json[1]);
                                 }
                                 target_head.find("#target_name_edit").hide();
                                 camp_obj.app.showMessge("Target Created");
                                                                  
                              }
                              else{
                                  camp_obj.app.showAlert(camp_json[1],camp_obj.$el.parents(".ws-content.active"));
                              }
                              $(obj.target).removeClass("saving");                              
                         });
                     }
                   }                      
                    obj.stopPropagation();
               },
               showHideTargetTitle:function(show,isNew){
                   if(show){
                       this.$(".step3 .targt #target_name_text").hide();
                       this.$(".step3 .targt #target_name_edit").show();
                       if(isNew){
                           this.$(".step3 .targt #target_name_text span").html('');
                           this.states.step3.target_id = 0;
                       }
                       this.$(".step3 .targt #target_name_edit input").val(this.$(".step3 .targt #target_name_text span").html());
                   }
                   else{
                       this.$(".step3 .targt #target_name_text").show();
                       this.$(".step3 .targt #target_name_edit").hide();                       
                   }
               },
               deleteTarget:function(){
                   var camp_obj = this;
                   if(confirm('Are you sure you want to delete this target?')){
                        var URL = '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
                        camp_obj.app.showLoading("Deleting...",camp_obj.$el.parents(".ws-content.active"));
                        $.post(URL, {type:'delete',filterNumber:this.states.step3.target_id})
                        .done(function(data) {                                 
                               var del_target_json = jQuery.parseJSON(data);  
                               if(camp_obj.app.checkError(del_target_json)){
                                      return false;
                               }
                               if(del_target_json[0]!=="err"){
                                   camp_obj.app.showMessge("Target Deleted");                                   
                                   camp_obj.showHideTargetTitle(true,true);
                               }                               
                               camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content.active"));
                       });
                    }
               },
               saveTargetFilter:function(){
                   var target_id = this.states.step3.target_id;
                   if(target_id){
                       var camp_obj = this;
                       var post_data = "";
                        if(camp_obj.$("#targets_tags").data("tags")){
                           post_data = camp_obj.$("#c_c_target").data("filters").saveFilters();
                        }
                        camp_obj.app.showLoading("Saving Target...",camp_obj.$el.parents(".ws-content.active"));                        
                        var URL = '/pms/io/filters/saveTargetInfo/?BMS_REQ_TK='+this.app.get('bms_token')+post_data;
                        $.post(URL, {type:'update',filterNumber:target_id})
                        .done(function(data) {                                 
                            camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content.active"));                        
                            var target_json = jQuery.parseJSON(data);  
                            if(camp_obj.app.checkError(target_json)){
                                   return false;
                            }   
                            
                            if(target_json[0]!=="err"){
                                camp_obj.app.showMessge("Target has been updated");
                            }
                            else{
                                camp_obj.app.showAlert(false,camp_obj.$el.parents(".ws-content.active"));
                            }
                            
                       });
                   }
                   else{
                       this.app.showAlert("Please create a target first!",this.$el.parents(".ws-content.active"));
                   }
               },
               loadTarget:function(obj){
                   var target_obj = $.getObj(obj,"div");
                   var target_id = target_obj.attr("id");
                   var camp_obj = this;
                   this.$("#create_target").click();
                   var URL = '/pms/io/filters/getTargetInfo/?BMS_REQ_TK='+this.app.get('bms_token')+'&type=get&filterNumber='+target_id;
                   camp_obj.app.showLoading("Loading Target...",camp_obj.$el.parents(".ws-content"));
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));
                        var selected_target = jQuery.parseJSON(xhr.responseText);
                         if(camp_obj.app.checkError(selected_target)){
                             return false;
                         }
                         if(selected_target){
                             camp_obj.states.step3.target_id = selected_target["filterNumber.encode"];
                             camp_obj.$(".step3 .targt #target_name_text span").html(selected_target.name);
                             camp_obj.showHideTargetTitle(false);
                             camp_obj.$("#targets_tags").tags({app:camp_obj.app,
                                url:'/pms/io/filters/saveTargetInfo/?BMS_REQ_TK='+camp_obj.app.get('bms_token'),
                                params:{type:'tags',filterNumber:selected_target["filterNumber.encode"],tags:''}
                                ,showAddButton:true,
                                tags:selected_target.tags
                             });
                             var filters = camp_obj.$("#c_c_target").data("filters")
                             if(filters){
                                 filters.loadFilters(selected_target);
                             }
                         }
                                                     
                    });
               },
               setSalesForceWiz:function(){
                    var salesforce_setting = this.app.getAppData("salesfocre");
                    var self = this;
                    if(salesforce_setting.isSalesforceUser=="Y"){
                        this.$("#salesforce_welcome").hide();
                        this.$("#salesforce_login").hide();
                        this.$("#salesforce_mapping").hide();
                        this.$("#salesforce_setup").show();
                    }
                    else{
                        this.$("#salesforce_welcome").show();
                        this.$("#salesforce_mapping").hide();
                        this.$("#salesforce_login").hide();
                        this.$("#salesforce_setup").hide();
                    }
                    if(!this.states.step3.salesforce){
                        this.$("#campaign_salesforce").chosen({width: "290px",disable_search: "true"}).change(function(){
                            $(this).val($(this).val())
                            $(this).trigger("chosen:updated")
                            var camp_saleforce = $(this).val();
                            if(camp_saleforce=="campaign"){
                                self.$("#salesforce_setup .salesforce_campaigns").slideDown("fast");
                                self.$("#salesforce_setup .salesforce_after_filter").hide();
                                self.$("#salesforce_setup .salesforce_all_leads_contants").hide();
                                self.$("#salesforce_setup  .sf_lcdd").hide();
                                self.$("#salesforce_setup #salesforce-camp-search").show();
                            }
                            else if(camp_saleforce=="filter"){
                                self.$("#salesforce_setup .salesforce_campaigns").hide();
                                self.$("#salesforce_setup .salesforce_after_filter").slideDown("fast");
                                self.$("#salesforce_setup .salesforce_all_leads_contants").hide();                                
                                self.$("#salesforce_setup #salesforce-camp-search").hide();
                                if(self.$("#salesforce_setup .salesforce_after_filter").children().length==0){
                                    //Loading after filter view
                                    self.app.showLoading("Loading Filters...",self.$(".salesforce_after_filter"));  
                                    require(["crm/salesforce/after_filter"],function(afterFilter){
                                        self.app.showLoading(false,self.$(".salesforce_after_filter"));  
                                        var afilter = new afterFilter({app:self.app});
                                        afilter.$el.css("margin","10px 0px");
                                        self.$(".salesforce_after_filter").append(afilter.$el);
                                        self.$("#salesforce_setup  .sf_lcdd").show();
                                    }); 
                                }
                                else{
                                    self.$("#salesforce_setup  .sf_lcdd").show();
                                }
                            }
                            else if(camp_saleforce=="all"){
                                self.$("#salesforce_setup .salesforce_campaigns").hide();
                                self.$("#salesforce_setup .salesforce_after_filter").hide();
                                self.$("#salesforce_setup .salesforce_all_leads_contants").slideDown("fast");
                                self.$("#salesforce_setup  .sf_lcdd").hide();
                                self.$("#salesforce_setup #salesforce-camp-search").hide();
                                
                                //Get total count
                                self.$("#salesforce_setup .salesforce_all_leads_contants .sf_ccount,#salesforce_setup .salesforce_all_leads_contants .sf_lcount").html('<div class="loading-wheel-inline"></div>')
                                var URL = '/pms/io/salesforce/getData/?BMS_REQ_TK='+self.app.get('bms_token')+'&type=allCount';
                                jQuery.getJSON(URL,  function(tsv, state, xhr){
                                    var total_count = jQuery.parseJSON(xhr.responseText);
                                    self.$("#salesforce_setup .salesforce_all_leads_contants .sf_ccount").html(total_count.contactCount);
                                    self.$("#salesforce_setup .salesforce_all_leads_contants .sf_lcount").html(total_count.leadCount);
                                })
                            }
                        })
                        this.$("#salesforce_import_type").chosen({width: "190px",disable_search: "true"}).change(function(){
                            var filter_type = $(this).val();
                            if(filter_type=="lead"){
                                self.$(".salesforce_after_filter .lead-accordion").show();
                                self.$(".salesforce_after_filter .contact-accordion").hide();
                            }
                            else if(filter_type=="contact"){
                                self.$(".salesforce_after_filter .lead-accordion").hide();
                                self.$(".salesforce_after_filter .contact-accordion").show();
                            }
                            else if(filter_type=="both"){
                                self.$(".salesforce_after_filter .lead-accordion").show();
                                self.$(".salesforce_after_filter .contact-accordion").show();
                            }
                            $(this).val($(this).val());
                            $(this).trigger("chosen:updated");
                        })
                        this.$("#salesforce-camp-search").searchcontrol({
                            id:'salesforce-camp-search',
                            width:'300px',
                            height:'22px',
                            placeholder: 'Search Salesforce Campaign',
                            gridcontainer: 'sfcamp_list_grid',
                            showicon: 'no',
                            iconsource: 'campaigns'
                        });
                        this.states.step3.salesforce=true;
                        this.$("#sf_setting_menu li").click(_.bind(function(obj){
                            var target_obj = $.getObj(obj,"li");
                            if(target_obj.attr("id")=="sf_mapping"){
                                var dialog = this.app.showDialog({title:' Specify Leads or/and Contacts to Import',
                                                                css:{"width":"1200px","margin-left":"-600px"},
                                                                bodyCss:{"min-height":"430px"},
                                                                buttons: {saveBtn:{text:'Save Mapping'} }  
                                  });
                                
                                this.app.showLoading("Loading Mapping...",dialog.getBody());                                  
                                require(["crm/salesforce/mapping"],function(mappingPage){                                     
                                     var mPage = new mappingPage({camp:self});
                                     dialog.getBody().html(mPage.$el);
                                     dialog.saveCallBack(_.bind(mPage.saveCall,mPage));
                                });
                                
                            }
                            else if(target_obj.attr("id")=="sf_user_setting"){                                
                                
                                var dialog = this.app.showDialog({title:'Salesforce Login Setup',
                                                                  css:{"width":"650px","margin-left":"-325px"},
                                                                  bodyCss:{"min-height":"360px"}
                                    });
                                this.app.showLoading("Loading Login...",dialog.getBody());                                                                      
                                require(["crm/salesforce/login"],function(loginPage){                                        
                                    var lPage = new loginPage({camp:self});
                                    dialog.getBody().html(lPage.$el);
                                })
                                
                            }
                        },this))
                     }
                     else{
                        this.$("#sfcamp_list_grid tr.selected").removeClass("selected");    
                        if(this.$("#salesforce_setup .salesforce_after_filter .lead-filter").length){
                            this.$("#salesforce_setup .salesforce_after_filter .lead-filter").data("crmfilters").initFilters();
                            this.$("#salesforce_setup .salesforce_after_filter .contact-filter").data("crmfilters").initFilters();
                        }
                        this.$("#campaign_salesforce").val("campaign").trigger("chosen:updated").change(); 
                        this.$("#salesforce_import_type").val("lead").trigger("chosen:updated").change(); 
                     }
               },
               saveSalesForceDetails:function(){
                   var camp_obj = this;
                   var salesforce_val = this.$("#campaign_salesforce").val();    
                   var post_data = {type:'import',synchType:'recipients',campNum:this.camp_id};
                   var URL = "/pms/io/salesforce/setData/?BMS_REQ_TK="+this.app.get('bms_token');
                   if(salesforce_val=="campaign"){
                       var select_sCamp = this.$("#salesforce_setup .salesforce_campaigns #sfcamp_list_grid tr.selected")
                       if(select_sCamp.length===1){
                            post_data['filterType']= "campaign";
                            post_data['sfCampaignId']= select_sCamp.attr("id").split("_")[1];                            
                       }
                       else{
                           this.app.showAlert('Please select a salesforce campaign to proceed.',$("body"),{fixed:true});
                           return false;
                       }
                   }
                   else if(salesforce_val=="filter"){
                       var importType = this.$("#salesforce_import_type").val();
                       post_data['filterType']= "filter";
                       post_data['sfObject'] = importType;                       
                       var leadPost = $("#salesforce_setup .salesforce_after_filter .lead-filter").data("crmfilters").saveFilters('lead');
                       var contactPost= $("#salesforce_setup .salesforce_after_filter .contact-filter").data("crmfilters").saveFilters('contact');
                       if(importType=="lead"){
                        $.extend(post_data,leadPost)
                       }
                       else if(importType=="contact"){
                        $.extend(post_data,contactPost)
                       }
                       else if(importType=="both"){
                         $.extend(post_data,leadPost)
                         $.extend(post_data,contactPost)
                         
                       }
                       
                   }
                   else if(salesforce_val=="all"){
                       post_data['filterType']= "all";                       
                   }                   
                   $.post(URL,post_data)
                    .done(function(data) {                              
                        var camp_json = jQuery.parseJSON(data);                              
                        if(camp_json[0]!=="err"){                           
                           camp_obj.app.showMessge("Saved Successfully!");
                        }
                        else{                                  
                            camp_obj.app.showAlert(camp_json[1],$("body"),{fixed:true});
                        }                        
                   }); 
               },
               setNetSuiteeWiz:function(){
                   var netsuite_setting = this.app.getAppData("netsuite");
                    if(netsuite_setting.isNetsuiteUser=="Y"){
                        this.$("#netsuite_login").hide();
                        this.$("#netsuite_mapping").hide();
                        this.$("#netsuite_welcome").hide();
                        this.$("#netsuite_setup").show();                        
                    }
                    else{
                       this.$("#netsuite_login").hide();
                        this.$("#netsuite_welcome").show(); 
                        this.$("#netsuite_setup").hide();
                        this.$("#netsuite_mapping").hide();
                   }
                   var self = this;
                   if(!this.states.step3.netsuite){     
                       this.loadNetSuiteGroup();
                       this.$("#groups_netsuite").chosen({width: "290px",disable_search: "true"}).change(function(){
                         $(this).val($(this).val())
                         $(this).trigger("chosen:updated")  
                         if($(this).val()=="group"){
                            self.$("#netsuite_setup .netsuite_groups").slideDown("fast"); 
                            self.$("#netsuite_setup .netsuite_after_filter").hide(); 
                            self.$("#netsuite_setup  .sf_lcdd,#netsuite_setup  .customer-type").hide();
                            self.$("#netsuite_setup #netsuite-group-search").show();
                                                                                    
                         }
                         else if($(this).val()=="filter"){
                             self.$("#netsuite_setup .netsuite_after_filter").slideDown("fast"); 
                             self.$("#netsuite_setup .netsuite_groups").hide(); 
                             
                             self.$("#netsuite_setup #netsuite-group-search").hide();
                             if(self.$("#netsuite_setup .netsuite_after_filter").children().length==0){
                                self.app.showLoading("Loading Filters...",self.$(".netsuite_after_filter"));  
                                require(["crm/netsuite/after_filter"],function(afterFilter){
                                   self.app.showLoading(false,self.$(".netsuite_after_filter"));  
                                   var afilter = new afterFilter({app:self.app});
                                   afilter.$el.css("margin","10px 0px");
                                   self.$(".netsuite_after_filter").append(afilter.$el);
                                   self.$("#netsuite_setup  .sf_lcdd").show();
                                   if(self.$("#netsuite_import_type").val()=="customer"){
                                        self.$("#netsuite_setup  .customer-type").show();
                                    }
                               }); 
                            }
                            else{
                                self.$("#netsuite_setup  .sf_lcdd").show();
                                if(self.$("#netsuite_import_type").val()=="customer"){
                                    self.$("#netsuite_setup  .customer-type").show();
                                }
                            }
                         }
                       })
                       this.$("#netsuite_import_type").chosen({width: "190px",disable_search: "true"}).change(function(){                           
                            $(this).val($(this).val());
                            $(this).trigger("chosen:updated");
                            if($(this).val()=="customer"){
                                self.$("#netsuite_setup  .customer-type").show();
                                self.$(".netsuite_after_filter .customer-accordion").show();
                                self.$(".netsuite_after_filter .contact-accordion").hide();
                                self.$(".netsuite_after_filter .partner-accordion").hide();
                            }
                            else if($(this).val()=="contact"){
                                self.$("#netsuite_setup  .customer-type").hide();
                                self.$(".netsuite_after_filter .customer-accordion").hide();
                                self.$(".netsuite_after_filter .contact-accordion").show();
                                self.$(".netsuite_after_filter .partner-accordion").hide();
                            }
                            else if($(this).val()=="partner"){                                
                                 self.$("#netsuite_setup  .customer-type").hide();
                                 self.$(".netsuite_after_filter .customer-accordion").hide();
                                self.$(".netsuite_after_filter .contact-accordion").hide();
                                self.$(".netsuite_after_filter .partner-accordion").show();
                            }
                                
                       })
                       this.$("#netsuite_setup .customer-type button").click(function(){
                           $(this).find("input").prop("checked",!$(this).find("input").prop("checked"));
                       })
                       this.$("#netsuite-group-search").searchcontrol({
                            id:'netsuite-group-search',
                            width:'300px',
                            height:'22px',
                            placeholder: 'Search NetSuite Groups',
                            gridcontainer: 'nsgroup_list_grid',
                            showicon: 'no',
                            iconsource: 'campaigns'
                        });
                        
                        this.states.step3.netsuite=true;
                        
                        this.$("#ns_setting_menu li").click(_.bind(function(obj){
                            var target_obj = $.getObj(obj,"li");
                            if(target_obj.attr("id")=="ns_mapping"){
                                var dialog = this.app.showDialog({title:' Specify Customers, Contacts or/and Partners to Import',
                                                                css:{"width":"1200px","margin-left":"-600px"},
                                                                bodyCss:{"min-height":"430px"},
                                                                buttons: {saveBtn:{text:'Save Mapping'} }
                                  });
                                
                                this.app.showLoading("Loading Mapping...",dialog.getBody());                                  
                                require(["crm/netsuite/mapping"],function(mappingPage){                                     
                                     var mPage = new mappingPage({camp:self});
                                     dialog.getBody().html(mPage.$el);
                                     dialog.saveCallBack(_.bind(mPage.saveCall,mPage));
                                });
                                
                            }
                            else if(target_obj.attr("id")=="ns_user_setting"){                                
                                
                                var dialog = this.app.showDialog({title:'NetSuite Login Setup',
                                                                  css:{"width":"650px","margin-left":"-325px"},
                                                                  bodyCss:{"min-height":"360px"}
                                    });
                                this.app.showLoading("Loading Login...",dialog.getBody());                                                                      
                                require(["crm/netsuite/login"],function(loginPage){                                        
                                    var lPage = new loginPage({camp:self});
                                    dialog.getBody().html(lPage.$el);
                                })
                                
                            }
                        },this))
                   }
                   else{
                        this.$("#nsgroup_list_grid tr.selected").removeClass("selected");    
                        if(this.$("#netsuite_setup .netsuite_after_filter .customer-filter").length){
                            this.$("#netsuite_setup .netsuite_after_filter .customer-filter").data("crmfilters").initFilters();
                            this.$("#netsuite_setup .netsuite_after_filter .contact-filter").data("crmfilters").initFilters();
                            this.$("#netsuite_setup .netsuite_after_filter .partner-filter").data("crmfilters").initFilters();
                        }
                        this.$("#netsuite_import_type").val("customer").trigger("chosen:updated").change(); 
                        this.$("#groups_netsuite").val("group").trigger("chosen:updated").change();                         
                   }
               },
               loadNetSuiteGroup:function(){
                   var self = this;
                    this.app.showLoading("Loading Groups...",self.$("#netsuite_setup .netsuite_groups .template-container"));
                    URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=nsGroupList";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        self.app.showLoading(false,self.$("#netsuite_setup .netsuite_groups .template-container"));
                        var netsuite_groups = jQuery.parseJSON(xhr.responseText);
                        if(self.app.checkError(netsuite_groups)){
                            return false;
                        }
                        if(netsuite_groups[0]!=="err"){
                            if(netsuite_groups.count!="0"){
                                 var group_html = '<table cellpadding="0" cellspacing="0" width="100%" id="nsgroup_list_grid"><tbody>';
                                $.each(netsuite_groups.groupList[0], function(index, val) {                                              
                                   group_html += '<tr id="row_'+val[0].id+'">';                        
                                   group_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3> </td>';                  
                                   var total_count = 0;
                                   group_html += '<td><div class="subscribers show" style="width:60px"><span class=""></span>'+total_count+'</div><div id="'+val[0].id+'" class="action"><a class="btn-green use">Use</a></div></td>';                        
                                   group_html += '</tr>';
                               });
                               group_html += '</tbody></table>';                                       

                               //Setting netsuite group listing grid
                               self.$("#netsuite-group-listing").html(group_html);   

                               self.$el.find("#nsgroup_list_grid").bmsgrid({
                                       useRp : false,
                                       resizable:false,
                                       colresize:false,
                                       height:self.app.get('wp_height')-150,
                                       usepager : false,
                                       colWidth : ['100%','90px']
                               });
                               self.$("#nsgroup_list_grid tr td:nth-child(1)").attr("width","100%");
                               self.$("#nsgroup_list_grid tr td:nth-child(2)").attr("width","90px");

                               self.$("#nsgroup_list_grid .action .use").click(function(){
                                   self.$("#nsgroup_list_grid tr.selected").removeClass("selected");    
                                   $(this).parents("tr").addClass("selected");
                               });   
                            }
                        }
                        else{
                          self.app.showAlert(netsuite_groups[1],$("body"),{fixed:true});  
                        }
                    }).fail(function() { console.log( "error net suite group listing" ); });
               },
               saveNetSuiteDetails:function(){
                   var camp_obj = this;
                   var netsuite_val = this.$("#groups_netsuite").val();    
                   var post_data = {type:'import',synchType:'recipients',campNum:this.camp_id};
                   var URL = "/pms/io/netsuite/setData/?BMS_REQ_TK="+this.app.get('bms_token');
                   if(netsuite_val=="group"){
                       var select_sCamp = this.$("#netsuite_setup .netsuite_groups #nsgroup_list_grid tr.selected")
                       if(select_sCamp.length===1){
                            post_data['filterType']= "group";
                            post_data['nsGroupId']= select_sCamp.attr("id").split("_")[1];                            
                       }
                       else{
                           this.app.showAlert('Please select a netsuite group to proceed.',$("body"),{fixed:true});
                           return false;
                       }
                   }
                   else if(netsuite_val=="filter"){
                       var importType = this.$("#netsuite_import_type").val();
                       post_data['filterType']= "filter";
                       post_data['nsObject'] = importType;          
                       if(importType=="customer"){
                           var cust_val = $(".customer-type input:checked").map(function(){
                                            return $(this).val()
                                        }).toArray().join()
                           if(cust_val){
                               post_data['nsObject'] = cust_val;
                           }          
                           else{
                             this.app.showAlert('Please at least on option from Customer, Lead, Or Prospect',$("body"),{fixed:true});  
                             return false;
                           }
                       }
                       var customerPost = $("#netsuite_setup .netsuite_after_filter .customer-filter").data("crmfilters").saveFilters('customer');
                       var contactPost= $("#netsuite_setup .netsuite_after_filter .contact-filter").data("crmfilters").saveFilters('contact');
                       var partnerPost= $("#netsuite_setup .netsuite_after_filter .partner-filter").data("crmfilters").saveFilters('partner');
                       if(importType=="customer"){
                          $.extend(post_data,customerPost)
                       }
                       else if(importType=="contact"){
                          $.extend(post_data,contactPost)
                       }
                       else if(importType=="partner"){
                          $.extend(post_data,partnerPost)                                                  
                       }
                       
                   }
                  
                   $.post(URL,post_data)
                    .done(function(data) {                              
                        var camp_json = jQuery.parseJSON(data);                              
                        if(camp_json[0]!=="err"){                           
                           camp_obj.app.showMessge("Saved Successfully!");
                        }
                        else{                                  
                            camp_obj.app.showAlert(camp_json[1],$("body"),{fixed:true});
                        }                        
                   }); 
               }
               
                
        });
});
