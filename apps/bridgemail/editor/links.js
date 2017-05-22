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
                    this.editorEl = this.options._el.find("#mee-iframe").contents();
                    this.hiddenObj = $(this.options._el.find("#imageDataSavingObject").data("myWorkingObject"));
                    this.activeTab = "_addHyperLink";
                    this.meeIframeWindow = this.options.meeIframeWindow;
                    this.template = _.template(template);	
                    this.dialog = this.options.dialog;
                    this.selection  = this.options.selectedText;
                    this.linkType = this.options.linkType;
                    this.textEditor = this.options.div;
                    this.tiny_editor_selection = null;    
                    this.config = this.options.config;
                    this.app = this.config._app;
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
                
                this.$('input.radiopanel').iCheck({
                    radioClass: 'radiopanelinput',
                    insert: '<div class="icheck_radio-icon"></div>'
                });
                this.$( "ul.socialbtns li label" ).click(function() {
                    var _li = $(this).parents("li");
                    _li.find("input.radiopanel").iCheck("check");
                });
                this.$('input.checkinput').iCheck({
                        checkboxClass: 'checkinput'
                });
                this.$(".select-target").chosen({ width: "200px", disable_search: "false"});
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                
                this.$('input.checkinput').on('ifChecked', _.bind(function(event){
                     this.$(".right_columnLinkGUI textarea").css("text-decoration","underline");   
                },this));
                this.$('input.checkinput').on('ifUnchecked', _.bind(function(event){
                     this.$(".right_columnLinkGUI textarea").css("text-decoration","none");   
                },this));
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            _changeTab:function(e){
                var obj = $.getObj(e,"li");
                if(obj.hasClass("selected")==false){
                     this.showSelectedTab(obj);               
                }
            },
            showSelectedTab:function(obj){
              this.$("#cssmenuLinkGUI li.selected").removeClass("selected");
              obj.addClass("selected");
              this.$(".tcontent").hide();
              this.activeTab = obj.attr("id");
              this.$("div."+obj.attr("id")+"Div").show();      
              if(this.activeTab=="_addNewSocialLink"){
                  this.$(".underline-checkbox").css("top","122px");
              }
              else{
                  this.$(".underline-checkbox").css("top","48px");
              }
                  
                  
            },
            insertLink:function(dialog){
                var imgLink = null;
                if (this.linkType == "image") {
                    imgLink = this.attachLinkToImg();
                }
                else if (this.linkType == "text") {
                    imgLink = this.attachLinkToText();
                }           
                if(imgLink!==false){
                     if(this.config.fromDialog){
                        if(dialog.showPrevious){
                            dialog.showPrevious();  
                        }
                        else{
                            dialog.hide();                                  
                        }
                     }
                     else{
                         dialog.hide();                               
                     }
                     setTimeout(_.bind(function(){this.editorEl.find("[data-mce-type='bookmark']").remove();},this),200);
                }
            },
            showHyperLink:function(){
               if (this.linkType == "image") { 
                this.$("div.linkImagePreview").show();
                this.$(".underline-checkbox").hide();
                this.$("div.textAreaDivfortextLink").hide();
                var imgObj = this.hiddenObj.is("img")?this.hiddenObj:this.hiddenObj.find("img");
                this.$("img").attr("src", imgObj.attr("src"));                
                    if(imgObj.parent().is("a")){
                        this.showLinkDetails(imgObj.parent());
                    }
                }
                else if(this.linkType == "text"){                    
                    // Selection is text from editor 
                    this.$("div.linkImagePreview").hide();
                    this.$(".underline-checkbox").show();
                    this.$("div.textAreaDivfortextLink").show();                    
                    this.$("textarea.linkTextArea").val(this.meeIframeWindow.tinyMCE.activeEditor.selection.getContent({
                        format: 'text'
                    }));
                    this.meeIframeWindow.﻿tinyMCE.activeEditor.﻿selection.moveToBookmark(this.selection);
                    this.tiny_editor_selection = this.meeIframeWindow.tinyMCE.activeEditor.selection;
                    var getSelectedAnchor = this.selectedAnchor(this.tiny_editor_selection);
                    if (getSelectedAnchor) {
                        this.showLinkDetails(getSelectedAnchor);
                        this.$("textarea.linkTextArea").val(this.meeIframeWindow.tinyMCE.activeEditor.selection.getContent({format: 'text'}));
                    }else{
                        if (this.meeIframeWindow.tinyMCE.activeEditor.selection.getContent({format: 'text'}) != "") {                        
                            var tiny_editor = this.meeIframeWindow.tinyMCE.activeEditor.selection.getContent({format: 'text'});
                            this.$("textarea.linkTextArea").val(tiny_editor);
                            this.$("input.linkHyperLinkURL").val("");
                        }
                        else{                        
                            this.$("textarea.linkTextArea").val("Some Link");
                        }
                    }
                    this.selection = this.meeIframeWindow.tinyMCE.activeEditor.selection.getBookmark();
                    
                }
                
                this.dialog.$el.click(function(e){
                    $(".existinglinksdd").remove();                    
                });                
                
            },
            selectedAnchor:function(selection){
                var _node = $(selection.getNode());
                var selectedNode = null;
                
                if(selection.getNode().nodeName.toLowerCase()=="a"){
                    selectedNode = _node;
                }
                else if(selection.getContent({format: 'text'})!==""){
                    _node.find("a").each(function(){
                        if($.trim($(this).text())==$.trim(selection.getContent({format: 'text'}))){
                            selectedNode = $(this);
                        }
                    });
                }
                return selectedNode ;
            },
            showLinkDetails:function(anchorObj){    
                if(typeof(anchorObj.attr("href"))==="undefined"){
                    anchorObj.attr("href","");
                }
                var _a_href = anchorObj.attr("href").toLowerCase();
                var actual_href = anchorObj.attr("href");
                var actual_target = anchorObj.attr("target");
                if(anchorObj.parent().hasClass("underline")){
                    this.$(".underline-checkbox input").prop("checked",true);
                    this.$(".right_columnLinkGUI textarea").css("text-decoration","underline");
                }
                else{
                    this.$(".underline-checkbox input").prop("checked",false);
                    this.$(".right_columnLinkGUI textarea").css("text-decoration","none");
                }
                if(_a_href.startsWith("mailto:")){
                    var showSubject = $.getUrlVar(_a_href,'subject');
                    _a_href = _a_href.replace("?subject="+showSubject,"");
                    _a_href = _a_href.replace("&subject="+showSubject,"");
                    _a_href = _a_href.replace("mailto:","");
                    this.$("#emailLinkName").val(_a_href);
                    this.$("#emailLinkSubject").val(showSubject);
                    this.showSelectedTab(this.$("#_addEmailLink"));                                   
                }
                else if(_a_href==this.systemLinks.fwdToFrndLink.toLowerCase()){
                    this.showSelectedTab(this.$("#_addFrwdToFrndLink"));                                   
                }
                else if(_a_href==this.systemLinks.unsubLink.toLowerCase()){
                    this.showSelectedTab(this.$("#_addUnsubscribeLink"));                                   
                }
                else if(_a_href==this.systemLinks.cantReadLink.toLowerCase()){
                    this.showSelectedTab(this.$("#_addViewinBrowserLink"));                                   
                }
                else if(_a_href==this.systemLinks.socialFacebookLink.toLowerCase() ||
                        _a_href==this.systemLinks.socialTwitterLink.toLowerCase() ||
                        _a_href==this.systemLinks.socialLinkedInLink.toLowerCase() ||
                        _a_href==this.systemLinks.socialPintrestLink.toLowerCase() ||
                        _a_href==this.systemLinks.socialGooglePlusLink.toLowerCase()){
                    this.setSocialRadio(_a_href.toUpperCase());    
                    this.showSelectedTab(this.$("#_addNewSocialLink"));  
                }
                else{
                    //handle hyper link population
                    var showName = $.getUrlVar(_a_href,'campaignkw');
                    if(showName){
                        actual_href = actual_href.replace("?campaignkw="+showName,"");
                        actual_href = actual_href.replace("&campaignkw="+showName,"");
                    }
                    if(!showName && anchorObj.attr("name")){
                        showName = anchorObj.attr("name");
                    }
                    
                    if(actual_target){
                        this.$(".select-target").val(actual_target);
                    }
                    this.$("input.linkHyperLinkURL").val(actual_href);
                    this.$(".visitlink").attr("href",actual_href);
                    this.$("input.linkName").val(showName);
                }
            },
            getLink:function(){
                var myLink = null;
                if(this.activeTab == "_addHyperLink"){
                   myLink = this.getURL();                
                } else if(this.activeTab == "_addEmailLink"){
                   myLink = this.getEmail(); 
                } else if(this.activeTab == "_addFrwdToFrndLink"){
                    myLink = this.systemLinks.fwdToFrndLink; 
                }
                else if(this.activeTab == "_addUnsubscribeLink"){
                    myLink = this.systemLinks.unsubLink; 
                }
                else if(this.activeTab == "_addViewinBrowserLink"){
                    myLink = this.systemLinks.cantReadLink; 
                }
                else if(this.activeTab == "_addNewSocialLink"){
                    myLink = this.getSocialLinks(); 
                }
                return myLink;
            },
            getTarget:function(){
              return this.$(".select-target").val() ;
            },
            getLinkName:function(){
              return this.$("input.linkName").val();  
            },
            attachLinkToImg:function(){
                var myImageLink = ""; 
                myImageLink = this.getLink();     
                var target = this.getTarget();
                var linkName = this.getLinkName();
                var targetAttr = "";
                var linkNameAttr = "";
                if(target){
                     targetAttr = "target='"+target+"'";
                }
                if(linkName){
                    linkNameAttr = "name='"+linkName+"'";
                }
                if(!myImageLink){return false}
                //Add link to editor
                if (myImageLink != "" && myImageLink != null) {
                    var imgObj = this.hiddenObj.is("img")?this.hiddenObj:this.hiddenObj.find("img");
                    if(imgObj.parent().is("a")){
                        imgObj.parent().attr("href", myImageLink);
                        if(target){
                            imgObj.parent().attr("target", target);
                        }
                        else{
                            imgObj.parent().removeAttr("target");
                        }
                        if(linkName){
                            imgObj.parent().attr("name", linkName);
                        }
                        else{
                            imgObj.parent().removeAttr("name");
                        }
                    }
                    else{
                        imgObj.wrap("<a href='" + myImageLink + "' "+targetAttr+" "+linkNameAttr+" onclick='return false;' ></a>");
                    }
                }
                return myImageLink;
            },
            attachLinkToText:function(){
                 var postBackupLink = "";
                 var myTextLink = "";
                 postBackupLink = this.getLink(); 
                 var target = this.getTarget();
                 var targetAttr = "";
                 if(target){
                     targetAttr = "target='"+target+"'";
                 }
                 
                var linkNameAttr = "";
                var linkName = this.getLinkName();
                if(linkName){
                    linkNameAttr = "name='"+linkName+"'";
                }
                this.meeIframeWindow.﻿tinyMCE.activeEditor.﻿selection.moveToBookmark(this.selection);
                this.tiny_editor_selection = this.meeIframeWindow.tinyMCE.activeEditor.selection;
                var selected_node = this.tiny_editor_selection.getNode();
                var selected_color = 'color:inherit';
                //var selected_text_decoration = this.$("input.checkinput:checked").length?'text-decoration:underline;':'';
                var selected_text_decoration = '';
                //console.log(selected_node);
                //console.log($(this.tiny_editor_selection.getStart()).children().length);
                if(($(this.tiny_editor_selection.getStart()).children().length > 0) && (this.tiny_editor_selection.getStart().nodeName.toLowerCase() !== "span" && this.tiny_editor_selection.getStart().nodeName.toLowerCase() !=="a")){
                    
                    //if($(this.tiny_editor_selection.getStart()).find('a').text()==this.$("."+this.activeTab+"Div textarea.linkTextArea").val().trim()){
                       if($(this.tiny_editor_selection.getStart()).find('a').length > 0 && this.tiny_editor_selection.getContent().indexOf('href=') > -1) {
                           selected_node = $(this.tiny_editor_selection.getStart()).find('a')[0];
                       }
                    //}
                }
                if(selected_node){
                    if(selected_node.style && selected_node.style.color){
                        selected_color = "color:"+selected_node.style.color+";";
                    }
                    var parent_table = $(selected_node).parents("table");
                    if(parent_table.length && parent_table.eq(0)[0].style.borderRadius){
                        selected_text_decoration = '';
                    } 
                    
                    if(selected_node.nodeName ==="B" || $(selected_node).find("b").length){
                        selected_text_decoration = selected_text_decoration + "font-weight:bold;";
                    }
                }
                 if(!postBackupLink){return false}
                 
                 myTextLink = "<a class='MEE_LINK' href='" + postBackupLink + "' "+targetAttr+" "+linkNameAttr+" style='"+selected_text_decoration+selected_color+"'>" + this.$("."+this.activeTab+"Div textarea.linkTextArea").val() + "</a>";
                 
                 /*if(selected_element_range != null) {
                    tiny_editor_selection.setRng(selected_element_range);
                    selected_element_range = null;
                 }*/
                
                if (selected_node.nodeName == "a" || selected_node.nodeName == "A") {                    
                    selected_node.setAttribute("href", postBackupLink);
                    if(target){ 
                        selected_node.setAttribute("target", target);
                    }
                    else{
                        selected_node.removeAttribute("target")
                    }
                    if(linkName){
                        selected_node.setAttribute("name", linkName);
                    }
                    else{
                        selected_node.removeAttribute("name")
                    }
                    if(this.$("."+this.activeTab+"Div textarea.linkTextArea").val()){
                        selected_node.innerHTML = this.$("."+this.activeTab+"Div textarea.linkTextArea").val();
                    }
                    if(this.$("input.checkinput:checked").length){
                      if(selected_node.parentNode.nodeName.toLowerCase()=="font"){
                            $(selected_node.parentNode).addClass('underline');
                        }else{
                            selected_node.style.textDecoration = "underline";
                        }
                        
                    }
                    else{
                      
                          $(selected_node.parentNode).removeClass('underline');
                          selected_node.style.textDecoration = "none";  
                       
                        
                        //$(selected_node).unwrap();
                    }
                }
                else { 
                    if(this.$("input.checkinput:checked").length){
                        myTextLink = '<font class="underline" style="text-decoration:underline">'+myTextLink+'</font>';
                    }
                    
                    this.tiny_editor_selection.setContent(myTextLink);
                }
                //tinymce.activeEditor.focus();               
                return postBackupLink;
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
             setSocialRadio:function(selectedLink){                
                var socialLink = "";
                if(selectedLink==this.systemLinks.socialFacebookLink){
                    socialLink = "facebook";
                }
                 else if(selectedLink==this.systemLinks.socialTwitterLink){
                    socialLink = "twitter";
                }
                 else if(selectedLink==this.systemLinks.socialLinkedInLink){
                    socialLink = "linkedin";
                }
                 else if(selectedLink==this.systemLinks.socialPintrestLink){
                    socialLink = "pintrest";
                }
                 else if(selectedLink==this.systemLinks.socialGooglePlusLink){
                    socialLink = "googleplus";
                }
                this.$(".radiopanel:checked").prop("checked",false);
                this.$("input[value='"+socialLink+"']").prop("checked",true);
                
            },
            getSocialLinks:function(){
                var selectedLink =  this.$(".radiopanel:checked");
                var socialLink = "";
                if(selectedLink.val()=="facebook"){
                    socialLink = this.systemLinks.socialFacebookLink;
                }
                 else if(selectedLink.val()=="twitter"){
                    socialLink = this.systemLinks.socialTwitterLink;
                }
                 else if(selectedLink.val()=="linkedin"){
                    socialLink = this.systemLinks.socialLinkedInLink;
                }
                 else if(selectedLink.val()=="pintrest"){
                    socialLink = this.systemLinks.socialPintrestLink;
                }
                 else if(selectedLink.val()=="googleplus"){
                    socialLink = this.systemLinks.socialGooglePlusLink;
                }
                return socialLink;
            },
            getURL:function(noName){
                    var link = "";
                    var _hyperlinkInput = this.$("input.linkHyperLinkURL");
                    //var linkName = this.$("input.linkName").val();
                    //var lineNameStr = linkName?"?campaignkw=" + linkName:"";   
                    var lineNameStr ="";
                    /*if(linkName){
                        lineNameStr = $.trim(_hyperlinkInput.val()).indexOf("?")>-1 ? "&campaignkw=" + linkName : "?campaignkw=" + linkName;
                    }
                    else{
                        lineNameStr = "";
                    }*/
                    
                    
                    if(noName){
                        //set url without link name param
                        lineNameStr = "";
                    }
                    var url_val = $.trim(_hyperlinkInput.val());
                    if(url_val!=="" && (/\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i.test(url_val) || url_val=="#" || /^{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}/i.test(url_val))){
                        if(url_val!=="#" && /^{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}/i.test(url_val)==false){ 
                            if ( url_val.startsWith("http://")){
                                link = url_val + lineNameStr;
                            }
                            else if( (url_val).startsWith("https://") ){
                                link = url_val + lineNameStr;
                            }
                            else{    
                                link = "http://" + url_val + lineNameStr;
                           }
                       }
                       else{
                           if(/^{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}/i.test(url_val)==true){
                               link = url_val;
                           }
                           else{
                                link ="#";
                           }
                       }
                   }
                   else{
                       this.app.showError({
                            control:this.$('.url-container'),
                            message:'Please provide a valid URL.'
                         });
                       link = false;
                   }
                   return link;
            },
            getEmail:function(){
                var link = "";
                var emailLink = $.trim(this.$("#emailLinkName").val());
                var emailSubject = $.trim(this.$("#emailLinkSubject").val());
                var emailSubjectStr = emailSubject ?("?subject="+emailSubject):"";
                if(emailLink && /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(emailLink)){
                    if (emailLink.startsWith("mailto:")){
                        link = emailLink+emailSubjectStr;
                    }
                    else{
                        link = "mailto:"+emailLink+emailSubjectStr;
                    }
                }
                else{
                    this.app.showError({
                            control:this.$('.email-container'),
                            message:'Please provide a valid email address.'
                         });
                    link = false;
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
                this.$(".visitlink").attr("href",$(e.target).text());
                $(".existinglinksdd").remove();
            }
            ,
            getExistingLinks:function(){
                var anchors = this.editorEl.find(".csHaveData a");
                var _array =  [];
                var _a_href = "",showName="";
                var merge_field_patt = null;
                _.each(anchors,function(obj){
                    if($(obj).attr("href")){
                        _a_href = $(obj).attr("href"); 
                        showName = $.getUrlVar(_a_href,'campaignkw');
                        merge_field_patt = new RegExp("{{[A-Z0-9_-]+(?:(\\.|\\s)*[A-Z0-9_-])*}}","ig");
                        if(_a_href !=="#" && $.trim(_a_href)!=="" && _a_href.startsWith("mailto:")==false && merge_field_patt.test(_a_href)===false){
                            _array.push(_a_href.replace("?campaignkw="+showName,""));
                        }
                    }
                },this)
                return _array;
            }            
            
        });
});