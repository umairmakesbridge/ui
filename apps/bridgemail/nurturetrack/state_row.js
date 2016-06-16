define(['text!nurturetrack/html/state_row.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // States row view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'tr',
            /**
             * Attach events on elements in view.
            */
            events: {
             'click .report':'reportShow',
             'click .preview-message':'previewMessage',
             'click .count-click':'countClick'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.parent = this.options.sub
                    this.app = this.parent.app;
                    this.messageNo = this.options.messageNo;
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                    
                
                this.$el.html(this.template({
                    model: this.model
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
            countClick:function(obj){
              var count=$.getObj(obj,"div");           
               //this.parent.parent.closeReport();
                var camp_id=this.model.get('campNum.encode');
                this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id,messageNo:this.messageNo,trackName:this.parent.model.get("name"),trackId:this.parent.model.get("trackId.encode"),clickType:count.attr("click-type")},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+this.model.get('campNum.checksum'),tab_icon:'campaign-summary-icon'});                
            },
            reportShow:function(){                                
                var camp_id=this.model.get('campNum.encode');
                this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id,messageNo:this.messageNo,trackName:this.parent.model.get("name"),trackId:this.parent.model.get("trackId.encode")},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+this.model.get('campNum.checksum'),tab_icon:'campaign-summary-icon'});                
            },
            previewMessage:function(){
                
                var camp_id = this.model.get("campNum.encode");                                		
                var dialog_width = $(document.documentElement).width()-60;
                var dialog_height = $(document.documentElement).height()-182;
                var dialog = this.app.showDialog({title:'Message Preview' ,
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgpreview',
                                  bodyCss:{"min-height":dialog_height+"px"}
                });	
                this.app.showLoading("Loading Message HTML...",dialog.getBody());									
                    var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                    require(["common/templatePreview"],_.bind(function(templatePreview){
                    var tmPr =  new templatePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:'N'}); // isText to Dynamic
                     dialog.getBody().html(tmPr.$el);
                 tmPr.init();
               },this));
            }
            
        });
});