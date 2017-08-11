define(['text!nurturetrack/html/track_row.html','nurturetrack/copynurturetrack', 'nurturetrack/track_view'],
function (template, copyTrackPage, pageTrackView) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nurture track View to show on listing page
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'tr',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .delete-track':'deleteNutureTrack',
              'click .edit-track':'editNurtureTrack',
              'click .copy-track':'copyNurtureTrack',
              'click .play-track':'playNurtureTrack',
              'click .pause-track':'pauseNurtureTrack',
              'click .campaign_stats':'reportNT',
              'click .filterNT':'filterNT',
              'click .message-view':'viewNurtureTrack',
              'click .show-detail':'previewMessage',
              'click .tag':'tagSearch',
              'click .row-move': 'addRowToCol2',
              'click .row-remove': 'removeRowToCol2',
              'click .check-box': 'checkUncheck',
              'click .message-stats':'reportShow'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.parent = this.options.sub;      
                    this.app = this.parent.app;
                    this.showUseButton = this.options.showUse;
                    this.showRemoveButton = this.options.showRemove;
                    this.showCheckbox = this.options.showCheckbox;
                    this.maxWidth = this.options.maxWidth?this.options.maxWidth:'auto';
                    this.showSummaryChart = this.options.showSummaryChart;
                    this.singleSelection = this.options.singleSelection;
                    this.showMessage = this.options.showMessage;                    
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
                if(this.showUseButton){
                    this.$el.attr("data-checksum",this.model.get("trackId.checksum"));
                }
                else if(this.showMessage){
                    this.$el.attr("data-checksum",this.model.get("campNum.checksum"));
                }
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
            tagSearch:function(obj){
                this.trigger('tagclick',$(obj.target).text());
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
                //require(["nurturetrack/copynurturetrack"],_.bind(function(copyTrackPage){                                     
                    var mPage = new copyTrackPage({page:this,copydialog:dialog});
                    dialog.getBody().html(mPage.$el);
                    mPage.init();
                    dialog.saveCallBack(_.bind(mPage.copyTrack,mPage));
                //},this));
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
            reportNT:function(obj){
                this.parent.showStates(obj,this.model);
            }
            ,
            viewNurtureTrack:function(){
                this.app.showLoading("Loading...",this.parent.$el);
                //require(["nurturetrack/track_view"],_.bind(function(pageTrackView){    
                     this.app.showLoading(false,this.parent.$el);                    
                     var view_page = new pageTrackView({page:this});                       
                     $("body").append(view_page.$el);        
                     view_page.init();
                 //},this));
            },
            addRowToCol2: function () {
                if (this.showUseButton && !this.singleSelection) {
                    this.$el.fadeOut("fast", _.bind(function () {
                        this.parent.addToCol2(this.model);
                        this.$el.hide();
                    }, this));
                }
                else if(this.showUseButton && this.singleSelection){
                    this.parent.addTo(this.model);
                }
            },
            removeRowToCol2: function () {
                if (this.showRemoveButton) {
                    this.$el.fadeOut("fast", _.bind(function () {
                        this.parent.adToCol1(this.model);
                        this.$el.remove();
                    }, this));
                }
            },
            checkUncheck: function (obj) {
                var addBtn = $.getObj(obj, "a");
                if (addBtn.hasClass("unchecked")) {
                    addBtn.removeClass("unchecked").addClass("checkedadded");
                }
                else {
                    addBtn.removeClass("checkedadded").addClass("unchecked");
                }
                if (this.parent.createNurtureTrackChart) {
                    this.parent.createNurtureTrackChart();
                }
            },getTimeShow: function () {
                    var datetime = '';
                    var dtHead = '';
                    var dateFormat = '';
                    if (this.model.get('status') == 'P' || this.model.get('status') == 'S')
                    {
                        dtHead = 'Schedule Date';
                        datetime = this.model.get('scheduledDate');
                    }
                    else if (this.model.get('status') == 'C')
                    {
                        dtHead = 'Sent Date';
                        datetime = this.model.get('scheduledDate');
                    }
                    else if (this.model.get('status') == 'D')
                    {
                        dtHead = 'Last Edited';
                        if (this.model.get('updationDate'))
                            datetime = this.model.get('updationDate');
                        else
                            datetime = this.model.get('creationDate');
                    }
                    else {
                        dtHead = 'Last Edited';
                        if (this.model.get('updationDate'))
                            datetime = this.model.get('updationDate');
                        else
                            datetime = this.model.get('creationDate');
                    }
                    if (datetime)
                    {
                        var date = moment(this.app.decodeHTML(datetime), 'YYYY-M-D H:m');
                        dateFormat = date.format("DD MMM, YYYY");
                        if (this.model.get('status') == 'S' || this.model.get('status') == 'P') {
                            dateFormat = date.format("DD MMM, YYYY<br/>hh:mm A");
                        }
                    }
                    else {
                        dateFormat = '';
                    }
                    return {dtHead: dtHead, dateTime: dateFormat}
                }
             ,previewMessage:function(){
                var camp_id = this.model.get('campNum.encode');                
                var isTextOnly = this.model.get('isTextOnly');                			
                var dialog_width = $(document.documentElement).width() - 60;
                var dialog_height = $(document.documentElement).height() - 146;
                var dialog = this.app.showDialog({title: 'Message Preview of &quot;' + this.model.get('subject') + '&quot;',
                    css: {"width": dialog_width + "px", "margin-left": "-" + (dialog_width / 2) + "px", "top": "10px"},
                    headerEditable: false,
                    headerIcon: 'dlgpreview',
                    bodyCss: {"min-height": dialog_height + "px"}
                });
                this.app.showLoading("Loading Message HTML...", dialog.getBody());
                var preview_url = "https://" + this.app.get("preview_domain") + "/pms/events/viewcamp.jsp?cnum=" + camp_id;
                require(["common/templatePreview"], _.bind(function (templatePreview) {
                    var tmPr = new templatePreview({frameSrc: preview_url, app: this.app, frameHeight: dialog_height, prevFlag: 'C', tempNum: camp_id, isText: isTextOnly}); // isText to Dynamic
                    dialog.getBody().html(tmPr.$el);
                    tmPr.init();
                }, this));
             },
                reportShow:function(){                                
                    var camp_id=this.model.get('campNum.encode');
                    this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id,messageNo:this.model.get("order"),trackName:this.model.get("subject"),trackId:this.model.get("trackId.encode"),messageId:this.model.get('messageId.encode')},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+this.model.get('campNum.checksum'),tab_icon:'campaign-summary-icon'});                
                }   
        });
});