/* 
 * Name: Setting View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Display Setting Dialog
 * Dependency: Setting HTML
 */
define(['text!reports/summary/html/settings.html','jquery.icheck'],
function (template,icheck) {
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
                 this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON())); 
                this.defaultValues();
                this.recipientsType();
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
                        this.$el.find("#campaign_profileUpdate").prop("checked",this.model.get('profileUpdate')=="N"?false:true);
                        this.$el.find("#campaign_isTextOnly").prop("checked",this.model.get('isFooterText')=="N"?false:true);
                        this.$el.find("#campaign_isWebVersion").prop("checked",this.model.get('isWebVersionLink')=="N"?false:true);
                        
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
                                                  list = k.encode + ',';
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
                 var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list_csv&listNum_csv="+lists;
                    jQuery.getJSON(URL,  function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var result = jQuery.parseJSON(xhr.responseText);                            
                            if(that.app.checkError(result)){
                                return false;
                            }
                            var span = "";
                            if(result.count !="0"){
                                _.each(result.lists[0],function(key){
                                    _.each(key,function(value){
                                        span += "<span>"+value.name+"</span>"
                                    })
                                       
                                    
                                })
                                    var str = "<i class='icon "+type.toLowerCase()+"'></i>"; 
                                     str +="<strong>"+type+" </strong>";                                
                                     str+=span;
                                     that.$el.find(".recepient_type").html(str);
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
