define(['text!common/html/templatePreview.html', 'common/ccontacts'],
        function (template, contactsView) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Template Preview
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click #send-template-preview': 'sendTempPreview',
                    'click #camp-prev-select-contact': 'loadContact',
                    'keyup #prev-email': 'sendTempKey',
                    'click .show-original-btn': 'showOrginalClick',
                    'click .annonymous-btn': 'anonymousbtnClick',
                    'click .prev-iframe-campaign': 'htmlTextClick',
                    'click .contact-remove-prev': 'removeContact'
                },
                /**
                 * Initialize view - backbone .
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.url = '';
                    this.bms_token = null;
                    this.tempNum = null;
                    this.original = 'N';
                    this.html = 'Y';
                    this.subNum = null;
                    this.render();
                },
                /**
                 * Initialize view .
                 */
                render: function () {

                    this.$el.html(this.template());
                    this.app = this.options.app;
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {

                    this.showFrame();
                    this.initCheckbox();
                    this.loadPrevTemplates();
                    /*Check and Uncheck of Checkbox*/
                    this.$('.show-original').on('ifChecked', _.bind(function (event) {
                        this.setiFrameSrc();
                    }, this));
                    this.$('.show-original').on('ifUnchecked', _.bind(function (event) {
                        this.setiFrameSrc();
                    }, this));
                    this.$el.parents('.modal').find('#dialog-title .dialog-title').removeAttr('data-original-title')
                    /* Chosen Plugin dropdown*/
                    this.$("#campaign-prev-select").chosen();

                    // IFrame Loaded Successfully 
                    this.$el.parents('.modal').find('.modal-header #dialog-title').append('<div class="loading-wheel" style="display: inline-block;left: 0.1%;position: relative;top: 0;z-index: 111;"></div>');
                    if(typeof(this.options.prevFlag)!=="undefined"){
                        this.$('#temp-camp-previewbar').delay(600).slideDown(500);
                    }
                    this.$("#email-template-iframe").load(_.bind(function () {
                        this.$el.parents('.modal').find('.modal-header #dialog-title .loading-wheel').hide();                        
                    }, this));
                    
                    //this.loadTemplates();
                    if (this.options.prevFlag === 'C')
                        this.loadContact();
                    if (this.options.isText && this.options.isText == "Y") {
                        this.$("#choose_soruce").hide();
                        this.$(".messagebox").show();
                        this.$(".selection-boxes").css({"width": "347px", "height": "35px"})

                    }
                    else {
                        this.$(".messagebox").hide();
                        this.$("#choose_soruce").show();
                    }
                    //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                attachEvents: function () {


                },
                showFrame: function () { // Show Iframe on default load
                    if (this.options.prevFlag === 'C') {
                        this.setiFrameSrc();
                    } else {
                        this.$('#email-template-iframe').attr('src', this.options.frameSrc).css('height', this.options.frameHeight);
                    }
                },
                setiFrameSrc: function () { // HTML & Text Tab Click
                    var newFrameheight = '';
                    var frame = '';
                    if(typeof(this.options.prevFlag)!=="undefined"){
                        if (this.$('.show-original').is(':checked')) {
                            this.original = 'Y';
                        } else {
                            this.original = 'N';
                        }
                        /*check contact selected or not*/
                        if (this.$('.selected').attr('id') === "prev-iframe-html") {
                            this.html = 'Y';
                        }
                        else {
                            this.html = 'N';
                        }
                        if (this.options.isText && this.options.isText == 'Y') {
                            this.html = 'N';
                        }
                        frame = this.options.frameSrc + "&html=" + this.html + "&original=" + this.original;
                        /*Check if Contact is selected or not*/
                        if (this.subNum !== null) {
                            frame += "&snum=" + this.subNum;
                        }
                    }
                    else { 
                        frame = this.options.frameSrc ;
                    }
                    if (this.options.prevFlag === 'C') {
                        if (this.options.isText === "Y")
                            newFrameheight = this.options.frameHeight - 85;
                        else
                            newFrameheight = this.options.frameHeight - 170;
                    }
                    else if (this.options.prevFlag === 'T'){
                        newFrameheight = this.options.frameHeight - 50;
                    }
                    else {
                        newFrameheight = this.options.frameHeight;
                    }
                    this.$('#email-template-iframe').attr('src', frame).css('height', newFrameheight);
                },
                loadPrevTemplates: function () {
                    this.$('.previewbtns').hide();
                    if (this.options.prevFlag === 'T') {                        
                        this.setiFrameSrc();
                        this.$('#prev-email').focus();
                    } else if (this.options.prevFlag === 'C') {
                        this.$('.previewbtns').show();
                        this.setiFrameSrc();
                        this.$('#prev-email').focus();
                    }
                },
                sendTempPreview: function () { // Template Preview Send
                    var email = this.$('#prev-email').val();
                    var validEmail = this.options.app.validateEmail(email);
                    if (validEmail) {
                        this.$('#prev-email').parent().removeClass('error');
                        this.$('#prev-email').parent().find('span').remove();
                        this.$('#temp-camp-previewbar').removeAttr('style');
                        this.dynamicRequest();
                        var post_val = this.$('#sendtemp-preview').serialize();
                        this.$('#send-template-preview').addClass('loading-preview');
                        this.$('#prev-email').attr('disabled', 'disabled');
                        $.post(this.url, post_val)
                                .done(_.bind(function (data) {
                                    this.$('#send-template-preview').removeClass('loading-preview');
                                    this.$('#prev-email').removeAttr('disabled');
                                    data = JSON.parse(data);                                    
                                    if (data[0] == "success") {
                                        this.$('#prev-email').val("");
                                        this.app.showMessge('Template Preview Sent Successfully');                                        
                                        this.$('.contact-name').text('');
                                        this.$('#contact-name-prev').hide();
                                        this.subNum = null;
                                    }
                                    else if (data[0] == "err") {
                                        if(data[1]){
                                            this.app.showAlert(data[1]);
                                        }
                                    }
                                }, this));
                    } else {
                        this.$('#temp-camp-previewbar').css({'padding-bottom': '14px', 'padding-top': '25px'});
                        this.$('#prev-email').parent().addClass('error');
                        this.$('#prev-email').parent().append('<span class="errortext"><i class="erroricon"></i><em>' + this.options.app.messages[0].CAMP_fromemail_format_error + '</em></span>');
                    }

                },
                loadContact: function (ev) {                    
                    var active_ws = $(".modal-body");
                    active_ws.find('.campaign-clickers').remove();                    
                    active_ws.find('#camp-prev-contact-search').append(new contactsView({page: this, searchCss: '489px', contactHeight: '274px', hideCross: true, isCamPreview: true, placeholderText: 'Search for a contact to use for testing merge tag values'}).el)
                    active_ws.find('#prev-closebtn').css({'top': '18px'});                    
                    return;
                },
                htmlTextClick: function (ev) {
                    var tabID = ev.currentTarget.id;
                    this.$('.prev-iframe-campaign').removeClass('selected');
                    this.$('#' + tabID).addClass('selected');
                    this.setiFrameSrc();
                },
                sendTempKey: function (ev) {
                    ev.preventDefault();
                    if (ev.keyCode === 13) {
                        this.sendTempPreview();
                    }
                },
                initCheckbox: function () {
                    this.$('.show-original').iCheck({
                        checkboxClass: 'checkpanelinput previewbtns',
                        insert: '<div class="icheck_line-icon" style="margin: 4px 0 0 7px;"></div>'
                    });
                },
                showOrginalClick: function () {
                    if (this.$('.show-original').is(':checked')) {
                        this.$('.show-original').iCheck('uncheck');
                    } else {
                        this.$('.show-original').iCheck('check');
                    }
                    this.setiFrameSrc();
                },
                anonymousbtnClick: function () {
                    this.$('#camp-prev-select-contact').addClass('active');
                    var active_ws = $(".modal-body");
                    active_ws.find('.campaign-clickers').fadeOut('fast');
                    this.$('.annonymous-btn').removeClass('active');
                    this.$('#contact-name-prev').hide();
                    this.$('.contact-name').text('');
                    this.subNum = null;
                    this.setiFrameSrc();
                },
                dynamicRequest: function () {
                    this.bms_token = this.app.get('bms_token');
                    this.tempNum = this.options.tempNum;
                    if (this.options.prevFlag === 'T') {
                        this.url = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK=" + this.bms_token + "&type=email&templateNumber=" + this.tempNum;
                    }
                    else if (this.options.prevFlag === 'C') {
                        if (this.$('.show-original').is(':checked')) {
                            this.original = 'Y';
                        } else {
                            this.original = 'N';
                        }
                        var val = this.$('.selected').attr('id');
                        if (val === "prev-iframe-text" || (this.options.isText && this.options.isText == 'Y')) {
                            this.html = 'N';
                        } else {
                            this.html = 'Y';
                        }
                        this.url = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK=" + this.bms_token + "&type=email&campNum=" + this.tempNum + "&html=" + this.html + "&original=" + this.original;
                        if (this.subNum !== null) {
                            this.url += "&subNum=" + this.subNum;
                        }
                    }
                },
                removeContact: function () {
                    this.$el.parents('.modal-body').find('.contact-name').text('');
                    this.$('#camp-prev-select-contact').addClass('active');
                    var active_ws = $(".modal-body");
                    this.$('.annonymous-btn').removeClass('active');
                    active_ws.find('.campaign-clickers').fadeOut('fast');
                    this.$('#contact-name-prev').hide();
                    this.subNum = null;
                    this.setiFrameSrc();
                }
            });

        });

