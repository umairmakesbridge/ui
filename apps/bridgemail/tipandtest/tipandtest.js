define(['text!tipandtest/html/tipandtest.html','autobots/collections/autobots','bms-mergefields'],
        function (template,AutobotsCollection) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Template Preview
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                /**
                 * Attach events on elements in view.
                 */
                tag:'div',
                className:'tip_test',
                events: {
                    'click .landing-pages-tip': 'createLandingPage',
                    'click .meeting-request':'editAutobot',
                    'click .sales-alert':'editAutobot',
                    'click .videobar': function (e) {
                        var _a = $.getObj(e, "div");
                        _a = _a.length > 1 ? $(_a[0]) : _a;
                        _a = _a.find("a");
                        if (_a.length) {
                            var video_id = _a.attr("rel");
                            var dialog_title = "Help Video";
                            var dialog = this.app.showDialog({title: dialog_title,
                                css: {"width": "720px", "margin-left": "-360px"},
                                bodyCss: {"min-height": "410px"}
                            });
                            dialog.getBody().html('<iframe src="//player.vimeo.com/video/' + video_id + '" width="700" height="400" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
                        }
                          e.stopPropagation();
                        e.preventDefault();
                    }
                },
                /**
                 * Initialize view - backbone .
                 */
                initialize: function () {
                    this.app = this.options.app;
                    this.template = _.template(template);
                    this.objAutobots = new AutobotsCollection();
                    this.render();
                },
                /**
                 * Initialize view .
                 */
                render: function () {

                    this.$el.html(this.template());
                    this.fetchBots();
                   this.init();
                },
                init: function () {
                        //this.$el.parents('.ws-content').find('.camp_header').remove();
                        this.app.removeSpinner(this.$el);
                        
                },
                fetchBots: function(offset,botId,isCreateAB) {
                    var _data = {};
                    _data['type'] = "search";
                    this.offset = 0;
                    var that = this;
                    _data['isPreset'] = "Y";
                     
                   
                    if (this.request)
                        {
                         this.request.abort();
                        }
                    var that = this;
                    _data['offset'] = this.offset;
                    

                    this.request = this.objAutobots.fetch({data: _data, success: function(data) {
                            that.total = that.objAutobots.total;
                           
                    //console.log(data.models);
                            _.each(data.models,function(model) {
                                //console.log(model.get('presetLabel') + "  & Type: " + model.get('presetType'));
                                if(model.get('presetType')==="PRE.2"){
                                    that.$('.meeting-request').attr('id','row_'+model.get('botId.encode'));
                                    that.$('.meeting-request').attr('data-id',model.get('botId.encode'));
                                    that.$('.meeting-request').attr('data-type',model.get('presetType'));
                                }
                                if(model.get('presetType')==="PRE.4"){
                                    that.$('.sales-alert').attr('id','row_'+model.get('botId.encode'));
                                    that.$('.sales-alert').attr('data-id',model.get('botId.encode'));
                                    that.$('.sales-alert').attr('data-type',model.get('presetType'));
                                }
                                
                            },this);
                            
                                   
                        }});
                    

                } ,
                editAutobot: function(event,botId) {
                    var botID ='';
                     var botType ='';
                    if(event !== "dialog"){
                       botID= $(event.currentTarget).data('id'); 
                       botType = $(event.currentTarget).data('type');
                    }
                     else{
                         botID= botId;
                         botType = this.$el.find('row_'+botID).data('type');
                     }
                     
                    //console.log('botType :' + botType + ' ID: '+botID);
                    this.chooseBotToEdit('autobots/preset',botID,botType);
                },
                chooseBotToEdit: function(files,botID,botType) {
                    var that = this;
                    var dialog_width = 80;
                    var label = '';
                    var dialog_height = $(document.documentElement).height() - 200;
                    if(botType==="PRE.4"){
                        var label = 'Sales Alert Bot';
                    }else if(botType==="PRE.2"){
                        var label = 'Meeting Bot';
                    }
                    var dialog = this.options.app.showDialog({
                        title: label,
                        css: {"width": dialog_width + "%", "margin-left": "-" + (dialog_width / 2) + "%", "top": "20px"},
                        headerEditable: true,
                        headerIcon: 'bot',
                        buttons: {saveBtn: {text: 'Save'}},
                        bodyCss: {"min-height": dialog_height + "px"}
                    });
                    this.dialog = dialog;
                    that.options.app.showLoading('Loading Autobots....', dialog.getBody());
                    require([files], function(Alert) {
                        var mPage = new Alert({origin:that,refer: that, dialog: dialog, type: "edit", botId: botID, botType: botType, app: that.app, model: ''});
                        dialog.getBody().html(mPage.$el);
                        dialog.parents('body').find('#new_autobot').removeAttr('class');
                        //console.log('Ok start From here for bot : ' + that.model.get('actionType'));
                        var dialogArrayLength = that.app.dialogArray.length; // New Dialog
                        mPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                
                              
                                dialog.saveCallBack(_.bind(mPage.saveFilters, mPage));
                                that.options.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(mPage.saveTagAutobot, mPage); // New Dialog
                            
                                var btn = "<a class='btn btn-blue btn-play right' style='display: inline;'><span>Play</span><i class='icon play'></i></a>";
                                dialog.getFooter().append(btn);
                            //dialog.getFooter().prepend("<span style='display:inline-block; padding-top:5px; padding-right:10px'> <em>When you done with the changes, please don't forget to press save button.</em> </span>")
                                that.options.app.showLoading(false, dialog.getBody());
                                that.options.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                                that.options.app.dialogArray[dialogArrayLength-1].currentView = mPage; // New Dialog
                                return;
                       
                    });
                },
                playAutobot: function(where, id) {
                    var that = this;
                    if (where == "dialog") {
                        var botId = id;
                    } else {
                        var botId = this.model.get('botId.encode');
                    }
                    var tile = this.$el.find("row_" + botId);
                       var bms_token = that.options.app.get('bms_token');
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + bms_token;
                    that.options.app.showLoading("Playing Autobots...", tile);
                    $.post(URL, {type: 'play', botId: botId})
                            .done(function(data) {
                                that.options.app.showLoading(false, tile);
                                var _json = jQuery.parseJSON(data);
                                if (that.options.app.checkError(_json)) {
                                    return false;
                                }

                                if (_json.err) {
                                    that.options.app.showAlert(_json.err1, $("body"), {fixed: true});
                                } else if (_json[0] == "err") {
                                    that.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                } else {
                                    that.options.app.showMessge("Autobot played.");
                                    
                                        // that.parent.fetchBots();
                                     if (where == "dialog") { that.getAutobotById(where, botId);}

                                }
                            });
                },
                getAutobotById: function(where, id) {
                        var botId = id;
                    var that = this;
                    var bms_token = that.options.app.get('bms_token');
                    var url = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK=" + bms_token + "&type=get&botId=" + botId;
                    jQuery.getJSON(url, function(tsv, state, xhr) {
                        var autobot = jQuery.parseJSON(xhr.responseText);
                        if (that.options.app.checkError(autobot)) {
                            return false;
                        }
                        var m = new Backbone.Model(autobot);
                        that.model = m;
                        that.render();
                        that.dialog.hide();
                        that.editAutobot('dialog', botId);
                        
                    });
                },
                 pauseAutobot: function(id) {
                    var that = this;
                        var botId = id;
                    var tile = this.$el.find("row_" + botId);
                    var bms_token = that.options.app.get('bms_token');
                    var URL = "/pms/io/trigger/saveAutobotData/?BMS_REQ_TK=" + bms_token;
                    that.options.app.showLoading("Pause Autobots...", tile);
                    $.post(URL, {type: 'pause', botId: botId})
                            .done(function(data) {
                                that.options.app.showLoading(false, tile);
                                var _json = jQuery.parseJSON(data);
                                if (that.options.app.checkError(_json)) {
                                    return false;
                                }
                                if (_json.err) {
                                    that.options.app.showAlert(_json.err1, $("body"), {fixed: true});
                                } else if (_json[0] == "err") {
                                    that.options.app.showAlert(_json[1], $("body"), {fixed: true});
                                } else {
                                    that.options.app.showMessge("Autobot paused.");
                                    //that.getAutobotById('dialog', botId);
                                    
                                }
                            });
                },
                createLandingPage: function (  ) {
                    this.app.showAddDialog(
                    {
                      app: this.app,
                      heading : 'Start with choosing a name for your Landing Page',
                      buttnText: 'Create',
                      bgClass :'landingpage-tilt',
                      plHolderText : 'Enter landing page name here',
                      emptyError : 'Landing page name can\'t be empty',
                      createURL : '/pms/io/publish/saveLandingPages/',
                      fieldKey : "name",
                      postData : {type:'create',BMS_REQ_TK:this.app.get('bms_token'),category:"Marketing"},
                      saveCallBack :  _.bind(this.createPage,this)
                    });
                },
                createPage: function(txt,json){
                    if(json[0]=="success"){
                        this.app.mainContainer.openLandingPage({"id":json[1],"checksum":json[2],"parent":this,editable:true});   
                        if(this.$el.parents('body').find('#wstabs [workspace_id="landingpages"]')){
                            var lp_view = $("[workspace_id='landingpages']").data("viewObj");
                             lp_view.headBadge();
                            lp_view.getLandingPages();
                        }
                       
                    }
                },
               
            });

        });

