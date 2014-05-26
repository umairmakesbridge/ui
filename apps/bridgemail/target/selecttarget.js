define(['text!target/html/selecttarget.html','moment','jquery.bmsgrid','bms-mapping'],
function (template,moment) {
        'use strict';
        return Backbone.View.extend({                
                events: {                   
                      
                 },
                initialize: function () {
                        this.template = _.template(template);				
                        this.parent = this.options.page;
                        this.app = this.parent.app;
                        this.dialog = this.options.dialog;
                        this.render();
                },

                render: function () {                       
                        this.$el.html(this.template({}));                                                                        
                },
                init:function(){
                  this.$('div#targetrecpssearch').searchcontrol({
                            id:'target-recps-search',
                            width:'220px',
                            height:'22px',
                            placeholder: 'Search recipient targets',
                            gridcontainer: 'recipients',
                            showicon: 'yes',
                            iconsource: 'target'
                     });
                    this.$('div#targetsearch').searchcontrol({
                            id:'target-search',
                            width:'220px',
                            height:'22px',
                            placeholder: 'Search targets',
                            gridcontainer: 'targets_grid',
                            showicon: 'yes',
                            iconsource: 'target'
                     });  
                     this.loadTargets();
                },
                loadTargets:function(){
                  if(!this.app.getAppData("targets")){                                    
                        this.app.showLoading("Loading Targets...",this.$('.leftcol'));
                         this.app.getData({
                            "URL":"/pms/io/filters/getTargetInfo/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=list&filterFor=C",
                            "key":"targets",
                            "callback":_.bind(this.createTargetsTable,this)
                        });
                    }
                    else{
                        this.createTargetsTable();
                    }  
                },
                createTargetsTable:function(){                     
                    
                    this.$("#targets").children().remove();
                    var targets_list_json = this.app.getAppData("targets");                   		
                    this.$('#targets .bmsgrid').remove();
                    this.$(".col2 .bmsgrid").remove();
                    this.$("#area_choose_targets").removeData("mapping");
                    if(targets_list_json.filters){                        
                    
                        var target_html = '<table cellpadding="0" cellspacing="0" width="100%" id="targets_grid"><tbody>';
                       
                        _.each(targets_list_json.filters[0], function(val,key) {					
                            target_html += '<tr id="row_'+val[0]["filterNumber.encode"]+'" checksum="'+val[0]["filterNumber.checksum"]+'">';                        
                            target_html += '<td><div class="name-type"><h3>'+val[0].name+'</h3><div class="tags tagscont">'+ this.app.showTags(val[0].tags) +'</div></div></td>';
                            var upd_date = moment(val[0].updationDate,'YYYY-M-D');
                            var upd_date_new = upd_date.date() + ' ' + this.app.getMMM(upd_date.month()) + ', ' + upd_date.year();
                            target_html += '<td><div><div class="time show" style="min-width:70px;"><strong><span><em>Updation Date</em>'+upd_date_new+'</span></strong></div><div id="'+val[0]["filterNumber.encode"]+'" class="action"><a class="btn-green move-row"><span>Use</span><i class="icon next"></i></a></div></div></td>';                        
                            target_html += '</tr>';
                        },this);
                        target_html += '</tbody></table>';
								
                   }
                    this.$el.find("#targets").html(target_html);					
                    this.$el.find("#targets").bmsgrid({
                            useRp : false,
                            resizable:false,
                            colresize:false,
                            height:345,							
                            usepager : false,
                            colWidth : ['100%','100']
                    });
					
                    this.$("#targets tr td:first-child").attr("width","100%");
                    this.$("#targets tr td:last-child").attr("width","100px");										                    										
								
                    this.$("#area_choose_targets").mapping({
                            gridHeight:345,
                            sumColumn: 'subscribers',
                            sumTarget: 'trecpcount span',
                            loadTarget: function(obj) { 
                                    this.loadTarget(obj);
                            },
                            copyTarget: function(obj) { 
                                    this.copyTarget(obj);
                            }
                    });
                    this.addToCol2();					                    						
                    this.app.showLoading(false,this.$('.leftcol'));
                    
                },
                addToCol2:function(){
                    if(this.parent.targets){
                         _.each(this.parent.targets,function(val){
                             this.$("#targets_grid tr[checksum='"+val[0].checksum+"']").find(".move-row").click();
                         },this)
                    }
                },
                loadTarget:function(){
                    
                },
                copyTarget:function(){
                    
                },
                saveCall:function(){
                    if(this.$("#recipients tr").length>0){
                       var targetsArray =  {}
                        var t =1;
                        _.each(this.$("#recipients tr"),function(val,key){
                           targetsArray["target"+t] = [{"checksum":$(val).attr("checksum"),"encode":$(val).attr("id").split("_")[1]}] ;
                           t++;
                        },this);    
                        this.parent.targets = targetsArray;
                        this.dialog.hide();
                        this.parent.createTargets(true);
                    }
                    else{
                        this.app.showAlert("Please use targets",this.$el);
                    }
                }
        });
});