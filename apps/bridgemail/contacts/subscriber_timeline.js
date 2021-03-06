define(['contacts/collections/subscriber_timeline','contacts/collections/subscriber_timeline_future','text!contacts/html/subscriber_timeline.html','contacts/timeline_row','contacts/timeline_filter'],
function (Timeline,TimelineFuture,template,TimeLineRowView,filterDialog) {
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
              'click .show-all':'showAll',
              'click .show-advance':'openFilterDialog'
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
                this.sub.enqueueAjaxReq.push(this.timeLineRequestFuture);
                this.monthYear = "";
                this.filter = {filterType:"",filerEvents:""};
                this.render();                 
                //this.model.on('change',thi.renderRow,this);
            },
            /**
             * Render view on page.
            */
            render: function () {                                    
                this.$el.html(this.template({                 
                }));                
                this._request = null;
                this.$timelineFuture = this.$(".timeline-container .future");
                this.$timelineContainer = this.$(".timeline-container .current");
                this.$curLoad = this.$(".loadmore");
                this.initControls();    
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
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
                this.app.scrollingTop({scrollDiv:'window',appendto:this.sub.$el});
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
                    this.timeLineRequest = new Timeline(); 
                    this.$timelineContainer.children().not('.timestop.now').remove();
                    this.$curLoad.show();
                    remove_cache=true;   
                }
                else{
                    this.offset = this.offset + 30;                    
                }
                var _data = {offset:this.offset,subNum: this.sub.sub_id};                
                
                if(this.timelineFilter){
                    _data['timelineFilter'] =this.timelineFilter;
                    if(this.timelineFilter=="N" && this.campNum){
                        _data['campNums'] =this.campNum;
                    }
                    else if(this.timelineFilter=="W" && this.workflowId){
                        _data['workflowId'] =this.workflowId;
                    }else if(this.timelineFilter=="B" && this.botId){
                        _data['botId'] =this.botId;
                    }else if(this.timelineFilter=="T" && this.trackId){
                        _data['trackId'] =this.trackId;
                    }
                }
                 if(this.activityType){
                    _data['activityType'] =this.activityType;
                }
                if(this.campNum){
                    _data['campNums'] =this.campNum;
                }
               
                if(this._request && this.offset!==0){
                    this._request.abort();
                }                
                this._request = this.timeLineRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                        // Display items                                                                      
                       if(response.totalCount=="0"){
                          this.$timelineContainer.hide();
                          this.$(".notfound").show();
                       }
                       else{
                           this.$timelineContainer.show();
                           this.$(".notfound").hide();
                       }
                       this.app.showLoading(false,this.$el); 
                       this.$curLoad.hide();
                       this.$(".total-count").html( this.app.addCommas(response.totalCount))
                       for(var s=this.offset;s<collection.length;s++){
                            var timelineView = new TimeLineRowView({ model: collection.at(s),sub:this });                                                            
                            var model_date = this.getMonthYear(collection.at(s));
                            if(this.monthYear !==model_date){
                                this.monthYear = model_date;
                                //this.$timelineContainer.append(this.timeStamp(this.monthYear));                                                                                               
                            }
                            if(this.validEvent(collection.at(s))){
                                this.$timelineContainer.append(timelineView.$el);                                                       
                            }
                        }    
                         /*-----Remove loading------*/
                                 this.app.removeSpinner(this.$el);
                               /*------------*/
                        if(collection.length<parseInt(response.totalCount)){                            
                            this.$(".act_row").last().attr("data-load","true");
                        }
                        else{
                           if(this.sub.sub_fields){ 
                                this.$timelineContainer.append($('<div class="startflag"><div class="icon start"></div> <h5>Joined on '+this.getMonthYear(this.sub.sub_fields.creationDate,true)+'</h5></div>'));                                                        
                           }
                           else{
                               this.$timelineContainer.append($('<div class="startflag"><div class="icon start"></div> <h5>Signed Up</h5></div>'));                                                        
                           }
                        }
                        
                    }, this),
                    error: function (collection, resp) {
                            
                    }
                });
                // add into enqueueAjax Request
                this.sub.enqueueAjaxReq.push(this._request); 
               
            },
            validEvent: function(model){
                var isValid = true;
                
                if(model.get("activityType")=="SC" && model.get("score")=="0"){
                    isValid = false;
                }
                
                return isValid;
            }
             /**
             * Fetching Future timeline from server.
            */,
            fetchTimeLineFuture:function(fcount){
                // Fetch invite requests from server
                var remove_cache = false;
                if(!fcount){                    
                    this.offsetFuture = 0;      
                    this.$timelineContainer.children().not('.timestop').remove();
                    this.timeLineRequestFuture = new TimelineFuture(); 
                    remove_cache=true;                    
                }
                else{
                    this.offsetFuture = this.offsetFuture + 30;
                }
                var _data = {offset:this.offsetFuture,subNum: this.sub.sub_id};                
                if(this.timelineFilter){
                    _data['timelineFilter'] =this.timelineFilter;
                    if(this.timelineFilter=="N" && this.campNum){
                        _data['campNums'] =this.campNum;
                    }
                    else if(this.timelineFilter=="W" && this.workflowId){
                        _data['workflowId'] =this.workflowId;
                    }
                }
                if(this.activityType){
                    _data['activityType'] =this.activityType;
                }
                if(this._request && this.offsetFuture!==0){
                    this._request.abort();
                }                
                this._request = this.timeLineRequestFuture.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                        // Display items                                                                      
                        if(response.totalCount=="0"){
                            this.$timelineFuture.hide();
                        }
                       this.app.showLoading(false,this.$el); 
                       for(var s=this.offsetFuture;s<collection.length;s++){
                            var timelineView = new TimeLineRowView({ model: collection.at(s),sub:this,future:true });                                                            
                            var model_date = this.getMonthYear(collection.at(s));
                            if(this.monthYear !==model_date){
                                this.monthYear = model_date;
                                //this.$timelineFuture.prepend(this.timeStamp(this.monthYear));                                                                    
                            }      
                            if(this.validEvent(collection.at(s))){
                                this.$timelineFuture.prepend(timelineView.$el);                                                                               
                            }
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
                this.sub.enqueueAjaxReq.push(this._request);
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
                var inview = this.$(".current .act_row").last().filter(function() {
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
                if(isValue){
                    return _date.format("DD MMM YYYY")+" at "+ _date.format("hh:mm A");
                }
                else{
                    return _date.format("MMM YYYY");
                }
            },
            timeStamp:function(monthYear,current){
                var _now = current ? 'now':'';
                return $('<div class="timestop '+_now+'"><span>'+monthYear+'</span> </div>');
            }
            ,
            loadMoreFuture:function(){                
                return $('<div class="timestop load-more-future"><span class="ellipsis" >Load More...</span></div>');
            },
            openFilterDialog:function(){
                var dialog = new filterDialog({callBack:_.bind(this.searchAdvance,this),filter:this.filter});
                $("body").append(dialog.$el);
            },
            searchCampaign:function(campNum){
                this.timelineFilter = "N";
                this.campNum = campNum;
                this.trackId =this.workflowId=this.botId = null;                
                this.activityType = null;               
                this.fetchTimeLine();                
            },
            searchWorkflow:function(workFlowId){
                this.timelineFilter = "W";
                this.trackId =this.botId=this.campNum = null;
                this.activityType = null;
                this.workflowId = workFlowId;
                this.fetchTimeLineFuture();
                this.fetchTimeLine();                
            },
            searchAutobot:function(botId){
                this.timelineFilter = "B";
                this.botId = botId;
                this.trackId =this.workflowId=this.campNum = null;                
                this.activityType = null;               
                this.fetchTimeLineFuture();
                this.fetchTimeLine();                 
            },
            searchNurturetrack:function(trackId){
                this.timelineFilter = "T";
                this.trackId = trackId;
                this.workflowId =this.botId=this.campNum = null;
                this.workflowId = null;
                this.activityType = null;               
                this.fetchTimeLine();                 
            },
            searchMessage:function(type,campNum){
                this.timelineFilter =type;
                this.campNum = campNum;
                this.activityType = null;   
                if(type=="W"){
                    this.fetchTimeLineFuture();
                }
                this.fetchTimeLine();  
            }
            ,searchAdvance:function(event,activityType){
                if(event){
                    this.timelineFilter = event;
                    this.filter.filterType = event;
                }                                
                this.trackId =this.workflowId =this.botId=this.campNum = null;
                this.activityType= activityType;
                this.filter.filerEvents = activityType;
                if(event=="SU"){
                    this.timelineFilter = null;
                    this.activityType= event;
                }
                if(event!=="N" && event!=="SU" && this.isFutureEvent(activityType)){                    
                    this.fetchTimeLineFuture();
                }
                this.fetchTimeLine();                
            },
            showAll:function(){
                this.timelineFilter = null;
                this.trackId =this.workflowId =this.botId=this.campNum = null;
                this.activityType = null;                
                this.fetchTimeLineFuture();
                this.fetchTimeLine(); 
            },
            isFutureEvent:function(activityType){
                var isFutureEvent = false;
                if(activityType!==""){
                    var activityArray = activityType.split(",");
                    for(var i=0;i<activityArray.length;i++){
                        if(activityArray[i]=="CS" || activityArray[i]=="A"|| activityArray[i]=="SC"){
                            isFutureEvent = true;
                            break;
                        }
                    }
                                   }                
                return isFutureEvent;
            }
            
            
        });
});