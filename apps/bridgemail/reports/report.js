define(['text!reports/html/report.html', 'jquery.highlight'],
        function (template, highlighter) {
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
                    'click .delete-report': 'deleteReportDialoge'                    
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
                    this.app.mainContainer.openReport({"id":this.model.get("reportId.encode"),"checksum":this.model.get("reportId.checksum"),"parent":this.sub,editable:editable});
                },
                deleteReportDialoge: function () {                                      
                    var page_id = this.model.get('reportId.encode')
                    if (page_id) {
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
                    var camp_obj = this.sub;                   
                    var URL = '/pms/io/publish/saveLandingPages/?BMS_REQ_TK=' + camp_obj.app.get('bms_token');
                    camp_obj.app.showLoading("Deleting Page...", camp_obj.$el.parents(".ws-content.active"), {fixed: 'fixed'});
                    $.post(URL, {type: 'delete', pageId: this.model.get('pageId.encode')})
                            .done(_.bind(function (data) {
                                this.app.showLoading(false, camp_obj.$el.parents(".ws-content.active"));
                                var _json = jQuery.parseJSON(data);
                                if(this.app.checkError(_json)){
                                 return false;
                                 }
                                if (_json[0] !== "err") {
                                    this.app.showMessge("Page has been deleted successfully!");                                    
                                    this.$el.fadeOut(_.bind(function(){
                                       this.$el.remove();
                                    },this));    
                                    camp_obj.headBadge();
                                    var total_count = camp_obj.$("#total_templates .badge");
                                    total_count.html(parseInt(total_count.text())-1);
                                    if ($("#wstabs li[workspace_id=landingpage_" + this.model.get('pageId.checksum') + "]").length) {
                                        var wp_id = $("#wstabs li[workspace_id=landingpage_" + this.model.get('pageId.checksum') + "]").attr('id').split("_")[2];
                                        $("#wp_li_" + wp_id + ",#workspace_" + wp_id).remove();
                                    }
                                }
                                else {
                                    camp_obj.app.showAlert(_json[1], camp_obj.$el.parents(".ws-content.active"));
                                }

                            }, this));
                }

            });
        });