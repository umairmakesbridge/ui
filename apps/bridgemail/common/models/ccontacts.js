/* 
 * Name: Common Contacts Model
 * Date: 02 April 2014
 * Author: Umair & Abdullah
 * Description: this model is used for single row at contacts collection.
 * courtesy: scontact name is given because there is other contacts files in the system.
 */


define(['backbone', 'app'], function (Backbone, app) {
	'use strict';
	return Backbone.Model.extend({
		idAttribute: "_id",
		//urlRoot: '/pms/io/getResponders/setData/',
		url: function () {
                    return Backbone.Model.prototype.url.call(this) + '?BMS_REQ_TK=' + app.get('bms_token');
		}
	});
});
