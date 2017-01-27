define(['text!common/html/shareObject.html','account/collections/subaccounts','account/subaccount_row'],
        function (template,subaccountCollection,subaccountRow) {
            'use strict';
            return Backbone.View.extend({
                tags: 'div',
                className:'manage_account row-fluid',                
                events: {                    
                },
                initialize: function () {       
                    this.app = this.options.app;
                    this.model = this.options.obj_model;
                    this.dialog = this.options.dialog;
                    this.template = _.template(template);                          
                    this.itemNum = this.options.itemNum;
                    this.parent = this.options.parent;
                    this.selectedUser = [];
                    var objectMap = {"1":"List","2":"Campaign","3":"Template"};
                    this.objectName = objectMap[this.itemNum];
                    this.subaccountRequest = new subaccountCollection();                      
                    this.render();
                },
                render: function ()
                {
                    this.$el.html(this.template({}));                    
                    this.$subaccountsContainer = this.$("._subaccount_grid tbody")
                    this.$(".showtooltip").tooltip({'placement': 'bottom', delay: {show: 0, hide: 0}, animation: false});
                    if(this.model.get("isShared")=="Y" || this.parent.status =="F"){
                        this.getSharedUsers();
                    }
                    else{
                        this.loadSubAccounts();             
                    }
                                     
                },
                init: function () {                         
                        
                },
                getSharedUsers: function(){
                    this.app.showLoading("Getting Sharing details...", this.dialog.$el);             
                    var params = "&type=mySharedCampaign&id=";
                    if(this.itemNum==1){
                        params = "&type=mySharedList&id=";
                    }
                    else if(this.itemNum==2){
                        params = "&type=mySharedCampaign&id=";
                    }
                    params = params +this.getObjectValue();
                    $.ajax({
                    dataType: "json",
                    url: "/pms/shareable/getShareableItem.jsp?BMS_REQ_TK="+this.app.get("bms_token")+params,                    
                    async: true,
                    success: _.bind(function (tsv, state, xhr) {
                        if (xhr && xhr.responseText) {
                            this.app.showLoading(false, this.dialog.$el);                     
                            var result = jQuery.parseJSON(xhr.responseText);
                            if (this.app.checkError(result)) {
                                return false;
                            }
                            if(result.shareDetails){
                                _.each(result.shareDetails[0],function(val,key){
                                    this.selectedUser.push(val[0].userId);
                                },this)
                            }
                            this.loadSubAccounts();             
                        }
                    },this)
                   });
                },
                loadSubAccounts:function(){
                    var remove_cache = false;      
                    this.offset = 0;
                    this.$subaccountsContainer.html('<tr class="loading-campagins"><td colspan="3"><div class="loadmore"><img src="img/loading.gif" alt=""/><p>Please wait, loading sub accounts...</p></div></td></tr>');
                    var _data = {offset:this.offset,type:'allOperators'};                                        
                    this.subaccountRequest.fetch({data:_data,remove: remove_cache,
                    success: _.bind(function (collection, response) {                                
                            // Display items
                            if(this.app.checkError(response)){
                                return false;
                            }                            
                            this.$subaccountsContainer.children().remove();
                            for(var s=this.offset;s<collection.length;s++){
                                var selectedUser = this.selectedUser.indexOf(collection.at(s).get("userId"))>-1?true:false;
                                var subaccountView = new subaccountRow({ model: collection.at(s),sub:this, hideSettings:1,selection:selectedUser });                                                                                            
                                this.$subaccountsContainer.append(subaccountView.$el);                               
                            }
                            if(collection.length==0){
                                this.$subaccountsContainer.before('<p class="notfound">No sub accounts found</p>');
                            }

                        }, this),
                        error: function (collection, resp) {

                        }
                    });
                },
                shareObject:function(){
                    var sharedUsers = this.$("._subaccount_grid input:checked").map(function() {return $(this).attr("data-subaccount");}).get();
                    var newUsers = _.difference(sharedUsers, this.selectedUser);
                    var unSharedUsers = _.difference(this.selectedUser,sharedUsers);
                    
                    var post_data = "";
                    var URL = "";
                    // Un share object from users 
                    if(unSharedUsers.length){
                        if(newUsers.length==0){
                            this.app.showLoading("Updating "+this.objectName+" Sharing...", this.dialog.$el); 
                        }
                        URL = "/pms/shareable/saveShareableItem.jsp?BMS_REQ_TK="+this.app.get('bms_token');        
                        post_data = {"type":"unshare","value":this.getObjectValue(),"users":unSharedUsers.join(","),"itemNum":this.itemNum};
                        $.post(URL, post_data)
                        .done(_.bind(function(data) {                                                          
                          this.app.showLoading(false, this.dialog.$el);                          
                          var _json = jQuery.parseJSON(data);          
                          if(newUsers.length==0){
                              this.app.showMessge(this.objectName+" updated Successfully!");  
                              this.dialog.hide();
                          }
                          if(sharedUsers.length==0){
                              if(this.parent.status =="F" && this.itemNum==1){
                                  this.parent.loadLists();
                              }
                              else{
                                this.model.set("isShared", 'N'); 
                              }
                              this.app.showMessge(this.objectName+" unshared Successfully!");  
                          }
                     },this));            
                    }
                    if(newUsers.length==0 && unSharedUsers.length==0){
                        this.dialog.hide();                                                            
                    }
                    
                    if(newUsers.length==0){
                        return false;
                    }
                    
                    this.app.showLoading("Sharing "+this.objectName+"...", this.dialog.$el);                     
                    URL = "/pms/shareable/saveShareableItem.jsp?BMS_REQ_TK="+this.app.get('bms_token');        

                    post_data = {"type":"saveUserShareabeItem","value":this.getObjectValue(),"itemNum":this.itemNum
                                        ,shareableUsers:newUsers.join(",")
                                    };    
                    
                    $.post(URL, post_data)
                      .done(_.bind(function(data) {                                                          
                          this.app.showLoading(false, this.dialog.$el);
                          var _json = jQuery.parseJSON(data);                              
                          if(_json[0]!=="err"){                                 
                              this.app.showMessge(this.objectName+" shared Successfully!");                                                                                        
                              this.model.set("isShared", 'Y');                              
                              this.dialog.hide();                                    
                          }
                          else{                                  
                              this.app.showAlert(_json[1],this.$el);
                          }							                            
                     },this));
                },
                getObjectValue:function (){
                    var encodeKey = {"1":"listNumber.encode","2":"campNum.encode","3":"templateNumber.encode"}                    
                    return this.model.get(encodeKey[this.itemNum]);
                }
                
            });
        });
