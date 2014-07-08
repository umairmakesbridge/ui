/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/tag.html'],
        function(template) {
            'use strict';
            return Backbone.View.extend({
                className:"botpanel",
                tagName:"div",
                events: {
                    "click .add-targets":"loadTargets"
                 },
                initialize: function() {
                    this.template = _.template(template);
                    this.app=  this.options.app;
                    this.targetsRequest = new TargetsCollection();
                    this.targetsModelArray = [];
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template());
                },
                loadTargets:function(){
                     var dialog_object ={title:'Select Targets',
                        css:{"width":"1200px","margin-left":"-600px"},
                        bodyCss:{"min-height":"423px"},
                        headerIcon : 'targetw'                        
                     }
                     dialog_object["buttons"]= {saveBtn:{text:'Done'} };
                    var dialog = this.options.app.showDialog(dialog_object);
                    this.options.app.showLoading("Loading Targets...",dialog.getBody());                                  
                    require(["target/selecttarget"],_.bind(function(page){                                     
                         var targetsPage = new page({page:this,dialog:dialog,editable:true});
                         dialog.getBody().html(targetsPage.$el);
                         targetsPage.init();                         
                         dialog.saveCallBack(_.bind(targetsPage.saveCall,targetsPage));
                         targetsPage.createRecipients(this.targetsModelArray);
                    },this));
                }
            });
        });


