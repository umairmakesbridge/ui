
define(['text!campaigns/html/schedule_campaign.html','jquery.calendario'],
function (template,calendario) {
      /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        //  Schedule Calender view 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            tagName:'div',
            
            /**
             * Attach events on elements in view.
            */
            events: {
                 'click .scheduled-campaign': 'scheduleCamp',
                 'click .draft-campaign':'setDraftCampaign',
                 'click .sch-btn-later':'showCalendar',
                 'click .sch-btn-now':'scheduleCampNow',
                 'click .closebtn':'closeDialog',
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.parent;
                    this.app = this.options.app;
                    this.currentState = this.options.currentStates;
                    this.CampObjData = null;
                    this.campNum = this.options.campNum;
                    this.rescheduled = this.options.rescheduled
                    this.hidecalender = this.options.hidecalender
                    this.scheduleFlag = this.options.scheduleFlag;
                    this.recipientDetial = "";
                    this.sendNow = false;
                    this.snServerDate = "";
                    this.tagTxt = '';
                    this.render();
                    //this.model.on('change',this.renderRow,this);
            },
              /**
             * Render view on page.
            */
            render: function () {                    
                
               this.$el.html(this.template({
                    model: this.model
                }));
               
                //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});

                this.initControls();  
               
            },   
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.app.showLoading("Loading Calender...",this.$(".schedule-panel")); 
                this.loadCampgin();
                
                if(this.scheduleFlag !== 'reschedule' && this.scheduleFlag !== 'schedule'){
                    this.$('input.radiopanel').iCheck({
                        radioClass: 'radiopanelinput',
                        insert: '<div class="icheck_radio-icon"></div>'
                    });
                    this.$('input.radiopanel').on('ifChecked', _.bind(function(event){
                        if($(event.target).val()=="SL"){
                            this.$el.find('.sch-btn-now').addClass('disabled-btn');
                             this.sendNow = false; 
                            this.$('.disabled-sch-wrap').hide();
                        }else{
                             this.$el.find('.sch-btn-now').removeClass('disabled-btn');
                             this.sendNow = true; 
                            this.$('.disabled-sch-wrap').show();
                        }
                      },this));

                }

            },
           loadCampgin:function(){
                   var URL = '/pms/io/getMetaData/?type=time&BMS_REQ_TK='+this.app.get('bms_token');
                   var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.campNum+"&type=basic";
                   jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            this.CampObjData = jQuery.parseJSON(xhr.responseText);
                            if(this.app.checkError(this.CampObjData)){
                                return false;
                            }
                            
                            this.fetchServerTime();
                        }
                   },this));
           },
           fetchServerTime:function(){
                   var URL = '/pms/io/getMetaData/?type=time&BMS_REQ_TK='+this.app.get('bms_token');
                   jQuery.getJSON(URL, _.bind(function(tsv, state, xhr){
                        if(xhr && xhr.responseText){
                            var _json = jQuery.parseJSON(xhr.responseText);
                            if(this.app.checkError(_json)){
                                return false;
                            }
                            this.loadCalender(_json[0]);
                            this.scheduleReschedule();
                        }
                   },this));
           },
           loadCalender:function(dateTime){
                        this.app.showLoading(false,this.$(".schedule-panel"));
                        var serverDate = moment(this.app.decodeHTML(dateTime),"YYYY-M-D H:m");
                        this.serverDate = serverDate;
                        this.createCalender(new Date(serverDate.format("MMMM DD, YYYY HH:mm")));  
                        this.currentState.datetime['day'] = this.currentState.cal.today.getDate();
                        this.currentState.datetime['month'] = this.currentState.cal.today.getMonth()+1 
                        this.currentState.datetime['year'] = this.currentState.cal.today.getFullYear();
                        var hour = this.currentState.cal.today.getHours();
                        var min = this.currentState.cal.today.getMinutes();
                        if(hour>=12){
                            var hour = hour-12;                            
                            this.$(".timebox-hours button.pm").addClass("active");
                        }
                        else{
                            this.$(".timebox-hours button.am").addClass("active");
                        }

                        hour = hour==0 ? "12":hour;                        

                        this.$(".timebox-hour").spinner({max: 12,min:1,start: function( event, ui ) {

                        }});
                        this.$(".timebox-min").spinner({max: 59,min:0,stop: function( event, ui ) {
                               if($(this).val().length==1){
                                   $(this).val("0"+$(this).val())
                               }
                        }});
                        var hour = this.addZero(hour);
                        this.$(".timebox-hour").val(hour);
                        this.$(".timebox-min").val(min.toString().length==1?("0"+min):min);
                    
                },
               createCalender:function(_date){
                     var self = this;
                     var transEndEventNames = {
                            'WebkitTransition' : 'webkitTransitionEnd',
                            'MozTransition' : 'transitionend',
                            'OTransition' : 'oTransitionEnd',
                            'msTransition' : 'MSTransitionEnd',
                            'transition' : 'transitionend'
                    },
                    transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
                    $wrapper = this.$( '#custom-inner' ),
                    $calendar = this.$( '#calendar' ),
                    cal = $calendar.calendario( {
                    onDayClick : function( $el, $contentEl, dateProperties ) { 
                            
                            if($el.hasClass("fc-disabled")===false){
                               if(self.options.rescheduled){
                                   self.$('#calendar').find("div.sch-selected").removeClass("sch-selected"); 
                                   $el.addClass("sch-selected");
                               }else{
                                self.$('#calendar').find("div.selected").removeClass("selected"); 
                               $el.addClass("selected");   
                               }
                               self.currentState.datetime['day'] = dateProperties.day;
                               self.currentState.datetime['month'] = dateProperties.month; 
                               self.currentState.datetime['year'] = dateProperties.year;
                            }                                
                            if( $contentEl.length > 0 ) {
                                    showEvents( $contentEl, dateProperties );
                            }

                    },                                    
                    displayWeekAbbr : true,
                    setDate : _date
                    } ),
                    $month = this.$( '#custom-month' ).html( cal.getMonthName()),
                    $year = this.$( '#custom-year' ).html(cal.getYear());
                    
                    function updateMonthYear() {        
                            $month.html( cal.getMonthName() +" "+cal.getYear());
                            $year.html("");
                    }

                    // just an example..
                    function showEvents( $contentEl, dateProperties ) {
                        hideEvents();
                        var $events = $( '<div id="custom-content-reveal" class="custom-content-reveal"><h4>Campaigns for ' + dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year + '</h4></div>' ),
                         $close = $( '<span class="icon close custom-content-close "></span>' ).on( 'click', hideEvents );
                         $events.append( $contentEl.html() , $close ).insertAfter( $wrapper );
                         setTimeout( function() {
                                $events.css( 'top', '0%' );
                        }, 25 );

                    }
                    function hideEvents() {
                        var $events = $( '#custom-content-reveal' );
                        if( $events.length > 0 ) {

                                $events.css( 'top', '100%' );
                                Modernizr.csstransitions ? $events.on( transEndEventName, function() { $( this ).remove(); } ) : $events.remove();

                        }
                    }
                   this.currentState.cal = cal;
                    this.$( '#custom-next' ).on( 'click', function() {
                            cal.gotoNextMonth( updateMonthYear );
                    } );
                    this.$( '#custom-prev' ).on( 'click', function() {
                            cal.gotoPreviousMonth( updateMonthYear );
                    } );
                },
                showCalendar:function(){
                    this.$el.find('.col2').removeClass('adjwidth-col2');
                    this.$el.parents('body').find('.reschedule-dialog-wrap').css({'width':'560px','margin-left':'-280px'});
                   
                   this.sendNow = false; 
                   this.$el.find('.greenbtn-wrap-outer').hide();
                    this.$el.find('.greenbtn-wrap').fadeIn();
                   this.$el.parents('body').find("#schedule-panel-1 .col1").delay(400).show("slide", { direction: "right" }, 1000);
                },
                scheduleCampNow: function(event){
                  if(!$(event.currentTarget).hasClass('disabled-btn') && !$(event.currentTarget).hasClass('send-confirm')){
                      this.sendNow = true;  
                     
                      this.getScheduleDate(event); 
                      this.scheduleCamp(event);
                  }
                  
                },
               scheduleCamp:function(event){
                 
                
                   this.app.showLoading("Confirmation Dialog...",this.$(".schedule-panel")); 
                   this.draftstate = false; 
                   var URL = '';
                   
                   
                   
                    var currentServerDateHObj = moment(this.serverDate, ["YYYY-M-D H:m:s"]);
                            var currentServerDateHFormat = currentServerDateHObj.format('YYYY-M-D H:m:s a');
                            var currentServerDateH = moment(currentServerDateHFormat, 'YYYY-M-D H:m:s a');
                            //console.log(this.currentState.datetime);
                            var dayDate = this.currentState.datetime.day;
                                if(parseInt(dayDate) <= 9){
                                    dayDate = "0"+dayDate;
                                }
                            var month = this.currentState.datetime.month;
                            if(parseInt(month) <= 9){
                                    month = "0"+month;
                                }
                            var year = this.currentState.datetime.year;
                            var caldate = year+'-'+month+'-'+dayDate;   
                            var currentSelectedDateH = moment(caldate + " " +this.$('.timebox-hour').val()+":"+this.$('.timebox-min').val()+":00" + " " + this.$('.timebox-hours .active').text().toLowerCase(), 'YYYY-M-D H:m:s a');

                            
                           var diffMins = currentSelectedDateH.diff(currentServerDateH, 'minutes') // 31
                           //console.log(diffMins);

                           if(diffMins < -30){
                               this.app.showAlert('Danger ! Selected Date is Less than current','body');
                               this.app.showLoading(false,this.$(".schedule-panel")); 
                               return false;
                           }
                   
                   var currentElement = $(event.currentTarget);
                   if(!currentElement.hasClass('saving') && !currentElement.hasClass('lst-sch-btn-now')){
                       currentElement.addClass('saving').css('background-position','115px center');
                   }
                    if(this.parent.model){ // Call From campaign listings
                            this.SendNowConfirmDialogLst(currentElement)
                           
                   }else{ // Call with in campagin
                           
                          
                        this.sendNowConfimDialogCmp(currentElement);
                       
                   }
               },
               /*
                * 
                * @ Get Encode value of Recipienst 
                * 
                */
               getReciepientsEncodes : function(URL){
                   var camp_obj = this;
                   var source_type = this.parent.model.get('recipientType').toLowerCase();
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        camp_obj.app.showLoading(false, camp_obj.$el.parents(".ws-content"));
                        if (xhr && xhr.responseText) {
                            var rec_josn = jQuery.parseJSON(xhr.responseText);
                            if (camp_obj.app.checkError(rec_josn)) {
                                return false;
                            }
                            if (source_type == "highrise") {
                                if(rec_josn.filterType =="tag"){
                                    camp_obj.gethrTagName(rec_josn);
                                }else{
                                  camp_obj.confirmationDialog(rec_josn,false,'crm');  
                                }
                                
                            }
                            if (source_type == "google") {
                              if(rec_josn.filterType =="sheet"){
                                 camp_obj.getgoTagName(rec_josn);
                              }else{
                                 camp_obj.confirmationDialog(rec_josn,false,'crm');
                              }
                                
                            }

                            camp_obj.recipientDetial = rec_josn;

                            if (rec_josn.type) {
                                if (rec_josn.type.toLowerCase() == "list") {

                                    if (rec_josn.count !== "0") {
                                        camp_obj.showRecList(rec_josn);
                                        /*$.each(rec_josn.listNumbers[0], function(index, val) { 
                                         camp_obj.$(".step3 #area_choose_lists .col1 tr[checksum='"+val[0].checksum+"'] .move-row").click();
                                         })*/
                                    }
                                    else
                                    {
                                        camp_obj.app.showLoading(false,camp_obj.$(".schedule-panel"));
                                        camp_obj.app.showAlert('No reciepients found',$("body"),{fixed:true});
                                    }
                                }
                                else if (rec_josn.type.toLowerCase() == "target") {
                                    if (rec_josn.count !== "0") {
                                        camp_obj.showRecTarget(rec_josn);
                                        /* $.each(rec_josn.filterNumbers[0], function(index, val) { 
                                         camp_obj.$(".step3 #area_choose_targets .col1 tr[checksum='"+val[0].checksum+"'] .move-row").click();
                                         })*/
                                    }
                                    else
                                    {
                                        camp_obj.app.showLoading(false,camp_obj.$(".schedule-panel"));
                                        camp_obj.app.showAlert('No reciepients found',$("body"),{fixed:true});
                                       // camp_obj.$(".step3 #area_choose_targets .rightcol tbody").append('<div style="padding: 20px;" class="recp_empty_info"> <div style="width:auto;" class="messagebox info"><p>Don\'t worry about duplicates. only one message is sent to each email address</p></div></div>');
                                    }
                                }
                                else if (rec_josn.type.toLowerCase() == "tags") {
                                    var tags = rec_josn.targetTags.split(',');
                                    camp_obj.getCampTags(tags,rec_josn.targetTags);
                                    for (var i = 0; i < tags.length; i++) {
                                       // camp_obj.$(".step3 #area_choose_tags .col1 li[checksum='" + tags[i] + "'] .move-row").click();
                                    }
                                }
                            }
                            else {
                                if (source_type == "salesforce") {
                                    
                                    if(rec_josn.sfCampaignId){
                                        camp_obj.getsfCampName(rec_josn);
                                    }else{
                                        camp_obj.confirmationDialog(rec_josn,false,'crm');
                                    }
                                    //camp_obj.setSalesForceData();
                                }
                                else if (source_type == "netsuite") {
                                    if(rec_josn.nsGroupId){
                                        camp_obj.getnsCampName(rec_josn);
                                    }else{
                                    camp_obj.confirmationDialog(rec_josn,false,'crm');
                                    }
                                    //camp_obj.setNetSuiteData();
                                }
                            }
                            
                        }
                    }).fail(function () {
                        console.log("Receipts data load failed");
                    });
               },
               /*
                * 
                * Generate Lists Recipients 
                */
               showRecList : function(lists){
                   var listArray = [];
                    var recipientArray = [];
                    var offset = 0;
                    
                    $.each(lists.listNumbers[0], function(index, val) { 
                                           listArray.push(val[0].encode);
                                         });
                      //console.log(listArray.toString());
                    //this.createRecipients(listArray)                     
                    //console.log(listArray.join());
                   var that = this;
                   var remove_cache = true;
                   //var _data = {offset:offset,type:'list_csv',listNum_csv:listArray.join()};
                   var URL = "/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list_csv&listNum_csv="+listArray.join();
                   $.get( URL, function( data ) {
                    var rec_json = jQuery.parseJSON(data); 
                     $.each(rec_json.lists[0], function(index, val) { 
                                           recipientArray.push(val[0]);
                                         });
                       that.confirmationDialog(recipientArray);
                     //that.createRecipients(recipientArray) ;
                    });
                    
              },
               /*
                * 
                * Generate Targets Recipients 
                */
              showRecTarget : function(lists){
                   var _targetsArray = [];
                   var recipientArray = [];
                    var offset = 0;
                    $.each(lists.filterNumbers[0], function(index, val) { 
                                           _targetsArray.push(val[0].encode);
                                         });
                   var that = this;
                   var remove_cache = true;
                   //var _data = {offset:offset,type:'list_csv',filterNumber_csv:_targetsArray.join()};
                   
                   var URL = "/pms/io/filters/getTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list_csv&filterNumber_csv="+_targetsArray.join();
                   $.get( URL, function( data ) {
                    var rec_json = jQuery.parseJSON(data); 
                     $.each(rec_json.filters[0], function(index, val) { 
                                           recipientArray.push(val[0]);
                                         });
                            //console.log(recipientArray);             
                       that.confirmationDialog(recipientArray);
                     //that.createRecipients(recipientArray) ;
                    });
              },
               /*
               * Get all Tags of Campaign
               * 
               */
              getCampTags:function(tags,targetTags){
                  var _tagsArray = [];

                  var URL = "/pms/io/user/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=subscriberTagCountList";
                   $.get( URL, _.bind(function( data ) {
                    var rec_json = jQuery.parseJSON(data); 
                    for(var i=0;i<tags.length;i++){
                        $.each(rec_json.tagList[0], function(index, val) { 
                                           //recipientArray.push(val[0]);
                                           if(tags[i]==val[0].tag){
                                               _tagsArray.push(val[0]);
                                           }
                                           
                                         });
                    } 
                    //console.log(_tagsArray);
                    this.confirmationDialog(_tagsArray,targetTags); 
                      //console.log(recipientArray);             
                       //that.confirmationDialog(recipientArray);
                     //that.createRecipients(recipientArray) ;
                    },this));
              },
              /*
               * Get Campagin Name of Salesforce
               * 
               * 
               */
              getsfCampName:function(sfId){
                  var  _sfArray = {};
                  var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=sfCampaignList";
                   $.get( URL, _.bind(function( data ) {
                    var rec_json = jQuery.parseJSON(data); 
                    
                        $.each(rec_json.campList[0], function(index, val) { 
                                           //recipientArray.push(val[0]);
                                           if(sfId.sfCampaignId==val[0].sfCampaignID){
                                              _sfArray['sfObject'] = val[0].name;
                                              _sfArray['camp']='Campaign';
                                           }
                                           
                                         });
                     
                    
                    this.confirmationDialog(_sfArray,false,'crm');
                    //this.confirmationDialog(_tagsArray,targetTags); 
                      //console.log(recipientArray);             
                       //that.confirmationDialog(recipientArray);
                     //that.createRecipients(recipientArray) ;
                    },this));
              },
              /*
               * Get Netsuit Group Name
               * 
               */
              getnsCampName : function(nsId){
                  var  _sfArray = {};
                  var URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=nsGroupList";
                   $.get( URL, _.bind(function( data ) {
                    var rec_json = jQuery.parseJSON(data); 
                    
                        $.each(rec_json.groupList[0], function(index, val) { 
                                           //recipientArray.push(val[0]);
                                           if(nsId.nsGroupId==val[0].id){
                                              _sfArray['nsObject'] = val[0].name;
                                              _sfArray['camp']='Campaign';
                                           }
                                           
                                         });
                     
                    
                    this.confirmationDialog(_sfArray,false,'crm');
                    //this.confirmationDialog(_tagsArray,targetTags); 
                      //console.log(recipientArray);             
                       //that.confirmationDialog(recipientArray);
                     //that.createRecipients(recipientArray) ;
                    },this));
              },
              /*
               * Get Highrise Tage Name
               * 
               */
              gethrTagName:function(hrID){
                   var  _sfArray = {};
                  var URL = "/pms/io/highrise/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=hrTagList";
                   $.get( URL, _.bind(function( data ) {
                    var rec_json = jQuery.parseJSON(data); 
                    
                        $.each(rec_json.groupList[0], function(index, val) { 
                                           //recipientArray.push(val[0]);
                                           if(hrID.filterQuery==val[0].id){
                                              _sfArray['hrObject'] = val[0].name;
                                              _sfArray['camp']='Tag';
                                           }
                                           
                                         });
                     
                    
                    this.confirmationDialog(_sfArray,false,'crm');
                  
                    },this));
              },
              /*
               * Get Google Tage Name
               * 
               */
              getgoTagName:function(sheetID){
                   var  _sfArray = {};
                  var URL = "/pms/io/google/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=spreadsheetList";
                   $.get( URL, _.bind(function( data ) {
                    var rec_json = jQuery.parseJSON(data); 
                    
                        $.each(rec_json.spreadsheetList[0], function(index, val) { 
                                           //recipientArray.push(val[0]);
                                           if(sheetID.spreadsheetId==val[0].id){
                                              _sfArray['filterType'] = val[0].title;
                                              _sfArray['camp']='Spreadsheet';
                                           }
                                           
                                         });
                     
                    
                    this.confirmationDialog(_sfArray,false,'crm');
                  
                    },this));
              },
              /*
               * Create Confirmation Dialog;
               * 
               */
              confirmationDialog:function(recipientArray,targetTags,type){
                  this.app.showLoading(false,this.$(".schedule-panel")); 
                  var recipients = '';
                  var icontype = '';
                  var isCrmId=false;
                  var contactCount = 0;
                            if(type=="crm"){
                                    if(this.parent.model.get('recipientType').toLowerCase()=="salesforce"){
                                       icontype='salesforceSD';
                                       recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>"+recipientArray.sfObject+"</li>";
                                       
                                       if(recipients == "both"){
                                            recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>Leads & Contacts<li>";
                                        }
                                       if(recipientArray.camp){
                                            isCrmId = true;
                                        }
                                       contactCount = "Selected";
                                    }else if(this.parent.model.get('recipientType').toLowerCase()=="highrise"){
                                        icontype='highrise';
                                        recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>"+recipientArray.hrObject+"</li>";
                                        
                                        if(recipients == "People"){
                                            recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>Import all my records</li>";
                                        }
                                        if(recipientArray.camp){
                                            isCrmId = true;
                                        }
                                       contactCount = "Selected";
                                    }
                                    else if(this.parent.model.get('recipientType').toLowerCase()=="netsuite"){
                                        icontype='netsuite';
                                        recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>"+recipientArray.nsObject+"</li>";
                                        if(recipientArray.camp){
                                            isCrmId = true;
                                        }
                                       contactCount = "Selected";
                                    }
                                    else if(this.parent.model.get('recipientType').toLowerCase()=="google"){
                                         icontype='google';
                                        recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>"+recipientArray.filterType+"</li>";
                                        if(recipients == 'all'){
                                         recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>Import all google contacts</li>";   
                                        }
                                        contactCount = "Selected";
                                    }
                                }else{
                                 $.each(recipientArray,_.bind(function(key,val){
                                if(this.parent.model.get('recipientType')=="List"){
                                            contactCount =contactCount + parseInt(val.subscriberCount);
                                            icontype = 'list';
                                        }else if(this.parent.model.get('recipientType')=="Target"){
                                            contactCount =contactCount + parseInt(val.populationCount);
                                            icontype='target'
                                        }else if(this.parent.model.get('recipientType')=="Tags"){
                                            contactCount =contactCount + parseInt(val.subCount);
                                        }

                                      if(this.parent.model.get('recipientType')!=="Tags"){  
                                      if(recipients){
                                          recipients += "<li class='recepient_type'><i class='icon "+icontype+"'></i>"+val.name+"</li>";
                                      }else{
                                          recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>"+val.name+"</li>";
                                      }
                                  }
                                  },this));
                                  
                                  if(this.parent.model.get('recipientType')=="Tags"){
                                     var icontype ='tag';
                                     $.each(targetTags.split(','),function(key,val){
                                        if(recipients){
                                          recipients += "<li class='recepient_type'><i class='icon "+icontype+"'></i>"+val+"</li>";
                                      }else{
                                          recipients = "<li class='recepient_type'><i class='icon "+icontype+"'></i>"+val+"</li>";
                                      } 
                                     })
                                     //recipients = targetTags;
                                  }
                            }
                           
                        
                  
                  this.$el.find('#schedule-panel-1').hide();
                  if(!recipientArray.camp){
                    recipientArray['camp'] = ''
                   }else{
                      recipientArray['camp'] = recipientArray.camp;
                  }
                  //console.log(contactCount);
                  
                  //console.log(recipients)
                  //recipients = recipients.replace(/,\s*$/, "");
                  this.$el.parents('body').find('.reschedule-dialog-wrap').addClass('schedule-confirm-dialog-wrap');
                  this.$el.parents('body').find('.reschedule-dialog-wrap').css({'margin-top': '-223px', 'max-height': '455px','min-height':'210px'});
                  var dayDate = this.currentState.datetime.day;
                        if(parseInt(dayDate) <= 9){
                            dayDate = "0"+dayDate;
                        }
                  if(this.sendNow){
                       this.$el.parents('body').find('.reschedule-dialog-wrap').css({'width':'560px','margin-left':'-280px'});
                       var currentServerDateHObj = moment(this.serverDate, ["YYYY-M-D H:m:s"]);
                            var currentServerDateHFormat = currentServerDateHObj.format('YYYY-MM-DD HH:mm:ss A');
                            
                       var appendHtml = '<div class="schedule-panel" id="schedule-panel-2" style="height:140px"><h1 style="color:#01AEEE;">Campaign Details:</h1><a class="closebtn closebtn-2" style="display:none;"></a><p class="note sch-note" style="padding-top: 8px;text-align:left;">Do you want to send campaign <b>\''+this.parent.model.get("name")+'\'</b>?</p><h4>Send to the following '+this.parent.model.get('recipientType')+ '&nbsp;'+recipientArray.camp+':</h4><ul>'+recipients+'</ul><p style="float: left;" class="">On</p><span class="schdate-span"><i style="background-color: transparent ! important; height: 18px; width: 22px;" class="icon schedulesn left"></i>'+currentServerDateHFormat+' PST</span><div class="clearfix"></div><div class="btns right" style="margin:10px 0"><a class="btn-green btn-run" ><span>&nbsp;&nbsp;&nbsp;Yes&nbsp;</span><i class="icon next"></i></a><a class="btn-gray btn-cancel closebtn-2"><span>No</span><i class="icon cross"></i></a></div></div>'
                      }else{
                       var appendHtml = '<div class="schedule-panel" id="schedule-panel-2" style="height:140px"><h1 style="color:#01AEEE;">Schedule Details:</h1><a class="closebtn closebtn-2" style="display:none;"></a><p class="note sch-note" style="padding-top: 8px;text-align:left;">Do you want to schedule campaign <b>\''+this.parent.model.get("name")+'\'</b>?</p><h4>Send to the following '+this.parent.model.get('recipientType')+ '&nbsp;'+recipientArray.camp+':</h4><ul>'+recipients+'</ul><hr><div class="clearfix"></div><p class="note" style="padding-top: 0px;text-align:left;margin-top:10px;"><p class="" style="float: left;">On</p> <span class="schdate-span"><i class="icon schedulesn left" style="background-color: transparent ! important; height: 18px; width: 22px;"></i>'+dayDate+'&nbsp;'+this.$el.parents('body').find('#custom-month').html()+' '+this.$el.parents('body').find('#custom-year').html()+' at '+this.$el.find('.schedule-panel .set-time .timebox-hour').val()+':'+this.$el.find('.schedule-panel .set-time .timebox-min').val()+'&nbsp;'+this.$el.find('.schedule-panel .set-time .timebox-hours .active').text()+' PST</span></p><p style="padding-top: 8px; text-align: left; float: left;padding-right:5px;" class="note">* The time is according to Pacific Standard Time  </p><div class="btns right" style="margin:0 0 10px;"><a class="btn-green btn-run"><span>&nbsp;&nbsp;&nbsp;Yes&nbsp;</span><i class="icon next"></i></a><a class="btn-gray btn-cancel closebtn-2"><span>No</span><i class="icon cross"></i></a></div></div>'
                      }
                  this.$el.parents('body').find('.reschedule-dialog-wrap').find('.scheduled-campaign').removeClass('saving')
                  this.$el.parents('body').find('.reschedule-dialog-wrap').find('.lst-sch-btn-nown').removeClass('saving')
                  this.$el.parents('body').find('.reschedule-dialog-wrap').find('.scheduled-campaign').removeAttr('style')
                  
                  this.$el.parents('body').find('.reschedule-dialog-wrap').append(appendHtml);
                  this.$el.find('btn-run').click(_.bind(function(){
                        //this.scheduledCampaign('S',"Scheduling Campaign...");   
                         this.getScheduleDate('',true)
                        this.$el.find('#schedule-panel-1').show();
                        this.$el.find('#schedule-panel-2').remove();
                  },this));
                  this.$el.parents('body').find('.reschedule-dialog-wrap .btn-run').click(_.bind(function(){
                      
                      this.$el.parents('body').find('.reschedule-dialog-wrap').css({'margin-top': '-223px', 'max-height': '455px','min-height':'455px'});
                        //this.scheduledCampaign('S',"Scheduling Campaign...");   
                        this.getScheduleDate('',true)
                        this.$el.parents('body').find('.reschedule-dialog-wrap #schedule-panel-1').show();
                        this.$el.parents('body').find('.reschedule-dialog-wrap #schedule-panel-2').remove();
                        if(this.sendNow){
                           this.$el.parents('body').find('.reschedule-dialog-wrap').css({'width':'auto','margin-left':'-170px','margin-top': '-223px', 'max-height': '455px','min-height':'455px'});
                        }else{
                           this.$el.parents('body').find('.reschedule-dialog-wrap').css({'width':'auto','margin-left':'-170px','margin-top': '-223px', 'max-height': '455px','min-height':'455px'});
                        }
                  },this));
                  this.$el.parents('body').find('.reschedule-dialog-wrap .closebtn-2').click(_.bind(function(){
                      if(this.sendNow){
                           this.$el.parents('body').find('.reschedule-dialog-wrap').css({'width':'auto','margin-left':'-170px','margin-top': '-223px', 'max-height': '455px','min-height':'455px'});
                        }else{
                           this.$el.parents('body').find('.reschedule-dialog-wrap').css({'width':'auto','margin-left':'-280px','margin-top': '-223px', 'max-height': '455px','min-height':'455px'});
                        }
                      this.$el.parents('body').find('.reschedule-dialog-wrap #schedule-panel-1').show();
                      this.$el.parents('body').find('.reschedule-dialog-wrap #schedule-panel-2').remove();
                  },this));
              },
              /*
               * 
               * Schedule Date 
               */
              getScheduleDate:function(event,isSave){
                  var url = "/pms/io/getMetaData/?type=time&BMS_REQ_TK="+this.app.get('bms_token');
                  $.post(url)
                    .done(_.bind(function(data) {                              
                       var data = jQuery.parseJSON(data);
                       
                        this.snServerDate = this.app.decodeHTML(data[0]);
                        if(isSave){
                            this.scheduledCampaign('S',"Scheduling Campaign...");   
                        }
                        
                   },this));
              },
               scheduledCampaign:function(flag,message){
                   var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                   var step4_obj = this.currentState.datetime;
                   var _date = step4_obj.year +"-"+this.addZero(step4_obj.month)+"-"+this.addZero(step4_obj.day); 
                   var _time = this.$(".timebox-hour").val();                   
                   var _hour = this.getHourForSchedule(_time);                    
                   _hour = this.addZero(_hour);
                   var _min = this.addZero(this.$(".timebox-min").val());
                   var time =  _hour+":"+_min+":00";                  
                   var camp_obj = this;
                   var parent_obj = this.parent;
                   var _ampm = $('.timebox-hours').find('.active').text().toLowerCase();
                   var serverDate = this.snServerDate.split(' ')[0];
                   //console.log(serverDate)
                   
                    if(_date && !this.sendNow){
                        /*var currentServerDate = serverDate.split('-');
                        var currentSelectedDate = _date.split('-');
                        var dateForServer = new Date();
                        currentServerDate = dateForServer.setFullYear(currentServerDate[0],(currentServerDate[1] - 1 ),currentServerDate[2]);
                        currentSelectedDate = dateForServer.setFullYear(currentSelectedDate[0],(currentSelectedDate[1] - 1 ),currentSelectedDate[2]);
                        */
                        
                        var currentServerDateHObj = moment(this.snServerDate, ["YYYY-M-D H:m:s"]);
                        var currentServerDateHFormat = currentServerDateHObj.format('YYYY-M-D H:m:s a');
                        var currentServerDateH = moment(currentServerDateHFormat, 'YYYY-M-D H:m:s a');
                        var currentSelectedDateH = moment(_date + " " +_time+":"+_min+":00" + " " + _ampm, 'YYYY-M-D H:m:s a');
                        
                        //console.log(currentServerDateH,currentSelectedDateH);
                       var diffMins = currentSelectedDateH.diff(currentServerDateH, 'minutes') // 31
                       console.log(diffMins);
                       
                       if(diffMins < -30){
                           this.app.showAlert('Danger ! Selected Date is Less than current','body');
                           return false;
                       }
                       
                       /*if(currentSelectedDate > currentServerDate){
                            console.log('Ok Selected Date is Greater than Server');
                        }else if(currentSelectedDate == currentServerDate){
                            console.log('Ok Selected Date is Equal than Server');
                        }else{
                            alert('Danger ! Selected Date is Less than Server');
                        }*/
                        
                        
                    }
                   //return false;
                  
                   var post_data = {"campNum": this.campNum,
                                    "type":"saveStep4",
                                    "status":flag                                    
                                    }
                   if(flag=='S'){
                       post_data["scheduleType"] = "scheduled";
                       if(this.snServerDate && this.sendNow){
                           post_data["scheduleDate"] =this.snServerDate;
                       }else{
                           post_data["scheduleDate"] =_date+" "+time;   
                       }
                                                        
                   } 
                   
                   var _message = message?message:'Changing mode...';
                   this.app.showLoading(_message,this.$el.parents(".ws-content"));  
                   $.post(URL,post_data)
                    .done(function(data) {                              
                        camp_obj.app.showLoading(false,camp_obj.$el.parents(".ws-content"));  
                        var camp_json = jQuery.parseJSON(data);                                                      
                        if(camp_json[0]!=="err"){      
                           if(flag=='S'){ 
                                camp_obj.rescheduled = true;
                                camp_obj.hidecalender = true;
                                camp_obj.currentState.camp_status = 'P';
                                //camp_obj.scheduleStateCamp();
                                //camp_obj.setScheduleArea();
                                if(camp_obj.sendNow){
                                    camp_obj.$el.find('.sch-btn-sm').addClass('disabled-btn send-confirm');
                                    //camp_obj.$el.find('.draft-sn-campaign').show()
                                    camp_obj.app.showMessge("Campaign Scheduled and Send Successfully!");
                                }else{
                                    camp_obj.showScheduleBox();
                                    camp_obj.app.showMessge("Campaign Scheduled Successfully!");
                                }
                                
                           }
                           else{
                                //camp_obj.$(".schedule-camp").show(); 
                                //camp_obj.$(".sch-made").hide();  
                                camp_obj.currentState.camp_status = 'D';
                               // camp_obj.setScheduleArea();
                                camp_obj.app.showMessge("Campaign is now in draft mode!");
                           }
                           camp_obj.app.removeCache("campaigns");
                           camp_obj.refreshList();
                           //parent_obj.refreshCampaignList();
                           
                        }
                        else{                                  
                            camp_obj.app.showAlert(camp_json[1],$("body"),{fixed:true});
                        }                        
                   });
                   //var campaign_listing = $(".ws-tabs li[workspace_id='campaigns']");
                   
               },
               refreshList : function(){
                   if(this.scheduleFlag === 'reschedule' || this.scheduleFlag === 'schedule'){
                        this.parent.sub.total_fetch = 0;
                        this.parent.sub.getallcampaigns();
                        this.parent.sub.headBadge();
                   }else {
                       this.parent.refreshCampaignList();
                   }
               },
                addZero:function(val){
                   val = val.toString().length==1?"0"+val:val;
                   return val;
               },
                
               getHourForSchedule:function(hour){                   
                   if(this.$(".timebox-hours button.pm").hasClass("active")){
                       if(parseInt(hour)<=11){
                          hour = parseInt(hour)+12;
                       }
                   }
                   else{
                       if(parseInt(hour)==12){
                           hour = "00";
                       }
                   }
                   return hour;
               },
                /*
                 * Schedule campaign button views
                 */
                scheduleStateCamp:function(){
                    if(this.rescheduled){
                        this.$(".draft-campaign").show();
                        this.$('.gotostep2,.gotostep1,.gotostep3').hide();
                        this.$el.parents('.ws-content.active').find('.backbtn').hide();
                        this.$el.parents('.ws-content.active').find('#workspace-header').attr('data-original-title','');
                        this.$el.parents('.ws-content.active').find('#workspace-header').unbind("click");
                        this.$el.parents('.ws-content.active').find('.addtag').hide();  
                        }else{
                        this.$(".draft-campaign").hide();
                        //this.$('.schedule-camp').show();
                        //this.$('.sch-made').hide();
                        this.$('.gotostep2,.gotostep1,.gotostep3').removeAttr('style');
                        this.$el.parents('.ws-content.active').find('#workspace-header').attr('data-original-title','Click to rename');
                        this.$el.parents('.ws-content.active').find('#workspace-header').bind("click",_.bind(function(e){
                            this.workspaceHeader(e);
                        },this));
                        this.$el.parents('.ws-content.active').find('.backbtn').show();
                        this.$el.parents('.ws-content.active').find('.addtag').show();
                    }
                    
                   if(this.hidecalender){
                       // this.$('.schedule-camp,.drf-sch-btn').hide(); // Hide Calender
                        
                        this.$('.sch-made').show();    
                    }else{
                        //this.$('.schedule-camp,.drf-sch-btn').show(); // Show Calender
                        //this.$('.sch-made').hide();
                    }
                  if(this.draftstate){
                      this.$('.schedule-camp,.drf-sch-btn').show(); // Show Calender
                        this.$('.sch-made').hide();
                        this.$('.draft-campaign').hide();
                  }
                },
                /*
                 * Schdule Area
                 */
                 setScheduleArea:function(){
                    if(this.currentState.camp_status!=='D'){
                        this.$(".draft-campaign").show();
                        this.$(".scheduled-campaign").show();
                    }
                    else{
                        this.$(".draft-campaign").hide();
                        this.$(".scheduled-campaign").show();
                    }
                },
                /*
                 * 
                 * @New Schedule Box Draft Details
                 */
                scheduleBoxDD: function(){
                    this.$('.scheduled').hide();
                    this.$('.reSch').show();
                    this.$('.reSch h3').html(this.CampObjData.name);
                },
                /*
                 * Show Schedule Box
                 */
                 showScheduleBox:function(){                   
                   var step4_obj = this.currentState.datetime;
                   this.$(".reSch").hide(); 
                   this.$('.scheduled').show();
                   //var camp_detail = '<strong>'+this.$el.parents(".ws-content").find("#workspace-header").html()+'</strong> Has been Scheduled to be sent on'; 
                   var camp_detail ='<h2>'+step4_obj.day+' '+this.app.getMMM(step4_obj.month-1)+' '+step4_obj.year+'</h2> <h3><span>at</span>'+this.$(".timebox-hour").val()+':'+this.$(".timebox-min").val()+' '+this.$(".timebox-hours button.active").html()+'</h3>'; 
                   this.$('.camp-sch-name').html(this.CampObjData.name);
                   this.$('.camp-sch-name,.schedule-detail a').show();
                   
                   this.$('.schedule-detail p').show();
                   this.$('.date-time').html(camp_detail);
                   //this.$(".sch-made").show(); 
               },
               setDraftCampaign:function(obj){
                    var button = $.getObj(obj,"a");
                    this.rescheduled = false;
                    if(button.hasClass("reschedule")){                            
                       this.$(".schedule-camp").show();
                       this.$(".sch-made").hide();
                       this.rescheduled = true;
                       this.hidecalender = false;
                       this.draftstate = false;
                       //this.setScheduleArea();
                    }
                    else  if(button.hasClass("edit")){
                       this.scheduledCampaign('D','Edit Campaign...'); 
                    }
                    else{
                        this.scheduledCampaign('D','Changing Campaign to Draft...');
                        this.draftstate = true;
                        this.hidecalender = false;
                    }
                    this.scheduleBoxDD();
                    this.closeDialog();
               },
               /*
                * Check view either Schedule or Reschdule
                */
               scheduleReschedule : function(){
                   if(this.scheduleFlag === 'schedule' || this.scheduleFlag === 'draft'){
                       this.scheduleBoxDD();
                   }else if(this.scheduleFlag === 'reschedule'){
                       this.reScheduleBoxDD();
                   }
               },
               /*
                * Resechulde Box
                */
               reScheduleBoxDD : function(){
                   this.$('.scheduled h3.camp-sch-name ').html(this.CampObjData.name);
                   var dateTime = this.CampObjData.scheduledDate;
                   //this.$(".timebox-hours button").removeClass('active');
                   //this.loadCalender(dateTime);
                    var serverDate = moment(this.app.decodeHTML(dateTime),"YYYY-M-D H:m");
                    //this.createCalender(new Date(serverDate.format("MMMM DD, YYYY")));
                    
                    this.$('.date-time h2').html(serverDate.format("MMMM DD, YYYY"));
                    this.$('.date-time h3').html('<span>at</span>'+this.$('.timebox-hour').val()+':'+this.$('.timebox-min').val()+' '+this.$('.timebox-hours .active').text());
                    this.setCalendar(serverDate);
                           
                   //console.log(this.CampObjData);
               },
               /*
                * Set Calendar 
                */
              setCalendar : function(scheduleDate){
                     //var scheduledDate = scheduleDate.format("YYYY-M-D H:m");
                     var serverDate = this.serverDate.format("YYYY-M-D H:m");
                     // Difference 
                     var date1 = moment(this.serverDate, 'YYYY-M-D H:m');
                     var date2 = moment(scheduleDate, 'YYYY-M-D H:m')
                     var diffMin = date2.diff(date1, 'minutes');
                     var diffHour = date2.diff(date1, 'hours');
                     var diffDays = date2.diff(date1, 'days');
                     var diffMonths = date2.diff(date1, 'months');
                     var diffYear = date2.diff(date1, 'years');
                     console.log('Diff Month :' + diffMonths + ' Diff Days : '+ diffDays + ' Diff Year ' + diffYear);
                       
                    
                     // Logic
                     var scheduleMonth = scheduleDate.format("M");
                     var scheduleYear = scheduleDate.format("YYYY");
                     var scheduleDay = scheduleDate.format("DD");
                     var currentDay = this.serverDate.format("DD");
                     var Day = parseInt(diffDays)+parseInt(currentDay);
                      
                     if((diffMonths > 0 && diffYear > 0) || Day > 31){
                              var cal = this.$('#calendar').calendario({displayWeekAbbr : true});
                              cal.goto( parseInt(scheduleMonth)-1, parseInt(scheduleYear));
                              this.$('#custom-month').text(scheduleDate.format("MMMM"));
                              this.$('#custom-year').text(scheduleDate.format("YYYY"));
                            //console.log ('Next Month' + Day);
                             if(diffDays > 0 ){
                                   $.each(this.$('.fc-row div span:first-child'),_.bind(function(key,value){
                                    if($(value).text() === scheduleDay){
                                        $(value).parent().addClass('sch-selected');
                                    }
                                },this));
                            }
                        }else{
                            //console.log('Same Month' + Day);
                            $.each(this.$('.fc-row div span:first-child'),_.bind(function(key,value){
                                    if($(value).text() === scheduleDay){
                                        $(value).parent().addClass('sch-selected');
                                    }
                            },this));
                    } 
              },
              closeDialog : function(){
                  this.$el.parents('body').find('.reschedule-dialog-wrap').parent().remove();
                  //this.$el.parents('body').find('.sch-overlay').remove();
              },
              /*
               * Schedule Dialog from Campaign Listings
               * 
               */
              SendNowConfirmDialogLst : function(){
                    var URL = '';
                    if(this.parent.model.get('recipientType')=="Salesforce"){
                           URL = "/pms/io/salesforce/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.parent.model.get("campNum.encode")  + "&type=import";
                   }else if(this.parent.model.get('recipientType')=="Netsuite"){
                           URL = "/pms/io/netsuite/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.parent.model.get("campNum.encode")  + "&type=import";
                       }else if(this.parent.model.get('recipientType')=="Highrise"){
                           URL = "/pms/io/highrise/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.parent.model.get("campNum.encode")  + "&type=import";
                       }else if(this.parent.model.get('recipientType')=="Google"){
                           URL = "/pms/io/google/getData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.parent.model.get("campNum.encode")  + "&type=import";
                       }
                       else {
                           URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&campNum=" + this.parent.model.get("campNum.encode")  + "&type=recipientType";
                       }
                       this.getReciepientsEncodes(URL);
              },
              /*
               * Schedule Dialog from Campaign Wizard
               */
              sendNowConfimDialogCmp:function(element){
                   var helpingText = '';
                        
                        this.$el.parents('body').append('<div class="overlay sch-overlay"><div class="reschedule-dialog-wrap schedule-confirm-dialog-wrap modal-body"></div></div>');
                        if(this.sendNow){
                                this.$el.parents('body').find('.reschedule-dialog-wrap').css({'margin-left': '-280px', 'margin-top': '-223px', 'max-height': '455px','height':'190px','width':'560px'});

                        }else{
                                this.$el.parents('body').find('.reschedule-dialog-wrap').css({'margin-left': '-280px', 'margin-top': '-223px', 'max-height': '455px','height':'230px','width':'560px'}); 
                        }
                   
                        var recipients = this.parent.$el.find('.recipients-inner .recipient-details').html();
                        var frecipients='';
                        var contactCount = 0;
                        if(this.parent.states.step3.recipientType=="List"){
                            
                            $.each(this.parent.RecListsPage.listsModelArray,_.bind(function(key,val){
                                contactCount = contactCount + parseInt(val.get("subscriberCount"));
                            },this));
                           
                        }else if(this.parent.states.step3.recipientType=="Target"){
                            $.each(this.parent.RecTargetPage.targetsModelArray,_.bind(function(key,val){
                                contactCount = contactCount + parseInt(val.get("populationCount"));
                            },this));
                        }else if(this.parent.states.step3.recipientType=="Tags"){
                            $.each($(this.parent.states.step3.tags.el).find('#tagsrecpslist li'),function(key,val){
                                contactCount = contactCount + parseInt($(val).find('.badge').text());
                            });
                        }else if(this.parent.states.step3.recipientType=="Google"){
                            var type = this.parent.$el.find('#google_import_container .radiopanelinput.checked input').val();
                            if(type=="sheet"){
                               recipients = this.parent.$el.find('#ddlspreadsheet_chosen .chosen-single span').text();
                               helpingText = 'Spreadsheet';
                            }else{
                                recipients = 'All Contacts';
                            }
                            contactCount = "Selected";
                        }
                        else if(this.parent.states.step3.recipientType=="Salesforce" || this.parent.states.step3.recipientType=="Highrise" || this.parent.states.step3.recipientType=="Netsuite" ){
                            if(this.parent.states.step3.recipientType=="Salesforce" && this.parent.$el.find('#sf_accordion .radiopanelinput.checked input').val()=="campaign"){helpingText = 'Campaign';}
                            if(this.parent.states.step3.recipientType=="Netsuite" && this.parent.$el.find('#netsuite_setup .radiopanelinput.checked input').val()=="group"){helpingText = 'Campaign';}
                            if(this.parent.states.step3.recipientType=="Highrise" && this.parent.$el.find('#highrise_import_container .radiopanelinput.checked input').val()=="tags"){helpingText = 'Tags';}
                            contactCount = "Selected";
                            recipients = this.parent.$el.find('.recipients-inner .recipient-details').find('label').html();
                        }
                        var dayDate = this.currentState.datetime.day;
                        if(parseInt(dayDate) <= 9){
                            dayDate = "0"+dayDate;
                        }
                        recipients = recipients.replace(/,\s*$/, "");
                        $.each(recipients.split(','),_.bind(function(key,val){
                            if(frecipients){
                                          frecipients += "<li class='recepient_type'><i class='icon "+this.parent.states.step3.recipientType.toLowerCase()+"'></i>"+val+"</li>";
                                      }else{
                                          frecipients = "<li class='recepient_type'><i class='icon "+this.parent.states.step3.recipientType.toLowerCase()+"'></i>"+val+"</li>";
                                      } 
                        },this));
                        if(this.sendNow){
                            var currentServerDateHObj = moment(this.serverDate, ["YYYY-M-D H:m:s"]);
                            var currentServerDateHFormat = currentServerDateHObj.format('YYYY-MM-DD hh:mm:ss A');
                            
                            var appendHtml = '<div class="schedule-panel" style="height:140px"><h1 style="">Campaign Details:</h1><a class="closebtn" style="display:none;"></a><p class="note sch-note" style="padding-top: 8px;text-align:left;">Do you want to send campaign <b>\''+this.parent.campobjData.name+'\'</b>?</p><h4>Send to the following '+this.parent.states.step3.recipientType+' '+helpingText+':</h4><ul>'+frecipients+'</ul><p style="float: left;" class="">On</p><span class="schdate-span"><i style="background-color: transparent ! important; height: 18px; width: 22px;" class="icon schedulesn left"></i>'+currentServerDateHFormat+' PST</span><div class="clearfix"></div><div class="btns right"><a class="btn-green btn-run"><span>&nbsp;&nbsp;&nbsp;Yes&nbsp;</span><i class="icon next"></i></a><a class="btn-gray btn-cancel"><span>No</span><i class="icon cross"></i></a></div></div>'; 
                        }else{
                         
                            var appendHtml = '<div class="schedule-panel" style="height:140px"><h1 style="">Schedule Details:</h1><a class="closebtn" style="display:none;"></a><p class="note sch-note" style="padding-top: 8px;text-align:left;">Do you want to schedule campaign <b>\''+this.parent.campobjData.name+'\'</b>?</p><h4>Send to the following '+this.parent.states.step3.recipientType+' '+helpingText+':</h4>  <ul>'+frecipients+'</ul><div class="clearfix"></div><p class="note" style="padding-top: 0px; text-align: left; margin-top: 10px; margin-bottom: 5px;"><p class="" style="float: left;">On</p> <span class="schdate-span"><i class="icon schedulesn left" style="background-color: transparent ! important; height: 18px; width: 22px;"></i>'+dayDate+'&nbsp;'+this.$el.parents('body').find('#custom-month').html()+' '+this.$el.parents('body').find('#custom-year').html()+' at '+this.$el.find('.schedule-panel .set-time .timebox-hour').val()+':'+this.$el.find('.schedule-panel .set-time .timebox-min').val()+'&nbsp;'+this.$el.find('.schedule-panel .set-time .timebox-hours .active').text()+' PST</span></p><p class="note" style="padding-top: 8px; text-align: left; float: left;">* The time is according to Pacific Standard Time  </p><div class="btns right"><a class="btn-green btn-run"><span>&nbsp;&nbsp;&nbsp;Yes&nbsp;</span><i class="icon next"></i></a><a class="btn-gray btn-cancel"><span>No</span><i class="icon cross"></i></a></div></div>';
                        }
                        
                        this.$el.parents('body').find('.reschedule-dialog-wrap').html(appendHtml);
                       
                        element.removeClass('saving');
                        //element.removeAttr('style');
                        this.$el.parents('body').find('.reschedule-dialog-wrap .fluidlabel label').css({'width':'34%','font-size':'12px'});
                        this.app.showLoading(false,this.$(".schedule-panel")); 
                        this.$el.parents('body').find('.reschedule-dialog-wrap').find('.closebtn,.btn-cancel').click(_.bind(function(){
                            this.$el.parents('body').find('.sch-overlay').remove();
                        },this));
                        this.$el.parents('body').find('.reschedule-dialog-wrap').find('.btn-run').click(_.bind(function(event){
                                this.getScheduleDate('',true); // Send Request Call
                                this.$el.parents('body').find('.sch-overlay').remove();
                        },this));
              }
              
        });
});