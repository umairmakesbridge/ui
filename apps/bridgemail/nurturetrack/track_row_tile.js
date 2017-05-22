define(['text!nurturetrack/html/track_row_tile.html','common/tags_row'],
function (template,tagView) {
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
              'click .filterNT':'filterNT',
              'click .pause-track':'pauseNurtureTrack',
              'click .message-view':'viewNurtureTrack',
              'click .report-bar':'reportNT'   
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.parent = this.options.sub                    
                    this.app = this.parent.app;
                    this.template = _.template(template);				                    
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
                this.showTagsTemplate();
            },
            showTagsTemplate:function(){
                 this.tmPr =  new tagView(
                                   {parent:this,
                                    app:this.app,
                                    parents:this.parent,
                                    type:'NT',
                                    tagSearchCall:_.bind(this.tagSearch,this),
                                    rowElement: this.$el,
                                    helpText : 'Tracks',
                                    tags:this.model.get('tags')});
                      this.$('.t-scroll').append(this.tmPr.$el);
                },
            tagSearch:function(val){
                this.trigger('tagclicktile',val);
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
                var editable = true;
                var kill = false;
                if(this.model.get("status")=="K"){
                    kill = true;
                    editable = false;
                }
                else if(this.model.get("status")!=="D"){
                    editable = false;
                }                
                this.app.mainContainer.openNurtureTrack({"id":this.model.get("trackId.encode"),"checksum":this.model.get("trackId.checksum"),"parent":this.parent,editable:editable,kill:kill});
                
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
                            this.app.showMessge("Nurture track played successfully.");
                            //this.parent.callDispenseStats(this.model.get("trackId.encode"),this.model.get("trackId.checksum"));
                            this.parent.fetchTracks();   
                            this.parent.addCountHeader();
                       }
                       else{
                           this.app.showAlert(_json.err1,$("body"),{fixed:true}); 
                       }
               },this));
            }
            ,
            filterNT : function(ev){
                if($(ev.target).hasClass('ntpauselist')){
                    this.parent.showPauseTracks();
                }else if($(ev.target).hasClass('ntkilllist')){
                    this.parent.showKillTracks($(ev.target));
                }else if($(ev.target).hasClass('ntplaylist')){
                    this.parent.showPlayTracks($(ev.target));
                }
            },
            pauseNurtureTrack:function(){
                var mHtml = '<div class="messagebox messagebox_ delete pause-kill-dialog" style="width: 550px;"><h3>Pause or Kill nurture track</h3><i class="close showtooltip" data-original-title="Close Dialog"></i>';
                        mHtml += '<div class="left-panel">';
                        mHtml += '<p><span>||</span>By pausing Nurture track, you will able to play it any time.</p>';
                        mHtml += '<div class="btns pull-right" style="margin: 74px 20px 0px;"><a class="btn-blue btn-ok"><span>Pause</span><i class="icon pause"></i></a></div></div>';
                        mHtml += '<div class="right-panel" >';
                        mHtml += '<p style="padding: 0px 10px; text-align: justify; line-height: 15px;"><span>X</span>By Killing Nuture track, every operation on Nuture track will be stopped immediately and you will not able to Play it again. But you can perform other operations i.e copy</p><div class="btns pull-right"><a class="btn-red btn-cancel btn-kill" style="margin-left: 10px;"><span>&nbsp;&nbsp;Kill&nbsp;&nbsp;</span><i class="icon cross"></i></a></div>';
                        mHtml += '</div><div class="clearfix"></div></div>';
                    var obmHtml = $(mHtml);
                    this.$el.parents('body').append('<div class="overlay"></div>');
                    this.$el.parents('body').append(obmHtml);
                    obmHtml.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                    // Close dialog
                    obmHtml.find('.close').click(_.bind(function(){
                        this.$el.parents('body').find('.overlay').remove();
                        this.$el.parents('body').find('.pause-kill-dialog').remove();
                    },this));
                    // Pause NT
                    obmHtml.find('.btn-ok').click(_.bind(function(){
                        this.pauseKillNurtureTrack('pause');
                    },this));
                    // Kill NT
                    obmHtml.find('.btn-kill').click(_.bind(function(){
                        this.pauseKillNurtureTrack('kill');
                    },this));
                
                
                
                
                /*this.app.showLoading("Pausing Nurture Track...",this.parent.$el);
                var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                $.post(URL, {type:'pause',trackId:this.model.get("trackId.encode")})
                .done(_.bind(function(data) {                  
                       this.app.showLoading(false,this.parent.$el);   
                       var _json = jQuery.parseJSON(data);        
                       if(_json[0]!=='err'){
                           this.app.showMessge("Nurture track paused successfully.");
                            this.parent.fetchTracks();   
                            this.parent.addCountHeader();
                       }
                       else{
                           this.app.showAlert(_json[0],$("body"),{fixed:true}); 
                       }
               },this));*/
            },
            pauseKillNurtureTrack : function(type){
                    var killtype = false;
                   if(type=='pause'){
                       var msg = "Pausing Nurture Track...";
                   }else{
                       var msg = "Killing Nurture Track...";
                       killtype = true;
                   }
                   
                   this.$el.parents('body').find('.overlay').remove();
                   this.$el.parents('body').find('.pause-kill-dialog').remove(); 
                   this.app.showLoading(msg,this.$el);
                    var URL = "/pms/io/trigger/saveNurtureData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'pause',trackId:this.model.get("trackId.encode"),kill:killtype})
                    .done(_.bind(function(data) {                  
                           this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){
                               if(type=='pause'){
                                   this.app.showMessge("Nurture track paused.");
                                   this.editable = true;
                               }else{
                                   this.app.showMessge("Nurture track killed.");
                                   this.editable = false;
                                   this.isKillNT = true;
                               }
                               
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
                this.app.showLoading("Loading...",this.parent.$el,{fixed:'fixed'});
                require(["nurturetrack/track_view"],_.bind(function(page){    
                     this.app.showLoading(false,this.parent.$el);                    
                     var view_page = new page({page:this});                       
                     $("body").append(view_page.$el);        
                     view_page.init();
                 },this));
            }
            
        });
});