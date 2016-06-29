/* 
 * Name: Link View
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Single Link view to display on main page.
 * Dependency: LINK HTML, SContacts
 */
define(['text!reports/summary/html/link.html','reports/summary/views/scontacts'],
function (template,contactsView) {
        'use strict';
        return Backbone.View.extend({
            className: 'linkrow',
            events: {
             'click .lcount':"loadContact",
             'mouseover .link-bar':'showPreview',
              'mouseover .preview2':'showPreview2',
             'mouseout .load-contacts':'hidePreview', 
             'mouseover .load-contacts':'showPreviewParent'
            },
            showPreview:function(ev){
                $(ev.target).next(".preview2").css('opacity',1);
            },
            showPreviewParent:function(ev){
                $(ev.target).find(".preview2").css('opacity',1);
            },
            showPreview2:function(ev){
                $(ev.target).css('opacity',1);
            },
            hidePreview:function(ev){
                $(ev.target).find(".preview2").css('opacity',0);
            },
            initialize: function () {
                 this.template = _.template(template);	
                this.render();
            },
            render: function () {
                this.$el.html(this.template(this.model.toJSON())); 
                this.$el.find(".showtooltip").tooltip({'placement':'bottom',delay: { show: 0, hide:0 },animation:false});  
            } ,
            loadContact:function(ev){
                  var that = this;
                  var url = this.model.get('articleURL');
                  var title = this.model.get('articleTitle');
                  url = title+'|-.-|'+url;
                if($("body").hasClass('modal-open')){
                    $("html,body").css('height','100%').animate({scrollTop:0},600).css("height","");  
                     var offset = $(ev.target).offset();
                     var active_ws = $(".modal-body");
                     active_ws.find('.campaign-clickers').remove();
                     active_ws.append("<div class='dddiv campaign-clickers'></div>"); 
                      active_ws.find('.campaign-clickers').css({top:offset.top-40})
                      active_ws.find('.campaign-clickers').each(function () {
                         this.style.setProperty( 'right', '10px', 'important' );
                      });
                      
                      active_ws.find('.campaign-clickers').append(new contactsView({campNum:this.options.campNum,url:url,article:this.model.get('articleNum.encode'),type:"CK",app:this.options.app}).el)
                      active_ws.find(".campaign-clickers .closebtn").on('click', function(){
                      that.closeContactsListing();
                 });
                
                  return;
                }
              
                  var offset = $(ev.target).offset();
                  var active_ws = this.$el.parents(".ws-content.active");
                  active_ws.find('.loading-contacts').hide();
                  active_ws.find(".campaign-clickers").removeAttr('style');
                  active_ws.find(".campaign-clickers").css({top:offset.top-95,right:'50%'}).show();
                  active_ws.find(".campaign-clickers").html(new contactsView({url:url,campNum:this.options.campNum,article:this.model.get('articleNum.encode'),type:"CK",app:this.options.app}).el)
              },
            calculateProgress:function(){
                var prog = (parseInt(this.model.get('clickCount'))/parseInt(this.options.clicks) * 100);
                if(isNaN(prog) || prog < 0) {
                   return 0+ "%"
               }else{
                   return prog+ "%";
               }
            },
            truncateURL:function(url){
                if(url.length > 100) 
                    return url = url.substring(0,100);
                else return url;
            },
                closeContactsListing:function(){
                $(".campaign-clickers").empty('');
                $(".campaign-clickers").hide();
            }
        });    
});