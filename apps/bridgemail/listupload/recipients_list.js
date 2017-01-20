/* 
 * Module Name: Recipients Lists
 * Author:Pir Abdul Wakeel
 * Date Created:05 May 2014
 * Description:this view is called from contacts/recipients, so changing this may cause problem in recipients list.
 **/

define(['text!listupload/html/recipients_list.html','listupload/collections/recipients_lists','listupload/views/recipient_list','listupload/models/recipient_list','app','contacts/multipleadd'],
function (template,recipientsCollection,recipientView,listModel,app,addContactView) {
        'use strict';
        return Backbone.View.extend({
            className: 'recipients_lists',
            events: {
               "keyup #lists_search":"search",
               "click  #clearsearch":"clearSearch",
               "click .closebtn":"closeContactsListing",
               'click .add-list,.create_new': "createList",
               "click .refresh_btn":function(){
                   this.loadLists();
                   this.app.addSpinner(this.$el);
               },
               "click .sortoption_expand": "toggleSortOption",
               "click .stattype": "fitlerLists"
            },
            initialize: function () {
                this.template = _.template(template);				
                this.request = null;
                this.app = app;
                this.active_ws = "";
                this.total_fetch  = 0;
                this.total = 0;
                this.offsetLength = 0;
                this.type = "batches";
                this.listChecksum = '';
                this.addContactView =null;
                this.status = "A";
                this.render();
            },
            render:function (search) {
                this.$el.html(this.template({}));
                this.loadLists();                
                //this.$(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
                this.active_ws = this.$el.parents(".ws-content");
                $(window).scroll(_.bind(this.liveLoading,this));
                $(window).resize(_.bind(this.liveLoading,this));
                //console.log(this.options);
                if(typeof this.options.params.listName !="undefined"){
                    this.searchText = this.options.params.listName;
                    this.loadLists();
                }
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
                    }
                    
                 var that = this; // internal access
                 this.$el.find('#list_grid tbody .load-tr').remove();
                 this.$el.find('#list_grid tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:10px;padding-left:43%;'>No lists founds!</div><div class='loading-list' style='margin-top:50px'></div></td></tr>");
                 this.app.showLoading("&nbsp;",this.$el.find('#list_grid tbody').find('.loading-list'));
                
                _data['type'] = this.type;//'batches';
                this.objRecipients = new recipientsCollection();
                
                this.request = this.objRecipients.fetch({data:_data,success:function(data){
                    _.each(data.models, function(model){
                        that.$el.find('#list_grid tbody').append(new recipientView({model:model,app:app,parent:that}).el);
                     });
                      /*-----Remove loading------*/
                        that.app.removeSpinner(that.$el);
                    /*------------*/
                      if(that.searchText){
                       that.showSearchFilters(that.searchText,that.objRecipients.total);
                      }else{
                          that.$("#total_lists span").html(that.totalLabel());
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
                   this.$("#total_lists span").html(this.totalLabel());
                   this.loadLists();
           },
           showSearchFilters:function(text,total){
              this.$("#total_lists .badge").html(total);
               this.$("#total_lists span").html(this.totalLabel() + " for <b>\""+text+"\"</b> ");
           },
           
            createList : function(){
                 var camp_obj = this;
                 this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Create a new List',
                      buttnText: 'Create',
                      bgClass :'lists-tilt',
                      plHolderText : 'Enter list name here',
                      emptyError : 'Enter list name',
                      createURL : '/pms/io/list/saveListData/',
                      fieldKey : "listName",
                      postData : {type:'create',BMS_REQ_TK:this.app.get('bms_token')},
                      saveCallBack :  _.bind(this.addlist,this) // Calling same view for refresh headBadge
                    });
                  
                
            },
            addlist : function(fieldText, _json){
               
                this.newList = _json[1];
                this.listChecksum = _json[2]
                this.appendlist(fieldText);
            },
            appendlist:function(listName,ele){                    
                            this.confirmationDialog(listName);
                            var newModel = new listModel({
                                campaignSentCount:0,
                                "listNumber.encode": this.newList,
                                name:listName,
                                subscriberCount:0,
                                tags:''});
                            this.objRecipients.add(newModel);
                             var last_model = this.objRecipients.last();
                            
                            this.$el.find('#list_grid tbody').prepend(new recipientView({model:last_model,app:app,parent:this}).el);
                            this.$el.find("#list_grid tbody tr:first").slideDown("slow"); 
                },
                
             closeContactsListing:function(){
                 $("#div_listviews").empty('');
                 $("#div_listviews").hide();
             } 
            ,liveLoading:function(where){
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
            },
            confirmationDialog:function(listName){
                 this.$el.parents('body').append('<div class="overlay sch-overlay"><div class="reschedule-dialog-wrap modal-body"></div></div>');
                 this.$el.parents('body').find('.reschedule-dialog-wrap').css({'margin-left': '-190px', 'margin-top': '-223px', 'max-height': '455px','height':'170px','width':'420px'});
                var appendHtml = '<div class="schedule-panel" id="contacts-caddDialog" style="height:110px"><h3>Add Contacts to List</h3><a class="closebtn" style="display:none;"></a><p style="padding-top: 8px;text-align:left;" class="note sch-note">Do you want to add contact to list ‘'+listName+'’ ?</p><p class="note sch-note"style="text-align:left;"> Press ‘Yes’ to add contacts to your new list.</p><div class="clearfix"></div><div class="btns right"><a class="btn-green btn-run"><span>&nbsp;&nbsp;&nbsp;Yes&nbsp;</span><i class="icon next"></i></a><a class="btn-gray btn-cancel closebtn-2"><span>&nbsp;&nbsp;&nbsp;No&nbsp;&nbsp;</span><i class="icon cross"></i></a></div></div>';
                this.$el.parents('body').find('.reschedule-dialog-wrap').append(appendHtml);
                
                this.$el.parents('body').find('#contacts-caddDialog .btn-run').click(_.bind(function(){
                    this.$el.parents('body').find('.sch-overlay').remove();
                    $("body #new_autobot").remove();
                   $("body .autobots-modal-in").remove();
                   $('body').append('<div class="modal-backdrop  in autobots-modal-in"></div>');
                   $("body").append("<div id='new_autobot' style='width: 710px;  top: 120px;left:50%' class='modal in'><div class='modal-body' style='min-height: 300px;'></div></div>");
                   $("body #new_autobot").css("margin-left","-"+$("#new_autobot").width() / 2+"px");
                   this.app.showLoading("Loading....",$("body #new_autobot .modal-body"));
                   this.addContactView = new addContactView({ sub:this ,app:this.app,listobj:{newList:this.newList,listName:listName,listChecksum:this.listChecksum}}); 
                  // var addContactView = new addContactView({ sub:this ,app:this.app});  
                   $("body #new_autobot").html(this.addContactView.el);
                },this));
                this.$el.parents('body').find('#contacts-caddDialog .closebtn-2,#contacts-caddDialog .closebtn').click(_.bind(function(){
                    this.$el.parents('body').find('.sch-overlay').remove();
                },this))
            },
            toggleSortOption: function (ev) {
                $(this.el).find("#template_search_menu").slideToggle();
                ev.stopPropagation();
            },
            fitlerLists: function(obj){                               
                var target = $.getObj(obj, "a");
                var prevStatus = this.searchTxt;
                if (target.parent().hasClass('active')) {
                    return false;
                }
                this.$('.stattype').parent().removeClass('active');
                target.parent().addClass('active');
                var html = target.clone();
                $(this.el).find(".sortoption_expand").find('.spntext').html(html.html());                               

                var type = target.attr("search");
                if (!type){
                    type = this.$('#template_search_menu li.active a').attr('search');
                }
                this.status = type;                                    
                if (this.status !== prevStatus) {
                    this.$el.find('#lists-search').val('');
                    this.$el.find('#clearsearch').hide();
                     if (type == "SS") {
                         this.type = 'sharedList';                                
                     } else if (type == "F") { 
                         this.type = 'myAllSharedList';                                
                     } else {
                         this.type = 'batches';                                
                     }
                    this.searchTxt = '';
                }
                this.total_fetch = 0;
                this.loadLists();
            
        },
        totalLabel: function(){
            var label = "List(s) found";
            if (this.status == "SS") {
               label = 'Shared list(s) found';                                
            } else if (this.status == "F") { 
                label= 'My shared list(s) found';                                
            } else {
                label = 'List(s) found';                                
            }
            return label;
        }
            
        });    
});