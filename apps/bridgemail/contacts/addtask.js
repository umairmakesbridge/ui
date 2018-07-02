define(['text!contacts/html/addtask.html','datetimepicker'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Add Custom field dilaog
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'scfe_field',            
            /**
             * Attach events on elements in view.
            */
            events: {
              
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {                                        
                    this.template = _.template(template);
                    this.page = this.options.sub;
                    this.app = this.page.app;
                    this.dialog = this.options.dialog;
                    this.activeType = "call";
                    this.taskModel = this.options.taskModel?this.options.taskModel:null;
                    this.subNum = this.options.subNum;
                    this.activePriority = "medium";
                    this.taskId = "";
                    this.render();                             
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({                    
                }));               
                
                                
            },
            init:function() {                
                var _this = this;
                this.$(".focusThis").focus();
                this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});                    
                
                this.$(".mks_ecc_wrap li").click(function(){
                    if(!$(this).hasClass("active")){
                        _this.$(".mks_ecc_wrap li").removeClass("active");
                        $(this).addClass("active");
                        _this.activeType = $(this).data("type");
                    }
                });
                
                this.$(".mks_priorty_wrap li").click(function(){
                    if(!$(this).hasClass("active")){
                        _this.$(".mks_priorty_wrap li").removeClass("active");
                        $(this).addClass("active");
                        _this.activePriority = $(this).data("type");
                    }
                });
                var d = new Date();
                var dateS = this.addZero(d.getDate())+'-'+this.addZero(d.getMonth()+1)+'-'+d.getFullYear();                
                this.$(".hasDatepicker").datetimepicker({format:'d-m-Y',timepicker:false,closeOnDateSelect:true,value: dateS, mousewheel: false,reverseMouseWheel: false,
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
                  var timeS = this.addZero(d.getHours())+':'+this.addZero(d.getMinutes())
                  this.$(".timepicker").datetimepicker({
                    datepicker:false,
                    format:'H:i',                    
                    value:timeS
                  });
                  // Populate for edit
                  if(this.taskModel){
                      
                    this.taskId = this.taskModel.get("taskId.encode");
                    this.activePriority = this.taskModel.get("priority");
                    this.activeType  =  this.taskModel.get("taskType");    
                    this.$("#taskname").val(this.taskModel.get("taskName"));
                    var _date = moment(this.app.decodeHTML(this.taskModel.get("taskDate")), 'YYYY-MM-DD HH:mm');
                    this.$("#datepicker").val(_date.format("DD-MM-YYYY"));
                    this.$(".timepicker").val(_date.format("HH:mm"));
                    this.$(".mks_ecc_wrap li").removeClass("active");
                    this.$(".mks_ecc_wrap li[data-type='"+this.activeType+"']").addClass("active");
                    this.$(".mks_priorty_wrap li").removeClass("active");
                    this.$(".mks_priorty_wrap li[data-type='"+this.activePriority+"']").addClass("active");
                    this.$("#notes").val(this.taskModel.get("notes"));
                    
                  }
            },
            saveTask: function(){
                 var URL ="/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=" + this.app.get('bms_token') + "&subNum=" + this.subNum;
                    var taskText = $.trim(this.$("#taskname").val());
                    if(taskText){                        
                        var _date = moment(this.$("#datepicker").val(), 'DD-MM-YYYY')
                        var newtaskDate = _date.format("MM-DD-YYYY");
                        var timeDate = newtaskDate + " " + moment(this.$(".timepicker").val(), ["HH:mm"]).format("HH:mm")+":00";
                        var _data = {type:"add",
                                     name:taskText,
                                     notes:this.$("#notes").val(),
                                     priority:this.activePriority,
                                     tasktype: this.activeType,
                                     taskDate:timeDate
                                 };
                        
                        if(this.taskId){
                            delete _data["type"];
                            _data["type"] = "update";   
                            _data["taskId"] = this.taskId;   
                        }
                        this.app.showLoading("Saving Task...", this.dialog.getBody());
                        $.post(URL, _data)
                        .done(_.bind(function (data) {
                            var _json = jQuery.parseJSON(data);
                            this.app.showLoading(false, this.dialog.getBody());
                            if (_json[0] !== "err") {
                               this.page.fetchTasks(); 
                               this.dialog.hide();
                            } else {
                                this.app.showAlert(_json[1], $("body"));
                            }


                        },this));
                    }
                    else{
                        this.$("#task_name").addClass("hasError").focus();
                    }
                
            },
            addZero:function(i){
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            },
            
            
        });
});