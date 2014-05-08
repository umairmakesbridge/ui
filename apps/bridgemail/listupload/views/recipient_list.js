/* 
 * Name: Link View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Link view to display on main page.
 * Dependency: LINK HTML, SContacts
 */
define(['text!listupload/html/recipient_list.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
            tagName:'tr',
            events: {
                'click .percent':'showPercentDiv',
                'click .edit-list':'editList',
                'click .delete-list':'deleteList'
            },
            initialize: function () {
                this.app = this.options.app;
                this.template = _.template(template);	
                this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON())); 
                 this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            editList:function(ev){
                var that = this;
                var target = $(ev.target);
                var listNumber = target.data('id');
                var bms_token =that.app.get('bms_token');
                var listName = target.data('name');
                console.log(listName);
                var dialog_title = "Edit List";
                var dialog = this.app.showDialog({title:dialog_title,
                        css:{"width":"650px","margin-left":"-325px"},
                        bodyCss:{"min-height":"100px"},                
                    headerIcon : 'new_headicon',
                        buttons: {saveBtn:{text:'Update'} }                                                                           
                });
                this.app.showLoading("Loading...",dialog.getBody());
                require(["text!listupload/html/editlist.html"],function(list){
                    dialog.getBody().html(list);
                    dialog.$el.find('#list_name').val(listName);
                    dialog.saveCallBack(_.bind(that.finishEditList(dialog,listNumber,listName), that));
                });
                
                
               
            },
            finishEditList:function(dialog,listNum,listNam){
                var that = this;
                var listName = dialog.$el.find("#list_name");
                if(listName==listNam){
                    dialog.hide();
                    return;
                }
                var listNum = listNum;
                that.app.showLoading("Editing List...",that.$el);          
                var URL = "/pms/io/list/saveListData/?BMS_REQ_TK="+bms_token;
                $.post(URL, {type:'newName',listName:listName,listNum:listNumber})
                        .done(function(data) {                                 
                               var _json = jQuery.parseJSON(data);                         
                               that.app.showLoading(false,that.$el);          
                               if(_json[0]!=="err"){
                                   that.app.showMessge("List renamed successfully!");  
                               }
                               else{
                                   that.app.showAlert(_json[1],$("body"),{fixed:true}); 
                               }
                       });
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
                   var bms_token =that.app.get('bms_token');
                   var URL = "/pms/io/list/getListPopulation/?BMS_REQ_TK="+bms_token+"&listNum="+listNumber+"&type=stats";
                   that.showLoadingWheel(true);
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(that.app.checkError(data)){
                            return false;
                        }
                        var percentDiv ="<div class='pstats' style='display:block'><ul><li class='openers'><strong>"+that.options.app.addCommas(data.openers)+"<sup>%</sup></strong><span>Openers</span></li>";
                         percentDiv =percentDiv + "<li class='clickers'><strong>"+that.options.app.addCommas(data.clickers)+"<sup>%</sup></strong><span>Clickers</span></li>";
                         percentDiv =percentDiv + "<li class='visitors'><strong>"+that.options.app.addCommas(data.pageviewers)+"<sup>%</sup></strong><span>Visitors</span></li></ul></div>";
                         that.showLoadingWheel(false);
                     target.parents('.percent_stats').append(percentDiv);
                                           	
                    });
                    that.app.showLoading(false, that.$el);
                },
              showLoadingWheel:function(isShow){
               if(isShow)
                ele.append("<div class='pstats' style='display:block'><div class='loading-wheel right' style='margin-left:-10px;margin-top: 4px;position: inherit!important;'></div></div>")
               else{
                var ele = $('.pstats').find(".loading-wheel") ;      
                    ele.remove();
                }
           },
                
        });    
});