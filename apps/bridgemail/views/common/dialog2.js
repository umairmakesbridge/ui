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
                            'click .dialog-backbtn':'showPrevious'
                         },
			initialize: function () {
				this.template = _.template(template);
                               // this.optionObj = {};
                                this.app = this.options.app;
                                this.option = this.options;
                                //this.optionObj[this.options.wrapDiv] = this.option;
                                
				this.render();
			},
			render: function () {
                             //console.log(this.optionObj);
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
                                /*if(this.option.buttons.playBtn){
                                    if(this.option.buttons.playBtn.text){
                                        this.$(".modal-footer .btn-play span").html(this.option.buttons.playBtn.text);
                                    }
                                }*/
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
                            this.$('#dialog-title').html('<i class="icon left header-icon" style="display:none"></i><span class="dialog-title"></span><div class="pointy"><a class="icon edit"></a><a class="icon copy"></a><a class="icon delete"></a></div>');
                             
                            this.$el.css(this.option.css ? this.option.css:{});
                            this.$(".modal-body").css(this.option.bodyCss ? this.option.bodyCss:{}); 
                            this.$(".dialog-title").html(this.option.title?this.option.title:'');
                            if(this.option.headerEditable){
                                 this.$(".modal-header").removeClass("ws-notags").addClass('header-editable-highlight');
                                 this.$('.pointy a.copy').remove();
                                 this.$('.pointy').html('<a class="icon edit"></a><a class="icon copy"></a><a class="icon delete"></a>');
                                 
                             }else{
                                 this.$(".modal-header").removeClass("header-editable-highlight").addClass('ws-notags');
                                 this.$("#dialog-title span").unbind( "click" );
                                 if(this.option.isAutobot===true){
                                     this.$('.pointy').html('<a class="icon edit"></a><a class="icon copy"></a><a class="icon delete"></a>');
                                 }
                             }
                             
                              if(this.option.headerIcon){
                                 this.$('#dialog-title i').removeAttr('class');
                                 this.$("#dialog-title i").addClass('icon left header-icon '+this.option.headerIcon).show();
                                 this.$(".modal-header .c-name").addClass("header-icon");
                             }
                             if(this.option.tagRegen){
                                     this.$('.tagscont').html('').show();
                                 }
                                 if(this.option.reattach){
                                            this.reattachEvents();
                                        }
                           
                        },
                        dialogFooter: function(options){
                            if(options){
                                 this.option =options;
                             }
                             this.$('.modal-footer').html('<a class="btn-yellow left backbtn dialog-backbtn" title="You can always go back to previous dialog by clicking on back button" style="display: none;"><i class="icon back left"></i><span>Back</span></a><a class="btn-gray btn-close right"><span>Close</span><i class="icon cross"></i></a><a style="display:none;" class="btn btn-blue btn-save right"><span>Save Target</span><i class="icon save"></i></a>');
                             this.$(".dialog-backbtn").tooltip({'placement':'right',delay: { show: 0, hide:0 },animation:true,trigger:"manual"});
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
                                if(this.option.buttons.playBtn){
                                    if(this.option.buttons.playBtn.text){
                                        this.$(".modal-footer .btn-play span").html(this.option.buttons.playBtn.text);
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
                           if(this.app.dialogArray.length>1){
                            this.showPrevious();
                           
                           }else{    
                            this.$el.modal("hide");
                            this.doubleBlackOut(false);
                           if($("body > .overlay,.modal-backdrop").length==0){
                                $("body").css("overflow-y","auto");
                            }
                          }  
                        },
                        getBody:function(){
                            return this.$(".modal-body");
                        },
                        getFooter:function(){
                            return this.$(".modal-footer");
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
                           if(length > 1){
                            var showElement = length-1;
                            var removeElement = length;
                            this.app.dialogArray.pop();
                            $('.dialogWrap-'+removeElement).remove();
                            //delete this.optionObj[removeElement];
                            $('.dialogWrap-'+showElement).show();
                            this.dialogFooter(this.app.dialogArray[showElement-1]);
                            this.dialogHeader(this.app.dialogArray[showElement-1]);
                            this.saveCallBack(this.app.dialogArray[showElement-1].saveCall);
                           //this.render(this.optionObj[showElement]);
                            var newLength = this.app.dialogArray.length;
                            if(newLength === 1){
                                    this.$('.dialog-backbtn').hide();
                                }else{
                                    this.$('.dialog-backbtn').show();
                                }
                            }else{
                                this.hide();
                            }
                        },
                        reattachEvents : function(){
                           
                            var length = this.app.dialogArray.length;
                            var showElement = length-1;
                            var currentview = this.app.dialogArray[showElement].currentView;
                            currentview.ReattachEvents();
                            
                        }
                        
		});
	});
