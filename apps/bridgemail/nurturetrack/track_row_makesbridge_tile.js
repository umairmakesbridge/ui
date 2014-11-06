define(['text!nurturetrack/html/track_row_makesbridge_tile.html','jquery.highlight','common/tags_row','jquery.customScroll'],
function (template,highlighter,tagView) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nurture track Makesbridge View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'li',
            /**
             * Attach events on elements in view.
            */
            events: {              
              'click .use-track':'copyNurtureTrack',
              'click .previewbtn':'viewNurtureTrack',
              'click .edit-track':'copyNurtureTrack',
              'click .message-view':'viewNurtureTrack'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                this.parent = this.options.sub                    
                this.app = this.parent.app;
                this.template = _.template(template);				                
                this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                    
                
                this.$el.html(this.template({
                    model: this.model
                }));      
                var _$this = this;
                $( window ).scroll(function() {
                   if(_$this.isTrim){
                       _$this.collapseTags(window);
                   }
                });
                this.initControls();  
               
            },
            /**
             * Render Row view on page.
            */
            renderRow:function(){
                
            },
            showTagsTemplate:function(){
                   this.tmPr =  new tagView(
                                   {parent:this,
                                    app:this.app,
                                    parents:this.parent,
                                    rowElement: this.$el,
                                    type:'NT',
                                    tagSearchCall:_.bind(this.tagSearch,this),
                                    helpText : 'Tracks',
                                    tags:this.model.get('tags')});
                      this.$('.t-scroll').append(this.tmPr.$el);
                }
                ,
            tagSearch:function(val){
                this.trigger('tagbmsclicktile',val);
                return false;
            },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                this.showTagsTemplate();
            } ,
            viewNurtureTrack:function(){
                this.app.showLoading("Loading...",this.parent.$el);
                require(["nurturetrack/track_view"],_.bind(function(page){    
                     this.app.showLoading(false,this.parent.$el);                    
                     var view_page = new page({page:this,hideReport:"true"});                       
                     $("body").append(view_page.$el);        
                     view_page.init();
                 },this));
            },
            copyNurtureTrack:function(){                                 
                var dialog = this.app.showDialog({title:'Use Nurture Track Template',
                    css:{"width":"600px","margin-left":"-300px"},
                    bodyCss:{"min-height":"260px"},							   
                    headerIcon : 'copycamp',
                    buttons: {saveBtn:{text:'Use'} }                                                                           
                });
                this.app.showLoading("Loading...",dialog.getBody());
                require(["nurturetrack/copynurturetrack"],_.bind(function(copyTrackPage){                                     
                    var mPage = new copyTrackPage({page:this,copydialog:dialog});
                    dialog.getBody().html(mPage.$el);
                    mPage.init();
                    
                    dialog.saveCallBack(_.bind(mPage.copyTrack,mPage));
                },this));
            },
            expandTags: function(){
              this.$('.t-scroll' ).css('height', '155px');  
              this.$(".caption").animate({height:"250px"},250); 
	      this.$(".caption p i.ellipsis").hide(); 
              this.$(".caption p").css({'height':'auto','display':'block'});
	      this.$(".btm-bar").css({"position":"absolute","bottom":"0"});
	      this.$(".img > div").animate({bottom:"105px"});
              this.$('.t-scroll' ).mCustomScrollbar(); 
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
                        this.$(".t-scroll").mCustomScrollbar("destroy");
                        this.isTrim = false;
                        this.$('.t-scroll' ).removeAttr('style');
                        this.$(".caption").animate({height:"145px"},250);
                        this.$(".caption p i.ellipsis").show();
                        this.$(".caption p").removeAttr('style');
                        this.$(".btm-bar").removeAttr('style');
                        this.$(".img > div").removeAttr('style');
                   }
               }
              }
          }
            
        });
});