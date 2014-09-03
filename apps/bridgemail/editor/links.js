define(['text!editor/html/links.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Link Dialog view for MEE
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'content_containerLinkGUI',
            /**
             * Attach events on elements in view.
            */
            events: {
                'click #cssmenuLinkGUI li':'_changeTab',
                'change .linkHyperLinkURL':'previewLink',
                'click #existingLinkDrp':'showExistingLinks'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.editorEl = this.options._el;
                    this.hiddenObj = $(this.editorEl.find("#imageDataSavingObject").data("myWorkingObject"));
                    this.activeTab = "_addHyperLink";
                    this.template = _.template(template);	
                    this.dialog = this.options.dialog;
                    this.linkType = this.options.linkType;
                    this.textEditor = this.options.div;
                    this.tiny_editor_selection = null;                    
                    this.systemLinks={
                        "fwdToFrndLink":"{{BMS_TELL_A_FRIEND_URL}}",
                        "unsubLink":"{{BMS_UNSUBSCRIBE_URL}}",
                        "cantReadLink":"{{BMS_WEB_VERSION_URL}}",
                        "socialFacebookLink":"{{BMS_FACEBOOK_SHARE_URL}}",
                        "socialTwitterLink":"{{BMS_TWITTER_SHARE_URL}}",
                        "socialLinkedInLink":"{{BMS_LINKEDIN_SHARE_URL}}",
                        "socialPintrestLink":"{{BMS_PINTEREST_SHARE_URL}}",
                        "socialGooglePlusLink":"{{BMS_GOOGLEPLUS_SHARE_URL}}"
                    }
                    this.render();                             
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({                    
                }));    
                this.showHyperLink();
                
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            _changeTab:function(e){
                var obj = $.getObj(e,"li");
                if(obj.hasClass("selected")==false){
                    this.$("#cssmenuLinkGUI li.selected").removeClass("selected");
                    obj.addClass("selected");
                    this.$(".tcontent").hide();
                    this.$("div."+obj.attr("id")+"Div").show();                    
                }
            },
            insertLink:function(dialog){
                if (this.linkType == "image") {
                    this.attachLinkToImg();
                }
                else if (this.linkType == "text") {
                    this.attachLinkToText();
                }                
                dialog.hide();                                
            },
            showHyperLink:function(){
               if (this.linkType == "image") { 
                this.$("div.linkImagePreview").show();
                this.$("div.textAreaDivfortextLink").hide();
                this.activeTab = "_addHyperLink";
                var imgObj = this.hiddenObj.is("img")?this.hiddenObj:this.hiddenObj.find("img");
                this.$("img").attr("src", imgObj.attr("src"));                
                    if(imgObj.parent().is("a")){
                        this.showLinkDetails(imgObj.parent());
                    }
                }
                else if(this.linkType == "text"){                    
                    // Selection is text from editor 
                    this.$("div.linkImagePreview").hide();
                    this.$("div.textAreaDivfortextLink").show();
                    this.activeTab = "_addHyperLink";
                    this.$("textarea.linkTextArea").val(tinyMCE.activeEditor.selection.getContent({
                        format: 'text'
                    }));
                    this.tiny_editor_selection = tinyMCE.activeEditor.selection;
                    if (this.tiny_editor_selection.getNode().nodeName == "a" || this.tiny_editor_selection.getNode().nodeName == "A") {
                        this.showLinkDetails($(this.tiny_editor_selection.getNode()));
                        this.$("textarea.linkTextArea").val($(this.tiny_editor_selection.getNode()).text());
                    }else{
                        if (tinyMCE.activeEditor.selection.getContent({format: 'text'}) != "") {                        
                            var tiny_editor = tinyMCE.activeEditor.selection.getContent({format: 'text'});
                            this.$("textarea.linkTextArea").val(tiny_editor);
                            this.$("input.linkHyperLinkURL").val("");
                        }
                        else{                        
                            this.$("textarea.linkTextArea").val("Some Link");
                        }
                    }
                    
                    
                }
                
                this.dialog.$el.click(function(e){
                    $(".existinglinksdd").remove();                    
                });                
                
            },
            showLinkDetails:function(anchorObj){                
                var _a_href = anchorObj.attr("href");
                var showName = $.getUrlVar(_a_href,'campaignkw');
                if(showName){
                    _a_href = _a_href.replace("?campaignkw="+showName,"");
                }
                this.$("input.linkHyperLinkURL").val(_a_href);
                this.$(".visitlink").attr("href",_a_href);
                this.$("input.linkName").val(showName);
            },
            attachLinkToImg:function(){
                var myImageLink = "";                
                if(this.activeTab == "_addHyperLink"){
                   myImageLink = this.getURL();
                }
                //Add link to editor
                if (myImageLink != "" && myImageLink != null) {
                    var imgObj = this.hiddenObj.is("img")?this.hiddenObj:this.hiddenObj.find("img");
                    if(imgObj.parent().is("a")){
                        imgObj.parent().attr("href", myImageLink);
                    }
                    else{
                        imgObj.wrap("<a href='" + myImageLink + "' onclick='return false;' ></a>");
                    }
                }
            },
            attachLinkToText:function(){
                 var postBackupLink = "";
                 var myTextLink = "";
                 if(this.activeTab == "_addHyperLink"){
                   postBackupLink = this.getURL();  
                   myTextLink = "<a class='MEE_LINK' href='" + postBackupLink + "' style='text-decoration:underline;'>" + this.$("textarea.linkTextArea").val() + "</a>";
                 }
                 
                 /*if(selected_element_range != null) {
                    tiny_editor_selection.setRng(selected_element_range);
                    selected_element_range = null;
                 }*/
                    
                if (this.tiny_editor_selection.getNode().nodeName == "a" || this.tiny_editor_selection.getNode().nodeName == "A") {                    
                    this.tiny_editor_selection.getNode().setAttribute("href", myTextLink);
                }
                else {                    
                    this.tiny_editor_selection.setContent(myTextLink);
                }
                //tinymce.activeEditor.focus();               
                 
            },
            previewLink:function(){
                var link = this.getURL(true);
                if(link){
                    this.$(".visitlink").attr("href",link);
                }
                else{
                    this.$(".visitlink").removeAttr("href");
                }
            },
            getURL:function(noName){
                    var link = "";
                    var _hyperlinkInput = this.$("input.linkHyperLinkURL");
                    var linkName = this.$("input.linkName").val();
                    var lineNameStr = linkName?"?campaignkw=" + linkName:"";                    
                    if(noName){
                        //set url without link name param
                        lineNameStr = "";
                    }
                    if($.trim(_hyperlinkInput.val())!==""){
                        if ( (_hyperlinkInput.val()).startsWith("http://")){
                            link = _hyperlinkInput.val() + lineNameStr;
                        }
                        else if( (_hyperlinkInput.val()).startsWith("https://") ){
                            link = _hyperlinkInput.val() + lineNameStr;
                        }
                        else{    
                            link = "http://" + _hyperlinkInput.val() + lineNameStr;
                       }
                   }
                   return link;
            },
            showExistingLinks:function(e){
                var existingLinkDiv = $(".existinglinksdd");
                if(existingLinkDiv.length==0){
                    var _links = this.getExistingLinks()
                    var existingLinks = _.template(this.$('#existinglinks_template').html());
                    $("body").append(existingLinks({                        
                    }));
                    existingLinkDiv = $(".existinglinksdd");
                    existingLinkDiv.click(function(obj){
                        obj.stopPropagation();
                    });
                    var _li = null;
                    _.each(_links,function(v){
                        _li = $("<li>"+v+"</li>")
                        existingLinkDiv.find(".linkresults").append(_li);
                        _li.click(_.bind(this.selectAnchor,this));
                    },this);
                    //linkresults
                }
                if(existingLinkDiv.css("display")=="none"){
                    var _offset = this.$("#existingLinkDrp").offset();
                    existingLinkDiv.css({"display":"block","left":(_offset.left-322)+"px","top":(_offset.top+35)+"px","width":"433px"});
                }
                else{
                    existingLinkDiv.remove();
                }
                e.stopPropagation();
                e.preventDefault();
                return false;
            },
            selectAnchor:function(e){
                this.$("input.linkHyperLinkURL").val($(e.target).text());
                $(".existinglinksdd").remove();
            }
            ,
            getExistingLinks:function(){
                var anchors = this.editorEl.find(".csHaveData a");
                var _array =  [];
                var _a_href = "",showName="";
                _.each(anchors,function(obj){
                    if($(obj).attr("href")){
                        _a_href = $(obj).attr("href"); 
                        showName = $.getUrlVar(_a_href,'campaignkw');
                        if(_a_href !=="#" && $.trim(_a_href)!==""){
                            _array.push(_a_href.replace("?campaignkw="+showName,""));
                        }
                    }
                },this)
                return _array;
            }            
            
        });
});