define(['text!account/html/gmailaccounts.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className: 'gmailaccounts setting-section',
                events: {
                    'click #btnGmailAccount':'getStarted',
                    'click .remove-gmailaccount':'revokeGmailAccount'
                },
                initialize: function () {
                    this.template = _.template(template);
                    this.apps = this.options.apps;
                    this.postObject = this.options.postObj;
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {                    
                    this.$gamilaccountContainer = this.$("#gmailaccount_grid tbody");
                    this.checkGmailStatus();
                },
                checkGmailStatus: function (isLogin) {
                    this.app.showLoading("Checking gmail account status...", this.$el);
                    this.app.getData({
                        "URL": "/pms/io/google/gmailSetup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=status",
                        "key": "gmailAccount",
                        callback: _.bind(function () {
                            this.app.showLoading(false, this.$el);
                            this.checkGmailAuth();
                        }, this),
                        errorCallback: _.bind(function () {
                            this.gmailSetup = false;
                            this.app.showLoading(false, this.$el);
                            this.forceLoadSetupArea();
                        }, this)
                    });
                },
                checkGmailAuth: function() { 
                    var google = this.app.getAppData("gmailAccount");
                    if (google[0] == "err" || google.isGoogleUser == "N") {
                        this.gmailSetup = false;
                        this.forceLoadSetupArea(false);

                    } else {
                        this.gmailSetup = true;                                                                 
                        this.forceLoadSetupArea(true);                                
                    }
                },
                forceLoadSetupArea : function(isGmailAuth){
                    if(isGmailAuth===false || isGmailAuth==="N"){
                        this.$(".gmail-account-new").show();
                        this.$(".gmail-account-added").hide();
                    }
                    else{
                        this.$(".gmail-account-new").hide();
                        this.$(".gmail-account-added").show();
                        this.loadGmailAccount();
                    }
                },
                getStarted: function () {
                    var that = this;
                    this.app.showLoading("Loading gmail authentication...", this.$el);
                    var URL = "/pms/io/google/gmailSetup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getAuthenticationUrl";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        var urls = jQuery.parseJSON(xhr.responseText);
                        that.app.showLoading(false, that.$el);
                        if (that.app.checkError(urls)) {
                            return false;
                        }
                        if (urls[0] !== "err") {
                            var url = urls.authenticationURL;
                            var windowName = "gmailPopup";
                            var childWindow = window.open(url, windowName, "width=600,height=920,scrollbars=yes");
                            var intervalID = window.setInterval(function () {
                                if (childWindow && childWindow.closed) {
                                    window.clearInterval(intervalID);
                                    that.checkGmailStatus();
                                }
                            }, 200);

                        }

                    });

                },
                loadGmailAccount: function () {
                    this.app.showLoading("Loading Gmail Account...", this.$el);
                    var URL = "/pms/io/google/gmailSetup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getUser";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        var _json = jQuery.parseJSON(xhr.responseText);
                        this.app.showLoading(false, this.$el);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        if (_json[0] !== "err" && _json.id) {
                            this.$(".gmail-account-name").html(_json.name ? _json.name : _json.email);
                            this.$(".gmail-account-email").html(_json.email);
                            if(_json.picture){
                                this.$(".gmail-account-image").attr("src",_json.picture)
                            }
                            
                        }
                        else{
                            this.app.showAlert(_json[1],this.$el);
                        }
                        

                    },this));
                },
                revokeGmailAccount:function(){                    
                    this.app.showAlertPopup({heading: 'Revoke Access',
                        detail: "Are you sure you want to revoke access for this gmail account?",
                        text:"Revoke",
                        icon:"delete",
                        callback: _.bind(function() {
                            this.procceedRevokeGmail();
                        }, this)},
                    $('body'));
                },
                procceedRevokeGmail:function(){        
                    this.app.showLoading("Removing Gmail Account...", this.$el);
                    var URL = "/pms/io/google/gmailSetup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=revokeAccess";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        var _json = jQuery.parseJSON(xhr.responseText);
                        this.app.showLoading(false, this.$el);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        if (_json[0] !== "err") {
                            this.app.showMessge(_json.msg?_json.msg:"This account access has be revoked successfully."); 
                            this.gmailSetup = false;                                                                       
                            this.forceLoadSetupArea("N");                                                                
                        }
                        else{
                            this.app.showAlert(_json[1],this.$el);
                        }
                    },this));
                }


            });
        });
