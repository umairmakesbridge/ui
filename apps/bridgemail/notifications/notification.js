/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!notifications/html/notification.html', 'moment','jquery.chosen','app'],
        function(template, moment,chosen,app) {
            'use strict';
            return Backbone.View.extend({
                tagName: "div",
                className: "alertmsg",
                events: {
                    "click .page-view": "openPageViewsDialog",
                    "click .down": "showMessage",
                    "click .up": "hideMessage",
                    "click .preview-campaign":"previewCampaign",
                    "click .current-count":'getContactsPopulation',
                    "click h3": "showMessage",
                    "click .view-target":"editTarget",
                    "click #campaign_analytics":"showReport",
                    "click .list-name":"openListWorkspace"
                },
                initialize: function() {
                    this.app = app;
                    
                    this.template = _.template(template);
                    
                    this.model.on('change', this.render, this);
                    this.render();
                },
                render: function() {
                    if(this.model.get('DATA_NOT_FOUND')){
                        this.$el.hide();
                    }
                    this.$el.html(this.template(this.model.toJSON()));
                    var colorName = "blue";
                    switch (this.model.get('notifyType')) {
                        case "I":
                            colorName = "blue";
                            $(this.el).attr('id', this.id).addClass('info');
                            break;
                        case "W":
                            colorName = "yell";
                            $(this.el).attr('id', this.id).addClass('warning');
                            break;
                        case "E":
                            colorName = "red";
                            $(this.el).attr('id', this.id).addClass('error');
                            break;
                        case "SYNCH_PEER_E":
                        case "SYNCH_E":
                            colorName = "red";
                            $(this.el).attr('id', this.id).addClass('error');
                            break;
                    }
                    var img = "";
                      switch (this.model.get('eventType')) {
                        case "CMP_C": 
                        case "CMP_ZERO":
                        case "CMP_RR":    
                        case "CMP_ANZ":    
                            img = this.options.app.get("path")+"img/campaign-"+colorName+".png";
                            break;
                        case "TG_PCT":
                             img = this.options.app.get("path")+"img/target-"+colorName+".png";
                            break;
                        case "CSV":
                             img = this.options.app.get("path")+"img/csvicon-"+colorName+".png";
                            break;
                        case "SYNCH_C":
                            img = this.options.app.get("path")+"img/Salesforce_SYNC_completed.png";
                             break;
                        case "SYNCH_PEER":
                             img = this.options.app.get("path")+"img/Salesforce_SYNC_Peer_in_Pogress.png";
                             break;
                        case "SYNCH_E":
                             img = this.options.app.get("path")+"img/Salesforce_SYNC_Error.png";
                             break;
                        case "SYNCH_R": 
                             img = this.options.app.get("path")+"img/Salesforce_SYNC_Reschedule.png";
                             break;
                        case "SYNCH_PEER_R":
                             img = this.options.app.get("path")+"img/Salesforce_SYNC_Peer_Reschedule.png";
                             break;
                        case "SYNCH_PEER_E":
                             img = this.options.app.get("path")+"img/Salesforce_SYNC_Peer_Error.png";
                             break;
                        case "SYNCH_PEER_C":
                            img = this.options.app.get("path")+"img/Salesforce_SYNC_Peer_Completed.png";
                            break;
                        case "SYNCH_PEER_A":
                            img = this.options.app.get("path")+"img/salesforce_SYNCH_PEER-_Activated.png";
                            break;
                        case "SYNCH_A_E":
                            img = this.options.app.get("path")+"img/salesforce-_SYNCH_Import_Export_Activated.png"; 
                            break;
                        case "SYNCH_A_I":
                            img = this.options.app.get("path")+"img/salesforce-_SYNCH_Import_Export_Activated_2.png";
                            break;
                        case "SYNCH_A":
                             img = this.options.app.get("path")+"img/salesforce_synch_general_icon.png";
                            break;
                    }
                    var label = "<img class='msgicon' src='"+img+"'>"
                     $(this.el).prepend(label);
                    if (this.model.get('isViewed') == "N") {
                        $(this.el).attr('id', this.id).addClass('new');
                    }else{
                        $(this.el).attr('id', this.id).css('font-weight','normal!important');
                    }
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                getTitle: function() {
                    return this.options.metaData[this.model.get('eventType')];
                },
                getDate: function() {
                     var date_today = new Date();
                            var date1 = moment(date_today.getFullYear() + '-' + (date_today.getMonth() + 1) + '-' + date_today.getDate() + " " + date_today.getHours() + ":" + date_today.getMinutes(), 'YYYY-M-D H:m');
                            var date2 = moment(this.options.app.decodeHTML(this.model.get('logTime')), 'YYYY-M-D H:m');
                            var diffMin = date1.diff(date2, 'minutes');
                            var diffHour = date1.diff(date2, 'hours');
                            var diffDays = date1.diff(date2, 'days');
                            var diffMonths = date1.diff(date2, 'months');
                            var diffYear = date1.diff(date2, 'years');
                     if(diffYear > 0 || diffMonths > 0 || diffDays > 2){
                         return this.dateSetting(this.options.app.decodeHTML(this.model.get('logTime')));
                     }else{
                         return moment(this.options.app.decodeHTML(this.model.get('logTime'))).fromNow()
                     }       
                    
                    
                },
                getStyleRead:function(){
                     if (this.model.get('isViewed') == "Y") {
                         return "font-weight:normal!important";
                    }
                },
                showMessage: function(ev) {
                    var notifyId = this.model.get('notifyId.encode');
                    
                    if(parseInt($(this.el).height()) >  50){
                        this.hideMessage();
                        return;
                    }
                    $(this.el).css('height', 'auto');
                    $(this.el).find('h3').attr('data-original-title','Click to collapse');
                    $(this.el).find('.arrow').removeClass('down').addClass('up').attr('data-original-title','Click to collapse');
                    if (this.model.get('isViewed') != "N")
                        return;
                    var URL = "/pms/io/user/notification/?BMS_REQ_TK=" + this.options.app.get('bms_token') + "&type=markRead&notifyIds=" + notifyId;
                    var that = this;
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (data[0] == "success") {
                            that.model.set('isViewed', "Y");
                            var messages = $(".messagesbtn sup").html();
                            messages = parseInt(messages) - 1;
                            $(".messagesbtn sup").html(messages);
                            $(".messagesbtn").removeClass('swing');                            
                            //$(".messagesbtn sup").css({right:"5px",left:"144px"});
                            if(messages == 0)
                                $(".messagesbtn sup").hide();
                            $(that.el).parents('.messages_dialogue').find('h4').find('.badge').html(messages);
                            $(that.el).attr('id', that.id).removeClass('new');
                        }

                    });
                },
                hideMessage: function() {
                    $(this.el).css('height', '30px');
                     $(this.el).find('h3').attr('data-original-title','Click to expand and mark read');
                    $(this.el).find('.arrow').removeClass('up').addClass('down').attr('data-original-title','Click to expand and mark read');
                },
                getLabelText: function() {
                    //TG_PCT CMP_C TG_PCT
                    var label = "";
                    var message_SYNCH_C = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce sync has been completed";
                    var message_SYNCH_PEER = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce peer sync is in progress";
                    var message_SYNCH_E = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce sync has an error";
                    var message_SYNCH_R = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce sync is reschuled";
                    var message_SYNCH_PEER_R = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce peer sync is reschuled";
                    var message_SYNCH_PEER_E = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce peer sync has an error";
                    var message_SYNCH_PEER_C = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce peer sync has been completed";
                    var message_SYNCH_A_E = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce peer export activated";
                    var message_SYNCH_A_I = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce peer import activated";
                    var message_SYNCH_A = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce import has been schuled";
                    var message_SYNCH_PEER_A = (this.model.get('Message')) ? this.model.get('Message') : "Salesforce peer has been activated";
                    
                    switch (this.model.get('eventType')) {
                        case "CMP_C":
                        case "CMP_ZERO":
                        case "CMP_RR":    
                        case "CMP_ANZ":
                            label = "<strong>Campaign Name</strong> <span data-original-title='"+this.model.get('campaignName')+"' class='text-truncated showtooltip'>" + this.model.get('campaignName') + "</span><a id='campaign_analytics' style='display: inline-block; margin-bottom:-3px;' data-original-title='Click to view message report' class='icon report showtooltip'></a>"
                            break;
                        case "TG_PCT":
                            label = "<strong>Filter Name</strong> <span data-original-title='"+this.model.get('filterName')+"' class='text-truncated showtooltip'>" + this.model.get('filterName') + "</span>"
                            break;
                        case "CSV":
                            label = "<strong>File Name</strong> <span data-original-title='"+this.model.get('csvFileName')+"' class='text-truncated showtooltip'>" + this.model.get('csvFileName') + "</span>"
                            break;
                        case "SYNCH_C":
                             label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_C+"'>" + message_SYNCH_C + "</span>";
                             break;
                        case "SYNCH_PEER":
                             label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_PEER+"'>" + message_SYNCH_PEER + "</span>";
                             break;
                        case "SYNCH_E":
                             label = "<strong>Reason</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_E+"'>" + message_SYNCH_E + "</span>";
                             break;
                        case "SYNCH_R": 
                             label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_R+"'>" + message_SYNCH_R + "</span>";
                             break;
                        case "SYNCH_PEER_R":
                             label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_PEER_R+"'>" + message_SYNCH_PEER_R + "</span>";
                             break;
                        case "SYNCH_PEER_E":
                             label = "<strong>Reason</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_PEER_E+"'>" + message_SYNCH_PEER_E + "</span>";
                             break;
                        case "SYNCH_PEER_C":
                            label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_PEER_C+"'>" + message_SYNCH_PEER_C + "</span>";
                        break;
                        case "SYNCH_A_E":
                            label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_A_E+"'>" + message_SYNCH_A_E + "</span>";
                        break;
                        case "SYNCH_A_I":
                            label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_A_I+"'>" + message_SYNCH_A_I + "</span>";
                        break;
                        case "SYNCH_PEER_A":
                            label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_PEER_A+"'>" + message_SYNCH_PEER_A + "</span>";
                        break;
                        case "SYNCH_A":
                            label = "<strong>Message</strong> <span class='text-truncated showtooltip' data-original-title='"+message_SYNCH_A+"'>" + message_SYNCH_A + "</span>";
                        break;
                    }
                    return label;

                },
                getSentText: function() {
                    //TG_PCT CMP_C TG_PCT
                    var label = "";
                    switch (this.model.get('eventType')) {
                        case "CMP_C":
                        case "CMP_ZERO":
                        case "CMP_RR":    
                        case "CMP_ANZ":    
                            label = "<strong>Sent Count</strong> <span style='font-weight:normal'>" + this.options.app.addCommas(this.model.get('sentCount')) + "</span>"
                            break;
                        case "TG_PCT":
                            label = "<strong>Match Count</strong> <span style='font-weight:normal'>" + this.options.app.addCommas(this.model.get('matchCount')) + "</span>"
                            break;
                        case "CSV":
                            label = "<strong>Add Count</strong> <span style='font-weight:normal'>" + this.options.app.addCommas(this.model.get('addCount')) + "</span>"
                            break;
                    }
                    return label;

                },
                getScheduleDate: function() {
                    var label = "";
                    switch (this.model.get('eventType')) {
                        case "CMP_C":
                        case "CMP_ZERO":
                        case "CMP_RR":    
                        case "CMP_ANZ":    
                            label = "<strong>Schedule Date</strong> <span>" + this.dateSetting(this.model.get('scheduledDate')) + "</span>"
                            break;
                        case "TG_PCT":
                            //  label = "<strong>Match Count</strong> <span>"+this.model.get('matchCount')+"</span>"
                            //  break;
                            break;
                        case "CSV":
                           label = "<strong>Update Count</strong> <span style='font-weight:normal'>"+this.options.app.addCommas(this.model.get('updateCount'))+"</span>"
                           break;
                        case "SYNCH_C":
                            label = "<strong>Sync completed</strong> <span style='font-weight:normal'>"+this.dateSetting(this.model.get('logTime'))+ "</span>";
                            break;
                        case "SYNCH_PEER":
                            label = "<strong>Sync peer </strong> <span style='font-weight:normal'>"+this.dateSetting(this.model.get('logTime'))+ "</span>";
                            break;
                        case "SYNCH_E":
                            label = "<strong>Sync error </strong> <span style='font-weight:normal'>"+this.dateSetting(this.model.get('logTime'))+ "</span>";
                            break;
                        case "SYNCH_R": 
                            label = "<strong>Sync reschule</strong> <span style='font-weight:normal'>"+this.dateSetting(this.model.get('logTime'))+ "</span>";
                            break;
                        case "SYNCH_PEER_R":
                            label = "<strong>Sync peer reschule</strong> <span style='font-weight:normal'>"+this.dateSetting(this.model.get('logTime'))+ "</span>";
                            break;
                        case "SYNCH_PEER_C":
                            label = "<strong>Sync peer completed</strong> <span style='font-weight:normal'>"+this.dateSetting(this.model.get('logTime'))+ "</span>";
                            break;
                        case "SYNCH_PEER_E":
                            label = "<strong>Sync error </strong> <span style='font-weight:normal'>"+this.dateSetting(this.model.get('logTime'))+ "</span>";
                            break;    
                        case "SYNCH_PEER_A":
                        case "SYNCH_A_E":
                        case "SYNCH_A_I":
                        case "SYNCH_A":
                            label = "<strong>Sync completed </strong> <span style='font-weight:normal'>"+this.dateSetting(this.model.get('logTime'))+ "</span>";
                            break;  
                            
                        
                    }
                    return label;

                },
                 getPopulationCount: function() {
                    var label = "";
                    switch (this.model.get('eventType')) {
                         
                        case "CSV":
                            if(this.model.get('subscriberCount') == "0")
                                label = "<strong>Population Count Count</strong> <span style='font-weight:normal'>"+this.options.app.addCommas(this.model.get('subscriberCount'))+"</span>"
                               else
                                label = "<strong>Population Count</strong> <span><a class='showtooltip current-count' data-original-title='Click to view contacts'>"+this.options.app.addCommas(this.model.get('subscriberCount'))+"</a></span>"   
                         
                         break;
                    }
                    return label;


                },
                    
                getSubject: function() {
                    var label = "";
                    switch (this.model.get('eventType')) {
                        case "CMP_C":
                        case "CMP_ZERO":
                        case "CMP_RR":    
                        case "CMP_ANZ":      
                            label = "<strong>Subject</strong> <span data-original-title='"+this.model.get('subject')+"' class='text-truncated showtooltip'>" + this.model.get('subject') + "</span><a id='campaign_analytics' style='display: inline-block; margin-bottom:-3px;' data-original-title='Click to view message report' class='icon report showtooltip'></a>"
                            break;
                        case "TG_PCT":
                               if(this.model.get('currentPopulationCount') == "0")
                                label = "<strong>Current Count</strong> <span style='font-weight:normal'>"+this.options.app.addCommas(this.model.get('currentPopulationCount'))+"</span>"
                               else
                                label = "<strong>Current Count</strong> <span><a class='showtooltip current-count' data-original-title='Click to view contacts'>"+this.options.app.addCommas(this.model.get('currentPopulationCount'))+"</a></span>"   
                            //  break;
                            break;
                        case "CSV":
                             label = "<strong>List Name</strong> <span data-original-title='"+this.model.get('listName')+"' class='text-truncated showtooltip'><a class='list-name'>" + this.model.get('listName') + "<a/></span>"
                                break;
                    }
                    return label;


                },
                getHeader:function(){
                    var caption = "";
                    var noun = "has been";
                    var to = "Sent to";
                    var count = "";
                    var date = "";
                    var nameOf = "";
                    var sfCount = (this.model.get('Count')) ? this.options.app.addCommas(this.model.get('Count')): "";
   
                    switch (this.model.get('eventType')) {
                        case "CMP_C":
                            caption = this.model.get('campaignName');
                            noun = "has been "
                            to = "Sent to";
                            count ="&nbsp;"+this.options.app.addCommas(this.model.get('sentCount'))+"&nbsp;";                            
                            nameOf = "Contacts On &nbsp;";
                            date = this.dateSetting(this.model.get('scheduledDate'));
                            break;
                        case "CMP_ZERO":
                            caption = this.model.get('campaignName');
                            noun = "has been "
                            to = "Sent to";
                            count ="&nbsp;"+this.options.app.addCommas(this.model.get('sentCount'))+"&nbsp;";
                            date = "";
                            nameOf = "Contacts.";
                            break;
                        case "CMP_RR":    
                            caption = this.model.get('campaignName');
                            noun = "has been started"
                            to = " to ";
                            count ="Dispense.";
                            date = "";
                            nameOf = "";
                            break;
                        case "CMP_ANZ":     
                            caption = this.model.get('campaignName');
                            noun = "<b>Analysis</b> has been "
                            to = "";
                            count ="Started";
                            date = "";
                            nameOf = "";
                            break;
                        case "TG_PCT":
                              caption = this.options.app.addCommas(this.model.get("currentPopulationCount"))+"&nbsp;Target Population";
                             noun = "Calculated in "
                             to = "";                             
                             count = "";
                            //count = this.options.app.addCommas(this.model.get('processCount'));
                            date = this.model.get("filterName");
                            break;
                        case "CSV":
                            caption = "CSV Upload";
                            noun = "has  "
                            to = "Add Count&nbsp;"+this.options.app.addCommas(this.model.get('addCount'));
                            count = "&nbsp; <span style='font-weight:normal'>and</span> &nbsp; Updated Count&nbsp;"+this.options.app.addCommas(this.model.get('updateCount'))+"&nbsp;";
                            date = this.dateSetting(this.model.get('logTime'));
                            nameOf = "on";
                            break;
                        case "SYNCH_C":
                           caption = "Salesforce Synch";
                            noun = "has been";
                            to="";
                            count = "completed"+"&nbsp;"+sfCount+"&nbsp;records&nbsp;";
                            date= this.dateSetting(this.model.get('logTime'));
                            nameOf = "on";
                            break;
                        case "SYNCH_PEER":
                            caption = "Salesforce peer ";
                            noun = "has been";
                            to="";
                            count = " Processed ";
                            date= this.dateSetting(this.model.get('logTime'));
                            nameOf = "on";
                            break;
                        case "SYNCH_E":
                            caption = "Salesforce Sync";
                            noun = "has an Error";
                            to="";
                            count = "";
                            date= "";
                            nameOf = "";
                            break;
                        case "SYNCH_R":
                            caption = "Salesforce Sync";
                            noun = "has been Reschuled";
                            to="";
                            count = "";
                            date= this.dateSetting(this.model.get('logTime'));;
                            nameOf = "on";
                            break;
                        case "SYNCH_PEER_E":
                            caption =  "Salesforce Peer Sync";
                            noun = "has an Error";
                            to="";
                            count = "";
                            date= "";
                            nameOf = "";
                            break;
                        case "SYNCH_PEER_R":
                            caption = "Salesforce Peer Sync ";
                            noun = "has been Reschuled";
                            to="";
                            count = "";
                            date= this.dateSetting(this.model.get('logTime'));;
                            nameOf = "on";
                            break;
                        case "SYNCH_PEER_C":
                            caption = "Salesforce Peer";
                            noun = "has successfully";
                            to="";
                            count = "Synch"+"&nbsp;records&nbsp;";
                            date= this.dateSetting(this.model.get('logTime'));
                            nameOf = "on";
                            break;
                        case "SYNCH_PEER_A":
                            caption = "Salesforce Peer";
                            noun = "has been Activated";
                            to="";
                            count = "";
                            date= this.dateSetting(this.model.get('logTime'));;
                            nameOf = "at";
                            break;
                        case "SYNCH_A_E":
                            caption = "Salesforce Export";
                            noun = "has been Activated";
                            to="";
                            count = "";
                            date= this.dateSetting(this.model.get('logTime'));;
                            nameOf = "at";
                            break;
                        case "SYNCH_A_I":
                            caption = "Salesforce Import";
                            noun = "has been Activated";
                            to="";
                            count = "";
                            date= this.dateSetting(this.model.get('logTime'));;
                            nameOf = "at";
                            break;
                        case "SYNCH_A":
                            caption = "Salesforce Import";
                            noun = "has been Schuled";
                            to="";
                            count = "";
                            date= this.dateSetting(this.model.get('logTime'));;
                            nameOf = "at";
                            break;
                    }
                   if(caption){
                    var str ="<a><strong class='text-truncated' style='display:inline;'>"+caption+"&nbsp;</strong></a>";
                    str = str + noun +"&nbsp;<strong>"+to + count +"</strong>";
                    str = str + nameOf+" <strong>"+date+"</strong>";
                    return str;
                   }
                } ,
                getActionButton: function() {
                    var label = "";
                    
                    switch (this.model.get('eventType')) {
                        case "CMP_C":
                        case "CMP_ZERO":
                        case "CMP_RR":    
                        case "CMP_ANZ":     
                            label = " <div class='info-p'><a class='btn-blue preview-campaign' style='display:block; width:190px;float: right;margin-top:-100px;'><i class='icon preview3'></i><span>Preview Campaign</span></a></div>";
                            break;
                        case "TG_PCT":
                            label = " <div class='info-p'><a class='btn-green view-target' style='float: right;margin-top:-100px;'><i class='icon edit'></i> <span>View Target</span></a></div>";
                            break;
                        case "CSV":
                           // label = "<a class='btn-green view-list' style='margin-top:5px;'><span>View List</span></a>";
                            break;
                    }
                    return label;
                },
                isTextOnly:function(){
                  var label = "";
                    switch (this.model.get('eventType')) {
                        case "CMP_C":
                        case "CMP_ZERO":
                        case "CMP_RR":    
                        case "CMP_ANZ":     
                            label = "<strong>isTextOnly</strong> <span>" + this.model.get('isTextOnly') + "</span>"
                            break;
                       
                    }
                    return label;  
                },
                dateSetting: function(sentDate) {
                    var _date = moment(sentDate, 'YYYY-MM-DD HH:mm');
                    return _date.format("DD MMM YYYY")+" at "+_date.format("hh:mm a");
                },
                
                previewCampaign:function(e){
                      var camp_name = this.model.get('campaignName');
                      var that = this;
                        var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-182;
                        var dialog = that.options.app.showDialog({title:'Campaign Preview of &quot;'+ camp_name +'&quot;',
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgpreview',
                                  bodyCss:{"min-height":dialog_height+"px"},
                                  //buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                        });                        
                        var preview_url = "https://"+that.options.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+that.model.get('campaignNumber.encode');
                        require(["common/templatePreview"],_.bind(function(templatePreview){
                            var tmPr =  new templatePreview({frameSrc:preview_url,app:that.options.app,frameHeight:dialog_height,prevFlag:'C',tempNum:that.model.get('campaignNumber.encode')});
                             dialog.getBody().html(tmPr.$el);
                             tmPr.init();
                         },this));       //                                        
                        e.stopPropagation();    
                },
                getContactsPopulation:function(ev){
                            var that = this;
                      var offset = $(ev.target).offset();
                        $('#div_pageviews').show();
                       var listNumber  = that.model.get('filterNumber.encode');
                       var type = 'target';
                       if(!listNumber){
                           listNumber = that.model.get('listNumber.encode')
                          type = "list";
                       }
                      $('#div_pageviews').empty();
                      $('#div_pageviews').append("<div class='loading-contacts' style='margin-top:15px; font-weight:bold; text-align:center; margin-left:auto; margin-right:auto;'>Loading...</div> ");
                      $('#div_pageviews').css('right','');
                      $('#div_pageviews').css({left:offset.left-200, top:offset.top - 40});      
                      require(["recipientscontacts/rcontacts"],function(Contacts){
                         var objContacts = new Contacts({type:type,app:that.options.app,listNum:listNumber});                        
                          $('#div_pageviews').css('padding-top','0');
                          $('#div_pageviews').html(objContacts.$el);                          
                      });
                },
                editTarget:function(){
                    
                    var self = this;
                    self.app = this.options.app;
                    var target_id = this.model.get('filterNumber.encode');
                    var t_id = target_id?target_id:"";
                    console.log(t_id);
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-219;
                    var dialog = this.options.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:true,
                              bodyCss:{"min-height":dialog_height+"px"},
                              headerIcon : 'targetw',
                              buttons: {saveBtn:{text:'Save Target'} }                                                                           
                        });         
                    this.options.app.showLoading("Loading...",dialog.getBody());                                  
                      require(["target/target"],function(targetPage){                                     
                           var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog});
                           dialog.getBody().html(mPage.$el);
                           dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                      });
                },
                showReport:function(){
                     var camp_id=this.model.get('campaignNumber.encode');
                     this.options.app.mainContainer.addWorkSpace({params: {camp_id: camp_id},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+this.model.get('campaignNumber.checksum'),tab_icon:'campaign-summary-icon'});
                },
                openListWorkspace:function(){
                       this.options.app.mainContainer.addWorkSpace({type:'',title: "Lists, Targets, Tags",sub_title:'Listing',url:'contacts/recipients',workspace_id: 'recipients',tab_icon:'subscribers',single_row:true,params: {type: 'lists',listName:this.model.get('listName')}});
                     return;
                }
            });
        });
