define([
	'backbone', 'app', 'workflow/models/workflow'
], function (Backbone, app, Workflow) {
        'use strict';
	return Backbone.Collection.extend({
		model: Workflow,
		url: function () {
                    return '/pms/trigger/WorkflowList.jsp?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.totalCount && response.totalCount!=="0"){
                        _.each(response.workflows[0],function(val,key){
                            val[0]._id = sent.data.offset + parseInt(key.substring(8));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});