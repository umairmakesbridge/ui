/* 
 * Name: Notifications
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification show all
 * Dependency: Notifications
 */

define(['text!notifications/html/notifications.html','app', 'notifications/notification', 'notifications/collections/notifications'],
        function(template, app,Notification,Notifications) {
            'use strict';
            return Backbone.View.extend({
                events: {
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.offsetLength = 0;
                    this.total_fetch = 0;
                    this.total = 0;
                    this.app = app;
                    this.offsetLength = 0;

                    this.render();
                },
                render: function() {
                    var that = this;
                    this.$el.html(this.template());
                    $(".modal-body").scroll(_.bind(this.liveLoading, this));
                    $(".modal-body").resize(_.bind(this.liveLoading, this));
                    this.fetchNotifications();
                },
                fetchNotifications: function(count) {
                    var _data = {};
                    var that = this;
                    if (!count) {
                        this.offset = 0;
                    } else {
                        this.offset = this.offset + this.offsetLength;
                    }

                    _data['type'] = "get";
                    _data['notifyType'] = "";
                    _data['eventType'] = "";
                    _data['offset'] = this.offset;
                    this.$el.find('.clicks-listing table tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:15px;padding-left:43%;'>No clicks founds!</div><div class='loading-contacts' style='margin-top:45px'></div></td></tr>");
                    this.app.showLoading("&nbsp;", this.$el.find('.clicks-listing table').find('.loading-contacts'));

                    var objNotifications = new Notifications();
                    objNotifications.fetch({data: _data, success: function(data) {
                            that.offsetLength = data.length;
                            that.total_fetch = that.total_fetch + data.length;
                            _.each(data.models, function(model) {
                                that.$el.find(".notification-container").append(new Notification({model: model, app: that.app, attr: that.options}).el);
                            });
                            if (that.total_fetch < parseInt(data.total)) {
                                that.$el.find(".notification-container .alertmsg:last").attr("data-load", "true");
                            }
                        }});




                },
                capitalizeLetter: function() {

                    return this.options.salestatus.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                        return letter.toUpperCase();
                    });
                },
                liveLoading: function() {
                    var $w = $(window);
                    if ($(".modal-body").scrollTop() > 70) {
                        if ($(".modal-footer .pageviews-scroll").length < 1)
                            $(".modal-footer").append("<button class='ScrollToTop clicks-scroll' type='button' style='position:absolute;bottom:65px;right:12px;'></button>");
                        $('.clicks-scroll').on('click', function() {
                            $(".modal-body").animate({scrollTop: 0}, 600);
                        })
                    } else {
                        $(".modal-footer .clicks-scroll").remove();
                    }
                    var th = 200;
                    var inview = this.$el.find('table tbody tr:last').filter(function() {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.fetchClicks(this.offsetLength);
                    }
                }
            });
        });

