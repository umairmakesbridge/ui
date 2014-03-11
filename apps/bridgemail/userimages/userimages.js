define(['userimages/collections/userimages','userimages/userimage','text!userimages/html/userimages.html','jquery.bmsgrid','bms-dragfile','jquery-ui'],
function (collectionUserImages,viewUserImage,template,bms_grid,dragfiles,jqueryui) {
        'use strict';
        return Backbone.View.extend({
            className: 'template_gallry',
            events: {
               "change .upload #file_control":"upload",
               "keyup #search-graphics-input":"searchKeyPress",
               "click #clearsearch":"clearSearch",
               // These are the child view actions, all position absolute, so in child view, but actually absolute have no
               //fix position, that is why its render in main view.
               "click .tip-dialogue .closebtn":"hideURL"
            },
            initialize: function () {
                   this.template = _.template(template);				
                   var app = this.options.app;
                   this.updateHeaderCount();
                   this.timer = 0;
                   this.total = 0;
                   this.type = "list";
                   this.total_fetch = 0;
                   this.objUserImages = new collectionUserImages();                              
                   this.offset = 0;               
                   this.search_text = '';
                   this.dropPanel =  "";
                   this.search_tags = '';
                   this.order_by = 'updationDate';
                   this.render();
                   var that = this;
                   
            },
            render: function (search) {
             if(search)
                this.search_text = search;
              this.stackImages = "";
              this.app = this.options.app;
              this.$el.html(this.template({}));
              this.fetchImages();
              $(window).scroll(_.bind(this.liveLoading,this));
              $(window).resize(_.bind(this.liveLoading,this));
                   // this.initControls();                   
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
                   this.$el.find(".thumbnails li").remove();
                   this.fetchImages();
           }
           ,
           searchKeyPress:function(ev){
               var that = this;
               $('#clearsearch').show();
               if (ev.keyCode == 13)
                 that.search(true,ev);
               else{ 
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
                var inview = that.$el.find('.thumbnails li:last').filter(function() {
                    var $e = $(this),
                        wt = $w.scrollTop(),
                        wb = wt + $w.height(),
                        et = $e.offset().top,
                        eb = et + $e.height();
                    return eb >= wt - th && et <= wb + th;
                  });
                if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                   inview.removeAttr("data-load");
                   $('.loadmore').show();
                   this.fetchImages(20);
                }  
            },
           fetchImages:function(fcount){
               var that = this;
               if(!fcount){
                    this.offset = 0;
                    this.app.showLoading('Loading Images....',$(".campaign-content"));
               }
               else{
                    this.offset = this.offset + 50;
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
                           var viewImage = new viewUserImage({model: model,'app':that.app});
                           that.$el.find('.thumbnails').append(viewImage.el);
                           that.listenTo(viewImage, 'tagclick', that.searchTag);
                         });
                         that.total_fetch = that.total_fetch + data.length;
                         that.dragFileSetting();
                         that.headerSetting();
                         if(that.total_fetch < parseInt(that.total)){
                                that.$(".thumbnails li:last").attr("data-load","true");
                          } 
                          $('.loadmore').hide();
                            if(!fcount){
                                that.app.showLoading(false,$(".campaign-content"));
                            }                        
                        }
               });
           },
           dragFileSetting:function(){
               var that = this;
             that.$el.find(".thumbnails").prepend(that.thumbnailHTML);
                that.$(".droppanel").dragfile({
                    post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+that.app.get('bms_token')+'&type=add&allowOverwrite=N&th_width=240&th_height=230',
                    callBack : _.bind(that.processUpload,that),
                    app:that.app,
                    module:'Image'
                });  
           },
           headerSetting:function(total){
                var that = this;
                if(total)
                    that.total = total;
                else 
                    that.total = this.objUserImages.total;
                that.$el.find('#total_graphics .badge').text(that.total);
                 
                $(".camp_header .c-name ul li .tcount").text(that.total);
                this.dropPanel = this.$(".droppanel");
                //$(".tag span").on('click',function(){
                  //  that.searchTag($(this).html());
               // });
                
           },
           searchTag:function(text){
                   if(text){
                       
                      this.offset = 0;
                      this.total_fetch = 0; 
                      this.tagTxt =$.trim(text);
                      $('#clearsearch').show();
                      $("#search-graphics-input").val("Tag: "+$.trim(text));
                      this.type="search";
                      this.$el.find(".thumbnails li").remove();
                      this.fetchImages();
                    }
               
           },
           hideURL:function(ev){
               $(".thumbnails .tip-dialogue").remove();
               
           },
            updateHeaderCount:function(){
               var header =  '<ul class="c-current-status">';
                 header += '<li><span class="badge pclr18 tcount">'+0+'</span>Total Images</li>';             
                 header += '</ul>';  
                 $(".camp_header .c-name h2 ").after(header);
                 var that = this;
                 $(".c-current-status,#template_search_menu li a").click(function(){
                    that.type = "list";
                    that.search_text = "";
                    that.offset = 0;
                    that.total_fetch = 0; 
                    that.render(); 
                });
               
            },
            upload:function(obj){
                
                var input_obj = obj.target;
                var files = input_obj.files;  
                if(this.dropPanel.data("dragfile")){
                    this.dropPanel.data("dragfile").handleFileUpload(files);
                }
            },
            processUpload:function(data){
                var _image= jQuery.parseJSON(data);
                if(_image.success){
                 //this.render();
                    var model = _image.images[0].image1;
                    this.objUserImages.add(model);  
                    var last_model = this.objUserImages.last();
                    this.total = parseInt(this.total) + 1;
                    this.headerSetting(this.total);
                    $(".thumbnails li:first").after(new viewUserImage({model: last_model,'app':this.app}).el);
                 }
                else{
                    this.app.showAlert(_image.err1,$("body"),{fixed:true});
                }
            },
            thumbnailHTML:function(){
                $("ul li.upload").remove();
                $("ul li.li-progress").remove();
                
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
            }
        });    
});