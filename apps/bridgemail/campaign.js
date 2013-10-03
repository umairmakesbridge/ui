define(['jquery.bmsgrid','jquery.calendario','jquery.chosen','jquery.highlight','text!html/campaign.html','views/common/editor'],
function (bmsgrid,calendraio,chosen,jqhighlight,template,editorView) {
        'use strict';
        return Backbone.View.extend({
                id: 'step_container',               
                events: {
                       "click  .step3 #choose_soruce li":function(obj){
                           var target_li = obj.target.tagName=="LI" ? $(obj.target) : $(obj.target).parents("li");                           
                           
                           this.$(".step3 #choose_soruce li").removeClass("selected");
                           this.$(".step3 .soruces").hide();                           
                           this.$(".step3 #area_"+target_li.attr("id")).fadeIn("fast");
                                                      
                           target_li.addClass("selected");
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
                       'keyup #list-search':function(obj){
                           var searchterm = $(obj.target).val();
                           if(searchterm.length){
                               this.$("#remove-search-list").show();                               
                               $("#list_grid tr").hide();
                               searchterm = searchterm.toLowerCase();
                               $("#list_grid tr").filter(function() {                                   
                                    return $(this).text().toLowerCase().indexOf(searchterm) > -1;
                                }).show();
                           }
                           else{
                               this.$("#remove-search-list").hide();
                               $("#list_grid tr").show();
                           }
                                                      
                           
                       },
                       'click #remove-search-list':function(){
                         this.$("#list-search").val('');  
                         this.$("#remove-search-list").hide();
                         $("#list_grid tr").show();
                       },
                       'click #save_results_sf':function(){
                           this.saveResultToSF();
                       },
                       'click #clear_results_sf':function(){
                          this.removeResultFromSF();
                      },
                      'click #campaign_add_to_salesforce':function(obj){
                          this.setSalesForceCombo();
                          var body_id = $(obj.target).attr("accrodion-body");
                          if(obj.target.checked){
                              $("#"+body_id).collapse("show");
                          }
                          else{
                              this.removeResultFromSF();
                              $("#"+body_id).collapse("hide");
                          }
                          obj.stopPropagation();
                      },
                      'click #conversion_filter':function(obj){
                          this.setConversionPage();
                          var body_id = $(obj.target).attr("accrodion-body");
                          if(obj.target.checked){
                              $("#"+body_id).collapse("show");
                          }
                          else{
                              this.removeConversionPage();
                              $("#"+body_id).collapse("hide");
                          }
                          obj.stopPropagation();
                      },
                      'click #save_conversion_filter':function(){
                          this.saveConversionPage();
                      },
                      'click #clear_conversion_filter':function(){
                          this.removeConversionPage();
                      },
                      'click .mergefields-box' :function(obj){
                          this.showMergeFieldDialog(obj);
                      },
                      'click #campaign_isFooterText':function(){
                        this.setFooterArea();
                      },
                      'keyup #copy-camp-search':function(obj){
                           
                      }
                     
                      
                 },

                initialize: function () {
                        this.template = _.template(template);				                        
                        this.tags =  '';
                        this.tag_limit = 5;
                        this.camp_id = 0;
                        this.tags_common =[];
                        this.hasConversionFilter=false;
                        this.hasResultToSalesCampaign=false;
                        this.mergeTags = {};
                        this.allMergeTags = [];
                        this.wp_id = this.options.params.wp_id;
                        this.states = {"step1":{},
                                        "step2":{"templates":null,"events":false,"searchString":"",offset:0,totalcount:0,templateType:'B',getTemplateCall:null,searchValue:'',htmlText:''}
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
                        this.createPopups();                        
                        this.loadDataAjax(); // Load intial Calls
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
                    if(this.camp_id!=="0"){
                        this.loadCampaign(this.camp_id);
                    }
                    this.$el.parents(".ws-content").append(this.bmseditor.$el);
                    this.bmseditor.initEditor({id:this.wp_id});
                   
                },
                initTemplateListing:function(){
                    this.$el.find("#camp_list_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:this.app.get('wp_height')-375,
                            usepager : false,
                            colWidth : ['100%','90px','66px','132px']
                    });
                },
                initListListing:function(){
                    this.$el.find("#list_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:this.app.get('wp_height')-359,
                            usepager : false,
                            colWidth : ['90%','10%']
                    });
                    this.$("#recipients-list,.list-action-btn").css("height",this.app.get('wp_height')-359);
                    this.$("#list_grid tr td:first-child").attr("width","90%");
                    this.$("#list_grid tr td:last-child").attr("width","10%");  
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

                        camp_obj.$("#campaign_unSubscribeType").val(camp_json.unSubscribeType);
                        camp_obj.$("#campaign_profileUpdate").prop("checked",camp_json.profileUpdate=="N"?false:true);
                        camp_obj.$("#campaign_useCustomFooter").prop("checked",camp_json.useCustomFooter=="N"?false:true);
                        camp_obj.$("#campaign_isFooterText").prop("checked",camp_json.isFooterText=="N"?false:true);
                        camp_obj.$("#campaign_tellAFriend").prop("checked",camp_json.tellAFriend=="N" ? false:true );
                        camp_obj.$("#campaign_isTextOnly").prop("checked",camp_json.isTextOnly=="N"?false:true);
                        camp_obj.$("#campaign_isWebVersion").prop("checked",camp_json.isWebVersionLink=="N"?false:true);
                        camp_obj.setFooterArea();
                        //Load tags
                        camp_obj.tags = camp_obj.app.encodeHTML(camp_json.tags);
                        camp_obj.showTags();     
                        if(camp_json.addToSFStatus=='Y'){
                             camp_obj.hasResultToSalesCampaign = true;
                             camp_obj.$("#campaign_add_to_salesforce").prop("checked",true);
                             camp_obj.setSalesForceCombo();
                             camp_obj.$("#sf_campaigns_combo").val(camp_json.sfCampaignID);
                        }
                        else{
                             camp_obj.hasResultToSalesCampaign = false;
                             camp_obj.setSalesForceCombo();
                             camp_obj.$("#campaign_add_to_salesforce").prop("checked",false);   
                        }

                        if(camp_json.conversionFilterStatus=='Y'){
                            camp_obj.$("#conversion_filter").prop("checked",true);                                   
                            camp_obj.hasConversionFilter = true;
                            URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK="+bms_token+"&campNum="+camp_id+"&type=source";

                            jQuery.getJSON(URL,  function(tsv, state, xhr){
                                 var conversation_filter = jQuery.parseJSON(xhr.responseText);
                                 if(camp_obj.app.checkError(conversation_filter)){
                                     return false;
                                 }
                                 camp_obj.setConversionPage();           
                                 if(conversation_filter.ruleCount){                                            
                                     var r = conversation_filter.rules[0].rule1[0];
                                     camp_obj.$("#con_filter_combo").val(camp_obj.app.decodeHTML(r.rule));
                                     camp_obj.$("#con_filter_field").val(camp_obj.app.decodeHTML(r.matchValue));
                                 }

                             });


                        }
                        else{
                            camp_obj.hasConversionFilter = false;
                            camp_obj.$("#conversion_filter").prop("checked",false);
                            camp_obj.setConversionPage();
                            camp_obj.$("#con_filter_combo").val("=");
                            camp_obj.$("#con_filter_field").val("");
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
                },
                createPopups:function(){
                    //Tags Actions handling
                    if($(".tagbox").length===0){
                        $("body").append('<div class="tagbox custom_popup"><input type="text" placeholder="Add Tag" id="camp_tag_text" maxlength="30"><a class="btn-green savebtn left" id="add_tag_btn">Add</a><a class="btn-gray left" id="tag_box_close">Close</a></div>');
                        $("body").append('<div class="tooltip tags-div custom_popup" style="display:none"><a class="left"><span class="icon edit"></span></a><a class="right"><span class="icon delete"></span></a></div>');                    
                    }
                    var active_ws = $(".ws-content.active ");
                    active_ws.find("#add_tag_li").click(_.bind(this.showAddTagBox,this));
                    $(".tagbox").click(function(event){
                        event.stopPropagation();
                    });
                    $("#tag_box_close").click(function(){
                        $(".tagbox").hide();
                    });
                    active_ws.find(".tagscont .ellipsis").click(_.bind(function(){
                       var active_ws = this.$el.parents(".ws-content");  
                       active_ws.find("#camp_tags").toggleClass("overflow");
                       active_ws.find(".tagscont .tags-buttons").toggleClass("overflow");
                    },this));
                    active_ws.find("#camp_tags").click(function(obj){
                        $(".custom_popup").hide();
                        obj.stopPropagation();
                    });
                                                            
                    
                    $(".tags-div .edit").click(_.bind(function(obj){
                        var span = $.getObj(obj,"span");
                        var span_id = span.attr("id").split("_")[2];
                        this.showAddTagBox(false,span_id);
                        $(".tags-div").hide();   
                        obj.stopPropagation();
                    },this));
                    
                    $(".tags-div .delete").click(_.bind(function(obj){
                        var span = $.getObj(obj,"span");
                        var span_id = span.attr("id").split("_")[2];
                        this.deleteTag(span_id);                        
                    },this));
                }
                ,
                initHeader:function(){
                  var previewIconCampaign = $('<a class="icon preview"></a>');  
                  var editIconCampaign = $('<a class="icon edit"></a>');
                  var deleteIconCampaign = $('<a class="icon delete"></a>');
                  var active_ws = this.$el.parents(".ws-content");
                  var header_title = active_ws.find(".edited  h2");
                  header_title.append(previewIconCampaign);
                  header_title.append(editIconCampaign);
                  header_title.append(deleteIconCampaign);
                  active_ws.find(".camp_header").addClass("heighted-header");
                  active_ws.find("#header_wp_field").attr("placeholder","Type in Campaign Name");
                  active_ws.find("#save_campaign_btn").click(_.bind(this.saveCampaign,this));               
                  
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
                setupCampaign:function(){
                  var active_ws = this.$el.parents(".ws-content");
                  if(this.camp_id===0){                      
                      active_ws.find(".camp_header .c-name h2").hide();                      
                      active_ws.find(".camp_header .c-name .edited ").show();                      
                      active_ws.find("#camp_tags").children().remove();
                      active_ws.find(".tags-contents,.ellipsis").hide();                      
                      active_ws.find("#header_wp_field").focus().val('');
                      active_ws.find(".step-contents").find("input,select,textarea").prop("disabled",true);
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
                    if(proceed!==0){
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
                                 if(step1_json[0]!=="err"){
                                     camp_obj.app.showMessge("Step 1 saved successfully!");
                                 }
                                 else{
                                    camp_obj.app.showMessge(step1_json[0]); 
                                 }
                        });
                        proceed = 1;
                    }
                    
                    return proceed;
                },
                saveStep2:function(){                 
                 var camp_obj = this; 
                 var html = this.$(".step2 #choose_soruce li.selected").attr("id")!=="html_code" ?tinyMCE.get('bmseditor_'+this.wp_id).getContent():this.$("textarea#myhtml").val();
                 var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                   $.post(URL, { type: "saveStep2",campNum:this.camp_id,
                                 htmlCode: html      
                         })
                        .done(function(data) {                                 
                            var step1_json = jQuery.parseJSON(data);
                            camp_obj.bmseditor.$el.find(".saving").removeClass("saving");
                            if(step1_json[0]!=="err"){
                                camp_obj.app.showMessge("Step 2 saved successfully!");
                                camp_obj.states.step2.htmlText = html;
                            }
                            else{
                               camp_obj.app.showMessge(step1_json[0]); 
                            }
                   });
                  return 1;  
                },
                saveStep3:function(){
                  return 1;  
                },
                saveStep4:function(){
                  return -1;  
                },
                initTpyeAhead:function(){
                  var camp_obj = this;  
                  //Create Type ahead
                  URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=allCampaignTags";                    
                        jQuery.getJSON(URL,  function(tsv, state, xhr){
                           if(xhr && xhr.responseText){                        
                                var tags_json = jQuery.parseJSON(xhr.responseText);                                
                                if(camp_obj.app.checkError(tags_json)){
                                    return false;
                                }
                                camp_obj.tags_common = tags_json.tags.split(",");

                                var typeahead = $('#camp_tag_text').data('typeahead');
                                if(typeahead) typeahead.source = camp_obj.tags_common;
                                else $('#camp_tag_text').typeahead({source: camp_obj.tags_common,items:10});
                           }
                     }).fail(function() { console.log( "error in common tags" ); });
                  
                },
                loadDataAjax:function(){
                    var camp_obj = this;       
                    
                    //Loading Campaigns list
                    this.app.showLoading(true,camp_obj.$el.find("#target-lists"));
                    
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=listNormal";                                                            
                    
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var camps_json = jQuery.parseJSON(xhr.responseText);
                            if(camp_obj.app.checkError(camps_json)){
                                return false;
                            }
                            camp_obj.createCampaignListTable(xhr);
                            
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
                        }
                    }).fail(function() { console.log( "error lists listing" ); });
                    
                    URL = "/pms/io/salesforce/getSalesforceData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status";
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                             var setting_json = jQuery.parseJSON(xhr.responseText);
                             if(camp_obj.app.checkError(setting_json)){
                                return false;
                             }
                             if(setting_json.isSalesforceUser=="Y"){
                                 camp_obj.$("#add_result_salesforce").show();
                                 camp_obj.showSalesForceCampaigns();
                             }
                             else{
                                 camp_obj.$("#add_result_salesforce").hide();
                             }
                        }
                    }).fail(function() { console.log( "error sales force status call" ); });
                    
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
                    camp_obj.initTpyeAhead();
                    
                    $("#add_tag_btn").click(_.bind(this.addTag,this));
                    $("#camp_tag_text").keyup(_.bind(this.addTagEnter,this));
                                        
                    this.showTagAction();
                    
                    $(".mergefields").click(function(e){
                        e.stopPropagation();
                    });
                    
                   
                    
                    var wp_length = $(".ws-tabs li").length-1;
                    this.$("#accordion_setting").attr("id","accordion_setting"+wp_length);
                    this.$("#accordion_setting"+wp_length+" .accordion-toggle").attr("data-parent","#accordion_setting"+wp_length);
                    
                    var acc_group = this.$("#accordion_setting"+wp_length+" .accordion-group");
                    acc_group.each(function(){
                       var id =   $(this).find(".accordion-body").attr("id");
                       $(this).find(".accordion-toggle").attr("href","#"+id+wp_length);
                       $(this).find(".accordion-body").attr("id",id+wp_length);
                       $(this).find(".accordion-heading input[type='checkbox']").attr("accrodion-body",id+wp_length);
                    });
                    
                    /*var xhr = {};
                    xhr.responseText = '{"count": "85","lists":[{"list1":[{"creationDate": "2012-07-27","tags": "","campaignSentCount": "0","name": "Abandoned Shopping Carts","listNum": "qcWQe30Wh33Jb26Hi17Mk20qcW","md5": "4b7dc121caf2baf0963a047346fc8df6","subscriberCount": "705","isSupressList": "false"}],"list2":[{"creationDate": "2008-02-05","tags": "","campaignSentCount": "0","name": "All Synch Leads","listNum": "kzaqwKb26Bb17Gd20Mi21Uh30kzaqw","md5": "7d24c36ac85da6029d610602b6994085","subscriberCount": "712","isSupressList": "false"}]}]}';
                    this.createListTable(xhr);*/
                },
                createListTable:function(xhr){                    
                    this.$el.find("#target-lists").children().remove();
                    var camp_list_json = jQuery.parseJSON(xhr.responseText);
                    if(this.app.checkError(camp_list_json)){
                        return false;
                     }
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="list_grid"><tbody>';
                    this.$el.find(".list-count").html("Displaying <b>"+camp_list_json.count+"</b> lists");
                    $.each(camp_list_json.lists[0], function(index, val) {     
                        list_html += '<tr id="row_'+val[0].listNum+'">';                        
                        list_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3>   <div class="  tags"><h5>Tags:</h5><a class=""> Business </a>,<a class=""> marketing </a>,<a class=""> online shopping </a>, <a class=""> amazon </a></div></div></td>';                        
                        list_html += '<td><div class="subscribers show"><span  class=""></span>'+val[0].subscriberCount+'</div><div id="'+val[0].listNum+'" class="action"><a class="btn-green">Add</a></div></td>';                        
                        list_html += '</tr>';
                    });
                    list_html += '</tbody></table>';

                    this.$el.find("#target-lists").html(list_html);                                                            
                    this.initListListing();
                    
                    this.$el.find(".target-listing .action").click(_.bind(this.addToRecipients,this));
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
                        if(before_id){
                            tr_copy.insertBefore(me.$("#list_grid #"+before_id));
                        }
                        else{
                            tr_copy.appendTo(me.$("#list_grid tbody"));
                        }
                        tr_copy.fadeIn("fast");

                    });
                },
                addTagEnter:function(obj){
                    if(obj && obj.keyCode==13 && $(".typeahead").css("display")==="none"){
                        $("#add_tag_btn").click();                        
                    }
                },
                addTag:function(obj){
                    var tag = $("#camp_tag_text").val();
                    
                    if(this.tagValidation(tag)){                        
                        tag = this.app.encodeHTML(tag);
                        var camp_id= this.camp_id;
                        var add_btn = $.getObj(obj,"a");                        
                        var camp_obj = this;
                        var temp_tags = "";
                        if(add_btn.attr("edit_id")){
                            temp_tags = this.editTags(add_btn.attr("edit_id"),tag);
                        }
                        else{
                            temp_tags = (this.tags)?(this.tags+","+tag):tag;
                        }
                        $("#camp_tag_text").prop("disabled",true);
                        $("#add_tag_btn").prop("disabled",true).addClass("saving");
                        var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                        $.post(URL, { campNum: camp_id, type: "tags",tags:this.app.decodeHTML(temp_tags) })
                            .done(function(data) {
                                var tag_json = jQuery.parseJSON(data);
                                if(camp_obj.app.checkError(tag_json)){
                                    return false;
                                 }
                                if(tag_json[0]=="success"){
                                    camp_obj.tags = temp_tags;
                                    camp_obj.showTags();                                                                
                                }
                                $("#camp_tag_text").prop("disabled",false).val('');
                                $("#add_tag_btn").prop("disabled",false).removeClass("saving");
                                if(add_btn.attr("edit_id")){
                                   $(".tagbox").hide(); 
                                }
                                else{
                                    $(".tagbox").hide(); 
                                    if(camp_obj.tags.split(",").length<5){
                                        $("#add_tag_li").click();
                                    }
                                }
                                camp_obj.initTpyeAhead();
                         });
                        
                    }
                },
                tagValidation:function(tag){
                    var isValid = true;
                    var tags_arr = this.tags.split(",");
                    var edit_id = $("#add_tag_btn").attr("edit_id");
                    if($.trim(tag)==""){
                        isValid = false;
                    }
                    else if(tag.length>30){                        
                        this.app.showAlert('Tag lenght shouldn\'t be greater than 30 characters.',this.$el.parents(".ws-content"));
                        isValid = false;
                    }
                    else if(tag.indexOf(",")>-1){                        
                        this.app.showAlert('Tag shouldn\'t contain ",".',this.$el.parents(".ws-content"));
                        isValid = false;
                    }
                    else if($.inArray(this.app.encodeHTML(tag),tags_arr)>-1){                        
                        if(!edit_id){                            
                            this.app.showAlert('Tag already exists with same name.',this.$el.parents(".ws-content"));
                            isValid = false;
                        }
                        else if($.inArray(this.app.encodeHTML(tag),tags_arr)!=parseInt(edit_id)){                            
                            this.app.showAlert('Tag already exists with same name.',this.$el.parents(".ws-content"));
                            isValid = false;
                        }
                    }                    
                    else if(!edit_id && tags_arr.length>=this.tag_limit){                        
                        this.app.showAlert('You can enter '+this.tag_limit+' tags for campaign.',this.$el.parents(".ws-content"));
                        isValid = false;
                    }
                    if(isValid===false){
                        $(".custom_popup").hide(); 
                    }
                    return isValid;
                },
                editTags:function(index,newVal){
                    var tags_array = this.tags.split(",");
                    tags_array[index] = newVal;
                    return tags_array.join();                    
                },
                showAddTagBox:function(obj,fromObj){
                    if(this.tags.split(",").length<5 || obj===false){
                        var li = null;   
                        var left_minus = 0;
                        if(typeof(fromObj)!="undefined"){
                            li = $("#camp_tag_"+fromObj);
                            $("#add_tag_btn").html("Save").attr("edit_id",fromObj);
                            var tags_array = this.tags.split(",");
                            $(".tagbox input#camp_tag_text").val(this.app.decodeHTML(tags_array[fromObj]));
                            left_minus = 10;
                        }
                        else{
                            li = $.getObj(obj,"div");
                            $("#add_tag_btn").html("Add").removeAttr("edit_id");
                            $(".tagbox input#camp_tag_text").val("");
                        }
                        var ele_offset = li.offset();                    
                        var ele_height =  li.height();
                        var top = ele_offset.top + ele_height;
                        var left = ele_offset.left-left_minus;            
                        $(".custom_popup").hide();

                        $(".tagbox").css({"left":left+"px","top":top+"px"}).show();
                        $(".tagbox input#camp_tag_text").focus();
                    }
                    else{
                        this.app.showAlert('You cann\'t create more than 5 tags.',this.$el.parents(".ws-content.active"));
                    }
                    if(obj){
                        obj.stopPropagation();
                    }
                },
                deleteTag:function(id){
                   var camp_id= this.camp_id; 
                    var camp_obj = this;
                    
                    var temp_tags = "";
                    var tags_array = this.tags.split(",");
                    tags_array.splice(id,1);
                    temp_tags = tags_array.join();
                    
                    this.tags = temp_tags;
                    this.showTags();
                    
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, { campNum: camp_id, type: "tags",tags:this.app.decodeHTML(temp_tags) })
                    .done(function(data) {
                        var tag_json = jQuery.parseJSON(data);   
                        if(camp_obj.app.checkError(tag_json)){
                            return false;
                         }
                        if(tag_json[0]=="success"){
                            camp_obj.tags = temp_tags;
                            camp_obj.initTpyeAhead();
                        }
                    });    
                },
                showTags:function(){
                    var tags = this.tags;
                    var tags_ul = this.$el.parents(".ws-content.active").find(".camp_header ul#camp_tags");
                    tags_ul.children().remove();  
                    if(tags!==""){
                        var tags_array = tags.split(",");
                        $.each(tags_array,function(i,t){
                            var char_comma = (i<tags_array.length-1)?",":"";
                            var li_html ='<li id="camp_tag_'+i+'"><a class="tag" > '+t+'</a>'+char_comma+'<div class="tooltip"><a class="left"><span class="icon edit"></span></a>';
                                li_html +='<a class="right"><span class="icon delete"></span></a></div></li>';
                            tags_ul.append($(li_html));        
                        });                            
                        this.showTagAction();
                    }
                    
                    if(tags_ul.children().length==0){
                       $(".ws-content.active .tags-contents").hide();
                     }
                    else{
                       $(".ws-content.active .tags-contents").css("display","inline-block"); 
                       var tags_ul = $(".ws-content.active .tags-contents #camp_tags");
                       tags_ul.css("width","auto");
                       if(tags_ul.width()>260){
                           tags_ul.css("width","250px");
                           $(".ws-content.active .tags-buttons .ellipsis").css("display","inline-block");
                       }
                       else{
                           tags_ul.removeClass("overflow");
                           $(".ws-content.active  .tagscont .tags-buttons").removeClass("overflow");
                           $(".ws-content.active  .tags-buttons .ellipsis").hide();
                       }
                    }
                    
                    
                },
                showTagAction:function(){
                    var tags_li = $("#camp_tags li");                    
                    
                    tags_li.click(_.bind(function(obj){
                        var li = $.getObj(obj,"li");
                        var ele_offset = $(obj.target).offset();
                        var ele_width =  $(obj.target).width();
                        var ele_height =  $(obj.target).height();
                        var top = ele_offset.top + ele_height;
                        var left = ele_offset.left + (ele_width/2 - 10);
                        
                        
                        if(li.attr("id")){
                            $(".tags-div .edit").attr("id","edit_tag_"+li.attr("id").split("_")[2]);                     
                            $(".tags-div .delete").attr("id","delete_tag_"+li.attr("id").split("_")[2]);
                        }
                        $(".custom_popup").hide();
                        $(".tags-div").css({"left":left+"px","top":top+"px"}).show();
                        obj.stopPropagation();
                    },this));
                },
                showSalesForceCampaigns:function(){
                    var camp_obj =this;
                    var URL = "/pms/io/salesforce/getSalesforceData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=sfCampaignList"; 
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var camps_html = '<select data-placeholder="Choose a Salesforce Campaign..." class="chosen-select" id="sf_campaigns_combo" disabled="disabled" >';
                            camps_html += '<option value="">Select Salesforce Campaign</option>';
                             var s_camps_json = jQuery.parseJSON(xhr.responseText);
                             if(camp_obj.app.checkError(s_camps_json)){
                                return false;
                             }
                             $.each(s_camps_json.campList[0], function(index, val) {     
                                camps_html += '<option value="'+val[0].sfCampaignID+'">'+val[0].name+'</option>';
                            });
                            camps_html +="</select>";
                            camp_obj.$("#salesforce_campaigns").html(camps_html);
                            
                            //camp_obj.$("#sf_campaigns_combo").chosen({no_results_text:'Oops, nothing found!'});
                        }
                    }).fail(function() { console.log( "error fetch sales force campaign" ); });  
                },
                saveResultToSF:function(){
                    var camp_obj =this;
                    var camp_id= this.camp_id;
                    if(this.validateRSF()){
                        var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');                        
                        this.$("#save_results_sf").addClass("saving");
                        $.post(URL, { campNum: camp_id,sfCampaignID: $("#sf_campaigns_combo").val() , add:'Y',type:"addToSaleforce"})
                        .done(function(data) {                            
                            camp_obj.$("#save_results_sf").removeClass("saving");
                            camp_obj.hasResultToSalesCampaign = true;
                        });    
                    }                    
                },
                removeResultFromSF:function(){   
                    var camp_obj =this;
                    var camp_id= this.camp_id;
                    var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                    if(this.hasResultToSalesCampaign){                        
                        $.post(URL, { campNum: camp_id,add:'N',type:"addToSaleforce"})
                        .done(function(data) {                          
                            camp_obj.$("#campaign_add_to_salesforce").prop("checked",false);
                            camp_obj.setSalesForceCombo();
                            camp_obj.hasResultToSalesCampaign = false;
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
                    if(this.$("#campaign_add_to_salesforce")[0].checked){
                        this.$("#sf_campaigns_combo").prop("disabled",false);
                    }
                    else{
                         this.$("#sf_campaigns_combo").prop("disabled",true).val("");
                    }
                },
                setConversionPage:function(){
                    if(this.$("#conversion_filter")[0].checked){
                        this.$("#con_filter_combo,#con_filter_field").prop("disabled",false);
                    }
                    else{
                       this.$("#con_filter_combo,#con_filter_field").prop("disabled",true); 
                       this.$("#con_filter_field").val("");
                       this.$("#con_filter_combo").val("#");
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
                               rule:this.$("#con_filter_combo").val(),
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
                    if(this.hasConversionFilter){                        
                        $.post(URL, { campNum: camp_id ,
                               type:"delete"})
                        .done(function(data) {                          
                            camp_obj.$("#conversion_filter").prop("checked",false);
                            camp_obj.setConversionPage();
                            camp_obj.hasConversionFilter = false;
                            
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
                    }
                    else{
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
                    var camp_obj = this;
                    var templates_html = "";
                     if(this.$("#template_search_menu li.active").length){
                        var text = (this.$("#template_search_menu li.active").attr("text-info").toLowerCase().indexOf("templates")>-1)?"":(this.$("#template_search_menu li.active").attr("text-info").toLowerCase()+" ");  
                        this.$("#total_templates").html(this.states.step2.totalcount+" <b>"+text+"</b> templates found");                         
                    }
                    else if($.trim(this.$("#search-template-input").val())!==""){
                        this.$("#total_templates").html(this.states.step2.totalcount+" templates found <b>for '"+$.trim(this.$("#search-template-input").val())+"'</b>");                         
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
                        
                        template_html.find(".select-template").click(_.bind(function(obj){
                              this.setEditor();
                              var target = $.getObj(obj,"a");
                              var bms_token =this.app.get('bms_token');
                              this.app.showLoading('Loading HTML...',$(".fullwindow.campaign-content"));
                              var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK="+bms_token+"&type=html&templateNumber="+target.attr("id").split("_")[1];                              
                              jQuery.getJSON(URL,_.bind(this.setEditorHTML,this));
                              
                        },this));
                    }
                    if((this.states.step2.offset + parseInt(this.states.step2.templates.count))<parseInt(this.states.step2.totalcount)){
                        this.$(".step2 .thumbnails li:last-child").attr("data-load","true");
                    }
                    this.$(".footer-loading").hide();
                    
                },
                copyCampaign:function(obj){
                    this.setEditor();
                    var target = $.getObj(obj,"div");
                    var bms_token =this.app.get('bms_token');
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
                    
                }
                
        });
});