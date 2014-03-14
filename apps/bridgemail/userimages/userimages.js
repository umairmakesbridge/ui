/* 
 * Module Name : Image Uploading / Image Module / Graphics Module.
 * Author: Pir Abdul Wakeel
 * Date Created: 10 March 2014
 * Description: This is collection view file, the main grid is loading from here. this page is called from workspace and main container.
 * by passing some parameters like dailog, apps etc. Uploading/ Fetching Images/ Search / Lazy Loading Applied here.
 * Folder name userimages. Collections, HTML, Models, and views(two files, single view, collection view)
 * Changing this file may cause changes in Image Module First Step / Graphics Upload
 */

define(['userimages/collections/userimages','userimages/userimage','text!userimages/html/userimages.html','jquery.bmsgrid','bms-dragfile','jquery-ui'],
function (collectionUserImages,viewUserImage,template,bms_grid,dragfiles,jqueryui) {
        'use strict';
        return Backbone.View.extend({
            className: 'images_grid',
            events: {
               "change .upload #file_control":"upload",
               "keyup #search-graphics-input":"searchKeyPress",
               "click #clearsearch":"clearSearch",
               "click .search-graphics-div ._graphics":"TryDialog",
               "click .tip-dialogue .closebtn":"hideURL",
               "click .ScrollToTop":"scrollToTop"
               ///"click .try":"showDialog"
            },
            initialize: function () {
                   this.template = _.template(template);				
                   var app = this.options.app;
                   this.changecount = "";
                   this._select_page = this.options._select_page;
                   this.timer = 0;
                   this.fromDialog = this.options.fromDialog;
                   this.total = 0;
                   this.offsetLength = 0;
                   this._select_dialog =this.options._select_dialog;
                   this.type = "list";
                   this.total_fetch = 0;
                   this.objUserImages = new collectionUserImages();                              
                   this.offset = 0;               
                   this.search_text = '';
                   this.dropPanel =  "";
                   this.search_tags = '';
                   this.order_by = 'updationDate';
                   this.container = "";
                   this.render();
                  
                                     
            },
            render: function (search) {
             if(search)
                this.search_text = search;
              this.stackImages = "";
              this.app = this.options.app;
              this.$el.html(this.template({}));
              
              this.fetchImages();
              if(this.fromDialog){
                $(".modal-body").scroll(_.bind(this.liveLoading,this));
                $(".modal-body").resize(_.bind(this.liveLoading,this));
                
                ///workspace.;
              }else{
                $(window).scroll(_.bind(this.liveLoading,this));
                $(window).resize(_.bind(this.liveLoading,this));
              }     // this.initControls();
              
           },
           clearSearch:function(ev){
                   $(ev.target).hide();
                   $("#total_graphics span").html("Images found");
                   $("#search-graphics-input").val('');
                   this.total = 0;
                   this.type = "list";
                   this.total_fetch = 0;
                   this.offset = 0;               
                   this.search_text = '';
                   this.search_tags = '';
                   this.order_by = 'updationDate';
                   if(this.fromDialog){
                        var parents = this.$el.parents(".modal");
                    }else{
                        var parents = this.$el.parents(".ws-content");
                    }
                   parents.find(".thumbnails li").remove();
                   this.fetchImages();
           }
           ,searchKeyPress:function(ev){
               var that = this;
                 if(this.fromDialog){
                        var parents = this.$el.parents(".modal");
                    }else{
                        var parents = this.$el.parents(".ws-content");
                    }
                 parents.find('#clearsearch').show();
               if (ev.keyCode == 13){
                 that.search(true,ev);
               }else if(ev.keyCode == 8){
                   var text = $(ev.target).val();
                   if(!text){
                    this.search_text = text;
                    this.type = "list";
                    this.offset = 0;
                    this.tagTxt = "";
                    this.total_fetch = 0;
                    parents.find('#clearsearch').hide();
                   parents.find(".thumbnails li").remove();
                    $("#total_graphics span").html("Images found");
                    this.fetchImages();
                   }
               }else{ 
                     clearTimeout(that.timer); // Clear the timer so we don't end up with dupes.
                     that.timer = setTimeout(function() { // assign timer a new timeout 
                        that.search(true, ev)
                    }, 500); // 2000ms delay, tweak for faster/slower
               }
            },
            search:function(force,ev){
                    var text = $(ev.target).val();
                    if(!text) return;
                    if (!force && text.length < 3) return; //wasn't enter, not > 2 char
                    this.search_text = text;
                    this.type = "search";
                    this.offset = 0;
                    this.tagTxt = "";
                    this.total_fetch = 0;
                    this.$el.find(".thumbnails li").remove();
                    $("#total_graphics span").html("images found for \""+text+"\" ");
                    this.fetchImages();
            },
           liveLoading:function(){
                var $w = $(window);
                var th = 200;
                var that = this;
                if(this.fromDialog){
                    if ($(".modal-body").scrollTop()>200) {
                       $(".modal-footer").find(".ScrollToTop").fadeIn('slow');
                    } else {
                       $(".modal-footer").find(".ScrollToTop").fadeOut('slow');
                    }
                }else{
                    if ($(window).scrollTop()>200) {
                       this.$el.find(".ScrollToTop").fadeIn('slow');
                    } else {
                       this.$el.find(".ScrollToTop").fadeOut('slow');
                    }
                }
                    
                var inview =this.$el.find('.thumbnails li:last').filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                   if(this.fromDialog){
                       $('.modal-body .footer-loading').show();
                       console.log($('.modal-body .footer-loading'));
                   }else{
                       $('.loadmore').show();
                   }
                   
                   this.fetchImages(this.offsetLength);
                }  
            },
            // Call to fetch function of collection userimages. to fetch 50 records at first and then lazy loading
           fetchImages:function(fcount){
               var that = this;
               if(!fcount){
                    this.offset = 0;
                    this.app.showLoading('Loading Images....',that.$el);
              
               }
               else{
                    this.offset = this.offset + this.offsetLength;
               }
               var _data = {offset:this.offset};
                _data['type'] = this.type;
               if(this.search_text && !this.tagTxt){
                     
                    _data['searchText'] = this.search_text;
               }
               else if(this.tagTxt){
                    _data['searchText'] = this.tagTxt;
                    _data['searchType'] = "tags";
                    
               }
               delete _data['order'];
               if(this.sortBy){
                    _data['orderBy'] = this.order_by;
               }
               this.objUserImages.fetch({data:_data,
                        success:function(data){
                           
                         _.each(data.models, function(model){
                           var viewImage = new viewUserImage({model: model,'app':that.app,fromDialog:that.fromDialog,_dialog:that._select_dialog,_select_page:that._select_page});
                           that.$el.find('.thumbnails').append(viewImage.el);
                           that.listenTo(viewImage, 'tagclick', that.searchTag);
                         });
                         that.app.showLoading(false,that.$el);
                         that.total_fetch = that.total_fetch + data.length;
                         that.dragFileSetting();
                         if(that.fromDialog){
                             $('.modal-body .footer-loading').hide();
                             that.updateHeaderCountDialog(data.length);
                             that.headerSettingDialog();
                         }else{
                             $('.loadmore').hide();
                            that.updateHeaderCount(data.length);
                            that.headerSetting();
                         }
                         if(that.total_fetch < parseInt(that.total)){
                                that.$(".thumbnails li:last").attr("data-load","true");
                          } 
                          
                         
                        $(".ScrollToTop").on('click',function(){
                    
                        if(that.fromDialog)  
                            $(".modal-body").animate({scrollTop:0},600);
                        else{
                            $("html,body").css('height','100%').animate({scrollTop:0},600).css("height","");
                        }
                        }); 
                           
                    }
               });
           },
           // Drag and Drop file to upload, append the upload box every time grid empty /search/tags search/new load
           dragFileSetting:function(){
               var that = this;
                 if(this.fromDialog){
                        var parents = this.$el.parents(".modal");
                    }else{
                        var parents = this.$el.parents(".ws-content");
                    }
             parents.find(".thumbnails").prepend(that.thumbnailHTML(that));
                that.$(".droppanel").dragfile({
                    post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+that.app.get('bms_token')+'&type=add&allowOverwrite=N&th_width=240&th_height=230',
                    callBack : _.bind(that.processUpload,that),
                    app:that.app,
                    module:'Image',
                    from_dialog:this.fromDialog
                });  
           },
           // Head setting to change the total
           headerSetting:function(total){
                if(total)
                    this.total = total;
                else 
                    this.total = this.objUserImages.total;
                
                var headerSet = this.$el.parents(".ws-content").find(".camp_header .tcount").text();
              
                if(headerSet == "0" || this.changecount){
                   this.$el.parents(".ws-content").find(".camp_header .tcount").text(this.total);
                }
                this.changecount = false;
                this.$el.find('#total_graphics .badge').text(this.total);
                this.dropPanel = this.$(".droppanel");
           },
             headerSettingDialog:function(total){
                if(total)
                    this.total = total;
                else 
                    this.total = this.objUserImages.total;
                
                var headerSet = this.$el.parents(".modal").find(".camp_header .tcount").text();
                this.$el.parents(".modal").find('.dialog-title').addClass('images-preview').css("margin-left","5px");
                this.$el.parents(".modal").find('#dialog-title .pointy').remove();
                

                //this.$el.parents(".modal").find('#dialog-title').append("<span class='icon fav'></span>");
                
                if(headerSet == "0" || this.changecount){
                   this.$el.parents(".modal").find(".camp_header .tcount").text(this.total);
                }
                this.changecount = false;
                this.$el.find('#total_graphics .badge').text(this.total);
                this.dropPanel = this.$(".droppanel");
           },
           //Search By Tag function called from multiple trigger events. 
           searchTag:function(text){
                   if(text){
                      this.offset = 0;
                      this.total_fetch = 0; 
                      this.tagTxt =$.trim(text);
                      $('#clearsearch').show();
                      $("#search-graphics-input").val("Tag: "+$.trim(text));
                      this.type="search";
                     if(this.fromDialog){
                        var parents = this.$el.parents(".modal");
                    }else{
                        var parents = this.$el.parents(".ws-content");
                    }
                      parents.find(".thumbnails li").remove();
                      this.fetchImages();
                    }
           },
           // Click View Link URL close button inside the signle view. but in single view space is less so that is why 
           // its render out side the signle view. so when click on close button I trigger an event from the collection view.
           hideURL:function(ev){
               $(".thumbnails .tip-dialogue").remove();
           },
           // Update Header Image founds
           
            updateHeaderCount:function(offset){
               if(this.$el.parents(".ws-content").find(".camp_header .c-current-status").length){
                   return;
               }
               this.offsetLength = offset;
               var header =  '<ul class="c-current-status">';
                 header += '<li><span class="badge pclr18 tcount">'+0+'</span>Total Images</li>';             
                 header += '</ul>';  
                 this.$el.parents(".ws-content").find(".camp_header h2").after(header);
                 this.$el.append("<button class='ScrollToTop' style='display:none;' type='button'></button>");  
                 var that = this;
                 $(".c-current-status,#template_search_menu li a").click(function(){
                    that.type = "list";
                    that.search_text = "";
                    that.offset = 0;
                    that.total_fetch = 0; 
                    that.render(); 
                });
            },
            updateHeaderCountDialog:function(offset){
               
               this.$el.parents(".modal").find(".modal-footer").append("<button class='ScrollToTop' style='display:none;position: relative;left: 95%;bottom: 70px;' type='button'></button>");  
               if(this.$el.parents(".modal").find(".camp_header .c-current-status").length){
                   return;
               }
               this.offsetLength = offset;
                            
               var header =  '<ul class="c-current-status" style="margin: 0px 0px 0px 50px;">';
                 header += '<li><span class="badge pclr18 tcount">'+0+'</span>Total Images</li>';             
                 header += '</ul>';  
                  
                 this.$el.parents(".modal").find(".camp_header h2").after(header);
                 var that = this;
                 $(".c-current-status,#template_search_menu li a").click(function(){
                    that.type = "list";
                    that.search_text = "";
                    that.offset = 0;
                    that.total_fetch = 0; 
                    that.render(); 
                });
            },
            // Upload while Click on button to call the drag file area to upload
            upload:function(obj){
                var input_obj = obj.target;
                var files = input_obj.files;  
                if(this.dropPanel.data("dragfile")){
                    this.dropPanel.data("dragfile").handleFileUpload(files);
                }
            },
            // After Uploading/ Call back function to render new Li element for newly uploaded image.
            processUpload:function(data){
                var _image= jQuery.parseJSON(data);
                var that = this;
                if(_image.success){
                    var model = _image.images[0].image1;
                    this.objUserImages.add(model);  
                    var last_model = this.objUserImages.last();
                    if(this.fromDialog){
                        var parents = this.$el.parents(".modal");
                    }else{
                        var parents = this.$el.parents(".ws-content");
                    }
                    var headerSet = parents.find(".camp_header .tcount").text();
                    this.total = parseInt(headerSet) + 1;
                    this.changecount = true;
                     if(this.fromDialog){
                        this.headerSettingDialog(this.total);
                    }else{
                        this.headerSetting(this.total);
                    }
                   
                    
                   parents.find(".thumbnails li:first").after(new viewUserImage({model: last_model,'app':this.app,fromDialog:that.fromDialog,_dialog:that._select_dialog,_select_page:that._select_page}).el);
                 }
                else{
                    this.app.showAlert(_image.err1,$("body"),{fixed:true});
                }
            },
            // Thumbnail Generate for List Upload element.
            thumbnailHTML:function(that){
              
               if(that.fromDialog){
                        var parents = that.$el.parents(".modal");
                    }else{
                        var parents = that.$el.parents(".ws-content");
                }
                if(parents.find('.upload').length) return;
              
                
               var li = "<li class='span3 upload'>"
                            +"<div class='thumbnail browse graphics'>"
                               +"<div class='drag'>"
                                   +"<div class='droppanel'><h4><img src='img/droparrow.png'><br class='clearfix'>Drag images here to upload</h4></div>"
                                   +"<div class='SI-FILES-STYLIZED' style='display:inline-block;position:relative;'>"
                                   +"<label style='width:154px;' class='cabinet'>"
                                   +"<input id='file_control' name='file' class='file' type='file'>"
                                   +"</label>"
                                   +"<a  class='btn-blue g-btn'><span style='padding: 0px 36px;'>Browse & upload</span><i class='icon update' style='padding-top:15px'></i></a>"
                                +"</div>"
                                +"</div>"
                            +"</div>"
			+"</li>"
                 return li;    
            },TryDialog:function(){
                    var that = this;
                    var app = this.options.app;
                    var dialog_width = $(document.documentElement).width()-60;
                        var dialog_height = $(document.documentElement).height()-162;
                        var dialog = this.options.app.showDialog({title:'Images',
                                    css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                                    headerEditable:true,
                                    headerIcon : '_graphics',
                                    bodyCss:{"min-height":dialog_height+"px"}                                                                          
                         });
                         //// var _options = {_select:true,_dialog:dialog,_page:this}; // options pass to
                     this.options.app.showLoading("Loading...",dialog.getBody());
                     require(["userimages/userimages",'app'],function(pageTemplate,app){                                     
                         var mPage = new pageTemplate({app:app,fromDialog:true,_select_dialog:dialog,_select_page:that});
                         dialog.getBody().html(mPage.$el);
                        // $('.modal .modal-body').append("<button class='ScrollToTop' style='display:none;display: block;position: relative;left: 95%;bottom: 70px;' type='button'></button>");
                       // this.$el.parents(".modal").find(".modal-footer").find(".ScrollToTop").remove();
                         //dialog.saveCallBack(_.bind(mPage.returnURL,mPage,dialog,_.bind(that.useImage,that)));
                     });
                     
                },
                useImage:function(url){
                    this.$el.find(".search-control").val(url);
                }
        });    
});