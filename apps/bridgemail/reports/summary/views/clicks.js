/* 
 * Name: Clicks Views All
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Page Views All is collection view which then call page view to populate all visits
 * Dependency: HTML PAGE VIEWS, Views PageView 
 */

define(['text!reports/summary/html/clicks.html','reports/summary/views/click','reports/summary/collections/clicks'],
function (template,Click,Clicks) {
        'use strict';
        return Backbone.View.extend({
            events: {
                
            },
            initialize: function () {
                 this.template = _.template(template);	
                 this.offsetLength = 0;
                 this.total_fetch  = 0;
                 this.total = 0;
                 this.offsetLength = 0;
                
                 this.render();
            },
            render: function () {
                var that = this; 
                this.$el.html(this.template());
                $(".modal-body").scroll(_.bind(this.liveLoading,this));
                $(".modal-body").resize(_.bind(this.liveLoading,this));
                this.fetchClicks();
              //  this.$el.find(".contactnm").attr('data-encode', this.options.encode).html("<strong>"+this.options.email+ "</strong>").on('click',function(ev){
                   //  that.options.app.mainContainer.openSubscriber(that.options.encode);
                    // that.$el.parents('.modal').find('.close').click();
                //});
               // this.$el.find(".salestatus").html(this.capitalizeLetter());
                if(this.options.url){
                    var arr = this.options.url.split('|-.-|');
                  
                    if(arr[0] =="undefined"){
                         this.$el.find("#link_page").remove();;
                         return;
                    }
                    this.$el.find("#contact_url").attr('href',this.options.app.decodeHTML(arr[1])).html(arr[0]).attr('data-original-title',this.options.app.decodeHTML(arr[1]));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                }else{
                    this.$el.find("#link_page").remove();
                }                                                           
            },
           fetchClicks:function(count){
                        var _data = {};
                        var that = this;
                        if(!count){
                            this.offset = 0;
                            this.$el.find(".clicks-listing table tbody").empty();
                        }else{
                            this.offset = this.offset + this.offsetLength;
                        }
                            this.$el.find(".contactnm").attr('data-encode', this.options.encode).html("<strong>"+this.options.email+ "</strong>").on('click',function(ev){
                         that.options.app.mainContainer.openSubscriber(that.options.encode);
                         that.$el.parents('.modal').find('.close').click();
                          });
                         this.$el.find(".salestatus").html(this.capitalizeLetter());
                        _data['type'] = "subscriberClickDetail" ;
                        _data['subNum'] = this.options.subNum ;
                        _data['campNum'] = this.options.campNum;
                        this.$el.find('.clicks-listing table tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:15px;padding-left:43%;'>No clicks founds!</div><div class='loading-contacts' style='margin-top:45px'></div></td></tr>");
                         this.options.app.showLoading("&nbsp;",this.$el.find('.clicks-listing table').find('.loading-contacts'));
                 
                         var objClicks = new Clicks();
                          objClicks.fetch({data:_data,success:function(data){
                                  that.offsetLength = data.length;
                                   that.total_fetch = that.total_fetch + data.length;
                                  that.$el.find("#records-found .badge").html(data.total);
                                  _.each(data.models,function(model) {
                                        that.$el.find(".clicks-listing table tbody").append(new Click({model:model,app:that.options.app,attr:that.options}).el);
                                    });
                                     if(that.total_fetch < parseInt(data.total)){
                                         that.$el.find(".clicks-listing table tbody tr:last").attr("data-load","true");
                                    } 
                              that.$el.find('.clicks-listing table  #loading-tr').remove();       
                           }});
               
               
               
              
           },
            capitalizeLetter:function(){
                
             return this.options.salestatus.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                   return letter.toUpperCase();
              });
           },
            liveLoading:function(){
                var $w = $(window);
                  if ($(".modal-body").scrollTop()>70) {
                         if($(".modal-footer").find('.clicks-scroll').length < 1){  
                                $(".modal-footer").append("<button class='ScrollToTop clicks-scroll' type='button' style='position:absolute;bottom:65px;right:12px;'></button>");
                                $('.clicks-scroll').on('click',function(){
                                    $(".modal-body").animate({scrollTop:0},600); 
                                })
                          }
                       } else {
                          $(".modal-footer .clicks-scroll").remove();
                    }         
                var th = 200;
                var inview =this.$el.find('table tbody tr:last').filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                    this.fetchClicks(this.offsetLength);
                }  
            }
        });
});

