define([
	'backbone', 'app', 'reports/models/report'
], function (Backbone, app, LandingPage) {
        'use strict';
	return Backbone.Collection.extend({
		model: LandingPage,
		url: function () {
                    return '/pms/io/user/customReports/?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.totalCount && response.totalCount!=="0"){
                        _.each(response.reports[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(6));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});