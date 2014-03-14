define(['jquery', 'backbone', 'app', 'views/common/header', 'text!templates/main_container.html', 'views/common/footer', 'views/common/news', 'views/workspace'],
        function($, Backbone, app, HeaderView, LandingPage, FooterView, NewsView, WorkSpace) {
            "use strict";

            return Backbone.View.extend({
                id: 'main-container',
                tagName: 'div',
                classNmae: 'container',
                wp_counter: 0,
                events: {
                    'click .tw-toggle button': function(obj) {
                        if (!$(obj.target).find("span").hasClass("workspace")) {
                            if (!$(obj.target).hasClass("active")) {
                                $(".tw-toggle button").removeClass("active");
                                $(obj.target).addClass("active");
                                $("#tiles").show();
                                $('#workspace').animate({left: '150%'}, function() {
                                    $(this).hide();
                                });
                            }
                        }
                        else {
                            if (!$(obj.target).hasClass("active")) {
                                if (this.$el.find("#wstabs li").length > 1) {
                                    $(".tw-toggle button").removeClass("active");
                                    $(obj.target).addClass("active");
                                    $("#tiles").hide();
                                    $('#workspace').show();
                                    $('#workspace').animate({left: '0px'});

                                }
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
                    'click .new-campaign': 'createCampaign',
                    'click .new-template': 'createTemplate',
                    'click .new-graphics':'createGraphics',
                    'click .view-contacts': 'viewContacts',
                    'click .campaign-listing': 'campaignListing',
                    'click .template-gallery': 'templateGallery',
                    'click .camapign-report': 'camapignReport',
                    'click .csv-upload': 'csvUpload',
                    'click .connect-crm': 'connectCrm' 
                    

                },
                initialize: function() {
                    this.header = new HeaderView();
                    this.footer = new FooterView();
                    this.news = new NewsView();
                    this.render();
                }
                ,
                render: function() {
                    // Render header, main container, footer and news panel          
                    //this.$el.append(this.header.$el,LandingPage, this.footer.$el,this.news.$el);          
                    this.app = this.options.app;
                    this.$el.append(this.header.$el, LandingPage, this.footer.$el);

                },
                addWorkSpace: function(options) {
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
                        $('#wp_li_0').before('<li class="active" id="wp_li_' + wp_count + '" ' + workspaceid + '><a><span class="icon ' + tab_icon + '"></span></a></li>');

                        wp_view.$el.attr("id", "workspace_" + wp_count);
                        $("#workspace .ws-content.active").removeClass('active').css("display", "none");
                        $("#workspace .workspace").append(wp_view.$el);
                        //wp_view.initScroll(wp_view.$el);
                        wp_view.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});

                        var self = this;
                        $("#wp_li_" + wp_count).click(function() {
                            self.activeWorkSpace($(this));
                        });
                    }
                    else {
                        if (!this.$(".tw-toggle button:last-child").hasClass("active")) {
                            this.$(".tw-toggle button:last-child").click();
                        }
                        if (!workspace_li.hasClass("active")) {
                            workspace_li.click();
                        }
                        setTimeout(_.bind(this.app.fixEmailFrom, this), 400);
                    }


                },
                activeWorkSpace: function(obj) {

                    if (!obj.hasClass("active")) {
                        $(".ws-tabs li").removeClass('active');
                        $("#workspace .ws-content.active").removeClass('active').hide();
                        obj.addClass("active");
                        var workspace_id = obj.attr("id").split("_")[2];
                        $("#workspace #workspace_" + workspace_id).show().addClass("active");
                        if (obj.attr("workspace_id")) {
                            var objAttr = obj.attr("workspace_id").split('_');
                            if (objAttr[0] === 'campaign') {
                                this.app.fixEmailFrom();
                            }
                        }
                    }
                },
                openCampaign: function(camp_id) {
                    var camp_id = camp_id ? camp_id : 0;
                    this.addWorkSpace({type: 'wizard',
                        title: "Campaigns",
                        workspace_id: 'campaign_' + camp_id,
                        url: 'campaign',
                        tab_icon: 'campaign',
                        params: {camp_id: camp_id},
                        wizard: {steps: 4, active_step: 1, step_text: ["Settings", "Create", "Recipients", "Schedule"], step_tooltip: ["Basic message setup.",
                                "Create email with a template, copying an existing campaign or use your own html.", "Set who should receive this campaign.", "Schedule date and time for email transmission."]},
                        actions: [{'iconCls': 'campaigns', 'text': 'New Campaign', 'url': ''}, {'iconCls': 'upload-subscribers', 'text': 'Upload Subscribers', 'url': ''}
                            , {'iconCls': 'add-list', 'text': 'Add List', 'url': ''}, {'iconCls': 'forms', 'text': 'Create Form', 'url': ''}
                            , {'iconCls': 'segments', 'text': 'Edit Segments', 'url': ''}, {'iconCls': 'reports', 'text': 'Reports', 'url': ''}
                        ]
                    });
                }

                ,
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
                }

                //Handling Dashboard Scripts for animation stuff.      
                ,
                dashBoardScripts: function() {

                    this.$('ul.rightnav > li.logout > a').click(_.bind(function() {
                        this.$(".lo-confirm").animate({right: "0"}, 500);
                        this.$("ul.rightnav > li.logout span").css({display: "block"}, 500);
                        this.$("ul.rightnav > li.logout i.logout").addClass("active");
                    }, this));

                    this.$('a.lo-no').click(_.bind(function() {
                        this.$(".lo-confirm").animate({right: "-250px"}, 500);
                        this.$("ul.rightnav > li.logout span").css({display: "none"}, 500);
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
                            this.$(".slideoverlay").fadeOut("slow");
                            this.$(".slidenav").animate({left: "-300px"}, 500);
                        }
                        else {
                            li.addClass("active");
                            this.$(".slideoverlay").fadeIn("slow");
                            this.$(".slidenav").animate({left: "0"}, 500);
                        }
                        event.stopPropagation();
                    }, this));
                    // Slide Nav Handling Event 
                    this.$('.slidenav > ul > li.dd > a').click(function(event) {
                        $('.slidenav > ul > li').find('ul').hide();
                        $(this).parent().find('ul').show();
                        event.stopPropagation();
                    });

                    //Tiles Event Handling        
                    this.$('#tiles .box').click(function() {
                        if ($(this).hasClass("expanded")) {
                            $(".tile-shortcuts").fadeOut();
                            setTimeout(function() {
                                $('#tiles .box ').removeClass("expanded");
                            }, 500);
                        }
                        else {
                            $(this).addClass("expanded");
                            $(".tile-shortcuts", this).delay('slow').fadeIn();
                        }
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
                createCampaign: function() {
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
                        dialog.saveCallBack(_.bind(mPage.createCampaign, mPage));
                    });
                },
                createTemplate: function() {
                    this.addWorkSpace({type: '', title: 'Template Gallery', url: 'mytemplates', workspace_id: 'mytemplates', 'addAction': true, tab_icon: 'mytemplates', params: {action: 'new'}});
                },
                viewContacts: function() {
                    this.addWorkSpace({type: '', title: 'Contacts', url: 'contacts', workspace_id: 'contacts', 'addAction': true, tab_icon: 'contactlisting'});
                },
                campaignListing: function() {
                    this.addWorkSpace({type: '', title: 'Campaigns', url: 'campaigns', workspace_id: 'campaigns', 'addAction': true, tab_icon: 'campaignlisting'});
                },
                templateGallery: function() {
                    this.addWorkSpace({type: '', title: 'Template Gallery', url: 'mytemplates', workspace_id: 'mytemplates', 'addAction': true, tab_icon: 'mytemplates'});
                },
                camapignReport: function() {
                    this.addWorkSpace({type: '', title: 'Reports', url: 'reports/campaign_report', workspace_id: 'camp_reports', tab_icon: 'reports', noTags: true});
                },
                csvUpload: function() {
                    this.addWorkSpace({type: '', title: 'CSV Upload', url: 'listupload/csvupload', workspace_id: 'csv_upload', tab_icon: 'csvupload', single_row: true});
                },
                connectCrm: function() {
                    // this.addWorkSpace({type:'',title:'Connections',url : 'crm/crm',workspace_id: 'crm',tab_icon:'crm', single_row:true});
                },
                createGraphics:function(){
                     this.addWorkSpace({type:'',title:'Images',url:'userimages/userimages',workspace_id: 'userimages',tab_icon:'graphiclisting'});
                     return;
                  
                }              

            });

        });



