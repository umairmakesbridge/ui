define(['backbone', 'app'], function (Backbone, app) {
	'use strict';
	return Backbone.Model.extend({
		idAttribute: 'subNum',
		urlRoot: '/pms/io/subscriber/setData/',
		url: function () {
			return Backbone.Model.prototype.url.call(this) + '?BMS_REQ_TK=' + app.get('bms_token')+ '&type=getSubscriberList';
		}
	});
});
