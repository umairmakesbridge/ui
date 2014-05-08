/* 
 * Module Name : Recipients often called Manage Contacts
 * Author: Pir Abdul Wakeel
 * Date Created: 05 May 2014
 * Description: this file used for recipients grid, contain lists, tags and targets. 
 * List : placed in listupload folder,
 * targets : placed at targets folder
 * tags : placed at tags folder
 * dependencies: changing this file may cause problem only in recipients, its independ module. 
 * while others tags, list, tags have dependencies on each other.
 */

define(['text!contacts/html/recipients.html','app'],
function (template,app) {
        'use strict';
        return Backbone.View.extend({
            className: 'recipients_list',
            events: {
                'click #choose_lists':'showListGrid',
                'click #choose_targets':'showTargetsGrid',
                'click #choose_tags':'showTagsGrid'
            },
            initialize: function () {
                this.template = _.template(template);
                this.app = app;
                this.active = 0;
                this.render();
            },
            render: function (search) {
                this.$el.html(this.template({}));
                this.showListGrid(false);
            },
            showListGrid:function(ev){
                if(ev){
                    if(this.active == 1) return;
                     $(ev.target).parents('div').find('ul li').removeClass('selected');
                     $(ev.target).addClass('selected');
                 }
                this.active = 1;
                this.app.showLoading('Loading Lists...', this.$el.find(".template-container"));
                var that = this; // assign this to that, so there will be no scope issue.
                require(['listupload/recipients_list'],function(viewLists){
                    var objViewLists = new viewLists();
                   that.$el.find(".template-container").html(objViewLists.el);
                   that.app.showLoading(false, that.$el.find(".template-container"));
                });
               
                
            },
            showTargetsGrid:function(ev){
                if(this.active == 2)return;
                $(ev.target).parents('div').find('ul li').removeClass('selected');
                $(ev.target).addClass('selected');
                this.active = 2;
                this.app.showLoading('Loading Targets...', this.$el.find(".template-container"));
                var that = this; // assign this to that, so there will be no scope issue.
                require(['target/recipients_targets'],function(viewTargets){
                    var objViewTargets = new viewTargets();
                   that.$el.find(".template-container").html(objViewTargets.el);
                   that.app.showLoading(false, that.$el.find(".template-container"));
                });
            },
            showTagsGrid:function(ev){
                if(this.active == 3) return;
                $(ev.target).parents('div').find('ul li').removeClass('selected');
                $(ev.target).addClass('selected');
                this.active = 3;
            }
            
        });    
});