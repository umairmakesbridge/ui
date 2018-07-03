define(['text!newcontacts/html/contact_notes.html', 'newcontacts/collections/notes', 'newcontacts/note_row'],
        function (template, notesCollection, noteRowView) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Notes View for Contacts
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                tagName: 'div',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .add-button': 'saveNote',                    
                    'click .mkb_notes-update': 'saveNote',
                    'click .mkb_notes-close':'cancelSave',
                    'click .notes_collapse':'expandCollapseNotes'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.page = this.options.sub;
                    this.app = this.page.app;
                    this.notesRequest = new notesCollection();
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function () {
                    this.$el.html(this.template({
                    }));
                    this.fetchNotes();

                },
                init: function () {

                },
                fetchNotes: function (fcount) {
                    var remove_cache = false;
                    this.$(".not-found").html("Loading...");
                    if (!fcount) {
                        remove_cache = true;
                        this.offset = 0;    
                        this.$('.note-ul-container').children().remove();
                    } else {
                        this.offset = this.offset + 50;
                    }
                    var _data = {order: "desc",orderBy:"updationTime",subNum:this.model.get("subNum"),offset:0};
                                       
                    if (this.notes_request) {
                        this.notes_request.abort();
                    }
                    
                    
                    this.notes_request = this.notesRequest.fetch({data: _data, remove: remove_cache,
                        success: _.bind(function (collection, response) {
                            // Display items
                            if (this.app.checkError(response)) {
                                return false;
                            }
                            //this.app.showLoading(false, this.$contactList);
                                                        
                            for (var s = this.offset; s < collection.length; s++) {
                                var rowView = new noteRowView({model: collection.at(s), sub: this});                                
                                this.$('.note-ul-container').append(rowView.$el);                                
                            }
                            
                            if(collection.length==0){
                                this.$(".not-found").show();                       
                                this.$(".not-found").html("No Note found.")
                            }
                            else{
                                this.$(".not-found").hide();  
                            }
                            if(this.$(".note-ul-container").height()>170){
                                this.$(".notes_collapse").removeClass("hide");
                            }
                           

                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                    // add into enqueueAjax Request
                    this.page.pPage.enqueueAjaxReq.push(this.notes_request);
                },
                saveNote: function(){
                    var URL ="/pms/io/subscriber/comments/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.model.get("subNum");
                    var notesText = $.trim(this.$("#note_textarea").val());
                    if(notesText){
                        this.$("#note_textarea").prop("disabled",true);
                        var _data = {type:"add",comments:notesText};
                        var note_id = this.$("#note_textarea").data("note_id");
                        if(note_id){
                            _data["type"] = "update";
                            _data["updatedComment"] = notesText;
                            _data["commentId"] = note_id;
                            delete _data["comments"];
                        }
                        $.post(URL, _data)
                        .done(_.bind(function (data) {
                            var _json = jQuery.parseJSON(data);

                            if (_json[0] !== "err") {
                               this.fetchNotes(); 
                               this.cancelSave();
                            } else {
                                this.app.showAlert(_json[1], $("body"));
                            }


                        },this));
                    }
                },
                cancelSave: function(){
                    this.$(".add-button").removeClass("hide");
                    this.$(".mkb_notes-close,.mkb_notes-update").addClass("hide");
                    this.$("#note_textarea").prop("disabled",false).val('').removeData("note_id");                               
                },
                expandCollapseNotes: function(e){
                    var handle = $(e.target)[0].tagName !== "DIV" ? $(e.target).parent(".notes_collapse") : $(e.target);
                    if (handle.hasClass('expand')) {
                        handle.find('span').eq(0).text('Click to collapse')
                        this.$('.notes_lists_wrap').addClass('heighAuto');
                    } else {
                        handle.find('span').eq(0).text('Click to expand')
                        this.$('.notes_lists_wrap').removeClass('heighAuto');
                    }
                    if (handle.hasClass('expand')) {
                        handle.removeClass('expand');
                        handle.addClass('collapse');
                    } else {
                        handle.removeClass('collapse');
                        handle.addClass('expand');
                    }
                }


            });
        });