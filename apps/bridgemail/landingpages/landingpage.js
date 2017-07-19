define(['text!landingpages/html/landingpage.html','text!landingpages/html/layout.html','bms-dragfile'],
        function(template,layout) {
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
                    "click .publishedlp" : "publishPage",
                    "click .draftlp" :     "draftPage",
                    'click .message-image':'imageDialog',
                    "click .btn-link" : "linkPageDialog"
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {             
                    this.app = this.options.app;
                    this.template = _.template(template);                    
                    this.saveAllCall = 0;
                    this.isNewLP = this.options.params.isNewLP;
                    this.editable = true;
                    this.status = "D";
                    this.editor_change = false;
                    this.templatePageId = null;
                    this.meeEditor = false;
                    if (this.options.params) {                        
                        this.editable = this.options.params.editable;
                        this.templatePageId = this.options.params.parentPageId;
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
                        this.editor_change = true;
                    }                                        
                }
                ,
                /**
                 * Custom init function called after view is completely render in wrokspace.
                 */
                init: function(notLoadData) {
                   this.current_ws = this.$el.parents(".ws-content"); 
                   this.ws_header = this.current_ws.find(".camp_header .edited"); 
                   if(!notLoadData)  {                                             
                        this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
                        this.initControls();
                   }
                   var publishStatus ="", draftStatus = "";
                   this.$(".status_tgl a").removeClass("active");
                   if(this.editable==true){
                       publishStatus ="display:none";                       
                       this.$(".status_tgl .draft").addClass("active").attr("data-original-title","");                
                       this.$(".status_tgl .published").attr("data-original-title","Publish this Page");
                   }
                   else{
                       draftStatus = "display:none"
                       this.$(".status_tgl .published").addClass("active").attr("data-original-title","");
                       this.$(".status_tgl .draft").attr("data-original-title","Mark as Draft");
                   }
                   var deleteIcon = $('<a class="icon delete showtooltip" title="Delete Landing Page"></a>');
                   var previewIconLP = $('<a class="icon preview showtooltip" title="Preview Page"></a>');  
                   var playIcon = $('<a class="icon play24 showtooltip" title="Publish Landing Page" style="'+draftStatus+'"></a>');
                   var pauseIcon = $('<a class="icon pause24 showtooltip" title="Un publish Landing Page" style="'+publishStatus+'"></a>');
                   var action_icon = $('<div class="pointy"></div>")');                                        
                   action_icon.append(pauseIcon);
                   action_icon.append(playIcon);
                   this.ws_header.find("h2 .preview").remove();
                   this.ws_header.find("h2").append(previewIconLP);
                   this.ws_header.find(".pointy").remove();
                   action_icon.append(deleteIcon);
                   
                   deleteIcon.click(_.bind(this.deletePageDialog,this));
                   
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
                    previewIconLP.click(_.bind(function(){this.previewPage(true)},this));
                    
                    this.loadData();
                  
                },
                loadCategories:function(val){
                    this.$(".select-category").unbind("change",_.bind(this.changeCategory,this));
                    this.$(".select-category").prop("disabled",true).html("<option>Loading...</option>").trigger("chosen:updated");                    
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
                        var selected = ""
                        for(var i=1;i<=totalCount;i++){
                            selected =val ==_json["cat"+i] ? "selected='selected'":""; 
                            catHTML += "<option value='"+_json["cat"+i]+"' "+selected+" >"+_json["cat"+i]+"</option>";
                        }
                        this.$(".select-category").html(catHTML);
                        this.$(".select-category").bind("change",_.bind(this.changeCategory,this));                        
                        this.$(".select-category").prop("disabled",!this.editable).trigger("chosen:updated");
                        
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
                        this.formid = _json["formId.encode"];
                        this.previewURL = _json["previewURL"];
                        this.publishURL = _json["publishURL"];
                        this.pageName = _json["name"];
                        this.thumbURL = _json["thumbURL"];
                        this.loadCategories(_json["category"]);   
                        if(this.editable){
                            this.loadMEE();
                            this.$(".addcat").show();                            
                        }
                        else{
                            this.$(".addcat").hide();
                            this.previewPage();                            
                        }
                        this.setImage();
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
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    this.$(".addcat").addbox({app: this.app,
                        addCallBack: _.bind(this.addCategory, this),
                        placeholder_text: 'Please enter category'
                    });
                }
                ,
                addCategory : function(category,ele){
                    if(ele){
                        ele.data('addbox').showLoading();
                    }
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');                    
                    $.post(URL, { type: "updateCategory",pageId:this.page_id,category:category })
                      .done(_.bind(function(data) {                              
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){   
                              if(ele){
                                ele.data('addbox').hideLoading(true,true);
                                this.app.showMessge("Landing page category created Successfully!");                                  
                                this.loadCategories(category);
                              }                             
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);
                          }							                            
                     },this));
                    
                    return false; 
                },
                changeCategory:function(e){
                    var selectbox_val = $(e.target).val();
                    this.addCategory(selectbox_val);
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
                formLandingPage:function(id,isSignupLightbox){
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');   
                    
                    var data = { type: "form",formId:id,pageId:this.page_id, isLightboxAttach : "N" };
                    if(isSignupLightbox){
                       data =  { type: "form",formId:id,pageId:this.page_id, isLightboxAttach : "Y"};
                    }
                    $.post(URL, data)
                      .done(_.bind(function(data) {                              
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){                                                               
                             this.app.showMessge("Landing page updated Successfully!");                                  
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);

                          }							                            
                     },this));
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
                publishPage:function(dialog){
                    if(this.editable==false){
                        return false;
                    }
                    var element = this.$el;
                    if(dialog.$el){
                        element = dialog.$el;
                    }
                    this.app.showLoading("Publishing landing page...",element);
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'changeStatus',pageId:this.page_id,status:'P'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,element);   
                           var _json = jQuery.parseJSON(data);        
                           if(!_json.err){
                               if(dialog.$el){
                                   dialog.$(".pointy").remove();
                                   dialog.$("#page_link").val(this.app.decodeHTML(_json[1]));
                                   dialog.$(".copy-message").show();
                                   dialog.$(".btn-save").remove();
                                   if(dialog.$("#email-template-iframe").length){
                                       dialog.$("#email-template-iframe").attr("src",dialog.$("#email-template-iframe").attr("src"));
                                   }
                               }
                               this.app.showMessge("Landing page is published.");
                               this.editable = false;                                
                               this.init(true);         
                               this.parentWS.headBadge();   
                               this.parentWS.getLandingPages();
                           }
                           else{
                               this.app.showAlert(_json.err1,$("body"),{fixed:true}); 
                           }
                   },this));
                },
                draftPage:function(){
                    if(this.editable==true){
                        return false;
                    }
                    this.app.showLoading("Unpublishing landing page...",this.$el);
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'changeStatus',pageId:this.page_id,status:'D'})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                              this.app.showMessge("Landing page is draft.");
                              this.editable = true;  
                              this.meeEditor = false;
                              this.init(true);         
                              this.parentWS.headBadge();   
                              this.parentWS.getLandingPages();                                                                                   
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
                previewPage: function (isDialog) {                                                                                
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var previewArea = null;
                    if(isDialog){
                        var dialog = this.app.showDialog({title: 'Preview of landing page &quot;' + this.pageName + '&quot;',
                            css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                            headerEditable: false,
                            headerIcon: 'dlgpreview',
                            bodyCss: {"min-height": dialog_height + "px"}
                        });
                        previewArea = dialog.getBody();
                    }
                    else{
                        previewArea = this.$("#mee_editor");
                    }
                    this.app.showLoading("Loading Preview...",previewArea );
                    var preview_url =  this.app.decodeHTML(this.previewURL).replace("http","https");
                    require(["common/templatePreview"], _.bind(function (templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, prevFlag:"LP",app: this.app, frameHeight: dialog_height}); // isText to Dynamic
                        previewArea.html(tmPr.$el);
                        if(!isDialog){
                           tmPr.$("iframe").load(function(){
                               $(this).height($(this).contents().height());
                           })                           
                        }
                        tmPr.init();
                    }, this));
                    if(this.editable){
                        var publishButton = $(' <div class="pointy" style="display:inline-block !important;opacity:1;position:absolute;margin-left:10px"> <a class="icon play24 showtooltip" title="Publish Landing Page" ></a> </div>');
                        dialog.$el.find("#dialog-title").append(publishButton);
                        publishButton.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                        publishButton.find(".play24").click(_.bind(this.publishPage,this,dialog));
                    }
                },
                linkPageDialog: function(){                    
                    var dialog_title = "Link of &quot;" + this.pageName + "&quot;";
                    var config = {title: dialog_title,
                        css: {"width": "600px", "margin-left": "-300px"},
                        bodyCss: {"min-height": "140px"},
                        headerIcon: 'link'
                    };
                    if(this.editable){
                        config.buttons ={saveBtn: {text: 'Publish', btnicon: 'check'}};                       
                    }
                    var dialog = this.app.showDialog(config);
                     
                    var html = '<div style="margin-top:0px;" class="blockname-container">'
                        html += '<div class="label-text">Page Link:</div>'
                        html += '<div class="input-append sort-options blockname-container"><div class="inputcont">'
                        if(this.editable){
                            html += '<input type="text" id="page_link" value="Page is not published yet." style="width:558px" readonly="readonly">'
                        }
                        else{
                            html += '<input type="text" id="page_link" value="'+this.app.decodeHTML(this.publishURL)+'" style="width:558px" readonly="readonly">'
                        }
                        html += '</div></div>'
                        var message_display =(this.editable)?"none":"block";
                        html += '<div class="copy-message" style="font-size: 12px;margin-top:10px;display:'+message_display+'">'
                        var key = navigator.platform.toUpperCase().indexOf("MAC")>-1 ? "Command" : "Ctrl";                        
                        html += '<i>Press '+key+' + C to copy link.</i>'                       
                        html += '</div> </div>'
                        
                        html = $(html);
                        dialog.getBody().append(html);
                        dialog.getBody().find("#page_link").select().focus();
                        dialog.getBody().find("#page_link").mousedown(function(event){
                            $(this).select().focus();
                             event.stopPropagation();
                             event.preventDefault();
                        })
                        dialog.saveCallBack(_.bind(this.publishPage, this, dialog));
                        
                },
                setMEEView:function(){
                    var _html = "";
                    
                    if(this.landinpageHTML!==""){
                        _html = this.landinpageHTML?$('<div/>').html(this.landinpageHTML).text().replace(/&line;/g,""):""; 
                    }
                    else{
                        this.landinpageHTML = layout;
                        _html = this.landinpageHTML;
                    }
                     var topaccordian=parseInt(this.$('.landing_top').outerHeight());
                     require(["editor/MEE"],_.bind(function(MEE){                                              
                        var MEEPage = new MEE({app:this.app,margin:{top:84,left:0}, _el:this.$("#mee_editor"), parentWindow: $(window),scrollTopMinus:60,html:''
                            ,saveClick:_.bind(this.saveLandingPage,this),saveBtnText:'Save HTML',landingPage:true,formAttach:_.bind(this.formLandingPage,this),formid:this.formid,pageid:this.page_id,
                            changeTemplateClick: _.bind(this.templatesDialog,this), previewCallback: _.bind(this.previewCallback, this),isNewLP:this.isNewLP});                                    
                        this.$("#mee_editor").setChange(this);                
                        this.setMEE(_html);
                        
                        this.meeView = MEEPage;
                        this.meeView.isSignupLightbox = false;
                        this.initScroll();
                    },this));  
                },
                setMEE:function(html){
                   if(this.$("#mee_editor").setMEEHTML && this.$("#mee_editor").getIframeStatus()){
                        this.$("#mee_editor").setMEEHTML(html);   
                        this.app.showLoading(false,this.$("#area_html_editor_mee")); 
                   } 
                   else{
                       setTimeout(_.bind(this.setMEE,this,html),200);
                   }
                },
                saveLandingPage: function(obj){
                    if(!this.meeView.autoSaveFlag){
                   var button = '';
                    if(obj){
                         button = $.getObj(obj,"a");
                    }else{
                        this.meeView.autoSaveFlag = true; 
                    }
                   
                    if((button && !button.hasClass("disabled-btn")) ||  this.meeView.autoSaveFlag == true){                        
                        if(button &&  !button.hasClass("disabled-btn")){
                            button.addClass("disabled-btn");
                           this.app.showLoading("Saving ...",this.$el.parents(".ws-content"));
                        }
                         var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                         var post_data = {type:"update",pageId:this.page_id,html:this.$("#mee_editor").getMEEHTML()};
                         if(this.templatePageId){
                             post_data['parentPageId'] = this.templatePageId;
                         }
                        $.post(URL,post_data )
                             .done(_.bind(function(data) {                                 
                                 var _json = jQuery.parseJSON(data);
                                 this.app.showLoading(false,this.$el.parents(".ws-content"));                                 
                                 this.$(".save-step2").removeClass("disabled-btn");
                                 if(_json[0]!=="err"){
                                     if(!this.meeView.autoSaveFlag){
                                        this.app.showMessge("Landing page saved successfully!");
                                        }
                                        this.meeView._$el.find('.MenuCallPreview > a').removeClass('disabled-btn'); 
                                        this.meeView._$el.find('.lastSaveInfo').html('<i class="icon time"></i>Last Saved: '+moment().format('h:mm:ss a'));
                                        
                                 }
                                 else{                               
                                    this.app.showAlert(_json[1],$("body"));
                                    this.meeView._$el.find('.lastSaveInfo').html('<i class="icon time"></i>Last Saved: ');                                    
                                 }
                                 this.meeView.autoSaveFlag = false; 
                                 this.editor_change = false;                                        
                            },this));
                        } 
                    } //  ./autoSaveFlag
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
                            this.$nav.addClass('editor-toptoolbar-fixed editor-toptoolbar-fixed-border');
                            this.$nav.css("width",this.$(".editorpanel").width());
                            this.$tools.addClass('editor-lefttoolbar-fixed');                        
                            this.$editorarea.addClass('editor-panel-fixed');  
                            this.scrollfixPanel();
                          } else if (scrollTop <= this.navTop && this.isFixed) {
                            this.isFixed = 0
                            this.$nav.removeClass('editor-toptoolbar-fixed editor-toptoolbar-fixed-border');
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
                          else {                                    
                                var lessBy =  this.navTop - $(window).scrollTop();
                                if(lessBy>0){
                                    this.$("#mee_editor").setAccordian(lessBy);
                                    this.scrollChanged = false;                                    
                                }
                                else{
                                    this.scrollChanged = true;
                                }
                            }
                        }
                      }
                    },this);
                    this.processScroll();
                    this.$win.on('scroll', this.processScroll);                                
                },
                scrollfixPanel: function () {
                    $(window).scroll(_.bind(function () {
                        var scrollTop = this.$win.scrollTop();
                        var scrollPosition = scrollTop - parseInt(this.$('.landing_top').outerHeight()+176);
                        
                        if (scrollPosition < 0) {
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', '0');
                        } else {
                            this.$el.find('#mee-iframe').contents().find('.fixed-panel').css('top', scrollPosition + 'px');
                        }
                    }, this));
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
                },
                templatesDialog:function(){                                                       
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Choose New Template for landing page',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'template_gallery',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.app.showLoading("Loading...",dialog.getBody());
                    require(["landingpages/landingpage_templates"],_.bind(function(templates){
                        var tmPr =  new templates({app:this.app,scrollElement:dialog.getBody(),dialog:dialog,parentView : this}); 
                         dialog.getBody().html(tmPr.$el);
                         tmPr.init();
                         var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                         tmPr.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                   },this));
                    
                },
                setImage: function(){
                     if(this.editable){
                        this.$(".accordion-body").dragfile({
                             post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+this.app.get('bms_token')+'&type=add&allowOverwrite=N&th_width=240&th_height=320',
                             callBack : _.bind(this.showSelectedImage,this),
                             app:this.app,
                             module:'template',
                             progressElement:this.$('.nurtureimg')
                         });
                    }
                    if(this.thumbURL){
                        this.showImage(this.app.decodeHTML(this.thumbURL));
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
                showImage:function(img_thmbnail){
                    this.$(".no-image").hide();
                    this.$("#message-image").show();
                    this.$("#message-image img").attr("src",img_thmbnail);
                },
                saveImage: function(image_id){
                    var URL = "/pms/io/publish/saveLandingPages/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'thumbnail',pageId:this.page_id,imageId:image_id})
                    .done(_.bind(function(data) {                                             
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                                this.app.showMessge("Landing page image updated successfully!");                          
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
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
                         var mPage = new pageTemplate({app:app,fromDialog:true,_select_dialog:dialog,_select_page:this,callBack:_.bind(this.insertImage,this)});
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
                previewCallback: function(){
                    if(!this.meeView._$el.find('.MenuCallPreview > a').hasClass('disabled-btn')){
                        this.previewPage(true);
                    }
                    
                }
            });
        });