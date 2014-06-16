
    // DOM Ready

    var DefaultImage = "images/sample.jpg"
    var fwdToFrndLink = "{{BMS_TELL_A_FRIEND_URL}}";
    var unsubLink = "{{BMS_UNSUBSCRIBE_URL}}";
    var cantReadLink = "{{BMS_WEB_VERSION_URL}}";
    var socialFacebookLink = "{{BMS_FACEBOOK_SHARE_URL}}";
    var socialTwitterLink = "{{BMS_TWITTER_SHARE_URL}}";
    var socialLinkedInLink = "{{BMS_LINKEDIN_SHARE_URL}}";
    var socialPintrestLink = "{{BMS_PINTEREST_SHARE_URL}}";
    var socialGooglePlusLink = "{{BMS_GOOGLEPLUS_SHARE_URL}}";

    
    // var topHandlersHTML = "<div class='topHandlers'><ul><li class='myHandlerDelete'><img src='images/delete.png' />  </li><li class='myHandlerCopy'><img src='images/copy.png' /></li><li class='myHandle'><img src='images/move.png' /></li></ul></div>";

    var topHandlersHTML = "<div class='topHandlers'><ul><li class='myHandle'><i class='icon move'></i></li><li class='myHandlerCopy'><i class='icon copy'></i></li><li class='myHandlerDelete'><i class='icon delete'></i></li></ul></div>";

    $(document).ajaxStart(function () {

        $(".loadingDiv").show();
    });

    $(document).ajaxComplete(function () {
        $(".loadingDiv").hide();
    });

    $.fn.extend({

        MakeBridgeEditor: function (options) {

            

            this.each(function () {
               var $this = $(this);
                console.log(this.length);
                var undoManager = new MakeBridgeUndoRedoManager();

                //Getting View with the help of Backbone:
                var MainHtmlView = Backbone.View.extend({
                    my_template: _.template($("#tmpMakeBridgeContainer").html()),
                    //el:'#myTags',
                    initialize: function () {
                        //The "render()" function will load our template into the view's "el" property using jQuery below :)
                        this.render();
                    },

                    render: function () {
                         this.$el.html(this.my_template);
                        // var that=this;
                        // $.get( 'view/mee_view.html', function (data) {
                        //     var template = _.template(data, {  });
                        //     console.log("HTML contents for MEE are:"+template);
                        //     that.$el.html(template);  
                        // }, 'html');
                    }
                    


                });

                // console.log("Going to print passed element");
                // console.log(element);
                var mainView = new MainHtmlView();
                //$this = element;
                $this.html(mainView.el);
                var myElement = $this;

                var oInitDestroyEvents = new InitializeAndDestroyEvents();


                //TODO Styles
                //--Muhammad Adnan -----------------------STYLES ----------------------------//
                var IsStyleActivated = false;
                var SelectedElementForStyle = null;
                var borderColor = "#000";
                var chkChangeAllMatching = myElement.find(".chkChangeAllMatching");
                var templateColors = myElement.find(".templateColors");
                var mainContentHtmlGrand = myElement.find(".mainContentHtmlGrand");
                var myColorsFromServiceGlobal = "";
                var txtColorCode = myElement.find(".txtColorCode");
                var ulMyColors = myElement.find(".myColors");
                var personalizedTagsGlobal = "";
                var formBlocksGlobal = "";
                var areaToDisplay = null;
                var selectedSocialLink = null;

                
                
                var dialogForTextColor = true;
                var selectedLinkFromTinyMCE = null;
                var imageListGlobal = null;


                var defaultLiContentForDC = $("<li class='right defaultLi active'><span>Default</span></li>");
                
                // var firstTime = true;

                console.log("LandingPage:"+ options.landingPage);
                if (options.landingPage) {
                    console.log("Its Here..");
                    myElement.find(".DCH3").hide();
                    myElement.find(".DCCC").hide();
                    myElement.find(".formH3").show();
                    myElement.find(".formContent").show();  
                    myElement.find(".mainTable").css("width", "95%");
                    
                }



                if (options.preDefinedHTML != null && options.preDefinedHTML != "") {

                    // console.log("PRE-DEFINED HTML:" + options.preDefinedHTML);
                    var oHtml= new Object();
                    var args = new Object();

                    if(options.preDefinedHTML == "TEMPLATE") {
                        options.LoadTemplate(args);
                        var templateHtml = args.HTMLTEXT;
                        var templateObj = $(templateHtml);
                        console.log("Template HTML:" + templateHtml);
                        options.preDefinedHTML = templateHtml;
                        // if(templateObj.hasClass("MEE_DOCUMENT")) {
                        //     options.preDefinedHTML = templateHtml;
                        // }
                        // else {
                        //     var mt = templateObj.find("table.MEE_DOCUMENT");
                        //     if(mt != undefined) {
                        //         options.preDefinedHTML = mt.outerHTML;
                        //     }    
                        // }
                        // console.log(templateObj);
                        // var mt = templateObj.find("table.MEE_DOCUMENT");
                        // console.log("CONTAINS MEE_DOCUMENT CLASS:" + templateObj.hasClass("MEE_DOCUMENT"));

                        // var mee_template_String = mt.html();
                        // console.log("Template REmaining thml:\n"+  mee_template_String);
                        // options.preDefinedHTML = mee_template_String;
                    }
                    
                        
                    oHtml = $(options.preDefinedHTML);
                    console.log(oHtml);
                    
                    var isMEEDoc = false;
                    oHtml.filter(function () {
                        return this.nodeType == 8;
                    }).each (function(i, e){
                        console.log("COMMENT FOUND WITH VALUE:" + e.nodeValue);
                        if(e.nodeValue.trim() == "MEE_DOCUMENT") {
                            isMEEDoc = true;
                        }
                    })

                    if(isMEEDoc) {
                        // if(oHtml.hasClass("MEE_DOCUMENT")) {
                            // console.log("class found");
                            oHtml = reConstructCode(options.preDefinedHTML);                
                        
                            oInitDestroyEvents.InitAll(oHtml);

                            var mainObj = myElement.find(".mainContentHtml");
                            oInitDestroyEvents.InitAll(mainObj);
                            
                            //console.log("RETURNED HTML after Reconstructing:\n" + oHtml.html());
                            // console.log(mainObj);
                            // mainObj = oHtml.clone(true, true);
                            mainObj.append(oHtml);
                            //console.log("FINALIZED HTML:\n" + mainObj.html());
                            //mainObj.find("div.textcontent").css('visibility', 'visible');
                            IsStyleActivated = false;
                            oInitDestroyEvents.InitAll(mainObj);
                        // }
                    }
                    // oInitDestroyEvents.InitAll(mainTable, true);
                }

                function makeCloneAndRegister() {
                    var mainTable = myElement.find(".mainTable").clone(true);
                    mainTable.find("div.ui-resizable-e").remove();
                    mainTable.find("div.ui-resizable-s").remove();
                    mainTable.find("div.ui-resizable-se").remove();
                    mainTable.find("div.textcontent").removeClass('mce-content-body');

                    undoManager.registerAction(mainTable);
                    return false;
                }
                //undoManager.registerAction();
                makeCloneAndRegister();

                //Bind Undo redo Functionality 
                myElement.find(".undo").click(function () {
                    var replaceObj = undoManager.undo();
                    //undoManager.registerAction(myElement.find(".mainTable").html());
                    if (replaceObj != null) {
                        var mainObj = myElement.find(".mainTable");
                        mainObj.html(replaceObj.html());
                        mainObj.find("div.textcontent").css('visibility', 'visible');

                        oInitDestroyEvents.InitAll(mainObj, true);

                    }
                });
                myElement.find(".redo").click(function () {
                    var replaceObj = undoManager.redo();
                    if (replaceObj != null) {
                        var mainObj = myElement.find(".mainTable");
                        mainObj.html(replaceObj.html());
                        mainObj.find("div.textcontent").css('visibility', 'visible');
                        oInitDestroyEvents.InitAll(mainObj, true);
                    }
                });

                $.fn.getMEEHTML = function() {
                    console.log("Hello From HTML");
                    var mainHTMLELE = myElement.find(".mainContentHtml");
                    var constructedHTML = $(mainHTMLELE.outerHTML());
                    console.log("HTML going for cleanup:"+ constructedHTML.outerHTML());
                    var cleanedupHTML = CleanCode(constructedHTML).html();
                    // console.log("HTML after cleanup:"+ cleanedupHTML);
                    var outputter = $("<div></div>");
                    outputter.wrapInner(cleanedupHTML);
                    
                    var outputHTML = "<!-- MEE_DOCUMENT -->" + outputter.outerHTML();
                    // console.log("OutputHTML:"+ outputHTML);
                    return outputHTML;
                };


                $.fn.setMEEHTML = function(html) {
                    options.preDefinedHTML = html;
                    oHtml = reConstructCode(options.preDefinedHTML);                
                        
                    oInitDestroyEvents.InitAll(oHtml);

                    var mainObj = myElement.find(".mainContentHtml");
                    oInitDestroyEvents.InitAll(mainObj);
                    
                    //console.log("RETURNED HTML after Reconstructing:\n" + oHtml.html());
                    // console.log(mainObj);
                    // mainObj = oHtml.clone(true, true);
                    mainObj.append(oHtml);
                    //console.log("FINALIZED HTML:\n" + mainObj.html());
                    //mainObj.find("div.textcontent").css('visibility', 'visible');
                    IsStyleActivated = false;
                    oInitDestroyEvents.InitAll(mainObj);
                };


                function InitializeElementsForStyle(isActive) {

                    if (!isActive) {

                        RemoveAllOutline();

                        IsStyleActivated = false;

                        SelectedElementForStyle = null;

                        oInitDestroyEvents.InitializePluginsEvents(myElement);


                    }
                    else {

                        oInitDestroyEvents.DestroyPluginsEvents(myElement);

                        IsStyleActivated = true;
                        myElement.find(".ddlBackgroundLayers").chosen();
                        //Selection
                        myElement.find(".csHaveData td, .csHaveData div").click(function (event) {
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
                                              $('<option></option>').val("-1").html("Select Parent Layer"));


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
                                myElement.find(".ddlBackgroundLayers").trigger("chosen:updated");
                                //////////////////////////////////////////////////
                                
                            }
                        });
                        //////////////////////

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
                                    myElement.find("#"+type+"Border").removeClass('borderselected');
                                    $element.css("border-"+type, "none");    
                        
                                }
                                else {

                                    //$(this).addClass("active");
                                    var borderType = myElement.find(".ddlBorderType").val();
                                    var borderWidth = myElement.find(".ddlBorderWidth").val();
                                    SelectedElementForStyle.css("border-" + type, borderWidth + "px " + borderType + " " + borderColor);
                                    myElement.find("#"+type+"Border").addClass('borderselected');

                                    var string = borderWidth + "px " + borderType + " #000";
                                    $element.css("border-"+type, string);
                                    borderTopWidth = $element.css("border-"+type+"-width").split("px");
                                    borderTopWidth = Number(borderTopWidth[0]);
                                    borderBottomWidth = $element.css("border-bottom-width").split("px");
                                    borderBottomWidth = Number(borderBottomWidth[0]);
                                    TotalBorderTopBottom = borderTopWidth + borderBottomWidth;
                                    if(type == 'top' || type == 'bottom') {
                                        $element.css("height", 48 - TotalBorderTopBottom + "px");
                                    }
                                    else {
                                        $element.css("width", 48 - TotalBorderTopBottom + "px");   
                                    }
                                }
                                // undoManager.registerAction(mainContentHtmlGrand.html());  
                                makeCloneAndRegister();
                            }
                        });
                        //////////////////////
                        //Vertical Align
                        myElement.find(".sVerticalAlign").click(function () {

                            // console.log("Vertical Align clicked.");
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

                                // undoManager.registerAction(mainContentHtmlGrand.html());  
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
                                    myElement.find("#"+type+"Padding").removeClass('borderselected');
                                    
                                }
                                else {
                                    //$(this).addClass("active");
                                    var paddingValue = myElement.find(".ddlPadding").val();
                                    SelectedElementForStyle.css("padding-" + type, paddingValue + "px");
                                    myElement.find("#"+type+"Padding").addClass('borderselected');
                                }
                                //  undoManager.registerAction(mainContentHtmlGrand.html());
                                makeCloneAndRegister();
                            }
                        });
                        //////////////////////
                        
                        //Background Layers
                        var ddlBackgroundLayers = myElement.find(".ddlBackgroundLayers");
                        ddlBackgroundLayers.find("option").remove();

                        ddlBackgroundLayers.append(
                                               $('<option></option>').val("-1").html("Select Parent Layer"));


                        ddlBackgroundLayers.append(
                                               $('<option></option>')
                                               .val(mainContentHtmlGrand.prop("tagName"))
                                               .html("Parent: " + mainContentHtmlGrand.prop("tagName"))
                                               .data("el", mainContentHtmlGrand)
                                           );

                        ddlBackgroundLayers.on('change', function () {

                            if ($(this).find(':selected').val() != "-1") {
                                RemoveAllOutline();
                                SelectedElementForStyle = $(this).find(':selected').data('el');
                                SelectedElementForStyle.css("outline", "2px solid #6298be");
                                // undoManager.registerAction(mainContentHtmlGrand.html());
                                makeCloneAndRegister();
                            }
                        });
                        myElement.find(".ddlBackgroundLayers").trigger("chosen:updated");
                        ///////////////////////
                        
                        
                        //Email Width
                        myElement.find(".btnContainerSize").click(function () {
                            var value = $(this).data("value");
                            //console.log("background value:"+ value);
                            myElement.find(".mainTable").css("width", value + "px");
                            if (value == "700") {
                                myElement.find("input#700").addClass("active");
                                myElement.find("input#700").siblings().removeClass("active");
                            }
                            if (value == "600") {
                                myElement.find("input#600").addClass("active");
                                myElement.find("input#600").siblings().removeClass("active");
                            }
                            if (value == "500") {
                                myElement.find("input#500").addClass("active");
                                myElement.find("input#500").siblings().removeClass("active");
                            }
                            //undoManager.registerAction(mainContentHtmlGrand.html());
                            makeCloneAndRegister();
                        });

                        myElement.find(".txtContainerSize").keyup(function (e) {
                            myElement.find(".mainTable").css("width", $(this).val() + "px");
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

                                // ulMyColors.find("li").click(function () {                
                                //         SetBackgroundColor($(this).data("color"));
                                // });



                            };

                        });


                        //Load Colors
                        _LoadMyColors();
                    }




                }

                function RemoveAllOutline() {
                    myElement.find(".mainContentHtmlGrand").removeInlineStyle("outline");
                    myElement.find("*").removeInlineStyle("outline");
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

                    console.log("Border  (top:"+topVal+", bottom:"+bottomVal+", left:"+leftVal+", right:"+rightVal+")");
                    console.log("Padding (top:"+paddingtopVal+", bottom:"+paddingbottomVal+", left:"+paddingleftVal+", right:"+paddingrightVal+")");
                    console.log("vertical-align:"+verticalAlignVal);

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

                            //Assigning unique ID here:
                            console.log("MyCOlor from AArray: " + obj);
                            //var block = $("<li style='background-color:"+ obj + ";'></li>");                       


                            listOfMyColorsHtml += "<li style='background-color:" + obj + ";' data-color='" + obj + "'></li>";


                        });
                        //console.log(listOfMyColorsHtml);
                        ulMyColors.empty();
                        ulMyColors.append(listOfMyColorsHtml);

                        ulMyColors.find("li").click(function () {
                            console.log("li color" + $(this).data("color"));
                            SetBackgroundColor($(this).data("color"));

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
                            //undoManager.registerAction(mainContentHtmlGrand.html());
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
                        //console.log(hex);
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
                        // undoManager.registerAction(mainContentHtmlGrand.html());
                    }
                }
                InitializeStyleControls();

                //=============================================================================


                //--Muhammad Adnan ---------------- Dyanamic Contents ------------------------//
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
                          

                

                function InitializeDynamicControl (args) {

                    var SaveRuleWindow = function (args) {

                        var dcRulesDialog = args.dcRulesDialog;

                        var listOfDynamicRules = new Array();

                        
                        dcRulesDialog.find(".rule").each(function (index, object) {
                            var $this = $(object);

                            
                            var dcRuleFieldName = $this.find(".dcRuleFieldName");
                            var dcRuleCondition = $this.find(".dcRuleCondition");
                            var dcRuleMatchValue = $this.find(".dcRuleMatchValue");

                            
                            var rule = new DynamicRules();
                            rule.RuleFieldName = dcRuleFieldName.val();
                            rule.RuleCondition = dcRuleCondition.val();
                            rule.RuleMatchValue = dcRuleMatchValue.val();
                                                    
                            listOfDynamicRules.push(rule);

                        });

                        //var dcRuleLabel = dcRulesDialog.find(".dcRuleLabel");


                        var content = args.clickedLi.data("content");
                        content.ListOfDynamicRules = listOfDynamicRules;
                        content.DynamicVariationID = args.DynamicVariation.DynamicVariationID;
                        //content.IsUpdate = args.IsUpdate;

                        args.DynamicContent = new DynamicContents();
                        args.DynamicContent = content;

                        if (options.OnSaveDynamicRules != null) {
                            //alert(args.DynamicVariation.DynamicVariationID);
                            //alert(args.DynamicContent.DynamicContentID);
                            options.OnSaveDynamicRules(args);
                        }

                        //var existingContent = args.DynamicContent;
                        //existingContent.ListOfDynamicRules = listOfDynamicRules;

                        args.clickedLi.data("content", args.DynamicContent);



                        //if (args.IsUpdate) { //!!
                        //UPDATE CASE               




                        //}
                        //else {

                        //NEW CASE

                        //var dcContents = args.predefinedControl.Html.find(".dcContents");
                        //var newLi = $($(".dcLI").html());
                        //newLi.find("span:first").html(args.DynamicContent.Label);
                        //newLi.data("content", args.DynamicContent);

                        //dcContents.prepend(newLi);
                        //}

                        //RePopulateContentNames(args);

                    }

                    var PopulateContent = function (args) {

                        if (args.DynamicVariation != null) {

                            args.predefinedControl.Html.find(".dcName span:first").html(args.DynamicVariation.Label);
                            //var txtVariationName = args.predefinedControl.Html.find(".txtVariationName");
                            //txtVariationName.val(args.DynamicVariation.Label);

                            //dcInternalContents = args.predefinedControl.Html.find(".dcInternalContents");

                            var dcContents = args.predefinedControl.Html.find(".dcContents");
                            //txtVariationName.data("isUpdate", true);
                            //txtVariationName.data("variationID", args.DynamicVariation.DynamicVariationID);

                            if (args.DynamicVariation.ListOfDynamicContents.length > 0) {
                                $.each(args.DynamicVariation.ListOfDynamicContents, function (i, variation) {

                                    //var ContentLi = $("<li>" + variation.Label + "</li>");

                                    if (variation.Label == "Default") {
                                        var ContentLi = defaultLiContentForDC.clone();
                                        ContentLi.data("dcInternalData", $('<div/>').html(variation.InternalContents).text());
                                        ContentLi.data("content", variation);
                                        ContentLi.addClass("defaultLi");
                                        //console.log(variation.internalContents);
                                        //console.log(unescape(variation.internalContents));
                                        //console.log(decodeURIComponent( unescape(unescape(variation.internalContents))));
                                        //var decodeHTML = $('<div/>').html(variation.internalContents);
                                        //dcInternalContents.html(decodeHTML);
                                        //ContentLi.css('background-color','#748EA2');

                                        var dcInternal = args.droppedElement.find(".dcInternalContents:first");

                                        //args.clickedLi = ContentLi;
                                        var defaultInternalContent = $(ContentLi.data("dcInternalData"));
                                        oInitDestroyEvents.InitAll(defaultInternalContent);

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

                                        ContentLi.data("dcInternalData", $($('<div/>').html(variation.InternalContents).text()));

                                        OnFilterClick(ContentLi);
                                        OnEditContentName(ContentLi);
                                        OnDeleteContent(ContentLi);

                                        dcContents.prepend(ContentLi);
                                    }

                                });
                            }
                            //else {
                            //    //Add Default Content     
                                
                            //    var dcContents = args.predefinedControl.Html.find(".dcContents");

                            //    var defaultLi = defaultLiContentForDC.clone();
                                
                            //    if (defaultLi.data("content") == null) {
                            //        var defaultContent = new DynamicContents();
                            //        defaultContent.Label = "Default";
                            //        defaultContent.IsDefault = true;
                                    
                            //        var defaultContentLi = defaultLi;
                            //        defaultContentLi.data("content", defaultContent);
                            //        dcContents.append(defaultContentLi);
                            //    }
                            //}





                        }
                    }

                    var PopulateRulesWindow = function (args) {
                        if (args.DynamicContent != null) {

                            //Main values
                            //dcRuleLabel.val(args.DynamicContent.Label);

                            oInitDestroyEvents.InitAll(dcInternalContents);

                            //Rules
                            dcRulesContainer.html("");

                            
                            $.each(args.DynamicContent.ListOfDynamicRules, function (i, o) {

                                var ruleTemplate = $(dcRuleTemplate.html());

                                //Delete Event
                                ruleTemplate.find(".delete").click(function () {
                                    ruleTemplate.remove();
                                });

                                ////////////////////////////////////

                                ruleTemplate.find(".firstChosen").chosen({width:"224px"});
                                ruleTemplate.find(".secondChosen").chosen({ disable_search_threshold: 10 , width:"180px"});
                                ruleTemplate.find(".thirdChosen").chosen({ disable_search_threshold: 10 , width:"150px"});

                                var dcRuleFieldName = ruleTemplate.find(".dcRuleFieldName");
                                var dcRuleCondition = ruleTemplate.find(".dcRuleCondition");
                                var dcRuleFormat = ruleTemplate.find(".dcRuleFormat");
                                var dcRuleMatchValue = ruleTemplate.find(".dcRuleMatchValue");
                                                            
                                dcRuleFieldName.find("option[value='" + o.RuleFieldName + "']").prop("selected", "selected");
                                dcRuleCondition.find("option[value='" + o.RuleCondition + "']").prop("selected", "selected");
                                dcRuleFormat.find("option[value='" + o.dcRuleFormat + "']").prop("selected", "selected");
                                dcRuleMatchValue.val(o.RuleMatchValue);

                                ruleTemplate.find(".firstChosen").trigger("chosen:updated");
                                ruleTemplate.find(".secondChosen").trigger("chosen:updated");
                                ruleTemplate.find(".thirdChosen").trigger("chosen:updated");                            
                                
                                dcRulesContainer.append(ruleTemplate);

                            });



                        }
                        else {
                            console.log("args.DynamicContent is null");
                        }
                    }

                    var OpenRulesWindow = function (args, top, left) {

                        var dcRulesManageDialog = myElement.find(".dcRulesDialog");

                        
                        
                        dcRulesManageDialog.dialog({
                            //height: 350,
                            width: 850,
                            position:[left,top],
                            // left:left,
                            modal: true/*,
                            buttons: [
                                 {
                                     text: "Close",
                                     "class": 'btn-gray',
                                     click: function () {

                                         $(this).dialog('destroy');
                                     },

                                 },

                                 {
                                     text: "Save",
                                     "class": 'btn-green',
                                     click: function () {

                                         args.dcRulesDialog = $(this);

                                         SaveRuleWindow(args);

                                         $(this).dialog('destroy');
                                     }
                                 }
                            ]*/
                        }).dialog("open");

                        myElement.find(".ui-dialog-buttonpane").hide();
                        myElement.find(".ruleDialogClose").click(function () {
                            
                            dcRulesManageDialog.dialog("destroy");
                        });
                        myElement.find(".ruleDialogSave").click(function () {
                            args.dcRulesDialog = dcRulesManageDialog;
                            SaveRuleWindow(args);
                            dcRulesManageDialog.dialog('destroy');

                            

                        });

                        // var topp = top+"px";
                        // var leftp = left+ "px";
                        // dcRulesDialog.dialog.css({"left":leftp,"top":topp});

                    }

                    var OnFilterClick = function (element) {
                        element.find("i.filter").click(function (event) {

                            event.stopPropagation();

                            var parentLi = $(this).parents("li:first");
                            args.clickedLi = parentLi;


                            args.IsUpdate = true;
                            args.DynamicContent = args.clickedLi.data("content");

                            PopulateRulesWindow(args);

                            var left_minus = 250;      //static space to minus to show dialog on exact location
                            var _ele = $(this);
                            var ele_offset = _ele.offset();                 
                            var ele_height =  _ele.height();
                            var top = ele_offset.top + ele_height +4;
                            var left = ele_offset.left-left_minus;  

                            console.log("left:"+left+"px, top:"+top+"px");
                            OpenRulesWindow(args, top, left);


                            //if (args.clickedLi.data("content") != null)
                            //{
                            //    args.DynamicContent = args.clickedLi.data("content");


                            //    if (args.DynamicContent.ListOfDynamicRules == null) {
                            //        alert("new case");
                            //        args.IsUpdate = false;
                            //    }
                            //    else
                            //    {

                            //    }


                            //}


                            //if (args.clickedLi.data("content") != null)
                            //{

                            //}
                            //else
                            //{

                            //}


                        });
                    }

                    var OnEditContentName = function (element) {

                        element.find(".btnContentEditName").click(function (event) {

                            event.stopPropagation();

                            
                            args.DynamicContent = element.data("content");

                            var dcContentNameUpdateWindow = args.predefinedControl.Html.find(".dcContentNameUpdate");
                            dcContentNameUpdateWindow.find(".txtContentName").val(args.DynamicContent.Label);
                            dcContentNameUpdateWindow.show();


                            //Event
                            dcContentNameUpdateWindow.find(".btnUpdateContent").click(function (event) {
                                event.stopPropagation();
                                
                                args.DynamicContent = element.data("content");

                                
                                //console.log(element.data("content"));
                                args.DynamicContent.Label = dcContentNameUpdateWindow.find(".txtContentName").val();
                                element.find("span:first").html(args.DynamicContent.Label);

                                if (options.OnUpdateDynamicContent != null) {
                                    //alert(args.DynamicContent.DynamicContentID);
                                    //alert(args.DynamicVariation.DynamicVariationID);

                                    options.OnUpdateDynamicContent(args);
                                }

                                dcContentNameUpdateWindow.hide();

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

                            args.DynamicContent = element.data("content");

                            if (options.OnDeleteDynamicContent != null) {
                               
                                options.OnDeleteDynamicContent(args);
                            }

                            //Activate Default here.
                            element.siblings(".defaultLi").trigger("click");

                            element.remove();

                            

                        });
                    }
                    
                    if (args.predefinedControl != null) {

                        console.log(args);
                        // var mainParent = args.predefinedControl.Html.find(".dynamicContentContainer");
                        var mainParent = $(args.predefinedControl.Html);//.find(".dynamicContentContainer");

                        mainParent.data("variationID", args.DynamicVariation.DynamicVariationID);
                        mainParent.attr("id", args.DynamicVariation.DynamicVariationID);
                        mainParent.attr("keyword", args.DynamicVariation.DynamicVariationCode);
                        mainParent.data("content", args.DynamicVariation);

                        // mainParent.addClass(args.DynamicVariation.DynamicVariationID);
                        // console.log(mainParent);
                        // console.log(mainParent.html());
                        console.log(mainParent.attr("id"));
                        console.log(mainParent.data("variationID"));

                        
                        dcInternalContents = args.predefinedControl.Html.find(".dcInternalContents");
                        
                        PopulateContent(args);
                        
                       
                            
                        

                        //Save Click
                        //args.predefinedControl.Html.find(".dcSaveButton").click(function () {

                        //    if (txtVariationName.isEmpty())
                        //    {
                        //        alert("Please enter dynamic control name.");
                        //        return;
                        //    }
                        //    else
                        //    {
                        //        var variation = new DynamicVariation();
                        //        variation.Label = txtVariationName.val();

                        //        if (txtVariationName.data("isUpdate") != null && txtVariationName.data("variationID") != null) {
                        //            variation.IsUpdate = txtVariationName.data("isUpdate");
                        //            variation.DynamicVariationID = txtVariationName.data("variationID");
                        //        }

                        //        args.predefinedControl.Html.find(".dcContents li").each(function (i, o) {

                        //            var obj = $(o);

                        //            var dContent = obj.data("content");

                        //            if (obj.hasClass("active")) {
                        //                var dcClickedContainer = obj.parents(".dynamicContentContainer:first");
                        //                var dcInternal = dcClickedContainer.find(".dcInternalContents:first");

                        //                oInitDestroyEvents.DestroyPluginsEvents(dcInternal);
                        //                dContent.InternalContents = dcInternal.html();
                        //                oInitDestroyEvents.InitAll(dcInternal);

                        //                // alert(obj.data("dcInternalData").outerHTML());
                        //            }
                        //            else
                        //            {
                        //                //Expect here HTML TEXT in DATA
                        //                dContent.InternalContents = obj.data("dcInternalData");

                        //                //console.log("Internal Contents of "+ dContent.Label + "  are:" + dContent.InternalContents);
                        //                // alert(obj.data("dcInternalData").outerHTML());
                        //            }



                        //            variation.ListOfDynamicContents.push(dContent);
                        //        });

                        //        if (options.OnDynamicControlSave != null) {
                        //            options.OnDynamicControlSave(variation);
                        //        }

                        //        //args.DynamicVariation = variation;
                        //        //PopulateContent(args);


                        //        _LoadDynamicBlocks(args);

                        //    }


                        //});

                        //Edit Button
                        args.predefinedControl.Html.find(".editname").click(function () {

                            args.predefinedControl.Html.find(".editNameBox").toggle();
                        });


                        
                        //if (args.DynamicVariation.Label == undefined) {
                        //    txtVariationName.val("Dynamic Block 1");
                        //}
                        //else {
                          
                        //}

                        args.predefinedControl.Html.find(".btnCloseDCName").click(function () {
                            args.predefinedControl.Html.find(".editNameBox").hide();
                        });


                        var txtVariationName = args.predefinedControl.Html.find(".txtVariationName");
                        txtVariationName.val(args.DynamicVariation.Label);

                        args.predefinedControl.Html.find(".btnSaveDCName").click(function () {

                            args.DynamicVariation.Label = txtVariationName.val();

                            if (options.OnDynamicVariationName != null) {
                                    options.OnDynamicVariationName(args.DynamicVariation);
                                    alert("Successfully Saved");
                            }
                            args.predefinedControl.Html.find(".dcName span:first").html(args.DynamicVariation.Label);
                            args.predefinedControl.Html.find(".editNameBox").hide();
                            _LoadDynamicBlocks();
                            
                        });

                        //OLD FUNCTION FOR SAVE ALL AT A TIME:
                        //args.predefinedControl.Html.find(".btnSaveDCName").click(function () {
                        //    alert("im save");
                        //    var txtVariationName = args.predefinedControl.Html.find(".txtVariationName");
                        //    if (txtVariationName.isEmpty()) {
                        //        alert("Please enter dynamic control name.");
                        //        return;
                        //    }
                        //    else {


                        //        args.predefinedControl.Html.find(".dcName span:first").html(txtVariationName.val());

                        //        var variation = new DynamicVariation();
                        //        variation.Label = txtVariationName.val();

                        //        //if (txtVariationName.data("isUpdate") != null && txtVariationName.data("variationID") != null) {
                        //            //variation.IsUpdate = txtVariationName.data("isUpdate");
                        //            //variation.DynamicVariationID = txtVariationName.data("variationID");
                        //        //}

                                
                        //        variation.IsUpdate = true;
                        //        variation.DynamicVariationID = mainParent.data("variationID");

                        //        args.predefinedControl.Html.find(".dcContents li").each(function (i, o) {

                        //            var obj = $(o);

                        //            var dContent = obj.data("content");

                        //            if (obj.hasClass("active")) {
                        //                var dcClickedContainer = obj.parents(".dynamicContentContainer:first");
                        //                var dcInternal = dcClickedContainer.find(".dcInternalContents:first");

                        //                oInitDestroyEvents.DestroyPluginsEvents(dcInternal);
                        //                dContent.InternalContents = dcInternal.html();
                        //                oInitDestroyEvents.InitAll(dcInternal);

                        //                // alert(obj.data("dcInternalData").outerHTML());
                        //            }
                        //            else {
                        //                //Expect here HTML TEXT in DATA
                        //                dContent.InternalContents = obj.data("dcInternalData");

                        //                //console.log("Internal Contents of "+ dContent.Label + "  are:" + dContent.InternalContents);
                        //                // alert(obj.data("dcInternalData").outerHTML());
                        //            }

                        //            variation.ListOfDynamicContents.push(dContent);
                        //        });

                        //        if (options.OnDynamicControlSave != null) {
                        //            options.OnDynamicControlSave(variation);

                        //            alert("Successfully Saved");
                        //        }

                        //        //args.DynamicVariation = variation;
                        //        //PopulateContent(args);


                        //        _LoadDynamicBlocks(args);



                        //    }
                        //});



                        // var PopulateRulesWindow = function (args)
                        // {
                        //     //myElement.find(".dcRulesDialog").html("adnan");
                        // }


                        
                        //if (dcContents.is(':empty')) {

                        
                        //}               
                        ///////////

                        args.predefinedControl.Html.find(".dcContents").on("click", "li", (function (event) { //&&

                            event.stopPropagation();
                            
                            //saving content in previous selected content.
                            //if(args.clickedLi != null) {
                            //    args.DynamicContent = args.clickedLi.data("content");
                            //    args.DynamicContent.internalContents = dcInternalContents.html();
                            //}

                            //Show window for rules:
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
                                    args.DynamicContent.InternalContents = previuosActivate.data("dcInternalData");

                                    options.OnDynamicContentSwap(args);
                                }
                            }
                            

                            


                            //Set this element data
                            if (args.clickedLi.data("dcInternalData") != null) {

                                var internalData = $(args.clickedLi.data("dcInternalData"));
                                oInitDestroyEvents.InitAll(internalData);
                                dcInternal.html(internalData);
                            }
                            else {
                                dcInternal.empty();
                            }
                            //////////////

                            args.clickedLi.siblings().removeClass("active");
                            args.clickedLi.addClass("active");



                            

                            //if (args.clickedLi.data("content") != null) {
                            //    args.IsUpdate = true;
                            //    args.DynamicContent = args.clickedLi.data("content");

                            //    PopulateRulesWindow(args);
                            //}

                            //if (args.DynamicContent.Label != "Default") {
                            //    OpenRulesWindow(args);
                            //}

                        }));



                        

                        //var RePopulateContentNames = function (args) {
                        //    var dcContents = args.predefinedControl.Html.find(".dcContents li");
                        //    dcContents.each(function (i, o) {
                        //        var content = $(o).data("content");
                        //        if (content != null) {

                        //            $(o).find("span:first").html(content.Label);

                        //        }
                        //    });
                        //}

                  


                        var dcContentNameWindow = args.predefinedControl.Html.find(".dcContentName");
                        dcContentNameWindow.find(".btnCancelContent").click(function (event) {
                            event.stopPropagation();
                            dcContentNameWindow.hide();
                        });
                        dcContentNameWindow.find(".btnSaveContent").click(function () {


                            

                            var content = new DynamicContents();
                            content.Label = dcContentNameWindow.find(".txtContentName").val();                        
                            content.DynamicVariationID = args.DynamicVariation.DynamicVariationID;

                            


                            args.DynamicContent = new DynamicContents();
                            args.DynamicContent = content;

                            if (options.OnSaveDynamicContent != null) {
                                //alert(args.DynamicVariation.DynamicVariationID);
                                
                                options.OnSaveDynamicContent(args);
                                args.DynamicContent.DynamicContentID = "c123";
                            }
                            

                            var dcContents = args.predefinedControl.Html.find(".dcContents");
                            var newLi = $(myElement.find(".dcLI").html());
                            newLi.find("span:first").html(args.DynamicContent.Label);
                            newLi.data("content", args.DynamicContent);

                            OnFilterClick(newLi);
                            OnEditContentName(newLi);
                            OnDeleteContent(newLi);

                            dcContents.prepend(newLi);

                            dcContentNameWindow.hide();
                            dcContentNameWindow.find(".txtContentName").val("");

                        });

                        args.predefinedControl.Html.find(".addDynamicRule").click(function () {
                            
                            dcContentNameWindow.toggle();

                            //Get window for rules:  
                            //args.IsUpdate = false;
                            //dcRuleLabel.val("");
                            //dcRulesContainer.html("");

                            //OpenRulesWindow(args);

                        });

                    }
                }
                
          
               myElement.find("input#searchDC").keyup(function (e) {
                    if(e.which == 13){
                        console.log("enter pressed");
                        _searchDynamicBlocks();
                    }
                    
                });
                
                var _searchDynamicBlocks = function (args) {


                    var ulDynamicBlocks = myElement.find(".ulDynamicBlocks");
                        ulDynamicBlocks.empty();
                    var dynamicBlocksFromService = dynamicBlocksGlobal;
                    var textForSearch = myElement.find("input#searchDC").val();
                    var counter = 0;
                    if(textForSearch != null && textForSearch != "") {



                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(dynamicBlocksFromService, function (i, obj) {

                            //Assigning unique ID here:
                            //obj[0].ID = "buildingBlock" + count;
                            //console.log("DC Label:" + obj[0].label);
                            var label = obj[0].label;
                            if(label.startsWith(textForSearch)) {
                                counter++;
                                var block = $("<li class='draggableControl ui-draggable droppedDynamicBlock' data-type='dynamicContentContainer' data-isnew='false' data-id='" + obj[0]["dynamicNumber.encode"] + "' data-keyword='" + obj[0].keyword + "'>" +
                                                  "<i class='icon dyblck'></i> " +
                                                  "<a href='#'> <span class='font_75 bbName'>" + obj[0].label + "</span></a>" +
                                                "<div class='imageicons' > " +
                                                  "<i class='imgicons edit action' data-actiontype='dcedit'  data-index='"+ i +"' data-id='" + obj[0]["dynamicNumber.encode"] + "'></i> " +
                                                  "<i class='imgicons delete right action' data-actiontype='dcdel'  data-index='"+ i +"' data-id='" + obj[0]["dynamicNumber.encode"] + "'></i> " +
                                                  " </div>" +
                                               //actionButtons.html() +
                                             "</li>");

                                //var block = $("<li class='draggableControl droppedDynamicBlock' data-type='dynamicContentContainer' data-isnew='false' data-id='" + obj[0]["dynamicNumber.encode"] + "'>" +
                                //              "<i class='icon dyblck'></i>" +
                                //              "<span class='font_75'>" + obj[0].label + "</span>" +
                                //              "</li>");

                                //Initialize with default draggable:

                                // block.find(".imgicons.edit").click(function () {
                                //     var parentLi = $(this).closest(".draggableControl");
                                //     var editBox = parentLi.find(".editBox");
                                //     var bbName = parentLi.find(".bbName");
                                //     editBox.find(".txtBlockName").val(bbName.text());

                                //     editBox.show();

                                //     var closeBtn = editBox.find(".closebtn");
                                //     closeBtn.click(function () {
                                //         editBox.hide();
                                //     });

                                //     var saveBtn = editBox.find(".btnSave");
                                //     saveBtn.click(function () {
                                //         var txtBlockName = editBox.find(".txtBlockName");

                                //         var args = new Object();
                                //         args.DCName = txtBlockName.val();
                                //         args.DCID = parentLi.data("id");

                                //         //Call overridden Method here: will use when exposing properties to developer
                                //         if (options.OnEditDynamicVariation != null) {
                                //             options.OnEditDynamicVariation(args);

                                //             parentLi.find(".bbName").text(args.DCName);
                                //             console.log("Saved successfully");
                                //         }
                                //     });

                                // });

                                // block.find(".imgicons.delete").click(function () {
                                //     var parentLi = $(this).closest(".draggableControl");

                                //     var delBox = parentLi.find(".delBox");
                                //     delBox.show();

                                //     var btnDelete = delBox.find(".btnDelete");
                                //     btnDelete.click(function () {

                                //         var args = new Object();
                                //         args.DCID = parentLi.data("id");

                                //         //Call overridden Method here: will use when exposing properties to developer
                                //         if (options.OnDeleteDynamicVariation != null) {
                                //             options.OnDeleteDynamicVariation(args);

                                //             parentLi.remove();
                                //             console.log("Deleted Successfully");
                                //         }


                                //     });

                                //     var closeBtn = delBox.find(".closebtn");
                                //     closeBtn.click(function () {
                                //         delBox.hide();
                                //     });

                                // });

                                //Initialize with default draggable:
                                InitializeMainDraggableControls(block);

                                //listOfDynamicBlocksHtml.append(block);

                                ulDynamicBlocks.append(block);

                                //block.find(".imageicons").draggable({ disabled: true });
                                //InitializeMainDraggableControls(block);
                                //ulDynamicBlocks.append(block);

                            }

                        });
        
                        myElement.find("#DCResultDiv").html(counter + " records Found");
                        myElement.find("#DCResultDiv").show();
                        //console.log(listOfDynamicBlocksHtml);
                        // var ulDynamicBlocks = myElement.find(".dynamicBlockDroppable .ulDynamicBlocks");
                        // ulDynamicBlocks.empty();
                        // ulDynamicBlocks.append(listOfDynamicBlocksHtml);

                        //dynamicBlocksGlobal = dynamicBlocksFromService;

                    
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

                        var listOfDynamicBlocksHtml = $();
                        var dynamicBlocksFromService = args.dynamicBlocks;
                        var ulDynamicBlocks = myElement.find(".ulDynamicBlocks");
                        ulDynamicBlocks.empty();






                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(dynamicBlocksFromService, function (i, obj) {

                            //Assigning unique ID here:
                            //obj[0].ID = "buildingBlock" + count;
                            //console.log("DC Label:" + obj[0].label);


                            var block = $("<li class='draggableControl ui-draggable droppedDynamicBlock' data-type='dynamicContentContainer' data-isnew='false' data-id='" + obj[0]["dynamicNumber.encode"] + "' data-keyword='" + obj[0].keyword + "'>" +
                                              "<i class='icon dyblck'></i> " +
                                              "<a href='#'> <span class='font_75 bbName'>" + obj[0].label + "</span></a>" +
                                                "<div class='imageicons' > " +
                                                  "<i class='imgicons edit action' data-actiontype='dcedit'  data-index='"+ i +"' data-id='" + obj[0]["dynamicNumber.encode"] + "'></i> " +
                                                  "<i class='imgicons delete right action' data-actiontype='dcdel'  data-index='"+ i +"' data-id='" + obj[0]["dynamicNumber.encode"] + "'></i> " +
                                                  " </div>" +
                                               //actionButtons.html() +
                                             "</li>");

                            //var block = $("<li class='draggableControl droppedDynamicBlock' data-type='dynamicContentContainer' data-isnew='false' data-id='" + obj[0]["dynamicNumber.encode"] + "'>" +
                            //              "<i class='icon dyblck'></i>" +
                            //              "<span class='font_75'>" + obj[0].label + "</span>" +
                            //              "</li>");

                            //Initialize with default draggable:

                            // block.find(".imgicons.edit").click(function () {
                            //     var parentLi = $(this).closest(".draggableControl");
                            //     var editBox = parentLi.find(".editBox");
                            //     var bbName = parentLi.find(".bbName");
                            //     editBox.find(".txtBlockName").val(bbName.text());

                            //     editBox.show();

                            //     var closeBtn = editBox.find(".closebtn");
                            //     closeBtn.click(function () {
                            //         editBox.hide();
                            //     });

                            //     var saveBtn = editBox.find(".btnSave");
                            //     saveBtn.click(function () {
                            //         var txtBlockName = editBox.find(".txtBlockName");

                            //         var args = new Object();
                            //         args.DCName = txtBlockName.val();
                            //         args.DCID = parentLi.data("id");

                            //         //Call overridden Method here: will use when exposing properties to developer
                            //         if (options.OnEditDynamicVariation != null) {
                            //             options.OnEditDynamicVariation(args);

                            //             parentLi.find(".bbName").text(args.DCName);
                            //             console.log("Saved successfully");
                            //         }
                            //     });

                            // });

                            // block.find(".imgicons.delete").click(function () {
                            //     var parentLi = $(this).closest(".draggableControl");

                            //     var delBox = parentLi.find(".delBox");
                            //     delBox.show();

                            //     var btnDelete = delBox.find(".btnDelete");
                            //     btnDelete.click(function () {

                            //         var args = new Object();
                            //         args.DCID = parentLi.data("id");

                            //         //Call overridden Method here: will use when exposing properties to developer
                            //         if (options.OnDeleteDynamicVariation != null) {
                            //             options.OnDeleteDynamicVariation(args);

                            //             parentLi.remove();
                            //             console.log("Deleted Successfully");
                            //         }


                            //     });

                            //     var closeBtn = delBox.find(".closebtn");
                            //     closeBtn.click(function () {
                            //         delBox.hide();
                            //     });

                            // });

                            //Initialize with default draggable:
                            InitializeMainDraggableControls(block);

                            //listOfDynamicBlocksHtml.append(block);

                            ulDynamicBlocks.append(block);

                            //block.find(".imageicons").draggable({ disabled: true });
                            //InitializeMainDraggableControls(block);
                            //ulDynamicBlocks.append(block);



                        });
                        //console.log(listOfDynamicBlocksHtml);
                        // var ulDynamicBlocks = myElement.find(".dynamicBlockDroppable .ulDynamicBlocks");
                        // ulDynamicBlocks.empty();
                        // ulDynamicBlocks.append(listOfDynamicBlocksHtml);

                        dynamicBlocksGlobal = dynamicBlocksFromService;

                    }
                    else {
                        var ulDynamicBlocks = myElement.find(".ulDynamicBlocks");
                        ulDynamicBlocks.empty();
                        //Insert dummy data here
                        for (var i = 0; i < 20; i++) {

                            var block = $("<li class='draggableControl ui-draggable droppedDynamicBlock' data-isdummy='true' data-type='dynamicContentContainer' data-isnew='false' data-id='" + i + "'>" +
                                              "<i class='icon dyblck'></i> " +
                                              "<a href='#'> <span class='font_75 bbName'>" + i + "</span></a>" +
                                                actionButtons.html() +
                                              "</li>");

                            block.find(".imgicons.edit").click(function () {
                                var parentLi = $(this).closest(".draggableControl");
                                var editBox = parentLi.find(".editBox");
                                var bbName = parentLi.find(".bbName");
                                editBox.find(".txtBlockName").val(bbName.text());

                                editBox.show();

                                var closeBtn = editBox.find(".closebtn");
                                closeBtn.click(function () {
                                    editBox.hide();
                                });

                                var saveBtn = editBox.find(".btnSave");
                                saveBtn.click(function () {
                                    var txtBlockName = editBox.find(".txtBlockName");

                                    var args = new Object();
                                    args.DCName = txtBlockName.val();
                                    args.DCID = parentLi.data("id");

                                    //Call overridden Method here: will use when exposing properties to developer
                                    if (options.OnDynamicContentSave != null) {
                                        options.OnDynamicContentSave(args);

                                        parentLi.find(".bbName").text(args.BlockName);
                                        alert("Saved successfully");
                                    }
                                });

                            });

                            block.find(".imgicons.delete").click(function () {
                                var parentLi = $(this).closest(".draggableControl");

                                var delBox = parentLi.find(".delBox");
                                delBox.show();

                                var btnDelete = delBox.find(".btnDelete");
                                btnDelete.click(function () {

                                    var args = new Object();
                                    args.DCID = parentLi.data("id");

                                    //Call overridden Method here: will use when exposing properties to developer
                                    if (options.OnDynamicContentDelete != null) {
                                        options.OnDynamicContentDelete(args);

                                        parentLi.remove();
                                        alert("Deleted Successfully");
                                    }


                                });

                                var closeBtn = delBox.find(".closebtn");
                                closeBtn.click(function () {
                                    delBox.hide();
                                });

                            });

                            //Initialize with default draggable:
                            InitializeMainDraggableControls(block);

                            // listOfBuildingBlocksHtml.append(block);
                            ulDynamicBlocks.append(block);

                            block.find(".imageicons").draggable({ disabled: true });


                        }
                        ///////

                    }


                    myElement.find("#DCResultDiv").hide();
                }

                var _LoadDynamicBlockFields = function (args) {

                    if (args == null) {
                        args = new Object();
                    }

                    //Call overridden Method here: will use when exposing properties to developer
                    if (options.LoadDynamicBlockFields != null) {
                        options.LoadDynamicBlockFields(args);
                    }

                    //Getting building blocks from provided block:
                    if (args.dynamicBlockFields != null) {

                        var listOfDynamicBlockFieldssHtml = "";
                        var dynamicBlockFieldsFromService = args.dynamicBlockFields;

                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(dynamicBlockFieldsFromService, function (i, obj) {

                            //Assigning unique ID here:
                            //obj[0].ID = "buildingBlock" + count;
                            //console.log("DC Fiedl:" + obj);
                            if (obj[2] == "true") {
                                listOfDynamicBlockFieldssHtml += "<option value=\"" + obj[0] + "\">" + obj[1] + "</option>";
                            }
                            //Initialize with default draggable:
                            //InitializeMainDraggableControls(block);

                            //listOfDynamicBlockFieldssHtml.append(block);


                        });
                        //console.log(listOfDynamicBlocksHtml);
                        var ulDynamicBlockFields = myElement.find(".dcRuleFieldName");
                        ulDynamicBlockFields.empty();
                        ulDynamicBlockFields.append(listOfDynamicBlockFieldssHtml);

                        // dynamicBlocksGlobal = dynamicBlocksFromService;

                    }

                }

                var _LoadDynamicBlockRuleConditions = function (args) {

                    if (args == null) {
                        args = new Object();
                    }

                    //Call overridden Method here: will use when exposing properties to developer
                    if (options.LoadDynamicBlockRuleConditions != null) {
                        options.LoadDynamicBlockRuleConditions(args);
                    }

                    //Getting building blocks from provided block:
                    if (args.dynamicBlockRuleConditions != null) {

                        var listOfDynamicBlockRuleConditionsHtml = "";
                        var dynamicBlockRuleConditionsFromService = args.dynamicBlockRuleConditions;

                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(dynamicBlockRuleConditionsFromService, function (i, obj) {

                            //Assigning unique ID here:
                            //obj[0].ID = "buildingBlock" + count;
                            // console.log("DC Fiedl:" + obj[1]);

                            listOfDynamicBlockRuleConditionsHtml += "<option value=\"" + obj[0] + "\">" + obj[1] + "</option>";

                            //Initialize with default draggable:
                            //InitializeMainDraggableControls(block);

                            //listOfDynamicBlockFieldssHtml.append(block);


                        });
                        //console.log(listOfDynamicBlocksHtml);
                        var ulDynamicBlockRuleConditions = myElement.find(".dcRuleCondition");
                        ulDynamicBlockRuleConditions.empty();
                        ulDynamicBlockRuleConditions.append(listOfDynamicBlockRuleConditionsHtml);

                        // dynamicBlocksGlobal = dynamicBlocksFromService;

                    }

                }


                var _LoadDynamicBlockFormats = function (args) {

                    if (args == null) {
                        args = new Object();
                    }

                    //Call overridden Method here: will use when exposing properties to developer
                    if (options.LoadDynamicBlockFormats != null) {
                        options.LoadDynamicBlockFormats(args);
                    }

                    //Getting building blocks from provided block:
                    if (args.dynamicBlockFormats != null) {

                        var listOfDynamicBlockFormatsHtml = "";
                        var dynamicBlockFormatsFromService = args.dynamicBlockFormats;

                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(dynamicBlockFormatsFromService, function (i, obj) {

                            //Assigning unique ID here:
                            //obj[0].ID = "buildingBlock" + count;
                            //console.log("DC Fiedl:" + obj);

                            listOfDynamicBlockFormatsHtml += "<option value=\"" + obj[0] + "\">" + obj[1] + "</option>";

                            //Initialize with default draggable:
                            //InitializeMainDraggableControls(block);

                            //listOfDynamicBlockFieldssHtml.append(block);


                        });
                        //console.log(listOfDynamicBlocksHtml);
                        var ulDynamicBlockFormats = myElement.find(".dcRuleFormat");
                        ulDynamicBlockFormats.empty();
                        ulDynamicBlockFormats.append(listOfDynamicBlockFormatsHtml);

                        // dynamicBlocksGlobal = dynamicBlocksFromService;

                    }

                }

                function loadDynamicVariationFromServer(keyword) {
                    var dynamicVariation = new DynamicVariation();
                    var URL = "/pms/io/publish/getDynamicVariation/?" + options.sessionIDFromServer + "&type=get&keyword=" + keyword;
                    $.ajax({
                        url: URL,
                        //data: "{ name: 'test', html: args.buildingBlock.Name }",
                        type: "POST",
                        contentType: "application/json; charset=latin1",
                        dataType: "json",
                        cache: false,
                        async: false,
                        success: function (e) {
                            console.log("get Dynamic Variation success:" + e);
                            console.log(e);
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
                                    listOfDynamicContents.push(dynamicContents);
                                    var listOfDynamicRules = new Array();
                                    if (content.rules != null && content.rules != undefined) {
                                        var rules = content.rules[0];
                                        $.each(rules, function (i, obj) {
                                            var rule = obj[0];
                                            var dynamicRule = new DynamicRules();
                                            //dynamicRule.DynamicRuleID = rule["listNumber.encode"];
                                            dynamicRule.RuleFieldName = rule.fieldName;
                                            dynamicRule.RuleCondition = rule.rule;
                                            dynamicRule.RuleDefaultValue = rule.dateFormat;
                                            dynamicRule.RuleMatchValue = rule.matchValue;
                                            listOfDynamicRules.push(dynamicRule);
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



                //=============================================================================

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

                        var listOfPersonalizeTagsHtml = new Array();
                        //listOfPersonalizeTagsHtml.push("{ text: 'Personalize', value: '' }");
                        var personalizeTagsFromService = args.personalizeTags;

                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(personalizeTagsFromService, function (i, obj) {

                            //Assigning unique ID here:
                            //obj[0].ID = "buildingBlock" + count;
                            //console.log("DC Fiedl:" + obj);
                            var entry = {
                                text: $('<div/>').html(obj[1]).text(),
                                value: obj[0]
                            }
                            if (obj[2] == "B") {
                                listOfPersonalizeTagsHtml.push(entry);
                            }
                            //Initialize with default draggable:
                            //InitializeMainDraggableControls(block);

                            //listOfDynamicBlockFieldssHtml.append(block);


                        });
                        //console.log(listOfDynamicBlocksHtml);
                        // var ulPersonalizeTags = myElement.find(".dcRuleFormat");
                        // ulPersonalizeTags.empty();
                        // ulPersonalizeTags.append(listOfPersonalizeTagsHtml);
                        personalizedTagsGlobal = listOfPersonalizeTagsHtml;
                        // dynamicBlocksGlobal = dynamicBlocksFromService;
                        console.log(personalizedTagsGlobal);
                    }

                }


                //Muhammad Adnan --------------------- Code Preview ---------------------------//

                function InitializePreviewControls() {
                    var lnkPreviewCode = myElement.find(".MenuCallPreview");
                    var divPreviewCode = myElement.find(".divPreviewCode");
                    var divHtmlCode = myElement.find(".divHtmlCode");
                    var previeCodeTabs = divPreviewCode.find("#previeCodeTabs");



                    previeCodeTabs.tabs();



                    lnkPreviewCode.click(function () {
                        console.log("Its in preveiw code");

                        //var templateHTML = mainContentHtmlGrand.html();
                        var mainHTMLELE = myElement.find(".mainContentHtml");
                        var constructedHTML = $(mainHTMLELE.outerHTML());
                        console.log("HTML going for cleanup:"+ constructedHTML.outerHTML());
                        var cleanedupHTML = CleanCode(constructedHTML).html();
                        console.log("HTML after cleanup:"+ cleanedupHTML);
                        var outputter = $("<div></div>");
                        outputter.wrapInner(cleanedupHTML);
                        
                        var outputHTML = "<!-- MEE_DOCUMENT -->" + outputter.outerHTML();
                        console.log("OutputHTML:"+ outputHTML);



                        var divHtmlPreview = previeCodeTabs.find(".divHtmlPreview");
                        // var mainTableClone = myElement.find(".mainTable").clone();

                        // oInitDestroyEvents.DestroyPluginsEvents(mainTableClone);
                        // var cleanCode = CleanCode(mainTableClone.outerHTML());

                        divHtmlPreview.html(outputHTML);
                        divHtmlCode.val(outputHTML);

                        divPreviewCode.dialog({
                            width: 990,
                            height: 500,
                            modal: true,
                            buttons: [
                                 {
                                     text: "Close",
                                     click: function () {
                                         $(this).dialog('destroy');

                                     }
                                 }
                            ]
                        }).dialog("open");
                    });


                };



                function reConstructCode(html) {

                    console.log("HTML in reConstructCode:\n"+ html);
                    var oHtml = $(html);

                    oHtml.find(".MEE_DROPPABLE").addClass("myDroppable ui-draggable ui-droppable").removeClass("MEE_DROPPABLE").css("visibility", "hidden");
                    oHtml.find(".MEE_ELEMENT").addClass("csHaveData ui-draggable ui-droppable").removeClass("MEE_ELEMENT");
                    oHtml.find(".MEE_CONTAINER").addClass("container").removeClass("MEE_CONTAINER");
                    // oHtml.find(".MEE_DOCUMENT_CONTENTS").addClass("mainContentHtmlGrand").removeClass("MEE_DOCUMENT_CONTENTS");
                    // oHtml.find(".MEE_CONTENTS").addClass("mainContentHtml sortable").removeClass("MEE_CONTENTS");
                    
                    // oHtml.find(".MEE_IMAGECONTENT").addClass("myImage").removeClass("MEE_IMAGECONTENT");
                    // // oHtml.find(".MEE_TEXTCONTENT").addClass("mainContentHtml sortable").removeClass("MEE_CONTENTS");
                    // oHtml.find(".MEE_IMAGE").addClass("imageHandlingClass resizable clickEvent ui-resizable").removeClass("MEE_IMAGE");
                    // oHtml.find(".MEE_TEXT").addClass("textcontent").removeClass("MEE_TEXT");
                                                    

                    console.log(oHtml.length);


                    // if(oHtml.hasClass("MEE_DROPPABLE")) {
                    //     oHtml.addClass("myDroppable ui-draggable ui-droppable").removeClass("MEE_DROPPABLE").css("visibility", "hidden");;
                    // }
                    // else {
                    //     oHtml.find(".MEE_DROPPABLE").addClass("myDroppable ui-draggable ui-droppable").removeClass("MEE_DROPPABLE").css("visibility", "hidden");;;
                    // }
                    
                    var RevertCommonLi = function (element) {

                        //Remove Empty Element
                        // if (element.isEmpty()) {
                        //     element.remove();
                        //     return;
                        // }
                        //console.log("li method called...")
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


                        //Remove Class
                        // newElement.removeClass();
                        element.replaceWith(newElement);
                    }

                    var RevertCommonUl = function (element) {

                        //Remove Empty Element
                        // if (element.isEmpty()) {
                        //     element.remove();
                        //     return;
                        // }

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


                        //Remove Class
                        // newElement.removeClass();
                        element.replaceWith(newElement);
                    }

                    // oHtml[1].each(function (i, e) {
                    //     try {
                    //         var obj = $(e);
                    //         console.log(obj.outerHtml);
                            
                    //         console.log("Droppabel:" + obj.hasClass("MEE_DROPPABLE"));
                    //         console.log("Node Name:"+ obj[0].nodeName);
                    //         if(obj.hasClass("MEE_DROPPABLE")) {
                    //             // console.log("droppable found on elem" + obj.nodeName);
                    //             // obj.addClass("myDroppable ui-draggable ui-droppable").removeClass("MEE_DROPPABLE").css("visibility", "hidden");
                    //             // RevertCommonLi(obj); 
                    //             // console.log(obj.html());
                    //             obj.replaceWith($("<li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li>"));
                    //         }
                    //         if(obj.hasClass("MEE_ELEMENT")) {
                    //             // console.log("droppable found on elem" + obj.nodeName);
                    //             obj.addClass("csHaveData ui-draggable ui-droppable").removeClass("MEE_ELEMENT");
                    //             RevertCommonLi($(obj));
                    //         } 


                    //         if(obj[0].nodeName == "DIV") {
                    //             // console.log("droppable found on elem" + obj.nodeName);
                    //             // obj.addClass("csHaveData ui-draggable ui-droppable").removeClass("MEE_ELEMENT");
                    //             var elem = $(obj);
                    //             var html = elem.html();
                    //             var newHtml = "<li class='csHaveData ui-draggable ui-droppable'>" + html + "</li></ul>";
                    //             elem.html(newHtml);
                    //         }
                    //     }
                    //     catch(ex) {
                    //         console.log("Got Exception:" + ex);
                    //     }

                    // });


                    
                    
                    oHtml.find(".MEE_ITEM").each(function (i, e) {    
                        var elem = $(e);
                        console.log("MEE_ITEM FOUND>>>");
                        if(elem.find("img").length) {
                            console.log("Image found::");
                            console.log("ALign Value:" +elem.attr("align"));
                            var alignVal = elem.attr("align");
                            if(alignVal == undefined) {
                                alignVal = "left";
                            }
                            var imageElem = elem.find("img");
                            elem.addClass("drapableImageContainer").removeClass("MEE_ITEM");
                            imageElem.addClass("imageHandlingClass  resizable clickEvent");
                            var imgHeight = imageElem.inlineStyle("height");
                            console.log("Image height:"+ imgHeight);
                            var imgWidth = imageElem.inlineStyle("width");
                            console.log("Image height:"+ imgWidth);
                            imageElem.css("height", "100%");
                            imageElem.css("width", "100%");

                            if(imgHeight == "") {
                                imgHeight = "200px";
                            }
                            if(imgWidth == "") {
                                imgWidth = "200px";
                            }
                            //var html = elem.html();
                            console.log("Image Parent is:" + imageElem.parent().get( 0 ).tagName);
                            var imgOutHtml = "";
                            if(imageElem.parent().get( 0 ).tagName == 'a' || imageElem.parent().get( 0 ).tagName == 'A') {
                                console.log("Link applied on image");
                                imgOutHtml = imageElem.parent().outerHTML();
                            
                            }
                            else {
                                console.log("No Link applied on image");
                                imgOutHtml = imageElem.outerHTML();
                            
                            }
                            var newHtml = "<div class='myImage' style='float:none;' align='"+ alignVal +"'><div class='resizableImage' style='height:"+imgHeight+";width:"+ imgWidth +"'>" + imgOutHtml + "</div></div>";
                            elem.html(newHtml);

                        }
                        else {
                            elem.removeClass("MEE_ITEM")
                            var html = elem.html();
                            console.log("HTML IN MEE_ITEM:" +html);
                            var newHtml = "<div class='textcontent'>" + html + "</div>";
                            elem.html(newHtml);
                        }

                    });
                    
                    oHtml.find(".container > tbody > tr > td").each(function (index, element) {
                        var elem = $(element);
                        var html = elem.html();
                        var newHtml = "<div class='sortable' style='list-style: none;'><div class='csHaveData ui-draggable ui-droppable'>" + html + "</div></div>";
                        elem.html(newHtml);

                    });


                    oHtml.find(".sortable").not(".container").each(function () { RevertCommonUl($(this)); });
                    oHtml.find(".csHaveData").each(function () { RevertCommonLi($(this)); });
                    oHtml.find(".myDroppable").each(function () { RevertCommonLi($(this)); });
                    //oHtml.find("div .sortable").each(function () { RevertCommonUl($(this)); });
                    
                    oHtml.find("table").each(function () {

                        //oHtml.find(".container .sortable").each(function () { RevertCommonUl($(this)); });
                        oHtml.find(".container .sortable .csHaveData").each(function () { RevertCommonLi($(this)); });
                        oHtml.find(".container .sortable .myDroppable").each(function () { RevertCommonLi($(this)); });
                        
                    
                    });

                    var lengthHTML = oHtml.length;

                    if(lengthHTML > 1) {
                        for(var i=1; i< lengthHTML; i++) {
                            var obj = $(oHtml[i]);
                            
                            if(obj[0].nodeName == "DIV") {
                                
                                if(obj.children().length > 1) {
                                    var ht = obj.html();
                                    console.log("OUTER HTEML:"+ ht);
                                    
                                    oHtml = $(ht);
                                    
                                }
                                else {
                                    var ht = obj.html();
                                    console.log("OUTER HTEML:"+ obj.text());
                                    var newHtml = $("<li class='csHaveData ui-draggable ui-droppable'></li>");
                                    newHtml.append(obj);

                                    oHtml = $(newHtml);
                                    
                                }
                                
                            }

                            if(obj[0].nodeName == "TABLE") {
                                // console.log("droppable found on elem" + obj.nodeName);
                                // obj.addClass("csHaveData ui-draggable ui-droppable").removeClass("MEE_ELEMENT");
                                // var elem = $(obj);
                                // var html = elem.html();
                                // var newHtml = "<li class='csHaveData ui-draggable ui-droppable'>" + html + "</li></ul>";
                                // elem.replaceWith($(newHtml));
                                // RevertCommonLi($(oHtml[i]));

                                // $(oHtml[i]).wrap("<li class='csHaveData ui-draggable ui-droppable'></li>");
                                var ht = obj.html();
                                console.log("OUTER HTEML:"+ obj.text());
                                var newHtml = $("<li class='csHaveData ui-draggable ui-droppable'></li>");
                                newHtml.append(obj);
                                // var droppableLI = $("<li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li>");
                                // newHtml.prepend(droppableLI);
                                // newHtml.append(droppableLI);
                                // newHtml = droppableLI + newHtml + droppableLI
                                oHtml = $(newHtml);
                                // obj.contents(newHtml);
                            }
                        }

                    }


                    oHtml.find(".DYNAMIC_VARIATION").each(function (index, object) {
                        var variation = $(object);
                        // console.log("variationID-id:" + variation.attr("id"));
                        var variation_ID = variation.attr("id");
                        var keyword = variation.text();
                        console.log("Keyword Found is:"+ keyword);
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


                        // var dv = new DynamicVariation();
                        // dv.DynamicVariationID = "v123";
                        // dv.IsUpdate = false;
                        // dv.Label = "adnan123"

                        // var dc = new DynamicContents();
                        // dc.Label = "Default";
                        // dc.DynamicContentID = "c123";
                        // dc.IsDefault = true;
                        // dc.InternalContents = "<li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li><li class='ui-draggable ui-droppable csHaveData'><table class='container'><tbody><tr>default<td><ul class='sortable'></ul></td></tr></tbody></table></li><li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li>";
                        // dv.ListOfDynamicContents.push(dc);


                        // var dc = new DynamicContents();
                        // dc.Label = "dc 123";
                        // dc.DynamicContentID = "c123";
                        // dc.IsDefault = false;
                        // dc.InternalContents = "<li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li><li class='ui-draggable ui-droppable csHaveData'><table class='container'><tbody><tr><td><ul class='sortable'></ul></td></tr></tbody></table></li><li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li>";
                        // dv.ListOfDynamicContents.push(dc);

                        // args.DynamicVariation = dv;
                                                //alert("dummy");

                        // args.ID = variation_ID;  
                        args.ID = keyword;                                          
                        args.DynamicVariation = loadDynamicVariationFromServer(args.ID);


                        InitializeDynamicControl(args);

                        variation.replaceWith( args.predefinedControl.Html.clone(true, true));

                    });
                    
                    oHtml.find("li").each(function(i, e){

                        var li = $(e);
                        if(li.parent()[0].nodeName == "UL") {

                        }
                        else {
                            
                            var newParent = $("<ul class='sortable'/>");
                            li.parent().children().wrapAll(newParent);
                            
                            // var liParent = li.parent();
                            // console.log(liParent);
                            // var lis = li.children();
                            // console.log(lis);
                            // var parent = $("<ul class='sortable'/>");
                            // lis.wrapAll(parent);


                            // var siblings = li.siblings("li");
                            // if(siblings.parent().is("ul")) {

                            // }
                            // else {
                            //     //siblings.push(li);
                            //     var parent = $("<ul/>");
                            //     li.wrap(parent);
                            //     siblings.wrapAll(parent);
                            // }

                            // li.wrap("<ul></ul>");
                            console.log("li without ul exist");

                        }

                    });


                    console.log("Return HTML:"+ oHtml);

                    return oHtml;
                }




                function CleanCode (html) {

                    var oHtml = $(html);

                    console.log("HTML CAME IN CLEAN METHOD:"+ html);

                    //DestroyPluginsEvents(oHtml);
                    //oHtml.removeClass("mainTable");
                    oHtml.find(".myDroppable").removeClass("myDroppable ui-draggable ui-droppable").addClass("MEE_DROPPABLE").removeInlineStyle("visibility");
                    //oHtml.find("td").removeClass("mainContentHtmlGrand");
                    oHtml.find(".csHaveData").removeClass("csHaveData ui-draggable ui-droppable").addClass("MEE_ELEMENT");
                    oHtml.find(".mainContentHtmlGrand").removeClass("mainContentHtmlGrand").addClass("MEE_DOCUMENT_CONTENTS");
                    oHtml.find(".mainContentHtml").removeClass("mainContentHtml sortable").addClass("MEE_CONTENTS");
                    
                    oHtml.find(".textcontent").removeAttr("id");
                    oHtml.find(".textcontent").removeAttr("tabindex");
                    oHtml.find(".textcontent").removeAttr("contenteditable");
                    oHtml.find(".textcontent").removeAttr("spellcheck");
                    oHtml.find(".textcontent").removeClass("mce-content-body").addClass("MEE_ITEM").removeClass("textcontent");

                    oHtml.find("div.ui-resizable-e").remove();
                    oHtml.find("div.ui-resizable-s").remove();
                    oHtml.find("div.ui-resizable-se").remove();                       

                    oHtml.find(".space").removeInlineStyle("background");
                    
                    //oHtml.find(".drapableImageContainer").addClass("MEE_ITEM").removeClass("drapableImageContainer");
                    oHtml.find(".drapableImageContainer").each(function (index, object) {
                        var imageContainer = $(object);
                        var img = imageContainer.find("img");
                        var resizableImg = imageContainer.find(".resizableImage");
                        var myImage = imageContainer.find(".myImage");
                        console.log("While Cleaning Image myImage Align is:" + myImage.attr("align"));

                        console.log("ImageWidth:"+resizableImg.inlineStyle("width"));
                        console.log("ImageHeight:"+resizableImg.inlineStyle("height"));
                        
                        img.css("width", resizableImg.inlineStyle("width"));
                        img.css("height", resizableImg.inlineStyle("height"));
                        
                        img.removeClass("imageHandlingClass resizable clickEvent ui-resizable");
                        console.log("Image Parent is:" + img.parent().get( 0 ).tagName);

                        if(img.parent().get( 0 ).tagName == 'a' || img.parent().get( 0 ).tagName == 'A') {
                            console.log("Link applied on image");
                            imageContainer.html(img.parent().outerHTML());
                        
                        }
                        else {
                            console.log("No Link applied on image");
                            imageContainer.html(img.outerHTML());
                        
                        }

                        imageContainer.addClass("MEE_ITEM").removeClass("drapableImageContainer");
                        imageContainer.attr("align", myImage.attr("align") );

                    });


                    oHtml.find(".dynamicContentContainer").each(function (index, object) {
                        var variation = $(object);
                        console.log("Variation in clean code:");
                        console.log(variation);
                        console.log("variationID:" + variation.data("variationID"));
                        console.log("variationID-id:" + variation.attr("id"));
                        console.log("variation-Keyword:" + variation.attr("keyword"));

                        var keyword = variation.attr("keyword");
                        // variation.removeAttr("keyword");
                        // variation.removeAttr("keyword");
                        
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

                    oHtml.find("ul").each(function () { RemoveCommon($(this)); });
                    oHtml.find("li").each(function () { RemoveCommon($(this)); });

                    oHtml.find("table").not(".DYNAMIC_VARIATION").each(function () {

                        $(this).find("ul").each(function () { RemoveCommon($(this)); });
                        $(this).find("li").each(function () { RemoveCommon($(this)); });
                    });

                    oHtml.addClass("MEE_DOCUMENT");
                    oHtml.removeClass("mainTable");
                    

                    // oHtml.find("*").not(".DYNAMIC_VARIATION").removeAttr("class");

                    return oHtml;
                };

                InitializePreviewControls();
                //=============================================================================





                //â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘
                // [Muhammad.Adnan] --------------- DROPPING, DRAGGING, IMAGE CONTAINERS WORK (CORE FUNCTIONALITY) ------------ //            



                function InitializeAndDestroyEvents() {

                    //Destroy plugin events all event
                    this.DestroyPluginsEvents = function (element) {
                        try {
                            element.find("img.imageHandlingClass").resizable("destroy");
                        }
                        catch (e) {
                            console.log("Exception on destroying resizable on text");
                        }
                        //Tiny MCE DESTROY work here:
                        element.find("div.textcontent").each(function (index, element) {
                            var tinyEnableElement = $(element);

                            //Avoid memory leak here
                            if (tinyEnableElement.tinymce() != undefined) {
                                // tinyEnableElement.tinymce().destroy();

                                //Remove here all attributes that inserted by tinymce except class
                                var whitelist = ["class"];
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
                        //alert("im calling");

                        // element.find("img.imageHandlingClass").resizable({
                        element.find(".resizableImage").resizable({
                            //containment: 'parent'
                            // handles: "se,sw"
                        });

                        element.find("div.textcontent").each(function (index, element) {
                            if ($(element).tinymce() == undefined) {
                                tinymce.init({
                                    selector: "div.textcontent",
                                    inline: true,
                                    theme: "modern",
                                    skin_url: "editorcss/skin.css",
                                    plugins: 'textcolor table anchor autolink advlist',
                                    //script_url: '/scripts/libs/tinymce/tinymce.min.js',
                                    toolbar1: "LinksButton | mybutton123 | fontselect fontsizeselect | foreTextColor | backTextColor | bold italic underline | subscript superscript | alignleft aligncenter alignright | bullist numlist",

                                    // link_list: [
                                    // { title: 'My page 1', value: 'http://www.tinymce.com' },
                                    // { title: 'My page 2', value: 'http://www.moxiecode.com' }
                                    // ],
                                    setup: function (editor) {
                                        editor.on("mouseDown", function(e) {
                                            console.log(e);
                                            console.log('Editor was clicked: ' + e.target.nodeName);
                                            selectedLinkFromTinyMCE = e.target;
                                            //editor.selection.select(e.target);
                                        });
                                        editor.addButton('LinksButton', {
                                            type: 'button',
                                            title: 'Links',
                                            icon: 'link',
                                            onClick: function (e) {
                                                //editor.insertContent(this.value());
                                                handleTextLink();
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

                                                dialogForTextColor = true;
                                                myElement.find(".modalDialog").show();
                                                myElement.find("#ColorPickerpop").show();
                                                // $(".modalDialog").mousedown(function(e){
                                                //     e.stopPropagation();
                                                //     e.preventDefault();
                                                //     return false;
                                                // });

                                                // $("#ColorPickerpop").mousedown(function(e){
                                                //     e.stopPropagation();
                                                //     e.preventDefault();
                                                //     return false;
                                                // });

                                                var divFontColorPicker = myElement.find(".divFontColorPicker");
                                                var selectedFontColor = myElement.find(".selectedFontColor");
                                                divFontColorPicker.minicolors({
                                                    letterCase: 'uppercase',
                                                    change: function (hex, opacity) {
                                                        console.log(hex);
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
                                                console.log(ulMyColors);
                                                console.log(myFontColors);

                                                myFontColors.empty();
                                                myFontColors.append("<li style='background-color:#ffffff;' data-color='#ffffff'></li>");
                                                myFontColors.append("<li style='background-color:#000000;' data-color='#000000'></li>");

                                                myFontColors.append(ulMyColors.html());

                                                myFontColors.find("li").click(function () {
                                                    console.log("li color" + $(this).data("color"));
                                                    selectedFontColor.val($(this).data("color"));

                                                });

                                                //editor.focus();
                                                myElement.find('#fontDialogCancelButtonID').click(function () {
                                                    myElement.find("#ColorPickerpop").hide();
                                                    myElement.find(".modalDialog").hide();

                                                });
                                                myElement.find('#fontDialogOKButtonID').unbind('click').click(function () {
                                                    if(dialogForTextColor) {
                                                        var selectedText = tinyMCE.activeEditor.selection.getContent({ format: 'text' });
                                                        console.log(selectedText);
                                                        console.log("Element Name:" + tinyMCE.activeEditor.selection.getNode().nodeName);
                                                        var selectedFontColor = myElement.find(".selectedFontColor");
                                                        var selectedColor = selectedFontColor.val();
                                                        console.log("selected COlor:" + selectedColor);
                                                        if (selectedColor != "") {
                                                            var result = editor.execCommand('ForeColor', false, selectedColor);
                                                            console.log("Result of command:" + result);
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

                                                dialogForTextColor = false;
                                                myElement.find(".modalDialog").show();
                                                myElement.find("#ColorPickerpop").show();
                                                // $(".modalDialog").mousedown(function(e){
                                                //     e.stopPropagation();
                                                //     e.preventDefault();
                                                //     return false;
                                                // });

                                                // $(".mycolorFontPicker").mousedown(function(e){
                                                //     e.stopPropagation();
                                                //     e.preventDefault();
                                                //     return false;
                                                // });
                                                // $(".fontDialogButtons").mousedown(function(e){
                                                //     e.stopPropagation();
                                                //     e.preventDefault();
                                                //     return false;
                                                // });

                                                // $(".fontDialogTitle").mousedown(function(e){
                                                //     e.stopPropagation();
                                                //     e.preventDefault();
                                                //     return false;
                                                // });

                                                var divFontColorPicker = myElement.find(".divFontColorPicker");
                                                var selectedFontColor = myElement.find(".selectedFontColor");
                                                divFontColorPicker.minicolors({
                                                    letterCase: 'uppercase',
                                                    change: function (hex, opacity) {
                                                        console.log(hex);
                                                        //SetBackgroundColor(hex);
                                                        selectedFontColor.val(hex);
                                                        //txtColorCode.val(hex);
                                                    },
                                                    click: function() {
                                                        console.log("minicolors clicked...");
                                                    },
                                                    inline: true




                                                });

                                                //divFontColorPicker.css("z-index", "99999");

                                                if (myColorsFromServiceGlobal == "") {
                                                    _LoadMyColors();
                                                }
                                                var myFontColors = myElement.find(".myFontColors");
                                                console.log(ulMyColors);
                                                console.log(myFontColors);

                                                myFontColors.empty();
                                                myFontColors.append("<li style='background-color:#ffffff;' data-color='#ffffff'></li>");
                                                myFontColors.append("<li style='background-color:#000000;' data-color='#000000'></li>");

                                                
                                                myFontColors.append(ulMyColors.html());

                                                myFontColors.find("li").click(function () {
                                                    console.log("li color" + $(this).data("color"));
                                                    selectedFontColor.val($(this).data("color"));

                                                });

                                                //editor.focus();
                                                myElement.find('#fontDialogCancelButtonID').click(function () {
                                                    myElement.find("#ColorPickerpop").hide();
                                                    myElement.find(".modalDialog").hide();

                                                });
                                                myElement.find('#fontDialogOKButtonID').unbind('click').click(function () {
                                                    if(!dialogForTextColor) {                                                
                                                        var selectedText = tinyMCE.activeEditor.selection.getContent({ format: 'text' });
                                                        console.log(selectedText);
                                                        console.log("Element Name in BG:" + tinyMCE.activeEditor.selection.getNode().nodeName);
                                                        
                                                        var selectedFontColor = myElement.find(".selectedFontColor");
                                                        var selectedColor = selectedFontColor.val();
                                                        console.log("selected BG COlor:" + selectedColor);
                                                        if (selectedColor != "") {
                                                            var result = editor.execCommand('HiliteColor', false, selectedColor);
                                                            console.log("Result of command:" + result);
                                                        }

                                                        myElement.find(".modalDialog").hide();
                                                        myElement.find("#ColorPickerpop").hide();
                                                    }
                                                });
                                            }

                                        });

                                        editor.addButton('mybutton123', {
                                            type: 'listbox',
                                            title: 'Personalize',
                                            text: 'Personalize',
                                            icon: false,
                                            onselect: function (e) {
                                                editor.insertContent(this.value());
                                                this.value('');
                                            },
                                            values: personalizedTagsGlobal,
                                            /*[{ text: 'Personalize', value: '' },
                                            { text: 'Email', value: '@EMAIL@' },
                                            { text: 'First Name', value: '@First Name@' },
                                            { text: 'Full Name', value: '@Full Name@' },
                                            { text: 'Gender', value: '@Gender@' },
                                            { text: 'Last Name', value: '@Last Name@' },
                                            { text: 'Post Code', value: '@Post Code@' },
                                            { text: 'Sender Address', value: '@Sender Address@' }
                                            ],*/
                                            onPostRender: function () {
                                                // Select the second item by default
                                                // this.value('');
                                            }
                                        });
                                    },
                                    //theme_modern_buttons2: "exapmle Mybutton",
                                    toolbar_items_size: 'small',
                                    menubar: false,
                                    schema: "html5",
                                    inline: true,
                                    statusbar: false,
                                    object_resizing: false
                                });
                            }
                        });
                    }
                    ////
                    // ========= Sohaib Nadeem added for Link Gui insert and close button

                    myElement.find(".btn-save").unbind("click").click(function () {
                        //console.log(tiny_editor_selection.getNode());
                        if (myElement.find("#linkTrack").data("linkObject") == "image") {
                            attachLinkWithElement(myElement.find("#imageDataSavingObject").data("myWorkingObject"), areaToDisplay, selectedSocialLink);
                        } else if (myElement.find("#linkTrack").data("linkObject") == "text") {
                            var myTextLink = null;
                            var postBackupLink = null;
                            if (myElement.find("#rightPanelArea").data("tabClicked") == "hyperlink") {
                                var compaignKw = "";
                                if(areaToDisplay.find("input.linkName").val() != '') {
                                    compaignKw = "?campaignkw=" + areaToDisplay.find("input.linkName").val();
                                }
                                if ((areaToDisplay.find("input.linkHyperLinkURL").val()).startsWith("http://")){
                                    postBackupLink = areaToDisplay.find("input.linkHyperLinkURL").val() + compaignKw;
                                }
                                else
                                    postBackupLink = "http://" + areaToDisplay.find("input.linkHyperLinkURL").val() + compaignKw;

                                 myTextLink = "<a class='MEE_LINK' href='" + postBackupLink + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";

                            }
                            else if (myElement.find("#rightPanelArea").data("tabClicked") == "mailto") {
                                var myEmailId = areaToDisplay.find("input#emailLinkName").val();
                                var myEmailSubject = areaToDisplay.find("input#emailLinkSubject").val();
                                var query = "mailto" + ":" + myEmailId + "?subject=" + myEmailSubject;
                                postBackupLink = query;
                                myTextLink = "<a class='MEE_LINK' href='" + query + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                            }
                            else if (myElement.find("#rightPanelArea").data("tabClicked") == "frwdToFrnd") {
                                //myTextLink = "<a href='" + linkHtmlPage.find("#frwdToFrndArea").val() + "' style='text-decoration:underline;'>" + $("#currTinyMCE").data("myTinyMCE").getContent() + "</a>";
                                myTextLink = "<a class='MEE_LINK' href='" + fwdToFrndLink + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                                postBackupLink = fwdToFrndLink;
                            }
                            else if (myElement.find("#rightPanelArea").data("tabClicked") == "unsubscribe") {
                                //myTextLink = "<a href='" + linkHtmlPage.find("#unsubsArea").val() + "' style='text-decoration:underline;'>" + $("#currTinyMCE").data("myTinyMCE").getContent() + "</a>";
                                myTextLink = "<a class='MEE_LINK' href='" + unsubLink + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                                postBackupLink = unsubLink;
                            }
                            else if (myElement.find("#rightPanelArea").data("tabClicked") == "brwoserView") {
                                //myTextLink = "<a href='" + linkHtmlPage.find("#viewInBrowserArea").val() + "' style='text-decoration:underline;'>" + $("#currTinyMCE").data("myTinyMCE").getContent() + "</a>";
                                myTextLink = "<a class='MEE_LINK' href='" + cantReadLink + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                                postBackupLink = cantReadLink;
                            }
                            else if (myElement.find("#rightPanelArea").data("tabClicked") == "doubleOptLink") {

                            }
                            else if (myElement.find("#rightPanelArea").data("tabClicked") == "safeSender") {

                            }
                            else if (myElement.find("#rightPanelArea").data("tabClicked") == "newAnchor") {
                                //var newAnchortext = areaToDisplay.find("#newAnchortext").val();
                                if (areaToDisplay.find("#newAnchortext").val().startsWith("http://")) {
                                    myTextLink = "<a class='MEE_LINK' href='" + areaToDisplay.find("#newAnchortext").val() + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                                    postBackupLink = areaToDisplay.find("#newAnchortext").val();
                                }
                                else {
                                    myTextLink = "<a href='" + "http://" + areaToDisplay.find("#newAnchortext").val() + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                                    postBackupLink = "http://" + areaToDisplay.find("#newAnchortext").val();
                                }
                            }
                            else if (myElement.find("#rightPanelArea").data("tabClicked") == "social") {
                                //var newAnchortext = areaToDisplay.find("#newAnchortext").val();
                                
                                var linkValue = socialFacebookLink;
                                if(selectedSocialLink == 'facebook') {
                                    linkValue = socialFacebookLink;
                                }
                                else if(selectedSocialLink == 'twitter') {
                                    linkValue = socialTwitterLink;
                                }
                                else if(selectedSocialLink == 'linkedin') {
                                    linkValue = socialLinkedInLink;
                                }
                                else if(selectedSocialLink == 'pintrest') {
                                    linkValue = socialPintrestLink;
                                }
                                else if(selectedSocialLink == 'googleplus') {
                                    linkValue = socialGooglePlusLink;
                                }

                                 myTextLink = "<a class='MEE_LINK' href='" + linkValue + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                                 postBackupLink = linkValue;
                                
                                // if (areaToDisplay.find("#newAnchortext").val().startsWith("http://")) {
                                // myTextLink = "<a class='MEE_LINK' href='" + areaToDisplay.find("#newAnchortext").val() + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                                //     postBackupLink = areaToDisplay.find("#newAnchortext").val();
                                // }
                                // else {
                                // myTextLink = "<a href='" + "http://" + areaToDisplay.find("#newAnchortext").val() + "' style='text-decoration:underline;'>" + areaToDisplay.find("textarea.linkTextArea").val() + "</a>";
                                //     postBackupLink = "http://" + areaToDisplay.find("#newAnchortext").val();
                                // }
                            }

                            
                             if(selected_element_range != null) {
                                tiny_editor_selection.setRng(selected_element_range);
                                selected_element_range = null;
                             }
                            console.log("Save Link button pressed with nodename:" + tiny_editor_selection.getNode().nodeName);
                            console.log(tiny_editor_selection.getNode());
                            if (tiny_editor_selection.getNode().nodeName == "a" || tiny_editor_selection.getNode().nodeName == "A") {
                                console.log("Setting up Existing links URL");
                                tiny_editor_selection.getNode().setAttribute("href", postBackupLink);
                            }
                            else {
                                console.log("Setting New Link");
                                tiny_editor_selection.setContent(myTextLink);
                            }
                        }
                        myElement.find(".MEE_LINK").unbind("click").click( function(){
                            var element = $(this);
                            
                            tinyMCE.activeEditor.selection.select(selectedLinkFromTinyMCE);
                            // //console.log(tinyMCE.activeEditor.selection.getRng());
                            selected_element_range = tinyMCE.activeEditor.selection.getRng();
                            // handleTextLink();
                            showAlertButtons(element, selectedLinkFromTinyMCE.href);

                            // console.log(tiny_editor_selection.getNode());
                            

                        });
                        myElement.find("div.LinkGUIComplete").hide();
                        areaToDisplay.remove();
                        
                    });
                    myElement.find("a.btn-close").click(function () {
                        myElement.find("div.LinkGUIComplete").hide();
                        areaToDisplay.remove();
                    });
                    myElement.find("a.closeIconLinkGui").click(function () {
                        myElement.find("div.LinkGUIComplete").hide();
                        areaToDisplay.remove();
                    })
                    // =============== END Sohaib Nadeem ===========

                    this.ReInitializeDragDropHoverAll = function (oHtml) {


                        var InitializeMouseHover = function (oHtml) {

                            if (oHtml != null) {

                                var myobject = $(topHandlersHTML);

                                oHtml.on({
                                    mouseenter: function (e) {
                                        e.stopPropagation();
                                        myElement.find(".topHandlers").remove();
                                        
                                        //console.log("value of IsStyleActivated:" + IsStyleActivated);
                                        if (!IsStyleActivated) {

                                            // console.log("On Initializing mouse events..");

                                            //23 is height of topHandlers;
                                            // var topMeasure = $(this).offset().top - 23

                                            // var leftMeasure = $(this).offset().left;

                                            // myobject.css({
                                            //     top: topMeasure,
                                            //     left: leftMeasure + $(this).width() - 70,
                                            //     "border-top": "1px solid #2486dc",
                                            //     "border-left": "1px solid #2486dc",
                                            //     "border-right": "1px solid #2486dc"
                                            // });

                                            //Assign DELETE functionality here
                                            InitializeDeleteButtonOnElement(myobject);

                                            //Assign COPY functionality here
                                            InitializeCopyButtonOnElement(myobject);

                                            $(this).prepend(myobject);
                                            $(this).addClass("hover");
                                        }

                                    },
                                    mouseleave: function (e) {
                                        //e.stopPropagation();
                                        
                                        $(this).find(myobject).remove();
                                        $(this).removeClass("hover");
                                    }
                                });

                                //args.droppedElement.hover(function (event) {
                                //    //$(this).prepend(myobject);

                                //}, function (event) {

                                //    //$(this).find(myobject).remove();

                                //});

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

                                    $(element).droppable({
                                        tolerance: "pointer",
                                        greedy: true,
                                        drop: function (event, ui) {
                                            //alert("dropped");
                                            //Only dropable for IMAGE TYPE
                                            if (ui.draggable.hasClass("droppedImage")) {
                                                $(element).removeClass("imageContainer imagePlaceHolderAlone ui-droppable")

                                                var argsThis = {
                                                    droppedElement: $(this),
                                                    event: event,
                                                    ui: ui
                                                    //predefinedControl: args.predefinedControl
                                                };

                                                OnImageDropped(argsThis);
                                                oInitDestroyEvents.InitializeClickEvent(oHtml);
                                            }
                                        }
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

                            this.InitializeClickEvent(oHtml);
                            var activeTab = myElement.find("#tabs").tabs("option", "active");
                            //console.log('Active Tab:'+ activeTab);
                            // var tabName = activeTab.attr('aria-controls');


                            // if(activeTab == 0) {
                            //     InitializeElementsForStyle(false);
                            // }
                            // else {
                            //     InitializeElementsForStyle(true);
                            // }

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

                var CreateDroppable = function (e) {
                    var myDroppable = $("<li class='myDroppable'></li>");

                    //FOR CHROME SPECIALLY
                    DropableMouseEnterLeave(myDroppable);

                    return myDroppable;
                }

                function InitializeDeleteButtonOnElement(element) {

                    element.find(".myHandlerDelete").click(function () {
                        DeleteElement($(this));
                        makeCloneAndRegister();
                    });
                }

                function DeleteElement(element)
                {
                    var csHaveDataLength = myElement.find(".csHaveData").length;
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
                    
                }

                function InitializeCopyButtonOnElement(element) {

                    element.find(".myHandlerCopy").click(function () {

                        var myParent = $(this).closest(".csHaveData");
                        var droppable = CreateDroppableWithAllFunctions();
                        myParent.before(droppable);

                        //new InitializeAndDestroyEvents().DestroyPluginsEvents(myParent);                
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
                        //InitializeAllEvents(args);
                        // InitializeAllEvents(oControl.Html, false);
                        //ReInitializeDragDropHoverAll(args.droppedElement);


                        //InitializeImageDroppedEvent(oControl.Html);

                        //InitializeClickEvent(args);


                        droppable.before(args.droppedElement);

                        myElement.find(".topHandlers").remove();
                        RemoveDroppables(myElement);

                        OnNewElementDropped(args);

                        //myElement.find(".sortable").removeAttr("style");
                        //myElement.find(".myDroppable").removeInlineStyle("height");
                        makeCloneAndRegister();
                    });
                }

                function handleTextLink () {

                    myElement.find("#linkTrack").data("linkObject", "text");

                    myElement.find("div.LinkGUIComplete").show();
                    myElement.find("#rightPanelArea").data("tabClicked", "hyperlink");
                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").addClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    areaToDisplay = null;
                    if (myElement.find("div.addyHyperLinkDiv").length > 1) {
                        myElement.find("div.addyHyperLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addyHyperLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").empty();
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    areaToDisplay.show();
                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                    areaToDisplay.find("div.linkImagePreview").hide();
                    areaToDisplay.find("textarea.linkTextArea").val(tinyMCE.activeEditor.selection.getContent({ format: 'text' }));

                    if (tinyMCE.activeEditor.selection.getContent({ format: 'text' }) != "") {
                        console.log("handleTextLink: selected contents are text...");
                        // $("#currTinyMCE").data("myTinyMCE", tinyMCE.activeEditor.selection);
                        tiny_editor_selection = tinyMCE.activeEditor.selection;
                        tiny_editor = tinyMCE.activeEditor.selection.getContent({ format: 'text' });
                        areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                        if (tiny_editor_selection.getNode().nodeName == "a" || tiny_editor_selection.getNode().nodeName == "A") {
                            var prevLink = tiny_editor_selection.getNode().getAttribute("href");
                            if (prevLink != null)
                                if (prevLink.startsWith("http:")) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "hyperlink");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").addClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addyHyperLinkDiv").length > 1) {
                                        myElement.find("div.addyHyperLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addyHyperLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    var anchorLinkParts = prevLink.split("?");
                                    if(anchorLinkParts.length > 1) {
                                        var subjectLine = anchorLinkParts[1].split("=")[1];
                                        areaToDisplay.find("input.linkName").val(subjectLine);
                                    }
                                    areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                    
                                } else if (prevLink.startsWith("mailto")) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "mailto");
                                    myElement.find("li.emailLinkGUI").addClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addEmailLinkDiv").length > 1) {
                                        myElement.find("div.addEmailLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addEmailLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                    var mailtoLinkParts = prevLink.split("?");
                                    var emailID = mailtoLinkParts[0].split(":")[1];
                                    var subject = mailtoLinkParts[1].split("=")[1];
                                    areaToDisplay.find("input#emailLinkName").val(emailID);
                                    areaToDisplay.find("input#emailLinkSubject").val(subject);
                                } else if (prevLink.startsWith(fwdToFrndLink)) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "frwdToFrnd");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").addClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addFrwdToFrndLinkDiv").length > 1) {
                                        myElement.find("div.addFrwdToFrndLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addFrwdToFrndLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                
                                } else if (prevLink.startsWith(unsubLink)) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "unsubscribe");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").addClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addUnsubscribeLinkDiv").length > 1) {
                                        myElement.find("div.addUnsubscribeLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addUnsubscribeLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                
                                } else if (prevLink.startsWith(cantReadLink)) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "brwoserView");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").addClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addViewinBrowserLinkDiv").length > 1) {
                                        myElement.find("div.addViewinBrowserLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addViewinBrowserLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                
                                }
                                 else if (prevLink.startsWith(socialFacebookLink)) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "brwoserView");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").addClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                        myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                    initializeiCheck(areaToDisplay);

                                    myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                        alert("You clicked " + this.value);
                                        selectedSocialLink = this.value;
                                    });
                                    myElement.find('input[name="social"][value="facebook"]').iCheck("check");
                                
                                }
                                 else if (prevLink.startsWith(socialTwitterLink)) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "brwoserView");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").addClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                        myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                    initializeiCheck(areaToDisplay);

                                    myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                        alert("You clicked " + this.value);
                                        selectedSocialLink = this.value;
                                    });
                                    myElement.find('input[name="social"][value="twitter"]').iCheck("check");
                                
                                }
                                 else if (prevLink.startsWith(socialLinkedInLink)) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "brwoserView");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").addClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                        myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                    initializeiCheck(areaToDisplay);

                                    myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                        // alert("You clicked " + this.value);
                                        selectedSocialLink = this.value;
                                    });
                                    myElement.find('input[name="social"][value="linkedin"]').iCheck("check");
                                
                                }
                                 else if (prevLink.startsWith(socialPintrestLink)) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "brwoserView");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").addClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                        myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                    initializeiCheck(areaToDisplay);

                                    myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                        // alert("You clicked " + this.value);
                                        selectedSocialLink = this.value;
                                    });
                                    myElement.find('input[name="social"][value="pintrest"]').iCheck("check");
                                
                                }
                                 else if (prevLink.startsWith(socialGooglePlusLink)) {
                                    myElement.find("#rightPanelArea").data("tabClicked", "brwoserView");
                                    myElement.find("li.emailLinkGUI").removeClass("selected");
                                    myElement.find("li.homeLinkGUI").removeClass("selected");
                                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                    myElement.find("li.newSocialLinkGUI").addClass("selected");
                                    areaToDisplay = null;
                                    if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                        myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                    }
                                    areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                    myElement.find("#rightPanelArea").empty();
                                    myElement.find("#rightPanelArea").html(areaToDisplay);
                                    areaToDisplay.show();
                                    areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                                    areaToDisplay.find("div.linkImagePreview").hide();
                                    areaToDisplay.find("div.textAreaDivfortextLink").show();
                                    initializeiCheck(areaToDisplay);

                                    myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                        // alert("You clicked " + this.value);
                                        selectedSocialLink = this.value;
                                    });
                                    myElement.find('input[name="social"][value="googleplus"]').iCheck("check");
                                
                                }
                            //areaToDisplay.find("input.linkHyperLinkURL").val(previousLink);
                        }
                        else {
                            areaToDisplay.find("input.linkHyperLinkURL").val("");
                        }
                    } else {
                        console.log("1. SomeLink set here");
                        //$("#currTinyMCE").data("myTinyMCE", tinyMCE.activeEditor.selection);
                        tiny_editor_selection = tinyMCE.activeEditor.selection;
                        areaToDisplay.find("textarea.linkTextArea").val("Some Link");
                    }



                }

                function SetElementSize(args) {
                    //var args = {
                    //    droppedElement: $(this),
                    //    event: event,
                    //    ui: ui,
                    //    predefinedControl: Html, Type
                    //};

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



                //Elements Dropping
                function InitializeWithDropable(sender) {

                    //if (draggingUI != null) {
                    //    alert("")
                    //}

                    sender.droppable({
                        tolerance: "pointer",
                        greedy: true,
                        drop: function (event, ui) {

                            //makeCloneAndRegister();
                            //only allowed to drag controls from controls panel
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
                                if(ui.draggable.hasClass("csDynamicData")) {
                                    if($(this).parent().hasClass("dcInternalContents")) {
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

                                //INSERT DROPPABLE BEFORE AND AFTER            
                                // $(this).before(CreateDroppableWithAllFunctions());
                                // $(this).after(CreateDroppableWithAllFunctions());
                                ///////

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

                                if (typeOfDraggingControl == "buildingBlock") {
                                    //INSERT DROPPABLE BEFORE AND AFTER            
                                    $(this).before(CreateDroppableWithAllFunctions());
                                    $(this).after(CreateDroppableWithAllFunctions());
                                    ///////

                                    var controlID = ui.draggable.data("id");
                                    console.log(controlID);
                                    //need to apply each for this and then search on each [0]

                                    console.log(buildingBlocksGlobal);
                                    var bb = undefined;
                                    $.each(buildingBlocksGlobal, function (i, obj) {
                                        // var bBlock = Enumerable.From(buildingBlocksGlobal)
                                        //             .Where(function(o){
                                        //                             return (Enumerable.From(o[0])
                                        //                                 .Where("x => x.ID == '" + controlID + "'").Any());


                                        //             }).FirstOrDefault();
                                        console.log(obj[0]);

                                        // var bb = bBlock;
                                        //var abb = Enumerable.From(obj[0]).Where(function(x) { x.ID == '" + controlID + "'").FirstOrDefault();
                                        if (obj[0].ID == controlID) {
                                            bb = obj[0];
                                        }
                                        // console.log("abb:"+abb);
                                        // if(abb != undefined) {
                                        // bb = abb
                                        // }


                                    });
                                    console.log("BB:" + bb);
                                    if (bb != undefined) {
                                        //Assign here predefined control into OBJECT TYPE and pass it to OnNewElementDropped.
                                        var decodeHTML = $('<div/>').html(bb.html).text();
                                        oControl.Html = $(decodeHTML);
                                        oControl.Type = "buildingBlock";
                                        oControl.ID = bb.ID;

                                        console.log(oControl);

                                        args.predefinedControl = oControl;

                                        //-------------- Initialize Again all nested controls after dropped-------------------//:
                                        //ReInitializeDragDropHoverAll(oControl.Html);
                                        //Droppable:
                                        //oControl.Html.find(".myDroppable").each(function (i, o) {
                                        //    CreateDroppableWithAllFunctions(o);
                                        //});

                                        ////Moving Handlers - Mouse Hover
                                        //oControl.Html.find(".csHaveData").each(function (i, o) {
                                        //    InitializeElementWithDraggable($(o));
                                        //    InitializeMouseHover($(o));
                                        //});

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

                                    var controlID = ui.draggable.data("id");
                                    console.log(controlID);
                                    //need to apply each for this and then search on each [0]
                                    args.FormId = controlID;
                                    if(options.LoadFormContents != null) {
                                        options.LoadFormContents(args);
                                    }
                                    
                                    

                                    if (args.formContents != undefined) {
                                        //Assign here predefined control into OBJECT TYPE and pass it to OnNewElementDropped.
                                        // var fContents = args.formContents.replace("http://", "https://");
                                       var fContents = args.formContents;
                                        //alert(fContents);
                                        //var preview_iframe = $("<iframe class=\"email-iframe\" style=\"frameborder=\"0\" ></iframe>");
                                        //element.html(preview_iframe);

                                        // var decodeHTML = $('<div/>').html(fContents).text();
                                        // alert(decodeHTML);
                                        // alert($(decodeHTML).attr("src"));
                                        // var scriptSrc = $(decodeHTML).attr("src");
                                        var preview_iframe = $("<div style='overflow:hidden;height:auto;'><iframe id=\"email-iframe\" style=\"width:100%; height:100%\" src=\""+ fContents +"\" frameborder=\"0\" onload='setTimeout(resizeIFrame(this), 10000);'></iframe><br style='clear:both;' /></div>");
                                        //preview_iframe.html(decodeHTML);
                                        // preview_iframe.attr(
                                        //         "src", "data:text/html;charset=utf-8," + 
                                        //         "<html>" + decodeHTML +"</html>");

                                        
                                        // preview_iframe.contents().find('body').html(decodeHTML);

                                        oControl.Html = preview_iframe;
                                        //oControl.Html.addClass("container");
                                        oControl.Type = "formBlock";
                                        oControl.ID = args.FormId;

                                        console.log(oControl);

                                        args.predefinedControl = oControl;


                                        //-------------- Initialize Again all nested controls after dropped-------------------//:
                                        //ReInitializeDragDropHoverAll(oControl.Html);
                                        //Droppable:
                                        //oControl.Html.find(".myDroppable").each(function (i, o) {
                                        //    CreateDroppableWithAllFunctions(o);
                                        //});

                                        ////Moving Handlers - Mouse Hover
                                        //oControl.Html.find(".csHaveData").each(function (i, o) {
                                        //    InitializeElementWithDraggable($(o));
                                        //    InitializeMouseHover($(o));
                                        //});

                                        //////////////////////////////////////////////////////////////////////////////////////////

                                        //InitializeAllEvents(args.droppedElement);

                                        //Place predefined html into dropped area.
                                        args.droppedElement.html(oControl.Html);

                                        oInitDestroyEvents.InitAll(args.droppedElement);


                                    }
                                }
                                else if (typeOfDraggingControl == "dynamicContentContainer") { //^^
                                    
                                    if($(this).parent().hasClass("dcInternalContents")) {
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
                                                dc.InternalContents = "<li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li><li class='ui-draggable ui-droppable csHaveData'><table class='container'><tbody><tr>default<td><ul class='sortable'></ul></td></tr></tbody></table></li><li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li>";
                                                dv.ListOfDynamicContents.push(dc);


                                                var dc = new DynamicContents();
                                                dc.Label = "dc 123";
                                                dc.DynamicContentID = "c123";
                                                dc.IsDefault = false;
                                                dc.InternalContents = "<li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li><li class='ui-draggable ui-droppable csHaveData'><table class='container'><tbody><tr><td><ul class='sortable'></ul></td></tr></tbody></table></li><li class='myDroppable ui-draggable ui-droppable' style='visibility: hidden;'></li>";
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

                                            //options.OnExistingDynamicControlDropped(args);
                                        }
                                    }
                                    else {
                                       


                                        var dcContentVariationWindow = args.predefinedControl.Html.find(".dcVariationName");
                                        dcContentVariationWindow.show();
                                        dcContentVariationWindow.find(".btnCancelVariation").click(function (event) {
                                            event.stopPropagation();
                                            DeleteElement(args.droppedElement);
                                            dcContentNameWindow.hide();
                                        });
                                        dcContentVariationWindow.find(".btnSaveVariation").click(function () {

                                            var txtVariationName = dcContentVariationWindow.find(".txtPlaceHolder");

                                            if (txtVariationName.isEmpty())
                                            {
                                                alert("Please enter dynamic control name.");
                                                
                                            }
                                            else {
                                                                                                        
                                                //args.predefinedControl.Html.find(".dcName span:first").html(txtVariationName.val());
                                                                                                        
                                                args.DynamicVariation = new DynamicVariation();
                                                args.DynamicVariation.Label = txtVariationName.val();
                                                args.DynamicVariation.isUpdate = false;
                                                var dc = new DynamicContents();
                                                var listOfDC = new Array();
                                                listOfDC.push(dc);
                                                args.DynamicVariation.ListOfDynamicContents = listOfDC;
                                                

                                                //dummy
                                                if (false) {
                                                    
                                                        args.DynamicVariation = variation;
                                                        args.DynamicVariation.Label = "Im Test Variation";
                                                        args.DynamicVariation.DynamicVariationID = "v123";
                                                        
                                                        alert(args.DynamicVariation.DynamicVariationID);

                                                    
                                                }
                                                else {
                                                    if (options.OnDynamicControlSave != null) {

                                                        //alert(args.DynamicVariation.Label);
                                                        options.OnDynamicControlSave(args.DynamicVariation);
                                                        

                                                        //alert("Successfully Saved");
                                                    }


                                                    args.DynamicVariation = loadDynamicVariationFromServer(args.DynamicVariation.DynamicVariationCode);

                                                    args.DynamicVariation.Label = txtVariationName.val();

                                                    //args.DynamicVariation.DynamicVariationID = "999";

                                                    txtVariationName.data("variationID", args.DynamicVariation.DynamicVariationID);

                                                }
                                                
                                                _LoadDynamicBlocks();

                                                InitializeDynamicControl(args);

                                                oInitDestroyEvents.InitAll(args.droppedElement);

                                                
                                            }

                                            dcContentVariationWindow.hide();
                                            
                                        });




                                       /* myElement.find(".DCNameDialog").dialog({
                                            width: 500,
                                            modal: true,
                                            buttons: [
                                                {
                                                    text: "Cancel",
                                                    "class": 'btn-gray',
                                                    click: function () {
                                                        $(this).dialog('destroy');
                                                        DeleteElement(args.droppedElement);
                                                    }
                                                }, {

                                                    text: "Ok",
                                                    "class": 'btn-green',
                                                    click: function () {
                                                        
                                                        //args.ID = ui.draggable.data("id");

                                                        var txtVariationName = $(this).find(".txtPlaceHolder");

                                                        if (txtVariationName.isEmpty())
                                                        {
                                                            alert("Please enter dynamic control name.");
                                                            
                                                        }
                                                        else {
                                                                                                                    
                                                            //args.predefinedControl.Html.find(".dcName span:first").html(txtVariationName.val());
                                                                                                                    
                                                            args.DynamicVariation = new DynamicVariation();
                                                            args.DynamicVariation.Label = txtVariationName.val();
                                                            args.DynamicVariation.isUpdate = false;
                                                            var dc = new DynamicContents();
                                                            var listOfDC = new Array();
                                                            listOfDC.push(dc);
                                                            args.DynamicVariation.ListOfDynamicContents = listOfDC;
                                                            

                                                            //dummy
                                                            if (false) {
                                                                
                                                                    args.DynamicVariation = variation;
                                                                    args.DynamicVariation.Label = "Im Test Variation";
                                                                    args.DynamicVariation.DynamicVariationID = "v123";
                                                                    
                                                                    alert(args.DynamicVariation.DynamicVariationID);

                                                                
                                                            }
                                                            else {
                                                                if (options.OnDynamicControlSave != null) {

                                                                    //alert(args.DynamicVariation.Label);
                                                                    options.OnDynamicControlSave(args.DynamicVariation);
                                                                    

                                                                    alert("Successfully Saved");
                                                                }


                                                                args.DynamicVariation = loadDynamicVariationFromServer(args.DynamicVariation.DynamicVariationID);

                                                                args.DynamicVariation.Label = txtVariationName.val();

                                                                //args.DynamicVariation.DynamicVariationID = "999";

                                                                txtVariationName.data("variationID", args.DynamicVariation.DynamicVariationID);

                                                            }
                                                            
                                                            _LoadDynamicBlocks();

                                                            InitializeDynamicControl(args);

                                                            oInitDestroyEvents.InitAll(args.droppedElement);

                                                            
                                                        }


                                                        $(this).dialog('destroy');



                                                       


                                                    }
                                                }
                                            ]
                                        }).dialog("open");

                                        */

                                    }

                                    //Work on control - CONTROL ONLY
                                    //ReInitializeDragDropHoverAll(oControl.Html);


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
                                        //InitializeAllEvents(args.droppedElement);


                                        //Get Dyanmic Content Drop Area
                                        //if (args.droppedElement.parents(".dcInternalContents:first").length > 0) { //%%


                                        //    var dcInternal = args.droppedElement.parents(".dcInternalContents:first");
                                        //    var dcClickedContainer = args.droppedElement.parents(".dynamicContentContainer:first");

                                        //    if (dcClickedContainer.find("li.active").length > 0) {



                                        //        var cInternalData = dcInternal.clone(true);

                                        //        //oInitDestroyEvents.DestroyPluginsEvents(cInternalData);

                                        //        dcClickedContainer.find("li.active:first").data("dcInternalData", cInternalData);
                                        //    }

                                        //    //alert(dcInternal.find(".active:first").outerHTML());
                                        //    //dcInternal.find(".active:first").data("dcInternalData", dcInternal);




                                        //    //dcInternal.data("dcInternalData", dcInternal);

                                        //    //alert(dcInternal.find(".active:first").data("dcInternalData").outerHTML());
                                        //}


                                    }

                                }

                                //

                                //Controlling ELEMENT resizing here [Containers]
                                //Work on control - CONTROL ONLY
                                SetElementSize(args); //$$
                                ////////////////////////////////////


                                OnNewElementDropped(args);



                                //Work on control - CONTROL ONLY
                                //InitializeImageDroppedEvent(oControl.Html); //$$

                                //Work on control - CONTROL ONLY
                                //InitializeClickEvent(oControl.Html); //##


                                //Work on container - DROPPED ELEMENT
                                //InitializeMouseHover(args.droppedElement);



                                //undoManager.registerAction(mainContentHtmlGrand.html());

                                //var regObj = new RegisterObject(null, $(this), $(event.target).parent(), "Drop",$(this).index());

                            }

                        }
                    });

                    return sender;
                }

                //Elements DRAGGING - for swapping elements:
                function InitializeElementWithDraggable(object) {

                    object.draggable({
                        helper: function(event, ui) {
                                    return $(this).clone().css({width: $(this).width()});
                    
                                },
                        handle: ".myHandle",
                        cursor: "crosshair",
                        cursorAt: {
                            top: -7,
                            left: -7
                        },

                        //[M.Adnan] FOR DRAGGING
                        start: function (e, ui) {

                            //Show DRAG HERE Div here
                            myElement.find(".divBuildingBlockLoading").show();

                            ShowDroppables(myElement);

                            RemovePopups();

                            myElement.find(".content .sortable").each(function () {
                                //Exclude here dragging element (which is added by jqueryUI)
                                var firstLevelLiDroppable = $(this).find(">.myDroppable:not(.ui-draggable-dragging)");
                                
                            
                                InsertDroppableInEmpty($(this), firstLevelLiDroppable);

                                //Last element FULL height
                                SetLastElementHeight($(this));

                            });

                            //Hide imediate next and previos droppable containers
                            //e.target get original element.
                            $(e.target).next(".myDroppable").invisible();
                            $(e.target).prev(".myDroppable").invisible();
                        },

                        stop: function (e, ui) {

                            myElement.find(".divBuildingBlockLoading").hide();

                            //Remove all Droppables places here.
                            RemoveDroppables(myElement);
                        }
                    });

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
                            //droppableElement.css({
                            //    height: "100%"
                            //});

                            droppableElement.append("<div style='text-align:center; position:relative; top:40px; font-style:italic'> DROP HERE </div>");
                        }

                        sender.append(droppableElement);
                    }

                    //listOfElements.each(function (index) {
                    //    var element = $(this);
                    //    if (index == 0)
                    //    {
                    //        element.before(CreateDroppableWithAllFunctions());
                    //    }

                    //    element.after(CreateDroppableWithAllFunctions());
                    //});
                }

                var RemoveDroppables = function (container) {
                    container.find(".myDroppable:not(.csHaveData)").invisible();

                    //Remove height from destination's parent and source's parent (.sortable UL)
                    //Releted to last element dropped full height:
                    myElement.find(".sortable").removeAttr("style");
                    myElement.find(".myDroppable").removeInlineStyle("height");
                    makeCloneAndRegister();
                    ///////
                }

                var ShowDroppables = function (container) {
                    container.find(".myDroppable:not(.csHaveData)").visible();
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

                //---------------------  MAIN DRAGGABLE--------------------------//


                function InitializeMainDraggableControls(elementToApply) {
                    elementToApply.draggable({
                        helper: function(event, ui) {
                                    return $(this).clone().css({width: $(this).width()});
                    
                                },
                        cursor: "crosshair",
                        // containment: "parent",
                        // stack: ".myDroppable",
                        cursorAt: {
                            top: -7,
                            left: -7
                        },
                        // revert: "invalid" ,
                        // helper: function(){
                        //         $copy.css({"list-style":"none","width":$(this).outerWidth()});                        
                        //         return $copy;
                        //     },
                        appendTo: 'body',
                        //scroll: false,
                        //[M.Adnan] FOR DRAGGING
                        start: function (e, ui) {

                            //Disable for droppedImage here
                            if (ui.helper.data("type") === "droppedImage") {
                                return;
                            }
                            //////////////
                            // $this.wrapInner("<ul class='b-blocks'></ul>");
                            console.log(ui.helper);
                            ui.helper.wrap("<ul class='b-blocks'></ul>");
                            ShowDroppables(myElement);

                            RemovePopups();

                            var draggedControlType = ui.helper.data("type");

                            if (draggedControlType != "droppedImage") {

                                var totalLiLength = myElement.find(".content .sortable li").length;
                                myElement.find(".content .sortable").each(function () {

                                    var firstLevelLiDroppable = $(this).find(">.myDroppable:not(.ui-draggable-dragging)");

                                    if (totalLiLength == 0 && firstLevelLiDroppable.length == 0) {
                                        //For first time dropping element                                
                                        IsFirstDroppableElement = true;
                                    }

                                    InsertDroppableInEmpty($(this), firstLevelLiDroppable);

                                    SetLastElementHeight($(this));

                                });

                                //var mainContent = myElement.find(".mainContentHtml");
                                //alert(mainContent.height());

                                //var lastDropabble = myElement.find(".myDroppable:last-child");
                                //lastDropabble.css({
                                //    height: "100%"                                
                                //});

                            }

                            //$(".imageContainer")
                            //myElement.find(".imageContainer").InitializeWithDropable();
                        },

                        stop: function (e, ui) {

                            //INSERT Dropable along with dragged element:

                            //Remove all Droppables places here.
                            RemoveDroppables(myElement);

                        }
                    });
                }

                //---------------------  BUILDING BLOCKS--------------------------//
                var InitializeBuildingBlockDroppableArea = function () {

                    myElement.find(".buildingBlockDroppableOverlay").droppable({
                        tolerance: "pointer",
                        accept: ".csHaveData",
                        drop: function (event, ui) {

                            var args = {
                                droppedElement: $(this),
                                buildingBlock: null,
                                event: event,
                                ui: ui
                            };

                            var addBBDialog = myElement.find(".buildingBlock_name");
                            addBBDialog.dialog({
                                width: 270,
                                modal: true/*,
                                buttons: [
                                    {
                                        text: "Cancel",
                                        click: function () {
                                            $(this).dialog('destroy');

                                        }
                                    }, {
                                        text: "Ok",
                                        click: function () {
                                            //var txtPlaceHolder = $(this).find(".txtPlaceHolder");
                                            //args.buildingDialogBox = $(this);

                                            var buildingBlock = new Object();
                                            buildingBlock.Name = $(this).find(".txtPlaceHolder").val();

                                            oInitDestroyEvents.DestroyPluginsEvents(args.ui.draggable);

                                            buildingBlock.Html = args.ui.draggable.clone();

                                            oInitDestroyEvents.InitializePluginsEvents(args.ui.draggable);

                                            args.buildingBlock = buildingBlock;

                                            $(this).dialog('destroy');

                                            _OnDropElementOnBuildingBlock(args);



                                        }
                                    }
                                ]*/
                            }).dialog("open");
                            addBBDialog.find(".ui-dialog-buttonpane").hide();
                            addBBDialog.find(".addBBClose").click(function () {
                                console.log(addBBDialog);
                                addBBDialog.dialog("destroy");
                            });
                            addBBDialog.find(".addBBSave").click(function () {
                                console.log("Going to call AddBBSave");
                                var buildingBlock = new Object();
                                buildingBlock.Name = addBBDialog.find(".txtPlaceHolder").val();

                                oInitDestroyEvents.DestroyPluginsEvents(args.ui.draggable);

                                buildingBlock.Html = args.ui.draggable.clone();

                                oInitDestroyEvents.InitializePluginsEvents(args.ui.draggable);

                                args.buildingBlock = buildingBlock;

                                addBBDialog.dialog('destroy');

                                _OnDropElementOnBuildingBlock(args);

                            });
                        }
                    });
                }
                // ------------------------------------------------------------------------------------------------------------------//
                //â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘

                function InitializeBuildingBlockUpdatePopup() {
                    myElement.find('.buildingBlock_name_edit').dialog({

                        width: 500,
                        modal: true,
                        buttons: [
                            {
                                text: "Cancel",
                                click: function () {
                                    $(this).dialog('destroy');
                                    _LastSelectedBuildingBlock = null;
                                    UnSelectAllBlocks();
                                }
                            }, {
                                text: "Ok",
                                click: function () {
                                    var args = {
                                        buildingBlock: null
                                    };

                                    //var txtPlaceHolder = $(this).find(".txtPlaceHolder");
                                    //args.buildingDialogBox = $(this);

                                    var buildingBlock = new Object();
                                    buildingBlock.Name = $(this).find(".txtPlaceHolder").val();
                                    buildingBlock.Id = _LastSelectedBuildingBlock.data("id");
                                    args.buildingBlock = buildingBlock;
                                    $(this).dialog('destroy');
                                    _OnEditBuildingBlock(args);
                                    _LastSelectedBuildingBlock = null;
                                    UnSelectAllBlocks();
                                }
                            }
                        ]
                    });
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

                // ============ Sohaib Nadeem ===============
                // registering link gui events
                var linkObjectType = null;
                var imageObjectControl = null;
                var tiny_editor = null;
                var tiny_editor_selection = null;
                var selected_element_range = null;


                myElement.find("li.emailLinkGUI").click(function () {
                    myElement.find("#rightPanelArea").data("tabClicked", "mailto");
                    myElement.find("li.emailLinkGUI").addClass("selected");
                    myElement.find("li.homeLinkGUI").removeClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    
                    //document.getElementById("rightPanelArea").innerHTML = "<div><p>ADD A Link To an email address</p><br /><br /><br /><Label><p>Email Address</p></Label><br /><input type='text' class='textLinkGUI' id='emailAddText' maxlength='200' /><br /><br /><Label><p>Email Subject</p></Label><br /><input type='text' class='textLinkGUI' id='emailSubjText' maxlength='200' /></div>";
                    //$("div.overlay").show();
                    areaToDisplay = null;
                    if (myElement.find("div.addEmailLinkDiv").length > 1) {
                        myElement.find("div.addEmailLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addEmailLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    areaToDisplay.show();

                    linkObjectType = myElement.find("#linkTrack").data("linkObject");
                    imageObjectControl = myElement.find("#imageDataSavingObject").data("myWorkingObject");
                    //tiny_editor = $("#currTinyMCE").data("myTinyMCE");

                    enableTextOrImagePreview(linkObjectType, areaToDisplay, imageObjectControl, tiny_editor);

                    if (myElement.find("#linkTrack").data("linkObject") == "image") {
                        var elem = myElement.find("#imageDataSavingObject").data("myWorkingObject");
                        if ($(elem).parent().parent().parent().parent().find("img.imageHandlingClass").parent().is("a")) {
                            var previousLink = $(elem).parent().parent().parent().parent().find("a").data("link");
                            if (previousLink.search("mailto") == -1) {
                                //document.getElementById("rightPanelArea").innerHTML = "<p>ADD A HYPERLINK (STANDARD LINK URL)</p><form name='submit_url' action='#' method='post' enctype='multipart/form-data'><label><p>text</p></label><textarea class='text-areaLinkGUI'></textarea><label><p>link (url)</p></label><input type='text' class='textLinkGUI' id='linkHyperLinkURL' maxlength='200' /><label><p>LINK NAME (FOR TRACKING)</p></label><input type='text' class='textLinkGUI' maxlength='200' /><p><input type='checkbox' id='dont-track'  /><label><span>DO NOT TRACK THIS LINK</span></label></p><br /><br /><br /></form>";
                                //$("#linkHyperLinkURL").val(previousLink);
                                var index1 = previousLink.search("com");
                                var value = previousLink.substring(0, (index1 + 3));
                                myElement.find("#linkHyperLinkURL").val(value);
                                index1 = previousLink.search("campaignkw=");
                                value = previousLink.substring((index1 + 11), previousLink.length);
                                myElement.find("#linkName").val(value);
                            } else {
                                //document.getElementById("rightPanelArea").innerHTML = "<div><p>ADD A Link To an email address</p><br /><br /><br /><Label><p>Email Address</p></Label><br /><input type='text' class='textLinkGUI' id='emailAddText' maxlength='200' /><br /><br /><Label><p>Email Subject</p></Label><br /><input type='text' class='textLinkGUI' id='emailSubjText' maxlength='200' /></div>";
                                var index1 = previousLink.search("com");
                                var value = previousLink.substring(7, (index1 + 3));
                                myElement.find("#emailAddText").val(value);
                                index1 = previousLink.search("subject=");
                                value = previousLink.substring((index1 + 8), previousLink.length);
                                myElement.find("#emailSubjText").val(value);
                            }
                        }
                    }
                });
                myElement.find("li.homeLinkGUI").click(function () {

                    myElement.find("#rightPanelArea").data("tabClicked", "hyperlink");
                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").addClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    

                    areaToDisplay = null;
                    if (myElement.find("div.addyHyperLinkDiv").length > 1) {
                        myElement.find("div.addyHyperLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addyHyperLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    areaToDisplay.show();

                    linkObjectType = myElement.find("#linkTrack").data("linkObject");
                    imageObjectControl = myElement.find("#imageDataSavingObject").data("myWorkingObject");
                    //tiny_editor = $("#currTinyMCE").data("myTinyMCE");

                    enableTextOrImagePreview(linkObjectType, areaToDisplay, imageObjectControl, tiny_editor);

                    //areaToDisplay.find("textarea.linkTextArea").val($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }));
                    //$("#rightPanelArea").data("tabClicked", "hyperlink");
                    //document.getElementById("rightPanelArea").innerHTML = "<p>ADD A HYPERLINK (STANDARD LINK URL)</p><br /><br /><form name='submit_url' action='#' method='post' enctype='multipart/form-data'><label><p>text</p></label><textarea id='linkTextArea' class='text-areaLinkGUI'></textarea><br /><br /><br /><label><p>link (url)</p></label><input type='text' class='textLinkGUI' id='linkHyperLinkURL' maxlength='200' /><br /><br /><label><p>LINK NAME (FOR TRACKING)</p></label><input type='text' id='linkName' class='textLinkGUI' maxlength='200' /><p><input type='checkbox' id='dont-track'  /><label><span>DO NOT TRACK THIS LINK</span></label></p><br /><br /><br /></form>";
                    if (myElement.find("#linkTrack").data("linkObject") == "image") {
                        var elem = myElement.find("#imageDataSavingObject").data("myWorkingObject");
                        if ($(elem).parent().parent().parent().parent().find("img.imageHandlingClass").parent().is("a")) {
                            var previousLink = $(elem).parent().parent().parent().parent().find("a").data("link");
                            if (previousLink.search("mailto") == -1) {
                                //document.getElementById("rightPanelArea").innerHTML = "<p>ADD A HYPERLINK (STANDARD LINK URL)</p><form name='submit_url' action='#' method='post' enctype='multipart/form-data'><label><p>text</p></label><textarea class='text-areaLinkGUI'></textarea><label><p>link (url)</p></label><input type='text' class='textLinkGUI' id='linkHyperLinkURL' maxlength='200' /><label><p>LINK NAME (FOR TRACKING)</p></label><input type='text' class='textLinkGUI' maxlength='200' /><p><input type='checkbox' id='dont-track'  /><label><span>DO NOT TRACK THIS LINK</span></label></p><br /><br /><br /></form>";
                                //$("#linkHyperLinkURL").val(previousLink);
                                var index1 = previousLink.search("com");
                                var value = previousLink.substring(0, (index1 + 3));
                                myElement.find("#linkHyperLinkURL").val(value);
                                index1 = previousLink.search("campaignkw=");
                                value = previousLink.substring((index1 + 11), previousLink.length);
                                myElement.find("#linkName").val(value);
                            } else {
                                //document.getElementById("rightPanelArea").innerHTML = "<div><p>ADD A Link To an email address</p><br /><br /><br /><Label><p>Email Address</p></Label><br /><input type='text' class='textLinkGUI' id='emailAddText' maxlength='200' /><br /><br /><Label><p>Email Subject</p></Label><br /><input type='text' class='textLinkGUI' id='emailSubjText' maxlength='200' /></div>";
                                var index1 = previousLink.search("com");
                                var value = previousLink.substring(7, (index1 + 3));
                                myElement.find("#emailAddText").val(value);
                                index1 = previousLink.search("subject=");
                                value = previousLink.substring((index1 + 8), previousLink.length);
                                myElement.find("#emailSubjText").val(value);
                            }
                        }
                    }

                });
                myElement.find("li.forwardToFriendLinkGUI").click(function () {

                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").removeClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").addClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    

                    myElement.find("#rightPanelArea").data("tabClicked", "frwdToFrnd");
                    areaToDisplay = null;
                    if (myElement.find("div.addFrwdToFrndLinkDiv").length > 1) {
                        myElement.find("div.addFrwdToFrndLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addFrwdToFrndLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    if (myElement.find("#linkTrack").data("linkObject") != "image") {
                        areaToDisplay.show();
                        areaToDisplay.find("div.textAreaDivfortextLink").show();
                        // if ($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }).trim() != "") {
                        //     areaToDisplay.find("textarea.linkTextArea").val($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }));
                        // } else {
                        //     console.log("2. SomeLink set here");
                        
                        //     areaToDisplay.find("textarea.linkTextArea").val("Some Link");
                        // }
                        areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                    }
                    else {
                        areaToDisplay.hide();
                    }
                    //document.getElementById("rightPanelArea").innerHTML = "<p>ADD A Forward to a Friend</p><br /><br /><label><p>Text:</p></Label><textarea class='text-areaLinkGUI'>Forward This Email</textarea>";
                });

                myElement.find("li.unsubscribeLinkGUI").click(function () {

                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").removeClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").addClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    

                    myElement.find("#rightPanelArea").data("tabClicked", "unsubscribe");
                    areaToDisplay = null;
                    if (myElement.find("div.addUnsubscribeLinkDiv").length > 1) {
                        myElement.find("div.addUnsubscribeLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addUnsubscribeLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    if (myElement.find("#linkTrack").data("linkObject") != "image") {
                        areaToDisplay.show();
                        areaToDisplay.find("div.textAreaDivfortextLink").show();
                        // if ($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }).trim() != "") {
                        //     areaToDisplay.find("textarea.linkTextArea").val($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }));
                        // } else {
                        //     console.log("3. SomeLink set here");
                        
                        //     areaToDisplay.find("textarea.linkTextArea").val("Some Link");
                        // }
                        areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                    }
                    else {
                        areaToDisplay.hide();
                    }
                    //document.getElementById("rightPanelArea").innerHTML = "<p>ADD an Unsubscribe Link </p><br /><br /><label><p>Text:</p></Label><textarea class='text-areaLinkGUI'>Want to unsubscribe or change your details?</textarea>";
                });
                myElement.find("li.viewInBrowserLinkGUI").click(function () {

                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").removeClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").addClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    
                    myElement.find("#rightPanelArea").data("tabClicked", "brwoserView");
                    areaToDisplay = null;
                    if (myElement.find("div.addViewinBrowserLinkDiv").length > 1) {
                        myElement.find("div.addViewinBrowserLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addViewinBrowserLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    if (myElement.find("#linkTrack").data("linkObject") != "image") {
                        areaToDisplay.show();
                        areaToDisplay.find("div.textAreaDivfortextLink").show();
                        // if ($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }).trim() != "") {
                        //     areaToDisplay.find("textarea.linkTextArea").val($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }));
                        // } else {
                        //     console.log("4. SomeLink set here");
                        
                        //     areaToDisplay.find("textarea.linkTextArea").val("Some Link");
                        // }
                        areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                    }
                    else {
                        areaToDisplay.hide();
                    }
                    //document.getElementById("rightPanelArea").innerHTML = "<p>ADD A Can't read email Link</p><br /><br /><label><p>Text:</p></Label><textarea class='text-areaLinkGUI'>Can't read this email Properly?</textarea>";
                });
                myElement.find("li.doubleOptLinkGUI").click(function () {

                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").removeClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").addClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    
                    myElement.find("#rightPanelArea").data("tabClicked", "doubleOptLink");
                    areaToDisplay = null;
                    if (myElement.find("div.addDoubleOptLinkDiv").length > 1) {
                        myElement.find("div.addDoubleOptLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addDoubleOptLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    if (myElement.find("#linkTrack").data("linkObject") != "image") {
                        areaToDisplay.show();
                        areaToDisplay.find("div.textAreaDivfortextLink").show();
                        // if ($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }).trim() != "") {
                        //     areaToDisplay.find("textarea.linkTextArea").val($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }));
                        // } else {
                        //     console.log("5. SomeLink set here");
                        
                        //     areaToDisplay.find("textarea.linkTextArea").val("Some Link");
                        // }
                        areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                    }
                    else {
                        areaToDisplay.hide();
                    }
                    //document.getElementById("rightPanelArea").innerHTML = "<p>ADD A Double opt-in Link</p><br /><br /><label><p>Text:</p></Label><textarea class='text-areaLinkGUI'>To confirm your email address, click here</textarea>";
                });
                myElement.find("li.safeSenderLinkGUI").click(function () {

                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").removeClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").addClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    
                    myElement.find("#rightPanelArea").data("tabClicked", "safeSender");
                    areaToDisplay = null;
                    if (myElement.find("div.addSafeSenderLinkDiv").length > 1) {
                        myElement.find("div.addSafeSenderLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addSafeSenderLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    if (myElement.find("#linkTrack").data("linkObject") != "image") {
                        areaToDisplay.show();
                        areaToDisplay.find("div.textAreaDivfortextLink").show();
                        // if ($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }).trim() != "") {
                        //     areaToDisplay.find("textarea.linkTextArea").val($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }));
                        // } else {
                        //     console.log("6. SomeLink set here");
                        
                        //     areaToDisplay.find("textarea.linkTextArea").val("Some Link");
                        // }
                        areaToDisplay.find("textarea.linkTextArea").val(tiny_editor);
                    }
                    else {
                        areaToDisplay.hide();
                    }
                    //document.getElementById("rightPanelArea").innerHTML = "<p>ADD A Safe Sender Message to your Email</p><br /><br /><label><p>Text:</p></Label><textarea class='text-areaLinkGUI'>To guarantee delivery of this email please add $CAMPAIGNFROMEMAIL$ to your address book and safe senders list.</textarea>";
                });
                myElement.find("li.newAnchorLinkGUI").click(function () {

                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").removeClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").addClass("selected");
                    myElement.find("li.newSocialLinkGUI").removeClass("selected");
                    
                    myElement.find("#rightPanelArea").data("tabClicked", "newAnchor");
                    areaToDisplay = null;
                    if (myElement.find("div.addNewAnchorLinkDiv").length > 1) {
                        myElement.find("div.addNewAnchorLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addNewAnchorLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    areaToDisplay.show();
                    linkObjectType = myElement.find("#linkTrack").data("linkObject");
                    imageObjectControl = myElement.find("#imageDataSavingObject").data("myWorkingObject");
                    // tiny_editor = $("#currTinyMCE").data("myTinyMCE");

                    enableTextOrImagePreview(linkObjectType, areaToDisplay, imageObjectControl, tiny_editor);

                    //areaToDisplay.find("textarea.linkTextArea").val($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }));
                    //document.getElementById("rightPanelArea").innerHTML = "<p>New # Anchor</p><br /><br /><label><p>Text:</p></Label><textarea class='text-areaLinkGUI'></textarea><br/><br><label><p>Anchor Name:</p></Label><input type='text' class='textLinkGUI' maxlength='200'/>";
                });

                myElement.find("li.newSocialLinkGUI").click(function () {

                    myElement.find("li.emailLinkGUI").removeClass("selected");
                    myElement.find("li.homeLinkGUI").removeClass("selected");
                    myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                    myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                    myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                    myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                    myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                    myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                    myElement.find("li.newSocialLinkGUI").addClass("selected");
                    
                    myElement.find("#rightPanelArea").data("tabClicked", "social");
                    areaToDisplay = null;
                    if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                        myElement.find("div.addNewSocialLinkDiv")[1].remove();
                    }
                    areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                    myElement.find("#rightPanelArea").html(areaToDisplay);
                    areaToDisplay.show();
                    linkObjectType = myElement.find("#linkTrack").data("linkObject");
                    imageObjectControl = myElement.find("#imageDataSavingObject").data("myWorkingObject");
                    // tiny_editor = $("#currTinyMCE").data("myTinyMCE");

                    enableTextOrImagePreview(linkObjectType, areaToDisplay, imageObjectControl, tiny_editor);
                    //areaToDisplay.find('input[name="social"]').iCheck("destroy");
                    initializeiCheck(areaToDisplay);

                    myElement.find('input[name="social"]').on('ifClicked', function (event) {
                        // alert("You clicked " + this.value);
                        selectedSocialLink = this.value;
                    });
                    //areaToDisplay.find("textarea.linkTextArea").val($("#currTinyMCE").data("myTinyMCE").getContent({ format: 'text' }));
                    //document.getElementById("rightPanelArea").innerHTML = "<p>New # Anchor</p><br /><br /><label><p>Text:</p></Label><textarea class='text-areaLinkGUI'></textarea><br/><br><label><p>Anchor Name:</p></Label><input type='text' class='textLinkGUI' maxlength='200'/>";
                });

                // ============== End Sohaib Nadeem ==============/////


                // ============== Sohaib Nadeem =====================///
                // == Enabling ImageFunctionality before access 
                var imageFunctionality = {
                    leftAlign: function (myHtmlInstance, workingObject) {

                        console.log("Left Align Called with Object:");
                        console.log(workingObject);
                        $(workingObject).parent().parent().parent().parent().parent().find(".myImage").attr("align", "left");
                        var myObj = $(workingObject).parent().parent().parent().parent().parent();
                        var seHandle = myObj.find(".ui-resizable-se");
                        var swHandle = myObj.find(".ui-resizable-sw");
                        if (swHandle.is(":visible")) {
                            swHandle.hide();
                        }
                        seHandle.show();
                    },
                    centerAlign: function (myHtmlInstance, workingObject) {

                        console.log("Center Align Called with Object:");
                        console.log(workingObject);
                        $(workingObject).parent().parent().parent().parent().parent().find(".myImage").attr("align", "center");
                        $(workingObject).parent().parent().parent().parent().parent().find(".ui-resizable-se").show();
                        $(workingObject).parent().parent().parent().parent().parent().find(".ui-resizable-sw").show();
                        //makeCloneAndRegister();
                    },
                    rightAlign: function (myHtmlInstance, workingObject) {

                        console.log("Right Align Called with Object:");
                        console.log(workingObject);
                        $(workingObject).parent().parent().parent().parent().parent().find(".myImage").attr("align", "right");
                        $(workingObject).parent().parent().parent().parent().parent().find("img.imageHandlingClass").css("overflow", "hidden");
                        var seHandle = $(workingObject).parent().parent().parent().parent().parent().find(".ui-resizable-se");
                        var swHandle = $(workingObject).parent().parent().parent().parent().parent().find(".ui-resizable-sw");
                        if (seHandle.is(":visible")) {
                            seHandle.hide();
                        }
                        swHandle.show();
                    },
                    setImageTitle: function (workingObject) {
                        openImageTitleDialog(workingObject);
                    }
                }
                //========================= End Sohaib Nadeem =====================////

                var isElementClicked = false;
                var buildingBlocksGlobal = null;


                myElement.find(".ImageToolbarLeftAlignClass").click(function () {
                        //DestroyPluginsEvents($(mainContentHtmlGrand.html()));
                        //undoManager.registerAction(mainContentHtmlGrand.html());
                    console.log("Left ALign clicked..");
                    imageFunctionality.leftAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                    makeCloneAndRegister();
                    return false;
                });
                myElement.find(".ImageToolbarCenterAlignClass").click(function () {
                    
                    console.log("Center ALign clicked..");
                    imageFunctionality.centerAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                    makeCloneAndRegister();
                    return false;
                });
                myElement.find(".ImageToolbarRightAlignClass").click(function () {
                    console.log("Right ALign clicked..");
                    imageFunctionality.rightAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                    makeCloneAndRegister();
                    return false;
                });

                                myElement.find(".ImageToolbarLinkClass").click(function () {
                        //imageFunctionality.openLinkGUI(myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                        myElement.find("div.LinkGUIComplete").show();
                        myElement.find("#rightPanelArea").data("tabClicked", "hyperlink");
                        myElement.find("li.emailLinkGUI").removeClass("selected");
                        myElement.find("li.homeLinkGUI").addClass("selected");
                        myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                        myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                        myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                        myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                        myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                        myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                        myElement.find("li.newSocialLinkGUI").removeClass("selected");

                        var imageObject = $(myElement.find("#imageDataSavingObject").data("myWorkingObject"));


                        if (imageObject.parent().parent().parent().parent().find("img.imageHandlingClass").parent().is("a")) {
                            var prevLink = imageObject.parent().parent().parent().parent().find("img.imageHandlingClass").parent().attr("href");
                            // ToDo : to load the previous attached link work to do required here
                            console.log("previous link on image:"+ prevLink);
                            if (prevLink  == socialFacebookLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);
                                
                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="facebook"]').iCheck("check");
                            }
                            else if (prevLink  == socialTwitterLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);
                                
                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="twitter"]').iCheck("check");
                            }
                            else if (prevLink  == socialLinkedInLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);
                                
                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="linkedin"]').iCheck("check");
                            }
                            else if (prevLink  == socialPintrestLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);
                                
                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="pintrest"]').iCheck("check");
                            }
                            else if (prevLink  == socialGooglePlusLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);

                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="googleplus"]').iCheck("check");
                            }
                            else if (prevLink.search("mailto") == -1) {
                                myElement.find("#rightPanelArea").data("tabClicked", "hyperlink");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").addClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addyHyperLinkDiv").length > 1) {
                                    myElement.find("div.addyHyperLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addyHyperLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                var anchorLinkParts = prevLink.split("?");
                                var subjectLine = anchorLinkParts[1].split("=")[1];
                                areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                areaToDisplay.find("input.linkName").val(subjectLine);
                            } else {
                                myElement.find("#rightPanelArea").data("tabClicked", "mailto");
                                myElement.find("li.emailLinkGUI").addClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addEmailLinkDiv").length > 1) {
                                    myElement.find("div.addEmailLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addEmailLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                var mailtoLinkParts = prevLink.split("?");
                                var emailID = mailtoLinkParts[0].split(":")[1];
                                var subject = mailtoLinkParts[1].split("=")[1];
                                areaToDisplay.find("input#emailLinkName").val(emailID);
                                areaToDisplay.find("input#emailLinkSubject").val(subject);
                            }
                        } else {
                            areaToDisplay = null;
                            if (myElement.find("div.addyHyperLinkDiv").length > 1) {
                                myElement.find("div.addyHyperLinkDiv")[1].remove();
                            }
                            areaToDisplay = myElement.find("div.addyHyperLinkDiv").clone(false);
                            myElement.find("#rightPanelArea").empty();
                            myElement.find("#rightPanelArea").html(areaToDisplay);
                            areaToDisplay.show();
                        }
                        areaToDisplay.find("div.linkImagePreview").show();
                        areaToDisplay.find("div.textAreaDivfortextLink").hide();
                        areaToDisplay.find("img").attr("src", imageObject.parent().parent().parent().find("img.imageHandlingClass").attr("src"));
                        makeCloneAndRegister();
                        return false;
                    });
                    myElement.find(".ImageToolbarTitleSetClass").click(function () {

                        imageFunctionality.setImageTitle(myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                        makeCloneAndRegister();
                        return false;
                    });


                //[Muhammad.Adnan] - Exposed Functions by CORE Code.
                function OnNewElementDropped(args) {
                    //var args = {
                    //    droppedElement: $(this),
                    //    event: event,
                    //    ui: ui,
                    //    predefinedControl: (Html, Type)
                    //};



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
                        //DestroyPluginsEvents($(mainContentHtmlGrand.html()));
                        //undoManager.registerAction(mainContentHtmlGrand.html());
                        console.log("Left ALign clicked..");
                        imageFunctionality.leftAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                        makeCloneAndRegister();
                        return false;
                    });
                    myElement.find(".ImageToolbarCenterAlignClass").click(function () {
                        
                        console.log("Center ALign clicked..");
                        imageFunctionality.centerAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                        makeCloneAndRegister();
                        return false;
                    });
                    myElement.find(".ImageToolbarRightAlignClass").click(function () {
                        console.log("Right ALign clicked..");
                        imageFunctionality.rightAlign(myElement, myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                        makeCloneAndRegister();
                        return false;
                    });
                    myElement.find(".ImageToolbarLinkClass").click(function () {
                        //imageFunctionality.openLinkGUI(myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                        myElement.find("div.LinkGUIComplete").show();
                        myElement.find("#rightPanelArea").data("tabClicked", "hyperlink");
                        myElement.find("li.emailLinkGUI").removeClass("selected");
                        myElement.find("li.homeLinkGUI").addClass("selected");
                        myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                        myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                        myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                        myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                        myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                        myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                        myElement.find("li.newSocialLinkGUI").removeClass("selected");

                        var imageObject = $(myElement.find("#imageDataSavingObject").data("myWorkingObject"));


                        if (imageObject.parent().parent().parent().parent().find("img.imageHandlingClass").parent().is("a")) {
                            var prevLink = imageObject.parent().parent().parent().parent().find("img.imageHandlingClass").parent().attr("href");
                            // ToDo : to load the previous attached link work to do required here
                            console.log("previous link on image:"+ prevLink);
                            if (prevLink  == socialFacebookLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);
                                
                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="facebook"]').iCheck("check");
                            }
                            else if (prevLink  == socialTwitterLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);
                                
                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="twitter"]').iCheck("check");
                            }
                            else if (prevLink  == socialLinkedInLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);
                                
                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="linkedin"]').iCheck("check");
                            }
                            else if (prevLink  == socialPintrestLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);
                                
                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="pintrest"]').iCheck("check");
                            }
                            else if (prevLink  == socialGooglePlusLink) {
                                myElement.find("#rightPanelArea").data("tabClicked", "social");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").addClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addNewSocialLinkDiv").length > 1) {
                                    myElement.find("div.addNewSocialLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addNewSocialLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                // var anchorLinkParts = prevLink.split("?");
                                // var subjectLine = anchorLinkParts[1].split("=")[1];
                                // areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                // areaToDisplay.find("input.linkName").val(subjectLine);

                                initializeiCheck(areaToDisplay);

                                myElement.find('input[name="social"]').on('ifClicked', function (event) {
                                    // alert("You clicked " + this.value);
                                    selectedSocialLink = this.value;
                                });
                                myElement.find('input[name="social"][value="googleplus"]').iCheck("check");
                            }
                            else if (prevLink.search("mailto") == -1) {
                                myElement.find("#rightPanelArea").data("tabClicked", "hyperlink");
                                myElement.find("li.emailLinkGUI").removeClass("selected");
                                myElement.find("li.homeLinkGUI").addClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addyHyperLinkDiv").length > 1) {
                                    myElement.find("div.addyHyperLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addyHyperLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                var anchorLinkParts = prevLink.split("?");
                                var subjectLine = anchorLinkParts[1].split("=")[1];
                                areaToDisplay.find("input.linkHyperLinkURL").val(anchorLinkParts[0]);
                                areaToDisplay.find("input.linkName").val(subjectLine);
                            } else {
                                myElement.find("#rightPanelArea").data("tabClicked", "mailto");
                                myElement.find("li.emailLinkGUI").addClass("selected");
                                myElement.find("li.homeLinkGUI").removeClass("selected");
                                myElement.find("li.forwardToFriendLinkGUI").removeClass("selected");
                                myElement.find("li.unsubscribeLinkGUI").removeClass("selected");
                                myElement.find("li.viewInBrowserLinkGUI").removeClass("selected");
                                myElement.find("li.doubleOptLinkGUI").removeClass("selected");
                                myElement.find("li.safeSenderLinkGUI").removeClass("selected");
                                myElement.find("li.newAnchorLinkGUI").removeClass("selected");
                                myElement.find("li.newSocialLinkGUI").removeClass("selected");
                                areaToDisplay = null;
                                if (myElement.find("div.addEmailLinkDiv").length > 1) {
                                    myElement.find("div.addEmailLinkDiv")[1].remove();
                                }
                                areaToDisplay = myElement.find("div.addEmailLinkDiv").clone(false);
                                myElement.find("#rightPanelArea").empty();
                                myElement.find("#rightPanelArea").html(areaToDisplay);
                                areaToDisplay.show();

                                areaToDisplay.find("div.linkImagePreview").show();
                                areaToDisplay.find("div.textAreaDivfortextLink").hide();
                                var mailtoLinkParts = prevLink.split("?");
                                var emailID = mailtoLinkParts[0].split(":")[1];
                                var subject = mailtoLinkParts[1].split("=")[1];
                                areaToDisplay.find("input#emailLinkName").val(emailID);
                                areaToDisplay.find("input#emailLinkSubject").val(subject);
                            }
                        } else {
                            areaToDisplay = null;
                            if (myElement.find("div.addyHyperLinkDiv").length > 1) {
                                myElement.find("div.addyHyperLinkDiv")[1].remove();
                            }
                            areaToDisplay = myElement.find("div.addyHyperLinkDiv").clone(false);
                            myElement.find("#rightPanelArea").empty();
                            myElement.find("#rightPanelArea").html(areaToDisplay);
                            areaToDisplay.show();
                        }
                        areaToDisplay.find("div.linkImagePreview").show();
                        areaToDisplay.find("div.textAreaDivfortextLink").hide();
                        areaToDisplay.find("img").attr("src", imageObject.parent().parent().parent().find("img.imageHandlingClass").attr("src"));
                        makeCloneAndRegister();
                        return false;
                    });
                    myElement.find(".ImageToolbarTitleSetClass").click(function () {

                        imageFunctionality.setImageTitle(myElement.find("#imageDataSavingObject").data("myWorkingObject"));
                        makeCloneAndRegister();
                        return false;
                    });

                }

                var OnImageDropped = function (args) {

                    //var args = {
                    //    droppedElement: $(this),
                    //    event: event,
                    //    ui: ui,
                    //    predefinedControl: (Html, Type)
                    //};
                    //var htmlToPlace = "<div width='100%' ><div class='myHandle'><img src='images/move_handle.png' /></div><table width='100%'><tr><td width='100%'><div id='onlyImage' class='myImage'><img style='height:200px; width:200px;' class='imageHandlingClass resizable' src='"+ (args.droppedElement.find("img").attr("src")) +"' style='display:block;' /></div></td></tr></table></div>";
                    var htmlToPlace = $("<div class='myImage resizable' align='left' style='float:none;'><div class='resizableImage' style='height:200px; width:200px;'><img style='height:100%; width:100%;' class='imageHandlingClass  clickEvent' src='" + args.ui.draggable.find("img").attr("src") + "' style='display:block;' /></div></div>");

                    // htmlToPlace.find("img.imageHandlingClass").resizable({
                    htmlToPlace.find(".resizableImage").resizable({
                        //containment: 'parent'
                        // handles: "n, e, s, w, ne, se, sw, nw "
                    });

                    //$("#imageToolbar").data("objectType", args.predefinedControl.Type);

                    args.droppedElement.html(htmlToPlace);
                    makeCloneAndRegister();

                }

                var OnClickedOnElement = function (event) {

                    //var args = {
                    //    droppedElement: $(this),
                    //    event: event,
                    //    ui: ui,
                    //    predefinedControl: (Html, Type)
                    //};
                    //myElement.find("#imageToolbar").data("objectType", args.predefinedControl.Type);


                    myElement.find("#imageDataSavingObject").data("myWorkingObject", event.target);
                    myElement.find("#linkTrack").data("linkObject", "image");
                    myElement.find("#imageToolbar").addClass("imageToolbar-menu");
                    myElement.find("#imageToolbar").show();
                    myElement.find("#imageToolbar").css({ "margin-top": ($(event.target).parent().parent().offset().top), "margin-left": ($(event.target).parent().parent().offset().left) });


                }

                var _OnDropElementOnBuildingBlock = function (args) {
                    //var args = {
                    //    droppedElement: $(this)                
                    //    buildingBlock,
                    //    event: event,
                    //    ui: ui
                    //};              
                    // ===================== Sohaib ==========================
                    // Before making a building block uninitialize image resizable
                    //alert(args.buildingBlock.Html);
                    //args.buildingBlock.Html.find("img.imageHandlingClass").resizable("destroy");
                    //alert(args.buildingBlock.Html.html());
                    if (options.OnDropElementOnBuildingBlock != null) {
                        //Call overridden Method here: will use when exposing properties to developer
                        options.OnDropElementOnBuildingBlock(args);
                    }

                    //Load Building Blocks
                    _LoadBuildingBlocks(args);

                }

                var _OnEditBuildingBlock = function (args) {
                    if (options.OnEditBuildingBlock != null) {
                        //Call overridden Method here: will use when exposing properties to developer
                        options.OnEditBuildingBlock(args);
                    }

                    _LoadBuildingBlocks(args);
                }

                var _OnDeleteBuildingBlock = function (args) {
                    if (options.OnDeleteBuildingBlock != null) {
                        //Call overridden Method here: will use when exposing properties to developer
                        options.OnDeleteBuildingBlock(args);
                    }

                    _LoadBuildingBlocks(args);
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

                myElement.find("input#searchBB").keyup(function (e) {
                    if(e.which == 13){
                        console.log("enter pressed");
                        _searchBuildingBlocks();
                    }
                    
                });

                myElement.find("input#searchForm").keyup(function (e) {
                    if(e.which == 13){
                        console.log("enter pressed");
                        _searchFormBlocks();
                    }
                    
                });


                var _searchBuildingBlocks = function (args) {


                    
                    var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                    ulBuildingBlocks.empty();
                    var buildingBlocksFromService = buildingBlocksGlobal;
                    var textForSearch = myElement.find("input#searchBB").val();
                    var counter = 0;
                    if(textForSearch != null && textForSearch != "") {

                    //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(buildingBlocksFromService, function (i, obj) {

                            //Assigning unique ID here:
                            obj[0].ID = obj[0]["blockId.encode"];
                            var label = obj[0].name;
                            if(label.startsWith(textForSearch)) {
                                counter++;
                                var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' data-type='buildingBlock' data-id='" + obj[0]["blockId.encode"] + "'>" +
                                                 "<i class='icon myblck'></i> " +
                                                 "<a href='#'> <span class='font_75 bbName'>" + obj[0].name + "</span></a>" +
                                                "<div class='imageicons' > " +
                                                  "<i class='imgicons edit action' data-actiontype='bbedit'  data-index='"+ i +"' data-id='" + obj[0]["blockId.encode"] + "'></i> " +
                                                  "<i class='imgicons delete right action' data-actiontype='bbdel'  data-index='"+ i +"' data-id='" + obj[0]["blockId.encode"] + "'></i> " +
                                                  " </div>" +
                                               //actionButtons.html() +
                                             "</li>");

                                //var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' data-type='buildingBlock' data-id='" + obj[0]["blockId.encode"] + "'>" +
                                //              "<i class='icon myblck'></i> " +
                                //              "<span class='font_75'>" + obj[0].name + "</span>" +
                                //              "</li>");


                                // block.find(".imgicons.edit").click(function () {
                                //     var parentLi = $(this).closest(".draggableControl");
                                //     var editBox = parentLi.find(".editBox");
                                //     var bbName = parentLi.find(".bbName");
                                //     editBox.find(".txtBlockName").val(bbName.text());

                                //     editBox.show();

                                //     var closeBtn = editBox.find(".closebtn");
                                //     closeBtn.click(function () {
                                //         editBox.hide();
                                //     });

                                //     var saveBtn = editBox.find(".btnSave");
                                //     saveBtn.click(function () {
                                //         var txtBlockName = editBox.find(".txtBlockName");

                                //         var args = new Object();
                                //         args.BlockName = txtBlockName.val();
                                //         args.BlockID = parentLi.data("id");

                                //         //Call overridden Method here: will use when exposing properties to developer
                                //         // if (options.OnBuildingBlockSave != null) {
                                //         //     options.OnBuildingBlockSave(args);

                                //         //     parentLi.find(".bbName").text(args.BlockName);
                                //         //     alert("Saved successfully");
                                //         // }
                                //         if (options.OnEditBuildingBlock != null) {
                                //             options.OnEditBuildingBlock(args);

                                //             parentLi.find(".bbName").text(args.BlockName);
                                //             console.log("Saved successfully");
                                //         }
                                //     });

                                // });

                                // block.find(".imgicons.delete").click(function () {
                                //     var parentLi = $(this).closest(".draggableControl");

                                //     var delBox = parentLi.find(".delBox");
                                //     delBox.show();

                                //     var btnDelete = delBox.find(".btnDelete");
                                //     btnDelete.click(function () {

                                //         var args = new Object();
                                //         args.BlockID = parentLi.data("id");

                                //         //Call overridden Method here: will use when exposing properties to developer
                                //         if (options.OnDeleteBuildingBlock != null) {
                                //             options.OnDeleteBuildingBlock(args);

                                //             parentLi.remove();
                                //             console.log("Deleted Successfully");
                                //         }


                                //     });

                                //     var closeBtn = delBox.find(".closebtn");
                                //     closeBtn.click(function () {
                                //         delBox.hide();
                                //     });

                                // });

                                //Initialize with default draggable:
                                InitializeMainDraggableControls(block);

                                // listOfBuildingBlocksHtml.append(block);
                                ulBuildingBlocks.append(block);

                                block.find(".imageicons").draggable({ disabled: true });


                                //count++;
                            }                        
                        });
                        myElement.find("#BBResultDiv").html(counter + " records Found");
                        myElement.find("#BBResultDiv").show();

                    }
                    else {
                        _LoadBuildingBlocks();
                        myElement.find("#BBResultDiv").hide();
                    }
                        ///////
                }

                var showAlertButtons =function(obj, url){
                    var _ele  = obj; //element which is clicked
                    var left_minus = 15;      //static space to minus to show dialog on exact location
                    var ele_offset = _ele.offset();                
                    var ele_height =  _ele.height();
                    var top = ele_offset.top + ele_height +4;
                    var left = ele_offset.left-left_minus;  

                    var li = "<ul>";
                    li += "<li><a href='#' class='btn-green btnContentEditName'><i class='icon imgicons link linkOpen'></i></a></li>";
                    li += "<li><a href='http://www.gmail.com' class='btn-blue btnContentDelete'><i class='icon newwin' data-url='"+ url +"'></i></a></li>";
                    li += "</ul>";
                      
                    myElement.find(".alertButtons").html(li);
                    myElement.find(".alertButtons").css({"left":left+"px","top":top+"px"}).show();
                      console.log("left:"+left+"px, top:"+top+"px");
                  }
                 

                var showBox = function(obj, imageObj, type){
                      var _ele  = obj; //element which is clicked
                      var left_minus = 15;      //static space to minus to show dialog on exact location
                      var ele_offset = _ele.offset();                 
                      var ele_height =  _ele.height();
                      var top = ele_offset.top + ele_height +4;
                      var left = ele_offset.left-left_minus;           
                      
                      if(type == "info") {
                        var li = "<a class='closebtn'></a>";
                        li += "<h4>" + imageObj.fileName + "</h4>";
                        li += "<h5><em>Size: </em>" + imageObj.height + " x " + imageObj.width + "</h5>";
                        li += "<h5><em>Created on: </em>" + imageObj.updationDate + "</h5>";
                        myElement.find(".info-windowDiv").html(li);
                        myElement.find(".info-windowDiv").css({"left":left+"px","top":top+"px"}).show();
                      }
                      else if(type == "link") {
                        var li = "<a class='closebtn'></a>";
                        li += "<h4>Image URL</h4>";
                        li += "<input type='text' placeholder='Image URL' class='left tginput' style='width: 202px;' value='" + imageObj.originalURL + "'>";
                        myElement.find(".link-windowDiv").html(li);
                        myElement.find(".link-windowDiv").css({"left":left+"px","top":top+"px"}).show();
                      }
                      else if(type == "tag") {
                        var tagsArr = imageObj.tags.split(',');
                        var li = "<a class='closebtn /*closebtn-imgtag*/' data-id='" + imageObj["imageId.encode"] + "'></a>";
                        li += "<div class='tagscont'>";
                        li += "<ul>";
                        for (var i = 0; i < tagsArr.length; i++) {
                            if(tagsArr[i] != ""){
                                li += "<li><a class='tag' href='#.'><span>" + tagsArr[i] + "</span><i class='icon cross remove-tag'></i></a></li>";
                            }
                        }
                        li += "</ul></div>";
                        li += "<input type='text' placeholder='Add tag' class='left tginput' id='addTagsToImage'>";
                        li += "<a class='btn-green left addtag' data-id='" + imageObj["imageId.encode"] + "'><span>Add</span><i class='icon plus'></i></a>";
                        myElement.find(".tag-windowDiv").html(li);
                        myElement.find(".tag-windowDiv").css({"left":left+"px","top":top+"px"}).show();
                      }
                      else if(type == "delete") {
                        var li = "<a class='closebtn'></a>";
                        li += "<h5 style='padding-bottom: 10px;'>Do you want to delete this Image?</h5>";
                        li += "<a class='btn-red left confirm-del' data-id='" + imageObj["imageId.encode"] + "'><span>Delete</span><i class='icon delete'></i></a>";
                        myElement.find(".del-windowDiv").html(li);
                        myElement.find(".del-windowDiv").css({"left":left+"px","top":top+"px"}).show();
                      }
                      else if(type == "bbdel") {
                        var li = "<a class='closebtn'></a>";
                        li += "<h5 style='padding-bottom: 10px;'>Do you want to delete this Block?</h5>";
                        li += "<a class='btn-red left confirm-del btnDeleteBB' data-id='" + imageObj["blockId.encode"] + "'><span>Delete</span><i class='icon delete'></i></a>";
                        myElement.find(".BBDeleteDialog").html(li);
                        myElement.find(".BBDeleteDialog").css({"left":left+"px","top":top+"px"}).show();
                      }
                      else if(type == "bbedit") {
                        var li = "<a class='closebtn'></a>";
                        li += "<h5 style='padding-bottom: 10px;'>Edit Block Name</h5>";
                        li += "<input type='text' placeholder='Image URL' class='left tginput txtBlockName' style='width: 202px; margin-bottom: 10px; dis' value='"+ imageObj.name+"'>";
                        li += "<a class='btn-green left btnSaveBB'  data-id='" + imageObj["blockId.encode"] + "'>";
                        li += "<span>Save</span><i class='icon save'></i> ";
                        li += "</a> ";
                        

                        myElement.find(".BBEditDialog").html(li);
                        myElement.find(".BBEditDialog").css({"left":left+"px","top":top+"px"}).show();
                      }
                      else if(type == "dcdel") {
                        var li = "<a class='closebtn'></a>";
                        li += "<h5 style='padding-bottom: 10px;'>Do you want to delete this Block?</h5>";
                        li += "<a class='btn-red left confirm-del btnDeleteDC' data-id='" + imageObj["dynamicNumber.encode"] + "'><span>Delete</span><i class='icon delete'></i></a>";
                        myElement.find(".DCDeleteDialog").html(li);
                        myElement.find(".DCDeleteDialog").css({"left":left+"px","top":top+"px"}).show();
                      }
                      else if(type == "dcedit") {
                        var li = "<a class='closebtn'></a>";
                        li += "<h5 style='padding-bottom: 10px;'>Edit Dynamic Content Name</h5>";
                        li += "<input type='text' placeholder='Image URL' class='left tginput txtBlockName' style='width: 202px; margin-bottom: 10px; dis' value='"+ imageObj.label+"'>";
                        li += "<a class='btn-green left btnSaveDC'  data-id='" + imageObj["dynamicNumber.encode"] + "'>";
                        li += "<span>Save</span><i class='icon save'></i> ";
                        li += "</a> ";
                        

                        myElement.find(".DCEditDialog").html(li);
                        myElement.find(".DCEditDialog").css({"left":left+"px","top":top+"px"}).show();
                      }

                      
                      // console.log("left:"+left+"px, top:"+top+"px");
                      // this.dialog.css({"left":left+"px","top":top+"px"}).show();
                  
                  }


                

                var _LoadBuildingBlocks = function (args) {

                    if (args == null) {
                        args = new Object();
                    }

                    //Call overridden Method here: will use when exposing properties to developer
                    if (options.LoadBuildingBlocks != null) {
                        options.LoadBuildingBlocks(args);
                    }


                    var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                    ulBuildingBlocks.empty();





                    //Getting building blocks from provided block:
                    if (args.buildingBlocks != null) {

                        var count = 1;
                        // var listOfBuildingBlocksHtml = $();
                        var buildingBlocksFromService = args.buildingBlocks;
                        var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                        ulBuildingBlocks.empty();

                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(buildingBlocksFromService, function (i, obj) {

                            //Assigning unique ID here:
                            obj[0].ID = obj[0]["blockId.encode"];


                            var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' data-type='buildingBlock' data-id='" + obj[0]["blockId.encode"] + "'>" +
                                             "<i class='icon myblck'></i> " +
                                             "<a href='#'> <span class='font_75 bbName'>" + obj[0].name + "</span></a>" +
                                                "<div class='imageicons' > " +
                                                  "<i class='imgicons edit action' data-actiontype='bbedit'  data-index='"+ i +"' data-id='" + obj[0]["blockId.encode"] + "'></i> " +
                                                  "<i class='imgicons delete right action' data-actiontype='bbdel'  data-index='"+ i +"' data-id='" + obj[0]["blockId.encode"] + "'></i> " +
                                                  " </div>" +
                                               //actionButtons.html() +
                                             "</li>");

                            //var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' data-type='buildingBlock' data-id='" + obj[0]["blockId.encode"] + "'>" +
                            //              "<i class='icon myblck'></i> " +
                            //              "<span class='font_75'>" + obj[0].name + "</span>" +
                            //              "</li>");


                            // block.find(".imgicons.edit").click(function () {
                            //     var parentLi = $(this).closest(".draggableControl");
                            //     var editBox = parentLi.find(".editBox");
                            //     var bbName = parentLi.find(".bbName");
                            //     editBox.find(".txtBlockName").val(bbName.text());

                            //     editBox.show();

                            //     var closeBtn = editBox.find(".closebtn");
                            //     closeBtn.click(function () {
                            //         editBox.hide();
                            //     });

                            //     var saveBtn = editBox.find(".btnSave");
                            //     saveBtn.click(function () {
                            //         var txtBlockName = editBox.find(".txtBlockName");

                            //         var args = new Object();
                            //         args.BlockName = txtBlockName.val();
                            //         args.BlockID = parentLi.data("id");

                            //         //Call overridden Method here: will use when exposing properties to developer
                            //         // if (options.OnBuildingBlockSave != null) {
                            //         //     options.OnBuildingBlockSave(args);

                            //         //     parentLi.find(".bbName").text(args.BlockName);
                            //         //     alert("Saved successfully");
                            //         // }
                            //         if (options.OnEditBuildingBlock != null) {
                            //             options.OnEditBuildingBlock(args);

                            //             parentLi.find(".bbName").text(args.BlockName);
                            //             console.log("Saved successfully");
                            //         }
                            //     });

                            // });

                            // block.find(".imgicons.delete").click(function () {
                            //     var parentLi = $(this).closest(".draggableControl");

                            //     var delBox = parentLi.find(".delBox");
                            //     delBox.show();

                            //     var btnDelete = delBox.find(".btnDelete");
                            //     btnDelete.click(function () {

                            //         var args = new Object();
                            //         args.BlockID = parentLi.data("id");

                            //         //Call overridden Method here: will use when exposing properties to developer
                            //         if (options.OnDeleteBuildingBlock != null) {
                            //             options.OnDeleteBuildingBlock(args);

                            //             parentLi.remove();
                            //             console.log("Deleted Successfully");
                            //         }


                            //     });

                            //     var closeBtn = delBox.find(".closebtn");
                            //     closeBtn.click(function () {
                            //         delBox.hide();
                            //     });

                            // });

                            //Initialize with default draggable:
                            InitializeMainDraggableControls(block);

                            // listOfBuildingBlocksHtml.append(block);
                            ulBuildingBlocks.append(block);

                            block.find(".imageicons").draggable({ disabled: true });


                            count++;
                        });

                        // var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                        // ulBuildingBlocks.empty();
                        // //console.log(listOfBuildingBlocksHtml);
                        // ulBuildingBlocks.append(listOfBuildingBlocksHtml);

                        buildingBlocksGlobal = buildingBlocksFromService;

                    }
                    else {
                        //Insert dummy data here
                        for (var i = 0; i < 20; i++) {

                            var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock'  data-type='buildingBlock' data-id='" + i + "'>" +
                                              "<i class='icon myblck'></i> " +
                                              "<a href='#'> <span class='font_75 bbName'>" + i + "</span></a>" +
                                                actionButtons.html() +
                                              "</li>");

                            block.find(".imgicons.edit").click(function () {
                                var parentLi = $(this).closest(".draggableControl");
                                var editBox = parentLi.find(".editBox");
                                var bbName = parentLi.find(".bbName");
                                editBox.find(".txtBlockName").val(bbName.text());

                                editBox.show();

                                var closeBtn = editBox.find(".closebtn");
                                closeBtn.click(function () {
                                    editBox.hide();
                                });

                                var saveBtn = editBox.find(".btnSave");
                                saveBtn.click(function () {
                                    var txtBlockName = editBox.find(".txtBlockName");

                                    var args = new Object();
                                    args.BlockName = txtBlockName.val();
                                    args.BlockID = parentLi.data("id");

                                    //Call overridden Method here: will use when exposing properties to developer
                                    if (options.OnBuildingBlockSave != null) {
                                        options.OnBuildingBlockSave(args);

                                        parentLi.find(".bbName").text(args.BlockName);
                                        alert("Saved successfully");
                                    }
                                });

                            });

                            block.find(".imgicons.delete").click(function () {
                                var parentLi = $(this).closest(".draggableControl");

                                var delBox = parentLi.find(".delBox");
                                delBox.show();

                                var btnDelete = delBox.find(".btnDelete");
                                btnDelete.click(function () {

                                    var args = new Object();
                                    args.BlockID = parentLi.data("id");

                                    //Call overridden Method here: will use when exposing properties to developer
                                    if (options.OnBuildingBlockDelete != null) {
                                        options.OnBuildingBlockDelete(args);

                                        parentLi.remove();
                                        alert("Deleted Successfully");
                                    }


                                });

                                var closeBtn = delBox.find(".closebtn");
                                closeBtn.click(function () {
                                    delBox.hide();
                                });

                            });

                            //Initialize with default draggable:
                            InitializeMainDraggableControls(block);

                            // listOfBuildingBlocksHtml.append(block);
                            ulBuildingBlocks.append(block);

                            block.find(".imageicons").draggable({ disabled: true });


                        }
                        ///////
                    }

                    myElement.find("#DCResultDiv").hide();
                }







                /// For Forms handling

                var _LoadFormBlocks = function (args) {

                    if (args == null) {
                        args = new Object();
                    }

                    //Call overridden Method here: will use when exposing properties to developer
                    if (options.LoadFormBlocks != null) {
                        options.LoadFormBlocks(args);
                    }


                    var ulFormBlocks = myElement.find(".formDroppable .ulFormBlocks");
                    ulFormBlocks.empty();



                    //Getting formBlocks from provided block:
                    if (args.formBlocks != null) {

                        var count = 1;
                        var formBlocksFromService = args.formBlocks;
                        
                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(formBlocksFromService, function (i, obj) {

                            //Assigning unique ID here:
                            obj[0].ID = obj[0]["formId.encode"];


                            var block = $("<li class='draggableControl ui-draggable droppedFormBlock' data-type='formBlock' data-id='" + obj[0]["formId.encode"] + "'>" +
                                             "<i class='icon myblck'></i> " +
                                             "<span class='font_75 bbName'>" + obj[0].name + "</span>" +
                                              "<div class='imageicons' > " +
                                                  "<i class='imgicons edit action' data-actiontype='fbedit'  data-index='"+ i +"' data-id='" + obj[0]["formId.encode"] + "'></i> " +
                                                  "<i class='imgicons delete right action' data-actiontype='fbdel'  data-index='"+ i +"' data-id='" + obj[0]["formId.encode"] + "'></i> " +
                                                  " </div>" +
                                             "</li>");

                            //var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' data-type='buildingBlock' data-id='" + obj[0]["blockId.encode"] + "'>" +
                            //              "<i class='icon myblck'></i> " +
                            //              "<span class='font_75'>" + obj[0].name + "</span>" +
                            //              "</li>");


                            
                            

                            //Initialize with default draggable:
                            InitializeMainDraggableControls(block);

                            // listOfBuildingBlocksHtml.append(block);
                            ulFormBlocks.append(block);

                            

                            count++;
                        });

                        // var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                        // ulBuildingBlocks.empty();
                        // //console.log(listOfBuildingBlocksHtml);
                        // ulBuildingBlocks.append(listOfBuildingBlocksHtml);

                        formBlocksGlobal = formBlocksFromService;

                    }
                       ///////


                }




              /// For Forms handling

                var _searchFormBlocks = function (args) {

                    var ulFormBlocks = myElement.find(".formDroppable .ulFormBlocks");
                    ulFormBlocks.empty();
                    var formBlocksFromService = formBlocksGlobal;
                    var textForSearch = myElement.find("input#searchForm").val();
                    var counter = 0;
                    if(textForSearch != null && textForSearch != "") {
                        //console.log("TextforSearch:"+textForSearch);
                        //$.parseJSON Takes a well-formed JSON string and returns the resulting JavaScript object.
                        $.each(formBlocksFromService, function (i, obj) {

                            //Assigning unique ID here:
                            obj[0].ID = obj[0]["formId.encode"];
                            var label = obj[0].name;
                            //console.log("formLabel:"+label);
                            if(label.startsWith(textForSearch)) {
                                counter++;
                                var block = $("<li class='draggableControl ui-draggable droppedFormBlock' data-type='formBlock' data-id='" + obj[0]["formId.encode"] + "'>" +
                                                 "<i class='icon myblck'></i> " +
                                                 "<span class='font_75 bbName'>" + obj[0].name + "</span>" +
                                                  "<div class='imageicons' > " +
                                                  "<i class='imgicons edit action' data-actiontype='fbedit'  data-index='"+ i +"' data-id='" + obj[0]["formId.encode"] + "'></i> " +
                                                  "<i class='imgicons delete right action' data-actiontype='fbdel'  data-index='"+ i +"' data-id='" + obj[0]["formId.encode"] + "'></i> " +
                                                  " </div>" +
                                                 "</li>");

                                //var block = $("<li class='draggableControl ui-draggable droppedBuildingBlock' data-type='buildingBlock' data-id='" + obj[0]["blockId.encode"] + "'>" +
                                //              "<i class='icon myblck'></i> " +
                                //              "<span class='font_75'>" + obj[0].name + "</span>" +
                                //              "</li>");


                                
                                

                                //Initialize with default draggable:
                                InitializeMainDraggableControls(block);

                                // listOfBuildingBlocksHtml.append(block);
                                ulFormBlocks.append(block);

                            

                                //count++;
                            }
                        });
                        myElement.find("#FBResultDiv").html(counter + " records Found");
                        myElement.find("#FBResultDiv").show();

                        // var ulBuildingBlocks = myElement.find(".buildingBlockDroppable .ulBuildingBlocks");
                        // ulBuildingBlocks.empty();
                        // //console.log(listOfBuildingBlocksHtml);
                        // ulBuildingBlocks.append(listOfBuildingBlocksHtml);

                        formBlocksGlobal = formBlocksFromService;

                    }
                    else {
                        _LoadFormBlocks();
                        myElement.find("#FBResultDiv").hide();
                    }
                       ///////


                }



                var _saveCallBackMethod = function () {
                    if (options.CallBackSaveMethod != null) {
                        var templateHTML = mainContentHtmlGrand.html();
                        var mainHTMLELE = myElement.find(".mainContentHtml");
                        var constructedHTML = $(mainHTMLELE.outerHTML());
                        console.log("HTML going for cleanup:"+ constructedHTML.outerHTML());
                        var cleanedupHTML = CleanCode(constructedHTML).html();
                        console.log("HTML after cleanup:"+ cleanedupHTML);
                        var outputter = $("<div></div>");
                        outputter.wrapInner(cleanedupHTML);
                        
                        var outputHTML = "<!-- MEE_DOCUMENT -->" + outputter.outerHTML();
                        console.log("OutputHTML:"+ outputHTML);
                        //console.log("Reconstructed HTML:\n"+ reConstructCode(outputHTML).html());
                        options.CallBackSaveMethod(templateHTML, outputHTML);
                        alert("Template has been successfully saved on Server.");
                    }
                };

                function InitializeControls() {

                    console.log("InitializeControls called..");
                    //Muhammad.Adnan
                    //Main Draggable Controls
                    var draggableControls = myElement.find(".draggableControl");
                    InitializeMainDraggableControls(draggableControls);

                    //Click on overall element:
                    myElement.click(function () {

                        if (!isElementClicked) {
                            //Will hide here floating elements:

                            //Sohaib 
                            RemovePopups();
                        }
                        isElementClicked = false;
                    });

                    //Building Blocks Drop Area:
                    InitializeBuildingBlockDroppableArea();

                    //Load building blocks from service:
                    _LoadBuildingBlocks();
                    //////////

                    _LoadDynamicBlocks();
                    _LoadDynamicBlockFields();
                    _LoadDynamicBlockRuleConditions();
                    _LoadDynamicBlockFormats();
                    _LoadPersonalizeTags();


                    if(options.landingPage) {
                        _LoadFormBlocks();
                    }


                    myElement.find("#contentAreaDiv").scroll();
                    myElement.find("#imageTitleDialog").hide();
                    myElement.find(".accordian").accordion({ heightStyle: "fill" });

                    //TODO Styles

                    myElement.find('.tabs').click(function () {
                        var $this = $(this);
                        var $tabs = myElement.find('.tabs');

                        $tabs.removeClass('active');
                        $this.addClass('active');
                        if ($(this).hasClass("builder-tab")) {
                            myElement.find('.builder-panel').show();
                            myElement.find('.style-panel').hide();
                            InitializeElementsForStyle(false);

                        }
                        if ($(this).hasClass("style-tab")) {
                            myElement.find('.builder-panel').hide();
                            myElement.find('.style-panel').show();
                            InitializeElementsForStyle(true);
                        }

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

                    // if(firstTime && options.preDefinedHTML != null && options.preDefinedHTML != "" ) {

                    //     console.log("PRE-DEFINED HTML:" + options.preDefinedHTML);
                    //     mainContentHtmlGrand.html(options.preDefinedHTML);
                    //     firstTime = false;
                    //     InitializeControls();

                    // }
                    // firstTime = false;

                }

                InitializeControls();

                //---------------------------------------------------------------------------------//

                // [Sarmad.Ali] --------------- IMAGE LIBRARY ------------ //            

                //Image Parameters for Ajax Request for LoadImages in Image Library
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

                    var LoadImagesInLibrary = function () {
                        returnData = SendServerRequest(_imageAjaxParameters);
                        var obj = returnData;
                        if (obj != null && obj != undefined) {
                            imageListGlobal = obj.images;
                            var imagesHTML = getImagesMarkup(obj.images);
                            if (imagesHTML != "") {
                                var oImages = $(imagesHTML);

                                oImages.find(".draggableControl").andSelf().filter(".draggableControl").each(function (index, element) {
                                    InitializeMainDraggableControls($(element));
                                });

                                myElement.find(".imageLib").html(oImages);

                            }
                        }
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
                    var data = { searchText: searchText };
                    _searchImagesAjaxParameters.Data = JSON.stringify(data);
                    _searchImagesAjaxParameters.Url = options.SearchImagesProperties.Url + searchText;
                    returnData = SendServerRequest(_searchImagesAjaxParameters);
                    var obj = returnData;                
                    if (obj != null && obj != undefined) {
                        imageListGlobal = obj.images;
                        myElement.find(".imageLib").html(getImagesMarkup(obj.images));
                        myElement.find("#ILResultDiv").html(obj.count + " records Found.");
                        myElement.find("#ILResultDiv").show();
                    }
                };

                myElement.find("input#searchImg").keyup(function (e) {
                    if(e.which == 13){
                        //console.log("enter pressed");
                        var searchText = myElement.find(".searchimg-text").val();
                        if(searchText == "") {
                            LoadImagesInLibrary();
                            myElement.find("#ILResultDiv").hide();
                        }
                        else {
                            SearchImages(searchText);
                        }
                        myElement.find(".searchimg-text").val("");
                        return false;
                    }
                    
                });

                myElement.find(".search-img").click(function () {
                    var searchText = myElement.find(".searchimg-text").val();
                    if(searchText == "") {
                        LoadImagesInLibrary();
                    }
                    else {
                        SearchImages(searchText);
                    }
                    myElement.find(".searchimg-text").val("");
                    return false;
                });

                // ------------------ End Image Search --------------//

                // ------------------ Start Image upload --------------//

                myElement.find(".uploadFile").click(function () {
                    console.log("upload file clicked.");
                    myElement.find("#myUploadFile").click();
                    return false;
                });

                myElement.find("#myUploadFile").change(function (e) {
                    myElement.find("#form1").submit();
                    LoadImagesInLibrary();
                    return true;
                });


                //Callback handler for form submit event
                myElement.find("#form1").submit(function (e) {

                    var formObj = $(this);
                    var formURL = formObj.attr("action");
                    var formData = new FormData(this);
                    $.ajax({
                        url: formURL,
                        type: 'POST',
                        data: formData,
                        mimeType: "multipart/form-data",
                        contentType: false,
                        cache: false,
                        processData: false,
                        success: function (data, textStatus, jqXHR) {
                            console.log("Image Upload success:" + e);
                            LoadImagesInLibrary();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log("Image Upload failed:" + e);
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
                        var data = { imageId: imageId, tags: tags };
                        var jsonData = JSON.stringify(data);
                        _saveImageTagsAjaxParameters.Data = jsonData;
                        _saveImageTagsAjaxParameters.Url = options.SaveImageTagsProperties.Url + imageId + "&tags=" + tags;
                        returnData = SendServerRequest(_saveImageTagsAjaxParameters);
                        LoadImagesInLibrary();
                    }
                }


                myElement.on("click", "i.newwin", function () {
                    var element = $(this);
                    url = element.data("url");;
                    console.log("newWin button clicked.");
                    window.open(url);
                    myElement.find(".alertButtons").hide();
                });


                myElement.on("click", "i.linkOpen", function () {
                    var element = $(this);
                    // tinyMCE.activeEditor.selection.select(selectedLinkFromTinyMCE);
                            
                    // selected_element_range = tinyMCE.activeEditor.selection.getRng();
                    handleTextLink();
                    myElement.find(".alertButtons").hide();
                    console.log("Open link button clicked.");
     
                });

                myElement.on("click", "a.btnSaveBB", function () {
                    var element = $(this);
                    var txtBlockName = element.siblings("input.tginput");
                    var args = new Object();
                    args.BlockName = txtBlockName.val();
                    args.BlockID = element.data("id");

                    //Call overridden Method here: will use when exposing properties to developer
                    // if (options.OnBuildingBlockSave != null) {
                    //     options.OnBuildingBlockSave(args);

                    //     parentLi.find(".bbName").text(args.BlockName);
                    //     alert("Saved successfully");
                    // }
                    if (options.OnEditBuildingBlock != null) {
                        options.OnEditBuildingBlock(args);
                        _LoadBuildingBlocks(args);
                        //parentLi.find(".bbName").text(args.BlockName);
                        console.log("Saved successfully");
                    }
                    myElement.find(".BBEditDialog").hide();
                });

                myElement.on("click", "a.btnDeleteBB", function () {
                    var element = $(this);
                    
                    var args = new Object();
                    args.BlockID = element.data("id");

                    //Call overridden Method here: will use when exposing properties to developer
                    if (options.OnDeleteBuildingBlock != null) {
                        options.OnDeleteBuildingBlock(args);
                        _LoadBuildingBlocks(args);
                        console.log("Deleted Successfully");
                    }

                    myElement.find(".BBDeleteDialog").hide();
     
                });

                myElement.on("click", "a.btnSaveDC", function () {
                    var element = $(this);
                    var txtBlockName = element.siblings("input.tginput");
                    var args = new Object();
                    args.DCName = txtBlockName.val();
                    args.DCID =  element.data("id");

                    if (options.OnEditDynamicVariation != null) {
                        options.OnEditDynamicVariation(args);

                        _LoadDynamicBlocks(args);
                        //parentLi.find(".bbName").text(args.BlockName);
                        console.log("Saved successfully");
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
                        console.log("Deleted Successfully");
                    }

                    myElement.find(".DCDeleteDialog").hide();
     
                });

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
                    tagsContainer = element.siblings("div.tagscont").children("ul").children("li");
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
                    if(e.which == 13){
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
                    console.log("tags close button pressed..");
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


                // ----------------End Image Tags ---------------//

                // ----------------Start Image Preview ---------------//

                var ShowImagePreview = function (args) {
                    if (args != null && args != undefined) {
                        var imagePreviewContainer = myElement.find('.imgpreview-container');
                        imagePreviewContainer.find("h2").children("span").text(args.Name);
                        imagePreviewContainer.find("div.modal-body").children("img").attr('src', args.URL);
                        var actionsList = imagePreviewContainer.find("ul#more-tool-actions").children();
                        $.each(actionsList, function () {
                            var action = $(this).children("a");
                            var actionType = action.data("action");
                            if (actionType === "NewWindow") {
                                action.data("imgurl", args.URL);
                            }
                        });
                        imagePreviewContainer.show();
                    }
                }

                myElement.find(".closeImagePreview").click(function () {
                    // var element = $(this);
                    // var action = element.data("action");
                    // if (action === "NewWindow") {
                    //     closeimgPreview();
                    //     openinnewTab(element.data("imgurl"));
                    // }
                    // if (action === "CloseWindow") {
                        closeimgPreview();
                    // }
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

                // ----------------End Image Tags ---------------//

                // ------------------ Start Image Handlers --------------//

                myElement.on("click", "i,action", function () {
                    var element = $(this);
                    var type = element.data("actiontype");
                    var imgid = element.data("id");
                    var imgurl = element.data("url");
                    var imgname = element.data("name");
                    var index = element.data("index");
                    
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
                        
                        
                        var imageObj = imageListGlobal[0][index][0];
                    
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
                        var imageObj = imageListGlobal[0][index][0];
                    
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
                        var imageObj = imageListGlobal[0][index][0];
                    
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
                        
                        
                        // element.siblings('.del-window').show();
                        var imageObj = imageListGlobal[0][index][0];
                    
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
                        
                        
                        // element.siblings('.del-window').show();
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
                        
                        
                        // element.siblings('.del-window').show();
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
                        
                        
                        // element.siblings('.del-window').show();
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
                        
                        
                        // element.siblings('.del-window').show();
                        var dcObj = dynamicBlocksGlobal[index][0];
                    
                        showBox(element, dcObj, "dcedit");
                    }
                    else if (type === "fbedit") {
                        console.log("Calling loadForm method with id:"+ imgid);
                        loadForm(imgid);
                    }
                    else if (type === "fbdel") {
                        console.log("Calling deleteForm method with id:"+ imgid);
                        deleteForm(imgid);
                    }
                    return false;
                });

                myElement.on("click", "a.closebtn", function () {
                    var element = $(this);
                    element.parent().hide();
                    return false;
                });

                myElement.find(".addNewFormLink").click(function() {

                    loadForm('');

                });

                function loadForm(formId){

                    var formPara = ""; 
                    if(formId != '') {
                        formPara = "&formId="+formId;
                    }

                    var url = options.formWizURL;
                    url = url + formPara;
                    console.log("URL:"+ url);
                    //launch new window using 'url'.
                    window.open(url);
                 }


                function deleteForm(formId){

                    var formPara = ""; 
                    if(formId != '') {
                        formPara = "&mformId="+formId;
                    }

                    var url = options.formDeleteURL;

                    url = url + formPara + "&delete=true";
                    console.log("URL:"+ url);
                    
                    window.open(url);
                }

                // ------------------ End Image Handlers --------------//

                //$(".ulBuildingBlocks").on("click", "li", function () {
                //    _LastSelectedBuildingBlock = $(this);
                //    UnSelectAllBlocks();
                //    $(this).css("background", "#429bf9");
                //});

                //$(".ulDynamicBlocks").on("click", "li", function () {
                //    _LastSelectedDynamicBuildingBlock = $(this);
                //    UnSelectAllDynamicBlocks();
                //    $(this).css("background", "#429bf9");
                //});

                myElement.find(".editBB").click(function () {
                    if (_LastSelectedBuildingBlock != null) {
                        var name = _LastSelectedBuildingBlock.children("span").text();
                        myElement.find(".editBlockInputName").val(name);
                        InitializeBuildingBlockUpdatePopup();
                        //_LastSelectedBuildingBlock = null;
                    }
                    else {
                        alert("Please Select a Block First");
                    }
                });

                myElement.find(".deleteBB").click(function () {
                    if (_LastSelectedBuildingBlock != null) {
                        var id = _LastSelectedBuildingBlock.data("id");
                        var isDel = confirm("Are you sure you want to delete this Block");
                        if (isDel) {
                            // Delete Block Server Call
                            var args = {
                                buildingBlock: null
                            };

                            //var txtPlaceHolder = $(this).find(".txtPlaceHolder");
                            //args.buildingDialogBox = $(this);

                            var buildingBlock = new Object();
                            //buildingBlock.Name = $(this).find(".txtPlaceHolder").val();
                            buildingBlock.Id = _LastSelectedBuildingBlock.data("id");
                            args.buildingBlock = buildingBlock;
                            //$(this).dialog('destroy');
                            _OnDeleteBuildingBlock(args);
                            _LastSelectedBuildingBlock = null;
                            UnSelectAllDynamicBlocks();
                            //_LastSelectedBuildingBlock = null;
                        }
                        else {
                            _LastSelectedBuildingBlock = null;
                            UnSelectAllDynamicBlocks();
                        }
                        //myElement.find(".editBlockInputName").val(name);
                        //InitializeBuildingBlockUpdatePopup();
                    }
                    else {
                        alert("Please Select a Block First");
                    }
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

                            //var txtPlaceHolder = $(this).find(".txtPlaceHolder");
                            //args.buildingDialogBox = $(this);

                            var dynamicVariation = new Object();
                            //buildingBlock.Name = $(this).find(".txtPlaceHolder").val();
                            dynamicVariation.Id = _LastSelectedDynamicBuildingBlock.data("id");
                            args.dynamicVariation = dynamicVariation;
                            //$(this).dialog('destroy');
                            _OnDeleteDynamicVariation(args);
                            _LastSelectedDynamicBuildingBlock = null;
                            UnSelectAllDynamicBlocks();
                            //_LastSelectedBuildingBlock = null;
                        }
                        else {
                            _LastSelectedDynamicBuildingBlock = null;
                            UnSelectAllDynamicBlocks();
                        }
                        //myElement.find(".editBlockInputName").val(name);
                        //InitializeBuildingBlockUpdatePopup();
                        return false;
                    }
                    else {
                        alert("Please Select a Block First");
                        return false;
                    }
                });

                myElement.find('.searchDCLink').click(function (){
                    _searchDynamicBlocks();
                });

                myElement.find('.searchBBLink').click(function (){
                    _searchBuildingBlocks();
                });

                myElement.find('.searchFormLink').click(function (){
                    _searchFormBlocks();
                });

                myElement.find('.MenuCallBackSave').click(function () {
                    _saveCallBackMethod();
                });

                var _LastSelectedBuildingBlock = null;
                var _LastSelectedDynamicBuildingBlock = null;

                function UnSelectAllBlocks() {
                    myElement.find('.ulBuildingBlocks li').each(function () {
                        $(this).css("background", "#71737a");
                        //$(this).removeClass("del-active");
                    });
                }

                function UnSelectAllDynamicBlocks() {
                    myElement.find('.ulDynamicBlocks li').each(function () {
                        $(this).css("background", "#71737a");
                        //$(this).removeClass("del-active");
                    });
                }
                
                myElement.find("#HTML5FileUploader").on("dragenter", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("drag enter called..");
                    myElement.find(".divBuildingBlockLoadingImages").show();
                    //return;
                    // this.$element.addClass('file-border');
                });
                        
                myElement.find("#HTML5FileUploader").on("dragover", function (e) {
                    //console.log("drag over called..");
                    e.stopPropagation();
                    e.preventDefault();
                    //console.log("drag over called..");
                    
                    //$(".divBuildingBlockLoadingImages").hide();
                    // this.$element.addClass('file-border');
                    //return false;
                });



                myElement.find("#HTML5FileUploader").on("dragleave", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    //console.log("drag leave called..");
                    //$(".divBuildingBlockLoadingImages").hide();
                    // this.$element.addClass('file-border');
                });
                
                


                myElement.find("#HTML5FileUploader").on("drop", function (e) {
                    console.log("drop called..");
                    e.stopPropagation();
                    e.preventDefault();
                    var files = e.originalEvent.dataTransfer.files;        
                    // console.log("Dropped Files Are:"+ files);

                    // console.log(files);
                    handleFileUpload(files);
                    myElement.find(".divBuildingBlockLoadingImages").hide();
                    // this.$element.addClass('file-border');
                });

                var handleFileUpload = function(files) {
                    for (var i = 0; i < files.length; i++) {
                        if(validateIfImage(files[i])){
                            var fd = new FormData();
                            fd.append('fileName', files[i]);
                            this.name = files[i];
                            sendFileToServer(fd);
                        }
                    }
                  }

                var validateIfImage = function(file){
                    var isImage = true;
                    if(file.type.indexOf("image")<0){
                        //this.app.showAlert("Please select a image with extension jpeg,jpg,png or gif.",$("body"),{fixed:true})
                        isImage = false
                    }
                    return isImage;
                }

                function addNewRule() {

                    var ruleTemplate = $(myElement.find(".dcRuleRowTemplate").html());        
                
                    ruleTemplate.find(".firstChosen").chosen({width:"224px"});
                    ruleTemplate.find(".secondChosen").chosen({ disable_search_threshold: 10 , width:"180px"});
                    ruleTemplate.find(".thirdChosen").chosen({ disable_search_threshold: 10 , width:"150px"});
                    
                    //Delete Event
                    ruleTemplate.find(".delete").click(function () {
                        ruleTemplate.remove();
                    });
                    ////////////////////////////////////

                    myElement.find(".dynamic_inputs_list").append(ruleTemplate);


                }



                var sendFileToServer = function(formData){
                    var uploadURL = myElement.find("#form1").attr("action"); 
                    console.log("URL To post is:"+ uploadURL);
                    var _this = this;
                    var data_id = 0;
                    var jqXHR = $.ajax({
                        xhr: function() {
                        var xhrobj = $.ajaxSettings.xhr();
                        if (xhrobj.upload) {
                                xhrobj.upload.addEventListener('progress', function(event) {
                                    var percent = 0;
                                    var position = event.loaded || event.position;
                                    var total = event.total;
                                    if (event.lengthComputable) {
                                        percent = Math.ceil(position / total * 100);
                                    }
                                     // if(_this.module == "Image"){
                                     //   $('#templi_'+data_id+' #progress div').css('width',percent+"%") 
                                     //  }
                                }, false);
                            }
                            return xhrobj;
                        },
                        url: uploadURL,
                        type: "POST",
                        contentType:false,
                        processData: false,
                        cache: false,
                        async: false,
                        data: formData,
                        success: function(data){
                             console.log("successfully uploaded image...");
                            //_this.app.showLoading(false,_this.$element);
                            // $('#templi_'+data_id).remove();
                            LoadImagesInLibrary();  
                        }
                        ,
                        error:function(){
                             console.log("Faild uploading image...");
                        }
                    });

                }



                // function lazyLoading(){
                //     var $w = $(window);
                //     var th = 200;
                //     var inview = this.$(".contactbox").last().filter(function() {
                //         var $e = $(this),
                //             wt = $w.scrollTop(),
                //             wb = wt + $w.height(),
                //             et = $e.offset().top,
                //             eb = et + $e.height();
                //         return eb >= wt - th && et <= wb + th;
                //       });
                       
                //     if(inview.length && inview.attr("data-load") && this.$el.height()>0){
                //        inview.removeAttr("data-load"); //An attribute that is set when you load images with last image and remove it when you do call from here. 
                //        fetchImages(20); // your fetch ajax function
                //     }  
                // }

                // function fetchImages(bucket){
                //     $.post(URL, {offset:0,bucket:20}, function(respnse){
                //     //Add an attribute with last element if you have more records to come. 
                //     })
                // }

                    // $(".divBuildingBlockLoadingImages").on("mouseover", function (e) {
                //     console.log("mouseup enter called..");
                //     e.stopPropagation();
                //     e.preventDefault();
                //     this.$element.addClass('file-border');
                // });

      


                function resizeIFrame (frame) {
                    var iFrame = $(frame);
                    console.log('ResizeIFrame Calle...' + iFrame.contents().find("body").height());
                    var iframe_height = iFrame.contents().find("body").height()+30;

                    // $(this).height( $(this).contents().find("body").height() );
                    iFrame.height(iframe_height);

                }
        



                function copyEvents(source, destination) {
                    // Get source events
                    var events = source.data('events');
                    if(events != undefined) {
                        // Iterate through all event types
                        $.each(events, function(eventType, eventArray) {
                            // Iterate through every bound handler
                            $.each(eventArray, function(index, event) {
                                // Take event namespaces into account
                                var eventToBind = event.namespace.length > 0
                                    ? (event.type + '.' + event.namespace)
                                    : (event.type);

                                // Bind event
                                destination.bind(eventToBind, event.data, event.handler);
                            });
                        });
                    }
                }


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

            for (var i = 0 ; i < proporties.length ; i++)
                remover.call(this.style, proporties[i]);

        });
    };

    jQuery.fn.inlineStyle = function (prop) {
        var value;
        value = this.prop("style")[$.camelCase(prop)];
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
        if (!from.length || !to.length || !events) return;

        return to.each(function () {
            for (var type in events)
            for (var handler in events[type])
            jQuery.event.add(this, type, events[type][handler], events[type][handler].data);
        });
    };

