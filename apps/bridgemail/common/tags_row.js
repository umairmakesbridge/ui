/////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Single Model Tags 
//
/////////////////////////////////////////////////////////////////////////////////////////////////////////
define(['text!common/html/tags_row.html','jquery.highlight','jquery.customScroll'],
function (template,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber Record View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            tagName:'p',
            /**
             * Attach events on elements in view.
            */
            events: {
                 'click a':'tagsClick',
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.parent;
                    this.parents = this.options.parents;
                    this.app = this.options.app;
                    this.tags = this.options.tags;
                    this.rowElement = this.options.rowElement;
                    this.tagsplit = this.tags.split(",")
                    this.tagTxt = '';
                    this.tagCount = 0;
                    this.isTrim = false;
                    this.render();
                    //this.model.on('change',this.renderRow,this);
            },
              /**
             * Render view on page.
            */
            render: function () {                    
                this.$el.html(this.template({
                    model: this.tags
                }));
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                var _$this = this;
                $( window ).scroll(function() {
                    if(_$this.isTrim){
                        _$this.collapseTags(window);
                    }
                 });
                 if(this.rowElement){
                     this.rowElement.mouseout(_.bind(this.collapseTags,this));
                     this.rowElement.mouseout(_.bind(this.collapseTags,this));
                 }
//                this.parent.$('.t-scroll').find('i.ellipsis').click(_.bind(function(){
//                    this.expandTags();
//                },this));
//              
                this.initControls();  
               
            },
            /*
             * 
             * Template Render on Change
             */
            renderRow : function(){
                //console.log('Model Changed');
                this.render();
            },
            
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                if(this.options.type !== 'NT'){
               if(this.parents.searchString.searchType ==="tag"){
                        var tagText = this.parents.searchString.searchText;
                        this.$("a").each(function(){
                           $(this).highlight(tagText);
                       });   
                    }
                }
             
            },
         
           tagsClick: function(obj){
                             var tag = $.getObj(obj,"a");
                             this.parents.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                             this.parents.$('#search-template-input').val('');
                             this.parents.$('#clearsearch').hide();
                             this.parents.loadTemplates('search','tag',{text:tag.text()});  
          },
           trimTags : function(){
                 var isElipsis = true;
                 var totalTagsWidth = 0;
                
                  $.each(this.rowElement.find(".t-scroll p a"),_.bind(function(k,val){
                        totalTagsWidth = $(val).outerWidth() + parseInt(totalTagsWidth);
                        if(totalTagsWidth > 350){
                          if(isElipsis){
                               var eplisis = $('<i class="ellipsis">...</i><div class="clearfix"></div>');
                             $(val).before(eplisis);
                             eplisis.click(_.bind(this.expandTags,this));
                             isElipsis = false;
                          }
                        }
                    },this));
             },
            expandTags: function(){
              this.parent.$('.t-scroll' ).css('height', '155px');  
              this.parent.$(".caption").animate({height:"250px"},250); 
	      this.parent.$(".caption p i.ellipsis").hide(); 
	      this.parent.$(".caption p div.clearfix").hide(); 
              this.parent.$(".caption p").css({'height':'auto','display':'block'});
	      this.parent.$(".btm-bar").css({"position":"absolute","bottom":"0"});
	      this.parent.$(".img > div").animate({bottom:"105px"});
              this.parent.$('.t-scroll' ).mCustomScrollbar(); 
              this.isTrim = true;
          },
           collapseTags : function(e){
              if(this.isTrim){
                  var e;
                  if(e !== window){
                   e = e.toElement || e.relatedTarget;
                  }
                  //console.log(e.nodeName);
                  if(e){
                   if(e.nodeName === 'UL' || e == window){
                        this.rowElement.find(".t-scroll").mCustomScrollbar("destroy");
                        this.isTrim = false;
                        this.rowElement.find('.t-scroll' ).removeAttr('style');
                        this.rowElement.find(".caption").animate({height:"145px"},250);
                        this.rowElement.find(".caption p i.ellipsis").show();
                        this.parent.$(".caption p div.clearfix").show(); 
                        this.rowElement.find(".caption p").removeAttr('style');
                        this.rowElement.find(".btm-bar").removeAttr('style');
                        this.rowElement.find(".img > div").removeAttr('style');
                   }
               }
              }
          }
         
        });

});

