/* 
 * Name: Page Views All
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Page Views All is collection view which then call page view to populate all visits
 * Dependency: HTML PAGE VIEWS, Views PageView 
 */

define(['text!reports/summary/html/pageviews.html','reports/summary/views/pageview','reports/summary/collections/pageviews'],
function (template,PageView,ViewsCollection) {
        'use strict';
        return Backbone.View.extend({
            events: {
                 'click .pageviews-scroll':'scrollToTop'
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
                this.fetchViews();
                this.$el.find(".contactnm").attr('data-encode', this.options.encode).html("<strong>"+this.options.email+ "</strong>").on('click',function(ev){
                     that.options.app.mainContainer.openSubscriber(that.options.encode);
                     that.$el.parents('.modal').find('.close').click();
                });
                this.$el.find(".salestatus").html(this.capitalizeLetter());
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
           fetchViews:function(count){
                        var _data = {};
                        var that = this;
                        if(!count){
                            this.offset = 0;
                            this.$el.find(".pageviews-listing table tbody").empty();
                        }else{
                            this.offset = this.offset + this.offsetLength;
                        }
                        _data['responderType'] = this.responderType;
                        _data['type'] = "subscriberWebVisits" ;
                        _data['subNum'] = this.options.subNum ;
                        if(this.options.article){
                             _data['articleNum'] = this.options.article;
                        }
                        _data['campNum'] = this.options.campNum;
                        this.$el.find('.pageviews-listing table tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:15px;padding-left:43%;'>No contacts founds!</div><div class='loading-contacts' style='margin-top:45px'></div></td></tr>");
                         this.options.app.showLoading("&nbsp;",this.$el.find('.pageviews-listing table').find('.loading-contacts'));
                 
                         var objViewsCollection = new ViewsCollection();
                          objViewsCollection.fetch({data:_data,success:function(data){
                                  that.offsetLength = data.length;
                                   that.total_fetch = that.total_fetch + data.length;
                                  that.$el.find("#records-found .badge").html(data.total);
                                  _.each(data.models,function(model) {
                                        that.$el.find(".pageviews-listing table tbody").append(new PageView({model:model,app:that.options.app}).el);
                                    });
                                     if(that.total_fetch < parseInt(data.total)){
                                         that.$el.find(".pageviews-listing table tbody tr:last").attr("data-load","true");
                                    } 
                              that.$el.find('.pageviews-listing table  #loading-tr').remove();       
                           }});
               
               
               
              
           },
            capitalizeLetter:function(){
                
             return this.options.salestatus.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                   return letter.toUpperCase();
              });
           },
            liveLoading:function(){
                var $w = $(window);
                var that = this;
                var modal = $(".modal-body");
                var footer = $(".modal-footer");
                if($('.modal.in').length > 1){
                     modal =  $(".modal-body:last");
                     footer = $(".modal-footer:last");
                     console.log(modal);
                }
                  if (modal.scrollTop()>70) {
                         if(footer.find(".pageviews-scroll").length < 1)
                           footer.append("<button class='ScrollToTop pageviews-scroll' type='button' style='position:absolute;bottom:65px;right:13px;'></button>");
                           $('.pageviews-scroll').on('click',function(){
                               modal.animate({scrollTop:0},600); 
                           })
                       } else {
                          footer.find(".pageviews-scroll").remove();
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
                    this.fetchViews(this.offsetLength);
                }  
            },scrollToTop:function(){
                this.$el.animate({scrollTop:0},600);    
            }
        });
});

