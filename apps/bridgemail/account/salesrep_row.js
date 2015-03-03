define(['text!account/html/salesrep_row.html','moment'],
function (template,moment) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Sal Rep Row View to show on salesrep listing (Sub Account Management)
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'tr',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .delete-salesrep':'confirmDelete',
              'click .edit-salesrep':'editSalerep',
              'click .view-salesrep':'viewSalerep'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.parent = this.options.sub;      
                    this.app = this.parent.app;
                    this.template = _.template(template);				                                                      
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                    
                var _dateTime = this.getDate();
                this.$el.html(this.template({
                    model: this.model,
                    time : _dateTime.time,
                    date : _dateTime.date
                }));                
                this.initControls();  
               
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            },
            getDate:function(){
                var updationTime = this.model.get("updationTime")?this.model.get("updationTime"):this.model.get("creationTime");
                if(updationTime){
                    var _date = moment(this.app.decodeHTML(updationTime),'YYYY-MM-DD HH:mm');
                    return {date:_date.format("DD MMM, YYYY"),time:_date.format("HH:mm")};
                }
                else{
                    return {date:"_",time:"_"};
                }
                                
            },
            confirmDelete:function(){
                this.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this Sales Rep?",                                                
                            callback: _.bind(function(){													
                                    this.delSalesrep();
                            },this)},
                    $("body"));                                                         
            },
            editSalerep:function(){                
                this.parent.updateSalerep(this.model.get('salesrepNumber.encode'));
                                            
            },
            viewSalerep: function(){
                this.parent.updateSalerep(this.model.get('salesrepNumber.encode'),true);
            },
            delSalesrep:function(){
               this.app.showLoading("Deleting Sales Rep...",this.parent.$el);
               var URL = "/pms/io/user/setSalesrepData/?BMS_REQ_TK="+this.app.get('bms_token');
               $.post(URL, {type:'delete',salesrepNumber:this.model.get("salesrepNumber.encode")})
                .done(_.bind(function(data) {                  
                       this.app.showLoading(false,this.parent.$el);   
                       var _json = jQuery.parseJSON(data);        
                       if(_json[0]!=='err'){
                            this.app.showMessge("Sales rep deleted Successfully!");
                            this.$el.fadeOut(function(){
                                $(this).remove();
                            })
                       }
                       else{
                           this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                       }
               },this));
            }
        });
});