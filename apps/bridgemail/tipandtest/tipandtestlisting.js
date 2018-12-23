define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!tipandtest/html/tipandtestlisting.html',  'tipandtest/tipandtest_row','tipandtest/collections/tipandtestlisting','tipandtest/collections/tracks','tipandtest/track_row_makesbridge','tipandtest/collections/workflows','tipandtest/workflow_row'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template, tipandtestRowView , tipandtestCollection, tracksCollection, trackRowMakesbrdige, workflowsCollection, workflowRowMakesbridge) {
            'use strict';
            return Backbone.View.extend({
                id: 'tip_test_listings',
                tags: 'div',
                events: {
                    "click #addnew_campaign": function () {                        
                    },
                    "click #clearcal": function (obj) {                       
                    },
                    "click .refresh_btn": function () {                        
                    }                                        
                },                        
                initialize: function () {
                    this.template = _.template(template);
                    this.tracksRequestBMS = new tracksCollection();
                    this.workflowsRequestBMS = new workflowsCollection();
                    //this.singlelistingCollection = new singlelistingCollection();
                    this.tiptestCollection = new tipandtestCollection();
                    /*var tiptestArray = [
                               {tipid:'tipntest-toggle-three',name:'Proven Process 3',title:'Are you getting the most from your contact research teams?',sub_title: '', url: 'tipandtest/tipandtest3'},
                               {tipid:'tipntest-toggle-two',name:'Proven Process 2',title:'Are you getting the most from your contact research teams?',sub_title: '', url: 'tipandtest/tipandtest2'},
                               {title: '', sub_title: '', }
                            ]*/
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;
                    this.$campaginLoading = this.$(".loadmore");
                    this.offset = 0;
                    this.offsetLength = 0;
                    this.total_fetch = 0;
                    //this.status = "A";
                    this.toDate = '';
                    this.type = 'getMessageList';
                    this.fromDate = '';
                    this.searchTxt = '';
                    this.subjectlinkVal = false;
                    this.subjectText = '';
                    this.isSubjectText = false;
                    this.timeout = null;
                    this.total_Count = null;
                    this.subNum = '';
                    this.returnDataValue = '';
                    var camp_obj = this;
                    this.template_id='';
                    this.templateView  = '';
                    this.searchBadgeTxt = '';
                    
                    camp_obj.getalltipandtest();
                    
                    this.fetchBmsWorkflow();
                    camp_obj.app.showLoading("Loading Playbooks...", camp_obj.$("#target-camps"));
                    camp_obj.$el.find('div#campslistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        gridcontainer: camp_obj.$el.find(".target-listing"),
                        // searchFunc: _.bind(this.searchEmails, this),
                       // clearFunc: _.bind(this.clearSearchEmails, this),
                        placeholder: 'Search Playbooks',
                        showicon: 'yes',
                        iconsource: 'wtab-tipntestlisting',
                        countcontainer: 'no_of_camps'
                    });

                    camp_obj.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                   
                    this.current_ws = this.$el.parents(".ws-content");
                    this.tagDiv = this.current_ws.find("#campaign_tags");
                    $(window).scroll(_.bind(this.liveLoading, this));
                    $(window).resize(_.bind(this.liveLoading, this));
                    this.app.scrollingTop({scrollDiv: 'window', appendto: this.$el});
                        
                    this.tagDiv.hide();
                },
                getalltipandtest: function () {                                                               
                    this.app.showLoading(false, this.$("#target-camps"));                    
                    var _data ;                            
                    this.tiptestCollection = this.tiptestCollection.fetch({data: _data,
                            success: _.bind(function (data1, collection) {
                               this.$("#total_templates strong.badge").html(collection.totalCount);
                                _.each(data1.models, _.bind(function (model) {
                                    this.$el.find('#camp_list_grid tbody').append(new tipandtestRowView({model: model, sub: this}).el);
                                }, this));

                                 this.app.showLoading(false, this.$("#target-camps"));
                                 /*-----Remove loading------*/
                                    this.app.removeSpinner(this.$el);
                                    /*------------*/
                            },this)


                    });
                  _.each(this.tiptestCollection.models, _.bind(function (model) {
                      

                    }, this));
                },
                
                liveLoading: function () {
                    var $w = $(window);
                    var th = 200;
                    var inview = this.$("#camp_list_grid tbody tr:last").filter(function () {
                        var $e = $(this),
                                wt = $w.scrollTop(),
                                wb = wt + $w.height(),
                                et = $e.offset().top,
                                eb = et + $e.height();
                        return eb >= wt - th && et <= wb + th;
                    });
                    if (inview.length && inview.attr("data-load") && this.$el.height() > 0) {
                        inview.removeAttr("data-load");
                        this.type = 'getMessageList';
                        //this.getalltipandtest(this.offsetLength);
                    }
                },
                searchEmails: function (o, txt) {
                    
                    this.type = '';
                    this.searchTxt = txt;
                    this.total_fetch = 0;
                    this.type = 'searchMessage';
                    if (this.subjectlinkVal) {
                        this.isSubjectText=true;
                        this.getalltipandtest();
                        this.subjectlinkVal = false;
                    } else {
                        var keyCode = this.app.validkeysearch(o);
                        if (keyCode) {
                            if ($.trim(this.searchTxt).length > 0) {

                                this.timeout = setTimeout(_.bind(function () {
                                    clearTimeout(this.timeout);
                                    this.getalltipandtest();
                                }, this), 500);
                            }
                            this.$('#campslistsearch input').keydown(_.bind(function () {
                                clearTimeout(this.timeout);
                            }, this));
                        } else {
                            return false;
                        }

                    }

                },
                /**
                 * Clear Search Results
                 * 
                 * @returns .
                 */
                clearSearchEmails: function () {

                    this.searchTxt = '';
                    this.total_fetch = 0;
                    this.type = 'getMessageList';
                    this.getalltipandtest();
                },
                showTotalCount: function (count) {

                 
                    var _text = parseInt(count) <= "1" ? "Email" : "Emails";
                    var text_count = '<strong class="badge">' + this.app.addCommas(count) + '</strong>';
                    
                     if (this.fromDate && this.toDate) {
                        var toDate = moment(this.app.decodeHTML(this.toDate),'M/D/YYYY');														
                        var toDateFormat = toDate.format("DD MMM, YY");
                         var fromDate = moment(this.app.decodeHTML(this.fromDate),'M/D/YYYY');														
                        var fromDateFormat = fromDate.format("DD MMM, YY");
                        this.$("#total_templates").html(text_count + _text + " sent from '<b>" + fromDateFormat + ' - ' + toDateFormat  +"</b>'");
                    }else if(this.fromDate){
                         var fromDate = moment(this.app.decodeHTML(this.fromDate),'M/D/YYYY');														
                        var fromDateFormat = fromDate.format("DD MMM, YY");
                        this.$("#total_templates").html(text_count + _text + " sent from '<b>" + fromDateFormat +"</b>'");
                    }
                    else if (this.searchTxt && this.isSubjectText) {
                        this.$("#total_templates").html(text_count + _text + " found containing Subject '<b>" + this.searchTxt + "</b>'");
                        this.isSubjectText = false;
                    }
                    else if(this.searchTxt){
                        this.$("#total_templates").html(text_count + _text + " found containing text '<b>" + this.searchTxt + "</b>'");
                    }
                    else {
                        this.$("#total_templates").html(text_count + _text);
                    }
                    if(this.searchBadgeTxt){
                        this.$("#total_templates").html(text_count +  this.searchBadgeTxt +" "+ _text);
                        this.searchBadgeTxt = '';
                    }

                },
            /**
             * Fetching contacts list from server.
            */
            fetchBmsTracks:function(fcount){
                // Fetch invite requests from server
                    var remove_cache = false;
                    if(!fcount){
                        remove_cache = true;
                        this.offset = 0;                        
                        this.app.showLoading("Loading Playbooks...", this.$("#target-camps"));          
                        this.$(".bms_tracks .notfound").remove();
                    }
                    else{
                        this.offset = this.offset + 20;
                    }
                    var _data = {offset:this.offset,type:'list',isAdmin:'Y'};

                    if(this.tracks_bms_request){
                        this.tracks_bms_request.abort();
                    }                
                    this.$("#total_bms_tracks").hide();
                    this.makesbridge_tracks = true;
                    this.tracks_bms_request = this.tracksRequestBMS.fetch({data:_data,remove: remove_cache,
                        success: _.bind(function (collection, response) {                                
                            // Display items
                            if(this.app.checkError(response)){
                                return false;
                            }
                            this.app.showLoading(false,this.$("#target-camps"));                                                                         
                            this.showBmsTotalCount(parseInt(response.count)+this.total_Count);

                            //this.$contactLoading.hide();

                            for(var s=this.offset;s<collection.length;s++){
                                var trackView = new trackRowMakesbrdige({ model: collection.at(s),sub:this });                                                            
                                trackView.on('tagbmsclick',_.bind(this.searchByTagBms,this));
                                this.$el.find('#camp_list_grid tbody').append(trackView.$el);
                            }                        

                            if(collection.length<parseInt(response.totalCount)){
                                this.$tracksBmsContainer.last().attr("data-load","true");
                            } 
                            

                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                },
                fetchBmsWorkflow:function(fcount){
                // Fetch invite requests from server
                    var remove_cache = false;
                    if(!fcount){
                        remove_cache = true;
                        this.offset = 0;                        
                        this.app.showLoading("Loading Playbooks...", this.$("#target-camps"));          
                        this.$(".bms_tracks .notfound").remove();
                    }
                    else{
                        this.offset = this.offset + 20;
                    }
                    var _data = {offset:this.offset,type:'list',admin:true};

                    if(this.workflows_bms_request){
                        this.workflows_bms_request.abort();
                    }                
                    this.$("#total_bms_tracks").hide();
                    this.makesbridge_tracks = true;
                    this.workflows_bms_request = this.workflowsRequestBMS.fetch({data:_data,remove: remove_cache,
                        success: _.bind(function (collection, response) {                                
                            // Display items
                            if(this.app.checkError(response)){
                                return false;
                            }
                            this.app.showLoading(false,this.$("#target-camps"));   
                            this.total_Count = parseInt(response.length)+3;
                            this.showBmsTotalCount(this.total_Count);

                            //this.$contactLoading.hide();

                            for(var s=this.offset;s<collection.length;s++){
                                var workflowView = new workflowRowMakesbridge({ model: collection.at(s),sub:this });                                                            
                                //trackView.on('tagbmsclick',_.bind(this.searchByTagBms,this));
                                this.$el.find('#camp_list_grid tbody').append(workflowView.$el);
                            }                                                
                            
                            this.fetchBmsTracks();    
                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                },
                searchByTagBms:function(tag){                              
                   this.$(".bms_tracks #bms-nurture-search").val("Tag: "+tag);
                   this.$(".bms_tracks .bms-nurture-search #clearsearch").show();
                   this.$("#bms_nurturetrack_grid tr").hide();
                   var count = 0;
                   this.$("#bms_nurturetrack_grid tr").filter(function() {
                        var tagExist = false;
                        $(this).find(".tagscont li").each(function(i){
                            $(this).removeHighlight();
                            if($.trim($(this).text()).toLowerCase() == $.trim(tag).toLowerCase()){
                                $(this).highlight(tag);	
                                tagExist = true;
                            }
                        });                    
                        if(tagExist){
                            count++;
                            return $(this);
                        }
                   }).show();
                   this.$(".total-bms-count").html(count);
                   this.$(".total-bms-text").html('Playbooks <b>found for tag &lsquo;' + tag + '&rsquo;</b>');
                },
                showBmsTotalCount: function(count){
                    this.$("#total_templates .badge").html(count);
                }
            });
        });
