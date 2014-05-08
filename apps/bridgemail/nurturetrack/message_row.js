define(['text!nurturetrack/html/message_row.html','jquery-ui','bms-addbox'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Target li view for nurture track 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'accordion-group message-nurturetrack',
            /**
             * Attach events on elements in view.
            */
            events: {
             'click .delete-row':'deleteRow',
             'click .btn-group button':'showTimer',
             'click .edit-message ':'editMessage'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page;
                    this.btnRow = this.options.buttonRow;
                    this.object = this.options.object;
                    if(this.object){
                        this.messageLabel = this.object[0]["label"];
                    }
                    else{
                        this.messageLabel = 'Message Label';
                    }
                    this.triggerOrder = this.options.triggerOrder;                    
                    this.app = this.parent.app;                    
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({
                    model: this.model,
                    no : this.triggerOrder,
                    title: this.messageLabel
                }));                
                this.$(".btn-group").t_button();               
                this.$(".timebox-hour").spinner({max: 12,min:1
                });
                this.$(".timebox-min").spinner({max: 59,min:0,stop: function( event, ui ) {
                            if($(this).val().length==1){
                                $(this).val("0"+$(this).val())
                            }
                     }
                });
                this.$(".title").addbox({app:this.app,addBtnText:'Save',placeholder_text:'Write Message Name here',
                                        addCallBack:_.bind(this.renameLabel,this)
                                        ,showCallBack:_.bind(this.showLabel,this)
                                        });
            },
            deleteRow:function(){
                this.$el.remove();
                if(this.btnRow){
                    this.btnRow.remove();                    
                }
                if(this.triggerOrder){
                var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'deleteMessage',trackId:this.parent.track_id,triggerOrder:this.triggerOrder})
                    .done(_.bind(function(data) {                                             
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                           
                                
                           }
                           else{
                               this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                           }
                   },this));
                }   
            },
            showTimer:function(e){
                var btn = $.getObj(e,"button");
                if(btn.attr("rel")=="i"){
                    this.$(".set-time").hide();
                }
                else{
                    this.$(".set-time").show();
                }
            },
            renameLabel:function(label,ele){
                if(this.triggerOrder){
                    var add_box = ele.data("addbox");
                    add_box.dialog.find(".btn-add").addClass("saving");
                    add_box.dialog.find(".input-field").attr("disabled",true);
                    var URL =  URL = "/pms/io/trigger/saveNurtureData/";
                    var post_data = {BMS_REQ_TK:this.app.get('bms_token'),trackId:this.parent.track_id,type:"labelMessage",label:label,triggerOrder:this.triggerOrder};
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {                          
                        add_box.dialog.find(".btn-add").removeClass("saving");                        
                        add_box.dialog.find(".input-field").attr("disabled",false);
                        add_box.hideBox();
                        var _json = jQuery.parseJSON(data); 
                        if(_json[0]!=="err"){
                            this.messageLabel = label;
                            this.$(".title").html(label);
                            this.app.showMessge("Message label renamed Successfully!");
                        }
                        else{
                            this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
                    },this));
                }   
            },
            showLabel:function(ele){
                ele.val(this.messageLabel);
            },
            editMessage:function(){
                var dialog_width = $(document.documentElement).width()-50;
                var dialog_height = $(document.documentElement).height()-162;
                var dialog = this.app.showDialog({title:"'"+this.messageLabel+"' Settings",
                        css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                        headerEditable:false,                          
                        bodyCss:{"min-height":dialog_height+"px"},
                        buttons: {saveBtn:{text:'Save'} }
                });                        

                require(["nurturetrack/message_setting"],_.bind(function(settingPage){
                    var sPage = new settingPage({page:this});    
                    dialog.getBody().html(sPage.$el);
                    sPage.init();
                },this));      
            }
            
        });
});