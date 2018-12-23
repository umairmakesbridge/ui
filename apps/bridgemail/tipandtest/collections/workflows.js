define([
	'backbone', 'app', 'tipandtest/models/workflow'
], function (Backbone, app, Workflow) {
        'use strict';
	return Backbone.Collection.extend({
		model: Workflow,
		url: function () {
                    return '/pms/output/workflow/getWorkflowInfo.jsp?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = [];
                    
                    if(!app.checkError(response) && response.length){
                        _.each(response,function(val,key){                            
                            result.push({"_id":key+1,
                                        "workflowId":val[0],
                                        "encodedWorkflowId":val[1],
                                         "name":val[2],
                                         "workflow_description":val[3],
                                         "status":val[4],
                                         "isManualAddtion":val[5],
                                         "thumbnailURL":val[6],
                                         "tags":"workflow",
                                         "lastActivationDate":val[8],
                                         "stepSize":val[9],
                                         "isFlowCheckEnabled":val[10],
                                         "isCircuitBreaker":val[11],
                                         "isAdmin":val[12],
                                         "youTubeURL":val[13],
                                         "infoURL":val[14]
                                    });
                        })                    
                    }
                    return result;
                }
	});
});
