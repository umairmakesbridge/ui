define([
	'backbone', 'app', 'contacts/models/task'
], function (Backbone, app, Task) {
        'use strict';
	return Backbone.Collection.extend({
		model: Task,
		url: function () {
                    return '/pms/io/subscriber/subscriberTasks/?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.totalCount && response.totalCount!=="0"){
                        _.each(response.taskList,function(val,key){
                            val._id = sent.data.offset + parseInt(key)+1;
                            result.push(val);
                        })                    
                    }
                    return result;
                }
	});
});
