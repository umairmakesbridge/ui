define(['text!workflow/html/delay_journey.html','datetimepicker'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Target li view for nurture track 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'',
            /**
             * Attach events on elements in view.
            */
            events: {                
                'click .schedule-group button':'showWait',
                'click .calendericon':function(){this.$("#waitdatetime").focus()}                
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page;
                    this.editable=this.options.editable;
                    this.dialog = this.options.dialog;
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
                var self = this;
                var dateS = this.addZero(d.getDate())+'-'+this.addZero(d.getMonth()+1)+'-'+d.getFullYear();                
                this.$("#waitdatetime").datetimepicker({format:'d-m-Y',timepicker:false,closeOnDateSelect:true,value: dateS, mousewheel: false,reverseMouseWheel: false,
                onGenerate:function( ct ){
                    var currentDat = $(this).find('.xdsoft_date.xdsoft_current').data('date')+1;
                    
                    $(this).find('.xdsoft_today').addClass('xdsoft_disabled');
                    // Disable one tomorrow date

                    if($(this).find('td[data-date='+currentDat+']').hasClass('xdsoft_disabled') !=false){
                      $(this).find('td[data-date='+currentDat+']').addClass('xdsoft_disabled');
                    }
                    $(this).find('.xdsoft_date.xdsoft_weekend').addClass('xdsoft_disabled');
                    
                  }
                  ,
                  onChangeDateTime:function(dp,$input){
                        
                  },
                   minDate:'-1970/01/01'
                  });           
                
                if(this.object && this.object[0].dispatchType){
                    var _json = this.object[0];
                    if(_json.dispatchType=="D"){
                        /*if(_json.dayLapse!=="1"){
                            this.$(".chosen-select").val(_json.dayLapse).trigger("chosen:updated");
                        }*/
                        this.$("#waitday").val(_json.dayLapse);
                        this.$("#waithour").val(_json.hourLapse);                                                
                        this.$("#waitmin").val(_json.minLapse);
                        var dayText = _json.dayLapse=="1"?" Day":" Days";
                        var hourText = _json.hourLapse=="1"?" Hour":" Hours";
                        var minText = _json.minLapse=="1"?" Min":" Mins";
                        this.$(".wait-container").html(": "+_json.dayLapse + dayText + " - "+_json.hourLapse+hourText+" - "+_json.minLapse + minText);
                    }
                    else{
                        var _date = moment(_json.scheduleDate,'MM-DD-YYYY');                                                        
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
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false}); 
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            addZero:function(i){
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            },
            showWait:function(e){
                var btn = $.getObj(e,"button");
                this.$(".wait-select").hide();
                this.$("."+btn.attr("rel")+"-select").css("display","inline-block");
                if(btn.attr("rel")=="days"){
                    this.$("#waitday").focus();
                }
            },
            saveCall: function(){                
                this.dialog.hide();
                var message = "";
                if(this.$(".btn-group .btn.active").attr("rel")=="days"){
                    var daysVal = this.$("#waitday").val();
                    if(daysVal && parseInt(daysVal)>0){
                        message = daysVal + " Days";
                    }        
                    var hoursVal = this.$("#waithour").val();
                    if(hoursVal && parseInt(hoursVal)>0){
                        message += " "+hoursVal + " Hours";
                    }  
                    
                    var minVal = this.$("#waitmin").val();
                    if(minVal && parseInt(minVal)>0){
                        message += " "+minVal + " Mins";
                    }  
                }
                else{
                    message = this.$("#waitdatetime").val();
                }
                this.parent.addDelayToJourney(message);                
            }
            
            
        });
});