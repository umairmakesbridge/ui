define([
    'jquery', 'underscore', 'backbone', 'bootstrap', 'views/common/dialog', 'views/common/dialog2','views/common/add_action','moment'
], function ($, _, Backbone, bootstrap, bmsStaticDialog, bmsDialog, addDialog,moment) {
    'use strict';
    var App = Backbone.Model.extend({
        messages: [{'CAMP_subject_empty_error': 'Subject cannot be empty',
                'CAMP_subject_length_error': 'Subject limit is 100 characters',
                'CAMP_fromname_empty_error': 'From name cannot be empty',
                'CAMP_replyto_empty_error': 'Reply field cannot be empty',
                'CAMP_replyto_format_error': 'Please enter correct email address format',
                'CAMP_fromemail_format_error': 'Please enter correct email address format',
                'CAMP_fromemail_default_format_error': 'Please enter correct email address format',
                'CAMP_defaultreplyto_format_error': 'Please enter correct email address format',
                'CAMP_defaultreplyto_empty_error': 'Reply field cannot be empty',
                'CAMP_defaultfromname_empty_error': 'From name cannot be empty',
                'CAMP_draft_success_msg': 'Campaign status is Draft',
                'CAMP_copy_success_msg': 'Campaign copy is complete',
                'CAMP_subject_info': 'Subject of the email',
                'CAMP_femail_info': 'From email of the email',
                'CAMP_fname_info': 'From name of the email',
                'CAMP_replyto_info': 'Reply to email of the email',
                'SF_userid_empty_error': 'User ID cannot be empty',
                'SF_userid_format_error': 'Invalid User ID. Hint: IDs are in an email format',
                'SF_pwd_empty_error': 'Enter password',
                'SF_email_format_error': 'Please enter correct email address format',
                'NS_userid_empty_error': 'User ID cannot be empty',
                'NS_userid_format_error': 'Invalid User ID. Hint: IDs are in an email format',
                'NS_pwd_empty_error': 'Enter password',
                'NS_accid_empty_error': 'Account id cannot be empty',
                'NS_email_format_error': 'Please enter correct email format',
                'CT_copyname_empty_error': 'Name cannot be empty',
                'CSVUpload_wrong_filetype_error': 'CSV format only. Watch video on how to save an excel file to CSV.',
                'CSVUpload_cancel_msg': 'Your CSV upload has been cancelled',
                'MAPDATA_newlist_empty_error': 'Enter a list name',
                'MAPDATA_newlist_exists_error': 'List name already exists',
                'MAPDATA_extlist_empty_error': 'Choose a list',
                'MAPDATA_email_format_error': 'Please enter correct email address format',
                'MAPDATA_bmsfields_empty_error': 'Match your CSV columns to fields. Columns that you do not match will not be uploaded',
                'MAPDATA_bmsfields_email_error': 'Please select atleast Email address as a mapping column',
                'MAPDATA_bmsfields_duplicate_error': 'Your have duplicate field names. Field names must be unique',
                'MAPDATA_customfield_placeholder': 'New custom field',
                'TRG_basic_no_field': 'Select a field',
                'TRG_basic_no_matchvalue': 'Please provide match field value',
                'TRG_score_novalue': 'Enter a score value',
                'TRG_form_noform': 'Choose a form',
                'CRT_tarname_empty_error': 'Target name cannot be empty',
                'CAMPS_campname_empty_error': 'Campaign name cannot be empty',
                'CAMPS_delete_confirm_error': 'Are you sure you want to delete?',
                'CAMPS_name_empty_error': 'No campaign found',
                'CAMPS_html_empty_error': 'Campaign has not content',
                'CAMPS_delete_success_msg': 'Campaign deleted',
                'SUB_updated': 'Subscriber updated successfully',
                'CAMPS_templatename_empty_error': 'Template name can not be empty',
                'MAPDATA_importlist_empty_error': 'Enter an import name',
            }],
        showbacktooltip: false,
        initialize: function () {
            //Load config or use defaults
            this.set(_.extend({
                env: 'test',
                complied: 1,
                bms_token: bms_token,
                isMEETemplate: $.getUrlVar(false, 'meeTemplate'),
                isFromCRM: $.getUrlVar(false, 'crm'),
                tipId : $.getUrlVar(false,'tipId'),
                workId : $.getUrlVar(false,'workId'),
                newWin : $.getUrlVar(false,'newWin'),
                subNum : $.getUrlVar(false,'subNum'),
                preview_domain: previewDomain,                
                content_domain: contentDomain,
                user_Key: userKey,
                images_CDN: imagesCDN,
                static_CDN: staticCDN,
                host: window.location.hostname,
                path: _path,                
                session: null,
                app_data: {}
            }, window.sz_config || {} ));
            this.testUsers = ['admin', 'jayadams', 'demo','MKS-Training2','mansoor@makesbridge.com'];
            this.dcItemsUsers = ['admin', 'jayadams', 'demo','fisglobal'];

            //Convenience for accessing the app object in the console
            if (this.get('env') != 'production') {
                window.BRIDGEMAIL = this;
            }
            //this.CRMGetStatus();
            //Exposes Workspaces 
            this.workid = {"contacts":"viewContacts","campaigns":"campaignListing","workflows":"workflowListing","forms":"forms_listings","landingpages":"landingPageslist"
                            ,"templates":"templateGallery","lists":"viewLists","tags":"viewTags","targets":"viewTargets","nurturetracks":"nurtureTracks","autobots":"autoBots",
                            "reports":"camapignReport",subscriber:"openSubscriber",camppreview:"previewCamp"};
            this.set("s_path",this.get("path"));            
            if(this.get("env")=="production"){
                this.set("path",window.location.protocol+"//"+imagesCDN+this.get("path"));
            }        
              
        },
        start: function (Router, MainContainer, callback) {
            //Create the router
            this.router = new Router('landing');
            //Wait for DOM to be ready
            $(_.bind(function () {
                //Create the main container
                this.mainContainer = new MainContainer({app: this});
                // Dialog Flag 
                this.isDialogExists = false;
                // Dialog view 
                this.dialogView = '';
                // Add Dialog view 
                this.addDialogView = '';
                // Dialog Array
                this.dialogArray = [];
                // Merge Tag
                this.mergeRequest = 0;
                // Workspace Tabs 
                this.tabsArray = [];
                // Salesforce Merge Allowed 
                this.salesMergeAllowed = false;
                //attaching main container in body                                
                $('body').append(this.mainContainer.$el);
                $('body').append(this.mainContainer.footer.$el);
                if(this.get("newWin")){
                    $("body").addClass("new-win");
                }
                this.mainContainer.dashBoardScripts();
                this.getUser();
                this.initScript();
                try{
                    $("html").removeClass("loading-html");
                   
                }
                catch(e){
                    
                }
                
                (callback || $.noop)();
            }, this));
        },
        initScript: function () {

            this.autoLoadImages();
            this.setInfo();
            var app = this;
            $("body").click(function (ev) {
                $(".custom_popup").hide();
                if (!($(ev.target).hasClass('percent'))) {
                    $(".pstats").remove();
                }
                if (!($(ev.target).hasClass('sortoption_expand'))) {
                    $("#autobots_search_menu").hide();
                }

                var container = $(".messages_dialogue");
                if (!container.is(ev.target) // if the target of the click isn't the message dialogue...
                        && container.has(ev.target).length === 0) { // ... nor a descendant of the  message dialogue
                    if (!$(ev.target).hasClass('messagesbtn') && !$(ev.target).hasClass('view-all') && !$(ev.target).parents('.messagesbtn').length && !$(ev.target).hasClass('r-notify') && !$(ev.target).hasClass('closebtn')) {
                        container.hide();

                    }
                }
                $(".nurture_msgslist").hide();

                var container = $(".add_dialogue");
                if (!container.is(ev.target) // if the target of the click isn't the message dialogue...
                        && container.has(ev.target).length === 0) { // ... nor a descendant of the  message dialogue
                    if (!$(ev.target).hasClass('quick-add') && !$(ev.target).hasClass('plusicon') && !$(ev.target).hasClass('btn-ok') && !$(ev.target).hasClass('close') && !$(ev.target).hasClass('btn-cancel') && !$(ev.target).parents('div').hasClass('btns')) {
                        container.animate({top:"-600px"});
                    }
                }
                var container = $(".ocp_stats");
                if (!container.is(ev.target) // if the target of the click isn't the message dialogue...
                        && container.has(ev.target).length === 0) { // ... nor a descendant of the  message dialogue
                    if (!$(ev.target).hasClass('metericon'))
                        container.hide('fast');
                }
            

                $(".tagbox-addbox").remove();
                $("#camp_tags").removeClass("active");
                $(".tooltip-inner").parents(".tooltip").remove();
                var getCmpField = $(".ws-content.active #header_wp_field");
                if (getCmpField.attr("process-id")) {
                    $(".ws-content.active").find(".camp_header .c-name .edited").hide();
                    $(".ws-content.active").find(".camp_header .c-name h2,#campaign_tags").show();
                }
                if (app.mainContainer.$(".icon-menu").hasClass("active")) {
                    app.mainContainer.$(".icon-menu").removeClass("active");

                    if (!($(ev.target).hasClass('refresh')))
                        app.mainContainer.$(".slidenav-dd").hide();
                }
                if (app.mainContainer.$('.sc-links ul').hasClass('open')) {
                    app.mainContainer.$('.sc-links ul').removeClass('open');
                    app.mainContainer.$('.sc-links ul').hide();
                }
                $(".messsage_alert").fadeOut("fast", function () {
                    $(this).remove();
                });
                $("#template_search_menu").hide();
            });
            $("body").keyup(_.bind(function(e){

            if(e.keyCode == 27){
                     if(this.dialogArray.length > 0){
                        this.dialogView.hide();
                    }
                    $('body').find('.moda-v2').parent().remove();
                }  
            },this));
            $("body").mousedown(function () {
                $(".MEE_EDITOR .alertButtons").hide();
            })


            var self = this;
            var content_height = ($('body').height() - 90);

            this.set("wp_height", (content_height - 100));
            $(window).resize(function () {
                self.resizeWorkSpace();
            });
            var _app = this;
            $(document).ajaxComplete(function (event, request, settings) {
                if (request.responseText) {
                    var result = jQuery.parseJSON(request.responseText);
                    if (result[0] == "err" && result[1] == "SESSION_EXPIRED") {
                        var messageObj = {};
                        messageObj["heading"] = "Session Expired"
                        messageObj["detail"] = "Your session has expired due to an extended period of inactivity. You will need to login again to access the requested information.";
                        _app.showLoginExpireAlert(messageObj, $("body"));
                        return false;
                    }
                }
            });

            //Ajax Error handling
            $(document).ajaxError(function (event, jqxhr, settings, exception) {
                console.log(event + "\n-Jxhr Object=" + jqxhr + "\n-Setttings=" + settings + -"\n-Exception=" + exception);
            });
            //Cache Clear time set
            this.clearCache();
            this.mainContainer.$el.css("min-height", $(document.documentElement).height() - 35);
            
        },
        getUser: function () {
            var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + this.get("bms_token") + "&type=get";
            jQuery.getJSON(URL, _.bind(function (tsv, state, xhr) {
                var _json = jQuery.parseJSON(xhr.responseText);
                if (this.checkError(_json)) {
                    return false;
                }
                this.set("user", _json);
                var allowedUser = ['bayshoresolutions'];
                if (allowedUser.indexOf(this.get("user").userId) > -1 || this.testUsers.indexOf(this.get("user").userId)>-1) {
                    if(this.get("user").userId === 'bayshoresolutions'){
                        this.mainContainer.$(".local-adds").addClass('bayshore-toggle');   
                    }
                    this.mainContainer.$(".local-adds").show();
                    require(["common/localTile"],_.bind(function(localTile){
                        var tmPr =  new localTile({app:this,userId:this.get("user").userId}); // isText to Dynamic
                         this.mainContainer.$("#tiles").append(tmPr.$el);
                         this.mainContainer.initializeIsotops();
                        // tmPr.init();
                       },this));
                }
                else {
                    this.mainContainer.$(".local-adds").hide();
                    this.mainContainer.initializeIsotops();
                }                
                
                if(this.get("tipId")==1){
                    this.mainContainer.tip_test();
                    this.mainContainer.$("#tipntest-toggle-one").show();
                    this.mainContainer.$("#tipntest-toggle-two").hide();
                    this.mainContainer.$(".workspace .ws-tabs").css('top','140px');
                    this.mainContainer.openTipnTest=true;
                    this.mainContainer.isTipnTestFlag=true;
                }else if(this.get("tipId")==2){
                    this.mainContainer.tip_test_2();
                    this.mainContainer.$("#tipntest-toggle-one").hide();
                    this.mainContainer.$("#tipntest-toggle-two").show();
                    this.mainContainer.$(".workspace .ws-tabs").css('top','140px');
                    this.mainContainer.openTipnTest2=true;
                }
                if(this.get("workId")){
                    if(this.workid[this.get("workId")] && this.mainContainer[this.workid[this.get("workId")]]){
                        this.mainContainer[this.workid[this.get("workId")]]();
                    }
                }
                if(_json.fromEmailMergeAllowed == "Y"){
                    this.salesMergeAllowed = true;
                }
                if(this.mainContainer){
                    this.showFeatures();
                 }else{
                    setTimeout(_.bind(this.showFeatures,this),200);
                 }

            }, this));
            this.checkFromCRM();
        },
        checkFromCRM: function () {
            if (this.mainContainer) {
                this.fromCRM();
            } else {
                setTimeout(_.bind(this.fromCRM, this), 200);
            }
        },
        showFeatures: function () {
            var allowedUser = ['admin', 'jayadams', 'demo','hawaiilife','MKS-Training2','mansoor@makesbridge.com'];
            if (allowedUser.indexOf(this.get("user").userId) > -1) {
                this.mainContainer.$(".one-one-listing,.signup-forms").show();
            }
            else {
                this.mainContainer.$(".one-one-listing,.signup-forms").show();
            }
           // console.log(this.get("user"));
                 if (this.testUsers.indexOf(this.get("user").userId) > -1) {
                    this.mainContainer.$(".tipntestlistings,.report-flow").show();
                }else{
                    this.mainContainer.$('.tipntestlistings,.report-flow').hide();
                }
        },
        fromCRM: function () {
            if (this.get("isFromCRM") && this.get("isFromCRM").toLowerCase() == "y") {
                this.mainContainer.$(".logout").hide();
            }
            else {
                this.mainContainer.$(".logout").show();
            }
        },
        clearCache: function () {
            window.setTimeout(_.bind(this.removeAllCache, this), 1000 * 60 * 30);
        },
        checkError: function (result) {
            var isError = false;
            if (result && result[0] && result[0] == "err") {
                isError = true;
            }
            return isError;
        },
        autoLoadImages: function () {
            var preLoadArray = ['img/trans_gray.png', 'img/recurring.gif', 'img/loading.gif', 'img/spinner-medium.gif', 'img/greenloader.gif', 'img/refresh-g.gif']
            $(preLoadArray).each(function () {
                var image = $('<img />').attr('src', this);
            });
        },
        resizeWorkSpace: function () {
            var body_size = $('body').height() - 90;
            $(".workspace .ws-content").css("min-height", (body_size - 100));
            //$(".bDiv").css("height",body_size-397);          
            //$("#campaigns_list .bDiv").css("height",body_size-300);      
            this.set("wp_height", (body_size - 100));

            //$('#campaign_from_email_chosen').width(parseInt(subj_w-40));
            this.fixEmailFrom();
        },
        fixEmailFrom: function () {

            var active_workspace = $(".ws-content.active");
            var subj_w = active_workspace.find('#campaign_subject').width(); // Abdullah Check
            active_workspace.find('#campaign_from_email_chosen').css({"width": parseInt(subj_w + 81) + "px"});   // Abdullah Try
            if (active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width()) {
                active_workspace.find("#campaign_from_email_input").css({"width": active_workspace.find("#campaign_from_email_input").prev().find(".chosen-single span").width() + "px", "margin-right": "61px"}); // Abdullah Check
                active_workspace.find("#campaign_from_email_chosen .chosen-drop").css("width", (parseInt(active_workspace.find('#campaign_from_email_chosen').width())) + "px");
            }
            if (active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width()) {
                active_workspace.find("#fromemail_default_input").css("width", active_workspace.find("#fromemail_default_input").prev().find(".chosen-single span").width() - 6 + "px");   // Abdullah Check
            }
        },
        openModule: function (obj) {
            alert($(obj.target).attr("id"));
        },
        showLoading: function (message, container, _styles) {
            var divStyles = "";
            if (message) {
                message = message !== true ? message : 'Loading...';
                $(container).find('.loading').remove();
                if (_styles) {
                    _.each(_styles, function (val, key) {
                        divStyles += key + ":" + val + ";"
                    }, this);
                }
                $(container).append('<div class="loading"><p style=' + divStyles + '>' + message + '</p></div>');
            }
            else {
                $(container).find(' > .loading').remove();
            }
        },
        showAlert: function (message, container, option) {
            if (message) {
                var inlineStyle = (option && option.top) ? ('top:' + option.top) : '';
                var fixed_position = (option && option.fixed) ? "fixed" : "";
                var cl = 'error';
                var title = 'Error';
                if (option && option.type == 'caution')
                {
                    cl = 'caution';
                    title = 'Caution';
                }

                var message_box = $('<div class="messagebox messsage_alert messagebox_ ' + cl + '" style=' + inlineStyle + '><h3>' + title + '</h3><p>' + message + '</p><a class="closebtn"></a></div> ');
                $(container).append(message_box);
                message_box.find(".closebtn").click(function (e) {
                    message_box.fadeOut("fast", function () {
                        $(this).remove();
                    })
                    e.stopPropagation()
                });
            }
        },
        showAlertDetail: function (message, container) {
            if (message) {
                var dialogHTML = '<div class="overlay"></div><div class="messagebox messagebox_ delete"><h3>' + message.heading + '</h3>';
                var btn = '<div class="btns"><a class="btn-red btn-ok"><span>Yes, Delete</span><i class="icon delete"></i></a><a class="btn-gray btn-cancel"><span>No, Cancel</span><i class="icon cross"></i></a></div><div class="clearfix"></div>';
                dialogHTML += '<p>' + message.detail + '</p>' + btn + '</div>';
                var dialog = $(dialogHTML);
                $(container).append(dialog);
                dialog.find(".btn-ok").click(function () {
                    dialog.fadeOut("fast", function () {
                        $(this).remove();
                    });
                    if (message.callback)
                        message.callback();
                });

                dialog.find(".btn-gray").click(function () {
                    dialog.fadeOut("fast", function () {
                        $(this).remove();
                    })
                });
            }
        },
        showAlertPopup: function (message, container) {
            if (message) {
                var dialogWidth = message.dialogWidth? "width:"+message.dialogWidth: "";
                var dialogHTML = '<div class="overlay"></div><div class="messagebox messagebox_ delete" style="'+dialogWidth+'"><h3>' + message.heading + '</h3>';
                var btn_class= message.btnClass?message.btnClass:"btn-red"; 
                var btn = '<div class="btns"><a class="'+btn_class+' btn-ok"><span>Yes, ' + message.text + '</span><i class="icon ' + message.icon + '"></i></a><a class="btn-gray btn-cancel"><span>No, Cancel</span><i class="icon cross"></i></a></div><div class="clearfix"></div>';
                dialogHTML += '<p>' + message.detail + '</p>' + btn + '</div>';
                var dialog = $(dialogHTML);
                $(container).append(dialog);
                dialog.find(".btn-ok").click(function () {
                    dialog.fadeOut("fast", function () {
                        $(this).remove();
                    });
                    if (message.callback)
                        message.callback();
                });

                dialog.find(".btn-gray").click(function () {
                    dialog.fadeOut("fast", function () {
                        $(this).remove();
                    })
                });
            }
        },
        showLoginExpireAlert: function (message, container) {
            if (message) {
                var dialogHTML = '<div class="overlay"><div class="messagebox caution"><h3>' + message.heading + '</h3>';
                var btn = '<div class="btns"><a href="/pms/" class="btn-green btn-ok"><span>Login</span><i class="icon next"></i></a></div><div class="clearfix"></div>';
                dialogHTML += '<p>' + message.detail + '</p>' + btn + '</div></div>';
                $(container).append(dialogHTML);
                $(".overlay .btn-ok").click(function () {
                    if (message.callback)
                        message.callback();
                });
            }
        },
        showMessge: function (msg) {
            $(".global_messages p").html(msg);
            $(".global_messages").show();
            var marginLeft = $(".global_messages").width() / 2;
            $(".global_messages").css("margin-left", (-1 * marginLeft) + "px");
            $(".global_messages").hide();
            $(".global_messages").slideDown("medium", function () {
                setTimeout('$(".global_messages").hide()', 4000);
            });
            $(".global_messages .closebtn").click(function () {
                $(".global_messages").fadeOut("fast", function () {
                    $(this).hide();
                })
            });
        },
        encodeHTML: function (str) {
            if(typeof(str)!=="undefined"){
                str = str.replace(/:/g, "&#58;");
                str = str.replace(/\'/g, "&#39;");
                str = str.replace(/=/g, "&#61;");
                str = str.replace(/\(/g, "&#40;");
                str = str.replace(/\)/g, "&#41;");
                str = str.replace(/</g, "&lt;");
                str = str.replace(/>/g, "&gt;");
                str = str.replace(/\"/g, "&quot;");
                str = str.replace(/\‘/g,"&#8216;");
            }
            else{
                str = "";
            }
            return str;
        }
        ,
        decodeHTML: function (str, lineFeed) {
            //decoding HTML entites to show in textfield and text area 				
            if(typeof(str)!=="undefined"){
                str = str.replace(/&amp;/g, "&");
                str = str.replace(/&#58;/g, ":");
                str = str.replace(/&#39;/g, "\'");                
                str = str.replace(/&#40;/g, "(");
                str = str.replace(/&#41;/g, ")");
                str = str.replace(/&lt;/g, "<");
                str = str.replace(/&gt;/g, ">");
                str = str.replace(/&gt;/g, ">");                
                str = str.replace(/&#9;/g, "\t");
                str = str.replace(/&nbsp;/g, " ");
                str = str.replace(/&quot;/g, "\"");
                str = str.replace(/&#8216;/g, "‘");      
                str = str.replace(/&#61;/g, "=");
                if (lineFeed) {
                    str = str.replace(/&line;/g, "\n");
                }
            }
            else{
                str = "";
            }
            return str;
        },
        encodingAttr:function(val){
            if(typeof(val)!=="undefined"){
                val = val.replace(/&/g, "&amp;")
                val = val.replace(/\'/g, "&#39;");
            }
            else{
                val = "";
            }
            return val;
        },
        decodeJSON: function(str){
            /*str = str.replace(/\\t/g, "\t"); 
            str = str.replace(/\\n/g, "\n");
            str = str.replace(/\\r/g, "\r");
            str = str.replace(/\\u0000|\\u0002|\\u0003|\\u0004|\\u0005|\\u0006|\\u0007|\\u0008|\\u0009|\\u000A|\\u000B|\\u000C|\\u000E|\\u000F|\\u0010|\\u0011|\\u0012|\\u0013|\\u0014|\\u0015|\\u0016|\\u0017|\\u0018|\\u0019|\\u001A|\\u001B|\\u001C|\\u001D|\\u001E|\\u001F/g, "");
            str = str.replace(/\\/g, "");
            str = str.replace(/&amp;/g, "&");
            str = str.replace(/\r\n/g, "\n"); */
            return str;
        },
        getMMM: function (month) {
            var monthNames = [
                "Jan", "Feb", "Mar",
                "Apr", "May", "Jun",
                "Jul", "Aug", "Sep",
                "Oct", "Nov", "Dec"
            ];
            return monthNames[month];
        },
        getCampStatus: function (flag) {
            // A=all, D=draft, S=scheduled, P=pending, C=completed, R = Running  
            var status = 'Draft';
            if (flag == 'A') {
                status = 'All'
            }
            else if (flag == 'D') {
                status = 'Draft'
            }
            else if (flag == 'P') {
                status = 'Pending'
            }
            else if (flag == 'C') {
                status = 'Sent'
            }
            else if (flag == 'S') {
                status = 'Scheduled'
            }
            else if (flag == 'R') {
                status = 'Running'
            }
            return status;
        },
        showTags: function (tags,type) {
            var tag_array = tags.split(",");
            var tag_html = "<ul>";
            var type = type ? type: "";
            $.each(tag_array, _.bind(function (key, val) {
                tag_html += "<li title='Click to view "+type+" with \"<b>"+this.encodingAttr(val)+"</b>\" tag.' class='showtooltip'><a class='taglink'>" + val + "</a></li>";
            },this));
            tag_html += "</ul>";
            return tag_html;
        },
        initSearch: function (obj, searchInput)
        {
            var target = $.getObj(obj, "a");
            searchInput.val(target.text());
            searchInput.keyup();
        },
        setAppData: function (appVar, data) {
            var _data = this.get("app_data");
            _data[appVar] = data;
        },
        getAppData: function (appVar) {
            return this.get("app_data")[appVar];
        },
        removeAllCache: function () {
            var cache = this.get("app_data");
            $.each(cache, function (k, v) {
                cache[k] = null;
                delete cache[k];
            })
            this.clearCache();
            console.log("Cache is cleared now time=" + (new Date()));
        },
        removeCache: function (key) {
            var cache = this.get("app_data");
            cache[key] = null;
            delete cache[key];
        },
        removeSpinner: function (elObj) {
            if (elObj.parents('.ws-content').length) {
                var activeSpaceID = elObj.parents('.ws-content').attr('id');
                activeSpaceID = activeSpaceID.split('_')[1];
                $('#wp_li_' + activeSpaceID).find('.spinner').remove();
            }
        },
        addSpinner: function (elObj) {
            if (elObj.parents('.ws-content').length) {
                var activeSpaceID = elObj.parents('.ws-content.active').attr('id');
                var lastActiveWorkSpace = activeSpaceID.split('_')[1];
                $('#wp_li_' + lastActiveWorkSpace).append('<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
            }
        },
        getClickableClass: function (value) {
            var classname = "";
            if (Number(value) === 0) {
                classname = "";
            } else {
                classname = "clickable_badge";
            }
            return classname;
        },
        getData: function (data) {
            var app = this;
            $.ajax({
                dataType: "json",
                url: data.URL,
                async: data.isAsyncFalse ? false : true,
                success: function (tsv, state, xhr) {
                    if (xhr && xhr.responseText) {
                        var salesforce = jQuery.parseJSON(xhr.responseText);
                        if (app.checkError(salesforce)) {
                            if (data.errorCallback)
                                data.errorCallback();
                            return false;
                        }
                        app.setAppData(data.key, salesforce);
                        if (data.callback)
                            data.callback();
                    }
                }
            });
        },
        showDialog: function (options) {
            options['app'] = this;
            if (!this.isDialogExists) {
                var dialog = new bmsDialog(options);
                this.dialogView = dialog;
                this.dialogArray.push(options);
                $("body").append(dialog.$el);
                dialog.show();
                this.isDialogExists = true;
                return dialog;
            } else {
                var returnDialog = this.appendDialogView(options);
                return returnDialog;
            }
        },
        showStaticDialog: function (options) {
            options['app'] = this;
            var dialog = new bmsStaticDialog(options);
            $(".modal,.modal-backdrop").css("visibility","hidden");
            $("body").append(dialog.$el);
            dialog.show();
            return dialog;           
        },
        showAddDialog: function (options) {                        
            if (this.get("user") && this.get("user").hasSalesOnlyAccess == "N") {
                this.addDialogView = new addDialog(options);            
                $("body").append(this.addDialogView.$el);            
                this.addDialogView.init();
                return this.addDialogView;           
            }
        },       
        enableValidation: function (options)
        {
            if (options.controlcss)
                options.control.attr('style', options.controlcss);
            if (options.customfield)
                options.customfield.attr('style', options.customfieldcss);
            options.valid_icon.show();
            options.valid_icon.attr('data-content', options.message);
            options.valid_icon.popover({'placement': 'right', 'trigger': 'hover', delay: {show: 0, hide: 0}, animation: false});
        },
        disableValidation: function (options)
        {
            options.valid_icon.hide();
            options.control.removeAttr('style');
            if (options.customfield)
                options.customfield.removeAttr('style');
        },
        validateEmail: function (emailVal)
        {
            var email_patt = new RegExp("[A-Za-z0-9A-Z!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?");
            //var email_patt = new RegExp("[A-Za-z0-9'_`-]+(?:\\.[A-Za-z0-9'_`-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])");
            return email_patt.test(emailVal);
        },
        showError: function (params) {
            if (params.control) {
                params.control.find(".inputcont").addClass("error");
                params.control.find(".inputcont").append('<span class="errortext"><i class="erroricon"></i><em>' + params.message + '</em></span>');
            }
        },
        hideError: function (params) {
            if (params.control) {
                params.control.find(".inputcont").removeClass("error");
                params.control.find(".inputcont span.errortext").remove();
            }
        },
        addCommas: function (nStr) {
            nStr += '';
            var x = nStr.split('.');
            var x1 = x[0];
            var x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        },
        dateSetting: function (sentDate, sep) {
            sentDate = this.decodeHTML(sentDate);
            if (sep == "/")
                var _date = moment(sentDate, 'MM/DD/YYYY');
            if (sep == "-")
                var _date = moment(sentDate, 'YYYY-MM-DD');

            return _date.format("DD MMM YYYY");

        },
        showInfo: function (control, message)
        {
            control.append('<span class="fieldinfo"><i class="icon"></i><em>' + message + '</em></span>');
        },
        setInfo: function () {
            if (this.get("user")) {
                var _user = this.get("user");
                var fullName = _user.firstName + " " + _user.lastName;                
                this.mainContainer.$(".profiledd").attr("title","Click for account management").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                this.mainContainer.$(".user-name").html(this.stringTruncate(fullName, 20)); 
                
                if(_user.thumbURL){
                    this.mainContainer.$(".profile img").attr("src",this.decodeHTML(_user.thumbURL));
                }
                if (!_user.firstName && !_user.lastName) {
                    this.mainContainer.$(".user-name").html(_user.firstName);
                }
                if(_user.packageType && _user.packageType.toLowerCase()==="trial"){
                    var expiry_date = moment(_user.accountExpiry, 'YYYY-MM-DD  HH:mm');
                    if(expiry_date.format("YYYY")!=="Invalid date"){
                        var current_date = moment(new Date());
                        var expiryDaysLeft = expiry_date.diff(current_date,'days');
                        if(expiryDaysLeft<=30){
                            if(this.mainContainer.header.$(".announcementbtn").css("display")=="none"){                            
                                this.mainContainer.header.$(".announcementbtn").show();
                                this.mainContainer.header.$('.announcement_dialogue').show();
                            }
                            this.mainContainer.header.$('.announcement_dialogue').append("<div class='expire-message'><p>Your Trial Account expires in <b>"+expiryDaysLeft+" Days</b>. Please contact support to upgrade your account.</p></div>")                        
                        }
                    }
                }
                if(_user["tipntest"] && _user["tipntest"].toLowerCase()=="y"){
                    if(this.get("tipId")==2){
                        this.mainContainer.$(".ws-tabs").css("top","140px");
                        this.mainContainer.$("#tipntest-toggle-two").show();
                    }else{
                        this.mainContainer.$(".ws-tabs").css("top","140px");
                        this.mainContainer.$("#tipntest-toggle-one").show();
                    }
                    
                }
            }
            else {
                window.setTimeout(_.bind(this.setInfo, this), 200);
            }
        },
        stringTruncate: function (title, length) {
            // var title = 'web administrator';

            if (title && title.length > length) {
                return $.trim(title).substring(0, length)
                        .split(" ").slice(0, -1).join(" ") + "..";
            } else {
                return title;
            }

        },
        CRMGetStatus: function () {
            this.getData({
                "URL": "/pms/io/netsuite/getData/?BMS_REQ_TK=" + this.get('bms_token') + "&type=status",
                "key": "netsuite"
            });
            this.getData({
                "URL": "/pms/io/salesforce/getData/?BMS_REQ_TK=" + this.get('bms_token') + "&type=status",
                "key": "salesfocre"
            });
        },
        scrollingTop: function (scrollObj) {
            var scrolltoDiv = scrollObj.scrollDiv;
            var appendtoDiv = scrollObj.appendto;
            var scrollBar = scrollObj.scrollElement ? scrollObj.scrollElement : $(window);
            if (typeof (scrolltoDiv) === "string" && scrolltoDiv === 'window') {
                var top_button = $('<button class="ScrollToTop scroll-summary" type="button" style="display: none"></button>');
                $(appendtoDiv).append(top_button);
                top_button.click(_.bind(function () {
                    if (scrollObj.scrollElement && scrollBar[0] !== window) {
                        scrollBar.animate({scrollTop: 0}, 600);
                    }
                    else {
                        $("html,body").css('height', '100%').animate({scrollTop: 0}, 600).css("height", "");
                    }
                }, this));
                scrollBar.scroll(_.bind(function () {
                    if (scrollBar.scrollTop() > 50) {
                        top_button.fadeIn('fast');
                    } else {
                        top_button.fadeOut('fast');
                    }
                }, this));
                //console.log(scrolltoDiv + '   ' + appendtoDiv);
            }
        },
        removeDialogs: function () {
            if (this.dialogView) {
                this.dialogView.hide();
            }
        },
        isEmpty: function (val) {
            return (val === undefined || val == null || val.length <= 0) ? true : false;
        },
        isNumeric: function (s) {
            if (!/^\d+$/.test(s)) {
                return false;
            } else {
                return true;
            }
        },
        appendDialogView: function (options) {
            this.dialogArray.push(options);
            var length = this.dialogArray.length;
            var hideElement = 'dialogWrap-' + (length - 1);

            this.dialogView.dialogHeader(options);
            this.dialogView.dialogFooter(options);
            // Hide Previous and show new 
            this.dialogView.$el.find($('.' + hideElement)).hide();
            this.dialogView.$el.find('.backbtn').show();
            if (this.showbacktooltip == false) {
                this.dialogView.$el.find('.backbtn').tooltip('show');
                this.showbacktooltip = true;
            }
            //console.log(this.dialogArray);
            return this.dialogView;
        },
        validkeysearch: function (event) {
            var regex = new RegExp("^[A-Z,a-z,0-9]+$");
            var str = String.fromCharCode(!event.charCode ? event.which : event.charCode);
            if (event.keyCode == 8 || event.keyCode == 32 || event.keyCode == 37 || event.keyCode == 39) {
                return true;
            }
            else if (regex.test(str)) {
                return true;
            }
            else {
                return false;
            }
            event.preventDefault();
        },
        getIEVersion: function(){
            var msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
            if (isNaN(msie)) {
              msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);
            }
            return msie;
        },
        /*-----------------------------
         *          Tabs Switching and Scrolling  
         * -------------------------------*/
        pushWKSTabs : function(tabobj){
            var tabarray = this.tabsArray;
            var isTabExist = false;
            var result = '';
                    for(var i=0;i < tabarray.length; i++){
                    if(tabarray[i].wks_id === tabobj.wks_id){
                        isTabExist = true;
                        result = this.switchToActiveWKS(i,tabobj.wks_id); // Call to remove value from array
                       if(result){tabarray.push(result);} // push array value back again
                    }
                }
            
            if(!isTabExist){
                tabarray.push(tabobj);
            }
            //console.log(tabarray);
            /*-----Scrolling of Workspace-----*/
            var currentTab = tabarray.pop();
            $( window ).scrollTop( currentTab.wscroll );
            tabarray.push(currentTab);
        },
        switchToActiveWKS : function(index,tabobj_id){
             var tabarray = this.tabsArray;
             var spliced = tabarray.splice(index, 1);
             return spliced[0];
        },
        popWKSTabs: function(){
            var tabarray = this.tabsArray;
            var currentTab = tabarray.pop();
           $('#wp_li_'+currentTab.wks_id).click();
           $( window ).scrollTop( currentTab.wscroll );
        },
        scrollWKStab:function(et){
            var tabarray = this.tabsArray;
            var currentTab = tabarray.pop();
            if(currentTab){
                currentTab.wscroll = et;
                tabarray.push(currentTab);
            }
        },
        /*-------------------------------
         * Common Preview method
         * -------------------------------*/
       previewCCampaign: function(obj){
                            
                            var dialog_width = $(document.documentElement).width()-60;
				var dialog_height = $(document.documentElement).height()-182;
				var dialog = this.showDialog({title:'Campaign Preview of &quot;' + obj.camp_name + '&quot;' ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'dlgpreview',
						  bodyCss:{"min-height":dialog_height+"px"}
				});	
				this.showLoading("Loading Campaign HTML...",dialog.getBody());									
                                var preview_url = "https://"+this.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+obj.camp_id;  
                                require(["common/templatePreview"],_.bind(function(templatePreview){
                                var tmPr =  new templatePreview({frameSrc:preview_url,app:this,frameHeight:dialog_height,prevFlag:'C',tempNum:obj.camp_id,isText:obj.isTextOnly}); // isText to Dynamic
                                 dialog.getBody().append(tmPr.$el);
                                 this.showLoading(false, tmPr.$el.parent());
                                 var dialogArrayLength = this.dialogArray.length;
                                 tmPr.$el.addClass('dialogWrap-'+dialogArrayLength);
                                 tmPr.init();
                                 
                               },this));
                               
                               
       }
    });

    return new App();

});
