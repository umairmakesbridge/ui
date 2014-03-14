define([
	'backbone', 'app', 'crm/salesforce/models/ownerfield'
], function (Backbone, app, Fields) {
        'use strict';
	return Backbone.Collection.extend({
		model: Fields,
		url: function () {
                    return '/pms/io/salesforce/getData/?BMS_REQ_TK=' + app.get('bms_token') + '&type=ownerFields';
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.count!=="0"){
                        _.each(response.fldList[0],function(val,key){
                            val[0]._id = parseInt(key.substring(3));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
