define([
	'backbone', 'app', 'account/models/subaccount'
], function (Backbone, app, SubAccount) {
        'use strict';
	return Backbone.Collection.extend({
		model: SubAccount,
		url: function () {
                    return '/pms/io/user/getData/?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.count && response.count!=="0"){
                        _.each(response.operators[0],function(val,key){
                            val[0]._id =  parseInt(key.substring(8));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});