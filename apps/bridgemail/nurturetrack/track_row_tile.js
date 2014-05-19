define(['text!nurturetrack/html/track_row_tile.html','moment','jquery.highlight'],
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
              'click .pause-track':'pauseNurtureTrack'
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
                    model: this.model,
                    ntDate : this.getDate()
                }));                
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
                var _ele = $.getObj(obj,"div");
                var _stateDiv = this.parent.$(".nurture_msgslist");
                var left_minus = 92;
                var ele_offset = _ele.offset();                    
                var ele_height =  _ele.height();
                var top = ele_offset.top + ele_height - 134;
                var left = ele_offset.left-left_minus;      
                this.app.showLoading("Loading states...",_stateDiv.find(".states-area"));         
                require(["nurturetrack/report"],_.bind(function(report){                                    
                    var report_table = new report({page:this,stateDiv:_stateDiv});
                    _stateDiv.find(".states-area").html(report_table.$el);                    
                    report_table.init();
                    
                },this));                                   
                _stateDiv.css({"left":left+"px","top":top+"px"}).show();
                obj.stopPropagation();
                return false;
            }
            
        });
});