/* 
 * Name: Link View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Link view to display on main page.
 * Dependency: LINK HTML, SContacts
 */
define(['text!target/html/recipients_target.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
            tagName:'tr',
            events: {
                "click .percent":'showPercentDiv',
                "click .pageview":'showPageViews',
                "click .edit-target":"editTarget",
                "click .delete-target":"deleteTarget",
                "click .refresh":"refreshTarget",
                "click .preview":"previewTarget"
                   
            },
            initialize: function () {
                this.app = this.options.app;
                this.template = _.template(template);
                this.model.on('change',this.render,this);
                this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON())); 
                this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});
                
            },
            
               deleteTarget:function(ev){
                var that = this;
                var target_id = $(ev.target).data('id');
                var bms_token =that.app.get('bms_token');
                 var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK="+bms_token;
                   that.options.app.showAlertDetail({heading:'Confirm Deletion',
                        detail:"Are you sure you want to delete this target?",                                                
                            callback: _.bind(function(){													
                                that.options.app.showLoading("Deleting Target...",that.$el);
                                $.post(URL, {type:'delete',filterNumber:target_id})
                                    .done(function(data) {                  
                                          that.options.app.showLoading(false,that.$el);   
                                           var _json = jQuery.parseJSON(data);
                                           if(_json[0]!=='err'){
                                               $(ev.target).parents('tr').fadeOut('slow');
                                              
                                             }
                                           else{
                                                that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                           }
                                   });
                            },that)},
                       that.$el); 
                
                },
                refreshTarget:function(ev){
                    if(this.model.get('filtersCount') == "0" || this.model.get('filtersCount') == ""){
                        this.options.app.showAlert("This target can't be refresh, please edit target and add filters to refresh.",$("body"),{fixed:true}); 
                        return ;
                    }
                    var that = this;
                    var target_id = $(ev.target).data('id');
                     var bms_token =that.app.get('bms_token');
                     var URL = "/pms/io/filters/saveTargetInfo/?BMS_REQ_TK="+bms_token;
                                    that.options.app.showLoading("Refreshing Target...",that.$el);
                                    $.post(URL, {type:'runPopulation',filterNumber:target_id})
                                        .done(function(data) {                  
                                              that.options.app.showLoading(false,that.$el);   
                                               var _json = jQuery.parseJSON(data);
                                               if(_json[0]!=='err'){
                                                   if (_json[1].indexOf("Error") >= 0){
                                                     that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                                    }else{
                                                        that.model.set('status',"S");
                                                        that.render();
                                                    }
                                                    
                                                }
                                               else{
                                                    that.options.app.showAlert(_json[1],$("body"),{fixed:true}); 
                                               }
                                   });
                
                },
                editTarget:function(ev){
                    var target_id = $(ev.target).data('id');
                    var self = this;
                    var t_id = target_id?target_id:"";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-219;
                    var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:true,
                              bodyCss:{"min-height":dialog_height+"px"},
                              headerIcon : 'targetw',
                              buttons: {saveBtn:{text:'Save Target'} }                                                                           
                        });         
                    this.app.showLoading("Loading...",dialog.getBody());                                  
                      require(["target/target"],function(targetPage){                                     
                           var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog});
                           dialog.getBody().html(mPage.$el);
                           dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                      });
                },
                previewTarget:function(ev){
                   var target_id = $(ev.target).data('id');
                    var self = this;
                    var t_id = target_id?target_id:"";
                    var dialog_title = target_id ? "Edit Target" : "";
                    var dialog_width = $(document.documentElement).width()-60;
                    var dialog_height = $(document.documentElement).height()-219;
                    var dialog = this.app.showDialog({title:dialog_title,
                              css:{"width":dialog_width+"px","margin-left":"-"+(dialog_width/2)+"px","top":"10px"},
                              headerEditable:true,
                              bodyCss:{"min-height":dialog_height+"px"},
                              headerIcon : 'targetw',
                              buttons: {saveBtn:{text:'Save Target'} }                                                                           
                        });         
                    this.app.showLoading("Loading...",dialog.getBody());                                  
                      require(["target/target"],function(targetPage){                                     
                           var mPage = new targetPage({camp:self,target_id:t_id,dialog:dialog});
                           dialog.getBody().html(mPage.$el);
                           dialog.saveCallBack(_.bind(mPage.saveTargetFilter,mPage));
                      });
                },
            showPercentDiv:function(ev){
                   var target = $(ev.target);
                   var filterNumber = target.data('filter');
                   if($('.pstats').length > 0) $('.pstats').remove();
                   var that = this;
                   that.showLoadingWheel(true,target);
                   var bms_token =that.app.get('bms_token');
                   var URL = "/pms/io/filters/getTargetPopulation/?BMS_REQ_TK="+bms_token+"&filterNumber="+filterNumber+"&type=stats";
                   
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        if(that.app.checkError(data)){
                            return false;
                        }
                        var percentDiv ="<div class='pstats left-side' style='display:block'><ul><li class='openers'><strong>"+that.options.app.addCommas(data.openers)+"<sup>%</sup></strong><span>Openers</span></li>";
                         percentDiv =percentDiv + "<li class='clickers'><strong>"+that.options.app.addCommas(data.clickers)+"<sup>%</sup></strong><span>Clickers</span></li>";
                         percentDiv =percentDiv + "<li class='visitors'><strong>"+that.options.app.addCommas(data.pageviewers)+"<sup>%</sup></strong><span>Visitors</span></li></ul></div>";
                         that.showLoadingWheel(false,target);
                     target.parents('.percent_stats').append(percentDiv);
                                           	
                    });
                    that.app.showLoading(false, that.$el);
                } 
            ,
           showPageViews:function(ev){
                var that = this;
                var offset = $(ev.target).offset();
                var listNum = $(ev.target).data('id');
                $('#div_pageviews').show();
                $('#div_pageviews').empty();
                $('#div_pageviews').append("<div class='loading-contacts' style='margin-top:15px; font-weight:bold; text-align:center; margin-left:auto; margin-right:auto;'>Loading...</div> ");
                
                $('#div_pageviews').css({top:offset.top-290});
                require(["recipientscontacts/rcontacts"],function(Contacts){
                   var objContacts = new Contacts({app:that.app,listNum:listNum,type:'target'});
                    $('#div_pageviews').css('padding-top','0');
                    $('#div_pageviews').html(objContacts.$el);
                });
           }
            ,
               showLoadingWheel:function(isShow,target){
               if(isShow)
                target.append("<div class='pstats left-side' style='display:block; background:#01AEEE;'><div class='loading-wheel right' style='margin-left:-10px;margin-top: -5px;position: inherit!important;'></div></div>")
               else{
                var ele = target.find(".loading-wheel") ;      
                    ele.remove();
                }
            },
            getProgressBar:function(){
                if(this.model.get('status') == "S") return 1 + "%";
                if(this.model.get('status') == "P"){
                    var progress = ((parseInt(this.model.get('totalCount')) - parseInt(this.model.get('pendingCount'))) / parseInt(this.model.get('totalCount'))  * 100);
                    progress = Math.ceil(progress);
                    progress = (isNaN(progress = parseInt(progress, 10)) ? 0 : progress)
                    if(progress !="Infinity" || progress!="NaN" )return progress + "%"; else return 0 + '%';
                    if(progress.isNaN || progress.isInfinity )  return  "0%"; else return progress + "%";
                }
            },
            getTooltipForStatus:function(){
                if(this.model.get('status') == "S") return "Population count is in progress 1%";
                if(this.model.get('status') == "P"){
                    var progress = ((parseInt(this.model.get('totalCount'))- parseInt(this.model.get('pendingCount'))) / parseInt(this.model.get('totalCount'))  * 100);
                    progress = Math.ceil(progress);
                    progress = (isNaN(progress = parseInt(progress, 10)) ? 0 : progress)
                    progress ="Population count is in progress " + progress ;
                    if(progress.isNaN || progress.isInfinity )  return  "Total count is 0"; else return progress + "%";
                }
            }
                
        });    
});