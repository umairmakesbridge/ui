/* 
 * Name: Engage Meter
 * Date: 30 Deceber 2014
 * Author: Umair & Abdullah
 * Description: Engage meter view 
 * Dependency: Engage meter HTML
 */

define(['text!common/html/engagemeter.html'],
function (template) {
    
    'use strict';
        return Backbone.View.extend({
           // tagName:'div',
            
            events: {
              //'click .view-profile,.viewdetail':"openContact",
              //'click .vsalestatus':'selectSalesStatus',
              'click .closebtn':'closeProgressMeter'
             
            },
            initialize: function () {
                //_.bindAll(this, 'getRightText', 'pageClicked');
                 this.template = _.template(template);
                 this.parent = this.options.parent;
                 this.app = this.options.app;
                 //this.sub_id = this.options.subNum;
                 this.openDate = (this.options.params.isOpen) ? this.renderDates(this.options.params.openDate) : "0";
                 this.clicked = (this.options.params.clicked) ? this.options.params.clicked : "0";
                 this.render();
            },
            render: function () {
                 //this.renderDates();
                 this.$el.html(this.template());
                //this.$el.css({'position':'relative','background-color': '#fff','min-height':'170px','width':'100%'});
            },
            renderDates : function(date){
                 var decodeDate = moment(this.app.decodeHTML(date),'M/D/YYYY H:m a');														
                 var formatDate = decodeDate.format("DD MMM, YYYY");
                 return formatDate;
            },
             closeProgressMeter:function(){
                this.$el.parents('body').find('#engagment-meter-view').remove();
            },
               
        });
});