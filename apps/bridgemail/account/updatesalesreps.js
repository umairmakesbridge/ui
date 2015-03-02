define(['text!account/html/updatesalesreps.html','account/collections/salesrep','account/salesrep_row'],
        function (template,salesrepCollection,salesrepRow) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'updatesalesreps setting-section',                
                events: {                    
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
                    var _data = {offset:this.offset,type:'allSalesreps'};                                        
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
                }
            });
        });
