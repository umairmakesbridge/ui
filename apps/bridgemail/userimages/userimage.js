/* 
 * Module Name : Image Uploading / Image Module / Graphics Module.
 * Author: Pir Abdul Wakeel
 * Date Created: 10 March 2014
 * Description: Single view for each each, each image have there own events, triggers etc.
 * The html of this single image view is place in html/userimage.html, change may cause changes in single
 * Image view in grid. require bms_tags and userimage html. events remove/preview/select/show url/mark fav/ etc.
 */

define(['text!userimages/html/userimage.html', 'bms-tags'],
        function(template, bmstags) {
            'use strict';
            return Backbone.View.extend({
                tagName: 'li',
                className: "span3",
                events: {
                    "click #delete": "remove",
                    "click #graphics-title": "preview",
                    "click #preview": "preview",
                    "click .select-image": "useImage",
                    "click .link": "showURL",
                    "click .fav": "markFavourite",
                   // "click .download_img": 'downloadImage'
                },
                initialize: function(options) {
                    this.template = _.template(template);
                    this._dialog = this.options._dialog;
                    this.render();
                },
                getURL: function() {
                    var url = this.model.get('originalURL');
                    url = this.options.app.decodeHTML(url);
                    return url;
                },
                downloadImage: function(ev) {
                   
                    var url = this.model.get('originalURL');
                    url = this.options.app.decodeHTML(url);
                    ev.preventDefault();  //stop the browser from following
                    //window.location.href = url;
                    this.createIframe(url,ev);
                    return false;
                    console.log(this.detectIE());
                    if (this.detectIE()) {
                        document.execCommand('SaveAs', true, url);
                        return false;
                    }
                    ev.preventDefault();
                    return false;
                },
                createIframe: function(url,ev) {
                       url = url.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
                       //$('#my_image').attr('src',url);
                       window.open(url,true,'_blank');
                    
 
                    
                    
                    /* var _iframe_dl = $('<iframe />')
                       .attr('src', url)
                       .attr('id','iframe_image_download')
                       .hide()
                       .appendTo('body');//.delay(200).remove());      
                       var triggerDelay =   100;
                            var cleaningDelay =  20000;
                            var that = this;
                            setTimeout(function() {
                                var frame = $('<iframe style="width:1px; height:1px;" class="multi-download-frame"></iframe>');
                                frame.attr('src', url+"?"+ "Content-Disposition: attachment ; filename="+that.model.get('fileName'));
                                $(ev.target).after(frame);
                                setTimeout(function() {
                                    frame.remove();
                                }, cleaningDelay);
                            }, triggerDelay);
                            */
                },
                disableWobbling: function(ev) {
                    ev.preventDefault();
                    return false;
                },
                markFavourite: function(ev) {
                    var obj = $(ev.target);
                    var imageId = obj.data('id');
                    var _this = this;

                    if (obj.hasClass("active")) {
                        _this.model.set('isFavorite', 'N');
                        obj.removeClass('active');
                    } else {
                        obj.addClass('active');
                        _this.model.set('isFavorite', 'Y');
                    }
                    var URL = "/pms/io/publish/saveImagesData/?BMS_REQ_TK=" + this.options.app.get('bms_token');
                    $.post(URL, {type: 'favorite', imageId: imageId, favorite: _this.model.get('isFavorite')})
                            .done(function(data) {
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== 'err') {

                                }
                                else {
                                    _this.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                }
                            });

                },
                isFavourite: function(fav) {
                    var isFavourite = this.model.get(fav);
                    if (isFavourite == "Y") {
                        return "active";
                    }
                },
                showURL: function(ev) {

                    var obj = $(ev.target);

                    if ($(".tip-dialogue")) {
                        $(".tip-dialogue").remove();
                    }
                    var url = $(ev.target).data('url');
                    var position = obj.offset();
                    var top = position.top - 190;
                    var left = 0;
                    left = position.left - 388;
                    var urlHTML = "<div class='tip-dialogue' >";
                    urlHTML += "<a class='closebtn'></a>";
                    urlHTML += "<h4>Image URL</h4>";
                    urlHTML += "<input type='text' value='" + url + "' style='width:202px;' class='left tginput' placeholder='Image URL'>";
                    urlHTML += "</div>";
                    if (this.options.fromDialog) {
                        $('.modal .modal-body .thumbnails').append(urlHTML);
                        top = top + $(".modal .modal-body").scrollTop();
                        $(".tip-dialogue").css({left: left + 50, top: top + 55});
                    } else {

                        $('.thumbnails').append(urlHTML);
                        $(".tip-dialogue").css({left: left, top: top});
                    }
                    $(".tip-dialogue").show('fast');
                },
                render: function() {
                    this.$el.html(this.template(this.model.toJSON()));
                    
                    this.showTags();
                    if (this.options.fromDialog){
                        this.$el.find(".select-image").show();
                    }
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    
                },
                showTags: function() {
                    var that = this;
                    var imageId = this.model.get('imageId.encode');
                    this.$el.find(".caption  #tags").tags({app: this.options.app,
                        url: "/pms/io/publish/saveImagesData/?BMS_REQ_TK=" + this.options.app.get('bms_token'),
                        tags: this.model.get('tags'),
                        showAddButton: (imageId == "0") ? false : true,
                        module: "Image",
                        callBack: _.bind(that.tagUpdated, that),
                        params: {type: 'tags', imageId: imageId, tags: ''}
                    });

                    this.$el.find('.tag span').on('click', function() {
                        that.trigger('tagclick', $(this).text());
                    });
                    this.$el.find(".tags-contents .tagicon").remove();

                },
                tagUpdated: function(data) {
                    this.model.set('tags', data);
                    this.render();
                    this.showTags();

                },
                bytesToSize: function(bytes) {
                    var bytes = this.model.get(bytes);
                    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                    if (bytes == 0)
                        return '0 Bytes';
                    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
                },
                fileName: function(file) {

                    return this.model.get(file);
                },
                PreviewfileName: function(file) {
                    var f = "Preview  &quot;" + this.model.get(file) + "&quot;";
                    return f;
                },
                getId: function(id) {
                    if (id)
                        return this.model.get(id);
                },
                SplitCommaTagsWithoutCross: function(tags) {
                    var list = "<span class='tagicon gray' style='margin-left:8px;'></span><ul style='width:auto'>";

                    if (!this.model.get('tags'))
                        return;
                    var listArray = this.model.get('tags').split(",");
                    _.each(listArray, function(item) {
                        list += "<li><a class='tag'><span> " + item + "</span></a></li>";
                    });
                    list += "</ul>";
                    return list;
                },
                preview: function() {
                    var img = "<img src="+this.model.get("originalURL") + "/>"
                    var that = this;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 162;
                    var dialog = this.options.app.showDialog({title: " " + that.model.get("fileName"),
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                        headerEditable: true,
                        headerIcon: '_graphics',
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    if (this.model.get('isFavorite') == "Y")
                        dialog.$el.find('.dialog-title').append("<i class='icon fav left active' style='display:inline;top:0px;'></i>");
                    // dialog.$el.find('#dialog-title').append("&nbsp;<span class='icon link-preview showtooltip' data-original-title='Click to view link' data-url='"+this.model.get("originalURL")+"'></span>").click(function(ev){
                    ///   that.showURL(ev,true);
                    /// });

                    dialog.$el.find('.tagscont').append(this.SplitCommaTagsWithoutCross(this.model.get('tags'))).css('margin-left', '48px');
                    dialog.$el.find('.pointy').hide();
                    dialog.$el.find("camp_header .icon").css("margin", "0px");
                    dialog.$el.find('.dialog-title').addClass('images-preview');
                    if(dialog.$el.find('.c-current-status').length > 0){
                        dialog.$el.find('.c-current-status').hide();
                    }
                    var dialogArrayLength = that.options.app.dialogArray.length; // New Dialog
                    var wrapelement = 'dialogWrap-'+dialogArrayLength; // New Dialog
                   
                    var img = "<img id='img1' src= '"+this.model.get("originalURL") + "' class='"+wrapelement+"'>";
                    dialog.getBody().append(img);
                    this.showLoadingWheel(true, dialog.$el.find(".images-preview"));
                    $('#img1').load(function() {
                        that.showLoadingWheel(false, dialog.$el.find(".images-preview"));
                    });

                },
                showLoadingWheel: function(isShow, ele) {
                    if (isShow)
                        ele.append("<div class='loading-wheel right' style='margin-left:5px;margin-top: 9px;position: inherit!important;'></div>")
                    else {
                        var ele = ele.find(".loading-wheel");
                        ele.remove();
                    }
                },
                remove: function(e) {
                    var _this = this;
                    var imageId = $(e.target).attr('rel').split("__")[1];
                    _this.options.app.showAlertDetail({heading: 'Confirm Deletion',
                        detail: "Are you sure you want to delete this image?",
                        callback: _.bind(function() {
                            this.options.app.showLoading("Deleting Graphics...", $(e.target).parents('.span3'),{fixed:'fixed'});
                            var URL = "/pms/io/publish/saveImagesData/?BMS_REQ_TK=" + this.options.app.get('bms_token');
                            $.post(URL, {type: 'delete', imageId: imageId})
                                    .done(function(data) {
                                        _this.options.app.showLoading(false, $(e.target).parents('.span3'));
                                        var _json = jQuery.parseJSON(data);
                                        if (_json[0] !== 'err') {
                                            $(e.target).parents('.span3').fadeOut('slow');
                                            //$(e.target).parents('.span3').remove();
                                            _this.updateCount();
                                        }
                                        else {
                                            _this.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                        }
                                    });
                        }, _this)},
                    $('body'));
                },
                useImage: function(ev) {
                    if (this.options.callBack) {

                        this.options.callBack({imgurl: $(ev.target).data('url'), imgencode: this.model.get('imageId.encode'), imgthumb: $(ev.target).data('thumb')});
                    }
                    else {
                        this.options._select_page.useImage($(ev.target).data('url'));
                    }
                    $('.modal-open .custom_popup').remove();
                    if(this.options.isClose){
                        this._dialog.hide();
                    }
                    else{
                    this._dialog.showPrevious();
                    }
                },
                // Update header count when delete called inside success for deletion.
                updateCount: function() {
                    var parents = 0;

                    if (this.options.fromDialog) {
                        parents = this.$el.parents(".modal");
                    } else {
                        parents = this.$el.parents(".ws-content");
                    }
                    var headerSet = parents.find(".camp_header .tcount").text();
                    parents.find(".camp_header .tcount").text(parseInt(headerSet) - 1);
                    $('#total_graphics .badge').text(parseInt(headerSet) - 1);

                } 
                
            });
        });
 