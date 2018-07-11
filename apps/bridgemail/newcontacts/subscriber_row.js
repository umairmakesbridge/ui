define(['text!newcontacts/html/subscriber_row.html', 'newcontacts/subscriber_col'],
        function (template, subscriberColView) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Subscriber Record View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                tagName: 'li',
                className: 'contact-li',
                /**
                 * Attach events on elements in view.
                 */
                events: {                    
                    'click .contact-row': 'showContact',
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.tmPr = '';
                    this.dialogStyles = {};
                    this.render();
//                    this.model.on('change', this.renderRow, this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        model: this.model,                        
                        contact_name: this.getContactName(),                        
                    }));
                    this.initControls();
                },
                /**
                 * Render Row view on page.
                 */
                renderRow: function () {
                    //console.log('Change Occured');
                    this.render();
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                    

                },
                getActivityDate: function (_date) {
                    if (_date) {
                        var date_time = this.app.decodeHTML(_date);
                        date_time = date_time.split(" ")[0];
                        var _date = date_time.split("-");
                        return _date[2] + " " + this.app.getMMM(parseInt(_date[1]) - 1) + ", " + _date[0];
                    }
                    else {
                        return "";
                    }
                },
                getContactName: function () {
                    var fName = this.model.get("firstName");
                    var lName = this.model.get("lastName");
                    var full_name = this.app.decodeHTML(fName) + ' ' + this.app.decodeHTML(lName);
                    if (!fName && !lName) {
                        full_name = this.app.decodeHTML(this.model.get("email"));
                    }
                    return full_name;
                },
                getFirstAlphabet: function (json) {
                    var fName = this.model.get("firstName");
                    var lName = this.model.get("lastName");
                    var email = this.model.get("email");
                    var firstAlpha = '';
                    if (fName) {
                        firstAlpha = this.app.decodeHTML(fName);
                    } else if (lName) {
                        firstAlpha = this.app.decodeHTML(lName);
                    } else {
                        firstAlpha = this.app.decodeHTML(email);
                    }
                    //return firstAlpha.charAt(0);
                    this.$('.contact-firstAlphabet').find('.letter_block').addClass('l_' + firstAlpha.charAt(0).toLowerCase());
                    this.$('.contact-firstAlphabet').find('span').html(firstAlpha.charAt(0));
                },
                showContact: function(obj){                    
                    var liRow = this.$(".contact-row");
                    if(!liRow.hasClass("selected-contact")){
                        var selected_contact = this.sub.$("ul.contact-list div.selected-contact");
                        selected_contact.removeClass("selected-contact");
                        liRow.addClass("selected-contact");
                        this.sub.closeCallBack();
                        var subView = new subscriberColView({sub: this, model: this.model, parentPage: this.sub});
                        this.sub.$(".contact-detail-area").html(subView.$el);
                        subView.init();
                                             
                    }
                }
            });
        });