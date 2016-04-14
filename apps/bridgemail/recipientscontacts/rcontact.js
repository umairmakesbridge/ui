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
                'click .show-page-view':'showPageView'
            },
            initialize: function () {
                this.app = this.options.app;
                this.template = _.template(template);	
                this.render();
            },
            render: function () {
              this.$el.html(this.template(this.model.toJSON())); 
              this.$(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
            }   ,
            getFullName:function(){
                if(this.model.get('firstName') || this.model.get('lastName'))
                    return this.model.get('firstName') + ' ' + this.model.get('lastName');
                else
                    return this.model.get('email');
            },
            openContact:function(){
                //this.$el.parents('.modal').find('.close').click();
                if(this.options.isSubscriber){
                    this.$el.parents('.modal').find('.close').click();
                }
                this.app.removeDialogs();
                this.options.app.mainContainer.openSubscriber(this.model.get('subNum.encode'));
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
               if(sep =="/") 
                    var _date =  moment(sentDate,'MM/DD/YYYY');
                if(sep =="-")
                    var _date =  moment(sentDate,'YYYY-MM-DD');
                
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
             }
             
        });    
});