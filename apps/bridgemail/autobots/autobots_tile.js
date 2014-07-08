/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/autobots_tile.html', 'moment','jquery.chosen'],
        function(template, moment,chosen) {
            'use strict';
            return Backbone.View.extend({
                tagName: "li",
                className: "span3",
                events: {
                   "click .percent":"showPercentage" ,
                   "mouseover .img":"showImageH",
                   "mouseout .img":"hideImageH",
                   'click .show-sent-views':'showPageViews',
                   "click .deletebtn":"deleteAutobot",
                   "click .playbtn":"playAutobot",
                   "click .pausebtn":"pauseAutobot",
                   "click .previewbtn":"previewCampaign"
                   
                 },
                initialize: function() {
                    this.template = _.template(template);
                    this.model.on('change', this.render, this);
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template(this.model.toJSON()));
                    this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                },
                getStatus:function(){
                    if(this.model.get('status') == "D")
                     return "<a class='cstatus pclr1'> Paused </a>";
                    else if(this.model.get("status") == "R")
                     return "<a class='cstatus pclr18'> Playing </a>";
                    else if(this.model.get('status') == "P")
                        return "<a class='cstatus pclr6'> Pending </a>";
                },
                getAutobotImage:function(){
                     var label = "";
                     switch(this.model.get('actionType')){
                         case "SC":
                            label = "<img src='img/scorebot.png'>";
                            break;
                        case "A":
                            label = "<img src='img/alertbot.png'>";
                            break;
                        case "E":
                            label = "<img src='img/mailbot.png'>";
                        case "TG":
                           label = "<img src='img/tagbot.png'>";
                     }
                     if(this.model.get('botType') == "B" && this.model.get('actionType') == "E")
                          label = "<img src='img/bdaybot.png'>"
                      
                      return label;
                },
                showImageH:function(ev){
                    var src = $(ev.target).attr('src');
                    if(typeof src !="undefined"){
                        src = src.replace(".", "-h.");
                        $(ev.target).attr('src',src);
                   }
                    
                },
                hideImageH:function(ev){
                    var src = $(ev.target).attr('src');
                    if(typeof src !="undefined"){
                        src = src.replace("-h.", ".");
                        $(ev.target).attr('src',src);
                   }
                    
                },
                
                showPercentage:function(ev){
                   this.current_ws = this.$el.parents(".ws-content");
                   this.current_ws.find(".pstats").remove();
                   var str = "<div class='pstats' style='display:block;'>";
                   str = str + "<ul>";
                   if(this.model.get('sentCount') == "0"){
                       str = str + "<li class='sent'><strong>"+this.options.app.addCommas(this.model.get('sentCount'))+"</strong><span>Sent</span></li>";
                   }else{
                    str = str + "<li class='sent'><a class='show-sent-views showtooltip' data-original-title='Click to view contacts'><strong>"+this.options.app.addCommas(this.model.get('sentCount'))+"</strong><span>Sent</span></a></li>";
                   }
                   if(this.model.get('pendingCount') == "0"){
                       str = str + "<li class='pending'><strong>"+this.options.app.addCommas(this.model.get('pendingCount'))+"</strong><span>Pending</span></li>";
                   }else{
                    str = str + "<li class='pending '><a class='show-sent-views' data-original-title='Click to view contacts'><strong>"+this.options.app.addCommas(this.model.get('pendingCount'))+"</strong><span>Sent</span></a></li>";
                   }
                   str = str + "</ul>";
                   str = str + "</div>";   
                   $(ev.target).parents(".percent_stats").append(str);
                },
                 isRecurring:function(){
                    if(this.model.get('isRecur') == "Y"){
                        var label = "";
                        switch(this.model.get('recurType')){
                            case"M":
                              label ="Recur after every " + this.model.get('recurPeriod')+ " months";
                                break;
                            case"Y":
                                label ="Recur after every " + this.model.get('recurPeriod')+ " years";
                                break;
                            case"D":
                                label ="Recur after every " + this.model.get('recurPeriod')+ " days";
                                break;
                        }
                        var label2 = label;
                        if(this.model.get('recurTimes') !="undefined" && this.model.get('recurTimes') !="0"){
                           var label2 = " , not more than "+this.model.get('recurTimes')+" time";
                           label2 = label+label2;
                           label = label + "...";
                        }
                        return "<span class='icon-b reoccure showtooltip'  style='padding-bottom:5px'  data-original-title='"+label2+"'>"+label+"</span>";
                    }else{
                        return "<span style='padding-bottom:5px; display:block; min-height:17px;'>&nbsp;</span>";
                    }
                },
                getDate:function(){
                     var playedOn = this.model.get('lastPlayedTime');
                   if(playedOn){
                     return "<em data-original-title='Played on' class='showtooltip'>"+this.dateSetting(playedOn)+"</em>";
                   }else{
                        
                     return "<em data-original-title='Last edited on' class='showtooltip'>"+this.dateSetting(this.model.get('updationTime'))+"</e,=m>";   
                   }
                },
                 dateSetting: function(sentDate) {
                    var _date = moment(sentDate, 'MM-DD-YY');
                    return _date.format("DD MMM YYYY");
                },
                 showPageViews:function(ev){
                     var dialog_width = 80;
                     var that = this;
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog(
                           {           
                                       title:'Contacts Dialog',
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'subscribers',
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        var botId = this.model.get('botId.encode');    
                       that.options.app.showLoading('Loading Contacts....',dialog.getBody());
                       require(["recipientscontacts/rcontacts"],function(Contacts){
                       var objContacts = new Contacts({app:that.options.app,botId:botId,type:'autobots'});
                                dialog.getBody().html(objContacts.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        });
                },
                deleteAutobot:function(ev){
                    var that = this;
                    var target = $(ev.target);
                    var botId = target.data('id');
                    var bms_token =that.options.app.get('bms_token');
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK="+bms_token;
                    that.options.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this Autobot?",                                                
                            callback: _.bind(function(){													
                                that.options.app.showLoading("Deleting Autobot...",$(ev.target).parents('.span3'));
                                $.post(URL, {type:'delete',botId:botId})
                                    .done(function(data) {                  
                                          that.options.app.showLoading(false,$(ev.target).parents('.span3'));   
                                           var _json = jQuery.parseJSON(data);
                                           if(that.options.app.checkError(_json)){
                                                    return false;
                                                }
                                           if(_json[0]!=='err'){
                                               $(ev.target).parents('li').fadeOut('slow');
                                              
                                             }
                                           else{
                                                that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                           }
                                   });
                            },that)},
                       that.$el); 
                },
                playAutobot:function(ev){
                     var that = this;
                     var botId = $(ev.target).data('id');
                     var bms_token =that.options.app.get('bms_token');
                     var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK="+bms_token;
                                    that.options.app.showLoading("Playing Autobots...",that.$el);
                                    $.post(URL, {type:'play',botId:botId})
                                        .done(function(data) {                  
                                              that.options.app.showLoading(false,that.$el);   
                                               var _json = jQuery.parseJSON(data);
                                               if(that.options.app.checkError(_json)){
                                                    return false;
                                                }
                                               if(_json[0]!=='err'){
                                                   if (typeof _json[1] !="undefined" && _json[1].indexOf("err") >= 0){
                                                     that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                                    }else{
                                                       that.getAutobotById();
                                                    }
                                                    
                                                }
                                               else{
                                                    that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                               }
                                   });
                },
                pauseAutobot:function(ev){
                     var that = this;
                      var botId = $(ev.target).data('id');
                     var bms_token =that.options.app.get('bms_token');
                     var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK="+bms_token;
                                    that.options.app.showLoading("Pause Autobots...",that.$el);
                                    $.post(URL, {type:'pause',botId:botId})
                                        .done(function(data) {                  
                                              that.options.app.showLoading(false,that.$el);   
                                               var _json = jQuery.parseJSON(data);
                                                if(that.options.app.checkError(_json)){
                                                    return false;
                                                }
                                               if(_json[0]!=='err'){
                                                   if (typeof _json[1] !="undefined" && _json[1].indexOf("err") >= 0){
                                                     that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                                    }else{
                                                        that.getAutobotById();
                                                    }
                                                    
                                                }
                                               else{
                                                    that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                               }
                                   });
                },
                getAutobotById:function(){
                    var that = this;
                    var bms_token =that.options.app.get('bms_token');
                    var url = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK="+bms_token+"&type=get&botId="+this.model.get('botId.encode');
                    jQuery.getJSON(url,  function(tsv, state, xhr){
                        var autobot = jQuery.parseJSON(xhr.responseText);
                        if(that.options.app.checkError(autobot)){
                            return false;
                        }
                        that.model.set({
                            'recurType':autobot.recurType,
                            'lastPlayedTime':autobot.lastPlayedTime,
                            'pendingCount':autobot.pendingCount,
                            'updationTime':autobot.updationTime,
                            'recurTimes':autobot.recurTimes,
                            'label':autobot.label,
                            'actionType':autobot.actionType,
                            'creationTime':autobot.creationTime,
                            'tags':autobot.tags,
                            'recurPeriod':autobot.recurPeriod,
                            'isRecur':autobot.isRecur,
                            'status':autobot.status,
                            'botType':autobot.botType,
                            'isSweepAll':autobot.isSweepAll,
                            'sentCount':autobot.sentCount,
                        });
                        that.render();
                        
                    });
                },
                previewCampaign:function(e){
                      var camp_name = this.model.get('label');
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
                        //var preview_url = "https://"+that.options.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+that.campNum+"&html=Y&original=N";    
                        var preview_url = "https://"+that.options.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+that.model.get('botId.encode');
                        require(["common/templatePreview"],_.bind(function(templatePreview){
                            var tmPr =  new templatePreview({frameSrc:preview_url,app:that.options.app,frameHeight:dialog_height,prevFlag:'C',tempNum:that.model.get('botId.encode')});
                             dialog.getBody().html(tmPr.$el);
                             tmPr.init();
                         },this));       
//                        var preview_iframe = $("<iframe class=\"email-iframe\" style=\"height:"+dialog_height+"px\" frameborder=\"0\" src=\""+preview_url+"\"></iframe>");                            
//                        dialog.getBody().html(preview_iframe);               
//                        dialog.saveCallBack(_.bind(that.sendTextPreview,that,that.campNum));                        
                        e.stopPropagation();    
                },
            });
        });
 