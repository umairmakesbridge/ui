define(['jquery', 'backbone', 'app', 'views/common/header', 'text!templates/main_container.html', 'views/common/footer', 'views/common/news', 'views/workspace','jquery.isotope'],
        function($, Backbone, app, HeaderView, LandingPage, FooterView, NewsView, WorkSpace) {
            "use strict";

            return Backbone.View.extend({
                id: 'main-container',
                tagName: 'div',
                classNmae: 'container',
                wp_counter: 0,
                events: {
                    'click .tw-toggle': function(obj) {
                        var $a =$.getObj(obj,"a"); 
                        if (!$a.hasClass("active")) {
                                $a.addClass("active");
                                $("#tiles").show();
                                $('#workspace').animate({left: '150%'}, function() {
                                    $(this).hide();
                                });
                           
                        }
                        else {
                                if (this.$el.find("#wstabs li").length > 1) {
                                    $a.removeClass("active");                                    
                                    $("#tiles").hide();
                                    $('#workspace').show();
                                    $('#workspace').animate({left: '0px'});
                                }
                            
                        }

                    }
                    ,
                    'click #activities ul.tabnav > li > a': function() {
                        if ($('#activities').css("right") == "0px") {
                            $('#activities').animate({right: -285});
                        }
                        else {
                            $('#activities').animate({right: 0});
                        }
                    },
                    'click #li_campaigns': function() {
                        var hash = CryptoJS.MD5("/pms/report/CustomizeAnalyticsPage.jsp");
                        alert("checksum = " + hash);
                    },
                    'click #wp_li_1': function(obj) {
                        var li = obj.target.tagName == "LI" ? $(obj.target) : $(obj.target).parents("li");
                        this.activeWorkSpace(li);
                    }
                    ,
                    'click #wp_li_0': function() {
                        this.addWorkSpace({type: ''});
                    },
                    'click .videobar': function(e) {
                        var _a  = $.getObj(e,"div");
                        _a = _a.length>1? $(_a[0]) : _a;
                        _a = _a.find("a");
                        if (_a.length){
                                var video_id = _a.attr("rel");
                                var dialog_title = "Help Video";
                                var dialog = this.app.showDialog({title: dialog_title,
                                    css: {"width": "720px", "margin-left": "-360px"},
                                    bodyCss: {"min-height": "410px"}
                                });
                                dialog.getBody().html('<iframe src="//player.vimeo.com/video/'+video_id+'" width="700" height="400" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
                        }
                        
                        e.stopPropagation();
                        e.preventDefault();
                    },
                    'click .new-campaign': 'createCampaign',
                    'click .new-template': 'createTemplate',
                    'click .naturetrack-li':'createNurtureTrack',
                    'click .new-graphics':'createGraphics',
                    'click .view-contacts': 'viewContacts',
                    'click .campaign-listing': 'campaignListing',
                    'click .template-gallery': 'templateGallery',
                    'click .camapign-report': 'camapignReport',
                    'click .csv-upload': 'csvUpload',
                    'click .connect-crm': 'connectCrm', 
                    'click .crm-salesforce': 'salesforceCrm', 
                    'click .crm-netsuite': 'netsuiteCrm',
                    'click .crm-highrise':'highriseCrm' ,
                    'click .create-target':'createTarget',
                    'click .view-lists':'viewLists',
                    'click .view-tags':'viewTags',
                    'click .view-targets':'viewTargets',
                    'click .nurture-tracks' : 'nurtureTracks',
                    'click .autobots-gallery':'autoBots'
                    

                },
                initialize: function() {
                    this.header = new HeaderView();
                    this.footer = new FooterView();
                    this.news = new NewsView();
                    this.lastActiveWorkSpace = "";
                    this.render();
                }
                ,
                render: function() {
                    // Render header, main container, footer and news panel          
                    //this.$el.append(this.header.$el,LandingPage, this.footer.$el,this.news.$el);          
                    this.app = this.options.app;
                    this.$el.append(this.header.$el, LandingPage);                    

                },
                allowWorkspace:function(options){                                    
                  var allow = false;
                  if(this.app.get("user").hasSalesOnlyAccess=="N"){
                      allow=true;
                  }
                  else {
                      if(options.url=="contacts" || options.url=="contacts/subscriber"){
                          allow=true;
                      }
                  }
                  return allow;
                },
                addWorkSpace: function(options) {
                   if(this.allowWorkspace(options)){
                       
                    var workspace_li = $("#wstabs li[workspace_id='" + options.workspace_id + "']");
                    
                    if (workspace_li.length === 0) {
                        this.wp_counter = this.wp_counter + 1;
                        var obj = $(".tw-toggle button").eq(1);
                        if (!$(obj).hasClass("active")) {
                            $(".tw-toggle button").removeClass("active");
                            $(obj).addClass("active");
                            $("#tiles").hide();
                            $('#workspace').show();
                            $('#workspace').css({left: '0%'});
                        }
                        var wp_count = this.wp_counter;
                        if (options && options["params"]){
                            options["params"]["wp_id"] = wp_count;
                        }
                        var wp_view = new WorkSpace(options);

                        wp_view.$el.addClass("active");

                        $(".ws-tabs li").removeClass('active');
                        var workspaceid = options.workspace_id ? ('workspace_id="' + options.workspace_id + '"') : "";
                        var tab_icon = (options.tab_icon) ? "wtab-" + options.tab_icon : "step1";                        
                        $('#wp_li_0').before('<li class="active" id="wp_li_' + wp_count + '" ' + workspaceid + '><a><span class="icon ' + tab_icon + '"></span></a><div class="detail"><div class="heading">'+options.title+'</div><div class="subheading">'+options.sub_title+'</div><i class="closehover" title="Close Workspace"></i></div></li>');
                        this.lastActiveWorkSpace = "wp_li_" + wp_count;
                        wp_view.$el.attr("id", "workspace_" + wp_count);
                        $("#workspace .ws-content.active").removeClass('active').css("display", "none");
                        $("#workspace .workspace").append(wp_view.$el);
                        //wp_view.initScroll(wp_view.$el);
                        wp_view.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                        
                        
                        $("#wp_li_" + wp_count).click(_.bind(function() {
                            this.activeWorkSpace($("#wp_li_" + wp_count));
                        },this));
                        
                        //Handling for tab hover 
                         $("#wp_li_" + wp_count).mouseover(function(){
                             if($(this).hasClass("active")===false){
                                 $(this).addClass("hover")
                             }
                            var heading = $(this).find(".heading");
                            if(!heading.data("tooltip") && heading.text().length>20){ 
                                heading.tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false,trigger:'manual'});                             
                            } 
                            if(!$(this).find(".closehover").data("tooltip")){ 
                                $(this).find(".closehover").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false,trigger:'manual'});                             
                            }
                         });
                         
                         $("#wp_li_" + wp_count).mouseout(function(){                             
                             $(this).removeClass("hover");  
                             setTimeout(_.bind(function(){
                                 $(".tooltip-inner").parents(".tooltip").remove();
                              },this),50);
                         });                                                  
                         $("#wp_li_" + wp_count+" .closehover").click(function(event){                             
                             var li = $(this).parents("li");
                             li.removeClass("hover");                            
                             var wp_id = li.attr("id").split("_")[2];
                             $("#wp_li_"+wp_id+",#workspace_"+wp_id).remove();   
                             $(".tooltip-inner").parents(".tooltip").remove();
                             event.stopPropagation();
                         });         
                          $("#wp_li_" + wp_count+" .closehover").hover(function(){
                              setTimeout(_.bind(function(){
                                  $(this).tooltip("show");
                              },this),50);
                          },function(){
                              $(this).tooltip("hide")
                          })
                          $("#wp_li_" + wp_count+" .heading").hover(function(){
                              setTimeout(_.bind(function(){
                                  $(this).tooltip("show");
                              },this),50);
                          },function(){
                              $(this).tooltip("hide")
                          })
                    }
                    else {
                        this.toggleScreenMode(options);
                        if (!this.$(".tw-toggle button:last-child").hasClass("active")) {
                            this.$(".tw-toggle button:last-child").click();
                        }
                        if (!workspace_li.hasClass("active")) {
                            this.activeWorkSpace(workspace_li,options);
                        }
                        //setTimeout(_.bind(this.app.fixCampaignInputStepOne, this), 400);
                    }

                   }
                },
                toggleScreenMode:function(options){
                        if ($(".ws-content").length < 1) {
                                $("#tiles").show();
                                $('#workspace').animate({left: '150%'}, function() {
                                    $(this).hide();
                                });
                        }else{
                            if (this.$el.find("#wstabs li").length > 1) {
                                $("#tiles").hide();
                                $('#workspace').show();
                                $('#workspace').animate({left: '0px'});
                            }
                        }
                        // for example workspace_id is recipients and the view is recipients_lists
                        // options type is lists, targets, and tags
                        // the choose_lists is id so I use classes like .r-choose-lists, r-choose-targets, and r-choose-tags.
                        // if any one  want to use this. then they can make it more generalize. 
                        if($(".ws-content ."+options.workspace_id+"_list").length > 0){
                            $(".ws-content ."+options.workspace_id+"_list").find(".r-choose-"+options.params.type).click();
                        }
                },
                activeWorkSpace: function(obj,options) {

                    if (!obj.hasClass("active")) {
                        obj.removeClass("hover");
                        $(".ws-tabs li").removeClass('active');
                        $("#workspace .ws-content.active").removeClass('active').hide();
                        obj.addClass("active");
                        var workspace_id = obj.attr("id").split("_")[2];
                        this.lastActiveWorkSpace = "wp_li_" + workspace_id;
                        $("#workspace #workspace_" + workspace_id).show().addClass("active");
                        
                        if (obj.attr("workspace_id")) {
                            var objAttr = obj.attr("workspace_id").split('_');
                            if (objAttr[0] === 'campaign') {
                                this.app.fixEmailFrom();
                                //this.app.fixCampaignInputStepOne();
                            }
                            if(obj.data("viewObj") && obj.data("viewObj").refreshWorkSpace){
                                obj.data("viewObj").refreshWorkSpace(options);
                            }
                        }
                    }
                },
                setTabDetails:function(params){
                    var wp_id = params.workspace_id ? params.workspace_id.split("_")[1]:"";
                    if(wp_id){
                        $("#wp_li_" + wp_id+" .heading").html(params.heading);                        
                        if(params.heading.length>20){
                            $("#wp_li_" + wp_id+" .heading").attr("title",params.heading);                        
                        }
                        $("#wp_li_" + wp_id+" .subheading").html(params.subheading);
                    }                    
                },
                openCampaign: function(camp_id,camp_wsid,schFlag,reschedule,hidecalender) {
                    var camp_id = camp_id ? camp_id : 0;
                    var active_step = 1;
                    if(schFlag){
                     active_step = schFlag;   // Active Step if Schedule is called
                    }
                    this.addWorkSpace({type: 'wizard',
                        title: "Campaigns",
                        workspace_id: 'campaign_' + camp_wsid,
                        url: 'campaign',
                        tab_icon: 'campaign',
                        params: {camp_id: camp_id},
                        wizard: {cssClass:'campaign_progress',rescheduled:reschedule,hidecalender:hidecalender,steps: 4, active_step: active_step, step_text: ["Settings", "Create", "Recipients", "Schedule"], step_tooltip: ["Basic message setup.",
                                "Create email with a template, copying an existing campaign or use your own html.", "Set who should receive this campaign.", "Schedule date and time for email transmission."]},
                        actions: [{'iconCls': 'campaigns', 'text': 'New Campaign', 'url': ''}, {'iconCls': 'upload-subscribers', 'text': 'Upload Subscribers', 'url': ''}
                            , {'iconCls': 'add-list', 'text': 'Add List', 'url': ''}, {'iconCls': 'forms', 'text': 'Create Form', 'url': ''}
                            , {'iconCls': 'segments', 'text': 'Edit Segments', 'url': ''}, {'iconCls': 'reports', 'text': 'Reports', 'url': ''}
                        ]
                    });
                },
                openSubscriber: function(sub_id) {
                    var sub_id = sub_id ? sub_id : 0;
                    this.addWorkSpace({type: '',
                        title: "Loading...",
                        tab_icon: 'contactdetail',
                        workspace_id: 'subscriber_' + sub_id,
                        url: 'contacts/subscriber',
                        params: {sub_id: sub_id},
                        actions: [{'iconCls': 'campaigns', 'text': 'New Campaign', 'url': ''}, {'iconCls': 'upload-subscribers', 'text': 'Upload Subscribers', 'url': ''}
                            , {'iconCls': 'add-list', 'text': 'Add List', 'url': ''}, {'iconCls': 'forms', 'text': 'Create Form', 'url': ''}
                            , {'iconCls': 'segments', 'text': 'Edit Segments', 'url': ''}, {'iconCls': 'reports', 'text': 'Reports', 'url': ''}
                        ]
                    });
                },
                openNurtureTrack: function(opt) {
                    var track_id = opt.id ? opt.id : 0;
                    var track_checksum = opt.checksum ? opt.checksum : 0;
                    this.addWorkSpace({type: '',
                        title: "Loading...",
                        sub_title:'Nurture Track Wizard',
                        tab_icon: 'nuturetrack',                        
                        workspace_id: 'nurturetrack_' + track_checksum,
                        url: 'nurturetrack/nurturetrack',
                        params: {track_id: track_id,parent:opt.parent,editable:opt.editable}
                        
                    });
                }

                //Handling Dashboard Scripts for animation stuff.      
                ,
                dashBoardScripts: function() {

                    this.$('ul.rightnav > li.logout > a').click(_.bind(function() {
                        this.$(".lo-confirm").animate({right: "0"}, 120);
                        this.$("ul.rightnav > li.logout span").css({display: "block"}, 120);
                        this.$("ul.rightnav > li.logout i.logout").addClass("active");
                    }, this));

                    this.$('a.lo-no').click(_.bind(function() {
                        this.$(".lo-confirm").animate({right: "-250px"}, 120);
                        this.$("ul.rightnav > li.logout span").css({display: "none"}, 120);
                        this.$("ul.rightnav > li.logout i.logout").removeClass("active");
                    }, this));

                    //Video Buttons 
                    this.$('.videobtn').click(_.bind(function(event) {
                        this.$(".slideoverlay").fadeIn("slow");
                        this.$(".videopop").fadeIn("slow");
                    }, this));


                    this.$('.icon-menu').click(_.bind(function(event) {
                        var li = $.getObj(event, "li");
                        if (li.hasClass("active")) {
                            li.removeClass("active");
                            //this.$(".slideoverlay").fadeOut("slow");
                            this.$(".slidenav-dd").hide();
                            
                        }
                       else {
                            li.addClass("active");
                            //this.$(".slideoverlay").fadeIn("slow");
                            this.$(".slidenav-dd").show();
                            
                        }
                        event.stopPropagation();
                    }, this));
                    // show Main Menu 
                    this.$('.icon-menu').mouseenter(_.bind(function(event){
                        $('.dropdown-nav').hide();
                        this.$('a.lo-no').click();
                        $('.dropdown-nav').removeClass('open');
                        $('.dropdown-nav-addcampaign i').removeClass('activeB')
                        var li = $.getObj(event, "li");
                        li.addClass("active");
                        li.show();
                        this.$(".slidenav-dd").show();
                        event.stopPropagation();
                    },this));
                    /*Show & Hide the Main menu via jquery*/
                     this.$('#slidenav-newdd').on('mouseover', _.bind(function(e){
                        this.$('#slidenav-newdd').css('display','block');
                        this.$('.icon-menu').addClass('active');
                      },this));
                      this.$('#slidenav-newdd').on('mouseout', _.bind(function(e){
                        var e = e.toElement || e.relatedTarget;
                        if(e){
                          if (e.parentNode == this || e.parentNode.parentNode == this || e.parentNode.parentNode.parentNode == this || e == this) {
                          return;
                             }
                         }
                       this.$('#slidenav-newdd').css('display','none');
                        this.$('.icon-menu').removeClass('active');
                        //console.log(e.nodeName)
                      },this));
                    // Slide Nav Handling Event 
                    this.$('.slidenav > ul > li.dd > a').click(function(event) {
                        $('.slidenav > ul > li').find('ul').hide();
                        $(this).parent().find('ul').show();
                        event.stopPropagation();
                    });

                    var $tiles = this.$('#tiles');                                       
                    $tiles.isotope({
                      itemSelector: '.box',
                      masonry : {
                        columnWidth : 105,
                        gutter: 0
                      }
                    });
                    // change size of clicked box
                    $tiles.delegate( '.box', 'click', function(){                               
                      $(this).toggleClass('expanded');
                      $tiles.isotope('reLayout');
                    });
                    
                    this.$(".popup").click(_.bind(this.showPopup, this));
                    
                   
                },
                showPopup: function(e) {

                    var _arr = {"_liveChat": {title: "Live Chat", cssClass: 'livechatdialog', url: "https://server.iad.liveperson.net/hc/69791877/?cmd=file&file=visitorWantsToChat&site=69791877&byhref=1&imageUrl=https://server.iad.liveperson.net/hcp/Gallery/ChatButton-Gallery/English/General/1a/"},
                        "_knowledgeBase": {title: "Knowledgebase", cssClass: 'knowledgebasedialog', url: "http://server.iad.liveperson.net/hc/s-69791877/cmd/kbresource/kb-5320825346138970912/front_page!PAGETYPE"},
                        "_supportMessage": {title: "Support message", cssClass: 'supportmessagedialog', url: "http://server.iad.liveperson.net/hc/s-69791877/web/ticketpub/msgcontroller.jsp"}}

                    var target = $.getObj(e, "a");
                    var _id = target.attr("id");
                    var link = _arr[_id].url;
                    window.open(link, 'HELPSUPPORT_' + _id, 'width=800,height=600,left=50,top=50,screenX=100,screenY=100,scrollbars=yes,status=yes,resizable=yes');                   
                },
                createCampaign: function(e) {
                    var camp_obj = this;
                    var dialog_title = "New Campaign";
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "100px"},
                        headerIcon: 'new_headicon',
                        buttons: {saveBtn: {text: 'Create Campaign'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["newcampaign"], function(newcampPage) {
                        var mPage = new newcampPage({camp: camp_obj, app: camp_obj.app, newcampdialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.$("input").focus();
                        dialog.saveCallBack(_.bind(mPage.createCampaign, mPage));
                    });
                },
                createTemplate: function() {
                    this.addWorkSpace({type: '', title: 'Template Gallery',sub_title:'Gallery', url: 'mytemplates', workspace_id: 'mytemplates', 'addAction': true, tab_icon: 'mytemplates', params: {action: 'new'}});
                },
                viewContacts: function() {
                    this.addWorkSpace({type: '', title: 'Contacts',sub_title:'Listing', url: 'contacts', workspace_id: 'contacts', 'addAction': true, tab_icon: 'contactlisting'});
                },
                campaignListing: function() {
                    this.addWorkSpace({type: '', title: 'Campaigns',sub_title:'Listing', url: 'campaigns', workspace_id: 'campaigns', 'addAction': true, tab_icon: 'campaignlisting'});
                },
                templateGallery: function() {
                    this.addWorkSpace({type: '', title: 'Template Gallery',sub_title:'Gallery', url: 'mytemplates', workspace_id: 'mytemplates', 'addAction': true, tab_icon: 'mytemplates'});
                },
                camapignReport: function() {
                    this.addWorkSpace({type: '', title: 'Reports',sub_title:'Analytic', url: 'reports/campaign_report', workspace_id: 'camp_reports', tab_icon: 'reports', noTags: true});
                },
                csvUpload: function() {
                    this.addWorkSpace({type: '', title: 'CSV Upload',sub_title:'Add Contacts', url: 'listupload/csvupload', workspace_id: 'csv_upload', tab_icon: 'csvupload', single_row: true});
                },
                connectCrm: function() {
                   this.addWorkSpace({type:'',title:'Connections',sub_title:'CRM',url : 'crm/crm',workspace_id: 'crm',tab_icon:'crm', single_row:true});
                },
                createGraphics:function(){
                     this.addWorkSpace({type:'',title:'Images',sub_title:'Gallery',url:'userimages/userimages',workspace_id: 'userimages',tab_icon:'graphiclisting'});
                     return;
                  
                },
                viewLists:function(){
                     this.addWorkSpace({type:'',title: "Lists, Targets, Tags",sub_title:'Listing',url:'contacts/recipients',workspace_id: 'recipients',tab_icon:'subscribers',single_row:true,params: {type: 'lists'}});
                     return;
                  
                },
                viewTags:function(){
                     this.addWorkSpace({type:'',title: "Lists, Targets, Tags",sub_title:'Listing',url:'contacts/recipients',workspace_id: 'recipients',tab_icon:'subscribers',single_row:true,params: {type: 'tags'}});
                     return;
                  
                },
                viewTargets:function(){
                     this.addWorkSpace({type:'',title: "Lists, Targets, Tags",sub_title:'Listing',url:'contacts/recipients',workspace_id: 'recipients',tab_icon:'subscribers',single_row:true,params: {type: 'targets'}});
                     return;
                  
                },
                nurtureTracks:function(){
                    this.addWorkSpace({type:'',title:'Nurture Tracks',sub_title:'Listing',url : 'nurturetrack/nurturetracks',workspace_id: 'nuture','addAction':true,tab_icon:'nuturelisting'});
                },
                autoBots:function(){
                    this.addWorkSpace({type:'',title:'Autobots',sub_title:'Listing',url : 'autobots/autobots',workspace_id: 'autobots','addAction':true,tab_icon:'autobotslisting'});
                },
                salesforceCrm:function(){
                    this.addWorkSpace({
                        type:'',
                        title:'Salesforce',
                        url : 'crm/salesforce/salesforce',
                        workspace_id: 'crm_salesforce',
                        tab_icon:'salesforce',
                        sub_title:'Connection With Apps'
                    });                    
                },
                netsuiteCrm:function(){
                    this.addWorkSpace({
                        type:'',
                        title:'NetSuite',
                        url : 'crm/netsuite/netsuite',
                        workspace_id: 'crm_netsuite',
                        tab_icon:'netsuite',
                        sub_title:'Connection With Apps'
                    });                 
                },
                highriseCrm:function(){
                    this.addWorkSpace({ 
                        type:'',
                        title:'Highrise',
                        url:'crm/highrise/highrise',
                        workspace_id: 'crm_highrise',
                        tab_icon:'highrises',
                        sub_title:'Connection With Apps'
                    });
                },
                createTarget: function(){                    
                    var dialog_title = "New Target";
                    var dialog = this.app.showDialog({title:dialog_title,
                        css:{"width":"650px","margin-left":"-325px"},
                        bodyCss:{"min-height":"100px"},							   
                        headerIcon : 'new_headicon',
                        buttons: {saveBtn:{text:'Create Target'} }                                                                           
                    });
                    this.app.showLoading("Loading...",dialog.getBody());
                    require(["target/newtarget"],_.bind(function(newtargetPage){                                     
                        var mPage = new newtargetPage({camp:this,app:this.app,newtardialog:dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.createTarget,mPage));
                    },this));
                },
                createNurtureTrack:function(){
                    var dialog = this.app.showDialog({title:'New Nurture Track',
                      css:{"width":"650px","margin-left":"-325px"},
                      bodyCss:{"min-height":"100px"},							   
                      headerIcon : 'new_headicon',
                      buttons: {saveBtn:{text:'Create'} }                                                                           
                  });
                  this.app.showLoading("Loading...",dialog.getBody());
                  require(["nurturetrack/newnurturetrack"],_.bind(function(trackPage){                                     
                      var mPage = new trackPage({page:this,newdialog:dialog});
                      dialog.getBody().html(mPage.$el);
                      mPage.$("input").focus();
                      dialog.saveCallBack(_.bind(mPage.createNurtureTrack,mPage));
                  },this));  
                },
                initCreateEditTarget:function(target_id){
                    var self = this;
                    var t_id = target_id?target_id:"";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-219;
                    var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:true,
                              bodyCss:{"min-height":dialog_height+"px"},
                              headerIcon : 'target_headicon',
                              buttons: {saveBtn:{text:'Save Target'} }                                                                           
                        });					
                    this.app.showLoading("Loading...",dialog.getBody());                                  
                      require(["target/target"],function(targetPage){                                     
                           var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog});
                           if(self.states){
                            self.states.step3.targetDialog =  mPage;
                           }
                           dialog.getBody().html(mPage.$el);
                           dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                      });
                }

            });

        });



