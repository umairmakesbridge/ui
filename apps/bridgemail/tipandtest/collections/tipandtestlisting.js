define([
	'backbone', 'app', 'onetooneemails/models/singlelistings'
], function (Backbone, app, Campaign) {
        'use strict';
	return Backbone.Collection.extend({
		model: Campaign,
		url: function () {
                    if(app.get('complied')==0){ 
                        return app.get('path')+'apps/bridgemail/tipandtest/tipandtest.json';
                    }else{
                        return app.get('path')+'/tipandtest/tipandtest.json';
                    } 
                    
		},
                parse: function(response,sent) {
                    var result = []
                    if(!app.checkError(response) && response.totalCount && response.totalCount!=="0"){
                        _.each(response.processes[0],function(val,key){
                            //val[0]._id = sent.data.offset + parseInt(key.substring(7));
                            val[0]._id = parseInt(key.substring(7));
                            result.push(val[0]);
                        })                    
                    }
                    return result;
                }
	});
});