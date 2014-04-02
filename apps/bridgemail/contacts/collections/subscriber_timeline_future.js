define([
	'backbone', 'app', 'contacts/models/subscriber_timeline'
], function (Backbone, app, Timeline) {
        'use strict';
	return Backbone.Collection.extend({
		model: Timeline,
		url: function () {
                    return '/pms/io/subscriber/getData/?BMS_REQ_TK=' + app.get('bms_token') + '&type=getActivityHistory&future=Y';
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && app.checkError(response)){
                        return false;
                    }
                    if(response.totalCount && response.totalCount!=="0"){
                        _.each(response.activityHistory[0],function(val,key){                                                                                   
                            val[0]._id = -1*(sent.data.offset + parseInt(key.substring(8)));                                                          
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
