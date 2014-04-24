define(['text!nurturetrack/html/nurturetrack.html'],
        function(template) {
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            //
            // Nurture Track detail page view depends on 
            //
            /////////////////////////////////////////////////////////////////////////////////////////////////////////
            'use strict';
            return Backbone.View.extend({               
                /**
                 * Attach events on elements in view.
                 */
                events: {
                    
                },
                /**
                 * Initialize view - backbone
                 */
                initialize: function() {                    
                    this.template = _.template(template);
                    this.render();
                },
                /**
                 * Render view on page.
                 */
                render: function() {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;
                    if (this.options.params && this.options.params.track_id) {
                        this.track_id = this.options.params.track_id;
                    }
                    this.initControls();
                    
                }
                ,
                /**
                 * Custom init function called after view is completely render in wrokspace.
                 */
                init: function() {
                   this.current_ws = this.$el.parents(".ws-content"); 
                   this.ws_header = this.current_ws.find(".camp_header .edited"); 
                   this.loadData();
                   

                },
                loadData:function(){
                   var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading Nurture Track Details...", this.$el);
                    var URL = "/pms/io/trigger/getNurtureData/?BMS_REQ_TK=" + bms_token + "&trackId=" + this.track_id + "&type=get";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.ws_header.find("#workspace-header").html(_json.name);
                        var workspace_id = this.current_ws.attr("id");
                        this.app.mainContainer.setTabDetails({workspace_id:workspace_id,heading:_json.name,subheading:"Nurture Track Detail"});
                    },this))  
                },
                /**
                 * Initializing all controls here which need to show in view.
                 */
                initControls: function() {

                   

                }

            });
        });