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
                'change .linkHyperLinkURL':'previewLink'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.editorEl = this.options._el;
                    this.hiddenObj = $(this.editorEl.find("#imageDataSavingObject").data("myWorkingObject"));
                    this.activeTab = "_addHyperLink";
                    this.template = _.template(template);	
                    this.linkType = this.editorEl.find("#linkTrack").data("linkObject");
                    this.render();                             
            },
            /**
             * Render view on page.
            */
            render: function () {                  
                this.$el.html(this.template({
                    model: this.model,
                    showWait: this.showWait
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
                
                dialog.hide();
                
            },
            showHyperLink:function(){
                this.$("div.linkImagePreview").show();
                this.$("div.textAreaDivfortextLink").hide();
                this.activeTab = "_addHyperLink";
                var imgObj = this.hiddenObj.is("img")?this.hiddenObj:this.hiddenObj.find("img");
                this.$("img").attr("src", imgObj.attr("src"));
                if (this.linkType == "image") {
                    if(imgObj.parent().is("a")){
                        this.showLinkDetails(imgObj);
                    }
                }
            },
            showLinkDetails:function(imgObj){
                var _a = imgObj.parent();
                var _a_href = _a.attr("href");
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
            previewLink:function(){
                var link = this.getURL(true);
                this.$(".visitlink").attr("href",link);
            },
            getURL:function(noName){
                    var link = "";
                    var _hyperlinkInput = this.$("input.linkHyperLinkURL");
                    var linkName = this.$("input.linkName").val();
                    var lineNameStr = linkName?"?campaignkw=" + linkName:"";
                    if(noName){
                        lineNameStr = "";
                    }
                    if ( (_hyperlinkInput.val()).startsWith("http://")){
                        link = _hyperlinkInput.val() + lineNameStr;
                    }
                    else if( (_hyperlinkInput.val()).startsWith("https://") ){
                        link = _hyperlinkInput.val() + lineNameStr;
                    }
                    else{    
                        link = "http://" + _hyperlinkInput.val() + lineNameStr;
                   }
                   return link;
            }
            
            
            
        });
});