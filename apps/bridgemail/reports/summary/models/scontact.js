/* 
 * Name: Contact Model
 * Date: 15 March 2014
 * Author: Pir Abdul Wakeel
 * Description: this model is used for single row at contacts collection.
 * courtesy: scontact name is given because there is other contacts files in the system.
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

