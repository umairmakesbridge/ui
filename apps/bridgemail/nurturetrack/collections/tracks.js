define([
	'backbone', 'app', 'nurturetrack/models/track'
], function (Backbone, app, Subscriber) {
        'use strict';
	return Backbone.Collection.extend({
		model: Subscriber,
		url: function () {
                    return '/pms/io/trigger/getNurtureData/?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.count && response.count!=="0"){
                        _.each(response.tracks[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(5));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
