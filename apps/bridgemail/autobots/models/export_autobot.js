/* 
 * Name: Notification Model
 * Date: 10 October 2018
 * Author: Umair Shahid
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

