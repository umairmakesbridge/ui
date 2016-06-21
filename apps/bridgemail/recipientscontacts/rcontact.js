/* Name: Link View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Link view to display on main page.
 * Dependency: LINK HTML, SContacts
 */
define(['text!recipientscontacts/html/rcontact.html'],
function (template) {
        'use strict';
        return Backbone.View.extend({
            tagName:"tr",
            events: {
                 'click .view-profile':"openContact",
                'click .show-page-view':'showPageView',
                'click .page-views' :'loadPageViewsDialog'
            },
            initialize: function () {
                this.app = this.options.app;
                this.parent = this.options.parent;
                this.template = _.template(template);	
                this.render();
            },
            render: function () {
              this.$el.html(this.template(this.model.toJSON())); 
              this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
              if (this.parent && this.parent.searchText) {
                this.$(".view-profile").highlight($.trim(this.parent.searchText));                        
              } 
            },
            getFullName:function(){
                if(this.model.get('firstName') || this.model.get('lastName'))
                    return this.model.get('firstName') + ' ' + this.model.get('lastName');
                else
                    return this.model.get('email');
            },
            openContact:function(){
                //this.$el.parents('.modal').find('.close').click();
                try{
                    if(this.options.isSubscriber){
                        this.$el.parents('.modal').find('.close').click();
                    }
                    this.app.removeDialogs();
                }
                catch(e){}
                var subNum = this.model.get('subNum.encode')? this.model.get('subNum.encode'): this.model.get('subNum');
                this.options.app.mainContainer.openSubscriber(subNum);
            },
            showPageView:function(ev){
                    var subNum = $(ev.target).data('id'); // encode id for list subscriber.
                     var encode = this.model.get('subNum.encode');
                     var dialog_width = 80;
                     var that = this;
                     var url = "";
                     if($(ev.target).html() == "0")return;
                     this.app.removeDialogs();
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog(
                           {           
                                       title:'Page Views',
                                       css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                       headerEditable:false,
                                       headerIcon : 'preview3',
                                       bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                        that.options.app.showLoading('Loading Page Views....',dialog.getBody());
                        var name = that.model.get('firstName');
                        if(!name){
                          name = that.model.get('email'); 
                        }else{
                            name = name + "  " + this.model.get('lastName') ;
                        }
                                 
                        require(["recipientscontacts/pageviews",],function(Views){
                                var mPage = new Views({encode:encode,subNum:subNum,app:that.options.app,email:name,salestatus:that.model.get('salesStatus'),url:url});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        });
                
            },dateSetting:function(sentDate, sep){
                var _date = ""
               if(sep =="/"){ 
                    _date =  moment(sentDate,'MM/DD/YYYY');
                }
                else if(sep =="-") {
                   _date =  moment(sentDate,'YYYY-MM-DD');
                }                    
                else {
                    _date =  moment(sentDate,sep);
                }
                return _date.format("DD MMM YYYY");
             },
             getFullDate:function(date){
                  var date = moment(this.options.app.decodeHTML(date),'MM/DD/YYYY H:m');														
                  var dateFormat = date.format("DD MMM, YYYY");
                  if(this.options.sentAt == 'Scheduled on'){
                    dateFormat = date.format("DD MMM, YYYY<br/> hh:mm A");
                  }else{
                    dateFormat = date.format("DD MMM, YYYY");
                  }
                                        
                 return dateFormat;
             },
             getFullDateSubmission:function(date){
                  var date = moment(this.options.app.decodeHTML(date),'MM-DD-YY H:m:s');														
                  var dateFormat = date.format("DD MMM, YYYY <br/> hh:mm A");
                                        
                 return dateFormat;
             },
             getFullDateAction:function(date,format){
                  var date = moment(this.options.app.decodeHTML(date),format);														
                  var dateFormat = date.format("DD MMM, YYYY <br/> hh:mm A");
                                        
                 return dateFormat;
             },
            truncateURL:function(url){
                if(url.length > 45) 
                    return url = url.substring(0,45);
                else return url;
            },
            loadPageViewsDialog:function(){                    
                     var dialog_width = 80;                     
                     var encode = this.model.get('subNum.encode')?this.model.get('subNum.encode'):this.model.get('subNum');                     
                     var that = this;                    
                                          
                     var dialog_height = $(document.documentElement).height()-200;
                     var dialog = this.options.app.showDialog(
                           {           
                                title:'Page Views',
                                css:{"width":dialog_width+"%","margin-left":"-"+(dialog_width/2)+"%","top":"20px"},
                                headerEditable:false,
                                headerIcon : 'preview3',
                                bodyCss:{"min-height":dialog_height+"px"}                                                                          
                            });
                     that.options.app.showLoading('Loading Page Views....',dialog.getBody());
                        var name = that.model.get('firstName');
                        if(!name){
                          name = that.model.get('email'); 
                        }else{
                            name = name + "  " + this.model.get('lastName') ;
                        }
                        var fromDate = that.parent.fromDate;
                        var toDate = that.parent.toDate;
                        if(that.parent.options.params && that.parent.options.params.viewType=="CK"){
                            var fDate = moment($.trim(fromDate), 'MM-DD-YYYY');
                            var tDate = moment($.trim(toDate), 'MM-DD-YYYY');
                            fromDate = fDate.format("MM-DD-YY");
                            toDate = tDate.format("MM-DD-YY");
                        }
                                 
                        require(["reports/summary/views/pageviews",],function(Views){
                                var mPage = new Views({campNum:that.parent.options.params.campNum,subNum:encode,encode:encode,app:that.options.app,email:name,salestatus:that.model.get('salesStatus'),fromDate:fromDate,toDate:toDate});
                                dialog.getBody().html(mPage.$el);
                                that.options.app.showLoading(false,dialog.getBody());
                          
                        });
                        
                
            }
             
        });    
});