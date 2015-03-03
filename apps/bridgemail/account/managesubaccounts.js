define(['text!account/html/managesubaccounts.html','account/collections/subaccounts','account/subaccount_row'],
        function (template,subaccountCollection,subaccountRow) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'managesubaccounts setting-section',                
                events: {                    
                    'click .create_new':function(){this.updateSubAccount()}
                },
                initialize: function () {                    
                    this.template = _.template(template);                       
                    this.apps = this.options.apps;      
                    this.postObject = this.options.postObj;
                    this.subaccountRequest = new subaccountCollection();  
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                                        
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {                   
                   this.$subaccountsContainer = this.$("#subaccount_grid tbody");  
                   
                   this.loadSubAccounts();                   
                },
                loadSubAccounts:function(){
                    var remove_cache = false;      
                    this.offset = 0;
                    var _data = {offset:this.offset,type:'allOperators'};                                        
                    this.subaccountRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                            // Display items
                            if(this.app.checkError(response)){
                                return false;
                            }                            
                            this.$subaccountsContainer.children().remove();
                            for(var s=this.offset;s<collection.length;s++){
                                var subaccountView = new subaccountRow({ model: collection.at(s),sub:this });                                                                                            
                                this.$subaccountsContainer.append(subaccountView.$el);                               
                            }                                                                                

                        }, this),
                        error: function (collection, resp) {

                        }
                  });
                },
                updateSubAccount: function(id){                    
                    var dialog_width = 1100;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var _title = id? 'Update Sub Account' : 'Add Sub Account';
                    var btn_prp = {title: _title,
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: false,
                        headerIcon: 'manageaccount-w',
                        bodyCss:{"min-height":dialog_height+"px"},
                        buttons: {saveBtn: {text: _title, btnicon: 'save'}}
                    }
                    var dialog = this.app.showDialog(btn_prp);
                    this.app.showLoading("Loading...", dialog.getBody());
                    require(["account/addeditsubaccount"], _.bind(function(page) {
                        var pageView = new page({sub: this,user_id:id,apps:this.apps,parent_acc:this.postObject});
                        dialog.getBody().html(pageView.$el);
                        dialog.saveCallBack(_.bind(pageView.updateSubAccount, pageView, dialog));
                        pageView.init();
                    },this));
                }
                
            });
        });
