define(['text!dctemplates/html/dctemplates.html','dctemplates/collections/dctemplates','dctemplates/dctemplate_row','dctemplates/dctemplate'],
function (template,templateCollection,templateRowView,templateView) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Templates Gallery Page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            /**
             * Attach events on elements in view.
            */            
            events: {				
                'click .create-tempalte':'createTemplate',
                'click .searchbtn':function(){
                     this.$("#search-template-input").keyup();
                },
                "click .refresh_btn":function(){
                    this.app.addSpinner(this.$el);
                    this.loadDCBlocks();
                    this.templateTotalFlag = true;
                },
                'click #clearsearch':'searchTemplateNameTag',
                "click .sortoption_expand": "toggleSortOption",
                //'click .temp-count':'searchTemplate'
            },
            /**
             * Initialize view - backbone .
            */
            initialize:function(){              
               this.app = this.options.app;           
               this.page = this.options.page; 
               this.template = _.template(template);		
               this.offset = 0;
               this.totalcount = 0;
               this.templateTotalCount = 0;
               this.searchValue = "";
               this.searchString = "";
               this.searchTxt = "";
               this.templates = null;  
               this.totalCount = 0;
               this.parent = '';
               this.scrollElement = this.options.scrollElement ? this.options.scrollElement :$(window);
               //this.OnOFlag = (this.options.isOTO) ? this.options.isOTO : '';
               //this.otoTemplateFlag = false;
               this.dynamicData = null;
               this.templateCollection = new templateCollection(); 
               this.getTemplateCall = null;
               this.orderBy = 'usageDate';    
               this.templateTotalFlag = false;
               this.subNum = this.options.subNum ? this.options.subNum : '';
               this.directContactFlag = this.options.directContactFlag ? this.options.directContactFlag : false;
               this.render();
            },
            /**
             * Initialize view .
            */
            render: function () {
                
               this.$el.html(this.template({}));        
               
              
            }
            /**
             * Custom init function called after view is completely render in wrokspace.
            */
            ,
            init:function(){                
               this.attachEvents();
               this.loadDCBlocks();
               this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
               
               this.$(".search-template-div").searchcontrol({
                     id:'nuture-search',
                     width:'320px',
                     height:'22px',
                     gridcontainer: this.$('.template-container '),
                     placeholder: 'Search dynamic contents',                     
                     showicon: 'yes',
                     iconsource: 'campaigns',
                     movingElement: 'li',
                     searchFunc:_.bind(this.searchdynamicContentL,this),
                     //searchCountEl : this.$(".total-count"),
                     //searchTextEl : this.$(".total-text"),
                     //searchText : 'My Nurture Tracks'
                     
              });
            },
            attachEvents:function(){                    
                    var camp_obj = this;
                    
                    this.$("#template_search_menu li").click(_.bind(this.searchTemplate,this));
                    this.$("#template_layout_menu li").click(_.bind(this.searchTemplateLayout,this));
                    this.$("#remove-template-tag-list").click(function(){
                        $(this).hide();
                         camp_obj.$("#search-popular-input").val('');
                         camp_obj.$("#popular_template_tags li").show();  
                    });
                    
                    this.scrollElement.scroll(_.bind(this.liveLoading,this));
                    this.scrollElement.resize(_.bind(this.liveLoading,this));
                    this.app.scrollingTop({scrollDiv:'window',appendto:this.$el,scrollElement:this.scrollElement});

                },
                
                searchdynamicContentL : function(){
                    
                    this.$(".template-container .thumbnails li:first-child").show();
                },
                searchTemplateLayout:function(obj){
                    var li = $.getObj(obj,"li");
                    if(!li.hasClass("active")){
                         this.$("#search-template-input").val('');
                         this.$("#template_layout_menu li,#template_search_menu li").removeClass("active");                                                  
                         var searchType = "layout";
                         var layout_id = li.find("a").attr("type");
                         this.loadTemplates('search',searchType,{layout_id:layout_id});
                         li.addClass("active");
                    }
                    
                },
                searchTemplate:function(obj){
                    var li = $.getObj(obj,"li");
                    // Remove the class from Total Temp
                    _.each(li.parents('div.ws-content.active').find('span.ttval').parents('ul').find('li.font-bold'),
                    function(k,v){
                        $(k).removeClass('font-bold');
                    });
                    if(!li.hasClass("active")){
                        this.$("#search-template-input").val('');
                        this.$('#clearsearch').hide();
                        this.$("#template_search_menu li,#template_layout_menu li").removeClass("active");
                        var html = li.clone();
                        $(this.el).find(".sortoption_expand").find('.spntext').html(html.text());
                        var searchType = li.find("a").attr("search");
                        if(searchType == "all"){
                            li.parents('div.ws-content.active').find('span.ttval').parent().addClass('font-bold');
                        }
                        this.$el.find("#template_search_menu").hide();
                        li.addClass("active");
                        this.orderBy = searchType;
                        this.loadTemplates('search',searchType);                       
                    }
                },
                loadDCBlocks:function(search,searchType,options){
                    var camp_obj = this;
                    var emailtext ='';
                          if(this.OnOFlag){
                              emailtext = 'email';
                          }
                    var _data = {type:'search'}
                    if(!this.templates || search){
                        this.$(".thumbnails").children().remove();                        
                        this.app.showLoading('Loading Dynamic Blocks....',this.$(".template-container"));
                        this.$("#total_templates").html("<img src='img/recurring.gif'> Dynamic Blocks");      
                        _data['orderBy'] = "";
                        
                        this.offset = 0;
                        this.totalcount = 0;
                        this.searchString = _data;
                        this.callTemplates();
                    }
                    else{
                       // this.drawTemplates();
                    }
                },
                callTemplates:function(tcount,isTotal){
                    var remove_cache = false;
                    var newCount = 0;
                if(!tcount){
                    remove_cache = true;
                    this.offset = 0;
                    this.$(".notfound").remove();
                }
                else{
                    this.offset = this.offset + 20;
                }
                 if(this.template_request)
                              {
                                this.template_request.abort();
                              }
                    this.searchString['offset'] = this.offset;
                    this.searchString['bucket'] = 20;
                    
                    this.template_request = this.templateCollection.fetch({data: this.searchString,
                                success: _.bind(function(collection, response) {
                                                if(this.app.checkError(response)){
                                                    return false;
                                                }
                                                    
                                                    if(response.count){
                                                        this.totalCount = response.count;
                                                    }
                                                   
                                                this.$el.find('.thumbnails').append('<li class="span3" id="new_dctemplate" class="create_temp"><div style="height:475px;" class="thumbnail browse"><div style="" class="drag create"><span>Add Dynamic Content </span></div></div></li>');
                                                this.$('#new_dctemplate').click(_.bind(this.createDynamicContent,this));
                                                _.each(collection.models, _.bind(function(model){
                                                        this.rowView = new templateRowView({model:model,sub:this,selectCallback:this.options.selectCallback,selectTextClass:this.selectTextClass,OnOFlag:this.OnOFlag});
                                                        this.$el.find('.thumbnails').append(this.rowView.$el);
                                                       //this.rowView.tmPr.trimTags({maxwidth:345,innerElement:'.t-scroll p a'});
                                                    },this));
                                                    this.$("#total_templates").html("<strong class='badge'>"+this.totalCount+"</strong> <span>Dynamic Blocks</span>"); 
                                                    /*-----Remove loading------*/
                                                        this.app.removeSpinner(this.$el);
                                                         this.app.showLoading(false,this.$(".template-container"));
                                                    /*------------*/
                                                   
                                                    if(collection.length==0){
                                                        var search_message  ="";
                                                        var email = "";
                                                        if(this.searchString && this.searchString.searchText){
                                                          search_message +=" containing '"+this.searchString.searchText+"'" ;
                                                        }
                                                        
                                                        //console.log(this.searchString);
                                                        //this.$(".template-container").append('<p class="notfound">No Templates found'+search_message+'</p>');
                                                        this.$("#total_templates").html('<p class="notfound nf_overwrite">No '+email+' Templates found'+search_message+'</p>');
                                                    }
                                                    this.$(".footer-loading").hide();
                                                    
                                             }, this)
                            });
                },
             
                liveLoading:function(){
                    var $w = $(window);
                    var th = 200;
                    var inview = this.$(".thumbnails li:last-child").filter(function() {
                        var $e = $(this),
                            wt = $w.scrollTop(),
                            wb = wt + $w.height(),
                            et = $e.offset().top,
                            eb = et + $e.height();

                        return eb >= wt - th && et <= wb + th;
                      });
                    if(inview.length && inview.attr("data-load") && this.$el.height()){
                       inview.removeAttr("data-load");
                       this.$(".footer-loading").show();
                       this.callTemplates(20); 
                    }  
                },
                createDynamicContent:function(){
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Create a Dynamic Block',
                      buttnText: 'Create',
                      plHolderText : 'Enter dynamic name here',
                      emptyError : 'Dynamic name can\'t be empty',
                      bgClass :'dctemplate-tilt',
                      createURL : '/pms/io/publish/saveDynamicVariation/',
                      fieldKey : "label",
                      postData : {type:'new',BMS_REQ_TK:this.app.get('bms_token'),contentType:'H',isGallery:'Y'},
                      saveCallBack :  _.bind(this.createDynamicBlock,this) // Calling same view for refresh headBadge
                    });
                },     
                 keyvalid:function(event){
                        var regex = new RegExp("^[A-Z,a-z,0-9]+$");
                        var str = String.fromCharCode(!event.charCode ? event.which : event.charCode);
                         if (event.keyCode == 8 || event.keyCode == 32 || event.keyCode == 37 || event.keyCode == 39) {
                            return true;
                        }
                        else if (regex.test(str)) {
                            return true;
                        }
                       else{
                            return false;
                        }
                        event.preventDefault();
                   },
                   createDynamicBlock : function(fieldText, _json){
                       this.loadDCBlocks();
                       var _this = this;
                       var URL = "/pms/io/publish/getDynamicVariation/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=get&dynamicNumber="+_json[1];
                       jQuery.getJSON(URL,  function(tsv, state, xhr){
                           if(xhr && xhr.responseText){                                                       
                                var _json = jQuery.parseJSON(xhr.responseText);                                                                                               
                                if(_this.app.checkError(_json)){
                                    return false;
                                 }
                                 _this.dynamicData = _json;
                                 
                                 _this.loadMeeForDynamic(fieldText);
                                 
                               
                           }
                     }).fail(function() { console.log( "error in loading popular tags for templates" ); });
                   },
                   loadMeeForDynamic : function(fieldText){
                        var dialog_width = $(document.documentElement).width() - 60;
                        var dialog_height = $(document.documentElement).height() - 182;
                        var dialog = 
                            this.app.showDialog({title: fieldText,
                            css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                            headerEditable: false,
                            headerIcon: 'dctemplate',
                            bodyCss: {"min-height": dialog_height + "px"},
                            tagRegen: false,
                            buttons: {saveBtn: {text: 'Save'}}
                        });
                        this.$el.find('#nuture-search').val('');
                        this.$el.find('#clearsearch').hide();
                        this.app.showLoading("Loading...", dialog.getBody());  
                        this.loadDCSingleTemplate(dialog);
                        
                   },
                   loadDCSingleTemplate: function(dialog){
                       var mPage = new templateView({template: this, dialog: dialog,dynamicData:this.dynamicData});
                       
                        dialog.getBody().html(mPage.$el);
                        this.app.showLoading(false, dialog.getBody());
                        mPage.init();
                        this.$el.find('.refresh_btn').trigger('click');
                        var dialogArrayLength = this.app.dialogArray.length;
                        dialog.saveCallBack(_.bind(mPage.saveDyanamicGalleryCall, mPage, true));
                        mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveDyanamicGalleryCall,mPage,true); 
                        this.app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                        this.app.dialogArray[dialogArrayLength - 1].currentView = mPage; // New Dialog
                   },
                   showTotalCount:function(count,isTotal){                    
                       
                          var emailtext ='';
                          if(this.OnOFlag){
                              emailtext = 'email';
                          }
                         if(this.page.total_count==0){
                                this.page.total_count=count;
                                this.trigger('updatecount');
                            }else{
                                //this.$el.parents('.ws-content.active').find('.temp-count').text(count);
                            }
                    if(this.$("#template_search_menu li.active").length){
                        var text = (this.$("#template_search_menu li.active").attr("text-info").toLowerCase().indexOf("templates")>-1)?"":(this.$("#template_search_menu li.active").attr("text-info").toLowerCase()+" ");  
                        this.$("#total_templates").html("<strong class='badge'>"+count+"</strong> <b> "+text+"</b> "+emailtext+" templates found");  
                    }
                    else{
                        this.$("#total_templates").html("<strong class='badge'>"+count +"</strong> "+emailtext+" templates");
                        this.$el.parents('.ws-content.active').find('.temp-count').text(count);
                    }
                   // Creating Copy/deleting template update the total count 
                   if(isTotal || this.templateTotalFlag){
                       this.$el.parents('.ws-content.active').find('.temp-count').text(count);
                       this.$el.parents('.modal').find('#oto_total_templates').text(count);
                   }
                },
                toggleSortOption: function(ev) {
                    $(this.el).find("#template_search_menu").slideToggle();
                    ev.stopPropagation();
                },
                ReattachEvents: function () {
                    this.$el.parents('.modal').find('#oto_total_templates').html('Total <b>'+this.templateTotalCount+'</b>').fadeIn().css('cursor','pointer');
                    this.$el.parents('.modal').find('#oto_total_templates').click(_.bind(function(){this.loadTemplates();},this))
                   
                },
                
        });
});
