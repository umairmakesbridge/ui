define(['text!listupload/html/mapdata.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                id: 'mapdata',
                tags: 'div',
                isCampRunning: 'Y',
                newFieldName: "",
                events: {
                    'click .map-toggle .btn': function (obj) {
                        var el = this.$el;
                        var actid = $(obj.target).attr('id');
                        if (actid == 'old')
                        {
                            el.find('#list_erroricon').css('display', 'none');
                            el.find('#newlist').removeAttr('style');
                            el.find('#newlist').hide();
                            el.find('#existing_lists_chosen').attr('style', 'width:288px; display:block;');
                        } else if (actid == 'new')
                        {
                            el.find('#list_erroricon').css('display', 'none');
                            el.find('#existing_lists_chosen').removeAttr('style');
                            el.find('#existing_lists_chosen').hide();
                            el.find('#newlist').show();
                        }
                        el.find('.map-toggle .btn').removeClass('active');
                        $(obj.target).addClass('active');
                    },
                    'click .fubackbtn': function () {
                        var curview = this;
                        var app = this.app;
                        if (this.campview) {
                            this.campview.csvupload.$el.show();
                        } else {
                            this.csv.$el.find("div:first-child").show();
                        }
                        curview.$el.hide();
                        app.showLoading(false, curview.$el);
                    }
                    ,
                    'click .save-contacts': function () {
                        var csvupload = this.csv;
                        if (csvupload && csvupload.fileuploaded == true)
                        {
                            var isValid = this.mapAndImport();
                            if (isValid)
                            {
                                this.$el.hide();
                            }
                            return isValid;
                        } else {
                            this.app.showAlert('Please supply csv file to upload', this.$el.parents(".ws-content"));
                        }
                    },
                    'click .videobar': function (e) {
                        var _a = $.getObj(e, "a");
                        if (_a.length) {
                            var video_id = _a.attr("rel");
                            var dialog_title = "Help Video";
                            var dialog = this.app.showDialog({title: dialog_title,
                                css: {"width": "720px", "margin-left": "-360px"},
                                bodyCss: {"min-height": "410px"}
                            });
                            dialog.getBody().html('<iframe src="//player.vimeo.com/video/' + video_id + '" width="700" height="400" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe> ');
                        }
                        e.stopPropagation();
                        e.preventDefault();
                    }
                },
                mapAndImport: function () {
                    var campview = this.camp_obj;
                    var curview = campview ? campview.states.step3.csvupload : this.csv;
                    var app = this.app;
                    var mapview = this;
                    var that = this;
                    var el = this.$el;
                    var actid = el.find('.map-toggle .active').attr('id');
                    var newlist = '';
                    var listid = '';
                    var isValid = true;
                    var layout_map = [];
                    var list_array = '';
                    var layout_map_str = '';
                    if (app.getAppData("lists"))
                        list_array = app.getAppData("lists");
                    if (actid == 'new')
                    {
                        if (el.find('#newlist').val() == '')
                        {
                            app.showError({
                                control: el.find('.list-container'),
                                message: "Enter a list name"
                            });
                            isValid = false;
                        } else
                        {
                            if (list_array != '')
                            {
                                var exists = false;
                                $.each(list_array.lists[0], function (index, val) {
                                    if (val[0].name == el.find('#newlist').val())
                                    {
                                        exists = true;
                                        return;
                                    }
                                });
                                if (exists)
                                {
                                    app.showError({
                                        control: el.find('.list-container'),
                                        message: "List name already exists"
                                    });
                                    isValid = false;
                                } else
                                {
                                    newlist = el.find('#newlist').val();
                                    app.hideError({control: el.find(".list-container")});
                                }
                            }
                        }
                    } else if (actid == 'old')
                    {
                        if (el.find('#existing_lists').val() == '' || el.find('#existing_lists').val() == 'No List Available')
                        {
                            app.showError({
                                control: el.find('.list-container'),
                                message: "Please choose a list"
                            });
                            isValid = false;
                        } else
                        {
                            listid = el.find('#existing_lists').val();
                            app.hideError({control: el.find(".list-container")});
                        }
                    }
                    var email_addr = el.find('#alertemail').val();
                    if (email_addr != '' && !app.validateEmail(email_addr))
                    {
                        app.showError({
                            control: el.find('.email-container'),
                            message: "Please enter correct email address format"
                        });
                        isValid = false;
                    } else
                    {
                        app.hideError({control: el.find(".email-container")});
                    }
                    var sel_lenght = el.find(".mapfields").length;
                    var prevVal = '';
                    var j = 0;
                    var dup = 0;
                    el.find(".mapfields").each(function (i, e) {
                        var id = $(e).parent().find('.erroricon').attr('id');
                        if ($(e).val() == '' && j == 0) {
                            layout_map = [];
                        } else
                        {
                            if ($(e).val() == "" || layout_map.indexOf($(e).val()) == -1)
                            {
                                layout_map.push($(e).val());
                                j++;
                            } 
                            else if ($(e).val() != "" && layout_map.indexOf($(e).val()) != -1)
                            {
                                dup++;
                            }
                        }
                    });
                    /* Check if map data exists in Layout map */
                    if (layout_map.length == 0)
                    {
                        app.showAlert("Match your CSV columns to fields. Columns that you do not match will not be uploaded", el);
                        isValid = false;
                    } else {
                        var email_flag = null;
                        for (var i = 0; i < layout_map.length; i++) {
                            if (layout_map[i] === 'EMAIL_ADDR') {
                                email_flag = 1;
                            }
                        }
                        if (email_flag !== 1) {
                            app.showAlert("Please select atleast Email address as a mapping column", el);
                            isValid = false;
                        }
                        layout_map_str = layout_map.join();
                    }
                    if (dup > 0)
                    {
                        app.showAlert("Please remove duplicate column names.", el);
                        isValid = false;
                    }

                    if (isValid)
                    {
                        var alertemail = el.find('#alertemail').val();
                        app.showLoading("Uploading file", this.$el);
                        var that = this;
                        var importURL = '/pms/io/subscriber/uploadCSV/?BMS_REQ_TK=' + app.get('bms_token') + '&stepType=two';
                        $.post(importURL, {type: "import", listNumber: listid, optionalEmail: alertemail, newListName: newlist, fileName: curview.fileName, layout: layout_map_str})
                                .done(function (data) {
                                    var list_json = jQuery.parseJSON(data);
                                    if (list_json[0] == 'success')
                                    {

                                        app.removeCache("lists");
                                        if (campview) {
                                            curview.removeFile();
                                            campview.states.step3.recipientType = 'List';
                                            campview.states.step3.recipientDetial = null;
                                            campview.step3SaveCall({'recipientType': 'List', "listNum": list_json[2], "csvflag": true});
                                            app.showLoading(false, mapview.$el);
                                        } else {
                                            // Add request from Lists
                                            if (that.listChecksum) {
                                                app.showMessge("Your contacts in CSV file updated successfully.You can upload other CSV file as well.<br/>Import process may take a while.");
                                            } else {
                                                app.showMessge("Your contacts in CSV file updated successfully.You can upload other CSV file as well.");
                                            }


                                            if (typeof (mapview.options.params) != "undefined") {
                                                app.showLoading(false, mapview.$el);
                                                //that.$el.hide();
                                                require(["listupload/csvupload"], function (csvupload) {
                                                    var mPage = new csvupload({app: app, camp: mapview});
                                                    mapview.$el.html(mPage.$el);
                                                    //  mapview.$el.find('#mapdata').show();
                                                    mapview.$el.parents(".ws-content").find("#drop-files").show();
                                                    mapview.$el.parents(".ws-content").find(".csvpng").show();

                                                });
                                            } else {
                                                app.showLoading(false, curview.$el);
                                                mapview.$el.hide();
                                                mapview.$el.parents(".ws-content").find("#drop-files .middle").show();
                                                mapview.$el.parents(".ws-content").find("#drop-files .middle #list_file_upload").parent().show();
                                                mapview.$el.parents(".ws-content").find("#drop-files").show();
                                                mapview.$el.parents(".ws-content").find(".csvpng").show();
                                                mapview.$el.parents(".ws-content").find("#progress").remove();
                                                if (that.listChecksum) {
                                                    var listView = mapview.$el.parents('body').find("[workspace_id='recipients']").data("viewObj");
                                                    listView.listingView.loadLists();
                                                }
                                                mapview.csv.fileuploaded = false;
                                            }

                                        }

                                    } else
                                    {
                                        app.showAlert(list_json[1], mapview.$el);
                                        app.showLoading(false, mapview.$el);
                                        return false;
                                    }
                                });
                    } else
                        return false;
                },
                checkCampStatus: function () {
                    var mapview = this;
                    var campview = this.camp_obj;
                    var importURL = '/pms/io/campaign/getCampaignData/?BMS_REQ_TK=' + this.app.get('bms_token');
                    $.post(importURL, {type: "csvUploadRunning", campNum: campview.camp_id})
                            .done(function (data) {
                                var list_json = jQuery.parseJSON(data);
                                if (list_json.csvUploadRunning == 'Y')
                                {
                                    setTimeout(function () {
                                        mapview.checkCampStatus()
                                    }, 30000);
                                    mapview.isCampRunning = 'Y';
                                } else
                                    mapview.isCampRunning = 'N';
                            });
                },
                filllistsdropdown: function () {
                    var list_array = '';
                    var list_html = "";
                    var campview = this.camp_obj;
                    var app = this.app;
                    var curview = this;
                    URL = "/pms/io/list/getListData/?BMS_REQ_TK=" + app.get('bms_token') + "&type=all";
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            if (campview) {
                                app.showLoading(false, campview.$el.find('.step3 #area_upload_csv'));
                            } else {
                                app.showLoading(false, curview.csv.$el);
                            }
                            list_array = jQuery.parseJSON(xhr.responseText);
                            if (list_array != '')
                            {
                                var $i = 0;
                                list_html +="<option value='' ></option>";
                                $.each(list_array.lists[0], function (index, val) {
                                    /*=========
                                     * Check if Supress List to be show
                                     * ========*/
                                    if (curview.isSupressListFlag) {
                                        if (val[0].isSupressList === "true") {
                                            list_html += "<option value='" + val[0]["listNumber.encode"] + "' data-checksum='" + val[0]["listNumber.checksum"] + "'>" + val[0].name + "</option>";
                                            $i++; // count total supress list
                                        }
                                    }
                                    if (!curview.isSupressListFlag) {
                                        if (val[0].isSupressList == "false" && val[0].isBounceSupressList == "false") {
                                            list_html += "<option value='" + val[0]["listNumber.encode"] + "' data-checksum='" + val[0]["listNumber.checksum"] + "'>" + val[0].name + "</option>";
                                        } else {
                                            $i++; // count total supress list
                                        }
                                    }

                                });
                                var total_count = parseInt(list_array.count) - $i;
                                /*=========
                                 * Check if Supress List available
                                 * ========*/
                                if (curview.isSupressListFlag) {
                                    if (total_count == 0 || total_count == parseInt(list_array.count)) {
                                        curview.$el.find("#existing_lists").html('<option>No Supress List Available</option>')
                                        curview.$el.find('#existing_lists').prop('disabled', true).trigger("chosen:updated");

                                    } else {
                                        curview.$el.find("#existing_lists").html(list_html);
                                    }
                                } else {
                                    if (total_count != 0) {
                                        curview.$el.find("#existing_lists").html(list_html);
                                        curview.$el.find('#existing_lists option[data-checksum="' + curview.listChecksum + '"]').prop('selected', true).trigger("chosen:updated")
                                    } else {
                                        curview.$el.find('#existing_lists').prop('disabled', true).trigger("chosen:updated");
                                    }
                                }

                            }
                            app.setAppData('lists', list_array);
                            curview.$el.find("#existing_lists").chosen({no_results_text: 'Oops, nothing found!', width: "400px"});
                        }
                    }).fail(function () {
                        console.log("error lists listing");
                    });

                },
                initialize: function () {
                    this.template = _.template(template);
                    this.render();
                    var curview = this;
                    var app = this.app;

                    this.listChecksum = this.options.listChecksum;
                    var campview = this.options.camp;
                    if (typeof (this.options.params) != 'undefined') {
                        this.rows = curview.options.params.rows
                    } else {
                        this.rows = curview.options.rows
                    }

                    this.filllistsdropdown();
                    curview.$el.find('.tabel-div').children().remove();
                    var mappingHTML = curview.createMappingTable(this.rows);
                    curview.$el.find('.tabel-div').append(mappingHTML);

                    if (campview) {
                        campview.$el.find('.step3 #area_upload_csv').html(curview.$el);
                    } else {
                        this.csv.$el.append(curview.$el);
                    }
                    curview.$el.find(".mapfields").chosen({no_results_text: 'Oops, nothing found!', width: "200px"});
                    curview.$el.find(".add-custom-field").addbox({app: app,
                        addCallBack: _.bind(curview.addCustomField, curview),
                        placeholder_text: "New custom field"
                    });
                    var curview = this;
                    this.isSupressListFlag = this.$el.parents(".ws-content.active").find('.camp_header').hasClass('orange-head');
                    if (this.isSupressListFlag) {
                        this.$('.map-toggle').hide();
                    }
                    curview.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                render: function () {
                    this.$el.html(this.template({}));

                    this.app = this.options.app;
                    this.camp_obj = this.options.camp;
                    this.isSupressListFlag = false;
                    if (typeof (this.options.params) != 'undefined') {
                        this.csv = this.options.params.csv;
                    } else {
                        this.csv = this.options.csv;
                    }
                    if (this.csv) {
                        this.$(".save-contacts").show();
                    }
                    if (this.app.get("user")) {
                        var alertEmail = this.app.get("user").alertEmail ? this.app.get("user").alertEmail : this.app.get("user").userEmail;
                        this.$("#alertemail").val(alertEmail);
                    }


                }
                ,
                init: function () {
                    this.app.removeSpinner(this.$el);
                    this.$(".template-container").css("min-height", (this.app.get('wp_height') - 178));
                },
                createMappingTable: function (rows) {
                    var curview = this;
                    var tcols = 4;
                    var cols = rows[0].length;
                    var tables_count = Math.ceil(cols / tcols);
                    var mappingHTML = "";
                    for (var t = 0; t < tables_count; t++) {
                        var oc = t * tcols;
                        mappingHTML += "<table id='uploadslist' class='table'>";
                        for (var r = 0; r < 5; r++) {
                            if (r == 0) {
                                mappingHTML += "<tr>";
                                for (var h = oc; h < (oc + tcols + 1); h++) {
                                    if (h == oc) {
                                        mappingHTML += "<th width='30px' class='leftalign'>&nbsp;</th>";
                                    } else {
                                        var hcol = (h <= cols) ? "col" + h : "&nbsp;";
                                        mappingHTML += "<th width='25%'>" + hcol + "</th>";
                                    }
                                }
                                mappingHTML += "</tr>";
                            } else if (r == 1) {
                                mappingHTML += "<tr>";
                                for (var f = oc; f < (oc + tcols + 1); f++) {
                                    if (f == oc) {
                                        mappingHTML += "<td width='30px' class='td_footer lastrow'>&nbsp;</td>";
                                    } else {
                                        var cbox = (f <= cols) ? curview.mapCombo(f) : "&nbsp;";
                                        mappingHTML += "<td width='25%' class='td_footer lastrow'>" + cbox + "</td>";
                                    }
                                }
                                mappingHTML += "</tr>";
                            } else {
                                var oddRow = (r % 2 == 0) ? "class='colorTd'" : "";
                                mappingHTML += "<tr>";
                                for (var c = oc; c < (oc + tcols + 1); c++) {
                                    if (c == oc) {
                                        mappingHTML += "<td>" + (r - 1) + "</td>";
                                    } else {
                                        if (rows[r - 2]) {
                                            var tdText = rows[r - 2][c - 1] ? rows[r - 2][c - 1] : "&nbsp;";
                                            mappingHTML += "<td " + oddRow + ">" + tdText + "</td>";
                                        }
                                    }
                                }
                                mappingHTML += "</tr>";
                            }
                        }
                        mappingHTML += "</table>";
                    }
                    return mappingHTML;
                },
                addCustomField: function (val, obj)
                {
                    var curview = this;
                    curview.$el.find('.mapfields').append("<option value='" + val + "'>" + val + "</option>");
                    var elemId = obj.attr('id');
                    curview.$el.find('.mapfields.' + elemId).val(val);
                    curview.$el.find('.mapfields').trigger("chosen:updated");
                    return true;
                    //curview.$el.find('.btn-close').click();
                },
                mapCombo: function (num) {
                    var campview = this.options.camp;
                    var csvupload = campview ? campview.states.step3.csvupload : this.csv;
                    var map_feilds = csvupload.map_feilds;

                    var chtml = "";
                    chtml += "<select class='mapfields " + num + "' data-placeholder='Choose Field'>";
                    chtml += "<option value=''></option>";
                    var optgroupbasic = "<optgroup class='select_group' label='Select Basic Fields'>", optgroupcustom = "<optgroup class='select_group' label='Select Custom Fields'>";
                    if (map_feilds)
                    {
                        for (var x = 0; x < map_feilds.length; x++) {
                            var sel = "";
                            if (map_feilds[x][2] == 'true') {
                                optgroupbasic += "<option class='select_option' value='" + map_feilds[x][0] + "' " + sel + ">" + map_feilds[x][1] + "</option>";
                            } else {
                                optgroupcustom += "<option class='select_option' value='" + map_feilds[x][0] + "' " + sel + ">" + map_feilds[x][1] + "</option>";
                            }
                        }
                    }
                    optgroupbasic += "</optgroup>";
                    optgroupcustom += "</optgroup>";
                    chtml += optgroupbasic + optgroupcustom;
                    chtml += "</select>";
                    chtml += '<div class="iconpointy"><a class="btn-green showtooltip" data-original-title="Add custom field"><i class="icon plus left add-custom-field showtooltip" data-original-title="Add custom field" id="' + num + '"></i></a></div>';
                    return chtml;
                }
            });
        });