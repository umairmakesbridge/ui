/* 
 * Name:  Notification Views
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Notification View
 * Dependency: Notifications
 */
define(['text!autobots/html/export.html', 'target/views/recipients_target', 'target/models/recipients_target'],
        function(template, recipientView, ModelRecipient) {
            'use strict';
            return Backbone.View.extend({
                className: "botpanel",
                tagName: "div",
                events: {
                    "click .add-targets": "loadTargets"
                    
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.model = null;
                    this.dialog = this.options.dialog;
                    this.getAutobotById();
                },
                getAutobotById: function() {
                    var that = this;
                    var name = this.dialog.$("#dialog-title span").html();
                    that.options.app.showLoading("Loading "+name+"...", that.$el);
                    var bms_token = that.options.app.get('bms_token');
                    var url = "/pms/io/trigger/getZapierExportBotData/?BMS_REQ_TK=" + bms_token + "&type=get&botId=" + this.options.botId;
                    jQuery.getJSON(url, function(tsv, state, xhr) {
                        var autobot = jQuery.parseJSON(xhr.responseText);
                        if (that.options.app.checkError(autobot)) {
                            return false;
                        }
                        var m = new Backbone.Model(autobot);
                        that.model = m;
                        that.template = _.template(template);
                        that.app = that.options.app;
                        that.dialog = that.options.dialog;

                        that.targetsModel = null;
                        that.filterNumber = null;                        
                        that.status = that.model.get('status');
                        that.botId = that.model.get('botId.encode');
                        that.filterNumber = that.model.get('filterNumber.encode');
                        if (that.status == "D"){
                            that.editable = false;
                            $('.modal').find('.modal-footer').find('.btn-save').addClass('btn-green').removeClass('btn-blue');
                        }else{
                            that.editable = true;
                        }
                        that.mainTags = "";
                        that.render();
                        
                        that.options.app.showLoading(false, that.$el);
                        //console.log(that.model);

                    });
                },
                render: function() {
                    this.$el.html(this.template());
                    this.$el.find('input[type=checkbox]').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon"></div>'
                    });
                    var that = this;
                    if (this.options.type == "edit") {
                        this.getTargets();                        
                    }
                    
                    if (that.status == "D") {
                        this.dialog.$(".dialog-title").addClass('showtooltip').attr('data-original-title', "Click here to name ").css('cursor', 'pointer');
                    }


                    this.dialog.$("#dialog-title span").click(_.bind(function(obj) {
                        if (that.status != "D") {
                            return false;
                        }
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
                    
                    this.showTags();
                    this.dialog.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$el.find("#txtRecurTimes").ForceNumericOnly();
                    if (this.status != "D") {
                        this.disableAllEvents();
                    }
                   

                },
                loadTargets: function() {
                    var dialog_object = {title: 'Select Targets',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        headerIcon: 'targetw'
                    }
                    var dialog = this.options.app.showDialog(dialog_object);

                    this.options.app.showLoading("Loading Targets...", dialog.getBody());
                    var that = this;
                    require(["target/recipients_targets"], _.bind(function(page) {
                        var targetsPage = new page({page: this, dialog: dialog, editable: that.editable, type: "autobots", showUseButton: true});
                        dialog.getBody().append(targetsPage.$el);
                        this.app.showLoading(false, targetsPage.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        targetsPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        dialog.$el.find('.modal-header .cstatus').remove();
                        dialog.$el.find('.modal-footer').find('.btn-play').hide();

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
                saveExportAutobot: function(close,isPlayClicked) {
                     var btnSave = this.modal.find('.modal-footer').find('.btn-save');
                     var btnPlay = this.modal.find('.modal-footer').find('.btn-play');
                     //wait added
                     
                     if(!isPlayClicked)
                        btnSave.addClass('saving');
                   
                    if (this.status != "D") {
                        this.options.refer.pauseAutobot(('dialog', this.botId));
                        btnSave.removeClass('saving');
                        btnPlay.removeClass('saving-blue');
                        return;
                    }
                    var that = this;                 
                    
                  
                    var post_data = {tags: this.mainTags, botId: this.options.botId, type: "update",actionType:"Z"};
                    
                    
                    var URL = "/pms/io/trigger/saveZapierExportBotData/?BMS_REQ_TK=" + this.options.app.get('bms_token');
                    var result = false;
                    var that = this;
                    $.post(URL, post_data)
                            .done(function(data) {
                                var _json = jQuery.parseJSON(data);
                                if (_json[0] !== "err") {
                                    if(isPlayClicked){
                                         that.options.refer.playAutobot('dialog', that.botId);
                                     }else{
                                          that.app.showMessge(_json[1]);
                                     }
                                }
                                else {
                                    that.app.showAlert(_json[1], $("body"), {fixed: true});


                                }
                                btnPlay.removeClass('saving-blue');
                                btnSave.removeClass('saving');
                                return result;
                            });
                },
                showTags: function() {
                    this.modal = $('.modal');
                    var tags = "";
                    if (typeof this.model != "undefined")
                        tags = this.model.get('tags');
                    this.modal.find('.modal-header').removeClass('ws-notags');
                    this.tagDiv = this.modal.find(".tagscont");
                    var labels = this.getStatus();
                    this.head_action_bar = this.modal.find(".modal-header .edited  h2");
                    this.head_action_bar.append("<a style='margin-top: 10px; margin-left: -10px;' class='cstatus " + labels[1] + "'>" + labels[0] + "</a>");
                    this.head_action_bar.find(".pointy").css({'padding-left': '10px', 'margin-top': '4px'});
                    if (this.status == "D") {
                        this.head_action_bar.find(".edit").addClass('play24').addClass('change-status').removeClass('edit').addClass('showtooltip').attr('data-original-title', "Click to Play").css('cursor', 'pointer');
                    } else {
                        this.head_action_bar.find(".edit").addClass('pause24').addClass('change-status').removeClass('edit').addClass('showtooltip').attr('data-original-title', "Click to Pause").css('cursor', 'pointer');
                    }
                    var that = this;
                    if (this.status != "D") {
                        this.head_action_bar.find(".delete").hide();
                    }
                    this.head_action_bar.find(".copy").addClass('showtooltip').attr('data-original-title', "Click to Copy").css('cursor', 'pointer');
                    this.head_action_bar.find(".delete").addClass('showtooltip').attr('data-original-title', "Click to Delete").css('cursor', 'pointer');
                      
                    this.head_action_bar.find(".change-status").on('click', function() {
                        var res = false;
                        if (that.status == "D") {
                            that.saveExportAutobot(false,true); 
                        } else {
                            res = that.options.refer.pauseAutobot('dialog', that.botId);
                        }
                    })
                     this.modal = $(".modal");
                     this.modal.find('.modal-footer').find(".btn-play").on('click', function() {
                         var btnPlay = $(".modal").find('.modal-footer').find('.btn-play');
                         btnPlay.addClass('saving-blue');
                         that.saveExportAutobot(false,true); 
                         //btnPlay.removeClass('saving-blue');
                     })
                     this.modal.find('.modal-footer').find(".btn-save").on('click', function() {
                         if(that.status !="D"){
                         var btnPlay = $(".modal").find('.modal-footer').find('.btn-save');
                         btnPlay.addClass('saving-grey');
                         }
                         //btnPlay.removeClass('saving-blue');
                     })
                    this.head_action_bar.find(".copy").on('click', function() {
                        that.options.refer.cloneAutobot('dialog', that.botId);
                    });
                    this.head_action_bar.find(".delete").on('click', function() {
                        if (that.options.refer.deleteAutobot('dialog', that.botId, that.$el)) {
                            that.options.dialog.hide();
                        }
                    });
                    this.tagDiv.addClass("template-tag").show();
                    this.tagDiv.tags({app: this.options.app,
                        url: '/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=' + this.options.app.get('bms_token'),
                        params: {type: 'tags', botId: this.botId, tags: ''}
                        , showAddButton: true,
                        tags: tags,
                        fromDialog:this.dialog.$el,
                        callBack: _.bind(this.newTags, this),
                        typeAheadURL: "/pms/io/user/getData/?BMS_REQ_TK=" + this.options.app.get('bms_token') + "&type=allTemplateTags"
                    });
                    if(this.status !="D"){
                      this.tagDiv.addClass("not-editable");
                     }
                },
                loadTagTargets: function() {
                    var remove_cache = true;
                    var offset = 0;
                    var that = this;
                    var _data = {offset: offset, type: 'list_csv', filterNumber_csv: this.model.get('filterNumber.encode')};
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
                    if (this.targetsModel.get('filterNumber.encode')) {
                        this.$el.find("#autobot_targets_grid tbody").children().remove();
                        that.$el.find('#autobot_targets_grid tbody').append(new recipientView({page:this,type: 'autobots_listing', bkflag:true,model: this.targetsModel, app: that.options.app, editable: that.editable}).el);
                        if (that.status != "D") {
                            if (that.$el.find('#autobot_targets_grid tbody tr td .slide-btns .preview-target').length > 0)
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

                    }
                    if (save) {
                        this.saveTargets()
                    }
                    this.changeTargetText();
                },
                addToCol2: function(model) {
                    this.targetsModel = model;
                    this.createTargets(true);

                },
                saveTargets: function() {
                    var URL = "/pms/io/trigger/saveZapierExportBotData/?BMS_REQ_TK=" + this.app.get('bms_token');
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
                    this.filterNumber = this.model.get('filterNumber.encode');
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
                        that.targetsModel = objRecipients;
                        that.targets = data;
                        that.changeTargetText();
                        that.createTargets();

                    });
                },
                 showLoadingWheel: function(isShow, ele) {
                    if (isShow)
                        ele.append("<div class='loading-wheel' style='margin-left:5px;margin-top: 9px;position: inherit!important;'></div>")
                    else {
                        var ele = ele.find(".loading-wheel");
                        ele.remove();
                    }
                },
                changeTargetText: function() {
                    if (this.targetsModel) {
                        $(this.el).find("#hrfchangetarget").show();
                        $(this.el).find(".no-target-defined").hide();
                    } else {
                        $(this.el).find(".no-target-defined").show();
                        $(this.el).find("#hrfchangetarget").hide("");
                    }
                    if (this.status != "D")
                        $(this.el).find("#hrfchangetarget").hide();
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
                    
                    this.$el.find(".add-targets").on('click', function() {
                        return false;
                    });
                    //that.$el.find('#autobot_targets_grid tbody tr td .remove-target');('click',function(){return false;});
                    this.$el.find(".addtag").hide();
                    this.modal = $('.modal');
                    this.modal.find('.modal-header').find("#dialog-title span").on('click', function() {
                        return false;
                    });
                    this.modal.find('.modal-header').find(".addtag").on('click', function() {
                        return false;
                    });
                    var btnSave = this.modal.find('.modal-footer').find('.btn-save');
                     this.modal.find('.modal-footer').find('.btn-play').remove();
                    //btnSave.removeClass('btn-save');
                    btnSave.find('.save').addClass('pause').removeClass('save');
                    btnSave.addClass('btn-gray').removeClass('btn-blue');
                    var that = this;
                    btnSave.on('click', function() {
                        that.options.refer.getAutobotById('dialog', that.botId);
                        //that.options.refer.pauseAutobot('dialog',that.botId);
                    });
                    btnSave.find('span').html("Pause");
                },
                ReattachEvents: function(){
                   this.$el.parents('.modal').find('.modal-footer').find('.btn-save').addClass('btn-green').removeClass('btn-blue');
                   this.$el.parents('.modal').find('.modal-footer').find('.btn-play').show();
                   this.$el.parents('.modal').find('.modal-header .preview,.cstatus').remove();
                   this.dialog.$("#dialog-title span").attr('data-original-title','Click here to name');
                   var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                   this.$el.parents('.modal').find('.modal-footer').append(btn);
                   this.dialog.$("#dialog-title span").click(_.bind(function(obj) {
                        if (this.status != "D")
                            return false;
                        this.showHideTargetTitle(true);
                    }, this));                   
                    this.showTags();
                    if (this.status != "D"){
                            this.disableAllEvents();
                            this.$el.parents('.modal').find('.modal-footer').find('.btn-save').removeClass('btn-green')
                        }
               },
                showPercentage: function(ev) {
                    this.modal = $('.modal');
                    this.head_action_bar = this.modal.find(".modal-header .edited");
                    this.head_action_bar.find(".pstats").remove();
                    var str = "<div class='pstats' style='display:block;'>";
                    str = str + "<ul>";
                    if (this.model.get('sentCount') == "0") {
                        str = str + "<li class='sent'><strong>" + this.options.app.addCommas(this.model.get('sentCount')) + "</strong><span>Sent</span></li>";
                    } else {
                        str = str + "<li class='sent  '><a class='showtooltip show-sent' data-original-title='Click to view contacts'><strong >" + this.options.app.addCommas(this.model.get('sentCount')) + "</strong><span >Sent</span></a></li>";
                    }
                    if (this.model.get('pendingCount') == "0") {
                        str = str + "<li  class='pending'><strong>" + this.options.app.addCommas(this.model.get('pendingCount')) + "</strong><span>Pending</span></li>";
                    } else {
                        str = str + "<li class='pending'><a class='showtooltip  show-pending'  data-original-title='Click to view contacts'><strong  >" + this.options.app.addCommas(this.model.get('pendingCount')) + "</strong><span>Pending</span></a></li>";
                    }
                    str = str + "</ul>";
                    str = str + "</div>";
                    str = $(str);
                    var that = this;
                    $(ev.target).parents(".percent_stats").append(str);
                    this.head_action_bar.find(".pstats ul a.show-pending").on('click', function(e) {
                        that.showPendingPopulation();
                    });
                    this.head_action_bar.find(".pstats ul a.show-sent").on('click', function(e) {
                        that.showSentPopulation();
                    });
                },
                newTags: function(tags) {
                    if (typeof this.model != "undefined") {
                        this.model.set('tags', tags);
                    } else {
                        this.mainTags = tags;
                    }
                    this.options.refer.getAutobotById(this.botId);
                }

            });
        });


