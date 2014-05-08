define(['text!nurturetrack/html/targetli.html','moment'],
function (template,moment) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Target li view for nurture track 
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'li',
            /**
             * Attach events on elements in view.
            */
            events: {
             'click .btn-red':'removeLi'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page
                    this.app = this.parent.app;
                    this.target = null;
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {  
                this.getTarget();
                this.$el.html(this.template({
                    model: this.target,
                    countDate:this.getDate()
                }));                
                               
            },
            /**
             * Render date as .
            */
            getDate:function(){
                var _date = moment(this.app.decodeHTML(this.target.updationDate),'YYYY-M-D');
                return {date:_date.format("DD MMM, YYYY")};
                                
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                
            },
            getTarget:function(){
                
                var targets_list_json = this.app.getAppData("targets"); 
                _.each(targets_list_json.filters[0],function(val){
                    if(val[0]["filterNumber.checksum"]==this.model.checksum){
                        this.target = val[0];
                        return {};
                    }
                },this);
            },
            removeLi:function(){
                this.$el.remove();
                if(this.parent.targets){
                    _.each(this.parent.targets,function(val,key){
                        if(val[0].checksum==this.target["filterNumber.checksum"]){
                            delete  this.parent.targets[key];
                            return {};
                        }
                    },this);
                }
                this.parent.saveTargets();
            }
            
        });
});