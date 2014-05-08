/* 
 * Name: Link View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Link view to display on main page.
 * Dependency: LINK HTML, SContacts
 */
define(['text!target/html/recipients_target.html'],
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
            },
            editList:function(ev){
                var that = this;
                var target = $(ev.target);
                var listNumber = target.data('id');
                var bms_token =that.app.get('bms_token');
                var listName = 'abcdef';
                that.app.showLoading("Editing List...",that.$el);          
                var URL = "/pms/io/list/saveListData/?BMS_REQ_TK="+bms_token+"&listName="+listName+"&listNum="+listNumber+"&type=newName";
                $.post(URL)
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
                that.app.showLoading("Deleting List...",that.$el);          
                var URL = "/pms/io/list/saveListData/?BMS_REQ_TK="+bms_token+"&listNum="+listNumber+"&type=delete";
                $.post(URL)
                        .done(function(data) {                                 
                               var _json = jQuery.parseJSON(data);                         
                               that.app.showLoading(false,that.$el);          
                               if(_json[0]!=="err"){
                                   that.app.showMessge("List deleted successfully!");  
                               }
                               else{
                                   that.app.showAlert(_json[1],$("body"),{fixed:true}); 
                               }
                       });
            },
            showPercentDiv:function(ev){
                   var target = $(ev.target);
                   var listNumber = target.data('list');
                   if($('.pstats').length > 0) $('.pstats').remove();
                   var that = this;
                   var bms_token =that.app.get('bms_token');
                   var URL = "/pms/io/list/getListPopulation/?BMS_REQ_TK="+bms_token+"&listNum="+listNumber+"&type=stats";
                   that.showLoadingWheel(true,target.parents('.percent_stats'));
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(that.app.checkError(data)){
                            return false;
                        }
                        var percentDiv ="<div class='pstats' style='display:block'><ul><li class='openers'><strong>"+that.options.app.addCommas(data.openers)+"<sup>%</sup></strong><span>Openers</span></li>";
                         percentDiv =percentDiv + "<li class='clickers'><strong>"+that.options.app.addCommas(data.clickers)+"<sup>%</sup></strong><span>Clickers</span></li>";
                         percentDiv =percentDiv + "<li class='visitors'><strong>"+that.options.app.addCommas(data.pageviewers)+"<sup>%</sup></strong><span>Visitors</span></li></ul></div>";
                         that.showLoadingWheel(false,target.parents('.percent_stats'));
                     target.parents('.percent_stats').append(percentDiv);
                                           	
                    });
                    that.app.showLoading(false, that.$el);
                },
              showLoadingWheel:function(isShow, ele){
               if(isShow)
                ele.append("<div class='loading-wheel right' style='margin-left:-10px;margin-top: 4px;position: inherit!important;'></div>")
               else{
                var ele = ele.find(".loading-wheel") ;      
                    ele.remove();
                }
           },
                
        });    
});