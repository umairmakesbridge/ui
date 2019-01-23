define(['text!crm/salesloft/html/import.html','jquery.icheck','bms-addbox'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                
                className:'cont-box row-fluid',
                events: {

                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	                                        
                    this.render();                            
                },

                render: function () {
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.$el.html(this.template({}));      	                    
                    this.$el.css({"position":"static","margin":"0px"});
                    this.initControl();   
                    
                },
                initControl:function(){
                    this.$("#import_time").chosen({no_results_text: 'Oops, nothing found!', width: "100%"});
                    this.$('input.checkinput').iCheck({
                        checkboxClass: 'checkinput'
                    });
                    this.filllistsdropdown();
                    this.$(".add-list").addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)}); 
                    this.$(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    //this.setUpSalesforceFields();                                                                                     
                },
                filllistsdropdown: function () {
                    var list_array = '';
                    var list_html = "";                    
                    var app = this.app;
                    var curview = this;
                    curview.$el.find('#existing_lists').prop('disabled', true)
                    var URL = "/pms/io/list/getListData/?BMS_REQ_TK=" + app.get('bms_token') + "&type=all";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {                                                                                    
                            list_array = jQuery.parseJSON(xhr.responseText);
                            if (list_array != '')
                            {
                                var $i = 0;
                                list_html +="<option value='' ></option>";
                                $.each(list_array.lists[0], function (index, val) {
                                    /*=========
                                     * Check if Supress List to be show
                                     * ========*/                                    
                                    if (val[0].isSupressList == "false" && val[0].isBounceSupressList == "false") {
                                        list_html += "<option value='" + val[0]["listNumber.encode"] + "' data-checksum='" + val[0]["listNumber.checksum"] + "'>" + val[0].name + "</option>";
                                    } else {
                                        $i++; // count total supress list
                                    }                                    
                                });
                                var total_count = parseInt(list_array.count);                                
                                if (total_count != 0) {
                                    curview.$el.find("#existing_lists").html(list_html);
                                    curview.$el.find('#existing_lists option[data-checksum="' + curview.listChecksum + '"]').prop('selected', true).trigger("chosen:updated")
                                    curview.$el.find('#existing_lists').prop('disabled', false).trigger("chosen:updated");
                                } else {
                                    curview.$el.find('#existing_lists').prop('disabled', true).trigger("chosen:updated");
                                }
                                

                            }
                            app.setAppData('lists', list_array);
                            curview.$el.find("#existing_lists").chosen({no_results_text: 'Oops, nothing found!'});
                        }
                    }).fail(function () {
                        console.log("error lists listing");
                    });

                },
                addlist:function(listName,ele){                    
                    if(this.checkListName(listName)){
                        this.app.showAlert("List already exists with same name",$("body"),{fixed:true});
                        return false;
                    }
                    if (listName.toLowerCase().indexOf("supress_list_") >= 0){
                        this.app.showAlert("List name with word supress_list_ not allowed",$("body"),{fixed:true});
                        return false;
                    }
                    var add_box = this.$(".add-list").data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    var URL = "/pms/io/list/saveListData/";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),type:"create",listName:listName};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        add_box.dialog.find(".btn-add").removeClass("saving");
                        add_box.dialog.find(".input-field").val("");
                        add_box.hideBox();                        
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                            this.app.removeCache("lists");
                                                        
                        }
                        else{
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                    },this));
                }
        });
});