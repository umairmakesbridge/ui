/* Name: List Upload
 * Date: 21 May 2014
 * Author: Pir Abdul Wakeel
 * Description: List Grid.
 * Dependency: List Grid Single Grid View
 */
define(['text!listupload/html/recipient_list.html','bms-tags'],
function (template,tags) {
        'use strict';
        return Backbone.View.extend({
            tagName:'tr',
            events: {
                'click .percent':'showPercentDiv',
                'click .edit-list':'editList',
                'click .delete-list':'deleteList',
                'click .pageview':'showPageViews'
            },
            initialize: function () {
                this.app = this.options.app;
                this.template = _.template(template);	
                this.model.bind("change", this.render, this);
                this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON())); 
                 this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            editList:function(ev){
                
                var that = this;
                if(ev){
                    var target = $(ev.target);
                    var listNumber = target.data('id');
                    var listName = target.data('name');
                } 
                var dialog_title = "Edit List";
                var dialog = this.app.showDialog({title:dialog_title,
                        css:{"width":"650px","margin-left":"-325px"},
                        bodyCss:{"min-height":"250px"},                
                    headerIcon : 'list2',
                        buttons: {saveBtn:{text:'Update'} }                                                                           
                });
                require(["text!listupload/html/editlist.html"],function(list){
                    dialog.getBody().html(list);
                    
                    dialog.$el.addClass('gray-panel');
                     dialog.$el.find('#list_name').focus();
                    that.showTags(dialog);
                     dialog.$el.find('#list_name').val(listName);
                   
                });
                dialog.saveCallBack(_.bind(this.finishEditList,this,dialog,listNumber,listName,target));
             //    dialog.saveCallBack(_.bind(this.sendTestCampaign,this,dialog,camp_id));
                
            },
               showTags:function(dialog){
                var that = this;
                var listId = this.model.get('listNumber.encode');
                  dialog.$el.find("#tags").tags({app:this.options.app,
                        url:"/pms/io/list/saveListData/?BMS_REQ_TK="+this.options.app.get('bms_token'),
                        tags:this.model.get('tags'),
                        showAddButton:(listId=="0")?false:true,
                         callBack:_.bind(that.tagUpdated,that),
                         module:"recipients",
                         params:{type:'tags',listNum:listId,tags:''},
                         typeAheadURL:"/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=allCampaignTags"
                    });
                    dialog.$el.find('#tags').find('.tagicon').removeClass('gray').addClass('blue');
                    
                  
            },
            tagUpdated:function(data){
                this.model.set('tags',data);
                this.render();
               // this.showTags();
            },
            finishEditList:function(dialog,listNum,listNam,target){
                var that = this;
                var listName = dialog.$el.find("#list_name").val();
                if(listName==listNam){
                    dialog.hide();
                    return;
                }
                that.app.showLoading("Updating...",dialog.getBody());    
                var bms_token =that.app.get('bms_token');
                var listNum = listNum;
                var URL = "/pms/io/list/saveListData/?BMS_REQ_TK="+bms_token+"&type=newName&listName="+listName+"&listNum="+listNum;
                $.post(URL)
                        .done(function(data) {  
                               var _json = jQuery.parseJSON(data);                         
                               if(_json[0]!=="err"){
                                   that.app.showMessge("List updated successfully!");
                                   target.data('name',listName);
                                   target.parents('tr').find('.name-type h3 a:first').html(listName);
                                   dialog.hide();
                               }
                               else{
                                   that.app.showAlert(_json[1],$("body"),{fixed:true}); 
                               }
                       });
                       that.app.showLoading(false,dialog.getBody());    
            },
            deleteList:function(ev){
                
                   var that = this;
                var target = $(ev.target);
                var listNumber = target.data('id');
                var bms_token =that.app.get('bms_token');
                 var URL = "/pms/io/list/saveListData/?BMS_REQ_TK="+bms_token;
                   that.options.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this list?",                                                
                            callback: _.bind(function(){													
                                that.options.app.showLoading("Deleting List...",$(ev.target).parents('tr'));
                                $.post(URL, {type:'delete',listNum:listNumber})
                                    .done(function(data) {                  
                                          that.options.app.showLoading(false,$(ev.target).parents('tr'));   
                                           var _json = jQuery.parseJSON(data);
                                           if(_json[0]!=='err'){
                                               $(ev.target).parents('tr').fadeOut('slow');
                                              
                                             }
                                           else{
                                                that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                           }
                                   });
                            },that)},
                       that.$el); 
                
                
                
               
                 
             } ,
            showPercentDiv:function(ev){
                   var target = $(ev.target);
                   var listNumber = target.data('list');
                   if($('.pstats').length > 0) $('.pstats').remove();
                   var that = this;
                   that.showLoadingWheel(true,target);
                   
                   var bms_token =that.app.get('bms_token');
                   var URL = "/pms/io/list/getListPopulation/?BMS_REQ_TK="+bms_token+"&listNum="+listNumber+"&type=stats";
                   
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(that.app.checkError(data)){
                            return false;
                        }
                        var percentDiv ="<div class='pstats left-side' style='display:block'><ul><li class='openers'><strong>"+that.options.app.addCommas(data.openers)+"<sup>%</sup></strong><span>Openers</span></li>";
                         percentDiv =percentDiv + "<li class='clickers'><strong>"+that.options.app.addCommas(data.clickers)+"<sup>%</sup></strong><span>Clickers</span></li>";
                         percentDiv =percentDiv + "<li class='visitors'><strong>"+that.options.app.addCommas(data.pageviewers)+"<sup>%</sup></strong><span>Visitors</span></li></ul></div>";
                         that.showLoadingWheel(false,target);
                     target.parents('.percent_stats').append(percentDiv);
                                           	
                    });
                    that.app.showLoading(false, that.$el);
                },
              showLoadingWheel:function(isShow,target){
               if(isShow)
                target.append("<div class='pstats left-side' style='display:block; background:#01AEEE;'><div class='loading-wheel right' style='margin-left:-10px;margin-top: -5px;position: inherit!important;'></div></div>")
               else{
                var ele = target.find(".loading-wheel") ;      
                    ele.remove();
                }
           },
           showPageViews:function(ev){
                 var that = this;
                 var dialog_title = "Contacts Viewed";
                
                 var listNum = $(ev.target).data('id');
                
                 var dialog = this.app.showDialog({title:dialog_title,
                        css:{"width":"850px","margin-left":"-425px"},
                        bodyCss:{"min-height":"250px",'max-height':"420px"},                
                        headerIcon : 'list2',
                });
                
                 require(["recipientscontacts/rcontacts"],function(Contacts){
                   var objContacts = new Contacts({app:that.app,listNum:listNum});
                    dialog.getBody().html(objContacts.$el);
                    objContacts.$el.find('#contacts_close').remove();
                    objContacts.$el.find('.temp-filters').removeAttr('style');
                   
                });
           },
           getOpacity:function(){
                if (this.model.get('name').toLowerCase().indexOf("supress_list_") >= 0){
                    return '0.7';
                }else{
                    return '1';
                }
           }
                
        });    
});