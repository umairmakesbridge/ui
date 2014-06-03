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
                 'click a':'tagsClick'
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
               if(this.parents.searchString.searchType ==="tag"){
                        var tagText = this.parents.searchString.searchText;
                        this.$("a").each(function(){
                           $(this).highlight(tagText);
                       });   
                    }    
            },
         
           tagsClick: function(obj){
                             var tag = $.getObj(obj,"a");
                             this.parents.$("#template_layout_menu li,#template_search_menu li").removeClass("active");  
                             this.parents.$('#search-template-input').val('');
                             this.parents.$('#clearsearch').hide();
                             this.parents.loadTemplates('search','tag',{text:tag.text()});  
          },
         
        });

});

