define(['jquery', 'underscore', 'backbone','text!templates/common/dialog.html'],
	function ($,_,Backbone, template) {
		'use strict';
		return Backbone.View.extend({			
                        className:'modal',
                        events: {
                            'click .btn-save':function(){
                                this.saveCall()
                            },
                            'click .toolbar .close':function(){
                                this.hide();
                            },
                            'click .btn-close':function(){
                                this.hide();
                            },
                            'click .innew-window':'popoutWindow'
                         },
			initialize: function () {
				this.template = _.template(template);				
				this.render();
			},
			render: function () {
                             this.$el.html(this.template({}));              
                                                          
                             this.$el.css(this.options.css ? this.options.css:{});
                             this.$(".dialog-title").html(this.options.title?this.options.title:'');                             
                             this.$(".modal-body").css(this.options.bodyCss ? this.options.bodyCss:{});
                             
                             if(this.options.headerEditable){
                                 this.$(".modal-header").removeClass("ws-notags")
                             }
                             if(this.options.buttons){
                                if(this.options.buttons.saveBtn){ 
                                    this.$(".modal-footer .btn-save").show();
                                    if(this.options.buttons.saveBtn.text){
                                        this.$(".modal-footer .btn-save span").html(this.options.buttons.saveBtn.text);
                                    }
                                    if(this.options.buttons.saveBtn.btnicon){
                                        this.$(".modal-footer .btn-save i").removeClass("save").addClass(this.options.buttons.saveBtn.btnicon);
                                    }
                                }
                                if(this.options.buttons.closeBtn){
                                    if(this.options.buttons.saveButtn.text){
                                        this.$(".modal-footer .btn-close span").html(this.options.buttons.closeBtn.text);
                                    }
                                }
                             }
                             if(this.options.headerIcon){
                                 this.$(".header-icon").addClass(this.options.headerIcon).show();
                                 this.$(".modal-header .c-name").addClass("header-icon")
                             }
                             if(this.options.newButtons){
                                 var _this = this;
                                 _.each(this.options.newButtons,function(v,k){
                                      var _btn =$('<a class="btn btn-blue right btn-custom" style="display: inline;"><span>'+v.btn_name+'</span><i class="icon update"></i></a>');
                                      _this.$(".btn-save").after(_btn);
                                      _btn.click(function(){
                                         _this.saveCall2();
                                      })
                                 });
                             }
                             if(this.options.newWindow){
                                 this.$(".innew-window").show();
                                 
                             }
                             this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
			},                        
                        show:function(){                          
                          this.$el.modal({backdrop: 'static',keyboard: false});
                          this.$el.modal("show");
                          this.$el.on('hidden', _.bind(function(){
                            this.$el.remove();                          
                            if($(".modal").length==0){
                                 $("#header,#activities").show();
                            }
                          },this))
                          $("#header,#activities").hide();
                        },
                        hide:function(){
                            
                            this.$el.modal("hide");
                           
                        },
                        getBody:function(){
                            return this.$(".modal-body");
                        },
                        saveCallBack:function(save){
                            this.saveCall = save;
                        },
                        saveCallBack2:function(update){
                            this.saveCall2 = update;
                        },
                        popoutWindow:function(){
                            var link = this.$("iframe")[0].src;
                            window.open(link,'WFMTRX_','width=800,height=600,left=50,top=50,screenX=100,screenY=100,scrollbars=yes,status=yes,resizable=yes');
                            this.hide();
                        }
                        
		});
	});
