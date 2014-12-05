define(['text!landingpages/html/landingpage.html','jquery.chosen','bms-tags'],
        function(template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Nurture Track detail page view depends on 
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({                               
                /**
                 * Attach events on elements in view.addRowMessage
                 */
                events: {
                    
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {             
                    this.app = this.options.app;
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
                    if (this.options.params) {
                        if(this.options.params.page_id){
                            this.page_id = this.options.params.page_id;
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
                   
                   /*var deleteIcon = $('<a class="icon delete showtooltip" title="Delete Nurture Track"></a>');
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
                    playIcon.click(_.bind(this.publishPage,this));
                    pauseIcon.click(_.bind(this.pauseNurtureTrack,this));*/
                    
                   this.loadData();
                   this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
                  
                },
                initTag:function(tags){                                    
                  var _tag_ele = this.current_ws.find(".camp_header #campaign_tags");
                  _tag_ele.tags({app:this.app,
                        url:"/pms/io/publish/getLandingPages/?BMS_REQ_TK="+this.app.get('bms_token'),
                        tags:tags,
                        showAddButton:(this.camp_id=="0")?false:true,
                        params:{type:'tags',pageId:this.page_id,tags:''},
                        module:'Landing Page'
                    });
                  if(this.editable===false){
                      _tag_ele.addClass("not-editable");
                      this.current_ws.find(".camp_header #workspace-header").attr("data-original-title","");                      
                  }
                  else{
                      this.current_ws.find(".camp_header #workspace-header").attr("data-original-title","Click to rename");
                      _tag_ele.removeClass("not-editable")
                  }
                },
                loadData:function(){
                   var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading Landing Page Details...", this.$el);
                    var URL = "/pms/io/publish/getLandingPages/?BMS_REQ_TK=" + bms_token + "&pageId=" + this.page_id + "&type=get";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.ws_header.find("#workspace-header").html(_json.name);
                         /*-----Remove loading------*/
                           this.app.removeSpinner(this.$el);
                         /*------------*/
                        var tags = _json.tags ? _json.tags:'';
                        this.initTag(tags); 
                        var workspace_id = this.current_ws.attr("id");
                        this.app.mainContainer.setTabDetails({workspace_id:workspace_id,heading:_json.name,subheading:"Landing Page Detail"});                        
                        
                      
                        
                        this.ws_header.find(".cstatus").remove();
                        
                    },this))  
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function() {
                    this.$(".select-category").chosen({no_results_text:'Oops, nothing found!', width: "220px",disable_search: "true"});                   
                }
                ,
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
                }                

            });
        });