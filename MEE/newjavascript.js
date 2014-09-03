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