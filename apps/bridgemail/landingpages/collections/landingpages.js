define([
	'backbone', 'app', 'landingpages/models/landingpage'
], function (Backbone, app, LandingPage) {
        'use strict';
	return Backbone.Collection.extend({
		model: LandingPage,
		url: function () {
                    return '/pms/io/publish/getLandingPages/?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.totalCount && response.totalCount!=="0"){
                        _.each(response.pages[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(4));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});