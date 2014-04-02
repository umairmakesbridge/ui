define([
	'backbone', 'app', 'crm/salesforce/models/myimport'
], function (Backbone, app, Import) {
        'use strict';
	return Backbone.Collection.extend({
		model: Import,
		url: function () {
                    return '/pms/io/salesforce/getData/?BMS_REQ_TK=' + app.get('bms_token') + '&type=imports';
		},
                parse: function(response,sent) {
                    var result = [];
                    if(!app.checkError(response) && response.count!=="0"){
                        _.each(response.synchList[0],function(val,key){
                            val[0]._id = parseInt(key.substring(5));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
