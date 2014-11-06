define(['contacts/collections/subscriber_timeline','contacts/collections/subscriber_timeline_future','text!contacts/html/subscriber_timeline.html','contacts/timeline_row','moment'],
function (Timeline,TimelineFuture,template,TimeLineRowView,moment) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Timeline view 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({          
            /**
             * Attach events on elements in view.
            */
            events: {
             
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                this.template = _.template(template);				
                this.sub = this.options.sub
                this.app = this.sub.app;
                this.timeLineRequest = new Timeline(); 
                this.timeLineRequestFuture = new TimelineFuture(); 
                this.monthYear = "";
                this.render();                 
                //this.model.on('change',this.renderRow,this);
            },
            /**
             * Render view on page.
            */
            render: function () {                                    
                this.$el.html(this.template({                 
                }));                
                this._request = null;
                this.$timelineFuture = this.$(".timeline-container .future .filter-div");
                this.$timelineContainer = this.$(".timeline-container .current .filter-div");
                this.$curLoad = this.$(".loadmore");
                this.initControls();    
            },            
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
               this.$(".search-timeline").searchcontrol({
                    id:'contact-search',
                    width:'160px',
                    height:'22px',
                    placeholder: 'Search Timeline',
                    gridcontainer: 'targets_grid',
                    showicon: 'yes',
                    iconsource: 'actfeed'
                });
                this.fetchTime();
                $(window).scroll(_.bind(this.liveLoading,this));
                $(window).resize(_.bind(this.liveLoading,this));
            }
            /**
             * Fetching timeline from server.
            */
            ,
            fetchTimeLine:function(fcount){
                // Fetch invite requests from server
                var remove_cache = false;
                if(!fcount){
                    //remove_cache = true;
                    this.offset = 0;                              
                }
                else{
                    this.offset = this.offset + 30;                    
                }
                var _data = {offset:this.offset,subNum: this.sub.sub_id};                
               
                if(this._request && this.offset!==0){
                    this._request.abort();
                }                
                this._request = this.timeLineRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                        // Display items                                                                      
                       if(response.totalCount=="0"){
                          this.$timelineContainer.parent().hide();
                       }
                       this.app.showLoading(false,this.$el); 
                       this.$curLoad.hide();
                       for(var s=this.offset;s<collection.length;s++){
                            var timelineView = new TimeLineRowView({ model: collection.at(s),sub:this });                                                            
                            var model_date = this.getMonthYear(collection.at(s));
                            if(this.monthYear !==model_date){
                                this.monthYear = model_date;
                                this.$timelineContainer.append(this.timeStamp(this.monthYear));                                                                                               
                            }      
                            this.$timelineContainer.append(timelineView.$el);                                                       
                        }    
                         /*-----Remove loading------*/
                                 this.app.removeSpinner(this.$el);
                               /*------------*/
                        if(collection.length<parseInt(response.totalCount)){                            
                            this.$(".filter-row").last().attr("data-load","true");
                        }
                        else{
                           if(this.sub.sub_fields){ 
                            this.$timelineContainer.append($('<div class="filter-row signedup"><div class="filter-cont"> <h4>Signed Up on '+this.getMonthYear(this.sub.sub_fields.creationDate,true)+'</h4> </div></div>'));                                                        
                           }
                           else{
                               this.$timelineContainer.append($('<div class="filter-row signedup"><div class="filter-cont"> <h4>Signed Up on </h4> </div></div>'));                                                        
                           }
                        }
                        
                    }, this),
                    error: function (collection, resp) {
                            
                    }
                });
            }
             /**
             * Fetching Future timeline from server.
            */,
            fetchTimeLineFuture:function(fcount){
                // Fetch invite requests from server
                var remove_cache = false;
                if(!fcount){                    
                    this.offsetFuture = 0;                              
                }
                else{
                    this.offsetFuture = this.offsetFuture + 30;
                }
                var _data = {offset:this.offsetFuture,subNum: this.sub.sub_id};                
               
                if(this._request && this.offsetFuture!==0){
                    this._request.abort();
                }                
                this._request = this.timeLineRequestFuture.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                        // Display items                                                                      
                        if(response.totalCount=="0"){
                            this.$timelineFuture.parent().hide();
                        }
                       this.app.showLoading(false,this.$el); 
                       for(var s=this.offsetFuture;s<collection.length;s++){
                            var timelineView = new TimeLineRowView({ model: collection.at(s),sub:this });                                                            
                            var model_date = this.getMonthYear(collection.at(s));
                            if(this.monthYear !==model_date){
                                this.monthYear = model_date;
                                this.$timelineFuture.prepend(this.timeStamp(this.monthYear));                                                                    
                            }      
                            this.$timelineFuture.prepend(timelineView.$el);                                                                               
                        }
                        this.$timelineFuture.find(".load-more-future").remove();
                        if(collection.length<parseInt(response.totalCount)){
                            var loadMoreBtn = this.loadMoreFuture();                        
                            this.$timelineFuture.prepend(loadMoreBtn);   
                            loadMoreBtn.click(_.bind(this.fetchTimeLineFuture,this,20));
                        }   
                                               
                        
                    }, this),
                    error: function (collection, resp) {
                            
                    }
                });
            }
             /**
             * Fetching current server time.
            */
            ,
            fetchTime:function(){
               this.app.showLoading("Loading Timeline...",this.$el);  
               var URL = '/pms/io/getMetaData/?type=time&BMS_REQ_TK='+this.app.get('bms_token');
                jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){
                    var _json = jQuery.parseJSON(xhr.responseText);
                    if(this.app.checkError(_json)){
                        return false;
                    }
                    var _date = moment(this.app.decodeHTML(_json[0]),'YYYY-M-D H:m'); 
                    this.$timelineContainer.append(this.timeStamp( _date.format("hh:mm A, DD MMM YYYY"),true));
                    
                    this.fetchTimeLineFuture();
                    this.fetchTimeLine();
                    
                },this));  
            },
             /**
            * Fetch next actviities on scroll and resize.
            *
            * @returns .
            */
            liveLoading:function(){
                var $w = $(window);
                var th = 200;
                var inview = this.$(".current .filter-row").last().filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                   this.$curLoad.show();                         
                   this.fetchTimeLine(20);
                }  
            },
            
            getMonthYear:function(model,isValue){
                var val = isValue?model:model.get("logTime");
                var _date = null;
                if(isValue){
                    _date = moment(this.app.decodeHTML(val),'YYYY-M-D H:m');
                }
                else{
                   _date = moment(this.app.decodeHTML(val),'M/D/YYYY H:m');
                }
                return _date.format("MMM YYYY");
            },
            timeStamp:function(monthYear,current){
                var _now = current ? 'now':'';
                return $('<div class="timestop '+_now+'"><span>'+monthYear+'</span> </div>');
            }
            ,
            loadMoreFuture:function(){                
                return $('<div class="timestop load-more-future"><span class="ellipsis" >Load More...</span></div>');
            }
            
        });
});