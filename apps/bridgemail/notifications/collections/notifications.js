/* 
 * Name: Notification Dialog
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: Used to fetch all notifications , anouncement
 * Dependency: Notificaiton Model
 */

define(['backbone', 'app','notifications/models/notification'], function (Backbone, app,ModelNotification) {
	'use strict';
	return Backbone.Collection.extend({
	   urlRoot: '/pms/io/user/notification/',
           initialize: function(models,options) {
                options || (options = {});
                if (options.total) {
                    this.total = options.count;
                };
},
            model:ModelNotification,
            url: function () {
                return '/pms/io/user/notification/?BMS_REQ_TK=' + app.get('bms_token');
            },
            parse: function(response,res) {
                var result = [];
                if(!app.checkError(response) && response.totalCount!=="0"){
                    _.each(response.notifications[0],function(val,key){
                        val[0]._id = val[0]['notifyId.encode'];
                        result.push(val[0]);
                    })                    
                }
                this.total = response.totalCount;
                return result;
            }
             
	});
});