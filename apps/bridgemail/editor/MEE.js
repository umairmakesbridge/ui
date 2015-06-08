/***
 * * Section1 - Core functionality
 * * Section2 - Intialization of funtionality and plugings
 * * Section3 - Images Library
 * * Section4 - Dynamic Variation Contents
 * * Section5 - DROPPING, DRAGGING, IMAGE CONTAINERS WORK (CORE FUNCTIONALITY)
 * * Section6 - Content Blocks
 * * Section7 - Editor Functions
 * * Section8 - Landing page Forms
 ****/

define(['jquery', 'backbone', 'underscore', 'text!editor/html/MEE.html', 'jquery-ui', 'mee-helper', 'mincolors','bms-remote'],
        function ($, Backbone, _, template) {
            'use strict';
            return Backbone.View.extend({
                events: {
                },
                initialize: function () {
                    this.app = this.options.app;                    
                    this.leftMinus = 80;
                    this.topMinus = 381;
                    this.BMSTOKEN = "BMS_REQ_TK=" + this.app.get('bms_token');
                    var mee_view = this;
                    var predefinedControls = [
                        {
                            "type": "text",
                            "html": "<div class='textcontent'>This is sample text</div>"
                        },
                        {
                            "type": "image",
                            "html": "<div class='imageContainer imagePlaceHolderAlone drapableImageContainer'>Drag image here</div>"
                        },
                        {
                            "type": "textWithImage",
                            "html": "<table class='MEE_TEXTWITHIMAGECONTENT' width='100%'><tr><td valign='top' width='50%'><div class='textcontent'>You can write text here...</div></td><td width='50%'><div class='imageContainer imagePlaceHolderAlone drapableImageContainer'>Drag image here</div></td></tr></table></div>"
                        },
                        {
                            "type": "imageWithText",
                            "html": "<table class='MEE_IMAGEWITHTEXTCONTENT' width='100%'><tr><td width='50%'><div class='imageContainer imagePlaceHolderAlone drapableImageContainer'>Drag image here</div></td><td valign='top' width='50%'><div class='textcontent'>You can write text here...</div></td></tr></table></div>"
                        },
                        {
                            "type": "signupForm",
                            "html": "<div class='formPlaceHolderAlone MEEFORMCONTAINER'> </div>"
                        },
                        {
                            "type": "spacer5",
                            "html": '<div style=\'height:5px\' class=\'spacer-ele\'><table class="fullCenter" align="center" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size: 1px; line-height: 1px;" height="5">&nbsp;</td></tr></table></div>'
                        },
                        {
                            "type": "spacer10",
                            "html": '<div style=\'height:10px\' class=\'spacer-ele\'><table class="fullCenter" align="center" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size: 1px; line-height: 1px;" height="10">&nbsp;</td></tr></table></div>'
                        },
                        {
                            "type": "spacer15",
                            "html": '<div style=\'height:15px\' class=\'spacer-ele\'><table class="fullCenter" align="center" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size: 1px; line-height: 1px;" height="15">&nbsp;</td></tr></table></div>'
                        },
                        {
                            "type": "spacer20",
                            "html": '<div style=\'height:20px\' class=\'spacer-ele\'><table class="fullCenter" align="center" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td style="font-size: 1px; line-height: 1px;" height="20">&nbsp;</td></tr></table></div>'
                        },
                        {
                            "type": "oneColumnContainer",
                            "html": "<table class='MEE_CONTAINER container' width='100%'><tr><td><ul class='sortable' style='list-style: none;'></ul></td></tr></table>"
                        },
                        {
                            "type": "twoColumnContainer",
                            "html": "<table class='MEE_CONTAINER container' width='100%'><tr><td><ul class='sortable' style='list-style: none; '></ul></td><td><ul class='sortable' style='list-style: none;'></ul></td></tr></table>"
                        },
                        {
                            "type": "threeColumnContainer",
                            "html": "<table class='MEE_CONTAINER container' width='100%'><tr><td><ul class='sortable' style='list-style: none;'></ul></td><td><ul class='sortable' style='list-style: none;'></ul></td><td><ul class='sortable' style='list-style: none; '></ul></td></tr></table>"
                        },
                        {
                            "type": "fourColumnContainer",
                            "html": "<table class='MEE_CONTAINER container' width='100%'><tr><td><ul class='sortable' style='list-style: none;'></ul></td><td><ul class='sortable' style='list-style: none;'></ul></td><td><ul class='sortable' style='list-style: none; '></ul></td><td><ul class='sortable' style='list-style: none; '></ul></td></tr></table>"
                        },
                        {
                            "type": "dynamicContentContainer",
                            "html": "<table class='MEE_DYNAMICCONTENTCONTAINER container dynamicContentContainer'><tr><td><div id='basic' class='well main_blocker' style='max-width:44em;'><div class='block_head'><input type='text' class='txtVariationName' name='content_name' placeholder='Name Dynamic Variation' /> <input type='button' class='dcSaveButton' value='Save' />&nbsp;<img src='images/ico-edit1.png' /></div><div class='block_body'><div class='block_controls'><img class='addDynamicRule' src='images/add-btn.png' style='float: left';/><ul class='dcContents'></ul></div></div></td></tr><tr><td><ul class='sortable dcInternalContents' style='list-style: none;'></ul></td></tr></table>"
                        }
                    ];
                    if ($("body").MakeBridgeEditor) {
                        this.render();
                        return;
                    }                                      
                    
                    $.fn.extend({
                        MakeBridgeEditor: function (options) {

                            var MakeBridgeUndoRedoManager = function (opts) {

                                var undoRedoIndex = -1;
                                var undoRedoStack = new Array();
                                var isRedoEnable = false;
                                var isUndoPerformed = false;
                                var _view = opts.view;

                                this.registerAction = MakeBridgeUndoRedoManager_RegisterAction;
                                this._undo = MakeBridgeUndoRedoManager_Undo;
                                this._redo = MakeBridgeUndoRedoManager_Redo;

                                function MakeBridgeUndoRedoManager_RegisterAction(obj) { // Save HTML before performing any action

                                    if (isUndoPerformed) { // While performing undo redo if any new action performed then clear the stack
                                        var initObj = undoRedoStack[undoRedoIndex];
                                        var size = undoRedoStack.length;
                                        var counter = size - (undoRedoIndex + 1);
                                        for (var i = 0; i < counter; i++) {
                                            undoRedoStack.pop();
                                        }
                                        isUndoPerformed = false;
                                    }
                                    console.log("Register action=" + undoRedoStack.length + "--Index=" + undoRedoIndex);
                                    if (undoRedoStack.length == 0) {
                                        _view.find(".undo_li a.btn-gray").addClass("disabled");
                                        _view.find(".redo_li a.btn-gray").addClass("disabled");
                                    }
                                    else if (undoRedoStack.length == 1) {
                                        _view.find(".undo_li a.btn-gray").removeClass("disabled");
                                        _view.find(".redo_li a.btn-gray").addClass("disabled");
                                    }

                                    UndoStackPush(obj);
                                }

                                function MakeBridgeUndoRedoManager_Undo() { // On press undo return previous index saved html
                                    var myObj = UndoStackPop();
                                    return myObj;
                                }

                                function UndoStackPush(obj) {
                                    if (undoRedoIndex >= -1) {
                                        undoRedoIndex++;
                                        undoRedoStack[undoRedoIndex] = obj;
                                    }

                                }
                                function UndoStackPop() {

                                    if (undoRedoIndex >= 0) {
                                        isUndoPerformed = true;
                                        undoRedoIndex--;
                                        console.log("undo action=" + undoRedoStack.length + "--Index=" + undoRedoIndex);
                                        if (undoRedoStack.length > 1 && undoRedoIndex == 0) {
                                            _view.find(".undo_li a.btn-gray").addClass("disabled");
                                            _view.find(".redo_li a.btn-gray").removeClass("disabled");
                                        }
                                        else {
                                            _view.find(".undo_li a.btn-gray").removeClass("disabled");
                                            _view.find(".redo_li a.btn-gray").removeClass("disabled");
                                        }
                                        var obj = undoRedoStack[undoRedoIndex];
                                        return obj;
                                    } else {
                                        return null;
                                    }
                                }

                                function MakeBridgeUndoRedoManager_Redo() { // on Press Redu increase index and send the stack Element

                                    if (isUndoPerformed && undoRedoStack.length > (undoRedoIndex + 1)) {
                                        undoRedoIndex++;
                                        console.log("Redo action=" + undoRedoStack.length + "--Index=" + undoRedoIndex);
                                        if (undoRedoIndex < undoRedoStack.length - 1) {
                                            _view.find(".undo_li a.btn-gray").removeClass("disabled");
                                            _view.find(".redo_li a.btn-gray").removeClass("disabled");
                                        }
                                        else {
                                            _view.find(".undo_li a.btn-gray").removeClass("disabled");
                                            _view.find(".redo_li a.btn-gray").addClass("disabled");
                                        }
                                        return undoRedoStack[undoRedoIndex];
                                    }
                                    else {
                                        return null;
                                    }
                                }
                            }
                            var mee = this;
                            mee.iframeLoaded = false;
                            this.each(function () {
                                var $this = $(this);
                                var undoManager = new MakeBridgeUndoRedoManager({
                                    view: $this
                                });

                                //Getting View with the help of Backbone:
                                var MainHtmlView = Backbone.View.extend({
                                    my_template: _.template(template),
                                    //el:'#myTags',
                                    initialize: function () {
                                        this.render();
                                    },
                                    render: function () {
                                        
                                        this.$el.html(this.my_template({allowedUser: ['admin', 'jayadams', 'demo'], options: options}));
                                        this.$("#mee-iframe").load(function () {
                                            mee.iframeLoaded = true;    
                                            $this.find("#mee-iframe").contents().find("body").mouseover(_.bind(mee.setScrollHeight,mee));                                            
                                        })
                                        
                                    }

                                });

                                var mainView = new MainHtmlView();


                                //$this = element;
                                $this.html(mainView.el);
                                var myElement = $this;
 
                                var meeIframe = myElement.find("#mee-iframe").contents();
                                var meeIframeWindow = myElement.find("#mee-iframe")[0].contentWindow;
                                var oInitDestroyEvents = new InitializeAndDestroyEvents();
                                var IsStyleActivated = false;
                                var changFlag = null;
                                var SelectedElementForStyle = null;
                                var borderColor = "#000";
                                var chkChangeAllMatching = myElement.find(".chkChangeAllMatching");
                                var templateColors = myElement.find(".templateColors");
                                var mainContentHtmlGrand = meeIframe.find(".mainContentHtmlGrand");
                                var myColorsFromServiceGlobal = "";
                                var txtColorCode = myElement.find(".txtColorCode");
                                var ulMyColors = myElement.find(".myColors");
                                var personalizedTagsGlobal = new Array();var customTagsGlobal = new Array();var linksTagsGlobal = new Array();var basicTagsGlobal=new Array();
                                var formBlocksGlobal = "";
                                var topPlus = options.topPlus;
                                var leftPlus = options.leftPlus;
                                var $element = null;
                                var emailWidth = options.landingPage? "100%":"600px";                              
                                var pageBackgroundColor = "#fff";
                                var undoredo = true;
                                var _offset = 0;
                                var forms_offset = 0;
                                var searchFormTxt = "";
                                var tiny_editor_selection = null;
                                var showStyle = false;

                                var dialogForTextColor = true;
                                var selectedLinkFromTinyMCE = null;
                                var imageListGlobal = [];
                                var returnData = null;
                                var eventsApplied = false;
                                var borderLeftWidth, borderRightWidth, borderTopWidth, borderBottomWidth, TotalBorderTopBottom, TotalBorderLeftRight;
                                var defaultLiContentForDC = $("<li class='right defaultLi active'><span>Default</span></li>");
                                var iframeEle = myElement.find(".mee-iframe");



//*****************************************Core functionality***********************************************************************************/// Section1

                                if (options.preDefinedHTML != null && options.preDefinedHTML != "") {

                                    var oHtml = new Object();
                                    var args = new Object();

                                    if (options.preDefinedHTML == "TEMPLATE") {
                                        options.LoadTemplate(args);
                                        var templateHtml = args.HTMLTEXT;
                                        var templateObj = $(templateHtml);
                                        options.preDefinedHTML = templateHtml;
                                    }


                                    oHtml = $(options.preDefinedHTML);

                                    var isMEEDoc = false;
                                    oHtml.filter(function () {
                                        return this.nodeType == 8;
                                    }).each(function (i, e) {
                                        if (e.nodeValue.trim() == "MEE_DOCUMENT") {
                                            isMEEDoc = true;
                                        }
                                    })

                                    if (isMEEDoc) {

                                        oHtml = reConstructCode(options.preDefinedHTML);

                                        oInitDestroyEvents.InitAll(oHtml);

                                        var mainObj = meeIframe.find(".mainContentHtml");
                                        oInitDestroyEvents.InitAll(mainObj);

                                        mainObj.append(oHtml);
                                        IsStyleActivated = false;
                                        oInitDestroyEvents.InitAll(mainObj);

                                    }

                                }

                                function makeCloneAndRegister() {
                                    var mainTable = meeIframe.find(".mainTable").clone(true);
                                    mainTable.find("div.ui-resizable-e").remove();
                                    mainTable.find("div.ui-resizable-s").remove();
                                    mainTable.find("div.ui-resizable-se").remove();
                                    mainTable.find("div.textcontent").removeClass('mce-content-body');                                    
                                    undoManager.registerAction(mainTable);
                                     mee.resizeHeight();
                                    
                                    return false;
                                }
                                mee.setScrollHeight = function(){                                    
                                    if($(meeIframeWindow).height()<$(meeIframeWindow.document).height()){
                                        this.resizeHeight();
                                    }
                                }
                                mee.resizeHeight = function() {
                                    var ul_container = meeIframe.find(".mainContentHtml");
                                    var main_container = myElement.find(".editorbox");
                                    if (ul_container.height() > ($(".tabcontent").height() - 100)) {
                                        main_container.css("height", (ul_container.height() + 200) + "px");
                                        iframeEle.css("height", (ul_container.height() + 200) + "px");
                                    }
                                    else {
                                        main_container.css("height", $(".tabcontent").height() + "px");
                                        iframeEle.css("height", $(".tabcontent").height() + "px");
                                    }
                                }

                                //Bind Undo redo Functionality 
                                myElement.find(".undo_li").click(function () {
                                    if ($(this).find("a").hasClass("disabled")) {
                                        return false;
                                    }
                                    var replaceObj = undoManager._undo();
                                    if (replaceObj != null) {
                                        var contentObj = meeIframe.find("body");
                                        contentObj.html(replaceObj.outerHTML());
                                        var mainObj = meeIframe.find(".mainTable");
                                        mainObj.find("div.textcontent").css('visibility', 'visible');
                                        oInitDestroyEvents.InitAll(mainObj, true);
                                        undoredo = true;
                                        if (myElement.find(".style-tab").hasClass("active")) {
                                            InitializeElementsForStyle(true);
                                        }
                                        else {
                                            RemoveAllOutline();
                                            var editorfocused = meeIframe.find("div.textcontent.mce-edit-focus");
                                            if (editorfocused.length) {
                                                meeIframeWindow.tinymce.get(editorfocused.attr("id")).focus();
                                            }
                                        }
                                         mee.resizeHeight();
                                    }
                                });
                                myElement.find(".redo_li").click(function () {
                                    if ($(this).find("a").hasClass("disabled")) {
                                        return false;
                                    }
                                    var replaceObj = undoManager._redo();
                                    if (replaceObj != null) {
                                        var contentObj = meeIframe.find("body");
                                        contentObj.html(replaceObj.outerHTML());
                                        var mainObj = meeIframe.find(".mainTable");
                                        mainObj.find("div.textcontent").css('visibility', 'visible');
                                        oInitDestroyEvents.InitAll(mainObj, true);
                                        undoredo = true;
                                        if (myElement.find(".style-tab").hasClass("active")) {
                                            InitializeElementsForStyle(true);
                                        }
                                        else {
                                            RemoveAllOutline();
                                            var editorfocused = meeIframe.find("div.textcontent.mce-edit-focus");
                                            if (editorfocused.length) {
                                                meeIframeWindow.tinymce.get(editorfocused.attr("id")).focus();
                                            }
                                        }
                                         mee.resizeHeight();

                                    }
                                });
                                function setIFrameElements() {
                                    meeIframeWindow = myElement.find("#mee-iframe")[0].contentWindow;
                                    mainContentHtmlGrand = meeIframe.find(".mainContentHtmlGrand");
                                    removeDialogs();    
                                    mainContentHtmlGrand.mouseup(function () {
                                        if(changFlag){
                                            changFlag.editor_change = true;
                                        }
                                    })
                                    //*****************************************Landing page options***********************************************************************************///
                                    if (options.landingPage) {
                                        iframeEle.css("width", "100%");
                                        meeIframe.find(".mainTable").addClass("landingpage");
                                    }
                                   //*****************************************End of landing pages***********************************************************************************///
                                }

                                $.fn.setChange = function (states) {
                                    changFlag = states;
                                };
                                
                                $.fn.getMEEBody = function(){
                                    var mainHTMLELE = this.find("#mee-iframe").contents().find(".mainContentHtml");
                                    var constructedHTML = $(mainHTMLELE.outerHTML());                                    
                                    return CleanCode(constructedHTML).html();
                                }

                                $.fn.getMEEHTML = function () {
                                    var mainHTMLELE = this.find("#mee-iframe").contents().find(".mainContentHtml");
                                    mainHTMLELE.find(".bgimage").each(function(){
                                        $(this).attr("mee-style",$(this).attr("style"));
                                        $(this).removeAttr("style");
                                    });
                                    var constructedHTML = $(mainHTMLELE.outerHTML());
                                    var cleanedCode = CleanCode(constructedHTML);
                                    
                                    var cleanedupHTML =  mee.encodeSpecialHTML(cleanedCode.html());
                                    mainHTMLELE.find(".bgimage").each(function(){
                                        $(this).attr("style",$(this).attr("mee-style"));
                                        $(this).removeAttr("mee-style");
                                    });
                                    var outputHTML = "<table style='width:" + emailWidth + "' align='center' class='table600' width='"+parseFloat(emailWidth)+"' ><tr><td  data-bgcolor='"+pageBackgroundColor+"' style='width: 100%;' width='"+parseFloat(emailWidth)+"' id='__OUTERTD'><!-- MEE_DOCUMENT --><div>"+cleanedupHTML+"</div></td></tr></table>"
                                    
                                    var header_section = this.find("#mee-iframe").contents().find("head").clone()
                                    header_section.find(".system").remove();
                                    header_section.find("link").remove();
                                    outputHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html lang="en"><head>'+header_section.html()+"</head><body style='background-color:"+pageBackgroundColor+"'>"+outputHTML+"</body></html>";                                    
                                    
                                     //"" + outputter.outerHTML();
                                    return outputHTML;
                                };


                                $.fn.setMEEHTML = function (html) {
                                    var htmlOBJ = $(html);
                                    var outerTD = htmlOBJ.find("#__OUTERTD");
                                    var innerHTML = outerTD.length? $.trim(outerTD.html()) : html;
                                    //get background color of body
                                    pageBackgroundColor = outerTD.length ?outerTD.attr("data-bgColor"):"#fff"; 
                                    emailWidth = options.landingPage? "100%":outerTD.attr("width");
                                    if(!emailWidth){
                                        var mainTable = this.find("#mee-iframe").contents().find(".mainTable");
                                        emailWidth = parseFloat(mainTable.css("width"));
                                    }
                                    options.preDefinedHTML = innerHTML;
                                    oHtml = reConstructCode(options.preDefinedHTML);                                                                                                        
                                    mee.setHTML();                                    
                                };
                                
                                mee.encodeSpecialHTML = function(str){
                                    str = str.replace(/mee-style=/g, "style=");
                                    str = str.replace(/\‘/g,"&#8216;");
                                    str = str.replace(/\’/g,"&#8217;");
                                    str = str.replace(/\“/g,"&#8220;");
                                    str = str.replace(/\”/g,"&#8221;");
                                    str = str.replace(/\„/g,"&#8222;");
                                    str = str.replace(/\€/g,"&#8364;");
                                    str = str.replace(/\™/g,"&#8482;");
                                    str = str.replace(/\–/g,"&#8208;");
                                    str = str.replace(/\​/,"");
                                    return str;
                                }
                                
                                mee.setHTML =  function(){
                                    if(myElement.find("#mee-iframe").contents().find(".mainContentHtml").length){
                                        meeIframe = myElement.find("#mee-iframe").contents();
                                        setIFrameElements();
                                        var mainObj = meeIframe.find(".mainContentHtml");
                                        var htmlOBJ = $(oHtml);
                                        var innerHTML = htmlOBJ.find("#__OUTERTD").length? htmlOBJ.find("#__OUTERTD").html() : oHtml;
                                        //Set background color of body
                                        if(pageBackgroundColor){
                                            meeIframe.find("body").css("background-color",pageBackgroundColor);
                                        }
                                        meeIframe.find(".mainTable").css("width",emailWidth+"px");
                                        mainObj.html(innerHTML);                          
                                        if(!options.landingPage && emailWidth){
                                            myElement.find(".email-width input.btnContainerSize").removeClass("active");
                                            if( myElement.find(".email-width input.btnContainerSize#"+emailWidth).length ){                                            
                                                myElement.find(".email-width input.btnContainerSize#"+emailWidth).addClass("active");
                                            }
                                            else{
                                                 myElement.find(".email-width input.txtContSize").val(emailWidth)
                                            }
                                        }
                                        IsStyleActivated = false;
                                         mee.checkForm();
                                        oInitDestroyEvents.InitAll(mainObj);
                                        makeCloneAndRegister();
                                    }
                                    else {
                                        setTimeout(_.bind(mee.setHTML,mee),200);
                                    }
                                }
                                
                                mee.checkForm = function(){
                                    if(!options.landingPage)return false;
                                    meeIframe = myElement.find("#mee-iframe").contents();
                                    if(meeIframe.find(".MEEFORMCONTAINER").length){
                                        myElement.find("[data-type='signupForm']").addClass("disabled").attr("draggable",false);   
                                    }
                                    else{
                                        myElement.find("[data-type='signupForm']").removeClass("disabled").attr("draggable",true);   
                                    }
                                }

                                $.fn.getIframeStatus = function () {
                                    return mee.iframeLoaded;
                                }
                                
                                $.fn.seFormIdForPages = function (id) {
                                   options.formCallBack(id);
                                }

                                $.fn.setAccordian = function (diff) {
                                    this.find(".builder-panel").css("height", ($(window).height() - 62 - diff) + "px");
                                    this.find(".style-panel").css("height", ($(window).height() - 62 - diff) + "px");
                                    if (this.find(".style-panel").css("display") !== "none") {
                                        this.find(".style-panel .accordian").accordion("refresh");
                                        this.find(".style-panel").css("height", (this.find(".style-panel").height() + 12) + "px");
                                    }
                                    else {
                                        this.find(".builder-panel .accordian").accordion("refresh");
                                        this.find(".builder-panel").css("height", (this.find(".style-panel").height() + 12) + "px");
                                    }
                                };
                                function setHTML(dialog) {
                                    myElement.setMEEHTML(dialog.getBody().find(".divHtmlCode").val().replace(/\n/g, ""));
                                    if (options.fromDialog) {
                                        dialog.showPrevious();
                                    }
                                    else {
                                        dialog.hide();
                                    }
                                }
                                function removeDialogs() {
                                    meeIframe.find("body").click(function () {
                                        if (!isElementClicked) {
                                            //Sohaib 
                                            RemovePopups();
                                            myElement.find(".alertButtons").hide();
                                        }
                                        isElementClicked = false;

                                    });
                                }
                                //--------------------- Code Preview ---------------------------//

                                function InitializePreviewControls() {
                                    var lnkPreviewCode = myElement.find(".MenuCallPreview");
                                    var lnkTextVersion = myElement.find(".MenuCallTextVersion");
                                    var lnkDCItems = myElement.find(".MenuCallDCItems");    
                                    var divPreviewCode = myElement.find(".divPreviewCode");

                                    //previeCodeTabs.tabs();

                                    lnkPreviewCode.click(function () {
                                        var mainHTMLELE = meeIframe.find(".mainContentHtml");
                                        mainHTMLELE.find(".bgimage").each(function(){
                                            $(this).attr("mee-style",$(this).attr("style"));
                                            $(this).removeAttr("style");
                                        });
                                        var constructedHTML = $(mainHTMLELE.outerHTML());

                                        var cleanedupHTML = mee.encodeSpecialHTML(CleanCode(constructedHTML).html());

                                        var outputter = $("<div style='margin:0px auto;width:" + emailWidth + "'></div>");
                                        outputter.wrapInner(cleanedupHTML);

                                        var outputHTML = "<!-- MEE_DOCUMENT -->" + outputter.outerHTML();
                                        var dialog_width = $(document.documentElement).width() - 60;
                                        var dialog_height = $(document.documentElement).height() - 182;
                                        var dialog = options._app.showDialog({
                                            title: 'Code Preview',
                                            css: {
                                                "width": dialog_width + "px",
                                                "margin-left": "-" + (dialog_width / 2) + "px",
                                                "top": "20px"
                                            },
                                            bodyCss: {
                                                "min-height": dialog_height + "px"
                                            },
                                            headerEditable: false,
                                            headerIcon: 'dlgpreview',
                                            buttons: {
                                                saveBtn: {
                                                    text: 'Set'
                                                }
                                            }
                                        });
                                        var preview_html = '<div class="divPreviewCode"><ul  class="mapTab tabs-btns clearfix">';
                                        preview_html += '<li class="active"><a href="#preview" data-toggle="tab">Preview</a></li>';
                                        preview_html += '<li><a href="#htmlCode" data-toggle="tab">Html Code</a></li></ul>';
                                        preview_html += '<div class="tab-content" style="padding:0px"><div id="preview" class="tab-pane active">';
                                        preview_html += '<div class="divHtmlPreview"><iframe id="preview_iframe" frameborder="0" src="about:blank" style="width:100%;height:' + (dialog_height - 48) + 'px;"></iframe></div></div>';
                                        preview_html += '<div id="htmlCode" class="tab-pane">';
                                        preview_html += '<textarea style="font-size:12px;width:' + (dialog_width - 46) + 'px;height:' + (dialog_height - 58) + 'px;margin-bottom:0px;border:0px;" class="divHtmlCode" cols="1000" rows="250"></textarea>';
                                        preview_html += '</div></div></div>';
                                        preview_html = $(preview_html);
                                        dialog.getBody().append(preview_html);
                                        dialog.saveCallBack(_.bind(setHTML, this, dialog));

                                        if (options.fromDialog) {
                                            var dialogArrayLength = options._app.dialogArray.length; // New Dialog
                                            dialog.getBody().find(".divPreviewCode").addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].currentView = preview_html; // New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(setHTML, this, dialog); // New Dialog
                                            preview_html.ReattachEvents = options.reAttachEvents;
                                            dialog.getBody().find(".tabs-btn li").click(function () {
                                                var obj = $(this);
                                                if (obj.hasClass("active") == false) {
                                                    var clicked_tab = obj.find("a").attr("href");
                                                    obj.parent("ul").next().find("div.tab-pane").removeClass("active");
                                                    obj.parent("ul").next().find("div" + clicked_tab).addClass("active");

                                                }
                                            });
                                        }

                                        var content = '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"><html lang="en">';                                        
                                        content += '<head><title></title></head><body>'
                                        content += outputHTML
                                        content += '</body>'
                                        content += '</html>'
                                        var iframe = dialog.getBody().find("#preview_iframe")[0].contentDocument;
                                        iframe.open();
                                        iframe.write(content);
                                        iframe.close();
                                        dialog.getBody().find(".divHtmlCode").val(outputHTML);

                                    });
                                    
                                    lnkTextVersion.click(function () {
                                        
                                        var dialog_width = $(document.documentElement).width() - 60;
                                        var dialog_height = $(document.documentElement).height() - 182;
                                        var dialog = options._app.showDialog({
                                            title: 'Create Text version',
                                            css: {
                                                "width": dialog_width + "px",
                                                "margin-left": "-" + (dialog_width / 2) + "px",
                                                "top": "20px"
                                            },
                                            bodyCss: {
                                                "min-height": dialog_height + "px"
                                            },
                                            headerEditable: false,
                                            headerIcon: 'textversion',
                                            buttons: {
                                                saveBtn: {
                                                    text: 'Save Text Version'
                                                }
                                            }
                                        });
                                        var preview_html = '<div class="divTextVersion">';                                        
                                        preview_html += '<textarea style="font-size:12px;width:' + (dialog_width - 46) + 'px;height:' + (dialog_height - 28) + 'px;margin-bottom:0px;border:2px solid #eaf4f9" class="divHtmlCode" cols="1000" rows="250" placeholder="Enter text version....">'+options.textVersion+'</textarea>';
                                        preview_html += '</div>';
                                        preview_html = $(preview_html);
                                        dialog.getBody().append(preview_html);
                                        dialog.saveCallBack(_.bind(function(obj){
                                            options.textVersion = preview_html.find("textarea").val();
                                            options.saveTextVersionCallBack(preview_html.find("textarea").val());
                                            if (options.fromDialog) {
                                                dialog.showPrevious();
                                            }
                                            else {
                                                dialog.hide();
                                            }
                                        }, this, dialog));

                                        if (options.fromDialog) {
                                            var dialogArrayLength = options._app.dialogArray.length; // New Dialog
                                            dialog.getBody().find(".divTextVersion").addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].currentView = preview_html; // New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(setHTML, this, dialog); // New Dialog
                                            preview_html.ReattachEvents = options.reAttachEvents;
                                            
                                        }
                                        

                                    });
                                    
                                    lnkDCItems.click(function(){
                                        var dialog_width = $(document.documentElement).width() - 60;
                                        var dialog_height = $(document.documentElement).height() - 182;
                                        var dialog = options._app.showDialog({
                                            title: 'Dynamic Content Items',
                                            css: {
                                                "width": dialog_width + "px",
                                                "margin-left": "-" + (dialog_width / 2) + "px",
                                                "top": "20px"
                                            },
                                            bodyCss: {
                                                "min-height": dialog_height + "px"
                                            },
                                            headerEditable: false                                            
                                            
                                        });
                                        var URL = "/pms/publisher/dyFrame.jsp?BMS_REQ_TK="+options._app.get('bms_token')+"&fromNewUI=true";
                                        var iframHTML = "<iframe src=\""+URL+"\"  width=\"100%\" class=\"dcItemsIframe\" frameborder=\"0\" style=\"height:"+(dialog_height-7)+"px\"></iframe>"
                                        dialog.getBody().html(iframHTML);
                                    });

                                }
                                ;



                                function reConstructCode(html) {
                                    var oHtml = $(html);

                                    oHtml.find(".MEE_DROPPABLE").addClass("myDroppable ui-draggable ui-droppable").removeClass("MEE_DROPPABLE").css("display", "none");
                                    oHtml.find(".MEE_ELEMENT").addClass("csHaveData ui-draggable ui-droppable").removeClass("MEE_ELEMENT");
                                    oHtml.find(".MEE_CONTAINER").addClass("container").removeClass("MEE_CONTAINER");

                                    var RevertCommonLi = function (element) {

                                        var newElement = $("<li>");
                                        newElement.html(element.html());


                                        //Assign Class
                                        var elementClass = element.attr("class");
                                        if (elementClass != null) {
                                            newElement.attr("class", elementClass);
                                        }

                                        //Assign Style
                                        var elementStyle = element.attr("style");
                                        if (elementStyle != null) {
                                            newElement.attr("style", elementStyle);
                                        }

                                        element.replaceWith(newElement);
                                    }

                                    var RevertCommonUl = function (element) {

                                        var newElement = $("<ul>");
                                        newElement.html(element.html());


                                        //Assign Class
                                        var elementClass = element.attr("class");
                                        if (elementClass != null) {
                                            newElement.attr("class", elementClass);
                                        }

                                        //Assign Style
                                        var elementStyle = element.attr("style");
                                        if (elementStyle != null) {
                                            newElement.attr("style", elementStyle);
                                        }
                                        element.replaceWith(newElement);
                                    }

                                    oHtml.find(".MEE_ITEM").each(function (i, e) {
                                        var elem = $(e);

                                        if (elem.find("img").length) {
                                            var alignVal = elem.attr("align");
                                            if (alignVal == undefined) {
                                                alignVal = "left";
                                            }
                                            var imageElem = elem.find("img");
                                            elem.addClass("drapableImageContainer").removeClass("MEE_ITEM");
                                            imageElem.addClass("imageHandlingClass  resizable clickEvent");
                                            var imgHeight = imageElem.inlineStyle("height");
                                            var imgWidth = imageElem.inlineStyle("width");                                            

                                            var _containerStyle = elem.attr("style") ? elem.attr("style") : "float:none";
                                            var _imageStyle = imageElem.attr("isStyleSet") ? imageElem.attr("style") : "height:" + imgHeight + ";width:" + imgWidth;
                                            elem.removeAttr("style");                                            

                                            var imgOutHtml = "";
                                            if (imageElem.parent().get(0).tagName == 'a' || imageElem.parent().get(0).tagName == 'A') {

                                                imgOutHtml = imageElem.parent().outerHTML();
                                            }
                                            else {
                                                imgOutHtml = imageElem.outerHTML();
                                            }


                                            var newHtml = "<div class='myImage' style='" + _containerStyle + "' align='" + alignVal + "'><div class='resizableImage' style='" + _imageStyle + "'>" + imgOutHtml + "</div></div>";
                                            elem.html(newHtml);
                                            elem.find(".resizableImage").css({
                                                "width": imgWidth,
                                                "height": imgHeight
                                            });

                                        }
                                        else {
                                            elem.removeClass("MEE_ITEM").addClass("textcontent");
                                            elem.html(newHtml);
                                        }

                                    });

                                    oHtml.find(".container > tbody > tr > td").each(function (index, element) {
                                        var elem = $(element);
                                        var html = elem.html();
                                        var newHtml = "<div class='csHaveData ui-draggable ui-droppable'>" + html + "</div>";
                                        elem.html(newHtml);

                                    });

                                    oHtml.find("div.sortable").not(".container").each(function () {
                                        RevertCommonUl($(this));
                                    });

                                    oHtml.find(".csHaveData").each(function () {
                                        RevertCommonLi($(this));
                                    });

                                    oHtml.find(".myDroppable").each(function () {
                                        RevertCommonLi($(this));
                                    });
                                    
                                    oHtml.find(".MEEFORMCONTAINER").each(function () {
                                        if($(this).find("iframe").length){
                                            $(this).append("<div class='editformpanel'><span class='edit-form'><div>Edit Form</div><button data-formid='"+options.formid+"'>Form Wizard</button></span> <div class='drop-here'>Drop Form here</div></div>")
                                            
                                        }
                                    });

                                    oHtml.find("table").each(function () {
                                        oHtml.find(".container .sortable .csHaveData").each(function () {
                                            RevertCommonLi($(this));
                                        });
                                        oHtml.find(".container .sortable .myDroppable").each(function () {
                                            RevertCommonLi($(this));
                                        });
                                    });

                                    var lengthHTML = oHtml.length;

                                    if (lengthHTML > 1) {
                                        for (var i = 1; i < lengthHTML; i++) {
                                            var obj = $(oHtml[i]);

                                            if (obj[0].nodeName == "DIV") {

                                                if (obj.children().length > 1) {
                                                    var ht = obj.html();
                                                    oHtml = $(ht);
                                                }
                                                else {
                                                    var ht = obj.html();
                                                    var newHtml = $("<li class='csHaveData ui-draggable ui-droppable'></li>");
                                                    newHtml.append(obj);
                                                    oHtml = $(newHtml);
                                                }

                                            }

                                            if (obj[0].nodeName == "TABLE") {
                                                var ht = obj.html();
                                                var newHtml = $("<li class='csHaveData ui-draggable ui-droppable'></li>");
                                                newHtml.append(obj);
                                                oHtml = $(newHtml);
                                            }
                                        }

                                    }


                                    oHtml.find(".DYNAMIC_VARIATION").each(function (index, object) {
                                        var variation = $(object);
                                        var variation_ID = variation.attr("id");
                                        var keyword = variation.text();
                                        variation.removeClass("DYNAMIC_VARIATION");
                                        variation.addClass("dynamicContentContainer");
                                        variation.addClass("container");
                                        var oControl = new Object();
                                        var args = {
                                            droppedElement: $(this),
                                            // event: event,
                                            // ui: ui,
                                            predefinedControl: null,
                                            buildingBlock: null
                                        };
                                        var predefinedControl = myElement.find(".divDCTemplate").html();
                                        // variation = $(predefinedControl);
                                        // oControl.Html = variation;
                                        oControl.Html = $(predefinedControl);
                                        oControl.Type = predefinedControl.type;
                                        args.predefinedControl = oControl;

                                        args.droppedElement.html(oControl.Html);

                                        args.ID = keyword;
                                        args.DynamicVariation = loadDynamicVariationFromServer(args.ID);
                                        InitializeDynamicControl(args);
                                        variation.replaceWith(args.predefinedControl.Html.clone(true, true));
                                    });                                   
                                    return oHtml;
                                }

                                function CleanCode(html) {

                                    var oHtml = $(html);
                                    oHtml.find("[data-mce-type='bookmark']").remove();
                                    oHtml.find(".myDroppable").removeClass("myDroppable ui-draggable ui-droppable").addClass("MEE_DROPPABLE").removeInlineStyle("display");
                                    oHtml.find(".csHaveData").removeClass("csHaveData ui-draggable ui-droppable").addClass("MEE_ELEMENT");
                                    oHtml.find(".mainContentHtmlGrand").removeClass("mainContentHtmlGrand").addClass("MEE_DOCUMENT_CONTENTS");
                                    oHtml.find(".mainContentHtml").removeClass("mainContentHtml sortable").addClass("MEE_CONTENTS");

                                    oHtml.find(".textcontent").removeAttr("id");
                                    oHtml.find(".textcontent").removeAttr("tabindex");
                                    oHtml.find(".textcontent").removeAttr("contenteditable");
                                    oHtml.find(".textcontent").removeAttr("spellcheck");

                                    oHtml.find(".MEEFORMCONTAINER .editformpanel").remove();
                                    oHtml.find("div.ui-resizable-e").remove();
                                    oHtml.find("div.ui-resizable-s").remove();
                                    oHtml.find("div.ui-resizable-se").remove();

                                    oHtml.find(".space").removeInlineStyle("background");
                                    oHtml.find("*").removeInlineStyle("outline");

                                    //oHtml.find(".drapableImageContainer").addClass("MEE_ITEM").removeClass("drapableImageContainer");
                                    oHtml.find(".drapableImageContainer").each(function (index, object) {
                                        var imageContainer = $(object);
                                        var img = imageContainer.find("img");
                                        var resizableImg = imageContainer.find(".resizableImage");
                                        var myImage = imageContainer.find(".myImage");
                                        if (img.length) {
                                            img.attr("width", parseInt(resizableImg.inlineStyle("width")));
                                            img.attr("height", parseInt(resizableImg.inlineStyle("height")));
                                            img.css("width", resizableImg.inlineStyle("width"));
                                            img.css("height", resizableImg.inlineStyle("height"));
                                            img.attr("border", 0);
                                            var imgStyle = resizableImg.attr("style");
                                            if (imgStyle) {
                                                img.attr("isStyleSet", "true");                                                                                                
                                                if(imgStyle.substring(imgStyle.length-1)==";"){
                                                    img.attr("style",imgStyle + "border:0;margin:0px;padding:0px;");
                                                }
                                                else{
                                                    img.attr("style",imgStyle + ";border:0;margin:0px;padding:0px;");
                                                }
                                            }
                                            else {
                                                img.removeAttr("isStyleSet");
                                            }
                                            img.removeClass("imageHandlingClass resizable clickEvent ui-resizable").addClass("img");

                                            if (img.parent().get(0).tagName == 'a' || img.parent().get(0).tagName == 'A') {
                                                imageContainer.html(img.parent().outerHTML());
                                            }
                                            else {
                                                imageContainer.html(img.outerHTML());
                                            }
                                            var anchorTag = imageContainer.find("a")
                                            if(anchorTag.length>0){
                                                if(anchorTag.attr("onclick")=="return false;"){
                                                    anchorTag.removeAttr("onclick");
                                                }
                                            }

                                            imageContainer.addClass("MEE_ITEM").removeClass("drapableImageContainer");
                                            imageContainer.attr("align", myImage.attr("align"));
                                            if (myImage.attr("style")) {
                                                imageContainer.attr("style", myImage.attr("style"));
                                            }
                                        }
                                    });


                                    oHtml.find(".dynamicContentContainer").each(function (index, object) {
                                        if ($(object).find(".dcName span:first")) {
                                            meeIframe.find("#" + $(object).attr("id")).find(".dcName span:first").click();
                                        }
                                        var variation = $(object);
                                        var keyword = variation.attr("keyword");

                                        variation.addClass("DYNAMIC_VARIATION");
                                        variation.removeClass("dynamicContentContainer");
                                        variation.removeClass("container");
                                        var newDiv = $("<div></div>");
                                        newDiv.addClass("DYNAMIC_VARIATION");
                                        newDiv.attr("id", variation.attr("id"));
                                        newDiv.html(keyword);
                                        variation.replaceWith(newDiv);
                                        // variation.html(keyword);

                                    });
                                    //oHtml.find(".dynamicContentContainer").remove();
                                    oHtml.find("a").removeAttr("data-mce-href");
                                    //Remove Outline added by style
                                    oHtml.find("td").removeInlineStyle("outline");

                                    var RemoveCommon = function (element) {

                                        //Remove Empty Element
                                        if (element.isEmpty()) {
                                            element.remove();
                                            return;
                                        }

                                        var newElement = $("<div>");
                                        newElement.html(element.html());

                                        //Assign Style
                                        var elementStyle = element.attr("style");
                                        if (elementStyle != null) {
                                            newElement.attr("style", elementStyle);
                                        }

                                        //Assign Class
                                        var elementClass = element.attr("class");
                                        if (elementClass != null) {
                                            newElement.attr("class", elementClass);
                                        }
                                        //Remove Class
                                        // newElement.removeClass();
                                        element.replaceWith(newElement);
                                    }
                                    while (oHtml.find("ul.sortable").length) {
                                        oHtml.find("ul.sortable").each(function () {
                                            if ($(this).hasClass("sortable")) {
                                                RemoveCommon($(this));
                                            }
                                        });
                                    }
                                    while (oHtml.find("li.MEE_DROPPABLE,li.MEE_ELEMENT,li.MEE_CONTENTS").length) {
                                        oHtml.find("li.MEE_DROPPABLE,li.MEE_ELEMENT,li.MEE_CONTENTS").each(function () {
                                            RemoveCommon($(this));
                                        });
                                    }

                                    oHtml.find("table").not(".DYNAMIC_VARIATION").each(function () {

                                        $(this).find("ul").each(function () {
                                            if ($(this).parents(".mce-content-body").length == 0) {
                                                RemoveCommon($(this));
                                            }
                                        });
                                        $(this).find("li").each(function () {
                                            if ($(this).parents(".mce-content-body").length == 0) {
                                                RemoveCommon($(this));
                                            }
                                        });
                                    });
                                    oHtml.find(".textcontent").removeClass("mce-content-body").addClass("MEE_ITEM").removeClass("textcontent");

                                    oHtml.addClass("MEE_DOCUMENT");
                                    oHtml.removeClass("mainTable");
                                    oHtml.find("*").removeAttr("data-mce-style");
                                    oHtml.find("p").css("margin","0px");
                                    

                                    // oHtml.find("*").not(".DYNAMIC_VARIATION").removeAttr("class");

                                    return oHtml;
                                }
                                ;

                                var InitializeBuildingBlockDroppableArea = function () {
                                    myElement.find(".buildingBlockDroppableOverlay").on('dragover', function (event) {
                                        event.preventDefault();
                                        if (mee.dragElementIframe) {
                                            $(this).find('.blockdrop').css({"border": "2px dashed #01aeee"});
                                        }
                                    }).on('dragleave', function (event) {
                                        event.preventDefault();
                                        if (mee.dragElementIframe) {
                                            $(this).find('.blockdrop').css({"border": "1px dashed #fff"});
                                        }
                                    });

                                    myElement.find(".buildingBlockDroppableOverlay").find('*').andSelf().on('drop', function (event) {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        var ui = {draggable: null};
                                        ui.draggable = mee.dragElementIframe;
                                        var args = {
                                            droppedElement: $(this),
                                            buildingBlock: null,
                                            event: event,
                                            ui: ui
                                        };
                                        //
                                        mee._LastSelectedBuildingBlock = null;
                                        mee.addUpdateContentBlock({
                                            args: args,
                                            oInitDestroyEvents: oInitDestroyEvents
                                        });
                                        mee.dragElementIframe = null;
                                    })
                                }
                                function InitializeControls() {

                                    //Muhammad.Adnan
                                    //Main Draggable Controls
                                    var draggableControls = myElement.find(".draggableControl");
                                    InitializeMainDraggableControls(draggableControls);

                                    //Click on overall element:
                                    myElement.click(function () {
                                        if (!isElementClicked) {
                                            //Sohaib 
                                            RemovePopups();
                                        }
                                        isElementClicked = false;
                                    });


                                    //Building Blocks Drop Area:
                                    InitializeBuildingBlockDroppableArea();
                                    var acc_height = options.fromDialog? (parseInt(myElement.parents(".modal-body").css("min-height"))-52) :($(window).height() - 62);                                    
                                    myElement.find(".builder-panel").css("height", acc_height + "px");
                                    myElement.find(".style-panel").css("height", acc_height + "px");
                                    myElement.find(".editorbox").css("min-height", ($(window).height() - 100) + "px");
                                    myElement.find("#contentAreaDiv").scroll();
                                    myElement.find("#imageTitleDialog").hide();
                                    myElement.find(".accordian").accordion({
                                        heightStyle: "fill",
                                        collapsible: false
                                    });
                                    myElement.find(".builder-panel").css("height", (myElement.find(".builder-panel").height() + 12) + "px");
                                    //Load building blocks from service:
                                    mee._LoadBuildingBlocks();
                                    //////////
                                    _LoadContentBlocks();
                                    _LoadDynamicBlocks();
                                    _LoadPersonalizeTags();


                                    if (options.landingPage) {
                                        mee._LoadFormBlocks();
                                    }


                                    //TODO Styles

                                    myElement.find('.tabs').click(function () {
                                        var $this = $(this);
                                        var $tabs = myElement.find('.tabs');
                                        var initStyles = false;
                                        $tabs.removeClass('active');
                                        $this.addClass('active');
                                        if ($(this).hasClass("builder-tab")) {
                                            myElement.find('.builder-panel').show();
                                            myElement.find('.style-panel').hide();
                                            initStyles = false;

                                        }
                                        else if ($(this).hasClass("style-tab")) {
                                            myElement.find('.builder-panel').hide();
                                            myElement.find('.style-panel').show();
                                            if (showStyle === false && options.fromDialog == true) {
                                                myElement.find(".style-panel .accordian").accordion("refresh");
                                                myElement.find(".style-panel").css("height", (myElement.find(".style-panel").height() + 12) + "px");
                                                showStyle = true;
                                            }
                                            initStyles = true;
                                        }
                                        if (options.fromDialog == false) {
                                            var scrollBottom = $(document).height() - $(window).height() - $(window).scrollTop();
                                            if (scrollBottom < 74) {
                                                var lessBy = 74 - scrollBottom;
                                                if (mee.setAccordian) {
                                                    mee.setAccordian(lessBy);
                                                }
                                            }
                                            else {
                                                mee.setAccordian(0);
                                            }
                                        }

                                        InitializeElementsForStyle(initStyles);


                                    });

                                    myElement.find("#tabs").click(function () {
                                        $(this).toggleClass("active");
                                    });

                                    myElement.find("#tabs").tabs({
                                        activate: function (event, ui) {
                                            if (ui.newPanel.attr("id") == "tabs-1") {
                                                InitializeElementsForStyle(false);
                                            }
                                            else {
                                                InitializeElementsForStyle(true);
                                            }
                                        }
                                    });

                                    $(myElement).tooltip();


                                    myElement.find("#dialog-Preview").dialog({
                                        autoOpen: false,
                                        modal: true,
                                        buttons: {
                                            Cancel: function () {
                                                $(this).dialog("close");
                                            }
                                        },
                                        width: 900
                                    });

                                }


//**************************************************************End ***********************************************************************************///

//*****************************************Intialization of funtionality and plugings***********************************************************************************///Section2
                                function InitializeElementsForStyle(isActive) {

                                    if (!isActive) {

                                        RemoveAllOutline();

                                        IsStyleActivated = false;

                                        SelectedElementForStyle = null;

                                        oInitDestroyEvents.InitializePluginsEvents(meeIframe);


                                    }
                                    else {
                                        oInitDestroyEvents.DestroyPluginsEvents(meeIframe);
                                        IsStyleActivated = true;
                                        if (undoredo === true) {
                                            //Selection
                                            meeIframe.find(".csHaveData td, .csHaveData div").click(function (event) {
                                                if (IsStyleActivated) {
                                                    event.stopPropagation(); //Stop bubbling

                                                    RemoveAllOutline();

                                                    $(this).css("outline", "2px solid #6298be");

                                                    SelectedElementForStyle = $(this);
                                                    SetStylesOnSelection(SelectedElementForStyle);

                                                    //--------------Background Layers-------------//
                                                    var isGetGrandParent = false;

                                                    var ddlBackgroundLayers = myElement.find(".ddlBackgroundLayers");
                                                    ddlBackgroundLayers.find("option").remove();

                                                    ddlBackgroundLayers.append(
                                                            $('<option value=""></option>'));                                                    


                                                    //Add Self
                                                    ddlBackgroundLayers.append(
                                                            $('<option></option>')
                                                            .val(SelectedElementForStyle.prop("tagName"))
                                                            .html("Parent: " + SelectedElementForStyle.prop("tagName"))
                                                            .data("el", SelectedElementForStyle)
                                                            );

                                                    SelectedElementForStyle.parents().each(function (index, element) {

                                                        if (!isGetGrandParent) {
                                                            if ($(element).hasClass("mainContentHtmlGrand")) {
                                                                isGetGrandParent = true;
                                                            }

                                                            //if ($(element).prop("tagName") === "TD") {

                                                            ddlBackgroundLayers.append(
                                                                    $('<option></option>')
                                                                    .val($(element).prop("tagName"))
                                                                    .html("Parent: " + $(element).prop("tagName"))
                                                                    .data("el", $(element))
                                                                    );
                                                            // }

                                                        }

                                                    });
                                                    ddlBackgroundLayers.append(
                                                            $('<option value="body">BODY</option>'));
                                                    myElement.find(".ddlBackgroundLayers").trigger("chosen:updated");
                                                    //////////////////////////////////////////////////

                                                }
                                            });
                                            undoredo = false;
                                        }
                                        //////////////////////

                                        if (eventsApplied === false) {
                                            myElement.find(".ddlBackgroundLayers").chosen();
                                            //Border
                                            myElement.find(".sBorderLine").click(function () {

                                                if (SelectedElementForStyle != null) {

                                                    $element = myElement.find(".borderControl .ved-edge-inner");
                                                    var box_height = Number($element.height());
                                                    var box_width = Number($element.width());
                                                    var type = $(this).data("type").toLowerCase();
                                                    if ($(this).hasClass("borderselected")) {
                                                        //$(this).removeClass("active");
                                                        SelectedElementForStyle.removeInlineStyle("border-" + type);
                                                        myElement.find("#" + type + "Border").removeClass('borderselected');
                                                        $element.css("border-" + type, "none");
                                                    }
                                                    else {

                                                        //$(this).addClass("active");
                                                        var borderType = myElement.find(".ddlBorderType").val();
                                                        var borderWidth = myElement.find(".ddlBorderWidth").val();
                                                        SelectedElementForStyle.css("border-" + type, borderWidth + "px " + borderType + " " + borderColor);
                                                        myElement.find("#" + type + "Border").addClass('borderselected');

                                                        var string = borderWidth + "px " + borderType + " #000";
                                                        $element.css("border-" + type, string);
                                                        borderTopWidth = $element.css("border-" + type + "-width").split("px");
                                                        borderTopWidth = Number(borderTopWidth[0]);
                                                        borderBottomWidth = $element.css("border-bottom-width").split("px");
                                                        borderBottomWidth = Number(borderBottomWidth[0]);
                                                        TotalBorderTopBottom = borderTopWidth + borderBottomWidth;
                                                        if (type == 'top' || type == 'bottom') {
                                                            $element.css("height", 48 - TotalBorderTopBottom + "px");
                                                        }
                                                        else {
                                                            $element.css("width", 48 - TotalBorderTopBottom + "px");
                                                        }
                                                    }
                                                    makeCloneAndRegister();
                                                }

                                            });
                                            //////////////////////
                                            //Vertical Align
                                            myElement.find(".sVerticalAlign").click(function () {

                                                if (SelectedElementForStyle != null) {
                                                    if ($(this).attr("id") == "top") {
                                                        SelectedElementForStyle.css("vertical-align", "top");
                                                        myElement.find(".aligncol #top").addClass("active");
                                                        myElement.find(".aligncol #top").siblings().removeClass("active");

                                                    }
                                                    else if ($(this).attr("id") == "middle") {
                                                        SelectedElementForStyle.css("vertical-align", "middle");
                                                        myElement.find(".aligncol #middle").addClass("active");
                                                        myElement.find(".aligncol #middle").siblings().removeClass("active");
                                                    }
                                                    else if ($(this).attr("id") == "bottom") {
                                                        SelectedElementForStyle.css("vertical-align", "bottom");
                                                        myElement.find(".aligncol #bottom").addClass("active");
                                                        myElement.find(".aligncol #bottom").siblings().removeClass("active");
                                                    }
                                                    makeCloneAndRegister();
                                                }
                                            });
                                            //////////////////////
                                            //Padding
                                            myElement.find(".sPadding").click(function () {

                                                if (SelectedElementForStyle != null) {
                                                    var type = $(this).data("type").toLowerCase();

                                                    if ($(this).hasClass("borderselected")) {
                                                        //$(this).removeClass("active");
                                                        SelectedElementForStyle.removeInlineStyle("padding-" + type);
                                                        myElement.find("#" + type + "Padding").removeClass('borderselected');

                                                    }
                                                    else {
                                                        //$(this).addClass("active");
                                                        var paddingValue = myElement.find(".ddlPadding").val();
                                                        SelectedElementForStyle.css("padding-" + type, paddingValue + "px");
                                                        myElement.find("#" + type + "Padding").addClass('borderselected');
                                                    }
                                                    //  undoManager.registerAction(mainContentHtmlGrand.html());
                                                    makeCloneAndRegister();
                                                }
                                            });
                                            //////////////////////

                                            //Background Layers
                                            var ddlBackgroundLayers = myElement.find(".ddlBackgroundLayers");

                                            ddlBackgroundLayers.on('change', function () {
                                                if ($(this).find(':selected').val() != "-1") {
                                                    RemoveAllOutline();                                                    
                                                    SelectedElementForStyle = $(this).find(':selected').val()=="body"? meeIframe.find("body"): $(this).find(':selected').data('el');
                                                    SelectedElementForStyle.css("outline", "2px solid #6298be");                                                    
                                                    // undoManager.registerAction(mainContentHtmlGrand.html());
                                                    makeCloneAndRegister();
                                                }
                                            });

                                            ///////////////////////


                                            //Email Width
                                            myElement.find(".btnContainerSize").click(function () {
                                                var value = $(this).data("value");
                                                meeIframe.find(".mainTable").css("width", value + "px");
                                                if (value == "700") {
                                                    myElement.find(".email-width input.txtContSize").val('');
                                                    myElement.find("input#700").addClass("active");
                                                    myElement.find("input#700").siblings().removeClass("active");
                                                    emailWidth = "700px";
                                                }
                                                else if (value == "600") {
                                                    myElement.find(".email-width input.txtContSize").val('');
                                                    myElement.find("input#600").addClass("active");
                                                    myElement.find("input#600").siblings().removeClass("active");
                                                    emailWidth = "600px";
                                                }
                                                else if (value == "500") {
                                                    myElement.find(".email-width input.txtContSize").val('');
                                                    myElement.find("input#500").addClass("active");
                                                    myElement.find("input#500").siblings().removeClass("active");
                                                    emailWidth = "500px";
                                                }
                                                //undoManager.registerAction(mainContentHtmlGrand.html());
                                                makeCloneAndRegister();
                                            });

                                            myElement.find(".txtContainerSize").keyup(function (e) {
                                                meeIframe.find(".mainTable").css("width", $(this).val() + "px");
                                                emailWidth = $(this).val() + "px";
                                                // undoManager.registerAction(mainContentHtmlGrand.html());
                                                makeCloneAndRegister();
                                            });
                                            ///////////////////////


                                            //Add to Colors
                                            myElement.find(".addToMyColors").click(function () {
                                                if (!txtColorCode.isEmpty()) {


                                                    var args = new Object();


                                                    args.AddedColor = txtColorCode.val();
                                                    args.myColorsFromServiceGlobal = myColorsFromServiceGlobal;
                                                    //Call overridden Method here: will use when exposing properties to developer
                                                    if (options.OnColorAdded != null) {
                                                        options.OnColorAdded(args);
                                                    }

                                                    _LoadMyColors();

                                                }
                                                ;

                                            });
                                            eventsApplied = true;
                                        } //End of attached events 
                                        var ddlBackgroundLayers = myElement.find(".ddlBackgroundLayers");
                                        ddlBackgroundLayers.find("option").remove();
                                        ddlBackgroundLayers.append($('<option value=""></option>'));                                        
                                        ddlBackgroundLayers.append(
                                                $('<option></option>')
                                                .val(mainContentHtmlGrand.prop("tagName"))
                                                .html("Parent: " + mainContentHtmlGrand.prop("tagName"))
                                                .data("el", mainContentHtmlGrand)
                                                );
                                        ddlBackgroundLayers.append($('<option value="body" selected="selected">BODY</option>'));
                                        myElement.find(".ddlBackgroundLayers").trigger("chosen:updated").change();
                                        //Load Colors
                                        _LoadMyColors();
                                        
                                        
                                    }




                                }

                                function RemoveAllOutline() {
                                    meeIframe.find(".mainContentHtmlGrand").removeInlineStyle("outline");
                                    meeIframe.find("*").removeInlineStyle("outline");
                                }

                                function SetStylesOnSelection(selectedElement) {

                                    var border_type = myElement.find(".ddlBorderType");
                                    var border_width = myElement.find(".ddlBorderWidth");
                                    var padding_size = myElement.find(".ddlPadding");

                                    var topVal = selectedElement.inlineStyle("border-top");
                                    var bottomVal = selectedElement.inlineStyle("border-bottom");
                                    var rightVal = selectedElement.inlineStyle("border-right");
                                    var leftVal = selectedElement.inlineStyle("border-left");

                                    var paddingtopVal = selectedElement.inlineStyle("padding-top");
                                    var paddingbottomVal = selectedElement.inlineStyle("padding-bottom");
                                    var paddingrightVal = selectedElement.inlineStyle("padding-right");
                                    var paddingleftVal = selectedElement.inlineStyle("padding-left");

                                    var verticalAlignVal = selectedElement.inlineStyle("vertical-align");


                                    $element = myElement.find(".borderControl .ved-edge-inner");
                                    var borderType = myElement.find(".ddlBorderType").val();
                                    var borderWidth = Number(myElement.find(".ddlBorderWidth").val());
                                    var box_height = Number($element.height());
                                    var box_width = Number($element.width());
                                    var string = borderWidth + "px " + borderType + " #000";


                                    if (verticalAlignVal != "" && verticalAlignVal != undefined) {


                                        if (verticalAlignVal == "top") {
                                            myElement.find(".aligncol #top").addClass("active");
                                            myElement.find(".aligncol #top").siblings().removeClass("active");
                                        }
                                        if (verticalAlignVal == "middle") {
                                            myElement.find(".aligncol #middle").addClass("active");
                                            myElement.find(".aligncol #middle").siblings().removeClass("active");
                                        }
                                        if (verticalAlignVal == "bottom") {
                                            myElement.find(".aligncol #bottom").addClass("active");
                                            myElement.find(".aligncol #bottom").siblings().removeClass("active");
                                        }

                                    }
                                    else {

                                        myElement.find(".aligncol #top").removeClass("active");
                                        myElement.find(".aligncol #top").siblings().removeClass("active");
                                        myElement.find(".aligncol #middle").removeClass("active");
                                        myElement.find(".aligncol #middle").siblings().removeClass("active");
                                        myElement.find(".aligncol #bottom").removeClass("active");
                                        myElement.find(".aligncol #botom").siblings().removeClass("active");

                                    }

                                    var items;

                                    if (topVal != undefined && topVal != "") {
                                        items = topVal.split(' ');
                                        border_width.val(items[0].charAt(0));
                                        border_type.val(items[1]);
                                        myElement.find("#topBorder").addClass('borderselected');


                                        $element.css("border-top", string);
                                        borderTopWidth = $element.css("border-top-width").split("px");
                                        borderTopWidth = Number(borderTopWidth[0]);
                                        borderBottomWidth = $element.css("border-bottom-width").split("px");
                                        borderBottomWidth = Number(borderBottomWidth[0]);
                                        TotalBorderTopBottom = borderTopWidth + borderBottomWidth;
                                        $element.css("height", 48 - TotalBorderTopBottom + "px");

                                        //applyborder('top');
                                    }
                                    else {
                                        $element.css("border-top", "none");
                                        myElement.find("#topBorder").removeClass('borderselected');
                                        //applyborder('topNone');
                                    }

                                    if (bottomVal != undefined && bottomVal != "") {
                                        items = bottomVal.split(' ');
                                        border_width.val(items[0].charAt(0));
                                        border_type.val(items[1]);
                                        myElement.find("#bottomBorder").addClass('borderselected');

                                        $element.css("border-bottom", string);
                                        borderTopWidth = $element.css("border-top-width").split("px");
                                        borderTopWidth = Number(borderTopWidth[0]);
                                        borderBottomWidth = $element.css("border-bottom-width").split("px");
                                        borderBottomWidth = Number(borderBottomWidth[0]);
                                        TotalBorderTopBottom = borderTopWidth + borderBottomWidth;
                                        $element.css("height", 48 - TotalBorderTopBottom + "px");


                                        //applyborder('bottom');
                                    }
                                    else {
                                        $element.css("border-bottom", "none");
                                        myElement.find("#bottomBorder").removeClass('borderselected');
                                        //applyborder('bottomNone');
                                    }

                                    if (rightVal != undefined && rightVal != "") {
                                        items = rightVal.split(' ');
                                        //border_width.val(items[0].charAt(0));
                                        //border_type.val(items[1]);
                                        myElement.find("#rightBorder").addClass('borderselected');

                                        $element.css("border-right", string);
                                        borderLeftWidth = $element.css("border-left-width").split("px");
                                        borderLeftWidth = Number(borderLeftWidth[0]);
                                        borderRightWidth = $element.css("border-right-width").split("px");
                                        borderRightWidth = Number(borderRightWidth[0]);
                                        TotalBorderLeftRight = borderLeftWidth + borderRightWidth;
                                        $element.css("width", 48 - TotalBorderLeftRight + "px");



                                        //applyborder('right');
                                    }
                                    else {
                                        $element.css("border-right", "none");
                                        myElement.find("#rightBorder").removeClass('borderselected');
                                        //applyborder('rightNone');
                                    }

                                    if (leftVal != undefined && leftVal != "") {
                                        items = leftVal.split(' ');
                                        border_width.val(items[0].charAt(0));
                                        border_type.val(items[1]);
                                        myElement.find("#leftBorder").addClass('borderselected');

                                        $element.css("border-left", string);
                                        borderLeftWidth = $element.css("border-left-width").split("px");
                                        borderLeftWidth = Number(borderLeftWidth[0]);
                                        borderRightWidth = $element.css("border-right-width").split("px");
                                        borderRightWidth = Number(borderRightWidth[0]);
                                        TotalBorderLeftRight = borderLeftWidth + borderRightWidth;
                                        $element.css("width", 48 - TotalBorderLeftRight + "px");



                                        //applyborder('left');
                                    }
                                    else {
                                        $element.css("border-left", "none");
                                        myElement.find("#leftBorder").removeClass('borderselected');
                                        //applyborder('leftNone');
                                    }

                                    if (paddingtopVal != undefined && paddingtopVal != "") {
                                        padding_size.val(paddingtopVal.replace('px', ''));
                                        myElement.find("#topPadding").addClass('borderselected');

                                        //applyPadding('top');
                                    }
                                    else {
                                        myElement.find("#topPadding").removeClass('borderselected');
                                        //applyPadding('topNone');
                                    }

                                    if (paddingbottomVal != undefined && paddingbottomVal != "") {
                                        padding_size.val(paddingbottomVal.replace('px', ''));
                                        myElement.find("#bottomPadding").addClass('borderselected');
                                        //applyPadding('bottom');
                                    }
                                    else {
                                        myElement.find("#bottomPadding").removeClass('borderselected');
                                        //applyPadding('bottomNone');
                                    }
                                    if (paddingrightVal != undefined && paddingrightVal != "") {
                                        padding_size.val(paddingrightVal.replace('px', ''));
                                        myElement.find("#rightPadding").addClass('borderselected');
                                        //('right');
                                    }
                                    else {
                                        myElement.find("#rightPadding").removeClass('borderselected');
                                        //applyPadding('rightNone');
                                    }
                                    if (paddingleftVal != undefined && paddingleftVal != "") {
                                        padding_size.val(paddingleftVal.replace('px', ''));
                                        myElement.find("#leftPadding").addClass('borderselected');
                                        //applyPadding('left');
                                    }
                                    else {
                                        myElement.find("#leftPadding").removeClass('borderselected');
                                        //applyPadding('leftNone');
                                    }
                                }

                                var _LoadMyColors = function (args) {

                                    if (args == null) {
                                        args = new Object();
                                    }

                                    //Call overridden Method here: will use when exposing properties to developer
                                    if (options.LoadMyColors != null) {
                                        options.LoadMyColors(args);
                                    }

                                    //Getting building blocks from provided block:
                                    if (args.myColors != null) {

                                        var listOfMyColorsHtml = "";
                                        var myColorsFromService = args.myColors;
                                        var myColorsArray = myColorsFromService.split(",");
                                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.

                                        $.each(myColorsArray, function (i, obj) {


                                            listOfMyColorsHtml += "<li style='background-color:" + obj + ";' data-color='" + obj + "'></li>";


                                        });
                                        ulMyColors.empty();
                                        ulMyColors.append(listOfMyColorsHtml);

                                        ulMyColors.find("li").click(function () {
                                            SetBackgroundColor($(this).data("color"));
                                            makeCloneAndRegister();
                                        });


                                        myColorsFromServiceGlobal = myColorsFromService;

                                    }

                                }

                                function InitializeStyleControls() {
                                    var colorPickerBackground = myElement.find(".divColorPicker");


                                    colorPickerBackground.minicolors({
                                        change: function (hex, opacity) {

                                            SetBackgroundColor(hex);

                                            txtColorCode.val(hex);
                                        },
                                        inline: true

                                    });

                                    templateColors.children().first().click(function () {
                                        SetBackgroundColor(null);

                                    });



                                    myElement.find(".minicolors-picker").on("mouseup", function () {

                                        if (SelectedElementForStyle != null) {

                                            var selectedColor = colorPickerBackground.minicolors('value');
                                            var li = $("<li></li>").css("background-color", selectedColor).data("selectedColor", selectedColor);

                                            li.click(function () {
                                                SetBackgroundColor($(this).data("selectedColor"));
                                            });

                                            templateColors.append(li);
                                            makeCloneAndRegister();
                                        }

                                    });

                                    var colorPickerBorder = myElement.find(".colorPickerBorder");
                                    colorPickerBorder.minicolors({
                                        change: function (hex, opacity) {
                                            borderColor = hex;
                                        },
                                        inline: false,
                                        position: 'top left',
                                        defaultValue: '#000'

                                    });


                                }

                                var SetBackgroundColor = function (hex) {

                                    if (hex == null && SelectedElementForStyle != null) {
                                        SelectedElementForStyle.removeInlineStyle("background-color");
                                        return;
                                    }

                                    if (IsStyleActivated && SelectedElementForStyle != null) {

                                        if (chkChangeAllMatching.is(":checked")) {

                                            var colorCode = SelectedElementForStyle.css("background-color");

                                            mainContentHtmlGrand.find("td").andSelf().filter(function () {
                                                return $(this).css("background-color") == colorCode;
                                            }).css("background-color", hex);
                                        }

                                        SelectedElementForStyle.css("background-color", hex);
                                        if(SelectedElementForStyle[0].tagName.toLowerCase()=="body"){
                                            pageBackgroundColor = hex;
                                        }
                                    }
                                }
                                InitializeStyleControls();
                                InitializePreviewControls();

                                var CreateDroppable = function (e) {
                                    var myDroppable = $("<li class='myDroppable'></li>");

                                    //FOR CHROME SPECIALLY
                                    DropableMouseEnterLeave(myDroppable);

                                    return myDroppable;
                                }

                                function InitializeDeleteButtonOnElement(element) {

                                    element.find(".myHandlerDelete").click(function () {
                                        DeleteElement(meeIframeWindow.$(this));
                                        makeCloneAndRegister();
                                    });
                                }

                                function DeleteElement(element)
                                {
                                    var csHaveDataLength = meeIframe.find(".csHaveData").length;
                                    var myParent = element.closest(".csHaveData");

                                    //REMOVE DROPPABLES HERE  
                                    if (csHaveDataLength != 1) {
                                        myParent.next(".myDroppable").remove();
                                    }
                                    else {
                                        //If last element
                                        myParent.next(".myDroppable").remove();
                                        myParent.prev(".myDroppable").remove();
                                    }
                                    myParent.remove();

                                    if (meeIframeWindow.$(".myDroppable").length == 1) {
                                        meeIframeWindow.$(".myDroppable").remove();
                                    }
                                    mee.checkForm();
                                }

                                function InitializeCopyButtonOnElement(element) {
                                    element.find(".myHandlerCopy").unbind("click");
                                    element.find(".myHandlerCopy").bind("click",function () {

                                        var myParent = $(this).closest(".csHaveData");
                                        var droppable = CreateDroppableWithAllFunctions();
                                        droppable.css("visibility", "hidden");
                                        myParent.before(droppable);

                                        oInitDestroyEvents.DestroyPluginsEvents(myParent);
                                        var duplicateElement = myParent.clone();
                                        oInitDestroyEvents.InitAll(myParent, false);


                                        var oControl = new Object();
                                        oControl.Html = duplicateElement;
                                        oControl.Type = "copied";

                                        var args = {};

                                        args.predefinedControl = oControl;
                                        args.droppedElement = oControl.Html;

                                        oInitDestroyEvents.InitAll(oControl.Html, false);

                                        droppable.before(args.droppedElement);

                                        myElement.find(".topHandlers").remove();
                                        RemoveDroppables(myElement, true);

                                        OnNewElementDropped(args);

                                        makeCloneAndRegister();
                                    });
                                }

                                //Load Link GUI and show in BMS dialog
                                function showLinkGUI() {
                                    //BMS dialog code
                                    var lType = myElement.find("#linkTrack").data("linkObject");    
                                    meeIframeWindow.$("[data-mce-type='bookmark']").remove();
                                    var selectedText = ﻿meeIframeWindow.tinyMCE.activeEditor.selection.getBookmark();
                                    var divID = "";
                                    if (lType === "text") {
                                        divID = meeIframe.find("div.textcontent.mce-edit-focus").attr("id");
                                    }
                                    var dialogOptions = {
                                            title: "Links GUI",
                                            css: {
                                                "width": "780px",
                                                "margin-left": "-390px"
                                            },
                                            bodyCss: {
                                                "min-height": "325px"
                                            },
                                            headerIcon: 'link',
                                            buttons: {
                                                saveBtn: {
                                                    text: 'Insert'
                                                }
                                            }
                                        };
                                    var dialog = null;  
                                    if (options.fromDialog) {
                                        dialog = options._app.showStaticDialog(dialogOptions);                                            
                                    }
                                    else{
                                        dialog = options._app.showDialog(dialogOptions);                                        
                                    }
                                    options._app.showLoading("Loading...", dialog.getBody());
                                    dialog.$el.css("z-index", "99999");
                                    $(".modal-backdrop").css("z-index", "99998");
                                    require(["editor/links"], function (page) {
                                        var linkDialogPage = new page({
                                            config: options,
                                            selectedText : selectedText,
                                            meeIframeWindow: meeIframeWindow,
                                            _el: myElement,
                                            dialog: dialog,
                                            linkType: lType,
                                            div: divID
                                        });
                                        dialog.getBody().append(linkDialogPage.$el);
                                        dialog.saveCallBack(_.bind(linkDialogPage.insertLink, linkDialogPage, dialog));
                                        options._app.showLoading(false, dialog.getBody());                                        
                                    });
                                }



                                function SetElementSize(args) {
                                    //Controlling here Width of Container
                                    if (args.predefinedControl != null) {
                                        var parentWidth = 100;
                                        //var parentWidth = args.droppedElement.width();
                                        var perTDwidth = 0;
                                        switch (args.predefinedControl.Type) {
                                            case "oneColumnContainer":
                                                //do nothing
                                                break;
                                            case "twoColumnContainer":
                                                perTDwidth = (parentWidth / 2) + "%";
                                                args.droppedElement.find(".container > tbody > tr > td").each(function (index, element) {
                                                    $(element).width(perTDwidth);
                                                });
                                                break;
                                            case "threeColumnContainer":
                                                perTDwidth = (parentWidth / 3) + "%";
                                                args.droppedElement.find(".container > tbody > tr > td").each(function (index, element) {
                                                    $(element).width(perTDwidth);
                                                });
                                                break;
                                            case "fourColumnContainer":
                                                perTDwidth = (parentWidth / 4) + "%";
                                                args.droppedElement.find(".container > tbody > tr > td").each(function (index, element) {
                                                    $(element).width(perTDwidth);
                                                });
                                                break;
                                            default:

                                        }
                                    }

                                }
                                var showBox = function (obj, imageObj, type) {
                                    var _ele = obj; //element which is clicked
                                    var left_minus = 15;      //static space to minus to show dialog on exact location
                                    var ele_offset = _ele.offset();
                                    var ele_height = _ele.height();
                                    var editorBox = _ele.parents(".MEE_EDITOR").offset();
                                    var top = ele_offset.top - editorBox.top + 10 + topPlus;
                                    var left = ele_offset.left - editorBox.left - 38;

                                    if (type == "info") {
                                        var li = "<a class='closebtn'></a>";
                                        li += "<h4>" + imageObj.fileName + "</h4>";
                                        li += "<h5><em>Size: </em>" + imageObj.height + " x " + imageObj.width + "</h5>";
                                        li += "<h5><em>Created on: </em>" + imageObj.updationDate + "</h5>";
                                        myElement.find(".info-windowDiv").html(li);
                                        myElement.find(".info-windowDiv").css({
                                            "left": left + "px",
                                            "top": top + "px"
                                        }).show();
                                    }
                                    else if (type == "link") {
                                        var li = "<a class='closebtn'></a>";
                                        li += "<h4>Image URL</h4>";
                                        li += "<input type='text' placeholder='Image URL' class='left tginput' style='width: 202px;' value='" + imageObj.originalURL + "'>";
                                        myElement.find(".link-windowDiv").html(li);
                                        myElement.find(".link-windowDiv").css({
                                            "left": left + "px",
                                            "top": top + "px"
                                        }).show();
                                    }
                                    else if (type == "tag") {
                                        var tagsArr = imageObj.tags.split(',');
                                        var li = "<a class='closebtn /*closebtn-imgtag*/' data-id='" + imageObj["imageId.encode"] + "'></a>";
                                        li += "<div class='tagscont'>";
                                        li += "<ul>";
                                        for (var i = 0; i < tagsArr.length; i++) {
                                            if (tagsArr[i] != "") {
                                                li += "<li><a class='tag' href='#.'><span>" + tagsArr[i] + "</span><i class='icon cross remove-tag'></i></a></li>";
                                            }
                                        }
                                        li += "</ul></div>";
                                        li += "<input type='text' placeholder='Add tag' class='left tginput' id='addTagsToImage'>";
                                        li += "<a class='btn-green left addtag' data-id='" + imageObj["imageId.encode"] + "'><span>Add</span><i class='icon plus'></i></a>";
                                        myElement.find(".tag-windowDiv").html(li);
                                        myElement.find(".tag-windowDiv").css({
                                            "left": left + "px",
                                            "top": top + "px"
                                        }).show();
                                    }
                                    else if (type == "delete") {
                                        var li = "<a class='closebtn'></a>";
                                        li += "<h5 style='padding-bottom: 10px;'>Do you want to delete this Image?</h5>";
                                        li += "<a class='btn-red left confirm-del' data-id='" + imageObj["imageId.encode"] + "'><span>Delete</span><i class='icon delete'></i></a>";
                                        myElement.find(".del-windowDiv").html(li);
                                        myElement.find(".del-windowDiv").css({
                                            "left": left + "px",
                                            "top": top + "px"
                                        }).show();
                                    }
                                    else if (type == "bbdel") {
                                        var element = $(obj).parents("li");
                                        var block_id = imageObj["blockId.encode"];
                                        options._app.showAlertDetail({
                                            heading: 'Confirm Deletion',
                                            detail: "Do you want to delete this Block?",
                                            callback: _.bind(function () {
                                                this.deleteBlock(element, block_id);
                                            }, mee)
                                        },
                                        $("body"));
                                    }
                                    else if (type == "fbdel") {
                                        var element = $(obj).parents("li");                                        
                                        var form_id = _ele.data("id");
                                        options._app.showAlertDetail({
                                            heading: 'Confirm Deletion',
                                            detail: "Do you want to delete this Form ?",
                                            callback: _.bind(function () {
                                                this.deleteForm(element, form_id);
                                            }, mee)
                                        },
                                        $("body"));
                                    }
                                    else if (type == "bbedit") {
                                        mee._LastSelectedBuildingBlock = imageObj;
                                        InitializeBuildingBlockUpdatePopup();
                                    }
                                    else if (type == "dcdel") {
                                        var li = "<a class='closebtn'></a>";
                                        li += "<h5 style='padding-bottom: 10px;'>Do you want to delete this Block?</h5>";
                                        li += "<a class='btn-red left confirm-del btnDeleteDC' data-id='" + imageObj["dynamicNumber.encode"] + "'><span>Delete</span><i class='icon delete'></i></a>";
                                        myElement.find(".DCDeleteDialog").html(li);
                                        myElement.find(".DCDeleteDialog").css({
                                            "left": left + "px",
                                            "top": top + "px"
                                        }).show();
                                    }
                                    else if (type == "dcedit") {
                                        var li = "<a class='closebtn'></a>";
                                        li += "<h5 style='padding-bottom: 10px;'>Edit Dynamic Content Name</h5>";
                                        li += "<input type='text' placeholder='Image URL' class='left tginput txtBlockName' style='width: 202px; margin-bottom: 10px; dis' value='" + imageObj.label + "'>";
                                        li += "<a class='btn-green left btnSaveDC'  data-id='" + imageObj["dynamicNumber.encode"] + "'>";
                                        li += "<span>Save</span><i class='icon save'></i> ";
                                        li += "</a> ";


                                        myElement.find(".DCEditDialog").html(li);
                                        myElement.find(".DCEditDialog").css({
                                            "left": left + "px",
                                            "top": top + "px"
                                        }).show();
                                    }
                                }
//**************************************************************End ***********************************************************************************///
//
//**************************************************************Images Library***********************************************************************************///Section3

                                function SendServerRequest(requestProperties, errorCallBack) {
                                    var returnJson;

                                    $.ajax({
                                        url: requestProperties.Url,
                                        data: requestProperties.Data,
                                        type: requestProperties.Type,
                                        contentType: requestProperties.ContentType,
                                        dataType: requestProperties.DataType,
                                        cache: false,
                                        async: false,
                                        success: function (e) {
                                            //console.log("Response Came:"+e);
                                            returnJson = e;
                                        },
                                        error: errorCallBack
                                    });
                                    //console.log(returnJson);
                                    return returnJson;
                                }
                                // .................... Send Server Request ................................


                                function getImagesMarkup(obj) {
                                    var imagesMarkup = "";
                                    var _index = "";
                                    if (obj && obj[0]) {
                                        $.each(obj[0], function (index, val) {
                                            var tagsArr = val[0].tags.split(',');
                                            var _index = "image" + (parseInt(_offset) + parseInt(index.substr(5)));
                                            var li = "<li class='draggableControl ui-draggable droppedImage' data-type='droppedImage'>";
                                            li += "<span class='img'>";
                                            li += "<img title='" + val[0].tags + "' src='" + val[0].thumbURL + "' alt='" + val[0].fileName + "' data-id='" + val[0]["imageId.encode"] + "' data-tags='" + val[0].tags + "' data-name='" + val[0].fileName + "' /></span>";
                                            li += "<a href='#'><span class='font_75'>" + val[0].fileName + "</span></a>";
                                            li += "<div class='imageicons'>";
                                            li += "<i class='imgicons info action' data-actiontype='imageInfo' data-index='" + _index + "' data-id='" + val[0]["imageId.encode"] + "'></i>";
                                            li += "<i class='imgicons link action' data-actiontype='imageLink' data-index='" + _index + "' data-id='" + val[0]["imageId.encode"] + "'></i>";
                                            li += "<i class='imgicons preview action' data-actiontype='imagePreview' data-index='" + _index + "' data-id='" + val[0]["imageId.encode"] + "' data-url='" + val[0].originalURL + "' data-name='" + val[0].fileName + "'></i>";
                                            li += "<i class='imgicons tag action' data-actiontype='imageTag' data-index='" + _index + "' data-id='" + val[0]["imageId.encode"] + "'></i>";
                                            li += "<i class='imgicons delete action' data-actiontype='imageDelete' data-index='" + _index + "' data-id='" + val[0]["imageId.encode"] + "'></i>";
                                            li += "</li>";
                                            imagesMarkup = imagesMarkup + li;
                                        })
                                    }
                                    return imagesMarkup;
                                }

                                // == Enabling ImageFunctionality before access 
                                var imageFunctionality = {
                                    leftAlign: function (myHtmlInstance, workingObject) {
                                        $(workingObject).parents(".myImage");
                                        var myObj = $(workingObject).parents(".myImage");
                                        myObj.attr("align", "left");
                                        var seHandle = myObj.find(".ui-resizable-se");
                                        var swHandle = myObj.find(".ui-resizable-sw");
                                        if (swHandle.is(":visible")) {
                                            swHandle.hide();
                                        }
                                        seHandle.show();
                                    },
                                    centerAlign: function (myHtmlInstance, workingObject) {
                                        var myObj = $(workingObject).parents(".myImage");
                                        myObj.attr("align", "center");
                                        myObj.find(".ui-resizable-se").show();
                                        myObj.find(".ui-resizable-sw").show();
                                    },
                                    rightAlign: function (myHtmlInstance, workingObject) {
                                        var myObj = $(workingObject).parents(".myImage");
                                        myObj.attr("align", "right");
                                        myObj.find("img.imageHandlingClass").css("overflow", "hidden");
                                        var seHandle = myObj.find(".ui-resizable-se");
                                        var swHandle = myObj.find(".ui-resizable-sw");
                                        if (seHandle.is(":visible")) {
                                            seHandle.hide();
                                        }
                                        swHandle.show();
                                    },
                                    setImageTitle: function (workingObject) {
                                        var dialog = options._app.showDialog({
                                            title: 'Set Title',
                                            css: {
                                                "width": "500px",
                                                "margin-left": "-250px",
                                                "top": "20%"
                                            },
                                            headerEditable: false,
                                            headerIcon: 'template',
                                            bodyCss: {
                                                "min-height": "100px"
                                            },
                                            buttons: {
                                                saveBtn: {
                                                    text: 'Set'
                                                }
                                            }
                                        });
                                        var _newTitleHTML = '<div class="row campname-container" style="margin-top: 24px;width:96%">'
                                        _newTitleHTML += '<label style="width:20%;">Title:</label>'
                                        _newTitleHTML += '<div class="inputcont" style="text-align:right;"><input type="text" id="image_title" placeholder="Enter title here" style="width:70%;" /></div>'
                                        _newTitleHTML += '</div>';
                                        _newTitleHTML = $(_newTitleHTML);
                                        var setTitle = function () {
                                            var title_text = _newTitleHTML.find("input#image_title").val();
                                            if (title_text) {
                                                $(workingObject).attr("title", title_text);
                                                if (options.fromDialog) {
                                                    dialog.showPrevious();
                                                }
                                                else {
                                                    dialog.hide();
                                                }
                                            }
                                            else {
                                                _newTitleHTML.find("input#image_title").focus();
                                            }
                                        }
                                        _newTitleHTML.find("input#image_title").keypress(function (e) {
                                            if (e.keyCode == 13) {
                                                setTitle();
                                            }
                                        })
                                        dialog.saveCallBack(setTitle);
                                        dialog.getBody().append(_newTitleHTML);
                                        if (options.fromDialog) {
                                            var dialogArrayLength = options._app.dialogArray.length; // New Dialog
                                            dialog.getBody().find(".campname-container").addClass('dialogWrap-' + dialogArrayLength); // New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].currentView = _newTitleHTML; // New Dialog
                                            options._app.dialogArray[dialogArrayLength - 1].saveCall = setTitle; // New Dialog
                                            _newTitleHTML.ReattachEvents = options.reAttachEvents;
                                        }
                                        if ($(workingObject).attr("title")) {
                                            _newTitleHTML.find("input#image_title").val($(workingObject).attr("title"));
                                        }
                                        _newTitleHTML.find("input#image_title").focus();
                                    }
                                }

                                //========================= End Sohaib Nadeem =====================////

                                var isElementClicked = false;
                                var buildingBlocksGlobal = null;
                                var contentBlocksGlobal = null;


                                myElement.find(".ImageToolbarLeftAlignClass").click(function () {
                                    imageFunctionality.leftAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                                    makeCloneAndRegister();
                                    return false;
                                });
                                myElement.find(".ImageToolbarCenterAlignClass").click(function () {
                                    imageFunctionality.centerAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                                    makeCloneAndRegister();
                                    return false;
                                });
                                myElement.find(".ImageToolbarRightAlignClass").click(function () {
                                    imageFunctionality.rightAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                                    makeCloneAndRegister();
                                    return false;
                                });

                                myElement.find(".ImageToolbarLinkClass").click(function () {
                                    //imageFunctionality.openLinkGUI(myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                                    showLinkGUI();
                                    makeCloneAndRegister();
                                    myElement.find("#imageToolbar").hide();
                                    return false;
                                });
                                myElement.find(".ImageToolbarUnLinkClass").click(function () {
                                    var selectObj = myElement.find("#imageDataSavingObject").data("myWorkingObject");
                                    if (selectObj) {
                                        selectObj = $(selectObj);
                                        var imgObj = selectObj.is("img") ? selectObj : selectObj.find("img");
                                        var _html = imgObj.clone(true);
                                        if (imgObj.parent().is("a")) {
                                            imgObj.parent().replaceWith(_html);
                                        }
                                        makeCloneAndRegister();
                                    }
                                    myElement.find("#imageToolbar").hide();
                                    return false;
                                });
                                myElement.find(".ImageToolbarTitleSetClass").click(function () {

                                    imageFunctionality.setImageTitle(myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                                    makeCloneAndRegister();
                                    return false;
                                });


                                var OnImageDropped = function (args) {

                                    var index = args.ui.draggable.find("i:first-child").data("index");
                                    if (index) {
                                        index = parseInt(index.substr(5)) - 1;
                                    }
                                    var imageSrc = options._app.decodeHTML(imageListGlobal[index].originalURL);
                                    var htmlToPlace = $("<div class='myImage resizable' align='left' style='float:none;'><div class='resizableImage' style='height:200px; width:200px;'><img style='height:100%; width:100%;' class='imageHandlingClass  clickEvent' src='" + imageSrc + "' style='display:block;' /></div></div>");

                                    // htmlToPlace.find("img.imageHandlingClass").resizable({

                                    meeIframeWindow.$(htmlToPlace.find(".resizableImage")).resizable({
                                        aspectRatio: false,
                                        start:function(event,ui){
                                            $(this).find(".resizeable-tooltip").remove();
                                            $(this).append("<div class='resizeable-tooltip'></div>")
                                        },
                                        resize: function( event, ui ) {                                                    
                                            $(this).find("img").css({"width":$(this).css("width"),"height":$(this).css("height")});
                                            $(this).find(".resizeable-tooltip").html(parseInt($(this).css("width"))+" × "+parseInt($(this).css("height")));
                                        },
                                        stop: function(event,ui){
                                            $(this).find(".resizeable-tooltip").remove();
                                        }
                                    });
                                    args.droppedElement.html(htmlToPlace);
                                    makeCloneAndRegister();
                                    if(changFlag){
                                        changFlag.editor_change = true;
                                    }
                                }

                                var OnClickedOnElement = function (event) {
                                    myElement.find("#imageDataSavingObject").data("myWorkingObject", event.target);
                                    myElement.find("#linkTrack").data("linkObject", "image");
                                    myElement.find("#imageToolbar").addClass("imageToolbar-menu");
                                    myElement.find("#imageToolbar").show();
                                    if ($(event.target).parent().prop("tagName").toLowerCase() == "a") {
                                        myElement.find("#imageToolbar").css("width", "366px");
                                        myElement.find("#imageToolbar .ImageToolbarUnLinkClass").show();
                                    }
                                    else {
                                        myElement.find("#imageToolbar .ImageToolbarUnLinkClass").hide();
                                        myElement.find("#imageToolbar").css("width", "310px");
                                    }
                                    myElement.find("#imageToolbar").css({
                                        top: $(event.target).offset().top + 19 + topPlus,
                                        left: $(event.target).offset().left + 292 + leftPlus
                                    });

                                }
                                mee.liveLoading = function () {
                                    var $w = $(window);
                                    var th = 100;
                                    var inview = myElement.find(".imageLib li:last-child").filter(function () {
                                        var $e = $(this),
                                                wt = $w.scrollTop(),
                                                wb = wt + $w.height(),
                                                et = $e.offset().top,
                                                eb = et + $e.height();
                                        return eb >= wt - th && et <= wb + th;
                                    });
                                    if (inview.length && inview.attr("data-load")) {
                                        inview.removeAttr("data-load");
                                        myElement.find(".footer-loading").show();
                                        LoadImagesInLibrary(20);
                                    }
                                }
                                mee.liveLoadingForms = function () {
                                    var $w = $(window);
                                    var th = 100;
                                    var inview = myElement.find(".ulFormBlocks li:last-child").filter(function () {
                                        var $e = $(this),
                                                wt = $w.scrollTop(),
                                                wb = wt + $w.height(),
                                                et = $e.offset().top,
                                                eb = et + $e.height();
                                        return eb >= wt - th && et <= wb + th;
                                    });
                                    if (inview.length && inview.attr("data-load")) {
                                        inview.removeAttr("data-load");
                                        myElement.find(".form-footer-loading").show();
                                        mee._LoadFormBlocks(20);
                                    }
                                }
                                myElement.find("#clearsearch-image").click(function () {
                                    myElement.find("#clearsearch-image").hide();
                                    myElement.find("input#searchImg").val('');
                                    myElement.find("#ILResultDiv").hide();
                                    LoadImagesInLibrary();
                                })
                                myElement.find(".images-accordion").scroll(_.bind(mee.liveLoading, mee));
                                myElement.find(".forms-accordion").scroll(_.bind(mee.liveLoadingForms, mee));
                                var _imageAjaxParameters = null;
                                if (options.ImagesAjaxProperties != null) {
                                    _imageAjaxParameters = new Object();
                                    _imageAjaxParameters.Url = options.ImagesAjaxProperties.Url;
                                    _imageAjaxParameters.Data = options.ImagesAjaxProperties.Data;
                                    _imageAjaxParameters.DataType = options.ImagesAjaxProperties.DataType != "" ? options.ImagesAjaxProperties.DataType : "json";
                                    _imageAjaxParameters.Type = options.ImagesAjaxProperties.Type != "" ? options.ImagesAjaxProperties.Type : "POST";
                                    _imageAjaxParameters.ContentType = options.ImagesAjaxProperties.ContentType != "" ? options.ImagesAjaxProperties.ContentType : "application/json; charset=latin1";
                                }

                                if (_imageAjaxParameters != null) {

                                    var LoadImagesInLibrary = function (offset) {
                                        if (offset) {
                                            _offset = _offset + offset;
                                        }
                                        else {
                                            imageListGlobal = [];
                                            _offset = 0;
                                            myElement.find(".imageLib").children().remove();
                                            options._app.showLoading("Loading Images...", myElement.find(".imageLib"), {
                                                "width": "140px",
                                                "margin-left": "-70px"
                                            });
                                        }
                                        _imageAjaxParameters.Url = "/pms/io/publish/getImagesData/?" + options._BMSTOKEN + "&type=list&offset=" + _offset;
                                        returnData = SendServerRequest(_imageAjaxParameters);
                                        var obj = returnData;
                                        if (obj != null && obj != undefined) {
                                            if (obj.images && obj.images[0]) {
                                                _.each(obj.images[0], function (val, key) {
                                                    imageListGlobal.push(val[0]);
                                                })

                                            }
                                            var imagesHTML = getImagesMarkup(obj.images);
                                            if (imagesHTML != "") {
                                                var oImages = $(imagesHTML);
                                                oImages.find(".draggableControl").andSelf().filter(".draggableControl").each(function (index, element) {
                                                    InitializeMainDraggableControls($(element));
                                                });
                                                myElement.find(".imageLib").append(oImages);

                                                if (myElement.find(".imageLib li").length < parseInt(returnData.totalCount)) {
                                                    myElement.find(".imageLib li:last-child").attr("data-load", "true");
                                                }
                                                myElement.find(".footer-loading").hide();
                                            }
                                        }
                                        options._app.showLoading(false, myElement.find(".imageLib"));
                                    }

                                    LoadImagesInLibrary();
                                }
                                // ------------------ End Load Images --------------//

                                // ------------------ Start Image Search --------------//
                                var _searchImagesAjaxParameters = null;
                                if (options.SearchImagesProperties != null) {
                                    _searchImagesAjaxParameters = new Object();
                                    _searchImagesAjaxParameters.Url = options.SearchImagesProperties.Url;
                                    _searchImagesAjaxParameters.Data = options.SearchImagesProperties.Data;
                                    _searchImagesAjaxParameters.DataType = options.SearchImagesProperties.DataType != "" ? options.SearchImagesProperties.DataType : "json";
                                    _searchImagesAjaxParameters.Type = options.SearchImagesProperties.Type != "" ? options.SearchImagesProperties.Type : "POST";
                                    _searchImagesAjaxParameters.ContentType = options.SearchImagesProperties.ContentType != "" ? options.SearchImagesProperties.ContentType : "application/json; charset=latin1";
                                }

                                var SearchImages = function (searchText) {
                                    _offset = 0;
                                    myElement.find("#clearsearch-image").show();
                                    var data = {
                                        searchText: searchText
                                    };
                                    imageListGlobal = [];
                                    options._app.showLoading("Loading Images...", myElement.find(".imageLib"), {
                                        "width": "140px",
                                        "margin-left": "-70px"
                                    });
                                    _searchImagesAjaxParameters.Data = JSON.stringify(data);
                                    _searchImagesAjaxParameters.Url = options.SearchImagesProperties.Url + searchText;
                                    returnData = SendServerRequest(_searchImagesAjaxParameters);
                                    var obj = returnData;
                                    if (obj != null && obj != undefined) {
                                        if (obj.images && obj.images[0]) {
                                            _.each(obj.images[0], function (val, key) {
                                                imageListGlobal.push(val[0]);
                                            })

                                        }
                                        var imagesHTML = getImagesMarkup(obj.images);
                                        var oImages = $(imagesHTML);
                                        myElement.find(".imageLib").html(oImages);
                                        oImages.find(".draggableControl").andSelf().filter(".draggableControl").each(function (index, element) {
                                            InitializeMainDraggableControls($(element));
                                        });
                                        myElement.find("#ILResultDiv").html(obj.count + " records Found.");
                                        myElement.find("#ILResultDiv").show();
                                    }
                                    options._app.showLoading(false, myElement.find(".imageLib"));
                                };

                                myElement.find("input#searchImg").keyup(function (e) {
                                    if (e.which == 13) {
                                        //console.log("enter pressed");
                                        var searchText = myElement.find(".searchimg-text").val();
                                        if (searchText == "") {
                                            LoadImagesInLibrary();
                                            myElement.find("#ILResultDiv").hide();
                                            myElement.find("input#searchImg").val('');
                                            myElement.find("#clearsearch-image").hide();
                                        }
                                        else {
                                            SearchImages(searchText);
                                        }
                                        return false;
                                    }

                                });

                                myElement.find(".search-img").click(function () {
                                    var searchText = myElement.find(".searchimg-text").val();
                                    if (searchText == "") {
                                        LoadImagesInLibrary();
                                    }
                                    else {
                                        SearchImages(searchText);
                                    }
                                    return false;
                                });

                                // ------------------ End Image Search --------------//

                                // ------------------ Start Image upload --------------//

                                myElement.find(".uploadFile").click(function () {                                    
                                    myElement.find("#myUploadFile").click();
                                    return false;
                                });

                                myElement.find("#myUploadFile").change(function (e) {
                                    myElement.find("#form1").submit();
                                    return true;
                                });


                                //Callback handler for form submit event
                                myElement.find("#form1").submit(function (e) {
                                    var formObj = $(this);
                                    var formURL = "/pms/io/publish/saveImagesData/?" + options._BMSTOKEN + "&type=add";
                                    var formData = new FormData(this);
                                    options._app.showLoading("Uploading Image...", myElement.find(".imageLib"), {
                                        "width": "140px",
                                        "margin-left": "-70px"
                                    });
                                    $.ajax({
                                        url: formURL,
                                        type: 'POST',
                                        data: formData,
                                        mimeType: "multipart/form-data",
                                        contentType: false,
                                        cache: false,
                                        processData: false,
                                        success: function (data, textStatus, jqXHR) {                                            
                                            options._app.showLoading(false, myElement.find(".imageLib"));
                                            var result = jQuery.parseJSON(data);
                                            if (result.success) {
                                                options._app.showMessge("Image has been successfully uploaded.", $("body"));
                                                LoadImagesInLibrary();
                                            }
                                            else {
                                                options._app.showAlert(result.err1, $("body"));
                                            }
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            options._app.showLoading(false, myElement.find(".imageLib"));                                            
                                            options._app.showAlert(e, $("body"));
                                        }
                                    });
                                    e.preventDefault(); //Prevent Default action.

                                });

                                // ------------------ End Image upload --------------//

                                // ------------------ Start Image Delete --------------//

                                var _deleteImageAjaxParameter = null;
                                if (options.DeleteImageProperties != null) {
                                    _deleteImageAjaxParameter = new Object();
                                    _deleteImageAjaxParameter.Url = options.DeleteImageProperties.Url;
                                    _deleteImageAjaxParameter.Data = options.DeleteImageProperties.Data;
                                    _deleteImageAjaxParameter.DataType = options.DeleteImageProperties.DataType != "" ? options.DeleteImageProperties.DataType : "json";
                                    _deleteImageAjaxParameter.Type = options.DeleteImageProperties.Type != "" ? options.DeleteImageProperties.Type : "POST";
                                    _deleteImageAjaxParameter.ContentType = options.DeleteImageProperties.ContentType != "" ? options.DeleteImageProperties.ContentType : "application/json; charset=latin1";
                                }

                                var DeleteImage = function (imageId) {
                                    _deleteImageAjaxParameter.Url = options.DeleteImageProperties.Url + imageId;
                                    returnData = SendServerRequest(_deleteImageAjaxParameter);
                                    LoadImagesInLibrary();
                                }

                                myElement.on("click", "a.confirm-del", function () {
                                    var obj = $(this);
                                    var imageId = obj.data("id");
                                    obj.parent().hide();
                                    DeleteImage(imageId);
                                    return false;
                                });

                                // ------------------ End Image Delete --------------//

                                // ---------------- Start Image Tags ---------------//

                                var _saveImageTagsAjaxParameters = null;
                                if (options.SaveImageTagsProperties != null) {
                                    _saveImageTagsAjaxParameters = new Object();
                                    _saveImageTagsAjaxParameters.Url = options.SaveImageTagsProperties.Url;
                                    _saveImageTagsAjaxParameters.Data = options.SaveImageTagsProperties.Data;
                                    _saveImageTagsAjaxParameters.DataType = options.SaveImageTagsProperties.DataType != "" ? options.SaveImageTagsProperties.DataType : "json";
                                    _saveImageTagsAjaxParameters.Type = options.SaveImageTagsProperties.Type != "" ? options.SaveImageTagsProperties.Type : "POST";
                                    _saveImageTagsAjaxParameters.ContentType = options.SaveImageTagsProperties.ContentType != "" ? options.SaveImageTagsProperties.ContentType : "application/json; charset=latin1";
                                }

                                var SaveImageTags = function (tags, imageId) {
                                    if (tags != null && imageId != null) {
                                        var data = {
                                            imageId: imageId,
                                            tags: tags
                                        };
                                        var jsonData = JSON.stringify(data);
                                        _saveImageTagsAjaxParameters.Data = jsonData;
                                        _saveImageTagsAjaxParameters.Url = options.SaveImageTagsProperties.Url + imageId + "&tags=" + tags;
                                        returnData = SendServerRequest(_saveImageTagsAjaxParameters);
                                        LoadImagesInLibrary();
                                    }
                                }
                                myElement.on("click", "a.addtag", function () {
                                    var element = $(this);
                                    var tagscontainer = element.siblings("div.tagscont").children("ul");
                                    var inputElement = element.siblings("input.tginput");
                                    var strtag = inputElement.val();
                                    if (strtag != "") {
                                        tagscontainer.append("<li><a class='tag' href='#.'><span>" + strtag + "</span><i class='icon cross remove-tag'></i></a> </li>");
                                        inputElement.val("");
                                    }
                                    var imageId = element.data("id");
                                    var tags = "";
                                    var tagsContainer = element.siblings("div.tagscont").children("ul").children("li");
                                    $.each(tagsContainer, function (index, value) {
                                        if (index == 0)
                                            tags += $(this).find("span").text();
                                        else
                                            tags += "," + $(this).find("span").text();
                                    });
                                    if (imageId != null && tags != "") {
                                        SaveImageTags(tags, imageId);
                                    }

                                });


                                myElement.on("keyup", "#addTagsToImage", function (e) {
                                    //console.log("Tags input key up");
                                    if (e.which == 13) {
                                        //console.log("enter pressed");
                                        myElement.find("a.addtag").click();
                                    }

                                });

                                myElement.on("click", "i.remove-tag", function () {
                                    var element = $(this);
                                    element.parent().parent().remove();
                                    return false;
                                });

                                myElement.on("click", "a.closebtn-imgtag", function () {                                    
                                    var element = $(this);
                                    var imageId = element.data("id");
                                    var tags = "";
                                    var tagsContainer = element.siblings("div.tagscont").children("ul").children("li");
                                    $.each(tagsContainer, function (index, value) {
                                        if (index == 0)
                                            tags += $(this).find("span").text();
                                        else
                                            tags += "," + $(this).find("span").text();
                                    });
                                    if (imageId != null && tags != "") {
                                        SaveImageTags(tags, imageId);
                                    }
                                    return false;
                                });

                                var showLoadingWheel = function (isShow, ele) {
                                    if (isShow)
                                        ele.append("<div class='loading-wheel right' style='margin-left:5px;margin-top: 9px;position: inherit!important;'></div>")
                                    else {
                                        var ele = ele.find(".loading-wheel");
                                        ele.remove();
                                    }
                                }

                                var ShowImagePreview = function (args) {
                                    if (args != null && args != undefined) {

                                        var dialog_width = $(document.documentElement).width() - 60;
                                        var dialog_height = $(document.documentElement).height() - 162;
                                        var dialog = options._app.showDialog({title: " " + args.Name,
                                            css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "20px"},
                                            headerEditable: true,
                                            headerIcon: '_graphics',
                                            bodyCss: {"min-height": dialog_height + "px"}
                                        });

                                        dialog.$el.find('.pointy').hide();
                                        dialog.$el.find("camp_header .icon").css("margin", "0px");
                                        dialog.$el.find('.dialog-title').addClass('images-preview');
                                        if (dialog.$el.find('.c-current-status').length > 0) {
                                            dialog.$el.find('.c-current-status').hide();
                                        }
                                        var dialogArrayLength = options._app.dialogArray.length; // New Dialog
                                        var wrapelement = 'dialogWrap-' + dialogArrayLength; // New Dialog
                                        var img = "<img id='img1' src= '" + args.URL + "' class='" + wrapelement + "'>";
                                        dialog.getBody().append(img);
                                        showLoadingWheel(true, dialog.$el.find(".images-preview"));
                                        $('#img1').load(function () {
                                            showLoadingWheel(false, dialog.$el.find(".images-preview"));
                                        });
                                    }
                                }

                                myElement.find(".closeImagePreview").click(function () {
                                    closeimgPreview();
                                    return false;
                                });

                                function openinnewTab(url) {
                                    var win = window.open(url, '_blank');
                                    win.focus();
                                }

                                function closeimgPreview() {
                                    var window = myElement.find('.imgpreview-container');
                                    window.find("div.modal-body").children("img").attr('src', '');
                                    window.hide();
                                }

                                myElement.on("click", "i,action", function () {
                                    var element = $(this);
                                    var type = element.data("actiontype");
                                    var imgid = element.data("id");
                                    var imgurl = element.data("url");
                                    var imgname = element.data("name");
                                    var index = element.data("index");
                                    if (index && (type === "imageInfo" || type === "imageLink" || type === "imagePreview" || type === "imageTag" || type === "imageDelete")) {
                                        index = parseInt(index.substr(5)) - 1;
                                    }

                                    var imageParams = {
                                        ID: imgid,
                                        URL: imgurl,
                                        Name: imgname
                                    };


                                    if (type === "imageInfo") {
                                        myElement.find('.info-windowDiv').hide();
                                        myElement.find('.link-windowDiv').hide();
                                        myElement.find('.tag-windowDiv').hide();
                                        myElement.find('.del-windowDiv').hide();
                                        myElement.find('.BBDeleteDialog').hide();
                                        myElement.find('.BBEditDialog').hide();
                                        myElement.find('.DCDeleteDialog').hide();
                                        myElement.find('.DCEditDialog').hide();


                                        var imageObj = imageListGlobal[index];

                                        // var fileName = imageObj.fileName;
                                        // console.log("FileName extracted for image is:"+fileName);
                                        showBox(element, imageObj, "info");
                                    }
                                    else if (type === "imageLink") {
                                        myElement.find('.info-windowDiv').hide();
                                        myElement.find('.link-windowDiv').hide();
                                        myElement.find('.tag-windowDiv').hide();
                                        myElement.find('.del-windowDiv').hide();
                                        myElement.find('.BBDeleteDialog').hide();
                                        myElement.find('.BBEditDialog').hide();
                                        myElement.find('.DCDeleteDialog').hide();
                                        myElement.find('.DCEditDialog').hide();


                                        // element.siblings('.link-window').show();
                                        var imageObj = imageListGlobal[index];

                                        showBox(element, imageObj, "link");
                                    }
                                    else if (type === "imagePreview") {
                                        ShowImagePreview(imageParams);
                                    }
                                    else if (type === "imageTag") {
                                        myElement.find('.info-windowDiv').hide();
                                        myElement.find('.link-windowDiv').hide();
                                        myElement.find('.tag-windowDiv').hide();
                                        myElement.find('.del-windowDiv').hide();
                                        myElement.find('.BBDeleteDialog').hide();
                                        myElement.find('.BBEditDialog').hide();
                                        myElement.find('.DCDeleteDialog').hide();
                                        myElement.find('.DCEditDialog').hide();


                                        // element.siblings('.tag-window').show();
                                        var imageObj = imageListGlobal[index];

                                        showBox(element, imageObj, "tag");
                                    }
                                    else if (type === "imageDelete") {
                                        myElement.find('.info-windowDiv').hide();
                                        myElement.find('.link-windowDiv').hide();
                                        myElement.find('.tag-windowDiv').hide();
                                        myElement.find('.del-windowDiv').hide();
                                        myElement.find('.BBDeleteDialog').hide();
                                        myElement.find('.BBEditDialog').hide();
                                        myElement.find('.DCDeleteDialog').hide();
                                        myElement.find('.DCEditDialog').hide();

                                        var imageObj = imageListGlobal[index];

                                        showBox(element, imageObj, "delete");
                                    }

                                    else if (type === "bbdel") {
                                        myElement.find('.info-windowDiv').hide();
                                        myElement.find('.link-windowDiv').hide();
                                        myElement.find('.tag-windowDiv').hide();
                                        myElement.find('.del-windowDiv').hide();
                                        myElement.find('.BBDeleteDialog').hide();
                                        myElement.find('.BBEditDialog').hide();
                                        myElement.find('.DCDeleteDialog').hide();
                                        myElement.find('.DCEditDialog').hide();

                                        var bbObj = buildingBlocksGlobal[index][0];

                                        showBox(element, bbObj, "bbdel");
                                    }
                                    else if (type === "bbedit") {
                                        myElement.find('.info-windowDiv').hide();
                                        myElement.find('.link-windowDiv').hide();
                                        myElement.find('.tag-windowDiv').hide();
                                        myElement.find('.del-windowDiv').hide();
                                        myElement.find('.BBDeleteDialog').hide();
                                        myElement.find('.BBEditDialog').hide();
                                        myElement.find('.DCDeleteDialog').hide();
                                        myElement.find('.DCEditDialog').hide();

                                        var bbObj = buildingBlocksGlobal[index][0];

                                        showBox(element, bbObj, "bbedit");
                                    }
                                    else if (type === "dcdel") {
                                        myElement.find('.info-windowDiv').hide();
                                        myElement.find('.link-windowDiv').hide();
                                        myElement.find('.tag-windowDiv').hide();
                                        myElement.find('.del-windowDiv').hide();
                                        myElement.find('.BBDeleteDialog').hide();
                                        myElement.find('.BBEditDialog').hide();
                                        myElement.find('.DCDeleteDialog').hide();
                                        myElement.find('.DCEditDialog').hide();

                                        var dcObj = dynamicBlocksGlobal[index][0];

                                        showBox(element, dcObj, "dcdel");
                                    }
                                    else if (type === "dcedit") {
                                        myElement.find('.info-windowDiv').hide();
                                        myElement.find('.link-windowDiv').hide();
                                        myElement.find('.tag-windowDiv').hide();
                                        myElement.find('.del-windowDiv').hide();
                                        myElement.find('.BBDeleteDialog').hide();
                                        myElement.find('.BBEditDialog').hide();
                                        myElement.find('.DCDeleteDialog').hide();
                                        myElement.find('.DCEditDialog').hide();

                                        var dcObj = dynamicBlocksGlobal[index][0];

                                        showBox(element, dcObj, "dcedit");
                                    }
                                    else if (type === "fbedit") {                                        
                                        loadForm(imgid);
                                    }
                                    else if (type === "fbdel") {                                        
                                        var form_id = element.data("id");
                                        var element = $(element).parents("li");                                                                                
                                        options._app.showAlertDetail({
                                            heading: 'Confirm Deletion',
                                            detail: "Do you want to delete this Form ?",
                                            callback: _.bind(function () {
                                                this.deleteForm(element, form_id);
                                            }, mee)
                                        },
                                        $("body"));
                                    }
                                    return false;
                                });


                                myElement.find("#HTML5FileUploader").on("dragenter", function (e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    console.log("drag enter called..");
                                    //myElement.find(".divBuildingBlockLoadingImages").show();                                            
                                });

                                myElement.find("#HTML5FileUploader").on("dragover", function (e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                });



                                myElement.find("#HTML5FileUploader").on("dragleave", function (e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                });




                                myElement.find("#HTML5FileUploader").on("drop", function (e) {
                                    console.log("drop called..");
                                    e.stopPropagation();
                                    e.preventDefault();
                                    var files = e.originalEvent.dataTransfer.files;
                                    // console.log("Dropped Files Are:"+ files);

                                    // console.log(files);
                                    handleFileUpload(files);
                                    //myElement.find(".divBuildingBlockLoadingImages").hide();
                                    // this.$element.addClass('file-border');
                                });

                                var handleFileUpload = function (files) {
                                    for (var i = 0; i < files.length; i++) {
                                        if (validateIfImage(files[i])) {
                                            var fd = new FormData();
                                            fd.append('fileName', files[i]);
                                            this.name = files[i];
                                            sendFileToServer(fd);
                                        }
                                    }
                                }

                                var validateIfImage = function (file) {
                                    var isImage = true;
                                    if (file.type.indexOf("image") < 0) {
                                        //this.app.showAlert("Please select a image with extension jpeg,jpg,png or gif.",$("body"),{fixed:true})
                                        isImage = false
                                    }
                                    return isImage;
                                }


                                var sendFileToServer = function (formData) {
                                    var uploadURL = myElement.find("#form1").attr("action");
                                    console.log("URL To post is:" + uploadURL);
                                    var _this = this;
                                    var data_id = 0;
                                    var jqXHR = $.ajax({
                                        xhr: function () {
                                            var xhrobj = $.ajaxSettings.xhr();
                                            if (xhrobj.upload) {
                                                xhrobj.upload.addEventListener('progress', function (event) {
                                                    var percent = 0;
                                                    var position = event.loaded || event.position;
                                                    var total = event.total;
                                                    if (event.lengthComputable) {
                                                        percent = Math.ceil(position / total * 100);
                                                    }
                                                }, false);
                                            }
                                            return xhrobj;
                                        },
                                        url: uploadURL,
                                        type: "POST",
                                        contentType: false,
                                        processData: false,
                                        cache: false,
                                        async: false,
                                        data: formData,
                                        success: function (data) {
                                            options._app.showMessge("Image has been successfully uploaded.", $("body"));
                                            LoadImagesInLibrary();
                                        }
                                        ,
                                        error: function () {
                                            options._app.showAlert("Faild uploading image...", $("body"));
                                        }
                                    });

                                }

//**************************************************************End Images Library***********************************************************************************///

//**************************************************************Dynamic Variation Contents***********************************************************************************///Section4                      

                                var dynamicBlocksGlobal = "";
                                function DynamicVariation() {
                                    this.DynamicVariationID = 0;
                                    this.DynamicVariationCode = "";
                                    this.Label = "";
                                    this.IsUpdate = false;
                                    this.ListOfDynamicContents = new Array();
                                }

                                function DynamicContents() {
                                    this.DynamicVariationID = 0;
                                    this.DynamicContentID = 0;
                                    this.Label = "Default";
                                    this.IsDefault = false;
                                    this.ApplyRuleCount = "A";
                                    this.InternalContents = "";
                                    this.IsUpdate = false;
                                    this.ListOfDynamicRules = new Array();
                                }

                                function DynamicRules() {
                                    this.DynamicRuleID = 0;
                                    this.RuleFieldName = "";
                                    this.RuleCondition = "";
                                    this.RuleDefaultValue = "";
                                    this.RuleMatchValue = "";
                                }

                                //myElement.find(".dcSaveButton").click(function () {
                                var dcRulesContainer = myElement.find(".dynamic_inputs_list");
                                var dcInternalContents = myElement.find(".dcInternalContents");
                                var dcRuleTemplate = myElement.find(".dcRuleRowTemplate");
                                //var dcRulesDialog = myElement.find(".dcRulesDialog");
                                //var dcRuleLabel = dcRulesDialog.find(".dcRuleLabel");
                                var actionButtons = myElement.find(".divActionButtonsForBuildingBlock");




                                function InitializeDynamicControl(args) {


                                    var PopulateContent = function (args) {

                                        if (args.DynamicVariation != null) {

                                            args.predefinedControl.Html.find(".dcName span:first").html(args.DynamicVariation.Label);
                                            args.predefinedControl.Html.find(".dcName span:first").click(onSaveContent)
                                            var dcContents = args.predefinedControl.Html.find(".dcContents");

                                            if (args.DynamicVariation.ListOfDynamicContents.length > 0) {
                                                var firstBlock = false;
                                                $.each(args.DynamicVariation.ListOfDynamicContents, function (i, variation) {

                                                    //var ContentLi = $("<li>" + variation.Label + "</li>");

                                                    if (variation.Label == "Default") {
                                                        var ContentLi = defaultLiContentForDC.clone();
                                                        var _html = $('<div/>').html(variation.InternalContents).text();
                                                        ContentLi.data("dcInternalData", $(reConstructCode("<div>" + _html + "</div>").html()));
                                                        ContentLi.data("content", variation);
                                                        ContentLi.addClass("defaultLi");
                                                        var dcInternal = args.droppedElement.find(".dcInternalContents:first");

                                                        //args.clickedLi = ContentLi;
                                                        var defaultInternalContent = $(ContentLi.data("dcInternalData"));
                                                        //oInitDestroyEvents.InitAll(defaultInternalContent);

                                                        dcInternal.html(defaultInternalContent);

                                                        OnFilterClick(ContentLi);
                                                        OnEditContentName(ContentLi);
                                                        OnDeleteContent(ContentLi);

                                                        dcContents.prepend(ContentLi);

                                                        //ContentLi.trigger( "click" );                        
                                                    }
                                                    else {
                                                        var ContentLi = $(myElement.find(".dcLI").html());
                                                        ContentLi.find("span:first").html(variation.Label);
                                                        ContentLi.data("content", variation);
                                                        ContentLi.attr("id", variation.DynamicContentID)
                                                        var _html = $('<div/>').html(variation.InternalContents).text();
                                                        ContentLi.data("dcInternalData", $(reConstructCode("<div>" + _html + "</div>").html()));
                                                        if (firstBlock === false) {
                                                            var dcInternal = args.droppedElement.find(".dcInternalContents:first");
                                                            var defaultInternalContent = $(ContentLi.data("dcInternalData"));
                                                            dcInternal.html(defaultInternalContent);
                                                            args.droppedElement.find("li.defaultLi").removeClass("active");
                                                            ContentLi.addClass("active");
                                                            firstBlock = true;
                                                        }
                                                        OnFilterClick(ContentLi);
                                                        OnEditContentName(ContentLi);
                                                        OnDeleteContent(ContentLi);

                                                        dcContents.append(ContentLi);
                                                    }

                                                });
                                            }

                                        }
                                    }


                                    var OpenRulesWindow = function (args, top, left) {
                                        var filterDialog = myElement.find(".dcRulesDialog");
                                        options._app.showLoading("Loading Filters...", filterDialog.find("div"), {"top": "51px", "left": "50%", "margin-left": "-150px"});
                                        require(["editor/DC/filters"], function (templatePage) {
                                            var mPage = new templatePage({
                                                opt: options,
                                                args: args
                                            });
                                            filterDialog.html(mPage.$el);
                                        });
                                        meeIframe.find(".editNameBox").hide();
                                        filterDialog.css({"left": left, "top": top, "display": "block"});
                                        return false;
                                    }

                                    var OnFilterClick = function (element) {
                                        element.find("i.filter").click(function (event) {
                                            var parentLi = $(event.target).parents("li:first");
                                            parentLi.click();
                                            event.stopPropagation();                                                                                        
                                            args.clickedLi = parentLi;

                                            args.IsUpdate = true;
                                            args.DynamicContent = args.clickedLi.data("content");

                                            var _ele = $(this);
                                            var ele_offset = _ele.offset();
                                            var top = ele_offset.top + 80;
                                            var left = ele_offset.left + 50;
                                            OpenRulesWindow(args, top, left);                                            
                                        });
                                    }

                                    var getDynamicContent = function (element) {
                                        var _dc = null;
                                        if (element.data("content")) {
                                            _dc = element.data("content");
                                        }
                                        else if (element.attr("id")) {
                                            var contentId = element.attr("id");
                                            var contents = args.DynamicVariation.ListOfDynamicContents;
                                            for (var i = 0; i < contents.length; i++) {
                                                if (contents[i].DynamicContentID == contentId) {
                                                    _dc = contents[i];
                                                    break;
                                                }
                                            }
                                        }
                                        return _dc;
                                    }

                                    var OnEditContentName = function (element) {

                                        element.find(".btnContentEditName").click(function (event) {

                                            event.stopPropagation();

                                            args.DynamicContent = getDynamicContent(element);
                                            var dc = meeIframe.find("table[keyword='" + args.ID + "']");

                                            var dcContentNameUpdateWindow = dc.find(".dcContentNameUpdate");
                                            dcContentNameUpdateWindow.height(dc.height());
                                            dcContentNameUpdateWindow.find(".txtContentName").val(args.DynamicContent.Label);
                                            myElement.find(".dcRulesDialog").hide();
                                            meeIframe.find(".editNameBox").hide();
                                            dcContentNameUpdateWindow.show();
                                            var txtfieldContent = dcContentNameUpdateWindow.find(".txtContentName");
                                            txtfieldContent.focus();
                                            var btnUpdateContent = dcContentNameUpdateWindow.find(".btnUpdateContent");

                                            var updateContent = function () {
                                                txtfieldContent.prop("disabled", true);
                                                btnUpdateContent.addClass("saving");
                                                args.DynamicContent = getDynamicContent(element);

                                                //console.log(element.data("content"));
                                                args.DynamicContent.Label = dcContentNameUpdateWindow.find(".txtContentName").val();
                                                if (element.attr("id")) {
                                                    meeIframe.find("li[id='" + element.attr("id") + "'] span:first").html(args.DynamicContent.Label);
                                                } else {
                                                    element.find("span:first").html(args.DynamicContent.Label);
                                                }

                                                if (options.OnUpdateDynamicContent != null) {
                                                    options.OnUpdateDynamicContent(args);
                                                }
                                                txtfieldContent.prop("disabled", false);
                                                btnUpdateContent.removeClass("saving");
                                                dcContentNameUpdateWindow.hide();
                                            }
                                            txtfieldContent.keyup(function (e) {
                                                if (e.keyCode === 13) {
                                                    updateContent();
                                                }
                                            })
                                            //Event
                                            btnUpdateContent.click(function (event) {
                                                event.stopPropagation();
                                                updateContent();
                                                $(this).unbind("click");

                                            });

                                            //Event
                                            dcContentNameUpdateWindow.find(".btnUpdateCancelContent").click(function (event) {
                                                event.stopPropagation();
                                                dcContentNameUpdateWindow.hide();
                                                $(this).unbind("click");
                                            });

                                        });
                                    }

                                    var OnDeleteContent = function (element) {
                                        element.find(".btnContentDelete").click(function (event) {

                                            event.stopPropagation();
                                            if ($("table[keyword='" + args.ID + "'] .dcContents > li").length !== 2) {
                                                args.DynamicContent = getDynamicContent(element);

                                                if (options.OnDeleteDynamicContent != null) {

                                                    options.OnDeleteDynamicContent(args);
                                                }

                                                //Activate Default here.
                                                element.siblings(".defaultLi").trigger("click");

                                                element.remove();
                                                if (element.attr("id")) {
                                                    meeIframe.find("li[id='" + element.attr("id") + "']").remove()
                                                } else {
                                                    element.remove();
                                                }
                                            }
                                            else {
                                                options._app.showAlert("You cann't delete this option. Dynamic content block should have at least one option.", $("body"), {type: 'caution'});
                                            }

                                        });
                                    }
                                    var onSaveContent = function () {
                                        var dc = meeIframe.find("table[keyword='" + args.ID + "']");
                                        var dcInternal = dc.find(".dcInternalContents:first");
                                        args.clickedLi = dc.find(".block_body li.active");
                                        args.IsUpdate = false;
                                        var previuosActivate = args.clickedLi;
                                        previuosActivate.data("dcInternalData", dcInternal.html());
                                        if (options.OnDynamicContentSwap != null) {
                                            args.DynamicContent = previuosActivate.data("content");
                                            args.DynamicContent.InternalContents = CleanCode($("<div>" + previuosActivate.data("dcInternalData") + "</div>")).html();
                                            options.OnDynamicContentSwap(args);
                                        }
                                    }

                                    if (args.predefinedControl != null) {

                                        // var mainParent = args.predefinedControl.Html.find(".dynamicContentContainer");
                                        var mainParent = $(args.predefinedControl.Html);//.find(".dynamicContentContainer");

                                        mainParent.data("variationID", args.DynamicVariation.DynamicVariationID);
                                        mainParent.attr("id", args.DynamicVariation.DynamicVariationID);
                                        mainParent.attr("keyword", args.DynamicVariation.DynamicVariationCode);
                                        mainParent.data("content", args.DynamicVariation);


                                        dcInternalContents = args.predefinedControl.Html.find(".dcInternalContents");

                                        PopulateContent(args);
                                        var txtVariationName = args.predefinedControl.Html.find(".txtVariationName");
                                        //Edit Button
                                        args.predefinedControl.Html.find(".editname").click(function () {
                                            myElement.find(".dcRulesDialog").hide();
                                            var dc = meeIframe.find("table[keyword='" + args.ID + "']");
                                            dc.find(".editNameBox").toggle();
                                            dc.find(".editNameBox").width(415);
                                            dc.find(".txtVariationName").focus();
                                        });

                                        args.predefinedControl.Html.find(".btnCloseDCName").click(function () {
                                            var dc = meeIframe.find("table[keyword='" + args.ID + "']");
                                            dc.find(".editNameBox").hide();
                                        });

                                        txtVariationName.val(args.DynamicVariation.Label);
                                        var saveBtn = args.predefinedControl.Html.find(".btnSaveDCName");

                                        var saveDCName = function () {
                                            var dc = meeIframe.find("table[keyword='" + args.ID + "']");
                                            args.DynamicVariation.Label = dc.find(".txtVariationName").val();
                                            dc.find(".txtVariationName").prop("disabled", true);
                                            dc.find(".btnSaveDCName").addClass("saving");
                                            if (options.OnDynamicVariationName != null) {
                                                options.OnDynamicVariationName(args.DynamicVariation);
                                            }
                                            dc.find(".dcName span:first").html(args.DynamicVariation.Label);
                                            dc.find(".txtVariationName").prop("disabled", false);
                                            dc.find(".btnSaveDCName").removeClass("saving");
                                            dc.find(".editNameBox").hide();
                                            _LoadDynamicBlocks();
                                        }
                                        txtVariationName.keyup(function (e) {
                                            if (e.keyCode === 13) {
                                                saveDCName();
                                            }
                                        })
                                        saveBtn.click(function () {
                                            saveDCName();
                                        });


                                        ///////////                                    
                                        args.predefinedControl.Html.find(".dcContents").on("click", "li", (function (event) { //&&

                                            event.stopPropagation();
                                            args.clickedLi = $(this);
                                            args.IsUpdate = false;

                                            var dcClickedContainer = args.clickedLi.parents(".dynamicContentContainer:first");
                                            var dcInternal = dcClickedContainer.find(".dcInternalContents:first");

                                            //Get previous activated content
                                            if (args.clickedLi.siblings(".active").length > 0) {
                                                var previuosActivate = args.clickedLi.siblings(".active");
                                                oInitDestroyEvents.DestroyPluginsEvents(dcInternal);
                                                previuosActivate.data("dcInternalData", dcInternal.html());
                                                if (options.OnDynamicContentSwap != null) {
                                                    args.DynamicContent = previuosActivate.data("content");
                                                    args.DynamicContent.InternalContents = CleanCode($("<div>" + previuosActivate.data("dcInternalData") + "</div>")).html();

                                                    options.OnDynamicContentSwap(args);
                                                }
                                            }





                                            //Set this element data
                                            if (args.clickedLi.data("dcInternalData") != null) {
                                                var internalData = $(args.clickedLi.data("dcInternalData"));
                                                dcInternal.html(internalData);
                                                oInitDestroyEvents.InitAll(internalData);
                                            }
                                            else {
                                                dcInternal.empty();
                                            }
                                            //////////////

                                            args.clickedLi.siblings().removeClass("active");
                                            args.clickedLi.addClass("active");

                                        }));

                                        var dcContentNameWindow = args.predefinedControl.Html.find(".dcContentName");
                                        dcContentNameWindow.find(".btnCancelContent").click(function (event) {
                                            var dcContentNameWindow = meeIframe.find("table[keyword='" + args.ID + "']").find(".dcContentName");
                                            event.stopPropagation();
                                            dcContentNameWindow.hide();
                                        });

                                        var saveDC = function () {
                                            var content = new DynamicContents();
                                            var dcContentNameWindow = meeIframe.find("table[keyword='" + args.ID + "']").find(".dcContentName");

                                            content.Label = dcContentNameWindow.find(".txtContentName").val();
                                            content.DynamicVariationID = args.DynamicVariation.DynamicVariationID;
                                            dcContentNameWindow.find(".txtContentName").prop("disabled", true);
                                            dcContentNameWindow.find(".btnSaveContent").addClass("saving");
                                            args.DynamicContent = new DynamicContents();
                                            args.DynamicContent = content;
                                            if (options.OnSaveDynamicContent != null) {
                                                options.OnSaveDynamicContent(args);
                                            }
                                            var dcContents = meeIframe.find("table[keyword='" + args.ID + "']").find(".dcContents");
                                            var newLi = $(myElement.find(".dcLI").html());
                                            newLi.find("span:first").html(args.DynamicContent.Label);
                                            newLi.data("content", args.DynamicContent);

                                            OnFilterClick(newLi);
                                            OnEditContentName(newLi);
                                            OnDeleteContent(newLi);

                                            dcContents.append(newLi);
                                            dcContentNameWindow.find(".txtContentName").prop("disabled", false);
                                            dcContentNameWindow.find(".btnSaveContent").removeClass("saving");
                                            dcContentNameWindow.hide();
                                            dcContentNameWindow.find(".txtContentName").val("");
                                            newLi.click();
                                        }

                                        dcContentNameWindow.find(".txtContentName").keyup(function (e) {
                                            if (e.keyCode === 13) {
                                                saveDC();
                                            }
                                        });
                                        dcContentNameWindow.find(".btnSaveContent").click(function () {
                                            saveDC();
                                        });

                                        args.predefinedControl.Html.find(".addDynamicRule").click(function (event) {
                                            event.stopPropagation();
                                            if ($("table[keyword='" + args.ID + "'] .dcContents > li").length < 7) {
                                                myElement.find(".dcRulesDialog").hide();
                                                meeIframe.find(".editNameBox").hide();
                                                var dcContentNameWindow = meeIframe.find("table[keyword='" + args.ID + "']").find(".dcContentName");
                                                dcContentNameWindow.height(meeIframe.find("table[keyword='" + args.ID + "']").height());
                                                dcContentNameWindow.toggle();
                                                dcContentNameWindow.find(".txtContentName").focus();
                                            }
                                            else {
                                                options._app.showAlert("You can add upto 6 options.", $("body"), {type: 'caution'});
                                            }
                                        });

                                    }
                                }


                                myElement.find("input#searchDC").keyup(function (e) {
                                    if (e.which == 13) {
                                        _searchDynamicBlocks();
                                    }

                                });

                                var _searchDynamicBlocks = function (args) {


                                    var ulDynamicBlocks = myElement.find(".ulDynamicBlocks");
                                    ulDynamicBlocks.empty();
                                    var dynamicBlocksFromService = dynamicBlocksGlobal;
                                    var textForSearch = myElement.find("input#searchDC").val();
                                    var counter = 0;
                                    if (textForSearch != null && textForSearch != "") {



                                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                                        $.each(dynamicBlocksFromService, function (i, obj) {

                                            var label = obj[0].label;
                                            if (label.startsWith(textForSearch)) {
                                                counter++;
                                                var block = $("<li class='draggableControl ui-draggable droppedDynamicBlock' draggable='true' data-type='dynamicContentContainer' data-isnew='false' data-id='" + obj[0]["dynamicNumber.encode"] + "' data-keyword='" + obj[0].keyword + "'>" +
                                                        "<i class='icon dyblck'></i> " +
                                                        "<a href='#'> <span class='font_75 bbName'>" + obj[0].label + "</span></a>" +
                                                        "<div class='imageicons' > " +
                                                        "<i class='imgicons edit action' data-actiontype='dcedit'  data-index='" + i + "' data-id='" + obj[0]["dynamicNumber.encode"] + "'></i> " +
                                                        "<i class='imgicons delete right action' data-actiontype='dcdel'  data-index='" + i + "' data-id='" + obj[0]["dynamicNumber.encode"] + "'></i> " +
                                                        " </div>" +
                                                        //actionButtons.html() +
                                                        "</li>");


                                                //Initialize with default draggable:
                                                InitializeMainDraggableControls(block);

                                                //listOfDynamicBlocksHtml.append(block);

                                                ulDynamicBlocks.append(block);

                                            }

                                        });

                                        myElement.find("#DCResultDiv").html(counter + " records Found");
                                        myElement.find("#DCResultDiv").show();



                                    }
                                    else {
                                        _LoadDynamicBlocks();
                                        myElement.find("#DCResultDiv").hide();
                                    }
                                    ///////
                                }


                                var _LoadDynamicBlocks = function (args) {

                                    if (args == null) {
                                        args = new Object();
                                    }

                                    //Call overridden Method here: will use when exposing properties to developer
                                    if (options.LoadDynamicBlocks != null) {
                                        options.LoadDynamicBlocks(args);
                                    }

                                    //Getting building blocks from provided block:
                                    if (args.dynamicBlocks != null) {

                                        var dynamicBlocksFromService = args.dynamicBlocks;
                                        var ulDynamicBlocks = myElement.find(".ulDynamicBlocks");
                                        ulDynamicBlocks.empty();

                                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                                        $.each(dynamicBlocksFromService, function (i, obj) {


                                            var block = $("<li class='draggableControl ui-draggable droppedDynamicBlock' draggable='true' data-type='dynamicContentContainer' data-isnew='false' data-id='" + obj[0]["dynamicNumber.encode"] + "' data-keyword='" + obj[0].keyword + "'>" +
                                                    "<i class='icon dyblck'></i> " +
                                                    "<a href='#'> <span class='font_75 bbName'>" + obj[0].label + "</span></a>" +
                                                    "<div class='imageicons' > " +
                                                    "<i class='imgicons edit action' data-actiontype='dcedit'  data-index='" + i + "' data-id='" + obj[0]["dynamicNumber.encode"] + "'></i> " +
                                                    "<i class='imgicons delete right action' data-actiontype='dcdel'  data-index='" + i + "' data-id='" + obj[0]["dynamicNumber.encode"] + "'></i> " +
                                                    " </div>" +
                                                    //actionButtons.html() +
                                                    "</li>");



                                            //Initialize with default draggable:
                                            InitializeMainDraggableControls(block);

                                            //listOfDynamicBlocksHtml.append(block);

                                            ulDynamicBlocks.append(block);




                                        });

                                        dynamicBlocksGlobal = dynamicBlocksFromService;

                                    }

                                    myElement.find("#DCResultDiv").hide();
                                }

                                function loadDynamicVariationFromServer(keyword, dynamicNumber) {
                                    var dynamicVariation = new DynamicVariation();
                                    var getPart = keyword ? ("keyword=" + keyword) : "dynamicNumber=" + dynamicNumber
                                    var URL = "/pms/io/publish/getDynamicVariation/?" + options._BMSTOKEN + "&type=get&" + getPart;
                                    $.ajax({
                                        url: URL,
                                        //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                        type: "GET",
                                        contentType: "application/json; charset=latin1",
                                        dataType: "json",
                                        cache: false,
                                        async: false,
                                        success: function (e) {
                                            dynamicVariation.DynamicVariationID = e["dynamicNumber.encode"];
                                            dynamicVariation.DynamicVariationCode = e.keyword;
                                            dynamicVariation.Label = e.label;
                                            var listOfDynamicContents = new Array();
                                            if (e.contents != null && e.contents != undefined) {
                                                var contents = e.contents[0];
                                                $.each(contents, function (i, obj) {
                                                    var content = obj[0];
                                                    var dynamicContents = new DynamicContents();
                                                    dynamicContents.DynamicVariationID = e["dynamicNumber.encode"];
                                                    dynamicContents.DynamicContentID = content["contentNumber.encode"];
                                                    dynamicContents.Label = content.label;
                                                    dynamicContents.IsDefault = content.isDefault;
                                                    dynamicContents.ApplyRuleCount = content.ruleCount;
                                                    dynamicContents.InternalContents = content.contents;
                                                    dynamicContents.applyRuleCount = content.applyRuleCount;
                                                    listOfDynamicContents.push(dynamicContents);
                                                    var listOfDynamicRules = new Array();
                                                    if (content.rules != null && content.rules != undefined) {
                                                        var rules = content.rules[0];
                                                        $.each(rules, function (i, obj) {
                                                            listOfDynamicRules.push(obj[0]);
                                                        });
                                                    }

                                                    dynamicContents.ListOfDynamicRules = listOfDynamicRules;
                                                });
                                            }
                                            dynamicVariation.ListOfDynamicContents = listOfDynamicContents;

                                        },
                                        error: function (e) {
                                            console.log("get Dynamic Variation Content failed:" + e);
                                        }
                                    });
                                    console.log(dynamicVariation);
                                    return dynamicVariation;

                                }


                                var _LoadPersonalizeTags = function (args) {

                                    if (args == null) {
                                        args = new Object();
                                    }

                                    //Call overridden Method here: will use when exposing properties to developer
                                    if (options.LoadPersonalizeTags != null) {
                                        options.LoadPersonalizeTags(args);
                                    }

                                    //Getting building blocks from provided block:
                                    if (args.personalizeTags != null) {
                                        
                                        
                                        //listOfPersonalizeTagsHtml.push("{ text: 'Personalize', value: '' }");
                                        var personalizeTagsFromService = args.personalizeTags;

                                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                                        
                                        personalizedTagsGlobal = personalizeTagsFromService;

                                    }

                                }
                                function InitializeDynamicBuildingBlockUpdatePopup() {
                                    myElement.find('.dynamicBuildingBlock_name_edit').dialog({
                                        width: 500,
                                        modal: true,
                                        buttons: [
                                            {
                                                text: "Cancel",
                                                click: function () {
                                                    $(this).dialog('destroy');
                                                    _LastSelectedDynamicBuildingBlock = null;
                                                    UnSelectAllDynamicBlocks();
                                                }
                                            }, {
                                                text: "Ok",
                                                click: function () {
                                                    var args = {
                                                        buildingBlock: null
                                                    };

                                                    //var txtPlaceHolder = $(this).find(".txtPlaceHolder");
                                                    //args.buildingDialogBox = $(this);

                                                    var dynamicVariation = new Object();
                                                    dynamicVariation.Name = $(this).find(".txtPlaceHolder").val();
                                                    dynamicVariation.Id = _LastSelectedDynamicBuildingBlock.data("id");
                                                    args.dynamicVariation = dynamicVariation;
                                                    $(this).dialog('destroy');
                                                    _OnEditDynamicVariation(args);
                                                    _LastSelectedDynamicBuildingBlock = null;
                                                    UnSelectAllDynamicBlocks();
                                                }
                                            }
                                        ]
                                    });
                                }
                                var _OnEditDynamicVariation = function (args) {
                                    console.log("Going to edit Dynamic Variation...");
                                    if (options.OnEditDynamicVariation != null) {
                                        //Call overridden Method here: will use when exposing properties to developer
                                        options.OnEditDynamicVariation(args);
                                    }

                                    _LoadDynamicBlocks(args);
                                }

                                var _OnDeleteDynamicVariation = function (args) {
                                    if (options.OnDeleteDynamicVariation != null) {
                                        //Call overridden Method here: will use when exposing properties to developer
                                        options.OnDeleteDynamicVariation(args);
                                    }

                                    _LoadDynamicBlocks(args);
                                }

                                myElement.on("click", "a.btnSaveDC", function () {
                                    var element = $(this);
                                    var txtBlockName = element.siblings("input.tginput");
                                    var args = new Object();
                                    args.DCName = txtBlockName.val();
                                    args.DCID = element.data("id");

                                    if (options.OnEditDynamicVariation != null) {
                                        options.OnEditDynamicVariation(args);

                                        _LoadDynamicBlocks(args);
                                    }
                                    myElement.find(".DCEditDialog").hide();

                                });

                                myElement.on("click", "a.btnDeleteDC", function () {
                                    var element = $(this);

                                    var args = new Object();
                                    args.DCID = element.data("id");

                                    //Call overridden Method here: will use when exposing properties to developer
                                    if (options.OnDeleteDynamicVariation != null) {
                                        options.OnDeleteDynamicVariation(args);

                                        _LoadDynamicBlocks(args);
                                    }

                                    myElement.find(".DCDeleteDialog").hide();

                                });

                                myElement.find(".editDBB").click(function () {
                                    if (_LastSelectedDynamicBuildingBlock != null) {
                                        var name = _LastSelectedDynamicBuildingBlock.children("span").text();
                                        myElement.find(".editdynamicBlockInputName").val(name);
                                        InitializeDynamicBuildingBlockUpdatePopup();
                                        return false;
                                    }
                                    else {
                                        alert("Please Select a Block First");
                                        return false;
                                    }
                                });

                                myElement.find(".deleteDBB").click(function () {
                                    if (_LastSelectedDynamicBuildingBlock != null) {
                                        var id = _LastSelectedDynamicBuildingBlock.data("id");
                                        var isDel = confirm("Are you sure you want to delete this Block");
                                        if (isDel) {
                                            // Delete Block Server Call
                                            var args = {
                                                buildingBlock: null
                                            };

                                            var dynamicVariation = new Object();
                                            dynamicVariation.Id = _LastSelectedDynamicBuildingBlock.data("id");
                                            args.dynamicVariation = dynamicVariation;
                                            _OnDeleteDynamicVariation(args);
                                            _LastSelectedDynamicBuildingBlock = null;
                                            UnSelectAllDynamicBlocks();
                                        }
                                        else {
                                            _LastSelectedDynamicBuildingBlock = null;
                                            UnSelectAllDynamicBlocks();
                                        }
                                        return false;
                                    }
                                    else {
                                        alert("Please Select a Block First");
                                        return false;
                                    }
                                });

                                myElement.find('.searchDCLink').click(function () {
                                    _searchDynamicBlocks();
                                });

                                function addNewRule() {

                                    var ruleTemplate = $(myElement.find(".dcRuleRowTemplate").html());

                                    ruleTemplate.find(".firstChosen").chosen({
                                        width: "224px"
                                    });
                                    ruleTemplate.find(".secondChosen").chosen({
                                        disable_search_threshold: 10,
                                        width: "180px"
                                    });
                                    ruleTemplate.find(".thirdChosen").chosen({
                                        disable_search_threshold: 10,
                                        width: "150px"
                                    });

                                    //Delete Event
                                    ruleTemplate.find(".delete").click(function () {
                                        ruleTemplate.remove();
                                    });
                                    ////////////////////////////////////

                                    myElement.find(".dynamic_inputs_list").append(ruleTemplate);


                                }

//**************************************************************End dynamic variation blocks***********************************************************************************///                             


//**************************************************** DROPPING, DRAGGING, IMAGE CONTAINERS WORK (CORE FUNCTIONALITY) **************************************************** //Section5            
                                mee.initTinyMCE = function(){
                                    if(meeIframeWindow && meeIframeWindow.tinymce){
                                        meeIframeWindow.$("body").append($("<div id='load_css'></div>"))
                                        meeIframeWindow.tinymce.init({
                                            selector: "div#load_css",
                                            inline: true,
                                            theme: "modern",
                                            skin_url: options._app.get("path") + "css/editorcss",
                                            toolbar_items_size: 'small',
                                            menubar: false,
                                            schema: "html5",
                                            statusbar: true,
                                            object_resizing: false
                                        })
                                        meeIframeWindow.$("div#load_css").remove();
                                    }
                                    else{
                                         setTimeout(_.bind(mee.initTinyMCE,mee),200);
                                    }
                                }
                                
                                function InitializeAndDestroyEvents() {

                                    //Destroy plugin events all event
                                    this.DestroyPluginsEvents = function (element) {
                                        try {
                                            meeIframeWindow.$(element.find("img.imageHandlingClass")).resizable("destroy");
                                        }
                                        catch (e) {
                                            console.log("Exception on destroying resizable on text");
                                        }
                                        //Tiny MCE DESTROY work here:
                                        element.find("div.textcontent").each(function (index, element) {
                                            var tinyEnableElement = $(element);

                                            //Avoid memory leak here
                                            if (tinyEnableElement.hasClass("textcontent")) {
                                                // tinyEnableElement.tinymce().destroy();

                                                //Remove here all attributes that inserted by tinymce except class
                                                var whitelist = ["class", "style"];
                                                tinyEnableElement.each(function () {
                                                    var attributes = this.attributes;
                                                    var i = attributes.length;
                                                    while (i--) {
                                                        var attr = attributes[i];
                                                        if ($.inArray(attr.name, whitelist) == -1)
                                                            this.removeAttributeNode(attr);
                                                    }

                                                });
                                            }

                                        });

                                    }
                                    ////

                                    //Initialize Plugins Event
                                    this.InitializePluginsEvents = function (element) {
                                        try {
                                            element.find(".resizableImage .ui-resizable-handle").remove();
                                            meeIframeWindow.$(element.find(".resizableImage")).resizable("destroy");
                                            meeIframeWindow.$(element.find(".formresizable")).resizable("destroy");
                                        }
                                        catch (e) {
                                        }
                                        if (!meeIframeWindow || !meeIframeWindow.$) {
                                            return false;
                                        }
                                        if (meeIframeWindow.$(element.find(".resizableImage")).resizable) {
                                            meeIframeWindow.$(element.find(".resizableImage")).resizable({
                                                aspectRatio: false,
                                                start:function(event,ui){
                                                    $(this).find(".resizeable-tooltip").remove();
                                                    $(this).append("<div class='resizeable-tooltip'></div>")
                                                },
                                                resize: function( event, ui ) {                                                    
                                                    $(this).find("img").css({"width":$(this).css("width"),"height":$(this).css("height")});
                                                    $(this).find(".resizeable-tooltip").html(parseInt($(this).css("width"))+" × "+parseInt($(this).css("height")));
                                                },
                                                stop: function(event,ui){
                                                    $(this).find(".resizeable-tooltip").remove();
                                                }
                                            });
                                            meeIframeWindow.$(element.find(".formresizable")).resizable({});
                                        }

                                        if (element.find("div.textcontent").length === 0) {
                                            mee.initTinyMCE();
                                        }

                                        element.find("div.textcontent").each(function (index, element) {

                                            meeIframeWindow.tinymce.init({
                                                selector: "div.textcontent",
                                                inline: true,
                                                theme: "modern",
                                                paste_as_text:true,    
                                                skin_url: options._app.get("path") + "css/editorcss",
                                                plugins: 'textcolor table anchor autolink advlist paste',
                                                //script_url: '/scripts/libs/tinymce/tinymce.min.js',
                                                toolbar1: "LinksButton | personalizeMenu | fontselect fontsizeselect | foreTextColor | backTextColor | bold italic underline | subscript superscript | alignleft aligncenter alignright | bullist numlist",
                                                fontsize_formats: "8pt 10pt 12pt 13pt 14pt 15pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 36pt",
                                                setup: function (editor) {
                                                    if (meeIframe.find("#" + editor.id).data('tinymce') == undefined) {
                                                        meeIframe.find("#" + editor.id).data('tinymce', true);
                                                        editor.on("mouseDown", function (e) {
                                                            selectedLinkFromTinyMCE = e.target;
                                                        });
                                                        editor.on("AddUndo", function (e) {
                                                            if (editor.undoManager.hasUndo() || editor.undoManager.hasRedo()) {
                                                                makeCloneAndRegister();
                                                            }
                                                        });
                                                        editor.on("mouseUp", function (e) {
                                                            myElement.find(".alertButtons").hide();
                                                            var tiny_editor_selection = editor.selection;
                                                            var currentNode = tiny_editor_selection.getNode();
                                                            isElementClicked = false;
                                                            if (currentNode.nodeName == "a" || currentNode.nodeName == "A") {
                                                                editor.selection.select(selectedLinkFromTinyMCE);
                                                                var selected_element_range = meeIframeWindow.tinyMCE.activeEditor.selection.getRng();
                                                                showAlertButtons(currentNode, selectedLinkFromTinyMCE.href);
                                                                isElementClicked = true;
                                                            }
                                                        });
                                                    }
                                                    editor.addButton('LinksButton', {
                                                        type: 'button',
                                                        title: 'Links',
                                                        icon: 'link',
                                                        onClick: function (e) {                                                            
                                                            myElement.find("#linkTrack").data("linkObject", "text");
                                                            showLinkGUI();
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                        },
                                                        onPostRender: function () {
                                                            // Select the second item by default
                                                            //this.value('');
                                                        }
                                                    });
                                                    editor.addButton('foreTextColor', {
                                                        type: 'button',
                                                        tooltip: 'Text color',
                                                        icon: 'txtcolor',
                                                        //selectcmd: 'ForeColor',

                                                        onClick: function (e) {                                                            
                                                            var ele_offset = $(e.target).offset();                                                            
                                                            var top = ele_offset.top + 100 + topPlus;
                                                            var left = ele_offset.left + 85 + leftPlus;
                                                            dialogForTextColor = true;
                                                            myElement.find(".modalDialog").show();
                                                            myElement.find("#ColorPickerpop").css({
                                                                top:top+"px",
                                                                left:left+"px"
                                                            }).show();

                                                            var divFontColorPicker = myElement.find(".divFontColorPicker");
                                                            var selectedFontColor = myElement.find(".selectedFontColor");
                                                            divFontColorPicker.minicolors({
                                                                letterCase: 'uppercase',
                                                                change: function (hex, opacity) {
                                                                    //SetBackgroundColor(hex);
                                                                    selectedFontColor.val(hex);
                                                                    //txtColorCode.val(hex);
                                                                },
                                                                inline: true


                                                            });

                                                            if (myColorsFromServiceGlobal == "") {
                                                                _LoadMyColors();
                                                            }
                                                            var myFontColors = myElement.find(".myFontColors");

                                                            myFontColors.empty();
                                                            myFontColors.append("<li style='background-color:#ffffff;' data-color='#ffffff'></li>");
                                                            myFontColors.append("<li style='background-color:#000000;' data-color='#000000'></li>");

                                                            myFontColors.append(ulMyColors.html());

                                                            myFontColors.find("li").click(function () {
                                                                selectedFontColor.val($(this).data("color"));

                                                            });

                                                            //editor.focus();
                                                            myElement.find('#fontDialogCancelButtonID').click(function () {
                                                                myElement.find("#ColorPickerpop").hide();
                                                                myElement.find(".modalDialog").hide();

                                                            });
                                                            myElement.find('#fontDialogOKButtonID').unbind('click').click(function () {
                                                                if (dialogForTextColor) {
                                                                    var selectedText = meeIframeWindow.tinyMCE.activeEditor.selection.getContent({
                                                                        format: 'text'
                                                                    });
                                                                    var selectedFontColor = myElement.find(".selectedFontColor");
                                                                    var selectedColor = selectedFontColor.val();
                                                                    if (selectedColor != "") {
                                                                        var result = editor.execCommand('ForeColor', false, selectedColor);
                                                                        // var changedText = "<span style='color:"+ selectedColor +";'>" + selectedText+"</span>";
                                                                        // tinyMCE.activeEditor.selection.setContent(changedText);
                                                                    }

                                                                    myElement.find("#ColorPickerpop").hide();
                                                                    myElement.find(".modalDialog").hide();
                                                                }

                                                            });
                                                        }

                                                    });
                                                    editor.addButton('backTextColor', {
                                                        type: 'button',
                                                        tooltip: 'Text Background color',
                                                        icon: 'txtbg',
                                                        selectcmd: 'HiliteColor',
                                                        onClick: function (e) {
                                                            var ele_offset = $(e.target).offset();                                                            
                                                            var top = ele_offset.top + 100 + topPlus;
                                                            var left = ele_offset.left + 85 + leftPlus;
                                                            dialogForTextColor = false;
                                                            myElement.find(".modalDialog").show();
                                                            myElement.find("#ColorPickerpop").css({
                                                                top:top+"px",
                                                                left:left+"px"
                                                            }).show();

                                                            var divFontColorPicker = myElement.find(".divFontColorPicker");
                                                            var selectedFontColor = myElement.find(".selectedFontColor");
                                                            divFontColorPicker.minicolors({
                                                                letterCase: 'uppercase',
                                                                change: function (hex, opacity) {
                                                                    //SetBackgroundColor(hex);
                                                                    selectedFontColor.val(hex);
                                                                    //txtColorCode.val(hex);
                                                                },
                                                                click: function () {

                                                                },
                                                                inline: true




                                                            });

                                                            //divFontColorPicker.css("z-index", "99999");

                                                            if (myColorsFromServiceGlobal == "") {
                                                                _LoadMyColors();
                                                            }
                                                            var myFontColors = myElement.find(".myFontColors");


                                                            myFontColors.empty();
                                                            myFontColors.append("<li style='background-color:#ffffff;' data-color='#ffffff'></li>");
                                                            myFontColors.append("<li style='background-color:#000000;' data-color='#000000'></li>");


                                                            myFontColors.append(ulMyColors.html());

                                                            myFontColors.find("li").click(function () {
                                                                selectedFontColor.val($(this).data("color"));

                                                            });

                                                            //editor.focus();
                                                            myElement.find('#fontDialogCancelButtonID').click(function () {
                                                                myElement.find("#ColorPickerpop").hide();
                                                                myElement.find(".modalDialog").hide();

                                                            });
                                                            myElement.find('#fontDialogOKButtonID').unbind('click').click(function () {
                                                                if (!dialogForTextColor) {
                                                                    var selectedText = meeIframeWindow.tinyMCE.activeEditor.selection.getContent({
                                                                        format: 'text'
                                                                    });

                                                                    var selectedFontColor = myElement.find(".selectedFontColor");
                                                                    var selectedColor = selectedFontColor.val();
                                                                    if (selectedColor != "") {
                                                                        var result = editor.execCommand('HiliteColor', false, selectedColor);
                                                                    }

                                                                    myElement.find(".modalDialog").hide();
                                                                    myElement.find("#ColorPickerpop").hide();
                                                                }
                                                            });
                                                        }

                                                    });
                                                    
                                                    if(basicTagsGlobal.length==0){
                                                        $.each(personalizedTagsGlobal, function (i, obj) {
                                                            var entry = {
                                                                text: $('<div/>').html(obj[1]).text(),
                                                                value: obj[0],                                                
                                                                onclick: function(){
                                                                   meeIframeWindow.tinyMCE.activeEditor.insertContent(this.settings.value);
                                                                }
                                                            }
                                                            if (obj[2] == "B") {
                                                                basicTagsGlobal.push(entry);
                                                            }
                                                            else if (obj[2] == "C") {
                                                                customTagsGlobal.push(entry)
                                                            }
                                                            else if (obj[2] == "U") {
                                                                linksTagsGlobal.push(entry)
                                                            }

                                                        });
                                                    }

                                                    editor.addButton('personalizeMenu', {
                                                        type: 'menubutton',
                                                        title: 'Personalize',
                                                        text: 'Personalize',
                                                        icon: false,
                                                        menu: [{text:"Personal Fields", menu:basicTagsGlobal,_editor:editor},{text:"Custom Fields", menu:customTagsGlobal,_editor:editor},{text:"Link Fields", menu:linksTagsGlobal,_editor:editor}],
                                                        onPostRender: function () {

                                                        }
                                                    });
                                                },
                                                //theme_modern_buttons2: "exapmle Mybutton",
                                                toolbar_items_size: 'small',
                                                menubar: false,
                                                schema: "html5",
                                                statusbar: true,
                                                object_resizing: false
                                            });
                                            //}
                                        });
                                    }
                                    ////


                                    this.ReInitializeDragDropHoverAll = function (oHtml) {
                                        var InitializeMouseHover = function (oHtml) {

                                            if (oHtml != null) {
                                                
                                                var topHandlersHTML = "<div class='topHandlers'><div class='myHandle' draggable='true'><i class='icon move'></i></div><div class='myHandlerCopy'><i class='icon copy'></i></div><div class='myHandlerDelete'><i class='icon delete'></i></div></div>";
                                                var myobject = meeIframeWindow.$(topHandlersHTML);    
                                                oHtml.hover(
                                                    function (e) {
                                                        e.stopPropagation();
                                                        meeIframe.find(".topHandlers").remove();                                                                                                                

                                                        if (!IsStyleActivated) {
                                                                                                                        
                                                            $(this).addClass("hover");
                                                            $(this).parents(".csHaveData").addClass("hoverParent");
                                                            $(this).prepend(myobject);
                                                            $(this).parents(".csHaveData").removeClass("hover");
                                                            $(this).find(".editformpanel,.edit-form").show();
                                                            $(this).find(".drop-here").hide();
                                                            //Assign DELETE functionality here
                                                            InitializeDeleteButtonOnElement($(this).find(".topHandlers"));

                                                            //Assign COPY functionality here
                                                            InitializeCopyButtonOnElement($(this).find(".topHandlers"));                                                                                                                                                                                }
                                                    },
                                                    function (e) {     
                                                        $(this).parents(".csHaveData").removeClass("hoverParent");
                                                        $(this).find(".topHandlers").remove();
                                                        $(this).find(".editformpanel").hide();
                                                        $(this).removeClass("hover");
                                                    }
                                                );

                                                return oHtml;
                                            }

                                        }


                                        //-------------- Initialize Again all nested controls after dropped-------------------//:
                                        //Droppable:
                                        oHtml.find(".myDroppable").andSelf().filter(".myDroppable").each(function (i, o) {
                                            CreateDroppableWithAllFunctions(o);
                                            DropableMouseEnterLeave($(o));
                                            console.log("myDroppable Event handling");
                                        });

                                        //Moving Handlers - Mouse Hover
                                        oHtml.find(".csHaveData").andSelf().filter(".csHaveData").each(function (i, o) {
                                            InitializeElementWithDraggable($(o));
                                            InitializeMouseHover($(o));
                                            console.log("Mouse over Event handling");
                                        });

                                        //////////////////////////////////////////////////////////////////////////////////////////


                                    }

                                    //Check if image-container exist in html, apply droppable on .imageContainer class on any element.
                                    this.InitializeImageDroppedEvent = function (oHtml) {
                                        if (oHtml != null) {

                                            if (oHtml.find('.imageContainer').andSelf().filter('.imageContainer').length > 0) {

                                                //Apply here Droppable Container:
                                                oHtml.find('.imageContainer').andSelf().filter('.imageContainer').each(function (index, element) {
                                                    $(element).on('dragover', function (event) {
                                                        event.preventDefault();
                                                        if ($(this).hasClass("imagePlaceHolderAlone") && mee.dragElement) {
                                                            $(this).css({"outline": "2px dashed #01aeee"});
                                                        }
                                                    }).on('dragleave', function (event) {
                                                        event.preventDefault();
                                                        if ($(this).hasClass("imagePlaceHolderAlone") && mee.dragElement) {
                                                            $(this).removeInlineStyle("outline");
                                                        }
                                                    });

                                                    $(element).find('*').andSelf().on('drop', function (event) {
                                                        event.stopPropagation();
                                                        event.preventDefault();
                                                        $(this).removeInlineStyle("outline");
                                                        $(element).removeClass("imageContainer imagePlaceHolderAlone ui-droppable");
                                                        var ui = {draggable: null};
                                                        ui.draggable = mee.dragElement;
                                                        var argsThis = {
                                                            droppedElement: $(this),
                                                            event: event,
                                                            ui: ui
                                                        };
                                                        OnImageDropped(argsThis);
                                                        oInitDestroyEvents.InitializeClickEvent(oHtml);
                                                        mee.dragElement = null;
                                                    })

                                                });
                                            }

                                        }
                                    }

                                    this.InitializeOnImageDroppedEvent = function (oHtml) {
                                        if (oHtml != null) {

                                            if (oHtml.find('.resizableImage').andSelf().filter('.resizableImage').length > 0) {

                                                //Apply here Droppable Container:
                                                oHtml.find('.resizableImage').andSelf().filter('.resizableImage').each(function (index, element) {
                                                    $(element).on('dragover', function (event) {
                                                        event.preventDefault();
                                                        if ($(this).hasClass("resizableImage") && mee.dragElement) {
                                                            $(this).css({"outline": "2px dashed #01aeee"});
                                                        }
                                                    }).on('dragleave', function (event) {
                                                        event.preventDefault();
                                                        if ($(this).hasClass("resizableImage") && mee.dragElement) {
                                                            $(this).removeInlineStyle("outline")
                                                        }
                                                    });

                                                    $(element).find('*').andSelf().on('drop', function (event) {
                                                        event.stopPropagation();
                                                        event.preventDefault();
                                                        var ui = {draggable: null};
                                                        ui.draggable = mee.dragElement;
                                                        $(this).removeInlineStyle("outline");
                                                        $(this).parents(".resizableImage").removeInlineStyle("outline");
                                                        if (ui.draggable.hasClass("droppedImage")) {
                                                            var index = ui.draggable.find("i:first-child").data("index");
                                                            if (index) {
                                                                index = parseInt(index.substr(5)) - 1;
                                                            }
                                                            var imageSrc = options._app.decodeHTML(imageListGlobal[index].originalURL);
                                                            if ($(this)[0].tagName.toLowerCase() == "img") {
                                                                $(this).attr("src", imageSrc)
                                                            }
                                                            else {
                                                                $(this).find("img").attr("src", imageSrc)
                                                            }
                                                            makeCloneAndRegister();
                                                            oInitDestroyEvents.InitializeClickEvent(oHtml);
                                                        }
                                                        mee.dragElement = null;
                                                    });

                                                });
                                            }

                                        }
                                    }
                                    
                                    this.InitializeOnFormDroppedEvent = function (oHtml) {
                                        if (oHtml != null) {

                                            if (oHtml.find('.MEEFORMCONTAINER').andSelf().filter('.MEEFORMCONTAINER').length > 0) {

                                                //Apply here Droppable Container:
                                                oHtml.find('.MEEFORMCONTAINER').andSelf().filter('.MEEFORMCONTAINER').each(function (index, element) {
                                                    $(element).on('dragover', function (event) {
                                                        event.preventDefault();
                                                        if ($(this).hasClass("MEEFORMCONTAINER") && mee.dragElement) {
                                                            $(this).css({"outline": "2px dashed #01aeee"});
                                                        }
                                                    }).on('dragleave', function (event) {
                                                        event.preventDefault();
                                                        if ($(this).hasClass("MEEFORMCONTAINER") && mee.dragElement) {
                                                            $(this).removeInlineStyle("outline")
                                                        }
                                                    });

                                                    $(element).find('*').andSelf().on('drop', function (event) {
                                                        event.stopPropagation();
                                                        event.preventDefault();
                                                        var ui = {draggable: null};
                                                        if(changFlag){
                                                            changFlag.editor_change = true;
                                                         }
                                                        ui.draggable = mee.dragElement;
                                                        $(this).removeInlineStyle("outline");
                                                        var args = {
                                                            droppedElement: $(this),
                                                            event: event,
                                                            ui: ui,
                                                            predefinedControl: null,
                                                            buildingBlock: null
                                                        };
                                                       
                                                        if (ui.draggable.data("type")=="formBlock") {
                                                            
                                                            var oControl = new Object();
                                                            var controlID = ui.draggable.data("id");
                                                            
                                                            var isNew = ui.draggable.data("isnew");
                                                            console.log(controlID);
                                                            //need to apply each for this and then search on each [0]
                                                            
                                                            if(!isNew){                                                                
                                                                args.FormId = controlID;
                                                                if (options.LoadFormContents != null) {
                                                                    options.LoadFormContents(args);
                                                                }

                                                                if (args.formContents != undefined) {
                                                                    //Assign here predefined control into OBJECT TYPE and pass it to OnNewElementDropped.                                                                
                                                                    var fContents = options._app.decodeHTML(args.formContents).replace("https:","")+options.pageId+"/";

                                                                    if(args.droppedElement.hasClass("MEEFORMCONTAINER")){
                                                                        var preview_iframe = $("<div style='overflow:hidden;height:auto;' class='formresizable'><iframe id=\"form-iframe\" style=\"width:100%; height:100%\" src=\"" + fContents + "\" frameborder=\"0\" ></iframe><br style='clear:both;' /></div>");
                                                                        oControl.Html = preview_iframe;                                                                
                                                                        oControl.Type = "formBlock";
                                                                        oControl.ID = args.FormId;                                                                
                                                                        args.predefinedControl = oControl;
                                                                        args.droppedElement.html(oControl.Html);
                                                                        args.droppedElement.removeClass("formPlaceHolderAlone");
                                                                        args.droppedElement.append("<div class='editformpanel'><span class='edit-form'><div>Edit Form</div><button>Form Wizard</button></span> <div class='drop-here'>Drop Form here</div></div>");
                                                                        oInitDestroyEvents.InitAll(args.droppedElement);
                                                                        args.droppedElement.find(".editformpanel button").attr("data-formid",args.FormId)                                                                        
                                                                    }
                                                                    else {
                                                                        var form_ele = args.droppedElement.parents(".MEEFORMCONTAINER");
                                                                        form_ele.find("iframe").attr("src",options._app.decodeHTML(fContents));
                                                                        form_ele.find(".editformpanel button").attr("data-formid",args.FormId);
                                                                    }
                                                                    options.formCallBack(args.FormId);
                                                                }
                                                           }else {                                                                                                                                   
                                                                    var preview_iframe = $("<div style='overflow:hidden;height:auto;' class='formresizable'><iframe id=\"form-iframe\" style=\"width:100%; height:100%\" src=\"about:blank\" frameborder=\"0\" ></iframe><br style='clear:both;' /></div>");                                                                      
                                                                    mee.showFormWizard('');
                                                                    if(meeIframe.find(".MEEFORMCONTAINER #form-iframe").length==0){
                                                                        oControl.Html = preview_iframe;                                                                
                                                                        oControl.Type = "formBlock";
                                                                        oControl.ID = args.FormId;                                                                
                                                                        args.predefinedControl = oControl;
                                                                        args.droppedElement.html(oControl.Html);
                                                                        args.droppedElement.removeClass("formPlaceHolderAlone");
                                                                        args.droppedElement.append("<div class='editformpanel'><span class='edit-form'><div>Edit Form</div><button>Form Wizard</button></span> <div class='drop-here'>Drop Form here</div></div>");
                                                                        oInitDestroyEvents.InitAll(args.droppedElement);
                                                                    }
                                                           }                                                            
                                                        }
                                                        
                                                        mee.dragElement = null;
                                                    });

                                                });
                                            }

                                        }
                                    }

                                    //Check if Click-able event here in html, apply on click event:
                                    this.InitializeClickEvent = function (oHtml) {
                                        if (oHtml != null) {

                                            if (oHtml.find('.clickEvent').andSelf().filter('.clickEvent').length > 0) {

                                                oHtml.find('.clickEvent').andSelf().filter('.clickEvent').each(function (index, element) {

                                                    $(element).click(function (event) {

                                                        isElementClicked = true;

                                                        OnClickedOnElement(event);

                                                    });

                                                });
                                            }
                                        }

                                        //return args;
                                    }

                                    this.InitAll = function (oHtml, isDestroyPluginEventsFirst) {
                                        if (oHtml != undefined) {
                                            if (isDestroyPluginEventsFirst != undefined) {
                                                if (isDestroyPluginEventsFirst) {

                                                    this.DestroyPluginsEvents(oHtml);
                                                }
                                            }
                                            this.InitializePluginsEvents(oHtml);

                                            this.ReInitializeDragDropHoverAll(oHtml);

                                            this.InitializeImageDroppedEvent(oHtml);
                                            this.InitializeOnImageDroppedEvent(oHtml);
                                            this.InitializeOnFormDroppedEvent(oHtml);

                                            this.InitializeClickEvent(oHtml);
                                            //stop click on images
                                            if (oHtml != null) {
                                                oHtml.find(".myImage a").click(function (e) {
                                                    e.preventDefault();
                                                    return false;
                                                })
                                                oHtml.find(".editformpanel button").click(function(){
                                                    var form_id = $(this).attr("data-formid");
                                                    mee.showFormWizard(form_id);
                                                })
                                            }
                                            var activeTab = myElement.find("#tabs").tabs("option", "active");

                                        }
                                    }

                                }

                                function DropableMouseEnterLeave(element) {
                                    //FOR CHROME SPECIALLY
                                    element.on(
                                            {
                                                mouseenter: function () {
                                                    if ($(this).hasClass("myDroppable")) {
                                                        $(this).css({
                                                            "background-color": "#9fcbf1"
                                                        });
                                                    }
                                                }
                                                ,
                                                mouseleave: function () {
                                                    if ($(this).hasClass("myDroppable")) {
                                                        $(this).css({
                                                            "background-color": "#dceefe"
                                                        });
                                                    }

                                                }
                                            });
                                }

                                //Elements Dropping
                                function InitializeWithDropable(sender) {
                                    sender.on('dragover', function (event) {
                                        event.preventDefault();
                                        if ($(this).html() == "") {
                                            $(this).css({'height': '20px', "background": "#379ffb"});
                                        }
                                    }).on('dragleave', function (event) {
                                        event.preventDefault();
                                        if ($(this).html() == "") {
                                            $(this).css({'height': '10px', "background": "#dceefe"});
                                        }
                                    });

                                    sender.find('*').andSelf().on('drop', function (event) {
                                        //restore the dropzone after dropevent                                    
                                        event.stopPropagation();
                                        event.preventDefault();
                                        if(changFlag){
                                            changFlag.editor_change = true;
                                         }
                                        meeIframe.find(".mainContentHtml").removeClass("show-droppables")
                                        var ui = {draggable: null};
                                        ui.draggable = mee.dragElementIframe ? mee.dragElementIframe : mee.dragElement;                                        
                                        if (!$(this).hasClass("myDroppable") || ui.draggable.data("type") === "droppedImage") {
                                            //DO NOTHING
                                            return;
                                        }

                                        if ($(this).css("visibility") == "hidden") {
                                            //DO NOTHING
                                            return;
                                        }

                                        //MUST REMOVE IN ORDER TO WORK PROPER
                                        $(this).removeAttr("style");



                                        if (IsFirstDroppableElement) {
                                            //remove height here:
                                            //$(this).removeAttr("style");
                                            IsFirstDroppableElement = false;
                                        }

                                        //Once dropped Delete myDroppable class here and Remove functionality of Droppable here                                
                                        $(this).removeClass("myDroppable");

                                        //Dragging and Dropping between elements
                                        if (ui.draggable.hasClass("csHaveData")) {

                                            //handling DC into DC MOVE
                                            if (ui.draggable.hasClass("csDynamicData")) {
                                                if ($(this).parent().hasClass("dcInternalContents")) {
                                                    console.log("Dropping DC in DC");
                                                    return;
                                                }
                                                else {
                                                    console.log("Dropping DC in Container");
                                                }
                                            }

                                            //Add class to newly "SWAPED" elment - will use to delete droppable from container etc;
                                            $(this).addClass("csHaveData");

                                            //INSERT AND REMOVE DROPPABLES HERE                            
                                            ui.draggable.next(".myDroppable").remove();

                                            if ($(this).prev(".myDroppable").length == 0) {
                                                $(this).before(CreateDroppableWithAllFunctions());
                                            }

                                            if ($(this).next(".myDroppable").length == 0) {
                                                $(this).after(CreateDroppableWithAllFunctions());
                                            }
                                            /////////////////////////////////////

                                            $(this).replaceWith(ui.draggable);

                                        }
                                        //Element recieving from controls panel:
                                        else {   //Add class to newly entered element from control panel - will use to delete droppable from container etc;

                                            $(this).addClass("csHaveData");
                                            var args = {
                                                droppedElement: $(this),
                                                event: event,
                                                ui: ui,
                                                predefinedControl: null,
                                                buildingBlock: null
                                            };

                                            var typeOfDraggingControl = ui.draggable.data("type");
                                            var oControl = new Object();
                                            // -------------- Building Block Controls[Better way] --------------//

                                            if (typeOfDraggingControl == "buildingBlock" || typeOfDraggingControl == "contentBlock" || typeOfDraggingControl == "formBlock") {
                                                //INSERT DROPPABLE BEFORE AND AFTER            
                                                $(this).before(CreateDroppableWithAllFunctions());
                                                $(this).after(CreateDroppableWithAllFunctions());
                                                ///////

                                                var controlID = ui.draggable.data("id");
                                                console.log(controlID);
                                                //need to apply each for this and then search on each [0]

                                                console.log(buildingBlocksGlobal);
                                                var bb = undefined;
                                                if (typeOfDraggingControl == "buildingBlock") {
                                                    $.each(buildingBlocksGlobal, function (i, obj) {
                                                        if (obj[0].ID == controlID) {
                                                            bb = obj[0];
                                                        }

                                                    });
                                                }
                                                else {
                                                    $.each(contentBlocksGlobal, function (i, obj) {
                                                        if (obj[0]["blockId.encode"] == controlID) {
                                                            bb = obj[0];
                                                        }
                                                    });
                                                }                                                
                                                if (bb != undefined) {
                                                    //Assign here predefined control into OBJECT TYPE and pass it to OnNewElementDropped.
                                                    var decodeHTML = $('<div/>').html(bb.html).text();
                                                    oControl.Html = $(decodeHTML);
                                                    oControl.Type = "buildingBlock";
                                                    oControl.ID = bb.ID;

                                                    console.log(oControl);

                                                    args.predefinedControl = oControl;

                                                    //////////////////////////////////////////////////////////////////////////////////////////

                                                    //InitializeAllEvents(args.droppedElement);

                                                    //Place predefined html into dropped area.
                                                    args.droppedElement.html(oControl.Html);

                                                    oInitDestroyEvents.InitAll(args.droppedElement);


                                                }
                                            }
                                            else if (typeOfDraggingControl == "formBlock") {

                                                //INSERT DROPPABLE BEFORE AND AFTER            
                                                $(this).before(CreateDroppableWithAllFunctions());
                                                $(this).after(CreateDroppableWithAllFunctions());
                                                ///////
                                            
                                                
                                                  var oControl = new Object();
                                                    var controlID = ui.draggable.data("id");

                                                    var isNew = ui.draggable.data("isnew");
                                                    console.log(controlID);
                                                    //need to apply each for this and then search on each [0]

                                                    if(!isNew){                                                                
                                                        args.FormId = controlID;
                                                        if (options.LoadFormContents != null) {
                                                            options.LoadFormContents(args);
                                                        }

                                                        if (args.formContents != undefined) {
                                                            //Assign here predefined control into OBJECT TYPE and pass it to OnNewElementDropped.                                                                
                                                            var fContents = options._app.decodeHTML(args.formContents).replace("https:","")+options.pageId+"/";

                                                            if(args.droppedElement.hasClass("MEEFORMCONTAINER")){
                                                                var preview_iframe = $("<div style='overflow:hidden;height:auto;' class='formresizable'><iframe id=\"form-iframe\" style=\"width:100%; height:100%\" src=\"" + fContents + "\" frameborder=\"0\" ></iframe><br style='clear:both;' /></div>");
                                                                oControl.Html = preview_iframe;                                                                
                                                                oControl.Type = "formBlock";
                                                                oControl.ID = args.FormId;                                                                
                                                                args.predefinedControl = oControl;
                                                                args.droppedElement.html(oControl.Html);
                                                                args.droppedElement.removeClass("formPlaceHolderAlone");
                                                                args.droppedElement.append("<div class='editformpanel'><span class='edit-form'><div>Edit Form</div><button>Form Wizard</button></span> <div class='drop-here'>Drop Form here</div></div>");
                                                                oInitDestroyEvents.InitAll(args.droppedElement);
                                                                args.droppedElement.find(".editformpanel button").attr("data-formid",args.FormId)                                                                        
                                                            }
                                                            else {
                                                                var form_ele = args.droppedElement.parents(".MEEFORMCONTAINER");
                                                                form_ele.find("iframe").attr("src",options._app.decodeHTML(fContents));
                                                                form_ele.find(".editformpanel button").attr("data-formid",args.FormId);
                                                            }
                                                            options.formCallBack(args.FormId);
                                                        }
                                                   }else {                                                                                                                                   
                                                            var preview_iframe = $("<div style='overflow:hidden;height:auto;' class='formresizable'><iframe id=\"form-iframe\" style=\"width:100%; height:100%\" src=\"about:blank\" frameborder=\"0\" ></iframe><br style='clear:both;' /></div>");                                                                      
                                                            mee.showFormWizard('');
                                                            if(meeIframe.find(".MEEFORMCONTAINER #form-iframe").length==0){
                                                                oControl.Html = preview_iframe;                                                                
                                                                oControl.Type = "formBlock";
                                                                oControl.ID = args.FormId;                                                                
                                                                args.predefinedControl = oControl;
                                                                args.droppedElement.html(oControl.Html);
                                                                args.droppedElement.removeClass("formPlaceHolderAlone");
                                                                args.droppedElement.append("<div class='editformpanel'><span class='edit-form'><div>Edit Form</div><button>Form Wizard</button></span> <div class='drop-here'>Drop Form here</div></div>");
                                                                oInitDestroyEvents.InitAll(args.droppedElement);
                                                            }
                                                   }
                                            }
                                            else if (typeOfDraggingControl == "dynamicContentContainer") { //^^

                                                if ($(this).parent().hasClass("dcInternalContents")) {
                                                    console.log("Dropping DC in DC");
                                                    return;
                                                }
                                                else {
                                                    console.log("Dropping DC in Container");
                                                }

                                                //INSERT DROPPABLE BEFORE AND AFTER            
                                                $(this).before(CreateDroppableWithAllFunctions());
                                                $(this).after(CreateDroppableWithAllFunctions());
                                                ///////

                                                $(this).addClass("csDynamicData ");

                                                var isNew = ui.draggable.data("isnew");
                                                var predefinedControl = myElement.find(".divDCTemplate").html();
                                                oControl.Html = $(predefinedControl);
                                                oControl.Type = predefinedControl.type;
                                                args.predefinedControl = oControl;
                                                args.droppedElement.html(oControl.Html);

                                                if (!isNew) {

                                                    //Call overridden Method here: will use when exposing properties to developer
                                                    if (options.OnExistingDynamicControlDropped != null) {

                                                        if (ui.draggable.data("isdummy") != null) {
                                                            //Contruct here dummy variation:
                                                            var dv = new DynamicVariation();
                                                            dv.DynamicVariationID = "v123";
                                                            dv.IsUpdate = false;
                                                            dv.Label = "adnan123"

                                                            var dc = new DynamicContents();
                                                            dc.Label = "Default";
                                                            dc.DynamicContentID = "c123";
                                                            dc.IsDefault = true;
                                                            dc.InternalContents = "<li class='myDroppable ui-draggable ui-droppable' style='display: none;'></li><li class='ui-draggable ui-droppable csHaveData'><table class='container'><tbody><tr>default<td><ul class='sortable'></ul></td></tr></tbody></table></li><li class='myDroppable ui-draggable ui-droppable' style='display: none;'></li>";
                                                            dv.ListOfDynamicContents.push(dc);


                                                            var dc = new DynamicContents();
                                                            dc.Label = "dc 123";
                                                            dc.DynamicContentID = "c123";
                                                            dc.IsDefault = false;
                                                            dc.InternalContents = "<li class='myDroppable ui-draggable ui-droppable' style='display: none;'></li><li class='ui-draggable ui-droppable csHaveData'><table class='container'><tbody><tr><td><ul class='sortable'></ul></td></tr></tbody></table></li><li class='myDroppable ui-draggable ui-droppable' style='display: none;'></li>";
                                                            dv.ListOfDynamicContents.push(dc);

                                                            args.DynamicVariation = dv;
                                                            //alert("dummy");


                                                            InitializeDynamicControl(args);
                                                            oInitDestroyEvents.InitAll(args.droppedElement);

                                                        }
                                                        else {

                                                            // args.ID = ui.draggable.data("id");
                                                            args.ID = ui.draggable.data("keyword");

                                                            args.DynamicVariation = loadDynamicVariationFromServer(args.ID);

                                                            InitializeDynamicControl(args);
                                                            oInitDestroyEvents.InitAll(args.droppedElement);

                                                        }
                                                    }
                                                }
                                                else {
                                                    var dcContentVariationWindow = args.predefinedControl.Html.find(".dcVariationName");
                                                    dcContentVariationWindow.height(dcContentVariationWindow.parents("table.dynamicContentContainer").height())
                                                    dcContentVariationWindow.show();
                                                    dcContentVariationWindow.find(".btnCancelVariation").click(function (event) {
                                                        event.stopPropagation();
                                                        DeleteElement(args.droppedElement);
                                                        if(dcContentNameWindow){
                                                            dcContentNameWindow.hide();
                                                        }
                                                    });
                                                    var saveContentBlock = function () {
                                                        var txtVariationName = dcContentVariationWindow.find(".txtPlaceHolder");
                                                        txtVariationName.prop("disabled", true);
                                                        dcContentVariationWindow.find(".btnSaveVariation").addClass("saving");
                                                        if ($.trim(txtVariationName.val()) == "")
                                                        {
                                                            //alert("Please enter dynamic control name.");

                                                        }
                                                        else {

                                                            args.DynamicVariation = new DynamicVariation();
                                                            args.DynamicVariation.Label = txtVariationName.val();
                                                            args.DynamicVariation.isUpdate = false;
                                                            var dc = new DynamicContents();
                                                            var listOfDC = new Array();
                                                            listOfDC.push(dc);
                                                            args.DynamicVariation.ListOfDynamicContents = listOfDC;

                                                            if (options.OnDynamicControlSave != null) {

                                                                options.OnDynamicControlSave(args.DynamicVariation);
                                                            }

                                                            args.DynamicVariation = loadDynamicVariationFromServer('', args.DynamicVariation.DynamicVariationID);
                                                            args.ID = args.DynamicVariation.DynamicVariationCode;

                                                            args.DynamicVariation.Label = txtVariationName.val();

                                                            txtVariationName.data("variationID", args.DynamicVariation.DynamicVariationID);



                                                            _LoadDynamicBlocks();

                                                            InitializeDynamicControl(args);

                                                            oInitDestroyEvents.InitAll(args.droppedElement);
                                                        }
                                                        dcContentVariationWindow.find(".btnSaveVariation").removeClass("saving");
                                                        txtVariationName.prop("disabled", false);

                                                        dcContentVariationWindow.hide();
                                                    }
                                                    setTimeout(_.bind(function(){
                                                        this.find(".txtPlaceHolder").focus();
                                                    },dcContentVariationWindow),300);
                                                    dcContentVariationWindow.find(".btnSaveVariation").click(function () {
                                                        saveContentBlock();
                                                    });
                                                    dcContentVariationWindow.find(".txtPlaceHolder").keyup(function (e) {
                                                        if (e.keyCode === 13) {
                                                            saveContentBlock();
                                                        }
                                                    })
                                                }

                                            }
                                            else {

                                                //INSERT DROPPABLE BEFORE AND AFTER            
                                                $(this).before(CreateDroppableWithAllFunctions());
                                                $(this).after(CreateDroppableWithAllFunctions());
                                                ///////

                                                // -------------- Predefined Controls[Better way] --------------//
                                                var predefinedControl = Enumerable.From(predefinedControls).Where("x => x.type == '" + typeOfDraggingControl + "'").FirstOrDefault();
                                                if (predefinedControl != undefined) {
                                                    //Assign here predefined control into OBJECT TYPE and pass it to OnNewElementDropped.

                                                    oControl.Html = $(predefinedControl.html);
                                                    oControl.Type = predefinedControl.type;

                                                    args.predefinedControl = oControl;

                                                    //Place predefined html into dropped area.
                                                    //console.log("HTML:"+ oControl.HTML);
                                                    args.droppedElement.html(oControl.Html);


                                                    oInitDestroyEvents.InitAll(args.droppedElement);



                                                }

                                            }

                                            //

                                            //Controlling ELEMENT resizing here [Containers]
                                            //Work on control - CONTROL ONLY
                                            SetElementSize(args); //$$
                                            ////////////////////////////////////


                                            OnNewElementDropped(args);


                                        }
                                        mee.dragElement = null;
                                        mee.dragElementIframe = null;
                                    });


                                    var drop = function (event, ui) {


                                    }


                                    return sender;
                                }
                                mee.startDragging = function (e) {
                                    myElement.find(".divBuildingBlockLoading").parent().height();
                                    var _height = myElement.find(".divBuildingBlockLoading").parent().height() - 30;
                                    var _scrollTop = myElement.find(".divBuildingBlockLoading").parent().scrollTop();
                                    myElement.find(".divBuildingBlockLoading").show().css({
                                        "top": _scrollTop + "px",
                                        "height": _height + "px"
                                    });
                                    ShowDroppables(meeIframe);
                                    RemovePopups();
                                    meeIframe.find(".sortable").each(function (index) {
                                        //Exclude here dragging element (which is added by jqueryUI)
                                        var firstLevelLiDroppable = $(this).find(">.myDroppable:not(.ui-draggable-dragging)");
                                        InsertDroppableInEmpty($(this), firstLevelLiDroppable);
                                        //Last element FULL height                                           
                                        SetLastElementHeight($(this));
                                    });
                                    $(e.target).next(".myDroppable").hide();
                                    $(e.target).prev(".myDroppable").hide();
                                }
                                mee.stopDragging = function () {
                                    myElement.find(".divBuildingBlockLoading").hide();
                                    RemoveDroppables(meeIframe);
                                }
                                //Elements DRAGGING - for swapping elements:dragging2
                                function InitializeElementWithDraggable(object) {
                                    meeIframeWindow.setDragging(object, mee);
                                    return object;
                                }

                                function CreateDroppableWithAllFunctions(object) {

                                    var d1;
                                    if (object == null) {
                                        d1 = CreateDroppable();
                                    }
                                    else {
                                        d1 = $(object);
                                    }

                                    var d1WithDraggable = InitializeElementWithDraggable(d1);
                                    var d1WithDroppable = InitializeWithDropable(d1WithDraggable);

                                    return d1WithDroppable;
                                }

                                var InsertDroppableInEmpty = function (sender, listOfElements) {
                                    var liLength = listOfElements.size();
                                    //Placing highlighter into "Container" here  
                                    if (liLength == 0) {
                                        var droppableElement = null;
                                        droppableElement = CreateDroppableWithAllFunctions();
                                        if (IsFirstDroppableElement) {
                                            droppableElement.append("<div style='text-align:center; position:relative; top:40px; font-style:italic'> DROP HERE </div>");
                                        }
                                        sender.append(droppableElement);
                                    }
                                }

                                var RemoveDroppables = function (container, undo) {
                                    container.find(".myDroppable:not(.csHaveData)").hide();

                                    //Remove height from destination's parent and source's parent (.sortable UL)
                                    //Releted to last element dropped full height:
                                    meeIframe.find(".sortable").removeAttr("style");
                                    meeIframe.find(".myDroppable").removeInlineStyle("height");
                                    myElement.find(".hide-footer").remove();
                                    if (!undo) {
                                        makeCloneAndRegister();
                                    }
                                    ///////
                                }

                                var ShowDroppables = function (container) {
                                    container.find(".myDroppable:not(.csHaveData)").show();
                                }

                                var RemovePopups = function () {
                                    myElement.find("#imageToolbar").hide();
                                }

                                var IsFirstDroppableElement = false;

                                //Last Element get full height here
                                var SetLastElementHeight = function (element) {

                                    // Get parent element height and apply to UL (.sortable)
                                    var parentHeight = element.parent().height();
                                    element.height(parentHeight);

                                    //Get first level children in UL here:
                                    var firstLevelAllLi = element.children("li:not(.ui-draggable-dragging)");
                                    var firstLevelAllLiLength = firstLevelAllLi.length;
                                    var hightExcludingLast = 0;

                                    firstLevelAllLi.each(function (index, element) {

                                        if (index != firstLevelAllLiLength - 1) {
                                            hightExcludingLast += $(this).outerHeight();

                                        }
                                        else {
                                            //Get Last element here
                                            var lastDroppableHeight = parentHeight - hightExcludingLast
                                            if (lastDroppableHeight > 0) {
                                                lastDroppableHeight = lastDroppableHeight - 2;
                                            }

                                            $(this).height(lastDroppableHeight);
                                        }
                                    });
                                }

                                //---------------------  MAIN DRAGGABLE--------------------------//dragging1


                                function InitializeMainDraggableControls(elementToApply) {

                                    $(elementToApply).on('dragstart', function (event) {
                                        event.originalEvent.dataTransfer.setData("text", "dragging");
                                        mee.dragElement = $(this);
                                        var draggedControlType = $(this).data("type");
                                        if (draggedControlType === "droppedImage" ) {
                                            return;
                                        }                                        
                                        RemovePopups();                                        

                                        if (draggedControlType != "droppedImage" && (draggedControlType !="formBlock" || meeIframe.find(".MEEFORMCONTAINER").length==0) ) {
                                            ShowDroppables(meeIframe);
                                            if (meeIframe.find(".mainContentHtml li.myDroppable").length > 1) {
                                                meeIframe.find(".mainContentHtml").addClass("show-droppables")
                                            }
                                            var totalLiLength = meeIframe.find(".sortable li").length;
                                            meeIframe.find(".sortable").each(function (indx) {

                                                var firstLevelLiDroppable = $(this).find(">.myDroppable:not(.ui-draggable-dragging)");

                                                if (totalLiLength == 0 && firstLevelLiDroppable.length == 0) {
                                                    //For first time dropping element                                
                                                    IsFirstDroppableElement = true;
                                                }
                                                InsertDroppableInEmpty($(this), firstLevelLiDroppable);
                                                if (indx === 0) {
                                                    SetLastElementHeight($(this));
                                                }
                                            });
                                        }
                                        else if(draggedControlType =="formBlock"){
                                            
                                            meeIframe.find(".MEEFORMCONTAINER").css({"outline": "2px dashed #01aeee"});
                                            meeIframe.find(".editformpanel,.drop-here").show();
                                            meeIframe.find(".editformpanel .edit-form").hide();
                                            
                                            
                                        }

                                    }).on('dragend', function (event) {
                                        event.preventDefault();
                                        meeIframe.find(".mainContentHtml").removeClass("show-droppables");
                                        meeIframe.find(".MEEFORMCONTAINER").removeInlineStyle("outline");
                                        meeIframe.find(".editformpanel").hide();
                                        RemoveDroppables(meeIframe);
                                        $(".file-border").removeClass("file-border");
                                        mee.dragElement = null;
                                        //
                                    });


                                }
                                function OnNewElementDropped(args) {

                                    if (args.predefinedControl != null) {

                                        if (args.predefinedControl.Type == "copied" || args.predefinedControl.Type == "buildingBlock") {
                                            //alert(args.predefinedControl.Html.html());
                                            oInitDestroyEvents.InitializePluginsEvents(args.predefinedControl.Html);
                                        }

                                        if ((args.predefinedControl.Type == "text") || (args.predefinedControl.Type == "textWithImage") || (args.predefinedControl.Type == "imageWithText")) {

                                            oInitDestroyEvents.InitializePluginsEvents(args.predefinedControl.Html);
                                        }
                                    }

                                    myElement.find(".ImageToolbarLeftAlignClass").click(function () {
                                        imageFunctionality.leftAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                                        makeCloneAndRegister();
                                        return false;
                                    });
                                    myElement.find(".ImageToolbarCenterAlignClass").click(function () {
                                        imageFunctionality.centerAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                                        makeCloneAndRegister();
                                        return false;
                                    });
                                    myElement.find(".ImageToolbarRightAlignClass").click(function () {
                                        imageFunctionality.rightAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                                        makeCloneAndRegister();
                                        return false;
                                    });
                                    mee.checkForm();

                                }
//**************************************************** END DROPPING, DRAGGING, IMAGE CONTAINERS WORK (CORE FUNCTIONALITY) **************************************************** //                         

//****************************************************************************Content Blocks **************************************************************************** //Section6                         
                                var _LoadContentBlocks = function () {
                                    $.ajax({
                                        url: "/pms/io/publish/getEditorData/?" + options._BMSTOKEN + "&type=listBlocks&isAdmin=Y",
                                        data: "{}",
                                        type: "POST",
                                        contentType: "application/json; charset=latin1",
                                        dataType: "json",
                                        cache: false,
                                        async: true,
                                        success: function (e) {
                                            if (e.count != "0") {
                                                var contentBlocks = e.blocks[0];
                                                contentBlocksGlobal = e.blocks[0];
                                                var ulContentBlocks = myElement.find(".content-block");
                                                ulContentBlocks.empty();
                                                var imageMapping = {
                                                    "c81e728d9d4c2f636f067f89cc14862c": "columnfeaturedarticles",
                                                    "b6d767d2f8ed5d21a44b0e5886680cb9": "columnfeaturedarticles",
                                                    "a87ff679a2f3e71d9181a67b7542122c": "columnImageWithText",
                                                    "6364d3f0f495b6ab9dcf8d3b5c6e0b01": "columnImageWithHeading",
                                                    "e4da3b7fbbce2345d7772b0674a318d5": "BannerPlusText",
                                                    "1679091c5a880faf6fb5e6087eb1b2dc": "Button",
                                                    "4e732ced3463d06de0ca9a15b6153677": "footer",
                                                    "c9f0f895fb98ab9159f51fd0297e236d": "FooterPlusLogo",
                                                    "45c48cce2e2d7fbdea1afc51c7c6ad26": "FooterPlusLogo",
                                                    "d3d9446802a44259755d38e6d163e820": "ImageTextbutton",
                                                    "6512bd43d9caa6e02c990b0a82652dca": "RightImagePlusText",
                                                    "c20ad4d76fe97759aa27a0c99bff6710": "logoCenter",
                                                    "c51ce410c124a10e0db5e4b97fc2af39": "logoPlusBanner",
                                                    "aab3238922bcc25a6f606eb525ffdc56": "Paragraph",
                                                    "c74d97b01eae257e44aa9d5bade97baf": "Social_Share",
                                                    "70efdf2ec9b086079795c442636b55fb": "Testimonial",
                                                    "9bf31c7ff062936a96d3c8bd1f8f2ff3": "LeftImagePlusText",
                                                    "6f4922f45568161a8cdf4ad2299f6d23": "Useful_Links",
                                                    "33e75ff09dd601bbe69f351039152189": "_3imagecolumn",
                                                    "6ea9ab1baa0efb9e19094440c317e21b": "PortfolioPlusButton",
                                                    "2e74f10e0327ad868d138f2b4fdd6f0": "_Text2Button"
                                                }
                                                $.each(contentBlocks, function (i, obj) {
                                                    var cssImage = imageMapping[obj[0]["blockId.checksum"]] ? imageMapping[obj[0]["blockId.checksum"]] : "";
                                                    var blockIcon = "<i class='icon cblock " + cssImage + "'></i> ";
                                                    if (obj[0]["thumbURL"]) {
                                                        blockIcon = "<img src='" + obj[0]["thumbURL"] + "' class='blockimg' />"
                                                    }
                                                    var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' draggable='true' data-type='contentBlock' data-isnew='false' data-id='" + obj[0]["blockId.encode"] + "' >" +
                                                            blockIcon +
                                                            "<a href='#'> <span class='font_75 bbName'>" + obj[0].name + "</span></a>" +
                                                            "</li>");
                                                    InitializeMainDraggableControls(block);
                                                    ulContentBlocks.append(block);

                                                });

                                            }
                                        },
                                        error: function (e) {

                                        }
                                    });
                                }
                                mee._LoadBuildingBlocks = function (args) {

                                    if (args == null) {
                                        args = new Object();
                                    }

                                    //Call overridden Method here: will use when exposing properties to developer
                                    var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                                    ulBuildingBlocks.empty();
                                    options._app.showLoading("Loading blocks...", ulBuildingBlocks, {
                                        "width": "140px",
                                        "margin-left": "-70px"
                                    });
                                    var URL = "/pms/io/publish/getEditorData/?" + options._BMSTOKEN + "&type=listBlocks";
                                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                                        var _json = jQuery.parseJSON(xhr.responseText);
                                        //Getting building blocks from provided block:                                
                                        var count = 1;
                                        // var listOfBuildingBlocksHtml = $();
                                        var buildingBlocksFromService = _json.blocks ? _json.blocks[0] : {};
                                        var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                                        ulBuildingBlocks.empty();

                                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                                        $.each(buildingBlocksFromService, function (i, obj) {

                                            //Assigning unique ID here:
                                            obj[0].ID = obj[0]["blockId.encode"];
                                            var blockIcon = "<i class='icon myblck'></i>";
                                            if (obj[0]["thumbURL"]) {
                                                blockIcon = "<img src='" + obj[0]["thumbURL"] + "' class='blockimg' />"
                                            }

                                            var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' draggable='true' data-type='buildingBlock' data-id='" + obj[0]["blockId.encode"] + "'>" +
                                                    blockIcon +
                                                    "<a href='#'> <span class='font_75 bbName'>" + obj[0].name + "</span></a>" +
                                                    "<div class='imageicons' > " +
                                                    "<i class='imgicons edit action' data-actiontype='bbedit'  data-index='" + i + "' data-id='" + obj[0]["blockId.encode"] + "'></i> " +
                                                    "<i class='imgicons delete right action' data-actiontype='bbdel'  data-index='" + i + "' data-id='" + obj[0]["blockId.encode"] + "'></i> " +
                                                    " </div>" +
                                                    //actionButtons.html() +
                                                    "</li>");


                                            //Initialize with default draggable:
                                            InitializeMainDraggableControls(block);

                                            // listOfBuildingBlocksHtml.append(block);
                                            ulBuildingBlocks.append(block);

                                            block.find(".imageicons").draggable({
                                                disabled: true

                                            });
                                            count++;
                                        });
                                        buildingBlocksGlobal = buildingBlocksFromService;
                                        myElement.find("#DCResultDiv").hide();
                                    });



                                }
                                mee.CloseFormWizard = function(){
                                   if(meeIframe.find(".MEEFORMCONTAINER #form-iframe").length && meeIframe.find(".MEEFORMCONTAINER #form-iframe").attr("src")=="about:blank"){
                                         meeIframe.find(".MEEFORMCONTAINER").addClass("formPlaceHolderAlone").children().remove();
                                    }
                                }
                                mee.showFormWizard = function(formId){
                                    var dialog_width = $(document.documentElement).width()-60;
                                    var dialog_height = $(document.documentElement).height()-162;
                                    var dialog = options._app.showDialog({title:'Form Builder',
                                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"20px"},
                                              headerEditable:false,
                                              headerIcon : 'dlgformwizard',
                                              closeCallBack: _.bind(mee.CloseFormWizard,mee), 
                                              bodyCss:{"min-height":dialog_height+"px"}
                                    });
                                    var formurl = formId ? "&formId="+formId : "";
                                    dialog_height = parseFloat(dialog_height)-6 ;
                                    var transport = new easyXDM.Socket({           
                                        remote:  window.location.protocol+'//'+options._app.get("content_domain")+"/pms/landingpages/rformBuilderNewUI.jsp?BMS_REQ_TK=" + options._app.get("bms_token")+"&ukey="+options._app.get("user_Key")+formurl,
                                        onReady: function(){

                                        },
                                        onMessage: _.bind(function(message, origin){
                                            var response = jQuery.parseJSON(message);
                                            if(response.isRefresh || response.formURL){
                                                if(response.isRefresh){
                                                    if(meeIframe.find(".MEEFORMCONTAINER #form-iframe").length){
                                                        meeIframe.find(".MEEFORMCONTAINER #form-iframe")[0].src =meeIframe.find(".MEEFORMCONTAINER #form-iframe")[0].src.replace("https:",""); 
                                                    }
                                                }
                                                else{
                                                   meeIframe.find(".MEEFORMCONTAINER #form-iframe").attr("src", response.formURL.replace("http:",""));                                   
                                                   if(meeIframe.find(".MEEFORMCONTAINER .editformpanel button").length){
                                                        meeIframe.find(".MEEFORMCONTAINER .editformpanel button").attr("data-formid",response.formId);
                                                   }
                                                   options.formCallBack(response.formId); 
                                                }
                                            }
                                            else if(response.showMessage){
                                                options._app.showMessge(response.msg);
                                            }
                                           
                                        },mee),
                                        props:{style:{width:"100%",height:dialog_height+"px"},frameborder:0},
                                        container : dialog.getBody()[0]
                                    });                              
                                }
                                mee.addUpdateContentBlock = function (args) {
                                    var dialog_title = mee._LastSelectedBuildingBlock ? "Edit Block" : "Add Block";
                                    var dialog_width = $(document.documentElement).width() - 60;
                                    var dialog_height = $(document.documentElement).height() - 162;
                                    var css = {}
                                    if ((mee._LastSelectedBuildingBlock && options._app.get("user").userId === 'admin')) {
                                        css = {
                                            "width": dialog_width + "px",
                                            "margin-left": "-" + (dialog_width / 2) + "px",
                                            "top": "20px"
                                        }
                                    }
                                    else {
                                        css = {
                                            "width": "600px",
                                            "margin-left": "-300px",
                                            "top": "20%"
                                        }
                                    }
                                    var dialog = options._app.showDialog({
                                        title: dialog_title,
                                        css: css,
                                        headerEditable: false,
                                        headerIcon: 'template',
                                        bodyCss: {
                                            "min-height": (mee._LastSelectedBuildingBlock && options._app.get("user").userId === 'admin') ? dialog_height + "px" : "210px"
                                        },
                                        buttons: {
                                            saveBtn: {
                                                text: 'Save'
                                            }
                                        }
                                    });
                                    options._app.showLoading("Loading...", dialog.getBody());
                                    require(["editor/buildingblock"], function (templatePage) {
                                        var mPage = new templatePage({
                                            editor: mee,
                                            dialog: dialog,
                                            config: options,
                                            args: args
                                        });
                                        var dialogArrayLength = options._app.dialogArray.length; // New Dialog
                                        dialog.getBody().append(mPage.$el);
                                        options._app.showLoading(false, mPage.$el.parent());
                                        dialog.saveCallBack(_.bind(mPage.saveBlockCall, mPage));
                                        mPage.init();
                                        options._app.showLoading(false, dialog.getBody());
                                        var dialogArrayLength = options._app.dialogArray.length; // New Dialog
                                        dialog.getBody().find(".add-block").addClass('dialogWrap-' + dialogArrayLength); // New Dialog                                    
                                        options._app.dialogArray[dialogArrayLength - 1].reattach = true;// New Dialog
                                        options._app.dialogArray[dialogArrayLength - 1].currentView = mPage; // New Dialog
                                        options._app.dialogArray[dialogArrayLength - 1].saveCall = _.bind(mPage.saveBlockCall, mPage);



                                    });
                                }
                                mee.deleteBlock = function (element, block_id) {
                                    var URL = "/pms/io/publish/saveEditorData/?" + options._BMSTOKEN;
                                    var post_data = {
                                        type: "deleteBlock",
                                        blockId: block_id
                                    };
                                    $.post(URL, post_data)
                                            .done(function (data) {
                                                var result = jQuery.parseJSON(data);
                                                if (result[0] == "success") {
                                                    element.fadeOut("slow", function () {
                                                        var obj = $(this);
                                                        obj.remove();
                                                    })
                                                }
                                                else {
                                                    options._app.showAlert(result[1], $("body"));
                                                }
                                            });
                                }


                                //****************************************************End Content Blocks **************************************************** //                                                 


                                //****************************************************My Building Blocks **************************************************** //                                                 
                                mee._LastSelectedBuildingBlock = null;
                                var _LastSelectedDynamicBuildingBlock = null;
                                myElement.find("input#searchBB").keyup(function (e) {
                                    if (e.which == 13) {
                                        _searchBuildingBlocks();
                                    }
                                });

                                myElement.find("input#searchForm").keyup(function (e) {
                                    if (e.which == 13) {                                        
                                        _searchFormBlocks();
                                    }
                                });

                                myElement.find("#clearsearch-forms").click(function (e) {
                                    myElement.find("#clearsearch-forms").hide();
                                    myElement.find("input#searchForm").val('');                                    
                                    searchFormTxt = "";
                                    mee._LoadFormBlocks();

                                })
                                
                                myElement.find("#clearsearch-blocks").click(function (e) {
                                    myElement.find("#clearsearch-blocks").hide();
                                    myElement.find("input#searchBB").val('');
                                    myElement.find("#BBResultDiv").hide();
                                    mee._LoadBuildingBlocks();

                                })



                                var _searchBuildingBlocks = function (args) {

                                    var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                                    ulBuildingBlocks.empty();
                                    var buildingBlocksFromService = buildingBlocksGlobal;
                                    var textForSearch = myElement.find("input#searchBB").val();
                                    var counter = 0;
                                    if (textForSearch != null && textForSearch != "") {
                                        myElement.find("#clearsearch-blocks").show();
                                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                                        $.each(buildingBlocksFromService, function (i, obj) {
                                            //Assigning unique ID here:
                                            obj[0].ID = obj[0]["blockId.encode"];
                                            var label = obj[0].name;
                                            if (label.startsWith(textForSearch)) {
                                                counter++;
                                                var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' draggable='true' data-type='buildingBlock' data-id='" + obj[0]["blockId.encode"] + "'>" +
                                                        "<i class='icon myblck'></i> " +
                                                        "<a href='#'> <span class='font_75 bbName'>" + obj[0].name + "</span></a>" +
                                                        "<div class='imageicons' > " +
                                                        "<i class='imgicons edit action' data-actiontype='bbedit'  data-index='" + i + "' data-id='" + obj[0]["blockId.encode"] + "'></i> " +
                                                        "<i class='imgicons delete right action' data-actiontype='bbdel'  data-index='" + i + "' data-id='" + obj[0]["blockId.encode"] + "'></i> " +
                                                        " </div>" +
                                                        //actionButtons.html() +
                                                        "</li>");


                                                //Initialize with default draggable:
                                                InitializeMainDraggableControls(block);

                                                // listOfBuildingBlocksHtml.append(block);
                                                ulBuildingBlocks.append(block);

                                                block.find(".imageicons").draggable({
                                                    disabled: true
                                                });


                                                //count++;
                                            }
                                        });
                                        myElement.find("#BBResultDiv").html(counter + " records Found");
                                        myElement.find("#BBResultDiv").show();

                                    }
                                    else {
                                        myElement.find("#clearsearch-blocks").hide();
                                        mee._LoadBuildingBlocks();
                                        myElement.find("#BBResultDiv").hide();
                                    }
                                    ///////
                                }


                                function InitializeBuildingBlockUpdatePopup() {
                                    mee.addUpdateContentBlock({
                                        args: args,
                                        oInitDestroyEvents: oInitDestroyEvents
                                    });
                                    return false;
                                }

                                var _OnEditBuildingBlock = function (args) {
                                    if (options.OnEditBuildingBlock != null) {
                                        //Call overridden Method here: will use when exposing properties to developer
                                        options.OnEditBuildingBlock(args);
                                    }

                                    mee._LoadBuildingBlocks(args);
                                }

                                var _OnDeleteBuildingBlock = function (args) {
                                    if (options.OnDeleteBuildingBlock != null) {
                                        //Call overridden Method here: will use when exposing properties to developer
                                        options.OnDeleteBuildingBlock(args);
                                    }

                                    mee._LoadBuildingBlocks(args);
                                }
                                myElement.on("click", "a.btnDeleteBB", function () {
                                    var element = $(this);
                                    var block_id = element.data("id");
                                    //Call overridden Method here: will use when exposing properties to developer                            
                                    $.ajax({
                                        url: "/pms/io/publish/saveEditorData/?" + options._BMSTOKEN + "&type=deleteBlock&blockId=" + block_id,
                                        //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                        type: "POST",
                                        contentType: "application/json; charset=latin1",
                                        dataType: "json",
                                        cache: false,
                                        async: true,
                                        success: function (e) {
                                            myElement.find("[data-id='" + block_id + "']").fadeIn("fast", function () {
                                                var obj = $(this);
                                                obj.remove();
                                            })
                                        },
                                        error: function (e) {
                                        }

                                    });

                                    myElement.find(".BBDeleteDialog").hide();

                                });

                                myElement.find(".editBB").click(function () {
                                    if (mee._LastSelectedBuildingBlock != null) {
                                        InitializeBuildingBlockUpdatePopup();
                                    }
                                    else {
                                        alert("Please Select a Block First");
                                    }
                                });

                                myElement.find(".deleteBB").click(function () {
                                    if (mee._LastSelectedBuildingBlock != null) {
                                        var id = mee._LastSelectedBuildingBlock.data("id");
                                        var isDel = confirm("Are you sure you want to delete this Block");
                                        if (isDel) {
                                            // Delete Block Server Call
                                            var args = {
                                                buildingBlock: null
                                            };
                                            var buildingBlock = new Object();
                                            buildingBlock.Id = mee._LastSelectedBuildingBlock.data("id");
                                            args.buildingBlock = buildingBlock;
                                            _OnDeleteBuildingBlock(args);
                                            mee._LastSelectedBuildingBlock = null;
                                            UnSelectAllDynamicBlocks();
                                        }
                                        else {
                                            mee._LastSelectedBuildingBlock = null;
                                            UnSelectAllDynamicBlocks();
                                        }
                                    }
                                    else {
                                        alert("Please Select a Block First");
                                    }
                                });
                                myElement.find('.searchBBLink').click(function () {
                                    _searchBuildingBlocks();
                                });
                                function UnSelectAllBlocks() {
                                    myElement.find('.ulBuildingBlocks li').each(function () {
                                        $(this).css("background", "#71737a");
                                    });
                                }

                                function UnSelectAllDynamicBlocks() {
                                    myElement.find('.ulDynamicBlocks li').each(function () {
                                        $(this).css("background", "#71737a");
                                    });
                                }


//****************************************************End My Building Blocks **************************************************** //    


//****************************************************Editor Functions **************************************************** //    Section7
                                var showAlertButtons = function (obj, url) {
                                    var _ele = $(obj); //element which is clicked
                                    var left_minus = 15;      //static space to minus to show dialog on exact location
                                    var ele_offset = _ele.offset();
                                    var ele_height = _ele.height();
                                    var top = ele_offset.top + 74 + topPlus;
                                    var left = ele_offset.left + 297 + leftPlus;
                                    var url_string = "", showClass = "disabled";
                                    url = _ele.attr("href");
                                    var merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}", "ig");
                                    if (url !== "#" && $.trim(url) !== "" && url.startsWith("mailto:") == false && merge_field_patt.test(url) === false) {
                                        url_string = "href='" + url + "'";
                                        showClass = "";
                                    }
                                    var li = "<ul>";
                                    li += "<li><a class='btn-green'><i class='icon imgicons link linkOpen'></i></a></li>";
                                    li += "<li><a class='btn-red'><i class='icon imgicons unlink linkRemove'></i></a></li>";
                                    li += "<li><a target='_new' " + url_string + " class='btn-blue btnContentDelete " + showClass + "'><i class='icon newwin' data-url='" + url + "'></i></a></li>";
                                    li += "</ul>";

                                    myElement.find(".alertButtons").html(li);
                                    myElement.find(".alertButtons").css({
                                        "left": left + "px",
                                        "top": top + "px"
                                    }).show();
                                    console.log("left:" + left + "px, top:" + top + "px");
                                }
                                myElement.on("click", "i.newwin", function () {
                                    var url = $(this).parent().attr("href");
                                    var showName = $.getUrlVar(url, 'campaignkw');
                                    window.open(url.replace("?campaignkw=" + showName, ""));
                                    myElement.find(".alertButtons").hide();
                                });

                                myElement.on("click", "i.linkOpen", function () {
                                    myElement.find("#linkTrack").data("linkObject", "text");
                                    showLinkGUI();
                                    myElement.find(".alertButtons").hide();
                                });
                                myElement.on("click", "i.linkRemove", function () {
                                    var selected_anchor = meeIframeWindow.tinyMCE.activeEditor.selection.getNode();
                                    if (selected_anchor.tagName.toLowerCase() == "a") {
                                        var $selected_anchor = $(selected_anchor);
                                        var _html = $selected_anchor.html();
                                        $selected_anchor.replaceWith(_html);
                                    }

                                    myElement.find(".alertButtons").hide();
                                });
                                myElement.find(".alertButtons").mousedown(function (e) {
                                    e.stopPropagation();
                                    return false;
                                })

//****************************************************End Editor Functions **************************************************** //    

//****************************************************Landing page Forms **************************************************** //    Section8

                                /// For Forms handling
                                
                                var _AjaxParameters = {Url:'',Data:{},DataType:'json',Type:'GET',ContentType:'application/json; charset=latin1'}
 
                                mee._LoadFormBlocks = function (offset) {                                  
                                    var ulFormBlocks = myElement.find(".formDroppable .ulFormBlocks");
                                    if (offset) {
                                            forms_offset = forms_offset + offset;
                                    }
                                    else {                                        
                                        forms_offset = 0;
                                        ulFormBlocks.empty();
                                        options._app.showLoading("Loading Forms...", myElement.find(".ulFormBlocks"), {
                                            "width": "140px",
                                            "margin-left": "-70px"
                                        });
                                    }
                                    if(searchFormTxt!==""){
                                        _AjaxParameters["Data"]['searchText'] = searchFormTxt;
                                    }
                                    else{
                                        delete _AjaxParameters["Data"]['searchText']
                                    }                                    
                                    _AjaxParameters.Url = "/pms/io/form/getSignUpFormData/?" + options._BMSTOKEN + "&type=search&offset=" + forms_offset;
                                    returnData = SendServerRequest(_AjaxParameters);
                                    options._app.showLoading(false, myElement.find(".ulFormBlocks"));
                                    if(returnData[0] && returnData[0]=="err"){
                                        myElement.find("#FBResultDiv").html(returnData[1]);
                                        myElement.find("#FBResultDiv").show();      
                                        myElement.find(".formDroppable").hide();
                                    }
                                    else{
                                        if(returnData.totalCount!="0"){
                                            $.each(returnData.forms[0], function (i, obj) {

                                                //Assigning unique ID here:
                                                obj[0].ID = obj[0]["formId.encode"];


                                                var block = $("<li class='draggableControl ui-draggable droppedFormBlock' draggable='true' data-type='formBlock' data-id='" + obj[0]["formId.encode"] + "'>" +
                                                        "<i class='icon myblck'></i> " +
                                                        "<a><span class='font_75 bbName'>" + obj[0].name + "</span></a>" +
                                                        "<div class='imageicons' > " +
                                                        "<i class='imgicons edit action' data-actiontype='fbedit'  data-index='" + i + "' data-id='" + obj[0]["formId.encode"] + "'></i> " +
                                                        "<i class='imgicons delete right action' data-actiontype='fbdel'  data-index='" + i + "' data-id='" + obj[0]["formId.encode"] + "'></i> " +
                                                        " </div>" +
                                                        "</li>");



                                                //Initialize with default draggable:
                                                InitializeMainDraggableControls(block);

                                                // listOfBuildingBlocksHtml.append(block);
                                                ulFormBlocks.append(block);


                                            });   

                                            if (myElement.find(".ulFormBlocks li").length < parseInt(returnData.totalCount)) {
                                                myElement.find(".ulFormBlocks li:last-child").attr("data-load", "true");
                                            }
                                        }
                                        if(searchFormTxt!==""){
                                            myElement.find("#FBResultDiv").html(returnData.totalCount + " records Found");
                                            myElement.find("#FBResultDiv").show();      
                                            //myElement.find(".formDroppable").hide();
                                        }
                                        else{
                                            myElement.find("#FBResultDiv").hide();
                                            myElement.find(".formDroppable").show();
                                        }
                                    }
                                    myElement.find(".form-footer-loading").hide();
                                    

                                }

                                


                                /// For Forms handling

                                var _searchFormBlocks = function (args) {                                                          
                                    searchFormTxt = myElement.find("input#searchForm").val();
                                    myElement.find("#clearsearch-forms").show();
                                    mee._LoadFormBlocks();                                                                 
                                }

                                var _saveCallBackMethod = function () {
                                    if (options.CallBackSaveMethod != null) {
                                        var templateHTML = mainContentHtmlGrand.html();
                                        var mainHTMLELE = meeIframe.find(".mainContentHtml");
                                        var constructedHTML = $(mainHTMLELE.outerHTML());
                                        var cleanedupHTML = CleanCode(constructedHTML).html();
                                        var outputter = $("<div></div>");
                                        outputter.wrapInner(cleanedupHTML);

                                        var outputHTML = "<!-- MEE_DOCUMENT -->" + outputter.outerHTML();
                                        options.CallBackSaveMethod(templateHTML, outputHTML);
                                        alert("Template has been successfully saved on Server.");
                                    }
                                };

                                myElement.on("click", "a.closebtn", function () {
                                    var element = $(this);
                                    element.parent().hide();
                                    return false;
                                });

                                myElement.find(".addNewFormLink").click(function () {
                                    loadForm('');
                                });

                                function loadForm(formId) {                                   
                                    mee.showFormWizard(formId);                                   
                                }                                
                                mee.deleteForm = function (element, form_id) {
                                    var URL = "/pms/landingpages/rFormSaver.jsp?" + options._BMSTOKEN+"&ukey="+options._app.get("user_Key");
                                    var post_data = {
                                        "delete": true,
                                        "mformId": form_id                                        
                                    };
                                    $.post(URL, post_data)
                                        .done(function (data) {                                            
                                            if (data && data.success) {
                                                element.fadeOut("slow", function () {
                                                    var obj = $(this);
                                                    obj.remove();
                                                })
                                            }
                                            else {
                                                options._app.showAlert("An error occured, Please try again!", $("body"));
                                            }
                                        });
                                }                               

                                myElement.find('.searchFormLink').click(function () {
                                    _searchFormBlocks();
                                });

                                myElement.find('.MenuCallBackSave').click(function (obj) {
                                    options.saveCallBack(obj);
                                });
                                                                
                                
                                 myElement.find('.MenuCallTemplate').click(function (obj) {
                                    options.templatesCallBack(obj);
                                });

                                
//****************************************************End of Ladning page Forms **************************************************** //                                                                 

                                // Kick start controls
                                InitializeControls();


                            });
                        }


                    });

                    jQuery.fn.visible = function () {
                        return this.css('visibility', 'visible');
                    };

                    jQuery.fn.invisible = function () {
                        return this.css('visibility', 'hidden');
                    };

                    jQuery.fn.visibilityToggle = function () {
                        return this.css('visibility', function (i, visibility) {
                            return (visibility == 'visible') ? 'hidden' : 'visible';
                        });
                    };

                    jQuery.fn.removeInlineStyle = function (property) {

                        if (property == null)
                            return this.removeAttr('style');

                        var proporties = property.split(/\s+/);

                        return this.each(function () {
                            var remover =
                                    this.style.removeProperty   // modern browser
                                    || this.style.removeAttribute   // old browser (ie 6-8)
                                    || jQuery.noop;  //eventual

                            for (var i = 0; i < proporties.length; i++)
                                remover.call(this.style, proporties[i]);

                        });
                    };

                    jQuery.fn.inlineStyle = function (prop) {
                        var value = "";
                        if (this.length) {
                            value = this.prop("style")[$.camelCase(prop)];
                        }
                        return value;
                    };

                    jQuery.fn.isEmpty = function () {

                        var el = this;

                        if ($.trim(el.html()) == true || $.trim(el.html()) === "&nbsp;") {
                            return true;
                        }
                        else {
                            return false;
                        }

                    }

                    jQuery.event.copy = function (from, to) {
                        from = from.jquery ? from : jQuery(from);
                        to = to.jquery ? to : jQuery(to);

                        var events = from[0].events || jQuery.data(from[0], "events") || jQuery._data(from[0], "events");
                        if (!from.length || !to.length || !events)
                            return;

                        return to.each(function () {
                            for (var type in events)
                                for (var handler in events[type])
                                    jQuery.event.add(this, type, events[type][handler], events[type][handler].data);
                        });
                    };
                    ﻿//Extension Methods
                            jQuery.fn.outerHTML = function (s) {
                                return s
                                        ? this.before(s).remove()
                                        : jQuery("<p>").append(this.eq(0).clone()).html();
                            };

                    String.prototype.replaceAll = function (find, replace) {
                        var str = this;
                        return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
                    };

                    this.render();
                },
                render: function () {
                    var BMSTOKEN = this.BMSTOKEN;
                    this._$el = this.options._el;
                    this.fromDialog = this.options.fromDialog ? true : false;
                    if (typeof String.prototype.startsWith != 'function') {
                        // see below for better implementation!
                        String.prototype.startsWith = function (str) {
                            return this.indexOf(str) == 0;
                        };
                    }
                    $().dndPageScroll();

                    var _imageAjaxParameters = {
                        Url: "/pms/io/publish/getImagesData/?" + BMSTOKEN + "&type=list&offset=0",
                        Data: "",
                        DataType: "",
                        Type: "",
                        ContentType: ""
                    };

                    var _AddimageAjaxParameters = {
                        Url: "/pms/io/publish/saveImagesData/?" + BMSTOKEN + "&type=add",
                        Data: "",
                        DataType: "",
                        Type: "",
                        ContentType: ""
                    };

                    var _searchImagesAjaxParameters = {
                        Url: "/pms/io/publish/getImagesData/?" + BMSTOKEN + "&type=search&offset=0&searchText=",
                        Data: "",
                        DataType: "",
                        Type: "",
                        ContentType: ""
                    };

                    var _saveImageTagsAjaxParameters = {
                        Url: "/pms/io/publish/saveImagesData/?" + BMSTOKEN + "&type=tags&imageId=",
                        Data: "",
                        DataType: "",
                        Type: "",
                        ContentType: ""
                    };

                    var _deleteImageAjaxParameter = {
                        Url: "/pms/io/publish/saveImagesData/?" + BMSTOKEN + "&type=delete&imageId=",
                        Data: "",
                        DataType: "",
                        Type: "",
                        ContentType: ""
                    };

                    var _preDefinedHTML = this.options.html;

                    var _formWizURL = this.app.get("host") + "/pms/landingpages/rformBuilderNew.jsp?" + BMSTOKEN + "&ukey=" + this.app.get("user_Key");
                    var _formDeleteURL = this.app.get("host") + "/pms/landingpages/rFormSaver.jsp?" + BMSTOKEN + "&ukey=" + this.app.get("user_Key");
                    var _app = this.app;
                    var reattachEvents = this.options.reattachEvents;
                    //Inserting iframe css and basic html


                    this._$el.MakeBridgeEditor({
                        SaveImageTagsProperties: _saveImageTagsAjaxParameters,
                        DeleteImageProperties: _deleteImageAjaxParameter,
                        ImagesAjaxProperties: _imageAjaxParameters,
                        SearchImagesProperties: _searchImagesAjaxParameters,
                        AddImageProperties: _AddimageAjaxParameters,
                        preDefinedHTML: _preDefinedHTML,
                        topPlus : this.options.margin ? this.options.margin.top:0,
                        leftPlus : this.options.margin? this.options.margin.left:0,    
                        landingPage: this.options.landingPage ? true : false,
                        saveBtnText: this.options.saveBtnText,
                        otopage : this.options.isOTOFlag ? true: false, 
                        formWizURL: _formWizURL,
                        fromDialog: this.fromDialog,
                        reAttachEvents: reattachEvents,
                        formDeleteURL: _formDeleteURL,
                        saveCallBack: this.options.saveClick,
                        templatesCallBack: this.options.changeTemplateClick,
                        saveTextVersionCallBack: this.options.textVersionCallBack,
                        textVersion:this.options.text,
                        formCallBack: this.options.formAttach, 
                        formid : this.options.formid,
                        _app: this.app,
                        pageId: this.options.pageid?this.options.pageid:false,
                        _BMSTOKEN: BMSTOKEN,
                        OnDropElementOnBuildingBlock: function (args, callBack) {
                        },
                        LoadTemplate: function (args) {

                        },
                        LoadBuildingBlocks: function (args) {
                        },
                        OnEditBuildingBlock: function (args) {
                        },
                        OnDeleteBuildingBlock: function (args) {
                        },
                        LoadMyColors: function (args) {
                            //GetBuildingBlocks

                            $.ajax({
                                url: "/pms/io/publish/getEditorData/?" + BMSTOKEN + "&type=listColors",
                                data: "{}",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (e) {
                                    args.myColors = e.colors;
                                    //console.log("MyColors success:" + e.colors);
                                },
                                error: function (e) {
                                    //console.log("MyColors Failed:" + e);
                                }
                            });
                        },
                        OnColorAdded: function (args) {
                            var saveColors = "";
                            if (args.myColorsFromServiceGlobal == "") {
                                saveColors = args.AddedColor;
                            }
                            else {
                                saveColors = args.myColorsFromServiceGlobal + "," + args.AddedColor;
                            }
                            //console.log("Color list to be added:" + saveColors);

                            saveColors = encodeURIComponent(saveColors);
                            //console.log("Color list to be added after encoded:" + saveColors);
                            var URL = "/pms/io/publish/saveEditorData/?" + BMSTOKEN + "&type=saveColors&colors=" + saveColors;
                            $.post(URL)
                                    .done(function (data) {
                                        //console.log("Insert My Color success:" + data);
                                        // your code go here. 
                                    });

                        },
                        OnSaveDynamicContent: function (args)
                        {

                            var content = args.DynamicContent;
                            var dynamicNumber = content.DynamicVariationID;
                            var contentURL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=newContent&dynamicNumber=" + dynamicNumber + "&campaignSubject=" + content.Label + "&contents=" + encodeURIComponent(content.InternalContents) + "&contentLabel=" + content.Label + "&isDefault=" + (content.IsDefault ? "Y" : "N");
                            $.ajax({
                                url: contentURL,
                                //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (ec) {
                                    args.DynamicContent.DynamicContentID = ec[1];
                                },
                                error: function (e) {
                                    //console.log("Insert Dynamic Variation Content failed:"+ e);
                                }
                            });

                        },
                        OnSaveDynamicRules: function (args)
                        {
                            var content = args.DynamicContent;
                            var dynamicNumber = content.DynamicVariationID;
                            var dynamicNumberContent = content.DynamicContentID;
                            var rules = content.ListOfDynamicRules;
                            var contentRuleURL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=updateContentRules&dynamicNumber=" + dynamicNumber + "&contentNumber=" + dynamicNumberContent + "&applyRuleCount=" + content.ApplyRuleCount + "&ruleCount=" + rules.length;
                            for (var j = 0; j < rules.length; j++) {
                                var rule = rules[j];
                                //contentRuleURL += "&"+ j +".spanInDays=";
                                contentRuleURL += "&" + (j + 1) + ".matchValue=" + rule.RuleMatchValue;
                                contentRuleURL += "&" + (j + 1) + ".fieldName=" + rule.RuleFieldName;
                                contentRuleURL += "&" + (j + 1) + ".dateFormat=" + rule.RuleDefaultValue;
                                contentRuleURL += "&" + (j + 1) + ".rule=" + rule.RuleCondition;
                                //contentRuleURL += "&"+ j +".listNumber=";
                            }
                            $.ajax({
                                url: contentRuleURL,
                                //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (e) {
                                    //console.log("Insert Dynamic Variation Content Rule success:"+ e);  

                                },
                                error: function (e) {
                                    //console.log("Insert Dynamic Variation Rule failed:"+ e);
                                }
                            });

                        },
                        OnUpdateDynamicContent: function (args)
                        {
                            var content = args.DynamicContent;
                            var dynamicNumber = content.DynamicVariationID;
                            var dynamicNumberContent = content.DynamicContentID;

                            var contentURL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=updateContent&dynamicNumber=" + dynamicNumber + "&campaignSubject=" + content.Label + "&contents=" + encodeURIComponent(content.InternalContents) + "&contentLabel=" + content.Label + "&contentNumber=" + dynamicNumberContent;

                            $.ajax({
                                url: contentURL,
                                //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (ec) {
                                    //console.log("Update Dynamic Variation Content success:"+ ec);  
                                    //console.log("Dynamic number Content is:" + ec[1]);


                                },
                                error: function (e) {
                                    //console.log("Insert Dynamic Variation Content failed:"+ e);
                                }
                            });
                        },
                        OnDeleteDynamicContent: function (args)
                        {
                            var content = args.DynamicContent;
                            var dynamicNumber = content.DynamicVariationID;
                            var dynamicNumberContent = content.DynamicContentID;

                            var contentURL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=deleteContent&dynamicNumber=" + dynamicNumber + "&contentNumber=" + dynamicNumberContent;

                            $.ajax({
                                url: contentURL,
                                //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (ec) {

                                },
                                error: function (e) {
                                }
                            });
                        },
                        OnDynamicContentSwap: function (args)
                        {
                            var content = args.DynamicContent;
                            var dynamicNumber = content.DynamicVariationID;
                            var dynamicNumberContent = content.DynamicContentID;

                            var contentURL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN;
                            $.post(contentURL, {"contents": content.InternalContents, type: "updateContent", dynamicNumber: dynamicNumber, campaignSubject: content.Label, contentLabel: content.Label, contentNumber: dynamicNumberContent, isDefault: content.IsDefault})
                                    .done(function (data) {

                                    });
                        },
                        OnDynamicControlSave: function (variation)
                        {
                            console.log("isUPdate on saving:" + variation.IsUpdate);
                            console.log("Variation ID on saving:" + variation.DynamicVariationID);
                            console.log("Variation Name on saving:" + variation.Label);
                            console.log(variation);

                            if (variation.IsUpdate) {

                                $.ajax({
                                    url: "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=relabel&label=" + variation.Label + "&dynamicNumber=" + variation.DynamicVariationID,
                                    //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                    type: "POST",
                                    contentType: "application/json; charset=latin1",
                                    dataType: "json",
                                    cache: false,
                                    async: false,
                                    success: function (e) {
                                        console.log("Rename Dynamic Variation success:" + e);
                                        //LoadBuildingBlocks();
                                    },
                                    error: function (e) {
                                        console.log("Rename Dynamic Variation failed:" + e);
                                    }

                                });
                                var dynamicNumber = variation.DynamicVariationID;
                                var contents = variation.ListOfDynamicContents;
                                for (var i = 0; i < contents.length; i++) {
                                    var content = contents[i];
                                    var contentNumber = content.DynamicContentID;
                                    console.log(content);
                                    console.log("ContentNumebr:" + contentNumber);
                                    var contentURL = "";
                                    if (contentNumber != 0) {
                                        contentURL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=updateContent&dynamicNumber=" + dynamicNumber + "&campaignSubject=" + content.Label + "&contents=" + encodeURIComponent(content.InternalContents) + "&contentLabel=" + content.Label + "&contentNumber=" + contentNumber;
                                    }
                                    else {
                                        contentURL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=newContent&dynamicNumber=" + dynamicNumber + "&campaignSubject=" + content.Label + "&contents=&contentLabel=" + content.Label + "&isDefault=" + (content.IsDefault ? "Y" : "N");
                                    }

                                    $.ajax({
                                        url: contentURL,
                                        //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                        type: "POST",
                                        contentType: "application/json; charset=latin1",
                                        dataType: "json",
                                        cache: false,
                                        async: false,
                                        success: function (ec) {
                                            console.log("Update Dynamic Variation Content success:" + ec);
                                            //console.log("Dynamic number Content is:" + ec[1]);
                                            if (contentNumber == 0) {
                                                contentNumber = ec[1];
                                            }
                                            var rules = content.ListOfDynamicRules;
                                            var contentRuleURL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=updateContentRules&dynamicNumber=" + dynamicNumber + "&contentNumber=" + contentNumber + "&applyRuleCount=" + content.ApplyRuleCount + "&ruleCount=" + rules.length;
                                            for (var j = 0; j < rules.length; j++) {
                                                var rule = rules[j];
                                                //contentRuleURL += "&"+ j +".spanInDays=";
                                                contentRuleURL += "&" + (j + 1) + ".matchValue=" + rule.RuleMatchValue;
                                                contentRuleURL += "&" + (j + 1) + ".fieldName=" + rule.RuleFieldName;
                                                contentRuleURL += "&" + (j + 1) + ".dateFormat=" + rule.RuleDefaultValue;
                                                contentRuleURL += "&" + (j + 1) + ".rule=" + rule.RuleCondition;
                                                //contentRuleURL += "&"+ j +".listNumber=";
                                            }
                                            $.ajax({
                                                url: contentRuleURL,
                                                //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                                type: "POST",
                                                contentType: "application/json; charset=latin1",
                                                dataType: "json",
                                                cache: false,
                                                async: false,
                                                success: function (e) {
                                                    console.log("Update Dynamic Variation Content Rule success:" + e);

                                                },
                                                error: function (e) {
                                                    console.log("Update Dynamic Variation Rule failed:" + e);
                                                }
                                            });


                                        },
                                        error: function (e) {
                                            console.log("Insert Dynamic Variation Content failed:" + e);
                                        }
                                    });
                                }
                            }
                            else {

                                var URL = "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=new&contentType=H&label=" + variation.Label;

                                $.ajax({
                                    url: URL,
                                    //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                    type: "POST",
                                    contentType: "application/json; charset=latin1",
                                    dataType: "json",
                                    cache: false,
                                    async: false,
                                    success: function (e) {
                                        console.log("Insert Dynamic Variation success:" + e);
                                        //var results = e.split(",");
                                        console.log("Dynamic number is:" + e[1]);

                                        var dynamicNumber = e[1];
                                        if (dynamicNumber != "err") {
                                            variation.DynamicVariationID = dynamicNumber;
                                        }
                                    },
                                    error: function (e) {
                                        console.log("Insert Dynamic Variation failed:" + e);
                                    }

                                });
                            }

                        },
                        OnEditDynamicVariation: function (args) {
                            //Save to Server
                            if (args.DCID != null) {
                                console.log("Block Id:" + args.DCID);
                                console.log("Block Name:" + args.DCName);

                                $.ajax({
                                    url: "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=relabel&label=" + args.DCName + "&dynamicNumber=" + args.DCID,
                                    //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                    type: "POST",
                                    contentType: "application/json; charset=latin1",
                                    dataType: "json",
                                    cache: false,
                                    async: false,
                                    success: function (e) {
                                        console.log("Rename Dynamic Variation success:" + e);
                                        //LoadBuildingBlocks();
                                    },
                                    error: function (e) {
                                        console.log("Rename Dynamic Variation failed:" + e);
                                    }

                                });

                            }


                        },
                        OnDynamicVariationName: function (variation) {
                            //Save to Server
                            if (variation != null) {
                                console.log("Block Id:" + variation.DynamicVariationID);
                                console.log("Block Name:" + variation.Label);

                                $.ajax({
                                    url: "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=relabel&label=" + variation.Label + "&dynamicNumber=" + variation.DynamicVariationID,
                                    //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                    type: "POST",
                                    contentType: "application/json; charset=latin1",
                                    dataType: "json",
                                    cache: false,
                                    async: false,
                                    success: function (e) {
                                        console.log("Rename Dynamic Variation success:" + e);
                                        //LoadBuildingBlocks();
                                    },
                                    error: function (e) {
                                        console.log("Rename Dynamic Variation failed:" + e);
                                    }

                                });

                            }


                        },
                        OnDeleteDynamicVariation: function (args) {
                            if (args != null) {
                                console.log(args.DCID);

                                $.ajax({
                                    url: "/pms/io/publish/saveDynamicVariation/?" + BMSTOKEN + "&type=delete&dynamicNumber=" + args.DCID,
                                    //data: "{ name: 'test', html: args.buildingBlock.Name }",
                                    type: "POST",
                                    contentType: "application/json; charset=latin1",
                                    dataType: "json",
                                    cache: false,
                                    async: false,
                                    success: function (e) {
                                        console.log("delete dynamicVariation success:" + e);
                                        //LoadBuildingBlocks();
                                    },
                                    error: function (e) {
                                        console.log("delete dynamicVariation failed:" + e);
                                    }

                                });
                            }
                        },
                        LoadDynamicBlocks: function (args) {
                            //GetDynamicBlocks

                            $.ajax({
                                url: "/pms/io/publish/getDynamicVariation/?" + BMSTOKEN + "&type=list",
                                data: "{}",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (e) {
                                    if (e.variations != undefined) {
                                        args.dynamicBlocks = e.variations[0];
                                        //console.log("GetDynamicBlocks success:" + e.data);
                                    }
                                },
                                error: function (e) {
                                    console.log("GetDynamicBlocks Failed:" + e);
                                }
                            });
                        },
                        LoadPersonalizeTags: function (args) {
                            //GetDynamicBlocks

                            $.ajax({
                                url: "/pms/io/getMetaData/?" + BMSTOKEN + "&type=merge_tags",
                                data: "{}",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (e) {
                                    args.personalizeTags = e;
                                    //console.log("LoadPersonalizeTags success:" + e);

                                },
                                error: function (e) {
                                    //console.log("LoadPersonalizeTags Failed:" + e);
                                }
                            });
                        },
                        CallBackSaveMethod: function (templateHTML, outputHTML) {
                            console.log("TemplateHTML:" + templateHTML);
                            console.log("OutputHTML:" + outputHTML);

                            $.post('/pms/io/campaign/saveUserTemplate/?"+BMSTOKEN+"',
                                    {
                                        type: 'update',
                                        // templateNumber:'jbKw21Ps30Uu33Kr26ja',
                                        templateNumber: 'BzAEqwsJp20In21Vr30Rk33BdTMyio',
                                        imageId: '',
                                        isFeatured: 'N',
                                        isReturnPath: 'N',
                                        isMobile: 'N',
                                        categoryID: '',
                                        templateHtml: outputHTML
                                    }
                            )
                                    .done(function (data) {
                                        console.log("Saving done with response:" + data);
                                    });

                        },
                        LoadFormBlocks: function (args) {
                            //LoadFormBlocks

                            $.ajax({
                                url: "/pms/io/form/getSignUpFormData/?" + BMSTOKEN + "&type=search",
                                data: "{}",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (e) {
                                    if (e.count != "0") {
                                        args.formBlocks = e.forms[0];
                                        console.log("LoadFormBlocks success:" + e);
                                    }
                                },
                                error: function (e) {
                                    console.log("LoadFormBlocks Failed:" + e);
                                }
                            });
                        },
                        LoadFormContents: function (args) {
                            //LoadFormContents

                            $.ajax({
                                url: "/pms/io/form/getSignUpFormData/?" + BMSTOKEN + "&type=snippet&formId=" + args.FormId,
                                data: "{}",
                                type: "POST",
                                contentType: "application/json; charset=latin1",
                                dataType: "json",
                                cache: false,
                                async: false,
                                success: function (e) {
                                    args.formContents = e.formPreviewURL;
                                    console.log("LoadFormContents success:" + e);

                                },
                                error: function (e) {
                                    console.log("LoadFormContents  Failed:" + e);
                                }
                            });
                        },
                        OnExistingDynamicControlDropped: function () {

                        }


                    });
                }


            });
        });
