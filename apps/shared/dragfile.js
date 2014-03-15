/*
 *Created by : Umair Shahid
 *Drag File plugin
 *Version: 1 
 *=================================*/

!function ($) {
  "use strict"; 

  var Dragfile = function (element, options) {
    this.init(element, options)
  }

  Dragfile.prototype = {

    constructor: Dragfile

  , init: function (element, options) {           
      this.$element = $(element)
      this.$element.css("position:relative");
      this.options = this.getOptions(options);            
      this.module = this.options.module;
      this.name = "";
      this.from = this.options.from_dialog;
      this.post_url = this.options.post_url;
      this.progressElement = this.options.progressElement;
      this.app = this.options.app;
     //Click on add tag button      
     //this.ele.find(".addtag").on("click",$.proxy(this.showTagsDialog,this))
     this.$element.on("dragenter",$.proxy(this._dragenter,this))
     this.$element.on("dragover",$.proxy(this._dragover,this))
     this.$element.on("drop",$.proxy(this._drop,this))      
     
     var _this = this;
     $(document).on('dragenter', function (e)
     {
            e.stopPropagation();
            e.preventDefault();
     });
     $(document).on('dragover', function (e)
      {
        e.stopPropagation();
        e.preventDefault();
        _this.$element.addClass('file-border');
      });
     $(document).on('drop', function (e)
      {
        e.stopPropagation();
        e.preventDefault();
      });
   
    },
  _dragenter:function(e){
    e.stopPropagation();
    e.preventDefault();
    this.$element.addClass('file-border');
  },
  _dragover:function(e){
     e.stopPropagation();
     e.preventDefault();
  },
  _drop:function(e){
     this.$element.removeClass('file-border');
     e.preventDefault();
     var files = e.originalEvent.dataTransfer.files;
     //We need to send dropped files to Server
     this.handleFileUpload(files,e);
  },
  validate:function(file){
      var isImage = true;
      if(file.type.indexOf("image")<0){
          this.app.showAlert("Please select a image with extension jpeg,jpg,png or gif.",$("body"),{fixed:true})
          isImage = false
      }
      return isImage;
  },
  handleFileUpload:function(files,obj){
      this.name= files;
      for (var i = 0; i < files.length; i++)
        {
            if(this.validate(files[i])){
                var fd = new FormData();
                fd.append('file', files[i]);
                this.name = files[i];
                this.sendFileToServer(fd);
            }
        }
  },
  sendFileToServer:function(formData){
       var uploadURL =this.post_url;  
       var _this = this;
       var data_id = 0;
       if(this.module == "Image"){
         var index = $('.li-mew-images').size();
         var id =  index + 1;
            data_id = id;
         if(this.from)
            $(".modal .images_grid .thumbnails li:eq(0)").after(this.uploadInProgressHTML(data_id));
         else
            $(".images_grid .thumbnails li:eq(0)").after(this.uploadInProgressHTML(data_id));
         $('#templi_'+data_id).fadeIn();
        }
       if(this.module !=="Image")this.app.showLoading("Uploading...",this.$element);
       var jqXHR=$.ajax({
            xhr: function() {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                    xhrobj.upload.addEventListener('progress', function(event) {
                        var percent = 0;
                        var position = event.loaded || event.position;
                        var total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                        }
                         if(_this.module == "Image"){
                           $('#templi_'+data_id+' #progress div').css('width',percent+"%") 
                          }
                    }, false);
                }
            return xhrobj;
        },
        url: uploadURL,
        type: "POST",
        contentType:false,
        processData: false,
            cache: false,
            data: formData,
            success: function(data){
                _this.app.showLoading(false,_this.$element);
                 $('#templi_'+data_id).remove();
                _this.options.callBack(data);  
            }
        });

  }
  , getOptions: function (options) {
      options = $.extend({}, $.fn.dragfile.defaults, options)    
      return options
    }
  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    },
     bytesToSize: function (bytes) {
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                if (bytes == 0) return '0 Bytes';
                var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    },
    uploadInProgressHTML:function(id){
        var li = "<li id=templi_"+id+" class='span3 li-progress li-mew-images' style='display:none;'><div class='thumbnail graphics'>\n\
                     <div id='progress' style='position:absolute; top:50%; z-index:1001; opacity:100;height: 10px; width: 238px;margin-left:1px;'><div style='background:#97D61D'></div></div>\n\
                     <div class='img' style='opacity:0.6; line-height: 230px; '>\n\
                             <img src='img/graphicimg.png'>\n\
                     </div>\n\
                     <div class='caption' style='opacity:0.6; height:83px;'>\n\
                         <h3 class='graphics-name'>\n\
                         <a><span>"+this.name.name+"</span></a>\n\
                         </h3>\n\
                      <p>\n\
                      <em class='iconpointy'><a class='btn-green showtooltip' original-data-title='Add Tags' ><i class='icon plus left'></i></a></em>\n\
                      </p></div>\n\
                      <div class='btm-bar' style='opacity:0.6; margin:0px;'>\n\
                        <span><small class='gray'>"+this.bytesToSize(this.name.size)+"</small> | </span>\n\
                        <span><small class='gray'>0<small>  x  </small> 0 </small> </span>\n\
                         <a class='icon fav gray active right showtooltip' ></a>\n\
                         <a class='icon link right showtooltip'></a>\n\
                     </div>\n\
                     </div>\n\
                  </li>";
        return li;
     }
  }

 /* DRAGFILE PLUGIN DEFINITION
  * ========================= */

  $.fn.dragfile = function ( option ) {
    return this.each(function () {
      $(this).removeData('dragfile')    
      var $this = $(this)
        , data = $this.data('dragfile')
        , options = typeof option == 'object' && option
      if (!data) $this.data('dragfile', (data = new Dragfile(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.dragfile.Constructor = Dragfile

  $.fn.dragfile.defaults = {    
    app:null,
    post_url:'',
    from:'',
    progressElement:null,
    module:'',
    extraData:{}
  }

}(window.jQuery);