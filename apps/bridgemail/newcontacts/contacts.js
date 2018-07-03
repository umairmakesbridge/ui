define(['newcontacts/collections/subscribers','text!newcontacts/html/contacts.html','newcontacts/subscriber_row','newcontacts/multipleadd', 'newcontacts/collections/tasks', 'newcontacts/task_row'],
function (subscriberCollection,template,SubscriberRowView,addContactView,tasksCollection, taskRowView) {
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
                
                    "click .refresh_btn": function () {
                        this.app.addSpinner(this.$el);
                        this.fetchContacts();
                    },
                    "click .searchbtn": function (e) {
                        this.searchTxt = this.$("#contact-search").val();
                        if (this.searchTxt) {
                            this.search("click")
                        }
                    },
                    "paste .search-control": function (e) {
                        this.searchTxt = this.$("#contact-search").val();
                        if (this.searchTxt) {
                            this.search("paste")
                        }
                    },
                    "click .toggletags": function (event) {
                        this.$('.contacts-switch .status_tgl a').removeClass('active');
                        $(event.currentTarget).addClass('active');
                        if (this.$('#contact-search').val().length > 0) {
                            this.$('#contact-search').val('');
                            this.fetchContacts();
                        }
                        this.$('#contact-search').attr('placeholder', 'Search By Tags')
                        this.isSearchTag = true;
                    },
                    "click .togglecontact": function (event) {
                        this.$('.contacts-switch .status_tgl a').removeClass('active');
                        $(event.currentTarget).addClass('active');
                        this.$('#contact-search').val('');
                        this.$('#contact-search').attr('placeholder', 'Search By Contacts')
                        if (this.$('#contact-search').val().length > 0) {
                            this.$('#contact-search').val('');
                            this.fetchContacts();
                        }
                        this.isSearchTag = false;
                    },
                    "click .toggletoday": function (event) {
                        this.$('.tasks-switch .status_tgl a').removeClass('active');
                        $(event.currentTarget).addClass('active');

                    },
                    "click .toggleall": function (event) {
                        this.$('.tasks-switch .status_tgl a').removeClass('active');
                        $(event.currentTarget).addClass('active');
                    },
              "click .contact-group button":"changeContactDetails",
              "click .task-panel":'populateTasks'
            },
            
             basicFields: {"firstName": {"label": "First Name"}, "lastName": {"label": "Last Name"}, "company": {"label": "Company"}, "areaCode": {"label": "Area Code"}, "telephone": {"label": "Telephone"},
                    "email": {"label": "Email"}, "city": {"label": "City"},
                    "country": {"label": "Country"}, "state": {"label": "State"}, "zip": {"label": "Zip"}, "address1": {"label": "Address 1"}, "address2": {"label": "Address 2"},
                    "jobStatus": {"label": "Job Status"}, "industry": {"label": "Industry"}, "salesRep": {"label": "Sales Rep"},
                    "source": {"label": "Source"}, "salesStatus": {"label": "Sales Status"}, "occupation": {"label": "Occupation"}, "birthDate": {"label": "Birthday"}},
            /**
             * Initialize view - backbone .
            */
            initialize:function(){
               _.bindAll(this, 'searchByTag','updateRefreshCount');  
               this.template = _.template(template);		
               //
               this.subscriberRequest = new subscriberCollection();
               this.tasksRequest = new tasksCollection();
               this.addContactView = null;
               this.offset = 0;               
               this.searchTxt = '';
               this.tagTxt = '';
               this.tempCount = null;
               this.filterBy = 'CK';
               this.contacts_request = null;
               this.sortBy = '';
               this.enqueueAjaxReq = [];
               this.isSearchTag = false;
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
               this.$el.html(this.template({}));
               this.app = this.options.app;        
               
               this.$contactList = this.$(".contact-list");
               this.$contactLoading = $("<li class='contact-li load-more-contacts'><div style='text-align:center'><img src='"+this.app.get('path')+"img/loading.gif' alt=''/></div></li>");
               this.isSalesforceUser = false;
                               
               this.initControls();      
               this.checkSalesforce();
               
               //this.fetchTasks();               
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,
            init:function(){
               this.current_ws = this.$el.parents(".ws-content");
               this.current_ws.find("#campaign_tags").hide();
               this.ws_header = this.current_ws.find(".camp_header .edited"); 
               //this.ws_header.find(".add-action").remove();
               this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});                 
               this.addCountHeader();
               this.fetchCount();
            },
            addCountHeader:function(){
               var count_header =  '<ul class="c-current-status">';
                 count_header += '<li search="T" ><span class="badge pclr18 tempCount tcount totalCount">0</span>Total Contacts</li>';
                 count_header += '<li search="S"><span class="badge pclr11 tempCount suppressCount">0</span>Suppressed</li>';
                 count_header += '<li style="display:none"><span class="badge pclr15 tempCount hiddenCount" >0</span>Hidden</li>';                 
                 count_header += '</ul>';  
                 var $countHeader = $(count_header);                                                        
                 this.ws_header.append($countHeader);
                 this.tempCount = this.ws_header.find('.tempCount').parent();
                 this.tempCount.click(_.bind(this.filterContacts, this));
                 this.$(".new-status .tempCount").parent().click(_.bind(this.filterContacts, this));
                 
                 this.current_ws.find("#addnew_action").attr("data-original-title", "Create New Contact").click(_.bind(this.addSubscriber, this));
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
               //Shared Contact box added. 
               this.$(".shared-select-box").chosen({ width: "140px",disable_search: "true"});
               
               this.$(".recent-activities").chosen({ width: "220px",disable_search: "true"});               
               this.$(".recent-activities").change(_.bind(this.sortContacts,this));
               this.$(".contact-search").searchcontrol({
                     id:'contact-search',
                     width:'280px',
                     height:'22px',
                     searchFunc:_.bind(this.searchContacts,this),
                     clearFunc:_.bind(this.clearSearchContacts,this),
                     placeholder: 'Search By Contacts',                     
                     showicon: 'yes',
                     iconsource: 'subscribers'
              });
              this.$contactList.scroll(_.bind(this.liveLoading,this));
              //$(window).resize(_.bind(this.liveLoading,this));
              this.app.scrollingTop({scrollDiv:'window',appendto:this.$el});
            },
            closeCallBack:function(){
                if(this.enqueueAjaxReq.length > 0){
                        for(var i=0;i < this.enqueueAjaxReq.length ; i++){
                                        
                        if(this.enqueueAjaxReq[i].readyState !== 4 && this.enqueueAjaxReq[i].status !== 200){
                            this.enqueueAjaxReq[i].abort();
                        }
                       //this.app.enqueueAjaxReq[i].abort();
                       var poped = this.enqueueAjaxReq.splice(i,1);
                       //console.log('Remaining enqueue obj',app.enqueueAjaxReq);
                    }   
                }
                      
            },
            checkSalesforce:function(){
                this.app.getData({
                        "URL":"/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=status",
                        "key":"salesfocre",
                        callback:_.bind(function(){
                            this.app.showLoading(false,this.$el);    
                            var sf = this.app.getAppData("salesfocre");
                            if(sf[0] == "err" ||sf.isSalesforceUser=="N"){
                              // this.loadSetupArea();  
                              this.fetchContacts();
                            }
                            else{
                                this.isSalesforceUser = true;
                                this.fetchContacts();
                            }
                        },this),
                        errorCallback:_.bind(function(){
                            this.app.showLoading(false,this.$el);                        
                           // this.loadSetupArea();  
                        },this)
                    });
            },
            fetchTasks: function (fcount) {
                    var remove_cache = false;
                    this.$(".tasks-listing .not-found").html("Loading...");
                    if (!fcount) {
                        remove_cache = true;
                        this.offset = 0;    
                        this.$('.tasks-listing .content-wrapper').children().remove();
                    } else {
                        this.offset = this.offset + 20;
                    }
                    var _data = {order: "desc",orderBy:"updationTime",offset:0,type:"getAllTask"};
                    _data["fromDate"] = moment().format("MM-DD-YYYY");
                    _data["toDate"] = moment().format("MM-DD-YYYY");
                                       
                    if (this.tasks_request) {
                        this.tasks_request.abort();
                    }
                    
                    
                    this.tasks_request = this.tasksRequest.fetch({data: _data, remove: remove_cache,
                        success: _.bind(function (collection, response) {
                            // Display items
                            if (this.app.checkError(response)) {
                                return false;
                            }
                            //this.app.showLoading(false, this.$contactList);
                                                        
                            for (var s = this.offset; s < collection.length; s++) {
                                var rowView = new taskRowView({model: collection.at(s), sub: this, fromDashboard: true});                                
                                this.$('.tasks-listing .content-wrapper').append(rowView.$el);                                
                            }
                            
                            if(collection.length==0){
                                this.$(".tasks-listing .not-found").show();                       
                                this.$(".tasks-listing .not-found").html("No Task found.")
                            }
                            else{
                                this.$(".tasks-listing .not-found").hide();  
                            }
                           

                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                    
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
                         _this.ws_header.find("."+key).parent().addClass(_this.app.getClickableClass(value));
                         _this.$(".new-status ."+key).html(_this.app.addCommas(value));
                         _this.$(".new-status ."+key).parent().addClass(_this.app.getClickableClass(value));
                    });
                     
                }),this); 
            },
            /**
             * Fetching contacts list from server.
            */
            fetchContacts:function(fcount){
                // Fetch invite requests from server
                this.showTasks(false);
                var remove_cache = false;
                if(!fcount){
                    remove_cache = true;
                    this.offset = 0;
                    this.$contactList.children(".contact-li").remove();
                    this.app.showLoading("Loading Contacts...",this.$contactList);             
                    this.$(".notfound").remove();
                    this.$('.filter_seven').parent().remove();
                }
                else{
                    this.offset = this.offset + 50;
                }
                var _data = {offset:this.offset};
                /*if(!this.sortBy){
                   this.filterBy="CK";
                }else{
                    this.filterBy="";
                }*/
                if(this.searchTxt){
                    _data['searchValue'] = this.searchTxt;
                    if(this.sortBy.split("_")[0]=="CK" || this.sortBy.split("_")[0]=="WV"){  
                        this.$('.recent-activities').val('lastActivityDate').trigger('chosen:updated');
                        this.sortBy = 'lastActivityDate';
                         this.filterBy = "";
                    }
                }
                else if(this.tagTxt){
                    _data['searchTag'] = this.app.decodeHTML(this.tagTxt);
                    this.sortBy = 'lastActivityDate';
                    this.filterBy = "";
                }
                 if((this.sortBy.split("_")[0]=="CK" || this.sortBy.split("_")[0]=="WV") && !this.searchTxt){
                            _data['filterBy'] = this.sortBy.split("_")[0];
                            _data['lastXDays'] = this.sortBy.split("_")[1];
                     }
                delete _data['order'];
                if(this.sortBy){
                    if(this.sortBy=='firstName'){
                        _data['order'] = 'asc';
                        _data['orderBy'] = this.sortBy;
                    }
                     
                          _data['orderBy'] = this.sortBy;
                     
                   
                }
                if(this.filterBy && this.filterBy != "T"){
                   _data['filterBy']  = this.filterBy;
                   if(this.filterBy==="CK" || this.filterBy==="WV"){
                       this.searchTxt = '';
                       this.$('#contact-search').val('');
                       this.$('#clearsearch').hide();
                       _data['lastXDays'] = 1;
                   }
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
                        
                        this.$(".load-more-contacts").remove();
                        if(collection.length!=0 && this.$el.find('.thumbnails.cards .open-csv').length == 0){
                        
                        //this.$('.thumbnails.cards').append('<li class="open-csv"><div style="height:;" class="thumbnail browse"><div style="" class="drag create"><span>Create New Contact </span></div></div></li>');
                        //this.$('.open-csv').click(_.bind(this.addSubscriber,this));    
                        }else if(collection.length==0){
                            this.$el.find('.thumbnails.cards .open-csv').remove();
                        }
                        for(var s=this.offset;s<collection.length;s++){
                            var subscriberView = new SubscriberRowView({ model: collection.at(s),sub:this ,app:this.app});    
                            //subscriberView.on('tagclick',this.searchByTag);
                            //subscriberView.on('updatecount',this.updateRefreshCount);
                            this.$('.contact-list').append(subscriberView.$el);
                            //subscriberView.tmPr.trimTags({maxwidth:345,innerElement:'.t-scroll li'});

                        }                        
                        /*-----Remove loading------*/
                            this.app.removeSpinner(this.$el);
                    /*------------*/
                       
                        if(collection.length<parseInt(response.totalCount)){
                            this.$(".contact-list li.contact-li").last().attr("data-load","true");
                        } 
                        if(collection.length==0){
                            this.$(".contact-list").removeClass("scroll-contact");
                            var search_message  ="";
                            if(this.searchTxt){
                              search_message +=" containing '"+this.searchTxt+"'" ;
                              
                            }
                            if(this.filterBy==="CK" && this.sortBy !=="CK_7"){
                                 this.$contactList.after('<p class="notfound">No Contacts found'+search_message+'</p><br/><p style="text-align:center;font-size: 15px;"><a class="filter_seven">Show last 7 days Clickers</a> | <a class="show_all_contacts">Show All Contacts</a></p>');
                                 this.$('.filter_seven').click(_.bind(function(){
                                     this.$('.recent-activities').val('CK_7').trigger('chosen:updated');
                                     this.$('.recent-activities option:nth-child(5)').trigger('change');
                                 },this))
                                 
                            }else{
                                  this.$('.filter_seven').parent().remove();
                                  this.$contactList.after('<p class="notfound">No Contacts found'+search_message+'</p>');
                            }
                            // Show all contact if zero clicker or visitors
                            this.$('.show_all_contacts').click(_.bind(function(){
                                     //this.$('.recent-activities').val('CK_7').trigger('chosen:updated');
                                     this.filterBy="T";
                                     this.sortBy = '';
                                     this.$el.parents('.ws-content.active').find('.c-current-status li.clickable_badge:first-child').addClass('font-bold');
                                    this.fetchContacts();
                                 },this))
                        }    
                        else{
                            this.$(".contact-list").addClass("scroll-contact");
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
                var th = 100;
                var inview = this.$(".contact-list li").last().filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                   this.$contactList.append(this.$contactLoading);                         
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
                this.filterBy = '';
                if(this.isSearchTag){
                   this.tagTxt = txt;
                  // var tagName = this.tagTxt.split(": ").length
                   //if( tagName.length > 1){
                     //  this.tagTxt = tagName[1];
                   //}
                   
                }else{
                   this.searchTxt = txt;  
                }
                this.sortBy = 'lastActivityDate';
                this.$('.recent-activities').val('lastActivityDate').trigger('chosen:updated');
                    this.search(o);                
            },
            search:function(o){
                if(this.searchTxt.indexOf("Tag: ")>-1 || this.isSearchTag == true){                    
                    this.timeout = setTimeout(_.bind(function() {
                        clearTimeout(this.timeout);

                        if(this.tagTxt === ""){
                            this.$('#contact-search').val('');
                            this.$('#clearsearch').click();
                        }else{
                            this.searchByTag(this.tagTxt);
                        }                
                    }, this), 500);
                    this.$('#contact-search').keydown(_.bind(function() {
                       clearTimeout(this.timeout);
                    }, this));
                 }
                 else{
                     var keyCode = this.keyvalid(o);
                        if(keyCode){
                            if ($.trim(this.searchTxt).length > 0) {
                                this.timeout = setTimeout(_.bind(function() {
                                    clearTimeout(this.timeout);
                                    this.fetchContacts();
                                }, this), 500);
                            }
                            this.$('#contact-search').keydown(_.bind(function() {
                                clearTimeout(this.timeout);
                            }, this));
                        }else{
                            return false;
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
                this.filterBy='';
                 if(this.sortBy.split("_")[0]=="CK" || this.sortBy.split("_")[0]=="WV"){
                     this.searchTxt = '';
                            this.$('#contact-search').val('');
                            this.$('#clearsearch').hide();
                 }
                this.fetchContacts();
            }
            ,
            filterContacts : function(obj){
                var target = $.getObj(obj,"li");
                if(!target.hasClass('clickable_badge')){return false;}
                target.parent().find('li.font-bold').removeClass('font-bold');
                target.addClass('font-bold');
                var targetName = target.attr('search');
                this.filterBy = targetName;
                 if(this.filterBy==="CK" || this.filterBy==="WV"){
                       this.searchTxt = '';
                       this.tagTxt = '';
                       this.$('#contact-search').val('');
                       this.$('#clearsearch').hide();
                   }else{
                       this.$('.recent-activities').val('lastActivityDate').trigger('chosen:updated');
                       this.sortBy = '';
                   }
                
                this.fetchContacts();
            },
            showTotalCount:function(count){
                this.$(".refreshbtn").hide();
                this.$("#total_templates").show();
                this.$(".total-count").html(this.app.addCommas(count));                        
                if(this.ws_header.find(".tcount").html()=="0"){
                    if(count==="0"){
                        this.fetchCount();
                    }else{
                        this.ws_header.find(".tcount").html(this.app.addCommas(count));     
                        this.ws_header.find(".tcount").parent().addClass(this.app.getClickableClass(count));
                    }
                }
                var _text = count=="1"?"Contact":"Contacts";
                var _clickers = count=="1"?"Clicker":"Clickers";
                var _visitor = count=="1"?"Visitor":"Visitors";
                if(this.tagTxt){
                    this.$(".total-text").html(_text+" found containing tag '<b>"+this.tagTxt+"</b>'");
                }
                else if(this.searchTxt){
                     /*===========Define Max widht for contact search=============*/
                                    var totalWidth = this.$el.parents('body').find('.ws-content.active').width();
                                    var rightW = parseInt(this.$('.srt-div').outerWidth()) + parseInt(this.$('.top-label').outerWidth())
                                    var leftW = ((totalWidth - rightW) - 5)/2
                                    this.$(".total-text").css('display','inline-flex');
                                    this.$(".total-text").html(_text+" found containing text '<b class='trim-text-search' style='max-width:"+leftW+"px'>"+this.searchTxt+"</b>'");
                     /* ==========================*/
                    
                        
                }else if(this.sortBy == 'score'){
                    this.$(".total-text").html(_text+" sorted out by '<b>"+this.sortBy+"</b>'");
                }
                else if(this.sortBy == 'firstName'){
                    this.$(".total-text").html(_text+" sorted out by '<b>First name</b>'");
                }
                 else if(this.sortBy == 'creationTime'){
                    this.$(".total-text").html(_text+" sorted out by '<b>Creation Date and Time</b>'");
                }
                 else if(this.filterBy==="CK" || this.sortBy.split("_")[0]=="CK"){
                     if(!this.sortBy.split("_")[1]){
                         this.$(".total-text").html(_clickers+" found in '<b>Last 24 hrs</b>'");
                     }else{
                         this.$(".total-text").html(_clickers+" found in '<b>Last "+this.sortBy.split("_")[1]+" days</b>'");
                     }
                    
                }else if(this.filterBy==="WV" || this.sortBy.split("_")[0]=="WV"){
                     if(!this.sortBy.split("_")[1]){
                         this.$(".total-text").html(_visitor+" found in '<b>Last 24 hrs</b>'");
                     }else{
                         this.$(".total-text").html(_visitor+" found in '<b>Last "+this.sortBy.split("_")[1]+" days</b>'");
                     }
                    
                }
                else{
                    this.$(".total-text").html(_text)
                }     
                this.$("#total_selected").hide();
            },
            searchByTag:function(tag){
                
               this.searchTxt = '';
               this.$("#contact-search").val(this.app.decodeHTML(tag));
               this.$("#clearsearch").show();
               this.tagTxt = this.app.encodeHTML(tag);
               $('.showtooltip').tooltip('hide');
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
            },
            keyvalid:function(event){
                if(event && (event=="click" || event=="paste")){
                    return true;
                }else {
                    var regex = new RegExp("^[A-Z,a-z,0-9]+$");
                    var str = String.fromCharCode(!event.charCode ? event.which : event.charCode);
                     if (event.keyCode == 8 || event.keyCode == 32 || event.keyCode == 37 || event.keyCode == 39) {
                        return true;
                    }
                    else if (regex.test(str)) {
                        return true;
                    }
                   else{
                        return false;
                    }
                }
                event.preventDefault();
            },
            addSubscriber: function(){                 
                   $("body #new_autobot").remove();
                   $("body .autobots-modal-in").remove();
                   $('body').append('<div class="modal-backdrop  in autobots-modal-in"></div>');
                   $("body").append("<div id='new_autobot' style='width: 710px;  top: 120px;left:50%' class='modal in'><div class='modal-body' style='min-height: 300px;'></div></div>");
                   $("body #new_autobot").css("margin-left","-"+$("#new_autobot").width() / 2+"px");
                   this.app.showLoading("Loading....",$("body #new_autobot .modal-body"));
                   this.addContactView = new addContactView({ sub:this ,app:this.app}); 
                  // var addContactView = new addContactView({ sub:this ,app:this.app});  
                   $("body #new_autobot").html(this.addContactView.el);
            },
            changeContactDetails: function(e){
                var btn = $(e.target);
                if(!btn.hasClass("selected")){
                    this.selectContactTab(btn.attr("id"));
                }
                
            },
            selectContactTab: function(buttonName){
                this.$(".contact-group button.selected").removeClass("selected");
                this.$(".contact-group button[id='"+buttonName+"']").addClass("selected");
                this.$(".activity-container > div").addClass("hide");
                this.$(".activity-container > div."+buttonName).removeClass("hide");
            },
            populateTasks: function(){
                this.showTasks(true);
            },
            showTasks: function(show){
                if(show){
                    this.$(".contacts-listing").addClass("hide");
                    this.$(".tasks-listing").removeClass("hide");
                }
                else{
                    this.$(".tasks-listing").addClass("hide");
                    this.$(".contacts-listing").removeClass("hide");
                }
            }
                 
        });
});