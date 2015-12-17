
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
                 'click .closebtn':'closeDialog',
//               "click .preview-camp":'previewCampaign',
//               'click  a.campname': 'campaignStateOpen',
//               "click .schedule-camp, .reschedule-camp":'schOpenCampaign',
//               'click .delete-camp':'deleteCampaginDialoge',
//               'click .taglink':'tagClick',
//               'click .report':'reportShow',
//               'click .draft-camp':'draftBtnClick',
//               'click .cflag':'classFlagClick'
               /*'click .tag':'tagSearch'*/
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
                this.loadCampgin();
                this.app.showLoading("Loading Calender...",this.$(".schedule-panel")); 

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
               scheduleCamp:function(){
                   this.draftstate = false; 
                   this.scheduledCampaign('S',"Scheduling Campaign...");  
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
                   
                   var post_data = {"campNum": this.campNum,
                                    "type":"saveStep4",
                                    "status":flag                                    
                                    }
                   if(flag=='S'){
                       post_data["scheduleType"] = "scheduled";
                       post_data["scheduleDate"] =_date+" "+time;                                    
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
                                camp_obj.showScheduleBox();
                                camp_obj.app.showMessge("Campaign Scheduled Successfully!");
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
                   camp_obj.refreshList();
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
              }
              
        });
});