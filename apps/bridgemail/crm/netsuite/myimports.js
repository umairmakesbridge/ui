define(['text!crm/netsuite/html/myimports.html','crm/netsuite/collections/myimports','moment','jquery.searchcontrol','jquery.bmsgrid'],
function (template,MyImports,moment) {
        'use strict';
        return Backbone.View.extend({                                
                className:'clearfix',
                events: {

                 },
                initialize: function () {
                    this.template = _.template(template);				
                    this.myImportsRequest = new MyImports(); 
                    this.render();
                },

                render: function () {
                    this.app = this.options.page.app;                                                 
                    this.parent = this.options.page;
                    this.$el.html(this.template({}));                    
                    this.$myImportsContainer = this.$(".myimports-table");
                    this.initControl();                                                              
                },
                initControl:function(){
                   this.$(".myimports-search").searchcontrol({
                            id:'myimports-search',
                            width:'300px',
                            height:'22px',
                            gridcontainer: 'myimports_list_grid',
                            placeholder: 'Search my imports',                     
                            showicon: 'yes',
                            iconsource: 'campaigns'
                     });
                     this.getMyImports();
                    
                },
                getMyImports:function(){
                    this.app.showLoading("Loading My Imports...",this.$myImportsContainer);
                    this._request = this.myImportsRequest.fetch({
                      success: _.bind(function (collection, response) {                                                        
                           if(collection.length){                               
                            var myimports_html = '<table cellpadding="0" cellspacing="0" width="100%" id="myimports_list_grid"><tbody>';                                
                           _.each(collection.models,function(val,key){
                              myimports_html += '<tr id="row_'+val.get("tId")+'">';                                
                                myimports_html += '<td><div class="name-type"><h3><a id="editname_'+val.get("tId")+'" class="get-import">'+val.get("listName")+'</a>'+this.setStatus(val.get("status"))+'</h3></div></td>';
                                myimports_html += '<td>';
                                if(val.get("frequency")!==''){
                                    myimports_html += '<img src="img/recurring2.gif"  class="recurring2img" alt=""/>';                                
                                }
                                myimports_html += '</td>';
                                myimports_html += '<td>';
                                    if(val.get("status")=='S'){
                                        myimports_html += '<div class="sched show" style="width:145px"><strong><span><em><b>'+this.getFrequency(val.get("frequency"))+'</b></em>'+this.getDate(val.get("scheduledDate"))+'</span></strong></div>';                                    
                                        myimports_html += '<div class="action"><a class="btn-red deactivate-import" id="deact_'+val.get("tId")+'"><span>Delete</span><i class="icon deactivate"></i></a><a class="btn-gray get-import" id="edit_'+val.get("tId")+'"><span>Edit</span><i class="icon edit"></i></a></div>';
                                    }
                                myimports_html += '</td>';
                              myimports_html += '</tr>';
                          },this);
                            myimports_html +="</tbody></table>";
                            this.$myImportsContainer.html(myimports_html);
                            this.$("#myimports_list_grid").bmsgrid({
                                    useRp : false,
                                    resizable:false,
                                    colresize:false,
                                    height:'auto',
                                    usepager : false,
                                    colWidth : ['100%','20px','60px']
                            });
                            this.$myImportsContainer.find(".deactivate-import").click(_.bind(this.deactivateImport,this)); 
                             this.$myImportsContainer.find(".get-import").click(_.bind(this.getImport,this)); 
                            
                          }
                          else{
                             this.$myImportsContainer.html('<p class="notfound">No imports found</p>');
                          }
                          
                            
                      }, this),
                      error: function (collection, resp) {

                      }
                  });                  
                    
                },
                setStatus:function(status){
                    var statusHTML = "";
                    if(status=='S'){
                        statusHTML = '<a class="cstatus pclr2">Scheduled </a>'
                    }
                    else if(status=='P'){
                        statusHTML = '<a class="cstatus pclr6">Pending </a>'
                    }
                    
                    return statusHTML;
                },
                getDate:function(val){
                    var _date = moment(this.app.decodeHTML(val),'YYYY-M-D H:m');
                    return _date.format("DD MMM, YYYY");
                },
                getFrequency:function(freq){
                    var frequency = "";
                    if(freq=="" || freq=="I"){
                        frequency = "Once only";
                    }
                    else if(freq=="O"){
                        frequency = "Once a Week";
                    }
                    else if(freq=="T"){
                        frequency = "After two weeks";
                    }
                    else if(freq=="M"){
                        frequency = "After a month";
                    }
                    return frequency;
                },
                deactivateImport:function(e){
                    var tid = $.getObj(e,"a").attr("id");
                    this.app.showAlertDetail({heading:'Confirm Delete',
                        detail:"Are you sure you want to delete this import?",                                                
                            callback: _.bind(function(){													
                                    this.deactivateCall(tid.split("_")[1]);
                            },this)},
                    this.$el);       
                },
                deactivateCall:function(tId){
                    this.app.showLoading("Deleting Import...",this.$el);
                    var URL = "/pms/io/netsuite/setData/?BMS_REQ_TK="+this.app.get('bms_token');
                    $.post(URL, {type:'delete',tId:tId})
                    .done(_.bind(function(data) {                  
                          this.app.showLoading(false,this.$el);   
                           var _json = jQuery.parseJSON(data);        
                           if(_json[0]!=='err'){                               
                               this.app.showMessge("Your import has been successfully delete.");
                               this.getMyImports();
                               this.parent.updateCount(-1);
                           }
                           else{
                               this.app.showAlert(_json[1],$("body"),{fixed:true}); 
                           }
                   },this));
                },
                getImport:function(e){
                    this.parent.$("#choose_soruce .netsuite-new-import").click();
                    this.parent.$("#choose_soruce li.netsuite-new-import").removeClass("selected");
                    var tid = $.getObj(e,"a").attr("id").split("_")[1];
                    this.app.showLoading("Loading Import...",this.parent.$el);
                    var URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=import&tId="+tid;
                    jQuery.getJSON(URL,_.bind(function(tsv, state, xhr){
                         this.app.showLoading(false,this.parent.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);
                        this.app.showLoading(false,this.parent.newImportArea);                                                
                        this.loadImport(_json)
                        
                    },this));
                },
                loadImport:function(data){
                    if(this.parent.newImport_page && this.parent.newImport_page.loadData){
                       this.parent.newImport_page.loadData(data);
                     }
                     else{
                         setTimeout(_.bind(this.loadImport,this,data),200);
                     }
                }
        });
});