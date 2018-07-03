define([
	'backbone', 'app', 'newcontacts/models/note'
], function (Backbone, app, Note) {
        'use strict';
	return Backbone.Collection.extend({
		model: Note,
		url: function () {
                    return '/pms/io/subscriber/comments/?BMS_REQ_TK=' + app.get('bms_token') + '&type=getComments';
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.totalCount && response.totalCount!=="0"){
                        _.each(response.comments[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(7));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});
