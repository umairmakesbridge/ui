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
                    "click .status_tgl":"statusToggle"
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {             
                    this.app = this.options.app;
                    this.template = _.template(template);                    
                    this.saveAllCall = 0;
                    this.editable = true;
                    this.status = "D";
                    this.editor_change = false;
                    this.meeEditor = false;
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
                }
                ,
                /**
                 * Custom init function called after view is completely render in wrokspace.
                 */
                init: function(notLoadData) {
                   this.current_ws = this.$el.parents(".ws-content"); 
                   this.ws_header = this.current_ws.find(".camp_header .edited"); 
                   
                   var deleteIcon = $('<a class="icon delete showtooltip" title="Delete Landing Page"></a>');
                   var playIcon = $('<a class="icon play24 showtooltip" title="Publish Landing Page"></a>');
                   var pauseIcon = $('<a class="icon pause24 showtooltip" title="Un publish Landing Page" style="display:none"></a>');
                   var action_icon = $('<div class="pointy"></div>")');                     
                   action_icon.append(pauseIcon);
                   action_icon.append(playIcon);
                   this.ws_header.find(".pointy").remove();
                   action_icon.append(deleteIcon);
                   
                   deleteIcon.click(_.bind(this.deletePageDialog,this))                                      
                   this.current_ws.find("h2").append(action_icon); 
                    if(this.current_ws.find("#workspace-header").hasClass("header-edible-campaign")===false){
                        this.current_ws.find(".camp_header #workspace-header").addClass("showtooltip").attr("title","Click to rename").click(_.bind(this.showHideTitle,this));                   
                        this.current_ws.find("#workspace-header").addClass('header-edible-campaign');                                                         
                        this.current_ws.find(".camp_header .cancelbtn").click(_.bind(function(obj){                        
                              this.showHideTitle();                        
                         },this));
                         this.current_ws.find(".camp_header .savebtn").click(_.bind(this.renameLandingPage,this));
                         this.current_ws.find(".camp_header  #header_wp_field").keyup(_.bind(function(e){
                             if(e.keyCode==13){
                                this.current_ws.find(".camp_header .savebtn").click();
                             }
                         },this));
                    }
                    
                    this.current_ws.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    playIcon.click(_.bind(this.publishPage,this));
                    pauseIcon.click(_.bind(this.draftPage,this));
                   if(!notLoadData)  {
                        this.loadCategories();
                        this.loadData();
                        this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
                        this.initControls();
                   }
                  
                },
                loadCategories:function(){
                    var bms_token = this.app.get('bms_token');     
                    var URL = "/pms/io/publish/getLandingPages/?BMS_REQ_TK=" + bms_token + "&type=categories"
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        
                        var totalCount = parseInt(_json.totalCount);
                        var catHTML = "";
                        for(var i=1;i<=totalCount;i++){
                            catHTML += "<option value='"+_json["cat"+i]+"'>"+_json["cat"+i]+"</option>";
                        }
                        this.$(".select-category").html(catHTML);
                        this.$(".select-category").prop("disabled",false).trigger("chosen:updated");
                    },this));
                },
                initTag:function(tags){                                    
                  var _tag_ele = this.current_ws.find(".camp_header #campaign_tags");
                  _tag_ele.tags({app:this.app,
                        url:"/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token'),
                        tags:tags,
                        showAddButton:(this.page_id=="0")?false:true,
                        params:{type:'tags',pageId:this.page_id,tags:tags},
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
                        this.landinpageHTML = _json.html;
                        this.loadMEE();
                        this.app.mainContainer.setTabDetails({workspace_id:workspace_id,heading:_json.name,subheading:"Landing Page Detail"});                        
                        this.status= _json.status;                      
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
                renameLandingPage:function(obj){                    
                    var nt_name_input =  $(obj.target).parents(".edited").find("input");                                           
                    var workspace_head = this.current_ws.find(".camp_header");
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                    $(obj.target).addClass("saving");
                    $.post(URL, { type: "rename",name:nt_name_input.val(),pageId:this.page_id })
                      .done(_.bind(function(data) {                              
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){                                  
                             workspace_head.find("span#workspace-header").html(this.app.encodeHTML(nt_name_input.val()));                                                                                                 
                             this.showHideTitle();
                             this.app.showMessge("Landing page renamed Successfully!");                                  
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);

                          }							  
                          $(obj.target).removeClass("saving");                              
                     },this));
                },
                publishPage:function(){
                    this.app.showLoading("Publishing landing page...",this.$el);
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'changeStatus',pageId:this.page_id,status:'P'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(!_json.err){
                               this.app.showMessge("Landing page is published.");
                               this.editable = false;                                
                               this.init(true);                                 
                           }
                           else{
                               this.app.showAlert(_json.err1,$("body"),{fixed:true}); 
                           }
                   },this));
                },
                draftPage:function(){
                    this.app.showLoading("Unpublishing landing page...",this.$el);
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'changeStatus',pageId:this.page_id,status:'D'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                              this.app.showMessge("Landing page is draft.");
                              this.editable = true;      
                              this.parentWS.headBadge();   
                              this.parentWS.getLandingPages();
                              this.init(true);                                                              
                           }
                           else{
                              this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                deletePageDialog: function (){
                   if(this.page_id){
                        this.app.showAlertDetail({heading:'Confirm Deletion',
                            detail:"Are you sure you want to delete this landing page?",                                                
                                callback: _.bind(function(){													
                                        this.deletePage();
                                },this)},
                        $("body"));    
                    } 
                },
                deletePage: function(){
                   this.app.showLoading("Deleting Landing Page...",this.$el);
                   var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                   $.post(URL, {type:'delete',pageId:this.page_id })
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                                this.current_ws.find(".camp_header .close-wp").click();
                                this.app.showMessge("Landing page deleted.");
                                this.parentWS.headBadge();   
                                this.parentWS.getLandingPages();
                           }
                           else{
                               this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                           }
                   },this));    
                },
                loadMEE:function(){
                    if(!this.meeEditor){
                         this.app.showLoading("Loading Easy Editor...",this.$("#area_html_editor_mee"));                         
                         this.meeEditor = true;               
                         setTimeout(_.bind(this.setMEEView,this),100);                        
                    }
                },
                setMEEView:function(){
                    var _html = this.landinpageHTML?$('<div/>').html(this.landinpageHTML).text().replace(/&line;/g,""):""; 
                     require(["editor/MEE"],_.bind(function(MEE){                                              
                        var MEEPage = new MEE({app:this.app, _el:this.$("#mee_editor"), html:'' ,saveClick:_.bind(this.saveLandingPage,this),landingPage:true});                                    
                        this.$("#mee_editor").setChange(this);                
                        this.setMEE(_html);
                        this.initScroll();
                        this.app.showLoading(false,this.$("#area_html_editor_mee")); 
                    },this));  
                },
                setMEE:function(html){
                   if(this.$("#mee_editor").setMEEHTML && this.$("#mee_editor").getIframeStatus()){
                        this.$("#mee_editor").setMEEHTML(html);                        
                   } 
                   else{
                       setTimeout(_.bind(this.setMEE,this,html),200);
                   }
                },
                saveLandingPage: function(obj){
                    var button = $.getObj(obj,"a");
                    if(!button.hasClass("saving")){                        
                        button.addClass("saving");
                         var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                         this.app.showLoading("Saving ...",this.$el.parents(".ws-content"));
                         var post_data = {type:"update",pageId:this.page_id,html:this.$("#mee_editor").getMEEHTML()};
                        $.post(URL,post_data )
                             .done(_.bind(function(data) {                                 
                                 var _json = jQuery.parseJSON(data);
                                 this.app.showLoading(false,this.$el.parents(".ws-content"));                                 
                                 this.$(".save-step2").removeClass("saving");
                                 if(_json[0]!=="err"){
                                     this.app.showMessge("Landing page saved successfully!");
                                                                          
                                 }
                                 else{                               
                                    this.app.showAlert(_json[1],$("body"));
                                 }
                        },this));
                    }  
                },
                initScroll:function(){            
                    this.$win=$(window)
                    ,this.$nav = this.$('.editortoolbar')
                    ,this.$tools = this.$('.editortools')                    
                    ,this.container = $("#container")
                    ,this.$editorarea =this.$('.editorbox')
                    , this.navTop = this.$('#area_html_editor_mee').length && this.$('#area_html_editor_mee').offset().top                
                    , this.isFixed = 0,this.scrollChanged=false;

                    this.processScroll=_.bind(function(){                                                       
                      if(this.$("#area_html_editor_mee").height() > 0 ){ 
                        if(this.$("#area_html_editor_mee").css("display")!=="none"){  
                          var i, scrollTop = this.$win.scrollTop();
                          if (scrollTop >= this.navTop && !this.isFixed) {
                            this.isFixed = 1
                            this.$nav.addClass('editor-toptoolbar-fixed');
                            this.$nav.css("width",this.$(".editorpanel").width());
                            this.$tools.addClass('editor-lefttoolbar-fixed');                        
                            this.$editorarea.addClass('editor-panel-fixed');                        
                          } else if (scrollTop <= this.navTop && this.isFixed) {
                            this.isFixed = 0
                            this.$nav.removeClass('editor-toptoolbar-fixed');
                            this.$nav.css("width","100%");
                            this.$tools.removeClass('editor-lefttoolbar-fixed');                        
                            this.$editorarea.removeClass('editor-panel-fixed');                        
                          }
                          var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
                          if(scrollBottom<74){
                              var lessBy = 74-scrollBottom;                            
                              if(this.$("#mee_editor").setAccordian){
                                  this.$("#mee_editor").setAccordian(lessBy);
                                  this.scrollChanged=true;
                              }                            
                          }
                          else if(this.scrollChanged){
                              this.$("#mee_editor").setAccordian(0);
                              this.scrollChanged=false;
                          }
                        }
                      }
                    },this);
                    this.processScroll();
                    this.$win.on('scroll', this.processScroll);                                
                },
                statusToggle: function(e){
                    var target = this.$(".status_tgl");
                    var anchors = target.find("a");
                    if(this.status=="D"){
                       anchors.eq(0).removeClass('active');
                       anchors.eq(1).addClass('active');
                       this.status="P"
                    }
                    else{                       
                       anchors.eq(0).addClass('active');
                       anchors.eq(1).removeClass('active');
                       this.status="D"
                    }
                }
            });
        });