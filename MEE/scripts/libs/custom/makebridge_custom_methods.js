//[ -------------------------  Sohaib -----------------------------------]



// For Image Titling Dialog
function openImageTitleDialog(uiElement) {
    $("#imageTitleDialog").dialog({
        closeOnEscape: false,
        autoOpen: false,
        modal: true,
        //z-index: 500,
        buttons: {
            "Set Title": function () {

                this.imageNewTitle = $("#imageTitleDialog").find("#imageTitleText").val().trim();
                $(uiElement).parent().parent().parent().parent().find("img").attr("title", this.imageNewTitle);
                $("#imageTitleDialog").dialog("close");
                
            },
            Cancel: function () {
                $("#imageTitleDialog").dialog("close");
                
            }
        },

        width: 450
    });

    $("#imageTitleDialog").find("#imageTitleText").val("");
    $("#imageTitleDialog").dialog("open");
}

function attachLinkWithElement(workingObject, linkHtmlPage, selectedSocialLink) {    

    var myImageLink = null;
    if ($("#rightPanelArea").data("tabClicked") == "hyperlink") {
        if ( (linkHtmlPage.find("input.linkHyperLinkURL").val()).startsWith("http://") )
            myImageLink = linkHtmlPage.find("input.linkHyperLinkURL").val() + "?campaignkw=" + linkHtmlPage.find("input.linkName").val();
        else
            myImageLink = "http://" + linkHtmlPage.find("input.linkHyperLinkURL").val() + "?campaignkw=" + linkHtmlPage.find("input.linkName").val();
    }
    else if ($("#rightPanelArea").data("tabClicked") == "mailto") {
        var myEmailId = linkHtmlPage.find("input.emailLinkName").val();
        var myEmailSubject = linkHtmlPage.find("input.emailLinkSubject").val();
        myImageLink = "mailto"+":" + myEmailId + "?subject=" + myEmailSubject;        
    }
    else if ($("#rightPanelArea").data("tabClicked") == "frwdToFrnd") {
        // image do not have this type of link option
        myImageLink = "";
    }
    else if ($("#rightPanelArea").data("tabClicked") == "unsubscribe") {
        // image do not have this type of link option
        myImageLink = "";
    }
    else if ($("#rightPanelArea").data("tabClicked") == "brwoserView") {
        // image do not have this type of link option
        myImageLink = "";
    }
    else if ($("#rightPanelArea").data("tabClicked") == "doubleOptLink") {
        // image do not have this type of link option
        myImageLink = "";
    }
    else if ($("#rightPanelArea").data("tabClicked") == "safeSender") {
        // image do not have this type of link option
        myImageLink = "";
    }
    else if ($("#rightPanelArea").data("tabClicked") == "newAnchor") {
        if ((linkHtmlPage.find("#newAnchortext").val()).startsWith("http://"))
            myImageLink = linkHtmlPage.find("#newAnchortext").val();
        else
            myImageLink = "http://" + linkHtmlPage.find("#newAnchortext").val();
        //$(workingObject).parent().parent().parent().parent().find("img.imageHandlingClass").wrap("<a href='" + myImageLink + "' onclick='return false;' ></a>");
    }
    else if ($("#rightPanelArea").data("tabClicked") == "social") {

        var linkValue = "";
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

        myImageLink = linkValue;
        //$(workingObject).parent().parent().parent().parent().find("img.imageHandlingClass").wrap("<a href='" + myImageLink + "' onclick='return false;' ></a>");
    }

    // Got the link value now going to set it for the image

    if (myImageLink != "" && myImageLink != null) {
        if ($(workingObject).parent().parent().parent().parent().find("img.imageHandlingClass").parent().is("a")) {
            $(workingObject).parent().parent().parent().parent().find("a").attr("href", myImageLink);
            //$(workingObject).parent().parent().parent().parent().find("a").attr("href", "#.");
            //$(workingObject).parent().parent().parent().parent().find("a").data("link", myImageLink);
        }
        else {
            $(workingObject).parent().parent().parent().parent().find("img.imageHandlingClass").wrap("<a href='" + myImageLink + "' onclick='return false;' ></a>");
            //$(workingObject).parent().parent().parent().parent().find("img.imageHandlingClass").wrap("<a href='#.'></a>");
            //$(workingObject).parent().parent().parent().parent().find("a").data("link", myImageLink);
        }
    }
    
}

