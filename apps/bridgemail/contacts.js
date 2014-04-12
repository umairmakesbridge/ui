define(['jquery.searchcontrol','contacts/collections/subscribers','text!html/contacts.html','jquery.chosen','jquery.icheck','contacts/subscriber_row'],
function (jsearchcontrol,subscriberCollection,template,chosen,icheck,SubscriberRowView) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Contacts dashboard view, depends on search control, chosen control, icheck control
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            id: 'contacts_list',
            /**
             * Attach events on elements in view.
            */            
            events: {				
                'click .show-detail':function(obj){
                    var target = $.getObj(obj,"div");
                    if(target.attr("id")){
                       this.app.mainContainer.openSubscriber(target.attr("id"));
                    }
                }
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){
               _.bindAll(this, 'searchByTag','updateRefreshCount');  
               this.template = _.template(template);		
               //
               this.subscriberRequest = new subscriberCollection();                              
               this.offset = 0;               
               this.searchTxt = '';
               this.tagTxt = '';
               this.contacts_request = null;
               this.sortBy = 'lastActivityDate';
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));
               this.app = this.options.app;           
               
               this.$contactList = this.$(".contactsdiv");
               this.$contactLoading = this.$(".loadmore");
                               
               this.initControls();               
               this.fetchContacts();               
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,
            init:function(){
               this.current_ws = this.$el.parents(".ws-content");
               this.current_ws.find("#campaign_tags").hide();
               this.ws_header = this.current_ws.find(".camp_header .edited"); 
               
               this.addCountHeader();
               this.fetchCount();
            },
            addCountHeader:function(){
               var count_header =  '<ul class="c-current-status">';
                 count_header += '<li><span class="badge pclr18 tcount">0</span>Total Contacts</li>';
                 count_header += '<li><span class="badge pclr11 suppressCount">0</span>Suppressed</li>';
                 count_header += '<li style="display:none"><span class="badge pclr15 hiddenCount" >0</span>Hidden</li>';
                 count_header += '<li><span class="badge pclr23 addCount">0</span>Added in Last 24hrs </li>';
                 count_header += '</ul>';  
                 var $countHeader = $(count_header);                                                        
                 this.ws_header.append($countHeader);                  
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
               //Init Controls on page 
                this.$('input.checkpanel').iCheck({
                      checkboxClass: 'checkpanelinput',
                      insert: '<div class="icheck_line-icon"></div>'
               });
               
                this.$('input.checkpanel').on('ifChecked', _.bind(function(event){
                    this.$(".contact-row-check").iCheck('check');
                },this))
                
                this.$('input.checkpanel').on('ifUnchecked', _.bind(function(event){
                    this.$(".contact-row-check").iCheck('uncheck');  
                },this))

               //this.$(".filter-by").chosen({ width: "220px",disable_search: "true"});
               this.$(".recent-activities").chosen({ width: "220px",disable_search: "true"});
               this.$(".recent-activities").change(_.bind(this.sortContacts,this));
               this.$(".contact-search").searchcontrol({
                     id:'contact-search',
                     width:'180px',
                     height:'22px',
                     searchFunc:_.bind(this.searchContacts,this),
                     clearFunc:_.bind(this.clearSearchContacts,this),
                     placeholder: 'Search Contacts & Tags',                     
                     showicon: 'yes',
                     iconsource: 'subscribers'
              });
              $(window).scroll(_.bind(this.liveLoading,this));
              $(window).resize(_.bind(this.liveLoading,this));
              this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
            },
            /**
             * Fetching contacts list from server.
            */
            fetchCount:function(){
                var bms_token =this.app.get('bms_token');
                var _this = this;
                var URL = "/pms/io/subscriber/getData/?BMS_REQ_TK="+bms_token+"&type=getSAMSubscriberStats";
                jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){                    
                    _this.app.showLoading(false,_this.$el);   
                    var _json = jQuery.parseJSON(xhr.responseText); 
                    if(_this.app.checkError(_json)){
                        return false;
                    }
                    _.each(_json,function(value,key){
                         _this.ws_header.find("."+key).html(_this.app.addCommas(value));
                    });
                    
                }),this); 
            },
            /**
             * Fetching contacts list from server.
            */
            fetchContacts:function(fcount){
                // Fetch invite requests from server
                var remove_cache = false;
                if(!fcount){
                    remove_cache = true;
                    this.offset = 0;
                    this.$contactList.children(".contactbox").remove();
                    this.app.showLoading("Loading Contacts...",this.$contactList);             
                    this.$(".notfound").remove();
                }
                else{
                    this.offset = this.offset + 20;
                }
                var _data = {offset:this.offset};
                if(this.searchTxt){
                    _data['searchValue'] = this.searchTxt;
                }
                else if(this.tagTxt){
                    _data['searchTag'] = this.tagTxt;
                }
                delete _data['order'];
                if(this.sortBy){
                    if(this.sortBy=='firstName'){
                        _data['order'] = 'asc';
                        _data['orderBy'] = this.sortBy;
                    }
                    _data['orderBy'] = this.sortBy;
                }
                if(this.contacts_request){
                    this.contacts_request.abort();
                }
                this.$(".refreshbtn").show();
                this.$("#total_templates").hide();
                this.contacts_request = this.subscriberRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                        // Display items
                        if(this.app.checkError(response)){
                            return false;
                        }
                        this.app.showLoading(false,this.$contactList);                                                                         
                        this.showTotalCount(response.totalCount);
                        
                        this.$contactLoading.hide();
                        
                        for(var s=this.offset;s<collection.length;s++){
                            var subscriberView = new SubscriberRowView({ model: collection.at(s),sub:this });                                
                            subscriberView.on('tagclick',this.searchByTag);
                            subscriberView.on('updatecount',this.updateRefreshCount);
                            this.$contactLoading.before(subscriberView.$el);
                        }                        
                        
                        if(collection.length<parseInt(response.totalCount)){
                            this.$(".contactbox").last().attr("data-load","true");
                        } 
                        if(collection.length==0){
                            var search_message  ="";
                            if(this.searchTxt){
                              search_message +=" containing '"+this.searchTxt+"'" ;
                            }
                            this.$contactLoading.before('<p class="notfound">No Contacts found'+search_message+'</p>');
                        }                               
                        
                    }, this),
                    error: function (collection, resp) {
                            
                    }
                });
            },
             /**
            * Fetch next records on scroll and resize.
            *
            * @returns .
            */
            liveLoading:function(){
                var $w = $(window);
                var th = 200;
                var inview = this.$(".contactbox").last().filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                   this.$contactLoading.show();                         
                   this.fetchContacts(20);
                }  
            },
             /**
            * Search contacts function binded with search control
            *
            * @param {o} textfield simple object.             
            * 
            * @param {txt} search text, passed from search control.
            * 
            * @returns .
            */
            searchContacts:function(o,txt){
                this.tagTxt = '';
                this.searchTxt = txt;                                
                if(o.keyCode==13 && this.searchTxt){
                    if(this.searchTxt.indexOf("Tag: ")>-1){
                       var tagName = this.searchTxt.split(": ");
                       this.searchByTag(tagName[1]);
                    }
                    else{
                        this.fetchContacts();
                    }
                   
                }                
            },
             /**
            * Clear Search Results
            * 
            * @returns .
            */
            clearSearchContacts:function(){
                this.tagTxt = '';
                this.searchTxt = '';                
                this.fetchContacts();                
            },
            /**
            * Sort contacts by selected sort type from selectbox
            * 
            * @returns .
            */
            sortContacts:function(){                                
                this.sortBy = this.$(".recent-activities").val();
                this.fetchContacts();
            }
            ,
            showTotalCount:function(count){
                this.$(".refreshbtn").hide();
                this.$("#total_templates").show();
                this.$(".total-count").html(this.app.addCommas(count));                        
                if(this.ws_header.find(".tcount").html()=="0"){
                    this.ws_header.find(".tcount").html(this.app.addCommas(count));                        
                }
                var _text = count=="1"?"Contact":"Contacts";
                if(this.tagTxt){
                    this.$(".total-text").html(_text+" found containing tag '<b>"+this.tagTxt+"</b>'");
                }
                else if(this.searchTxt){
                    this.$(".total-text").html(_text+" found containing text or tag '<b>"+this.searchTxt+"</b>'");
                }
                else{
                    this.$(".total-text").html(_text)
                }     
                this.$("#total_selected").hide();
            },
            searchByTag:function(tag){
               this.searchTxt = '';
               this.$("#contact-search").val("Tag: "+tag);
               this.$("#clearsearch").show();
               this.tagTxt = tag;
               this.fetchContacts();
            },
            updateRefreshCount:function(){                
               var checked_count = this.$(".contact-row-check:checked").length;                
               if(checked_count>0){
                   this.$("#total_templates").hide();
                   this.$("#total_selected").show();
                   this.$(".total-selected-count").html(checked_count);
                   var _text = checked_count>1 ?"contacts":"contact";
                   this.$(".total-selected-text").html(_text+" selected");
               }
               else{
                   this.$("#total_templates").show();
                   this.$("#total_selected").hide();
               }
            }
        });
});