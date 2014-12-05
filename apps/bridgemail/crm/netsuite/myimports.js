define(['text!crm/netsuite/html/myimports.html','crm/netsuite/collections/myimports','moment','jquery.searchcontrol','jquery.bmsgrid'],
function (template,MyImports,moment) {
        'use strict';
        return Backbone.View.extend({                                
                className:'clearfix',
                events: {
                    'click #addnew_import,.create_new':'newImport',
                    'click .add-some':'newImport',
                    "click .refresh_btn":'getMyImports'
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
                     this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});                     
                     this.getMyImports();
                    
                },
                getMyImports:function(){
                    this.app.addSpinner(this.$el);
                    this.app.showLoading("Loading My Imports...",this.$myImportsContainer);
                    this._request = this.myImportsRequest.fetch({
                      success: _.bind(function (collection, response) {                                                        
                           if(collection.length){                               
                            var myimports_html = '<div class="create_new"><span>Add Import</span></div><table cellpadding="0" cellspacing="0" width="100%" id="myimports_list_grid"><tbody>';                                
                           _.each(collection.models,function(val,key){
                              myimports_html += '<tr id="row_'+val.get("tId")+'">';                                
                                var import_name = val.get("name")?val.get("name"):val.get("listName");
                                myimports_html += '<td><div class="name-type"><h3><a id="editname_'+val.get("tId")+'" class="get-import">'+import_name+'</a>'+this.setStatus(val.get("status"))+'</h3></div></td>';
                                myimports_html += '<td>';
                                if(val.get("frequency")!==''){
                                    myimports_html += '<img src="img/recurring2.gif"  class="recurring2img" alt=""/>';                                
                                }
                                myimports_html += '</td>';
                                myimports_html += '<td>';
                                    if(val.get("status")=='S'){
                                        var daysDisplay = this.getDate(val.get("scheduledDate"),val.get("frequency"),val.get("day"));
                                        myimports_html += '<div class="sched"><strong><span><em><b>'+this.getFrequency(val.get("frequency"))+'</b></em>'+daysDisplay+'</span></strong></div>';                                    
                                        myimports_html += '<div class="slide-btns two s-clr3" style="width:;"><span class="icon setting"></span><div><a class="icon delete clr2  deactivate-import" id="deact_' + val.get("tId") + '"><span>Delete</span></a><a class="icon edit clr1 get-import" id="edit_' + val.get("tId") + '"><span>Edit</span> </a></div></div>';  
                                    }
                                myimports_html += '</td>';
                              myimports_html += '</tr>';
                          },this);
                            myimports_html +="</tbody></table>";
                            this.$myImportsContainer.html(myimports_html);
                            /*-----Remove loading------*/
                          this.app.removeSpinner(this.$myImportsContainer);
                        /*------------*/
                            this.$("#myimports_list_grid").bmsgrid({
                                    useRp : false,
                                    resizable:false,
                                    colresize:false,
                                    height:'auto',
                                    usepager : false,
                                    colWidth : ['100%','20px','60px']
                            });
                            this.$("#myimports_list_grid tr td:nth-child(1)").attr("width","80%");
                            this.$("#myimports_list_grid tr td:nth-child(2)").attr("width","20px");
                            this.$("#myimports_list_grid tr td:nth-child(3)").attr("width","220px");
                            this.$myImportsContainer.find(".deactivate-import").click(_.bind(this.deactivateImport,this)); 
                            this.$myImportsContainer.find(".get-import").click(_.bind(this.getImport,this)); 
                            
                          }
                          else{
                             this.$myImportsContainer.html('<div class="create_new"><span>Add Import</span></div><p class="notfound">No import(s) found.</p>');
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
               getDate:function(val,freq, days){
                   
                    if(freq =="O"){
                         if(days != ""){
                             return this.caluculateDays(days);
                         }
                    }
                    var _date = moment(this.app.decodeHTML(val),'YYYY-M-D H:m');
                    return _date.format("DD MMM, YYYY");
                },
                caluculateDays:function(days){
                    var days = days.split(",");
                    var str = "";
                    
                    _.each(days,function(day){
                        
                        switch(day){
                            case "1":
                                str = str + "Sun";
                                break;
                            case "2":
                                str = str + ", Mon";
                                break;
                            case "3":
                                str = str + ", Tue";
                                break;
                            case "4":
                                str = str + ", Wed";
                                break;
                            case "5":
                                str = str + ", Thu";
                                break;
                            case "6":
                                str = str + ", Fri";
                                break;
                            case "7":
                                str = str + ", Sat";
                                break;
                        }
                    })
                    var result = [];
                    str =  str.replace(/^,|,$/g,'');
                   // result[0] = str;
                  //  str =  $.trim(str).substring(0, 25).split(" ").slice(0, -1).join(" ") + "...";
                    //result[1] = str;
                    //console.log(result);
                    return str;
                },
                getFrequency:function(freq){
                    var frequency = "";
                    if(freq=="" || freq=="I"){
                        frequency = "Once only";
                    }
                    else if(freq=="O"){
                        frequency = "Next import";
                    }
                    else if(freq=="T"){
                        frequency = "Next import";
                    }
                    else if(freq=="M"){
                        frequency = "Next import";
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
                    $('body'));       
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
                    var tid = $.getObj(e,"a").attr("id").split("_")[1];
                    this.app.showLoading("Loading Import...",this.parent.$el);
                    var URL = "/pms/io/netsuite/getData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=import&tId="+tid;
                    jQuery.getJSON(URL,_.bind(function(tsv, state, xhr){
                        this.app.showLoading(false,this.parent.$el);
                        var _json = jQuery.parseJSON(xhr.responseText);                        
                        this.parent.updateImport(false,_json);
                        //this.loadImport(_json)                        
                        
                    },this));
                },
                loadImport:function(data){
                    if(this.parent.newImport_page && this.parent.newImport_page.loadData){
                       this.parent.newImport_page.loadData(data);
                     }
                     else{
                         setTimeout(_.bind(this.loadImport,this,data),200);
                     }
                },
                newImport:function(){
                    var camp_obj = this;
                   var new_import ='<div class="overlay"><div style="margin-left: -385px; width: 770px;" class="modal-open modal in"><div style="min-height: 300px;" class="modal-body">';
                        new_import +='<div class="sd_common netsuit-tilt"><a class="closebtn close_import"></a>';
                        new_import +=' <div class="watermark_tilt" style="background-position:"></div>';
                        new_import +='<h2>New Import</h2><div class="lp_name">';
                        new_import +=' <div class="inputcont" style="height:39px;float:left;width:324px;">';
                        new_import +='<input type="text" id="import_name" placeholder="Enter Netsuit import name" name="_import" style="width:300px;" class="field-text">';
                        new_import +='</div><a class="btn-green g-btn create-button"><span style="min-width: 40px;"> Create </span><i class="icon next"></i></a></div><div class="clearfix"></div></div></div><br></div></div>';
                        new_import = $(new_import);                                
                        $('body').append(new_import);
                        new_import.find("#import_name").focus();                        
                       new_import.find(".close_import").click(function(e){
                            new_import.remove();
                        });       
                        new_import.find(".create-button").click(_.bind(function(e){
                                this.editImport(new_import);
                        },this));
                        new_import.find("#import_name").keydown(_.bind(function(e){
                            if(e.keyCode==13){
                                this.editImport(new_import);
                            }
                        },this))
                },
                editImport:function(dialog){
                    var importName = dialog.find("#import_name").val();
                    var appMsgs = this.app.messages[0];
                    var el = this.$el;
                    if(importName){
                    dialog.hide();
                    this.parent.updateImport(importName);
                    }else{
                        this.app.showError({
                            control: el.parents('body').find('.modal-open'),
                            message: appMsgs.MAPDATA_importlist_empty_error
                            });
                    }
                }
        });
});