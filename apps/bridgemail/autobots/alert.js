/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/alert.html'],
        function(template) {
            'use strict';
            return Backbone.View.extend({
                className:"botpanel",
                tagName:"div",
                events: {
                 },
                initialize: function() {
                    this.template = _.template(template);
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template());
                } 
            });
        });


