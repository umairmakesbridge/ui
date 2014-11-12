define(['text!listupload/html/newlist.html'],
        function(template) {
            'use strict';
            return Backbone.View.extend({
                className: 'new-list-view',
                events: {
                    "keyup #list_name": function(e)
                    {
                        if (e.keyCode == 13) {
                            this.addList();
                        }
                    }
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.render();
                    this.newtardialog = this.options.newtardialog;
                    var app = this.options.app;
                    app.showLoading(false, this.newtardialog.getBody());
                },
                render: function() {
                    this.app = this.options.app;
                    this.curview = this;
                    this.page = this.options.camp;
                    this.$el.html(this.template({}));
                    this.$el.find('#list_name').focus();
                },
               addlist:function(){    
                    var listName = this.$('#list_name').val();
                    this.$el.parents('.modal').find('.btn-blue').addClass('saveing-blue');
                    var URL = "/pms/io/list/saveListData/";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"create",listName:listName};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                           this.app.removeCache("lists");
                            //this.getLists();
                            this.page.newList = _json[1];
                            this.newtardialog.hide();
                            this.page.appendlist(listName);
                        }
                        else{
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                            this.newtardialog.hide();
                        }
                    },this));
                },
            });
        });