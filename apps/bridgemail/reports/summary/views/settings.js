/* 
 * Name: Setting View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Display Setting Dialog
 * Dependency: Setting HTML
 */
define(['text!reports/summary/html/settings.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
            className: 'camp_set',
            events: {
                
            },
            initialize: function () {
                 this.template = _.template(template);	
                 this.app = this.options.app;
                 this.botId = this.options.botId;
                 this.trackId = this.options.trackId;
                 this.campid = this.options.campId;
                 this.dialog = this.options.dialog;
                 this.render();
            },
            render: function () {
                
                if(this.campid){
                     this.app.showLoading("Loading Settings...",this.dialog.getBody());
                    this.getCampDetails();
                }else{
                    this.$el.html(this.template(this.model.toJSON())); 
                    this.defaultValues();
                    this.recipientsType();
                   
                    
                }
                 if (this.$el.find('.ssbox_wrap').length %2 != 0){
                                    // Odd
                                    this.$el.find('.ssbox_wrap:last-child').addClass('span12');
                                    this.$el.find('.ssbox_wrap:last-child').removeClass('span6');
                                }
               
                
            },
            checkSubscriber:function(){
                if(this.model.get('isWebVersionLink') == "S")
                  return "checked";
            },
            defaultValues:function(){
                  this.$el.find(".from-email").html(this.app.encodeHTML(this.model.get('fromEmail')));
                  var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");                             
                  if( merge_field_patt.test(this.app.decodeHTML(this.model.get('fromEmail')) && this.model.get('defaultFromEmail'))){                    
                    this.$el.find(".from-email").append($('<em >Default Value: <i >'+this.app.encodeHTML(this.model.get('defaultFromEmail'))+'</i></em>'));
                  }
                  if(this.model.get('senderName')){
                       this.$el.find(".from-name").html(this.app.encodeHTML(this.model.get('senderName')));                      
                  }
                  else{
                      this.$el.find(".from-name").html('MakesBridge Technology');
                  }                                    
                  if(this.model.get('defaultSenderName')){
                    this.$el.find(".from-name").append($('<em >Default Value: <i >'+this.app.encodeHTML(this.model.get('defaultSenderName'))+'</i></em>'));
                  }
                  
                  this.$el.find(".reply-to").html(this.app.encodeHTML(this.model.get('replyTo')));
                  if(this.model.get('defaultReplyTo')){                    
                    this.$el.find(".reply-to").append($('<em >Default Value: <i >'+this.app.encodeHTML(this.model.get('defaultReplyTo'))+'</i></em>'))
                  } 
                        this.$el.find("#campaign_profileUpdate").prop("checked",this.model.get('subInfoUpdate')=="N"?false:true);
                        this.$el.find("#campaign_isTextOnly").prop("checked",this.model.get('isFooterText')=="N"?false:true);
                        this.$el.find("#campaign_isWebVersion").prop("checked",this.model.get('isWebVersionLink')=="N"?false:true);
                        this.$el.find("#campaign_tellafriend").prop("checked",this.model.get('tellAFriend')=="N"?false:true);
                        
                         this.$('input').iCheck({
                                checkboxClass: 'checkinput'
                         });
                this.$('input.checkpanel').iCheck({
                         checkboxClass: 'checkpanelinput',
                         insert: '<div class="icheck_line-icon"></div>'
                });
                this.$('.checkinput').css('cursor','default');
                       this.$el.find("#campaign_profileUpdate").prop("disabled",true);
                        this.$el.find("#campaign_isTextOnly").prop("disabled",true);
                        this.$el.find("#campaign_isWebVersion").prop("disabled",true);
                        this.$el.find("#campaign_tellafriend").prop("disabled",true);
                        
                if(this.model.get('conversionFilterStatus')=="Y"){
                                    this.getConversion();
                                }
                            
            },
            checkShowWebVersion:function(ev){
               if(this.model.get('isWebVersionLink') == "Y")
                 return "checked";

            },
            checkTextOnly:function(){
                if(this.model.get('isTextOnly') == "Y")
                 return "checked ";
                
            },
            checkTellAFriend:function(){
                if(this.model.get('tellafriend') == "Y")
                 return "checked ";
                
            },
            checkUseCustomFooter:function(){
                if(this.model.get('useCustomFooter') == "Y")
                 return "checked ";
            },
            isFooterText:function(){
                if(this.model.get('isFooterText') == "Y")
                return "Company and Physical Address in email footer:";
            },
            getCampDetails: function(){
                var _this = this;
                var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=basic&campNum="+this.model.get('campNum.encode');
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                          if(xhr && xhr.responseText){
                            var result = jQuery.parseJSON(xhr.responseText);                            
                            if(_this.app.checkError(result)){
                                return false;
                            }               
                                
                                _this.model.set(result);
                                _this.$el.html(_this.template(_this.model.toJSON())); 
                                _this.defaultValues();
                                _this.recipientsType();
                                if(_this.model.get('sfCampaignID')){
                                    _this.getSfCamp();
                                }
                                if(_this.model.get('nsCampaignID')){
                                    _this.getNsCamp();
                                }
                                
                                if (_this.$el.find('.ssbox_wrap').length %2 != 0){
                                    // Odd
                                    _this.$el.find('.ssbox_wrap:last-child').addClass('span12');
                                    _this.$el.find('.ssbox_wrap:last-child').removeClass('span6');
                                }
                                
                                 var higher=[];
                                $.each(_this.$el.find('.ss_head_box'),function(k,v){
                                higher[k] = $(v).outerHeight() - 30;

                                

                                });
                                var max = higher.reduce(function(a, b) {
                                    return Math.max(a, b);
                                });
                               
                                _this.$el.find('.ss_head_box .camp_set_boxinner').css('min-height',max+'px');

                                
                                _this.app.showLoading(false,_this.dialog.getBody())
                                //_this.render({isRenderCustom:true});
                            }
                        });
            },
            getSfCamp: function(){
                var _this = this;
                var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=sfCampaignList";
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                          if(xhr && xhr.responseText){
                            var result = jQuery.parseJSON(xhr.responseText);                            
                            if(_this.app.checkError(result)){
                                    return false;
                                }               
                                
                              $.each(result.campList[0],function(key,val){
                                  if(val[0].sfCampaignID == _this.model.get('sfCampaignID')){
                                      _this.$el.find('#sf-camp-container strong').html(val[0].name);
                                  }
                              });  
                            }
                        });
            },
            getNsCamp:function(){
                var _this = this;
                var URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=nsCampaignList";
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                          if(xhr && xhr.responseText){
                            var result = jQuery.parseJSON(xhr.responseText);                            
                            if(_this.app.checkError(result)){
                                    return false;
                                }               
                              if(result.count !="0"){
                                 $.each(result.campList[0],function(key,val){
                                  if(val[0].id == _this.model.get('nsCampaignID')){
                                      _this.$el.find('#ns-camp-container strong').html(val[0].title);
                                  }
                                });   
                              }
                              
                            }
                        });
            },
            getConversion : function(){
                var _this = this;
                var URL = "/pms/io/filters/getLinkIDFilter/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=get&campNum="+this.model.get('campNum.encode');;
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                          if(xhr && xhr.responseText){
                            var result = jQuery.parseJSON(xhr.responseText);                            
                            if(_this.app.checkError(result)){
                                    return false;
                                }               
                               var rule ;
                              $.each(result.rules[0],function(key,val){
                                  console.log(val);
                                  if(val[0].rule=="ct"){
                                      rule ='Contain';
                                  }else{
                                      rule = 'Equals'
                                  }
                                  
                                  _this.$el.find('#cov-matchtype-contain strong').html(rule);
                                  _this.$el.find('#cov-matchtype-value strong').html(val[0].matchValue);
                                 /* if(val[0].id == _this.model.get('nsCampaignID')){
                                      _this.$el.find('#ns-camp-container strong').html(val[0].title);
                                  }*/
                              });  
                            }
                        });
            },
            recipientsType:function(){
                if(this.model.get('recipientType') !="List" && this.model.get('recipientType') != "Tags" && this.model.get('recipientType') !="Target"){
                    var str = "<i class='icon "+this.model.get('recipientType').toLowerCase()+"'></i>"; 
                    str +="<strong>"+this.model.get('recipientType')+" </strong>";                                
                    this.$el.find(".recepient_type").html(str);
                    return false;
                }
                var that = this;
                 var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=recipientType&campNum="+this.model.get('campNum.encode');
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                          if(xhr && xhr.responseText){
                            var result = jQuery.parseJSON(xhr.responseText);                            
                            if(that.app.checkError(result)){
                                return false;
                            }
                            if(that.model.get('recipientType') == "Tags"){
                               var str = '<div  class="template-container tagsbox rightcol" style="overflow-y: auto;min-height:60px;">';
                                str +='<div id="tagsrecpslist" class="tagscont tagslist">';
                                str += "<i class='icon tags'></i>"; 
                                str +="<strong> Tags </strong>"; 
                                str +='<ul>';
                                 URL = "/pms/io/user/getData/?BMS_REQ_TK=" + that.app.get('bms_token') + "&type=subscriberTagCountList";
                                jQuery.getJSON(URL, function(tsv, state, xhr) {
                                if (xhr && xhr.responseText) {
                                    var tags_array = jQuery.parseJSON(xhr.responseText);
                                    if (tags_array[0] != 'err'){
                                        var tagsApp = tags_array.tagList;
                                        var tags = result.targetTags.split(',');
                                            _.each(tagsApp,function(key,value){
                                                  _.each(key,function(k,v){
                                                          if($.inArray(k[0].tag,tags) != "-1"){
                                                            str +=  '<li class="action new-added"  checksum="' + k[0].tag + '"><a class="tag"><span>' + k[0].tag + '</span><strong class="badge">'+k[0].subCount +'</strong></a></li>';
                                                        }
                                                })
                                            })
                                         str +='</ul>';
                                        str +='</div>';
                                        str +='</div>';
                                        that.$el.find(".recepient_type").html(str);
                                        
                                    }
                                  }
                               });
                               return false;
                              }                                                                                         
                                var list = "";
                                if(((result.type == "List") || (result.type == "Target")) && result.count != "0"){
                                      var res = "";
                                      if((result.type == "Target")){
                                          res = result.filterNumbers;
                                      }else{
                                          res = result.listNumbers;
                                      }
                                      _.each(res,function(idx){
                                            _.each(idx,function(key,value){
                                               _.each(key,function(k,v){
                                                  list += k.encode + ',';
                                               })
                                            })
                                    })
                                    if(list){
                                        return that.fetchLists(list,result.type);
                                    }
                                }else{
                                    var str = "<i class='icon "+result.type.toLowerCase()+"'></i>"; 
                                    str +="<strong>" +result.type+" </strong>";                                
                                    str += "<span> Not found</span>";
                                    that.$el.find(".recepient_type").html(str);
                                    return false;
                                }
                                
                               
                            }
                        });
                   
                
                
              
            },
            fetchLists:function(lists,type){ 
                    var that = this; 
                    
                    var URL = "";
                    if(type.toLowerCase()=="target"){
                      URL =  "/pms/io/filters/getTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&offset=0&type=list_csv&filterNumber_csv="+lists
                    }
                    else{
                        URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list_csv&listNum_csv="+lists;
                    }
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var result = jQuery.parseJSON(xhr.responseText);                            
                            if(that.app.checkError(result)){
                                return false;
                            }
                            var span = "";
                            var str ="";
                            if(result.count !="0"){
                                var results = type=="List"?result.lists[0]:result.filters[0];
                                  _.each(results,function(key){
                                    _.each(key,function(value){
                                        
                                        str += "<div class='recepient_type'><i class='icon "+type.toLowerCase()+"'></i>"; 
                                        str +="<strong>"+type+" </strong>";
                                        str += "<span>"+value.name+"</span></div>";
                                        
                                    })
                                    
                                })
                                    that.$el.find(".recepient_type").parent().html('');
                                    that.$el.find("#recepient_type_wrap").html(str);
                                    
                                     
                                     
                                     return str;
                            }else{
                                 var str = "<i class='icon "+type.toLowerCase()+"'></i>"; 
                                     str +="<strong>"+type+" </strong>";                               
                                     str+= "Not Found";
                                     that.$el.find(".recepient_type").html(str);
                                     return str;
                            }
                             
                            
                        }
                        
                    });
              }
            
        });
});
