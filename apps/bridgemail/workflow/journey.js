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
                                    remove: 1,
                                    inputs: {},
                                    outputs: {
                                        output_1: {
                                            label: 'Journey',
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
                        multipleLinksOnOutput: true
                    });
                },
                createNode: function (obj) {
                    this.elementCount = this.elementCount + 1;
                    var operatorId = $.trim($(obj.dragEle).data('type')+"_"+this.elementCount);
                    var operatorTitle = $.trim($(obj.dragEle).text());
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
                            inputs: {
                                input_1: {
                                    label: '',
                                }
                            },
                            outputs: outputs
                        }
                    };

                    this.$('.journey-builder').flowchart('createOperator', operatorId, operatorData);
                }


            });
        });
