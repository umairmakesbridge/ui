/* 
 * Name: Notification Dialog
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Used to fetch all notifications , anouncement
 * Dependency: Notificaiton Model
 */

define(['backbone', 'app','autobots/models/export_autobot'], function (Backbone, app,ModelAutoBot) {
	'use strict';
	return Backbone.Collection.extend({
           urlRoot: '/pms/io/trigger/saveZapierExportBotData/',
           initialize: function(models,options) {
              options || (options = {});
                if (options.total) {
                    this.total = options.totalCount;                   
                }
            },
            model:ModelAutoBot,
            url: function () {
                return '/pms/io/trigger/getZapierExportBotData/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = [];
                if(!app.checkError(response) && response.totalCount!=="0"){
                    _.each(response.autobots[0],function(val,key){
                        val[0]._id = val[0]['botId.encode'];
                        result.push(val[0]);
                    })                    
                }
                this.total = response.totalCount;
                return result;
            }
             
	});
});
