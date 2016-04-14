/* 
 * Name: Contact Model
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: This Model is used for each link at campaign summary page. 
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

