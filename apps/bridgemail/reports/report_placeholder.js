define(['text!reports/html/report_placeholder.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className: 'report-placeholder',
                events: {
                    
                },
                initialize: function () {
                    this.template = _.template(template);                    
                    this.sub = this.options.sub;
                    this.app = this.sub.app;                    
                    this.render();
                },
                render: function ()
                {   
                    var showWebStats = false;
                    if(this.app.get("bridgestatz") && this.app.get("bridgestatz").id){
                        showWebStats = true;                   
                    }
                    this.$el.html(this.template({showWebStats:showWebStats}));                    
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.showAddMenu();                    
                },
                init: function () {
                    
                },
                showAddMenu: function(){
                    var VISIBLE_CLASS = 'is-showing-options',
                    fab_btn  = this.$('#fab_btn'),
                    fab_ctn  = this.$('#fab_ctn');
                    var showOpts = function(e) {
                      var processClick = function (evt) {
                        if (e.clientX !== evt.clientX && e.clientY !== evt.clientY) {
                          fab_ctn.removeClass(VISIBLE_CLASS);
                          fab_ctn.IS_SHOWING = false;
                          $(document).unbind("click",processClick);                          
                        }
                      };
                      if (!fab_ctn.IS_SHOWING) {
                        fab_ctn.IS_SHOWING = true;
                        fab_ctn.addClass(VISIBLE_CLASS);
                        $(document).bind("click",processClick);                        
                      }
                      else{
                            fab_ctn.removeClass(VISIBLE_CLASS);
                            fab_ctn.IS_SHOWING = false;
                        }
                    };
                    fab_btn.bind('click', showOpts);
                }
            });
        });
