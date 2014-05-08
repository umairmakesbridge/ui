define(['text!nurturetrack/html/nurturetrack.html','nurturetrack/targetli','nurturetrack/message_row','nurturetrack/wait_row','nurturetrack/buttons_row','bms-tags'],
        function(template,TargetLiView,MessageView,WaitView,ButtonsView) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Nurture Track detail page view depends on 
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({               
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .add-targets':'selectTargets',
                    'click .add-message':'addMessage',
                    'click .add-wait':'addWait'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {                    
                    this.template = _.template(template);
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function() {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;
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
                   var pauseIcon = $('<a class="icon pause24 showtooltip" title="Pause Nurture Track"></a>');
                   var action_icon = $('<div class="pointy"></div>")');  
                   var playicon = $('<strong class="cstatus pclr1"><i class="icon pause16 left"></i> Paused </strong>');
                   action_icon.append(playIcon);
                   action_icon.append(deleteIcon);
                   
                   deleteIcon.click(_.bind(this.deleteNT,this))
                   
                   this.current_ws.find("h2").append(playicon); 
                   this.current_ws.find("h2").append(pauseIcon); 
                   this.current_ws.find("h2").append(action_icon); 
                   this.current_ws.find(".camp_header #workspace-header").addClass("showtooltip").attr("title","Click to rename").click(_.bind(this.showHideTitle,this));                   
                   this.current_ws.find("#workspace-header").addClass('header-edible-campaign');
                   
                   this.current_ws.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                   
                   this.current_ws.find(".camp_header .cancelbtn").click(_.bind(function(obj){                        
                         this.showHideTitle();                        
                    },this));
                    this.current_ws.find(".camp_header .savebtn").click(_.bind(this.renameNurtureTrack,this));
                    this.current_ws.find(".camp_header  #header_wp_field").keyup(_.bind(function(e){
                        if(e.keyCode==13){
                            this.current_ws.find(".camp_header .savebtn").click();
                        }
                    },this));
                    playIcon.click(_.bind(this.playNurtureTrack,this));
                    pauseIcon.click(_.bind(this.pauseNurtureTrack,this));
                   
                   this.loadData();
                  
                },
                initTag:function(tags){                                    
                  var nurture_tag_ele = this.current_ws.find(".camp_header #campaign_tags");
                  nurture_tag_ele.tags({app:this.app,
                        url:"/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token'),
                        tags:tags,
                        showAddButton:(this.camp_id=="0")?false:true,
                        params:{type:'tags',trackId:this.track_id,tags:''}
                    });
                  
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
                        if(_json.status=="D"){
                            this.ws_header.find(".play24").show();
                            this.ws_header.find(".pause24").hide();                            
                        }
                        else{
                            this.ws_header.find(".play24").hide();
                            this.ws_header.find(".pause24").show();
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
                    if(!this.app.getAppData("targets")){                                    
                        this.app.showLoading("Loading Targets...",this.$el);
                         this.app.getData({
                            "URL":"/pms/io/filters/getTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list&filterFor=C",
                            "key":"targets",
                            "callback":_.bind(function(){
                                this.app.showLoading(false,this.$el);
                                this.createTargets();
                            },this)
                        });
                    }
                    else{
                        this.createTargets();
                    }  
                },
                showHideTitle:function(show,isNew){
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
                                this.parentWS.fetchTracks();   
                                this.parentWS.addCountHeader();
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                selectTargets:function(){
                     var dialog = this.app.showDialog({title:'Select Targets',
                        css:{"width":"1200px","margin-left":"-600px"},
                        bodyCss:{"min-height":"423px"},
                        headerIcon : 'targetw',
                        buttons: {saveBtn:{text:'Done'} }  
                      });

                    this.app.showLoading("Loading Targets...",dialog.getBody());                                  
                    require(["target/selecttarget"],_.bind(function(page){                                     
                         var targetsPage = new page({page:this,dialog:dialog});
                         dialog.getBody().html(targetsPage.$el);
                         targetsPage.init();                         
                         dialog.saveCallBack(_.bind(targetsPage.saveCall,targetsPage));
                    },this));
                },
                createTargets:function(save){
                    if(this.targets){
                        this.$(".add-targets").removeClass("add-targets-nt").addClass("target-added");
                        this.$(".dottedpanel").addClass("targetspanel").removeClass("dottedpanel");
                        this.$(".targets-ul").children().remove();
                        _.each(this.targets,function(val,key){
                             var targetLiView = new TargetLiView({ model:val[0],page:this });        
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
                addMessage:function(){                                         
                    this.app.showLoading("Creating Message...",this.$el);
                    var tOrder = this.getTriggerOrder();
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'createMessage',trackId:this.track_id,triggerOrder:tOrder,label:'Message'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                             this._message(tOrder)                               
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                _message:function(tOrder,model){
                    var bView = null;
                    if(this.$(".message-wait-container").children().length){
                        var buttonsView = new ButtonsView({page:this,showWait:true});
                        this.$messageWaitContainer.append(buttonsView.$el); 
                        bView = buttonsView.$el
                    }                     

                    var messageView = new MessageView({page:this,buttonRow:bView,triggerOrder:tOrder,object:model});                        
                    this.$messageWaitContainer.append(messageView.$el);                                          
                    var message_count = 1;
                    _.each(this.$(".message-nurturetrack"),function(val){
                        $(val).find("").html(message_count);
                        message_count = message_count + 1;
                    },this);
                }
                ,
                addWait:function(){   
                    this.app.showLoading("Creating Wait...",this.$el);
                    var tOrder = this.getTriggerOrder()-1;
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');                    
                    $.post(URL, {type:'waitMessage',trackId:this.track_id,triggerOrder:tOrder,timeOfDay:-1})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                                this._wait(tOrder);
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                _wait:function(tOrder){
                    var bView = null;
                    if(this.$(".message-wait-container").children().length){
                        var buttonsView = new ButtonsView({page:this,showWait:false});
                        this.$messageWaitContainer.append(buttonsView.$el); 
                        bView = buttonsView.$el
                    }                                          
                    var waitView = new WaitView({page:this,buttonRow:bView,triggerOrder:tOrder });                           
                    this.$messageWaitContainer.append(waitView.$el);                                               
                },
                getTriggerOrder:function(){
                    return this.$(".message-wait-container .message-nurturetrack").length + 1
                }
                

            });
        });