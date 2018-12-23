define([
	'backbone', 'app', 'tipandtest/models/step'
], function (Backbone, app, Step) {
        'use strict';
	return Backbone.Collection.extend({
		model: Step,
		url: function () {
                    return '/pms/output/workflow/getWorkflowInfo.jsp?BMS_REQ_TK=' + app.get('bms_token');
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.length){
                        _.each(response,function(val,key){                            
                            result.push({"_id":key+1,
                                        "stepId":val[0],
                                        "stepChecksum":val[1],
                                         "order":val[2],
                                         "name":val[3],
                                         "isWait":val[4],                                        
                                         "status":val[5],                                        
                                    });
                        })     
                    }
                    return result;
                }
	});
});
