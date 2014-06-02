define(['text!nurturetrack/html/track_row_makesbridge_tile.html','jquery.highlight','jquery.customScroll'],
function (template,highlighter) {
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
              'click .edit-track':'copyNurtureTrack'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.sub
                    this.app = this.parent.app;
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
                   var tags = this.model.get('tags');
                   var tag_array = tags.split(",");
                   var elipsisflag = true;
                   var tag_html ="";
                    $.each(tag_array,function(key,val){
                        if(tag_array.length > 8 && key > 6){
                            if(elipsisflag){
                            tag_html +='<i class="ellipsis">...</i>';
                            elipsisflag = false;
                            }
                        }
                        if(val.length > 8 ){
                          //tag_html +="<a class='showtooltip temp-tag trim-text' title='Click to View Track With <strong>&#39;"+val+"&#39;</strong>  Tag'>"+val+"</a>";                            
                          tag_html +="<a class='temp-tag trim-text'>"+val+"</a>";                            
                        }else{
                        //tag_html +="<a class='showtooltip tag temp-tag' title='Click to View Track With <strong>&#39;"+val+"&#39;</strong> Tag'>"+val+"</a>";
                        tag_html +="<a class='tag temp-tag'>"+val+"</a>";
                        }
                        
                    });
                    return tag_html; 
                },
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
            } ,
            viewNurtureTrack:function(){
                this.app.showLoading("Loading...",this.parent.$el);
                require(["nurturetrack/track_view"],_.bind(function(page){    
                     this.app.showLoading(false,this.parent.$el);                    
                     var view_page = new page({page:this});                       
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