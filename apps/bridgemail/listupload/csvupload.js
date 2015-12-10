define(['app', 'text!listupload/html/csvupload.html', 'fileuploader', 'bms-dragfile'],
        function (app, template, fileuploader, dragfile, chosen, addbox) {
            'use strict';
            return Backbone.View.extend({
                id: 'csvupload',
                tags: 'div',
                url_getMapping: "/pms/output/workflow/getMetaData.jsp",
                url: "/pms/input/subscriber/uploadSubscribers.jsp",
                dataArray: [],
                map_feilds: [],
                fileuploaded: false,
                fileName: "",
                formdata: !!window.FormData,
                events: {
                    'change #file_control': 'uploadCsvFile'
                },
                removeFile: function () {
                    this.$("#dropped-files").children().remove();
                    this.$("#drop-files .middle").css("display", "block");
                    this.dataArray = [];
                    this.$("#drop-files").css({'box-shadow': 'none', 'border': '1px dashed #CCCCCC'});
                    this.camp_obj.states.step3.mapdataview.$el.hide();
                    $('.loading').hide();
                    this.fileuploaded = false;
                    this.camp_obj.$el.find('#upload_csv').removeClass('selected');
                },
                showSelectedfile: function (files) {
                    var z = -40;
                    var maxFiles = 1;
                    var campview = this.camp_obj;
                    var curview = this;
                    var app = this.app ? this.app : app;
                    var el = this.$el;
                    this.fileName = arguments[1].fileName;
                    if (campview) {
                        campview.states.step3.change = true;
                    }
                    var _csv = jQuery.parseJSON(files);
                    if (_csv[0] !== "err") {
                        app.showLoading("Getting mapping fields...", el);

                        var rows = _csv;
                        var mapURL = this.url_getMapping + "?BMS_REQ_TK=" + app.get('bms_token') + "&type=upload_map_fields";
                        jQuery.getJSON(mapURL, _.bind(function (tsv, state, xhr) {
                            if (xhr && xhr.responseText)
                            {
                                this.map_feilds = jQuery.parseJSON(xhr.responseText);
                                //curview.createMappingTable(rows);											
                                this.fileuploaded = true;
                                if (campview) {
                                    this.$el.hide();
                                }
                                else
                                {
                                    this.$el.find("div:first-child").hide();
                                }
                                var mapPage;
                                require(["listupload/mapdata"], _.bind(function (mapdataPage) {
                                    if (campview) {
                                        app.showLoading("Getting mapping fields...", campview.$el.find('.step3 #area_upload_csv'));
                                        mapPage = new mapdataPage({camp: campview, app: app, rows: rows});
                                        campview.states.step3.mapdataview = mapPage;
                                    }
                                    else {
                                        app.showLoading("Getting mapping fields...", curview.$el);
                                        mapPage = new mapdataPage({csv: this, app: app, rows: rows});
                                    }

                                }, this));
                            }
                        }, this));

                    } else {
                        app.showAlert(_csv[1], el);
                        curview.removeFile();
                    }
                },
                initialize: function () {
                    this.template = _.template(template);

                    this.render();
                    if (this.camp_obj) {
                        var campview = this.camp_obj;
                        this.app.showLoading(false, campview.$el.find('.step3 #area_upload_csv'));
                    }
                    this.$('#file_control').on('mouseover', _.bind(function (obj) {
                        this.$("#list_file_upload").css({'background': '#00A1DD', 'color': '#ffffff'});
                    }, this));
                    this.$('#file_control').on('mouseout', _.bind(function (obj) {
                        this.$("#list_file_upload").css({'background': '#01AEEE', 'color': '#ffffff'});
                    }, this));
                    this.$('#file_control').attr('title', '');
                },
                render: function () {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;
                    this.errMessage = 0;
                    this.iThumbnail = this.$(".drop-files");
                    this.camp_obj = this.options.camp;
                    jQuery.event.props.push('dataTransfer');
                    this.dragCSVSetting();
                },
                // Drag and Drop file to upload, append the upload box every time grid empty /search/tags search/new load
                dragCSVSetting: function () {
                    this.$("#drop-files").dragfile({
                        post_url: "/pms/io/subscriber/uploadCSV/?BMS_REQ_TK=" + this.app.get('bms_token') + "&stepType=one",
                        callBack: _.bind(this.showSelectedfile, this),
                        app: this.app,
                        module: 'csv',
                        progressElement: this.$('.csvimg')
                    });

                },
                uploadCsvFile: function (obj) {
                    var input_obj = obj.target;
                    var files = input_obj.files;
                    if (this.iThumbnail.data("dragfile")) {
                        this.iThumbnail.data("dragfile").handleFileUpload(files);
                    }
                },
                init: function () {
                    this.$(".template-container").css("min-height", (this.app.get('wp_height') - 178));
                    /*-----Remove loading------*/
                    this.app.removeSpinner(this.$el);
                    /*------------*/
                }
            });
        });