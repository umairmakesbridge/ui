+define(['text!crm/google/html/import.html', 'jquery-ui', 'jquery.icheck', 'jquery.bmsgrid', 'jquery.searchcontrol', 'datetimepicker', 'jquery.chosen'],
        function(template) {
            'use strict';
            return Backbone.View.extend({
                className: 'netsuite_campaigns',
                events: {
                    'click .ui-accordion-header': function() {
                        return false;
                    },
                    'click .calendericon': function() {
                        this.$("#txtdatefield").focus()
                    },
                    'change #ddlspreadsheet': "loadWorksheet",
                    'change #ddlworksheet': 'getSampleDataForArrangments'
                },
                initialize: function() {
                    this.template = _.template(template);
                    this.hrObject = null;
                    this.recipientDetial = null;
                    this.app = this.options.page.app;
                    this.parent = this.options.page;
                    this.render();
                    this.countLoaded = false;
                },
                render: function() {
                    if (typeof this.options.edit != "undefined") {
                        this.recipientDetial = this.options.edit;
                    }
                    this.$el.html(this.template({}));
                    this.app.showLoading("Loading Data...", this.$el);
                    this.initControl();
                    this.$(".ui-accordion").accordion({header: "h3", collapsible: false, active: true});
                    this.$('#panel_0').slideDown();
                    this.$("#ddlspreadsheet").chosen({no_results_text: 'Oops, nothing found!', width: "250px", disable_search: "true"});
                },
                initControl: function() {
                    var google = this.app.getAppData("google");
                    if (typeof this.parent.options.page != "undefined")
                        this.googleCount = this.parent.options.page.peopleCount;
                    //this.$("#hImportAll").append("<div class='subscribers show' style='width:'><strong class='badge'>" +this.parent.options.page.peopleCount+"</strong></div>");
                    this.$('input.radiopanel').iCheck({
                        radioClass: 'radiopanelinput',
                        insert: '<div class="icheck_radio-icon"></div>'
                    });
                    var camp_obj = this;

                    this.setGoogleData();
                    this.app.showLoading(false, this.$el);
                    this.$('#panel_0').css('min-height:100px!important');

                },
                loadWorksheet: function(ev) {
                    this.$(":radio[value=sheet]").iCheck('check');
                    this.$('#panel_0').slideDown();
                    var selected = $(ev.target).val();
                    var URL = '/pms/io/google/getData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    var data = {
                        type: 'worksheetList',
                        spreadsheetId: selected
                    }
                    var that = this;
                    if (that.$("#ddlworksheet_chosen").length > 0)
                        that.$("#ddlworksheet_chosen").remove();
                    $.getJSON(URL, data)
                            .done(_.bind(function(json) {
                                that.app.showLoading(false, that.parent.$el);
                                var sheet = json.worksheetList[0];
                                var options = "<option value='0'>Select worksheet</option>";
                                _.each(sheet, function(elems, idx) {
                                    _.each(elems, function(elem, idx) {
                                        options = options + "<option value='" + elem.id + "'>" + elem.title + "</option>";
                                    });
                                });
                                that.$el.find("#ddlworksheet").html(options);
                                if (that.$el.find("#ddlworksheet").css('display') == 'none') {
                                    that.$el.find("#ddlworksheet").removeAttr('style');
                                }
                                that.$("#ddlworksheet").chosen({no_results_text: 'Oops, nothing found!', width: "250px", disable_search: "true"});

                            }))

                },
                getSampleDataForArrangments: function(ev) {
                    var URL = '/pms/io/google/getData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    var data = {};
                    var that = this;
                    that.$el.find('#sampletable').html();
                    that.$el.find('#sampletable').hide('fast');
                    $.extend(data, this.getSampleData());
                    $.getJSON(URL, data)
                            .done(_.bind(function(json) {
                                //this.showSampleData(json);
                                that.$('#panel_0').css('height', '');
                                require(["crm/google/google_data"], _.bind(function(mapdataPage) {
                                        that.$el.find('#sampletable').show('fast');
                                        var mapPage = new mapdataPage({csv:that, app: that.app, rows: json.sampleData});
                                        console.log(mapPage.$el);
                                         that.$el.find('#sampletable').html(mapPage.$el);
                                }));


                            }))
                        },
                        setGoogleData: function() {
                            if (this.parent.editImport || (this.parent.Import_page != null)) {
                                var recipient_obj;
                                if (this.parent.editImport) {
                                    recipient_obj = this.parent.editImport;
                                } else {
                                    recipient_obj = this.parent.Import_page.options.edit;
                                }
                                console.log(recipient_obj);
                                if (recipient_obj.filterType === "sheet") {
                                    this.$(":radio[value=importall]").iCheck('check');
                                    this.$('#panel_0').slideDown();
                                }
                            } else {
                                this.$(":radio[value=importall]").iCheck('check');
                            }

                            this.$("#hImportAll").append("<div class='subscribers show' style='width:'><strong class='badge'>" + this.googleCount + "</strong></div>");

                            this.app.showLoading(false, this.$el);
                        },
                        saveFilter: function(flag, goToNext) {

                            var URL = '/pms/io/google/getData/?BMS_REQ_TK=' + this.app.get('bms_token');
                            var data = {};
                            $.extend(data, this.getImportData());
                            this.app.showLoading("Fetching Count...", this.parent.$el);
                            $.getJSON(URL, data)
                                    .done(_.bind(function(json) {
                                        this.app.showLoading(false, this.parent.$el);
                                        this.recipientDetial = json;
                                        this.drawSampleData(json);
                                        this.parent.isFilterChange = true;
                                        if (goToNext) {
                                            this.parent.mk_wizard.next();
                                        }
                                    }, this))
                                    .fail(_.bind(function(jqxhr, textStatus, error) {
                                        $("highrise-sample-data .customer-count").html("0").show();
                                        this.app.showLoading(false, this.parent.$el);
                                        var err = textStatus + ", " + error;
                                        console.log("Request Failed: " + err);
                                    }, this));
                        },
                        getSampleData: function() {
                            var post_data = {};
                            var googleValue = this.$("input[name='options_hr']:checked").val();
                            if (googleValue == "importall") {
                                post_data['filterType'] = "all";
                                post_data['type'] = 'contactSample'
                            } else if (googleValue == "sheet") {
                                post_data['type'] = 'worksheetSample'
                                post_data['filterType'] = "sheet";
                                post_data['spreadsheetId'] = this.$el.find('#ddlspreadsheet').val();
                                post_data['worksheetId'] = this.$el.find('#ddlworksheet').val();

                                //Case (filterType = term) 
                                //Required fields:  term    [makesbridge]
                            }
                            console.log(post_data);
                            return post_data;

                        },
                        getImportData: function() {
                            var post_data = {};
                            var googleValue = this.$("input[name='options_hr']:checked").val();

                            post_data['type'] = 'import';
                            if (googleValue == "importall") {
                                post_data['filterType'] = "all";

                            } else if (googleValue == "sheet") {
                                post_data['filterType'] = "sheet";
                                post_data['spreadsheetId'] = this.$el.find('#ddlspreadsheet').val();
                                post_data['worksheetId'] = this.$el.find('#ddlworksheet').val();

                                //Case (filterType = term) 
                                //Required fields:  term    [makesbridge]
                            }
                            console.log(post_data);
                            return post_data;

                        },
                        getCount: function() {
                            var URL = '/pms/io/google/getData/?BMS_REQ_TK=' + this.app.get('bms_token');
                            var data = {
                                type: 'importCount',
                                tId: this.parent.tId
                            }
                            $.getJSON(URL, data)
                                    .done(_.bind(function(json) {
                                        var recipient_obj = this.parent.editImport;
                                        //this.$(".managefilter ._count").show().html(json[recipient_obj.nsObject+"Count"]);

                                    }, this))
                                    .fail(_.bind(function(jqxhr, textStatus, error) {
                                        this.app.showLoading(false, this.parent.$el);
                                        var err = textStatus + ", " + error;
                                        console.log("Request Failed: " + err);
                                    }, this));
                        },
                        moveSampleRecord: function(table, from, to) {
                            var rows = table.find("tr");
                            var cols;
                            rows.each(function() {
                                cols = $(this).children('th, td');
                                cols.eq(from).detach().insertBefore(cols.eq(to));
                            });
                        },
                        drawSampleData: function(data) {
                            this.parent.$(".highrise-sample-data").children().remove();
                            var that = this;
                            this.$el.find(".managefilter .badge").hide();
                            var table_html = '<table cellspacing="0" cellpadding="0" border="0"><thead></thead><tbody></tbody></table>';
                            var total = 0;
                            if (data.sampleCount)
                                total = data.sampleCount;

                            //this.parent.$("#customer_accordion .highrise-count").html(total).show();
                            var tableObj = null;
                            var table_row = "", table_head = "";
                            if (data.recordList) {
                                var found = false;

                                _.each(data.recordList[0], function(val, key) {

                                    if (parseInt(key.substring(key.length - 1)) == 1) {
                                        tableObj = $(table_html);
                                        table_head = "<tr>";

                                        _.each(val[0], function(val, key) {
                                            table_head += "<th>" + val + "</th>";


                                        });

                                        table_head += "</tr>"
                                        tableObj.find("thead").append(table_head);
                                        this.parent.$(".highrise-sample-data").append(tableObj);
                                    }
                                    else {
                                        table_row = "<tr>";
                                        _.each(val[0], function(val, key) {
                                            if (!val)
                                                val = "&nbsp;";
                                            table_row += "<td>" + val + "</td>";
                                            found = true;
                                        });
                                        table_row += "</tr>"
                                        tableObj.find("tbody").append(table_row);
                                    }

                                }, this);

                                $.extend($.expr[":"], {
                                    "containsIN": function(elem, i, match, array) {
                                        return (elem.textContent || elem.innerText || "").toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
                                    }
                                });
                                var zip = tableObj.find("tr  th:containsIN('zip')").index();
                                if (zip != "-1") {
                                    that.moveSampleRecord(tableObj, zip, 0);
                                }
                                var state = tableObj.find("tr  th:containsIN('state')").index();
                                if (state != "-1") {
                                    that.moveSampleRecord(tableObj, state, 0);
                                }
                                var city = tableObj.find("tr  th:containsIN('city')").index();
                                if (city != "-1") {
                                    that.moveSampleRecord(tableObj, city, 0);
                                }
                                var phone = tableObj.find("tr  th:containsIN('phone')").index();
                                if (phone != "-1") {
                                    that.moveSampleRecord(tableObj, phone, 0);
                                }
                                var company = tableObj.find("tr  th:containsIN('company')").index();
                                if (company != "-1") {
                                    that.moveSampleRecord(tableObj, company, 0);
                                }
                                var last = tableObj.find("tr  th:containsIN('last')").index();
                                if (last != "-1") {
                                    that.moveSampleRecord(tableObj, last, 0);
                                }
                                var first = tableObj.find("tr  th:containsIN('first')").index();
                                if (first != "-1") {
                                    that.moveSampleRecord(tableObj, first, 0);
                                }
                                var add = tableObj.find("tr  th:containsIN('add')").index();
                                if (add != "-1") {
                                    that.moveSampleRecord(tableObj, add, 0);
                                }
                                var email = tableObj.find("tr  th:containsIN('email')").index();
                                if (email != "-1") {
                                    that.moveSampleRecord(tableObj, email, 0);
                                }

                                if (found == false) {
                                    tableObj.find("tbody").append("<tr> <td style='text-align:center' colspan='20' align='center'>No Records found</td></tr>");
                                }



                            }
                        }
                    });
        });