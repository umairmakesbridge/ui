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
                    'click .contact-remove-prev': 'removeContact',
                    'click .turnon':'turnOnImages',
                    'click .switchView':'switchView',
                    'click .turnoff':'turnOffImages'
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
                    this.scrollactive = false;
                    this.render();
                },
                /**
                 * Initialize view .
                 */
                render: function () {

                    this.$el.html(this.template());
                    this.app = this.options.app;
                    this.loadCampaignData = this.options.loadCampaignData;
                    this.lpstatus = (this.options.lpStatus) ? this.options.lpStatus:"";
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                    if(this.loadCampaignData){
                        this.loadCampaign();
                    }
                    else{
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
                        /* Body Container*/
                        this.$el.parents('body').on("click",_.bind(function(){
                            this.$el.find('.deviceIcons span').addClass('hide');
                            this.$el.find('.deviceIcons span').removeClass('show');
                        },this))
                        // IFrame Loaded Successfully 
                        this.$el.parents('.modal').find('.modal-header #dialog-title').append('<div class="loading-wheel" style="display: inline-block;left: 0.1%;position: relative;top: 0;z-index: 111;"></div>');
                        if(typeof(this.options.prevFlag)!=="undefined" && this.lpstatus != "P"){
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
                    }
                    //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                attachEvents: function () {


                },
                switchView : function(ev){
                    var currentObj = ev.currentTarget;
                    var _this = this;
                    var templateWrapHeight = this.options.prevFlag=="LP" ? this.options.frameHeight : (_this.options.frameHeight - 180);
                    this.$el.find('.deviceIcons span').addClass('hide');
                    this.$el.find('.deviceIcons span').removeClass('show');
                    this.$el.find('.outerScroll').css('height',templateWrapHeight+'px');
                    if($(currentObj).attr('data-viewtype')=="tablet-preview"){
                        if($(currentObj).find('span').hasClass('hide')){
                           $(currentObj).find('span').addClass('show'); 
                           $(currentObj).find('span').removeClass('hide'); 
                        }else{
                           $(currentObj).find('span').addClass('hide'); 
                           $(currentObj).find('span').removeClass('show');
                        }
                        $(currentObj).find('.tablet-p').unbind('click');
                        $(currentObj).find('.tablet-ls').unbind('click');
                        $(currentObj).find('.tablet-p').click(function(e){
                            e.preventDefault();
                            _this.$el.find('.deviceIcons').removeClass('active');
                            $(e.currentTarget).parent().find('i').removeClass('active');
                            $(e.currentTarget).addClass('active');
                            $(currentObj).addClass('active');
                            _this.$el.find('.outerScroll').show();
                            _this.$el.find('#template-wrap-iframe').css('height',(templateWrapHeight)+'px');
                            _this.$el.find('#template-wrap-iframe iframe').attr('data-device','tablet');
                            _this.$el.find('#template-wrap-iframe iframe').attr('data-orientation','portrait');
                             _this.$el.find('.iframeWrapper').attr('data-viewtype','tablet');
                            _this.$el.find('.iframeWrapper').attr('data-orientation','portrait');
                            _this.$el.find('.inner').hide();
                            _this.$el.find('#template-wrap-iframe iframe').css({'top': '0px','position': 'relative','left': '0px','overflow': 'hidden','height':_this.$el.find('.device-display').height()+'px'});
                            _this.$el.find('#template-wrap-iframe iframe').contents().find('body').css('overflow-y','hidden');
                            _this.responsiveResizeIframe();
                            //_this.$el.find('.innerScroll').css('height',_this.$el.find('#template-wrap-iframe iframe').contents().find('body').height()+'px');
                            _this.$el.find('#template-wrap-iframe').addClass('chngBg-tm');
                            _this.$el.find('.deviceIcons span').addClass('hide');
                            _this.$el.find('.deviceIcons span').removeClass('show');
                            e.stopPropagation();
                        });
                        $(currentObj).find('.tablet-ls').click(function(e){
                            e.preventDefault();
                            _this.$el.find('.outerScroll').show();
                            _this.$el.find('.deviceIcons').removeClass('active');
                            $(e.currentTarget).parent().find('i').removeClass('active');
                            $(e.currentTarget).addClass('active');
                            $(currentObj).addClass('active');
                            _this.$el.find('#template-wrap-iframe,.outerScroll').css('height',(templateWrapHeight)+'px');
                            _this.$el.find('#template-wrap-iframe iframe').attr('data-device','tablet');
                            _this.$el.find('#template-wrap-iframe iframe').attr('data-orientation','landscape');
                            _this.$el.find('.iframeWrapper').attr('data-viewtype','tablet');
                            _this.$el.find('.iframeWrapper').attr('data-orientation','landscape');
                            //_this.$el.find('.inner').show();
                            _this.$el.find('#template-wrap-iframe iframe').css({'top': '0px','position': 'relative','left': '0px','overflow': 'hidden','height':_this.$el.find('.device-display').height()+'px'});
                             _this.$el.find('#template-wrap-iframe iframe').contents().find('body').css('overflow-y','hidden');
                            _this.$el.find('#template-wrap-iframe').addClass('chngBg-tm');
                            _this.responsiveResizeIframe();
                            _this.$el.find('.deviceIcons span').addClass('hide');
                            _this.$el.find('.deviceIcons span').removeClass('show');
                            e.stopPropagation();
                        });
                        
                    }else if($(currentObj).attr('data-viewtype')=="mobile-preview"){
                        if($(currentObj).find('span').hasClass('hide')){
                           $(currentObj).find('span').addClass('show'); 
                           $(currentObj).find('span').removeClass('hide'); 
                        }else{
                           $(currentObj).find('span').addClass('hide'); 
                           $(currentObj).find('span').removeClass('show');
                        }
                        $(currentObj).find('.mobile-p').unbind('click');
                        $(currentObj).find('.mobile-ls').unbind('click');
                        
                        $(currentObj).find('.mobile-p').click(function(e){
                            e.preventDefault();
                            _this.$el.find('.outerScroll').show();
                            _this.$el.find('.deviceIcons').removeClass('active');
                            $(e.currentTarget).parent().find('i').removeClass('active');
                            $(e.currentTarget).addClass('active');
                            $(currentObj).addClass('active');
                            _this.$el.find('#template-wrap-iframe').css('height',(templateWrapHeight)+'px');
                            _this.$el.find('#template-wrap-iframe iframe').attr('data-device','phone');
                            _this.$el.find('#template-wrap-iframe iframe').attr('data-orientation','portrait');
                            _this.$el.find('#template-wrap-iframe').addClass('chngBg-tm');
                             _this.$el.find('.inner').hide();
                            _this.responsiveResizeIframe({'type':'mobile'});
                            _this.$el.find('#template-wrap-iframe .iframeWrapper').attr('data-viewtype','phone');
                            _this.$el.find('#template-wrap-iframe .iframeWrapper').attr('data-orientation','portrait');
                            _this.$el.find('#template-wrap-iframe iframe').css({'top':0,'left':0,'overflow': 'hidden','height':_this.$el.find('.iframeWrapper').outerHeight()+'px'});
                            _this.$el.find('#template-wrap-iframe iframe').contents().find('body').css('overflow-y','hidden');
                            _this.$el.find('.deviceIcons span').addClass('hide');
                            _this.$el.find('.deviceIcons span').removeClass('show');
                            e.stopPropagation();
                        });
                        
                        $(currentObj).find('.mobile-ls').click(function(e){
                            e.preventDefault();
                            _this.$el.find('.outerScroll').show();
                            _this.$el.find('.deviceIcons').removeClass('active');
                            $(e.currentTarget).parent().find('i').removeClass('active');
                            $(e.currentTarget).addClass('active');
                            $(currentObj).addClass('active');
                             _this.$el.find('.inner').hide();
                            _this.$el.find('#template-wrap-iframe').css('height',(templateWrapHeight)+'px');
                            _this.$el.find('#template-wrap-iframe iframe').attr('data-device','phone');
                            _this.$el.find('#template-wrap-iframe iframe,#template-wrap-iframe .iframeWrapper').attr('data-orientation','landscape');
                            _this.$el.find('#template-wrap-iframe .iframeWrapper').attr('data-viewtype','phone');
                            _this.$el.find('#template-wrap-iframe').addClass('chngBg-tm');
                            _this.$el.find('#template-wrap-iframe iframe').contents().find('body').css('overflow-y','hidden');
                            _this.responsiveResizeIframe({'type':'mobile'}); 
                            _this.$el.find('.deviceIcons span').addClass('hide');
                            _this.$el.find('.deviceIcons span').removeClass('show');
                            e.stopPropagation();
                        });
                    }else{
                        this.$el.find('.deviceIcons').removeClass('active');
                        $(currentObj).addClass('active');
                        this.$el.find('.switchView i').removeClass('active');
                        this.$el.find('.outerScroll').hide();
                        this.$el.find('.inner').hide();
                        this.$el.find('#template-wrap-iframe iframe').removeAttr('data-device');
                        this.$el.find('#template-wrap-iframe iframe').removeAttr('data-orientation');
                        this.$el.find('#template-wrap-iframe .iframeWrapper').removeAttr('data-viewtype');
                        this.$el.find('#template-wrap-iframe .iframeWrapper').removeAttr('data-orientation');
                        this.$el.find('#template-wrap-iframe').removeClass('chngBg-tm');
                        this.$el.find('#template-wrap-iframe').css('overflow-y','scroll');
                        var $this = this;
                        setTimeout(function(){
                            $this.$el.find('#template-wrap-iframe iframe').css('height',_this.$el.find('#template-wrap-iframe iframe').contents().find('body').height()+'px'); 
                        },1500);
                    } 
                    ev.stopPropagation();
                },
                responsiveResizeIframe : function(object){
                    var _this = this;
                    var $obj = object?object : "";
                    _this.$el.parents('.modal-body').css('overflow','hidden');
                    setTimeout(function(){
                                if(_this.$el.find('#template-wrap-iframe iframe').contents().find('body').height() < 120){
                                    _this.$el.find('#template-wrap-iframe iframe').css('height',(_this.options.frameHeight - 200)+'px'); 
                                }
                                if($obj.type=="mobile"){
                                    _this.$el.find('.innerScroll').css('height',_this.$el.find('#template-wrap-iframe iframe').contents().find('body').height() +'px');
                                }else{
                                    _this.$el.find('.innerScroll').css('height',(_this.$el.find('#template-wrap-iframe iframe').contents().find('body').height()- (244+50)) +'px');
                                }
                            },1500);
                    if(!this.scrollactive){
                       this.$el.find('.outerScroll').scroll(function(){
                        _this.$el.find('#template-wrap-iframe iframe').contents().scrollTop($(this).scrollTop());
                       })  
                       this.scrollactive = true;
                    }else{
                        this.$el.find('.outerScroll').scrollTop(0);
                    }
                           
                },
                showFrame: function () { // Show Iframe on default load
                    if (this.options.prevFlag === 'C') {
                        this.setiFrameSrc();
                        //console.log('Hit Iframe');
                        // REMOTE Communication 
                    
                    
                        
                    }else if(this.options.prevFlag=== 'LP'){
                        this.loadPrevForLP();
                    }else {
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
                            this.$el.parents('.modal').find('.contacts-switch').show();
                            this.$el.parents('.modal').find('.contacts-switch-2').show();
                        }
                        else {
                            this.html = 'N';
                            setTimeout(_.bind(function(){
                                this.$el.parents('.modal').find('.modal-header #dialog-title .loading-wheel').hide();
                            },this),2000);
                            this.$el.parents('.modal').find('.contacts-switch').hide();
                            this.$el.parents('.modal').find('.contacts-switch-2').hide();
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
                    else if (this.options.prevFlag === 'T' || this.options.prevFlag === 'E'){
                        newFrameheight = this.options.frameHeight - 50;
                    }
                    else {
                        newFrameheight = this.options.frameHeight;
                    }
                    if(this.options.frameSrc=="about:blank"){
                        this.$('#email-template-iframe').css('height', newFrameheight);    
                    }
                    else{
                        this.$('#email-template-iframe').remove();
                        if(!this.transport){
                          var _this = this;
                          this.transport = new easyXDM.Socket({
                                        remote: frame,
                                        onReady: function () {
                                           
                                        },
                                        onMessage: _.bind(function (message, origin) {
                                            var response = jQuery.parseJSON(message);
                                             _this.$el.parents('.modal').find('.modal-header #dialog-title .loading-wheel').hide();  
                                            console.log(message);

                                        }, this),
                                        props: {style: {width: "100%", height: (newFrameheight-15) + "px"}, frameborder: 0},
                                        container: this.$el.find('#template-wrap-iframe .iframeWrapper')[0]
                                    });  
                                    
                                    
                                    
                        }
                        
                    
                        //this.$('#email-template-iframe').attr('src', frame).css('height', newFrameheight);
                    }
                    
                },
                loadPrevForLP : function(){
                    this.$('#email-template-iframe').remove();
                    if(!this.transport){
                          var _this = this;
                          this.transport = new easyXDM.Socket({
                                        remote: this.options.frameSrc,
                                        onReady: function () {
                                           
                                        },
                                        onMessage: _.bind(function (message, origin) {
                                            var response = jQuery.parseJSON(message);
                                             _this.$el.parents('.modal').find('.modal-header #dialog-title .loading-wheel').hide();  
                                            console.log(message)

                                        }, this),
                                        props: {style: {width: "100%", height: this.options.frameHeight + "px"}, frameborder: 0},
                                        container: this.$el.find('#template-wrap-iframe .iframeWrapper')[0]
                                    });  
                        }
                },
                loadPrevTemplates: function () {
                    this.$('.previewbtns').hide();
                    if (this.options.prevFlag === 'T' || this.options.prevFlag === 'E') {                        
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
                        if(this.options.postParams){
                            post_val = this.options.postParams;
                            post_val["toEmails"] = this.$('#prev-email').val();
                        }
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
                        this.$('#prev-email').parent().append('<span class="errortext"><i class="erroricon"></i><em>' + "Please enter correct email address format" + '</em></span>');
                    }

                },
                loadContact: function (ev) {                    
                    var active_ws = $(".modal-body");
                    active_ws.find('.campaign-clickers').remove();                    
                    active_ws.find('#camp-prev-contact-search').append(new contactsView({page: this, searchCss: '360px', contactHeight: '274px', hideCross: true, isCamPreview: true, placeholderText: 'Search for a contact to use for testing merge tag values'}).el)
                    active_ws.find('#prev-closebtn').css({'top': '18px'});                    
                    return;
                },
                htmlTextClick: function (ev) {
                    var tabID = ev.currentTarget.id;
                    this.$('.prev-iframe-campaign').removeClass('selected');
                    this.$('#' + tabID).addClass('selected');
                    this.transport.destroy();
                    this.transport="";
                    this.$el.parents('.modal').find('.modal-header #dialog-title .loading-wheel').show();
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
                    if (this.options.prevFlag === 'E') {
                        this.url = "/pms/io/subscriber/saveSingleEmailData/?BMS_REQ_TK=" + this.bms_token + "&&msgId=" + this.tempNum;                        
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
                }, loadCampaign: function() {
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.options.tempNum + "&type=basic";                   
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {                        	
                        var camp_json = jQuery.parseJSON(xhr.responseText);
                        this.options.isText = camp_json.isTextOnly;
                        this.loadCampaignData = false;
                        this.init();
                    }, this));
                },
                turnOnImages : function(){
                    console.log('turnOnImages called');
                    this.$el.find('.status_tgl a').removeClass('active');
                    this.$el.find('.turnon').addClass('active');
                    this.transport.postMessage("{\"isImage\":\"on\"}");      
                },
                turnOffImages : function(){
                    console.log('turnOffImages called');
                    this.$el.find('.status_tgl a').removeClass('active');
                    this.$el.find('.turnoff').addClass('active');
                    this.transport.postMessage("{\"isImage\":\"off\"}"); 
                }
            });

        });

