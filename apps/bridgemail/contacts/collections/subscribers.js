define([
	'backbone', 'app', 'contacts/models/subscriber'
], function (Backbone, app, Subscriber) {
        'use strict';
	return Backbone.Collection.extend({
		model: Subscriber,
		url: function () {
                    return '/pms/io/subscriber/getData/?BMS_REQ_TK=' + app.get('bms_token') + '&type=getSAMSubscriberList';
		},
                parse: function(response) {
                    var result = []
                    if(response.totalCount!=="0"){
                        _.each(response.subscriberList[0],function(val,key){
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
