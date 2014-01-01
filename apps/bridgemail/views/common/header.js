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
                                 app.mainContainer.addWorkSpace({type:'',title:'Campaigns',url:'campaigns',workspace_id: 'campaigns',noTags:true});
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
                            'click .analytics_add-template-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
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
                                var dialog = app.showDialog({title:'Test Dialog',
                                                                  css:{"width":"850px","margin-left":"-425px"},
                                                                  bodyCss:{"min-height":"360px"},
                                                                  buttons: {saveBtn:{text:'Save Target'} }   
                                    });
                                 app.showLoading("Loading Page...",dialog.getBody());                                                                         
                                 require(['text!html/dialog_test.html'],function(page){                                                                            
                                    dialog.getBody().html(page);
                                })
                                 //app.mainContainer.bmseditor.showEditor();
                                 /*app.mainContainer.addWorkSpace({type:'wizard',
                                                  title:this.getTitle(obj),
                                                  wizard :{steps:4,active_step:1}
                                                });*/
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
				
			},
                        getTitle:function(obj){
                           var title =  $(obj.target).parent("li").find("a").text();
                           return title;
                        }
                        
		});
	});
