define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!tipandtest/html/tipandtestlisting.html',  'tipandtest/tipandtest_row','tipandtest/collections/tipandtestlisting'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template, tipandtestRowView , tipandtestCollection) {
            'use strict';
            return Backbone.View.extend({
                id: 'tip_test_listings',
                tags: 'div',
                events: {
                    "click #addnew_campaign": function () {
                        // this.createCampaign();
                    },
                    "click #clearcal": function (obj) {
                       // this.$el.find('#clearcal').hide();
                       // this.$el.find('#daterange').val('');
                       //  this.$('.ui-daterangepickercontain').find('li.ui-state-active').removeClass('ui-state-active')
                      //  this.findEmails(obj);
                    },
                    "click .refresh_btn": function () {
                        //this.app.addSpinner(this.$el);
                       // this.type='getMessageList';
                       // this.getallemails();
                       // this.headBadge();
                    },
                    
                    //"click .cstats .closebtn": "closeChart",
                    //"click .sortoption_expand": "toggleSortOption",
             },
             
            
                initialize: function () {
                    this.template = _.template(template);
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
                    camp_obj.app.showLoading("Loading Proven Process...", camp_obj.$("#target-camps"));
                    camp_obj.$el.find('div#campslistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        gridcontainer: camp_obj.$el.find(".target-listing"),
                        // searchFunc: _.bind(this.searchEmails, this),
                       // clearFunc: _.bind(this.clearSearchEmails, this),
                        placeholder: 'Search Proven Prcess',
                        showicon: 'yes',
                        iconsource: 'wtab-tipntestlisting',
                        countcontainer: 'no_of_camps'
                    });

                    camp_obj.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {
                   /* this.$el.find('#daterange').daterangepicker();
                    $(".btnDone").click(_.bind(this.findEmails, this));
                    $(".ui-daterangepicker li a").click(_.bind(function (obj) {
                        this.$el.find('#clearcal').show();
                        this.findEmails(obj);
                    }, this));
                    $("#daterange").keyup(_.bind(function (obj) {
                        this.findEmails(obj);
                    }, this));
                    // var camp_obj = this;
                    this.addEmail();
                    this.headBadge();*/
                    this.current_ws = this.$el.parents(".ws-content");
                    this.tagDiv = this.current_ws.find("#campaign_tags");
                    $(window).scroll(_.bind(this.liveLoading, this));
                    $(window).resize(_.bind(this.liveLoading, this));
                    this.app.scrollingTop({scrollDiv: 'window', appendto: this.$el});
                        /*-----Remove loading------*/
                                   this.app.removeSpinner(this.$el);
                                   /*------------*/
                    this.tagDiv.hide();
                },
                getalltipandtest: function () {
                    

                  
                            // Display items
                            
                            
                           
                            //console.log('offsetLength = '+ this.offsetLength + ' & total Fetch = ' + this.total_fetch);

                            this.app.showLoading(false, this.$("#target-camps"));
                            //this.showTotalCount(response.totalCount);
                           
                           
                            //console.log(this.tiptestCollection);
                            var _data ;
                            //this.$campaginLoading.hide();
                            this.tiptestCollection = this.tiptestCollection.fetch({data: _data,
                                    success: _.bind(function (data1, collection) {
                                       this.$("#total_templates strong.badge").html(collection.totalCount);
                                        _.each(data1.models, _.bind(function (model) {
                                            this.$el.find('#camp_list_grid tbody').append(new tipandtestRowView({model: model, sub: this}).el);
                                        }, this));
                                         this.app.showLoading(false, this.$("#target-camps"));
                                    },this)
                    
                    
                            });
                          _.each(this.tiptestCollection.models, _.bind(function (model) {
                              //  console.log(model);
                               // var mPage = new tipandtestRowView({model: model, sub: this}).el;
                               // this.$el.find('#camp_list_grid tbody').append(mPage);
                                    
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

                }
            });
        });
