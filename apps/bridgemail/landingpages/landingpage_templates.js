define(['text!landingpages/html/landingpage_templates.html', 'landingpages/collections/landingpages', 'landingpages/landingpage_template_tile'],
        function(template,pagesCollection,landingPageTile) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Landing page template details
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({                               
                /**
                 * Attach events on elements in view.addRowMessage
                 */
                events: {                    
                  'click .refresh_templates':'refreshTemplates' 
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {             
                    this.app = this.options.app;
                    this.template = _.template(template);                                                           
                    this.pagesTemplateCollection = new pagesCollection();     
                    this.template_offset = 0;
                    this.total_template_fetch = 0;
                    this.scrollElement = this.options.scrollElement ? this.options.scrollElement :$(window);
                    this.loadingpages_template_request =  null;
                    this.templateSearchTxt = "";
                    this.dialog = this.options.dialog;
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function() {
                    this.$el.html(this.template({}));                                                            
                }
                ,
                /**
                 * Custom init function called after view is completely render in wrokspace.
                 */
                init: function() {                                       
                  this.scrollElement.scroll(_.bind(this.liveLoading,this));
                  this.scrollElement.resize(_.bind(this.liveLoading,this));
                  this.app.scrollingTop({scrollDiv:'window',appendto:this.$el,scrollElement:this.scrollElement});
                   this.$('div#pagestemplatelistsearch').searchcontrol({
                        id: 'list-search',
                        width: '300px',
                        height: '22px',
                        searchFunc: _.bind(this.searchTemplatePages, this),
                        clearFunc: _.bind(this.clearSearchTemplatePages, this),
                        placeholder: 'Search Template Landing Pages',
                        showicon: 'yes',
                        iconsource: 'lpage',
                        countcontainer: 'no_of_camps'
                    });
                  this.getTemplatesLandingPages();
                },
                refreshTemplates : function(){
                    this.getTemplatesLandingPages();
                },
                getTemplatesLandingPages: function(fcount){
                    if (!fcount) {
                        this.template_offset = 0;
                        this.total_template_fetch = 0;
                        this.app.showLoading("Loading Template Landing Pages...", this.$(".template-container"));
                        this.$(".thumbnails").children().remove();           
                        this.$(".notfound").hide();
                    }
                    else {
                        this.offset = parseInt(this.offset) + fcount;                      
                    }
                    if (this.loadingpages_template_request)
                    {
                        this.loadingpages_template_request.abort();
                    }
                    var _data = {offset: this.template_offset,type:'search',isAdmin:'Y'};                    
                                        
                    if (this.templateSearchTxt) {
                        _data['searchText'] = this.templateSearchTxt;
                    }                    
                    _data['bucket'] = 20;

                    this.loadingpages_request = this.pagesTemplateCollection.fetch({data: _data,
                        success: _.bind(function (data1, collection) {
                            // Display items
                            this.$("#templates_landingpages_grid tbody").find('.loading-campagins').remove();
                            if (this.app.checkError(data1)) {
                                return false;
                            }                            
                            this.total_template_fetch = this.total_template_fetch + data1.length;                            

                            this.app.showLoading(false, this.$(".template-container"));
                            
                            this.$("#total_templates_pages .badge").html(collection.totalCount);

                            this.showTotalCountTemplate(collection.totalCount);                            

                            _.each(data1.models, _.bind(function (model) {
                                this.$(".thumbnails").append(new landingPageTile({model: model, sub: this}).el);
                            }, this));
                                                      
                            
                            if (this.total_template_fetch < parseInt(collection.totalCount)) {
                                this.$(".thumbnails li").last().attr("data-load", "true");
                            }

                            if (parseInt(collection.totalCount) == 0) {
                                var search_message = "";
                                if (this.templateSearchTxt) {
                                    search_message += " containing '" + this.templateSearchTxt + "'";
                                }
                                this.$('#total_templates_pages').html('<p class="notfound nf_overwrite">No Template Landing page found' + search_message + '</p>');
                                this.$('#templates_landingpages_grid tbody').before('<p class="notfound">No Templates Landing page found' + search_message + '</p>');
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                    }); 
                },
                showTotalCountTemplate: function ( count ){
                    
                    var _text = parseInt(count) <= "1" ? "Template Landing page" : "Template Landing pages";
                   
                    var text_count = '<strong class="badge">' + this.app.addCommas(count) + '</strong>';

                    if (this.templateSearchTxt) {
                        this.$("#total_templates_pages").html(text_count + _text + " found containing text '<b>" + this.templateSearchTxt + "</b>'");
                    }
                    else {
                        this.$("#total_templates_pages").html(text_count + _text);
                    }
                },             
                liveLoading:function(){
                    var $w = $(window);
                    var th = 200;
                    var inview = this.$(".thumbnails li:last-child").filter(function() {
                        var $e = $(this),
                            wt = $w.scrollTop(),
                            wb = wt + $w.height(),
                            et = $e.offset().top,
                            eb = et + $e.height();

                        return eb >= wt - th && et <= wb + th;
                      });
                    if(inview.length && inview.attr("data-load") && this.$el.height()){
                       inview.removeAttr("data-load");
                       this.$(".footer-loading").show();
                       this.getTemplatesLandingPages(20); 
                    }  
                },               
                searchTemplatePages:function(o, txt){                    
                    this.templateSearchTxt = txt;
                    this.total_template_fetch = 0;                    
                    if (this.taglinkVal) {
                        this.getTemplatesLandingPages();
                        this.taglinkVal = false;
                    } else {
                        var keyCode = this.app.validkeysearch(o);
                        if (keyCode) {
                            if ($.trim(this.templateSearchTxt).length > 0) {
                                this.timeout2 = setTimeout(_.bind(function () {
                                    clearTimeout(this.timeout2);
                                    this.getTemplatesLandingPages();
                                }, this), 500);
                            }
                            this.$('#pagestemplatelistsearch input').keydown(_.bind(function () {
                                clearTimeout(this.timeout2);
                            }, this));
                        } else {
                            return false;
                        }

                    }
                },
                clearSearchTemplatePages: function(){
                    this.templateSearchTxt = '';
                    this.total_template_fetch = 0;                    
                    this.getTemplatesLandingPages();
                }
            });
        });