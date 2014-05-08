define(['text!nurturetrack/html/wait_row.html','jquery.chosen','datetimepicker'],
function (template,highlighter) {
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
                'click .btn-group button':'showWait',
                'click .calendericon':function(){this.$("#waitdatetime").focus()}
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page;
                    this.triggerOrder = this.options.triggerOrder;
                    this.btnRow = this.options.buttonRow;
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
                this.$("#waitdatetime").datetimepicker();                                
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
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
            showWait:function(e){
                var btn = $.getObj(e,"button");
                this.$(".wait-select").hide();
                this.$("."+btn.attr("rel")+"-select").css("display","inline-block");
            }
            
            
        });
});