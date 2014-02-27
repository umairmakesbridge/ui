define(['jquery', 'backbone', 'underscore', 'app', 'text!templates/common/wizard.html'],
	function ($, Backbone, _, app, template) {
		'use strict';
		return Backbone.View.extend({
			id: 'wizard',                        
                        active_step:0,
                        page:null,
                        total_steps:0,
                        events: {
                            'click a.backbtn':function(obj){
                                this.back(obj);
                            },
                            'click a.nextbtn':function(obj){
                                //this.next(obj); 
                                this.validateStep();
                            },
                            'click ol.progressbar li':function(obj){
                                return false;
                                if(obj.target.className.indexOf("step")==-1){
                                    if(!$(obj.target).hasClass("active")){
                                        var validate = this.page.stepsCall("step_"+parseInt(this.active_step));
                                        
                                            var target = obj.target.tagName==="A" ? obj.target.parentNode : obj.target;
                                            var step_no = target.className.split(" ")[0].substring(1);

                                            if(validate>-1 && parseInt(step_no) > this.active_step){
                                                 if(validate===0){
                                                    this.$el.find(".progressbar li").eq(this.active_step).addClass("incomplete");
                                                }
                                                else{
                                                    this.$el.find(".progressbar li").eq(this.active_step).removeClass("incomplete");
                                                }
                                            }
                                            if(validate>0 || parseInt(step_no) < this.active_step ){
                                            this.$el.find(".step-contents .step"+this.active_step).hide();
                                            this.active_step = parseInt(step_no);
                                            this.$el.find(".step-contents .step"+this.active_step).fadeIn(); 

                                            this.$el.find(".progressbar li:first")[0].className="step"+this.active_step;
                                            this.$el.find(".progressbar .active").removeClass("active");
                                            this.$el.find(".progressbar li").eq(this.active_step).addClass("active");

                                             //Making Button enable disable
                                            if(this.active_step==1){
                                                this.$el.find("a.backbtn").hide();
                                            }
                                            else{
                                                this.$el.find("a.backbtn").show();
                                            }

                                            if(this.active_step < this.total_steps){
                                                this.$el.find("a.nextbtn").show();
                                            }

                                            if(this.active_step == this.total_steps){
                                                this.$el.find("a.nextbtn").hide();
                                            }
                                        }
                                    }
                                }
                            }
                        },
			initialize: function () {
				this.template = _.template(template);				
				this.render();
                                this.active_step = this.options.active_step;
                                this.total_steps = this.options.steps;
			},

			render: function () {
                            this.$el.html(this.template({}));	
                            var step_area = app.get("wp_height") - 135;
                            //this.$el.find(".step-contents").css("height",step_area+"px");
                            
			},                        
                        initStep:function(){
                            this.$el.find(".wizard-steps").hide();
                            this.$el.find(".step"+this.active_step).show();
                            var _steps = this.$el.find(".progressbar li");
                            if(this.options.step_text && this.options.step_text.length){
                                var step_text = this.options.step_text;
                                _steps.each(function(i,step){                                    
                                    $(step).find("a").html(step_text[i]);
                                    $(step).attr("title",step_text[i]);
                                    
                                });
                            }
                            else{
                                _steps.addClass("no-text");
                            }
                            this.$(".progressbar li").tooltip({'placement':'bottom',delay: { show: 500, hide:10 }});
                            //Hides the back button on first step
                            this.$el.find("a.backbtn").hide();
                            
                        },
                        back:function(obj){
                           
                            this.$el.find(".step-contents .step"+this.active_step).hide();
                            this.active_step = parseInt(this.active_step)-1
                            this.$el.find(".step-contents .step"+this.active_step).fadeIn();
                            if(this.page.initStepCall){
                                this.page.initStepCall("step_"+parseInt(this.active_step));
                             }
                            //Moving Steps prgoress bar                            
                            this.$el.find(".progressbar .active").removeClass("active");
                            this.$el.find(".progressbar li").eq(this.active_step-1).addClass("active");
                            this.$el.find("a.backbtn span").remove();
                            //Making Button enable disable
                            if(this.active_step==1){
                                this.$el.find("a.backbtn").hide();
                            }
                            if(this.active_step < this.total_steps){
                                this.$el.find("a.nextbtn").show();
                            }
                           
                        },
                        validateStep:function(){
                            var validate = this.page.stepsCall("step_"+parseInt(this.active_step));
                            if(validate>-1){
                                if(validate===0){
                                        this.$el.find(".progressbar li").eq(this.active_step+1).addClass("incomplete");
                                    }
                                    else{
                                        this.$el.find(".progressbar li").eq(this.active_step+1).removeClass("incomplete");
                                 }
                            }  
                            else{
                                this.next();
                            }
                        },
                        next:function(obj){                            
                            
                            this.$el.find(".step-contents .step"+this.active_step).hide();
                            this.active_step = parseInt(this.active_step)+1
                            this.$el.find(".step-contents .step"+this.active_step).fadeIn();
                            if(this.page.initStepCall){
                                this.page.initStepCall("step_"+parseInt(this.active_step));
                               }

                            //Moving Steps prgoress bar                            
                            this.$el.find(".progressbar .active").removeClass("active");
                            this.$el.find(".progressbar li").eq(this.active_step-1).addClass("active");
                            this.$el.find("a.backbtn span").remove();
                            if(this.active_step==4){
                                this.$el.find("a.backbtn").append('<span>Back</span>');
                            }
                            //Making Button enable disable
                            if(this.active_step>1){
                                this.$el.find("a.backbtn").show();
                            }
                            if(this.active_step == 3)
                            {
                                    this.page.removeCSVUpload();
                            }
                            if(this.active_step==this.total_steps){
                                this.$el.find("a.nextbtn").hide();
                            }
                            
                            
                        }
		});
	});
