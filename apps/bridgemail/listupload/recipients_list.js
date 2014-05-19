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
               "keyup #lists_search":"search",
               "click  #clearsearch":"clearSearch",
               "click .closebtn":"closeContactsListing"
            },
            initialize: function () {
                this.template = _.template(template);				
                this.request = null;
                this.app = app;
                this.active_ws = "";
                this.total_fetch  = 0;
                this.total = 0;
                this.offsetLength = 0;
                this.render();
            },
            render:function (search) {
                this.$el.html(this.template({}));
                this.loadLists();
                this.$(".add-list").addbox({app:this.app,placeholder_text:'Enter new list name',addCallBack:_.bind(this.addlist,this)});                     
                this.$(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.active_ws = this.$el.parents(".ws-content");
                $(window).scroll(_.bind(this.liveLoading,this));
                $(window).resize(_.bind(this.liveLoading,this));
            },
            loadLists:function(fcount){
                    var _data = {};
                    
                     if(!fcount){
                        this.offset = 0;
                        this.total_fetch = 0;
                        this.$el.find('#list_grid tbody').empty();
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
                       //that.showSearchFilters(this.searchText);
                       
                    }
                    
                 var that = this; // internal access
                 this.$el.find('#list_grid tbody .load-tr').remove();
                 this.$el.find('#list_grid tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:10px;padding-left:43%;'>No lists founds!</div><div class='loading-list' style='margin-top:50px'></div></td></tr>");
                 this.app.showLoading("&nbsp;",this.$el.find('#list_grid tbody').find('.loading-list'));
                
                _data['type'] = 'batches';
                this.objRecipients = new recipientsCollection();
                
                this.request = this.objRecipients.fetch({data:_data,success:function(data){
                    _.each(data.models, function(model){
                        that.$el.find('#list_grid tbody').append(new recipientView({model:model,app:app}).el);
                     });
                      if(that.searchText){
                       that.showSearchFilters(that.searchText,that.objRecipients.total);
                      }else{
                          that.$("#total_lists span").html("List(s) found");
                          that.$("#total_lists .badge").html(that.objRecipients.total);
                      }
                     
                     that.offsetLength = data.length;
                     that.total_fetch = that.total_fetch + data.length;                         
                         
                    if(data.models.length == 0) {
                       that.$el.find('.no-contacts').show();
                       that.$el.find('#list_grid tbody').find('.loading-list').remove();
                    }else{
                       $('#list_grid tbody').find('.loading-list').remove();
                        that.$el.find('#list_grid tbody #loading-tr').remove();
                     }
                 
                    if(that.total_fetch < parseInt(that.objRecipients.total)){
                             that.$el.find("#list_grid tbody tr:last").attr("data-load","true");
                    } 
                     that.$el.find('#list_grid tbody').find('.tag').on('click',function(){
                        var html = $(this).html();
                        that.searchText = $.trim(html);
                        that.$el.find("#lists_search").val(that.searchText); 
                        that.$el.find('#clearsearch').show();
 
                        that.loadLists();
                    });
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
                   this.$("#total_lists span").html("List(s) found");
                   this.loadLists();
           },
           showSearchFilters:function(text,total){
              this.$("#total_lists .badge").html(total);
               this.$("#total_lists span").html(" List(s) found for <b>\""+text+"\"</b> ");
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
                },
                
             closeContactsListing:function(){
                
                 $("#div_pageviews").empty('');
                 $("#div_pageviews").hide();
            } ,liveLoading:function(where){
                var $w = $(window);
                var th = 200;
                 
                var inview =this.$el.find('table tbody tr:last').filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                    this.loadLists(this.offsetLength);
                }  
            }
            
        });    
});