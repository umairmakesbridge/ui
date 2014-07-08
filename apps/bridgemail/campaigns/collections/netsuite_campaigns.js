define([
	'backbone', 'app', 'campaigns/models/ns_campaign'
], function (Backbone, app, nscamp) {
        'use strict';
	return Backbone.Collection.extend({
		model: nscamp,
		url: function () {
                    return '/pms/io/netsuite/getData/?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.count && response.count!=="0"){
                        _.each(response.campList[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(4));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});