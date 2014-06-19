/* 
 * Name: AutoBots Grid/Listing
 * Date: 18 June 2014
 * Author: Pir Abdul Wakeel
 * Description: 
 */

define(['text!autobots/html/autobots.html','autobots/collections/autobots','autobots/autobot','app','autobots/choose_bot'],
function (template,Autobots,Autobot,app,Choosebot) {
        'use strict';
        return Backbone.View.extend({
            events: {
                "click .sortoption":"toggleSortOption",
                
            },
            initialize: function () {
               this.template = _.template(template);
               this.objAutobots = new Autobots();
               this.type = "search";
               this.current_ws = "";
               this.ws_header = "";
               this.app = app;
               this.render();
            },
            render: function () {
                this.$el.html(this.template());
                this.fetchBots();
            },
            fetchBots:function(){
                var _data = {};
                _data['type'] = this.type;
                var that = this;
                this.objAutobots.fetch({data:_data,success:function(data){
                        //console.log(data);
                        //console.log(this.objAutobots);
                        that.total = that.objAutobots.total;
                      _.each(data.models,function(model){
                         that.$el.find("#tblAutobots tbody").append(new Autobot({model:model,app:that.options.app}).el)
                        })
                        that.updateCount();
                        that.topCounts();
                }})
            },
            updateCount:function(){
                $(this.el).find('#total_autobots').find('.badge').html(this.objAutobots.total);
            },
            toggleSortOption:function(){
                $(this.el).find("#autobots_search_menu").slideToggle();
            },
            topCounts:function(){
                   var that = this;
                   this.current_ws = this.$el.parents(".ws-content");
                   this.ws_header = this.current_ws.find(".camp_header .edited"); 
                   this.ws_header.find("#campaign_tags").remove();
                   this.ws_header.find("#addnew_action").on('click',function(){
                       that.addNewAutobot();
                   })
                   var URL = "/pms/io/trigger/getAutobotData/?BMS_REQ_TK="+this.app.get('bms_token')+"&type=counts";
                   jQuery.getJSON(URL,  function(tsv, state, xhr){
                        var data = jQuery.parseJSON(xhr.responseText);
                        var header_part = $('<div><ul class="c-current-status">\n\
                        <li class="bmstrackcount"><a><span class="badge pclr2">'+data.playCount+'</span>Playing</a></li>\n\
                        <li class="usertrackcount"><a class="font-bold"><span class="badge pclr18">'+data.pauseCount+'</span>Paused</a></li>\n\
                        </ul></div>');
                        var $header_part = $(header_part);                        
                        that.ws_header.append($header_part);
                        addnew_action
                       // this.ws_header.find("#workspace-header").after($('<a class="cstatus pclr18" style="margin:6px 4px 0px -7px">Playing </a>'));
                   });
            },
            addNewAutobot:function(){
                $(this.el).find("#new_autobot").html(new Choosebot({app:this.app}).el);
            }
        });    
});