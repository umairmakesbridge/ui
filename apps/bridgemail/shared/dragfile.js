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
      this.section = this.options.section;
      //this.progElement = this.option.progress;
      this.name = [];
      this.from = this.options.from_dialog;
      this.post_url = this.options.post_url;
      this.progressElement = this.options.progressElement;
      this.app = this.options.app;
      this.errMessage = 0;
      this.fileName = '';
      this.baloon = false;

     //Click on add tag button      
     //this.ele.find(".addtag").on("click",$.proxy(this.showTagsDialog,this))
     this.$element.on("dragenter",$.proxy(this._dragenter,this))
     this.$element.on("dragover",$.proxy(this._dragover,this))
     this.$element.on("drop",$.proxy(this._drop,this))      
      //this.$element.on('dragleave',$.proxy(this._dragleave,this))
     

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
        //_this.$element.append(_this.UploadInstantBaloon());
        _this.$element.addClass('file-border');
        setTimeout(function(){
        if(typeof element !="undefined")
        $(element).removeClass('file-border');
       }, 3000);
        
      });
     $(document).on('drop', function (e)
      {
        _this.$element.removeClass('file-border');
        //_this.$element.find('.dropdiv').remove();
        _this.baloon = true;
        e.stopPropagation();
        e.preventDefault();
      });
               
    },
  _dragenter:function(e){
    e.stopPropagation();
    e.preventDefault();
    this.$element.addClass('file-border');
     var _this = _this;
    setTimeout(function(){
     if(typeof element !="undefined")
     $(element).removeClass('file-border');
    }, 3000);
    //this.$element.append(this.UploadInstantBaloon());    

  },
  _dragover:function(e){
     e.stopPropagation();
     e.preventDefault();
  },
  _dragleave:function(e){
     this.$element.removeClass('file-border');
     //this.$element.find('.dropdiv').remove();
     this.baloon = false;
     e.preventDefault();
     e.stopPropagation();
  },
  _drop:function(e){
     this.$element.removeClass('file-border');
     //this.$element.find('.dropdiv').remove();
     this.baloon = true;
     e.preventDefault();
     var files = e.originalEvent.dataTransfer.files;
     //We need to send dropped files to Server
     this.handleFileUpload(files,e);
  },
  
  validate:function(file){
      var returnVal = true;
      if(!this.module){
          this.module = 'Image';
      }
      if(this.module === "Image" || this.module == "template"){
         returnVal = this.valideImage(file);
      }else if(this.module === "csv"){
          returnVal = this.valideCSV(file);
      }else{
          this.app.showAlert("Please select only Image or CSV file.",$("body"),{fixed:true})
          returnVal = false;
      }
      return returnVal;
  },
  handleFileUpload:function(files,obj){
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
         $(".messagebox").hide('fast');  
         var index = $('.li-mew-images').size();
         var id =  index + 1;
            data_id = id;
        if(this.section != "topMenu"){
         if(this.from_dialog)
            $(".modal .images_grid .thumbnails li:eq(0)").after(this.uploadInProgressHTML(data_id));
         else
            $(".images_grid .thumbnails li:eq(0)").after(this.uploadInProgressHTML(data_id));
        }else{
            $(".imgs_added").show();
            $(".imgs_added ul").prepend(this.uploadInProgressTopMenu(data_id));
        }
            $('#templi_'+data_id).fadeIn();
         
        }else if(this.module == "csv" || this.module=="template"){            
            this.progressElement.append('<div class="csv-opcbg"></div>')
            this.progressElement.append("<div id='progress' class='progress-bar'><div class='progress-bar-slider'></div></div>");            
        }
        
       //if(this.module !=="Image" || this.module !== "csv")this.app.showLoading("Uploading...",this.$element);
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
                          }else if(_this.module == "csv" || _this.module == "template"){
                              _this.progressElement.find('#progress div').css('width',percent+"%");
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
                 if(_this.module !='Image'){
                    _this.progressElement.find("#progress").remove();
                   _this.progressElement.find(".csv-opcbg").remove();
               }  
                _this.options.callBack(data,{fileName:_this.fileName});  
            }
            ,
            error:function(){
                 _this.app.showLoading(false,_this.$element);
                 $('#templi_'+data_id).remove();
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
        if($("#templi_"+id).find('.'+this.name.name).length > 0) return;
        var li = "<li id=templi_"+id+"  class='span3 li-progress li-mew-images ' style='display:none;'><div class='thumbnail graphics'>\n\
                     <div id='progress' style='position:absolute; top:50%;background: none repeat scroll 0 0 #FFFFFF; z-index:1001; opacity:100;height: 6px; width: 97%;border: 1px solid #FFFFFF;margin-left:1px;border-radius:9px;'><div style='background:#97D61D;height:6px;border-radius: 9px;'></div></div>\n\
                        <div class='img' style='opacity:0.6; line-height: 230px; '>\n\
                                <img src='img/graphicimg.png'>\n\
                        </div>\n\
                     <div class='caption' style='opacity:0.6; height:115px;'>\n\
                         <h3 class='graphics-name "+this.name.name+"'>\n\
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
     },
     uploadInProgressTopMenu:function(id){
          if($("#templi_"+id).find('.'+this.name.name).length > 0) return;
          var li = "<li id=templi_"+id+" class='li-mew-images' style='display:none; min-width:75px; min-height:78px'>";
              li = li + "<div id='progress' style='position:absolute; top:50%;background: none repeat scroll 0 0 #FFFFFF; z-index:1001; opacity:100;height: 6px; width: 94%;border: 1px solid #FFFFFF;margin-left:1px;border-radius:9px;'><div style='background:#97D61D;height:6px;border-radius: 9px;'></div>";
              li = li +"</li>";
        return li; 
     },
     UploadInstantBaloon: function(){         
         var value = '',
          image = 'graphicimg',
          top = '50%',
          position ='absolute',
          addClass = '',
          background = '#45C4F3';
         if(this.baloon===false){
            if(this.module=='Image'){
                top = '70%;';
                position = 'fixed';
                value = "Drop images here to instantly upload";
            }else if(this.module=='csv'){             
                image = 'csvimg';
                value = "Drop .csv file here to instantly upload";
            }else if (this.module == 'template'){
                addClass = 'dropdiv-template';
                value = "Drop images here to instantly upload";
            }
            var div = '<div class="dropdiv">\
                           <div class="dropcircle bounceIn '+addClass+'" style="position:'+position+';background:'+background+';top:'+top+'">\
                                   <img src="img/'+image+'.png" alt=""/>\
                                   <h5>'+value+'</h5>\
                           </div>\
                       </div>';             
            this.baloon = true;    
            return div;
         }else{
             return false;
         };
         
     },
     valideImage:function(file){
            var isImage = true;
            if(file.type.indexOf("image") < 0){
             this.app.showAlert("Please select a image with extension jpeg,jpg,png or gif.",$("body"),{fixed:true})
             isImage = false;
         }
         return isImage;
     },
     valideCSV: function(file){
         var isCSV = true;
         var appMsgs = this.app.messages[0];
         
         var extension = file.name.split(".")[file.name.split(".").length - 1].toLowerCase();
         this.fileName = file.name;
         if(extension!=="csv"){
                $('.messagebox .closebtn').click();
                if (this.errMessage == 0) {
                    this.app.showAlert(appMsgs.CSVUpload_wrong_filetype_error,$("body"),{fixed:true})
                    isCSV = false;
                    ++this.errMessage
                }
                else if (this.errMessage == 1) {
                    this.app.showAlert("Stop it! CSV only!",$("body"),{fixed:true})
                    isCSV = false;
                    ++this.errMessage
                }
                else if (this.errMessage == 2) {
                    this.app.showAlert("Can't you read?! CSV only!",$("body"),{fixed:true})
                    isCSV = false;
                    ++this.errMessage
                }
                else if (this.errMessage == 3) {
                    this.app.showAlert("Fine! Keep selecting non-CSV.",$("body"),{fixed:true})
                    isCSV = false;
                    this.errMessage = 0;
                }
         }
         return isCSV;
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