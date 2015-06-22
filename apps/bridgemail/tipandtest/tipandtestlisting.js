define(['jquery.bmsgrid', 'jquery.highlight', 'jquery.searchcontrol', 'text!tipandtest/html/tipandtestlisting.html',  'tipandtest/tipandtest_row'],
        function (bmsgrid, jqhighlight, jsearchcontrol, template, singlelistingRowView) {
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
                    camp_obj.$el.find('div#campslistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchEmails, this),
                        clearFunc: _.bind(this.clearSearchEmails, this),
                        placeholder: 'Search emails by subject',
                        showicon: 'yes',
                        iconsource: 'campaigns',
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
                            this.$("#camp_list_grid tbody").find('.loading-campagins').remove();
                            
                           
                            //console.log('offsetLength = '+ this.offsetLength + ' & total Fetch = ' + this.total_fetch);

                            this.app.showLoading(false, this.$("#target-camps"));
                            //this.showTotalCount(response.totalCount);
                           
                            //this.$campaginLoading.hide();
                           var tiptestArray = [{tipid:'tipntest-toggle-two',name:'Proven Process 2'},{tipid:'tipntest-toggle-one',name:'Proven Process 1'}];
                            _.each(tiptestArray, _.bind(function (val) {
                                this.$el.find('#camp_list_grid tbody').append(new singlelistingRowView({idrow: val, sub: this}).el);
                                    
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
