define(['text!nurturetrack/html/wait_row.html','moment','jquery.chosen','datetimepicker'],
function (template,moment) {
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
                this.$("#waitdatetime").datetimepicker({format:'d-m-Y',timepicker:false,closeOnDateSelect:true});                                
                
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
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false}); 
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
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
                        var _date = moment(this.$("#waitdatetime").val(),'DD-MM-YYYY');                            
                        post_data['scheduleDate'] = _date.format("MM-DD-YY");
                        this.$(".wait-container").html(": "+_date.format("DD MMM YYYY"));
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