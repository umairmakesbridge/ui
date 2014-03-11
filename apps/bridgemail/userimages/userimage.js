/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
define(['text!userimages/html/userimage.html','bms-tags'],
function (template,bmstags) {
        'use strict';
        return Backbone.View.extend({     
            tagName:'li',
            className:"span3",
            events:{
                "click #delete":"remove",
                "click #graphics-title":"preview",
                "click #preview":"preview",
                "click .link":"showURL",
                "click .fav":"markFavourite"
            },
            initialize:function(options){
               this.template = _.template(template);
               this.render();
               this.showTags();
               
            },
            markFavourite:function(ev){
                var obj = $(ev.target);
                var imageId = obj.data('id');
                var _this = this;
                
                if(obj.hasClass("active")){
                    _this.model.set('isFavorite','N');
                    obj.removeClass('active');
                 }else{
                    obj.addClass('active'); 
                    _this.model.set('isFavorite','Y');
                }
                var URL = "/pms/io/publish/saveImagesData/?BMS_REQ_TK="+this.options.app.get('bms_token');
                $.post(URL, {type:'favorite',imageId:imageId,favorite:_this.model.get('isFavorite')})
                .done(function(data) {                  
                       var _json = jQuery.parseJSON(data);        
                       if(_json[0]!=='err'){
                           
                        }
                       else{
                            _this.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                        }
              });
                
            },
            isFavourite:function(fav){
                var isFavourite = this.model.get(fav);
                if(isFavourite == "Y"){
                  return "active";
                }
            },
            showURL:function(ev){
                var obj = $(ev.target);
                if($(".tip-dialogue")){
                    $(".tip-dialogue").remove();
                }
                var url = $(ev.target).data('url');
                var position = obj.offset(); 
                var top = position.top - 190;
                var urlHTML = "<div class='tip-dialogue'>";
                    urlHTML +="<a class='closebtn'></a>";
                    urlHTML +="<h4>Image URL</h4>";
                    urlHTML +="<input type='text' value='"+url+"' style='width:202px;' class='left tginput' placeholder='Image URL'>";
                    urlHTML +="</div>"; 
                $('.thumbnails').append(urlHTML);
                $(".tip-dialogue").css({left:position.left-378,top:top});
                $(".tip-dialogue").show('fast');
            },
           render:function(){
                  var that = this;
                  this.$el.html(this.template(this.model.toJSON()));
                  this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
                  return this;
            },
            showTags:function(){
                var that = this;
                var imageId = this.model.get('imageId.encode');
                  this.$el.find(".caption  #tags").tags({app:this.options.app,
                        url:"/pms/io/publish/saveImagesData/?BMS_REQ_TK="+this.options.app.get('bms_token'),
                        tags:this.model.get('tags'),
                        showAddButton:(imageId=="0")?false:true,
                        module:"Image",
                        callBack:_.bind(that.tagUpdated,that),
                        params:{type:'tags',imageId:imageId,tags:''}
                    });
               
                this.$el.find('.tag span').on('click',function(){
                    that.trigger('tagclick', $(this).html());
                });
                this.$el.find(".tags-contents .tagicon").remove();   
                  
            },
           tagUpdated:function(data){
                this.model.set('tags',data);
                this.render();
                this.showTags();
                
           },
           bytesToSize: function (bytes) {
                var bytes = this.model.get(bytes);
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                if (bytes == 0) return '0 Bytes';
                var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
           },
           fileName:function(file){
               
              return this.model.get(file);
           },
           PreviewfileName:function(file){
               var f = "Preview  &quot;" + this.model.get(file)+"&quot;";
               return f;
           },
           getId:function(id){
               if(id) return this.model.get(id);
           },
         
           SplitCommaTagsWithoutCross:function(tags){
              var list = "<span class='tagicon gray' style='margin-left:8px;'></span><ul style='width:auto'>";
              
              if(!this.model.get('tags')) return;
              var listArray = this.model.get('tags').split(",");
              _.each(listArray, function(item) {
                  list +="<li><a class='tag'><span> "+item+"</span></a></li>";
              });
              list+="</ul>";
              return list;
           },
           preview:function(){
                    var img = "<img src="+this.model.get("originalURL")+"/>"
                    var that = this;
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-162;
                    var dialog = this.options.app.showDialog({title:" " + that.model.get("fileName"),
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                              headerEditable:true,
                              headerIcon : '_graphics',
                              bodyCss:{"min-height":dialog_height+"px"}                                                                          
                    });
                    if(this.model.get('isFavorite') == "Y")
                        dialog.$el.find('.dialog-title').append("<i class='icon fav left active' style='display:inline;top:0px;'></i>");
                    dialog.$el.find('.tagscont').append(this.SplitCommaTagsWithoutCross(this.model.get('tags'))).css('margin-left','48px');
                    dialog.$el.find('.pointy').remove();
                    dialog.$el.find('.dialog-title').addClass('images-preview');
                    var img = "<img id='img1' src='"+this.model.get("originalURL")+"'>";
                    dialog.getBody().html(img);  
                    this.options.app.showLoading('Loading '+ that.model.get("fileName") + ' ...',dialog.getBody());
                    $('#img1').load(function(){
                        that.options.app.showLoading(false,dialog.getBody());
                    });   
                 
           } ,
           remove:function(e){
             var _this = this;
             var imageId = $(e.target).attr('rel').split("__")[1];
                   _this.options.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this image?",                                                
                            callback: _.bind(function(){													
                                this.options.app.showLoading("Deleting Graphics...",this.$el);
                                    var URL = "/pms/io/publish/saveImagesData/?BMS_REQ_TK="+this.options.app.get('bms_token');
                                    $.post(URL, {type:'delete',imageId:imageId})
                                    .done(function(data) {                  
                                          _this.options.app.showLoading(false,_this.$el);   
                                           var _json = jQuery.parseJSON(data);        
                                           if(_json[0]!=='err'){
                                               $(e.target).parents('.span3').fadeOut('slow');
                                             }
                                           else{
                                                _this.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                           }
                                   });
                            },_this)},
                    _this.$el);      
           }
            
        });
});
 