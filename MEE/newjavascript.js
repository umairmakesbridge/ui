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
    areaToDisplay.find("textarea.linkTextArea").val(tinyMCE.activeEditor.selection.getContent({
        format: 'text'
    }));

    if (tinyMCE.activeEditor.selection.getContent({
        format: 'text'
    }) != "") {
        console.log("handleTextLink: selected contents are text...");
        // $("#currTinyMCE").data("myTinyMCE", tinyMCE.activeEditor.selection);
        tiny_editor_selection = tinyMCE.activeEditor.selection;
        tiny_editor = tinyMCE.activeEditor.selection.getContent({
            format: 'text'
        });
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

////// No 2/////
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
                                            
                                            
                                            
                            });
                            
                            
                            
                            
// 3/////
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
