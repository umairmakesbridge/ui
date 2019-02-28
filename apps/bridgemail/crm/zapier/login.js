define(['text!crm/zapier/html/login.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({                
                events: {                   
                    'click .btnSaveLogin':'confirmRegenerate',
                    'click .copy-btn':'copyTextToClipBoard'
                 },
                initialize: function () {
                    this.template = _.template(template);				
                    this.app = this.options.app;
                    this.parent = this.options.page;                                                
                    this.render();    
                    this.loadData();
                        
                }
                ,
                render: function () {                        
                     this.$el.html(this.template({layout:this.layout}));                        
                     this.$("#mks_userid").val(this.app.get("user").userId);
                },
                loadData:function(){
                   var bms_token = this.app.get('bms_token');                                        
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + bms_token + "&type=apiToken";
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {                        
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.$(".api-key").val(_json.key);                        
                        
                    },this))  
                }
                ,
                confirmRegenerate: function(e){
                  this.app.showAlertPopup({heading:'Confirm key generation',
                    detail:'Warning, if you regenerate this key your current API connections will need to be updated with the new key. Are you sure you wish to proceed?',  
                    text: "Generate a Key",
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
                                   
                              }
                              else{                                  
                                  this.app.showAlert(_json[1],this.$el);
                              }							                            
                         },this));
                    }
                },
                copyTextToClipBoard: function(){
                    var copyText = this.$(".api-key")[0];                    
                    copyText.select();                    
                    document.execCommand("copy");
                    alert("API Key copied to clipboard");
                }
        });
});