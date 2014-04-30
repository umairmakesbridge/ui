define(['jquery', 'backbone', 'underscore', 'app', 'text!templates/common/header.html'],
	function ($, Backbone, _, app,  template) {
		'use strict';
		return Backbone.View.extend({			
                        tagName: 'div',
                        events: {
                            'click .dropdown-menu li':function(obj){              
                              app.openModule(obj);
                            },
                            /*Menues*/
                            'click .campaigns-li':function(obj){
                                //app.mainContainer.openCampaign();
                                 app.mainContainer.addWorkSpace({type:'',title:'Campaigns',sub_title:'Listing',url:'campaigns',workspace_id: 'campaigns','addAction':true,tab_icon:'campaignlisting'});
                            }, 
                            
                            'click .naturetrack-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:'Nurture Tracks',sub_title:'Listing',url : 'nurturetrack/nurturetracks',workspace_id: 'nuture','addAction':true,tab_icon:'nuturelisting'});
                            },                            
                            'click .contacts-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:'Contacts',sub_title:'Listing',url : 'contacts',workspace_id: 'contacts','addAction':true,tab_icon:'contactlisting'});
                            },
                            'click .reports-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:'Reports',sub_title:'Analytic',url : 'reports/campaign_report',workspace_id: 'camp_reports',tab_icon:'reports', single_row:true});
                            }
                            ,
                            'click .csv-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:'CSV Upload',sub_title:'Add Contacts',url : 'listupload/csvupload',workspace_id: 'csv_upload',tab_icon:'csvupload', single_row:true});
                            },
                            'click .crm-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:'Connections',sub_title:'CRM',url : 'crm/crm',workspace_id: 'crm',tab_icon:'crm', single_row:true});
                            }
                            ,
                            'click .studio_add-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            },
                            
                            
                            'click .analytics_reports-li':function(obj){
                                app.mainContainer.addWorkSpace({type:'',title:this.getTitle(obj)});
                            },
                            'click .add-template-li':function(obj){
                                 app.mainContainer.addWorkSpace({type:'',title:'Template Gallery',sub_title:'Gallery',url : 'mytemplates',workspace_id: 'mytemplates','addAction':true,tab_icon:'mytemplates'});
                            },
                            'click .image-gallery-li':function(obj){
                                 app.mainContainer.addWorkSpace({type:'',title:'Images',sub_title:'Gallery',url:'userimages/userimages',workspace_id: 'userimages',tab_icon:'graphiclisting'});
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
                            },
                            'click .sc-links span.ddicon':'scDropdown',
                            //'click .new-campaign': 'createNewCampaign',
                            'click .csv-upload': 'csvUpload',
                            'click .new-nurturetrack':'addNurtureTrack'
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
                        },
                        scDropdown:function(event){
                            
                            $('.dropdown-nav').hide();
                            $('.icon-menu').removeClass('active');
                            if(this.$('.sc-links ul').hasClass('open')){
                                this.$('.sc-links ul').removeClass('open');
                                this.$('.sc-links ul').hide();
                            }else{
                                this.$('.ddlist').addClass('open').show();
                            }
                            event.stopPropagation();
                        },
                         
                        csvUpload: function() {
                            this.addWorkSpace({type: '', title: 'CSV Upload',sub_title:'Add Contacts', url: 'listupload/csvupload', workspace_id: 'csv_upload', tab_icon: 'csvupload', single_row: true});
                        },
                        addNurtureTrack: function() {
                    var dialog = app.showDialog({title: 'New Nurture Track',
                        css: {"width": "650px", "margin-left": "-325px"},
                        bodyCss: {"min-height": "100px"},
                        headerIcon: 'new_headicon',
                        buttons: {saveBtn: {text: 'Create Nurture Track'}}
                    });
                    app.showLoading("Loading...", dialog.getBody());
                    require(["nurturetrack/newnurturetrack"], _.bind(function(trackPage) {
                        var mPage = new trackPage({page: this, newdialog: dialog});
                        dialog.getBody().html(mPage.$el);
                        mPage.$("input").focus();
                        dialog.saveCallBack(_.bind(mPage.createNurtureTrack, mPage));
                    }, this));
                }     
		});
	});
