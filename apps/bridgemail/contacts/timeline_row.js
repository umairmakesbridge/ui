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
            mapping:{
                    "SU":{"name":"Signup Form","action":"Form","cssClass":"signupform"}
                    ,"CS":{"name":"Campaign Sent","action":"Campaign","cssClass":"campaignsent"}
                    ,"OP":{"name":"Campaign Open","action":"Campaign","cssClass":"campaignopen"}
                    ,"CK":{"name":"Email Click","action":"Campaign","cssClass":"articleclick"}
                    ,"MT":{"name":"Single Message Sent","action":"Email","cssClass":"messagesent"}
                    ,"MO":{"name":"Single Message Open","action":"Email","cssClass":"messageopen"}
                    ,"MC":{"name":"Single Message URL Click","action":"Email","cssClass":"messageclick"}
                    ,"MS":{"name":"Single Message Surpress","action":"Email","cssClass":"suppress"}
                    ,"WM":{"name":"WF C2Y Trigger Mail","action":"Workflow","cssClass":"workflowc2y"}
                    ,"MM":{"name":"MY C2Y Trigger Mail","action":"Workflow","cssClass":"myc2y"}
                    ,"UN":{"name":"Unsubscribe","action":"Campaign","cssClass":"unsubscribed"}
                    ,"SP":{"name":"Suppress","action":"Campaign","cssClass":"suppress"}
                    ,"SC":{"name":"Score Change","action":"Score","cssClass":"scorechange"}
                    ,"TF":{"name":"Tell a friend","action":"Campaign","cssClass":"tellafriend"}
                    ,"WV":{"name":"Web Visit","action":"Web","cssClass":"webvisit"}
                    ,"WA":{"name":"Workflow Alert","action":"Workflow","cssClass":"workflowalert"}
                    ,"CT":{"name":"Campaign Conversions","action":"Campaign","cssClass":"campaignopen"}
                    ,"CB":{"name":"Email Bounced","action":"Email","cssClass":"articleclick"}
                    ,"A":{"name":"Workflow Alert","action":"Workflow","cssClass":"workflowalert"}
                    ,"N":{"name":"Workflow Do Nothing","action":"Workflow","cssClass":"workflowalert"}
                    ,"W":{"name":"Workflow Wait","action":"Workflow","cssClass":"workflowalert"}                    
                },
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
                var _data = this.filterData();
                this.$el.html(this.template({       
                    date:dateTime.date,
                    time:dateTime.time,
                    name:_data.name,
                    summary:_data.summary,
                    action:this.mapping[this.model.get("activityType")].name ,
                    type : this.model.get("activityType")
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
                var _date = moment(this.app.decodeHTML(this.model.get("logTime")),'M/D/YYYY H:m');
                return {date:_date.format("DD MMM YYYY"),time:_date.format("hh:mm A")};
                                
            },
            filterData:function(){
                var model = this.model;
                var title ="";//model.get("name")?this.model.get("name"):this.mapping[this.model.get("activityType")].name;                    
                var preview_id = "";
                var summary = "";
                switch(model.get("activityType")){
                   //Campaign Open 
                   case "OP":
                       title += model.get("subject")?model.get("subject"):"No Subject";
                       preview_id = model.get("id");
                    break;
                    //Campaign Sent
                    case "CS":
                       title += model.get("subject");
                       preview_id = model.get("id");
                    break;      
                     //Signup Form
                    case "SU":
                       title += model.get("formName");
                       preview_id = model.get("id");
                    break;
                    //Article Click
                    case "CK":
                       title += model.get("subject");
                       preview_id = model.get("id");
                       summary = model.get("articleURL")?("<b>Page Visit</b> : <a  target='_blank' href='"+model.get("articleURL")+"'>"+model.get("articleTitle")+"</a>"):""; 
                    break;
                    //Single Message Sent
                    case "MT":
                       title += model.get("subject");
                       preview_id = model.get("id");                       
                    break;
                    //Single Message Open
                    case "MO":
                       title += model.get("subject");
                       preview_id = model.get("id");                       
                    break;
                    //Single Message URL Click
                    case "MC":
                       title += model.get("subject");
                       preview_id = model.get("id");
                       summary = model.get("url")?("<b>Page Visit</b> : <a  target='_blank' href='"+model.get("url")+"'>"+model.get("url")+"</a>"):"";                       
                    break;
                    //Single Message Suppress
                    case "MS":
                       title += model.get("subject");
                       preview_id = model.get("id");                       
                    break;
                    //WF C2Y Trigger Mail
                    case "WM":
                       title += model.get("workflowName");                       
                    break;
                    //MY C2Y Trigger Mail
                    case "MM":
                       title += model.get("name");                       
                       preview_id = model.get("id");                       
                    break;
                    //Unsbscribe
                    case "UN":
                       title += model.get("subject");                       
                       preview_id = model.get("id");                       
                    break;
                    //Supress
                    case "SP":
                       title += model.get("subject");                       
                       preview_id = model.get("id");                       
                    break;
                    //Score Change
                    case "SC":
                       title += model.get("score");                                                                  
                    break;
                    //Tell a friend
                    case "TF":
                       title += model.get("subject");                       
                       preview_id = model.get("id");                                                              
                    break;
                    //Web Visit
                     case "WV":
                       title += model.get("subject")?model.get("subject"):"";
                       preview_id = model.get("id");
                       summary = model.get("pageURL")?("<b>Page Visit</b> : <a  target='_blank' href='"+model.get("pageURL")+"'>"+model.get("pageTitle")+"</a>"):"";                        
                    break;
                    //Workflow Alert
                    case "WA":
                       title += model.get("name");                       
                       preview_id = model.get("id");                                                              
                    break;
                   default:
                      title += this.mapping[model.get("activityType")].name;
                    break;  
                }    
               return {name:this.app.decodeHTML(title),summary:this.app.decodeHTML(summary)};     
            }
            
            
        });
});