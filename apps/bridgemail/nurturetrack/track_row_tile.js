define(['text!nurturetrack/html/track_row_tile.html','moment','jquery.highlight','jquery.customScroll'],
function (template,moment,highlighter) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nurture track View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'li',
            className:'spane3',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .delete-track':'deleteNutureTrack',
              'click .edit-track':'editNurtureTrack',
              'click .copy-track':'copyNurtureTrack',
              'click .play-track':'playNurtureTrack',
              'click .pause-track':'pauseNurtureTrack',
              'click .message-view':'viewNurtureTrack',
              'click .report-bar':'reportNT',
              'click .t-scroll p i.ellipsis':'expandTags',
              'mouseleave .thumbnail':'collapseTags'              
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.sub
                    this.app = this.parent.app;
                    this.isTrim = false;
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                    
                
                this.$el.html(this.template({
                    model: this.model,
                    ntDate : this.getDate()
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
            /**
             * Initializing all controls here which need to show in view.
            */
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
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
                          tag_html +="<a class='showtooltip temp-tag trim-text' title='Click to View Track With <strong>&#39;"+val+"&#39;</strong>  Tag'>"+val+"</a>";                            
                        }else{
                        tag_html +="<a class='showtooltip tag temp-tag' title='Click to View Track With <strong>&#39;"+val+"&#39;</strong> Tag'>"+val+"</a>";
                        }
                        
                    });
                    return tag_html; 
                },
            tagSearch:function(obj){
                this.trigger('tagclick',$(obj.target).html());
                return false;
            },
            deleteNutureTrack:function(){
                this.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this nurture track?",                                                
                            callback: _.bind(function(){													
                                    this.deleteTrack();
                            },this)},
                    this.parent.$el);                                                         
            },
            editNurtureTrack:function(){
                if(this.model.get("status")=="D"){
                    this.app.mainContainer.openNurtureTrack({"id":this.model.get("trackId.encode"),"checksum":this.model.get("trackId.checksum"),"parent":this.parent});
                }
                else{
                    this.viewNurtureTrack();
                }
                
            },
            deleteTrack:function(){
               this.app.showLoading("Deleting Nurture Track...",this.parent.$el);
               var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
               $.post(URL, {type:'delete',trackId:this.model.get("trackId.encode")})
                .done(_.bind(function(data) {                  
                       this.app.showLoading(false,this.parent.$el);   
                       var _json = jQuery.parseJSON(data);        
                       if(_json[0]!=='err'){
                            this.app.showMessge("Nurture track deleted.");
                            this.parent.fetchTracks();   
                            this.parent.addCountHeader();
                       }
                       else{
                           this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                       }
               },this));
            },
            copyNurtureTrack:function(){                                 
                var dialog = this.app.showDialog({title:'Copy Nurture Track',
                    css:{"width":"600px","margin-left":"-300px"},
                    bodyCss:{"min-height":"260px"},							   
                    headerIcon : 'copycamp',
                    buttons: {saveBtn:{text:'Create Nurture Track'} }                                                                           
                });
                this.app.showLoading("Loading...",dialog.getBody());
                require(["nurturetrack/copynurturetrack"],_.bind(function(copyTrackPage){                                     
                    var mPage = new copyTrackPage({page:this,copydialog:dialog});
                    dialog.getBody().html(mPage.$el);
                    mPage.init();
                    dialog.saveCallBack(_.bind(mPage.copyTrack,mPage));
                },this));
            },
            playNurtureTrack:function(){
                this.app.showLoading("Playing Nurture Track...",this.parent.$el);
                var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                $.post(URL, {type:'play',trackId:this.model.get("trackId.encode")})
                .done(_.bind(function(data) {                  
                       this.app.showLoading(false,this.parent.$el);   
                       var _json = jQuery.parseJSON(data);        
                       if(!_json.err){
                            this.parent.fetchTracks();   
                            this.parent.addCountHeader();
                       }
                       else{
                           this.app.showAlert(_json.err1,$("body"),{fixed:true}); 
                       }
               },this));
            }
            ,
            pauseNurtureTrack:function(){
                this.app.showLoading("Pausing Nurture Track...",this.parent.$el);
                var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                $.post(URL, {type:'pause',trackId:this.model.get("trackId.encode")})
                .done(_.bind(function(data) {                  
                       this.app.showLoading(false,this.parent.$el);   
                       var _json = jQuery.parseJSON(data);        
                       if(_json[0]!=='err'){
                            this.parent.fetchTracks();   
                            this.parent.addCountHeader();
                       }
                       else{
                           this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                       }
               },this));
            },
            getDate:function(){
                var dateUpdated = this.model.get('status')==='D'? this.model.get('updationDate'):this.model.get('lastPlayDate');
                var _date =  moment(dateUpdated,'M-D-YY');
                return _date.format("DD MMM YYYY")
            },
            reportNT:function(obj){
                this.parent.showStates(obj,this.model,80);
            },
            viewNurtureTrack:function(){
                this.app.showLoading("Loading...",this.parent.$el);
                require(["nurturetrack/track_view"],_.bind(function(page){    
                     this.app.showLoading(false,this.parent.$el);                    
                     var view_page = new page({page:this});                       
                     $("body").append(view_page.$el);        
                     view_page.init();
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