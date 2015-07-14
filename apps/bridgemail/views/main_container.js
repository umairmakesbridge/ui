define(['jquery', 'backbone', 'app', 'views/common/header', 'text!templates/main_container.html', 'views/common/footer', 'views/common/news', 'views/workspace', 'jquery.isotope'],
        function ($, Backbone, app, HeaderView, LandingPage, FooterView, NewsView, WorkSpace) {
            "use strict";

            return Backbone.View.extend({
                id: 'main-container',
                tagName: 'div',
                classNmae: 'container',
                wp_counter: 0,
                events: {
                    'click .tw-toggle': function (obj) {
                        var $a = $.getObj(obj, "a");
                        if (!$a.hasClass("active")) {
                            $a.addClass("active");
                            $("#tiles").show();
                            $('#workspace').animate({left: '150%'}, function () {
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

                    },
                    'click #tipntest-toggle-one': function (obj) {
                        var $a = $.getObj(obj, "a");
                        $('.tw-toggle').removeClass("active");
                             $("#tiles").hide();
                                $('#workspace').show();
                                $('#workspace').animate({left: '0px'});
                            $("[workspace_id='tip_test']").click();
                            if(!this.openTipnTest){
                                this.tip_test();
                            }

                    }
                    ,
                    'click #tipntest-toggle-two': function (obj) {
                        var $a = $.getObj(obj, "a");
                        $('.tw-toggle').removeClass("active");
                             $("#tiles").hide();
                                $('#workspace').show();
                                $('#workspace').animate({left: '0px'});
                            $("[workspace_id='tip_test_2']").click();
                            if(!this.openTipnTest2){
                                this.tip_test_2();
                            }

                    }
                    ,
                    'click #activities ul.tabnav > li > a': function () {
                        if ($('#activities').css("right") == "0px") {
                            $('#activities').animate({right: -285});
                        }
                        else {
                            $('#activities').animate({right: 0});
                        }
                    },
                    'click #li_campaigns': function () {
                        var hash = CryptoJS.MD5("/pms/report/CustomizeAnalyticsPage.jsp");
                        alert("checksum = " + hash);
                    },
                    'click #wp_li_1': function (obj) {
                        var li = obj.target.tagName == "LI" ? $(obj.target) : $(obj.target).parents("li");
                        this.activeWorkSpace(li);
                    }
                    ,
                    'click #wp_li_0': function () {
                        this.addWorkSpace({type: ''});
                    },
                    'click .videobar': function (e) {
                        var _a = $.getObj(e, "div");
                        _a = _a.length > 1 ? $(_a[0]) : _a;
                        _a = _a.find("a");
                        if (_a.length) {
                            var video_id = _a.attr("rel");
                            var dialog_title = "Help Video";
                            var dialog = this.app.showDialog({title: dialog_title,
                                css: {"width": "720px", "margin-left": "-360px"},
                                bodyCss: {"min-height": "410px"}
                            });
                            dialog.getBody().html('<iframe src="//player.vimeo.com/video/' + video_id + '" width="700" height="400" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
                        }

                        e.stopPropagation();
                        e.preventDefault();
                    },
                    'click .new-campaign': 'createCampaignDialog',
                    'click .new-template': 'createTemplate',
                    'click .naturetrack-li': 'addNurtureTrack',
                    'click .new-graphics': 'createGraphics',
                    'click .view-contacts': 'viewContacts',
                    'click .campaign-listing': 'campaignListing',
                    'click .one-one-listing': 'one_one_listings',
                    'click .signup-forms': 'forms_listings',
                    'click .template-gallery': 'templateGallery',
                    'click .camapign-report': 'camapignReport',
                    'click .csv-upload': 'csvUpload',
                    'click .supress-list': 'supressList',
                    'click .connect-crm': 'connectCrm',
                    'click .crm-salesforce': 'salesforceCrm',
                    'click .crm-netsuite': 'netsuiteCrm',
                    'click .crm-highrise': 'highriseCrm',
                    'click .crm-google': 'googleCRM',
                    'click .create-target': 'createTarget',
                    'click .view-lists': 'viewLists',
                    'click .view-tags': 'viewTags',
                    'click .view-targets': 'viewTargets',
                    'click .nurture-tracks': 'nurtureTracks',
                    'click .autobots-gallery': 'autoBots',
                    'click .new-emailbot': 'newAutobot',
                    'click .new-birthdaybot': 'newAutobot',
                    'click .new-tagbot': 'newAutobot',
                    'click .new-alertbot': 'newAutobot',
                    'click .new-scorebot': 'newAutobot',
                    'click .landing-pages': 'landingPageslist',
                    'click .workflow-listing': 'workflowListing',
                    'click .bridge-statz': 'openBridgeStatz',
                    'click .exportsubscribers': 'exportsubscribers',
                    'click .removesubscribers': 'removeSubscribers',
                    'click .bounced-email': 'bouncedEmail',
                    'click .linkfilters': 'linkfilters',
                    'click .custom-reports': 'customReprots',
                    'click .report-flow':'reportFlow',
                    'click .tipntestlistings':'tipandtestlistings',
                    'click #ql_refresh': function () {
                        this.loadHeaderCount(true);
                    }

                },
                initialize: function () {
                    this.header = new HeaderView();
                    this.footer = new FooterView();
                    this.news = new NewsView();
                    this.isRender = false;
                    this.subscribe_name = '';
                    this.subscribe_id = '';
                    this.lastActiveWorkSpace = "";
                    this.isTipnTestFlag = false;
                    this.openTipnTest = false;
                    this.openTipnTest2 = false;
                    this.render();
                }
                ,
                render: function () {
                    // Render header, main container, footer and news panel          
                    //this.$el.append(this.header.$el,LandingPage, this.footer.$el,this.news.$el);          
                    this.app = this.options.app;
                    this.template = _.template(LandingPage);
                    if(!this.app.get("newWin")){
                        this.$el.append(this.header.$el, this.template({}));
                    }
                    else{
                        this.$el.append(this.template({}));
                    }
                    $(window).scroll(_.bind(function () { 
                        //You've scrolled this much:
                           var et = $(window).scrollTop();
                           this.app.scrollWKStab(et);
                    },this));
                    
                },
                allowWorkspace: function (options) {
                    var allow = false;
                    if (this.app.get("user").hasSalesOnlyAccess == "N") {
                        allow = true;
                    }
                    else {
                        if (options.url == "contacts/contacts" || options.url == "contacts/subscriber") {
                            allow = true;
                        }
                    }
                    return allow;
                },
                addWorkSpace: function (options) {
                    if (this.allowWorkspace(options)) {

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
                            if (options && options["params"]) {
                                options["params"]["wp_id"] = wp_count;
                            }
                            var wp_view = new WorkSpace(options);

                            wp_view.$el.addClass("active");

                            $(".ws-tabs li").removeClass('active');
                            var workspaceid = options.workspace_id ? ('workspace_id="' + options.workspace_id + '"') : "";
                            var tab_icon = (options.tab_icon) ? "wtab-" + options.tab_icon : "step1";
                            
                            $('#wp_li_0').before('<li class="active" id="wp_li_' + wp_count + '" ' + workspaceid + '><a><span class="icon ' + tab_icon + '"></span></a><div class="detail"><div class="heading">' + options.title + '</div><div class="subheading">' + options.sub_title + '</div><i class="closehover" title="Close Workspace"></i></div></li>');
                            if(this.subscribe_name){
                                this.SubscriberName(this.subscribe_id,this.subscribe_name);
                            }
                            /*--loading Spinneer--*/
                            this.lastActiveWorkSpace = "wp_li_" + wp_count;
                            wp_view.$el.attr("id", "workspace_" + wp_count);
                            $('#' + this.lastActiveWorkSpace).append('<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
                            if (options.isLoadSpinner) {
                                $('#' + this.lastActiveWorkSpace).find('.detail .heading').html('<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
                            }
                            /*-----*/
                            $("#workspace .ws-content.active").removeClass('active').css("display", "none");
                            $("#workspace .workspace").append(wp_view.$el);
                            /*--------Push Workspace Tabs into array-------*/
                            this.app.pushWKSTabs({wks_id:wp_count.toString(),wscroll:0});
                            //wp_view.initScroll(wp_view.$el);
                            //this.addMoreTabs( wp_count+1);
                            wp_view.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});


                            $("#wp_li_" + wp_count).click(_.bind(function () {
                                this.activeWorkSpace($("#wp_li_" + wp_count));
                            }, this));

                            //Handling for tab hover 
                            $("#wp_li_" + wp_count).mouseover(function () {
                                if ($(this).hasClass("active") === false) {
                                    $(this).addClass("hover")
                                }
                                var heading = $(this).find(".heading");
                                if (!heading.data("tooltip") && heading.text().length > 20) {
                                    heading.tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false, trigger: 'manual'});
                                }
                                if (!$(this).find(".closehover").data("tooltip")) {
                                    $(this).find(".closehover").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false, trigger: 'manual'});
                                }
                            });

                            $("#wp_li_" + wp_count).mouseout(function () {
                                $(this).removeClass("hover");
                                setTimeout(_.bind(function () {
                                    $(".tooltip-inner").parents(".tooltip").remove();
                                }, this), 50);
                            });
                            $("#wp_li_" + wp_count + " .closehover").click(function (event) {
                                var li = $(this).parents("li");
                                li.removeClass("hover");
                                var wp_id = li.attr("id").split("_")[2];
                                $("#wp_li_" + wp_id + ",#workspace_" + wp_id).remove();
                                $(".tooltip-inner").parents(".tooltip").remove();
                                event.stopPropagation();
                            });
                            $("#wp_li_" + wp_count + " .closehover").hover(function () {
                                setTimeout(_.bind(function () {
                                    $(this).tooltip("show");
                                }, this), 50);
                            }, function () {
                                $(this).tooltip("hide")
                            })
                            $("#wp_li_" + wp_count + " .heading").hover(function () {
                                setTimeout(_.bind(function () {
                                    $(this).tooltip("show");
                                }, this), 50);
                            }, function () {
                                $(this).tooltip("hide")
                            })
                        }
                        else {
                            this.toggleScreenMode(options);
                            if (!this.$(".tw-toggle button:last-child").hasClass("active")) {
                                this.$(".tw-toggle button:last-child").click();
                            }
                            if (!workspace_li.hasClass("active")) {
                                this.activeWorkSpace(workspace_li, options);
                            } else {
                                if (workspace_li.data("viewObj") && workspace_li.data("viewObj").refreshWorkSpace) {
                                    workspace_li.data("viewObj").refreshWorkSpace(options);
                                }
                            }
                            //setTimeout(_.bind(this.app.fixCampaignInputStepOne, this), 400);
                        }

                    }
                },
                toggleScreenMode: function (options) {
                    if ($(".ws-content").length < 1) {
                        $("#tiles").show();
                        $('#workspace').animate({left: '150%'}, function () {
                            $(this).hide();
                        });
                    } else {
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
                    if ($(".ws-content ." + options.workspace_id + "_list").length > 0) {
                        $(".ws-content ." + options.workspace_id + "_list").find(".r-choose-" + options.params.type).click();
                    }
                },
               
                activeWorkSpace: function (obj, options) {
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
                            if (obj.data("viewObj") && obj.data("viewObj").refreshWorkSpace) {
                                obj.data("viewObj").refreshWorkSpace(options);
                            }
                            this.app.pushWKSTabs({wks_id:workspace_id,wscroll:0});
                        }
                    }
                },
                setTabDetails: function (params) {
                    var wp_id = params.workspace_id ? params.workspace_id.split("_")[1] : "";
                    if (wp_id) {
                        $("#wp_li_" + wp_id + " .heading").html(params.heading);
                        if (params.heading.length > 20) {
                            $("#wp_li_" + wp_id + " .heading").attr("title", params.heading);
                        }
                        $("#wp_li_" + wp_id + " .subheading").html(params.subheading);
                    }
                },
                openCampaign: function (camp_id, camp_wsid,isCreateCamp ,schFlag, reschedule, hidecalender) {
                    var camp_id = camp_id ? camp_id : 0;
                    var active_step = 1;
                    if (schFlag) {
                        active_step = schFlag;   // Active Step if Schedule is called
                    }
                    this.addWorkSpace({type: 'wizard',
                        title: "Campaigns",
                        isLoadSpinner: true,
                        workspace_id: 'campaign_' + camp_wsid,
                        url: 'campaigns/campaign',
                        tab_icon: 'campaign',
                        sub_title: 'Campaing Wizard',
                        params: {camp_id: camp_id},
                        wizard: {cssClass: 'campaign_progress', isCreateCamp:isCreateCamp,rescheduled: reschedule, hidecalender: hidecalender, steps: 4, active_step: active_step, step_text: ["Settings", "Create", "Recipients", "Schedule"], step_tooltip: ["Basic message setup.",
                                "Create email with a template, copying an existing campaign or use your own html.", "Set who should receive this campaign.", "Schedule date and time for email transmission."]},
                        actions: []
                    });

                },
                openSubscriber: function (sub_id,sub_name,isSupress,isSalesforceUser) {
                    var sub_id = sub_id ? sub_id : 0;
                    var isSalesforceUser = isSalesforceUser ? isSalesforceUser : false;
                    var email = "";
                    var isEditable = true;
                    
                    if(this.app.get("newWin")){
                        if(this.app.get("subNum")){
                            sub_id = this.app.get("subNum");
                            this.subscribe_name = "Contact";
                            this.subscribe_id = this.app.get("subNum");
                            this.isSupress = false;
                        }
                        else if( $.getUrlVar(false, 'sfid')){
                            sub_id = $.getUrlVar(false, 'sfid');
                            email = $.getUrlVar(false, 'sEmail');
                            this.subscribe_name = "Contact";
                            this.subscribe_id = this.app.get("subNum");
                            this.isSupress = false;
                            isEditable = false;
                        }
                        else{
                            this.app.showAlert("subNum parameter is missing in url",$("body"));
                            return false;
                        }
                    }
                    else{
                        this.subscribe_name = sub_name;
                        this.subscribe_id = sub_id;
                        this.isSupress = isSupress;
                        var headclass;
                        var headicon;
                        if(isSupress === "S"){
                            headclass = 'orange-head'; 
                            headicon = 'supress-w'; 
                        }
                    }
                    this.addWorkSpace({type: '',
                        title: "Loading...",
                        isLoadSpinner: true,
                        tab_icon: 'contactdetail',
                        workspace_id: 'subscriber_' + sub_id,
                        sub_title: 'Contact Profile',
                        url: 'contacts/subscriber',
                        headerObj:{headerclass:headclass,headericon:headicon},
                        params: {sub_id: sub_id,sub_name:sub_name,isSalesforceUser:isSalesforceUser,editable:isEditable,email:email},
                        actions: []
                    });
                },
                SubscriberName: function (sub_id,name){
                     var tabObj = this.$('#wstabs').find('li[workspace_id="subscriber_'+sub_id+'"]');
 
                     if(this.isSupress==="S"){
                       tabObj.find('a').html('<div class="letter_block l_'+name.charAt(0).toLowerCase()+'"><span>'+name.charAt(0)+'</span></div>');
                     }else{
                     tabObj.find('a').html('<div class="letter_block l_'+name.charAt(0).toLowerCase()+'"><span>'+name.charAt(0)+'</span></div>'); 
                 }
                },
                openNurtureTrack: function (opt) {
                    var track_id = opt.id ? opt.id : 0;
                    var track_checksum = opt.checksum ? opt.checksum : 0;
                    var isCreateNT = opt.isCreateNT;
                    this.addWorkSpace({type: '',
                        title: "Loading...",
                        sub_title: 'Nurture Track Wizard',
                        tab_icon: 'nuturetrack',
                        workspace_id: 'nurturetrack_' + track_checksum,
                        url: 'nurturetrack/nurturetrack',
                        params: {track_id: track_id, isCreateNT:isCreateNT ,parent: opt.parent, editable: opt.editable}

                    });
                },
                openLandingPage: function (opt) {
                    var page_id = opt.id ? opt.id : 0;
                    var page_checksum = opt.checksum ? opt.checksum : 0;
                    this.addWorkSpace({type: '',
                        title: "Loading...",
                        sub_title: 'Landing Page',
                        tab_icon: 'lpages',
                        workspace_id: 'landingpage_' + page_checksum,
                        url: 'landingpages/landingpage',
                        params: {page_id: page_id, parent: opt.parent, editable: opt.editable}

                    });
                }
                ,
                openReport: function (opt) {
                    var report_id = opt.id ? opt.id : 0;
                    var report_checksum = opt.checksum ? opt.checksum : 0;
                    this.addWorkSpace({type: '',
                        title: "Loading...",
                        sub_title: 'Analytics',
                        tab_icon: 'reports',
                        workspace_id: 'report_' + report_checksum,
                        url: 'reports/reportflow',
                       'addAction': false,
                        noTags: true,
                        params: {report_id: report_id, parent: opt.parent, editable: opt.editable}

                    });
                }

                //Handling Dashboard Scripts for animation stuff.      
                ,
                dashBoardScripts: function () {
                    var that = this;
                    this.$('ul.rightnav > li.logout > a').click(_.bind(function () {
                        this.$(".lo-confirm").animate({right: "0"}, 120);
                        this.$("ul.rightnav > li.logout span").css({display: "block"}, 120);
                        this.$("ul.rightnav > li.logout i.logout").addClass("active");
                    }, this));

                    this.$('a.lo-no').click(_.bind(function () {
                        this.$(".lo-confirm").animate({right: "-250px"}, 120);
                        this.$("ul.rightnav > li.logout span").css({display: "none"}, 120);
                        this.$("ul.rightnav > li.logout i.logout").removeClass("active");
                    }, this));

                    //Video Buttons 
                    this.$('.videobtn').click(_.bind(function (event) {
                        this.$(".slideoverlay").fadeIn("slow");
                        this.$(".videopop").fadeIn("slow");
                    }, this));

                    this.$('.icon-menu').on('mouseover', function () {
                        // that.$('.add_dialogue').hide('fast'); 
                        if (!that.isRender) {
                            that.loadHeaderCount(false);
                            that.isRender = true;
                        }
                    })

                    this.$('.icon-menu').click(_.bind(function (event) {
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
                    this.$('.icon-menu').mouseenter(_.bind(function (event) {
                        //$('.dropdown-nav').hide();
                        ///this.$('a.lo-no').click();
                        //$('.dropdown-nav').removeClass('open');
                        $('.dropdown-nav-addcampaign i').removeClass('activeB')
                        var li = $.getObj(event, "li");
                        li.addClass("active");
                        li.show();
                        this.$(".slidenav-dd").show();
                        event.stopPropagation();
                    }, this));
                    /*Show & Hide the Main menu via jquery*/
                    this.$('#slidenav-newdd').on('mouseover', _.bind(function (e) {
                        this.$('#slidenav-newdd').css('display', 'block');
                        this.$('.icon-menu').addClass('active');

                    }, this));
                    this.$('#slidenav-newdd').on('mouseout', _.bind(function (e) {
                        var e = e.toElement || e.relatedTarget;
                        if (e) {
                            if (e.parentNode == this || e.parentNode.parentNode == this || e.parentNode.parentNode.parentNode == this || e == this) {
                                return;
                            }
                        }
                        this.$('#slidenav-newdd').css('display', 'none');
                        this.$('.icon-menu').removeClass('active');
                        //console.log(e.nodeName)
                    }, this));
                    // Slide Nav Handling Event 
                    this.$('.slidenav > ul > li.dd > a').click(function (event) {
                        $('.slidenav > ul > li').find('ul').hide();
                        $(this).parent().find('ul').show();
                        event.stopPropagation();
                    });

                    
                    
                    this.$(".popup").click(_.bind(this.showPopup, this));

                    this.$('.loacl-toggle ').click(_.bind(function () {
                        if (this.$("#tiles .local").hasClass("expanded")) {
                            this.$("#tiles .local .tile-shortcuts").fadeOut();
                            setTimeout(_.bind(function () {
                                this.$('#tiles .local ').removeClass("expanded");
                            }, this), 500);
                        }
                        else {
                            this.$("#tiles .local").addClass("expanded");
                            this.$("#tiles .local .tile-shortcuts").delay('slow').fadeIn();
                        }
                    }, this));
                    


                },
                initializeIsotops:function(){
                    var $tiles = this.$('#tiles');
                    $tiles.isotope({
                        itemSelector: '.box',
                        masonry: {
                            columnWidth: 105,
                            gutter: 0
                        }
                    });
                    var self = this;
                    // change size of clicked box
                    $tiles.find('.box').on('click', function (ev) {
                        var target = $(ev.target)
                        if (target.is("li") || target.is("i") || target.is("a")) {
                        } else {
                            $(this).toggleClass('expanded');
                            $tiles.isotope('reLayout');

                            if (self.$("#tiles .box").hasClass("expanded")) {
                                if ($(this).hasClass("local")) {
                                    self.$("#tiles .local .tile-shortcuts").delay('slow').fadeIn();
                                }
                                if (self.$("#tiles .box.expanded").length == 1 && self.$("#tiles .box.expanded").hasClass("local")) {
                                    self.$(".local").css("top", "-180px");
                                }
                                else {
                                    self.$(".local").css("top", "0px");
                                }
                            }
                            else {
                                self.$(".local").css("top", "-180px");
                            }
                        }                        
                    });
                    this.$(".local").css("top", "-180px");
                },
                showPopup: function (e) {

                    var _arr = {"_liveChat": {title: "Live Chat", cssClass: 'livechatdialog', url: "https://server.iad.liveperson.net/hc/69791877/?cmd=file&file=visitorWantsToChat&site=69791877&byhref=1&imageUrl=https://server.iad.liveperson.net/hcp/Gallery/ChatButton-Gallery/English/General/1a/"},
                        "_knowledgeBase": {title: "Knowledgebase", cssClass: 'knowledgebasedialog', url: "http://server.iad.liveperson.net/hc/s-69791877/cmd/kbresource/kb-5320825346138970912/front_page!PAGETYPE"},
                        "_supportMessage": {title: "Support message", cssClass: 'supportmessagedialog', url: "http://server.iad.liveperson.net/hc/s-69791877/web/ticketpub/msgcontroller.jsp"}}

                    var target = $.getObj(e, "a");
                    var _id = target.attr("id");
                    var link = _arr[_id].url;
                    window.open(link, 'HELPSUPPORT_' + _id, 'width=800,height=600,left=50,top=50,screenX=100,screenY=100,scrollbars=yes,status=yes,resizable=yes');
                },
                createCampaignDialog: function (e) {

                    this.app.showAddDialog(
                            {
                                app: this.app,
                                heading: 'Create a new Campaign',
                                buttnText: 'Create',
                                bgClass: 'campaign-tilt',
                                plHolderText: 'Enter campaign name here',
                                emptyError: 'Campaign name can\'t be empty',
                                createURL: '/pms/io/campaign/saveCampaignData/',
                                fieldKey: "campName",
                                postData: {type: 'create', BMS_REQ_TK: this.app.get('bms_token')},
                                saveCallBack: _.bind(this.createCampaign, this) // Calling same view for refresh headBadge
                            });

                    return false;
                },
                createTemplate: function (e) {
                    this.app.showAddDialog(
                            {
                                app: this.app,
                                heading: 'Create a new Template',
                                buttnText: 'Create',
                                bgClass: 'template-tilt',
                                plHolderText: 'Enter template name here',
                                emptyError: 'Template name can\'t be empty',
                                createURL: '/pms/io/campaign/saveUserTemplate/',
                                fieldKey: "templateName",
                                postData: {type: 'create', BMS_REQ_TK: this.app.get('bms_token'),isMEE:'Y'},
                                saveCallBack: _.bind(this.createTemplateCall, this) // Calling same view for refresh headBadge
                            });
                    e.stopPropagation();
                    e.preventDefault();
                    //this.addWorkSpace({type: '', title: 'Template Gallery',sub_title:'Gallery', url: 'bmstemplates/mytemplates', workspace_id: 'mytemplates', 'addAction': true, tab_icon: 'mytemplates', params: {action: 'new'}});
                },
                viewContacts: function () {
                    this.addWorkSpace({type: '', title: 'Contacts', sub_title: 'Listing', url: 'contacts/contacts', workspace_id: 'contacts', 'addAction': true, tab_icon: 'contactlisting'});
                },
                campaignListing: function () {
                    this.addWorkSpace({type: '', title: 'Campaigns', sub_title: 'Listing', url: 'campaigns/campaigns', workspace_id: 'campaigns', 'addAction': true, tab_icon: 'campaignlisting'});
                },
                workflowListing: function () {
                    this.addWorkSpace({type: '', title: 'Workflows', sub_title: 'Listing', url: 'workflow/workflows', workspace_id: 'workflows', 'addAction': true, tab_icon: 'workflowlisting'});
                },
                customReprots: function(){
                    this.addWorkSpace({type: '', title: 'Custom Charts', sub_title: 'Analytics', url: 'reports/customreports', workspace_id: 'customereports', 'addAction': true, tab_icon: 'reports', noTags: true});
                },
                reportFlow: function(){
                    this.addWorkSpace({type: '', title: 'Reports', sub_title: 'Analytics', url: 'reports/reports', workspace_id: 'reports', 'addAction': true, tab_icon: 'reportslisting', noTags: true});
                },
                exportsubscribers: function () {
                    this.addWorkSpace({type: '', noTags: true, title: 'Export Subscribers', sub_title: 'Export Contacts', url: 'contacts/exportsubscribers', workspace_id: 'export_subscriber', 'addAction': false, tab_icon: 'exportsubscribers'});
                },
                removeSubscribers: function () {
                    this.addWorkSpace({type: '', noTags: true, title: 'Remove Subscribers', sub_title: 'Remove Contacts', url: 'contacts/removesubscribers', workspace_id: 'export_subscriber', 'addAction': false, tab_icon: 'removesubscribers'});
                },
                bouncedEmail: function () {
                    this.addWorkSpace({type: '', noTags: true, title: 'Bounced Emails', sub_title: 'Bounced Campaign Report', url: 'common/bouncereport', workspace_id: 'bouncedemail', 'addAction': false, tab_icon: 'bouncedemails'});
                },
                linkfilters: function () {
                    this.addWorkSpace({type: '', noTags: true, title: 'URL Tag Bot', sub_title: 'Manage Link Filters', url: 'common/linkFilter', workspace_id: 'linkfilter', 'addAction': false, tab_icon: 'linkfilters'});
                },
                one_one_listings : function(){
                   this.addWorkSpace({type: '', title: '1:1 Emails', sub_title: 'Listing', url: 'onetooneemails/singlelistings', workspace_id: 'singleemail', 'addAction': true, tab_icon: 'onetoonelisting'}); 
                },
                 tipandtestlistings : function(){
                   this.addWorkSpace({type: '', noTags: true ,title: 'Proven Processes', sub_title: '', url: 'tipandtest/tipandtestlisting', workspace_id: 'tip_test_listings', 'addAction': false, tab_icon: 'tipntest'}); 
                },
                tip_test : function(){
                   this.addWorkSpace({type: '', noTags: true ,title: 'Increase Sales Meetings - Follow Up In Under 5 Minutes', sub_title: '', url: 'tipandtest/tipandtest', workspace_id: 'tip_test', 'addAction': false, tab_icon: 'tipntest'}); 
                },
                 tip_test_2 : function(){
                   this.addWorkSpace({type: '', noTags: true ,title: 'Are you getting the most from your contact research teams?', sub_title: '', url: 'tipandtest/tipandtest2', workspace_id: 'tip_test_two', 'addAction': false, tab_icon: 'tipntest'}); 
                },
                forms_listings : function(){
                   this.addWorkSpace({type: '', title: 'Signup Forms', sub_title: 'Listing', url: 'forms/formlistings', workspace_id: 'signup-forms', 'addAction': true, tab_icon: 'signupforms'}); 
                },
                templateGallery: function () {
                    this.addWorkSpace({type: '', title: 'Template Gallery', sub_title: 'Gallery', url: 'bmstemplates/mytemplates', workspace_id: 'mytemplates', 'addAction': true, tab_icon: 'mytemplates'});
                },
                camapignReport: function () {
                    this.addWorkSpace({type: '', title: 'Reports', sub_title: 'Analytic', url: 'reports/campaign_report', workspace_id: 'camp_reports', tab_icon: 'reports', noTags: true});
                },
                csvUpload: function () {
                    this.addWorkSpace({type: '', noTags: true, title: 'CSV Upload', sub_title: 'Add Contacts', url: 'listupload/csvupload', workspace_id: 'csv_upload', tab_icon: 'csvupload'});
                },
                supressList: function () {
                    this.addWorkSpace({type: '', noTags: true, title: 'CSV Upload To Suppress List', sub_title: 'Show Supress List', url: 'listupload/csvupload', workspace_id: 'supress_list', tab_icon: 'csvupload',headerObj:{headerclass:'orange-head'}});
                },
                connectCrm: function () {
                    this.addWorkSpace({type: '', title: 'Connections', sub_title: 'CRM', url: 'crm/crm', workspace_id: 'crm', tab_icon: 'crm', single_row: true});
                },
                createGraphics: function () {
                    this.addWorkSpace({type: '', title: 'Images', sub_title: 'Gallery', url: 'userimages/userimages', workspace_id: 'userimages', tab_icon: 'graphiclisting'});
                    return;
                },
                viewLists: function () {
                    this.addWorkSpace({type: '', title: "Lists, Targets, Tags", sub_title: 'Listing', url: 'contacts/recipients', workspace_id: 'recipients', tab_icon: 'subscribers', single_row: true, params: {type: 'lists'}});
                    return;

                },
                viewTags: function () {
                    this.addWorkSpace({type: '', title: "Lists, Targets, Tags", sub_title: 'Listing', url: 'contacts/recipients', workspace_id: 'recipients', tab_icon: 'subscribers', single_row: true, params: {type: 'tags'}});
                    return;

                },
                viewTargets: function () {
                    this.addWorkSpace({type: '', title: "Lists, Targets, Tags", sub_title: 'Listing', url: 'contacts/recipients', workspace_id: 'recipients', tab_icon: 'subscribers', single_row: true, params: {type: 'targets'}});
                    return;

                },
                nurtureTracks: function () {
                    this.addWorkSpace({type: '', title: 'Nurture Tracks', sub_title: 'Listing', url: 'nurturetrack/nurturetracks', workspace_id: 'nuture', 'addAction': true, tab_icon: 'nuturelisting'});
                },
                autoBots: function () {
                    this.addWorkSpace({type: '', title: 'Autobots', sub_title: 'Listing', url: 'autobots/autobots', workspace_id: 'autobots', 'addAction': true, tab_icon: 'autobotslisting'});
                },
                landingPageslist: function () {
                    this.addWorkSpace({type: '', title: 'Landing Pages', sub_title: 'Listing', url: 'landingpages/landingpages', workspace_id: 'landingpages', 'addAction': true, tab_icon: 'lpageslisting'});
                },
                newAutobot: function (ev) {
                    if ($(ev.target).prop('tagName') != "LI") {
                        var type = $(ev.target).parents('li').data('type');
                    } else {
                        var type = $(ev.target).data('type');
                    }

                    this.addWorkSpace({type: '', title: 'Autobots', sub_title: 'Listing', url: 'autobots/autobots', workspace_id: 'autobots', 'addAction': true, tab_icon: 'autobotslisting', params: {botType: type}});
                },
                salesforceCrm: function () {
                    this.addWorkSpace({
                        type: '',
                        title: 'Salesforce',
                        url: 'crm/salesforce/salesforce',
                        workspace_id: 'crm_salesforce',
                        tab_icon: 'salesforce',
                        sub_title: 'Connection With Apps'
                    });
                },
                netsuiteCrm: function () {
                    this.addWorkSpace({
                        type: '',
                        title: 'NetSuite',
                        url: 'crm/netsuite/netsuite',
                        workspace_id: 'crm_netsuite',
                        tab_icon: 'netsuite',
                        sub_title: 'Connection With Apps'
                    });
                },
                highriseCrm: function () {
                    this.addWorkSpace({
                        type: '',
                        title: 'Highrise',
                        url: 'crm/highrise/highrise',
                        workspace_id: 'crm_highrise',
                        tab_icon: 'highrises',
                        sub_title: 'Connection With Apps'
                    });
                },
                googleCRM: function () {
                    this.addWorkSpace({
                        type: '',
                        title: 'Google',
                        url: 'crm/google/google',
                        workspace_id: 'crm_google',
                        tab_icon: 'google',
                        sub_title: 'Connection With Apps'
                    });
                },
                createTarget: function () {
                    this.app.showAddDialog(
                    {
                        app: this.app,
                        heading: 'Create a new Target',
                        buttnText: 'Create',
                        bgClass: 'target-tilt',
                        plHolderText: 'Enter target name here',
                        emptyError: 'Target name can\'t be empty',
                        createURL: '/pms/io/filters/saveTargetInfo/',
                        fieldKey: "filterName",
                        postData: {type: 'create', BMS_REQ_TK: this.app.get('bms_token'), filterFor: "C"},
                        saveCallBack: _.bind(this.addTarget, this) // Calling same view for refresh headBadge
                    });
                },
                openBridgeStatz: function(e){
                    var target = $.getObj(e, "li");
                    if(target.hasClass("loading-tile")){return false}
                    if(app.get("bridgestatz") && app.get("bridgestatz").id){
                        var __json = app.get("bridgestatz");
                        sharedObject.log = __json.webAddress;
                        sharedObject.pass = __json.pass;
                        window.open("http://content.bridgemailsystem.com/pms/report/BridgeStatz.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&ukey="+this.app.get('user_Key'), 'BRIDGESTATZ',"menubar=0,toolbar=0");                            
                    }else{    
                        target.addClass("loading-tile");
                        var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + app.get("bms_token") + "&type=bridgestatz";
                        jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                            var _json = jQuery.parseJSON(xhr.responseText);
                            target.removeClass("loading-tile");
                            if (app.checkError(_json)) {
                                return false;
                            }
                            app.set("bridgestatz", _json);
                            if(_json.id){
                               sharedObject.log = _json.webAddress;
                               sharedObject.pass = _json.pass;
                               window.open("http://content.bridgemailsystem.com/pms/report/BridgeStatz.jsp?BMS_REQ_TK="+this.app.get('bms_token')+"&ukey="+this.app.get('user_Key'), 'BRIDGESTATZ',"menubar=0,toolbar=0");                            
                            }
                            else{
                                app.showAlert("Your Bridge Statz Account is not activated. Please contact support to activate.",$("body")); 
                            }

                        }, this));
                    }
                    
                },
                addTarget: function (fieldText, camp_json) {
                    var target_id = camp_json[1];
                    if (this.states) {
                        this.states.step3.isNewTarget = true;
                        this.states.step3.newTargetName = fieldText;
                    }
                    this.initCreateEditTarget(target_id);
                },
                createTemplateCall: function (fieldText, _json) {

                    this.template_id = _json[1];
                    var _this = this;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'Loading ...',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: true,
                        headerIcon: 'template',
                        bodyCss: {"min-height": dialog_height + "px"},
                        tagRegen: true,
                        buttons: {saveBtn: {text: 'Save'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    this.$el.parents('body').find("#template_search_menu li:first-child").removeClass("active").click();
                    require(["bmstemplates/template"], function (templatePage) {
                        var mPage = new templatePage({template: _this, dialog: dialog,createTempOnly:true});
                        var dialogArrayLength = _this.app.dialogArray.length; // New Dialog
                        dialog.getBody().append(mPage.$el);
                        mPage.$el.addClass('dialogWrap-' + dialogArrayLength);
                        _this.app.showLoading(false, mPage.$el.parent());
                        mPage.init();
                        mPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        dialog.saveCallBack(_.bind(mPage.saveTemplateCall, mPage));
                        _this.app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                        _this.app.dialogArray[dialogArrayLength - 1].currentView = mPage; // New Dialog
                        _this.app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(mPage.saveTemplateCall, mPage); // New Dialog
                    });
                },
                addNurtureTrack: function () {
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Create a new Nurture Track',
                      buttnText: 'Create',
                      plHolderText : 'Enter nuture track name here',
                      bgClass :'nurtures-tilt',
                      emptyError : 'Nurture Track name can\'t be empty',
                      createURL : '/pms/io/trigger/saveNurtureData/',
                      fieldKey : "name",
                      postData : {type:'create',BMS_REQ_TK:this.app.get('bms_token')},
                      saveCallBack :  _.bind(this.createNurtureTrack,this) // Calling same view for refresh headBadge
                    });
                    
                    
                  /*  var dialog = this.app.showDialog({title: 'New Nurture Track',
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "100px"},
                        headerIcon: 'new_headicon',
                        buttons: {saveBtn: {text: 'Create'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["nurturetrack/newnurturetrack"], _.bind(function (trackPage) {
                        var mPage = new trackPage({page: this, newdialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        mPage.$("input").focus();
                        dialog.saveCallBack(_.bind(mPage.createNurtureTrack, mPage));
                    }, this));*/
                },
                createNurtureTrack : function(fieldText, _json){
                                if(this.addCountHeader){
                                    this.addCountHeader();
                                    this.fetchTracks();
                                 }
                                 var isCreateNT = true;
                                 this.openNurtureTrack({"id":_json[1],"checksum":_json[2],isCreateNT:isCreateNT,"parent":this,editable:true});
                             
                    },
                createCampaign: function (fieldText, _json) {
                    var camp_id = _json[1];
                    var camp_wsid = _json[2];
                    var isCreateCamp = true;
                    this.openCampaign(camp_id, camp_wsid , isCreateCamp);

                },
                initCreateEditTarget: function (target_id) {
                    var self = this;
                    var t_id = target_id ? target_id : "";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 219;
                    var dialog = this.app.showDialog({title: dialog_title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: true,
                        bodyCss: {"min-height": dialog_height + "px"},
                        headerIcon: 'target_headicon',
                        buttons: {saveBtn: {text: 'Save Target'}}
                    });
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["target/target"], function (targetPage) {
                        var mPage = new targetPage({camp: self, target_id: t_id, dialog: dialog});
                        if (self.states) {
                            self.states.step3.targetDialog = mPage;
                        }
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.saveTargetFilter, mPage));
                    });
                },
                addMoreTabs: function (count) {
                    var tabHeight = $(".ws-tabs").height();
                    var windowHeight = $(window).height() - 250;
                    console.log('window height is here');
                    if (tabHeight >= windowHeight) {
                        var liMore = $('#wp_li_0').before('<li class="li-more" id="wp_li_' + count + '"><a><span class="icon extra "></span></a><div class="detail"><div class="heading"></div><div class="subheading"> test</div><i class="closehover" title="Close Workspace"></i></div></li>');
                        $("#wstabs").append(liMore);

                    } else {
                        if ($("#wstabs").find(".li-more").length > 0) {
                            $("#wstabs").find(".li-more").remove();
                        }
                    }

                },
                clearMenuCount: function () {
                    var that = this;
                    that.$el.find('.quicklinks .dd .play').hide();
                    that.$el.find('.quicklinks .dd .pause').hide();
                    that.$el.find('#ql_contacts strong').html('');
                    that.$el.find('#ql_graphics em').html('');
                    that.$el.find('#ql_graphics strong').html('');
                    that.$el.find('#ql_contacts strong').html('');
                    that.$el.find('#ql_autobots .play').html('');
                    that.$el.find('#ql_autobots .pause').html('');
                    that.$el.find('#ql_campaigns em').html('');
                    that.$el.find('#ql_templates em').html('');
                    that.$el.find('#ql_nurturetracks .pause').html('')
                    that.$el.find('#ql_nurturetracks .play').html('');
                },
                loadHeaderCount: function (notRefresh) {
                    if (this.isRender && notRefresh == false)
                        return false;

                    this.clearMenuCount();
                    this.$el.find('#ql_refresh').css('background', 'url("img/refresh-g.gif") no-repeat scroll center center transparent');
                    var URL = "/pms/io/publish/getImagesData/?BMS_REQ_TK=" + app.get('bms_token') + "&type=counts";
                    var that = this;
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (data[0] == "err" && data[1] == "SESSION_EXPIRED") {
                            that.timeOut = true;
                        }
                        if (data.memOccupiedInMBs == '' || data.memOccupiedInMBs == '0') {
                            that.$el.find('#ql_graphics em').html('');
                            that.$el.find('#ql_graphics strong').html('');
                        } else {
                            that.$el.find('#ql_graphics strong').html(that.app.addCommas(data.totalCount) + " | " + data.memOccupiedInMBs + 'MB');
                        }
                    });
                    var URL = "/pms/io/subscriber/getData/?BMS_REQ_TK=" + app.get('bms_token') + "&type=totalCount";
                    var that = this;
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (data[0] == "err" && data[1] == "SESSION_EXPIRED") {
                            that.timeOut = true;
                        }
                        if (data.totalCount != '') {
                            that.$el.find('#ql_contacts strong').html(that.app.addCommas(data.totalCount));
                        } else {
                            that.$el.find('#ql_contacts strong').html('');
                        }
                    });

                    var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=counts";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        that.$el.find('#ql_autobots .play').html(that.app.addCommas(data.playCount));
                        that.$el.find('#ql_autobots .pause').html(that.app.addCommas(data.pauseCount));
                    });
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=allStats";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        var total = (parseInt(data.draft) + parseInt(data.sent) + parseInt(data.scheduled) + parseInt(data.pending));
                        if (total == 0) {
                            that.$el.find('#ql_campaigns em').html('');
                        } else {
                            that.$el.find('#ql_campaigns em').html(that.app.addCommas(total));
                        }
                    });
                    var URL = "/pms/io/trigger/getNurtureData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=counts";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        var pauseCount = (parseInt(data.userCount) - parseInt(data.playCount))
                        that.$el.find('#ql_nurturetracks .play').html(that.app.addCommas(data.playCount));
                        that.$el.find('#ql_nurturetracks .pause').html(that.app.addCommas(pauseCount));
                    });
                    var URL = "/pms/io/campaign/getUserTemplate/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=counts";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (data.userTotal != '')
                            that.$el.find('#ql_templates em').html(that.app.addCommas(data.userTotal));
                        else
                            that.$el.find('#ql_templates em').html('');
                        that.$el.find('.quicklinks .dd .play').show();
                        that.$el.find('.quicklinks .dd .pause').show();
                        that.$el.find('#ql_refresh').css('background', 'url("img/refresh-g.png") no-repeat scroll center center transparent');


                    });

                },
                previewCamp:function(){
                    var camp_id = $.getUrlVar(false,'campNum');
                    if(camp_id){                            
                        var isTextOnly = false;                                                          
                        var dialog_width = $(document.documentElement).width();
                        var dialog_height = $(document.documentElement).height()-120;
                        var dialog = this.app.showDialog({title:'Campaign Preview' ,
                                          css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"0px"},
                                          headerEditable:false,
                                          headerIcon : 'dlgpreview',
                                          bodyCss:{"min-height":dialog_height+"px"}
                        });	
                        this.app.showLoading("Loading...",dialog.getBody());									
                        var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                        require(["common/templatePreview"],_.bind(function(templatePreview){
                        var tmPr =  new templatePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:isTextOnly}); // isText to Dynamic
                         dialog.getBody().html(tmPr.$el);
                         tmPr.init();
                       },this));
                   }
                }
            });

        });



