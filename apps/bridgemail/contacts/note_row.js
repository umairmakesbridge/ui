define(['text!contacts/html/note_row.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Note View to show in Notes area
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                tagName: 'li',
                className: '_mks_item',
                /**
                 * Attach events on elements in view.
                 */
                events: {                    
                    'click .mks-notestDel-wrap':'deleteNoteConfirm',
                    'click .mks-notestEdit-wrap':'editModeNote'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    
                    this.render();
//                    this.model.on('change', this.renderRow, this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {

                    this.$el.html(this.template({
                        
                    }));
                    this.initControls();
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                    

                },
                getDateTimeStamp: function(){
                    var _date = moment(this.app.decodeHTML(this.model.get("updationDate")),'YYYY-M-D H:m');                    
                    var format = {date: _date.format("DD MMM YYYY"), time: _date.format("hh:mm A")};
                    return format.time+', '+format.date;
                },
                getUserName: function(){
                    var user = (this.model.get("commentAddedBy") == this.app.get("user").userId) ? "You" : this.model.get("userId");
                    return user;
                },
                deleteNoteConfirm: function(){
                    this.app.showAlertDetail({heading: 'Confirm Deletion',
                        detail: "Are you sure you want to delete?",
                        callback: _.bind(function () {
                            this.deleteNote();
                        }, this)},
                    $('body'));
                },
                deleteNote: function(){
                     var URL ="/pms/io/subscriber/comments/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.sub.model.get("subNum");
                     $.post(URL, {type:"delete",commentIds:this.model.get("commentId.encode")})
                    .done(_.bind(function (data) {
                        var _json = jQuery.parseJSON(data);

                        if (_json[0] !== "err") {
                           this.sub.fetchNotes(); 
                           this.sub.$("#note_textarea").prop("disabled",false);
                           this.sub.$("#note_textarea").val('');
                        } else {
                            this.app.showAlert(_json[1], $("body"));
                        }


                    },this));
                },
                editModeNote: function(){
                    this.sub.$("#note_textarea").val(this.app.decodeHTML(this.model.get("comment"),true));                    
                    this.sub.$(".add-button").addClass("hide");
                    this.sub.$(".mkb_notes-close,.mkb_notes-update").removeClass("hide");
                    this.sub.$("#note_textarea").data("note_id",this.model.get("commentId.encode")).focus();
                }
            });
        });