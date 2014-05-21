define(['text!bmstemplates/html/template_row.html','jquery.highlight'],
function (template,highlighter) {
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
               'click .caption p a':'tagsClick',
               'click .cat':'searchByCategory',
               'click .feat_temp':'featureClick',
               'click .rpath':'returnPath',
               'click .mobile':'mobileClick',
               'click .builtin':'mksBridge',
               'click .mail':'mailIconClick',
               'click .view':'viewIconClick'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.tempNum = '';
                    this.tagTxt = '';
                    this.selectCallback = this.options.selectCallback;
                    this.selectTextClass = this.options.selectTextClass?this.options.selectTextClass:'';
                    this.render();
                    //this.model.on('change',this.renderRow,this);
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
                this.initControls();  
               
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
               /* if(this.sub.searchTxt){
                    this.$(".show-detail").highlight($.trim(this.sub.searchTxt));
                    this.$(".taglink").highlight($.trim(this.sub.searchTxt));
                }else{
                this.$(".taglink").highlight($.trim(this.sub.tagTxt));
                }*/
                if(this.sub.searchString.searchType==="nameTag"){
                        var searchVal = $.trim(this.sub.$("#search-template-input").val());
                        this.$(".thumbnail .caption h3 a").highlight(searchVal);
                        this.$(".thumbnail .caption p a").each(function(){
                           $(this).highlight(searchVal);
                       });
                    }
                 else if(this.sub.searchString.searchType ==="category"){
                        this.$(".thumbnail .caption .cat").highlight(this.model.get('categoryID'));
                    }
                 else if(this.sub.searchString.searchType ==="tag"){
                        var tagText = this.sub.searchString.searchText;
                        this.$(".thumbnail .caption p a").each(function(){
                           $(this).highlight(tagText);
                       });
                        
                    }
                
            },
            showTagsTemplate:function(){
                   var tags = this.model.get('tags');
                   var tag_array = tags.split(",");
                   var tag_html ="";
                    $.each(tag_array,function(key,val){
                        tag_html +="<a class='showtooltip' title='Click to View Templates With Same Tag'>"+val+"</a>";
                        /*if(key<tag_array.length-1){
                            tag_html +=", ";
                        }*/
                    });
                    return tag_html; 
                },
             showCPCEDButtons : function(){
                 var templates_html = '';
                 var adminTemplate = this.model.get('isAdmin')==='Y'?"admin-template":"";
                 if(adminTemplate === "admin-template"){
                                this.$('.thumbnail').addClass(adminTemplate);
                                if(this.app.get("isAdmin") === "Y"){
                                    templates_html +='<a class="previewbtn"  id="preview_'+this.tempNum+'" ><span >Preview</span></a>';
                                    templates_html +='<a class="copybtn"  id="copy_'+this.tempNum+'" ><span >Copy</span></a>';
                                    templates_html +='<a class="editbtn" id="edit_'+this.tempNum+'" ><span >Edit</span></a>';
                                    templates_html +='<a class="deletebtn" id="delete_'+this.tempNum+'"><span >Delete</span></a>';
                                }else{
                                    templates_html +='<a class="previewbtn"  style="width:50%" id="preview_'+this.tempNum+'"  ><span >Preview</span></a>';
                                    templates_html +='<a class="copybtn"  style="width:50%" id="copy_'+this.tempNum+'" ><span >Copy</span></a>'; 
                                }
                  }else{
                                templates_html +='<a class="previewbtn" id="preview_'+this.tempNum+'" ><span >Preview</span></a>';
                                templates_html +='<a class="copybtn" id="copy_'+this.tempNum+'" ><span >Copy</span></a>';
                                templates_html +='<a class="editbtn" id="edit_'+this.tempNum+'"><span >Edit</span></a>';
                                templates_html +='<a class="deletebtn" id="delete_'+this.tempNum+'"><span >Delete</span></a>';
                            }
                            return templates_html;
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
                        var _this = this;
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
                        require(["bmstemplates/copytemplate"],function(copyTemplatePage){                                     
                                var mPage = new copyTemplatePage({templ:self,template_id:_this.model.get('templateNumber.encode'),_current:_this,app:_this.app,templatesDialog:__dialog});
                                __dialog.getBody().html(mPage.$el);
                                __dialog.saveCallBack(_.bind(mPage.copyTemplate,mPage));
                        });
                },
                updateTemplate:function(){                                   
                   var _this = this.sub;
                   _this.template_id = this.model.get('templateNumber.encode');
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
                    var mPage = new templatePage({template:_this,dialog:dialog});
                    dialog.getBody().html(mPage.$el);
                    mPage.init();
                    dialog.saveCallBack(_.bind(mPage.saveTemplateCall,mPage));
                    }); 
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
                    
                    this.app.showLoading("Deleting Template...",this.$el);
                    var URL = "/pms/io/campaign/saveUserTemplate/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'delete',templateNumber:templateNum})
                    .done(_.bind(function(data) {                  
                          this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){

                              this.sub.$el.find("#template_search_menu li:first-child").removeClass("active").click();

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
            /*Search on Different icon*/
           searchByCategory : function(obj){
                             var cat = $.getObj(obj,"a");
                             this.sub.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                             this.sub.$('#search-template-input').val('');
                             this.sub.$('#clearsearch').hide();
                             this.sub.loadTemplates('search','category',{category_id:this.model.get('categoryID')});  
                      },
          featureClick : function(){
                            this.sub.$("#template_search_menu li:nth-child(3)").click(); 
          },
          returnPath: function(){
                            this.sub.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                            this.sub.$('#search-template-input').val('');
                            this.sub.$('#clearsearch').hide();
                            this.sub.loadTemplates('search','returnpath');
            },
          tagsClick: function(obj){
                             var tag = $.getObj(obj,"a");
                             this.sub.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                             this.sub.$('#search-template-input').val('');
                             this.sub.$('#clearsearch').hide();
                             this.sub.loadTemplates('search','tag',{text:tag.text()});  
          },
          mobileClick : function(){             
                             this.sub.$("#template_layout_menu li,#template_search_menu li").removeClass("active");
                             this.sub.$('#search-template-input').val('');
                             this.sub.$('#clearsearch').hide();
                             this.sub.loadTemplates('search','mobile');  
                },
          mksBridge : function(){                        
                            this.sub.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                            this.sub.$('#search-template-input').val('');
                            this.sub.$('#clearsearch').hide();
                            this.sub.loadTemplates('search','admin',{user_type:'A'});  
          },
          mailIconClick: function(){
                            this.sub.$("#template_search_menu li:first-child").click();
          },
          viewIconClick : function(){
                            this.sub.$("#template_search_menu li:nth-child(4)").click();
          }
         
        });

});