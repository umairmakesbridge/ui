define([
	'backbone', 'app', 'newcontacts/models/subscriber'
], function (Backbone, app, Subscriber) {
        'use strict';
	return Backbone.Collection.extend({
		model: Subscriber,
		url: function () {
                    return '/pms/io/subscriber/getData/?BMS_REQ_TK=' + app.get('bms_token') + '&type=getSAMSubscriberList';
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.totalCount && response.totalCount!=="0"){
                        _.each(response.subscriberList[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(10));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
