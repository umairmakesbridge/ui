define([
	'backbone', 'app', 'tipandtest/models/message'
], function (Backbone, app, Message) {
        'use strict';
	return Backbone.Collection.extend({
		model: Message,
		url: function () {
                    return '/pms/io/trigger/getNurtureData/?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.msgCount && response.msgCount!=="0"){
                        _.each(response.messages[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(7));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
