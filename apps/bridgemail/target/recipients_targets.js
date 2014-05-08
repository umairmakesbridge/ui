/* 
 * Module Name : Recipients Targets
 * Author: Pir Abdul Wakeel
 * Date Created: 05 May 2014
 * Description: targets are used to filter out contacts using rules ...
& to send campaign on these filtered contacts
you can view target wizard dialog in CampWiz @ Step3
 for listing page they are same ... targets are kind of list with rules to it.
 * 
 **/

define(['text!target/html/recipients_targets.html','target/collections/recipients_targets','target/views/recipients_target','app','bms-addbox'],
function (template,TargetsCollection,TargetView,app,addBox) {
        'use strict';
        return Backbone.View.extend({
            events: {
               "keyup .search-control":"search",
               "click  #clearsearch":"clearSearch",
               'click .create-target':"createTarget"
            },
            initialize: function () {
                this.template = _.template(template);				
                this.request = null;
                this.app = app;
                this.render();
            },
            render: function (search) {
                this.$el.html(this.template({}));
                this.loadTargets();
                //this.$(".add-list").addbox({app:this.app,placeholder_text:'Enter new target name',addCallBack:_.bind(this.addlist,this)});                     
                //this.$(".add-list").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            loadTargets:function(fcount){
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
                _data['type'] = 'list';
                _data['filterFor'] = 'C';
                this.objTargets = new TargetsCollection();
                this.app.showLoading('Loading Targets...', this.el);
                this.request = this.objTargets.fetch({data:_data,success:function(data){
                    _.each(data.models, function(model){
                        that.$el.find('#targets_grid tbody').append(new TargetView({model:model,app:app}).el);
                     });
                     that.$("#total_targets .badge").html(that.objTargets.total);
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
                   this.$("#total_targets .badge").html("targets found");
                   this.loadLists();
           },
           showSearchFilters:function(text){
              this.$("#total_targets .badge").html("targets found for \""+text+"\" ");
               
           },
            createTarget: function(){
                    var camp_obj = this;
                    var dialog_title = "New Target";
                    var dialog = this.app.showDialog({title:dialog_title,
                        css:{"width":"650px","margin-left":"-325px"},
                        bodyCss:{"min-height":"100px"},                
                    headerIcon : 'new_headicon',
                        buttons: {saveBtn:{text:'Create Target'} }                                                                           
                    });
                    this.app.showLoading("Loading...",dialog.getBody());
                    require(["target/newtarget"],function(newtargetPage){                                     
                        var mPage = new newtargetPage({camp:camp_obj,app:camp_obj.app,newtardialog:dialog});
                        dialog.getBody().html(mPage.$el);
                        dialog.saveCallBack(_.bind(mPage.createTarget,mPage));
                    });
                    }
        });    
});