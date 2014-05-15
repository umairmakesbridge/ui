define(['text!nurturetrack/html/message_row.html','jquery-ui','bms-addbox'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Target li view for nurture track 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'accordion-group message-nurturetrack',
            /**
             * Attach events on elements in view.
            */
            events: {
             'click .delete-row':'deleteRow',
             'click .timer-group button':'showTimer',
             'click .edit-message ':'editMessage',
             'click .preview': 'previewCampaign',
             'click .save-message': 'saveMessage'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page;
                    this.btnRow = this.options.buttonRow;
                    this.object = this.options.object;
                    this.waitView = null;
                    if(this.object){
                        this.messageLabel = this.object[0]["label"];
                    }
                    else{
                        this.messageLabel = 'Message Label';
                    }
                    this.camp_json = null;
                    this.triggerOrder = this.options.triggerOrder;                    
                    this.app = this.parent.app; 
                    this.isWait = false;
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({
                    model: this.model,
                    no : this.triggerOrder,
                    title: this.messageLabel
                }));                
                this.$(".btn-group").t_button();               
                this.$(".timebox-hour").spinner({max: 12,min:1
                });
                this.$(".timebox-min").spinner({max: 59,min:0,stop: function( event, ui ) {
                            if($(this).val().length==1){
                                $(this).val("0"+$(this).val())
                            }
                     }
                });
                if(this.object && this.object[0].timeOfDay==="0"){
                    var hour = this.object[0].timeOfDayHrs;
                    if(hour>=12){
                        var hour = hour-12;                            
                        this.$(".timebox-hours button.am").removeClass("active");
                        this.$(".timebox-hours button.pm").addClass("active");
                    }
                    else{
                        this.$(".timebox-hours button.am").addClass("active");                        
                    }
                    hour = hour==0 ? "12":hour;
                    this.$(".timebox-hour").val(hour);
                    this.$(".timebox-min").val(this.addZero(this.object[0].timeOfDayMins));                    
                    this.$(".timer-group button:first-child").removeClass("active");
                    this.$(".timer-group button:last-child").addClass("active");
                    this.$(".set-time").show();
                }
                else{
                    this.$(".timebox-hour").val("09");
                    this.$(".timebox-min").val("00");
                }
                this.$(".title").addbox({app:this.app,addBtnText:'Save',placeholder_text:'Write Message Name here',
                                        addCallBack:_.bind(this.renameLabel,this)
                                        ,showCallBack:_.bind(this.showLabel,this)
                                        });
               this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
               if(this.object){
                    this.loadCampaign();                    
               }
               this.$el.attr("t_order",this.triggerOrder);
            },
            deleteRow:function(){                
                if(this.isWait){
                    this.$el.prev().remove();                                   
                }
                this.$el.remove();                
                if(this.btnRow){
                    this.btnRow.remove();                    
                }
                if(this.triggerOrder){
                var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'deleteMessage',trackId:this.parent.track_id,triggerOrder:this.triggerOrder})
                    .done(_.bind(function(data) {                                             
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                               this.parent.refreshMessages(this.triggerOrder);
                                
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                }   
            },
            showTimer:function(e){
                var btn = $.getObj(e,"button");
                if(btn.attr("rel")=="i"){
                    this.$(".set-time").hide();
                }
                else{
                    this.$(".set-time").show();
                }
            },
            renameLabel:function(label,ele){
                if(this.triggerOrder){
                    var add_box = ele.data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    add_box.dialog.find(".input-field").attr("disabled",true);
                    var URL =  URL = "/pms/io/trigger/saveNurtureData/";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),trackId:this.parent.track_id,type:"labelMessage",label:label,triggerOrder:this.triggerOrder};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        add_box.dialog.find(".btn-add").removeClass("saving");                        
                        add_box.dialog.find(".input-field").attr("disabled",false);
                        add_box.hideBox();
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                            this.messageLabel = label;
                            this.$(".title").html(label);
                            this.app.showMessge("Message label renamed Successfully!");
                        }
                        else{
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                    },this));
                }   
            },
            showLabel:function(ele){
                ele.val(this.messageLabel);
            },
            editMessage:function(){
                var dialog_width = $(document.documentElement).width()-50;
                var dialog_height = $(document.documentElement).height()-162;
                var dialog = this.app.showDialog({title:"'"+this.messageLabel+"' Settings",
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                        headerEditable:false,                          
                        bodyCss:{"min-height":dialog_height+"px"},
                        buttons: {saveBtn:{text:'Save'} }
                });                        
                this.app.showLoading("Loading Settings...",dialog.getBody());
                require(["nurturetrack/message_setting"],_.bind(function(settingPage){
                    var sPage = new settingPage({page:this,dialog:dialog});    
                    dialog.getBody().html(sPage.$el);
                    dialog.saveCallBack(_.bind(sPage.saveCall,sPage));
                    sPage.init();
                },this));      
            },
            previewCampaign:function(){
                var camp_id = this.object[0]['campNum.encode'];                
                //var appMsgs = this.app.messages[0];				
                var dialog_width = $(document.documentElement).width()-60;
                var dialog_height = $(document.documentElement).height()-182;
                var dialog = this.app.showDialog({title:'Message Preview' ,
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgpreview',
                                  bodyCss:{"min-height":dialog_height+"px"}
                });	
                this.app.showLoading("Loading Campaign HTML...",dialog.getBody());									
                var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                require(["common/templatePreview"],_.bind(function(templatePreview){
                var tmPr =  new templatePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:'N'}); // isText to Dynamic
                 dialog.getBody().html(tmPr.$el);
                 tmPr.init();
               },this));
            },
            loadCampaign:function(){               
              var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.object[0]['campNum.encode']+"&type=basic";
              jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){
                  var camp_json = jQuery.parseJSON(xhr.responseText);
                  this.camp_json = camp_json;
                  this.$(".camp-subject").html(this.app.encodeHTML(camp_json.subject));
                  this.$(".camp-fromemail").html(this.app.encodeHTML(camp_json.fromEmail));
                  var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");                             
                  if( merge_field_patt.test(this.app.decodeHTML(camp_json.fromEmail)) && camp_json.defaultFromEmail){                    
                    this.$(".camp-fromemail").append($('<em >Default Value: <i >'+this.app.encodeHTML(camp_json.defaultFromEmail)+'</i></em>'));
                  }
                  if(camp_json.senderName){
                       this.$(".camp-fromname").html(this.app.encodeHTML(camp_json.senderName));                      
                  }
                  else{
                       this.$(".camp-fromname").html('MakesBridge Technology');
                  }                                    
                  if(camp_json.defaultSenderName){
                    this.$(".camp-fromname").append($('<em >Default Value: <i >'+this.app.encodeHTML(camp_json.defaultSenderName)+'</i></em>'));
                  }
                  
                  this.$(".camp-replyto").html(this.app.encodeHTML(camp_json.replyTo));
                  if(camp_json.defaultReplyTo){                    
                    this.$(".camp-replyto").append($('<em >Default Value: <i >'+this.app.encodeHTML(camp_json.defaultReplyTo)+'</i></em>'))
                  }
                  
              },this));
            },
            updateTriggerOrder:function(order){
                this.triggerOrder = order;
                if(this.waitView && this.isWait){
                    this.waitView.triggerOrder = order;
                }
                this.$(".ntmessageno").html(order+": ");
                this.$el.attr("t_order",this.triggerOrder);
            },
            saveMessage:function(){
                if(this.triggerOrder){
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                        var post_data = {type:'waitMessage',trackId:this.parent.track_id,triggerOrder:this.triggerOrder};
                        if(this.$(".timer-group button:first-child").hasClass("active")){
                            post_data['timeOfDay'] = -1;                            
                        }
                        else{
                            post_data['timeOfDayHrs'] = this.getHour(this.$(".timebox-hour").val());                            
                            post_data['timeOfDayMins'] = this.$(".timebox-min").val();
                        }
                        this.$(".save-message").addClass("saving");
                        $.post(URL, post_data)
                        .done(_.bind(function(data) {                                             
                               var _json = jQuery.parseJSON(data);        
                               this.$(".save-message").removeClass("saving");
                               if(_json[0]!=='err'){
                                   this.app.showMessge("Message saved Successfully!");                                    
                               }
                               else{
                                   this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                               }
                       },this));
                }
            },
             getHour:function(hour){                   
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
               },
               addZero:function(str){
                   
                   if(str.length===1){
                       str  = "0" + str;
                   }
                   return str;
               }
            
        });
});