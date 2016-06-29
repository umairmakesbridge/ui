define(['text!reports/html/report.html'],
        function (template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Reports page row View to show on listing page
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({
                className: 'report-box',
                tagName: 'tr',
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    'click .edit-report': 'openReport',
                    "click .preview-report": 'previewReport',
                    'click .delete-report': 'deleteReportDialog'
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function () {
                    this.template = _.template(template);
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.tagTxt = '';
                    this.render();
                    //this.model.on('change',this.renderRow,this);
                },
                /**
                 * Render view on page.
                 */
                render: function () {
                    this.$el.html(this.template({
                        model: this.model
                    }));
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.initControls();
                },
                /*
                 * 
                 * @returns Time Show
                 */
                getTimeShow: function (_date) {
                    var datetime = '';
                    var dateFormat = '';
                    datetime = this.model.get(_date);
                    if (datetime)
                    {
                        var date = moment(this.app.decodeHTML(datetime), 'YYYY-M-D');
                        dateFormat = date.format("DD MMM, YYYY");
                    }
                    else {
                        dateFormat = '';
                    }
                    return dateFormat;
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function () {
                    if (this.sub.searchTxt) {
                        this.$(".edit-report").highlight($.trim(this.sub.searchTxt));
                    }

                },
                openReport: function () {
                    var editable = true;
                    this.app.mainContainer.openReport({"id": this.model.get("reportId.encode"), "checksum": this.model.get("reportId.checksum"), "parent": this.sub, editable: editable});
                },
                deleteReportDialog: function () {
                    var report_id = this.model.get('reportId.encode')
                    if (report_id) {
                        this.app.showAlertDetail({heading: 'Confirm Deletion',
                            detail: "Are you sure you want to delete this report?",
                            callback: _.bind(function () {
                                this.deleteReport();
                            }, this)},
                        $('body'));
                    }
                },
                deleteReport: function ()
                {
                    var report_obj = this.sub;
                    var URL = '/pms/io/user/customReports/?BMS_REQ_TK=' + report_obj.app.get('bms_token');
                    report_obj.app.showLoading("Deleting Report...", report_obj.$el.parents(".ws-content.active"), {fixed: 'fixed'});
                    $.post(URL, {type: 'delete', reportId: this.model.get('reportId.encode')})
                            .done(_.bind(function (data) {
                                this.app.showLoading(false, report_obj.$el.parents(".ws-content.active"));
                                var _json = jQuery.parseJSON(data);
                                if (this.app.checkError(_json)) {
                                    return false;
                                }
                                if (_json[0] !== "err") {
                                    this.app.showMessge("Report has been deleted successfully!");
                                    this.$el.fadeOut(_.bind(function () {
                                        this.$el.remove();
                                    }, this));
                                    var total_count = report_obj.$("#total_reports .badge");
                                    total_count.html(parseInt(total_count.text()) - 1);
                                    if ($("#wstabs li[workspace_id=report_" + this.model.get('reportId.checksum') + "]").length) {
                                        var wp_id = $("#wstabs li[workspace_id=report_" + this.model.get('reportId.checksum') + "]").attr('id').split("_")[2];
                                        $("#wp_li_" + wp_id + ",#workspace_" + wp_id).remove();
                                    }
                                }
                                else {
                                    report_obj.app.showAlert(_json[1], report_obj.$el.parents(".ws-content.active"));
                                }

                            }, this));
                }

            });
        });