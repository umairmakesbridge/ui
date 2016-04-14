define(['text!account/html/bridgemailapis.html'],
        function (template) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'bridgemailapis setting-section',                
                events: {                    
                    'click .regenerate-key':'confirmRegenerate',
                    'click .open-help':'openHelp'
                },
                initialize: function () {
                    this.postObject = this.options.postObj;
                    this.template = _.template(template);   
                    this.app = this.options.app;
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.app;                    
                                        
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                },
                init: function () {                   
                   this.loadData();
                },
                loadData:function(){
                   var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading API Details...", this.$el);
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + bms_token + "&type=apiToken";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);                       
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.$(".api-key").val(_json.key);
                        this.$(".api-daily-limit").html(_json["dailCallLimit"]);
                        this.$(".api-today-call").html(_json["todayCallCount"]);                                                                                                                      
                        
                    },this))  
                },
                confirmRegenerate: function(e){
                  this.app.showAlertPopup({heading:'Confirm key generation',
                    detail:'This action will generate new API key causing old key to stop working for your current app. Are you sure you want to continue?',  
                    text: "Continue",
                    btnClass:"btn-yellow",
                    dialogWidth: "460px",
                    icon: "next",
                    callback: _.bind(function(){                                              
                            this.regenerateKey(e);                            
                        },this)
                    },
                    $('body'));   
                },
                regenerateKey: function(e){
                    var btn = $.getObj(e,"a");
                    if(btn.hasClass("saving")==false){
                        btn.addClass("saving");                        
                        var URL = "/pms/io/user/setData/?BMS_REQ_TK="+this.app.get('bms_token');                               
                        $.post(URL, {"type":"resetApiToken"})
                          .done(_.bind(function(data) {               
                              btn.removeClass("saving");                              
                              var _json = jQuery.parseJSON(data);                              
                              if(_json[0]!=="err"){                                                                         
                                   this.app.showMessge("Key updated Successfully!");               
                                   this.$(".api-key").val(_json.key);
                                   this.$(".api-daily-limit").html(_json["dailCallLimit"]);
                                   this.$(".api-today-call").html(_json["todayCallCount"]);
                              }
                              else{                                  
                                  this.app.showAlert(_json[1],this.$el);
                              }							                            
                         },this));
                    }
                },
                openHelp:function(){
                    window.open('/pms/help/BMSAPIHelp.html','_blank','width=850,height=450,left=200,top=200,screenX=200,screenY=200,resizable=yes,scrollbars=yes');
                }
            });
        });
