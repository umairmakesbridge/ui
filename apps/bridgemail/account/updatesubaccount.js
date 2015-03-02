define(['text!account/html/updatesubaccount.html','account/collections/salesrep','account/salesrep_selection_row','jquery.icheck'],
        function (template,salesrepCollection,salesrepRow) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'manage_account row-fluid',                
                events: {                    
                },
                initialize: function () {
                    this.template = _.template(template);                       
                    this.user_id = this.options.user_id;                        
                    this.salesrepRequest = new salesrepCollection();                      
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));
                    this.app = this.options.sub.app;
                    this.$salesrepContainer = this.$("._salesrep_grid tbody")
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    this.$('.btnunchecked input.checkpanel').iCheck({
                        checkboxClass: 'checkpanelinput',
                        insert: '<div class="icheck_line-icon" style="margin:5px 0 0 5px"></div>'
                    });
                                       
                },
                init: function () {      
                   this.loadSalesRep();                   
                },
                loadSubAccount:function(){
                    var bms_token = this.app.get('bms_token');                    
                    this.app.showLoading("Loading Sub Account Details...", this.$el);
                    var URL = "/pms/io/user/getData/?BMS_REQ_TK=" + bms_token + "&type=operatorDetail&opUserId="+this.user_id;
                    jQuery.getJSON(URL, _.bind(function(tsv, state, xhr) {
                        this.app.showLoading(false, this.$el);                        
                        var _json = jQuery.parseJSON(xhr.responseText);
                        if (this.app.checkError(_json)) {
                            return false;
                        }
                        this.$(".user-id").val(_json.userId);
                        this.$(".account-type").html(_json["account-type"]=="O"?"Operator":"Master");
                                                                        
                        this.$(".acc-email").val(this.app.decodeHTML(_json.userEmail));                        
                        this.$(".acc-firstname").val(this.app.decodeHTML(_json.firstName));                        
                        this.$(".acc-lastname").val(this.app.decodeHTML(_json.lastName));                        
                        this.$(".acc-telephone").val(this.app.decodeHTML(_json.phone));                        
                        this.$(".acc-url").val(this.app.decodeHTML(_json.url));                        
                        this.$(".acc-company").val(this.app.decodeHTML(_json.customerName));                        
                        this.$(".acc-unsubscribed-logo").val(this.app.decodeHTML(_json.customerLogo));                        
                        this.$(".acc-addressline1").val(this.app.decodeHTML(_json.address1));                        
                        this.$(".acc-addressline2").val(this.app.decodeHTML(_json.address2));                        
                        
                        
                        this.postObject['senderName']= this.app.decodeHTML(_json.senderName);
                        this.postObject['fromEmail']= this.app.decodeHTML(_json.fromEmail);                        
                        this.postObject['replyToEmail']= this.app.decodeHTML(_json.replyToEmail);
                        
                        this.postObject['webAddress']= this.app.decodeHTML(_json.webAddress);
                        this.postObject['hasSFDataSyncAccess']= this.app.decodeHTML(_json.hasSFDataSyncAccess);                   
                                                                                                                
                    },this))  
                },
                updateSubAccount: function(dialog){
                    var _type = this.user_id ? "updateOperator":"addOperator";
                    var URL = "/pms/io/user/setData/?BMS_REQ_TK="+this.app.get('bms_token');                               
                    $.post(URL, {"type":_type,opUserId:this.$(".subacc-userid").val(),email:this.$(".subacc-email").val()
                                ,firstName:this.$(".subacc-userid").val(),lastName:this.$(".subacc-email").val()
                                ,phone:this.$(".subacc-userid").val(),address1:this.$(".subacc-email").val()
                                ,address2:this.$(".subacc-userid").val(),url:this.$(".subacc-email").val()
                                ,senderName:this.$(".subacc-userid").val(),webAddress:this.$(".subacc-email").val()
                                ,fromEmail:this.$(".subacc-userid").val(),replyTo:this.$(".subacc-email").val()
                                ,salesRep:[],pass1:"",pass2:"",appId:[]})
                      .done(_.bind(function(data) {                                                          
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){                                                                         
                              dialog.close();
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);
                          }							                            
                     },this));
                    
                    
                },
                loadSalesRep:function(){
                    var remove_cache = false;      
                    this.offset = 0;
                    var _data = {offset:this.offset,type:'allSalesreps'};                                        
                    this.salesrepRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                            // Display items
                            if(this.app.checkError(response)){
                                return false;
                            }
                            this.$salesrepContainer.children().remove();
                            for(var s=this.offset;s<collection.length;s++){
                                var salesrepView = new salesrepRow({ model: collection.at(s),sub:this });                                                                                            
                                this.$salesrepContainer.append(salesrepView.$el);                               
                            }     
                            if(this.user_id){
                                this.loadSubAccount();                   
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                  });
                }
                
            });
        });
