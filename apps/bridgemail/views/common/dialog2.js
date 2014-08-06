define(['jquery', 'underscore', 'backbone','text!templates/common/dialog2.html'],
	function ($,_,Backbone, template) {
		'use strict';
		return Backbone.View.extend({			
                        className:'modal',
                        events: {
                            'click .btn-save':function(){
                                this.saveCall();
                            },
                            'click .toolbar .close':function(){
                                this.hide();
                            },
                            'click .btn-close':function(){
                                this.hide();
                            },
                            'click .innew-window':'popoutWindow',
                            'click .backbtn':'showPrevious'
                         },
			initialize: function () {
				this.template = _.template(template);
                                this.optionObj = {};
                                this.app = this.options.app;
                                this.option = this.options;
                                this.optionObj[this.options.wrapDiv] = this.option;
                                
				this.render();
			},
			render: function () {
                             console.log(this.optionObj);
                             this.$el.html(this.template({}));              
                             this.dialogHeader();                           
                             //this.$el.css(this.option.css ? this.option.css:{});
                            // this.$(".dialog-title").html(this.option.title?this.option.title:'');                             
                             //this.$(".modal-body").css(this.option.bodyCss ? this.option.bodyCss:{});
                             
                             /*if(this.option.headerEditable){
                                 this.$(".modal-header").removeClass("ws-notags").addClass('header-editable-highlight');
                             }*/
                             if(this.option.buttons){
                                 this.dialogFooter();
                                /*if(this.option.buttons.saveBtn){ 
                                    this.$(".modal-footer .btn-save").show();
                                    if(this.option.buttons.saveBtn.text){
                                        this.$(".modal-footer .btn-save span").html(this.option.buttons.saveBtn.text);
                                    }
                                    if(this.option.buttons.saveBtn.btnicon){
                                        this.$(".modal-footer .btn-save i").removeClass("save").addClass(this.option.buttons.saveBtn.btnicon);
                                    }
                                }*/
                                if(this.option.buttons.closeBtn){
                                    if(this.option.buttons.saveButtn.text){
                                        this.$(".modal-footer .btn-close span").html(this.option.buttons.closeBtn.text);
                                    }
                                }
                                if(this.option.buttons.playBtn){
                                    if(this.option.buttons.playBtn.text){
                                        this.$(".modal-footer .btn-play span").html(this.option.buttons.playBtn.text);
                                    }
                                }
                             }
                             if(this.option.headerIcon){
                                 this.$(".header-icon").addClass(this.option.headerIcon).show();
                                 this.$(".modal-header .c-name").addClass("header-icon");
                             }
                             if(this.option.overlay){
                                
                                 this.doubleBlackOut(this.option.overlay);
                                 
                             }
                             if(this.option.newButtons){
                                 var _this = this;
                                 _.each(this.option.newButtons,function(v,k){
                                      var _btn =$('<a class="btn btn-blue right btn-custom" style="display: inline;"><span>'+v.btn_name+'</span><i class="icon update"></i></a>');
                                      _this.$(".btn-save").before(_btn);
                                      _btn.click(function(){
                                         _this.saveCall2();
                                      })
                                 });
                             }
                             if(this.option.newWindow){
                                 this.$(".innew-window").show();
                                 
                             }
                             this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
			},
                        dialogHeader: function(options){
                            if(options){
                                 this.option =options;
                             }
                            this.$el.css(this.option.css ? this.option.css:{});
                            this.$(".modal-body").css(this.option.bodyCss ? this.option.bodyCss:{}); 
                            this.$(".dialog-title").html(this.option.title?this.option.title:'');
                            if(this.option.headerEditable){
                                 this.$(".modal-header").removeClass("ws-notags").addClass('header-editable-highlight');
                             }else{
                                 this.$(".modal-header").removeClass("header-editable-highlight").addClass('ws-notags');
                                 this.$("#dialog-title span").unbind( "click" );
                             }
                           
                        },
                        dialogFooter: function(options){
                            if(options){
                                 this.option =options;
                             }
                             if(this.option.buttons){
                                if(this.option.buttons.saveBtn){ 
                                    this.$(".modal-footer .btn-save").show();
                                    if(this.option.buttons.saveBtn.text){
                                        this.$(".modal-footer .btn-save span").html(this.option.buttons.saveBtn.text);
                                    }
                                    if(this.option.buttons.saveBtn.btnicon){
                                        this.$(".modal-footer .btn-save i").removeClass("save").addClass(this.option.buttons.saveBtn.btnicon);
                                    }
                                }
                                 
                            }else{
                                this.$(".modal-footer .btn-save").hide();
                            }
                            
                        },
                        doubleBlackOut:function(show){
                            if(show){
                                $('.modal').css('z-index',-1);
                                this.$el.css('z-index',1001);
                            }else{
                                $('.modal').css('z-index',1001);
                                this.$el.css('z-index',-1);
                            }
                            
                        },
                        show:function(){                          
                          this.$el.modal({backdrop: 'static',keyboard: false});
                          this.$el.modal("show");
                          
                          this.$el.on('hidden', _.bind(function(){
                          //  this.$el.parent().find('div.modal-backdrop').first().show();
                            this.$el.remove();     
                            this.app.isDialogExists = false;
                            this.$('.backbtn').hide();
                            this.app.dialogArray.length = 0;
                            if($(".modal").length==0){
                                 $("#header,#activities").show();
                            }
                          },this))
                         
                          $("#header,#activities").hide();
                          $("body").css("overflow-y","hidden");
                        },
                        hide:function(){                            
                            this.$el.modal("hide");
                            this.doubleBlackOut(false);
                           if($("body > .overlay,.modal-backdrop").length==0){
                                $("body").css("overflow-y","auto");
                            }
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
                        },
                        showPrevious : function(){
                            var length = this.app.dialogArray.length;
                            var showElement = this.app.dialogArray[length-2];
                            var removeElement = this.app.dialogArray.pop();
                            $('.'+removeElement).remove();
                            delete this.optionObj[removeElement];
                            $('.'+showElement).show();
                           this.dialogHeader(this.optionObj[showElement]);
                           this.dialogFooter(this.optionObj[showElement]);
                           //this.saveCallBack(this.optionObj[showElement].saveCallBack);
                           //this.render(this.optionObj[showElement]);
                            var newLength = this.app.dialogArray.length;
                            if(newLength === 1){
                                this.$('.backbtn').hide();
                            }
                        }
                        
		});
	});
