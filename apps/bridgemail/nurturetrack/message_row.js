define(['text!nurturetrack/html/message_row.html','jquery-ui','bms-dragfile'],
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
             'click .preview': 'campDetails',
             'click .save-message': 'saveMessage',
             'click .message-image':'imageDialog',
             'click .accordion-heading':'toggleAccordion'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.parent = this.options.page;
                    this.app = this.parent.app; 
                    this.template = _.template(template);				                    
                    this.btnRow = this.options.buttonRow;
                    this.object = this.options.object;
                    this.editable=this.options.editable;
                    this.waitView = null;
                    if(this.object){
                        this.messageLabel = this.object[0]["label"];
                        if(!this.messageLabel){
                             this.messageLabel = 'Subject line goes here ...';
                        }
                    }
                    else{
                        this.messageLabel = 'Subject line goes here ...';
                    }
                    this.camp_json = null;
                    this.triggerOrder = this.options.triggerOrder;                                        
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
                    this.$(".set-instant").hide();
                }
                else{
                    this.$(".timebox-hour").val("09");
                    this.$(".timebox-min").val("00");
                }
               /* this.$(".title").addbox({app:this.app,addBtnText:'Save',placeholder_text:'Write Message Name here',
                                        addCallBack:_.bind(this.renameLabel,this)
                                        ,showCallBack:_.bind(this.showLabel,this)
                                        });*/
               this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
               if(this.object){
                    this.loadCampaign();                    
               }
               this.$el.attr("t_order",this.triggerOrder);
               if(this.editable){
                    this.$(".accordion-body").dragfile({
                         post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+this.app.get('bms_token')+'&type=add&allowOverwrite=N&th_width=240&th_height=320',
                         callBack : _.bind(this.showSelectedImage,this),
                         app:this.app,
                         module:'template',
                         progressElement:this.$('.nurtureimg')
                     });
                }
                if(this.object[0] && this.object[0].thumbURL){
                    this.showImage(this.app.decodeHTML(this.object[0].thumbURL));
                }
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
                    this.$(".set-instant").show();
                }
                else{
                    this.$(".set-time").show();
                    this.$(".set-instant").hide();
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
            editMessage:function(e){
                if(!this.object[0]['campNum.encode']){
                    this.app.showAlert('Message doesn\'t not exists',$("body"),{fixed:true});                    
                }
                else{
                var dialog_width = $(document.documentElement).width()-50;
                var dialog_height = $(document.documentElement).height()-162;
                var dialog_object = {title:this.messageLabel +'<strong class="cstatus pclr18" style="float:right; margin-left:5px"> Message <b>'+this.triggerOrder+'</b> </strong>',
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                        headerEditable:false,                          
                        bodyCss:{"min-height":dialog_height+"px"}                        
                        };
                if(this.editable){
                    dialog_object["buttons"]=  {saveBtn:{text:'Save Message'} }
                }
                var dialog = this.app.showDialog(dialog_object);                        
                this.app.showLoading("Loading Settings...",dialog.getBody());
                require(["nurturetrack/message_setting"],_.bind(function(settingPage){
                    var sPage = new settingPage({page:this,dialog:dialog,isCreateNT:this.options.isCreateNT,editable:this.editable,triggerOrder:this.triggerOrder});    
                    dialog.getBody().append(sPage.$el);
                    this.app.showLoading(false, sPage.$el.parent());
                    dialog.saveCallBack(_.bind(sPage.saveCall,sPage));
                    dialog.$el.find('#dialog-title .dialog-title strong').css('float','none'); 
                    var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                    sPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                    this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                    this.app.dialogArray[dialogArrayLength-1].currentView = sPage; // New dialog
                    this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(sPage.saveCall,sPage); // New Dialog
                    sPage.init();
                },this));      
                }
                e.stopPropagation();
            },
            disableButtons:function(disable){
                
            },
            campDetails:function(e){
                var camp_id = this.object[0]['campNum.encode'];  
               //?BMS_REQ_TK=QxwRFLs31lNbcAKSEI8r94ttY4wQ51&campNum=zdTyioHn17Lo20Ln21Oh30Si33zdTyio&type=basic
                var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=basic&campNum="+camp_id;
                var _this = this;
                var dialog_width = $(document.documentElement).width()-60;
                var dialog_height = $(document.documentElement).height()-182;
                var dialog = this.app.showDialog({title:'Message Preview' ,
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgpreview',
                                  bodyCss:{"min-height":dialog_height+"px"}
                });	
                this.app.showLoading("Loading Message...",dialog.getBody());	
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            var defaults_json = jQuery.parseJSON(xhr.responseText);
                            if (_this.app.checkError(defaults_json)) {
                                return false;
                            }
                            _this.previewCampaign(dialog,dialog_height,defaults_json);
                        }
                    }).fail(function () {
                        console.log("error in detauls");
                    });
                  e.stopPropagation();
            },
            previewCampaign:function(dialog,dialog_height,defaults_json){
                 var camp_id = this.object[0]['campNum.encode'];  		
                var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                require(["common/templatePreview"],_.bind(function(templatePreview){
                var tmPr =  new templatePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:defaults_json.isTextOnly}); // isText to Dynamic
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
                  if(camp_json.subject){
                    this.$(".title").html(this.app.encodeHTML(camp_json.subject));
                    this.messageLabel = this.app.encodeHTML(camp_json.subject);
                  }
                  else{
                      this.messageLabel = 'Subject line goes here ...';
                      this.$(".title").html('Subject line goes here ...');
                      this.$(".camp-subject").html('Subject line goes here ...');
                  }
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
                  if(this.options.isCreateNT){
                      this.$(".camp-replyto").html(this.app.encodeHTML(camp_json.fromEmail));
                  }
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
            getPostData:function(){              
              var post_data = {};
              if(this.$(".timer-group button:first-child").hasClass("active")){
                post_data['timeOfDay'] = -1;                            
              }
              else{
                    post_data['timeOfDayHrs'] = this.getHour(this.$(".timebox-hour").val());                            
                    post_data['timeOfDayMins'] = this.$(".timebox-min").val();
                }                        
                return post_data;
            },
            saveMessage:function(obj){
                if(this.triggerOrder){                             
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                        var post_data = {type:'waitMessage',trackId:this.parent.track_id,triggerOrder:this.triggerOrder};
                        if(this.isWait){
                            var _data = this.waitView.getPostData(); 
                            post_data =  _data.post;                                                    
                        }
                        post_data = $.extend({},post_data,this.getPostData());
                        this.$(".save-message").addClass("saving");
                        $.post(URL, post_data)
                        .done(_.bind(function(data) {                                             
                               var _json = jQuery.parseJSON(data);        
                               this.$(".save-message").removeClass("saving");
                               if(_json[0]!=='err'){
                                   if(obj){
                                    this.app.showMessge("Message saved Successfully!");                                    
                                   }
                                   else{
                                       this.parent.saveAllCall--;
                                       if(this.parent.saveAllCall==0){
                                          this.app.showMessge("Nurture track saved Successfully!"); 
                                          this.parent.$(".save-all-nt").removeClass("saving");
                                       }
                                   }
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
            },
            showSelectedImage:function(data){
                     var _image= jQuery.parseJSON(data);
                    if(_image.success){
                        var img_obj = _image.images[0].image1[0];
                        var img_thmbnail = this.app.decodeHTML(img_obj.thumbURL);
                        this.showImage(img_thmbnail)
                        this.saveImage(img_obj['imageId.encode']);
                        
                    }
                },
                saveImage:function(imageId){
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');                   
                    $.post(URL, { type: "messageThumb",imageId:imageId,trackId:this.parent.track_id,triggerOrder:this.triggerOrder })
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){                               
                               this.app.showMessge("Message image set Successfully!");                                  
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));  
                },
                showImage:function(img_thmbnail){
                    this.$(".no-image").hide();
                    this.$("#message-image").show();
                    this.$("#message-image img").attr("src",img_thmbnail);
                },
                imageDialog:function(e){                    
                    var app = this.app;
                    var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-162;
                        var dialog = this.app.showDialog({title:'Images',
                                    css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                                    headerEditable:true,
                                    headerIcon : '_graphics',
                                    bodyCss:{"min-height":dialog_height+"px"}                                                                          
                         });                        
                     this.app.showLoading("Loading...",dialog.getBody());
                     require(["userimages/userimages",'app'],_.bind(function(pageTemplate,app){                                                              
                         var mPage = new pageTemplate({app:app,fromDialog:true,_select_dialog:dialog,_select_page:this,callBack:_.bind(this.insertImage,this),isClose:true});
                         dialog.getBody().append(mPage.$el);
                         this.app.showLoading(false, mPage.$el.parent());
                          var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                         this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                         this.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog
                        
                     },this));                    
                     
                },
                insertImage:function(obj){
                   this.showImage(obj.imgthumb);
                   this.saveImage(obj.imgencode);
                },
                toggleAccordion:function(){
                    var accordion_body = this.$(".accordion-body");
                    if(accordion_body.height()){
                       this.collapse();
                    }
                    else{
                       this.expand();
                    }
                },
                collapse:function(){
                    var accordion_body = this.$(".accordion-body");
                    accordion_body.stop(1).animate({height: 0},50, function(){
                       $(this).hide();  
                    });
                },
                expand:function(){
                    var accordion_body = this.$(".accordion-body");
                    accordion_body.show();  
                    accordion_body.stop(1).animate({height: 243},50, function(){

                    });
                }
            
        });
});