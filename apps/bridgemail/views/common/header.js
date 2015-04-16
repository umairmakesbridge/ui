define(['jquery', 'backbone', 'underscore', 'app', 'text!templates/common/header.html', 'notifications/notifications', 'moment'],
        function ($, Backbone, _, app, template, Notifications) {
            'use strict';
            return Backbone.View.extend({
                tagName: 'div',
                events: {
                    'click .overlay-notification': 'hideMessageDialog',
                    'click .closebtn-gray': 'closeAnnouncement',
                    'click .dropdown-menu li': function (obj) {
                        app.openModule(obj);
                    },
                    /*Menues*/
                    'click .campaigns-li': function (obj) {
                        //app.mainContainer.openCampaign();
                        app.mainContainer.addWorkSpace({type: '', title: 'Campaigns', sub_title: 'Listing', url: 'campaigns/campaigns', workspace_id: 'campaigns', 'addAction': true, tab_icon: 'campaignlisting'});
                    }
                    ,
                    'click .contacts-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: 'Contacts', sub_title: 'Listing', url: 'contacts/contacts', workspace_id: 'contacts', 'addAction': true, tab_icon: 'contactlisting'});
                    },
                    'click .reports-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: 'Reports', sub_title: 'Analytic', url: 'reports/campaign_report', workspace_id: 'camp_reports', tab_icon: 'reports', single_row: true});
                    }
                    ,
                    'click .csv-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: 'CSV Upload', sub_title: 'Add Contacts', url: 'listupload/csvupload', workspace_id: 'csv_upload', tab_icon: 'csvupload', single_row: true});
                    },
                    'click .crm-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: 'Connections', sub_title: 'CRM', url: 'crm/crm', workspace_id: 'crm', tab_icon: 'crm', single_row: true});
                    }
                    ,
                    'click .studio_add-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: this.getTitle(obj)});
                    },
                    'click .analytics_reports-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: this.getTitle(obj)});
                    },
                    'click .add-template-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: 'Template Gallery', sub_title: 'Gallery', url: 'bmstemplates/mytemplates', workspace_id: 'mytemplates', 'addAction': true, tab_icon: 'mytemplates'});
                    },
                    'click .image-gallery-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: 'Images', sub_title: 'Gallery', url: 'userimages/userimages', workspace_id: 'userimages', tab_icon: 'graphiclisting'});
                    },
                    'click .analytics_add-list-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: this.getTitle(obj)});
                    },
                    'click .analytics_forms-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: this.getTitle(obj)});
                    },
                    'click .analytics_segments-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: this.getTitle(obj)});
                    },
                    'click .profiledd': function () {
                        if(app.testUsers.indexOf(app.get("user").userId)>-1){
                            app.mainContainer.addWorkSpace({type: '', title: 'Manage Account', sub_title: 'Settings', url: 'account/account', workspace_id: 'accountpage', tab_icon: 'accountpage', single_row: true});
                        }
                    }
                    ,
                    'click .list-management-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: 'wizard',
                            title: "List Management",
                            url: 'list',
                            wizard: {steps: 4, active_step: 1, step_text: []}
                        });
                    },
                    'click .automation-li': function (obj) {

                    }
                    ,
                    'click .account-li': function (obj) {
                        app.mainContainer.addWorkSpace({type: '', title: "My Account"});
                    },
                    //'click .sc-links span.ddicon':'scDropdown',
                    //'click .new-campaign': 'createNewCampaign',
                    'click .csv-upload': 'csvUpload',
                    'click .new-nurturetrack': 'addNurtureTrack',
                    'click .messagesbtn': 'loadNotifications',
                    "click .announcementbtn": "toggleAnnouncement",
                    //"click ":"quickAdd"
                },
                initialize: function () {
                    this.app = app;
                    this.template = _.template(template);
                    this.render();
                    this.firstTime = false;
                    this.timeOut = false;
                    this.newMessages = null;
                    this.mntMessage = "";
                    this.isForceHide = false;
                    this.criticalMessageTime = '';
                    this.isQuickMenuLoaded = false;

                },
                render: function () {
                    this.$el.html(this.template({}));
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    var that = this;
                    that.updateNotfication()
                    that.setIsActiveTab();
                    setInterval(function () {
                        if ($('body').hasClass('visible') || $('body').attr('class') == undefined) {
                            if (that.timeOut == false)
                                that.updateNotfication()
                        }
                    }, 60000);
                    this.$('.sc-links .ddicon').mouseenter(_.bind(function (event) {
                        $('.dropdown-nav').hide();
                        $('.icon-menu').removeClass('active');
                        if (this.$('.sc-links ul').hasClass('open')) {
                            this.$('.sc-links ul').removeClass('open');
                            this.$('.sc-links ul').hide();
                        } else {
                            this.$('.ddlist').addClass('open').show();
                        }
                        event.stopPropagation();
                    }, this));
                    /*Show & Hide the Main menu via jquery*/
                    this.$('#add-menu').on('mouseover', _.bind(function (e) {
                        $('.icon-menu').removeClass('active');
                        $('#slidenav-newdd').hide();
                        this.$('#add-menu').css('display', 'block');
                        //this.$('.dropdown-nav-addcampaign i').addClass('activeB');
                    }, this));
                    this.$('#add-menu').on('mouseout', _.bind(function (e) {
                        var e = e.toElement || e.relatedTarget;
                        if (e) {
                            if (e.parentNode == this || e.parentNode.parentNode == this || e.parentNode.parentNode.parentNode == this || e == this) {
                                return;
                            }
                        }
                        this.$('#add-menu').css('display', 'none');
                    }, this));
                    // Hide all dropdown
                    this.$('.add-new-header').on('mouseover', _.bind(function () {
                        this.$('.messages_dialogue').hide();
                        $(".quick-add").removeClass("active");
                        this.$el.find('.announcement_dialogue').hide();
                        this.$el.find('.lo-confirm a.lo-no').click();
                        this.$('.sc-links ul').removeClass('open');
                        $('.icon-menu').removeClass('active');
                        $('#slidenav-newdd').hide();
                        this.$('#add-menu').css('display', 'none');
                    }, this));
                    this.$('.quick-add').click(function (event) {

                        if ($(".quick-add").hasClass("active")) {
                            $(".quick-add").removeClass("active");
                            $(".add_dialogue").animate({top: "-600px"});
                        }
                        else {
                            $(".quick-add").addClass("active");
                            $(".add_dialogue").animate({top: "54px"});
                            that.quickAdd();
                        }
                        that.$('.messages_dialogue').hide();
                        event.stopPropagation();
                    });



                },
                getTitle: function (obj) {
                    var title = $(obj.target).parent("li").find("a").text();
                    return title;
                },
                csvUpload: function () {
                    this.addWorkSpace({type: '', title: 'CSV Upload', sub_title: 'Add Contacts', url: 'listupload/csvupload', workspace_id: 'csv_upload', tab_icon: 'csvupload', single_row: true});
                },
                loadNotifications: function () {
                    $(".add_dialogue").animate({top: "-600px"});
                    $(".quick-add").removeClass("active");
                    if (this.$el.find(".messages_dialogue").css('display') != "none") {
                        this.$el.find(".messages_dialogue").slideUp();
                        return false;
                    }
                    this.$el.find('.lo-confirm a.lo-no').click();
                    this.$el.find(".add_dialogue").animate({top: "-600px"});
                    var that = this;
                    this.$el.find(".messages_dialogue").slideDown('fast');
                    $(".quick-add").removeClass("active");
                    this.$el.find('.announcement_dialogue').hide();
                    this.$el.find(".messages_dialogue").html(new Notifications({newMessages: this.newMessages, isModel: false}).el)
                    this.$el.find(".messages_dialogue").append("<div class='viewallmsgs' style='margin:0px;padding:0px;height:40px'><div style='text-align:center'><a class='btn-blue' style='margin-top:5px;'><span class='view-all'>View All Messages </span></a></div></div>");
                    this.$el.find(".messages_dialogue").append("<div class='btm-thumb'></div>");
                    this.$el.find(".messages_dialogue").find(".btm-thumb").on('click', function () {
                        that.$el.find(".messages_dialogue").slideUp('fast');
                    });
                    this.$el.find(".messages_dialogue").find(".view-all").on("click", function () {

                        that.$el.find(".messages_dialogue").addClass('popmodel').html(new Notifications({isModel: true, newMessages: that.newMessages}).el)
                        that.$el.find(".popmodel").css({
                            "position": "absolute",
                            "height": $(window).height() - 200 + "px",
                            "top": "70px",
                            "left": ((($(window).width() - that.$el.find(".popmodel").outerWidth()) / 2) + $(window).scrollLeft() + "px")});
                        that.$el.find(".overlay").show();
                        that.$el.find(".messages_dialogue").find(".all-notification").css("height", $(window).height() - 230 + "px");
                    });

                },
                hideMessageDialog: function (ev) {
                    this.$el.find(".messages_dialogue").removeAttr('style');
                    this.$el.find(".messages_dialogue").removeClass('popmodel').hide();
                    $(ev.target).hide();
                },
                updateNotfication: function () {
                    var URL = "/pms/io/user/notification/?BMS_REQ_TK=" + app.get('bms_token') + "&type=latest";
                    var that = this;
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (data[0] == "err" && data[1] == "SESSION_EXPIRED") {
                            that.timeOut = true;
                        }
                        if (app.checkError(data)) {
                            return false;
                        }
                        if (that.firstTime == false) {
                            var dt = new Date();
                            var time = dt;//{'h':dt.getHours() ,'m':dt.getMinutes() ,'s': dt.getSeconds()}
                            that.criticalMessageTime = time;
                        }                        
                        if (that.newMessages < data['notify.unread.count'] && that.firstTime == false) {
                            that.$el.find('.messagesbtn').addClass('swing');

                            that.$el.find('.messagesbtn sup').css({"top": "-4px", left: "22px"});
                            setTimeout(function () {
                                that.$el.find('.messagesbtn').removeClass('swing');
                                that.$el.find('.messagesbtn sup').css({"top": "5px", left: "70px"});
                            }, 5000)


                        } else {
                            that.$el.find('.messagesbtn').removeClass('swing');
                            that.$el.find('.messagesbtn sup').css({"top": "5px", left: "70px"});
                        }
                        that.newMessages = data['notify.unread.count'];
                        that.$el.find('.messagesbtn sup').show();
                        that.$el.find('.messagesbtn sup').html(data['notify.unread.count']);
                        if (data['system.message'] != "" && that.isForceHide == false) {
                            that.$el.find(".announcementbtn").show();
                            that.$el.find('.announcement_dialogue').show();
                            that.$el.find('.announcement_dialogue').find('p.sys-maintain-message').html(data['system.message']);
                        } else {
                            that.$el.find('.announcement_dialogue').find('p.sys-maintain-message').html(data['system.message']);
                            that.$el.find('.announcement_dialogue').hide()
                            if (that.isForceHide == true && data['system.message'] != "")
                                that.$el.find('.announcementbtn').show();
                            else if(that.$el.find('.announcement_dialogue div.expire-message').length==0){
                                that.$el.find('.announcementbtn').hide();
                            }
                            if(that.mntMessage!=data['system.message'] && data['system.message']!==""){
                                that.$el.find('.announcement_dialogue').show()
                            }                            
                        }
                        that.mntMessage = data['system.message'];

                        if (data['notify.unread.count'] == "0" || data['notify.unread.count'] == 0) {
                            that.$el.find('.messagesbtn sup').hide();
                        }
                        that.firstTime = true;
                        that.$el.find('.announcement_dialogue').find('.date').html(that.getTimeAgo(that.criticalMessageTime));
                    });
                },
                getTimeAgo: function (date) {
                    return moment(date).fromNow();

                },
                setIsActiveTab: function () {
                    var hidden = "hidden";

                    // Standards:
                    if (hidden in document)
                        document.addEventListener("visibilitychange", onchange);
                    else if ((hidden = "mozHidden") in document)
                        document.addEventListener("mozvisibilitychange", onchange);
                    else if ((hidden = "webkitHidden") in document)
                        document.addEventListener("webkitvisibilitychange", onchange);
                    else if ((hidden = "msHidden") in document)
                        document.addEventListener("msvisibilitychange", onchange);
                    // IE 9 and lower:
                    else if ('onfocusin' in document)
                        document.onfocusin = document.onfocusout = onchange;
                    // All others:
                    else
                        window.onpageshow = window.onpagehide
                                = window.onfocus = window.onblur = onchange;

                    function onchange(evt) {
                        var v = 'visible', h = 'hidden',
                                evtMap = {
                                    focus: v, focusin: v, pageshow: v, blur: h, focusout: h, pagehide: h
                                };

                        evt = evt || window.event;
                        if(!app.get("newWin")){
                            if (evt.type in evtMap){
                                    document.body.className = evtMap[evt.type];
                                }
                            else{
                                document.body.className = this[hidden] ? "hidden" : "visible";
                               }
                       }
                    }
                },
                toggleAnnouncement: function () {
                    this.$el.find('.announcement_dialogue').slideToggle();
                },
                closeAnnouncement: function () {
                    this.isForceHide = true;
                    this.$el.find('.announcement_dialogue').hide();
                },
                quickAdd: function () {
                    var that = this;
                    //this.$el.find('.add_dialogue').slideToggle('fast');
                    //this.$el.find('.announcement_dialogue').hide();
                    if (this.isQuickMenuLoaded == true)
                        return;
                    this.isQuickMenuLoaded = true;

                    this.$el.find('.add_dialogue div').css('top', '47%');
                    require(["common/quickadd"], function (quickadd) {
                        var mPage = new quickadd({page: that});
                        /// that.app.showLoading(false, that.$el.find('.add_dialogue'));
                        that.$el.find('.add_dialogue').html(mPage.$el);
                    });
                }


            });
        });
