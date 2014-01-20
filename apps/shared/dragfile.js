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
      this.options = this.getOptions(options)            
      this.post_url = this.options.post_url     
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
      for (var i = 0; i < files.length; i++)
        {
            if(this.validate(files[i])){
                var fd = new FormData();
                fd.append('file', files[i]);          
                this.sendFileToServer(fd);
            }
        }
  },
  sendFileToServer:function(formData){
       var uploadURL =this.post_url;  
       var _this = this;
       this.app.showLoading("Uploading...",this.$element);
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
                        //Set progress
                        //status.setProgress(percent);
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
    extraData:{}
  }

}(window.jQuery);