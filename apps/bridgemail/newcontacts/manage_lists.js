define(['text!newcontacts/html/manage_lists.html'],
function (template) {
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //
        // Subscriber subscribed lists View
        //
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        'use strict';
        return Backbone.View.extend({
            className: 'model_form',
             /**
             * Attach events on elements in view.
            */    
            events: {

            },
            /**
             * Initialize view - backbone
            */
            initialize: function () {
                    this.template = _.template(template);				
                    this.sub = this.options.sub
                    this.app = this.sub.app;
                    this.change_list = {};
                    this.render();
            },
            /**
             * Render view on page.
            */
            render: function () {
                    this.$el.html(this.template({}));
                    this.initControls();                   
            },
            initControls:function(){
                var _this = this;
                var bms_token =this.app.get('bms_token');
                this.app.showLoading("Loading Subscriber Lists...",_this.$("#subscriber-listing"));   
                var URL = "/pms/io/subscriber/getData/?BMS_REQ_TK="+bms_token+"&subNum="+this.sub.sub_id+"&type=getListInfo";
                jQuery.getJSON(URL,  function(tsv, state, xhr){                    
                    var _json = jQuery.parseJSON(xhr.responseText); 
                    if(_this.app.checkError(_json)){
                        return false;
                    }
                    var options = [{'label':'Subscribe',value:'S',cls:'subscribe'},{'label':'Unsubscribe',value:'U',cls:'unsubscribe'},{'label':'Remove',value:'R',cls:'block'}];
                    var list_html = '<table cellpadding="0" cellspacing="0" width="100%" id="subscriber_lists_grid"><tbody>';                   
                    if(_json.count!="0"){
                        $.each(_json.listInfo[0],function(key,val){                        
                            var subscribe_date ="NA",unsubscribe_date = "NA";
                            list_html += '<tr id="row_'+val[0].listNumber+'">';                        
                            list_html += '<td><div class="name-type"><h3>'+val[0].listName+'</h3><div class="tags tagscont"></div> </td>';                                          
                            if(val[0].subscribedDate && val[0].subscribedDate!='-'){
                                subscribe_date = _this.app.decodeHTML(val[0].subscribedDate).split(" ")[0].split("-")
                                subscribe_date  = subscribe_date[2]+" "+_this.app.getMMM(parseInt(subscribe_date[1])-1)+", "+subscribe_date[0];
                            }
                            if(val[0].unSubscribedDate && val[0].unSubscribedDate!='-'){
                                unsubscribe_date = _this.app.decodeHTML(val[0].unSubscribedDate).split(" ")[0].split("-")
                                unsubscribe_date  = unsubscribe_date[2]+" "+_this.app.getMMM(parseInt(unsubscribe_date[1])-1)+", "+unsubscribe_date[0];
                            }
                            list_html += '<td><div class="time show"><strong><span><em>Subscribed On</em>'+subscribe_date+'</span></strong></div></td>';                        
                            list_html += '<td><div class="time show"><strong><span><em>Unsubscribed On</em>'+unsubscribe_date+'</span></strong></div></td>';                        
                            list_html += '<td><div class="sur-select"><select  class="list-action" style="width:160px;" id="'+val[0].listNumber+'">'
                                $.each(options,function(k,v){ 
                                    var _select = v.value==val[0].status ? "selected":""; 
                                    list_html +='<option value="'+v.value+'" class="'+v.cls+'" '+_select+' >'+v.label+'</option>';
                                })
                            list_html +='</select></div></td>';                        
                            list_html += '</tr>';
                        });
                    }
                    else {
                        list_html +='<p class="notfound">No Lists Found</p>'; 
                        _this.$el.parents(".modal").find(".btn-save").hide();
                    }
                    list_html +='</tbody></table>';
                    _this.$("#subscriber-listing").html(list_html);
                    _this.$el.find("#subscriber_lists_grid").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:400,
                            usepager : false,
                            colWidth : ['100%','90px','66px']
                    });
                    _this.$(".list-action").chosen({width: "160px",disable_search: "true"});
                    _this.$(".list-action").change(function(){
                        var parent_row = $(this).parents("tr");
                        _this.change_list[parent_row.attr("id")] = $(this).val() ;
                    });
                })
            },
            updateSubscriberLists:function(dialog){
                var post_data = {};
                _.each(this.$("select.list-action"),function(val,key){
                    post_data["listNum"+key] = $(val).attr("id");
                    post_data["status"+key] = $(val).val();
                },this);
                this.app.showLoading("Updating Subscriber Lists...",dialog.$el);
                var _this = this;
                var URL = "/pms/io/subscriber/setData/?BMS_REQ_TK="+this.app.get('bms_token')+"&subNum="+this.sub.sub_id+"&type=editListInfo";
                $.post(URL, post_data)
                .done(function(data) {                                 
                       var _json = jQuery.parseJSON(data);                         
                       _this.app.showLoading(false,dialog.$el);          
                       if(_json[0]!=="err"){
                           dialog.hide();
                       }
                       else{
                           _this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                       }
               });
            }
            
        });
});