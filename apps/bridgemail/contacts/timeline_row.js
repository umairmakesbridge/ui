define(['text!contacts/html/timeline_row.html','moment'],
function (template,moment) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Time line row view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({          
            className:"filter-row _row",
            mapping:{"SU":{"name":"Signup Form","action":"Form","cssClass":"form"},"CS":{"name":"Campaign Sent","action":"Campaign","cssClass":"email"}
                    ,"OP":{"name":"Campaign Open","action":"Campaign","cssClass":"email"}
                    ,"CK":{"name":"Article Click","action":"Campaign","cssClass":"email"},"MT":{"name":"Single Message Sent","action":"Email","cssClass":"email"}
                    ,"MO":{"name":"Single Message Open","action":"Email","cssClass":"email"},"MC":{"name":"Single Message URL Click","action":"Email","cssClass":"email"}
                    ,"MS":{"name":"Single Message Surpress","action":"Email","cssClass":"email"}
                    ,"WM":{"name":"WF C2Y Trigger Mail","action":"Workflow","cssClass":"email"},"MM":{"name":"MY C2Y Trigger Mail","action":"Workflow","cssClass":"email"}
                    ,"UN":{"name":"Unsubscribe","action":"Campaign","cssClass":"email"},"SP":{"name":"Suppress","action":"Campaign","cssClass":"email"}
                    ,"SC":{"name":"Score Change","action":"Score","cssClass":"score"},"TF":{"name":"Tell a friend","action":"Campaign","cssClass":"email"}
                    ,"WV":{"name":"Web Visit","action":"Web","cssClass":"web"},"WA":{"name":"Workflow Alert","action":"Workflow","cssClass":"email"}},
            /**
             * Attach events on elements in view.
            */
            events: {
             
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                this.template = _.template(template);				
                this.sub = this.options.sub         
                this.app = this.sub.app;
                this.render();
                //this.model.on('change',this.renderRow,this);
            },
            /**
             * Render view on page.
            */
            render: function () {                                    
                var dateTime= this.getActivityDate();
                var _name =this.model.get("name")?this.model.get("name"):this.mapping[this.model.get("activityType")].name;
                this.$el.html(this.template({       
                    date:dateTime.date,
                    time:dateTime.time,
                    name:this.model.get("activityType")+" - "+this.app.decodeHTML(_name),
                    action:this.mapping[this.model.get("activityType")].name
                }));                                
                this.$el.addClass(this.mapping[this.model.get("activityType")].cssClass)
                this.initControls();    
            },            
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                
                //this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
              
            },
            getActivityDate:function(){
                var _date = moment(this.app.decodeHTML(this.model.get("activityDate")),'YYYY-M-D H:m');
                return {date:_date.format("DD MMM YYYY"),time:_date.format("hh:mm A")};
            }
            
            
        });
});