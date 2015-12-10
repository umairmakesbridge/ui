define(['text!nurturetrack/html/targetli.html'],
function (template) {
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
             'click .btn-red':'removeLi',
             'click .badge':'showPopulation'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.page
                    this.app = this.parent.app;
                    this.editable = this.options.editable;
                    this.target = null;
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({
                    model: this.model,
                    countDate:this.getDate()
                }));                
                               
            },
            /**
             * Render date as .
            */
            getDate:function(){
                var _date = moment(this.app.decodeHTML(this.model.get("updationDate")),'YYYY-M-D');
                return {date:_date.format("DD MMM, YYYY")};
                                
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                
            },
            removeLi:function(){
                this.$el.remove();
                if(this.parent.targets){
                    _.each(this.parent.targets,function(val,key){
                        if(val[0].checksum==this.model.get("filterNumber.checksum")){
                            delete  this.parent.targets[key];    
                            var index =parseInt(key.substring(6))-1;
                            this.parent.targetsModelArray.splice(index,1);
                            return {};
                        }
                    },this);
                }
                this.parent.saveTargets();
            },
            showPopulation:function(){
                if(this.model.get("populationCount")!=="0"){
                    var that = this;
                     var dialog_title = "Pouplation of '"+this.model.get("name")+"'";
                    var listNum = this.model.get("filterNumber.encode");
                    var dialog = this.app.showDialog({title:dialog_title,
                            css:{"width":"900px","margin-left":"-425px"},
                            bodyCss:{"min-height":"250px",'max-height':"500px"},                
                            headerIcon : 'population'
                    });

                    require(["recipientscontacts/rcontacts"],function(Contacts){
                      var objContacts = new Contacts({app:that.app,listNum:listNum,type:'target'});
                        dialog.getBody().html(objContacts.$el);
                        objContacts.$el.find('#contacts_close').remove();
                        objContacts.$el.find('.temp-filters').removeAttr('style');

                    });
                }
            }
            
        });
});