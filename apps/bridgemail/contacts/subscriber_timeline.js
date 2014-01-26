define(['contacts/collections/subscriber_timeline','text!contacts/html/subscriber_timeline.html','contacts/timeline_row','moment'],
function (Timeline,template,TimeLineRowView,moment) {
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
            }
            /**
             * Fetching timeline from server.
            */
            ,
            fetchTimeLine:function(fcount,future){
                // Fetch invite requests from server
                var remove_cache = false;
                if(!fcount){
                    //remove_cache = true;
                    this.offset = 0;                              
                }
                else{
                    this.offset = this.offset + 20;
                }
                var _data = {offset:this.offset,subNum: this.sub.sub_id};
                if(future){
                    _data['future'] = future;
                }
               
                if(this._request && this.offset!==0){
                    this._request.abort();
                }                
                this._request = this.timeLineRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                        // Display items                                              
                        this.container = future?this.$timelineFuture:this.$timelineContainer;
                        if(response.totalCount=="0"){
                            this.container.parent().hide();
                        }
                       this.app.showLoading(false,this.$el); 
                        for(var s=this.offset;s<collection.length;s++){
                            var timelineView = new TimeLineRowView({ model: collection.at(s),sub:this });                                                            
                            var model_date = this.getMonthYear(collection.at(s));
                            if(this.monthYear !==model_date){
                                this.monthYear = model_date;
                                 if(future){
                                    this.container.prepend(this.timeStamp(this.monthYear));                                
                                 }
                                 else{
                                     this.container.append(this.timeStamp(this.monthYear));                                
                                 }
                            }      
                            if(future){
                                this.container.prepend(timelineView.$el);
                            }
                            else{
                                this.container.append(timelineView.$el);
                            }
                            
                        }                                                
                        if(collection.length<parseInt(response.totalCount)){
                            this.$(".filter-row").last().attr("data-load","true");
                        }                         
                        
                    }, this),
                    error: function (collection, resp) {
                            
                    }
                });
            },
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
                    
                    this.fetchTimeLine(0,'Y');
                    this.fetchTimeLine();
                    
                },this));  
            },
            getMonthYear:function(model){
                var _date = moment(this.app.decodeHTML(model.get("activityDate")),'YYYY-M-D H:m');
                return _date.format("MMM YYYY");
            },
            timeStamp:function(monthYear,current){
                var _now = current ? 'now':'';
                return $('<div class="timestop '+_now+'"><span>'+monthYear+'</span> </div>');
            }
            
        });
});