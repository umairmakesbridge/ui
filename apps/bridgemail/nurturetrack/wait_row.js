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
                'click .collapse-handle':'toggleAccordion'
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
                
                this.$(".chosen-select").chosen({no_results_text:'Oops, nothing found!', width: "130px",disable_search: "true"});
                this.$(".btn-group").t_button();   
                this.$("#waitdatetime").datetimepicker({format:'d-m-Y',timepicker:false,closeOnDateSelect:true});                                
                
                if(this.object && this.object[0].dispatchType){
                    var _json = this.object[0];
                    if(_json.dispatchType=="D"){
                        if(_json.dayLapse!=="1"){
                            this.$(".chosen-select").val(_json.dayLapse).trigger("chosen:updated");
                        }
                    }
                    else{
                        var _date = moment(_json.scheduleDate,'MM-DD-YY');                                                        
                        this.$("#waitdatetime").val(_date.format("DD-MM-YYYY"));
                        this.$(".btn-group button:first-child").removeClass("active");
                        this.$(".btn-group button:last-child").addClass("active");
                        this.$(".wait-select").hide();
                        this.$(".date-select").css("display","inline-block");
                    }
                }                
                
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
                        $.post(URL, {type:'waitMessage',trackId:this.parent.track_id,triggerOrder:this.triggerOrder,dispatchType:'L'})
                        .done(_.bind(function(data) {                                             
                               var _json = jQuery.parseJSON(data);        
                               if(_json[0]!=='err'){
                                   this.app.showMessge("Message wait deleted Successfully!"); 
                                   this.parent.messages[this.triggerOrder-1].isWait = false;
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
            },
            saveWait:function(obj){
                if(this.triggerOrder){
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                        var post_data = {type:'waitMessage',trackId:this.parent.track_id,triggerOrder:this.triggerOrder};
                        if(this.$(".schedule-group button:first-child").hasClass("active")){
                            post_data['dispatchType'] = 'D';
                            post_data['dayLapse'] = this.$(".chosen-select").val();
                        }
                        else{
                            post_data['dispatchType'] = 'S';
                            var _date = moment(this.$("#waitdatetime").val(),'DD-MM-YYYY');                            
                            post_data['scheduleDate'] = _date.format("MM-DD-YY");
                        }
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
                    accordion_body.stop(1).animate({height: 0},300, function(){
                       $(this).hide();  
                    });
                },
                expand:function(){
                    var accordion_body = this.$(".collapse-body");
                    accordion_body.show();  
                    accordion_body.stop(1).animate({height: 58},300, function(){

                    });
                }
            
            
        });
});