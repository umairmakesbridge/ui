/* 
 * Module Name : Recipients Lists
 * Author: Pir Abdul Wakeel
 * Date Created: 05 May 2014
 * Description: this view is called from contacts/recipients, so changing this may cause problem in recipients list.
 * 
 **/

define(['text!listupload/html/recipients_list.html','listupload/collections/recipients_lists','listupload/views/recipient_list','listupload/models/recipient_list','app','bms-addbox'],
function (template,recipientsCollection,recipientView,listModel,app,addBox) {
        'use strict';
        return Backbone.View.extend({
            className: 'recipients_lists',
            events: {
               "keyup .search-control":"search",
               "click  #clearsearch":"clearSearch",
            },
            initialize: function () {
                this.template = _.template(template);				
                this.request = null;
                this.app = app;
                this.render();
            },
            render:function (search) {
                this.$el.html(this.template({}));
                this.loadLists();
                this.$(".add-list").addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)});                     
                this.$(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            loadLists:function(fcount){
                    var _data = {};
                     if(!fcount){
                        this.offset = 0;
                    }
                    else{
                      this.offset = this.offset + this.offsetLength;
                  }
                  if(this.request)
                    this.request.abort();
                   var that = this;
                  _data['offset'] = this.offset;
                    if(this.searchText){
                      _data['searchText'] = this.searchText;
                       that.showSearchFilters(this.searchText);
                    }
                 var that = this; // internal access
                _data['type'] = 'all';
                this.objRecipients = new recipientsCollection();
                this.app.showLoading('Loading Lists...', this.el);
                this.request = this.objRecipients.fetch({data:_data,success:function(data){
                    _.each(data.models, function(model){
                        that.$el.find('#list_grid tbody').append(new recipientView({model:model,app:app}).el);
                     });
                     that.$("#total_lists .badge").html(that.objRecipients.total);
                     that.app.showLoading(false, that.el);
                }});
             },
            search:function(ev){
              this.searchText = '';
              this.searchTags = '';
              var that = this;
              var code = ev.keyCode ? ev.keyCode : ev.which;
              var nonKey =[17, 40 , 38 , 37 , 39 , 16];
              if ((ev.ctrlKey==true)&& (code == '65' || code == '97')) {
                    return;
              }
              if($.inArray(code, nonKey)!==-1) return;
               var text = $(ev.target).val();
               text = text.replace('Sale Status:', '');
               text = text.replace('Tag:', '');
                
                   
               if (code == 13 || code == 8){
                 that.$el.find('#clearsearch').show();
                
                 this.searchText = text;
                 that.loadLists();
               }else if(code == 8 || code == 46){
                    
                   if(!text){
                    that.$el.find('#clearsearch').hide();
                    this.searchText = text;
                    that.loadLists();
                   }
               }else{ 
                     that.$el.find('#clearsearch').show();
                     
                     clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                     that.timer = setTimeout(function() { // assign timer a new timeout 
                         if (text.length < 2) return;
                         that.searchText = text;
                         that.loadLists();
                    }, 500); // 2000ms delay, tweak for faster/slower
               }
            }, clearSearch:function(ev){
                   $(ev.target).hide();
                   $(".search-control").val('');
                   this.total = 0;
                   this.searchText = '';
                   this.searchTags = '';
                   this.total_fetch = 0; 
                   this.$("#total_lists .badge").html("lists found");
                   this.loadLists();
           },
           showSearchFilters:function(text){
              this.$("#total_lists .badge").html("lists found for \""+text+"\" ");
               
           },
            checkListName:function(listName){
                var isListExists = false;
                var that = this;
                var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&name="+listName+"&type=exists";
                jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(that.app.checkError(data)){
                            return false;
                        }
                        if(data.exists == "Y"){ isListExists = true;}else{ isListExists = false;}
                    });
                    return isListExists;
                },
            addlist:function(listName,ele){                    
                    if(this.checkListName(listName)){
                        this.app.showAlert("List already exists with same name",$("body"),{fixed:true});
                        return false;
                    }
                    var that = this;
                    var add_box = this.$(".add-list").data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    var URL = "/pms/io/list/saveListData/";
                    var post_data = {BMS_REQ_TK:that.app.get('bms_token'),type:"create",listName:listName};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        add_box.dialog.find(".btn-add").removeClass("saving");
                        add_box.dialog.find(".input-field").val("");
                        add_box.hideBox();
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                            app.removeCache("lists");
                            //this.getLists();
                            this.newList = _json[1];
                            var newModel = new listModel({
                                campaignSentCount:0,
                                "listNumber.encode": that.newList,
                                name:listName,
                                subscriberCount:0,
                                tags:''});
                            that.objRecipients.add(newModel);
                             var last_model = that.objRecipients.last();
                            that.$el.find('#list_grid tbody').prepend(new recipientView({model:last_model,app:app}).el);
                            that.$el.find("#list_grid tbody tr:first").slideDown("slow");
                        }
                        else{
                            that.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                    },this));
                }
            
        });    
});