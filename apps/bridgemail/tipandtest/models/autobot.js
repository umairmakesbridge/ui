/* 
 * Name: Notification Model
 * Date: 04 June 2014
 * Author: Pir Abdul Wakeel
 * Description: This Notification Model depend on notification. 
 */

define(['backbone', 'app'], function (Backbone, app) {
	'use strict';
	return Backbone.Model.extend({
		idAttribute: "_id",
                initialize:function(){
                    
                },
		url: function () {
                    return Backbone.Model.prototype.url.call(this) + '?BMS_REQ_TK=' + app.get('bms_token')
		}
	});
});

