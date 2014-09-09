define(['text!editor/html/links.html','jquery.icheck'],
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
                    this.app = this.options.app;
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
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
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
                    dialog.hide();      
                }
            },
            showHyperLink:function(){
               if (this.linkType == "image") { 
                this.$("div.linkImagePreview").show();
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
                    this.$("div.textAreaDivfortextLink").show();                    
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
                var _a_href = anchorObj.attr("href").toLowerCase();
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
                        _a_href = _a_href.replace("?campaignkw="+showName,"");
                    }
                    this.$("input.linkHyperLinkURL").val(_a_href);
                    this.$(".visitlink").attr("href",_a_href);
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
            attachLinkToImg:function(){
                var myImageLink = ""; 
                myImageLink = this.getLink();                
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
                return myImageLink;
            },
            attachLinkToText:function(){
                 var postBackupLink = "";
                 var myTextLink = "";
                 postBackupLink = this.getLink(); 
                 myTextLink = "<a class='MEE_LINK' href='" + postBackupLink + "' style='text-decoration:underline;'>" + this.$("."+this.activeTab+"Div textarea.linkTextArea").val() + "</a>";
                 
                 /*if(selected_element_range != null) {
                    tiny_editor_selection.setRng(selected_element_range);
                    selected_element_range = null;
                 }*/
                    
                if (this.tiny_editor_selection.getNode().nodeName == "a" || this.tiny_editor_selection.getNode().nodeName == "A") {                    
                    this.tiny_editor_selection.getNode().setAttribute("href", postBackupLink);
                }
                else {                    
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
                    var linkName = this.$("input.linkName").val();
                    var lineNameStr = linkName?"?campaignkw=" + linkName:"";                    
                    if(noName){
                        //set url without link name param
                        lineNameStr = "";
                    }
                    var url_val = $.trim(_hyperlinkInput.val());
                    if(url_val!=="" && (/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url_val) ||url_val=="#" )){
                        if(url_val!=="#"){ 
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
                           link ="#";
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