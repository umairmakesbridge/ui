define(['text!common/html/ftpupload.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                events: {                    },
                initialize: function () {
                    this.app = this.options.app;     
                    this.template = _.template(template);                                        
                    this.render();
                },
                render: function ()
                {                     
                   this.$el.html(this.template({})); 
                   
                },
                init: function () {
                    this.showLoadingMask();
                    this.current_ws = this.$el.parents(".ws-content");                                                            
                    this.app.removeSpinner(this.$el);                                        
                    this.$(".ftpuploadiframe").load(_.bind(function () {
                        this.app.showLoading(false,this.$el);                        
                        
                    },this))
                },
                resizeHeight:function(height){
                    this.$(".ftpuploadiframe").css("height",height+"px");
                },
                showLoadingMask:function(msg,reduceHeight){
                    if(reduceHeight){
                        this.$(".ftpuploadiframe").attr("src","about:blank").css("height","400px");
                    }
                    this.app.showLoading(msg?msg:"Loading FTP Uploads...",this.$el);    
                },
                loadInstructionDialog: function(){                                        
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = this.app.showDialog({title: 'File Layout Instruction',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'helptitle',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    var help_text = '<div class="clearfix">';                    
                    help_text += '<iframe src="/pms/schedule/FTPListUploadInstruction.jsp?BMS_REQ_TK='+this.app.get('bms_token')+'&fromNewUI=true" width="100%" class="helpftpupload" frameborder="0" style="height:100%;height:'+(dialog_height-15)+'px"></iframe></div>';                                        
                    dialog.getBody().html(help_text);                    
                    this.app.showLoading("Loading Instruction...",dialog.getBody());
                    dialog.getBody().find(".helpftpupload").load(_.bind(function () {
                        this.app.showLoading(false,dialog.getBody());                                                
                    },this));
                }
                

            });
        });
