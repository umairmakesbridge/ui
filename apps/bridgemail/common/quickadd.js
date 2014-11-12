define(['jquery', 'backbone', 'underscore', 'app', 'text!common/html/quickadd.html','fileuploader','bms-dragfile','bms-tags','scrollbox'],
	function ($, Backbone, _, app, template,fileuploader,dragfile,bmstags,scrollbox) {
		'use strict';
		return Backbone.View.extend({
                        id: 'csvupload',
                        tags : 'div',
                        url_getMapping:"/pms/output/workflow/getMetaData.jsp",
                        url:"/pms/input/subscriber/uploadSubscribers.jsp",
                        dataArray:[],
                        map_feilds:[],
                        fileuploaded:false,
                        fileName:"",
                        formdata: !!window.FormData,
			initialize: function () {
                          this.template = _.template(template);
                          this.app = app;
                          this.uploaded = 0;
                          this.render();
			},
                        events:{
                          "click .q-graphic-g":'addQuickGraphics',
                          "click .quick-campaign-add":"addQuickCampaign",
                          "click .q-csv-g":"addQuickCSV",
                          "click .quick-autobot-add":"addQuickAutobot",
                          "click .quick-nurturetrack-add":"addQuickNurtureTrack",
                          'change #file_control':'uploadCsvFile',
                          'change #image_control':'uploadControl',
                          "click #hrfGallary":"showImageGallary",
                          "click #add_options li":'focusTabContent',
                          "click .slctbot li":'selectBotType',
                          'click .imgs_added ul li':'showImageSummary', 
                          'keyup input[type=text]':'captureEnterKey',
                          'click .delete':function(ev){
                             this.remove(ev);
                          },
                           'click .preview':function(ev){ 
                             var id = '#'+$(ev.target).data('checksum'); 
                             var obj = this.$el.find(id);
                             this.previewImage(obj);
                          }
                        },
                        selectBotType:function(ev){
                            this.$el.find('.slctbot li a').removeClass('active');
                             if ((ev.target.tagName) == "A")
                               $(ev.target).addClass('active');
                             else if((ev.target.tagName) == "LI")
                               $(ev.target).parents('li').find("a").addClass('active');
                             else
                               $(ev.target).parents('a').addClass('active');
                        },
                        captureEnterKey: function(e) {
                            var key = e.keyCode || e.which;
                            if (key == 13) {
                                $(e.target).parents('.takename').find('.btn-green').click();
                            }
                        },
                        focusTabContent:function(ev){
                            var obj = $(ev.target);
                            if(ev.target.tagName != "A"){
                                obj = $(ev.target).parents('a');
                            }
                                var elem = obj.attr('data-t'); 
                                var src = this.$el.find('.activated-image').attr('src');
                                if(typeof src !="undefined"){
                                    src = src.replace('w.','.');
                                    this.$el.find('.activated-image').attr('src',src).removeClass('activated-image');
                                }
                            
                            this.$el.find('#'+elem).find('input[type=text]').focus();
                            var src =obj.find('img').attr('src');
                            src = src.replace('.','w.');
                            obj.find('img').attr('src',src).addClass('activated-image');
                        },
			render: function () {
                            this.$el.html(this.template({}));
                             this.iThumbnail = this.$("#drop-files");
                            //this.camp_obj = this.options.camp;
                            this.dropPanel = this.$("#drop-image");
                            jQuery.event.props.push('dataTransfer');
                            this.dragCSVSetting();
                            this.dragImageSetting();
                            var that = this;
                            
                            this.$('#add_options a').click(function (e) {
                                e.preventDefault();
                                $(this).tab('show');
                            });
			} ,
                        addQuickCampaign:function(){
                            var that = this;
                             var el = this.$el;
                             var appMsgs = this.app.messages[0];
                            if(el.find('#quick_txtcampaign').val() == '')  {	
                            that.app.showError({
                                      control:el.find('.campaign-container'),
                                      message:appMsgs.CAMPS_campname_empty_error
                              });
                              return false;
                            } else {						
                            that.app.hideError({control:el.find(".campaign-container")});
                            this.$el.find('.quick-campaign-add').addClass('saving');
                            this.$el.find('#quick_txtcampaign').attr('disabled','disabled');
                            var URL = "/pms/io/campaign/saveCampaignData/?BMS_REQ_TK="+this.app.get('bms_token');
                            var post_data = { type: "create",campName:el.find('#quick_txtcampaign').val() };
                            
                            $.post(URL,post_data )
                            .done(function(data) {   
                                that.$el.find('.quick-campaign-add').removeClass('saving');
                                that.$el.find('#quick_txtcampaign').removeAttr('disabled');
                                var camp_json = jQuery.parseJSON(data);                              
                                if(camp_json[0]!=="err"){                                 
                                   var camp_id = camp_json[1];                                 
                                    that.toggleVisibility();
                                    that.app.mainContainer.openCampaign(camp_id);
                                   
                                }
                                else{
                                     that.app.showError({
                                                    control: $(that.el).find('.campaign-container'),
                                                    message:camp_json[1]
                                                }); 
                                }                              
                            });
                            }
                        },
                        addQuickCSV:function(){
                        } ,
                        addQuickAutobot:function(ev){
                            this.$el.find('.quick-autobot-add').addClass('saving');
                            $(this.el).find('#txtAutobotName').attr('disable','disable');
                             var type = this.$el.find(".slctbot").find('.active').parents('li').data('type');
                             var inputContainer = this.$(".autobot-container"); 
                             //var type = activeLi.parents('li').data('type');
                              if(this.$el.find('#txtautobot').val() == ''){				                            
                                this.app.showError({
                                       control:inputContainer,
                                       message:'Bot name can\'t be empty'
                                });
                                this.$el.find('.quick-autobot-add').removeClass('saving');
                                return false;
                            }
                             this.app.hideError({control:inputContainer});
                             this.saveAutobotData(type,"N",this.$el.find('#txtautobot').val());
                            
                             
                        },
                        saveAutobotData: function(actionType, bType,name) {
                                var post_data = {label: name, actionType: actionType, botType: bType};
                                var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=create";
                                var result = false;
                                var that = this;
                                $.post(URL, post_data)
                                        .done(function(data) {
                                            var _json = jQuery.parseJSON(data);
                                             $(that.el).find('#txtAutobotName').removeAttr('disable');
                                            //that.app.showLoading(false, $("#new_autobot"));
                                            if (_json[0] !== "err") {
                                                that.$el.find('.quick-autobot-add').removeClass('saving');
                                                that.app.mainContainer.addWorkSpace({type:'',title:'Autobots',sub_title:'Listing',url : 'autobots/autobots',workspace_id: 'autobots',tab_icon:'autobotslisting',params: {botId: _json[2]}});
                                                that.toggleVisibility();
                                                
                                            }
                                            else {
                                                that.app.showError({
                                                    control: $(that.el).find('.autobot-container'),
                                                    message: _json[1]
                                                });
                                               $(that.el).find('#txtAutobotName').focus();
                                                that.$el.find('.quick-autobot-add').removeClass('saving');
                                                return;
                                            }
                                            return result;
                                        });


                        },
                        addQuickNurtureTrack:function(){
                            var inputContainer = this.$(".nurturetrack-container");
                           
                            var value = this.$el.find('#quick_txtnurturetrack').val()
                            var that = this;
                            if(value == ''){				                            
                                this.app.showError({
                                       control:inputContainer,
                                       message:'Nuture Track name can\'t be empty'
                                });
                                return false;
                            }else{
                                this.$el.find('.quick-nurturetrack-add').addClass('saving');
                                this.$el.find('#quick_txtnurturetrack').attr('disabled','disabled');
                                this.app.hideError({control:inputContainer});
                                 var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                                var post_data = { type: "create",name:value };                        
                                $.post(URL,post_data )
                                .done(_.bind(function(data) {  
                                   this.$el.find('.quick-nurturetrack-add').removeClass('saving');
                                   this.$el.find('#quick_txtnurturetrack').removeAttr('disabled');
                                    var _json = jQuery.parseJSON(data);                              
                                    if(_json[0]!=="err"){                                                                  
                                       that.app.mainContainer.openNurtureTrack({"id":_json[1],"checksum":_json[2],"parent":that.options.page,editable:true});
                                       that.toggleVisibility();
                                    }else{
                                       that.app.showError({
                                                    control: inputContainer,
                                                    message:_json[1]
                                                }); 
                                    }                              
                                },this));
                            }
                        },
                        toggleVisibility:function(){
                            this.options.page.$el.find('.add_dialogue').hide('fast');
                        },
                        showSelectedfile:function(files){
                            var z = -40;
                            var maxFiles = 1;			
                            var that = this;
                            var app = this.app?this.app:app;
                            var el = this.$el;
                            this.fileName = arguments[1].fileName;
                            var _csv= jQuery.parseJSON(files);
                            this.app.showLoading("&nbsp;",this.$('.drop-files'));
                            if(_csv[0]!=="err"){
                              ///   this.app.showLoading("&nbsp;",this.$('.drop-files'));
                                    
                                this.toggleVisibility();    
                                var rows = _csv;
                                var mapURL = this.url_getMapping+"?BMS_REQ_TK="+app.get('bms_token')+"&type=upload_map_fields";			
                                jQuery.getJSON(mapURL,_.bind(function(tsv, state, xhr){
                                        if(xhr && xhr.responseText){
                                            this.map_feilds = jQuery.parseJSON(xhr.responseText);
                                            this.fileuploaded=true;
                                            var mapPage;
                                            this.app.showLoading(false,this.$('.drop-files'));
                                             // require(["listupload/mapdata"],_.bind(function(mapdataPage){	
                                                   // that.app.showLoading("Getting mapping fields...",that.$el);
                                                      //  mapPage = new mapdataPage({csv:that,app:app,rows:rows});
                                                        that.app.mainContainer.addWorkSpace({type: '', title: 'CSV Upload', sub_title: 'Add Contacts', url: 'listupload/mapdata', workspace_id: 'csv_upload', tab_icon: 'csvupload',params:{csv:that,app:app,rows:rows}, single_row: true});
                                           // },this));
                                         }
                                },this));
                            }else{												
                                that.app.showAlert(_csv[1],el);
                       }
                    },
                    dragCSVSetting:function(){
                        this.$("#drop-files").dragfile({
                           post_url:"/pms/io/subscriber/uploadCSV/?BMS_REQ_TK="+this.app.get('bms_token')+"&stepType=one",
                           callBack : _.bind(this.showSelectedfile,this),
                           app:this.app,
                           module:'csv',
                           progressElement:this.$('.tab-pane')
                        });
                    },
                    uploadCsvFile:function(obj){ 
                        var input_obj = obj.target;
                        var files = input_obj.files; 
                        if(this.iThumbnail.data("dragfile")){
                            this.iThumbnail.data("dragfile").handleFileUpload(files);
                        }
                    },
                    dragImageSetting:function(){
                            this.$('#image_control').on('mouseover',_.bind(function(obj){
                                    this.$("#list_image_upload").css({'background' : '#00A1DD', 'color' : '#ffffff'});
                            },this));
                            this.$('#image_control').on('mouseout',_.bind(function(obj){
                                    this.$("#list_image_upload").css({'background' : '#01AEEE', 'color' : '#ffffff'});
                            },this));
                            var that = this;
                            this.dropPanel = that.$("#drop-image");
                            that.$("#drop-image").dragfile({
                                post_url:'/pms/io/publish/saveImagesData/?BMS_REQ_TK='+that.app.get('bms_token')+'&type=add&allowOverwrite=N&th_width=240&th_height=230',
                                callBack : _.bind(that.processUpload,that),
                                app:that.app,
                                module:'Image',
                                section:"topMenu",
                                from_dialog:false
                            });  
                    },
                    uploadControl:function(obj){
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
                        var encode = _image.images[0].image1[0]['imageId.encode'];
                        var checksum = _image.images[0].image1[0]['imageId.checksum'];
                        var fileName = this.app.encodeHTML(_image.images[0].image1[0].fileName);
                        var originalURL = this.app.decodeHTML(_image.images[0].image1[0].originalURL);
                        var thumb =  this.app.encodeHTML(_image.images[0].image1[0].thumbURL);
                        var byte  =  this.bytesToSize(_image.images[0].image1[0].fileSizeInBytes);
                        var tags = this.app.encodeHTML(_image.images[0].image1[0].tags);
                        var height  =  _image.images[0].image1[0].height;
                        var width  =   _image.images[0].image1[0].width;
                        var onover ='';//'<div class="imgbtns"> <a class="icon preview s-clr2 "><span>Preview</span></a><a class="icon delete s-clr1"><span>Delete</span></a></div>';
                        var resolution = " | "+ width +'x'+ height ;
                        this.$el.find('.imgs_added ul').find('li').removeClass('active');
                        this.$el.find('.imgs_added ul').prepend('<li id="li'+checksum+'" data-tags="'+tags+'" data-encode="'+encode+'" class="active" data-resolution = "'+resolution+'" data-byte="'+byte+'" data-name="'+fileName+'" data-url="'+originalURL+'" data-thumb="'+thumb+'"><a><img data-thumb="'+thumb+'" width="78px" height="75px" data-name="'+fileName+'" data-url="'+originalURL+'" src="'+_image.images[0].image1[0].thumbURL+'"/></a>'+onover+'</li>');
                        //this.$el.find('.img_detail').find("#recent_title").html(this.truncateText(fileName)).attr('data-original-title',fileName).addClass('showtooltip');
                        //this.$el.find('.img_detail').find("#recent_size").html(byte + resolution);
                        //this.$el.find('.img_detail').find("#recent_url").val(originalURL);
                        this.$el.find("#li"+checksum).click();
                        
                        if(this.$el.find('.imgs_added ul.images li').length > 6 && that.$('#box_backward').css('display') == "none"){
                             this.scrollContent();
                        }
                        this.showTags(encode,tags,"li"+checksum);
                          }else{ 
                              if(this.$el.find('.imgs_added ul.images li').length < 1)
                                 this.$el.find('.imgs_added').hide();
                             this.app.showAlert(_image.err1,$("body"),{fixed:true});
                        }
                    },
                    scrollContent:function(){
                      ///  var li = that.$('.scroll-text ul li').length;
                        //if(li == 7) {
                         var that = this;
                         that.$('.scroll-text').css({'width':"532px",'margin-left':'22px'});
                         that.$('.scroll-text').scrollbox({
                                chunk:6,
                                back:that.$('#box_backward'),
                                forward:that.$('#box_forward')
                            });
                            that.$('#box_backward').show();
                            that.$('#box_backward').click(function () {
                              that.$('.scroll-text').trigger('backward');
                            });
                            that.$('#box_forward').show();
                            that.$('#box_forward').click(function () {
                              that.$('.scroll-text').trigger('forward');
                            });    
                       // }
                    },
                    tagUpdated:function(imageId,data){
                          this.$el.find(".tags-contents").find('.cross').remove();
                        this.$el.find(".tags-contents .tagicon").remove();
                        this.$el.find(".tags-contents").removeAttr('style');
                        this.$el.find(".img_detail .tags-contents ul").removeAttr('style');
                        this.$el.find(".img_detail .tags-buttons").removeClass('overflow');
                        this.$el.find(".img_detail .tags-buttons span.showtooltip").remove();
                         this.$el.find(".images").find("#"+imageId).attr('data-tags',data); 
                       
                    },
                      showTags: function(imgId,tags,checksum) {
                        var that = this;
                        var imageId = imgId; 
                        this.$el.find(".img_detail p").tags({app: this.app,
                            url: "/pms/io/publish/saveImagesData/?BMS_REQ_TK=" + this.app.get('bms_token'),
                            tags: tags,
                            showAddButton: (imageId == "0") ? false : true,
                            module: "Image",
                            callBack: _.bind(that.tagUpdated, that,checksum),
                            params: {type: 'tags', imageId: imageId, tags: ''}
                        });
                        
                     
                    this.$el.find(".addtag.add").html('<a class=" pointy add addtag btn-green" data-original-title="Add Tag"><i class="icon plus left"></i> <span>Add Tag</span></a>');
                    this.$el.find(".addtag.add").removeClass('add');
                    this.$el.find(".img_detail .tags-buttons").css('float','none!!important');
                    this.$el.find(".tags-contents").removeAttr('style');
                    this.$el.find(".img_detail .tags-contents ul").removeAttr('style');
                    this.$el.find(".img_detail .tags-buttons").removeClass('overflow');
                    this.$el.find(".img_detail .tags-buttons span.showtooltip").remove();
                    this.$el.find(".tags-contents").find('.cross').remove();
                       
                    

                },
                     remove: function(obj) {
                    var _this = this;
                     var obj = this.$el.find('#'+$(obj.target).data('checksum'));
                    
                    _this.app.showAlertDetail({heading: 'Confirm Deletion',
                        detail: "Are you sure you want to delete this image?",
                        callback: _.bind(function() {
                            this.app.showLoading("", obj,{fixed:'fixed'});
                            var URL = "/pms/io/publish/saveImagesData/?BMS_REQ_TK=" + this.app.get('bms_token');
                            $.post(URL, {type: 'delete', imageId: obj.data('encode')})
                                    .done(function(data) {
                                        _this.app.showLoading(false, obj);
                                        var _json = jQuery.parseJSON(data);
                                        if (_json[0] !== 'err') {
                                            obj.remove(); 
                                             _this.$el.find('.imgs_added ul li:first-child').click();
                                             if(_this.$el.find('.imgs_added ul.images li').length < 1){
                                                 _this.$el.find('.imgs_added').hide();
                                                 //_this.clearImageSummary();
                                             }
                                         }
                                        else {
                                            _this.app.showAlert(_json[1], $("body"), {fixed: true});
                                        }
                                    });
                        }, _this)},
                    $('body'));
                },
                    showImageGallary:function(){
                        this.toggleVisibility();  
                        this.app.mainContainer.addWorkSpace({type:'',title:'Images',sub_title:'Gallery',url:'userimages/userimages',workspace_id: 'userimages',tab_icon:'graphiclisting'});
                    },
                     bytesToSize: function(bytes) { 
                        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                        if (bytes == 0)
                            return '0 Bytes';
                        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
                   },
                    showImageSummary:function(ev){ 
                        var obj = $(ev.target) ;
                        if((ev.target.tagName) == "LI")
                          obj = $(ev.target);
                        else
                          obj = $(ev.target).parents('li');
                        
                        this.$el.find('.img_detail .tags-contents').remove();
                        this.$el.find('.img_detail .tags-buttons').remove();
                        this.$el.find('.imgs_added ul li').removeClass('active');
                        obj.addClass('active');
                        var that = this;
                        var url = obj.attr('data-url');
                        var checksum = obj.attr('id');
                        var name = obj.attr('data-name');
                        var byte = obj.attr('data-byte');
                        var tags = obj.attr('data-tags');
                        var encode = obj.attr('data-encode'); 
                        this.showTags(encode,tags,checksum);
                        this.$el.find('.img_detail').find(".preview").attr('data-checksum', obj.attr('id'));
                        this.$el.find('.img_detail').find(".delete").attr('data-checksum', obj.attr('id'));
                        var resolution = obj.data('resolution');
                        this.$el.find('.img_detail').find('.btns').remove();
                        this.$el.find('.img_detail').find("#recent_title").html(this.truncateText(name)).attr('data-original-title',name).addClass('showtooltip');
                        var btns = '<a data-original-title="Preview" class="icon preview showtooltip btns" data-checksum="'+checksum+'"></a><a data-original-title="Delete" class="btns icon delete showtooltip" data-checksum="'+checksum+'"></a>';
                        this.$el.find('.img_detail').find("#recent_title").after(btns);
                        this.$el.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                        this.$el.find('.img_detail').find("#recent_url").val(url);
                        this.$el.find('.img_detail').find("#recent_size").html(byte + resolution);
                    },
                    clearImageSummary:function(ev){
                        this.$el.find('.img_detail').find("#recent_title").html("").attr('data-original-title',"").addClass('showtooltip');
                        this.$el.find('.img_detail').find("#recent_url").val("");
                        this.$el.find('.img_detail').find("#recent_size").html("");
                        this.$el.find('.img_detail').find(".btns").remove();
                        var obj = $(ev.target) ;
                       
                        this.remove(obj);
                    },
                    previewImage: function(obj) {
                         // var img = "<img src="+obj.parents('li').data('url') + "/>"
                        var that = this;
                        var dialog_width = $(document.documentElement).width() - 60;
                        var dialog_height = $(document.documentElement).height() - 162;
                        var dialog = this.app.showDialog({title: " " + obj.data('name'),
                            css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                            headerEditable: true,
                            headerIcon: '_graphics',
                            bodyCss: {"min-height": dialog_height + "px"}
                        });
                         

                       // dialog.$el.find('.tagscont').append(this.SplitCommaTagsWithoutCross(this.model.get('tags'))).css('margin-left', '48px');
                        dialog.$el.find('.pointy').hide();
                        dialog.$el.find("camp_header .icon").css("margin", "0px");
                        dialog.$el.find('.dialog-title').addClass('images-preview');
                        if(dialog.$el.find('.c-current-status').length > 0){
                            dialog.$el.find('.c-current-status').hide();
                        }
                        var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                        var wrapelement = 'dialogWrap-'+dialogArrayLength; // New Dialog
                          var img = "<img id='img1' src= '"+obj.data('url') + "' class='"+wrapelement+"'>";
                        dialog.getBody().append(img);
                        this.showLoadingWheels(true, dialog.$el.find(".images-preview"));
                        $('#img1').load(function() {
                             that.showLoadingWheels(false, dialog.$el.find(".images-preview"));
                        });

                },
                 showLoadingWheels: function(isShow, ele) {
                    if (isShow)
                        ele.append("<div class='loading-wheel right' style='margin-left:5px;margin-top: 9px;position: inherit!important;'></div>")
                    else {
                        var ele = ele.find(".loading-wheel");
                        ele.remove();
                    }
                },
                truncateText:function(title){
                    var length = 35;
                    if(!title) return title;
                     var y = title.length > length ? title.substring(0, length - 3) + '...' : title
                    return  y;
                }
		});
	});
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


