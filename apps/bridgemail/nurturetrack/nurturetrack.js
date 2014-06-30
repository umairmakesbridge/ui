define(['text!nurturetrack/html/nurturetrack.html','nurturetrack/targetli','nurturetrack/message_row','nurturetrack/wait_row','nurturetrack/buttons_row','target/collections/recipients_targets','bms-tags','bms-dragfile'],
        function(template,TargetLiView,MessageView,WaitView,ButtonsView,TargetsCollection) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Nurture Track detail page view depends on 
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({               
                id:'nurturetargets',
                /**
                 * Attach events on elements in view.addRowMessage
                 */
                events: {
                    'click .add-targets':'selectTargets',
                    'click .add-message':'addMessage',
                    'click .add-wait':'addWait',
                    'click .browse-button-nt':"imageDialog",
                    'click .save-all-nt':'saveAllMessages',
                    'click .play-nt': 'playNurtureTrack',
                    'click .pause-nt':'pauseNurtureTrack',
                    'click .expand-all':'expandAll',
                    'click .collapse-all':'collpaseAll'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {                    
                    this.template = _.template(template);                    
                    this.saveAllCall = 0;
                    this.editable = true;
                    if (this.options.params) {                        
                        this.editable = this.options.params.editable;
                    }                   
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function() {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;
                    this.messages = [];
                    this.targetsRequest = new TargetsCollection();
                    this.targetsModelArray = [];
                    this.$messageWaitContainer = this.$(".message-wait-container");
                    this.targets = null
                    if (this.options.params) {
                        if(this.options.params.track_id){
                            this.track_id = this.options.params.track_id;
                        }
                        if(this.options.params.parent){
                            this.parentWS = this.options.params.parent;
                        }
                    }
                    this.initControls();
                    
                }
                ,
                /**
                 * Custom init function called after view is completely render in wrokspace.
                 */
                init: function() {
                   this.current_ws = this.$el.parents(".ws-content"); 
                   this.ws_header = this.current_ws.find(".camp_header .edited"); 
                   
                   var deleteIcon = $('<a class="icon delete showtooltip" title="Delete Nurture Track"></a>');
                   var playIcon = $('<a class="icon play24 showtooltip" title="Play Nurture Track"></a>');
                   var pauseIcon = $('<a class="icon pause24 showtooltip" title="Pause Nurture Track" style="display:none"></a>');
                   var action_icon = $('<div class="pointy"></div>")');                     
                   action_icon.append(pauseIcon);
                   action_icon.append(playIcon);
                   this.ws_header.find(".pointy").remove();
                   action_icon.append(deleteIcon);
                   
                   deleteIcon.click(_.bind(this.deleteNT,this))                                      
                   this.current_ws.find("h2").append(action_icon); 
                    if(this.current_ws.find("#workspace-header").hasClass("header-edible-campaign")===false){
                        this.current_ws.find(".camp_header #workspace-header").addClass("showtooltip").attr("title","Click to rename").click(_.bind(this.showHideTitle,this));                   
                        this.current_ws.find("#workspace-header").addClass('header-edible-campaign');                                                         
                        this.current_ws.find(".camp_header .cancelbtn").click(_.bind(function(obj){                        
                              this.showHideTitle();                        
                         },this));
                         this.current_ws.find(".camp_header .savebtn").click(_.bind(this.renameNurtureTrack,this));
                         this.current_ws.find(".camp_header  #header_wp_field").keyup(_.bind(function(e){
                             if(e.keyCode==13){
                                 this.current_ws.find(".camp_header .savebtn").click();
                             }
                         },this));
                    }
                    
                    this.current_ws.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    playIcon.click(_.bind(this.playNurtureTrack,this));
                    pauseIcon.click(_.bind(this.pauseNurtureTrack,this));
                    if(this.editable){
                        this.$(".nurtureimg").dragfile({
                            post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+this.app.get('bms_token')+'&type=add&allowOverwrite=N&th_width=240&th_height=320',
                            callBack : _.bind(this.showSelectedImage,this),
                            app:this.app,
                            module:'template',
                            progressElement:this.$('.nurtureimg')
                        });
                   }
                   this.loadData();
                   this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
                  
                },
                initTag:function(tags){                                    
                  var nurture_tag_ele = this.current_ws.find(".camp_header #campaign_tags");
                  nurture_tag_ele.tags({app:this.app,
                        url:"/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token'),
                        tags:tags,
                        showAddButton:(this.camp_id=="0")?false:true,
                        params:{type:'tags',trackId:this.track_id,tags:''},
                        module:'Nurture Track'
                    });
                  if(this.editable===false){
                      nurture_tag_ele.addClass("not-editable");
                      this.current_ws.find(".camp_header #workspace-header").attr("data-original-title","");                      
                  }
                  else{
                      this.current_ws.find(".camp_header #workspace-header").attr("data-original-title","Click to rename");
                      nurture_tag_ele.removeClass("not-editable")
                  }
                },
                loadData:function(){
                   var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading Nurture Track Details...", this.$el);
                    var URL = "/pms/io/trigger/getNurtureData/?BMS_REQ_TK=" + bms_token + "&trackId=" + this.track_id + "&type=get";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.ws_header.find("#workspace-header").html(_json.name);
                        var tags = _json.tags ? _json.tags:'';
                        this.initTag(tags); 
                        var workspace_id = this.current_ws.attr("id");
                        this.app.mainContainer.setTabDetails({workspace_id:workspace_id,heading:_json.name,subheading:"Nurture Track Detail"});
                        if(_json.thumbURL){
                            this.showImage(this.app.decodeHTML(_json.thumbURL));
                        }
                        if(_json.targets){
                            this.targets = _json.targets[0];
                            this.loadTargets();
                        }
                        if(_json.messages){
                            var t_order = 1;
                            _.each(_json.messages[0],function(val){
                                this._message(t_order,val);
                                t_order = t_order+1;
                            },this)
                        }
                        this.ws_header.find(".cstatus").remove();
                        if(_json.status=="D"){
                            this.ws_header.find(".play24").show();
                            this.ws_header.find(".pause24").hide();                             
                            this.ws_header.find("#workspace-header").after($('<a class="cstatus pclr1" style="margin:6px 4px 0px -7px">Paused </a>'));
                        }
                        else{
                            this.ws_header.find(".play24,.delete").hide();
                            this.ws_header.find(".pause24").show();
                            this.ws_header.find("#workspace-header").after($('<a class="cstatus pclr18" style="margin:6px 4px 0px -7px">Playing </a>'));
                            this.ws_header.find(".cstatus").addClass("pclr18").removeClass("pclr1");
                            this.ws_header.find(".cstatus i").addClass("play16").removeClass("pause16");
                        }
                    },this))  
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function() {

                   

                },
                loadTargets:function(){                    
                    var remove_cache = true;
                    var offset = 0;                            
                    var _targetsArray = [];
                     _.each(this.targets,function(val,key){
                       _targetsArray.push(val[0].encode);
                    },this); 
                    var _data = {offset:offset,type:'list_csv',filterNumber_csv:_targetsArray.join()};
                    this.tracks_bms_request = this.targetsRequest.fetch({data:_data,remove: remove_cache,
                        success: _.bind(function (collection, response) {                                
                            // Display items
                            if(this.app.checkError(response)){
                                return false;
                            } 
                          
                            for(var s=offset;s<collection.length;s++){                                
                                this.targetsModelArray.push(collection.at(s));
                            }                        
                            this.createTargets();
                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                },
                showHideTitle:function(show,isNew){
                    if(this.editable==false){
                        return false;
                    }
                    var current_ws = this.current_ws.find(".camp_header");
                    if(show){
                        current_ws.find("h2").hide();
                        current_ws.find(".workspace-field").show();                    
                        current_ws.find(".tagscont").hide();                   
                        current_ws.find("#header_wp_field").val(this.app.decodeHTML(this.current_ws.find("span#workspace-header").html())).focus();                    
                    }
                    else{
                        current_ws.find("h2").show();
                        current_ws.find(".workspace-field").hide();    
                        current_ws.find(".tagscont").show();
                    }
                },
                renameNurtureTrack:function(obj){                    
                    var nt_name_input =  $(obj.target).parents(".edited").find("input");                                           
                    var workspace_head = this.current_ws.find(".camp_header");
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $(obj.target).addClass("saving");
                    $.post(URL, { type: "rename",name:nt_name_input.val(),trackId:this.track_id })
                      .done(_.bind(function(data) {                              
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){                                  
                             workspace_head.find("span#workspace-header").html(this.app.encodeHTML(nt_name_input.val()));                                                                                                 
                             this.showHideTitle();
                             this.app.showMessge("Nurture Track renamed Successfully!");                                  
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);

                          }							  
                          $(obj.target).removeClass("saving");                              
                     },this));
                },
                deleteNT:function(){
                    if(this.track_id){
                        this.app.showAlertDetail({heading:'Confirm Deletion',
                            detail:"Are you sure you want to delete this nurture track?",                                                
                                callback: _.bind(function(){													
                                        this.deleteTrack();
                                },this)},
                        this.$el);    
                    }
                },
                deleteTrack:function(){
                   this.app.showLoading("Deleting Nurture Track...",this.$el);
                   var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                   $.post(URL, {type:'delete',trackId:this.track_id })
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                                this.current_ws.find(".camp_header .close-wp").click();
                                this.app.showMessge("Nurture track deleted.");
                                this.parentWS.fetchTracks();   
                                this.parentWS.addCountHeader();
                           }
                           else{
                               this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                playNurtureTrack:function(){
                    this.app.showLoading("Playing Nurture Track...",this.$el);
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'play',trackId:this.track_id})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(!_json.err){
                               this.app.showMessge("Nurture track played.");
                                this.editable = false;
                                this.render();
                                this.init();                                
                                this.parentWS.fetchTracks();   
                                this.parentWS.addCountHeader();
                           }
                           else{
                               this.app.showAlert(_json.err1,$("body"),{fixed:true}); 
                           }
                   },this));
                },
                pauseNurtureTrack:function(){
                    this.app.showLoading("Pausing Nurture Track...",this.$el);
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'pause',trackId:this.track_id})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                               this.app.showMessge("Nurture track paused.");
                               this.editable = true;
                               this.render();
                               this.init();                               
                               this.parentWS.fetchTracks();   
                               this.parentWS.addCountHeader();
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                selectTargets:function(){
                    var dialog_object ={title:'Select Targets',
                        css:{"width":"1200px","margin-left":"-600px"},
                        bodyCss:{"min-height":"423px"},
                        headerIcon : 'targetw'                        
                      }
                     if(this.editable){
                         dialog_object["buttons"]= {saveBtn:{text:'Done'} }  ;
                     } 
                     var dialog = this.app.showDialog(dialog_object);

                    this.app.showLoading("Loading Targets...",dialog.getBody());                                  
                    require(["target/selecttarget"],_.bind(function(page){                                     
                         var targetsPage = new page({page:this,dialog:dialog,editable:this.editable});
                         dialog.getBody().html(targetsPage.$el);
                         targetsPage.init();                         
                         dialog.saveCallBack(_.bind(targetsPage.saveCall,targetsPage));
                         targetsPage.createRecipients(this.targetsModelArray);
                    },this));
                },
                createTargets:function(save){
                    if(this.targets){
                        this.$(".add-targets").removeClass("add-targets-nt").addClass("target-added");
                        this.$(".dottedpanel").addClass("targetspanel").removeClass("dottedpanel");
                        this.$(".targets-ul").children().remove();
                        _.each(this.targetsModelArray,function(val,key){
                             var targetLiView = new TargetLiView({ model:val,page:this,editable:this.editable });        
                             this.$(".targets-ul").append(targetLiView.$el);
                        },this);                        
                    }
                    if(save){
                        this.saveTargets()
                    }
                },
                saveTargets:function(){
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    var filterNumbers =$.map( this.targets, function( val, i ) {
                                        return val[0].encode;
                                    }).join();
                    $.post(URL, {type:'targets',trackId:this.track_id,targetFilterNumbers:filterNumbers})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                                this.app.showMessge("Targets saved for this nurture track.");                            
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                addMessage:function(t_Order,insertOption){                                         
                    this.app.showLoading("Creating Message...",this.$el);
                    var tOrder = typeof(t_Order)=="number"?t_Order:this.getTriggerOrder()+1;
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'createMessage',trackId:this.track_id,triggerOrder:tOrder,label:'Message'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                             var model = [{"campNum.encode":_json[1],"campNum.checksum":_json[2],"label":""}];                               
                             if(typeof(t_Order)!=="number"){                                
                                this._message(tOrder,model)                               
                             }
                             else{                                 
                                 this.createRowMessage(tOrder,model,insertOption)
                             }
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                _message:function(tOrder,model){
                    var bView = null;
                    
                    var buttonsView = new ButtonsView({page:this,showWait:true,editable:this.editable});
                    this.$messageWaitContainer.append(buttonsView.$el); 
                    if(!this.editable){
                        buttonsView.$el.hide();
                    }
                    bView = buttonsView.$el
                                    
                    var messageView = new MessageView({page:this,buttonRow:bView,triggerOrder:tOrder,object:model,editable:this.editable});  
                    this.messages.push(messageView);
                    this.$messageWaitContainer.append(messageView.$el);                                          
                    
                    if(model && model[0] && model[0].dispatchType){
                        if(model[0].dispatchType!=="L"){
                            messageView.waitView = this._wait(tOrder,model);
                            messageView.isWait=true;
                        }
                    }
                }
                ,
                addWait:function(t_order){   
                    var tOrder = typeof(t_order)=="number"?t_order:this.getTriggerOrder();                    
                    if(this.messages[tOrder-1].isWait){
                        this.app.showAlert('Wait is already added for message.',$("body"),{fixed:true});
                        return false;
                    }
                    this.app.showLoading("Creating Wait...",this.$el);                    
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');                    
                    $.post(URL, {type:'waitMessage',trackId:this.track_id,triggerOrder:tOrder,dispatchType:'D',dayLapse:'3'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                                this.messages[tOrder-1].waitView = this._wait(tOrder);
                                this.messages[tOrder-1].isWait = true;
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                _wait:function(tOrder,model,isAfter){
                    var bView = null;                    
                    var buttonsView = new ButtonsView({page:this,showWait:false,editable:this.editable});                        
                    bView = buttonsView.$el;   
                    if(!this.editable){
                        buttonsView.$el.hide();
                    }
                    var waitView = new WaitView({page:this,buttonRow:bView,triggerOrder:tOrder,model:model,editable:this.editable });                             
                    this.$("[t_order='"+tOrder+"']").before(waitView.$el);      
                    var buttonPlaceHolder = waitView.$el.prev()
                    if(buttonPlaceHolder && buttonPlaceHolder.length){
                        buttonPlaceHolder.find(".add-wait-r").hide();
                        buttonPlaceHolder.find(".wait-add").addClass("green").removeClass("yellow");
                    }
                    return waitView;
                    //waitView.$el.after(buttonsView.$el); 
                },
                getTriggerOrder:function(){
                    return this.messages.length
                },
                refreshMessages:function(torder){
                    if(torder){
                        this.messages.splice(torder-1,1);
                    }
                    _.each(this.messages,function(val,key){
                        val.updateTriggerOrder(key+1);
                    },this)
                },
                addRowMessage:function(rowObject){
                    var triggerOrder = parseInt(rowObject.prev().attr("t_order"));
                    var isAfter = false;                  
                    if(!triggerOrder){
                        triggerOrder = 1;                        
                    }
                    else{
                        triggerOrder = triggerOrder + 1;                        
                    }
                    var insertOption = {row:rowObject,isAfter:isAfter};
                    this.addMessage(triggerOrder,insertOption);
                },
                createRowMessage:function(tOrder,model,option){
                    var bView = null;
                    var referenceObj = option.row;
                    if(this.messages.length){
                        var buttonsView = new ButtonsView({page:this,showWait:true,editable:this.editable});
                        if(option.isAfter){
                            referenceObj.after(buttonsView.$el); 
                        }
                        else{
                            referenceObj.before(buttonsView.$el); 
                        }
                        bView = buttonsView.$el
                    }                     
                    var messageView = new MessageView({page:this,buttonRow:bView,triggerOrder:tOrder,object:model,editable:this.editable});  
                    this.messages.splice(tOrder-1,0,messageView);
                    if(option.isAfter){
                        referenceObj.after(messageView.$el); 
                    }
                    else{
                        referenceObj.before(messageView.$el); 
                    }                                                      
                    this.refreshMessages();
                    
                },
                addRowWait:function(rowObject){
                    var triggerOrder = parseInt(rowObject.next().attr("t_order"));
                    if(triggerOrder){
                        this.addWait(triggerOrder);
                    }
                    else{
                        this.app.showAlert('Wait is already added',$("body"),{fixed:true}); 
                    }
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
                    $.post(URL, { type: "trackThumb",imageId:imageId,trackId:this.track_id })
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                               this.parentWS.fetchTracks();   
                               this.app.showMessge("Nurture Track image set Successfully!");                                  
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));  
                },
                showImage:function(img_thmbnail){
                    this.$(".no-image").hide();
                    this.$("#nt-image").show();
                    this.$("#nt-image img").attr("src",img_thmbnail);
                },
                imageDialog:function(){                    
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
                         var mPage = new pageTemplate({app:app,fromDialog:true,_select_dialog:dialog,_select_page:this,callBack:_.bind(this.insertImage,this)});
                         dialog.getBody().html(mPage.$el);
                        
                     },this));
                     
                },
                insertImage:function(obj){
                   this.showImage(obj.imgthumb);
                   this.saveImage(obj.imgencode);
                },
                saveAllMessages:function(obj){
                    var button = $.getObj(obj,"a");
                    if(!button.hasClass("saving")){
                        for(var i=0;i<this.messages.length;i++){
                            var _message =  this.messages[i];
                            this.saveAllCall++;
                            _message.saveMessage();
                            if(_message.waitView){
                                this.saveAllCall++;
                                _message.waitView.saveWait();
                            }
                        }
                        this.$(".save-all-nt").addClass("saving");
                    }
                },
                expandAll:function(){
                   for(var i=0;i<this.messages.length;i++){
                        var _message =  this.messages[i];                            
                        _message.expand();
                        if(_message.waitView){                            
                            _message.waitView.expand();
                        }
                    } 
                }
                ,
                collpaseAll:function(){
                   for(var i=0;i<this.messages.length;i++){
                        var _message =  this.messages[i];                            
                        _message.collapse();
                        if(_message.waitView){                            
                            _message.waitView.collapse();
                        }
                    } 
                }
                

            });
        });