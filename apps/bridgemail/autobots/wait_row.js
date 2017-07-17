define(['text!autobots/html/wait_row.html','datetimepicker'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Target li view for nurture track 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'wait-row',
            /**
             * Attach events on elements in view.
            */
            events: {                
                'click .calendericon':function(){this.$("#waitdatetime").focus()},
                'click .schedule-group button':'showWait'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page;                                                            
                    this.editable=this.options.editable;
                    this.app = this.parent.app;                            
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({
                    model: this.model
                }));                
                this.$("#waitday,#waithour,#waitmin").ForceNumericOnly();                
                this.$(".btn-group").t_button();   
                var d = new Date();                
                var dateS = this.addZero(d.getDate())+'-'+this.addZero(d.getMonth()+1)+'-'+d.getFullYear() +" "+ this.addZero(d.getHours())+":"+this.addZero(d.getMinutes());                
                this.$("#waitdatetime").datetimepicker({format:'d-m-Y H:i',timepicker:true,closeOnDateSelect:false,value: dateS, mousewheel: false,reverseMouseWheel: false,
                onGenerate:function( ct ){
                    var currentDat = $(this).find('.xdsoft_date.xdsoft_current').data('date')+1;
                    
                    $(this).find('.xdsoft_today').addClass('xdsoft_disabled');
                    // Disable one tomorrow date

                    if($(this).find('td[data-date='+currentDat+']').hasClass('xdsoft_disabled') !=false){
                      $(this).find('td[data-date='+currentDat+']').addClass('xdsoft_disabled');
                    }
                    $(this).find('.xdsoft_date.xdsoft_weekend').addClass('xdsoft_disabled');

                    //$('.xdsoft_time_variant .xdsoft_time').append('<span> PM</span>')
                  }
                  ,
                  onChangeDateTime:function(dp,$input){
                        
                   },
                   minDate:'-1970/01/01'
                  });                                
                               
                this.$('.checkpanel').iCheck({
                    checkboxClass: 'checkpanelinput',
                    insert: '<div class="icheck_line-icon" style="margin: 20px 0px 0px 7px!important;"></div>'
                });
                this.$(".checkpanel").on('ifChecked', _.bind(function (ev) {
                    this.$(".btn").removeClass("disabled");
                    this.$("input[type='text']").removeAttr("disabled")
                },this));
                this.$(".checkpanel").on('ifUnchecked', _.bind(function (ev) {
                   this.$(".btn").addClass("disabled")
                   this.$("input[type='text']").attr("disabled","disabled");
                },this));                    
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false}); 
            },
            addZero:function(i){
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            },
            showWait:function(e){
                var btn = $.getObj(e,"button");
                if(btn.hasClass("disabled")){
                    return false;
                }
                this.$(".wait-select").hide();
                this.$("."+btn.attr("rel")+"-select").css("display","inline-block");
                if(btn.attr("rel")=="days"){
                    this.$("#waitday").focus();
                }
            },
            getPostData :function(){
                var isError = "";
                var post_data = {isDelay:'N'};
                if(this.$(".checkpanel").is(":checked")){
                    post_data["isDelay"] = "Y"
                    if(this.$(".schedule-group button:first-child").hasClass("active")){
                        post_data['dispatchType'] = 'D';
                        post_data['dayLapse'] = this.$("#waitday").val();
                        post_data['hourLapse'] = this.$("#waithour").val();
                        post_data['minLapse'] = this.$("#waitmin").val();
                        if(post_data['dayLapse'] && post_data['dayLapse']>=0 && post_data['dayLapse']<=365){                                                            
                            var dayText =this.$("#waitday").val()=="1"?" Day":" Days";                            
                        }
                        else{
                            isError = "Wait days must be between 0-365";
                        }
                        
                        if(post_data['hourLapse'] && post_data['hourLapse']>=0 && post_data['hourLapse']<=23){ 
                            var hourText =this.$("#hourLapse").val()=="1"?" Hour":" Hours";                            
                        }
                        else{
                            if(isError!==""){
                                isError += "<br/>";
                            }
                            isError += "Wait Hours must be between 0-23";
                        }
                        
                        if(post_data['minLapse'] && post_data['minLapse']>=0 && post_data['minLapse']<=59){ 
                            var minText =this.$("#waitmin").val()=="1"?" Min":" Mins";                            
                        }
                        else{
                            if(isError!==""){
                                isError += "<br/>";
                            }
                            isError = "Wait Minutes must be between 0-59";
                        }
                    }
                    else{
                        post_data['dispatchType'] = 'S';
                        if(this.$("#waitdatetime").val()){
                            var _date = moment(this.$("#waitdatetime").val(),'DD-MM-YYYY HH:mm');                            
                            post_data['scheduleDate'] = _date.format("MM-DD-YY");                        
                            post_data['timeOfDayHrs'] =  _date.format("HH");
                            post_data['timeOfDayMins'] =  _date.format("mm");                            
                        }
                        else{
                            isError = "Wait date cann't be empty";
                        }
                        //post_data['timeOfDaySecs'] = '';
                    }
                }    
                    
                return {"post":post_data,isError:isError}
            },
            setData: function(_json){                                
                if(_json.isDelay=="Y"){
                    this.$(".checkpanel").iCheck('check')
                    this.$(".btn").removeClass("disabled");
                    this.$("input[type='text']").removeAttr("disabled")
                    if(_json.dayLapse){                    
                        this.$("#waitday").val(_json.dayLapse);                                                
                        this.$("#waithour").val(_json.hourLapse);                                                
                        this.$("#waitmin").val(_json.minLapse);                                                
                    }
                    else if(_json.scheduleDate){
                        var _date = moment(_json.scheduleDate,'MM-DD-YY');     
                        var hours = _json.timeOfDayHrs.length==1?"0"+_json.timeOfDayHrs:_json.timeOfDayHrs;
                        var min = _json.timeOfDayMins.length==1?"0"+_json.timeOfDayMins:_json.timeOfDayMins;
                        this.$("#waitdatetime").val(_date.format("DD-MM-YYYY")+" "+hours+":"+min );
                        this.$(".btn-group button:first-child").removeClass("active");
                        this.$(".btn-group button:last-child").addClass("active");
                        this.$(".wait-select").hide();
                        this.$(".date-select").css("display","inline-block");                        
                    }
                }
            }
            
            
        });
});