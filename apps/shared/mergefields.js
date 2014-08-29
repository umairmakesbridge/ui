/*
 *Created by : Umair Shahid & Abdullah
 *Version: 1 
 *Mergefields plugin
 *=================================*/

!function($) {
    "use strict";

    var MergeFields = function(element, options) {
        this.init(element, options)
    }

    MergeFields.prototype = {
        constructor: MergeFields

        , init: function(element, options) {
            this.$element = $(element);
            this.mergeTags = {};
            this.allMergeTags = [];
            this.options = this.getOptions(options);
            this.configs = this.options.config;
            this.app = this.options.app;
            this.$mergefieldWrap = $(this.options.dialog); // Dialog Box
            this.$topScroll = null; 
            this.isRequest = 0;
            //this.mappingInit()     
            if (this.$element) {
                this.template = $(this.options.template)   // Input Template                       
                this.showMergeField(this.options);
            }
        },
        showMergeField: function(options) {
            this.isRequest = parseInt(this.isRequest) + 1;
            var id = this.options.elementID;
            if(id==="campaign_from_email"){
                this.template.find('#input-wrap-plugin').attr( "style", "" );
                this.template.find('input').remove();
                this.$element.css('width','74%');
                
                //this.$element.parents('.ws-content.active').find('button').parent().remove();
                this.template.find('button').parent().addClass('fromemail-group');
                var cloneBtn = this.template.find('button').parent().clone();
                this.$element.find('.fromeEmail-container').append(cloneBtn);
                
            }else{
                this.$element.html('');
            }
            if (id == "merge_field_plugin" || id == "merge-field-editor" || id=="merge-field-hand" || id=="merge-field-plain") {
                if(this.options.autobot == true){
                    this.$element.css('width','100%');
                }else{
                    this.template.css({'width': '325px'});
                }
                this.template.find('input').attr({'style': 'width:75.2%'});
            }
            if (id == "campaign_from_name" || id == "campaign_reply_to") {
                this.$element.css('width','100%');
                this.template.find('input').addClass('header-info-plugin');
            }
            /*Class to the container for error*/
              if(id=="campaign_subject"){
                  this.$element.css('width','100%');
                  this.template.first().addClass('subject-container');
              }else if(id=="campaign_from_name"){
                   this.template.first().addClass('fname-container');
              }
            if(id !=="campaign_from_email"){
            this.template.find('input').attr('id', id);
            this.$element.append(this.template);
            }
            //options.app.fixCampaignInputStepOne();
            if(this.configs.isrequest){
                this.requestMergeData(options);
            }else{
                this.generateMergeTag();
            }
            
            if (this.options.placeholder_text) {
               this.template.find("input").attr("placeholder", this.options.placeholder_text)
            }

        },
        requestMergeData : function(options){
            if (!options.app.getAppData("mergetags")) {                             
                options.app.getData({
                    "URL": "/pms/io/getMetaData/?BMS_REQ_TK=" + options.app.get('bms_token') + "&type=merge_tags",
                    "key": "mergetags",
                    "callback": $.proxy(this.generateMergeTag, this)
                });
            }
            else {
                this.generateMergeTag();
            }
        },
        generateMergeTag: function() {
            var _this = this;
            
            var mergeFields_data = this.options.app.getAppData("mergetags");
           // this.options.app.setAppData('mergetags',mergeFields_data);
            _this.mergeTags['basic'] = [];
            _this.mergeTags['custom'] = [];
            _this.mergeTags['salesRep'] = [];
            _this.mergeTags['links'] = [];

            $.each(mergeFields_data, function(key, val) {
                if (val[2] == "B") {
                    _this.mergeTags['basic'].push(val);
                } else if (val[2] == "C") {
                    _this.mergeTags['custom'].push(val);
                }
                else if (val[2] == "S") {
                    _this.mergeTags['salesRep'].push(val);
                }
                else if (val[2] == "U") {
                    _this.mergeTags['links'].push(val);
                }
            });
            $.each(this.mergeTags['salesRep'], function(key, val) {
                _this.allMergeTags.push({"type": "Sales Rep", "name": val[1], "code": val[0]});
            });
            $.each(this.mergeTags['basic'], function(key, val) {
                _this.allMergeTags.push({"type": "Basic Field", "name": val[1], "code": val[0]});
            });
            $.each(this.mergeTags['custom'], function(key, val) {
                _this.allMergeTags.push({"type": "Custom Field", "name": val[1], "code": val[0]});
            });
            $.each(this.mergeTags['links'], function(key, val) {
                _this.allMergeTags.push({"type": "Links", "name": val[1], "code": val[0]});
            });
            this.allMergeTags.sort(function(a, b) {
                var a1 = a.name, b1 = b.name;
                if (a1 == b1)
                    return 0;
                return a1 > b1 ? 1 : -1;
            });
            if(this.options.mergeFieldsCallback){
                this.options.mergeFieldsCallback();
            }
            this.createMergeTagField();

        },
        createMergeTagField: function() {

            
            var fields_html = "<ul>";
            $.each(this.allMergeTags, function(key, val) {
                fields_html += "<li mergeval='" + val.code + "' rel='" + val.type + "'><span>" + val.type + "</span><div>" + val.name + "</div><a class='search-merge-insert'>Insert</a></li>";
            });
            fields_html += "</ul>";
            this.$mergefieldWrap.find("#plugin-search-fields .plugin-search-list").html(fields_html);
            /*Binding Events*/
            if(this.options.elementID==="campaign_from_email")
            {
                this.$element.find("#plugin-merge-dropdown").on("click", $.proxy(this.showMergeDialogBox, this));
                this.$element.find("#plugin-merge-dropdown").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false})
            }else{
                this.template.find("#plugin-merge-dropdown").on("click", $.proxy(this.showMergeDialogBox, this));
                this.template.find("#plugin-merge-dropdown").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false})
            }
               
                return;
        },
        showMergeDialogBox: function(obj) {
            
            $("#merge-field-plug-wrap").remove();
            var $this = this.$mergefieldWrap;
            var $thisBasicField = this.configs.basicFields;
            var $thisSalesForce = this.configs.salesForce;
            var $thisCustomFields = this.configs.customFields;
            var $thisLinks = this.configs.links;
            var $thisEmailType = this.configs.emailType;
            var $isClass = this.options.class;
            var btn = $.getObj(obj, "button");
            $this.find("#merge_list_search").val("");
            
            var ele_offset = btn.offset();
            var ele_width = btn.width();
            var ele_height = btn.height();
             var top = '';
            if($isClass){
                top = ele_offset.top - ele_height - 211;
                $this.addClass($isClass);
            }else{
                top = ele_offset.top + ele_height + 11;
            }
            var left = ele_offset.left - $this.width() + ele_width + 14;
            if ($this.css("display") == "block" && parseInt($this.css("top")) == parseInt(top)) {
                $this.hide();
            } else {
                $this.find(".browsefields").show();
                $this.find(".browsefields #mergefields_links").hide();
                $this.removeClass("hide-selected");
                $.each($this.find(".browsefields #salesRep li"), function(ele, index) {
                    $(ele).removeClass("group1");
                });
                $this.find(".searchfields li").removeClass("group1");
                $this.find(".browsefields").removeClass("mergefields_editor");
                $this.find(".searchfields,#remove-merge-list").hide();
                $this.find("#plugin-search-list").val("");
                   
                $this.css({"top": top + "px", "left": left + "px", "z-index": "9999","display":"block"});
                $("body").append($this);
                this.bindingEvents();
                var input_container = "";
                if(this.options.elementID==="campaign_from_email")
                {
                    input_container = "campaign_from_email";
                }else{
                    input_container = this.template.find("input[type='text']").attr("id");
                }
                $this.attr("input-source", input_container);
              
                if ($thisSalesForce === true)
                {
                    $this.addClass("hide-selected");
                    $this.find(".merge-feilds-plugin-type li#mergefields_salesRep").click();
                    if ($thisEmailType === true)
                    {
                        $.each($this.find(".browsefields #salesRep li"), function(ele, index) {
                            if ($(ele).attr("mergeval") !== "{{BMS_SALESREP.EMAIL}}") {
                                $(ele).addClass("group1");
                            }
                        });
                        $this.find(".searchfields li[rel='Sales Rep']").addClass("group1");
                        $this.find(".searchfields li[mergeval='{{BMS_SALESREP.EMAIL}}']").removeClass("group1");
                    }
                    $this.find(".searchfields li[rel='Basic Field']").addClass("group1");
                }
                else if ($thisLinks === true)
                {
                    $this.find(".merge-feilds-plugin-type li#mergefields_basic").click();
                    $this.find(".browsefields #mergefields_links").show();
                }
                else {
                    $(".merge-feilds-plugin-type li#mergefields_basic").click();
                }
            }
            
            
            obj.stopPropagation();
        },
        showMergeFields: function(obj) {
            var $this = this.$mergefieldWrap;
            var $thisEmailType = this.configs.emailType;
            var li = $.getObj(obj, "li");
            if (!li.hasClass("active")) {
                var type = li.attr("id").split("_")[1];
                var fields = this.mergeTags[type];
                var fields_html = "<ul id='" + type + "'>";
                $.each(fields, function(key, val) {
                    var hideClass = (type == "salesRep" && $("#merge-field-plug-wrap").hasClass("hide-selected") && val[0] !== "{{BMS_SALESREP.EMAIL}}" && $thisEmailType === true) ? "group1" : "";
                    fields_html += "<li rel='" + type + "' mergeval='" + val[0] + "' class='" + hideClass + "'>" + val[1] + "<a class='append-merge-field-plugin'>Insert</a></li>";
                });
                fields_html += "</ul>";

                $this.find("#browsefields .searchlist").html(fields_html);
                $this.find(".merge-feilds-plugin-type li.active").removeClass("active");
                li.addClass("active");
                this.bindingEvents();
            }
            obj.stopPropagation();
        },
        searchMergeFields: function(obj) {
            var searchterm = $(obj.target).val();
            var $this = this.$mergefieldWrap;
            $this.find("#plugin-search-fields .searchlist").find('.notfound').hide();
            if (searchterm.length) {
                $this.find("#plugin-search-fields,#remove-merge-list").show();
                $this.find(".browsefields").hide();
                $this.find("#plugin-search-fields .searchlist li").hide();
                searchterm = searchterm.toLowerCase();
                var count = 0;
                $this.find("#plugin-search-fields .searchlist li").filter(function() {
                    if ($(this).find("div").text().toLowerCase().indexOf(searchterm) > -1 && $(this).find("div").text().substring(0, 9) != '<!DOCTYPE')
                    {
                        count++;
                        return $(this);
                    }
                }).show();
                var ids = ['Basic Field', 'Custom Field', 'Sales Rep', 'Links'];
                var items = $this.find("#plugin-search-fields .searchlist li");
                $.each(ids, function(index, id) {
                    $(items).filter("li[rel='" + ids[index] + "']").appendTo($this.find("#plugin-search-fields .searchlist ul"));
                });
                $this.find("#plugin-search-fields .searchlist li div").removeHighlight().highlight(searchterm);
                if (count == 0)
                {
                    $this.find("#plugin-search-fields .searchlist").append('<p class="notfound">No merge field found containing &lsquo;' + searchterm + '&rsquo;</p>');
                }
            }
            else {
                $this.find("#plugin-search-fields .searchlist li").removeHighlight();
                $this.find("#plugin-search-fields .searchfields,#remove-merge-list").hide();
                $this.find(".browsefields").show();
                $this.find("#plugin-search-fields").hide();
            }

        },
        /*Binding Events */
        bindingEvents:function(){
            this.$mergefieldWrap.find(".append-merge-field-plugin").on("click",$.proxy(this.mergeInsert,this));
            this.$mergefieldWrap.find(".merge-feilds-plugin-type li").on("click", $.proxy(this.showMergeFields, this));
            this.$mergefieldWrap.keyup($.proxy(this.searchMergeFields, this));
            this.$mergefieldWrap.find(".search-merge-insert").on("click",$.proxy(this.mergeInsert, this));
            var _$this = this.$mergefieldWrap;
            $(window).scroll(function(){
                if (_$this.css('display') === 'block') {
                    //$('#theid').show('slow');
                    _$this.css('display','none');
                }
            });
            
            _$this.find("#remove-merge-list").click(function() {
                _$this.find("#merge_list_search").val("");
                _$this.find(".searchfields,#remove-merge-list").hide();
                _$this.find(".browsefields").show();
                _$this.find(".searchfields .searchlist li").show();
            });
            this.template.find(".header-info-plugin").on("keyup", $.proxy(this.defaultFieldHide, this));
            this.$element.find("#campaign_from_email_input").on("keyup", $.proxy(this.fromEmailDefaultFieldHide, this));
            this.$mergefieldWrap.click(function(event) {
                event.stopPropagation();
            });
        },
        /*Insertion of Merge Field on click of browse state*/
        mergeInsert:function(obj){
                var $thisDialog = this.$element;
                var $this = this.$mergefieldWrap;
                var $state = this.configs.state;
                var a = $.getObj(obj, "a"); 
                 var merge_field = a.parents("li").attr("mergeval");
                    var input_field = a.parents(".mergefields").attr("input-source");
                    if (input_field !== "campaign_subject") {
                        if (input_field == 'campaign_from_email')
                        {
                            var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                            $.each($this.find("#" + input_field + " option"), function() {
                                if (merge_field_patt.test(a.val())) {
                                    $(this).remove();
                                }
                            });
                            $("#" + input_field + "_input").val(merge_field);
                        }
                        else
                            $thisDialog.find("#" + input_field).val(merge_field);
                    }
                    else {
                        var caretPos = $thisDialog.find("#" + input_field)[0].selectionStart;
                        var textAreaTxt = $thisDialog.find("#" + input_field).val();
                        $thisDialog.find("#" + input_field).val(textAreaTxt.substring(0, caretPos) + merge_field + textAreaTxt.substring(caretPos));
                    }
                    /*Check for open Workspace or Dialog*/
                    var active_workspace = '';
                    if($state==='workspace'){
                    active_workspace = $(".ws-content.active");
                    }else if($state==='dialog'){
                        active_workspace = $(".modal-body");
                    }
                    active_workspace.find("#" + input_field + "_default").fadeIn("fast");
                    $this.hide();
            
        },
        /*Remove Child Inputs from Campaing*/
        defaultFieldHide: function(obj) {
            var input_obj = $(obj.target);
            var active_workspace = '';
            if(this.configs.state == 'workspace'){
              active_workspace = $(".ws-content.active");
            }else if(this.configs.state==='dialog'){
                active_workspace = $(".modal-body");
            }
            if (input_obj.val().indexOf("{{") == -1 && input_obj.val().indexOf("}}") == -1) {
                active_workspace.find("#" + input_obj.attr("id") + "_default").hide();
            }
        },
        /*Remove Child Inputs from Email*/
        fromEmailDefaultFieldHide:function(obj){
                    
                    var fromEmail = $.getObj(obj,"input").val();
                    var active_workspace = '';
                    if(this.configs.state==='workspace'){
                        active_workspace = $(".ws-content.active");
                    }else if(this.configs.state==='dialog'){
                         active_workspace = $(".modal-body");
                    }
                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                    
                    if($.trim(fromEmail)=="" || !merge_field_patt.test(fromEmail) || this.options.app.validateEmail(fromEmail)){
                        active_workspace.find("#campaign_from_email_default").hide();
                    }
                    else{
                       active_workspace.find("#campaign_from_email_default").show();
                    }
                },
        getOptions: function(options) {
            options = $.extend({}, $.fn.mergefields.defaults, options)
            return options
        }
        , tip: function() {
            return this.$tip = this.$tip || $(this.options.template)
        }
    }

    /* FILTER PLUGIN DEFINITION
     * ========================= */

    $.fn.mergefields = function(option) {
        return this.each(function() {
            var $this = $(this)
                    , data = $this.data('mergefields')
                    , options = typeof option == 'object' && option
            if (!data)
                $this.data('mergefields', (data = new MergeFields(this, options)))
            if (typeof option == 'string')
                data[option]()
        })
    }

    $.fn.mergefields.Constructor = MergeFields

    $.fn.mergefields.defaults = {
        template: '<div class="input-append adv_dd sort-options right step2-mergefields" id="addv_dd_merge_pulgin"><div class="inputcont" style="float:right;width:100%;" id="input-wrap-plugin"><input type="text"  style="width:100%" class="bms-input-tags" id="merge_field_plugin" placeholder="" ></div><div class="btn-group"><button tabindex="-1" data-toggle="dropdown" id="plugin-merge-dropdown" title="Use Merge Tags" class="btn dropdown-toggle open mergefields-box plugin-merge-dropdown btn-border-merge-plugin"> <span class="icon mergeicon"></span> <span class="caret"></span> </button></div></div>',
        app: null,
        addCallBack: null,
        placeholder_text: '',
        mergeFieldsCallback:null,
        config: {basicFields: true, salesForce: false, customFields: true, links: false, emailType: false},
        dialog: '<div id="merge-field-plug-wrap" class="dropdown-menu mergefields sort-options custom_popup" style="width:390px;">\
            <h2>Merge Fields<div class="input-append search"> <span class="icon list"></span>\
            <input type="text" id="merge_list_search" placeholder="Search merge fields here..." />\
            <a class="close-icon" id="remove-merge-list" style="display:none"></a>\
            <div class="btn-group">\
            <button tabindex="-1" class="searchbtn"><span class="icon-search icon-white"></span>\
            </button></div></div></h2>\
            <div class="browsefields" id="browsefields">\
           <ul class="merge-feilds-plugin-type">\
             <li id="mergefields_basic" class="group1" ><a tabindex="-1">Basic Fields</a></li>\
             <li id="mergefields_salesRep"><a tabindex="-1">Sales Rep Fields</a></li>\
             <li id="mergefields_custom"><a tabindex="-1">Custom Fields</a></li>\
             <li id="mergefields_links" ><a tabindex="-1">Links</a></li>\
           </ul>\
        <div class="search-panel" id="plugin-search-panel">\
          <div class="searchlist" id="plugin-search-list">\
          </div>\<!-- searchlist -->\
          </div><!-- search-panel -->\
      </div>\
      <div id="plugin-search-fields" class="searchfields" style="display:none;">\
          <div class="searchlist plugin-search-list">\
          </div>\
      </div>\<!-- searchfields -->\
      </div><!-- Merge-field-plug-wrap-->' // Merge-field-plug wrap
    };

}(window.jQuery);