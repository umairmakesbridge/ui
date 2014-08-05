define(['text!bmstemplates/html/template_row.html','jquery.highlight','common/tags_row','jquery.customScroll'],
function (template,highlighter,tagView) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'span3',
            tagName:'li',
            
            /**
             * Attach events on elements in view.
            */
            events: {
               'click .copybtn':'copyTemplate',
               'click .createcamp':'createCampaign',
               "click .previewbtn":'previewTemplate',
               'click .deletebtn':'deleteTemplate',
               'click .editbtn,.single-template':'updateTemplate',
               
               'click .cat':'searchByCategory',
               'click .feat_temp':'featureClick',
               'click .rpath':'returnPath',
               'click .mobile':'mobileClick',
               'click .builtin':'mksBridge',
               'click .mail':'mailIconClick',
               'click .view':'viewIconClick',
               'click .selecttemp':'selectTemplate',
               //'click .t-scroll p i.ellipsis':'expandTags',
               'mouseleave .thumbnail':'collapseTags'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.parent = this.options.sub;
                    this.app = this.parent.app;
                    this.template = _.template(template);				                    
                    this.tempNum = '';
                    this.tagTxt = '';
                    this.selectCallback = this.options.selectCallback;
                    this.selectTextClass = this.options.selectTextClass?this.options.selectTextClass:'';
                    this.isAdmin = this.app.get("isAdmin");
                    
                    this.tagCount = 0;
                    //this.isAdmin = 'Y';
                    this.render();
                    this.model.on('change',this.renderRow,this);
            },
              /**
             * Render view on page.
            */
            render: function () {                    
                
               this.$el.html(this.template({
                    model: this.model
                }));
                this.tempNum = this.model.get('templateNumber.encode');
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                var _$this = this;
                $( window ).scroll(function() {
                    if(_$this.isTrim){
                        _$this.collapseTags(window);
                    }
                 });
                this.initControls();  
               
            },
            /*
             * 
             * Template Render on Change
             */
            renderRow : function(){
                //console.log('Model Changed');
                this.render();
            },
            
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
               /* if(this.parent.searchString.searchType==="nameTag"){
                        var searchVal = $.trim(this.parent.$("#search-template-input").val());
                        this.$(".thumbnail .caption h3 a").highlight(searchVal);
                        this.$(".thumbnail .caption p a").each(function(){
                           $(this).highlight(searchVal);
                       });
                    }
                 else if(this.parent.searchString.searchType ==="category"){
                        this.$(".thumbnail .caption .cat").highlight(this.model.get('categoryID'));
                    }
                 else if(this.parent.searchString.searchType ==="tag"){
                        var tagText = this.parent.searchString.searchText;
                        this.$(".thumbnail .caption p a").each(function(){
                           $(this).highlight(tagText);
                       });
                        
                    }*/
                this.showTagsTemplate();
                
            },
            showTagsTemplate:function(){
                    this.tmPr =  new tagView(
                                   {parent:this,
                                    app:this.app,
                                    parents:this.parent,
                                    rowElement: this.$el,
                                    helpText : 'Templates',
                                    tags:this.model.get('tags')});
                      this.$('.t-scroll').append(this.tmPr.$el);
                      
                },
            
             showCPCEDButtons : function(){
                 var templates_html = '';
                 var adminTemplate = this.model.get('isAdmin')==='Y'?"admin-template":"";
                 if(adminTemplate === "admin-template"){
                                this.$('.thumbnail').addClass(adminTemplate);
                                if(this.isAdmin === "Y"){
                                    templates_html +='<a class="previewbtn clr4"  id="preview_'+this.tempNum+'" ><span >Preview</span></a>';
                                    templates_html +='<a class="editbtn clr3" id="edit_'+this.tempNum+'" ><span >Edit</span></a>';
                                    templates_html +='<a class="copybtn clr2"  id="copy_'+this.tempNum+'" ><span >Copy</span></a>';
                                    templates_html +='<a class="deletebtn clr1" id="delete_'+this.tempNum+'"><span >Delete</span></a>';
                                }else{
                                    templates_html +='<a class="previewbtn clr2"  style="width:50%" id="preview_'+this.tempNum+'"  ><span >Preview</span></a>';
                                    templates_html +='<a class="copybtn clr1"  style="width:50%" id="copy_'+this.tempNum+'" ><span >Copy</span></a>'; 
                                }
                            }else{
                                templates_html +='<a class="previewbtn clr4" id="preview_'+this.tempNum+'" ><span >Preview</span></a>';
                                templates_html +='<a class="editbtn clr3" id="edit_'+this.tempNum+'"><span >Edit</span></a>';
                                templates_html +='<a class="copybtn clr2" id="copy_'+this.tempNum+'" ><span >Copy</span></a>';
                                templates_html +='<a class="deletebtn clr1" id="delete_'+this.tempNum+'"><span >Delete</span></a>';
                            }
                            return templates_html;
             },
             CPCEDWrap : function(){
                 var returnClass = '';
                 var createCampClass = '';
                 var adminTemplate = this.model.get('isAdmin')==='Y'?"admin-template":"";
                 if(adminTemplate === "admin-template"){
                                this.$('.thumbnail').addClass(adminTemplate);
                                if(this.isAdmin === "Y"){
                                   returnClass = 'five s-clr6';
                                   createCampClass = 'clr5';
                                }else{
                                   returnClass = 'three s-clr4';
                                    createCampClass = 'clr3'
                                }
                            }else{
                               returnClass = 'five s-clr6';
                               createCampClass = 'clr5'
                            }
                            return {returnClass:returnClass,campClass:createCampClass};
                
             },
             previewTemplate:function(obj,tag){
                       
                        var bms_token =this.app.get('bms_token');                              
                        var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-162;
                        var srcUrl = "https://"+this.app.get("preview_domain")+"/pms/events/viewtemp.jsp?templateNumber="+this.model.get('templateNumber.encode');
                        var dialog = this.app.showDialog({title:'Template Preview',
                                    css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                                    headerEditable:false,
                                    headerIcon : 'dlgpreview',
                                    bodyCss:{"min-height":dialog_height+"px"}                                                                          
                         });
                         require(["common/templatePreview"],_.bind(function(templatePreview){
                           var tmPr =  new templatePreview({frameSrc:srcUrl,app:this.app,frameHeight:dialog_height,prevFlag:'T',tempNum:this.model.get('templateNumber.encode')});
                            dialog.getBody().html(tmPr.$el);
                            tmPr.init();
                          },this));                              
                },
                copyTemplate: function(){
                        var dialog_title = "Copy Template";
                        var self;
                        var __dialog = this.app.showDialog({title:dialog_title,
                                          css:{"width":"600px","margin-left":"-300px"},
                                          bodyCss:{"min-height":"260px"},							   
                                          headerIcon : 'copy',
                                          overlay:true,
                                          buttons: {saveBtn:{text:'Create Template'} }                                                                           
                        });
                        this.app.showLoading("Loading...",__dialog.getBody());
                        require(["bmstemplates/copytemplate"],_.bind(function(copyTemplatePage){                                     
                                var mPage = new copyTemplatePage({templ:self,template_id:this.model.get('templateNumber.encode'),_current:this,app:this.app,templatesDialog:__dialog});
                                __dialog.getBody().html(mPage.$el);
                                __dialog.saveCallBack(_.bind(mPage.copyTemplate,mPage));
                        },this));
                },
                updateTemplate:function(tempNum){                                   
                   var _this = this.parent;
                   var self = this;
                   if(typeof(tempNum)==="object"){
                        _this.template_id = this.model.get('templateNumber.encode');                         
                    }else{
                        _this.template_id = tempNum;
                    }
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-182;
                    var dialog = this.app.showDialog({title:'Loading ...',
                    css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                    headerEditable:true,
                    headerIcon : 'template',
                    bodyCss:{"min-height":dialog_height+"px"},
                    buttons: {saveBtn:{text:'Save'} }
                    });
                    this.app.showLoading("Loading...",dialog.getBody());
                    require(["bmstemplates/template"],function(templatePage){
                    var mPage = new templatePage({template:_this,dialog:dialog,rowtemplate:self});
                    dialog.getBody().html(mPage.$el);
                    mPage.init();
                    dialog.saveCallBack(_.bind(mPage.saveTemplateCall,mPage));
                    }); 
                    this.parent.callTemplates(this.parent.offset);
                },
              deleteTemplate:function(){        
                  this.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this template?",                                                
                            callback: _.bind(function(){													
                                    this.deleteCall(this.model.get('templateNumber.encode'));
                            },this)},
                    this.$el);                       
                },
             deleteCall:function(templateNum){
                    
                    this.app.showLoading("Deleting Template...",this.$el,{fixed:'fixed'});
                    var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'delete',templateNumber:templateNum})
                    .done(_.bind(function(data) {                  
                          this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){

                              this.parent.$el.find("#template_search_menu li:first-child").removeClass("active").click();

                           }
                           else{
                               this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                           }
                   },this));
                },
            createCampaign : function(obj){
                if(this.selectCallback){                            
                          this.selectCallback(obj);
                        }
            },
            selectTemplate : function(obj){
               if(this.selectCallback){                            
                          this.selectCallback(obj);
                        }
            },
            /*Search on Different icon*/
           searchByCategory : function(obj){
                             var cat = $.getObj(obj,"a");
                             this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                             this.parent.$('#search-template-input').val('');
                             this.parent.$('#clearsearch').hide();
                             this.parent.loadTemplates('search','category',{category_id:this.model.get('categoryID')});  
                      },
          featureClick : function(){
                            this.parent.$("#template_search_menu li:nth-child(3)").click(); 
          },
          returnPath: function(){
                            this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                            this.parent.$('#search-template-input').val('');
                            this.parent.$('#clearsearch').hide();
                            this.parent.loadTemplates('search','returnpath');
            },
         
          mobileClick : function(){             
                             this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");
                             this.parent.$('#search-template-input').val('');
                             this.parent.$('#clearsearch').hide();
                             this.parent.loadTemplates('search','mobile');  
                },
          mksBridge : function(){                        
                            this.parent.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                            this.parent.$('#search-template-input').val('');
                            this.parent.$('#clearsearch').hide();
                            this.parent.loadTemplates('search','admin',{user_type:'A'});  
          },
          mailIconClick: function(){
                            this.parent.$("#template_search_menu li:first-child").click();
          },
          viewIconClick : function(){
                            this.parent.$("#template_search_menu li:nth-child(4)").click();
          },
        
         
         
        });

});