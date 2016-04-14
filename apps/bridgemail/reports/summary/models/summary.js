/* 
 * Name: Summary Model
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: Summary Model is actually the whole page model, its contain the campaign detail like subject name, etc.
 * 
 */

define(['backbone', 'app'], function (Backbone, app) {
	'use strict';
	return Backbone.Model.extend({
		idAttribute: "_id",
		urlRoot: '/pms/io/campaign/getCampaignData/',
                initialize:function(){
                    
                },
		url: function () {
                    return Backbone.Model.prototype.url.call(this) + '?BMS_REQ_TK=' + app.get('bms_token')
		}
             
	});
});

