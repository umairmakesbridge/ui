/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/email.html', 'target/views/recipients_target', 'bms-tags', 'target/models/recipients_target'],
        function(template, recipientView, tags, ModelRecipient) {
            'use strict';
            return Backbone.View.extend({
                className: "botpanel",
                tagName: "div",
                events: {
                    "click .add-targets": "loadTargets",
                    "click .add-tag": "chooseTags",
                    "mouseover .sumry":'showButtons',
                    "mouseout .sumry":"hideButtons",
                     "click .small-edit":"editMessage",
                     "change #ddlIsRecur":"changeSetting",
                     "click #preivew_bot":"previewCampaign",
                    "change #ddlendless":"showRecurInput"
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.app = this.options.app;
                    this.dialog = this.options.dialog;
                    this.filterNumber = null;
                    
                    if (typeof this.options.model != "undefined") {
                        this.status = (typeof this.options.model.get('status') == null)?"D":this.options.model.get('status');
                        this.botId = this.options.model.get('botId.encode');
                        this.filterNumber = this.options.model.get('filterNumber.encode');
                    } else {
                        this.botId = this.options.botId;
                        this.status = "D";
                        
                    }
                    if (typeof this.options.model != "undefined") {
                        this.messageLabel = this.options.model.get("subject");
                        this.triggerOrder =""; 
                        if(!this.messageLabel){
                             this.messageLabel = 'Subject line goes here ...';
                        }
                        this.campNum = this.options.model.get('actionData')[0]['campNum.encode'];
                     }else{
                        this.triggerOrder =""; 
                        this.messageLabel = 'Subject line goes here ...';
                        this.campNum = this.options.model.get('actionData')[0]['campNum.encode'];
                    }
                    if(this.status == "D")
                         this.editable = false;
                     else
                         this.editable = true;
                    this.mainTags = "";
                  
                    this.render();
                },
                render: function() {
                    this.$el.html(this.template());
                    this.$el.find('input[type=checkbox]').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon"></div>'
                    });
                    
                    if (this.options.type == "edit") {
                        this.getTargets();
                        this.loadCampaign();
                         this.$el.find("#ddlIsRecur").val(this.options.model.get('isRecur'));
                        this.$el.find("#ddlRecurType").val(this.options.model.get('recurType'));
                        this.$el.find("#txtRecurPeriod").val(this.options.model.get('recurPeriod'));
                        if(this.options.model.get('recurPeriod') != "0"){
                            this.$el.find("#ddlendless").val("1");
                            this.$el.find(".show-recur-period").css('display','inline-block');
                        }
                        if(this.options.model.get('isRecur') != "N"){
                             this.$el.find("#show_other").show();
                             this.$el.find("#spnhelptext").hide();
                        }else{
                            this.$el.find("#spnhelptext").show();
                             this.$el.find("#show_other").hide();
                        }
                        this.$el.find("#ddlRecurType").val(this.options.model.get('recurType'));
                        this.$el.find("#txtRecurPeriod").val(this.options.model.get('recurPeriod'));
                        this.$el.find("#txtRecurTimes").val(this.options.model.get('recurTimes'));
                        this.options.model.get('isSweepAll') == "Y" ? this.$el.find("#chkIsSweepAll").iCheck('check') : this.$el.find("#chkIsSweepAll").iCheck('uncheck');
                    }
                    this.showTags();
                     if (this.status == "D"){
                        this.dialog.$(".dialog-title").addClass('showtooltip').attr('data-original-title', "Click here to name ").css('cursor', 'pointer');  
                     }
                    this.dialog.$("#dialog-title span").click(_.bind(function(obj) {
                        if (this.status != "D")
                            return false;
                        this.showHideTargetTitle(true);
                    }, this));

                    this.dialog.$(".savebtn").click(_.bind(function(obj) {
                        this.saveTemplateName(obj)
                    }, this));

                    this.dialog.$(".cancelbtn").click(_.bind(function(obj) {
                        if (this.botId) {
                            this.showHideTargetTitle();
                        }
                    }, this));
                    this.$el.find("#ddlIsRecur").chosen({no_results_text: 'Oops, nothing found!', style: "float:none!important", width: "120px", disable_search: "true"});
                    this.$el.find("#txtRecurTimes").chosen({no_results_text: 'Oops, nothing found!', style: "float:none!important", width: "70px", disable_search: "true"});
                    this.$el.find("#ddlRecurType").chosen({no_results_text: 'Oops, nothing found!', width: "100px", disable_search: "true"});
                    this.$el.find("#ddlendless").chosen({no_results_text: 'Oops, nothing found!', width: "140px", disable_search: "true"});
                    this.dialog.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.checkMailMessages();

                }, changeSetting:function(ev){
                  var selected = $(ev.target).val();
                  if(selected == "N"){
                      this.$el.find("#show_other").hide();
                      this.$el.find("#spnhelptext").show();
                  }else{
                      this.$el.find("#show_other").show();
                      this.$el.find("#spnhelptext").hide();
                  }
                },
                showRecurInput:function(ev){
                  var selected = $(ev.target).val();
                  if(selected == "0"){
                      this.$el.find(".show-recur-period").hide();
                  }else{
                      this.$el.find(".show-recur-period").css('display','inline-block');
                  }
                },
                checkMailMessages:function(){
                    var str = "<a class='btn-blue left edit-message' style='margin-right:10px;'><span class='right'>   Edit Message</span><i class='icon edit left'></i></a>";
                    str = str + "<a class='btn-gray left preview-message'><span class='right'>   Preview</span><i class='icon preview24 left'></i></a>";
                    this.$el.find(".sumry .last-row").append("<div class='btns btn-show' style='float: right;position: absolute;right: 1px;bottom:  0px;'>"+str+"</div>");
                    var that = this;
                    this.$el.find(".sumry").find(".preview-message").on('click',function(){
                        that.previewCampaign();
                    });
                    this.$el.find(".sumry").find(".edit-message").on('click',function(){
                        that.editMessage();
                    });
                    
                },
                  previewCampaign: function(e) {
                    var camp_name = this.options.model.get('label');
                    var that = this;
                    var dialog_width = $(document.documentElement).width() - 60;
                    var dialog_height = $(document.documentElement).height() - 182;
                    var dialog = that.options.app.showDialog({title: 'Campaign Preview of &quot;' + camp_name + '&quot;',
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        headerIcon: 'dlgpreview',
                        bodyCss: {"min-height": dialog_height + "px"},
                        //buttons: {saveBtn:{text:'Email Preview',btnicon:'copycamp'} }
                    });
                    //var preview_url = "https://"+that.options.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+that.campNum+"&html=Y&original=N";    
                    var preview_url = "https://" + that.options.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + this.campNum;
                    require(["common/templatePreview"], _.bind(function(templatePreview) {
                        var tmPr = new templatePreview({frameSrc: preview_url, app: that.options.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: this.campNum});
                        dialog.getBody().html(tmPr.$el);
                        tmPr.init();
                    }, this));
//                        var preview_iframe = $("<iframe class=\"email-iframe\" style=\"height:"+dialog_height+"px\" frameborder=\"0\" src=\""+preview_url+"\"></iframe>");                            
//                        dialog.getBody().html(preview_iframe);               
//                        dialog.saveCallBack(_.bind(that.sendTextPreview,that,that.campNum));                        
                    e.stopPropagation();
                },
                
               loadTargets: function() {
                    var dialog_object = {title: 'Select Targets',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        headerIcon: 'targetw'
                    }
                     var dialog = this.options.app.showDialog(dialog_object);

                    this.options.app.showLoading("Loading Targets...", dialog.getBody());
                    
                    require(["target/recipients_targets"], _.bind(function(page) {
                        var targetsPage = new page({page: this, dialog: dialog, editable: true,type:"autobots",showUseButton:true});
                        dialog.getBody().html(targetsPage.$el);
                    }, this));

                },
                getStatus: function() {
                    if (this.status == "D")
                        return ["Paused", "pclr1"];
                    else if (this.status == "R")
                        return ["Playing", "pclr18"];
                    else if (this.status == "P")
                        return ["Pending", "pclr6"];
                },
                showTags: function() {
                    this.modal = $('.modal');
                    var tags = "";
                    if (typeof this.options.model != "undefined")
                        tags = this.options.model.get('tags');
                    this.modal.find('.modal-header').removeClass('ws-notags');
                    this.tagDiv = this.modal.find(".tagscont");
                    var labels = this.getStatus();
                    this.head_action_bar = this.modal.find(".modal-header .edited  h2");
                    this.head_action_bar.find(".pointy").css({'padding-left':'10px','margin-top':'4px'});
                    this.head_action_bar.append("<a style='margin-top: 10px; margin-left: -10px;' class='cstatus " + labels[1] + "'>" + labels[0] + "</a>");
                   if(this.status == "D"){
                        this.head_action_bar.find(".edit").addClass('play24').addClass('change-status').removeClass('edit').addClass('showtooltip').attr('data-original-title',"Click to Play").css('cursor', 'pointer');
                    }else{
                        this.head_action_bar.find(".edit").addClass('pause24').addClass('change-status').removeClass('edit').addClass('showtooltip').attr('data-original-title',"Click to Pause").css('cursor', 'pointer');
                    }   
                    var that = this;
                    if(this.status != "D"){
                        this.head_action_bar.find(".delete").hide(); 
                    }
                    this.head_action_bar.find(".copy").addClass('showtooltip').attr('data-original-title',"Click to Copy").css('cursor', 'pointer');
                    this.head_action_bar.find(".delete").addClass('showtooltip').attr('data-original-title',"Click to Delete").css('cursor', 'pointer');
                    this.head_action_bar.find(".change-status").on('click',function(){
                        var res = false;
                        if(that.status == "D"){
                          res = that.options.refer.playAutobot('dialog',that.botId);
                        }else{
                          res =  that.options.refer.pauseAutobot('dialog',that.botId);
                        }
                    })
                    this.head_action_bar.find(".copy").on('click',function(){
                       that.options.refer.cloneAutobot('dialog',that.botId); 
                    });
                    this.head_action_bar.find(".delete").on('click',function(){
                       if(that.options.refer.deleteAutobot('dialog',that.botId,that.$el)){
                           that.options.dialog.hide();
                       } 
                    });
                    this.tagDiv.addClass("template-tag").show();
                    this.tagDiv.tags({app: this.options.app,
                        url: '/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=' + this.options.app.get('bms_token'),
                        params: {type: 'tags', botId: this.botId, tags: ''}
                        , showAddButton: true,
                        tags: tags,
                        callBack: _.bind(this.newTags, this),
                        typeAheadURL: "/pms/io/user/getData/?BMS_REQ_TK=" + this.options.app.get('bms_token') + "&type=allTemplateTags"
                    });
                    if(this.status !="D"){
                      this.tagDiv.addClass("not-editable");
                     }
                },
                newTags: function(tags) {
                    if(typeof this.options.model !="undefined"){
                      this.options.model.set('tags', tags);
                    }else{
                        this.mainTags = tags;
                    }
                },
                saveEmailAutobot: function(close) {
                    if (this.status != "D") {
                       this.options.refer.pauseAutobot(('dialog',this.botId));
                        return;
                    }
                    var isRecur = this.$el.find("#ddlIsRecur").val();
                    var recurType = this.$el.find("#ddlRecurType").val();
                    if(this.$el.find("#ddlendless").val() == "1"){
                        var recurPeriod = this.$el.find("#txtRecurPeriod").val();
                    }else{
                        var recurPeriod = 0;
                    }
                    var recurTimes = this.$el.find("#txtRecurTimes").val();
                    var isSweepAll = this.$el.find("#chkIsSweepAll").is(':checked') ? "Y" : "N";
                    var post_data = {tags:this.mainTags,botId: this.options.botId, type: "update", isRecur: isRecur, recurType: recurType, recurPeriod: recurPeriod, recurTimes: recurTimes, isSweepAll: isSweepAll};
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.options.app.get('bms_token');
                    var result = false;
                    var that = this;
                    $.post(URL, post_data)
                            .done(function(data) {
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== "err") {
                                    that.app.showMessge(_json[1]);
                                    if (!close) {
                                        that.options.refer.getAutobotById(that.botId);
                                        that.options.dialog.hide();
                                        if(typeof that.options.botType !="undefined"){
                                            if(typeof that.options.refer.options.listing !="undefined")
                                            that.options.refer.options.listing.fetchBots();
                                         }
                                    }
                                }
                                else {
                                    that.app.showAlert(_json[1], $("body"), {fixed: true});


                                }
                                return result;
                            });
                },
                loadTagTargets: function() {
                    var remove_cache = true;
                    var offset = 0;
                    var that = this;
                    var _data = {offset: offset, type: 'list_csv', filterNumber_csv:  this.options.model.get('filterNumber.encode')};
                    this.tracks_bms_request = this.targetsRequest.fetch({data: _data, remove: remove_cache,
                        success: _.bind(function(collection, response) {
                            // Display items
                            if (that.app.checkError(response)) {
                                return false;
                            }

                            for (var s = offset; s < collection.length; s++) {
                                this.targetsModel = collection.at(s);
                            }
                            that.createTargets();
                        }, this),
                        error: function(collection, resp) {

                        }
                    });
                },
                createTargets: function(save) {
                    var that = this;
                     if( this.targetsModel.get('filterNumber.encode')){
                             this.$el.find("#autobot_targets_grid tbody").children().remove();
                             that.$el.find('#autobot_targets_grid tbody').append(new recipientView({type: 'autobots_listing', model:this.targetsModel, app: that.options.app,editable:that.editable}).el);
                             if(that.status != "D"){
                                if(that.$el.find('#autobot_targets_grid tbody tr td .slide-btns .preview-target').length > 0) 
                                 that.$el.find('#autobot_targets_grid tbody tr td .slide-btns').addClass('one').removeClass('three');
                                else
                                    that.$el.find('#autobot_targets_grid tbody tr td .slide-btns').addClass('two').removeClass('three');
                                that.$el.find('#autobot_targets_grid tbody tr td .remove-target').remove(); 
                             }
                             that.$el.find('#autobot_targets_grid tbody tr td .remove-target').on('click', function() {
                                that.targetsModel = null;
                                that.changeTargetText();
                                that.$el.find('#autobot_targets_grid tbody').html('');
                                that.loadTargets();
                            });
                            if (that.status != "D")
                                that.disableAllEvents();
                     }
                    if (save) {
                        this.saveTargets()
                    }
                    this.changeTargetText();
                },
                addToCol2:function(model){
                  this.targetsModel = model;
                  this.createTargets(true);
                  
                },
                saveTargets: function() {
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    var filterNumbers = this.targetsModel.get('filterNumber.encode');
                    var that = this;
                    $.post(URL, {type: 'targets', botId: this.options.botId, filterNumber: filterNumbers})
                            .done(_.bind(function(data) {
                                that.app.showLoading(false, that.$el);
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== 'err') {
                                    that.app.showMessge(_json[1]);
                                }
                                else {
                                    that.app.showAlert(_json[0], $("body"), {fixed: true});
                                }
                            }, this));
                },
                getTargets: function() {
                    var that = this;
                    var bms_token = that.options.app.get('bms_token');
                    this.filterNumber = this.options.model.get('filterNumber.encode');
                    if (this.filterNumber == "") {
                        return;
                    }
                    var URL = "/pms/io/filters/getTargetInfo/?BMS_REQ_TK=" + bms_token + "&filterNumber=" + this.filterNumber + "&type=get";
                    jQuery.getJSON(URL, function(tsv, state, xhr) {
                        var data = jQuery.parseJSON(xhr.responseText);
                        if (that.app.checkError(data)) {
                            return false;
                        }
                        var objRecipients = new ModelRecipient(data);
                        that.targetsModel =objRecipients;
                        that.targets = data;
                        that.changeTargetText();
                        that.createTargets();

                    });
                },
                chooseTags: function() {

                    var dialog_object = {title: 'Select Targets',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        headerIcon: 'targetw'
                    }
                    dialog_object["buttons"] = {saveBtn: {text: 'Done'}};
                    var dialog1 = this.options.app.showDialog(dialog_object);
                    var that = this;
                    that.tags = that.tags.toString().split(',');
                    this.options.app.showLoading("Loading Tags...", dialog1.getBody());
                    require(["tags/tags"], _.bind(function(page) {
                        var Tags = new page({tags: that.tags, app: that.options.app, camp: that, dialog: dialog1, editable: true, type: "autobots"});
                        dialog1.getBody().html(Tags.$el);
                        // Tags.init();                         
                        dialog1.saveCallBack(_.bind(Tags.saveTags, Tags));
                        //  targetsPage.createRecipients(this.targetsModelArray);
                    }, this));



                } ,
                 changeTargetText: function() {
                    if (this.targetsModel) {
                       $(this.el).find("#hrfchangetarget").show();
                        $(this.el).find(".no-target-defined").hide();
                    } else {
                        $(this.el).find(".no-target-defined").show();
                        $(this.el).find("#hrfchangetarget").hide("");
                    }
                    if(this.status !="D")
                        $(this.el).find("#hrfchangetarget").hide();
                },
                 recurTimes: function() {
                    var options = "";
                    for (var i = 1; i < 31; i++) {
                        options = options + "<option value='" + i + "'>" + i + "</option>";
                    }
                    var recurTimes
                    if(typeof this.options.model !="undefined"){
                        var recurTimes = this.options.model.get('recurTimes');
                    }
                    if(i == recurTimes )
                        options = options + "<option value='0' selected='selected'> Unlimited </option>";
                    else
                        options = options + "<option value='0'> Unlimited </option>";
                    
                    return options;
                },
                saveTemplateName: function(obj) {
                    var _this = this;
                    var name = $(obj.target).parents(".edited").find("input");
                    var dailog_head = this.dialog;
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + this.app.get('bms_token');
                    $(obj.target).addClass("saving");
                    $.post(URL, {type: "rename", label: name.val(), botId: this.botId})
                            .done(function(data) {
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== "err") {
                                    dailog_head.$("#dialog-title span").html(_this.app.encodeHTML(name.val()));
                                    _this.showHideTargetTitle();
                                    _this.app.showMessge("Autobot Renamed");
                                    //_this.page.$("#template_search_menu li:first-child").removeClass("active").click();
                                    _this.options.model.set("name", name.val());
                                }
                                else {
                                    _this.app.showAlert(_json[1], _this.$el);

                                }
                                $(obj.target).removeClass("saving");
                            });
                },
                showHideTargetTitle: function(show, isNew) {
                    if (show) {
                        this.dialog.$("#dialog-title").hide();
                        this.dialog.$("#dialog-title-input").show();
                        this.dialog.$(".template-tag").hide();
                        this.dialog.$("#dialog-title-input input").val(this.app.decodeHTML(this.dialog.$("#dialog-title span").html())).focus();
                    }
                    else {
                        this.dialog.$("#dialog-title").show();
                        this.dialog.$("#dialog-title-input").hide();
                        this.dialog.$(".tagscont").show();
                    }
                },
                disableAllEvents: function() {

                    this.$el.find("#hrfchangetarget").on('click', function() {
                        return false;
                    });
                    this.$el.find(".add-tag").on('click', function() {
                        return false;
                    });
                    this.$el.find(".add-targets").on('click', function() {
                        return false;
                    });
                    this.$el.find('.edit-message span').html('View Message');
                    //that.$el.find('#autobot_targets_grid tbody tr td .remove-target');('click',function(){return false;});
                    this.modal = $('.modal');
                    this.modal.find('.modal-header').find("#dialog-title span").on('click', function() {
                        return false;
                    });
                    this.modal.find('.modal-header').find(".addtag").on('click', function() {
                        return false;
                    });
                    var btnSave = this.modal.find('.modal-footer').find('.btn-save');
                    //btnSave.removeClass('btn-save');
                    btnSave.find('.save').addClass('pause').removeClass('save');
                    btnSave.find('span').html("Pause");
                },
                pauseAutobot: function(close) {
                    var that = this;
                    var bms_token = that.options.app.get('bms_token');
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + bms_token;
                    that.options.app.showLoading("Pause Autobots...", that.$el);
                    $.post(URL, {type: 'pause', botId: that.botId})
                            .done(function(data) {
                                that.options.app.showLoading(false, that.$el);
                                var _json = jQuery.parseJSON(data);
                                 if (_json[0] !== 'err') {
                                    if (typeof _json[1] != "undefined" && _json[1].indexOf("err") >= 0) {
                                        that.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                    } else {
                                        if (!close) {
                                            that.options.refer.getAutobotById(that.botId);
                                            that.options.dialog.hide();
                                        }
                                    }

                                }
                                else {
                                    that.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                }
                            });
                },
                editMessage:function(e){
                    //if(!this.object[0]['campNum.encode']){
                     //   this.app.showAlert('Message doesn\'t not exists',$("body"),{fixed:true});                    
                    //}
                    //else{\
                    var that = this;
                      if(that.editable == false)
                         that.editable = true;
                     else
                         that.editable = false;
                    var dialog_width = $(document.documentElement).width()-50;
                    var dialog_height = $(document.documentElement).height()-162;
                    var dialog_object = {title:this.messageLabel +'<strong class="cstatus pclr18" style="float:right; margin-left:5px"> Message <b>'+this.triggerOrder+'</b> </strong>',
                            css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                            headerEditable:false,                          
                            bodyCss:{"min-height":dialog_height+"px"}                        
                            };
                     
                        dialog_object["buttons"]=  {saveBtn:{text:'Save'} }
                   
                    var dialog = this.app.showDialog(dialog_object);                        
                    this.app.showLoading("Loading Settings...",dialog.getBody());
                    var that = this;
                    require(["nurturetrack/message_setting"],_.bind(function(settingPage){
                        var sPage = new settingPage({page:this,dialog:dialog,editable:that.editable,type:"autobots",campNum:this.campNum});    
                        dialog.getBody().html(sPage.$el);
                        dialog.saveCallBack(_.bind(sPage.saveCall,sPage));
                        sPage.init();
                    },this));      
                   // }
                    
            },loadCampaign:function(){               
              var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK="+this.app.get('bms_token')+"&campNum="+this.campNum+"&type=basic";
              jQuery.getJSON(URL,  _.bind(function(tsv, state, xhr){
                  var camp_json = jQuery.parseJSON(xhr.responseText);
                  this.camp_json = camp_json;
                  this.$(".camp-subject").html(this.app.encodeHTML(camp_json.subject));
                  if(camp_json.subject){
                    this.$(".title").html(this.app.encodeHTML(camp_json.subject));
                    this.messageLabel = this.app.encodeHTML(camp_json.subject);
                  }
                  else{
                      this.messageLabel = 'Subject line goes here ...';
                      this.$(".title").html('Subject line goes here ...');
                      this.$(".camp-subject").html('Subject line goes here ...');
                  }
                  this.$(".camp-fromemail").html(this.app.encodeHTML(camp_json.fromEmail));
                  var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");                             
                  if( merge_field_patt.test(this.app.decodeHTML(camp_json.fromEmail)) && camp_json.defaultFromEmail){                    
                    this.$(".camp-fromemail").append($('<em >Default Value: <i >'+this.app.encodeHTML(camp_json.defaultFromEmail)+'</i></em>'));
                  }
                  if(camp_json.senderName){
                       this.$(".camp-fromname").html(this.app.encodeHTML(camp_json.senderName));                      
                  }
                  else{
                       this.$(".camp-fromname").html('MakesBridge Technology');
                  }                                    
                  if(camp_json.defaultSenderName){
                    this.$(".camp-fromname").append($('<em >Default Value: <i >'+this.app.encodeHTML(camp_json.defaultSenderName)+'</i></em>'));
                  }
                  
                  this.$(".camp-replyto").html(this.app.encodeHTML(camp_json.replyTo));
                  if(camp_json.defaultReplyTo){                    
                    this.$(".camp-replyto").append($('<em >Default Value: <i >'+this.app.encodeHTML(camp_json.defaultReplyTo)+'</i></em>'))
                  }
                  
              },this));
            },
            showButtons:function(){
                this.$el.find(".btn-show").show();
            },
            hideButtons:function(){
                this.$el.find(".btn-show").hide();
            }

            });
        });


