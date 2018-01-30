define(['text!nurturetrack/html/wait_row.html','datetimepicker'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Target li view for nurture track 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'accordion-group yellow wait-message',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click .delete-row':'deleteRow',
                'click .schedule-group button':'showWait',
                'click .calendericon':function(){this.$("#waitdatetime").focus()},
                'click .save-wait': 'saveWait',
                'click .collapse-handle':'toggleAccordion',
                'click .edit-message':'expand'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page;
                    this.triggerOrder = this.options.triggerOrder;
                    this.btnRow = this.options.buttonRow;
                    this.object = this.options.model;
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
            deleteRow:function(){
                var buttonPlaceHolder = this.$el.prev();
                if(buttonPlaceHolder && buttonPlaceHolder.hasClass("placeholder")){
                    buttonPlaceHolder.find(".add-wait-r").show();
                    buttonPlaceHolder.find(".wait-add").addClass("yellow").removeClass("green")
                }
                this.$el.remove();
                if(this.btnRow){
                    this.btnRow.remove();                    
                }
                if(this.triggerOrder){
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                        $.post(URL, {type:'deleteWait',trackId:this.parent.track_id,triggerOrder:this.triggerOrder})
                        .done(_.bind(function(data) {                                             
                               var _json = jQuery.parseJSON(data);        
                               if(_json[0]!=='err'){
                                   this.app.showMessge("Message wait deleted Successfully!"); 
                                   this.parent.messages[this.triggerOrder-1].isWait = false;    
                                   this.parent.messages[this.triggerOrder-1].disableButtons(false);
                               }
                               else{
                                   this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                               }
                       },this));
                }
            },
            showWait:function(e){
                var btn = $.getObj(e,"button");
                this.$(".wait-select").hide();
                this.$("."+btn.attr("rel")+"-select").css("display","inline-block");
                if(btn.attr("rel")=="days"){
                    this.$("#waitday").focus();
                }
            },
            getPostData :function(){
                var isError = "";
                var post_data = {type:'waitMessage',trackId:this.parent.track_id,triggerOrder:this.triggerOrder};
                        if(this.$(".schedule-group button:first-child").hasClass("active")){
                        post_data['dispatchType'] = 'D';
                        post_data['dayLapse'] = this.$("#waitday").val();
                        post_data['hourLapse'] = this.$("#waithour").val();
                        post_data['minLapse'] = this.$("#waitmin").val();
                        var dayText = 0, hourText=0, minText = 0;
                        if(post_data['dayLapse'] && post_data['dayLapse']>=0 && post_data['dayLapse']<=365){                                                            
                            dayText =this.$("#waitday").val()=="1"?" Day":" Days";                            
                        }
                        else{
                            isError = "Days must be between 1-365";
                        }
                        if(post_data['hourLapse'] && post_data['hourLapse']>=0 && post_data['hourLapse']<=23){ 
                            hourText =this.$("#hourLapse").val()=="1"?" Hour":" Hours";                            
                        }
                        else{
                            if(isError!==""){
                                isError += "<br/>";
                            }
                            isError += "Wait Hours must be between 0-23";
                        }
                        
                        if(post_data['minLapse'] && post_data['minLapse']>=0 && post_data['minLapse']<=59){ 
                            minText =this.$("#waitmin").val()=="1"?" Min":" Mins";                            
                        }
                        else{
                            if(isError!==""){
                                isError += "<br/>";
                            }
                            isError = "Wait Minutes must be between 0-59";
                        }
                        this.$(".wait-container").html(": "+this.$("#waitday").val() + dayText + " - "+post_data['hourLapse']+hourText+" - "+post_data['minLapse'] + minText );
                    }
                    else{
                        post_data['dispatchType'] = 'S';
                        var _dateValue = this.$("#waitdatetime").val();
                        if(moment(_dateValue,'DD-MM-YYYY').format("DD-MM-YYYY")==_dateValue){
                            var _date = moment(_dateValue,'DD-MM-YYYY');                             
                            var date_today = new Date();
                            var date1 = moment(date_today.getDate()+ '-' + (date_today.getMonth() + 1) + '-' + date_today.getFullYear() , 'DD-MM-YYYY');                            
                            var diffDays = _date.diff(date1, 'days');;
                            if(diffDays>=0){                                                       
                                post_data['scheduleDate'] = _date.format("MM-DD-YYYY");
                                this.$(".wait-container").html(": "+_date.format("DD MMM YYYY"));
                            }
                            else {
                                isError = "You can't set wait in previous date";
                            }
                          
                        }
                        else {
                            isError = "Date format is not correct, Date format should be DD-MM-YYYY";
                        }
                        
                    }
                    
                    return {"post":post_data,isError:isError}
            },
            saveWait:function(obj){
                if(this.triggerOrder){
                    var isError = "";
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                        var _data = this.getPostData();
                        var post_data = {};
                        if(_data.isError!==""){
                            isError = _data.isError;
                        }
                        else{
                            post_data = _data.post;
                        }
                        post_data = $.extend({},post_data,this.parent.messages[this.triggerOrder-1].getPostData());
                        if(!isError){
                            this.$(".save-wait").addClass("saving");
                            $.post(URL, post_data)
                            .done(_.bind(function(data) {                                             
                                   var _json = jQuery.parseJSON(data);        
                                   this.$(".save-wait").removeClass("saving");
                                   if(_json[0]!=='err'){
                                       if(obj){
                                        this.app.showMessge("Message wait saved Successfully!"); 
                                       }
                                       else{
                                           this.parent.saveAllCall--;
                                           if(this.parent.saveAllCall==0){
                                              this.app.showMessge("Nurture track saved Successfully!"); 
                                              this.parent.$(".save-all-nt").removeClass("saving");
                                           } 
                                       }
                                       this.parent.messages[this.triggerOrder-1].isWait = true;
                                   }
                                   else{
                                       this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                                   }
                           },this));
                       }
                       else{
                           this.app.showAlert(isError,$("body"),{fixed:true}); 
                           obj.stopPropagation();
                       }
                }
            },
            toggleAccordion:function(){      
                    var accordion_body = this.$(".collapse-body");
                    if(accordion_body.height()){
                       this.collapse()
                    }
                    else{
                       this.expand(); 
                    }
                },
                collapse:function(){
                    var accordion_body = this.$(".collapse-body");
                    accordion_body.stop(1).animate({height: 0},50, function(){
                       $(this).hide();                         
                    });
                    this.$(".wait-container,.edit-message").show();                    
                },
                expand:function(){
                    var accordion_body = this.$(".collapse-body");
                    accordion_body.show();  
                    accordion_body.stop(1).animate({height: 58},50, function(){

                    });
                    this.$(".wait-container,.edit-message").hide();
                }
            
            
        });
});