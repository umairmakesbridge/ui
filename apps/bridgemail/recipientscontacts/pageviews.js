/* 
 * Name: Page Views All
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Page Views All is collection view which then call page view to populate all visits
 * Dependency: HTML PAGE VIEWS, Views PageView 
 */

define(['text!recipientscontacts/html/pageviews.html','recipientscontacts/pageview','recipientscontacts/collections/pageviews'],
function (template,PageView,ViewsCollection) {
        'use strict';
        return Backbone.View.extend({
            events: {
                'click #view_campaign':'openCampaign'
            },
            initialize: function () {
                 this.template = _.template(template);	
                 this.offsetLength = 0;
                 this.total_fetch  = 0;
                 this.total = 0;
                 this.campaignName = "";
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
                       // _data['responderType'] = this.responderType;
                       _data['offset'] = this.offset ;
                        _data['type'] = "subscriberWebVisits" ;
                        console.log(this.options);
                        _data['subNum'] = this.options.subNum ;
                        this.$el.find('.pageviews-listing table tbody').append("<tr class='erow load-tr' id='loading-tr'><td colspan=7><div class='no-contacts' style='display:none;margin-top:15px;padding-left:43%;'>No contacts founds!</div><div class='loading-contacts' style='margin-top:45px'></div></td></tr>");
                         this.options.app.showLoading("&nbsp;",this.$el.find('.pageviews-listing table').find('.loading-contacts'));
                 
                         var objViewsCollection = new ViewsCollection();
                          objViewsCollection.fetch({data:_data,success:function(data){
                                  that.offsetLength = data.length;
                                   that.total_fetch = that.total_fetch + data.length;
                                  that.$el.find("#records-found .badge").html(data.total);
                                  _.each(data.models,function(model) {
                                      //console.log(model.attributes('campanameignName'));
                                      var name = model.get('campaignName');
                                      if(name == "") name = "Manual Visit";
                                      if(that.campaignName != name){
                                         var data_id = name;
                                         var data_encode = model.get('campNum.encode');
                                         if(name == "Manual Visit"){
                                             that.$el.find(".pageviews-listing table tbody").append("<tr><td class='td-campaigns-pageviews' colspan='10'><h3 class='camp_title'> <b>"+ name +"<b></h3></td></tr>");
                                         }else{
                                             that.$el.find(".pageviews-listing table tbody").append("<tr><td class='td-campaigns-pageviews' colspan='10'><h3 class='camp_title'><i class='icon campaigns left'></i> <a data-name='"+data_id+"' class='showtooltip' data-original-title='Click to view campaign preview' data-encode='"+data_encode+"' id='view_campaign'>"+ name +"<a></h3></td></tr>");
                                         }
                                          
                                      }
                                      that.campaignName = name;  
                                      that.$el.find(".pageviews-listing table tbody").append(new PageView({model:model,app:that.options.app}).el);
                                    });
                                     if(that.total_fetch < parseInt(data.total)){
                                         that.$el.find(".pageviews-listing table tbody tr:last").attr("data-load","true");
                                    } 
                                     that.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
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
                console.log('score bar active');
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
            },
                openCampaign:function(ev){
                var name = $(ev.target).data('name'); // checksum
                var camp_id = $(ev.target).data('encode'); //encode
                                var camp_obj = this;
				//var appMsgs = this.app.messages[0];				
				var dialog_width = $(document.documentElement).width()-60;
				var dialog_height = $(document.documentElement).height()-182;
				var dialog = camp_obj.options.app.showDialog({title:'Campaign Preview of &quot;' + name + '&quot;' ,
						  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
						  headerEditable:false,
						  headerIcon : 'dlgpreview',
						  bodyCss:{"min-height":dialog_height+"px"}
				});	
				this.options.app.showLoading("Loading Campaign HTML...",dialog.getBody());									
                                var preview_url = "https://"+this.options.app.get("preview_domain")+"/pms/events/viewcamp.jsp?snum="+this.options.encode+"&cnum="+camp_id;  
                                require(["common/templatePreview"],_.bind(function(templatePreview){
                                var tmPr =  new templatePreview({frameSrc:preview_url,app:this.options.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:'N'}); // isText to Dynamic
                                 dialog.getBody().html(tmPr.$el);
                                 tmPr.init();
                               },this));
            },
        });
});

