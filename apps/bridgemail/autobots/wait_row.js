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
                //this.$(".chosen-select").chosen({no_results_text:'Oops, nothing found!', width: "130px",disable_search: "true"});
                this.$(".btn-group").t_button();   
                this.$("#waitdatetime").datetimepicker({format:'d-m-Y H:00',timepicker:true,closeOnDateSelect:true,startDate:'2017/'});                                
                
                if(this.object && this.object[0].dispatchType){
                    var _json = this.object[0];
                    if(_json.dispatchType=="D"){
                        /*if(_json.dayLapse!=="1"){
                            this.$(".chosen-select").val(_json.dayLapse).trigger("chosen:updated");
                        }*/
                        this.$("#waitday").val(_json.dayLapse);
                        var dayText = _json.dayLapse=="1"?" Day":" Days";
                        this.$(".wait-container").html(": "+_json.dayLapse + dayText);
                    }
                    else{
                        var _date = moment(_json.scheduleDate,'MM-DD-YY');                                                        
                        this.$("#waitdatetime").val(_date.format("DD-MM-YYYY"));
                        this.$(".btn-group button:first-child").removeClass("active");
                        this.$(".btn-group button:last-child").addClass("active");
                        this.$(".wait-select").hide();
                        this.$(".date-select").css("display","inline-block");
                        this.$(".wait-container").html(": "+_date.format("DD MMM YYYY"));
                    }
                }
                else{
                    this.$(".wait-container").html(": 1 Day");
                }
                this.$('.checkpanel').iCheck({
                            checkboxClass: 'checkpanelinput',
                            insert: '<div class="icheck_line-icon" style="margin: 20px 0px 0px 7px!important;"></div>'
                        });
                this.$(".iCheck-helper").on('click', _.bind(function (ev) {
                    var checkDiv = $(ev.target).parents('.checkpanelinput');
                    if (checkDiv.hasClass('checked')) {
                        this.$(".btn").removeClass("disabled");
                        this.$("input[type='text']").removeAttr("disabled")
                        
                    } else {
                        this.$(".btn").addClass("disabled")
                        this.$("input[type='text']").attr("disabled","disabled")
                    }
                },this))        
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false}); 
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
                            isError = "Days must be between 1-365";
                        }
                    }
                    else{
                        post_data['dispatchType'] = 'S';
                        var _date = moment(this.$("#waitdatetime").val(),'DD-MM-YYYY HH:mm');                            
                        post_data['scheduleDate'] = _date.format("MM-DD-YY");                        
                        post_data['timeOfDayHrs'] =  _date.format("HH");
                        post_data['timeOfDayMins'] =  _date.format("mm");
                        //post_data['timeOfDaySecs'] = '';
                    }
                }    
                    
                return {"post":post_data,isError:isError}
            }
            
            
        });
});