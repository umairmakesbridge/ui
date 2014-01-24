define(['jquery', 'backbone', 'underscore', 'app', 'text!templates/common/header.html'],
	function ($, Backbone, _, app,  template) {
		'use strict';
		return Backbone.View.extend({
			id: 'header',
                        tagName: 'header',
                        events: {
                            'click .dropdown-menu li':function(obj){              
                              app.openModule(obj);
                            },
                            
                            /*Menues*/
                            'click .campaigns-li':function(obj){
                                //app.mainContainer.openCampaign();
                                 app.mainContainer.addWorkSpace({type:'',title:'Campaigns',url:'campaigns',workspace_id: 'campaigns','addAction':true,tab_icon:'campaignlisting'});
                            },
                            'click .contacts-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:'Contacts',url : 'contacts',workspace_id: 'contacts','addAction':true,tab_icon:'contactlisting'});
                            },
                            'click .studio_bounced-email-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            }
                            ,
                            'click .studio_ftp-uploads-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            },
                            'click .studio_reports-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            }
                            ,
                            'click .studio_add-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            },
                            
                            
                            'click .analytics_reports-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            },
                            'click .add-template-li':function(obj){
                                 app.mainContainer.addWorkSpace({type:'',title:'My Templates',url : 'mytemplates',workspace_id: 'mytemplates','addAction':true,tab_icon:'mytemplates'});
                            },
                            'click .analytics_add-list-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            },
                            'click .analytics_forms-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            },
                            'click .analytics_segments-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            }
                            
                            ,
                            'click .list-management-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'wizard',
                                    title:"List Management",
                                    url : 'list',
                                    wizard :{steps:4,active_step:1,step_text:[]}
                                });
                            },
                            'click .automation-li':function(obj){
                                
                            }
                            ,
                            'click .account-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:"My Account"});
                            }
                         },

			initialize: function () {
				this.template = _.template(template);				
				this.render();
			},

			render: function () {
				this.$el.html(this.template({}));
				this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});	
			},
                        getTitle:function(obj){
                           var title =  $(obj.target).parent("li").find("a").text();
                           return title;
                        }
                        
		});
	});
