define(['jquery.bmsgrid','jquery.calendario','jquery.chosen','jquery.icheck','jquery.searchcontrol','jquery.highlight','jquery-ui','text!html/campaign.html','views/common/editor','bms-tags','bms-filters','bms-mapping'],
function (bmsgrid,calendraio,chosen,icheck,bmsSearch,jqhighlight,jqueryui,template,editorView,bmstags,bmsfilters,Mapping) {

        'use strict';
        return Backbone.View.extend({
                id: 'step_container',                  
                events: {
                       "click .step3 #choose_soruce li":function(obj){
                           var target_li = obj.target.tagName=="LI" ? $(obj.target) : $(obj.target).parents("li");                           
                           if(target_li.hasClass("selected")) return false;
                           this.$(".step3 #choose_soruce li").removeClass("selected");
                           this.$(".step3 .soruces").hide();                           
                           this.$(".step3 #area_"+target_li.attr("id")).fadeIn("fast");                                                      
                           target_li.addClass("selected");						   
						   
                           this.step3SlectSource(target_li);
                      },
                      'click .step2 #choose_soruce li':function(obj){
                          var camp_obj = this;
                           var target_li =$.getObj(obj,"li"); 
                          if(this.$(".step2 #choose_soruce li.selected").length==0){
                                this.$(".step2 .selection-boxes").animate({width:"560px",margin:'0px auto'}, "medium",function(){
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
                      'click #save_conversion_filter':function(){
                          this.saveConversionPage();
                      },                      
                      'click #save_results_sf':function(){
                           this.saveResultToSF();
                       },
                      'click .mergefields-box' :function(obj){
                          this.showMergeFieldDialog(obj);
                      },
                      'change #campaign_isFooterText':function(){
                        this.setFooterArea();
                      },
                      'change .step1 input':function(){
                          this.states.step1.change = true;
                      },
                      'change .step1 select':function(){
                          this.states.step1.change = true;
                      },
                      'change .step1 textarea':function(){
                          this.states.step1.change = true;
                      },
                      'change .step2 #myhtml':function(){
                          this.states.editor_change = true;
                      }
                      ,
                      'click .step3 #addnew_target':function(){
                          //this.initCreateEditTarget();
						  this.createTarget();
                      },
                      'change .step3 select':function(){
                          this.states.step3.change=true;
                      },
                      'keydown .step3 input':function(){
                          this.states.step3.change=true;
                      },
                      'click .step3 a':function(){
                          this.states.step3.change=true;
                      }
                      ,
                      'click #btnSFLogin':function(){
                        var camp_obj = this;
                        var dialog = this.app.showDialog({title:'Salesforce Login Setup',
                                        css:{"width":"650px","margin-left":"-325px"},
                                        bodyCss:{"min-height":"360px"}
                        });
                        this.app.showLoading("Loading Login...",dialog.getBody());                                                                      
                        require(["crm/salesforce/login"],function(loginPage){                                        
                                var lPage = new loginPage({camp:self,app:camp_obj.app,dialog:dialog});
                                dialog.getBody().html(lPage.$el);
                        })
                        this.$("#salesforce_welcome").hide();
                        this.$("#salesforce_mapping").hide();
                        this.$("#salesforce_login").show();
                        this.$("#salesforce_setup").hide();
                        return false;
                      },
                      'click #btnNSLogin':function(){
                                var camp_obj = this;
                                var dialog = this.app.showDialog({title:'NetSuite Login Setup',
                                                css:{"width":"650px","margin-left":"-325px"},
                                                bodyCss:{"min-height":"360px"}
                                        });
                                this.app.showLoading("Loading Login...",dialog.getBody());
                                require(["crm/netsuite/login"],function(loginPage){                                        
                                        var lPage = new loginPage({camp:camp_obj,app:camp_obj.app,dialog:dialog});
                                        dialog.getBody().html(lPage.$el);
                                })
                                this.$("#netsuite_welcome").hide();
                                this.$("#netsuite_mapping").hide();
                                this.$("#netsuite_login").show();
                                this.$("#netsuite_setup").hide();
                                return false;
                      },
                      'click .scheduled-campaign':function(){
						  var camp_obj = this;
						  var mapdataview = camp_obj.states.step3.mapdataview;
						  if(mapdataview && mapdataview.isCampRunning == 'Y')
						  		camp_obj.app.showAlert('Your campaign is being scheduled please wait.',$(".ws-content"));                          		
							else
								this.scheduledCampaign('S',"Scheduling Campaign...");
                      },
                      'click .draft-campaign':function(obj){
                          var button = $.getObj(obj,"a")
                          if(button.hasClass("reschedule")){
                             //this.scheduledCampaign('D','Setting Campaign for reschedule...');
                             this.$(".schedule-camp").show();
                             this.$(".sch-made").hide();
                             this.$(".draft-campaign").hide();
                             this.$(".scheduled-campaign").show();
                          }
                          else  if(button.hasClass("edit")){
                             this.scheduledCampaign('D','Edit Campaign...'); 
                          }
                          else{
                              this.scheduledCampaign('D','Changing Campaign to Draft...');
                          }
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
                                        "step2":{"templates":false,htmlText:'',change:false},
                                        "step3":{"target_id":0,salesforce:false,netsuite:false,recipientType:"",recipientDetial:null,change:false,netsuitegroups:null,targetDialog:null,csvupload:null,mapdataview:null,tags:null,sf_filters:{lead:"",contact:""},ns_filters:{customer:"",contact:"",parnter:"",nsObject:""}},
                                        "step4":{"init":false,datetime:{day:0,month:0,year:0,hour:0,min:0,sec:0},cal:null,camp_status:'D'},
                                        "editor_change":false,
                                        "saleforce_campaigns":null
                                       };
                        this.bmseditor = new editorView({opener:this,wp_id:this.wp_id});
                        /*this.csvupload = new CSVUploadView({camp:this});
                        this.mapdataview = new MapDataView({camp:this});*/
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
                                placeholder: 'Search Campaigns',
                                gridcontainer: 'camp_list_grid',
                                showicon: 'yes',
                                iconsource: 'campaigns',
								countcontainer: 'copy_no_of_camps'
                         });
                         this.$el.find('div#listssearch').searchcontrol({
                                id:'list-search',
                                width:'300px',
                                height:'22px',
                                placeholder: 'Search Lists',
                                gridcontainer: 'list_grid',
                                showicon: 'yes',
                                iconsource: 'list'
                         });
						 this.$el.find('div#listrecpssearch').searchcontrol({
                                id:'list-recps-search',
                                width:'300px',
                                height:'22px',
                                placeholder: 'Search Recipients',
                                gridcontainer: 'recipients',
                                showicon: 'yes',
                                iconsource: 'list'
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
						 this.$el.find('div#targetrecpssearch').searchcontrol({
                                id:'target-recps-search',
                                width:'300px',
                                height:'22px',
                                placeholder: 'Search Recipients',
                                gridcontainer: 'recipients',
                                showicon: 'yes',
                                iconsource: 'target'
                         });
                        this.$el.find('div#targetsearch').searchcontrol({
                                id:'target-search',
                                width:'300px',
                                height:'22px',
                                placeholder: 'Search Targets',
                                gridcontainer: 'targets_grid',
                                showicon: 'yes',
                                iconsource: 'target'
                         });
                         this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                stepsCall:function(step){
                    var proceed = -1;
                    if(this.states.step4.camp_status==='D'){
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
                    }
                    return proceed;
                },
                removeCSVUpload: function(){
                    var camp_obj = this;
                    var csvupload = camp_obj.states.step3.csvupload
                    if(csvupload && csvupload.fileuploaded == true)
                    {					
                        csvupload.removeFile();
                        csvupload.$el.hide();
                        camp_obj.$el.find('#upload_csv').removeClass('selected');
                        camp_obj.states.step3.mapdataview.$el.hide();
                        camp_obj.states.step3.mapdataview.$el.find('#uploadslist').children().remove();
                        camp_obj.states.step3.mapdataview.$el.find('#newlist').val('');
                        camp_obj.states.step3.mapdataview.$el.find('#alertemail').val('');
                        camp_obj.app.showLoading(false,camp_obj.states.step3.mapdataview.$el);
                     }
                },
                init:function(){
                    //Load mergeFields
                    this.mergeFieldsSetup();                    
                    this.initHeader();
                    //
                    this.setupCampaign();
                    if(this.camp_id!="0"){
                        this.loadCampaign(this.camp_id);
                    }
                    else{
                        this.initCampaignTag('');
                        this.initCheckbox();
                    }
                    //Init Accoridions on first step
                    this.$( "#accordion" ).accordion({ active: 1, collapsible: true,activate: _.bind(function(){
                            this.$("#campaign_add_to_salesforce").prop("checked",this.states.step1.sf_checkbox)
                            
                    },this) });
                    this.$( "#accordion1" ).accordion({ active: 1, collapsible: true,activate:_.bind(function(){
                            this.$("#conversion_filter").prop("checked",this.states.step1.pageconversation_checkbox);
                    },this) });
                
                    //Init Edtior
                    this.$el.parents(".ws-content").append(this.bmseditor.$el);
                    this.bmseditor.initEditor({id:this.wp_id});
                    
                    //Init Chosen combo                    
                    this.$("#con_filter_combo").chosen({no_results_text:'Oops, nothing found!', width: "280px",disable_search: "true"});                                       
                    this.$("#campaign_unSubscribeType").chosen({no_results_text:'Oops, nothing found!', width: "290px",disable_search: "true"});
                    this.$("#campaign_unSubscribeType").chosen().change(_.bind(function(){
                        this.states.step1.change = true;
                        $(this).trigger("chosen:updated");
                    },this));                    
                    this.$("#campaign_from_email").chosen({no_results_text:'Oops, nothing found!', disable_search: "true"});
                    var camp_obj = this;
                    this.$("#campaign_from_email").chosen().change(function(){
                        camp_obj.fromNameSelectBoxChange(this)
                    });
                    this.$("#fromemail_default").chosen({no_results_text:'Oops, nothing found!', width: "67%",disable_search: "true"});
                    
                    this.$("#sf_campaigns_combo").chosen({no_results_text:'Oops, nothing found!', width: "280px",disable_search: "true"});                 
                    //Init icheck boxes                   

                },
                fromNameSelectBoxChange:function(obj){
                     var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                     if(merge_field_patt.test($(obj).val())){
                        this.$("#campaign_from_email_default").show();      
                     }
                     else{
                       this.$("#campaign_from_email_default").hide();  
                     }    
                },
                initCheckbox:function(){
                    this.$('input').iCheck({
                        checkboxClass: 'checkinput'
                     });
                     this.$('input.checkpanel').iCheck({
                         checkboxClass: 'checkpanelinput',
                         insert: '<div class="icheck_line-icon"></div>'
                     });
                     this.$( "ul.socialbtns li label " ).click(function() {
                        $(this).toggleClass( "btnchecked" );
                     });
                     
                     var camp = this;
                     this.$(".iCheck-helper").click(function(){
                         var icheck = $(this).parent().find("input");
                         if(icheck.attr("type")=="checkbox"){
                            var icheck_id = icheck.attr("id");
                            if(icheck_id=="campaign_isFooterText"){
                               camp.setFooterArea();
                            }
                            else if(icheck_id=="campaign_add_to_salesforce"){
                               camp.setSalesForceStep1(icheck); 
                            }
                            else if(icheck_id=="conversion_filter"){
                               camp.setCoversionPageStep1(icheck); 
                            }
                            else if(icheck_id=="campaign_fb" || icheck_id=="campaign_twitter" || icheck_id=="campaign_linkedin" || icheck_id=="campaign_pintrest" || icheck_id=="campaign_gplus"){
                                if( $(this).parent().next().hasClass("btnchecked")){
                                    $(this).parent().next().removeClass("btnchecked");
                                }
                                else{
                                   $(this).parent().next().addClass("btnchecked");
                                }
                            }                            
                         }
                         if(camp.wizard.active_step==1){
                             camp.states.step1.change = true;
                         }
                         
                     })
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
                    this.$("#camp_list_grid tr td:nth-child(4)").attr("width","132px");
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
						var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");			                        
                                                                        
                        if(merge_field_patt.test(camp_obj.app.decodeHTML(camp_json.fromEmail)))
                        {
                            var merge_field = camp_obj.app.decodeHTML(camp_json.fromEmail);                                
                            camp_obj.$("#campaign_from_email").prepend("<option value='"+merge_field+"'>"+merge_field+"</option");
                            camp_obj.$("#campaign_from_email").val(merge_field).trigger("chosen:updated")
                            camp_obj.$("#campaign_from_email_default").show();
                            camp_obj.$("#fromemail_default").val(camp_obj.app.decodeHTML(camp_json.defaultFromEmail)).trigger("chosen:updated");
                        }
                        else
                        {
                            camp_obj.$("#campaign_from_email").val(camp_obj.app.decodeHTML(camp_json.fromEmail)).trigger("chosen:updated");                                
                            camp_obj.$("#campaign_from_email_default").hide();                            
                        }
                        var subj_w = camp_obj.$el.find('#campaign_subject').width();
                        var fegb_w = camp_obj.$el.find('#fecol3').width();
                        camp_obj.$('#campaign_from_email_chosen').width(parseInt(subj_w-fegb_w)+25);
						
                        camp_obj.$("#campaign_from_name").val(camp_obj.app.decodeHTML(camp_json.senderName));                        
                        camp_obj.$("#campaign_reply_to").val(camp_obj.app.decodeHTML(camp_json.replyTo));                                                        
                        camp_obj.$("#campaign_footer_text").val(camp_json.footerText);
                        camp_obj.states.step2.htmlText = camp_json.htmlText;
                        
                        camp_obj.states.step3.recipientType = camp_json.recipientType;

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
                        if(camp_json.facebook=="Y"){
                            camp_obj.$("label[for='campaign_fb']").addClass("btnchecked");
                        }
                        camp_obj.$("#campaign_twitter").prop("checked",camp_json.twitter=="N"?false:true);
                        if(camp_json.twitter=="Y"){
                            camp_obj.$("label[for='campaign_twitter']").addClass("btnchecked");
                        }
                        camp_obj.$("#campaign_linkedin").prop("checked",camp_json.linkedin=="N"?false:true);
                        if(camp_json.linkedin=="Y"){
                            camp_obj.$("label[for='campaign_linkedin']").addClass("btnchecked");
                        }
                        camp_obj.$("#campaign_pintrest").prop("checked",camp_json.pinterest=="N"?false:true);
                        if(camp_json.pinterest=="Y"){
                            camp_obj.$("label[for='campaign_pintrest']").addClass("btnchecked");
                        }
                        camp_obj.$("#campaign_gplus").prop("checked",camp_json.googleplus=="N"?false:true);                        
                        if(camp_json.googleplus=="Y"){
                            camp_obj.$("label[for='campaign_gplus']").addClass("btnchecked");
                        }

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
						
                        if(camp_json.addToSFStatus=='Y'){                             
                             camp_obj.states.step1.hasResultToSalesCampaign = true;                             
                             camp_obj.$("#campaign_add_to_salesforce").prop("checked",true);                             
                             camp_obj.states.step1.sf_checkbox = true;
                             camp_obj.states.step1.sfCampaignID = camp_json.sfCampaignID;                             
                             if(camp_obj.states.saleforce_campaigns ===null)
                                camp_obj.showSalesForceCampaigns();
                             else
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
                            URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK="+bms_token+"&type=get&campNum="+camp_id;

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
                        camp_obj.initCheckbox();
                        
                        camp_obj.states.step4.camp_status = camp_json.status;
                        
                        camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));
                        
                    });  
                }
                ,
                initHeader:function(){
                  var previewIconCampaign = $('<a class="icon preview"></a>');  
                  var editIconCampaign = $('<a class="icon edit"></a>');
                  var deleteIconCampaign = $('<a class="icon delete"></a>');
                  var active_ws = this.$el.parents(".ws-content");
                  
                  var header_title = active_ws.find(".camp_header .edited  h2");
                  var action_icon = $('<div class="pointy"></div>")');
                  action_icon.append(editIconCampaign);
                  action_icon.append(previewIconCampaign);
                  action_icon.append(deleteIconCampaign);
                  header_title.append(action_icon); 
                  
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
                      active_ws.find(".camp_header .c-name h2,#campaign_tags").hide();
                      var text= active_ws.find("#workspace-header").html();                                            
                      active_ws.find(".camp_header .c-name .edited ").show();
                      active_ws.find("#header_wp_field").focus().val(text);  
                      e.stopPropagation();
                  });
                  active_ws.find("#workspace-header").click(function(e){
                      active_ws.find(".camp_header .c-name h2,#campaign_tags").hide();
                      var text= active_ws.find("#workspace-header").html();                                            
                      active_ws.find(".camp_header .c-name .edited ").show();
                      active_ws.find("#header_wp_field").focus().val(text);  
                      e.stopPropagation();
                  });
                  var camp_obj = this;
                  previewIconCampaign.click(function(e){
                       if(camp_obj.states.step2.htmlText!==""){                           
                            var dialog_width = $(document.documentElement).width()-60;
                            var dialog_height = $(document.documentElement).height()-182;
                            var dialog = camp_obj.app.showDialog({title:'Campaign Preview',
                                      css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                      headerEditable:false,
                                      bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                            var preview_iframe = $("<iframe class=\"email-iframe\" style=\"height:"+dialog_height+"px\" frameborder=\"0\" src=\"about:blank\"></iframe>");                            
                            dialog.getBody().html(preview_iframe);
                            preview_iframe[0].contentWindow.document.open('text/html', 'replace');
                            preview_iframe[0].contentWindow.document.write(camp_obj.app.decodeHTML(camp_obj.states.step2.htmlText,true));
                            preview_iframe[0].contentWindow.document.close();
                        }
                       e.stopPropagation();     
                  })
                  var camp_obj = this;
                  deleteIconCampaign.click(function(){
                      //if(confirm('Are you sure you want to delete this campaign?')){
                        camp_obj.app.showAlertDetail({heading:'Confirm',
                        detail:'Are you sure you want to delete this campaign?',
                        login:'<div class="confalert-buttons"><a class="btn-green left btn-ok">Ok</a><a class="btn-gray left btn-cancel">Cancel</a></div>'},
                        camp_obj.$el.parents(".ws-content.active"));
                        $(".overlay .btn-ok").click(function(){
                                $(".overlay").remove();
                               camp_obj.deleteCampaign(camp_obj.camp_id);
                        });
                      //}
                  });
                                    
                },
                deleteCampaign: function(camp_id) {
                        var camp_obj = this;
                        var active_ws = this.$el.parents(".ws-content");
                        var URL = '/pms/io/campaign/saveCampaignData/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
                        camp_obj.app.showLoading("Deleting Campaign...",camp_obj.$el.parents(".ws-content.active"));
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
				},
                initStepCall:function(stepNo){
                    if(this.camp_id!==0){
                        switch (stepNo){                                                            
                            case 'step_2':
                                this.initStep2();
                                break;                                
                            case 'step_3':
                                this.initStep3();
                                break;
                            case 'step_4':
                                this.initStep4();
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
                initStep3:function(){
                    if(this.states.step3.recipientType)
					{
                        var source_li = "choose_lists";
                        if(this.states.step3.recipientType.toLowerCase()=="list"){
                            source_li = "choose_lists";
                        }
                        else if(this.states.step3.recipientType.toLowerCase()=="target"){
                            source_li = "choose_targets";
                        }
						else if(this.states.step3.recipientType.toLowerCase()=="tags"){
                            source_li = "choose_tags";
                        }
                        else if(this.states.step3.recipientType.toLowerCase()=="salesforce"){
                            source_li = "salesforce_import";
                        }
                        else if(this.states.step3.recipientType.toLowerCase()=="netsuite"){
                            source_li = "netsuite_import";
                        }
                        this.$(".step3 #"+source_li).click();
                    }
                },
                initStep4:function(){
                    if(this.states.step4.init===false){                        
                        this.$("#accordion_info").accordion({ collapsible: false,heightStyle: "fill"});
                        this.$("#accordion_recipients").accordion({ collapsible: false});
                        this.createCalender();                                
                        this.states.step4.datetime['day'] = this.states.step4.cal.today.getDate();
                        this.states.step4.datetime['month'] = this.states.step4.cal.today.getMonth()+1 
                        this.states.step4.datetime['year'] = this.states.step4.cal.today.getFullYear();
                        var hour = this.states.step4.cal.today.getHours();
                        var min = this.states.step4.cal.today.getMinutes();
                        if(hour>=12){
                            var hour = hour-12;                            
                            this.$(".timebox-hours button.pm").addClass("active");
                        }
                        else{
                            this.$(".timebox-hours button.am").addClass("active");
                        }
                        
                        hour = hour==0 ? "12":hour;                        
                                                
                        this.$(".timebox-hour").spinner({max: 12,min:1,start: function( event, ui ) {
                                
                        }});
                        this.$(".timebox-min").spinner({max: 59,min:0,stop: function( event, ui ) {
                               if($(this).val().length==1){
                                   $(this).val("0"+$(this).val())
                               }
                        }});
                        this.$(".timebox-hour").val(hour);
                        this.$(".timebox-min").val(min.toString().length==1?("0"+min):min);
                        
                        this.$(".gotostep3").click(_.bind(function(){
                            this.wizard.back();
                        },this))
                        this.$(".gotostep2").click(_.bind(function(){
                            this.wizard.back();
                            this.wizard.back();
                        },this))
                        this.$(".gotostep1").click(_.bind(function(){
                            this.wizard.back();
                            this.wizard.back();
                            this.wizard.back();							
                        },this))
                        this.states.step4.init = true;
                    }
                    this.setScheduleArea();
                    this.$("#campaign_preview_subject").html(this.$("#campaign_subject").val());
                    this.$("#campaign_preview_fromEmail").html(this.app.encodeHTML(this.$("#campaign_from_email").val()));
					if(this.$("#fromemail_default").val() != '' && this.$('#campaign_from_email_default').css('display') == 'block')
					{
						this.$("#femail_default").show();
						this.$("#campaign_preview_fromEmail_default").html(this.app.encodeHTML(this.$("#fromemail_default").val()));
					}
                    this.$("#campaign_preview_defaultSenderName").html(this.app.encodeHTML(this.$("#campaign_from_name").val()));
					if(this.$("#campaign_default_from_name").val() != '')
					{
						this.$("#fromname_default").show();
						this.$("#campaign_preview_sendername_default").html(this.$("#campaign_default_from_name").val());
					}
                    this.$("#campaign_preview_defaultReplyTo").html(this.app.encodeHTML(this.$("#campaign_reply_to").val()));
					if(this.$("#campaign_default_reply_to").val() != '')
					{
						this.$("#replyto_default").show();
						this.$("#campaign_preview_replyto_default").html(this.$("#campaign_default_reply_to").val());
					}
                    
                    var settings_field = this.$(".step1-settings .inputlabel");
                    var settings_html = "",recipients_html="";
                    $.each(settings_field,function(){
                        if($(this).find("input").attr("id")!=="campaign_isFooterText"){
                            if($(this).find("input").prop("checked")){
                                settings_html += '<div  class="row fluidlabel"><label class="checked">'+$(this).find("label").text()+'</label></div>'
                            }
                        }
                    })
                    if(this.$("#campaign_isFooterText").prop("checked")){
                        settings_html += '<div class="row fluidlabel" style="margin:15px 0 0;"><label class=""><strong>Company and Physical Address in email footer:</strong></label>';
                        settings_html += ' <p class="clearfix">'+this.$("#campaign_footer_text").val()+'</p>'
                        settings_html += '</div>';
                    }
                    var camp_obj =this;
                    recipients_html = '<div  class="row fluidlabel"><label class="checked">Selected Recipient Type is "'+this.states.step3.recipientType+'"</label></div>'
                    this.$(".recipients-inner").html(recipients_html);
                    this.$(".settings-inner").html(settings_html+"<div class='clearfix'></div>");
					var i = 0;
                    this.$(".step1 .socialbtns li").each(function(){
                        var checked = $(this).find("input").prop("checked");
                        if(checked){
                            camp_obj.$(".step4 .socialbtns li."+ $(this)[0].className).show();
							i++;
                        }
                        else{
                            camp_obj.$(".step4 .socialbtns li."+ $(this)[0].className).hide();
                        }
                    });
					if(i == 0)
						this.$('.social_accord').hide();
					else
						this.$('.social_accord').show();
                    if(this.$("#campaign_add_to_salesforce").prop("checked")){
                        this.$(".sf-camp-info").show();
                        this.$(".sf-camp-info .text").html('<img width="18" title="Salesforce" src="img/sficon.png" alt="" class="left"/> &nbsp;&nbsp;'+this.$("#sf_campaigns_combo option:selected").text())
                    }
                    else{
                       this.$(".sf-camp-info").hide();                        
                    }
                    if(this.$("#conversion_filter").prop("checked")){
                        this.$(".conversion-page-info").show();
						var filter = this.$("#con_filter_combo").val() == 'ct' ? 'Contains' : 'Equal to';
                        this.$(".conversion-page-info .text").html('Text in URL <strong>'+ filter + ' ' + this.$("#con_filter_field").val()+'</strong>');   
                    }
                    else{
                        this.$(".conversion-page-info").hide();                           
                    }
					if(this.$("#campaign_add_to_salesforce").prop("checked") || this.$("#conversion_filter").prop("checked"))
						this.$(".other_accord").show();
					else
						this.$(".other_accord").hide();
                    this.$("#email-preview")[0].contentWindow.document.open('text/html', 'replace');
                    this.$("#email-preview")[0].contentWindow.document.write(this.app.decodeHTML(this.states.step2.htmlText,true));
                    this.$("#email-preview")[0].contentWindow.document.close();
                },
                setScheduleArea:function(){
                    if(this.states.step4.camp_status!=='D'){
                        this.$(".draft-campaign").show();
                        this.$(".scheduled-campaign").hide();
                    }
                    else{
                        this.$(".draft-campaign").hide();
                        this.$(".scheduled-campaign").show();
                    }
                },
                setupCampaign:function(){
                  var active_ws = this.$el.parents(".ws-content");
                  if(this.camp_id===0){                      
                      active_ws.find(".camp_header .c-name h2,.camp_header  #campaign_tags").hide();                      
                      active_ws.find(".camp_header .c-name .edited ").show();                      
                      active_ws.find("#camp_tags").children().remove();                                          
                      active_ws.find("#header_wp_field").focus().val('');
                      //active_ws.find(".step-contents").find("input,select,textarea").prop("disabled",true);
                      active_ws.find("#campMenu").prop("disabled",false);
                  }
                  else{
                       active_ws.find(".camp_header .c-name .edited").hide();                        
                       active_ws.find(".camp_header .c-name h2,.camp_header  #campaign_tags").show();                        
                       active_ws.find("#header_wp_field").focus().attr("process-id",this.camp_id);  
                       active_ws.find(".step-contents").find("input,select,textarea").prop("disabled",false);
                       this.setFooterArea();
                       this.setSalesForceCombo();
                       this.setConversionPage();
                  }  
                },
                saveCampaign:function(obj){                                      
                    var camp_obj = this;
                    var camp_name_input =  $(obj.target).parents(".edited").find("input");                       
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
                                 camp_obj.app.removeCache("campaigns");
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
                                 camp_obj.app.removeCache("campaigns");
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
                    var app = camp_obj.app;
                    var proceed = -1;                   
                    var errorHTML = "";                    					
                    var isValid = true;
                    var el = camp_obj.$el;
                    var defaultSenderName = "",defaultReplyToEmail="";
                    var replyto = el.find('#campaign_reply_to').val();
                    var email_addr = el.find('#campaign_default_reply_to').val();                    
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
					
                    if(el.find('#campaign_subject').val() == '')
					{
					   /*var options = {
							'control':el.find('#campaign_subject'),
							'valid_icon':el.find('#subject_erroricon'),
							'message':camp_obj.app.messages[0].CAMP_subject_empty_error,
							'controlcss':'border:solid 2px #FB8080;'
						};
						app.enableValidation(options);*/
						app.showError({
							control:el.find('.subject-container'),
							message:camp_obj.app.messages[0].CAMP_subject_empty_error
						});
						isValid = false;
					}
					else if(el.find('#campaign_subject').val().length > 100)
					{
						/*var options = { 
							'control':el.find('#campaign_subject'),
							'valid_icon':el.find('#subject_erroricon'),
							'message':camp_obj.app.messages[0].CAMP_subject_length_error,
							'controlcss':'border:solid 2px #FB8080;'
						};
						app.enableValidation(options);*/
						app.showError({
							control:el.find('.subject-container'),
							message:camp_obj.app.messages[0].CAMP_subject_empty_error
						});
						isValid = false;
				   }
				   else
				   {
						/*var options = {
						 'control':el.find('#campaign_subject'),
						 'valid_icon':el.find('#subject_erroricon'),
						 'customfield':el.find('.input-append .subject-group')};
						 app.disableValidation(options);*/
						 app.hideError({control:el.find(".subject-container")});
					}
					if(el.find('#campaign_from_name').val() == '')
					{
						/*var options = {'control':el.find('#campaign_from_name'),
							'valid_icon':el.find('#fromname_erroricon'),
							'message':camp_obj.app.messages[0].CAMP_fromname_empty_error,
							'controlcss':'border:solid 2px #FB8080;'
						  };
						app.enableValidation(options);*/
						app.showError({
							control:el.find('.fname-container'),
							message:camp_obj.app.messages[0].CAMP_fromname_empty_error
						});
						isValid = false;
					}
					else
					{
						/*var options = {'control':el.find('#campaign_from_name'),
						'valid_icon':el.find('#fromname_erroricon'),
						'customfield':el.find('.input-append .fromname-group')
						};
						app.disableValidation(options);*/
						app.hideError({control:el.find(".fname-container")});
					}
				   	if(this.$('#campaign_from_name_default').css('display') == 'block' && this.$('#campaign_default_from_name').val()=="")
					{                           
						/*var options = {'control':this.$('#campaign_default_from_name'),
						'valid_icon':el.find('#defaultfromname_erroricon'),
						'message':camp_obj.app.messages[0].CAMP_defaultfromname_empty_error,
						'controlcss':'border:solid 2px #FB8080;'};
						app.enableValidation(options);*/
						app.showError({
							control:el.find('.fnamedefault-container'),
							message:camp_obj.app.messages[0].CAMP_defaultfromname_empty_error
						});
						isValid = false;
					}
					else
					{
						/*var options = {'control':el.find('#campaign_default_from_name'),
									   'valid_icon':el.find('#defaultfromname_erroricon')
									  };
						app.disableValidation(options);*/
						app.hideError({control:el.find(".fnamedefault-container")});
					}	
					if(replyto !== '' && !merge_field_patt.test(replyto) && !app.validateEmail(replyto))
					{
						/*var options = {'control':el.find('#campaign_reply_to'),
						'valid_icon':el.find('#replyto_erroricon'),
						'message':camp_obj.app.messages[0].CAMP_replyto_format_error,
						'controlcss':'border:solid 2px #FB8080;'
						};
						app.enableValidation(options);*/
						app.showError({
							control:el.find('.replyto-container'),
							message:camp_obj.app.messages[0].CAMP_replyto_format_error
						});
						isValid = false;
					}
					else
					{
						/*var options = {'control':el.find('#campaign_reply_to'),
							'valid_icon':el.find('#replyto_erroricon'),
							'customfield':el.find('.input-append .replyto-group')
						   };
						app.disableValidation(options);*/
						app.hideError({control:el.find(".replyto-container")});
					}
					if(el.find('#campaign_reply_to_default').css('display') == 'block' && email_addr == '')
					{
						/*var options = {'control':el.find('#campaign_default_reply_to'),
						'valid_icon':el.find('#email_erroricon'),
						'message':camp_obj.app.messages[0].CAMP_defaultreplyto_empty_error,
						'controlcss':'border:solid 2px #FB8080;'};
						app.enableValidation(options);*/
						app.showError({
							control:el.find('.replyemail-container'),
							message:camp_obj.app.messages[0].CAMP_defaultreplyto_empty_error
						});
						isValid = false;
					}
					else if(el.find('#campaign_reply_to_default').css('display') == 'block' && !app.validateEmail(email_addr))
					{                           
						/*var options = {'control':el.find('#campaign_default_reply_to'),
						'valid_icon':el.find('#email_erroricon'),
						'message':camp_obj.app.messages[0].CAMP_defaultreplyto_format_error,
						'controlcss':'border:solid 2px #FB8080;'};
						app.enableValidation(options);*/
						app.showError({
							control:el.find('.replyemail-container'),
							message:camp_obj.app.messages[0].CAMP_defaultreplyto_format_error
						});
						isValid = false;
					}
					else
					{
						/*var options = {'control':el.find('#campaign_default_reply_to'),
									   'valid_icon':el.find('#email_erroricon')
									  };
						app.disableValidation(options);*/
						app.hideError({control:el.find(".replyemail-container")});
					}	
                        
						
                    if(!isValid)
                    {                            											
                    	proceed = 0;
                    }
                    else
                    {   
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        defaultSenderName = merge_field_patt.test(this.$('#campaign_from_name').val())?this.$("#campaign_default_from_name").val():"";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        defaultReplyToEmail = merge_field_patt.test(this.$('#campaign_reply_to').val())?this.$("#campaign_default_reply_to").val():"";
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        var fromEmail = this.$('#campaign_from_email').val();
			var fromEmailMF = merge_field_patt.test(fromEmail) ? this.$('#fromemail_default').val():"";
                        if(proceed!==0 && (this.states.step1.change || this.camp_id==0)){
                                this.app.showLoading("Saving Step 1...",this.$el.parents(".ws-content"));
                                var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                                $.post(URL, { type: "saveStep1",campNum:this.camp_id,
                                        subject : this.$("#campaign_subject").val(),
                                        senderName :this.$("#campaign_from_name").val(),
                                        fromEmail : fromEmail,
                                        defaultFromEmail : fromEmailMF,
                                        defaultSenderName :defaultSenderName,
                                        replyTo :this.$("#campaign_reply_to").val(),
                                        defaultReplyToEmail :defaultReplyToEmail,
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
                  if(this.states.step3.change===false){
                      return -1;
                  }
                  var source = this.$(".step3 #choose_soruce li.selected").attr("id");                    

                  if(source == "upload_csv")
                  {                        
                      this.saveCSVUpload();                    
                  }
                  else if(source=="choose_lists"){
                      var lists = this.saveLists();
                       if(!lists){
                           return false;
                       }   
                       this.step3SaveCall({'recipientType':'List',listNum:lists});
                  }
                  else if(source=="choose_targets"){
                       var targets = this.saveTargets();    
                       if(!targets){
                           return false;
                       }
                       this.step3SaveCall({'recipientType':'Target',filterNumber:targets});
                  }
                  else if(source=="choose_tags"){
                       var tagsView = this.states.step3.tags;
                      var tags = tagsView.saveTags();
                       if(!tags){
                           this.app.showAlert("Please select tag(s) to set recipients",$("body"),{fixed:true});
                           return false;
                       }
                       this.step3SaveCall({'recipientType':'Tags',tags:tags});
                  }
                  else if(source=="salesforce_import"){
                                          
                       this.step3SaveCall({'recipientType':'Salesforce'});
                  }
                  else if(source=="netsuite_import"){
                      this.step3SaveCall({'recipientType':'Netsuite'});
                       
                  }     
                  else{
                      this.app.showAlert('We are not currently supporting Tags',$("body"));                      
                  }     
                  //Save call step 3
                  return 1;
                },
                step3SaveCall:function(options){
                  var camp_obj = this; 
                  var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                  var no_list = "";
                  var post_data = {type:"recipientType",campNum:this.camp_id};                  
                  if(options){
                    $.each(options,function(key,val){
                        post_data[key] = val;
                    })
                  }
                  this.app.showLoading("Saving Step 3",this.$el.parents(".ws-content"));  
                  $.post(URL,post_data)
                   .done(function(data) {
                       var step3_json = jQuery.parseJSON(data);
                       camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));                       
                       if(step3_json[0]!=="err"){                           
                           camp_obj.states.step3.recipientType = post_data['recipientType'];
                           camp_obj.states.step3.change= false;
                           camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));
                           if(camp_obj.states.step3.recipientType=="Salesforce"){
                               camp_obj.saveSalesForceDetails();        
                           }
                           else if(camp_obj.states.step3.recipientType=="Netsuite"){
                               camp_obj.saveNetSuiteDetails();    
                           }
                           else{                               
                                camp_obj.wizard.next();
                                camp_obj.app.showMessge("Step 3 saved successfully!");                                                          
                           }
                       }
                       else{
                           camp_obj.app.showMessge(step3_json[0]); 
                       }
                  })
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
                    //Load Defaults 
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=campaignDefaults";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var defaults_json = jQuery.parseJSON(xhr.responseText);
                            if(camp_obj.app.checkError(defaults_json)){
                                return false;
                            }
                            camp_obj.$("#campaign_footer_text").val(camp_obj.app.decodeHTML(defaults_json.footerText));                          
                            camp_obj.$("#campaign_from_email").val(camp_obj.app.decodeHTML(defaults_json.fromEmail));
                            camp_obj.$("#campaign_from_name").val(camp_obj.app.decodeHTML(defaults_json.fromName));
                            var fromEmails = defaults_json.fromEmail;
                            if(defaults_json.optionalFromEmails)
                                    fromEmails += ',' + defaults_json.optionalFromEmails;
                            var fromEmailsArray = fromEmails.split(',');
                            var fromOptions = '';
                            for(var i=0;i<fromEmailsArray.length;i++)
                            {
                                if(fromEmailsArray[i] == defaults_json.fromEmail)
                                        fromOptions += '<option value="'+ fromEmailsArray[i] +'" selected="selected">'+fromEmailsArray[i] + '</option>';
                                else
                                        fromOptions += '<option value="'+ fromEmailsArray[i] +'">'+fromEmailsArray[i] + '</option>';
                            }
                            camp_obj.$el.find('#campaign_from_email').append(fromOptions);
                            camp_obj.$el.find('#fromemail_default').append(fromOptions);
                            camp_obj.$("#campaign_from_email").trigger("chosen:updated");
                            camp_obj.$('#fromemail_default').trigger("chosen:updated");
                                                        
                            
                            var subj_w = camp_obj.$el.find('#campaign_subject').width();                            
                            camp_obj.$el.find('#campaign_from_email_chosen').width(parseInt(subj_w-40));
                            
                            if(defaults_json.customFooter==""){
                                camp_obj.$("#campaign_useCustomFooter_div").hide();
                            }
                            else{
                                camp_obj.$("#campaign_useCustomFooter_div").show();
                                camp_obj.$("#campaign_custom_footer_text").val(camp_obj.app.decodeHTML(defaults_json.customFooter,true));
                            }
                        }
                    }).fail(function() { console.log( "error in detauls" ); });                    										
                                        
                    this.app.getData({
                        "URL":"/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status",
                        "key":"salesfocre",
                        "callback":_.bind(this.showSalesForceArea,this)
                    });
                    
                    URL = "/pms/io/getMetaData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=merge_tags";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText)
						{
                            var mergeFields_json = jQuery.parseJSON(xhr.responseText);                            
                            if(camp_obj.app.checkError(mergeFields_json)){
                                return false;
                            }
                            camp_obj.mergeTags['basic'] = [];
                            camp_obj.mergeTags['custom'] = [];
							camp_obj.mergeTags['salesRep'] = [];
                            $.each(mergeFields_json,function(key,val){
                                if(val[2]=="B"){
                                    camp_obj.mergeTags['basic'].push(val);
                                }
                                else if(val[2]=="C"){
                                    camp_obj.mergeTags['custom'].push(val);
                                }
								else if(val[2]=="S"){
                                    camp_obj.mergeTags['salesRep'].push(val);
                                }
                            });
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
                                    fields_html +="<li mergeval='"+val.code+"' rel='"+ val.type +"'><span>"+val.type+"</span><div>"+val.name+"</div><a class='search-merge-insert'>Insert</a></li>";                                        
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
                    }).fail(function() { console.log( "error merge fields json" ); });
                                                           
                                                                                                                        
                    $(".mergefields").click(function(e){
                        e.stopPropagation();
                    });
                    var wp_length = $(".ws-tabs li").length-1;                    
                                       
                },
                showSalesForceArea:function(){                    
                    var salesforce_setting = this.app.getAppData("salesfocre");					
                    if(salesforce_setting && salesforce_setting.isSalesforceUser=="Y"){
                        this.$("#add_result_salesforce").show();                        
                    }
                    else{
                        this.$("#add_result_salesforce").hide();
                    }  
                },
                createListTable:function(xhr){
                    var camp_obj=this;         
                    
                    this.$el.find("#recpcount span").text('0');
                    this.$el.find("#target-lists").children().remove();
                    var camp_list_json = this.app.getAppData("lists");
                    
                    camp_obj.$el.find('#area_choose_lists #target-lists .bmsgrid').remove();
                    camp_obj.$el.find("#area_choose_lists .col2 .bmsgrid").remove();
                    camp_obj.$el.find("#area_choose_lists").removeData("mapping");
					
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="list_grid"><tbody>';
                    camp_obj.$el.find(".list-count").html("Displaying <b>"+camp_list_json.count+"</b> lists");
                    $.each(camp_list_json.lists[0], function(index, val) {     
                        list_html += '<tr id="row_'+val[0]["listNumber.encode"]+'" checksum="'+val[0]["listNumber.checksum"]+'">';                        
                        list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+ camp_obj.app.showTags(val[0].tags) +'</div></div></td>';                        
                        list_html += '<td><div class="subscribers show" style="min-width:70px;"><span  class=""></span>'+val[0].subscriberCount+'</div><div id="'+val[0]["listNumber.encode"]+'" class="action"><a class="btn-green add move-row"><span>Use</span><i class="icon next"></i></a></div></td>';                        
                        list_html += '</tr>';
                    });
                    list_html += '</tbody></table>';										
					
                    this.$el.find("#target-lists").html(list_html);
                   
                    this.$el.find("#list_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:this.app.get('wp_height')-122,							
                            usepager : false,
                            colWidth : ['100%','90px']
                    });					                    
                    this.$("#list_grid tr td:first-child").attr("width","100%");
                    this.$("#list_grid tr td:last-child").attr("width","90px");	
                    this.$("#recipients-list").css("height",this.app.get('wp_height')-122);										
						
					this.$el.find(".taglink").click(_.bind(function(obj){
                            camp_obj.app.initSearch(obj,this.$el.find("#list-search"));
                    },this));
								
                    this.$el.find("#area_choose_lists").mapping({
                            gridHeight:this.app.get('wp_height')-122,
                            sumColumn: 'subscribers',
                            sumTarget: 'recpcount span',
                            loadTarget: ''
                    });
                    this.app.showLoading(false,camp_obj.$el.find('#area_choose_lists .leftcol'));		    	
                    if(this.states.step3.recipientType.toLowerCase()=="list"){
                        this.setRecipients();
                    }
                },
                setSalesForceStep1:function(obj){
                   if(obj.prop("checked")){ 
                    this.states.step1.sf_checkbox = true;
                    this.$("#campaign_add_to_salesforce").prop("checked",this.states.step1.sf_checkbox);
                    if(this.states.saleforce_campaigns ===null)
                        this.showSalesForceCampaigns();
                    this.$( "#accordion" ).accordion({ active: 0 });				
                  }
                  else{
                      this.removeResultFromSF();	
                      this.states.step1.sf_checkbox = false;
                      this.$("#campaign_add_to_salesforce").prop("checked",this.states.step1.sf_checkbox);
                      this.$( "#accordion" ).accordion({ active: false });                              
                  }
                  this.setSalesForceCombo();                                            
                },
                setCoversionPageStep1:function(obj){
                      if(obj.prop("checked")){                             
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
                          
                },
				createTargetsTable:function(){ 
                    var camp_obj=this;
                    this.$el.find("#trecpcount span").text('0');
                    this.$el.find("#targets").children().remove();
                    var targets_list_json = this.app.getAppData("targets");
                   		
                    camp_obj.$el.find('#area_choose_targets #targets .bmsgrid').remove();
                    camp_obj.$el.find("#area_choose_targets .col2 .bmsgrid").remove();
                    camp_obj.$el.find("#area_choose_targets").removeData("mapping");
					
                    var target_html = '<table cellpadding="0" cellspacing="0" width="100%" id="targets_grid"><tbody>';
                    //this.$el.find(".target-count").html("Displaying <b>"+targets_list_json.count+"</b> targets");
					
                    $.each(targets_list_json.filters[0], function(index, val) {					
                        target_html += '<tr id="row_'+val[0]["filterNumber.encode"]+'" checksum="'+val[0]["filterNumber.checksum"]+'">';                        
                        target_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+ camp_obj.app.showTags(val[0].tags) +'</div></div></td>';                        
                        target_html += '<td><div><div class="subscribers show" style="min-width:70px;"><span  class=""></span>'+val[0].filtersCount+'</div><div id="'+val[0]["filterNumber.encode"]+'" class="action"><a class="btn-green move-row"><span>Use</span><i class="icon next"></i></a><a id="'+val[0]["filterNumber.encode"]+'" class="btn-gray edit-action"><span>Edit</span><i class="icon edit"></i></a><a id="'+val[0]["filterNumber.encode"]+'" class="btn-blue copy-action"><span>Copy</span><i class="icon copy"></i></a></div></div></td>';                        
                        target_html += '</tr>';
                    });
                    target_html += '</tbody></table>';
										
                    this.$el.find("#targets").html(target_html);
					
                    this.$el.find("#targets").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:this.app.get('wp_height')-122,							
                            usepager : false,
                            colWidth : ['100%','100']
                    });
					
                    this.$("#targets tr td:first-child").attr("width","100%");
                    this.$("#targets tr td:last-child").attr("width","100px");										
                    this.$("#target-recipients-list").css("height",this.app.get('wp_height')-122);										
								
                    this.$el.find("#area_choose_targets").mapping({
                            gridHeight:this.app.get('wp_height')-122,
                            sumColumn: 'subscribers',
                            sumTarget: 'trecpcount span',
                            loadTarget: function(obj) { 
                                    camp_obj.loadTarget(obj);
                            },
                            copyTarget: function(obj) { 
                                    camp_obj.copyTarget(obj);
                            }
                    });
					
					this.$el.find(".taglink").click(_.bind(function(obj){
                            camp_obj.app.initSearch(obj,camp_obj.$el.find("#target-search"));
                        },camp_obj));
						
					this.$el.find("#recipients .taglink").click(_.bind(function(obj){
                            camp_obj.app.initSearch(obj,camp_obj.$el.find("#target-recps-search"));
                        },camp_obj));
						
                    this.app.showLoading(false,camp_obj.$el.find('#area_choose_targets .leftcol'));
                    if(this.states.step3.recipientType.toLowerCase()=="target"){
                        this.setRecipients();
                    }
					
                },
                createCampaignListTable:function(){                    
                    var camp_obj=this;
                    this.app.showLoading(false,this.$("#copy-camp-listing"));
                    this.$el.find("#copy-camp-listing").children().remove();
                    var camp_list_json = this.app.getAppData("campaigns");
                    if(camp_list_json.totalCount > 1)
                    	this.$("#copy_no_of_camps").html(camp_list_json.totalCount+" Campaigns found");
                    else
                        this.$("#copy_no_of_camps").html(camp_list_json.totalCount+" Campaign found");
                    
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="camp_list_grid"><tbody>';
                    this.$el.find(".list-count").html("Displaying <b>"+camp_list_json.count+"</b> lists");
                    $.each(camp_list_json.campaigns[0], function(index, val) {     
                        var datetime = val[0].scheduledDate;
                        var dateFormat = '';
                        if(datetime)
                        {
                                var date = datetime.split(' ');
                                var dateparts = date[0].split('-');                                 
                                var month = camp_obj.app.getMMM(dateparts[1].replace('0','')-1);;
                                dateFormat = dateparts[2] + ' ' + month + ', ' + dateparts[0];
                        }
                        else{
                            dateFormat = '';					
                         }  
                        list_html += '<tr id="row_'+val[0]['campNum.encode']+'">';                        
                        list_html += '<td><div class="name-type"><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+camp_obj.app.showTags(val[0].tags)+'</div></div></td>';                         
                        list_html += '<td><div class="time show" style="width:105px"><span class=""></span>'+dateFormat+'</div><div id="'+val[0]['campNum.encode']+'" class="action"><a class="btn-green"><span>Copy</span><i class="icon copy"></i></a></div></td>';                        
                        list_html += '</tr>';
                    });
                    list_html += '</tbody></table>';										

                    this.$el.find("#copy-camp-listing").html(list_html);                                                                                
                    
					//this.initTemplateListing();
					this.$el.find("#camp_list_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
							lazyLoading:_.bind(this.appendCampaigns,this),
                            height:this.app.get('wp_height')-122,
                            usepager : false,
                            colWidth : ['100%','90px','66px','132px']
                    });
                    this.$("#camp_list_grid tr td:nth-child(1)").attr("width","100%");
                    this.$("#camp_list_grid tr td:nth-child(2)").attr("width","90px");
                    this.$("#camp_list_grid tr td:nth-child(4)").attr("width","132px");
					
					if(camp_list_json.offset && parseInt(camp_list_json.count)==parseInt(camp_list_json.totalCount)){
						this.$("#camp_list_grid tr:last-child").removeAttr("data-load");
					}
					
                    this.$("#copy-camp-listing .action").click(_.bind(this.copyCampaign,this));
                   	
					this.$el.find(".taglink").click(_.bind(function(obj){
                            camp_obj.app.initSearch(obj,this.$el.find("#copy-camp-search"));
                        },this));
                }
                ,  
                appendCampaigns:function(){
                        var camp_list_json = this.app.getAppData("campaigns");                            
                        if(camp_list_json){
                                var camp_obj = this;
                                var new_offset = camp_list_json.offset ? (camp_list_json.offset + 50): 50 ;

                                var list_html = "";
                                var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormalCampaigns&offset="+new_offset;
                                jQuery.getJSON(URL,  function(tsv, state, xhr){
                                if(xhr && xhr.responseText){
                                         var campaigns = jQuery.parseJSON(xhr.responseText);                                
                                         if(camp_obj.app.checkError(campaigns)){
                                                 return false;
                                         }               
                                         var row_no =1;
                                         camp_obj.$("#copy-camp-listing .footer-loading").remove();
                                         camp_list_json.offset = new_offset;
                                         $.each(campaigns.campaigns[0], function(index, val) {
                                                        list_html = $(camp_obj.makecamprows(val,true));					                                            
                                                        if(row_no==50 && camp_list_json.offset+parseInt(campaigns.count)<parseInt(campaigns.totalCount)){
                                                                list_html.attr("data-load","true")
                                                        }
                                                        camp_list_json["campaigns"][0]["campaign"+(new_offset+row_no)] = val;
                                                        camp_obj.$("#camp_list_grid tbody").append(list_html);
                                                        row_no = row_no +1;
                                        });                                    
                                        camp_list_json.count = parseInt(camp_list_json.count) + parseInt(campaigns.count);
                                        camp_obj.$el.find(".taglink").click(_.bind(function(obj){
                                                camp_obj.app.initSearch(obj,camp_obj.$el.find("#list-search"));
                                        },camp_obj));

                                }
                                }).fail(function() { console.log( "error in campaign lazy loading fields" ); }); 
                        }
                        else{
                                this.getallcampaigns();
                        }
                },              
                showSalesForceCampaigns:function(){
                    var camp_obj =this;					
                    camp_obj.app.showLoading("Loading Salesforce Campaigns...",camp_obj.$el.find('#salesforce_setup .salesforce_campaigns .template-container'));
                    var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=sfCampaignList"; 
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
							camp_obj.app.showLoading(false,camp_obj.$el.find('#salesforce_setup .salesforce_campaigns .template-container'));
                            var camps_html = '<select data-placeholder="Choose a Salesforce Campaign..." class="chosen-select" id="sf_campaigns_combo" >';
                            camps_html += '<option value=""></option>';
                             var s_camps_json = jQuery.parseJSON(xhr.responseText);
                             if(camp_obj.app.checkError(s_camps_json)){
                                return false;
                             }
                             camp_obj.states.saleforce_campaigns = s_camps_json;
                             var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="sfcamp_list_grid"><tbody>';
                             $.each(s_camps_json.campList[0], function(index, val) {     
                                var _selected = (camp_obj.states.step1.sfCampaignID==val[0].sfCampaignID)?"selected=selected":"";
                                camps_html += '<option value="'+val[0].sfCampaignID+'" '+_selected+'>'+val[0].name+'</option>';
                                list_html += '<tr id="row_'+val[0].sfCampaignID+'">';                        
                                list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3> </td>';                  
                                var total_count = parseFloat(val[0].contactCount)+parseFloat(val[0].leadCount);
                                list_html += '<td><div><div class="subscribers show"><strong class="badge">'+total_count+'</strong></div><div id="'+val[0].sfCampaignID+'" class="action"><a class="btn-green select"><span>Use</span><i class="icon next"></div></div></td>';                        
                                list_html += '</tr>';
                            });
                            list_html += '</tbody></table>';
                            camps_html +="</select>";
                            
                            //Setting salesforce campaigns in select box
                            camp_obj.$("#salesforce_campaigns").children().remove();
                            camp_obj.$("#salesforce_campaigns").html(camps_html);
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
                                camp_obj.$("#salesforce_setup .filterbtn").hide();
                                camp_obj.$("#sfcamp_list_grid tr.selected").removeClass("selected");    
                                $(this).parents("tr").addClass("selected");
                            });
                            
                            camp_obj.$("#sf_campaigns_combo").chosen({no_results_text:'Oops, nothing found!'});
                            camp_obj.setSalesForceCombo(); 
                            camp_obj.setSalesForceData()
                					                            
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
                    var self = this;                 
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
                        
                        if(btn.parents("div.row").find("input[type='text']") && btn.parents("div.row").find("input[type='text']").attr("id"))
                            var input_container = btn.parents("div.row").find("input[type='text']").attr("id");
                        else if(btn.parents("div.row").find("select"))
                            var input_container = btn.parents("div.row").find("select").attr("id");
                        m_fields_box.attr("input-source",input_container);
                        
                        if($(".merge-feilds-type li.active").length==0){
                            $(".merge-feilds-type li#mergefields_basic").click();
                        }
                    }
                    obj.stopPropagation();
                },
                createCalender:function(){
                     var self = this;
                     var transEndEventNames = {
                            'WebkitTransition' : 'webkitTransitionEnd',
                            'MozTransition' : 'transitionend',
                            'OTransition' : 'oTransitionEnd',
                            'msTransition' : 'MSTransitionEnd',
                            'transition' : 'transitionend'
                    },
                    transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
                    $wrapper = this.$( '#custom-inner' ),
                    $calendar = this.$( '#calendar' ),
                    cal = $calendar.calendario( {
                    onDayClick : function( $el, $contentEl, dateProperties ) {                                
                            if($el.hasClass("fc-disabled")===false){
                               self.$('#calendar').find("div.selected").removeClass("selected"); 
                               $el.addClass("selected");
                               self.states.step4.datetime['day'] = dateProperties.day;
                               self.states.step4.datetime['month'] = dateProperties.month; 
                               self.states.step4.datetime['year'] = dateProperties.year;
                            }                                
                            if( $contentEl.length > 0 ) {

                                    showEvents( $contentEl, dateProperties );
                            }

                    },                                    
                    displayWeekAbbr : true
                    } ),
                    $month = this.$( '#custom-month' ).html( cal.getMonthName() +" "+ cal.getYear() ),
                    $year = this.$( '#custom-year' ).html("");
                    
                    function updateMonthYear() {				
                            $month.html( cal.getMonthName() +" "+cal.getYear());
                            $year.html("");
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
                    this.states.step4.cal = cal;
                    this.$( '#custom-next' ).on( 'click', function() {
                            cal.gotoNextMonth( updateMonthYear );
                    } );
                    this.$( '#custom-prev' ).on( 'click', function() {
                            cal.gotoPreviousMonth( updateMonthYear );
                    } );
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
                        var fields_html = "<ul id='"+ type +"'>";
                        $.each(fields,function(key,val){
                            fields_html +="<li rel='"+ type +"' mergeval='"+val[0]+"'>"+val[1]+"<a class='append-merge-field'>Insert</a></li>";
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
                                if(input_field == 'campaign_from_email')
                                {	
                                       var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                                       $.each(active_ws.find("#"+input_field+" option"),function(){
                                           if(merge_field_patt.test($(this).val())){
                                               $(this).remove();
                                           }
                                       }) 
                                       active_ws.find("#"+input_field).prepend("<option value='"+merge_field+"'>"+merge_field+"</option");
                                       active_ws.find("#"+input_field).val(merge_field).trigger("chosen:updated");                                        
                                       active_ws.find("#"+input_field).change();
                                }
                                else
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
					$(".mergefields .searchfields .searchlist").find('.notfound').hide();
                    if(searchterm.length){
                        var camp_obj = this;
                        $(".mergefields .searchfields,#remove-merge-list").show();                                                       
                        $(".mergefields .browsefields").hide();
                        $(".mergefields .searchfields .searchlist li").hide();
                        searchterm = searchterm.toLowerCase();
						var count = 0;
                        $(".mergefields .searchfields .searchlist li").filter(function() {
                            if($(this).find("div").text().toLowerCase().indexOf(searchterm) > -1 && $(this).find("div").text().substring(0,9) != '<!DOCTYPE')
                            {
                                    count++;
                                    return $(this);
                            }
                         }).show();
                        var ids = ['Basic Field', 'Custom Field', 'Sales Rep'];
                        var items = $(".mergefields .searchfields .searchlist li");
                        $.each(ids, function(index, id) {
                               $(items).filter("li[rel='" + ids[index] + "']")
                                       .appendTo($(".mergefields .searchfields .searchlist ul"));
                       });
                         $(".mergefields .searchfields .searchlist li div").removeHighlight().highlight(searchterm);
                        if(count == 0)
                         {
                              $(".mergefields .searchfields .searchlist").append('<p class="notfound">No merge field found containing &lsquo;'+ searchterm +'&rsquo;</p>');							  
                         }
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
                    var camp_obj = this;
                    this.$(".step2 #choose_soruce li").removeClass("selected");
                    this.$(".step2 .soruces").hide();  
                    this.$(".step2 #area_"+target_li.attr("id")).fadeIn("fast");
                    target_li.addClass("selected");
                    switch(target_li.attr("id")){
                        case 'use_template':
                            this.loadTemplatesView();                                                                                                
                            break;
                         case 'html_editor':
                            this.setEditor();
                            tinyMCE.get('bmseditor_'+this.wp_id).setContent(this.app.decodeHTML(this.states.step2.htmlText,true));                                 
                         break;
                         case 'copy_campaign':
                            this.getallcampaigns();                                 
                         break;
                         default:
                         break;
                    }
                    
                },
                getallcampaigns: function () {
                    var camp_obj = this;
                    camp_obj.app.showLoading("Loading Campaigns...",camp_obj.$("#copy-camp-listing"));  
                    if(!camp_obj.app.getAppData("campaigns")){                                                                       
                          camp_obj.app.getData({
                                  "URL":"/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+camp_obj.app.get('bms_token')+"&type=listNormalCampaigns&offset=0",
                                  "key":"campaigns",
                                  "callback":_.bind(camp_obj.createCampaignListTable,this)
                          });
                    }
                    else{                                    
                        window.setTimeout(_.bind(camp_obj.createCampaignListTable,this),500);
                    }
                },
                loadTemplatesView:function(){
                    if(!this.states.step2.templates){
                        this.app.showLoading("Loading Templates...",this.$('#area_use_template'));  
                        var _this = this;
                        require(["bmstemplates/templates"],function(templatesPage){  								                                    
                            var page = new templatesPage({page:_this,app:_this.app,selectCallback:_.bind(_this.selectTemplate,_this)});								
                            _this.$('#area_use_template').html(page.$el);                            
                            page.init();
                        })
                        
                        this.states.step2.templates = true;
                    }
                },
                selectTemplate:function(obj){
                    this.setEditor();
                    var target = $.getObj(obj,"a");
                    var bms_token =this.app.get('bms_token');
                    this.app.showLoading('Loading HTML...',$(".fullwindow.campaign-content"));
                    this.states.editor_change = true;
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+bms_token+"&type=html&templateNumber="+target.attr("id").split("_")[1];                              
                    jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));

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
                    var camp_obj = this;
                    //Check if cvs upload exits to delete
                    camp_obj.checkCSVUploaded();
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
                        case 'choose_targets':                                                                
                                if(this.checkRecipientsSaved("target")){
                                    return false;
                                }
                                if(!this.app.getAppData("targets")){                                    
                                    camp_obj.app.showLoading("Loading Targets...",camp_obj.$el.find('#area_choose_targets .leftcol'));
                                     this.app.getData({
                                        "URL":"/pms/io/filters/getTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list&filterFor=C",
                                        "key":"targets",
                                        "callback":_.bind(this.createTargetsTable,this)
                                    });
                                }
                                else{
                                    this.createTargetsTable();
                                }

                                break;
                        case 'choose_lists':						   
                                if(this.checkRecipientsSaved("list")){
                                    return false;
                                }                                
                                if(!this.app.getAppData("lists")){
                                    this.app.showLoading("Loading Lists...",camp_obj.$el.find('#area_choose_lists .leftcol'));                                    
                                    this.app.getData({
                                        "URL":"/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=all",
                                        "key":"lists",
                                        "callback":_.bind(this.createListTable,this)
                                    });
                                }
                                else{
                                    this.createListTable();
                                }
                                break;
                        case 'upload_csv':
                            camp_obj.app.showLoading("Loading CSV upload...",camp_obj.$el.find('#area_upload_csv'));
                            require(["listupload/csvupload"],function(csvuploadPage){                                        
                                    var lPage = new csvuploadPage({camp:camp_obj,app:camp_obj.app});								
                                    camp_obj.$el.find('.step3 #area_upload_csv').html(lPage.$el);
                                    camp_obj.states.step3.csvupload = lPage;
                            })
                           break;
                        case 'salesforce_import':                                                        
                            this.checkSalesForceStatus();							
                        	break;
                        case 'netsuite_import':                                                      							
                            this.checkNetSuiteStatus();							
                        	break;
                        case 'choose_tags':
                            if(this.checkRecipientsSaved("tags")){
                                    return false;
                            }
                            camp_obj.app.showLoading("Loading Tags...",camp_obj.$el.find('#area_choose_tags'));  
                            require(["tags"],function(tagsPage){  								                                    
                                    var lPage = new tagsPage({camp:camp_obj,app:camp_obj.app});								
                                    camp_obj.$el.find('.step3 #area_choose_tags').html(lPage.$el);
                                    camp_obj.states.step3.tags = lPage;
                            })
                            break;
                        default:
                            break;
                    }
                    this.states.step3.change = true;
               },
               checkRecipientsSaved :function(type){
                  var exits = false; 
                  if(this.states.step3.recipientType.toLowerCase()==type && this.states.step3.recipientDetial){
                        return true;
                  }  
                  return exits;
               },
               checkCSVUploaded:function()
                {
                    var camp_obj = this;
                    var csvupload = camp_obj.states.step3.csvupload;
                    var mapdataview = camp_obj.states.step3.mapdataview;
                    if(csvupload && csvupload.fileuploaded == true)
                    {
                            var cancelURL = '/pms/io/subscriber/uploadCSV/?BMS_REQ_TK='+camp_obj.app.get('bms_token');
                            $.post(cancelURL, { stepType: "cancel" })
                            .done(function(data) {
                                    var list_json = jQuery.parseJSON(data);						   
                                    if(list_json[0] == 'success')
                                    {                                               
                                           camp_obj.app.showAlert('Your csv upload has cancelled.',camp_obj.$el);
                                           csvupload.$el.find("#dropped-files").children().remove();
                                           csvupload.$el.find("#drop-files .middle").css("display","block");
                                           csvupload.dataArray = [];
                                           csvupload.fileuploaded=false;
                                           csvupload.$el.find("#drop-files").css({'box-shadow' : 'none', 'border' : '1px dashed #CCCCCC'});
                                           mapdataview.$el.find('#uploadslist').children().remove();
                                           mapdataview.$el.find('#newlist').val('');
                                           mapdataview.$el.find('#alertemail').val('');
                                           camp_obj.app.showLoading(false,csvupload.$el);
                                    }
                            });
                    }
                },
		createTarget: function(){
                    var camp_obj = this;
                    var dialog_title = "New Target";
                    var dialog = this.app.showDialog({title:dialog_title,
                        css:{"width":"650px","margin-left":"-325px"},
                        bodyCss:{"min-height":"100px"},							   
                        buttons: {saveBtn:{text:'Create Target'} }                                                                           
                    });
                    this.app.showLoading("Loading...",dialog.getBody());
                    require(["target/newtarget"],function(newtargetPage){                                     
                        var mPage = new newtargetPage({camp:camp_obj,app:camp_obj.app,newtardialog:dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.createTarget,mPage));
                    });
                },
                initCreateEditTarget:function(target_id){
                    var self = this;
                    var t_id = target_id?target_id:"";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-219;
                    var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:true,
                              bodyCss:{"min-height":dialog_height+"px"},
                              buttons: {saveBtn:{text:'Save Target'} }                                                                           
                        });
                    this.app.showLoading("Loading...",dialog.getBody());                                  
                      require(["target/target"],function(targetPage){                                     
                           var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog});
                           self.states.step3.targetDialog =  mPage;
                           dialog.getBody().html(mPage.$el);
                           dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                      });
                },
                copyTarget:function(obj){
                    var target_obj = $.getObj(obj,"div");
                    var target_id = target_obj.attr("id");
                    var camp_obj = this;
                    var dialog_title = "Copy Target";
                    var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":"650px","margin-left":"-325px"},
                              bodyCss:{"min-height":"200px"},							   
                              buttons: {saveBtn:{text:'Copy Target'} }                                                                           
                    });
                    this.app.showLoading("Loading...",dialog.getBody());
                    require(["target/copytarget"],function(copytargetPage){                                     
                             var mPage = new copytargetPage({camp:camp_obj,app:camp_obj.app,target_id:target_id,copydialog:dialog});
                             dialog.getBody().html(mPage.$el);
                             dialog.saveCallBack(_.bind(mPage.copyTarget,mPage));
                    });
					//this.app.showAlert("In Progress target id="+target_id,$("body"));
               },
               loadTarget:function(obj){
                   var target_obj = $.getObj(obj,"div");
                   var target_id = target_obj.attr("id");                 
                   this.initCreateEditTarget(target_id);
               },
                loadTargets:function(){
                    var camp_obj = this;
                    camp_obj.$el.find("#trecpcount span").text('0');
                    camp_obj.app.showLoading("Loading Targets...",camp_obj.$el.find('#area_choose_targets .leftcol'));                                                         
                    this.app.getData({
                       "URL":"/pms/io/filters/getTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list&filterFor=C",
                       "key":"targets",
                       "callback":_.bind(this.createTargetsTable,this)
                   });
                },
               checkSalesForceStatus: function(){
                    var camp_obj = this;
                    var salesforce_setting = this.app.getAppData("salesfocre");
                    if(!salesforce_setting || salesforce_setting[0] == "err" || salesforce_setting.isSalesforceUser=="N")
                    {
                        camp_obj.app.showLoading("Getting Salesforce Status...",camp_obj.$el.find('#area_salesforce_import'));                                 
                        this.app.getData({
                            "URL":"/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status",
                            "key":"salesfocre",
                            "callback":_.bind(this.setSalesForceWiz,this)
                        });
                    }
                    else{
                        this.setSalesForceWiz();
                    }
                },
               setSalesForceWiz:function(){				   	
                    var camp_obj = this;
                    camp_obj.app.showLoading(false,camp_obj.$el.find('#area_salesforce_import'));
                    var salesforce_setting = this.app.getAppData("salesfocre");
                    var self = this;
                    if(salesforce_setting && salesforce_setting.isSalesforceUser=="Y"){
                        if(this.states.saleforce_campaigns ===null)
                          this.showSalesForceCampaigns();

                        this.$("#salesforce_welcome").hide();                        
                        this.$("#salesforce_setup").show();
                    }
                    else{
                        this.$("#salesforce_welcome").show();
                        this.$("#salesforce_setup").hide();                        
                    }
                    if(this.states.step3.recipientType.toLowerCase()=="salesforce"){
                        this.setRecipients();
                    }
                    if(!this.states.step3.salesforce){
                        this.$("#sf_accordion").accordion({ active: 0, collapsible: false});                       
                        this.$("#sf_accordion h3.ui-accordion-header").unbind("keydown");
                        self.$("#salesforce_setup .filterbtn").click(_.bind(self.showSalesForceFitler,self));
                        this.$('.salesforce_campaigns input.radiopanel').iCheck({
                            radioClass: 'radiopanelinput',
                            insert: '<div class="icheck_radio-icon"></div>'
                         });
                                                
                         this.$('.salesforce_campaigns input.radiopanel').on('ifChecked', function(event){                                                          
                             camp_obj.$("#salesforce_setup .ui-accordion-header.selected").removeClass("selected");
                             $(this).parents(".ui-accordion-header").addClass("selected");
                             var icheck_val = $(this).attr("value");
                             if(icheck_val!=="campaign"){
                                 camp_obj.$("#sfcamp_list_grid tr.selected").removeClass("selected");    
                             }                         
                         });
                         if(this.states.step3.recipientType.toLowerCase()!=="salesforce"){
                             this.$("input[name='options_sf']").eq(0).iCheck('check');                   
                         }                             
                        self.$("#salesforce_setup .sf_all_count,#salesforce_setup .sf_lead_count,#salesforce_setup .sf_contact_count").addClass("loading-wheel-inline").html('');
                        var URL = '/pms/io/salesforce/getData/?BMS_REQ_TK='+self.app.get('bms_token')+'&type=allCount';
                        jQuery.getJSON(URL,  function(tsv, state, xhr){
                            var total_count = jQuery.parseJSON(xhr.responseText);
                            var total = parseFloat(total_count.contactCount) + parseFloat(total_count.leadCount);
                            self.$("#salesforce_setup .sf_all_count").html(total).removeClass("loading-wheel-inline");
                            self.$("#salesforce_setup .sf_contact_count").html(total_count.contactCount).removeClass("loading-wheel-inline");
                            self.$("#salesforce_setup .sf_lead_count").html(total_count.leadCount).removeClass("loading-wheel-inline");
                        })                                                        
                        
                        this.$("#salesforce-camp-search").searchcontrol({
                            id:'salesforce-camp-search',
                            width:'300px',
                            height:'22px',
                            placeholder: 'Search Salesforce Campaign',
                            gridcontainer: 'sfcamp_list_grid',
                            showicon: 'yes',
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
                                     var mPage = new mappingPage({camp:self,app:camp_obj.app,dialog:dialog});
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
                                    var lPage = new loginPage({camp:self,app:self.app,dialog:dialog});
                                    dialog.getBody().html(lPage.$el);
                                })
                                
                            }
                        },this))
                     }
                     else{                        
                        if(this.checkRecipientsSaved("salesforce")){
                            return false;
                        }
                        this.$("#sfcamp_list_grid tr.selected").removeClass("selected");                          
                     }
               },
               showSalesForceFitler:function(obj){
                     var dialog_title= "Lead";
                     var input_radio = $(obj.target).parents(".ui-accordion-header").find("input.radiopanel");
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
                        var step3_obj= self.states.step3;
                        var recipient_obj = (step3_obj.recipientType && step3_obj.recipientType.toLowerCase()=="salesforce" && step3_obj.recipientDetial.filterType==="filter")?step3_obj.recipientDetial:null;
                        var afilter = new afterFilter({camp:self,savedObject:recipient_obj,type:filter_type});
                        afilter.$el.css("margin","10px 0px");
                        dialog.getBody().html(afilter.$el);
                        dialog.saveCallBack(_.bind(afilter.saveFilter,afilter,dialog));
                    }); 
               },
               setSalesForceData:function(){
                   if(this.states.step3.recipientDetial && this.states.step3.recipientType.toLowerCase()=="salesforce"){
                       var recipient_obj = this.states.step3.recipientDetial;                       
                       if(recipient_obj.filterType==="campaign"){
                           this.$("input[name='options_sf']").eq(3).iCheck('check');                           
                           this.$("#sfcamp_list_grid tr[id='row_"+recipient_obj.sfCampaignId+"']").addClass("selected");    
                       }
                       else if(recipient_obj.filterType==="filter" && recipient_obj.sfObject!=="both"){
                           if(recipient_obj.sfObject=="lead"){
                               this.$("input[name='options_sf']").eq(1).iCheck('check');
                           }
                           else if(recipient_obj.sfObject=="contact"){
                               this.$("input[name='options_sf']").eq(2).iCheck('check');
                           }
                       }
                       else if(recipient_obj.filterType=="filter" && recipient_obj.sfObject=="both"){
                           this.$("input[name='options_sf']").eq(0).iCheck('check');
                       }
                       this.states.step3.change = false;
                   }
               },
               saveSalesForceDetails:function(){
                   var camp_obj = this;
                   var salesforce_val = this.$(".salesforce_campaigns input[name='options_sf']:checked").val();    
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
                   else{
                       var importType = salesforce_val;
                       post_data['filterType']= "filter";
                       post_data['sfObject'] = importType;               
                       
                       var leadPost = camp_obj.states.step3.sf_filters.lead;
                       var contactPost= camp_obj.states.step3.sf_filters.contact;
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
                   
                   this.app.showLoading("Saving Salesforce Settings...",this.$el.parents(".ws-content"));  
                   $.post(URL,post_data)
                    .done(function(data) {                              
                        var camp_json = jQuery.parseJSON(data);                              
                        camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));  
                        if(camp_json[0]!=="err"){                                                      
                           camp_obj.wizard.next();
                           camp_obj.app.showMessge("Step 3 saved successfully!"); 
                        }
                        else{                                  
                            camp_obj.app.showAlert(camp_json[1],$("body"),{fixed:true});
                        }                        
                   }); 
               },
                checkNetSuiteStatus: function(){
                        var camp_obj = this;				   
                        var netsuite_setting = this.app.getAppData("netsuite");
                        if(!netsuite_setting || netsuite_setting[0] == "err" || netsuite_setting.isNetsuiteUser=="N")
                        {
                                camp_obj.app.showLoading("Getting Netsuite Status...",camp_obj.$el.find('#area_netsuite_import'));                                
                                this.app.getData({
                                    "URL":"/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status",
                                    "key":"netsuite",
                                    "callback":_.bind(this.setNetSuiteeWiz,this)
                                });
                        }
                        else{
                            this.setNetSuiteeWiz();
                        }
                },
               setNetSuiteeWiz:function(){
                   var camp_obj = this;
                   camp_obj.app.showLoading(false,camp_obj.$el.find('#area_netsuite_import'));
                   var netsuite_setting = this.app.getAppData("netsuite");
                   if(netsuite_setting && netsuite_setting.isNetsuiteUser=="Y"){                        
                        this.$("#netsuite_login,#netsuite_welcome").hide();                        
                        this.$("#netsuite_setup").show();                                              
                    }
                    else{
                       this.$("#netsuite_login,#netsuite_setup").hide();
                        this.$("#netsuite_welcome").show();                         
                   }
                   if(this.states.step3.recipientType.toLowerCase()=="netsuite"){
                        this.setRecipients();
                    }
                   var self = this;
                   if(!this.states.step3.netsuite){
                       this.$("#ns_accordion").accordion({ active: 0, collapsible: false});   
                       this.$("#ns_accordion h3.ui-accordion-header").unbind("keydown");
                       self.$("#netsuite_setup .filterbtn").click(_.bind(self.showNetSuiteFitler,self));
                       this.$('#netsuite_setup input.radiopanel').iCheck({
                            radioClass: 'radiopanelinput',
                            insert: '<div class="icheck_radio-icon"></div>'
                       });
                         
                       this.$('.netsuite_groups input.radiopanel').on('ifChecked', function(event){                                                          
                             camp_obj.$("#netsuite_setup .ui-accordion-header.selected").removeClass("selected");
                             $(this).parents(".ui-accordion-header").addClass("selected");
                             var icheck_val = $(this).attr("value");
                             if(icheck_val!=="campaign"){
                                 camp_obj.$("#netsuite-group-listing tr.selected").removeClass("selected");    
                             }                         
                             camp_obj.states.step3.change = true;
                       });
                       
                       if(this.states.step3.recipientType.toLowerCase()!=="netsuite"){
                             this.$("input[name='options_ns']").eq(0).iCheck('check');                   
                       }
                       
                       this.$("#netsuite-group-search").searchcontrol({
                            id:'netsuite-group-search',
                            width:'300px',
                            height:'22px',
                            placeholder: 'Search NetSuite Groups',
                            gridcontainer: 'nsgroup_list_grid',
                            showicon: 'yes',
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
                                     var mPage = new mappingPage({camp:self,app:camp_obj.app,dialog:dialog});
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
                                    var lPage = new loginPage({camp:self,app:camp_obj.app,dialog:dialog});
                                    dialog.getBody().html(lPage.$el);
                                })
                                
                            }
                        },this))
                   }
                   else{                      
                        if(this.checkRecipientsSaved("netsuite")){
                            return false;
                        }
                        this.$("#nsgroup_list_grid tr.selected").removeClass("selected");                            
                   }
                   if(netsuite_setting && netsuite_setting.isNetsuiteUser=="Y"){ 
                         this.loadNetSuiteGroup();
                   }
               },
               showNetSuiteFitler:function(obj){
                     var dialog_title= "Customer";
                     var input_radio = $(obj.target).parents(".ui-accordion-header").find("input.radiopanel");
                     var filter_type = input_radio.val();
                     input_radio.iCheck('check');
                     if(filter_type=="contact"){
                         dialog_title= "Contant";
                     }
                     else if(filter_type=="partner"){
                         dialog_title= "Partner";
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
                    require(["crm/netsuite/after_filter"],function(afterFilter){                        
                        var step3_obj= self.states.step3;
                        var recipient_obj = (step3_obj.recipientType && step3_obj.recipientType.toLowerCase()=="netsuite" && step3_obj.recipientDetial.filterType==="filter")?step3_obj.recipientDetial:null;
                        var afilter = new afterFilter({camp:self,savedObject:recipient_obj,type:filter_type});
                        afilter.$el.css("margin","10px 0px");
                        dialog.getBody().html(afilter.$el);
                        dialog.saveCallBack(_.bind(afilter.saveFilter,afilter,dialog));
                    }); 
                    self.states.step3.change = true;
                    
               },
               setNetSuiteData:function(){
                   if(this.states.step3.recipientDetial && this.states.step3.recipientType.toLowerCase()=="netsuite"){
                       var self = this;
                       var recipient_obj = this.states.step3.recipientDetial;                       
                       if(recipient_obj.filterType==="group"){
                           this.$("input[name='options_ns']").eq(3).iCheck('check');                   
                           this.$("#nsgroup_list_grid tr[id='row_"+recipient_obj.nsGroupId+"']").addClass("selected");    
                       }
                       else if(recipient_obj.filterType==="filter"){
                           if(recipient_obj.nsObject.indexOf("customer")>-1){
                               this.$("input[name='options_ns']").eq(0).iCheck('check');                   
                           }
                           else if(recipient_obj.nsObject=="contact"){
                               this.$("input[name='options_ns']").eq(1).iCheck('check');                   
                           }
                           else if(recipient_obj.nsObject=="partner"){
                               this.$("input[name='options_ns']").eq(2).iCheck('check');                   
                           }
                       }
                       this.states.step3.change = false;
                   }
                 
               },
               loadNetSuiteGroup:function(){
                   var self = this;
                   if(self.states.step3.netsuitegroups)return false;
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
                                self.states.step3.netsuitegroups = netsuite_groups;
                                 var group_html = '<table cellpadding="0" cellspacing="0" width="100%" id="nsgroup_list_grid"><tbody>';
                                $.each(netsuite_groups.groupList[0], function(index, val) {                                              
                                   group_html += '<tr id="row_'+val[0].id+'">';                        
                                   group_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3> </td>';                  
                                   var total_count = val[0].count;
                                   group_html += '<td><div class="subscribers show" style="min-width:70px"><span class=""></span>'+total_count+'</div><div id="'+val[0].id+'" class="action"><a class="btn-green use"><span>Use</span><i class="icon next"></i></a></div></td>';                        
                                   group_html += '</tr>';
                               });
                               group_html += '</tbody></table>';                                       

                               //Setting netsuite group listing grid
                               self.$("#netsuite-group-listing").html(group_html);   

                               self.$el.find("#nsgroup_list_grid").bmsgrid({
                                       useRp : false,
                                       resizable:false,
                                       colresize:false,
                                       height:300,
                                       usepager : false,
                                       colWidth : ['100%','90px']
                               });
                               self.$("#nsgroup_list_grid tr td:nth-child(1)").attr("width","100%");
                               self.$("#nsgroup_list_grid tr td:nth-child(2)").attr("width","90px");

                               self.$("#nsgroup_list_grid .action .use").click(function(){
                                   self.$("#nsgroup_list_grid tr.selected").removeClass("selected");    
                                   $(this).parents("tr").addClass("selected");
                               });   
                               self.setNetSuiteData();
                            }
                        }
                        else{
                          self.app.showAlert(netsuite_groups[1],$("body"),{fixed:true});  
                        }
                    }).fail(function() { console.log( "error net suite group listing" ); });
               },
               saveNetSuiteDetails:function(){
                   var camp_obj = this;
                   var netsuite_val = this.$(".netsuite_groups input[name='options_ns']:checked").val();    
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
                   else{                       
                       post_data['filterType']= "filter";
                       if(camp_obj.states.step3.ns_filters.nsObject!==""){
                        post_data['nsObject'] =  camp_obj.states.step3.ns_filters.nsObject ;          
                       }
                       else{
                         post_data['nsObject'] =  netsuite_val;            
                       }
                       
                       var customerPost = camp_obj.states.step3.ns_filters.customer;
                       var contactPost= camp_obj.states.step3.ns_filters.contact;
                       var partnerPost= camp_obj.states.step3.ns_filters.partner;
                       if(netsuite_val=="customer"){
                          $.extend(post_data,customerPost)
                       }
                       else if(netsuite_val=="contact"){
                          $.extend(post_data,contactPost)
                       }
                       else if(netsuite_val=="partner"){
                          $.extend(post_data,partnerPost)                                                  
                       }
                       
                   }
                   this.app.showLoading("Saving Netsuite settings...",this.$el.parents(".ws-content"));  
                   $.post(URL,post_data)
                    .done(function(data) {                              
                        camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));  
                        var camp_json = jQuery.parseJSON(data);                                                      
                        if(camp_json[0]!=="err"){                                                      
                           camp_obj.wizard.next();
                           camp_obj.app.showMessge("Step 3 saved successfully!"); 
                        }
                        else{                                  
                            camp_obj.app.showAlert(camp_json[1],$("body"),{fixed:true});
                        }                        
                   }); 
               },
               saveCSVUpload:function(){
                    var camp_obj = this;
                    var isValid = false;    
					var csvupload = camp_obj.states.step3.csvupload;
					var mapdataview = camp_obj.states.step3.mapdataview;                
                    if(csvupload && csvupload.fileuploaded == true)
                    {
                        csvupload.$el.hide();
                        camp_obj.app.showLoading(false,mapdataview.$el);
                        isValid = mapdataview.mapAndImport();
                        if(isValid)
                        {
                                mapdataview.$el.hide();
                                camp_obj.$el.find('#upload_csv').removeClass('selected');
                        }
                        return isValid;
                    }
                    else{                        
                        this.app.showAlert('Please supply csv file to upload',this.$el.parents(".ws-content"));                        
                    }
               },
               saveLists:function(){
                   var selected_list = this.$("#area_choose_lists .col2 tr").map(function(){
                                            return $(this).attr("id").split("_")[1]
                                        }).toArray().join();
                   if(!selected_list){
                       this.app.showAlert("Please select list(s) to set recipients",$("body"),{fixed:true});
                   }
                   return selected_list;
               },
               saveTargets:function(){
                   var selected_targets = this.$("#area_choose_targets .col2 tr").map(function(){
                                return $(this).attr("id").split("_")[1]
                            }).toArray().join();
                   if(!selected_targets){
                       this.app.showAlert("Please select target(s) to set recipients",$("body"),{fixed:true});
                   }
                   return selected_targets;
               },
               setRecipients:function(){
                   var camp_obj = this;
                   if(this.states.step3.recipientDetial) return false;
                   this.app.showLoading("Loading Recipients...",this.$el.parents(".ws-content"));
                   var URL = "";
                   var source_type = camp_obj.states.step3.recipientType.toLowerCase();
                   if(source_type=="salesforce"){
                        URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.camp_id+"&type=import";
                    }
                    else if(source_type=="netsuite"){
                        URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.camp_id+"&type=import";
                    }					
                    else{
                        URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.camp_id+"&type=recipientType";
                    }
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                             camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));                              
                             if(xhr && xhr.responseText){                               
                                var rec_josn = jQuery.parseJSON(xhr.responseText);                                   
                                if(camp_obj.app.checkError(rec_josn)){
                                     return false;
                                }
                                camp_obj.states.step3.recipientDetial = rec_josn;
                                if(rec_josn.type){ 
                                    if(rec_josn.type.toLowerCase()=="list"){
                                        if(rec_josn.count!=="0"){
                                         $.each(rec_josn.listNumbers[0], function(index, val) { 
                                              camp_obj.$(".step3 #area_choose_lists .col1 tr[checksum='"+val[0].checksum+"'] .move-row").click();
                                         })
                                        }
                                    }
                                    else if(rec_josn.type.toLowerCase()=="target"){
                                        if(rec_josn.count!=="0"){
                                         $.each(rec_josn.filterNumbers[0], function(index, val) { 
                                              camp_obj.$(".step3 #area_choose_targets .col1 tr[checksum='"+val[0].checksum+"'] .move-row").click();
                                         })
                                        }
                                    }
									else if(rec_josn.type.toLowerCase()=="tags"){                                        
											var tags = rec_josn.targetTags.split(',');
                                         	for(var i=0;i<tags.length;i++) { 
                                              camp_obj.$(".step3 #area_choose_tags .col1 li[checksum='"+tags[i]+"'] .move-row").click();
											}                                        
                                    }									
                                }
                                else{
                                    if(source_type=="salesforce"){
                                        camp_obj.setSalesForceData();
                                    }
                                    else if(source_type=="netsuite"){
                                        camp_obj.setNetSuiteData();
                                    }
                                }
                                camp_obj.states.step3.change = false;
                             }
                     }).fail(function() { console.log( "Receipts data load failed" ); });
                    
               },               
               scheduledCampaign:function(flag,message){
                   var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                   var step4_obj = this.states.step4.datetime;
                   var _date = step4_obj.year +"-"+this.addZero(step4_obj.month)+"-"+this.addZero(step4_obj.day); 
                   var _time = this.$(".timebox-hour").val();                   
                   var _hour = this.getHourForSchedule(_time);                    
                   _hour = this.addZero(_hour);
                   var _min = this.addZero(this.$(".timebox-min").val());
                   var time =  _hour+":"+_min+":00";                  
                   var camp_obj = this;
                   
                   var post_data = {"campNum": this.camp_id,
                                    "type":"saveStep4",
                                    "status":flag                                    
                                    }
                   if(flag=='S'){
                       post_data["scheduleType"] = "scheduled";
                       post_data["scheduleDate"] =_date+" "+time;                                    
                   }                 
                   var _message = message?message:'Changing mode...';
                   this.app.showLoading(_message,this.$el.parents(".ws-content"));  
                   $.post(URL,post_data)
                    .done(function(data) {                              
                        camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));  
                        var camp_json = jQuery.parseJSON(data);                                                      
                        if(camp_json[0]!=="err"){      
                           if(flag=='S'){ 
                                camp_obj.$(".schedule-camp").hide(); 
                                var camp_detail = '<strong>'+camp_obj.$el.parents(".ws-content").find("#workspace-header").html()+'</strong> Has been Scheduled to be sent on'; 
                                camp_detail +='<span>'+step4_obj.day+' '+camp_obj.app.getMMM(step4_obj.month-1)+' '+step4_obj.year+'</span> at <em>'+camp_obj.$(".timebox-hour").val()+':'+camp_obj.$(".timebox-min").val()+' '+camp_obj.$(".timebox-hours button.active").html()+'</em>'; 
                                camp_obj.$(".camp-sch-detail").html(camp_detail) 
                                camp_obj.$(".sch-made").show(); 
                                camp_obj.states.step4.camp_status = 'P';
                                camp_obj.setScheduleArea();
                                camp_obj.app.showMessge("Campaign Scheduled Successfully!");
                           }
                           else{
                                camp_obj.$(".schedule-camp").show(); 
                                camp_obj.$(".sch-made").hide();  
                                camp_obj.states.step4.camp_status = 'D';
                                camp_obj.setScheduleArea();
                                camp_obj.app.showMessge("Campaign is now in draft mode!");
                           }
                           
                        }
                        else{                                  
                            camp_obj.app.showAlert(camp_json[1],$("body"),{fixed:true});
                        }                        
                   }); 
               },
               addZero:function(val){
                   val = val.toString().length==1?"0"+val:val;
                   return val;
               },
               getHourForSchedule:function(hour){                   
                   if(this.$(".timebox-hours button.pm").hasClass("active")){
                       if(parseInt(hour)<=11){
                        hour = parseInt(hour)+12;
                       }
                   }
                   else{
                       if(parseInt(hour)==12){
                           hour = "00";
                       }
                   }
                   return hour;
               }
               
                
        });
});
