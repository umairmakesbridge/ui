define(['text!crm/salesforce/html/peering.html','jquery.chosen','jquery.icheck'],
function (template) {
        'use strict';
        return Backbone.View.extend({                                                              
                className:'crm-content',
                events: {
                    'click .activate-peering':'activatePeering',
                    'click .update-peering':'updatePeering',
                    'click .deactivate-peering':'deactivatePeering'
                },
                initialize: function () {                    			                 
                    this.template = _.template(template);	
                    this.render();
                },
                render: function () {
                    this.app = this.options.page.app;
                    this.page = this.options.page;
                    this.$el.html(this.template({}));      	                                       
                    this.tId = this.page.peeringId;
                    this.selectedList = null;
                    this.initControl();                                                              
                },
                initControl:function(){
                    this.showHideButton(this.tId)
                    this.$(".nosearch").chosen({disable_search_threshold: 30,width:'300px'});                       
                    this.$('input#notialert').iCheck({
                        checkboxClass: 'checkinput'                        
                    }); 
                    this.$('input[type="radio"]').iCheck({
                        radioClass: 'radiopanelinput',
                        insert: '<div class="icheck_radio-icon"></div>'                        
                    }); 
                },
                init:function(){
                    var URL = "/pms/io/salesforce/getData/?BMS_REQ_TK="+ this.app.get('bms_token')+"&type=getPeer";                    
                    this.app.showLoading("Loading Peering...",this.$el);     
                    jQuery.getJSON(URL,_.bind(function(tsv, state, xhr){
                        this.app.showLoading(false,this.$el); 
                        var peer_details = jQuery.parseJSON(xhr.responseText);
                        this.tId  = peer_details.tId;
                        this.$(".peer-time").val(peer_details.peeringTime).trigger("chosen:updated");
                        this.$("input[value='"+peer_details.sfObject+"']").iCheck('check');
                        this.selectedList=  peer_details.checkSum;
                        if(peer_details.alert!=="n"){
                            this.$('input#notialert').iCheck('check');
                        }
                        if(peer_details.status=='S'){
                            this.showHideButton(true);
                        }
                        else{
                            this.showHideButton(false);
                        }
                        this.createListSelectBox();
                    },this));
                },
                showHideButton:function(flag){
                    if(flag){
                        this.$(".deactivate-peering").css({display:"inline-block"});
                        this.$(".update-peering").css({display:"inline-block"});
                        this.$(".activate-peering").css({display:"none"});
                    }
                    else{
                        this.$(".deactivate-peering").css({display:"none"});
                        this.$(".update-peering").css({display:"none"});
                        this.$(".activate-peering").css({display:"block"});
                    }
                },
                createListSelectBox:function(){
                     if(!this.app.getAppData("lists")){                        
                        this.app.getData({
                            "URL":"/pms/io/list/getListData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=all",
                            "key":"lists",
                            "callback":_.bind(this.populateListBox,this)
                        });
                    }
                    else{
                        this.populateListBox();
                    }
                },
                populateListBox:function(xhr){                    
                    var camp_list_json = this.app.getAppData("lists");                                                                  			
                    var list_html = '<option value=""></option>';                    
                    $.each(camp_list_json.lists[0], _.bind(function(index, val) {    
                        var selected= ""
                        if(this.selectedList && val[0]["listNumber.checksum"]==this.selectedList){
                            selected= "selected";
                        }
                        list_html += '<option value="'+val[0]["listNumber.encode"]+'" '+selected+'>'+val[0].name+'</option>';
                    },this));
                    this.$(".bms-lists").html(list_html).attr("disabled",false).trigger("chosen:updated");
                },
                activatePeering:function(){
                   var _time=this.$(".peer-time").val();
                   var _alert=this.$("#notialert").prop("checked")?'y':'n';
                   var _list=this.$(".bms-lists").val();
                   var sfobject=this.$("input[name='sfobjecttype']:checked").val();
                   var post_data = {type:'peer',listNumber:_list,alert:_alert,peeringTime:_time,sfObject:sfobject};
                   this.app.showLoading("Activate Peering...",this.$el);
                   this.update(post_data);
                },
                deactivatePeering:function(){
                   var post_data = {type:'deactivate',tId:this.tId};
                   this.app.showLoading("Deactivating Peering...",this.$el);
                   this.update(post_data);
                },                
                updatePeering:function(){
                   var _time=this.$(".peer-time").val();
                   var _alert=this.$("#notialert").prop("checked")?'y':'n';
                   var _list=this.$(".bms-lists").val(); 
                   var sfobject=this.$("input[name='sfobjecttype']:checked").val();
                   var post_data = {type:'peer',listNumber:_list,alert:_alert,peeringTime:_time,sfObject:sfobject};
                   this.app.showLoading("Updating Peering...",this.$el);
                   this.update(post_data);                   
                },
                update:function(post_data){
                    var URL = "/pms/io/salesforce/setData/?BMS_REQ_TK="+ this.app.get('bms_token');                            
                    $.post(URL,post_data)
                    .done(_.bind(function(data) {  
                        this.app.showLoading(false,this.$el);     
                        var _json = jQuery.parseJSON(data);  
                        if(_json[0]!="err"){
                            if(_json.tId){
                            this.tId = _json.tId;
                            }

                            if(post_data['type']=='deactivate'){
                                this.showHideButton(false);
                                this.page.peerOnOff(false);
                            }
                            else{
                                this.showHideButton(true);
                                this.page.peerOnOff(true);
                            }

                            this.app.showMessge("Salesforce peering transaction has been activated/updated successfully.");

                        }else{
                            this.app.showAlert(_json[1], $("body"), {fixed: true});
                        }
                        
                    },this));
                }
        });
});