function enableTextOrImagePreview(linkObjectType, htmlAreaObject, imageControlObject, tiny_editor) {
    if (linkObjectType == "text") {
        htmlAreaObject.find("div.textAreaDivfortextLink").show();
        htmlAreaObject.find("div.linkImagePreview").hide();
        // if (tiny_editor.getContent({ format: 'text' }).trim() != "") {
            // htmlAreaObject.find("textarea.linkTextArea").val(tiny_editor.getContent({ format: 'text' }));
            htmlAreaObject.find("textarea.linkTextArea").val(tiny_editor);
        // } else {
        //     console.log("7. SomeLink set here");
                    
        //     htmlAreaObject.find("textarea.linkTextArea").val("Some Link");
        // }
    } else if (linkObjectType == "image") {
        htmlAreaObject.find("div.linkImagePreview").show();
        htmlAreaObject.find("div.textAreaDivfortextLink").hide();
        htmlAreaObject.find("img").attr("src", $(imageControlObject).parent().parent().parent().find("img.imageHandlingClass").attr("src"));
    }
}



// Load Text Inline Text Editor
function LoadEditor(args)
{
    tinymce.init({
        selector: "div.textcontent",
        theme: "modern",
        plugins: 'link',
        script_url: '/scripts/libs/tinymce/tinymce.js',
        toolbar1: "fontselect fontsizeselect | forecolor backcolor | bold italic underline strikethrough | subscript superscript | alignleft aligncenter alignright alignjustif | bullist numlist | table preview ",
        toolbar2: "mybutton123",
        link_list: [
        {title: 'My page 1', value: 'http://www.tinymce.com'},
        {title: 'My page 2', value: 'http://www.moxiecode.com'}
        ],
        setup: function (editor) {
            
            editor.addButton('mybutton123', {
                type: 'listbox',
                title: 'Personalize',
                text: 'Personalize',
                icon: false,
                onselect: function (e) {
                    editor.insertContent(this.value());
                },
                values: [
                    { text: 'Personalize', value: '' },
                    { text: 'Email', value: '@EMAIL@' },
                    { text: 'First Name', value: '@First Name@' },
                    { text: 'Full Name', value: '@Full Name@' },
                    { text: 'Gender', value: '@Gender@' },
                    { text: 'Last Name', value: '@Last Name@' },
                    { text: 'Post Code', value: '@Post Code@' },
                    { text: 'Sender Address', value: '@Sender Address@' }
                ],
                onPostRender: function () {
                    // Select the second item by default
                    //this.value('Some text 2');
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
/*
tinyMCE.activeEditor.selection.getContent({ format: 'text' }) // To get the Selected Text
tinymce.activeEditor.execCommand('mceInsertContent', false, "some text"); // to Add some text at the place of curser
*/
//////////////////////////////////////////////////////////////////////////////////////////////////////

 //.................... Send Server Request ................................
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

function filterImages(query, obj) {
    var new_obj = {}, total = 0, query = query.toLowerCase();
    for (var i in obj) {
        var imageName = obj[i].Name.toLowerCase();
        if (imageName == query) { new_obj[i] = obj[i]; total++; }
    }

    return new_obj;
}

function getImagesMarkup(obj) {
    var imagesMarkup = "";
    $.each(obj[0], function(index, val) {             
        var tagsArr = val[0].tags.split(',');
         
        var j = index + 1;
        var li = "<li class='draggableControl ui-draggable droppedImage' data-type='droppedImage'>";

            li += "<span class='img'>";
            li += "<img title='" + val[0].tags + "' src='" + val[0].thumbURL + "' alt='" + val[0].fileName + "' data-id='" + val[0]["imageId.encode"] + "' data-tags='" + val[0].tags + "' data-name='" + val[0].fileName + "' /></span>";
            li += "<a href='#'><span class='font_75'>" + val[0].fileName + "</span></a>";
            li += "<div class='imageicons'>";
            li += "<i class='imgicons info action' data-actiontype='imageInfo' data-index='"+ index +"' data-id='" + val[0]["imageId.encode"] + "'></i>";
            li += "<i class='imgicons link action' data-actiontype='imageLink' data-index='"+ index +"' data-id='" + val[0]["imageId.encode"] + "'></i>";
            li += "<i class='imgicons preview action' data-actiontype='imagePreview' data-index='"+ index +"' data-id='" + val[0]["imageId.encode"] + "' data-url='" + val[0].originalURL + "' data-name='" + val[0].fileName + "'></i>";
            li += "<i class='imgicons tag action' data-actiontype='imageTag' data-index='"+ index +"' data-id='" + val[0]["imageId.encode"] + "'></i>";
            li += "<i class='imgicons delete action' data-actiontype='imageDelete' data-index='"+ index +"' data-id='" + val[0]["imageId.encode"] + "'></i>";

            // li += "<div class='image-info info-window' style='left:-21px;'>";
            // li += "<a class='closebtn'></a>";
            // li += "<h4>" + val[0].fileName + "</h4>";
            // li += "<h5><em>Size: </em>" + val[0].height + " x " + val[0].width + "</h5>";
            // li += "<h5><em>Created on: </em>" + val[0].updationDate + "</h5>";
            // li += "</div>";

            // li += "<div class='image-info link-window' style='left: 0px;'>";
            // li += "<a class='closebtn'></a>";
            // li += "<h4>Image URL</h4>";
            // li += "<input type='text' placeholder='Image URL' class='left tginput' style='width: 202px;' value='" + val[0].originalURL + "'>";
            // li += "</div>";

            // li += "<div class='image-info tag-window' style='left: 43px;'>";
            // li += "<a class='closebtn closebtn-imgtag' data-id='" + val[0]["imageId.encode"] + "'></a>";
            // li += "<div class='tagscont'>";
            // li += "<ul>";
            // for (var i = 0; i < tagsArr.length; i++) {
            //     li += "<li><a class='tag' href='#.'><span>" + tagsArr[i] + "</span><i class='icon cross remove-tag'></i></a></li>";
            // }
            // li += "</ul></div>";
            // li += "<input type='text' placeholder='Add tag' class='left tginput'>";
            // li += "<a class='btn-green left addtag' data-id='" + val[0]["imageId.encode"] + "'><span>Add</span><i class='icon plus'></i></a>";
            // li += "</div>";

            // li += "<div class='image-info del-window' style='left: 63px;'>";
            // li += "<a class='closebtn'></a>";
            // li += "<h5 style='padding-bottom: 10px;'>Do you want to delete this Image?</h5>";
            // li += "<a class='btn-red left confirm-del' data-id='" + val[0]["imageId.encode"] + "'><span>Delete</span><i class='icon delete'></i></a>";
            // li += "</div></div>";
            li += "</li>";
        //li += "<img title='" + val[0].tags + "' src='" + val[0].thumbURL + "' data-Id='" + val[0]["imageId.encode"] + "' data-tags='" + val[0].tags + "' data-name='" + val[0].fileName + "' /><label>+</label><br />";
        //li += "<span class=' font_75'>" + val[0].fileName + "<img src='images/delete-ico.png' /></span></li>";
        imagesMarkup = imagesMarkup + li;   
    })


  /*  for (var i = 0; i < obj.length; i++) {
        var j = i + 1;
        var li = "<li class='draggableControl droppedImage' data-type='droppedImage'>";

        li += "<img title='" + obj[i].tags + "' src='images/upload-images/" + obj[i].thumbURL + "' data-Id='" + obj[i].imageId_encode + "' data-tags='" + obj[i].tags + "' data-name='" + obj[i].name + "' /><label>+</label><br />";
        li += "<span class=' font_75'>" + obj[i].name + "<img src='images/delete-ico.png' /></span></li>";
        imagesMarkup = imagesMarkup + li;
    }*/
    return imagesMarkup;
}