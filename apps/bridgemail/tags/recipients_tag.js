 
            
       /* Name: Link View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Link view to display on main page.
 * Dependency: LINK HTML, SContacts
 */
define(['text!tags/html/recipients_tag.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
           tagName:"li",
            className:"action",
            events: {
                'click .percent':'showPercentDiv',
                'click .edit-list':'editList',
                'click .delete-list':'deleteList',
                'click .badge':'showPageViews'
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
                   var tag = target.data('name');
                   if($('.percent_stats').length > 0) $('.percent_stats').remove();
                   var that = this;
                   that.showLoadingWheel(true,target);
                   
                   var bms_token =that.app.get('bms_token');
                   
                   var URL = "/pms/io/user/getTagPopulation/?BMS_REQ_TK="+bms_token+"&tag="+tag+"&type=stats";
                   
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(that.app.checkError(data)){
                            return false;
                        }
                        var percentDiv ="<div class='percent_stats'><div class='pstats' style='display:block'><ul><li class='openers'><strong>"+that.options.app.addCommas(data.openers)+"<sup>%</sup></strong><span>Openers</span></li>";
                         percentDiv =percentDiv + "<li class='clickers'><strong>"+that.options.app.addCommas(data.clickers)+"<sup>%</sup></strong><span>Clickers</span></li>";
                         percentDiv =percentDiv + "<li class='visitors'><strong>"+that.options.app.addCommas(data.pageviewers)+"<sup>%</sup></strong><span>Visitors</span></li></ul></div></div>";
                         that.showLoadingWheel(false,target);
                     target.parents('li').append(percentDiv);
                                           	
                    });
                    that.app.showLoading(false, that.$el);
                },
              showLoadingWheel:function(isShow,target){
               if(isShow)
                target.append("<div class='pstats' style='display:block; background:#01AEEE;'><div class='loading-wheel right' style='margin-left:-10px;margin-top: -5px;position: inherit!important;'></div></div>")
               else{
                var ele = target.find(".loading-wheel") ;      
                    ele.remove();
                }
           },
           getTagName:function(){
               return  this.options.app.decodeHTML(this.model.get('tag'));
           }, 
           getSubCount:function(){
               return this.model.get('subCount');
           },
           showPageViews:function(ev){
                var that = this;
                var offset = $(ev.target).offset();
                var tag = $(ev.target).data('tag');
                $('#div_pageviews').show();
                $('#div_pageviews').empty();
                $('#div_pageviews').append("<div class='loading-contacts' style='margin-top:15px; font-weight:bold; text-align:center; margin-left:auto; margin-right:auto;'>Loading...</div> ");
                
                $('#div_pageviews').css({top:offset.top-325});
                require(["recipientscontacts/rcontacts"],function(Contacts){
                   var objContacts = new Contacts({app:that.app,listNum:tag,type:'tag'});
                    $('#div_pageviews').css('padding-top','0');
                    $('#div_pageviews').html(objContacts.$el);
                });
           }
                
        });    
}); 