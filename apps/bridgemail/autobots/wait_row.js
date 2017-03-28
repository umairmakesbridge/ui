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
                this.$("#waitday").ForceNumericOnly();                
                this.$(".btn-group").t_button();   
                var d = new Date();                
                var dateS = (d.getDate())+'.'+(d.getMonth()+1)+'.'+d.getFullYear();                
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
                        if(post_data['dayLapse']>0 && post_data['dayLapse']<=365){                                                            
                            var dayText =this.$("#waitday").val()=="1"?" Day":" Days";
                            this.$(".wait-container").html(": "+this.$("#waitday").val() + dayText);
                        }
                        else{
                            isError = "Wait days must be between 1-365";
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