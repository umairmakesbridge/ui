define(['text!account/html/updatesalesreps.html','account/collections/salesrep','account/salesrep_row'],
        function (template,salesrepCollection,salesrepRow) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'updatesalesreps setting-section',                
                events: {                    
                    'click .create_new':function(){this.updateSalerep()},
                    'click .add-salerep-field':'createSalerepField'
                },
                initialize: function () {
                    this.template = _.template(template);       
                    this.salesrepRequest = new salesrepCollection();  
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                    
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {    
                  this.$salesrepContainer = this.$("#salesrep_grid tbody");    
                  this.loadSalesRep();                   
                },
                loadSalesRep:function(){
                    var remove_cache = false;      
                    this.offset = 0;
                    var _data = {offset:this.offset,type:'allSalesreps', bucket:5000}; 
                    this.$salesrepContainer.html('<tr class="loading-campagins"><td colspan="3"><div class="loadmore"><img src="img/loading.gif" alt=""/><p>Please wait, loading salesrep...</p></div></td></tr>');
                    this.salesrepRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                            // Display items
                            if(this.app.checkError(response)){
                                return false;
                            }
                            this.$salesrepContainer.children().remove();
                            for(var s=this.offset;s<collection.length;s++){
                                var salesrepView = new salesrepRow({ model: collection.at(s),sub:this });                                                                                            
                                this.$salesrepContainer.append(salesrepView.$el);                               
                            }                                                                                

                        }, this),
                        error: function (collection, resp) {

                        }
                  });
                },
                updateSalerep:function(id,readonly){
                    var dialog_width = 1100;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var _title = id? 'Update Sales Rep' : 'Add Sales Rep';
                    var btn_prp = {title: _title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'manageaccount-w',
                        bodyCss:{"min-height":dialog_height+"px"},
                        buttons: {saveBtn: {text: _title, btnicon: 'save'}}
                    }
                    if(readonly){
                        delete btn_prp['buttons'].saveBtn;
                    }
                    var dialog = this.app.showDialog(btn_prp);
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["account/addeditsalerep"], _.bind(function(page) {
                        var pageView = new page({sub: this,user_id:id,readonly:readonly});
                        dialog.getBody().html(pageView.$el);
                        dialog.saveCallBack(_.bind(pageView.updateSalerep, pageView, dialog));
                        pageView.init();
                    },this));
                },
                createSalerepField: function (  ) {
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Add Sales Rep Field',
                      buttnText: 'Add',
                      bgClass :'no-tilt',
                      plHolderText : 'Enter field name here',
                      emptyError : 'Field name can\'t be empty',
                      createURL : '/pms/io/user/setSalesrepData/',
                      fieldKey : "fName",
                      createNote:'New field will be added against all SalesReps.',
                      postData : {type:'addField',BMS_REQ_TK:this.app.get('bms_token')},
                      saveCallBack :  _.bind(this.createField,this)
                    });
                },
                createField: function(txt,json){
                    if(json[0]=="success" || json.success){                        
                        this.app.showMessge("Sales rep field created Successfully!");
                    }
                }
            });
        });
