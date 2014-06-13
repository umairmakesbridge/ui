define(['text!nurturetrack/html/track_view.html','nurturetrack/collections/messages','nurturetrack/message_tile'],
function (template,messagesCollection,messageView) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Nurture track preview view
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({            
            tagName: 'div',
            className:'overlay',
            /**
             * Attach events on elements in view.
            */
            events: {
              'click .close':'closeView'
            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.messagesRequest = new messagesCollection();    
                    this.template = _.template(template);				
                    this.parent = this.options.page;
                    this.hideReport = this.options.hideReport;
                    this.app = this.parent.app;
                    this.trackId = this.parent.model.get("trackId.encode");
                    this.trackName = this.parent.model.get('name');
                    this.render();                    
            },
            /**
             * Render view on page.
            */
            render: function () {                                    
                this.$el.html(this.template({
                    name:this.trackName,
                    count:this.parent.model.get('msgCount')
                }));                
                this.initControls();                 
            },
            initControls:function(){
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
                $("body").css("overflow-y","hidden");
                this.$el.on("click",_.bind(this.closeView,this));
            },
            closeView:function(){
                this.$el.remove();
                if($("body > .overlay,.modal-backdrop").length==0){ 
                    $("body").css("overflow-y","auto");
                }                
            },
            init:function(){
                this.setSize();
                this.offset = 0;
                this.app.showLoading('Loading Messages...',this.$el); 
                var _data = {offset:this.offset,type:'get',trackId:this.trackId};
                this.message_request = this.messagesRequest.fetch({data:_data,remove:true,
                    success: _.bind(function (collection, response) {                                
                        // Display items
                        if(this.app.checkError(response)){
                            return false;
                        }
                        this.app.showLoading(false,this.$el);                                                                         
                        var camp_array = [];    
                        for(var s=this.offset;s<collection.length;s++){
                            var _model = collection.at(s);
                            var _view = new messageView({ model: _model,page:this });                                                            
                            this.$(".thumbnails").append(_view.$el);                                                                               
                            camp_array.push(_model.get("campNum.encode"));
                        }           
                        this.showMessageSubject(camp_array.join())
                                   
                    }, this),
                    error: function (collection, resp) {
                            
                    }
                });
            },
            setSize:function(){
                var _height = $(document.documentElement).height()-75;
                this.$(".message-container").css("height",_height+"px");
            },
            showMessageSubject:function(campagins){
                    var bms_token = this.app.get('bms_token');                    
                    //this.app.showLoading("Loading Nurture Track Details...", this.$el);
                    var URL = "/pms/io/campaign/getCampaignData/?BMS_REQ_TK=" + bms_token + "&campNum_csv=" + campagins + "&type=list_csv";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        //this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        _.each(_json.campaigns[0],function(val){
                            var subject = val[0]['subject']?val[0]['subject']:'&lt;subject line&gt;';
                            this.$("#"+val[0]["campNum.checksum"]).html(subject);
                        },this)
                        
                    },this))  
            }
            
        });
});