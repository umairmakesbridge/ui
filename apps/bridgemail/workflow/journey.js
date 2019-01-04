define(['text!workflow/html/journey.html', 'jquery.flowchart'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className: 'MEE_EDITOR',
                events: {
                   
                },
                initialize: function () {
                    this.app = this.options.app;
                    this.template = _.template(template);
                    this.camp_json = null;
                    this.render();
                    this.elementCount = 0;
                    this.elementMap = {"target":{"text":"Click to configure"},"campaign":{"text":"Click to configure"}
                                       ,"wait":{"text":"3 Days"} ,"exit":{"text":""}, "score":{text:"Click to configure"}};
                },
                render: function ()
                {
                    this.$el.html(this.template({}));

                },
                init: function () {
                    this.app.removeSpinner(this.$el);
                    this.initDragDrop();
                    this.createJourney();
                    this.elementCount = this.$(".flowchart-operator").length;
                },
                initDragDrop: function () {
                    this.$(".ui-draggable").draggable({
                        opacity: 0.8,
                        cursor: "move",
                        scroll: true,
                        appendTo: this.$el,
                        helper: function (event) {
                            var ele_id = $(event.currentTarget).text();
                            return $("<div class='moveable-ele'>" + ele_id + "</div>");
                        },
                        start: function (event) {

                        },
                        stop: function (event) {

                        }
                    });

                    this.$(".journey-grid").droppable({
                        activeClass: "state-default",
                        hoverClass: "state-hover",
                        drop: _.bind(function (event, ui) {
                            var currentId = $(ui.draggable).attr("id");
                            //ui.draggable.removeHighlight();                 
                            if (ui.draggable.data("trigger") && ui.draggable.data("trigger") == "manual") {
                                var gridPostion = this.$(".journey-grid").offset();       
                                var _left = ui.offset.left - gridPostion.left;
                                var _top = ui.offset.top - gridPostion.top;
                                this.createNode({dragEle:ui.draggable, pos:{left:_left,top:_top}});
                            }
                            return false;
                        }, this)
                    });
                },
                createJourney: function () {
                    var data = {
                        operators: {
                            operator1: {
                                top: 20,
                                left: 20,
                                properties: {
                                    title: 'Start',
                                    linkText: 'Start Journey',
                                    remove: 1,
                                    inputs: {},
                                    outputs: {
                                        output_1: {
                                            label: '',
                                        }
                                    }
                                }
                            }
                        }
                    };
                    this.$('.journey-builder').flowchart({
                        data: data,
                        defaultLinkColor: "#82bc42",
                        linkWidth: 4,
                        multipleLinksOnOutput: true,                        
                        linkClicked:_.bind(this.bindClickFunctions,this),
                    });
                },
                createNode: function (obj) {
                    this.elementCount = this.elementCount + 1;
                    var oType = $.trim($(obj.dragEle).data('type'));
                    var operatorId = oType+"_"+this.elementCount;
                    var operatorTitle = $.trim($(obj.dragEle).text());
                    var operatorClass = oType+"_cls";
                    var outputs = {
                                    output_1: {
                                        label: '',
                                    }
                                  };
                    if($(obj.dragEle).data('type')=="condition"){
                        outputs = {
                                    output_1: {
                                        label: 'Yes',
                                    },
                                    output_2: {
                                        label: 'No',
                                    }
                                  };
                    }
                    var operatorData = {
                        top: obj.pos.top,
                        left: obj.pos.left,
                        properties: {
                            title: operatorTitle, 
                            linkText: this.elementMap[oType].text,
                            type:oType,
                            inputs: {
                                input_1: {
                                    label: '',
                                }
                            },
                            outputs: outputs                            
                        },
                        clsName : operatorClass
                    };

                    this.$('.journey-builder').flowchart('createOperator', operatorId, operatorData);                    
                },
                bindClickFunctions: function(e){
                    var parentNode = $(e.target).parents(".flowchart-operator");
                    this.clickedNode = $(e.target);
                    if(parentNode.hasClass("campaign_cls")){
                        this.editMessage();
                    }
                    else if(parentNode.hasClass("target_cls")){
                        this.editTarget();
                    }
                    else if(parentNode.hasClass("wait_cls")){
                        this.editDelay();
                    }
                },
                editMessage:function(){                    
                    var isEdit =  true;   
                    var params = {};
                    var dialog_width = $(document.documentElement).width() - 50;
                    var dialog_height = $(document.documentElement).height() - 162;
                    
                    if(params.campNum){
                        this.campNum = params.campNum;
                    }
                    else{
                        this.camp_json = null;
                    }
                    var dialog_object = {title: "Create Message For Your Jounrey ",
                        css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                        headerEditable: false,
                        bodyCss: {"min-height": dialog_height + "px"}
                    };

                    if(isEdit){
                        dialog_object["buttons"]=  {saveBtn:{text:'Save Message',btncolor:'btn-green'} }
                    }

                    var dialog = this.app.showDialog(dialog_object);
                    this.app.showLoading("Loading Message...", dialog.getBody());                    
                    require(["nurturetrack/message_setting"], _.bind(function(settingPage) {
                        var sPage = new settingPage({page: this, dialog: dialog, editable: isEdit, type: "journey", campNum: params.campNum, workflowObj:params});
                        this.sPage = sPage;
                        dialog.getBody().append(sPage.$el);
                        this.app.showLoading(false, sPage.$el.parent());
                        dialog.saveCallBack(_.bind(sPage.saveCall, sPage));     
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        sPage.$el.addClass('dialogWrap-'+dialogArrayLength); // New Dialog
                        this.app.dialogArray[dialogArrayLength-1].reattach = true;// New Dialog
                        this.app.dialogArray[dialogArrayLength-1].currentView = sPage; // New dialog
                        this.app.dialogArray[dialogArrayLength-1].saveCall=_.bind(sPage.saveCall,sPage); // New Dialog
                        sPage.init();                        
                    }, this));
                },
                editTarget:function(){
                     var dialog_object = {title: 'Select Target',
                        css: {"width": "1200px", "margin-left": "-600px"},
                        bodyCss: {"min-height": "423px"},
                        headerIcon: 'targetw'
                    }
                    var dialog = this.options.app.showDialog(dialog_object);

                    this.options.app.showLoading("Loading Targets...", dialog.getBody());

                    require(["target/recipients_targets"], _.bind(function(page) {
                        var targetsPage = new page({page: this, dialog: dialog, editable: true, type: "journey", showUseButton: true});
                        dialog.getBody().append(targetsPage.$el);
                        this.app.showLoading(false, targetsPage.$el.parent());
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        targetsPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                        dialog.$('.modal-header .cstatus').remove();
                        dialog.$('.modal-footer').find('.btn-play').hide();

                    }, this));
                },
                addTargetToJourney: function(model) {
                    this.clickedNode.html(model.get("name"));
                },
                addMessageToJourney: function(message) {
                    this.clickedNode.html(message);                 
                },
                addDelayToJourney: function(message) {
                    this.clickedNode.html(message);                 
                },
                editDelay:function(){
                    var dialog_object = {title: 'Add Delay',
                        css: {"width": "400px", "margin-left": "-200px"},
                        bodyCss: {"min-height": "130px"},
                        headerIcon: 'jdelay',
                        buttons:{saveBtn:{text:'Add',btncolor:'btn-green'} }
                    }
                    var dialog = this.options.app.showDialog(dialog_object);

                    this.options.app.showLoading("Loading Delay...", dialog.getBody());

                    require(["workflow/delay_journey"], _.bind(function(page) {
                        var sPage = new page({page: this, dialog: dialog, editable: true, type: "journey"});
                        dialog.getBody().append(sPage.$el);
                        this.app.showLoading(false, sPage.$el.parent());
                        dialog.saveCallBack(_.bind(sPage.saveCall, sPage));  
                        var dialogArrayLength = this.app.dialogArray.length; // New Dialog
                        sPage.$el.addClass('dialogWrap-' + dialogArrayLength); // New Dialog                        
                    }, this));
                }


            });
        });