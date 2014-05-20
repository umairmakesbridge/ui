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
                "click .scroll-recipients":"scrollToTop",
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
                 $(window).scroll(_.bind(this.scrollTop,this));
                $(window).resize(_.bind(this.scrollTop,this));
            },
            showListGrid:function(ev){
                if(ev){
                  var target = $(ev.target);
                    if(target.attr('id') !="choose_lists")
                        target = target.parents('li'); 
                        if(this.active == 1) {target.addClass('selected'); return};
                         target.siblings().removeClass('selected');
                         target.addClass('selected');
                     }
                this.$el.find(".template-container").empty();
                this.active = 1;
                this.app.showLoading('Loading Lists...', this.$el.find(".template-container"));
                var that = this; // assign this to that, so there will be no scope issue.
                require(['listupload/recipients_list'],function(viewLists){
                    var objViewLists = new viewLists();
                   that.$el.find(".template-container").html(objViewLists.el);
                   
                   that.app.showLoading(false, that.$el.find(".template-container"));
                });
                this.$el.find(".template-container").css('background','transparent');
            },
            showTargetsGrid:function(ev){
                  var target = $(ev.target);
                if(target.attr('id') !="choose_targets")
                    target = target.parents('li'); 
                if(this.active == 2){target.addClass('selected'); return};
                    target.siblings().removeClass('selected');
                   
                this.active = 2;
                this.$el.find(".template-container").empty();
                target.addClass('selected');
                this.app.showLoading('Loading Targets...', this.$el.find(".template-container"));
                var that = this; // assign this to that, so there will be no scope issue.
                require(['target/recipients_targets'],function(viewTargets){
                    var objViewTargets = new viewTargets();
                   that.$el.find(".template-container").html(objViewTargets.el);
                   that.app.showLoading(false, that.$el.find(".template-container"));
                });
                this.$el.find(".template-container").css('background','transparent');
                
            },
            showTagsGrid:function(ev){
                var target = $(ev.target);
                if(target.attr('id') !="choose_tags")
                    target = target.parents('li'); 
                if(this.active == 3) {target.addClass('selected'); return};
                 target.siblings().removeClass('selected');
                target.addClass('selected');
                this.$el.find(".template-container").empty();
                this.active = 3;
                this.app.showLoading('Loading Tags...', this.$el.find(".template-container"));
                var that = this; // assign this to that, so there will be no scope issue.
                require(['tags/recipients_tags'],function(viewTags){
                    var objViewTags = new viewTags();
                   that.$el.find(".template-container").html(objViewTags.el);
                   that.app.showLoading(false, that.$el.find(".template-container"));
                });
                this.$el.find(".template-container").css('background','#EAF4F9');

            },scrollTop:function(){
                 if ($(window).scrollTop()>50) {
                       this.$el.find(".scroll-recipients").fadeIn('slow');
                    } else {
                       this.$el.find(".scroll-recipients").fadeOut('slow');
                 }
            },
            scrollToTop:function(){
                $("html,body").css('height','100%').animate({scrollTop:0},600).css("height","");    
            },
            
        });    
});