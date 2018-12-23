define(['text!tipandtest/html/step_view.html','tipandtest/collections/steps','tipandtest/step_tile'],
function (template,stepsCollection,stepView) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nurture track preview view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'overlay',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .close':'closeView'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.stepsRequest = new stepsCollection();    
                    this.template = _.template(template);				
                    this.parent = this.options.page;
                    this.hideReport = this.options.hideReport;
                    this.app = this.parent.app;
                    this.trackId = this.parent.model.get("workflowId");
                    this.trackName = this.parent.model.get('name');
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                                    
                this.$el.html(this.template({
                    name:this.trackName,
                    count:this.parent.model.get('stepSize')
                }));                
                this.initControls();                 
            },
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
                $("body").css("overflow-y","hidden");
                this.$el.on("click",_.bind(this.closeView,this));
            },
            closeView:function(){
                this.$el.remove();
                if($("body > .overlay,.modal-backdrop").length==0){ 
                    $("body").css("overflow-y","auto");
                }                
            },
            init:function(){
                this.setSize();
                this.offset = 0;
                this.app.showLoading('Loading Steps...',this.$el); 
                var _data = {offset:this.offset,type:'info',workflowId:this.trackId,level:"1"};
                this.message_request = this.stepsRequest.fetch({data:_data,remove:true,
                    success: _.bind(function (collection, response) {                                
                        // Display items
                        if(this.app.checkError(response)){
                            return false;
                        }
                        this.app.showLoading(false,this.$el);                                                                                                     
                        for(var s=this.offset;s<collection.length;s++){
                            var _model = collection.at(s);
                            var _view = new stepView({ model: _model,page:this });                                                            
                            this.$(".thumbnails").append(_view.$el);                                                                                                           
                        }                                   
                                   
                    }, this),
                    error: function (collection, resp) {
                            
                    }
                });
            },
            setSize:function(){
                var _height = $(document.documentElement).height()-75;
                this.$(".message-container").css("height",_height+"px");
            }
            
        });
});