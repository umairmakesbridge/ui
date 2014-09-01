define(['text!crm/google/html/login.html'],
        function(template) {
            'use strict';
            return Backbone.View.extend({
                events: {
                    "click .setEmail": 'checkEmptyEmail',
                    "click #btnGoogleLogin": 'getStarted' 
                  
                },
                initialize: function() {
                    var app =  this.options.app ? this.options.app : this.options.page.app;
                    var google = app.getAppData("google");
                    this.template = _.template(template);
                    this.render();
                    var el = this.$el;
                   
                    this.passwordChange = false;
                    app.showLoading('Loading Credentials', el);
                    if (google && google.isGoogleUser == "Y") {
                        // el.find('#hrAccount,#hrApiToken,#hrEmail').attr('readonly','readonly');
                        var URL = "/pms/io/google/setup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getEmail";
                        jQuery.getJSON(URL, function(tsv, state, xhr) {
                            var creds = jQuery.parseJSON(xhr.responseText);
                            if (creds) {
                                el.find('#google_email').removeAttr('readonly').val(creds["googleEmail"]);
                            }
                        });
                    }
                    app.showLoading(false, el);
                },
                render: function() {
                    this.app = this.options.app ? this.options.app : this.options.page.app;
                    this.dialog = this.options.dialog;
                    this.parent = this.options.page ? this.options.page : null;
                    this.layout = this.options.layout ? this.options.layout : '';
                    var that = this;
                    this.isAuthorize = this.options.isAuthorize ? this.options.isAuthorize : false;
                    this.$el.find('').on('click',function(){
                        that.getStarted();
                    })
                     this.getUser();
                    this.$el.html(this.template({layout: this.layout, isAuthorize: this.isAuthorize}));
                    
                },
                getStarted: function() { 
                    var that = this;
                    var URL = "/pms/io/google/setup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getAuthenticationUrl";
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        var urls = jQuery.parseJSON(xhr.responseText);
                        if (that.app.checkError(urls)) {
                            return false;
                        }
                        if (urls[0] !== "err") {
                            var url = urls.authenticationURL;
                            var windowName = "popUp";
                            window.open(url, windowName, "width=600,height=920,scrollbars=yes");

                        }

                    });

                },
                 getUser: function() { 
                    var that = this;
                    var URL = "/pms/io/google/setup/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=getUser";
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (that.app.checkError(data)) {
                            return false;
                        } 
                       
                        if (data.name) {
                            that.$el.find("#imguser").attr('src',data.picture);
                           that.$el.find("#spnname").html(data.name);
                           that.$el.find("#spnemail").html(data.email);
                        }

                    });

                },
                 
                checkEmptyEmail: function(obj) {
                    var that = this;
                    var app = this.app;
                    var el = this.$el;
                    if ($(obj.target).hasClass('saving')) {
                        return false;
                    } else {
                        var el = this.$el;
                        var isValid = this.validateEmail();
                        // check email if its empty
                        if (!el.find('#google_email').val()) {
                            that.app.showError({
                                control: el.find('.email-container'),
                                message: "Email can't be empty"
                            });
                            isValid = false;
                        }

                        if (isValid)
                            this.saveEmail();
                    }

                },
                saveEmail: function() {
                    var that = this;
                    var app = this.app;
                    var el = this.$el;
                    if (!this.$el.find('#google_email').val())
                    {
                        app.showError({
                            control: el.find('.email-container'),
                            message: "Email can't be empty"
                        });
                        return;
                    }
                    var URL = "/pms/io/google/setup/?BMS_REQ_TK=" + app.get('bms_token') + "&type=setEmail";
                    that.$el.find('#hrEmail').attr('readonly', 'readonly');
                    that.$el.find('.setEmail').addClass('saving');
                    app.showLoading(true, that.$el);
                    $.post(URL, {googleEmail: that.$el.find('#google_email').val()})
                            .done(function(data) {
                                var creds = jQuery.parseJSON(data);
                                that.$el.find('#google_email').removeAttr('readonly')
                                that.$el.find('.setEmail').removeClass('saving');
                                if (creds[0] == "err")
                                    app.showAlert(creds[1].replace('&#58;', ':'), that.$el);
                                else
                                    app.showMessge(creds.success, $("body"), {fixed: true});
                            });
                    app.showLoading(false, that.$el);

                } , 
                validateEmail: function() {
                    var campview = this;
                    var el = this.$el;
                    var isValid = true;
                    var app = this.app;
                    var appMsgs = campview.app.messages[0];
                    if (el.find('#google_email').val() != '' && !app.validateEmail(el.find('#google_email').val()))
                    {
                        app.showError({
                            control: el.find('.email-container'),
                            message: appMsgs.SF_email_format_error
                        });
                        isValid = false;
                    }
                    else
                    {
                        app.hideError({
                            control: el.find(".email-container")
                        });
                    }
                    return isValid;
                }

            });
        });