define(['text!nurturetrack/html/message_tile.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nurture track preview view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'li',
            className:'span3',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .previewmsg':'campDetails',
              'click .report':'reportShow'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                this.parent = this.options.page       
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
                this.initControls();                 
            },
            initControls:function(){
              this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
            },
            campDetails:function(e){
               //?BMS_REQ_TK=QxwRFLs31lNbcAKSEI8r94ttY4wQ51&campNum=zdTyioHn17Lo20Ln21Oh30Si33zdTyio&type=basic
                var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + this.app.get('bms_token') + "&type=basic&campNum="+this.model.get("campNum.encode");
                var _this = this;
                    jQuery.getJSON(URL, function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            var defaults_json = jQuery.parseJSON(xhr.responseText);
                            if (_this.app.checkError(defaults_json)) {
                                return false;
                            }
                            _this.messagePreview(defaults_json);
                        }
                    }).fail(function () {
                        console.log("error in detauls");
                    });
                  e.stopPropagation();
            },
            messagePreview:function(defaults_json){
                var camp_id = this.model.get("campNum.encode");                                		
                var dialog_width = $(document.documentElement).width()-60;
                var dialog_height = $(document.documentElement).height()-182;
                var dialog = this.app.showDialog({title:'Message Preview' ,
                                  css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                                  headerEditable:false,
                                  headerIcon : 'dlgpreview',
                                  bodyCss:{"min-height":dialog_height+"px"}
                });	
                dialog.$el.css("z-index","10010");
                this.app.showLoading("Loading Message HTML...",dialog.getBody());									
                var preview_url = "https://"+this.app.get("preview_domain")+"/pms/events/viewcamp.jsp?cnum="+camp_id;  
                require(["common/templatePreview"],_.bind(function(templatePreview){
                var tmPr =  new templatePreview({frameSrc:preview_url,app:this.app,frameHeight:dialog_height,prevFlag:'C',tempNum:camp_id,isText:defaults_json.isTextOnly}); // isText to Dynamic
                 dialog.getBody().html(tmPr.$el);
                 tmPr.init();
               },this));
            },
            reportShow:function(){                
                //this.parent.closeView();
                var camp_id=this.model.get('campNum.encode');
                this.app.mainContainer.addWorkSpace({params: {camp_id: camp_id,messageNo:this.model.get('triggerOrder'),trackName:this.parent.trackName,trackId:this.parent.trackId},type:'',title:'Loading...',url:'reports/summary/summary',workspace_id: 'summary_'+this.model.get('campNum.checksum'),tab_icon:'campaign-summary-icon'});                
            }
            
        });
});